import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { desc } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password"),
  firstName: text("firstName"),
  lastName: text("lastName"),
  profileImageUrl: text("profileImageUrl"),
  stripeCustomerId: text("stripeCustomerId"),
  stripeSubscriptionId: text("stripeSubscriptionId"),
  plan: text("plan").default("free"),
  role: text("role").default("user"),
  refreshToken: text("refreshToken"),
  subscriptionStatus: text("subscriptionStatus"),
  // Campos para expiração de plano
  planExpiresAt: integer("planExpiresAt", { mode: 'timestamp' }),
  planRenewalRequired: integer("planRenewalRequired", { mode: 'boolean' }).default(false),
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
  createdAt: integer("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const quizzes = sqliteTable("quizzes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  structure: text("structure", { mode: 'json' }).notNull(),
  userId: text("userId").notNull().references(() => users.id),
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
  quizId: text("quizId").notNull().references(() => quizzes.id),
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
});

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
  campaignId: text('campaign_id').notNull().references(() => aiConversionCampaigns.id, { onDelete: 'cascade' }),
  responseId: text('response_id').notNull().references(() => quizResponses.id, { onDelete: 'cascade' }),
  personalizedScript: text('personalized_script').notNull(),
  heygenVideoId: text('heygen_video_id'),
  heygenVideoUrl: text('heygen_video_url'),
  status: text('status').notNull().default('pending'), // pending, generating, completed, failed
  views: integer('views').default(0),
  conversions: integer('conversions').default(0),
  error: text('error'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
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
  quizIds: text('quiz_ids', { mode: 'json' }).notNull().$type<string[]>(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  totalViews: integer('total_views').default(0),
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