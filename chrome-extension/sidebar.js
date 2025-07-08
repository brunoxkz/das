// Sidebar WhatsApp Automation
let isMinimized = false;
let isPaused = false;
let isAutoSendEnabled = true;
let isMonitoringEnabled = true;

// Configurações e estado
let config = {
  serverUrl: 'https://vendzz--5000.prod1.defang.dev',
  token: null,
  autoSend: true,
  monitoring: true
};

let stats = {
  pending: 0,
  sent: 0,
  failed: 0,
  successRate: 100
};

// Elementos DOM
let elements = {};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  initializeElements();
  loadConfig();
  setupEventListeners();
  startStatusUpdates();
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
});

function initializeElements() {
  elements = {
    sidebar: document.getElementById('sidebar'),
    statusText: document.getElementById('statusText'),
    statusDetails: document.getElementById('statusDetails'),
    statusDot: document.getElementById('statusDot'),
    statusIndicator: document.getElementById('statusIndicator'),
    autoSendToggle: document.getElementById('autoSendToggle'),
    monitoringToggle: document.getElementById('monitoringToggle'),
    pendingCount: document.getElementById('pendingCount'),
    sentCount: document.getElementById('sentCount'),
    failedCount: document.getElementById('failedCount'),
    successRate: document.getElementById('successRate'),
    logContainer: document.getElementById('logContainer'),
    pauseBtn: document.getElementById('pauseBtn'),
    configBtn: document.getElementById('configBtn'),
    minimizeBtn: document.getElementById('minimizeBtn'),
    currentTime: document.getElementById('currentTime')
  };
}

function setupEventListeners() {
  // Toggle Auto-Send
  elements.autoSendToggle.addEventListener('click', () => {
    isAutoSendEnabled = !isAutoSendEnabled;
    elements.autoSendToggle.classList.toggle('active', isAutoSendEnabled);
    config.autoSend = isAutoSendEnabled;
    saveConfig();
    addLog(isAutoSendEnabled ? 'Auto-envio ativado' : 'Auto-envio pausado', isAutoSendEnabled ? 'success' : 'error');
  });

  // Toggle Monitoring
  elements.monitoringToggle.addEventListener('click', () => {
    isMonitoringEnabled = !isMonitoringEnabled;
    elements.monitoringToggle.classList.toggle('active', isMonitoringEnabled);
    config.monitoring = isMonitoringEnabled;
    saveConfig();
    addLog(isMonitoringEnabled ? 'Monitoramento ativado' : 'Monitoramento pausado', isMonitoringEnabled ? 'success' : 'error');
  });

  // Pause/Resume
  elements.pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    elements.pauseBtn.textContent = isPaused ? '▶️ Retomar' : '⏸️ Pausar';
    elements.pauseBtn.classList.toggle('btn-primary', isPaused);
    elements.pauseBtn.classList.toggle('btn-secondary', !isPaused);
    addLog(isPaused ? 'Sistema pausado' : 'Sistema retomado', isPaused ? 'error' : 'success');
  });

  // Config
  elements.configBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Minimize/Maximize
  elements.minimizeBtn.addEventListener('click', toggleMinimize);
  
  // Click no minimizado para expandir
  elements.sidebar.addEventListener('click', (e) => {
    if (isMinimized && e.target === elements.sidebar) {
      toggleMinimize();
    }
  });
}

function toggleMinimize() {
  isMinimized = !isMinimized;
  elements.sidebar.classList.toggle('minimized', isMinimized);
  
  if (isMinimized) {
    elements.sidebar.innerHTML = '<div class="minimize-icon">📱</div>';
  } else {
    location.reload(); // Recarregar o sidebar completo
  }
}

function loadConfig() {
  chrome.storage.sync.get(['whatsappConfig'], (result) => {
    if (result.whatsappConfig) {
      config = { ...config, ...result.whatsappConfig };
      elements.autoSendToggle.classList.toggle('active', config.autoSend);
      elements.monitoringToggle.classList.toggle('active', config.monitoring);
      isAutoSendEnabled = config.autoSend;
      isMonitoringEnabled = config.monitoring;
    }
  });
}

function saveConfig() {
  chrome.storage.sync.set({
    whatsappConfig: config
  });
}

function startStatusUpdates() {
  // Verificar status a cada 10 segundos
  setInterval(checkStatus, 10000);
  checkStatus(); // Verificação inicial
}

async function checkStatus() {
  if (isPaused || !isMonitoringEnabled) {
    updateStatus('Pausado', 'Sistema pausado pelo usuário', 'disconnected');
    return;
  }

  try {
    // Verificar WhatsApp Web
    const whatsappStatus = await checkWhatsAppStatus();
    
    // Verificar conexão com servidor
    const serverStatus = await checkServerConnection();
    
    if (whatsappStatus && serverStatus) {
      updateStatus('Ativo', 'WhatsApp Web conectado', 'connected');
      
      // Buscar mensagens pendentes
      if (isAutoSendEnabled) {
        await fetchPendingMessages();
      }
    } else if (!whatsappStatus) {
      updateStatus('WhatsApp Offline', 'Aguardando WhatsApp Web', 'disconnected');
    } else if (!serverStatus) {
      updateStatus('Servidor Offline', 'Erro de conexão com servidor', 'disconnected');
    }
  } catch (error) {
    updateStatus('Erro', 'Erro na verificação: ' + error.message, 'disconnected');
    addLog('Erro: ' + error.message, 'error');
  }
}

async function checkWhatsAppStatus() {
  // Verificar se WhatsApp Web está carregado
  const selectors = [
    '[data-testid="chat-list"]',
    '[data-testid="chat-list-search"]',
    '[data-testid="main"]',
    '#side'
  ];
  
  for (const selector of selectors) {
    if (document.querySelector(selector)) {
      return true;
    }
  }
  
  return false;
}

async function checkServerConnection() {
  try {
    const response = await fetch(`${config.serverUrl}/api/whatsapp-extension/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function fetchPendingMessages() {
  try {
    const response = await fetch(`${config.serverUrl}/api/whatsapp-extension/pending`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const messages = await response.json();
      updateStats({ pending: messages.length });
      
      if (messages.length > 0) {
        addLog(`${messages.length} mensagens pendentes encontradas`, 'success');
        // Processar mensagens se auto-envio estiver ativo
        if (isAutoSendEnabled) {
          await processMessages(messages);
        }
      }
    }
  } catch (error) {
    addLog('Erro ao buscar mensagens: ' + error.message, 'error');
  }
}

async function processMessages(messages) {
  for (const message of messages) {
    if (isPaused || !isAutoSendEnabled) break;
    
    try {
      addLog(`Enviando para ${message.phone}: ${message.message}`, 'info');
      
      // Simular envio (aqui seria integrado com o content script)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Marcar como enviado
      await markMessageAsSent(message.id);
      
      updateStats({ sent: stats.sent + 1, pending: stats.pending - 1 });
      addLog(`✅ Enviado para ${message.phone}`, 'success');
      
    } catch (error) {
      updateStats({ failed: stats.failed + 1, pending: stats.pending - 1 });
      addLog(`❌ Falha para ${message.phone}: ${error.message}`, 'error');
    }
  }
}

async function markMessageAsSent(messageId) {
  try {
    await fetch(`${config.serverUrl}/api/whatsapp-extension/logs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        logId: messageId,
        status: 'sent',
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Erro ao marcar mensagem como enviada:', error);
  }
}

function updateStatus(status, details, type) {
  elements.statusText.textContent = status;
  elements.statusDetails.textContent = details;
  
  elements.statusDot.className = 'status-dot';
  if (type === 'disconnected') {
    elements.statusDot.classList.add('disconnected');
  }
}

function updateStats(newStats) {
  stats = { ...stats, ...newStats };
  
  elements.pendingCount.textContent = stats.pending;
  elements.sentCount.textContent = stats.sent;
  elements.failedCount.textContent = stats.failed;
  
  // Calcular taxa de sucesso
  const total = stats.sent + stats.failed;
  if (total > 0) {
    stats.successRate = Math.round((stats.sent / total) * 100);
    elements.successRate.textContent = stats.successRate + '%';
  }
}

function addLog(message, type = 'info') {
  const logItem = document.createElement('div');
  logItem.className = `log-item log-${type}`;
  
  const timeDiv = document.createElement('div');
  timeDiv.className = 'log-time';
  timeDiv.textContent = new Date().toLocaleTimeString();
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'log-message';
  messageDiv.textContent = message;
  
  logItem.appendChild(timeDiv);
  logItem.appendChild(messageDiv);
  
  elements.logContainer.insertBefore(logItem, elements.logContainer.firstChild);
  
  // Manter apenas os 50 logs mais recentes
  const logs = elements.logContainer.children;
  if (logs.length > 50) {
    elements.logContainer.removeChild(logs[logs.length - 1]);
  }
}

function updateCurrentTime() {
  const now = new Date();
  elements.currentTime.textContent = now.toLocaleTimeString();
}