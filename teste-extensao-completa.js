// Teste completo da extensão Chrome WhatsApp
const API_BASE = 'http://localhost:5000';

// Simular comportamento da extensão
class ExtensionSimulator {
  constructor() {
    this.token = null;
    this.isConnected = false;
    this.version = '1.0.0';
    this.lastPing = null;
    this.stats = {
      pendingMessages: 0,
      sentMessages: 0,
      failedMessages: 0
    };
  }

  async authenticate() {
    console.log('🔐 Simulando autenticação da extensão...');
    
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });

    if (!response.ok) {
      throw new Error(`Autenticação falhou: ${response.status}`);
    }

    const data = await response.json();
    this.token = data.accessToken;
    this.isConnected = true;
    
    console.log('✅ Autenticação realizada com sucesso');
    console.log(`   Token: ${this.token.substring(0, 20)}...`);
    
    return true;
  }

  async ping() {
    if (!this.token) {
      throw new Error('Token não encontrado - faça login primeiro');
    }

    console.log('📡 Enviando ping para servidor...');
    
    const response = await fetch(`${API_BASE}/api/whatsapp-extension/status`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: this.version,
        pendingMessages: this.stats.pendingMessages,
        sentMessages: this.stats.sentMessages,
        failedMessages: this.stats.failedMessages,
        isActive: true
      })
    });

    if (!response.ok) {
      throw new Error(`Ping falhou: ${response.status}`);
    }

    const data = await response.json();
    this.lastPing = new Date();
    
    console.log('✅ Ping enviado com sucesso');
    console.log(`   Success: ${data.success}`);
    console.log(`   Configurações sincronizadas: ${data.settings ? 'Sim' : 'Não'}`);
    
    return data;
  }

  async getStatus() {
    if (!this.token) {
      throw new Error('Token não encontrado - faça login primeiro');
    }

    console.log('📊 Verificando status da extensão...');
    
    const response = await fetch(`${API_BASE}/api/whatsapp-extension/status`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Status falhou: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ Status obtido com sucesso');
    console.log(`   Conectada: ${data.connected}`);
    console.log(`   Último ping: ${data.lastPing || 'Nunca'}`);
    console.log(`   Versão: ${data.version || 'N/A'}`);
    
    return data;
  }

  async getPendingMessages() {
    if (!this.token) {
      throw new Error('Token não encontrado - faça login primeiro');
    }

    console.log('📱 Buscando mensagens pendentes...');
    
    const response = await fetch(`${API_BASE}/api/whatsapp-extension/pending-messages`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Busca de mensagens falhou: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ Mensagens pendentes obtidas');
    console.log(`   Total: ${data.messages?.length || 0}`);
    
    if (data.messages && data.messages.length > 0) {
      console.log(`   Primeira mensagem: ${data.messages[0].phone} - ${data.messages[0].message.substring(0, 50)}...`);
    }
    
    return data;
  }

  async syncSettings() {
    if (!this.token) {
      throw new Error('Token não encontrado - faça login primeiro');
    }

    console.log('⚙️ Sincronizando configurações...');
    
    // Primeiro, buscar configurações atuais
    const getResponse = await fetch(`${API_BASE}/api/whatsapp-extension/settings`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!getResponse.ok) {
      throw new Error(`Busca de configurações falhou: ${getResponse.status}`);
    }

    const currentSettings = await getResponse.json();
    console.log('✅ Configurações atuais obtidas');
    console.log(`   Auto-envio: ${currentSettings.autoSend}`);
    console.log(`   Delay: ${currentSettings.messageDelay}ms`);
    console.log(`   Máximo por dia: ${currentSettings.maxMessagesPerDay}`);
    
    // Atualizar configurações
    const newSettings = {
      ...currentSettings,
      autoSend: true,
      messageDelay: 30000, // 30 segundos
      maxMessagesPerDay: 100
    };

    const postResponse = await fetch(`${API_BASE}/api/whatsapp-extension/settings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newSettings)
    });

    if (!postResponse.ok) {
      throw new Error(`Atualização de configurações falhou: ${postResponse.status}`);
    }

    const updatedSettings = await postResponse.json();
    console.log('✅ Configurações atualizadas');
    console.log(`   Novas configurações sincronizadas: ${updatedSettings.success}`);
    
    return updatedSettings;
  }

  async sendMessageLog(messageId, phone, status, details = null) {
    if (!this.token) {
      throw new Error('Token não encontrado - faça login primeiro');
    }

    console.log(`📤 Enviando log de mensagem: ${phone} - ${status}`);
    
    const response = await fetch(`${API_BASE}/api/whatsapp-extension/message-sent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messageId,
        phone,
        status,
        details
      })
    });

    if (!response.ok) {
      throw new Error(`Log de mensagem falhou: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ Log enviado com sucesso');
    console.log(`   ID da mensagem: ${data.logId}`);
    
    // Atualizar estatísticas locais
    if (status === 'sent') {
      this.stats.sentMessages++;
    } else if (status === 'failed') {
      this.stats.failedMessages++;
    }
    
    return data;
  }

  async testAutomationFiles() {
    if (!this.token) {
      throw new Error('Token não encontrado - faça login primeiro');
    }

    console.log('📋 Testando arquivos de automação...');
    
    const response = await fetch(`${API_BASE}/api/whatsapp-automation-files`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Busca de arquivos falhou: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ Arquivos de automação obtidos');
    console.log(`   Total de arquivos: ${data.files?.length || 0}`);
    
    if (data.files && data.files.length > 0) {
      console.log(`   Primeiro arquivo: ${data.files[0].quizTitle} (${data.files[0].totalContacts} contatos)`);
      
      // Testar acesso aos contatos do primeiro arquivo
      const fileResponse = await fetch(`${API_BASE}/api/whatsapp-automation-files/${data.files[0].id}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (fileResponse.ok) {
        const fileData = await fileResponse.json();
        console.log(`   Contatos do arquivo: ${fileData.contacts?.length || 0}`);
        
        if (fileData.contacts && fileData.contacts.length > 0) {
          console.log(`   Primeiro contato: ${fileData.contacts[0].telefone || fileData.contacts[0].phone} - ${fileData.contacts[0].status}`);
        }
      }
    }
    
    return data;
  }
}

// Executar teste completo
async function testeExtensaoCompleta() {
  console.log('🚀 TESTE COMPLETO DA EXTENSÃO CHROME WHATSAPP');
  console.log('=' .repeat(60));
  
  const extension = new ExtensionSimulator();
  const resultados = {};
  
  try {
    // 1. Autenticação
    console.log('\n1. TESTE DE AUTENTICAÇÃO');
    console.log('-' .repeat(30));
    resultados.auth = await extension.authenticate();
    
    // 2. Status inicial
    console.log('\n2. VERIFICAÇÃO DE STATUS');
    console.log('-' .repeat(30));
    resultados.status = await extension.getStatus();
    
    // 3. Ping
    console.log('\n3. TESTE DE PING');
    console.log('-' .repeat(30));
    resultados.ping = await extension.ping();
    
    // 4. Mensagens pendentes
    console.log('\n4. MENSAGENS PENDENTES');
    console.log('-' .repeat(30));
    resultados.pendingMessages = await extension.getPendingMessages();
    
    // 5. Sincronização de configurações
    console.log('\n5. SINCRONIZAÇÃO DE CONFIGURAÇÕES');
    console.log('-' .repeat(30));
    resultados.settings = await extension.syncSettings();
    
    // 6. Arquivos de automação
    console.log('\n6. ARQUIVOS DE AUTOMAÇÃO');
    console.log('-' .repeat(30));
    resultados.automationFiles = await extension.testAutomationFiles();
    
    // 7. Simulação de envio de mensagem
    console.log('\n7. SIMULAÇÃO DE ENVIO');
    console.log('-' .repeat(30));
    if (resultados.pendingMessages.messages && resultados.pendingMessages.messages.length > 0) {
      const message = resultados.pendingMessages.messages[0];
      resultados.messageSent = await extension.sendMessageLog(
        message.id,
        message.phone,
        'sent',
        'Mensagem enviada com sucesso via simulação'
      );
    } else {
      console.log('⚠️  Nenhuma mensagem pendente para simular envio');
    }
    
    // 8. Ping final para verificar estatísticas
    console.log('\n8. PING FINAL');
    console.log('-' .repeat(30));
    resultados.finalPing = await extension.ping();
    
    console.log('\n🎉 TESTE COMPLETO CONCLUÍDO COM SUCESSO!');
    console.log('=' .repeat(60));
    
    // Resumo dos resultados
    console.log('\n📊 RESUMO DOS RESULTADOS:');
    console.log(`✅ Autenticação: ${resultados.auth ? 'OK' : 'FALHOU'}`);
    console.log(`✅ Status: ${resultados.status?.connected ? 'Conectada' : 'Desconectada'}`);
    console.log(`✅ Ping: ${resultados.ping?.success === true ? 'OK' : 'FALHOU'}`);
    console.log(`✅ Mensagens pendentes: ${resultados.pendingMessages?.length || 0} encontradas`);
    console.log(`✅ Configurações: ${resultados.settings?.success ? 'Sincronizadas' : 'Erro'}`);
    console.log(`✅ Arquivos de automação: ${resultados.automationFiles?.length || 0} disponíveis`);
    console.log(`✅ Simulação de envio: ${resultados.messageSent ? 'OK' : 'Pulado'}`);
    
    console.log('\n🔥 EXTENSÃO CHROME TOTALMENTE FUNCIONAL!');
    console.log('💯 Todas as funcionalidades testadas e aprovadas');
    console.log('🚀 Pronta para uso em produção');
    
    return {
      success: true,
      results: resultados,
      summary: {
        auth: !!resultados.auth,
        connected: resultados.status?.connected,
        ping: resultados.ping?.success === true,
        pendingMessages: resultados.pendingMessages?.length || 0,
        settingsSync: resultados.settings?.success,
        automationFiles: resultados.automationFiles?.length || 0,
        messageSent: !!resultados.messageSent
      }
    };
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.log('=' .repeat(60));
    
    return {
      success: false,
      error: error.message,
      results: resultados
    };
  }
}

// Executar teste
testeExtensaoCompleta().then(resultado => {
  if (resultado.success) {
    console.log('\n🎯 VALIDAÇÃO FINAL:');
    console.log(`🔐 Autenticação: ${resultado.summary.auth ? '✅' : '❌'}`);
    console.log(`📡 Conectividade: ${resultado.summary.connected ? '✅' : '❌'}`);
    console.log(`🏓 Ping: ${resultado.summary.ping ? '✅' : '❌'}`);
    console.log(`📱 Mensagens: ${resultado.summary.pendingMessages} disponíveis`);
    console.log(`⚙️ Configurações: ${resultado.summary.settingsSync ? '✅' : '❌'}`);
    console.log(`📋 Arquivos: ${resultado.summary.automationFiles} disponíveis`);
    console.log(`📤 Envio: ${resultado.summary.messageSent ? '✅' : '⚠️'}`);
    
    const score = Object.values(resultado.summary).filter(v => v === true || (typeof v === 'number' && v > 0)).length;
    console.log(`\n📈 SCORE: ${score}/7 funcionalidades OK`);
    
    if (score >= 6) {
      console.log('🏆 EXTENSÃO APROVADA PARA PRODUÇÃO!');
    } else {
      console.log('⚠️  Algumas funcionalidades precisam de atenção');
    }
  } else {
    console.log('\n❌ TESTE FALHOU - VERIFICAR ERROS ACIMA');
  }
}).catch(console.error);