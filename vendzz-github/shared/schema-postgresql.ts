import { pgTable, text, integer, real, timestamp, boolean, jsonb, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { nanoid } from "nanoid";

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  email: text("email").unique().notNull(),
  password: text("password"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  whatsapp: text("whatsapp"),
  profileImageUrl: text("profile_image_url"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: text("plan").default("trial"), // trial, basic, premium, enterprise
  role: text("role").default("user"),
  refreshToken: text("refresh_token"),
  subscriptionStatus: text("subscription_status").default("active"), // active, canceled, expired, pending
  // Campos para expiração de plano
  planExpiresAt: timestamp("plan_expires_at"),
  planRenewalRequired: boolean("plan_renewal_required").default(false),
  trialExpiresAt: timestamp("trial_expires_at"),
  isBlocked: boolean("is_blocked").default(false),
  blockReason: text("block_reason"),
  // Campos para 2FA
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorBackupCodes: jsonb("two_factor_backup_codes"),
  smsCredits: integer("sms_credits").default(0),
  emailCredits: integer("email_credits").default(0),
  whatsappCredits: integer("whatsapp_credits").default(0),
  aiCredits: integer("ai_credits").default(0),
  videoCredits: integer("video_credits").default(0),
  // Telegram Bot Integration
  telegramBotToken: text("telegram_bot_token"),
  telegramChatId: text("telegram_chat_id"),
  telegramCredits: integer("telegram_credits").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  title: text("title").notNull(),
  description: text("description"),
  structure: jsonb("structure").notNull(),
  userId: text("user_id").notNull().references(() => users.id),
  isPublished: boolean("is_published").default(false),
  isSuperAffiliate: boolean("is_super_affiliate").default(false),
  settings: jsonb("settings"),
  design: jsonb("design"),
  designConfig: jsonb("design_config"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  facebookPixel: text("facebook_pixel"),
  googlePixel: text("google_pixel"),
  ga4Pixel: text("ga4_pixel"),
  taboolaPixel: text("taboola_pixel"),
  pinterestPixel: text("pinterest_pixel"),
  linkedinPixel: text("linkedin_pixel"),
  outbrainPixel: text("outbrain_pixel"),
  mgidPixel: text("mgid_pixel"),
  customHeadScript: text("custom_head_script"),
  utmTrackingCode: text("utm_tracking_code"),
  pixelEmailMarketing: boolean("pixel_email_marketing").default(false),
  pixelSMS: boolean("pixel_sms").default(false),
  pixelDelay: boolean("pixel_delay").default(false),
  trackingPixels: jsonb("tracking_pixels"),
  enableWhatsappAutomation: boolean("enable_whatsapp_automation").default(false),
  // Sistema Anti-WebView (BlackHat) para redirecionamento inteligente
  antiWebViewEnabled: boolean("anti_web_view_enabled").default(false),
  detectInstagram: boolean("detect_instagram").default(true),
  detectFacebook: boolean("detect_facebook").default(true),
  detectTikTok: boolean("detect_tik_tok").default(false),
  detectOthers: boolean("detect_others").default(false),
  enableIOS17: boolean("enable_ios17").default(true),
  enableOlderIOS: boolean("enable_older_ios").default(true),
  enableAndroid: boolean("enable_android").default(true),
  safeMode: boolean("safe_mode").default(true),
  redirectDelay: integer("redirect_delay").default(0),
  debugMode: boolean("debug_mode").default(false),
  
  // Sistema BackRedirect - Redirecionamento universal
  backRedirectEnabled: boolean("back_redirect_enabled").default(false),
  backRedirectUrl: text("back_redirect_url"),
  backRedirectDelay: integer("back_redirect_delay").default(0),
  
  // Sistema Cloaker - Ocultação de conteúdo
  cloakerEnabled: boolean("cloaker_enabled").default(false),
  cloakerMode: text("cloaker_mode").default("simple"), // simple, advanced, smart
  cloakerFallbackUrl: text("cloaker_fallback_url"),
  cloakerWhitelistIps: text("cloaker_whitelist_ips"),
  cloakerBlacklistUserAgents: text("cloaker_blacklist_user_agents"),
  resultTitle: text("result_title"),
  resultDescription: text("result_description"),
  embedCode: text("embed_code"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Sessions table para Railway
export const sessions = pgTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Tipos para TypeScript
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

// Schemas de validação
export const insertUserSchema = createInsertSchema(users);
export const insertQuizSchema = createInsertSchema(quizzes);