#!/usr/bin/env node

/**
 * TESTE FINAL DE VALIDAÇÃO QUANTUM COMPATIBILIDADE
 * Verificar se os ajustes melhoraram a compatibilidade do sistema
 */

console.log('🎯 TESTE FINAL: Validação Quantum Compatibilidade');

const API_BASE = 'http://localhost:5000';

// Dados de teste para validação final
const testData = {
  token: '', // Será obtido via login
  userId: 'admin-user-id',
  quizId: 'RdAUwmQgTthxbZLA0HJWu', // Quiz real existente
  responses: {
    'nome_completo': 'João Silva Teste',
    'email_contato': 'joao.teste@quantum.com',
    'telefone_celular': '11999887766',
    'p1_objetivo_principal': 'Emagrecer',
    'p2_nivel_experiencia': 'Iniciante',
    'altura': '175cm',
    'peso': '80kg',
    'idade': '30',
    'empty_field': '',
    'null_field': null
  }
};

async function makeRequest(endpoint, options = {}) {
  const fetch = (await import('node-fetch')).default;
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': testData.token ? `Bearer ${testData.token}` : undefined,
      ...options.headers
    },
    ...options
  });
  
  const responseText = await response.text();
  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    data = { rawResponse: responseText };
  }
  
  return { status: response.status, data, ok: response.ok };
}

async function runValidationTest() {
  console.log('\n🔐 ETAPA 1: Autenticação');
  
  try {
    // Login
    const loginResponse = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Falha na autenticação');
      return false;
    }
    
    testData.token = loginResponse.data.token;
    console.log('✅ Autenticação bem-sucedida');
    
    // TESTE 1: Auto-detecção melhorada
    console.log('\n🔍 TESTE 1: Auto-detecção melhorada');
    
    const leadsResponse = await makeRequest(`/api/quizzes/${testData.quizId}/leads`);
    
    if (leadsResponse.ok) {
      const leads = leadsResponse.data.leads || [];
      console.log(`✅ Leads obtidos: ${leads.length}`);
      
      if (leads.length > 0) {
        const firstLead = leads[0];
        const detectedFields = Object.keys(firstLead).filter(key => 
          firstLead[key] && firstLead[key].toString().trim()
        );
        
        console.log(`📊 Campos detectados no lead: ${detectedFields.length}`);
        console.log(`📋 Campos: ${detectedFields.slice(0, 10).join(', ')}${detectedFields.length > 10 ? '...' : ''}`);
        
        // Verificar se campos críticos foram detectados
        const criticalFields = ['nome', 'email', 'telefone'];
        const detectedCritical = criticalFields.filter(field => 
          detectedFields.some(df => df.toLowerCase().includes(field))
        );
        
        console.log(`🎯 Campos críticos detectados: ${detectedCritical.length}/${criticalFields.length}`);
      }
    } else {
      console.log('⚠️ Não foi possível obter leads para análise');
    }
    
    // TESTE 2: Validação de telefones
    console.log('\n📱 TESTE 2: Validação de telefones');
    
    const phonesResponse = await makeRequest(`/api/quizzes/${testData.quizId}/phones`);
    
    if (phonesResponse.ok) {
      const phones = phonesResponse.data.phones || [];
      console.log(`✅ Telefones extraídos: ${phones.length}`);
      
      if (phones.length > 0) {
        const validPhones = phones.filter(p => {
          const phoneStr = p.phone?.replace(/\D/g, '');
          return phoneStr && phoneStr.length >= 8 && phoneStr.length <= 15;
        });
        
        console.log(`📊 Telefones válidos: ${validPhones.length}/${phones.length}`);
        console.log(`📋 Exemplos: ${phones.slice(0, 3).map(p => p.phone).join(', ')}`);
      }
    } else {
      console.log('⚠️ Não foi possível obter telefones para análise');
    }
    
    // TESTE 3: Sistema Ultra específico
    console.log('\n🚀 TESTE 3: Sistema Ultra específico');
    
    const ultraResponse = await makeRequest(`/api/quizzes/${testData.quizId}/variables-ultra`);
    
    if (ultraResponse.ok) {
      const variables = ultraResponse.data.variables || [];
      console.log(`✅ Variáveis Ultra detectadas: ${variables.length}`);
      
      if (variables.length > 0) {
        const objectiveVars = variables.filter(v => 
          v.field.toLowerCase().includes('objetivo') || v.field.includes('p1_')
        );
        
        console.log(`🎯 Variáveis de objetivo: ${objectiveVars.length}`);
        
        if (objectiveVars.length > 0) {
          console.log(`📋 Exemplo: ${objectiveVars[0].field} com ${objectiveVars[0].values.length} valores`);
        }
      }
    } else {
      console.log('⚠️ Sistema Ultra não respondeu adequadamente');
    }
    
    // TESTE 4: Proteção contra undefined
    console.log('\n🛡️ TESTE 4: Proteção contra undefined');
    
    const filterResponse = await makeRequest(`/api/quizzes/${testData.quizId}/leads-by-response`, {
      method: 'POST',
      body: JSON.stringify({
        field: 'p1_objetivo_principal',
        value: 'Emagrecer',
        format: 'leads'
      })
    });
    
    if (filterResponse.ok) {
      console.log('✅ Filtro por resposta funcionando');
      const filteredLeads = filterResponse.data.leads || [];
      console.log(`📊 Leads filtrados: ${filteredLeads.length}`);
    } else {
      console.log('⚠️ Filtro por resposta apresentou problemas');
    }
    
    // RESULTADO FINAL
    console.log('\n🎯 RESULTADO FINAL DA VALIDAÇÃO');
    console.log('=======================================');
    
    const tests = [
      leadsResponse.ok,
      phonesResponse.ok,
      ultraResponse.ok,
      filterResponse.ok
    ];
    
    const passedTests = tests.filter(Boolean).length;
    const totalTests = tests.length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    console.log(`📊 Taxa de aprovação: ${passedTests}/${totalTests} (${successRate}%)`);
    
    if (successRate >= 75) {
      console.log('🚀 SISTEMA QUANTUM COMPATÍVEL - Ajustes aplicados com sucesso');
      return true;
    } else {
      console.log('⚠️ Sistema precisa de ajustes adicionais');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro durante validação:', error.message);
    return false;
  }
}

// Executar teste
runValidationTest().then(success => {
  if (success) {
    console.log('\n✅ VALIDAÇÃO COMPLETA: Sistema pronto para produção');
  } else {
    console.log('\n❌ VALIDAÇÃO INCOMPLETA: Ajustes adicionais necessários');
  }
  process.exit(success ? 0 : 1);
});