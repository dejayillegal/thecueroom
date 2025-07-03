// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'
import type { Config } from 'drizzle-kit'

const config: Config = {
  schema: './shared/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: {
      rejectUnauthorized: false,
    },
  },
}

export default defineConfig(config)
