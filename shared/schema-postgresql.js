"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertQuizSchema = exports.insertUserSchema = exports.sessions = exports.quizzes = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const nanoid_1 = require("nanoid");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => (0, nanoid_1.nanoid)()),
    email: (0, pg_core_1.text)("email").unique().notNull(),
    password: (0, pg_core_1.text)("password"),
    firstName: (0, pg_core_1.text)("first_name"),
    lastName: (0, pg_core_1.text)("last_name"),
    whatsapp: (0, pg_core_1.text)("whatsapp"),
    profileImageUrl: (0, pg_core_1.text)("profile_image_url"),
    stripeCustomerId: (0, pg_core_1.text)("stripe_customer_id"),
    stripeSubscriptionId: (0, pg_core_1.text)("stripe_subscription_id"),
    plan: (0, pg_core_1.text)("plan").default("trial"), // trial, basic, premium, enterprise
    role: (0, pg_core_1.text)("role").default("user"),
    refreshToken: (0, pg_core_1.text)("refresh_token"),
    subscriptionStatus: (0, pg_core_1.text)("subscription_status").default("active"), // active, canceled, expired, pending
    // Campos para expiração de plano
    planExpiresAt: (0, pg_core_1.timestamp)("plan_expires_at"),
    planRenewalRequired: (0, pg_core_1.boolean)("plan_renewal_required").default(false),
    trialExpiresAt: (0, pg_core_1.timestamp)("trial_expires_at"),
    isBlocked: (0, pg_core_1.boolean)("is_blocked").default(false),
    blockReason: (0, pg_core_1.text)("block_reason"),
    // Campos para 2FA
    twoFactorEnabled: (0, pg_core_1.boolean)("two_factor_enabled").default(false),
    twoFactorSecret: (0, pg_core_1.text)("two_factor_secret"),
    twoFactorBackupCodes: (0, pg_core_1.jsonb)("two_factor_backup_codes"),
    smsCredits: (0, pg_core_1.integer)("sms_credits").default(0),
    emailCredits: (0, pg_core_1.integer)("email_credits").default(0),
    whatsappCredits: (0, pg_core_1.integer)("whatsapp_credits").default(0),
    aiCredits: (0, pg_core_1.integer)("ai_credits").default(0),
    videoCredits: (0, pg_core_1.integer)("video_credits").default(0),
    // Telegram Bot Integration
    telegramBotToken: (0, pg_core_1.text)("telegram_bot_token"),
    telegramChatId: (0, pg_core_1.text)("telegram_chat_id"),
    telegramCredits: (0, pg_core_1.integer)("telegram_credits").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").notNull().defaultNow(),
});
exports.quizzes = (0, pg_core_1.pgTable)("quizzes", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => (0, nanoid_1.nanoid)()),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    structure: (0, pg_core_1.jsonb)("structure").notNull(),
    userId: (0, pg_core_1.text)("user_id").notNull().references(() => exports.users.id),
    isPublished: (0, pg_core_1.boolean)("is_published").default(false),
    isSuperAffiliate: (0, pg_core_1.boolean)("is_super_affiliate").default(false),
    settings: (0, pg_core_1.jsonb)("settings"),
    design: (0, pg_core_1.jsonb)("design"),
    designConfig: (0, pg_core_1.jsonb)("design_config"),
    logoUrl: (0, pg_core_1.text)("logo_url"),
    faviconUrl: (0, pg_core_1.text)("favicon_url"),
    facebookPixel: (0, pg_core_1.text)("facebook_pixel"),
    googlePixel: (0, pg_core_1.text)("google_pixel"),
    ga4Pixel: (0, pg_core_1.text)("ga4_pixel"),
    taboolaPixel: (0, pg_core_1.text)("taboola_pixel"),
    pinterestPixel: (0, pg_core_1.text)("pinterest_pixel"),
    linkedinPixel: (0, pg_core_1.text)("linkedin_pixel"),
    outbrainPixel: (0, pg_core_1.text)("outbrain_pixel"),
    mgidPixel: (0, pg_core_1.text)("mgid_pixel"),
    customHeadScript: (0, pg_core_1.text)("custom_head_script"),
    utmTrackingCode: (0, pg_core_1.text)("utm_tracking_code"),
    pixelEmailMarketing: (0, pg_core_1.boolean)("pixel_email_marketing").default(false),
    pixelSMS: (0, pg_core_1.boolean)("pixel_sms").default(false),
    pixelDelay: (0, pg_core_1.boolean)("pixel_delay").default(false),
    trackingPixels: (0, pg_core_1.jsonb)("tracking_pixels"),
    enableWhatsappAutomation: (0, pg_core_1.boolean)("enable_whatsapp_automation").default(false),
    // Sistema Anti-WebView (BlackHat) para redirecionamento inteligente
    antiWebViewEnabled: (0, pg_core_1.boolean)("anti_web_view_enabled").default(false),
    detectInstagram: (0, pg_core_1.boolean)("detect_instagram").default(true),
    detectFacebook: (0, pg_core_1.boolean)("detect_facebook").default(true),
    detectTikTok: (0, pg_core_1.boolean)("detect_tik_tok").default(false),
    detectOthers: (0, pg_core_1.boolean)("detect_others").default(false),
    enableIOS17: (0, pg_core_1.boolean)("enable_ios17").default(true),
    enableOlderIOS: (0, pg_core_1.boolean)("enable_older_ios").default(true),
    enableAndroid: (0, pg_core_1.boolean)("enable_android").default(true),
    safeMode: (0, pg_core_1.boolean)("safe_mode").default(true),
    redirectDelay: (0, pg_core_1.integer)("redirect_delay").default(0),
    debugMode: (0, pg_core_1.boolean)("debug_mode").default(false),
    // Sistema BackRedirect - Redirecionamento universal
    backRedirectEnabled: (0, pg_core_1.boolean)("back_redirect_enabled").default(false),
    backRedirectUrl: (0, pg_core_1.text)("back_redirect_url"),
    backRedirectDelay: (0, pg_core_1.integer)("back_redirect_delay").default(0),
    // Sistema Cloaker - Ocultação de conteúdo
    cloakerEnabled: (0, pg_core_1.boolean)("cloaker_enabled").default(false),
    cloakerMode: (0, pg_core_1.text)("cloaker_mode").default("simple"), // simple, advanced, smart
    cloakerFallbackUrl: (0, pg_core_1.text)("cloaker_fallback_url"),
    cloakerWhitelistIps: (0, pg_core_1.text)("cloaker_whitelist_ips"),
    cloakerBlacklistUserAgents: (0, pg_core_1.text)("cloaker_blacklist_user_agents"),
    resultTitle: (0, pg_core_1.text)("result_title"),
    resultDescription: (0, pg_core_1.text)("result_description"),
    embedCode: (0, pg_core_1.text)("embed_code"),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").notNull().defaultNow(),
});
// Sessions table para Railway
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    sid: (0, pg_core_1.text)("sid").primaryKey(),
    sess: (0, pg_core_1.jsonb)("sess").notNull(),
    expire: (0, pg_core_1.timestamp)("expire").notNull(),
});
// Schemas de validação
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users);
exports.insertQuizSchema = (0, drizzle_zod_1.createInsertSchema)(exports.quizzes);
