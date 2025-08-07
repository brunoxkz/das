import type { Config } from 'drizzle-kit';

export default {
  schema: './shared/schema.ts',
  out: './migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './database.db',
  },
  verbose: true,
  strict: true,
} satisfies Config;