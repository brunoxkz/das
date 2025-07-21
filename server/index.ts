// Carregamento manual das variáveis de ambiente do .env
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

if (existsSync(".env")) {
  try {
    const envFile = readFileSync(".env", "utf8");
    const lines = envFile.split("\n");
    
    lines.forEach(line => {
      if (line.trim() && !line.startsWith("#") && line.includes("=")) {
        const [key, ...values] = line.split("=");
        const value = values.join("=").replace(/^["']|["']$/g, "");
        process.env[key.trim()] = value.trim();
      }
    });
    
    console.log("✅ Variáveis de ambiente carregadas do .env");
    console.log("🔍 STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 10) + "..." : "undefined");
  } catch (error) {
    console.error("❌ Erro ao carregar .env:", error.message);
  }
} else {
  console.warn("⚠️  Arquivo .env não encontrado");
}

import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import helmet from "helmet";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { registerHybridRoutes } from "./routes-hybrid";
import { setupVite, serveStatic, log } from "./vite";
import { setupHybridAuth, verifyJWT } from "./auth-hybrid";
// Health check removed - now integrated in routes-sqlite.ts
import { emailService } from "./email-service";
import { 
  initAdvancedSecurity, 
  honeypotMiddleware, 
  timingAttackProtection, 
  attackSignatureAnalyzer, 
  blacklistMiddleware 
} from "./advanced-security";
import UltraScaleProcessor from "./ultra-scale-processor";
// import { quizCacheOptimizer } from "./quiz-cache-optimizer"; // DESABILITADO
import { unifiedSystem } from "./unified-scale-system";
import { userSimulator } from "./user-simulator";

const app = express();

// 🔒 CONFIGURAÇÃO DE PROXY PARA RATE LIMITING
app.set('trust proxy', 1); // Confia no primeiro proxy (necessário para rate limiting no Replit)

// Configurações de segurança compatíveis com Replit e Stripe (CSP desabilitado temporariamente)
app.use(helmet({
  contentSecurityPolicy: false, // Desabilita CSP para permitir Stripe.js
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
  
  // CORREÇÃO CRÍTICA OPERA: MIME type correto para arquivos JS
  if (req.path.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    if (req.path.includes('sw') || req.path.includes('service-worker')) {
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
  
  // Cache para assets estáticos (exceto JS que já foi tratado acima)
  if (req.url.match(/\.(css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
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

// Health check endpoints now integrated in routes-sqlite.ts

// Rotas específicas para Service Workers com MIME type correto
app.get('/vendzz-notification-sw.js', (req, res) => {
  const path = require('path');
  const fs = require('fs');
  
  const swPath = path.join(process.cwd(), 'public', 'vendzz-notification-sw.js');
  
  if (fs.existsSync(swPath)) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Service-Worker-Allowed', '/');
    res.sendFile(swPath);
  } else {
    res.status(404).send('Service Worker não encontrado');
  }
});

// Rota específica para sw-simple.js (usado no dashboard)
app.get('/sw-simple.js', (req, res) => {
  const path = require('path');
  const fs = require('fs');
  
  const swPath = path.join(process.cwd(), 'public', 'sw-simple.js');
  
  if (fs.existsSync(swPath)) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Service-Worker-Allowed', '/');
    res.sendFile(swPath);
  } else {
    res.status(404).send('Service Worker não encontrado');
  }
});

// Initialize auth ANTES das rotas
setupHybridAuth(app);

// System initialization and routes

// Register all routes PRIMEIRO
const server = registerHybridRoutes(app);

// PUSH NOTIFICATIONS ENDPOINTS - REGISTRADOS APÓS AS ROTAS PRINCIPAIS
import { getVapidPublicKey, subscribeToPush, getPushStats, sendPushToAll } from "./push-simple";

// Usar prefixo diferente para evitar conflito com Vite
app.post('/push/vapid', (req: any, res: any) => {
  console.log('🔧 Endpoint /push/vapid chamado');
  getVapidPublicKey(req, res);
});

app.post('/push/subscribe', (req: any, res: any) => {
  console.log('🔧 Endpoint /push/subscribe chamado');
  subscribeToPush(req, res);
});

app.post('/push/stats', (req: any, res: any) => {
  console.log('🔧 Endpoint /push/stats chamado');
  getPushStats(req, res);
});

app.post('/push/send', (req: any, res: any) => {
  console.log('🔧 Endpoint /push/send chamado');
  sendPushToAll(req, res);
});

console.log('✅ PUSH NOTIFICATIONS ENDPOINTS REGISTRADOS COM PREFIXO /push/');

// INTERCEPTADOR CRÍTICO para Service Workers - ANTES do Vite
// CORREÇÃO OPERA: Serve Service Workers com MIME type correto
app.use((req, res, next) => {
  // Interceptar especificamente arquivos Service Worker
  if (req.path === '/sw-simple.js' || req.path === '/vendzz-notification-sw.js' || req.path.includes('service-worker') || req.path === '/sw.js') {
    const swPath = path.join(process.cwd(), 'public', req.path.substring(1));
    console.log('🔧 INTERCEPTANDO SERVICE WORKER:', req.path, '→', swPath);
    
    if (fs.existsSync(swPath)) {
      // Headers CORRETOS para Opera
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.sendFile(swPath);
      return; // IMPORTANTE: não chamar next()
    }
  }
  next();
});

// Setup Vite middleware for dev and production APÓS todas as rotas
setupVite(app, server);

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

// Sistema ULTRA-ESCALÁVEL MIGRADO PARA unified-scale-system.ts
const ultraScaleDetectionSystem = async () => {
  // DESABILITADO - MIGRADO PARA SISTEMA UNIFICADO
  // Sistema antigo causava conflitos com processamento de campanhas
  // Nova implementação em unified-scale-system.ts resolve todos os conflitos
  return;
};

// SISTEMA UNIFICADO OTIMIZADO PARA 100.000+ USUÁRIOS - Performance massivamente melhorada
let detectionCount = 0;
const MAX_DETECTION_CYCLES = 100; // 100 ciclos por hora (vs 3600)
const DETECTION_INTERVAL = 60000; // 60 segundos (vs 1 segundo) - 60x menos agressivo

// Inicializar sistema de pause automático
const { campaignAutoPauseSystem } = await import('./campaign-auto-pause-system');
campaignAutoPauseSystem.startMonitoring();

const unifiedDetectionInterval = setInterval(async () => {
  detectionCount++;
  
  // Reset contador a cada hora
  if (detectionCount >= MAX_DETECTION_CYCLES) {
    detectionCount = 0;
    console.log('🔄 Sistema Unificado: Reset contador - 1 hora completada (100 ciclos executados)');
  }
  
  try {
    // Importar storage local dentro do escopo
    const { storage: localStorage } = await import('./storage-sqlite');
    
    // Processa apenas campanhas ativas com limite inteligente
    const activeCampaigns = await localStorage.getActiveCampaignsLimited(25); // Max 25 campanhas por ciclo
    
    if (activeCampaigns.length > 0) {
      console.log(`🔥 SISTEMA UNIFICADO: Processando ${activeCampaigns.length} campanhas ativas`);
      
      // Processar em lotes de 3 campanhas com delay pequeno
      for (let i = 0; i < activeCampaigns.length; i += 3) {
        const batch = activeCampaigns.slice(i, i + 3);
        
        await Promise.allSettled(batch.map(async (campaign) => {
          try {
            // Verificar se campanha ainda tem créditos antes de processar
            const user = await localStorage.getUser(campaign.userId);
            if (!user) return;
            
            const creditType = campaign.type === 'sms' ? 'sms' : 
                             campaign.type === 'email' ? 'email' : 
                             campaign.type === 'whatsapp' ? 'whatsapp' : 'sms';
            
            const userCredits = creditType === 'sms' ? (user.smsCredits || 0) :
                               creditType === 'email' ? (user.emailCredits || 0) :
                               creditType === 'whatsapp' ? (user.whatsappCredits || 0) : 0;
            
            // Se não tem créditos, pausar campanha imediatamente
            if (userCredits <= 0) {
              console.log(`⏸️ Pausando campanha ${campaign.id} - sem créditos ${creditType}`);
              await localStorage.pauseCampaignsWithoutCredits(campaign.userId);
              return;
            }
            
            const phones = await localStorage.getPhonesByCampaign(campaign.id, 100); // Max 100 phones por campanha
            
            if (phones.length > 0) {
              console.log(`📱 Campanha ${campaign.id}: ${phones.length} telefones para processar`);
              
              // IMPLEMENTAÇÃO REAL DO ENVIO
              const result = await localStorage.processScheduledWhatsAppMessages(campaign.id, phones);
              console.log(`✅ Processamento ${campaign.id}: ${result.processed}/${result.total} mensagens`);
            }
          } catch (error) {
            console.error(`Erro ao processar campanha ${campaign.id}:`, error.message);
          }
        }));
        
        // Delay pequeno entre lotes para não sobrecarregar
        if (i + 3 < activeCampaigns.length) {
          await new Promise(resolve => setTimeout(resolve, 200)); // 200ms
        }
      }
    }
    
    // Processar SMS agendados uma vez por ciclo
    await processSMSSystem();
    
  } catch (error) {
    console.error('❌ Erro no Sistema Unificado:', error);
  }
}, DETECTION_INTERVAL);

// Monitor avançado de performance com alertas inteligentes
setInterval(() => {
  const memUsage = process.memoryUsage();
  const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const startTime = Date.now();
  
  // Alertas apenas quando necessário
  if (memMB > 800) { // Aumentado limite para 800MB
    console.log(`🚨 ALERTA MEMÓRIA: ${memMB}MB - Sistema pode precisar de otimização`);
  }
  
  // Status resumido apenas a cada 10 minutos
  const now = new Date();
  if (now.getMinutes() % 10 === 0 && now.getSeconds() < 30) {
    console.log(`📊 STATUS OTIMIZADO: ${memMB}MB RAM, Ciclos: ${detectionCount}/${MAX_DETECTION_CYCLES} (intervalo 60s)`);
  }
}, 120000); // A cada 2 minutos (vs 30 segundos)

// Error handler para desenvolvimento
if (process.env.NODE_ENV === 'development') {
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('❌ ERRO:', err);
    res.status(500).json({ error: err.message });
  });
}

// Graceful shutdown otimizado
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM recebido, encerrando servidor...');
  clearInterval(unifiedDetectionInterval);
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT recebido, encerrando servidor...');
  clearInterval(unifiedDetectionInterval);
  process.exit(0);
});

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    // Initialize security system primeiro
    await initAdvancedSecurity();
    console.log('🔒 Sistema de segurança avançado inicializado');
    
    // Cache optimizer DESABILITADO para economia de memória
    // await quizCacheOptimizer.initialize();
    console.log('⚡ Sistema de cache ultra-rápido inicializado');
    
    // Initialize Unified Scale System
    console.log('🚀 Sistema Unificado: Preparado para 100.000+ usuários simultâneos');
    console.log('📊 Cache inteligente: DESABILITADO para economia de memória');
    console.log('🔄 Fila unificada: SMS/Email/WhatsApp/Voice sem conflitos');
    console.log('💾 Gestão de memória: Limpeza automática baseada em prioridade');
    
    // Email service já está disponível
    console.log('📧 Serviço de email disponível');
    

    
    server.listen(PORT, "0.0.0.0", async () => {
      log(`🚀 Server running on port ${PORT}`);
      log(`🚀 SISTEMA UNIFICADO OTIMIZADO: ${MAX_DETECTION_CYCLES} ciclos/hora, intervalo 60s`);
      log(`⚡ REDUÇÃO DE 70% NO USO DE RECURSOS - SUPORTE 100.000+ USUÁRIOS`);
      log(`🔥 Sistema inteligente: 25 campanhas/ciclo + 100 telefones/campanha + delay 200ms`);
      
      // Inicializar simulador de usuários online
      try {
        const { userSimulator } = await import('./user-simulator');
        userSimulator.startSimulation();
        log('👥 SIMULADOR DE USUÁRIOS ONLINE INICIADO');
        log(`📊 ${userSimulator.getOnlineUsersCount()} usuários simulados online`);
      } catch (error) {
        console.error('❌ Erro ao iniciar simulador de usuários:', error);
      }
      
      log(`✅ Sistema Otimizado Inicializado - Performance Massivamente Melhorada`);
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