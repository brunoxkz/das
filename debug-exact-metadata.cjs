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

async function debugExactMetadata() {
  console.log('🔥 DEBUG EXACT METADATA');
  console.log('================================================================================\n');
  
  try {
    // 1. Login
    console.log('1. 🔑 LOGIN');
    const loginResult = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(TEST_SETTINGS.adminCredentials)
    });
    
    if (!loginResult.ok) {
      throw new Error(`Login falhou: ${loginResult.status}`);
    }
    
    const token = loginResult.data.accessToken;
    console.log('✅ Login realizado\n');
    
    // 2. Create a new complete lead to debug
    console.log('2. 📝 CREATING NEW COMPLETE LEAD');
    
    const leadData = {
      responses: [
        { elementFieldId: "p1_objetivo_fitness", value: "Emagrecer" },
        { elementFieldId: "p2_experiencia_treino", value: "Avançado" },
        { elementFieldId: "p3_nome_completo", value: "Metadata Debug User" },
        { elementFieldId: "p3_telefone", value: "+5511777777777" }
      ],
      leadData: {
        nome: "Metadata Debug User",
        telefone: "+5511777777777"
      },
      totalPages: 3,
      completionPercentage: 100,
      timeSpent: 30000
    };
    
    const createResult = await makeRequest(`/api/quizzes/${TEST_SETTINGS.testQuizId}/submit`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(leadData)
    });
    
    console.log(`   Status criação: ${createResult.status}`);
    if (createResult.ok) {
      console.log('✅ Lead debug criado\n');
    } else {
      console.log(`❌ Erro: ${JSON.stringify(createResult.data)}\n`);
    }
    
    // 3. Test the Variables Ultra endpoint to get actual raw metadata
    console.log('3. 🔬 TESTING VARIABLES ULTRA (Raw Data)');
    
    const variablesResult = await makeRequest(`/api/quizzes/${TEST_SETTINGS.testQuizId}/variables-ultra`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (variablesResult.ok && variablesResult.data.variables) {
      console.log(`   Variables encontradas: ${variablesResult.data.variables.length}`);
      
      // Find p1_objetivo_fitness variable 
      const p1Variable = variablesResult.data.variables.find(v => v.fieldId === 'p1_objetivo_fitness');
      if (p1Variable && p1Variable.uniqueValues) {
        console.log(`   🎯 p1_objetivo_fitness values: ${p1Variable.uniqueValues.map(v => `${v.value} (${v.count})`).join(', ')}`);
        
        // Look for "Emagrecer" specifically
        const emagrecerValue = p1Variable.uniqueValues.find(v => v.value === 'Emagrecer');
        if (emagrecerValue) {
          console.log(`   ✅ "Emagrecer" encontrado: ${emagrecerValue.count} responses`);
        } else {
          console.log(`   ❌ "Emagrecer" NÃO ENCONTRADO`);
          console.log(`   Valores disponíveis: ${p1Variable.uniqueValues.map(v => `"${v.value}"`).join(', ')}`);
        }
      }
    } else {
      console.log(`   ❌ Variables Ultra falhou: ${variablesResult.status}`);
    }
    
    // 4. Test leads-by-response WITH partial (should work)
    console.log('\n4. 🧪 TEST WITH PARTIAL');
    
    const withPartialResult = await makeRequest(`/api/quizzes/${TEST_SETTINGS.testQuizId}/leads-by-response`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        fieldId: "p1_objetivo_fitness",
        responseValue: "Emagrecer",
        includePartial: true,
        format: 'phones'
      })
    });
    
    console.log(`   Status: ${withPartialResult.status}`);
    if (withPartialResult.ok) {
      console.log(`   Phones encontrados: ${withPartialResult.data.phonesFound || 0}`);
      if (withPartialResult.data.phones && withPartialResult.data.phones.length > 0) {
        withPartialResult.data.phones.slice(0, 3).forEach((phone, i) => {
          console.log(`   ${i+1}. ${phone.phone} (${phone.name}) - Complete: ${phone.isComplete}`);
        });
      }
    }
    
    // 5. Test leads-by-response WITHOUT partial (broken)
    console.log('\n5. 🧪 TEST WITHOUT PARTIAL');
    
    const withoutPartialResult = await makeRequest(`/api/quizzes/${TEST_SETTINGS.testQuizId}/leads-by-response`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        fieldId: "p1_objetivo_fitness",
        responseValue: "Emagrecer",
        includePartial: false,
        format: 'phones'
      })
    });
    
    console.log(`   Status: ${withoutPartialResult.status}`);
    console.log(`   Phones encontrados: ${withoutPartialResult.data.phonesFound || 0}`);
    
    if (withoutPartialResult.data.phonesFound === 0) {
      console.log('\n   🔧 DIAGNOSTICANDO PROBLEMA...');
      console.log('   Issue: includePartial: false filtering incorreto');
      console.log('   Expected: Metadata com isPartial=false ou completionPercentage=100');
      console.log('   Actual: Provavelmente metadata inconsistente');
    }
    
  } catch (error) {
    console.log(`❌ ERRO: ${error.message}`);
  }
}

debugExactMetadata();