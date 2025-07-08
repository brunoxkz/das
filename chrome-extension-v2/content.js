// Content script para integração com WhatsApp Web
console.log('🎯 Vendzz WhatsApp Automation v2.0 - Content Script carregado');

let sidebar = null;
let currentContacts = [];
let selectedFile = null;

// Sistema de automação de mensagens
let automationActive = false;
let automationStats = { sent: 0, failed: 0, total: 0 };
let processedContacts = new Set();

// Configuração da automação
let automationConfig = {
  dateFilter: null, // ISO date string or null for all
  completedMessage: "Olá {nome}! Parabéns por completar nosso quiz! 🎉",
  abandonedMessage: "Olá {nome}! Vimos que você começou nosso quiz mas não terminou. Que tal finalizar? 😊",
  messageDelay: 3000, // 3 seconds between messages
  enableCompleted: true,
  enableAbandoned: true,
  dailyLimit: 100
};

let automationQueue = [];
let currentlyProcessing = false;

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

        <div class="vendzz-section" id="vendzz-automation-section" style="display: none;">
          <h3>🤖 Automação de Mensagens</h3>
          
          <div class="vendzz-automation-config">
            <div class="vendzz-config-group">
              <label class="vendzz-label">📅 Filtro de Data (opcional):</label>
              <input type="date" id="vendzz-date-filter" class="vendzz-input">
              <small class="vendzz-help">Enviar apenas para leads após esta data</small>
            </div>

            <div class="vendzz-config-group">
              <label class="vendzz-checkbox-label">
                <input type="checkbox" id="vendzz-enable-completed" checked>
                <span class="vendzz-checkmark"></span>
                ✅ Mensagem para Quiz Completo
              </label>
              <textarea id="vendzz-completed-message" class="vendzz-textarea" placeholder="Mensagem para quem completou o quiz...">Olá {nome}! Parabéns por completar nosso quiz! 🎉</textarea>
            </div>

            <div class="vendzz-config-group">
              <label class="vendzz-checkbox-label">
                <input type="checkbox" id="vendzz-enable-abandoned" checked>
                <span class="vendzz-checkmark"></span>
                ⚠️ Mensagem para Quiz Abandonado
              </label>
              <textarea id="vendzz-abandoned-message" class="vendzz-textarea" placeholder="Mensagem para quem abandonou o quiz...">Olá {nome}! Vimos que você começou nosso quiz mas não terminou. Que tal finalizar? 😊</textarea>
            </div>

            <div class="vendzz-config-group">
              <label class="vendzz-label">⏱️ Delay entre mensagens (segundos):</label>
              <input type="number" id="vendzz-message-delay" class="vendzz-input" value="3" min="1" max="30">
            </div>

            <div class="vendzz-config-group">
              <label class="vendzz-label">🎯 Limite diário:</label>
              <input type="number" id="vendzz-daily-limit" class="vendzz-input" value="100" min="1" max="1000">
            </div>
          </div>

          <div class="vendzz-automation-controls">
            <button id="vendzz-start-automation" class="vendzz-btn vendzz-btn-primary">
              <span class="vendzz-btn-text">🚀 Iniciar Automação</span>
            </button>
            <button id="vendzz-stop-automation" class="vendzz-btn vendzz-btn-danger" style="display: none;">
              <span class="vendzz-btn-text">⏹️ Pausar Automação</span>
            </button>
          </div>

          <div class="vendzz-automation-stats" id="vendzz-automation-stats" style="display: none;">
            <div class="vendzz-stats-grid">
              <div class="vendzz-stat-item">
                <span class="vendzz-stat-number" id="vendzz-stats-sent">0</span>
                <span class="vendzz-stat-label">Enviadas</span>
              </div>
              <div class="vendzz-stat-item">
                <span class="vendzz-stat-number" id="vendzz-stats-failed">0</span>
                <span class="vendzz-stat-label">Falhas</span>
              </div>
              <div class="vendzz-stat-item">
                <span class="vendzz-stat-number" id="vendzz-stats-total">0</span>
                <span class="vendzz-stat-label">Total</span>
              </div>
            </div>
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

  // Controles de automação
  document.getElementById('vendzz-start-automation').addEventListener('click', startAutomation);
  document.getElementById('vendzz-stop-automation').addEventListener('click', stopAutomation);

  // Atualizar configurações da automação quando mudarem
  document.getElementById('vendzz-date-filter').addEventListener('change', updateAutomationConfig);
  document.getElementById('vendzz-enable-completed').addEventListener('change', updateAutomationConfig);
  document.getElementById('vendzz-enable-abandoned').addEventListener('change', updateAutomationConfig);
  document.getElementById('vendzz-completed-message').addEventListener('input', updateAutomationConfig);
  document.getElementById('vendzz-abandoned-message').addEventListener('input', updateAutomationConfig);
  document.getElementById('vendzz-message-delay').addEventListener('change', updateAutomationConfig);
  document.getElementById('vendzz-daily-limit').addEventListener('change', updateAutomationConfig);
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
    
    // Parse contacts se vier como string JSON
    let contacts = response.contacts || [];
    if (typeof contacts === 'string') {
      try {
        contacts = JSON.parse(contacts);
      } catch (e) {
        console.log('❌ Erro ao parsear contatos:', e);
        contacts = [];
      }
    }
    
    currentContacts = Array.isArray(contacts) ? contacts : [];
    selectedFile = fileId;
    
    updateContactsList();
    document.getElementById('vendzz-contacts-section').style.display = 'block';
    
    // Mostrar seção de automação
    showAutomationSection();
    
    const fileName = document.getElementById('vendzz-file-select').selectedOptions[0].textContent;
    updateFileStatus(fileName);
    
    addLog(`📱 ${currentContacts.length} contatos carregados`);
    
    // Mostrar estatísticas por status
    if (currentContacts.length > 0) {
      const completed = currentContacts.filter(c => c.isComplete).length;
      const abandoned = currentContacts.length - completed;
      addLog(`📊 Status: ${completed} completos, ${abandoned} abandonados`);
    }
    
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
    <div class="vendzz-contact-item" data-phone="${contact.phone}">
      <div class="vendzz-contact-header">
        <div class="vendzz-contact-phone">${contact.phone}</div>
        <div class="vendzz-contact-status ${contact.isComplete ? 'completed' : 'abandoned'}">
          ${contact.isComplete ? '✅ Quiz Completo' : '⏳ Quiz Abandonado'}
        </div>
      </div>
      <div class="vendzz-contact-details">
        ${contact.nome ? `<div><strong>Nome:</strong> ${contact.nome}</div>` : ''}
        ${contact.email ? `<div><strong>Email:</strong> ${contact.email}</div>` : ''}
        ${contact.idade ? `<div><strong>Idade:</strong> ${contact.idade}</div>` : ''}
        ${contact.altura ? `<div><strong>Altura:</strong> ${contact.altura}</div>` : ''}
        ${contact.peso ? `<div><strong>Peso:</strong> ${contact.peso}</div>` : ''}
        <div><strong>Data:</strong> ${new Date(contact.submittedAt).toLocaleString('pt-BR')}</div>
        <div><strong>Conclusão:</strong> ${contact.completionPercentage}%</div>
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

// ==================== SISTEMA DE AUTOMAÇÃO DE MENSAGENS ====================

// Atualizar configuração da automação
function updateAutomationConfig() {
  automationConfig.dateFilter = document.getElementById('vendzz-date-filter').value || null;
  automationConfig.enableCompleted = document.getElementById('vendzz-enable-completed').checked;
  automationConfig.enableAbandoned = document.getElementById('vendzz-enable-abandoned').checked;
  automationConfig.completedMessage = document.getElementById('vendzz-completed-message').value;
  automationConfig.abandonedMessage = document.getElementById('vendzz-abandoned-message').value;
  automationConfig.messageDelay = parseInt(document.getElementById('vendzz-message-delay').value) * 1000; // Convert to ms
  automationConfig.dailyLimit = parseInt(document.getElementById('vendzz-daily-limit').value);
  
  console.log('🔧 Configuração da automação atualizada:', automationConfig);
}

// Preparar fila de automação
function prepareAutomationQueue() {
  automationQueue = [];
  automationStats = { sent: 0, failed: 0, total: 0 };
  
  if (!currentContacts || currentContacts.length === 0) {
    addLog('⚠️ Nenhum contato carregado');
    return false;
  }
  
  currentContacts.forEach(contact => {
    // Filtro por data
    if (automationConfig.dateFilter) {
      const contactDate = new Date(contact.submittedAt);
      const filterDate = new Date(automationConfig.dateFilter);
      if (contactDate < filterDate) {
        return; // Skip this contact
      }
    }
    
    // Filtro por status e mensagem correspondente
    let message = null;
    if (contact.status === 'completed' && automationConfig.enableCompleted) {
      message = automationConfig.completedMessage;
    } else if (contact.status === 'abandoned' && automationConfig.enableAbandoned) {
      message = automationConfig.abandonedMessage;
    }
    
    if (message) {
      // Personalizar mensagem com variáveis do contato
      const personalizedMessage = message
        .replace(/{nome}/g, contact.nome || 'Cliente')
        .replace(/{email}/g, contact.email || '')
        .replace(/{idade}/g, contact.idade || '')
        .replace(/{altura}/g, contact.altura || '')
        .replace(/{peso}/g, contact.peso || '');
      
      automationQueue.push({
        phone: contact.phone,
        message: personalizedMessage,
        contact: contact
      });
    }
  });
  
  // Aplicar limite diário
  if (automationQueue.length > automationConfig.dailyLimit) {
    automationQueue = automationQueue.slice(0, automationConfig.dailyLimit);
    addLog(`⚠️ Limitado a ${automationConfig.dailyLimit} mensagens por dia`);
  }
  
  automationStats.total = automationQueue.length;
  updateAutomationStats();
  
  addLog(`📋 Fila preparada: ${automationQueue.length} mensagens`);
  return automationQueue.length > 0;
}

// Iniciar automação
async function startAutomation() {
  if (automationActive) {
    addLog('⚠️ Automação já está ativa');
    return;
  }
  
  // Atualizar configuração
  updateAutomationConfig();
  
  // Preparar fila
  if (!prepareAutomationQueue()) {
    addLog('❌ Não há mensagens para enviar');
    return;
  }
  
  automationActive = true;
  currentlyProcessing = false;
  
  // Atualizar interface
  document.getElementById('vendzz-start-automation').style.display = 'none';
  document.getElementById('vendzz-stop-automation').style.display = 'block';
  document.getElementById('vendzz-automation-stats').style.display = 'block';
  
  addLog(`🚀 Automação iniciada: ${automationQueue.length} mensagens`);
  
  // Iniciar processamento
  processAutomationQueue();
}

// Parar automação
function stopAutomation() {
  if (!automationActive) {
    return;
  }
  
  automationActive = false;
  currentlyProcessing = false;
  
  // Atualizar interface
  document.getElementById('vendzz-start-automation').style.display = 'block';
  document.getElementById('vendzz-stop-automation').style.display = 'none';
  
  addLog('⏹️ Automação pausada');
}

// Processar fila de automação
async function processAutomationQueue() {
  if (!automationActive || currentlyProcessing) {
    return;
  }
  
  currentlyProcessing = true;
  
  while (automationActive && automationQueue.length > 0) {
    const item = automationQueue.shift();
    
    try {
      addLog(`📤 Enviando para ${item.phone}...`);
      
      // Enviar mensagem
      const success = await sendWhatsAppMessage(item.phone, item.message);
      
      if (success) {
        automationStats.sent++;
        addLog(`✅ Enviado para ${item.phone}`);
      } else {
        automationStats.failed++;
        addLog(`❌ Falha ao enviar para ${item.phone}`);
      }
      
      updateAutomationStats();
      
      // Aguardar delay antes da próxima mensagem
      if (automationQueue.length > 0 && automationActive) {
        addLog(`⏱️ Aguardando ${automationConfig.messageDelay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, automationConfig.messageDelay));
      }
      
    } catch (error) {
      automationStats.failed++;
      addLog(`❌ Erro ao enviar para ${item.phone}: ${error.message}`);
      updateAutomationStats();
    }
  }
  
  currentlyProcessing = false;
  
  if (automationActive && automationQueue.length === 0) {
    stopAutomation();
    addLog(`🎉 Automação concluída: ${automationStats.sent} enviadas, ${automationStats.failed} falhas`);
  }
}

// Enviar mensagem pelo WhatsApp
async function sendWhatsAppMessage(phone, message) {
  try {
    // Buscar ou abrir conversa
    const searchResult = await searchContact(phone);
    if (!searchResult) {
      throw new Error('Não foi possível encontrar o contato');
    }
    
    // Aguardar a conversa carregar
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Encontrar campo de mensagem
    const messageInput = await waitForElement([
      '[contenteditable="true"][data-tab="10"]',
      '[contenteditable="true"][data-tab="1"]',
      'div[contenteditable="true"]'
    ].find(selector => document.querySelector(selector)));
    
    if (!messageInput) {
      throw new Error('Campo de mensagem não encontrado');
    }
    
    // Inserir mensagem
    messageInput.focus();
    messageInput.click();
    
    // Limpar campo
    messageInput.innerHTML = '';
    messageInput.innerText = '';
    
    // Inserir texto
    messageInput.innerText = message;
    
    // Simular evento de input
    const inputEvent = new Event('input', { bubbles: true });
    messageInput.dispatchEvent(inputEvent);
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Encontrar e clicar no botão de enviar
    const sendButton = await waitForElement([
      '[data-testid="send"]',
      '[aria-label="Send"]',
      'button[aria-label="Enviar"]',
      'span[data-testid="send"]'
    ].find(selector => document.querySelector(selector)));
    
    if (!sendButton) {
      throw new Error('Botão de enviar não encontrado');
    }
    
    sendButton.click();
    
    // Aguardar confirmação de envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
    
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return false;
  }
}

// Buscar contato no WhatsApp
async function searchContact(phone) {
  try {
    // Limpar formatação do telefone
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Tentar diferentes formatos
    const phoneFormats = [
      cleanPhone,
      `+55${cleanPhone}`,
      `55${cleanPhone}`
    ];
    
    for (const phoneFormat of phoneFormats) {
      // Abrir URL do WhatsApp
      const whatsappUrl = `https://web.whatsapp.com/send?phone=${phoneFormat}`;
      window.open(whatsappUrl, '_self');
      
      // Aguardar carregamento
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verificar se a conversa foi aberta
      const conversationHeader = document.querySelector('[data-testid="conversation-header"]');
      if (conversationHeader) {
        return true;
      }
    }
    
    return false;
    
  } catch (error) {
    console.error('Erro ao buscar contato:', error);
    return false;
  }
}

// Atualizar estatísticas da automação
function updateAutomationStats() {
  document.getElementById('vendzz-stats-sent').textContent = automationStats.sent;
  document.getElementById('vendzz-stats-failed').textContent = automationStats.failed;
  document.getElementById('vendzz-stats-total').textContent = automationStats.total;
}

// Mostrar seção de automação quando arquivo for selecionado
function showAutomationSection() {
  const automationSection = document.getElementById('vendzz-automation-section');
  if (automationSection) {
    automationSection.style.display = 'block';
  }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}