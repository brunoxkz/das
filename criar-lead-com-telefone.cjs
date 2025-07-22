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

async function criarLeadComTelefone() {
  console.log('🔥 CRIANDO LEAD COM TELEFONE PARA TESTE QUANTUM');
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
    
    const token = loginResult.data.accessToken;
    console.log('✅ Login realizado\n');
    
    // 2. Criar lead com telefone
    console.log('2. 📱 CRIANDO LEAD COM TELEFONE');
    
    const leadData = {
      responses: [
        { elementFieldId: "p1_objetivo_fitness", value: "Emagrecer" },
        { elementFieldId: "p2_experiencia_treino", value: "Iniciante" },
        { elementFieldId: "p3_nome_completo", value: "João Teste Quantum" },
        { elementFieldId: "p3_email_contato", value: "joao.quantum@teste.com" },
        { elementFieldId: "p3_telefone", value: "+5511987654321" }
      ],
      leadData: {
        nome: "João Teste Quantum",
        email: "joao.quantum@teste.com", 
        telefone: "+5511987654321"
      },
      totalPages: 4,
      completionPercentage: 100,
      timeSpent: 45000
    };
    
    console.log('   Dados do lead:', JSON.stringify(leadData, null, 2));
    
    const submitResult = await makeRequest(`/api/quizzes/${TEST_SETTINGS.testQuizId}/submit`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(leadData)
    });
    
    console.log(`   Status submissão: ${submitResult.status}`);
    if (submitResult.ok) {
      console.log('✅ Lead criado com sucesso!\n');
      
      // 3. Testar leads-by-response
      console.log('3. 🎯 TESTANDO LEADS-BY-RESPONSE COM NOVO LEAD');
      
      const leadsResult = await makeRequest(`/api/quizzes/${TEST_SETTINGS.testQuizId}/leads-by-response`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          fieldId: "p1_objetivo_fitness",
          responseValue: "Emagrecer",
          format: 'phones'
        })
      });
      
      console.log(`   Status: ${leadsResult.status}`);
      if (leadsResult.ok) {
        console.log(`   Phones encontrados: ${leadsResult.data.phonesFound || 0}`);
        if (leadsResult.data.phones && leadsResult.data.phones.length > 0) {
          console.log(`   Telefones:`, leadsResult.data.phones.map(p => p.phone).join(', '));
          
          // 4. Testar Remarketing Quantum
          console.log('\n4. 🚀 TESTANDO REMARKETING QUANTUM');
          
          const remarketingData = {
            name: `Teste Quantum Completo ${Date.now()}`,
            message: `🔥 Olá {nome}, você quer EMAGRECER! Temos um plano perfeito para você!`,
            quizId: TEST_SETTINGS.testQuizId,
            quantumFilters: {
              fieldId: "p1_objetivo_fitness", 
              responseValue: "Emagrecer"
            },
            scheduleType: 'immediate'
          };
          
          console.log('   Dados Remarketing:', JSON.stringify(remarketingData, null, 2));
          
          const remarketingResult = await makeRequest('/api/sms-quantum/remarketing/create', {
            method: 'POST', 
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(remarketingData)
          });
          
          console.log(`   Status Remarketing: ${remarketingResult.status}`);
          console.log(`   Response:`, JSON.stringify(remarketingResult.data, null, 2));
          
          if (remarketingResult.ok) {
            console.log('\n✅ REMARKETING QUANTUM FUNCIONANDO PERFEITAMENTE!');
            console.log('🎯 SISTEMA QUANTUM PRONTO PARA PRODUÇÃO!');
          } else {
            console.log('\n❌ ERRO NO REMARKETING QUANTUM');
          }
        } else {
          console.log('   ⚠️ Ainda nenhum telefone encontrado');
        }
      } else {
        console.log(`   ❌ Erro leads-by-response: ${JSON.stringify(leadsResult.data)}`);
      }
    } else {
      console.log(`   ❌ Erro submissão: ${JSON.stringify(submitResult.data)}`);
    }
    
  } catch (error) {
    console.log(`❌ ERRO CRÍTICO: ${error.message}`);
  }
}

criarLeadComTelefone();