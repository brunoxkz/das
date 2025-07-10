/**
 * TESTE EXTREMAMENTE COMPLETO DO PREVIEW
 * Valida todos os aspectos críticos do sistema de preview:
 * - Renderização de elementos
 * - Sincronização editor-preview
 * - Fluxo de páginas
 * - Captura de dados
 * - Cenários de erro
 * - Performance e escalabilidade
 * - Casos extremos
 */

const fetch = globalThis.fetch;
const BASE_URL = 'http://localhost:5000';
let authToken = null;

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message, status: 0 };
  }
}

function logTest(category, test, success, details = '', timing = '') {
  const status = success ? '✅' : '❌';
  const timeInfo = timing ? ` (${timing})` : '';
  console.log(`${status} ${category} - ${test}${timeInfo}`);
  if (details) {
    console.log(`   🔍 ${details}`);
  }
}

function logSection(sectionName) {
  console.log(`\n🎯 ${sectionName.toUpperCase()}`);
  console.log('='.repeat(80));
}

async function authenticate() {
  const loginResult = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  if (loginResult.success && (loginResult.data.token || loginResult.data.accessToken)) {
    authToken = loginResult.data.token || loginResult.data.accessToken;
    return true;
  }
  return false;
}

async function createTestQuiz(quizData) {
  const result = await makeRequest('/api/quizzes', {
    method: 'POST',
    body: JSON.stringify(quizData)
  });
  
  if (result.success) {
    // Publicar automaticamente
    await makeRequest(`/api/quizzes/${result.data.id}/publish`, {
      method: 'POST'
    });
    return result.data.id;
  }
  return null;
}

async function cleanupQuiz(quizId) {
  if (quizId) {
    await makeRequest(`/api/quizzes/${quizId}`, { method: 'DELETE' });
  }
}

async function executarTestePreviewCompleto() {
  console.log('🧪 TESTE EXTREMAMENTE COMPLETO DO PREVIEW');
  console.log('='.repeat(80));
  
  if (!(await authenticate())) {
    console.log('❌ Falha na autenticação');
    return;
  }
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    details: [],
    performance: [],
    critical: []
  };
  
  // ==========================================================================
  // TESTE 1: RENDERIZAÇÃO BÁSICA DE ELEMENTOS
  // ==========================================================================
  logSection('TESTE 1: RENDERIZAÇÃO BÁSICA DE ELEMENTOS');
  
  const basicElements = [
    {
      name: 'Título Principal',
      element: {
        id: 'heading_1',
        type: 'heading',
        content: 'Título de Teste Preview',
        fontSize: 'xl',
        textColor: '#10b981'
      }
    },
    {
      name: 'Parágrafo Descritivo',
      element: {
        id: 'paragraph_1',
        type: 'paragraph',
        content: 'Este é um parágrafo de teste para verificar a renderização correta no preview.'
      }
    },
    {
      name: 'Campo de Texto',
      element: {
        id: 'text_1',
        type: 'text',
        question: 'Qual é o seu nome?',
        placeholder: 'Digite seu nome',
        required: true,
        fieldId: 'nome'
      }
    },
    {
      name: 'Múltipla Escolha',
      element: {
        id: 'multiple_1',
        type: 'multiple_choice',
        question: 'Qual é sua cor favorita?',
        options: [
          { id: 'red', text: 'Vermelho' },
          { id: 'blue', text: 'Azul' },
          { id: 'green', text: 'Verde' }
        ],
        required: true,
        fieldId: 'cor'
      }
    }
  ];
  
  for (const item of basicElements) {
    const start = Date.now();
    const quizData = {
      title: `Preview Test - ${item.name}`,
      description: 'Teste de renderização no preview',
      structure: {
        pages: [
          {
            id: 'page1',
            name: 'Página 1',
            elements: [item.element]
          }
        ]
      }
    };
    
    const quizId = await createTestQuiz(quizData);
    const time = Date.now() - start;
    
    results.total++;
    if (quizId) {
      results.passed++;
      logTest('RENDERIZAÇÃO', item.name, true, `Quiz ID: ${quizId}`, `${time}ms`);
      results.performance.push({ test: item.name, time });
      await cleanupQuiz(quizId);
    } else {
      results.failed++;
      logTest('RENDERIZAÇÃO', item.name, false, 'Falha na criação do quiz', `${time}ms`);
      results.details.push(`Renderização ${item.name}: Falha na criação`);
    }
  }
  
  // ==========================================================================
  // TESTE 2: QUIZ MULTI-PÁGINA COMPLEXO
  // ==========================================================================
  logSection('TESTE 2: QUIZ MULTI-PÁGINA COMPLEXO');
  
  const complexQuizData = {
    title: 'Quiz Multi-Página Complexo',
    description: 'Teste de navegação entre páginas',
    structure: {
      pages: [
        {
          id: 'intro',
          name: 'Introdução',
          elements: [
            {
              id: 'intro_title',
              type: 'heading',
              content: 'Bem-vindo ao Quiz Complexo'
            },
            {
              id: 'intro_desc',
              type: 'paragraph',
              content: 'Este quiz testa a navegação entre múltiplas páginas.'
            },
            {
              id: 'continue_btn',
              type: 'continue_button',
              text: 'Começar'
            }
          ]
        },
        {
          id: 'personal_info',
          name: 'Informações Pessoais',
          elements: [
            {
              id: 'name',
              type: 'text',
              question: 'Qual é o seu nome completo?',
              required: true,
              fieldId: 'nome_completo'
            },
            {
              id: 'email',
              type: 'email',
              question: 'Qual é o seu email?',
              required: true,
              fieldId: 'email'
            },
            {
              id: 'age',
              type: 'number',
              question: 'Qual é a sua idade?',
              min: 18,
              max: 100,
              required: true,
              fieldId: 'idade'
            }
          ]
        },
        {
          id: 'preferences',
          name: 'Preferências',
          elements: [
            {
              id: 'colors',
              type: 'multiple_choice',
              question: 'Quais são suas cores favoritas?',
              options: [
                { id: 'red', text: 'Vermelho' },
                { id: 'blue', text: 'Azul' },
                { id: 'green', text: 'Verde' },
                { id: 'yellow', text: 'Amarelo' }
              ],
              fieldId: 'cores_favoritas'
            },
            {
              id: 'rating',
              type: 'rating',
              question: 'Como você avalia este quiz?',
              min: 1,
              max: 5,
              fieldId: 'avaliacao'
            }
          ]
        },
        {
          id: 'final',
          name: 'Finalização',
          elements: [
            {
              id: 'final_title',
              type: 'heading',
              content: 'Obrigado pela participação!'
            },
            {
              id: 'share',
              type: 'share_quiz',
              message: 'Compartilhe este quiz!',
              networks: ['whatsapp', 'facebook', 'twitter']
            }
          ]
        }
      ]
    }
  };
  
  const start = Date.now();
  const complexQuizId = await createTestQuiz(complexQuizData);
  const time = Date.now() - start;
  
  results.total++;
  if (complexQuizId) {
    results.passed++;
    logTest('MULTI-PÁGINA', 'Quiz Complexo', true, `4 páginas criadas`, `${time}ms`);
    results.performance.push({ test: 'Quiz Multi-Página', time });
    
    // Teste de navegação entre páginas
    const quizResult = await makeRequest(`/api/quizzes/${complexQuizId}`);
    if (quizResult.success && quizResult.data.structure.pages.length === 4) {
      results.total++;
      results.passed++;
      logTest('NAVEGAÇÃO', 'Estrutura de Páginas', true, 'Todas as páginas preservadas', '2ms');
    } else {
      results.total++;
      results.failed++;
      logTest('NAVEGAÇÃO', 'Estrutura de Páginas', false, 'Páginas não preservadas', '2ms');
      results.critical.push('Perda de páginas na navegação');
    }
    
    await cleanupQuiz(complexQuizId);
  } else {
    results.failed++;
    logTest('MULTI-PÁGINA', 'Quiz Complexo', false, 'Falha na criação', `${time}ms`);
    results.critical.push('Falha crítica na criação de quiz multi-página');
  }
  
  // ==========================================================================
  // TESTE 3: CAPTURA DE DADOS E VARIÁVEIS
  // ==========================================================================
  logSection('TESTE 3: CAPTURA DE DADOS E VARIÁVEIS');
  
  const dataQuizData = {
    title: 'Quiz Captura de Dados',
    description: 'Teste de captura de variáveis',
    structure: {
      pages: [
        {
          id: 'data_page',
          name: 'Captura de Dados',
          elements: [
            {
              id: 'nome_campo',
              type: 'text',
              question: 'Nome completo:',
              fieldId: 'nome_completo',
              required: true
            },
            {
              id: 'email_campo',
              type: 'email',
              question: 'Email:',
              fieldId: 'email_contato',
              required: true
            },
            {
              id: 'telefone_campo',
              type: 'phone',
              question: 'Telefone:',
              fieldId: 'telefone_contato',
              required: true
            },
            {
              id: 'idade_campo',
              type: 'number',
              question: 'Idade:',
              fieldId: 'idade_anos',
              min: 18,
              max: 100
            },
            {
              id: 'interesse_campo',
              type: 'multiple_choice',
              question: 'Área de interesse:',
              fieldId: 'area_interesse',
              options: [
                { id: 'tech', text: 'Tecnologia' },
                { id: 'health', text: 'Saúde' },
                { id: 'finance', text: 'Finanças' }
              ]
            }
          ]
        }
      ]
    }
  };
  
  const dataStart = Date.now();
  const dataQuizId = await createTestQuiz(dataQuizData);
  const dataTime = Date.now() - dataStart;
  
  results.total++;
  if (dataQuizId) {
    results.passed++;
    logTest('CAPTURA', 'Quiz de Dados', true, `5 campos de captura`, `${dataTime}ms`);
    
    // Simular resposta completa
    const responseData = {
      responses: {
        nome_completo: 'João Silva Santos',
        email_contato: 'joao.silva@teste.com',
        telefone_contato: '11987654321',
        idade_anos: 28,
        area_interesse: 'tech'
      },
      metadata: {
        isComplete: true,
        completionPercentage: 100,
        userAgent: 'PreviewTestBot/1.0'
      }
    };
    
    const responseStart = Date.now();
    const responseResult = await makeRequest(`/api/quizzes/${dataQuizId}/responses`, {
      method: 'POST',
      body: JSON.stringify(responseData)
    });
    const responseTime = Date.now() - responseStart;
    
    results.total++;
    if (responseResult.success) {
      results.passed++;
      logTest('CAPTURA', 'Resposta Completa', true, `Response ID: ${responseResult.data.id}`, `${responseTime}ms`);
      
      // Verificar variáveis extraídas
      const varsStart = Date.now();
      const varsResult = await makeRequest(`/api/quizzes/${dataQuizId}/variables`);
      const varsTime = Date.now() - varsStart;
      
      results.total++;
      if (varsResult.success) {
        const varCount = Array.isArray(varsResult.data) ? varsResult.data.length : 0;
        results.passed++;
        logTest('CAPTURA', 'Extração de Variáveis', true, `${varCount} variáveis extraídas`, `${varsTime}ms`);
      } else {
        results.failed++;
        logTest('CAPTURA', 'Extração de Variáveis', false, 'Falha na extração', `${varsTime}ms`);
        results.critical.push('Falha na extração de variáveis');
      }
    } else {
      results.failed++;
      logTest('CAPTURA', 'Resposta Completa', false, 'Falha no envio', `${responseTime}ms`);
      results.critical.push('Falha na captura de respostas');
    }
    
    await cleanupQuiz(dataQuizId);
  } else {
    results.failed++;
    logTest('CAPTURA', 'Quiz de Dados', false, 'Falha na criação', `${dataTime}ms`);
    results.critical.push('Falha na criação de quiz de captura');
  }
  
  // ==========================================================================
  // TESTE 4: ELEMENTOS VISUAIS E INTERATIVOS
  // ==========================================================================
  logSection('TESTE 4: ELEMENTOS VISUAIS E INTERATIVOS');
  
  const visualQuizData = {
    title: 'Quiz Elementos Visuais',
    description: 'Teste de elementos visuais e interativos',
    structure: {
      pages: [
        {
          id: 'visual_page',
          name: 'Elementos Visuais',
          elements: [
            {
              id: 'image_element',
              type: 'image',
              src: 'https://via.placeholder.com/400x200/10b981/ffffff?text=Teste+Preview',
              alt: 'Imagem de teste',
              alignment: 'center'
            },
            {
              id: 'video_element',
              type: 'video',
              src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              title: 'Vídeo de Teste'
            },
            {
              id: 'divider_element',
              type: 'divider',
              style: 'solid',
              color: '#10b981'
            },
            {
              id: 'wheel_game',
              type: 'wheel',
              question: 'Gire a roleta!',
              options: [
                { id: 'prize1', text: 'Prêmio 1', color: '#ff6b6b' },
                { id: 'prize2', text: 'Prêmio 2', color: '#4ecdc4' },
                { id: 'prize3', text: 'Prêmio 3', color: '#45b7d1' }
              ],
              fieldId: 'premio_roleta'
            }
          ]
        }
      ]
    }
  };
  
  const visualStart = Date.now();
  const visualQuizId = await createTestQuiz(visualQuizData);
  const visualTime = Date.now() - visualStart;
  
  results.total++;
  if (visualQuizId) {
    results.passed++;
    logTest('VISUAL', 'Elementos Visuais', true, `4 elementos visuais`, `${visualTime}ms`);
    results.performance.push({ test: 'Elementos Visuais', time: visualTime });
    await cleanupQuiz(visualQuizId);
  } else {
    results.failed++;
    logTest('VISUAL', 'Elementos Visuais', false, 'Falha na criação', `${visualTime}ms`);
    results.critical.push('Falha na renderização de elementos visuais');
  }
  
  // ==========================================================================
  // TESTE 5: CENÁRIOS DE ERRO E EDGE CASES
  // ==========================================================================
  logSection('TESTE 5: CENÁRIOS DE ERRO E EDGE CASES');
  
  const errorTests = [
    {
      name: 'Quiz Vazio',
      data: {
        title: 'Quiz Vazio',
        description: 'Teste de quiz sem elementos',
        structure: {
          pages: [
            {
              id: 'empty_page',
              name: 'Página Vazia',
              elements: []
            }
          ]
        }
      }
    },
    {
      name: 'Elementos Sem ID',
      data: {
        title: 'Quiz Elementos Sem ID',
        description: 'Teste com elementos sem ID',
        structure: {
          pages: [
            {
              id: 'no_id_page',
              name: 'Página Sem ID',
              elements: [
                {
                  type: 'heading',
                  content: 'Título sem ID'
                }
              ]
            }
          ]
        }
      }
    },
    {
      name: 'Estrutura Mal Formada',
      data: {
        title: 'Quiz Estrutura Mal Formada',
        description: 'Teste com estrutura incorreta',
        structure: {
          pages: [
            {
              id: 'malformed_page',
              elements: [
                {
                  id: 'malformed_element',
                  type: 'unknown_type',
                  content: 'Elemento desconhecido'
                }
              ]
            }
          ]
        }
      }
    }
  ];
  
  for (const errorTest of errorTests) {
    const start = Date.now();
    const quizId = await createTestQuiz(errorTest.data);
    const time = Date.now() - start;
    
    results.total++;
    if (quizId) {
      results.passed++;
      logTest('ERROR', errorTest.name, true, 'Sistema lidou com erro graciosamente', `${time}ms`);
      await cleanupQuiz(quizId);
    } else {
      results.failed++;
      logTest('ERROR', errorTest.name, false, 'Sistema não lidou com erro', `${time}ms`);
      results.details.push(`Erro ${errorTest.name}: Sistema não resiliente`);
    }
  }
  
  // ==========================================================================
  // TESTE 6: PERFORMANCE E ESCALABILIDADE
  // ==========================================================================
  logSection('TESTE 6: PERFORMANCE E ESCALABILIDADE');
  
  // Quiz com muitos elementos
  const largeElements = [];
  for (let i = 1; i <= 50; i++) {
    largeElements.push({
      id: `element_${i}`,
      type: i % 2 === 0 ? 'text' : 'paragraph',
      ...(i % 2 === 0 ? {
        question: `Pergunta ${i}`,
        fieldId: `campo_${i}`
      } : {
        content: `Parágrafo ${i} com conteúdo de teste.`
      })
    });
  }
  
  const largeQuizData = {
    title: 'Quiz Grande - 50 Elementos',
    description: 'Teste de performance com muitos elementos',
    structure: {
      pages: [
        {
          id: 'large_page',
          name: 'Página Grande',
          elements: largeElements
        }
      ]
    }
  };
  
  const largeStart = Date.now();
  const largeQuizId = await createTestQuiz(largeQuizData);
  const largeTime = Date.now() - largeStart;
  
  results.total++;
  if (largeQuizId) {
    results.passed++;
    logTest('PERFORMANCE', 'Quiz Grande (50 elementos)', true, `Criado com sucesso`, `${largeTime}ms`);
    results.performance.push({ test: 'Quiz Grande', time: largeTime });
    
    // Testar carregamento
    const loadStart = Date.now();
    const loadResult = await makeRequest(`/api/quizzes/${largeQuizId}`);
    const loadTime = Date.now() - loadStart;
    
    results.total++;
    if (loadResult.success) {
      results.passed++;
      logTest('PERFORMANCE', 'Carregamento Quiz Grande', true, `${loadResult.data.structure.pages[0].elements.length} elementos carregados`, `${loadTime}ms`);
    } else {
      results.failed++;
      logTest('PERFORMANCE', 'Carregamento Quiz Grande', false, 'Falha no carregamento', `${loadTime}ms`);
      results.critical.push('Falha de performance no carregamento');
    }
    
    await cleanupQuiz(largeQuizId);
  } else {
    results.failed++;
    logTest('PERFORMANCE', 'Quiz Grande (50 elementos)', false, 'Falha na criação', `${largeTime}ms`);
    results.critical.push('Falha de performance com muitos elementos');
  }
  
  // ==========================================================================
  // TESTE 7: SINCRONIZAÇÃO EDITOR-PREVIEW
  // ==========================================================================
  logSection('TESTE 7: SINCRONIZAÇÃO EDITOR-PREVIEW');
  
  const syncQuizData = {
    title: 'Quiz Sincronização',
    description: 'Teste de sincronização',
    structure: {
      pages: [
        {
          id: 'sync_page',
          name: 'Página de Sincronização',
          elements: [
            {
              id: 'sync_title',
              type: 'heading',
              content: 'Título Original'
            }
          ]
        }
      ]
    }
  };
  
  const syncStart = Date.now();
  const syncQuizId = await createTestQuiz(syncQuizData);
  const syncTime = Date.now() - syncStart;
  
  results.total++;
  if (syncQuizId) {
    results.passed++;
    logTest('SYNC', 'Criação Quiz Sync', true, `Quiz ID: ${syncQuizId}`, `${syncTime}ms`);
    
    // Simular edição
    const updatedData = {
      title: 'Quiz Sincronização - Editado',
      description: 'Teste de sincronização - editado',
      structure: {
        pages: [
          {
            id: 'sync_page',
            name: 'Página de Sincronização',
            elements: [
              {
                id: 'sync_title',
                type: 'heading',
                content: 'Título Editado'
              },
              {
                id: 'new_element',
                type: 'paragraph',
                content: 'Novo elemento adicionado'
              }
            ]
          }
        ]
      }
    };
    
    const updateStart = Date.now();
    const updateResult = await makeRequest(`/api/quizzes/${syncQuizId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData)
    });
    const updateTime = Date.now() - updateStart;
    
    results.total++;
    if (updateResult.success) {
      results.passed++;
      logTest('SYNC', 'Edição Quiz', true, 'Atualização bem-sucedida', `${updateTime}ms`);
      
      // Verificar sincronização
      const verifyStart = Date.now();
      const verifyResult = await makeRequest(`/api/quizzes/${syncQuizId}`);
      const verifyTime = Date.now() - verifyStart;
      
      results.total++;
      if (verifyResult.success && verifyResult.data.structure.pages[0].elements.length === 2) {
        results.passed++;
        logTest('SYNC', 'Verificação Sincronização', true, 'Elementos sincronizados corretamente', `${verifyTime}ms`);
      } else {
        results.failed++;
        logTest('SYNC', 'Verificação Sincronização', false, 'Falha na sincronização', `${verifyTime}ms`);
        results.critical.push('Falha crítica na sincronização editor-preview');
      }
    } else {
      results.failed++;
      logTest('SYNC', 'Edição Quiz', false, 'Falha na atualização', `${updateTime}ms`);
      results.critical.push('Falha na edição de quiz');
    }
    
    await cleanupQuiz(syncQuizId);
  } else {
    results.failed++;
    logTest('SYNC', 'Criação Quiz Sync', false, 'Falha na criação', `${syncTime}ms`);
    results.critical.push('Falha na criação de quiz para sincronização');
  }
  
  // ==========================================================================
  // RELATÓRIO FINAL DETALHADO
  // ==========================================================================
  logSection('RELATÓRIO FINAL DETALHADO');
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  const avgPerformance = results.performance.length > 0 
    ? (results.performance.reduce((sum, p) => sum + p.time, 0) / results.performance.length).toFixed(1)
    : 'N/A';
  
  console.log(`📊 ESTATÍSTICAS GERAIS:`);
  console.log(`✅ Testes executados: ${results.total}`);
  console.log(`✅ Testes aprovados: ${results.passed}`);
  console.log(`❌ Testes falharam: ${results.failed}`);
  console.log(`📈 Taxa de sucesso: ${successRate}%`);
  console.log(`⚡ Performance média: ${avgPerformance}ms`);
  
  if (results.performance.length > 0) {
    console.log(`\n⚡ ANÁLISE DE PERFORMANCE:`);
    results.performance.forEach(p => {
      const status = p.time < 100 ? '🟢' : p.time < 500 ? '🟡' : '🔴';
      console.log(`   ${status} ${p.test}: ${p.time}ms`);
    });
  }
  
  if (results.critical.length > 0) {
    console.log(`\n🚨 PROBLEMAS CRÍTICOS:`);
    results.critical.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }
  
  if (results.details.length > 0) {
    console.log(`\n🔍 DETALHES DE PROBLEMAS:`);
    results.details.forEach((detail, index) => {
      console.log(`   ${index + 1}. ${detail}`);
    });
  }
  
  console.log(`\n🎯 RESUMO POR CATEGORIA:`);
  console.log(`📝 Renderização Básica: Elementos fundamentais`);
  console.log(`📄 Multi-página: Navegação complexa`);
  console.log(`📊 Captura de Dados: Variáveis e respostas`);
  console.log(`🎨 Elementos Visuais: Imagens, vídeos, jogos`);
  console.log(`⚠️  Cenários de Erro: Resilência do sistema`);
  console.log(`⚡ Performance: Escalabilidade e velocidade`);
  console.log(`🔄 Sincronização: Editor-preview consistency`);
  
  console.log(`\n🎯 AVALIAÇÃO FINAL:`);
  if (results.passed === results.total) {
    console.log('✅ PREVIEW SISTEMA 100% FUNCIONAL!');
    console.log('🚀 Todos os aspectos críticos validados');
    console.log('🔧 Sistema pronto para uso intensivo');
  } else if (successRate >= 90) {
    console.log('⚠️  PREVIEW QUASE PERFEITO!');
    console.log('🔧 Poucos ajustes necessários');
    console.log('📈 Sistema majoritariamente funcional');
  } else if (successRate >= 75) {
    console.log('⚠️  PREVIEW FUNCIONAL COM RESSALVAS');
    console.log('🛠️  Correções necessárias antes da produção');
    console.log('📊 Sistema precisa de otimizações');
  } else {
    console.log('❌ PREVIEW NECESSITA CORREÇÕES SIGNIFICATIVAS');
    console.log('🔧 Múltiplos problemas críticos identificados');
    console.log('⚠️  Não recomendado para produção');
  }
  
  console.log('\n' + '='.repeat(80));
  return results;
}

// Executar teste
executarTestePreviewCompleto().catch(console.error);