/**
 * DEBUG QUIZ PERSISTENCE - Investigar problema de elementos sumindo
 */

// Testar salvamento específico do Quiz Atualizado 1752101858424
async function debugQuizPersistence() {
  console.log('🔍 INICIANDO DEBUG DO QUIZ PERSISTENCE...');
  
  const quizId = 'eSUu8rVQmP7Pb9RUKpEcl'; // Quiz Atualizado 1752101858424
  
  // 1. Verificar dados atuais do quiz
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IktqY3ROQ09sTTVqY2FmZ0FfZHJWUSIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NTIxMDg4MjMsInRpbWVzdGFtcCI6MTc1MjEwODgyMzg1Nywibm9uY2UiOiJyMnVxbjYiLCJleHAiOjE3NTIxMTI0MjN9.xYHWOJNPFfcJLVCPFBNjYeJwvLNT2lIpJWWnUMLbC7I';
  
  try {
    // Buscar dados atuais
    const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const currentQuiz = await response.json();
    console.log('📄 DADOS ATUAIS DO QUIZ:', JSON.stringify(currentQuiz, null, 2));
    
    // Verificar estrutura das páginas
    console.log('\n🔍 ANÁLISE DAS PÁGINAS:');
    if (currentQuiz.structure?.pages) {
      currentQuiz.structure.pages.forEach((page, index) => {
        console.log(`Página ${index + 1} (ID: ${page.id}):`, {
          title: page.title,
          elementsCount: page.elements?.length || 0,
          elements: page.elements?.map(el => ({
            id: el.id,
            type: el.type,
            content: el.content
          })) || []
        });
      });
    }
    
    // Verificar sistema de fluxo
    console.log('\n🔍 SISTEMA DE FLUXO:');
    if (currentQuiz.structure?.flowSystem) {
      console.log('FlowSystem:', {
        enabled: currentQuiz.structure.flowSystem.enabled,
        nodesCount: currentQuiz.structure.flowSystem.nodes?.length || 0,
        connectionsCount: currentQuiz.structure.flowSystem.connections?.length || 0
      });
    }
    
    // Testar salvamento com dados limpos
    console.log('\n💾 TESTANDO SALVAMENTO...');
    
    // Criar dados de teste com elemento na página 2
    const testData = {
      ...currentQuiz,
      structure: {
        ...currentQuiz.structure,
        pages: [
          ...currentQuiz.structure.pages.slice(0, 2), // Manter páginas 1 e 2
          {
            ...currentQuiz.structure.pages[1], // Página 2
            elements: [
              ...(currentQuiz.structure.pages[1]?.elements || []),
              {
                id: Date.now(),
                type: "multiple_choice",
                content: "Teste de persistência",
                options: ["Opção A", "Opção B", "Opção C"],
                required: false,
                fieldId: `teste_${Date.now()}`,
                placeholder: "",
                fontSize: "base",
                textAlign: "left"
              }
            ]
          },
          ...currentQuiz.structure.pages.slice(2) // Demais páginas
        ]
      }
    };
    
    // Salvar com dados de teste
    const saveResponse = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (!saveResponse.ok) {
      throw new Error(`Save failed! status: ${saveResponse.status}`);
    }
    
    const saveResult = await saveResponse.json();
    console.log('✅ SALVAMENTO CONCLUÍDO:', saveResult);
    
    // Aguardar e verificar se persistiu
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Buscar novamente para verificar
    const verifyResponse = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const verifiedQuiz = await verifyResponse.json();
    console.log('\n🔍 VERIFICAÇÃO PÓS-SALVAMENTO:');
    
    const page2 = verifiedQuiz.structure?.pages?.find(p => p.id === currentQuiz.structure.pages[1].id);
    console.log('Página 2 após salvamento:', {
      elementsCount: page2?.elements?.length || 0,
      elements: page2?.elements?.map(el => ({
        id: el.id,
        type: el.type,
        content: el.content
      })) || []
    });
    
    console.log('\n✅ DEBUG CONCLUÍDO!');
    return true;
    
  } catch (error) {
    console.error('❌ ERRO NO DEBUG:', error);
    return false;
  }
}

debugQuizPersistence().catch(console.error);