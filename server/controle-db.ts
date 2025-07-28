import Database from "better-sqlite3";
import * as schema from "@/shared/controle-schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { nanoid } from "nanoid";

// Criar instância específica do banco para sistema de controle
const sqlite = new Database("controle-operacoes.db");

// Configurar WAL mode para melhor performance
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("synchronous = NORMAL");

// Inicializar drizzle com schema específico
export const controleDb = drizzle(sqlite, { schema });

// Função para inicializar tabelas
export function initializeControleDatabase() {
  try {
    // Criar tabelas se não existirem
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS atendentes (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        telefone TEXT NOT NULL,
        meta_vendas_diaria INTEGER DEFAULT 4,
        comissao_percentual REAL DEFAULT 10.0,
        ativo INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS gastos_campanha (
        id TEXT PRIMARY KEY,
        atendente_id TEXT NOT NULL,
        data TEXT NOT NULL,
        valor_gasto REAL NOT NULL,
        leads_recebidos INTEGER DEFAULT 0,
        plataforma TEXT DEFAULT 'Facebook',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (atendente_id) REFERENCES atendentes (id)
      );

      CREATE TABLE IF NOT EXISTS vendas (
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
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (atendente_id) REFERENCES atendentes (id)
      );

      CREATE TABLE IF NOT EXISTS configuracoes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        meta_vendas_mensal INTEGER DEFAULT 120,
        limite_dias_agendamento INTEGER DEFAULT 30,
        alerta_pedidos_proximos INTEGER DEFAULT 2,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_vendas_atendente ON vendas(atendente_id);
      CREATE INDEX IF NOT EXISTS idx_vendas_data ON vendas(data_venda);
      CREATE INDEX IF NOT EXISTS idx_vendas_status ON vendas(status);
      CREATE INDEX IF NOT EXISTS idx_gastos_atendente_data ON gastos_campanha(atendente_id, data);
    `);

    // Inserir dados iniciais de exemplo (apenas se tabelas estiverem vazias)
    const atendenteCount = sqlite.prepare('SELECT COUNT(*) as count FROM atendentes').get()?.count || 0;
    
    if (atendenteCount === 0) {
      console.log("🏗️ Criando dados iniciais do sistema de controle...");
      
      // Atendentes de exemplo
      const atendentes = [
        { id: nanoid(), nome: "Ana Silva", email: "ana@logzz.com", telefone: "(11) 99999-0001" },
        { id: nanoid(), nome: "Carlos Santos", email: "carlos@logzz.com", telefone: "(11) 99999-0002" },
        { id: nanoid(), nome: "Mariana Costa", email: "mariana@logzz.com", telefone: "(11) 99999-0003" }
      ];

      const insertAtendente = sqlite.prepare(`
        INSERT INTO atendentes (id, nome, email, telefone) 
        VALUES (?, ?, ?, ?)
      `);

      atendentes.forEach(atendente => {
        insertAtendente.run(atendente.id, atendente.nome, atendente.email, atendente.telefone);
      });

      // Gastos de campanha últimos 7 dias
      const insertGasto = sqlite.prepare(`
        INSERT INTO gastos_campanha (id, atendente_id, data, valor_gasto, leads_recebidos) 
        VALUES (?, ?, ?, ?, ?)
      `);

      const hoje = new Date();
      for (let i = 0; i < 7; i++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const dataStr = data.toISOString().split('T')[0];

        atendentes.forEach(atendente => {
          const valorGasto = Math.random() * 100 + 50; // R$ 50-150
          const leadsRecebidos = Math.floor(Math.random() * 20) + 40; // 40-60 leads
          insertGasto.run(nanoid(), atendente.id, dataStr, valorGasto, leadsRecebidos);
        });
      }

      // Vendas de exemplo
      const insertVenda = sqlite.prepare(`
        INSERT INTO vendas (id, atendente_id, cliente_nome, cliente_telefone, valor_venda, status, data_venda, data_agendamento, periodo_entrega, comissao_calculada) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const statusOptions = ['agendado', 'pago', 'cancelado'];
      const periodos = ['manha', 'tarde', 'noite'];

      // Criar vendas para os últimos 30 dias
      for (let i = 0; i < 30; i++) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const dataStr = data.toISOString().split('T')[0];

        atendentes.forEach(atendente => {
          // 3-4 vendas por dia por atendente
          const numVendas = Math.floor(Math.random() * 2) + 3;
          
          for (let j = 0; j < numVendas; j++) {
            const valor = Math.random() * 200 + 100; // R$ 100-300
            const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
            const comissao = status === 'pago' ? valor * 0.1 : 0;
            
            // Para agendados, criar data de agendamento futura
            let dataAgendamento = null;
            let periodo = null;
            if (status === 'agendado') {
              const futureDate = new Date(data);
              futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 7) + 1);
              dataAgendamento = futureDate.toISOString().split('T')[0];
              periodo = periodos[Math.floor(Math.random() * periodos.length)];
            }

            insertVenda.run(
              nanoid(),
              atendente.id,
              `Cliente ${j + 1} - ${dataStr}`,
              `(11) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
              valor,
              status,
              dataStr,
              dataAgendamento,
              periodo,
              comissao
            );
          }
        });
      }

      console.log("✅ Dados iniciais criados: 3 atendentes, 21 registros de gastos, ~360 vendas");
    }

    console.log("✅ Database de controle inicializado com sucesso");
  } catch (error) {
    console.error("❌ Erro ao inicializar database de controle:", error);
  }
}

// ============================================================================
// FUNÇÕES DE CRUD PARA SISTEMA CONTROLE
// ============================================================================

// Função para buscar todos os attendants
export async function getAllAttendants() {
  try {
    const attendants = sqlite.prepare(`
      SELECT * FROM atendentes 
      WHERE ativo = 1 
      ORDER BY nome
    `).all();
    return attendants;
  } catch (error) {
    console.error('Erro ao buscar attendants:', error);
    return [];
  }
}

// Função para criar novo attendant
export async function createAttendant(data) {
  try {
    const id = nanoid();
    const attendant = sqlite.prepare(`
      INSERT INTO atendentes (id, nome, email, telefone, meta_vendas_diaria, comissao_percentual) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, data.nome, data.email, data.telefone, data.meta_vendas_diaria || 4, data.comissao_percentual || 10.0);
    
    return { id, ...data };
  } catch (error) {
    console.error('Erro ao criar attendant:', error);
    throw error;
  }
}

// Função para buscar vendas com filtros
export async function getSales(filters = {}) {
  try {
    let query = `
      SELECT v.*, a.nome as atendente_nome 
      FROM vendas v 
      JOIN atendentes a ON v.atendente_id = a.id 
      WHERE 1=1
    `;
    const params = [];

    if (filters.attendantId) {
      query += ` AND v.atendente_id = ?`;
      params.push(filters.attendantId);
    }

    if (filters.status) {
      query += ` AND v.status = ?`;
      params.push(filters.status);
    }

    if (filters.startDate) {
      query += ` AND v.data_venda >= ?`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ` AND v.data_venda <= ?`;
      params.push(filters.endDate);
    }

    query += ` ORDER BY v.created_at DESC LIMIT 100`;

    const sales = sqlite.prepare(query).all(...params);
    return sales;
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return [];
  }
}

// Função para criar nova venda
export async function createSale(data) {
  try {
    const id = nanoid();
    const comissao = data.status === 'pago' ? data.valor_venda * 0.1 : 0;
    
    const sale = sqlite.prepare(`
      INSERT INTO vendas (
        id, atendente_id, cliente_nome, cliente_telefone, cliente_endereco,
        valor_venda, status, data_venda, data_agendamento, periodo_entrega,
        comissao_calculada, observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.atendente_id,
      data.cliente_nome,
      data.cliente_telefone,
      data.cliente_endereco || null,
      data.valor_venda,
      data.status,
      data.data_venda,
      data.data_agendamento || null,
      data.periodo_entrega || null,
      comissao,
      data.observacoes || null
    );
    
    return { id, ...data, comissao_calculada: comissao };
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    throw error;
  }
}

// Função para atualizar status da venda
export async function updateSaleStatus(saleId, data) {
  try {
    const updateData = { ...data };
    
    // Recalcular comissão se status mudou para 'pago'
    if (data.status === 'pago') {
      const sale = sqlite.prepare('SELECT valor_venda FROM vendas WHERE id = ?').get(saleId);
      if (sale) {
        updateData.comissao_calculada = sale.valor_venda * 0.1;
      }
    } else if (data.status === 'cancelado' || data.status === 'agendado') {
      updateData.comissao_calculada = 0;
    }

    updateData.updated_at = new Date().toISOString();

    const result = sqlite.prepare(`
      UPDATE vendas 
      SET status = ?, comissao_calculada = ?, updated_at = ?,
          data_agendamento = ?, periodo_entrega = ?, observacoes = ?
      WHERE id = ?
    `).run(
      updateData.status,
      updateData.comissao_calculada,
      updateData.updated_at,
      updateData.data_agendamento || null,
      updateData.periodo_entrega || null,
      updateData.observacoes || null,
      saleId
    );

    return { id: saleId, ...updateData };
  } catch (error) {
    console.error('Erro ao atualizar venda:', error);
    throw error;
  }
}

// Função para dashboard admin
export async function getAdminDashboard() {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    const inicioMes = new Date().toISOString().substring(0, 7) + '-01';

    // Vendas hoje
    const vendasHoje = sqlite.prepare(`
      SELECT COUNT(*) as total, SUM(valor_venda) as valor_total
      FROM vendas 
      WHERE date(data_venda) = ?
    `).get(hoje) || { total: 0, valor_total: 0 };

    // Vendas no mês
    const vendasMes = sqlite.prepare(`
      SELECT COUNT(*) as total, SUM(valor_venda) as valor_total
      FROM vendas 
      WHERE data_venda >= ?
    `).get(inicioMes) || { total: 0, valor_total: 0 };

    // Comissões pagas no mês
    const comissoesMes = sqlite.prepare(`
      SELECT SUM(comissao_calculada) as total
      FROM vendas 
      WHERE status = 'pago' AND data_venda >= ?
    `).get(inicioMes) || { total: 0 };

    // Performance por attendant
    const performanceAttendants = sqlite.prepare(`
      SELECT 
        a.nome,
        COUNT(v.id) as vendas_mes,
        SUM(CASE WHEN v.status = 'pago' THEN v.comissao_calculada ELSE 0 END) as comissao_mes,
        SUM(v.valor_venda) as valor_total_mes
      FROM atendentes a
      LEFT JOIN vendas v ON a.id = v.atendente_id AND v.data_venda >= ?
      WHERE a.ativo = 1
      GROUP BY a.id, a.nome
      ORDER BY vendas_mes DESC
    `).all(inicioMes);

    // Entregas agendadas para hoje
    const entregasHoje = sqlite.prepare(`
      SELECT COUNT(*) as total
      FROM vendas 
      WHERE status = 'agendado' AND date(data_agendamento) = ?
    `).get(hoje) || { total: 0 };

    return {
      vendasHoje: vendasHoje.total,
      valorHoje: vendasHoje.valor_total || 0,
      vendasMes: vendasMes.total,
      valorMes: vendasMes.valor_total || 0,
      comissoesMes: comissoesMes.total || 0,
      entregasHoje: entregasHoje.total,
      performanceAttendants
    };
  } catch (error) {
    console.error('Erro ao buscar dashboard admin:', error);
    return {
      vendasHoje: 0,
      valorHoje: 0,
      vendasMes: 0,
      valorMes: 0,
      comissoesMes: 0,
      entregasHoje: 0,
      performanceAttendants: []
    };
  }
}

// Função para dashboard do attendant
export async function getAttendantDashboard(attendantId) {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    const inicioMes = new Date().toISOString().substring(0, 7) + '-01';

    // Vendas hoje do attendant
    const vendasHoje = sqlite.prepare(`
      SELECT COUNT(*) as total, SUM(valor_venda) as valor_total
      FROM vendas 
      WHERE atendente_id = ? AND date(data_venda) = ?
    `).get(attendantId, hoje) || { total: 0, valor_total: 0 };

    // Vendas no mês do attendant
    const vendasMes = sqlite.prepare(`
      SELECT COUNT(*) as total, SUM(valor_venda) as valor_total
      FROM vendas 
      WHERE atendente_id = ? AND data_venda >= ?
    `).get(attendantId, inicioMes) || { total: 0, valor_total: 0 };

    // Comissões do attendant
    const comissoesMes = sqlite.prepare(`
      SELECT SUM(comissao_calculada) as total
      FROM vendas 
      WHERE atendente_id = ? AND status = 'pago' AND data_venda >= ?
    `).get(attendantId, inicioMes) || { total: 0 };

    // Entregas agendadas para o attendant hoje
    const entregasHoje = sqlite.prepare(`
      SELECT COUNT(*) as total
      FROM vendas 
      WHERE atendente_id = ? AND status = 'agendado' AND date(data_agendamento) = ?
    `).get(attendantId, hoje) || { total: 0 };

    // Meta do attendant
    const attendant = sqlite.prepare(`
      SELECT meta_vendas_diaria, comissao_percentual
      FROM atendentes 
      WHERE id = ?
    `).get(attendantId) || { meta_vendas_diaria: 4, comissao_percentual: 10 };

    return {
      vendasHoje: vendasHoje.total,
      valorHoje: vendasHoje.valor_total || 0,
      vendasMes: vendasMes.total,
      valorMes: vendasMes.valor_total || 0,
      comissoesMes: comissoesMes.total || 0,
      entregasHoje: entregasHoje.total,
      metaDiaria: attendant.meta_vendas_diaria,
      percentualComissao: attendant.comissao_percentual
    };
  } catch (error) {
    console.error('Erro ao buscar dashboard attendant:', error);
    return {
      vendasHoje: 0,
      valorHoje: 0,
      vendasMes: 0,
      valorMes: 0,
      comissoesMes: 0,
      entregasHoje: 0,
      metaDiaria: 4,
      percentualComissao: 10
    };
  }
}

// Função para buscar comissões
export async function getCommissions(attendantId, startDate, endDate) {
  try {
    let query = `
      SELECT v.*, a.nome as atendente_nome
      FROM vendas v
      JOIN atendentes a ON v.atendente_id = a.id
      WHERE v.atendente_id = ? AND v.status = 'pago' AND v.comissao_calculada > 0
    `;
    const params = [attendantId];

    if (startDate) {
      query += ` AND v.data_venda >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND v.data_venda <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY v.data_venda DESC`;

    const commissions = sqlite.prepare(query).all(...params);
    return commissions;
  } catch (error) {
    console.error('Erro ao buscar comissões:', error);
    return [];
  }
}

// Função para buscar leads por attendant
export async function getLeadsByAttendant(attendantId, date, source) {
  try {
    let query = `
      SELECT * FROM gastos_campanha 
      WHERE atendente_id = ?
    `;
    const params = [attendantId];

    if (date) {
      query += ` AND data = ?`;
      params.push(date);
    }

    if (source) {
      query += ` AND plataforma = ?`;
      params.push(source);
    }

    query += ` ORDER BY data DESC`;

    const leads = sqlite.prepare(query).all(...params);
    return leads;
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    return [];
  }
}

// Função para buscar entregas de hoje
export async function getTodayDeliveries() {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    
    const deliveries = sqlite.prepare(`
      SELECT v.*, a.nome as atendente_nome
      FROM vendas v
      JOIN atendentes a ON v.atendente_id = a.id
      WHERE v.status = 'agendado' AND date(v.data_agendamento) = ?
      ORDER BY v.periodo_entrega, v.created_at
    `).all(hoje);
    
    return deliveries;
  } catch (error) {
    console.error('Erro ao buscar entregas de hoje:', error);
    return [];
  }
}

// Função para notificar entrega
export async function notifyDelivery(saleId, message) {
  try {
    // Buscar dados da venda
    const sale = sqlite.prepare(`
      SELECT v.*, a.nome as atendente_nome
      FROM vendas v
      JOIN atendentes a ON v.atendente_id = a.id
      WHERE v.id = ?
    `).get(saleId);

    if (!sale) {
      throw new Error('Venda não encontrada');
    }

    // Simular envio de notificação (aqui você integraria com WhatsApp, SMS, etc)
    console.log(`📱 Notificação enviada para ${sale.cliente_telefone}: ${message}`);
    
    // Registrar a notificação (opcional - você pode criar uma tabela de notificações)
    const notification = {
      id: nanoid(),
      saleId: saleId,
      message: message,
      sentAt: new Date().toISOString(),
      clientPhone: sale.cliente_telefone,
      attendant: sale.atendente_nome
    };

    return notification;
  } catch (error) {
    console.error('Erro ao notificar entrega:', error);
    throw error;
  }
}

// Inicializar database na importação
initializeControleDatabase();

// Exportar instância do sqlite para queries diretas se necessário
export { sqlite as controleSqlite };