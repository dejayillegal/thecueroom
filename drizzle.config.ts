// drizzle.config.ts (or wherever you define your Drizzle config)

import { defineConfig } from 'drizzle-kit'
import type { Config } from 'drizzle-kit'

const config: Config = {
  // where your Zod/Drizzle schema lives
  schema: './shared/schema.ts',

  // where to emit migrations or generated types
  out: './drizzle',

  // your database connection URL
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  // ← this is the missing piece:
  dialect: 'postgresql',   // ← or 'mysql' | 'sqlite' | 'turso' | 'singlestore' | 'gel'
}

export default defineConfig(config)
