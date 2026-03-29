import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import authRouter from './routes/auth.js';
import entitiesRouter from './routes/entities.js';
import invitationsRouter from './routes/invitations.js';
import uploadsRouter from './routes/uploads.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const DIST_DIR = path.join(__dirname, '..', 'dist');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '20mb' }));
app.use(cookieParser());

// ── Static files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(UPLOAD_DIR));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRouter);
app.use('/api/invitations', invitationsRouter);
app.use('/api/upload',      uploadsRouter);
app.use('/api',             entitiesRouter);

// ── Error handler global ─────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]', req.method, req.path, err.message);
  if (req.path.includes('/google')) {
    return res.redirect('/login?error=oauth_failed');
  }
  if (req.path.startsWith('/api')) {
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
  res.status(500).send(`<h1>Erro</h1><pre>${err.message}</pre>`);
});

// ── Serve React SPA ───────────────────────────────────────────────────────────
app.use(express.static(DIST_DIR));
app.get('*', (_req, res) => {
  const index = path.join(DIST_DIR, 'index.html');
  res.sendFile(index, (err) => {
    if (err) res.status(500).send('App not built. Run npm run build first.');
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3000', 10);

initDb()
  .then(() => {
    console.log('Google OAuth CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ definido' : '❌ NÃO DEFINIDO');
    console.log('Google OAuth CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || '⚠️ usando localhost padrão');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Naka OS server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to init DB:', err);
    process.exit(1);
  });
