import express from 'express';
import path from 'path';
const Database = require('better-sqlite3');
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const router = express.Router();

// Database setup
const db = new Database('./sistema-controle/database/controle.sqlite');

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'controle-secret-key-2025';

// Interface para usuário do controle
interface ControleUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Auth middleware para rotas do controle
const authMiddleware = (req: express.Request & { user?: ControleUser }, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Servir arquivos estáticos do frontend do sistema controle
router.use('/assets', express.static(path.join(process.cwd(), 'sistema-controle/frontend/dist/assets')));

// Rota principal do sistema controle
router.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'sistema-controle/frontend/dist/index.html'));
});

// API Routes

// Login
router.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Dashboard stats
router.get('/api/dashboard', authMiddleware, (req: express.Request & { user?: ControleUser }, res: express.Response) => {
  try {
    const userId = req.user?.role === 'admin' ? null : req.user?.id;
    
    let totalSales, totalCommission, monthlyOrders, pendingOrders;
    
    if (userId) {
      // Stats para atendente específico
      const salesResult = db.prepare(`
        SELECT COALESCE(SUM(value), 0) as total 
        FROM orders 
        WHERE attendant_id = ? AND status = 'pago'
      `).get(userId);
      
      const commissionResult = db.prepare(`
        SELECT COALESCE(SUM(value * 0.10), 0) as total 
        FROM orders 
        WHERE attendant_id = ? AND status = 'pago'
      `).get(userId);
      
      const monthlyResult = db.prepare(`
        SELECT COUNT(*) as total 
        FROM orders 
        WHERE attendant_id = ? AND date(created_at) >= date('now', '-30 days')
      `).get(userId);
      
      const pendingResult = db.prepare(`
        SELECT COUNT(*) as total 
        FROM orders 
        WHERE attendant_id = ? AND status IN ('logzz', 'after_pay')
      `).get(userId);
      
      totalSales = salesResult.total;
      totalCommission = commissionResult.total;
      monthlyOrders = monthlyResult.total;
      pendingOrders = pendingResult.total;
    } else {
      // Stats gerais para admin
      const salesResult = db.prepare(`
        SELECT COALESCE(SUM(value), 0) as total 
        FROM orders 
        WHERE status = 'pago'
      `).get();
      
      const commissionResult = db.prepare(`
        SELECT COALESCE(SUM(value * 0.10), 0) as total 
        FROM orders 
        WHERE status = 'pago'
      `).get();
      
      const monthlyResult = db.prepare(`
        SELECT COUNT(*) as total 
        FROM orders 
        WHERE date(created_at) >= date('now', '-30 days')
      `).get();
      
      const pendingResult = db.prepare(`
        SELECT COUNT(*) as total 
        FROM orders 
        WHERE status IN ('logzz', 'after_pay')
      `).get();
      
      totalSales = salesResult.total;
      totalCommission = commissionResult.total;
      monthlyOrders = monthlyResult.total;
      pendingOrders = pendingResult.total;
    }

    res.json({
      totalSales,
      totalCommission,
      monthlyOrders,
      pendingOrders
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar pedidos
router.get('/api/orders', authMiddleware, (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? null : req.user.id;
    const { status, category, startDate, endDate } = req.query;
    
    let query = `
      SELECT o.*, u.name as attendant_name 
      FROM orders o 
      LEFT JOIN users u ON o.attendant_id = u.id 
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (userId) {
      query += ' AND o.attendant_id = ?';
      params.push(userId);
    }
    
    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }
    
    if (category) {
      query += ' AND o.category = ?';
      params.push(category);
    }
    
    if (startDate) {
      query += ' AND date(o.created_at) >= date(?)';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND date(o.created_at) <= date(?)';
      params.push(endDate);
    }
    
    query += ' ORDER BY o.created_at DESC';
    
    const orders = db.prepare(query).all(...params);
    res.json(orders);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar pedido
router.post('/api/orders', authMiddleware, (req, res) => {
  try {
    const { customer_name, customer_phone, product, value, category, notes } = req.body;
    const attendant_id = req.user.id;
    
    if (!customer_name || !customer_phone || !product || !value) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, telefone, produto, valor' });
    }
    
    const result = db.prepare(`
      INSERT INTO orders (attendant_id, customer_name, customer_phone, product, value, category, notes, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'logzz', datetime('now'))
    `).run(attendant_id, customer_name, customer_phone, product, value, category, notes);
    
    res.json({ id: result.lastInsertRowid, message: 'Pedido criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar status do pedido
router.put('/api/orders/:id/status', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.role === 'admin' ? null : req.user.id;
    
    if (!['logzz', 'pago', 'after_pay', 'cancelado'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    
    let query = 'UPDATE orders SET status = ?, updated_at = datetime(\'now\') WHERE id = ?';
    const params = [status, id];
    
    if (userId) {
      query += ' AND attendant_id = ?';
      params.push(userId);
    }
    
    const result = db.prepare(query).run(...params);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    res.json({ message: 'Status atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar atendentes (apenas admin)
router.get('/api/attendants', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    const attendants = db.prepare(`
      SELECT u.id, u.name, u.email, u.role, u.created_at,
             COUNT(o.id) as total_orders,
             COALESCE(SUM(CASE WHEN o.status = 'pago' THEN o.value END), 0) as total_sales,
             COALESCE(SUM(CASE WHEN o.status = 'pago' THEN o.value * 0.10 END), 0) as total_commission
      FROM users u
      LEFT JOIN orders o ON u.id = o.attendant_id
      WHERE u.role = 'attendant'
      GROUP BY u.id, u.name, u.email, u.role, u.created_at
      ORDER BY total_sales DESC
    `).all();
    
    res.json(attendants);
  } catch (error) {
    console.error('Erro ao buscar atendentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar atendente (apenas admin)
router.post('/api/attendants', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }
    
    // Verificar se email já existe
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = db.prepare(`
      INSERT INTO users (name, email, password, role, created_at)
      VALUES (?, ?, ?, 'attendant', datetime('now'))
    `).run(name, email, hashedPassword);
    
    res.json({ id: result.lastInsertRowid, message: 'Atendente criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar atendente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Conteúdo educacional
router.get('/api/educational-content', authMiddleware, (req, res) => {
  try {
    const { type } = req.query;
    
    let query = 'SELECT * FROM educational_content WHERE 1=1';
    const params: any[] = [];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const content = db.prepare(query).all(...params);
    res.json(content);
  } catch (error) {
    console.error('Erro ao buscar conteúdo educacional:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;