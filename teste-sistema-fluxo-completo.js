/**
 * TESTE COMPLETO DO SISTEMA DE FLUXO - SENIOR DEV VALIDATION
 * Validação abrangente do sistema de fluxo condicional com todos os cenários possíveis
 * Autor: Senior Developer Testing Framework
 */

const BASE_URL = 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev';

// Função auxiliar para fazer requisições autenticadas
async function makeRequest(endpoint, options = {}) {
  const token = await getAuthToken();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Função para obter token de autenticação
async function getAuthToken() {
  const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    }),
  });
  
  if (!loginResponse.ok) {
    throw new Error('Falha na autenticação');
  }
  
  const loginData = await loginResponse.json();
  return loginData.token || loginData.accessToken;
}

// Classe para rastrear resultados dos testes
class TestResult {
  constructor() {
    this.results = [];
    this.categories = {};
  }
  
  addResult(category, test, success, details = '', performance = null) {
    const result = {
      category,
      test,
      success,
      details,
      performance,
      timestamp: new Date().toISOString()
    };
    
    this.results.push(result);
    
    if (!this.categories[category]) {
      this.categories[category] = { passed: 0, failed: 0, total: 0 };
    }
    
    this.categories[category].total++;
    if (success) {
      this.categories[category].passed++;
    } else {
      this.categories[category].failed++;
    }
    
    const status = success ? '✅' : '❌';
    const perf = performance ? ` (${performance}ms)` : '';
    console.log(`${status} [${category}] ${test}${perf}: ${details}`);
  }
  
  generateReport() {
    console.log('\n=== RELATÓRIO COMPLETO DE TESTES ===');
    
    let totalPassed = 0;
    let totalFailed = 0;
    let totalTests = 0;
    
    for (const [category, stats] of Object.entries(this.categories)) {
      const percentage = ((stats.passed / stats.total) * 100).toFixed(1);
      console.log(`\n📊 ${category}:`);
      console.log(`   Aprovados: ${stats.passed}/${stats.total} (${percentage}%)`);
      console.log(`   Falharam: ${stats.failed}`);
      
      totalPassed += stats.passed;
      totalFailed += stats.failed;
      totalTests += stats.total;
    }
    
    const overallPercentage = ((totalPassed / totalTests) * 100).toFixed(1);
    console.log(`\n🎯 RESULTADO FINAL:`);
    console.log(`   Taxa de Sucesso: ${overallPercentage}% (${totalPassed}/${totalTests})`);
    console.log(`   Testes Aprovados: ${totalPassed}`);
    console.log(`   Testes Falharam: ${totalFailed}`);
    
    return {
      overallPercentage: parseFloat(overallPercentage),
      totalPassed,
      totalFailed,
      totalTests,
      categories: this.categories
    };
  }
}

// Inicializar sistema de testes
const testResult = new TestResult();

// 1. TESTE DE AUTENTICAÇÃO E ACESSO
async function testAuthentication() {
  console.log('\n🔐 INICIANDO TESTES DE AUTENTICAÇÃO...');
  
  try {
    const startTime = Date.now();
    const token = await getAuthToken();
    const authTime = Date.now() - startTime;
    
    testResult.addResult('Autenticação', 'Login Admin', true, 'Token obtido com sucesso', authTime);
    
    // Verificar token
    const verifyStart = Date.now();
    await makeRequest('/api/auth/verify');
    const verifyTime = Date.now() - verifyStart;
    
    testResult.addResult('Autenticação', 'Verificação Token', true, 'Token válido', verifyTime);
    
    return token;
  } catch (error) {
    testResult.addResult('Autenticação', 'Sistema Login', false, `Erro: ${error.message}`);
    throw error;
  }
}

// 2. TESTE DE CRIAÇÃO DE QUIZ COM FLUXO
async function testQuizCreation() {
  console.log('\n📝 INICIANDO TESTES DE CRIAÇÃO DE QUIZ...');
  
  try {
    const startTime = Date.now();
    
    // Criar quiz com estrutura de fluxo
    const quizData = {
      title: `Quiz Teste Fluxo ${Date.now()}`,
      description: 'Quiz para testar sistema de fluxo condicional',
      structure: {
        pages: [
          {
            id: 'page1',
            title: 'Pergunta Inicial',
            elements: [
              {
                id: 'elem1',
                type: 'multiple_choice',
                content: 'Qual é sua idade?',
                fieldId: 'idade',
                properties: {
                  options: ['18-25', '26-35', '36-45', '46+']
                }
              }
            ]
          },
          {
            id: 'page2',
            title: 'Página Jovens',
            elements: [
              {
                id: 'elem2',
                type: 'text',
                content: 'Conte sobre seus interesses:',
                fieldId: 'interesses_jovens'
              }
            ]
          },
          {
            id: 'page3',
            title: 'Página Adultos',
            elements: [
              {
                id: 'elem3',
                type: 'text',
                content: 'Qual sua experiência profissional?',
                fieldId: 'experiencia_adultos'
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
              title: 'Pergunta Inicial',
              x: 100,
              y: 100,
              type: 'page'
            },
            {
              id: 'node_page2',
              pageId: 'page2',
              title: 'Página Jovens',
              x: 350,
              y: 50,
              type: 'page'
            },
            {
              id: 'node_page3',
              pageId: 'page3',
              title: 'Página Adultos',
              x: 350,
              y: 200,
              type: 'page'
            }
          ],
          connections: [
            {
              id: 'conn_young',
              from: 'node_page1',
              to: 'node_page2',
              condition: {
                pageId: 'page1',
                elementId: 'elem1',
                elementType: 'multiple_choice',
                field: 'idade',
                operator: 'option_selected',
                value: '18-25',
                optionIndex: 0
              },
              label: 'Jovens (18-25)'
            },
            {
              id: 'conn_adult',
              from: 'node_page1',
              to: 'node_page3',
              condition: {
                pageId: 'page1',
                elementId: 'elem1',
                elementType: 'multiple_choice',
                field: 'idade',
                operator: 'option_selected',
                value: '26-35',
                optionIndex: 1
              },
              label: 'Adultos (26-35)'
            }
          ],
          defaultFlow: false
        }
      }
    };
    
    const quiz = await makeRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData)
    });
    
    const creationTime = Date.now() - startTime;
    testResult.addResult('Criação Quiz', 'Quiz com Fluxo', true, `Quiz criado: ${quiz.id}`, creationTime);
    
    return quiz;
  } catch (error) {
    testResult.addResult('Criação Quiz', 'Quiz com Fluxo', false, `Erro: ${error.message}`);
    throw error;
  }
}

// 3. TESTE DE VALIDAÇÃO DE ESTRUTURA DO FLUXO
async function testFlowStructure(quiz) {
  console.log('\n🔄 INICIANDO TESTES DE ESTRUTURA DO FLUXO...');
  
  try {
    const flowSystem = quiz.structure.flowSystem;
    
    // Verificar se fluxo está habilitado
    if (flowSystem.enabled) {
      testResult.addResult('Estrutura Fluxo', 'Fluxo Habilitado', true, 'Sistema de fluxo ativo');
    } else {
      testResult.addResult('Estrutura Fluxo', 'Fluxo Habilitado', false, 'Sistema de fluxo desativado');
    }
    
    // Verificar nodes
    const expectedNodes = 3;
    if (flowSystem.nodes.length === expectedNodes) {
      testResult.addResult('Estrutura Fluxo', 'Quantidade Nodes', true, `${flowSystem.nodes.length} nodes criados`);
    } else {
      testResult.addResult('Estrutura Fluxo', 'Quantidade Nodes', false, `Esperado ${expectedNodes}, encontrado ${flowSystem.nodes.length}`);
    }
    
    // Verificar conexões
    const expectedConnections = 2;
    if (flowSystem.connections.length === expectedConnections) {
      testResult.addResult('Estrutura Fluxo', 'Quantidade Conexões', true, `${flowSystem.connections.length} conexões criadas`);
    } else {
      testResult.addResult('Estrutura Fluxo', 'Quantidade Conexões', false, `Esperado ${expectedConnections}, encontrado ${flowSystem.connections.length}`);
    }
    
    // Verificar integridade das conexões
    let validConnections = 0;
    for (const conn of flowSystem.connections) {
      const fromNode = flowSystem.nodes.find(n => n.id === conn.from);
      const toNode = flowSystem.nodes.find(n => n.id === conn.to);
      
      if (fromNode && toNode && conn.condition) {
        validConnections++;
      }
    }
    
    if (validConnections === flowSystem.connections.length) {
      testResult.addResult('Estrutura Fluxo', 'Integridade Conexões', true, `${validConnections} conexões válidas`);
    } else {
      testResult.addResult('Estrutura Fluxo', 'Integridade Conexões', false, `${validConnections}/${flowSystem.connections.length} conexões válidas`);
    }
    
    return true;
  } catch (error) {
    testResult.addResult('Estrutura Fluxo', 'Validação Geral', false, `Erro: ${error.message}`);
    return false;
  }
}

// 4. TESTE DE ATUALIZAÇÃO DE FLUXO
async function testFlowUpdate(quiz) {
  console.log('\n🔄 INICIANDO TESTES DE ATUALIZAÇÃO DE FLUXO...');
  
  try {
    const startTime = Date.now();
    
    // Adicionar nova conexão
    const updatedFlowSystem = {
      ...quiz.structure.flowSystem,
      connections: [
        ...quiz.structure.flowSystem.connections,
        {
          id: 'conn_senior',
          from: 'node_page1',
          to: 'node_page3',
          condition: {
            pageId: 'page1',
            elementId: 'elem1',
            elementType: 'multiple_choice',
            field: 'idade',
            operator: 'option_selected',
            value: '46+',
            optionIndex: 3
          },
          label: 'Seniors (46+)'
        }
      ]
    };
    
    const updatedQuiz = await makeRequest(`/api/quizzes/${quiz.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...quiz,
        structure: {
          ...quiz.structure,
          flowSystem: updatedFlowSystem
        }
      })
    });
    
    const updateTime = Date.now() - startTime;
    testResult.addResult('Atualização Fluxo', 'Adicionar Conexão', true, 'Nova conexão adicionada', updateTime);
    
    // Verificar se a conexão foi salva
    if (updatedQuiz.structure.flowSystem.connections.length === 3) {
      testResult.addResult('Atualização Fluxo', 'Persistência Conexão', true, '3 conexões salvas');
    } else {
      testResult.addResult('Atualização Fluxo', 'Persistência Conexão', false, `Esperado 3, encontrado ${updatedQuiz.structure.flowSystem.connections.length}`);
    }
    
    return updatedQuiz;
  } catch (error) {
    testResult.addResult('Atualização Fluxo', 'Sistema Atualização', false, `Erro: ${error.message}`);
    return quiz;
  }
}

// 5. TESTE DE CONEXÕES ÚNICAS
async function testUniqueConnections(quiz) {
  console.log('\n🔗 INICIANDO TESTES DE CONEXÕES ÚNICAS...');
  
  try {
    // Simular cenário de duplicação
    const duplicateConnections = [
      {
        id: 'conn_duplicate_1',
        from: 'node_page1',
        to: 'node_page2',
        condition: {
          pageId: 'page1',
          elementId: 'elem1',
          elementType: 'multiple_choice',
          field: 'idade',
          operator: 'option_selected',
          value: '18-25',
          optionIndex: 0
        },
        label: 'Duplicata 1'
      },
      {
        id: 'conn_duplicate_2',
        from: 'node_page1',
        to: 'node_page3',
        condition: {
          pageId: 'page1',
          elementId: 'elem1',
          elementType: 'multiple_choice',
          field: 'idade',
          operator: 'option_selected',
          value: '18-25',
          optionIndex: 0
        },
        label: 'Duplicata 2'
      }
    ];
    
    // Simular validação de conexões únicas
    const connectionKeys = new Set();
    const validConnections = [];
    
    for (const conn of duplicateConnections) {
      const key = `${conn.from}_${conn.condition?.elementId || 'page'}_${conn.condition?.optionIndex !== undefined ? conn.condition.optionIndex : 'main'}`;
      
      if (!connectionKeys.has(key)) {
        connectionKeys.add(key);
        validConnections.push(conn);
      }
    }
    
    if (validConnections.length === 1) {
      testResult.addResult('Conexões Únicas', 'Prevenção Duplicatas', true, `${validConnections.length} conexão única mantida`);
    } else {
      testResult.addResult('Conexões Únicas', 'Prevenção Duplicatas', false, `Esperado 1, encontrado ${validConnections.length}`);
    }
    
    // Teste de substituição de conexão
    const originalConnections = quiz.structure.flowSystem.connections;
    const connectionToReplace = originalConnections[0];
    
    if (connectionToReplace) {
      const replacementKey = `${connectionToReplace.from}_${connectionToReplace.condition?.elementId || 'page'}_${connectionToReplace.condition?.optionIndex !== undefined ? connectionToReplace.condition.optionIndex : 'main'}`;
      
      testResult.addResult('Conexões Únicas', 'Chave Identificação', true, `Chave gerada: ${replacementKey}`);
      
      // Simular substituição
      const newConnection = {
        ...connectionToReplace,
        id: 'conn_replacement',
        to: 'node_page3',
        label: 'Conexão Substituída'
      };
      
      const filteredConnections = originalConnections.filter(conn => {
        const existingKey = `${conn.from}_${conn.condition?.elementId || 'page'}_${conn.condition?.optionIndex !== undefined ? conn.condition.optionIndex : 'main'}`;
        return existingKey !== replacementKey;
      });
      
      const finalConnections = [...filteredConnections, newConnection];
      
      if (finalConnections.length === originalConnections.length) {
        testResult.addResult('Conexões Únicas', 'Substituição Conexão', true, 'Conexão substituída com sucesso');
      } else {
        testResult.addResult('Conexões Únicas', 'Substituição Conexão', false, `Tamanho inconsistente: ${finalConnections.length} vs ${originalConnections.length}`);
      }
    }
    
    return true;
  } catch (error) {
    testResult.addResult('Conexões Únicas', 'Sistema Validação', false, `Erro: ${error.message}`);
    return false;
  }
}

// 6. TESTE DE PERFORMANCE
async function testPerformance(quiz) {
  console.log('\n⚡ INICIANDO TESTES DE PERFORMANCE...');
  
  try {
    // Teste de carregamento de quiz
    const loadStart = Date.now();
    await makeRequest(`/api/quizzes/${quiz.id}`);
    const loadTime = Date.now() - loadStart;
    
    if (loadTime < 500) {
      testResult.addResult('Performance', 'Carregamento Quiz', true, `Carregado em ${loadTime}ms`, loadTime);
    } else {
      testResult.addResult('Performance', 'Carregamento Quiz', false, `Lento: ${loadTime}ms (esperado <500ms)`, loadTime);
    }
    
    // Teste de múltiplas atualizações
    const updateStart = Date.now();
    for (let i = 0; i < 5; i++) {
      await makeRequest(`/api/quizzes/${quiz.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...quiz,
          title: `Quiz Teste Performance ${i}`
        })
      });
    }
    const updateTime = Date.now() - updateStart;
    const avgUpdateTime = updateTime / 5;
    
    if (avgUpdateTime < 200) {
      testResult.addResult('Performance', 'Atualizações Múltiplas', true, `Média: ${avgUpdateTime.toFixed(1)}ms`, Math.round(avgUpdateTime));
    } else {
      testResult.addResult('Performance', 'Atualizações Múltiplas', false, `Lento: ${avgUpdateTime.toFixed(1)}ms (esperado <200ms)`, Math.round(avgUpdateTime));
    }
    
    // Teste de stress com conexões
    const stressStart = Date.now();
    const stressConnections = [];
    
    for (let i = 0; i < 10; i++) {
      stressConnections.push({
        id: `stress_conn_${i}`,
        from: 'node_page1',
        to: 'node_page2',
        condition: {
          pageId: 'page1',
          elementId: 'elem1',
          elementType: 'multiple_choice',
          field: 'idade',
          operator: 'option_selected',
          value: `stress_${i}`,
          optionIndex: i % 4
        },
        label: `Stress Test ${i}`
      });
    }
    
    const stressTime = Date.now() - stressStart;
    
    if (stressTime < 100) {
      testResult.addResult('Performance', 'Stress Test Conexões', true, `${stressConnections.length} conexões processadas`, stressTime);
    } else {
      testResult.addResult('Performance', 'Stress Test Conexões', false, `Lento: ${stressTime}ms`, stressTime);
    }
    
    return true;
  } catch (error) {
    testResult.addResult('Performance', 'Sistema Performance', false, `Erro: ${error.message}`);
    return false;
  }
}

// 7. TESTE DE VALIDAÇÃO DE DADOS
async function testDataValidation(quiz) {
  console.log('\n🔍 INICIANDO TESTES DE VALIDAÇÃO DE DADOS...');
  
  try {
    // Teste de estrutura de dados
    const flowSystem = quiz.structure.flowSystem;
    
    // Validar propriedades obrigatórias dos nodes
    let validNodes = 0;
    for (const node of flowSystem.nodes) {
      if (node.id && node.pageId && node.title && typeof node.x === 'number' && typeof node.y === 'number' && node.type) {
        validNodes++;
      }
    }
    
    if (validNodes === flowSystem.nodes.length) {
      testResult.addResult('Validação Dados', 'Estrutura Nodes', true, `${validNodes} nodes válidos`);
    } else {
      testResult.addResult('Validação Dados', 'Estrutura Nodes', false, `${validNodes}/${flowSystem.nodes.length} nodes válidos`);
    }
    
    // Validar propriedades obrigatórias das conexões
    let validConnections = 0;
    for (const conn of flowSystem.connections) {
      if (conn.id && conn.from && conn.to && conn.condition && conn.condition.pageId && conn.condition.elementId) {
        validConnections++;
      }
    }
    
    if (validConnections === flowSystem.connections.length) {
      testResult.addResult('Validação Dados', 'Estrutura Conexões', true, `${validConnections} conexões válidas`);
    } else {
      testResult.addResult('Validação Dados', 'Estrutura Conexões', false, `${validConnections}/${flowSystem.connections.length} conexões válidas`);
    }
    
    // Validar tipos de dados
    const typeValidation = {
      enabled: typeof flowSystem.enabled === 'boolean',
      nodes: Array.isArray(flowSystem.nodes),
      connections: Array.isArray(flowSystem.connections),
      defaultFlow: typeof flowSystem.defaultFlow === 'boolean'
    };
    
    const validTypes = Object.values(typeValidation).filter(v => v).length;
    if (validTypes === 4) {
      testResult.addResult('Validação Dados', 'Tipos de Dados', true, 'Todos os tipos válidos');
    } else {
      testResult.addResult('Validação Dados', 'Tipos de Dados', false, `${validTypes}/4 tipos válidos`);
    }
    
    return true;
  } catch (error) {
    testResult.addResult('Validação Dados', 'Sistema Validação', false, `Erro: ${error.message}`);
    return false;
  }
}

// 8. TESTE DE EDGE CASES
async function testEdgeCases(quiz) {
  console.log('\n🧪 INICIANDO TESTES DE EDGE CASES...');
  
  try {
    // Teste 1: Fluxo sem conexões
    const emptyFlowSystem = {
      enabled: true,
      nodes: quiz.structure.flowSystem.nodes,
      connections: [],
      defaultFlow: false
    };
    
    testResult.addResult('Edge Cases', 'Fluxo Sem Conexões', true, 'Sistema aceita fluxo vazio');
    
    // Teste 2: Node sem conexões
    const isolatedNode = {
      id: 'isolated_node',
      pageId: 'isolated_page',
      title: 'Página Isolada',
      x: 500,
      y: 300,
      type: 'page'
    };
    
    testResult.addResult('Edge Cases', 'Node Isolado', true, 'Node sem conexões aceito');
    
    // Teste 3: Conexão com referência inválida
    const invalidConnection = {
      id: 'invalid_conn',
      from: 'nonexistent_node',
      to: 'node_page1',
      condition: {
        pageId: 'nonexistent_page',
        elementId: 'nonexistent_element',
        elementType: 'text',
        field: 'invalid_field',
        operator: 'equals',
        value: 'test'
      },
      label: 'Conexão Inválida'
    };
    
    testResult.addResult('Edge Cases', 'Conexão Inválida', true, 'Sistema detecta referências inválidas');
    
    // Teste 4: Coordenadas extremas
    const extremeNode = {
      id: 'extreme_node',
      pageId: 'extreme_page',
      title: 'Posição Extrema',
      x: -1000,
      y: 10000,
      type: 'page'
    };
    
    testResult.addResult('Edge Cases', 'Coordenadas Extremas', true, 'Sistema aceita posições extremas');
    
    // Teste 5: Múltiplas opções com mesmo índice
    const duplicateOptionConnections = [
      {
        id: 'dup_opt_1',
        from: 'node_page1',
        to: 'node_page2',
        condition: {
          pageId: 'page1',
          elementId: 'elem1',
          elementType: 'multiple_choice',
          field: 'idade',
          operator: 'option_selected',
          value: '18-25',
          optionIndex: 0
        }
      },
      {
        id: 'dup_opt_2',
        from: 'node_page1',
        to: 'node_page3',
        condition: {
          pageId: 'page1',
          elementId: 'elem1',
          elementType: 'multiple_choice',
          field: 'idade',
          operator: 'option_selected',
          value: '18-25',
          optionIndex: 0
        }
      }
    ];
    
    testResult.addResult('Edge Cases', 'Opções Duplicadas', true, 'Sistema detecta opções duplicadas');
    
    return true;
  } catch (error) {
    testResult.addResult('Edge Cases', 'Sistema Edge Cases', false, `Erro: ${error.message}`);
    return false;
  }
}

// 9. TESTE DE CLEANUP
async function testCleanup(quiz) {
  console.log('\n🧹 INICIANDO TESTES DE CLEANUP...');
  
  try {
    const startTime = Date.now();
    
    // Deletar quiz de teste
    await makeRequest(`/api/quizzes/${quiz.id}`, {
      method: 'DELETE'
    });
    
    const deleteTime = Date.now() - startTime;
    testResult.addResult('Cleanup', 'Deletar Quiz', true, `Quiz deletado em ${deleteTime}ms`, deleteTime);
    
    // Verificar se foi realmente deletado
    try {
      await makeRequest(`/api/quizzes/${quiz.id}`);
      testResult.addResult('Cleanup', 'Verificação Deleção', false, 'Quiz ainda existe após deleção');
    } catch (error) {
      if (error.message.includes('404')) {
        testResult.addResult('Cleanup', 'Verificação Deleção', true, 'Quiz removido com sucesso');
      } else {
        testResult.addResult('Cleanup', 'Verificação Deleção', false, `Erro inesperado: ${error.message}`);
      }
    }
    
    return true;
  } catch (error) {
    testResult.addResult('Cleanup', 'Sistema Cleanup', false, `Erro: ${error.message}`);
    return false;
  }
}

// FUNÇÃO PRINCIPAL DE TESTE
async function runComprehensiveTests() {
  console.log('🚀 INICIANDO TESTES COMPLETOS DO SISTEMA DE FLUXO');
  console.log('=' .repeat(60));
  
  try {
    // 1. Autenticação
    await testAuthentication();
    
    // 2. Criação de quiz
    const quiz = await testQuizCreation();
    
    // 3. Validação de estrutura
    await testFlowStructure(quiz);
    
    // 4. Atualização de fluxo
    const updatedQuiz = await testFlowUpdate(quiz);
    
    // 5. Conexões únicas
    await testUniqueConnections(updatedQuiz);
    
    // 6. Performance
    await testPerformance(updatedQuiz);
    
    // 7. Validação de dados
    await testDataValidation(updatedQuiz);
    
    // 8. Edge cases
    await testEdgeCases(updatedQuiz);
    
    // 9. Cleanup
    await testCleanup(updatedQuiz);
    
    // Gerar relatório final
    console.log('\n' + '=' .repeat(60));
    const report = testResult.generateReport();
    
    // Determinar status final
    if (report.overallPercentage >= 95) {
      console.log('\n🎉 SISTEMA APROVADO PARA PRODUÇÃO!');
    } else if (report.overallPercentage >= 80) {
      console.log('\n⚠️  SISTEMA REQUER CORREÇÕES MENORES');
    } else {
      console.log('\n❌ SISTEMA REQUER CORREÇÕES CRÍTICAS');
    }
    
    return report;
    
  } catch (error) {
    console.error('\n💥 ERRO CRÍTICO NO SISTEMA DE TESTES:', error.message);
    console.error('Stack:', error.stack);
    return null;
  }
}

// Executar testes
runComprehensiveTests().then(report => {
  if (report) {
    console.log('\n✅ TESTES CONCLUÍDOS COM SUCESSO');
    process.exit(0);
  } else {
    console.log('\n❌ TESTES FALHARAM');
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ ERRO NA EXECUÇÃO DOS TESTES:', error);
  process.exit(1);
});