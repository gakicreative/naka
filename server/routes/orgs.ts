import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { getDb, organizations } from '../db.js';
import { requireAuth } from '../auth.js';
import type { Env } from '../types.js';

const router = new Hono<Env>();

// ── PATCH /api/orgs/me — atualiza logo_url da organização ────────────────────
router.patch('/me', requireAuth, async (c) => {
  try {
    const role = c.get('userRole');
    if (role !== 'admin' && role !== 'socio') return c.json({ error: 'Forbidden' }, 403);

    const { logoUrl } = await c.req.json<{ logoUrl: string }>();
    if (!logoUrl || !logoUrl.startsWith('/uploads/')) {
      return c.json({ error: 'logoUrl inválida' }, 400);
    }

    const orgId = c.get('orgId');
    await getDb(c.env.DB).update(organizations).set({ logoUrl }).where(eq(organizations.id, orgId));
    return c.json({ ok: true });
  } catch (err) {
    console.error('Orgs patch error:', err);
    return c.json({ error: 'Erro interno' }, 500);
  }
});

// ── DELETE /api/orgs/me/logo — remove logo_url da organização ────────────────
router.delete('/me/logo', requireAuth, async (c) => {
  try {
    const role = c.get('userRole');
    if (role !== 'admin' && role !== 'socio') return c.json({ error: 'Forbidden' }, 403);

    const orgId = c.get('orgId');
    await getDb(c.env.DB).update(organizations).set({ logoUrl: null }).where(eq(organizations.id, orgId));
    return c.json({ ok: true });
  } catch (err) {
    console.error('Orgs delete logo error:', err);
    return c.json({ error: 'Erro interno' }, 500);
  }
});

export default router;
