/**
 * TESTE SIMULAÇÃO USUÁRIO REAL - VALIDAÇÃO ESSENCIAL
 * Simula exatamente como um usuário real usaria o sistema
 * Foca nas principais funcionalidades sem delays desnecessários
 */

const fetch = globalThis.fetch;
const BASE_URL = 'http://localhost:5000';
let authToken = null;

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message, status: 0 };
  }
}

function logTest(title, success, details = '', timing = '') {
  const status = success ? '✅' : '❌';
  const timeInfo = timing ? ` (${timing})` : '';
  console.log(`${status} ${title}${timeInfo}`);
  if (details) {
    console.log(`   💭 ${details}`);
  }
}

async function executarTeste() {
  console.log('🎯 TESTE SIMULAÇÃO USUÁRIO REAL - VALIDAÇÃO ESSENCIAL');
  console.log('='.repeat(70));
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
  };
  
  // 1. LOGIN - Primeira experiência do usuário
  console.log('\n1. 🔐 LOGIN E AUTENTICAÇÃO');
  const loginStart = Date.now();
  const loginResult = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  const loginTime = Date.now() - loginStart;
  
  results.total++;
  if (loginResult.success && (loginResult.data.token || loginResult.data.accessToken)) {
    authToken = loginResult.data.token || loginResult.data.accessToken;
    results.passed++;
    logTest('Login realizado', true, 'Usuário autenticado com sucesso', `${loginTime}ms`);
  } else {
    results.failed++;
    logTest('Login realizado', false, 'Falha na autenticação', `${loginTime}ms`);
    results.details.push('LOGIN_FAILED');
  }
  
  // 2. DASHBOARD - Primeira visão do sistema
  console.log('\n2. 📊 DASHBOARD E ESTATÍSTICAS');
  const dashStart = Date.now();
  const dashResult = await makeRequest('/api/dashboard-stats');
  const dashTime = Date.now() - dashStart;
  
  results.total++;
  if (dashResult.success && dashResult.data.totalQuizzes !== undefined) {
    results.passed++;
    logTest('Dashboard carregado', true, 
      `${dashResult.data.totalQuizzes} quizzes, ${dashResult.data.totalLeads || 0} leads`, 
      `${dashTime}ms`);
  } else {
    results.failed++;
    logTest('Dashboard carregado', false, 'Erro ao carregar estatísticas', `${dashTime}ms`);
    results.details.push('DASHBOARD_FAILED');
  }
  
  // 3. LISTA DE QUIZZES - Exploração do conteúdo
  console.log('\n3. 📋 LISTA DE QUIZZES');
  const quizzesStart = Date.now();
  const quizzesResult = await makeRequest('/api/quizzes');
  const quizzesTime = Date.now() - quizzesStart;
  
  results.total++;
  if (quizzesResult.success && Array.isArray(quizzesResult.data)) {
    results.passed++;
    logTest('Quizzes listados', true, 
      `${quizzesResult.data.length} quizzes disponíveis`, 
      `${quizzesTime}ms`);
  } else {
    results.failed++;
    logTest('Quizzes listados', false, 'Erro ao listar quizzes', `${quizzesTime}ms`);
    results.details.push('QUIZZES_LIST_FAILED');
  }
  
  // 4. CRIAÇÃO DE QUIZ - Funcionalidade principal
  console.log('\n4. ➕ CRIAÇÃO DE QUIZ');
  const quizData = {
    title: 'Teste Usuário Real',
    description: 'Quiz criado durante simulação de usuário real',
    structure: {
      pages: [
        {
          id: 'page1',
          name: 'Página Principal',
          elements: [
            {
              id: 'titulo',
              type: 'heading',
              content: 'Bem-vindo ao Teste!'
            },
            {
              id: 'nome',
              type: 'text',
              question: 'Qual é o seu nome?',
              fieldId: 'nome_usuario',
              required: true
            },
            {
              id: 'email',
              type: 'email',
              question: 'Seu email para contato?',
              fieldId: 'email_contato',
              required: true
            }
          ]
        }
      ]
    }
  };
  
  const createStart = Date.now();
  const createResult = await makeRequest('/api/quizzes', {
    method: 'POST',
    body: JSON.stringify(quizData)
  });
  const createTime = Date.now() - createStart;
  
  results.total++;
  let createdQuizId = null;
  if (createResult.success && createResult.data.id) {
    createdQuizId = createResult.data.id;
    results.passed++;
    logTest('Quiz criado', true, 
      `ID: ${createdQuizId}`, 
      `${createTime}ms`);
  } else {
    results.failed++;
    logTest('Quiz criado', false, 'Erro na criação do quiz', `${createTime}ms`);
    results.details.push('QUIZ_CREATE_FAILED');
  }
  
  // 5. VISUALIZAÇÃO DO QUIZ - Preview
  if (createdQuizId) {
    console.log('\n5. 👀 PREVIEW DO QUIZ');
    const previewStart = Date.now();
    const previewResult = await makeRequest(`/api/quizzes/${createdQuizId}`);
    const previewTime = Date.now() - previewStart;
    
    results.total++;
    if (previewResult.success && previewResult.data.title) {
      results.passed++;
      logTest('Preview visualizado', true, 
        `Título: ${previewResult.data.title}`, 
        `${previewTime}ms`);
    } else {
      results.failed++;
      logTest('Preview visualizado', false, 'Erro ao carregar preview', `${previewTime}ms`);
      results.details.push('PREVIEW_FAILED');
    }
  }
  
  // 6. PUBLICAÇÃO DO QUIZ - Disponibilização
  if (createdQuizId) {
    console.log('\n6. 🚀 PUBLICAÇÃO DO QUIZ');
    const publishStart = Date.now();
    const publishResult = await makeRequest(`/api/quizzes/${createdQuizId}/publish`, {
      method: 'POST'
    });
    const publishTime = Date.now() - publishStart;
    
    results.total++;
    if (publishResult.success) {
      results.passed++;
      logTest('Quiz publicado', true, 
        'Quiz disponível para respondentes', 
        `${publishTime}ms`);
    } else {
      results.failed++;
      logTest('Quiz publicado', false, 'Erro na publicação', `${publishTime}ms`);
      results.details.push('PUBLISH_FAILED');
    }
  }
  
  // 7. RESPOSTA AO QUIZ - Simulação de usuário final
  if (createdQuizId) {
    console.log('\n7. 📝 RESPOSTA AO QUIZ');
    const responseData = {
      responses: {
        nome_usuario: 'João Silva Santos',
        email_contato: 'joao.silva@teste.com'
      },
      metadata: {
        isComplete: true,
        completionPercentage: 100,
        userAgent: 'TestBot/1.0',
        timestamp: new Date().toISOString()
      }
    };
    
    const responseStart = Date.now();
    const responseResult = await makeRequest(`/api/quizzes/${createdQuizId}/responses`, {
      method: 'POST',
      body: JSON.stringify(responseData)
    });
    const responseTime = Date.now() - responseStart;
    
    results.total++;
    if (responseResult.success && responseResult.data.id) {
      results.passed++;
      logTest('Resposta enviada', true, 
        `Response ID: ${responseResult.data.id}`, 
        `${responseTime}ms`);
    } else {
      results.failed++;
      logTest('Resposta enviada', false, 'Erro ao salvar resposta', `${responseTime}ms`);
      results.details.push('RESPONSE_FAILED');
    }
  }
  
  // 8. ANALYTICS - Análise de resultados
  if (createdQuizId) {
    console.log('\n8. 📈 ANALYTICS DO QUIZ');
    const analyticsStart = Date.now();
    const analyticsResult = await makeRequest(`/api/quizzes/${createdQuizId}/analytics`);
    const analyticsTime = Date.now() - analyticsStart;
    
    results.total++;
    if (analyticsResult.success) {
      results.passed++;
      logTest('Analytics carregado', true, 
        'Estatísticas do quiz disponíveis', 
        `${analyticsTime}ms`);
    } else {
      results.failed++;
      logTest('Analytics carregado', false, 'Erro ao carregar analytics', `${analyticsTime}ms`);
      results.details.push('ANALYTICS_FAILED');
    }
  }
  
  // 9. VARIÁVEIS DO QUIZ - Sistema de remarketing
  if (createdQuizId) {
    console.log('\n9. 🏷️ VARIÁVEIS PARA REMARKETING');
    const varsStart = Date.now();
    const varsResult = await makeRequest(`/api/quizzes/${createdQuizId}/variables`);
    const varsTime = Date.now() - varsStart;
    
    results.total++;
    if (varsResult.success) {
      results.passed++;
      const varCount = Array.isArray(varsResult.data) ? varsResult.data.length : 0;
      logTest('Variáveis extraídas', true, 
        `${varCount} variáveis para personalização`, 
        `${varsTime}ms`);
    } else {
      results.failed++;
      logTest('Variáveis extraídas', false, 'Erro ao extrair variáveis', `${varsTime}ms`);
      results.details.push('VARIABLES_FAILED');
    }
  }
  
  // 10. CAMPANHAS DE EMAIL - Remarketing
  console.log('\n10. 📧 CAMPANHAS DE EMAIL');
  const emailStart = Date.now();
  const emailResult = await makeRequest('/api/email-campaigns');
  const emailTime = Date.now() - emailStart;
  
  results.total++;
  if (emailResult.success) {
    results.passed++;
    const campaignCount = Array.isArray(emailResult.data) ? emailResult.data.length : 0;
    logTest('Campanhas listadas', true, 
      `${campaignCount} campanhas de email`, 
      `${emailTime}ms`);
  } else {
    results.failed++;
    logTest('Campanhas listadas', false, 'Erro ao listar campanhas', `${emailTime}ms`);
    results.details.push('EMAIL_CAMPAIGNS_FAILED');
  }
  
  // LIMPEZA - Remover dados de teste
  if (createdQuizId) {
    console.log('\n🧹 LIMPEZA DOS DADOS DE TESTE');
    const deleteStart = Date.now();
    const deleteResult = await makeRequest(`/api/quizzes/${createdQuizId}`, {
      method: 'DELETE'
    });
    const deleteTime = Date.now() - deleteStart;
    
    if (deleteResult.success) {
      logTest('Dados limpos', true, 'Quiz removido com sucesso', `${deleteTime}ms`);
    } else {
      logTest('Dados limpos', false, 'Erro na limpeza', `${deleteTime}ms`);
    }
  }
  
  // RELATÓRIO FINAL
  console.log('\n📊 RELATÓRIO FINAL');
  console.log('='.repeat(70));
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`✅ Testes passaram: ${results.passed}/${results.total} (${successRate}%)`);
  console.log(`❌ Testes falharam: ${results.failed}/${results.total}`);
  
  if (results.details.length > 0) {
    console.log('\n🔍 PROBLEMAS IDENTIFICADOS:');
    results.details.forEach(detail => {
      console.log(`   • ${detail}`);
    });
  }
  
  console.log('\n🎯 STATUS FINAL:');
  if (results.passed === results.total) {
    console.log('✅ SISTEMA 100% FUNCIONAL - PRONTO PARA PRODUÇÃO!');
    console.log('🚀 Todos os fluxos críticos funcionando perfeitamente');
  } else if (successRate >= 80) {
    console.log('⚠️  SISTEMA MAJORITARIAMENTE FUNCIONAL - POUCOS AJUSTES NECESSÁRIOS');
    console.log('🔧 Foque na correção dos problemas identificados acima');
  } else {
    console.log('❌ SISTEMA NECESSITA CORREÇÕES SIGNIFICATIVAS');
    console.log('🛠️  Revise e corrija os problemas antes de continuar');
  }
  
  console.log('\n='.repeat(70));
  return results;
}

// Executar teste
executarTeste().catch(console.error);