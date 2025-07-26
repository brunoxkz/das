import { pgTable, text, integer, real, boolean, timestamp, json, serial, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
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
  planExpiresAt: timestamp("planExpiresAt"),
  planRenewalRequired: boolean("planRenewalRequired").default(false),
  trialExpiresAt: timestamp("trialExpiresAt"),
  isBlocked: boolean("isBlocked").default(false),
  blockReason: text("blockReason"),
  // Campos para 2FA
  twoFactorEnabled: boolean("twoFactorEnabled").default(false),
  twoFactorSecret: text("twoFactorSecret"),
  twoFactorBackupCodes: json("twoFactorBackupCodes"),
  smsCredits: integer("smsCredits").default(0),
  emailCredits: integer("emailCredits").default(0),
  whatsappCredits: integer("whatsappCredits").default(0),
  aiCredits: integer("aiCredits").default(0),
  videoCredits: integer("videoCredits").default(0),
  // Telegram Bot Integration
  telegramBotToken: text("telegramBotToken"),
  telegramChatId: text("telegramChatId"),
  telegramCredits: integer("telegramCredits").default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  title: text("title").notNull(),
  description: text("description"),
  structure: json("structure").notNull(),
  userId: text("userId").notNull().references(() => users.id),
  isPublished: boolean("isPublished").default(false),
  isSuperAffiliate: boolean("isSuperAffiliate").default(false),
  settings: json("settings"),
  design: json("design"),
  designConfig: json("designConfig"),
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
  pixelEmailMarketing: boolean("pixelEmailMarketing").default(false),
  pixelSMS: boolean("pixelSMS").default(false),
  pixelDelay: boolean("pixelDelay").default(false),
  trackingPixels: json("trackingPixels"),
  enableWhatsappAutomation: boolean("enableWhatsappAutomation").default(false),
  // Sistema Anti-WebView (BlackHat) para redirecionamento inteligente
  antiWebViewEnabled: boolean("antiWebViewEnabled").default(false),
  detectInstagram: boolean("detectInstagram").default(true),
  detectFacebook: boolean("detectFacebook").default(true),
  detectTikTok: boolean("detectTikTok").default(false),
  detectOthers: boolean("detectOthers").default(false),
  enableIOS17: boolean("enableIOS17").default(true),
  enableOlderIOS: boolean("enableOlderIOS").default(true),
  enableAndroid: boolean("enableAndroid").default(true),
  safeMode: boolean("safeMode").default(true),
  redirectDelay: integer("redirectDelay").default(0),
  debugMode: boolean("debugMode").default(false),
  
  // Sistema BackRedirect - Redirecionamento universal
  backRedirectEnabled: boolean("backRedirectEnabled").default(false),
  backRedirectUrl: text("backRedirectUrl"),
  backRedirectDelay: integer("backRedirectDelay").default(0),
  
  // Sistema Cloaker - Ocultação de conteúdo
  cloakerEnabled: boolean("cloakerEnabled").default(false),
  cloakerMode: text("cloakerMode").default("simple"), // simple, advanced, smart
  cloakerFallbackUrl: text("cloakerFallbackUrl"),
  cloakerWhitelistIps: text("cloakerWhitelistIps"),
  cloakerBlacklistUserAgents: text("cloakerBlacklistUserAgents"),
  resultTitle: text("resultTitle"),
  resultDescription: text("resultDescription"),
  embedCode: text("embedCode"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Quiz Templates
export const quizTemplates = pgTable("quizTemplates", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  structure: json("structure").notNull(),
  designConfig: json("designConfig"),
  isPublic: boolean("isPublic").default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// Quiz Responses
export const quizResponses = pgTable("quizResponses", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  quizId: text("quizId").notNull().references(() => quizzes.id),
  responses: json("responses").notNull(),
  metadata: json("metadata"),
  submittedAt: timestamp("submittedAt").notNull().defaultNow(),
});

// Response Variables (para sistema ultra-granular)
export const responseVariables = pgTable("responseVariables", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  responseId: text("responseId").notNull().references(() => quizResponses.id),
  variableName: text("variableName").notNull(),
  variableValue: text("variableValue").notNull(),
  extractedAt: timestamp("extractedAt").notNull().defaultNow(),
});

// Analytics
export const quizAnalytics = pgTable("quizAnalytics", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  quizId: text("quizId").notNull().references(() => quizzes.id),
  event: text("event").notNull(), // view, start, complete, abandon
  userId: text("userId"),
  sessionId: text("sessionId"),
  metadata: json("metadata"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Email Marketing
export const emailCampaigns = pgTable("emailCampaigns", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  userId: text("userId").notNull().references(() => users.id),
  quizId: text("quizId").references(() => quizzes.id),
  status: text("status").default("draft"), // draft, scheduled, sending, sent, paused
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  recipientCount: integer("recipientCount").default(0),
  openCount: integer("openCount").default(0),
  clickCount: integer("clickCount").default(0),
  conditionalRules: json("conditionalRules"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const emailTemplates = pgTable("emailTemplates", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  userId: text("userId").notNull().references(() => users.id),
  isPublic: boolean("isPublic").default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const emailLogs = pgTable("emailLogs", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  campaignId: text("campaignId").references(() => emailCampaigns.id),
  email: text("email").notNull(),
  status: text("status").notNull(), // sent, delivered, opened, clicked, bounced, failed
  errorMessage: text("errorMessage"),
  sentAt: timestamp("sentAt").notNull().defaultNow(),
});

// SMS Campaigns
export const smsCampaigns = pgTable("smsCampaigns", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  message: text("message").notNull(),
  userId: text("userId").notNull().references(() => users.id),
  quizId: text("quizId").references(() => quizzes.id),
  status: text("status").default("draft"), // draft, scheduled, sending, sent, paused
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  recipientCount: integer("recipientCount").default(0),
  deliveredCount: integer("deliveredCount").default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const smsLogs = pgTable("smsLogs", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  campaignId: text("campaignId").references(() => smsCampaigns.id),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull(), // sent, delivered, failed
  errorMessage: text("errorMessage"),
  sentAt: timestamp("sentAt").notNull().defaultNow(),
});

// WhatsApp Campaigns
export const whatsappCampaigns = pgTable("whatsappCampaigns", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  message: text("message").notNull(),
  userId: text("userId").notNull().references(() => users.id),
  quizId: text("quizId").references(() => quizzes.id),
  status: text("status").default("draft"), // draft, active, paused, completed
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  recipientCount: integer("recipientCount").default(0),
  deliveredCount: integer("deliveredCount").default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const whatsappLogs = pgTable("whatsappLogs", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  campaignId: text("campaignId").references(() => whatsappCampaigns.id),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull(), // sent, delivered, read, failed
  errorMessage: text("errorMessage"),
  sentAt: timestamp("sentAt").notNull().defaultNow(),
});

// Push Notifications
export const pushSubscriptions = pgTable("pushSubscriptions", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("userId").references(() => users.id),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("userAgent"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const pushNotificationLogs = pgTable("pushNotificationLogs", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  subscriptionId: text("subscriptionId").references(() => pushSubscriptions.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull(), // sent, failed
  errorMessage: text("errorMessage"),
  sentAt: timestamp("sentAt").notNull().defaultNow(),
});

// Credit Transactions
export const creditTransactions = pgTable("creditTransactions", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("userId").notNull().references(() => users.id),
  type: text("type").notNull(), // sms, email, whatsapp, ai, video, telegram
  amount: integer("amount").notNull(), // Positive for credits added, negative for credits used
  description: text("description").notNull(),
  balanceBefore: integer("balanceBefore").notNull(),
  balanceAfter: integer("balanceAfter").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// Subscription Plans
export const subscriptionPlans = pgTable("subscriptionPlans", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  currency: text("currency").default("BRL"),
  interval: text("interval").notNull(), // month, year
  features: json("features"),
  creditsIncluded: json("creditsIncluded"), // { sms: 1000, email: 5000, etc }
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const subscriptionTransactions = pgTable("subscriptionTransactions", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("userId").notNull().references(() => users.id),
  planId: text("planId").notNull().references(() => subscriptionPlans.id),
  stripeSubscriptionId: text("stripeSubscriptionId"),
  status: text("status").notNull(), // active, canceled, past_due, unpaid
  amount: real("amount").notNull(),
  currency: text("currency").default("BRL"),
  nextBillingDate: timestamp("nextBillingDate"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Quantum Tasks System
export const tasks = pgTable("tasks", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").default("medium"), // low, medium, high, urgent
  status: text("status").default("pending"), // pending, in_progress, completed, cancelled
  userId: text("userId").notNull().references(() => users.id),
  projectId: text("projectId"),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#3B82F6"),
  userId: text("userId").notNull().references(() => users.id),
  status: text("status").default("active"), // active, completed, archived
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const emails = pgTable("emails", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  from: text("from").notNull(),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  isRead: boolean("isRead").default(false),
  isStarred: boolean("isStarred").default(false),
  userId: text("userId").notNull().references(() => users.id),
  receivedAt: timestamp("receivedAt").notNull().defaultNow(),
});

export const recurringTasks = pgTable("recurringTasks", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  title: text("title").notNull(),
  description: text("description"),
  recurrencePattern: text("recurrencePattern").notNull(), // daily, weekly, monthly
  nextDueDate: timestamp("nextDueDate").notNull(),
  userId: text("userId").notNull().references(() => users.id),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type InsertQuiz = typeof quizzes.$inferInsert;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuizTemplate = typeof quizTemplates.$inferInsert;
export type QuizTemplate = typeof quizTemplates.$inferSelect;
export type InsertQuizResponse = typeof quizResponses.$inferInsert;
export type QuizResponse = typeof quizResponses.$inferSelect;
export type InsertResponseVariable = typeof responseVariables.$inferInsert;
export type ResponseVariable = typeof responseVariables.$inferSelect;
export type InsertQuizAnalytics = typeof quizAnalytics.$inferInsert;
export type QuizAnalytics = typeof quizAnalytics.$inferSelect;
export type InsertEmailCampaign = typeof emailCampaigns.$inferInsert;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;
export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertSmsCampaign = typeof smsCampaigns.$inferInsert;
export type SmsCampaign = typeof smsCampaigns.$inferSelect;
export type InsertSmsLog = typeof smsLogs.$inferInsert;
export type SmsLog = typeof smsLogs.$inferSelect;
export type InsertWhatsappCampaign = typeof whatsappCampaigns.$inferInsert;
export type WhatsappCampaign = typeof whatsappCampaigns.$inferSelect;
export type InsertWhatsappLog = typeof whatsappLogs.$inferInsert;
export type WhatsappLog = typeof whatsappLogs.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushNotificationLog = typeof pushNotificationLogs.$inferInsert;
export type PushNotificationLog = typeof pushNotificationLogs.$inferSelect;
export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionTransaction = typeof subscriptionTransactions.$inferInsert;
export type SubscriptionTransaction = typeof subscriptionTransactions.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertEmail = typeof emails.$inferInsert;
export type Email = typeof emails.$inferSelect;
export type InsertRecurringTask = typeof recurringTasks.$inferInsert;
export type RecurringTask = typeof recurringTasks.$inferSelect;