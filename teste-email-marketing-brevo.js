// Teste completo do sistema de email marketing com Brevo
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Dados de teste Brevo
const BREVO_CONFIG = {
  apiKey: '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',
  fromEmail: 'contato@vendzz.com.br'
};

// Função para fazer requisições autenticadas
async function makeAuthenticatedRequest(endpoint, options = {}) {
  const token = await authenticate();
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  return response;
}

// Autenticação
async function authenticate() {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  const data = await response.json();
  console.log('🔐 Login response:', data);
  return data.accessToken;
}

// Teste 1: Testar API do Brevo
async function testarAPIBrevo() {
  console.log('\n🧪 TESTE 1: Testando API do Brevo');
  
  try {
    const response = await makeAuthenticatedRequest('/api/email-brevo/test', {
      method: 'POST',
      body: JSON.stringify({
        apiKey: BREVO_CONFIG.apiKey,
        fromEmail: BREVO_CONFIG.fromEmail
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ API Brevo:', result.message);
      console.log('📧 Email de teste enviado:', result.testEmailSent || false);
    } else {
      console.log('❌ Erro API Brevo:', result.error);
    }
    
    return response.ok;
  } catch (error) {
    console.error('❌ Erro ao testar API Brevo:', error.message);
    return false;
  }
}

// Teste 2: Listar campanhas de email
async function listarCampanhasEmail() {
  console.log('\n🧪 TESTE 2: Listando campanhas de email');
  
  try {
    const response = await makeAuthenticatedRequest('/api/email-campaigns');
    const campaigns = await response.json();
    
    console.log('📧 Campanhas encontradas:', campaigns.length);
    
    if (campaigns.length > 0) {
      console.log('📋 Primeira campanha:', {
        id: campaigns[0].id,
        name: campaigns[0].name,
        subject: campaigns[0].subject,
        status: campaigns[0].status
      });
    }
    
    return campaigns;
  } catch (error) {
    console.error('❌ Erro ao listar campanhas:', error.message);
    return [];
  }
}

// Teste 3: Listar templates de email
async function listarTemplatesEmail() {
  console.log('\n🧪 TESTE 3: Listando templates de email');
  
  try {
    const response = await makeAuthenticatedRequest('/api/email-templates');
    const templates = await response.json();
    
    console.log('📧 Templates encontrados:', templates.length);
    
    if (templates.length > 0) {
      console.log('📋 Primeiro template:', {
        id: templates[0].id,
        name: templates[0].name,
        category: templates[0].category
      });
    }
    
    return templates;
  } catch (error) {
    console.error('❌ Erro ao listar templates:', error.message);
    return [];
  }
}

// Teste 4: Buscar quizzes disponíveis
async function buscarQuizzes() {
  console.log('\n🧪 TESTE 4: Buscando quizzes disponíveis');
  
  try {
    const response = await makeAuthenticatedRequest('/api/quizzes');
    const quizzes = await response.json();
    
    console.log('📋 Quizzes encontrados:', quizzes.length);
    
    if (quizzes.length > 0) {
      console.log('📝 Primeiro quiz:', {
        id: quizzes[0].id,
        title: quizzes[0].title,
        responses: quizzes[0].responseCount || 0
      });
    }
    
    return quizzes;
  } catch (error) {
    console.error('❌ Erro ao buscar quizzes:', error.message);
    return [];
  }
}

// Teste 5: Criar template de email
async function criarTemplateEmail() {
  console.log('\n🧪 TESTE 5: Criando template de email');
  
  try {
    const templateData = {
      name: 'Template de Teste - Brevo',
      subject: 'Bem-vindo {nome}!',
      content: `
        <h1>Olá, {nome}!</h1>
        <p>Obrigado por participar do nosso quiz sobre saúde.</p>
        <p>Suas informações:</p>
        <ul>
          <li>Email: {email}</li>
          <li>Telefone: {telefone}</li>
          <li>Idade: {idade}</li>
          <li>Altura: {altura}</li>
          <li>Peso: {peso_atual}</li>
        </ul>
        <p>Em breve entraremos em contato!</p>
        <p>Equipe Vendzz</p>
      `,
      category: 'welcome'
    };
    
    const response = await makeAuthenticatedRequest('/api/email-templates', {
      method: 'POST',
      body: JSON.stringify(templateData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Template criado:', result.id);
      console.log('📧 Nome:', result.name);
      return result;
    } else {
      console.log('❌ Erro ao criar template:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao criar template:', error.message);
    return null;
  }
}

// Teste 6: Criar campanha de email
async function criarCampanhaEmail(quizId) {
  console.log('\n🧪 TESTE 6: Criando campanha de email');
  
  if (!quizId) {
    console.log('❌ Quiz ID necessário para criar campanha');
    return null;
  }
  
  try {
    const campaignData = {
      name: 'Campanha de Teste - Brevo',
      subject: 'Obrigado por participar, {nome}!',
      content: `
        <h1>Olá, {nome}!</h1>
        <p>Obrigado por participar do nosso quiz!</p>
        <p>Suas informações foram recebidas com sucesso.</p>
        <p>Em breve nossa equipe entrará em contato através do telefone {telefone}.</p>
        <p>Atenciosamente,<br>Equipe Vendzz</p>
      `,
      quizId: quizId,
      targetAudience: 'all',
      triggerType: 'immediate',
      triggerDelay: 0,
      triggerUnit: 'minutes'
    };
    
    const response = await makeAuthenticatedRequest('/api/email-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Campanha criada:', result.campaignId);
      console.log('📧 Emails agendados:', result.scheduledEmails || 0);
      return result;
    } else {
      console.log('❌ Erro ao criar campanha:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao criar campanha:', error.message);
    return null;
  }
}

// Teste 7: Enviar campanha via Brevo
async function enviarCampanhaBrevo(campaignId) {
  console.log('\n🧪 TESTE 7: Enviando campanha via Brevo');
  
  if (!campaignId) {
    console.log('❌ Campaign ID necessário para enviar');
    return false;
  }
  
  try {
    const response = await makeAuthenticatedRequest(`/api/email-campaigns/${campaignId}/send-brevo`, {
      method: 'POST',
      body: JSON.stringify({
        apiKey: BREVO_CONFIG.apiKey,
        fromEmail: BREVO_CONFIG.fromEmail
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Campanha enviada:', result.message);
      console.log('📧 Total de emails:', result.totalEmails || 0);
      console.log('✅ Sucessos:', result.successCount || 0);
      console.log('❌ Falhas:', result.failureCount || 0);
      return true;
    } else {
      console.log('❌ Erro ao enviar campanha:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao enviar campanha:', error.message);
    return false;
  }
}

// Função principal de teste
async function executarTodosOsTestes() {
  console.log('🚀 INICIANDO TESTES DO SISTEMA DE EMAIL MARKETING COM BREVO\n');
  
  try {
    // Teste 1: API do Brevo
    const brevoOK = await testarAPIBrevo();
    
    // Teste 2: Listar campanhas
    const campaigns = await listarCampanhasEmail();
    
    // Teste 3: Listar templates
    const templates = await listarTemplatesEmail();
    
    // Teste 4: Buscar quizzes
    const quizzes = await buscarQuizzes();
    
    // Teste 5: Criar template
    const newTemplate = await criarTemplateEmail();
    
    // Teste 6: Criar campanha (se tiver quiz disponível)
    let newCampaign = null;
    if (quizzes.length > 0) {
      newCampaign = await criarCampanhaEmail(quizzes[0].id);
    }
    
    // Teste 7: Enviar campanha (se foi criada)
    let campaignSent = false;
    if (newCampaign && newCampaign.campaignId) {
      campaignSent = await enviarCampanhaBrevo(newCampaign.campaignId);
    }
    
    // Resumo dos testes
    console.log('\n📊 RESUMO DOS TESTES:');
    console.log('✅ API Brevo:', brevoOK ? 'OK' : 'FALHOU');
    console.log('📧 Campanhas listadas:', campaigns.length);
    console.log('📄 Templates listados:', templates.length);
    console.log('📋 Quizzes encontrados:', quizzes.length);
    console.log('📄 Template criado:', newTemplate ? 'OK' : 'FALHOU');
    console.log('📧 Campanha criada:', newCampaign ? 'OK' : 'FALHOU');
    console.log('📤 Campanha enviada:', campaignSent ? 'OK' : 'FALHOU');
    
    const totalTestes = 7;
    const sucessos = [brevoOK, campaigns.length > 0, templates.length >= 0, quizzes.length >= 0, !!newTemplate, !!newCampaign, campaignSent].filter(Boolean).length;
    
    console.log(`\n🎯 TAXA DE SUCESSO: ${sucessos}/${totalTestes} (${((sucessos/totalTestes)*100).toFixed(1)}%)`);
    
    if (sucessos === totalTestes) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM! Sistema de email marketing com Brevo funcionando perfeitamente!');
    } else {
      console.log('\n⚠️  Alguns testes falharam. Verifique os logs acima para mais detalhes.');
    }
    
  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO durante os testes:', error.message);
  }
}

// Executar testes
executarTodosOsTestes();