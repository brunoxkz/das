
// Vendzz WhatsApp Remarketing Extension - Content Script
console.log('🟢 Vendzz WhatsApp Extension Loaded');

class VendzzWhatsAppBot {
  constructor() {
    this.isConnected = false;
    this.messageQueue = [];
    this.sendingInProgress = false;
    this.apiUrl = 'https://vendzz.com.br/api'; // URL da API do Vendzz
    this.retryAttempts = 3;
    this.sendDelay = 5000; // 5 segundos entre mensagens
    
    this.init();
  }

  async init() {
    console.log('🔄 Inicializando Vendzz WhatsApp Bot...');
    
    // Aguardar WhatsApp carregar completamente
    await this.waitForWhatsApp();
    
    // Conectar com o sistema Vendzz
    await this.connectToVendzz();
    
    // Iniciar monitoramento
    this.startMonitoring();
    
    console.log('✅ Vendzz WhatsApp Bot iniciado com sucesso!');
  }

  async waitForWhatsApp() {
    return new Promise((resolve) => {
      const checkWhatsApp = () => {
        const chatList = document.querySelector('[data-tab="3"]');
        const searchBox = document.querySelector('div[contenteditable="true"][data-tab="3"]');
        
        if (chatList && searchBox) {
          console.log('✅ WhatsApp carregado');
          resolve();
        } else {
          console.log('⏳ Aguardando WhatsApp carregar...');
          setTimeout(checkWhatsApp, 2000);
        }
      };
      checkWhatsApp();
    });
  }

  async connectToVendzz() {
    try {
      // Simular conexão com API
      this.isConnected = true;
      
      // Notificar status para o Vendzz
      chrome.runtime.sendMessage({
        type: 'STATUS_UPDATE',
        data: {
          isConnected: true,
          phoneNumber: this.getPhoneNumber(),
          whatsappVersion: this.getWhatsAppVersion()
        }
      });
      
      console.log('🔗 Conectado ao sistema Vendzz');
    } catch (error) {
      console.error('❌ Erro ao conectar com Vendzz:', error);
    }
  }

  startMonitoring() {
    // Escutar mensagens do sistema Vendzz
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'SEND_MESSAGE':
          this.addToQueue(message.data);
          break;
        case 'GET_STATUS':
          sendResponse({
            isConnected: this.isConnected,
            queueLength: this.messageQueue.length,
            sendingInProgress: this.sendingInProgress
          });
          break;
      }
    });

    // Processar fila de mensagens
    setInterval(() => {
      this.processQueue();
    }, this.sendDelay);

    console.log('👁️ Monitoramento iniciado');
  }

  addToQueue(messageData) {
    this.messageQueue.push(messageData);
    console.log(`📝 Mensagem adicionada à fila. Total: ${this.messageQueue.length}`);
  }

  async processQueue() {
    if (this.sendingInProgress || this.messageQueue.length === 0) {
      return;
    }

    this.sendingInProgress = true;
    const messageData = this.messageQueue.shift();

    try {
      await this.sendMessage(messageData);
      console.log('✅ Mensagem enviada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      
      // Tentar novamente se ainda há tentativas
      if (messageData.retries < this.retryAttempts) {
        messageData.retries = (messageData.retries || 0) + 1;
        this.messageQueue.unshift(messageData); // Volta para início da fila
      }
    }

    this.sendingInProgress = false;
  }

  async sendMessage(messageData) {
    const { phone, message, campaignId } = messageData;
    
    console.log(`📤 Enviando mensagem para ${phone}`);

    // Limpar número de telefone
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Abrir conversa
    await this.openChat(cleanPhone);
    
    // Enviar mensagem
    await this.typeAndSend(message);
    
    // Notificar sucesso para o Vendzz
    chrome.runtime.sendMessage({
      type: 'MESSAGE_SENT',
      data: {
        campaignId,
        phone,
        status: 'sent',
        timestamp: new Date().toISOString()
      }
    });
  }

  async openChat(phone) {
    return new Promise((resolve, reject) => {
      // URL para abrir chat direto
      const chatUrl = `https://web.whatsapp.com/send?phone=${phone}`;
      
      // Criar link temporário
      const link = document.createElement('a');
      link.href = chatUrl;
      link.target = '_blank';
      link.click();
      
      // Aguardar chat carregar
      setTimeout(() => {
        const messageBox = document.querySelector('div[contenteditable="true"][data-tab="1"]');
        if (messageBox) {
          resolve();
        } else {
          reject(new Error('Não foi possível abrir o chat'));
        }
      }, 3000);
    });
  }

  async typeAndSend(message) {
    return new Promise((resolve, reject) => {
      const messageBox = document.querySelector('div[contenteditable="true"][data-tab="1"]');
      
      if (!messageBox) {
        reject(new Error('Caixa de mensagem não encontrada'));
        return;
      }

      // Digitar mensagem
      messageBox.focus();
      messageBox.textContent = message;
      
      // Disparar eventos necessários
      const inputEvent = new Event('input', { bubbles: true });
      messageBox.dispatchEvent(inputEvent);

      // Aguardar um pouco antes de enviar
      setTimeout(() => {
        // Encontrar botão de envio
        const sendButton = document.querySelector('span[data-icon="send"]').closest('button');
        
        if (sendButton && !sendButton.disabled) {
          sendButton.click();
          resolve();
        } else {
          reject(new Error('Botão de envio não encontrado ou desabilitado'));
        }
      }, 1000);
    });
  }

  getPhoneNumber() {
    // Tentar extrair número do WhatsApp Web
    const profileElement = document.querySelector('span[title*="+"]');
    return profileElement ? profileElement.title : 'Não identificado';
  }

  getWhatsAppVersion() {
    // Tentar extrair versão do WhatsApp
    const metaTag = document.querySelector('meta[name="version"]');
    return metaTag ? metaTag.content : '2.2.24.18';
  }
}

// Inicializar bot quando página carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new VendzzWhatsAppBot();
  });
} else {
  new VendzzWhatsAppBot();
}

// Evitar múltiplas instâncias
window.vendzzWhatsAppBot = window.vendzzWhatsAppBot || new VendzzWhatsAppBot();
