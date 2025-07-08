// Content script para integração com WhatsApp Web
console.log('🎯 Vendzz WhatsApp Automation v2.0 - Content Script carregado');

let sidebar = null;
let currentContacts = [];
let selectedFile = null;

// Aguardar elemento
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    function check() {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Elemento ${selector} não encontrado em ${timeout}ms`));
      } else {
        setTimeout(check, 100);
      }
    }
    
    check();
  });
}

// Verificar se WhatsApp está carregado
function isWhatsAppLoaded() {
  const selectors = [
    '[data-testid="chat-list"]',
    '[data-testid="chatlist-header"]',
    '._ak8q',
    '#side .copyable-text'
  ];
  
  return selectors.some(selector => document.querySelector(selector));
}

// Aguardar carregamento do WhatsApp
async function waitForWhatsAppLoad() {
  let attempts = 0;
  const maxAttempts = 60; // 60 segundos
  
  while (attempts < maxAttempts) {
    if (isWhatsAppLoaded()) {
      console.log('✅ WhatsApp Web carregado');
      return true;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  
  throw new Error('WhatsApp Web não carregou em 60 segundos');
}

// Criar sidebar
function createSidebar() {
  if (sidebar) {
    return sidebar;
  }

  const sidebarHtml = `
    <div id="vendzz-sidebar" class="vendzz-sidebar">
      <div class="vendzz-header">
        <div class="vendzz-logo">
          <span class="vendzz-icon">🤖</span>
          <span class="vendzz-title">Vendzz Automation</span>
        </div>
        <button id="vendzz-minimize" class="vendzz-btn-icon">−</button>
      </div>
      
      <div class="vendzz-content">
        <div class="vendzz-section">
          <h3>🔐 Configuração</h3>
          <div class="vendzz-config">
            <input type="text" id="vendzz-server" placeholder="https://workspace--brunotamaso.replit.app" class="vendzz-input">
            <input type="password" id="vendzz-token" placeholder="Token de acesso" class="vendzz-input">
            <button id="vendzz-connect" class="vendzz-btn">Conectar</button>
          </div>
        </div>

        <div class="vendzz-section" id="vendzz-files-section" style="display: none;">
          <h3>📁 Arquivos de Automação</h3>
          <div class="vendzz-file-selector">
            <select id="vendzz-file-select" class="vendzz-select">
              <option value="">Selecione um arquivo</option>
            </select>
            <button id="vendzz-refresh-files" class="vendzz-btn-small">🔄</button>
          </div>
        </div>

        <div class="vendzz-section" id="vendzz-contacts-section" style="display: none;">
          <h3>📱 Contatos (<span id="vendzz-contact-count">0</span>)</h3>
          <div class="vendzz-contact-list" id="vendzz-contact-list">
            <!-- Contatos aparecerão aqui -->
          </div>
        </div>

        <div class="vendzz-section">
          <h3>📊 Status</h3>
          <div class="vendzz-status" id="vendzz-status">
            <div class="vendzz-status-item">
              <span class="vendzz-status-label">Conexão:</span>
              <span class="vendzz-status-value" id="vendzz-connection-status">Desconectado</span>
            </div>
            <div class="vendzz-status-item">
              <span class="vendzz-status-label">Arquivo:</span>
              <span class="vendzz-status-value" id="vendzz-file-status">Nenhum</span>
            </div>
          </div>
        </div>

        <div class="vendzz-section">
          <h3>📝 Log</h3>
          <div class="vendzz-log" id="vendzz-log">
            <div class="vendzz-log-item">🚀 Extensão carregada</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Inserir sidebar no DOM
  document.body.insertAdjacentHTML('beforeend', sidebarHtml);
  sidebar = document.getElementById('vendzz-sidebar');

  // Configurar event listeners
  setupEventListeners();
  
  // Carregar configuração
  loadConfig();

  return sidebar;
}

// Configurar event listeners
function setupEventListeners() {
  // Minimizar/Expandir
  document.getElementById('vendzz-minimize').addEventListener('click', () => {
    sidebar.classList.toggle('minimized');
  });

  // Conectar
  document.getElementById('vendzz-connect').addEventListener('click', connectToServer);

  // Seletor de arquivo
  document.getElementById('vendzz-file-select').addEventListener('change', loadSelectedFile);

  // Refresh arquivos
  document.getElementById('vendzz-refresh-files').addEventListener('click', loadFiles);
}

// Carregar configuração
async function loadConfig() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'get_config' });
    
    if (response.serverUrl) {
      document.getElementById('vendzz-server').value = response.serverUrl;
    }
    
    if (response.accessToken) {
      document.getElementById('vendzz-token').value = response.accessToken;
      await connectToServer();
    }
    
  } catch (error) {
    addLog('❌ Erro ao carregar configuração');
  }
}

// Conectar ao servidor
async function connectToServer() {
  const serverUrl = document.getElementById('vendzz-server').value;
  const accessToken = document.getElementById('vendzz-token').value;

  if (!serverUrl || !accessToken) {
    addLog('⚠️ Preencha servidor e token');
    return;
  }

  addLog('🔄 Testando conexão...');

  try {
    // Salvar configuração
    await chrome.runtime.sendMessage({
      action: 'save_config',
      config: { serverUrl, accessToken }
    });

    // Testar conexão
    const response = await chrome.runtime.sendMessage({ action: 'test_connection' });
    
    if (response.success) {
      updateConnectionStatus('✅ Conectado', 'connected');
      addLog(`✅ Conectado como ${response.user.email}`);
      
      // Mostrar seções de arquivos
      document.getElementById('vendzz-files-section').style.display = 'block';
      
      // Carregar arquivos
      await loadFiles();
      
      // Iniciar monitoramento
      await chrome.runtime.sendMessage({ action: 'start_monitoring' });
      
    } else {
      updateConnectionStatus('❌ Erro', 'error');
      addLog(`❌ Erro: ${response.error}`);
    }
    
  } catch (error) {
    updateConnectionStatus('❌ Erro', 'error');
    addLog(`❌ Erro de conexão: ${error.message}`);
  }
}

// Carregar arquivos
async function loadFiles() {
  try {
    addLog('🔄 Carregando arquivos...');
    
    const response = await chrome.runtime.sendMessage({ action: 'fetch_files' });
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    const fileSelect = document.getElementById('vendzz-file-select');
    fileSelect.innerHTML = '<option value="">Selecione um arquivo</option>';
    
    response.files.forEach(file => {
      const option = document.createElement('option');
      option.value = file.id;
      option.textContent = `${file.quiz_title} (${file.total_phones} contatos)`;
      fileSelect.appendChild(option);
    });
    
    addLog(`📁 ${response.files.length} arquivos carregados`);
    
  } catch (error) {
    addLog(`❌ Erro ao carregar arquivos: ${error.message}`);
  }
}

// Carregar arquivo selecionado
async function loadSelectedFile() {
  const fileId = document.getElementById('vendzz-file-select').value;
  
  if (!fileId) {
    currentContacts = [];
    updateContactsList();
    document.getElementById('vendzz-contacts-section').style.display = 'none';
    updateFileStatus('Nenhum');
    return;
  }

  try {
    addLog(`🔄 Carregando contatos do arquivo...`);
    
    const response = await chrome.runtime.sendMessage({ 
      action: 'fetch_contacts',
      fileId: fileId
    });
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    currentContacts = response.contacts;
    selectedFile = fileId;
    
    updateContactsList();
    document.getElementById('vendzz-contacts-section').style.display = 'block';
    
    const fileName = document.getElementById('vendzz-file-select').selectedOptions[0].textContent;
    updateFileStatus(fileName);
    
    addLog(`📱 ${currentContacts.length} contatos carregados`);
    
  } catch (error) {
    addLog(`❌ Erro ao carregar contatos: ${error.message}`);
  }
}

// Atualizar lista de contatos
function updateContactsList() {
  const contactList = document.getElementById('vendzz-contact-list');
  const contactCount = document.getElementById('vendzz-contact-count');
  
  contactCount.textContent = currentContacts.length;
  
  if (currentContacts.length === 0) {
    contactList.innerHTML = '<div class="vendzz-contact-item">Nenhum contato</div>';
    return;
  }
  
  contactList.innerHTML = currentContacts.map(contact => `
    <div class="vendzz-contact-item">
      <div class="vendzz-contact-phone">${contact.phone}</div>
      <div class="vendzz-contact-status ${contact.isComplete ? 'completed' : 'abandoned'}">
        ${contact.isComplete ? '✅' : '⏳'} ${contact.isComplete ? 'Completo' : 'Abandonado'}
      </div>
    </div>
  `).join('');
}

// Atualizar status de conexão
function updateConnectionStatus(text, className) {
  const statusElement = document.getElementById('vendzz-connection-status');
  statusElement.textContent = text;
  statusElement.className = `vendzz-status-value ${className}`;
}

// Atualizar status do arquivo
function updateFileStatus(text) {
  document.getElementById('vendzz-file-status').textContent = text;
}

// Adicionar log
function addLog(message) {
  const logContainer = document.getElementById('vendzz-log');
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  
  const logItem = document.createElement('div');
  logItem.className = 'vendzz-log-item';
  logItem.textContent = `${timestamp} - ${message}`;
  
  logContainer.insertBefore(logItem, logContainer.firstChild);
  
  // Manter apenas os últimos 10 logs
  while (logContainer.children.length > 10) {
    logContainer.removeChild(logContainer.lastChild);
  }
  
  console.log(`📝 Vendzz Log: ${message}`);
}

// Listener para mensagens do background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'refresh_data') {
    // Recarregar dados se necessário
    if (selectedFile) {
      loadSelectedFile();
    }
  }
});

// Ajustar layout do WhatsApp para acomodar sidebar
function adjustWhatsAppLayout() {
  const style = document.createElement('style');
  style.textContent = `
    #main {
      margin-right: 300px !important;
    }
    
    @media (max-width: 1200px) {
      #main {
        margin-right: 0 !important;
      }
      .vendzz-sidebar {
        width: 280px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Inicialização
async function init() {
  try {
    console.log('🔄 Inicializando Vendzz WhatsApp Automation...');
    
    await waitForWhatsAppLoad();
    
    // Aguardar um pouco mais para garantir que tudo carregou
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    createSidebar();
    adjustWhatsAppLayout();
    
    console.log('✅ Vendzz WhatsApp Automation inicializado com sucesso');
    
  } catch (error) {
    console.error('❌ Erro na inicialização:', error);
  }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}