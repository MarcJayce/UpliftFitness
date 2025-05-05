import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { initializeDatabase, closeDatabase } from "./db";
import session from "express-session";
import { env } from "process";
import { z } from "zod";
import {
  createUser,
  getUserByEmail,
  getUserByUsername,
  verifyPassword,
  updateUserProfile,
  getUserById,
} from "./auth";
import { getDb } from "./db";
import { and, eq, or, like, sql, desc, gte, lte } from "drizzle-orm";
import {
  users,
  workoutPrograms,
  workoutDays,
  exercises,
  workoutDayExercises,
  workoutSessions,
  workoutSetLogs,
  foodItems,
  meals,
  mealFoodItems,
  bodyMeasurements,
  progressPhotos,
  nutritionGoals,
  insertUserSchema,
  insertWorkoutProgramSchema,
  insertWorkoutDaySchema,
  insertExerciseSchema,
  insertWorkoutDayExerciseSchema,
  insertWorkoutSessionSchema,
  insertWorkoutSetLogSchema,
  insertFoodItemSchema,
  insertMealSchema,
  insertMealFoodItemSchema,
  insertBodyMeasurementSchema,
  insertProgressPhotoSchema,
  insertNutritionGoalSchema,
} from "@shared/schema";

// Extended request type with user information
declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database
  await initializeDatabase();

  // Process cleanup
  process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully");
    await closeDatabase();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("SIGINT received, shutting down gracefully");
    await closeDatabase();
    process.exit(0);
  });

  // Session middleware
  app.use(
    session({
      secret: env.SESSION_SECRET || "uplift-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Register routes

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const schema = z.object({
        username: z.string().min(3).max(100),
        email: z.string().email(),
        password: z.string().min(6),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: result.error.format() });
      }

      const { username, email, password } = result.data;

      // Check if user already exists
      const existingByUsername = await getUserByUsername(username);
      if (existingByUsername) {
        return res.status(400).json({ message: "Username is already taken" });
      }

      const existingByEmail = await getUserByEmail(email);
      if (existingByEmail) {
        return res.status(400).json({ message: "Email is already registered" });
      }

      // Create user
      const user = await createUser(username, email, password);

      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;

      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res
        .status(500)
        .json({ message: "An error occurred during registration" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const schema = z.object({
        username: z.string(),
        password: z.string(),
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: result.error.format() });
      }

      const { username, password } = result.data;

      // Get user
      const user = await getUserByUsername(username);
      if (!user) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      // Verify password
      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        profileComplete: Boolean(user.fullName && user.age && user.weight),
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "An error occurred during login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res
          .status(401)
          .json({ message: "User ID not found in session" });
      }
      const user = await getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userInfo } = user;
      res.json(userInfo);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Profile Routes
  app.post("/api/profile/setup", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res
          .status(401)
          .json({ message: "User ID not found in session" });
      }
      const schema = insertUserSchema.omit({
        username: true,
        password: true,
        email: true,
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: result.error.format() });
      }

      // Update user profile
      const updatedUser = await updateUserProfile(userId, result.data);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userInfo } = updatedUser;
      res.json(userInfo);
    } catch (error) {
      console.error("Error updating profile:", error);
      res
        .status(500)
        .json({ message: "An error occurred during profile setup" });
    }
  });

  app.put("/api/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res
          .status(401)
          .json({ message: "User ID not found in session" });
      }
      const schema = insertUserSchema
        .omit({ username: true, password: true, email: true })
        .partial();

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: result.error.format() });
      }

      // Update user profile
      const updatedUser = await updateUserProfile(userId, result.data);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userInfo } = updatedUser;
      res.json(userInfo);
    } catch (error) {
      console.error("Error updating profile:", error);
      res
        .status(500)
        .json({ message: "An error occurred during profile update" });
    }
  });

  // Food and Nutrition Routes
  app.get("/api/food-items/search", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;
      const { query } = req.query;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }

      // Search for food items matching the query
      // Include both global items (userId is null) and user's custom items
      const searchResults = await db
        .select()
        .from(foodItems)
        .where(like(foodItems.name, `%${query}%`))
        .limit(20);

      res.json(searchResults);
    } catch (error) {
      console.error("Error searching food items:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.post("/api/food-items", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;
      const schema = insertFoodItemSchema;

      const result = schema.safeParse({
        ...req.body,
        userId,
      });

      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: result.error.format() });
      }

      const insertResult = await db.insert(foodItems).values(result.data);
      const [newFoodItem] = await db
        .select()
        .from(foodItems)
        .where(eq(foodItems.id, insertResult[0].insertId));
      res.status(201).json(newFoodItem);
    } catch (error) {
      console.error("Error creating food item:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.get("/api/meals/by-date", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;
      const { date } = req.query;

      if (!date || typeof date !== "string") {
        return res.status(400).json({ message: "Date is required" });
      }

      // Get all meals for the user on the specified date
      const userMeals = await db
        .select()
        .from(meals)
        .where(
          and(eq(meals.userId, userId ?? 0), eq(meals.date, new Date(date)))
        );

      // Get food items for each meal
      const mealsWithItems = await Promise.all(
        userMeals.map(async (meal) => {
          const mealFoodItemsList = await db
            .select()
            .from(mealFoodItems)
            .where(eq(mealFoodItems.mealId, meal.id));

          // Get the food item details for each meal food item
          const items = await Promise.all(
            mealFoodItemsList.map(async (mealItem) => {
              const [foodItem] = await db
                .select()
                .from(foodItems)
                .where(eq(foodItems.id, mealItem.foodItemId));

              return {
                ...mealItem,
                ...foodItem,
              };
            })
          );

          return {
            ...meal,
            items,
          };
        })
      );

      res.json(mealsWithItems);
    } catch (error) {
      console.error("Error fetching meals:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.get("/api/meals/by-date-and-type", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;
      const { date, type } = req.query;

      if (
        !date ||
        typeof date !== "string" ||
        !type ||
        typeof type !== "string"
      ) {
        return res.status(400).json({ message: "Date and type are required" });
      }

      // Get meals of the specified type for the user on the specified date
      const userMeals = await db
        .select()
        .from(meals)
        .where(
          and(
            eq(meals.userId, userId ?? 0),
            eq(meals.date, new Date(date)),
            eq(meals.type, type)
          )
        );

      res.json(userMeals);
    } catch (error) {
      console.error("Error fetching meals by type:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.post("/api/meals", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;
      const schema = insertMealSchema;

      const result = schema.safeParse({
        ...req.body,
        userId,
      });

      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: result.error.format() });
      }

      const insertResult = await db.insert(meals).values(result.data);
      const [newMeal] = await db
        .select()
        .from(meals)
        .where(sql`${meals.id} = LAST_INSERT_ID()`);
      res.status(201).json(newMeal);
    } catch (error) {
      console.error("Error creating meal:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.post("/api/meals/:mealId/items", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;
      const { mealId } = req.params;
      const schema = insertMealFoodItemSchema;

      // Verify the meal belongs to the user
      const meal = await db
        .select()
        .from(meals)
        .where(
          and(eq(meals.id, parseInt(mealId)), eq(meals.userId, userId ?? 0))
        )
        .limit(1);

      if (!meal.length) {
        return res.status(404).json({ message: "Meal not found" });
      }

      const result = schema.safeParse({
        ...req.body,
        mealId: parseInt(mealId),
      });

      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: result.error.format() });
      }

      const insertResult = await db.insert(mealFoodItems).values(result.data);
      const [newMealItem] = await db
        .select()
        .from(mealFoodItems)
        .where(sql`${mealFoodItems.id} = LAST_INSERT_ID()`);
      res.status(201).json(newMealItem);
    } catch (error) {
      console.error("Error adding food to meal:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Exercise Routes
  app.get("/api/exercises", async (req, res) => {
    try {
      const db = getDb();
      const allExercises = await db.select().from(exercises);
      res.json(allExercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const db = getDb();
      const { id } = req.params;
      const exercise = await db
        .select()
        .from(exercises)
        .where(eq(exercises.id, parseInt(id)))
        .limit(1);

      if (!exercise.length) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      res.json(exercise[0]);
    } catch (error) {
      console.error("Error fetching exercise:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.post("/api/exercises", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;
      const schema = insertExerciseSchema;

      const result = schema.safeParse({ ...req.body, userId, isCustom: true });
      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: result.error.format() });
      }

      const insertResult = await db.insert(exercises).values(result.data);
      const [newExercise] = await db
        .select()
        .from(exercises)
        .where(sql`${exercises.id} = LAST_INSERT_ID()`);
      res.status(201).json(newExercise);
    } catch (error) {
      console.error("Error creating exercise:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Workout Program Routes
  app.get("/api/workout-programs", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;
      const programs = await db
        .select()
        .from(workoutPrograms)
        .where(eq(workoutPrograms.userId, userId ?? 0));
      res.json(programs);
    } catch (error) {
      console.error("Error fetching workout programs:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.post("/api/workout-programs", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;
      const schema = insertWorkoutProgramSchema;

      const result = schema.safeParse({ ...req.body, userId });
      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: result.error.format() });
      }

      const insertResult = await db.insert(workoutPrograms).values(result.data);
      const [newProgram] = await db
        .select()
        .from(workoutPrograms)
        .where(sql`${workoutPrograms.id} = LAST_INSERT_ID()`);
      res.status(201).json(newProgram);
    } catch (error) {
      console.error("Error creating workout program:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.get(
    "/api/workout-programs/:programId/days",
    requireAuth,
    async (req, res) => {
      try {
        const db = getDb();
        const { programId } = req.params;
        const userId = req.session.userId;

        // Verify the program belongs to the user
        const program = await db
          .select()
          .from(workoutPrograms)
          .where(
            and(
              eq(workoutPrograms.id, programId ? parseInt(programId) : 0),
              userId !== undefined && typeof userId === "number"
                ? eq(workoutPrograms.userId, userId)
                : sql`1 = 0`
            )
          )
          .limit(1);

        if (!userId || !program.length) {
          return res.status(404).json({ message: "Workout program not found" });
        }

        const days = await db
          .select()
          .from(workoutDays)
          .where(eq(workoutDays.programId, parseInt(programId)));

        res.json(days);
      } catch (error) {
        console.error("Error fetching workout days:", error);
        res.status(500).json({ message: "An error occurred" });
      }
    }
  );

  app.post(
    "/api/workout-programs/:programId/days",
    requireAuth,
    async (req, res) => {
      try {
        const db = getDb();
        const { programId } = req.params;
        const userId = req.session.userId;

        // Verify the program belongs to the user
        const program = await db
          .select()
          .from(workoutPrograms)
          .where(
            and(
              eq(workoutPrograms.id, programId ? parseInt(programId) : 0),
              userId !== undefined && typeof userId === "number"
                ? eq(workoutPrograms.userId, userId)
                : sql`1 = 0`
            )
          )
          .limit(1);

        if (!userId || !program.length) {
          return res.status(404).json({ message: "Workout program not found" });
        }

        const schema = insertWorkoutDaySchema;
        const result = schema.safeParse({
          ...req.body,
          programId: parseInt(programId),
        });

        if (!result.success) {
          return res
            .status(400)
            .json({ message: "Invalid input", errors: result.error.format() });
        }

        const insertResult = await db.insert(workoutDays).values(result.data);
        const [newDay] = await db
          .select()
          .from(workoutDays)
          .where(sql`${workoutDays.id} = LAST_INSERT_ID()`);
        res.status(201).json(newDay);
      } catch (error) {
        console.error("Error creating workout day:", error);
        res.status(500).json({ message: "An error occurred" });
      }
    }
  );

  app.get(
    "/api/workout-days/:dayId/exercises",
    requireAuth,
    async (req, res) => {
      try {
        const db = getDb();
        const { dayId } = req.params;
        const userId = req.session.userId;
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        // Get workout day
        const day = await db
          .select()
          .from(workoutDays)
          .where(eq(workoutDays.id, parseInt(dayId)))
          .limit(1);

        if (!day.length) {
          return res.status(404).json({ message: "Workout day not found" });
        }

        // Verify the program belongs to the user
        const program = await db
          .select()
          .from(workoutPrograms)
          .where(
            and(
              eq(workoutPrograms.id, day[0].programId),
              eq(workoutPrograms.userId, userId)
            )
          )
          .limit(1);

        if (!program.length) {
          return res.status(403).json({ message: "Unauthorized" });
        }

        // Get day exercises with exercise details
        const dayExercises = await db
          .select({
            id: workoutDayExercises.id,
            dayId: workoutDayExercises.dayId,
            exerciseId: workoutDayExercises.exerciseId,
            sets: workoutDayExercises.sets,
            reps: workoutDayExercises.reps,
            weight: workoutDayExercises.weight,
            restTime: workoutDayExercises.restTime,
            order: workoutDayExercises.order,
            exerciseName: exercises.name,
            muscleGroup: exercises.muscleGroup,
            imageUrl: exercises.imageUrl,
          })
          .from(workoutDayExercises)
          .leftJoin(exercises, eq(workoutDayExercises.exerciseId, exercises.id))
          .where(eq(workoutDayExercises.dayId, parseInt(dayId)))
          .orderBy(workoutDayExercises.order);

        res.json(dayExercises);
      } catch (error) {
        console.error("Error fetching day exercises:", error);
        res.status(500).json({ message: "An error occurred" });
      }
    }
  );

  app.post(
    "/api/workout-days/:dayId/exercises",
    requireAuth,
    async (req, res) => {
      try {
        const db = getDb();
        const { dayId } = req.params;
        const userId = req.session.userId;
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        // Get workout day
        const day = await db
          .select()
          .from(workoutDays)
          .where(eq(workoutDays.id, parseInt(dayId)))
          .limit(1);

        if (!day.length) {
          return res.status(404).json({ message: "Workout day not found" });
        }

        // Verify the program belongs to the user
        const program = await db
          .select()
          .from(workoutPrograms)
          .where(
            and(
              eq(workoutPrograms.id, day[0].programId),
              eq(workoutPrograms.userId, userId)
            )
          )
          .limit(1);

        if (!program.length) {
          return res.status(403).json({ message: "Unauthorized" });
        }

        const schema = insertWorkoutDayExerciseSchema;
        const result = schema.safeParse({
          ...req.body,
          dayId: parseInt(dayId),
        });

        if (!result.success) {
          return res
            .status(400)
            .json({ message: "Invalid input", errors: result.error.format() });
        }

        const insertResult = await db
          .insert(workoutDayExercises)
          .values(result.data);
        const [newDayExercise] = await db
          .select()
          .from(workoutDayExercises)
          .where(sql`${workoutDayExercises.id} = LAST_INSERT_ID()`);

        // Get exercise details
        if (!newDayExercise[0]?.exerciseId) {
          return res.status(400).json({ message: "Exercise ID is required" });
        }

        const exercise = await db
          .select()
          .from(exercises)
          .where(eq(exercises.id, newDayExercise[0].exerciseId))
          .limit(1);

        if (!exercise[0]) {
          return res.status(404).json({ message: "Exercise not found" });
        }

        res.status(201).json({
          ...newDayExercise[0],
          exerciseName: exercise[0].name,
          muscleGroup: exercise[0].muscleGroup,
          imageUrl: exercise[0].imageUrl,
        });
      } catch (error) {
        console.error("Error adding exercise to day:", error);
        res.status(500).json({ message: "An error occurred" });
      }
    }
  );

  // Workout Session Routes
  app.post("/api/workout-sessions", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const schema = insertWorkoutSessionSchema;
      const result = schema.safeParse({ ...req.body, userId });
      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: result.error.format() });
      }

      const insertResult = await db.insert(workoutSessions).values(result.data);
      const [newSession] = await db
        .select()
        .from(workoutSessions)
        .where(sql`${workoutSessions.id} = LAST_INSERT_ID()`);

      if (!newSession[0]) {
        return res.status(500).json({ message: "Failed to create session" });
      }

      res.status(201).json(newSession[0]);
    } catch (error) {
      console.error("Error creating workout session:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.get("/api/workout-sessions/recent", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;

      const recentSessions = await db
        .select({
          id: workoutSessions.id,
          date: workoutSessions.date,
          duration: workoutSessions.duration,
          complete: workoutSessions.complete,
          programName: workoutPrograms.name,
          dayName: workoutDays.name,
        })
        .from(workoutSessions)
        .leftJoin(
          workoutPrograms,
          eq(workoutSessions.programId, workoutPrograms.id)
        )
        .leftJoin(workoutDays, eq(workoutSessions.dayId, workoutDays.id))
        .where(eq(workoutSessions.userId, userId))
        .orderBy(desc(workoutSessions.date))
        .limit(10);

      res.json(recentSessions);
    } catch (error) {
      console.error("Error fetching recent sessions:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.post(
    "/api/workout-sessions/:sessionId/sets",
    requireAuth,
    async (req, res) => {
      try {
        const db = getDb();
        const { sessionId } = req.params;
        const userId = req.session.userId;

        // Verify the session belongs to the user
        const session = await db
          .select()
          .from(workoutSessions)
          .where(
            and(
              eq(workoutSessions.id, parseInt(sessionId)),
              eq(workoutSessions.userId, userId)
            )
          )
          .limit(1);

        if (!session.length) {
          return res.status(404).json({ message: "Workout session not found" });
        }

        const schema = insertWorkoutSetLogSchema;
        const result = schema.safeParse({
          ...req.body,
          sessionId: parseInt(sessionId),
        });

        if (!result.success) {
          return res
            .status(400)
            .json({ message: "Invalid input", errors: result.error.format() });
        }

        const newSetLog = await db
          .insert(workoutSetLogs)
          .values(result.data)
          .returning();
        res.status(201).json(newSetLog[0]);
      } catch (error) {
        console.error("Error logging workout set:", error);
        res.status(500).json({ message: "An error occurred" });
      }
    }
  );

  // Food Items Routes
  app.get("/api/food-items", async (req, res) => {
    try {
      const db = getDb();
      const { query } = req.query;

      let results = [];

      if (query && typeof query === "string") {
        results = await db
          .select()
          .from(foodItems)
          .where(
            // Basic search functionality - can be improved with full-text search
            (q) =>
              q.or(
                eq(foodItems.isCustom, false),
                eq(foodItems.userId, req.session.userId || 0)
              )
          )
          .limit(50);
      } else {
        // Return some common items if no query
        results = await db
          .select()
          .from(foodItems)
          .where(eq(foodItems.isCustom, false))
          .limit(50);
      }

      res.json(results);
    } catch (error) {
      console.error("Error searching food items:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.post("/api/food-items", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;
      const schema = insertFoodItemSchema;

      const result = schema.safeParse({ ...req.body, userId, isCustom: true });
      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: result.error.format() });
      }

      const insertResult = await db.insert(foodItems).values(result.data);
      const [newFoodItem] = await db
        .select()
        .from(foodItems)
        .where(eq(foodItems.id, insertResult[0].insertId));
      res.status(201).json(newFoodItem);
    } catch (error) {
      console.error("Error creating food item:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Meal Routes
  app.get("/api/meals/by-date", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;
      const { date } = req.query;

      if (!date || typeof date !== "string") {
        return res.status(400).json({ message: "Date is required" });
      }

      // Get meals for the specified date
      const userMeals = await db
        .select()
        .from(meals)
        .where(and(eq(meals.userId, userId), eq(meals.date, new Date(date))));

      // Get food items for each meal
      const mealsWithItems = await Promise.all(
        userMeals.map(async (meal) => {
          const items = await db
            .select({
              id: mealFoodItems.id,
              mealId: mealFoodItems.mealId,
              foodItemId: mealFoodItems.foodItemId,
              servingSize: mealFoodItems.servingSize,
              servingUnit: mealFoodItems.servingUnit,
              customServingDescription: mealFoodItems.customServingDescription,
              name: foodItems.name,
              brand: foodItems.brand,
              calories: foodItems.calories,
              protein: foodItems.protein,
              carbs: foodItems.carbs,
              fat: foodItems.fat,
            })
            .from(mealFoodItems)
            .leftJoin(foodItems, eq(mealFoodItems.foodItemId, foodItems.id))
            .where(eq(mealFoodItems.mealId, meal.id));

          return {
            ...meal,
            items,
          };
        })
      );

      res.json(mealsWithItems);
    } catch (error) {
      console.error("Error fetching meals by date:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.post("/api/meals", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;
      const schema = insertMealSchema;

      const result = schema.safeParse({ ...req.body, userId });
      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: result.error.format() });
      }

      const insertResult = await db.insert(meals).values(result.data);
      const [newMeal] = await db
        .select()
        .from(meals)
        .where(sql`${meals.id} = LAST_INSERT_ID()`);
      res.status(201).json(newMeal);
    } catch (error) {
      console.error("Error creating meal:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.post("/api/meals/:mealId/items", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const { mealId } = req.params;
      const userId = req.session.userId;

      // Verify the meal belongs to the user
      const meal = await db
        .select()
        .from(meals)
        .where(and(eq(meals.id, parseInt(mealId)), eq(meals.userId, userId)))
        .limit(1);

      if (!meal.length) {
        return res.status(404).json({ message: "Meal not found" });
      }

      const schema = insertMealFoodItemSchema;
      const result = schema.safeParse({
        ...req.body,
        mealId: parseInt(mealId),
      });

      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: result.error.format() });
      }

      const newMealItem = await db
        .insert(mealFoodItems)
        .values(result.data)
        .returning();

      // Get food item details
      const foodItem = await db
        .select()
        .from(foodItems)
        .where(eq(foodItems.id, newMealItem[0].foodItemId))
        .limit(1);

      res.status(201).json({
        ...newMealItem[0],
        name: foodItem[0]?.name,
        brand: foodItem[0]?.brand,
        calories: foodItem[0]?.calories,
        protein: foodItem[0]?.protein,
        carbs: foodItem[0]?.carbs,
        fat: foodItem[0]?.fat,
      });
    } catch (error) {
      console.error("Error adding food to meal:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Nutrition Goals Routes
  app.get("/api/nutrition-goals", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;

      const goals = await db
        .select()
        .from(nutritionGoals)
        .where(
          and(
            eq(nutritionGoals.userId, userId),
            eq(nutritionGoals.active, true)
          )
        )
        .orderBy(desc(nutritionGoals.createdAt))
        .limit(1);

      if (!goals.length) {
        return res
          .status(404)
          .json({ message: "No active nutrition goals found" });
      }

      res.json(goals[0]);
    } catch (error) {
      console.error("Error fetching nutrition goals:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.post("/api/nutrition-goals", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;
      const schema = insertNutritionGoalSchema;

      const result = schema.safeParse({ ...req.body, userId, active: true });
      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: result.error.format() });
      }

      // Deactivate previous goals
      await db
        .update(nutritionGoals)
        .set({ active: false })
        .where(
          and(
            eq(nutritionGoals.userId, userId),
            eq(nutritionGoals.active, true)
          )
        );

      // Create new goal
      const newGoal = await db
        .insert(nutritionGoals)
        .values(result.data)
        .returning();
      res.status(201).json(newGoal[0]);
    } catch (error) {
      console.error("Error creating nutrition goal:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Body Measurements Routes
  app.get("/api/body-measurements/recent", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;

      const recentMeasurements = await db
        .select()
        .from(bodyMeasurements)
        .where(eq(bodyMeasurements.userId, userId))
        .orderBy(desc(bodyMeasurements.date))
        .limit(10);

      res.json(recentMeasurements);
    } catch (error) {
      console.error("Error fetching recent measurements:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.get("/api/body-measurements/range", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;
      const { startDate, endDate } = req.query;

      if (
        !startDate ||
        !endDate ||
        typeof startDate !== "string" ||
        typeof endDate !== "string"
      ) {
        return res
          .status(400)
          .json({ message: "Valid start and end dates are required" });
      }

      const measurements = await db
        .select()
        .from(bodyMeasurements)
        .where(
          and(
            eq(bodyMeasurements.userId, userId),
            gte(bodyMeasurements.date, startDate),
            lte(bodyMeasurements.date, endDate)
          )
        )
        .orderBy(bodyMeasurements.date);

      res.json(measurements);
    } catch (error) {
      console.error("Error fetching measurements in range:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.post("/api/body-measurements", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;
      const schema = insertBodyMeasurementSchema;

      const result = schema.safeParse({ ...req.body, userId });
      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: result.error.format() });
      }

      const newMeasurement = await db
        .insert(bodyMeasurements)
        .values(result.data)
        .returning();
      res.status(201).json(newMeasurement[0]);
    } catch (error) {
      console.error("Error creating body measurement:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Progress Photos Routes
  app.get("/api/progress-photos", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;

      const photos = await db
        .select()
        .from(progressPhotos)
        .where(eq(progressPhotos.userId, userId))
        .orderBy(desc(progressPhotos.date));

      res.json(photos);
    } catch (error) {
      console.error("Error fetching progress photos:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  app.post("/api/progress-photos", requireAuth, async (req, res) => {
    try {
      const db = getDb();
      const userId = req.session.userId;
      const schema = insertProgressPhotoSchema;

      const result = schema.safeParse({ ...req.body, userId });
      if (!result.success) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: result.error.format() });
      }

      const newPhoto = await db
        .insert(progressPhotos)
        .values(result.data)
        .returning();
      res.status(201).json(newPhoto[0]);
    } catch (error) {
      console.error("Error adding progress photo:", error);
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
