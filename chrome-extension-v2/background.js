// Background script para gerenciar a comunicação com a API
let config = {
  serverUrl: 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev',
  accessToken: null,
  autoMode: false,
  refreshInterval: 30000 // 30 segundos
};

let intervalId = null;

// Salvar configuração
function saveConfig() {
  console.log('💾 Salvando configuração:', config);
  chrome.storage.local.set({ vend_config: config }, () => {
    console.log('✅ Configuração salva com sucesso');
  });
}

// Carregar configuração
async function loadConfig() {
  try {
    const result = await chrome.storage.local.get(['vend_config']);
    if (result.vend_config) {
      config = { ...config, ...result.vend_config };
      console.log('📥 Configuração carregada:', config);
    } else {
      console.log('⚠️ Nenhuma configuração encontrada no storage');
    }
    return config;
  } catch (error) {
    console.error('❌ Erro ao carregar configuração:', error);
    return config;
  }
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
    console.log('📂 Buscando arquivos de automação...');
    const files = await apiRequest('/api/whatsapp-automation-files');
    console.log(`📂 Arquivos encontrados: ${files?.length || 0}`);
    
    if (files && Array.isArray(files)) {
      console.log('📂 Primeiros 3 arquivos:', files.slice(0, 3));
      return files;
    } else {
      console.log('⚠️ Resposta inválida ou vazia dos arquivos');
      return [];
    }
  } catch (error) {
    console.error('❌ Erro ao buscar arquivos:', error);
    return [];
  }
}

// Buscar contatos de um arquivo específico
async function fetchFileContacts(fileId) {
  if (!config.accessToken || !fileId) {
    return { contacts: [], userId: null, quizId: null, quizTitle: null };
  }

  try {
    const fileData = await apiRequest(`/api/whatsapp-automation-files/${fileId}`);
    
    // Parse contacts se vier como string
    let contacts = [];
    if (fileData.contacts) {
      if (typeof fileData.contacts === 'string') {
        try {
          contacts = JSON.parse(fileData.contacts);
        } catch (e) {
          console.log('❌ Erro ao parsear contacts:', e);
          contacts = [];
        }
      } else if (Array.isArray(fileData.contacts)) {
        contacts = fileData.contacts;
      }
    }
    
    console.log(`📱 Contatos no arquivo ${fileId}: ${contacts.length}`);
    console.log(`📱 Sample contact:`, contacts[0]);
    
    return {
      contacts,
      userId: fileData.user_id,
      quizId: fileData.quiz_id,
      quizTitle: fileData.quiz_title
    };
  } catch (error) {
    console.error('❌ Erro ao buscar contatos do arquivo:', error);
    return { contacts: [], userId: null, quizId: null, quizTitle: null };
  }
}

// Sincronizar novos leads do arquivo
async function syncNewLeads(userId, quizId, lastSync) {
  if (!config.accessToken || !userId || !quizId) {
    return { hasUpdates: false, newLeads: [], error: 'Missing parameters' };
  }

  try {
    const syncData = await apiRequest(`/api/whatsapp-automation-file/${userId}/${quizId}/sync?lastSync=${lastSync}`);
    console.log(`🔄 Sync result:`, syncData);
    
    return syncData;
  } catch (error) {
    console.error('❌ Erro ao sincronizar novos leads:', error);
    return { hasUpdates: false, newLeads: [], error: error.message };
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

    case 'save_token':
      if (!request.token) {
        sendResponse({ success: false, error: 'Token não fornecido' });
        break;
      }
      
      config.accessToken = request.token;
      saveConfig();
      
      // Testar token imediatamente
      apiRequest('/api/auth/verify').then(result => {
        sendResponse({ success: true, message: 'Token salvo e validado!', user: result.user });
      }).catch(error => {
        sendResponse({ success: false, error: 'Token inválido: ' + error.message });
      });
      return true; // Indica resposta assíncrona
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
      fetchFileContacts(request.fileId).then(result => {
        sendResponse(result);
      }).catch(error => {
        sendResponse({ contacts: [], error: error.message });
      });
      return true; // Indica resposta assíncrona
      
    case 'sync_new_leads':
      syncNewLeads(request.userId, request.quizId, request.lastSync).then(result => {
        sendResponse(result);
      }).catch(error => {
        sendResponse({ hasUpdates: false, newLeads: [], error: error.message });
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

// Sistema de ping para manter conexão ativa
async function pingServer() {
  try {
    const response = await apiRequest('/api/whatsapp-extension/ping', {
      method: 'POST',
      body: JSON.stringify({
        version: "2.1.0"
      })
    });

    if (response.success) {
      console.log('✅ Ping v2 enviado com sucesso - Extensão conectada');
    } else {
      console.log('❌ Ping v2 falhou - Extensão desconectada');
    }
  } catch (error) {
    console.error('❌ Erro no ping v2 - Extensão desconectada:', error);
  }
}

// Carregar configuração na inicialização
loadConfig().then(() => {
  console.log('⚙️ Configuração carregada:', config);
  
  if (config.autoMode) {
    startMonitoring();
  }
  
  // Ping a cada 60 segundos se autenticado
  if (config.authToken) {
    setInterval(pingServer, 60000);
    pingServer(); // Ping imediato
  }
});