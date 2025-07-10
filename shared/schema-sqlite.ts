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
  smsCredits: integer("smsCredits").default(0),
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
  // Sistema BackRedirect para compatibilidade universal móvel
  backRedirectEnabled: integer("backRedirectEnabled", { mode: 'boolean' }).default(false),
  backRedirectUrl: text("backRedirectUrl"),
  backRedirectDelay: integer("backRedirectDelay").default(0), // delay em segundos
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
  quizTitle: text('quiz_title').notNull(),
  messages: text('messages', { mode: 'json' }).notNull().$type<string[]>(), // Array de mensagens rotativas
  userId: text('user_id').notNull().references(() => users.id),
  phones: text('phones', { mode: 'json' }).notNull().$type<Array<{
    phone: string;
    name?: string;
    status?: 'completed' | 'abandoned';
    submittedAt?: string;
  }>>(),
  status: text('status').notNull().default('active'),
  scheduledAt: integer('scheduled_at'),
  triggerDelay: integer('trigger_delay').default(10),
  triggerUnit: text('trigger_unit').default('minutes'),
  targetAudience: text('target_audience').notNull().default('all'),
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