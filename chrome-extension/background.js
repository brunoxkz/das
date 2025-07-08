// Vendzz WhatsApp Extension - Background Service Worker
console.log('🚀 Vendzz WhatsApp Extension iniciada');

// Configuração da extensão
let config = {
  serverUrl: 'http://localhost:5000',
  token: null, // JWT token do usuário autenticado
  userId: null, // ID do usuário para validação
  userEmail: null, // Email para logs de segurança
  isConnected: false,
  lastPing: null,
  version: '1.0.0'
};

// Estado da extensão
let extensionState = {
  pendingMessages: 0,
  sentMessages: 0,
  failedMessages: 0,
  isActive: false,
  campaigns: []
};

// Carregar configuração do storage
chrome.storage.local.get(['vendzz_config'], (result) => {
  if (result.vendzz_config) {
    config = { ...config, ...result.vendzz_config };
    console.log('📋 Configuração carregada:', config);
  }
});

// Função para salvar configuração
function saveConfig() {
  chrome.storage.local.set({ vendzz_config: config });
}

// Função para fazer requisições à API com autenticação segura
async function apiRequest(endpoint, options = {}) {
  try {
    // Verificar se token está configurado
    if (!config.token) {
      throw new Error('Token de autenticação não configurado');
    }

    const url = `${config.serverUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.token}`,
      ...options.headers
    };

    console.log(`📡 Requisição (${config.userEmail || 'não-autenticado'}): ${options.method || 'GET'} ${endpoint}`);

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      console.error('❌ Token expirado ou inválido');
      config.isConnected = false;
      throw new Error('Token de autenticação inválido ou expirado');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Armazenar informações do usuário autenticado na primeira conexão
    if (data.authenticatedUser && !config.userId) {
      config.userId = data.authenticatedUser.id;
      config.userEmail = data.authenticatedUser.email;
      console.log(`🔐 Usuário autenticado: ${config.userEmail} (${config.userId})`);
      await saveConfig();
    }

    return data;
  } catch (error) {
    console.error('❌ Erro na API:', error);
    throw error;
  }
}

// Conectar com o servidor Vendzz
async function connectToServer() {
  try {
    // Testar conexão com ping
    const response = await apiRequest('/api/whatsapp-extension/status');
    
    config.isConnected = true;
    config.lastPing = new Date().toISOString();
    saveConfig();
    
    console.log('✅ Conectado ao servidor Vendzz');
    return true;
  } catch (error) {
    config.isConnected = false;
    console.error('❌ Falha ao conectar:', error);
    return false;
  }
}

// Buscar mensagens pendentes
async function fetchPendingMessages() {
  try {
    const messages = await apiRequest('/api/whatsapp-extension/pending');
    extensionState.pendingMessages = messages.length;
    
    if (messages.length > 0) {
      console.log(`📱 ${messages.length} mensagens pendentes encontradas`);
      return messages;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Erro ao buscar mensagens:', error);
    return [];
  }
}

// Enviar log para o servidor
async function sendLog(logData) {
  try {
    await apiRequest('/api/whatsapp-extension/logs', {
      method: 'POST',
      body: JSON.stringify(logData)
    });
  } catch (error) {
    console.error('❌ Erro ao enviar log:', error);
  }
}

// Processar mensagens pendentes
async function processMessages() {
  if (!config.isConnected) {
    await connectToServer();
    return;
  }

  try {
    const pendingMessages = await fetchPendingMessages();
    
    if (pendingMessages.length === 0) {
      return;
    }

    // Verificar se WhatsApp Web está aberto
    const tabs = await chrome.tabs.query({
      url: 'https://web.whatsapp.com/*'
    });

    if (tabs.length === 0) {
      console.log('⚠️ WhatsApp Web não está aberto');
      return;
    }

    // Enviar mensagens para o content script
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'SEND_MESSAGES',
          messages: pendingMessages
        });
      } catch (error) {
        console.error('❌ Erro ao comunicar com content script:', error);
      }
    }

  } catch (error) {
    console.error('❌ Erro ao processar mensagens:', error);
  }
}

// Sistema de ping para manter conexão ativa
async function pingServer() {
  try {
    await apiRequest('/api/whatsapp-extension/status', {
      method: 'POST',
      body: JSON.stringify({
        version: config.version,
        pendingMessages: extensionState.pendingMessages,
        sentMessages: extensionState.sentMessages,
        failedMessages: extensionState.failedMessages,
        isActive: extensionState.isActive
      })
    });

    config.lastPing = new Date().toISOString();
    saveConfig();
  } catch (error) {
    config.isConnected = false;
    console.error('❌ Erro no ping:', error);
  }
}

// Listener para mensagens do content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Mensagem recebida:', message);

  switch (message.action) {
    case 'MESSAGE_SENT':
      extensionState.sentMessages++;
      sendLog({
        logId: message.logId,
        status: 'sent',
        phone: message.phone,
        timestamp: new Date().toISOString()
      });
      break;

    case 'MESSAGE_FAILED':
      extensionState.failedMessages++;
      sendLog({
        logId: message.logId,
        status: 'failed',
        phone: message.phone,
        error: message.error,
        timestamp: new Date().toISOString()
      });
      break;

    case 'EXTENSION_STATUS':
      sendResponse({
        config,
        extensionState
      });
      break;

    case 'UPDATE_CONFIG':
      config = { ...config, ...message.config };
      saveConfig();
      sendResponse({ success: true });
      break;
  }
});

// Inicialização da extensão
chrome.runtime.onStartup.addListener(() => {
  console.log('🚀 Extensão iniciada');
  connectToServer();
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('📦 Extensão instalada');
  connectToServer();
});

// Executar processamento a cada 30 segundos
setInterval(processMessages, 30000);

// Ping a cada 60 segundos
setInterval(pingServer, 60000);

// Conectar imediatamente
connectToServer();