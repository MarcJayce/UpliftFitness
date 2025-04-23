import { compare, hash } from 'bcrypt';
import { getDb } from './db';
import { users, type User } from '@shared/schema';
import { eq } from 'drizzle-orm';

const SALT_ROUNDS = 10;

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword);
}

// Create a new user
export async function createUser(
  username: string,
  email: string,
  password: string
): Promise<User> {
  const db = getDb();
  const hashedPassword = await hashPassword(password);

  const newUsers = await db.insert(users).values({
    username,
    email,
    password: hashedPassword,
  }).returning();

  return newUsers[0];
}

// Get user by username
export async function getUserByUsername(username: string): Promise<User | undefined> {
  const db = getDb();
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result[0];
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = getDb();
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

// Get user by ID
export async function getUserById(id: number): Promise<User | undefined> {
  const db = getDb();
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

// Update user profile
export async function updateUserProfile(id: number, userData: Partial<User>): Promise<User | undefined> {
  const db = getDb();
  
  // Remove restricted fields that shouldn't be directly updated
  const { password, id: userId, ...updateData } = userData;
  
  await db.update(users)
    .set(updateData)
    .where(eq(users.id, id));
  
  return await getUserById(id);
}
