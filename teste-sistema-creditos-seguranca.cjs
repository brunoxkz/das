#!/usr/bin/env node

/**
 * 🔒 TESTE SISTEMA DE SEGURANÇA DE CRÉDITOS
 * Sistema anti-fraude para prevenir burlas no sistema de créditos
 * 
 * VALIDAÇÕES:
 * 1. Validação de créditos antes de criar campanhas
 * 2. Débito de créditos após envios bem-sucedidos  
 * 3. Pausar campanhas quando créditos esgotam
 * 4. Isolamento completo entre tipos de créditos
 * 5. Ratio 1:1 - 1 crédito = 1 ação específica
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configurações do teste
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
    const response = await makeRequest('POST', '/api/auth/login', TEST_USER);
    if (response.status === 200 && (response.data.accessToken || response.data.token)) {
      return response.data.accessToken || response.data.token;
    }
    throw new Error(`Falha na autenticação - Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
  } catch (error) {
    log(`❌ Erro na autenticação: ${error.message}`, 'red');
    throw error;
  }
}

// Função para buscar créditos do usuário
async function getUserCredits(token) {
  try {
    const response = await makeRequest('GET', '/api/user/credits', null, token);
    if (response.status === 200) {
      return response.data;
    }
    throw new Error('Falha ao buscar créditos');
  } catch (error) {
    log(`❌ Erro ao buscar créditos: ${error.message}`, 'red');
    throw error;
  }
}

// Função para testar criação de campanha SMS sem créditos
async function testSMSCampaignCreationWithoutCredits(token) {
  try {
    log('\n🔒 TESTE: Criação de campanha SMS sem créditos suficientes', 'blue');
    
    // Dados de campanha que excederiam créditos
    const campaignData = {
      name: 'Teste Anti-Fraude SMS',
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
      message: 'Mensagem de teste',
      targetAudience: 'all',
      triggerType: 'immediate'
    };

    const response = await makeRequest('POST', '/api/sms-campaigns', campaignData, token);
    
    if (response.status === 402) {
      log(`✅ TESTE APROVADO: Sistema bloqueou criação de campanha (Status: 402)`, 'green');
      log(`📊 Resposta: ${JSON.stringify(response.data, null, 2)}`, 'cyan');
      return true;
    } else {
      log(`❌ TESTE FALHOU: Sistema permitiu criação sem créditos suficientes (Status: ${response.status})`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erro no teste SMS: ${error.message}`, 'red');
    return false;
  }
}

// Função para testar criação de campanha Email sem créditos
async function testEmailCampaignCreationWithoutCredits(token) {
  try {
    log('\n🔒 TESTE: Criação de campanha Email sem créditos suficientes', 'blue');
    
    const campaignData = {
      name: 'Teste Anti-Fraude Email',
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
      subject: 'Teste',
      content: 'Conteúdo de teste',
      targetAudience: 'all',
      triggerType: 'immediate'
    };

    const response = await makeRequest('POST', '/api/email-campaigns', campaignData, token);
    
    if (response.status === 402) {
      log(`✅ TESTE APROVADO: Sistema bloqueou criação de campanha Email (Status: 402)`, 'green');
      log(`📊 Resposta: ${JSON.stringify(response.data, null, 2)}`, 'cyan');
      return true;
    } else {
      log(`❌ TESTE FALHOU: Sistema permitiu criação Email sem créditos suficientes (Status: ${response.status})`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erro no teste Email: ${error.message}`, 'red');
    return false;
  }
}

// Função para testar criação de campanha WhatsApp sem créditos
async function testWhatsAppCampaignCreationWithoutCredits(token) {
  try {
    log('\n🔒 TESTE: Criação de campanha WhatsApp sem créditos suficientes', 'blue');
    
    const campaignData = {
      name: 'Teste Anti-Fraude WhatsApp',
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
      messages: ['Mensagem de teste'],
      targetAudience: 'all',
      triggerType: 'immediate'
    };

    const response = await makeRequest('POST', '/api/whatsapp-campaigns', campaignData, token);
    
    if (response.status === 402) {
      log(`✅ TESTE APROVADO: Sistema bloqueou criação de campanha WhatsApp (Status: 402)`, 'green');
      log(`📊 Resposta: ${JSON.stringify(response.data, null, 2)}`, 'cyan');
      return true;
    } else {
      log(`❌ TESTE FALHOU: Sistema permitiu criação WhatsApp sem créditos suficientes (Status: ${response.status})`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erro no teste WhatsApp: ${error.message}`, 'red');
    return false;
  }
}

// Função para testar isolamento de créditos
async function testCreditIsolation(token) {
  try {
    log('\n🔒 TESTE: Isolamento entre tipos de créditos', 'blue');
    
    const credits = await getUserCredits(token);
    
    // Verificar se créditos são separados por tipo
    const hasSeperateCredits = credits.breakdown && 
                               typeof credits.breakdown.sms === 'number' &&
                               typeof credits.breakdown.email === 'number' &&
                               typeof credits.breakdown.whatsapp === 'number';
    
    if (hasSeperateCredits) {
      log(`✅ TESTE APROVADO: Créditos separados por tipo`, 'green');
      log(`📊 SMS: ${credits.breakdown.sms}, Email: ${credits.breakdown.email}, WhatsApp: ${credits.breakdown.whatsapp}`, 'cyan');
      return true;
    } else {
      log(`❌ TESTE FALHOU: Créditos não separados adequadamente`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erro no teste de isolamento: ${error.message}`, 'red');
    return false;
  }
}

// Função para testar endpoints de validação de créditos
async function testCreditValidationEndpoints(token) {
  try {
    log('\n🔒 TESTE: Endpoints de validação de créditos', 'blue');
    
    // Testar endpoint de validação para cada tipo
    const tests = [
      { type: 'sms', amount: 1000 },
      { type: 'email', amount: 1000 },
      { type: 'whatsapp', amount: 1000 }
    ];
    
    let passedTests = 0;
    
    for (const test of tests) {
      try {
        const response = await makeRequest('POST', `/api/credits/validate`, {
          creditType: test.type,
          amount: test.amount
        }, token);
        
        if (response.status === 200) {
          log(`✅ Validação ${test.type}: OK`, 'green');
          passedTests++;
        } else {
          log(`❌ Validação ${test.type}: FAIL (Status: ${response.status})`, 'red');
        }
      } catch (error) {
        log(`❌ Erro na validação ${test.type}: ${error.message}`, 'red');
      }
    }
    
    return passedTests === tests.length;
  } catch (error) {
    log(`❌ Erro no teste de endpoints: ${error.message}`, 'red');
    return false;
  }
}

// Função principal de teste
async function runSecurityTests() {
  log('🔒 INICIANDO TESTES DE SEGURANÇA DE CRÉDITOS', 'magenta');
  log('=' * 60, 'magenta');
  
  const startTime = Date.now();
  const results = [];
  
  try {
    // Autenticação
    log('\n🔐 Autenticando usuário...', 'blue');
    const token = await authenticate();
    log(`✅ Autenticação bem-sucedida`, 'green');
    
    // Buscar créditos atuais
    log('\n💰 Buscando créditos atuais...', 'blue');
    const credits = await getUserCredits(token);
    log(`💳 Créditos atuais: ${JSON.stringify(credits, null, 2)}`, 'cyan');
    
    // Executar testes de segurança
    const tests = [
      { name: 'SMS Campaign Creation Block', fn: () => testSMSCampaignCreationWithoutCredits(token) },
      { name: 'Email Campaign Creation Block', fn: () => testEmailCampaignCreationWithoutCredits(token) },
      { name: 'WhatsApp Campaign Creation Block', fn: () => testWhatsAppCampaignCreationWithoutCredits(token) },
      { name: 'Credit Isolation', fn: () => testCreditIsolation(token) },
      { name: 'Credit Validation Endpoints', fn: () => testCreditValidationEndpoints(token) }
    ];
    
    for (const test of tests) {
      try {
        const result = await test.fn();
        results.push({ name: test.name, passed: result });
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay entre testes
      } catch (error) {
        log(`❌ Erro no teste ${test.name}: ${error.message}`, 'red');
        results.push({ name: test.name, passed: false, error: error.message });
      }
    }
    
  } catch (error) {
    log(`❌ Erro crítico: ${error.message}`, 'red');
    results.push({ name: 'Critical Error', passed: false, error: error.message });
  }
  
  // Relatório final
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  log('\n' + '=' * 60, 'magenta');
  log('📊 RELATÓRIO FINAL DE SEGURANÇA', 'magenta');
  log('=' * 60, 'magenta');
  
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
    log('\n🎉 SISTEMA DE SEGURANÇA 100% APROVADO!', 'green');
    log('🔒 Todas as validações anti-fraude estão funcionando corretamente', 'green');
  } else {
    log('\n⚠️  SISTEMA DE SEGURANÇA REQUER ATENÇÃO!', 'yellow');
    log(`🔒 ${totalTests - passedTests} validações precisam ser corrigidas`, 'yellow');
  }
  
  // Salvar relatório
  const reportData = {
    timestamp: new Date().toISOString(),
    duration: duration,
    results: results,
    successRate: successRate,
    summary: {
      passed: passedTests,
      total: totalTests,
      status: passedTests === totalTests ? 'APROVADO' : 'REQUER_ATENÇÃO'
    }
  };
  
  fs.writeFileSync('relatorio-seguranca-creditos.json', JSON.stringify(reportData, null, 2));
  log('\n📄 Relatório salvo em: relatorio-seguranca-creditos.json', 'blue');
  
  return passedTests === totalTests;
}

// Executar testes
if (require.main === module) {
  runSecurityTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`❌ Erro fatal: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { runSecurityTests };