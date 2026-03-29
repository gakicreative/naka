import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

const { Pool } = pg;

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);

// ── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id:            text('id').primaryKey(),
  email:         text('email').notNull().unique(),
  name:          text('name').notNull(),
  passwordHash:  text('password_hash').notNull(),
  role:          text('role').notNull().default('cliente'),
  activeClientId: text('active_client_id'),
  createdAt:     timestamp('created_at').defaultNow(),
});

// ── Invitations ──────────────────────────────────────────────────────────────
export const invitations = pgTable('invitations', {
  id:        text('id').primaryKey(),
  role:      text('role').notNull(),
  used:      boolean('used').notNull().default(false),
  usedBy:    text('used_by'),
  usedAt:    text('used_at'),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ── Entity tables (payload = full JSON object) ────────────────────────────────
export const clients       = pgTable('clients',       { id: text('id').primaryKey(), payload: jsonb('payload').notNull() });
export const projects      = pgTable('projects',      { id: text('id').primaryKey(), payload: jsonb('payload').notNull() });
export const tasks         = pgTable('tasks',         { id: text('id').primaryKey(), payload: jsonb('payload').notNull() });
export const transactions  = pgTable('transactions',  { id: text('id').primaryKey(), payload: jsonb('payload').notNull() });
export const brandhubs     = pgTable('brandhubs',     { id: text('id').primaryKey(), payload: jsonb('payload').notNull() });
export const pins          = pgTable('pins',          { id: text('id').primaryKey(), payload: jsonb('payload').notNull() });
export const labels        = pgTable('labels',        { id: text('id').primaryKey(), payload: jsonb('payload').notNull() });
export const notifications = pgTable('notifications', { id: text('id').primaryKey(), payload: jsonb('payload').notNull() });

// ── DB Init (create tables if they don't exist) ────────────────────────────────
export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL,
      name          TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'cliente',
      active_client_id TEXT,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS invitations (
      id         TEXT PRIMARY KEY,
      role       TEXT NOT NULL,
      used       BOOLEAN NOT NULL DEFAULT FALSE,
      used_by    TEXT,
      used_at    TEXT,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS clients       (id TEXT PRIMARY KEY, payload JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS projects      (id TEXT PRIMARY KEY, payload JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS tasks         (id TEXT PRIMARY KEY, payload JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS transactions  (id TEXT PRIMARY KEY, payload JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS brandhubs     (id TEXT PRIMARY KEY, payload JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS pins          (id TEXT PRIMARY KEY, payload JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS labels        (id TEXT PRIMARY KEY, payload JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, payload JSONB NOT NULL);
  `);
  console.log('✅ DB tables ready');
}
