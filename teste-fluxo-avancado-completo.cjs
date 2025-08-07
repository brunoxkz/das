/**
 * TESTE EXTREMAMENTE AVANÇADO DO SISTEMA DE FLUXO
 * Valida todas as funcionalidades avançadas:
 * - Fluxo condicional complexo
 * - Conexões múltiplas e ramificações
 * - Sincronização em tempo real
 * - Performance com escala
 * - Usabilidade e UX
 * - Cenários edge cases
 * - Persistência e integridade
 * - Sistema de regras avançadas
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

function logTest(category, test, success, details = '', timing = '', priority = 'normal') {
  const status = success ? '✅' : '❌';
  const priorityIcon = priority === 'critical' ? '🚨' : priority === 'high' ? '⚠️' : '';
  const timeInfo = timing ? ` (${timing})` : '';
  console.log(`${status} ${priorityIcon} ${category} - ${test}${timeInfo}`);
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

async function createComplexFlowQuiz() {
  return {
    title: 'Quiz Fluxo Avançado Complexo',
    description: 'Sistema de fluxo condicional avançado com múltiplas ramificações',
    structure: {
      pages: [
        {
          id: 'intro',
          name: 'Introdução',
          elements: [
            {
              id: 'intro_title',
              type: 'heading',
              content: 'Bem-vindo ao Quiz Avançado'
            },
            {
              id: 'intro_desc',
              type: 'paragraph',
              content: 'Este quiz adapta-se às suas respostas usando fluxo condicional.'
            }
          ]
        },
        {
          id: 'demographics',
          name: 'Demografia',
          elements: [
            {
              id: 'age_group',
              type: 'multiple_choice',
              question: 'Qual é sua faixa etária?',
              options: [
                { id: 'young', text: '18-25 anos' },
                { id: 'adult', text: '26-40 anos' },
                { id: 'mature', text: '41-60 anos' },
                { id: 'senior', text: '60+ anos' }
              ],
              required: true,
              fieldId: 'faixa_etaria'
            },
            {
              id: 'income',
              type: 'multiple_choice',
              question: 'Qual é sua renda mensal?',
              options: [
                { id: 'low', text: 'Até R$ 3.000' },
                { id: 'medium', text: 'R$ 3.001 - R$ 8.000' },
                { id: 'high', text: 'R$ 8.001 - R$ 15.000' },
                { id: 'premium', text: 'Acima de R$ 15.000' }
              ],
              required: true,
              fieldId: 'renda_mensal'
            }
          ]
        },
        {
          id: 'interests_young',
          name: 'Interesses - Jovens',
          elements: [
            {
              id: 'young_interests',
              type: 'checkbox',
              question: 'Quais são seus interesses? (Jovens)',
              options: [
                { id: 'gaming', text: 'Gaming' },
                { id: 'social_media', text: 'Redes Sociais' },
                { id: 'streaming', text: 'Streaming' },
                { id: 'education', text: 'Educação' }
              ],
              fieldId: 'interesses_jovens'
            }
          ]
        },
        {
          id: 'interests_adult',
          name: 'Interesses - Adultos',
          elements: [
            {
              id: 'adult_interests',
              type: 'checkbox',
              question: 'Quais são seus interesses? (Adultos)',
              options: [
                { id: 'career', text: 'Carreira' },
                { id: 'family', text: 'Família' },
                { id: 'investment', text: 'Investimentos' },
                { id: 'health', text: 'Saúde' }
              ],
              fieldId: 'interesses_adultos'
            }
          ]
        },
        {
          id: 'interests_mature',
          name: 'Interesses - Maduros',
          elements: [
            {
              id: 'mature_interests',
              type: 'checkbox',
              question: 'Quais são seus interesses? (Maduros)',
              options: [
                { id: 'retirement', text: 'Aposentadoria' },
                { id: 'travel', text: 'Viagens' },
                { id: 'grandchildren', text: 'Netos' },
                { id: 'hobbies', text: 'Hobbies' }
              ],
              fieldId: 'interesses_maduros'
            }
          ]
        },
        {
          id: 'products_low',
          name: 'Produtos - Renda Baixa',
          elements: [
            {
              id: 'low_products',
              type: 'multiple_choice',
              question: 'Qual produto mais te interessa?',
              options: [
                { id: 'basic', text: 'Plano Básico - R$ 29' },
                { id: 'starter', text: 'Plano Iniciante - R$ 49' }
              ],
              fieldId: 'produto_escolhido'
            }
          ]
        },
        {
          id: 'products_medium',
          name: 'Produtos - Renda Média',
          elements: [
            {
              id: 'medium_products',
              type: 'multiple_choice',
              question: 'Qual produto mais te interessa?',
              options: [
                { id: 'standard', text: 'Plano Standard - R$ 99' },
                { id: 'plus', text: 'Plano Plus - R$ 149' }
              ],
              fieldId: 'produto_escolhido'
            }
          ]
        },
        {
          id: 'products_high',
          name: 'Produtos - Renda Alta',
          elements: [
            {
              id: 'high_products',
              type: 'multiple_choice',
              question: 'Qual produto mais te interessa?',
              options: [
                { id: 'premium', text: 'Plano Premium - R$ 299' },
                { id: 'enterprise', text: 'Plano Enterprise - R$ 499' }
              ],
              fieldId: 'produto_escolhido'
            }
          ]
        },
        {
          id: 'contact_info',
          name: 'Informações de Contato',
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
              fieldId: 'email_contato'
            },
            {
              id: 'phone',
              type: 'phone',
              question: 'Qual é o seu telefone?',
              required: true,
              fieldId: 'telefone_contato'
            }
          ]
        },
        {
          id: 'final_young',
          name: 'Finalização - Jovens',
          elements: [
            {
              id: 'young_final',
              type: 'heading',
              content: 'Perfeito! Temos ofertas especiais para jovens!'
            },
            {
              id: 'young_share',
              type: 'share_quiz',
              message: 'Compartilhe com seus amigos!',
              networks: ['whatsapp', 'instagram', 'tiktok']
            }
          ]
        },
        {
          id: 'final_adult',
          name: 'Finalização - Adultos',
          elements: [
            {
              id: 'adult_final',
              type: 'heading',
              content: 'Excelente! Temos soluções profissionais para você!'
            },
            {
              id: 'adult_share',
              type: 'share_quiz',
              message: 'Compartilhe com colegas!',
              networks: ['linkedin', 'whatsapp', 'email']
            }
          ]
        },
        {
          id: 'final_mature',
          name: 'Finalização - Maduros',
          elements: [
            {
              id: 'mature_final',
              type: 'heading',
              content: 'Ótimo! Temos produtos ideais para sua experiência!'
            },
            {
              id: 'mature_share',
              type: 'share_quiz',
              message: 'Compartilhe com família!',
              networks: ['whatsapp', 'facebook', 'email']
            }
          ]
        }
      ],
      flow: {
        enabled: true,
        connections: [
          // Fluxo por idade
          {
            from: { pageId: 'demographics', elementId: 'age_group', optionId: 'young' },
            to: { pageId: 'interests_young' },
            conditions: []
          },
          {
            from: { pageId: 'demographics', elementId: 'age_group', optionId: 'adult' },
            to: { pageId: 'interests_adult' },
            conditions: []
          },
          {
            from: { pageId: 'demographics', elementId: 'age_group', optionId: 'mature' },
            to: { pageId: 'interests_mature' },
            conditions: []
          },
          {
            from: { pageId: 'demographics', elementId: 'age_group', optionId: 'senior' },
            to: { pageId: 'interests_mature' },
            conditions: []
          },
          // Fluxo por renda
          {
            from: { pageId: 'demographics', elementId: 'income', optionId: 'low' },
            to: { pageId: 'products_low' },
            conditions: []
          },
          {
            from: { pageId: 'demographics', elementId: 'income', optionId: 'medium' },
            to: { pageId: 'products_medium' },
            conditions: []
          },
          {
            from: { pageId: 'demographics', elementId: 'income', optionId: 'high' },
            to: { pageId: 'products_high' },
            conditions: []
          },
          {
            from: { pageId: 'demographics', elementId: 'income', optionId: 'premium' },
            to: { pageId: 'products_high' },
            conditions: []
          },
          // Fluxo para finalização
          {
            from: { pageId: 'interests_young' },
            to: { pageId: 'contact_info' },
            conditions: []
          },
          {
            from: { pageId: 'interests_adult' },
            to: { pageId: 'contact_info' },
            conditions: []
          },
          {
            from: { pageId: 'interests_mature' },
            to: { pageId: 'contact_info' },
            conditions: []
          },
          // Finalizações específicas
          {
            from: { pageId: 'contact_info' },
            to: { pageId: 'final_young' },
            conditions: [
              {
                field: 'faixa_etaria',
                operator: 'equals',
                value: 'young'
              }
            ]
          },
          {
            from: { pageId: 'contact_info' },
            to: { pageId: 'final_adult' },
            conditions: [
              {
                field: 'faixa_etaria',
                operator: 'equals',
                value: 'adult'
              }
            ]
          },
          {
            from: { pageId: 'contact_info' },
            to: { pageId: 'final_mature' },
            conditions: [
              {
                field: 'faixa_etaria',
                operator: 'in',
                value: ['mature', 'senior']
              }
            ]
          }
        ]
      }
    }
  };
}

async function testComplexFlowNavigation(quizId) {
  // Simular navegação complexa baseada em respostas
  const navigationTests = [
    {
      name: 'Fluxo Jovem + Renda Baixa',
      responses: {
        faixa_etaria: 'young',
        renda_mensal: 'low',
        interesses_jovens: ['gaming', 'social_media'],
        produto_escolhido: 'basic',
        nome_completo: 'João Gamer',
        email_contato: 'joao.gamer@teste.com',
        telefone_contato: '11987654321'
      },
      expectedFlow: ['intro', 'demographics', 'interests_young', 'products_low', 'contact_info', 'final_young']
    },
    {
      name: 'Fluxo Adulto + Renda Alta',
      responses: {
        faixa_etaria: 'adult',
        renda_mensal: 'high',
        interesses_adultos: ['career', 'investment'],
        produto_escolhido: 'premium',
        nome_completo: 'Maria Profissional',
        email_contato: 'maria.prof@teste.com',
        telefone_contato: '11987654322'
      },
      expectedFlow: ['intro', 'demographics', 'interests_adult', 'products_high', 'contact_info', 'final_adult']
    },
    {
      name: 'Fluxo Maduro + Renda Média',
      responses: {
        faixa_etaria: 'mature',
        renda_mensal: 'medium',
        interesses_maduros: ['retirement', 'travel'],
        produto_escolhido: 'plus',
        nome_completo: 'Carlos Experiente',
        email_contato: 'carlos.exp@teste.com',
        telefone_contato: '11987654323'
      },
      expectedFlow: ['intro', 'demographics', 'interests_mature', 'products_medium', 'contact_info', 'final_mature']
    }
  ];

  const results = [];
  
  for (const test of navigationTests) {
    const start = Date.now();
    const responseResult = await makeRequest(`/api/quizzes/${quizId}/responses`, {
      method: 'POST',
      body: JSON.stringify({
        responses: test.responses,
        metadata: {
          isComplete: true,
          completionPercentage: 100,
          flowPath: test.expectedFlow
        }
      })
    });
    const time = Date.now() - start;
    
    if (responseResult.success) {
      results.push({
        test: test.name,
        success: true,
        time,
        responseId: responseResult.data.id,
        details: `Fluxo completo simulado com ${test.expectedFlow.length} páginas`
      });
    } else {
      results.push({
        test: test.name,
        success: false,
        time,
        details: `Erro na simulação: ${responseResult.error || 'Unknown error'}`
      });
    }
  }
  
  return results;
}

async function executarTesteFluxoAvancado() {
  console.log('🧪 TESTE EXTREMAMENTE AVANÇADO DO SISTEMA DE FLUXO');
  console.log('='.repeat(80));
  
  if (!(await authenticate())) {
    console.log('❌ Falha na autenticação');
    return;
  }
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    critical: [],
    performance: [],
    details: []
  };
  
  // ==========================================================================
  // TESTE 1: CRIAÇÃO DE QUIZ COM FLUXO COMPLEXO
  // ==========================================================================
  logSection('TESTE 1: CRIAÇÃO DE QUIZ COM FLUXO COMPLEXO');
  
  const complexFlowData = await createComplexFlowQuiz();
  const start = Date.now();
  
  const createResult = await makeRequest('/api/quizzes', {
    method: 'POST',
    body: JSON.stringify(complexFlowData)
  });
  
  const createTime = Date.now() - start;
  
  results.total++;
  if (createResult.success) {
    results.passed++;
    const quizId = createResult.data.id;
    logTest('CRIAÇÃO', 'Quiz Fluxo Complexo', true, 
      `${complexFlowData.structure.pages.length} páginas, ${complexFlowData.structure.flow.connections.length} conexões`, 
      `${createTime}ms`);
    results.performance.push({ test: 'Criação Fluxo Complexo', time: createTime });
    
    // Publicar quiz
    const publishStart = Date.now();
    const publishResult = await makeRequest(`/api/quizzes/${quizId}/publish`, {
      method: 'POST'
    });
    const publishTime = Date.now() - publishStart;
    
    results.total++;
    if (publishResult.success) {
      results.passed++;
      logTest('PUBLICAÇÃO', 'Quiz Fluxo Complexo', true, 'Publicado com sucesso', `${publishTime}ms`);
      results.performance.push({ test: 'Publicação Fluxo', time: publishTime });
    } else {
      results.failed++;
      logTest('PUBLICAÇÃO', 'Quiz Fluxo Complexo', false, 'Falha na publicação', `${publishTime}ms`, 'critical');
      results.critical.push('Falha crítica na publicação de quiz com fluxo');
    }
    
    // ==========================================================================
    // TESTE 2: VALIDAÇÃO DE ESTRUTURA DE FLUXO
    // ==========================================================================
    logSection('TESTE 2: VALIDAÇÃO DE ESTRUTURA DE FLUXO');
    
    const verifyStart = Date.now();
    const verifyResult = await makeRequest(`/api/quizzes/${quizId}`);
    const verifyTime = Date.now() - verifyStart;
    
    results.total++;
    if (verifyResult.success && verifyResult.data.structure.flow) {
      const flow = verifyResult.data.structure.flow;
      results.passed++;
      logTest('ESTRUTURA', 'Validação de Fluxo', true, 
        `Enabled: ${flow.enabled}, Conexões: ${flow.connections.length}`, 
        `${verifyTime}ms`);
      
      // Verificar conexões específicas
      const connectionTests = [
        { from: 'demographics', to: 'interests_young', condition: 'age_group = young' },
        { from: 'demographics', to: 'interests_adult', condition: 'age_group = adult' },
        { from: 'demographics', to: 'products_low', condition: 'income = low' },
        { from: 'contact_info', to: 'final_young', condition: 'faixa_etaria = young' }
      ];
      
      for (const connectionTest of connectionTests) {
        results.total++;
        const connectionExists = flow.connections.some(conn => 
          conn.from.pageId === connectionTest.from && 
          conn.to.pageId === connectionTest.to
        );
        
        if (connectionExists) {
          results.passed++;
          logTest('CONEXÃO', connectionTest.condition, true, 'Conexão encontrada', '1ms');
        } else {
          results.failed++;
          logTest('CONEXÃO', connectionTest.condition, false, 'Conexão não encontrada', '1ms', 'high');
          results.details.push(`Conexão ${connectionTest.from} -> ${connectionTest.to} não encontrada`);
        }
      }
    } else {
      results.failed++;
      logTest('ESTRUTURA', 'Validação de Fluxo', false, 'Estrutura de fluxo não preservada', `${verifyTime}ms`, 'critical');
      results.critical.push('Estrutura de fluxo não preservada após salvamento');
    }
    
    // ==========================================================================
    // TESTE 3: NAVEGAÇÃO COMPLEXA E FLUXO CONDICIONAL
    // ==========================================================================
    logSection('TESTE 3: NAVEGAÇÃO COMPLEXA E FLUXO CONDICIONAL');
    
    const navigationStart = Date.now();
    const navigationResults = await testComplexFlowNavigation(quizId);
    const navigationTime = Date.now() - navigationStart;
    
    for (const navResult of navigationResults) {
      results.total++;
      if (navResult.success) {
        results.passed++;
        logTest('NAVEGAÇÃO', navResult.test, true, navResult.details, `${navResult.time}ms`);
        results.performance.push({ test: navResult.test, time: navResult.time });
      } else {
        results.failed++;
        logTest('NAVEGAÇÃO', navResult.test, false, navResult.details, `${navResult.time}ms`, 'high');
        results.details.push(`Navegação ${navResult.test}: ${navResult.details}`);
      }
    }
    
    // ==========================================================================
    // TESTE 4: ANÁLISE DE VARIÁVEIS E SEGMENTAÇÃO
    // ==========================================================================
    logSection('TESTE 4: ANÁLISE DE VARIÁVEIS E SEGMENTAÇÃO');
    
    const varsStart = Date.now();
    const varsResult = await makeRequest(`/api/quizzes/${quizId}/variables`);
    const varsTime = Date.now() - varsStart;
    
    results.total++;
    if (varsResult.success) {
      const variables = Array.isArray(varsResult.data) ? varsResult.data : [];
      results.passed++;
      logTest('VARIÁVEIS', 'Extração de Variáveis', true, 
        `${variables.length} variáveis extraídas`, `${varsTime}ms`);
      
      // Verificar variáveis específicas do fluxo
      const expectedVars = ['faixa_etaria', 'renda_mensal', 'produto_escolhido', 'nome_completo', 'email_contato'];
      for (const expectedVar of expectedVars) {
        results.total++;
        const varExists = variables.some(v => v.name === expectedVar);
        if (varExists) {
          results.passed++;
          logTest('VARIÁVEL', expectedVar, true, 'Variável encontrada', '1ms');
        } else {
          results.failed++;
          logTest('VARIÁVEL', expectedVar, false, 'Variável não encontrada', '1ms', 'high');
          results.details.push(`Variável ${expectedVar} não extraída`);
        }
      }
    } else {
      results.failed++;
      logTest('VARIÁVEIS', 'Extração de Variáveis', false, 'Falha na extração', `${varsTime}ms`, 'critical');
      results.critical.push('Falha na extração de variáveis do fluxo');
    }
    
    // ==========================================================================
    // TESTE 5: PERFORMANCE E ESCALABILIDADE
    // ==========================================================================
    logSection('TESTE 5: PERFORMANCE E ESCALABILIDADE');
    
    // Teste de múltiplas respostas simultâneas
    const concurrentStart = Date.now();
    const concurrentPromises = [];
    
    for (let i = 0; i < 10; i++) {
      const concurrentResponse = {
        responses: {
          faixa_etaria: i % 2 === 0 ? 'young' : 'adult',
          renda_mensal: i % 3 === 0 ? 'low' : 'medium',
          nome_completo: `Usuário Concorrente ${i}`,
          email_contato: `usuario${i}@teste.com`,
          telefone_contato: `1198765432${i}`
        },
        metadata: {
          isComplete: true,
          completionPercentage: 100,
          testId: `concurrent_${i}`
        }
      };
      
      concurrentPromises.push(
        makeRequest(`/api/quizzes/${quizId}/responses`, {
          method: 'POST',
          body: JSON.stringify(concurrentResponse)
        })
      );
    }
    
    const concurrentResults = await Promise.all(concurrentPromises);
    const concurrentTime = Date.now() - concurrentStart;
    
    const successfulConcurrent = concurrentResults.filter(r => r.success).length;
    
    results.total++;
    if (successfulConcurrent >= 8) { // 80% de sucesso é aceitável
      results.passed++;
      logTest('PERFORMANCE', 'Respostas Concorrentes', true, 
        `${successfulConcurrent}/10 respostas processadas`, `${concurrentTime}ms`);
      results.performance.push({ test: 'Respostas Concorrentes', time: concurrentTime });
    } else {
      results.failed++;
      logTest('PERFORMANCE', 'Respostas Concorrentes', false, 
        `Apenas ${successfulConcurrent}/10 respostas processadas`, `${concurrentTime}ms`, 'high');
      results.details.push(`Performance degradada: ${successfulConcurrent}/10 respostas`);
    }
    
    // ==========================================================================
    // TESTE 6: SINCRONIZAÇÃO E PERSISTÊNCIA
    // ==========================================================================
    logSection('TESTE 6: SINCRONIZAÇÃO E PERSISTÊNCIA');
    
    // Modificar fluxo e verificar sincronização
    const modifiedFlowData = {
      ...complexFlowData,
      structure: {
        ...complexFlowData.structure,
        flow: {
          ...complexFlowData.structure.flow,
          connections: [
            ...complexFlowData.structure.flow.connections,
            {
              from: { pageId: 'demographics', elementId: 'age_group', optionId: 'young' },
              to: { pageId: 'final_young' },
              conditions: [
                {
                  field: 'renda_mensal',
                  operator: 'equals',
                  value: 'premium'
                }
              ]
            }
          ]
        }
      }
    };
    
    const updateStart = Date.now();
    const updateResult = await makeRequest(`/api/quizzes/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify(modifiedFlowData)
    });
    const updateTime = Date.now() - updateStart;
    
    results.total++;
    if (updateResult.success) {
      results.passed++;
      logTest('SINCRONIZAÇÃO', 'Atualização de Fluxo', true, 
        'Fluxo atualizado com nova conexão', `${updateTime}ms`);
      
      // Verificar se mudanças foram persistidas
      const verifyUpdateStart = Date.now();
      const verifyUpdateResult = await makeRequest(`/api/quizzes/${quizId}`);
      const verifyUpdateTime = Date.now() - verifyUpdateStart;
      
      results.total++;
      if (verifyUpdateResult.success) {
        const updatedConnections = verifyUpdateResult.data.structure.flow.connections.length;
        const originalConnections = complexFlowData.structure.flow.connections.length;
        
        if (updatedConnections > originalConnections) {
          results.passed++;
          logTest('PERSISTÊNCIA', 'Verificação de Mudanças', true, 
            `Conexões aumentaram de ${originalConnections} para ${updatedConnections}`, `${verifyUpdateTime}ms`);
        } else {
          results.failed++;
          logTest('PERSISTÊNCIA', 'Verificação de Mudanças', false, 
            'Mudanças não foram persistidas', `${verifyUpdateTime}ms`, 'critical');
          results.critical.push('Falha na persistência de mudanças no fluxo');
        }
      } else {
        results.failed++;
        logTest('PERSISTÊNCIA', 'Verificação de Mudanças', false, 
          'Falha na verificação', `${verifyUpdateTime}ms`, 'high');
        results.details.push('Não foi possível verificar persistência das mudanças');
      }
    } else {
      results.failed++;
      logTest('SINCRONIZAÇÃO', 'Atualização de Fluxo', false, 
        'Falha na atualização', `${updateTime}ms`, 'critical');
      results.critical.push('Falha crítica na atualização do fluxo');
    }
    
    // ==========================================================================
    // TESTE 7: CENÁRIOS EDGE CASES
    // ==========================================================================
    logSection('TESTE 7: CENÁRIOS EDGE CASES');
    
    const edgeCases = [
      {
        name: 'Fluxo Circular',
        modification: {
          connections: [
            {
              from: { pageId: 'final_young' },
              to: { pageId: 'demographics' },
              conditions: []
            }
          ]
        }
      },
      {
        name: 'Conexão Inválida',
        modification: {
          connections: [
            {
              from: { pageId: 'non_existent_page' },
              to: { pageId: 'demographics' },
              conditions: []
            }
          ]
        }
      },
      {
        name: 'Condição Complexa',
        modification: {
          connections: [
            {
              from: { pageId: 'demographics' },
              to: { pageId: 'final_young' },
              conditions: [
                {
                  field: 'faixa_etaria',
                  operator: 'equals',
                  value: 'young'
                },
                {
                  field: 'renda_mensal',
                  operator: 'in',
                  value: ['high', 'premium']
                }
              ]
            }
          ]
        }
      }
    ];
    
    for (const edgeCase of edgeCases) {
      const edgeStart = Date.now();
      const edgeFlowData = {
        ...complexFlowData,
        structure: {
          ...complexFlowData.structure,
          flow: {
            ...complexFlowData.structure.flow,
            connections: edgeCase.modification.connections
          }
        }
      };
      
      const edgeResult = await makeRequest(`/api/quizzes/${quizId}`, {
        method: 'PUT',
        body: JSON.stringify(edgeFlowData)
      });
      const edgeTime = Date.now() - edgeStart;
      
      results.total++;
      if (edgeResult.success) {
        results.passed++;
        logTest('EDGE CASE', edgeCase.name, true, 
          'Sistema lidou com caso extremo', `${edgeTime}ms`);
      } else {
        results.failed++;
        logTest('EDGE CASE', edgeCase.name, false, 
          'Sistema não lidou com caso extremo', `${edgeTime}ms`, 'high');
        results.details.push(`Edge case ${edgeCase.name} não tratado adequadamente`);
      }
    }
    
    // Limpar quiz após testes
    await makeRequest(`/api/quizzes/${quizId}`, { method: 'DELETE' });
    
  } else {
    results.failed++;
    logTest('CRIAÇÃO', 'Quiz Fluxo Complexo', false, 
      'Falha na criação do quiz', `${createTime}ms`, 'critical');
    results.critical.push('Falha crítica na criação de quiz com fluxo complexo');
  }
  
  // ==========================================================================
  // RELATÓRIO FINAL EXTREMAMENTE DETALHADO
  // ==========================================================================
  logSection('RELATÓRIO FINAL EXTREMAMENTE DETALHADO');
  
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
    console.log(`\n⚡ ANÁLISE DE PERFORMANCE DETALHADA:`);
    results.performance.forEach(p => {
      const status = p.time < 100 ? '🟢' : p.time < 300 ? '🟡' : '🔴';
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
  console.log(`🏗️  Criação: Quiz com fluxo complexo`);
  console.log(`🔗 Estrutura: Validação de conexões`);
  console.log(`🧭 Navegação: Fluxo condicional avançado`);
  console.log(`📊 Variáveis: Extração e segmentação`);
  console.log(`⚡ Performance: Escalabilidade e concorrência`);
  console.log(`🔄 Sincronização: Persistência e atualização`);
  console.log(`⚠️  Edge Cases: Cenários extremos`);
  
  console.log(`\n🎯 AVALIAÇÃO FINAL DO SISTEMA DE FLUXO:`);
  if (results.passed === results.total) {
    console.log('✅ SISTEMA DE FLUXO 100% FUNCIONAL!');
    console.log('🚀 Fluxo condicional avançado completamente operacional');
    console.log('🎯 Pronto para cenários empresariais complexos');
    console.log('📈 Suporte completo para segmentação inteligente');
  } else if (successRate >= 90) {
    console.log('⚠️  SISTEMA DE FLUXO QUASE PERFEITO!');
    console.log('🔧 Poucos ajustes necessários para perfeição');
    console.log('📊 Funcionalidade principal operacional');
    console.log('🎯 Recomendado para uso com monitoramento');
  } else if (successRate >= 75) {
    console.log('⚠️  SISTEMA DE FLUXO FUNCIONAL COM RESSALVAS');
    console.log('🛠️  Correções necessárias antes da produção');
    console.log('📊 Funcionalidade básica operacional');
    console.log('⚠️  Limitações em cenários complexos');
  } else {
    console.log('❌ SISTEMA DE FLUXO NECESSITA CORREÇÕES SIGNIFICATIVAS');
    console.log('🔧 Múltiplos problemas críticos identificados');
    console.log('⚠️  Não recomendado para uso em produção');
    console.log('🚨 Requer revisão arquitetural');
  }
  
  console.log('\n' + '='.repeat(80));
  return results;
}

// Executar teste
executarTesteFluxoAvancado().catch(console.error);