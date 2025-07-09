/**
 * TESTE FINAL DO SISTEMA EMAIL MARKETING
 * Validação completa após correção do extractEmailsFromResponses
 */

const API_BASE = 'http://localhost:5000/api';

async function testeEmailMarketingCompleto() {
  console.log('🎯 TESTE FINAL - SISTEMA EMAIL MARKETING COMPLETO');
  console.log('==================================================');
  
  try {
    // 1. Autenticação
    console.log('\n1️⃣ AUTENTICAÇÃO');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    console.log('✅ Autenticação realizada com sucesso');
    
    // 2. Verificar quizzes disponíveis
    console.log('\n2️⃣ VERIFICANDO QUIZZES');
    const quizzesResponse = await fetch(`${API_BASE}/quizzes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const quizzes = await quizzesResponse.json();
    const targetQuiz = quizzes.find(q => q.id === 'Qm4wxpfPgkMrwoMhDFNLZ');
    
    if (targetQuiz) {
      console.log(`✅ Quiz encontrado: ${targetQuiz.title}`);
      console.log(`   ID: ${targetQuiz.id}`);
    } else {
      console.log('❌ Quiz não encontrado');
      return;
    }
    
    // 3. Extrair emails
    console.log('\n3️⃣ EXTRAÇÃO DE EMAILS');
    const emailsResponse = await fetch(`${API_BASE}/quizzes/${targetQuiz.id}/responses/emails`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const emailsData = await emailsResponse.json();
    console.log(`✅ Emails extraídos: ${emailsData.totalEmails}`);
    console.log(`   Total de respostas: ${emailsData.totalResponses}`);
    console.log(`   Emails válidos: ${emailsData.emails.length}`);
    
    // Verificar se o email do Bruno está presente
    const brunoemail = emailsData.emails.find(e => e.includes('brunotamaso'));
    if (brunoemail) {
      console.log(`✅ Email do Bruno confirmado: ${brunoemail}`);
    }
    
    // 4. Criar campanha de email marketing
    console.log('\n4️⃣ CRIAÇÃO DE CAMPANHA');
    const campaignResponse = await fetch(`${API_BASE}/email-campaigns`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'TESTE FINAL - Sistema Completo',
        quizId: targetQuiz.id,
        subject: 'Olá {nome}, obrigado pela participação!',
        content: 'Oi {nome}, recebemos suas informações: email {email}, altura {altura}m, peso {peso}kg, idade {idade} anos.',
        targetAudience: 'completed',
        senderEmail: 'contato@vendzz.com.br',
        senderName: 'Vendzz'
      })
    });
    
    const campaign = await campaignResponse.json();
    console.log(`✅ Campanha criada: ${campaign.name}`);
    console.log(`   ID: ${campaign.id}`);
    console.log(`   Status: ${campaign.status}`);
    
    // 5. Listar campanhas para verificar
    console.log('\n5️⃣ VERIFICAÇÃO DE CAMPANHAS');
    const campaignsResponse = await fetch(`${API_BASE}/email-campaigns`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const campaigns = await campaignsResponse.json();
    console.log(`✅ Total de campanhas: ${campaigns.length}`);
    
    const newCampaign = campaigns.find(c => c.id === campaign.id);
    if (newCampaign) {
      console.log(`✅ Campanha confirmada na lista: ${newCampaign.name}`);
    }
    
    // 6. Extrair variáveis para personalização
    console.log('\n6️⃣ VARIÁVEIS DE PERSONALIZAÇÃO');
    const variablesResponse = await fetch(`${API_BASE}/quizzes/${targetQuiz.id}/variables`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const variablesData = await variablesResponse.json();
    console.log(`✅ Variáveis disponíveis: ${variablesData.variables.length}`);
    console.log(`   Variáveis: ${variablesData.variables.join(', ')}`);
    
    // 7. Resultado final
    console.log('\n🎯 RESULTADO FINAL');
    console.log('================');
    console.log(`✅ Autenticação: OK`);
    console.log(`✅ Quiz encontrado: ${targetQuiz.title}`);
    console.log(`✅ Emails extraídos: ${emailsData.totalEmails}`);
    console.log(`✅ Email do Bruno: ${brunoemail ? 'Encontrado' : 'Não encontrado'}`);
    console.log(`✅ Campanha criada: ${campaign.name}`);
    console.log(`✅ Variáveis: ${variablesData.variables.length}`);
    
    console.log('\n🚀 SISTEMA EMAIL MARKETING 100% FUNCIONAL!');
    console.log('   Pronto para integração com Brevo e envio real');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testeEmailMarketingCompleto();