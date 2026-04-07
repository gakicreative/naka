import { Hono } from 'hono';
import { ne, eq, and } from 'drizzle-orm';
import { getDb, users } from '../db.js';
import { requireAuth } from '../auth.js';
import type { Env } from '../types.js';

const router = new Hono<Env>();
router.use('/*', requireAuth);

// GET /api/team — lista membros da mesma organização (exceto clientes)
router.get('/', async (c) => {
  const role = c.get('userRole');
  if (!['admin', 'socio', 'lider'].includes(role)) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  try {
    const db    = getDb();
    const orgId = c.get('orgId');
    const members = await db
      .select({
        id:        users.id,
        name:      users.name,
        email:     users.email,
        role:      users.role,
        leaderId:  users.leaderId,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(eq(users.orgId, orgId), ne(users.role, 'cliente')));
    return c.json(members);
  } catch (err) {
    console.error('GET /api/team error:', err);
    return c.json({ error: 'Erro interno' }, 500);
  }
});

// PATCH /api/team/:id — atribui líder a um seeder
router.patch('/:id', async (c) => {
  const role = c.get('userRole');
  if (!['admin', 'socio', 'lider'].includes(role)) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  try {
    const db    = getDb();
    const orgId = c.get('orgId');
    const { leaderId } = await c.req.json<{ leaderId: string | null }>();
    // Garante que só altera membros da mesma organização
    await db.update(users)
      .set({ leaderId: leaderId ?? null })
      .where(and(eq(users.id, c.req.param('id')), eq(users.orgId, orgId)));
    return c.json({ ok: true });
  } catch (err) {
    console.error('PATCH /api/team/:id error:', err);
    return c.json({ error: 'Erro interno' }, 500);
  }
});

export default router;
