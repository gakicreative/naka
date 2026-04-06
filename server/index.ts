import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types.js';
import authRouter        from './routes/auth.js';
import entitiesRouter    from './routes/entities.js';
import invitationsRouter from './routes/invitations.js';
import uploadsRouter     from './routes/uploads.js';
import teamRouter        from './routes/team.js';
import orgsRouter        from './routes/orgs.js';

const app = new Hono<Env>();

// ── CORS — necessário pois frontend (Pages) e Worker ficam em origens distintas
app.use('*', cors({
  origin:      (origin) => origin || '*',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ── API Routes ────────────────────────────────────────────────────────────────
app.route('/api/auth',        authRouter);
app.route('/api/invitations', invitationsRouter);
app.route('/api/upload',      uploadsRouter);
app.route('/api/team',        teamRouter);
app.route('/api/orgs',        orgsRouter);
app.route('/api',             entitiesRouter);

// ── Servir arquivos do R2 ─────────────────────────────────────────────────────
app.get('/uploads/:key{.+$}', async (c) => {
  const key = c.req.param('key');
  const obj = await c.env.BUCKET.get(key);
  if (!obj) return c.json({ error: 'Arquivo não encontrado' }, 404);
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  return new Response(obj.body, { headers });
});

// ── SPA fallback — tudo que não é /api ou /uploads vai pro frontend ───────────
// O binding ASSETS serve os arquivos do dist/ (gerado pelo vite build)
app.get('*', (c) => c.env.ASSETS.fetch(c.req.raw));

app.onError((err, c) => {
  console.error('[Worker Error]', err.message);
  return c.json({ error: err.message || 'Erro interno' }, 500);
});

// Exportação padrão de Worker (não usa app.listen)
export default app;
