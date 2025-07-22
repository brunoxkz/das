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

async function debugStoredMetadata() {
  console.log('🔥 DEBUG STORED METADATA IN DATABASE');
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
    
    // 2. Criar novo lead com formato correto AGORA
    console.log('2. 📝 CRIANDO NOVO LEAD PARA DEBUG');
    
    const leadData = {
      responses: [
        { elementFieldId: "p1_objetivo_fitness", value: "Emagrecer" },
        { elementFieldId: "p2_experiencia_treino", value: "Avançado" },
        { elementFieldId: "p3_nome_completo", value: "Debug Usuario Quantum" },
        { elementFieldId: "p3_email_contato", value: "debug.quantum@vendzz.com" },
        { elementFieldId: "p3_telefone", value: "+5511888888888" }
      ],
      leadData: {
        nome: "Debug Usuario Quantum",
        email: "debug.quantum@vendzz.com", 
        telefone: "+5511888888888"
      },
      totalPages: 5,
      completionPercentage: 100,
      timeSpent: 60000
    };
    
    console.log('   Criando lead debug...');
    const createResult = await makeRequest(`/api/quizzes/${TEST_SETTINGS.testQuizId}/submit`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(leadData)
    });
    
    console.log(`   Status criação: ${createResult.status}`);
    if (!createResult.ok) {
      console.log(`   ❌ Erro: ${JSON.stringify(createResult.data)}`);
      return;
    }
    
    console.log('✅ Lead debug criado com sucesso!\n');
    
    // 3. Buscar dados RAW do banco - verificar todas as respostas
    console.log('3. 🔍 INSPECIONANDO DADOS RAW DO BANCO');
    
    const allLeadsResult = await makeRequest(`/api/quizzes/${TEST_SETTINGS.testQuizId}/leads`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (allLeadsResult.ok && allLeadsResult.data.leads) {
      console.log(`   Total leads no quiz: ${allLeadsResult.data.leads.length}`);
      
      // Encontrar nosso lead debug mais recente
      const debugLead = allLeadsResult.data.leads.find(lead => 
        lead.nome && lead.nome.includes("Debug Usuario Quantum")
      );
      
      if (debugLead) {
        console.log('\n   📋 LEAD DEBUG ENCONTRADO:');
        console.log(`   ID: ${debugLead.id}`);
        console.log(`   Nome: ${debugLead.nome}`);
        console.log(`   Telefone: ${debugLead.telefone}`);
        console.log(`   Completion: ${debugLead.completionPercentage}%`);
        console.log(`   IsComplete: ${debugLead.isComplete}`);
        console.log(`   Submitted: ${new Date(debugLead.submittedAt * 1000).toLocaleString()}`);
        
        // Mostrar todos os campos de resposta
        console.log('\n   🎯 CAMPOS DE RESPOSTA COMPLETOS:');
        Object.keys(debugLead).forEach(key => {
          if (key.startsWith('p1_') || key.startsWith('p2_') || key.startsWith('p3_')) {
            console.log(`   ${key}: ${debugLead[key]}`);
          }
        });
      } else {
        console.log('   ❌ Lead debug não encontrado nos leads gerais');
      }
    }
    
    // 4. Testar filtro sem includePartial (padrão true)
    console.log('\n4. 🧪 TESTE 1: COM PARTIAL (padrão)');
    
    const withPartialResult = await makeRequest(`/api/quizzes/${TEST_SETTINGS.testQuizId}/leads-by-response`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        fieldId: "p1_objetivo_fitness",
        responseValue: "Emagrecer",
        // includePartial: true (padrão)
        format: 'phones'
      })
    });
    
    console.log(`   Status: ${withPartialResult.status}`);
    if (withPartialResult.ok) {
      console.log(`   Phones encontrados: ${withPartialResult.data.phonesFound || 0}`);
      if (withPartialResult.data.phones && withPartialResult.data.phones.length > 0) {
        console.log('   📱 TELEFONES COM PARTIAL:');
        withPartialResult.data.phones.forEach((phone, i) => {
          console.log(`   ${i+1}. ${phone.phone} (${phone.name}) - Complete: ${phone.isComplete}`);
        });
      }
    }
    
    // 5. Testar filtro SEM includePartial (só completos)
    console.log('\n5. 🧪 TESTE 2: SEM PARTIAL (só completos)');
    
    const withoutPartialResult = await makeRequest(`/api/quizzes/${TEST_SETTINGS.testQuizId}/leads-by-response`, {
      method: 'POST', 
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        fieldId: "p1_objetivo_fitness",
        responseValue: "Emagrecer",
        includePartial: false, // SÓ COMPLETOS
        format: 'phones'
      })
    });
    
    console.log(`   Status: ${withoutPartialResult.status}`);
    if (withoutPartialResult.ok) {
      console.log(`   Phones encontrados: ${withoutPartialResult.data.phonesFound || 0}`);
      if (withoutPartialResult.data.phones && withoutPartialResult.data.phones.length > 0) {
        console.log('   📱 TELEFONES SEM PARTIAL:');
        withoutPartialResult.data.phones.forEach((phone, i) => {
          console.log(`   ${i+1}. ${phone.phone} (${phone.name}) - Complete: ${phone.isComplete}`);
        });
        
        console.log('\n🎯 SISTEMA QUANTUM DEVE FUNCIONAR AGORA!');
      } else {
        console.log('   ❌ PROBLEMA: Nenhum telefone em leads completos');
        console.log('   🔧 Investigando causa raiz...');
        
        // Debug: ver lead em formato completo
        const debugCompleteResult = await makeRequest(`/api/quizzes/${TEST_SETTINGS.testQuizId}/leads-by-response`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            fieldId: "p1_objetivo_fitness",
            responseValue: "Emagrecer",
            includePartial: false,
            format: 'leads' // FORMATO COMPLETO
          })
        });
        
        if (debugCompleteResult.ok && debugCompleteResult.data.leads) {
          console.log(`   📊 Leads completos no filtro: ${debugCompleteResult.data.leads.length}`);
          debugCompleteResult.data.leads.forEach((lead, i) => {
            console.log(`   ${i+1}. Nome: ${lead.nome || 'N/A'} | Phone: ${lead.telefone || 'N/A'} | Complete: ${lead.isComplete} | Completion: ${lead.completionPercentage}%`);
          });
        }
      }
    }
    
  } catch (error) {
    console.log(`❌ ERRO CRÍTICO: ${error.message}`);
  }
}

debugStoredMetadata();