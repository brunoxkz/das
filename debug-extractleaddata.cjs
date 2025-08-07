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

async function debugExtractLeadData() {
  console.log('🔥 DEBUG EXTRACT LEAD DATA FUNCTION');
  console.log('================================================================================\n');
  
  try {
    // 1. Login
    console.log('1. 🔑 FAZENDO LOGIN');
    const loginResult = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(TEST_SETTINGS.adminCredentials)
    });
    
    if (!loginResult.ok) {
      throw new Error(`Login falhou: ${loginResult.status}`);
    }
    
    const token = loginResult.data.accessToken;
    console.log('✅ Login realizado\n');
    
    // 2. Ver leads do quiz para entender formato
    console.log('2. 🔍 ANALISANDO LEADS ARMAZENADOS');
    
    const leadsResult = await makeRequest(`/api/quizzes/${TEST_SETTINGS.testQuizId}/leads`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`   Status: ${leadsResult.status}`);
    if (leadsResult.ok && leadsResult.data.leads) {
      console.log(`   Total leads: ${leadsResult.data.leads.length}`);
      
      // Mostrar dados do último lead (nosso teste)
      if (leadsResult.data.leads.length > 0) {
        const lastLead = leadsResult.data.leads[0]; // Mais recente primeiro
        console.log('\n   📊 ÚLTIMO LEAD CRIADO:');
        console.log(`   ID: ${lastLead.id}`);
        console.log(`   Nome: ${lastLead.nome}`);
        console.log(`   Email: ${lastLead.email}`);
        console.log(`   Telefone: ${lastLead.telefone || 'NÃO ENCONTRADO'}`);
        console.log(`   Completion: ${lastLead.completionPercentage}%`);
        
        // Ver todos os campos detectados
        console.log('\n   🔍 TODOS OS CAMPOS EXTRAÍDOS:');
        Object.keys(lastLead).forEach(key => {
          if (!['id', 'submittedAt', 'isComplete', 'completionPercentage', 'timeSpent', 'ip', 'userAgent'].includes(key)) {
            console.log(`   ${key}: ${lastLead[key]}`);
          }
        });
      }
    } else {
      console.log(`   ❌ Erro ao buscar leads: ${JSON.stringify(leadsResult.data)}`);
    }
    
    // 3. Testar phones endpoint especificamente
    console.log('\n3. 📱 TESTANDO ENDPOINT DE TELEFONES');
    
    const phonesResult = await makeRequest(`/api/quizzes/${TEST_SETTINGS.testQuizId}/phones`, {
      method: 'GET', 
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`   Status: ${phonesResult.status}`);
    if (phonesResult.ok) {
      console.log(`   Total telefones: ${phonesResult.data.phones ? phonesResult.data.phones.length : 0}`);
      if (phonesResult.data.phones && phonesResult.data.phones.length > 0) {
        console.log('   Telefones encontrados:');
        phonesResult.data.phones.forEach((phone, index) => {
          console.log(`   ${index + 1}. ${phone.phone} (${phone.name})`);
        });
      } else {
        console.log('   ❌ NENHUM TELEFONE EXTRAÍDO!');
      }
    } else {
      console.log(`   ❌ Erro phones: ${JSON.stringify(phonesResult.data)}`);
    }
    
    // 4. Analisar leads-by-response em detalhe
    console.log('\n4. 🎯 ANALISANDO LEADS-BY-RESPONSE DETALHADO');
    
    const leadsDetailResult = await makeRequest(`/api/quizzes/${TEST_SETTINGS.testQuizId}/leads-by-response`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        fieldId: "p1_objetivo_fitness",
        responseValue: "Emagrecer",
        format: 'leads' // Usar 'leads' para ver dados completos
      })
    });
    
    console.log(`   Status: ${leadsDetailResult.status}`);
    if (leadsDetailResult.ok) {
      console.log(`   Leads encontrados: ${leadsDetailResult.data.leadsFound || 0}`);
      if (leadsDetailResult.data.leads && leadsDetailResult.data.leads.length > 0) {
        const lead = leadsDetailResult.data.leads[0];
        console.log('\n   📋 LEAD COMPLETO ENCONTRADO:');
        console.log(`   Nome: ${lead.nome}`);
        console.log(`   Email: ${lead.email}`); 
        console.log(`   Telefone: ${lead.telefone || lead.phone || lead.celular || lead.whatsapp || 'NÃO DETECTADO'}`);
        
        console.log('\n   🔍 TODOS OS CAMPOS DO LEAD:');
        Object.keys(lead).forEach(key => {
          console.log(`   ${key}: ${lead[key]}`);
        });
      }
    } else {
      console.log(`   ❌ Erro leads-by-response: ${JSON.stringify(leadsDetailResult.data)}`);
    }
    
  } catch (error) {
    console.log(`❌ ERRO CRÍTICO: ${error.message}`);
  }
}

debugExtractLeadData();