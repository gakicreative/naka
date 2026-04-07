-- Naka OS — PostgreSQL schema
-- Execute este arquivo no seu banco PostgreSQL antes do primeiro deploy

CREATE TABLE IF NOT EXISTS organizations (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  logo_url   TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id               TEXT PRIMARY KEY,
  email            TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  password_hash    TEXT,
  google_id        TEXT,
  role             TEXT NOT NULL DEFAULT 'cliente',
  org_id           TEXT,
  active_client_id TEXT,
  leader_id        TEXT,
  created_at       TEXT,
  task_view        TEXT
);

CREATE TABLE IF NOT EXISTS invitations (
  id         TEXT PRIMARY KEY,
  org_id     TEXT,
  role       TEXT NOT NULL,
  used       BOOLEAN NOT NULL DEFAULT FALSE,
  used_by    TEXT,
  used_at    TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS clients       (id TEXT PRIMARY KEY, org_id TEXT, payload JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS projects      (id TEXT PRIMARY KEY, org_id TEXT, payload JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS tasks         (id TEXT PRIMARY KEY, org_id TEXT, payload JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS transactions  (id TEXT PRIMARY KEY, org_id TEXT, payload JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS brandhubs     (id TEXT PRIMARY KEY, org_id TEXT, payload JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS pins          (id TEXT PRIMARY KEY, org_id TEXT, payload JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS labels        (id TEXT PRIMARY KEY, org_id TEXT, payload JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, org_id TEXT, payload JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS feedbacks     (id TEXT PRIMARY KEY, org_id TEXT, payload JSONB NOT NULL);

-- Índices para queries filtradas por org_id
CREATE INDEX IF NOT EXISTS idx_users_org_id          ON users(org_id);
CREATE INDEX IF NOT EXISTS idx_invitations_org_id    ON invitations(org_id);
CREATE INDEX IF NOT EXISTS idx_clients_org_id        ON clients(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_org_id       ON projects(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_id          ON tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_transactions_org_id   ON transactions(org_id);
CREATE INDEX IF NOT EXISTS idx_brandhubs_org_id      ON brandhubs(org_id);
CREATE INDEX IF NOT EXISTS idx_pins_org_id           ON pins(org_id);
CREATE INDEX IF NOT EXISTS idx_labels_org_id         ON labels(org_id);
CREATE INDEX IF NOT EXISTS idx_notifications_org_id  ON notifications(org_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_org_id      ON feedbacks(org_id);
