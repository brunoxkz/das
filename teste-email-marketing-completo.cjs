#!/usr/bin/env node

/**
 * 🧪 TESTE COMPLETO DO SISTEMA EMAIL MARKETING
 * Valida todas as funcionalidades do email marketing da Vendzz
 * Data: 11 de Janeiro de 2025
 */

const http = require('http');

// Configurações
const BASE_URL = 'http://localhost:5000';
const TEST_USER = {
  email: 'admin@vendzz.com',
  password: 'admin123'
};

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors.gray}[${timestamp}]${colors.reset} ${colors[color]}${message}${colors.reset}`);
}

// Função para fazer requisições HTTP
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Função de autenticação
async function authenticate() {
  try {
    log('🔐 Autenticando usuário...', 'blue');
    const response = await makeRequest('POST', '/api/auth/login', TEST_USER);
    
    if (response.status === 200 && (response.data.accessToken || response.data.token)) {
      const token = response.data.accessToken || response.data.token;
      log('✅ Autenticação bem-sucedida', 'green');
      return token;
    }
    
    throw new Error(`Falha na autenticação - Status: ${response.status}`);
  } catch (error) {
    log(`❌ Erro na autenticação: ${error.message}`, 'red');
    throw error;
  }
}

// Teste 1: Buscar quizzes disponíveis
async function testGetQuizzes(token) {
  try {
    log('\n📝 TESTE 1: Buscar quizzes disponíveis', 'blue');
    
    const response = await makeRequest('GET', '/api/quizzes', null, token);
    
    if (response.status === 200 && Array.isArray(response.data)) {
      log(`✅ Quizzes encontrados: ${response.data.length}`, 'green');
      
      if (response.data.length > 0) {
        const quiz = response.data[0];
        log(`📋 Primeiro quiz: ${quiz.title || quiz.name} (ID: ${quiz.id})`, 'cyan');
        return { success: true, quizId: quiz.id, quizzes: response.data };
      } else {
        log('⚠️ Nenhum quiz encontrado', 'yellow');
        return { success: false, error: 'Nenhum quiz disponível' };
      }
    } else {
      log(`❌ Falha ao buscar quizzes - Status: ${response.status}`, 'red');
      return { success: false, error: `Status ${response.status}` };
    }
  } catch (error) {
    log(`❌ Erro no teste de quizzes: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Teste 2: Extrair emails de um quiz
async function testExtractEmails(token, quizId) {
  try {
    log('\n📧 TESTE 2: Extrair emails de quiz', 'blue');
    
    const response = await makeRequest('GET', `/api/quizzes/${quizId}/emails`, null, token);
    
    if (response.status === 200 && Array.isArray(response.data)) {
      log(`✅ Emails extraídos: ${response.data.length}`, 'green');
      
      if (response.data.length > 0) {
        log(`📧 Primeiro email: ${response.data[0].email}`, 'cyan');
        log(`👤 Nome: ${response.data[0].name || 'Não informado'}`, 'cyan');
        return { success: true, emails: response.data };
      } else {
        log('⚠️ Nenhum email encontrado neste quiz', 'yellow');
        return { success: false, error: 'Nenhum email encontrado' };
      }
    } else {
      log(`❌ Falha ao extrair emails - Status: ${response.status}`, 'red');
      return { success: false, error: `Status ${response.status}` };
    }
  } catch (error) {
    log(`❌ Erro na extração de emails: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Teste 3: Obter variáveis do quiz
async function testGetQuizVariables(token, quizId) {
  try {
    log('\n🔤 TESTE 3: Obter variáveis do quiz', 'blue');
    
    const response = await makeRequest('GET', `/api/quizzes/${quizId}/variables`, null, token);
    
    if (response.status === 200 && Array.isArray(response.data)) {
      log(`✅ Variáveis encontradas: ${response.data.length}`, 'green');
      
      response.data.forEach(variable => {
        log(`🔤 Variável: {${variable}} - Tipo: ${typeof variable}`, 'cyan');
      });
      
      return { success: true, variables: response.data };
    } else {
      log(`❌ Falha ao obter variáveis - Status: ${response.status}`, 'red');
      return { success: false, error: `Status ${response.status}` };
    }
  } catch (error) {
    log(`❌ Erro na obtenção de variáveis: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Teste 4: Criar campanha de email
async function testCreateEmailCampaign(token, quizId) {
  try {
    log('\n📩 TESTE 4: Criar campanha de email', 'blue');
    
    const campaignData = {
      name: 'Teste Email Marketing Completo',
      quizId: quizId,
      subject: 'Assunto de teste {nome_completo}',
      content: 'Olá {nome_completo}, obrigado por participar do nosso quiz! Seu email é {email_contato}.',
      targetAudience: 'all',
      triggerType: 'immediate'
    };
    
    const response = await makeRequest('POST', '/api/email-campaigns', campaignData, token);
    
    if (response.status === 201) {
      log(`✅ Campanha criada com sucesso - ID: ${response.data.id}`, 'green');
      log(`📊 Status: ${response.data.status}`, 'cyan');
      return { success: true, campaignId: response.data.id, campaign: response.data };
    } else {
      log(`❌ Falha ao criar campanha - Status: ${response.status}`, 'red');
      log(`📄 Resposta: ${JSON.stringify(response.data, null, 2)}`, 'yellow');
      return { success: false, error: `Status ${response.status}` };
    }
  } catch (error) {
    log(`❌ Erro na criação de campanha: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Teste 5: Listar campanhas de email
async function testListEmailCampaigns(token) {
  try {
    log('\n📋 TESTE 5: Listar campanhas de email', 'blue');
    
    const response = await makeRequest('GET', '/api/email-campaigns', null, token);
    
    if (response.status === 200 && Array.isArray(response.data)) {
      log(`✅ Campanhas encontradas: ${response.data.length}`, 'green');
      
      response.data.forEach(campaign => {
        log(`📧 Campanha: ${campaign.name} - Status: ${campaign.status}`, 'cyan');
        log(`   Enviados: ${campaign.sent || 0} | Falhas: ${campaign.failed || 0}`, 'cyan');
      });
      
      return { success: true, campaigns: response.data };
    } else {
      log(`❌ Falha ao listar campanhas - Status: ${response.status}`, 'red');
      return { success: false, error: `Status ${response.status}` };
    }
  } catch (error) {
    log(`❌ Erro na listagem de campanhas: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Teste 6: Visualizar logs de uma campanha
async function testViewCampaignLogs(token, campaignId) {
  try {
    log('\n📜 TESTE 6: Visualizar logs da campanha', 'blue');
    
    const response = await makeRequest('GET', `/api/email-campaigns/${campaignId}/logs`, null, token);
    
    if (response.status === 200 && Array.isArray(response.data)) {
      log(`✅ Logs encontrados: ${response.data.length}`, 'green');
      
      response.data.forEach(logEntry => {
        log(`📧 Email: ${logEntry.email} - Status: ${logEntry.status}`, 'cyan');
        if (logEntry.personalizedSubject) {
          log(`   Assunto personalizado: ${logEntry.personalizedSubject}`, 'cyan');
        }
      });
      
      return { success: true, logs: response.data };
    } else {
      log(`❌ Falha ao visualizar logs - Status: ${response.status}`, 'red');
      return { success: false, error: `Status ${response.status}` };
    }
  } catch (error) {
    log(`❌ Erro na visualização de logs: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Teste 7: Verificar créditos de email
async function testCheckEmailCredits(token) {
  try {
    log('\n💰 TESTE 7: Verificar créditos de email', 'blue');
    
    const response = await makeRequest('GET', '/api/auth/verify', null, token);
    
    if (response.status === 200 && response.data.user) {
      const user = response.data.user;
      log(`✅ Créditos email: ${user.emailCredits || 'Não definido'}`, 'green');
      log(`📊 Créditos SMS: ${user.smsCredits || 'Não definido'}`, 'cyan');
      log(`📊 Créditos WhatsApp: ${user.whatsappCredits || 'Não definido'}`, 'cyan');
      
      return { success: true, credits: user };
    } else {
      log(`❌ Falha ao verificar créditos - Status: ${response.status}`, 'red');
      return { success: false, error: `Status ${response.status}` };
    }
  } catch (error) {
    log(`❌ Erro na verificação de créditos: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Teste 8: Testar templates de email
async function testEmailTemplates(token) {
  try {
    log('\n📄 TESTE 8: Testar templates de email', 'blue');
    
    const response = await makeRequest('GET', '/api/email-templates', null, token);
    
    if (response.status === 200 && Array.isArray(response.data)) {
      log(`✅ Templates encontrados: ${response.data.length}`, 'green');
      
      response.data.forEach(template => {
        log(`📄 Template: ${template.name} - Categoria: ${template.category}`, 'cyan');
      });
      
      return { success: true, templates: response.data };
    } else {
      log(`❌ Falha ao buscar templates - Status: ${response.status}`, 'red');
      return { success: false, error: `Status ${response.status}` };
    }
  } catch (error) {
    log(`❌ Erro na busca de templates: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Teste 9: Testar pausar/reativar campanha
async function testPauseReactivateCampaign(token, campaignId) {
  try {
    log('\n⏸️ TESTE 9: Pausar/reativar campanha', 'blue');
    
    // Pausar campanha
    let response = await makeRequest('PATCH', `/api/email-campaigns/${campaignId}/pause`, null, token);
    
    if (response.status === 200) {
      log(`✅ Campanha pausada com sucesso`, 'green');
      
      // Reativar campanha
      response = await makeRequest('PATCH', `/api/email-campaigns/${campaignId}/activate`, null, token);
      
      if (response.status === 200) {
        log(`✅ Campanha reativada com sucesso`, 'green');
        return { success: true };
      } else {
        log(`❌ Falha ao reativar campanha - Status: ${response.status}`, 'red');
        return { success: false, error: `Falha na reativação: ${response.status}` };
      }
    } else {
      log(`❌ Falha ao pausar campanha - Status: ${response.status}`, 'red');
      return { success: false, error: `Falha na pausa: ${response.status}` };
    }
  } catch (error) {
    log(`❌ Erro no teste de pausar/reativar: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Teste 10: Testar exclusão de campanha
async function testDeleteCampaign(token, campaignId) {
  try {
    log('\n🗑️ TESTE 10: Excluir campanha', 'blue');
    
    const response = await makeRequest('DELETE', `/api/email-campaigns/${campaignId}`, null, token);
    
    if (response.status === 200) {
      log(`✅ Campanha excluída com sucesso`, 'green');
      return { success: true };
    } else {
      log(`❌ Falha ao excluir campanha - Status: ${response.status}`, 'red');
      return { success: false, error: `Status ${response.status}` };
    }
  } catch (error) {
    log(`❌ Erro na exclusão de campanha: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Função principal de teste
async function runCompleteEmailMarketingTest() {
  log('🧪 INICIANDO TESTE COMPLETO DO EMAIL MARKETING', 'magenta');
  log('='.repeat(70), 'magenta');
  
  const startTime = Date.now();
  const results = [];
  
  try {
    // Autenticação
    const token = await authenticate();
    
    // Lista de testes
    const tests = [
      { name: 'Buscar Quizzes', fn: () => testGetQuizzes(token) },
      { name: 'Extrair Emails', fn: (quizId) => testExtractEmails(token, quizId) },
      { name: 'Obter Variáveis', fn: (quizId) => testGetQuizVariables(token, quizId) },
      { name: 'Criar Campanha', fn: (quizId) => testCreateEmailCampaign(token, quizId) },
      { name: 'Listar Campanhas', fn: () => testListEmailCampaigns(token) },
      { name: 'Visualizar Logs', fn: (campaignId) => testViewCampaignLogs(token, campaignId) },
      { name: 'Verificar Créditos', fn: () => testCheckEmailCredits(token) },
      { name: 'Buscar Templates', fn: () => testEmailTemplates(token) },
      { name: 'Pausar/Reativar', fn: (campaignId) => testPauseReactivateCampaign(token, campaignId) },
      { name: 'Excluir Campanha', fn: (campaignId) => testDeleteCampaign(token, campaignId) }
    ];
    
    let quizId = null;
    let campaignId = null;
    
    // Executar testes sequencialmente
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      
      try {
        let result;
        
        if (test.name === 'Buscar Quizzes') {
          result = await test.fn();
          if (result.success) {
            quizId = result.quizId;
          }
        } else if (test.name === 'Criar Campanha') {
          result = await test.fn(quizId);
          if (result.success) {
            campaignId = result.campaignId;
          }
        } else if (['Extrair Emails', 'Obter Variáveis'].includes(test.name)) {
          result = await test.fn(quizId);
        } else if (['Visualizar Logs', 'Pausar/Reativar', 'Excluir Campanha'].includes(test.name)) {
          result = await test.fn(campaignId);
        } else {
          result = await test.fn();
        }
        
        results.push({ 
          name: test.name, 
          passed: result.success,
          error: result.error,
          data: result
        });
        
        // Pequena pausa entre testes
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        log(`❌ Erro no teste ${test.name}: ${error.message}`, 'red');
        results.push({ 
          name: test.name, 
          passed: false, 
          error: error.message 
        });
      }
    }
    
  } catch (error) {
    log(`❌ Erro crítico: ${error.message}`, 'red');
    results.push({ 
      name: 'Erro Crítico', 
      passed: false, 
      error: error.message 
    });
  }
  
  // Relatório final
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  log('\n' + '='.repeat(70), 'magenta');
  log('📊 RELATÓRIO FINAL DOS TESTES EMAIL MARKETING', 'magenta');
  log('='.repeat(70), 'magenta');
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
  
  log(`\n⏱️  Duração total: ${duration}ms`, 'blue');
  log(`✅ Testes aprovados: ${passedTests}/${totalTests} (${successRate}%)`, 'green');
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASSOU' : '❌ FALHOU';
    const color = result.passed ? 'green' : 'red';
    log(`${status} - ${result.name}`, color);
    if (result.error) {
      log(`   Erro: ${result.error}`, 'red');
    }
  });
  
  // Status final
  if (passedTests === totalTests) {
    log('\n🎉 SISTEMA EMAIL MARKETING 100% FUNCIONAL!', 'green');
    log('📧 Todas as funcionalidades testadas com sucesso', 'green');
  } else {
    log('\n⚠️  SISTEMA EMAIL MARKETING REQUER CORREÇÕES!', 'yellow');
    log(`📧 ${totalTests - passedTests} funcionalidades falharam`, 'yellow');
  }
  
  return passedTests === totalTests;
}

// Executar testes
if (require.main === module) {
  runCompleteEmailMarketingTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`❌ Erro fatal: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { runCompleteEmailMarketingTest };