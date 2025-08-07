
// Vendzz WhatsApp Extension - Popup Script
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🎨 Popup Vendzz carregado');
  
  // Elementos DOM
  const elements = {
    loading: document.getElementById('loading'),
    mainContent: document.getElementById('main-content'),
    connectionIndicator: document.getElementById('connection-indicator'),
    connectionStatus: document.getElementById('connection-status'),
    phoneNumber: document.getElementById('phone-number'),
    lastActivity: document.getElementById('last-activity'),
    messagesSent: document.getElementById('messages-sent'),
    queueLength: document.getElementById('queue-length'),
    openWhatsApp: document.getElementById('open-whatsapp'),
    openVendzz: document.getElementById('open-vendzz')
  };

  // Event listeners
  elements.openWhatsApp.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://web.whatsapp.com' });
    window.close();
  });

  elements.openVendzz.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://vendzz.com.br/whatsapp-remarketing' });
    window.close();
  });

  // Carregar status
  await loadStatus();

  // Atualizar status a cada 5 segundos
  setInterval(loadStatus, 5000);

  async function loadStatus() {
    try {
      // Buscar status da extensão
      const status = await getExtensionStatus();
      
      // Atualizar UI
      updateUI(status);
      
      // Mostrar conteúdo principal
      elements.loading.style.display = 'none';
      elements.mainContent.style.display = 'block';
      
    } catch (error) {
      console.error('❌ Erro ao carregar status:', error);
      showError('Erro ao conectar com WhatsApp');
    }
  }

  function getExtensionStatus() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_EXTENSION_STATUS' }, (response) => {
        if (chrome.runtime.lastError) {
          resolve({
            isConnected: false,
            isOnline: false,
            phoneNumber: 'Não conectado',
            lastActivity: 'Nunca',
            messagesProcessed: 0,
            queueLength: 0
          });
        } else {
          resolve(response || {});
        }
      });
    });
  }

  function updateUI(status) {
    // Status de conexão
    if (status.isConnected) {
      elements.connectionIndicator.className = 'status-indicator status-connected';
      elements.connectionStatus.textContent = 'Conectado';
    } else {
      elements.connectionIndicator.className = 'status-indicator status-disconnected';
      elements.connectionStatus.textContent = 'Desconectado';
    }

    // Informações da conta
    elements.phoneNumber.textContent = status.phoneNumber || 'Não identificado';
    elements.lastActivity.textContent = status.lastActivity || 'Nunca';
    
    // Estatísticas
    elements.messagesSent.textContent = status.messagesProcessed || 0;
    elements.queueLength.textContent = status.queueLength || 0;
  }

  function showError(message) {
    elements.loading.innerHTML = `
      <div style="color: #ef4444; text-align: center;">
        ❌ ${message}
      </div>
    `;
  }
});
