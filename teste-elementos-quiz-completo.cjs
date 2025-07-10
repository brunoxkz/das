/**
 * TESTE COMPLETO DE ELEMENTOS DO QUIZ
 * Testa todos os elementos disponíveis no sistema Vendzz
 * Valida funcionamento completo de cada tipo de elemento
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

function logElement(elementName, success, details = '', timing = '') {
  const status = success ? '✅' : '❌';
  const timeInfo = timing ? ` (${timing})` : '';
  console.log(`${status} ${elementName}${timeInfo}`);
  if (details) {
    console.log(`   🔍 ${details}`);
  }
}

function logCategory(categoryName) {
  console.log(`\n🎯 ${categoryName.toUpperCase()}`);
  console.log('='.repeat(50));
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

async function testElementType(elementConfig, responseValue) {
  const quizData = {
    title: `Teste Elemento ${elementConfig.type}`,
    description: `Quiz para testar elemento ${elementConfig.type}`,
    structure: {
      pages: [
        {
          id: 'test-page',
          name: 'Página de Teste',
          elements: [elementConfig]
        }
      ]
    }
  };
  
  // Criar quiz
  const createResult = await makeRequest('/api/quizzes', {
    method: 'POST',
    body: JSON.stringify(quizData)
  });
  
  if (!createResult.success) {
    return { success: false, error: 'Falha na criação do quiz' };
  }
  
  const quizId = createResult.data.id;
  
  try {
    // Publicar quiz
    const publishResult = await makeRequest(`/api/quizzes/${quizId}/publish`, {
      method: 'POST'
    });
    
    if (!publishResult.success) {
      return { success: false, error: 'Falha na publicação' };
    }
    
    // Enviar resposta se houver valor
    if (responseValue !== undefined) {
      const responseData = {
        responses: {
          [elementConfig.fieldId || `test_${elementConfig.type}`]: responseValue
        },
        metadata: {
          isComplete: true,
          completionPercentage: 100
        }
      };
      
      const responseResult = await makeRequest(`/api/quizzes/${quizId}/responses`, {
        method: 'POST',
        body: JSON.stringify(responseData)
      });
      
      if (!responseResult.success) {
        return { success: false, error: 'Falha no envio da resposta' };
      }
    }
    
    // Verificar variáveis extraídas
    const variablesResult = await makeRequest(`/api/quizzes/${quizId}/variables`);
    
    return {
      success: true,
      quizId,
      variablesCount: Array.isArray(variablesResult.data) ? variablesResult.data.length : 0
    };
    
  } finally {
    // Limpar quiz
    await makeRequest(`/api/quizzes/${quizId}`, { method: 'DELETE' });
  }
}

async function executarTesteElementos() {
  console.log('🧪 TESTE COMPLETO DE ELEMENTOS DO QUIZ');
  console.log('='.repeat(80));
  
  // Autenticar
  if (!(await authenticate())) {
    console.log('❌ Falha na autenticação');
    return;
  }
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
  };
  
  // ========================================
  // CATEGORIA: CONTEÚDO
  // ========================================
  logCategory('ELEMENTOS DE CONTEÚDO');
  
  const contentElements = [
    {
      config: {
        id: 'heading_test',
        type: 'heading',
        content: 'Título de Teste',
        fontSize: 'xl',
        textColor: '#10b981',
        textAlign: 'center'
      },
      response: undefined,
      description: 'Título com formatação verde centralizada'
    },
    {
      config: {
        id: 'paragraph_test',
        type: 'paragraph',
        content: 'Este é um parágrafo de teste com texto descritivo para validar a renderização correta do elemento.',
        textAlign: 'left',
        fontSize: 'base'
      },
      response: undefined,
      description: 'Parágrafo com texto descritivo'
    },
    {
      config: {
        id: 'image_test',
        type: 'image',
        src: 'https://via.placeholder.com/400x200/10b981/ffffff?text=Imagem+Teste',
        alt: 'Imagem de teste',
        alignment: 'center'
      },
      response: undefined,
      description: 'Imagem placeholder centralizada'
    },
    {
      config: {
        id: 'video_test',
        type: 'video',
        src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Vídeo de Teste'
      },
      response: undefined,
      description: 'Vídeo do YouTube incorporado'
    },
    {
      config: {
        id: 'divider_test',
        type: 'divider',
        style: 'solid',
        color: '#10b981'
      },
      response: undefined,
      description: 'Divisor sólido verde'
    },
    {
      config: {
        id: 'spacer_test',
        type: 'spacer',
        height: '20px'
      },
      response: undefined,
      description: 'Espaçador de 20px'
    }
  ];
  
  for (const element of contentElements) {
    const start = Date.now();
    const result = await testElementType(element.config, element.response);
    const time = Date.now() - start;
    
    results.total++;
    if (result.success) {
      results.passed++;
      logElement(element.config.type, true, element.description, `${time}ms`);
    } else {
      results.failed++;
      logElement(element.config.type, false, result.error, `${time}ms`);
      results.details.push(`${element.config.type}: ${result.error}`);
    }
  }
  
  // ========================================
  // CATEGORIA: PERGUNTAS
  // ========================================
  logCategory('ELEMENTOS DE PERGUNTAS');
  
  const questionElements = [
    {
      config: {
        id: 'multiple_choice_test',
        type: 'multiple_choice',
        question: 'Qual é sua cor favorita?',
        options: [
          { id: 'red', text: 'Vermelho' },
          { id: 'blue', text: 'Azul' },
          { id: 'green', text: 'Verde' },
          { id: 'yellow', text: 'Amarelo' }
        ],
        required: true,
        fieldId: 'cor_favorita'
      },
      response: 'green',
      description: 'Múltipla escolha com 4 opções'
    },
    {
      config: {
        id: 'text_test',
        type: 'text',
        question: 'Qual é o seu nome completo?',
        placeholder: 'Digite seu nome completo',
        required: true,
        fieldId: 'nome_completo'
      },
      response: 'João Silva Santos',
      description: 'Campo de texto obrigatório'
    },
    {
      config: {
        id: 'email_test',
        type: 'email',
        question: 'Qual é o seu email?',
        placeholder: 'seu@email.com',
        required: true,
        fieldId: 'email_contato'
      },
      response: 'joao.silva@teste.com',
      description: 'Campo de email validado'
    },
    {
      config: {
        id: 'phone_test',
        type: 'phone',
        question: 'Qual é o seu telefone?',
        placeholder: '(11) 99999-9999',
        required: true,
        fieldId: 'telefone_contato'
      },
      response: '11987654321',
      description: 'Campo de telefone formatado'
    },
    {
      config: {
        id: 'number_test',
        type: 'number',
        question: 'Qual é a sua idade?',
        placeholder: 'Digite sua idade',
        min: 18,
        max: 100,
        required: true,
        fieldId: 'idade'
      },
      response: 28,
      description: 'Campo numérico com validação'
    },
    {
      config: {
        id: 'rating_test',
        type: 'rating',
        question: 'Como você avalia nosso serviço?',
        min: 1,
        max: 5,
        required: true,
        fieldId: 'avaliacao_servico'
      },
      response: 5,
      description: 'Rating de 1 a 5 estrelas'
    },
    {
      config: {
        id: 'date_test',
        type: 'date',
        question: 'Qual é a sua data de nascimento?',
        required: true,
        fieldId: 'data_nascimento'
      },
      response: '1995-05-15',
      description: 'Seletor de data'
    },
    {
      config: {
        id: 'textarea_test',
        type: 'textarea',
        question: 'Deixe sua mensagem ou comentário:',
        placeholder: 'Digite sua mensagem aqui...',
        rows: 4,
        fieldId: 'mensagem'
      },
      response: 'Esta é uma mensagem de teste para validar o campo textarea.',
      description: 'Área de texto para mensagens'
    },
    {
      config: {
        id: 'checkbox_test',
        type: 'checkbox',
        question: 'Quais são seus interesses?',
        options: [
          { id: 'tech', text: 'Tecnologia' },
          { id: 'sports', text: 'Esportes' },
          { id: 'music', text: 'Música' },
          { id: 'travel', text: 'Viagens' }
        ],
        fieldId: 'interesses'
      },
      response: ['tech', 'music'],
      description: 'Checkbox com múltiplas seleções'
    }
  ];
  
  for (const element of questionElements) {
    const start = Date.now();
    const result = await testElementType(element.config, element.response);
    const time = Date.now() - start;
    
    results.total++;
    if (result.success) {
      results.passed++;
      logElement(element.config.type, true, 
        `${element.description} - ${result.variablesCount} variáveis`, 
        `${time}ms`);
    } else {
      results.failed++;
      logElement(element.config.type, false, result.error, `${time}ms`);
      results.details.push(`${element.config.type}: ${result.error}`);
    }
  }
  
  // ========================================
  // CATEGORIA: FORMULÁRIO
  // ========================================
  logCategory('ELEMENTOS DE FORMULÁRIO');
  
  const formElements = [
    {
      config: {
        id: 'birth_date_test',
        type: 'birth_date',
        question: 'Qual é a sua data de nascimento?',
        required: true,
        fieldId: 'data_nascimento_completa'
      },
      response: '1990-03-25',
      description: 'Data de nascimento especializada'
    },
    {
      config: {
        id: 'height_test',
        type: 'height',
        question: 'Qual é a sua altura?',
        unit: 'cm',
        min: 100,
        max: 250,
        required: true,
        fieldId: 'altura'
      },
      response: 175,
      description: 'Campo de altura com validação'
    },
    {
      config: {
        id: 'current_weight_test',
        type: 'current_weight',
        question: 'Qual é o seu peso atual?',
        unit: 'kg',
        min: 30,
        max: 200,
        required: true,
        fieldId: 'peso_atual'
      },
      response: 70,
      description: 'Peso atual para IMC'
    },
    {
      config: {
        id: 'target_weight_test',
        type: 'target_weight',
        question: 'Qual é o seu peso desejado?',
        unit: 'kg',
        min: 30,
        max: 200,
        required: true,
        fieldId: 'peso_desejado'
      },
      response: 65,
      description: 'Peso desejado para metas'
    },
    {
      config: {
        id: 'image_upload_test',
        type: 'image_upload',
        question: 'Envie uma foto sua:',
        accept: '.jpg,.jpeg,.png,.webp',
        maxSize: 5,
        fieldId: 'foto_perfil'
      },
      response: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQ==',
      description: 'Upload de imagem com validação'
    }
  ];
  
  for (const element of formElements) {
    const start = Date.now();
    const result = await testElementType(element.config, element.response);
    const time = Date.now() - start;
    
    results.total++;
    if (result.success) {
      results.passed++;
      logElement(element.config.type, true, 
        `${element.description} - ${result.variablesCount} variáveis`, 
        `${time}ms`);
    } else {
      results.failed++;
      logElement(element.config.type, false, result.error, `${time}ms`);
      results.details.push(`${element.config.type}: ${result.error}`);
    }
  }
  
  // ========================================
  // CATEGORIA: NAVEGAÇÃO
  // ========================================
  logCategory('ELEMENTOS DE NAVEGAÇÃO');
  
  const navigationElements = [
    {
      config: {
        id: 'continue_button_test',
        type: 'continue_button',
        text: 'Continuar',
        style: 'primary',
        size: 'lg'
      },
      response: undefined,
      description: 'Botão de continuar personalizado'
    },
    {
      config: {
        id: 'share_quiz_test',
        type: 'share_quiz',
        message: 'Compartilhe este quiz com seus amigos!',
        networks: ['whatsapp', 'facebook', 'twitter', 'email'],
        layout: 'grid'
      },
      response: undefined,
      description: 'Compartilhamento em redes sociais'
    }
  ];
  
  for (const element of navigationElements) {
    const start = Date.now();
    const result = await testElementType(element.config, element.response);
    const time = Date.now() - start;
    
    results.total++;
    if (result.success) {
      results.passed++;
      logElement(element.config.type, true, element.description, `${time}ms`);
    } else {
      results.failed++;
      logElement(element.config.type, false, result.error, `${time}ms`);
      results.details.push(`${element.config.type}: ${result.error}`);
    }
  }
  
  // ========================================
  // CATEGORIA: JOGOS
  // ========================================
  logCategory('ELEMENTOS DE JOGOS');
  
  const gameElements = [
    {
      config: {
        id: 'wheel_test',
        type: 'wheel',
        question: 'Gire a roleta da sorte!',
        options: [
          { id: 'prize1', text: 'Desconto 10%', color: '#ff6b6b' },
          { id: 'prize2', text: 'Desconto 20%', color: '#4ecdc4' },
          { id: 'prize3', text: 'Desconto 30%', color: '#45b7d1' },
          { id: 'prize4', text: 'Frete Grátis', color: '#f9ca24' }
        ],
        fieldId: 'premio_roleta'
      },
      response: 'prize2',
      description: 'Roleta da sorte interativa'
    },
    {
      config: {
        id: 'scratch_test',
        type: 'scratch',
        question: 'Raspe e ganhe!',
        prize: 'Desconto de 25%',
        coverImage: 'https://via.placeholder.com/200x100/silver/white?text=Raspadinha',
        fieldId: 'premio_raspadinha'
      },
      response: 'Desconto de 25%',
      description: 'Raspadinha virtual'
    },
    {
      config: {
        id: 'memory_cards_test',
        type: 'memory_cards',
        question: 'Jogue o jogo da memória!',
        cards: [
          { id: 'card1', image: '🎯', pair: 'target' },
          { id: 'card2', image: '🎯', pair: 'target' },
          { id: 'card3', image: '🎮', pair: 'game' },
          { id: 'card4', image: '🎮', pair: 'game' }
        ],
        fieldId: 'resultado_memoria'
      },
      response: 'completed',
      description: 'Jogo da memória com cartas'
    }
  ];
  
  for (const element of gameElements) {
    const start = Date.now();
    const result = await testElementType(element.config, element.response);
    const time = Date.now() - start;
    
    results.total++;
    if (result.success) {
      results.passed++;
      logElement(element.config.type, true, 
        `${element.description} - ${result.variablesCount} variáveis`, 
        `${time}ms`);
    } else {
      results.failed++;
      logElement(element.config.type, false, result.error, `${time}ms`);
      results.details.push(`${element.config.type}: ${result.error}`);
    }
  }
  
  // ========================================
  // RELATÓRIO FINAL
  // ========================================
  console.log('\n📊 RELATÓRIO FINAL DE ELEMENTOS');
  console.log('='.repeat(80));
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`✅ Elementos testados: ${results.total}`);
  console.log(`✅ Elementos funcionais: ${results.passed}`);
  console.log(`❌ Elementos com problemas: ${results.failed}`);
  console.log(`📈 Taxa de sucesso: ${successRate}%`);
  
  if (results.details.length > 0) {
    console.log('\n🔍 PROBLEMAS IDENTIFICADOS:');
    results.details.forEach((detail, index) => {
      console.log(`   ${index + 1}. ${detail}`);
    });
  }
  
  console.log('\n🎯 RESUMO POR CATEGORIA:');
  console.log(`📝 Conteúdo: ${contentElements.length} elementos`);
  console.log(`❓ Perguntas: ${questionElements.length} elementos`);
  console.log(`📋 Formulário: ${formElements.length} elementos`);
  console.log(`🧭 Navegação: ${navigationElements.length} elementos`);
  console.log(`🎮 Jogos: ${gameElements.length} elementos`);
  
  console.log('\n🎯 STATUS FINAL:');
  if (results.passed === results.total) {
    console.log('✅ TODOS OS ELEMENTOS FUNCIONANDO PERFEITAMENTE!');
    console.log('🚀 Sistema de quiz completo e operacional');
  } else if (successRate >= 90) {
    console.log('⚠️  SISTEMA QUASE PERFEITO - POUCOS AJUSTES NECESSÁRIOS');
    console.log('🔧 Corrija os problemas identificados para 100% de funcionalidade');
  } else if (successRate >= 75) {
    console.log('⚠️  SISTEMA MAJORITARIAMENTE FUNCIONAL');
    console.log('🛠️  Revise e corrija os elementos com problemas');
  } else {
    console.log('❌ SISTEMA NECESSITA CORREÇÕES SIGNIFICATIVAS');
    console.log('🔧 Foque na correção dos elementos básicos primeiro');
  }
  
  console.log('\n='.repeat(80));
  return results;
}

// Executar teste
executarTesteElementos().catch(console.error);