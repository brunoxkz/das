
// Vendzz WhatsApp Remarketing Extension - Background Script
console.log('🔧 Vendzz Background Service Worker iniciado');

class VendzzBackgroundService {
  constructor() {
    this.apiUrl = 'https://vendzz.com.br/api';
    this.pollInterval = 30000; // 30 segundos
    this.extensionStatus = {
      isConnected: false,
      lastPoll: null,
      messagesProcessed: 0
    };
    
    this.init();
  }

  init() {
    // Configurar listeners
    chrome.runtime.onInstalled.addListener(() => {
      console.log('✅ Extensão Vendzz instalada');
      this.showInstallNotification();
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Indica resposta assíncrona
    });

    // Iniciar polling para campanhas
    this.startPolling();
  }

  showInstallNotification() {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Vendzz WhatsApp Bot',
      message: 'Extensão instalada! Abra o WhatsApp Web para começar.'
    });
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'STATUS_UPDATE':
        this.extensionStatus = { ...this.extensionStatus, ...message.data };
        await this.updateVendzzStatus(message.data);
        sendResponse({ success: true });
        break;

      case 'MESSAGE_SENT':
        await this.reportMessageSent(message.data);
        this.extensionStatus.messagesProcessed++;
        sendResponse({ success: true });
        break;

      case 'GET_EXTENSION_STATUS':
        sendResponse(this.extensionStatus);
        break;
    }
  }

  async startPolling() {
    console.log('🔄 Iniciando polling para campanhas...');
    
    setInterval(async () => {
      try {
        await this.checkForCampaigns();
        this.extensionStatus.lastPoll = new Date().toISOString();
      } catch (error) {
        console.error('❌ Erro no polling:', error);
      }
    }, this.pollInterval);
  }

  async checkForCampaigns() {
    try {
      // Buscar campanhas ativas
      const response = await fetch(`${this.apiUrl}/whatsapp-campaigns/pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Adicionar headers de autenticação se necessário
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar campanhas');
      }

      const campaigns = await response.json();
      
      if (campaigns.length > 0) {
        console.log(`📨 ${campaigns.length} campanhas encontradas`);
        await this.processCampaigns(campaigns);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar campanhas:', error);
    }
  }

  async processCampaigns(campaigns) {
    for (const campaign of campaigns) {
      try {
        // Buscar leads da campanha
        const leads = await this.getCampaignLeads(campaign.id);
        
        // Enviar mensagens para cada lead
        for (const lead of leads) {
          const messageData = {
            phone: lead.phone,
            message: this.personalizeMessage(campaign.message, lead),
            campaignId: campaign.id,
            leadId: lead.id
          };

          // Enviar para content script
          await this.sendToContentScript(messageData);
        }
      } catch (error) {
        console.error(`❌ Erro ao processar campanha ${campaign.id}:`, error);
      }
    }
  }

  async getCampaignLeads(campaignId) {
    try {
      const response = await fetch(`${this.apiUrl}/whatsapp-campaigns/${campaignId}/leads`);
      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao buscar leads:', error);
      return [];
    }
  }

  personalizeMessage(template, lead) {
    let message = template;
    
    // Substituir variáveis
    const variables = {
      'nome': lead.name || 'amigo(a)',
      'resultado': lead.result || 'resultado',
      'pontuacao': lead.score || '0',
      'email': lead.email || '',
      'telefone': lead.phone || ''
    };

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'gi');
      message = message.replace(regex, value);
    }

    return message;
  }

  async sendToContentScript(messageData) {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (tabs) => {
        if (tabs.length === 0) {
          reject(new Error('WhatsApp Web não está aberto'));
          return;
        }

        const tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, {
          type: 'SEND_MESSAGE',
          data: messageData
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });
    });
  }

  async updateVendzzStatus(statusData) {
    try {
      await fetch(`${this.apiUrl}/whatsapp-extension/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(statusData)
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
    }
  }

  async reportMessageSent(messageData) {
    try {
      await fetch(`${this.apiUrl}/whatsapp-campaigns/message-sent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });
    } catch (error) {
      console.error('❌ Erro ao reportar mensagem enviada:', error);
    }
  }
}

// Inicializar service worker
new VendzzBackgroundService();
