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
  facebookPixel: text("facebookPixel"),
  googlePixel: text("googlePixel"),
  ga4Pixel: text("ga4Pixel"),
  customHeadScript: text("customHeadScript"),
  resultTitle: text("resultTitle"),
  resultDescription: text("resultDescription"),
  embedCode: text("embedCode"),
  createdAt: integer("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
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
  triggerType: text("triggerType").default("immediate"), // immediate, delayed
  triggerDelay: integer("triggerDelay").default(0),
  triggerUnit: text("triggerUnit").default("hours"), // minutes, hours, days
  targetAudience: text("targetAudience").default("completed"), // all, completed, abandoned
  variables: text("variables", { mode: 'json' }).default("[]"),
  sent: integer("sent").default(0),
  delivered: integer("delivered").default(0),
  opened: integer("opened").default(0),
  clicked: integer("clicked").default(0),
  createdAt: integer("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const emailTemplates = sqliteTable("email_templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // welcome, follow_up, promotion, abandoned_cart
  variables: text("variables", { mode: 'json' }).default("[]"),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
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

// WhatsApp Campaigns Schema
export const whatsappCampaigns = sqliteTable('whatsapp_campaigns', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  quizId: text('quiz_id').notNull(),
  message: text('message').notNull(),
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

// WhatsApp Zod Schemas
export const insertWhatsappCampaignSchema = createInsertSchema(whatsappCampaigns);
export const insertWhatsappLogSchema = createInsertSchema(whatsappLogs);
export const insertWhatsappTemplateSchema = createInsertSchema(whatsappTemplates);

// WhatsApp Types
export type InsertWhatsappCampaign = z.infer<typeof insertWhatsappCampaignSchema>;
export type WhatsappCampaign = typeof whatsappCampaigns.$inferSelect;
export type InsertWhatsappLog = z.infer<typeof insertWhatsappLogSchema>;
export type WhatsappLog = typeof whatsappLogs.$inferSelect;
export type InsertWhatsappTemplate = z.infer<typeof insertWhatsappTemplateSchema>;
export type WhatsappTemplate = typeof whatsappTemplates.$inferSelect;