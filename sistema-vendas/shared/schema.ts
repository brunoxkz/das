import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';
import { pgTable, varchar, timestamp, decimal, uuid as pgUuid, text as pgText, integer as pgInteger, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// SQLite Tables
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: text('role', { enum: ['admin', 'attendant'] }).notNull().default('attendant'),
  whatsappNumber: text('whatsapp_number'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  category: text('category'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  attendantId: text('attendant_id').notNull().references(() => users.id),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  whatsappNumber: text('whatsapp_number').notNull(),
  paymentMethod: text('payment_method', { enum: ['logzz', 'online', 'braip'] }).notNull(),
  status: text('status', { 
    enum: ['pending', 'preparing', 'in_route', 'awaiting_confirmation', 'delivered', 'rescheduled', 'cancelled'] 
  }).notNull().default('pending'),
  totalAmount: real('total_amount').notNull(),
  orderDate: integer('order_date', { mode: 'timestamp' }).notNull(),
  deliveryDate: integer('delivery_date', { mode: 'timestamp' }).notNull(),
  actualDeliveryDate: integer('actual_delivery_date', { mode: 'timestamp' }),
  notes: text('notes'),
  cancellationReason: text('cancellation_reason'),
  reschedulingReason: text('rescheduling_reason'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id),
  productName: text('product_name').notNull(), // Denormalized for history
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  totalPrice: real('total_price').notNull(),
});

export const orderLogs = sqliteTable('order_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id),
  action: text('action').notNull(), // 'created', 'status_changed', 'rescheduled', 'cancelled', 'delivered'
  previousValue: text('previous_value'),
  newValue: text('new_value'),
  notes: text('notes'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// PostgreSQL Tables (for migration)
export const usersPg = pgTable('users', {
  id: pgUuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('attendant'),
  whatsappNumber: varchar('whatsapp_number', { length: 20 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const productsPg = pgTable('products', {
  id: pgUuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: pgText('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: varchar('category', { length: 100 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const ordersPg = pgTable('orders', {
  id: pgUuid('id').primaryKey().defaultRandom(),
  attendantId: pgUuid('attendant_id').notNull().references(() => usersPg.id),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 20 }).notNull(),
  whatsappNumber: varchar('whatsapp_number', { length: 20 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 20 }).notNull(),
  status: varchar('status', { length: 30 }).notNull().default('pending'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  orderDate: timestamp('order_date').notNull(),
  deliveryDate: timestamp('delivery_date').notNull(),
  actualDeliveryDate: timestamp('actual_delivery_date'),
  notes: pgText('notes'),
  cancellationReason: pgText('cancellation_reason'),
  reschedulingReason: pgText('rescheduling_reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  orderLogs: many(orderLogs),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  attendant: one(users, {
    fields: [orders.attendantId],
    references: [users.id],
  }),
  items: many(orderItems),
  logs: many(orderLogs),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const orderLogsRelations = relations(orderLogs, ({ one }) => ({
  order: one(orders, {
    fields: [orderLogs.orderId],
    references: [orders.id],
  }),
  user: one(users, {
    fields: [orderLogs.userId],
    references: [users.id],
  }),
}));

// Zod Schemas
export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  name: z.string().min(2).max(100),
  whatsappNumber: z.string().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertProductSchema = createInsertSchema(products, {
  name: z.string().min(1).max(255),
  price: z.number().positive(),
  category: z.string().optional(),
}).omit({ id: true, createdAt: true });

export const insertOrderSchema = createInsertSchema(orders, {
  customerName: z.string().min(2).max(255),
  customerPhone: z.string().min(10).max(20),
  whatsappNumber: z.string().min(10).max(20),
  totalAmount: z.number().positive(),
  notes: z.string().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertOrderItemSchema = createInsertSchema(orderItems, {
  quantity: z.number().positive().int(),
  unitPrice: z.number().positive(),
  totalPrice: z.number().positive(),
}).omit({ id: true });

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'preparing', 'in_route', 'awaiting_confirmation', 'delivered', 'rescheduled', 'cancelled']),
  notes: z.string().optional(),
  cancellationReason: z.string().optional(),
  reschedulingReason: z.string().optional(),
  newDeliveryDate: z.string().datetime().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderLog = typeof orderLogs.$inferSelect;
export type UpdateOrderStatus = z.infer<typeof updateOrderStatusSchema>;

export type OrderWithDetails = Order & {
  attendant: Pick<User, 'id' | 'name' | 'username'>;
  items: (OrderItem & { product?: Product })[];
};

export type DashboardStats = {
  totalOrders: number;
  todayOrders: number;
  pendingDeliveries: number;
  awaitingConfirmation: number;
  totalRevenue: number;
  todayRevenue: number;
};