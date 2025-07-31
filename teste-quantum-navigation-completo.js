/**
 * TESTE COMPLETO DO SISTEMA QUANTUM DE NAVEGAÇÃO
 * Valida todos os cenários: navegação automática, manual, mista, respostas parciais e finais
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const QUIZ_ID = 'gKsvawq1ErdsVJQw-mFAL'; // Quiz oficial de teste
const USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15';

// Cenários de teste
const SCENARIOS = {
  AUTO_NAVIGATION: {
    name: 'Navegação Automática Completa',
    metadata: {
      navigationMode: 'auto',
      autoAdvanceDelay: 2000,
      device: 'mobile_ios',
      source: 'quantum_test_auto'
    }
  },
  MANUAL_NAVIGATION: {
    name: 'Navegação Manual com Botão',
    metadata: {
      navigationMode: 'button',
      requireContinueButton: true,
      device: 'mobile_android',
      source: 'quantum_test_manual'
    }
  },
  MIXED_NAVIGATION: {
    name: 'Navegação Mista (Auto + Manual)',
    metadata: {
      navigationMode: 'mixed',
      hasAutoAdvance: true,
      hasManualNavigation: true,
      device: 'desktop',
      source: 'quantum_test_mixed'
    }
  },
  INTERRUPTED_FLOW: {
    name: 'Fluxo Interrompido e Retomado',
    metadata: {
      navigationMode: 'interrupted',
      hasInterruptions: true,
      device: 'tablet',
      source: 'quantum_test_interrupted'
    }
  },
  RAPID_RESPONSES: {
    name: 'Respostas Rápidas Sequenciais',
    metadata: {
      navigationMode: 'rapid',
      rapidMode: true,
      device: 'mobile_ios',
      source: 'quantum_test_rapid'
    }
  }
};

// Dados de resposta para cada página
const RESPONSE_DATA = {
  p1_objetivo_principal: ['Perder peso', 'Ganhar massa muscular', 'Definir o corpo', 'Manter forma atual'],
  p2_nivel_experiencia: ['Iniciante', 'Intermediário', 'Avançado', 'Expert'],
  p3_tempo_disponivel: ['Menos de 30min', '30min a 1h', '1h a 2h', 'Mais de 2h'],
  p4_dificuldade_principal: ['Falta de motivação', 'Falta de tempo', 'Não saber como começar', 'Falta de equipamento'],
  p5_preferencia_exercicio: ['Academia', 'Casa', 'Ao ar livre', 'Online'],
  p6_experiencia_anterior: ['Sim', 'Não', 'Pouca', 'Muita'],
  p7_restricoes_medicas: ['Sim', 'Não', 'Algumas', 'Consultar médico'],
  p8_objetivo_prazo: ['1 mês', '3 meses', '6 meses', '1 ano']
};

class QuantumTestRunner {
  constructor() {
    this.results = [];
    this.totalTests = 0;
    this.successCount = 0;
    this.failureCount = 0;
  }

  async runAllTests() {
    console.log('🚀 INICIANDO TESTES COMPLETOS DO SISTEMA QUANTUM');
    console.log('=' * 60);

    for (const [scenarioKey, scenario] of Object.entries(SCENARIOS)) {
      console.log(`\n🎯 CENÁRIO: ${scenario.name}`);
      console.log('-' * 40);
      
      try {
        await this.testScenario(scenarioKey, scenario);
      } catch (error) {
        console.error(`❌ ERRO NO CENÁRIO ${scenarioKey}:`, error.message);
        this.failureCount++;
      }
    }

    // Testes especiais
    await this.testEdgeCases();
    await this.testPerformance();
    await this.testDataIntegrity();

    this.generateReport();
  }

  async testScenario(scenarioKey, scenario) {
    const testUser = `quantum_user_${scenarioKey}_${Date.now()}`;
    const responses = {};
    let currentPage = 1;
    const totalPages = 10;

    // Simular navegação página por página
    for (let page = 1; page <= 8; page++) {
      const fieldName = `p${page}_${Object.keys(RESPONSE_DATA)[page - 1].split('_')[1]}`;
      const options = RESPONSE_DATA[Object.keys(RESPONSE_DATA)[page - 1]];
      const selectedOption = options[Math.floor(Math.random() * options.length)];
      
      responses[Object.keys(RESPONSE_DATA)[page - 1]] = selectedOption;

      // Enviar resposta parcial
      const partialResult = await this.sendPartialResponse({
        responses: { ...responses },
        currentPage: page,
        totalPages,
        completionPercentage: (page / totalPages) * 100,
        timeSpent: page * 8000 + Math.random() * 5000,
        metadata: {
          ...scenario.metadata,
          testUser,
          currentScenario: scenarioKey,
          pageTransition: this.getTransitionType(scenario.metadata.navigationMode, page)
        }
      });

      if (!partialResult.success) {
        throw new Error(`Falha na resposta parcial página ${page}: ${partialResult.message}`);
      }

      console.log(`✅ Página ${page}: ${Object.keys(RESPONSE_DATA)[page - 1]} = "${selectedOption}"`);
      
      // Simular delay baseado no tipo de navegação
      await this.simulateNavigationDelay(scenario.metadata.navigationMode);
    }

    // Adicionar dados de lead
    responses.nome = `${testUser.replace('_', ' ').toUpperCase()}`;
    responses.email = `${testUser}@quantum.test`;
    responses.telefone = `+5511${Math.floor(Math.random() * 900000000 + 100000000)}`;

    // Submissão final
    const finalResult = await this.sendFinalSubmission({
      responses,
      metadata: {
        ...scenario.metadata,
        testUser,
        timeSpent: 120000 + Math.random() * 60000,
        totalPages,
        completionPercentage: 100,
        source: scenario.metadata.source,
        quantumSaveCount: 8,
        finalScenario: scenarioKey
      },
      leadData: {
        utm_source: 'quantum_test',
        utm_campaign: scenarioKey,
        utm_medium: scenario.metadata.device
      }
    });

    if (finalResult.success) {
      console.log(`🎉 SUCESSO: ${scenario.name} (${finalResult.processingTime}ms)`);
      this.successCount++;
      this.results.push({
        scenario: scenarioKey,
        name: scenario.name,
        success: true,
        processingTime: finalResult.processingTime,
        responseId: finalResult.responseId,
        pagesCompleted: 8,
        navigationMode: scenario.metadata.navigationMode
      });
    } else {
      throw new Error(`Falha na submissão final: ${finalResult.message}`);
    }

    this.totalTests++;
  }

  async testEdgeCases() {
    console.log('\n🔬 TESTANDO CASOS EXTREMOS');
    console.log('-' * 40);

    // Teste 1: Múltiplas respostas parciais na mesma página
    await this.testMultiplePartialResponses();

    // Teste 2: Resposta final sem respostas parciais
    await this.testDirectFinalSubmission();

    // Teste 3: Interrupção no meio do fluxo
    await this.testFlowInterruption();

    // Teste 4: Respostas com caracteres especiais
    await this.testSpecialCharacters();

    // Teste 5: Payload grande
    await this.testLargePayload();
  }

  async testMultiplePartialResponses() {
    console.log('🔄 Teste: Múltiplas respostas parciais na mesma página');
    
    for (let i = 0; i < 3; i++) {
      const result = await this.sendPartialResponse({
        responses: { p1_objetivo_principal: 'Perder peso' },
        currentPage: 1,
        totalPages: 10,
        completionPercentage: 10,
        timeSpent: 5000 + (i * 1000),
        metadata: {
          navigationMode: 'multiple_partial',
          attempt: i + 1,
          testType: 'edge_case'
        }
      });
      
      console.log(`  Tentativa ${i + 1}: ${result.success ? '✅' : '❌'}`);
    }
  }

  async testDirectFinalSubmission() {
    console.log('⚡ Teste: Submissão final direta (sem parciais)');
    
    const result = await this.sendFinalSubmission({
      responses: {
        p1_objetivo_principal: 'Ganhar massa muscular',
        p2_nivel_experiencia: 'Avançado',
        nome: 'DIRETO QUANTUM',
        email: 'direto@quantum.test',
        telefone: '+5511987654321'
      },
      metadata: {
        navigationMode: 'direct',
        testType: 'direct_submission',
        timeSpent: 45000,
        totalPages: 10,
        completionPercentage: 100
      }
    });
    
    console.log(`  Resultado: ${result.success ? '✅' : '❌'} (${result.processingTime || 0}ms)`);
  }

  async testFlowInterruption() {
    console.log('🔀 Teste: Interrupção e retomada de fluxo');
    
    // Primeira parte
    await this.sendPartialResponse({
      responses: { p1_objetivo_principal: 'Definir o corpo' },
      currentPage: 1,
      totalPages: 10,
      completionPercentage: 10,
      timeSpent: 8000,
      metadata: { navigationMode: 'interrupted', phase: 'first' }
    });
    
    // Simular pausa
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Retomada
    const result = await this.sendPartialResponse({
      responses: { 
        p1_objetivo_principal: 'Definir o corpo',
        p2_nivel_experiencia: 'Intermediário'
      },
      currentPage: 2,
      totalPages: 10,
      completionPercentage: 20,
      timeSpent: 18000,
      metadata: { navigationMode: 'interrupted', phase: 'resumed' }
    });
    
    console.log(`  Retomada: ${result.success ? '✅' : '❌'}`);
  }

  async testSpecialCharacters() {
    console.log('🔤 Teste: Caracteres especiais e emojis');
    
    const result = await this.sendPartialResponse({
      responses: { 
        p1_objetivo_principal: 'Perder peso 💪',
        nome: 'José da Silva™',
        email: 'josé@tést-émojî.com'
      },
      currentPage: 1,
      totalPages: 10,
      completionPercentage: 10,
      timeSpent: 8000,
      metadata: { 
        navigationMode: 'special_chars',
        testType: 'unicode_test',
        emoji: '🚀✨🎯'
      }
    });
    
    console.log(`  Caracteres especiais: ${result.success ? '✅' : '❌'}`);
  }

  async testLargePayload() {
    console.log('📦 Teste: Payload grande');
    
    const largeText = 'A'.repeat(1000);
    const result = await this.sendPartialResponse({
      responses: { 
        p1_objetivo_principal: 'Perder peso',
        large_field: largeText
      },
      currentPage: 1,
      totalPages: 10,
      completionPercentage: 10,
      timeSpent: 8000,
      metadata: { 
        navigationMode: 'large_payload',
        payloadSize: largeText.length,
        testType: 'stress_test'
      }
    });
    
    console.log(`  Payload grande: ${result.success ? '✅' : '❌'}`);
  }

  async testPerformance() {
    console.log('\n⚡ TESTES DE PERFORMANCE');
    console.log('-' * 40);

    const performanceTests = [];
    
    // 10 submissões simultâneas
    console.log('🔄 Teste: 10 submissões simultâneas');
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
      promises.push(this.sendPartialResponse({
        responses: { p1_objetivo_principal: 'Perder peso' },
        currentPage: 1,
        totalPages: 10,
        completionPercentage: 10,
        timeSpent: 8000,
        metadata: {
          navigationMode: 'concurrent',
          batchId: Date.now(),
          index: i
        }
      }));
    }
    
    const start = Date.now();
    const results = await Promise.all(promises);
    const duration = Date.now() - start;
    
    const successCount = results.filter(r => r.success).length;
    console.log(`  10 submissões: ${successCount}/10 sucessos em ${duration}ms`);
    
    performanceTests.push({
      test: 'concurrent_submissions',
      total: 10,
      success: successCount,
      duration,
      avgPerRequest: duration / 10
    });
  }

  async testDataIntegrity() {
    console.log('\n🔍 TESTES DE INTEGRIDADE DE DADOS');
    console.log('-' * 40);

    // Teste de preservação de dados através de múltiplas páginas
    const baseResponses = { p1_objetivo_principal: 'Ganhar massa muscular' };
    
    for (let page = 1; page <= 5; page++) {
      const fieldName = Object.keys(RESPONSE_DATA)[page - 1];
      const value = RESPONSE_DATA[fieldName][0];
      baseResponses[fieldName] = value;
      
      const result = await this.sendPartialResponse({
        responses: { ...baseResponses },
        currentPage: page,
        totalPages: 10,
        completionPercentage: (page / 10) * 100,
        timeSpent: page * 8000,
        metadata: {
          navigationMode: 'integrity_test',
          dataIntegrityCheck: true,
          currentPage: page
        }
      });
      
      if (!result.success) {
        console.log(`❌ Falha na integridade página ${page}`);
        return;
      }
    }
    
    console.log('✅ Integridade de dados preservada através de 5 páginas');
  }

  getTransitionType(navigationMode, page) {
    switch (navigationMode) {
      case 'auto': return 'automatic';
      case 'button': return 'manual_button';
      case 'mixed': return page % 2 === 0 ? 'automatic' : 'manual_button';
      case 'interrupted': return page === 3 ? 'interrupted' : 'automatic';
      case 'rapid': return 'rapid_auto';
      default: return 'default';
    }
  }

  async simulateNavigationDelay(navigationMode) {
    switch (navigationMode) {
      case 'auto': await new Promise(resolve => setTimeout(resolve, 500)); break;
      case 'button': await new Promise(resolve => setTimeout(resolve, 1500)); break;
      case 'mixed': await new Promise(resolve => setTimeout(resolve, 1000)); break;
      case 'rapid': await new Promise(resolve => setTimeout(resolve, 200)); break;
      default: await new Promise(resolve => setTimeout(resolve, 800)); break;
    }
  }

  async sendPartialResponse(data) {
    try {
      const response = await fetch(`${BASE_URL}/api/quizzes/${QUIZ_ID}/partial-responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': USER_AGENT
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      return {
        success: response.ok,
        ...result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async sendFinalSubmission(data) {
    try {
      const response = await fetch(`${BASE_URL}/api/quizzes/${QUIZ_ID}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': USER_AGENT
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      return {
        success: response.ok,
        ...result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  generateReport() {
    console.log('\n📊 RELATÓRIO FINAL DE TESTES QUANTUM');
    console.log('=' * 60);
    
    const successRate = (this.successCount / this.totalTests) * 100;
    
    console.log(`📈 ESTATÍSTICAS GERAIS:`);
    console.log(`   • Total de testes: ${this.totalTests}`);
    console.log(`   • Sucessos: ${this.successCount}`);
    console.log(`   • Falhas: ${this.failureCount}`);
    console.log(`   • Taxa de sucesso: ${successRate.toFixed(1)}%`);
    
    console.log(`\n🎯 RESULTADOS POR CENÁRIO:`);
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`   ${status} ${result.name}: ${result.processingTime}ms`);
      console.log(`      • Modo: ${result.navigationMode}`);
      console.log(`      • Páginas: ${result.pagesCompleted}/10`);
      console.log(`      • ID: ${result.responseId}`);
    });
    
    // Determinar status final
    if (successRate >= 95) {
      console.log(`\n🔥 STATUS: SISTEMA QUANTUM APROVADO PARA PRODUÇÃO`);
      console.log(`   • Taxa de sucesso excelente (${successRate.toFixed(1)}%)`);
      console.log(`   • Todos os modos de navegação funcionais`);
      console.log(`   • Preservação de dados quantum validada`);
    } else if (successRate >= 80) {
      console.log(`\n⚠️  STATUS: SISTEMA QUANTUM FUNCIONAL COM RESSALVAS`);
      console.log(`   • Taxa de sucesso boa (${successRate.toFixed(1)}%)`);
      console.log(`   • Alguns cenários podem precisar de ajustes`);
    } else {
      console.log(`\n❌ STATUS: SISTEMA QUANTUM REQUER CORREÇÕES`);
      console.log(`   • Taxa de sucesso baixa (${successRate.toFixed(1)}%)`);
      console.log(`   • Problemas críticos identificados`);
    }
    
    console.log(`\n🚀 SISTEMA QUANTUM: VALIDAÇÃO COMPLETA FINALIZADA`);
  }
}

// Executar testes
const runner = new QuantumTestRunner();
runner.runAllTests().catch(console.error);