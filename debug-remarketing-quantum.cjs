const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const TEST_SETTINGS = {
  baseUrl: 'http://localhost:5000',
  adminCredentials: { email: 'admin@admin.com', password: 'admin123' },
  testQuizId: '123-teste'
};

async function makeRequest(endpoint, options = {}) {
  const url = `${TEST_SETTINGS.baseUrl}${endpoint}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();
  
  return { status: response.status, ok: response.ok, data };
}

async function debugRemarketingQuantum() {
  console.log('🔥 DEBUG DETALHADO REMARKETING QUANTUM');
  console.log('================================================================================\n');
  
  try {
    // 1. Login
    console.log('1. 🔑 FAZENDO LOGIN');
    const loginResult = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(TEST_SETTINGS.adminCredentials)
    });
    
    if (!loginResult.ok) {
      throw new Error(`Login falhou: ${loginResult.status} - ${JSON.stringify(loginResult.data)}`);
    }
    
    console.log('✅ Login realizado');
    console.log('   Response completa:', JSON.stringify(loginResult.data, null, 2));
    
    const token = loginResult.data.token || loginResult.data.accessToken;
    if (!token) {
      throw new Error(`Token não encontrado na resposta do login: ${JSON.stringify(loginResult.data)}`);
    }
    
    console.log(`   Token obtido: ${token.substring(0, 50)}...\n`);
    
    // 2. Verificar Variables Ultra
    console.log('2. 🔬 VERIFICANDO VARIABLES ULTRA');
    const variablesResult = await makeRequest(`/api/quizzes/${TEST_SETTINGS.testQuizId}/variables-ultra`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!variablesResult.ok) {
      throw new Error(`Variables Ultra falhou: ${variablesResult.status}`);
    }
    
    console.log(`✅ Variables encontradas: ${variablesResult.data.totalVariables}`);
    
    if (variablesResult.data.variables.length > 0) {
      const firstVar = variablesResult.data.variables[0];
      console.log(`   Primeira variável: ${firstVar.fieldId}`);
      console.log(`   Possíveis valores: ${firstVar.possibleValues.join(', ')}`);
      console.log('');
      
      // 3. Testar leads-by-response com cada valor
      console.log('3. 🎯 TESTANDO LEADS-BY-RESPONSE PARA CADA VALOR');
      
      // Procurar variável com mais potencial (p1_objetivo_fitness)
      const targetVar = variablesResult.data.variables.find(v => v.fieldId.includes('objetivo')) || firstVar;
      console.log(`   Variável selecionada para teste: ${targetVar.fieldId}`);
      console.log(`   Valores disponíveis: ${targetVar.possibleValues.join(', ')}\n`);
      
      for (const value of targetVar.possibleValues.slice(0, 2)) { // Testar os primeiros 2
        console.log(`\n📋 Testando valor: "${value}"`);
        
        const leadsResult = await makeRequest(`/api/quizzes/${TEST_SETTINGS.testQuizId}/leads-by-response`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            fieldId: targetVar.fieldId,
            responseValue: value,
            format: 'phones'
          })
        });
        
        console.log(`   Status: ${leadsResult.status}`);
        
        if (leadsResult.ok) {
          console.log(`   Phones encontrados: ${leadsResult.data.phonesFound || 0}`);
          if (leadsResult.data.phones && leadsResult.data.phones.length > 0) {
            console.log(`   Primeiro telefone: ${leadsResult.data.phones[0].phone}`);
            
            // 4. Tentar criar Remarketing Quantum com este valor
            console.log(`\n🚀 TESTANDO REMARKETING QUANTUM COM: "${value}"`);
            
            const remarketingData = {
              name: `Debug Remarketing ${Date.now()}`,
              message: `Olá {nome}, você escolheu "${value}"!`,
              quizId: TEST_SETTINGS.testQuizId,
              quantumFilters: {
                fieldId: targetVar.fieldId,
                responseValue: value
              },
              scheduleType: 'immediate'
            };
            
            console.log('   Dados enviados:', JSON.stringify(remarketingData, null, 2));
            
            const remarketingResult = await makeRequest('/api/sms-quantum/remarketing/create', {
              method: 'POST', 
              headers: { 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(remarketingData)
            });
            
            console.log(`   Status Remarketing: ${remarketingResult.status}`);
            console.log(`   Response:`, JSON.stringify(remarketingResult.data, null, 2));
            
            if (remarketingResult.ok) {
              console.log('✅ REMARKETING QUANTUM FUNCIONOU!');
              break; // Sair do loop se funcionou
            } else {
              console.log('❌ REMARKETING QUANTUM FALHOU');
            }
          } else {
            console.log(`   ⚠️ Nenhum telefone encontrado para "${value}"`);
          }
        } else {
          console.log(`   ❌ Erro leads-by-response: ${JSON.stringify(leadsResult.data)}`);
        }
      }
    }
    
  } catch (error) {
    console.log(`❌ ERRO CRÍTICO: ${error.message}`);
  }
}

debugRemarketingQuantum();