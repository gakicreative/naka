import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, users, invitations, pool } from '../db.js';
import { requireAuth, setToken, clearToken, type AuthRequest } from '../auth.js';

const router = Router();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@naka.app';

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ error: 'Email e senha obrigatórios' });

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    if (!user) return res.status(401).json({ error: 'Email ou senha incorretos' });
    if (!user.passwordHash) return res.status(401).json({ error: 'Esta conta usa login com Google. Use o botão "Entrar com Google".' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Email ou senha incorretos' });

    setToken(res, user.id, user.role);
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, activeClientId: user.activeClientId } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, inviteId } = req.body as {
      name: string; email: string; password: string; inviteId?: string;
    };
    if (!name || !email || !password) return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    if (password.length < 6) return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });

    const normalizedEmail = email.toLowerCase().trim();

    const [existing] = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (existing) return res.status(409).json({ error: 'Email já cadastrado' });

    const { rows: [{ count }] } = await pool.query('SELECT COUNT(*) FROM users');
    let role: string = 'cliente';

    if (parseInt(count) === 0) {
      role = 'admin';
    } else if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
      role = 'admin';
    } else if (inviteId) {
      const [invite] = await db.select().from(invitations).where(eq(invitations.id, inviteId));
      if (!invite || invite.used) return res.status(400).json({ error: 'Convite inválido ou já utilizado' });
      role = invite.role;
      await db.update(invitations)
        .set({ used: true, usedBy: normalizedEmail, usedAt: new Date().toISOString() })
        .where(eq(invitations.id, inviteId));
    }

    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);

    await db.insert(users).values({ id, email: normalizedEmail, name, passwordHash, role });

    setToken(res, id, role);
    res.status(201).json({ user: { id, email: normalizedEmail, name, role, activeClientId: null } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', (_req, res) => {
  clearToken(res);
  res.json({ ok: true });
});

// ── GET /api/auth/google ──────────────────────────────────────────────────────
// Redireciona para o Google OAuth manualmente (sem Passport)
router.get('/google', (req, res) => {
  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const callbackUrl  = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';
  const inviteId     = (req.query.invite as string) || '';

  console.log('[Google OAuth] Iniciando redirect');
  console.log('[Google OAuth] CLIENT_ID:', clientId ? `${clientId.slice(0, 20)}...` : 'NÃO DEFINIDO');
  console.log('[Google OAuth] CALLBACK_URL:', callbackUrl);
  console.log('[Google OAuth] inviteId:', inviteId || 'nenhum');

  if (!clientId) {
    console.error('[Google OAuth] GOOGLE_CLIENT_ID não está definido!');
    return res.redirect('/login?error=oauth_not_configured');
  }

  // Usa o state para transportar inviteId (padrão OAuth2 correto)
  const state = inviteId ? Buffer.from(JSON.stringify({ inviteId })).toString('base64url') : 'login';

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  callbackUrl,
    response_type: 'code',
    scope:         'openid profile email',
    prompt:        'select_account',
    state,
  });

  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  console.log('[Google OAuth] Redirecionando para Google');
  res.redirect(googleUrl);
});

// ── GET /api/auth/google/callback ────────────────────────────────────────────
// Recebe o código do Google e troca por tokens manualmente
router.get('/google/callback', async (req, res) => {
  try {
    const code      = req.query.code as string;
    const stateRaw  = req.query.state as string;
    const error     = req.query.error as string;

    console.log('[Google Callback] code:', code ? 'recebido' : 'AUSENTE');
    console.log('[Google Callback] state:', stateRaw);
    console.log('[Google Callback] error do Google:', error || 'nenhum');

    if (error) {
      console.error('[Google Callback] Google retornou erro:', error);
      return res.redirect('/login?error=oauth_failed');
    }

    if (!code) {
      return res.redirect('/login?error=oauth_failed');
    }

    const clientId     = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const callbackUrl  = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';

    // Troca o código por tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  callbackUrl,
        grant_type:    'authorization_code',
      }),
    });

    const tokens = await tokenRes.json() as { access_token?: string; error?: string };
    console.log('[Google Callback] Token troca status:', tokenRes.status);

    if (!tokens.access_token) {
      console.error('[Google Callback] Token inválido:', tokens);
      return res.redirect('/login?error=oauth_failed');
    }

    // Busca perfil do usuário
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json() as { id: string; email: string; name: string };
    console.log('[Google Callback] Profile email:', profile.email);

    const googleId = profile.id;
    const email    = (profile.email || '').toLowerCase().trim();
    const name     = profile.name || email.split('@')[0];

    // Extrai inviteId do state
    let inviteId: string | undefined;
    if (stateRaw && stateRaw !== 'login') {
      try {
        const decoded = JSON.parse(Buffer.from(stateRaw, 'base64url').toString());
        inviteId = decoded.inviteId;
      } catch { /* state inválido, ignora */ }
    }

    // 1. Usuário existente por google_id
    const [byGoogleId] = await db.select().from(users).where(eq(users.googleId, googleId));
    if (byGoogleId) {
      console.log('[Google Callback] Login por google_id:', email);
      setToken(res, byGoogleId.id, byGoogleId.role);
      return res.redirect(byGoogleId.role === 'cliente' ? '/portal' : '/');
    }

    // 2. Usuário existente pelo email (vincula google_id)
    const [byEmail] = await db.select().from(users).where(eq(users.email, email));
    if (byEmail) {
      console.log('[Google Callback] Vinculando google_id ao usuário existente:', email);
      await db.update(users).set({ googleId }).where(eq(users.id, byEmail.id));
      setToken(res, byEmail.id, byEmail.role);
      return res.redirect(byEmail.role === 'cliente' ? '/portal' : '/');
    }

    // 3. Novo usuário — precisa de convite
    console.log('[Google Callback] Novo usuário. inviteId:', inviteId || 'NENHUM');
    if (!inviteId) {
      return res.redirect('/login?error=invite_required');
    }

    const [invite] = await db.select().from(invitations).where(eq(invitations.id, inviteId));
    if (!invite || invite.used) {
      return res.redirect('/login?error=invite_invalid');
    }

    const id   = crypto.randomUUID();
    const role = invite.role;
    await db.insert(users).values({ id, email, name, googleId, passwordHash: null, role });
    await db.update(invitations)
      .set({ used: true, usedBy: email, usedAt: new Date().toISOString() })
      .where(eq(invitations.id, inviteId));

    console.log('[Google Callback] Novo usuário criado:', email, 'role:', role);
    setToken(res, id, role);
    return res.redirect(role === 'cliente' ? '/portal' : '/');

  } catch (err) {
    console.error('[Google Callback] Erro inesperado:', err);
    return res.redirect('/login?error=oauth_failed');
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!));
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, activeClientId: user.activeClientId } });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ── PATCH /api/auth/me ───────────────────────────────────────────────────────
router.patch('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, activeClientId } = req.body as { name?: string; activeClientId?: string };
    const updates: Record<string, unknown> = {};
    if (name) updates.name = name;
    if (activeClientId !== undefined) updates.activeClientId = activeClientId || null;

    await db.update(users).set(updates as never).where(eq(users.id, req.userId!));
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!));
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, activeClientId: user.activeClientId } });
  } catch (err) {
    console.error('Update me error:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

export default router;
