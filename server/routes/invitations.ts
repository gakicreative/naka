import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import { getDb, invitations } from '../db.js';
import { requireAuth } from '../auth.js';
import type { Env } from '../types.js';

const router = new Hono<Env>();

// ── GET /api/invitations/check/:id (pública — sem auth) ───────────────────────
router.get('/check/:id', async (c) => {
  try {
    const db     = getDb(c.env.DB);
    const [invite] = await db.select().from(invitations).where(eq(invitations.id, c.req.param('id')));
    if (!invite) return c.json({ error: 'Convite não encontrado' }, 404);
    if (invite.used) return c.json({ error: 'Convite já utilizado' }, 410);
    return c.json({ id: invite.id, role: invite.role, valid: true });
  } catch {
    return c.json({ error: 'Erro interno' }, 500);
  }
});

// ── GET /api/invitations ─────────────────────────────────────────────────────
router.get('/', requireAuth, async (c) => {
  if (c.get('userRole') !== 'admin') return c.json({ error: 'Forbidden' }, 403);
  try {
    const db    = getDb(c.env.DB);
    const orgId = c.get('orgId');
    const rows  = await db.select().from(invitations)
      .where(eq(invitations.orgId, orgId))
      .orderBy(desc(invitations.createdAt));
    return c.json(rows);
  } catch {
    return c.json({ error: 'Erro interno' }, 500);
  }
});

// ── GET /api/invitations/:id ──────────────────────────────────────────────────
router.get('/:id', requireAuth, async (c) => {
  try {
    const db    = getDb(c.env.DB);
    const orgId = c.get('orgId');
    const [invite] = await db.select().from(invitations)
      .where(and(eq(invitations.id, c.req.param('id')), eq(invitations.orgId, orgId)));
    if (!invite) return c.json({ error: 'Convite não encontrado' }, 404);
    return c.json({ id: invite.id, role: invite.role, used: invite.used });
  } catch {
    return c.json({ error: 'Erro interno' }, 500);
  }
});

// ── POST /api/invitations ────────────────────────────────────────────────────
router.post('/', requireAuth, async (c) => {
  if (c.get('userRole') !== 'admin') return c.json({ error: 'Forbidden' }, 403);
  try {
    const db    = getDb(c.env.DB);
    const orgId = c.get('orgId');
    const { role } = await c.req.json<{ role: string }>();
    if (!['socio', 'lider', 'seeder', 'cliente'].includes(role)) return c.json({ error: 'Role inválido' }, 400);
    const id = crypto.randomUUID();
    await db.insert(invitations).values({ id, orgId, role, used: false, createdBy: c.get('userId') });
    const [invite] = await db.select().from(invitations).where(eq(invitations.id, id));
    return c.json(invite, 201);
  } catch {
    return c.json({ error: 'Erro interno' }, 500);
  }
});

// ── DELETE /api/invitations/:id ─────────────────────────────────────────────
router.delete('/:id', requireAuth, async (c) => {
  if (c.get('userRole') !== 'admin') return c.json({ error: 'Forbidden' }, 403);
  try {
    const db    = getDb(c.env.DB);
    const orgId = c.get('orgId');
    const [invite] = await db.select().from(invitations)
      .where(and(eq(invitations.id, c.req.param('id')), eq(invitations.orgId, orgId)));
    if (!invite) return c.json({ error: 'Convite não encontrado' }, 404);
    if (invite.used) return c.json({ error: 'Não é possível cancelar convite já utilizado' }, 400);
    await db.delete(invitations).where(eq(invitations.id, c.req.param('id')));
    return c.json({ ok: true });
  } catch {
    return c.json({ error: 'Erro interno' }, 500);
  }
});

export default router;
