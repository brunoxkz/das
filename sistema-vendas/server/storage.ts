import { db } from './db.js';
import { users, products, orders, orderItems, orderLogs } from '../shared/schema.js';
import { eq, and, desc, asc, sql, gte, lte, count, sum } from 'drizzle-orm';
import type { 
  User, InsertUser, Product, InsertProduct, Order, InsertOrder, 
  OrderItem, InsertOrderItem, OrderLog, OrderWithDetails, DashboardStats,
  UpdateOrderStatus
} from '../shared/schema.js';
import bcrypt from 'bcryptjs';

export interface IStorage {
  // Auth
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  
  // Products
  getAllProducts(): Promise<Product[]>;
  getActiveProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(productData: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Orders
  getOrdersByAttendant(attendantId: string, limit?: number): Promise<OrderWithDetails[]>;
  getAllOrders(limit?: number): Promise<OrderWithDetails[]>;
  getOrder(id: string): Promise<OrderWithDetails | undefined>;
  createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(orderId: string, statusData: UpdateOrderStatus, userId: string): Promise<Order>;
  getOrdersByStatus(status: string): Promise<OrderWithDetails[]>;
  getOrdersByDateRange(startDate: Date, endDate: Date, attendantId?: string): Promise<OrderWithDetails[]>;
  getTodayOrders(attendantId?: string): Promise<OrderWithDetails[]>;
  getAwaitingConfirmationOrders(): Promise<OrderWithDetails[]>;
  
  // Analytics
  getDashboardStats(attendantId?: string): Promise<DashboardStats>;
  getRevenueByPeriod(startDate: Date, endDate: Date, attendantId?: string): Promise<number>;
  getOrderCountByStatus(attendantId?: string): Promise<Record<string, number>>;
  
  // Logs
  createOrderLog(logData: Omit<OrderLog, 'id' | 'timestamp'>): Promise<OrderLog>;
  getOrderLogs(orderId: string): Promise<OrderLog[]>;
}

export class SQLiteStorage implements IStorage {
  // Auth methods
  async getUserByUsername(username: string): Promise<User | undefined> {
    console.log('🔍 Storage.getUserByUsername - searching for:', username);
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      console.log('👤 Storage.getUserByUsername - found:', user ? `${user.username} (active: ${user.isActive})` : 'NO USER');
      if (user) {
        console.log('🔐 Storage.getUserByUsername - password hash:', user.password.substring(0, 20) + '...');
      }
      return user;
    } catch (error) {
      console.error('❌ Storage.getUserByUsername - error:', error);
      throw error;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await db.insert(users).values({
      ...userData,
      id: crypto.randomUUID(),
      password: hashedPassword,
    }).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const updateData: any = { ...updates };
    if (updates.password) {
      updateData.password = await bcrypt.hash(updates.password, 10);
    }
    updateData.updatedAt = new Date();
    
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.name));
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(asc(products.name));
  }

  async getActiveProducts(): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.isActive, true))
      .orderBy(asc(products.name));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values({
      ...productData,
      id: crypto.randomUUID(),
    }).returning();
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Order methods
  async getOrdersByAttendant(attendantId: string, limit: number = 50): Promise<OrderWithDetails[]> {
    const ordersData = await db.query.orders.findMany({
      where: eq(orders.attendantId, attendantId),
      with: {
        attendant: {
          columns: { id: true, name: true, username: true }
        },
        items: {
          with: {
            product: true
          }
        }
      },
      orderBy: [desc(orders.createdAt)],
      limit
    });
    return ordersData as OrderWithDetails[];
  }

  async getAllOrders(limit: number = 100): Promise<OrderWithDetails[]> {
    const ordersData = await db.query.orders.findMany({
      with: {
        attendant: {
          columns: { id: true, name: true, username: true }
        },
        items: {
          with: {
            product: true
          }
        }
      },
      orderBy: [desc(orders.createdAt)],
      limit
    });
    return ordersData as OrderWithDetails[];
  }

  async getOrder(id: string): Promise<OrderWithDetails | undefined> {
    const orderData = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        attendant: {
          columns: { id: true, name: true, username: true }
        },
        items: {
          with: {
            product: true
          }
        }
      }
    });
    return orderData as OrderWithDetails | undefined;
  }

  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      const orderId = crypto.randomUUID();
      
      // Create order
      const [order] = await tx.insert(orders).values({
        ...orderData,
        id: orderId,
      }).returning();

      // Create order items
      for (const item of items) {
        await tx.insert(orderItems).values({
          ...item,
          id: crypto.randomUUID(),
          orderId: orderId,
        });
      }

      // Create log entry
      await tx.insert(orderLogs).values({
        id: crypto.randomUUID(),
        orderId: orderId,
        userId: orderData.attendantId,
        action: 'created',
        newValue: 'pending',
        notes: 'Pedido criado',
      });

      return order;
    });
  }

  async updateOrderStatus(orderId: string, statusData: UpdateOrderStatus, userId: string): Promise<Order> {
    return await db.transaction(async (tx) => {
      // Get current order
      const [currentOrder] = await tx.select().from(orders).where(eq(orders.id, orderId));
      if (!currentOrder) {
        throw new Error('Order not found');
      }

      const updateData: any = {
        status: statusData.status,
        updatedAt: new Date(),
      };

      if (statusData.notes) updateData.notes = statusData.notes;
      if (statusData.cancellationReason) updateData.cancellationReason = statusData.cancellationReason;
      if (statusData.reschedulingReason) updateData.reschedulingReason = statusData.reschedulingReason;
      if (statusData.newDeliveryDate) updateData.deliveryDate = new Date(statusData.newDeliveryDate);
      if (statusData.status === 'delivered') updateData.actualDeliveryDate = new Date();

      // Update order
      const [updatedOrder] = await tx.update(orders).set(updateData).where(eq(orders.id, orderId)).returning();

      // Create log entry
      await tx.insert(orderLogs).values({
        id: crypto.randomUUID(),
        orderId: orderId,
        userId: userId,
        action: 'status_changed',
        previousValue: currentOrder.status,
        newValue: statusData.status,
        notes: statusData.notes || `Status alterado para ${statusData.status}`,
      });

      return updatedOrder;
    });
  }

  async getOrdersByStatus(status: string): Promise<OrderWithDetails[]> {
    const ordersData = await db.query.orders.findMany({
      where: eq(orders.status, status),
      with: {
        attendant: {
          columns: { id: true, name: true, username: true }
        },
        items: {
          with: {
            product: true
          }
        }
      },
      orderBy: [desc(orders.createdAt)]
    });
    return ordersData as OrderWithDetails[];
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date, attendantId?: string): Promise<OrderWithDetails[]> {
    const conditions = [
      gte(orders.orderDate, startDate),
      lte(orders.orderDate, endDate)
    ];

    if (attendantId) {
      conditions.push(eq(orders.attendantId, attendantId));
    }

    const ordersData = await db.query.orders.findMany({
      where: and(...conditions),
      with: {
        attendant: {
          columns: { id: true, name: true, username: true }
        },
        items: {
          with: {
            product: true
          }
        }
      },
      orderBy: [desc(orders.createdAt)]
    });
    return ordersData as OrderWithDetails[];
  }

  async getTodayOrders(attendantId?: string): Promise<OrderWithDetails[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getOrdersByDateRange(today, tomorrow, attendantId);
  }

  async getAwaitingConfirmationOrders(): Promise<OrderWithDetails[]> {
    const now = new Date();
    const ordersData = await db.query.orders.findMany({
      where: and(
        eq(orders.status, 'in_route'),
        lte(orders.deliveryDate, now)
      ),
      with: {
        attendant: {
          columns: { id: true, name: true, username: true }
        },
        items: {
          with: {
            product: true
          }
        }
      },
      orderBy: [asc(orders.deliveryDate)]
    });
    return ordersData as OrderWithDetails[];
  }

  // Analytics methods
  async getDashboardStats(attendantId?: string): Promise<DashboardStats> {
    const conditions = attendantId ? [eq(orders.attendantId, attendantId)] : [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayConditions = [...conditions, gte(orders.orderDate, today), lte(orders.orderDate, tomorrow)];

    const [
      totalOrdersResult,
      todayOrdersResult,
      pendingDeliveriesResult,
      awaitingConfirmationResult,
      totalRevenueResult,
      todayRevenueResult
    ] = await Promise.all([
      db.select({ count: count() }).from(orders).where(conditions.length > 0 ? and(...conditions) : undefined),
      db.select({ count: count() }).from(orders).where(and(...todayConditions)),
      db.select({ count: count() }).from(orders).where(and(...conditions, eq(orders.status, 'in_route'))),
      db.select({ count: count() }).from(orders).where(and(...conditions, eq(orders.status, 'awaiting_confirmation'))),
      db.select({ sum: sum(orders.totalAmount) }).from(orders).where(and(...conditions, eq(orders.status, 'delivered'))),
      db.select({ sum: sum(orders.totalAmount) }).from(orders).where(and(...todayConditions, eq(orders.status, 'delivered')))
    ]);

    return {
      totalOrders: totalOrdersResult[0]?.count || 0,
      todayOrders: todayOrdersResult[0]?.count || 0,
      pendingDeliveries: pendingDeliveriesResult[0]?.count || 0,
      awaitingConfirmation: awaitingConfirmationResult[0]?.count || 0,
      totalRevenue: Number(totalRevenueResult[0]?.sum || 0),
      todayRevenue: Number(todayRevenueResult[0]?.sum || 0),
    };
  }

  async getRevenueByPeriod(startDate: Date, endDate: Date, attendantId?: string): Promise<number> {
    const conditions = [
      gte(orders.orderDate, startDate),
      lte(orders.orderDate, endDate),
      eq(orders.status, 'delivered')
    ];

    if (attendantId) {
      conditions.push(eq(orders.attendantId, attendantId));
    }

    const [result] = await db.select({ sum: sum(orders.totalAmount) })
      .from(orders)
      .where(and(...conditions));

    return Number(result?.sum || 0);
  }

  async getOrderCountByStatus(attendantId?: string): Promise<Record<string, number>> {
    const conditions = attendantId ? [eq(orders.attendantId, attendantId)] : [];
    
    const results = await db.select({
      status: orders.status,
      count: count()
    }).from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(orders.status);

    const statusCounts: Record<string, number> = {};
    results.forEach(result => {
      statusCounts[result.status] = result.count;
    });

    return statusCounts;
  }

  // Log methods
  async createOrderLog(logData: Omit<OrderLog, 'id' | 'timestamp'>): Promise<OrderLog> {
    const [log] = await db.insert(orderLogs).values({
      ...logData,
      id: crypto.randomUUID(),
    }).returning();
    return log;
  }

  async getOrderLogs(orderId: string): Promise<OrderLog[]> {
    return await db.select().from(orderLogs)
      .where(eq(orderLogs.orderId, orderId))
      .orderBy(desc(orderLogs.timestamp));
  }
}

export const storage = new SQLiteStorage();