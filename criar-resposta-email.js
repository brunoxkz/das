/**
 * SCRIPT PARA CRIAR RESPOSTA COM EMAIL
 * Cria uma resposta de quiz que inclui campo de email para testar o sistema
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function login() {
  console.log('🔐 Fazendo login...');
  
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    }),
  });

  const data = await response.json();
  return data.accessToken;
}

async function createQuizResponse(token) {
  console.log('📝 Criando resposta de quiz com email...');
  
  const quizId = 'ey15ofZ96pBzDIWv_k19T'; // ID do quiz de teste
  
  const responseData = {
    quizId: quizId,
    responses: [
      {
        elementId: 1752037212829,
        elementType: 'text',
        elementFieldId: 'nome',
        answer: 'João da Silva'
      },
      {
        elementId: 1752037212830,
        elementType: 'email',
        elementFieldId: 'email_contato',
        answer: 'brunotamaso@gmail.com'
      },
      {
        elementId: 1752037212831,
        elementType: 'text',
        elementFieldId: 'telefone',
        answer: '11999887766'
      },
      {
        elementId: 1752037212832,
        elementType: 'number',
        elementFieldId: 'idade',
        answer: '28'
      }
    ],
    metadata: {
      isComplete: true,
      completionPercentage: 100,
      isPartial: false
    }
  };

  const response = await fetch(`${BASE_URL}/api/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(responseData)
  });

  const result = await response.json();
  
  if (response.ok) {
    console.log('✅ Resposta criada com sucesso:', result.responseId);
    return result.responseId;
  } else {
    console.error('❌ Erro ao criar resposta:', result);
    throw new Error(`Erro ao criar resposta: ${result.error}`);
  }
}

async function main() {
  try {
    const token = await login();
    const responseId = await createQuizResponse(token);
    
    console.log('\n🎉 RESPOSTA COM EMAIL CRIADA COM SUCESSO!');
    console.log('📧 Email incluído: joao.silva@vendzz.com.br');
    console.log('📝 Response ID:', responseId);
    console.log('\nAgora você pode executar o teste de email marketing completo.');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

main();