import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password"),
  firstName: text("firstName"),
  lastName: text("lastName"),
  whatsapp: text("whatsapp"),
  profileImageUrl: text("profileImageUrl"),
  stripeCustomerId: text("stripeCustomerId"),
  stripeSubscriptionId: text("stripeSubscriptionId"),
  plan: text("plan").default("trial"), // trial, basic, premium, enterprise
  role: text("role").default("user"),
  refreshToken: text("refreshToken"),
  subscriptionStatus: text("subscriptionStatus").default("active"), // active, canceled, expired, pending
  // Campos para expiração de plano
  planExpiresAt: integer("planExpiresAt", { mode: 'timestamp' }),
  planRenewalRequired: integer("planRenewalRequired", { mode: 'boolean' }).default(false),
  trialExpiresAt: integer("trialExpiresAt", { mode: 'timestamp' }),
  isBlocked: integer("isBlocked", { mode: 'boolean' }).default(false),
  blockReason: text("blockReason"),
  // Campos para 2FA
  twoFactorEnabled: integer("twoFactorEnabled", { mode: 'boolean' }).default(false),
  twoFactorSecret: text("twoFactorSecret"),
  twoFactorBackupCodes: text("twoFactorBackupCodes", { mode: 'json' }),
  smsCredits: integer("smsCredits").default(0),
  emailCredits: integer("emailCredits").default(0),
  whatsappCredits: integer("whatsappCredits").default(0),
  aiCredits: integer("aiCredits").default(0),
  videoCredits: integer("videoCredits").default(0),
  // Telegram Bot Integration
  telegramBotToken: text("telegramBotToken"),
  telegramChatId: text("telegramChatId"),
  telegramCredits: integer("telegramCredits").default(0),
  createdAt: integer("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const quizzes = sqliteTable("quizzes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  structure: text("structure", { mode: 'json' }).notNull(),
  user_id: text("user_id").notNull().references(() => users.id),
  isPublished: integer("isPublished", { mode: 'boolean' }).default(false),
  isSuperAffiliate: integer("isSuperAffiliate", { mode: 'boolean' }).default(false),
  settings: text("settings", { mode: 'json' }),
  design: text("design", { mode: 'json' }),
  designConfig: text("designConfig", { mode: 'json' }),
  logoUrl: text("logoUrl"),
  faviconUrl: text("faviconUrl"),
  facebookPixel: text("facebookPixel"),
  googlePixel: text("googlePixel"),
  ga4Pixel: text("ga4Pixel"),
  taboolaPixel: text("taboolaPixel"),
  pinterestPixel: text("pinterestPixel"),
  linkedinPixel: text("linkedinPixel"),
  outbrainPixel: text("outbrainPixel"),
  mgidPixel: text("mgidPixel"),
  customHeadScript: text("customHeadScript"),
  utmTrackingCode: text("utmTrackingCode"),
  pixelEmailMarketing: integer("pixelEmailMarketing", { mode: 'boolean' }).default(false),
  pixelSMS: integer("pixelSMS", { mode: 'boolean' }).default(false),
  pixelDelay: integer("pixelDelay", { mode: 'boolean' }).default(false),
  trackingPixels: text("trackingPixels", { mode: 'json' }),
  enableWhatsappAutomation: integer("enableWhatsappAutomation", { mode: 'boolean' }).default(false),
  // Sistema Anti-WebView (BlackHat) para redirecionamento inteligente
  antiWebViewEnabled: integer("antiWebViewEnabled", { mode: 'boolean' }).default(false),
  detectInstagram: integer("detectInstagram", { mode: 'boolean' }).default(true),
  detectFacebook: integer("detectFacebook", { mode: 'boolean' }).default(true),
  detectTikTok: integer("detectTikTok", { mode: 'boolean' }).default(false),
  detectOthers: integer("detectOthers", { mode: 'boolean' }).default(false),
  enableIOS17: integer("enableIOS17", { mode: 'boolean' }).default(true),
  enableOlderIOS: integer("enableOlderIOS", { mode: 'boolean' }).default(true),
  enableAndroid: integer("enableAndroid", { mode: 'boolean' }).default(true),
  safeMode: integer("safeMode", { mode: 'boolean' }).default(true),
  redirectDelay: integer("redirectDelay").default(0),
  debugMode: integer("debugMode", { mode: 'boolean' }).default(false),
  
  // Sistema BackRedirect - Redirecionamento universal
  backRedirectEnabled: integer("backRedirectEnabled", { mode: 'boolean' }).default(false),
  backRedirectUrl: text("backRedirectUrl"),
  backRedirectDelay: integer("backRedirectDelay").default(0),
  
  // Sistema Cloaker - Ocultação de conteúdo
  cloakerEnabled: integer("cloakerEnabled", { mode: 'boolean' }).default(false),
  cloakerMode: text("cloakerMode").default("simple"), // simple, advanced, smart
  cloakerFallbackUrl: text("cloakerFallbackUrl"),
  cloakerWhitelistIps: text("cloakerWhitelistIps"),
  cloakerBlacklistUserAgents: text("cloakerBlacklistUserAgents"),
  resultTitle: text("resultTitle"),
  resultDescription: text("resultDescription"),
  embedCode: text("embedCode"),
  createdAt: integer("createdAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  updatedAt: integer("updatedAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const quizTemplates = sqliteTable("quiz_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  structure: text("structure", { mode: 'json' }).notNull(),
  category: text("category"),
  createdAt: integer("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const quizResponses = sqliteTable("quiz_responses", {
  id: text("id").primaryKey(),
  quiz_id: text("quiz_id").notNull().references(() => quizzes.id),
  user_id: text("user_id").references(() => users.id), // Campo opcional para respostas de usuários logados
  responses: text("responses", { mode: 'json' }).notNull(),
  metadata: text("metadata", { mode: 'json' }),
  submittedAt: integer("submittedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  country: text("country"),
  phoneCountryCode: text("phoneCountryCode"),
  affiliateId: text("affiliateId"),
});

// Nova tabela para indexar todas as variáveis de resposta para remarketing ultra-personalizado
export const responseVariables = sqliteTable("response_variables", {
  id: text("id").primaryKey(),
  responseId: text("responseId").notNull().references(() => quizResponses.id, { onDelete: "cascade" }),
  quizId: text("quizId").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  variableName: text("variableName").notNull(), // Ex: "produto_interesse", "nome_completo", "idade"
  variableValue: text("variableValue").notNull(), // Ex: "Whey Protein", "João Silva", "28"
  elementType: text("elementType").notNull(), // Ex: "multiple_choice", "text", "number"
  pageId: text("pageId").notNull(), // Ex: "page_1", "page_2"
  elementId: text("elementId").notNull(), // Ex: "element_multiple_choice_1"
  pageOrder: integer("pageOrder").notNull(), // Ordem da página no funil
  question: text("question"), // Pergunta original para contexto
  createdAt: integer("createdAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const quizAnalytics = sqliteTable("quiz_analytics", {
  id: text("id").primaryKey(),
  quizId: text("quizId").notNull().references(() => quizzes.id),
  date: text("date").notNull(),
  views: integer("views").default(0),
  completions: integer("completions").default(0),
  conversionRate: real("conversionRate").default(0),
  metadata: text("metadata", { mode: 'json' }),
});

export const smsTransactions = sqliteTable("sms_transactions", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id),
  type: text("type").notNull(), // 'purchase' | 'usage' | 'bonus'
  amount: integer("amount").notNull(),
  description: text("description"),
  createdAt: integer("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});



export const smsCampaigns = sqliteTable("sms_campaigns", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  quizId: text("quizId").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  phones: text("phones", { mode: 'json' }).notNull(), // Array of phone numbers stored as JSON
  status: text("status").default("pending"), // pending, active, paused, completed
  sent: integer("sent").default(0),
  delivered: integer("delivered").default(0),
  opened: integer("opened").default(0),
  clicked: integer("clicked").default(0),
  replies: integer("replies").default(0),
  scheduledAt: integer("scheduledAt"), // Para campanhas agendadas
  targetAudience: text("targetAudience").default("all"), // all, completed, abandoned
  campaignMode: text("campaignMode").default("leads_ja_na_base"), // "modo_ao_vivo" ou "leads_ja_na_base"
  triggerDelay: integer("triggerDelay").default(10),
  triggerUnit: text("triggerUnit").default("minutes"),
  // 🚀 CAMPOS PARA CAMPANHAS ULTRA PERSONALIZADAS
  campaignType: text("campaignType").default("standard"), // "standard" ou "ultra_personalized"
  conditionalRules: text("conditionalRules", { mode: 'json' }), // JSON com regras SE > ENTÃO
  // 🔥 CAMPOS QUANTUM - EVOLUÇÃO DO SISTEMA ULTRA
  quantumType: text("quantumType").default("standard"), // "standard", "remarketing", "live"
  quantumConfig: text("quantumConfig", { mode: 'json' }), // Configurações avançadas Quantum
  quantumFilters: text("quantumFilters", { mode: 'json' }), // Filtros Ultra granulares
  triggerConditions: text("triggerConditions", { mode: 'json' }), // Condições de disparo automático
  createdAt: integer("createdAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  updatedAt: integer("updatedAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const smsLogs = sqliteTable("sms_logs", {
  id: text("id").primaryKey(),
  campaignId: text("campaignId").notNull().references(() => smsCampaigns.id, { onDelete: "cascade" }),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull(), // pending, sent, delivered, failed, scheduled
  twilioSid: text("twilioSid"),
  errorMessage: text("errorMessage"),
  sentAt: integer("sentAt"),
  deliveredAt: integer("deliveredAt"),
  scheduledAt: integer("scheduledAt"), // Agendamento individual para cada SMS
  country: text("country"), // País detectado do telefone
  countryCode: text("countryCode"), // Código do país (+55, +1, etc.)
  createdAt: integer("createdAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

// Voice Calling Campaign System
export const voiceCampaigns = sqliteTable("voice_campaigns", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  quizId: text("quizId").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  voiceMessage: text("voiceMessage").notNull(), // Mensagem para TTS (Text-to-Speech)
  voiceFile: text("voiceFile"), // URL do arquivo de áudio (opcional)
  voiceType: text("voiceType").default("tts"), // "tts" para texto-para-fala, "audio" para arquivo de áudio
  voiceSettings: text("voiceSettings", { mode: 'json' }).default("{}"), // Configurações de voz (velocidade, tom, etc.)
  phones: text("phones", { mode: 'json' }).notNull(), // Array of phone numbers stored as JSON
  status: text("status").default("pending"), // pending, active, paused, completed
  sent: integer("sent").default(0),
  answered: integer("answered").default(0),
  voicemail: integer("voicemail").default(0),
  busy: integer("busy").default(0),
  failed: integer("failed").default(0),
  duration: integer("duration").default(0), // Duração total em segundos
  scheduledAt: integer("scheduledAt"), // Para campanhas agendadas
  targetAudience: text("targetAudience").default("all"), // all, completed, abandoned
  campaignMode: text("campaignMode").default("leads_ja_na_base"), // "modo_ao_vivo" ou "leads_ja_na_base"
  triggerDelay: integer("triggerDelay").default(10),
  triggerUnit: text("triggerUnit").default("minutes"),
  maxRetries: integer("maxRetries").default(3), // Tentativas máximas para cada número
  retryDelay: integer("retryDelay").default(60), // Delay entre tentativas (minutos)
  callTimeout: integer("callTimeout").default(30), // Timeout da chamada (segundos)
  createdAt: integer("createdAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  updatedAt: integer("updatedAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const voiceLogs = sqliteTable("voice_logs", {
  id: text("id").primaryKey(),
  campaignId: text("campaignId").notNull().references(() => voiceCampaigns.id, { onDelete: "cascade" }),
  phone: text("phone").notNull(),
  voiceMessage: text("voiceMessage").notNull(),
  voiceFile: text("voiceFile"), // URL do arquivo de áudio usado
  status: text("status").notNull(), // pending, calling, answered, voicemail, busy, failed, scheduled, completed
  twilioSid: text("twilioSid"), // ID da chamada no Twilio
  callDuration: integer("callDuration").default(0), // Duração da chamada em segundos
  callPrice: text("callPrice"), // Preço da chamada
  errorMessage: text("errorMessage"),
  retryCount: integer("retryCount").default(0), // Número de tentativas
  scheduledAt: integer("scheduledAt"), // Agendamento individual para cada chamada
  calledAt: integer("calledAt"), // Timestamp da chamada
  answeredAt: integer("answeredAt"), // Timestamp quando atendeu
  completedAt: integer("completedAt"), // Timestamp quando terminou
  country: text("country"), // País detectado do telefone
  countryCode: text("countryCode"), // Código do país (+55, +1, etc.)
  recordingUrl: text("recordingUrl"), // URL da gravação da chamada (se habilitada)
  createdAt: integer("createdAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const emailCampaigns = sqliteTable("email_campaigns", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  quizId: text("quizId").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").default("draft"), // draft, active, paused, completed
  campaignType: text("campaignType").default("remarketing"), // "live" (tempo real) ou "remarketing" (leads antigos)
  triggerType: text("triggerType").default("immediate"), // immediate, delayed, scheduled
  triggerDelay: integer("triggerDelay").default(0),
  triggerUnit: text("triggerUnit").default("hours"), // minutes, hours, days
  targetAudience: text("targetAudience").default("completed"), // all, completed, abandoned
  dateFilter: integer("dateFilter"), // Unix timestamp para filtrar leads por data
  variables: text("variables", { mode: 'json' }).default("[]"),
  sent: integer("sent").default(0),
  delivered: integer("delivered").default(0),
  opened: integer("opened").default(0),
  clicked: integer("clicked").default(0),
  createdAt: integer("createdAt").default(0),
  updatedAt: integer("updatedAt").default(0),
});

export const emailTemplates = sqliteTable("email_templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  variables: text("variables", { mode: 'json' }).default("[]"),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt").default(0),
  updatedAt: integer("updatedAt").default(0),
});

export const emailLogs = sqliteTable("email_logs", {
  id: text("id").primaryKey(),
  campaignId: text("campaignId").notNull().references(() => emailCampaigns.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  personalizedSubject: text("personalizedSubject").notNull(),
  personalizedContent: text("personalizedContent").notNull(),
  leadData: text("leadData", { mode: 'json' }),
  status: text("status").notNull(), // sent, delivered, bounced, opened, clicked, complained, unsubscribed
  sendgridId: text("sendgridId"),
  errorMessage: text("errorMessage"),
  sentAt: integer("sentAt"),
  deliveredAt: integer("deliveredAt"),
  openedAt: integer("openedAt"),
  clickedAt: integer("clickedAt"),
  scheduledAt: integer("scheduledAt"),
  createdAt: integer("createdAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const emailAutomations = sqliteTable("email_automations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  quizId: text("quizId").notNull().references(() => quizzes.id, { onDelete: "cascade" }),
  trigger: text("trigger").notNull(), // quiz_completed, quiz_abandoned, time_based, score_based
  conditions: text("conditions", { mode: 'json' }),
  sequence: text("sequence", { mode: 'json' }).notNull(),
  isActive: integer("isActive", { mode: 'boolean' }).default(true),
  createdAt: integer("createdAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  updatedAt: integer("updatedAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const emailSequences = sqliteTable("email_sequences", {
  id: text("id").primaryKey(),
  automationId: text("automationId").notNull().references(() => emailAutomations.id, { onDelete: "cascade" }),
  leadEmail: text("leadEmail").notNull(),
  leadData: text("leadData", { mode: 'json' }),
  currentStep: integer("currentStep").default(0),
  status: text("status").default("active"), // active, paused, completed, stopped
  nextEmailAt: integer("nextEmailAt"),
  createdAt: integer("createdAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  updatedAt: integer("updatedAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});



// Schemas para validação
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Validação adicional da estrutura do quiz
  structure: z.object({
    pages: z.array(z.object({
      id: z.union([z.string(), z.number()]),
      title: z.string().optional(),
      elements: z.array(z.object({
        type: z.string().min(1, "Tipo do elemento é obrigatório"),
        content: z.string().optional(),
        fieldId: z.string().optional(),
        required: z.boolean().optional(),
        options: z.array(z.string()).optional(),
        placeholder: z.string().optional(),
        minValue: z.number().optional(),
        maxValue: z.number().optional()
      }).passthrough()) // Permitir propriedades adicionais
    })).min(0, "Quiz deve ter pelo menos 0 páginas"),
    globalStyles: z.object({
      backgroundColor: z.string().optional(),
      fontFamily: z.string().optional(),
      primaryColor: z.string().optional()
    }).optional()
  }).optional() // Estrutura é opcional durante criação
}).refine(
  (data) => {
    // Validação customizada para estrutura malformada
    if (data.structure) {
      if (typeof data.structure !== 'object' || data.structure === null) {
        return false;
      }
      
      if (Array.isArray(data.structure.pages)) {
        return data.structure.pages.every(page => 
          page && typeof page === 'object' && 
          Array.isArray(page.elements)
        );
      }
      
      return false;
    }
    return true;
  },
  {
    message: "Estrutura do quiz é inválida",
    path: ["structure"]
  }
);

export const insertQuizTemplateSchema = createInsertSchema(quizTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuizResponseSchema = createInsertSchema(quizResponses).omit({
  id: true,
  submittedAt: true,
});

export const insertQuizAnalyticsSchema = createInsertSchema(quizAnalytics).omit({
  id: true,
});

export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});



export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({
  id: true,
  createdAt: true,
});

export const insertEmailAutomationSchema = createInsertSchema(emailAutomations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailSequenceSchema = createInsertSchema(emailSequences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Voice Calling Schemas
export const insertVoiceCampaignSchema = createInsertSchema(voiceCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVoiceLogSchema = createInsertSchema(voiceLogs).omit({
  id: true,
  createdAt: true,
});

// Tipos TypeScript
export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuizTemplate = z.infer<typeof insertQuizTemplateSchema>;
export type QuizTemplate = typeof quizTemplates.$inferSelect;
export type InsertQuizResponse = z.infer<typeof insertQuizResponseSchema>;
export type QuizResponse = typeof quizResponses.$inferSelect;
export type InsertQuizAnalytics = z.infer<typeof insertQuizAnalyticsSchema>;
export type QuizAnalytics = typeof quizAnalytics.$inferSelect;
export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailAutomation = z.infer<typeof insertEmailAutomationSchema>;
export type EmailAutomation = typeof emailAutomations.$inferSelect;
export type InsertEmailSequence = z.infer<typeof insertEmailSequenceSchema>;
export type EmailSequence = typeof emailSequences.$inferSelect;

// Voice Calling Types
export type InsertVoiceCampaign = z.infer<typeof insertVoiceCampaignSchema>;
export type VoiceCampaign = typeof voiceCampaigns.$inferSelect;
export type InsertVoiceLog = z.infer<typeof insertVoiceLogSchema>;
export type VoiceLog = typeof voiceLogs.$inferSelect;

// WhatsApp Campaigns Schema
export const whatsappCampaigns = sqliteTable('whatsapp_campaigns', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  quizId: text('quiz_id').notNull(),
  messages: text('messages', { mode: 'json' }).notNull().$type<string[]>(), // Array de mensagens rotativas
  userId: text('user_id').notNull().references(() => users.id),
  phones: text('phones', { mode: 'json' }).notNull().$type<Array<{
    phone: string;
    name?: string;
    status?: 'completed' | 'abandoned';
    submittedAt?: string;
    country?: string;
    countryCode?: string;
  }>>(),
  status: text('status').notNull().default('active'),
  scheduledAt: integer('scheduled_at'),
  triggerDelay: integer('trigger_delay').default(10),
  triggerUnit: text('trigger_unit').default('minutes'),
  targetAudience: text('target_audience').notNull().default('all'),
  campaignMode: text('campaign_mode').default('leads_ja_na_base'), // "modo_ao_vivo" ou "leads_ja_na_base"
  dateFilter: text('date_filter'), // Filtro de data para frente
  extensionSettings: text('extension_settings', { mode: 'json' }).$type<{
    delay: number;
    maxRetries: number;
    enabled: boolean;
  }>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// WhatsApp Logs Schema
export const whatsappLogs = sqliteTable('whatsapp_logs', {
  id: text('id').primaryKey().notNull(),
  campaignId: text('campaign_id').notNull().references(() => whatsappCampaigns.id, { onDelete: 'cascade' }),
  phone: text('phone').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('pending'),
  scheduledAt: integer('scheduled_at'),
  sentAt: integer('sent_at'),
  extensionStatus: text('extension_status'),
  error: text('error'),
  country: text('country'), // País detectado do telefone
  countryCode: text('country_code'), // Código do país (+55, +1, etc.)
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// WhatsApp Templates Schema
export const whatsappTemplates = sqliteTable('whatsapp_templates', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  message: text('message').notNull(),
  category: text('category').notNull(),
  variables: text('variables', { mode: 'json' }).notNull().$type<string[]>(),
  userId: text('user_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// WhatsApp Automation Files Schema
export const whatsappAutomationFiles = sqliteTable('whatsapp_automation_files', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  quizId: text('quiz_id').notNull(),
  quizTitle: text('quiz_title').notNull(),
  targetAudience: text('target_audience').notNull(),
  dateFilter: text('date_filter'),
  phones: text('phones', { mode: 'json' }).notNull().$type<Array<{
    phone: string;
    isComplete: boolean;
    submittedAt: Date;
    responseId: string;
  }>>(),
  totalPhones: integer('total_phones').notNull(),
  createdAt: text('created_at').notNull(),
  lastUpdated: text('last_updated').notNull()
});

// WhatsApp Zod Schemas
export const insertWhatsappCampaignSchema = createInsertSchema(whatsappCampaigns);
export const insertWhatsappLogSchema = createInsertSchema(whatsappLogs);
export const insertWhatsappTemplateSchema = createInsertSchema(whatsappTemplates);
export const insertWhatsappAutomationFileSchema = createInsertSchema(whatsappAutomationFiles);

// WhatsApp Types
export type InsertWhatsappCampaign = z.infer<typeof insertWhatsappCampaignSchema>;
export type WhatsappCampaign = typeof whatsappCampaigns.$inferSelect;
export type InsertWhatsappLog = z.infer<typeof insertWhatsappLogSchema>;
export type WhatsappLog = typeof whatsappLogs.$inferSelect;
export type InsertWhatsappTemplate = z.infer<typeof insertWhatsappTemplateSchema>;
export type WhatsappTemplate = typeof whatsappTemplates.$inferSelect;
export type InsertWhatsappAutomationFile = z.infer<typeof insertWhatsappAutomationFileSchema>;
export type WhatsappAutomationFile = typeof whatsappAutomationFiles.$inferSelect;

// Telegram Campaigns Schema
export const telegramCampaigns = sqliteTable('telegram_campaigns', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  quizId: text('quiz_id').notNull(),
  messages: text('messages', { mode: 'json' }).notNull().$type<string[]>(), // Array de mensagens rotativas
  userId: text('user_id').notNull().references(() => users.id),
  phones: text('phones', { mode: 'json' }).notNull().$type<Array<{
    phone: string;
    name?: string;
    status?: 'completed' | 'abandoned';
    submittedAt?: string;
    country?: string;
    countryCode?: string;
  }>>(),
  status: text('status').notNull().default('active'),
  scheduledAt: integer('scheduled_at'),
  triggerDelay: integer('trigger_delay').default(10),
  triggerUnit: text('trigger_unit').default('minutes'),
  targetAudience: text('target_audience').notNull().default('all'),
  campaignMode: text('campaign_mode').default('leads_ja_na_base'), // "modo_ao_vivo" ou "leads_ja_na_base"
  dateFilter: text('date_filter'), // Filtro de data para frente
  extensionSettings: text('extension_settings', { mode: 'json' }).$type<{
    delay: number;
    maxRetries: number;
    enabled: boolean;
  }>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// Telegram Logs Schema
export const telegramLogs = sqliteTable('telegram_logs', {
  id: text('id').primaryKey().notNull(),
  campaignId: text('campaign_id').notNull().references(() => telegramCampaigns.id, { onDelete: 'cascade' }),
  phone: text('phone').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('pending'),
  scheduledAt: integer('scheduled_at'),
  sentAt: integer('sent_at'),
  extensionStatus: text('extension_status'),
  error: text('error'),
  country: text('country'), // País detectado do telefone
  countryCode: text('country_code'), // Código do país (+55, +1, etc.)
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Telegram Templates Schema
export const telegramTemplates = sqliteTable('telegram_templates', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  message: text('message').notNull(),
  category: text('category').notNull(),
  variables: text('variables', { mode: 'json' }).notNull().$type<string[]>(),
  userId: text('user_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Telegram Bot Configurations Schema
export const telegramBotConfigs = sqliteTable('telegram_bot_configs', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  botToken: text('bot_token').notNull(),
  botName: text('bot_name'),
  botUsername: text('bot_username'),
  webhookUrl: text('webhook_url'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Telegram Zod Schemas
export const insertTelegramCampaignSchema = createInsertSchema(telegramCampaigns);
export const insertTelegramLogSchema = createInsertSchema(telegramLogs);
export const insertTelegramTemplateSchema = createInsertSchema(telegramTemplates);
export const insertTelegramBotConfigSchema = createInsertSchema(telegramBotConfigs);

// Telegram Types
export type InsertTelegramCampaign = z.infer<typeof insertTelegramCampaignSchema>;
export type TelegramCampaign = typeof telegramCampaigns.$inferSelect;
export type InsertTelegramLog = z.infer<typeof insertTelegramLogSchema>;
export type TelegramLog = typeof telegramLogs.$inferSelect;
export type InsertTelegramTemplate = z.infer<typeof insertTelegramTemplateSchema>;
export type TelegramTemplate = typeof telegramTemplates.$inferSelect;
export type InsertTelegramBotConfig = z.infer<typeof insertTelegramBotConfigSchema>;
export type TelegramBotConfig = typeof telegramBotConfigs.$inferSelect;

// Push Notifications Schema
export const pushSubscriptions = sqliteTable('push_subscriptions', {
  id: text('id').primaryKey().notNull(),
  user_id: text('user_id').notNull().references(() => users.id),
  endpoint: text('endpoint').notNull(),
  keys_p256dh: text('keys_p256dh').notNull(),
  keys_auth: text('keys_auth').notNull(),
  user_agent: text('user_agent'),
  device_type: text('device_type'),
  is_active: integer('is_active', { mode: 'boolean' }).default(true),
  created_at: text('created_at').notNull().default(sql`datetime('now')`),
  updated_at: text('updated_at').notNull().default(sql`datetime('now')`)
});

export const pushNotificationLogs = sqliteTable('push_notification_logs', {
  id: text('id').primaryKey().notNull(),
  user_id: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  body: text('body').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'sent', 'failed', 'delivered'
  sent_at: text('sent_at'),
  delivered_at: text('delivered_at'),
  error_message: text('error_message'),
  notification_data: text('notification_data', { mode: 'json' }),
  created_at: text('created_at').notNull().default(sql`datetime('now')`)
});

// Push Notifications Zod Schemas
export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions);
export const insertPushNotificationLogSchema = createInsertSchema(pushNotificationLogs);

// Push Notifications Types
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushNotificationLog = z.infer<typeof insertPushNotificationLogSchema>;
export type PushNotificationLog = typeof pushNotificationLogs.$inferSelect;

// Response Variables Schema e Types
export const insertResponseVariableSchema = createInsertSchema(responseVariables);
export type InsertResponseVariable = z.infer<typeof insertResponseVariableSchema>;
export type ResponseVariable = typeof responseVariables.$inferSelect;

// AI Conversion Campaigns Schema
export const aiConversionCampaigns = sqliteTable('ai_conversion_campaigns', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  quizId: text('quiz_id').notNull().references(() => quizzes.id),
  quizTitle: text('quiz_title').notNull(),
  scriptTemplate: text('script_template').notNull(),
  heygenAvatar: text('heygen_avatar').notNull(),
  heygenVoice: text('heygen_voice').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  totalGenerated: integer('total_generated').default(0),
  totalViews: integer('total_views').default(0),
  totalConversions: integer('total_conversions').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// AI Video Generations Schema
export const aiVideoGenerations = sqliteTable('ai_video_generations', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  topic: text('topic').notNull(),
  script: text('script'),
  duration: integer('duration').default(60),
  style: text('style').default('viral'),
  voice: text('voice').default('masculina'),
  videoUrl: text('video_url'),
  thumbnailUrl: text('thumbnail_url'),
  status: text('status').notNull().default('pending'), // pending, generating, completed, failed
  views: integer('views').default(0),
  likes: integer('likes').default(0),
  shares: integer('shares').default(0),
  error: text('error'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
});

// AI Conversion Zod Schemas
export const insertAiConversionCampaignSchema = createInsertSchema(aiConversionCampaigns);
export const insertAiVideoGenerationSchema = createInsertSchema(aiVideoGenerations);

// AI Conversion Types
export type InsertAiConversionCampaign = z.infer<typeof insertAiConversionCampaignSchema>;
export type AiConversionCampaign = typeof aiConversionCampaigns.$inferSelect;
export type InsertAiVideoGeneration = z.infer<typeof insertAiVideoGenerationSchema>;
export type AiVideoGeneration = typeof aiVideoGenerations.$inferSelect;

// Notifications Schema
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull().default('info'), // info, success, warning, error
  userId: text('user_id').references(() => users.id), // null for global notifications
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Notifications Zod Schemas
export const insertNotificationSchema = createInsertSchema(notifications);

// Notifications Types
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Super Affiliates Schema
export const superAffiliates = sqliteTable('super_affiliates', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  quizId: text('quiz_id').notNull().references(() => quizzes.id),
  affiliateCode: text('affiliate_code').unique().notNull(),
  commissionRate: real('commission_rate').default(0.1), // 10% padrão
  totalViews: integer('total_views').default(0),
  totalLeads: integer('total_leads').default(0),
  totalSales: integer('total_sales').default(0),
  totalCommission: real('total_commission').default(0),
  status: text('status').notNull().default('active'), // active, inactive, suspended
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Affiliate Sales Schema
export const affiliateSales = sqliteTable('affiliate_sales', {
  id: text('id').primaryKey().notNull(),
  affiliateId: text('affiliate_id').notNull().references(() => superAffiliates.id),
  responseId: text('response_id').notNull().references(() => quizResponses.id),
  saleAmount: real('sale_amount').notNull(),
  commissionAmount: real('commission_amount').notNull(),
  status: text('status').notNull().default('pending'), // pending, approved, paid
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Super Affiliates Zod Schemas
export const insertSuperAffiliateSchema = createInsertSchema(superAffiliates);
export const insertAffiliateSaleSchema = createInsertSchema(affiliateSales);

// Super Affiliates Types
export type InsertSuperAffiliate = z.infer<typeof insertSuperAffiliateSchema>;
export type SuperAffiliate = typeof superAffiliates.$inferSelect;
export type InsertAffiliateSale = z.infer<typeof insertAffiliateSaleSchema>;
export type AffiliateSale = typeof affiliateSales.$inferSelect;

// A/B Testing Schema
export const abTests = sqliteTable('ab_tests', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  funnelIds: text('funnel_ids', { mode: 'json' }).notNull().$type<string[]>(),
  funnelNames: text('funnel_names', { mode: 'json' }).notNull().$type<string[]>(),
  trafficSplit: text('traffic_split', { mode: 'json' }).notNull().$type<number[]>(),
  status: text('status').notNull().default('active'), // active, paused, completed
  duration: integer('duration').default(14), // days
  views: integer('views').default(0),
  conversions: integer('conversions').default(0),
  conversionRate: real('conversion_rate').default(0),
  endDate: integer('end_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// A/B Test Views Schema
export const abTestViews = sqliteTable('ab_test_views', {
  id: text('id').primaryKey().notNull(),
  testId: text('test_id').notNull().references(() => abTests.id, { onDelete: 'cascade' }),
  quizId: text('quiz_id').notNull().references(() => quizzes.id),
  visitorId: text('visitor_id').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  completed: integer('completed', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Webhooks Schema
export const webhooks = sqliteTable('webhooks', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  url: text('url').notNull(),
  events: text('events', { mode: 'json' }).notNull().$type<string[]>(),
  secret: text('secret'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  lastTriggered: integer('last_triggered', { mode: 'timestamp' }),
  totalTriggers: integer('total_triggers').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Webhook Logs Schema
export const webhookLogs = sqliteTable('webhook_logs', {
  id: text('id').primaryKey().notNull(),
  webhookId: text('webhook_id').notNull().references(() => webhooks.id, { onDelete: 'cascade' }),
  event: text('event').notNull(),
  payload: text('payload', { mode: 'json' }).notNull(),
  response: text('response'),
  statusCode: integer('status_code'),
  success: integer('success', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// Integrations Schema
export const integrations = sqliteTable('integrations', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // shopify, woocommerce, zapier, etc.
  name: text('name').notNull(),
  config: text('config', { mode: 'json' }).notNull().$type<Record<string, any>>(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  lastSync: integer('last_sync', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// A/B Testing Zod Schemas
export const insertAbTestSchema = createInsertSchema(abTests);
export const insertAbTestViewSchema = createInsertSchema(abTestViews);

// Webhooks Zod Schemas
export const insertWebhookSchema = createInsertSchema(webhooks);
export const insertWebhookLogSchema = createInsertSchema(webhookLogs);

// Integrations Zod Schemas
export const insertIntegrationSchema = createInsertSchema(integrations);

// A/B Testing Types
export type InsertAbTest = z.infer<typeof insertAbTestSchema>;
export type AbTest = typeof abTests.$inferSelect;
export type InsertAbTestView = z.infer<typeof insertAbTestViewSchema>;
export type AbTestView = typeof abTestViews.$inferSelect;

// Webhooks Types
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhookLog = z.infer<typeof insertWebhookLogSchema>;
export type WebhookLog = typeof webhookLogs.$inferSelect;

// Integrations Types
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrations.$inferSelect;



// ===============================================
// TYPEBOT AUTO-HOSPEDADO - SISTEMA COMPLETO
// ===============================================

// TypeBot Projects Schema
export const typebotProjects = sqliteTable('typebot_projects', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  sourceQuizId: text('source_quiz_id').references(() => quizzes.id), // Quiz origem da conversão
  typebotData: text('typebot_data', { mode: 'json' }).notNull().$type<TypebotData>(),
  isPublished: integer('is_published', { mode: 'boolean' }).default(false),
  publicId: text('public_id').unique(), // ID público para acessar o chatbot
  theme: text('theme', { mode: 'json' }).$type<TypebotTheme>(),
  settings: text('settings', { mode: 'json' }).$type<TypebotSettings>(),
  totalViews: integer('total_views').default(0),
  totalConversations: integer('total_conversations').default(0),
  totalCompletions: integer('total_completions').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// TypeBot Conversations Schema
export const typebotConversations = sqliteTable('typebot_conversations', {
  id: text('id').primaryKey().notNull(),
  projectId: text('project_id').notNull().references(() => typebotProjects.id, { onDelete: 'cascade' }),
  visitorId: text('visitor_id').notNull(),
  sessionId: text('session_id').notNull(),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  variables: text('variables', { mode: 'json' }).$type<Record<string, any>>(),
  results: text('results', { mode: 'json' }).$type<TypebotResult[]>(),
  currentBlockId: text('current_block_id'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// TypeBot Messages Schema
export const typebotMessages = sqliteTable('typebot_messages', {
  id: text('id').primaryKey().notNull(),
  conversationId: text('conversation_id').notNull().references(() => typebotConversations.id, { onDelete: 'cascade' }),
  blockId: text('block_id').notNull(),
  type: text('type').notNull(), // text, image, video, input, etc.
  content: text('content', { mode: 'json' }).notNull().$type<TypebotMessageContent>(),
  isFromBot: integer('is_from_bot', { mode: 'boolean' }).default(true),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// TypeBot Analytics Schema
export const typebotAnalytics = sqliteTable('typebot_analytics', {
  id: text('id').primaryKey().notNull(),
  projectId: text('project_id').notNull().references(() => typebotProjects.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // YYYY-MM-DD
  views: integer('views').default(0),
  conversations: integer('conversations').default(0),
  completions: integer('completions').default(0),
  completionRate: real('completion_rate').default(0),
  avgSessionTime: real('avg_session_time').default(0),
  dropOffBlocks: text('drop_off_blocks', { mode: 'json' }).$type<Record<string, number>>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// TypeBot Webhooks Schema
export const typebotWebhooks = sqliteTable('typebot_webhooks', {
  id: text('id').primaryKey().notNull(),
  projectId: text('project_id').notNull().references(() => typebotProjects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  url: text('url').notNull(),
  events: text('events', { mode: 'json' }).notNull().$type<string[]>(),
  headers: text('headers', { mode: 'json' }).$type<Record<string, string>>(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  lastTriggered: integer('last_triggered', { mode: 'timestamp' }),
  totalTriggers: integer('total_triggers').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// TypeBot Integrations Schema
export const typebotIntegrations = sqliteTable('typebot_integrations', {
  id: text('id').primaryKey().notNull(),
  projectId: text('project_id').notNull().references(() => typebotProjects.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // email, google-sheets, openai, etc.
  name: text('name').notNull(),
  config: text('config', { mode: 'json' }).notNull().$type<Record<string, any>>(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  lastUsed: integer('last_used', { mode: 'timestamp' }),
  totalUses: integer('total_uses').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

// TypeBot Types
export interface TypebotData {
  version: string;
  name: string;
  groups: TypebotGroup[];
  variables: TypebotVariable[];
  edges: TypebotEdge[];
  settings?: TypebotSettings;
  theme?: TypebotTheme;
}

export interface TypebotGroup {
  id: string;
  title: string;
  graphCoordinates: { x: number; y: number };
  blocks: TypebotBlock[];
}

export interface TypebotBlock {
  id: string;
  type: string;
  content?: any;
  settings?: any;
  options?: any;
}

export interface TypebotVariable {
  id: string;
  name: string;
  value?: any;
  type?: string;
}

export interface TypebotEdge {
  id: string;
  from: {
    groupId: string;
    blockId: string;
  };
  to: {
    groupId: string;
    blockId?: string;
  };
}

export interface TypebotTheme {
  general: {
    font: string;
    background: {
      type: string;
      content: string;
    };
  };
  chat: {
    container: {
      backgroundColor: string;
      color: string;
    };
    hostBubbles: {
      backgroundColor: string;
      color: string;
    };
    guestBubbles: {
      backgroundColor: string;
      color: string;
    };
    inputs: {
      backgroundColor: string;
      color: string;
      placeholderColor: string;
    };
    buttons: {
      backgroundColor: string;
      color: string;
    };
  };
}

export interface TypebotSettings {
  general: {
    isBrandingEnabled: boolean;
    isInputPrefillEnabled: boolean;
    isHideQueryParamsEnabled: boolean;
    isNewResultOnRefreshEnabled: boolean;
  };
  typingEmulation: {
    enabled: boolean;
    speed: number;
    maxDelay: number;
  };
  security: {
    allowedOrigins: string[];
  };
}

export interface TypebotResult {
  id: string;
  blockId: string;
  value: any;
  timestamp: Date;
}



export interface TypebotMessageContent {
  text?: string;
  richText?: any;
  image?: {
    url: string;
    alt?: string;
  };
  video?: {
    url: string;
    type: string;
  };
  audio?: {
    url: string;
    type: string;
  };
  input?: {
    type: string;
    placeholder?: string;
    value?: any;
  };
  buttons?: Array<{
    id: string;
    text: string;
    url?: string;
  }>;
}

// TypeBot Zod Schemas
export const insertTypebotProjectSchema = createInsertSchema(typebotProjects);
export const insertTypebotConversationSchema = createInsertSchema(typebotConversations);
export const insertTypebotMessageSchema = createInsertSchema(typebotMessages);
export const insertTypebotAnalyticsSchema = createInsertSchema(typebotAnalytics);
export const insertTypebotWebhookSchema = createInsertSchema(typebotWebhooks);
export const insertTypebotIntegrationSchema = createInsertSchema(typebotIntegrations);

// TypeBot Types
export type InsertTypebotProject = z.infer<typeof insertTypebotProjectSchema>;
export type TypebotProject = typeof typebotProjects.$inferSelect;
export type InsertTypebotConversation = z.infer<typeof insertTypebotConversationSchema>;
export type TypebotConversation = typeof typebotConversations.$inferSelect;
export type InsertTypebotMessage = z.infer<typeof insertTypebotMessageSchema>;
export type TypebotMessage = typeof typebotMessages.$inferSelect;
export type InsertTypebotAnalytics = z.infer<typeof insertTypebotAnalyticsSchema>;
export type TypebotAnalytics = typeof typebotAnalytics.$inferSelect;
export type InsertTypebotWebhook = z.infer<typeof insertTypebotWebhookSchema>;
export type TypebotWebhook = typeof typebotWebhooks.$inferSelect;
export type InsertTypebotIntegration = z.infer<typeof insertTypebotIntegrationSchema>;
export type TypebotIntegration = typeof typebotIntegrations.$inferSelect;

// =============================================
// CHECKOUT BUILDER SYSTEM TABLES
// =============================================

// Produtos do Checkout Builder
export const checkoutProducts = sqliteTable("checkout_products", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  currency: text("currency").notNull().default("BRL"),
  category: text("category"),
  features: text("features").default(""),
  payment_mode: text("payment_mode").default("one_time"),
  recurring_interval: text("recurring_interval"),
  trial_period: integer("trial_period"),
  trial_price: real("trial_price"),
  status: text("status").default("active"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

// Páginas de Checkout customizadas
export const checkoutPages = sqliteTable("checkout_pages", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull().references(() => users.id),
  product_id: text("product_id").notNull().references(() => checkoutProducts.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  template: text("template").default("default"),
  custom_css: text("custom_css"),
  custom_js: text("custom_js"),
  seo_title: text("seo_title"),
  seo_description: text("seo_description"),
  status: text("status").default("active"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

// Transações de Checkout
export const checkoutTransactions = sqliteTable("checkout_transactions", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull().references(() => users.id),
  product_id: text("product_id").notNull().references(() => checkoutProducts.id),
  checkout_id: text("checkout_id"),
  customer_data: text("customer_data").notNull(),
  total_amount: real("total_amount").notNull(),
  currency: text("currency").notNull().default("BRL"),
  payment_status: text("payment_status").default("pending"),
  payment_method: text("payment_method"),
  gateway: text("gateway").default("stripe"),
  gateway_transaction_id: text("gateway_transaction_id"),
  accepted_upsells: text("accepted_upsells").default("[]"),
  created_at: text("created_at").notNull(),
  paid_at: text("paid_at"),
});

// Assinaturas Stripe com Trial + Recorrência
export const stripeSubscriptions = sqliteTable("stripe_subscriptions", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id),
  stripeSubscriptionId: text("stripeSubscriptionId").notNull().unique(),
  stripeCustomerId: text("stripeCustomerId").notNull(),
  stripePaymentMethodId: text("stripePaymentMethodId"),
  status: text("status").notNull(), // trialing, active, past_due, canceled, unpaid
  planName: text("planName").notNull(),
  planDescription: text("planDescription"),
  activationFee: real("activationFee").notNull(),
  monthlyPrice: real("monthlyPrice").notNull(),
  trialDays: integer("trialDays").notNull(),
  trialStartDate: integer("trialStartDate", { mode: 'timestamp' }),
  trialEndDate: integer("trialEndDate", { mode: 'timestamp' }),
  currentPeriodStart: integer("currentPeriodStart", { mode: 'timestamp' }),
  currentPeriodEnd: integer("currentPeriodEnd", { mode: 'timestamp' }),
  nextBillingDate: integer("nextBillingDate", { mode: 'timestamp' }),
  canceledAt: integer("canceledAt", { mode: 'timestamp' }),
  cancelAtPeriodEnd: integer("cancelAtPeriodEnd", { mode: 'boolean' }).default(false),
  customerName: text("customerName"),
  customerEmail: text("customerEmail"),
  activationInvoiceId: text("activationInvoiceId"),
  metadata: text("metadata", { mode: 'json' }),
  createdAt: integer("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Analytics de Checkout
export const checkoutAnalytics = sqliteTable("checkout_analytics", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull().references(() => users.id),
  product_id: text("product_id").notNull().references(() => checkoutProducts.id),
  page_id: text("page_id").references(() => checkoutPages.id),
  event_type: text("event_type").notNull(),
  event_data: text("event_data"),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  referrer: text("referrer"),
  created_at: text("created_at").notNull(),
});

// Checkout Builder Zod Schemas
export const insertCheckoutProductSchema = createInsertSchema(checkoutProducts);
export const insertCheckoutPageSchema = createInsertSchema(checkoutPages);
export const insertCheckoutTransactionSchema = createInsertSchema(checkoutTransactions);
export const insertCheckoutAnalyticsSchema = createInsertSchema(checkoutAnalytics);

// Checkout Builder Types
export type InsertCheckoutProduct = z.infer<typeof insertCheckoutProductSchema>;
export type CheckoutProduct = typeof checkoutProducts.$inferSelect;
export type InsertCheckoutPage = z.infer<typeof insertCheckoutPageSchema>;
export type CheckoutPage = typeof checkoutPages.$inferSelect;
export type InsertCheckoutTransaction = z.infer<typeof insertCheckoutTransactionSchema>;
export type CheckoutTransaction = typeof checkoutTransactions.$inferSelect;
export type InsertCheckoutAnalytics = z.infer<typeof insertCheckoutAnalyticsSchema>;
export type CheckoutAnalytics = typeof checkoutAnalytics.$inferSelect;

// Subscription Plans Schema
export const subscriptionPlans = sqliteTable("subscription_plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  currency: text("currency").default("BRL"),
  billingInterval: text("billingInterval").notNull(), // monthly, yearly
  features: text("features", { mode: 'json' }).notNull(),
  limits: text("limits", { mode: 'json' }).notNull(),
  stripePriceId: text("stripePriceId"),
  isActive: integer("isActive", { mode: 'boolean' }).default(true),
  createdAt: integer("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Subscription Transactions Schema
export const subscriptionTransactions = sqliteTable("subscription_transactions", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id),
  planId: text("planId").notNull().references(() => subscriptionPlans.id),
  stripePaymentIntentId: text("stripePaymentIntentId"),
  stripeSubscriptionId: text("stripeSubscriptionId"),
  amount: real("amount").notNull(),
  currency: text("currency").default("BRL"),
  status: text("status").notNull(), // pending, completed, failed, refunded
  paymentMethod: text("paymentMethod").default("stripe"),
  metadata: text("metadata", { mode: 'json' }),
  createdAt: integer("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Credit Transactions Schema
export const creditTransactions = sqliteTable("credit_transactions", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id),
  type: text("type").notNull(), // sms, email, whatsapp, ai
  amount: integer("amount").notNull(),
  operation: text("operation").notNull(), // add, subtract
  reason: text("reason").notNull(),
  metadata: text("metadata", { mode: 'json' }),
  createdAt: integer("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Subscription Plans Zod Schemas
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans);
export const insertSubscriptionTransactionSchema = createInsertSchema(subscriptionTransactions);
export const insertCreditTransactionSchema = createInsertSchema(creditTransactions);

// Subscription Plans Types
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionTransaction = z.infer<typeof insertSubscriptionTransactionSchema>;
export type SubscriptionTransaction = typeof subscriptionTransactions.$inferSelect;
export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;
export type CreditTransaction = typeof creditTransactions.$inferSelect;

// =============================================
// ÁREA DE MEMBROS - MEMBERS AREA SYSTEM
// =============================================

// Cursos
export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  shortDescription: text("shortDescription"),
  thumbnailUrl: text("thumbnailUrl"),
  introVideoUrl: text("introVideoUrl"),
  category: text("category"),
  level: text("level").default("beginner"), // beginner, intermediate, advanced
  duration: integer("duration"), // em minutos
  price: real("price").default(0),
  currency: text("currency").default("BRL"),
  isPublished: integer("isPublished", { mode: 'boolean' }).default(false),
  isFeatured: integer("isFeatured", { mode: 'boolean' }).default(false),
  tags: text("tags", { mode: 'json' }),
  requirements: text("requirements", { mode: 'json' }),
  objectives: text("objectives", { mode: 'json' }),
  instructorId: text("instructorId").notNull().references(() => users.id),
  totalStudents: integer("totalStudents").default(0),
  averageRating: real("averageRating").default(0),
  totalReviews: integer("totalReviews").default(0),
  settings: text("settings", { mode: 'json' }),
  createdAt: integer("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Módulos dos Cursos
export const courseModules = sqliteTable("course_modules", {
  id: text("id").primaryKey(),
  courseId: text("courseId").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description"),
  orderIndex: integer("orderIndex").notNull(),
  isPublished: integer("isPublished", { mode: 'boolean' }).default(false),
  createdAt: integer("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Aulas dos Módulos
export const courseLessons = sqliteTable("course_lessons", {
  id: text("id").primaryKey(),
  moduleId: text("moduleId").notNull().references(() => courseModules.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"), // HTML content for text lessons
  videoUrl: text("videoUrl"),
  videoDuration: integer("videoDuration"), // em segundos
  audioUrl: text("audioUrl"),
  audioDuration: integer("audioDuration"), // em segundos
  attachments: text("attachments", { mode: 'json' }), // Array de URLs de PDFs, arquivos, etc
  lessonType: text("lessonType").notNull().default("text"), // text, video, audio, quiz, assignment
  orderIndex: integer("orderIndex").notNull(),
  isPublished: integer("isPublished", { mode: 'boolean' }).default(false),
  isFree: integer("isFree", { mode: 'boolean' }).default(false), // aula gratuita
  estimatedDuration: integer("estimatedDuration"), // em minutos
  resources: text("resources", { mode: 'json' }), // links, materiais extras
  notes: text("notes"), // anotações do instrutor
  createdAt: integer("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Matrículas dos Estudantes
export const courseEnrollments = sqliteTable("course_enrollments", {
  id: text("id").primaryKey(),
  courseId: text("courseId").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  studentId: text("studentId").notNull().references(() => users.id, { onDelete: 'cascade' }),
  enrolledAt: integer("enrolledAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  completedAt: integer("completedAt", { mode: 'timestamp' }),
  lastAccessedAt: integer("lastAccessedAt", { mode: 'timestamp' }),
  progress: real("progress").default(0), // 0-100
  status: text("status").default("active"), // active, completed, suspended, cancelled
  certificateIssued: integer("certificateIssued", { mode: 'boolean' }).default(false),
  certificateUrl: text("certificateUrl"),
  accessLevel: text("accessLevel").default("full"), // full, preview, limited
  expiresAt: integer("expiresAt", { mode: 'timestamp' }), // para cursos com tempo limitado
});

// Progresso das Aulas
export const lessonProgress = sqliteTable("lesson_progress", {
  id: text("id").primaryKey(),
  enrollmentId: text("enrollmentId").notNull().references(() => courseEnrollments.id, { onDelete: 'cascade' }),
  lessonId: text("lessonId").notNull().references(() => courseLessons.id, { onDelete: 'cascade' }),
  studentId: text("studentId").notNull().references(() => users.id, { onDelete: 'cascade' }),
  isCompleted: integer("isCompleted", { mode: 'boolean' }).default(false),
  completedAt: integer("completedAt", { mode: 'timestamp' }),
  timeSpent: integer("timeSpent").default(0), // em segundos
  lastPosition: integer("lastPosition").default(0), // posição no vídeo/áudio em segundos
  notes: text("notes"), // anotações do estudante
  rating: integer("rating"), // 1-5
  createdAt: integer("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Avaliações e Reviews dos Cursos
export const courseReviews = sqliteTable("course_reviews", {
  id: text("id").primaryKey(),
  courseId: text("courseId").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  studentId: text("studentId").notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: integer("rating").notNull(), // 1-5
  title: text("title"),
  comment: text("comment"),
  isPublished: integer("isPublished", { mode: 'boolean' }).default(true),
  isVerified: integer("isVerified", { mode: 'boolean' }).default(false),
  helpfulVotes: integer("helpfulVotes").default(0),
  createdAt: integer("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Categorias de Cursos
export const courseCategories = sqliteTable("course_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  iconUrl: text("iconUrl"),
  color: text("color"),
  parentId: text("parentId").references(() => courseCategories.id),
  orderIndex: integer("orderIndex").default(0),
  isActive: integer("isActive", { mode: 'boolean' }).default(true),
  createdAt: integer("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Certificados
export const courseCertificates = sqliteTable("course_certificates", {
  id: text("id").primaryKey(),
  courseId: text("courseId").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  studentId: text("studentId").notNull().references(() => users.id, { onDelete: 'cascade' }),
  enrollmentId: text("enrollmentId").notNull().references(() => courseEnrollments.id, { onDelete: 'cascade' }),
  certificateCode: text("certificateCode").notNull().unique(),
  issuedAt: integer("issuedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  certificateUrl: text("certificateUrl"),
  verificationUrl: text("verificationUrl"),
  templateId: text("templateId"),
  metadata: text("metadata", { mode: 'json' }),
});

// Templates de Certificados
export const certificateTemplates = sqliteTable("certificate_templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  htmlTemplate: text("htmlTemplate").notNull(),
  cssStyles: text("cssStyles"),
  defaultSettings: text("defaultSettings", { mode: 'json' }),
  previewUrl: text("previewUrl"),
  isActive: integer("isActive", { mode: 'boolean' }).default(true),
  createdAt: integer("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Discussões/Fóruns dos Cursos
export const courseDiscussions = sqliteTable("course_discussions", {
  id: text("id").primaryKey(),
  courseId: text("courseId").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  lessonId: text("lessonId").references(() => courseLessons.id, { onDelete: 'cascade' }),
  authorId: text("authorId").notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentId: text("parentId").references(() => courseDiscussions.id), // para replies
  title: text("title"),
  content: text("content").notNull(),
  type: text("type").default("discussion"), // discussion, question, announcement
  isResolved: integer("isResolved", { mode: 'boolean' }).default(false),
  isPinned: integer("isPinned", { mode: 'boolean' }).default(false),
  votesUp: integer("votesUp").default(0),
  votesDown: integer("votesDown").default(0),
  createdAt: integer("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Analytics da Área de Membros
export const membersAreaAnalytics = sqliteTable("members_area_analytics", {
  id: text("id").primaryKey(),
  courseId: text("courseId").references(() => courses.id, { onDelete: 'cascade' }),
  lessonId: text("lessonId").references(() => courseLessons.id, { onDelete: 'cascade' }),
  studentId: text("studentId").references(() => users.id, { onDelete: 'cascade' }),
  event: text("event").notNull(), // lesson_start, lesson_complete, course_complete, etc
  data: text("data", { mode: 'json' }),
  timestamp: integer("timestamp", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
});

// Área de Membros Zod Schemas
export const insertCourseSchema = createInsertSchema(courses);
export const insertCourseModuleSchema = createInsertSchema(courseModules);
export const insertCourseLessonSchema = createInsertSchema(courseLessons);
export const insertCourseEnrollmentSchema = createInsertSchema(courseEnrollments);
export const insertLessonProgressSchema = createInsertSchema(lessonProgress);
export const insertCourseReviewSchema = createInsertSchema(courseReviews);
export const insertCourseCategorySchema = createInsertSchema(courseCategories);
export const insertCourseCertificateSchema = createInsertSchema(courseCertificates);
export const insertCertificateTemplateSchema = createInsertSchema(certificateTemplates);
export const insertCourseDiscussionSchema = createInsertSchema(courseDiscussions);
export const insertMembersAreaAnalyticsSchema = createInsertSchema(membersAreaAnalytics);

// Área de Membros Types
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourseModule = z.infer<typeof insertCourseModuleSchema>;
export type CourseModule = typeof courseModules.$inferSelect;
export type InsertCourseLesson = z.infer<typeof insertCourseLessonSchema>;
export type CourseLesson = typeof courseLessons.$inferSelect;
export type InsertCourseEnrollment = z.infer<typeof insertCourseEnrollmentSchema>;
export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type InsertLessonProgress = z.infer<typeof insertLessonProgressSchema>;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type InsertCourseReview = z.infer<typeof insertCourseReviewSchema>;
export type CourseReview = typeof courseReviews.$inferSelect;
export type InsertCourseCategory = z.infer<typeof insertCourseCategorySchema>;
export type CourseCategory = typeof courseCategories.$inferSelect;
export type InsertCourseCertificate = z.infer<typeof insertCourseCertificateSchema>;
export type CourseCertificate = typeof courseCertificates.$inferSelect;
export type InsertCertificateTemplate = z.infer<typeof insertCertificateTemplateSchema>;
export type CertificateTemplate = typeof certificateTemplates.$inferSelect;
export type InsertCourseDiscussion = z.infer<typeof insertCourseDiscussionSchema>;
export type CourseDiscussion = typeof courseDiscussions.$inferSelect;
export type InsertMembersAreaAnalytics = z.infer<typeof insertMembersAreaAnalyticsSchema>;
export type MembersAreaAnalytics = typeof membersAreaAnalytics.$inferSelect;

// =============================================
// FORUM SYSTEM TABLES
// =============================================

// Forum Categories
export const forumCategoriesTable = sqliteTable("forum_categories", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  color: text("color"),
  isRestricted: integer("is_restricted", { mode: "boolean" }).default(false),
  moderators: text("moderators", { mode: "json" }).$type<string[]>().default([]),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Forum Topics
export const forumTopicsTable = sqliteTable("forum_topics", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  title: text("title").notNull(),
  content: text("content").notNull(),
  categoryId: text("category_id").notNull().references(() => forumCategoriesTable.id),
  authorId: text("author_id").notNull().references(() => users.id),
  isPinned: integer("is_pinned", { mode: "boolean" }).default(false),
  isLocked: integer("is_locked", { mode: "boolean" }).default(false),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  dislikes: integer("dislikes").default(0),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  status: text("status").notNull().default("active"), // active, closed, resolved
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Forum Replies
export const forumRepliesTable = sqliteTable("forum_replies", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  topicId: text("topic_id").notNull().references(() => forumTopicsTable.id),
  authorId: text("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  parentReplyId: text("parent_reply_id").references(() => forumRepliesTable.id),
  likes: integer("likes").default(0),
  dislikes: integer("dislikes").default(0),
  isModerated: integer("is_moderated", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Forum Likes
export const forumLikesTable = sqliteTable("forum_likes", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("user_id").notNull().references(() => users.id),
  targetId: text("target_id").notNull(), // topic_id or reply_id
  targetType: text("target_type").notNull(), // 'topic' or 'reply'
  isLike: integer("is_like", { mode: "boolean" }).notNull(), // true for like, false for dislike
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Forum Zod Schemas
export const insertForumCategorySchema = createInsertSchema(forumCategoriesTable);
export const insertForumTopicSchema = createInsertSchema(forumTopicsTable);
export const insertForumReplySchema = createInsertSchema(forumRepliesTable);
export const insertForumLikeSchema = createInsertSchema(forumLikesTable);

// Forum Types
export type ForumCategory = typeof forumCategoriesTable.$inferSelect;
export type InsertForumCategory = typeof forumCategoriesTable.$inferInsert;
export type ForumTopic = typeof forumTopicsTable.$inferSelect;
export type InsertForumTopic = typeof forumTopicsTable.$inferInsert;
export type ForumReply = typeof forumRepliesTable.$inferSelect;
export type InsertForumReply = typeof forumRepliesTable.$inferInsert;
export type ForumLike = typeof forumLikesTable.$inferSelect;
export type InsertForumLike = typeof forumLikesTable.$inferInsert;