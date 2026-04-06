import { drizzle } from 'drizzle-orm/d1';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Cria instância do drizzle a partir do binding D1 do Worker
export function getDb(d1: D1Database) {
  return drizzle(d1);
}

// ── Organizations ─────────────────────────────────────────────────────────────
export const organizations = sqliteTable('organizations', {
  id:        text('id').primaryKey(),
  name:      text('name').notNull(),
  slug:      text('slug').notNull().unique(),
  createdBy: text('created_by').notNull(),
  createdAt: text('created_at').notNull(),
  logoUrl:   text('logo_url'),
});

// ── Users ─────────────────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
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
export const invitations = sqliteTable('invitations', {
  id:        text('id').primaryKey(),
  orgId:     text('org_id'),
  role:      text('role').notNull(),
  used:      integer('used', { mode: 'boolean' }).notNull().default(false),
  usedBy:    text('used_by'),
  usedAt:    text('used_at'),
  createdBy: text('created_by').notNull(),
  createdAt: text('created_at'),
});

// ── Entity tables (payload = JSON serializado automaticamente pelo drizzle) ────
export const clients       = sqliteTable('clients',       { id: text('id').primaryKey(), orgId: text('org_id'), payload: text('payload', { mode: 'json' }).notNull().$type<Record<string, unknown>>() });
export const projects      = sqliteTable('projects',      { id: text('id').primaryKey(), orgId: text('org_id'), payload: text('payload', { mode: 'json' }).notNull().$type<Record<string, unknown>>() });
export const tasks         = sqliteTable('tasks',         { id: text('id').primaryKey(), orgId: text('org_id'), payload: text('payload', { mode: 'json' }).notNull().$type<Record<string, unknown>>() });
export const transactions  = sqliteTable('transactions',  { id: text('id').primaryKey(), orgId: text('org_id'), payload: text('payload', { mode: 'json' }).notNull().$type<Record<string, unknown>>() });
export const brandhubs     = sqliteTable('brandhubs',     { id: text('id').primaryKey(), orgId: text('org_id'), payload: text('payload', { mode: 'json' }).notNull().$type<Record<string, unknown>>() });
export const pins          = sqliteTable('pins',          { id: text('id').primaryKey(), orgId: text('org_id'), payload: text('payload', { mode: 'json' }).notNull().$type<Record<string, unknown>>() });
export const labels        = sqliteTable('labels',        { id: text('id').primaryKey(), orgId: text('org_id'), payload: text('payload', { mode: 'json' }).notNull().$type<Record<string, unknown>>() });
export const notifications = sqliteTable('notifications', { id: text('id').primaryKey(), orgId: text('org_id'), payload: text('payload', { mode: 'json' }).notNull().$type<Record<string, unknown>>() });
export const feedbacks     = sqliteTable('feedbacks',     { id: text('id').primaryKey(), orgId: text('org_id'), payload: text('payload', { mode: 'json' }).notNull().$type<Record<string, unknown>>() });
