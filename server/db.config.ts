// Database configuration
// This file allows switching between PostgreSQL and MySQL

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isWindows = process.platform === 'win32';

// Default to using PostgreSQL in production or non-Windows environments
const DEFAULT_DB_TYPE = isProduction || !isWindows ? 'postgres' : 'mysql';

// Allow DB_TYPE to be set via environment variable to override the default
const DB_TYPE = process.env.DB_TYPE || DEFAULT_DB_TYPE;

export const dbConfig = {
  dbType: DB_TYPE,
  isDevelopment,
  isProduction
};