#!/usr/bin/env node

/**
 * TESTE SIMPLES DA API DE TRIAL CUSTOMIZADO
 * Testa apenas a API sem interface gráfica
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

async function testAPI() {
  console.log('🚀 Testando API de Trial Customizado...\n');

  try {
    // 1. LOGIN
    console.log('1. Fazendo login...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Falha no login');
      return;
    }

    const { accessToken } = await loginResponse.json();
    console.log('✅ Login realizado com sucesso');

    // 2. TESTE ENDPOINT BÁSICO
    console.log('\n2. Testando endpoint básico...');
    const basicResponse = await fetch(`${API_BASE}/api/stripe/test-endpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' })
    });

    if (basicResponse.ok) {
      const basicData = await basicResponse.json();
      console.log('✅ Endpoint básico funcionando:', basicData.message);
    } else {
      console.log('❌ Endpoint básico falhou');
    }

    // 3. CRIAR TRIAL CUSTOMIZADO
    console.log('\n3. Criando trial customizado...');
    const trialResponse = await fetch(`${API_BASE}/api/stripe/create-custom-trial`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        planName: 'Teste API',
        trialAmount: 5.00,
        trialDays: 7,
        recurringAmount: 25.00,
        recurringInterval: 'month'
      })
    });

    if (trialResponse.ok) {
      const trialData = await trialResponse.json();
      console.log('✅ Trial criado com sucesso!');
      console.log('📋 Subscription Schedule ID:', trialData.subscriptionScheduleId);
      console.log('💳 Payment Intent ID:', trialData.trialPaymentIntentId);
      console.log('🔗 Checkout URL:', trialData.checkoutUrl ? 'Disponível' : 'Não disponível');
    } else {
      console.log('❌ Falha ao criar trial');
      const errorText = await trialResponse.text();
      console.log('Erro:', errorText);
    }

    console.log('\n🎉 Teste da API concluído!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

testAPI();