console.log('🚀 RocketZap Lead Extractor iniciado');

// Configurações da extensão
const CONFIG = {
  API_URL: 'http://localhost:5000/api/leads',
  CHECK_INTERVAL: 2000, // Verifica novos leads a cada 2 segundos
  SELECTORS: {
    // Seletores para identificar elementos do chat
    chatContainer: '[data-testid="chat-list"], .chat-list, #chat-list, .conversations',
    chatItem: '.chat-item, .conversation-item, [data-testid="chat"]',
    contactName: '.contact-name, .chat-name, [data-testid="contact-name"]',
    phoneNumber: '.phone-number, .contact-phone, [data-testid="phone"]',
    messageContainer: '.message-container, .chat-messages, [data-testid="messages"]',
    newMessage: '.new-message, .unread, [data-testid="unread"]'
  }
};

// Storage local para evitar duplicatas
let processedLeads = new Set();

// Inicializar storage
async function initStorage() {
  try {
    const result = await chrome.storage.local.get(['processedLeads']);
    if (result.processedLeads) {
      processedLeads = new Set(result.processedLeads);
      console.log('📋 Leads processados carregados:', processedLeads.size);
    }
  } catch (error) {
    console.error('❌ Erro ao carregar storage:', error);
  }
}

// Salvar leads processados
async function saveProcessedLeads() {
  try {
    await chrome.storage.local.set({
      processedLeads: Array.from(processedLeads)
    });
  } catch (error) {
    console.error('❌ Erro ao salvar leads:', error);
  }
}

// Extrair número de telefone de texto
function extractPhoneNumber(text) {
  if (!text) return null;
  
  // Regex para números brasileiros
  const phoneRegex = /(?:\+55\s?)?(?:\(?[1-9]{2}\)?\s?)?(?:9\s?)?[0-9]{4}[-\s]?[0-9]{4}/g;
  const matches = text.match(phoneRegex);
  
  if (matches && matches.length > 0) {
    // Limpar e normalizar o número
    let phone = matches[0].replace(/\D/g, '');
    
    // Adicionar código do país se não tiver
    if (phone.length === 11 && phone.startsWith('9')) {
      phone = '55' + phone;
    } else if (phone.length === 10) {
      phone = '559' + phone;
    }
    
    return phone.length >= 12 ? phone : null;
  }
  
  return null;
}

// Extrair informações do lead de um elemento
function extractLeadInfo(element) {
  try {
    const leadInfo = {
      name: null,
      phone: null,
      source: 'rocketzap',
      timestamp: Date.now()
    };

    // Buscar nome do contato
    const nameElements = element.querySelectorAll(CONFIG.SELECTORS.contactName + ', h3, .title, .name');
    for (const nameEl of nameElements) {
      if (nameEl.textContent && nameEl.textContent.trim()) {
        leadInfo.name = nameEl.textContent.trim();
        break;
      }
    }

    // Buscar número de telefone
    const phoneElements = element.querySelectorAll(CONFIG.SELECTORS.phoneNumber + ', .phone, [title*="phone"], [aria-label*="phone"]');
    for (const phoneEl of phoneElements) {
      const phone = extractPhoneNumber(phoneEl.textContent || phoneEl.getAttribute('title') || phoneEl.getAttribute('aria-label'));
      if (phone) {
        leadInfo.phone = phone;
        break;
      }
    }

    // Se não encontrou telefone nos elementos específicos, buscar em todo o texto
    if (!leadInfo.phone) {
      const allText = element.textContent || element.innerText || '';
      leadInfo.phone = extractPhoneNumber(allText);
    }

    // Buscar telefone em atributos data-*
    if (!leadInfo.phone) {
      const dataAttributes = ['data-phone', 'data-number', 'data-contact', 'data-whatsapp'];
      for (const attr of dataAttributes) {
        const value = element.getAttribute(attr);
        if (value) {
          const phone = extractPhoneNumber(value);
          if (phone) {
            leadInfo.phone = phone;
            break;
          }
        }
      }
    }

    return leadInfo;
  } catch (error) {
    console.error('❌ Erro ao extrair informações do lead:', error);
    return null;
  }
}

// Processar lead e enviar para API
async function processLead(leadInfo) {
  if (!leadInfo.phone || processedLeads.has(leadInfo.phone)) {
    return false;
  }

  try {
    console.log('📱 Processando novo lead:', leadInfo);

    // Marcar como processado imediatamente
    processedLeads.add(leadInfo.phone);
    await saveProcessedLeads();

    // Enviar para API
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadInfo)
    });

    if (response.ok) {
      console.log('✅ Lead enviado com sucesso:', leadInfo.phone);
      
      // Notificar popup
      chrome.runtime.sendMessage({
        type: 'LEAD_PROCESSED',
        lead: leadInfo
      });
      
      return true;
    } else {
      console.error('❌ Erro ao enviar lead:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao processar lead:', error);
    return false;
  }
}

// Scanner principal
function scanForLeads() {
  try {
    // Tentar diferentes seletores para encontrar o container de chats
    const containers = [
      ...document.querySelectorAll(CONFIG.SELECTORS.chatContainer),
      ...document.querySelectorAll('[class*="chat"]'),
      ...document.querySelectorAll('[class*="conversation"]'),
      ...document.querySelectorAll('[id*="chat"]'),
      ...document.querySelectorAll('[data-testid*="chat"]')
    ];

    let leadsFound = 0;

    for (const container of containers) {
      // Buscar itens de chat dentro do container
      const chatItems = [
        ...container.querySelectorAll(CONFIG.SELECTORS.chatItem),
        ...container.querySelectorAll('[class*="chat-item"]'),
        ...container.querySelectorAll('[class*="conversation"]'),
        ...container.querySelectorAll('li, .item, .row')
      ];

      for (const item of chatItems) {
        const leadInfo = extractLeadInfo(item);
        if (leadInfo && leadInfo.phone && leadInfo.name) {
          processLead(leadInfo);
          leadsFound++;
        }
      }
    }

    // Se não encontrou nada, tentar busca mais ampla
    if (leadsFound === 0) {
      const allElements = document.querySelectorAll('div, span, p, li, article, section');
      for (const element of allElements) {
        if (element.textContent && element.textContent.includes('@')) {
          continue; // Pular emails
        }
        
        const leadInfo = extractLeadInfo(element);
        if (leadInfo && leadInfo.phone && leadInfo.name && !processedLeads.has(leadInfo.phone)) {
          processLead(leadInfo);
          leadsFound++;
          
          // Limitar busca ampla para evitar spam
          if (leadsFound >= 5) break;
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro no scanner:', error);
  }
}

// Observer para mudanças no DOM
const observer = new MutationObserver((mutations) => {
  let shouldScan = false;
  
  for (const mutation of mutations) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      // Verificar se novos nós contêm informações relevantes
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const text = node.textContent || '';
          if (text.includes('55') || text.includes('+') || text.includes('(') || text.includes('9')) {
            shouldScan = true;
            break;
          }
        }
      }
    }
  }
  
  if (shouldScan) {
    setTimeout(scanForLeads, 500); // Aguardar DOM estabilizar
  }
});

// Inicializar extensão
async function init() {
  console.log('🚀 Inicializando RocketZap Lead Extractor');
  
  await initStorage();
  
  // Scanner inicial
  setTimeout(scanForLeads, 2000);
  
  // Scanner periódico
  setInterval(scanForLeads, CONFIG.CHECK_INTERVAL);
  
  // Observer para mudanças
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true
  });
  
  console.log('✅ RocketZap Lead Extractor ativo');
}

// Aguardar página carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Listener para mensagens do popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATS') {
    sendResponse({
      processedLeads: processedLeads.size,
      isActive: true
    });
  }
});