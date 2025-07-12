// Background script for Facebook Ad Manager Data Checker
class FacebookAdCheckerBackground {
    constructor() {
        this.setupEventListeners();
        this.initializeExtension();
    }
    
    setupEventListeners() {
        // Handle installation
        chrome.runtime.onInstalled.addListener(() => {
            console.log('Facebook Ad Manager Data Checker installed');
            this.initializeDefaultSettings();
        });
        
        // Handle extension icon click
        chrome.action.onClicked.addListener((tab) => {
            this.handleIconClick(tab);
        });
        
        // Handle messages from content script or popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async response
        });
        
        // Handle tab updates to check if we're on Facebook
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                this.checkFacebookTab(tab);
            }
        });
    }
    
    initializeExtension() {
        console.log('Facebook Ad Manager Data Checker background script initialized');
    }
    
    initializeDefaultSettings() {
        chrome.storage.sync.set({
            fbAdCheckerSettings: {
                refreshInterval: 30,
                datePeriod: 'today',
                autoRefresh: true,
                notifications: true,
                exportFormat: 'csv'
            }
        });
    }
    
    handleIconClick(tab) {
        // Check if we're on Facebook and show appropriate message
        if (tab.url.includes('facebook.com') || tab.url.includes('business.facebook.com')) {
            chrome.action.openPopup();
        } else {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'Facebook Ad Manager Data Checker',
                message: 'Navegue até o Facebook Ads Manager para usar esta extensão.'
            });
        }
    }
    
    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'checkPermissions':
                    const hasPermissions = await this.checkPermissions();
                    sendResponse({ hasPermissions });
                    break;
                    
                case 'requestPermissions':
                    const granted = await this.requestPermissions();
                    sendResponse({ granted });
                    break;
                    
                case 'saveData':
                    await this.saveExtractedData(request.data);
                    sendResponse({ success: true });
                    break;
                    
                case 'getData':
                    const data = await this.getStoredData();
                    sendResponse(data);
                    break;
                    
                case 'exportData':
                    await this.exportData(request.data, request.format);
                    sendResponse({ success: true });
                    break;
                    
                default:
                    sendResponse({ error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ error: error.message });
        }
    }
    
    async checkPermissions() {
        return new Promise((resolve) => {
            chrome.permissions.contains({
                permissions: ['activeTab', 'storage'],
                origins: ['https://www.facebook.com/*', 'https://business.facebook.com/*']
            }, resolve);
        });
    }
    
    async requestPermissions() {
        return new Promise((resolve) => {
            chrome.permissions.request({
                permissions: ['activeTab', 'storage'],
                origins: ['https://www.facebook.com/*', 'https://business.facebook.com/*']
            }, resolve);
        });
    }
    
    async saveExtractedData(data) {
        const timestamp = new Date().toISOString();
        const storageKey = `fbAdData_${timestamp}`;
        
        // Save current data
        await chrome.storage.local.set({
            [storageKey]: data,
            lastUpdate: timestamp
        });
        
        // Keep only last 30 days of data
        this.cleanupOldData();
    }
    
    async getStoredData() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['lastUpdate', 'fbAdData'], (result) => {
                resolve(result);
            });
        });
    }
    
    async cleanupOldData() {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        chrome.storage.local.get(null, (items) => {
            Object.keys(items).forEach(key => {
                if (key.startsWith('fbAdData_')) {
                    const timestamp = key.replace('fbAdData_', '');
                    const date = new Date(timestamp);
                    
                    if (date < thirtyDaysAgo) {
                        chrome.storage.local.remove(key);
                    }
                }
            });
        });
    }
    
    checkFacebookTab(tab) {
        if (tab.url.includes('facebook.com') || tab.url.includes('business.facebook.com')) {
            // Update extension icon to show it's active
            chrome.action.setBadgeText({
                tabId: tab.id,
                text: '●'
            });
            
            chrome.action.setBadgeBackgroundColor({
                tabId: tab.id,
                color: '#10b981'
            });
        } else {
            // Clear badge for non-Facebook tabs
            chrome.action.setBadgeText({
                tabId: tab.id,
                text: ''
            });
        }
    }
    
    async exportData(data, format) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `facebook-ads-export-${timestamp}.${format}`;
        
        let content, mimeType;
        
        if (format === 'csv') {
            content = this.generateCSV(data);
            mimeType = 'text/csv';
        } else if (format === 'json') {
            content = JSON.stringify(data, null, 2);
            mimeType = 'application/json';
        } else if (format === 'xlsx') {
            // For Excel export, we'd need a library like xlsx
            // For now, fall back to CSV
            content = this.generateCSV(data);
            mimeType = 'text/csv';
        }
        
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        chrome.downloads.download({
            url: url,
            filename: filename,
            saveAs: true
        });
        
        // Show notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Exportação Concluída',
            message: `Dados exportados para ${filename}`
        });
    }
    
    generateCSV(data) {
        const headers = ['Timestamp', 'Campanhas', 'Anúncios', 'Gasto', 'Impressões', 'Cliques', 'CTR'];
        let csv = headers.join(',') + '\n';
        
        if (Array.isArray(data)) {
            data.forEach(row => {
                const values = [
                    row.timestamp || '',
                    row.campaigns || 0,
                    row.ads || 0,
                    `R$ ${(row.spent || 0).toFixed(2)}`,
                    row.impressions || 0,
                    row.clicks || 0,
                    `${(row.ctr || 0).toFixed(2)}%`
                ];
                csv += values.join(',') + '\n';
            });
        } else {
            // Single data object
            const values = [
                data.timestamp || new Date().toISOString(),
                data.campaigns || 0,
                data.ads || 0,
                `R$ ${(data.spent || 0).toFixed(2)}`,
                data.impressions || 0,
                data.clicks || 0,
                `${(data.ctr || 0).toFixed(2)}%`
            ];
            csv += values.join(',') + '\n';
        }
        
        return csv;
    }
}

// Initialize the background script
new FacebookAdCheckerBackground();