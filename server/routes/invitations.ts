import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db, invitations } from '../db.js';
import { requireAuth, type AuthRequest } from '../auth.js';

const router = Router();

// ── GET /api/invitations/check/:id (pública — sem auth) ───────────────────────
router.get('/check/:id', async (req, res) => {
  try {
    const [invite] = await db.select().from(invitations).where(eq(invitations.id, req.params.id));
    if (!invite) return res.status(404).json({ error: 'Convite não encontrado' });
    if (invite.used) return res.status(410).json({ error: 'Convite já utilizado' });
    res.json({ id: invite.id, role: invite.role, valid: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.use(requireAuth);

// ── GET /api/invitations ─────────────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const rows = await db.select().from(invitations).orderBy(desc(invitations.createdAt));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ── GET /api/invitations/:id (public — for checking invite validity) ──────────
router.get('/:id', async (req, res) => {
  try {
    const [invite] = await db.select().from(invitations).where(eq(invitations.id, req.params.id));
    if (!invite) return res.status(404).json({ error: 'Convite não encontrado' });
    res.json({ id: invite.id, role: invite.role, used: invite.used });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ── POST /api/invitations ────────────────────────────────────────────────────
router.post('/', async (req: AuthRequest, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const { role } = req.body as { role: string };
    if (!['socio', 'seeder', 'cliente'].includes(role)) return res.status(400).json({ error: 'Role inválido' });
    const id = crypto.randomUUID();
    await db.insert(invitations).values({ id, role, used: false, createdBy: req.userId! });
    const [invite] = await db.select().from(invitations).where(eq(invitations.id, id));
    res.status(201).json(invite);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ── DELETE /api/invitations/:id ─────────────────────────────────────────────
router.delete('/:id', async (req: AuthRequest, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const [invite] = await db.select().from(invitations).where(eq(invitations.id, req.params.id));
    if (!invite) return res.status(404).json({ error: 'Convite não encontrado' });
    if (invite.used) return res.status(400).json({ error: 'Não é possível cancelar convite já utilizado' });
    await db.delete(invitations).where(eq(invitations.id, req.params.id));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

export default router;
