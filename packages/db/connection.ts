import { Pool } from "pg";

declare global {
  var __neonPool: Pool | undefined;
}

const pool = global.__neonPool ?? new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
});

if (!global.__neonPool) global.__neonPool = pool;

export { pool };
