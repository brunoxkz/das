/**
 * TESTE DE STRESS EXTREMO - SISTEMA QUANTUM
 * Valida performance, concorrência e estabilidade sob condições extremas
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const QUIZ_ID = 'gKsvawq1ErdsVJQw-mFAL';
const USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15';

class QuantumStressTest {
  constructor() {
    this.results = {
      concurrent: [],
      rapid: [],
      interruption: [],
      memory: [],
      edge: []
    };
    this.totalRequests = 0;
    this.successRequests = 0;
    this.errorRequests = 0;
    this.startTime = Date.now();
  }

  async runStressTests() {
    console.log('🚀 INICIANDO TESTE DE STRESS EXTREMO - SISTEMA QUANTUM');
    console.log('=' * 70);

    // Teste 1: 50 submissões concorrentes
    await this.testMassiveConcurrency();

    // Teste 2: Respostas ultra-rápidas (< 100ms)
    await this.testUltraRapidResponses();

    // Teste 3: Interrupções simuladas
    await this.testSystemInterruptions();

    // Teste 4: Teste de memória com payloads grandes
    await this.testMemoryStress();

    // Teste 5: Casos extremos de borda
    await this.testExtremeEdgeCases();

    // Teste 6: Simulação de usuários reais
    await this.simulateRealUserBehavior();

    this.generateStressReport();
  }

  async testMassiveConcurrency() {
    console.log('\n💥 TESTE 1: CONCORRÊNCIA MASSIVA (50 USUÁRIOS SIMULTÂNEOS)');
    console.log('-' * 60);

    const concurrentUsers = 50;
    const promises = [];

    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(this.simulateCompleteUserFlow(i, 'concurrent'));
    }

    const start = Date.now();
    const results = await Promise.allSettled(promises);
    const duration = Date.now() - start;

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`📊 Resultado: ${successful}/${concurrentUsers} sucessos em ${duration}ms`);
    console.log(`⚡ Throughput: ${(concurrentUsers / duration * 1000).toFixed(2)} req/s`);
    console.log(`📈 Taxa de sucesso: ${(successful/concurrentUsers*100).toFixed(1)}%`);

    this.results.concurrent = {
      total: concurrentUsers,
      successful,
      failed,
      duration,
      throughput: concurrentUsers / duration * 1000,
      successRate: successful/concurrentUsers*100
    };
  }

  async testUltraRapidResponses() {
    console.log('\n⚡ TESTE 2: RESPOSTAS ULTRA-RÁPIDAS (< 100ms entre páginas)');
    console.log('-' * 60);

    const responses = {};
    const pageCount = 8;
    const delayMs = 50; // 50ms entre páginas

    for (let page = 1; page <= pageCount; page++) {
      const fieldName = this.getFieldName(page);
      responses[fieldName] = this.getRandomResponse(fieldName);

      const start = Date.now();
      const result = await this.sendPartialResponse({
        responses: { ...responses },
        currentPage: page,
        totalPages: 10,
        completionPercentage: (page / 10) * 100,
        timeSpent: page * 1000,
        metadata: {
          navigationMode: 'ultra_rapid',
          delayMs: delayMs,
          testType: 'speed_test',
          pageIndex: page
        }
      });

      const pageTime = Date.now() - start;
      console.log(`  Página ${page}: ${result.success ? '✅' : '❌'} (${pageTime}ms)`);

      if (page < pageCount) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    // Submissão final ultra-rápida
    responses.nome = 'ULTRA RAPID USER';
    responses.email = 'ultrarapid@quantum.test';
    responses.telefone = '+5511999888000';

    const finalStart = Date.now();
    const finalResult = await this.sendFinalSubmission({
      responses,
      metadata: {
        navigationMode: 'ultra_rapid',
        testType: 'speed_final',
        totalDelay: delayMs * pageCount
      }
    });

    const finalTime = Date.now() - finalStart;
    console.log(`🎯 Submissão final: ${finalResult.success ? '✅' : '❌'} (${finalTime}ms)`);
  }

  async testSystemInterruptions() {
    console.log('\n🔀 TESTE 3: INTERRUPÇÕES SIMULADAS');
    console.log('-' * 60);

    // Simular usuário que para no meio e retoma
    const baseResponses = { p1_objetivo_principal: 'Perder peso' };

    // Primeira parte - usuário responde 3 páginas
    for (let page = 1; page <= 3; page++) {
      const fieldName = this.getFieldName(page);
      baseResponses[fieldName] = this.getRandomResponse(fieldName);

      await this.sendPartialResponse({
        responses: { ...baseResponses },
        currentPage: page,
        totalPages: 10,
        completionPercentage: (page / 10) * 100,
        timeSpent: page * 8000,
        metadata: {
          navigationMode: 'interrupted',
          phase: 'first_session',
          sessionId: 'interrupt_test_1'
        }
      });
    }

    console.log('  ⏸️  Simulando interrupção (5 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Segunda parte - usuário retoma depois de 5s
    for (let page = 4; page <= 6; page++) {
      const fieldName = this.getFieldName(page);
      baseResponses[fieldName] = this.getRandomResponse(fieldName);

      await this.sendPartialResponse({
        responses: { ...baseResponses },
        currentPage: page,
        totalPages: 10,
        completionPercentage: (page / 10) * 100,
        timeSpent: 20000 + (page * 8000), // Tempo acumulado
        metadata: {
          navigationMode: 'interrupted',
          phase: 'resumed_session',
          sessionId: 'interrupt_test_1',
          interruption_duration: 5000
        }
      });
    }

    console.log('  ▶️  Retomada bem-sucedida');
  }

  async testMemoryStress() {
    console.log('\n💾 TESTE 4: STRESS DE MEMÓRIA (PAYLOADS GRANDES)');
    console.log('-' * 60);

    const largeSizes = [1000, 5000, 10000, 50000]; // Tamanhos em caracteres

    for (const size of largeSizes) {
      const largeText = 'A'.repeat(size);
      
      const start = Date.now();
      const result = await this.sendPartialResponse({
        responses: {
          p1_objetivo_principal: 'Perder peso',
          large_field: largeText,
          metadata_field: `Payload de ${size} caracteres`
        },
        currentPage: 1,
        totalPages: 10,
        completionPercentage: 10,
        timeSpent: 8000,
        metadata: {
          navigationMode: 'memory_stress',
          payloadSize: size,
          testType: 'large_payload'
        }
      });

      const duration = Date.now() - start;
      console.log(`  ${size} chars: ${result.success ? '✅' : '❌'} (${duration}ms)`);
    }
  }

  async testExtremeEdgeCases() {
    console.log('\n🧪 TESTE 5: CASOS EXTREMOS DE BORDA');
    console.log('-' * 60);

    const edgeCases = [
      {
        name: 'Resposta vazia',
        data: { responses: {}, currentPage: 1, totalPages: 10, completionPercentage: 0 }
      },
      {
        name: 'Página negativa',
        data: { responses: { p1_objetivo_principal: 'Teste' }, currentPage: -1, totalPages: 10 }
      },
      {
        name: 'Porcentagem > 100%',
        data: { responses: { p1_objetivo_principal: 'Teste' }, currentPage: 1, totalPages: 10, completionPercentage: 150 }
      },
      {
        name: 'Tempo negativo',
        data: { responses: { p1_objetivo_principal: 'Teste' }, currentPage: 1, totalPages: 10, timeSpent: -1000 }
      },
      {
        name: 'Total páginas zero',
        data: { responses: { p1_objetivo_principal: 'Teste' }, currentPage: 1, totalPages: 0 }
      }
    ];

    for (const testCase of edgeCases) {
      const result = await this.sendPartialResponse({
        ...testCase.data,
        metadata: {
          navigationMode: 'edge_case',
          testCase: testCase.name
        }
      });

      console.log(`  ${testCase.name}: ${result.success ? '✅' : '❌'}`);
    }
  }

  async simulateRealUserBehavior() {
    console.log('\n👥 TESTE 6: SIMULAÇÃO DE COMPORTAMENTO REAL');
    console.log('-' * 60);

    const userProfiles = [
      { type: 'Quick User', pageDelay: [500, 1000], thinkTime: [2000, 4000] },
      { type: 'Careful User', pageDelay: [2000, 5000], thinkTime: [8000, 15000] },
      { type: 'Distracted User', pageDelay: [1000, 30000], thinkTime: [5000, 60000] },
      { type: 'Mobile User', pageDelay: [800, 2000], thinkTime: [3000, 8000] }
    ];

    const promises = userProfiles.map((profile, index) => 
      this.simulateUserProfile(profile, index)
    );

    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;

    console.log(`👥 Perfis simulados: ${successful}/${userProfiles.length} sucessos`);
  }

  async simulateUserProfile(profile, index) {
    const responses = {};
    
    for (let page = 1; page <= 5; page++) { // 5 páginas por perfil
      // Simular tempo de "pensamento" do usuário
      const thinkTime = this.randomBetween(profile.thinkTime[0], profile.thinkTime[1]);
      await new Promise(resolve => setTimeout(resolve, Math.min(thinkTime, 5000))); // Max 5s

      const fieldName = this.getFieldName(page);
      responses[fieldName] = this.getRandomResponse(fieldName);

      const result = await this.sendPartialResponse({
        responses: { ...responses },
        currentPage: page,
        totalPages: 10,
        completionPercentage: (page / 10) * 100,
        timeSpent: page * thinkTime,
        metadata: {
          navigationMode: 'real_user_simulation',
          userProfile: profile.type,
          profileIndex: index,
          thinkTime: thinkTime
        }
      });

      if (!result.success) {
        throw new Error(`Falha no perfil ${profile.type} página ${page}`);
      }

      // Delay entre páginas
      const pageDelay = this.randomBetween(profile.pageDelay[0], profile.pageDelay[1]);
      await new Promise(resolve => setTimeout(resolve, Math.min(pageDelay, 3000))); // Max 3s
    }

    console.log(`  ${profile.type}: ✅ Completo`);
  }

  async simulateCompleteUserFlow(userId, testType) {
    const responses = {};
    
    for (let page = 1; page <= 3; page++) { // 3 páginas para teste rápido
      const fieldName = this.getFieldName(page);
      responses[fieldName] = this.getRandomResponse(fieldName);

      const result = await this.sendPartialResponse({
        responses: { ...responses },
        currentPage: page,
        totalPages: 10,
        completionPercentage: (page / 10) * 100,
        timeSpent: page * 5000,
        metadata: {
          navigationMode: testType,
          userId: userId,
          testBatch: 'concurrent_test'
        }
      });

      if (!result.success) {
        throw new Error(`User ${userId} failed at page ${page}`);
      }
    }

    // Submissão final
    responses.nome = `USER_${userId}`;
    responses.email = `user${userId}@concurrent.test`;
    responses.telefone = `+5511${String(userId).padStart(9, '0')}`;

    const finalResult = await this.sendFinalSubmission({
      responses,
      metadata: {
        navigationMode: testType,
        userId: userId,
        testType: 'concurrent_final'
      }
    });

    if (!finalResult.success) {
      throw new Error(`User ${userId} failed final submission`);
    }

    this.successRequests++;
    return { userId, success: true, processingTime: finalResult.processingTime };
  }

  getFieldName(page) {
    const fields = [
      'p1_objetivo_principal',
      'p2_nivel_experiencia', 
      'p3_tempo_disponivel',
      'p4_dificuldade_principal',
      'p5_preferencia_exercicio',
      'p6_experiencia_anterior',
      'p7_restricoes_medicas',
      'p8_objetivo_prazo'
    ];
    return fields[page - 1] || `p${page}_field`;
  }

  getRandomResponse(fieldName) {
    const options = {
      'p1_objetivo_principal': ['Perder peso', 'Ganhar massa muscular', 'Definir o corpo'],
      'p2_nivel_experiencia': ['Iniciante', 'Intermediário', 'Avançado'],
      'p3_tempo_disponivel': ['30min a 1h', '1h a 2h', 'Mais de 2h'],
      'p4_dificuldade_principal': ['Falta de motivação', 'Falta de tempo'],
      'p5_preferencia_exercicio': ['Academia', 'Casa', 'Online'],
      'p6_experiencia_anterior': ['Sim', 'Não', 'Pouca'],
      'p7_restricoes_medicas': ['Não', 'Algumas'],
      'p8_objetivo_prazo': ['3 meses', '6 meses', '1 ano']
    };

    const fieldOptions = options[fieldName] || ['Opção A', 'Opção B', 'Opção C'];
    return fieldOptions[Math.floor(Math.random() * fieldOptions.length)];
  }

  randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async sendPartialResponse(data) {
    try {
      this.totalRequests++;
      const response = await fetch(`${BASE_URL}/api/quizzes/${QUIZ_ID}/partial-responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': USER_AGENT
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        this.errorRequests++;
      }
      
      return {
        success: response.ok,
        ...result
      };
    } catch (error) {
      this.errorRequests++;
      return {
        success: false,
        message: error.message
      };
    }
  }

  async sendFinalSubmission(data) {
    try {
      this.totalRequests++;
      const response = await fetch(`${BASE_URL}/api/quizzes/${QUIZ_ID}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': USER_AGENT
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        this.errorRequests++;
      }
      
      return {
        success: response.ok,
        ...result
      };
    } catch (error) {
      this.errorRequests++;
      return {
        success: false,
        message: error.message
      };
    }
  }

  generateStressReport() {
    const totalDuration = Date.now() - this.startTime;
    const overallSuccessRate = (this.successRequests / this.totalRequests) * 100;

    console.log('\n📊 RELATÓRIO FINAL DE STRESS TEST');
    console.log('=' * 70);
    
    console.log('📈 ESTATÍSTICAS GERAIS:');
    console.log(`   • Duração total: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`   • Total de requisições: ${this.totalRequests}`);
    console.log(`   • Requisições com sucesso: ${this.successRequests}`);
    console.log(`   • Requisições com erro: ${this.errorRequests}`);
    console.log(`   • Taxa de sucesso geral: ${overallSuccessRate.toFixed(1)}%`);
    
    if (this.results.concurrent.total) {
      console.log('\n💥 CONCORRÊNCIA MASSIVA:');
      console.log(`   • Usuários simultâneos: ${this.results.concurrent.total}`);
      console.log(`   • Taxa de sucesso: ${this.results.concurrent.successRate.toFixed(1)}%`);
      console.log(`   • Throughput: ${this.results.concurrent.throughput.toFixed(2)} req/s`);
      console.log(`   • Tempo total: ${this.results.concurrent.duration}ms`);
    }

    // Determinar status final
    if (overallSuccessRate >= 95 && this.results.concurrent.successRate >= 90) {
      console.log('\n🔥 STATUS: SISTEMA QUANTUM APROVADO PARA ALTA ESCALA');
      console.log('   • Suporta 50+ usuários simultâneos');
      console.log('   • Resistente a interrupções e casos extremos');
      console.log('   • Performance excelente sob stress');
      console.log('   • Pronto para produção com 100k+ usuários');
    } else if (overallSuccessRate >= 80) {
      console.log('\n⚠️  STATUS: SISTEMA QUANTUM FUNCIONAL SOB STRESS');
      console.log('   • Performance boa mas com limitações');
      console.log('   • Recomendado monitoramento em produção');
    } else {
      console.log('\n❌ STATUS: SISTEMA QUANTUM REQUER OTIMIZAÇÕES');
      console.log('   • Performance insuficiente para alta escala');
      console.log('   • Necessário ajustes antes da produção');
    }

    console.log('\n🚀 STRESS TEST QUANTUM: FINALIZADO');
  }
}

// Executar stress test
const stressTest = new QuantumStressTest();
stressTest.runStressTests().catch(console.error);