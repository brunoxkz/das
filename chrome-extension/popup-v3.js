/**
 * POPUP DA EXTENSÃO V3 - SISTEMA LOCAL DE CAMPANHAS
 * 
 * Gerencia interface do usuário para campanhas locais
 * Sync inteligente com servidor Vendzz
 */

class PopupManager {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.loadData();
  }

  initializeElements() {
    this.statusDot = document.getElementById('statusDot');
    this.statusText = document.getElementById('statusText');
    this.campaignsCount = document.getElementById('campaignsCount');
    this.messagesToday = document.getElementById('messagesToday');
    this.leadsToday = document.getElementById('leadsToday');
    this.lastSync = document.getElementById('lastSync');
    this.campaignsList = document.getElementById('campaignsList');
    this.syncBtn = document.getElementById('syncBtn');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.openDashboard = document.getElementById('openDashboard');
    this.helpBtn = document.getElementById('helpBtn');
  }

  bindEvents() {
    this.syncBtn.addEventListener('click', () => this.syncWithServer());
    this.settingsBtn.addEventListener('click', () => this.openSettings());
    this.openDashboard.addEventListener('click', () => this.openDashboardPage());
    this.helpBtn.addEventListener('click', () => this.showHelp());
  }

  async loadData() {
    try {
      // Verificar se estamos no WhatsApp
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url && tab.url.includes('web.whatsapp.com')) {
        this.updateStatus('online', 'WhatsApp conectado');
        
        // Carregar dados das campanhas locais
        const campaigns = await this.getLocalCampaigns();
        const dailyStats = await this.getDailyStats();
        
        this.updateStats(campaigns, dailyStats);
        this.renderCampaigns(campaigns);
      } else {
        this.updateStatus('offline', 'Abra o WhatsApp Web');
        this.showOfflineMessage();
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.updateStatus('offline', 'Erro de conexão');
    }
  }

  updateStatus(status, text) {
    this.statusText.textContent = text;
    this.statusDot.className = `status-dot ${status === 'offline' ? 'offline' : ''}`;
  }

  async getLocalCampaigns() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['vendzz_campaigns'], (result) => {
        const campaigns = result.vendzz_campaigns || [];
        resolve(campaigns);
      });
    });
  }

  async getDailyStats() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['vendzz_daily_stats'], (result) => {
        const today = new Date().toDateString();
        const stats = result.vendzz_daily_stats || {};
        
        if (stats.date === today) {
          resolve(stats);
        } else {
          // Reset para novo dia
          const newStats = {
            date: today,
            messagesSent: 0,
            leadsCapturados: 0,
            campaignsProcessed: 0
          };
          resolve(newStats);
        }
      });
    });
  }

  updateStats(campaigns, dailyStats) {
    this.campaignsCount.textContent = campaigns.filter(c => c.isActive).length;
    this.messagesToday.textContent = dailyStats.messagesSent || 0;
    this.leadsToday.textContent = dailyStats.leadsCapturados || 0;
    
    // Calcular último sync
    const lastSyncTimes = campaigns.map(c => c.stats?.lastSync || 0);
    const mostRecentSync = Math.max(...lastSyncTimes, 0);
    
    if (mostRecentSync > 0) {
      const timeDiff = Date.now() - mostRecentSync;
      this.lastSync.textContent = this.formatTimeAgo(timeDiff);
    } else {
      this.lastSync.textContent = 'Nunca';
    }
  }

  renderCampaigns(campaigns) {
    if (campaigns.length === 0) {
      this.campaignsList.innerHTML = `
        <div class="empty-state">
          Nenhuma campanha local encontrada.<br>
          Configure campanhas no dashboard.
        </div>
      `;
      return;
    }

    const campaignsHtml = campaigns.map(campaign => `
      <div class="campaign-item">
        <div>
          <div class="campaign-name">${campaign.name}</div>
          <div style="font-size: 12px; opacity: 0.7;">
            ${campaign.stats?.sent || 0} enviados | ${campaign.stats?.failed || 0} falharam
          </div>
        </div>
        <div class="campaign-status ${campaign.isActive ? 'active' : 'paused'}">
          ${campaign.isActive ? 'Ativa' : 'Pausada'}
        </div>
      </div>
    `).join('');

    this.campaignsList.innerHTML = campaignsHtml;
  }

  showOfflineMessage() {
    this.campaignsList.innerHTML = `
      <div class="empty-state">
        Para usar o sistema de campanhas,<br>
        abra o WhatsApp Web primeiro.
      </div>
    `;
  }

  async syncWithServer() {
    this.syncBtn.textContent = '⏳ Sincronizando...';
    this.syncBtn.disabled = true;

    try {
      // Buscar campanhas locais
      const campaigns = await this.getLocalCampaigns();
      let totalLeadsSynced = 0;

      for (const campaign of campaigns) {
        if (campaign.leads && campaign.leads.length > 0) {
          // Sync apenas campanhas com leads novos
          const response = await fetch(`${this.getServerUrl()}/api/extension/sync-leads`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await this.getAuthToken()}`
            },
            body: JSON.stringify({
              campaignId: campaign.id,
              leads: campaign.leads,
              extensionStats: campaign.stats
            })
          });

          if (response.ok) {
            const result = await response.json();
            totalLeadsSynced += result.leadsSaved || 0;
            
            // Limpar leads locais após sync
            campaign.leads = [];
            campaign.stats.lastSync = Date.now();
          }
        }
      }

      // Salvar campanhas atualizadas
      chrome.storage.local.set({ vendzz_campaigns: campaigns });

      // Mostrar resultado
      this.showSyncResult(totalLeadsSynced);
      
      // Recarregar dados
      await this.loadData();

    } catch (error) {
      console.error('Erro no sync:', error);
      this.showSyncError();
    } finally {
      this.syncBtn.textContent = '🔄 Sincronizar';
      this.syncBtn.disabled = false;
    }
  }

  showSyncResult(leadsSynced) {
    // Mostrar toast temporário
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #10B981;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    toast.textContent = `✅ ${leadsSynced} leads sincronizados com sucesso`;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  showSyncError() {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #EF4444;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    toast.textContent = '❌ Erro na sincronização';
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  openSettings() {
    // Abrir página de configurações no dashboard
    chrome.tabs.create({
      url: `${this.getServerUrl()}/settings`
    });
  }

  openDashboardPage() {
    // Abrir dashboard principal
    chrome.tabs.create({
      url: `${this.getServerUrl()}/dashboard`
    });
  }

  showHelp() {
    // Abrir documentação
    chrome.tabs.create({
      url: `${this.getServerUrl()}/help/extension`
    });
  }

  getServerUrl() {
    // Em produção seria configurável
    return 'https://vendzz.replit.app';
  }

  async getAuthToken() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['vendzz_auth_token'], (result) => {
        resolve(result.vendzz_auth_token || '');
      });
    });
  }

  formatTimeAgo(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h atrás`;
    } else if (minutes > 0) {
      return `${minutes}m atrás`;
    } else {
      return `${seconds}s atrás`;
    }
  }
}

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});

// Atualizar dados a cada 30 segundos se popup estiver aberto
setInterval(() => {
  if (document.visibilityState === 'visible') {
    new PopupManager().loadData();
  }
}, 30000);