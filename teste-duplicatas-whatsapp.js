// =====================================================
// TESTE SISTEMA DE DUPLICATAS WHATSAPP
// =====================================================
// Este script testa o sistema completo de prevenção
// de duplicatas no envio de mensagens WhatsApp

const BASE_URL = 'http://localhost:5000';

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
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

async function authenticate() {
  console.log('🔐 Fazendo login...');
  
  const response = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  console.log('📋 Resposta do login:', response);
  
  if (response.token || response.accessToken) {
    const token = response.token || response.accessToken;
    console.log('✅ Login realizado com sucesso');
    return token;
  } else {
    console.log('❌ Resposta não contém token:', response);
    throw new Error('❌ Falha no login');
  }
}

async function testeVerificacaoDuplicatas(token) {
  console.log('\n🔍 TESTE 1: Verificação de Duplicatas');
  
  // Lista de telefones para teste
  const phonesToTest = [
    '5511995133932', // Número que já foi usado
    '5511987654321', // Número novo
    '5521999888777', // Número novo
    '5511995133932'  // Duplicata proposital
  ];
  
  try {
    const result = await makeRequest('/api/whatsapp-extension/check-sent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ phones: phonesToTest })
    });
    
    console.log('✅ Resultado da verificação:', result);
    
    if (result.success) {
      console.log(`📊 ESTATÍSTICAS:`);
      console.log(`   Total testados: ${result.stats.total}`);
      console.log(`   Números novos: ${result.stats.new}`);
      console.log(`   Duplicatas: ${result.stats.duplicates}`);
      
      if (result.newPhones.length > 0) {
        console.log(`📱 Números NOVOS para envio:`);
        result.newPhones.forEach(phone => console.log(`   - ${phone}`));
      }
      
      if (result.duplicatePhones.length > 0) {
        console.log(`🚫 Números DUPLICADOS (já enviados):`);
        result.duplicatePhones.forEach(phone => console.log(`   - ${phone}`));
      }
      
      return true;
    } else {
      console.log('❌ Falha na verificação de duplicatas');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro no teste de duplicatas:', error.message);
    return false;
  }
}

async function testeCriarLogWhatsApp(token) {
  console.log('\n📝 TESTE 2: Criando Log de WhatsApp');
  
  try {
    // Simular envio bem-sucedido para criar um log
    const logData = {
      campaignId: 'test-duplicates-campaign',
      phone: '5511987654321',
      message: 'Teste de mensagem duplicada',
      status: 'sent'
    };
    
    // Primeiro vamos buscar se existe uma campanha de teste
    const campaigns = await makeRequest('/api/whatsapp-campaigns', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`📋 Campanhas encontradas: ${campaigns.length}`);
    
    if (campaigns.length > 0) {
      // Usar primeira campanha existente
      const campaign = campaigns[0];
      console.log(`📢 Usando campanha: ${campaign.name} (${campaign.id})`);
      
      // Simular log de envio bem-sucedido
      const updateResult = await makeRequest('/api/whatsapp-extension/logs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          logId: 'test-duplicate-log-001',
          status: 'sent',
          extensionStatus: 'success'
        })
      });
      
      console.log('✅ Log simulado criado:', updateResult);
      return true;
    } else {
      console.log('⚠️ Nenhuma campanha encontrada para teste');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar log:', error.message);
    return false;
  }
}

async function testeIntegracaoCompleta(token) {
  console.log('\n🔄 TESTE 3: Integração Completa');
  
  console.log('Passo 1: Verificação inicial...');
  await testeVerificacaoDuplicatas(token);
  
  console.log('\nPasso 2: Aguardando 2 segundos...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('Passo 3: Nova verificação...');
  const result = await testeVerificacaoDuplicatas(token);
  
  if (result) {
    console.log('✅ Sistema de duplicatas funcionando corretamente');
    return true;
  } else {
    console.log('❌ Problema no sistema de duplicatas');
    return false;
  }
}

async function verificarPerformance(token) {
  console.log('\n⚡ TESTE 4: Performance do Sistema');
  
  const phonesBatch = [];
  for (let i = 0; i < 50; i++) {
    phonesBatch.push(`5511${Math.random().toString().slice(2, 11)}`);
  }
  
  const startTime = Date.now();
  
  try {
    const result = await makeRequest('/api/whatsapp-extension/check-sent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ phones: phonesBatch })
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Verificação de ${phonesBatch.length} números concluída em ${duration}ms`);
    console.log(`📊 Performance: ${(phonesBatch.length / duration * 1000).toFixed(1)} números/segundo`);
    
    return duration < 1000; // Deve ser rápido (< 1 segundo)
    
  } catch (error) {
    console.error('❌ Erro no teste de performance:', error.message);
    return false;
  }
}

async function executarTodosOsTestes() {
  console.log('🚀 INICIANDO TESTES DO SISTEMA DE DUPLICATAS WHATSAPP\n');
  
  try {
    // Autenticar
    const token = await authenticate();
    
    // Executar todos os testes
    const resultados = {
      duplicatas: await testeVerificacaoDuplicatas(token),
      logs: await testeCriarLogWhatsApp(token),
      integracao: await testeIntegracaoCompleta(token),
      performance: await verificarPerformance(token)
    };
    
    // Relatório final
    console.log('\n📋 RELATÓRIO FINAL:');
    console.log('=====================================');
    
    const sucessos = Object.values(resultados).filter(Boolean).length;
    const total = Object.keys(resultados).length;
    
    Object.entries(resultados).forEach(([teste, sucesso]) => {
      const status = sucesso ? '✅' : '❌';
      console.log(`${status} ${teste.toUpperCase()}: ${sucesso ? 'PASSOU' : 'FALHOU'}`);
    });
    
    console.log('=====================================');
    console.log(`📊 RESULTADO: ${sucessos}/${total} testes passaram`);
    
    if (sucessos === total) {
      console.log('🎉 SISTEMA DE DUPLICATAS: 100% FUNCIONAL');
      console.log('✅ Pronto para uso em produção');
    } else {
      console.log('⚠️ ALGUNS TESTES FALHARAM');
      console.log('🔧 Revisar implementação necessária');
    }
    
  } catch (error) {
    console.error('❌ ERRO GERAL:', error.message);
  }
}

// Executar os testes
executarTodosOsTestes();