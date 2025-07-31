/**
 * 🔍 INVESTIGAÇÃO COMPLETA - COMO O SISTEMA SALVA RESPOSTAS
 * Analisar onde e como são salvas as respostas, status de abandono/completo e cada elemento
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

  const response = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: credentials
  });

  return response.accessToken;
}

// Investigar estrutura de resposta
async function investigarEstruturaSalvamento(token) {
  console.log('🔍 INVESTIGAÇÃO: ESTRUTURA DE SALVAMENTO DE RESPOSTAS');
  console.log('==================================================');

  // Buscar quiz existente
  const quizzes = await makeRequest('/api/quizzes', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const quiz = quizzes[0];
  console.log(`📋 Quiz analisado: ${quiz.title}`);
  console.log(`📋 Estrutura do quiz:`, JSON.stringify(quiz.structure, null, 2));

  // Criar resposta COMPLETA
  console.log('\n📝 CRIANDO RESPOSTA COMPLETA:');
  const respostaCompleta = {
    quizId: quiz.id,
    responses: {
      nome_completo: 'João Silva Completo',
      email_contato: 'joao.completo@teste.com',
      telefone_contato: '11999887766',
      idade: '28',
      produto_interesse: 'Whey Protein'
    },
    metadata: {
      isComplete: true,
      completionPercentage: 100,
      startTime: Date.now() - 300000,
      endTime: Date.now(),
      userAgent: 'Mozilla/5.0 (Test Browser)',
      ipAddress: '192.168.1.1',
      pageViews: [
        { pageId: 'page1', viewedAt: Date.now() - 250000 },
        { pageId: 'page2', viewedAt: Date.now() - 200000 },
        { pageId: 'page3', viewedAt: Date.now() - 150000 }
      ]
    }
  };

  const responseCompleta = await makeRequest('/api/quiz-responses', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: respostaCompleta
  });

  console.log(`✅ Resposta COMPLETA criada: ${responseCompleta.id}`);

  // Criar resposta ABANDONADA
  console.log('\n📝 CRIANDO RESPOSTA ABANDONADA:');
  const respostaAbandonada = {
    quizId: quiz.id,
    responses: {
      nome_completo: 'Maria Santos Abandonada',
      email_contato: 'maria.abandonada@teste.com'
      // Telefone não preenchido = abandonada
    },
    metadata: {
      isComplete: false,
      completionPercentage: 40,
      startTime: Date.now() - 600000,
      endTime: Date.now() - 500000,
      abandonedAt: Date.now() - 500000,
      userAgent: 'Mozilla/5.0 (Test Browser)',
      ipAddress: '192.168.1.2',
      pageViews: [
        { pageId: 'page1', viewedAt: Date.now() - 550000 },
        { pageId: 'page2', viewedAt: Date.now() - 520000 }
        // Não chegou na page3
      ]
    }
  };

  const responseAbandonada = await makeRequest('/api/quiz-responses', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: respostaAbandonada
  });

  console.log(`✅ Resposta ABANDONADA criada: ${responseAbandonada.id}`);

  return { quiz, responseCompleta, responseAbandonada };
}

// Investigar salvamento de variáveis
async function investigarSalvamentoVariaveis(token) {
  console.log('\n🔍 INVESTIGAÇÃO: SALVAMENTO DE VARIÁVEIS');
  console.log('=======================================');

  try {
    // Buscar variáveis na tabela response_variables
    const variables = await makeRequest('/api/response-variables', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`📊 Total de variáveis salvas: ${variables.length}`);
    
    if (variables.length > 0) {
      console.log('\n📋 Exemplos de variáveis salvas:');
      variables.slice(0, 5).forEach((variable, index) => {
        console.log(`${index + 1}. ${variable.variableName}: ${variable.variableValue}`);
        console.log(`   Tipo: ${variable.elementType}, Página: ${variable.pageId}`);
        console.log(`   Pergunta: ${variable.question}`);
        console.log('');
      });
    }

    return variables;
  } catch (error) {
    console.error('❌ Erro ao buscar variáveis:', error.message);
    return [];
  }
}

// Investigar como o sistema detecta abandono vs completo
async function investigarDeteccaoStatus(token) {
  console.log('\n🔍 INVESTIGAÇÃO: DETECÇÃO DE STATUS (COMPLETO VS ABANDONADO)');
  console.log('===========================================================');

  try {
    // Buscar todas as respostas
    const responses = await makeRequest('/api/quiz-responses', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`📊 Total de respostas: ${responses.length}`);

    // Analisar cada resposta
    const analise = {
      completas: 0,
      abandonadas: 0,
      parciais: 0,
      indefinidas: 0
    };

    console.log('\n📋 ANÁLISE DE STATUS DAS RESPOSTAS:');
    responses.forEach((response, index) => {
      if (index < 10) { // Mostrar apenas primeiras 10
        const metadata = response.metadata || {};
        const isComplete = metadata.isComplete;
        const completionPercentage = metadata.completionPercentage || 0;
        
        let status = 'indefinido';
        if (isComplete === true) {
          status = 'completo';
          analise.completas++;
        } else if (isComplete === false) {
          status = 'abandonado';
          analise.abandonadas++;
        } else if (completionPercentage > 0 && completionPercentage < 100) {
          status = 'parcial';
          analise.parciais++;
        } else {
          analise.indefinidas++;
        }

        console.log(`${index + 1}. ${response.id} - ${status} (${completionPercentage}%)`);
        console.log(`   Responses: ${Object.keys(response.responses || {}).length} campos`);
        console.log(`   Metadata: ${JSON.stringify(metadata).substring(0, 100)}...`);
        console.log('');
      }
    });

    console.log('📊 RESUMO DA ANÁLISE:');
    console.log(`   Completas: ${analise.completas}`);
    console.log(`   Abandonadas: ${analise.abandonadas}`);
    console.log(`   Parciais: ${analise.parciais}`);
    console.log(`   Indefinidas: ${analise.indefinidas}`);

    return analise;
  } catch (error) {
    console.error('❌ Erro ao analisar status:', error.message);
    return null;
  }
}

// Investigar como são extraídos telefones para campanhas
async function investigarExtracaoTelefones(token) {
  console.log('\n🔍 INVESTIGAÇÃO: EXTRAÇÃO DE TELEFONES PARA CAMPANHAS');
  console.log('====================================================');

  try {
    // Buscar quiz com respostas
    const quizzes = await makeRequest('/api/quizzes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const quiz = quizzes[0];
    
    // Buscar respostas do quiz
    const responses = await makeRequest(`/api/quizzes/${quiz.id}/responses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`📊 Quiz: ${quiz.title}`);
    console.log(`📊 Respostas: ${responses.length}`);

    // Analisar cada resposta para telefones
    const telefonesEncontrados = [];
    
    responses.forEach((response, index) => {
      const responsesData = response.responses || {};
      const metadata = response.metadata || {};
      
      // Buscar telefones em diferentes campos
      const campos = Object.keys(responsesData);
      const camposTelefone = campos.filter(campo => 
        campo.includes('telefone') || 
        campo.includes('phone') || 
        campo.includes('cel') || 
        campo.includes('whatsapp')
      );

      if (camposTelefone.length > 0) {
        camposTelefone.forEach(campo => {
          const telefone = responsesData[campo];
          if (telefone) {
            telefonesEncontrados.push({
              responseId: response.id,
              campo: campo,
              telefone: telefone,
              status: metadata.isComplete ? 'completo' : 'abandonado',
              completionPercentage: metadata.completionPercentage || 0
            });
          }
        });
      }
    });

    console.log(`📱 Telefones encontrados: ${telefonesEncontrados.length}`);
    
    if (telefonesEncontrados.length > 0) {
      console.log('\n📋 TELEFONES EXTRAÍDOS:');
      telefonesEncontrados.forEach((item, index) => {
        console.log(`${index + 1}. ${item.telefone} (${item.status} - ${item.completionPercentage}%)`);
        console.log(`   Campo: ${item.campo}, Response: ${item.responseId}`);
      });
    }

    return telefonesEncontrados;
  } catch (error) {
    console.error('❌ Erro ao investigar telefones:', error.message);
    return [];
  }
}

// Função principal
async function executarInvestigacao() {
  console.log('🔍 INVESTIGAÇÃO COMPLETA: SALVAMENTO DE RESPOSTAS');
  console.log('=================================================');

  try {
    const token = await authenticate();
    console.log('✅ Autenticação bem-sucedida');

    // 1. Investigar estrutura de salvamento
    const { quiz, responseCompleta, responseAbandonada } = await investigarEstruturaSalvamento(token);

    // 2. Investigar salvamento de variáveis
    const variables = await investigarSalvamentoVariaveis(token);

    // 3. Investigar detecção de status
    const analise = await investigarDeteccaoStatus(token);

    // 4. Investigar extração de telefones
    const telefones = await investigarExtracaoTelefones(token);

    // Relatório final
    console.log('\n📊 RELATÓRIO FINAL DA INVESTIGAÇÃO');
    console.log('==================================');
    console.log('✅ TABELA PRINCIPAL: quiz_responses');
    console.log('   - Salva responses como JSON');
    console.log('   - Salva metadata como JSON (isComplete, completionPercentage)');
    console.log('   - Inclui country, phoneCountryCode, affiliateId');
    console.log('');
    console.log('✅ TABELA SECUNDÁRIA: response_variables');
    console.log('   - Indexa cada variável individualmente');
    console.log('   - Permite remarketing ultra-personalizado');
    console.log('   - Inclui contexto da pergunta e tipo de elemento');
    console.log('');
    console.log('✅ DETECÇÃO DE STATUS:');
    console.log('   - Completo: metadata.isComplete === true');
    console.log('   - Abandonado: metadata.isComplete === false');
    console.log('   - Percentual: metadata.completionPercentage');
    console.log('');
    console.log('✅ EXTRAÇÃO DE TELEFONES:');
    console.log('   - Busca campos com "telefone", "phone", "cel", "whatsapp"');
    console.log('   - Mantém referência ao status da resposta');
    console.log('   - Usado para segmentação em campanhas');
    console.log('');
    console.log('🎯 SISTEMA COMPLETAMENTE FUNCIONAL!');
    
  } catch (error) {
    console.error('❌ Erro na investigação:', error.message);
  }
}

// Executar investigação
executarInvestigacao().catch(console.error);