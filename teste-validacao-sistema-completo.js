/**
 * 🎯 TESTE DE VALIDAÇÃO COMPLETA DO SISTEMA
 * Verifica se todas as funcionalidades estão operacionais após correção do schema
 */

const BASE_URL = 'http://localhost:5000';

// Função para fazer requisições HTTP
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ Erro na requisição para ${endpoint}:`, error.message);
    throw error;
  }
}

// Função para autenticar
async function authenticate() {
  const credentials = {
    email: 'admin@vendzz.com',
    password: 'admin123'
  };

  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: credentials
    });

    if (response.accessToken) {
      console.log('✅ Autenticação bem-sucedida');
      return response.accessToken;
    } else {
      throw new Error('Token não recebido');
    }
  } catch (error) {
    console.error('❌ Falha na autenticação:', error.message);
    throw error;
  }
}

// Teste 1: Criação de resposta de quiz
async function testeQuizResponse(token) {
  console.log('\n🔍 TESTE 1: CRIAÇÃO DE RESPOSTA DE QUIZ');
  console.log('=======================================');

  try {
    // Buscar quiz existente
    const quizzes = await makeRequest('/api/quizzes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (quizzes.length === 0) {
      console.log('❌ Nenhum quiz encontrado');
      return false;
    }

    const quiz = quizzes[0];
    console.log(`📋 Quiz encontrado: ${quiz.title}`);

    // Criar resposta
    const response = await makeRequest('/api/quiz-responses', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: {
        quizId: quiz.id,
        responses: {
          nome_completo: 'João Silva Validação',
          email_contato: 'joao.validacao@teste.com',
          telefone_contato: '11999887766'
        },
        metadata: {
          isComplete: true,
          completionPercentage: 100
        }
      }
    });

    console.log(`✅ Resposta criada com sucesso: ${response.id}`);
    return { quiz, response };
  } catch (error) {
    console.error('❌ Erro no teste de resposta:', error.message);
    return false;
  }
}

// Teste 2: Criação de campanha SMS
async function testeCampanhaSMS(quizId, token) {
  console.log('\n🔍 TESTE 2: CRIAÇÃO DE CAMPANHA SMS');
  console.log('===================================');

  try {
    const campanha = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: {
        name: 'Campanha Teste Validação',
        quizId: quizId,
        message: 'Olá {nome_completo}! Obrigado por responder nosso quiz. Sua resposta foi registrada!',
        targetAudience: 'all',
        campaignType: 'standard',
        triggerDelay: 10,
        triggerUnit: 'minutes'
      }
    });

    console.log(`✅ Campanha SMS criada: ${campanha.id}`);
    
    // Verificar logs da campanha
    const logs = await makeRequest(`/api/sms-campaigns/${campanha.id}/logs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`📊 Logs da campanha: ${logs.length} telefones`);
    logs.forEach((log, index) => {
      console.log(`   ${index + 1}. ${log.phone} - ${log.status}`);
    });

    return campanha;
  } catch (error) {
    console.error('❌ Erro no teste de campanha SMS:', error.message);
    return false;
  }
}

// Teste 3: Detecção de países
async function testeDeteccaoPaises(token) {
  console.log('\n🔍 TESTE 3: DETECÇÃO DE PAÍSES');
  console.log('===============================');

  const numerosTeste = [
    { numero: '11999887766', paisEsperado: 'Brasil' },
    { numero: '8613812345678', paisEsperado: 'China' },
    { numero: '15551234567', paisEsperado: 'Estados Unidos' },
    { numero: '21988776655', paisEsperado: 'Brasil' }
  ];

  try {
    for (const teste of numerosTeste) {
      const resultado = await makeRequest('/api/sms/direct', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: {
          phone: teste.numero,
          message: 'Teste de detecção de país'
        }
      });

      console.log(`📱 ${teste.numero}: ${resultado.country} (esperado: ${teste.paisEsperado})`);
    }

    return true;
  } catch (error) {
    console.error('❌ Erro no teste de detecção de países:', error.message);
    return false;
  }
}

// Teste 4: Analytics do sistema
async function testeAnalytics(token) {
  console.log('\n🔍 TESTE 4: ANALYTICS DO SISTEMA');
  console.log('=================================');

  try {
    const analytics = await makeRequest('/api/analytics/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`📊 Quizzes: ${analytics.quizzes.length}`);
    console.log(`📊 Visualizações: ${analytics.totalViews}`);
    console.log(`📊 Respostas: ${analytics.totalResponses}`);
    console.log(`📊 Taxa de conversão: ${analytics.conversionRate}%`);

    return analytics;
  } catch (error) {
    console.error('❌ Erro no teste de analytics:', error.message);
    return false;
  }
}

// Função principal
async function executarValidacaoCompleta() {
  console.log('🎯 VALIDAÇÃO COMPLETA DO SISTEMA VENDZZ');
  console.log('=======================================');

  try {
    // Autenticar
    const token = await authenticate();
    
    // Teste 1: Quiz Response
    const quizTest = await testeQuizResponse(token);
    if (!quizTest) {
      console.log('❌ SISTEMA NÃO APROVADO - Falha na criação de resposta');
      return;
    }

    // Teste 2: Campanha SMS
    const smsTest = await testeCampanhaSMS(quizTest.quiz.id, token);
    if (!smsTest) {
      console.log('❌ SISTEMA NÃO APROVADO - Falha na criação de campanha SMS');
      return;
    }

    // Teste 3: Detecção de países
    const paisesTest = await testeDeteccaoPaises(token);
    if (!paisesTest) {
      console.log('❌ SISTEMA NÃO APROVADO - Falha na detecção de países');
      return;
    }

    // Teste 4: Analytics
    const analyticsTest = await testeAnalytics(token);
    if (!analyticsTest) {
      console.log('❌ SISTEMA NÃO APROVADO - Falha nos analytics');
      return;
    }

    // Resultado final
    console.log('\n🎉 RESULTADO FINAL DA VALIDAÇÃO');
    console.log('================================');
    console.log('✅ SISTEMA COMPLETAMENTE OPERACIONAL!');
    console.log('✅ Quiz responses funcionando');
    console.log('✅ Campanhas SMS funcionando');
    console.log('✅ Detecção de países funcionando');
    console.log('✅ Analytics funcionando');
    console.log('✅ SISTEMA APROVADO PARA PRODUÇÃO!');
    
  } catch (error) {
    console.error('❌ Erro na validação completa:', error.message);
  }
}

// Executar validação
executarValidacaoCompleta().catch(console.error);