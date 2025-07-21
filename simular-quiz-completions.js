// Script para simular 5 quiz completions para admin@vendzz.com

const simulateQuizCompletion = async (quizNumber) => {
  const completionId = `completion_${Date.now() + quizNumber}`;
  const timestamp = new Date().toISOString();
  
  console.log(`📋 Simulando Quiz Completion #${quizNumber}`);
  console.log(`🆔 Completion ID: ${completionId}`);
  console.log(`👤 User: admin@vendzz.com`);
  console.log(`⏰ Timestamp: ${timestamp}`);
  
  // Simular dados do quiz completion
  const quizData = {
    completionId: completionId,
    userEmail: 'admin@vendzz.com',
    userId: 'admin-user-id',
    quizId: `quiz_${Math.floor(Math.random() * 1000)}`,
    quizTitle: `Quiz de Teste #${quizNumber}`,
    completedAt: timestamp,
    responses: [
      { question: 'Nome', answer: 'Admin User' },
      { question: 'Email', answer: 'admin@vendzz.com' },
      { question: 'Interesse', answer: 'Marketing Digital' },
      { question: 'Orçamento', answer: 'R$ 1.000 - R$ 5.000' }
    ],
    leadScore: Math.floor(Math.random() * 100) + 1,
    source: 'Sistema Automatizado'
  };
  
  try {
    // Fazer POST para o endpoint de quiz completion (se existir)
    const response = await fetch('http://localhost:5000/api/quiz-completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quizData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Quiz #${quizNumber} criado com sucesso:`, result);
    } else {
      console.log(`⚠️ API não disponível, simulando completion #${quizNumber} via logs`);
      console.log(`📊 Quiz Data:`, JSON.stringify(quizData, null, 2));
    }
    
    // Aguardar 2 segundos entre cada completion
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (error) {
    console.log(`ℹ️ Simulação offline #${quizNumber}:`, error.message);
    console.log(`📋 Completion simulado: ${completionId} para admin@vendzz.com`);
  }
};

const main = async () => {
  console.log('🚀 INICIANDO SIMULAÇÃO DE 5 QUIZ COMPLETIONS PARA admin@vendzz.com');
  console.log('🎯 Objetivo: Testar notificações automáticas push');
  console.log('📱 Esperando push notifications no iPhone...\n');
  
  for (let i = 1; i <= 5; i++) {
    await simulateQuizCompletion(i);
    console.log('─'.repeat(50));
  }
  
  console.log('\n✅ SIMULAÇÃO COMPLETA!');
  console.log('📱 Verificar iPhone para notificações push automáticas');
  console.log('🔍 Monitorar logs do servidor para confirmação de envio');
};

// Node.js version
if (typeof require !== 'undefined') {
  const fetch = require('node-fetch');
  main().catch(console.error);
} else {
  // Browser version fallback
  main().catch(console.error);
}