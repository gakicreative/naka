import { Router } from 'express';
import { ne, eq } from 'drizzle-orm';
import { db, users } from '../db.js';
import { requireAuth, type AuthRequest } from '../auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/team — lista todos os usuários que não são clientes
router.get('/', async (req: AuthRequest, res) => {
  if (!['admin', 'socio', 'lider'].includes(req.userRole!)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const members = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        leaderId: users.leaderId,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(ne(users.role, 'cliente'));
    res.json(members);
  } catch (err) {
    console.error('GET /api/team error:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// PATCH /api/team/:id — atribui líder a um seeder (admin/socio/lider)
router.patch('/:id', async (req: AuthRequest, res) => {
  if (!['admin', 'socio', 'lider'].includes(req.userRole!)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const { leaderId } = req.body as { leaderId: string | null };
    await db.update(users)
      .set({ leaderId: leaderId ?? null })
      .where(eq(users.id, req.params.id));
    res.json({ ok: true });
  } catch (err) {
    console.error('PATCH /api/team/:id error:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

export default router;
