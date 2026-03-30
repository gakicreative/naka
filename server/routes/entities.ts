import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db, clients, projects, tasks, transactions, brandhubs, pins, labels, notifications, feedbacks } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

// Map collection name → drizzle table
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TABLES: Record<string, any> = {
  clients, projects, tasks, transactions, brandhubs, pins, labels, notifications, feedbacks,
};

// ── GET /api/:collection ─────────────────────────────────────────────────────
router.get('/:collection', async (req, res) => {
  const table = TABLES[req.params.collection];
  if (!table) return res.status(404).json({ error: 'Collection not found' });
  try {
    const rows = await db.select().from(table);
    res.json(rows.map(r => r.payload));
  } catch (err) {
    console.error(`GET /${req.params.collection} error:`, err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ── POST /api/:collection ────────────────────────────────────────────────────
router.post('/:collection', async (req, res) => {
  const table = TABLES[req.params.collection];
  if (!table) return res.status(404).json({ error: 'Collection not found' });
  try {
    const payload = req.body as Record<string, unknown>;
    const id = (payload.id as string) || crypto.randomUUID();
    const data = { ...payload, id };
    await db.insert(table).values({ id, payload: data });
    res.status(201).json(data);
  } catch (err) {
    console.error(`POST /${req.params.collection} error:`, err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ── PATCH /api/:collection/:id ───────────────────────────────────────────────
router.patch('/:collection/:id', async (req, res) => {
  const table = TABLES[req.params.collection];
  if (!table) return res.status(404).json({ error: 'Collection not found' });
  try {
    const [existing] = await db.select().from(table).where(eq(table.id, req.params.id));
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const merged = { ...(existing.payload as object), ...req.body, id: req.params.id };
    await db.update(table).set({ payload: merged }).where(eq(table.id, req.params.id));
    res.json(merged);
  } catch (err) {
    console.error(`PATCH /${req.params.collection}/${req.params.id} error:`, err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ── DELETE /api/:collection/:id ──────────────────────────────────────────────
router.delete('/:collection/:id', async (req, res) => {
  const table = TABLES[req.params.collection];
  if (!table) return res.status(404).json({ error: 'Collection not found' });
  try {
    await db.delete(table).where(eq(table.id, req.params.id));
    res.json({ ok: true });
  } catch (err) {
    console.error(`DELETE /${req.params.collection}/${req.params.id} error:`, err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

export default router;
