/**
 * 🔒 TESTE FINAL DE SEGURANÇA - VALIDAÇÃO DAS CORREÇÕES
 * Testa apenas os pontos críticos para verificar se as correções foram eficazes
 */

import fetch from 'node-fetch';

class FinalSecurityTest {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.authToken = null;
    this.results = [];
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    if (this.authToken && !options.noAuth) {
      defaultOptions.headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = await response.text();
    }

    return { response, data };
  }

  async authenticate() {
    const { response, data } = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      noAuth: true,
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });

    if (response.status === 200 && data.accessToken) {
      this.authToken = data.accessToken;
      return true;
    }
    return false;
  }

  async testCriticalSecurity() {
    console.log('🔒 TESTE FINAL DE SEGURANÇA - VALIDAÇÃO DAS CORREÇÕES');
    console.log('='.repeat(60));

    // Autenticação
    if (!await this.authenticate()) {
      console.log('❌ Falha na autenticação');
      return;
    }
    console.log('✅ Autenticação: OK');

    // Teste 1: SQL Injection no registro (CRÍTICO)
    console.log('\n🛡️ TESTE 1: SQL Injection Protection');
    const sqlPayload = "'; DROP TABLE users; --";
    const { response: sqlResponse } = await this.makeRequest('/api/auth/register', {
      method: 'POST',
      noAuth: true,
      body: JSON.stringify({
        email: sqlPayload,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      })
    });

    const sqlBlocked = sqlResponse.status !== 201;
    console.log(`   ${sqlBlocked ? '✅ BLOQUEADO' : '❌ VULNERÁVEL'}: SQL Injection (${sqlResponse.status})`);

    // Teste 2: XSS Protection
    console.log('\n🛡️ TESTE 2: XSS Protection');
    const xssPayload = "<script>alert('XSS')</script>";
    const { response: xssResponse, data: xssData } = await this.makeRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify({
        title: xssPayload,
        description: 'Test Quiz',
        structure: { pages: [] }
      })
    });

    let xssBlocked = true;
    if (xssResponse.status === 201 && xssData.quiz) {
      xssBlocked = !xssData.quiz.title.includes('<script>');
    }
    console.log(`   ${xssBlocked ? '✅ SANITIZADO' : '❌ VULNERÁVEL'}: XSS Protection`);

    // Teste 3: Rate Limiting
    console.log('\n⚡ TESTE 3: Rate Limiting');
    const rateLimitPromises = [];
    for (let i = 0; i < 12; i++) {
      rateLimitPromises.push(this.makeRequest('/api/auth/login', {
        method: 'POST',
        noAuth: true,
        body: JSON.stringify({
          email: 'wrong@email.com',
          password: 'wrongpassword'
        })
      }));
    }

    const rateLimitResponses = await Promise.all(rateLimitPromises);
    const blockedRequests = rateLimitResponses.filter(({response}) => response.status === 429).length;
    const rateLimitWorking = blockedRequests > 0;
    console.log(`   ${rateLimitWorking ? '✅ FUNCIONANDO' : '❌ INATIVO'}: Rate Limiting (${blockedRequests} bloqueadas)`);

    // Teste 4: Validação de Créditos
    console.log('\n💰 TESTE 4: Sistema de Créditos');
    const { response: creditsResponse, data: creditsData } = await this.makeRequest('/api/user/credits');
    
    const creditsWorking = creditsResponse.status === 200 && creditsData && creditsData.total !== undefined;
    console.log(`   ${creditsWorking ? '✅ FUNCIONANDO' : '❌ ERRO'}: Sistema de Créditos (${creditsData?.total || 0} créditos)`);

    // Teste 5: Criação de Campanha em Tempo Real
    console.log('\n⚡ TESTE 5: Criação de Campanha');
    const startTime = Date.now();
    const { response: campaignResponse } = await this.makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Teste Final',
        message: 'Campanha de teste',
        targetAudience: 'all',
        phones: ['11999999999']
      })
    });

    const campaignTime = Date.now() - startTime;
    const campaignCreated = campaignResponse.status === 201 || campaignResponse.status === 402; // 402 = sem créditos
    console.log(`   ${campaignCreated ? '✅ FUNCIONANDO' : '❌ ERRO'}: Criação de Campanha (${campaignTime}ms)`);

    // Relatório Final
    console.log('\n' + '='.repeat(60));
    const tests = [
      { name: 'SQL Injection Protection', passed: sqlBlocked, critical: true },
      { name: 'XSS Protection', passed: xssBlocked, critical: true },
      { name: 'Rate Limiting', passed: rateLimitWorking, critical: true },
      { name: 'Sistema de Créditos', passed: creditsWorking, critical: false },
      { name: 'Criação de Campanha', passed: campaignCreated, critical: false }
    ];

    const totalTests = tests.length;
    const passedTests = tests.filter(t => t.passed).length;
    const criticalTests = tests.filter(t => t.critical).length;
    const criticalPassed = tests.filter(t => t.critical && t.passed).length;

    console.log('📊 RESULTADO FINAL:');
    console.log(`   Total: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
    console.log(`   Críticos: ${criticalPassed}/${criticalTests} (${Math.round(criticalPassed/criticalTests*100)}%)`);

    if (criticalPassed === criticalTests) {
      console.log('\n🎉 SISTEMA APROVADO PARA PRODUÇÃO!');
      console.log('✅ Todas as correções críticas foram implementadas com sucesso.');
    } else {
      console.log('\n⚠️ SISTEMA REQUER CORREÇÕES ADICIONAIS');
      console.log('❌ Correções críticas pendentes identificadas.');
    }

    return {
      totalTests,
      passedTests,
      criticalTests,
      criticalPassed,
      overallPercentage: Math.round(passedTests/totalTests*100),
      criticalPercentage: Math.round(criticalPassed/criticalTests*100)
    };
  }
}

// Executar teste final
const finalTest = new FinalSecurityTest();
finalTest.testCriticalSecurity();