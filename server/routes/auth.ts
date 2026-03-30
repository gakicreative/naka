import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { getDb, users, invitations } from '../db.js';
import { requireAuth, setToken, clearToken } from '../auth.js';
import type { Env } from '../types.js';

const router = new Hono<Env>();

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json<{ email: string; password: string }>();
    if (!email || !password) return c.json({ error: 'Email e senha obrigatórios' }, 400);

    const db     = getDb(c.env.DB);
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    if (!user) return c.json({ error: 'Email ou senha incorretos' }, 401);
    if (!user.passwordHash) return c.json({ error: 'Esta conta usa login com Google. Use o botão "Entrar com Google".' }, 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return c.json({ error: 'Email ou senha incorretos' }, 401);

    await setToken(c, user.id, user.role);
    return c.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, activeClientId: user.activeClientId } });
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
    const db              = getDb(c.env.DB);
    const ADMIN_EMAIL     = c.env.ADMIN_EMAIL || 'admin@naka.app';

    const [existing] = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (existing) return c.json({ error: 'Email já cadastrado' }, 409);

    // Conta quantos usuários existem para definir se é o primeiro admin
    const countResult = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>();
    const count       = countResult?.count ?? 0;

    let role: string = 'cliente';
    if (count === 0) {
      role = 'admin';
    } else if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
      role = 'admin';
    } else if (inviteId) {
      const [invite] = await db.select().from(invitations).where(eq(invitations.id, inviteId));
      if (!invite || invite.used) return c.json({ error: 'Convite inválido ou já utilizado' }, 400);
      role = invite.role;
      await db.update(invitations)
        .set({ used: true, usedBy: normalizedEmail, usedAt: new Date().toISOString() })
        .where(eq(invitations.id, inviteId));
    }

    const id           = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);
    await db.insert(users).values({ id, email: normalizedEmail, name, passwordHash, role });

    await setToken(c, id, role);
    return c.json({ user: { id, email: normalizedEmail, name, role, activeClientId: null } }, 201);
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
  const clientId    = c.env.GOOGLE_CLIENT_ID;
  const callbackUrl = c.env.GOOGLE_CALLBACK_URL || 'http://localhost:8787/api/auth/google/callback';
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
    const clientId     = c.env.GOOGLE_CLIENT_ID;
    const clientSecret = c.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl  = c.env.GOOGLE_CALLBACK_URL || 'http://localhost:8787/api/auth/google/callback';

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

    const db = getDb(c.env.DB);

    // 1. Usuário existente por google_id
    const [byGoogleId] = await db.select().from(users).where(eq(users.googleId, googleId));
    if (byGoogleId) {
      await setToken(c, byGoogleId.id, byGoogleId.role);
      return c.redirect(byGoogleId.role === 'cliente' ? '/portal' : '/');
    }

    // 2. Usuário existente pelo email → vincula google_id
    const [byEmail] = await db.select().from(users).where(eq(users.email, email));
    if (byEmail) {
      await db.update(users).set({ googleId }).where(eq(users.id, byEmail.id));
      await setToken(c, byEmail.id, byEmail.role);
      return c.redirect(byEmail.role === 'cliente' ? '/portal' : '/');
    }

    // 3. Novo usuário — verifica se é o admin ou se tem convite
    const ADMIN_EMAIL = (c.env.ADMIN_EMAIL || 'admin@naka.app').toLowerCase();
    const isAdminEmail = email === ADMIN_EMAIL;

    // Conta usuários: primeiro cadastro vira admin automaticamente
    const countResult = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>();
    const isFirstUser = (countResult?.count ?? 0) === 0;

    let id   = crypto.randomUUID();
    let role = 'cliente';

    if (isFirstUser || isAdminEmail) {
      // Admin não precisa de convite
      role = 'admin';
      await db.insert(users).values({ id, email, name, googleId, passwordHash: null, role });
    } else {
      // Usuário comum → precisa de convite
      if (!inviteId) return c.redirect('/login?error=invite_required');
      const [invite] = await db.select().from(invitations).where(eq(invitations.id, inviteId));
      if (!invite || invite.used) return c.redirect('/login?error=invite_invalid');
      role = invite.role;
      await db.insert(users).values({ id, email, name, googleId, passwordHash: null, role });
      await db.update(invitations)
        .set({ used: true, usedBy: email, usedAt: new Date().toISOString() })
        .where(eq(invitations.id, inviteId));
    }

    await setToken(c, id, role);
    return c.redirect(role === 'cliente' ? '/portal' : '/');

  } catch (err) {
    console.error('[Google Callback] Erro:', err);
    return c.redirect('/login?error=oauth_failed');
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (c) => {
  try {
    const db     = getDb(c.env.DB);
    const [user] = await db.select().from(users).where(eq(users.id, c.get('userId')));
    if (!user) return c.json({ error: 'Usuário não encontrado' }, 401);
    return c.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, activeClientId: user.activeClientId } });
  } catch (err) {
    console.error('Me error:', err);
    return c.json({ error: 'Erro interno' }, 500);
  }
});

// ── PATCH /api/auth/me ───────────────────────────────────────────────────────
router.patch('/me', requireAuth, async (c) => {
  try {
    const db                    = getDb(c.env.DB);
    const { name, activeClientId } = await c.req.json<{ name?: string; activeClientId?: string }>();
    const updates: Record<string, unknown> = {};
    if (name) updates.name = name;
    if (activeClientId !== undefined) updates.activeClientId = activeClientId || null;

    await db.update(users).set(updates as never).where(eq(users.id, c.get('userId')));
    const [user] = await db.select().from(users).where(eq(users.id, c.get('userId')));
    return c.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, activeClientId: user.activeClientId } });
  } catch (err) {
    console.error('Update me error:', err);
    return c.json({ error: 'Erro interno' }, 500);
  }
});

export default router;
