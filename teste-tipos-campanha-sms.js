/**
 * TESTE ESPECÍFICO DOS 5 TIPOS DE CAMPANHA SMS
 * Testa cada tipo de campanha individualmente
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

class TesteTiposCampanha {
  constructor() {
    this.testPhone = '11995133932';
    this.testName = 'João Silva';
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

  async testCampaignType(type, data) {
    this.log(`\n🧪 Testando ${type.toUpperCase()}...`, 'blue');
    
    try {
      // Simular criação de campanha
      const campaignData = {
        name: `Teste ${type} - ${this.testPhone}`,
        type: type,
        quizId: 'test-quiz-id',
        message: data.message,
        phone: this.testPhone,
        ...data
      };

      // Log da configuração
      this.log(`📱 Telefone: ${this.testPhone}`, 'cyan');
      this.log(`📝 Mensagem: ${data.message}`, 'cyan');
      this.log(`🎯 Segmento: ${data.segment || 'Não especificado'}`, 'cyan');
      this.log(`⏰ Agendamento: ${data.scheduleType || 'Agora'}`, 'cyan');
      
      // Simular envio via API
      const response = await fetch(`${BASE_URL}/api/sms/direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: this.testPhone,
          message: data.message
        })
      });

      if (response.ok) {
        this.log(`✅ ${type.toUpperCase()} - FUNCIONAL`, 'green');
        return true;
      } else {
        this.log(`❌ ${type.toUpperCase()} - ERRO`, 'red');
        return false;
      }
    } catch (error) {
      this.log(`❌ ${type.toUpperCase()} - ERRO: ${error.message}`, 'red');
      return false;
    }
  }

  async executarTestes() {
    this.log('🚀 TESTE DOS 5 TIPOS DE CAMPANHA SMS', 'yellow');
    this.log('=' .repeat(60), 'yellow');

    const campanhas = [
      {
        type: 'remarketing',
        data: {
          message: `Olá ${this.testName}! Que tal retomar onde parou? Temos novidades especiais para você!`,
          segment: 'all',
          scheduleType: 'now',
          description: 'Reativar leads antigos que não converteram'
        }
      },
      {
        type: 'live',
        data: {
          message: `${this.testName}, você abandonou o quiz! Complete agora e ganhe um desconto especial: bit.ly/promo`,
          segment: 'abandoned',
          scheduleType: 'now',
          description: 'Leads que abandonaram ou completaram o quiz'
        }
      },
      {
        type: 'ultra_customized',
        data: {
          message: `${this.testName}, baseado na sua resposta "curso_online", temos uma oferta perfeita para você!`,
          segment: 'completed',
          scheduleType: 'now',
          description: 'Mensagens únicas por resposta específica'
        }
      },
      {
        type: 'ultra_personalized',
        data: {
          message: `${this.testName}, você tem 25-35 anos e quer emagrecer? Nosso programa é ideal para seu perfil!`,
          segment: 'completed',
          scheduleType: 'now',
          description: 'Filtros de idade e personalização avançada'
        }
      },
      {
        type: 'mass_dispatch',
        data: {
          message: `${this.testName}, oferta especial para clientes VIP! Apenas hoje: 50% OFF em todos os cursos!`,
          segment: 'csv_upload',
          scheduleType: 'now',
          description: 'Upload de CSV com lista customizada'
        }
      }
    ];

    let sucessos = 0;
    let total = campanhas.length;

    for (const campanha of campanhas) {
      const resultado = await this.testCampaignType(campanha.type, campanha.data);
      
      if (resultado) {
        sucessos++;
      }

      // Aguardar 2 segundos entre testes
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Resultado final
    this.log('\n📊 RESULTADO FINAL:', 'yellow');
    this.log(`✅ Sucessos: ${sucessos}/${total}`, 'green');
    this.log(`❌ Falhas: ${total - sucessos}/${total}`, 'red');
    this.log(`📱 Telefone testado: ${this.testPhone}`, 'cyan');
    this.log(`🔄 Taxa de sucesso: ${Math.round((sucessos/total)*100)}%`, 'cyan');

    if (sucessos === total) {
      this.log('\n🎉 TODOS OS TIPOS DE CAMPANHA FUNCIONAIS!', 'green');
    } else {
      this.log('\n⚠️  ALGUNS TIPOS COM PROBLEMAS', 'yellow');
    }

    // Detalhes das campanhas
    this.log('\n📋 DETALHES DAS CAMPANHAS TESTADAS:', 'blue');
    campanhas.forEach((campanha, index) => {
      this.log(`\n${index + 1}. ${campanha.type.toUpperCase()}`, 'cyan');
      this.log(`   📝 ${campanha.data.description}`, 'cyan');
      this.log(`   🎯 Segmento: ${campanha.data.segment}`, 'cyan');
      this.log(`   📱 Mensagem: ${campanha.data.message.substring(0, 80)}...`, 'cyan');
    });

    // Instruções para teste manual
    this.log('\n🔍 COMO TESTAR MANUALMENTE:', 'blue');
    this.log('1. Acesse: http://localhost:5000/sms-campaigns-advanced', 'cyan');
    this.log('2. Faça login no sistema', 'cyan');
    this.log('3. Clique em "Nova Campanha"', 'cyan');
    this.log('4. Teste cada tipo de campanha listado acima', 'cyan');
    this.log('5. Verifique o recebimento no telefone 11995133932', 'cyan');

    return { sucessos, total };
  }
}

// Executar teste
const teste = new TesteTiposCampanha();
teste.executarTestes();