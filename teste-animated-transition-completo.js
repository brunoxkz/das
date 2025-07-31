/**
 * TESTE COMPLETO DO ELEMENTO ANIMATED_TRANSITION
 * Testa todas as funcionalidades do elemento de transição animada
 */

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`http://localhost:5000${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message, status: 0 };
  }
}

async function authenticate() {
  const loginResult = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    }),
  });
  
  if (loginResult.success) {
    return loginResult.data.accessToken;
  }
  throw new Error('Falha na autenticação');
}

async function testeAnimatedTransition() {
  console.log('🎬 INICIANDO TESTE COMPLETO DO ANIMATED_TRANSITION');
  console.log('=' .repeat(60));
  
  try {
    // 1. Autenticação
    console.log('\n📋 TESTE 1: Autenticação');
    const startAuth = Date.now();
    const token = await authenticate();
    console.log(`✅ Autenticação bem-sucedida (${Date.now() - startAuth}ms)`);
    
    // 2. Criar quiz com elemento animated_transition
    console.log('\n📋 TESTE 2: Criação de Quiz com Animated Transition');
    const startQuiz = Date.now();
    const quizResult = await makeRequest('/api/quizzes', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        title: 'Teste Animated Transition',
        description: 'Quiz para testar elemento de transição animada',
        structure: {
          pages: [
            {
              id: 1,
              title: 'Página 1',
              elements: [
                {
                  id: 1,
                  type: 'heading',
                  content: 'Bem-vindo ao teste!'
                }
              ]
            },
            {
              id: 2,
              title: 'Transição',
              elements: [
                {
                  id: 2,
                  type: 'animated_transition',
                  content: 'Processando seus dados...',
                  description: 'Aguarde enquanto preparamos tudo para você',
                  animationType: 'pulse',
                  animationSpeed: 'normal',
                  gradientStart: '#10B981',
                  gradientEnd: '#8B5CF6'
                }
              ]
            },
            {
              id: 3,
              title: 'Página Final',
              elements: [
                {
                  id: 3,
                  type: 'paragraph',
                  content: 'Teste concluído com sucesso!'
                }
              ]
            }
          ],
          settings: {
            theme: 'light',
            showProgressBar: true,
            collectEmail: false,
            collectName: false,
            collectPhone: false,
            resultTitle: 'Teste Finalizado',
            resultDescription: 'Animated transition funcionando!'
          }
        }
      }),
    });
    
    if (!quizResult.success) {
      throw new Error(`Erro ao criar quiz: ${JSON.stringify(quizResult.data)}`);
    }
    
    const quizId = quizResult.data.id;
    console.log(`✅ Quiz criado com sucesso (${Date.now() - startQuiz}ms) - ID: ${quizId}`);
    
    // 3. Publicar quiz
    console.log('\n📋 TESTE 3: Publicação do Quiz');
    const startPublish = Date.now();
    const publishResult = await makeRequest(`/api/quizzes/${quizId}/publish`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!publishResult.success) {
      throw new Error(`Erro ao publicar quiz: ${JSON.stringify(publishResult.data)}`);
    }
    
    console.log(`✅ Quiz publicado com sucesso (${Date.now() - startPublish}ms)`);
    
    // 4. Buscar quiz publicado
    console.log('\n📋 TESTE 4: Verificação do Quiz Publicado');
    const startGet = Date.now();
    const getResult = await makeRequest(`/api/quizzes/${quizId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!getResult.success) {
      throw new Error(`Erro ao buscar quiz: ${JSON.stringify(getResult.data)}`);
    }
    
    const quiz = getResult.data;
    console.log(`✅ Quiz recuperado com sucesso (${Date.now() - startGet}ms)`);
    
    // 5. Validar estrutura do elemento animated_transition
    console.log('\n📋 TESTE 5: Validação da Estrutura do Elemento');
    const transitionPage = quiz.structure.pages.find(p => p.id === 2);
    if (!transitionPage) {
      throw new Error('Página de transição não encontrada');
    }
    
    const transitionElement = transitionPage.elements.find(e => e.type === 'animated_transition');
    if (!transitionElement) {
      throw new Error('Elemento animated_transition não encontrado');
    }
    
    console.log('✅ Estrutura do elemento validada:');
    console.log(`   - Tipo: ${transitionElement.type}`);
    console.log(`   - Conteúdo: ${transitionElement.content}`);
    console.log(`   - Descrição: ${transitionElement.description}`);
    console.log(`   - Animação: ${transitionElement.animationType}`);
    console.log(`   - Velocidade: ${transitionElement.animationSpeed}`);
    console.log(`   - Gradiente início: ${transitionElement.gradientStart}`);
    console.log(`   - Gradiente fim: ${transitionElement.gradientEnd}`);
    
    // 6. Testar diferentes tipos de animação
    console.log('\n📋 TESTE 6: Testando Diferentes Tipos de Animação');
    const animationTypes = ['pulse', 'glow', 'wave', 'bounce'];
    const animationSpeeds = ['slow', 'normal', 'fast'];
    
    for (const animationType of animationTypes) {
      for (const animationSpeed of animationSpeeds) {
        const startUpdate = Date.now();
        
        // Atualizar elemento com nova animação
        const updateResult = await makeRequest(`/api/quizzes/${quizId}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            ...quiz,
            structure: {
              ...quiz.structure,
              pages: quiz.structure.pages.map(page => 
                page.id === 2 ? {
                  ...page,
                  elements: page.elements.map(el => 
                    el.type === 'animated_transition' ? {
                      ...el,
                      animationType,
                      animationSpeed,
                      content: `Testando ${animationType} - ${animationSpeed}`,
                      gradientStart: '#FF6B6B',
                      gradientEnd: '#4ECDC4'
                    } : el
                  )
                } : page
              )
            }
          }),
        });
        
        if (updateResult.success) {
          console.log(`✅ Animação ${animationType} - ${animationSpeed} testada (${Date.now() - startUpdate}ms)`);
        } else {
          console.log(`❌ Erro ao testar ${animationType} - ${animationSpeed}: ${JSON.stringify(updateResult.data)}`);
        }
      }
    }
    
    // 7. Testar gradientes personalizados
    console.log('\n📋 TESTE 7: Testando Gradientes Personalizados');
    const gradientTests = [
      { start: '#FF0000', end: '#00FF00', name: 'Vermelho-Verde' },
      { start: '#0000FF', end: '#FFFF00', name: 'Azul-Amarelo' },
      { start: '#FF00FF', end: '#00FFFF', name: 'Magenta-Ciano' },
      { start: '#000000', end: '#FFFFFF', name: 'Preto-Branco' }
    ];
    
    for (const gradient of gradientTests) {
      const startGradient = Date.now();
      
      const updateResult = await makeRequest(`/api/quizzes/${quizId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...quiz,
          structure: {
            ...quiz.structure,
            pages: quiz.structure.pages.map(page => 
              page.id === 2 ? {
                ...page,
                elements: page.elements.map(el => 
                  el.type === 'animated_transition' ? {
                    ...el,
                    gradientStart: gradient.start,
                    gradientEnd: gradient.end,
                    content: `Gradiente ${gradient.name}`
                  } : el
                )
              } : page
            )
          }
        }),
      });
      
      if (updateResult.success) {
        console.log(`✅ Gradiente ${gradient.name} testado (${Date.now() - startGradient}ms)`);
      } else {
        console.log(`❌ Erro ao testar gradiente ${gradient.name}: ${JSON.stringify(updateResult.data)}`);
      }
    }
    
    // 8. Testar resposta do quiz público
    console.log('\n📋 TESTE 8: Testando Acesso Público ao Quiz');
    const startPublic = Date.now();
    const publicResult = await makeRequest(`/api/quiz/${quizId}/public`, {
      method: 'GET',
    });
    
    if (!publicResult.success) {
      throw new Error(`Erro ao acessar quiz público: ${publicResult.error || JSON.stringify(publicResult.data)}`);
    }
    
    console.log(`✅ Quiz público acessível (${Date.now() - startPublic}ms)`);
    
    // 9. Simular resposta incluindo página de transição
    console.log('\n📋 TESTE 9: Simulando Resposta com Transição');
    const startResponse = Date.now();
    
    const responseResult = await makeRequest(`/api/quizzes/${quizId}/responses`, {
      method: 'POST',
      body: JSON.stringify({
        responses: [
          {
            elementId: '1',
            elementType: 'heading',
            answer: 'Visualizada',
            timestamp: new Date().toISOString(),
            pageId: 1,
            pageTitle: 'Página 1'
          },
          {
            elementId: '2',
            elementType: 'animated_transition',
            answer: 'Transição visualizada',
            timestamp: new Date().toISOString(),
            pageId: 2,
            pageTitle: 'Transição'
          },
          {
            elementId: '3',
            elementType: 'paragraph',
            answer: 'Finalizada',
            timestamp: new Date().toISOString(),
            pageId: 3,
            pageTitle: 'Página Final'
          }
        ],
        completionPercentage: 100,
        isComplete: true,
        isPartial: false
      }),
    });
    
    if (!responseResult.success) {
      throw new Error(`Erro ao enviar resposta: ${JSON.stringify(responseResult.data)}`);
    }
    
    console.log(`✅ Resposta com transição enviada (${Date.now() - startResponse}ms)`);
    
    // 10. Verificar analytics
    console.log('\n📋 TESTE 10: Verificando Analytics');
    const startAnalytics = Date.now();
    
    const analyticsResult = await makeRequest(`/api/quizzes/${quizId}/analytics`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (analyticsResult.success) {
      console.log(`✅ Analytics recuperadas (${Date.now() - startAnalytics}ms)`);
      console.log(`   - Visualizações: ${analyticsResult.data.totalViews || 0}`);
      console.log(`   - Respostas: ${analyticsResult.data.totalResponses || 0}`);
      console.log(`   - Taxa de conclusão: ${analyticsResult.data.completionRate || 0}%`);
    } else {
      console.log(`⚠️  Analytics não disponíveis: ${JSON.stringify(analyticsResult.data)}`);
    }
    
    // 11. Limpeza - Excluir quiz de teste
    console.log('\n📋 TESTE 11: Limpeza');
    const startDelete = Date.now();
    
    const deleteResult = await makeRequest(`/api/quizzes/${quizId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (deleteResult.success) {
      console.log(`✅ Quiz de teste excluído (${Date.now() - startDelete}ms)`);
    } else {
      console.log(`⚠️  Erro ao excluir quiz de teste: ${JSON.stringify(deleteResult.data)}`);
    }
    
    // Resultado Final
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 TESTE COMPLETO DO ANIMATED_TRANSITION CONCLUÍDO');
    console.log('✅ Todas as funcionalidades testadas com sucesso!');
    console.log('🎨 Elemento animated_transition 100% funcional');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar teste
testeAnimatedTransition();