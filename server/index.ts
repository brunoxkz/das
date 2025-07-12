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

// Apply security middleware que funciona com Express 4.x
app.use(honeypotMiddleware);
app.use(timingAttackProtection);
app.use(attackSignatureAnalyzer);
app.use(blacklistMiddleware);

// Health check endpoints
app.get('/health', healthCheck);
app.get('/health/detailed', detailedHealth);

// Initialize auth ANTES das rotas
setupHybridAuth(app);

// Register all routes
registerHybridRoutes(app);

// Setup Vite middleware for dev and production
setupVite(app);

// Sistema de debug avançado
const debugAuthenticatedSMSLogs = async () => {
  console.log('\n📧 DEBUG: Verificando logs SMS autenticados...');
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/check', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.log('❌ Erro na verificação de autenticação');
      return;
    }

    const smsResponse = await fetch('http://localhost:5000/api/sms-logs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (smsResponse.ok) {
      const smsLogs = await smsResponse.json();
      console.log(`✅ SMS Logs encontrados: ${smsLogs.length}`);
      
      const pendingLogs = smsLogs.filter(log => log.status === 'scheduled');
      console.log(`📱 SMS Agendados: ${pendingLogs.length}`);
    }

  } catch (error) {
    console.log('❌ Erro no debug SMS:', error.message);
  }
};

// Sistema de agendamento SMS OTIMIZADO
async function processSMSSystem() {
  try {
    const { storage } = await import('./storage-sqlite');
    const { sendSMS } = await import('./twilio');
    const { debitCredits } = await import('./storage-sqlite');

    const scheduledSMSLogs = await storage.getScheduledSMSLogs();
    
    if (scheduledSMSLogs.length > 0) {
      console.log(`📱 PROCESSANDO ${scheduledSMSLogs.length} SMS AGENDADOS...`);
      
      for (const smsLog of scheduledSMSLogs) {
        try {
          const result = await sendSMS(smsLog.phone, smsLog.message);
          
          if (result.success) {
            // Tentar débito de créditos
            const debitResult = await debitCredits(smsLog.campaignId, 'sms', 1);
            
            if (debitResult.success) {
              await storage.updateSMSLog(smsLog.id, {
                status: 'sent',
                twilioSid: result.sid,
                sentAt: Math.floor(Date.now() / 1000)
              });
              console.log(`✅ SMS ENVIADO: ${smsLog.id} - ${smsLog.phone} - Crédito debitado`);
            } else {
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
}

// Sistema de auto-detecção OTIMIZADO para 100k+ usuários
const autoDetectionSystem = async () => {
  const startTime = Date.now();
  console.log(`🔍 DETECÇÃO AUTOMÁTICA - ${new Date().toLocaleTimeString()}`);
  
  try {
    const { storage } = await import('./storage-sqlite');
    
    // OTIMIZAÇÃO 1: Limite de campanhas por ciclo
    const MAX_CAMPAIGNS_PER_CYCLE = 20;
    
    const [smsCampaigns, whatsappCampaigns, emailCampaigns] = await Promise.all([
      storage.getAllSMSCampaigns(),
      storage.getAllWhatsappCampaigns(),
      storage.getAllEmailCampaigns()
    ]);
    
    // Aplicar limites
    const limitedSMS = smsCampaigns.slice(0, MAX_CAMPAIGNS_PER_CYCLE);
    const limitedWhatsapp = whatsappCampaigns.slice(0, MAX_CAMPAIGNS_PER_CYCLE);
    const limitedEmail = emailCampaigns.slice(0, MAX_CAMPAIGNS_PER_CYCLE);
    
    console.log(`📊 CAMPANHAS: ${limitedSMS.length} SMS, ${limitedWhatsapp.length} WhatsApp, ${limitedEmail.length} Email`);
    
    // OTIMIZAÇÃO 2: Processamento em lotes com delays
    const BATCH_SIZE = 3; // 3 campanhas por lote
    const BATCH_DELAY = 200; // 200ms entre lotes
    
    // Processar SMS em lotes
    for (let i = 0; i < limitedSMS.length; i += BATCH_SIZE) {
      const batch = limitedSMS.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (campaign) => {
        if (campaign.status === 'draft' && campaign.scheduledAt) {
          try {
            const responses = await storage.getQuizResponses(campaign.quizId);
            const logs = await storage.getSMSLogs(campaign.id);
            
            const processedPhones = new Map();
            logs.forEach(log => {
              processedPhones.set(log.phone, { status: log.status });
            });
            
            for (const response of responses) {
              const responseArray = Array.isArray(response.responses) ? 
                response.responses : JSON.parse(response.responses || '[]');
              
              for (const resp of responseArray) {
                if (resp.elementType === 'phone' && resp.answer && resp.answer.length >= 10) {
                  const phone = resp.answer;
                  
                  if (!processedPhones.has(phone)) {
                    await storage.createSMSLog({
                      id: crypto.randomUUID(),
                      campaignId: campaign.id,
                      phone,
                      message: campaign.message,
                      status: 'scheduled',
                      scheduledAt: Math.floor(Date.now() / 1000) + (campaign.triggerDelay * 60)
                    });
                    console.log(`🆕 TELEFONE ${phone} AGENDADO`);
                  }
                }
              }
            }
          } catch (error) {
            console.error(`❌ Erro SMS campanha ${campaign.name}:`, error.message);
          }
        }
      }));
      
      // Delay entre lotes
      if (i + BATCH_SIZE < limitedSMS.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }
    
    // Processar WhatsApp em lotes
    for (let i = 0; i < limitedWhatsapp.length; i += BATCH_SIZE) {
      const batch = limitedWhatsapp.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (campaign) => {
        if (campaign.status === 'active') {
          try {
            const phones = await storage.getQuizPhoneNumbers(campaign.quizId);
            const logs = await storage.getWhatsappLogs(campaign.id);
            
            const processedPhones = new Set(logs.map(log => log.phone));
            
            for (const phoneData of phones.slice(0, 10)) { // Máximo 10 por campanha
              const phone = phoneData.phone || phoneData.telefone;
              if (phone && !processedPhones.has(phone)) {
                await storage.createWhatsappLog({
                  id: crypto.randomUUID(),
                  campaignId: campaign.id,
                  phone,
                  message: campaign.messages?.[0] || 'Mensagem padrão',
                  status: 'scheduled',
                  scheduledAt: Math.floor(Date.now() / 1000) + 600
                });
                console.log(`🆕 WHATSAPP ${phone} AGENDADO`);
              }
            }
          } catch (error) {
            console.error(`❌ Erro WhatsApp campanha ${campaign.name}:`, error.message);
          }
        }
      }));
      
      // Delay entre lotes
      if (i + BATCH_SIZE < limitedWhatsapp.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }
    
  } catch (error) {
    console.error('❌ ERRO NA DETECÇÃO AUTOMÁTICA:', error);
  }
  
  const totalTime = Date.now() - startTime;
  
  // Log apenas se demorar mais que 2s
  if (totalTime > 2000) {
    console.log(`⚡ DETECÇÃO CONCLUÍDA: ${totalTime}ms`);
  }
  
  // Alerta se performance degradada
  if (totalTime > 5000) {
    console.log(`🚨 PERFORMANCE DEGRADADA: ${totalTime}ms - Considere otimizar campanhas`);
  }
};

// Sistema de detecção automática OTIMIZADO para 100.000+ usuários
let autoDetectionRunning = false;
let autoDetectionCount = 0;
const MAX_DETECTION_CYCLES = 100; // Limite de ciclos por hora

const autoDetectionInterval = setInterval(async () => {
  if (!autoDetectionRunning && autoDetectionCount < MAX_DETECTION_CYCLES) {
    autoDetectionRunning = true;
    autoDetectionCount++;
    try {
      await autoDetectionSystem();
    } finally {
      autoDetectionRunning = false;
    }
  }
}, 60000); // OTIMIZADO: 60 segundos (era 20s)

// Reset contador a cada hora
setInterval(() => {
  autoDetectionCount = 0;
  console.log(`🔄 RESET CONTADOR DETECÇÃO AUTOMÁTICA - Reiniciando ciclo de ${MAX_DETECTION_CYCLES} execuções`);
}, 3600000); // 1 hora

// Iniciar sistema SMS automatizado
setInterval(processSMSSystem, 30000); // A cada 30 segundos

// Sistema de monitoramento de performance
setInterval(() => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  
  // Alertas automáticos se uso excessivo
  if (memMB > 500) { // Mais de 500MB
    console.log(`🚨 ALERTA MEMÓRIA: ${memMB}MB em uso - Considere otimizar`);
  }
  
  // Log de status a cada 10 minutos
  if (new Date().getMinutes() % 10 === 0 && new Date().getSeconds() < 30) {
    console.log(`📊 STATUS: ${memMB}MB RAM, Detecção: ${autoDetectionCount}/${MAX_DETECTION_CYCLES} ciclos`);
  }
}, 30000); // A cada 30 segundos

// Error handler para desenvolvimento
if (process.env.NODE_ENV === 'development') {
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('❌ ERRO:', err);
    res.status(500).json({ error: err.message });
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM recebido, encerrando servidor...');
  clearInterval(autoDetectionInterval);
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT recebido, encerrando servidor...');
  clearInterval(autoDetectionInterval);
  process.exit(0);
});

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    // Initialize security system primeiro
    await initAdvancedSecurity();
    console.log('🔒 Sistema de segurança avançado inicializado');
    
    // Email service já está disponível
    console.log('📧 Serviço de email disponível');
    
    const server = app.listen(PORT, "0.0.0.0", () => {
      log(`🚀 Server running on port ${PORT}`);
      log(`📊 Sistema de detecção automática ativo (${MAX_DETECTION_CYCLES} ciclos/hora, intervalo 60s)`);
      log(`⚡ Otimizado para 100.000+ usuários simultâneos`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Porta ${PORT} já está em uso`);
        process.exit(1);
      } else {
        console.error('❌ Erro no servidor:', err);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

startServer();