/**
 * 🔍 ANÁLISE AVANÇADA DO MÓDULO WHATSAPP
 * Revisão crítica completa para identificar todas as melhorias possíveis
 */

class WhatsAppModuleAnalyzer {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.token = null;
    this.problemas = [];
    this.melhorias = [];
    this.criticas = [];
  }

  log(message, color = 'cyan') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${message}`);
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers
      },
      ...(options.body && { body: JSON.stringify(options.body) })
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      throw new Error(`Request failed: ${error.message}`);
    }
  }

  async authenticate() {
    this.log('🔐 Autenticando para análise...');
    
    try {
      const response = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'admin@vendzz.com',
          password: 'admin123'
        }
      });
      
      this.token = response.token;
      this.log('✅ Autenticação OK');
      return true;
    } catch (error) {
      this.log(`❌ Falha na autenticação: ${error.message}`);
      return false;
    }
  }

  async analisarDashboard() {
    this.log('🔍 Analisando dashboard WhatsApp...');
    
    try {
      // Testar endpoints principais
      const endpoints = [
        '/api/quizzes',
        '/api/whatsapp-campaigns',
        '/api/whatsapp-extension/ping',
        '/api/whatsapp-extension/check-sent'
      ];

      for (const endpoint of endpoints) {
        try {
          const result = await this.makeRequest(endpoint);
          this.log(`✅ ${endpoint} - funcionando`);
        } catch (error) {
          this.problemas.push({
            categoria: 'Dashboard',
            problema: `Endpoint ${endpoint} falhando`,
            erro: error.message,
            prioridade: 'alta'
          });
        }
      }

      // Testar criação de campanha
      const quizzes = await this.makeRequest('/api/quizzes');
      if (quizzes.length > 0) {
        const testCampaign = {
          name: 'Teste Análise Avançada',
          quizId: quizzes[0].id,
          targetAudience: 'completed',
          messages: [
            'Olá {nome}! Mensagem teste 1',
            'Olá {nome}! Mensagem teste 2'
          ],
          extensionSettings: {
            delay: 30,
            maxRetries: 3,
            enabled: true
          }
        };

        try {
          const campaign = await this.makeRequest('/api/whatsapp-campaigns', {
            method: 'POST',
            body: testCampaign
          });
          this.log('✅ Criação de campanha - funcionando');
        } catch (error) {
          this.problemas.push({
            categoria: 'Dashboard',
            problema: 'Criação de campanha falhando',
            erro: error.message,
            prioridade: 'crítica'
          });
        }
      }

    } catch (error) {
      this.problemas.push({
        categoria: 'Dashboard',
        problema: 'Erro geral no dashboard',
        erro: error.message,
        prioridade: 'crítica'
      });
    }
  }

  async analisarExtensao() {
    this.log('🔍 Analisando extensão Chrome...');
    
    try {
      // Testar endpoints específicos da extensão
      const extensionEndpoints = [
        '/api/whatsapp-extension/ping',
        '/api/whatsapp-extension/check-sent',
        '/api/whatsapp-automation-file'
      ];

      for (const endpoint of extensionEndpoints) {
        try {
          let result;
          if (endpoint === '/api/whatsapp-extension/check-sent') {
            result = await this.makeRequest(endpoint, {
              method: 'POST',
              body: { phones: ['5511999999999'] }
            });
          } else if (endpoint === '/api/whatsapp-automation-file') {
            result = await this.makeRequest(endpoint, {
              method: 'POST',
              body: { quizId: 'test', targetAudience: 'all' }
            });
          } else {
            result = await this.makeRequest(endpoint);
          }
          
          this.log(`✅ ${endpoint} - funcionando`);
        } catch (error) {
          this.problemas.push({
            categoria: 'Extensão',
            problema: `Endpoint ${endpoint} falhando`,
            erro: error.message,
            prioridade: 'alta'
          });
        }
      }

      // Verificar sincronização
      try {
        const syncResult = await this.makeRequest('/api/whatsapp-extension/sync', {
          method: 'POST',
          body: { userId: 1 }
        });
        this.log('✅ Sincronização - funcionando');
      } catch (error) {
        this.problemas.push({
          categoria: 'Extensão',
          problema: 'Sincronização falhando',
          erro: error.message,
          prioridade: 'crítica'
        });
      }

    } catch (error) {
      this.problemas.push({
        categoria: 'Extensão',
        problema: 'Erro geral na extensão',
        erro: error.message,
        prioridade: 'crítica'
      });
    }
  }

  async analisarPerformance() {
    this.log('🔍 Analisando performance do módulo...');
    
    const performanceTests = [
      {
        name: 'Busca de telefones',
        endpoint: '/api/quiz-phones/test',
        method: 'GET',
        expectedTime: 200
      },
      {
        name: 'Verificação de duplicatas',
        endpoint: '/api/whatsapp-extension/check-sent',
        method: 'POST',
        body: { phones: Array.from({length: 100}, (_, i) => `551199999${i.toString().padStart(4, '0')}`) },
        expectedTime: 100
      },
      {
        name: 'Criação de arquivo automação',
        endpoint: '/api/whatsapp-automation-file',
        method: 'POST',
        body: { quizId: 'test', targetAudience: 'all' },
        expectedTime: 500
      }
    ];

    for (const test of performanceTests) {
      try {
        const startTime = Date.now();
        
        await this.makeRequest(test.endpoint, {
          method: test.method,
          body: test.body
        });
        
        const responseTime = Date.now() - startTime;
        
        if (responseTime > test.expectedTime) {
          this.problemas.push({
            categoria: 'Performance',
            problema: `${test.name} muito lento`,
            erro: `${responseTime}ms (esperado: <${test.expectedTime}ms)`,
            prioridade: 'média'
          });
        } else {
          this.log(`✅ ${test.name} - ${responseTime}ms`);
        }
        
      } catch (error) {
        this.problemas.push({
          categoria: 'Performance',
          problema: `Teste ${test.name} falhou`,
          erro: error.message,
          prioridade: 'alta'
        });
      }
    }
  }

  async analisarSeguranca() {
    this.log('🔍 Analisando segurança...');
    
    // Testar endpoints sem autenticação
    const securityTests = [
      { endpoint: '/api/whatsapp-campaigns', method: 'GET' },
      { endpoint: '/api/whatsapp-extension/ping', method: 'GET' },
      { endpoint: '/api/quiz-phones/test', method: 'GET' }
    ];

    const tempToken = this.token;
    this.token = null; // Remover token temporariamente

    for (const test of securityTests) {
      try {
        await this.makeRequest(test.endpoint, { method: test.method });
        
        this.problemas.push({
          categoria: 'Segurança',
          problema: `Endpoint ${test.endpoint} não protegido`,
          erro: 'Acesso sem autenticação permitido',
          prioridade: 'crítica'
        });
        
      } catch (error) {
        if (error.message.includes('401') || error.message.includes('403')) {
          this.log(`✅ ${test.endpoint} - protegido`);
        } else {
          this.problemas.push({
            categoria: 'Segurança',
            problema: `Erro inesperado em ${test.endpoint}`,
            erro: error.message,
            prioridade: 'média'
          });
        }
      }
    }

    this.token = tempToken; // Restaurar token
  }

  async analisarUsabilidade() {
    this.log('🔍 Analisando usabilidade...');
    
    // Problemas de usabilidade identificados
    const usabilityIssues = [
      {
        problema: 'Logs com timestamps ausentes',
        solucao: 'Implementar timestamps em todos os logs',
        prioridade: 'média'
      },
      {
        problema: 'Token não persistido na extensão',
        solucao: 'Implementar chrome.storage para persistir token',
        prioridade: 'alta'
      },
      {
        problema: 'Sem validação de formulários',
        solucao: 'Adicionar validação antes de iniciar automação',
        prioridade: 'alta'
      },
      {
        problema: 'Estados de loading ausentes',
        solucao: 'Implementar spinners e feedbacks visuais',
        prioridade: 'média'
      },
      {
        problema: 'Sync automático limitado',
        solucao: 'Implementar polling mais inteligente',
        prioridade: 'alta'
      }
    ];

    usabilityIssues.forEach(issue => {
      this.melhorias.push({
        categoria: 'Usabilidade',
        problema: issue.problema,
        solucao: issue.solucao,
        prioridade: issue.prioridade
      });
    });
  }

  async analisarCompatibilidade() {
    this.log('🔍 Analisando compatibilidade...');
    
    // Testar diferentes cenários de uso
    const compatibilityTests = [
      'Múltiplos usuários simultâneos',
      'Campanhas com milhares de contatos',
      'Mensagens com caracteres especiais',
      'Telefones internacionais',
      'Mensagens muito longas'
    ];

    compatibilityTests.forEach(test => {
      this.melhorias.push({
        categoria: 'Compatibilidade',
        problema: `Testar ${test}`,
        solucao: 'Implementar testes específicos',
        prioridade: 'baixa'
      });
    });
  }

  async executarAnaliseCompleta() {
    this.log('🚨 INICIANDO ANÁLISE AVANÇADA DO MÓDULO WHATSAPP');
    this.log('='.repeat(60));

    // Autenticar
    if (!await this.authenticate()) {
      this.log('❌ Falha crítica na autenticação');
      return false;
    }

    // Executar análises
    await this.analisarDashboard();
    await this.analisarExtensao();
    await this.analisarPerformance();
    await this.analisarSeguranca();
    await this.analisarUsabilidade();
    await this.analisarCompatibilidade();

    this.gerarRelatorio();
    return true;
  }

  gerarRelatorio() {
    this.log('='.repeat(60));
    this.log('📊 RELATÓRIO DE ANÁLISE AVANÇADA');
    this.log('='.repeat(60));

    // Agrupar problemas por prioridade
    const criticos = this.problemas.filter(p => p.prioridade === 'crítica');
    const altos = this.problemas.filter(p => p.prioridade === 'alta');
    const medios = this.problemas.filter(p => p.prioridade === 'média');
    
    this.log(`🔴 PROBLEMAS CRÍTICOS: ${criticos.length}`);
    criticos.forEach(p => {
      this.log(`   - ${p.categoria}: ${p.problema}`);
      this.log(`     Erro: ${p.erro}`);
    });

    this.log(`🟡 PROBLEMAS ALTA PRIORIDADE: ${altos.length}`);
    altos.forEach(p => {
      this.log(`   - ${p.categoria}: ${p.problema}`);
    });

    this.log(`🟢 PROBLEMAS MÉDIA PRIORIDADE: ${medios.length}`);
    medios.forEach(p => {
      this.log(`   - ${p.categoria}: ${p.problema}`);
    });

    this.log('='.repeat(60));
    this.log('🚀 MELHORIAS SUGERIDAS');
    this.log('='.repeat(60));

    const melhoriasPorPrioridade = {
      crítica: this.melhorias.filter(m => m.prioridade === 'crítica'),
      alta: this.melhorias.filter(m => m.prioridade === 'alta'),
      média: this.melhorias.filter(m => m.prioridade === 'média'),
      baixa: this.melhorias.filter(m => m.prioridade === 'baixa')
    };

    Object.entries(melhoriasPorPrioridade).forEach(([prioridade, items]) => {
      if (items.length > 0) {
        this.log(`📈 ${prioridade.toUpperCase()}: ${items.length} melhorias`);
        items.forEach(m => {
          this.log(`   - ${m.categoria}: ${m.problema}`);
          this.log(`     Solução: ${m.solucao}`);
        });
      }
    });

    this.log('='.repeat(60));
    this.log('🎯 RESUMO EXECUTIVO');
    this.log('='.repeat(60));
    this.log(`Total de problemas identificados: ${this.problemas.length}`);
    this.log(`Total de melhorias sugeridas: ${this.melhorias.length}`);
    this.log(`Status geral: ${this.problemas.length === 0 ? '✅ EXCELENTE' : criticos.length > 0 ? '❌ CRÍTICO' : '⚠️ NECESSITA MELHORIAS'}`);
  }
}

// Executar análise
const analyzer = new WhatsAppModuleAnalyzer();
analyzer.executarAnaliseCompleta();