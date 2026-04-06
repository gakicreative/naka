-- Schema inicial do banco de dados
-- Necessário apenas para setup local (banco remoto já tem as tabelas)
-- Executar: npx wrangler d1 execute nakaosdb --local --file=migrations/0000_initial_schema.sql

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  password_hash TEXT,
  google_id     TEXT,
  role          TEXT NOT NULL DEFAULT 'cliente',
  active_client_id TEXT,
  leader_id     TEXT,
  created_at    TEXT
);

CREATE TABLE IF NOT EXISTS invitations (
  id         TEXT PRIMARY KEY,
  role       TEXT NOT NULL,
  used       INTEGER NOT NULL DEFAULT 0,
  used_by    TEXT,
  used_at    TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS clients       (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS projects      (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS tasks         (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS transactions  (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS brandhubs     (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS pins          (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS labels        (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS feedbacks     (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
