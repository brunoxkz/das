#!/usr/bin/env node

/**
 * 🔒 TESTE ESPECÍFICO DE VALIDAÇÃO DE CRÉDITOS
 * Testa o sistema anti-fraude com cenários específicos
 */

const http = require('http');
const sqlite3 = require('better-sqlite3');

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
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

// Função para fazer requisições
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

// Função para modificar créditos diretamente no banco
function modifyCreditsInDatabase(userId, creditType, newAmount) {
  try {
    const db = sqlite3('./vendzz-database.db');
    
    // Buscar créditos atuais
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    // Atualizar créditos
    const updateColumn = `${creditType}Credits`;
    const updateStmt = db.prepare(`UPDATE users SET ${updateColumn} = ? WHERE id = ?`);
    updateStmt.run(newAmount, userId);
    
    db.close();
    
    log(`✅ Créditos ${creditType} atualizados para ${newAmount}`, 'green');
    return true;
  } catch (error) {
    log(`❌ Erro ao modificar créditos: ${error.message}`, 'red');
    return false;
  }
}

// Função de autenticação
async function authenticate() {
  try {
    const response = await makeRequest('POST', '/api/auth/login', TEST_USER);
    if (response.status === 200 && (response.data.accessToken || response.data.token)) {
      return response.data.accessToken || response.data.token;
    }
    throw new Error(`Falha na autenticação - Status: ${response.status}`);
  } catch (error) {
    log(`❌ Erro na autenticação: ${error.message}`, 'red');
    throw error;
  }
}

// Função para testar criação de campanha SMS com créditos insuficientes
async function testSMSCampaignWithInsufficientCredits(token, userId) {
  try {
    log('\n🔒 TESTE: Criação de campanha SMS com créditos insuficientes', 'blue');
    
    // Reduzir créditos SMS para 0
    modifyCreditsInDatabase(userId, 'sms', 0);
    
    // Tentar criar campanha
    const campaignData = {
      name: 'Teste SMS Créditos Insuficientes',
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
      message: 'Mensagem de teste que deveria ser bloqueada',
      targetAudience: 'all',
      triggerType: 'immediate'
    };

    const response = await makeRequest('POST', '/api/sms-campaigns', campaignData, token);
    
    if (response.status === 402 || response.status === 400) {
      log(`✅ TESTE APROVADO: Sistema bloqueou campanha SMS (Status: ${response.status})`, 'green');
      log(`📊 Resposta: ${JSON.stringify(response.data, null, 2)}`, 'cyan');
      return true;
    } else {
      log(`❌ TESTE FALHOU: Sistema permitiu campanha SMS sem créditos (Status: ${response.status})`, 'red');
      log(`📊 Resposta: ${JSON.stringify(response.data, null, 2)}`, 'cyan');
      return false;
    }
  } catch (error) {
    log(`❌ Erro no teste SMS: ${error.message}`, 'red');
    return false;
  }
}

// Função para testar criação de campanha Email com créditos insuficientes
async function testEmailCampaignWithInsufficientCredits(token, userId) {
  try {
    log('\n🔒 TESTE: Criação de campanha Email com créditos insuficientes', 'blue');
    
    // Reduzir créditos Email para 0
    modifyCreditsInDatabase(userId, 'email', 0);
    
    // Tentar criar campanha
    const campaignData = {
      name: 'Teste Email Créditos Insuficientes',
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
      subject: 'Teste que deveria ser bloqueado',
      content: 'Conteúdo de teste que deveria ser bloqueado',
      targetAudience: 'all',
      triggerType: 'immediate'
    };

    const response = await makeRequest('POST', '/api/email-campaigns', campaignData, token);
    
    if (response.status === 402 || response.status === 400) {
      log(`✅ TESTE APROVADO: Sistema bloqueou campanha Email (Status: ${response.status})`, 'green');
      log(`📊 Resposta: ${JSON.stringify(response.data, null, 2)}`, 'cyan');
      return true;
    } else {
      log(`❌ TESTE FALHOU: Sistema permitiu campanha Email sem créditos (Status: ${response.status})`, 'red');
      log(`📊 Resposta: ${JSON.stringify(response.data, null, 2)}`, 'cyan');
      return false;
    }
  } catch (error) {
    log(`❌ Erro no teste Email: ${error.message}`, 'red');
    return false;
  }
}

// Função para testar criação de campanha WhatsApp com créditos insuficientes
async function testWhatsAppCampaignWithInsufficientCredits(token, userId) {
  try {
    log('\n🔒 TESTE: Criação de campanha WhatsApp com créditos insuficientes', 'blue');
    
    // Reduzir créditos WhatsApp para 0
    modifyCreditsInDatabase(userId, 'whatsapp', 0);
    
    // Tentar criar campanha
    const campaignData = {
      name: 'Teste WhatsApp Créditos Insuficientes',
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
      messages: ['Mensagem de teste que deveria ser bloqueada'],
      targetAudience: 'all',
      triggerType: 'immediate'
    };

    const response = await makeRequest('POST', '/api/whatsapp-campaigns', campaignData, token);
    
    if (response.status === 402 || response.status === 400) {
      log(`✅ TESTE APROVADO: Sistema bloqueou campanha WhatsApp (Status: ${response.status})`, 'green');
      log(`📊 Resposta: ${JSON.stringify(response.data, null, 2)}`, 'cyan');
      return true;
    } else {
      log(`❌ TESTE FALHOU: Sistema permitiu campanha WhatsApp sem créditos (Status: ${response.status})`, 'red');
      log(`📊 Resposta: ${JSON.stringify(response.data, null, 2)}`, 'cyan');
      return false;
    }
  } catch (error) {
    log(`❌ Erro no teste WhatsApp: ${error.message}`, 'red');
    return false;
  }
}

// Função para restaurar créditos
function restoreCredits(userId) {
  try {
    log('\n🔧 Restaurando créditos para teste...', 'blue');
    modifyCreditsInDatabase(userId, 'sms', 100);
    modifyCreditsInDatabase(userId, 'email', 500);
    modifyCreditsInDatabase(userId, 'whatsapp', 250);
    modifyCreditsInDatabase(userId, 'ai', 50);
    log('✅ Créditos restaurados com sucesso', 'green');
  } catch (error) {
    log(`❌ Erro ao restaurar créditos: ${error.message}`, 'red');
  }
}

// Função principal
async function runSpecificCreditTests() {
  log('🔒 INICIANDO TESTES ESPECÍFICOS DE VALIDAÇÃO DE CRÉDITOS', 'magenta');
  log('=' * 70, 'magenta');
  
  const startTime = Date.now();
  const results = [];
  
  try {
    // Autenticação
    log('\n🔐 Autenticando usuário...', 'blue');
    const token = await authenticate();
    log(`✅ Autenticação bem-sucedida`, 'green');
    
    // Buscar ID do usuário
    const userResponse = await makeRequest('GET', '/api/auth/verify', null, token);
    const userId = userResponse.data.user.id;
    log(`👤 ID do usuário: ${userId}`, 'cyan');
    
    // Executar testes específicos
    const tests = [
      { name: 'SMS Campaign with 0 Credits', fn: () => testSMSCampaignWithInsufficientCredits(token, userId) },
      { name: 'Email Campaign with 0 Credits', fn: () => testEmailCampaignWithInsufficientCredits(token, userId) },
      { name: 'WhatsApp Campaign with 0 Credits', fn: () => testWhatsAppCampaignWithInsufficientCredits(token, userId) }
    ];
    
    for (const test of tests) {
      try {
        const result = await test.fn();
        results.push({ name: test.name, passed: result });
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        log(`❌ Erro no teste ${test.name}: ${error.message}`, 'red');
        results.push({ name: test.name, passed: false, error: error.message });
      }
    }
    
    // Restaurar créditos
    restoreCredits(userId);
    
  } catch (error) {
    log(`❌ Erro crítico: ${error.message}`, 'red');
    results.push({ name: 'Critical Error', passed: false, error: error.message });
  }
  
  // Relatório final
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  log('\n' + '=' * 70, 'magenta');
  log('📊 RELATÓRIO FINAL DOS TESTES ESPECÍFICOS', 'magenta');
  log('=' * 70, 'magenta');
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
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
    log('\n🎉 SISTEMA ANTI-FRAUDE 100% FUNCIONAL!', 'green');
    log('🔒 Sistema bloqueia corretamente campanhas sem créditos', 'green');
  } else {
    log('\n⚠️  SISTEMA ANTI-FRAUDE REQUER CORREÇÕES!', 'yellow');
    log(`🔒 ${totalTests - passedTests} validações falharam`, 'yellow');
  }
  
  return passedTests === totalTests;
}

// Executar testes
if (require.main === module) {
  runSpecificCreditTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`❌ Erro fatal: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { runSpecificCreditTests };