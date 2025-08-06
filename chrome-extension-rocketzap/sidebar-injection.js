// Injeção da sidebar fixa no RocketZap
console.log('🚀 Carregando Sidebar RocketZap Lead Manager...');

let sidebarCreated = false;
let currentLeads = [];
let selectedLead = null;
let autoSyncInterval = null;

// Criar sidebar fixa
function createSidebar() {
  if (sidebarCreated) return;
  
  console.log('📱 Criando sidebar fixa...');
  
  // Sidebar principal
  const sidebar = document.createElement('div');
  sidebar.id = 'rocketzap-sidebar';
  sidebar.innerHTML = `
    <div id="rocketzap-sidebar-header">
      <h2 id="rocketzap-sidebar-title">🚀 Lead Manager</h2>
      <button id="rocketzap-sidebar-minimize">−</button>
    </div>
    <div id="rocketzap-sidebar-content">
      
      <!-- Seção de Status -->
      <div class="sidebar-section">
        <h3>📊 Status</h3>
        <div class="sidebar-stats">
          <div>Total Leads: <span id="total-leads">0</span></div>
          <div>Novos: <span id="new-leads">0</span></div>
          <div>Processados: <span id="processed-leads">0</span></div>
          <div>Última Sync: <span id="last-sync">Nunca</span></div>
        </div>
      </div>
      
      <!-- Seção de Controles -->
      <div class="sidebar-section">
        <h3>⚡ Controles</h3>
        <button class="sidebar-button" id="extract-contacts">📋 Extrair Contatos</button>
        <button class="sidebar-button" id="download-leads">📥 Download XLS</button>
        <button class="sidebar-button" id="sync-data">🔄 Sincronizar</button>
        <button class="sidebar-button" id="auto-sync-toggle">⏱️ Auto-Sync: OFF</button>
      </div>
      
      <!-- Seção de Leads -->
      <div class="sidebar-section">
        <h3>👥 Leads Disponíveis</h3>
        <div class="leads-list" id="leads-list">
          <div style="text-align: center; color: #94a3b8; font-size: 11px; padding: 20px;">
            Clique em "Extrair Contatos" para carregar
          </div>
        </div>
      </div>
      
      <!-- Seção de Pedido -->
      <div class="sidebar-section">
        <h3>🛒 Fazer Pedido</h3>
        <div id="selected-lead-info" style="font-size: 11px; margin-bottom: 10px; color: #e5e7eb;">
          Selecione um lead acima
        </div>
        <button class="sidebar-button" id="create-order" disabled>🚚 Enviar para Logzz</button>
      </div>
      
      <!-- Seção de Logs -->
      <div class="sidebar-section">
        <h3>📜 Logs</h3>
        <div id="logs-container" style="font-size: 10px; max-height: 100px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
          <div style="color: #10b981;">✅ Sidebar carregada</div>
        </div>
      </div>
      
    </div>
  `;
  
  // Botão de toggle (quando minimizada)
  const toggleButton = document.createElement('button');
  toggleButton.className = 'toggle-button';
  toggleButton.innerHTML = '◀';
  toggleButton.style.display = 'none';
  
  document.body.appendChild(sidebar);
  document.body.appendChild(toggleButton);
  
  // Event listeners
  setupSidebarEvents();
  
  // Ajustar corpo da página
  document.body.style.marginRight = '350px';
  
  sidebarCreated = true;
  addLog('🚀 Sidebar criada e ativa');
  
  // Carregar dados salvos
  loadSavedData();
}

// Configurar eventos da sidebar
function setupSidebarEvents() {
  // Minimizar/maximizar
  document.getElementById('rocketzap-sidebar-minimize').addEventListener('click', toggleSidebar);
  document.querySelector('.toggle-button').addEventListener('click', toggleSidebar);
  
  // Controles
  document.getElementById('extract-contacts').addEventListener('click', extractContacts);
  document.getElementById('download-leads').addEventListener('click', downloadLeads);
  document.getElementById('sync-data').addEventListener('click', syncData);
  document.getElementById('auto-sync-toggle').addEventListener('click', toggleAutoSync);
  document.getElementById('create-order').addEventListener('click', createOrder);
}

// Toggle sidebar
function toggleSidebar() {
  const sidebar = document.getElementById('rocketzap-sidebar');
  const toggleButton = document.querySelector('.toggle-button');
  const isMinimized = sidebar.classList.contains('minimized');
  
  if (isMinimized) {
    sidebar.classList.remove('minimized');
    document.body.classList.remove('sidebar-minimized');
    document.body.style.marginRight = '350px';
    toggleButton.style.display = 'none';
    toggleButton.innerHTML = '◀';
  } else {
    sidebar.classList.add('minimized');
    document.body.classList.add('sidebar-minimized');
    document.body.style.marginRight = '50px';
    toggleButton.style.display = 'block';
    toggleButton.innerHTML = '▶';
  }
}

// Extrair contatos da página /contacts
function extractContacts() {
  addLog('📋 Extraindo contatos da página...');
  
  const currentUrl = window.location.href;
  
  if (!currentUrl.includes('/contacts')) {
    addLog('⚠️ Navegando para /contacts...');
    window.location.href = 'https://app.rocketzap.com.br/contacts';
    return;
  }
  
  // Aguardar carregamento e extrair
  setTimeout(() => {
    const contacts = extractContactsFromPage();
    if (contacts.length > 0) {
      currentLeads = contacts;
      updateLeadsList();
      updateStats();
      saveData();
      addLog(`✅ ${contacts.length} contatos extraídos`);
    } else {
      addLog('❌ Nenhum contato encontrado');
    }
  }, 2000);
}

// Extrair contatos da página atual
function extractContactsFromPage() {
  const contacts = [];
  
  // Tentar diferentes seletores para tabelas de contatos
  const selectors = [
    'table tbody tr',
    '.contact-item',
    '.lead-item',
    '[data-contact]',
    '.table-row'
  ];
  
  for (const selector of selectors) {
    const rows = document.querySelectorAll(selector);
    
    if (rows.length > 0) {
      addLog(`🔍 Encontradas ${rows.length} linhas com seletor: ${selector}`);
      
      rows.forEach((row, index) => {
        const contact = extractContactFromRow(row);
        if (contact && contact.phone) {
          contacts.push({
            ...contact,
            id: `contact_${Date.now()}_${index}`,
            extracted_at: new Date().toISOString(),
            status: 'new'
          });
        }
      });
      
      if (contacts.length > 0) break;
    }
  }
  
  // Se não encontrou, tentar método genérico
  if (contacts.length === 0) {
    const genericContacts = extractGenericContacts();
    contacts.push(...genericContacts);
  }
  
  return contacts;
}

// Extrair contato de uma linha
function extractContactFromRow(row) {
  const contact = {
    name: '',
    phone: '',
    email: '',
    extra: ''
  };
  
  // Buscar texto da linha
  const text = row.textContent || row.innerText || '';
  const cells = row.querySelectorAll('td, div, span');
  
  // Procurar telefone (padrão brasileiro)
  const phoneMatch = text.match(/(\(?0?\d{2}\)?\s?\d{4,5}[-\s]?\d{4})/);
  if (phoneMatch) {
    contact.phone = phoneMatch[1].replace(/\D/g, '');
  }
  
  // Procurar email
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    contact.email = emailMatch[1];
  }
  
  // Procurar nome (primeira célula que não é telefone/email)
  cells.forEach(cell => {
    const cellText = cell.textContent.trim();
    if (cellText.length > 2 && 
        !cellText.match(/\d{4,}/) && 
        !cellText.includes('@') && 
        !contact.name) {
      contact.name = cellText;
    }
  });
  
  return contact.phone ? contact : null;
}

// Método genérico para extrair contatos
function extractGenericContacts() {
  const contacts = [];
  const allText = document.body.textContent;
  
  // Buscar todos os telefones na página
  const phoneRegex = /(\(?0?\d{2}\)?\s?\d{4,5}[-\s]?\d{4})/g;
  const phones = allText.match(phoneRegex) || [];
  
  phones.forEach((phone, index) => {
    if (index < 50) { // Limitar a 50 para evitar spam
      contacts.push({
        id: `generic_${Date.now()}_${index}`,
        name: `Contato ${index + 1}`,
        phone: phone.replace(/\D/g, ''),
        email: '',
        extra: 'Extraído automaticamente',
        extracted_at: new Date().toISOString(),
        status: 'new'
      });
    }
  });
  
  return contacts;
}

// Atualizar lista de leads na sidebar
function updateLeadsList() {
  const leadsList = document.getElementById('leads-list');
  
  if (currentLeads.length === 0) {
    leadsList.innerHTML = `
      <div style="text-align: center; color: #94a3b8; font-size: 11px; padding: 20px;">
        Nenhum lead encontrado
      </div>
    `;
    return;
  }
  
  leadsList.innerHTML = currentLeads.map((lead, index) => `
    <div class="lead-item" data-index="${index}">
      <span class="status-indicator status-${lead.status}"></span>
      <strong>${lead.name || 'Sem nome'}</strong><br>
      📱 ${formatPhone(lead.phone)}<br>
      ${lead.email ? `✉️ ${lead.email}` : ''}
    </div>
  `).join('');
  
  // Event listeners para seleção
  document.querySelectorAll('.lead-item').forEach(item => {
    item.addEventListener('click', () => selectLead(parseInt(item.dataset.index)));
  });
}

// Selecionar lead
function selectLead(index) {
  selectedLead = currentLeads[index];
  
  // Atualizar visual
  document.querySelectorAll('.lead-item').forEach((item, i) => {
    if (i === index) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
  
  // Atualizar info do lead selecionado
  document.getElementById('selected-lead-info').innerHTML = `
    <strong>${selectedLead.name || 'Sem nome'}</strong><br>
    📱 ${formatPhone(selectedLead.phone)}<br>
    ${selectedLead.email ? `✉️ ${selectedLead.email}` : ''}
  `;
  
  // Habilitar botão de pedido
  document.getElementById('create-order').disabled = false;
  
  addLog(`👤 Lead selecionado: ${selectedLead.name}`);
}

// Criar pedido (enviar para Logzz)
function createOrder() {
  if (!selectedLead) {
    addLog('❌ Nenhum lead selecionado');
    return;
  }
  
  addLog('🚚 Enviando para Logzz...');
  
  // Preparar dados para Logzz
  const orderData = {
    name: selectedLead.name || 'Cliente',
    phone: normalizePhone(selectedLead.phone),
    email: selectedLead.email || '',
    cep: '', // Será preenchido na Logzz
    address: '',
    number: ''
  };
  
  // Enviar para Logzz (campo a campo)
  chrome.runtime.sendMessage({
    type: 'CREATE_LOGZZ_ORDER',
    data: orderData
  }, (response) => {
    if (response.success) {
      addLog('✅ Pedido enviado para Logzz');
      // Marcar lead como processado
      selectedLead.status = 'processing';
      updateLeadsList();
      updateStats();
      saveData();
    } else {
      addLog('❌ Erro ao enviar pedido');
    }
  });
}

// Download de leads
function downloadLeads() {
  if (currentLeads.length === 0) {
    addLog('❌ Nenhum lead para download');
    return;
  }
  
  addLog('📥 Gerando download...');
  
  // Converter para CSV
  const csv = convertToCSV(currentLeads);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  // Download
  const a = document.createElement('a');
  a.href = url;
  a.download = `rocketzap-leads-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  
  addLog('✅ Download iniciado');
}

// Converter leads para CSV
function convertToCSV(leads) {
  const headers = ['Nome', 'Telefone', 'Email', 'Status', 'Data Extração'];
  const rows = leads.map(lead => [
    lead.name || '',
    lead.phone || '',
    lead.email || '',
    lead.status || '',
    lead.extracted_at || ''
  ]);
  
  return [headers, ...rows].map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');
}

// Sincronizar dados
function syncData() {
  addLog('🔄 Sincronizando dados...');
  
  chrome.runtime.sendMessage({
    type: 'SYNC_LEADS',
    leads: currentLeads
  }, (response) => {
    if (response.success) {
      addLog('✅ Sincronização concluída');
      document.getElementById('last-sync').textContent = new Date().toLocaleTimeString();
    } else {
      addLog('❌ Erro na sincronização');
    }
  });
}

// Toggle auto-sync
function toggleAutoSync() {
  const button = document.getElementById('auto-sync-toggle');
  
  if (autoSyncInterval) {
    clearInterval(autoSyncInterval);
    autoSyncInterval = null;
    button.textContent = '⏱️ Auto-Sync: OFF';
    addLog('🔄 Auto-sync desativado');
  } else {
    autoSyncInterval = setInterval(syncData, 60000); // 1 minuto
    button.textContent = '⏱️ Auto-Sync: ON';
    addLog('🔄 Auto-sync ativado (1min)');
  }
}

// Atualizar estatísticas
function updateStats() {
  const newLeads = currentLeads.filter(l => l.status === 'new').length;
  const processedLeads = currentLeads.filter(l => l.status === 'processing' || l.status === 'completed').length;
  
  document.getElementById('total-leads').textContent = currentLeads.length;
  document.getElementById('new-leads').textContent = newLeads;
  document.getElementById('processed-leads').textContent = processedLeads;
}

// Adicionar log
function addLog(message) {
  const logsContainer = document.getElementById('logs-container');
  if (!logsContainer) return;
  
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = document.createElement('div');
  logEntry.innerHTML = `[${timestamp}] ${message}`;
  
  logsContainer.appendChild(logEntry);
  logsContainer.scrollTop = logsContainer.scrollHeight;
  
  // Limitar logs a 50 entradas
  const logs = logsContainer.children;
  if (logs.length > 50) {
    logsContainer.removeChild(logs[0]);
  }
  
  console.log(`RocketZap Sidebar: ${message}`);
}

// Formatar telefone
function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

// Normalizar telefone
function normalizePhone(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  
  // Remover 55 se presente
  if (cleaned.startsWith('55') && cleaned.length > 11) {
    cleaned = cleaned.slice(2);
  }
  
  // Adicionar 9 se necessário
  if (cleaned.length === 10) {
    cleaned = cleaned.slice(0,2) + '9' + cleaned.slice(2);
  }
  
  // Adicionar 55
  if (cleaned.length === 11) {
    cleaned = '55' + cleaned;
  }
  
  return cleaned;
}

// Salvar dados
function saveData() {
  chrome.storage.local.set({
    rocketZapLeads: currentLeads,
    lastUpdate: new Date().toISOString()
  });
}

// Carregar dados salvos
function loadSavedData() {
  chrome.storage.local.get(['rocketZapLeads'], (result) => {
    if (result.rocketZapLeads) {
      currentLeads = result.rocketZapLeads;
      updateLeadsList();
      updateStats();
      addLog(`📚 ${currentLeads.length} leads carregados do storage`);
    }
  });
}

// Inicializar quando a página carregar
function initializeSidebar() {
  if (window.location.hostname.includes('rocketzap.com.br')) {
    console.log('🚀 RocketZap detectado, criando sidebar...');
    
    // Aguardar um pouco para página carregar
    setTimeout(createSidebar, 2000);
    
    // Monitorar mudanças de URL (SPA)
    let currentUrl = window.location.href;
    setInterval(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        addLog(`🔄 URL mudou: ${currentUrl}`);
        
        // Se chegou em /contacts, extrair automaticamente
        if (currentUrl.includes('/contacts')) {
          setTimeout(extractContacts, 3000);
        }
      }
    }, 1000);
  }
}

// Inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSidebar);
} else {
  initializeSidebar();
}