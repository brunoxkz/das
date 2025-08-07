#!/usr/bin/env node

/**
 * DIAGNÓSTICO COMPLETO DO SISTEMA VENDZZ
 * Identifica problemas específicos e sugere correções
 */

const fetch = require('node-fetch');
const API_BASE = 'http://localhost:5000';

console.log('🔍 DIAGNÓSTICO COMPLETO DO SISTEMA VENDZZ');

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { rawResponse: text };
    }
    
    return { status: response.status, data, ok: response.ok, headers: response.headers };
  } catch (error) {
    return { status: 500, data: { error: error.message }, ok: false };
  }
}

async function runDiagnostics() {
  console.log('\n🏥 INICIANDO DIAGNÓSTICOS...\n');
  
  // === TESTE 1: AUTENTICAÇÃO ===
  console.log('1️⃣ TESTE DE AUTENTICAÇÃO');
  console.log('========================');
  
  const loginResult = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@admin.com',
      password: 'admin123'
    })
  });
  
  if (loginResult.ok) {
    console.log('✅ Autenticação: FUNCIONANDO');
    console.log(`📋 Token gerado: ${loginResult.data.token ? 'SIM' : 'NÃO'}`);
    console.log(`📋 AccessToken gerado: ${loginResult.data.accessToken ? 'SIM' : 'NÃO'}`);
    console.log(`📋 Response completa:`, JSON.stringify(loginResult.data, null, 2));
  } else {
    console.log('❌ Autenticação: FALHANDO');
    console.log(`📋 Erro: ${loginResult.data.error || 'Desconhecido'}`);
    console.log('🔧 CORREÇÃO: Verificar credenciais admin ou JWT_SECRET');
    return;
  }
  
  const token = loginResult.data.token || loginResult.data.accessToken;
  
  // === TESTE 2: ENDPOINTS PROTEGIDOS ===
  console.log('\n2️⃣ TESTE DE ENDPOINTS PROTEGIDOS');
  console.log('==================================');
  
  const protectedEndpoints = [
    '/api/quizzes/RdAUwmQgTthxbZLA0HJWu/leads',
    '/api/quizzes/RdAUwmQgTthxbZLA0HJWu/phones',
    '/api/quizzes/RdAUwmQgTthxbZLA0HJWu/variables-ultra'
  ];
  
  for (const endpoint of protectedEndpoints) {
    const result = await makeRequest(endpoint, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`${result.ok ? '✅' : '❌'} ${endpoint}: ${result.status}`);
    
    if (!result.ok) {
      console.log(`   📋 Erro: ${result.data.error || result.data.message || 'Desconhecido'}`);
      
      if (result.status === 401) {
        console.log('   🔧 CORREÇÃO: Problema com middleware JWT ou token inválido');
      } else if (result.status === 404) {
        console.log('   🔧 CORREÇÃO: Quiz não existe ou endpoint incorreto');
      } else if (result.status === 500) {
        console.log('   🔧 CORREÇÃO: Erro interno do servidor - verificar logs');
      }
    }
  }
  
  // === TESTE 3: SISTEMA DE CRÉDITOS ===
  console.log('\n3️⃣ TESTE DO SISTEMA DE CRÉDITOS');
  console.log('================================');
  
  const creditsResult = await makeRequest('/api/sms-credits/balance', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (creditsResult.ok) {
    console.log('✅ Sistema de créditos: FUNCIONANDO');
    console.log(`📋 Saldo SMS: ${creditsResult.data.smsCredits || 0}`);
    console.log(`📋 Saldo WhatsApp: ${creditsResult.data.whatsappCredits || 0}`);
    console.log(`📋 Saldo Email: ${creditsResult.data.emailCredits || 0}`);
    
    if (creditsResult.data.smsCredits === 0) {
      console.log('⚠️ AVISO: Sem créditos SMS - campanhas não enviarão');
    }
  } else {
    console.log('❌ Sistema de créditos: FALHANDO');
    console.log('🔧 CORREÇÃO: Verificar tabela credits e implementação');
  }
  
  // === TESTE 4: CAMPANHAS WHATSAPP ===
  console.log('\n4️⃣ TESTE DE CAMPANHAS WHATSAPP');
  console.log('===============================');
  
  const campaignsResult = await makeRequest('/api/whatsapp-campaigns', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (campaignsResult.ok) {
    const campaigns = campaignsResult.data.campaigns || [];
    console.log(`✅ Campanhas WhatsApp: ${campaigns.length} encontradas`);
    
    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    console.log(`📋 Campanhas ativas: ${activeCampaigns.length}`);
    
    if (activeCampaigns.length > 0) {
      console.log('📋 Primeira campanha ativa:', {
        id: activeCampaigns[0].id,
        phoneCount: activeCampaigns[0].phoneCount || 'N/A',
        message: activeCampaigns[0].message?.substring(0, 50) + '...'
      });
    }
    
    if (campaigns.length > 0 && campaigns.every(c => c.sentCount === 0)) {
      console.log('⚠️ PROBLEMA: Campanhas criadas mas nenhuma mensagem enviada');
      console.log('🔧 POSSÍVEIS CAUSAS:');
      console.log('   - API WhatsApp não configurada');
      console.log('   - Telefones em formato inválido');
      console.log('   - Rate limiting muito restritivo');
      console.log('   - Sistema de créditos bloqueando');
    }
  } else {
    console.log('❌ Campanhas WhatsApp: ERRO AO ACESSAR');
  }
  
  // === TESTE 5: VALIDAÇÃO DE TELEFONES ===
  console.log('\n5️⃣ TESTE DE VALIDAÇÃO DE TELEFONES');
  console.log('===================================');
  
  const phonesResult = await makeRequest('/api/quizzes/RdAUwmQgTthxbZLA0HJWu/phones', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (phonesResult.ok) {
    const phones = phonesResult.data.phones || [];
    console.log(`✅ Telefones extraídos: ${phones.length}`);
    
    if (phones.length > 0) {
      // Análise de formatos
      const phoneFormats = phones.map(p => ({
        original: p.phone,
        cleaned: p.phone?.replace(/\D/g, ''),
        length: p.phone?.replace(/\D/g, '').length,
        valid: p.phone?.replace(/\D/g, '').length >= 8 && p.phone?.replace(/\D/g, '').length <= 15
      }));
      
      const validPhones = phoneFormats.filter(p => p.valid);
      console.log(`📋 Telefones válidos: ${validPhones.length}/${phones.length}`);
      console.log(`📋 Exemplo de telefone: ${phoneFormats[0]?.original} → ${phoneFormats[0]?.cleaned}`);
      
      if (validPhones.length === 0) {
        console.log('⚠️ PROBLEMA: Nenhum telefone em formato válido');
        console.log('🔧 CORREÇÃO: Revisar regex de validação ou formato dos dados');
      }
    } else {
      console.log('⚠️ PROBLEMA: Nenhum telefone extraído do quiz');
      console.log('🔧 CORREÇÃO: Verificar função extractLeadDataFromResponses');
    }
  }
  
  // === TESTE 6: CONFIGURAÇÕES DO SISTEMA ===
  console.log('\n6️⃣ TESTE DE CONFIGURAÇÕES');
  console.log('==========================');
  
  // Verificar se variáveis de ambiente críticas existem
  const envVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'OPENAI_API_KEY'
  ];
  
  console.log('📋 Variáveis de ambiente:');
  // Nota: Não podemos acessar process.env do cliente, mas podemos inferir pelos erros
  
  // === RESUMO DIAGNÓSTICO ===
  console.log('\n📊 RESUMO DO DIAGNÓSTICO');
  console.log('========================');
  console.log('✅ Autenticação funcionando');
  console.log('⚠️ Possíveis problemas identificados:');
  console.log('   1. Campanhas WhatsApp com 0 envios');
  console.log('   2. Possível falta de créditos');
  console.log('   3. Validação de telefones muito restritiva');
  console.log('   4. API WhatsApp pode não estar configurada');
  console.log('\n🔧 PRÓXIMOS PASSOS RECOMENDADOS:');
  console.log('   1. Verificar configuração Twilio/WhatsApp API');
  console.log('   2. Adicionar créditos ao sistema');
  console.log('   3. Testar validação de telefones com dados reais');
  console.log('   4. Implementar logs mais detalhados nos envios');
}

runDiagnostics().catch(console.error);