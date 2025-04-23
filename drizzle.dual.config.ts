import { defineConfig } from "drizzle-kit";
import { dbConfig } from "./server/db.config";

// Define drizzle configuration based on database type
const getDrizzleConfig = () => {
  const dbType = dbConfig.dbType;

  if (dbType === 'postgres') {
    // PostgreSQL configuration
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required for PostgreSQL, ensure the database is provisioned");
    }

    return defineConfig({
      out: "./migrations",
      schema: "./shared/schema.dual.ts",
      dialect: "postgresql",
      dbCredentials: {
        url: process.env.DATABASE_URL,
      },
    });
  } else if (dbType === 'mysql') {
    // MySQL configuration
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
      throw new Error("DB_HOST, DB_USER, DB_PASSWORD, DB_NAME are required for MySQL");
    }

    return defineConfig({
      out: "./migrations",
      schema: "./shared/schema.dual.ts",
      dialect: "mysql",
      dbCredentials: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      },
    });
  } else {
    throw new Error(`Unsupported database type: ${dbType}`);
  }
};

export default getDrizzleConfig();