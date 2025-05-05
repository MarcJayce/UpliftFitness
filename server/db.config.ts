// Database configuration
// Using MySQL for the database

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

export const dbConfig = {
  dbType: "mysql",
  isDevelopment,
  isProduction,
};
