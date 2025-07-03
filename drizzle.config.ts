import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'
import type { Config } from 'drizzle-kit'

const config: Config = {
  schema: './shared/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,  // now defined from your .env
  },
  dialect: 'postgresql',
}

export default defineConfig(config)