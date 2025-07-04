import {
  users as usersTable,
  quizzes,
  quizTemplates,
  quizResponses,
  quizAnalytics,
  type User,
  type UpsertUser,
  type Quiz,
  type InsertQuiz,
  type QuizTemplate,
  type InsertQuizTemplate,
  type QuizResponse,
  type InsertQuizResponse,
  type QuizAnalytics,
  type InsertQuizAnalytics,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  updateUserPlan(userId: string, plan: string, subscriptionStatus?: string): Promise<User>;

  // Admin operations
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User>;
  deleteUser(userId: string): Promise<void>;

  // Quiz operations
  getUserQuizzes(userId: string): Promise<Quiz[]>;
  getQuiz(id: string): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuiz(id: string, updates: Partial<InsertQuiz>): Promise<Quiz>;
  deleteQuiz(id: string): Promise<void>;

  // Quiz template operations
  getQuizTemplates(): Promise<QuizTemplate[]>;
  getQuizTemplate(id: number): Promise<QuizTemplate | undefined>;
  createQuizTemplate(template: InsertQuizTemplate): Promise<QuizTemplate>;

  // Quiz response operations
  getQuizResponses(quizId: string): Promise<QuizResponse[]>;
  createQuizResponse(response: InsertQuizResponse): Promise<QuizResponse>;

  // Analytics operations
  getQuizAnalytics(quizId: string, startDate?: Date, endDate?: Date): Promise<QuizAnalytics[]>;
  updateQuizAnalytics(quizId: string, analytics: InsertQuizAnalytics): Promise<void>;
  getDashboardStats(userId: string): Promise<{
    totalQuizzes: number;
    totalLeads: number;
    totalViews: number;
    avgConversionRate: number;
  }>;

    // JWT Auth methods
  getUserByEmail(email: string): Promise<User | null>;
  createUserWithPassword(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<User>;
  storeRefreshToken(userId: string, refreshToken: string): Promise<void>;
  isValidRefreshToken(userId: string, refreshToken: string): Promise<boolean>;
  invalidateRefreshTokens(userId: string): Promise<void>;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  password?: string; // For JWT auth
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plan: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const rows = await db.select().from(usersTable).where(eq(usersTable.email, email));
    return rows[0] || null;
  }

  async createUserWithPassword(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    const newUser = {
      id: crypto.randomUUID(),
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      plan: "free",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(usersTable).values(newUser).returning();
    return newUser;
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    // Store in a refresh_tokens table or add to users table
    // For simplicity, we'll store in a simple in-memory cache
    // In production, use Redis or database table
    refreshTokenStore.set(userId, refreshToken);
  }

  async isValidRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const storedToken = refreshTokenStore.get(userId);
    return storedToken === refreshToken;
  }

  async invalidateRefreshTokens(userId: string): Promise<void> {
    refreshTokenStore.delete(userId);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(usersTable)
      .values(userData)
      .onConflictDoUpdate({
        target: usersTable.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(usersTable)
      .set({ 
        stripeCustomerId, 
        stripeSubscriptionId,
        updatedAt: new Date()
      })
      .where(eq(usersTable.id, userId))
      .returning();
    return user;
  }

  async updateUserPlan(userId: string, plan: string, subscriptionStatus?: string): Promise<User> {
    const updateData: any = {
      plan,
      updatedAt: new Date(),
    };

    if (subscriptionStatus) {
      updateData.subscriptionStatus = subscriptionStatus;
    }

    const [user] = await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, userId))
      .returning();
    return user;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(usersTable).orderBy(usersTable.createdAt);
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await db
      .update(usersTable)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId))
      .returning();
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(usersTable).where(eq(usersTable.id, userId));
  }

  // JWT Auth implementations
  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await db.select().from(usersTable).where(eq(usersTable.email, email));
    return users[0];
  }

  async createUserWithPassword(userData: { email: string; password: string; firstName: string; lastName: string }): Promise<User> {
    const userId = crypto.randomUUID();
    const user = {
      id: userId,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: "user" as const,
      plan: "free" as const,
    };

    await db.insert(usersTable).values(user);
    return user as User;
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await db.update(usersTable)
      .set({ refreshToken })
      .where(eq(usersTable.id, userId));
  }

  async isValidRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const users = await db.select().from(usersTable)
      .where(and(eq(usersTable.id, userId), eq(usersTable.refreshToken, refreshToken)));
    return users.length > 0;
  }

  async invalidateRefreshTokens(userId: string): Promise<void> {
    await db.update(usersTable)
      .set({ refreshToken: null })
      .where(eq(usersTable.id, userId));
  }

  async getUserByRefreshToken(refreshToken: string): Promise<User | undefined> {
    const users = await db.select().from(usersTable)
      .where(eq(usersTable.refreshToken, refreshToken));
    return users[0];
  }

  async clearRefreshTokens(userId: string): Promise<void> {
    await db.update(usersTable)
      .set({ refreshToken: null })
      .where(eq(usersTable.id, userId));
  }

  // Quiz operations
  async getUserQuizzes(userId: string): Promise<Quiz[]> {
    return await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.userId, userId))
      .orderBy(desc(quizzes.createdAt));
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
  }

  async updateQuiz(id: string, updates: Partial<InsertQuiz>): Promise<Quiz> {
    const [quiz] = await db
      .update(quizzes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(quizzes.id, id))
      .returning();
    return quiz;
  }

  async deleteQuiz(id: string): Promise<void> {
    await db.delete(quizzes).where(eq(quizzes.id, id));
  }

  // Quiz template operations
  async getQuizTemplates(): Promise<QuizTemplate[]> {
    return await db
      .select()
      .from(quizTemplates)
      .where(eq(quizTemplates.isActive, true))
      .orderBy(quizTemplates.name);
  }

  async getQuizTemplate(id: number): Promise<QuizTemplate | undefined> {
    const [template] = await db
      .select()
      .from(quizTemplates)
      .where(eq(quizTemplates.id, id));
    return template;
  }

  async createQuizTemplate(template: InsertQuizTemplate): Promise<QuizTemplate> {
    const [newTemplate] = await db
      .insert(quizTemplates)
      .values(template)
      .returning();
    return newTemplate;
  }

  // Quiz response operations
  async getQuizResponses(quizId: string): Promise<QuizResponse[]> {
    return await db
      .select()
      .from(quizResponses)
      .where(eq(quizResponses.quizId, quizId))
      .orderBy(desc(quizResponses.completedAt));
  }

  async createQuizResponse(response: InsertQuizResponse): Promise<QuizResponse> {
    const [newResponse] = await db
      .insert(quizResponses)
      .values(response)
      .returning();
    return newResponse;
  }

  // Analytics operations
  async getQuizAnalytics(quizId: string, startDate?: Date, endDate?: Date): Promise<QuizAnalytics[]> {
    let whereConditions = [eq(quizAnalytics.quizId, quizId)];

    if (startDate && endDate) {
      whereConditions.push(
        gte(quizAnalytics.date, startDate),
        lte(quizAnalytics.date, endDate)
      );
    }

    return await db
      .select()
      .from(quizAnalytics)
      .where(and(...whereConditions))
      .orderBy(desc(quizAnalytics.date));
  }

  async updateQuizAnalytics(quizId: string, analytics: InsertQuizAnalytics): Promise<void> {
    // Simply insert a new analytics record for each view
    await db
      .insert(quizAnalytics)
      .values({ 
        quizId,
        date: new Date(),
        views: analytics.views || 0,
        starts: analytics.starts || 0,
        completions: analytics.completions || 0,
        leads: analytics.leads || 0,
        conversionRate: analytics.conversionRate || "0"
      });
  }

  async getDashboardStats(userId: string): Promise<{
    totalQuizzes: number;
    totalLeads: number;
    totalViews: number;
    avgConversionRate: number;
  }> {
    // Get user's quizzes count
    const [quizCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(quizzes)
      .where(eq(quizzes.userId, userId));

    // Get total leads from user's quizzes
    const [leadCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(quizResponses)
      .innerJoin(quizzes, eq(quizResponses.quizId, quizzes.id))
      .where(eq(quizzes.userId, userId));

    // Get total views and conversion rate
    const [analytics] = await db
      .select({
        totalViews: sql<number>`sum(${quizAnalytics.views})`,
        totalCompletions: sql<number>`sum(${quizAnalytics.completions})`,
      })
      .from(quizAnalytics)
      .innerJoin(quizzes, eq(quizAnalytics.quizId, quizzes.id))
      .where(eq(quizzes.userId, userId));

    const totalViews = analytics?.totalViews || 0;
    const totalCompletions = analytics?.totalCompletions || 0;
    const avgConversionRate = totalViews > 0 ? (totalCompletions / totalViews) * 100 : 0;

    return {
      totalQuizzes: quizCount.count,
      totalLeads: leadCount.count,
      totalViews,
      avgConversionRate: Number(avgConversionRate.toFixed(2)),
    };
  }
}

// Simple in-memory refresh token store (use Redis in production)
const refreshTokenStore = new Map<string, string>();
export const storage = new DatabaseStorage();