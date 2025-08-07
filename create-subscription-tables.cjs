/**
 * SCRIPT PARA CRIAR TABELAS DO SISTEMA DE ASSINATURAS CUSTOMIZÁVEIS
 * Cria todas as tabelas necessárias para produtos, assinaturas, clientes e transações
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');

async function createSubscriptionTables() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Erro ao conectar com o banco:', err);
        reject(err);
        return;
      }
      console.log('📊 Conectado ao banco SQLite');
    });

    // Criar tabelas em sequência
    db.serialize(() => {
      // Tabela de produtos customizáveis
      db.run(`
        CREATE TABLE IF NOT EXISTS custom_products (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          price INTEGER NOT NULL, -- Em centavos
          currency TEXT NOT NULL DEFAULT 'BRL',
          type TEXT NOT NULL CHECK (type IN ('one_time', 'recurring')),
          recurrence TEXT CHECK (recurrence IN ('daily', 'weekly', 'monthly', 'yearly')),
          trial_days INTEGER DEFAULT 0,
          setup_fee INTEGER DEFAULT 0, -- Em centavos
          features TEXT, -- JSON
          metadata TEXT, -- JSON
          gateway_id TEXT NOT NULL,
          active BOOLEAN DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela custom_products:', err);
        } else {
          console.log('✅ Tabela custom_products criada');
        }
      });

      // Tabela de clientes das assinaturas
      db.run(`
        CREATE TABLE IF NOT EXISTS subscription_customers (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          document TEXT,
          address TEXT, -- JSON
          payment_method TEXT, -- JSON
          gateway_id TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela subscription_customers:', err);
        } else {
          console.log('✅ Tabela subscription_customers criada');
        }
      });

      // Tabela de assinaturas customizáveis
      db.run(`
        CREATE TABLE IF NOT EXISTS custom_subscriptions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          customer_id TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'cancelled', 'past_due', 'unpaid')),
          trial_start TEXT,
          trial_end TEXT,
          next_billing_date TEXT,
          last_billing_date TEXT,
          billing_cycle TEXT NOT NULL,
          amount INTEGER NOT NULL, -- Em centavos
          setup_fee INTEGER DEFAULT 0,
          currency TEXT NOT NULL DEFAULT 'BRL',
          gateway_id TEXT NOT NULL,
          cancelled_at TEXT,
          cancellation_reason TEXT,
          metadata TEXT, -- JSON
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (product_id) REFERENCES custom_products(id),
          FOREIGN KEY (customer_id) REFERENCES subscription_customers(id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela custom_subscriptions:', err);
        } else {
          console.log('✅ Tabela custom_subscriptions criada');
        }
      });

      // Tabela de transações de cobrança
      db.run(`
        CREATE TABLE IF NOT EXISTS billing_transactions (
          id TEXT PRIMARY KEY,
          subscription_id TEXT NOT NULL,
          customer_id TEXT NOT NULL,
          amount INTEGER NOT NULL, -- Em centavos
          currency TEXT NOT NULL DEFAULT 'BRL',
          type TEXT NOT NULL CHECK (type IN ('setup_fee', 'recurring', 'refund')),
          status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
          gateway_id TEXT NOT NULL,
          gateway_transaction_id TEXT,
          description TEXT,
          error_message TEXT,
          metadata TEXT, -- JSON
          created_at TEXT NOT NULL,
          updated_at TEXT,
          FOREIGN KEY (subscription_id) REFERENCES custom_subscriptions(id),
          FOREIGN KEY (customer_id) REFERENCES subscription_customers(id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela billing_transactions:', err);
        } else {
          console.log('✅ Tabela billing_transactions criada');
        }
      });

      // Criar índices para performance
      db.run(`CREATE INDEX IF NOT EXISTS idx_custom_products_user_id ON custom_products(user_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_custom_subscriptions_user_id ON custom_subscriptions(user_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_custom_subscriptions_status ON custom_subscriptions(status)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_custom_subscriptions_next_billing ON custom_subscriptions(next_billing_date)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_billing_transactions_subscription ON billing_transactions(subscription_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_billing_transactions_status ON billing_transactions(status)`);

      console.log('✅ Índices criados');
    });

    db.close((err) => {
      if (err) {
        console.error('❌ Erro ao fechar banco:', err);
        reject(err);
      } else {
        console.log('📊 Banco fechado');
        resolve();
      }
    });
  });
}

// Executar criação das tabelas
createSubscriptionTables()
  .then(() => {
    console.log('🎉 SISTEMA DE ASSINATURAS CUSTOMIZÁVEIS CRIADO COM SUCESSO!');
    console.log('');
    console.log('📋 Tabelas criadas:');
    console.log('  - custom_products: Produtos customizáveis');
    console.log('  - subscription_customers: Clientes das assinaturas');
    console.log('  - custom_subscriptions: Assinaturas ativas');
    console.log('  - billing_transactions: Transações de cobrança');
    console.log('');
    console.log('🔧 Funcionalidades disponíveis:');
    console.log('  - Produtos one-time ou recorrentes');
    console.log('  - Recorrência: diária, semanal, mensal, anual');
    console.log('  - Trial periods configuráveis');
    console.log('  - Setup fees opcionais');
    console.log('  - Múltiplos gateways (Stripe + Pagar.me)');
    console.log('  - Sistema de cron para cobrança automática');
    console.log('  - Transações e estatísticas completas');
    console.log('');
    console.log('⚡ Endpoints disponíveis:');
    console.log('  - POST /api/products - Criar produto');
    console.log('  - GET /api/products - Listar produtos');
    console.log('  - PUT /api/products/:id - Atualizar produto');
    console.log('  - DELETE /api/products/:id - Deletar produto');
    console.log('  - POST /api/subscriptions - Criar assinatura');
    console.log('  - GET /api/subscriptions - Listar assinaturas');
    console.log('  - POST /api/subscriptions/:id/cancel - Cancelar assinatura');
    console.log('  - POST /api/billing/process-pending - Processar cobranças (cron)');
    console.log('  - GET /api/billing/stats - Estatísticas de cobrança');
    console.log('');
    console.log('🎯 SISTEMA PRONTO PARA USO!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro na criação das tabelas:', error);
    process.exit(1);
  });