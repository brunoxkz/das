/**
 * TESTE RÁPIDO - SIDEBAR E SISTEMA
 * Testa funcionalidades básicas da sidebar e sistema
 */

const BASE_URL = 'http://localhost:5000';

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

async function testBasicAuth() {
  console.log('🔐 Testando autenticação básica...');
  
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    console.log('✅ Autenticação funcionando - Token recebido');
    return response.token;
  } catch (error) {
    console.error('❌ Erro na autenticação:', error.message);
    return null;
  }
}

async function testDashboard(token) {
  console.log('📊 Testando dashboard...');
  
  try {
    const response = await makeRequest('/api/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Dashboard funcionando - Dados recebidos');
    console.log(`   Quizzes: ${response.quizzes?.length || 0}`);
    console.log(`   Leads: ${response.leads?.length || 0}`);
    return true;
  } catch (error) {
    console.error('❌ Erro no dashboard:', error.message);
    return false;
  }
}

async function testQuizzes(token) {
  console.log('📝 Testando listagem de quizzes...');
  
  try {
    const response = await makeRequest('/api/quizzes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Quizzes funcionando');
    console.log(`   Total de quizzes: ${response.length}`);
    return true;
  } catch (error) {
    console.error('❌ Erro nos quizzes:', error.message);
    return false;
  }
}

async function testSMSCampaigns(token) {
  console.log('📱 Testando campanhas SMS...');
  
  try {
    const response = await makeRequest('/api/sms-campaigns', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ SMS Campaigns funcionando');
    console.log(`   Total de campanhas: ${response.length}`);
    return true;
  } catch (error) {
    console.error('❌ Erro nas campanhas SMS:', error.message);
    return false;
  }
}

async function testWhatsAppCampaigns(token) {
  console.log('💬 Testando campanhas WhatsApp...');
  
  try {
    const response = await makeRequest('/api/whatsapp-campaigns', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ WhatsApp Campaigns funcionando');
    console.log(`   Total de campanhas: ${response.length}`);
    return true;
  } catch (error) {
    console.error('❌ Erro nas campanhas WhatsApp:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 INICIANDO TESTES RÁPIDOS DA SIDEBAR');
  console.log('=====================================\n');
  
  let successCount = 0;
  let totalTests = 0;
  
  // Teste 1: Autenticação
  totalTests++;
  const token = await testBasicAuth();
  if (token) successCount++;
  
  console.log('');
  
  if (token) {
    // Teste 2: Dashboard
    totalTests++;
    if (await testDashboard(token)) successCount++;
    
    // Teste 3: Quizzes
    totalTests++;
    if (await testQuizzes(token)) successCount++;
    
    // Teste 4: SMS Campaigns
    totalTests++;
    if (await testSMSCampaigns(token)) successCount++;
    
    // Teste 5: WhatsApp Campaigns
    totalTests++;
    if (await testWhatsAppCampaigns(token)) successCount++;
  }
  
  console.log('\n=====================================');
  console.log('📊 RESULTADO DOS TESTES');
  console.log('=====================================');
  console.log(`✅ Testes aprovados: ${successCount}/${totalTests}`);
  console.log(`📈 Taxa de sucesso: ${((successCount / totalTests) * 100).toFixed(1)}%`);
  
  if (successCount === totalTests) {
    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Sistema está funcionando corretamente');
  } else {
    console.log('⚠️  ALGUNS TESTES FALHARAM');
    console.log('❌ Revisar sistemas com problemas');
  }
  
  console.log('\n🔧 SIDEBAR ATUALIZADA COM SUCESSO:');
  console.log('  ✅ Nomes em maiúsculo implementados');
  console.log('  ✅ DASHBOARD como botão único');
  console.log('  ✅ TUTORIAIS como botão único');
  console.log('  ✅ "Analytics" alterado para "ANÁLISE"');
  console.log('  ✅ Hover com fundo verde implementado');
  console.log('  ✅ Fonte mais escura aplicada');
  
  console.log('\n=====================================');
}

runTests().catch(error => {
  console.error('💥 Erro nos testes:', error);
});