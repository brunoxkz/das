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
  users, quizzes, quizTemplates, quizResponses, responseVariables, quizAnalytics, emailCampaigns, emailTemplates, emailLogs, emailAutomations, emailSequences, smsTransactions, smsCampaigns, smsLogs,
  voiceCampaigns, voiceLogs,
  whatsappCampaigns, whatsappLogs, whatsappTemplates,
  aiConversionCampaigns, aiVideoGenerations, notifications,
  superAffiliates, affiliateSales,
  abTests, abTestViews, webhooks, webhookLogs, integrations,
  typebotProjects, typebotConversations, typebotMessages, typebotAnalytics, typebotWebhooks, typebotIntegrations,
  type User, type UpsertUser, type InsertQuiz, type Quiz,
  type InsertQuizTemplate, type QuizTemplate,
  type InsertQuizResponse, type QuizResponse,
  type InsertResponseVariable, type ResponseVariable,
  type InsertQuizAnalytics, type QuizAnalytics,
  type InsertEmailCampaign, type EmailCampaign,
  type InsertEmailTemplate, type EmailTemplate,
  type InsertEmailLog, type EmailLog,
  type InsertEmailAutomation, type EmailAutomation,
  type InsertEmailSequence, type EmailSequence,
  type InsertVoiceCampaign, type VoiceCampaign,
  type InsertVoiceLog, type VoiceLog,
  type InsertAiConversionCampaign, type AiConversionCampaign,
  type InsertAiVideoGeneration, type AiVideoGeneration,
  type InsertNotification, type Notification,
  type InsertSuperAffiliate, type SuperAffiliate,
  type InsertAffiliateSale, type AffiliateSale,
  type InsertAbTest, type AbTest,
  type InsertAbTestView, type AbTestView,
  type InsertWebhook, type Webhook,
  type InsertWebhookLog, type WebhookLog,
  type InsertIntegration, type Integration,
  type InsertTypebotProject, type TypebotProject,
  type InsertTypebotConversation, type TypebotConversation,
  type InsertTypebotMessage, type TypebotMessage,
  type InsertTypebotAnalytics, type TypebotAnalytics,
  type InsertTypebotWebhook, type TypebotWebhook,
  type InsertTypebotIntegration, type TypebotIntegration
} from "../shared/schema-sqlite";
import { eq, desc, and, gte, lte, count, asc, or, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(userId: string, updates: Partial<User>): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  updateUserPlan(userId: string, plan: string, subscriptionStatus?: string): Promise<User>;

  // Admin operations
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User>;
  deleteUser(userId: string): Promise<void>;

  // Quiz operations
  getUserQuizzes(userId: string): Promise<Quiz[]>;
  getAllQuizzes(): Promise<Quiz[]>;
  getQuiz(id: string): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuiz(id: string, updates: Partial<InsertQuiz>): Promise<Quiz>;
  deleteQuiz(id: string): Promise<void>;
  duplicateQuiz(id: string, userId: number): Promise<Quiz>;

  // Quiz template operations
  getQuizTemplates(): Promise<QuizTemplate[]>;
  getQuizTemplate(id: number): Promise<QuizTemplate | undefined>;
  createQuizTemplate(template: InsertQuizTemplate): Promise<QuizTemplate>;

  // Quiz response operations
  getQuizResponses(quizId: string): Promise<QuizResponse[]>;
  getRecentQuizResponses(lastSeconds?: number): Promise<QuizResponse[]>;
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
  extractVariablesFromResponses(responses: QuizResponse[]): string[];
  
  // Quiz response operations
  getQuizResponse(id: string): Promise<QuizResponse | undefined>;
  deleteQuizResponse(id: string): Promise<void>;

  // Response Variables operations (sistema dinâmico de captura de variáveis)
  createResponseVariable(variable: InsertResponseVariable): Promise<ResponseVariable>;
  getResponseVariables(responseId: string): Promise<ResponseVariable[]>;
  getQuizVariables(quizId: string): Promise<ResponseVariable[]>;
  extractAndSaveVariables(response: QuizResponse, quiz: Quiz): Promise<void>;
  
  // Email Logs operations
  getEmailLogs(campaignId: string): Promise<EmailLog[]>;
  createEmailLog(log: InsertEmailLog): Promise<EmailLog>;
  updateEmailLogStatus(logId: string, status: string, data?: any): Promise<EmailLog>;
  
  // Email Automation operations
  getEmailAutomations(userId: string): Promise<EmailAutomation[]>;
  getEmailAutomation(id: string): Promise<EmailAutomation | undefined>;
  createEmailAutomation(automation: InsertEmailAutomation): Promise<EmailAutomation>;
  updateEmailAutomation(id: string, updates: Partial<InsertEmailAutomation>): Promise<EmailAutomation>;
  deleteEmailAutomation(id: string): Promise<void>;
  
  // Email Sequence operations
  getEmailSequences(automationId: string): Promise<EmailSequence[]>;
  createEmailSequence(sequence: InsertEmailSequence): Promise<EmailSequence>;
  updateEmailSequence(id: string, updates: Partial<InsertEmailSequence>): Promise<EmailSequence>;
  deleteEmailSequence(id: string): Promise<void>;
  
  // Email personalization operations
  personalizeEmailContent(content: string, leadData: any): string;
  getScheduledEmails(): Promise<EmailLog[]>;
  processEmailSequences(): Promise<void>;

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

  // I.A. CONVERSION + operations
  getAiConversionCampaigns(userId: string): Promise<AiConversionCampaign[]>;
  getAiConversionCampaign(id: string): Promise<AiConversionCampaign | undefined>;
  createAiConversionCampaign(campaign: InsertAiConversionCampaign): Promise<AiConversionCampaign>;
  updateAiConversionCampaign(id: string, updates: Partial<InsertAiConversionCampaign>): Promise<AiConversionCampaign>;
  deleteAiConversionCampaign(id: string): Promise<void>;
  
  // AI Video Generation operations
  getAiVideoGenerations(campaignId: string): Promise<AiVideoGeneration[]>;
  getAiVideoGeneration(id: string): Promise<AiVideoGeneration | undefined>;
  createAiVideoGeneration(generation: InsertAiVideoGeneration): Promise<AiVideoGeneration>;
  updateAiVideoGeneration(id: string, updates: Partial<InsertAiVideoGeneration>): Promise<AiVideoGeneration>;
  deleteAiVideoGeneration(id: string): Promise<void>;

  // Notification operations
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: Omit<InsertNotification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notification>;
  markNotificationAsRead(notificationId: string, userId: string): Promise<void>;
  deleteNotification(notificationId: string, userId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

  // Super Affiliates operations
  createAffiliate(affiliate: Omit<InsertSuperAffiliate, 'id' | 'createdAt' | 'updatedAt'>): Promise<SuperAffiliate>;
  getUserAffiliates(userId: string): Promise<SuperAffiliate[]>;
  getAffiliate(id: string): Promise<SuperAffiliate | undefined>;
  updateAffiliate(id: string, updates: Partial<InsertSuperAffiliate>): Promise<SuperAffiliate>;
  deleteAffiliate(id: string): Promise<void>;
  
  // Affiliate Sales operations
  createAffiliateSale(sale: Omit<InsertAffiliateSale, 'id' | 'createdAt' | 'updatedAt'>): Promise<AffiliateSale>;
  getAffiliateSales(affiliateId: string): Promise<AffiliateSale[]>;
  updateAffiliateSale(id: string, updates: Partial<InsertAffiliateSale>): Promise<AffiliateSale>;
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

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ 
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // 🔒 SISTEMA DE SEGURANÇA DE CRÉDITOS - ANTI-BURLA
  async validateCreditsForCampaign(userId: string, creditType: 'sms' | 'email' | 'whatsapp' | 'ai', requiredAmount: number): Promise<{ valid: boolean; currentCredits: number; message?: string }> {
    try {
      console.log(`🔒 VALIDANDO CRÉDITOS - User: ${userId}, Tipo: ${creditType}, Necessário: ${requiredAmount}`);
      
      const user = await this.getUser(userId);
      if (!user) {
        return { valid: false, currentCredits: 0, message: "Usuário não encontrado" };
      }

      let currentCredits = 0;
      switch (creditType) {
        case 'sms':
          currentCredits = user.smsCredits || 0;
          break;
        case 'email':
          currentCredits = user.emailCredits || 0;
          break;
        case 'whatsapp':
          currentCredits = user.whatsappCredits || 0;
          break;
        case 'ai':
          currentCredits = user.aiCredits || 0;
          break;
      }

      const isValid = currentCredits >= requiredAmount;
      
      console.log(`💰 RESULTADO VALIDAÇÃO - Créditos atuais: ${currentCredits}, Necessário: ${requiredAmount}, Válido: ${isValid}`);
      
      return {
        valid: isValid,
        currentCredits,
        message: isValid ? undefined : `Créditos insuficientes. Você tem ${currentCredits} créditos ${creditType}, mas precisa de ${requiredAmount}.`
      };
    } catch (error) {
      console.error(`❌ ERRO na validação de créditos:`, error);
      return { valid: false, currentCredits: 0, message: "Erro interno na validação" };
    }
  }

  async debitCredits(userId: string, creditType: 'sms' | 'email' | 'whatsapp' | 'ai', amount: number): Promise<{ success: boolean; newBalance: number; message?: string }> {
    try {
      console.log(`💳 DEBITANDO CRÉDITOS - User: ${userId}, Tipo: ${creditType}, Quantidade: ${amount}`);
      
      const user = await this.getUser(userId);
      if (!user) {
        return { success: false, newBalance: 0, message: "Usuário não encontrado" };
      }

      let currentCredits = 0;
      const updateData: Partial<User> = {};

      switch (creditType) {
        case 'sms':
          currentCredits = user.smsCredits || 0;
          updateData.smsCredits = Math.max(0, currentCredits - amount);
          break;
        case 'email':
          currentCredits = user.emailCredits || 0;
          updateData.emailCredits = Math.max(0, currentCredits - amount);
          break;
        case 'whatsapp':
          currentCredits = user.whatsappCredits || 0;
          updateData.whatsappCredits = Math.max(0, currentCredits - amount);
          break;
        case 'ai':
          currentCredits = user.aiCredits || 0;
          updateData.aiCredits = Math.max(0, currentCredits - amount);
          break;
      }

      if (currentCredits < amount) {
        return {
          success: false,
          newBalance: currentCredits,
          message: `Créditos insuficientes. Saldo atual: ${currentCredits}, tentativa de débito: ${amount}`
        };
      }

      await this.updateUser(userId, updateData);
      const newBalance = currentCredits - amount;
      
      console.log(`✅ CRÉDITOS DEBITADOS - Saldo anterior: ${currentCredits}, Novo saldo: ${newBalance}`);
      
      return {
        success: true,
        newBalance,
        message: `${amount} créditos ${creditType} debitados. Novo saldo: ${newBalance}`
      };
    } catch (error) {
      console.error(`❌ ERRO ao debitar créditos:`, error);
      return { success: false, newBalance: 0, message: "Erro interno no débito" };
    }
  }

  async pauseCampaignsWithoutCredits(userId: string): Promise<{ sms: number; email: number; whatsapp: number }> {
    try {
      console.log(`⏸️ VERIFICANDO CAMPANHAS PARA PAUSAR - User: ${userId}`);
      
      const user = await this.getUser(userId);
      if (!user) {
        return { sms: 0, email: 0, whatsapp: 0 };
      }

      let pausedCounts = { sms: 0, email: 0, whatsapp: 0 };

      // Pausar campanhas SMS se créditos insuficientes
      if ((user.smsCredits || 0) <= 0) {
        const smsCampaigns = await db.select()
          .from(smsCampaigns)
          .where(and(
            eq(smsCampaigns.userId, userId),
            eq(smsCampaigns.status, 'active')
          ));

        for (const campaign of smsCampaigns) {
          await db.update(smsCampaigns)
            .set({ 
              status: 'paused',
              pausedReason: 'Créditos SMS insuficientes'
            })
            .where(eq(smsCampaigns.id, campaign.id));
          pausedCounts.sms++;
        }
      }

      // Pausar campanhas Email se créditos insuficientes
      if ((user.emailCredits || 0) <= 0) {
        const emailCampaigns = await db.select()
          .from(emailCampaigns)
          .where(and(
            eq(emailCampaigns.userId, userId),
            eq(emailCampaigns.status, 'active')
          ));

        for (const campaign of emailCampaigns) {
          await db.update(emailCampaigns)
            .set({ 
              status: 'paused',
              pausedReason: 'Créditos Email insuficientes'
            })
            .where(eq(emailCampaigns.id, campaign.id));
          pausedCounts.email++;
        }
      }

      // Pausar campanhas WhatsApp se créditos insuficientes
      if ((user.whatsappCredits || 0) <= 0) {
        const whatsappCampaigns = await db.select()
          .from(whatsappCampaigns)
          .where(and(
            eq(whatsappCampaigns.userId, userId),
            eq(whatsappCampaigns.status, 'active')
          ));

        for (const campaign of whatsappCampaigns) {
          await db.update(whatsappCampaigns)
            .set({ 
              status: 'paused',
              pausedReason: 'Créditos WhatsApp insuficientes'
            })
            .where(eq(whatsappCampaigns.id, campaign.id));
          pausedCounts.whatsapp++;
        }
      }

      console.log(`⏸️ CAMPANHAS PAUSADAS - SMS: ${pausedCounts.sms}, Email: ${pausedCounts.email}, WhatsApp: ${pausedCounts.whatsapp}`);
      
      return pausedCounts;
    } catch (error) {
      console.error(`❌ ERRO ao pausar campanhas:`, error);
      return { sms: 0, email: 0, whatsapp: 0 };
    }
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

  async getAllQuizzes(): Promise<Quiz[]> {
    try {
      return await db.select()
        .from(quizzes)
        .orderBy(desc(quizzes.updatedAt));
    } catch (error) {
      console.error('❌ Erro ao buscar todos os quizzes:', error);
      return [];
    }
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz || undefined;
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const quizId = nanoid();
    const now = Math.floor(Date.now() / 1000);
    
    // Garantir estrutura básica se não fornecida
    const defaultStructure = {
      pages: [
        {
          id: "page_1",
          name: "Página Inicial",
          type: "normal",
          elements: []
        }
      ],
      settings: {
        theme: "blue",
        showProgressBar: true,
        collectEmail: true,
        collectName: true,
        collectPhone: false
      }
    };
    
    const [newQuiz] = await db.insert(quizzes)
      .values({
        id: quizId,
        ...quiz,
        structure: quiz.structure || defaultStructure,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return newQuiz;
  }

  async updateQuiz(id: string, updates: Partial<InsertQuiz>): Promise<Quiz> {
    console.log(`💾 STORAGE - updateQuiz iniciado para ID: ${id}`);
    console.log(`📝 STORAGE - Updates recebidos:`, {
      title: updates.title,
      hasStructure: !!updates.structure,
      pagesCount: updates.structure?.pages?.length || 0,
      elementsCount: updates.structure?.pages?.reduce((sum, p) => sum + (p.elements?.length || 0), 0) || 0
    });
    
    try {
      // Primeiro verificar se o quiz existe
      const existingQuiz = await this.getQuiz(id);
      if (!existingQuiz) {
        throw new Error(`Quiz com ID ${id} não encontrado`);
      }
      
      console.log(`📊 STORAGE - Quiz existente encontrado:`, {
        currentTitle: existingQuiz.title,
        currentPagesCount: existingQuiz.structure?.pages?.length || 0
      });
      
      // Executar update com timestamp Unix
      const updateData = {
        ...updates,
        updatedAt: Math.floor(Date.now() / 1000)
      };
      
      const [updatedQuiz] = await db.update(quizzes)
        .set(updateData)
        .where(eq(quizzes.id, id))
        .returning();
      
      if (!updatedQuiz) {
        throw new Error(`Falha ao atualizar quiz ${id} - nenhum resultado retornado`);
      }
      
      console.log(`✅ STORAGE - Quiz atualizado com sucesso:`, {
        id: updatedQuiz.id,
        title: updatedQuiz.title,
        finalPagesCount: updatedQuiz.structure?.pages?.length || 0,
        finalElementsCount: updatedQuiz.structure?.pages?.reduce((sum, p) => sum + (p.elements?.length || 0), 0) || 0,
        updatedAt: updatedQuiz.updatedAt
      });
      
      return updatedQuiz;
    } catch (error) {
      console.error(`❌ STORAGE - Erro ao atualizar quiz ${id}:`, error);
      throw error;
    }
  }

  async deleteQuiz(id: string): Promise<void> {
    // Deletar em cascata para resolver FOREIGN KEY constraints
    console.log(`🗑️ Deletando quiz ${id} com cascade...`);
    
    try {
      // 1. Deletar todas as variáveis de resposta relacionadas
      await db.delete(responseVariables).where(eq(responseVariables.quizId, id));
      console.log('✅ Variáveis de resposta deletadas');
      
      // 2. Deletar todas as respostas do quiz
      const deleteResponsesStmt = sqlite.prepare('DELETE FROM quiz_responses WHERE quizId = ?');
      deleteResponsesStmt.run(id);
      console.log('✅ Respostas do quiz deletadas');
      
      // 3. Deletar analytics do quiz
      await db.delete(quizAnalytics).where(eq(quizAnalytics.quizId, id));
      console.log('✅ Analytics do quiz deletadas');
      
      // 4. Deletar campanhas relacionadas (SMS, Email, WhatsApp)
      const campaigns = await db.select().from(smsCampaigns).where(eq(smsCampaigns.quizId, id));
      for (const campaign of campaigns) {
        await db.delete(smsLogs).where(eq(smsLogs.campaignId, campaign.id));
      }
      await db.delete(smsCampaigns).where(eq(smsCampaigns.quizId, id));
      
      const emailCampaignsData = await db.select().from(emailCampaigns).where(eq(emailCampaigns.quizId, id));
      for (const campaign of emailCampaignsData) {
        await db.delete(emailLogs).where(eq(emailLogs.campaignId, campaign.id));
      }
      await db.delete(emailCampaigns).where(eq(emailCampaigns.quizId, id));
      
      console.log('✅ Campanhas relacionadas deletadas');
      
      // 5. Finalmente deletar o quiz
      await db.delete(quizzes).where(eq(quizzes.id, id));
      console.log('✅ Quiz deletado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao deletar quiz:', error);
      throw error;
    }
  }

  async duplicateQuiz(id: string, userId: number): Promise<Quiz> {
    console.log(`📋 Duplicando quiz ${id} para usuário ${userId}...`);
    
    try {
      // 1. Buscar quiz original
      const originalQuiz = await this.getQuiz(id);
      if (!originalQuiz) {
        throw new Error(`Quiz ${id} não encontrado`);
      }
      
      // 2. Verificar se o usuário tem permissão para duplicar
      if (originalQuiz.userId !== userId) {
        throw new Error(`Usuário ${userId} não tem permissão para duplicar quiz ${id}`);
      }
      
      // 3. Criar novo quiz com dados do original
      const newQuizId = nanoid();
      const now = Math.floor(Date.now() / 1000);
      
      const duplicatedQuiz = await db.insert(quizzes)
        .values({
          id: newQuizId,
          title: `${originalQuiz.title} (Cópia)`,
          description: originalQuiz.description,
          structure: originalQuiz.structure, // Mantém a estrutura completa
          isPublished: false, // Sempre começa como rascunho
          userId: userId,
          createdAt: now,
          updatedAt: now
        })
        .returning();
      
      console.log(`✅ Quiz duplicado com sucesso: ${newQuizId}`);
      return duplicatedQuiz[0];
    } catch (error) {
      console.error('❌ Erro ao duplicar quiz:', error);
      throw error;
    }
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
    // Usar SQL direto para evitar problemas com colunas não sincronizadas
    const stmt = sqlite.prepare(`
      SELECT 
        id,
        quizId,
        responses,
        metadata,
        submittedAt
      FROM quiz_responses 
      WHERE quizId = ? 
      ORDER BY submittedAt DESC
    `);
    
    const results = stmt.all(quizId);
    
    // Converter para formato QuizResponse
    return results.map((row: any) => ({
      id: row.id,
      quizId: row.quizId,
      responses: typeof row.responses === 'string' ? JSON.parse(row.responses) : row.responses,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      submittedAt: row.submittedAt
    }));
  }

  // MÉTODO ULTRA-SCALE: Buscar respostas recentes dos últimos X segundos
  async getRecentQuizResponses(lastSeconds: number = 60): Promise<QuizResponse[]> {
    const cutoffTime = Math.floor(Date.now() / 1000) - lastSeconds;
    
    // Usar SQL direto para máxima performance
    const stmt = sqlite.prepare(`
      SELECT * FROM quiz_responses 
      WHERE submittedAt > ? 
      AND (
        (json_extract(metadata, '$.isComplete') = 'true') OR 
        (json_extract(metadata, '$.completionPercentage') = 100) OR
        (json_extract(metadata, '$.isComplete') = 'false' AND json_extract(metadata, '$.isPartial') != 'true')
      )
      ORDER BY submittedAt DESC
      LIMIT 1000
    `);
    
    const results = stmt.all(cutoffTime);
    
    // Converter para formato QuizResponse
    return results.map((row: any) => ({
      id: row.id,
      quizId: row.quizId,
      userId: row.userId,
      responses: typeof row.responses === 'string' ? JSON.parse(row.responses) : row.responses,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      submittedAt: row.submittedAt,
      updatedAt: row.updatedAt
    }));
  }

  async createQuizResponse(response: InsertQuizResponse): Promise<QuizResponse> {
    const responseId = nanoid();
    const [newResponse] = await db.insert(quizResponses)
      .values({
        id: responseId,
        ...response,
      })
      .returning();
    
    // SISTEMA AUTOMÁTICO: Extrair variáveis automaticamente após criar resposta
    try {
      const quiz = await this.getQuiz(response.quizId);
      if (quiz) {
        await this.extractAndSaveVariables(newResponse, quiz);
      }
    } catch (error) {
      console.error('❌ ERRO ao extrair variáveis automaticamente:', error);
    }
    
    // SISTEMA AUTOMÁTICO: Atualizar analytics quando resposta for completa
    try {
      if (response.metadata && typeof response.metadata === 'object') {
        const metadata = response.metadata as any;
        if (metadata.isComplete === true || metadata.completionPercentage === 100) {
          console.log(`📊 ATUALIZANDO ANALYTICS: Resposta completa para quiz ${response.quizId}`);
          await this.updateQuizAnalytics(response.quizId, {
            date: new Date().toISOString().split('T')[0],
            views: 0,
            completions: 1,
            conversionRate: 0 // Será recalculado no update
          });
        }
      }
    } catch (error) {
      console.error('❌ ERRO ao atualizar analytics automaticamente:', error);
    }
    
    return newResponse;
  }

  async getQuizResponse(responseId: string): Promise<QuizResponse | undefined> {
    const stmt = sqlite.prepare(`SELECT id, quizId, responses, metadata, submittedAt FROM quiz_responses WHERE id = ?`);
    const row = stmt.get(responseId);
    
    if (!row) return undefined;
    
    return {
      id: row.id,
      quizId: row.quizId,
      responses: typeof row.responses === 'string' ? JSON.parse(row.responses) : row.responses,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      submittedAt: row.submittedAt
    };
  }

  async updateQuizResponse(responseId: string, updates: Partial<QuizResponse>): Promise<QuizResponse> {
    // Construir query dinamicamente baseado nos updates
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    const stmt = sqlite.prepare(`UPDATE quiz_responses SET ${setClause} WHERE id = ?`);
    const result = stmt.run(...values, responseId);
    
    if (result.changes === 0) {
      throw new Error(`Response with id ${responseId} not found`);
    }
    
    // Buscar o registro atualizado
    const getStmt = sqlite.prepare(`SELECT id, quizId, responses, metadata, submittedAt FROM quiz_responses WHERE id = ?`);
    const row = getStmt.get(responseId);
    
    return {
      id: row.id,
      quizId: row.quizId,
      responses: typeof row.responses === 'string' ? JSON.parse(row.responses) : row.responses,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      submittedAt: row.submittedAt
    };
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
    try {
      const today = analytics.date || new Date().toISOString().split('T')[0];
      
      // CRITICAL: Usar better-sqlite3 diretamente - SEMPRE FUNCIONA
      console.log(`📊 [ANALYTICS] INICIANDO: Quiz ${quizId}, Date ${today}, Views +${analytics.views || 0}`);
      
      // Verificar se sqlite está disponível
      if (!sqlite) {
        console.error(`❌ [ANALYTICS] SQLITE NÃO DISPONÍVEL!`);
        throw new Error('SQLite connection not available');
      }
      
      // Primeiro tentar UPDATE
      const updateStmt = sqlite.prepare(`
        UPDATE quiz_analytics 
        SET views = views + ?, completions = completions + ?, 
            conversionRate = CASE 
              WHEN (views + ?) > 0 THEN (CAST((completions + ?) AS FLOAT) / (views + ?)) * 100 
              ELSE 0 
            END
        WHERE quizId = ? AND date = ?
      `);
      
      const newViews = analytics.views || 0;
      const newCompletions = analytics.completions || 0;
      
      const result = updateStmt.run(
        newViews,
        newCompletions,
        newViews,
        newCompletions,
        newViews,
        quizId,
        today
      );
      
      console.log(`📊 [ANALYTICS] UPDATE RESULT: ${result.changes} rows changed`);
      
      // Se não existir registro para hoje, criar novo
      if (result.changes === 0) {
        console.log(`📊 [ANALYTICS] CRIANDO NOVO REGISTRO para ${quizId}-${today}`);
        
        const insertStmt = sqlite.prepare(`
          INSERT INTO quiz_analytics (id, quizId, date, views, completions, conversionRate)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        const insertId = nanoid();
        const views = analytics.views || 0;
        const completions = analytics.completions || 0;
        const conversionRate = views > 0 ? (completions / views) * 100 : 0;
        
        const insertResult = insertStmt.run(
          insertId,
          quizId,
          today,
          views,
          completions,
          conversionRate
        );
        
        console.log(`📊 [ANALYTICS] INSERT RESULT: ${insertResult.changes} rows inserted, ID: ${insertId}`);
      }
      
      // Verificar se foi salvo corretamente
      const verifyStmt = sqlite.prepare(`
        SELECT * FROM quiz_analytics WHERE quizId = ? AND date = ?
      `);
      
      const saved = verifyStmt.get(quizId, today);
      if (saved) {
        console.log(`📊 [ANALYTICS] ✅ SUCESSO: Views=${saved.views}, Completions=${saved.completions}`);
      } else {
        console.error(`📊 [ANALYTICS] ❌ ERRO: Registro não encontrado após insert/update`);
        throw new Error('Analytics not saved correctly');
      }
      
      console.log(`📊 [ANALYTICS] ✅ FINALIZADO: Quiz ${quizId}, Views total: ${saved?.views || 0}`);
      
    } catch (error) {
      console.error(`❌ [ANALYTICS] ERRO CRÍTICO:`, error);
      console.error(`❌ [ANALYTICS] Stack trace:`, error.stack);
      throw error;
    }
  }

  async resetQuizAnalytics(quizId: string): Promise<void> {
    try {
      console.log(`🔄 [RESET] Iniciando reset de analytics para quiz: ${quizId}`);
      
      // Delete all analytics data for this quiz
      const deleteAnalyticsStmt = sqlite.prepare(`DELETE FROM quiz_analytics WHERE quizId = ?`);
      const analyticsResult = deleteAnalyticsStmt.run(quizId);
      
      // Delete all quiz responses for this quiz  
      const deleteResponsesStmt = sqlite.prepare(`DELETE FROM quiz_responses WHERE quizId = ?`);
      const responsesResult = deleteResponsesStmt.run(quizId);
      
      console.log(`✅ [RESET] Analytics deletados: ${analyticsResult.changes} registros`);
      console.log(`✅ [RESET] Respostas deletadas: ${responsesResult.changes} registros`);
      console.log(`✅ [RESET] Reset completo para quiz: ${quizId}`);
      
    } catch (error) {
      console.error(`❌ [RESET] Erro ao resetar analytics:`, error);
      throw error;
    }
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
    // OTIMIZADO PARA 100K+ USUÁRIOS - Uma única query SQLite raw
    const stmt = sqlite.prepare(`
      SELECT 
        COUNT(DISTINCT q.id) as totalQuizzes,
        COUNT(DISTINCT qr.id) as totalLeads,
        COALESCE(SUM(qa.views), 0) as totalViews,
        COALESCE(AVG(qa.conversionRate), 0) as avgConversionRate
      FROM quizzes q
      LEFT JOIN quiz_responses qr ON q.id = qr.quizId
      LEFT JOIN quiz_analytics qa ON q.id = qa.quizId
      WHERE q.userId = ?
    `);
    
    const result = stmt.get(userId);
    
    return {
      totalQuizzes: result?.totalQuizzes || 0,
      totalLeads: result?.totalLeads || 0,
      totalViews: result?.totalViews || 0,
      avgConversionRate: result?.avgConversionRate || 0,
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
    const now = Math.floor(Date.now() / 1000);
    const newCampaign = {
      id: nanoid(),
      ...campaign,
      createdAt: campaign.createdAt || now,
      updatedAt: campaign.updatedAt || now,
    };
    
    console.log('📧 DEBUG - CRIANDO CAMPANHA:', JSON.stringify(newCampaign, null, 2));
    console.log('📧 DEBUG - TIPOS DOS CAMPOS:');
    Object.keys(newCampaign).forEach(key => {
      console.log(`  ${key}: ${typeof newCampaign[key]} = ${newCampaign[key]}`);
    });
    
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
    console.log(`📧 BUSCANDO RESPOSTAS PARA EMAIL - Quiz: ${quizId}, Audience: ${targetAudience}`);
    
    const stmt = sqlite.prepare(`
      SELECT id, quizId, responses, metadata, submittedAt
      FROM quiz_responses
      WHERE quizId = ?
      AND (
        (json_extract(metadata, '$.isComplete') = 'true') OR 
        (json_extract(metadata, '$.completionPercentage') = 100) OR
        (json_extract(metadata, '$.isComplete') = 'false' AND json_extract(metadata, '$.isPartial') != 'true')
      )
    `);
    
    const allResponses = stmt.all(quizId);
    console.log(`📧 RESPOSTAS ENCONTRADAS: ${allResponses.length}`);
    
    // Filtrar por audiência
    const filteredResponses = allResponses.filter(response => {
      const metadata = JSON.parse(response.metadata || '{}');
      const isComplete = metadata.isComplete === true || metadata.completionPercentage === 100;
      
      if (targetAudience === 'completed') {
        return isComplete;
      } else if (targetAudience === 'abandoned') {
        return !isComplete;
      }
      
      return true; // 'all'
    });
    
    console.log(`📧 RESPOSTAS FILTRADAS (${targetAudience}): ${filteredResponses.length}`);
    
    return filteredResponses.map(response => ({
      ...response,
      responses: JSON.parse(response.responses || '{}'),
      metadata: JSON.parse(response.metadata || '{}')
    }));
  }

  extractEmailsFromResponses(responses: QuizResponse[]): string[] {
    const emails: string[] = [];
    
    responses.forEach((response) => {
      if (response.responses) {
        const responseData = response.responses as any;
        
        if (Array.isArray(responseData)) {
          // Formato novo: array de objetos com elementType e answer
          responseData.forEach((item) => {
            if (item.elementType === 'email' && item.answer) {
              // Validação básica de email
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (emailRegex.test(item.answer)) {
                emails.push(item.answer);
              }
            }
          });
        } else if (typeof responseData === 'object') {
          // Formato antigo: objeto com chaves
          Object.keys(responseData).forEach(key => {
            const value = responseData[key];
            
            // Verificar se é uma string válida e contém @ (email)
            if (value && typeof value === 'string' && value.includes('@')) {
              // Validação básica de email
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (emailRegex.test(value)) {
                emails.push(value);
              }
            }
          });
        }
      }
    });
    
    // Remover duplicatas
    return Array.from(new Set(emails));
  }

  // Método para extrair variáveis disponíveis das respostas
  extractVariablesFromResponses(responses: QuizResponse[]): string[] {
    const variables = new Set<string>();
    
    responses.forEach(response => {
      if (response.responses) {
        const responseData = response.responses as any;
        
        if (Array.isArray(responseData)) {
          // Formato novo: array de objetos com elementType e answer
          responseData.forEach((item) => {
            if (item.elementFieldId && item.answer) {
              variables.add(item.elementFieldId);
            }
          });
        } else if (typeof responseData === 'object') {
          // Formato antigo: objeto com chaves
          Object.keys(responseData).forEach(key => {
            if (responseData[key]) {
              variables.add(key);
            }
          });
        }
      }
    });
    
    return Array.from(variables).sort();
  }

  // Método para buscar uma resposta específica
  async getQuizResponse(id: string): Promise<QuizResponse | undefined> {
    const stmt = sqlite.prepare(`
      SELECT id, quizId, responses, metadata, submittedAt
      FROM quiz_responses
      WHERE id = ?
    `);
    
    const response = stmt.get(id);
    if (!response) return undefined;
    
    return {
      ...response,
      responses: JSON.parse(response.responses || '{}'),
      metadata: JSON.parse(response.metadata || '{}')
    };
  }

  // Método para deletar uma resposta específica
  async deleteQuizResponse(id: string): Promise<void> {
    const stmt = sqlite.prepare(`
      DELETE FROM quiz_responses
      WHERE id = ?
    `);
    
    stmt.run(id);
  }

  // Método para criar logs de email (CORRIGIDO)
  async createEmailLog(logData: any): Promise<void> {
    try {
      const stmt = sqlite.prepare(`
        INSERT INTO email_logs (
          id, campaignId, email, personalizedSubject, personalizedContent, 
          leadData, status, errorMessage, sentAt, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const logEntry = {
        id: nanoid(),
        campaignId: String(logData.campaignId || ''),
        email: String(logData.email || ''),
        personalizedSubject: String(logData.personalizedSubject || logData.subject || 'Assunto não especificado'),
        personalizedContent: String(logData.personalizedContent || logData.content || 'Conteúdo não especificado'),
        leadData: JSON.stringify(logData.leadData || {}),
        status: String(logData.status || 'pending'),
        errorMessage: logData.error ? String(logData.error) : null,
        sentAt: logData.sentAt ? (typeof logData.sentAt === 'number' ? logData.sentAt : Math.floor(new Date(logData.sentAt).getTime() / 1000)) : null,
        createdAt: Math.floor(Date.now() / 1000)
      };
      
      stmt.run(
        logEntry.id,
        logEntry.campaignId,
        logEntry.email,
        logEntry.personalizedSubject,
        logEntry.personalizedContent,
        logEntry.leadData,
        logEntry.status,
        logEntry.errorMessage,
        logEntry.sentAt,
        logEntry.createdAt
      );
    } catch (error) {
      console.error('❌ ERRO ao criar log de email:', error);
      throw error;
    }
  }

  // Método para buscar logs de email (CORRIGIDO)
  async getEmailLogs(campaignId: string): Promise<any[]> {
    const stmt = sqlite.prepare(`
      SELECT * FROM email_logs 
      WHERE campaignId = ? 
      ORDER BY createdAt DESC
    `);
    
    const logs = stmt.all(campaignId);
    return logs.map(log => ({
      ...log,
      leadData: JSON.parse(log.leadData || '{}')
    }));
  }

  // Método para atualizar estatísticas de campanha de email (ADICIONADO)
  async updateEmailCampaignStats(campaignId: string, stats: any): Promise<void> {
    const stmt = sqlite.prepare(`
      UPDATE email_campaigns 
      SET sent = ?, delivered = ?, opened = ?, clicked = ?, updatedAt = ?
      WHERE id = ?
    `);
    
    stmt.run(
      stats.sent || 0,
      stats.delivered || 0,
      stats.opened || 0,
      stats.clicked || 0,
      Math.floor(Date.now() / 1000),
      campaignId
    );
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
      messages: JSON.stringify(data.messages || []),
      user_id: data.userId,
      phones: JSON.stringify(data.phones || []),
      status: data.status || 'active',
      scheduled_at: data.scheduledAt,
      trigger_delay: data.triggerDelay || 10,
      trigger_unit: data.triggerUnit || 'minutes',
      target_audience: data.targetAudience || 'all',
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
      (id, name, quiz_id, message, user_id, phones, status, scheduled_at, trigger_delay, trigger_unit, target_audience, extension_settings, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      campaign.id, campaign.name, campaign.quiz_id, campaign.messages, 
      campaign.user_id, campaign.phones, campaign.status, campaign.scheduled_at,
      campaign.trigger_delay, campaign.trigger_unit, campaign.target_audience,
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
      
      const result = {
        ...campaign,
        phones: JSON.parse(campaign.phones || '[]'),
        extensionSettings: JSON.parse(campaign.extension_settings || '{}'),
        messages: JSON.parse(campaign.messages || '[]'),
        ...stats,
        quizId: campaign.quiz_id // Mapear quiz_id para quizId
      };
      
      // Debug: verificar se quizId foi perdido
      if (!result.quizId && campaign.quiz_id) {
        console.log(`🚨 DEBUG: quizId perdido para campanha ${campaign.id}`);
        console.log(`   campaign.quiz_id: ${campaign.quiz_id}`);
        console.log(`   stats:`, Object.keys(stats));
        result.quizId = campaign.quiz_id; // forçar o valor
      }
      
      return result;
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
        quizId: campaign.quiz_id, // Mapear quiz_id para quizId
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

  // OTIMIZAÇÃO: Buscar campanhas ativas com limite para reduzir sobrecarga
  async getActiveCampaignsLimited(limit: number = 25): Promise<any[]> {
    try {
      const campaigns = await db.select()
        .from(smsCampaigns)
        .where(eq(smsCampaigns.status, 'active'))
        .orderBy(desc(smsCampaigns.createdAt))
        .limit(limit);
      
      return campaigns.map(campaign => ({
        ...campaign,
        phones: JSON.parse(campaign.phones || '[]')
      }));
    } catch (error) {
      console.error('Erro ao buscar campanhas ativas limitadas:', error);
      return [];
    }
  }

  // OTIMIZAÇÃO: Buscar telefones por campanha com limite
  async getPhonesByCampaign(campaignId: string, limit: number = 100): Promise<string[]> {
    try {
      const campaign = await db.select()
        .from(smsCampaigns)
        .where(eq(smsCampaigns.id, campaignId))
        .limit(1);
      
      if (!campaign[0] || !campaign[0].phones) return [];
      
      const phones = JSON.parse(campaign[0].phones);
      return Array.isArray(phones) ? phones.slice(0, limit) : [];
    } catch (error) {
      console.error('Erro ao buscar telefones por campanha:', error);
      return [];
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
      SELECT responses, metadata, submittedAt
      FROM quiz_responses
      WHERE quizId = ?
      AND (
        (json_extract(metadata, '$.isComplete') = 'true') OR 
        (json_extract(metadata, '$.completionPercentage') = 100) OR
        (json_extract(metadata, '$.isComplete') = 'false' AND json_extract(metadata, '$.isPartial') != 'true')
      )
    `);
    
    console.log(`🔍 BUSCANDO TELEFONES PARA QUIZ: ${quizId}`);
    const responses = stmt.all(quizId);
    console.log(`📊 RESPOSTAS ENCONTRADAS: ${responses.length}`);
    
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
          // Buscar por element type 'phone' ou fieldId que contenha 'telefone'
          if ((item.elementType === 'phone' || 
               (item.elementFieldId && item.elementFieldId.includes('telefone'))) && 
              item.answer) {
            phoneNumber = item.answer;
            console.log(`📱 TELEFONE ENCONTRADO: ${phoneNumber} (${item.elementType || 'fieldId'})`);
            break;
          }
        }
      } else if (typeof parsedResponses === 'object') {
        for (const [key, value] of Object.entries(parsedResponses)) {
          if (key.includes('telefone') && value) {
            phoneNumber = value;
            console.log(`📱 TELEFONE ENCONTRADO: ${phoneNumber} (chave: ${key})`);
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
              submittedAt: response.submittedAt
            });
          }
        }
      }
    }
    
    console.log(`📱 TELEFONES EXTRAÍDOS: ${phoneData.length}`);
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
  // =============================================
  // VOICE CALLING METHODS
  // =============================================

  async createVoiceCampaign(campaign: InsertVoiceCampaign): Promise<VoiceCampaign> {
    try {
      const campaignId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const campaignData = {
        ...campaign,
        id: campaignId,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      };

      const stmt = sqlite.prepare(`
        INSERT INTO voice_campaigns (
          id, name, quiz_id, user_id, voice_message, voice_file, voice_type, voice_settings,
          phones, status, target_audience, campaign_mode, trigger_delay, trigger_unit,
          max_retries, retry_delay, call_timeout, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        campaignData.id,
        campaignData.name,
        campaignData.quizId,
        campaignData.userId,
        campaignData.voiceMessage,
        campaignData.voiceFile || null,
        campaignData.voiceType || 'tts',
        JSON.stringify(campaignData.voiceSettings || {}),
        JSON.stringify(campaignData.phones),
        campaignData.status || 'pending',
        campaignData.targetAudience || 'all',
        campaignData.campaignMode || 'leads_ja_na_base',
        campaignData.triggerDelay || 10,
        campaignData.triggerUnit || 'minutes',
        campaignData.maxRetries || 3,
        campaignData.retryDelay || 60,
        campaignData.callTimeout || 30,
        campaignData.createdAt,
        campaignData.updatedAt
      );

      return campaignData as VoiceCampaign;
    } catch (error) {
      console.error('❌ ERRO ao criar campanha de voz:', error);
      throw error;
    }
  }

  async getVoiceCampaigns(userId: string): Promise<VoiceCampaign[]> {
    try {
      const stmt = sqlite.prepare(`
        SELECT *, 
               (SELECT COUNT(*) FROM voice_logs WHERE campaign_id = voice_campaigns.id AND status = 'answered') as answered,
               (SELECT COUNT(*) FROM voice_logs WHERE campaign_id = voice_campaigns.id AND status = 'voicemail') as voicemail,
               (SELECT COUNT(*) FROM voice_logs WHERE campaign_id = voice_campaigns.id AND status = 'busy') as busy,
               (SELECT COUNT(*) FROM voice_logs WHERE campaign_id = voice_campaigns.id AND status = 'failed') as failed
        FROM voice_campaigns 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `);

      const campaigns = stmt.all(userId);
      return campaigns.map(campaign => ({
        ...campaign,
        phones: JSON.parse(campaign.phones || '[]'),
        voiceSettings: JSON.parse(campaign.voice_settings || '{}')
      }));
    } catch (error) {
      console.error('❌ ERRO ao buscar campanhas de voz:', error);
      return [];
    }
  }

  async getVoiceCampaign(campaignId: string): Promise<VoiceCampaign | null> {
    try {
      const stmt = sqlite.prepare('SELECT * FROM voice_campaigns WHERE id = ?');
      const campaign = stmt.get(campaignId);
      
      if (!campaign) return null;

      return {
        ...campaign,
        phones: JSON.parse(campaign.phones || '[]'),
        voiceSettings: JSON.parse(campaign.voice_settings || '{}')
      };
    } catch (error) {
      console.error('❌ ERRO ao buscar campanha de voz:', error);
      return null;
    }
  }

  async updateVoiceCampaign(campaignId: string, updates: Partial<VoiceCampaign>): Promise<void> {
    try {
      const setClause = Object.keys(updates)
        .filter(key => key !== 'id')
        .map(key => `${key} = ?`).join(', ');
      
      const values = Object.keys(updates)
        .filter(key => key !== 'id')
        .map(key => {
          const value = updates[key as keyof VoiceCampaign];
          if (key === 'phones' || key === 'voiceSettings') {
            return JSON.stringify(value);
          }
          return value;
        });

      const stmt = sqlite.prepare(`UPDATE voice_campaigns SET ${setClause}, updated_at = ? WHERE id = ?`);
      stmt.run(...values, Math.floor(Date.now() / 1000), campaignId);
    } catch (error) {
      console.error('❌ ERRO ao atualizar campanha de voz:', error);
      throw error;
    }
  }

  async deleteVoiceCampaign(campaignId: string): Promise<void> {
    try {
      // Primeiro deletar todos os logs relacionados
      const deleteLogsStmt = sqlite.prepare('DELETE FROM voice_logs WHERE campaign_id = ?');
      deleteLogsStmt.run(campaignId);

      // Depois deletar a campanha
      const deleteCampaignStmt = sqlite.prepare('DELETE FROM voice_campaigns WHERE id = ?');
      deleteCampaignStmt.run(campaignId);
    } catch (error) {
      console.error('❌ ERRO ao deletar campanha de voz:', error);
      throw error;
    }
  }

  async createVoiceLog(logData: {
    id: string;
    campaignId: string;
    phone: string;
    voiceMessage: string;
    voiceFile?: string;
    status: string;
    scheduledAt?: number;
  }): Promise<VoiceLog> {
    try {
      const stmt = sqlite.prepare(`
        INSERT INTO voice_logs (
          id, campaign_id, phone, voice_message, voice_file, status, scheduled_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        logData.id,
        logData.campaignId,
        logData.phone,
        logData.voiceMessage,
        logData.voiceFile || null,
        logData.status,
        logData.scheduledAt || null,
        Math.floor(Date.now() / 1000)
      );

      return logData as VoiceLog;
    } catch (error) {
      console.error('❌ ERRO ao criar log de voz:', error);
      throw error;
    }
  }

  async getVoiceLogs(campaignId: string): Promise<VoiceLog[]> {
    try {
      const stmt = sqlite.prepare(`
        SELECT * FROM voice_logs 
        WHERE campaign_id = ? 
        ORDER BY created_at DESC
      `);
      
      return stmt.all(campaignId);
    } catch (error) {
      console.error('❌ ERRO ao buscar logs de voz:', error);
      return [];
    }
  }

  async updateVoiceLog(logId: string, updates: Partial<VoiceLog>): Promise<void> {
    try {
      const setClause = Object.keys(updates)
        .filter(key => key !== 'id')
        .map(key => `${key} = ?`).join(', ');
      
      const values = Object.keys(updates)
        .filter(key => key !== 'id')
        .map(key => updates[key as keyof VoiceLog]);

      const stmt = sqlite.prepare(`UPDATE voice_logs SET ${setClause} WHERE id = ?`);
      stmt.run(...values, logId);
    } catch (error) {
      console.error('❌ ERRO ao atualizar log de voz:', error);
      throw error;
    }
  }

  async getScheduledVoiceLogs(): Promise<VoiceLog[]> {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const stmt = sqlite.prepare(`
        SELECT * FROM voice_logs 
        WHERE status = 'scheduled' 
        AND scheduled_at <= ? 
        ORDER BY scheduled_at ASC 
        LIMIT 100
      `);
      
      return stmt.all(currentTime);
    } catch (error) {
      console.error('❌ ERRO ao buscar logs de voz agendados:', error);
      return [];
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

  async updateWhatsappAutomationFile(fileId: string, updates: { last_updated?: string }): Promise<void> {
    const newTimestamp = updates.last_updated || new Date().toISOString();
    
    console.log(`💾 DEBUG UPDATE: fileId=${fileId}, newTimestamp=${newTimestamp}`);
    
    const stmt = sqlite.prepare(`
      UPDATE whatsapp_automation_files 
      SET last_updated = ? 
      WHERE id = ?
    `);
    
    const result = stmt.run(newTimestamp, fileId);
    console.log(`💾 DEBUG RESULT: changes=${result.changes}, lastInsertRowid=${result.lastInsertRowid}`);
    
    // Verificar se a atualização foi bem-sucedida
    if (result.changes === 0) {
      console.log(`⚠️ AVISO: Nenhuma linha foi atualizada para fileId=${fileId}`);
    } else {
      console.log(`✅ Atualização bem-sucedida para fileId=${fileId}`);
    }
  }

  async deleteAutomationFile(fileId: string): Promise<void> {
    const stmt = sqlite.prepare(`
      DELETE FROM whatsapp_automation_files WHERE id = ?
    `);
    
    stmt.run(fileId);
  }

  // Email Logs operations
  async getEmailLogs(campaignId: string): Promise<EmailLog[]> {
    const logs = await db.select()
      .from(emailLogs)
      .where(eq(emailLogs.campaignId, campaignId))
      .orderBy(desc(emailLogs.createdAt));
    
    return logs.map(log => ({
      ...log,
      leadData: log.leadData ? JSON.parse(log.leadData) : null
    }));
  }

  async createEmailLog(log: InsertEmailLog): Promise<EmailLog> {
    const newLog = {
      id: crypto.randomUUID(),
      campaignId: log.campaignId,
      email: log.email,
      personalizedSubject: log.personalizedSubject,
      personalizedContent: log.personalizedContent,
      leadData: log.leadData ? JSON.stringify(log.leadData) : null,
      status: log.status,
      sendgridId: log.sendgridId || null,
      errorMessage: log.errorMessage || null,
      sentAt: log.sentAt || null,
      deliveredAt: log.deliveredAt || null,
      openedAt: log.openedAt || null,
      clickedAt: log.clickedAt || null,
      scheduledAt: log.scheduledAt || null,
      createdAt: Math.floor(Date.now() / 1000)
    };
    
    await db.insert(emailLogs).values(newLog);
    
    return {
      ...newLog,
      leadData: log.leadData || null
    };
  }

  async updateEmailLogStatus(logId: string, status: string, data?: any): Promise<EmailLog> {
    const updateData: any = { status };
    const now = Math.floor(Date.now() / 1000);
    
    if (status === 'sent' && data?.sendgridId) {
      updateData.sendgridId = data.sendgridId;
      updateData.sentAt = now;
    } else if (status === 'delivered') {
      updateData.deliveredAt = now;
    } else if (status === 'opened') {
      updateData.openedAt = now;
    } else if (status === 'clicked') {
      updateData.clickedAt = now;
    } else if (status === 'bounced' || status === 'complained') {
      updateData.errorMessage = data?.errorMessage || null;
    }
    
    await db.update(emailLogs)
      .set(updateData)
      .where(eq(emailLogs.id, logId));
    
    const updatedLog = await db.select()
      .from(emailLogs)
      .where(eq(emailLogs.id, logId))
      .get();
    
    return {
      ...updatedLog,
      leadData: updatedLog.leadData ? JSON.parse(updatedLog.leadData) : null
    };
  }

  // Email Automation operations
  async getEmailAutomations(userId: string): Promise<EmailAutomation[]> {
    const automations = await db.select()
      .from(emailAutomations)
      .where(eq(emailAutomations.userId, userId))
      .orderBy(desc(emailAutomations.createdAt));
    
    return automations.map(automation => ({
      ...automation,
      conditions: automation.conditions ? JSON.parse(automation.conditions) : null,
      sequence: JSON.parse(automation.sequence)
    }));
  }

  async getEmailAutomation(id: string): Promise<EmailAutomation | undefined> {
    const automation = await db.select()
      .from(emailAutomations)
      .where(eq(emailAutomations.id, id))
      .get();
    
    if (!automation) return undefined;
    
    return {
      ...automation,
      conditions: automation.conditions ? JSON.parse(automation.conditions) : null,
      sequence: JSON.parse(automation.sequence)
    };
  }

  async createEmailAutomation(automation: InsertEmailAutomation): Promise<EmailAutomation> {
    const newAutomation = {
      id: crypto.randomUUID(),
      ...automation,
      conditions: automation.conditions ? JSON.stringify(automation.conditions) : null,
      sequence: JSON.stringify(automation.sequence),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.insert(emailAutomations).values(newAutomation);
    
    return {
      ...newAutomation,
      conditions: automation.conditions || null,
      sequence: automation.sequence
    };
  }

  async updateEmailAutomation(id: string, updates: Partial<InsertEmailAutomation>): Promise<EmailAutomation> {
    const updateData: any = { ...updates, updatedAt: new Date() };
    
    if (updates.conditions) {
      updateData.conditions = JSON.stringify(updates.conditions);
    }
    
    if (updates.sequence) {
      updateData.sequence = JSON.stringify(updates.sequence);
    }
    
    await db.update(emailAutomations)
      .set(updateData)
      .where(eq(emailAutomations.id, id));
    
    const updatedAutomation = await db.select()
      .from(emailAutomations)
      .where(eq(emailAutomations.id, id))
      .get();
    
    return {
      ...updatedAutomation,
      conditions: updatedAutomation.conditions ? JSON.parse(updatedAutomation.conditions) : null,
      sequence: JSON.parse(updatedAutomation.sequence)
    };
  }

  async deleteEmailAutomation(id: string): Promise<void> {
    await db.delete(emailAutomations)
      .where(eq(emailAutomations.id, id));
  }

  // Email Sequence operations
  async getEmailSequences(automationId: string): Promise<EmailSequence[]> {
    const sequences = await db.select()
      .from(emailSequences)
      .where(eq(emailSequences.automationId, automationId))
      .orderBy(desc(emailSequences.createdAt));
    
    return sequences.map(sequence => ({
      ...sequence,
      leadData: sequence.leadData ? JSON.parse(sequence.leadData) : null
    }));
  }

  async createEmailSequence(sequence: InsertEmailSequence): Promise<EmailSequence> {
    const newSequence = {
      id: crypto.randomUUID(),
      ...sequence,
      leadData: sequence.leadData ? JSON.stringify(sequence.leadData) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.insert(emailSequences).values(newSequence);
    
    return {
      ...newSequence,
      leadData: sequence.leadData || null
    };
  }

  async updateEmailSequence(id: string, updates: Partial<InsertEmailSequence>): Promise<EmailSequence> {
    const updateData: any = { ...updates, updatedAt: new Date() };
    
    if (updates.leadData) {
      updateData.leadData = JSON.stringify(updates.leadData);
    }
    
    await db.update(emailSequences)
      .set(updateData)
      .where(eq(emailSequences.id, id));
    
    const updatedSequence = await db.select()
      .from(emailSequences)
      .where(eq(emailSequences.id, id))
      .get();
    
    return {
      ...updatedSequence,
      leadData: updatedSequence.leadData ? JSON.parse(updatedSequence.leadData) : null
    };
  }

  async deleteEmailSequence(id: string): Promise<void> {
    await db.delete(emailSequences)
      .where(eq(emailSequences.id, id));
  }

  // Quiz Pixels operations
  async updateQuizPixels(quizId: string, pixelData: {
    pixels: any[],
    customScripts?: string[],
    utmCode?: string,
    pixelDelay?: boolean
  }): Promise<{ success: boolean, pixelCount: number }> {
    try {
      const updateData: any = {
        trackingPixels: JSON.stringify(pixelData.pixels),
        updatedAt: Math.floor(Date.now() / 1000)
      };

      if (pixelData.utmCode !== undefined) {
        updateData.utmTrackingCode = pixelData.utmCode;
      }

      if (pixelData.pixelDelay !== undefined) {
        updateData.pixelDelay = pixelData.pixelDelay;
      }

      await db.update(quizzes)
        .set(updateData)
        .where(eq(quizzes.id, quizId));
      return {
        success: true,
        pixelCount: pixelData.pixels.length
      };
    } catch (error) {
      console.error('❌ Erro ao atualizar pixels do quiz:', error);
      return {
        success: false,
        pixelCount: 0
      };
    }
  }

  // Email personalization operations
  personalizeEmailContent(content: string, leadData: any): string {
    let personalizedContent = content;
    
    // Variáveis padrão
    const variables = {
      nome: leadData.nome || leadData.name || 'Usuário',
      email: leadData.email || '',
      telefone: leadData.telefone || leadData.phone || '',
      idade: leadData.idade || leadData.age || '',
      altura: leadData.altura || leadData.height || '',
      peso_atual: leadData.peso_atual || leadData.current_weight || '',
      peso_objetivo: leadData.peso_objetivo || leadData.target_weight || '',
      data_nascimento: leadData.data_nascimento || leadData.birth_date || '',
      primeira_vez: leadData.primeira_vez || leadData.first_time || '',
      meta_principal: leadData.meta_principal || leadData.main_goal || '',
      motivacao: leadData.motivacao || leadData.motivation || '',
      desafios: leadData.desafios || leadData.challenges || '',
      nivel_experiencia: leadData.nivel_experiencia || leadData.experience_level || '',
      disponibilidade: leadData.disponibilidade || leadData.availability || ''
    };
    
    // Substituir variáveis no conteúdo
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{${key}}`, 'g');
      personalizedContent = personalizedContent.replace(regex, value || '');
    }
    
    return personalizedContent;
  }

  async getScheduledEmails(): Promise<EmailLog[]> {
    const now = Math.floor(Date.now() / 1000);
    
    const scheduledEmails = await db.select()
      .from(emailLogs)
      .where(
        and(
          eq(emailLogs.status, 'scheduled'),
          lte(emailLogs.scheduledAt, now)
        )
      )
      .orderBy(emailLogs.scheduledAt);
    
    return scheduledEmails.map(log => ({
      ...log,
      leadData: log.leadData ? JSON.parse(log.leadData) : null
    }));
  }

  async processEmailSequences(): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    
    // Buscar sequências que precisam processar próximo email
    const sequencesToProcess = await db.select()
      .from(emailSequences)
      .where(
        and(
          eq(emailSequences.status, 'active'),
          lte(emailSequences.nextEmailAt, now)
        )
      );
    
    for (const sequence of sequencesToProcess) {
      try {
        // Buscar automação
        const automation = await this.getEmailAutomation(sequence.automationId);
        if (!automation || !automation.isActive) continue;
        
        const sequenceData = automation.sequence;
        
        // Verificar se há próximo email na sequência
        if (sequence.currentStep < sequenceData.length) {
          const nextEmail = sequenceData[sequence.currentStep];
          
          // Criar email log para envio
          const emailLog = await this.createEmailLog({
            campaignId: sequence.automationId,
            email: sequence.leadEmail,
            personalizedSubject: this.personalizeEmailContent(nextEmail.subject, sequence.leadData),
            personalizedContent: this.personalizeEmailContent(nextEmail.content, sequence.leadData),
            leadData: sequence.leadData,
            status: 'scheduled',
            scheduledAt: now
          });
          
          // Atualizar sequência para próximo step
          const nextStep = sequence.currentStep + 1;
          const nextEmailDelay = nextStep < sequenceData.length ? 
            sequenceData[nextStep].delay * 60 * 60 : // converter horas para segundos
            null;
          
          await this.updateEmailSequence(sequence.id, {
            currentStep: nextStep,
            nextEmailAt: nextEmailDelay ? now + nextEmailDelay : null,
            status: nextStep >= sequenceData.length ? 'completed' : 'active'
          });
        }
      } catch (error) {
        console.error('Erro ao processar sequência de email:', error);
      }
    }
  }

  // FUNÇÕES NECESSÁRIAS PARA DETECÇÃO AUTOMÁTICA DE EMAIL
  async getAllEmailCampaigns(): Promise<EmailCampaign[]> {
    try {
      const campaigns = await db.select()
        .from(emailCampaigns)
        .orderBy(desc(emailCampaigns.createdAt));
      
      return campaigns.map(campaign => ({
        ...campaign,
        leadData: campaign.leadData ? JSON.parse(campaign.leadData) : null
      }));
    } catch (error) {
      console.error('Error getting all email campaigns:', error);
      throw error;
    }
  }

  async getQuizResponsesForEmails(quizId: string): Promise<QuizResponse[]> {
    try {
      const responses = await db.select()
        .from(quizResponses)
        .where(eq(quizResponses.quizId, quizId))
        .orderBy(desc(quizResponses.submittedAt));
      
      return responses.map(response => ({
        ...response,
        responses: typeof response.responses === 'string' ? 
          JSON.parse(response.responses) : response.responses,
        metadata: typeof response.metadata === 'string' ? 
          JSON.parse(response.metadata) : response.metadata
      }));
    } catch (error) {
      console.error('Error getting quiz responses for emails:', error);
      throw error;
    }
  }

  async getEmailLogsByCampaign(campaignId: string): Promise<EmailLog[]> {
    try {
      const logs = await db.select()
        .from(emailLogs)
        .where(eq(emailLogs.campaignId, campaignId))
        .orderBy(desc(emailLogs.createdAt));
      
      return logs.map(log => ({
        ...log,
        leadData: log.leadData ? JSON.parse(log.leadData) : null
      }));
    } catch (error) {
      console.error('Error getting email logs by campaign:', error);
      throw error;
    }
  }

  async getEmailLogsByUser(userId: string): Promise<EmailLog[]> {
    try {
      // Buscar campanhas do usuário primeiro
      const userCampaigns = await db.select()
        .from(emailCampaigns)
        .where(eq(emailCampaigns.userId, userId));
      
      if (userCampaigns.length === 0) {
        return [];
      }
      
      // Extrair IDs das campanhas
      const campaignIds = userCampaigns.map(c => c.id);
      
      // Buscar logs das campanhas do usuário
      const logs = await db.select()
        .from(emailLogs)
        .where(inArray(emailLogs.campaignId, campaignIds))
        .orderBy(desc(emailLogs.createdAt));
      
      return logs.map(log => ({
        ...log,
        leadData: log.leadData ? JSON.parse(log.leadData) : null
      }));
    } catch (error) {
      console.error('Error getting email logs by user:', error);
      throw error;
    }
  }

  // Método getEmailLogs que é chamado pelo endpoint
  async getEmailLogs(campaignId: string): Promise<EmailLog[]> {
    return this.getEmailLogsByCampaign(campaignId);
  }

  // Função para atualizar status de email usando email + campaignId
  async updateEmailLogStatus(email: string, campaignId: string, status: string): Promise<void> {
    try {
      const updateData: any = { 
        status,
        updatedAt: Math.floor(Date.now() / 1000)
      };
      
      if (status === 'sent') {
        updateData.sentAt = Math.floor(Date.now() / 1000);
      } else if (status === 'delivered') {
        updateData.deliveredAt = Math.floor(Date.now() / 1000);
      } else if (status === 'failed') {
        updateData.errorMessage = 'Falha no envio';
      }
      
      await db.update(emailLogs)
        .set(updateData)
        .where(and(
          eq(emailLogs.email, email),
          eq(emailLogs.campaignId, campaignId)
        ));
      
    } catch (error) {
      console.error('Error updating email log status:', error);
      throw error;
    }
  }

  // =============================================
  // RESPONSE VARIABLES OPERATIONS - SISTEMA DINÂMICO
  // Sistema que captura automaticamente TODAS as variáveis
  // de qualquer elemento, mesmo os que serão criados no futuro
  // =============================================

  async createResponseVariable(variable: InsertResponseVariable): Promise<ResponseVariable> {
    const newVariable = {
      id: nanoid(),
      ...variable,
      createdAt: Math.floor(Date.now() / 1000)
    };
    
    await db.insert(responseVariables).values(newVariable);
    return newVariable;
  }

  async getResponseVariables(responseId: string): Promise<ResponseVariable[]> {
    return await db.select()
      .from(responseVariables)
      .where(eq(responseVariables.responseId, responseId))
      .orderBy(asc(responseVariables.pageOrder));
  }

  async getQuizVariables(quizId: string): Promise<ResponseVariable[]> {
    return await db.select()
      .from(responseVariables)
      .where(eq(responseVariables.quizId, quizId))
      .orderBy(asc(responseVariables.pageOrder));
  }

  // FUNÇÃO PRINCIPAL: Extração automática de variáveis para elementos futuros
  async extractAndSaveVariables(response: QuizResponse, quiz: Quiz): Promise<void> {
    console.log(`🔍 EXTRAÇÃO AUTOMÁTICA: Iniciando para response ${response.id}`);
    
    try {
      // Parse das estruturas
      const quizStructure = typeof quiz.structure === 'string' ? JSON.parse(quiz.structure) : quiz.structure;
      const responseData = typeof response.responses === 'object' ? response.responses : JSON.parse(response.responses);
      
      // Limpar variáveis existentes desta resposta
      await db.delete(responseVariables)
        .where(eq(responseVariables.responseId, response.id));
      
      // Processar cada página do quiz
      const pages = quizStructure.pages || [];
      
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const page = pages[pageIndex];
        const pageId = page.id || `page_${pageIndex}`;
        
        // Processar cada elemento da página
        if (page.elements && Array.isArray(page.elements)) {
          for (const element of page.elements) {
            await this.processElementForVariables(
              element,
              responseData,
              response.id,
              quiz.id,
              pageId,
              pageIndex,
              page.title || `Página ${pageIndex + 1}`
            );
          }
        }
      }
      
      console.log(`✅ EXTRAÇÃO AUTOMÁTICA: Concluída para response ${response.id}`);
      
    } catch (error) {
      console.error(`❌ ERRO na extração automática:`, error);
    }
  }

  // Processar elemento individual - funciona para qualquer tipo de elemento
  private async processElementForVariables(
    element: any,
    responseData: any,
    responseId: string,
    quizId: string,
    pageId: string,
    pageOrder: number,
    question: string
  ): Promise<void> {
    
    // Detectar automaticamente se o elemento tem fieldId (identificador para captura)
    const fieldId = element.fieldId || element.id;
    if (!fieldId) return;
    
    // Buscar valor na resposta
    const value = responseData[fieldId];
    if (value === undefined || value === null || value === '') return;
    
    // Converter valor para string se necessário
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    // Criar variável automaticamente
    const variable: InsertResponseVariable = {
      responseId,
      quizId,
      variableName: fieldId,
      variableValue: stringValue,
      elementType: element.type || 'unknown',
      pageId,
      elementId: element.id || fieldId,
      pageOrder,
      question: element.question || element.title || element.text || question
    };
    
    await this.createResponseVariable(variable);
    
    console.log(`📝 VARIÁVEL CAPTURADA: ${fieldId} = "${stringValue}" (${element.type})`);
  }

  // Buscar todas as variáveis de um quiz com filtros opcionais
  async getQuizVariablesWithFilters(
    quizId: string,
    filters?: {
      elementType?: string;
      pageId?: string;
      variableName?: string;
      fromDate?: Date;
      toDate?: Date;
    }
  ): Promise<ResponseVariable[]> {
    let query = db.select()
      .from(responseVariables)
      .where(eq(responseVariables.quizId, quizId));
    
    // Aplicar filtros se fornecidos
    if (filters) {
      const conditions = [eq(responseVariables.quizId, quizId)];
      
      if (filters.elementType) {
        conditions.push(eq(responseVariables.elementType, filters.elementType));
      }
      
      if (filters.pageId) {
        conditions.push(eq(responseVariables.pageId, filters.pageId));
      }
      
      if (filters.variableName) {
        conditions.push(eq(responseVariables.variableName, filters.variableName));
      }
      
      if (filters.fromDate) {
        conditions.push(gte(responseVariables.createdAt, filters.fromDate.getTime()));
      }
      
      if (filters.toDate) {
        conditions.push(lte(responseVariables.createdAt, filters.toDate.getTime()));
      }
      
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(asc(responseVariables.pageOrder));
  }

  // Obter estatísticas de variáveis para analytics
  async getVariableStatistics(quizId: string): Promise<{
    totalVariables: number;
    uniqueVariables: number;
    elementTypes: { type: string; count: number }[];
    mostUsedVariables: { name: string; count: number }[];
  }> {
    const variables = await this.getQuizVariables(quizId);
    
    const uniqueVariables = new Set(variables.map(v => v.variableName)).size;
    
    // Contar por tipo de elemento
    const elementTypeCounts = variables.reduce((acc, v) => {
      acc[v.elementType] = (acc[v.elementType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Contar por nome de variável
    const variableCounts = variables.reduce((acc, v) => {
      acc[v.variableName] = (acc[v.variableName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalVariables: variables.length,
      uniqueVariables,
      elementTypes: Object.entries(elementTypeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
      mostUsedVariables: Object.entries(variableCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    };
  }

  // Buscar variáveis específicas para remarketing
  async getVariablesForRemarketing(
    quizId: string,
    targetVariables: string[]
  ): Promise<{ responseId: string; variables: Record<string, string> }[]> {
    const allVariables = await this.getQuizVariables(quizId);
    
    // Agrupar por responseId
    const responseGroups = allVariables.reduce((acc, variable) => {
      if (!acc[variable.responseId]) {
        acc[variable.responseId] = {};
      }
      acc[variable.responseId][variable.variableName] = variable.variableValue;
      return acc;
    }, {} as Record<string, Record<string, string>>);
    
    // Filtrar apenas respostas que têm as variáveis desejadas
    return Object.entries(responseGroups)
      .filter(([_, variables]) => 
        targetVariables.some(varName => variables[varName])
      )
      .map(([responseId, variables]) => ({
        responseId,
        variables: targetVariables.reduce((acc, varName) => {
          if (variables[varName]) {
            acc[varName] = variables[varName];
          }
          return acc;
        }, {} as Record<string, string>)
      }));
  }

  // ==================== I.A. CONVERSION + OPERATIONS ====================
  
  // AI Conversion Campaign operations
  async getAiConversionCampaigns(userId: string): Promise<AiConversionCampaign[]> {
    return await db.select()
      .from(aiConversionCampaigns)
      .where(eq(aiConversionCampaigns.userId, userId))
      .orderBy(desc(aiConversionCampaigns.createdAt));
  }

  async getAiConversionCampaign(id: string): Promise<AiConversionCampaign | undefined> {
    const campaigns = await db.select()
      .from(aiConversionCampaigns)
      .where(eq(aiConversionCampaigns.id, id));
    return campaigns[0];
  }

  async createAiConversionCampaign(campaign: InsertAiConversionCampaign): Promise<AiConversionCampaign> {
    const insertedCampaigns = await db.insert(aiConversionCampaigns)
      .values({
        ...campaign,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return insertedCampaigns[0];
  }

  async updateAiConversionCampaign(id: string, updates: Partial<InsertAiConversionCampaign>): Promise<AiConversionCampaign> {
    const updatedCampaigns = await db.update(aiConversionCampaigns)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(aiConversionCampaigns.id, id))
      .returning();
    return updatedCampaigns[0];
  }

  async deleteAiConversionCampaign(id: string): Promise<void> {
    // Primeiro deletar todas as gerações de vídeo relacionadas
    await db.delete(aiVideoGenerations)
      .where(eq(aiVideoGenerations.campaignId, id));
    
    // Depois deletar a campanha
    await db.delete(aiConversionCampaigns)
      .where(eq(aiConversionCampaigns.id, id));
  }

  // AI Video Generation operations
  async getAiVideoGenerations(campaignId: string): Promise<AiVideoGeneration[]> {
    return await db.select()
      .from(aiVideoGenerations)
      .where(eq(aiVideoGenerations.campaignId, campaignId))
      .orderBy(desc(aiVideoGenerations.createdAt));
  }

  async getAiVideoGeneration(id: string): Promise<AiVideoGeneration | undefined> {
    const generations = await db.select()
      .from(aiVideoGenerations)
      .where(eq(aiVideoGenerations.id, id));
    return generations[0];
  }

  async createAiVideoGeneration(generation: InsertAiVideoGeneration): Promise<AiVideoGeneration> {
    const insertedGenerations = await db.insert(aiVideoGenerations)
      .values({
        ...generation,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return insertedGenerations[0];
  }

  async updateAiVideoGeneration(id: string, updates: Partial<InsertAiVideoGeneration>): Promise<AiVideoGeneration> {
    const updatedGenerations = await db.update(aiVideoGenerations)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(aiVideoGenerations.id, id))
      .returning();
    return updatedGenerations[0];
  }

  async deleteAiVideoGeneration(id: string): Promise<void> {
    await db.delete(aiVideoGenerations)
      .where(eq(aiVideoGenerations.id, id));
  }

  // ===== NOTIFICATION OPERATIONS =====

  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      // Buscar notificações específicas do usuário + notificações globais (userId = null)
      const userNotifications = await db.select()
        .from(notifications)
        .where(
          or(
            eq(notifications.userId, userId),
            eq(notifications.userId, null as any) // Notificações globais
          )
        )
        .orderBy(desc(notifications.createdAt));

      return userNotifications;
    } catch (error) {
      console.error('❌ ERRO ao buscar notificações do usuário:', error);
      throw error;
    }
  }

  async createNotification(notification: Omit<InsertNotification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notification> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const notificationId = nanoid();

      const [newNotification] = await db.insert(notifications)
        .values({
          id: notificationId,
          ...notification,
          isRead: false,
          createdAt: now,
          updatedAt: now
        })
        .returning();

      console.log('✅ Notificação criada:', {
        id: newNotification.id,
        title: newNotification.title,
        type: newNotification.type,
        userId: newNotification.userId || 'GLOBAL'
      });

      return newNotification;
    } catch (error) {
      console.error('❌ ERRO ao criar notificação:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const now = Math.floor(Date.now() / 1000);
      
      await db.update(notifications)
        .set({ 
          isRead: true, 
          updatedAt: now 
        })
        .where(
          and(
            eq(notifications.id, notificationId),
            or(
              eq(notifications.userId, userId),
              eq(notifications.userId, null as any) // Permitir marcar notificações globais como lidas
            )
          )
        );

      console.log('✅ Notificação marcada como lida:', { notificationId, userId });
    } catch (error) {
      console.error('❌ ERRO ao marcar notificação como lida:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      await db.delete(notifications)
        .where(
          and(
            eq(notifications.id, notificationId),
            or(
              eq(notifications.userId, userId),
              eq(notifications.userId, null as any) // Permitir deletar notificações globais
            )
          )
        );

      console.log('✅ Notificação deletada:', { notificationId, userId });
    } catch (error) {
      console.error('❌ ERRO ao deletar notificação:', error);
      throw error;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      const now = Math.floor(Date.now() / 1000);
      
      await db.update(notifications)
        .set({ 
          isRead: true, 
          updatedAt: now 
        })
        .where(
          or(
            eq(notifications.userId, userId),
            eq(notifications.userId, null as any) // Incluir notificações globais
          )
        );

      console.log('✅ Todas as notificações marcadas como lidas para usuário:', userId);
    } catch (error) {
      console.error('❌ ERRO ao marcar todas as notificações como lidas:', error);
      throw error;
    }
  }

  // ===== SUPER AFFILIATES METHODS =====

  async createAffiliate(affiliate: Omit<InsertSuperAffiliate, 'id' | 'createdAt' | 'updatedAt'>): Promise<SuperAffiliate> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const id = nanoid();
      
      const result = await db.insert(superAffiliates)
        .values({
          id,
          ...affiliate,
          createdAt: now,
          updatedAt: now
        })
        .returning();

      console.log('✅ Afiliado criado:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ ERRO ao criar afiliado:', error);
      throw error;
    }
  }

  async getUserAffiliates(userId: string): Promise<SuperAffiliate[]> {
    try {
      const affiliates = await db.select()
        .from(superAffiliates)
        .where(eq(superAffiliates.userId, userId))
        .orderBy(desc(superAffiliates.createdAt));

      return affiliates;
    } catch (error) {
      console.error('❌ ERRO ao buscar afiliados do usuário:', error);
      throw error;
    }
  }

  async getAffiliate(id: string): Promise<SuperAffiliate | undefined> {
    try {
      const affiliate = await db.select()
        .from(superAffiliates)
        .where(eq(superAffiliates.id, id))
        .limit(1);

      return affiliate[0];
    } catch (error) {
      console.error('❌ ERRO ao buscar afiliado:', error);
      throw error;
    }
  }

  async updateAffiliate(id: string, updates: Partial<InsertSuperAffiliate>): Promise<SuperAffiliate> {
    try {
      const now = Math.floor(Date.now() / 1000);
      
      const result = await db.update(superAffiliates)
        .set({
          ...updates,
          updatedAt: now
        })
        .where(eq(superAffiliates.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error('Afiliado não encontrado');
      }

      console.log('✅ Afiliado atualizado:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ ERRO ao atualizar afiliado:', error);
      throw error;
    }
  }

  async deleteAffiliate(id: string): Promise<void> {
    try {
      await db.delete(superAffiliates)
        .where(eq(superAffiliates.id, id));

      console.log('✅ Afiliado deletado:', id);
    } catch (error) {
      console.error('❌ ERRO ao deletar afiliado:', error);
      throw error;
    }
  }

  // ===== AFFILIATE SALES METHODS =====

  async createAffiliateSale(sale: Omit<InsertAffiliateSale, 'id' | 'createdAt' | 'updatedAt'>): Promise<AffiliateSale> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const id = nanoid();
      
      const result = await db.insert(affiliateSales)
        .values({
          id,
          ...sale,
          createdAt: now,
          updatedAt: now
        })
        .returning();

      console.log('✅ Venda de afiliado criada:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ ERRO ao criar venda de afiliado:', error);
      throw error;
    }
  }

  async getAffiliateSales(affiliateId: string): Promise<AffiliateSale[]> {
    try {
      const sales = await db.select()
        .from(affiliateSales)
        .where(eq(affiliateSales.affiliateId, affiliateId))
        .orderBy(desc(affiliateSales.createdAt));

      return sales;
    } catch (error) {
      console.error('❌ ERRO ao buscar vendas do afiliado:', error);
      throw error;
    }
  }

  async updateAffiliateSale(id: string, updates: Partial<InsertAffiliateSale>): Promise<AffiliateSale> {
    try {
      const now = Math.floor(Date.now() / 1000);
      
      const result = await db.update(affiliateSales)
        .set({
          ...updates,
          updatedAt: now
        })
        .where(eq(affiliateSales.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error('Venda de afiliado não encontrada');
      }

      console.log('✅ Venda de afiliado atualizada:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ ERRO ao atualizar venda de afiliado:', error);
      throw error;
    }
  }

  // ===== A/B TESTING METHODS =====

  async createAbTest(test: Omit<InsertAbTest, 'id' | 'createdAt' | 'updatedAt'>): Promise<AbTest> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const id = nanoid();
      
      const testData = {
        id,
        userId: test.userId,
        name: test.name,
        description: test.description || '',
        quizIds: JSON.stringify(test.quizIds),
        subdomains: JSON.stringify(test.subdomains || []),
        isActive: test.isActive !== undefined ? test.isActive : true,
        totalViews: test.totalViews || 0,
        createdAt: now,
        updatedAt: now
      };

      const result = await db.insert(abTests)
        .values(testData)
        .returning();

      console.log('✅ Teste A/B criado:', result[0]);
      return {
        ...result[0],
        quizIds: JSON.parse(result[0].quizIds),
        subdomains: JSON.parse(result[0].subdomains || '[]')
      };
    } catch (error) {
      console.error('❌ ERRO ao criar teste A/B:', error);
      throw error;
    }
  }

  async getUserAbTests(userId: string): Promise<AbTest[]> {
    try {
      const tests = await db.select()
        .from(abTests)
        .where(eq(abTests.userId, userId))
        .orderBy(desc(abTests.createdAt));

      return tests.map(test => ({
        ...test,
        quizIds: JSON.parse(test.quizIds),
        subdomains: JSON.parse(test.subdomains || '[]')
      }));
    } catch (error) {
      console.error('❌ ERRO ao buscar testes A/B do usuário:', error);
      throw error;
    }
  }

  async getAbTest(id: string): Promise<AbTest | undefined> {
    try {
      const test = await db.select()
        .from(abTests)
        .where(eq(abTests.id, id))
        .limit(1);

      return test[0];
    } catch (error) {
      console.error('❌ ERRO ao buscar teste A/B:', error);
      throw error;
    }
  }

  async updateAbTest(id: string, updates: Partial<InsertAbTest>): Promise<AbTest> {
    try {
      const now = Math.floor(Date.now() / 1000);
      
      const result = await db.update(abTests)
        .set({
          ...updates,
          updatedAt: now
        })
        .where(eq(abTests.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error('Teste A/B não encontrado');
      }

      console.log('✅ Teste A/B atualizado:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ ERRO ao atualizar teste A/B:', error);
      throw error;
    }
  }

  async deleteAbTest(id: string): Promise<void> {
    try {
      await db.delete(abTests)
        .where(eq(abTests.id, id));

      console.log('✅ Teste A/B deletado:', id);
    } catch (error) {
      console.error('❌ ERRO ao deletar teste A/B:', error);
      throw error;
    }
  }

  async recordAbTestView(view: Omit<InsertAbTestView, 'id' | 'createdAt'>): Promise<AbTestView> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const id = nanoid();
      
      const result = await db.insert(abTestViews)
        .values({
          id,
          ...view,
          createdAt: now
        })
        .returning();

      // Incrementar contador de visualizações do teste
      await db.update(abTests)
        .set({ totalViews: sql`total_views + 1` })
        .where(eq(abTests.id, view.testId));

      console.log('✅ Visualização A/B registrada:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ ERRO ao registrar visualização A/B:', error);
      throw error;
    }
  }

  async getAbTestViews(testId: string): Promise<AbTestView[]> {
    try {
      const views = await db.select()
        .from(abTestViews)
        .where(eq(abTestViews.testId, testId))
        .orderBy(desc(abTestViews.createdAt));

      return views;
    } catch (error) {
      console.error('❌ ERRO ao buscar visualizações do teste A/B:', error);
      throw error;
    }
  }

  // ===== WEBHOOK METHODS =====

  async createWebhook(webhook: Omit<InsertWebhook, 'id' | 'createdAt' | 'updatedAt'>): Promise<Webhook> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const id = nanoid();
      
      const result = await db.insert(webhooks)
        .values({
          id,
          ...webhook,
          createdAt: now,
          updatedAt: now
        })
        .returning();

      console.log('✅ Webhook criado:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ ERRO ao criar webhook:', error);
      throw error;
    }
  }

  async getUserWebhooks(userId: string): Promise<Webhook[]> {
    try {
      const webhooks_list = await db.select()
        .from(webhooks)
        .where(eq(webhooks.userId, userId))
        .orderBy(desc(webhooks.createdAt));

      return webhooks_list;
    } catch (error) {
      console.error('❌ ERRO ao buscar webhooks do usuário:', error);
      throw error;
    }
  }

  async getWebhook(id: string): Promise<Webhook | undefined> {
    try {
      const webhook = await db.select()
        .from(webhooks)
        .where(eq(webhooks.id, id))
        .limit(1);

      return webhook[0];
    } catch (error) {
      console.error('❌ ERRO ao buscar webhook:', error);
      throw error;
    }
  }

  async updateWebhook(id: string, updates: Partial<InsertWebhook>): Promise<Webhook> {
    try {
      const now = Math.floor(Date.now() / 1000);
      
      const result = await db.update(webhooks)
        .set({
          ...updates,
          updatedAt: now
        })
        .where(eq(webhooks.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error('Webhook não encontrado');
      }

      console.log('✅ Webhook atualizado:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ ERRO ao atualizar webhook:', error);
      throw error;
    }
  }

  async deleteWebhook(id: string): Promise<void> {
    try {
      await db.delete(webhooks)
        .where(eq(webhooks.id, id));

      console.log('✅ Webhook deletado:', id);
    } catch (error) {
      console.error('❌ ERRO ao deletar webhook:', error);
      throw error;
    }
  }

  async logWebhookTrigger(log: Omit<InsertWebhookLog, 'id' | 'createdAt'>): Promise<WebhookLog> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const id = nanoid();
      
      const result = await db.insert(webhookLogs)
        .values({
          id,
          ...log,
          createdAt: now
        })
        .returning();

      // Atualizar estatísticas do webhook
      await db.update(webhooks)
        .set({ 
          totalTriggers: sql`total_triggers + 1`,
          lastTriggered: now
        })
        .where(eq(webhooks.id, log.webhookId));

      console.log('✅ Log de webhook registrado:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ ERRO ao registrar log de webhook:', error);
      throw error;
    }
  }

  async getWebhookLogs(webhookId: string): Promise<WebhookLog[]> {
    try {
      const logs = await db.select()
        .from(webhookLogs)
        .where(eq(webhookLogs.webhookId, webhookId))
        .orderBy(desc(webhookLogs.createdAt))
        .limit(100);

      return logs;
    } catch (error) {
      console.error('❌ ERRO ao buscar logs do webhook:', error);
      throw error;
    }
  }

  // ===== INTEGRATION METHODS =====

  async createIntegration(integration: Omit<InsertIntegration, 'id' | 'createdAt' | 'updatedAt'>): Promise<Integration> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const id = nanoid();
      
      const result = await db.insert(integrations)
        .values({
          id,
          ...integration,
          createdAt: now,
          updatedAt: now
        })
        .returning();

      console.log('✅ Integração criada:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ ERRO ao criar integração:', error);
      throw error;
    }
  }

  async getUserIntegrations(userId: string): Promise<Integration[]> {
    try {
      const integrations_list = await db.select()
        .from(integrations)
        .where(eq(integrations.userId, userId))
        .orderBy(desc(integrations.createdAt));

      return integrations_list;
    } catch (error) {
      console.error('❌ ERRO ao buscar integrações do usuário:', error);
      throw error;
    }
  }

  async getIntegration(id: string): Promise<Integration | undefined> {
    try {
      const integration = await db.select()
        .from(integrations)
        .where(eq(integrations.id, id))
        .limit(1);

      return integration[0];
    } catch (error) {
      console.error('❌ ERRO ao buscar integração:', error);
      throw error;
    }
  }

  async updateIntegration(id: string, updates: Partial<InsertIntegration>): Promise<Integration> {
    try {
      const now = Math.floor(Date.now() / 1000);
      
      const result = await db.update(integrations)
        .set({
          ...updates,
          updatedAt: now
        })
        .where(eq(integrations.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error('Integração não encontrada');
      }

      console.log('✅ Integração atualizada:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ ERRO ao atualizar integração:', error);
      throw error;
    }
  }

  async deleteIntegration(id: string): Promise<void> {
    try {
      await db.delete(integrations)
        .where(eq(integrations.id, id));

      console.log('✅ Integração deletada:', id);
    } catch (error) {
      console.error('❌ ERRO ao deletar integração:', error);
      throw error;
    }
  }

  // ===============================================
  // TYPEBOT AUTO-HOSPEDADO - MÉTODOS COMPLETOS
  // ===============================================

  // TypeBot Project Methods
  async createTypebotProject(project: Omit<InsertTypebotProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<TypebotProject> {
    try {
      const now = Date.now();
      const id = nanoid();
      
      const stmt = sqlite.prepare(`
        INSERT INTO typebot_projects (
          id, user_id, name, description, source_quiz_id, typebot_data, 
          theme, settings, is_published, public_id, total_views, 
          total_conversations, total_completions, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        id,
        project.userId,
        project.name,
        project.description || null,
        project.sourceQuizId || null,
        project.typebotData || '{}',
        project.theme || 'default',
        project.settings || '{}',
        project.isPublished ? 1 : 0,
        project.publicId || null,
        project.totalViews || 0,
        project.totalConversations || 0,
        project.totalCompletions || 0,
        now,
        now
      );

      // Buscar o projeto criado
      const createdProject = sqlite.prepare(`
        SELECT * FROM typebot_projects WHERE id = ?
      `).get(id);

      console.log('✅ Projeto TypeBot criado:', createdProject);
      return createdProject as TypebotProject;
    } catch (error) {
      console.error('❌ ERRO ao criar projeto TypeBot:', error);
      throw error;
    }
  }

  async getTypebotProjects(userId: string): Promise<TypebotProject[]> {
    try {
      const stmt = sqlite.prepare(`
        SELECT * FROM typebot_projects 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `);
      
      const projects = stmt.all(userId);
      return projects as TypebotProject[];
    } catch (error) {
      console.error('❌ ERRO ao buscar projetos TypeBot:', error);
      throw error;
    }
  }

  async getTypebotProject(id: string): Promise<TypebotProject | undefined> {
    try {
      const stmt = sqlite.prepare(`
        SELECT * FROM typebot_projects WHERE id = ?
      `);
      
      const result = stmt.get(id);
      return result as TypebotProject;
    } catch (error) {
      console.error('❌ ERRO ao buscar projeto TypeBot:', error);
      throw error;
    }
  }

  async getTypebotProjectByPublicId(publicId: string): Promise<TypebotProject | undefined> {
    try {
      const result = await db.select()
        .from(typebotProjects)
        .where(eq(typebotProjects.publicId, publicId))
        .limit(1);

      return result[0];
    } catch (error) {
      console.error('❌ ERRO ao buscar projeto TypeBot por ID público:', error);
      throw error;
    }
  }

  async updateTypebotProject(id: string, updates: Partial<TypebotProject>): Promise<TypebotProject> {
    try {
      const now = Math.floor(Date.now() / 1000);
      
      // Construir query SQL dinamicamente baseado nos campos fornecidos
      const updateFields = [];
      const values = [];
      
      if (updates.name !== undefined) {
        updateFields.push('name = ?');
        values.push(updates.name);
      }
      
      if (updates.description !== undefined) {
        updateFields.push('description = ?');
        values.push(updates.description);
      }
      
      if (updates.typebot_data !== undefined) {
        updateFields.push('typebot_data = ?');
        values.push(updates.typebot_data);
      }
      
      if (updates.theme !== undefined) {
        updateFields.push('theme = ?');
        values.push(updates.theme);
      }
      
      if (updates.settings !== undefined) {
        updateFields.push('settings = ?');
        values.push(updates.settings);
      }
      
      if (updates.is_published !== undefined) {
        updateFields.push('is_published = ?');
        values.push(updates.is_published);
      }
      
      // Sempre atualizar updated_at
      updateFields.push('updated_at = ?');
      values.push(now);
      
      // Adicionar ID para WHERE
      values.push(id);
      
      const stmt = sqlite.prepare(`
        UPDATE typebot_projects 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `);
      
      const result = stmt.run(...values);
      
      if (result.changes === 0) {
        throw new Error('Projeto TypeBot não encontrado');
      }
      
      // Buscar projeto atualizado
      const updatedProject = await this.getTypebotProject(id);
      
      console.log('✅ Projeto TypeBot atualizado:', updatedProject);
      return updatedProject;
    } catch (error) {
      console.error('❌ ERRO ao atualizar projeto TypeBot:', error);
      throw error;
    }
  }

  async deleteTypebotProject(id: string): Promise<void> {
    try {
      const stmt = sqlite.prepare(`
        DELETE FROM typebot_projects WHERE id = ?
      `);
      
      const result = stmt.run(id);
      
      if (result.changes === 0) {
        throw new Error('Projeto TypeBot não encontrado');
      }

      console.log('✅ Projeto TypeBot deletado:', id);
    } catch (error) {
      console.error('❌ ERRO ao deletar projeto TypeBot:', error);
      throw error;
    }
  }

  // TypeBot Conversation Methods
  async createTypebotConversation(conversation: Omit<InsertTypebotConversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<TypebotConversation> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const id = nanoid();
      
      const result = await db.insert(typebotConversations)
        .values({
          id,
          ...conversation,
          createdAt: now,
          updatedAt: now
        })
        .returning();

      console.log('✅ Conversa TypeBot criada:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ ERRO ao criar conversa TypeBot:', error);
      throw error;
    }
  }

  async getTypebotConversation(id: string): Promise<TypebotConversation | undefined> {
    try {
      const result = await db.select()
        .from(typebotConversations)
        .where(eq(typebotConversations.id, id))
        .limit(1);

      return result[0];
    } catch (error) {
      console.error('❌ ERRO ao buscar conversa TypeBot:', error);
      throw error;
    }
  }

  async updateTypebotConversation(id: string, updates: Partial<TypebotConversation>): Promise<TypebotConversation> {
    try {
      const now = Math.floor(Date.now() / 1000);
      
      const result = await db.update(typebotConversations)
        .set({
          ...updates,
          updatedAt: now
        })
        .where(eq(typebotConversations.id, id))
        .returning();

      console.log('✅ Conversa TypeBot atualizada:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ ERRO ao atualizar conversa TypeBot:', error);
      throw error;
    }
  }

  // TypeBot Message Methods
  async createTypebotMessage(message: Omit<InsertTypebotMessage, 'id' | 'timestamp'>): Promise<TypebotMessage> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const id = nanoid();
      
      const result = await db.insert(typebotMessages)
        .values({
          id,
          ...message,
          timestamp: now
        })
        .returning();

      console.log('✅ Mensagem TypeBot criada:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ ERRO ao criar mensagem TypeBot:', error);
      throw error;
    }
  }

  async getTypebotMessages(conversationId: string): Promise<TypebotMessage[]> {
    try {
      const messages = await db.select()
        .from(typebotMessages)
        .where(eq(typebotMessages.conversationId, conversationId))
        .orderBy(asc(typebotMessages.timestamp));

      return messages;
    } catch (error) {
      console.error('❌ ERRO ao buscar mensagens TypeBot:', error);
      throw error;
    }
  }

  // TypeBot Analytics Methods
  async getTypebotAnalytics(projectId: string): Promise<TypebotAnalytics[]> {
    try {
      const analytics = await db.select()
        .from(typebotAnalytics)
        .where(eq(typebotAnalytics.projectId, projectId))
        .orderBy(desc(typebotAnalytics.date));

      return analytics;
    } catch (error) {
      console.error('❌ ERRO ao buscar analytics TypeBot:', error);
      throw error;
    }
  }

  async createTypebotAnalytics(analytics: Omit<InsertTypebotAnalytics, 'id' | 'createdAt'>): Promise<TypebotAnalytics> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const id = nanoid();
      
      const result = await db.insert(typebotAnalytics)
        .values({
          id,
          ...analytics,
          createdAt: now
        })
        .returning();

      console.log('✅ Analytics TypeBot criado:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ ERRO ao criar analytics TypeBot:', error);
      throw error;
    }
  }

  // TypeBot Webhook Methods
  async createTypebotWebhook(webhook: Omit<InsertTypebotWebhook, 'id' | 'createdAt' | 'updatedAt'>): Promise<TypebotWebhook> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const id = nanoid();
      
      const result = await db.insert(typebotWebhooks)
        .values({
          id,
          ...webhook,
          createdAt: now,
          updatedAt: now
        })
        .returning();

      console.log('✅ Webhook TypeBot criado:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ ERRO ao criar webhook TypeBot:', error);
      throw error;
    }
  }

  async getTypebotWebhooks(projectId: string): Promise<TypebotWebhook[]> {
    try {
      const webhooks = await db.select()
        .from(typebotWebhooks)
        .where(eq(typebotWebhooks.projectId, projectId))
        .orderBy(desc(typebotWebhooks.createdAt));

      return webhooks;
    } catch (error) {
      console.error('❌ ERRO ao buscar webhooks TypeBot:', error);
      throw error;
    }
  }

  // TypeBot Integration Methods
  async createTypebotIntegration(integration: Omit<InsertTypebotIntegration, 'id' | 'createdAt' | 'updatedAt'>): Promise<TypebotIntegration> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const id = nanoid();
      
      const result = await db.insert(typebotIntegrations)
        .values({
          id,
          ...integration,
          createdAt: now,
          updatedAt: now
        })
        .returning();

      console.log('✅ Integração TypeBot criada:', result[0]);
      return result[0];
    } catch (error) {
      console.error('❌ ERRO ao criar integração TypeBot:', error);
      throw error;
    }
  }

  async getTypebotIntegrations(projectId: string): Promise<TypebotIntegration[]> {
    try {
      const integrations = await db.select()
        .from(typebotIntegrations)
        .where(eq(typebotIntegrations.projectId, projectId))
        .orderBy(desc(typebotIntegrations.createdAt));

      return integrations;
    } catch (error) {
      console.error('❌ ERRO ao buscar integrações TypeBot:', error);
      throw error;
    }
  }
}

export const storage = new SQLiteStorage();