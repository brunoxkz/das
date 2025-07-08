// Vendzz WhatsApp Extension - Popup Script
console.log('🎛️ Popup carregado');

// Elementos DOM
const elements = {
  connectionStatus: document.getElementById('connection-status'),
  whatsappStatus: document.getElementById('whatsapp-status'),
  lastPing: document.getElementById('last-ping'),
  pendingCount: document.getElementById('pending-count'),
  sentCount: document.getElementById('sent-count'),
  serverUrl: document.getElementById('server-url'),
  accessToken: document.getElementById('access-token'),
  saveConfigBtn: document.getElementById('save-config'),
  testConnectionBtn: document.getElementById('test-connection'),
  openWhatsappBtn: document.getElementById('open-whatsapp'),
  logs: document.getElementById('logs')
};

// Estado atual
let currentConfig = {
  serverUrl: 'http://localhost:5000',
  token: null,
  isConnected: false,
  lastPing: null
};

let extensionState = {
  pendingMessages: 0,
  sentMessages: 0,
  failedMessages: 0
};

// Função para adicionar log
function addLog(message) {
  const logEntry = document.createElement('div');
  logEntry.className = 'log-entry';
  logEntry.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
  
  elements.logs.appendChild(logEntry);
  elements.logs.scrollTop = elements.logs.scrollHeight;
  
  // Manter apenas os últimos 20 logs
  while (elements.logs.children.length > 20) {
    elements.logs.removeChild(elements.logs.firstChild);
  }
}

// Função para atualizar status visual
function updateStatus() {
  // Status da conexão
  if (currentConfig.isConnected) {
    elements.connectionStatus.textContent = 'Conectado';
    elements.connectionStatus.className = 'status-value status-connected';
  } else {
    elements.connectionStatus.textContent = 'Desconectado';
    elements.connectionStatus.className = 'status-value status-disconnected';
  }

  // Último ping
  if (currentConfig.lastPing) {
    const pingTime = new Date(currentConfig.lastPing);
    elements.lastPing.textContent = pingTime.toLocaleTimeString();
  } else {
    elements.lastPing.textContent = 'Nunca';
  }

  // Estatísticas
  elements.pendingCount.textContent = extensionState.pendingMessages;
  elements.sentCount.textContent = extensionState.sentMessages;

  // Verificar status do WhatsApp Web
  checkWhatsAppStatus();
}

// Verificar status do WhatsApp Web
async function checkWhatsAppStatus() {
  try {
    const tabs = await chrome.tabs.query({
      url: 'https://web.whatsapp.com/*'
    });

    if (tabs.length > 0) {
      // Verificar se está carregado
      try {
        const response = await chrome.tabs.sendMessage(tabs[0].id, {
          action: 'GET_STATUS'
        });

        if (response && response.isLoaded) {
          elements.whatsappStatus.textContent = 'Ativo';
          elements.whatsappStatus.className = 'status-value status-connected';
        } else {
          elements.whatsappStatus.textContent = 'Carregando';
          elements.whatsappStatus.className = 'status-value status-disconnected';
        }
      } catch (error) {
        elements.whatsappStatus.textContent = 'Erro';
        elements.whatsappStatus.className = 'status-value status-disconnected';
      }
    } else {
      elements.whatsappStatus.textContent = 'Fechado';
      elements.whatsappStatus.className = 'status-value status-disconnected';
    }
  } catch (error) {
    elements.whatsappStatus.textContent = 'Erro';
    elements.whatsappStatus.className = 'status-value status-disconnected';
  }
}

// Carregar configuração
async function loadConfig() {
  try {
    // Solicitar status do background script
    const response = await chrome.runtime.sendMessage({
      action: 'EXTENSION_STATUS'
    });

    if (response) {
      currentConfig = { ...currentConfig, ...response.config };
      extensionState = { ...extensionState, ...response.extensionState };

      // Atualizar campos do formulário
      elements.serverUrl.value = currentConfig.serverUrl || 'http://localhost:5000';
      elements.accessToken.value = currentConfig.token || '';

      updateStatus();
      addLog('Configuração carregada');
    }
  } catch (error) {
    console.error('Erro ao carregar configuração:', error);
    addLog('Erro ao carregar configuração');
  }
}

// Salvar configuração
async function saveConfig() {
  try {
    const newConfig = {
      serverUrl: elements.serverUrl.value.trim(),
      token: elements.accessToken.value.trim()
    };

    if (!newConfig.serverUrl) {
      addLog('❌ URL do servidor é obrigatória');
      return;
    }

    // Enviar para background script
    const response = await chrome.runtime.sendMessage({
      action: 'UPDATE_CONFIG',
      config: newConfig
    });

    if (response && response.success) {
      currentConfig = { ...currentConfig, ...newConfig };
      addLog('✅ Configuração salva');
      
      // Testar conexão automaticamente
      setTimeout(testConnection, 1000);
    } else {
      addLog('❌ Erro ao salvar configuração');
    }
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    addLog('❌ Erro ao salvar configuração');
  }
}

// Testar conexão
async function testConnection() {
  try {
    addLog('🔌 Testando conexão...');
    elements.testConnectionBtn.disabled = true;
    elements.testConnectionBtn.textContent = 'Testando...';

    const url = `${currentConfig.serverUrl}/api/whatsapp-extension/status`;
    const headers = {};
    
    if (currentConfig.token) {
      headers['Authorization'] = `Bearer ${currentConfig.token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    if (response.ok) {
      currentConfig.isConnected = true;
      currentConfig.lastPing = new Date().toISOString();
      addLog('✅ Conexão bem-sucedida');
    } else {
      currentConfig.isConnected = false;
      addLog(`❌ Erro de conexão: ${response.status}`);
    }
  } catch (error) {
    currentConfig.isConnected = false;
    addLog(`❌ Erro de conexão: ${error.message}`);
  } finally {
    elements.testConnectionBtn.disabled = false;
    elements.testConnectionBtn.textContent = '🔌 Testar Conexão';
    updateStatus();
  }
}

// Abrir WhatsApp Web
async function openWhatsApp() {
  try {
    await chrome.tabs.create({
      url: 'https://web.whatsapp.com',
      active: true
    });
    
    addLog('📱 WhatsApp Web aberto');
    
    // Atualizar status após um delay
    setTimeout(updateStatus, 2000);
  } catch (error) {
    console.error('Erro ao abrir WhatsApp:', error);
    addLog('❌ Erro ao abrir WhatsApp Web');
  }
}

// Event listeners
elements.saveConfigBtn.addEventListener('click', saveConfig);
elements.testConnectionBtn.addEventListener('click', testConnection);
elements.openWhatsappBtn.addEventListener('click', openWhatsApp);

// Atualizar status periodicamente
setInterval(updateStatus, 5000);

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  addLog('🎛️ Popup inicializado');
  loadConfig();
});

// Detectar mudanças em tempo real
chrome.runtime.onMessage?.addListener((message, sender, sendResponse) => {
  if (message.action === 'STATUS_UPDATE') {
    extensionState = { ...extensionState, ...message.state };
    updateStatus();
  }
});