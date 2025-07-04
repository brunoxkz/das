import {
  users,
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
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
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
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId, 
        stripeSubscriptionId,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
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
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
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
    let query = db
      .select()
      .from(quizAnalytics)
      .where(eq(quizAnalytics.quizId, quizId));

    if (startDate && endDate) {
      query = query.where(
        and(
          eq(quizAnalytics.quizId, quizId),
          gte(quizAnalytics.date, startDate),
          lte(quizAnalytics.date, endDate)
        )
      );
    }

    return await query.orderBy(desc(quizAnalytics.date));
  }

  async updateQuizAnalytics(quizId: string, analytics: InsertQuizAnalytics): Promise<void> {
    await db
      .insert(quizAnalytics)
      .values({ ...analytics, quizId })
      .onConflictDoUpdate({
        target: [quizAnalytics.quizId, quizAnalytics.date],
        set: analytics,
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

export const storage = new DatabaseStorage();
