import Database from 'better-sqlite3';
import path from 'path';

// Conectar ao banco SQLite principal do Vendzz
const dbPath = path.join(process.cwd(), 'vendzz-database.db');
const db = new Database(dbPath);

// Função para inicializar as tabelas do Sistema Controle
function initializeControleDatabase() {
  console.log('🏢 Inicializando Sistema Controle Database...');

  try {
    // Criar tabela de atendentes
    db.exec(`
      CREATE TABLE IF NOT EXISTS controle_attendants (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        telefone TEXT NOT NULL,
        meta_vendas_diaria INTEGER DEFAULT 3,
        comissao_percentual REAL DEFAULT 10.0,
        ativo INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Criar tabela de vendas
    db.exec(`
      CREATE TABLE IF NOT EXISTS controle_vendas (
        id TEXT PRIMARY KEY,
        atendente_id TEXT NOT NULL,
        cliente_nome TEXT NOT NULL,
        cliente_telefone TEXT NOT NULL,
        cliente_endereco TEXT,
        valor_venda REAL NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('agendado', 'pago', 'cancelado')),
        data_venda TEXT NOT NULL,
        data_agendamento TEXT,
        periodo_entrega TEXT CHECK (periodo_entrega IN ('manha', 'tarde', 'noite')),
        comissao_calculada REAL DEFAULT 0,
        observacoes TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (atendente_id) REFERENCES controle_attendants(id)
      )
    `);

    // Inserir dados de exemplo dos 3 atendentes
    const existingAttendants = db.prepare('SELECT COUNT(*) as count FROM controle_attendants').get();
    
    if (existingAttendants.count === 0) {
      console.log('📝 Inserindo atendentes de exemplo...');
      
      const insertAttendant = db.prepare(`
        INSERT INTO controle_attendants (id, nome, email, telefone, meta_vendas_diaria, comissao_percentual)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      insertAttendant.run('att-001', 'Ana Silva', 'ana.silva@controle.com', '(11) 98765-4321', 4, 10.0);
      insertAttendant.run('att-002', 'Carlos Santos', 'carlos.santos@controle.com', '(11) 97654-3210', 3, 10.0);
      insertAttendant.run('att-003', 'Maria Oliveira', 'maria.oliveira@controle.com', '(11) 96543-2109', 3, 10.0);

      console.log('✅ Atendentes de exemplo inseridos');

      // Inserir algumas vendas de exemplo
      console.log('📝 Inserindo vendas de exemplo...');
      
      const insertSale = db.prepare(`
        INSERT INTO controle_vendas (
          id, atendente_id, cliente_nome, cliente_telefone, cliente_endereco,
          valor_venda, status, data_venda, data_agendamento, periodo_entrega,
          comissao_calculada, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // Vendas para hoje
      const hoje = new Date().toISOString().split('T')[0];
      const amanha = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      insertSale.run(
        'sale-001', 'att-001', 'João Silva', '(11) 99999-1111', 'Rua das Flores, 123',
        150.00, 'pago', hoje, null, null, 15.00, 'Cliente satisfeito'
      );

      insertSale.run(
        'sale-002', 'att-002', 'Maria Santos', '(11) 99999-2222', 'Av. Central, 456',
        200.00, 'agendado', hoje, amanha, 'tarde', 0, 'Entrega agendada'
      );

      insertSale.run(
        'sale-003', 'att-001', 'Pedro Costa', '(11) 99999-3333', 'Rua Nova, 789',
        120.00, 'pago', hoje, null, null, 12.00, 'Pagamento à vista'
      );

      insertSale.run(
        'sale-004', 'att-003', 'Ana Rodrigues', '(11) 99999-4444', 'Av. Brasil, 101',
        300.00, 'agendado', hoje, amanha, 'manha', 0, 'Cliente premium'
      );

      console.log('✅ Vendas de exemplo inseridas');
    }

    console.log('✅ Sistema Controle Database inicializado com sucesso');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar Sistema Controle Database:', error);
    throw error;
  }
}

// Inicializar automaticamente quando o módulo for carregado
initializeControleDatabase();

export default db;