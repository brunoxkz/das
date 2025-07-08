import { db } from "./db-sqlite";
import Database from 'better-sqlite3';

// Instância direta do SQLite para comandos raw - CRÍTICO: NÃO SUPORTA 1000+ USUÁRIOS
// SQLite tem limitações severas para alta concorrência:
// 1. Apenas 1 write simultâneo (database locking)
// 2. WAL mode melhora reads mas não resolve writes
// 3. Connection pooling limitado
// 4. Para 1000+ usuários: MIGRAR PARA POSTGRESQL
const sqlite = new Database('./vendzz-database.db', {
  // Otimizações temporárias até migração
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined, // Só debug em dev
  timeout: 5000, // 5s timeout para evitar locks eternos
  readonly: false
});

// Configurações críticas para performance
sqlite.pragma('journal_mode = WAL'); // Write-Ahead Logging
sqlite.pragma('synchronous = NORMAL'); // Balance segurança/performance
sqlite.pragma('cache_size = 10000'); // 10MB cache
sqlite.pragma('temp_store = MEMORY'); // Temp tables em RAM
sqlite.pragma('mmap_size = 268435456'); // 256MB memory mapping
import { 
  users, quizzes, quizTemplates, quizResponses, quizAnalytics, emailCampaigns, emailTemplates, smsTransactions, smsCampaigns, smsLogs,
  whatsappCampaigns, whatsappLogs, whatsappTemplates,
  type User, type UpsertUser, type InsertQuiz, type Quiz,
  type InsertQuizTemplate, type QuizTemplate,
  type InsertQuizResponse, type QuizResponse,
  type InsertQuizAnalytics, type QuizAnalytics,
  type InsertEmailCampaign, type EmailCampaign,
  type InsertEmailTemplate, type EmailTemplate
} from "../shared/schema-sqlite";
import { eq, desc, and, gte, lte, count, asc, or } from "drizzle-orm";
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

  // WhatsApp Management Methods
  async createWhatsappCampaign(data: any): Promise<any> {
    const id = nanoid();
    const now = Date.now();
    
    const campaign = {
      id,
      name: data.name,
      quiz_id: data.quizId,
      quiz_title: data.quizTitle || "Quiz",
      messages: JSON.stringify(data.messages || []),
      user_id: data.userId,
      phones: JSON.stringify(data.phones || []),
      status: data.status || 'active',
      scheduled_at: data.scheduledAt,
      trigger_delay: data.triggerDelay || 10,
      trigger_unit: data.triggerUnit || 'minutes',
      target_audience: data.targetAudience || 'all',
      date_filter: data.dateFilter,
      extension_settings: JSON.stringify(data.extensionSettings || {
        delay: 3000,
        maxRetries: 3,
        enabled: true
      }),
      created_at: now,
      updated_at: now
    };

    const stmt = sqlite.prepare(`
      INSERT INTO whatsapp_campaigns 
      (id, name, quiz_id, quiz_title, messages, user_id, phones, status, scheduled_at, trigger_delay, trigger_unit, target_audience, date_filter, extension_settings, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      campaign.id, campaign.name, campaign.quiz_id, campaign.quiz_title, campaign.messages, 
      campaign.user_id, campaign.phones, campaign.status, campaign.scheduled_at,
      campaign.trigger_delay, campaign.trigger_unit, campaign.target_audience, campaign.date_filter,
      campaign.extension_settings, campaign.created_at, campaign.updated_at
    );

    return campaign;
  }

  async getWhatsappCampaigns(userId: string): Promise<any[]> {
    const stmt = sqlite.prepare(`
      SELECT wc.*, q.title as quizTitle 
      FROM whatsapp_campaigns wc
      LEFT JOIN quizzes q ON wc.quiz_id = q.id
      WHERE wc.user_id = ?
      ORDER BY wc.created_at DESC
    `);
    
    const campaigns = stmt.all(userId);
    
    // Buscar estatísticas reais dos logs para cada campanha
    const logsStmt = sqlite.prepare(`
      SELECT 
        status,
        COUNT(*) as count
      FROM whatsapp_logs 
      WHERE campaign_id = ?
      GROUP BY status
    `);
    
    return campaigns.map(campaign => {
      const logs = logsStmt.all(campaign.id);
      const stats = {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        replies: 0
      };
      
      // Calcular estatísticas reais baseadas nos logs
      logs.forEach(log => {
        if (log.status === 'sent' || log.status === 'delivered') {
          stats.sent += log.count;
        }
        if (log.status === 'delivered') {
          stats.delivered += log.count;
        }
        if (log.status === 'read') {
          stats.opened += log.count;
        }
        if (log.status === 'clicked') {
          stats.clicked += log.count;
        }
        if (log.status === 'replied') {
          stats.replies += log.count;
        }
      });
      
      return {
        ...campaign,
        phones: JSON.parse(campaign.phones || '[]'),
        extensionSettings: JSON.parse(campaign.extension_settings || '{}'),
        messages: JSON.parse(campaign.messages || '[]'),
        ...stats
      };
    });
  }

  async getWhatsappCampaignById(id: string): Promise<any | null> {
    const stmt = sqlite.prepare(`
      SELECT wc.*, q.title as quizTitle 
      FROM whatsapp_campaigns wc
      LEFT JOIN quizzes q ON wc.quiz_id = q.id
      WHERE wc.id = ?
    `);
    
    const campaign = stmt.get(id);
    if (!campaign) return null;

    return {
      ...campaign,
      phones: JSON.parse(campaign.phones || '[]'),
      extensionSettings: JSON.parse(campaign.extension_settings || '{}')
    };
  }

  async updateWhatsappCampaign(id: string, updates: any): Promise<any> {
    const campaign = await this.getWhatsappCampaignById(id);
    if (!campaign) throw new Error('Campanha WhatsApp não encontrada');

    const updatedData = {
      ...campaign,
      ...updates,
      updated_at: Date.now()
    };

    if (updates.phones) {
      updatedData.phones = JSON.stringify(updates.phones);
    }
    if (updates.extensionSettings) {
      updatedData.extension_settings = JSON.stringify(updates.extensionSettings);
    }

    const stmt = sqlite.prepare(`
      UPDATE whatsapp_campaigns 
      SET name = ?, message = ?, status = ?, phones = ?, extension_settings = ?, updated_at = ?
      WHERE id = ?
    `);
    
    stmt.run(
      updatedData.name, updatedData.message, updatedData.status,
      updatedData.phones, updatedData.extension_settings, updatedData.updated_at, id
    );

    return await this.getWhatsappCampaignById(id);
  }

  async deleteWhatsappCampaign(id: string): Promise<boolean> {
    // Delete logs first (cascade)
    const deleteLogsStmt = sqlite.prepare('DELETE FROM whatsapp_logs WHERE campaign_id = ?');
    deleteLogsStmt.run(id);
    
    // Delete campaign
    const deleteCampaignStmt = sqlite.prepare('DELETE FROM whatsapp_campaigns WHERE id = ?');
    const result = deleteCampaignStmt.run(id);
    
    return result.changes > 0;
  }

  async createWhatsappLog(data: any): Promise<any> {
    const id = nanoid();
    const now = Math.floor(Date.now() / 1000);
    
    const log = {
      id,
      campaign_id: data.campaignId,
      phone: data.phone,
      message: data.message,
      status: data.status || 'pending',
      scheduled_at: data.scheduledAt,
      sent_at: data.sentAt,
      extension_status: data.extensionStatus,
      error: data.error,
      created_at: now,
      updated_at: now
    };

    const stmt = sqlite.prepare(`
      INSERT INTO whatsapp_logs 
      (id, campaign_id, phone, message, status, scheduled_at, sent_at, extension_status, error, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      log.id, log.campaign_id, log.phone, log.message, log.status,
      log.scheduled_at, log.sent_at, log.extension_status, log.error,
      log.created_at, log.updated_at
    );

    return log;
  }

  async getWhatsappLogs(campaignId: string): Promise<any[]> {
    const stmt = sqlite.prepare(`
      SELECT * FROM whatsapp_logs 
      WHERE campaign_id = ? 
      ORDER BY created_at DESC
    `);
    
    return stmt.all(campaignId);
  }

  // Get all WhatsApp campaigns for auto-detection
  async getAllWhatsappCampaigns(): Promise<any[]> {
    try {
      const stmt = sqlite.prepare(`
        SELECT * FROM whatsapp_campaigns 
        WHERE status = 'active'
        ORDER BY created_at DESC
      `);
      
      const campaigns = stmt.all();
      
      return campaigns.map(campaign => ({
        ...campaign,
        messages: JSON.parse(campaign.messages || '[]'),
        phones: JSON.parse(campaign.phones || '[]')
      }));
    } catch (error) {
      console.error('Error getting all WhatsApp campaigns:', error);
      return [];
    }
  }

  // Get scheduled WhatsApp logs  
  async getScheduledWhatsappLogs(currentTime: number): Promise<any[]> {
    try {
      const stmt = sqlite.prepare(`
        SELECT * FROM whatsapp_logs 
        WHERE status = 'scheduled' 
        AND scheduled_at <= ?
        ORDER BY scheduled_at ASC
        LIMIT 100
      `);
      
      return stmt.all(currentTime);
    } catch (error) {
      console.error('Error getting scheduled WhatsApp logs:', error);
      return [];
    }
  }

  // Update WhatsApp log status
  async updateWhatsappLogStatus(id: string, status: string, extensionStatus?: string, errorMsg?: string): Promise<void> {
    try {
      const updates = {
        status,
        updated_at: Math.floor(Date.now() / 1000)
      };
      
      let setClause = 'SET status = ?, updated_at = ?';
      let params = [status, updates.updated_at];
      
      if (status === 'sent') {
        setClause += ', sent_at = ?';
        params.push(Math.floor(Date.now() / 1000));
      }
      
      if (extensionStatus) {
        setClause += ', extension_status = ?';
        params.push(extensionStatus);
      }
      
      if (errorMsg) {
        setClause += ', error_message = ?';
        params.push(errorMsg);
      }
      
      const stmt = sqlite.prepare(`
        UPDATE whatsapp_logs 
        ${setClause}
        WHERE id = ?
      `);
      
      params.push(id);
      stmt.run(...params);
        
    } catch (error) {
      console.error('Error updating WhatsApp log status:', error);
    }
  }

  async updateWhatsappLogStatus(id: string, status: string, extensionStatus?: string, error?: string): Promise<void> {
    const updates: any = {
      status,
      updated_at: Math.floor(Date.now() / 1000)
    };
    
    if (status === 'sent') {
      updates.sent_at = Math.floor(Date.now() / 1000);
    }
    if (extensionStatus) {
      updates.extension_status = extensionStatus;
    }
    if (error) {
      updates.error = error;
    }

    const stmt = sqlite.prepare(`
      UPDATE whatsapp_logs 
      SET status = ?, sent_at = ?, extension_status = ?, error = ?, updated_at = ?
      WHERE id = ?
    `);
    
    stmt.run(updates.status, updates.sent_at, updates.extension_status, updates.error, updates.updated_at, id);
  }

  async getScheduledWhatsappLogs(): Promise<any[]> {
    const now = Math.floor(Date.now() / 1000);
    const stmt = sqlite.prepare(`
      SELECT wl.*, wc.user_id, wc.extension_settings
      FROM whatsapp_logs wl
      JOIN whatsapp_campaigns wc ON wl.campaign_id = wc.id
      WHERE wl.status = 'scheduled' 
      AND wl.scheduled_at <= ?
      ORDER BY wl.scheduled_at ASC
      LIMIT 100
    `);
    
    return stmt.all(now);
  }

  async getWhatsappTemplates(userId: string): Promise<any[]> {
    const stmt = sqlite.prepare(`
      SELECT * FROM whatsapp_templates 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `);
    
    return stmt.all(userId).map(template => ({
      ...template,
      variables: JSON.parse(template.variables || '[]')
    }));
  }

  async createWhatsappTemplate(data: any): Promise<any> {
    const id = nanoid();
    const now = Math.floor(Date.now() / 1000);
    
    const template = {
      id,
      name: data.name,
      message: data.message,
      category: data.category,
      variables: JSON.stringify(data.variables || []),
      user_id: data.userId,
      created_at: now,
      updated_at: now
    };

    const stmt = sqlite.prepare(`
      INSERT INTO whatsapp_templates 
      (id, name, message, category, variables, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      template.id, template.name, template.message, template.category,
      template.variables, template.user_id, template.created_at, template.updated_at
    );

    return {
      ...template,
      variables: JSON.parse(template.variables)
    };
  }

  async createSMSCampaign(campaignData: { 
    name: string; 
    quizId: string; 
    message: string; 
    userId: string; 
    phones: string[]; 
    status?: string; 
    scheduledAt?: number | Date;

    createdAt?: Date;
    updatedAt?: Date;
    triggerDelay?: number;
    triggerUnit?: string;
    targetAudience?: string;
  }): Promise<any> {
    const now = Math.floor(Date.now() / 1000);
    
    const scheduledAtValue = campaignData.scheduledAt ? 
      (typeof campaignData.scheduledAt === 'number' ? campaignData.scheduledAt : Math.floor(new Date(campaignData.scheduledAt).getTime() / 1000)) 
      : null;
    
    console.log(`📅 STORAGE - scheduledAt recebido: ${campaignData.scheduledAt}`);
    console.log(`📅 STORAGE - scheduledAt convertido: ${scheduledAtValue}`);
    
    const campaign = {
      id: crypto.randomUUID(),
      name: campaignData.name,
      quizId: campaignData.quizId,
      userId: campaignData.userId,
      message: campaignData.message,
      phones: JSON.stringify(campaignData.phones),
      status: campaignData.status || 'pending',
      scheduledAt: scheduledAtValue,
      triggerDelay: campaignData.triggerDelay || 10,
      triggerUnit: campaignData.triggerUnit || 'minutes',
      targetAudience: campaignData.targetAudience || 'all',
      createdAt: now,
      updatedAt: now
    };

    console.log(`📅 STORAGE - Dados da campanha antes de inserir:`, campaign);
    
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
      
      return campaigns.map(campaign => {
        try {
          return {
            ...campaign,
            phones: JSON.parse(campaign.phones)
          };
        } catch (parseError) {
          console.error(`❌ Erro ao fazer parse de phones para campanha ${campaign.id}:`, parseError);
          console.error(`❌ Dados inválidos: ${campaign.phones}`);
          // Retornar campanha com phones vazio para evitar quebrar o sistema
          return {
            ...campaign,
            phones: []
          };
        }
      });
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
      // Primeiro deletar todos os logs SMS relacionados à campanha
      await db.delete(smsLogs)
        .where(eq(smsLogs.campaignId, campaignId));
      
      // Depois deletar a campanha SMS
      await db.delete(smsCampaigns)
        .where(eq(smsCampaigns.id, campaignId));
      
      console.log(`✅ Campanha SMS ${campaignId} e seus logs foram deletados com sucesso`);
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
    scheduledAt?: number;
  }): Promise<any> {
    const log = await db.insert(smsLogs).values({
      ...logData,
      createdAt: Math.floor(Date.now() / 1000)
    }).returning();
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
    scheduledAt?: number;
  }): Promise<any> {
    const result = await db
      .update(smsLogs)
      .set(updates)
      .where(eq(smsLogs.id, logId))
      .returning();
    
    return result[0];
  }

  // Nova função para buscar SMS agendados individualmente
  async getScheduledSMSLogs(): Promise<any[]> {
    const currentTime = Math.floor(Date.now() / 1000);
    
    const scheduledLogs = await db
      .select()
      .from(smsLogs)
      .where(and(
        eq(smsLogs.status, 'scheduled'),
        lte(smsLogs.scheduledAt, currentTime)
      ))
      .orderBy(asc(smsLogs.scheduledAt));
    
    return scheduledLogs;
  }

  // Função para buscar campanha por ID
  async getSMSCampaign(campaignId: string): Promise<any> {
    const campaign = await db
      .select()
      .from(smsCampaigns)
      .where(eq(smsCampaigns.id, campaignId))
      .limit(1);
    
    return campaign[0] || null;
  }

  async getQuizPhoneNumbers(quizId: string): Promise<any[]> {
    const stmt = sqlite.prepare(`
      SELECT responses, metadata
      FROM quiz_responses
      WHERE quizId = ?
      AND (
        (metadata->>'isComplete' = 'true') OR 
        (metadata->>'completionPercentage' = '100') OR
        (metadata->>'isComplete' = 'false' AND metadata->>'isPartial' != 'true')
      )
    `);
    
    const responses = stmt.all(quizId);
    const phoneSet = new Set();
    const phoneData: any[] = [];
    
    for (const response of responses) {
      let parsedResponses;
      let parsedMetadata;
      
      try {
        parsedResponses = typeof response.responses === 'string' ? 
          JSON.parse(response.responses) : response.responses;
        parsedMetadata = typeof response.metadata === 'string' ? 
          JSON.parse(response.metadata) : response.metadata;
      } catch (error) {
        console.error('Erro ao fazer parse das respostas:', error);
        continue;
      }
      
      if (!parsedResponses) continue;
      
      // Find phone number in responses
      let phoneNumber = null;
      
      if (Array.isArray(parsedResponses)) {
        for (const item of parsedResponses) {
          if (item.elementFieldId && item.elementFieldId.includes('telefone') && item.answer) {
            phoneNumber = item.answer;
            break;
          }
        }
      } else if (typeof parsedResponses === 'object') {
        for (const [key, value] of Object.entries(parsedResponses)) {
          if (key.includes('telefone') && value) {
            phoneNumber = value;
            break;
          }
        }
      }
      
      if (phoneNumber) {
        // Clean phone number
        const cleanPhone = phoneNumber.toString().replace(/\D/g, '');
        
        // Validate phone (10-15 digits)
        if (cleanPhone.length >= 10 && cleanPhone.length <= 15 && /^\d+$/.test(cleanPhone)) {
          if (!phoneSet.has(cleanPhone)) {
            phoneSet.add(cleanPhone);
            
            // Determine completion status
            const isComplete = parsedMetadata?.isComplete === true || 
                             parsedMetadata?.completionPercentage === 100;
            
            phoneData.push({
              telefone: cleanPhone,
              phone: cleanPhone,
              status: isComplete ? 'completed' : 'abandoned',
              completionPercentage: parsedMetadata?.completionPercentage || 0,
              submittedAt: response.submitted_at
            });
          }
        }
      }
    }
    
    return phoneData;
  }

  async getSentSMSCount(userId: string): Promise<number> {
    try {
      // Contar SMS enviados com sucesso para campanhas do usuário
      console.log(`🔍 CONTANDO SMS ENVIADOS para userId: ${userId}`);
      
      const result = await db.select({ count: count() })
        .from(smsLogs)
        .innerJoin(smsCampaigns, eq(smsLogs.campaignId, smsCampaigns.id))
        .where(and(
          eq(smsCampaigns.userId, userId),
          eq(smsLogs.status, 'sent')
        ));
      
      console.log(`💰 RESULTADO CONTAGEM: ${result[0]?.count || 0} SMS enviados`);
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error counting sent SMS:', error);
      return 0;
    }
  }
  // SECURITY METHODS FOR CHROME EXTENSION

  // Get scheduled WhatsApp logs by user (SECURITY)
  async getScheduledWhatsappLogsByUser(userId: string, currentTime: number): Promise<any[]> {
    try {
      const stmt = sqlite.prepare(`
        SELECT wl.* FROM whatsapp_logs wl
        INNER JOIN whatsapp_campaigns wc ON wl.campaign_id = wc.id
        WHERE wl.status = 'scheduled' 
        AND wl.scheduled_at <= ?
        AND wc.user_id = ?
        ORDER BY wl.scheduled_at ASC
        LIMIT 100
      `);
      
      return stmt.all(currentTime, userId);
    } catch (error) {
      console.error('❌ ERRO ao buscar logs WhatsApp por usuário:', error);
      return [];
    }
  }

  // Get already sent phones to avoid duplicates (SECURITY)
  async getAlreadySentPhones(userId: string, phones: string[]): Promise<string[]> {
    try {
      if (!phones || phones.length === 0) {
        return [];
      }
      
      // Criar placeholders para o IN clause
      const placeholders = phones.map(() => '?').join(', ');
      
      const stmt = sqlite.prepare(`
        SELECT DISTINCT wl.phone FROM whatsapp_logs wl
        INNER JOIN whatsapp_campaigns wc ON wl.campaign_id = wc.id
        WHERE wl.phone IN (${placeholders})
        AND wc.user_id = ?
        AND wl.status IN ('sent', 'delivered')
      `);
      
      const result = stmt.all(...phones, userId);
      const sentPhones = result.map((row: any) => row.phone);
      
      console.log(`🔍 DUPLICATAS ENCONTRADAS: ${sentPhones.length}/${phones.length}`);
      return sentPhones;
      
    } catch (error) {
      console.error('❌ ERRO ao verificar telefones já enviados:', error);
      return [];
    }
  }

  // Get WhatsApp log by ID (SECURITY)
  async getWhatsappLogById(logId: string): Promise<any | null> {
    try {
      const stmt = sqlite.prepare('SELECT * FROM whatsapp_logs WHERE id = ?');
      const result = stmt.get(logId);
      return result || null;
    } catch (error) {
      console.error('❌ ERRO ao buscar log WhatsApp por ID:', error);
      return null;
    }
  }

  // Get WhatsApp campaign by ID (SECURITY)
  async getWhatsappCampaignById(campaignId: string): Promise<any | null> {
    try {
      const stmt = sqlite.prepare('SELECT * FROM whatsapp_campaigns WHERE id = ?');
      const result = stmt.get(campaignId);
      return result || null;
    } catch (error) {
      console.error('❌ ERRO ao buscar campanha WhatsApp por ID:', error);
      return null;
    }
  }

  // EXTENSION SETTINGS SYNC METHODS

  // Get user extension settings
  async getUserExtensionSettings(userId: string): Promise<any> {
    try {
      const stmt = sqlite.prepare('SELECT extension_settings FROM users WHERE id = ?');
      const result = stmt.get(userId);
      
      if (result && result.extension_settings) {
        return JSON.parse(result.extension_settings);
      }
      
      // Configurações padrão se não existir
      const defaultSettings = {
        autoSend: true,
        messageDelay: 3000, // 3 segundos entre mensagens
        maxMessagesPerDay: 100,
        workingHours: {
          enabled: false,
          start: "09:00",
          end: "18:00"
        },
        antiSpam: {
          enabled: true,
          minDelay: 2000,
          maxDelay: 5000,
          randomization: true
        }
      };
      
      return defaultSettings;
    } catch (error) {
      console.error('❌ ERRO ao buscar configurações da extensão:', error);
      return {};
    }
  }

  // Update user extension settings
  async updateUserExtensionSettings(userId: string, settings: any): Promise<void> {
    try {
      const stmt = sqlite.prepare('UPDATE users SET extension_settings = ? WHERE id = ?');
      stmt.run(JSON.stringify(settings), userId);
    } catch (error) {
      console.error('❌ ERRO ao atualizar configurações da extensão:', error);
      throw error;
    }
  }
  // =============================================
  // WHATSAPP AUTOMATION FILES METHODS
  // =============================================

  async saveAutomationFile(file: any): Promise<void> {
    // Criar tabela se não existir
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS whatsapp_automation_files (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        quiz_id TEXT NOT NULL,
        quiz_title TEXT,
        target_audience TEXT,
        date_filter TEXT,
        phones TEXT,
        total_phones INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        last_updated TEXT NOT NULL
      )
    `);

    const stmt = sqlite.prepare(`
      INSERT OR REPLACE INTO whatsapp_automation_files 
      (id, user_id, quiz_id, quiz_title, target_audience, date_filter, phones, total_phones, created_at, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      file.id,
      file.userId,
      file.quizId,
      file.quizTitle,
      file.targetAudience,
      file.dateFilter,
      JSON.stringify(file.phones),
      file.totalPhones,
      file.createdAt,
      file.lastUpdated
    );
  }

  async getAutomationFile(userId: string, quizId: string): Promise<any | null> {
    try {
      const stmt = sqlite.prepare(`
        SELECT * FROM whatsapp_automation_files 
        WHERE user_id = ? AND quiz_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `);
      
      const file = stmt.get(userId, quizId);
      if (!file) return null;

      return {
        ...file,
        phones: JSON.parse(file.phones || '[]')
      };
    } catch (error) {
      // Se a tabela não existir, retornar null
      console.log('Tabela de arquivos de automação ainda não foi criada');
      return null;
    }
  }

  async getAutomationFileById(fileId: string): Promise<any | null> {
    try {
      const stmt = sqlite.prepare(`
        SELECT * FROM whatsapp_automation_files 
        WHERE id = ?
      `);
      
      const file = stmt.get(fileId);
      if (!file) return null;

      return {
        ...file,
        phones: JSON.parse(file.phones || '[]')
      };
    } catch (error) {
      console.log('Tabela de arquivos de automação ainda não foi criada');
      return null;
    }
  }

  async getWhatsAppAutomationFiles(userId: string): Promise<any[]> {
    try {
      const stmt = sqlite.prepare(`
        SELECT * FROM whatsapp_automation_files 
        WHERE user_id = ?
        ORDER BY created_at DESC
      `);
      
      const files = stmt.all(userId);
      
      return files.map(file => ({
        ...file,
        phones: JSON.parse(file.phones || '[]')
      }));
    } catch (error) {
      console.log('Tabela de arquivos de automação ainda não foi criada');
      return [];
    }
  }

  async getWhatsAppAutomationFile(fileId: string): Promise<any | null> {
    try {
      const stmt = sqlite.prepare(`
        SELECT * FROM whatsapp_automation_files 
        WHERE id = ?
      `);
      
      const file = stmt.get(fileId);
      if (!file) return null;

      return {
        ...file,
        phones: JSON.parse(file.phones || '[]')
      };
    } catch (error) {
      console.log('Tabela de arquivos de automação ainda não foi criada');
      return null;
    }
  }

  async deleteAutomationFile(fileId: string): Promise<void> {
    const stmt = sqlite.prepare(`
      DELETE FROM whatsapp_automation_files WHERE id = ?
    `);
    
    stmt.run(fileId);
  }
}

export const storage = new SQLiteStorage();