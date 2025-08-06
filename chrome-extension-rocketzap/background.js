console.log('🚀 RocketZap Lead Extractor Background iniciado');

// Configurações
const CONFIG = {
  API_BASE_URL: 'http://localhost:5000',
  SYNC_INTERVAL: 30000 // 30 segundos
};

// Estatísticas
let stats = {
  totalLeads: 0,
  successfulSyncs: 0,
  lastSync: null
};

// Listener para instalação/atualização da extensão
chrome.runtime.onInstalled.addListener(() => {
  console.log('✅ RocketZap Lead Extractor instalado');
  
  // Configurar storage inicial
  chrome.storage.local.set({
    isActive: true,
    processedLeads: [],
    settings: {
      autoSync: true,
      syncInterval: 30000,
      apiUrl: CONFIG.API_BASE_URL
    }
  });
});

// Listener para mensagens dos content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'LEAD_PROCESSED':
      handleLeadProcessed(message.lead);
      break;
      
    case 'GET_BACKGROUND_STATS':
      sendResponse(stats);
      break;
      
    case 'SYNC_LEADS':
      syncLeads().then(result => sendResponse(result));
      return true; // Manter canal aberto para resposta assíncrona
      
    case 'CLEAR_LEADS':
      clearProcessedLeads().then(result => sendResponse(result));
      return true;
  }
});

// Processar novo lead
async function handleLeadProcessed(lead) {
  try {
    stats.totalLeads++;
    console.log('📊 Novo lead processado:', lead.phone);
    
    // Notificar popup se estiver aberto
    chrome.runtime.sendMessage({
      type: 'STATS_UPDATED',
      stats: stats
    }).catch(() => {}); // Ignorar erro se popup não estiver aberto
    
  } catch (error) {
    console.error('❌ Erro ao processar lead:', error);
  }
}

// Sincronizar leads com servidor
async function syncLeads() {
  try {
    console.log('🔄 Iniciando sincronização de leads...');
    
    const result = await chrome.storage.local.get(['processedLeads']);
    const leads = result.processedLeads || [];
    
    if (leads.length === 0) {
      console.log('📊 Nenhum lead para sincronizar');
      return { success: true, synced: 0 };
    }
    
    // Enviar leads para o servidor
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/leads/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        leads: leads,
        source: 'rocketzap-extension'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      stats.successfulSyncs++;
      stats.lastSync = new Date().toISOString();
      
      console.log('✅ Sincronização concluída:', result);
      return { success: true, synced: leads.length };
    } else {
      console.error('❌ Erro na sincronização:', response.status);
      return { success: false, error: 'HTTP ' + response.status };
    }
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    return { success: false, error: error.message };
  }
}

// Limpar leads processados
async function clearProcessedLeads() {
  try {
    await chrome.storage.local.set({
      processedLeads: []
    });
    
    stats.totalLeads = 0;
    console.log('🗑️ Leads processados limpos');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao limpar leads:', error);
    return { success: false, error: error.message };
  }
}

// Verificar se tab é do RocketZap
function isRocketZapTab(url) {
  return url && url.includes('app.rocketzap.com.br');
}

// Listener para mudanças de tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && isRocketZapTab(tab.url)) {
    console.log('📱 RocketZap detectado na tab:', tabId);
    
    // Injetar content script se necessário
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(error => {
      // Ignorar erro se já estiver injetado
      console.log('Content script já presente ou erro:', error.message);
    });
  }
});

// Sincronização periódica (opcional)
setInterval(async () => {
  const result = await chrome.storage.local.get(['settings']);
  const settings = result.settings || {};
  
  if (settings.autoSync) {
    syncLeads();
  }
}, CONFIG.SYNC_INTERVAL);

console.log('✅ Background worker configurado');