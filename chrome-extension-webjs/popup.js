// Popup Interface - Vendzz WhatsApp 2.0
// Interface de configuração e monitoramento da extensão

let config = {
  serverUrl: 'http://localhost:5000',
  token: null,
  userId: null
};

let extensionState = {
  isActive: false,
  isConnected: false,
  stats: {
    contactsCount: 0,
    messagesCount: 0,
    campaignsCount: 0,
    successRate: 100
  }
};

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🎨 Popup Vendzz WhatsApp 2.0 carregado');
  
  loadConfig();
  setupEventListeners();
  updateStatus();
});

// ========================================
// CONFIGURAÇÃO
// ========================================

async function loadConfig() {
  try {
    // Carregar configuração do storage
    const result = await chrome.storage.local.get(['vendzz_config']);
    if (result.vendzz_config) {
      config = { ...config, ...result.vendzz_config };
      
      // Preencher campos da interface
      document.getElementById('serverUrl').value = config.serverUrl || 'http://localhost:5000';
      document.getElementById('authToken').value = config.token || '';
      
      console.log('📋 Configuração carregada no popup');
    }
    
    // Buscar status da extensão
    const response = await chrome.runtime.sendMessage({ action: 'GET_STATUS' });
    if (response) {
      extensionState = { ...extensionState, ...response };
      updateInterface();
    }
    
  } catch (error) {
    console.error('❌ Erro ao carregar configuração:', error);
    showMessage('Erro ao carregar configuração', 'error');
  }
}

async function saveConfig() {
  try {
    const serverUrl = document.getElementById('serverUrl').value.trim();
    const authToken = document.getElementById('authToken').value.trim();
    
    if (!serverUrl) {
      showMessage('URL do servidor é obrigatória', 'error');
      return;
    }
    
    if (!authToken) {
      showMessage('Token de acesso é obrigatório', 'error');
      return;
    }
    
    // Atualizar configuração local
    config.serverUrl = serverUrl;
    config.token = authToken;
    
    // Enviar para background script
    const response = await chrome.runtime.sendMessage({
      action: 'UPDATE_CONFIG',
      serverUrl: serverUrl,
      token: authToken
    });
    
    if (response.success) {
      showMessage('Configuração salva com sucesso!', 'success');
      
      // Testar conexão automaticamente
      setTimeout(testConnection, 1000);
    } else {
      showMessage('Erro ao salvar configuração', 'error');
    }
    
  } catch (error) {
    console.error('❌ Erro ao salvar configuração:', error);
    showMessage('Erro ao salvar configuração', 'error');
  }
}

// ========================================
// TESTE DE CONEXÃO
// ========================================

async function testConnection() {
  try {
    showMessage('Testando conexão...', 'info');
    
    const response = await fetch(`${config.serverUrl}/api/extension/sync`, {
      headers: {
        'Authorization': `Bearer ${config.token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      showMessage('✅ Conexão estabelecida com sucesso!', 'success');
      
      // Atualizar estatísticas
      extensionState.stats = {
        contactsCount: data.stats?.totalPhones || 0,
        messagesCount: data.stats?.messagesSent || 0,
        campaignsCount: data.stats?.totalQuizzes || 0,
        successRate: data.stats?.successRate || 100
      };
      
      extensionState.isConnected = true;
      updateInterface();
      
    } else if (response.status === 401) {
      showMessage('Token inválido ou expirado', 'error');
      updateConnectionStatus('disconnected');
    } else {
      showMessage(`Erro de conexão: ${response.status}`, 'error');
      updateConnectionStatus('error');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error);
    showMessage('Erro de rede ao conectar', 'error');
    updateConnectionStatus('error');
  }
}

// ========================================
// AÇÕES DA EXTENSÃO
// ========================================

async function toggleExtension() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'TOGGLE_EXTENSION' });
    
    if (response) {
      extensionState.isActive = response.isActive;
      updateInterface();
      
      const status = extensionState.isActive ? 'ativada' : 'pausada';
      showMessage(`Extensão ${status}`, 'info');
    }
    
  } catch (error) {
    console.error('❌ Erro ao alterar status da extensão:', error);
    showMessage('Erro ao alterar status', 'error');
  }
}

async function openWhatsApp() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'OPEN_WHATSAPP' });
    
    if (response.success) {
      showMessage('WhatsApp Web aberto', 'success');
      
      // Fechar popup após abrir WhatsApp
      setTimeout(() => window.close(), 1000);
    }
    
  } catch (error) {
    console.error('❌ Erro ao abrir WhatsApp:', error);
    showMessage('Erro ao abrir WhatsApp', 'error');
  }
}

function openPanel() {
  chrome.tabs.create({ 
    url: config.serverUrl,
    active: true 
  });
  
  showMessage('Painel Vendzz aberto', 'success');
  setTimeout(() => window.close(), 500);
}

// ========================================
// ATUALIZAÇÃO DA INTERFACE
// ========================================

function updateInterface() {
  updateConnectionStatus();
  updateStats();
  updateButtons();
}

function updateConnectionStatus(forceStatus = null) {
  const extensionStatus = document.getElementById('extensionStatus');
  const serverStatus = document.getElementById('serverStatus');
  const whatsappStatus = document.getElementById('whatsappStatus');
  
  // Status da extensão
  extensionStatus.className = 'status-indicator';
  if (extensionState.isActive) {
    extensionStatus.classList.add('connected');
  }
  
  // Status do servidor
  serverStatus.className = 'status-indicator';
  if (forceStatus === 'disconnected' || forceStatus === 'error') {
    extensionState.isConnected = false;
  } else if (extensionState.isConnected) {
    serverStatus.classList.add('connected');
  }
  
  // Status do WhatsApp (simulado por enquanto)
  whatsappStatus.className = 'status-indicator';
  if (extensionState.isActive && extensionState.isConnected) {
    whatsappStatus.classList.add('connected');
  }
}

function updateStats() {
  document.getElementById('contactsCount').textContent = extensionState.stats.contactsCount;
  document.getElementById('messagesCount').textContent = extensionState.stats.messagesCount;
  document.getElementById('campaignsCount').textContent = extensionState.stats.campaignsCount;
  document.getElementById('successRate').textContent = `${extensionState.stats.successRate}%`;
}

function updateButtons() {
  const toggleBtn = document.getElementById('toggleExtensionBtn');
  const testBtn = document.getElementById('testConnectionBtn');
  const saveBtn = document.getElementById('saveConfigBtn');
  
  // Botão de toggle
  if (extensionState.isActive) {
    toggleBtn.textContent = 'Pausar Extensão';
    toggleBtn.className = 'btn btn-secondary';
  } else {
    toggleBtn.textContent = 'Ativar Extensão';
    toggleBtn.className = 'btn btn-primary';
  }
  
  // Habilitar/desabilitar botões baseado na conexão
  const hasConfig = config.serverUrl && config.token;
  testBtn.disabled = !hasConfig;
  toggleBtn.disabled = !extensionState.isConnected;
}

// ========================================
// SISTEMA DE MENSAGENS
// ========================================

function showMessage(text, type = 'info') {
  const container = document.getElementById('messageContainer');
  
  // Remover mensagem anterior
  container.innerHTML = '';
  
  // Criar nova mensagem
  const message = document.createElement('div');
  message.className = `message ${type}`;
  message.textContent = text;
  
  container.appendChild(message);
  
  // Auto-remover após 5 segundos (exceto erros)
  if (type !== 'error') {
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 5000);
  }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
  // Botões principais
  document.getElementById('saveConfigBtn').addEventListener('click', saveConfig);
  document.getElementById('testConnectionBtn').addEventListener('click', testConnection);
  document.getElementById('toggleExtensionBtn').addEventListener('click', toggleExtension);
  document.getElementById('openWhatsAppBtn').addEventListener('click', openWhatsApp);
  document.getElementById('openPanelBtn').addEventListener('click', openPanel);
  
  // Enter nos campos de input
  document.getElementById('authToken').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveConfig();
    }
  });
  
  document.getElementById('serverUrl').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveConfig();
    }
  });
  
  // Validação em tempo real
  document.getElementById('authToken').addEventListener('input', (e) => {
    const hasToken = e.target.value.trim().length > 0;
    const hasUrl = document.getElementById('serverUrl').value.trim().length > 0;
    
    document.getElementById('saveConfigBtn').disabled = !(hasToken && hasUrl);
  });
}

// ========================================
// ATUALIZAÇÃO PERIÓDICA
// ========================================

async function updateStatus() {
  try {
    // Atualizar status da extensão
    const response = await chrome.runtime.sendMessage({ action: 'GET_STATUS' });
    if (response) {
      extensionState = { ...extensionState, ...response };
      updateInterface();
    }
    
    // Se conectado, buscar estatísticas do servidor
    if (extensionState.isConnected && config.token) {
      const serverResponse = await fetch(`${config.serverUrl}/api/extension/sync`, {
        headers: { 'Authorization': `Bearer ${config.token}` }
      });
      
      if (serverResponse.ok) {
        const data = await serverResponse.json();
        extensionState.stats = {
          contactsCount: data.stats?.totalPhones || 0,
          messagesCount: data.stats?.messagesSent || 0,
          campaignsCount: data.stats?.totalQuizzes || 0,
          successRate: data.stats?.successRate || 100
        };
        updateStats();
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error);
  }
}

// Atualizar status a cada 10 segundos
setInterval(updateStatus, 10000);

// ========================================
// LOGS E DEBUG
// ========================================

console.log('✅ Popup Vendzz WhatsApp 2.0 inicializado');