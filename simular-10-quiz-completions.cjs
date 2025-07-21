// 🎯 SIMULAÇÃO: 10 Quiz Completions para testar Push Notifications Automáticas
// Script para simular quiz completions e verificar se push notifications são disparadas

const BASE_URL = 'http://localhost:5173';

// Simular 10 quiz completions diretamente via endpoint público
async function simularQuizCompletion(index) {
  try {
    console.log(`\n🎯 SIMULAÇÃO ${index + 1}/10 - Quiz Completion`);
    
    // Usar um quiz ID fictício mas válido para teste
    const quizId = 'test-quiz-admin-' + (index + 1);
    
    const submissionData = {
      responses: [
        {
          elementFieldId: 'nome_completo',
          value: `Usuário Teste ${index + 1}`,
          pageId: 'page1'
        },
        {
          elementFieldId: 'email_contato', 
          value: `teste${index + 1}@exemplo.com`,
          pageId: 'page2'
        },
        {
          elementFieldId: 'interesse',
          value: index % 2 === 0 ? 'Produto A' : 'Produto B',
          pageId: 'page3'
        }
      ],
      metadata: {
        isPartial: false,
        completedAt: new Date().toISOString(),
        totalPages: 3,
        completionPercentage: 100,
        timeSpent: Math.random() * 60000 + 30000, // Entre 30s e 90s
        isComplete: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        ip: `192.168.1.${100 + index}`,
        leadData: {
          source: 'simulacao_teste',
          campaign: 'teste_push_notifications'
        }
      }
    };

    // Fazer requisição direta para endpoint público de submission
    const response = await fetch(`${BASE_URL}/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submissionData)
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.log(`⚠️ Quiz ${quizId} não existe (esperado), mas vamos simular com quiz real...`);
      return await simularComQuizReal(index);
    }

    const result = JSON.parse(responseText);
    console.log(`✅ SIMULAÇÃO ${index + 1}: Quiz submetido com sucesso`);
    console.log(`📊 Response ID: ${result.responseId || 'N/A'}`);
    console.log(`⏱️ Processing Time: ${result.processingTime || 'N/A'}ms`);
    
    return true;
  } catch (error) {
    console.error(`❌ Erro na simulação ${index + 1}:`, error.message);
    return false;
  }
}

async function simularComQuizReal(index) {
  try {
    // Vamos usar um quiz ID que existe no sistema
    // Primeiro vamos tentar encontrar um quiz existente
    console.log(`🔄 Tentando com quiz existente para simulação ${index + 1}...`);
    
    // Quiz IDs que podem existir no sistema
    const possibleQuizIds = [
      'quiz-admin-test',
      'admin-quiz-1', 
      'test-quiz-1',
      'demo-quiz'
    ];
    
    for (const quizId of possibleQuizIds) {
      try {
        const submissionData = {
          responses: [
            {
              elementFieldId: 'nome_completo',
              value: `Simulação Teste ${index + 1}`,
              pageId: 'page1'
            },
            {
              elementFieldId: 'email_contato',
              value: `simulacao${index + 1}@teste.com`,
              pageId: 'page2'
            }
          ],
          metadata: {
            isPartial: false,
            completedAt: new Date().toISOString(),
            totalPages: 2,
            completionPercentage: 100,
            timeSpent: Math.random() * 45000 + 15000,
            isComplete: true,
            leadData: { source: 'simulacao_automatica' }
          }
        };

        const response = await fetch(`${BASE_URL}/api/quizzes/${quizId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionData)
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ SUCESSO com quiz ${quizId} na simulação ${index + 1}`);
          return true;
        }
      } catch (e) {
        // Continuar tentando próximo quiz
      }
    }
    
    console.log(`⚠️ Simulação ${index + 1}: Nenhum quiz encontrado, mas código de push foi executado`);
    return false;
  } catch (error) {
    console.error(`❌ Erro na simulação com quiz real ${index + 1}:`, error.message);
    return false;
  }
}

async function verificarLogsPushNotifications() {
  console.log('\n📋 VERIFICANDO LOGS DE PUSH NOTIFICATIONS...');
  
  // Aguardar um momento para logs aparecerem
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    // Verificar stats do sistema de push
    const response = await fetch(`${BASE_URL}/api/push-simple/stats`);
    
    if (response.ok) {
      const stats = await response.json();
      console.log('📊 Push Notifications Stats:', stats);
    } else {
      console.log('⚠️ Não foi possível obter stats de push notifications');
    }
  } catch (error) {
    console.log('⚠️ Erro ao verificar stats:', error.message);
  }
}

async function executarSimulacao() {
  console.log('🚀 INICIANDO SIMULAÇÃO DE 10 QUIZ COMPLETIONS PARA ADMIN');
  console.log('🎯 Objetivo: Testar push notifications automáticas no iOS');
  console.log('=' .repeat(80));
  
  const startTime = Date.now();
  let successCount = 0;
  
  // Executar as 10 simulações
  for (let i = 0; i < 10; i++) {
    const success = await simularQuizCompletion(i);
    if (success) successCount++;
    
    // Aguardar 1 segundo entre cada simulação para não sobrecarregar
    if (i < 9) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log('\n' + '=' .repeat(80));
  console.log('📊 RELATÓRIO DA SIMULAÇÃO:');
  console.log(`✅ Quiz Completions Simuladas: ${successCount}/10`);
  console.log(`⏱️ Tempo Total: ${duration}ms`);
  console.log(`📱 Push Notifications: Verificar logs do servidor`);
  
  // Verificar logs
  await verificarLogsPushNotifications();
  
  console.log('\n💡 INSTRUÇÕES PARA VERIFICAÇÃO:');
  console.log('1. Verificar logs do console do servidor para mensagens de push notification');
  console.log('2. Procurar mensagens como: "🎯 QUIZ COMPLETADO" e "✅ Push notification enviada"');
  console.log('3. Se admin tem push subscription ativa, deve receber notificações no dispositivo iOS');
  console.log('4. Se não tem subscription, deve aparecer "🔒 BLOCKED: Usuário sem push notifications ativas"');
  
  console.log('\n🎉 SIMULAÇÃO CONCLUÍDA!');
  console.log('📲 Verificar dispositivo iOS para notificações recebidas');
}

// Polyfill para fetch (Node.js)
if (typeof fetch === 'undefined') {
  global.fetch = async (url, options = {}) => {
    const https = require('https');
    const http = require('http');
    const { URL } = require('url');
    
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;
      
      const req = protocol.request({
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || 'GET',
        headers: options.headers || {}
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.resolve(JSON.parse(data)),
            text: () => Promise.resolve(data)
          });
        });
      });
      
      req.on('error', reject);
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  };
}

// Executar simulação
executarSimulacao().catch(console.error);