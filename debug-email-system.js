// Debug específico do sistema de email marketing
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function debugEmailSystem() {
  try {
    console.log('🔍 DEBUG DO SISTEMA DE EMAIL MARKETING');
    
    // Login
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    
    console.log('✅ Login realizado');
    
    // Criar quiz específico para email
    const quizData = {
      title: 'Quiz Debug Email',
      description: 'Quiz para testar email marketing',
      pages: [
        {
          id: 'page-1',
          type: 'quiz',
          elements: [
            {
              id: 'email-1',
              type: 'email',
              question: 'Qual é o seu email?',
              required: true,
              fieldId: 'email_principal'
            },
            {
              id: 'nome-1',
              type: 'text',
              question: 'Qual é o seu nome?',
              required: true,
              fieldId: 'nome_completo'
            }
          ]
        }
      ],
      settings: {
        theme: 'default',
        leadCollection: {
          enabled: true,
          customFields: [
            { id: 'email_principal', type: 'email', label: 'Email' },
            { id: 'nome_completo', type: 'text', label: 'Nome' }
          ]
        }
      }
    };
    
    const quizResponse = await fetch(`${BASE_URL}/api/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(quizData)
    });
    
    const quiz = await quizResponse.json();
    console.log('✅ Quiz criado:', quiz.id);
    
    // Publicar quiz
    await fetch(`${BASE_URL}/api/quizzes/${quiz.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ...quiz, published: true })
    });
    
    console.log('✅ Quiz publicado');
    
    // Submeter resposta com email
    const responseData = [
      {
        elementId: 'email-1',
        elementType: 'email',
        elementFieldId: 'email_principal',
        question: 'Qual é o seu email?',
        answer: 'teste@vendzz.com.br'
      },
      {
        elementId: 'nome-1',
        elementType: 'text',
        elementFieldId: 'nome_completo',
        question: 'Qual é o seu nome?',
        answer: 'João Silva'
      }
    ];
    
    const submitResponse = await fetch(`${BASE_URL}/api/quizzes/${quiz.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        responses: responseData,
        metadata: {
          isComplete: true,
          completionPercentage: 100,
          completedAt: new Date().toISOString()
        }
      })
    });
    
    const submitResult = await submitResponse.json();
    console.log('✅ Resposta submetida:', submitResult.responseId);
    
    // Criar campanha de email
    const campaignData = {
      name: 'Campanha Debug Email',
      subject: 'Olá {nome}!',
      content: '<h1>Olá {nome}!</h1><p>Seu email é: {email}</p>',
      quizId: quiz.id,
      targetAudience: 'all',
      triggerType: 'immediate'
    };
    
    const campaignResponse = await fetch(`${BASE_URL}/api/email-campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(campaignData)
    });
    
    const campaign = await campaignResponse.json();
    console.log('✅ Campanha criada:', campaign.campaignId);
    
    // Tentar enviar campanha
    console.log('🔄 Tentando enviar campanha...');
    
    const sendResponse = await fetch(`${BASE_URL}/api/email-campaigns/${campaign.campaignId}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        apiKey: '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',
        fromEmail: 'contato@vendzz.com.br'
      })
    });
    
    const sendResult = await sendResponse.json();
    console.log('📧 RESULTADO DO ENVIO:', sendResult);
    
    if (sendResult.error) {
      console.error('❌ ERRO:', sendResult.error);
    } else {
      console.log('✅ SUCESSO! Emails enviados:', sendResult.successCount);
    }
    
  } catch (error) {
    console.error('❌ ERRO NO DEBUG:', error);
  }
}

// Executar
debugEmailSystem();