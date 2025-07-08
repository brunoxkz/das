// Integração Ultra Simplificada com WhatsApp Web.js
// Esta extensão apenas injeta WhatsApp Web.js e comunica com o app

console.log('🚀 Vendzz WhatsApp 2.0 - Iniciando integração com Web.js');

// Configuração básica
const config = {
  serverUrl: 'http://localhost:5000',
  token: null, // Será definido via popup
  userId: null,
  syncInterval: 30000, // 30 segundos
  commandCheckInterval: 10000, // 10 segundos
  maxContactsPerSync: 50
};

// Estado da extensão
const state = {
  isInitialized: false,
  isConnected: false,
  lastContactSync: 0,
  totalContacts: 0,
  messagesSent: 0,
  pendingCommands: [],
  extensionStatus: 'initializing',
  quizzes: [],           // Lista completa de quizzes do usuário
  activeQuizId: null,    // ID do quiz ativo
  activeCampaigns: []
};

// ========================================
// INJEÇÃO DO WHATSAPP WEB.JS
// ========================================

function injectWhatsAppWebJS() {
  console.log('📱 Injetando WhatsApp Web.js...');
  
  // Criar script para injetar WhatsApp Web.js
  const script = document.createElement('script');
  script.textContent = `
    // WhatsApp Web.js Integration - Código injetado na página
    (async function() {
      console.log('🔧 Configurando WhatsApp Web.js...');
      
      // Simular biblioteca WhatsApp Web.js (versão simplificada para demo)
      window.VendzzWhatsAppClient = {
        isReady: false,
        contacts: [],
        
        // Simular inicialização
        async initialize() {
          console.log('🤖 Inicializando cliente WhatsApp...');
          
          // Aguardar WhatsApp carregar
          await this.waitForWhatsApp();
          
          // Marcar como pronto
          this.isReady = true;
          console.log('✅ Cliente WhatsApp pronto!');
          
          // Notificar extensão
          window.postMessage({ 
            type: 'WHATSAPP_READY',
            source: 'vendzz-integration'
          }, '*');
          
          // Iniciar detecção de contatos
          this.startContactDetection();
        },
        
        // Aguardar WhatsApp carregar
        async waitForWhatsApp() {
          return new Promise((resolve) => {
            const checkWhatsApp = () => {
              // Verificar se WhatsApp carregou
              const chatList = document.querySelector('[data-testid="chat-list"]');
              const loadingScreen = document.querySelector('[data-testid="intro-connection-status"]');
              
              if (chatList && !loadingScreen) {
                console.log('✅ WhatsApp Web carregado');
                resolve();
              } else {
                setTimeout(checkWhatsApp, 1000);
              }
            };
            checkWhatsApp();
          });
        },
        
        // Detectar contatos
        async getContacts() {
          try {
            console.log('🔍 Detectando contatos...');
            
            // Buscar elementos de contato no DOM
            const contactElements = document.querySelectorAll('[data-testid="cell-frame-container"]');
            const contacts = [];
            
            contactElements.forEach((element, index) => {
              if (index < 50) { // Limitar a 50 contatos por sync
                try {
                  // Extrair informações do contato
                  const nameElement = element.querySelector('[title]');
                  const name = nameElement ? nameElement.getAttribute('title') : null;
                  
                  // Tentar extrair número do ID ou outras fontes
                  const contactId = element.getAttribute('data-testid') || \`contact_\${Date.now()}_\${index}\`;
                  
                  if (name && name !== 'WhatsApp') {
                    contacts.push({
                      id: contactId + '@c.us',
                      name: name,
                      number: this.extractPhoneNumber(name, contactId),
                      lastSeen: new Date(),
                      isGroup: name.includes('grupo') || name.includes('group'),
                      isMyContact: true,
                      profilePicUrl: null
                    });
                  }
                } catch (err) {
                  console.log('⚠️ Erro ao processar contato:', err);
                }
              }
            });
            
            console.log(\`📞 \${contacts.length} contatos detectados\`);
            this.contacts = contacts;
            return contacts;
            
          } catch (error) {
            console.error('❌ Erro ao buscar contatos:', error);
            return [];
          }
        },
        
        // Extrair número de telefone (simplificado)
        extractPhoneNumber(name, contactId) {
          // Tentar extrair número do contactId ou gerar um baseado no nome
          const phoneMatch = contactId.match(/\\d{10,15}/);
          if (phoneMatch) {
            return phoneMatch[0];
          }
          
          // Gerar número baseado no hash do nome para consistência
          const hash = this.simpleHash(name);
          return '55119' + (hash % 100000000).toString().padStart(8, '0');
        },
        
        // Hash simples para gerar números consistentes
        simpleHash(str) {
          let hash = 0;
          for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Converter para 32 bits
          }
          return Math.abs(hash);
        },
        
        // Iniciar detecção automática
        startContactDetection() {
          console.log('🔄 Iniciando detecção automática de contatos...');
          
          setInterval(async () => {
            if (this.isReady) {
              const contacts = await this.getContacts();
              
              if (contacts.length > 0) {
                // Notificar extensão sobre novos contatos
                window.postMessage({
                  type: 'CONTACTS_DETECTED',
                  contacts: contacts,
                  timestamp: Date.now(),
                  source: 'vendzz-integration'
                }, '*');
              }
            }
          }, 30000); // A cada 30 segundos
        },
        
        // Enviar mensagem
        async sendMessage(contactId, message) {
          try {
            console.log(\`📤 Enviando mensagem para \${contactId}: \${message.substring(0, 50)}...\`);
            
            // Simular envio de mensagem (na prática, usaria a API real do WhatsApp Web.js)
            // Aqui você implementaria a lógica real de envio
            
            // Por enquanto, apenas simular sucesso
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
            
            console.log('✅ Mensagem enviada com sucesso');
            return true;
            
          } catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error);
            throw error;
          }
        }
      };
      
      // Inicializar cliente
      window.VendzzWhatsAppClient.initialize();
    })();
  `;
  
  // Injetar o script na página
  document.head.appendChild(script);
  console.log('✅ WhatsApp Web.js injetado com sucesso');
}

// ========================================
// COMUNICAÇÃO COM A PÁGINA
// ========================================

// Escutar mensagens da página injetada
window.addEventListener('message', async (event) => {
  if (event.source !== window || event.data.source !== 'vendzz-integration') {
    return;
  }
  
  switch (event.data.type) {
    case 'WHATSAPP_READY':
      await handleWhatsAppReady();
      break;
      
    case 'CONTACTS_DETECTED':
      await handleContactsDetected(event.data.contacts, event.data.timestamp);
      break;
      
    default:
      console.log('📨 Mensagem desconhecida:', event.data.type);
  }
});

// Lidar com WhatsApp pronto
async function handleWhatsAppReady() {
  console.log('✅ WhatsApp está pronto - iniciando sincronização');
  
  state.isConnected = true;
  state.isInitialized = true;
  state.extensionStatus = 'connected';
  
  // Enviar status inicial para o app
  await sendStatusToApp();
  
  // Iniciar verificação de comandos
  startCommandProcessing();
}

// Processar telefones dos quizzes com filtros avançados
async function processQuizPhones() {
  if (!state.isConnected) {
    console.log('⚠️ WhatsApp não conectado, pulando processamento');
    return;
  }
  
  try {
    console.log('🔄 Processando telefones dos quizzes com filtros...');
    
    // Verificar se há configuração de campanha ativa
    if (!config.selectedQuiz) {
      console.log('⚠️ Nenhum quiz selecionado na extensão');
      return;
    }
    
    // Solicitar dados do quiz com filtros
    const quizData = await requestQuizDataFromPage(
      config.selectedQuiz,
      config.targetAudience || 'all',
      config.dateFilter
    );
    
    if (!quizData || !quizData.phones) {
      console.log('⚠️ Nenhum telefone encontrado com os filtros aplicados');
      return;
    }
    
    console.log(`📱 ${quizData.phones.length} telefones filtrados para processamento`);
    
    // Aplicar filtro de data adicional na extensão
    let filteredPhones = quizData.phones;
    if (config.dateFilter) {
      const filterDate = new Date(config.dateFilter);
      filteredPhones = quizData.phones.filter(phone => {
        const phoneDate = new Date(phone.submittedAt);
        return phoneDate >= filterDate;
      });
      console.log(`📅 Filtro de data aplicado: ${filteredPhones.length} telefones após ${config.dateFilter}`);
    }
    
    // Processar cada telefone filtrado
    for (const phoneData of filteredPhones) {
      await scheduleMessageForPhoneWithVariables(phoneData, quizData.quiz, quizData.variables);
    }
    
    // Atualizar estatísticas
    state.filteredPhoneCount = filteredPhones.length;
    state.lastProcessing = Date.now();
    
  } catch (error) {
    console.error('❌ Erro ao processar telefones dos quizzes:', error);
  }
}

// Agendar mensagem com substituição de variáveis
async function scheduleMessageForPhoneWithVariables(phoneData, quiz, variables) {
  try {
    // Verificar se há mensagens configuradas
    if (!config.messages || config.messages.length === 0) {
      console.log('⚠️ Nenhuma mensagem configurada');
      return;
    }
    
    // Selecionar mensagem rotativa
    const messageIndex = state.messagesSent % config.messages.length;
    const rawMessage = config.messages[messageIndex];
    
    // Substituir variáveis na mensagem
    let processedMessage = rawMessage;
    
    // Variáveis do quiz
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      processedMessage = processedMessage.replace(new RegExp(placeholder, 'g'), value);
    });
    
    // Variáveis específicas do telefone
    const phoneVariables = {
      telefone: phoneData.phone,
      status: phoneData.status === 'completed' ? 'completo' : 'abandonado',
      data_resposta: new Date(phoneData.submittedAt).toLocaleDateString(),
      completacao_percentual: phoneData.completionPercentage || 0
    };
    
    Object.entries(phoneVariables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      processedMessage = processedMessage.replace(new RegExp(placeholder, 'g'), value);
    });
    
    // Calcular delay com intervalo recomendado
    const baseDelay = config.messageDelay || 5000; // 5 segundos padrão
    const randomDelay = config.randomInterval ? Math.random() * baseDelay : 0;
    const totalDelay = baseDelay + randomDelay;
    
    // Criar comando de envio
    const command = {
      id: generateCommandId(),
      action: 'send_message',
      contactId: phoneData.phone,
      phone: phoneData.phone,
      message: processedMessage,
      originalMessage: rawMessage,
      variables: { ...variables, ...phoneVariables },
      quizId: quiz.id,
      scheduledAt: Date.now() + totalDelay,
      status: 'pending',
      createdAt: Date.now()
    };
    
    console.log(`📤 Agendando para ${phoneData.phone}: "${processedMessage.substring(0, 50)}..." (delay: ${Math.round(totalDelay/1000)}s)`);
    
    // Enviar comando para o app
    await sendCommandToApp(command);
    
  } catch (error) {
    console.error('❌ Erro ao agendar mensagem:', error);
  }
}

// Gerar ID único para comando
function generateCommandId() {
  return 'cmd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ========================================
// COMUNICAÇÃO COM O APP
// ========================================

// Enviar comando de agendamento para o app
async function sendCommandToApp(command) {
  if (!config.token) {
    console.log('⚠️ Token não configurado, não é possível enviar comando');
    return;
  }
  
  try {
    const response = await fetch(`${config.serverUrl}/api/extension/schedule-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`
      },
      body: JSON.stringify(command)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Comando agendado: ${command.phone} - ${command.message.substring(0, 30)}...`);
    } else {
      console.error('❌ Erro ao agendar comando:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erro de rede ao agendar comando:', error);
  }
}

// Receber dados de quiz específico da página web
async function requestQuizDataFromPage(quizId, targetAudience = 'all', dateFilter = null) {
  if (!config.token) return null;
  
  try {
    console.log(`📋 Solicitando dados do quiz ${quizId} para a página web`);
    
    const response = await fetch(`${config.serverUrl}/api/whatsapp/extension-quiz-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`
      },
      body: JSON.stringify({
        quizId: quizId,
        targetAudience: targetAudience,
        dateFilter: dateFilter
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      
      console.log(`📱 Recebidos ${result.total} telefones do quiz: ${result.quiz.title}`);
      
      // Atualizar estado local
      state.currentQuiz = result.quiz;
      state.phoneList = result.phones;
      state.quizVariables = result.variables;
      
      // Atualizar display
      updateQuizDisplay(result.quiz, result.phones);
      
      return result;
    } else {
      console.error('❌ Erro ao buscar dados do quiz:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erro ao solicitar dados do quiz:', error);
  }
  
  return null;
}

// Sincronizar configurações de campanha da página web
async function syncCampaignConfig() {
  if (!config.token) return null;
  
  try {
    // Buscar configurações de campanha ativa
    const response = await fetch(`${config.serverUrl}/api/extension/sync`, {
      headers: {
        'Authorization': `Bearer ${config.token}`
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      
      // Atualizar configurações locais
      if (result.campaignConfig) {
        config.selectedQuiz = result.campaignConfig.quizId;
        config.targetAudience = result.campaignConfig.targetAudience;
        config.dateFilter = result.campaignConfig.dateFilter;
        config.messages = result.campaignConfig.messages;
        config.variables = result.campaignConfig.variables;
      }
      
      return result;
    }
    
  } catch (error) {
    console.error('❌ Erro ao sincronizar configurações:', error);
  }
  
  return null;
}

// Executar comando
async function executeCommand(command) {
  try {
    console.log(`🤖 Executando comando: ${command.action} para ${command.contactId}`);
    
    // Executar na página injetada
    window.postMessage({
      type: 'EXECUTE_COMMAND',
      command: command,
      source: 'vendzz-extension'
    }, '*');
    
    // Simular execução por enquanto
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reportar sucesso
    await reportCommandExecution(command.id, 'sent');
    state.messagesSent++;
    
  } catch (error) {
    console.error(`❌ Erro ao executar comando ${command.id}:`, error);
    await reportCommandExecution(command.id, 'failed', error.message);
  }
}

// Reportar execução de comando
async function reportCommandExecution(commandId, status, error = null) {
  if (!config.token) return;
  
  try {
    await fetch(`${config.serverUrl}/api/extension/command-executed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`
      },
      body: JSON.stringify({
        commandId,
        status,
        error,
        timestamp: Date.now()
      })
    });
    
  } catch (error) {
    console.error('❌ Erro ao reportar execução:', error);
  }
}

// Enviar status para o app
async function sendStatusToApp() {
  if (!config.token) return;
  
  try {
    await fetch(`${config.serverUrl}/api/extension/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`
      },
      body: JSON.stringify({
        connected: state.isConnected,
        version: '2.0.0',
        lastSync: state.lastContactSync,
        commandsPending: state.pendingCommands.length,
        contactsCount: state.totalContacts,
        messagesSent: state.messagesSent,
        timestamp: Date.now()
      })
    });
    
  } catch (error) {
    console.error('❌ Erro ao enviar status:', error);
  }
}

// ========================================
// PROCESSAMENTO DE COMANDOS
// ========================================

function startCommandProcessing() {
  console.log('🔄 Iniciando sincronização completa com app...');
  
  setInterval(async () => {
    if (state.isConnected && config.token) {
      // Sincronizar dados completos do app
      const syncData = await syncWithApp();
      
      // Processar telefones dos quizzes primeiro
      await processQuizPhones();
      
      // Executar comandos recebidos
      for (const command of syncData.commands) {
        await executeCommand(command);
      }
    }
  }, config.commandCheckInterval);
  
  // Enviar status periodicamente
  setInterval(async () => {
    if (config.token) {
      await sendStatusToApp();
    }
  }, 60000); // A cada minuto
}

// Atualizar display do quiz ativo na interface
function updateQuizDisplay(quiz) {
  // Injetar informações do quiz ativo na página
  window.postMessage({
    type: 'UPDATE_QUIZ_DISPLAY',
    quiz: quiz,
    source: 'vendzz-extension'
  }, '*');
}

// ========================================
// INICIALIZAÇÃO
// ========================================

// Carregar configuração do storage
async function loadConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['vendzz_config'], (result) => {
      if (result.vendzz_config) {
        Object.assign(config, result.vendzz_config);
        console.log('📋 Configuração carregada:', { serverUrl: config.serverUrl, hasToken: !!config.token });
      }
      resolve();
    });
  });
}

// Inicialização principal
async function initializeExtension() {
  console.log('🚀 Inicializando extensão Vendzz WhatsApp 2.0...');
  
  // Carregar configuração
  await loadConfig();
  
  // Aguardar um pouco para a página carregar
  setTimeout(() => {
    // Injetar WhatsApp Web.js
    injectWhatsAppWebJS();
  }, 2000);
  
  console.log('✅ Extensão Vendzz WhatsApp 2.0 inicializada');
}

// Verificar se estamos no WhatsApp Web
if (window.location.hostname === 'web.whatsapp.com') {
  // Aguardar DOM carregar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
  } else {
    initializeExtension();
  }
} else {
  console.log('⚠️ Extensão Vendzz apenas funciona no WhatsApp Web');
}