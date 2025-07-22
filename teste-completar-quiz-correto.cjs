const { execSync } = require('child_process');

async function completarQuizCorreto() {
  console.log('🧪 TESTE: COMPLETANDO QUIZ COM FORMATO CORRETO');
  console.log('=' .repeat(60));
  
  const baseUrl = 'http://localhost:5000';
  const quizId = 'Xj7jELWEJHHhM14Ky-nhW';
  
  // Função auxiliar para fazer requests
  async function request(method, url, data = null, headers = {}) {
    const fetch = (await import('node-fetch')).default;
    const options = {
      method,
      headers: { 
        'Content-Type': 'application/json',
        ...headers
      }
    };
    if (data) options.body = JSON.stringify(data);
    
    const response = await fetch(`${baseUrl}${url}`, options);
    return { 
      status: response.status, 
      data: response.headers.get('content-type')?.includes('application/json') 
        ? await response.json() 
        : await response.text() 
    };
  }
  
  // Primeiro, vamos buscar a estrutura do quiz
  console.log(`🔍 Buscando estrutura do quiz ${quizId}...`);
  
  try {
    const quizResult = await request('GET', `/api/quizzes/${quizId}`);
    
    if (quizResult.status === 200 && typeof quizResult.data === 'object') {
      const quiz = quizResult.data;
      console.log(`✅ Quiz encontrado: "${quiz.title || 'Sem título'}"`);
      console.log(`📝 Páginas: ${quiz.structure?.pages?.length || 0}`);
      
      // Agora vamos completar 10 vezes com o formato correto
      console.log(`\n🚀 Completando quiz 10 vezes...`);
      
      for (let i = 1; i <= 10; i++) {
        try {
          console.log(`\n${i.toString().padStart(2, '0')}. Tentativa ${i}/10:`);
          
          // Formato correto baseado na estrutura do sistema
          const submissionData = {
            responses: {
              [`page_${i % 3 + 1}`]: `Resposta ${i}`,
              'email_field': `teste${i}@exemplo.com`,
              'name_field': `Usuário ${i}`
            },
            metadata: {
              completedAt: new Date().toISOString(),
              sessionId: `session_${i}_${Date.now()}`,
              userAgent: 'test-script'
            }
          };
          
          console.log(`   📤 Enviando submission...`);
          const result = await request('POST', `/api/quizzes/${quizId}/submit`, submissionData);
          
          if (result.status === 200 || result.status === 201) {
            console.log(`   ✅ Quiz completado! (Status: ${result.status})`);
            
            if (typeof result.data === 'object') {
              if (result.data.pushNotificationSent) {
                console.log(`   🔔 Push notification enviada!`);
              }
              if (result.data.rotatingMessage) {
                console.log(`   🔄 Mensagem: "${result.data.rotatingMessage.title}"`);
              }
            }
            
          } else {
            console.log(`   ❌ Erro: ${result.status}`);
            if (typeof result.data === 'string') {
              console.log(`   📄 Resposta: ${result.data.substring(0, 100)}...`);
            } else {
              console.log(`   📄 Resposta: ${JSON.stringify(result.data).substring(0, 100)}...`);
            }
          }
          
          // Pausa entre tentativas
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.log(`   ❌ Erro na tentativa ${i}: ${error.message}`);
        }
      }
      
    } else {
      console.log(`❌ Quiz não encontrado ou erro: ${quizResult.status}`);
      console.log(`📄 Resposta: ${JSON.stringify(quizResult.data).substring(0, 200)}...`);
      
      // Vamos tentar mesmo assim com um formato simples
      console.log(`\n🔄 Tentando com formato simples...`);
      
      for (let i = 1; i <= 10; i++) {
        try {
          console.log(`\n${i.toString().padStart(2, '0')}. Tentativa simples ${i}/10:`);
          
          // Formato mais simples
          const simpleData = {
            responses: [`Resposta ${i}`],
            completedAt: new Date().toISOString()
          };
          
          const result = await request('POST', `/api/quizzes/${quizId}/submit`, simpleData);
          
          console.log(`   📊 Status: ${result.status}`);
          if (result.status === 200 || result.status === 201) {
            console.log(`   ✅ Sucesso!`);
          } else {
            console.log(`   ❌ Falhou: ${JSON.stringify(result.data).substring(0, 100)}`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.log(`   ❌ Erro: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.log(`❌ Erro ao buscar quiz: ${error.message}`);
  }
  
  // Verificar estatísticas finais
  console.log('\n' + '=' .repeat(60));
  console.log('📊 ESTATÍSTICAS FINAIS');
  console.log('=' .repeat(60));
  
  try {
    const statsResult = await request('GET', '/api/admin/push-stats');
    if (statsResult.status === 200) {
      console.log(`📈 Stats: ${JSON.stringify(statsResult.data, null, 2)}`);
    } else {
      console.log(`❌ Erro ao buscar stats: ${statsResult.status}`);
    }
  } catch (error) {
    console.log(`❌ Erro stats: ${error.message}`);
  }
  
  console.log('\n🎉 Teste finalizado!');
}

// Executar teste
completarQuizCorreto().catch(console.error);