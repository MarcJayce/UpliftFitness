// User types
export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  bodyFat?: number;
  activityLevel?: string;
  goal?: string;
  units?: string;
  notifications?: boolean;
  createdAt?: string;
}

export interface UserSignupForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginForm {
  username: string;
  password: string;
}

export interface ProfileSetupForm {
  fullName: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  goal: string;
  activityLevel: string;
  units: string;
  notifications: boolean;
}

// Workout types
export interface Exercise {
  id: number;
  name: string;
  description?: string;
  muscleGroup?: string;
  instructions?: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface WorkoutProgram {
  id: number;
  name: string;
  description?: string;
  frequency?: number;
  level?: string;
  active: boolean;
}

export interface WorkoutDay {
  id: number;
  programId: number;
  name: string;
  dayOfWeek?: number;
  targetMuscleGroups?: string;
  order: number;
}

export interface WorkoutDayExercise {
  id: number;
  dayId: number;
  exerciseId: number;
  sets?: number;
  reps?: string;
  weight?: string;
  restTime?: number;
  order: number;
  exerciseName?: string;
  muscleGroup?: string;
  imageUrl?: string;
}

export interface WorkoutSession {
  id: number;
  programId?: number;
  dayId?: number;
  date: string;
  duration?: number;
  complete: boolean;
  notes?: string;
  programName?: string;
  dayName?: string;
}

export interface WorkoutSetLog {
  id: number;
  sessionId: number;
  exerciseId: number;
  setNumber: number;
  reps: number;
  weight: number;
  complete: boolean;
}

// Nutrition types
export interface FoodItem {
  id: number;
  name: string;
  brand?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  servingSize?: number;
  servingUnit?: string;
  barcode?: string;
}

export interface Meal {
  id: number;
  name: string;
  type?: string;
  date: string;
  time?: string;
  items?: MealFoodItem[];
}

export interface MealFoodItem extends FoodItem {
  mealId: number;
  foodItemId: number;
  servingSize?: number;
  servingUnit?: string;
  customServingDescription?: string;
}

export interface NutritionGoal {
  id: number;
  dailyCalories?: number;
  proteinPct?: number;
  carbsPct?: number;
  fatPct?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
}

// Progress tracking types
export interface BodyMeasurement {
  id: number;
  date: string;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  notes?: string;
}

export interface ProgressPhoto {
  id: number;
  date: string;
  photoUrl: string;
  type?: string;
}

// App types
export type Tab = 'gym' | 'macros' | 'dashboard' | 'scan' | 'profile';
export type AuthState = 'loggedOut' | 'loggedIn' | 'setupRequired';
