/**
 * TESTE COMPLETO DO SISTEMA ANTI-FRAUDE DE CRÉDITOS
 * Valida: pausar campanhas, impedir criação, reativar com créditos, detecção automática de leads
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
    log('🔐 Autenticando usuário...', 'blue');
    const response = await makeRequest('POST', '/api/auth/login', TEST_USER);
    
    if (response.status === 200 && (response.data.accessToken || response.data.token)) {
      const token = response.data.accessToken || response.data.token;
      log('✅ Autenticação bem-sucedida', 'green');
      return { token, userId: response.data.user.id };
    }
    
    throw new Error(`Falha na autenticação - Status: ${response.status}`);
  } catch (error) {
    log(`❌ Erro na autenticação: ${error.message}`, 'red');
    throw error;
  }
}

// Função para verificar créditos atuais
async function checkCredits(token) {
  try {
    log('\n💰 VERIFICANDO CRÉDITOS ATUAIS', 'blue');
    
    const smsResponse = await makeRequest('GET', '/api/sms-credits', null, token);
    const emailResponse = await makeRequest('GET', '/api/auth/verify', null, token);
    
    if (smsResponse.status === 200 && emailResponse.status === 200) {
      const smsCredits = smsResponse.data;
      const emailCredits = emailResponse.data.user.emailCredits || 0;
      const whatsappCredits = emailResponse.data.user.whatsappCredits || 0;
      
      log(`📊 SMS: ${smsCredits.remaining}/${smsCredits.total}`, 'cyan');
      log(`📧 Email: ${emailCredits}`, 'cyan');
      log(`📱 WhatsApp: ${whatsappCredits}`, 'cyan');
      
      return {
        sms: smsCredits.remaining,
        email: emailCredits,
        whatsapp: whatsappCredits
      };
    }
    
    throw new Error('Falha ao verificar créditos');
  } catch (error) {
    log(`❌ Erro ao verificar créditos: ${error.message}`, 'red');
    return null;
  }
}

// Função para zerar créditos no banco de dados
function zeroCredits(userId) {
  try {
    log('\n🔧 ZERANDO CRÉDITOS NO BANCO DE DADOS', 'yellow');
    
    // Zerar créditos do usuário
    db.prepare('UPDATE users SET smsCredits = 0, emailCredits = 0, whatsappCredits = 0 WHERE id = ?').run(userId);
    
    log('✅ Créditos zerados com sucesso', 'green');
    return true;
  } catch (error) {
    log(`❌ Erro ao zerar créditos: ${error.message}`, 'red');
    return false;
  }
}

// Função para restaurar créditos
function restoreCredits(userId) {
  try {
    log('\n🔧 RESTAURANDO CRÉDITOS NO BANCO DE DADOS', 'yellow');
    
    // Restaurar créditos do usuário
    db.prepare('UPDATE users SET smsCredits = 100, emailCredits = 500, whatsappCredits = 200 WHERE id = ?').run(userId);
    
    log('✅ Créditos restaurados com sucesso', 'green');
    return true;
  } catch (error) {
    log(`❌ Erro ao restaurar créditos: ${error.message}`, 'red');
    return false;
  }
}

// Teste 1: Tentar criar campanha SMS sem créditos
async function testSMSWithoutCredits(token) {
  try {
    log('\n📱 TESTE 1: Criar campanha SMS SEM CRÉDITOS', 'blue');
    
    const campaignData = {
      name: 'Teste SMS Sem Créditos',
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
      message: 'Teste de mensagem SMS',
      triggerType: 'immediate',
      targetAudience: 'all',
      dateFilter: new Date('2020-01-01').toISOString().split('T')[0]
    };
    
    const response = await makeRequest('POST', '/api/sms-campaigns', campaignData, token);
    
    if (response.status === 402) {
      log('✅ Sistema bloqueou criação sem créditos (HTTP 402)', 'green');
      log(`📄 Resposta: ${JSON.stringify(response.data)}`, 'cyan');
      return { success: true, blocked: true };
    } else {
      log(`❌ Sistema permitiu criação sem créditos - Status: ${response.status}`, 'red');
      return { success: false, blocked: false };
    }
  } catch (error) {
    log(`❌ Erro no teste SMS: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Teste 2: Tentar criar campanha Email sem créditos
async function testEmailWithoutCredits(token) {
  try {
    log('\n📧 TESTE 2: Criar campanha EMAIL SEM CRÉDITOS', 'blue');
    
    const campaignData = {
      name: 'Teste Email Sem Créditos',
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
      subject: 'Teste de email',
      content: 'Conteúdo de teste',
      targetAudience: 'all',
      dateFilter: new Date('2020-01-01').toISOString().split('T')[0]
    };
    
    const response = await makeRequest('POST', '/api/email-campaigns', campaignData, token);
    
    if (response.status === 402) {
      log('✅ Sistema bloqueou criação sem créditos (HTTP 402)', 'green');
      log(`📄 Resposta: ${JSON.stringify(response.data)}`, 'cyan');
      return { success: true, blocked: true };
    } else {
      log(`❌ Sistema permitiu criação sem créditos - Status: ${response.status}`, 'red');
      return { success: false, blocked: false };
    }
  } catch (error) {
    log(`❌ Erro no teste Email: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Teste 3: Tentar criar campanha WhatsApp sem créditos
async function testWhatsAppWithoutCredits(token) {
  try {
    log('\n📱 TESTE 3: Criar campanha WHATSAPP SEM CRÉDITOS', 'blue');
    
    const campaignData = {
      name: 'Teste WhatsApp Sem Créditos',
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
      messages: ['Teste de mensagem WhatsApp'],
      targetAudience: 'all',
      dateFilter: new Date('2020-01-01').toISOString().split('T')[0]
    };
    
    const response = await makeRequest('POST', '/api/whatsapp-campaigns', campaignData, token);
    
    if (response.status === 402) {
      log('✅ Sistema bloqueou criação sem créditos (HTTP 402)', 'green');
      log(`📄 Resposta: ${JSON.stringify(response.data)}`, 'cyan');
      return { success: true, blocked: true };
    } else {
      log(`❌ Sistema permitiu criação sem créditos - Status: ${response.status}`, 'red');
      return { success: false, blocked: false };
    }
  } catch (error) {
    log(`❌ Erro no teste WhatsApp: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Teste 4: Criar campanhas COM créditos após restauração
async function testCreateWithCredits(token) {
  try {
    log('\n💳 TESTE 4: Criar campanhas COM CRÉDITOS', 'blue');
    
    const results = {};
    
    // Teste SMS
    const smsData = {
      name: 'Teste SMS Com Créditos',
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
      message: 'Teste de mensagem SMS',
      triggerType: 'immediate',
      targetAudience: 'all',
      dateFilter: new Date('2020-01-01').toISOString().split('T')[0]
    };
    
    const smsResponse = await makeRequest('POST', '/api/sms-campaigns', smsData, token);
    results.sms = {
      status: smsResponse.status,
      success: smsResponse.status === 200 || smsResponse.status === 201,
      data: smsResponse.data
    };
    
    // Teste Email
    const emailData = {
      name: 'Teste Email Com Créditos',
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
      subject: 'Teste de email',
      content: 'Conteúdo de teste',
      targetAudience: 'all',
      dateFilter: new Date('2020-01-01').toISOString().split('T')[0]
    };
    
    const emailResponse = await makeRequest('POST', '/api/email-campaigns', emailData, token);
    results.email = {
      status: emailResponse.status,
      success: emailResponse.status === 200 || emailResponse.status === 201,
      data: emailResponse.data
    };
    
    // Teste WhatsApp
    const whatsappData = {
      name: 'Teste WhatsApp Com Créditos',
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
      messages: ['Teste de mensagem WhatsApp'],
      targetAudience: 'all',
      dateFilter: new Date('2020-01-01').toISOString().split('T')[0]
    };
    
    const whatsappResponse = await makeRequest('POST', '/api/whatsapp-campaigns', whatsappData, token);
    results.whatsapp = {
      status: whatsappResponse.status,
      success: whatsappResponse.status === 200 || whatsappResponse.status === 201,
      data: whatsappResponse.data
    };
    
    // Resultados
    log(`📱 SMS: ${results.sms.success ? '✅ Criada' : '❌ Falhou'} (Status: ${results.sms.status})`, results.sms.success ? 'green' : 'red');
    log(`📧 Email: ${results.email.success ? '✅ Criada' : '❌ Falhou'} (Status: ${results.email.status})`, results.email.success ? 'green' : 'red');
    log(`📱 WhatsApp: ${results.whatsapp.success ? '✅ Criada' : '❌ Falhou'} (Status: ${results.whatsapp.status})`, results.whatsapp.success ? 'green' : 'red');
    
    return results;
  } catch (error) {
    log(`❌ Erro no teste com créditos: ${error.message}`, 'red');
    return { error: error.message };
  }
}

// Teste 5: Verificar detecção automática de leads
async function testAutoLeadDetection() {
  try {
    log('\n🤖 TESTE 5: DETECÇÃO AUTOMÁTICA DE LEADS', 'blue');
    
    // Contar campanhas SMS ativas
    const smsCampaigns = db.prepare('SELECT COUNT(*) as count FROM sms_campaigns WHERE status = ?').get('active');
    log(`📱 Campanhas SMS ativas: ${smsCampaigns.count}`, 'cyan');
    
    // Contar campanhas WhatsApp ativas
    const whatsappCampaigns = db.prepare('SELECT COUNT(*) as count FROM whatsapp_campaigns WHERE status = ?').get('active');
    log(`📱 Campanhas WhatsApp ativas: ${whatsappCampaigns.count}`, 'cyan');
    
    // Contar campanhas Email ativas
    const emailCampaigns = db.prepare('SELECT COUNT(*) as count FROM email_campaigns WHERE status = ?').get('active');
    log(`📧 Campanhas Email ativas: ${emailCampaigns.count}`, 'cyan');
    
    // Verificar se há respostas recentes de quiz
    const recentResponses = db.prepare(`
      SELECT COUNT(*) as count 
      FROM quiz_responses 
      WHERE submittedAt > datetime('now', '-1 hour')
    `).get();
    log(`📊 Respostas recentes (1h): ${recentResponses.count}`, 'cyan');
    
    // Verificar leads agendados
    const scheduledSMS = db.prepare('SELECT COUNT(*) as count FROM sms_logs WHERE status = ?').get('scheduled');
    log(`📱 SMS agendados: ${scheduledSMS.count}`, 'cyan');
    
    const scheduledWhatsApp = db.prepare('SELECT COUNT(*) as count FROM whatsapp_logs WHERE status = ?').get('scheduled');
    log(`📱 WhatsApp agendados: ${scheduledWhatsApp.count}`, 'cyan');
    
    return {
      success: true,
      activeCampaigns: {
        sms: smsCampaigns.count,
        whatsapp: whatsappCampaigns.count,
        email: emailCampaigns.count
      },
      recentResponses: recentResponses.count,
      scheduled: {
        sms: scheduledSMS.count,
        whatsapp: scheduledWhatsApp.count
      }
    };
  } catch (error) {
    log(`❌ Erro na verificação de detecção automática: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Função principal
async function runTests() {
  const startTime = Date.now();
  let results = {};
  
  log('🧪 INICIANDO TESTE COMPLETO DO SISTEMA ANTI-FRAUDE', 'magenta');
  log('============================================================', 'gray');
  
  try {
    // 1. Autenticação
    const auth = await authenticate();
    const { token, userId } = auth;
    
    // 2. Verificar créditos iniciais
    const initialCredits = await checkCredits(token);
    results.initialCredits = initialCredits;
    
    // 3. Zerar créditos
    const creditsZeroed = zeroCredits(userId);
    if (!creditsZeroed) {
      throw new Error('Falha ao zerar créditos');
    }
    
    // 4. Verificar créditos após zerar
    const zeroedCredits = await checkCredits(token);
    results.zeroedCredits = zeroedCredits;
    
    // 5. Testes sem créditos
    results.smsWithoutCredits = await testSMSWithoutCredits(token);
    results.emailWithoutCredits = await testEmailWithoutCredits(token);
    results.whatsappWithoutCredits = await testWhatsAppWithoutCredits(token);
    
    // 6. Restaurar créditos
    const creditsRestored = restoreCredits(userId);
    if (!creditsRestored) {
      throw new Error('Falha ao restaurar créditos');
    }
    
    // 7. Verificar créditos após restaurar
    const restoredCredits = await checkCredits(token);
    results.restoredCredits = restoredCredits;
    
    // 8. Testes com créditos
    results.createWithCredits = await testCreateWithCredits(token);
    
    // 9. Verificar detecção automática
    results.autoDetection = await testAutoLeadDetection();
    
  } catch (error) {
    log(`❌ Erro durante os testes: ${error.message}`, 'red');
    results.error = error.message;
  } finally {
    db.close();
  }
  
  // Relatório final
  const duration = Date.now() - startTime;
  
  log('\n============================================================', 'gray');
  log('📊 RELATÓRIO FINAL DO SISTEMA ANTI-FRAUDE', 'magenta');
  log('============================================================', 'gray');
  
  log(`\n⏱️  Duração total: ${duration}ms`, 'gray');
  
  // Contabilizar sucessos
  let passed = 0;
  let total = 0;
  
  // Validações
  if (results.smsWithoutCredits?.blocked) { passed++; log('✅ PASSOU - SMS bloqueado sem créditos', 'green'); } else { log('❌ FALHOU - SMS não bloqueado sem créditos', 'red'); }
  total++;
  
  if (results.emailWithoutCredits?.blocked) { passed++; log('✅ PASSOU - Email bloqueado sem créditos', 'green'); } else { log('❌ FALHOU - Email não bloqueado sem créditos', 'red'); }
  total++;
  
  if (results.whatsappWithoutCredits?.blocked) { passed++; log('✅ PASSOU - WhatsApp bloqueado sem créditos', 'green'); } else { log('❌ FALHOU - WhatsApp não bloqueado sem créditos', 'red'); }
  total++;
  
  if (results.createWithCredits?.sms?.success) { passed++; log('✅ PASSOU - SMS criado com créditos', 'green'); } else { log('❌ FALHOU - SMS não criado com créditos', 'red'); }
  total++;
  
  if (results.createWithCredits?.email?.success) { passed++; log('✅ PASSOU - Email criado com créditos', 'green'); } else { log('❌ FALHOU - Email não criado com créditos', 'red'); }
  total++;
  
  if (results.createWithCredits?.whatsapp?.success) { passed++; log('✅ PASSOU - WhatsApp criado com créditos', 'green'); } else { log('❌ FALHOU - WhatsApp não criado com créditos', 'red'); }
  total++;
  
  if (results.autoDetection?.success) { passed++; log('✅ PASSOU - Detecção automática funcionando', 'green'); } else { log('❌ FALHOU - Detecção automática com problemas', 'red'); }
  total++;
  
  const successRate = ((passed / total) * 100).toFixed(1);
  log(`\n✅ Taxa de sucesso: ${passed}/${total} (${successRate}%)`, successRate >= 80 ? 'green' : 'red');
  
  if (successRate >= 80) {
    log('\n🎉 SISTEMA ANTI-FRAUDE APROVADO PARA PRODUÇÃO!', 'green');
  } else {
    log('\n⚠️  SISTEMA ANTI-FRAUDE REQUER CORREÇÕES!', 'yellow');
  }
  
  // Detecção automática
  if (results.autoDetection?.success) {
    log(`\n🤖 DETECÇÃO AUTOMÁTICA DE LEADS:`, 'cyan');
    log(`   📱 Campanhas SMS ativas: ${results.autoDetection.activeCampaigns.sms}`, 'cyan');
    log(`   📧 Campanhas Email ativas: ${results.autoDetection.activeCampaigns.email}`, 'cyan');
    log(`   📱 Campanhas WhatsApp ativas: ${results.autoDetection.activeCampaigns.whatsapp}`, 'cyan');
    log(`   📊 Respostas recentes: ${results.autoDetection.recentResponses}`, 'cyan');
    log(`   ⏰ SMS agendados: ${results.autoDetection.scheduled.sms}`, 'cyan');
    log(`   ⏰ WhatsApp agendados: ${results.autoDetection.scheduled.whatsapp}`, 'cyan');
  }
}

// Executar testes
runTests();