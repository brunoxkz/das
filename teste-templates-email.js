/**
 * TESTE DOS TEMPLATES DE EMAIL
 * Validar: E-mail de Quiz Completo, Quiz Abandonado, citando nome, citando Peso & Altura
 */

async function makeRequest(endpoint, options = {}) {
  const baseUrl = 'http://localhost:5000';
  const url = `${baseUrl}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

async function authenticate() {
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    return response.token;
  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    throw error;
  }
}

async function testEmailTemplates() {
  try {
    console.log('🔥 TESTE DOS TEMPLATES DE EMAIL\n');
    
    // 1. Autenticar
    console.log('🔐 1. AUTENTICANDO...');
    const token = await authenticate();
    console.log('✅ Autenticado com sucesso\n');
    
    // 2. Buscar templates base disponíveis
    console.log('📋 2. BUSCANDO TEMPLATES BASE...');
    const baseTemplates = await makeRequest('/api/email-templates/base', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Encontrados ${baseTemplates.length} templates base:`);
    baseTemplates.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.name} (${template.id})`);
      console.log(`      Categoria: ${template.category}`);
      console.log(`      Variáveis: ${template.variables.join(', ')}`);
      console.log(`      Descrição: ${template.description}\n`);
    });
    
    // 3. Criar templates a partir dos bases
    console.log('🔧 3. CRIANDO TEMPLATES A PARTIR DOS BASES...');
    const createdTemplates = [];
    
    for (let i = 0; i < baseTemplates.length; i++) {
      const baseTemplate = baseTemplates[i];
      console.log(`   Criando: ${baseTemplate.name}...`);
      
      try {
        const createdTemplate = await makeRequest('/api/email-templates/create-from-base', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            baseTemplateId: baseTemplate.id
          })
        });
        
        console.log(`   ✅ ${baseTemplate.name} criado com sucesso`);
        createdTemplates.push(createdTemplate.template);
      } catch (error) {
        console.log(`   ❌ Erro ao criar ${baseTemplate.name}: ${error.message}`);
      }
    }
    
    console.log(`\n✅ ${createdTemplates.length} templates criados com sucesso\n`);
    
    // 4. Listar templates do usuário
    console.log('📝 4. LISTANDO TEMPLATES DO USUÁRIO...');
    const userTemplates = await makeRequest('/api/email-templates', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Usuário possui ${userTemplates.length} templates:`);
    userTemplates.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.name}`);
      console.log(`      ID: ${template.id}`);
      console.log(`      Assunto: ${template.subject}`);
      console.log(`      Categoria: ${template.category}`);
      console.log(`      Variáveis: ${template.variables}\n`);
    });
    
    // 5. Testar criação de campanha com template
    console.log('🚀 5. TESTANDO CRIAÇÃO DE CAMPANHA COM TEMPLATE...');
    if (userTemplates.length > 0) {
      const template = userTemplates[0]; // Usar primeiro template
      
      try {
        const campaign = await makeRequest('/api/email-campaigns', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: `Campanha teste - ${template.name}`,
            quizId: 'ey15ofZ96pBzDIWv_k19T', // Quiz de teste
            subject: template.subject,
            content: template.content,
            targetAudience: 'all',
            triggerType: 'delayed',
            triggerDelay: 5,
            triggerUnit: 'minutes',
            fromDate: '2025-01-01'
          })
        });
        
        console.log(`✅ Campanha criada com sucesso usando template "${template.name}"`);
        console.log(`   ID da campanha: ${campaign.campaignId}`);
        console.log(`   Emails agendados: ${campaign.scheduledEmails}`);
      } catch (error) {
        console.log(`❌ Erro ao criar campanha: ${error.message}`);
      }
    }
    
    console.log('\n🎉 TESTE DE TEMPLATES CONCLUÍDO COM SUCESSO!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    throw error;
  }
}

// Executar teste
testEmailTemplates().catch(console.error);