import { drizzle } from 'drizzle-orm/postgres-js';
import { pgTable, text, boolean, jsonb } from 'drizzle-orm/pg-core';
import postgres from 'postgres';

// Singleton connection — reused across warm serverless invocations
let _sql: ReturnType<typeof postgres> | null = null;

function getSql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL!;
    _sql = postgres(url, {
      max: 1,
      ssl: 'require',
      // PgBouncer transaction mode doesn't support prepared statements
      prepare: !url.includes('pgbouncer'),
    });
  }
  return _sql;
}

export function getDb() {
  return drizzle(getSql());
}

// ── Organizations ─────────────────────────────────────────────────────────────
export const organizations = pgTable('organizations', {
  id:        text('id').primaryKey(),
  name:      text('name').notNull(),
  slug:      text('slug').notNull().unique(),
  createdBy: text('created_by').notNull(),
  createdAt: text('created_at').notNull(),
  logoUrl:   text('logo_url'),
});

// ── Users ─────────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id:             text('id').primaryKey(),
  email:          text('email').notNull().unique(),
  name:           text('name').notNull(),
  passwordHash:   text('password_hash'),
  googleId:       text('google_id'),
  role:           text('role').notNull().default('cliente'),
  orgId:          text('org_id'),
  activeClientId: text('active_client_id'),
  leaderId:       text('leader_id'),
  createdAt:      text('created_at'),
  taskView:       text('task_view'),
});

// ── Invitations ───────────────────────────────────────────────────────────────
export const invitations = pgTable('invitations', {
  id:        text('id').primaryKey(),
  orgId:     text('org_id'),
  role:      text('role').notNull(),
  used:      boolean('used').notNull().default(false),
  usedBy:    text('used_by'),
  usedAt:    text('used_at'),
  createdBy: text('created_by').notNull(),
  createdAt: text('created_at'),
});

// ── Entity tables (payload = JSON serializado automaticamente pelo drizzle) ────
const entityCols = () => ({
  id:      text('id').primaryKey(),
  orgId:   text('org_id'),
  payload: jsonb('payload').notNull().$type<Record<string, unknown>>(),
});

export const clients       = pgTable('clients',       entityCols());
export const projects      = pgTable('projects',      entityCols());
export const tasks         = pgTable('tasks',         entityCols());
export const transactions  = pgTable('transactions',  entityCols());
export const brandhubs     = pgTable('brandhubs',     entityCols());
export const pins          = pgTable('pins',          entityCols());
export const labels        = pgTable('labels',        entityCols());
export const notifications = pgTable('notifications', entityCols());
export const feedbacks     = pgTable('feedbacks',     entityCols());
