import postgres from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from 'process';

// PostgreSQL connection pool
let pool: postgres.Pool;

export async function initializeDatabase() {
  try {
    // Create connection pool
    pool = new postgres.Pool({
      connectionString: env.DATABASE_URL,
      // Optional: You can also use individual parameters
      // host: env.PGHOST,
      // port: parseInt(env.PGPORT || '5432'),
      // user: env.PGUSER,
      // password: env.PGPASSWORD,
      // database: env.PGDATABASE,
    });
    
    console.log('PostgreSQL database connection established successfully');
    
    // Test connection
    const client = await pool.connect();
    console.log('PostgreSQL connection test successful');
    client.release();
    
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}

export function getDb() {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return drizzle(pool);
}

// Function to close database connections when shutting down
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    console.log('Database connections closed');
  }
}
