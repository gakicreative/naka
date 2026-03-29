import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, users, invitations, pool } from '../db.js';
import { requireAuth, setToken, clearToken, type AuthRequest } from '../auth.js';
import passport from 'passport';

declare module 'express-session' {
  interface SessionData {
    oauthInviteId?: string;
  }
}

const router = Router();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@naka.app';

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ error: 'Email e senha obrigatórios' });

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    if (!user) return res.status(401).json({ error: 'Email ou senha incorretos' });

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

    // Check if user already exists
    const [existing] = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (existing) return res.status(409).json({ error: 'Email já cadastrado' });

    // Check if this is the first user (auto-admin) or has invite
    const { rows: [{ count }] } = await pool.query('SELECT COUNT(*) FROM users');
    let role: string = 'cliente';

    if (parseInt(count) === 0) {
      // First user is always admin
      role = 'admin';
    } else if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
      role = 'admin';
    } else if (inviteId) {
      const [invite] = await db.select().from(invitations).where(eq(invitations.id, inviteId));
      if (!invite || invite.used) return res.status(400).json({ error: 'Convite inválido ou já utilizado' });
      role = invite.role;
      // Mark invite as used
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

// ── POST /api/auth/logout ──────────────────────────────────────────────────
router.post('/logout', (_req, res) => {
  clearToken(res);
  res.json({ ok: true });
});

// ── GET /api/auth/google?invite=<id> ───────────────────────────────────
router.get('/google', (req, res, next) => {
  // Salva inviteId na session para usar depois no callback
  if (req.query.invite) {
    req.session.oauthInviteId = req.query.invite as string;
  } else {
    delete req.session.oauthInviteId;
  }
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })(req, res, next);
});

// ── GET /api/auth/google/callback ───────────────────────────────────
// Usa custom callback para tratar erros corretamente (error handler inline
// exige 4 parâmetros que TypeScript não aceita facilmente via Router).
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err: Error | null, user: { id: string; role: string; name: string; email: string; activeClientId?: string } | false) => {
    if (err) {
      console.error('Google OAuth error:', err);
      const msg = (err as { message?: string })?.message || '';
      if (msg === 'invite_required' || msg === 'invite_invalid') {
        return res.redirect(`/login?error=${msg}`);
      }
      return res.redirect('/login?error=oauth_failed');
    }

    if (!user) {
      return res.redirect('/login?error=oauth_failed');
    }

    // Limpa o inviteId da session
    delete req.session.oauthInviteId;

    setToken(res, user.id, user.role);

    const redirect = user.role === 'cliente' ? '/portal' : '/';
    res.redirect(redirect);
  })(req, res, next);
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
