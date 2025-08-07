-- Schema para Sistema de Controle de Atendentes
-- Banco separado e independente do SaaS principal

-- Tabela de usuários (atendentes + admin)
CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  tipo TEXT CHECK(tipo IN ('atendente', 'admin')) DEFAULT 'atendente',
  telefone TEXT,
  meta_vendas_diaria INTEGER DEFAULT 10,
  comissao_percentual REAL DEFAULT 10.0,
  ativo BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pedidos/vendas
CREATE TABLE IF NOT EXISTS pedidos (
  id TEXT PRIMARY KEY,
  atendente_id TEXT NOT NULL,
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT NOT NULL,
  cliente_email TEXT,
  produto TEXT NOT NULL,
  valor_venda REAL NOT NULL,
  categoria TEXT CHECK(categoria IN ('pago', 'logzz', 'after_pay')) NOT NULL,
  status TEXT CHECK(status IN ('pendente', 'agendado', 'em_rota', 'entregue', 'pago', 'cancelado')) DEFAULT 'pendente',
  data_pedido DATE NOT NULL,
  data_agendamento DATE,
  periodo_entrega TEXT,
  metodo_pagamento TEXT CHECK(metodo_pagamento IN ('Dinheiro', 'PIX', 'Cartão')),
  observacoes TEXT,
  comissao_calculada REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (atendente_id) REFERENCES usuarios(id)
);

-- Tabela de logs para auditoria
CREATE TABLE IF NOT EXISTS logs_sistema (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id TEXT,
  acao TEXT NOT NULL,
  detalhes TEXT,
  ip TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pedidos_atendente ON pedidos(atendente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_data ON pedidos(data_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_categoria ON pedidos(categoria);

-- Inserir usuário admin padrão
INSERT OR IGNORE INTO usuarios (id, nome, email, senha, tipo) 
VALUES ('admin-001', 'Administrador', 'admin@controle.com', '$2b$10$..hash..', 'admin');