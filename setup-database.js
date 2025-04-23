/**
 * Script to set up the MySQL database
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function setupDatabase() {
  // Database configuration
  const {
    DB_HOST = 'localhost',
    DB_PORT = 3306,
    DB_USER = 'root',
    DB_PASSWORD = 'password',
    DB_NAME = 'uplift'
  } = process.env;

  try {
    // Connect to MySQL server without selecting a database
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    console.log(`Creating database ${DB_NAME} if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
    
    // Switch to the new database
    await connection.query(`USE ${DB_NAME}`);
    console.log(`Successfully switched to database ${DB_NAME}`);

    // Close the connection
    await connection.end();
    console.log('Database connection closed');
    console.log('Database setup completed successfully');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run "npm run db:push:win" to create all database tables');
    console.log('2. Run "npm run dev:win" to start the application');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
