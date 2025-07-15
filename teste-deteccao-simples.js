#!/usr/bin/env node

const API_BASE = 'http://localhost:5000';

async function testarDeteccao() {
  console.log('🔍 TESTE SIMPLES DE DETECÇÃO');
  
  // Teste número chinês
  console.log('\n--- Testando número chinês ---');
  const response = await fetch(`${API_BASE}/api/sms/direct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phone: '8613812345678',
      message: 'Olá! Produto com R$50 OFF. Aproveite!'
    })
  });
  
  const result = await response.json();
  console.log('Resultado:', result);
  
  // Teste número brasileiro
  console.log('\n--- Testando número brasileiro ---');
  const response2 = await fetch(`${API_BASE}/api/sms/direct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phone: '5511995133932',
      message: 'Olá! Produto com R$50 OFF. Aproveite!'
    })
  });
  
  const result2 = await response2.json();
  console.log('Resultado:', result2);
  
  // Teste número americano
  console.log('\n--- Testando número americano ---');
  const response3 = await fetch(`${API_BASE}/api/sms/direct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phone: '15551234567',
      message: 'Olá! Produto com R$50 OFF. Aproveite!'
    })
  });
  
  const result3 = await response3.json();
  console.log('Resultado:', result3);
}

testarDeteccao().catch(console.error);