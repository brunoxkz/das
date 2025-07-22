#!/usr/bin/env node

const fetch = require('node-fetch');

console.log('🔍 TESTE: Correção de Schema SQLite - Verificação Sistema ULTRA');
console.log('===============================================================');

async function testSchemaFix() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('1️⃣ Testando login e obtendo token...');
  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@admin.com',
      password: 'admin123'
    })
  });
  
  const loginResult = await loginResponse.json();
  
  if (!loginResult.accessToken) {
    console.log('❌ Login failed:', JSON.stringify(loginResult));
    return;
  }
  
  const token = loginResult.accessToken;
  console.log('✅ Token obtido:', token.substring(0, 20) + '...');

  console.log('\n2️⃣ Testando endpoint variables-ultra...');
  const ultraResponse = await fetch(`${baseUrl}/api/quizzes/G6_IWd6lNpzIlnqb6EVnm/variables-ultra`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (ultraResponse.ok) {
    const ultraData = await ultraResponse.json();
    console.log('✅ Sistema ULTRA funcionando!');
    console.log('📊 Dados encontrados:', JSON.stringify(ultraData, null, 2));
  } else {
    const errorText = await ultraResponse.text();
    console.log('❌ Erro no sistema ULTRA:', ultraResponse.status, errorText);
  }

  console.log('\n3️⃣ Testando Quiz getUserQuizzes...');
  const quizzesResponse = await fetch(`${baseUrl}/api/quizzes`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (quizzesResponse.ok) {
    const quizzes = await quizzesResponse.json();
    console.log('✅ getUserQuizzes funcionando!');
    console.log('📋 Quantidade de quizzes:', quizzes.length);
  } else {
    const errorText = await quizzesResponse.text();
    console.log('❌ Erro em getUserQuizzes:', quizzesResponse.status, errorText);
  }

  console.log('\n4️⃣ Testando dashboard stats...');
  const statsResponse = await fetch(`${baseUrl}/api/dashboard/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (statsResponse.ok) {
    const stats = await statsResponse.json();
    console.log('✅ Dashboard stats funcionando!');
    console.log('📊 Estatísticas:', JSON.stringify(stats, null, 2));
  } else {
    const errorText = await statsResponse.text();
    console.log('❌ Erro no dashboard stats:', statsResponse.status, errorText);
  }
}

testSchemaFix().catch(console.error);