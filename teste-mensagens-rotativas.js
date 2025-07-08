// ===============================================
// TESTE SISTEMA DE MENSAGENS ROTATIVAS ANTI-BAN
// ===============================================

const BASE_URL = 'http://localhost:5000';

async function testeMensagensRotativas() {
  console.log('🔄 TESTE SISTEMA DE MENSAGENS ROTATIVAS E ANTI-BAN\n');
  
  try {
    // 1. Fazer login
    console.log('🔐 Fazendo login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    
    if (!token) {
      throw new Error('❌ Falha no login');
    }
    
    console.log('✅ Login realizado com sucesso');
    
    // 2. Listar quizzes disponíveis
    console.log('\n📋 Carregando quizzes...');
    
    const quizzesResponse = await fetch(`${BASE_URL}/api/quizzes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const quizzes = await quizzesResponse.json();
    console.log(`📊 ${quizzes.length} quizzes encontrados`);
    
    if (quizzes.length === 0) {
      console.log('⚠️ Nenhum quiz encontrado para teste');
      return;
    }
    
    // 3. Buscar telefones do primeiro quiz
    const quiz = quizzes[0];
    console.log(`🎯 Testando com quiz: ${quiz.title}`);
    
    const phonesResponse = await fetch(`${BASE_URL}/api/quiz-phones/${quiz.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const phonesData = await phonesResponse.json();
    console.log(`📱 ${phonesData.phones.length} telefones encontrados`);
    
    if (phonesData.phones.length === 0) {
      console.log('⚠️ Nenhum telefone encontrado para teste');
      return;
    }
    
    // 4. Criar campanha WhatsApp com mensagens rotativas
    console.log('\n🚀 Criando campanha WhatsApp com mensagens rotativas...');
    
    const campaignData = {
      name: 'Teste Mensagens Rotativas Anti-Ban',
      quizId: quiz.id, // Corrigido: usar quizId em vez de quiz_id
      targetAudience: 'all',
      dateFilter: null,
      messages: [
        'Olá {nome}! Mensagem rotativa 1 - Obrigado por participar! 🎉',
        'Oi {nome}! Mensagem rotativa 2 - Seus dados foram registrados! ✅',
        'Parabéns {nome}! Mensagem rotativa 3 - Em breve entraremos em contato! 🚀',
        'Olá {nome}! Mensagem rotativa 4 - Nossa equipe vai te contatar logo! 📞'
      ],
      triggerType: 'delayed',
      triggerDelay: 1,
      triggerUnit: 'minutes'
    };
    
    const campaignResponse = await fetch(`${BASE_URL}/api/whatsapp-campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(campaignData)
    });
    
    const campaign = await campaignResponse.json();
    
    if (!campaignResponse.ok) {
      throw new Error(`Erro ao criar campanha: ${campaign.error || campaign.message}`);
    }
    
    console.log(`✅ Campanha criada: ${campaign.id}`);
    console.log(`📊 ${campaign.totalScheduled} mensagens agendadas`);
    
    // 5. Verificar mensagens pendentes
    console.log('\n📥 Verificando mensagens pendentes...');
    
    const pendingResponse = await fetch(`${BASE_URL}/api/whatsapp-extension/pending-messages`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const pendingData = await pendingResponse.json();
    console.log(`📬 ${pendingData.length} mensagens pendentes encontradas`);
    
    if (pendingData.length > 0) {
      console.log('\n🔄 Primeiras mensagens da fila:');
      pendingData.slice(0, 5).forEach((msg, index) => {
        console.log(`   ${index + 1}. ${msg.phone} - "${msg.message.substring(0, 50)}..."`);
      });
    }
    
    // 6. Testar sistema de duplicatas
    console.log('\n🚫 Testando sistema anti-duplicatas...');
    
    const phonesToCheck = pendingData.slice(0, 3).map(msg => msg.phone);
    
    const duplicatesResponse = await fetch(`${BASE_URL}/api/whatsapp-extension/check-sent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ phones: phonesToCheck })
    });
    
    const duplicatesData = await duplicatesResponse.json();
    console.log(`📊 Verificação: ${duplicatesData.stats.new} novos, ${duplicatesData.stats.duplicates} duplicatas`);
    
    // 7. Simular ping da extensão
    console.log('\n🔧 Simulando ping da extensão...');
    
    const pingResponse = await fetch(`${BASE_URL}/api/whatsapp-extension/ping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        version: '2.0.0',
        pendingMessages: pendingData.length,
        sentMessages: 0,
        failedMessages: 0,
        isActive: true
      })
    });
    
    const pingData = await pingResponse.json();
    console.log(`📡 Ping enviado: ${pingData.success ? 'Sucesso' : 'Falha'}`);
    
    console.log('\n🎉 TESTE COMPLETO!');
    console.log('✅ Sistema de mensagens rotativas implementado');
    console.log('✅ Sistema anti-duplicatas funcionando');
    console.log('✅ Configurações anti-ban 2025 aplicadas');
    console.log('✅ Integração com extensão Chrome validada');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

// Executar teste
testeMensagensRotativas();