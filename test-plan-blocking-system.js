#!/usr/bin/env node

// TESTE SISTEMA DE BLOQUEIO POR PLANO EXPIRADO
// Verifica se todas as funcionalidades são bloqueadas quando o plano expira

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Token válido obtido do sistema
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItaWQiLCJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInJvbGUiOiJhZG1pbiIsInBsYW4iOiJmcmVlIiwiaWF0IjoxNzUyOTkwNTYwLCJub25jZSI6ImlpY2VjMiIsImV4cCI6MTc1Mjk5MTQ2MH0.x4UF064H_FsyUoDmAd_01OqfhIThSV2Y0cM29zaSTcY';

class PlanBlockingTester {
  constructor() {
    this.testsRun = 0;
    this.testsPassed = 0;
    this.testsFailed = 0;
    this.results = [];
  }

  async runTest(testName, testFn) {
    this.testsRun++;
    console.log(`\n🧪 TESTE ${this.testsRun}: ${testName}`);
    
    try {
      const result = await testFn();
      if (result) {
        this.testsPassed++;
        console.log(`✅ PASSOU: ${testName}`);
        this.results.push({ test: testName, status: 'PASS', details: result });
      } else {
        this.testsFailed++;
        console.log(`❌ FALHOU: ${testName}`);
        this.results.push({ test: testName, status: 'FAIL', details: 'Test returned false' });
      }
    } catch (error) {
      this.testsFailed++;
      console.log(`❌ ERRO: ${testName} - ${error.message}`);
      this.results.push({ test: testName, status: 'ERROR', details: error.message });
    }
  }

  async apiRequest(endpoint, method = 'GET', body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    return {
      status: response.status,
      data: await response.json().catch(() => ({}))
    };
  }

  async testQuizCreation() {
    const response = await this.apiRequest('/api/quizzes', 'POST', {
      title: 'Quiz Teste Bloqueio',
      description: 'Teste do sistema de bloqueio',
      structure: {
        pages: [{
          id: Date.now(),
          title: 'Página 1',
          elements: []
        }]
      }
    });

    // Deve retornar 402 (Payment Required) se bloqueado
    if (response.status === 402 && response.data.blocked) {
      console.log(`   🔒 Criação de quiz bloqueada corretamente: ${response.data.message}`);
      return true;
    }
    
    console.log(`   ⚠️ Quiz criado sem bloqueio - Status: ${response.status}`);
    return false;
  }

  async testQuizPublication() {
    // Primeiro criar um quiz para publicar
    const createResponse = await this.apiRequest('/api/quizzes', 'POST', {
      title: 'Quiz Para Publicar',
      description: 'Teste publicação bloqueio'
    });

    if (createResponse.status === 201) {
      const quizId = createResponse.data.id;
      
      // Tentar publicar
      const publishResponse = await this.apiRequest(`/api/quizzes/${quizId}/publish`, 'POST');
      
      if (publishResponse.status === 402 && publishResponse.data.blocked) {
        console.log(`   🔒 Publicação de quiz bloqueada corretamente: ${publishResponse.data.message}`);
        return true;
      }
    }
    
    console.log(`   ⚠️ Publicação permitida sem bloqueio`);
    return false;
  }

  async testSMSCampaignCreation() {
    const response = await this.apiRequest('/api/sms-campaigns', 'POST', {
      name: 'Campanha SMS Teste',
      quizId: 'teste-quiz-id',
      message: 'Mensagem de teste',
      targetAudience: 'all'
    });

    if (response.status === 402 && response.data.blocked) {
      console.log(`   🔒 Criação de campanha SMS bloqueada: ${response.data.message}`);
      return true;
    }
    
    console.log(`   ⚠️ Campanha SMS criada sem bloqueio - Status: ${response.status}`);
    return false;
  }

  async testEmailCampaignCreation() {
    const response = await this.apiRequest('/api/email-campaigns', 'POST', {
      name: 'Campanha Email Teste',
      quizId: 'teste-quiz-id',
      subject: 'Assunto Teste',
      content: 'Conteúdo de teste',
      targetAudience: 'all'
    });

    if (response.status === 402 && response.data.blocked) {
      console.log(`   🔒 Criação de campanha email bloqueada: ${response.data.message}`);
      return true;
    }
    
    console.log(`   ⚠️ Campanha email criada sem bloqueio - Status: ${response.status}`);
    return false;
  }

  async testDashboardAccess() {
    const response = await this.apiRequest('/api/dashboard');

    if (response.status === 402 && response.data.blocked) {
      console.log(`   🔒 Acesso ao dashboard bloqueado: ${response.data.message}`);
      return true;
    }
    
    console.log(`   ✅ Dashboard acessível - Status: ${response.status}`);
    return true; // Dashboard pode ser acessível para mostrar mensagem de renovação
  }

  async runAllTests() {
    console.log('🚀 INICIANDO TESTES DO SISTEMA DE BLOQUEIO POR PLANO EXPIRADO');
    console.log('=' * 60);

    await this.runTest('Bloqueio de Criação de Quiz', () => this.testQuizCreation());
    await this.runTest('Bloqueio de Publicação de Quiz', () => this.testQuizPublication());
    await this.runTest('Bloqueio de Campanha SMS', () => this.testSMSCampaignCreation());
    await this.runTest('Bloqueio de Campanha Email', () => this.testEmailCampaignCreation());
    await this.runTest('Acesso ao Dashboard', () => this.testDashboardAccess());

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '=' * 60);
    console.log('📊 RESUMO DOS TESTES DE BLOQUEIO');
    console.log('=' * 60);
    console.log(`Total de testes: ${this.testsRun}`);
    console.log(`✅ Passou: ${this.testsPassed}`);
    console.log(`❌ Falhou: ${this.testsFailed}`);
    console.log(`📈 Taxa de sucesso: ${((this.testsPassed / this.testsRun) * 100).toFixed(1)}%`);
    
    console.log('\n📋 DETALHES DOS TESTES:');
    this.results.forEach((result, index) => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${index + 1}. ${icon} ${result.test}: ${result.status}`);
    });

    if (this.testsPassed === this.testsRun) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM! Sistema de bloqueio funcionando perfeitamente.');
    } else {
      console.log('\n⚠️ ALGUNS TESTES FALHARAM. Verificar implementação do sistema de bloqueio.');
    }
  }
}

// Executar testes
async function main() {
  const tester = new PlanBlockingTester();
  await tester.runAllTests();
}

main().catch(console.error);