// Nova API Simplificada para WhatsApp Automation com Web.js
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage-sqlite';
import { verifyJWT } from './auth-hybrid';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';

interface ContactData {
  id: string;
  name?: string;
  number: string;
  lastSeen?: Date;
  profilePicUrl?: string;
  isGroup: boolean;
  isMyContact: boolean;
}

interface AutomationCampaign {
  id: string;
  userId: string;
  name: string;
  quizId: string;
  messages: string[];
  targetAudience: 'all' | 'completed' | 'abandoned';
  timing: {
    type: 'immediate' | 'delayed';
    delayMinutes?: number;
  };
  workingHours: {
    start: string;
    end: string;
    enabled: boolean;
  };
  limits: {
    messagesPerDay: number;
    intervalSeconds: number;
  };
  status: 'active' | 'paused' | 'completed';
  stats: {
    contactsDetected: number;
    messagesSent: number;
    messagesDelivered: number;
    successRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface SendCommand {
  id: string;
  action: 'send_message' | 'send_media';
  contactId: string;
  message: string;
  campaignId: string;
  scheduledAt: number;
  status: 'pending' | 'sent' | 'failed';
  createdAt: number;
}

// Estado global da automação
const automationState = {
  activeQuiz: null as string | null,
  activeCampaigns: [] as AutomationCampaign[],
  detectedContacts: [] as ContactData[],
  pendingCommands: [] as SendCommand[],
  extensionStatus: {
    connected: false,
    lastPing: null as Date | null,
    version: null as string | null,
    contactsCount: 0,
    messagesSent: 0
  }
};

export function setupWhatsAppAutomationRoutes(app: any) {
  console.log('🤖 Configurando rotas de automação WhatsApp com Web.js');

  // ========================================
  // ENDPOINTS PARA A EXTENSÃO (Simplificados)
  // ========================================

  // Receber comando de agendamento de mensagem da extensão
  app.post("/api/extension/schedule-message", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const command = req.body;

      console.log(`📞 [${req.user.email}] Agendando mensagem para ${command.phone}`);

      // Validar estrutura do comando
      if (!command.phone || !command.message || !command.action) {
        return res.status(400).json({ error: 'Dados do comando incompletos' });
      }

      // Verificar se quiz pertence ao usuário (se especificado)
      if (command.quizId) {
        const quiz = await storage.getQuizById(command.quizId);
        if (!quiz || quiz.userId !== userId) {
          return res.status(403).json({ error: 'Quiz não encontrado ou sem permissão' });
        }
      }

      // Adicionar comando aos pendentes
      const fullCommand = {
        ...command,
        userId: userId,
        createdAt: Date.now(),
        status: 'pending'
      };

      automationState.pendingCommands.push(fullCommand);

      res.json({ 
        success: true, 
        commandId: command.id,
        message: 'Comando agendado com sucesso'
      });

    } catch (error) {
      console.error('❌ Erro ao agendar comando:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Fornecer informações completas para a extensão (quiz ativo + comandos)
  app.get("/api/extension/sync", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Buscar todos os quizzes do usuário (não apenas o ativo)
      const userQuizzes = await storage.getQuizzesByUserId(userId);
      const quizzesData = userQuizzes.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        isActive: quiz.id === automationState.activeQuiz,
        phoneFilters: [], // Será preenchido abaixo
        responseCount: 0   // Será preenchido abaixo
      }));

      // Para cada quiz, buscar telefones filtrados
      for (const quiz of quizzesData) {
        try {
          // Buscar responses do quiz
          const responses = await storage.getQuizResponses(quiz.id);
          quiz.responseCount = responses.length;
          
          // Extrair telefones únicos com status
          const phoneMap = new Map();
          
          for (const response of responses) {
            const responseData = typeof response.data === 'string' 
              ? JSON.parse(response.data) 
              : response.data;
            
            // Buscar campos de telefone
            const phoneFields = Object.entries(responseData).filter(([key, value]) => 
              key.startsWith('telefone_') && value && typeof value === 'string'
            );
            
            for (const [fieldId, phone] of phoneFields) {
              const cleanPhone = phone.replace(/\D/g, '');
              if (cleanPhone.length >= 10) {
                const status = response.metadata?.isComplete ? 'completed' : 'abandoned';
                const completionPercentage = response.metadata?.completionPercentage || 0;
                
                if (!phoneMap.has(cleanPhone) || status === 'completed') {
                  phoneMap.set(cleanPhone, {
                    phone: cleanPhone,
                    fieldId: fieldId,
                    status: status,
                    completionPercentage: completionPercentage,
                    submittedAt: response.submittedAt
                  });
                }
              }
            }
          }
          
          quiz.phoneFilters = Array.from(phoneMap.values());
          
        } catch (error) {
          console.error(`❌ Erro ao processar quiz ${quiz.id}:`, error);
          quiz.phoneFilters = [];
        }
      }
      
      // Filtrar comandos do usuário
      const userCommands = automationState.pendingCommands
        .filter(cmd => cmd.status === 'pending')
        .slice(0, 10);

      // Buscar campanhas ativas do usuário
      const userCampaigns = automationState.activeCampaigns
        .filter(c => c.userId === userId && c.status === 'active')
        .map(c => ({
          id: c.id,
          name: c.name,
          targetAudience: c.targetAudience,
          messageCount: c.messages.length
        }));

      res.json({ 
        quizzes: quizzesData,
        activeQuizId: automationState.activeQuiz,
        commands: userCommands,
        campaigns: userCampaigns,
        stats: {
          totalCommands: automationState.pendingCommands.length,
          activeCampaigns: userCampaigns.length,
          contactsDetected: automationState.detectedContacts.length,
          totalQuizzes: quizzesData.length,
          totalPhones: quizzesData.reduce((sum, quiz) => sum + quiz.phoneFilters.length, 0)
        },
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('❌ Erro ao sincronizar dados:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Receber confirmação de execução de comando
  app.post("/api/extension/command-executed", verifyJWT, async (req: any, res: Response) => {
    try {
      const { commandId, status, error } = req.body;

      // Encontrar e atualizar comando
      const commandIndex = automationState.pendingCommands.findIndex(cmd => cmd.id === commandId);
      
      if (commandIndex !== -1) {
        automationState.pendingCommands[commandIndex].status = status;
        
        if (status === 'sent') {
          automationState.extensionStatus.messagesSent++;
          console.log(`✅ Comando ${commandId} executado com sucesso`);
        } else {
          console.error(`❌ Comando ${commandId} falhou:`, error);
        }
      }

      res.json({ success: true });

    } catch (error) {
      console.error('❌ Erro ao processar execução:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Receber status da extensão
  app.post("/api/extension/status", verifyJWT, async (req: any, res: Response) => {
    try {
      const { connected, version, lastSync, commandsPending } = req.body;

      // Atualizar status da extensão
      automationState.extensionStatus = {
        connected,
        lastPing: new Date(),
        version,
        contactsCount: automationState.detectedContacts.length,
        messagesSent: automationState.extensionStatus.messagesSent
      };

      console.log(`📱 Status da extensão atualizado: ${connected ? 'Conectada' : 'Desconectada'}`);

      res.json({ 
        success: true,
        serverTime: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Status da extensão com contagem de telefones (versão simplificada)
  app.get("/api/whatsapp/extension-status", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Verificar último ping da extensão (valor padrão se não existir)
      const lastPing = automationState.extensionStatus?.lastPing || null;
      const isConnected = lastPing && (Date.now() - (lastPing instanceof Date ? lastPing.getTime() : (typeof lastPing === 'number' ? lastPing : 0))) < 60000;
      
      // Contar telefones de forma mais segura
      let totalPhones = 0;
      
      try {
        const userQuizzes = await storage.getQuizzesByUserId(userId);
        
        for (const quiz of userQuizzes) {
          try {
            const responses = await storage.getQuizResponses(quiz.id);
            const phoneMap = new Map();
            
            for (const response of responses) {
              try {
                const responseData = typeof response.data === 'string' 
                  ? JSON.parse(response.data) 
                  : (response.data || {});
                
                if (responseData && typeof responseData === 'object') {
                  const phoneFields = Object.entries(responseData).filter(([key, value]) => 
                    key.startsWith('telefone_') && value && typeof value === 'string'
                  );
                  
                  for (const [fieldId, phone] of phoneFields) {
                    const cleanPhone = (phone as string).replace(/\D/g, '');
                    if (cleanPhone.length >= 10 && cleanPhone.length <= 15) {
                      phoneMap.set(cleanPhone, true);
                    }
                  }
                }
              } catch (responseError) {
                console.error(`Erro ao processar response ${response.id}:`, responseError);
                continue;
              }
            }
            
            totalPhones += phoneMap.size;
          } catch (quizError) {
            console.error(`Erro ao processar quiz ${quiz.id}:`, quizError);
            continue;
          }
        }
      } catch (userError) {
        console.error(`Erro ao buscar quizzes do usuário ${userId}:`, userError);
      }
      
      res.json({
        isConnected: isConnected || false,
        isActive: automationState.extensionStatus?.isActive || false,
        phoneCount: totalPhones,
        lastSync: lastPing ? new Date(lastPing instanceof Date ? lastPing : new Date(lastPing)).toLocaleString() : 'Nunca',
        status: 'operational'
      });
      
    } catch (error) {
      console.error('❌ Erro ao buscar status da extensão:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message,
        isConnected: false,
        isActive: false,
        phoneCount: 0,
        lastSync: 'Erro'
      });
    }
  });

  // Endpoint para gerar token de autenticação da extensão
  app.post("/api/whatsapp/extension-token", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const { purpose = 'chrome_extension' } = req.body;

      console.log(`🔑 [${req.user.email}] Gerando token para extensão`);

      // Criar token especial para extensão (válido por 30 dias)
      const extensionToken = jwt.sign(
        { 
          id: userId, 
          email: req.user.email,
          purpose: purpose,
          type: 'extension'
        },
        process.env.JWT_SECRET || 'default-secret-key-change-in-production',
        { expiresIn: '30d' }
      );

      const tokenData = {
        token: extensionToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        createdAt: new Date().toISOString(),
        purpose: purpose,
        userId: userId
      };

      console.log('✅ Token da extensão gerado com sucesso');
      res.json(tokenData);

    } catch (error) {
      console.error('❌ Erro ao gerar token da extensão:', error);
      res.status(500).json({ error: 'Erro ao gerar token' });
    }
  });

  // NOVO ENDPOINT FUNCIONAL para extensão (substitui o anterior)
  app.post("/api/extension/quiz-data", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const { quizId, targetAudience = 'all', dateFilter = null } = req.body;

      console.log(`📋 [${req.user.email}] NOVO endpoint - dados do quiz ${quizId}`);

      // Verificar propriedade do quiz
      const userQuizzes = await storage.getQuizzesByUserId(userId);
      const quiz = userQuizzes.find(q => q.id === quizId);
      if (!quiz) {
        return res.status(403).json({ error: 'Quiz não encontrado' });
      }

      // Buscar telefones usando lógica simplificada e funcional
      const responses = await storage.getQuizResponses(quizId);
      const phoneData = [];
      
      for (const response of responses) {
        if (!response?.data) continue;
        
        try {
          const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
          
          // Filtro de data
          if (dateFilter) {
            const responseDate = new Date(response.submittedAt);
            const filterDate = new Date(dateFilter);
            if (responseDate < filterDate) continue;
          }
          
          // Extrair telefones
          Object.entries(data || {}).forEach(([key, value]) => {
            if (key.startsWith('telefone_') && value && typeof value === 'string') {
              const phone = value.replace(/\D/g, '');
              if (phone.length >= 10 && phone.length <= 15) {
                const status = response.metadata?.isComplete ? 'completed' : 'abandoned';
                phoneData.push({
                  phone,
                  status,
                  completionPercentage: response.metadata?.completionPercentage || 0,
                  submittedAt: response.submittedAt
                });
              }
            }
          });
        } catch (e) {
          continue;
        }
      }
      
      // Filtrar por audiência
      const filteredPhones = targetAudience === 'all' 
        ? phoneData 
        : phoneData.filter(p => p.status === targetAudience);
      
      const result = {
        success: true,
        quiz: { id: quiz.id, title: quiz.title, description: quiz.description },
        phones: filteredPhones,
        total: filteredPhones.length,
        variables: {
          nome: '{nome}',
          telefone: '{telefone}',
          quiz_titulo: quiz.title,
          status: '{status}',
          data_resposta: '{data_resposta}'
        },
        filters: { targetAudience, dateFilter }
      };
      
      console.log(`✅ SUCESSO: ${result.total} telefones`);
      res.json(result);
      
    } catch (error) {
      console.error('❌ Erro no novo endpoint:', error);
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  });

  // Endpoint para extensão solicitar dados de quiz específico (CORRIGIDO)
  app.post("/api/whatsapp/extension-quiz-data", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const { quizId, targetAudience, dateFilter } = req.body;

      console.log(`📋 [${req.user.email}] Extensão solicitando dados do quiz ${quizId}`);

      // Verificar se quiz pertence ao usuário
      const userQuizzes = await storage.getQuizzesByUserId(userId);
      const quiz = userQuizzes.find(q => q.id === quizId);
      if (!quiz) {
        return res.status(403).json({ error: 'Quiz não encontrado ou sem permissão' });
      }

      // Buscar responses do quiz
      const responses = await storage.getQuizResponses(quizId);
      const phoneMap = new Map();
      
      for (const response of responses) {
        try {
          // Filtrar por data se especificado
          if (dateFilter) {
            const responseDate = new Date(response.submittedAt);
            const filterDate = new Date(dateFilter);
            if (responseDate < filterDate) continue;
          }

          const responseData = typeof response.data === 'string' 
            ? JSON.parse(response.data) 
            : response.data;
          
          // Buscar campos de telefone
          const phoneFields = Object.entries(responseData || {}).filter(([key, value]) => 
            key.startsWith('telefone_') && value && typeof value === 'string'
          );
          
          for (const [fieldId, phone] of phoneFields) {
            const cleanPhone = (phone as string).replace(/\D/g, '');
            if (cleanPhone.length >= 10 && cleanPhone.length <= 15) {
              // Determinar status mais robusto
              let status = 'abandoned';
              if (response.metadata?.isComplete === true || response.metadata?.completionPercentage === 100) {
                status = 'completed';
              }
              
              if (!phoneMap.has(cleanPhone) || status === 'completed') {
                phoneMap.set(cleanPhone, {
                  phone: cleanPhone,
                  fieldId: fieldId,
                  status: status,
                  completionPercentage: response.metadata?.completionPercentage || 0,
                  submittedAt: response.submittedAt,
                  responseData: responseData || {}
                });
              }
            }
          }
        } catch (error) {
          console.error(`Erro ao processar response ${response.id}:`, error);
          continue;
        }
      }
      
      // Filtrar por audiência
      let filteredPhones = Array.from(phoneMap.values());
      if (targetAudience && targetAudience !== 'all') {
        filteredPhones = filteredPhones.filter(p => p.status === targetAudience);
      }

      res.json({
        success: true,
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description
        },
        phones: filteredPhones,
        total: filteredPhones.length,
        variables: {
          quiz_titulo: quiz.title,
          quiz_descricao: quiz.description,
          total_respostas: responses.length,
          data_atual: new Date().toLocaleDateString()
        }
      });

    } catch (error) {
      console.error('❌ Erro ao buscar dados do quiz:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // ========================================
  // ENDPOINTS PARA O APP (Interface Rica)
  // ========================================

  // Ativar quiz para WhatsApp
  app.post("/api/whatsapp/activate-quiz", verifyJWT, async (req: any, res: Response) => {
    try {
      const { quizId } = req.body;
      const userId = req.user.id;

      // Verificar se quiz existe e pertence ao usuário
      const userQuizzes = await storage.getQuizzesByUserId(userId);
      const quiz = userQuizzes.find(q => q.id === quizId);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz não encontrado' });
      }

      // Ativar quiz
      automationState.activeQuiz = quizId;
      
      console.log(`🎯 Quiz ativado: ${quiz.title} (${quizId})`);

      res.json({ 
        success: true, 
        activeQuiz: {
          id: quizId,
          title: quiz.title
        }
      });

    } catch (error) {
      console.error('❌ Erro ao ativar quiz:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Criar campanha de automação
  app.post("/api/whatsapp/automation", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const campaignData = req.body;

      // Validações
      if (!campaignData.name || !campaignData.messages || campaignData.messages.length < 4) {
        return res.status(400).json({ error: 'Nome e pelo menos 4 mensagens são obrigatórios' });
      }

      if (!automationState.activeQuiz) {
        return res.status(400).json({ error: 'Ative um quiz primeiro' });
      }

      // Criar campanha
      const campaign: AutomationCampaign = {
        id: nanoid(),
        userId,
        name: campaignData.name,
        quizId: automationState.activeQuiz,
        messages: campaignData.messages.filter((m: string) => m.trim()),
        targetAudience: campaignData.targetAudience || 'all',
        timing: campaignData.timing || { type: 'immediate' },
        workingHours: campaignData.workingHours || { 
          start: '09:00', 
          end: '18:00', 
          enabled: true 
        },
        limits: campaignData.limits || { 
          messagesPerDay: 200, 
          intervalSeconds: 5 
        },
        status: 'active',
        stats: {
          contactsDetected: 0,
          messagesSent: 0,
          messagesDelivered: 0,
          successRate: 100
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Adicionar à lista de campanhas ativas
      automationState.activeCampaigns.push(campaign);

      console.log(`📋 Nova campanha criada: ${campaign.name}`);

      res.json(campaign);

    } catch (error) {
      console.error('❌ Erro ao criar campanha:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Listar campanhas de automação
  app.get("/api/whatsapp/automation", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Filtrar campanhas do usuário
      const userCampaigns = automationState.activeCampaigns.filter(c => c.userId === userId);

      res.json(userCampaigns);

    } catch (error) {
      console.error('❌ Erro ao listar campanhas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Pausar/resumir campanha
  app.post("/api/whatsapp/automation/:id/:action", verifyJWT, async (req: any, res: Response) => {
    try {
      const { id, action } = req.params;
      const userId = req.user.id;

      const campaignIndex = automationState.activeCampaigns.findIndex(
        c => c.id === id && c.userId === userId
      );

      if (campaignIndex === -1) {
        return res.status(404).json({ error: 'Campanha não encontrada' });
      }

      if (action === 'pause') {
        automationState.activeCampaigns[campaignIndex].status = 'paused';
      } else if (action === 'resume') {
        automationState.activeCampaigns[campaignIndex].status = 'active';
      }

      automationState.activeCampaigns[campaignIndex].updatedAt = new Date();

      console.log(`🔄 Campanha ${action === 'pause' ? 'pausada' : 'retomada'}: ${id}`);

      res.json({ success: true });

    } catch (error) {
      console.error('❌ Erro ao alterar status da campanha:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Status da extensão para o app
  app.get("/api/whatsapp/extension-status", verifyJWT, async (req: any, res: Response) => {
    try {
      res.json({
        ...automationState.extensionStatus,
        activeQuiz: automationState.activeQuiz,
        activeCampaigns: automationState.activeCampaigns.length,
        pendingCommands: automationState.pendingCommands.length
      });

    } catch (error) {
      console.error('❌ Erro ao buscar status:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  console.log('✅ Rotas de automação WhatsApp configuradas com sucesso');
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

// Processar novo contato detectado com contexto de quiz
async function processNewContactWithQuiz(userId: string, contact: ContactData, quizId: string | null) {
  console.log(`🔄 Processando contato: ${contact.name || contact.number} para quiz ${quizId}`);

  // Determinar segmento do contato baseado no quiz específico
  const segment = await determineContactSegmentForQuiz(contact, quizId);

  // Buscar campanhas ativas relevantes para este usuário e quiz
  const relevantCampaigns = automationState.activeCampaigns.filter(campaign => {
    return campaign.userId === userId &&
           campaign.status === 'active' &&
           (!quizId || campaign.quizId === quizId) &&
           (campaign.targetAudience === 'all' || campaign.targetAudience === segment);
  });

  // Agendar mensagens para cada campanha relevante
  for (const campaign of relevantCampaigns) {
    await scheduleMessageForContact(contact, campaign);
  }

  // Atualizar estatísticas
  relevantCampaigns.forEach(campaign => {
    campaign.stats.contactsDetected++;
  });
}

// Processar novo contato detectado (versão legacy)
async function processNewContact(userId: string, contact: ContactData) {
  return processNewContactWithQuiz(userId, contact, null);
}

// Determinar segmento do contato baseado no quiz específico
async function determineContactSegmentForQuiz(contact: ContactData, quizId: string | null): Promise<'all' | 'completed' | 'abandoned'> {
  try {
    // Verificar se o número tem histórico de quiz
    const phoneNumber = contact.number.replace(/\D/g, '');
    
    if (quizId) {
      // Buscar respostas específicas do quiz
      const responses = await storage.getQuizResponses(quizId);
      
      // Procurar por este telefone nas respostas
      for (const response of responses) {
        const responseData = typeof response.data === 'string' 
          ? JSON.parse(response.data) 
          : response.data;
        
        // Buscar campos de telefone
        const phoneFields = Object.entries(responseData).filter(([key, value]) => 
          key.startsWith('telefone_') && value && typeof value === 'string'
        );
        
        for (const [fieldId, phone] of phoneFields) {
          const cleanPhone = (phone as string).replace(/\D/g, '');
          if (cleanPhone === phoneNumber) {
            return response.metadata?.isComplete ? 'completed' : 'abandoned';
          }
        }
      }
    } else {
      // Buscar em todos os quizzes (método legacy)
      const responses = await storage.getQuizResponsesByPhone(phoneNumber);
      
      if (responses && responses.length > 0) {
        const latestResponse = responses[0];
        return latestResponse.metadata?.isComplete ? 'completed' : 'abandoned';
      }
    }
    
    return 'all'; // Contato novo sem histórico
    
  } catch (error) {
    console.error('❌ Erro ao determinar segmento:', error);
    return 'all';
  }
}

// Determinar segmento do contato baseado no histórico de quiz (versão legacy)
async function determineContactSegment(contact: ContactData): Promise<'all' | 'completed' | 'abandoned'> {
  return determineContactSegmentForQuiz(contact, null);
}

// Agendar mensagem para contato
async function scheduleMessageForContact(contact: ContactData, campaign: AutomationCampaign) {
  const delay = calculateMessageDelay(campaign);
  const message = selectRotatingMessage(campaign);

  // Verificar horário comercial se habilitado
  if (campaign.workingHours.enabled && !isWithinWorkingHours(campaign.workingHours)) {
    console.log(`⏰ Fora do horário comercial, pulando envio para ${contact.number}`);
    return;
  }

  // Criar comando de envio
  const command: SendCommand = {
    id: nanoid(),
    action: 'send_message',
    contactId: contact.id,
    message: message,
    campaignId: campaign.id,
    scheduledAt: Date.now() + delay,
    status: 'pending',
    createdAt: Date.now()
  };

  // Agendar comando
  setTimeout(() => {
    automationState.pendingCommands.push(command);
    console.log(`📅 Mensagem agendada para ${contact.name || contact.number} em ${delay/1000}s`);
  }, delay);
}

// Calcular delay da mensagem
function calculateMessageDelay(campaign: AutomationCampaign): number {
  if (campaign.timing.type === 'immediate') {
    // Delay aleatório de 3-10 segundos para parecer natural
    return Math.random() * 7000 + 3000;
  } else {
    // Delay configurado + aleatoriedade
    const baseDelay = (campaign.timing.delayMinutes || 10) * 60 * 1000;
    const randomDelay = Math.random() * 60000; // Até 1 minuto a mais
    return baseDelay + randomDelay;
  }
}

// Selecionar mensagem rotativa
function selectRotatingMessage(campaign: AutomationCampaign): string {
  const messageIndex = Math.floor(Math.random() * campaign.messages.length);
  return campaign.messages[messageIndex];
}

// Verificar horário comercial
function isWithinWorkingHours(workingHours: { start: string; end: string }): boolean {
  const now = new Date();
  const currentTime = now.getHours() * 100 + now.getMinutes();
  
  const [startHour, startMin] = workingHours.start.split(':').map(Number);
  const [endHour, endMin] = workingHours.end.split(':').map(Number);
  
  const startTime = startHour * 100 + startMin;
  const endTime = endHour * 100 + endMin;
  
  return currentTime >= startTime && currentTime <= endTime;
}