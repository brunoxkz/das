/**
 * SCRIPT PARA CORRIGIR CAMPANHAS COM CREATEDAT = 0
 * Identifica e corrige campanhas de email com timestamp zerado
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

let authToken = null;

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    },
    ...options
  };

  const response = await fetch(url, config);
  const text = await response.text();
  
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }

  return { response, data };
}

async function authenticate() {
  const { response, data } = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });

  if (response.ok && (data.token || data.accessToken)) {
    authToken = data.token || data.accessToken;
    console.log('✅ Login realizado com sucesso');
    return true;
  } else {
    console.log('❌ Falha no login:', data);
    return false;
  }
}

async function identificarCampanhasComProblema() {
  console.log('\n🔍 IDENTIFICANDO CAMPANHAS COM CREATEDAT = 0');
  console.log('══════════════════════════════════════════════════════════');

  const { response, data } = await makeRequest('/email-campaigns');
  
  if (!response.ok || !Array.isArray(data)) {
    console.log('❌ Erro ao buscar campanhas:', data);
    return [];
  }

  const campanhasComProblema = data.filter(campaign => campaign.createdAt === 0 || campaign.createdAt === null);
  
  console.log(`📊 Total de campanhas: ${data.length}`);
  console.log(`⚠️  Campanhas com problema: ${campanhasComProblema.length}`);
  
  if (campanhasComProblema.length > 0) {
    console.log('\n🔍 Campanhas identificadas com createdAt = 0:');
    campanhasComProblema.forEach((campaign, index) => {
      console.log(`  ${index + 1}. ${campaign.name} (ID: ${campaign.id})`);
      console.log(`     Status: ${campaign.status} | CreatedAt: ${campaign.createdAt}`);
    });
  }

  return campanhasComProblema;
}

async function corrigirCampanhas(campanhas) {
  console.log('\n🔧 CORRIGINDO CAMPANHAS COM TIMESTAMP');
  console.log('══════════════════════════════════════════════════════════');

  const now = Math.floor(Date.now() / 1000);
  let corrigidas = 0;

  for (const campaign of campanhas) {
    try {
      const { response, data } = await makeRequest(`/email-campaigns/${campaign.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          createdAt: now,
          updatedAt: now
        })
      });

      if (response.ok) {
        console.log(`✅ Campanha corrigida: ${campaign.name}`);
        corrigidas++;
      } else {
        console.log(`❌ Erro ao corrigir ${campaign.name}:`, data);
      }
    } catch (error) {
      console.log(`❌ Erro ao corrigir ${campaign.name}:`, error.message);
    }
  }

  console.log(`\n📈 Resultado: ${corrigidas}/${campanhas.length} campanhas corrigidas`);
  return corrigidas;
}

async function validarCorrecao() {
  console.log('\n✅ VALIDANDO CORREÇÃO');
  console.log('══════════════════════════════════════════════════════════');

  const campanhasComProblema = await identificarCampanhasComProblema();
  
  if (campanhasComProblema.length === 0) {
    console.log('🎉 Todas as campanhas foram corrigidas com sucesso!');
    return true;
  } else {
    console.log(`⚠️  Ainda restam ${campanhasComProblema.length} campanhas com problema`);
    return false;
  }
}

async function executarCorrecao() {
  console.log('🔧 INICIANDO CORREÇÃO DE CAMPANHAS EMAIL');
  console.log('════════════════════════════════════════════════════════════');

  // Autenticar
  const authenticated = await authenticate();
  if (!authenticated) {
    console.log('❌ Falha na autenticação. Abortando...');
    return;
  }

  // Identificar campanhas com problema
  const campanhasComProblema = await identificarCampanhasComProblema();
  
  if (campanhasComProblema.length === 0) {
    console.log('🎉 Nenhuma campanha com createdAt = 0 encontrada!');
    return;
  }

  // Corrigir campanhas
  const corrigidas = await corrigirCampanhas(campanhasComProblema);
  
  if (corrigidas > 0) {
    // Validar correção
    await validarCorrecao();
  }

  console.log('\n🎯 CORREÇÃO FINALIZADA');
  console.log('════════════════════════════════════════════════════════════');
}

// Executar o script
executarCorrecao().catch(console.error);