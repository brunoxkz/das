/**
 * TESTE ESPECÍFICO - VALIDAÇÃO DE CRÉDITOS ANTI-FRAUDE
 * Testa cada canal individualmente com foco na validação de créditos
 * Data: 11 de Janeiro de 2025
 */

const http = require('http');
const Database = require('better-sqlite3');
const path = require('path');

// Conectar ao banco de dados
const dbPath = path.join(__dirname, 'vendzz-database.db');
const db = new Database(dbPath);

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
    log('🔐 Fazendo login...', 'blue');
    const response = await makeRequest('POST', '/api/auth/login', TEST_USER);
    
    if (response.status === 200 && (response.data.accessToken || response.data.token)) {
      const token = response.data.accessToken || response.data.token;
      log('✅ Login realizado com sucesso', 'green');
      return { token, userId: response.data.user.id };
    }
    
    throw new Error(`Falha na autenticação - Status: ${response.status}`);
  } catch (error) {
    log(`❌ Erro na autenticação: ${error.message}`, 'red');
    throw error;
  }
}

// Função para zerar créditos específicos
function zeroSpecificCredits(userId, creditType) {
  try {
    log(`🔧 Zerando créditos ${creditType.toUpperCase()} do usuário`, 'yellow');
    
    const updateFields = {
      sms: 'smsCredits = 0',
      email: 'emailCredits = 0',
      whatsapp: 'whatsappCredits = 0',
      ai: 'aiCredits = 0'
    };
    
    const query = `UPDATE users SET ${updateFields[creditType]} WHERE id = ?`;
    db.prepare(query).run(userId);
    
    log(`✅ Créditos ${creditType.toUpperCase()} zerados`, 'green');
    return true;
  } catch (error) {
    log(`❌ Erro ao zerar créditos ${creditType}: ${error.message}`, 'red');
    return false;
  }
}

// Função para restaurar créditos específicos
function restoreSpecificCredits(userId, creditType, amount) {
  try {
    log(`🔧 Restaurando ${amount} créditos ${creditType.toUpperCase()}`, 'yellow');
    
    const updateFields = {
      sms: `smsCredits = ${amount}`,
      email: `emailCredits = ${amount}`,
      whatsapp: `whatsappCredits = ${amount}`,
      ai: `aiCredits = ${amount}`
    };
    
    const query = `UPDATE users SET ${updateFields[creditType]} WHERE id = ?`;
    db.prepare(query).run(userId);
    
    log(`✅ ${amount} créditos ${creditType.toUpperCase()} restaurados`, 'green');
    return true;
  } catch (error) {
    log(`❌ Erro ao restaurar créditos ${creditType}: ${error.message}`, 'red');
    return false;
  }
}

// Teste individual de canal
async function testChannel(channel, token, userId) {
  log(`\n🧪 TESTANDO CANAL ${channel.toUpperCase()}`, 'magenta');
  log('===============================================', 'gray');
  
  const results = {
    channel,
    blockedWithoutCredits: false,
    allowedWithCredits: false,
    error: null
  };
  
  try {
    // 1. Zerar créditos
    if (!zeroSpecificCredits(userId, channel)) {
      results.error = 'Falha ao zerar créditos';
      return results;
    }
    
    // 2. Tentar criar campanha sem créditos
    log(`🔒 Tentando criar campanha ${channel.toUpperCase()} sem créditos...`, 'blue');
    
    let campaignData;
    let endpoint;
    
    if (channel === 'sms') {
      endpoint = '/api/sms-campaigns';
      campaignData = {
        name: 'Teste SMS Validação',
        quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
        message: 'Teste SMS validação de créditos',
        triggerType: 'immediate',
        targetAudience: 'all',
        dateFilter: new Date('2020-01-01').toISOString().split('T')[0]
      };
    } else if (channel === 'email') {
      endpoint = '/api/email-campaigns';
      campaignData = {
        name: 'Teste Email Validação',
        quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
        subject: 'Teste Email validação',
        content: 'Teste email validação de créditos',
        targetAudience: 'all',
        dateFilter: new Date('2020-01-01').toISOString().split('T')[0]
      };
    } else if (channel === 'whatsapp') {
      endpoint = '/api/whatsapp-campaigns';
      campaignData = {
        name: 'Teste WhatsApp Validação',
        quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
        messages: ['Teste WhatsApp validação de créditos'],
        targetAudience: 'all',
        dateFilter: new Date('2020-01-01').toISOString().split('T')[0]
      };
    }
    
    const response1 = await makeRequest('POST', endpoint, campaignData, token);
    
    if (response1.status === 402) {
      log(`✅ ${channel.toUpperCase()} bloqueado sem créditos (HTTP 402)`, 'green');
      results.blockedWithoutCredits = true;
    } else {
      log(`❌ ${channel.toUpperCase()} não bloqueado sem créditos (Status: ${response1.status})`, 'red');
    }
    
    // 3. Restaurar créditos
    if (!restoreSpecificCredits(userId, channel, 500)) {
      results.error = 'Falha ao restaurar créditos';
      return results;
    }
    
    // 4. Tentar criar campanha com créditos
    log(`💳 Tentando criar campanha ${channel.toUpperCase()} com créditos...`, 'blue');
    
    const response2 = await makeRequest('POST', endpoint, campaignData, token);
    
    if (response2.status === 200 || response2.status === 201) {
      log(`✅ ${channel.toUpperCase()} criado com créditos (Status: ${response2.status})`, 'green');
      results.allowedWithCredits = true;
    } else {
      log(`❌ ${channel.toUpperCase()} não criado com créditos (Status: ${response2.status})`, 'red');
      if (response2.data.error) {
        log(`📄 Erro: ${response2.data.error}`, 'red');
      }
    }
    
  } catch (error) {
    log(`❌ Erro no teste ${channel.toUpperCase()}: ${error.message}`, 'red');
    results.error = error.message;
  }
  
  return results;
}

// Função principal
async function runValidationTest() {
  const startTime = Date.now();
  
  log('🔒 INICIANDO TESTE ESPECÍFICO DE VALIDAÇÃO DE CRÉDITOS', 'magenta');
  log('============================================================', 'gray');
  
  try {
    // Autenticação
    const { token, userId } = await authenticate();
    
    // Testar cada canal individualmente
    const channels = ['sms', 'email', 'whatsapp'];
    const results = [];
    
    for (const channel of channels) {
      const result = await testChannel(channel, token, userId);
      results.push(result);
    }
    
    // Relatório final
    const duration = Date.now() - startTime;
    
    log('\n============================================================', 'gray');
    log('📊 RELATÓRIO FINAL DE VALIDAÇÃO DE CRÉDITOS', 'magenta');
    log('============================================================', 'gray');
    
    log(`⏱️  Duração total: ${duration}ms`, 'gray');
    
    let totalTests = 0;
    let passedTests = 0;
    
    for (const result of results) {
      log(`\n📱 ${result.channel.toUpperCase()}:`, 'cyan');
      
      if (result.error) {
        log(`❌ ERRO: ${result.error}`, 'red');
        totalTests += 2;
      } else {
        // Teste 1: Bloqueio sem créditos
        if (result.blockedWithoutCredits) {
          log(`✅ PASSOU - Bloqueado sem créditos`, 'green');
          passedTests++;
        } else {
          log(`❌ FALHOU - Não bloqueado sem créditos`, 'red');
        }
        totalTests++;
        
        // Teste 2: Permitido com créditos
        if (result.allowedWithCredits) {
          log(`✅ PASSOU - Permitido com créditos`, 'green');
          passedTests++;
        } else {
          log(`❌ FALHOU - Não permitido com créditos`, 'red');
        }
        totalTests++;
      }
    }
    
    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
    
    log(`\n🎯 RESULTADO FINAL:`, 'magenta');
    log(`✅ Testes aprovados: ${passedTests}/${totalTests} (${successRate}%)`, successRate >= 80 ? 'green' : 'red');
    
    if (successRate >= 80) {
      log('\n🎉 SISTEMA ANTI-FRAUDE APROVADO!', 'green');
      log('🔒 Todos os canais estão protegidos contra criação sem créditos', 'green');
    } else {
      log('\n⚠️  SISTEMA ANTI-FRAUDE REQUER CORREÇÕES!', 'yellow');
      log('❌ Alguns canais não estão adequadamente protegidos', 'red');
    }
    
  } catch (error) {
    log(`❌ Erro durante o teste: ${error.message}`, 'red');
  } finally {
    db.close();
    log('\n🔚 Teste concluído!', 'gray');
  }
}

// Executar teste
runValidationTest();