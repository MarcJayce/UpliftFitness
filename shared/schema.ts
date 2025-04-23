import { pgTable, text, integer as int, doublePrecision as double, boolean, serial, varchar, date, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }),
  age: int('age'),
  gender: varchar('gender', { length: 50 }),
  height: double('height'),
  weight: double('weight'),
  bodyFat: double('body_fat'),
  activityLevel: varchar('activity_level', { length: 50 }),
  goal: varchar('goal', { length: 50 }),
  units: varchar('units', { length: 20 }).default('metric'),
  notifications: boolean('notifications').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Workout Program
export const workoutPrograms = pgTable('workout_programs', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 500 }),
  frequency: int('frequency'),
  level: varchar('level', { length: 50 }),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Workout Days
export const workoutDays = pgTable('workout_days', {
  id: serial('id').primaryKey(),
  programId: int('program_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  dayOfWeek: int('day_of_week'),
  targetMuscleGroups: varchar('target_muscle_groups', { length: 255 }),
  order: int('order').default(0)
});

// Exercises
export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  muscleGroup: varchar('muscle_group', { length: 100 }),
  instructions: text('instructions'),
  imageUrl: varchar('image_url', { length: 500 }),
  videoUrl: varchar('video_url', { length: 500 }),
  isCustom: boolean('is_custom').default(false),
  userId: int('user_id')
});

// Workout Day Exercises
export const workoutDayExercises = pgTable('workout_day_exercises', {
  id: serial('id').primaryKey(),
  dayId: int('day_id').notNull(),
  exerciseId: int('exercise_id').notNull(),
  sets: int('sets'),
  reps: varchar('reps', { length: 100 }),
  weight: varchar('weight', { length: 100 }),
  restTime: int('rest_time'),
  order: int('order').default(0)
});

// Workout Sessions
export const workoutSessions = pgTable('workout_sessions', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull(),
  programId: int('program_id'),
  dayId: int('day_id'),
  date: date('date').notNull(),
  duration: int('duration'),
  complete: boolean('complete').default(false),
  notes: text('notes')
});

// Workout Set Logs
export const workoutSetLogs = pgTable('workout_set_logs', {
  id: serial('id').primaryKey(),
  sessionId: int('session_id').notNull(),
  exerciseId: int('exercise_id').notNull(),
  setNumber: int('set_number'),
  reps: int('reps'),
  weight: double('weight'),
  complete: boolean('complete').default(false)
});

// Food Items
export const foodItems = pgTable('food_items', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  brand: varchar('brand', { length: 255 }),
  calories: int('calories'),
  protein: double('protein'),
  carbs: double('carbs'),
  fat: double('fat'),
  fiber: double('fiber'),
  sugar: double('sugar'),
  servingSize: double('serving_size'),
  servingUnit: varchar('serving_unit', { length: 50 }),
  barcode: varchar('barcode', { length: 100 }),
  isCustom: boolean('is_custom').default(false),
  userId: int('user_id')
});

// Meals
export const meals = pgTable('meals', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }), // breakfast, lunch, dinner, snack
  date: date('date').notNull(),
  time: timestamp('time')
});

// Meal Food Items
export const mealFoodItems = pgTable('meal_food_items', {
  id: serial('id').primaryKey(),
  mealId: int('meal_id').notNull(),
  foodItemId: int('food_item_id').notNull(),
  servingSize: double('serving_size'),
  servingUnit: varchar('serving_unit', { length: 50 }),
  customServingDescription: varchar('custom_serving_description', { length: 255 })
});

// Weight and Body Measurements
export const bodyMeasurements = pgTable('body_measurements', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull(),
  date: date('date').notNull(),
  weight: double('weight'),
  bodyFat: double('body_fat'),
  chest: double('chest'),
  waist: double('waist'),
  hips: double('hips'),
  arms: double('arms'),
  thighs: double('thighs'),
  notes: text('notes')
});

// Progress Photos
export const progressPhotos = pgTable('progress_photos', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull(),
  date: date('date').notNull(),
  photoUrl: varchar('photo_url', { length: 500 }),
  type: varchar('type', { length: 50 }) // front, side, back
});

// Nutrition Goals
export const nutritionGoals = pgTable('nutrition_goals', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull(),
  dailyCalories: int('daily_calories'),
  proteinPct: double('protein_pct'),
  carbsPct: double('carbs_pct'),
  fatPct: double('fat_pct'),
  proteinG: double('protein_g'),
  carbsG: double('carbs_g'),
  fatG: double('fat_g'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Insert schemas
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
  notifications: true
});

export const insertWorkoutProgramSchema = createInsertSchema(workoutPrograms).pick({
  userId: true,
  name: true,
  description: true,
  frequency: true,
  level: true,
  active: true
});

export const insertWorkoutDaySchema = createInsertSchema(workoutDays).pick({
  programId: true,
  name: true,
  dayOfWeek: true,
  targetMuscleGroups: true,
  order: true
});

export const insertExerciseSchema = createInsertSchema(exercises).pick({
  name: true,
  description: true,
  muscleGroup: true,
  instructions: true,
  imageUrl: true,
  videoUrl: true,
  isCustom: true,
  userId: true
});

export const insertWorkoutDayExerciseSchema = createInsertSchema(workoutDayExercises).pick({
  dayId: true,
  exerciseId: true,
  sets: true,
  reps: true,
  weight: true,
  restTime: true,
  order: true
});

export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions).pick({
  userId: true,
  programId: true,
  dayId: true,
  date: true,
  duration: true,
  complete: true,
  notes: true
});

export const insertWorkoutSetLogSchema = createInsertSchema(workoutSetLogs).pick({
  sessionId: true,
  exerciseId: true,
  setNumber: true,
  reps: true,
  weight: true,
  complete: true
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
  isCustom: true,
  userId: true
});

export const insertMealSchema = createInsertSchema(meals).pick({
  userId: true,
  name: true,
  type: true,
  date: true,
  time: true
});

export const insertMealFoodItemSchema = createInsertSchema(mealFoodItems).pick({
  mealId: true,
  foodItemId: true,
  servingSize: true,
  servingUnit: true,
  customServingDescription: true
});

export const insertBodyMeasurementSchema = createInsertSchema(bodyMeasurements).pick({
  userId: true,
  date: true,
  weight: true,
  bodyFat: true,
  chest: true,
  waist: true,
  hips: true,
  arms: true,
  thighs: true,
  notes: true
});

export const insertProgressPhotoSchema = createInsertSchema(progressPhotos).pick({
  userId: true,
  date: true,
  photoUrl: true,
  type: true
});

export const insertNutritionGoalSchema = createInsertSchema(nutritionGoals).pick({
  userId: true,
  dailyCalories: true,
  proteinPct: true,
  carbsPct: true,
  fatPct: true,
  proteinG: true,
  carbsG: true,
  fatG: true,
  active: true
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type WorkoutProgram = typeof workoutPrograms.$inferSelect;
export type InsertWorkoutProgram = z.infer<typeof insertWorkoutProgramSchema>;

export type WorkoutDay = typeof workoutDays.$inferSelect;
export type InsertWorkoutDay = z.infer<typeof insertWorkoutDaySchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type WorkoutDayExercise = typeof workoutDayExercises.$inferSelect;
export type InsertWorkoutDayExercise = z.infer<typeof insertWorkoutDayExerciseSchema>;

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
