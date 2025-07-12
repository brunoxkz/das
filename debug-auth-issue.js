/**
 * DEBUG ESPECÍFICO - PROBLEMA DE AUTENTICAÇÃO
 * Investigar por que o login não está retornando token
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function debugAuth() {
  console.log('🔍 DEBUGANDO PROBLEMA DE AUTENTICAÇÃO');
  
  try {
    // Teste login detalhado
    console.log('\n=== TESTANDO LOGIN DETALHADO ===');
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VendzzDebug/1.0'
      },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers));
    console.log('Body (raw):', text);
    
    try {
      const data = JSON.parse(text);
      console.log('Body (parsed):', data);
    } catch (e) {
      console.log('❌ Erro ao parsear JSON:', e.message);
    }
    
    // Teste endpoint simples
    console.log('\n=== TESTANDO ENDPOINT SIMPLES ===');
    
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthText = await healthResponse.text();
    console.log('Health Status:', healthResponse.status);
    console.log('Health Body:', healthText);
    
    // Teste dashboard sem auth
    console.log('\n=== TESTANDO DASHBOARD SEM AUTH ===');
    
    const dashResponse = await fetch(`${BASE_URL}/api/dashboard`);
    const dashText = await dashResponse.text();
    console.log('Dashboard Status:', dashResponse.status);
    console.log('Dashboard Body (primeiros 200 chars):', dashText.substring(0, 200));
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

debugAuth();