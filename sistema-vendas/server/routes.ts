import { Router } from 'express';
import { storage } from './storage.js';
import { AuthService, authenticate, adminOnly, ownerOrAdmin, type AuthenticatedRequest } from './auth.js';
import { insertUserSchema, insertProductSchema, insertOrderSchema, updateOrderStatusSchema } from '../shared/schema.js';
import { z } from 'zod';

const router = Router();

// Auth routes
router.post('/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body);
    const { username, password } = req.body;
    
    if (!username || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }

    console.log('🔍 Attempting login for:', username);
    const authResponse = await AuthService.login(username, password);
    console.log('✅ Login successful for:', username);
    res.json(authResponse);
  } catch (error) {
    console.log('❌ Login failed:', error instanceof Error ? error.message : error);
    res.status(401).json({ error: error instanceof Error ? error.message : 'Erro de autenticação' });
  }
});

router.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token é obrigatório' });
    }

    const authResponse = await AuthService.refreshToken(refreshToken);
    res.json(authResponse);
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : 'Token inválido' });
  }
});

router.get('/auth/me', authenticate, async (req: AuthenticatedRequest, res) => {
  const { password, ...userWithoutPassword } = req.user!;
  res.json({ user: userWithoutPassword });
});

// User management routes (admin only)
router.get('/users', authenticate, adminOnly, async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    const usersWithoutPassword = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

router.post('/users', authenticate, adminOnly, async (req, res) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    const user = await storage.createUser(userData);
    const { password, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

router.put('/users/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = insertUserSchema.partial().parse(req.body);
    const user = await storage.updateUser(id, updates);
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

router.delete('/users/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

// Product routes
router.get('/products', authenticate, async (req, res) => {
  try {
    const products = await storage.getActiveProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

router.get('/products/all', authenticate, adminOnly, async (req, res) => {
  try {
    const products = await storage.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

router.post('/products', authenticate, adminOnly, async (req, res) => {
  try {
    const productData = insertProductSchema.parse(req.body);
    const product = await storage.createProduct(productData);
    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

router.put('/products/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = insertProductSchema.partial().parse(req.body);
    const product = await storage.updateProduct(id, updates);
    res.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// Order routes
router.get('/orders', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { limit } = req.query;
    const user = req.user!;
    
    let orders;
    if (user.role === 'admin') {
      orders = await storage.getAllOrders(limit ? parseInt(limit as string) : undefined);
    } else {
      orders = await storage.getOrdersByAttendant(user.id, limit ? parseInt(limit as string) : undefined);
    }
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

router.get('/orders/today', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const orders = await storage.getTodayOrders(user.role === 'admin' ? undefined : user.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos de hoje' });
  }
});

// Dashboard stats route
router.get('/dashboard/stats', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const attendantId = req.user!.role === 'admin' ? undefined : req.user!.id;
    const stats = await storage.getDashboardStats(attendantId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas do dashboard' });
  }
});

router.get('/orders/awaiting-confirmation', authenticate, async (req, res) => {
  try {
    const orders = await storage.getAwaitingConfirmationOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos aguardando confirmação' });
  }
});

router.get('/orders/status/:status', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { status } = req.params;
    const user = req.user!;
    
    let orders = await storage.getOrdersByStatus(status);
    
    // Filter by attendant if not admin
    if (user.role !== 'admin') {
      orders = orders.filter(order => order.attendantId === user.id);
    }
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos por status' });
  }
});

router.get('/orders/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    
    const order = await storage.getOrder(id);
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    // Check if user can access this order
    if (user.role !== 'admin' && order.attendantId !== user.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
});

const createOrderSchema = z.object({
  order: insertOrderSchema,
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive().int(),
    unitPrice: z.number().positive(),
  })).min(1)
});

router.post('/orders', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { order: orderData, items: itemsData } = createOrderSchema.parse(req.body);
    const user = req.user!;
    
    // Ensure attendant can only create orders for themselves
    if (user.role !== 'admin' && orderData.attendantId !== user.id) {
      return res.status(403).json({ error: 'Você só pode criar pedidos para si mesmo' });
    }
    
    // Validate products and calculate total
    let totalAmount = 0;
    const items = [];
    
    for (const item of itemsData) {
      const product = await storage.getProduct(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({ error: `Produto ${item.productId} não encontrado ou inativo` });
      }
      
      const totalPrice = item.quantity * item.unitPrice;
      totalAmount += totalPrice;
      
      items.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
      });
    }
    
    const order = await storage.createOrder({
      ...orderData,
      totalAmount,
    }, items);
    
    res.status(201).json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

router.patch('/orders/:id/status', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const statusData = updateOrderStatusSchema.parse(req.body);
    const user = req.user!;
    
    // Check if order exists and user can modify it
    const order = await storage.getOrder(id);
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    if (user.role !== 'admin' && order.attendantId !== user.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    const updatedOrder = await storage.updateOrderStatus(id, statusData, user.id);
    res.json(updatedOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Erro ao atualizar status do pedido' });
  }
});

// Analytics routes
router.get('/analytics/dashboard', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const stats = await storage.getDashboardStats(user.role === 'admin' ? undefined : user.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

router.get('/analytics/revenue', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    const user = req.user!;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate e endDate são obrigatórios' });
    }
    
    const revenue = await storage.getRevenueByPeriod(
      new Date(startDate as string),
      new Date(endDate as string),
      user.role === 'admin' ? undefined : user.id
    );
    
    res.json({ revenue });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar receita' });
  }
});

router.get('/analytics/status-count', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const statusCounts = await storage.getOrderCountByStatus(user.role === 'admin' ? undefined : user.id);
    res.json(statusCounts);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar contagem por status' });
  }
});

// Order logs
router.get('/orders/:id/logs', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    
    // Check if user can access this order
    const order = await storage.getOrder(id);
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    if (user.role !== 'admin' && order.attendantId !== user.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    const logs = await storage.getOrderLogs(id);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico do pedido' });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export { router };