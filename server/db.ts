import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Detect database provider
function detectDatabaseProvider(): string {
  const url = process.env.DATABASE_URL || '';
  
  if (url.includes('neon.tech')) return 'neon';
  if (url.includes('supabase.com')) return 'supabase';
  if (url.includes('railway.app')) return 'railway';
  if (url.includes('aivencloud.com')) return 'aiven';
  if (url.includes('elephantsql.com')) return 'elephantsql';
  if (url.includes('localhost') || url.includes('127.0.0.1')) return 'local';
  
  return 'standard';
}

// Configure connection based on provider
const provider = detectDatabaseProvider();
let pool: any;
let db: any;

if (provider === 'neon') {
  // Configure Neon WebSocket
  neonConfig.webSocketConstructor = ws;
  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = neonDrizzle({ client: pool, schema });
} else {
  // Standard PostgreSQL for all other providers
  const config: any = { 
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
  
  // Add SSL for cloud providers
  if (['supabase', 'railway', 'aiven'].includes(provider)) {
    config.ssl = { rejectUnauthorized: false };
  }
  
  pool = new PgPool(config);
  db = pgDrizzle(pool, { schema });
}

export { pool, db, detectDatabaseProvider };