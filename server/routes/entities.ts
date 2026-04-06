import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { getDb, clients, projects, tasks, transactions, brandhubs, pins, labels, notifications, feedbacks } from '../db.js';
import { requireAuth } from '../auth.js';
import type { Env } from '../types.js';

const router = new Hono<Env>();
router.use('/*', requireAuth);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TABLES: Record<string, any> = {
  clients, projects, tasks, transactions, brandhubs, pins, labels, notifications, feedbacks,
};

// ── GET /api/:collection ─────────────────────────────────────────────────────
router.get('/:collection', async (c) => {
  const table = TABLES[c.req.param('collection')];
  if (!table) return c.json({ error: 'Collection not found' }, 404);
  const orgId = c.get('orgId');
  try {
    const db   = getDb(c.env.DB);
    const rows = await db.select().from(table).where(eq(table.orgId, orgId));
    return c.json(rows.map((r: { payload: unknown }) => r.payload));
  } catch (err) {
    console.error(`GET /${c.req.param('collection')} error:`, err);
    return c.json({ error: 'Erro interno' }, 500);
  }
});

// ── POST /api/:collection ────────────────────────────────────────────────────
router.post('/:collection', async (c) => {
  const table = TABLES[c.req.param('collection')];
  if (!table) return c.json({ error: 'Collection not found' }, 404);
  const orgId = c.get('orgId');
  try {
    const db      = getDb(c.env.DB);
    const payload = await c.req.json<Record<string, unknown>>();
    const id      = (payload.id as string) || crypto.randomUUID();
    const data    = { ...payload, id };
    await db.insert(table).values({ id, orgId, payload: data });
    return c.json(data, 201);
  } catch (err) {
    console.error(`POST /${c.req.param('collection')} error:`, err);
    return c.json({ error: 'Erro interno' }, 500);
  }
});

// ── PATCH /api/:collection/:id ───────────────────────────────────────────────
router.patch('/:collection/:id', async (c) => {
  const table = TABLES[c.req.param('collection')];
  if (!table) return c.json({ error: 'Collection not found' }, 404);
  const orgId = c.get('orgId');
  try {
    const db   = getDb(c.env.DB);
    const [existing] = await db.select().from(table).where(and(eq(table.id, c.req.param('id')), eq(table.orgId, orgId)));
    if (!existing) return c.json({ error: 'Not found' }, 404);
    const body   = await c.req.json<Record<string, unknown>>();
    const merged = { ...(existing.payload as object), ...body, id: c.req.param('id') };
    await db.update(table).set({ payload: merged }).where(and(eq(table.id, c.req.param('id')), eq(table.orgId, orgId)));
    return c.json(merged);
  } catch (err) {
    console.error(`PATCH /${c.req.param('collection')}/${c.req.param('id')} error:`, err);
    return c.json({ error: 'Erro interno' }, 500);
  }
});

// ── DELETE /api/:collection/:id ──────────────────────────────────────────────
router.delete('/:collection/:id', async (c) => {
  const table = TABLES[c.req.param('collection')];
  if (!table) return c.json({ error: 'Collection not found' }, 404);
  const orgId = c.get('orgId');
  try {
    const db = getDb(c.env.DB);
    await db.delete(table).where(and(eq(table.id, c.req.param('id')), eq(table.orgId, orgId)));
    return c.json({ ok: true });
  } catch (err) {
    console.error(`DELETE /${c.req.param('collection')}/${c.req.param('id')} error:`, err);
    return c.json({ error: 'Erro interno' }, 500);
  }
});

export default router;
