import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { env } from "process";
import * as schema from "../shared/schema";

// MySQL connection pool
let mysqlPool: mysql.Pool;

export async function initializeDatabase() {
  try {
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

    return true;
  } catch (error) {
    console.error("Failed to initialize MySQL database:", error);
    return false;
  }
}

export function getDb() {
  if (!mysqlPool) {
    throw new Error(
      "MySQL database not initialized. Call initializeDatabase() first."
    );
  }
  return drizzle(mysqlPool, {
    schema,
    mode: "default",
  });
}

// Function to close database connections when shutting down
export async function closeDatabase() {
  if (mysqlPool) {
    await mysqlPool.end();
    console.log("MySQL database connections closed");
  }
}
