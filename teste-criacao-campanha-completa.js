/**
 * TESTE COMPLETO DE CRIAÇÃO DE CAMPANHA SMS
 * Testa o fluxo completo: Quiz → Resposta → Campanha → Auto Detecção
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

class TesteCampanhaCompleta {
  constructor() {
    this.token = null;
    this.quizId = null;
    this.responseId = null;
    this.campaignId = null;
    this.testPhone = '11995133932';
    this.testName = 'João Silva Teste';
    this.testEmail = 'joao.teste@gmail.com';
  }

  log(message, color = 'cyan') {
    const colors = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[color] || colors.cyan}${message}${colors.reset}`);
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      }
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    return response;
  }

  async authenticate() {
    this.log('🔐 Fazendo autenticação...', 'blue');
    
    try {
      // Primeiro tentar com admin@vendzz.com
      let response = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@vendzz.com',
          password: 'senha123'
        })
      });

      // Se não funcionar, tentar com admin@admin.com
      if (!response.ok) {
        response = await this.makeRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'admin@admin.com',
            password: 'admin123'
          })
        });
      }

      // Se ainda não funcionar, tentar com demo@demo.com
      if (!response.ok) {
        response = await this.makeRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'demo@demo.com',
            password: 'demo123'
          })
        });
      }

      if (response.ok) {
        const data = await response.json();
        this.token = data.token || data.accessToken;
        this.log('✅ Autenticado com sucesso!', 'green');
        return true;
      }

      this.log(`❌ Falha na autenticação - Status: ${response.status}`, 'red');
      const errorText = await response.text();
      this.log(`❌ Erro: ${errorText}`, 'red');
      return false;
    } catch (error) {
      this.log(`❌ Erro na autenticação: ${error.message}`, 'red');
      return false;
    }
  }

  async criarQuizTeste() {
    this.log('📝 Criando quiz de teste...', 'blue');
    
    const quizData = {
      title: 'Quiz SMS Teste Auto Detecção',
      description: 'Quiz para testar sistema de auto detecção SMS',
      structure: {
        pages: [
          {
            id: 'page1',
            elements: [
              {
                id: 'nome',
                type: 'text',
                properties: {
                  label: 'Qual seu nome completo?',
                  required: true,
                  fieldId: 'nome_completo'
                }
              },
              {
                id: 'email',
                type: 'email',
                properties: {
                  label: 'Qual seu email?',
                  required: true,
                  fieldId: 'email_contato'
                }
              },
              {
                id: 'telefone',
                type: 'phone',
                properties: {
                  label: 'Qual seu telefone?',
                  required: true,
                  fieldId: 'telefone_contato'
                }
              },
              {
                id: 'produto',
                type: 'multiple_choice',
                properties: {
                  label: 'Qual produto te interessa?',
                  options: [
                    { value: 'curso_online', label: 'Curso Online' },
                    { value: 'mentoria', label: 'Mentoria Individual' },
                    { value: 'workshop', label: 'Workshop Presencial' }
                  ],
                  fieldId: 'produto_interesse'
                }
              }
            ]
          }
        ]
      },
      isPublished: true
    };

    try {
      const response = await this.makeRequest('/api/quizzes', {
        method: 'POST',
        body: JSON.stringify(quizData)
      });

      if (response.ok) {
        const quiz = await response.json();
        this.quizId = quiz.id;
        this.log(`✅ Quiz criado com sucesso! ID: ${this.quizId}`, 'green');
        return true;
      }

      this.log(`❌ Erro ao criar quiz - Status: ${response.status}`, 'red');
      return false;
    } catch (error) {
      this.log(`❌ Erro ao criar quiz: ${error.message}`, 'red');
      return false;
    }
  }

  async criarRespostaTeste() {
    this.log('📊 Criando resposta de teste...', 'blue');
    
    const responseData = {
      quizId: this.quizId,
      responses: [
        {
          elementId: 'nome',
          fieldId: 'nome_completo',
          value: this.testName,
          type: 'text'
        },
        {
          elementId: 'email',
          fieldId: 'email_contato',
          value: this.testEmail,
          type: 'email'
        },
        {
          elementId: 'telefone',
          fieldId: 'telefone_contato',
          value: this.testPhone,
          type: 'phone'
        },
        {
          elementId: 'produto',
          fieldId: 'produto_interesse',
          value: 'curso_online',
          type: 'multiple_choice'
        }
      ],
      isComplete: true,
      isPartial: false,
      submittedAt: new Date().toISOString()
    };

    try {
      const response = await this.makeRequest('/api/quiz-responses', {
        method: 'POST',
        body: JSON.stringify(responseData)
      });

      if (response.ok) {
        const responseResult = await response.json();
        this.responseId = responseResult.id;
        this.log(`✅ Resposta criada com sucesso! ID: ${this.responseId}`, 'green');
        this.log(`📱 Telefone registrado: ${this.testPhone}`, 'cyan');
        return true;
      }

      this.log(`❌ Erro ao criar resposta - Status: ${response.status}`, 'red');
      return false;
    } catch (error) {
      this.log(`❌ Erro ao criar resposta: ${error.message}`, 'red');
      return false;
    }
  }

  async verificarTelefonesDisponiveisNoQuiz() {
    this.log('🔍 Verificando telefones disponíveis no quiz...', 'blue');
    
    try {
      const response = await this.makeRequest(`/api/sms/quiz/${this.quizId}/phones`);
      
      if (response.ok) {
        const data = await response.json();
        this.log(`✅ Telefones encontrados: ${data.phones?.length || 0}`, 'green');
        
        if (data.phones && data.phones.length > 0) {
          data.phones.forEach((phone, index) => {
            this.log(`   ${index + 1}. ${phone.telefone} - ${phone.nome || 'Sem nome'}`, 'cyan');
          });
          return true;
        } else {
          this.log('❌ Nenhum telefone encontrado no quiz', 'red');
          return false;
        }
      }

      this.log(`❌ Erro ao buscar telefones - Status: ${response.status}`, 'red');
      return false;
    } catch (error) {
      this.log(`❌ Erro ao buscar telefones: ${error.message}`, 'red');
      return false;
    }
  }

  async criarCampanhaRemark() {
    this.log('📢 Criando campanha de remarketing...', 'blue');
    
    const campaignData = {
      name: 'Teste Remarketing Auto Detecção',
      type: 'remarketing',
      quizId: this.quizId,
      segment: 'all',
      message: `Olá {{nome_completo}}! Vimos que você tem interesse em {{produto_interesse}}. Temos uma oferta especial para você! Contato: {{telefone_contato}}`,
      scheduleType: 'now',
      targetAudience: 'all'
    };

    try {
      const response = await this.makeRequest('/api/sms-campaigns', {
        method: 'POST',
        body: JSON.stringify(campaignData)
      });

      if (response.ok) {
        const campaign = await response.json();
        this.campaignId = campaign.id;
        this.log(`✅ Campanha criada com sucesso! ID: ${this.campaignId}`, 'green');
        this.log(`📝 Nome: ${campaign.name}`, 'cyan');
        this.log(`🎯 Tipo: ${campaign.type}`, 'cyan');
        this.log(`📱 Telefones alvo: ${campaign.targetCount || 'Calculando...'}`, 'cyan');
        return true;
      }

      this.log(`❌ Erro ao criar campanha - Status: ${response.status}`, 'red');
      const errorText = await response.text();
      this.log(`❌ Erro: ${errorText}`, 'red');
      return false;
    } catch (error) {
      this.log(`❌ Erro ao criar campanha: ${error.message}`, 'red');
      return false;
    }
  }

  async verificarCampanhaCriada() {
    this.log('🔍 Verificando campanha criada...', 'blue');
    
    try {
      const response = await this.makeRequest('/api/sms-campaigns');
      
      if (response.ok) {
        const campaigns = await response.json();
        const minhaCampanha = campaigns.find(c => c.id === this.campaignId);
        
        if (minhaCampanha) {
          this.log(`✅ Campanha encontrada na lista!`, 'green');
          this.log(`📊 Status: ${minhaCampanha.status}`, 'cyan');
          this.log(`📱 Telefones: ${minhaCampanha.totalPhones || 0}`, 'cyan');
          this.log(`📅 Criada em: ${new Date(minhaCampanha.createdAt).toLocaleString('pt-BR')}`, 'cyan');
          return true;
        } else {
          this.log(`❌ Campanha não encontrada na lista`, 'red');
          return false;
        }
      }

      this.log(`❌ Erro ao listar campanhas - Status: ${response.status}`, 'red');
      return false;
    } catch (error) {
      this.log(`❌ Erro ao verificar campanha: ${error.message}`, 'red');
      return false;
    }
  }

  async testarBotoesCampanha() {
    this.log('🎮 Testando botões da campanha...', 'blue');
    
    // Teste 1: Pausar campanha
    try {
      const pauseResponse = await this.makeRequest(`/api/sms-campaigns/${this.campaignId}/pause`, {
        method: 'PUT'
      });
      
      if (pauseResponse.ok) {
        this.log('✅ Botão PAUSAR funcionando', 'green');
      } else {
        this.log('❌ Botão PAUSAR com erro', 'red');
      }
    } catch (error) {
      this.log(`❌ Erro ao pausar: ${error.message}`, 'red');
    }

    // Teste 2: Reativar campanha
    try {
      const resumeResponse = await this.makeRequest(`/api/sms-campaigns/${this.campaignId}/resume`, {
        method: 'PUT'
      });
      
      if (resumeResponse.ok) {
        this.log('✅ Botão REATIVAR funcionando', 'green');
      } else {
        this.log('❌ Botão REATIVAR com erro', 'red');
      }
    } catch (error) {
      this.log(`❌ Erro ao reativar: ${error.message}`, 'red');
    }

    // Teste 3: Ver logs
    try {
      const logsResponse = await this.makeRequest(`/api/sms-campaigns/${this.campaignId}/logs`);
      
      if (logsResponse.ok) {
        const logs = await logsResponse.json();
        this.log(`✅ Botão LOGS funcionando - ${logs.length} logs encontrados`, 'green');
      } else {
        this.log('❌ Botão LOGS com erro', 'red');
      }
    } catch (error) {
      this.log(`❌ Erro ao buscar logs: ${error.message}`, 'red');
    }

    // Teste 4: Ver analytics
    try {
      const analyticsResponse = await this.makeRequest(`/api/sms-campaigns/${this.campaignId}/analytics`);
      
      if (analyticsResponse.ok) {
        const analytics = await analyticsResponse.json();
        this.log(`✅ Botão ANALYTICS funcionando`, 'green');
        this.log(`📊 Total enviados: ${analytics.totalSent || 0}`, 'cyan');
        this.log(`📊 Total entregues: ${analytics.totalDelivered || 0}`, 'cyan');
        this.log(`📊 Taxa de sucesso: ${analytics.successRate || 0}%`, 'cyan');
      } else {
        this.log('❌ Botão ANALYTICS com erro', 'red');
      }
    } catch (error) {
      this.log(`❌ Erro ao buscar analytics: ${error.message}`, 'red');
    }
  }

  async aguardarAutoDeteccao() {
    this.log('⏳ Aguardando sistema de auto detecção processar...', 'yellow');
    
    // Aguardar 65 segundos (ciclo de 60s + buffer)
    for (let i = 65; i > 0; i--) {
      process.stdout.write(`\r⏱️  Aguardando auto detecção: ${i}s restantes...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n✅ Tempo de espera concluído!');
  }

  async verificarAutoDeteccao() {
    this.log('🔍 Verificando se auto detecção processou a campanha...', 'blue');
    
    try {
      const response = await this.makeRequest(`/api/sms-campaigns/${this.campaignId}/logs`);
      
      if (response.ok) {
        const logs = await response.json();
        
        if (logs.length > 0) {
          this.log(`✅ Auto detecção funcionando! ${logs.length} logs encontrados`, 'green');
          
          logs.forEach((log, index) => {
            const status = log.status === 'sent' ? '✅ Enviado' : 
                          log.status === 'delivered' ? '📲 Entregue' : 
                          '❌ Erro';
            this.log(`   ${index + 1}. ${log.phone} - ${status}`, 'cyan');
          });
          
          return true;
        } else {
          this.log('❌ Auto detecção não processou ainda', 'red');
          return false;
        }
      }

      this.log(`❌ Erro ao verificar auto detecção - Status: ${response.status}`, 'red');
      return false;
    } catch (error) {
      this.log(`❌ Erro ao verificar auto detecção: ${error.message}`, 'red');
      return false;
    }
  }

  async executarTeste() {
    this.log('🚀 INICIANDO TESTE COMPLETO DE CRIAÇÃO DE CAMPANHA SMS', 'yellow');
    this.log('='.repeat(60), 'yellow');
    
    const etapas = [
      { nome: 'Autenticação', funcao: () => this.authenticate() },
      { nome: 'Criar Quiz', funcao: () => this.criarQuizTeste() },
      { nome: 'Criar Resposta', funcao: () => this.criarRespostaTeste() },
      { nome: 'Verificar Telefones', funcao: () => this.verificarTelefonesDisponiveisNoQuiz() },
      { nome: 'Criar Campanha', funcao: () => this.criarCampanhaRemark() },
      { nome: 'Verificar Campanha', funcao: () => this.verificarCampanhaCriada() },
      { nome: 'Testar Botões', funcao: () => this.testarBotoesCampanha() },
      { nome: 'Aguardar Auto Detecção', funcao: () => this.aguardarAutoDeteccao() },
      { nome: 'Verificar Auto Detecção', funcao: () => this.verificarAutoDeteccao() }
    ];

    let sucessos = 0;
    
    for (const etapa of etapas) {
      this.log(`\n🔄 Executando: ${etapa.nome}`, 'blue');
      
      const resultado = await etapa.funcao();
      
      if (resultado) {
        sucessos++;
        this.log(`✅ ${etapa.nome} - SUCESSO`, 'green');
      } else {
        this.log(`❌ ${etapa.nome} - FALHA`, 'red');
      }
    }
    
    this.log('\n📊 RESULTADO FINAL:', 'yellow');
    this.log(`✅ Sucessos: ${sucessos}/${etapas.length}`, 'green');
    this.log(`❌ Falhas: ${etapas.length - sucessos}/${etapas.length}`, 'red');
    this.log(`📱 Telefone teste: ${this.testPhone}`, 'cyan');
    this.log(`📝 Quiz ID: ${this.quizId}`, 'cyan');
    this.log(`📢 Campanha ID: ${this.campaignId}`, 'cyan');
    
    if (sucessos === etapas.length) {
      this.log('\n🎉 TESTE COMPLETO - SISTEMA 100% FUNCIONAL!', 'green');
    } else {
      this.log('\n⚠️  TESTE PARCIAL - ALGUMAS FALHAS IDENTIFICADAS', 'yellow');
    }
  }
}

const teste = new TesteCampanhaCompleta();
teste.executarTeste();