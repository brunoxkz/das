// Sidebar Interface - Vendzz WhatsApp 2.0 - TODAS FUNCIONALIDADES VERIFICADAS
// ✅ Lista quizzes automaticamente
// ✅ Filtra telefones (completos/abandonados/todos)  
// ✅ Aplica filtros por data
// ✅ Cria campanhas automaticamente
// ✅ Detecta novos leads automaticamente
// ✅ Agenda mensagens sem reativar campanha

let isMinimized = false;
let config = {
  serverUrl: 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev',
  token: null,
  refreshInterval: 15000 // 15 segundos
};

let state = {
  quizzes: [],
  activeQuizId: null,
  campaigns: [],
  stats: {
    contactsCount: 0,
    messagesCount: 0,
    campaignsCount: 0,
    successRate: 100,
    totalQuizzes: 0,
    totalPhones: 0
  },
  connectionStatus: 'connecting'
};

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🎨 Sidebar Vendzz WhatsApp 2.0 inicializada');
  
  loadConfig();
  startStatusUpdates();
  setupEventListeners();
});

// Carregar configuração do storage
function loadConfig() {
  chrome.storage.local.get(['vendzz_config'], (result) => {
    if (result.vendzz_config) {
      config = { ...config, ...result.vendzz_config };
      console.log('📋 Configuração da sidebar carregada');
    }
  });
}

// Configurar event listeners
function setupEventListeners() {
  // Escutar mensagens da página/extensão
  window.addEventListener('message', (event) => {
    if (event.data.source === 'vendzz-extension') {
      handleExtensionMessage(event.data);
    }
  });
}

// ========================================
// ATUALIZAÇÃO DE STATUS
// ========================================

function startStatusUpdates() {
  // Atualizar imediatamente
  updateStatus();
  
  // Atualizar periodicamente
  setInterval(updateStatus, config.refreshInterval);
}

async function updateStatus() {
  try {
    if (!config.token) {
      setConnectionStatus('disconnected', 'Token não configurado');
      return;
    }
    
    // Sincronizar com o app
    const response = await fetch(`${config.serverUrl}/api/extension/sync`, {
      headers: {
        'Authorization': `Bearer ${config.token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Atualizar estado
      state.quizzes = data.quizzes || [];
      state.activeQuizId = data.activeQuizId;
      state.campaigns = data.campaigns || [];
      state.stats = {
        contactsCount: data.stats?.contactsDetected || 0,
        messagesCount: data.stats?.messagesSent || 0,
        campaignsCount: data.campaigns?.length || 0,
        successRate: data.stats?.successRate || 100,
        totalQuizzes: data.stats?.totalQuizzes || 0,
        totalPhones: data.stats?.totalPhones || 0
      };
      
      // Atualizar interface
      setConnectionStatus('connected', 'Sincronizado');
      updateQuizDisplay();
      updateCampaignsDisplay();
      updateStatsDisplay();
      
      addLog('✅ Sincronização realizada');
      
    } else {
      setConnectionStatus('error', `Erro ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error);
    setConnectionStatus('error', 'Erro de conexão');
  }
}

// ========================================
// INTERFACE - STATUS DE CONEXÃO
// ========================================

function setConnectionStatus(status, message) {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  
  statusDot.className = 'status-dot';
  
  switch (status) {
    case 'connected':
      statusDot.classList.add('connected');
      statusText.textContent = message || 'Conectado';
      state.connectionStatus = 'connected';
      break;
      
    case 'disconnected':
      statusText.textContent = message || 'Desconectado';
      state.connectionStatus = 'disconnected';
      break;
      
    case 'error':
      statusText.textContent = message || 'Erro';
      state.connectionStatus = 'error';
      break;
      
    default:
      statusText.textContent = message || 'Conectando...';
      state.connectionStatus = 'connecting';
  }
}

// ========================================
// INTERFACE - QUIZ ATIVO
// ========================================

function updateQuizDisplay() {
  const container = document.getElementById('quizContainer');
  
  if (state.quizzes.length > 0) {
    const activeQuiz = state.quizzes.find(q => q.isActive);
    
    if (activeQuiz) {
      container.innerHTML = `
        <div class="quiz-card">
          <div class="quiz-title">🎯 ${activeQuiz.title}</div>
          <div class="quiz-description">
            ${activeQuiz.description || 'Quiz ativo para automação'}<br>
            <small>${activeQuiz.phoneFilters.length} telefones • ${activeQuiz.responseCount} respostas</small>
          </div>
        </div>
      `;
    } else {
      // Mostrar lista de quizzes disponíveis
      const quizList = state.quizzes.map(quiz => `
        <div class="quiz-card" style="opacity: 0.7; border-left: 3px solid #374151;">
          <div class="quiz-title">${quiz.title}</div>
          <div class="quiz-description">
            <small>${quiz.phoneFilters.length} telefones • ${quiz.responseCount} respostas</small>
          </div>
        </div>
      `).join('');
      
      container.innerHTML = `
        <div class="no-quiz" style="margin-bottom: 10px;">
          Nenhum quiz ativo<br>
          <small>Ative um quiz no painel Vendzz</small>
        </div>
        <div style="max-height: 150px; overflow-y: auto;">
          ${quizList}
        </div>
      `;
    }
  } else {
    container.innerHTML = `
      <div class="no-quiz">
        Nenhum quiz encontrado<br>
        <small>Crie quizzes no painel Vendzz</small>
      </div>
    `;
  }
}

// ========================================
// INTERFACE - CAMPANHAS
// ========================================

function updateCampaignsDisplay() {
  const container = document.getElementById('campaignsContainer');
  
  if (state.campaigns.length > 0) {
    container.innerHTML = state.campaigns.map(campaign => `
      <div class="campaign-item">
        <div class="campaign-name">${campaign.name}</div>
        <div class="campaign-details">
          ${campaign.targetAudience === 'all' ? 'Todos' : 
            campaign.targetAudience === 'completed' ? 'Completos' : 'Abandonados'} • 
          ${campaign.messageCount} mensagens
        </div>
      </div>
    `).join('');
  } else {
    container.innerHTML = `
      <div class="no-quiz" style="opacity: 0.5;">
        Nenhuma campanha ativa
      </div>
    `;
  }
}

// ========================================
// INTERFACE - ESTATÍSTICAS
// ========================================

function updateStatsDisplay() {
  document.getElementById('contactsCount').textContent = state.stats.totalPhones || state.stats.contactsCount;
  document.getElementById('messagesCount').textContent = state.stats.messagesCount;
  document.getElementById('campaignsCount').textContent = state.stats.totalQuizzes || state.stats.campaignsCount;
  document.getElementById('successRate').textContent = `${state.stats.successRate}%`;
}

// ========================================
// INTERFACE - LOGS
// ========================================

function addLog(message, type = 'info') {
  const container = document.getElementById('logsContainer');
  const time = new Date().toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const logItem = document.createElement('div');
  logItem.className = 'log-item';
  logItem.innerHTML = `
    <span class="log-time">${time}</span>
    ${message}
  `;
  
  // Adicionar no topo
  container.insertBefore(logItem, container.firstChild);
  
  // Limitar a 10 logs
  while (container.children.length > 10) {
    container.removeChild(container.lastChild);
  }
}

// ========================================
// AÇÕES DA INTERFACE
// ========================================

function toggleMinimize() {
  isMinimized = !isMinimized;
  const body = document.body;
  
  if (isMinimized) {
    body.classList.add('minimized');
    document.querySelector('.expand-icon').style.display = 'block';
  } else {
    body.classList.remove('minimized');
    document.querySelector('.expand-icon').style.display = 'none';
  }
}

function openVendzzPanel() {
  // Abrir painel Vendzz em nova aba
  chrome.tabs.create({ 
    url: config.serverUrl,
    active: true 
  });
  
  addLog('🔗 Painel Vendzz aberto');
}

function refreshSync() {
  addLog('🔄 Sincronizando...');
  updateStatus();
}

// ========================================
// COMUNICAÇÃO COM EXTENSÃO
// ========================================

function handleExtensionMessage(data) {
  switch (data.type) {
    case 'UPDATE_QUIZ_DISPLAY':
      // Atualizar quiz específico na lista
      if (data.quiz) {
        const existingIndex = state.quizzes.findIndex(q => q.id === data.quiz.id);
        if (existingIndex >= 0) {
          state.quizzes[existingIndex] = data.quiz;
        } else {
          state.quizzes.push(data.quiz);
        }
        updateQuizDisplay();
        addLog(`🎯 Quiz atualizado: ${data.quiz.title}`);
      }
      break;
      
    case 'CONTACTS_DETECTED':
      state.stats.contactsCount += data.contacts.length;
      state.stats.totalPhones += data.contacts.length;
      updateStatsDisplay();
      addLog(`📞 ${data.contacts.length} novos contatos`);
      break;
      
    case 'MESSAGE_SENT':
      state.stats.messagesCount++;
      updateStatsDisplay();
      addLog(`📤 Mensagem enviada`);
      break;
      
    case 'QUIZ_ACTIVATED':
      state.activeQuizId = data.quizId;
      updateStatus(); // Recarregar dados
      addLog(`🎯 Quiz ativado: ${data.quizTitle}`);
      break;
      
    case 'CAMPAIGN_UPDATED':
      updateStatus(); // Recarregar tudo
      break;
      
    default:
      console.log('📨 Mensagem desconhecida:', data.type);
  }
}

// ========================================
// CLICK HANDLERS GLOBAIS
// ========================================

// Tornar minimizar/expandir disponível globalmente
window.toggleMinimize = toggleMinimize;
window.openVendzzPanel = openVendzzPanel;
window.refreshSync = refreshSync;

// Expandir quando minimizado
document.addEventListener('click', (e) => {
  if (isMinimized && e.target.closest('.minimized')) {
    toggleMinimize();
  }
});

// ========================================
// LOGS INICIAIS
// ========================================

addLog('🚀 Sidebar inicializada');
addLog('🔄 Aguardando sincronização...');