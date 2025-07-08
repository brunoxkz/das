// Background Service Worker - Vendzz WhatsApp 2.0
// Versão ultra simplificada para nova arquitetura

console.log('🚀 Vendzz WhatsApp 2.0 Background Service Worker iniciado');

// Estado global
let extensionState = {
  isActive: false,
  currentTab: null,
  serverUrl: 'http://localhost:5000',
  token: null,
  userId: null,
  stats: {
    contactsDetected: 0,
    messagesSent: 0,
    commandsExecuted: 0
  }
};

// ========================================
// GERENCIAMENTO DE CONFIGURAÇÃO
// ========================================

// Carregar configuração do storage
async function loadConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['vendzz_config'], (result) => {
      if (result.vendzz_config) {
        Object.assign(extensionState, result.vendzz_config);
        console.log('📋 Configuração carregada do storage');
      }
      resolve();
    });
  });
}

// Salvar configuração no storage
async function saveConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ 
      vendzz_config: {
        serverUrl: extensionState.serverUrl,
        token: extensionState.token,
        userId: extensionState.userId,
        stats: extensionState.stats
      }
    }, () => {
      console.log('💾 Configuração salva no storage');
      resolve();
    });
  });
}

// ========================================
// COMUNICAÇÃO COM POPUP
// ========================================

// Escutar mensagens do popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Mensagem recebida:', message.action);
  
  switch (message.action) {
    case 'GET_STATUS':
      sendResponse({
        isActive: extensionState.isActive,
        serverUrl: extensionState.serverUrl,
        hasToken: !!extensionState.token,
        stats: extensionState.stats
      });
      break;
      
    case 'UPDATE_CONFIG':
      extensionState.serverUrl = message.serverUrl;
      extensionState.token = message.token;
      extensionState.userId = message.userId;
      saveConfig();
      sendResponse({ success: true });
      break;
      
    case 'TOGGLE_EXTENSION':
      extensionState.isActive = !extensionState.isActive;
      saveConfig();
      sendResponse({ isActive: extensionState.isActive });
      break;
      
    case 'OPEN_WHATSAPP':
      openWhatsAppTab();
      sendResponse({ success: true });
      break;
      
    default:
      console.log('❓ Ação desconhecida:', message.action);
      sendResponse({ error: 'Ação desconhecida' });
  }
  
  return true; // Manter canal aberto para resposta assíncrona
});

// ========================================
// GERENCIAMENTO DE ABAS
// ========================================

// Abrir aba do WhatsApp Web
async function openWhatsAppTab() {
  try {
    // Verificar se já existe aba do WhatsApp aberta
    const tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
    
    if (tabs.length > 0) {
      // Focar na aba existente
      await chrome.tabs.update(tabs[0].id, { active: true });
      await chrome.windows.update(tabs[0].windowId, { focused: true });
      console.log('📱 Focalizando aba existente do WhatsApp');
    } else {
      // Criar nova aba
      const tab = await chrome.tabs.create({
        url: 'https://web.whatsapp.com',
        active: true
      });
      console.log('📱 Nova aba do WhatsApp criada:', tab.id);
    }
    
    extensionState.currentTab = tabs[0]?.id || null;
    
  } catch (error) {
    console.error('❌ Erro ao abrir WhatsApp:', error);
  }
}

// Detectar quando aba do WhatsApp é fechada
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === extensionState.currentTab) {
    console.log('📱 Aba do WhatsApp foi fechada');
    extensionState.currentTab = null;
    extensionState.isActive = false;
    saveConfig();
  }
});

// ========================================
// MONITORAMENTO DE ATIVIDADE
// ========================================

// Atualizar estatísticas
function updateStats(type, increment = 1) {
  switch (type) {
    case 'contacts':
      extensionState.stats.contactsDetected += increment;
      break;
    case 'messages':
      extensionState.stats.messagesSent += increment;
      break;
    case 'commands':
      extensionState.stats.commandsExecuted += increment;
      break;
  }
  
  saveConfig();
  console.log('📊 Estatísticas atualizadas:', extensionState.stats);
}

// ========================================
// TESTE DE CONECTIVIDADE
// ========================================

// Testar conexão com servidor
async function testServerConnection() {
  try {
    console.log('🔍 Testando conexão com servidor...');
    
    const response = await fetch(`${extensionState.serverUrl}/api/extension/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${extensionState.token || 'test'}`
      },
      body: JSON.stringify({
        connected: true,
        version: '2.0.0',
        timestamp: Date.now()
      })
    });
    
    if (response.ok) {
      console.log('✅ Conexão com servidor OK');
      return true;
    } else {
      console.log('⚠️ Servidor respondeu com status:', response.status);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar com servidor:', error);
    return false;
  }
}

// ========================================
// INSTALAÇÃO E INICIALIZAÇÃO
// ========================================

// Quando extensão é instalada/atualizada
chrome.runtime.onInstalled.addListener((details) => {
  console.log('🔧 Extensão instalada/atualizada:', details.reason);
  
  if (details.reason === 'install') {
    console.log('🎉 Primeira instalação - configuração inicial');
    
    // Configuração padrão
    extensionState = {
      isActive: false,
      currentTab: null,
      serverUrl: 'http://localhost:5000',
      token: null,
      userId: null,
      stats: {
        contactsDetected: 0,
        messagesSent: 0,
        commandsExecuted: 0
      }
    };
    
    saveConfig();
  }
});

// Quando extensão inicia
chrome.runtime.onStartup.addListener(() => {
  console.log('🚀 Extensão iniciando...');
  loadConfig();
});

// ========================================
// UTILITÁRIOS DE DEBUG
// ========================================

// Log de debug para desenvolvimento
function debugLog(message, data = null) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] 🐛 ${message}`, data || '');
}

// Limpar dados de debug
function clearDebugData() {
  extensionState.stats = {
    contactsDetected: 0,
    messagesSent: 0,
    commandsExecuted: 0
  };
  saveConfig();
  console.log('🧹 Dados de debug limpos');
}

// ========================================
// INICIALIZAÇÃO
// ========================================

// Carregar configuração na inicialização
loadConfig().then(() => {
  console.log('✅ Background service worker inicializado');
  console.log('📊 Estado atual:', {
    isActive: extensionState.isActive,
    hasToken: !!extensionState.token,
    serverUrl: extensionState.serverUrl
  });
});

// Testar conexão inicial após 5 segundos
setTimeout(() => {
  if (extensionState.token) {
    testServerConnection();
  }
}, 5000);