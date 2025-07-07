import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import helmet from "helmet";
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

  // Sistema de ativação automática para campanhas agendadas
  setInterval(async () => {
    try {
      const { storage } = await import('./storage-sqlite');
      const campaigns = await storage.getAllSMSCampaigns();
      
      for (const campaign of campaigns) {
        if (campaign.status === 'draft' && campaign.scheduledAt) {
          const now = new Date();
          const scheduledTime = new Date(campaign.scheduledAt);
          
          if (now >= scheduledTime) {
            console.log(`🕐 ATIVANDO CAMPANHA AGENDADA: ${campaign.name} (${campaign.id})`);
            
            // Ativar campanha
            await storage.updateSMSCampaign(campaign.id, { status: 'active' });
            
            // Enviar SMS para todos os telefones
            let phones;
            try {
              phones = JSON.parse(campaign.phones);
            } catch (error) {
              console.error(`❌ Erro ao fazer parse de phones para campanha ${campaign.id}:`, error);
              continue; // Pular esta campanha se houver erro no JSON
            }
            const { default: twilio } = await import('./twilio');
            
            let successCount = 0;
            for (const phone of phones) {
              try {
                const phoneNumber = phone.telefone || phone.phone || phone;
                if (!phoneNumber) continue;
                
                const result = await twilio.sendSMS(phoneNumber, campaign.message);
                
                if (result.success) {
                  // Atualizar log de 'scheduled' para 'sent'
                  await storage.updateSMSLogStatus(campaign.id, phoneNumber, 'sent');
                  successCount++;
                } else {
                  // Atualizar log para 'failed'
                  await storage.updateSMSLogStatus(campaign.id, phoneNumber, 'failed', result.error);
                }
              } catch (error) {
                console.error(`❌ Erro ao enviar SMS para ${phoneNumber}:`, error);
                await storage.updateSMSLogStatus(campaign.id, phoneNumber, 'failed', error.message);
              }
            }
            
            // Atualizar contadores da campanha
            await storage.updateSMSCampaignStats(campaign.id, { sent: successCount, delivered: successCount });
            console.log(`✅ Campanha ${campaign.name} ativada - ${successCount} SMS enviados`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro no sistema de campanhas agendadas:', error);
    }
  }, 30000); // Verificar a cada 30 segundos

  // Sistema de monitoramento automático para novos leads em campanhas ativas
  setInterval(async () => {
    try {
      const { storage } = await import('./storage-sqlite');
      const activeCampaigns = await storage.getAllSMSCampaigns();
      
      for (const campaign of activeCampaigns) {
        // Processar todas as campanhas ativas (não apenas agendadas)
        if (campaign.status === 'active') {
          const quizResponses = await storage.getQuizResponses(campaign.quizId);
          const existingLogs = await storage.getSMSLogs(campaign.id);
          const existingPhones = new Set(existingLogs.map(log => log.phone));
          
          // Extrair novos telefones das respostas do quiz COMPLETAS
          const newPhones = [];
          for (const response of quizResponses) {
            // Só processar respostas FINALIZADAS (não parciais)
            const isComplete = response.metadata?.isComplete === true;
            const isPartial = response.metadata?.isPartial === true;
            const completionPercentage = response.metadata?.completionPercentage || 0;
            
            // Pular respostas parciais ou não finalizadas (mais restritivo)
            if (isPartial || !isComplete || completionPercentage < 100) {
              console.log(`🚫 RESPOSTA IGNORADA: ${response.id} - isComplete:${isComplete}, isPartial:${isPartial}, completion:${completionPercentage}%`);
              continue;
            }
            
            console.log(`✅ PROCESSANDO RESPOSTA COMPLETA: ${response.id} - completion:${completionPercentage}%`);
            
            const responses = Array.isArray(response.responses) ? response.responses : JSON.parse(response.responses || '[]');
            
            for (const resp of responses) {
              if (resp.elementType === 'phone' && resp.elementFieldId?.startsWith('telefone_')) {
                const phone = resp.answer;
                
                // Validar número de telefone (mínimo 10 dígitos, máximo 15)
                const cleanPhone = phone?.replace(/\D/g, '') || '';
                const isValidPhone = cleanPhone.length >= 10 && cleanPhone.length <= 15;
                
                if (phone && isValidPhone && !existingPhones.has(phone)) {
                  // Verificar segmentação da campanha
                  const targetAudience = campaign.targetAudience || 'all';
                  
                  let shouldInclude = false;
                  if (targetAudience === 'all') shouldInclude = true;
                  else if (targetAudience === 'completed' && isComplete) shouldInclude = true;
                  else if (targetAudience === 'abandoned' && !isComplete) shouldInclude = true;
                  
                  if (shouldInclude) {
                    newPhones.push({
                      phone,
                      leadData: {
                        name: response.metadata?.leadData?.nome || 'Sem nome',
                        isComplete,
                        submittedAt: response.submittedAt
                      }
                    });
                  }
                }
              }
            }
          }
          
          // Processar novos telefones encontrados
          if (newPhones.length > 0) {
            console.log(`📱 NOVOS LEADS VÁLIDOS DETECTADOS: ${newPhones.length} para campanha "${campaign.name}"`);
            
            for (const { phone, leadData } of newPhones) {
              // Criar log agendado para cada novo telefone
              const logId = crypto.randomUUID();
              await storage.createSMSLog({
                id: logId,
                campaignId: campaign.id,
                phone,
                message: campaign.message,
                status: 'scheduled'
              });
              
              // Agendar envio baseado nas configurações da campanha
              const delay = campaign.triggerDelay || 10; // Default 10 minutos
              const delayMs = delay * 60 * 1000;
              
              console.log(`⏰ NOVO LEAD VÁLIDO AGENDADO: ${phone} (${leadData.name}) - envio em ${delay} minutos`);
              
              // Usar setTimeout para agendamento dinâmico
              setTimeout(async () => {
                try {
                  const { storage: currentStorage } = await import('./storage-sqlite');
                  const { default: twilio } = await import('./twilio');
                  
                  const result = await twilio.sendSMS(phone, campaign.message);
                  
                  if (result.success) {
                    await currentStorage.updateSMSLogStatus(campaign.id, phone, 'sent');
                    await currentStorage.updateSMSCampaignStats(campaign.id, { sent: 1 });
                    console.log(`✅ SMS DINÂMICO ENVIADO: ${phone} para campanha "${campaign.name}"`);
                  } else {
                    await currentStorage.updateSMSLogStatus(campaign.id, phone, 'failed', result.error);
                    console.log(`❌ Falha no envio dinâmico: ${phone} - ${result.error}`);
                  }
                } catch (error) {
                  console.error(`❌ Erro no envio dinâmico para ${phone}:`, error);
                  const { storage: errorStorage } = await import('./storage-sqlite');
                  await errorStorage.updateSMSLogStatus(campaign.id, phone, 'failed', error.message);
                }
              }, delayMs);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro no sistema de monitoramento dinâmico:', error);
    }
  }, 30000); // Verificar novos leads a cada 30 segundos para detecção rápida

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