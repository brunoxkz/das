// Teste completo do sistema de email marketing - criando dados de teste
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
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
  return data.accessToken;
}

// Criar quiz com campo de email
async function criarQuizComEmail() {
  console.log('\n📝 CRIANDO QUIZ COM CAMPO DE EMAIL');
  
  const quizData = {
    title: 'Quiz de Teste Email Marketing',
    description: 'Quiz para testar o sistema de email marketing',
    structure: {
      pages: [
        {
          id: Date.now(),
          title: 'Página 1',
          elements: [
            {
              id: Date.now() + 1,
              type: 'heading',
              content: 'Bem-vindo ao nosso quiz!',
              required: false,
              fieldId: 'heading_1',
              fontSize: 'lg',
              textAlign: 'center'
            },
            {
              id: Date.now() + 2,
              type: 'text',
              content: 'Qual é o seu nome?',
              required: true,
              fieldId: 'nome',
              placeholder: 'Digite seu nome completo'
            },
            {
              id: Date.now() + 3,
              type: 'email',
              content: 'Qual é o seu email?',
              required: true,
              fieldId: 'email',
              placeholder: 'seu@email.com'
            },
            {
              id: Date.now() + 4,
              type: 'phone',
              content: 'Qual é o seu telefone?',
              required: false,
              fieldId: 'telefone_principal',
              placeholder: '(11) 99999-9999'
            }
          ]
        }
      ],
      settings: {
        theme: 'vendzz',
        showProgressBar: true,
        collectEmail: true,
        collectName: true,
        collectPhone: true
      }
    }
  };
  
  try {
    const response = await makeAuthenticatedRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData)
    });
    
    const quiz = await response.json();
    
    if (response.ok) {
      console.log('✅ Quiz criado:', quiz.id);
      console.log('📝 Título:', quiz.title);
      
      // Publicar o quiz
      await makeAuthenticatedRequest(`/api/quizzes/${quiz.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...quizData,
          isPublished: true
        })
      });
      
      console.log('📤 Quiz publicado com sucesso');
      return quiz;
    } else {
      console.log('❌ Erro ao criar quiz:', quiz.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao criar quiz:', error.message);
    return null;
  }
}

// Submeter resposta ao quiz
async function submeterRespostaQuiz(quizId) {
  console.log('\n📩 SUBMETENDO RESPOSTA AO QUIZ');
  
  const responseData = {
    responses: [
      {
        elementId: Date.now() + 2,
        elementType: 'text',
        elementFieldId: 'nome',
        answer: 'João da Silva'
      },
      {
        elementId: Date.now() + 3,
        elementType: 'email',
        elementFieldId: 'email',
        answer: 'contato@vendzz.com.br'
      },
      {
        elementId: Date.now() + 4,
        elementType: 'phone',
        elementFieldId: 'telefone_principal',
        answer: '11987654321'
      }
    ],
    metadata: {
      isComplete: true,
      completionPercentage: 100,
      timeSpent: 45
    }
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(responseData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Resposta submetida:', result.id);
      return result;
    } else {
      console.log('❌ Erro ao submeter resposta:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao submeter resposta:', error.message);
    return null;
  }
}

// Criar campanha de email
async function criarCampanhaEmail(quizId) {
  console.log('\n📧 CRIANDO CAMPANHA DE EMAIL');
  
  const campaignData = {
    name: 'Campanha de Boas-vindas - Teste',
    subject: 'Obrigado por participar, {nome}!',
    content: `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #10b981; text-align: center;">Obrigado por participar!</h1>
            
            <p>Olá <strong>{nome}</strong>,</p>
            
            <p>Agradecemos muito sua participação no nosso quiz sobre saúde e bem-estar.</p>
            
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0369a1; margin-top: 0;">Suas informações:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>📧 Email:</strong> {email}</li>
                <li><strong>📱 Telefone:</strong> {telefone_principal}</li>
              </ul>
            </div>
            
            <p>Nossa equipe analisará suas respostas e entrará em contato em breve com informações personalizadas.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="background-color: #10b981; color: white; padding: 15px; border-radius: 5px; display: inline-block;">
                🎉 Obrigado por confiar na <strong>Vendzz</strong>!
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              Este email foi enviado automaticamente pelo sistema Vendzz.<br>
              Data: ${new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </body>
      </html>
    `,
    quizId: quizId,
    targetAudience: 'all',
    triggerType: 'immediate',
    triggerDelay: 0,
    triggerUnit: 'minutes'
  };
  
  try {
    const response = await makeAuthenticatedRequest('/api/email-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Campanha criada:', result.campaignId);
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

// Enviar campanha via Brevo
async function enviarCampanhaBrevo(campaignId) {
  console.log('\n📤 ENVIANDO CAMPANHA VIA BREVO');
  
  try {
    const response = await makeAuthenticatedRequest(`/api/email-campaigns/${campaignId}/send`, {
      method: 'POST',
      body: JSON.stringify({
        apiKey: BREVO_CONFIG.apiKey,
        fromEmail: BREVO_CONFIG.fromEmail
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Campanha enviada com sucesso!');
      console.log('📧 Total de emails:', result.totalEmails);
      console.log('✅ Sucessos:', result.successCount);
      console.log('❌ Falhas:', result.failureCount);
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

// Testar API do Brevo
async function testarBrevo() {
  console.log('\n🧪 TESTANDO API DO BREVO');
  
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
      console.log('✅ API Brevo funcionando:', result.message);
      return true;
    } else {
      console.log('❌ Erro API Brevo:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar Brevo:', error.message);
    return false;
  }
}

// Função principal
async function executarTesteCompleto() {
  console.log('🚀 TESTE COMPLETO DO SISTEMA DE EMAIL MARKETING COM BREVO\n');
  
  try {
    // Teste 1: Verificar API do Brevo
    const brevoOK = await testarBrevo();
    if (!brevoOK) {
      console.log('❌ Teste interrompido: API do Brevo não está funcionando');
      return;
    }
    
    // Teste 2: Criar quiz com campo de email
    const quiz = await criarQuizComEmail();
    if (!quiz) {
      console.log('❌ Teste interrompido: Não foi possível criar o quiz');
      return;
    }
    
    // Teste 3: Submeter resposta ao quiz
    const response = await submeterRespostaQuiz(quiz.id);
    if (!response) {
      console.log('❌ Teste interrompido: Não foi possível submeter resposta');
      return;
    }
    
    // Aguardar um pouco para garantir que a resposta foi processada
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Teste 4: Criar campanha de email
    const campaign = await criarCampanhaEmail(quiz.id);
    if (!campaign) {
      console.log('❌ Teste interrompido: Não foi possível criar campanha');
      return;
    }
    
    // Teste 5: Enviar campanha via Brevo
    const enviada = await enviarCampanhaBrevo(campaign.campaignId);
    
    // Resumo final
    console.log('\n📊 RESUMO DO TESTE COMPLETO:');
    console.log('✅ API Brevo:', brevoOK ? 'OK' : 'FALHOU');
    console.log('✅ Quiz criado:', !!quiz ? 'OK' : 'FALHOU');
    console.log('✅ Resposta submetida:', !!response ? 'OK' : 'FALHOU');
    console.log('✅ Campanha criada:', !!campaign ? 'OK' : 'FALHOU');
    console.log('✅ Email enviado:', enviada ? 'OK' : 'FALHOU');
    
    const sucessos = [brevoOK, !!quiz, !!response, !!campaign, enviada].filter(Boolean).length;
    const total = 5;
    
    console.log(`\n🎯 RESULTADO: ${sucessos}/${total} testes passaram (${((sucessos/total)*100).toFixed(1)}%)`);
    
    if (sucessos === total) {
      console.log('\n🎉 SISTEMA DE EMAIL MARKETING COM BREVO FUNCIONANDO PERFEITAMENTE!');
      console.log('📧 Verifique seu email contato@vendzz.com.br para confirmar o recebimento!');
    } else {
      console.log('\n⚠️  Alguns testes falharam. Verifique os logs acima.');
    }
    
  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO:', error.message);
  }
}

// Executar teste
executarTesteCompleto();