import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  serial,
  uuid,
  numeric,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for JWT Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  password: varchar("password"), // For JWT auth
  refreshToken: text("refresh_token"), // For JWT refresh
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user").notNull(), // admin, user
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default("inactive"),
  plan: varchar("plan").default("free").notNull(), // free, invited, plus
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quiz templates
export const quizTemplates = pgTable("quiz_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  thumbnail: varchar("thumbnail"),
  structure: jsonb("structure").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User quizzes
export const quizzes = pgTable("quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  templateId: integer("template_id").references(() => quizTemplates.id),
  title: varchar("title").notNull(),
  description: text("description"),
  structure: jsonb("structure").notNull(),
  settings: jsonb("settings").default("{}"),
  isPublished: boolean("is_published").default(false),
  embedCode: text("embed_code"),
  // Tracking pixels and scripts
  facebookPixel: varchar("facebook_pixel"),
  googlePixel: varchar("google_pixel"),
  ga4Id: varchar("ga4_id"),
  customHeadScript: text("custom_head_script"),
  // Branding and customization
  brandingLogo: varchar("branding_logo"), // URL da logo que fica flutuando
  progressBarColor: varchar("progress_bar_color").default("#10b981"), // Cor da barra de progresso
  buttonColor: varchar("button_color").default("#10b981"), // Cor dos botões
  favicon: varchar("favicon"), // URL do favicon
  seoTitle: varchar("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: varchar("seo_keywords"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quiz responses/leads
export const quizResponses = pgTable("quiz_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id").references(() => quizzes.id).notNull(),
  email: varchar("email"),
  name: varchar("name"),
  phone: varchar("phone"),
  responses: jsonb("responses").notNull(),
  result: jsonb("result"),
  score: numeric("score"),
  completedAt: timestamp("completed_at").defaultNow(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
});

// Quiz analytics
export const quizAnalytics = pgTable("quiz_analytics", {
  id: serial("id").primaryKey(),
  quizId: uuid("quiz_id").references(() => quizzes.id).notNull(),
  date: timestamp("date").defaultNow(),
  views: integer("views").default(0),
  starts: integer("starts").default(0),
  completions: integer("completions").default(0),
  leads: integer("leads").default(0),
  conversionRate: numeric("conversion_rate").default("0"),
});

// Produtos físicos para afiliação
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  description: text("description"),
  image: varchar("image"), // URL da imagem do produto
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull(), // Porcentagem de comissão
  commissionValue: numeric("commission_value", { precision: 10, scale: 2 }), // Valor fixo da comissão
  category: varchar("category"),
  brand: varchar("brand"),
  affiliateLink: text("affiliate_link"), // Link para onde o usuário será redirecionado
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Afiliações dos usuários aos produtos
export const affiliations = pgTable("affiliations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  status: varchar("status").default("active").notNull(), // active, paused, cancelled
  affiliateCode: varchar("affiliate_code").unique(), // Código único do afiliado para tracking
  customLink: text("custom_link"), // Link personalizado gerado
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema exports
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertQuizTemplateSchema = createInsertSchema(quizTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  structure: z.any().optional(),
  settings: z.any().optional(),
});

export const insertQuizResponseSchema = createInsertSchema(quizResponses).omit({
  id: true,
  completedAt: true,
});

export const insertQuizAnalyticsSchema = createInsertSchema(quizAnalytics).omit({
  id: true,
  date: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAffiliationSchema = createInsertSchema(affiliations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertQuizTemplate = z.infer<typeof insertQuizTemplateSchema>;
export type QuizTemplate = typeof quizTemplates.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuizResponse = z.infer<typeof insertQuizResponseSchema>;
export type QuizResponse = typeof quizResponses.$inferSelect;
export type InsertQuizAnalytics = z.infer<typeof insertQuizAnalyticsSchema>;
export type QuizAnalytics = typeof quizAnalytics.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertAffiliation = z.infer<typeof insertAffiliationSchema>;
export type Affiliation = typeof affiliations.$inferSelect;
