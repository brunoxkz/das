"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTelegramTemplateSchema = exports.insertTelegramLogSchema = exports.insertTelegramCampaignSchema = exports.telegramBotConfigs = exports.telegramTemplates = exports.telegramLogs = exports.telegramCampaigns = exports.insertWhatsappAutomationFileSchema = exports.insertWhatsappTemplateSchema = exports.insertWhatsappLogSchema = exports.insertWhatsappCampaignSchema = exports.whatsappAutomationFiles = exports.whatsappTemplates = exports.whatsappLogs = exports.whatsappCampaigns = exports.insertVoiceLogSchema = exports.insertVoiceCampaignSchema = exports.insertEmailSequenceSchema = exports.insertEmailAutomationSchema = exports.insertEmailLogSchema = exports.insertEmailTemplateSchema = exports.insertEmailCampaignSchema = exports.insertQuizAnalyticsSchema = exports.insertQuizResponseSchema = exports.insertQuizTemplateSchema = exports.insertQuizSchema = exports.insertUserSchema = exports.emailSequences = exports.emailAutomations = exports.emailLogs = exports.emailTemplates = exports.emailCampaigns = exports.voiceLogs = exports.voiceCampaigns = exports.smsLogs = exports.smsCampaigns = exports.smsTransactions = exports.quizAnalytics = exports.responseVariables = exports.quizResponses = exports.quizTemplates = exports.courseNotificationTemplates = exports.scheduledCourseNotifications = exports.coursePushSubscriptions = exports.lessonProgress = exports.enrollments = exports.lessons = exports.courses = exports.quizzes = exports.users = void 0;
exports.creditTransactions = exports.subscriptionTransactions = exports.subscriptionPlans = exports.insertCheckoutAnalyticsSchema = exports.insertCheckoutTransactionSchema = exports.insertCheckoutPageSchema = exports.insertCheckoutProductSchema = exports.checkoutAnalytics = exports.stripeSubscriptions = exports.checkoutTransactions = exports.checkoutPages = exports.checkoutProducts = exports.insertTypebotIntegrationSchema = exports.insertTypebotWebhookSchema = exports.insertTypebotAnalyticsSchema = exports.insertTypebotMessageSchema = exports.insertTypebotConversationSchema = exports.insertTypebotProjectSchema = exports.typebotIntegrations = exports.typebotWebhooks = exports.typebotAnalytics = exports.typebotMessages = exports.typebotConversations = exports.typebotProjects = exports.insertIntegrationSchema = exports.insertWebhookLogSchema = exports.insertWebhookSchema = exports.insertAbTestViewSchema = exports.insertAbTestSchema = exports.integrations = exports.webhookLogs = exports.webhooks = exports.abTestViews = exports.abTests = exports.insertAffiliateSaleSchema = exports.insertSuperAffiliateSchema = exports.affiliateSales = exports.superAffiliates = exports.insertNotificationSchema = exports.notifications = exports.insertAiVideoGenerationSchema = exports.insertAiConversionCampaignSchema = exports.aiVideoGenerations = exports.aiConversionCampaigns = exports.insertResponseVariableSchema = exports.insertPushNotificationLogSchema = exports.insertPushSubscriptionSchema = exports.pushNotificationLogs = exports.pushSubscriptions = exports.insertTelegramBotConfigSchema = void 0;
exports.insertCourseNotificationTemplateSchema = exports.insertScheduledCourseNotificationSchema = exports.insertCoursePushSubscriptionSchema = exports.insertLessonProgressSchema = exports.insertEnrollmentSchema = exports.insertLessonSchema = exports.insertCourseSchema = exports.insertForumLikeSchema = exports.insertForumReplySchema = exports.insertForumTopicSchema = exports.insertForumCategorySchema = exports.forumLikesTable = exports.forumRepliesTable = exports.forumTopicsTable = exports.forumCategoriesTable = exports.insertCreditTransactionSchema = exports.insertSubscriptionTransactionSchema = exports.insertSubscriptionPlanSchema = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const nanoid_1 = require("nanoid");
exports.users = (0, sqlite_core_1.sqliteTable)("users", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    email: (0, sqlite_core_1.text)("email").unique().notNull(),
    password: (0, sqlite_core_1.text)("password"),
    firstName: (0, sqlite_core_1.text)("firstName"),
    lastName: (0, sqlite_core_1.text)("lastName"),
    whatsapp: (0, sqlite_core_1.text)("whatsapp"),
    profileImageUrl: (0, sqlite_core_1.text)("profileImageUrl"),
    stripeCustomerId: (0, sqlite_core_1.text)("stripeCustomerId"),
    stripeSubscriptionId: (0, sqlite_core_1.text)("stripeSubscriptionId"),
    plan: (0, sqlite_core_1.text)("plan").default("trial"), // trial, basic, premium, enterprise
    role: (0, sqlite_core_1.text)("role").default("user"),
    refreshToken: (0, sqlite_core_1.text)("refreshToken"),
    subscriptionStatus: (0, sqlite_core_1.text)("subscriptionStatus").default("active"), // active, canceled, expired, pending
    // Campos para expiração de plano
    planExpiresAt: (0, sqlite_core_1.integer)("planExpiresAt", { mode: 'timestamp' }),
    planRenewalRequired: (0, sqlite_core_1.integer)("planRenewalRequired", { mode: 'boolean' }).default(false),
    trialExpiresAt: (0, sqlite_core_1.integer)("trialExpiresAt", { mode: 'timestamp' }),
    isBlocked: (0, sqlite_core_1.integer)("isBlocked", { mode: 'boolean' }).default(false),
    blockReason: (0, sqlite_core_1.text)("blockReason"),
    // Campos para 2FA
    twoFactorEnabled: (0, sqlite_core_1.integer)("twoFactorEnabled", { mode: 'boolean' }).default(false),
    twoFactorSecret: (0, sqlite_core_1.text)("twoFactorSecret"),
    twoFactorBackupCodes: (0, sqlite_core_1.text)("twoFactorBackupCodes", { mode: 'json' }),
    smsCredits: (0, sqlite_core_1.integer)("smsCredits").default(0),
    emailCredits: (0, sqlite_core_1.integer)("emailCredits").default(0),
    whatsappCredits: (0, sqlite_core_1.integer)("whatsappCredits").default(0),
    aiCredits: (0, sqlite_core_1.integer)("aiCredits").default(0),
    videoCredits: (0, sqlite_core_1.integer)("videoCredits").default(0),
    // Telegram Bot Integration
    telegramBotToken: (0, sqlite_core_1.text)("telegramBotToken"),
    telegramChatId: (0, sqlite_core_1.text)("telegramChatId"),
    telegramCredits: (0, sqlite_core_1.integer)("telegramCredits").default(0),
    createdAt: (0, sqlite_core_1.integer)("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
exports.quizzes = (0, sqlite_core_1.sqliteTable)("quizzes", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    title: (0, sqlite_core_1.text)("title").notNull(),
    description: (0, sqlite_core_1.text)("description"),
    structure: (0, sqlite_core_1.text)("structure", { mode: 'json' }).notNull(),
    userId: (0, sqlite_core_1.text)("userId").notNull().references(() => exports.users.id),
    isPublished: (0, sqlite_core_1.integer)("isPublished", { mode: 'boolean' }).default(false),
    isSuperAffiliate: (0, sqlite_core_1.integer)("isSuperAffiliate", { mode: 'boolean' }).default(false),
    settings: (0, sqlite_core_1.text)("settings", { mode: 'json' }),
    design: (0, sqlite_core_1.text)("design", { mode: 'json' }),
    designConfig: (0, sqlite_core_1.text)("designConfig", { mode: 'json' }),
    logoUrl: (0, sqlite_core_1.text)("logoUrl"),
    faviconUrl: (0, sqlite_core_1.text)("faviconUrl"),
    facebookPixel: (0, sqlite_core_1.text)("facebookPixel"),
    googlePixel: (0, sqlite_core_1.text)("googlePixel"),
    ga4Pixel: (0, sqlite_core_1.text)("ga4Pixel"),
    taboolaPixel: (0, sqlite_core_1.text)("taboolaPixel"),
    pinterestPixel: (0, sqlite_core_1.text)("pinterestPixel"),
    linkedinPixel: (0, sqlite_core_1.text)("linkedinPixel"),
    outbrainPixel: (0, sqlite_core_1.text)("outbrainPixel"),
    mgidPixel: (0, sqlite_core_1.text)("mgidPixel"),
    customHeadScript: (0, sqlite_core_1.text)("customHeadScript"),
    utmTrackingCode: (0, sqlite_core_1.text)("utmTrackingCode"),
    pixelEmailMarketing: (0, sqlite_core_1.integer)("pixelEmailMarketing", { mode: 'boolean' }).default(false),
    pixelSMS: (0, sqlite_core_1.integer)("pixelSMS", { mode: 'boolean' }).default(false),
    pixelDelay: (0, sqlite_core_1.integer)("pixelDelay", { mode: 'boolean' }).default(false),
    trackingPixels: (0, sqlite_core_1.text)("trackingPixels", { mode: 'json' }),
    enableWhatsappAutomation: (0, sqlite_core_1.integer)("enableWhatsappAutomation", { mode: 'boolean' }).default(false),
    // Sistema Anti-WebView (BlackHat) para redirecionamento inteligente
    antiWebViewEnabled: (0, sqlite_core_1.integer)("antiWebViewEnabled", { mode: 'boolean' }).default(false),
    detectInstagram: (0, sqlite_core_1.integer)("detectInstagram", { mode: 'boolean' }).default(true),
    detectFacebook: (0, sqlite_core_1.integer)("detectFacebook", { mode: 'boolean' }).default(true),
    detectTikTok: (0, sqlite_core_1.integer)("detectTikTok", { mode: 'boolean' }).default(false),
    detectOthers: (0, sqlite_core_1.integer)("detectOthers", { mode: 'boolean' }).default(false),
    enableIOS17: (0, sqlite_core_1.integer)("enableIOS17", { mode: 'boolean' }).default(true),
    enableOlderIOS: (0, sqlite_core_1.integer)("enableOlderIOS", { mode: 'boolean' }).default(true),
    enableAndroid: (0, sqlite_core_1.integer)("enableAndroid", { mode: 'boolean' }).default(true),
    safeMode: (0, sqlite_core_1.integer)("safeMode", { mode: 'boolean' }).default(true),
    redirectDelay: (0, sqlite_core_1.integer)("redirectDelay").default(0),
    debugMode: (0, sqlite_core_1.integer)("debugMode", { mode: 'boolean' }).default(false),
    // Sistema BackRedirect - Redirecionamento universal
    backRedirectEnabled: (0, sqlite_core_1.integer)("backRedirectEnabled", { mode: 'boolean' }).default(false),
    backRedirectUrl: (0, sqlite_core_1.text)("backRedirectUrl"),
    backRedirectDelay: (0, sqlite_core_1.integer)("backRedirectDelay").default(0),
    // Sistema Cloaker - Ocultação de conteúdo
    cloakerEnabled: (0, sqlite_core_1.integer)("cloakerEnabled", { mode: 'boolean' }).default(false),
    cloakerMode: (0, sqlite_core_1.text)("cloakerMode").default("simple"), // simple, advanced, smart
    cloakerFallbackUrl: (0, sqlite_core_1.text)("cloakerFallbackUrl"),
    cloakerWhitelistIps: (0, sqlite_core_1.text)("cloakerWhitelistIps"),
    cloakerBlacklistUserAgents: (0, sqlite_core_1.text)("cloakerBlacklistUserAgents"),
    resultTitle: (0, sqlite_core_1.text)("resultTitle"),
    resultDescription: (0, sqlite_core_1.text)("resultDescription"),
    embedCode: (0, sqlite_core_1.text)("embedCode"),
    createdAt: (0, sqlite_core_1.integer)("createdAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
    updatedAt: (0, sqlite_core_1.integer)("updatedAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});
// ÁREA DE MEMBROS - SISTEMA DE CURSOS
exports.courses = (0, sqlite_core_1.sqliteTable)("courses", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => (0, nanoid_1.nanoid)()),
    title: (0, sqlite_core_1.text)("title").notNull(),
    description: (0, sqlite_core_1.text)("description"),
    thumbnail: (0, sqlite_core_1.text)("thumbnail"),
    creatorId: (0, sqlite_core_1.text)("creatorId").notNull().references(() => exports.users.id),
    category: (0, sqlite_core_1.text)("category"),
    price: (0, sqlite_core_1.real)("price").default(0),
    currency: (0, sqlite_core_1.text)("currency").default("BRL"),
    isPublished: (0, sqlite_core_1.integer)("isPublished", { mode: 'boolean' }).default(false),
    isPWA: (0, sqlite_core_1.integer)("isPWA", { mode: 'boolean' }).default(false), // Se foi transformado em App
    pwaConfig: (0, sqlite_core_1.text)("pwaConfig", { mode: 'json' }), // Configurações PWA (logo, cores, manifest)
    pushConfig: (0, sqlite_core_1.text)("pushConfig", { mode: 'json' }), // Configurações de push notifications
    branding: (0, sqlite_core_1.text)("branding", { mode: 'json' }), // Logo, cores, estilo
    settings: (0, sqlite_core_1.text)("settings", { mode: 'json' }), // Configurações gerais
    domain: (0, sqlite_core_1.text)("domain"), // Domínio personalizado quando é PWA
    totalLessons: (0, sqlite_core_1.integer)("totalLessons").default(0),
    totalDuration: (0, sqlite_core_1.integer)("totalDuration").default(0), // Em minutos
    enrollmentCount: (0, sqlite_core_1.integer)("enrollmentCount").default(0),
    rating: (0, sqlite_core_1.real)("rating").default(0),
    status: (0, sqlite_core_1.text)("status").default("draft"), // draft, published, archived
    createdAt: (0, sqlite_core_1.integer)("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
exports.lessons = (0, sqlite_core_1.sqliteTable)("lessons", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => (0, nanoid_1.nanoid)()),
    courseId: (0, sqlite_core_1.text)("courseId").notNull().references(() => exports.courses.id),
    title: (0, sqlite_core_1.text)("title").notNull(),
    description: (0, sqlite_core_1.text)("description"),
    videoUrl: (0, sqlite_core_1.text)("videoUrl"),
    videoId: (0, sqlite_core_1.text)("videoId"), // ID do vídeo se hospedado externamente
    videoProvider: (0, sqlite_core_1.text)("videoProvider").default("upload"), // upload, youtube, vimeo
    duration: (0, sqlite_core_1.integer)("duration").default(0), // Em segundos
    order: (0, sqlite_core_1.integer)("order").notNull(),
    isFree: (0, sqlite_core_1.integer)("isFree", { mode: 'boolean' }).default(false),
    resources: (0, sqlite_core_1.text)("resources", { mode: 'json' }), // Links, arquivos adicionais
    quiz: (0, sqlite_core_1.text)("quiz", { mode: 'json' }), // Quiz opcional da aula
    notes: (0, sqlite_core_1.text)("notes"), // Anotações da aula
    isPublished: (0, sqlite_core_1.integer)("isPublished", { mode: 'boolean' }).default(false),
    createdAt: (0, sqlite_core_1.integer)("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
exports.enrollments = (0, sqlite_core_1.sqliteTable)("enrollments", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => (0, nanoid_1.nanoid)()),
    courseId: (0, sqlite_core_1.text)("courseId").notNull().references(() => exports.courses.id),
    userId: (0, sqlite_core_1.text)("userId").notNull().references(() => exports.users.id),
    progress: (0, sqlite_core_1.real)("progress").default(0), // 0-100%
    currentLessonId: (0, sqlite_core_1.text)("currentLessonId").references(() => exports.lessons.id),
    completedLessons: (0, sqlite_core_1.text)("completedLessons", { mode: 'json' }).default("[]"), // Array de IDs das aulas concluídas
    enrolledAt: (0, sqlite_core_1.integer)("enrolledAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    lastAccessedAt: (0, sqlite_core_1.integer)("lastAccessedAt", { mode: 'timestamp' }),
    completedAt: (0, sqlite_core_1.integer)("completedAt", { mode: 'timestamp' }),
    status: (0, sqlite_core_1.text)("status").default("active"), // active, paused, completed, expired
    paymentId: (0, sqlite_core_1.text)("paymentId"), // ID do pagamento se aplicável
    notes: (0, sqlite_core_1.text)("notes", { mode: 'json' }), // Anotações do aluno
});
exports.lessonProgress = (0, sqlite_core_1.sqliteTable)("lesson_progress", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => (0, nanoid_1.nanoid)()),
    enrollmentId: (0, sqlite_core_1.text)("enrollmentId").notNull().references(() => exports.enrollments.id),
    lessonId: (0, sqlite_core_1.text)("lessonId").notNull().references(() => exports.lessons.id),
    progress: (0, sqlite_core_1.real)("progress").default(0), // 0-100%
    timeWatched: (0, sqlite_core_1.integer)("timeWatched").default(0), // Em segundos
    isCompleted: (0, sqlite_core_1.integer)("isCompleted", { mode: 'boolean' }).default(false),
    lastPosition: (0, sqlite_core_1.integer)("lastPosition").default(0), // Posição em segundos onde parou
    watchedAt: (0, sqlite_core_1.integer)("watchedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    completedAt: (0, sqlite_core_1.integer)("completedAt", { mode: 'timestamp' }),
});
// PUSH NOTIFICATIONS ESPECÍFICAS PARA CURSOS
exports.coursePushSubscriptions = (0, sqlite_core_1.sqliteTable)("course_push_subscriptions", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => (0, nanoid_1.nanoid)()),
    courseId: (0, sqlite_core_1.text)("courseId").notNull().references(() => exports.courses.id),
    userId: (0, sqlite_core_1.text)("userId").notNull().references(() => exports.users.id),
    subscription: (0, sqlite_core_1.text)("subscription", { mode: 'json' }).notNull(), // PushSubscription object
    isActive: (0, sqlite_core_1.integer)("isActive", { mode: 'boolean' }).default(true),
    createdAt: (0, sqlite_core_1.integer)("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    lastNotificationAt: (0, sqlite_core_1.integer)("lastNotificationAt", { mode: 'timestamp' }),
});
exports.scheduledCourseNotifications = (0, sqlite_core_1.sqliteTable)("scheduled_course_notifications", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => (0, nanoid_1.nanoid)()),
    courseId: (0, sqlite_core_1.text)("courseId").notNull().references(() => exports.courses.id),
    creatorId: (0, sqlite_core_1.text)("creatorId").notNull().references(() => exports.users.id),
    title: (0, sqlite_core_1.text)("title").notNull(),
    message: (0, sqlite_core_1.text)("message").notNull(),
    icon: (0, sqlite_core_1.text)("icon"),
    url: (0, sqlite_core_1.text)("url"),
    targetAudience: (0, sqlite_core_1.text)("targetAudience").default("all"), // all, specific_users, progress_based
    targetUserIds: (0, sqlite_core_1.text)("targetUserIds", { mode: 'json' }), // Array de IDs específicos
    progressFilter: (0, sqlite_core_1.text)("progressFilter", { mode: 'json' }), // Filtros por progresso
    scheduledFor: (0, sqlite_core_1.integer)("scheduledFor", { mode: 'timestamp' }).notNull(),
    status: (0, sqlite_core_1.text)("status").default("scheduled"), // scheduled, sent, failed, cancelled
    sentAt: (0, sqlite_core_1.integer)("sentAt", { mode: 'timestamp' }),
    sentCount: (0, sqlite_core_1.integer)("sentCount").default(0),
    failedCount: (0, sqlite_core_1.integer)("failedCount").default(0),
    createdAt: (0, sqlite_core_1.integer)("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
exports.courseNotificationTemplates = (0, sqlite_core_1.sqliteTable)("course_notification_templates", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => (0, nanoid_1.nanoid)()),
    courseId: (0, sqlite_core_1.text)("courseId").notNull().references(() => exports.courses.id),
    name: (0, sqlite_core_1.text)("name").notNull(),
    title: (0, sqlite_core_1.text)("title").notNull(),
    message: (0, sqlite_core_1.text)("message").notNull(),
    icon: (0, sqlite_core_1.text)("icon"),
    url: (0, sqlite_core_1.text)("url"),
    type: (0, sqlite_core_1.text)("type").notNull(), // welcome, reminder, new_lesson, completion, custom
    isActive: (0, sqlite_core_1.integer)("isActive", { mode: 'boolean' }).default(true),
    triggerCondition: (0, sqlite_core_1.text)("triggerCondition", { mode: 'json' }), // Condições para disparo automático
    createdAt: (0, sqlite_core_1.integer)("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
exports.quizTemplates = (0, sqlite_core_1.sqliteTable)("quiz_templates", {
    id: (0, sqlite_core_1.integer)("id").primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)("name").notNull(),
    description: (0, sqlite_core_1.text)("description"),
    structure: (0, sqlite_core_1.text)("structure", { mode: 'json' }).notNull(),
    category: (0, sqlite_core_1.text)("category"),
    createdAt: (0, sqlite_core_1.integer)("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
exports.quizResponses = (0, sqlite_core_1.sqliteTable)("quiz_responses", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    quizId: (0, sqlite_core_1.text)("quizId").notNull().references(() => exports.quizzes.id),
    userId: (0, sqlite_core_1.text)("userId").references(() => exports.users.id), // Campo opcional para respostas de usuários logados
    responses: (0, sqlite_core_1.text)("responses", { mode: 'json' }).notNull(),
    metadata: (0, sqlite_core_1.text)("metadata", { mode: 'json' }),
    submittedAt: (0, sqlite_core_1.integer)("submittedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    country: (0, sqlite_core_1.text)("country"),
    phoneCountryCode: (0, sqlite_core_1.text)("phoneCountryCode"),
    affiliateId: (0, sqlite_core_1.text)("affiliateId"),
});
// Nova tabela para indexar todas as variáveis de resposta para remarketing ultra-personalizado
exports.responseVariables = (0, sqlite_core_1.sqliteTable)("response_variables", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    responseId: (0, sqlite_core_1.text)("responseId").notNull().references(() => exports.quizResponses.id, { onDelete: "cascade" }),
    quizId: (0, sqlite_core_1.text)("quizId").notNull().references(() => exports.quizzes.id, { onDelete: "cascade" }),
    variableName: (0, sqlite_core_1.text)("variableName").notNull(), // Ex: "produto_interesse", "nome_completo", "idade"
    variableValue: (0, sqlite_core_1.text)("variableValue").notNull(), // Ex: "Whey Protein", "João Silva", "28"
    elementType: (0, sqlite_core_1.text)("elementType").notNull(), // Ex: "multiple_choice", "text", "number"
    pageId: (0, sqlite_core_1.text)("pageId").notNull(), // Ex: "page_1", "page_2"
    elementId: (0, sqlite_core_1.text)("elementId").notNull(), // Ex: "element_multiple_choice_1"
    pageOrder: (0, sqlite_core_1.integer)("pageOrder").notNull(), // Ordem da página no funil
    question: (0, sqlite_core_1.text)("question"), // Pergunta original para contexto
    createdAt: (0, sqlite_core_1.integer)("createdAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});
exports.quizAnalytics = (0, sqlite_core_1.sqliteTable)("quiz_analytics", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    quizId: (0, sqlite_core_1.text)("quizId").notNull().references(() => exports.quizzes.id),
    date: (0, sqlite_core_1.text)("date").notNull(),
    views: (0, sqlite_core_1.integer)("views").default(0),
    completions: (0, sqlite_core_1.integer)("completions").default(0),
    conversionRate: (0, sqlite_core_1.real)("conversionRate").default(0),
    metadata: (0, sqlite_core_1.text)("metadata", { mode: 'json' }),
});
exports.smsTransactions = (0, sqlite_core_1.sqliteTable)("sms_transactions", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    userId: (0, sqlite_core_1.text)("userId").notNull().references(() => exports.users.id),
    type: (0, sqlite_core_1.text)("type").notNull(), // 'purchase' | 'usage' | 'bonus'
    amount: (0, sqlite_core_1.integer)("amount").notNull(),
    description: (0, sqlite_core_1.text)("description"),
    createdAt: (0, sqlite_core_1.integer)("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
exports.smsCampaigns = (0, sqlite_core_1.sqliteTable)("sms_campaigns", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    name: (0, sqlite_core_1.text)("name").notNull(),
    quizId: (0, sqlite_core_1.text)("quizId").notNull().references(() => exports.quizzes.id, { onDelete: "cascade" }),
    userId: (0, sqlite_core_1.text)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    message: (0, sqlite_core_1.text)("message").notNull(),
    phones: (0, sqlite_core_1.text)("phones", { mode: 'json' }).notNull(), // Array of phone numbers stored as JSON
    status: (0, sqlite_core_1.text)("status").default("pending"), // pending, active, paused, completed
    sent: (0, sqlite_core_1.integer)("sent").default(0),
    delivered: (0, sqlite_core_1.integer)("delivered").default(0),
    opened: (0, sqlite_core_1.integer)("opened").default(0),
    clicked: (0, sqlite_core_1.integer)("clicked").default(0),
    replies: (0, sqlite_core_1.integer)("replies").default(0),
    scheduledAt: (0, sqlite_core_1.integer)("scheduledAt"), // Para campanhas agendadas
    targetAudience: (0, sqlite_core_1.text)("targetAudience").default("all"), // all, completed, abandoned
    campaignMode: (0, sqlite_core_1.text)("campaignMode").default("leads_ja_na_base"), // "modo_ao_vivo" ou "leads_ja_na_base"
    triggerDelay: (0, sqlite_core_1.integer)("triggerDelay").default(10),
    triggerUnit: (0, sqlite_core_1.text)("triggerUnit").default("minutes"),
    // 🚀 CAMPOS PARA CAMPANHAS ULTRA PERSONALIZADAS
    campaignType: (0, sqlite_core_1.text)("campaignType").default("standard"), // "standard" ou "ultra_personalized"
    conditionalRules: (0, sqlite_core_1.text)("conditionalRules", { mode: 'json' }), // JSON com regras SE > ENTÃO
    // 🔥 CAMPOS QUANTUM - EVOLUÇÃO DO SISTEMA ULTRA
    quantumType: (0, sqlite_core_1.text)("quantumType").default("standard"), // "standard", "remarketing", "live"
    quantumConfig: (0, sqlite_core_1.text)("quantumConfig", { mode: 'json' }), // Configurações avançadas Quantum
    quantumFilters: (0, sqlite_core_1.text)("quantumFilters", { mode: 'json' }), // Filtros Ultra granulares
    triggerConditions: (0, sqlite_core_1.text)("triggerConditions", { mode: 'json' }), // Condições de disparo automático
    createdAt: (0, sqlite_core_1.integer)("createdAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
    updatedAt: (0, sqlite_core_1.integer)("updatedAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});
exports.smsLogs = (0, sqlite_core_1.sqliteTable)("sms_logs", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    campaignId: (0, sqlite_core_1.text)("campaignId").notNull().references(() => exports.smsCampaigns.id, { onDelete: "cascade" }),
    phone: (0, sqlite_core_1.text)("phone").notNull(),
    message: (0, sqlite_core_1.text)("message").notNull(),
    status: (0, sqlite_core_1.text)("status").notNull(), // pending, sent, delivered, failed, scheduled
    twilioSid: (0, sqlite_core_1.text)("twilioSid"),
    errorMessage: (0, sqlite_core_1.text)("errorMessage"),
    sentAt: (0, sqlite_core_1.integer)("sentAt"),
    deliveredAt: (0, sqlite_core_1.integer)("deliveredAt"),
    scheduledAt: (0, sqlite_core_1.integer)("scheduledAt"), // Agendamento individual para cada SMS
    country: (0, sqlite_core_1.text)("country"), // País detectado do telefone
    countryCode: (0, sqlite_core_1.text)("countryCode"), // Código do país (+55, +1, etc.)
    createdAt: (0, sqlite_core_1.integer)("createdAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});
// Voice Calling Campaign System
exports.voiceCampaigns = (0, sqlite_core_1.sqliteTable)("voice_campaigns", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    name: (0, sqlite_core_1.text)("name").notNull(),
    quizId: (0, sqlite_core_1.text)("quizId").notNull().references(() => exports.quizzes.id, { onDelete: "cascade" }),
    userId: (0, sqlite_core_1.text)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    voiceMessage: (0, sqlite_core_1.text)("voiceMessage").notNull(), // Mensagem para TTS (Text-to-Speech)
    voiceFile: (0, sqlite_core_1.text)("voiceFile"), // URL do arquivo de áudio (opcional)
    voiceType: (0, sqlite_core_1.text)("voiceType").default("tts"), // "tts" para texto-para-fala, "audio" para arquivo de áudio
    voiceSettings: (0, sqlite_core_1.text)("voiceSettings", { mode: 'json' }).default("{}"), // Configurações de voz (velocidade, tom, etc.)
    phones: (0, sqlite_core_1.text)("phones", { mode: 'json' }).notNull(), // Array of phone numbers stored as JSON
    status: (0, sqlite_core_1.text)("status").default("pending"), // pending, active, paused, completed
    sent: (0, sqlite_core_1.integer)("sent").default(0),
    answered: (0, sqlite_core_1.integer)("answered").default(0),
    voicemail: (0, sqlite_core_1.integer)("voicemail").default(0),
    busy: (0, sqlite_core_1.integer)("busy").default(0),
    failed: (0, sqlite_core_1.integer)("failed").default(0),
    duration: (0, sqlite_core_1.integer)("duration").default(0), // Duração total em segundos
    scheduledAt: (0, sqlite_core_1.integer)("scheduledAt"), // Para campanhas agendadas
    targetAudience: (0, sqlite_core_1.text)("targetAudience").default("all"), // all, completed, abandoned
    campaignMode: (0, sqlite_core_1.text)("campaignMode").default("leads_ja_na_base"), // "modo_ao_vivo" ou "leads_ja_na_base"
    triggerDelay: (0, sqlite_core_1.integer)("triggerDelay").default(10),
    triggerUnit: (0, sqlite_core_1.text)("triggerUnit").default("minutes"),
    maxRetries: (0, sqlite_core_1.integer)("maxRetries").default(3), // Tentativas máximas para cada número
    retryDelay: (0, sqlite_core_1.integer)("retryDelay").default(60), // Delay entre tentativas (minutos)
    callTimeout: (0, sqlite_core_1.integer)("callTimeout").default(30), // Timeout da chamada (segundos)
    createdAt: (0, sqlite_core_1.integer)("createdAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
    updatedAt: (0, sqlite_core_1.integer)("updatedAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});
exports.voiceLogs = (0, sqlite_core_1.sqliteTable)("voice_logs", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    campaignId: (0, sqlite_core_1.text)("campaignId").notNull().references(() => exports.voiceCampaigns.id, { onDelete: "cascade" }),
    phone: (0, sqlite_core_1.text)("phone").notNull(),
    voiceMessage: (0, sqlite_core_1.text)("voiceMessage").notNull(),
    voiceFile: (0, sqlite_core_1.text)("voiceFile"), // URL do arquivo de áudio usado
    status: (0, sqlite_core_1.text)("status").notNull(), // pending, calling, answered, voicemail, busy, failed, scheduled, completed
    twilioSid: (0, sqlite_core_1.text)("twilioSid"), // ID da chamada no Twilio
    callDuration: (0, sqlite_core_1.integer)("callDuration").default(0), // Duração da chamada em segundos
    callPrice: (0, sqlite_core_1.text)("callPrice"), // Preço da chamada
    errorMessage: (0, sqlite_core_1.text)("errorMessage"),
    retryCount: (0, sqlite_core_1.integer)("retryCount").default(0), // Número de tentativas
    scheduledAt: (0, sqlite_core_1.integer)("scheduledAt"), // Agendamento individual para cada chamada
    calledAt: (0, sqlite_core_1.integer)("calledAt"), // Timestamp da chamada
    answeredAt: (0, sqlite_core_1.integer)("answeredAt"), // Timestamp quando atendeu
    completedAt: (0, sqlite_core_1.integer)("completedAt"), // Timestamp quando terminou
    country: (0, sqlite_core_1.text)("country"), // País detectado do telefone
    countryCode: (0, sqlite_core_1.text)("countryCode"), // Código do país (+55, +1, etc.)
    recordingUrl: (0, sqlite_core_1.text)("recordingUrl"), // URL da gravação da chamada (se habilitada)
    createdAt: (0, sqlite_core_1.integer)("createdAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});
exports.emailCampaigns = (0, sqlite_core_1.sqliteTable)("email_campaigns", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    name: (0, sqlite_core_1.text)("name").notNull(),
    subject: (0, sqlite_core_1.text)("subject").notNull(),
    content: (0, sqlite_core_1.text)("content").notNull(),
    quizId: (0, sqlite_core_1.text)("quizId").notNull().references(() => exports.quizzes.id, { onDelete: "cascade" }),
    userId: (0, sqlite_core_1.text)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    status: (0, sqlite_core_1.text)("status").default("draft"), // draft, active, paused, completed
    campaignType: (0, sqlite_core_1.text)("campaignType").default("remarketing"), // "live" (tempo real) ou "remarketing" (leads antigos)
    triggerType: (0, sqlite_core_1.text)("triggerType").default("immediate"), // immediate, delayed, scheduled
    triggerDelay: (0, sqlite_core_1.integer)("triggerDelay").default(0),
    triggerUnit: (0, sqlite_core_1.text)("triggerUnit").default("hours"), // minutes, hours, days
    targetAudience: (0, sqlite_core_1.text)("targetAudience").default("completed"), // all, completed, abandoned
    dateFilter: (0, sqlite_core_1.integer)("dateFilter"), // Unix timestamp para filtrar leads por data
    variables: (0, sqlite_core_1.text)("variables", { mode: 'json' }).default("[]"),
    sent: (0, sqlite_core_1.integer)("sent").default(0),
    delivered: (0, sqlite_core_1.integer)("delivered").default(0),
    opened: (0, sqlite_core_1.integer)("opened").default(0),
    clicked: (0, sqlite_core_1.integer)("clicked").default(0),
    createdAt: (0, sqlite_core_1.integer)("createdAt").default(0),
    updatedAt: (0, sqlite_core_1.integer)("updatedAt").default(0),
});
exports.emailTemplates = (0, sqlite_core_1.sqliteTable)("email_templates", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    name: (0, sqlite_core_1.text)("name").notNull(),
    subject: (0, sqlite_core_1.text)("subject").notNull(),
    content: (0, sqlite_core_1.text)("content").notNull(),
    category: (0, sqlite_core_1.text)("category").notNull(),
    variables: (0, sqlite_core_1.text)("variables", { mode: 'json' }).default("[]"),
    userId: (0, sqlite_core_1.text)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    createdAt: (0, sqlite_core_1.integer)("createdAt").default(0),
    updatedAt: (0, sqlite_core_1.integer)("updatedAt").default(0),
});
exports.emailLogs = (0, sqlite_core_1.sqliteTable)("email_logs", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    campaignId: (0, sqlite_core_1.text)("campaignId").notNull().references(() => exports.emailCampaigns.id, { onDelete: "cascade" }),
    email: (0, sqlite_core_1.text)("email").notNull(),
    personalizedSubject: (0, sqlite_core_1.text)("personalizedSubject").notNull(),
    personalizedContent: (0, sqlite_core_1.text)("personalizedContent").notNull(),
    leadData: (0, sqlite_core_1.text)("leadData", { mode: 'json' }),
    status: (0, sqlite_core_1.text)("status").notNull(), // sent, delivered, bounced, opened, clicked, complained, unsubscribed
    sendgridId: (0, sqlite_core_1.text)("sendgridId"),
    errorMessage: (0, sqlite_core_1.text)("errorMessage"),
    sentAt: (0, sqlite_core_1.integer)("sentAt"),
    deliveredAt: (0, sqlite_core_1.integer)("deliveredAt"),
    openedAt: (0, sqlite_core_1.integer)("openedAt"),
    clickedAt: (0, sqlite_core_1.integer)("clickedAt"),
    scheduledAt: (0, sqlite_core_1.integer)("scheduledAt"),
    createdAt: (0, sqlite_core_1.integer)("createdAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});
exports.emailAutomations = (0, sqlite_core_1.sqliteTable)("email_automations", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    name: (0, sqlite_core_1.text)("name").notNull(),
    description: (0, sqlite_core_1.text)("description"),
    userId: (0, sqlite_core_1.text)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    quizId: (0, sqlite_core_1.text)("quizId").notNull().references(() => exports.quizzes.id, { onDelete: "cascade" }),
    trigger: (0, sqlite_core_1.text)("trigger").notNull(), // quiz_completed, quiz_abandoned, time_based, score_based
    conditions: (0, sqlite_core_1.text)("conditions", { mode: 'json' }),
    sequence: (0, sqlite_core_1.text)("sequence", { mode: 'json' }).notNull(),
    isActive: (0, sqlite_core_1.integer)("isActive", { mode: 'boolean' }).default(true),
    createdAt: (0, sqlite_core_1.integer)("createdAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
    updatedAt: (0, sqlite_core_1.integer)("updatedAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});
exports.emailSequences = (0, sqlite_core_1.sqliteTable)("email_sequences", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    automationId: (0, sqlite_core_1.text)("automationId").notNull().references(() => exports.emailAutomations.id, { onDelete: "cascade" }),
    leadEmail: (0, sqlite_core_1.text)("leadEmail").notNull(),
    leadData: (0, sqlite_core_1.text)("leadData", { mode: 'json' }),
    currentStep: (0, sqlite_core_1.integer)("currentStep").default(0),
    status: (0, sqlite_core_1.text)("status").default("active"), // active, paused, completed, stopped
    nextEmailAt: (0, sqlite_core_1.integer)("nextEmailAt"),
    createdAt: (0, sqlite_core_1.integer)("createdAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
    updatedAt: (0, sqlite_core_1.integer)("updatedAt").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});
// Schemas para validação
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertQuizSchema = (0, drizzle_zod_1.createInsertSchema)(exports.quizzes).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    // Validação adicional da estrutura do quiz
    structure: zod_1.z.object({
        pages: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
            title: zod_1.z.string().optional(),
            elements: zod_1.z.array(zod_1.z.object({
                type: zod_1.z.string().min(1, "Tipo do elemento é obrigatório"),
                content: zod_1.z.string().optional(),
                fieldId: zod_1.z.string().optional(),
                required: zod_1.z.boolean().optional(),
                options: zod_1.z.array(zod_1.z.string()).optional(),
                placeholder: zod_1.z.string().optional(),
                minValue: zod_1.z.number().optional(),
                maxValue: zod_1.z.number().optional()
            }).passthrough()) // Permitir propriedades adicionais
        })).min(0, "Quiz deve ter pelo menos 0 páginas"),
        globalStyles: zod_1.z.object({
            backgroundColor: zod_1.z.string().optional(),
            fontFamily: zod_1.z.string().optional(),
            primaryColor: zod_1.z.string().optional()
        }).optional()
    }).optional() // Estrutura é opcional durante criação
}).refine((data) => {
    // Validação customizada para estrutura malformada
    if (data.structure) {
        if (typeof data.structure !== 'object' || data.structure === null) {
            return false;
        }
        if (Array.isArray(data.structure.pages)) {
            return data.structure.pages.every(page => page && typeof page === 'object' &&
                Array.isArray(page.elements));
        }
        return false;
    }
    return true;
}, {
    message: "Estrutura do quiz é inválida",
    path: ["structure"]
});
exports.insertQuizTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.quizTemplates).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertQuizResponseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.quizResponses).omit({
    id: true,
    submittedAt: true,
});
exports.insertQuizAnalyticsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.quizAnalytics).omit({
    id: true,
});
exports.insertEmailCampaignSchema = (0, drizzle_zod_1.createInsertSchema)(exports.emailCampaigns).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertEmailTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.emailTemplates).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertEmailLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.emailLogs).omit({
    id: true,
    createdAt: true,
});
exports.insertEmailAutomationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.emailAutomations).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertEmailSequenceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.emailSequences).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Voice Calling Schemas
exports.insertVoiceCampaignSchema = (0, drizzle_zod_1.createInsertSchema)(exports.voiceCampaigns).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertVoiceLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.voiceLogs).omit({
    id: true,
    createdAt: true,
});
// WhatsApp Campaigns Schema
exports.whatsappCampaigns = (0, sqlite_core_1.sqliteTable)('whatsapp_campaigns', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    quizId: (0, sqlite_core_1.text)('quiz_id').notNull(),
    messages: (0, sqlite_core_1.text)('messages', { mode: 'json' }).notNull().$type(), // Array de mensagens rotativas
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(() => exports.users.id),
    phones: (0, sqlite_core_1.text)('phones', { mode: 'json' }).notNull().$type(),
    status: (0, sqlite_core_1.text)('status').notNull().default('active'),
    scheduledAt: (0, sqlite_core_1.integer)('scheduled_at'),
    triggerDelay: (0, sqlite_core_1.integer)('trigger_delay').default(10),
    triggerUnit: (0, sqlite_core_1.text)('trigger_unit').default('minutes'),
    targetAudience: (0, sqlite_core_1.text)('target_audience').notNull().default('all'),
    campaignMode: (0, sqlite_core_1.text)('campaign_mode').default('leads_ja_na_base'), // "modo_ao_vivo" ou "leads_ja_na_base"
    dateFilter: (0, sqlite_core_1.text)('date_filter'), // Filtro de data para frente
    extensionSettings: (0, sqlite_core_1.text)('extension_settings', { mode: 'json' }).$type(),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull()
});
// WhatsApp Logs Schema
exports.whatsappLogs = (0, sqlite_core_1.sqliteTable)('whatsapp_logs', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    campaignId: (0, sqlite_core_1.text)('campaign_id').notNull().references(() => exports.whatsappCampaigns.id, { onDelete: 'cascade' }),
    phone: (0, sqlite_core_1.text)('phone').notNull(),
    message: (0, sqlite_core_1.text)('message').notNull(),
    status: (0, sqlite_core_1.text)('status').notNull().default('pending'),
    scheduledAt: (0, sqlite_core_1.integer)('scheduled_at'),
    sentAt: (0, sqlite_core_1.integer)('sent_at'),
    extensionStatus: (0, sqlite_core_1.text)('extension_status'),
    error: (0, sqlite_core_1.text)('error'),
    country: (0, sqlite_core_1.text)('country'), // País detectado do telefone
    countryCode: (0, sqlite_core_1.text)('country_code'), // Código do país (+55, +1, etc.)
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`)
});
// WhatsApp Templates Schema
exports.whatsappTemplates = (0, sqlite_core_1.sqliteTable)('whatsapp_templates', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    message: (0, sqlite_core_1.text)('message').notNull(),
    category: (0, sqlite_core_1.text)('category').notNull(),
    variables: (0, sqlite_core_1.text)('variables', { mode: 'json' }).notNull().$type(),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(() => exports.users.id),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`)
});
// WhatsApp Automation Files Schema
exports.whatsappAutomationFiles = (0, sqlite_core_1.sqliteTable)('whatsapp_automation_files', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(() => exports.users.id),
    quizId: (0, sqlite_core_1.text)('quiz_id').notNull(),
    quizTitle: (0, sqlite_core_1.text)('quiz_title').notNull(),
    targetAudience: (0, sqlite_core_1.text)('target_audience').notNull(),
    dateFilter: (0, sqlite_core_1.text)('date_filter'),
    phones: (0, sqlite_core_1.text)('phones', { mode: 'json' }).notNull().$type(),
    totalPhones: (0, sqlite_core_1.integer)('total_phones').notNull(),
    createdAt: (0, sqlite_core_1.text)('created_at').notNull(),
    lastUpdated: (0, sqlite_core_1.text)('last_updated').notNull()
});
// WhatsApp Zod Schemas
exports.insertWhatsappCampaignSchema = (0, drizzle_zod_1.createInsertSchema)(exports.whatsappCampaigns);
exports.insertWhatsappLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.whatsappLogs);
exports.insertWhatsappTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.whatsappTemplates);
exports.insertWhatsappAutomationFileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.whatsappAutomationFiles);
// Telegram Campaigns Schema
exports.telegramCampaigns = (0, sqlite_core_1.sqliteTable)('telegram_campaigns', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    quizId: (0, sqlite_core_1.text)('quiz_id').notNull(),
    messages: (0, sqlite_core_1.text)('messages', { mode: 'json' }).notNull().$type(), // Array de mensagens rotativas
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(() => exports.users.id),
    phones: (0, sqlite_core_1.text)('phones', { mode: 'json' }).notNull().$type(),
    status: (0, sqlite_core_1.text)('status').notNull().default('active'),
    scheduledAt: (0, sqlite_core_1.integer)('scheduled_at'),
    triggerDelay: (0, sqlite_core_1.integer)('trigger_delay').default(10),
    triggerUnit: (0, sqlite_core_1.text)('trigger_unit').default('minutes'),
    targetAudience: (0, sqlite_core_1.text)('target_audience').notNull().default('all'),
    campaignMode: (0, sqlite_core_1.text)('campaign_mode').default('leads_ja_na_base'), // "modo_ao_vivo" ou "leads_ja_na_base"
    dateFilter: (0, sqlite_core_1.text)('date_filter'), // Filtro de data para frente
    extensionSettings: (0, sqlite_core_1.text)('extension_settings', { mode: 'json' }).$type(),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull()
});
// Telegram Logs Schema
exports.telegramLogs = (0, sqlite_core_1.sqliteTable)('telegram_logs', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    campaignId: (0, sqlite_core_1.text)('campaign_id').notNull().references(() => exports.telegramCampaigns.id, { onDelete: 'cascade' }),
    phone: (0, sqlite_core_1.text)('phone').notNull(),
    message: (0, sqlite_core_1.text)('message').notNull(),
    status: (0, sqlite_core_1.text)('status').notNull().default('pending'),
    scheduledAt: (0, sqlite_core_1.integer)('scheduled_at'),
    sentAt: (0, sqlite_core_1.integer)('sent_at'),
    extensionStatus: (0, sqlite_core_1.text)('extension_status'),
    error: (0, sqlite_core_1.text)('error'),
    country: (0, sqlite_core_1.text)('country'), // País detectado do telefone
    countryCode: (0, sqlite_core_1.text)('country_code'), // Código do país (+55, +1, etc.)
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`)
});
// Telegram Templates Schema
exports.telegramTemplates = (0, sqlite_core_1.sqliteTable)('telegram_templates', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    message: (0, sqlite_core_1.text)('message').notNull(),
    category: (0, sqlite_core_1.text)('category').notNull(),
    variables: (0, sqlite_core_1.text)('variables', { mode: 'json' }).notNull().$type(),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(() => exports.users.id),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`)
});
// Telegram Bot Configurations Schema
exports.telegramBotConfigs = (0, sqlite_core_1.sqliteTable)('telegram_bot_configs', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(() => exports.users.id),
    botToken: (0, sqlite_core_1.text)('bot_token').notNull(),
    botName: (0, sqlite_core_1.text)('bot_name'),
    botUsername: (0, sqlite_core_1.text)('bot_username'),
    webhookUrl: (0, sqlite_core_1.text)('webhook_url'),
    isActive: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).default(true),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`)
});
// Telegram Zod Schemas
exports.insertTelegramCampaignSchema = (0, drizzle_zod_1.createInsertSchema)(exports.telegramCampaigns);
exports.insertTelegramLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.telegramLogs);
exports.insertTelegramTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.telegramTemplates);
exports.insertTelegramBotConfigSchema = (0, drizzle_zod_1.createInsertSchema)(exports.telegramBotConfigs);
// Push Notifications Schema
exports.pushSubscriptions = (0, sqlite_core_1.sqliteTable)('push_subscriptions', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    user_id: (0, sqlite_core_1.text)('user_id').notNull().references(() => exports.users.id),
    endpoint: (0, sqlite_core_1.text)('endpoint').notNull(),
    keys_p256dh: (0, sqlite_core_1.text)('keys_p256dh').notNull(),
    keys_auth: (0, sqlite_core_1.text)('keys_auth').notNull(),
    user_agent: (0, sqlite_core_1.text)('user_agent'),
    device_type: (0, sqlite_core_1.text)('device_type'),
    is_active: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).default(true),
    created_at: (0, sqlite_core_1.text)('created_at').notNull().default((0, drizzle_orm_1.sql) `datetime('now')`),
    updated_at: (0, sqlite_core_1.text)('updated_at').notNull().default((0, drizzle_orm_1.sql) `datetime('now')`)
});
exports.pushNotificationLogs = (0, sqlite_core_1.sqliteTable)('push_notification_logs', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    user_id: (0, sqlite_core_1.text)('user_id').notNull().references(() => exports.users.id),
    title: (0, sqlite_core_1.text)('title').notNull(),
    body: (0, sqlite_core_1.text)('body').notNull(),
    status: (0, sqlite_core_1.text)('status').notNull().default('pending'), // 'pending', 'sent', 'failed', 'delivered'
    sent_at: (0, sqlite_core_1.text)('sent_at'),
    delivered_at: (0, sqlite_core_1.text)('delivered_at'),
    error_message: (0, sqlite_core_1.text)('error_message'),
    notification_data: (0, sqlite_core_1.text)('notification_data', { mode: 'json' }),
    created_at: (0, sqlite_core_1.text)('created_at').notNull().default((0, drizzle_orm_1.sql) `datetime('now')`)
});
// Push Notifications Zod Schemas
exports.insertPushSubscriptionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.pushSubscriptions);
exports.insertPushNotificationLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.pushNotificationLogs);
// Response Variables Schema e Types
exports.insertResponseVariableSchema = (0, drizzle_zod_1.createInsertSchema)(exports.responseVariables);
// AI Conversion Campaigns Schema
exports.aiConversionCampaigns = (0, sqlite_core_1.sqliteTable)('ai_conversion_campaigns', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(() => exports.users.id),
    name: (0, sqlite_core_1.text)('name').notNull(),
    quizId: (0, sqlite_core_1.text)('quiz_id').notNull().references(() => exports.quizzes.id),
    quizTitle: (0, sqlite_core_1.text)('quiz_title').notNull(),
    scriptTemplate: (0, sqlite_core_1.text)('script_template').notNull(),
    heygenAvatar: (0, sqlite_core_1.text)('heygen_avatar').notNull(),
    heygenVoice: (0, sqlite_core_1.text)('heygen_voice').notNull(),
    isActive: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).default(true),
    totalGenerated: (0, sqlite_core_1.integer)('total_generated').default(0),
    totalViews: (0, sqlite_core_1.integer)('total_views').default(0),
    totalConversions: (0, sqlite_core_1.integer)('total_conversions').default(0),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`)
});
// AI Video Generations Schema
exports.aiVideoGenerations = (0, sqlite_core_1.sqliteTable)('ai_video_generations', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(() => exports.users.id),
    title: (0, sqlite_core_1.text)('title').notNull(),
    topic: (0, sqlite_core_1.text)('topic').notNull(),
    script: (0, sqlite_core_1.text)('script'),
    duration: (0, sqlite_core_1.integer)('duration').default(60),
    style: (0, sqlite_core_1.text)('style').default('viral'),
    voice: (0, sqlite_core_1.text)('voice').default('masculina'),
    videoUrl: (0, sqlite_core_1.text)('video_url'),
    thumbnailUrl: (0, sqlite_core_1.text)('thumbnail_url'),
    status: (0, sqlite_core_1.text)('status').notNull().default('pending'), // pending, generating, completed, failed
    views: (0, sqlite_core_1.integer)('views').default(0),
    likes: (0, sqlite_core_1.integer)('likes').default(0),
    shares: (0, sqlite_core_1.integer)('shares').default(0),
    error: (0, sqlite_core_1.text)('error'),
    createdAt: (0, sqlite_core_1.integer)('created_at').notNull(),
    updatedAt: (0, sqlite_core_1.integer)('updated_at').notNull()
});
// AI Conversion Zod Schemas
exports.insertAiConversionCampaignSchema = (0, drizzle_zod_1.createInsertSchema)(exports.aiConversionCampaigns);
exports.insertAiVideoGenerationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.aiVideoGenerations);
// Notifications Schema
exports.notifications = (0, sqlite_core_1.sqliteTable)('notifications', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    title: (0, sqlite_core_1.text)('title').notNull(),
    message: (0, sqlite_core_1.text)('message').notNull(),
    type: (0, sqlite_core_1.text)('type').notNull().default('info'), // info, success, warning, error
    userId: (0, sqlite_core_1.text)('user_id').references(() => exports.users.id), // null for global notifications
    isRead: (0, sqlite_core_1.integer)('is_read', { mode: 'boolean' }).default(false),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`)
});
// Notifications Zod Schemas
exports.insertNotificationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.notifications);
// Super Affiliates Schema
exports.superAffiliates = (0, sqlite_core_1.sqliteTable)('super_affiliates', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(() => exports.users.id),
    quizId: (0, sqlite_core_1.text)('quiz_id').notNull().references(() => exports.quizzes.id),
    affiliateCode: (0, sqlite_core_1.text)('affiliate_code').unique().notNull(),
    commissionRate: (0, sqlite_core_1.real)('commission_rate').default(0.1), // 10% padrão
    totalViews: (0, sqlite_core_1.integer)('total_views').default(0),
    totalLeads: (0, sqlite_core_1.integer)('total_leads').default(0),
    totalSales: (0, sqlite_core_1.integer)('total_sales').default(0),
    totalCommission: (0, sqlite_core_1.real)('total_commission').default(0),
    status: (0, sqlite_core_1.text)('status').notNull().default('active'), // active, inactive, suspended
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`)
});
// Affiliate Sales Schema
exports.affiliateSales = (0, sqlite_core_1.sqliteTable)('affiliate_sales', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    affiliateId: (0, sqlite_core_1.text)('affiliate_id').notNull().references(() => exports.superAffiliates.id),
    responseId: (0, sqlite_core_1.text)('response_id').notNull().references(() => exports.quizResponses.id),
    saleAmount: (0, sqlite_core_1.real)('sale_amount').notNull(),
    commissionAmount: (0, sqlite_core_1.real)('commission_amount').notNull(),
    status: (0, sqlite_core_1.text)('status').notNull().default('pending'), // pending, approved, paid
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`)
});
// Super Affiliates Zod Schemas
exports.insertSuperAffiliateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.superAffiliates);
exports.insertAffiliateSaleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.affiliateSales);
// A/B Testing Schema
exports.abTests = (0, sqlite_core_1.sqliteTable)('ab_tests', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(() => exports.users.id),
    name: (0, sqlite_core_1.text)('name').notNull(),
    description: (0, sqlite_core_1.text)('description'),
    funnelIds: (0, sqlite_core_1.text)('funnel_ids', { mode: 'json' }).notNull().$type(),
    funnelNames: (0, sqlite_core_1.text)('funnel_names', { mode: 'json' }).notNull().$type(),
    trafficSplit: (0, sqlite_core_1.text)('traffic_split', { mode: 'json' }).notNull().$type(),
    status: (0, sqlite_core_1.text)('status').notNull().default('active'), // active, paused, completed
    duration: (0, sqlite_core_1.integer)('duration').default(14), // days
    views: (0, sqlite_core_1.integer)('views').default(0),
    conversions: (0, sqlite_core_1.integer)('conversions').default(0),
    conversionRate: (0, sqlite_core_1.real)('conversion_rate').default(0),
    endDate: (0, sqlite_core_1.integer)('end_date', { mode: 'timestamp' }),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`)
});
// A/B Test Views Schema
exports.abTestViews = (0, sqlite_core_1.sqliteTable)('ab_test_views', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    testId: (0, sqlite_core_1.text)('test_id').notNull().references(() => exports.abTests.id, { onDelete: 'cascade' }),
    quizId: (0, sqlite_core_1.text)('quiz_id').notNull().references(() => exports.quizzes.id),
    visitorId: (0, sqlite_core_1.text)('visitor_id').notNull(),
    ipAddress: (0, sqlite_core_1.text)('ip_address'),
    userAgent: (0, sqlite_core_1.text)('user_agent'),
    completed: (0, sqlite_core_1.integer)('completed', { mode: 'boolean' }).default(false),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`)
});
// Webhooks Schema
exports.webhooks = (0, sqlite_core_1.sqliteTable)('webhooks', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(() => exports.users.id),
    name: (0, sqlite_core_1.text)('name').notNull(),
    url: (0, sqlite_core_1.text)('url').notNull(),
    events: (0, sqlite_core_1.text)('events', { mode: 'json' }).notNull().$type(),
    secret: (0, sqlite_core_1.text)('secret'),
    isActive: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).default(true),
    lastTriggered: (0, sqlite_core_1.integer)('last_triggered', { mode: 'timestamp' }),
    totalTriggers: (0, sqlite_core_1.integer)('total_triggers').default(0),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`)
});
// Webhook Logs Schema
exports.webhookLogs = (0, sqlite_core_1.sqliteTable)('webhook_logs', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    webhookId: (0, sqlite_core_1.text)('webhook_id').notNull().references(() => exports.webhooks.id, { onDelete: 'cascade' }),
    event: (0, sqlite_core_1.text)('event').notNull(),
    payload: (0, sqlite_core_1.text)('payload', { mode: 'json' }).notNull(),
    response: (0, sqlite_core_1.text)('response'),
    statusCode: (0, sqlite_core_1.integer)('status_code'),
    success: (0, sqlite_core_1.integer)('success', { mode: 'boolean' }).default(false),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`)
});
// Integrations Schema
exports.integrations = (0, sqlite_core_1.sqliteTable)('integrations', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(() => exports.users.id),
    type: (0, sqlite_core_1.text)('type').notNull(), // shopify, woocommerce, zapier, etc.
    name: (0, sqlite_core_1.text)('name').notNull(),
    config: (0, sqlite_core_1.text)('config', { mode: 'json' }).notNull().$type(),
    isActive: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).default(true),
    lastSync: (0, sqlite_core_1.integer)('last_sync', { mode: 'timestamp' }),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`)
});
// A/B Testing Zod Schemas
exports.insertAbTestSchema = (0, drizzle_zod_1.createInsertSchema)(exports.abTests);
exports.insertAbTestViewSchema = (0, drizzle_zod_1.createInsertSchema)(exports.abTestViews);
// Webhooks Zod Schemas
exports.insertWebhookSchema = (0, drizzle_zod_1.createInsertSchema)(exports.webhooks);
exports.insertWebhookLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.webhookLogs);
// Integrations Zod Schemas
exports.insertIntegrationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.integrations);
// ===============================================
// TYPEBOT AUTO-HOSPEDADO - SISTEMA COMPLETO
// ===============================================
// TypeBot Projects Schema
exports.typebotProjects = (0, sqlite_core_1.sqliteTable)('typebot_projects', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(() => exports.users.id),
    name: (0, sqlite_core_1.text)('name').notNull(),
    description: (0, sqlite_core_1.text)('description'),
    sourceQuizId: (0, sqlite_core_1.text)('source_quiz_id').references(() => exports.quizzes.id), // Quiz origem da conversão
    typebotData: (0, sqlite_core_1.text)('typebot_data', { mode: 'json' }).notNull().$type(),
    isPublished: (0, sqlite_core_1.integer)('is_published', { mode: 'boolean' }).default(false),
    publicId: (0, sqlite_core_1.text)('public_id').unique(), // ID público para acessar o chatbot
    theme: (0, sqlite_core_1.text)('theme', { mode: 'json' }).$type(),
    settings: (0, sqlite_core_1.text)('settings', { mode: 'json' }).$type(),
    totalViews: (0, sqlite_core_1.integer)('total_views').default(0),
    totalConversations: (0, sqlite_core_1.integer)('total_conversations').default(0),
    totalCompletions: (0, sqlite_core_1.integer)('total_completions').default(0),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`)
});
// TypeBot Conversations Schema
exports.typebotConversations = (0, sqlite_core_1.sqliteTable)('typebot_conversations', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    projectId: (0, sqlite_core_1.text)('project_id').notNull().references(() => exports.typebotProjects.id, { onDelete: 'cascade' }),
    visitorId: (0, sqlite_core_1.text)('visitor_id').notNull(),
    sessionId: (0, sqlite_core_1.text)('session_id').notNull(),
    isCompleted: (0, sqlite_core_1.integer)('is_completed', { mode: 'boolean' }).default(false),
    variables: (0, sqlite_core_1.text)('variables', { mode: 'json' }).$type(),
    results: (0, sqlite_core_1.text)('results', { mode: 'json' }).$type(),
    currentBlockId: (0, sqlite_core_1.text)('current_block_id'),
    ipAddress: (0, sqlite_core_1.text)('ip_address'),
    userAgent: (0, sqlite_core_1.text)('user_agent'),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`)
});
// TypeBot Messages Schema
exports.typebotMessages = (0, sqlite_core_1.sqliteTable)('typebot_messages', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    conversationId: (0, sqlite_core_1.text)('conversation_id').notNull().references(() => exports.typebotConversations.id, { onDelete: 'cascade' }),
    blockId: (0, sqlite_core_1.text)('block_id').notNull(),
    type: (0, sqlite_core_1.text)('type').notNull(), // text, image, video, input, etc.
    content: (0, sqlite_core_1.text)('content', { mode: 'json' }).notNull().$type(),
    isFromBot: (0, sqlite_core_1.integer)('is_from_bot', { mode: 'boolean' }).default(true),
    timestamp: (0, sqlite_core_1.integer)('timestamp', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`)
});
// TypeBot Analytics Schema
exports.typebotAnalytics = (0, sqlite_core_1.sqliteTable)('typebot_analytics', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    projectId: (0, sqlite_core_1.text)('project_id').notNull().references(() => exports.typebotProjects.id, { onDelete: 'cascade' }),
    date: (0, sqlite_core_1.text)('date').notNull(), // YYYY-MM-DD
    views: (0, sqlite_core_1.integer)('views').default(0),
    conversations: (0, sqlite_core_1.integer)('conversations').default(0),
    completions: (0, sqlite_core_1.integer)('completions').default(0),
    completionRate: (0, sqlite_core_1.real)('completion_rate').default(0),
    avgSessionTime: (0, sqlite_core_1.real)('avg_session_time').default(0),
    dropOffBlocks: (0, sqlite_core_1.text)('drop_off_blocks', { mode: 'json' }).$type(),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`)
});
// TypeBot Webhooks Schema
exports.typebotWebhooks = (0, sqlite_core_1.sqliteTable)('typebot_webhooks', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    projectId: (0, sqlite_core_1.text)('project_id').notNull().references(() => exports.typebotProjects.id, { onDelete: 'cascade' }),
    name: (0, sqlite_core_1.text)('name').notNull(),
    url: (0, sqlite_core_1.text)('url').notNull(),
    events: (0, sqlite_core_1.text)('events', { mode: 'json' }).notNull().$type(),
    headers: (0, sqlite_core_1.text)('headers', { mode: 'json' }).$type(),
    isActive: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).default(true),
    lastTriggered: (0, sqlite_core_1.integer)('last_triggered', { mode: 'timestamp' }),
    totalTriggers: (0, sqlite_core_1.integer)('total_triggers').default(0),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`)
});
// TypeBot Integrations Schema
exports.typebotIntegrations = (0, sqlite_core_1.sqliteTable)('typebot_integrations', {
    id: (0, sqlite_core_1.text)('id').primaryKey().notNull(),
    projectId: (0, sqlite_core_1.text)('project_id').notNull().references(() => exports.typebotProjects.id, { onDelete: 'cascade' }),
    type: (0, sqlite_core_1.text)('type').notNull(), // email, google-sheets, openai, etc.
    name: (0, sqlite_core_1.text)('name').notNull(),
    config: (0, sqlite_core_1.text)('config', { mode: 'json' }).notNull().$type(),
    isActive: (0, sqlite_core_1.integer)('is_active', { mode: 'boolean' }).default(true),
    lastUsed: (0, sqlite_core_1.integer)('last_used', { mode: 'timestamp' }),
    totalUses: (0, sqlite_core_1.integer)('total_uses').default(0),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).notNull().default((0, drizzle_orm_1.sql) `(unixepoch())`)
});
// TypeBot Zod Schemas
exports.insertTypebotProjectSchema = (0, drizzle_zod_1.createInsertSchema)(exports.typebotProjects);
exports.insertTypebotConversationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.typebotConversations);
exports.insertTypebotMessageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.typebotMessages);
exports.insertTypebotAnalyticsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.typebotAnalytics);
exports.insertTypebotWebhookSchema = (0, drizzle_zod_1.createInsertSchema)(exports.typebotWebhooks);
exports.insertTypebotIntegrationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.typebotIntegrations);
// =============================================
// CHECKOUT BUILDER SYSTEM TABLES
// =============================================
// Produtos do Checkout Builder
exports.checkoutProducts = (0, sqlite_core_1.sqliteTable)("checkout_products", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    user_id: (0, sqlite_core_1.text)("user_id").notNull().references(() => exports.users.id),
    name: (0, sqlite_core_1.text)("name").notNull(),
    description: (0, sqlite_core_1.text)("description"),
    price: (0, sqlite_core_1.real)("price").notNull(),
    currency: (0, sqlite_core_1.text)("currency").notNull().default("BRL"),
    category: (0, sqlite_core_1.text)("category"),
    features: (0, sqlite_core_1.text)("features").default(""),
    payment_mode: (0, sqlite_core_1.text)("payment_mode").default("one_time"),
    recurring_interval: (0, sqlite_core_1.text)("recurring_interval"),
    trial_period: (0, sqlite_core_1.integer)("trial_period"),
    trial_price: (0, sqlite_core_1.real)("trial_price"),
    status: (0, sqlite_core_1.text)("status").default("active"),
    created_at: (0, sqlite_core_1.text)("created_at").notNull(),
    updated_at: (0, sqlite_core_1.text)("updated_at").notNull(),
});
// Páginas de Checkout customizadas
exports.checkoutPages = (0, sqlite_core_1.sqliteTable)("checkout_pages", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    user_id: (0, sqlite_core_1.text)("user_id").notNull().references(() => exports.users.id),
    product_id: (0, sqlite_core_1.text)("product_id").notNull().references(() => exports.checkoutProducts.id),
    name: (0, sqlite_core_1.text)("name").notNull(),
    slug: (0, sqlite_core_1.text)("slug").notNull(),
    template: (0, sqlite_core_1.text)("template").default("default"),
    custom_css: (0, sqlite_core_1.text)("custom_css"),
    custom_js: (0, sqlite_core_1.text)("custom_js"),
    seo_title: (0, sqlite_core_1.text)("seo_title"),
    seo_description: (0, sqlite_core_1.text)("seo_description"),
    status: (0, sqlite_core_1.text)("status").default("active"),
    created_at: (0, sqlite_core_1.text)("created_at").notNull(),
    updated_at: (0, sqlite_core_1.text)("updated_at").notNull(),
});
// Transações de Checkout
exports.checkoutTransactions = (0, sqlite_core_1.sqliteTable)("checkout_transactions", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    user_id: (0, sqlite_core_1.text)("user_id").notNull().references(() => exports.users.id),
    product_id: (0, sqlite_core_1.text)("product_id").notNull().references(() => exports.checkoutProducts.id),
    checkout_id: (0, sqlite_core_1.text)("checkout_id"),
    customer_data: (0, sqlite_core_1.text)("customer_data").notNull(),
    total_amount: (0, sqlite_core_1.real)("total_amount").notNull(),
    currency: (0, sqlite_core_1.text)("currency").notNull().default("BRL"),
    payment_status: (0, sqlite_core_1.text)("payment_status").default("pending"),
    payment_method: (0, sqlite_core_1.text)("payment_method"),
    gateway: (0, sqlite_core_1.text)("gateway").default("stripe"),
    gateway_transaction_id: (0, sqlite_core_1.text)("gateway_transaction_id"),
    accepted_upsells: (0, sqlite_core_1.text)("accepted_upsells").default("[]"),
    created_at: (0, sqlite_core_1.text)("created_at").notNull(),
    paid_at: (0, sqlite_core_1.text)("paid_at"),
});
// Assinaturas Stripe com Trial + Recorrência
exports.stripeSubscriptions = (0, sqlite_core_1.sqliteTable)("stripe_subscriptions", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    userId: (0, sqlite_core_1.text)("userId").notNull().references(() => exports.users.id),
    stripeSubscriptionId: (0, sqlite_core_1.text)("stripeSubscriptionId").notNull().unique(),
    stripeCustomerId: (0, sqlite_core_1.text)("stripeCustomerId").notNull(),
    stripePaymentMethodId: (0, sqlite_core_1.text)("stripePaymentMethodId"),
    status: (0, sqlite_core_1.text)("status").notNull(), // trialing, active, past_due, canceled, unpaid
    planName: (0, sqlite_core_1.text)("planName").notNull(),
    planDescription: (0, sqlite_core_1.text)("planDescription"),
    activationFee: (0, sqlite_core_1.real)("activationFee").notNull(),
    monthlyPrice: (0, sqlite_core_1.real)("monthlyPrice").notNull(),
    trialDays: (0, sqlite_core_1.integer)("trialDays").notNull(),
    trialStartDate: (0, sqlite_core_1.integer)("trialStartDate", { mode: 'timestamp' }),
    trialEndDate: (0, sqlite_core_1.integer)("trialEndDate", { mode: 'timestamp' }),
    currentPeriodStart: (0, sqlite_core_1.integer)("currentPeriodStart", { mode: 'timestamp' }),
    currentPeriodEnd: (0, sqlite_core_1.integer)("currentPeriodEnd", { mode: 'timestamp' }),
    nextBillingDate: (0, sqlite_core_1.integer)("nextBillingDate", { mode: 'timestamp' }),
    canceledAt: (0, sqlite_core_1.integer)("canceledAt", { mode: 'timestamp' }),
    cancelAtPeriodEnd: (0, sqlite_core_1.integer)("cancelAtPeriodEnd", { mode: 'boolean' }).default(false),
    customerName: (0, sqlite_core_1.text)("customerName"),
    customerEmail: (0, sqlite_core_1.text)("customerEmail"),
    activationInvoiceId: (0, sqlite_core_1.text)("activationInvoiceId"),
    metadata: (0, sqlite_core_1.text)("metadata", { mode: 'json' }),
    createdAt: (0, sqlite_core_1.integer)("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
// Analytics de Checkout
exports.checkoutAnalytics = (0, sqlite_core_1.sqliteTable)("checkout_analytics", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    user_id: (0, sqlite_core_1.text)("user_id").notNull().references(() => exports.users.id),
    product_id: (0, sqlite_core_1.text)("product_id").notNull().references(() => exports.checkoutProducts.id),
    page_id: (0, sqlite_core_1.text)("page_id").references(() => exports.checkoutPages.id),
    event_type: (0, sqlite_core_1.text)("event_type").notNull(),
    event_data: (0, sqlite_core_1.text)("event_data"),
    ip_address: (0, sqlite_core_1.text)("ip_address"),
    user_agent: (0, sqlite_core_1.text)("user_agent"),
    referrer: (0, sqlite_core_1.text)("referrer"),
    created_at: (0, sqlite_core_1.text)("created_at").notNull(),
});
// Checkout Builder Zod Schemas
exports.insertCheckoutProductSchema = (0, drizzle_zod_1.createInsertSchema)(exports.checkoutProducts);
exports.insertCheckoutPageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.checkoutPages);
exports.insertCheckoutTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.checkoutTransactions);
exports.insertCheckoutAnalyticsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.checkoutAnalytics);
// Subscription Plans Schema
exports.subscriptionPlans = (0, sqlite_core_1.sqliteTable)("subscription_plans", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    name: (0, sqlite_core_1.text)("name").notNull(),
    price: (0, sqlite_core_1.real)("price").notNull(),
    currency: (0, sqlite_core_1.text)("currency").default("BRL"),
    billingInterval: (0, sqlite_core_1.text)("billingInterval").notNull(), // monthly, yearly
    features: (0, sqlite_core_1.text)("features", { mode: 'json' }).notNull(),
    limits: (0, sqlite_core_1.text)("limits", { mode: 'json' }).notNull(),
    stripePriceId: (0, sqlite_core_1.text)("stripePriceId"),
    isActive: (0, sqlite_core_1.integer)("isActive", { mode: 'boolean' }).default(true),
    createdAt: (0, sqlite_core_1.integer)("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
// Subscription Transactions Schema
exports.subscriptionTransactions = (0, sqlite_core_1.sqliteTable)("subscription_transactions", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    userId: (0, sqlite_core_1.text)("userId").notNull().references(() => exports.users.id),
    planId: (0, sqlite_core_1.text)("planId").notNull().references(() => exports.subscriptionPlans.id),
    stripePaymentIntentId: (0, sqlite_core_1.text)("stripePaymentIntentId"),
    stripeSubscriptionId: (0, sqlite_core_1.text)("stripeSubscriptionId"),
    amount: (0, sqlite_core_1.real)("amount").notNull(),
    currency: (0, sqlite_core_1.text)("currency").default("BRL"),
    status: (0, sqlite_core_1.text)("status").notNull(), // pending, completed, failed, refunded
    paymentMethod: (0, sqlite_core_1.text)("paymentMethod").default("stripe"),
    metadata: (0, sqlite_core_1.text)("metadata", { mode: 'json' }),
    createdAt: (0, sqlite_core_1.integer)("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updatedAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
// Credit Transactions Schema
exports.creditTransactions = (0, sqlite_core_1.sqliteTable)("credit_transactions", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    userId: (0, sqlite_core_1.text)("userId").notNull().references(() => exports.users.id),
    type: (0, sqlite_core_1.text)("type").notNull(), // sms, email, whatsapp, ai
    amount: (0, sqlite_core_1.integer)("amount").notNull(),
    operation: (0, sqlite_core_1.text)("operation").notNull(), // add, subtract
    reason: (0, sqlite_core_1.text)("reason").notNull(),
    metadata: (0, sqlite_core_1.text)("metadata", { mode: 'json' }),
    createdAt: (0, sqlite_core_1.integer)("createdAt", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
// Subscription Plans Zod Schemas
exports.insertSubscriptionPlanSchema = (0, drizzle_zod_1.createInsertSchema)(exports.subscriptionPlans);
exports.insertSubscriptionTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.subscriptionTransactions);
exports.insertCreditTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.creditTransactions);
// =============================================
// FORUM SYSTEM TABLES
// =============================================
// Forum Categories
exports.forumCategoriesTable = (0, sqlite_core_1.sqliteTable)("forum_categories", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => (0, nanoid_1.nanoid)()),
    name: (0, sqlite_core_1.text)("name").notNull(),
    description: (0, sqlite_core_1.text)("description"),
    icon: (0, sqlite_core_1.text)("icon"),
    color: (0, sqlite_core_1.text)("color"),
    isRestricted: (0, sqlite_core_1.integer)("is_restricted", { mode: "boolean" }).default(false),
    moderators: (0, sqlite_core_1.text)("moderators", { mode: "json" }).$type().default([]),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
// Forum Topics
exports.forumTopicsTable = (0, sqlite_core_1.sqliteTable)("forum_topics", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => (0, nanoid_1.nanoid)()),
    title: (0, sqlite_core_1.text)("title").notNull(),
    content: (0, sqlite_core_1.text)("content").notNull(),
    categoryId: (0, sqlite_core_1.text)("category_id").notNull().references(() => exports.forumCategoriesTable.id),
    authorId: (0, sqlite_core_1.text)("author_id").notNull().references(() => exports.users.id),
    isPinned: (0, sqlite_core_1.integer)("is_pinned", { mode: "boolean" }).default(false),
    isLocked: (0, sqlite_core_1.integer)("is_locked", { mode: "boolean" }).default(false),
    views: (0, sqlite_core_1.integer)("views").default(0),
    likes: (0, sqlite_core_1.integer)("likes").default(0),
    dislikes: (0, sqlite_core_1.integer)("dislikes").default(0),
    tags: (0, sqlite_core_1.text)("tags", { mode: "json" }).$type().default([]),
    status: (0, sqlite_core_1.text)("status").notNull().default("active"), // active, closed, resolved
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
// Forum Replies
exports.forumRepliesTable = (0, sqlite_core_1.sqliteTable)("forum_replies", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => (0, nanoid_1.nanoid)()),
    topicId: (0, sqlite_core_1.text)("topic_id").notNull().references(() => exports.forumTopicsTable.id),
    authorId: (0, sqlite_core_1.text)("author_id").notNull().references(() => exports.users.id),
    content: (0, sqlite_core_1.text)("content").notNull(),
    parentReplyId: (0, sqlite_core_1.text)("parent_reply_id").references(() => exports.forumRepliesTable.id),
    likes: (0, sqlite_core_1.integer)("likes").default(0),
    dislikes: (0, sqlite_core_1.integer)("dislikes").default(0),
    isModerated: (0, sqlite_core_1.integer)("is_moderated", { mode: "boolean" }).default(false),
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
// Forum Likes
exports.forumLikesTable = (0, sqlite_core_1.sqliteTable)("forum_likes", {
    id: (0, sqlite_core_1.text)("id").primaryKey().$defaultFn(() => (0, nanoid_1.nanoid)()),
    userId: (0, sqlite_core_1.text)("user_id").notNull().references(() => exports.users.id),
    targetId: (0, sqlite_core_1.text)("target_id").notNull(), // topic_id or reply_id
    targetType: (0, sqlite_core_1.text)("target_type").notNull(), // 'topic' or 'reply'
    isLike: (0, sqlite_core_1.integer)("is_like", { mode: "boolean" }).notNull(), // true for like, false for dislike
    createdAt: (0, sqlite_core_1.integer)("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
// Forum Zod Schemas
exports.insertForumCategorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.forumCategoriesTable);
exports.insertForumTopicSchema = (0, drizzle_zod_1.createInsertSchema)(exports.forumTopicsTable);
exports.insertForumReplySchema = (0, drizzle_zod_1.createInsertSchema)(exports.forumRepliesTable);
exports.insertForumLikeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.forumLikesTable);
// COURSES ZOD SCHEMAS
exports.insertCourseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.courses);
exports.insertLessonSchema = (0, drizzle_zod_1.createInsertSchema)(exports.lessons);
exports.insertEnrollmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.enrollments);
exports.insertLessonProgressSchema = (0, drizzle_zod_1.createInsertSchema)(exports.lessonProgress);
exports.insertCoursePushSubscriptionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.coursePushSubscriptions);
exports.insertScheduledCourseNotificationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.scheduledCourseNotifications);
exports.insertCourseNotificationTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.courseNotificationTemplates);
