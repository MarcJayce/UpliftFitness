// Dual database schema supporting both MySQL and PostgreSQL
import {
  pgTable,
  text as pgText,
  integer as pgInt,
  doublePrecision as pgDouble,
  boolean as pgBoolean,
  serial as pgSerial,
  varchar as pgVarchar,
  date as pgDate,
  timestamp as pgTimestamp,
} from "drizzle-orm/pg-core";
import {
  mysqlTable,
  text as mysqlText,
  int as mysqlInt,
  double as mysqlDouble,
  boolean as mysqlBoolean,
  serial as mysqlSerial,
  varchar as mysqlVarchar,
  date as mysqlDate,
  timestamp as mysqlTimestamp,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import the database config
import { dbConfig } from "../server/db.config";
const dbType = dbConfig.dbType;

// Define table creator based on database type
const createTable = dbType === "postgres" ? pgTable : mysqlTable;
const text = dbType === "postgres" ? pgText : mysqlText;
const integer = dbType === "postgres" ? pgInt : mysqlInt;
const double = dbType === "postgres" ? pgDouble : mysqlDouble;
const boolean = dbType === "postgres" ? pgBoolean : mysqlBoolean;
const serial = dbType === "postgres" ? pgSerial : mysqlSerial;
const varchar = dbType === "postgres" ? pgVarchar : mysqlVarchar;
const dateType = dbType === "postgres" ? pgDate : mysqlDate;
const timestamp = dbType === "postgres" ? pgTimestamp : mysqlTimestamp;

// Type guards to ensure proper typing
function isPgTable(table: any): table is ReturnType<typeof pgTable> {
  return dbType === "postgres";
}

function isMysqlTable(table: any): table is ReturnType<typeof mysqlTable> {
  return dbType === "mysql";
}

// User table
export const users = createTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }),
  age: integer("age"),
  gender: varchar("gender", { length: 50 }),
  height: double("height"),
  weight: double("weight"),
  bodyFat: double("body_fat"),
  activityLevel: varchar("activity_level", { length: 50 }),
  goal: varchar("goal", { length: 50 }),
  units: varchar("units", { length: 20 }).default("metric"),
  notifications: boolean("notifications").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workout Programs
export const workoutPrograms = createTable("workout_programs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  frequency: integer("frequency"),
  level: varchar("level", { length: 50 }),
  active: boolean("active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workout Days
export const workoutDays = createTable("workout_days", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  dayOfWeek: integer("day_of_week"),
  targetMuscleGroups: text("target_muscle_groups"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Exercises
export const exercises = createTable("exercises", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  muscleGroup: varchar("muscle_group", { length: 50 }),
  instructions: text("instructions"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workout Day Exercises
export const workoutDayExercises = createTable("workout_day_exercises", {
  id: serial("id").primaryKey(),
  dayId: integer("day_id").notNull(),
  exerciseId: integer("exercise_id").notNull(),
  sets: integer("sets"),
  reps: varchar("reps", { length: 50 }),
  weight: varchar("weight", { length: 50 }),
  restTime: integer("rest_time"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workout Sessions (tracking actual workouts completed)
export const workoutSessions = createTable("workout_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  programId: integer("program_id"),
  dayId: integer("day_id"),
  date: dateType("date").notNull(),
  duration: integer("duration"),
  complete: boolean("complete").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workout Set Logs (tracking individual sets completed)
export const workoutSetLogs = createTable("workout_set_logs", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  exerciseId: integer("exercise_id").notNull(),
  setNumber: integer("set_number").notNull(),
  reps: integer("reps").notNull(),
  weight: double("weight").notNull(),
  complete: boolean("complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Food Items
export const foodItems = createTable("food_items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  brand: varchar("brand", { length: 100 }),
  calories: integer("calories"),
  protein: double("protein"),
  carbs: double("carbs"),
  fat: double("fat"),
  fiber: double("fiber"),
  sugar: double("sugar"),
  servingSize: double("serving_size"),
  servingUnit: varchar("serving_unit", { length: 50 }),
  barcode: varchar("barcode", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Meals
export const meals = createTable("meals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }),
  date: dateType("date").notNull(),
  time: varchar("time", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Meal Food Items
export const mealFoodItems = createTable("meal_food_items", {
  id: serial("id").primaryKey(),
  mealId: integer("meal_id").notNull(),
  foodItemId: integer("food_item_id").notNull(),
  servingSize: double("serving_size"),
  servingUnit: varchar("serving_unit", { length: 50 }),
  customServingDescription: varchar("custom_serving_description", {
    length: 100,
  }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Body Measurements
export const bodyMeasurements = createTable("body_measurements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: dateType("date").notNull(),
  weight: double("weight"),
  bodyFat: double("body_fat"),
  chest: double("chest"),
  waist: double("waist"),
  hips: double("hips"),
  arms: double("arms"),
  thighs: double("thighs"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Progress Photos
export const progressPhotos = createTable("progress_photos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: dateType("date").notNull(),
  photoUrl: text("photo_url").notNull(),
  type: varchar("type", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Nutrition Goals
export const nutritionGoals = createTable("nutrition_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  dailyCalories: integer("daily_calories"),
  proteinPct: double("protein_pct"),
  carbsPct: double("carbs_pct"),
  fatPct: double("fat_pct"),
  proteinG: double("protein_g"),
  carbsG: double("carbs_g"),
  fatG: double("fat_g"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod Schemas for form validation and API requests
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  age: true,
  gender: true,
  height: true,
  weight: true,
  bodyFat: true,
  activityLevel: true,
  goal: true,
  units: true,
  notifications: true,
});

export const insertWorkoutProgramSchema = createInsertSchema(
  workoutPrograms
).pick({
  userId: true,
  name: true,
  description: true,
  frequency: true,
  level: true,
  active: true,
});

export const insertWorkoutDaySchema = createInsertSchema(workoutDays).pick({
  programId: true,
  name: true,
  dayOfWeek: true,
  targetMuscleGroups: true,
  order: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).pick({
  name: true,
  description: true,
  muscleGroup: true,
  instructions: true,
  imageUrl: true,
  videoUrl: true,
});

export const insertWorkoutDayExerciseSchema = createInsertSchema(
  workoutDayExercises
).pick({
  dayId: true,
  exerciseId: true,
  sets: true,
  reps: true,
  weight: true,
  restTime: true,
  order: true,
});

export const insertWorkoutSessionSchema = createInsertSchema(
  workoutSessions
).pick({
  userId: true,
  programId: true,
  dayId: true,
  date: true,
  duration: true,
  complete: true,
  notes: true,
});

export const insertWorkoutSetLogSchema = createInsertSchema(
  workoutSetLogs
).pick({
  sessionId: true,
  exerciseId: true,
  setNumber: true,
  reps: true,
  weight: true,
  complete: true,
});

export const insertFoodItemSchema = createInsertSchema(foodItems).pick({
  name: true,
  brand: true,
  calories: true,
  protein: true,
  carbs: true,
  fat: true,
  fiber: true,
  sugar: true,
  servingSize: true,
  servingUnit: true,
  barcode: true,
});

export const insertMealSchema = createInsertSchema(meals).pick({
  userId: true,
  name: true,
  type: true,
  date: true,
  time: true,
});

export const insertMealFoodItemSchema = createInsertSchema(mealFoodItems).pick({
  mealId: true,
  foodItemId: true,
  servingSize: true,
  servingUnit: true,
  customServingDescription: true,
});

export const insertBodyMeasurementSchema = createInsertSchema(
  bodyMeasurements
).pick({
  userId: true,
  date: true,
  weight: true,
  bodyFat: true,
  chest: true,
  waist: true,
  hips: true,
  arms: true,
  thighs: true,
  notes: true,
});

export const insertProgressPhotoSchema = createInsertSchema(
  progressPhotos
).pick({
  userId: true,
  date: true,
  photoUrl: true,
  type: true,
});

export const insertNutritionGoalSchema = createInsertSchema(
  nutritionGoals
).pick({
  userId: true,
  dailyCalories: true,
  proteinPct: true,
  carbsPct: true,
  fatPct: true,
  proteinG: true,
  carbsG: true,
  fatG: true,
  active: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type WorkoutProgram = typeof workoutPrograms.$inferSelect;
export type InsertWorkoutProgram = z.infer<typeof insertWorkoutProgramSchema>;

export type WorkoutDay = typeof workoutDays.$inferSelect;
export type InsertWorkoutDay = z.infer<typeof insertWorkoutDaySchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type WorkoutDayExercise = typeof workoutDayExercises.$inferSelect;
export type InsertWorkoutDayExercise = z.infer<
  typeof insertWorkoutDayExerciseSchema
>;

export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;

export type WorkoutSetLog = typeof workoutSetLogs.$inferSelect;
export type InsertWorkoutSetLog = z.infer<typeof insertWorkoutSetLogSchema>;

export type FoodItem = typeof foodItems.$inferSelect;
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;

export type Meal = typeof meals.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;

export type MealFoodItem = typeof mealFoodItems.$inferSelect;
export type InsertMealFoodItem = z.infer<typeof insertMealFoodItemSchema>;

export type BodyMeasurement = typeof bodyMeasurements.$inferSelect;
export type InsertBodyMeasurement = z.infer<typeof insertBodyMeasurementSchema>;

export type ProgressPhoto = typeof progressPhotos.$inferSelect;
export type InsertProgressPhoto = z.infer<typeof insertProgressPhotoSchema>;

export type NutritionGoal = typeof nutritionGoals.$inferSelect;
export type InsertNutritionGoal = z.infer<typeof insertNutritionGoalSchema>;
