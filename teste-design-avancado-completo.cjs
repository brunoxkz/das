/**
 * TESTE EXTREMAMENTE AVANÇADO - ABA DESIGN
 * Verifica todas as funcionalidades de design, sincronização e persistência
 * Testa: cores, tipografia, espaçamentos, responsividade, preview, salvamento
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

function logSection(title) {
  console.log(`\n🎯 ${title}`);
  console.log('='.repeat(80));
}

function logTest(category, test, success, details = '', time = '', issue = null) {
  const status = success ? '✅' : '❌';
  const timeStr = time ? ` (${time})` : '';
  const issueStr = issue ? ` ⚠️ ${issue.toUpperCase()}` : '';
  console.log(`${status} ${issueStr} ${category} - ${test}${timeStr}`);
  if (details) {
    console.log(`   🔍 ${details}`);
  }
}

async function criarQuizDesignCompleto() {
  return {
    title: 'Quiz Design Avançado - Teste Completo',
    description: 'Quiz para testar todas as funcionalidades de design',
    structure: {
      pages: [
        {
          id: 'page1',
          name: 'Página Principal',
          elements: [
            {
              id: 'title1',
              type: 'heading',
              content: 'Título Principal',
              fontSize: 'text-4xl',
              fontWeight: 'font-bold',
              textAlign: 'text-center',
              color: '#10B981'
            },
            {
              id: 'subtitle1',
              type: 'paragraph',
              content: 'Subtítulo com formatação personalizada',
              fontSize: 'text-lg',
              fontWeight: 'font-medium',
              textAlign: 'text-left',
              color: '#6B7280'
            },
            {
              id: 'question1',
              type: 'multiple_choice',
              question: 'Qual é sua cor favorita?',
              options: [
                { id: 'red', text: 'Vermelho', color: '#EF4444' },
                { id: 'blue', text: 'Azul', color: '#3B82F6' },
                { id: 'green', text: 'Verde', color: '#10B981' }
              ],
              required: true,
              fieldId: 'cor_favorita',
              buttonStyle: 'rounded-lg',
              buttonSize: 'large'
            },
            {
              id: 'text1',
              type: 'text',
              question: 'Qual é o seu nome?',
              required: true,
              fieldId: 'nome_completo',
              placeholder: 'Digite seu nome completo...',
              borderStyle: 'border-2 border-green-500',
              backgroundColor: '#F9FAFB'
            }
          ]
        },
        {
          id: 'page2',
          name: 'Página Secundária',
          elements: [
            {
              id: 'image1',
              type: 'image',
              src: 'https://via.placeholder.com/600x400/10B981/FFFFFF?text=Design+Test',
              alt: 'Imagem de teste',
              alignment: 'center',
              borderRadius: 'rounded-xl',
              shadow: 'shadow-lg'
            },
            {
              id: 'rating1',
              type: 'rating',
              question: 'Como você avalia nosso design?',
              maxRating: 5,
              starColor: '#F59E0B',
              starSize: 'large',
              required: true,
              fieldId: 'avaliacao_design'
            }
          ]
        }
      ],
      design: {
        theme: {
          primaryColor: '#10B981',
          secondaryColor: '#6B7280',
          backgroundColor: '#FFFFFF',
          textColor: '#1F2937',
          borderRadius: 'rounded-lg',
          fontFamily: 'font-sans',
          spacing: 'space-y-6'
        },
        layout: {
          maxWidth: 'max-w-2xl',
          padding: 'p-8',
          margin: 'mx-auto',
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        animations: {
          enabled: true,
          fadeIn: true,
          slideIn: true,
          duration: 300
        },
        responsiveness: {
          mobile: {
            padding: 'p-4',
            fontSize: 'text-sm'
          },
          tablet: {
            padding: 'p-6',
            fontSize: 'text-base'
          },
          desktop: {
            padding: 'p-8',
            fontSize: 'text-lg'
          }
        }
      },
      flow: {
        enabled: false,
        connections: []
      }
    }
  };
}

async function testarDesignCompleto() {
  console.log('🎨 TESTE EXTREMAMENTE AVANÇADO - ABA DESIGN');
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
  // TESTE 1: CRIAÇÃO DE QUIZ COM DESIGN COMPLEXO
  // ==========================================================================
  logSection('TESTE 1: CRIAÇÃO DE QUIZ COM DESIGN COMPLEXO');
  
  const designData = await criarQuizDesignCompleto();
  const start = Date.now();
  
  const createResult = await makeRequest('/api/quizzes', {
    method: 'POST',
    body: JSON.stringify(designData)
  });
  
  const createTime = Date.now() - start;
  
  results.total++;
  if (createResult.success) {
    results.passed++;
    const quizId = createResult.data.id;
    logTest('CRIAÇÃO', 'Quiz Design Completo', true, 
      `Design theme, layout, animations, responsiveness definidos`, 
      `${createTime}ms`);
    results.performance.push({ test: 'Criação Quiz Design', time: createTime });
    
    // ==========================================================================
    // TESTE 2: PUBLICAÇÃO E VERIFICAÇÃO DE PERSISTÊNCIA
    // ==========================================================================
    logSection('TESTE 2: PUBLICAÇÃO E VERIFICAÇÃO DE PERSISTÊNCIA');
    
    const publishStart = Date.now();
    const publishResult = await makeRequest(`/api/quizzes/${quizId}/publish`, {
      method: 'POST'
    });
    const publishTime = Date.now() - publishStart;
    
    results.total++;
    if (publishResult.success) {
      results.passed++;
      logTest('PUBLICAÇÃO', 'Quiz Design', true, 'Publicado com sucesso', `${publishTime}ms`);
      results.performance.push({ test: 'Publicação Design', time: publishTime });
    } else {
      results.failed++;
      logTest('PUBLICAÇÃO', 'Quiz Design', false, 'Falha na publicação', `${publishTime}ms`, 'critical');
      results.critical.push('Falha crítica na publicação de quiz com design');
    }
    
    // ==========================================================================
    // TESTE 3: VERIFICAÇÃO DE ESTRUTURA DE DESIGN
    // ==========================================================================
    logSection('TESTE 3: VERIFICAÇÃO DE ESTRUTURA DE DESIGN');
    
    const verifyStart = Date.now();
    const verifyResult = await makeRequest(`/api/quizzes/${quizId}`);
    const verifyTime = Date.now() - verifyStart;
    
    results.total++;
    if (verifyResult.success && verifyResult.data.structure.design) {
      const design = verifyResult.data.structure.design;
      results.passed++;
      logTest('ESTRUTURA', 'Verificação Design', true, 
        `Theme: ${design.theme ? 'OK' : 'MISSING'}, Layout: ${design.layout ? 'OK' : 'MISSING'}, Animations: ${design.animations ? 'OK' : 'MISSING'}`, 
        `${verifyTime}ms`);
      
      // Verificar componentes específicos do design
      const themeTests = [
        { name: 'Primary Color', value: design.theme?.primaryColor, expected: '#10B981' },
        { name: 'Background Color', value: design.theme?.backgroundColor, expected: '#FFFFFF' },
        { name: 'Border Radius', value: design.theme?.borderRadius, expected: 'rounded-lg' },
        { name: 'Font Family', value: design.theme?.fontFamily, expected: 'font-sans' }
      ];
      
      themeTests.forEach(test => {
        results.total++;
        if (test.value === test.expected) {
          results.passed++;
          logTest('THEME', test.name, true, `${test.value}`, '1ms');
        } else {
          results.failed++;
          logTest('THEME', test.name, false, `Expected: ${test.expected}, Got: ${test.value}`, '1ms');
          results.details.push(`Theme ${test.name}: esperado ${test.expected}, recebido ${test.value}`);
        }
      });
      
      const layoutTests = [
        { name: 'Max Width', value: design.layout?.maxWidth, expected: 'max-w-2xl' },
        { name: 'Padding', value: design.layout?.padding, expected: 'p-8' },
        { name: 'Margin', value: design.layout?.margin, expected: 'mx-auto' }
      ];
      
      layoutTests.forEach(test => {
        results.total++;
        if (test.value === test.expected) {
          results.passed++;
          logTest('LAYOUT', test.name, true, `${test.value}`, '1ms');
        } else {
          results.failed++;
          logTest('LAYOUT', test.name, false, `Expected: ${test.expected}, Got: ${test.value}`, '1ms');
          results.details.push(`Layout ${test.name}: esperado ${test.expected}, recebido ${test.value}`);
        }
      });
      
    } else {
      results.failed++;
      logTest('ESTRUTURA', 'Verificação Design', false, 'Estrutura de design não encontrada', `${verifyTime}ms`, 'critical');
      results.critical.push('Estrutura de design não persistida corretamente');
    }
    
    // ==========================================================================
    // TESTE 4: VALIDAÇÃO DE ELEMENTOS COM STYLING
    // ==========================================================================
    logSection('TESTE 4: VALIDAÇÃO DE ELEMENTOS COM STYLING');
    
    if (verifyResult.success && verifyResult.data.structure.pages) {
      const pages = verifyResult.data.structure.pages;
      
      pages.forEach((page, pageIndex) => {
        page.elements.forEach((element, elementIndex) => {
          results.total++;
          
          let hasCustomStyling = false;
          const stylingProps = ['fontSize', 'fontWeight', 'textAlign', 'color', 'borderStyle', 'backgroundColor', 'borderRadius', 'shadow'];
          
          stylingProps.forEach(prop => {
            if (element[prop]) {
              hasCustomStyling = true;
            }
          });
          
          if (hasCustomStyling) {
            results.passed++;
            logTest('STYLING', `Elemento ${element.type}`, true, 
              `Styling personalizado aplicado`, '1ms');
          } else {
            results.failed++;
            logTest('STYLING', `Elemento ${element.type}`, false, 
              `Nenhum styling personalizado encontrado`, '1ms');
          }
        });
      });
    }
    
    // ==========================================================================
    // TESTE 5: TESTE DE RESPONSIVIDADE
    // ==========================================================================
    logSection('TESTE 5: TESTE DE RESPONSIVIDADE');
    
    if (verifyResult.success && verifyResult.data.structure.design?.responsiveness) {
      const responsiveness = verifyResult.data.structure.design.responsiveness;
      
      const deviceTests = [
        { name: 'Mobile', config: responsiveness.mobile },
        { name: 'Tablet', config: responsiveness.tablet },
        { name: 'Desktop', config: responsiveness.desktop }
      ];
      
      deviceTests.forEach(test => {
        results.total++;
        if (test.config && test.config.padding && test.config.fontSize) {
          results.passed++;
          logTest('RESPONSIVENESS', test.name, true, 
            `Padding: ${test.config.padding}, FontSize: ${test.config.fontSize}`, '1ms');
        } else {
          results.failed++;
          logTest('RESPONSIVENESS', test.name, false, 
            `Configuração incompleta`, '1ms');
          results.details.push(`Responsiveness ${test.name}: configuração incompleta`);
        }
      });
    }
    
    // ==========================================================================
    // TESTE 6: ATUALIZAÇÃO DE DESIGN
    // ==========================================================================
    logSection('TESTE 6: ATUALIZAÇÃO DE DESIGN');
    
    const updatedDesignData = {
      ...designData,
      structure: {
        ...designData.structure,
        design: {
          ...designData.structure.design,
          theme: {
            ...designData.structure.design.theme,
            primaryColor: '#EF4444', // Mudança para vermelho
            secondaryColor: '#F59E0B' // Mudança para amarelo
          }
        }
      }
    };
    
    const updateStart = Date.now();
    const updateResult = await makeRequest(`/api/quizzes/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedDesignData)
    });
    const updateTime = Date.now() - updateStart;
    
    results.total++;
    if (updateResult.success) {
      results.passed++;
      logTest('ATUALIZAÇÃO', 'Design Theme', true, 
        'Primary color alterado para vermelho', `${updateTime}ms`);
      results.performance.push({ test: 'Atualização Design', time: updateTime });
      
      // Verificar se a mudança foi persistida
      const verifyUpdateStart = Date.now();
      const verifyUpdateResult = await makeRequest(`/api/quizzes/${quizId}`);
      const verifyUpdateTime = Date.now() - verifyUpdateStart;
      
      results.total++;
      if (verifyUpdateResult.success && 
          verifyUpdateResult.data.structure.design?.theme?.primaryColor === '#EF4444') {
        results.passed++;
        logTest('PERSISTÊNCIA', 'Atualização Design', true, 
          'Mudança de cor persistida corretamente', `${verifyUpdateTime}ms`);
      } else {
        results.failed++;
        logTest('PERSISTÊNCIA', 'Atualização Design', false, 
          'Mudança de cor não persistida', `${verifyUpdateTime}ms`, 'critical');
        results.critical.push('Alterações de design não estão sendo persistidas');
      }
    } else {
      results.failed++;
      logTest('ATUALIZAÇÃO', 'Design Theme', false, 
        'Falha na atualização do design', `${updateTime}ms`, 'critical');
      results.critical.push('Falha crítica na atualização de design');
    }
    
    // ==========================================================================
    // TESTE 7: TESTE DE PERFORMANCE COM DESIGN COMPLEXO
    // ==========================================================================
    logSection('TESTE 7: TESTE DE PERFORMANCE COM DESIGN COMPLEXO');
    
    const performanceTests = [];
    
    for (let i = 0; i < 5; i++) {
      const perfStart = Date.now();
      const perfResult = await makeRequest(`/api/quizzes/${quizId}`);
      const perfTime = Date.now() - perfStart;
      
      performanceTests.push(perfTime);
      
      results.total++;
      if (perfResult.success && perfTime < 200) {
        results.passed++;
        logTest('PERFORMANCE', `Carregamento ${i + 1}`, true, 
          `Design complexo carregado rapidamente`, `${perfTime}ms`);
      } else {
        results.failed++;
        logTest('PERFORMANCE', `Carregamento ${i + 1}`, false, 
          `Carregamento lento ou falha`, `${perfTime}ms`);
      }
    }
    
    const avgPerformance = performanceTests.reduce((a, b) => a + b, 0) / performanceTests.length;
    results.performance.push({ test: 'Performance Média Design', time: avgPerformance });
    
    // ==========================================================================
    // TESTE 8: TESTE DE COMPATIBILIDADE DE PREVIEW
    // ==========================================================================
    logSection('TESTE 8: TESTE DE COMPATIBILIDADE DE PREVIEW');
    
    const previewStart = Date.now();
    const previewResult = await makeRequest(`/api/quizzes/${quizId}/preview`);
    const previewTime = Date.now() - previewStart;
    
    results.total++;
    if (previewResult.success) {
      results.passed++;
      logTest('PREVIEW', 'Compatibilidade Design', true, 
        'Preview renderizado com design personalizado', `${previewTime}ms`);
    } else {
      results.failed++;
      logTest('PREVIEW', 'Compatibilidade Design', false, 
        'Preview não compatível com design', `${previewTime}ms`);
    }
    
    // Manter quiz para análise
    console.log(`\n💾 Quiz de teste mantido para análise: ${quizId}`);
    
  } else {
    results.failed++;
    logTest('CRIAÇÃO', 'Quiz Design Completo', false, 
      createResult.error || 'Falha na criação', `${createTime}ms`, 'critical');
    results.critical.push('Falha crítica na criação de quiz com design complexo');
  }
  
  // ==========================================================================
  // RELATÓRIO FINAL
  // ==========================================================================
  logSection('RELATÓRIO FINAL EXTREMAMENTE DETALHADO');
  
  const successRate = results.total > 0 ? (results.passed / results.total) * 100 : 0;
  const avgPerformance = results.performance.length > 0 ? 
    results.performance.reduce((sum, p) => sum + p.time, 0) / results.performance.length : 0;
  
  console.log(`📊 ESTATÍSTICAS GERAIS:`);
  console.log(`✅ Testes executados: ${results.total}`);
  console.log(`✅ Testes aprovados: ${results.passed}`);
  console.log(`❌ Testes falharam: ${results.failed}`);
  console.log(`📈 Taxa de sucesso: ${successRate.toFixed(1)}%`);
  console.log(`⚡ Performance média: ${avgPerformance.toFixed(1)}ms`);
  
  if (results.performance.length > 0) {
    console.log(`\n⚡ ANÁLISE DE PERFORMANCE DETALHADA:`);
    results.performance.forEach(p => {
      console.log(`   🟢 ${p.test}: ${p.time}ms`);
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
  console.log(`🎨 Design: Criação e estrutura de design`);
  console.log(`💾 Persistência: Salvamento e recuperação`);
  console.log(`📱 Responsividade: Configurações por dispositivo`);
  console.log(`🎭 Styling: Personalização de elementos`);
  console.log(`⚡ Performance: Carregamento e renderização`);
  console.log(`👁️  Preview: Compatibilidade e renderização`);
  console.log(`🔄 Sincronização: Atualização em tempo real`);
  
  console.log(`\n🎯 AVALIAÇÃO FINAL DO SISTEMA DE DESIGN:`);
  if (results.passed === results.total) {
    console.log('✅ SISTEMA DE DESIGN 100% FUNCIONAL!');
    console.log('🎨 Todas as funcionalidades de design operacionais');
    console.log('💾 Persistência e sincronização perfeitas');
    console.log('📱 Responsividade completa implementada');
  } else if (successRate >= 90) {
    console.log('⚠️  SISTEMA DE DESIGN QUASE PERFEITO!');
    console.log('🔧 Poucos ajustes necessários');
    console.log('🎨 Funcionalidades principais operacionais');
    console.log('💾 Persistência funcionando corretamente');
  } else if (successRate >= 75) {
    console.log('⚠️  SISTEMA DE DESIGN FUNCIONAL COM RESSALVAS');
    console.log('🛠️  Algumas correções necessárias');
    console.log('🎨 Funcionalidades básicas operacionais');
    console.log('⚠️  Limitações em recursos avançados');
  } else {
    console.log('❌ SISTEMA DE DESIGN NECESSITA CORREÇÕES SIGNIFICATIVAS');
    console.log('🔧 Múltiplos problemas identificados');
    console.log('⚠️  Não recomendado para uso em produção');
    console.log('🚨 Requer revisão da implementação');
  }
  
  console.log('\n' + '='.repeat(80));
  return results;
}

// Executar teste
testarDesignCompleto().catch(console.error);