#!/usr/bin/env node

import Database from 'better-sqlite3';
import fetch from 'node-fetch';

// Testar conexão com banco de dados
console.log('🔍 TESTANDO CONEXÃO COM BANCO DE DADOS');

try {
  const db = new Database('database.sqlite');
  
  // Verificar se tabela existe
  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='stripe_plans'
  `).get();
  
  console.log('✅ TABELA STRIPE_PLANS EXISTE:', tableExists);
  
  // Buscar planos
  const plans = db.prepare(`
    SELECT id, name, description, price, active 
    FROM stripe_plans 
    WHERE active = 1
  `).all();
  
  console.log('📋 PLANOS ENCONTRADOS:', plans);
  
  // Buscar plano específico
  const plan2 = db.prepare(`
    SELECT id, name, description, price, currency, interval, trial_period_days, activation_fee, features, stripe_product_id, stripe_price_id, active
    FROM stripe_plans 
    WHERE id = ? AND active = 1
  `).get(2);
  
  console.log('📋 PLANO ID 2:', plan2);
  
  db.close();
} catch (error) {
  console.error('❌ ERRO NO BANCO DE DADOS:', error);
}

// Testar endpoint público
console.log('\n🔍 TESTANDO ENDPOINT PÚBLICO');

try {
  const response = await fetch('http://localhost:5000/api/public/checkout/plan/2', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  
  const contentType = response.headers.get('content-type');
  console.log('📋 CONTENT-TYPE:', contentType);
  console.log('📋 STATUS:', response.status);
  
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    console.log('✅ RESPOSTA JSON:', data);
  } else {
    const text = await response.text();
    console.log('❌ RESPOSTA HTML/TEXT (primeiros 200 chars):', text.substring(0, 200));
  }
} catch (error) {
  console.error('❌ ERRO NO ENDPOINT:', error);
}

// Testar endpoint de todos os planos
console.log('\n🔍 TESTANDO ENDPOINT DE TODOS OS PLANOS');

try {
  const response = await fetch('http://localhost:5000/api/public/checkout/plans', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  
  const contentType = response.headers.get('content-type');
  console.log('📋 CONTENT-TYPE:', contentType);
  console.log('📋 STATUS:', response.status);
  
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    console.log('✅ RESPOSTA JSON:', data);
  } else {
    const text = await response.text();
    console.log('❌ RESPOSTA HTML/TEXT (primeiros 200 chars):', text.substring(0, 200));
  }
} catch (error) {
  console.error('❌ ERRO NO ENDPOINT:', error);
}