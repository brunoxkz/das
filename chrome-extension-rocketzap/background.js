console.log('🚀 RocketZap Lead Extractor Background iniciado');

// Configurações
const CONFIG = {
  API_BASE_URL: 'http://localhost:5000',
  SYNC_INTERVAL: 30000, // 30 segundos
  AUTO_EXPORT_INTERVAL: 60 * 60 * 1000, // 1 hora em ms
  XLS_FILE_PATTERNS: ['Audiencia.xls', 'Audiencia.xlsx', 'audiencia']
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
      autoExport: true,
      syncInterval: 30000,
      exportInterval: CONFIG.AUTO_EXPORT_INTERVAL,
      apiUrl: CONFIG.API_BASE_URL
    }
  });
  
  // Configurar alarme para exportação automática
  setupAutoExportAlarm();
});

// Listener para mensagens dos content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'LEAD_PROCESSED':
      handleLeadProcessed(message.lead);
      break;
      
    case 'CREATE_LOGZZ_ORDER':
      handleCreateLogzzOrder(message.data, sendResponse);
      return true; // Keep message channel open
      
    case 'SYNC_LEADS':
      handleSyncLeads(message.leads, sendResponse);
      return true; // Keep message channel open
      
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

// ===== INTERCEPTAÇÃO DE DOWNLOADS XLS =====

// Interceptar downloads do arquivo Audiencia.xls
chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    const url = details.url.toLowerCase();
    const isAudienciaFile = CONFIG.XLS_FILE_PATTERNS.some(pattern => 
      url.includes(pattern.toLowerCase())
    );
    
    if (isAudienciaFile && details.tabId > 0) {
      console.log('📥 Interceptando download Audiencia.xls:', url);
      
      try {
        // Buscar dados da tab
        const tab = await chrome.tabs.get(details.tabId);
        
        if (tab.url && tab.url.includes('app.rocketzap.com.br')) {
          // Processar arquivo XLS interceptado
          await processInterceptedXLS(details.url, details.tabId);
        }
        
      } catch (error) {
        console.error('❌ Erro ao interceptar XLS:', error);
      }
    }
  },
  {
    urls: ["*://app.rocketzap.com.br/*"],
    types: ["other", "xmlhttprequest"]
  }
);

// Processar arquivo XLS interceptado
async function processInterceptedXLS(fileUrl, tabId) {
  try {
    console.log('🔄 Processando arquivo XLS interceptado...');
    
    // Baixar arquivo internamente
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    
    // Processar XLS (simulação - precisaria de biblioteca como SheetJS)
    const leads = await parseXLSFile(arrayBuffer);
    
    if (leads && leads.length > 0) {
      console.log(`📊 ${leads.length} leads encontrados no XLS`);
      
      // Filtrar duplicatas
      const newLeads = await filterDuplicateLeads(leads);
      
      if (newLeads.length > 0) {
        console.log(`📱 ${newLeads.length} novos leads únicos`);
        
        // Salvar leads processados
        await saveProcessedLeads(newLeads);
        
        // Enviar para API
        await syncNewLeads(newLeads);
        
        // Notificar popup
        chrome.runtime.sendMessage({
          type: 'XLS_PROCESSED',
          newLeads: newLeads.length,
          totalLeads: leads.length
        });
        
      } else {
        console.log('ℹ️ Nenhum lead novo encontrado no XLS');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar XLS:', error);
  }
}

// Parser básico de XLS (placeholder - implementar com SheetJS)
async function parseXLSFile(arrayBuffer) {
  try {
    // AQUI: Implementar parsing real com SheetJS ou similar
    // Por enquanto, retorna exemplo
    console.log('📋 Parsing XLS file... (implementar SheetJS)');
    
    // Simulação de dados extraídos do XLS
    return [
      { name: 'João Silva', phone: '11999999999' },
      { name: 'Maria Santos', phone: '11888888888' }
    ];
    
  } catch (error) {
    console.error('❌ Erro no parsing XLS:', error);
    return [];
  }
}

// Filtrar leads duplicados
async function filterDuplicateLeads(leads) {
  try {
    const result = await chrome.storage.local.get(['processedLeads']);
    const processedPhones = new Set(result.processedLeads || []);
    
    return leads.filter(lead => {
      const normalizedPhone = normalizePhone(lead.phone);
      return normalizedPhone && !processedPhones.has(normalizedPhone);
    });
    
  } catch (error) {
    console.error('❌ Erro ao filtrar duplicatas:', error);
    return leads;
  }
}

// Normalizar telefone brasileiro
function normalizePhone(phone) {
  if (!phone) return null;
  
  const cleaned = phone.toString().replace(/\D/g, '');
  
  if (cleaned.length === 11 && cleaned.startsWith('9')) {
    return '55' + cleaned;
  } else if (cleaned.length === 10) {
    return '559' + cleaned;
  } else if (cleaned.length === 13 && cleaned.startsWith('55')) {
    return cleaned;
  }
  
  return cleaned.length >= 10 ? cleaned : null;
}

// Salvar leads processados
async function saveProcessedLeads(newLeads) {
  try {
    const result = await chrome.storage.local.get(['processedLeads']);
    const processedLeads = result.processedLeads || [];
    
    const newPhones = newLeads.map(lead => normalizePhone(lead.phone)).filter(Boolean);
    const updatedLeads = [...new Set([...processedLeads, ...newPhones])];
    
    await chrome.storage.local.set({ processedLeads: updatedLeads });
    
  } catch (error) {
    console.error('❌ Erro ao salvar leads:', error);
  }
}

// Sincronizar novos leads
async function syncNewLeads(leads) {
  try {
    for (const lead of leads) {
      await fetch(`${CONFIG.API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizePhone(lead.phone),
          name: lead.name || 'Nome não informado',
          source: 'rocketzap-xls',
          timestamp: Date.now()
        })
      });
    }
    
    console.log('✅ Leads sincronizados com sucesso');
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  }
}

// ===== EXPORTAÇÃO AUTOMÁTICA =====

// Configurar alarme para exportação automática
function setupAutoExportAlarm() {
  chrome.alarms.create('autoExport', {
    delayInMinutes: 60, // 1 hora
    periodInMinutes: 60
  });
  console.log('⏰ Alarme de exportação automática configurado');
}

// Listener para alarmes
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'autoExport') {
    console.log('🔔 Executando exportação automática...');
    await triggerAutoExport();
  }
});

// Executar exportação automática
async function triggerAutoExport() {
  try {
    const result = await chrome.storage.local.get(['settings']);
    const settings = result.settings || {};
    
    if (!settings.autoExport) {
      console.log('⏸️ Exportação automática desabilitada');
      return;
    }
    
    // Buscar aba do RocketZap ou abrir nova
    const tabs = await chrome.tabs.query({
      url: "*://app.rocketzap.com.br/contacts*"
    });
    
    let contactsTab = tabs[0];
    
    if (!contactsTab) {
      // Buscar qualquer aba do RocketZap
      const rocketTabs = await chrome.tabs.query({
        url: "*://app.rocketzap.com.br/*"
      });
      
      if (rocketTabs.length > 0) {
        // Verificar se está logado antes de navegar
        const isLoggedIn = await checkIfLoggedIn(rocketTabs[0].id);
        
        if (!isLoggedIn) {
          console.log('🚫 Usuário não está logado no RocketZap - exportação cancelada');
          
          // Notificar popup se estiver aberto
          chrome.runtime.sendMessage({
            type: 'LOGIN_REQUIRED',
            message: 'Faça login no RocketZap para exportação automática'
          }).catch(() => {}); // Ignorar se popup não estiver aberto
          
          return;
        }
        
        // Navegar para /contacts
        await chrome.tabs.update(rocketTabs[0].id, {
          url: 'https://app.rocketzap.com.br/contacts'
        });
        contactsTab = rocketTabs[0];
        
      } else {
        console.log('ℹ️ Nenhuma aba do RocketZap encontrada para exportação automática');
        
        // Notificar popup
        chrome.runtime.sendMessage({
          type: 'NO_ROCKETZAP_TAB',
          message: 'Abra o RocketZap em uma aba para exportação automática'
        }).catch(() => {});
        
        return;
      }
    } else {
      // Verificar se a aba existente está logada
      const isLoggedIn = await checkIfLoggedIn(contactsTab.id);
      
      if (!isLoggedIn) {
        console.log('🚫 Usuário não está logado na aba /contacts - exportação cancelada');
        return;
      }
    }
    
    // Aguardar página carregar
    setTimeout(async () => {
      try {
        // Verificar novamente se está logado antes de clicar
        const stillLoggedIn = await checkIfLoggedIn(contactsTab.id);
        
        if (!stillLoggedIn) {
          console.log('🚫 Usuário foi deslogado - cancelando exportação');
          return;
        }
        
        // Injetar script para clicar no botão Exportar
        await chrome.scripting.executeScript({
          target: { tabId: contactsTab.id },
          func: clickExportButton
        });
        
        console.log('✅ Exportação automática iniciada');
        
      } catch (error) {
        console.error('❌ Erro na exportação automática:', error);
      }
    }, 3000);
    
  } catch (error) {
    console.error('❌ Erro ao executar exportação automática:', error);
  }
}

// Verificar se usuário está logado no RocketZap
async function checkIfLoggedIn(tabId) {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        // Verificar indicadores de usuário logado
        const loginIndicators = [
          // Botões/menus de usuário
          'button[aria-label*="menu"]',
          'button[aria-label*="perfil"]',
          '[data-testid="user-menu"]',
          '.user-menu',
          '.profile-button',
          
          // Elementos específicos do RocketZap logado
          'button:has(svg[data-testid="ImportExportIcon"])', // Botão exportar
          'nav[role="navigation"]', // Navegação principal
          '.MuiDrawer-root', // Drawer lateral
          
          // URLs que indicam login
          // Se estiver em /login ou /auth, não está logado
        ];
        
        // Verificar se está na página de login
        if (window.location.pathname.includes('/login') || 
            window.location.pathname.includes('/auth') ||
            window.location.pathname.includes('/signin')) {
          return false;
        }
        
        // Verificar se encontra elementos de usuário logado
        for (const selector of loginIndicators) {
          if (document.querySelector(selector)) {
            return true;
          }
        }
        
        // Verificar se existe token de autenticação
        const hasAuthToken = localStorage.getItem('token') || 
                            localStorage.getItem('authToken') ||
                            localStorage.getItem('access_token') ||
                            sessionStorage.getItem('token');
        
        if (hasAuthToken) {
          return true;
        }
        
        // Verificar se há cookies de autenticação
        if (document.cookie.includes('auth') || 
            document.cookie.includes('session') ||
            document.cookie.includes('token')) {
          return true;
        }
        
        // Se chegou até aqui, provavelmente não está logado
        return false;
      }
    });
    
    const isLoggedIn = result[0].result;
    console.log(`🔍 Status de login verificado: ${isLoggedIn ? 'LOGADO' : 'NÃO LOGADO'}`);
    
    return isLoggedIn;
    
  } catch (error) {
    console.error('❌ Erro ao verificar status de login:', error);
    // Em caso de erro, assumir que não está logado por segurança
    return false;
  }
}

// Função injetada para clicar no botão exportar
function clickExportButton() {
  // Buscar botão com texto "Exportar"
  const buttons = document.querySelectorAll('button');
  
  for (const button of buttons) {
    if (button.textContent && button.textContent.toLowerCase().includes('exportar')) {
      console.log('🔽 Clicando no botão Exportar automaticamente...');
      button.click();
      return true;
    }
  }
  
  // Fallback: buscar pelo seletor CSS específico
  const exportButton = document.querySelector('button[class*="MuiButton"][class*="outlined"]:has(svg[data-testid="ImportExportIcon"])');
  if (exportButton) {
    console.log('🔽 Clicando no botão Exportar (seletor específico)...');
    exportButton.click();
    return true;
  }
  
  console.log('❌ Botão Exportar não encontrado');
  return false;
}

// Listener para mensagens do popup
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'getStats') {
    sendResponse(currentStats);
  } else if (request.type === 'FORCE_EXPORT') {
    // Forçar exportação manual
    console.log('🔽 Exportação manual solicitada do popup');
    triggerAutoExport();
    sendResponse({ success: true });
  } else if (request.type === 'SYNC_LEADS') {
    // Sincronizar leads manualmente
    console.log('📤 Sincronização manual solicitada do popup');
    syncLeads();
    sendResponse({ success: true });
  } else if (request.type === 'CREATE_LOGZZ_ORDER') {
    // Criar pedido na Logzz REAL
    try {
      console.log('🛒 Criando pedido Logzz REAL via background:', request.data);
      
      // Importar e usar integração real Logzz
      const { logzzRealIntegration } = await import('./logzz-real-integration.js');
      
      const result = await logzzRealIntegration.createRealOrder(request.data);
      
      sendResponse({ 
        success: true, 
        result: result 
      });
      
    } catch (error) {
      console.error('❌ Erro ao criar pedido Logzz real:', error);
      sendResponse({ 
        success: false, 
        error: error.message 
      });
    }
    
    // Retornar true para indicar resposta assíncrona
    return true;
  }
});

// Criar pedido na Logzz (campo a campo)
async function handleCreateLogzzOrder(orderData, sendResponse) {
  console.log('🚚 Criando pedido na Logzz:', orderData);
  
  try {
    // Salvar dados para uso na página Logzz
    await chrome.storage.local.set({
      pendingLogzzOrder: orderData
    });
    
    // Abrir nova aba com Logzz
    const tab = await chrome.tabs.create({
      url: 'https://entrega.logzz.com.br',
      active: true
    });
    
    // Aguardar tab carregar e injetar script
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === tab.id && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        
        // Enviar dados para script de preenchimento
        setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, {
            type: 'FILL_LOGZZ_FORM',
            data: orderData
          }).catch(console.error);
        }, 2000);
      }
    });
    
    sendResponse({ success: true, message: 'Pedido enviado para Logzz' });
    
  } catch (error) {
    console.error('❌ Erro ao criar pedido Logzz:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Sincronizar leads
async function handleSyncLeads(leads, sendResponse) {
  console.log('🔄 Sincronizando leads:', leads.length);
  
  try {
    // Salvar no storage local
    await chrome.storage.local.set({
      rocketZapLeads: leads,
      lastSync: new Date().toISOString(),
      totalSyncs: stats.successfulSyncs + 1
    });
    
    // Tentar enviar para API local se disponível
    try {
      const response = await fetch(CONFIG.API_BASE_URL + '/api/rocketzap/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leads: leads,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        console.log('✅ Leads sincronizados com API');
      }
    } catch (apiError) {
      console.log('ℹ️ API local não disponível, dados salvos localmente');
    }
    
    stats.successfulSyncs++;
    stats.totalLeads = leads.length;
    stats.lastSync = new Date().toISOString();
    
    sendResponse({ 
      success: true, 
      message: 'Sincronização concluída',
      stats: stats
    });
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    sendResponse({ success: false, error: error.message });
  }
}

console.log('✅ Background worker configurado com interceptação XLS e exportação automática');