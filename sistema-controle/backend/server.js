const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const { nanoid } = require('nanoid');
const { db, statements } = require('./database');

const app = express();
const PORT = process.env.CONTROLE_PORT || 3001;
const JWT_SECRET = 'controle-secret-key-123';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// ==================== ROTAS DE AUTENTICAÇÃO ====================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = statements.findUserByEmail.get(email);
    
    if (!user || !bcrypt.compareSync(senha, user.senha)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, tipo: user.tipo },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log da ação
    statements.createLog.run(user.id, 'LOGIN', `Login realizado`, req.ip);

    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Registro (apenas admin pode criar atendentes)
app.post('/api/auth/register', authenticateToken, async (req, res) => {
  try {
    if (req.user.tipo !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem criar atendentes' });
    }

    const { nome, email, senha, telefone, meta_vendas_diaria, comissao_percentual } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // Verificar se email já existe
    const existingUser = statements.findUserByEmail.get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = bcrypt.hashSync(senha, 10);
    const userId = nanoid();

    statements.createUser.run(
      userId,
      nome,
      email,
      hashedPassword,
      'atendente',
      telefone || null,
      meta_vendas_diaria || 10,
      comissao_percentual || 10.0
    );

    // Log da ação
    statements.createLog.run(req.user.id, 'CREATE_USER', `Atendente criado: ${nome} (${email})`, req.ip);

    res.status(201).json({ message: 'Atendente criado com sucesso', id: userId });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==================== ROTAS DE DASHBOARD ====================

// Dashboard por atendente
app.get('/api/dashboard/:atendenteId?', authenticateToken, (req, res) => {
  try {
    const { atendenteId } = req.params;
    const hoje = new Date().toISOString().split('T')[0];
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    let targetAtendente = atendenteId;
    
    // Se não for admin, só pode ver próprios dados
    if (req.user.tipo !== 'admin') {
      targetAtendente = req.user.id;
    }

    let whereCondition = '';
    let params = [];
    
    if (targetAtendente) {
      whereCondition = ' AND atendente_id = ?';
      params = [targetAtendente];
    }

    // Vendas de hoje
    const vendasHoje = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(valor_venda), 0) as valor
      FROM pedidos 
      WHERE DATE(data_pedido) = ? AND status != 'cancelado'${whereCondition}
    `).get(hoje, ...params);

    // Vendas do mês
    const vendasMes = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(valor_venda), 0) as valor
      FROM pedidos 
      WHERE DATE(data_pedido) >= ? AND status != 'cancelado'${whereCondition}
    `).get(inicioMes, ...params);

    // Comissões do mês
    const comissoesMes = db.prepare(`
      SELECT COALESCE(SUM(comissao_calculada), 0) as valor
      FROM pedidos 
      WHERE DATE(data_pedido) >= ? AND status = 'pago'${whereCondition}
    `).get(inicioMes, ...params);

    // Entregas hoje
    const entregasHoje = db.prepare(`
      SELECT COUNT(*) as count
      FROM pedidos 
      WHERE categoria = 'logzz' AND DATE(data_agendamento) = ? AND status IN ('agendado', 'em_rota')${whereCondition}
    `).get(hoje, ...params);

    // Performance por atendente (só admin)
    let performanceAtendentes = [];
    if (req.user.tipo === 'admin') {
      performanceAtendentes = db.prepare(`
        SELECT 
          u.nome,
          COUNT(p.id) as vendas_mes,
          COALESCE(SUM(CASE WHEN p.status = 'pago' THEN p.comissao_calculada ELSE 0 END), 0) as comissao_mes,
          COALESCE(SUM(CASE WHEN p.status != 'cancelado' THEN p.valor_venda ELSE 0 END), 0) as valor_total_mes
        FROM usuarios u
        LEFT JOIN pedidos p ON u.id = p.atendente_id AND DATE(p.data_pedido) >= ?
        WHERE u.tipo = 'atendente' AND u.ativo = 1
        GROUP BY u.id, u.nome
        ORDER BY vendas_mes DESC
      `).all(inicioMes);
    }

    res.json({
      vendasHoje: { count: vendasHoje.count || 0, valor: vendasHoje.valor || 0 },
      vendasMes: { count: vendasMes.count || 0, valor: vendasMes.valor || 0 },
      comissoesMes: { valor: comissoesMes.valor || 0 },
      entregasHoje: { count: entregasHoje.count || 0 },
      performanceAtendentes
    });
  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==================== ROTAS DE PEDIDOS ====================

// Listar pedidos
app.get('/api/pedidos/:atendenteId?', authenticateToken, (req, res) => {
  try {
    const { atendenteId } = req.params;
    const { categoria, status, dataInicio, dataFim } = req.query;
    
    let query = `
      SELECT p.*, u.nome as atendente_nome 
      FROM pedidos p 
      LEFT JOIN usuarios u ON p.atendente_id = u.id 
      WHERE 1=1
    `;
    let params = [];

    // Filtro por atendente
    if (req.user.tipo !== 'admin') {
      query += ' AND p.atendente_id = ?';
      params.push(req.user.id);
    } else if (atendenteId) {
      query += ' AND p.atendente_id = ?';
      params.push(atendenteId);
    }

    // Filtros adicionais
    if (categoria) {
      query += ' AND p.categoria = ?';
      params.push(categoria);
    }
    
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }
    
    if (dataInicio) {
      query += ' AND DATE(p.data_pedido) >= ?';
      params.push(dataInicio);
    }
    
    if (dataFim) {
      query += ' AND DATE(p.data_pedido) <= ?';
      params.push(dataFim);
    }

    query += ' ORDER BY p.data_pedido DESC, p.created_at DESC LIMIT 100';

    const pedidos = db.prepare(query).all(...params);
    res.json(pedidos);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar pedido
app.post('/api/pedidos', authenticateToken, (req, res) => {
  try {
    const {
      cliente_nome,
      cliente_telefone,
      cliente_email,
      produto,
      valor_venda,
      categoria,
      data_agendamento,
      periodo_entrega,
      observacoes
    } = req.body;

    if (!cliente_nome || !cliente_telefone || !produto || !valor_venda || !categoria) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
    }

    const pedidoId = nanoid();
    const comissao = valor_venda * 0.10; // 10% de comissão
    
    statements.createPedido.run(
      pedidoId,
      req.user.id,
      cliente_nome,
      cliente_telefone,
      cliente_email || null,
      produto,
      valor_venda,
      categoria,
      categoria === 'logzz' ? 'agendado' : 'pendente',
      new Date().toISOString().split('T')[0],
      data_agendamento || null,
      periodo_entrega || null,
      observacoes || null,
      comissao
    );

    // Log da ação
    statements.createLog.run(req.user.id, 'CREATE_PEDIDO', `Pedido criado: ${cliente_nome} - R$ ${valor_venda}`, req.ip);

    res.status(201).json({ message: 'Pedido criado com sucesso', id: pedidoId });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar status do pedido
app.put('/api/pedidos/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { status, metodo_pagamento, observacoes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório' });
    }

    const result = statements.updatePedido.run(status, metodo_pagamento, observacoes, id, req.user.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado ou sem permissão' });
    }

    // Log da ação
    statements.createLog.run(req.user.id, 'UPDATE_PEDIDO', `Status alterado para: ${status}`, req.ip);

    res.json({ message: 'Pedido atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==================== ROTAS ADMINISTRATIVAS ====================

// Listar atendentes (apenas admin)
app.get('/api/atendentes', authenticateToken, (req, res) => {
  try {
    if (req.user.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const atendentes = statements.listAtendentes.all('atendente');
    res.json(atendentes);
  } catch (error) {
    console.error('Erro ao buscar atendentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota catch-all para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Sistema Controle rodando na porta ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`👤 Admin padrão: admin@controle.com / admin123`);
});

module.exports = app;