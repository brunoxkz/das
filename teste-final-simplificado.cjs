#!/usr/bin/env node

/**
 * TESTE FINAL SIMPLIFICADO - VALIDAÇÃO DOS AJUSTES QUANTUM
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000';

console.log('🎯 TESTE FINAL SIMPLIFICADO: Validação Quantum');

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
    
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { status: 500, data: { error: error.message }, ok: false };
  }
}

async function runTest() {
  console.log('\n🔐 AUTENTICAÇÃO');
  
  // Login
  const loginResult = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@admin.com',
      password: 'admin123'
    })
  });
  
  if (!loginResult.ok) {
    console.log('❌ Falha na autenticação:', loginResult.data);
    return false;
  }
  
  const token = loginResult.data.token;
  console.log('✅ Autenticação bem-sucedida');
  
  // Testar quiz real
  const quizId = 'RdAUwmQgTthxbZLA0HJWu';
  
  console.log('\n🔍 TESTE 1: Leads do Quiz Real');
  
  const leadsResult = await makeRequest(`/api/quizzes/${quizId}/leads`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log(`Status: ${leadsResult.status}`);
  if (leadsResult.ok) {
    const leads = leadsResult.data.leads || [];
    console.log(`✅ Leads obtidos: ${leads.length}`);
    
    if (leads.length > 0) {
      const firstLead = leads[0];
      const fields = Object.keys(firstLead).filter(key => 
        firstLead[key] && firstLead[key].toString().trim()
      );
      console.log(`📊 Campos detectados: ${fields.length}`);
      console.log(`📋 Primeiros campos: ${fields.slice(0, 5).join(', ')}`);
      
      // Verificar campos críticos
      const critical = ['nome', 'email', 'telefone'];
      const detected = critical.filter(c => 
        fields.some(f => f.toLowerCase().includes(c))
      );
      console.log(`🎯 Campos críticos: ${detected.length}/${critical.length}`);
    }
  } else {
    console.log(`❌ Erro nos leads: ${leadsResult.data.error || 'Erro desconhecido'}`);
  }
  
  console.log('\n📱 TESTE 2: Telefones do Quiz');
  
  const phonesResult = await makeRequest(`/api/quizzes/${quizId}/phones`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log(`Status: ${phonesResult.status}`);
  if (phonesResult.ok) {
    const phones = phonesResult.data.phones || [];
    console.log(`✅ Telefones extraídos: ${phones.length}`);
    
    if (phones.length > 0) {
      const valid = phones.filter(p => {
        const clean = p.phone?.replace(/\D/g, '');
        return clean && clean.length >= 8 && clean.length <= 15;
      });
      console.log(`📊 Telefones válidos: ${valid.length}/${phones.length}`);
    }
  } else {
    console.log(`❌ Erro nos telefones: ${phonesResult.data.error || 'Erro desconhecido'}`);
  }
  
  console.log('\n🚀 TESTE 3: Variáveis Ultra');
  
  const ultraResult = await makeRequest(`/api/quizzes/${quizId}/variables-ultra`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log(`Status: ${ultraResult.status}`);
  if (ultraResult.ok) {
    const variables = ultraResult.data.variables || [];
    console.log(`✅ Variáveis Ultra: ${variables.length}`);
    
    if (variables.length > 0) {
      const objective = variables.filter(v => 
        v.field.toLowerCase().includes('objetivo') || v.field.includes('p1_')
      );
      console.log(`🎯 Variáveis de objetivo: ${objective.length}`);
    }
  } else {
    console.log(`❌ Erro Ultra: ${ultraResult.data.error || 'Erro desconhecido'}`);
  }
  
  // RESULTADO FINAL
  console.log('\n📊 RESULTADO FINAL');
  console.log('==================');
  
  const tests = [leadsResult.ok, phonesResult.ok, ultraResult.ok];
  const passed = tests.filter(Boolean).length;
  const total = tests.length;
  const rate = ((passed / total) * 100).toFixed(1);
  
  console.log(`🎯 Taxa de aprovação: ${passed}/${total} (${rate}%)`);
  
  if (rate >= 66.7) {
    console.log('🚀 VALIDAÇÃO APROVADA - Ajustes funcionando');
    return true;
  } else {
    console.log('⚠️ Validação parcial - Alguns ajustes necessários');
    return false;
  }
}

runTest().then(success => {
  console.log(`\n${success ? '✅' : '❌'} TESTE FINALIZADO`);
  process.exit(success ? 0 : 1);
});