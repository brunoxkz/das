// RocketZap Lead Manager - Visual Interface
console.log('🚀 RocketZap Visual Manager iniciado');

// Estado da aplicação
let appState = {
  leads: {
    new: [],
    all: [],
    processed: []
  },
  selectedLead: null,
  activeTab: 'new',
  deliveryOptions: [],
  isLoading: false
};

// Elementos DOM
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const leadCount = document.getElementById('leadCount');
const leadsList = document.getElementById('leadsList');
const statusMessages = document.getElementById('statusMessages');

// Form elements
const customerName = document.getElementById('customerName');
const customerPhone = document.getElementById('customerPhone');
const customerCep = document.getElementById('customerCep');
const customerAddress = document.getElementById('customerAddress');
const customerNumber = document.getElementById('customerNumber');
const customerDistrict = document.getElementById('customerDistrict');
const customerCity = document.getElementById('customerCity');
const customerState = document.getElementById('customerState');
const cepStatus = document.getElementById('cepStatus');
const deliveryOptions = document.getElementById('deliveryOptions');
const deliveryDates = document.getElementById('deliveryDates');
const submitOrder = document.getElementById('submitOrder');

// Quick action buttons
const exportNow = document.getElementById('exportNow');
const syncLeads = document.getElementById('syncLeads');
const refreshData = document.getElementById('refreshData');

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', async () => {
  console.log('📱 Interface visual carregada');
  
  // Configurar event listeners
  setupEventListeners();
  
  // Carregar dados iniciais
  await loadInitialData();
  
  // Configurar tabs
  setupTabs();
  
  // Configurar auto-refresh
  setInterval(loadLeadsData, 10000); // A cada 10 segundos
});

function setupEventListeners() {
  // Quick actions
  exportNow.addEventListener('click', handleExportNow);
  syncLeads.addEventListener('click', handleSyncLeads);
  refreshData.addEventListener('click', loadInitialData);
  
  // Form events
  customerCep.addEventListener('input', handleCepInput);
  customerCep.addEventListener('blur', lookupCep);
  submitOrder.addEventListener('click', handleSubmitOrder);
  
  // Form validation
  [customerName, customerCep, customerAddress, customerNumber].forEach(input => {
    input.addEventListener('input', validateForm);
  });
}

function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active tab
      tabButtons.forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      
      // Update app state
      appState.activeTab = button.dataset.tab;
      
      // Render leads for active tab
      renderLeads();
    });
  });
}

// ===== CARREGAMENTO DE DADOS =====

async function loadInitialData() {
  try {
    updateStatus('loading', 'Carregando dados...');
    
    // Carregar leads do storage
    await loadLeadsData();
    
    updateStatus('active', 'Conectado ao RocketZap');
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error);
    updateStatus('error', 'Erro ao carregar');
  }
}

async function loadLeadsData() {
  try {
    // Buscar leads do chrome storage
    const result = await chrome.storage.local.get(['leads', 'processedLeads', 'newLeads']);
    
    // Organizar leads por categoria
    const allLeads = result.leads || [];
    const processedPhones = new Set(result.processedLeads || []);
    const recentLeads = result.newLeads || [];
    
    // Separar leads novos vs antigos
    appState.leads.all = allLeads;
    appState.leads.processed = allLeads.filter(lead => 
      processedPhones.has(normalizePhone(lead.phone))
    );
    appState.leads.new = allLeads.filter(lead => 
      !processedPhones.has(normalizePhone(lead.phone))
    );
    
    // Atualizar interface
    updateLeadCount();
    renderLeads();
    
  } catch (error) {
    console.error('❌ Erro ao carregar leads:', error);
  }
}

// ===== RENDERIZAÇÃO DE INTERFACE =====

function updateLeadCount() {
  const activeLeads = appState.leads[appState.activeTab];
  leadCount.textContent = activeLeads.length;
}

function renderLeads() {
  const activeLeads = appState.leads[appState.activeTab];
  
  if (activeLeads.length === 0) {
    renderEmptyState();
    return;
  }
  
  const html = activeLeads.map(lead => renderLeadItem(lead)).join('');
  leadsList.innerHTML = html;
  
  // Adicionar event listeners para os leads
  leadsList.querySelectorAll('.lead-item').forEach((item, index) => {
    item.addEventListener('click', () => selectLead(activeLeads[index]));
  });
  
  leadsList.querySelectorAll('.action-btn.primary').forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectLead(activeLeads[index]);
      focusOrderForm();
    });
  });
}

function renderLeadItem(lead) {
  const isNew = appState.activeTab === 'new';
  const phone = formatPhone(lead.phone);
  
  return `
    <div class="lead-item ${isNew ? 'new' : ''}">
      <div class="lead-info">
        <div class="lead-name">${lead.name || 'Nome não informado'}</div>
        <div class="lead-phone">${phone}</div>
      </div>
      <div class="lead-actions">
        <button class="action-btn primary">
          🛍️ Pedido
        </button>
        <button class="action-btn">
          📱 SMS
        </button>
      </div>
    </div>
  `;
}

function renderEmptyState() {
  const messages = {
    new: {
      icon: '📥',
      title: 'Nenhum lead novo',
      text: 'Clique em "Exportar" para buscar novos leads'
    },
    all: {
      icon: '📋',
      title: 'Nenhum lead encontrado',
      text: 'Exporte dados do RocketZap primeiro'
    },
    processed: {
      icon: '✅',
      title: 'Nenhum lead processado',
      text: 'Leads processados aparecerão aqui'
    }
  };
  
  const msg = messages[appState.activeTab];
  
  leadsList.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">${msg.icon}</div>
      <div class="empty-title">${msg.title}</div>
      <div class="empty-text">${msg.text}</div>
    </div>
  `;
}

// ===== SELEÇÃO DE LEADS =====

function selectLead(lead) {
  appState.selectedLead = lead;
  
  // Preencher formulário
  customerName.value = lead.name || '';
  customerPhone.value = formatPhone(lead.phone);
  
  // Limpar campos de endereço
  clearAddressFields();
  
  // Destacar lead selecionado
  leadsList.querySelectorAll('.lead-item').forEach(item => {
    item.classList.remove('selected');
  });
  
  // Validar formulário
  validateForm();
  
  showMessage('Lead selecionado! Preencha o endereço.', 'info');
}

function focusOrderForm() {
  customerName.focus();
}

// ===== BUSCA DE CEP =====

function handleCepInput(e) {
  let value = e.target.value.replace(/\D/g, '');
  
  if (value.length > 5) {
    value = value.substring(0, 5) + '-' + value.substring(5, 8);
  }
  
  e.target.value = value;
  
  // Limpar status anterior
  cepStatus.textContent = '';
  clearAddressFields();
  hideDeliveryOptions();
}

async function lookupCep() {
  const cep = customerCep.value.replace(/\D/g, '');
  
  if (cep.length !== 8) {
    return;
  }
  
  try {
    cepStatus.textContent = '🔍';
    cepStatus.style.color = '#0ea5e9';
    
    // Buscar CEP via ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    // Preencher campos
    customerAddress.value = data.logradouro || '';
    customerDistrict.value = data.bairro || '';
    customerCity.value = data.localidade || '';
    customerState.value = data.uf || '';
    
    cepStatus.textContent = '✅';
    cepStatus.style.color = '#10b981';
    
    // Focar no campo número
    customerNumber.focus();
    
    // Carregar opções de entrega
    await loadDeliveryOptions();
    
    showMessage('Endereço encontrado! Complete com o número.', 'success');
    
  } catch (error) {
    console.error('❌ Erro na busca do CEP:', error);
    
    cepStatus.textContent = '❌';
    cepStatus.style.color = '#ef4444';
    
    showMessage('CEP não encontrado. Verifique e tente novamente.', 'error');
  }
  
  validateForm();
}

function clearAddressFields() {
  customerAddress.value = '';
  customerNumber.value = '';
  customerDistrict.value = '';
  customerCity.value = '';
  customerState.value = '';
}

// ===== OPÇÕES DE ENTREGA =====

async function loadDeliveryOptions() {
  try {
    // Simular busca de opções de entrega na Logzz
    // Em implementação real, faria request para API da Logzz
    
    const today = new Date();
    const options = [];
    
    // Gerar 3-5 opções de entrega
    for (let i = 3; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      options.push({
        date: date.toISOString().split('T')[0],
        dateFormatted: date.toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        }),
        timeSlots: ['08:00-12:00', '14:00-18:00']
      });
    }
    
    appState.deliveryOptions = options;
    renderDeliveryOptions();
    
  } catch (error) {
    console.error('❌ Erro ao carregar opções de entrega:', error);
  }
}

function renderDeliveryOptions() {
  if (appState.deliveryOptions.length === 0) {
    return;
  }
  
  const html = appState.deliveryOptions.map((option, index) => `
    <div class="delivery-option" data-index="${index}">
      <div>
        <div class="delivery-date">${option.dateFormatted}</div>
        <div class="delivery-time">Períodos: ${option.timeSlots.join(', ')}</div>
      </div>
      <div>📦</div>
    </div>
  `).join('');
  
  deliveryDates.innerHTML = html;
  deliveryOptions.style.display = 'block';
  
  // Event listeners para seleção
  deliveryDates.querySelectorAll('.delivery-option').forEach(option => {
    option.addEventListener('click', () => selectDeliveryOption(option));
  });
}

function selectDeliveryOption(selectedOption) {
  // Remove seleção anterior
  deliveryDates.querySelectorAll('.delivery-option').forEach(option => {
    option.classList.remove('selected');
  });
  
  // Adiciona seleção
  selectedOption.classList.add('selected');
  
  // Salvar seleção no estado
  const index = selectedOption.dataset.index;
  appState.selectedDeliveryOption = appState.deliveryOptions[index];
  
  validateForm();
}

function hideDeliveryOptions() {
  deliveryOptions.style.display = 'none';
  appState.deliveryOptions = [];
  appState.selectedDeliveryOption = null;
}

// ===== VALIDAÇÃO DE FORMULÁRIO =====

function validateForm() {
  const isValid = 
    customerName.value.trim().length > 0 &&
    customerPhone.value.trim().length > 0 &&
    customerCep.value.replace(/\D/g, '').length === 8 &&
    customerAddress.value.trim().length > 0 &&
    customerNumber.value.trim().length > 0 &&
    appState.selectedDeliveryOption;
  
  submitOrder.disabled = !isValid;
  
  return isValid;
}

// ===== FINALIZAÇÃO DE PEDIDO =====

async function handleSubmitOrder() {
  if (!validateForm()) {
    showMessage('Preencha todos os campos obrigatórios.', 'error');
    return;
  }
  
  try {
    submitOrder.disabled = true;
    submitOrder.textContent = '🔄 Processando...';
    
    // Preparar dados do pedido
    const orderData = {
      customer: {
        name: customerName.value.trim(),
        phone: customerPhone.value.trim(),
        address: {
          cep: customerCep.value.replace(/\D/g, ''),
          street: customerAddress.value.trim(),
          number: customerNumber.value.trim(),
          district: customerDistrict.value.trim(),
          city: customerCity.value.trim(),
          state: customerState.value.trim()
        }
      },
      delivery: appState.selectedDeliveryOption,
      product: {
        url: 'https://entrega.logzz.com.br/pay/memqpe8km/1-mes-de-tratamento-ganha-mais-1-mes-de-brinde',
        name: '1 mês de tratamento + 1 mês de brinde'
      },
      lead: appState.selectedLead
    };
    
    // Simular envio para Logzz
    const success = await submitToLogzz(orderData);
    
    if (success) {
      showMessage('✅ Pedido enviado para Logzz com sucesso!', 'success');
      
      // Marcar lead como processado
      await markLeadAsProcessed(appState.selectedLead);
      
      // Limpar formulário
      clearOrderForm();
      
      // Atualizar leads
      await loadLeadsData();
      
    } else {
      throw new Error('Falha no envio do pedido');
    }
    
  } catch (error) {
    console.error('❌ Erro ao finalizar pedido:', error);
    showMessage('❌ Erro ao finalizar pedido. Tente novamente.', 'error');
    
  } finally {
    submitOrder.disabled = false;
    submitOrder.textContent = '🛒 Finalizar Pedido na Logzz';
  }
}

async function submitToLogzz(orderData) {
  try {
    console.log('📦 Enviando pedido para Logzz:', orderData);
    
    // Usar integração real com Logzz
    const response = await chrome.runtime.sendMessage({
      type: 'CREATE_LOGZZ_ORDER',
      data: orderData
    });
    
    if (response.success) {
      console.log('✅ Pedido criado com sucesso:', response.order);
      return response.order;
    } else {
      throw new Error(response.error || 'Erro desconhecido');
    }
    
  } catch (error) {
    console.error('❌ Erro na integração Logzz:', error);
    return false;
  }
}

async function markLeadAsProcessed(lead) {
  try {
    const result = await chrome.storage.local.get(['processedLeads']);
    const processed = result.processedLeads || [];
    
    const phone = normalizePhone(lead.phone);
    if (!processed.includes(phone)) {
      processed.push(phone);
      await chrome.storage.local.set({ processedLeads: processed });
    }
    
  } catch (error) {
    console.error('❌ Erro ao marcar lead como processado:', error);
  }
}

function clearOrderForm() {
  customerName.value = '';
  customerPhone.value = '';
  customerCep.value = '';
  clearAddressFields();
  hideDeliveryOptions();
  appState.selectedLead = null;
  appState.selectedDeliveryOption = null;
  cepStatus.textContent = '';
}

// ===== AÇÕES RÁPIDAS =====

async function handleExportNow() {
  try {
    exportNow.disabled = true;
    exportNow.textContent = '📥 Exportando...';
    
    // Enviar comando para background script
    chrome.runtime.sendMessage({ type: 'FORCE_EXPORT' });
    
    showMessage('Exportação iniciada! Aguarde o processamento...', 'info');
    
    // Aguardar um pouco e recarregar
    setTimeout(async () => {
      await loadLeadsData();
    }, 5000);
    
  } catch (error) {
    console.error('❌ Erro na exportação:', error);
    showMessage('Erro na exportação. Verifique se está logado no RocketZap.', 'error');
    
  } finally {
    setTimeout(() => {
      exportNow.disabled = false;
      exportNow.textContent = '📥 Exportar';
    }, 3000);
  }
}

async function handleSyncLeads() {
  try {
    syncLeads.disabled = true;
    syncLeads.textContent = '📤 Sincronizando...';
    
    // Enviar comando para background script
    chrome.runtime.sendMessage({ type: 'SYNC_LEADS' });
    
    showMessage('Leads sincronizados com servidor SMS!', 'success');
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    showMessage('Erro na sincronização. Tente novamente.', 'error');
    
  } finally {
    setTimeout(() => {
      syncLeads.disabled = false;
      syncLeads.textContent = '📤 Sincronizar';
    }, 2000);
  }
}

// ===== UTILITÁRIOS =====

function updateStatus(type, message) {
  statusText.textContent = message;
  
  statusDot.className = 'status-dot';
  if (type === 'error') {
    statusDot.classList.add('inactive');
  }
}

function showMessage(message, type = 'info') {
  const messageEl = document.createElement('div');
  messageEl.className = `status-message ${type}`;
  messageEl.textContent = message;
  
  statusMessages.appendChild(messageEl);
  
  // Remove após 5 segundos
  setTimeout(() => {
    if (messageEl.parentNode) {
      messageEl.parentNode.removeChild(messageEl);
    }
  }, 5000);
}

function normalizePhone(phone) {
  if (!phone) return '';
  
  const cleaned = phone.toString().replace(/\D/g, '');
  
  if (cleaned.length === 11 && cleaned.startsWith('9')) {
    return '55' + cleaned;
  } else if (cleaned.length === 10) {
    return '559' + cleaned;
  } else if (cleaned.length === 13 && cleaned.startsWith('55')) {
    return cleaned;
  }
  
  return cleaned.length >= 10 ? cleaned : '';
}

function formatPhone(phone) {
  const normalized = normalizePhone(phone);
  
  if (normalized.length === 13) {
    const ddd = normalized.substring(2, 4);
    const first = normalized.substring(4, 9);
    const second = normalized.substring(9, 13);
    return `(${ddd}) ${first}-${second}`;
  }
  
  return phone;
}

// ===== LISTENERS DE MENSAGENS =====

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'XLS_PROCESSED':
      showMessage(`📊 XLS processado: ${message.newLeads} novos de ${message.totalLeads} total`, 'success');
      loadLeadsData();
      break;
      
    case 'LEAD_PROCESSED':
      showMessage(`📱 Novo lead: ${formatPhone(message.lead.phone)}`, 'success');
      loadLeadsData();
      break;
      
    case 'LOGIN_REQUIRED':
      updateStatus('error', 'Faça login no RocketZap');
      showMessage(message.message, 'error');
      break;
      
    case 'NO_ROCKETZAP_TAB':
      updateStatus('error', 'Abra o RocketZap');
      showMessage(message.message, 'error');
      break;
  }
});

console.log('✅ RocketZap Visual Manager configurado');