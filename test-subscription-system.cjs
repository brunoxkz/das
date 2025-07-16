// Teste completo do sistema de planos e assinaturas
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000';

// Teste de autenticação
async function testAuth() {
  console.log('🔐 Testando autenticação...');
  
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('✅ Autenticação realizada com sucesso');
    return data.token;
  } else {
    console.log('❌ Erro na autenticação:', data.error);
    return null;
  }
}

// Teste do sistema de planos
async function testSubscriptionSystem() {
  console.log('\n🔥 INICIANDO TESTE DO SISTEMA DE PLANOS');
  
  // Autenticar
  const token = await testAuth();
  if (!token) {
    console.log('❌ Não foi possível autenticar');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  // 1. Inicializar planos padrão
  console.log('\n📋 Inicializando planos padrão...');
  try {
    const response = await fetch(`${API_BASE}/api/init-default-plans`, {
      method: 'POST',
      headers
    });
    
    if (response.ok) {
      console.log('✅ Planos padrão inicializados');
    } else {
      console.log('⚠️ Planos já existem ou erro:', await response.text());
    }
  } catch (error) {
    console.log('❌ Erro ao inicializar planos:', error.message);
  }
  
  // 2. Listar planos disponíveis
  console.log('\n📋 Listando planos disponíveis...');
  try {
    const response = await fetch(`${API_BASE}/api/subscription-plans`);
    const plans = await response.json();
    
    if (Array.isArray(plans)) {
      console.log(`✅ ${plans.length} planos encontrados:`);
      plans.forEach(plan => {
        console.log(`  - ${plan.name}: R$ ${plan.price} (${plan.billingInterval})`);
      });
    } else {
      console.log('❌ Erro ao buscar planos:', plans);
    }
  } catch (error) {
    console.log('❌ Erro ao listar planos:', error.message);
  }
  
  // 3. Verificar limites do plano atual
  console.log('\n🔍 Verificando limites do plano atual...');
  try {
    const response = await fetch(`${API_BASE}/api/plan-limits`, { headers });
    const limits = await response.json();
    
    if (limits.quizzes !== undefined) {
      console.log('✅ Limites do plano:');
      console.log(`  - Quizzes: ${limits.quizzes === -1 ? 'Ilimitado' : limits.quizzes}`);
      console.log(`  - Respostas: ${limits.responses === -1 ? 'Ilimitado' : limits.responses}`);
      console.log(`  - SMS: ${limits.sms === -1 ? 'Ilimitado' : limits.sms}`);
      console.log(`  - Email: ${limits.email === -1 ? 'Ilimitado' : limits.email}`);
      console.log(`  - Recursos: ${limits.features.join(', ')}`);
    } else {
      console.log('❌ Erro ao buscar limites:', limits);
    }
  } catch (error) {
    console.log('❌ Erro ao verificar limites:', error.message);
  }
  
  // 4. Verificar acesso a funcionalidades
  console.log('\n🔐 Verificando acesso a funcionalidades...');
  const features = ['quiz_publishing', 'email_campaigns', 'whatsapp_campaigns', 'ai_videos'];
  
  for (const feature of features) {
    try {
      const response = await fetch(`${API_BASE}/api/plan-access/${feature}`, { headers });
      const access = await response.json();
      
      if (access.hasAccess !== undefined) {
        console.log(`  ${access.hasAccess ? '✅' : '❌'} ${feature}: ${access.hasAccess ? 'Permitido' : 'Negado'}`);
      } else {
        console.log(`  ❌ Erro ao verificar ${feature}:`, access);
      }
    } catch (error) {
      console.log(`  ❌ Erro ao verificar ${feature}:`, error.message);
    }
  }
  
  // 5. Verificar expiração do plano
  console.log('\n⏰ Verificando expiração do plano...');
  try {
    const response = await fetch(`${API_BASE}/api/plan-expiration`, { headers });
    const expiration = await response.json();
    
    if (expiration.expired !== undefined) {
      console.log(`✅ Plano ${expiration.expired ? 'EXPIRADO' : 'ATIVO'}`);
    } else {
      console.log('❌ Erro ao verificar expiração:', expiration);
    }
  } catch (error) {
    console.log('❌ Erro ao verificar expiração:', error.message);
  }
  
  // 6. Testar transações de crédito
  console.log('\n💳 Testando transações de crédito...');
  try {
    // Adicionar 100 créditos SMS
    const response = await fetch(`${API_BASE}/api/user-credits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'sms',
        amount: 100,
        operation: 'add',
        reason: 'Teste de sistema'
      })
    });
    
    const result = await response.json();
    
    if (result.smsCredits !== undefined) {
      console.log(`✅ Créditos SMS atualizados: ${result.smsCredits}`);
    } else {
      console.log('❌ Erro ao atualizar créditos:', result);
    }
  } catch (error) {
    console.log('❌ Erro ao testar créditos:', error.message);
  }
  
  // 7. Listar transações de crédito
  console.log('\n📊 Listando transações de crédito...');
  try {
    const response = await fetch(`${API_BASE}/api/credit-transactions`, { headers });
    const transactions = await response.json();
    
    if (Array.isArray(transactions)) {
      console.log(`✅ ${transactions.length} transações encontradas:`);
      transactions.slice(0, 5).forEach(transaction => {
        console.log(`  - ${transaction.type}: ${transaction.operation} ${transaction.amount} (${transaction.reason})`);
      });
    } else {
      console.log('❌ Erro ao buscar transações:', transactions);
    }
  } catch (error) {
    console.log('❌ Erro ao listar transações:', error.message);
  }
  
  // 8. Testar criação de transação de assinatura
  console.log('\n💰 Testando criação de transação de assinatura...');
  try {
    const response = await fetch(`${API_BASE}/api/subscription-transactions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        planId: 'basic-monthly',
        amount: 29.90,
        currency: 'BRL',
        status: 'pending',
        paymentMethod: 'stripe'
      })
    });
    
    const transaction = await response.json();
    
    if (transaction.id) {
      console.log(`✅ Transação criada: ${transaction.id} - ${transaction.status}`);
    } else {
      console.log('❌ Erro ao criar transação:', transaction);
    }
  } catch (error) {
    console.log('❌ Erro ao testar transação:', error.message);
  }
  
  // 9. Listar transações de assinatura
  console.log('\n📋 Listando transações de assinatura...');
  try {
    const response = await fetch(`${API_BASE}/api/subscription-transactions`, { headers });
    const transactions = await response.json();
    
    if (Array.isArray(transactions)) {
      console.log(`✅ ${transactions.length} transações encontradas:`);
      transactions.forEach(transaction => {
        console.log(`  - ${transaction.planId}: R$ ${transaction.amount} (${transaction.status})`);
      });
    } else {
      console.log('❌ Erro ao buscar transações:', transactions);
    }
  } catch (error) {
    console.log('❌ Erro ao listar transações:', error.message);
  }
  
  console.log('\n🎯 TESTE DO SISTEMA DE PLANOS CONCLUÍDO');
}

// Executar teste
testSubscriptionSystem().catch(console.error);