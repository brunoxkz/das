/**
 * SCRIPT PARA CRIAR RESPOSTA COM EMAIL
 * Cria uma resposta de quiz que inclui campo de email para testar o sistema
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function login() {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });

  const data = await response.json();
  return data.accessToken || data.token;
}

async function createQuizResponse(token) {
  const quizResponse = {
    quizId: 'Qm4wxpfPgkMrwoMhDFNLZ', // Quiz com mais respostas
    responses: {
      nome: 'Bruno Tamaso',
      email: 'brunotamaso@gmail.com',
      altura: '1.75',
      peso: '80',
      idade: '35',
      telefone_principal: '11995133932'
    },
    metadata: {
      isComplete: true,
      isPartial: false,
      completionPercentage: 100,
      startTime: Date.now() - 300000, // 5 minutos atrás
      endTime: Date.now(),
      userAgent: 'Mozilla/5.0 (Test Browser)',
      ipAddress: '192.168.1.1'
    }
  };

  console.log('📝 Criando resposta para Bruno Tamaso...');
  
  const response = await fetch(`${API_BASE}/quiz-responses`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(quizResponse)
  });

  const result = await response.json();
  console.log('✅ Resposta criada:', result);
  return result;
}

async function main() {
  console.log('🧪 CRIANDO RESPOSTA DE TESTE PARA EMAIL MARKETING');
  console.log('═══════════════════════════════════════════════════════');

  try {
    const token = await login();
    console.log('✅ Login realizado com sucesso');

    await createQuizResponse(token);
    
    console.log('\n🎯 RESPOSTA CRIADA COM SUCESSO!');
    console.log('📧 Email: brunotamaso@gmail.com');
    console.log('👤 Nome: Bruno Tamaso');
    console.log('📏 Altura: 1.75m');
    console.log('⚖️ Peso: 80kg');
    console.log('🎂 Idade: 35 anos');
    console.log('📱 Telefone: 11995133932');
    console.log('\n✅ Pronto para teste de email marketing!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

main();