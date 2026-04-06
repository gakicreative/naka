-- Multi-tenancy: organizations + org_id em todas as tabelas
-- Executar: npx wrangler d1 execute nakaosdb --file=migrations/0001_multi_tenancy.sql
-- Local:    npx wrangler d1 execute nakaosdb --local --file=migrations/0001_multi_tenancy.sql

CREATE TABLE IF NOT EXISTS organizations (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL
);

ALTER TABLE users        ADD COLUMN org_id TEXT;
ALTER TABLE invitations  ADD COLUMN org_id TEXT;
ALTER TABLE clients      ADD COLUMN org_id TEXT;
ALTER TABLE projects     ADD COLUMN org_id TEXT;
ALTER TABLE tasks        ADD COLUMN org_id TEXT;
ALTER TABLE transactions ADD COLUMN org_id TEXT;
ALTER TABLE brandhubs    ADD COLUMN org_id TEXT;
ALTER TABLE pins         ADD COLUMN org_id TEXT;
ALTER TABLE labels       ADD COLUMN org_id TEXT;
ALTER TABLE notifications ADD COLUMN org_id TEXT;
ALTER TABLE feedbacks    ADD COLUMN org_id TEXT;
