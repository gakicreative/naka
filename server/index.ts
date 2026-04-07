import 'dotenv/config';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import path from 'path';
import type { Env } from './types.js';
import authRouter        from './routes/auth.js';
import entitiesRouter    from './routes/entities.js';
import invitationsRouter from './routes/invitations.js';
import uploadsRouter     from './routes/uploads.js';
import teamRouter        from './routes/team.js';
import orgsRouter        from './routes/orgs.js';

const app = new Hono<Env>();

// ── CORS ──────────────────────────────────────────────────────────────────────
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

// ── Servir uploads do disco local ─────────────────────────────────────────────
app.use('/uploads/*', serveStatic({ root: './' }));

// ── SPA — frontend buildado ───────────────────────────────────────────────────
app.use('/*', serveStatic({ root: './dist' }));
app.get('*', serveStatic({ path: './dist/index.html' }));

app.onError((err, c) => {
  console.error('[Server Error]', err.message);
  return c.json({ error: err.message || 'Erro interno' }, 500);
});

// ── Iniciar servidor ──────────────────────────────────────────────────────────
const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`🚀 Naka OS server running on http://localhost:${info.port}`);
});
