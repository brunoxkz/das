import fetch from 'node-fetch';

async function req(endpoint, options = {}) {
  const url = `https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev${endpoint}`;
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
}

async function testeRapido() {
  try {
    console.log('🔑 CRIANDO ARQUIVO DE TESTE ESPECÍFICO PARA 11995133932\n');

    // Login
    const loginRes = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    const { accessToken } = await loginRes.json();
    console.log('✅ Login realizado');

    // Criar dados de teste realistas para o telefone específico
    const testData = {
      quiz_id: 'test-quiz-11995133932',
      quiz_title: 'TESTE DIRETO - Telefone 11995133932',
      target_audience: 'completed',
      date_filter: null,
      total_phones: 1,
      contacts: [{
        phone: '11995133932',
        nome: 'Rafael Silva',
        email: 'rafael.silva@teste.com',
        idade: '28',
        altura: '180',
        peso: '75',
        status: 'completed',
        submissionDate: new Date().toISOString(),
        responses: {
          nome: 'Rafael Silva',
          email: 'rafael.silva@teste.com',
          telefone_principal: '11995133932',
          idade: '28',
          altura: '180',
          peso_atual: '75',
          peso_desejado: '70',
          objetivo: 'Perder 5kg em 3 meses'
        }
      }]
    };

    // Criar arquivo de automação
    const createRes = await req('/api/whatsapp-automation-files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(testData)
    });

    if (!createRes.ok) {
      const error = await createRes.text();
      throw new Error(`Erro ao criar arquivo: ${error}`);
    }

    const fileData = await createRes.json();
    console.log(`✅ Arquivo criado: ${fileData.id}`);
    console.log(`📋 Título: ${testData.quiz_title}`);
    console.log(`📱 Telefone: ${testData.contacts[0].phone}`);
    console.log(`👤 Nome: ${testData.contacts[0].nome}`);

    // Verificar se o arquivo foi criado corretamente
    const checkRes = await req(`/api/whatsapp-automation-files/${fileData.id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const checkData = await checkRes.json();
    console.log('\n📄 DADOS DO ARQUIVO CRIADO:');
    console.log(`ID: ${checkData.id}`);
    console.log(`Contatos: ${checkData.contacts.length}`);
    
    if (checkData.contacts.length > 0) {
      const contact = checkData.contacts[0];
      console.log('\n📱 DADOS DO CONTATO:');
      console.log(`Telefone: ${contact.phone}`);
      console.log(`Nome: ${contact.nome}`);
      console.log(`Email: ${contact.email}`);
      console.log(`Idade: ${contact.idade}`);
      console.log(`Altura: ${contact.altura}`);
      console.log(`Peso: ${contact.peso}`);
      console.log(`Status: ${contact.status}`);
    }

    console.log('\n🎯 MENSAGENS PERSONALIZADAS DE TESTE:');
    console.log('\n📝 Para Quiz Completos:');
    console.log(`Olá ${testData.contacts[0].nome}! 🎉 Parabéns por completar nosso quiz!`);
    console.log(`Com ${testData.contacts[0].idade} anos, altura de ${testData.contacts[0].altura}cm e peso atual de ${testData.contacts[0].peso}kg,`);
    console.log(`temos o plano perfeito para você atingir seus objetivos! 💪`);

    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('1. Abra WhatsApp Web');
    console.log('2. A sidebar aparece automaticamente');
    console.log('3. Clique "🔄 Conectar"');
    console.log(`4. Selecione o arquivo: "${testData.quiz_title}"`);
    console.log('5. Configure a mensagem personalizada');
    console.log('6. Clique "🚀 Iniciar Automação"');

    console.log('\n⚠️ IMPORTANTE:');
    console.log('• Este arquivo contém apenas 1 contato: 11995133932');
    console.log('• Os dados são realistas para teste completo');
    console.log('• A mensagem será personalizada com nome, idade, altura e peso');
    console.log('• O telefone será formatado automaticamente para +5511995133932');

    console.log('\n✅ ARQUIVO DE TESTE PRONTO PARA USO!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testeRapido();