const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

// Criar diretório do banco se não existir
const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'controle.sqlite');
const db = new Database(dbPath);

// Configurações de performance
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// Inicializar banco com schema
function initializeDatabase() {
  const schemaPath = path.join(__dirname, '../schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Executar cada comando SQL separadamente
  const commands = schema.split(';').filter(cmd => cmd.trim());
  
  db.transaction(() => {
    commands.forEach(command => {
      if (command.trim()) {
        db.exec(command);
      }
    });
  })();

  // Criar admin padrão se não existir
  createDefaultAdmin();
  
  console.log('✅ Database Sistema Controle inicializado');
}

// Criar admin padrão
function createDefaultAdmin() {
  const existingAdmin = db.prepare('SELECT id FROM usuarios WHERE tipo = ?').get('admin');
  
  if (!existingAdmin) {
    const adminPassword = bcrypt.hashSync('admin123', 10);
    
    db.prepare(`
      INSERT INTO usuarios (id, nome, email, senha, tipo, ativo)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('admin-001', 'Administrador', 'admin@controle.com', adminPassword, 'admin', 1);
    
    console.log('👤 Admin padrão criado - Email: admin@controle.com / Senha: admin123');
  }
}

// Preparar statements mais usados
const statements = {
  // Usuários
  findUserByEmail: db.prepare('SELECT * FROM usuarios WHERE email = ? AND ativo = 1'),
  findUserById: db.prepare('SELECT * FROM usuarios WHERE id = ? AND ativo = 1'),
  createUser: db.prepare(`
    INSERT INTO usuarios (id, nome, email, senha, tipo, telefone, meta_vendas_diaria, comissao_percentual)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  updateUser: db.prepare(`
    UPDATE usuarios SET nome = ?, telefone = ?, meta_vendas_diaria = ?, comissao_percentual = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
  listAtendentes: db.prepare('SELECT id, nome, email, telefone, meta_vendas_diaria, comissao_percentual FROM usuarios WHERE tipo = ? AND ativo = 1'),
  
  // Pedidos
  createPedido: db.prepare(`
    INSERT INTO pedidos (id, atendente_id, cliente_nome, cliente_telefone, cliente_email, produto, valor_venda, categoria, status, data_pedido, data_agendamento, periodo_entrega, observacoes, comissao_calculada)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  updatePedido: db.prepare(`
    UPDATE pedidos SET status = ?, metodo_pagamento = ?, observacoes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND atendente_id = ?
  `),
  findPedidosByAtendente: db.prepare(`
    SELECT * FROM pedidos 
    WHERE atendente_id = ? 
    ORDER BY data_pedido DESC, created_at DESC 
    LIMIT ?
  `),
  findAllPedidos: db.prepare(`
    SELECT p.*, u.nome as atendente_nome 
    FROM pedidos p 
    LEFT JOIN usuarios u ON p.atendente_id = u.id 
    ORDER BY p.data_pedido DESC, p.created_at DESC 
    LIMIT ?
  `),
  
  // Logs
  createLog: db.prepare(`
    INSERT INTO logs_sistema (usuario_id, acao, detalhes, ip)
    VALUES (?, ?, ?, ?)
  `)
};

// Inicializar na importação
initializeDatabase();

module.exports = {
  db,
  statements,
  initializeDatabase
};