import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import helmet from "helmet";
import crypto from "crypto";
import { registerHybridRoutes } from "./routes-hybrid";
import { setupVite, serveStatic, log } from "./vite";
import { setupHybridAuth, verifyJWT } from "./auth-hybrid";
import { healthCheck, detailedHealth } from "./health-check";
import { emailService } from "./email-service";
import { 
  initAdvancedSecurity, 
  honeypotMiddleware, 
  timingAttackProtection, 
  attackSignatureAnalyzer, 
  blacklistMiddleware 
} from "./advanced-security";

const app = express();

// 🔒 CONFIGURAÇÃO DE PROXY PARA RATE LIMITING
app.set('trust proxy', 1); // Confia no primeiro proxy (necessário para rate limiting no Replit)

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

// SOLUÇÃO CRÍTICA: JSON parser robusto que funciona com fetch() do Node.js
app.use(express.json({ 
  limit: '10mb',
  inflate: true,
  strict: true,
  type: ['application/json', 'text/plain', 'application/octet-stream']
}));

// Removemos express.urlencoded() para evitar interceptação das requisições JSON do fetch()

// CORS configurado para extensão Chrome
app.use((req, res, next) => {
  // CORS para extensão Chrome
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Headers de performance
  res.setHeader('X-Powered-By', 'Vendzz');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Cache para assets estáticos
  if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 ano
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
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
  // Configuração específica de headers para rotas API - DEVE VIR ANTES DO VITE!
  app.use('/api', (req, res, next) => {
    // Força headers adequados para API
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Intercepta res.send para garantir JSON válido
    const originalSend = res.send;
    const originalJson = res.json;
    
    res.send = function(data) {
      if (typeof data === 'object' && data !== null) {
        return originalSend.call(this, JSON.stringify(data));
      }
      return originalSend.call(this, data);
    };
    
    res.json = function(data) {
      res.setHeader('Content-Type', 'application/json');
      return originalJson.call(this, data);
    };
    
    next();
  });

  // Middleware para interceptar rotas API ANTES do Vite
  app.use((req, res, next) => {
    if (req.url.startsWith('/api/')) {
      // Marcar como API route
      req.isAPIRoute = true;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
    }
    next();
  });

  // Use SQLite system directly - DEVE VIR ANTES DO VITE
  const { setupSQLiteAuth } = await import("./auth-sqlite");
  const { registerSQLiteRoutes } = await import("./routes-sqlite");
  setupSQLiteAuth(app);
  const server = registerSQLiteRoutes(app);
  
  // Garantir que todas as rotas API sejam registradas antes do Vite
  console.log('✅ ROTAS API REGISTRADAS ANTES DO VITE');

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
            // 🔒 VALIDAÇÃO DE CRÉDITOS ULTRA-SEGURA - ANTI-BURLA
            const campaigns = await storage.getAllSMSCampaigns();
            const campaign = campaigns.find(c => c.id === smsLog.campaignId);
            
            if (!campaign) {
              console.log(`❌ Campanha não encontrada: ${smsLog.campaignId}`);
              continue;
            }
            
            // Verificar créditos usando função segura
            const creditValidation = await storage.validateCreditsForCampaign(campaign.userId, 'sms', 1);
            if (!creditValidation.valid) {
              console.log(`🚫 CRÉDITOS INSUFICIENTES - Pausando SMS ${smsLog.id}`);
              await storage.updateSMSLog(smsLog.id, { 
                status: 'failed', 
                errorMessage: `Créditos SMS insuficientes. Atual: ${creditValidation.currentCredits}` 
              });
              
              // Pausar campanha automaticamente
              await storage.pauseCampaignsWithoutCredits(campaign.userId);
              continue;
            }
            console.log(`📞 PROCESSANDO SMS AGENDADO: ${smsLog.id} - ${smsLog.phone}`);
            const result = await twilio.sendSMS(smsLog.phone, smsLog.message);
            
            if (result.success) {
              // 🔒 DÉBITO DE CRÉDITO SEGURO - 1 SMS = 1 CRÉDITO
              const debitResult = await storage.debitCredits(campaign.userId, 'sms', 1);
              
              if (debitResult.success) {
                await storage.updateSMSLog(smsLog.id, {
                  status: 'sent',
                  twilioSid: result.sid,
                  sentAt: Math.floor(Date.now() / 1000)
                });
                
                console.log(`✅ SMS ENVIADO: ${smsLog.id} - ${smsLog.phone} - Crédito debitado: ${debitResult.newBalance} restantes`);
                
                // Se créditos acabaram, pausar todas as campanhas do usuário
                if (debitResult.newBalance <= 0) {
                  console.log(`🚫 CRÉDITOS ESGOTADOS - Pausando todas as campanhas do usuário ${campaign.userId}`);
                  await storage.pauseCampaignsWithoutCredits(campaign.userId);
                }
              } else {
                // SMS foi enviado mas erro no débito - registrar problema
                await storage.updateSMSLog(smsLog.id, {
                  status: 'sent',
                  twilioSid: result.sid,
                  sentAt: Math.floor(Date.now() / 1000),
                  errorMessage: `SMS enviado mas erro no débito: ${debitResult.message}`
                });
                console.log(`⚠️ SMS ENVIADO mas erro no débito: ${smsLog.id} - ${debitResult.message}`);
              }
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
