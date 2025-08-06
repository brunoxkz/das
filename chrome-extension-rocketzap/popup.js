console.log('🚀 RocketZap Lead Extractor Popup iniciado');

// Elementos DOM
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const totalLeads = document.getElementById('totalLeads');
const todayLeads = document.getElementById('todayLeads');
const recentLeads = document.getElementById('recentLeads');
const exportBtn = document.getElementById('exportBtn');
const syncBtn = document.getElementById('syncBtn');
const refreshBtn = document.getElementById('refreshBtn');
const clearBtn = document.getElementById('clearBtn');
const errorDiv = document.getElementById('error');
const successDiv = document.getElementById('success');

// Estado atual
let currentStats = {
  totalLeads: 0,
  todayLeads: 0,
  recentLeads: [],
  isActive: false
};

// Mostrar mensagem
function showMessage(message, type = 'error') {
  if (type === 'error') {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    successDiv.style.display = 'none';
  } else {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    errorDiv.style.display = 'none';
  }
  
  setTimeout(() => {
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
  }, 3000);
}

// Atualizar status visual
function updateStatus(isActive) {
  if (isActive) {
    statusDot.classList.remove('inactive');
    statusText.textContent = 'Ativo no RocketZap';
  } else {
    statusDot.classList.add('inactive');
    statusText.textContent = 'Aguardando RocketZap';
  }
}

// Atualizar estatísticas
function updateStats(stats) {
  totalLeads.textContent = stats.totalLeads || 0;
  todayLeads.textContent = stats.todayLeads || 0;
  updateStatus(stats.isActive);
  currentStats = stats;
}

// Renderizar leads recentes
function renderRecentLeads(leads) {
  if (!leads || leads.length === 0) {
    recentLeads.innerHTML = '<div class="loading">Nenhum lead encontrado</div>';
    return;
  }
  
  const leadsHtml = leads.slice(0, 5).map(lead => `
    <div class="lead-item">
      <div>
        <div class="lead-phone">${formatPhone(lead.phone)}</div>
        <div style="font-size: 10px; color: #64748b;">${lead.name || 'Nome não identificado'}</div>
      </div>
      <div class="lead-time">${formatTime(lead.timestamp)}</div>
    </div>
  `).join('');
  
  recentLeads.innerHTML = leadsHtml;
}

// Formatar telefone
function formatPhone(phone) {
  if (!phone) return 'N/A';
  
  // Remover código do país se presente
  let cleanPhone = phone.replace(/^55/, '');
  
  if (cleanPhone.length === 11) {
    return `(${cleanPhone.substr(0,2)}) ${cleanPhone.substr(2,5)}-${cleanPhone.substr(7,4)}`;
  } else if (cleanPhone.length === 10) {
    return `(${cleanPhone.substr(0,2)}) ${cleanPhone.substr(2,4)}-${cleanPhone.substr(6,4)}`;
  }
  
  return phone;
}

// Formatar tempo
function formatTime(timestamp) {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  
  return date.toLocaleDateString('pt-BR');
}

// Carregar dados do storage
async function loadData() {
  try {
    // Verificar se estamos numa aba do RocketZap
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const isRocketZap = tab && tab.url && tab.url.includes('app.rocketzap.com.br');
    
    // Buscar dados do storage
    const result = await chrome.storage.local.get(['processedLeads', 'settings']);
    const processedLeads = result.processedLeads || [];
    
    // Calcular estatísticas
    const today = new Date().toDateString();
    const todayLeadsCount = processedLeads.filter(phone => {
      // Assumir que cada telefone tem timestamp de quando foi processado
      return new Date().toDateString() === today;
    }).length;
    
    // Buscar dados do content script se estivermos no RocketZap
    let contentStats = { processedLeads: processedLeads.length, isActive: isRocketZap };
    
    if (isRocketZap) {
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_STATS' });
        if (response) {
          contentStats = response;
        }
      } catch (error) {
        console.log('Content script não encontrado, tentando injetar...');
        
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          
          setTimeout(async () => {
            try {
              const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_STATS' });
              if (response) {
                updateStats({
                  totalLeads: response.processedLeads,
                  todayLeads: todayLeadsCount,
                  isActive: response.isActive
                });
              }
            } catch (e) {
              console.log('Ainda não foi possível conectar com content script');
            }
          }, 2000);
        } catch (injectionError) {
          console.error('Erro ao injetar content script:', injectionError);
        }
      }
    }
    
    const stats = {
      totalLeads: contentStats.processedLeads,
      todayLeads: todayLeadsCount,
      isActive: contentStats.isActive && isRocketZap,
      recentLeads: processedLeads.slice(-10).reverse() // Últimos 10, mais recentes primeiro
    };
    
    updateStats(stats);
    renderRecentLeads(stats.recentLeads);
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error);
    showMessage('Erro ao carregar dados: ' + error.message);
  }
}

// Sincronizar leads
async function syncLeads() {
  try {
    syncBtn.disabled = true;
    syncBtn.textContent = '📤 Sincronizando...';
    
    const response = await chrome.runtime.sendMessage({ type: 'SYNC_LEADS' });
    
    if (response.success) {
      showMessage(`✅ ${response.synced} leads sincronizados com sucesso!`, 'success');
    } else {
      showMessage('Erro na sincronização: ' + (response.error || 'Erro desconhecido'));
    }
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    showMessage('Erro na sincronização: ' + error.message);
  } finally {
    syncBtn.disabled = false;
    syncBtn.textContent = '📤 Sincronizar Leads';
  }
}

// Limpar histórico
async function clearHistory() {
  if (!confirm('Tem certeza que deseja limpar todo o histórico de leads?')) {
    return;
  }
  
  try {
    clearBtn.disabled = true;
    clearBtn.textContent = '🗑️ Limpando...';
    
    const response = await chrome.runtime.sendMessage({ type: 'CLEAR_LEADS' });
    
    if (response.success) {
      showMessage('✅ Histórico limpo com sucesso!', 'success');
      loadData(); // Recarregar dados
    } else {
      showMessage('Erro ao limpar histórico: ' + (response.error || 'Erro desconhecido'));
    }
    
  } catch (error) {
    console.error('❌ Erro ao limpar histórico:', error);
    showMessage('Erro ao limpar histórico: ' + error.message);
  } finally {
    clearBtn.disabled = false;
    clearBtn.textContent = '🗑️ Limpar Histórico';
  }
}

// Forçar exportação manual
async function forceExport() {
  try {
    exportBtn.disabled = true;
    exportBtn.textContent = '📥 Exportando...';
    
    // Buscar aba do RocketZap contacts
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
        await chrome.tabs.update(rocketTabs[0].id, {
          url: 'https://app.rocketzap.com.br/contacts'
        });
        contactsTab = rocketTabs[0];
        
        // Aguardar página carregar
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        showMessage('Abra o RocketZap primeiro para exportar leads');
        return;
      }
    }
    
    // Executar clique no botão exportar
    const result = await chrome.scripting.executeScript({
      target: { tabId: contactsTab.id },
      func: () => {
        // Buscar botão Exportar
        const buttons = document.querySelectorAll('button');
        for (const button of buttons) {
          if (button.textContent && button.textContent.toLowerCase().includes('exportar')) {
            button.click();
            return true;
          }
        }
        return false;
      }
    });
    
    if (result[0].result) {
      showMessage('✅ Exportação iniciada! Aguarde o processamento...', 'success');
    } else {
      showMessage('❌ Botão Exportar não encontrado na página');
    }
    
  } catch (error) {
    console.error('❌ Erro na exportação:', error);
    showMessage('Erro na exportação: ' + error.message);
  } finally {
    exportBtn.disabled = false;
    exportBtn.textContent = '📥 Exportar Agora';
  }
}

// Event listeners
exportBtn.addEventListener('click', forceExport);
syncBtn.addEventListener('click', syncLeads);
refreshBtn.addEventListener('click', loadData);
clearBtn.addEventListener('click', clearHistory);

// Listener para atualizações do background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'STATS_UPDATED') {
    updateStats(message.stats);
  } else if (message.type === 'LEAD_PROCESSED') {
    // Adicionar novo lead à lista
    currentStats.totalLeads++;
    totalLeads.textContent = currentStats.totalLeads;
    
    // Atualizar leads recentes
    loadData();
    
    showMessage(`📱 Novo lead: ${formatPhone(message.lead.phone)}`, 'success');
  } else if (message.type === 'XLS_PROCESSED') {
    // XLS processado automaticamente
    showMessage(`📊 XLS processado: ${message.newLeads} novos de ${message.totalLeads} total`, 'success');
    loadData(); // Recarregar dados
  }
});

// Atualizar periodicamente
setInterval(loadData, 10000); // A cada 10 segundos

// Carregar dados iniciais
document.addEventListener('DOMContentLoaded', loadData);

console.log('✅ Popup configurado');