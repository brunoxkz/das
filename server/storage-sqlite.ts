import { db } from "./db-sqlite";
import Database from 'better-sqlite3';
import { sql, eq, and, or, desc, asc } from 'drizzle-orm';

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
  subscriptionPlans, subscriptionTransactions, creditTransactions,
  checkoutProducts, checkoutPages, checkoutTransactions, checkoutAnalytics,
  stripeSubscriptions,
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
  type InsertTypebotIntegration, type TypebotIntegration,
  type InsertSubscriptionPlan, type SubscriptionPlan,
  type InsertSubscriptionTransaction, type SubscriptionTransaction,
  type InsertCreditTransaction, type CreditTransaction,
  type InsertCheckoutProduct, type CheckoutProduct,
  type InsertCheckoutPage, type CheckoutPage,
  type InsertCheckoutTransaction, type CheckoutTransaction,
  type InsertCheckoutAnalytics, type CheckoutAnalytics
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
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined>;
  logCreditTransaction(transaction: any): Promise<void>;
  getUserByEmail(email: string): Promise<User | undefined>;

  // Admin operations
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User>;
  getUserById(id: string): Promise<User | undefined>;

  // Video operations
  getVideoProjects(userId: string): Promise<AiVideoGeneration[]>;
  createVideoProject(project: InsertAiVideoGeneration): Promise<AiVideoGeneration>;
  updateVideoProject(id: string, updates: Partial<InsertAiVideoGeneration>): Promise<AiVideoGeneration>;
  deleteVideoProject(id: string): Promise<void>;

  // Subscription Plans operations
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: string, updates: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan>;
  
  // Subscription Transactions operations
  createSubscriptionTransaction(transaction: InsertSubscriptionTransaction): Promise<SubscriptionTransaction>;
  getSubscriptionTransactionsByUser(userId: string): Promise<SubscriptionTransaction[]>;
  updateSubscriptionTransaction(id: string, updates: Partial<InsertSubscriptionTransaction>): Promise<SubscriptionTransaction>;
  
  // Credit Transactions operations
  createCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction>;
  getCreditTransactionsByUser(userId: string): Promise<CreditTransaction[]>;
  updateUserCredits(userId: string, type: string, amount: number, operation: string, reason: string): Promise<User>;
  
  // Plan management
  checkUserPlanAccess(userId: string, feature: string): Promise<boolean>;
  getUserPlanLimits(userId: string): Promise<any>;
  checkPlanExpiration(userId: string): Promise<boolean>;
  renewUserPlan(userId: string, planId: string): Promise<User>;
  deleteUser(userId: string): Promise<void>;

  // Checkout System operations
  getAllCheckouts(): Promise<any[]>;
  getCheckoutById(id: string): Promise<any | undefined>;
  createCheckout(checkout: any): Promise<any>;
  updateCheckout(id: string, updates: any): Promise<any>;
  deleteCheckout(id: string): Promise<void>;
  getCheckoutStats(checkoutId: string): Promise<any>;
  incrementCheckoutViews(checkoutId: string): Promise<void>;
  incrementCheckoutConversions(checkoutId: string): Promise<void>;
  
  // Stripe Plans operations
  getStripePlans(): Promise<any[]>;
  
  // Stripe Subscriptions operations
  createStripeSubscription(subscription: any): Promise<any>;
  getStripeSubscriptionById(id: string): Promise<any | undefined>;
  getStripeSubscriptionByStripeId(stripeSubscriptionId: string): Promise<any | undefined>;
  updateStripeSubscription(id: string, updates: any): Promise<any>;
  getStripeSubscriptionsByUser(userId: string): Promise<any[]>;
  deleteStripeSubscription(id: string): Promise<void>;
  getStripePlan(id: string): Promise<any | undefined>;
  createStripePlan(plan: any): Promise<any>;
  updateStripePlan(id: string, updates: any): Promise<any>;
  deleteStripePlan(id: string): Promise<void>;
  getCheckoutAnalytics(): Promise<any>;
  getCheckoutProducts(): Promise<any[]>;
  
  // Order operations
  createOrder(order: any): Promise<any>;
  getOrderById(id: string): Promise<any | undefined>;
  updateOrderByStripePaymentIntentId(paymentIntentId: string, updates: any): Promise<any>;

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
    whatsapp?: string;
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
  
  // WhatsApp Extension ping operations
  saveExtensionPing(userId: string, version: string): Promise<void>;
  getRecentExtensionPing(userId: string): Promise<{ timestamp: number; version: string } | null>;
  
  // A/B Testing operations
  getAbTests(userId: string): Promise<AbTest[]>;
  getAbTest(id: string): Promise<AbTest | undefined>;
  createAbTest(test: Omit<InsertAbTest, 'id' | 'createdAt' | 'updatedAt'>): Promise<AbTest>;
  updateAbTest(id: string, updates: Partial<InsertAbTest>): Promise<AbTest>;
  deleteAbTest(id: string): Promise<void>;
  createAbTestView(view: Omit<InsertAbTestView, 'id' | 'createdAt'>): Promise<AbTestView>;
  updateAbTestViews(testId: string): Promise<void>;

  // Checkout Builder operations
  getProductsByUserId(userId: string): Promise<CheckoutProduct[]>;
  getProductById(id: string): Promise<CheckoutProduct | undefined>;
  createProduct(product: InsertCheckoutProduct): Promise<CheckoutProduct>;
  updateProduct(id: string, updates: Partial<InsertCheckoutProduct>): Promise<CheckoutProduct>;
  deleteProduct(id: string): Promise<void>;
  
  // Checkout Pages operations
  getCheckoutPagesByUserId(userId: string): Promise<CheckoutPage[]>;
  getCheckoutPageById(id: string): Promise<CheckoutPage | undefined>;
  createCheckoutPage(page: InsertCheckoutPage): Promise<CheckoutPage>;
  updateCheckoutPage(id: string, updates: Partial<InsertCheckoutPage>): Promise<CheckoutPage>;
  deleteCheckoutPage(id: string): Promise<void>;
  
  // Checkout Transactions operations
  getCheckoutTransactionsByUserId(userId: string): Promise<CheckoutTransaction[]>;
  getCheckoutTransactionById(id: string): Promise<CheckoutTransaction | undefined>;
  createCheckoutTransaction(transaction: InsertCheckoutTransaction): Promise<CheckoutTransaction>;
  updateCheckoutTransaction(id: string, updates: Partial<InsertCheckoutTransaction>): Promise<CheckoutTransaction>;
  deleteCheckoutTransaction(id: string): Promise<void>;
  
  // Checkout Analytics operations
  getCheckoutAnalytics(userId: string, filters?: { startDate?: string; endDate?: string; productId?: string }): Promise<any>;
  createCheckoutAnalytics(analytics: InsertCheckoutAnalytics): Promise<CheckoutAnalytics>;
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
    whatsapp?: string;
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
        whatsapp: userData.whatsapp,
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

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, stripeCustomerId));
    return user || undefined;
  }

  async logCreditTransaction(transaction: any): Promise<void> {
    await db.insert(creditTransactions).values({
      id: transaction.id,
      userId: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,
      operation: transaction.operation,
      reason: transaction.reason,
      metadata: transaction.metadata ? JSON.stringify(transaction.metadata) : null,
      createdAt: transaction.timestamp || new Date()
    });
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

  // === MÉTODOS PARA SISTEMA DE PAUSE AUTOMÁTICO ===

  async getUsersWithActiveCampaigns(): Promise<{ id: string; email?: string }[]> {
    try {
      const usersWithCampaigns = await db.select({
        id: users.id,
        email: users.email
      })
      .from(users)
      .where(sql`
        EXISTS (
          SELECT 1 FROM sms_campaigns WHERE userId = ${users.id} AND status = 'active'
        ) OR EXISTS (
          SELECT 1 FROM email_campaigns WHERE userId = ${users.id} AND status = 'active'
        ) OR EXISTS (
          SELECT 1 FROM whatsapp_campaigns WHERE user_id = ${users.id} AND status = 'active'
        )
      `);

      return usersWithCampaigns;
    } catch (error) {
      console.error('❌ Erro ao buscar usuários com campanhas ativas:', error);
      return [];
    }
  }

  async getActiveCampaignsByType(userId: string, type: 'sms' | 'email' | 'whatsapp'): Promise<any[]> {
    try {
      switch (type) {
        case 'sms':
          return await db.select()
            .from(smsCampaigns)
            .where(and(
              eq(smsCampaigns.userId, userId),
              eq(smsCampaigns.status, 'active')
            ));
        case 'email':
          return await db.select()
            .from(emailCampaigns)
            .where(and(
              eq(emailCampaigns.userId, userId),
              eq(emailCampaigns.status, 'active')
            ));
        case 'whatsapp':
          // Usar SQLite direto para evitar problema do ORM
          const stmt = sqlite.prepare(`
            SELECT * FROM whatsapp_campaigns 
            WHERE user_id = ? AND status = 'active'
          `);
          return stmt.all(userId);
        default:
          return [];
      }
    } catch (error) {
      console.error(`❌ Erro ao buscar campanhas ativas ${type}:`, error);
      return [];
    }
  }

  async getPausedCampaignsByType(userId: string, type: 'sms' | 'email' | 'whatsapp'): Promise<any[]> {
    try {
      switch (type) {
        case 'sms':
          return await db.select()
            .from(smsCampaigns)
            .where(and(
              eq(smsCampaigns.userId, userId),
              eq(smsCampaigns.status, 'paused')
            ));
        case 'email':
          return await db.select()
            .from(emailCampaigns)
            .where(and(
              eq(emailCampaigns.userId, userId),
              eq(emailCampaigns.status, 'paused')
            ));
        case 'whatsapp':
          // Usar SQLite direto para evitar problema do ORM
          const stmt = sqlite.prepare(`
            SELECT * FROM whatsapp_campaigns 
            WHERE user_id = ? AND status = 'paused'
          `);
          return stmt.all(userId);
        default:
          return [];
      }
    } catch (error) {
      console.error(`❌ Erro ao buscar campanhas pausadas ${type}:`, error);
      return [];
    }
  }

  async updateSmsCampaign(campaignId: string, updates: any): Promise<void> {
    try {
      await db.update(smsCampaigns)
        .set(updates)
        .where(eq(smsCampaigns.id, campaignId));
    } catch (error) {
      console.error(`❌ Erro ao atualizar campanha SMS ${campaignId}:`, error);
    }
  }

  async updateEmailCampaign(campaignId: string, updates: any): Promise<void> {
    try {
      await db.update(emailCampaigns)
        .set(updates)
        .where(eq(emailCampaigns.id, campaignId));
    } catch (error) {
      console.error(`❌ Erro ao atualizar campanha Email ${campaignId}:`, error);
    }
  }

  async updateWhatsappCampaign(campaignId: string, updates: any): Promise<void> {
    try {
      // Usar SQLite direto para evitar problema do ORM
      const setClauses = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      values.push(campaignId);
      
      const stmt = sqlite.prepare(`
        UPDATE whatsapp_campaigns 
        SET ${setClauses}, updated_at = ? 
        WHERE id = ?
      `);
      
      stmt.run(...values, Math.floor(Date.now() / 1000));
    } catch (error) {
      console.error(`❌ Erro ao atualizar campanha WhatsApp ${campaignId}:`, error);
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
        const stmt = sqlite.prepare(`
          SELECT * FROM whatsapp_campaigns 
          WHERE user_id = ? AND status = 'active'
        `);
        const whatsappCampaigns = stmt.all(userId);

        for (const campaign of whatsappCampaigns) {
          const updateStmt = sqlite.prepare(`
            UPDATE whatsapp_campaigns 
            SET status = 'paused', updated_at = ? 
            WHERE id = ?
          `);
          updateStmt.run(Math.floor(Date.now() / 1000), campaign.id);
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
    try {
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
    } catch (error) {
      console.error('❌ ERRO AO CRIAR QUIZ:', error);
      throw new Error(`Failed to create quiz: ${error.message}`);
    }
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
    // ULTRA-OTIMIZADO PARA SUB-50MS - Queries paralelas separadas
    const startTime = Date.now();
    
    // Query única ultra-otimizada para sub-50ms
    const dashboardStmt = sqlite.prepare(`
      SELECT 
        q.count as totalQuizzes,
        r.count as totalLeads,
        COALESCE(a.total_views, 0) as totalViews,
        COALESCE(a.avg_conversion, 0) as avgConversionRate
      FROM 
        (SELECT COUNT(*) as count FROM quizzes WHERE userId = ?) q
      LEFT JOIN 
        (SELECT COUNT(*) as count FROM quiz_responses WHERE quizId IN (SELECT id FROM quizzes WHERE userId = ?)) r
      LEFT JOIN 
        (SELECT SUM(views) as total_views, AVG(conversionRate) as avg_conversion FROM quiz_analytics WHERE quizId IN (SELECT id FROM quizzes WHERE userId = ?)) a
    `);
    
    const result = dashboardStmt.get(userId, userId, userId);
    
    const queryTime = Date.now() - startTime;
    if (queryTime > 50) {
      console.log(`⚠️ Dashboard query slow: ${queryTime}ms`);
    }
    
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
      campaignType: campaign.campaignType || 'standard',
      conditionalRules: campaign.conditionalRules || null,
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
      (id, name, quiz_id, messages, user_id, phones, status, scheduled_at, trigger_delay, trigger_unit, target_audience, extension_settings, created_at, updated_at)
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

  async updateWhatsappLogStatus(messageId: string, status: string): Promise<void> {
    try {
      const stmt = sqlite.prepare(`
        UPDATE whatsapp_logs 
        SET status = ?, updated_at = ?
        WHERE id = ? OR extension_status LIKE ?
      `);
      
      const now = Math.floor(Date.now() / 1000);
      stmt.run(status, now, messageId, `%"id":"${messageId}"%`);
    } catch (error) {
      console.error('❌ Erro ao atualizar status do log:', error);
    }
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
    campaignType?: string;
    conditionalRules?: string;
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
      campaignType: campaignData.campaignType || 'standard',
      conditionalRules: campaignData.conditionalRules || null,
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
      const result = await db.select({ count: count() })
        .from(smsLogs)
        .innerJoin(smsCampaigns, eq(smsLogs.campaignId, smsCampaigns.id))
        .where(and(
          eq(smsCampaigns.userId, userId),
          eq(smsLogs.status, 'sent')
        ));
      
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

  // CONDITIONAL CAMPAIGNS METHODS (SE > ENTÃO)

  // Get all conditional campaigns for a user
  async getConditionalCampaigns(userId: string): Promise<any[]> {
    try {
      const stmt = sqlite.prepare(`
        SELECT * FROM conditional_campaigns 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `);
      const campaigns = stmt.all(userId);
      
      return campaigns.map(campaign => ({
        ...campaign,
        rules: JSON.parse(campaign.rules || '[]')
      }));
    } catch (error) {
      console.error('❌ ERRO ao buscar campanhas condicionais:', error);
      return [];
    }
  }

  // Create conditional campaign
  async createConditionalCampaign(campaignData: any): Promise<any> {
    try {
      const id = nanoid();
      const stmt = sqlite.prepare(`
        INSERT INTO conditional_campaigns (
          id, user_id, name, description, quiz_id, type, rules, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const now = new Date().toISOString();
      const result = stmt.run(
        id,
        campaignData.userId,
        campaignData.name,
        campaignData.description,
        campaignData.quizId,
        campaignData.type,
        JSON.stringify(campaignData.rules || []),
        'draft',
        now,
        now
      );

      return {
        id,
        ...campaignData,
        status: 'draft',
        created_at: now,
        updated_at: now
      };
    } catch (error) {
      console.error('❌ ERRO ao criar campanha condicional:', error);
      throw new Error('Erro ao criar campanha condicional');
    }
  }

  // Update conditional campaign
  async updateConditionalCampaign(id: string, campaignData: any): Promise<any> {
    try {
      const stmt = sqlite.prepare(`
        UPDATE conditional_campaigns 
        SET name = ?, description = ?, quiz_id = ?, type = ?, rules = ?, updated_at = ?
        WHERE id = ? AND user_id = ?
      `);
      
      const now = new Date().toISOString();
      const result = stmt.run(
        campaignData.name,
        campaignData.description,
        campaignData.quizId,
        campaignData.type,
        JSON.stringify(campaignData.rules || []),
        now,
        id,
        campaignData.userId
      );

      if (result.changes === 0) {
        throw new Error('Campanha não encontrada ou sem permissão');
      }

      return { id, ...campaignData, updated_at: now };
    } catch (error) {
      console.error('❌ ERRO ao atualizar campanha condicional:', error);
      throw new Error('Erro ao atualizar campanha condicional');
    }
  }

  // Delete conditional campaign
  async deleteConditionalCampaign(id: string, userId: string): Promise<boolean> {
    try {
      const stmt = sqlite.prepare('DELETE FROM conditional_campaigns WHERE id = ? AND user_id = ?');
      const result = stmt.run(id, userId);
      return result.changes > 0;
    } catch (error) {
      console.error('❌ ERRO ao deletar campanha condicional:', error);
      return false;
    }
  }

  // Toggle conditional campaign status
  async toggleConditionalCampaign(id: string, status: string, userId: string): Promise<any> {
    try {
      const stmt = sqlite.prepare(`
        UPDATE conditional_campaigns 
        SET status = ?, updated_at = ? 
        WHERE id = ? AND user_id = ?
      `);
      
      const now = new Date().toISOString();
      const result = stmt.run(status, now, id, userId);

      if (result.changes === 0) {
        throw new Error('Campanha não encontrada');
      }

      return { id, status, updated_at: now };
    } catch (error) {
      console.error('❌ ERRO ao alterar status da campanha condicional:', error);
      throw new Error('Erro ao alterar status da campanha');
    }
  }

  // Get conditional campaign analytics
  async getConditionalCampaignAnalytics(id: string, userId: string): Promise<any> {
    try {
      // Implementar analytics específicas para campanhas condicionais
      return {
        id,
        totalTriggers: 0,
        successfulActions: 0,
        failedActions: 0,
        conversionRate: 0,
        lastActivity: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ ERRO ao buscar analytics da campanha condicional:', error);
      return null;
    }
  }

  // EXTENSION SETTINGS SYNC METHODS

  // Get user extension settings
  async getUserExtensionSettings(userId: string): Promise<any> {
    try {
      // Tentar buscar configurações da tabela se ela existir
      try {
        const stmt = sqlite.prepare('SELECT * FROM extension_settings WHERE user_id = ?');
        const result = stmt.get(userId);
        
        if (result) {
          return {
            autoSend: result.auto_accept_messages === 1,
            messageDelay: result.delay_between_messages * 1000,
            maxMessagesPerDay: result.max_messages_per_minute * 60,
            method: result.method || 'extension',
            apiConfig: result.api_config ? JSON.parse(result.api_config) : {},
            workingHours: {
              enabled: false,
              start: "09:00",
              end: "18:00"
            },
            antiSpam: {
              enabled: true,
              minDelay: result.delay_between_messages * 1000,
              maxDelay: result.delay_between_messages * 1000 + 2000,
              randomization: true
            }
          };
        }
      } catch (error) {
        // Se a tabela não existir, usar configurações padrão
        console.log('ℹ️ Tabela extension_settings não encontrada, usando configurações padrão');
      }
      
      // Configurações padrão se não existir
      const defaultSettings = {
        autoSend: true,
        messageDelay: 3000, // 3 segundos entre mensagens
        maxMessagesPerDay: 100,
        method: 'extension',
        apiConfig: {
          accessToken: '',
          phoneNumberId: '',
          businessAccountId: '',
          version: '18.0',
          webhookVerifyToken: '',
          webhookUrl: ''
        },
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

  async updateUserExtensionSettings(userId: string, settings: any): Promise<void> {
    try {
      // Criar/atualizar tabela com as novas colunas
      await sqlite.exec(`
        CREATE TABLE IF NOT EXISTS extension_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL UNIQUE,
          auto_accept_messages INTEGER DEFAULT 1,
          delay_between_messages INTEGER DEFAULT 3,
          max_messages_per_minute INTEGER DEFAULT 10,
          method TEXT DEFAULT 'extension',
          api_config TEXT DEFAULT '{}',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Verificar se as colunas method e api_config existem
      try {
        await sqlite.exec(`ALTER TABLE extension_settings ADD COLUMN method TEXT DEFAULT 'extension'`);
      } catch (e) {
        // Coluna já existe
      }
      
      try {
        await sqlite.exec(`ALTER TABLE extension_settings ADD COLUMN api_config TEXT DEFAULT '{}'`);
      } catch (e) {
        // Coluna já existe
      }

      // Atualizar ou inserir configurações
      const apiConfigJson = JSON.stringify(settings.apiConfig || {});
      const stmt = sqlite.prepare(`
        INSERT OR REPLACE INTO extension_settings 
        (user_id, auto_accept_messages, delay_between_messages, max_messages_per_minute, method, api_config, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      stmt.run(
        userId,
        settings.autoSend ? 1 : 0,
        Math.floor((settings.messageDelay || 3000) / 1000),
        Math.floor((settings.maxMessagesPerDay || 100) / 60),
        settings.method || 'extension',
        apiConfigJson
      );
    } catch (error) {
      console.error('❌ Erro ao atualizar configurações da extensão:', error);
      throw error;
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

  // Métodos para getUserById
  async getUserById(id: string): Promise<User | undefined> {
    try {
      const user = await db.select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      
      return user[0];
    } catch (error) {
      console.error('❌ ERRO ao buscar usuário por ID:', error);
      return undefined;
    }
  }

  // Cache estático para projetos de vídeo
  private static videoProjectsCache = new Map<string, any[]>();

  // Métodos para Video Projects
  async getVideoProjects(userId: string): Promise<any[]> {
    try {
      // Buscar projetos do usuário no cache em memória
      const projects = SQLiteStorage.videoProjectsCache.get(userId) || [];
      console.log(`📹 Buscando projetos para user ${userId}: ${projects.length} projetos`);
      return projects;
    } catch (error) {
      console.error('❌ ERRO ao buscar projetos de vídeo:', error);
      return [];
    }
  }

  async getVideoProject(id: string): Promise<any> {
    try {
      // Buscar projeto específico no cache
      for (const [userId, projects] of SQLiteStorage.videoProjectsCache.entries()) {
        const project = projects.find(p => p.id === id);
        if (project) {
          console.log(`📹 Projeto ${id} encontrado no cache para user ${userId}`);
          return project;
        }
      }
      
      console.log(`⚠️ Projeto ${id} não encontrado no cache`);
      return null;
    } catch (error) {
      console.error('❌ ERRO ao buscar projeto de vídeo:', error);
      return null;
    }
  }

  async createVideoProject(project: any): Promise<any> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const id = nanoid();
      
      // Gerar script viral simulado
      const script = `Descubra como ${project.topic} pode transformar sua vida! 
      
Hoje você vai aprender ${project.title} - método revolucionário que já ajudou milhares de pessoas.

🎯 O que você vai descobrir:
• Como começar do zero
• Estratégias que realmente funcionam
• Casos de sucesso reais
• Ferramentas gratuitas para acelerar

💡 Este é o momento perfeito para mudar sua vida!

👆 Clique no link na bio para acessar o curso completo!

#${project.topic.replace(/\s+/g, '')} #rendaextra #dinheiroonline #sucesso`;

      // Salvar projeto em memória por enquanto (será implementado banco depois)
      console.log('💾 Salvando projeto em memória temporariamente...');
      
      const videoProject = {
        id,
        userId: project.userId,
        title: project.title,
        topic: project.topic,
        script,
        duration: project.duration || 60,
        style: project.style || 'viral',
        voice: project.voice || 'masculina',
        videoUrl: '',
        thumbnailUrl: '',
        status: 'pending',
        views: 0,
        likes: 0,
        shares: 0,
        error: '',
        createdAt: now,
        updatedAt: now
      };
      
      // Salvar no cache da instância
      const userProjects = SQLiteStorage.videoProjectsCache.get(project.userId) || [];
      userProjects.push(videoProject);
      SQLiteStorage.videoProjectsCache.set(project.userId, userProjects);
      
      console.log('✅ Projeto de vídeo criado e salvo no cache:', videoProject);
      console.log(`📹 Cache atualizado: ${userProjects.length} projetos para user ${project.userId}`);
      
      // Simular processamento e completar vídeo após 5 segundos
      setTimeout(() => {
        videoProject.status = 'completed';
        videoProject.videoUrl = `/videos/${videoProject.id}.mp4`;
        videoProject.thumbnailUrl = `/thumbnails/${videoProject.id}.jpg`;
        console.log(`🎬 Vídeo ${videoProject.id} marcado como concluído`);
      }, 5000);
      
      return videoProject;
    } catch (error) {
      console.error('❌ ERRO ao criar projeto de vídeo:', error);
      throw error;
    }
  }

  async updateVideoProject(id: string, updates: any): Promise<any> {
    try {
      // Encontrar o projeto no cache
      for (const [userId, projects] of SQLiteStorage.videoProjectsCache.entries()) {
        const projectIndex = projects.findIndex(p => p.id === id);
        if (projectIndex !== -1) {
          // Atualizar projeto no cache
          projects[projectIndex] = { ...projects[projectIndex], ...updates };
          SQLiteStorage.videoProjectsCache.set(userId, projects);
          console.log(`✅ Projeto ${id} atualizado no cache para user ${userId}`);
          return projects[projectIndex];
        }
      }
      
      console.log(`⚠️ Projeto ${id} não encontrado no cache`);
      return { id, ...updates };
    } catch (error) {
      console.error('❌ ERRO ao atualizar projeto de vídeo:', error);
      throw error;
    }
  }

  async deleteVideoProject(id: string): Promise<void> {
    try {
      // Desabilitado temporariamente - schema incompatível
      console.log('⚠️ deleteVideoProject desabilitado - aguardando implementação de schema correto');
    } catch (error) {
      console.error('❌ ERRO ao deletar projeto de vídeo:', error);
      throw error;
    }
  }

  // WhatsApp Extension ping operations
  async saveExtensionPing(userId: string, version: string): Promise<void> {
    try {
      const stmt = sqlite.prepare(`
        INSERT OR REPLACE INTO extension_pings (user_id, version, timestamp)
        VALUES (?, ?, ?)
      `);
      
      stmt.run(userId, version, Date.now());
    } catch (error) {
      // Criar tabela se não existir
      try {
        sqlite.exec(`
          CREATE TABLE IF NOT EXISTS extension_pings (
            user_id TEXT PRIMARY KEY,
            version TEXT,
            timestamp INTEGER
          )
        `);
        
        const stmt = sqlite.prepare(`
          INSERT OR REPLACE INTO extension_pings (user_id, version, timestamp)
          VALUES (?, ?, ?)
        `);
        
        stmt.run(userId, version, Date.now());
      } catch (createError) {
        console.error('❌ ERRO ao criar tabela extension_pings:', createError);
      }
    }
  }

  async getRecentExtensionPing(userId: string): Promise<{ timestamp: number; version: string } | null> {
    try {
      const stmt = sqlite.prepare(`
        SELECT timestamp, version FROM extension_pings
        WHERE user_id = ?
      `);
      
      const result = stmt.get(userId) as { timestamp: number; version: string } | undefined;
      return result || null;
    } catch (error) {
      console.error('❌ ERRO ao buscar ping da extensão:', error);
      return null;
    }
  }

  // A/B Testing operations
  async getAbTests(userId: string): Promise<AbTest[]> {
    try {
      const stmt = sqlite.prepare(`
        SELECT * FROM ab_tests WHERE userId = ? ORDER BY createdAt DESC
      `);
      
      const rows = stmt.all(userId) as any[];
      return rows.map(row => ({
        ...row,
        funnelIds: JSON.parse(row.funnelIds || '[]'),
        funnelNames: JSON.parse(row.funnelNames || '[]'),
        trafficSplit: JSON.parse(row.trafficSplit || '[]')
      }));
    } catch (error) {
      console.error('❌ ERRO ao buscar testes A/B:', error);
      throw error;
    }
  }

  async getAbTest(id: string): Promise<AbTest | undefined> {
    try {
      const stmt = sqlite.prepare(`
        SELECT * FROM ab_tests WHERE id = ?
      `);
      
      const row = stmt.get(id) as any;
      if (!row) return undefined;
      
      return {
        ...row,
        funnelIds: JSON.parse(row.funnelIds || '[]'),
        funnelNames: JSON.parse(row.funnelNames || '[]'),
        trafficSplit: JSON.parse(row.trafficSplit || '[]')
      };
    } catch (error) {
      console.error('❌ ERRO ao buscar teste A/B:', error);
      throw error;
    }
  }

  async createAbTest(test: Omit<InsertAbTest, 'id' | 'createdAt' | 'updatedAt'>): Promise<AbTest> {
    const id = this.generateId();
    const timestamp = Math.floor(Date.now() / 1000);
    
    try {
      const stmt = sqlite.prepare(`
        INSERT INTO ab_tests (id, userId, name, description, funnelIds, funnelNames, trafficSplit, status, duration, endDate, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        id,
        test.userId,
        test.name,
        test.description || '',
        JSON.stringify(test.funnelIds),
        JSON.stringify(test.funnelNames),
        JSON.stringify(test.trafficSplit),
        test.status || 'active',
        test.duration || 14,
        test.endDate,
        timestamp,
        timestamp
      );
      
      const createdTest = await this.getAbTest(id);
      if (!createdTest) {
        throw new Error('Teste não criado');
      }
      
      return createdTest;
    } catch (error) {
      console.error('❌ ERRO ao criar teste A/B:', error);
      throw error;
    }
  }

  async updateAbTest(id: string, updates: Partial<InsertAbTest>): Promise<AbTest> {
    const timestamp = Math.floor(Date.now() / 1000);
    
    try {
      const fields = [];
      const values = [];
      
      for (const [key, value] of Object.entries(updates)) {
        if (key === 'funnelIds' || key === 'funnelNames' || key === 'trafficSplit') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      fields.push('updatedAt = ?');
      values.push(timestamp);
      values.push(id);
      
      const stmt = sqlite.prepare(`
        UPDATE ab_tests SET ${fields.join(', ')} WHERE id = ?
      `);
      
      stmt.run(...values);
      
      const updatedTest = await this.getAbTest(id);
      if (!updatedTest) {
        throw new Error('Teste não encontrado');
      }
      
      return updatedTest;
    } catch (error) {
      console.error('❌ ERRO ao atualizar teste A/B:', error);
      throw error;
    }
  }

  async deleteAbTest(id: string): Promise<void> {
    try {
      const stmt = sqlite.prepare(`DELETE FROM ab_tests WHERE id = ?`);
      stmt.run(id);
    } catch (error) {
      console.error('❌ ERRO ao deletar teste A/B:', error);
      throw error;
    }
  }

  async createAbTestView(view: Omit<InsertAbTestView, 'id' | 'createdAt'>): Promise<AbTestView> {
    const id = this.generateId();
    const timestamp = Math.floor(Date.now() / 1000);
    
    try {
      const stmt = sqlite.prepare(`
        INSERT INTO ab_test_views (id, testId, quizId, visitorId, ipAddress, userAgent, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        id,
        view.testId,
        view.quizId,
        view.visitorId,
        view.ipAddress,
        view.userAgent,
        timestamp
      );
      
      const createdView = sqlite.prepare(`
        SELECT * FROM ab_test_views WHERE id = ?
      `).get(id) as AbTestView;
      
      return createdView;
    } catch (error) {
      console.error('❌ ERRO ao criar visualização A/B:', error);
      throw error;
    }
  }

  async updateAbTestViews(testId: string): Promise<void> {
    try {
      const stmt = sqlite.prepare(`
        UPDATE ab_tests SET views = views + 1 WHERE id = ?
      `);
      stmt.run(testId);
    } catch (error) {
      console.error('❌ ERRO ao atualizar visualizações A/B:', error);
      throw error;
    }
  }
  // =============================================
  // SUBSCRIPTION PLANS METHODS
  // =============================================

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const plans = sqlite.prepare(`
        SELECT * FROM subscription_plans WHERE isActive = 1
      `).all() as SubscriptionPlan[];
      
      return plans.map(plan => {
        try {
          return {
            ...plan,
            features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features,
            limits: typeof plan.limits === 'string' ? JSON.parse(plan.limits) : plan.limits
          };
        } catch (parseError) {
          console.error('❌ ERRO ao fazer parse do plano:', plan.id, parseError);
          return {
            ...plan,
            features: [],
            limits: {}
          };
        }
      });
    } catch (error) {
      console.error('❌ ERRO ao buscar planos de assinatura:', error);
      return [];
    }
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    try {
      const plan = sqlite.prepare(`
        SELECT * FROM subscription_plans WHERE id = ? AND isActive = 1
      `).get(id) as SubscriptionPlan;
      
      if (!plan) return undefined;
      
      return {
        ...plan,
        features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features,
        limits: typeof plan.limits === 'string' ? JSON.parse(plan.limits) : plan.limits
      };
    } catch (error) {
      console.error('❌ ERRO ao buscar plano de assinatura:', error);
      return undefined;
    }
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    try {
      const id = crypto.randomUUID();
      const now = Date.now();
      
      const stmt = sqlite.prepare(`
        INSERT INTO subscription_plans (
          id, name, price, currency, billingInterval, features, limits, 
          stripePriceId, isActive, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        id, 
        plan.name, 
        plan.price, 
        plan.currency || 'BRL', 
        plan.billingInterval,
        JSON.stringify(plan.features),
        JSON.stringify(plan.limits),
        plan.stripePriceId || null,
        plan.isActive ? 1 : 0,
        now,
        now
      );
      
      const createdPlan = sqlite.prepare(`
        SELECT * FROM subscription_plans WHERE id = ?
      `).get(id) as SubscriptionPlan;
      
      return {
        ...createdPlan,
        features: JSON.parse(createdPlan.features),
        limits: JSON.parse(createdPlan.limits)
      };
    } catch (error) {
      console.error('❌ ERRO ao criar plano de assinatura:', error);
      throw error;
    }
  }

  async updateSubscriptionPlan(id: string, updates: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan> {
    try {
      const updateData: any = { ...updates, updatedAt: new Date() };
      
      if (updates.features) {
        updateData.features = JSON.stringify(updates.features);
      }
      
      if (updates.limits) {
        updateData.limits = JSON.stringify(updates.limits);
      }
      
      await db.update(subscriptionPlans)
        .set(updateData)
        .where(eq(subscriptionPlans.id, id));
      
      const updatedPlan = await db.select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, id))
        .get();
      
      return {
        ...updatedPlan,
        features: updatedPlan.features ? JSON.parse(updatedPlan.features) : [],
        limits: updatedPlan.limits ? JSON.parse(updatedPlan.limits) : {}
      };
    } catch (error) {
      console.error('❌ ERRO ao atualizar plano de assinatura:', error);
      throw error;
    }
  }

  // =============================================
  // SUBSCRIPTION METHODS
  // =============================================

  async createSubscription(subscription: {
    id: string;
    userId: string;
    customerId: string;
    status: string;
    trialEnd: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    createdAt: string;
  }): Promise<void> {
    try {
      // Criar tabela se não existir
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS user_subscriptions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          customer_id TEXT NOT NULL,
          status TEXT NOT NULL,
          trial_end TEXT,
          current_period_start TEXT,
          current_period_end TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);
      
      const stmt = sqlite.prepare(`
        INSERT OR REPLACE INTO user_subscriptions (
          id, user_id, customer_id, status, trial_end, 
          current_period_start, current_period_end, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const now = new Date().toISOString();
      
      stmt.run(
        subscription.id,
        subscription.userId,
        subscription.customerId,
        subscription.status,
        subscription.trialEnd,
        subscription.currentPeriodStart,
        subscription.currentPeriodEnd,
        subscription.createdAt,
        now
      );
      
      console.log('✅ Assinatura salva no banco local:', subscription.id);
    } catch (error) {
      console.error('❌ ERRO ao salvar assinatura no banco local:', error);
      throw error;
    }
  }

  async getUserSubscription(userId: string): Promise<any> {
    try {
      const stmt = sqlite.prepare(`
        SELECT * FROM user_subscriptions 
        WHERE user_id = ? AND status IN ('active', 'trialing', 'past_due')
        ORDER BY created_at DESC
        LIMIT 1
      `);
      
      const subscription = stmt.get(userId);
      
      if (!subscription) {
        return null;
      }
      
      return {
        id: subscription.id,
        userId: subscription.user_id,
        customerId: subscription.customer_id,
        status: subscription.status,
        trialEnd: subscription.trial_end,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        createdAt: subscription.created_at,
        updatedAt: subscription.updated_at
      };
    } catch (error) {
      console.error('❌ ERRO ao buscar assinatura do usuário:', error);
      return null;
    }
  }

  // =============================================
  // SUBSCRIPTION TRANSACTIONS METHODS
  // =============================================

  async createSubscriptionTransaction(transaction: InsertSubscriptionTransaction): Promise<SubscriptionTransaction> {
    try {
      const newTransaction = {
        id: crypto.randomUUID(),
        ...transaction,
        metadata: transaction.metadata ? JSON.stringify(transaction.metadata) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.insert(subscriptionTransactions).values(newTransaction);
      
      return {
        ...newTransaction,
        metadata: transaction.metadata || null
      };
    } catch (error) {
      console.error('❌ ERRO ao criar transação de assinatura:', error);
      throw error;
    }
  }

  async getSubscriptionTransactionsByUser(userId: string): Promise<SubscriptionTransaction[]> {
    try {
      const transactions = await db.select()
        .from(subscriptionTransactions)
        .where(eq(subscriptionTransactions.userId, userId))
        .orderBy(desc(subscriptionTransactions.createdAt));
      
      return transactions.map(transaction => ({
        ...transaction,
        metadata: transaction.metadata ? JSON.parse(transaction.metadata) : null
      }));
    } catch (error) {
      console.error('❌ ERRO ao buscar transações de assinatura:', error);
      return [];
    }
  }

  async updateSubscriptionTransaction(id: string, updates: Partial<InsertSubscriptionTransaction>): Promise<SubscriptionTransaction> {
    try {
      const updateData: any = { ...updates, updatedAt: new Date() };
      
      if (updates.metadata) {
        updateData.metadata = JSON.stringify(updates.metadata);
      }
      
      await db.update(subscriptionTransactions)
        .set(updateData)
        .where(eq(subscriptionTransactions.id, id));
      
      const updatedTransaction = await db.select()
        .from(subscriptionTransactions)
        .where(eq(subscriptionTransactions.id, id))
        .get();
      
      return {
        ...updatedTransaction,
        metadata: updatedTransaction.metadata ? JSON.parse(updatedTransaction.metadata) : null
      };
    } catch (error) {
      console.error('❌ ERRO ao atualizar transação de assinatura:', error);
      throw error;
    }
  }

  // =============================================
  // CREDIT TRANSACTIONS METHODS
  // =============================================

  async createCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction> {
    try {
      const newTransaction = {
        id: crypto.randomUUID(),
        ...transaction,
        metadata: transaction.metadata ? JSON.stringify(transaction.metadata) : null,
        createdAt: new Date()
      };
      
      await db.insert(creditTransactions).values(newTransaction);
      
      return {
        ...newTransaction,
        metadata: transaction.metadata || null
      };
    } catch (error) {
      console.error('❌ ERRO ao criar transação de crédito:', error);
      throw error;
    }
  }

  async getCreditTransactionsByUser(userId: string): Promise<CreditTransaction[]> {
    try {
      const transactions = await db.select()
        .from(creditTransactions)
        .where(eq(creditTransactions.userId, userId))
        .orderBy(desc(creditTransactions.createdAt));
      
      return transactions.map(transaction => ({
        ...transaction,
        metadata: transaction.metadata ? JSON.parse(transaction.metadata) : null
      }));
    } catch (error) {
      console.error('❌ ERRO ao buscar transações de crédito:', error);
      return [];
    }
  }

  async updateUserCredits(userId: string, type: string, amount: number, operation: string, reason: string): Promise<User> {
    try {
      // Primeiro, buscar o usuário atual
      const user = await db.select().from(users).where(eq(users.id, userId)).get();
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      // Calcular os novos créditos
      const creditField = `${type}Credits` as keyof User;
      const currentCredits = user[creditField] as number || 0;
      const newCredits = operation === 'add' ? currentCredits + amount : currentCredits - amount;
      
      // Garantir que os créditos não fiquem negativos
      if (newCredits < 0) {
        throw new Error('Créditos insuficientes');
      }
      
      // Atualizar os créditos do usuário
      const updateData: any = { updatedAt: new Date() };
      updateData[creditField] = newCredits;
      
      await db.update(users)
        .set(updateData)
        .where(eq(users.id, userId));
      
      // Registrar a transação de crédito
      await this.createCreditTransaction({
        userId,
        type,
        amount,
        operation,
        reason,
        metadata: null
      });
      
      // Retornar o usuário atualizado
      const updatedUser = await db.select().from(users).where(eq(users.id, userId)).get();
      return updatedUser;
    } catch (error) {
      console.error('❌ ERRO ao atualizar créditos do usuário:', error);
      throw error;
    }
  }

  // =============================================
  // PLAN MANAGEMENT METHODS
  // =============================================

  async checkUserPlanAccess(userId: string, feature: string): Promise<boolean> {
    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).get();
      if (!user) return false;
      
      // Verificar se o plano expirou
      const planExpired = await this.checkPlanExpiration(userId);
      if (planExpired) {
        return false;
      }
      
      // Buscar as configurações do plano
      const planLimits = await this.getUserPlanLimits(userId);
      
      // Verificar se o recurso está disponível no plano
      if (planLimits.features && planLimits.features.includes(feature)) {
        return true;
      }
      
      // Verificar para planos específicos
      if (user.plan === 'basic' && ['quiz_publishing', 'email_campaigns'].includes(feature)) {
        return true;
      }
      
      if (user.plan === 'premium' && ['quiz_publishing', 'email_campaigns', 'whatsapp_campaigns', 'ai_videos'].includes(feature)) {
        return true;
      }
      
      if (user.plan === 'enterprise') {
        return true; // Acesso completo
      }
      
      return false;
    } catch (error) {
      console.error('❌ ERRO ao verificar acesso ao plano:', error);
      return false;
    }
  }

  async getUserPlanLimits(userId: string): Promise<any> {
    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).get();
      if (!user) return {};
      
      // Limites padrão por plano
      const planLimits = {
        trial: {
          quizzes: 3,
          responses: 100,
          sms: 50,
          email: 100,
          whatsapp: 25,
          ai: 5,
          features: ['quiz_creation', 'basic_analytics']
        },
        basic: {
          quizzes: 10,
          responses: 1000,
          sms: 500,
          email: 1000,
          whatsapp: 250,
          ai: 25,
          features: ['quiz_creation', 'quiz_publishing', 'basic_analytics', 'email_campaigns']
        },
        premium: {
          quizzes: 50,
          responses: 10000,
          sms: 2500,
          email: 5000,
          whatsapp: 1250,
          ai: 100,
          features: ['quiz_creation', 'quiz_publishing', 'advanced_analytics', 'email_campaigns', 'whatsapp_campaigns', 'ai_videos']
        },
        enterprise: {
          quizzes: -1, // Ilimitado
          responses: -1,
          sms: -1,
          email: -1,
          whatsapp: -1,
          ai: -1,
          features: ['all']
        }
      };
      
      return planLimits[user.plan] || planLimits.trial;
    } catch (error) {
      console.error('❌ ERRO ao buscar limites do plano:', error);
      return {};
    }
  }

  async checkPlanExpiration(userId: string): Promise<boolean> {
    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).get();
      if (!user) return true;
      
      // Verificar se o plano tem data de expiração
      if (user.planExpiresAt) {
        const now = new Date();
        const expirationDate = new Date(user.planExpiresAt);
        
        if (now > expirationDate) {
          // Plano expirado - atualizar para trial
          await db.update(users)
            .set({
              plan: 'trial',
              subscriptionStatus: 'expired',
              planRenewalRequired: true,
              updatedAt: new Date()
            })
            .where(eq(users.id, userId));
          
          return true;
        }
      }
      
      // Verificar se o trial expirou
      if (user.plan === 'trial' && user.trialExpiresAt) {
        const now = new Date();
        const trialExpiration = new Date(user.trialExpiresAt);
        
        if (now > trialExpiration) {
          // Trial expirado - bloquear criação de quizzes
          await db.update(users)
            .set({
              planRenewalRequired: true,
              updatedAt: new Date()
            })
            .where(eq(users.id, userId));
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ ERRO ao verificar expiração do plano:', error);
      return true;
    }
  }

  async renewUserPlan(userId: string, planId: string): Promise<User> {
    try {
      const plan = await this.getSubscriptionPlan(planId);
      if (!plan) {
        throw new Error('Plano não encontrado');
      }
      
      // Calcular nova data de expiração
      const now = new Date();
      const expirationDate = new Date(now);
      
      if (plan.billingInterval === 'monthly') {
        expirationDate.setMonth(expirationDate.getMonth() + 1);
      } else if (plan.billingInterval === 'yearly') {
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      }
      
      // Atualizar o plano do usuário
      await db.update(users)
        .set({
          plan: plan.name.toLowerCase(),
          planExpiresAt: expirationDate,
          subscriptionStatus: 'active',
          planRenewalRequired: false,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
      
      // Retornar o usuário atualizado
      const updatedUser = await db.select().from(users).where(eq(users.id, userId)).get();
      return updatedUser;
    } catch (error) {
      console.error('❌ ERRO ao renovar plano do usuário:', error);
      throw error;
    }
  }

  // Método para inicializar planos padrão
  async initializeDefaultPlans(): Promise<void> {
    try {
      // Verificar se já existem planos
      const existingPlans = await db.select().from(subscriptionPlans).limit(1);
      if (existingPlans.length > 0) {
        return; // Planos já existem
      }
      
      // Criar planos padrão
      const defaultPlans = [
        {
          id: 'basic-monthly',
          name: 'basic',
          price: 29.90,
          currency: 'BRL',
          billingInterval: 'monthly',
          features: ['quiz_publishing', 'email_campaigns', 'basic_analytics'],
          limits: { quizzes: 10, responses: 1000, sms: 500, email: 1000 },
          stripePriceId: null,
          isActive: true
        },
        {
          id: 'premium-monthly',
          name: 'premium',
          price: 79.90,
          currency: 'BRL',
          billingInterval: 'monthly',
          features: ['quiz_publishing', 'email_campaigns', 'whatsapp_campaigns', 'ai_videos', 'advanced_analytics'],
          limits: { quizzes: 50, responses: 10000, sms: 2500, email: 5000, whatsapp: 1250, ai: 100 },
          stripePriceId: null,
          isActive: true
        },
        {
          id: 'enterprise-monthly',
          name: 'enterprise',
          price: 199.90,
          currency: 'BRL',
          billingInterval: 'monthly',
          features: ['all'],
          limits: { quizzes: -1, responses: -1, sms: -1, email: -1, whatsapp: -1, ai: -1 },
          stripePriceId: null,
          isActive: true
        }
      ];
      
      for (const plan of defaultPlans) {
        await this.createSubscriptionPlan(plan);
      }
      
      console.log('✅ Planos padrão criados com sucesso');
    } catch (error) {
      console.error('❌ ERRO ao inicializar planos padrão:', error);
    }
  }

  // Método para configurar trial de 7 dias para novos usuários
  async setupUserTrial(userId: string): Promise<void> {
    try {
      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + 7); // 7 dias de trial
      
      await db.update(users)
        .set({
          plan: 'trial',
          trialExpiresAt: trialExpiresAt,
          subscriptionStatus: 'active',
          planRenewalRequired: false,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
      
      console.log(`✅ Trial de 7 dias configurado para usuário ${userId}`);
    } catch (error) {
      console.error('❌ ERRO ao configurar trial do usuário:', error);
    }
  }

  // ==================== CHECKOUT SYSTEM METHODS ====================

  // Buscar todos os checkouts
  async getAllCheckouts(): Promise<any[]> {
    try {
      const result = sqlite.prepare(`
        SELECT * FROM checkout_products 
        ORDER BY created_at DESC
      `).all();
      
      return result;
    } catch (error) {
      console.error('Erro ao buscar checkouts:', error);
      // Criar tabela se não existir
      await this.createCheckoutTables();
      return [];
    }
  }

  // Método para atualizar checkout
  async updateCheckout(checkoutId: string, data: any): Promise<void> {
    try {
      const { stripePriceId, stripeProductId, ...updateData } = data;
      
      let query = `UPDATE checkout_products SET updatedAt = ? `;
      const params = [new Date().toISOString()];
      
      if (stripePriceId) {
        query += `, stripe_price_id = ? `;
        params.push(stripePriceId);
      }
      
      if (stripeProductId) {
        query += `, stripe_product_id = ? `;
        params.push(stripeProductId);
      }
      
      // Adicionar outros campos se necessário
      Object.keys(updateData).forEach(key => {
        query += `, ${key} = ? `;
        params.push(updateData[key]);
      });
      
      query += ` WHERE id = ?`;
      params.push(checkoutId);
      
      sqlite.prepare(query).run(...params);
    } catch (error) {
      console.error('Erro ao atualizar checkout:', error);
      throw error;
    }
  }

  // Buscar checkout por ID
  async getCheckoutById(id: string): Promise<any | undefined> {
    try {
      const row = sqlite.prepare(`
        SELECT * FROM checkout_products WHERE id = ?
      `).get(id);
      
      if (!row) return undefined;
      
      return {
        ...row,
        design: JSON.parse(row.design || '{}'),
        features: JSON.parse(row.features || '[]'),
        orderBumps: JSON.parse(row.order_bumps || '[]'),
        upsells: JSON.parse(row.upsells || '[]')
      };
    } catch (error) {
      console.error('Erro ao buscar checkout:', error);
      return undefined;
    }
  }

  // Criar checkout
  async createCheckout(checkout: any): Promise<any> {
    try {
      const stmt = sqlite.prepare(`
        INSERT INTO checkout_products (
          id, userId, name, description, price, currency, category, 
          features, paymentMode, recurringInterval, trialPeriod, trialPrice,
          status, customization, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        checkout.id,
        checkout.userId,
        checkout.name,
        checkout.description,
        checkout.price,
        checkout.currency || 'BRL',
        checkout.category || 'digital',
        checkout.features || 'Funcionalidades padrão',
        checkout.paymentMode || 'one_time',
        checkout.recurringInterval || null,
        checkout.trialPeriod || 0,
        checkout.trialPrice || 0,
        checkout.status || 'active',
        JSON.stringify(checkout.customization || {}),
        Date.now(),
        Date.now()
      );
      
      return await this.getCheckoutById(checkout.id);
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      throw error;
    }
  }

  // Atualizar checkout
  async updateCheckout(id: string, updates: any): Promise<any> {
    try {
      const setClause = [];
      const values = [];
      
      if (updates.name !== undefined) {
        setClause.push('name = ?');
        values.push(updates.name);
      }
      if (updates.description !== undefined) {
        setClause.push('description = ?');
        values.push(updates.description);
      }
      if (updates.price !== undefined) {
        setClause.push('price = ?');
        values.push(updates.price);
      }
      if (updates.originalPrice !== undefined) {
        setClause.push('original_price = ?');
        values.push(updates.originalPrice);
      }
      if (updates.currency !== undefined) {
        setClause.push('currency = ?');
        values.push(updates.currency);
      }
      if (updates.billingType !== undefined) {
        setClause.push('billing_type = ?');
        values.push(updates.billingType);
      }
      if (updates.subscriptionInterval !== undefined) {
        setClause.push('subscription_interval = ?');
        values.push(updates.subscriptionInterval);
      }
      if (updates.features !== undefined) {
        setClause.push('features = ?');
        values.push(JSON.stringify(updates.features));
      }
      if (updates.orderBumps !== undefined) {
        setClause.push('order_bumps = ?');
        values.push(JSON.stringify(updates.orderBumps));
      }
      if (updates.upsells !== undefined) {
        setClause.push('upsells = ?');
        values.push(JSON.stringify(updates.upsells));
      }
      if (updates.design !== undefined) {
        setClause.push('design = ?');
        values.push(JSON.stringify(updates.design));
      }
      if (updates.active !== undefined) {
        setClause.push('active = ?');
        values.push(updates.active ? 1 : 0);
      }
      
      setClause.push('updated_at = ?');
      values.push(updates.updatedAt);
      values.push(id);
      
      const stmt = sqlite.prepare(`
        UPDATE checkout_products 
        SET ${setClause.join(', ')} 
        WHERE id = ?
      `);
      
      stmt.run(...values);
      
      return await this.getCheckoutById(id);
    } catch (error) {
      console.error('Erro ao atualizar checkout:', error);
      throw error;
    }
  }

  // Deletar checkout
  async deleteCheckout(id: string): Promise<void> {
    try {
      const stmt = sqlite.prepare('DELETE FROM checkouts WHERE id = ?');
      stmt.run(id);
    } catch (error) {
      console.error('Erro ao deletar checkout:', error);
      throw error;
    }
  }

  // Buscar estatísticas do checkout
  async getCheckoutStats(checkoutId: string): Promise<any> {
    try {
      const statsRow = sqlite.prepare(`
        SELECT 
          COALESCE(views, 0) as views,
          COALESCE(conversions, 0) as conversions,
          COALESCE(revenue, 0) as revenue
        FROM checkout_stats 
        WHERE checkout_id = ?
      `).get(checkoutId);
      
      if (!statsRow) {
        return {
          views: 0,
          conversions: 0,
          conversionRate: 0,
          revenue: 0
        };
      }
      
      const conversionRate = statsRow.views > 0 ? (statsRow.conversions / statsRow.views) : 0;
      
      return {
        views: statsRow.views,
        conversions: statsRow.conversions,
        conversionRate,
        revenue: statsRow.revenue
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        views: 0,
        conversions: 0,
        conversionRate: 0,
        revenue: 0
      };
    }
  }

  // Incrementar visualizações
  async incrementCheckoutViews(checkoutId: string): Promise<void> {
    try {
      const stmt = sqlite.prepare(`
        INSERT INTO checkout_stats (checkout_id, views, conversions, revenue)
        VALUES (?, 1, 0, 0)
        ON CONFLICT(checkout_id) DO UPDATE SET
          views = views + 1
      `);
      
      stmt.run(checkoutId);
    } catch (error) {
      console.error('Erro ao incrementar visualizações:', error);
    }
  }

  // Incrementar conversões
  async incrementCheckoutConversions(checkoutId: string): Promise<void> {
    try {
      const stmt = sqlite.prepare(`
        INSERT INTO checkout_stats (checkout_id, views, conversions, revenue)
        VALUES (?, 0, 1, 0)
        ON CONFLICT(checkout_id) DO UPDATE SET
          conversions = conversions + 1
      `);
      
      stmt.run(checkoutId);
    } catch (error) {
      console.error('Erro ao incrementar conversões:', error);
    }
  }

  // Criar pedido
  async createOrder(order: any): Promise<any> {
    try {
      const stmt = sqlite.prepare(`
        INSERT INTO orders (
          id, checkout_id, stripe_payment_intent_id, customer_data, 
          total_amount, currency, status, order_bumps, accepted_upsells, 
          created_at, paid_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        order.id,
        order.checkoutId,
        order.stripePaymentIntentId,
        JSON.stringify(order.customerData),
        order.totalAmount,
        order.currency,
        order.status,
        JSON.stringify(order.orderBumps || []),
        JSON.stringify(order.acceptedUpsells || []),
        order.createdAt,
        order.paidAt || null
      );
      
      return await this.getOrderById(order.id);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
  }

  // Buscar pedido por ID
  async getOrderById(id: string): Promise<any | undefined> {
    try {
      const row = sqlite.prepare(`
        SELECT * FROM orders WHERE id = ?
      `).get(id);
      
      if (!row) return undefined;
      
      return {
        ...row,
        customerData: JSON.parse(row.customer_data || '{}'),
        orderBumps: JSON.parse(row.order_bumps || '[]'),
        acceptedUpsells: JSON.parse(row.accepted_upsells || '[]')
      };
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      return undefined;
    }
  }

  // Atualizar pedido por Stripe Payment Intent ID
  async updateOrderByStripePaymentIntentId(paymentIntentId: string, updates: any): Promise<any> {
    try {
      const setClause = [];
      const values = [];
      
      if (updates.status !== undefined) {
        setClause.push('status = ?');
        values.push(updates.status);
      }
      if (updates.paidAt !== undefined) {
        setClause.push('paid_at = ?');
        values.push(updates.paidAt);
      }
      
      values.push(paymentIntentId);
      
      const stmt = sqlite.prepare(`
        UPDATE orders 
        SET ${setClause.join(', ')} 
        WHERE stripe_payment_intent_id = ?
      `);
      
      stmt.run(...values);
      
      // Buscar e retornar o pedido atualizado
      const orderRow = sqlite.prepare(`
        SELECT * FROM orders WHERE stripe_payment_intent_id = ?
      `).get(paymentIntentId);
      
      if (orderRow) {
        // Atualizar estatísticas de receita se for completado
        if (updates.status === 'completed') {
          sqlite.prepare(`
            UPDATE checkout_stats 
            SET revenue = revenue + ?
            WHERE checkout_id = ?
          `).run(orderRow.total_amount, orderRow.checkout_id);
        }
        
        return {
          ...orderRow,
          customerData: JSON.parse(orderRow.customer_data || '{}'),
          orderBumps: JSON.parse(orderRow.order_bumps || '[]'),
          acceptedUpsells: JSON.parse(orderRow.accepted_upsells || '[]')
        };
      }
      
      return undefined;
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      throw error;
    }
  }

  // Criar tabelas do sistema de checkout
  private async createCheckoutTables(): Promise<void> {
    try {
      // Tabela de produtos de checkout
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS checkout_products (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          currency TEXT NOT NULL DEFAULT 'BRL',
          category TEXT,
          features TEXT DEFAULT '',
          payment_mode TEXT DEFAULT 'one_time',
          recurring_interval TEXT,
          trial_period INTEGER,
          trial_price REAL,
          status TEXT DEFAULT 'active',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);
      
      // Tabela de páginas de checkout
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS checkout_pages (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          name TEXT NOT NULL,
          slug TEXT NOT NULL,
          template TEXT DEFAULT 'default',
          custom_css TEXT,
          custom_js TEXT,
          seo_title TEXT,
          seo_description TEXT,
          status TEXT DEFAULT 'active',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (product_id) REFERENCES checkout_products(id)
        )
      `);
      
      // Tabela de transações de checkout
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS checkout_transactions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          checkout_id TEXT,
          customer_data TEXT NOT NULL,
          total_amount REAL NOT NULL,
          currency TEXT NOT NULL DEFAULT 'BRL',
          payment_status TEXT DEFAULT 'pending',
          payment_method TEXT,
          gateway TEXT DEFAULT 'stripe',
          gateway_transaction_id TEXT,
          accepted_upsells TEXT DEFAULT '[]',
          created_at TEXT NOT NULL,
          paid_at TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (product_id) REFERENCES checkout_products(id)
        )
      `);
      
      // Tabela de analytics de checkout
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS checkout_analytics (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          page_id TEXT,
          event_type TEXT NOT NULL,
          event_data TEXT,
          ip_address TEXT,
          user_agent TEXT,
          referrer TEXT,
          created_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (product_id) REFERENCES checkout_products(id),
          FOREIGN KEY (page_id) REFERENCES checkout_pages(id)
        )
      `);
      
      // Tabela de checkouts (legacy)
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS checkouts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          original_price REAL,
          currency TEXT NOT NULL DEFAULT 'BRL',
          billing_type TEXT NOT NULL DEFAULT 'one_time',
          subscription_interval TEXT,
          features TEXT NOT NULL DEFAULT '[]',
          order_bumps TEXT NOT NULL DEFAULT '[]',
          upsells TEXT NOT NULL DEFAULT '[]',
          design TEXT NOT NULL DEFAULT '{}',
          active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);
      
      // Tabela de estatísticas de checkout (legacy)
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS checkout_stats (
          checkout_id TEXT PRIMARY KEY,
          views INTEGER NOT NULL DEFAULT 0,
          conversions INTEGER NOT NULL DEFAULT 0,
          revenue REAL NOT NULL DEFAULT 0,
          FOREIGN KEY (checkout_id) REFERENCES checkouts(id)
        )
      `);
      
      // Tabela de pedidos (legacy)
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          checkout_id TEXT NOT NULL,
          stripe_payment_intent_id TEXT NOT NULL,
          customer_data TEXT NOT NULL,
          total_amount REAL NOT NULL,
          currency TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          order_bumps TEXT NOT NULL DEFAULT '[]',
          accepted_upsells TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL,
          paid_at TEXT,
          FOREIGN KEY (checkout_id) REFERENCES checkouts(id)
        )
      `);
      
      // Índices para performance
      sqlite.exec(`
        CREATE INDEX IF NOT EXISTS idx_checkout_products_user_id ON checkout_products(user_id);
        CREATE INDEX IF NOT EXISTS idx_checkout_products_status ON checkout_products(status);
        CREATE INDEX IF NOT EXISTS idx_checkout_pages_user_id ON checkout_pages(user_id);
        CREATE INDEX IF NOT EXISTS idx_checkout_pages_product_id ON checkout_pages(product_id);
        CREATE INDEX IF NOT EXISTS idx_checkout_transactions_user_id ON checkout_transactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_checkout_transactions_product_id ON checkout_transactions(product_id);
        CREATE INDEX IF NOT EXISTS idx_checkout_analytics_user_id ON checkout_analytics(user_id);
        CREATE INDEX IF NOT EXISTS idx_checkout_analytics_product_id ON checkout_analytics(product_id);
        CREATE INDEX IF NOT EXISTS idx_checkouts_user_id ON checkouts(user_id);
        CREATE INDEX IF NOT EXISTS idx_checkouts_active ON checkouts(active);
        CREATE INDEX IF NOT EXISTS idx_orders_checkout_id ON orders(checkout_id);
        CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      `);
      
      console.log('✅ Tabelas do sistema de checkout criadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao criar tabelas do checkout:', error);
      throw error;
    }
  }

  // =============================================
  // CHECKOUT BUILDER METHODS
  // =============================================

  async getProductsByUserId(userId: string): Promise<CheckoutProduct[]> {
    try {
      const products = await db.select().from(checkoutProducts).where(eq(checkoutProducts.user_id, userId));
      return products;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<CheckoutProduct | undefined> {
    try {
      const [product] = await db.select().from(checkoutProducts).where(eq(checkoutProducts.id, id));
      return product;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  }

  async createProduct(product: InsertCheckoutProduct): Promise<CheckoutProduct> {
    try {
      const [newProduct] = await db.insert(checkoutProducts).values(product).returning();
      return newProduct;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: Partial<InsertCheckoutProduct>): Promise<CheckoutProduct> {
    try {
      const [updatedProduct] = await db.update(checkoutProducts)
        .set(updates)
        .where(eq(checkoutProducts.id, id))
        .returning();
      return updatedProduct;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await db.delete(checkoutProducts).where(eq(checkoutProducts.id, id));
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  }

  async getCheckoutPagesByUserId(userId: string): Promise<CheckoutPage[]> {
    try {
      const pages = await db.select().from(checkoutPages).where(eq(checkoutPages.user_id, userId));
      return pages;
    } catch (error) {
      console.error('Erro ao buscar páginas de checkout:', error);
      throw error;
    }
  }

  async getCheckoutPageById(id: string): Promise<CheckoutPage | undefined> {
    try {
      const [page] = await db.select().from(checkoutPages).where(eq(checkoutPages.id, id));
      return page;
    } catch (error) {
      console.error('Erro ao buscar página de checkout:', error);
      throw error;
    }
  }

  async createCheckoutPage(page: InsertCheckoutPage): Promise<CheckoutPage> {
    try {
      const [newPage] = await db.insert(checkoutPages).values(page).returning();
      return newPage;
    } catch (error) {
      console.error('Erro ao criar página de checkout:', error);
      throw error;
    }
  }

  async updateCheckoutPage(id: string, updates: Partial<InsertCheckoutPage>): Promise<CheckoutPage> {
    try {
      const [updatedPage] = await db.update(checkoutPages)
        .set(updates)
        .where(eq(checkoutPages.id, id))
        .returning();
      return updatedPage;
    } catch (error) {
      console.error('Erro ao atualizar página de checkout:', error);
      throw error;
    }
  }

  async deleteCheckoutPage(id: string): Promise<void> {
    try {
      await db.delete(checkoutPages).where(eq(checkoutPages.id, id));
    } catch (error) {
      console.error('Erro ao deletar página de checkout:', error);
      throw error;
    }
  }

  async getCheckoutTransactionsByUserId(userId: string): Promise<CheckoutTransaction[]> {
    try {
      const transactions = await db.select().from(checkoutTransactions).where(eq(checkoutTransactions.user_id, userId));
      return transactions;
    } catch (error) {
      console.error('Erro ao buscar transações de checkout:', error);
      throw error;
    }
  }

  async getCheckoutTransactionById(id: string): Promise<CheckoutTransaction | undefined> {
    try {
      const [transaction] = await db.select().from(checkoutTransactions).where(eq(checkoutTransactions.id, id));
      return transaction;
    } catch (error) {
      console.error('Erro ao buscar transação de checkout:', error);
      throw error;
    }
  }

  async createCheckoutTransaction(transaction: InsertCheckoutTransaction): Promise<CheckoutTransaction> {
    try {
      const [newTransaction] = await db.insert(checkoutTransactions).values(transaction).returning();
      return newTransaction;
    } catch (error) {
      console.error('Erro ao criar transação de checkout:', error);
      throw error;
    }
  }

  async updateCheckoutTransaction(id: string, updates: Partial<InsertCheckoutTransaction>): Promise<CheckoutTransaction> {
    try {
      const [updatedTransaction] = await db.update(checkoutTransactions)
        .set(updates)
        .where(eq(checkoutTransactions.id, id))
        .returning();
      return updatedTransaction;
    } catch (error) {
      console.error('Erro ao atualizar transação de checkout:', error);
      throw error;
    }
  }

  async deleteCheckoutTransaction(id: string): Promise<void> {
    try {
      await db.delete(checkoutTransactions).where(eq(checkoutTransactions.id, id));
    } catch (error) {
      console.error('Erro ao deletar transação de checkout:', error);
      throw error;
    }
  }

  async getCheckoutAnalytics(userId: string, filters?: { startDate?: string; endDate?: string; productId?: string }): Promise<any> {
    try {
      let query = db.select().from(checkoutAnalytics).where(eq(checkoutAnalytics.user_id, userId));
      
      if (filters?.startDate) {
        query = query.where(gte(checkoutAnalytics.created_at, filters.startDate));
      }
      
      if (filters?.endDate) {
        query = query.where(lte(checkoutAnalytics.created_at, filters.endDate));
      }
      
      if (filters?.productId) {
        query = query.where(eq(checkoutAnalytics.product_id, filters.productId));
      }
      
      const analytics = await query;
      return analytics;
    } catch (error) {
      console.error('Erro ao buscar analytics de checkout:', error);
      throw error;
    }
  }

  async createCheckoutAnalytics(analytics: InsertCheckoutAnalytics): Promise<CheckoutAnalytics> {
    try {
      const [newAnalytics] = await db.insert(checkoutAnalytics).values(analytics).returning();
      return newAnalytics;
    } catch (error) {
      console.error('Erro ao criar analytics de checkout:', error);
      throw error;
    }
  }

  // Método para buscar analytics de checkout específico
  async getCheckoutAnalyticsById(checkoutId: string): Promise<any> {
    try {
      const result = sqlite.prepare(`
        SELECT * FROM checkout_analytics 
        WHERE id = ?
      `).get(checkoutId);
      
      if (result) {
        // Retorna dados reais encontrados
        return {
          id: result.id,
          user_id: result.user_id,
          product_id: result.product_id,
          page_id: result.page_id,
          event_type: result.event_type,
          event_data: result.event_data,
          ip_address: result.ip_address,
          user_agent: result.user_agent,
          referrer: result.referrer,
          created_at: result.created_at
        };
      } else {
        // Retorna null quando não encontra dados ao invés de objeto vazio
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar analytics por ID:', error);
      // Retorna null em caso de erro também
      return null;
    }
  }

  // ==================== MÉTODOS DE PRODUTOS E ASSINATURAS ====================

  async getCustomProducts(): Promise<any[]> {
    try {
      const result = sqlite.prepare("SELECT * FROM custom_products ORDER BY created_at DESC").all();
      return result;
    } catch (error) {
      console.error('Erro ao buscar produtos customizados:', error);
      return [];
    }
  }

  async createCustomProduct(productData: any): Promise<any> {
    try {
      const id = nanoid();
      const product = {
        id,
        ...productData,
        features: JSON.stringify(productData.features || []),
        metadata: JSON.stringify(productData.metadata || {}),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const stmt = sqlite.prepare(`
        INSERT INTO custom_products (
          id, user_id, name, description, price, currency, type, recurrence, 
          trial_days, setup_fee, features, metadata, gateway_id, active, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        product.id, product.user_id, product.name, product.description,
        product.price, product.currency, product.type, product.recurrence,
        product.trial_days, product.setup_fee, product.features, product.metadata,
        product.gateway_id, product.active ? 1 : 0, product.created_at, product.updated_at
      );

      return product;
    } catch (error) {
      console.error('Erro ao criar produto customizado:', error);
      throw error;
    }
  }

  async updateCustomProduct(id: string, updateData: any, userId: string): Promise<any> {
    try {
      const product = {
        ...updateData,
        features: JSON.stringify(updateData.features || []),
        metadata: JSON.stringify(updateData.metadata || {}),
        updated_at: new Date().toISOString()
      };

      const stmt = sqlite.prepare(`
        UPDATE custom_products 
        SET name = ?, description = ?, price = ?, currency = ?, type = ?, 
            recurrence = ?, trial_days = ?, setup_fee = ?, features = ?, 
            metadata = ?, gateway_id = ?, active = ?, updated_at = ?
        WHERE id = ? AND user_id = ?
      `);

      stmt.run(
        product.name, product.description, product.price, product.currency,
        product.type, product.recurrence, product.trial_days, product.setup_fee,
        product.features, product.metadata, product.gateway_id, 
        product.active ? 1 : 0, product.updated_at, id, userId
      );

      return { id, ...product };
    } catch (error) {
      console.error('Erro ao atualizar produto customizado:', error);
      throw error;
    }
  }

  async deleteCustomProduct(id: string, userId: string): Promise<void> {
    try {
      const stmt = sqlite.prepare("DELETE FROM custom_products WHERE id = ? AND user_id = ?");
      stmt.run(id, userId);
    } catch (error) {
      console.error('Erro ao deletar produto customizado:', error);
      throw error;
    }
  }

  async getCustomSubscriptions(): Promise<any[]> {
    try {
      const result = sqlite.prepare(`
        SELECT 
          s.*,
          p.name as product_name,
          c.name as customer_name,
          c.email as customer_email
        FROM custom_subscriptions s
        LEFT JOIN custom_products p ON s.product_id = p.id
        LEFT JOIN subscription_customers c ON s.customer_id = c.id
        ORDER BY s.created_at DESC
      `).all();
      
      return result.map(sub => ({
        ...sub,
        metadata: sub.metadata ? JSON.parse(sub.metadata) : {}
      }));
    } catch (error) {
      console.error('Erro ao buscar assinaturas customizadas:', error);
      return [];
    }
  }

  async createCustomSubscription(subscriptionData: any): Promise<any> {
    try {
      const id = nanoid();
      const subscription = {
        id,
        ...subscriptionData,
        metadata: JSON.stringify(subscriptionData.metadata || {}),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const stmt = sqlite.prepare(`
        INSERT INTO custom_subscriptions (
          id, user_id, product_id, customer_id, status, trial_start, trial_end,
          next_billing_date, last_billing_date, billing_cycle, amount, setup_fee,
          currency, gateway_id, metadata, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        subscription.id, subscription.user_id, subscription.product_id,
        subscription.customer_id, subscription.status, subscription.trial_start,
        subscription.trial_end, subscription.next_billing_date,
        subscription.last_billing_date, subscription.billing_cycle,
        subscription.amount, subscription.setup_fee, subscription.currency,
        subscription.gateway_id, subscription.metadata, subscription.created_at,
        subscription.updated_at
      );

      return subscription;
    } catch (error) {
      console.error('Erro ao criar assinatura customizada:', error);
      throw error;
    }
  }

  async cancelCustomSubscription(id: string, reason: string): Promise<any> {
    try {
      const stmt = sqlite.prepare(`
        UPDATE custom_subscriptions 
        SET status = 'cancelled', cancelled_at = ?, cancellation_reason = ?, updated_at = ?
        WHERE id = ?
      `);

      const now = new Date().toISOString();
      stmt.run(now, reason, now, id);

      const result = sqlite.prepare("SELECT * FROM custom_subscriptions WHERE id = ?").get(id);
      return result;
    } catch (error) {
      console.error('Erro ao cancelar assinatura customizada:', error);
      throw error;
    }
  }

  async getBillingStats(): Promise<any> {
    try {
      const totalSubs = sqlite.prepare("SELECT COUNT(*) as count FROM custom_subscriptions").get().count;
      const activeSubs = sqlite.prepare("SELECT COUNT(*) as count FROM custom_subscriptions WHERE status = 'active'").get().count;
      const trialSubs = sqlite.prepare("SELECT COUNT(*) as count FROM custom_subscriptions WHERE status = 'trialing'").get().count;
      const cancelledSubs = sqlite.prepare("SELECT COUNT(*) as count FROM custom_subscriptions WHERE status = 'cancelled'").get().count;
      
      const monthlyRevenue = sqlite.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM custom_subscriptions 
        WHERE status = 'active' AND billing_cycle = 'monthly'
      `).get().total;

      const upcomingCharges = sqlite.prepare(`
        SELECT 
          s.id, s.amount, s.next_billing_date,
          p.name as product_name,
          c.name as customer_name
        FROM custom_subscriptions s
        LEFT JOIN custom_products p ON s.product_id = p.id
        LEFT JOIN subscription_customers c ON s.customer_id = c.id
        WHERE s.status = 'active' AND s.next_billing_date > ?
        ORDER BY s.next_billing_date ASC
        LIMIT 10
      `).all(new Date().toISOString());

      return {
        stats: {
          total_subscriptions: totalSubs,
          active_subscriptions: activeSubs,
          trial_subscriptions: trialSubs,
          cancelled_subscriptions: cancelledSubs,
          total_monthly_revenue: monthlyRevenue
        },
        upcoming_charges: upcomingCharges
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de cobrança:', error);
      return { stats: {}, upcoming_charges: [] };
    }
  }

  async getBillingTransactions(): Promise<any[]> {
    try {
      const result = sqlite.prepare(`
        SELECT 
          bt.*,
          s.id as subscription_id,
          p.name as product_name,
          c.name as customer_name,
          c.email as customer_email
        FROM billing_transactions bt
        LEFT JOIN custom_subscriptions s ON bt.subscription_id = s.id
        LEFT JOIN custom_products p ON s.product_id = p.id
        LEFT JOIN subscription_customers c ON s.customer_id = c.id
        ORDER BY bt.created_at DESC
        LIMIT 100
      `).all();

      return result.map(transaction => ({
        ...transaction,
        metadata: transaction.metadata ? JSON.parse(transaction.metadata) : {}
      }));
    } catch (error) {
      console.error('Erro ao buscar transações de cobrança:', error);
      return [];
    }
  }

  async processBillingTransaction(transactionData: any): Promise<any> {
    try {
      const id = nanoid();
      const transaction = {
        id,
        ...transactionData,
        metadata: JSON.stringify(transactionData.metadata || {}),
        created_at: new Date().toISOString()
      };

      const stmt = sqlite.prepare(`
        INSERT INTO billing_transactions (
          id, subscription_id, amount, currency, status, description, 
          gateway_transaction_id, metadata, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        transaction.id, transaction.subscription_id, transaction.amount,
        transaction.currency, transaction.status, transaction.description,
        transaction.gateway_transaction_id, transaction.metadata, transaction.created_at
      );

      return transaction;
    } catch (error) {
      console.error('Erro ao processar transação de cobrança:', error);
      throw error;
    }
  }

  async getPaymentGateways(): Promise<any[]> {
    try {
      const gateways = [
        {
          id: 'stripe',
          name: 'Stripe',
          description: 'Gateway internacional com suporte a múltiplas moedas',
          enabled: !!process.env.STRIPE_SECRET_KEY,
          countries: ['US', 'CA', 'UK', 'EU'],
          currencies: ['USD', 'EUR', 'GBP', 'CAD'],
          methods: ['card', 'bank_transfer', 'wallet']
        },
        {
          id: 'pagarme',
          name: 'Pagar.me',
          description: 'Gateway brasileiro com suporte a PIX, boleto e cartão',
          enabled: !!process.env.PAGARME_API_KEY,
          countries: ['BR'],
          currencies: ['BRL'],
          methods: ['credit_card', 'debit_card', 'pix', 'boleto']
        }
      ];

      return gateways;
    } catch (error) {
      console.error('Erro ao buscar gateways de pagamento:', error);
      return [];
    }
  }

  // =============================
  // CHECKOUT PRODUCT FUNCTIONS
  // =============================

  // Buscar todos os produtos de checkout
  async getCheckoutProducts() {
    try {
      const result = sqlite.prepare("SELECT * FROM checkout_products ORDER BY created_at DESC").all();
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar produtos de checkout:', error);
      return [];
    }
  }

  // Buscar produto específico por ID
  async getCheckoutProduct(id: string) {
    try {
      const result = sqlite.prepare("SELECT * FROM checkout_products WHERE id = ?").get(id);
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar produto específico:', error);
      return null;
    }
  }

  // Criar produto de checkout
  async createCheckout(productData: any) {
    try {
      const now = new Date().toISOString();
      const stmt = sqlite.prepare(`
        INSERT INTO checkout_products (
          id, user_id, name, description, price, currency, 
          category, features, payment_mode, recurring_interval, 
          trial_period, trial_price, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const params = [
        productData.id,
        productData.user_id || productData.userId,
        productData.name || '',
        productData.description || '',
        productData.price || 0,
        productData.currency || 'BRL',
        productData.category || '',
        Array.isArray(productData.features) ? productData.features.join(', ') : (productData.features || ''),
        productData.payment_mode || productData.paymentMode || 'one_time',
        productData.recurring_interval || productData.recurringInterval || null,
        productData.trial_period || productData.trialPeriod || null,
        productData.trial_price || productData.trialPrice || null,
        productData.status || 'active',
        now,
        now
      ];
      
      if (!productData.id) {
        throw new Error('ID do produto não pode ser null ou undefined');
      }
      
      stmt.run(...params);
      
      return sqlite.prepare("SELECT * FROM checkout_products WHERE id = ?").get(productData.id);
    } catch (error) {
      console.error('❌ Erro detalhado ao criar produto:', error);
      console.error('📋 Dados recebidos:', productData);
      throw error;
    }
  }

  // Atualizar produto de checkout
  async updateCheckout(id: string, updates: any) {
    try {
      const now = new Date().toISOString();
      
      // Mapear campos para corresponder ao schema da tabela
      const fieldMapping = {
        paymentMode: 'payment_mode',
        recurringInterval: 'recurring_interval',
        trialPeriod: 'trial_period',
        trialPrice: 'trial_price',
        userId: 'user_id',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      };
      
      const mappedUpdates = {};
      for (const [key, value] of Object.entries(updates)) {
        const dbKey = fieldMapping[key] || key;
        mappedUpdates[dbKey] = value;
      }
      
      const fields = Object.keys(mappedUpdates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(mappedUpdates);
    
      const stmt = sqlite.prepare(`
        UPDATE checkout_products 
        SET ${fields}, updated_at = ? 
        WHERE id = ?
      `);
      
      stmt.run(...values, now, id);
      return sqlite.prepare("SELECT * FROM checkout_products WHERE id = ?").get(id);
    } catch (error) {
      console.error('Erro ao atualizar produto de checkout:', error);
      console.error('Fields:', fields);
      console.error('Values:', values);
      throw error;
    }
  }

  // Deletar produto de checkout
  async deleteCheckout(id: string) {
    try {
      const stmt = sqlite.prepare("DELETE FROM checkout_products WHERE id = ?");
      stmt.run(id);
    } catch (error) {
      console.error('Erro ao deletar produto de checkout:', error);
      throw error;
    }
  }

  // STRIPE PLANS MANAGEMENT - Métodos para gerenciar planos do Stripe

  // Criar tabela de planos do Stripe se não existir
  private async ensureStripePlansTable(): Promise<void> {
    try {
      await sqlite.exec(`
        CREATE TABLE IF NOT EXISTS stripe_plans (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          currency TEXT DEFAULT 'BRL',
          interval TEXT DEFAULT 'month',
          trial_days INTEGER DEFAULT 7,
          trial_price REAL DEFAULT 1.00,
          gateway TEXT DEFAULT 'stripe',
          active INTEGER DEFAULT 1,
          stripe_price_id TEXT,
          stripe_product_id TEXT,
          pagarme_plan_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (error) {
      console.error('❌ ERRO ao criar tabela stripe_plans:', error);
    }
  }

  // Buscar todos os planos
  async getStripePlans(): Promise<any[]> {
    try {
      await this.ensureStripePlansTable();
      const stmt = sqlite.prepare('SELECT * FROM stripe_plans ORDER BY created_at DESC');
      return stmt.all();
    } catch (error) {
      console.error('❌ ERRO ao buscar planos do Stripe:', error);
      return [];
    }
  }

  // ================ STRIPE SUBSCRIPTIONS METHODS ================
  
  // Criar tabela de assinaturas do Stripe se não existir
  private async ensureStripeSubscriptionsTable(): Promise<void> {
    try {
      await sqlite.exec(`
        CREATE TABLE IF NOT EXISTS stripe_subscriptions (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          stripeSubscriptionId TEXT,
          stripeCustomerId TEXT,
          stripePaymentMethodId TEXT,
          status TEXT DEFAULT 'active',
          planName TEXT,
          planDescription TEXT,
          activationFee REAL DEFAULT 0,
          monthlyPrice REAL DEFAULT 0,
          trialDays INTEGER DEFAULT 0,
          trialStartDate TEXT,
          trialEndDate TEXT,
          currentPeriodStart TEXT,
          currentPeriodEnd TEXT,
          nextBillingDate TEXT,
          canceledAt TEXT,
          cancelAtPeriodEnd INTEGER DEFAULT 0,
          customerName TEXT,
          customerEmail TEXT,
          activationInvoiceId TEXT,
          metadata TEXT DEFAULT '{}',
          createdAt INTEGER,
          updatedAt INTEGER
        )
      `);
    } catch (error) {
      console.error('❌ ERRO ao criar tabela stripe_subscriptions:', error);
    }
  }

  // Criar assinatura Stripe
  async createStripeSubscription(subscription: any): Promise<any> {
    try {
      await this.ensureStripeSubscriptionsTable();
      const timestamp = Date.now();
      const stmt = sqlite.prepare(`
        INSERT INTO stripe_subscriptions (
          id, userId, stripeSubscriptionId, stripeCustomerId, stripePaymentMethodId,
          status, planName, planDescription, activationFee, monthlyPrice, trialDays,
          trialStartDate, trialEndDate, currentPeriodStart, currentPeriodEnd,
          nextBillingDate, canceledAt, cancelAtPeriodEnd, customerName, customerEmail,
          activationInvoiceId, metadata, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      // Converter todos os valores para tipos compatíveis com SQLite
      const safeValues = [
        subscription.id || null,
        subscription.userId || null,
        subscription.stripeSubscriptionId || null,
        subscription.stripeCustomerId || null,
        subscription.stripePaymentMethodId || null,
        subscription.status || null,
        subscription.planName || null,
        subscription.planDescription || null,
        typeof subscription.activationFee === 'number' ? subscription.activationFee : null,
        typeof subscription.monthlyPrice === 'number' ? subscription.monthlyPrice : null,
        typeof subscription.trialDays === 'number' ? subscription.trialDays : null,
        subscription.trialStartDate || null,
        subscription.trialEndDate || null,
        subscription.currentPeriodStart || null,
        subscription.currentPeriodEnd || null,
        subscription.nextBillingDate || null,
        subscription.canceledAt || null,
        subscription.cancelAtPeriodEnd ? 1 : 0,
        subscription.customerName || null,
        subscription.customerEmail || null,
        subscription.activationInvoiceId || null,
        JSON.stringify(subscription.metadata || {}),
        timestamp,
        timestamp
      ];

      stmt.run(...safeValues);
      
      return this.getStripeSubscriptionById(subscription.id);
    } catch (error) {
      console.error('❌ ERRO ao criar assinatura Stripe:', error);
      throw error;
    }
  }

  // Buscar assinatura por ID
  async getStripeSubscriptionById(id: string): Promise<any | undefined> {
    try {
      const stmt = sqlite.prepare('SELECT * FROM stripe_subscriptions WHERE id = ?');
      const result = stmt.get(id);
      if (result && result.metadata) {
        result.metadata = JSON.parse(result.metadata);
      }
      return result;
    } catch (error) {
      console.error('❌ ERRO ao buscar assinatura Stripe por ID:', error);
      return undefined;
    }
  }

  // Buscar assinatura por Stripe ID
  async getStripeSubscriptionByStripeId(stripeSubscriptionId: string): Promise<any | undefined> {
    try {
      const stmt = sqlite.prepare('SELECT * FROM stripe_subscriptions WHERE stripeSubscriptionId = ?');
      const result = stmt.get(stripeSubscriptionId);
      if (result && result.metadata) {
        result.metadata = JSON.parse(result.metadata);
      }
      return result;
    } catch (error) {
      console.error('❌ ERRO ao buscar assinatura Stripe por Stripe ID:', error);
      return undefined;
    }
  }

  // Atualizar assinatura Stripe
  async updateStripeSubscription(id: string, updates: any): Promise<any> {
    try {
      const fields = Object.keys(updates)
        .filter(key => key !== 'id')
        .map(key => `${key} = ?`)
        .join(', ');
      
      const values = Object.keys(updates)
        .filter(key => key !== 'id')
        .map(key => {
          if (key === 'metadata') {
            return JSON.stringify(updates[key]);
          }
          return updates[key];
        });
      
      values.push(Date.now()); // updatedAt
      
      const stmt = sqlite.prepare(`
        UPDATE stripe_subscriptions 
        SET ${fields}, updatedAt = ? 
        WHERE id = ?
      `);
      
      stmt.run(...values, id);
      return this.getStripeSubscriptionById(id);
    } catch (error) {
      console.error('❌ ERRO ao atualizar assinatura Stripe:', error);
      throw error;
    }
  }

  // Buscar assinaturas do usuário
  async getStripeSubscriptionsByUser(userId: string): Promise<any[]> {
    try {
      const stmt = sqlite.prepare('SELECT * FROM stripe_subscriptions WHERE userId = ? ORDER BY createdAt DESC');
      const results = stmt.all(userId);
      return results.map(result => {
        if (result.metadata) {
          result.metadata = JSON.parse(result.metadata);
        }
        return result;
      });
    } catch (error) {
      console.error('❌ ERRO ao buscar assinaturas do usuário:', error);
      return [];
    }
  }

  // Deletar assinatura Stripe
  async deleteStripeSubscription(id: string): Promise<void> {
    try {
      const stmt = sqlite.prepare('DELETE FROM stripe_subscriptions WHERE id = ?');
      stmt.run(id);
    } catch (error) {
      console.error('❌ ERRO ao deletar assinatura Stripe:', error);
      throw error;
    }
  }

  // Buscar plano específico
  async getStripePlan(id: string): Promise<any | undefined> {
    try {
      await this.ensureStripePlansTable();
      const stmt = sqlite.prepare('SELECT * FROM stripe_plans WHERE id = ?');
      return stmt.get(id);
    } catch (error) {
      console.error('❌ ERRO ao buscar plano do Stripe:', error);
      return undefined;
    }
  }

  // Criar novo plano
  async createStripePlan(plan: any): Promise<any> {
    try {
      await this.ensureStripePlansTable();
      const stmt = sqlite.prepare(`
        INSERT INTO stripe_plans (
          id, name, description, price, currency, interval, 
          trial_days, trial_price, gateway, active, 
          stripe_price_id, stripe_product_id, pagarme_plan_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        plan.id,
        plan.name,
        plan.description || null,
        plan.price,
        plan.currency || 'BRL',
        plan.interval || 'month',
        plan.trial_days || 7,
        plan.trial_price || 1.00,
        plan.gateway || 'stripe',
        plan.active ? 1 : 0,
        plan.stripe_price_id || null,
        plan.stripe_product_id || null,
        plan.pagarme_plan_id || null
      );
      
      return plan;
    } catch (error) {
      console.error('❌ ERRO ao criar plano do Stripe:', error);
      throw new Error('Erro ao criar plano');
    }
  }

  // Atualizar plano existente
  async updateStripePlan(id: string, updates: any): Promise<any> {
    try {
      await this.ensureStripePlansTable();
      const stmt = sqlite.prepare(`
        UPDATE stripe_plans 
        SET name = ?, description = ?, active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      
      stmt.run(
        updates.name,
        updates.description || null,
        updates.active ? 1 : 0,
        id
      );
      
      return { id, ...updates };
    } catch (error) {
      console.error('❌ ERRO ao atualizar plano do Stripe:', error);
      throw new Error('Erro ao atualizar plano');
    }
  }

  // Deletar plano
  async deleteStripePlan(id: string): Promise<void> {
    try {
      await this.ensureStripePlansTable();
      const stmt = sqlite.prepare('DELETE FROM stripe_plans WHERE id = ?');
      stmt.run(id);
    } catch (error) {
      console.error('❌ ERRO ao deletar plano do Stripe:', error);
      throw new Error('Erro ao deletar plano');
    }
  }

  // Analytics do checkout
  async getCheckoutAnalytics(): Promise<any> {
    try {
      // Criar mock de analytics até implementar sistema real
      return {
        totalCheckouts: 156,
        totalConversions: 89,
        conversionRate: 0.57,
        totalRevenue: 2689.50,
        averageOrderValue: 30.22,
        monthlyGrowth: {
          checkouts: 12,
          conversions: 8,
          revenue: 15
        },
        topPlans: [
          { name: 'Plano Premium', conversions: 45, revenue: 1345.50 },
          { name: 'Plano Básico', conversions: 34, revenue: 1014.60 },
          { name: 'Plano Enterprise', conversions: 10, revenue: 329.40 }
        ]
      };
    } catch (error) {
      console.error('❌ ERRO ao buscar analytics do checkout:', error);
      return {
        totalCheckouts: 0,
        totalConversions: 0,
        conversionRate: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        monthlyGrowth: { checkouts: 0, conversions: 0, revenue: 0 },
        topPlans: []
      };
    }
  }

  // Buscar produtos de checkout
  async getCheckoutProducts(): Promise<any[]> {
    try {
      await this.ensureStripePlansTable();
      const stmt = sqlite.prepare('SELECT * FROM stripe_plans WHERE active = 1 ORDER BY price ASC');
      return stmt.all();
    } catch (error) {
      console.error('❌ ERRO ao buscar produtos de checkout:', error);
      return [];
    }
  }

  // Métodos para webhook do Stripe
  async getSubscriptionByPaymentIntent(paymentIntentId: string): Promise<any> {
    try {
      const stmt = sqlite.prepare('SELECT * FROM stripe_subscriptions WHERE activationInvoiceId = ?');
      return stmt.get(paymentIntentId);
    } catch (error) {
      console.error('❌ ERRO ao buscar assinatura por payment intent:', error);
      return null;
    }
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<any> {
    try {
      const stmt = sqlite.prepare('SELECT * FROM stripe_subscriptions WHERE stripeSubscriptionId = ?');
      return stmt.get(stripeSubscriptionId);
    } catch (error) {
      console.error('❌ ERRO ao buscar assinatura por Stripe ID:', error);
      return null;
    }
  }

  async updateSubscriptionStatus(id: string, status: string): Promise<void> {
    try {
      const stmt = sqlite.prepare('UPDATE stripe_subscriptions SET status = ?, updatedAt = ? WHERE id = ?');
      stmt.run(status, Date.now(), id);
    } catch (error) {
      console.error('❌ ERRO ao atualizar status da assinatura:', error);
      throw error;
    }
  }

  async updateSubscriptionBilling(id: string, nextBillingDate: Date): Promise<void> {
    try {
      const stmt = sqlite.prepare('UPDATE stripe_subscriptions SET nextBillingDate = ?, updatedAt = ? WHERE id = ?');
      stmt.run(nextBillingDate.toISOString(), Date.now(), id);
    } catch (error) {
      console.error('❌ ERRO ao atualizar cobrança da assinatura:', error);
      throw error;
    }
  }

  async createSubscription(subscriptionData: any): Promise<void> {
    try {
      await this.ensureStripeSubscriptionsTable();
      const stmt = sqlite.prepare(`
        INSERT INTO stripe_subscriptions (
          id, userId, stripeSubscriptionId, stripeCustomerId, stripePaymentMethodId,
          status, planName, planDescription, activationFee, monthlyPrice, trialDays,
          trialStartDate, trialEndDate, currentPeriodStart, currentPeriodEnd,
          nextBillingDate, canceledAt, cancelAtPeriodEnd, customerName, customerEmail,
          activationInvoiceId, metadata, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        subscriptionData.id,
        subscriptionData.userId,
        subscriptionData.stripeSubscriptionId,
        subscriptionData.stripeCustomerId,
        subscriptionData.stripePaymentMethodId || null,
        subscriptionData.status,
        subscriptionData.planName,
        subscriptionData.planDescription,
        subscriptionData.activationFee,
        subscriptionData.monthlyPrice,
        subscriptionData.trialDays,
        subscriptionData.trialStartDate,
        subscriptionData.trialEndDate,
        subscriptionData.currentPeriodStart,
        subscriptionData.currentPeriodEnd,
        subscriptionData.nextBillingDate,
        subscriptionData.canceledAt,
        subscriptionData.cancelAtPeriodEnd || 0,
        subscriptionData.customerName,
        subscriptionData.customerEmail,
        subscriptionData.activationInvoiceId || null,
        subscriptionData.metadata,
        subscriptionData.createdAt,
        subscriptionData.updatedAt
      );
    } catch (error) {
      console.error('❌ ERRO ao criar assinatura:', error);
      throw error;
    }
  }

  async updateSubscription(id: string, updates: any): Promise<void> {
    try {
      const fields = [];
      const values = [];
      
      for (const [key, value] of Object.entries(updates)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
      
      if (fields.length > 0) {
        values.push(id);
        const stmt = sqlite.prepare(`UPDATE stripe_subscriptions SET ${fields.join(', ')} WHERE id = ?`);
        stmt.run(...values);
      }
    } catch (error) {
      console.error('❌ ERRO ao atualizar assinatura:', error);
      throw error;
    }
  }

  // Métodos para monitoramento de pagamentos
  async getTransactionsByDateRange(startDate: number, endDate: number): Promise<any[]> {
    try {
      await this.ensureStripeTransactionsTable();
      const stmt = sqlite.prepare(`
        SELECT * FROM stripe_transactions 
        WHERE createdAt >= ? AND createdAt <= ? 
        ORDER BY createdAt DESC
      `);
      return stmt.all(startDate, endDate);
    } catch (error) {
      console.error('❌ ERRO ao buscar transações por data:', error);
      return [];
    }
  }

  async getActiveSubscriptions(): Promise<any[]> {
    try {
      await this.ensureStripeSubscriptionsTable();
      const stmt = sqlite.prepare(`
        SELECT * FROM stripe_subscriptions 
        WHERE status IN ('active', 'trialing') 
        ORDER BY createdAt DESC
      `);
      return stmt.all();
    } catch (error) {
      console.error('❌ ERRO ao buscar assinaturas ativas:', error);
      return [];
    }
  }

  async getRecentTransactions(limit: number = 20): Promise<any[]> {
    try {
      await this.ensureStripeTransactionsTable();
      const stmt = sqlite.prepare(`
        SELECT * FROM stripe_transactions 
        ORDER BY createdAt DESC 
        LIMIT ?
      `);
      return stmt.all(limit);
    } catch (error) {
      console.error('❌ ERRO ao buscar transações recentes:', error);
      return [];
    }
  }

  // Criar nova transação Stripe
  async createStripeTransaction(transaction: any): Promise<any> {
    try {
      await this.ensureStripeTransactionsTable();
      const timestamp = Date.now();
      const stmt = sqlite.prepare(`
        INSERT INTO stripe_transactions (
          id, userId, stripePaymentIntentId, amount, currency, status,
          customerName, customerEmail, description, metadata, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const safeValues = [
        transaction.id || `txn_${timestamp}`,
        transaction.userId || null,
        transaction.stripePaymentIntentId || null,
        typeof transaction.amount === 'number' ? transaction.amount : null,
        transaction.currency || 'brl',
        transaction.status || 'pending',
        transaction.customerName || null,
        transaction.customerEmail || null,
        transaction.description || null,
        JSON.stringify(transaction.metadata || {}),
        timestamp,
        timestamp
      ];

      stmt.run(...safeValues);
      
      return {
        id: transaction.id || `txn_${timestamp}`,
        userId: transaction.userId,
        stripePaymentIntentId: transaction.stripePaymentIntentId,
        amount: transaction.amount,
        currency: transaction.currency || 'brl',
        status: transaction.status || 'pending',
        customerName: transaction.customerName,
        customerEmail: transaction.customerEmail,
        description: transaction.description,
        metadata: transaction.metadata || {},
        createdAt: timestamp,
        updatedAt: timestamp
      };
    } catch (error) {
      console.error('❌ ERRO ao criar transação Stripe:', error);
      throw error;
    }
  }

  // Criar log de webhook Stripe
  async createStripeWebhookLog(log: any): Promise<any> {
    try {
      await this.ensureStripeWebhookLogsTable();
      const timestamp = Date.now();
      const stmt = sqlite.prepare(`
        INSERT INTO stripe_webhook_logs (
          id, eventId, eventType, status, payload, error, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const safeValues = [
        log.id || `log_${timestamp}`,
        log.eventId || null,
        log.eventType || null,
        log.status || 'success',
        JSON.stringify(log.payload || {}),
        log.error || null,
        timestamp
      ];

      stmt.run(...safeValues);
      
      return {
        id: log.id || `log_${timestamp}`,
        eventId: log.eventId,
        eventType: log.eventType,
        status: log.status || 'success',
        payload: log.payload || {},
        error: log.error,
        createdAt: timestamp
      };
    } catch (error) {
      console.error('❌ ERRO ao criar log de webhook Stripe:', error);
      throw error;
    }
  }

  async getRecentWebhookLogs(limit: number = 20): Promise<any[]> {
    try {
      await this.ensureStripeWebhookLogsTable();
      const stmt = sqlite.prepare(`
        SELECT * FROM stripe_webhook_logs 
        ORDER BY createdAt DESC 
        LIMIT ?
      `);
      return stmt.all(limit);
    } catch (error) {
      console.error('❌ ERRO ao buscar logs de webhook:', error);
      return [];
    }
  }

  async getStripeAlerts(): Promise<any[]> {
    try {
      await this.ensureStripeAlertsTable();
      const stmt = sqlite.prepare(`
        SELECT * FROM stripe_alerts 
        WHERE resolved = 0 
        ORDER BY createdAt DESC
      `);
      return stmt.all();
    } catch (error) {
      console.error('❌ ERRO ao buscar alertas:', error);
      return [];
    }
  }

  // Criar tabelas auxiliares para monitoramento
  async ensureStripeTransactionsTable(): Promise<void> {
    try {
      const stmt = sqlite.prepare(`
        CREATE TABLE IF NOT EXISTS stripe_transactions (
          id TEXT PRIMARY KEY,
          userId TEXT,
          stripePaymentIntentId TEXT,
          amount REAL,
          currency TEXT DEFAULT 'brl',
          status TEXT,
          customerName TEXT,
          customerEmail TEXT,
          description TEXT,
          metadata TEXT,
          createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
          updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
        )
      `);
      stmt.run();
    } catch (error) {
      console.error('❌ ERRO ao criar tabela stripe_transactions:', error);
    }
  }

  async ensureStripeWebhookLogsTable(): Promise<void> {
    try {
      const stmt = sqlite.prepare(`
        CREATE TABLE IF NOT EXISTS stripe_webhook_logs (
          id TEXT PRIMARY KEY,
          eventId TEXT,
          eventType TEXT,
          status TEXT,
          payload TEXT,
          error TEXT,
          createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
        )
      `);
      stmt.run();
    } catch (error) {
      console.error('❌ ERRO ao criar tabela stripe_webhook_logs:', error);
    }
  }

  async ensureStripeWebhookLogsTable(): Promise<void> {
    try {
      const stmt = sqlite.prepare(`
        CREATE TABLE IF NOT EXISTS stripe_webhook_logs (
          id TEXT PRIMARY KEY,
          eventId TEXT,
          eventType TEXT,
          status TEXT,
          payload TEXT,
          error TEXT,
          createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
        )
      `);
      stmt.run();
    } catch (error) {
      console.error('❌ ERRO ao criar tabela stripe_webhook_logs:', error);
    }
  }

  async ensureStripeAlertsTable(): Promise<void> {
    try {
      const stmt = sqlite.prepare(`
        CREATE TABLE IF NOT EXISTS stripe_alerts (
          id TEXT PRIMARY KEY,
          type TEXT,
          severity TEXT,
          message TEXT,
          details TEXT,
          resolved INTEGER DEFAULT 0,
          createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
        )
      `);
      stmt.run();
    } catch (error) {
      console.error('❌ ERRO ao criar tabela stripe_alerts:', error);
    }
  }

  async logWebhookEvent(eventId: string, eventType: string, status: string, payload: any, error?: string): Promise<void> {
    try {
      await this.ensureStripeWebhookLogsTable();
      const stmt = sqlite.prepare(`
        INSERT INTO stripe_webhook_logs (id, eventId, eventType, status, payload, error)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        Date.now().toString(),
        eventId,
        eventType,
        status,
        JSON.stringify(payload),
        error || null
      );
    } catch (error) {
      console.error('❌ ERRO ao registrar log de webhook:', error);
    }
  }

  async createStripeAlert(type: string, severity: string, message: string, details?: any): Promise<void> {
    try {
      await this.ensureStripeAlertsTable();
      const stmt = sqlite.prepare(`
        INSERT INTO stripe_alerts (id, type, severity, message, details)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(
        Date.now().toString(),
        type,
        severity,
        message,
        details ? JSON.stringify(details) : null
      );
    } catch (error) {
      console.error('❌ ERRO ao criar alerta:', error);
    }
  }
}

export const storage = new SQLiteStorage();