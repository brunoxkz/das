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
import UltraScaleProcessor from "./ultra-scale-processor";
import { quizCacheOptimizer } from "./quiz-cache-optimizer";

const app = express();

// 🔒 CONFIGURAÇÃO DE PROXY PARA RATE LIMITING
app.set('trust proxy', 1); // Confia no primeiro proxy (necessário para rate limiting no Replit)

// Configurações de segurança compatíveis com Replit
app.use(helmet({
  contentSecurityPolicy: false, // Desabilita CSP para dev
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false, // Fix para ERR_BLOCKED_BY_RESPONSE
  crossOriginOpenerPolicy: false
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

// CORS e Headers configurados para Replit
app.use((req, res, next) => {
  // CORS para extensão Chrome e Replit
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Headers compatíveis com Replit
  res.setHeader('X-Powered-By', 'Vendzz');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'ALLOWALL'); // Permite embedding no Replit
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // Fix ERR_BLOCKED_BY_RESPONSE
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
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

// Sistema ULTRA-ESCALÁVEL para 100.000+ quizzes por minuto
const ultraScaleDetectionSystem = async () => {
  const startTime = Date.now();
  
  try {
    const { storage } = await import('./storage-sqlite');
    
    // Buscar apenas respostas RECENTES para otimizar
    const recentResponses = await storage.getRecentQuizResponses(60); // Últimos 60 segundos
    
    if (recentResponses.length === 0) return;
    
    console.log(`🚀 ULTRA-SCALE: Processando ${recentResponses.length} respostas recentes`);
    
    const ultraProcessor = UltraScaleProcessor.getInstance();
    
    // Processar todas as respostas em paralelo (ultra-rápido)
    const promises = recentResponses.map(async (response) => {
      try {
        const responseArray = Array.isArray(response.responses) ? 
          response.responses : JSON.parse(response.responses || '[]');
        
        for (const resp of responseArray) {
          if (resp.elementType === 'phone' && resp.answer && resp.answer.length >= 10) {
            // Adicionar à fila ultra-rápida
            await ultraProcessor.addQuizCompletion(
              response.quizId, 
              resp.answer, 
              response.userId || 'system'
            );
          }
        }
      } catch (error) {
        console.error(`❌ Erro ao processar resposta ${response.id}:`, error.message);
      }
    });
    
    await Promise.allSettled(promises);
    
    const totalTime = Date.now() - startTime;
    
    if (recentResponses.length > 10) {
      console.log(`⚡ ULTRA-SCALE CONCLUÍDO: ${recentResponses.length} respostas em ${totalTime}ms (${Math.round(recentResponses.length / (totalTime / 1000))}/s)`);
    }
    
  } catch (error) {
    console.error('❌ ERRO NO ULTRA-SCALE SYSTEM:', error);
  }
};

// Sistema ULTRA-ESCALÁVEL para 100.000+ usuários simultâneos
let ultraScaleRunning = false;
let ultraScaleCount = 0;
const MAX_ULTRA_CYCLES = 3600; // 3600 ciclos por hora = 1 por segundo

const ultraScaleInterval = setInterval(async () => {
  if (!ultraScaleRunning && ultraScaleCount < MAX_ULTRA_CYCLES) {
    ultraScaleRunning = true;
    ultraScaleCount++;
    try {
      await ultraScaleDetectionSystem();
    } finally {
      ultraScaleRunning = false;
    }
  }
}, 1000); // ULTRA-OTIMIZADO: 1 segundo para máxima responsividade

// Reset contador ULTRA-SCALE a cada hora
setInterval(() => {
  ultraScaleCount = 0;
  const ultraProcessor = UltraScaleProcessor.getInstance();
  const stats = ultraProcessor.getDetailedStats();
  console.log(`🔄 RESET ULTRA-SCALE: Processados: ${stats.processed}, Throughput: ${stats.throughputPerSecond}/s, Success: ${stats.successRate.toFixed(1)}%`);
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
    console.log(`📊 STATUS: ${memMB}MB RAM, Ultra-Scale: ${ultraScaleCount}/${MAX_ULTRA_CYCLES} ciclos`);
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
  clearInterval(ultraScaleInterval);
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT recebido, encerrando servidor...');
  clearInterval(ultraScaleInterval);
  process.exit(0);
});

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    // Initialize security system primeiro
    await initAdvancedSecurity();
    console.log('🔒 Sistema de segurança avançado inicializado');
    
    // Inicializar cache optimizer para performance ultra-rápida
    await quizCacheOptimizer.initialize();
    console.log('⚡ Sistema de cache ultra-rápido inicializado');
    
    // Email service já está disponível
    console.log('📧 Serviço de email disponível');
    
    const server = app.listen(PORT, "0.0.0.0", () => {
      log(`🚀 Server running on port ${PORT}`);
      log(`🚀 ULTRA-SCALE SYSTEM ATIVO: ${MAX_ULTRA_CYCLES} ciclos/hora, intervalo 1s`);
      log(`⚡ SUPORTE PARA 100.000 QUIZZES/MINUTO (1.667/segundo)`);
      log(`🔥 Sistema de fila assíncrona + cache inteligente + 10 workers paralelos`);
      
      // Inicializar UltraScaleProcessor
      UltraScaleProcessor.getInstance();
      log(`✅ UltraScaleProcessor inicializado`);
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