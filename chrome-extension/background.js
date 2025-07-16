// Vendzz WhatsApp Extension - Background Service Worker V2.0
console.log('🚀 Vendzz WhatsApp Extension V2.0 iniciada - Suporte Campanhas SMS Avançadas');

// Configuração da extensão
let config = {
  serverUrl: 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev',
  token: null, // Token será obtido automaticamente
  userId: null, // ID do usuário obtido após login
  userEmail: null, // Email para logs de segurança
  isConnected: false,
  lastPing: null,
  version: '2.0.0',
  // Configurações avançadas para novos tipos de campanha
  supportedCampaignTypes: [
    'CAMPANHA_REMARKETING',
    'CAMPANHA_AO_VIVO',
    'CAMPANHA_ULTRA_CUSTOMIZADA',
    'CAMPANHA_ULTRA_PERSONALIZADA',
    'CAMPANHA_AB_TEST'
  ],
  messagePersonalization: true,
  countryDetection: true,
  antiWebViewDetection: true,
  smartRetry: true,
  maxRetryAttempts: 3,
  retryDelay: 2000
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

// Conectar com o servidor Vendzz e sincronizar configurações
async function connectToServer() {
  try {
    // Testar conexão com ping
    const response = await apiRequest('/api/whatsapp-extension/status');
    
    if (response.connected && response.authenticatedUser) {
      config.isConnected = true;
      config.lastPing = new Date().toISOString();
      config.userId = response.authenticatedUser.id;
      config.userEmail = response.authenticatedUser.email;
      
      console.log(`✅ Conectado como ${config.userEmail}`);
      
      // Sincronizar configurações do servidor
      await syncSettingsFromServer();
      saveConfig();
    }
    
    return true;
  } catch (error) {
    config.isConnected = false;
    console.error('❌ Falha ao conectar:', error);
    return false;
  }
}

// Sincronizar configurações do servidor
async function syncSettingsFromServer() {
  try {
    const settings = await apiRequest('/api/whatsapp-extension/settings');
    
    if (settings.success) {
      config.messagePersonalization = settings.messagePersonalization || true;
      config.countryDetection = settings.countryDetection || true;
      config.antiWebViewDetection = settings.antiWebViewDetection || true;
      config.smartRetry = settings.smartRetry || true;
      config.maxRetryAttempts = settings.maxRetryAttempts || 3;
      config.retryDelay = settings.retryDelay || 2000;
      
      console.log('⚙️ Configurações sincronizadas do servidor');
    }
  } catch (error) {
    console.log('⚠️ Usando configurações padrão:', error.message);
  }
}

// Função para detectar país do número de telefone
function detectCountryFromPhone(phone) {
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Detecção de países baseada em DDI
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
  
  // Verificar correspondências por tamanho decrescente de DDI
  const sortedKeys = Object.keys(countryMap).sort((a, b) => b.length - a.length);
  
  for (const ddi of sortedKeys) {
    if (cleanPhone.startsWith(ddi)) {
      return countryMap[ddi];
    }
  }
  
  // Padrão: Brasil
  return { country: 'BR', currency: 'R$', greeting: 'Olá' };
}

// Função para personalizar mensagem com variáveis dinâmicas
function personalizeMessage(message, variables = {}, phoneNumber = null) {
  try {
    let personalizedMessage = message;
    
    // Aplicar detecção de país se habilitada
    if (config.countryDetection && phoneNumber) {
      const countryInfo = detectCountryFromPhone(phoneNumber);
      variables.greeting = countryInfo.greeting;
      variables.currency = countryInfo.currency;
      variables.country = countryInfo.country;
    }
    
    // Substituir variáveis na mensagem
    Object.keys(variables).forEach(key => {
      const value = variables[key];
      if (value !== null && value !== undefined) {
        const regex = new RegExp(`{${key}}`, 'g');
        personalizedMessage = personalizedMessage.replace(regex, value);
      }
    });
    
    // Remover variáveis não encontradas
    personalizedMessage = personalizedMessage.replace(/{[^}]+}/g, '');
    
    return personalizedMessage;
  } catch (error) {
    console.error('❌ Erro ao personalizar mensagem:', error);
    return message;
  }
}

// Função para processar diferentes tipos de campanhas
function processCampaignType(campaign) {
  const { type, settings } = campaign;
  
  switch (type) {
    case 'CAMPANHA_REMARKETING':
      return {
        priority: 'high',
        delay: 1000,
        retryAttempts: 3,
        personalization: true,
        filter: 'leads_antigos'
      };
      
    case 'CAMPANHA_AO_VIVO':
      return {
        priority: 'medium',
        delay: 500,
        retryAttempts: 2,
        personalization: true,
        filter: settings?.leadType || 'todos'
      };
      
    case 'CAMPANHA_ULTRA_CUSTOMIZADA':
      return {
        priority: 'high',
        delay: 2000,
        retryAttempts: 3,
        personalization: true,
        customMessages: true,
        filter: 'resposta_especifica'
      };
      
    case 'CAMPANHA_ULTRA_PERSONALIZADA':
      return {
        priority: 'highest',
        delay: 3000,
        retryAttempts: 5,
        personalization: true,
        advancedFilters: true,
        filter: 'perfil_detalhado'
      };
      
    case 'CAMPANHA_AB_TEST':
      return {
        priority: 'medium',
        delay: 1000,
        retryAttempts: 2,
        personalization: true,
        abTest: true,
        filter: 'teste_ab'
      };
      
    default:
      return {
        priority: 'medium',
        delay: 1000,
        retryAttempts: 2,
        personalization: false,
        filter: 'padrao'
      };
  }
}

// Sincronizar configurações do servidor
async function syncSettingsFromServer() {
  try {
    console.log('⚙️ Sincronizando configurações...');
    const settings = await apiRequest('/api/whatsapp-extension/settings');
    
    if (settings) {
      config.serverSettings = settings;
      console.log('✅ Configurações sincronizadas:', settings);
    }
  } catch (error) {
    console.error('❌ Erro ao sincronizar configurações:', error);
  }
}

// Enviar configurações para o servidor
async function syncSettingsToServer(newSettings) {
  try {
    console.log('📤 Enviando configurações...');
    const response = await apiRequest('/api/whatsapp-extension/settings', {
      method: 'POST',
      body: JSON.stringify(newSettings)
    });
    
    if (response.success) {
      console.log('✅ Configurações salvas no servidor');
      config.serverSettings = newSettings;
      saveConfig();
    }
    
    return response;
  } catch (error) {
    console.error('❌ Erro ao enviar configurações:', error);
    throw error;
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