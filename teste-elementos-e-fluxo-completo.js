/**
 * TESTE COMPLETO - ELEMENTOS E FLUXO AVANÇADO
 * Testa persistência de elementos e funcionalidades do fluxo
 */

const API_BASE = 'http://localhost:5000';

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function authenticate() {
  const response = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  // Usar o token correto baseado na resposta
  return response.accessToken || response.token;
}

async function testElementPersistence() {
  console.log('\n🧪 TESTE DE PERSISTÊNCIA DE ELEMENTOS');
  console.log('=====================================');
  
  const token = await authenticate();
  console.log('✅ [Auth] Token obtido');
  
  // 1. Criar quiz com múltiplos elementos
  const quizData = {
    title: 'Teste Persistência Elementos',
    description: 'Quiz para testar se elementos persistem após salvar',
    userId: 'test-user-id', // Adicionar userId necessário
    structure: {
      pages: [
        {
          id: 'page1',
          title: 'Página 1',
          elements: [
            {
              id: 'elem1',
              type: 'heading',
              content: 'Título Principal',
              properties: {
                fontSize: 'lg',
                textAlign: 'center'
              }
            },
            {
              id: 'elem2',
              type: 'text',
              content: 'Qual é seu nome?',
              properties: {
                fieldId: 'nome',
                required: true
              }
            },
            {
              id: 'elem3',
              type: 'multiple_choice',
              content: 'Qual sua idade?',
              properties: {
                options: ['18-25', '26-35', '36-45', '46+'],
                fieldId: 'idade'
              }
            }
          ]
        },
        {
          id: 'page2',
          title: 'Página 2',
          elements: [
            {
              id: 'elem4',
              type: 'email',
              content: 'Qual seu email?',
              properties: {
                fieldId: 'email',
                required: true
              }
            }
          ]
        }
      ],
      flowSystem: {
        enabled: true,
        nodes: [
          {
            id: 'node_page1',
            pageId: 'page1',
            title: 'Página 1',
            x: 100,
            y: 100,
            type: 'page'
          },
          {
            id: 'node_page2',
            pageId: 'page2',
            title: 'Página 2',
            x: 300,
            y: 100,
            type: 'page'
          }
        ],
        connections: [
          {
            id: 'conn1',
            from: 'node_page1',
            to: 'node_page2',
            condition: {
              pageId: 'page1',
              elementId: 'elem3',
              elementType: 'multiple_choice',
              field: 'idade',
              operator: 'option_selected',
              value: '18-25',
              optionIndex: 0
            }
          }
        ],
        defaultFlow: false
      }
    }
  };

  const quiz = await makeRequest('/api/quizzes', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(quizData)
  });
  
  console.log('✅ [Criação] Quiz criado:', quiz.id);
  console.log('✅ [Elementos] Elementos criados:', quiz.structure.pages[0].elements.length);
  
  // 2. Publicar quiz
  const publishedQuiz = await makeRequest(`/api/quizzes/${quiz.id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      ...quizData,
      isPublished: true
    })
  });
  
  console.log('✅ [Publicação] Quiz publicado');
  
  // 3. Recarregar quiz e verificar elementos
  const reloadedQuiz = await makeRequest(`/api/quizzes/${quiz.id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  console.log('✅ [Recarga] Quiz recarregado');
  
  // 4. Verificar se elementos persistiram
  const page1Elements = reloadedQuiz.structure.pages[0].elements;
  const page2Elements = reloadedQuiz.structure.pages[1].elements;
  
  console.log('📊 [Verificação] Elementos Página 1:', page1Elements.length);
  console.log('📊 [Verificação] Elementos Página 2:', page2Elements.length);
  
  // 5. Verificar se fluxo persistiu
  const flowSystem = reloadedQuiz.structure.flowSystem;
  console.log('📊 [Verificação] Fluxo habilitado:', flowSystem.enabled);
  console.log('📊 [Verificação] Nodes:', flowSystem.nodes.length);
  console.log('📊 [Verificação] Conexões:', flowSystem.connections.length);
  
  // 6. Adicionar mais elementos via update
  const updatedStructure = {
    ...reloadedQuiz.structure,
    pages: [
      {
        ...reloadedQuiz.structure.pages[0],
        elements: [
          ...reloadedQuiz.structure.pages[0].elements,
          {
            id: 'elem5',
            type: 'paragraph',
            content: 'Elemento adicionado depois',
            properties: {
              fontSize: 'sm'
            }
          }
        ]
      },
      reloadedQuiz.structure.pages[1]
    ]
  };
  
  const updatedQuiz = await makeRequest(`/api/quizzes/${quiz.id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      ...reloadedQuiz,
      structure: updatedStructure
    })
  });
  
  console.log('✅ [Atualização] Elemento adicionado');
  
  // 7. Verificar persistência final
  const finalQuiz = await makeRequest(`/api/quizzes/${quiz.id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const finalElements = finalQuiz.structure.pages[0].elements;
  console.log('📊 [Final] Elementos finais:', finalElements.length);
  
  // 8. Cleanup
  await makeRequest(`/api/quizzes/${quiz.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  
  console.log('✅ [Cleanup] Quiz deletado');
  
  return {
    originalElements: 4,
    finalElements: finalElements.length,
    flowPersisted: flowSystem.enabled,
    success: finalElements.length === 4
  };
}

async function testMultipleConnections() {
  console.log('\n🔗 TESTE DE MÚLTIPLAS CONEXÕES');
  console.log('==============================');
  
  const token = await authenticate();
  
  // Criar quiz com múltiplas conexões
  const quizData = {
    title: 'Teste Múltiplas Conexões',
    description: 'Quiz para testar múltiplas conexões no fluxo',
    userId: 'test-user-id', // Adicionar userId necessário
    structure: {
      pages: [
        {
          id: 'page1',
          title: 'Página 1',
          elements: [
            {
              id: 'elem1',
              type: 'multiple_choice',
              content: 'Escolha uma opção:',
              properties: {
                options: ['Opção 1', 'Opção 2', 'Opção 3', 'Opção 4'],
                fieldId: 'escolha'
              }
            }
          ]
        },
        {
          id: 'page2',
          title: 'Página 2 - Destino A',
          elements: []
        },
        {
          id: 'page3',
          title: 'Página 3 - Destino B',
          elements: []
        }
      ],
      flowSystem: {
        enabled: true,
        nodes: [
          {
            id: 'node_page1',
            pageId: 'page1',
            title: 'Página 1',
            x: 100,
            y: 100,
            type: 'page'
          },
          {
            id: 'node_page2',
            pageId: 'page2',
            title: 'Página 2',
            x: 300,
            y: 50,
            type: 'page'
          },
          {
            id: 'node_page3',
            pageId: 'page3',
            title: 'Página 3',
            x: 300,
            y: 150,
            type: 'page'
          }
        ],
        connections: [
          // Opção 1 e 4 vão para Página 2
          {
            id: 'conn1',
            from: 'node_page1',
            to: 'node_page2',
            condition: {
              pageId: 'page1',
              elementId: 'elem1',
              elementType: 'multiple_choice',
              field: 'escolha',
              operator: 'option_selected',
              value: 'Opção 1',
              optionIndex: 0
            }
          },
          {
            id: 'conn2',
            from: 'node_page1',
            to: 'node_page2',
            condition: {
              pageId: 'page1',
              elementId: 'elem1',
              elementType: 'multiple_choice',
              field: 'escolha',
              operator: 'option_selected',
              value: 'Opção 4',
              optionIndex: 3
            }
          },
          // Opção 2 e 3 vão para Página 3
          {
            id: 'conn3',
            from: 'node_page1',
            to: 'node_page3',
            condition: {
              pageId: 'page1',
              elementId: 'elem1',
              elementType: 'multiple_choice',
              field: 'escolha',
              operator: 'option_selected',
              value: 'Opção 2',
              optionIndex: 1
            }
          },
          {
            id: 'conn4',
            from: 'node_page1',
            to: 'node_page3',
            condition: {
              pageId: 'page1',
              elementId: 'elem1',
              elementType: 'multiple_choice',
              field: 'escolha',
              operator: 'option_selected',
              value: 'Opção 3',
              optionIndex: 2
            }
          }
        ],
        defaultFlow: false
      }
    }
  };
  
  const quiz = await makeRequest('/api/quizzes', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(quizData)
  });
  
  console.log('✅ [Criação] Quiz com múltiplas conexões criado');
  console.log('📊 [Conexões] Total de conexões:', quiz.structure.flowSystem.connections.length);
  
  // Verificar se as conexões foram salvas corretamente
  const connections = quiz.structure.flowSystem.connections;
  const toPage2 = connections.filter(c => c.to === 'node_page2').length;
  const toPage3 = connections.filter(c => c.to === 'node_page3').length;
  
  console.log('📊 [Verificação] Conexões para Página 2:', toPage2);
  console.log('📊 [Verificação] Conexões para Página 3:', toPage3);
  
  // Cleanup
  await makeRequest(`/api/quizzes/${quiz.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  
  console.log('✅ [Cleanup] Quiz deletado');
  
  return {
    totalConnections: connections.length,
    toPage2,
    toPage3,
    success: connections.length === 4 && toPage2 === 2 && toPage3 === 2
  };
}

async function runAllTests() {
  console.log('🚀 INICIANDO TESTES COMPLETOS');
  console.log('=============================');
  
  const results = {
    elementPersistence: null,
    multipleConnections: null
  };
  
  try {
    results.elementPersistence = await testElementPersistence();
    console.log('✅ Teste de persistência de elementos concluído');
  } catch (error) {
    console.error('❌ Erro no teste de persistência:', error.message);
    results.elementPersistence = { success: false, error: error.message };
  }
  
  try {
    results.multipleConnections = await testMultipleConnections();
    console.log('✅ Teste de múltiplas conexões concluído');
  } catch (error) {
    console.error('❌ Erro no teste de múltiplas conexões:', error.message);
    results.multipleConnections = { success: false, error: error.message };
  }
  
  console.log('\n📊 RELATÓRIO FINAL');
  console.log('==================');
  console.log('Persistência de Elementos:', results.elementPersistence?.success ? '✅ PASSOU' : '❌ FALHOU');
  console.log('Múltiplas Conexões:', results.multipleConnections?.success ? '✅ PASSOU' : '❌ FALHOU');
  
  const totalTests = 2;
  const passedTests = (results.elementPersistence?.success ? 1 : 0) + (results.multipleConnections?.success ? 1 : 0);
  
  console.log(`\n🎯 RESULTADO: ${passedTests}/${totalTests} testes aprovados (${(passedTests/totalTests*100).toFixed(1)}%)`);
  
  if (passedTests === totalTests) {
    console.log('🎉 TODOS OS TESTES PASSARAM!');
  } else {
    console.log('⚠️  ALGUNS TESTES FALHARAM');
  }
  
  return results;
}

// Executar testes
runAllTests().catch(console.error);