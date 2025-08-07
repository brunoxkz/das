#!/usr/bin/env node

/**
 * TESTE DO SISTEMA DE RATE LIMITING INTELIGENTE
 * Valida se usuários legítimos podem criar quizzes complexos sem bloqueios
 */

async function testRateLimiter() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('🧪 INICIANDO TESTE DO RATE LIMITER INTELIGENTE\n');
    
    // 1. Fazer login como admin
    console.log('1. 🔐 Fazendo login como admin...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@vendzz.com', password: 'admin123' })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login falhou: ${loginResponse.status}`);
    }
    
    const { accessToken } = await loginResponse.json();
    console.log('✅ Login realizado com sucesso\n');
    
    // 2. Testar criação de quiz complexo (50+ elementos)
    console.log('2. 🎯 Testando criação de quiz complexo...');
    
    const complexQuiz = {
      title: "Quiz Complexo - Teste Rate Limiter",
      description: "Quiz com 50+ elementos para testar rate limiting inteligente",
      structure: {
        pages: Array.from({ length: 10 }, (_, pageIndex) => ({
          id: `page-${pageIndex}`,
          title: `Página ${pageIndex + 1}`,
          elements: Array.from({ length: 6 }, (_, elemIndex) => ({
            id: `element-${pageIndex}-${elemIndex}`,
            type: elemIndex % 2 === 0 ? 'multiple_choice' : 'text',
            properties: {
              question: `Pergunta ${pageIndex * 6 + elemIndex + 1}`,
              fieldId: `campo_${pageIndex}_${elemIndex}`,
              required: true,
              ...(elemIndex % 2 === 0 && {
                options: Array.from({ length: 8 }, (_, optIndex) => ({
                  id: `opt-${optIndex}`,
                  text: `Opção ${optIndex + 1}`,
                  value: `valor_${optIndex}`
                }))
              })
            }
          }))
        }))
      }
    };
    
    // Calcular complexidade total
    const totalElements = complexQuiz.structure.pages.reduce((sum, page) => sum + page.elements.length, 0);
    console.log(`📊 Quiz criado com ${complexQuiz.structure.pages.length} páginas e ${totalElements} elementos`);
    
    // 3. Enviar múltiplas requisições rapidamente para testar rate limiting
    console.log('3. 🚀 Enviando múltiplas requisições de criação...');
    
    const promises = [];
    for (let i = 0; i < 5; i++) {
      const quizData = {
        ...complexQuiz,
        title: `${complexQuiz.title} - Teste ${i + 1}`
      };
      
      promises.push(
        fetch(`${baseUrl}/api/quizzes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(quizData)
        })
      );
    }
    
    const results = await Promise.allSettled(promises);
    
    let successCount = 0;
    let blockedCount = 0;
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.ok) {
          successCount++;
          console.log(`✅ Quiz ${index + 1}: Criado com sucesso`);
        } else if (result.value.status === 429) {
          blockedCount++;
          console.log(`⚠️ Quiz ${index + 1}: Bloqueado pelo rate limiter (${result.value.status})`);
        } else {
          console.log(`❌ Quiz ${index + 1}: Erro ${result.value.status}`);
        }
      } else {
        console.log(`❌ Quiz ${index + 1}: Erro de rede`);
      }
    });
    
    console.log(`\n📈 RESULTADOS:`);
    console.log(`✅ Sucessos: ${successCount}/5`);
    console.log(`⚠️ Bloqueados: ${blockedCount}/5`);
    
    // 4. Verificar estatísticas do rate limiter
    console.log('\n4. 📊 Verificando estatísticas do rate limiter...');
    
    const statsResponse = await fetch(`${baseUrl}/api/rate-limiter/stats`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Estatísticas obtidas:');
      console.log(`- Usuários total: ${stats.stats.totalUsers}`);
      console.log(`- Usuários legítimos: ${stats.stats.legitimateUsers}`);
      console.log(`- Usuários suspeitos: ${stats.stats.suspiciousUsers}`);
      console.log(`- Usuários com quizzes complexos: ${stats.stats.complexQuizUsers}`);
      console.log(`- Score médio de legitimidade: ${stats.stats.avgLegitimacyScore?.toFixed(2) || 'N/A'}`);
      console.log(`- Complexidade média: ${stats.stats.avgQuizComplexity?.toFixed(2) || 'N/A'}`);
    } else {
      console.log(`❌ Erro ao obter estatísticas: ${statsResponse.status}`);
    }
    
    // 5. Análise dos resultados
    console.log('\n🎯 ANÁLISE DO TESTE:');
    
    if (successCount >= 3) {
      console.log('✅ SUCESSO: Sistema permite criação de quizzes complexos para usuários legítimos');
      console.log('✅ Rate limiting inteligente funcionando corretamente');
    } else if (blockedCount > 2) {
      console.log('⚠️ ATENÇÃO: Rate limiting pode estar muito restritivo para usuários legítimos');
      console.log('💡 Considere ajustar os multiplicadores de complexidade');
    } else {
      console.log('❌ ERRO: Sistema não está funcionando conforme esperado');
    }
    
    console.log('\n🏁 TESTE CONCLUÍDO');
    
  } catch (error) {
    console.error('❌ ERRO no teste:', error.message);
    process.exit(1);
  }
}

// Executar teste
testRateLimiter();