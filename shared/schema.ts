import { sql } from 'drizzle-orm';
import { 
  integer, 
  text, 
  boolean,
  timestamp,
  pgTable,
  varchar,
  json
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Site Content Management
export const siteContent = pgTable('site_content', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  section: varchar('section', { length: 100 }).notNull(), // hero, about, services, etc
  title: text('title'),
  subtitle: text('subtitle'),
  content: text('content'),
  buttonText: text('button_text'),
  buttonUrl: text('button_url'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Latest News Management
export const news = pgTable('news', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  content: text('content'),
  imageUrl: text('image_url'),
  category: varchar('category', { length: 50 }).default('Press release'),
  publishedAt: timestamp('published_at').defaultNow(),
  isPublished: boolean('is_published').default(true),
  author: varchar('author', { length: 100 }).default('B2C2'),
  slug: varchar('slug', { length: 200 }).unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Events Management
export const events = pgTable('events', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  title: text('title').notNull(),
  description: text('description'),
  eventDate: timestamp('event_date').notNull(),
  location: text('location'),
  imageUrl: text('image_url'),
  registrationUrl: text('registration_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Institutional Solutions Management
export const solutions = pgTable('solutions', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  title: text('title').notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }).default('check'),
  color: varchar('color', { length: 50 }).default('purple'),
  url: text('url'),
  isActive: boolean('is_active').default(true),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Institutional Insights Management
export const insights = pgTable('insights', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  content: text('content'),
  imageUrl: text('image_url'),
  category: varchar('category', { length: 50 }).default('Thought leadership'),
  publishedAt: timestamp('published_at').defaultNow(),
  isPublished: boolean('is_published').default(true),
  readTime: integer('read_time').default(5),
  slug: varchar('slug', { length: 200 }).unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Newsletter Subscriptions
export const newsletter = pgTable('newsletter', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  isActive: boolean('is_active').default(true),
  source: varchar('source', { length: 50 }).default('website'),
  subscribedAt: timestamp('subscribed_at').defaultNow(),
  unsubscribedAt: timestamp('unsubscribed_at')
});

// Admin Users
export const adminUsers = pgTable('admin_users', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  role: varchar('role', { length: 50 }).default('admin'),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Site Settings
export const siteSettings = pgTable('site_settings', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value'),
  type: varchar('type', { length: 50 }).default('text'), // text, boolean, json, number
  description: text('description'),
  group: varchar('group', { length: 50 }).default('general'),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Insert Schemas
export const insertSiteContent = createInsertSchema(siteContent);
export const insertNews = createInsertSchema(news);
export const insertEvents = createInsertSchema(events);
export const insertSolutions = createInsertSchema(solutions);
export const insertInsights = createInsertSchema(insights);
export const insertNewsletter = createInsertSchema(newsletter);
export const insertAdminUser = createInsertSchema(adminUsers);
export const insertSiteSettings = createInsertSchema(siteSettings);

// Types
export type SiteContent = typeof siteContent.$inferSelect;
export type InsertSiteContent = z.infer<typeof insertSiteContent>;
export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNews>;
export type Events = typeof events.$inferSelect;
export type InsertEvents = z.infer<typeof insertEvents>;
export type Solutions = typeof solutions.$inferSelect;
export type InsertSolutions = z.infer<typeof insertSolutions>;
export type Insights = typeof insights.$inferSelect;
export type InsertInsights = z.infer<typeof insertInsights>;
export type Newsletter = typeof newsletter.$inferSelect;
export type InsertNewsletter = z.infer<typeof insertNewsletter>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUser>;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettings>;