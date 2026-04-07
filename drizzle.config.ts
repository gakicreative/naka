import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema:        './server/db.ts',
  out:           './migrations-pg',
  dialect:       'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
});
