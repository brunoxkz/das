#!/usr/bin/env node

// TESTE SIMPLES DO SISTEMA DE BLOQUEIO
// Verifica se as funções RBAC estão funcionando

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItaWQiLCJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInJvbGUiOiJhZG1pbiIsInBsYW4iOiJmcmVlIiwiaWF0IjoxNzUyOTkwNTYwLCJub25jZSI6ImlpY2VjMiIsImV4cCI6MTc1Mjk5MTQ2MH0.x4UF064H_FsyUoDmAd_01OqfhIThSV2Y0cM29zaSTcY';

async function testQuizCreation() {
  console.log('\n🧪 TESTANDO CRIAÇÃO DE QUIZ...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({
        title: 'Quiz Teste Bloqueio Final',
        description: 'Teste final do sistema de bloqueio',
        structure: {
          pages: [{
            id: Date.now(),
            title: 'Página de Teste',
            elements: []
          }]
        }
      })
    });

    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Response:`, data);
    
    if (response.status === 402 && data.blocked) {
      console.log('✅ BLOQUEIO FUNCIONANDO: Quiz criação bloqueada corretamente');
      return true;
    } else if (response.status === 201) {
      console.log('⚠️ Quiz criado sem bloqueio - verificar regras de negócio');
      return false;
    } else {
      console.log(`⚠️ Status inesperado: ${response.status}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    return false;
  }
}

async function testSMSCampaign() {
  console.log('\n🧪 TESTANDO CAMPANHA SMS...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/sms-campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({
        name: 'Teste SMS Final',
        quizId: 'test-quiz-id',
        message: 'Mensagem de teste',
        targetAudience: 'all'
      })
    });

    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Response:`, data);
    
    if (response.status === 402 && data.blocked) {
      console.log('✅ BLOQUEIO FUNCIONANDO: SMS campanha bloqueada corretamente');
      return true;
    } else {
      console.log(`⚠️ SMS campanha não bloqueada - Status: ${response.status}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro no teste SMS:', error.message);
    return false;
  }
}

async function testRBACFunctions() {
  console.log('\n🧪 TESTANDO FUNÇÕES RBAC DIRETAMENTE...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/test-rbac`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 RBAC Response:', data);
      return data.isBlocked;
    } else {
      console.log('⚠️ Endpoint RBAC não disponível');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar RBAC:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 INICIANDO TESTE SIMPLES DE BLOQUEIO');
  console.log('=' * 50);
  
  const results = {
    quiz: await testQuizCreation(),
    sms: await testSMSCampaign(),
    rbac: await testRBACFunctions()
  };
  
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('=' * 50);
  console.log(`Quiz Creation Blocked: ${results.quiz ? '✅' : '❌'}`);
  console.log(`SMS Campaign Blocked: ${results.sms ? '✅' : '❌'}`);
  console.log(`RBAC Functions: ${results.rbac ? '✅' : '❌'}`);
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.values(results).length;
  
  console.log(`\n📈 Taxa de sucesso: ${passed}/${total} (${((passed/total)*100).toFixed(1)}%)`);
  
  if (passed === total) {
    console.log('🎉 SISTEMA DE BLOQUEIO FUNCIONANDO PERFEITAMENTE!');
  } else {
    console.log('⚠️ SISTEMA PRECISA DE AJUSTES');
  }
}

main().catch(console.error);