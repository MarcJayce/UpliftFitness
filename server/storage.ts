import { users, type User, type InsertUser } from "@shared/schema";
import { eq } from 'drizzle-orm';
import { getDb } from './db';

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

// Implementation using PostgreSQL database
export class DbStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      const db = getDb();
      const results = await db.select().from(users).where(eq(users.id, id));
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const db = getDb();
      const results = await db.select().from(users).where(eq(users.username, username));
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const db = getDb();
      const now = new Date();
      const userWithCreatedAt = {
        ...insertUser,
        createdAt: now
      };
      
      // For PostgreSQL, .returning() works correctly
      const results = await db.insert(users).values(userWithCreatedAt).returning();
      
      if (results.length === 0) {
        throw new Error('Failed to create user');
      }
      return results[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
}

// Implementation using in-memory storage (for fallback or testing)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const now = new Date();
    // Making sure all required fields are present with proper types
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now,
      fullName: insertUser.fullName || null,
      age: insertUser.age || null,
      gender: insertUser.gender || null,
      height: insertUser.height || null,
      weight: insertUser.weight || null,
      bodyFat: insertUser.bodyFat || null,
      activityLevel: insertUser.activityLevel || null,
      goal: insertUser.goal || null,
      units: insertUser.units || 'metric',
      notifications: insertUser.notifications !== undefined ? insertUser.notifications : true
    };
    this.users.set(id, user);
    return user;
  }
}

// Use database storage
export const storage = new DbStorage();
