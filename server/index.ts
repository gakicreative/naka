import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import './google-strategy.js'; // registra a strategy do Google
import passport from 'passport';
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

// Session — usada APENAS para transportar o inviteId durante o fluxo OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'naka-session-secret-dev',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000, // 10 minutos — só para o fluxo OAuth
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// ── Static files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(UPLOAD_DIR));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRouter);
app.use('/api/invitations', invitationsRouter);
app.use('/api/upload',      uploadsRouter);
app.use('/api',             entitiesRouter);  // /api/clients, /api/tasks, etc.

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
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Naka OS server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to init DB:', err);
    process.exit(1);
  });
