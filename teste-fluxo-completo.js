/**
 * TESTE DE FLUXO COMPLETO
 * Simula jornada completa do usuário do início ao fim
 */

const BASE_URL = 'http://localhost:5000';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFFYVk2dkUwcllBa1RYdjV2SENsbSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInBsYW4iOiJlbnRlcnByaXNlIiwicm9sZSI6ImFkbWluIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc1MjM0MTUyOCwiZXhwIjoxNzUyNDI3OTI4fQ.yG862OoMegQ1D9qIdCb2-oZziUo7XS_SBPbLd7vDRng';

const flowResults = {
  totalSteps: 0,
  completedSteps: 0,
  failedSteps: 0,
  stepDetails: [],
  totalTime: 0,
  avgStepTime: 0
};

async function makeRequest(url, options = {}) {
  const start = Date.now();
  
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        ...options.headers
      }
    });
    
    const duration = Date.now() - start;
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    }
    
    const data = await response.json();
    return { success: true, data, duration, status: response.status };
    
  } catch (error) {
    const duration = Date.now() - start;
    return { success: false, error: error.message, duration };
  }
}

function logStep(stepName, result) {
  flowResults.totalSteps++;
  flowResults.totalTime += result.duration;
  
  const stepDetail = {
    name: stepName,
    success: result.success,
    duration: result.duration,
    error: result.error || null
  };
  
  flowResults.stepDetails.push(stepDetail);
  
  if (result.success) {
    flowResults.completedSteps++;
    console.log(`✅ ${stepName} - ${result.duration}ms`);
  } else {
    flowResults.failedSteps++;
    console.log(`❌ ${stepName} - ${result.duration}ms - ${result.error}`);
  }
}

// FLUXO 1: Criação e Resposta de Quiz
async function testQuizCreationFlow() {
  console.log('\n📝 FLUXO 1: Criação e Resposta de Quiz');
  
  // Passo 1: Verificar dashboard
  const dashboardResult = await makeRequest('/api/dashboard/stats');
  logStep('1. Verificar Dashboard', dashboardResult);
  
  // Passo 2: Criar quiz
  const quizData = {
    title: `Quiz Fluxo Completo ${Date.now()}`,
    description: 'Teste de fluxo completo end-to-end',
    structure: {
      pages: [{
        id: 'page1',
        name: 'Dados Pessoais',
        elements: [
          {
            id: 'nome1',
            type: 'text',
            question: 'Qual é o seu nome completo?',
            fieldId: 'nome_completo',
            required: true
          },
          {
            id: 'email1',
            type: 'email',
            question: 'Qual é o seu email?',
            fieldId: 'email_contato',
            required: true
          },
          {
            id: 'telefone1',
            type: 'phone',
            question: 'Qual é o seu telefone?',
            fieldId: 'telefone_contato',
            required: true
          }
        ]
      }]
    }
  };
  
  const quizResult = await makeRequest('/api/quizzes', {
    method: 'POST',
    body: JSON.stringify(quizData)
  });
  logStep('2. Criar Quiz', quizResult);
  
  if (!quizResult.success) return null;
  
  // Passo 3: Verificar quiz criado
  const verifyQuizResult = await makeRequest(`/api/quizzes/${quizResult.data.id}`);
  logStep('3. Verificar Quiz Criado', verifyQuizResult);
  
  // Passo 4: Responder quiz
  const responseData = {
    quizId: quizResult.data.id,
    responses: [
      {
        elementId: 'nome1',
        elementType: 'text',
        elementFieldId: 'nome_completo',
        answer: 'João Silva Teste'
      },
      {
        elementId: 'email1',
        elementType: 'email',
        elementFieldId: 'email_contato',
        answer: 'joao.teste@email.com'
      },
      {
        elementId: 'telefone1',
        elementType: 'phone',
        elementFieldId: 'telefone_contato',
        answer: '11999887766'
      }
    ],
    metadata: {
      isComplete: true,
      completionPercentage: 100,
      timeSpent: 120,
      userAgent: 'Test Agent',
      ipAddress: '127.0.0.1'
    }
  };
  
  const responseResult = await makeRequest('/api/quiz-responses', {
    method: 'POST',
    body: JSON.stringify(responseData)
  });
  logStep('4. Responder Quiz', responseResult);
  
  // Passo 5: Verificar analytics
  const analyticsResult = await makeRequest(`/api/analytics/quiz/${quizResult.data.id}`);
  logStep('5. Verificar Analytics', analyticsResult);
  
  return quizResult.data;
}

// FLUXO 2: Criação de Campanhas
async function testCampaignCreationFlow(quiz) {
  console.log('\n📧 FLUXO 2: Criação de Campanhas');
  
  if (!quiz) {
    console.log('❌ Quiz não disponível para teste de campanhas');
    return;
  }
  
  // Passo 6: Verificar leads disponíveis
  const phonesResult = await makeRequest(`/api/quiz-phones/${quiz.id}`);
  logStep('6. Verificar Leads Disponíveis', phonesResult);
  
  // Passo 7: Criar campanha SMS
  const smsCampaignData = {
    name: `Campanha SMS Fluxo ${Date.now()}`,
    quizId: quiz.id,
    message: 'Olá {nome_completo}! Obrigado por responder nosso quiz. Seu email: {email_contato}',
    targetAudience: 'all',
    triggerType: 'immediate'
  };
  
  const smsCampaignResult = await makeRequest('/api/sms-campaigns', {
    method: 'POST',
    body: JSON.stringify(smsCampaignData)
  });
  logStep('7. Criar Campanha SMS', smsCampaignResult);
  
  // Passo 8: Criar campanha Email
  const emailCampaignData = {
    name: `Campanha Email Fluxo ${Date.now()}`,
    quizId: quiz.id,
    subject: 'Obrigado por participar!',
    message: 'Olá {nome_completo}! Obrigado por responder nosso quiz.',
    targetAudience: 'all',
    triggerType: 'immediate'
  };
  
  const emailCampaignResult = await makeRequest('/api/email-campaigns', {
    method: 'POST',
    body: JSON.stringify(emailCampaignData)
  });
  logStep('8. Criar Campanha Email', emailCampaignResult);
  
  // Passo 9: Verificar campanhas criadas
  const campaignsResult = await makeRequest('/api/sms-campaigns');
  logStep('9. Verificar Campanhas Criadas', campaignsResult);
  
  return {
    sms: smsCampaignResult.data,
    email: emailCampaignResult.data
  };
}

// FLUXO 3: Monitoramento e Analytics
async function testMonitoringFlow(quiz) {
  console.log('\n📊 FLUXO 3: Monitoramento e Analytics');
  
  // Passo 10: Verificar recent activity
  const recentActivityResult = await makeRequest('/api/analytics/recent-activity');
  logStep('10. Verificar Atividade Recente', recentActivityResult);
  
  // Passo 11: Verificar créditos
  const creditsResult = await makeRequest('/api/user/credits');
  logStep('11. Verificar Créditos', creditsResult);
  
  // Passo 12: Verificar dashboard atualizado
  const finalDashboardResult = await makeRequest('/api/dashboard/stats');
  logStep('12. Verificar Dashboard Atualizado', finalDashboardResult);
  
  // Passo 13: Verificar todas as respostas
  if (quiz) {
    const responsesResult = await makeRequest(`/api/quiz-responses/${quiz.id}`);
    logStep('13. Verificar Todas as Respostas', responsesResult);
  }
}

// FLUXO 4: Limpeza
async function testCleanupFlow(quiz, campaigns) {
  console.log('\n🧹 FLUXO 4: Limpeza');
  
  // Passo 14: Deletar campanhas
  if (campaigns?.sms) {
    const deleteSMSResult = await makeRequest(`/api/sms-campaigns/${campaigns.sms.id}`, {
      method: 'DELETE'
    });
    logStep('14. Deletar Campanha SMS', deleteSMSResult);
  }
  
  if (campaigns?.email) {
    const deleteEmailResult = await makeRequest(`/api/email-campaigns/${campaigns.email.id}`, {
      method: 'DELETE'
    });
    logStep('15. Deletar Campanha Email', deleteEmailResult);
  }
  
  // Passo 16: Deletar quiz
  if (quiz) {
    const deleteQuizResult = await makeRequest(`/api/quizzes/${quiz.id}`, {
      method: 'DELETE'
    });
    logStep('16. Deletar Quiz', deleteQuizResult);
  }
  
  // Passo 17: Verificar limpeza
  const finalVerificationResult = await makeRequest('/api/dashboard/stats');
  logStep('17. Verificar Limpeza Final', finalVerificationResult);
}

// Função principal
async function runCompleteFlowTest() {
  console.log('🌊 TESTE DE FLUXO COMPLETO');
  console.log('🎯 Simulando jornada completa do usuário');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  
  try {
    // Executar fluxos sequencialmente
    const quiz = await testQuizCreationFlow();
    const campaigns = await testCampaignCreationFlow(quiz);
    await testMonitoringFlow(quiz);
    await testCleanupFlow(quiz, campaigns);
    
    // Calcular estatísticas finais
    const totalDuration = Date.now() - startTime;
    flowResults.avgStepTime = Math.round(flowResults.totalTime / flowResults.totalSteps);
    const successRate = (flowResults.completedSteps / flowResults.totalSteps * 100).toFixed(1);
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RELATÓRIO DO FLUXO COMPLETO');
    console.log('=' .repeat(60));
    
    console.log(`📈 RESUMO:`);
    console.log(`   Total de Passos: ${flowResults.totalSteps}`);
    console.log(`   Passos Completados: ${flowResults.completedSteps}`);
    console.log(`   Passos Falharam: ${flowResults.failedSteps}`);
    console.log(`   Taxa de Sucesso: ${successRate}%`);
    console.log(`   Tempo Total: ${Math.round(totalDuration / 1000)}s`);
    console.log(`   Tempo Médio por Passo: ${flowResults.avgStepTime}ms`);
    
    // Detalhes dos passos mais lentos
    const slowSteps = flowResults.stepDetails
      .filter(step => step.success && step.duration > 500)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 3);
    
    if (slowSteps.length > 0) {
      console.log(`\n⏱️  PASSOS MAIS LENTOS:`);
      slowSteps.forEach((step, index) => {
        console.log(`   ${index + 1}. ${step.name}: ${step.duration}ms`);
      });
    }
    
    // Passos que falharam
    const failedSteps = flowResults.stepDetails.filter(step => !step.success);
    if (failedSteps.length > 0) {
      console.log(`\n❌ PASSOS QUE FALHARAM:`);
      failedSteps.forEach((step, index) => {
        console.log(`   ${index + 1}. ${step.name}: ${step.error}`);
      });
    }
    
    // Avaliação final
    console.log(`\n🎯 AVALIAÇÃO:`);
    if (parseFloat(successRate) >= 95) {
      console.log(`   🏆 EXCELENTE: Fluxo completo funcionando perfeitamente!`);
    } else if (parseFloat(successRate) >= 80) {
      console.log(`   ✅ BOM: Fluxo funcional com pequenos problemas`);
    } else {
      console.log(`   ⚠️  ATENÇÃO: Fluxo precisa de correções importantes`);
    }
    
    if (flowResults.avgStepTime <= 300) {
      console.log(`   🚀 Performance excelente em todos os passos`);
    } else if (flowResults.avgStepTime <= 600) {
      console.log(`   ⚡ Performance boa na maioria dos passos`);
    } else {
      console.log(`   🐌 Performance lenta detectada`);
    }
    
    // Integridade do fluxo
    const criticalSteps = ['Criar Quiz', 'Responder Quiz', 'Criar Campanha SMS'];
    const criticalStepResults = flowResults.stepDetails.filter(step => 
      criticalSteps.some(critical => step.name.includes(critical))
    );
    
    const criticalSuccess = criticalStepResults.filter(step => step.success).length;
    const criticalTotal = criticalStepResults.length;
    
    console.log(`\n🔗 INTEGRIDADE DO FLUXO:`);
    console.log(`   Passos Críticos: ${criticalSuccess}/${criticalTotal}`);
    
    if (criticalSuccess === criticalTotal) {
      console.log(`   ✅ Fluxo principal funcionando 100%`);
    } else {
      console.log(`   ⚠️  Fluxo principal comprometido`);
    }
    
  } catch (error) {
    console.error('🚨 ERRO CRÍTICO NO FLUXO:', error);
  }
}

// Executar teste
runCompleteFlowTest().catch(console.error);