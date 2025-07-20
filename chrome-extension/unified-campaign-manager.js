/**
 * GERENCIADOR UNIFICADO DE CAMPANHAS - TODOS OS 5 TIPOS
 * 
 * Tipos suportados:
 * 1. WhatsApp - Mensagens diretas no WhatsApp Web
 * 2. SMS - Mensagens via Twilio
 * 3. Email - Campanhas via Brevo
 * 4. Telegram - Mensagens via Bot API
 * 5. Voice - Chamadas de voz automatizadas
 */

class UnifiedCampaignManager {
  constructor() {
    this.campaigns = new Map();
    this.campaignTypes = {
      WHATSAPP: 'whatsapp',
      SMS: 'sms', 
      EMAIL: 'email',
      TELEGRAM: 'telegram',
      VOICE: 'voice'
    };
    this.loadAllCampaigns();
  }

  // CARREGAR TODAS AS CAMPANHAS DOS 5 TIPOS
  async loadAllCampaigns() {
    try {
      const storedCampaigns = localStorage.getItem('vendzz_all_campaigns');
      if (storedCampaigns) {
        const campaigns = JSON.parse(storedCampaigns);
        campaigns.forEach(campaign => {
          this.campaigns.set(campaign.id, campaign);
        });
        console.log(`📱 ${campaigns.length} campanhas carregadas (todos os tipos)`);
        this.logCampaignsByType();
      }
    } catch (error) {
      console.error('❌ Erro ao carregar campanhas:', error);
    }
  }

  // LOG DE CAMPANHAS POR TIPO
  logCampaignsByType() {
    const counts = {
      whatsapp: 0,
      sms: 0,
      email: 0,
      telegram: 0,
      voice: 0
    };

    Array.from(this.campaigns.values()).forEach(campaign => {
      if (counts.hasOwnProperty(campaign.type)) {
        counts[campaign.type]++;
      }
    });

    console.log('📊 Campanhas por tipo:', counts);
  }

  // SALVAR TODAS AS CAMPANHAS
  saveAllCampaigns() {
    try {
      const campaigns = Array.from(this.campaigns.values());
      localStorage.setItem('vendzz_all_campaigns', JSON.stringify(campaigns));
      console.log(`💾 ${campaigns.length} campanhas salvas (todos os tipos)`);
    } catch (error) {
      console.error('❌ Erro ao salvar campanhas:', error);
    }
  }

  // ADICIONAR CAMPANHA DE QUALQUER TIPO
  addCampaign(campaignConfig) {
    const campaign = {
      id: campaignConfig.id,
      type: campaignConfig.type, // whatsapp, sms, email, telegram, voice
      name: campaignConfig.name,
      message: campaignConfig.message,
      isActive: campaignConfig.isActive,
      
      // Configurações específicas por tipo
      config: this.getTypeSpecificConfig(campaignConfig),
      
      // Dados locais da extensão
      contacts: [], // telefones, emails, usernames, etc
      processedContacts: new Set(),
      leads: [],
      stats: {
        processed: 0,
        sent: 0,
        failed: 0,
        lastSync: Date.now()
      },
      
      // Estado da campanha
      isRunning: false,
      currentContact: null,
      lastMessageAt: null,
      createdAt: Date.now()
    };
    
    this.campaigns.set(campaign.id, campaign);
    this.saveAllCampaigns();
    
    console.log(`✅ Campanha ${campaign.type.toUpperCase()}: ${campaign.name} adicionada`);
    return campaign;
  }

  // CONFIGURAÇÕES ESPECÍFICAS POR TIPO
  getTypeSpecificConfig(campaignConfig) {
    switch (campaignConfig.type) {
      case this.campaignTypes.WHATSAPP:
        return {
          workingHours: campaignConfig.workingHours,
          messageDelay: campaignConfig.messageDelay,
          antiSpam: campaignConfig.antiSpam,
          mediaUrl: campaignConfig.mediaUrl
        };
        
      case this.campaignTypes.SMS:
        return {
          twilioConfig: campaignConfig.twilioConfig,
          smsDelay: campaignConfig.smsDelay,
          maxLength: campaignConfig.maxLength || 160
        };
        
      case this.campaignTypes.EMAIL:
        return {
          subject: campaignConfig.subject,
          htmlTemplate: campaignConfig.htmlTemplate,
          sendTime: campaignConfig.sendTime,
          replyTo: campaignConfig.replyTo
        };
        
      case this.campaignTypes.TELEGRAM:
        return {
          botToken: campaignConfig.botToken,
          chatType: campaignConfig.chatType, // private, group, channel
          parseMode: campaignConfig.parseMode || 'Markdown'
        };
        
      case this.campaignTypes.VOICE:
        return {
          voiceScript: campaignConfig.voiceScript,
          callDuration: campaignConfig.callDuration,
          retryAttempts: campaignConfig.retryAttempts || 3,
          voiceLanguage: campaignConfig.voiceLanguage || 'pt-BR'
        };
        
      default:
        return {};
    }
  }

  // PROCESSAR CAMPANHA BASEADO NO TIPO
  async processCampaign(campaignId, extractedContacts) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign || !campaign.isActive) {
      console.log(`⏸️ Campanha ${campaignId} inativa ou não encontrada`);
      return;
    }

    console.log(`🔄 Processando ${extractedContacts.length} contatos para campanha ${campaign.type.toUpperCase()}: ${campaign.name}`);
    
    // Filtrar contatos já processados
    const newContacts = extractedContacts.filter(contact => 
      !campaign.processedContacts.has(contact)
    );
    
    if (newContacts.length === 0) {
      console.log(`ℹ️ Todos os contatos já foram processados para ${campaign.name}`);
      return;
    }

    console.log(`📤 ${newContacts.length} novos contatos para processar`);
    
    // Processar baseado no tipo da campanha
    switch (campaign.type) {
      case this.campaignTypes.WHATSAPP:
        await this.processWhatsAppCampaign(campaign, newContacts);
        break;
        
      case this.campaignTypes.SMS:
        await this.processSMSCampaign(campaign, newContacts);
        break;
        
      case this.campaignTypes.EMAIL:
        await this.processEmailCampaign(campaign, newContacts);
        break;
        
      case this.campaignTypes.TELEGRAM:
        await this.processTelegramCampaign(campaign, newContacts);
        break;
        
      case this.campaignTypes.VOICE:
        await this.processVoiceCampaign(campaign, newContacts);
        break;
        
      default:
        console.log(`❌ Tipo de campanha não suportado: ${campaign.type}`);
    }
    
    // Sincronizar com servidor apenas novos leads
    await this.syncWithServer(campaign);
  }

  // PROCESSAR CAMPANHA WHATSAPP
  async processWhatsAppCampaign(campaign, phones) {
    for (const phone of phones) {
      if (!campaign.isActive || !this.isInWorkingHours(campaign.config.workingHours)) {
        console.log(`⏸️ Campanha WhatsApp pausada ou fora do horário`);
        break;
      }

      await this.sendWhatsAppMessage(campaign, phone);
      
      // Delay anti-spam
      const delay = this.calculateDelay(campaign.config.antiSpam);
      await this.sleep(delay);
    }
  }

  // PROCESSAR CAMPANHA SMS
  async processSMSCampaign(campaign, phones) {
    console.log(`📱 Processando ${phones.length} SMS para campanha ${campaign.name}`);
    
    // SMS é processado via servidor, armazenar localmente para sync
    campaign.contacts.push(...phones);
    campaign.stats.processed += phones.length;
    
    // Marcar para sync com servidor
    campaign.needsSync = true;
    this.saveAllCampaigns();
  }

  // PROCESSAR CAMPANHA EMAIL
  async processEmailCampaign(campaign, emails) {
    console.log(`📧 Processando ${emails.length} emails para campanha ${campaign.name}`);
    
    // Email é processado via servidor, armazenar localmente para sync
    campaign.contacts.push(...emails);
    campaign.stats.processed += emails.length;
    
    // Marcar para sync com servidor
    campaign.needsSync = true;
    this.saveAllCampaigns();
  }

  // PROCESSAR CAMPANHA TELEGRAM
  async processTelegramCampaign(campaign, usernames) {
    console.log(`💬 Processando ${usernames.length} Telegram para campanha ${campaign.name}`);
    
    // Telegram é processado via servidor, armazenar localmente para sync
    campaign.contacts.push(...usernames);
    campaign.stats.processed += usernames.length;
    
    // Marcar para sync com servidor
    campaign.needsSync = true;
    this.saveAllCampaigns();
  }

  // PROCESSAR CAMPANHA VOICE
  async processVoiceCampaign(campaign, phones) {
    console.log(`📞 Processando ${phones.length} chamadas para campanha ${campaign.name}`);
    
    // Voice é processado via servidor, armazenar localmente para sync
    campaign.contacts.push(...phones);
    campaign.stats.processed += phones.length;
    
    // Marcar para sync com servidor
    campaign.needsSync = true;
    this.saveAllCampaigns();
  }

  // ENVIAR MENSAGEM WHATSAPP (único tipo processado localmente)
  async sendWhatsAppMessage(campaign, phone) {
    try {
      console.log(`📤 Enviando WhatsApp para ${phone}`);
      
      // Verificar se há input de telefone na página
      const phoneInput = document.querySelector('input[data-testid="chat-list-search"]');
      if (!phoneInput) {
        console.log('❌ Input de busca não encontrado no WhatsApp Web');
        return false;
      }

      // Limpar input e inserir telefone
      phoneInput.value = '';
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Inserir telefone
      phoneInput.value = phone;
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Aguardar carregar conversa
      await this.sleep(2000);
      
      // Procurar input de mensagem
      const messageInput = document.querySelector('div[data-testid="conversation-compose-box-input"]');
      if (!messageInput) {
        console.log('❌ Input de mensagem não encontrado');
        campaign.stats.failed++;
        return false;
      }

      // Inserir mensagem
      messageInput.textContent = campaign.message;
      messageInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Aguardar um pouco
      await this.sleep(1000);
      
      // Encontrar e clicar botão enviar
      const sendButton = document.querySelector('button[data-testid="compose-btn-send"]');
      if (sendButton && !sendButton.disabled) {
        sendButton.click();
        
        campaign.stats.sent++;
        campaign.processedContacts.add(phone);
        
        // Capturar lead se necessário
        this.captureLeadFromConversation(campaign, phone);
        
        console.log(`✅ WhatsApp enviado para ${phone}`);
        return true;
      } else {
        console.log(`❌ Botão enviar não disponível para ${phone}`);
        campaign.stats.failed++;
        return false;
      }
      
    } catch (error) {
      console.error(`❌ Erro ao enviar WhatsApp para ${phone}:`, error);
      campaign.stats.failed++;
      return false;
    }
  }

  // CAPTURAR LEAD DA CONVERSA
  captureLeadFromConversation(campaign, contact) {
    // Simular captura de lead (em produção seria extraído da página)
    const lead = {
      contact: contact,
      campaignId: campaign.id,
      campaignType: campaign.type,
      capturedAt: new Date().toISOString(),
      source: 'extension',
      data: {
        // Dados específicos baseados no tipo
        message: campaign.message,
        response: 'Lead captured via extension'
      }
    };
    
    campaign.leads.push(lead);
    console.log(`📊 Lead capturado de ${contact} para campanha ${campaign.type}`);
  }

  // SINCRONIZAR COM SERVIDOR
  async syncWithServer(campaign) {
    if (campaign.leads.length === 0 && !campaign.needsSync) {
      return; // Nada para sincronizar
    }

    try {
      const response = await fetch(`${this.getServerUrl()}/api/extension/sync-leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          campaignId: campaign.id,
          campaignType: campaign.type,
          leads: campaign.leads,
          contacts: campaign.contacts,
          extensionStats: campaign.stats
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Sync ${campaign.type}: ${result.leadsSaved || 0} leads salvos`);
        
        // Limpar leads locais após sync
        campaign.leads = [];
        campaign.contacts = [];
        campaign.needsSync = false;
        campaign.stats.lastSync = Date.now();
        
        this.saveAllCampaigns();
      }
    } catch (error) {
      console.error(`❌ Erro no sync ${campaign.type}:`, error);
    }
  }

  // OBTER CAMPANHAS POR TIPO
  getCampaignsByType(type) {
    return Array.from(this.campaigns.values()).filter(campaign => campaign.type === type);
  }

  // OBTER ESTATÍSTICAS GERAIS
  getOverallStats() {
    const stats = {
      total: this.campaigns.size,
      byType: {
        whatsapp: 0,
        sms: 0,
        email: 0,
        telegram: 0,
        voice: 0
      },
      totalSent: 0,
      totalFailed: 0,
      totalLeads: 0
    };

    Array.from(this.campaigns.values()).forEach(campaign => {
      if (stats.byType.hasOwnProperty(campaign.type)) {
        stats.byType[campaign.type]++;
      }
      stats.totalSent += campaign.stats.sent;
      stats.totalFailed += campaign.stats.failed;
      stats.totalLeads += campaign.leads.length;
    });

    return stats;
  }

  // UTILITÁRIOS
  isInWorkingHours(workingHours) {
    if (!workingHours) return true;
    
    const now = new Date();
    const currentHour = now.getHours();
    
    return currentHour >= workingHours.start && currentHour <= workingHours.end;
  }

  calculateDelay(antiSpam) {
    if (!antiSpam) return 3000; // Default 3 segundos
    
    const baseDelay = antiSpam.minDelay || 2000;
    const maxDelay = antiSpam.maxDelay || 5000;
    
    return Math.random() * (maxDelay - baseDelay) + baseDelay;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getServerUrl() {
    return 'https://vendzz.replit.app';
  }

  async getAuthToken() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['vendzz_auth_token'], (result) => {
        resolve(result.vendzz_auth_token || '');
      });
    });
  }

  // PAUSAR/RETOMAR CAMPANHA
  toggleCampaign(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (campaign) {
      campaign.isActive = !campaign.isActive;
      campaign.isRunning = false; // Parar execução atual
      this.saveAllCampaigns();
      console.log(`${campaign.isActive ? '▶️' : '⏸️'} Campanha ${campaign.name} ${campaign.isActive ? 'ativada' : 'pausada'}`);
    }
  }

  // REMOVER CAMPANHA
  removeCampaign(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (campaign) {
      this.campaigns.delete(campaignId);
      this.saveAllCampaigns();
      console.log(`🗑️ Campanha ${campaign.name} removida`);
    }
  }
}

// Instância global
window.unifiedCampaignManager = new UnifiedCampaignManager();

console.log('🚀 Sistema Unificado de Campanhas carregado - 5 tipos suportados');
console.log('📊 Tipos: WhatsApp, SMS, Email, Telegram, Voice');