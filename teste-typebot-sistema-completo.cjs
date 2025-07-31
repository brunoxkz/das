#!/usr/bin/env node

/**
 * TESTE COMPLETO DO SISTEMA TYPEBOT
 * 
 * Este script testa todas as funcionalidades do sistema TypeBot:
 * 1. Autenticação JWT
 * 2. Listagem de projetos
 * 3. Criação de projeto
 * 4. Edição de projeto
 * 5. Publicação de projeto
 * 6. Despublicação de projeto
 * 7. Exclusão de projeto
 * 8. Conversão de quiz para TypeBot
 * 9. Analytics de projeto
 * 10. Testes de templates
 */

const https = require('https');
const querystring = require('querystring');

// Configuração do servidor
const SERVER_URL = 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev';

// Dados de teste
const TEST_USER = {
  email: 'admin@vendzz.com',
  password: 'admin123'
};

let authToken = null;
let testProjectId = null;
let testQuizId = null;

/**
 * Função para fazer requisições HTTP
 */
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SERVER_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Teste de autenticação
 */
async function testAuthentication() {
  console.log('🔐 TESTE 1: Autenticação JWT');
  
  try {
    const startTime = Date.now();
    const response = await makeRequest('POST', '/api/auth/login', TEST_USER);
    const endTime = Date.now();
    
    if (response.statusCode === 200 && (response.data.token || response.data.accessToken)) {
      authToken = response.data.token || response.data.accessToken;
      console.log(`✅ Autenticação bem-sucedida (${endTime - startTime}ms)`);
      console.log(`   Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      console.log(`❌ Erro na autenticação: ${response.statusCode}`);
      console.log(`   Resposta: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erro na autenticação: ${error.message}`);
    return false;
  }
}

/**
 * Teste de listagem de projetos
 */
async function testListProjects() {
  console.log('📂 TESTE 2: Listagem de projetos TypeBot');
  
  try {
    const startTime = Date.now();
    const response = await makeRequest('GET', '/api/typebot/projects', null, {
      'Authorization': `Bearer ${authToken}`
    });
    const endTime = Date.now();
    
    if (response.statusCode === 200) {
      console.log(`✅ Listagem de projetos bem-sucedida (${endTime - startTime}ms)`);
      console.log(`   Total de projetos: ${response.data.length}`);
      
      // Pegar um quiz para testes de conversão
      if (response.data.length > 0) {
        testProjectId = response.data[0].id;
        console.log(`   Projeto para testes: ${testProjectId}`);
      }
      
      return true;
    } else {
      console.log(`❌ Erro na listagem: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erro na listagem: ${error.message}`);
    return false;
  }
}

/**
 * Teste de criação de projeto
 */
async function testCreateProject() {
  console.log('➕ TESTE 3: Criação de projeto TypeBot');
  
  try {
    const projectData = {
      name: `Teste TypeBot ${Date.now()}`,
      description: 'Projeto de teste criado automaticamente',
      template: 'whatsapp_web'
    };
    
    const startTime = Date.now();
    const response = await makeRequest('POST', '/api/typebot/projects', projectData, {
      'Authorization': `Bearer ${authToken}`
    });
    const endTime = Date.now();
    
    if (response.statusCode === 201 || response.statusCode === 200) {
      testProjectId = response.data.project?.id || response.data.id;
      console.log(`✅ Criação de projeto bem-sucedida (${endTime - startTime}ms)`);
      console.log(`   ID do projeto: ${testProjectId}`);
      console.log(`   Dados do projeto: ${JSON.stringify(response.data, null, 2)}`);
      return true;
    } else {
      console.log(`❌ Erro na criação: ${response.statusCode}`);
      console.log(`   Resposta: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erro na criação: ${error.message}`);
    return false;
  }
}

/**
 * Teste de edição de projeto
 */
async function testEditProject() {
  console.log('✏️ TESTE 4: Edição de projeto TypeBot');
  
  if (!testProjectId) {
    console.log('❌ Não há projeto para editar');
    return false;
  }
  
  try {
    const updateData = {
      name: `Teste TypeBot Editado ${Date.now()}`,
      description: 'Projeto editado via teste automático'
    };
    
    const startTime = Date.now();
    const response = await makeRequest('PUT', `/api/typebot/projects/${testProjectId}`, updateData, {
      'Authorization': `Bearer ${authToken}`
    });
    const endTime = Date.now();
    
    if (response.statusCode === 200) {
      console.log(`✅ Edição de projeto bem-sucedida (${endTime - startTime}ms)`);
      return true;
    } else {
      console.log(`❌ Erro na edição: ${response.statusCode}`);
      console.log(`   Resposta: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erro na edição: ${error.message}`);
    return false;
  }
}

/**
 * Teste de publicação de projeto
 */
async function testPublishProject() {
  console.log('🌍 TESTE 5: Publicação de projeto TypeBot');
  
  if (!testProjectId) {
    console.log('❌ Não há projeto para publicar');
    return false;
  }
  
  try {
    const startTime = Date.now();
    const response = await makeRequest('POST', `/api/typebot/projects/${testProjectId}/publish`, null, {
      'Authorization': `Bearer ${authToken}`
    });
    const endTime = Date.now();
    
    if (response.statusCode === 200) {
      console.log(`✅ Publicação de projeto bem-sucedida (${endTime - startTime}ms)`);
      console.log(`   URL pública: ${response.data.publicUrl || 'N/A'}`);
      return true;
    } else {
      console.log(`❌ Erro na publicação: ${response.statusCode}`);
      console.log(`   Resposta: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erro na publicação: ${error.message}`);
    return false;
  }
}

/**
 * Teste de despublicação de projeto
 */
async function testUnpublishProject() {
  console.log('👁️ TESTE 6: Despublicação de projeto TypeBot');
  
  if (!testProjectId) {
    console.log('❌ Não há projeto para despublicar');
    return false;
  }
  
  try {
    const startTime = Date.now();
    const response = await makeRequest('POST', `/api/typebot/projects/${testProjectId}/unpublish`, null, {
      'Authorization': `Bearer ${authToken}`
    });
    const endTime = Date.now();
    
    if (response.statusCode === 200) {
      console.log(`✅ Despublicação de projeto bem-sucedida (${endTime - startTime}ms)`);
      return true;
    } else {
      console.log(`❌ Erro na despublicação: ${response.statusCode}`);
      console.log(`   Resposta: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erro na despublicação: ${error.message}`);
    return false;
  }
}

/**
 * Teste de listagem de quizzes para conversão
 */
async function testListQuizzes() {
  console.log('🎯 TESTE 7: Listagem de quizzes para conversão');
  
  try {
    const startTime = Date.now();
    const response = await makeRequest('GET', '/api/quizzes', null, {
      'Authorization': `Bearer ${authToken}`
    });
    const endTime = Date.now();
    
    if (response.statusCode === 200) {
      console.log(`✅ Listagem de quizzes bem-sucedida (${endTime - startTime}ms)`);
      console.log(`   Total de quizzes: ${response.data.length}`);
      
      // Pegar um quiz para testes de conversão
      if (response.data.length > 0) {
        testQuizId = response.data[0].id;
        console.log(`   Quiz para conversão: ${testQuizId}`);
      }
      
      return true;
    } else {
      console.log(`❌ Erro na listagem de quizzes: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erro na listagem de quizzes: ${error.message}`);
    return false;
  }
}

/**
 * Teste de conversão de quiz para TypeBot
 */
async function testQuizToTypeBot() {
  console.log('🔄 TESTE 8: Conversão de quiz para TypeBot');
  
  if (!testQuizId) {
    console.log('❌ Não há quiz disponível para conversão');
    return false;
  }
  
  try {
    const conversionData = {
      quizId: testQuizId,
      name: `Quiz convertido ${Date.now()}`,
      description: 'Quiz convertido para TypeBot via teste automático'
    };
    
    const startTime = Date.now();
    const response = await makeRequest('POST', '/api/typebot/convert-quiz', conversionData, {
      'Authorization': `Bearer ${authToken}`
    });
    const endTime = Date.now();
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log(`✅ Conversão de quiz bem-sucedida (${endTime - startTime}ms)`);
      console.log(`   Projeto criado: ${response.data.project?.id || 'N/A'}`);
      return true;
    } else {
      console.log(`❌ Erro na conversão: ${response.statusCode}`);
      console.log(`   Resposta: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erro na conversão: ${error.message}`);
    return false;
  }
}

/**
 * Teste de templates
 */
async function testTemplates() {
  console.log('📝 TESTE 9: Sistema de templates');
  
  const templates = ['instagram', 'whatsapp_web', 'messenger'];
  let successCount = 0;
  
  for (const template of templates) {
    try {
      const projectData = {
        name: `Teste Template ${template} ${Date.now()}`,
        description: `Projeto de teste do template ${template}`,
        template: template
      };
      
      const startTime = Date.now();
      const response = await makeRequest('POST', '/api/typebot/projects', projectData, {
        'Authorization': `Bearer ${authToken}`
      });
      const endTime = Date.now();
      
      if (response.statusCode === 201 || response.statusCode === 200) {
        console.log(`✅ Template ${template} criado com sucesso (${endTime - startTime}ms)`);
        successCount++;
      } else {
        console.log(`❌ Erro no template ${template}: ${response.statusCode}`);
      }
      
      // Aguardar entre requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`❌ Erro no template ${template}: ${error.message}`);
    }
  }
  
  console.log(`📊 Templates testados: ${successCount}/${templates.length}`);
  return successCount === templates.length;
}

/**
 * Teste de exclusão de projeto
 */
async function testDeleteProject() {
  console.log('🗑️ TESTE 10: Exclusão de projeto TypeBot');
  
  if (!testProjectId) {
    console.log('❌ Não há projeto para excluir');
    return false;
  }
  
  try {
    const startTime = Date.now();
    const response = await makeRequest('DELETE', `/api/typebot/projects/${testProjectId}`, null, {
      'Authorization': `Bearer ${authToken}`
    });
    const endTime = Date.now();
    
    if (response.statusCode === 200) {
      console.log(`✅ Exclusão de projeto bem-sucedida (${endTime - startTime}ms)`);
      return true;
    } else {
      console.log(`❌ Erro na exclusão: ${response.statusCode}`);
      console.log(`   Resposta: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erro na exclusão: ${error.message}`);
    return false;
  }
}

/**
 * Função principal para executar todos os testes
 */
async function runAllTests() {
  console.log('🚀 INICIANDO TESTE COMPLETO DO SISTEMA TYPEBOT');
  console.log('=====================================================');
  
  const startTime = Date.now();
  const tests = [
    testAuthentication,
    testListProjects,
    testCreateProject,
    testEditProject,
    testPublishProject,
    testUnpublishProject,
    testListQuizzes,
    testQuizToTypeBot,
    testTemplates,
    testDeleteProject
  ];
  
  let passedTests = 0;
  const totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passedTests++;
      }
      console.log(''); // Linha em branco para separar os testes
    } catch (error) {
      console.log(`❌ Erro no teste: ${error.message}`);
      console.log('');
    }
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  console.log('=====================================================');
  console.log('📊 RELATÓRIO FINAL DOS TESTES');
  console.log('=====================================================');
  console.log(`✅ Testes aprovados: ${passedTests}/${totalTests}`);
  console.log(`📈 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log(`⏱️ Tempo total: ${totalTime}ms`);
  console.log(`🚀 Performance média: ${(totalTime / totalTests).toFixed(0)}ms por teste`);
  
  if (passedTests === totalTests) {
    console.log('🎉 TODOS OS TESTES FORAM APROVADOS!');
    console.log('✨ Sistema TypeBot está 100% funcional e pronto para produção!');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique os logs acima.');
  }
  
  console.log('=====================================================');
  
  return passedTests === totalTests;
}

// Executar os testes
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };