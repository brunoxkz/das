import { db } from "./db-sqlite";
import { 
  users, quizzes, quizTemplates, quizResponses, quizAnalytics, emailCampaigns, emailTemplates, smsTransactions, smsCampaigns, smsLogs,
  type User, type UpsertUser, type InsertQuiz, type Quiz,
  type InsertQuizTemplate, type QuizTemplate,
  type InsertQuizResponse, type QuizResponse,
  type InsertQuizAnalytics, type QuizAnalytics,
  type InsertEmailCampaign, type EmailCampaign,
  type InsertEmailTemplate, type EmailTemplate
} from "../shared/schema-sqlite";
import { eq, desc, and, gte, lte, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
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

  // Email Campaign operations
  getEmailCampaigns(userId: string): Promise<EmailCampaign[]>;
  getEmailCampaign(id: string): Promise<EmailCampaign | undefined>;
  createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign>;
  updateEmailCampaign(id: string, updates: Partial<InsertEmailCampaign>): Promise<EmailCampaign>;
  deleteEmailCampaign(id: string): Promise<void>;

  // Email Template operations
  getEmailTemplates(userId: string): Promise<EmailTemplate[]>;
  getEmailTemplate(id: string): Promise<EmailTemplate | undefined>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: string, updates: Partial<InsertEmailTemplate>): Promise<EmailTemplate>;
  deleteEmailTemplate(id: string): Promise<void>;

  // Email campaign sending operations
  getQuizResponsesForEmail(quizId: string, targetAudience: string): Promise<QuizResponse[]>;
  extractEmailsFromResponses(responses: QuizResponse[]): string[];

  // SMS Credits methods
  updateUserSmsCredits(userId: string, newCredits: number): Promise<User>;
  createSmsTransaction(transaction: { userId: string; type: string; amount: number; description?: string }): Promise<void>;
  getSmsTransactions(userId: string): Promise<any[]>;

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

export class SQLiteStorage implements IStorage {
  constructor() {
    // Inserir usuários padrão se não existirem
    this.createDefaultUsers();
  }

  private async createDefaultUsers() {
    try {
      const existingAdmin = await this.getUserByEmail('admin@vendzz.com');
      if (!existingAdmin) {
        await this.createUserWithPassword({
          email: 'admin@vendzz.com',
          password: 'admin123',
          firstName: 'Admin',
          lastName: 'Vendzz'
        });
        
        const admin = await this.getUserByEmail('admin@vendzz.com');
        if (admin) {
          await this.updateUserRole(admin.id, 'admin');
          await this.updateUserPlan(admin.id, 'enterprise');
          await this.updateUserSmsCredits(admin.id, 100);
          
          // Criar quizzes de exemplo para testar o cloaker
          await this.createExampleQuizzes(admin.id);
        }
      }

      const existingEditor = await this.getUserByEmail('editor@vendzz.com');
      if (!existingEditor) {
        await this.createUserWithPassword({
          email: 'editor@vendzz.com',
          password: 'editor123',
          firstName: 'Editor',
          lastName: 'Vendzz'
        });
        
        const editor = await this.getUserByEmail('editor@vendzz.com');
        if (editor) {
          await this.updateUserRole(editor.id, 'editor');
          await this.updateUserPlan(editor.id, 'premium');
        }
      }

      console.log('✅ Default users created successfully');
    } catch (error) {
      console.log('⚠️ Error creating default users:', error);
    }
  }

  private async createExampleQuizzes(userId: string) {
    try {
      // Verificar se já existem quizzes para este usuário
      const existingQuizzes = await this.getUserQuizzes(userId);
      if (existingQuizzes.length > 0) {
        return; // Já tem quizzes, não precisa criar
      }

      console.log('📝 Creating example quizzes for admin user...');

      const exampleQuizzes = [
        {
          id: nanoid(),
          title: 'Quiz de Emagrecimento Rápido',
          description: 'Descubra seu perfil metabólico e receba um plano personalizado',
          userId,
          structure: {
            questions: [
              {
                id: 1,
                type: 'multiple_choice',
                question: 'Qual é seu principal objetivo?',
                options: ['Perder peso', 'Ganhar massa muscular', 'Melhorar saúde geral']
              }
            ],
            settings: {
              theme: 'green',
              showProgressBar: true,
              collectEmail: true,
              collectName: true,
              collectPhone: false
            }
          },
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: nanoid(),
          title: 'Quiz de Produtos Digitais',
          description: 'Encontre o curso ideal para sua jornada empreendedora',
          userId,
          structure: {
            questions: [
              {
                id: 1,
                type: 'multiple_choice',
                question: 'Qual sua experiência com negócios online?',
                options: ['Iniciante', 'Intermediário', 'Avançado']
              }
            ],
            settings: {
              theme: 'blue',
              showProgressBar: true,
              collectEmail: true,
              collectName: true,
              collectPhone: true
            }
          },
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: nanoid(),
          title: 'Quiz de Investimentos',
          description: 'Descubra seu perfil de investidor e estratégias ideais',
          userId,
          structure: {
            questions: [
              {
                id: 1,
                type: 'multiple_choice',
                question: 'Qual seu conhecimento sobre investimentos?',
                options: ['Iniciante', 'Básico', 'Intermediário', 'Avançado']
              }
            ],
            settings: {
              theme: 'purple',
              showProgressBar: true,
              collectEmail: true,
              collectName: true,
              collectPhone: false
            }
          },
          isPublished: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Inserir os quizzes de exemplo
      for (const quiz of exampleQuizzes) {
        await db.insert(quizzes).values(quiz);
      }

      console.log('✅ Example quizzes created successfully');
    } catch (error) {
      console.error('Error creating example quizzes:', error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  async createUserWithPassword(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userId = nanoid();

    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        plan: 'free',
        role: 'user',
      })
      .returning();

    return user;
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await db.update(users)
      .set({ refreshToken })
      .where(eq(users.id, userId));
  }

  async isValidRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));
    
    return user?.refreshToken === refreshToken;
  }

  async invalidateRefreshTokens(userId: string): Promise<void> {
    await db.update(users)
      .set({ refreshToken: null })
      .where(eq(users.id, userId));
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await this.getUserByEmail(userData.email);
    
    if (existingUser) {
      const [updatedUser] = await db.update(users)
        .set({
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      return updatedUser;
    } else {
      const userId = nanoid();
      const [newUser] = await db.insert(users)
        .values({
          id: userId,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          plan: 'free',
          role: 'user',
        })
        .returning();
      return newUser;
    }
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ 
        stripeCustomerId, 
        stripeSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateUserPlan(userId: string, plan: string, subscriptionStatus?: string): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ 
        plan, 
        subscriptionStatus,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  async getUserQuizzes(userId: string): Promise<Quiz[]> {
    return await db.select()
      .from(quizzes)
      .where(eq(quizzes.userId, userId))
      .orderBy(desc(quizzes.updatedAt));
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz || undefined;
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const quizId = nanoid();
    const [newQuiz] = await db.insert(quizzes)
      .values({
        id: quizId,
        ...quiz,
      })
      .returning();
    return newQuiz;
  }

  async updateQuiz(id: string, updates: Partial<InsertQuiz>): Promise<Quiz> {
    const [updatedQuiz] = await db.update(quizzes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(quizzes.id, id))
      .returning();
    return updatedQuiz;
  }

  async deleteQuiz(id: string): Promise<void> {
    await db.delete(quizzes).where(eq(quizzes.id, id));
  }

  async getQuizTemplates(): Promise<QuizTemplate[]> {
    return await db.select().from(quizTemplates).orderBy(desc(quizTemplates.createdAt));
  }

  async getQuizTemplate(id: number): Promise<QuizTemplate | undefined> {
    const [template] = await db.select().from(quizTemplates).where(eq(quizTemplates.id, id));
    return template || undefined;
  }

  async createQuizTemplate(template: InsertQuizTemplate): Promise<QuizTemplate> {
    const [newTemplate] = await db.insert(quizTemplates)
      .values(template)
      .returning();
    return newTemplate;
  }

  async getQuizResponses(quizId: string): Promise<QuizResponse[]> {
    return await db.select()
      .from(quizResponses)
      .where(eq(quizResponses.quizId, quizId))
      .orderBy(desc(quizResponses.submittedAt));
  }

  async createQuizResponse(response: InsertQuizResponse): Promise<QuizResponse> {
    const responseId = nanoid();
    const [newResponse] = await db.insert(quizResponses)
      .values({
        id: responseId,
        ...response,
      })
      .returning();
    return newResponse;
  }

  async updateQuizResponse(responseId: string, updates: Partial<QuizResponse>): Promise<QuizResponse> {
    const [updatedResponse] = await db
      .update(quizResponses)
      .set(updates)
      .where(eq(quizResponses.id, responseId))
      .returning();
    
    if (!updatedResponse) {
      throw new Error(`Response with id ${responseId} not found`);
    }
    
    return updatedResponse;
  }

  async getQuizAnalytics(quizId: string, startDate?: Date, endDate?: Date): Promise<QuizAnalytics[]> {
    let query = db.select().from(quizAnalytics).where(eq(quizAnalytics.quizId, quizId));
    
    if (startDate && endDate) {
      query = query.where(
        and(
          gte(quizAnalytics.date, startDate.toISOString().split('T')[0]),
          lte(quizAnalytics.date, endDate.toISOString().split('T')[0])
        )
      );
    }
    
    return await query.orderBy(desc(quizAnalytics.date));
  }

  async updateQuizAnalytics(quizId: string, analytics: InsertQuizAnalytics): Promise<void> {
    const analyticsId = `${quizId}-${analytics.date}`;
    
    // Sempre inserir novo registro (SQLite não tem UPSERT complexo)
    await db.insert(quizAnalytics)
      .values({
        id: analyticsId,
        quizId,
        ...analytics,
      });
  }

  // Get all analytics for user quizzes
  async getAllQuizAnalytics(userId: string) {
    try {
      const userQuizzes = await db.select().from(quizzes).where(eq(quizzes.userId, userId));
      const quizIds = userQuizzes.map(q => q.id);
      
      if (quizIds.length === 0) {
        return [];
      }
      
      const analytics = await db.select().from(quizAnalytics);
      return analytics.filter(a => quizIds.includes(a.quizId));
    } catch (error) {
      console.error('Error getting all quiz analytics:', error);
      throw error;
    }
  }

  async getDashboardStats(userId: string): Promise<{
    totalQuizzes: number;
    totalLeads: number;
    totalViews: number;
    avgConversionRate: number;
  }> {
    // Buscar quizzes do usuário
    const userQuizzes = await db.select({ id: quizzes.id })
      .from(quizzes)
      .where(eq(quizzes.userId, userId));

    const totalQuizzes = userQuizzes.length;

    if (totalQuizzes === 0) {
      return {
        totalQuizzes: 0,
        totalLeads: 0,
        totalViews: 0,
        avgConversionRate: 0,
      };
    }

    const quizIds = userQuizzes.map(q => q.id);

    // Contar respostas (leads)
    const [{ totalLeads }] = await db.select({
      totalLeads: count(quizResponses.id)
    })
    .from(quizResponses)
    .where(
      quizIds.length > 0 
        ? eq(quizResponses.quizId, quizIds[0]) // Simplificado para SQLite
        : eq(quizResponses.quizId, 'nonexistent')
    );

    // Analytics básicas
    const analytics = await db.select()
      .from(quizAnalytics)
      .where(
        quizIds.length > 0 
          ? eq(quizAnalytics.quizId, quizIds[0]) // Simplificado para SQLite
          : eq(quizAnalytics.quizId, 'nonexistent')
      );

    const totalViews = analytics.reduce((sum, a) => sum + (a.views || 0), 0);
    const avgConversionRate = analytics.length > 0 
      ? analytics.reduce((sum, a) => sum + (a.conversionRate || 0), 0) / analytics.length 
      : 0;

    return {
      totalQuizzes,
      totalLeads: totalLeads || 0,
      totalViews,
      avgConversionRate,
    };
  }

  // Email Campaign operations
  async getEmailCampaigns(userId: string): Promise<EmailCampaign[]> {
    const campaigns = await db.select().from(emailCampaigns).where(eq(emailCampaigns.userId, userId));
    return campaigns;
  }

  async getEmailCampaign(id: string): Promise<EmailCampaign | undefined> {
    const campaign = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, id)).limit(1);
    return campaign[0];
  }

  async createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign> {
    const newCampaign = {
      id: nanoid(),
      ...campaign,
    };
    await db.insert(emailCampaigns).values(newCampaign);
    return newCampaign as EmailCampaign;
  }

  async updateEmailCampaign(id: string, updates: Partial<InsertEmailCampaign>): Promise<EmailCampaign> {
    await db.update(emailCampaigns).set(updates).where(eq(emailCampaigns.id, id));
    return this.getEmailCampaign(id) as Promise<EmailCampaign>;
  }

  async deleteEmailCampaign(id: string): Promise<void> {
    await db.delete(emailCampaigns).where(eq(emailCampaigns.id, id));
  }

  // Email Template operations
  async getEmailTemplates(userId: string): Promise<EmailTemplate[]> {
    const templates = await db.select().from(emailTemplates).where(eq(emailTemplates.userId, userId));
    return templates;
  }

  async getEmailTemplate(id: string): Promise<EmailTemplate | undefined> {
    const template = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id)).limit(1);
    return template[0];
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const newTemplate = {
      id: nanoid(),
      ...template,
    };
    await db.insert(emailTemplates).values(newTemplate);
    return newTemplate as EmailTemplate;
  }

  async updateEmailTemplate(id: string, updates: Partial<InsertEmailTemplate>): Promise<EmailTemplate> {
    await db.update(emailTemplates).set(updates).where(eq(emailTemplates.id, id));
    return this.getEmailTemplate(id) as Promise<EmailTemplate>;
  }

  async deleteEmailTemplate(id: string): Promise<void> {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
  }

  // Email campaign sending operations
  async getQuizResponsesForEmail(quizId: string, targetAudience: string): Promise<QuizResponse[]> {
    let query = db.select().from(quizResponses).where(eq(quizResponses.quizId, quizId));
    
    if (targetAudience === 'completed') {
      // Respostas completas - com resposta não vazia
      query = query.where(and(
        eq(quizResponses.quizId, quizId),
        // Assumindo que respostas completas têm dados no campo response
      ));
    } else if (targetAudience === 'abandoned') {
      // Respostas abandonadas - com resposta vazia ou incompleta
      query = query.where(and(
        eq(quizResponses.quizId, quizId),
        // Condição para respostas abandonadas - implementar lógica específica
      ));
    }
    
    const responses = await query;
    return responses;
  }

  extractEmailsFromResponses(responses: QuizResponse[]): string[] {
    const emails: string[] = [];
    
    responses.forEach(response => {
      if (response.responses && typeof response.responses === 'object') {
        const responseData = response.responses as any;
        
        // Procurar por campos de email nas respostas
        Object.keys(responseData).forEach(key => {
          if (key.toLowerCase().includes('email') || key.toLowerCase().includes('e-mail')) {
            const email = responseData[key];
            if (email && typeof email === 'string' && email.includes('@')) {
              emails.push(email);
            }
          }
        });
      }
    });
    
    // Remover duplicatas
    return Array.from(new Set(emails));
  }

  // SMS Credits methods implementation
  async updateUserSmsCredits(userId: string, newCredits: number): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ smsCredits: newCredits })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      throw new Error('User not found');
    }
    
    return updatedUser;
  }

  async createSmsTransaction(transaction: { userId: string; type: string; amount: number; description?: string }): Promise<void> {
    await db.insert(smsTransactions).values({
      id: crypto.randomUUID(),
      userId: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description || null,
      createdAt: new Date()
    });
  }

  async getSmsTransactions(userId: string): Promise<any[]> {
    const transactions = await db
      .select()
      .from(smsTransactions)
      .where(eq(smsTransactions.userId, userId))
      .orderBy(desc(smsTransactions.createdAt));
    
    return transactions;
  }

  async createSMSCampaign(campaignData: { 
    name: string; 
    quizId: string; 
    message: string; 
    userId: string; 
    phones: string[]; 
    status?: string; 
  }): Promise<any> {
    const campaign = {
      id: crypto.randomUUID(),
      name: campaignData.name,
      quizId: campaignData.quizId,
      userId: campaignData.userId,
      message: campaignData.message,
      phones: JSON.stringify(campaignData.phones),
      status: campaignData.status || 'pending'
      // Não incluir createdAt e updatedAt - deixar o SQLite usar os defaults
    };

    await db.insert(smsCampaigns).values(campaign);
    return campaign;
  }

  async getSMSCampaigns(userId: string): Promise<any[]> {
    try {
      const campaigns = await db.select()
        .from(smsCampaigns)
        .where(eq(smsCampaigns.userId, userId))
        .orderBy(desc(smsCampaigns.createdAt));
      
      return campaigns.map(campaign => ({
        ...campaign,
        phones: JSON.parse(campaign.phones)
      }));
    } catch (error) {
      console.error('Error getting SMS campaigns:', error);
      throw error;
    }
  }

  async getAllSMSCampaigns(): Promise<any[]> {
    try {
      const campaigns = await db.select()
        .from(smsCampaigns)
        .orderBy(desc(smsCampaigns.createdAt));
      
      return campaigns.map(campaign => ({
        ...campaign,
        phones: JSON.parse(campaign.phones)
      }));
    } catch (error) {
      console.error('Error getting all SMS campaigns:', error);
      throw error;
    }
  }

  async updateSMSCampaign(campaignId: string, updates: Partial<{ name: string; message: string; phones: string[]; status: string }>): Promise<any> {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: Math.floor(Date.now() / 1000)
      };

      if (updates.phones) {
        updateData.phones = JSON.stringify(updates.phones);
      }

      const result = await db.update(smsCampaigns)
        .set(updateData)
        .where(eq(smsCampaigns.id, campaignId))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Error updating SMS campaign:', error);
      throw error;
    }
  }

  async updateSMSCampaignStats(campaignId: string, stats: { sent?: number; delivered?: number }): Promise<any> {
    try {
      const updateData: any = {
        ...stats,
        updatedAt: Math.floor(Date.now() / 1000)
      };

      const result = await db.update(smsCampaigns)
        .set(updateData)
        .where(eq(smsCampaigns.id, campaignId))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Error updating SMS campaign stats:', error);
      throw error;
    }
  }

  async deleteSMSCampaign(campaignId: string): Promise<void> {
    try {
      await db.delete(smsCampaigns)
        .where(eq(smsCampaigns.id, campaignId));
    } catch (error) {
      console.error('Error deleting SMS campaign:', error);
      throw error;
    }
  }

  async getSMSCampaignById(campaignId: string): Promise<any | null> {
    try {
      const campaign = await db.select().from(smsCampaigns).where(eq(smsCampaigns.id, campaignId)).limit(1);
      if (campaign.length === 0) return null;
      
      return {
        ...campaign[0],
        phones: JSON.parse(campaign[0].phones)
      };
    } catch (error) {
      console.error('Error getting SMS campaign by ID:', error);
      throw error;
    }
  }

  // SMS Logs methods
  async createSMSLog(logData: {
    id: string;
    campaignId: string;
    phone: string;
    message: string;
    status: string;
    twilioSid?: string;
    errorMessage?: string;
  }): Promise<any> {
    const log = await db.insert(smsLogs).values(logData).returning();
    return log[0];
  }

  async getSMSLogs(campaignId: string) {
    return await db.select().from(smsLogs).where(eq(smsLogs.campaignId, campaignId));
  }

  async updateSMSLogStatus(campaignId: string, phone: string, status: string, errorMessage?: string) {
    const updateData: any = {
      status,
      updatedAt: Math.floor(Date.now() / 1000)
    };

    if (status === 'sent') {
      updateData.sentAt = Math.floor(Date.now() / 1000);
    } else if (status === 'delivered') {
      updateData.deliveredAt = Math.floor(Date.now() / 1000);
    }

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    return await db.update(smsLogs)
      .set(updateData)
      .where(
        and(
          eq(smsLogs.campaignId, campaignId),
          eq(smsLogs.phone, phone)
        )
      )
      .returning();
  }

  async getSMSLogsByCampaign(campaignId: string): Promise<any[]> {
    const logs = await db
      .select()
      .from(smsLogs)
      .where(eq(smsLogs.campaignId, campaignId))
      .orderBy(desc(smsLogs.createdAt));
    
    return logs;
  }

  async updateSMSLog(logId: string, updates: {
    status?: string;
    twilioSid?: string;
    errorMessage?: string;
    sentAt?: number;
    deliveredAt?: number;
  }): Promise<any> {
    const result = await db
      .update(smsLogs)
      .set(updates)
      .where(eq(smsLogs.id, logId))
      .returning();
    
    return result[0];
  }
}

export const storage = new SQLiteStorage();