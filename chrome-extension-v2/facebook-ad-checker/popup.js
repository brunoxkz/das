class FacebookAdChecker {
    constructor() {
        this.isConnected = false;
        this.adData = {
            campaigns: 0,
            ads: 0,
            spent: 0,
            impressions: 0,
            clicks: 0,
            ctr: 0
        };
        this.logs = [];
        this.autoRefreshInterval = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadSettings();
        this.checkConnection();
    }
    
    initializeElements() {
        this.statusElement = document.getElementById('connectionStatus');
        this.statusText = document.getElementById('statusText');
        this.checkAdsBtn = document.getElementById('checkAdsBtn');
        this.scanCampaignsBtn = document.getElementById('scanCampaignsBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.dataSection = document.getElementById('dataSection');
        this.logContainer = document.getElementById('logContainer');
        this.exportCsvBtn = document.getElementById('exportCsvBtn');
        this.exportJsonBtn = document.getElementById('exportJsonBtn');
        
        // Data elements
        this.activeCampaignsSpan = document.getElementById('activeCampaigns');
        this.activeAdsSpan = document.getElementById('activeAds');
        this.totalSpentSpan = document.getElementById('totalSpent');
        this.totalImpressionsSpan = document.getElementById('totalImpressions');
        this.totalClicksSpan = document.getElementById('totalClicks');
        this.ctrSpan = document.getElementById('ctr');
        
        // Settings
        this.refreshIntervalInput = document.getElementById('refreshInterval');
        this.datePeriodSelect = document.getElementById('datePeriod');
        this.autoRefreshCheckbox = document.getElementById('autoRefresh');
    }
    
    setupEventListeners() {
        this.checkAdsBtn.addEventListener('click', () => this.checkAds());
        this.scanCampaignsBtn.addEventListener('click', () => this.scanCampaigns());
        this.refreshBtn.addEventListener('click', () => this.refreshData());
        this.exportCsvBtn.addEventListener('click', () => this.exportData('csv'));
        this.exportJsonBtn.addEventListener('click', () => this.exportData('json'));
        
        this.refreshIntervalInput.addEventListener('change', () => this.updateSettings());
        this.datePeriodSelect.addEventListener('change', () => this.updateSettings());
        this.autoRefreshCheckbox.addEventListener('change', () => this.updateSettings());
    }
    
    async checkConnection() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];
            
            if (tab.url.includes('facebook.com') || tab.url.includes('business.facebook.com')) {
                this.isConnected = true;
                this.statusElement.className = 'status connected';
                this.statusText.textContent = 'Conectado ao Facebook';
                this.enableControls();
            } else {
                this.isConnected = false;
                this.statusElement.className = 'status disconnected';
                this.statusText.textContent = 'Não está no Facebook Ads Manager';
                this.disableControls();
            }
        } catch (error) {
            this.addLog('Erro ao verificar conexão: ' + error.message);
        }
    }
    
    enableControls() {
        this.checkAdsBtn.disabled = false;
        this.scanCampaignsBtn.disabled = false;
        this.refreshBtn.disabled = false;
    }
    
    disableControls() {
        this.checkAdsBtn.disabled = true;
        this.scanCampaignsBtn.disabled = true;
        this.refreshBtn.disabled = true;
    }
    
    async checkAds() {
        if (!this.isConnected) return;
        
        this.addLog('Verificando anúncios...');
        
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const results = await chrome.tabs.sendMessage(tabs[0].id, { 
                action: 'checkAds',
                period: this.datePeriodSelect.value
            });
            
            if (results) {
                this.adData = results;
                this.updateDataDisplay();
                this.addLog('Dados de anúncios atualizados');
                this.dataSection.style.display = 'block';
            }
        } catch (error) {
            this.addLog('Erro ao verificar anúncios: ' + error.message);
        }
    }
    
    async scanCampaigns() {
        if (!this.isConnected) return;
        
        this.addLog('Escaneando campanhas...');
        
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const results = await chrome.tabs.sendMessage(tabs[0].id, { 
                action: 'scanCampaigns',
                period: this.datePeriodSelect.value
            });
            
            if (results) {
                this.adData.campaigns = results.campaigns || 0;
                this.updateDataDisplay();
                this.addLog(`Encontradas ${results.campaigns} campanhas`);
                this.dataSection.style.display = 'block';
            }
        } catch (error) {
            this.addLog('Erro ao escanear campanhas: ' + error.message);
        }
    }
    
    async refreshData() {
        if (!this.isConnected) return;
        
        this.addLog('Atualizando todos os dados...');
        await this.checkAds();
        await this.scanCampaigns();
        this.addLog('Dados atualizados com sucesso');
    }
    
    updateDataDisplay() {
        this.activeCampaignsSpan.textContent = this.adData.campaigns;
        this.activeAdsSpan.textContent = this.adData.ads;
        this.totalSpentSpan.textContent = `R$ ${this.adData.spent.toFixed(2)}`;
        this.totalImpressionsSpan.textContent = this.adData.impressions.toLocaleString();
        this.totalClicksSpan.textContent = this.adData.clicks.toLocaleString();
        this.ctrSpan.textContent = `${this.adData.ctr.toFixed(2)}%`;
    }
    
    exportData(format) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `facebook-ads-data-${timestamp}.${format}`;
        
        let content, mimeType;
        
        if (format === 'csv') {
            content = this.generateCSV();
            mimeType = 'text/csv';
        } else if (format === 'json') {
            content = JSON.stringify({
                timestamp: new Date().toISOString(),
                period: this.datePeriodSelect.value,
                data: this.adData,
                logs: this.logs
            }, null, 2);
            mimeType = 'application/json';
        }
        
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        chrome.downloads.download({
            url: url,
            filename: filename
        });
        
        this.addLog(`Dados exportados: ${filename}`);
    }
    
    generateCSV() {
        const headers = ['Métrica', 'Valor'];
        const rows = [
            ['Campanhas Ativas', this.adData.campaigns],
            ['Anúncios Ativos', this.adData.ads],
            ['Gasto Total', `R$ ${this.adData.spent.toFixed(2)}`],
            ['Impressões', this.adData.impressions],
            ['Cliques', this.adData.clicks],
            ['CTR', `${this.adData.ctr.toFixed(2)}%`]
        ];
        
        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.join(',') + '\n';
        });
        
        return csv;
    }
    
    addLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = { timestamp, message };
        this.logs.push(logEntry);
        
        // Keep only last 50 logs
        if (this.logs.length > 50) {
            this.logs.shift();
        }
        
        this.updateLogDisplay();
    }
    
    updateLogDisplay() {
        this.logContainer.innerHTML = '';
        
        this.logs.slice(-10).forEach(log => {
            const logElement = document.createElement('div');
            logElement.className = 'log-item';
            logElement.innerHTML = `
                <span class="timestamp">${log.timestamp}</span><br>
                ${log.message}
            `;
            this.logContainer.appendChild(logElement);
        });
        
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }
    
    updateSettings() {
        const settings = {
            refreshInterval: parseInt(this.refreshIntervalInput.value),
            datePeriod: this.datePeriodSelect.value,
            autoRefresh: this.autoRefreshCheckbox.checked
        };
        
        chrome.storage.sync.set({ fbAdCheckerSettings: settings });
        
        // Update auto-refresh
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
        
        if (settings.autoRefresh) {
            this.autoRefreshInterval = setInterval(() => {
                if (this.isConnected) {
                    this.refreshData();
                }
            }, settings.refreshInterval * 1000);
        }
        
        this.addLog('Configurações atualizadas');
    }
    
    loadSettings() {
        chrome.storage.sync.get(['fbAdCheckerSettings'], (result) => {
            if (result.fbAdCheckerSettings) {
                const settings = result.fbAdCheckerSettings;
                this.refreshIntervalInput.value = settings.refreshInterval || 30;
                this.datePeriodSelect.value = settings.datePeriod || 'today';
                this.autoRefreshCheckbox.checked = settings.autoRefresh !== false;
                
                this.updateSettings();
            }
        });
    }
}

// Initialize when popup loads
document.addEventListener('DOMContentLoaded', () => {
    new FacebookAdChecker();
});