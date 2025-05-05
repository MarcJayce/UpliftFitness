import { compare, hash } from "bcrypt";
import { getDb } from "./db";
import { users, type User } from "@shared/schema";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = 10;

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await compare(password, hashedPassword);
}

// Create a new user
export async function createUser(
  username: string,
  email: string,
  password: string
): Promise<User> {
  try {
    // Validate inputs
    if (!username || !email || !password) {
      throw new Error("All fields are required");
    }
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const db = getDb();
    // Check if user exists
    const existingUser =
      (await getUserByUsername(username)) || (await getUserByEmail(email));
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(password);

    // Insert user with proper typing
    const [insertResult] = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
      })
      .returning();

    if (!insertResult) {
      throw new Error("Failed to create user");
    }

    const newUser = insertResult;
    if (!newUser) {
      throw new Error("Failed to retrieve created user");
    }

    return newUser;
  } catch (error) {
    console.error("User creation failed:", error);
    throw error;
  }
}

// Get user by username
export async function getUserByUsername(
  username: string
): Promise<User | undefined> {
  const db = getDb();
  const result = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  return result[0];
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = getDb();
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result[0];
}

// Get user by ID
export async function getUserById(id: number): Promise<User | undefined> {
  const db = getDb();
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

// Update user profile
export async function updateUserProfile(
  id: number,
  userData: Partial<User>
): Promise<User | undefined> {
  const db = getDb();

  // Remove restricted fields that shouldn't be directly updated
  const { password, id: userId, ...updateData } = userData;

  await db.update(users).set(updateData).where(eq(users.id, id));

  return await getUserById(id);
}
