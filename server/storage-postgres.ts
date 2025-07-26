import { db } from "./db-postgres";
import { sql, eq, and, or, desc, asc, count, gte, lte, inArray } from 'drizzle-orm';
import { 
  users, quizzes, quizResponses, responseVariables, quizAnalytics, 
  emailCampaigns, emailTemplates, emailLogs, smsCampaigns, smsLogs,
  whatsappCampaigns, whatsappLogs, pushSubscriptions, pushNotificationLogs,
  creditTransactions, subscriptionPlans, subscriptionTransactions,
  tasks, projects, emails, recurringTasks,
  type User, type UpsertUser, type InsertQuiz, type Quiz,
  type InsertQuizResponse, type QuizResponse,
  type InsertEmailCampaign, type EmailCampaign,
  type InsertSmsCampaign, type SmsCampaign,
  type InsertWhatsappCampaign, type WhatsappCampaign,
  type InsertPushSubscription, type PushSubscription,
  type InsertCreditTransaction, type CreditTransaction,
  type InsertTask, type Task,
  type InsertProject, type Project,
  type InsertEmail, type Email,
  type InsertRecurringTask, type RecurringTask
} from "../shared/schema-postgres";
import { nanoid } from "nanoid";

// PostgreSQL Storage - Supports 1000+ concurrent users with connection pooling
export class PostgreSQLStorage {
  
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...userData,
      id: userData.id || nanoid()
    }).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db.update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserCredits(userId: string, creditType: string, amount: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    const currentCredits = user[`${creditType}Credits` as keyof User] as number || 0;
    const newCredits = Math.max(0, currentCredits + amount);

    await db.update(users)
      .set({ [`${creditType}Credits`]: newCredits, updatedAt: new Date() })
      .where(eq(users.id, userId));

    // Log credit transaction
    await db.insert(creditTransactions).values({
      userId,
      type: creditType,
      amount,
      description: amount > 0 ? `Credits added: ${creditType}` : `Credits used: ${creditType}`,
      balanceBefore: currentCredits,
      balanceAfter: newCredits,
    });
  }

  // Quiz operations
  async createQuiz(quizData: InsertQuiz): Promise<Quiz> {
    const [quiz] = await db.insert(quizzes).values({
      ...quizData,
      id: quizData.id || nanoid()
    }).returning();
    return quiz;
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async getUserQuizzes(userId: string): Promise<Quiz[]> {
    return await db.select().from(quizzes)
      .where(eq(quizzes.userId, userId))
      .orderBy(desc(quizzes.createdAt));
  }

  async updateQuiz(id: string, quizData: Partial<InsertQuiz>): Promise<Quiz> {
    const [quiz] = await db.update(quizzes)
      .set({ ...quizData, updatedAt: new Date() })
      .where(eq(quizzes.id, id))
      .returning();
    return quiz;
  }

  async deleteQuiz(id: string): Promise<void> {
    // Delete related responses first
    await db.delete(quizResponses).where(eq(quizResponses.quizId, id));
    // Delete quiz
    await db.delete(quizzes).where(eq(quizzes.id, id));
  }

  // Quiz Response operations
  async createQuizResponse(responseData: InsertQuizResponse): Promise<QuizResponse> {
    const [response] = await db.insert(quizResponses).values({
      ...responseData,
      id: responseData.id || nanoid()
    }).returning();
    return response;
  }

  async getQuizResponses(quizId: string, limit: number = 100, offset: number = 0): Promise<QuizResponse[]> {
    return await db.select().from(quizResponses)
      .where(eq(quizResponses.quizId, quizId))
      .orderBy(desc(quizResponses.submittedAt))
      .limit(limit)
      .offset(offset);
  }

  async getQuizResponsesCount(quizId: string): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(quizResponses)
      .where(eq(quizResponses.quizId, quizId));
    return result.count;
  }

  // Dashboard Statistics
  async getDashboardStats(userId: string): Promise<any> {
    const [quizCount] = await db.select({ count: count() })
      .from(quizzes)
      .where(eq(quizzes.userId, userId));

    const [responseCount] = await db.select({ count: count() })
      .from(quizResponses)
      .leftJoin(quizzes, eq(quizResponses.quizId, quizzes.id))
      .where(eq(quizzes.userId, userId));

    const [taskCount] = await db.select({ count: count() })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.status, 'pending')));

    const [emailCount] = await db.select({ count: count() })
      .from(emails)
      .where(and(eq(emails.userId, userId), eq(emails.isRead, false)));

    return {
      totalQuizzes: quizCount.count,
      totalResponses: responseCount.count,
      pendingTasks: taskCount.count,
      unreadEmails: emailCount.count,
    };
  }
}

// Export singleton instance
export const storage = new PostgreSQLStorage();