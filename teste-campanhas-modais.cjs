const axios = require('axios');

// Configuração do teste
const BASE_URL = 'http://localhost:5000';
const TEST_USER = {
  email: 'admin@admin.com',
  password: 'admin123'
};

let authToken = '';

// Função para fazer login e obter token
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, TEST_USER);
    authToken = response.data.token;
    console.log('✅ Login realizado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro no login:', error.response?.data?.message || error.message);
    return false;
  }
}

// Função para verificar créditos
async function checkCredits() {
  try {
    const response = await axios.get(`${BASE_URL}/api/user/credits`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('📊 Créditos disponíveis:', response.data.breakdown);
    return response.data.breakdown;
  } catch (error) {
    console.error('❌ Erro ao verificar créditos:', error.response?.data?.message || error.message);
    return null;
  }
}

// Função para buscar quizzes
async function getQuizzes() {
  try {
    const response = await axios.get(`${BASE_URL}/api/quizzes`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('📝 Quizzes disponíveis:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao buscar quizzes:', error.response?.data?.message || error.message);
    return [];
  }
}

// Função para testar criação de campanha de email
async function testEmailCampaign() {
  try {
    const quizzes = await getQuizzes();
    if (quizzes.length === 0) {
      console.log('⚠️ Nenhum quiz disponível para teste');
      return false;
    }

    const campaignData = {
      name: 'Teste Modal Email',
      subject: 'Teste de Email via Modal',
      content: 'Esta é uma campanha de teste criada via modal.',
      quizId: quizzes[0].id,
      targetAudience: 'all',
      triggerType: 'immediate',
      campaignType: 'standard'
    };

    const response = await axios.post(`${BASE_URL}/api/email-campaigns`, campaignData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Campanha de email criada:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar campanha de email:', error.response?.data?.message || error.message);
    return false;
  }
}

// Função para testar criação de campanha de SMS
async function testSMSCampaign() {
  try {
    const quizzes = await getQuizzes();
    if (quizzes.length === 0) {
      console.log('⚠️ Nenhum quiz disponível para teste');
      return false;
    }

    const campaignData = {
      name: 'Teste Modal SMS',
      message: 'Esta é uma campanha de teste SMS criada via modal.',
      quizId: quizzes[0].id,
      targetAudience: 'all',
      triggerType: 'immediate',
      campaignType: 'standard'
    };

    const response = await axios.post(`${BASE_URL}/api/sms-campaigns`, campaignData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Campanha de SMS criada:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar campanha de SMS:', error.response?.data?.message || error.message);
    return false;
  }
}

// Função para testar validação de créditos
async function testCreditValidation() {
  try {
    const credits = await checkCredits();
    if (!credits) return false;

    console.log('🔍 Testando validação de créditos:');
    console.log(`  - Email: ${credits.email} créditos`);
    console.log(`  - SMS: ${credits.sms} créditos`);
    console.log(`  - WhatsApp: ${credits.whatsapp} créditos`);

    if (credits.email <= 0) {
      console.log('⚠️ ALERTA: Créditos de email insuficientes - campanha deveria ser bloqueada');
    } else {
      console.log('✅ Créditos de email suficientes para criação');
    }

    if (credits.sms <= 0) {
      console.log('⚠️ ALERTA: Créditos de SMS insuficientes - campanha deveria ser bloqueada');
    } else {
      console.log('✅ Créditos de SMS suficientes para criação');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao testar validação de créditos:', error.message);
    return false;
  }
}

// Função principal de teste
async function runTests() {
  console.log('🚀 INICIANDO TESTE DE CAMPANHAS MODAIS');
  console.log('=====================================');

  // Teste 1: Login
  console.log('\n1. Testando autenticação...');
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Falha no login - abortando testes');
    return;
  }

  // Teste 2: Verificar créditos
  console.log('\n2. Verificando créditos disponíveis...');
  await testCreditValidation();

  // Teste 3: Testar criação de campanha de email
  console.log('\n3. Testando criação de campanha de email...');
  const emailSuccess = await testEmailCampaign();

  // Teste 4: Testar criação de campanha de SMS
  console.log('\n4. Testando criação de campanha de SMS...');
  const smsSuccess = await testSMSCampaign();

  // Resumo dos testes
  console.log('\n🎯 RESUMO DOS TESTES:');
  console.log('===================');
  console.log(`✅ Login: ${loginSuccess ? 'SUCESSO' : 'FALHA'}`);
  console.log(`✅ Campanha Email: ${emailSuccess ? 'SUCESSO' : 'FALHA'}`);
  console.log(`✅ Campanha SMS: ${smsSuccess ? 'SUCESSO' : 'FALHA'}`);
  
  const totalTests = 3;
  const passedTests = [loginSuccess, emailSuccess, smsSuccess].filter(Boolean).length;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log(`\n📊 Taxa de Sucesso: ${successRate}% (${passedTests}/${totalTests} testes)`);
  
  if (passedTests === totalTests) {
    console.log('🎉 TODOS OS TESTES PASSARAM - SISTEMA MODAL FUNCIONANDO PERFEITAMENTE!');
  } else {
    console.log('⚠️ ALGUNS TESTES FALHARAM - VERIFICAR LOGS ACIMA');
  }
}

// Executar testes
runTests().catch(console.error);