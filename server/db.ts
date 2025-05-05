import postgres from "pg";
import mysql from "mysql2/promise";
import { drizzle as drizzlePostgres } from "drizzle-orm/node-postgres";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import { env } from "process";
import * as schema from "../shared/schema";
import { dbConfig } from "./db.config";

// Connection pools
let postgresPool: postgres.Pool;
let mysqlPool: mysql.Pool;

export async function initializeDatabase() {
  const dbType = dbConfig.dbType;

  try {
    if (dbType === "postgres") {
      // Create PostgreSQL connection pool
      postgresPool = new postgres.Pool({
        connectionString: env.DATABASE_URL,
        // Optional: You can also use individual parameters
        // host: env.PGHOST,
        // port: parseInt(env.PGPORT || '5432'),
        // user: env.PGUSER,
        // password: env.PGPASSWORD,
        // database: env.PGDATABASE,
      });

      console.log("PostgreSQL database connection established successfully");

      // Test connection
      const client = await postgresPool.connect();
      console.log("PostgreSQL connection test successful");
      client.release();
    } else if (dbType === "mysql") {
      // Create MySQL connection pool
      mysqlPool = mysql.createPool({
        host:
          env.DB_HOST || "uplift.cnawicaeuvrw.ap-southeast-2.rds.amazonaws.com",
        port: parseInt(env.DB_PORT || "3306"),
        user: env.DB_USER || "admin",
        password: env.DB_PASSWORD || "Jaycen0113",
        database: env.DB_NAME || "uplift",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      console.log("MySQL database connection established successfully");

      // Test connection
      await mysqlPool.query("SELECT 1");
      console.log("MySQL connection test successful");
    }

    return true;
  } catch (error) {
    console.error(`Failed to initialize ${dbType} database:`, error);
    return false;
  }
}

export function getDb() {
  const dbType = dbConfig.dbType;

  if (dbType === "postgres") {
    if (!postgresPool) {
      throw new Error(
        "PostgreSQL database not initialized. Call initializeDatabase() first."
      );
    }
    return drizzlePostgres(postgresPool, { schema });
  } else if (dbType === "mysql") {
    if (!mysqlPool) {
      throw new Error(
        "MySQL database not initialized. Call initializeDatabase() first."
      );
    }
    return drizzleMysql(mysqlPool, {
      schema,
      mode: "default", // Add this line to specify the mode
    });
  } else {
    throw new Error(`Unsupported database type: ${dbType}`);
  }
}

// Function to close database connections when shutting down
export async function closeDatabase() {
  const dbType = dbConfig.dbType;

  if (dbType === "postgres" && postgresPool) {
    await postgresPool.end();
    console.log("PostgreSQL database connections closed");
  } else if (dbType === "mysql" && mysqlPool) {
    await mysqlPool.end();
    console.log("MySQL database connections closed");
  }
}
