/**
 * TESTE COMPLETO DO SISTEMA SMS - NÚMERO 11995133932
 * Testa todos os 5 tipos de campanha SMS de forma sequencial
 * Cria dados de teste, executa campanhas e valida resultados
 */

import fs from 'fs';
import fetch from 'node-fetch';

class TesteSMSCompleto {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.token = null;
    this.testPhone = '11995133932';
    this.testResults = [];
    this.createdQuizzes = [];
    this.createdCampaigns = [];
  }

  log(message, color = 'cyan') {
    const colors = {
      cyan: '\x1b[36m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      red: '\x1b[31m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {})
      }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    return response;
  }

  async authenticate() {
    this.log('🔐 Fazendo login...', 'blue');
    
    try {
      const response = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@vendzz.com',
          password: 'senha123'
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.token || data.accessToken;
        this.log('✅ Autenticado com sucesso!', 'green');
        return true;
      } else {
        // Tentar outro endpoint
        const response2 = await this.makeRequest('/api/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'admin@vendzz.com',
            password: 'senha123'
          })
        });

        if (response2.ok) {
          const data = await response2.json();
          this.token = data.token || data.accessToken;
          this.log('✅ Autenticado com sucesso (endpoint alternativo)!', 'green');
          return true;
        }

        this.log(`❌ Falha na autenticação - Status: ${response.status}`, 'red');
        const errorText = await response.text();
        this.log(`❌ Erro: ${errorText}`, 'red');
        return false;
      }
    } catch (error) {
      this.log(`❌ Erro na autenticação: ${error.message}`, 'red');
      return false;
    }
  }

  async criarQuizTeste(nome, tipo) {
    this.log(`📝 Criando quiz de teste: ${nome}`, 'blue');
    
    const quizData = {
      title: nome,
      description: `Quiz de teste para ${tipo}`,
      pages: [
        {
          id: 'page1',
          elements: [
            {
              id: 'nome',
              type: 'text',
              properties: {
                label: 'Qual seu nome?',
                placeholder: 'Digite seu nome completo',
                required: true
              }
            },
            {
              id: 'email',
              type: 'email',
              properties: {
                label: 'Qual seu email?',
                placeholder: 'exemplo@email.com',
                required: true
              }
            },
            {
              id: 'telefone',
              type: 'phone',
              properties: {
                label: 'Qual seu telefone?',
                placeholder: '(11) 99999-9999',
                required: true
              }
            },
            {
              id: 'idade',
              type: 'multiple_choice',
              properties: {
                label: 'Qual sua idade?',
                options: ['18-25', '26-35', '36-45', '46+'],
                required: true
              }
            },
            {
              id: 'objetivo',
              type: 'multiple_choice',
              properties: {
                label: 'Qual seu objetivo?',
                options: ['Perder peso', 'Ganhar massa', 'Manter forma', 'Melhorar saúde'],
                required: true
              }
            }
          ]
        }
      ],
      published: true
    };

    const response = await this.makeRequest('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData)
    });

    if (response.ok) {
      const quiz = await response.json();
      this.createdQuizzes.push(quiz);
      this.log(`✅ Quiz criado: ${quiz.id}`, 'green');
      return quiz;
    }

    this.log('❌ Erro ao criar quiz', 'red');
    return null;
  }

  async criarRespostaTeste(quizId, tipo = 'completo') {
    this.log(`📋 Criando resposta de teste para ${quizId} (${tipo})`, 'blue');
    
    const respostaCompleta = {
      quizId,
      responses: {
        nome: 'João Silva Teste',
        email: 'joao.teste@email.com',
        telefone: this.testPhone,
        idade: '26-35',
        objetivo: 'Perder peso'
      },
      metadata: {
        startedAt: new Date().toISOString(),
        userAgent: 'Test Agent',
        ipAddress: '127.0.0.1'
      },
      submittedAt: tipo === 'completo' ? new Date().toISOString() : null
    };

    const response = await this.makeRequest('/api/quiz-responses', {
      method: 'POST',
      body: JSON.stringify(respostaCompleta)
    });

    if (response.ok) {
      const resposta = await response.json();
      this.log(`✅ Resposta criada: ${resposta.id}`, 'green');
      return resposta;
    }

    this.log('❌ Erro ao criar resposta', 'red');
    return null;
  }

  async testeRemarketingBasico() {
    this.log('\n🎯 TESTE 1: CAMPANHA REMARKETING BÁSICO', 'magenta');
    
    // Criar quiz e resposta
    const quiz = await this.criarQuizTeste('Quiz Remarketing Básico', 'remarketing');
    if (!quiz) return { success: false, error: 'Falha ao criar quiz' };

    await this.criarRespostaTeste(quiz.id, 'completo');
    await this.criarRespostaTeste(quiz.id, 'abandonado');

    // Criar campanha
    const campanhaData = {
      type: 'remarketing',
      name: 'Teste Remarketing Básico',
      funnelId: quiz.id,
      segment: 'all',
      message: 'Olá {{nome}}! Vimos que você se interessou pelo nosso quiz. Que tal finalizar?',
      scheduleType: 'now'
    };

    const response = await this.makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campanhaData)
    });

    if (response.ok) {
      const campanha = await response.json();
      this.createdCampaigns.push(campanha);
      this.log(`✅ Campanha criada: ${campanha.id}`, 'green');
      
      // Aguardar processamento
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verificar logs
      const logsResponse = await this.makeRequest(`/api/sms-campaigns/${campanha.id}/logs`);
      if (logsResponse.ok) {
        const logs = await logsResponse.json();
        this.log(`📊 Logs encontrados: ${logs.length}`, 'blue');
        
        const phoneFound = logs.find(log => log.phone === this.testPhone);
        if (phoneFound) {
          this.log(`✅ SMS enviado para ${this.testPhone}`, 'green');
          return { success: true, campanha, logs };
        }
      }
    }

    return { success: false, error: 'Falha ao criar/processar campanha' };
  }

  async testeRemarketingAvancado() {
    this.log('\n🧠 TESTE 2: CAMPANHA REMARKETING AVANÇADO', 'magenta');
    
    const quiz = await this.criarQuizTeste('Quiz Remarketing Avançado', 'remarketing_custom');
    if (!quiz) return { success: false, error: 'Falha ao criar quiz' };

    await this.criarRespostaTeste(quiz.id, 'completo');

    const campanhaData = {
      type: 'remarketing_custom',
      name: 'Teste Remarketing Avançado',
      funnelId: quiz.id,
      segment: 'completed',
      message: 'Olá {{nome}}! Sua idade {{idade}} e objetivo {{objetivo}} são perfeitos para nossa oferta especial!',
      scheduleType: 'now',
      ageMin: 25,
      ageMax: 40,
      responseFilter: {
        field: 'objetivo',
        value: 'Perder peso'
      }
    };

    const response = await this.makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campanhaData)
    });

    if (response.ok) {
      const campanha = await response.json();
      this.createdCampaigns.push(campanha);
      this.log(`✅ Campanha avançada criada: ${campanha.id}`, 'green');
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const logsResponse = await this.makeRequest(`/api/sms-campaigns/${campanha.id}/logs`);
      if (logsResponse.ok) {
        const logs = await logsResponse.json();
        const phoneFound = logs.find(log => log.phone === this.testPhone);
        if (phoneFound) {
          this.log(`✅ SMS personalizado enviado para ${this.testPhone}`, 'green');
          return { success: true, campanha, logs };
        }
      }
    }

    return { success: false, error: 'Falha ao criar campanha avançada' };
  }

  async testeAoVivo() {
    this.log('\n⚡ TESTE 3: CAMPANHA AO VIVO', 'magenta');
    
    const quiz = await this.criarQuizTeste('Quiz Ao Vivo', 'live');
    if (!quiz) return { success: false, error: 'Falha ao criar quiz' };

    // Criar campanha ao vivo ANTES da resposta
    const campanhaData = {
      type: 'live',
      name: 'Teste Ao Vivo',
      funnelId: quiz.id,
      segment: 'completed',
      message: 'Obrigado {{nome}}! Você acabou de completar nosso quiz. Aqui está sua oferta especial!',
      scheduleType: 'delayed',
      delayMinutes: 1  // 1 minuto de atraso
    };

    const response = await this.makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campanhaData)
    });

    if (response.ok) {
      const campanha = await response.json();
      this.createdCampaigns.push(campanha);
      this.log(`✅ Campanha ao vivo criada: ${campanha.id}`, 'green');
      
      // Agora criar resposta (simulando lead completando quiz)
      this.log('📝 Simulando lead completando quiz...', 'blue');
      await this.criarRespostaTeste(quiz.id, 'completo');
      
      // Aguardar processamento + delay
      this.log('⏳ Aguardando processamento e delay...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const logsResponse = await this.makeRequest(`/api/sms-campaigns/${campanha.id}/logs`);
      if (logsResponse.ok) {
        const logs = await logsResponse.json();
        const phoneFound = logs.find(log => log.phone === this.testPhone);
        if (phoneFound) {
          this.log(`✅ SMS ao vivo enviado para ${this.testPhone}`, 'green');
          return { success: true, campanha, logs };
        }
      }
    }

    return { success: false, error: 'Falha ao criar campanha ao vivo' };
  }

  async testeAoVivoAvancado() {
    this.log('\n🔥 TESTE 4: CAMPANHA AO VIVO AVANÇADO', 'magenta');
    
    const quiz = await this.criarQuizTeste('Quiz Ao Vivo Avançado', 'live_custom');
    if (!quiz) return { success: false, error: 'Falha ao criar quiz' };

    const campanhaData = {
      type: 'live_custom',
      name: 'Teste Ao Vivo Avançado',
      funnelId: quiz.id,
      segment: 'completed',
      message: 'Oi {{nome}}! Você disse que quer {{objetivo}} e tem {{idade}} anos. Temos algo especial para você!',
      scheduleType: 'delayed',
      delayMinutes: 2,
      responseFilter: {
        field: 'objetivo',
        value: 'Perder peso'
      }
    };

    const response = await this.makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campanhaData)
    });

    if (response.ok) {
      const campanha = await response.json();
      this.createdCampaigns.push(campanha);
      this.log(`✅ Campanha ao vivo avançada criada: ${campanha.id}`, 'green');
      
      await this.criarRespostaTeste(quiz.id, 'completo');
      
      this.log('⏳ Aguardando processamento avançado...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const logsResponse = await this.makeRequest(`/api/sms-campaigns/${campanha.id}/logs`);
      if (logsResponse.ok) {
        const logs = await logsResponse.json();
        const phoneFound = logs.find(log => log.phone === this.testPhone);
        if (phoneFound) {
          this.log(`✅ SMS ao vivo avançado enviado para ${this.testPhone}`, 'green');
          return { success: true, campanha, logs };
        }
      }
    }

    return { success: false, error: 'Falha ao criar campanha ao vivo avançada' };
  }

  async testeDisparoMassa() {
    this.log('\n📁 TESTE 5: DISPARO EM MASSA', 'magenta');
    
    // Criar dados CSV
    const csvData = [
      { nome: 'João Silva Teste', telefone: this.testPhone, email: 'joao.teste@email.com' },
      { nome: 'Maria Santos', telefone: '11987654321', email: 'maria.santos@email.com' },
      { nome: 'Pedro Oliveira', telefone: '11976543210', email: 'pedro.oliveira@email.com' }
    ];

    const campanhaData = {
      type: 'mass',
      name: 'Teste Disparo em Massa',
      message: 'Olá {{nome}}! Esta é uma mensagem em massa para {{telefone}}. Confira!',
      scheduleType: 'now',
      csvData
    };

    const response = await this.makeRequest('/api/sms-campaigns', {
      method: 'POST',
      body: JSON.stringify(campanhaData)
    });

    if (response.ok) {
      const campanha = await response.json();
      this.createdCampaigns.push(campanha);
      this.log(`✅ Campanha massa criada: ${campanha.id}`, 'green');
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const logsResponse = await this.makeRequest(`/api/sms-campaigns/${campanha.id}/logs`);
      if (logsResponse.ok) {
        const logs = await logsResponse.json();
        this.log(`📊 SMS enviados em massa: ${logs.length}`, 'blue');
        
        const phoneFound = logs.find(log => log.phone === this.testPhone);
        if (phoneFound) {
          this.log(`✅ SMS massa enviado para ${this.testPhone}`, 'green');
          return { success: true, campanha, logs };
        }
      }
    }

    return { success: false, error: 'Falha ao criar campanha massa' };
  }

  async testarFuncionalidadesGerenciamento() {
    this.log('\n⚙️ TESTE 6: FUNCIONALIDADES DE GERENCIAMENTO', 'magenta');
    
    if (this.createdCampaigns.length === 0) {
      return { success: false, error: 'Nenhuma campanha para testar' };
    }

    const campanha = this.createdCampaigns[0];
    const results = [];

    // Teste 1: Pausar campanha
    this.log('🔄 Testando pausar campanha...', 'blue');
    const pauseResponse = await this.makeRequest(`/api/sms-campaigns/${campanha.id}/pause`, {
      method: 'PATCH'
    });

    if (pauseResponse.ok) {
      this.log('✅ Campanha pausada com sucesso', 'green');
      results.push({ action: 'pause', success: true });
    } else {
      this.log('❌ Erro ao pausar campanha', 'red');
      results.push({ action: 'pause', success: false });
    }

    // Teste 2: Reativar campanha
    this.log('🔄 Testando reativar campanha...', 'blue');
    const resumeResponse = await this.makeRequest(`/api/sms-campaigns/${campanha.id}/resume`, {
      method: 'PATCH'
    });

    if (resumeResponse.ok) {
      this.log('✅ Campanha reativada com sucesso', 'green');
      results.push({ action: 'resume', success: true });
    } else {
      this.log('❌ Erro ao reativar campanha', 'red');
      results.push({ action: 'resume', success: false });
    }

    // Teste 3: Verificar logs
    this.log('📊 Testando logs da campanha...', 'blue');
    const logsResponse = await this.makeRequest(`/api/sms-campaigns/${campanha.id}/logs`);
    
    if (logsResponse.ok) {
      const logs = await logsResponse.json();
      this.log(`✅ Logs carregados: ${logs.length} entradas`, 'green');
      results.push({ action: 'logs', success: true, count: logs.length });
    } else {
      this.log('❌ Erro ao carregar logs', 'red');
      results.push({ action: 'logs', success: false });
    }

    // Teste 4: Verificar analytics
    this.log('📈 Testando analytics da campanha...', 'blue');
    const analyticsResponse = await this.makeRequest(`/api/sms-campaigns/${campanha.id}/analytics`);
    
    if (analyticsResponse.ok) {
      const analytics = await analyticsResponse.json();
      this.log(`✅ Analytics carregados: ${analytics.totalSent || 0} enviados`, 'green');
      results.push({ action: 'analytics', success: true, data: analytics });
    } else {
      this.log('❌ Erro ao carregar analytics', 'red');
      results.push({ action: 'analytics', success: false });
    }

    return { success: true, results };
  }

  async executarTestes() {
    this.log('🚀 INICIANDO TESTE COMPLETO DO SISTEMA SMS', 'magenta');
    this.log(`📱 Telefone de teste: ${this.testPhone}`, 'blue');
    
    // Autenticar
    const authSuccess = await this.authenticate();
    if (!authSuccess) {
      this.log('❌ Teste abortado - falha na autenticação', 'red');
      return;
    }

    // Executar todos os testes
    const tests = [
      { name: 'Remarketing Básico', fn: () => this.testeRemarketingBasico() },
      { name: 'Remarketing Avançado', fn: () => this.testeRemarketingAvancado() },
      { name: 'Ao Vivo', fn: () => this.testeAoVivo() },
      { name: 'Ao Vivo Avançado', fn: () => this.testeAoVivoAvancado() },
      { name: 'Disparo em Massa', fn: () => this.testeDisparoMassa() },
      { name: 'Gerenciamento', fn: () => this.testarFuncionalidadesGerenciamento() }
    ];

    for (const test of tests) {
      try {
        this.log(`\n🔄 Executando: ${test.name}`, 'yellow');
        const result = await test.fn();
        this.testResults.push({ name: test.name, ...result });
        
        if (result.success) {
          this.log(`✅ ${test.name}: SUCESSO`, 'green');
        } else {
          this.log(`❌ ${test.name}: FALHA - ${result.error}`, 'red');
        }
      } catch (error) {
        this.log(`❌ ${test.name}: ERRO - ${error.message}`, 'red');
        this.testResults.push({ name: test.name, success: false, error: error.message });
      }
    }

    this.gerarRelatorio();
  }

  gerarRelatorio() {
    this.log('\n📊 RELATÓRIO FINAL DO TESTE', 'magenta');
    this.log('='.repeat(50), 'blue');
    
    const sucessos = this.testResults.filter(r => r.success).length;
    const total = this.testResults.length;
    const porcentagem = Math.round((sucessos / total) * 100);
    
    this.log(`📱 Telefone testado: ${this.testPhone}`, 'blue');
    this.log(`✅ Sucessos: ${sucessos}/${total} (${porcentagem}%)`, 'green');
    this.log(`📝 Quizzes criados: ${this.createdQuizzes.length}`, 'blue');
    this.log(`📨 Campanhas criadas: ${this.createdCampaigns.length}`, 'blue');
    
    this.log('\n📋 DETALHES DOS TESTES:', 'yellow');
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      this.log(`${index + 1}. ${status} ${result.name}`, result.success ? 'green' : 'red');
      if (result.error) {
        this.log(`   Erro: ${result.error}`, 'red');
      }
    });

    // Salvar relatório em arquivo
    const relatorio = {
      timestamp: new Date().toISOString(),
      testPhone: this.testPhone,
      summary: {
        total,
        sucessos,
        porcentagem
      },
      results: this.testResults,
      createdQuizzes: this.createdQuizzes.map(q => ({ id: q.id, title: q.title })),
      createdCampaigns: this.createdCampaigns.map(c => ({ id: c.id, name: c.name, type: c.type }))
    };

    fs.writeFileSync(`relatorio-teste-sms-${Date.now()}.json`, JSON.stringify(relatorio, null, 2));
    this.log('\n💾 Relatório salvo em arquivo JSON', 'green');
    
    if (porcentagem >= 80) {
      this.log('\n🎉 SISTEMA APROVADO PARA PRODUÇÃO!', 'green');
    } else {
      this.log('\n⚠️ SISTEMA PRECISA DE CORREÇÕES', 'yellow');
    }
  }
}

// Executar teste
const teste = new TesteSMSCompleto();
teste.executarTestes().catch(console.error);