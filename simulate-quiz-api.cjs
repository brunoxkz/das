#!/usr/bin/env node

// Script para simular 10 quiz completions via API
const http = require('http');

console.log('🎯 SIMULANDO 10 QUIZ COMPLETIONS VIA API');
console.log('📊 Testando detecção automática do sistema de notificações\n');

const baseUrl = 'http://localhost:5000';

// Função para fazer requisições HTTP
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsedData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsedData });
        } catch (error) {
          resolve({ status: res.statusCode, data: { raw: data } });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function simulateQuizCompletions() {
  try {
    console.log('🔍 Verificando quizzes existentes...');
    
    // Buscar quizzes existentes
    const quizzesResponse = await makeRequest('GET', '/api/quizzes');
    
    if (quizzesResponse.status !== 200 || !quizzesResponse.data.length) {
      console.log('❌ Nenhum quiz encontrado ou erro na API');
      return;
    }
    
    const quiz = quizzesResponse.data[0];
    console.log(`📝 Usando quiz: ${quiz.title} (ID: ${quiz.id})\n`);
    
    // Simular 10 completions
    for (let i = 1; i <= 10; i++) {
      const responses = {
        nome_completo: `Admin Teste ${i}`,
        email_contato: 'admin@vendzz.com',
        telefone: `11999887${String(i).padStart(3, '0')}`,
        produto_interesse: i % 2 === 0 ? 'Produto Premium' : 'Produto Basic',
        quiz_completed: true,
        completion_time: new Date().toISOString()
      };
      
      const metadata = {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        device: 'iPhone',
        source: 'simulation',
        ip: '192.168.1.100',
        completion_duration: Math.floor(Math.random() * 300) + 60,
        pages_viewed: 2,
        conversion_step: 'completed'
      };
      
      const submissionData = {
        quizId: quiz.id,
        responses: responses,
        metadata: metadata,
        country: 'Brasil',
        phoneCountryCode: '+55'
      };
      
      // Tentar enviar via endpoint de submit quiz
      const submitResponse = await makeRequest('POST', `/api/quizzes/${quiz.id}/submit`, submissionData);
      
      if (submitResponse.status === 200 || submitResponse.status === 201) {
        console.log(`✅ Quiz completion ${i}/10 enviado: ${responses.nome_completo}`);
      } else {
        console.log(`⚠️ Quiz completion ${i}/10 - Status ${submitResponse.status}: ${JSON.stringify(submitResponse.data)}`);
      }
      
      // Aguardar um pouco entre cada submission
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n🎉 SIMULAÇÃO CONCLUÍDA!');
    console.log('📊 10 quiz completions enviados via API');
    console.log('📧 Todos os completions são para: admin@vendzz.com');
    console.log(`🔔 Quiz ID: ${quiz.id}`);
    
    console.log('\n📱 PRÓXIMOS PASSOS:');
    console.log('1. Aguarde o sistema detectar automaticamente os novos completions');
    console.log('2. Verifique se as notificações push são enviadas');
    console.log('3. Observe os logs do servidor para confirmação');
    console.log('4. Teste o som de notificação de venda');
    
    console.log('\n🔍 SISTEMA DE DETECÇÃO:');
    console.log('- Verifica novos quiz_responses a cada 10 segundos');
    console.log('- Filtra apenas usuários com push notifications ativadas');
    console.log('- Admin sempre recebe (override para teste)');
    console.log('- Mensagens rotativas das 9 opções configuradas');
    
  } catch (error) {
    console.error('❌ Erro durante simulação:', error);
  }
}

simulateQuizCompletions();