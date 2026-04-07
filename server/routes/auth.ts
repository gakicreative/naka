import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import { eq, sql } from 'drizzle-orm';
import { getDb, users, invitations, organizations } from '../db.js';
import { requireAuth, setToken, clearToken } from '../auth.js';
import type { Env } from '../types.js';

const router = new Hono<Env>();

// Gera slug URL-friendly a partir do nome da organização
function makeSlug(name: string): string {
  const base   = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const suffix = Math.random().toString(36).slice(2, 8);
  return base ? `${base}-${suffix}` : suffix;
}

// Cria uma organização e retorna o id
async function createOrg(db: ReturnType<typeof getDb>, name: string, createdBy: string): Promise<string> {
  const id  = crypto.randomUUID();
  const slug = makeSlug(name);
  await db.insert(organizations).values({ id, name, slug, createdBy, createdAt: new Date().toISOString() });
  return id;
}

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json<{ email: string; password: string }>();
    if (!email || !password) return c.json({ error: 'Email e senha obrigatórios' }, 400);

    const db     = getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    if (!user) return c.json({ error: 'Email ou senha incorretos' }, 401);
    if (!user.passwordHash) return c.json({ error: 'Esta conta usa login com Google. Use o botão "Entrar com Google".' }, 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return c.json({ error: 'Email ou senha incorretos' }, 401);

    // Se o usuário não tem org ainda (conta anterior à multi-tenancy), cria uma agora
    let orgId = user.orgId ?? '';
    if (!orgId) {
      orgId = await createOrg(db, `${user.name}'s Studio`, user.id);
      await db.update(users).set({ orgId }).where(eq(users.id, user.id));
    }

    await setToken(c, user.id, user.role, orgId);
    return c.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, activeClientId: user.activeClientId, orgId } });
  } catch (err) {
    console.error('Login error:', err);
    return c.json({ error: 'Erro interno' }, 500);
  }
});

// ── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (c) => {
  try {
    const { name, email, password, inviteId } = await c.req.json<{
      name: string; email: string; password: string; inviteId?: string;
    }>();
    if (!name || !email || !password) return c.json({ error: 'Campos obrigatórios faltando' }, 400);
    if (password.length < 6) return c.json({ error: 'Senha deve ter pelo menos 6 caracteres' }, 400);

    const normalizedEmail = email.toLowerCase().trim();
    const db              = getDb();
    const ADMIN_EMAIL     = process.env.ADMIN_EMAIL || 'admin@naka.app';

    const [existing] = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (existing) return c.json({ error: 'Email já cadastrado' }, 409);

    const countResult = await db.select({ count: sql<number>`count(*)` }).from(users);
    const count       = Number(countResult[0]?.count ?? 0);

    const id           = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);
    let role: string   = 'cliente';
    let orgId: string;

    if (count === 0 || normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
      // Primeiro usuário ou email admin: cria uma nova organização
      role  = 'admin';
      orgId = await createOrg(db, `${name}'s Studio`, id);
    } else if (inviteId) {
      const [invite] = await db.select().from(invitations).where(eq(invitations.id, inviteId));
      if (!invite || invite.used) return c.json({ error: 'Convite inválido ou já utilizado' }, 400);
      if (!invite.orgId) return c.json({ error: 'Convite sem organização associada' }, 400);
      role  = invite.role;
      orgId = invite.orgId;
      await db.update(invitations)
        .set({ used: true, usedBy: normalizedEmail, usedAt: new Date().toISOString() })
        .where(eq(invitations.id, inviteId));
    } else {
      return c.json({ error: 'Convite necessário para cadastro' }, 400);
    }

    await db.insert(users).values({ id, email: normalizedEmail, name, passwordHash, role, orgId });

    await setToken(c, id, role, orgId);
    return c.json({ user: { id, email: normalizedEmail, name, role, activeClientId: null, orgId } }, 201);
  } catch (err) {
    console.error('Register error:', err);
    return c.json({ error: 'Erro interno' }, 500);
  }
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', (c) => {
  clearToken(c);
  return c.json({ ok: true });
});

// ── GET /api/auth/google — redireciona para o Google OAuth ────────────────────
router.get('/google', (c) => {
  const clientId    = process.env.GOOGLE_CLIENT_ID;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';
  const inviteId    = c.req.query('invite') || '';

  if (!clientId) return c.redirect('/login?error=oauth_not_configured');

  const state  = inviteId ? btoa(JSON.stringify({ inviteId })) : 'login';
  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  callbackUrl,
    response_type: 'code',
    scope:         'openid profile email',
    prompt:        'select_account',
    state,
  });

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

// ── GET /api/auth/google/callback ────────────────────────────────────────────
router.get('/google/callback', async (c) => {
  const code     = c.req.query('code');
  const stateRaw = c.req.query('state');
  const error    = c.req.query('error');

  if (error || !code) return c.redirect('/login?error=oauth_failed');

  try {
    const clientId     = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const callbackUrl  = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';

    // Troca o código por tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: callbackUrl, grant_type: 'authorization_code' }),
    });
    const tokens = await tokenRes.json() as { access_token?: string };
    if (!tokens.access_token) return c.redirect('/login?error=oauth_failed');

    // Busca perfil
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile  = await profileRes.json() as { id: string; email: string; name: string };
    const googleId = profile.id;
    const email    = (profile.email || '').toLowerCase().trim();
    const name     = profile.name || email.split('@')[0];

    // Extrai inviteId do state
    let inviteId: string | undefined;
    if (stateRaw && stateRaw !== 'login') {
      try { inviteId = JSON.parse(atob(stateRaw)).inviteId; } catch { /* ignora */ }
    }

    const db = getDb();

    // 1. Usuário existente por google_id
    const [byGoogleId] = await db.select().from(users).where(eq(users.googleId, googleId));
    if (byGoogleId) {
      let orgId = byGoogleId.orgId ?? '';
      if (!orgId) {
        orgId = await createOrg(db, `${byGoogleId.name}'s Studio`, byGoogleId.id);
        await db.update(users).set({ orgId }).where(eq(users.id, byGoogleId.id));
      }
      await setToken(c, byGoogleId.id, byGoogleId.role, orgId);
      return c.redirect(byGoogleId.role === 'cliente' ? '/portal' : '/app');
    }

    // 2. Usuário existente pelo email → vincula google_id
    const [byEmail] = await db.select().from(users).where(eq(users.email, email));
    if (byEmail) {
      let orgId = byEmail.orgId ?? '';
      if (!orgId) {
        orgId = await createOrg(db, `${byEmail.name}'s Studio`, byEmail.id);
        await db.update(users).set({ googleId, orgId }).where(eq(users.id, byEmail.id));
      } else {
        await db.update(users).set({ googleId }).where(eq(users.id, byEmail.id));
      }
      await setToken(c, byEmail.id, byEmail.role, orgId);
      return c.redirect(byEmail.role === 'cliente' ? '/portal' : '/app');
    }

    // 3. Novo usuário — verifica se é o admin ou se tem convite
    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@naka.app').toLowerCase();
    const isAdminEmail = email === ADMIN_EMAIL;

    const countResult = await db.select({ count: sql<number>`count(*)` }).from(users);
    const isFirstUser = Number(countResult[0]?.count ?? 0) === 0;

    const id   = crypto.randomUUID();
    let role   = 'cliente';
    let orgId: string;

    if (isFirstUser || isAdminEmail) {
      role  = 'admin';
      orgId = await createOrg(db, `${name}'s Studio`, id);
      await db.insert(users).values({ id, email, name, googleId, passwordHash: null, role, orgId });
    } else {
      if (!inviteId) return c.redirect('/login?error=invite_required');
      const [invite] = await db.select().from(invitations).where(eq(invitations.id, inviteId));
      if (!invite || invite.used) return c.redirect('/login?error=invite_invalid');
      if (!invite.orgId) return c.redirect('/login?error=invite_invalid');
      role  = invite.role;
      orgId = invite.orgId;
      await db.insert(users).values({ id, email, name, googleId, passwordHash: null, role, orgId });
      await db.update(invitations)
        .set({ used: true, usedBy: email, usedAt: new Date().toISOString() })
        .where(eq(invitations.id, inviteId));
    }

    await setToken(c, id, role, orgId);
    return c.redirect(role === 'cliente' ? '/portal' : '/app');

  } catch (err) {
    console.error('[Google Callback] Erro:', err);
    return c.redirect('/login?error=oauth_failed');
  }
});

const VALID_TASK_VIEWS = ['kanban', 'list', 'calendar', 'timeline', 'board-by-client'] as const;

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (c) => {
  try {
    const db     = getDb();
    const [user] = await db.select().from(users).where(eq(users.id, c.get('userId')));
    if (!user) return c.json({ error: 'Usuário não encontrado' }, 401);

    let orgLogoUrl: string | null = null;
    let orgName = '';
    if (user.orgId) {
      const [org] = await db.select().from(organizations).where(eq(organizations.id, user.orgId));
      if (org) { orgLogoUrl = org.logoUrl ?? null; orgName = org.name; }
    }

    return c.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, activeClientId: user.activeClientId, orgId: user.orgId ?? '', taskView: user.taskView ?? null, orgLogoUrl, orgName } });
  } catch (err) {
    console.error('Me error:', err);
    return c.json({ error: 'Erro interno' }, 500);
  }
});

// ── PATCH /api/auth/me ───────────────────────────────────────────────────────
router.patch('/me', requireAuth, async (c) => {
  try {
    const db = getDb();
    const body = await c.req.json<{ name?: string; activeClientId?: string; taskView?: string }>();
    const updates: Record<string, unknown> = {};
    if (body.name) updates.name = body.name;
    if (body.activeClientId !== undefined) updates.activeClientId = body.activeClientId || null;
    if (body.taskView !== undefined) {
      if (!VALID_TASK_VIEWS.includes(body.taskView as typeof VALID_TASK_VIEWS[number])) {
        return c.json({ error: 'taskView inválido' }, 400);
      }
      updates.taskView = body.taskView;
    }

    await db.update(users).set(updates as never).where(eq(users.id, c.get('userId')));
    return c.json({ ok: true });
  } catch (err) {
    console.error('Update me error:', err);
    return c.json({ error: 'Erro interno' }, 500);
  }
});

export default router;
