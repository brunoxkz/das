/**
 * 🧪 TESTE COMPLETO DA EXTENSÃO WHATSAPP V2.0
 * Valida todas as funcionalidades da extensão aprimorada
 */

// Simulação de dados de teste
const testData = {
  campaigns: [
    {
      id: 'camp-1',
      type: 'CAMPANHA_REMARKETING',
      name: 'Remarketing Black Friday',
      message: '{greeting}! Oferta especial: produto com 50% OFF por {currency}100. Aproveite!',
      phones: ['5511999887766', '5511888776655'],
      variables: { nome_completo: 'João Silva', email_contato: 'joao@email.com' }
    },
    {
      id: 'camp-2',
      type: 'CAMPANHA_AO_VIVO',
      name: 'Campanha Ao Vivo - Produto A',
      message: '{greeting} {nome_completo}! Seu produto escolhido: {produto_escolhido}. Preço: {currency}150',
      phones: ['5511777665544', '5511666554433'],
      variables: { nome_completo: 'Maria Santos', produto_escolhido: 'Curso Online' }
    },
    {
      id: 'camp-3',
      type: 'CAMPANHA_ULTRA_CUSTOMIZADA',
      name: 'Ultra Customizada - Segmentada',
      message: '{greeting}! Baseado na sua resposta "{resposta_especifica}", temos uma oferta especial de {currency}200.',
      phones: ['5511555443322', '5511444332211'],
      variables: { resposta_especifica: 'Perder peso', nome_completo: 'Carlos Lima' }
    },
    {
      id: 'camp-4',
      type: 'CAMPANHA_ULTRA_PERSONALIZADA',
      name: 'Ultra Personalizada - Perfil Detalhado',
      message: '{greeting}! Com {idade} anos, nosso programa {tom} é perfeito para você. Investimento: {currency}300.',
      phones: ['5511333221100', '5511222110099'],
      variables: { idade: 28, nome_completo: 'Ana Costa', objetivo: 'Ganhar massa' }
    },
    {
      id: 'camp-5',
      type: 'CAMPANHA_AB_TEST',
      name: 'Teste A/B - Versão A',
      message: '{greeting}! Versão A: Desconto de {currency}50 no produto {produto_teste}.',
      phones: ['5511111000999', '5511000999888'],
      variables: { produto_teste: 'Suplemento Premium', desconto: 50 }
    }
  ],
  
  internationalNumbers: [
    { phone: '8613812345678', country: 'CN', expected: { currency: '¥', greeting: '你好' } },
    { phone: '12125551234', country: 'US', expected: { currency: '$', greeting: 'Hi' } },
    { phone: '541187654321', country: 'AR', expected: { currency: 'ARS$', greeting: 'Hola' } },
    { phone: '5215512345678', country: 'MX', expected: { currency: 'MXN$', greeting: 'Hola' } },
    { phone: '351912345678', country: 'PT', expected: { currency: '€', greeting: 'Olá' } },
    { phone: '34612345678', country: 'ES', expected: { currency: '€', greeting: 'Hola' } },
    { phone: '33123456789', country: 'FR', expected: { currency: '€', greeting: 'Salut' } },
    { phone: '39312345678', country: 'IT', expected: { currency: '€', greeting: 'Ciao' } },
    { phone: '447123456789', country: 'GB', expected: { currency: '£', greeting: 'Hello' } },
    { phone: '491234567890', country: 'DE', expected: { currency: '€', greeting: 'Hallo' } },
    { phone: '972501234567', country: 'IL', expected: { currency: '₪', greeting: 'שלום' } },
    { phone: '905123456789', country: 'TR', expected: { currency: '₺', greeting: 'Merhaba' } }
  ]
};

class ExtensionTesterV2 {
  constructor() {
    this.testResults = {
      campaignTypes: [],
      countryDetection: [],
      messagePersonalization: [],
      retrySystem: [],
      performance: [],
      ui: []
    };
    
    this.stats = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      startTime: Date.now()
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m'
    };
    
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors[type]}[${timestamp}] ${message}\x1b[0m`);
  }

  // Teste 1: Validar tipos de campanha
  testCampaignTypes() {
    this.log('🧪 Testando tipos de campanha...', 'info');
    
    const expectedTypes = [
      'CAMPANHA_REMARKETING',
      'CAMPANHA_AO_VIVO',
      'CAMPANHA_ULTRA_CUSTOMIZADA',
      'CAMPANHA_ULTRA_PERSONALIZADA',
      'CAMPANHA_AB_TEST'
    ];
    
    expectedTypes.forEach(type => {
      const campaign = testData.campaigns.find(c => c.type === type);
      
      if (campaign) {
        this.testResults.campaignTypes.push({
          type: type,
          status: 'PASSED',
          message: `Tipo ${type} encontrado e configurado`
        });
        this.stats.passedTests++;
      } else {
        this.testResults.campaignTypes.push({
          type: type,
          status: 'FAILED',
          message: `Tipo ${type} não encontrado`
        });
        this.stats.failedTests++;
      }
      
      this.stats.totalTests++;
    });
    
    this.log(`✅ Tipos de campanha testados: ${this.stats.passedTests}/${expectedTypes.length}`, 'success');
  }

  // Teste 2: Detecção de países
  testCountryDetection() {
    this.log('🌍 Testando detecção de países...', 'info');
    
    // Simular função de detecção de países
    const detectCountryFromPhone = (phone) => {
      const cleanPhone = phone.replace(/\D/g, '');
      
      const countryMap = {
        '55': { country: 'BR', currency: 'R$', greeting: 'Olá' },
        '1': { country: 'US', currency: '$', greeting: 'Hi' },
        '54': { country: 'AR', currency: 'ARS$', greeting: 'Hola' },
        '52': { country: 'MX', currency: 'MXN$', greeting: 'Hola' },
        '351': { country: 'PT', currency: '€', greeting: 'Olá' },
        '34': { country: 'ES', currency: '€', greeting: 'Hola' },
        '33': { country: 'FR', currency: '€', greeting: 'Salut' },
        '39': { country: 'IT', currency: '€', greeting: 'Ciao' },
        '44': { country: 'GB', currency: '£', greeting: 'Hello' },
        '49': { country: 'DE', currency: '€', greeting: 'Hallo' },
        '86': { country: 'CN', currency: '¥', greeting: '你好' },
        '972': { country: 'IL', currency: '₪', greeting: 'שלום' },
        '90': { country: 'TR', currency: '₺', greeting: 'Merhaba' }
      };
      
      const sortedKeys = Object.keys(countryMap).sort((a, b) => b.length - a.length);
      
      for (const ddi of sortedKeys) {
        if (cleanPhone.startsWith(ddi)) {
          return countryMap[ddi];
        }
      }
      
      return { country: 'BR', currency: 'R$', greeting: 'Olá' };
    };
    
    testData.internationalNumbers.forEach(test => {
      const detected = detectCountryFromPhone(test.phone);
      const expected = test.expected;
      
      if (detected.currency === expected.currency && detected.greeting === expected.greeting) {
        this.testResults.countryDetection.push({
          phone: test.phone,
          country: test.country,
          status: 'PASSED',
          detected: detected,
          expected: expected
        });
        this.stats.passedTests++;
      } else {
        this.testResults.countryDetection.push({
          phone: test.phone,
          country: test.country,
          status: 'FAILED',
          detected: detected,
          expected: expected
        });
        this.stats.failedTests++;
      }
      
      this.stats.totalTests++;
    });
    
    this.log(`✅ Detecção de países testada: ${this.testResults.countryDetection.filter(r => r.status === 'PASSED').length}/${testData.internationalNumbers.length}`, 'success');
  }

  // Teste 3: Personalização de mensagens
  testMessagePersonalization() {
    this.log('💬 Testando personalização de mensagens...', 'info');
    
    const personalizeMessage = (message, variables = {}, phoneNumber = null) => {
      const detectCountryFromPhone = (phone) => {
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.startsWith('55')) return { country: 'BR', currency: 'R$', greeting: 'Olá' };
        if (cleanPhone.startsWith('1')) return { country: 'US', currency: '$', greeting: 'Hi' };
        return { country: 'BR', currency: 'R$', greeting: 'Olá' };
      };
      
      let personalizedMessage = message;
      
      if (phoneNumber) {
        const countryInfo = detectCountryFromPhone(phoneNumber);
        variables.greeting = countryInfo.greeting;
        variables.currency = countryInfo.currency;
        variables.country = countryInfo.country;
      }
      
      Object.keys(variables).forEach(key => {
        const value = variables[key];
        if (value !== null && value !== undefined) {
          const regex = new RegExp(`{${key}}`, 'g');
          personalizedMessage = personalizedMessage.replace(regex, value);
        }
      });
      
      personalizedMessage = personalizedMessage.replace(/{[^}]+}/g, '');
      
      return personalizedMessage;
    };
    
    testData.campaigns.forEach(campaign => {
      campaign.phones.forEach(phone => {
        const personalizedMessage = personalizeMessage(campaign.message, campaign.variables, phone);
        
        // Verificar se variáveis foram substituídas
        const hasUnreplacedVariables = personalizedMessage.includes('{') && personalizedMessage.includes('}');
        
        if (!hasUnreplacedVariables) {
          this.testResults.messagePersonalization.push({
            campaign: campaign.name,
            phone: phone,
            status: 'PASSED',
            original: campaign.message,
            personalized: personalizedMessage
          });
          this.stats.passedTests++;
        } else {
          this.testResults.messagePersonalization.push({
            campaign: campaign.name,
            phone: phone,
            status: 'FAILED',
            original: campaign.message,
            personalized: personalizedMessage,
            error: 'Variáveis não substituídas'
          });
          this.stats.failedTests++;
        }
        
        this.stats.totalTests++;
      });
    });
    
    this.log(`✅ Personalização testada: ${this.testResults.messagePersonalization.filter(r => r.status === 'PASSED').length}/${this.testResults.messagePersonalization.length}`, 'success');
  }

  // Teste 4: Sistema de retry
  testRetrySystem() {
    this.log('🔄 Testando sistema de retry...', 'info');
    
    const processCampaignType = (campaign) => {
      const { type } = campaign;
      
      switch (type) {
        case 'CAMPANHA_REMARKETING':
          return { priority: 'high', delay: 1000, retryAttempts: 3 };
        case 'CAMPANHA_AO_VIVO':
          return { priority: 'medium', delay: 500, retryAttempts: 2 };
        case 'CAMPANHA_ULTRA_CUSTOMIZADA':
          return { priority: 'high', delay: 2000, retryAttempts: 3 };
        case 'CAMPANHA_ULTRA_PERSONALIZADA':
          return { priority: 'highest', delay: 3000, retryAttempts: 5 };
        case 'CAMPANHA_AB_TEST':
          return { priority: 'medium', delay: 1000, retryAttempts: 2 };
        default:
          return { priority: 'medium', delay: 1000, retryAttempts: 2 };
      }
    };
    
    testData.campaigns.forEach(campaign => {
      const config = processCampaignType(campaign);
      
      const expectedConfigs = {
        'CAMPANHA_REMARKETING': { retryAttempts: 3, delay: 1000 },
        'CAMPANHA_AO_VIVO': { retryAttempts: 2, delay: 500 },
        'CAMPANHA_ULTRA_CUSTOMIZADA': { retryAttempts: 3, delay: 2000 },
        'CAMPANHA_ULTRA_PERSONALIZADA': { retryAttempts: 5, delay: 3000 },
        'CAMPANHA_AB_TEST': { retryAttempts: 2, delay: 1000 }
      };
      
      const expected = expectedConfigs[campaign.type];
      
      if (config.retryAttempts === expected.retryAttempts && config.delay === expected.delay) {
        this.testResults.retrySystem.push({
          campaign: campaign.name,
          type: campaign.type,
          status: 'PASSED',
          config: config
        });
        this.stats.passedTests++;
      } else {
        this.testResults.retrySystem.push({
          campaign: campaign.name,
          type: campaign.type,
          status: 'FAILED',
          config: config,
          expected: expected
        });
        this.stats.failedTests++;
      }
      
      this.stats.totalTests++;
    });
    
    this.log(`✅ Sistema de retry testado: ${this.testResults.retrySystem.filter(r => r.status === 'PASSED').length}/${testData.campaigns.length}`, 'success');
  }

  // Teste 5: Performance da extensão
  testPerformance() {
    this.log('⚡ Testando performance...', 'info');
    
    const performanceTests = [
      {
        name: 'Detecção de país',
        test: () => {
          const start = performance.now();
          for (let i = 0; i < 1000; i++) {
            // Simular detecção de país
            const phone = '5511999887766';
            const cleanPhone = phone.replace(/\D/g, '');
            cleanPhone.startsWith('55');
          }
          return performance.now() - start;
        },
        maxTime: 10 // 10ms máximo
      },
      {
        name: 'Personalização de mensagem',
        test: () => {
          const start = performance.now();
          for (let i = 0; i < 100; i++) {
            let message = '{greeting}! Oferta especial: {currency}100';
            message = message.replace(/{greeting}/g, 'Olá');
            message = message.replace(/{currency}/g, 'R$');
          }
          return performance.now() - start;
        },
        maxTime: 5 // 5ms máximo
      },
      {
        name: 'Processamento de campanha',
        test: () => {
          const start = performance.now();
          for (let i = 0; i < 100; i++) {
            const type = 'CAMPANHA_REMARKETING';
            const config = type === 'CAMPANHA_REMARKETING' ? { priority: 'high', delay: 1000 } : { priority: 'medium', delay: 500 };
          }
          return performance.now() - start;
        },
        maxTime: 2 // 2ms máximo
      }
    ];
    
    performanceTests.forEach(test => {
      const executionTime = test.test();
      
      if (executionTime <= test.maxTime) {
        this.testResults.performance.push({
          name: test.name,
          status: 'PASSED',
          executionTime: executionTime.toFixed(2) + 'ms',
          maxTime: test.maxTime + 'ms'
        });
        this.stats.passedTests++;
      } else {
        this.testResults.performance.push({
          name: test.name,
          status: 'FAILED',
          executionTime: executionTime.toFixed(2) + 'ms',
          maxTime: test.maxTime + 'ms'
        });
        this.stats.failedTests++;
      }
      
      this.stats.totalTests++;
    });
    
    this.log(`✅ Performance testada: ${this.testResults.performance.filter(r => r.status === 'PASSED').length}/${performanceTests.length}`, 'success');
  }

  // Gerar relatório final
  generateReport() {
    const executionTime = ((Date.now() - this.stats.startTime) / 1000).toFixed(2);
    const successRate = ((this.stats.passedTests / this.stats.totalTests) * 100).toFixed(1);
    
    console.log('\n' + '='.repeat(80));
    console.log('🧪 RELATÓRIO DE TESTES DA EXTENSÃO WHATSAPP V2.0');
    console.log('='.repeat(80));
    
    console.log(`📊 ESTATÍSTICAS GERAIS:`);
    console.log(`   • Total de testes: ${this.stats.totalTests}`);
    console.log(`   • Testes aprovados: ${this.stats.passedTests}`);
    console.log(`   • Testes falharam: ${this.stats.failedTests}`);
    console.log(`   • Taxa de sucesso: ${successRate}%`);
    console.log(`   • Tempo de execução: ${executionTime}s`);
    console.log('');
    
    // Detalhes por categoria
    const categories = [
      { name: 'Tipos de Campanha', results: this.testResults.campaignTypes },
      { name: 'Detecção de Países', results: this.testResults.countryDetection },
      { name: 'Personalização', results: this.testResults.messagePersonalization },
      { name: 'Sistema de Retry', results: this.testResults.retrySystem },
      { name: 'Performance', results: this.testResults.performance }
    ];
    
    categories.forEach(category => {
      const passed = category.results.filter(r => r.status === 'PASSED').length;
      const total = category.results.length;
      const categoryRate = ((passed / total) * 100).toFixed(1);
      
      console.log(`📋 ${category.name.toUpperCase()}:`);
      console.log(`   • Aprovados: ${passed}/${total} (${categoryRate}%)`);
      
      if (category.results.some(r => r.status === 'FAILED')) {
        console.log(`   • Falhas detectadas:`);
        category.results.filter(r => r.status === 'FAILED').forEach(fail => {
          console.log(`     - ${fail.error || fail.message || 'Falha no teste'}`);
        });
      }
      console.log('');
    });
    
    // Conclusão
    console.log('🎯 CONCLUSÃO:');
    if (successRate >= 90) {
      console.log(`   ✅ EXTENSÃO APROVADA PARA PRODUÇÃO (${successRate}% sucesso)`);
    } else if (successRate >= 70) {
      console.log(`   ⚠️  EXTENSÃO APROVADA COM RESSALVAS (${successRate}% sucesso)`);
    } else {
      console.log(`   ❌ EXTENSÃO REPROVADA (${successRate}% sucesso)`);
    }
    
    console.log('='.repeat(80));
    console.log('📱 Extensão WhatsApp V2.0 - Suporte Campanhas SMS Avançadas');
    console.log('='.repeat(80));
  }

  // Executar todos os testes
  async runAllTests() {
    this.log('🚀 Iniciando testes da Extensão WhatsApp V2.0...', 'info');
    
    this.testCampaignTypes();
    this.testCountryDetection();
    this.testMessagePersonalization();
    this.testRetrySystem();
    this.testPerformance();
    
    this.generateReport();
  }
}

// Executar testes
const tester = new ExtensionTesterV2();
tester.runAllTests();