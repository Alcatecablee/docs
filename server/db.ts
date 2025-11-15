import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

// Configure for serverless environment
const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;

if (!isServerless) {
  // Use WebSocket for local development only
  neonConfig.webSocketConstructor = ws;
}
// Serverless environments use fetch by default (no config needed)

// Allow running without DATABASE_URL in development by exporting undefined
// and letting the storage layer provide an in-memory fallback.
let pool: Pool | undefined;
let db: ReturnType<typeof drizzle> | undefined;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  console.warn("DATABASE_URL not set. Running without a database; using in-memory storage fallback.");
}

export { pool, db };
