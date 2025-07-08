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
  console.log(`📤 Iniciando envio para ${phone}...`);
  
  try {
    // Validar telefone antes de tentar enviar
    const validPhone = validateAndFormatPhone(phone);
    if (!validPhone) {
      throw new Error(`Telefone inválido: ${phone}`);
    }
    
    console.log(`📱 Buscando conversa para ${phone}...`);
    
    // Buscar ou abrir conversa sem recarregar página
    const searchResult = await searchContact(phone);
    if (!searchResult) {
      throw new Error('Não foi possível abrir a conversa no WhatsApp');
    }
    
    console.log(`✅ Conversa aberta para ${phone}`);
    
    // Aguardar a conversa carregar completamente com delay maior
    console.log('⏱️ Aguardando conversa carregar...');
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Aguardar campo de mensagem com timeout robusto
    const messageInput = await waitForMessageInput(8000);
    if (!messageInput) {
      throw new Error('Campo de mensagem não encontrado após 8 segundos');
    }
    
    console.log(`💬 Inserindo mensagem: "${message.substring(0, 50)}..."`);
    
    // Focar no campo com múltiplas tentativas
    for (let i = 0; i < 3; i++) {
      messageInput.focus();
      messageInput.click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (document.activeElement === messageInput) {
        console.log(`✅ Campo focado na tentativa ${i + 1}`);
        break;
      }
    }
    
    // Limpar campo completamente
    messageInput.innerHTML = '';
    messageInput.innerText = '';
    messageInput.textContent = '';
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Inserir mensagem de forma mais robusta
    messageInput.innerText = message;
    
    // Disparar eventos necessários com delay
    const events = ['input', 'keyup', 'change', 'blur', 'focus'];
    for (const eventType of events) {
      const event = new Event(eventType, { bubbles: true });
      messageInput.dispatchEvent(event);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('⏱️ Aguardando WhatsApp processar mensagem...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Aguardar botão de enviar ficar ativo
    const sendButton = await waitForSendButton(5000);
    if (!sendButton) {
      throw new Error('Botão de enviar não encontrado após 5 segundos');
    }
    
    console.log(`🚀 Enviando mensagem...`);
    
    // Clicar no botão de enviar com delay
    sendButton.click();
    
    // Aguardar confirmação de envio com delay maior
    console.log('⏱️ Aguardando confirmação de envio...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar se a mensagem foi enviada
    const messageSent = await verifyMessageSent();
    
    if (messageSent) {
      console.log(`✅ Mensagem enviada com sucesso para ${phone}`);
      return true;
    } else {
      console.log(`⚠️ Mensagem enviada mas confirmação não detectada para ${phone}`);
      return true; // Assumir sucesso se não houver erro explícito
    }
    
  } catch (error) {
    console.error(`❌ Erro ao enviar mensagem para ${phone}:`, error);
    return false;
  }
}

// Aguardar botão de enviar ficar disponível
async function waitForSendButton(timeout = 5000) {
  const sendSelectors = [
    '[data-testid="send"]',
    'button[aria-label*="Send"]',
    'button[aria-label*="Enviar"]',
    'span[data-testid="send"]',
    'button[data-tab="11"]',
    '[data-icon="send"]',
    'span[data-icon="send"]'
  ];
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    for (const selector of sendSelectors) {
      const button = document.querySelector(selector);
      if (button && !button.disabled && button.offsetParent !== null) {
        console.log(`✅ Botão de enviar encontrado e ativo: ${selector}`);
        return button;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`❌ Botão de enviar não encontrado após ${timeout}ms`);
  return null;
}

// Verificar se mensagem foi enviada
async function verifyMessageSent(timeout = 3000) {
  const sentIndicators = [
    '[data-testid="msg-check"]',
    '[data-icon="msg-check"]',
    '[data-icon="msg-dblcheck"]',
    '.message-out',
    '[data-testid="tail-out"]',
    '.msg-check'
  ];
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    for (const indicator of sentIndicators) {
      const elements = document.querySelectorAll(indicator);
      if (elements.length > 0) {
        // Verificar se há novos elementos de confirmação
        for (const element of elements) {
          const timestamp = element.closest('[data-testid*="msg"]')?.getAttribute('data-id');
          if (timestamp) {
            console.log(`✅ Confirmação de envio detectada: ${indicator}`);
            return true;
          }
        }
      }
    }
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return false;
}

// Validar e formatar telefone para WhatsApp
function validateAndFormatPhone(phone) {
  if (!phone) return null;
  
  // Limpar telefone (manter apenas números)
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Validações básicas
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    console.log(`❌ Telefone inválido (tamanho): ${phone} → ${cleanPhone}`);
    return null;
  }
  
  // Formatos brasileiros esperados
  let formattedPhone = cleanPhone;
  
  // Se tem 11 dígitos (celular brasileiro): 11987654321
  if (cleanPhone.length === 11 && cleanPhone.startsWith('11')) {
    formattedPhone = `55${cleanPhone}`; // +5511987654321
  }
  // Se tem 10 dígitos (fixo brasileiro): 1134567890
  else if (cleanPhone.length === 10 && cleanPhone.startsWith('11')) {
    formattedPhone = `55${cleanPhone}`; // +551134567890
  }
  // Se já tem código do país 55
  else if (cleanPhone.length === 13 && cleanPhone.startsWith('55')) {
    formattedPhone = cleanPhone; // Manter como está
  }
  // Se tem 12 dígitos e não tem código do país
  else if (cleanPhone.length === 12) {
    formattedPhone = `55${cleanPhone.substring(2)}`; // Remover possível código duplicado
  }
  // Outros casos - tentar com +55
  else {
    formattedPhone = `55${cleanPhone}`;
  }
  
  console.log(`📞 Telefone formatado: ${phone} → +${formattedPhone}`);
  return formattedPhone;
}

// Buscar contato no WhatsApp sem recarregar a página
async function searchContact(phone) {
  try {
    // Validar e formatar telefone
    const formattedPhone = validateAndFormatPhone(phone);
    if (!formattedPhone) {
      throw new Error('Telefone inválido ou formato não suportado');
    }
    
    console.log(`📱 Buscando conversa para ${phone} (formatado: +${formattedPhone})`);
    
    // Primeiro, tentar buscar na lista de conversas existentes
    const searchResult = await searchInExistingChats(phone, formattedPhone);
    if (searchResult) {
      console.log(`✅ Conversa encontrada na lista existente para ${phone}`);
      return true;
    }
    
    // Se não encontrou, usar a funcionalidade de busca do WhatsApp
    const newChatResult = await openNewChat(formattedPhone);
    if (newChatResult) {
      console.log(`✅ Nova conversa aberta para ${phone}`);
      return true;
    }
    
    console.log(`❌ Não foi possível abrir conversa para ${phone}`);
    return false;
    
  } catch (error) {
    console.error('❌ Erro ao buscar contato:', error);
    return false;
  }
}

// Buscar contato nas conversas existentes
async function searchInExistingChats(originalPhone, formattedPhone) {
  try {
    console.log(`🔍 Buscando ${originalPhone} nas conversas existentes...`);
    
    // Possíveis formatos do telefone para busca
    const searchFormats = [
      originalPhone,                    // 11995133932
      formattedPhone,                   // 5511995133932  
      `+${formattedPhone}`,            // +5511995133932
      formattedPhone.substring(2),     // 11995133932 (sem código país)
      `+55 ${originalPhone.substring(0,2)} ${originalPhone.substring(2)}`, // +55 11 995133932
    ];
    
    // Buscar elementos de conversa
    const chatSelectors = [
      '[data-testid="cell-frame-container"]',
      '[data-testid="chat-list"] > div',
      '.lexical-rich-text-input',
      'div[role="listitem"]',
      '[aria-label*="Lista de conversas"]'
    ];
    
    let chatElements = [];
    for (const selector of chatSelectors) {
      chatElements = document.querySelectorAll(selector);
      if (chatElements.length > 0) break;
    }
    
    // Procurar por telefone nas conversas
    for (const chatElement of chatElements) {
      const chatText = chatElement.textContent || '';
      
      for (const format of searchFormats) {
        if (chatText.includes(format)) {
          console.log(`✅ Encontrado ${format} na conversa existente`);
          chatElement.click();
          
          // Aguardar a conversa carregar
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Verificar se abriu corretamente
          const messageInput = await waitForMessageInput();
          if (messageInput) {
            return true;
          }
        }
      }
    }
    
    return false;
    
  } catch (error) {
    console.error('❌ Erro ao buscar nas conversas existentes:', error);
    return false;
  }
}

// Abrir nova conversa usando a funcionalidade do WhatsApp
async function openNewChat(formattedPhone) {
  try {
    console.log(`📱 Abrindo nova conversa para +${formattedPhone}...`);
    
    // Tentar encontrar botão de nova conversa
    const newChatSelectors = [
      '[data-testid="new-chat-plus"]',
      '[title*="Nova conversa"]',
      '[aria-label*="Nova conversa"]',
      'div[role="button"][title*="Nova"]',
      '[data-icon="new-chat-outline"]'
    ];
    
    let newChatButton = null;
    for (const selector of newChatSelectors) {
      newChatButton = document.querySelector(selector);
      if (newChatButton) {
        console.log(`✅ Botão nova conversa encontrado: ${selector}`);
        break;
      }
    }
    
    if (newChatButton) {
      newChatButton.click();
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Buscar campo de pesquisa
      const searchInput = await waitForElement([
        'input[placeholder*="Pesquisar"]',
        'input[placeholder*="Search"]',
        '[data-testid="search-input"]',
        'input[type="text"]'
      ]);
      
      if (searchInput) {
        // Inserir número formatado
        searchInput.focus();
        searchInput.value = `+${formattedPhone}`;
        
        // Disparar eventos
        ['input', 'change', 'keyup'].forEach(eventType => {
          const event = new Event(eventType, { bubbles: true });
          searchInput.dispatchEvent(event);
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Pressionar Enter ou procurar resultado
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        searchInput.dispatchEvent(enterEvent);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verificar se abriu conversa
        const messageInput = await waitForMessageInput();
        if (messageInput) {
          return true;
        }
      }
    }
    
    // Se não conseguiu com nova conversa, tentar URL como última opção
    // mas usando pushState para não recarregar
    console.log(`🔄 Tentando via URL sem recarregar...`);
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=`;
    
    // Usar pushState para mudar URL sem recarregar
    window.history.pushState({}, '', whatsappUrl);
    
    // Aguardar carregamento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const messageInput = await waitForMessageInput();
    return !!messageInput;
    
  } catch (error) {
    console.error('❌ Erro ao abrir nova conversa:', error);
    return false;
  }
}

// Aguardar campo de mensagem aparecer
async function waitForMessageInput(timeout = 5000) {
  const inputSelectors = [
    '[contenteditable="true"][data-tab="10"]',
    '[contenteditable="true"][data-tab="1"]', 
    'div[contenteditable="true"][data-lexical-editor="true"]',
    'div[contenteditable="true"]',
    '[data-testid="conversation-compose-box-input"]'
  ];
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    for (const selector of inputSelectors) {
      const input = document.querySelector(selector);
      if (input && input.offsetParent !== null) { // Verificar se está visível
        console.log(`✅ Campo de mensagem encontrado: ${selector}`);
        return input;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`❌ Campo de mensagem não encontrado após ${timeout}ms`);
  return null;
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