import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';
import { pgTable, varchar, text as pgText, integer as pgInteger, real as pgReal, timestamp, serial, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Detect database type for cross-compatible schemas
const isPostgreSQL = process.env.DATABASE_URL?.includes('postgresql');

// Users table - Cross-compatible
export const users = isPostgreSQL 
  ? pgTable('users', {
      id: serial('id').primaryKey(),
      uuid: uuid('uuid').defaultRandom().unique().notNull(),
      name: varchar('name', { length: 255 }).notNull(),
      email: varchar('email', { length: 255 }).unique().notNull(),
      phone: varchar('phone', { length: 20 }),
      status: varchar('status', { length: 20 }).default('active'),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    })
  : sqliteTable('users', {
      id: integer('id').primaryKey({ autoIncrement: true }),
      uuid: text('uuid').unique().notNull().$defaultFn(() => Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36)),
      name: text('name').notNull(),
      email: text('email').unique().notNull(),
      phone: text('phone'),
      status: text('status').default('active'),
      createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
      updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    });

// Products table - Cross-compatible
export const products = isPostgreSQL
  ? pgTable('products', {
      id: serial('id').primaryKey(),
      uuid: uuid('uuid').defaultRandom().unique().notNull(),
      name: varchar('name', { length: 255 }).notNull(),
      description: pgText('description'),
      price: pgReal('price').notNull(),
      category: varchar('category', { length: 100 }),
      inStock: pgInteger('in_stock').default(0),
      isActive: varchar('is_active', { length: 10 }).default('true'),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    })
  : sqliteTable('products', {
      id: integer('id').primaryKey({ autoIncrement: true }),
      uuid: text('uuid').unique().notNull().$defaultFn(() => Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36)),
      name: text('name').notNull(),
      description: text('description'),
      price: real('price').notNull(),
      category: text('category'),
      inStock: integer('in_stock').default(0),
      isActive: text('is_active').default('true'),
      createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
      updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    });

// Orders table - Cross-compatible
export const orders = isPostgreSQL
  ? pgTable('orders', {
      id: serial('id').primaryKey(),
      uuid: uuid('uuid').defaultRandom().unique().notNull(),
      userId: pgInteger('user_id').references(() => users.id).notNull(),
      total: pgReal('total').notNull(),
      status: varchar('status', { length: 50 }).default('pending'),
      notes: pgText('notes'),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    })
  : sqliteTable('orders', {
      id: integer('id').primaryKey({ autoIncrement: true }),
      uuid: text('uuid').unique().notNull().$defaultFn(() => Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36)),
      userId: integer('user_id').references(() => users.id).notNull(),
      total: real('total').notNull(),
      status: text('status').default('pending'),
      notes: text('notes'),
      createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
      updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    });

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  uuid: true,
  createdAt: true,
  updatedAt: true,
});

export const selectUserSchema = createSelectSchema(users);

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  uuid: true,
  createdAt: true,
  updatedAt: true,
});

export const selectProductSchema = createSelectSchema(products);

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  uuid: true,
  createdAt: true,
  updatedAt: true,
});

export const selectOrderSchema = createSelectSchema(orders);

// TypeScript types
export type User = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = z.infer<typeof selectProductSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = z.infer<typeof selectOrderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Export all tables for Drizzle
export const schema = {
  users,
  products,
  orders,
};