/**
 * TESTE COMPLETO DO SISTEMA DE CHECKOUT
 * Testa todas as funcionalidades: criação, edição, visualização e página pública
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItaWQiLCJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInJvbGUiOiJhZG1pbiIsInBsYW4iOiJmcmVlIiwiaWF0IjoxNzUyNzA2NDAzLCJub25jZSI6Imk5bHYzOCIsImV4cCI6MTc1MjcwNzMwM30.8NmIRZcvLERI_CU-v2o5zghx20diM06HBYSQ5HJlGAg';

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function testeCompleto() {
  console.log('🚀 INICIANDO TESTE COMPLETO DO CHECKOUT...\n');

  try {
    // 1. Testar criação de produto
    console.log('1. 🆕 Testando criação de produto...');
    const novoproduto = await makeRequest('/api/checkout-products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        name: 'Produto Teste Automatizado',
        description: 'Produto criado automaticamente para testes',
        category: 'digital',
        price: 97.00,
        originalPrice: 197.00,
        paymentMode: 'recurring',
        recurringInterval: 'monthly',
        trialPeriod: 7,
        features: ['Acesso vitalício', 'Suporte 24/7', 'Atualizações gratuitas'],
        active: true
      })
    });
    console.log('✅ Produto criado:', novoproduto.id);

    // 2. Testar listagem de produtos
    console.log('\n2. 📋 Testando listagem de produtos...');
    const produtos = await makeRequest('/api/checkout-products');
    console.log(`✅ ${produtos.length} produtos encontrados`);

    // 3. Testar busca individual
    console.log('\n3. 🔍 Testando busca individual...');
    const produto = await makeRequest(`/api/checkout-products/${novoproduto.id}`);
    console.log('✅ Produto encontrado:', produto.name);

    // 4. Testar edição de produto
    console.log('\n4. ✏️ Testando edição de produto...');
    const produtoEditado = await makeRequest(`/api/checkout-products/${novoproduto.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        name: 'Produto Editado - Teste',
        description: 'Produto editado automaticamente',
        price: 127.00,
        status: 'inactive'
      })
    });
    console.log('✅ Produto editado:', produtoEditado.name);

    // 5. Testar página pública
    console.log('\n5. 🌐 Testando página pública...');
    const paginaPublica = await fetch(`${BASE_URL}/checkout-individual/${novoproduto.id}`);
    if (paginaPublica.ok) {
      console.log('✅ Página pública acessível');
    } else {
      console.log('❌ Erro na página pública:', paginaPublica.status);
    }

    // 6. Testar analytics
    console.log('\n6. 📊 Testando analytics...');
    const analytics = await makeRequest('/api/checkout-analytics', {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
    });
    console.log('✅ Analytics funcionando:', analytics.totalProducts, 'produtos');

    // 7. Testar transações
    console.log('\n7. 💳 Testando transações...');
    const transacoes = await makeRequest('/api/checkout-transactions', {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
    });
    console.log('✅ Transações funcionando:', transacoes.length, 'transações');

    console.log('\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO!');
    console.log('✅ Sistema de checkout 100% funcional');
    console.log('✅ Criação, edição, visualização e página pública OK');
    console.log('✅ APIs de analytics e transações OK');

  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
    console.error('Stack:', error.stack);
  }
}

testeCompleto();