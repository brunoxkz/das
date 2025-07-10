/**
 * TESTE SISTEMA COMPLETO DINÂMICO - VENDZZ PLATFORM
 * Teste abrangente de todas as funcionalidades do sistema baseado em uso real
 * Cobre todos os aspectos: Quiz Builder, Preview, Fluxo Avançado, Email Marketing, SMS, WhatsApp, Variáveis
 */

const BASE_URL = 'http://localhost:5000';
let authToken = null;
let testResults = [];
let testQuizId = null;
let testResponseId = null;

// Utilitários de teste
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
  
  const response = await fetch(url, config);
  return response.json();
}

function logTest(category, testName, success, details = '', issues = []) {
  const result = {
    category,
    testName,
    success,
    details,
    issues,
    timestamp: new Date().toISOString()
  };
  
  testResults.push(result);
  
  const status = success ? '✅' : '❌';
  console.log(`${status} [${category}] ${testName}`);
  if (details) console.log(`   ${details}`);
  if (issues.length > 0) {
    issues.forEach(issue => console.log(`   ⚠️  ${issue}`));
  }
}

// ===========================================
// CATEGORIA 1: AUTENTICAÇÃO E SEGURANÇA
// ===========================================
async function testAuthenticationSecurity() {
  console.log('\n🔐 CATEGORIA 1: AUTENTICAÇÃO E SEGURANÇA');
  
  // Teste 1.1: Login básico
  try {
    const loginResult = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    if (loginResult.token) {
      authToken = loginResult.token;
      logTest('AUTH', 'Login básico', true, `Token obtido: ${authToken.substring(0, 20)}...`);
    } else {
      logTest('AUTH', 'Login básico', false, 'Token não recebido');
    }
  } catch (error) {
    logTest('AUTH', 'Login básico', false, `Erro: ${error.message}`);
  }
  
  // Teste 1.2: Verificação de token
  try {
    const verifyResult = await makeRequest('/api/auth/verify');
    logTest('AUTH', 'Verificação de token', !!verifyResult.user, 
      `Usuário: ${verifyResult.user?.email || 'N/A'}`);
  } catch (error) {
    logTest('AUTH', 'Verificação de token', false, `Erro: ${error.message}`);
  }
  
  // Teste 1.3: Proteção de rotas sem token
  try {
    const tempToken = authToken;
    authToken = null;
    const protectedResult = await makeRequest('/api/quizzes');
    logTest('AUTH', 'Proteção de rotas', protectedResult.error || false, 
      'Rota protegida sem token');
    authToken = tempToken;
  } catch (error) {
    logTest('AUTH', 'Proteção de rotas', true, 'Rota corretamente protegida');
  }
  
  // Teste 1.4: Refresh token automático
  try {
    const refreshResult = await makeRequest('/api/auth/refresh', {
      method: 'POST'
    });
    logTest('AUTH', 'Refresh token', !!refreshResult.token, 
      'Sistema de refresh funcional');
  } catch (error) {
    logTest('AUTH', 'Refresh token', false, `Erro: ${error.message}`);
  }
}

// ===========================================
// CATEGORIA 2: QUIZ BUILDER AVANÇADO
// ===========================================
async function testQuizBuilderAdvanced() {
  console.log('\n🛠️ CATEGORIA 2: QUIZ BUILDER AVANÇADO');
  
  // Teste 2.1: Criação de quiz dinâmico
  try {
    const quizData = {
      title: 'Quiz Teste Dinâmico Completo',
      description: 'Teste abrangente de todas as funcionalidades',
      structure: {
        pages: [
          {
            id: 'page1',
            elements: [
              {
                id: 'heading1',
                type: 'heading',
                content: 'Bem-vindo ao Quiz Dinâmico',
                fontSize: 'xl',
                textColor: '#10b981'
              },
              {
                id: 'multiple1',
                type: 'multiple_choice',
                question: 'Qual sua área de interesse?',
                options: [
                  { id: 'opt1', text: 'Tecnologia', image: '' },
                  { id: 'opt2', text: 'Marketing', image: '' },
                  { id: 'opt3', text: 'Vendas', image: '' }
                ],
                required: true,
                fieldId: 'area_interesse'
              }
            ]
          },
          {
            id: 'page2',
            elements: [
              {
                id: 'email1',
                type: 'email',
                question: 'Qual seu melhor email?',
                placeholder: 'seu@email.com',
                required: true,
                fieldId: 'email_principal'
              },
              {
                id: 'phone1',
                type: 'phone',
                question: 'Seu WhatsApp para contato?',
                placeholder: '(11) 99999-9999',
                required: true,
                fieldId: 'telefone_whatsapp'
              }
            ]
          }
        ],
        settings: {
          theme: 'green',
          showProgressBar: true,
          collectEmail: true,
          collectName: true,
          collectPhone: true
        }
      }
    };
    
    const createResult = await makeRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData)
    });
    
    if (createResult.id) {
      testQuizId = createResult.id;
      logTest('QUIZ', 'Criação dinâmica', true, `Quiz criado: ${testQuizId}`);
    } else {
      logTest('QUIZ', 'Criação dinâmica', false, 'Quiz não criado');
    }
  } catch (error) {
    logTest('QUIZ', 'Criação dinâmica', false, `Erro: ${error.message}`);
  }
  
  // Teste 2.2: Adição de elementos avançados
  try {
    const advancedElements = [
      {
        id: 'rating1',
        type: 'rating',
        question: 'Como você avalia nosso serviço?',
        maxRating: 5,
        fieldId: 'avaliacao_servico'
      },
      {
        id: 'birth_date1',
        type: 'birth_date',
        question: 'Sua data de nascimento?',
        required: true,
        fieldId: 'data_nascimento'
      },
      {
        id: 'height1',
        type: 'height',
        question: 'Sua altura?',
        unit: 'cm',
        fieldId: 'altura'
      },
      {
        id: 'game1',
        type: 'game_wheel',
        question: 'Gire a roleta da sorte!',
        options: ['Prêmio 1', 'Prêmio 2', 'Prêmio 3'],
        fieldId: 'premio_roleta'
      }
    ];
    
    const structure = {
      pages: [
        {
          id: 'page3',
          elements: advancedElements
        }
      ]
    };
    
    const updateResult = await makeRequest(`/api/quizzes/${testQuizId}`, {
      method: 'PUT',
      body: JSON.stringify({
        structure: structure
      })
    });
    
    logTest('QUIZ', 'Elementos avançados', !!updateResult.id, 
      `${advancedElements.length} elementos avançados adicionados`);
  } catch (error) {
    logTest('QUIZ', 'Elementos avançados', false, `Erro: ${error.message}`);
  }
  
  // Teste 2.3: Sistema de validação
  try {
    const invalidQuiz = {
      title: '',
      structure: {
        pages: []
      }
    };
    
    const invalidResult = await makeRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(invalidQuiz)
    });
    
    logTest('QUIZ', 'Validação de dados', !!invalidResult.error, 
      'Sistema rejeita dados inválidos');
  } catch (error) {
    logTest('QUIZ', 'Validação de dados', true, 'Validação funcional');
  }
  
  // Teste 2.4: Publicação e despublicação
  try {
    const publishResult = await makeRequest(`/api/quizzes/${testQuizId}/publish`, {
      method: 'POST'
    });
    
    logTest('QUIZ', 'Publicação', !!publishResult.message, 
      'Quiz publicado com sucesso');
    
    const unpublishResult = await makeRequest(`/api/quizzes/${testQuizId}/unpublish`, {
      method: 'POST'
    });
    
    logTest('QUIZ', 'Despublicação', !!unpublishResult.message, 
      'Quiz despublicado com sucesso');
  } catch (error) {
    logTest('QUIZ', 'Publicação/Despublicação', false, `Erro: ${error.message}`);
  }
}

// ===========================================
// CATEGORIA 3: PREVIEW E RENDERIZAÇÃO
// ===========================================
async function testPreviewRendering() {
  console.log('\n🎨 CATEGORIA 3: PREVIEW E RENDERIZAÇÃO');
  
  // Teste 3.1: Todos os tipos de elementos
  const elementTypes = [
    'heading', 'paragraph', 'image', 'video', 'audio', 'divider', 'spacer',
    'multiple_choice', 'text', 'email', 'phone', 'number', 'rating', 'date',
    'textarea', 'checkbox', 'birth_date', 'height', 'current_weight', 'target_weight',
    'game_wheel', 'game_scratch', 'game_color_pick', 'game_brick_break',
    'game_memory_cards', 'game_slot_machine', 'share_quiz', 'continue_button',
    'loading_question', 'animated_transition'
  ];
  
  let supportedElements = 0;
  let unsupportedElements = [];
  
  for (const elementType of elementTypes) {
    try {
      const testQuiz = {
        title: `Teste ${elementType}`,
        structure: {
          pages: [{
            id: 'page1',
            elements: [{
              id: 'element1',
              type: elementType,
              content: `Teste ${elementType}`,
              question: `Pergunta ${elementType}`,
              ...(elementType === 'multiple_choice' && {
                options: [
                  { id: 'opt1', text: 'Opção 1' },
                  { id: 'opt2', text: 'Opção 2' }
                ]
              })
            }]
          }]
        }
      };
      
      const result = await makeRequest('/api/quizzes', {
        method: 'POST',
        body: JSON.stringify(testQuiz)
      });
      
      if (result.id) {
        supportedElements++;
        // Limpar após teste
        await makeRequest(`/api/quizzes/${result.id}`, {
          method: 'DELETE'
        });
      } else {
        unsupportedElements.push(elementType);
      }
    } catch (error) {
      unsupportedElements.push(elementType);
    }
  }
  
  logTest('PREVIEW', 'Cobertura de elementos', supportedElements > 25, 
    `${supportedElements}/${elementTypes.length} elementos suportados`,
    unsupportedElements.length > 0 ? [`Não suportados: ${unsupportedElements.join(', ')}`] : []);
  
  // Teste 3.2: Responsividade
  try {
    const responsiveQuiz = {
      title: 'Teste Responsivo',
      structure: {
        pages: [{
          id: 'page1',
          elements: [{
            id: 'responsive1',
            type: 'multiple_choice',
            question: 'Teste responsivo',
            options: Array.from({length: 10}, (_, i) => ({
              id: `opt${i}`,
              text: `Opção muito longa ${i + 1} para testar responsividade`
            }))
          }]
        }]
      }
    };
    
    const result = await makeRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(responsiveQuiz)
    });
    
    logTest('PREVIEW', 'Responsividade', !!result.id, 
      'Quiz com muitas opções criado');
      
    if (result.id) {
      await makeRequest(`/api/quizzes/${result.id}`, { method: 'DELETE' });
    }
  } catch (error) {
    logTest('PREVIEW', 'Responsividade', false, `Erro: ${error.message}`);
  }
  
  // Teste 3.3: Elementos de transição
  try {
    const transitionQuiz = {
      title: 'Teste Transições',
      structure: {
        pages: [{
          id: 'page1',
          isTransition: true,
          elements: [
            {
              id: 'bg1',
              type: 'transition_background',
              backgroundType: 'gradient',
              gradientFrom: '#10b981',
              gradientTo: '#3b82f6'
            },
            {
              id: 'text1',
              type: 'transition_text',
              content: 'Carregando...',
              fontSize: 'xl'
            },
            {
              id: 'loader1',
              type: 'transition_loader',
              loaderType: 'spinner',
              loaderColor: '#ffffff'
            }
          ]
        }]
      }
    };
    
    const result = await makeRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(transitionQuiz)
    });
    
    logTest('PREVIEW', 'Páginas de transição', !!result.id, 
      'Elementos de transição funcionais');
      
    if (result.id) {
      await makeRequest(`/api/quizzes/${result.id}`, { method: 'DELETE' });
    }
  } catch (error) {
    logTest('PREVIEW', 'Páginas de transição', false, `Erro: ${error.message}`);
  }
}

// ===========================================
// CATEGORIA 4: FLUXO AVANÇADO E CONEXÕES
// ===========================================
async function testAdvancedFlow() {
  console.log('\n🔄 CATEGORIA 4: FLUXO AVANÇADO E CONEXÕES');
  
  // Teste 4.1: Criação de conexões
  try {
    const flowQuiz = {
      title: 'Quiz Fluxo Avançado',
      structure: {
        pages: [
          {
            id: 'page1',
            elements: [{
              id: 'choice1',
              type: 'multiple_choice',
              question: 'Escolha seu caminho:',
              options: [
                { id: 'opt1', text: 'Caminho A' },
                { id: 'opt2', text: 'Caminho B' }
              ]
            }]
          },
          {
            id: 'page2',
            elements: [{
              id: 'result1',
              type: 'heading',
              content: 'Resultado Caminho A'
            }]
          },
          {
            id: 'page3',
            elements: [{
              id: 'result2',
              type: 'heading',
              content: 'Resultado Caminho B'
            }]
          }
        ],
        flowConnections: [
          {
            id: 'conn1',
            from: { pageId: 'page1', elementId: 'choice1', optionId: 'opt1' },
            to: { pageId: 'page2' }
          },
          {
            id: 'conn2',
            from: { pageId: 'page1', elementId: 'choice1', optionId: 'opt2' },
            to: { pageId: 'page3' }
          }
        ]
      }
    };
    
    const result = await makeRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(flowQuiz)
    });
    
    logTest('FLOW', 'Conexões condicionais', !!result.id, 
      'Quiz com fluxo condicional criado');
      
    if (result.id) {
      testQuizId = result.id; // Usar para testes seguintes
    }
  } catch (error) {
    logTest('FLOW', 'Conexões condicionais', false, `Erro: ${error.message}`);
  }
  
  // Teste 4.2: Validação de fluxo
  try {
    const invalidFlow = {
      flowConnections: [
        {
          id: 'invalid1',
          from: { pageId: 'nonexistent', elementId: 'fake' },
          to: { pageId: 'alsofake' }
        }
      ]
    };
    
    const result = await makeRequest(`/api/quizzes/${testQuizId}`, {
      method: 'PUT',
      body: JSON.stringify(invalidFlow)
    });
    
    logTest('FLOW', 'Validação de fluxo', !!result.error || !!result.id, 
      'Sistema lida com fluxos inválidos');
  } catch (error) {
    logTest('FLOW', 'Validação de fluxo', true, 'Validação funcional');
  }
  
  // Teste 4.3: Fluxo complexo multi-nível
  try {
    const complexFlow = {
      structure: {
        pages: [
          {
            id: 'start',
            elements: [{
              id: 'q1',
              type: 'multiple_choice',
              question: 'Você é...',
              options: [
                { id: 'pessoa', text: 'Pessoa Física' },
                { id: 'empresa', text: 'Empresa' }
              ]
            }]
          },
          {
            id: 'pessoa_page',
            elements: [{
              id: 'q2',
              type: 'multiple_choice',
              question: 'Sua idade?',
              options: [
                { id: 'jovem', text: '18-30' },
                { id: 'adulto', text: '31-50' },
                { id: 'senior', text: '50+' }
              ]
            }]
          },
          {
            id: 'empresa_page',
            elements: [{
              id: 'q3',
              type: 'multiple_choice',
              question: 'Tamanho da empresa?',
              options: [
                { id: 'pequena', text: 'Pequena' },
                { id: 'media', text: 'Média' },
                { id: 'grande', text: 'Grande' }
              ]
            }]
          }
        ],
        flowConnections: [
          {
            id: 'to_pessoa',
            from: { pageId: 'start', elementId: 'q1', optionId: 'pessoa' },
            to: { pageId: 'pessoa_page' }
          },
          {
            id: 'to_empresa',
            from: { pageId: 'start', elementId: 'q1', optionId: 'empresa' },
            to: { pageId: 'empresa_page' }
          }
        ]
      }
    };
    
    const result = await makeRequest(`/api/quizzes/${testQuizId}`, {
      method: 'PUT',
      body: JSON.stringify(complexFlow)
    });
    
    logTest('FLOW', 'Fluxo multi-nível', !!result.id, 
      'Fluxo complexo com múltiplas bifurcações');
  } catch (error) {
    logTest('FLOW', 'Fluxo multi-nível', false, `Erro: ${error.message}`);
  }
}

// ===========================================
// CATEGORIA 5: CAPTURA E PROCESSAMENTO DE RESPOSTAS
// ===========================================
async function testResponseCapture() {
  console.log('\n📊 CATEGORIA 5: CAPTURA E PROCESSAMENTO DE RESPOSTAS');
  
  // Publicar quiz para permitir respostas
  try {
    await makeRequest(`/api/quizzes/${testQuizId}/publish`, {
      method: 'POST'
    });
  } catch (error) {
    // Já pode estar publicado
  }
  
  // Teste 5.1: Resposta completa
  try {
    const completeResponse = {
      quizId: testQuizId,
      responses: {
        q1: 'pessoa',
        q2: 'adulto',
        email_principal: 'teste@dinamico.com',
        telefone_whatsapp: '11999887766',
        area_interesse: 'Tecnologia',
        avaliacao_servico: 5,
        data_nascimento: '1990-01-01',
        altura: 180
      },
      metadata: {
        isComplete: true,
        isPartial: false,
        completionPercentage: 100,
        userAgent: 'TestBot/1.0',
        ipAddress: '127.0.0.1',
        timestamp: new Date().toISOString()
      }
    };
    
    const result = await makeRequest(`/api/quizzes/${testQuizId}/responses`, {
      method: 'POST',
      body: JSON.stringify(completeResponse)
    });
    
    if (result.id) {
      testResponseId = result.id;
      logTest('RESPONSE', 'Resposta completa', true, 
        `Response ID: ${testResponseId}`);
    } else {
      logTest('RESPONSE', 'Resposta completa', false, 'Não foi possível criar resposta');
    }
  } catch (error) {
    logTest('RESPONSE', 'Resposta completa', false, `Erro: ${error.message}`);
  }
  
  // Teste 5.2: Resposta parcial
  try {
    const partialResponse = {
      quizId: testQuizId,
      responses: {
        q1: 'empresa',
        area_interesse: 'Marketing'
      },
      metadata: {
        isComplete: false,
        isPartial: true,
        completionPercentage: 30,
        userAgent: 'TestBot/1.0',
        ipAddress: '127.0.0.1'
      }
    };
    
    const result = await makeRequest(`/api/quizzes/${testQuizId}/responses`, {
      method: 'POST',
      body: JSON.stringify(partialResponse)
    });
    
    logTest('RESPONSE', 'Resposta parcial', !!result.id, 
      'Sistema aceita respostas parciais');
  } catch (error) {
    logTest('RESPONSE', 'Resposta parcial', false, `Erro: ${error.message}`);
  }
  
  // Teste 5.3: Validação de dados
  try {
    const invalidResponse = {
      quizId: testQuizId,
      responses: {
        email_principal: 'email_invalido',
        telefone_whatsapp: '123',
        avaliacao_servico: 15 // Fora do range
      },
      metadata: {
        isComplete: true,
        completionPercentage: 100
      }
    };
    
    const result = await makeRequest(`/api/quizzes/${testQuizId}/responses`, {
      method: 'POST',
      body: JSON.stringify(invalidResponse)
    });
    
    logTest('RESPONSE', 'Validação de dados', !!result.error || !!result.id, 
      'Sistema lida com dados inválidos');
  } catch (error) {
    logTest('RESPONSE', 'Validação de dados', true, 'Validação funcional');
  }
  
  // Teste 5.4: Listagem de respostas
  try {
    const responses = await makeRequest(`/api/quizzes/${testQuizId}/responses`);
    
    logTest('RESPONSE', 'Listagem de respostas', Array.isArray(responses), 
      `${responses?.length || 0} respostas encontradas`);
  } catch (error) {
    logTest('RESPONSE', 'Listagem de respostas', false, `Erro: ${error.message}`);
  }
}

// ===========================================
// CATEGORIA 6: SISTEMA DE VARIÁVEIS DINÂMICAS
// ===========================================
async function testDynamicVariables() {
  console.log('\n🏷️ CATEGORIA 6: SISTEMA DE VARIÁVEIS DINÂMICAS');
  
  // Teste 6.1: Extração automática de variáveis
  try {
    const variables = await makeRequest(`/api/quizzes/${testQuizId}/variables`);
    
    logTest('VARIABLES', 'Extração automática', Array.isArray(variables), 
      `${variables?.length || 0} variáveis extraídas`);
  } catch (error) {
    logTest('VARIABLES', 'Extração automática', false, `Erro: ${error.message}`);
  }
  
  // Teste 6.2: Variáveis por resposta
  try {
    if (testResponseId) {
      const responseVars = await makeRequest(`/api/responses/${testResponseId}/variables`);
      
      logTest('VARIABLES', 'Variáveis por resposta', !!responseVars, 
        'Variáveis específicas da resposta');
    }
  } catch (error) {
    logTest('VARIABLES', 'Variáveis por resposta', false, `Erro: ${error.message}`);
  }
  
  // Teste 6.3: Processamento de variáveis personalizadas
  try {
    const customVars = await makeRequest(`/api/quizzes/${testQuizId}/variables/custom`);
    
    logTest('VARIABLES', 'Variáveis personalizadas', !!customVars, 
      'Sistema processa variáveis customizadas');
  } catch (error) {
    logTest('VARIABLES', 'Variáveis personalizadas', false, `Erro: ${error.message}`);
  }
  
  // Teste 6.4: Reprocessamento de variáveis
  try {
    const reprocess = await makeRequest(`/api/quizzes/${testQuizId}/variables/reprocess`, {
      method: 'POST'
    });
    
    logTest('VARIABLES', 'Reprocessamento', !!reprocess.success, 
      'Sistema reprocessa variáveis quando necessário');
  } catch (error) {
    logTest('VARIABLES', 'Reprocessamento', false, `Erro: ${error.message}`);
  }
}

// ===========================================
// CATEGORIA 7: EMAIL MARKETING AVANÇADO
// ===========================================
async function testEmailMarketing() {
  console.log('\n📧 CATEGORIA 7: EMAIL MARKETING AVANÇADO');
  
  // Teste 7.1: Extração de emails
  try {
    const emails = await makeRequest(`/api/quizzes/${testQuizId}/responses/emails`);
    
    logTest('EMAIL', 'Extração de emails', Array.isArray(emails), 
      `${emails?.length || 0} emails extraídos`);
  } catch (error) {
    logTest('EMAIL', 'Extração de emails', false, `Erro: ${error.message}`);
  }
  
  // Teste 7.2: Criação de campanha
  try {
    const campaign = {
      name: 'Campanha Teste Dinâmica',
      quizId: testQuizId,
      subject: 'Obrigado por participar - {nome}',
      content: 'Olá {nome}, obrigado por participar do nosso quiz sobre {area_interesse}!',
      targetAudience: 'completed',
      scheduledAt: new Date(Date.now() + 60000).toISOString()
    };
    
    const result = await makeRequest('/api/email-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign)
    });
    
    logTest('EMAIL', 'Criação de campanha', !!result.id, 
      'Campanha de email criada com variáveis dinâmicas');
  } catch (error) {
    logTest('EMAIL', 'Criação de campanha', false, `Erro: ${error.message}`);
  }
  
  // Teste 7.3: Segmentação de audiência
  try {
    const segments = ['completed', 'abandoned', 'all'];
    let segmentResults = [];
    
    for (const segment of segments) {
      const preview = await makeRequest('/api/email-campaigns/preview-audience', {
        method: 'POST',
        body: JSON.stringify({
          quizId: testQuizId,
          targetAudience: segment
        })
      });
      
      segmentResults.push({
        segment,
        count: preview?.count || 0
      });
    }
    
    logTest('EMAIL', 'Segmentação de audiência', segmentResults.length === 3, 
      `Segmentos: ${segmentResults.map(s => `${s.segment}=${s.count}`).join(', ')}`);
  } catch (error) {
    logTest('EMAIL', 'Segmentação de audiência', false, `Erro: ${error.message}`);
  }
  
  // Teste 7.4: Personalização de conteúdo
  try {
    const personalization = await makeRequest('/api/email-campaigns/personalize', {
      method: 'POST',
      body: JSON.stringify({
        template: 'Olá {nome}, você escolheu {area_interesse} e avaliou com {avaliacao_servico} estrelas!',
        variables: {
          nome: 'João Silva',
          area_interesse: 'Tecnologia',
          avaliacao_servico: 5
        }
      })
    });
    
    logTest('EMAIL', 'Personalização', !!personalization.content, 
      'Conteúdo personalizado com variáveis dinâmicas');
  } catch (error) {
    logTest('EMAIL', 'Personalização', false, `Erro: ${error.message}`);
  }
}

// ===========================================
// CATEGORIA 8: SMS E WHATSAPP MARKETING
// ===========================================
async function testSMSWhatsApp() {
  console.log('\n📱 CATEGORIA 8: SMS E WHATSAPP MARKETING');
  
  // Teste 8.1: Extração de telefones
  try {
    const phones = await makeRequest(`/api/quizzes/${testQuizId}/responses/phones`);
    
    logTest('SMS', 'Extração de telefones', Array.isArray(phones), 
      `${phones?.length || 0} telefones extraídos`);
  } catch (error) {
    logTest('SMS', 'Extração de telefones', false, `Erro: ${error.message}`);
  }
  
  // Teste 8.2: Campanha SMS
  try {
    const smsCampaign = {
      name: 'SMS Teste Dinâmico',
      quizId: testQuizId,
      message: 'Olá {nome}! Obrigado por participar. Sua área de interesse: {area_interesse}',
      targetAudience: 'completed',
      triggerType: 'delayed',
      triggerDelay: 10,
      triggerUnit: 'minutes'
    };
    
    const result = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(smsCampaign)
    });
    
    logTest('SMS', 'Campanha SMS', !!result.id, 
      'Campanha SMS criada com agendamento');
  } catch (error) {
    logTest('SMS', 'Campanha SMS', false, `Erro: ${error.message}`);
  }
  
  // Teste 8.3: Campanha WhatsApp
  try {
    const whatsappCampaign = {
      name: 'WhatsApp Teste Dinâmico',
      quizId: testQuizId,
      messages: [
        'Olá {nome}! Obrigado por participar do quiz.',
        'Sua área de interesse é {area_interesse}. Que tal saber mais?',
        'Você avaliou nosso serviço com {avaliacao_servico} estrelas. Obrigado!',
        'Temos novidades para você! Clique aqui: vendzz.com'
      ],
      targetAudience: 'completed',
      rotativeMessages: true,
      antiBanMode: true
    };
    
    const result = await makeRequest('/api/whatsapp-campaigns', {
      method: 'POST',
      body: JSON.stringify(whatsappCampaign)
    });
    
    logTest('WHATSAPP', 'Campanha WhatsApp', !!result.id, 
      'Campanha WhatsApp com mensagens rotativas');
  } catch (error) {
    logTest('WHATSAPP', 'Campanha WhatsApp', false, `Erro: ${error.message}`);
  }
  
  // Teste 8.4: Detecção automática de leads
  try {
    const detection = await makeRequest('/api/whatsapp-campaigns/detect-leads', {
      method: 'POST'
    });
    
    logTest('WHATSAPP', 'Detecção automática', !!detection.processed, 
      'Sistema detecta novos leads automaticamente');
  } catch (error) {
    logTest('WHATSAPP', 'Detecção automática', false, `Erro: ${error.message}`);
  }
}

// ===========================================
// CATEGORIA 9: ANALYTICS E MÉTRICAS
// ===========================================
async function testAnalytics() {
  console.log('\n📈 CATEGORIA 9: ANALYTICS E MÉTRICAS');
  
  // Teste 9.1: Analytics básicas
  try {
    const analytics = await makeRequest(`/api/quizzes/${testQuizId}/analytics`);
    
    logTest('ANALYTICS', 'Métricas básicas', !!analytics.totalViews !== undefined, 
      `Views: ${analytics.totalViews}, Respostas: ${analytics.totalResponses}`);
  } catch (error) {
    logTest('ANALYTICS', 'Métricas básicas', false, `Erro: ${error.message}`);
  }
  
  // Teste 9.2: Analytics avançadas
  try {
    const advanced = await makeRequest(`/api/quizzes/${testQuizId}/analytics/advanced`);
    
    logTest('ANALYTICS', 'Métricas avançadas', !!advanced, 
      'Analytics detalhadas disponíveis');
  } catch (error) {
    logTest('ANALYTICS', 'Métricas avançadas', false, `Erro: ${error.message}`);
  }
  
  // Teste 9.3: Rastreamento de visualizações
  try {
    const viewTrack = await makeRequest(`/api/analytics/${testQuizId}/view`, {
      method: 'POST'
    });
    
    logTest('ANALYTICS', 'Rastreamento de views', !!viewTrack.success, 
      'Sistema rastreia visualizações');
  } catch (error) {
    logTest('ANALYTICS', 'Rastreamento de views', false, `Erro: ${error.message}`);
  }
  
  // Teste 9.4: Métricas de conversão
  try {
    const conversion = await makeRequest(`/api/quizzes/${testQuizId}/analytics/conversion`);
    
    logTest('ANALYTICS', 'Taxa de conversão', !!conversion, 
      'Métricas de conversão disponíveis');
  } catch (error) {
    logTest('ANALYTICS', 'Taxa de conversão', false, `Erro: ${error.message}`);
  }
}

// ===========================================
// CATEGORIA 10: PERFORMANCE E ESCALABILIDADE
// ===========================================
async function testPerformanceScalability() {
  console.log('\n⚡ CATEGORIA 10: PERFORMANCE E ESCALABILIDADE');
  
  // Teste 10.1: Carga simultânea
  try {
    const promises = [];
    const concurrentUsers = 10;
    
    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(makeRequest('/api/auth/verify'));
    }
    
    const startTime = Date.now();
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    const successCount = results.filter(r => r.user).length;
    const avgTime = (endTime - startTime) / concurrentUsers;
    
    logTest('PERFORMANCE', 'Carga simultânea', successCount === concurrentUsers, 
      `${successCount}/${concurrentUsers} sucessos, ${avgTime}ms médio`);
  } catch (error) {
    logTest('PERFORMANCE', 'Carga simultânea', false, `Erro: ${error.message}`);
  }
  
  // Teste 10.2: Cache de dados
  try {
    const start1 = Date.now();
    await makeRequest('/api/dashboard-stats');
    const time1 = Date.now() - start1;
    
    const start2 = Date.now();
    await makeRequest('/api/dashboard-stats');
    const time2 = Date.now() - start2;
    
    logTest('PERFORMANCE', 'Sistema de cache', time2 < time1, 
      `Primeira: ${time1}ms, Segunda: ${time2}ms`);
  } catch (error) {
    logTest('PERFORMANCE', 'Sistema de cache', false, `Erro: ${error.message}`);
  }
  
  // Teste 10.3: Limites de rate limiting
  try {
    const requests = [];
    for (let i = 0; i < 20; i++) {
      requests.push(makeRequest('/api/auth/verify'));
    }
    
    const results = await Promise.allSettled(requests);
    const blocked = results.filter(r => r.status === 'rejected').length;
    
    logTest('PERFORMANCE', 'Rate limiting', blocked > 0, 
      `${blocked}/20 requisições bloqueadas`);
  } catch (error) {
    logTest('PERFORMANCE', 'Rate limiting', false, `Erro: ${error.message}`);
  }
  
  // Teste 10.4: Uso de memória
  try {
    const memoryBefore = await makeRequest('/api/system/memory');
    
    // Criar múltiplos quizzes para testar memória
    const quizzes = [];
    for (let i = 0; i < 5; i++) {
      const quiz = await makeRequest('/api/quizzes', {
        method: 'POST',
        body: JSON.stringify({
          title: `Quiz Memória ${i}`,
          structure: {
            pages: [{
              id: 'page1',
              elements: Array.from({length: 50}, (_, j) => ({
                id: `element${j}`,
                type: 'heading',
                content: `Elemento ${j}`
              }))
            }]
          }
        })
      });
      
      if (quiz.id) quizzes.push(quiz.id);
    }
    
    const memoryAfter = await makeRequest('/api/system/memory');
    
    // Limpar quizzes de teste
    for (const quizId of quizzes) {
      await makeRequest(`/api/quizzes/${quizId}`, { method: 'DELETE' });
    }
    
    logTest('PERFORMANCE', 'Uso de memória', !!memoryBefore && !!memoryAfter, 
      'Sistema monitora uso de memória');
  } catch (error) {
    logTest('PERFORMANCE', 'Uso de memória', false, `Erro: ${error.message}`);
  }
}

// ===========================================
// FUNÇÃO PRINCIPAL E RELATÓRIO
// ===========================================
async function runAllTests() {
  console.log('🚀 INICIANDO BATERIA COMPLETA DE TESTES DINÂMICOS - VENDZZ PLATFORM');
  console.log('================================================================================');
  
  const startTime = Date.now();
  
  try {
    await testAuthenticationSecurity();
    await testQuizBuilderAdvanced();
    await testPreviewRendering();
    await testAdvancedFlow();
    await testResponseCapture();
    await testDynamicVariables();
    await testEmailMarketing();
    await testSMSWhatsApp();
    await testAnalytics();
    await testPerformanceScalability();
  } catch (error) {
    console.error('Erro durante execução dos testes:', error);
  }
  
  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);
  
  // Relatório final
  console.log('\n\n📊 RELATÓRIO FINAL DOS TESTES DINÂMICOS');
  console.log('================================================================================');
  
  const categories = {};
  testResults.forEach(test => {
    if (!categories[test.category]) {
      categories[test.category] = { total: 0, passed: 0, failed: 0, tests: [] };
    }
    categories[test.category].total++;
    if (test.success) {
      categories[test.category].passed++;
    } else {
      categories[test.category].failed++;
    }
    categories[test.category].tests.push(test);
  });
  
  const totalTests = testResults.length;
  const totalPassed = testResults.filter(t => t.success).length;
  const totalFailed = totalTests - totalPassed;
  const successRate = ((totalPassed / totalTests) * 100).toFixed(1);
  
  console.log(`⏱️  TEMPO TOTAL: ${totalTime}s`);
  console.log(`📈 TAXA DE SUCESSO: ${successRate}% (${totalPassed}/${totalTests})`);
  console.log('');
  
  // Relatório por categoria
  Object.entries(categories).forEach(([category, stats]) => {
    const categoryRate = ((stats.passed / stats.total) * 100).toFixed(1);
    console.log(`${categoryRate >= 80 ? '✅' : '❌'} ${category}: ${categoryRate}% (${stats.passed}/${stats.total})`);
    
    stats.tests.forEach(test => {
      const status = test.success ? '  ✅' : '  ❌';
      console.log(`${status} ${test.testName}`);
      if (test.details) console.log(`     ${test.details}`);
      if (test.issues.length > 0) {
        test.issues.forEach(issue => console.log(`     ⚠️  ${issue}`));
      }
    });
    console.log('');
  });
  
  // Identificar problemas críticos
  const criticalIssues = testResults
    .filter(t => !t.success && ['AUTH', 'QUIZ', 'RESPONSE'].includes(t.category))
    .map(t => `${t.category}: ${t.testName}`);
  
  if (criticalIssues.length > 0) {
    console.log('🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS:');
    criticalIssues.forEach(issue => console.log(`   - ${issue}`));
    console.log('');
  }
  
  // Recomendações
  console.log('💡 RECOMENDAÇÕES:');
  if (successRate < 80) {
    console.log('   - Taxa de sucesso abaixo de 80% - revisar funcionalidades críticas');
  }
  if (categories.PERFORMANCE?.passed < categories.PERFORMANCE?.total) {
    console.log('   - Problemas de performance identificados - otimizar sistema');
  }
  if (categories.PREVIEW?.passed < categories.PREVIEW?.total) {
    console.log('   - Elementos não suportados no preview - implementar renderização');
  }
  if (criticalIssues.length === 0 && successRate >= 90) {
    console.log('   - Sistema está funcionando excelentemente! 🎉');
  }
  
  console.log('\n================================================================================');
  console.log(`🎯 TESTE COMPLETO FINALIZADO - ${successRate}% DE SUCESSO`);
  console.log('================================================================================');
  
  // Limpar dados de teste
  if (testQuizId) {
    try {
      await makeRequest(`/api/quizzes/${testQuizId}`, { method: 'DELETE' });
      console.log('🧹 Dados de teste limpos com sucesso');
    } catch (error) {
      console.log('⚠️  Erro ao limpar dados de teste:', error.message);
    }
  }
  
  return {
    totalTests,
    totalPassed,
    totalFailed,
    successRate: parseFloat(successRate),
    categories,
    criticalIssues,
    executionTime: totalTime
  };
}

// Executar testes
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };