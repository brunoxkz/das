import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import helmet from "helmet";
import crypto from "crypto";
import { registerHybridRoutes } from "./routes-hybrid";
import { setupVite, serveStatic, log } from "./vite";
import { setupHybridAuth, verifyJWT } from "./auth-hybrid";

const app = express();

// Configurações de segurança para alta performance
app.use(helmet({
  contentSecurityPolicy: false, // Desabilita CSP para dev
  crossOriginEmbedderPolicy: false
}));

// Compressão gzip/deflate para reduzir tamanho das respostas
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Nível de compressão balanceado
  threshold: 1024 // Só comprime se > 1KB
}));

// Configurações otimizadas para JSON
app.use(express.json({ 
  limit: '10mb', // Limite de 10MB para uploads
  inflate: true,
  strict: true,
  type: 'application/json'
}));

app.use(express.urlencoded({ 
  extended: false,
  limit: '10mb',
  parameterLimit: 1000
}));

// Headers para performance e cache
app.use((req, res, next) => {
  // Headers de performance
  res.setHeader('X-Powered-By', 'Vendzz');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Cache para assets estáticos
  if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 ano
  }
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Configuração específica de headers para rotas API
  app.use('/api', (req, res, next) => {
    // Força headers adequados para API
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    next();
  });

  // Use SQLite system directly
  const { setupSQLiteAuth } = await import("./auth-sqlite");
  const { registerSQLiteRoutes } = await import("./routes-sqlite");
  setupSQLiteAuth(app);
  const server = registerSQLiteRoutes(app);

  // Sistema de processamento individual de SMS agendados - A CADA 30 SEGUNDOS
  setInterval(async () => {
    try {
      const { storage } = await import('./storage-sqlite');
      const scheduledSMS = await storage.getScheduledSMSLogs();
      
      console.log(`🔍 VERIFICANDO SMS AGENDADOS - Total: ${scheduledSMS.length}`);
      
      if (scheduledSMS.length > 0) {
        const { default: twilio } = await import('./twilio');
        
        for (const smsLog of scheduledSMS) {
          try {
            // Verificar créditos antes de enviar cada SMS
            const campaigns = await storage.getAllSMSCampaigns();
            const campaign = campaigns.find(c => c.id === smsLog.campaignId);
            
            if (!campaign) {
              console.log(`❌ Campanha não encontrada: ${smsLog.campaignId}`);
              continue;
            }
            
            const user = await storage.getUser(campaign.userId);
            
            const sentSMS = await storage.getSentSMSCount(campaign.userId);
            const remainingCredits = Math.max(0, (user.smsCredits || 100) - sentSMS);
            
            if (remainingCredits <= 0) {
              console.log(`🚫 CRÉDITOS ESGOTADOS - Pausando SMS ${smsLog.id}`);
              await storage.updateSMSLog(smsLog.id, { 
                status: 'failed', 
                errorMessage: 'Créditos SMS esgotados' 
              });
              continue;
            }
            console.log(`📞 PROCESSANDO SMS AGENDADO: ${smsLog.id} - ${smsLog.phone}`);
            const result = await twilio.sendSMS(smsLog.phone, smsLog.message);
            
            if (result.success) {
              await storage.updateSMSLog(smsLog.id, {
                status: 'sent',
                twilioSid: result.sid,
                sentAt: Math.floor(Date.now() / 1000)
              });
              
              // Consumir crédito SMS
              await storage.updateUserSmsCredits(campaign.userId, user.smsCredits - 1);
              
              // Registrar transação
              await storage.createSmsTransaction({
                userId: campaign.userId,
                type: 'envio_individual',
                amount: -1,
                description: `SMS individual: ${smsLog.phone}`
              });
              
              // Invalidar cache de créditos SMS para atualizar dashboard
              cache.del(`sms-credits-${campaign.userId}`);
              cache.invalidateUserCaches(campaign.userId);
              
              console.log(`✅ SMS ENVIADO: ${smsLog.id} - ${smsLog.phone}`);
            } else {
              await storage.updateSMSLog(smsLog.id, {
                status: 'failed',
                errorMessage: result.error
              });
              console.log(`❌ SMS FALHOU: ${smsLog.id} - ${smsLog.phone} - ${result.error}`);
            }
          } catch (error) {
            console.error(`❌ Erro ao processar SMS ${smsLog.id}:`, error);
            await storage.updateSMSLog(smsLog.id, {
              status: 'failed',
              errorMessage: error.message
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro no sistema de SMS agendados:', error);
    }
  }, 30000); // A cada 30 segundos

  // Sistema de detecção automática de novos leads - SMS E WHATSAPP
  const autoDetectionSystem = async () => {
    console.log(`🔍 EXECUTANDO DETECÇÃO AUTOMÁTICA - ${new Date().toLocaleTimeString()}`);
    try {
      const { storage } = await import('./storage-sqlite');
      
      // Processar campanhas SMS (funcionalidade existente)
      const smsCampaigns = await storage.getAllSMSCampaigns();
      console.log(`📋 CAMPANHAS SMS ENCONTRADAS: ${smsCampaigns.length}`);
      
      // Processar campanhas WhatsApp (nova funcionalidade)
      const whatsappCampaigns = await storage.getAllWhatsappCampaigns();
      console.log(`📱 CAMPANHAS WHATSAPP ENCONTRADAS: ${whatsappCampaigns.length}`);
      
      // Processar campanhas SMS ativas (funcionalidade existente mantida)
      for (const campaign of smsCampaigns) {
        if (campaign.status === 'draft' && campaign.scheduledAt) {
          console.log(`✅ PROCESSANDO SMS: "${campaign.name}" - Quiz: ${campaign.quizId}`);
          
          const responses = await storage.getQuizResponses(campaign.quizId);
          const logs = await storage.getSMSLogs(campaign.id);
          
          // Mapear telefones já processados com seus timestamps
          const processedPhones = new Map();
          logs.forEach(log => {
            const phone = log.phone;
            const logTime = new Date(log.createdAt).getTime();
            
            if (!processedPhones.has(phone) || logTime > processedPhones.get(phone).time) {
              processedPhones.set(phone, {
                time: logTime,
                status: log.status
              });
            }
          });
          
          console.log(`📊 DADOS: ${responses.length} respostas, ${logs.length} logs, ${processedPhones.size} telefones únicos processados`);
          
          // Verificar apenas telefones que ainda não foram processados ou precisam re-envio válido
          const phoneResponseTimes = new Map();
          
          // Mapear tempo de resposta mais recente para cada telefone
          for (const response of responses) {
            const responseArray = Array.isArray(response.responses) ? response.responses : JSON.parse(response.responses || '[]');
            const responseTime = new Date(response.submittedAt || response.createdAt).getTime();
            
            for (const resp of responseArray) {
              if (resp.elementType === 'phone' && resp.answer && resp.answer.length >= 10) {
                const phone = resp.answer;
                const currentTime = phoneResponseTimes.get(phone) || 0;
                if (responseTime > currentTime) {
                  phoneResponseTimes.set(phone, responseTime);
                }
              }
            }
          }
          
          // Processar apenas telefones que atendem aos critérios
          for (const [phone, responseTime] of phoneResponseTimes) {
            const processed = processedPhones.get(phone);
            
            if (!processed) {
              // Telefone completamente novo - criar apenas um log
              console.log(`🆕 NOVO TELEFONE DETECTADO: ${phone} - AGENDANDO...`);
              
              await storage.createSMSLog({
                id: crypto.randomUUID(),
                campaignId: campaign.id,
                phone,
                message: campaign.message,
                status: 'scheduled',
                scheduledAt: Math.floor(Date.now() / 1000) + (campaign.triggerDelay * 60)
              });
              
              console.log(`✅ TELEFONE ${phone} AGENDADO COM SUCESSO`);
            } else {
              // Telefone já processado - NÃO reagendar automaticamente
              console.log(`⏭️ TELEFONE ${phone} JÁ PROCESSADO - status: ${processed.status}, não reagendar automaticamente`);
            }
          }
        }
      }
      
      // Processar campanhas WhatsApp ativas (nova funcionalidade)
      for (const campaign of whatsappCampaigns) {
        if (campaign.status === 'active') {
          console.log(`📱 PROCESSANDO WHATSAPP: "${campaign.name}" - Quiz: ${campaign.quizId}`);
          
          // Usar a mesma funcionalidade de telefones que o SMS
          const currentPhones = await storage.getQuizPhoneNumbers(campaign.quizId);
          const logs = await storage.getWhatsappLogs(campaign.id);
          
          // Aplicar filtros da campanha
          let filteredPhones = currentPhones;
          
          // Filtro de data
          if (campaign.dateFilter) {
            const filterDate = new Date(campaign.dateFilter);
            filteredPhones = filteredPhones.filter(p => 
              new Date(p.submittedAt || p.created_at) >= filterDate
            );
          }
          
          // Filtro de audiência  
          if (campaign.targetAudience === 'completed') {
            filteredPhones = filteredPhones.filter(p => p.status === 'completed');
          } else if (campaign.targetAudience === 'abandoned') {
            filteredPhones = filteredPhones.filter(p => p.status === 'abandoned');
          }
          
          // Mapear telefones já processados
          const processedPhones = new Set(logs.map(log => log.phone));
          
          // Encontrar novos telefones
          const newPhones = filteredPhones.filter(phone => {
            const phoneNumber = phone.telefone || phone.phone || phone;
            return !processedPhones.has(phoneNumber);
          });
          
          console.log(`📊 WHATSAPP DADOS: ${currentPhones.length} total, ${filteredPhones.length} filtrados, ${newPhones.length} novos, ${logs.length} logs existentes`);
          
          // Criar logs para novos telefones
          let newLeadsCount = 0;
          for (const phone of newPhones) {
            const phoneNumber = phone.telefone || phone.phone || phone;
            if (!phoneNumber || phoneNumber.length < 10) continue;
            
            // Selecionar mensagem rotativa
            const messages = Array.isArray(campaign.messages) ? campaign.messages : JSON.parse(campaign.messages || '[]');
            const selectedMessage = messages[newLeadsCount % messages.length] || messages[0];
            
            console.log(`🆕 NOVO LEAD WHATSAPP: ${phoneNumber} - STATUS: ${phone.status} - CRIANDO LOG...`);
            
            await storage.createWhatsappLog({
              id: crypto.randomUUID(),
              campaignId: campaign.id,
              phone: phoneNumber,
              message: selectedMessage,
              status: 'pending',
              scheduledAt: Math.floor(Date.now() / 1000) + 60, // 1 minuto de delay
              createdAt: new Date(),
              updatedAt: new Date()
            });
            
            newLeadsCount++;
          }
          
          if (newLeadsCount > 0) {
            console.log(`✅ WHATSAPP: ${newLeadsCount} novos leads adicionados à campanha "${campaign.name}"`);
            
            // Atualizar lista de telefones da campanha
            await storage.updateWhatsappCampaign(campaign.id, {
              phones: filteredPhones,
              updatedAt: new Date()
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ ERRO NA DETECÇÃO AUTOMÁTICA:', error);
    }
  };
  
  // Executar a cada 20 segundos
  setInterval(autoDetectionSystem, 20000);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();