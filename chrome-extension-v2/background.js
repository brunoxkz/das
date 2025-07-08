// Background script para gerenciar a comunicação com a API
let config = {
  serverUrl: 'http://localhost:5000',
  accessToken: null,
  autoMode: false,
  refreshInterval: 30000 // 30 segundos
};

let intervalId = null;

// Salvar configuração
function saveConfig() {
  chrome.storage.local.set({ vend_config: config });
}

// Carregar configuração
async function loadConfig() {
  const result = await chrome.storage.local.get(['vend_config']);
  if (result.vend_config) {
    config = { ...config, ...result.vend_config };
  }
  return config;
}

// Fazer requisição para a API
async function apiRequest(endpoint, options = {}) {
  try {
    const url = `${config.serverUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(config.accessToken && { 'Authorization': `Bearer ${config.accessToken}` }),
      ...options.headers
    };

    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ API Response:`, data);
    return data;
    
  } catch (error) {
    console.error(`❌ API Error for ${endpoint}:`, error);
    throw error;
  }
}

// Buscar arquivos de automação do usuário
async function fetchAutomationFiles() {
  if (!config.accessToken) {
    console.log('🔐 Sem token de acesso');
    return [];
  }

  try {
    const files = await apiRequest('/api/whatsapp-automation-files');
    console.log(`📁 Arquivos encontrados: ${files.length}`);
    return files;
  } catch (error) {
    console.error('❌ Erro ao buscar arquivos:', error);
    return [];
  }
}

// Buscar contatos de um arquivo específico
async function fetchFileContacts(fileId) {
  if (!config.accessToken || !fileId) {
    return [];
  }

  try {
    const fileData = await apiRequest(`/api/whatsapp-automation-files/${fileId}`);
    const phones = JSON.parse(fileData.phones || '[]');
    console.log(`📱 Contatos no arquivo ${fileId}: ${phones.length}`);
    return phones;
  } catch (error) {
    console.error('❌ Erro ao buscar contatos do arquivo:', error);
    return [];
  }
}

// Verificar status da extensão
async function sendStatus() {
  if (!config.accessToken) return;

  try {
    await apiRequest('/api/whatsapp-extension/status', {
      method: 'POST',
      body: JSON.stringify({
        connected: true,
        version: '2.0',
        lastPing: new Date().toISOString(),
        autoMode: config.autoMode
      })
    });
  } catch (error) {
    console.error('❌ Erro ao enviar status:', error);
  }
}

// Inicializar monitoramento
async function startMonitoring() {
  if (intervalId) {
    clearInterval(intervalId);
  }

  intervalId = setInterval(async () => {
    await sendStatus();
    
    // Notificar content script sobre atualizações
    try {
      const tabs = await chrome.tabs.query({ url: "https://web.whatsapp.com/*" });
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { 
          action: 'refresh_data',
          timestamp: Date.now()
        }).catch(() => {}); // Ignorar erros se tab não estiver ativa
      }
    } catch (error) {
      console.log('🔍 Nenhuma aba do WhatsApp ativa');
    }
  }, config.refreshInterval);

  console.log('🔄 Monitoramento iniciado');
}

// Parar monitoramento
function stopMonitoring() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  console.log('⏹️ Monitoramento parado');
}

// Listeners para mensagens
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Mensagem recebida:', request);

  switch (request.action) {
    case 'get_config':
      sendResponse(config);
      break;

    case 'save_config':
      config = { ...config, ...request.config };
      saveConfig();
      sendResponse({ success: true });
      break;

    case 'start_monitoring':
      config.autoMode = true;
      saveConfig();
      startMonitoring();
      sendResponse({ success: true });
      break;

    case 'stop_monitoring':
      config.autoMode = false;
      saveConfig();
      stopMonitoring();
      sendResponse({ success: true });
      break;

    case 'fetch_files':
      fetchAutomationFiles().then(files => {
        sendResponse({ files });
      }).catch(error => {
        sendResponse({ error: error.message });
      });
      return true; // Indica resposta assíncrona

    case 'fetch_contacts':
      fetchFileContacts(request.fileId).then(contacts => {
        sendResponse({ contacts });
      }).catch(error => {
        sendResponse({ error: error.message });
      });
      return true; // Indica resposta assíncrona

    case 'test_connection':
      apiRequest('/api/auth/verify').then(result => {
        sendResponse({ success: true, user: result.user });
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true; // Indica resposta assíncrona
  }
});

// Inicialização
chrome.runtime.onInstalled.addListener(async () => {
  console.log('🚀 Extensão Vendzz WhatsApp Automation v2.0 instalada');
  await loadConfig();
  
  if (config.autoMode) {
    startMonitoring();
  }
});

// Carregar configuração na inicialização
loadConfig().then(() => {
  console.log('⚙️ Configuração carregada:', config);
  
  if (config.autoMode) {
    startMonitoring();
  }
});