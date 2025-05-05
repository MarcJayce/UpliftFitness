import { defineConfig } from "drizzle-kit";
import { dbConfig } from "./server/db.config";

// Define drizzle configuration for MySQL
const getDrizzleConfig = () => {
  if (
    !process.env.DB_HOST ||
    !process.env.DB_USER ||
    !process.env.DB_PASSWORD ||
    !process.env.DB_NAME
  ) {
    throw new Error(
      "DB_HOST, DB_USER, DB_PASSWORD, DB_NAME are required for MySQL"
    );
  }

  return defineConfig({
    out: "./migrations",
    schema: "./shared/schema.ts",
    dialect: "mysql",
    dbCredentials: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
  });
};

export default getDrizzleConfig();
