/**
 * Setup script for configuring the application to run on Windows with MySQL
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to copy a file
function copyFile(source, destination) {
  console.log(`Copying ${source} to ${destination}...`);
  fs.copyFileSync(source, destination);
}

// Function to create a .env file
function createEnvFile() {
  console.log('Creating .env file...');
  const envContent = `# Database Configuration
# Set DB_TYPE to 'mysql' for MySQL (Windows) or 'postgres' for PostgreSQL
DB_TYPE=mysql

# MySQL Configuration (used when DB_TYPE=mysql)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=uplift

# PostgreSQL Configuration (used when DB_TYPE=postgres)
DATABASE_URL=postgres://user:password@localhost:5432/uplift
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=uplift

# Application Configuration
NODE_ENV=development
PORT=5000`;

  fs.writeFileSync('.env', envContent);
}

// Function to modify package.json for Windows compatibility
function updatePackageJson() {
  console.log('Updating package.json for Windows compatibility...');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Update scripts for Windows compatibility
  packageJson.scripts = {
    ...packageJson.scripts,
    "dev:win": "set NODE_ENV=development && tsx server/index.ts",
    "build:win": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start:win": "set NODE_ENV=production && node dist/index.js",
    "db:push:win": "drizzle-kit push",
    "db:setup": "node setup-database.js"
  };
  
  // Add type module for ESM
  packageJson.type = "module";
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

// Function to create a database setup script
function createDatabaseSetupScript() {
  console.log('Creating database setup script...');
  
  const setupContent = `/**
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
    console.log(\`Creating database \${DB_NAME} if it doesn't exist...\`);
    await connection.query(\`CREATE DATABASE IF NOT EXISTS \${DB_NAME}\`);
    
    // Switch to the new database
    await connection.query(\`USE \${DB_NAME}\`);
    console.log(\`Successfully switched to database \${DB_NAME}\`);

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
`;
  
  fs.writeFileSync('setup-database.js', setupContent);
}

// Function to create a README file with setup instructions
function createReadmeFile() {
  console.log('Creating README with setup instructions...');
  
  const readmeContent = `# Uplift - Fitness Tracking Application

## Windows Setup Instructions

### Prerequisites
- Node.js 16+ installed
- MySQL 8+ installed and running
- Git installed

### Setup Steps

1. Clone the repository:
   \`\`\`
   git clone <repository-url>
   cd uplift
   \`\`\`

2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

3. Run the setup script:
   \`\`\`
   node setup.js
   \`\`\`

4. Edit the .env file to update your MySQL credentials:
   - Update DB_USER and DB_PASSWORD with your MySQL credentials

5. Set up the database:
   \`\`\`
   npm run db:setup
   \`\`\`

6. Push the database schema to MySQL:
   \`\`\`
   npm run db:push:win
   \`\`\`

7. Start the development server:
   \`\`\`
   npm run dev:win
   \`\`\`

8. Open your browser and navigate to:
   \`\`\`
   http://localhost:5000
   \`\`\`

## Application Features

- **Workout Tracking**: Create custom workouts, track sets, reps, and weight
- **Macro Tracking**: Log meals and track nutrients
- **Progress Visualization**: Monitor your progress over time
- **Responsive Design**: Works on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: React with Tailwind CSS
- **Backend**: Express.js
- **Database**: MySQL (Windows) / PostgreSQL (other platforms)
- **ORM**: Drizzle ORM

## Development Commands

- \`npm run dev:win\`: Start the development server
- \`npm run build:win\`: Build the application for production
- \`npm run db:push:win\`: Push schema changes to the database
`;
  
  fs.writeFileSync('README.windows.md', readmeContent);
}

// Main setup function
function setup() {
  console.log('Starting Windows setup process...');
  
  try {
    // Create .env file
    createEnvFile();
    
    // Update package.json
    updatePackageJson();
    
    // Create database setup script
    createDatabaseSetupScript();
    
    // Create README with setup instructions
    createReadmeFile();
    
    // Use the dual database schema
    copyFile('shared/schema.dual.ts', 'shared/schema.ts');
    
    // Use the dual drizzle config
    copyFile('drizzle.dual.config.ts', 'drizzle.config.ts');
    
    console.log('\nSetup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Edit the .env file to update your MySQL credentials');
    console.log('2. Run "npm run db:setup" to set up the database');
    console.log('3. Run "npm run db:push:win" to create all database tables');
    console.log('4. Run "npm run dev:win" to start the application');
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
}

// Run the setup
setup();