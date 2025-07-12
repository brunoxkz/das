/**
 * TESTE COMPLETO DE VARIÁVEIS DINÂMICAS
 * Testa personalização de mensagens SMS, Email e WhatsApp
 * com dados reais dos quizzes
 */

const BASE_URL = 'http://localhost:5000';
let authToken = null;

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  // Merge headers properly
  if (options.headers) {
    finalOptions.headers = { ...finalOptions.headers, ...options.headers };
  }
  
  if (finalOptions.body && typeof finalOptions.body === 'object') {
    finalOptions.body = JSON.stringify(finalOptions.body);
  }

  console.log(`🔥 ${finalOptions.method} ${url}`);
  
  try {
    const response = await fetch(url, finalOptions);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return { status: 500, data: { error: error.message } };
  }
}

async function authenticate() {
  console.log('🔐 Fazendo login...');
  const result = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@vendzz.com', password: 'admin123' }
  });
  
  if (result.status === 200) {
    authToken = result.data.token;
    console.log('✅ Login realizado com sucesso');
    return true;
  } else {
    console.error('❌ Erro no login:', result.data);
    return false;
  }
}

async function listarQuizzes() {
  console.log('\n📋 Listando quizzes disponíveis...');
  const result = await makeRequest('/api/quizzes');
  
  if (result.status === 200) {
    console.log(`✅ Encontrados ${result.data.length} quizzes`);
    return result.data;
  } else {
    console.error('❌ Erro ao listar quizzes:', result.data);
    return [];
  }
}

async function buscarRespostasQuiz(quizId) {
  console.log(`\n📊 Buscando respostas do quiz ${quizId}...`);
  const result = await makeRequest(`/api/quiz-phones/${quizId}`);
  
  if (result.status === 200) {
    console.log(`✅ Encontradas ${result.data.length} respostas`);
    if (result.data.length > 0) {
      console.log('📋 Primeira resposta (exemplo):');
      console.log('   Nome:', result.data[0].name);
      console.log('   Telefone:', result.data[0].phone);
      console.log('   Status:', result.data[0].status);
      console.log('   Respostas:', result.data[0].responses?.slice(0, 3));
    }
    return result.data;
  } else {
    console.error('❌ Erro ao buscar respostas:', result.data);
    return [];
  }
}

async function testarSMSComVariaveis(quizId, respostas) {
  console.log('\n📱 TESTANDO SMS COM VARIÁVEIS DINÂMICAS...');
  
  if (!respostas || respostas.length === 0) {
    console.log('❌ Sem respostas disponíveis para testar');
    return;
  }

  const mensagemComVariaveis = `Olá {nome_completo}! 
Obrigado por responder nosso quiz sobre {objetivo_principal}.
Seu email {email_contato} foi registrado com sucesso.
Telefone confirmado: {telefone_contato}
Quiz: {quiz_titulo}

Personalizamos uma oferta especial para você!`;

  console.log('📝 Mensagem com variáveis:');
  console.log(mensagemComVariaveis);

  const result = await makeRequest('/api/sms-campaigns', {
    method: 'POST',
    body: {
      name: 'Teste Variáveis SMS',
      quizId: quizId,
      message: mensagemComVariaveis,
      triggerType: 'delayed',
      triggerDelay: 1,
      triggerUnit: 'minutes',
      targetAudience: 'all',
      phones: [respostas[0].phone]
    }
  });

  if (result.status === 200) {
    console.log('✅ Campanha SMS criada com sucesso!');
    console.log('📊 ID da campanha:', result.data.id);
    console.log('📊 Telefones processados:', result.data.phones?.length || 0);
    
    // Mostrar dados extraídos
    if (result.data.phones && result.data.phones.length > 0) {
      const primeiro = result.data.phones[0];
      console.log('📋 Dados extraídos para personalização:');
      console.log('   Nome:', primeiro.name);
      console.log('   Telefone:', primeiro.phone);
      console.log('   Respostas disponíveis:', primeiro.responses?.length || 0);
    }
    
    return result.data.id;
  } else {
    console.error('❌ Erro ao criar campanha SMS:', result.data);
    return null;
  }
}

async function testarEmailComVariaveis(quizId, respostas) {
  console.log('\n📧 TESTANDO EMAIL COM VARIÁVEIS DINÂMICAS...');
  
  if (!respostas || respostas.length === 0) {
    console.log('❌ Sem respostas disponíveis para testar');
    return;
  }

  const assuntoComVariaveis = 'Olá {nome_completo}! Sua resposta sobre {objetivo_principal}';
  const corpoComVariaveis = `
<h2>Olá {nome_completo}!</h2>

<p>Obrigado por responder nosso quiz <strong>{quiz_titulo}</strong>.</p>

<p>Suas respostas foram registradas:</p>
<ul>
  <li>Objetivo: {objetivo_principal}</li>
  <li>Email: {email_contato}</li>
  <li>Telefone: {telefone_contato}</li>
</ul>

<p>Preparamos uma oferta personalizada especialmente para você!</p>

<p>Atenciosamente,<br>
Equipe Vendzz</p>
`;

  console.log('📝 Assunto com variáveis:');
  console.log(assuntoComVariaveis);
  console.log('📝 Corpo com variáveis (HTML):');
  console.log(corpoComVariaveis);

  const result = await makeRequest('/api/email-campaigns', {
    method: 'POST',
    body: {
      name: 'Teste Variáveis Email',
      quizId: quizId,
      subject: assuntoComVariaveis,
      htmlContent: corpoComVariaveis,
      triggerType: 'delayed',
      triggerDelay: 2,
      triggerUnit: 'minutes',
      targetAudience: 'all'
    }
  });

  if (result.status === 200) {
    console.log('✅ Campanha Email criada com sucesso!');
    console.log('📊 ID da campanha:', result.data.id);
    return result.data.id;
  } else {
    console.error('❌ Erro ao criar campanha Email:', result.data);
    return null;
  }
}

async function testarWhatsAppComVariaveis(quizId, respostas) {
  console.log('\n💬 TESTANDO WHATSAPP COM VARIÁVEIS DINÂMICAS...');
  
  if (!respostas || respostas.length === 0) {
    console.log('❌ Sem respostas disponíveis para testar');
    return;
  }

  const mensagens = [
    `Oi {nome_completo}! 👋
Obrigado por responder nosso quiz sobre {objetivo_principal}.`,
    
    `Seus dados foram registrados:
📧 Email: {email_contato}
📱 Telefone: {telefone_contato}
🎯 Quiz: {quiz_titulo}`,
    
    `Preparamos uma oferta especial para seu objetivo: {objetivo_principal}! 🎉
Quer saber mais?`
  ];

  console.log('📝 Mensagens com variáveis:');
  mensagens.forEach((msg, i) => {
    console.log(`${i + 1}. ${msg}`);
  });

  const result = await makeRequest('/api/whatsapp-campaigns', {
    method: 'POST',
    body: {
      name: 'Teste Variáveis WhatsApp',
      quiz_id: quizId,
      messages: mensagens,
      target_audience: 'all',
      is_active: true
    }
  });

  if (result.status === 200) {
    console.log('✅ Campanha WhatsApp criada com sucesso!');
    console.log('📊 ID da campanha:', result.data.id);
    return result.data.id;
  } else {
    console.error('❌ Erro ao criar campanha WhatsApp:', result.data);
    return null;
  }
}

async function verificarLogsPersonalizados(campanhaId, tipo) {
  console.log(`\n🔍 Verificando logs personalizados - ${tipo.toUpperCase()}...`);
  
  let endpoint;
  switch(tipo) {
    case 'sms':
      endpoint = `/api/sms-logs/${campanhaId}`;
      break;
    case 'email':
      endpoint = `/api/email-logs/${campanhaId}`;
      break;
    case 'whatsapp':
      endpoint = `/api/whatsapp-logs/${campanhaId}`;
      break;
    default:
      console.log('❌ Tipo de campanha inválido');
      return;
  }

  const result = await makeRequest(endpoint);
  
  if (result.status === 200) {
    console.log(`✅ Logs ${tipo.toUpperCase()} encontrados:`, result.data.length);
    
    if (result.data.length > 0) {
      const log = result.data[0];
      console.log('📋 Primeiro log:');
      console.log('   Status:', log.status);
      console.log('   Telefone:', log.phone);
      console.log('   Mensagem processada:', log.message?.substring(0, 100) + '...');
    }
  } else {
    console.log(`❌ Erro ao buscar logs ${tipo.toUpperCase()}:`, result.data);
  }
}

async function executarTestesCompletos() {
  console.log('🚀 INICIANDO TESTES COMPLETOS DE VARIÁVEIS DINÂMICAS\n');
  
  // 1. Autenticação
  if (!await authenticate()) {
    console.log('❌ Falha na autenticação, abortando testes');
    return;
  }

  // 2. Listar quizzes
  const quizzes = await listarQuizzes();
  if (quizzes.length === 0) {
    console.log('❌ Nenhum quiz encontrado, abortando testes');
    return;
  }

  // 3. Pegar primeiro quiz com respostas
  let quizComRespostas = null;
  let respostas = [];
  
  for (const quiz of quizzes.slice(0, 5)) {
    const quizRespostas = await buscarRespostasQuiz(quiz.id);
    if (quizRespostas.length > 0) {
      quizComRespostas = quiz;
      respostas = quizRespostas;
      break;
    }
  }

  if (!quizComRespostas) {
    console.log('❌ Nenhum quiz com respostas encontrado, abortando testes');
    return;
  }

  console.log(`\n🎯 Usando quiz: ${quizComRespostas.title} (${quizComRespostas.id})`);
  console.log(`📊 Respostas disponíveis: ${respostas.length}`);

  // 4. Testar SMS com variáveis
  const smsId = await testarSMSComVariaveis(quizComRespostas.id, respostas);
  
  // 5. Testar Email com variáveis
  const emailId = await testarEmailComVariaveis(quizComRespostas.id, respostas);
  
  // 6. Testar WhatsApp com variáveis
  const whatsappId = await testarWhatsAppComVariaveis(quizComRespostas.id, respostas);

  // 7. Aguardar processamento
  console.log('\n⏳ Aguardando processamento das campanhas (30 segundos)...');
  await new Promise(resolve => setTimeout(resolve, 30000));

  // 8. Verificar logs
  if (smsId) await verificarLogsPersonalizados(smsId, 'sms');
  if (emailId) await verificarLogsPersonalizados(emailId, 'email');
  if (whatsappId) await verificarLogsPersonalizados(whatsappId, 'whatsapp');

  // 9. Resumo final
  console.log('\n📋 RESUMO DOS TESTES:');
  console.log('✅ SMS com variáveis:', smsId ? 'CRIADO' : 'FALHOU');
  console.log('✅ Email com variáveis:', emailId ? 'CRIADO' : 'FALHOU');
  console.log('✅ WhatsApp com variáveis:', whatsappId ? 'CRIADO' : 'FALHOU');
  console.log('\n🎯 Teste de personalização de mensagens CONCLUÍDO!');
}

// Executar testes
executarTestesCompletos().catch(console.error);