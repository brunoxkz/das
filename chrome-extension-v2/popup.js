// Popup script para Vendzz WhatsApp Automation v2.0
console.log('🎯 Popup Vendzz WhatsApp Automation v2.0 carregado');

// Elementos DOM
const connectionStatus = document.getElementById('connection-status');
const whatsappStatus = document.getElementById('whatsapp-status');
const filesStatus = document.getElementById('files-status');
const openWhatsappBtn = document.getElementById('open-whatsapp');
const refreshDataBtn = document.getElementById('refresh-data');

// Atualizar status de conexão
function updateConnectionStatus(text, className) {
  connectionStatus.textContent = text;
  connectionStatus.className = `status-value ${className}`;
}

// Atualizar status do WhatsApp
function updateWhatsAppStatus(text, className) {
  whatsappStatus.textContent = text;
  whatsappStatus.className = `status-value ${className}`;
}

// Atualizar status dos arquivos
function updateFilesStatus(text) {
  filesStatus.textContent = text;
}

// Verificar status geral
async function checkStatus() {
  try {
    // Verificar configuração
    const config = await chrome.runtime.sendMessage({ action: 'get_config' });
    
    if (!config.accessToken) {
      updateConnectionStatus('Não configurado', 'status-error');
      updateWhatsAppStatus('-', '');
      updateFilesStatus('-');
      return;
    }

    // Testar conexão
    const connectionTest = await chrome.runtime.sendMessage({ action: 'test_connection' });
    
    if (connectionTest.success) {
      updateConnectionStatus('✅ Conectado', 'status-connected');
      
      // Verificar arquivos
      const filesResponse = await chrome.runtime.sendMessage({ action: 'fetch_files' });
      
      if (filesResponse.error) {
        updateFilesStatus('Erro ao carregar');
      } else {
        updateFilesStatus(`${filesResponse.files.length} arquivos`);
      }
      
    } else {
      updateConnectionStatus('❌ Erro', 'status-error');
      updateFilesStatus('-');
    }

    // Verificar se WhatsApp está aberto
    const tabs = await chrome.tabs.query({ url: "https://web.whatsapp.com/*" });
    
    if (tabs.length > 0) {
      updateWhatsAppStatus('✅ Aberto', 'status-connected');
    } else {
      updateWhatsAppStatus('❌ Fechado', 'status-error');
    }
    
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    updateConnectionStatus('❌ Erro', 'status-error');
    updateWhatsAppStatus('-', '');
    updateFilesStatus('-');
  }
}

// Abrir WhatsApp Web
async function openWhatsApp() {
  try {
    // Verificar se já existe uma aba do WhatsApp
    const tabs = await chrome.tabs.query({ url: "https://web.whatsapp.com/*" });
    
    if (tabs.length > 0) {
      // Se existe, focar na primeira aba
      await chrome.tabs.update(tabs[0].id, { active: true });
      await chrome.windows.update(tabs[0].windowId, { focused: true });
    } else {
      // Se não existe, criar nova aba
      await chrome.tabs.create({ url: "https://web.whatsapp.com" });
    }
    
    // Fechar popup
    window.close();
    
  } catch (error) {
    console.error('Erro ao abrir WhatsApp:', error);
  }
}

// Atualizar dados
async function refreshData() {
  refreshDataBtn.textContent = 'Atualizando...';
  refreshDataBtn.disabled = true;
  
  try {
    await checkStatus();
    
    // Notificar content script para atualizar
    const tabs = await chrome.tabs.query({ url: "https://web.whatsapp.com/*" });
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, { 
          action: 'refresh_data',
          timestamp: Date.now()
        });
      } catch (error) {
        // Ignorar erros se a aba não estiver responsiva
      }
    }
    
  } catch (error) {
    console.error('Erro ao atualizar dados:', error);
  } finally {
    refreshDataBtn.textContent = 'Atualizar Dados';
    refreshDataBtn.disabled = false;
  }
}

// Event listeners
openWhatsappBtn.addEventListener('click', openWhatsApp);
refreshDataBtn.addEventListener('click', refreshData);

// Verificar status ao carregar
document.addEventListener('DOMContentLoaded', () => {
  checkStatus();
  
  // Atualizar status a cada 5 segundos
  setInterval(checkStatus, 5000);
});

// Verificar status imediatamente se já carregado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkStatus);
} else {
  checkStatus();
}