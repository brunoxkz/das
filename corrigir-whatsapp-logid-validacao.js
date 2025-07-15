/**
 * 🔧 CORREÇÃO CRÍTICA - VALIDAÇÃO DE LOGID NO WHATSAPP
 * Cria logs válidos para testar o sistema de validação
 */

class WhatsAppLogIdFixer {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.token = null;
    this.userId = null;
  }

  log(message, color = 'cyan') {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
      cyan: '\x1b[36m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      red: '\x1b[31m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
        ...options.headers
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {})
    };

    const startTime = Date.now();
    try {
      const response = await fetch(url, config);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = await response.text();
      }
      
      return {
        success: response.ok,
        status: response.status,
        data,
        responseTime,
        url,
        method: config.method
      };
    } catch (error) {
      const endTime = Date.now();
      return {
        success: false,
        status: 0,
        data: null,
        responseTime: endTime - startTime,
        error: error.message,
        url,
        method: config.method
      };
    }
  }

  async authenticate() {
    this.log('🔐 Iniciando autenticação...');
    
    const loginData = {
      email: 'admin@vendzz.com',
      password: 'admin123'
    };

    const result = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: loginData
    });

    if (result.success && result.data && result.data.token) {
      this.token = result.data.token;
      this.userId = result.data.user.id;
      this.log(`✅ Autenticação realizada com sucesso - ${result.responseTime}ms`);
      return true;
    } else if (result.success && result.data && result.data.message === 'Login successful') {
      // Verificar se o token está em outra estrutura
      if (result.data.user && result.data.user.id) {
        this.userId = result.data.user.id;
        this.log(`✅ Login realizado, mas token não encontrado na resposta - ${result.responseTime}ms`);
        return true;
      }
    }
    
    this.log(`❌ Falha na autenticação: ${JSON.stringify(result.data)}`, 'red');
    return false;
  }

  async criarCampanhaWhatsApp() {
    this.log('📱 Criando campanha WhatsApp de teste...');
    
    const campaignData = {
      title: 'Campanha Teste LogId',
      message: 'Mensagem de teste para validação de LogId',
      scheduledDate: new Date(Date.now() + 60000).toISOString(),
      audience: 'abandoned',
      filterType: 'all',
      quizIds: []
    };

    const result = await this.makeRequest('/api/whatsapp-campaigns', {
      method: 'POST',
      body: campaignData
    });

    if (result.success && result.data.id) {
      this.log(`✅ Campanha criada: ${result.data.id} - ${result.responseTime}ms`);
      return result.data.id;
    } else {
      this.log(`❌ Falha ao criar campanha: ${result.data?.message || 'Erro desconhecido'}`, 'red');
      return null;
    }
  }

  async buscarLogsDaCampanha(campaignId) {
    this.log(`🔍 Buscando logs da campanha ${campaignId}...`);
    
    const result = await this.makeRequest(`/api/whatsapp-campaigns/${campaignId}/logs`);
    
    if (result.success && result.data && result.data.length > 0) {
      this.log(`✅ Encontrados ${result.data.length} logs - ${result.responseTime}ms`);
      return result.data;
    } else {
      this.log(`❌ Nenhum log encontrado para campanha ${campaignId}`, 'yellow');
      return [];
    }
  }

  async testarValidacaoLogId(logId) {
    this.log(`🔒 Testando validação de LogId: ${logId}...`);
    
    const logData = {
      logId: logId,
      status: 'delivered',
      phone: '5511999000001',
      timestamp: new Date().toISOString()
    };

    const result = await this.makeRequest('/api/whatsapp-extension/logs', {
      method: 'POST',
      body: logData
    });

    if (result.success) {
      this.log(`✅ Validação de LogId aprovada - ${result.responseTime}ms`, 'green');
      return true;
    } else {
      this.log(`❌ Validação de LogId falhou: ${result.data?.error || 'Erro desconhecido'} - ${result.responseTime}ms`, 'red');
      return false;
    }
  }

  async executarCorrecao() {
    this.log('🔥 INICIANDO CORREÇÃO DE LOGID WHATSAPP', 'blue');
    this.log('============================================================', 'blue');
    
    try {
      // 1. Autenticar
      const authSuccess = await this.authenticate();
      if (!authSuccess) {
        this.log('❌ CORREÇÃO INTERROMPIDA - Falha na autenticação', 'red');
        return false;
      }

      // 2. Criar campanha de teste
      const campaignId = await this.criarCampanhaWhatsApp();
      if (!campaignId) {
        this.log('❌ CORREÇÃO INTERROMPIDA - Falha ao criar campanha', 'red');
        return false;
      }

      // 3. Aguardar processamento
      this.log('⏳ Aguardando processamento da campanha (10 segundos)...');
      await new Promise(resolve => setTimeout(resolve, 10000));

      // 4. Buscar logs da campanha
      const logs = await this.buscarLogsDaCampanha(campaignId);
      if (logs.length === 0) {
        this.log('❌ CORREÇÃO INTERROMPIDA - Nenhum log encontrado', 'red');
        return false;
      }

      // 5. Testar validação com LogId real
      const primeiroLog = logs[0];
      this.log(`🔍 Usando LogId: ${primeiroLog.id}`);
      
      const validacaoSucesso = await this.testarValidacaoLogId(primeiroLog.id);
      
      if (validacaoSucesso) {
        this.log('============================================================', 'green');
        this.log('✅ CORREÇÃO CONCLUÍDA COM SUCESSO!', 'green');
        this.log('✅ Validação de LogId agora funcionando corretamente', 'green');
        this.log('============================================================', 'green');
        return true;
      } else {
        this.log('============================================================', 'red');
        this.log('❌ CORREÇÃO FALHOU - Validação ainda não funciona', 'red');
        this.log('============================================================', 'red');
        return false;
      }
      
    } catch (error) {
      this.log(`❌ ERRO DURANTE CORREÇÃO: ${error.message}`, 'red');
      return false;
    }
  }
}

// Executar correção
const fixer = new WhatsAppLogIdFixer();
fixer.executarCorrecao().then(success => {
  if (success) {
    console.log('\n🎯 MÓDULO WHATSAPP PRONTO PARA ATINGIR 95% DE SUCESSO!');
  } else {
    console.log('\n⚠️ CORREÇÃO INCOMPLETA - Mais ajustes necessários');
  }
}).catch(error => {
  console.error('❌ ERRO CRÍTICO:', error);
});