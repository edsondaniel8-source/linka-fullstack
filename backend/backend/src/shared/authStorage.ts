import {
  users,
} from "@shared/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

// Use os tipos inferidos do Drizzle ORM
type User = InferSelectModel<typeof users>;
type UpsertUser = InferInsertModel<typeof users>;

// Interface for authentication storage operations
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(userData: any): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
}

export class DatabaseAuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user as User | undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    // Note: Using id field as Firebase UID for now
    const [user] = await db.select().from(users).where(eq(users.id, firebaseUid));
    return user as User | undefined;
  }

  async createUser(userData: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user as User;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user as User;
  }
}

export const authStorage = new DatabaseAuthStorage();