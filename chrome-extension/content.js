// Vendzz WhatsApp Content Script
console.log('📱 Vendzz WhatsApp Content Script carregado');

// Estado do content script
let isProcessing = false;
let messageQueue = [];

// Função para aguardar elemento aparecer
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Elemento ${selector} não encontrado em ${timeout}ms`));
    }, timeout);
  });
}

// Função para aguardar um tempo
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para buscar contato
async function searchContact(phone) {
  try {
    console.log(`🔍 Buscando contato: ${phone}`);

    // Clicar no botão de nova conversa
    const newChatButton = await waitForElement('[data-testid="chat"]', 5000);
    if (!newChatButton) {
      throw new Error('Botão de nova conversa não encontrado');
    }
    
    newChatButton.click();
    await sleep(1000);

    // Buscar campo de pesquisa
    const searchBox = await waitForElement('[data-testid="chat-list-search"]', 5000);
    if (!searchBox) {
      throw new Error('Campo de pesquisa não encontrado');
    }

    // Limpar e inserir número
    searchBox.focus();
    searchBox.value = '';
    searchBox.dispatchEvent(new Event('input', { bubbles: true }));
    
    await sleep(500);
    
    // Digitar número character por character
    for (let char of phone) {
      searchBox.value += char;
      searchBox.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(50);
    }

    await sleep(1000);

    // Procurar pelo contato ou opção de enviar mensagem
    const contactOptions = [
      `[title*="${phone}"]`,
      `[data-testid*="cell-frame-title"][title*="${phone}"]`,
      '[data-testid="chat-list-item"]',
      '.copyable-text'
    ];

    let contactElement = null;
    for (const selector of contactOptions) {
      contactElement = document.querySelector(selector);
      if (contactElement) break;
    }

    if (!contactElement) {
      throw new Error(`Contato ${phone} não encontrado`);
    }

    contactElement.click();
    await sleep(1500);

    return true;
  } catch (error) {
    console.error(`❌ Erro ao buscar contato ${phone}:`, error);
    return false;
  }
}

// Função para enviar mensagem
async function sendMessage(phone, message, logId) {
  try {
    console.log(`📤 Enviando mensagem para ${phone}: ${message.substring(0, 50)}...`);

    // Buscar contato
    const contactFound = await searchContact(phone);
    if (!contactFound) {
      throw new Error('Contato não encontrado');
    }

    // Aguardar campo de mensagem aparecer
    const messageBox = await waitForElement('[data-testid="conversation-compose-box-input"]', 5000);
    if (!messageBox) {
      throw new Error('Campo de mensagem não encontrado');
    }

    // Focar no campo de mensagem
    messageBox.focus();
    await sleep(300);

    // Limpar campo
    messageBox.innerHTML = '';
    
    // Inserir texto linha por linha para quebras de linha
    const lines = message.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const textNode = document.createTextNode(lines[i]);
      messageBox.appendChild(textNode);
      
      if (i < lines.length - 1) {
        // Adicionar quebra de linha
        messageBox.appendChild(document.createElement('br'));
      }
    }

    // Disparar eventos de input
    messageBox.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(500);

    // Buscar botão de enviar
    const sendButton = await waitForElement('[data-testid="send"]', 3000);
    if (!sendButton) {
      throw new Error('Botão de enviar não encontrado');
    }

    // Enviar mensagem
    sendButton.click();
    await sleep(1000);

    console.log(`✅ Mensagem enviada para ${phone}`);

    // Notificar background script
    chrome.runtime.sendMessage({
      action: 'MESSAGE_SENT',
      logId: logId,
      phone: phone
    });

    return true;
  } catch (error) {
    console.error(`❌ Erro ao enviar mensagem para ${phone}:`, error);

    // Notificar erro
    chrome.runtime.sendMessage({
      action: 'MESSAGE_FAILED',
      logId: logId,
      phone: phone,
      error: error.message
    });

    return false;
  }
}

// Função para processar fila de mensagens
async function processMessageQueue() {
  if (isProcessing || messageQueue.length === 0) {
    return;
  }

  isProcessing = true;
  console.log(`📋 Processando ${messageQueue.length} mensagens na fila`);

  try {
    while (messageQueue.length > 0) {
      const messageData = messageQueue.shift();
      
      await sendMessage(
        messageData.phone,
        messageData.message,
        messageData.logId
      );

      // Delay entre mensagens para evitar spam
      const delay = Math.random() * 3000 + 2000; // 2-5 segundos
      await sleep(delay);
    }
  } catch (error) {
    console.error('❌ Erro no processamento da fila:', error);
  } finally {
    isProcessing = false;
  }
}

// Função para verificar se WhatsApp está carregado
function isWhatsAppLoaded() {
  // Múltiplas verificações para melhor detecção
  const chatList = document.querySelector('[data-testid="chat-list"]');
  const searchInput = document.querySelector('[data-testid="chat-list-search"]');
  const mainPanel = document.querySelector('[data-testid="main"]');
  const leftPanel = document.querySelector('#side');
  
  // WhatsApp está carregado se encontrar qualquer um destes elementos
  return chatList !== null || searchInput !== null || mainPanel !== null || leftPanel !== null;
}

// Aguardar WhatsApp carregar completamente
async function waitForWhatsAppLoad() {
  console.log('⏳ Aguardando WhatsApp carregar...');
  
  const selectors = [
    '[data-testid="chat-list"]',
    '[data-testid="chat-list-search"]', 
    '[data-testid="main"]',
    '#side'
  ];
  
  for (const selector of selectors) {
    try {
      await waitForElement(selector, 10000);
      console.log(`✅ WhatsApp carregado com sucesso (detectado: ${selector})`);
      return true;
    } catch (error) {
      console.log(`⏳ Tentando próximo seletor...`);
    }
  }
  
  console.error('❌ WhatsApp não carregou com nenhum seletor');
  return false;
}

// Listener para mensagens do background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Mensagem do background:', message);

  switch (message.action) {
    case 'SEND_MESSAGES':
      if (!isWhatsAppLoaded()) {
        console.log('⚠️ WhatsApp ainda não está carregado');
        return;
      }

      // Adicionar mensagens à fila
      messageQueue.push(...message.messages);
      console.log(`📥 ${message.messages.length} mensagens adicionadas à fila`);

      // Processar fila
      processMessageQueue();
      break;

    case 'GET_STATUS':
      sendResponse({
        isLoaded: isWhatsAppLoaded(),
        queueLength: messageQueue.length,
        isProcessing: isProcessing
      });
      break;
  }
});

// Inicialização do content script
(async function init() {
  console.log('🚀 Inicializando Vendzz WhatsApp Content Script');
  
  // Aguardar WhatsApp carregar
  const loaded = await waitForWhatsAppLoad();
  
  if (loaded) {
    console.log('✅ Vendzz WhatsApp Extension pronta para uso');
    
    // Notificar background script que está pronto
    chrome.runtime.sendMessage({
      action: 'CONTENT_READY'
    });
  } else {
    console.error('❌ Falha ao carregar WhatsApp');
  }
})();

// Detectar mudanças na página
const observer = new MutationObserver((mutations) => {
  // Verificar se houve mudanças significativas que possam indicar carregamento
  const hasSignificantChanges = mutations.some(mutation => 
    mutation.addedNodes.length > 0 && 
    Array.from(mutation.addedNodes).some(node => 
      node.nodeType === Node.ELEMENT_NODE && 
      (node.querySelector && node.querySelector('[data-testid]'))
    )
  );

  if (hasSignificantChanges && isWhatsAppLoaded() && !isProcessing && messageQueue.length > 0) {
    console.log('🔄 Detectada mudança na página, processando fila');
    processMessageQueue();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});