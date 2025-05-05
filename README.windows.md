# Uplift - Fitness Tracking Application

## Windows Setup Instructions

### Prerequisites
- Node.js 16+ installed
- MySQL 8+ installed and running
- Git installed

### Setup Steps

1. Clone the repository:
   ```
   git clone <repository-url>
   cd uplift
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the setup script:
   ```
   node setup.js
   ```

4. Edit the .env file to update your MySQL credentials:
   - Update DB_USER and DB_PASSWORD with your MySQL credentials

5. Set up the database:
   ```
   npm run db:setup
   ```

6. Push the database schema to MySQL:
   ```
   npm run db:push:win
   ```

7. Start the development server:
   ```
   npm run dev:win
   ```

8. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

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

- `npm run dev:win`: Start the development server
- `npm run build:win`: Build the application for production
- `npm run db:push:win`: Push schema changes to the database


Food Recognition API Ideas
- use calorieninjas API for calculating Macros 
- use snapcalorie ai to know food ingredients
- use image recognition for the snapcalorie ai to know what food it is
- use snapcalorie ai to know food ingredients and use calorieninjas API for calculating Macros 