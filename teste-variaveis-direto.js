/**
 * TESTE DIRETO DE VARIÁVEIS DINÂMICAS
 * Teste específico para verificar se SMS, Email e WhatsApp
 * estão personalizando mensagens com dados dos quizzes
 */

import fetch from 'node-fetch';

async function testarVariavelsDiretamente() {
  console.log('🎯 TESTANDO VARIÁVEIS DINÂMICAS DIRETAMENTE\n');
  
  // Login
  const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@vendzz.com', password: 'admin123' })
  });
  
  const loginData = await loginResponse.json();
  if (!loginData.token) {
    console.log('❌ Falha no login');
    return;
  }
  
  const token = loginData.token;
  console.log('✅ Login realizado');
  
  // Headers para requests autenticados
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  // Listar quizzes
  const quizzesResponse = await fetch('http://localhost:5000/api/quizzes', { headers });
  const quizzes = await quizzesResponse.json();
  
  if (!quizzes || quizzes.length === 0) {
    console.log('❌ Nenhum quiz encontrado');
    return;
  }
  
  console.log(`✅ Encontrados ${quizzes.length} quizzes`);
  
  // Pegar primeiro quiz
  const quiz = quizzes[0];
  console.log(`🎯 Usando quiz: ${quiz.title} (${quiz.id})`);
  
  // Buscar respostas do quiz
  const respostasResponse = await fetch(`http://localhost:5000/api/quiz-phones/${quiz.id}`, { headers });
  const respostas = await respostasResponse.json();
  
  if (!respostas || respostas.length === 0) {
    console.log('❌ Nenhuma resposta encontrada para este quiz');
    return;
  }
  
  console.log(`✅ Encontradas ${respostas.length} respostas`);
  console.log('📋 Primeira resposta:', {
    nome: respostas[0].name,
    telefone: respostas[0].phone,
    status: respostas[0].status
  });
  
  // 1. TESTAR SMS COM VARIÁVEIS
  console.log('\n📱 TESTANDO SMS COM VARIÁVEIS...');
  const mensagemSMS = `Olá {nome_completo}! 
Obrigado por responder nosso quiz: {quiz_titulo}
Seu email {email_contato} foi registrado.
Vamos personalizar uma oferta para seu objetivo: {objetivo_principal}`;
  
  console.log('📝 Mensagem SMS com variáveis:');
  console.log(mensagemSMS);
  
  const smsResponse = await fetch('http://localhost:5000/api/sms-campaigns', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Teste Variáveis SMS',
      quizId: quiz.id,
      message: mensagemSMS,
      triggerType: 'immediate',
      targetAudience: 'all',
      phones: [respostas[0].phone]
    })
  });
  
  const smsData = await smsResponse.json();
  if (smsResponse.ok) {
    console.log('✅ SMS campanha criada:', smsData.id);
    console.log('📊 Telefones processados:', smsData.phones?.length || 0);
  } else {
    console.log('❌ Erro SMS:', smsData.error);
  }
  
  // 2. TESTAR EMAIL COM VARIÁVEIS
  console.log('\n📧 TESTANDO EMAIL COM VARIÁVEIS...');
  const assuntoEmail = 'Olá {nome_completo}! Sobre seu quiz: {quiz_titulo}';
  const corpoEmail = `
<h2>Olá {nome_completo}!</h2>
<p>Obrigado por responder nosso quiz: <strong>{quiz_titulo}</strong></p>
<p>Suas informações:</p>
<ul>
  <li>Email: {email_contato}</li>
  <li>Telefone: {telefone_contato}</li>
  <li>Objetivo: {objetivo_principal}</li>
</ul>
<p>Preparamos uma oferta especial para você!</p>
`;
  
  console.log('📝 Assunto email com variáveis:');
  console.log(assuntoEmail);
  
  const emailResponse = await fetch('http://localhost:5000/api/email-campaigns', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Teste Variáveis Email',
      quizId: quiz.id,
      subject: assuntoEmail,
      htmlContent: corpoEmail,
      triggerType: 'immediate',
      targetAudience: 'all'
    })
  });
  
  const emailData = await emailResponse.json();
  if (emailResponse.ok) {
    console.log('✅ Email campanha criada:', emailData.id);
  } else {
    console.log('❌ Erro Email:', emailData.error);
  }
  
  // 3. TESTAR WHATSAPP COM VARIÁVEIS
  console.log('\n💬 TESTANDO WHATSAPP COM VARIÁVEIS...');
  const mensagensWhatsApp = [
    'Oi {nome_completo}! 👋',
    'Obrigado por responder nosso quiz: {quiz_titulo}',
    'Seu objetivo "{objetivo_principal}" é muito interessante!',
    'Vamos conversar sobre uma oferta personalizada para você!'
  ];
  
  console.log('📝 Mensagens WhatsApp com variáveis:');
  mensagensWhatsApp.forEach((msg, i) => console.log(`${i + 1}. ${msg}`));
  
  const whatsAppResponse = await fetch('http://localhost:5000/api/whatsapp-campaigns', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Teste Variáveis WhatsApp',
      quiz_id: quiz.id,
      messages: mensagensWhatsApp,
      target_audience: 'all',
      is_active: true
    })
  });
  
  const whatsAppData = await whatsAppResponse.json();
  if (whatsAppResponse.ok) {
    console.log('✅ WhatsApp campanha criada:', whatsAppData.id);
  } else {
    console.log('❌ Erro WhatsApp:', whatsAppData.error);
  }
  
  // 4. VERIFICAR LOGS DE PROCESSAMENTO
  console.log('\n🔍 VERIFICANDO LOGS DE PROCESSAMENTO...');
  
  // Aguardar 5 segundos para processamento
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Verificar logs SMS
  if (smsData.id) {
    const smsLogsResponse = await fetch(`http://localhost:5000/api/sms-logs/${smsData.id}`, { headers });
    const smsLogs = await smsLogsResponse.json();
    if (smsLogsResponse.ok && smsLogs.length > 0) {
      console.log('📱 SMS processado:', {
        telefone: smsLogs[0].phone,
        status: smsLogs[0].status,
        mensagem: smsLogs[0].message?.substring(0, 100) + '...'
      });
    }
  }
  
  console.log('\n✅ TESTE DE VARIÁVEIS CONCLUÍDO!');
  console.log('🎯 Verifique os logs do sistema para ver se as variáveis foram substituídas corretamente');
}

testarVariavelsDiretamente().catch(console.error);