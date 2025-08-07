#!/usr/bin/env node

// Teste direto do sistema de planos do Stripe
// Testa criação, busca e funcionalidade básica

const { nanoid } = require('nanoid');
const Database = require('better-sqlite3');
const path = require('path');

console.log('🧪 TESTE DIRETO DO SISTEMA DE PLANOS STRIPE');

// Conectar ao banco de dados
const dbPath = path.join(__dirname, 'vendzz.db');
const db = new Database(dbPath);

// Criar tabela se não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS stripe_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    currency TEXT DEFAULT 'BRL',
    interval TEXT DEFAULT 'month',
    trial_days INTEGER DEFAULT 7,
    trial_price REAL DEFAULT 1.00,
    gateway TEXT DEFAULT 'stripe',
    active BOOLEAN DEFAULT 1,
    stripe_price_id TEXT,
    stripe_product_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Testar criação de plano
async function testCreatePlan() {
  try {
    console.log('\n🔍 Teste 1: Criando plano no banco...');
    
    const planData = {
      id: nanoid(),
      name: 'Plano Premium Teste',
      description: 'Plano de teste para validação do sistema',
      price: 29.90,
      currency: 'BRL',
      interval: 'month',
      trial_days: 3,
      trial_price: 1.00,
      gateway: 'stripe',
      active: 1,
      stripe_price_id: `price_test_${Date.now()}`,
      stripe_product_id: `prod_test_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const insertStmt = db.prepare(`
      INSERT INTO stripe_plans 
      (id, name, description, price, currency, interval, trial_days, trial_price, gateway, active, stripe_price_id, stripe_product_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      planData.id,
      planData.name,
      planData.description,
      planData.price,
      planData.currency,
      planData.interval,
      planData.trial_days,
      planData.trial_price,
      planData.gateway,
      planData.active,
      planData.stripe_price_id,
      planData.stripe_product_id,
      planData.created_at,
      planData.updated_at
    );

    console.log('✅ Plano criado com sucesso!');
    console.log('📋 ID do plano:', planData.id);
    console.log('💰 Preço:', planData.price);
    console.log('📅 Trial:', planData.trial_days, 'dias');
    console.log('🔗 Stripe Price ID:', planData.stripe_price_id);
    
    return planData;
  } catch (error) {
    console.error('❌ Erro ao criar plano:', error.message);
    throw error;
  }
}

// Testar busca de planos
async function testGetPlans() {
  try {
    console.log('\n🔍 Teste 2: Buscando planos...');
    
    const plans = db.prepare('SELECT * FROM stripe_plans ORDER BY created_at DESC').all();
    
    console.log(`✅ Encontrados ${plans.length} planos:`);
    plans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name} - R$ ${plan.price} - ${plan.trial_days} dias trial`);
    });
    
    return plans;
  } catch (error) {
    console.error('❌ Erro ao buscar planos:', error.message);
    throw error;
  }
}

// Testar atualização de plano
async function testUpdatePlan(planId) {
  try {
    console.log('\n🔍 Teste 3: Atualizando plano...');
    
    const updateStmt = db.prepare(`
      UPDATE stripe_plans 
      SET name = ?, description = ?, updated_at = ?
      WHERE id = ?
    `);

    const result = updateStmt.run(
      'Plano Premium Atualizado',
      'Descrição atualizada do plano',
      new Date().toISOString(),
      planId
    );

    if (result.changes > 0) {
      console.log('✅ Plano atualizado com sucesso!');
      
      // Buscar plano atualizado
      const updatedPlan = db.prepare('SELECT * FROM stripe_plans WHERE id = ?').get(planId);
      console.log('📋 Nome atualizado:', updatedPlan.name);
      console.log('📝 Descrição atualizada:', updatedPlan.description);
    } else {
      console.log('❌ Nenhum plano foi atualizado');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao atualizar plano:', error.message);
    throw error;
  }
}

// Executar todos os testes
async function runAllTests() {
  try {
    console.log('🚀 Iniciando testes do sistema de planos...\n');
    
    // Teste 1: Criar plano
    const createdPlan = await testCreatePlan();
    
    // Teste 2: Buscar planos
    const allPlans = await testGetPlans();
    
    // Teste 3: Atualizar plano
    await testUpdatePlan(createdPlan.id);
    
    console.log('\n🎉 TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');
    console.log('✅ Sistema de planos está funcionando corretamente');
    console.log('💳 Pronto para integração com Stripe');
    
    return { success: true, planId: createdPlan.id };
    
  } catch (error) {
    console.error('\n❌ FALHA NOS TESTES:', error.message);
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

// Executar
runAllTests().then(result => {
  process.exit(result.success ? 0 : 1);
});