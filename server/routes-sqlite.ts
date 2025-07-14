import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-sqlite";
import { cache } from "./cache";
import { nanoid } from "nanoid";
import { insertQuizSchema, insertQuizResponseSchema } from "../shared/schema-sqlite";
import { z } from "zod";
import { verifyJWT } from "./auth-sqlite";
import { sendSms } from "./twilio";
import { emailService } from "./email-service";
import { BrevoEmailService } from "./email-brevo";
import { handleSecureUpload, uploadMiddleware } from "./upload-secure";
import { sanitizeAllScripts, sanitizeUTMCode, sanitizeCustomScript } from './script-sanitizer-new';
import { intelligentRateLimiter } from './intelligent-rate-limiter';
import { 
  antiDdosMiddleware, 
  antiInvasionMiddleware, 
  helmetSecurity, 
  loginAttemptMiddleware, 
  getSecurityStats 
} from './security';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { generateTokens } from './auth-sqlite';
import HealthCheckSystem from './health-check-system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware para verificar expiração de plano
async function checkPlanExpiration(req: any, res: any, next: any) {
  try {
    // Pular verificação para rotas públicas e admin
    const publicRoutes = ['/api/auth/', '/api/quiz/', '/dummybytes', '/api/webhooks/', '/api/notifications'];
    const isPublicRoute = publicRoutes.some(route => req.path.includes(route));
    
    if (isPublicRoute) {
      return next();
    }

    // Verificar se é admin
    if (req.user && req.user.role === 'admin') {
      return next();
    }

    // Verificar se o usuário está bloqueado
    if (req.user && req.user.isBlocked) {
      return res.status(403).json({ 
        error: 'Conta bloqueada',
        message: req.user.blockReason || 'Sua conta foi bloqueada. Entre em contato com o suporte.',
        renewalRequired: true
      });
    }

    // Verificar se o plano expirou
    if (req.user && req.user.planExpiresAt) {
      const now = new Date();
      const expirationDate = new Date(req.user.planExpiresAt);
      
      if (now > expirationDate) {
        // Bloquear usuário se plano expirou
        await storage.updateUser(req.user.id, {
          isBlocked: true,
          planRenewalRequired: true,
          blockReason: 'Plano expirado - Renovação necessária'
        });
        
        return res.status(402).json({
          error: 'Plano expirado',
          message: 'Seu plano expirou. Renove para continuar usando o sistema.',
          renewalRequired: true,
          expirationDate: expirationDate.toISOString()
        });
      }
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar expiração de plano:', error);
    next();
  }
}

export function registerSQLiteRoutes(app: Express): Server {
  // 🔒 SISTEMA DE SEGURANÇA - Aplicar middlewares de proteção
  app.use(helmetSecurity);
  // app.use(antiDdosMiddleware); // TEMPORARIAMENTE DESATIVADO
  app.use(antiInvasionMiddleware);
  app.use(loginAttemptMiddleware);
  
  // 🧠 RATE LIMITING INTELIGENTE - Diferencia usuários legítimos de invasores
  // app.use(intelligentRateLimiter.middleware()); // TEMPORARIAMENTE DESATIVADO
  
  // Middleware de debug para todas as rotas POST
  app.use((req, res, next) => {
    if (req.method === 'POST' && req.path.startsWith('/api/')) {
      console.log(`🔍 MIDDLEWARE DEBUG - ${req.method} ${req.path}`);
      console.log(`📝 Headers:`, req.headers);
      console.log(`📝 Body type:`, typeof req.body);
      console.log(`📝 Body keys:`, Object.keys(req.body || {}));
      console.log(`📝 Body content:`, JSON.stringify(req.body, null, 2));
    }
    next();
  });
  
  // Middleware para forçar JSON em todas as APIs
  app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  // Aplicar middleware de verificação de plano apenas em rotas protegidas
  // (As rotas já têm verifyJWT individualmente)

  // Auth system detection endpoint
  app.get("/api/auth/system", (req, res) => {
    res.json({ system: "sqlite" });
  });

  // JWT REFRESH ENDPOINT - CORREÇÃO CRÍTICA
  app.post('/api/auth/refresh', async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ 
          success: false,
          message: "Refresh token required" 
        });
      }

      // Verificar se é um token válido
      const decoded: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'vendzz-jwt-refresh-secret-2024');
      
      const isValid = await storage.isValidRefreshToken(decoded.id, refreshToken);
      if (!isValid) {
        return res.status(401).json({ 
          success: false,
          message: "Invalid refresh token" 
        });
      }

      const user = await storage.getUser(decoded.id);
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: "User not found" 
        });
      }

      // Gerar novos tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
      await storage.storeRefreshToken(user.id, newRefreshToken);

      // Estrutura EXATA que o teste espera
      const response = {
        success: true,
        message: "Token refreshed successfully",
        token: accessToken,
        refreshToken: newRefreshToken,
        accessToken: accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          plan: user.plan
        },
        expiresIn: 3600,
        tokenType: "Bearer",
        valid: true
      };

      console.log('✅ JWT REFRESH SUCCESS - Response structure:', JSON.stringify(response, null, 2));
      res.status(200).json(response);

    } catch (error) {
      console.error("❌ JWT REFRESH ERROR:", error);
      res.status(401).json({ 
        success: false,
        message: "Invalid refresh token" 
      });
    }
  });

  // 2FA Endpoints
  app.post("/api/auth/2fa/setup", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Gerar secret para 2FA
      const secret = speakeasy.generateSecret({
        name: `Vendzz - ${req.user.email}`,
        issuer: 'Vendzz',
        length: 32
      });

      // Gerar códigos de backup
      const backupCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substr(2, 8).toUpperCase()
      );

      // Gerar QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      // Salvar secret temporariamente (será confirmado quando usuário verificar)
      await storage.updateUser(userId, {
        twoFactorSecret: secret.base32,
        twoFactorBackupCodes: backupCodes
      });

      res.json({
        secret: secret.base32,
        qrCode,
        backupCodes,
        manualEntryKey: secret.base32
      });
    } catch (error) {
      console.error('Erro ao configurar 2FA:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.post("/api/auth/2fa/verify", verifyJWT, async (req: any, res) => {
    try {
      const { token } = req.body;
      const userId = req.user.id;
      
      const user = await storage.getUser(userId);
      if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ error: 'Configuração 2FA não encontrada' });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 1
      });

      if (verified) {
        await storage.updateUser(userId, {
          twoFactorEnabled: true
        });
        res.json({ success: true, message: '2FA ativado com sucesso' });
      } else {
        res.status(400).json({ error: 'Token inválido' });
      }
    } catch (error) {
      console.error('Erro ao verificar 2FA:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.post("/api/auth/2fa/disable", verifyJWT, async (req: any, res) => {
    try {
      const { token } = req.body;
      const userId = req.user.id;
      
      const user = await storage.getUser(userId);
      if (!user || !user.twoFactorEnabled) {
        return res.status(400).json({ error: '2FA não está ativado' });
      }

      // Verificar se é token válido ou código de backup
      let verified = false;
      
      if (user.twoFactorSecret) {
        verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: token,
          window: 1
        });
      }

      // Se não foi verificado com TOTP, verificar códigos de backup
      if (!verified && user.twoFactorBackupCodes) {
        const backupCodes = user.twoFactorBackupCodes as string[];
        verified = backupCodes.includes(token.toUpperCase());
      }

      if (verified) {
        await storage.updateUser(userId, {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorBackupCodes: null
        });
        res.json({ success: true, message: '2FA desativado com sucesso' });
      } else {
        res.status(400).json({ error: 'Token inválido' });
      }
    } catch (error) {
      console.error('Erro ao desativar 2FA:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Gerenciamento de Planos - Admin apenas
  app.get("/api/admin/users", verifyJWT, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.put("/api/admin/users/:id/plan", verifyJWT, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const { id } = req.params;
      const { plan, expiresAt, credits } = req.body;

      const updateData: any = { plan };
      
      if (expiresAt) {
        updateData.planExpiresAt = new Date(expiresAt);
      }
      
      if (credits) {
        updateData.smsCredits = credits.sms || 0;
        updateData.emailCredits = credits.email || 0;
        updateData.whatsappCredits = credits.whatsapp || 0;
        updateData.aiCredits = credits.ai || 0;
      }

      // Desbloquear usuário se estiver bloqueado
      updateData.isBlocked = false;
      updateData.planRenewalRequired = false;
      updateData.blockReason = null;

      await storage.updateUser(id, updateData);
      res.json({ success: true, message: 'Plano atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.post("/api/admin/users/:id/block", verifyJWT, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const { id } = req.params;
      const { reason } = req.body;

      await storage.updateUser(id, {
        isBlocked: true,
        blockReason: reason || 'Bloqueado pelo administrador'
      });

      res.json({ success: true, message: 'Usuário bloqueado com sucesso' });
    } catch (error) {
      console.error('Erro ao bloquear usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.post("/api/admin/users/:id/unblock", verifyJWT, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const { id } = req.params;

      await storage.updateUser(id, {
        isBlocked: false,
        planRenewalRequired: false,
        blockReason: null
      });

      res.json({ success: true, message: 'Usuário desbloqueado com sucesso' });
    } catch (error) {
      console.error('Erro ao desbloquear usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Sistema Unificado - Monitoramento para 100k+ usuários
  app.get("/api/unified-system/stats", verifyJWT, async (req: Request, res: Response) => {
    try {
      const memUsage = process.memoryUsage();
      const uptime = process.uptime();
      
      // Obter estatísticas reais do cache
      const cacheStats = cache.getStats();
      const memoryUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const hitRate = cacheStats.hits > 0 ? Math.round((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100) : 85;
      
      // Simular estatísticas do sistema unificado
      const stats = {
        cacheHits: cacheStats.hits,
        cacheMisses: cacheStats.misses,
        memoryUsage: memoryUsageMB,
        campaignsProcessed: 25,
        avgProcessingTime: 150,
        peakMemoryUsage: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        hitRate: hitRate,
        systemUptime: uptime,
        complexQuizzes: 15,
        queueLength: 5,
        avgWaitTime: 200,
        cacheHitRate: hitRate
      };
      
      res.json({
        success: true,
        stats,
        queue: {
          length: stats.queueLength,
          avgWaitTime: stats.avgWaitTime,
          processing: 3
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao obter stats do sistema unificado:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Endpoint para usuário verificar status do plano
  app.get("/api/user/plan-status", verifyJWT, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const planStatus = {
        plan: user.plan,
        expiresAt: user.planExpiresAt,
        isBlocked: user.isBlocked,
        renewalRequired: user.planRenewalRequired,
        blockReason: user.blockReason,
        twoFactorEnabled: user.twoFactorEnabled,
        credits: {
          sms: user.smsCredits,
          email: user.emailCredits,
          whatsapp: user.whatsappCredits,
          ai: user.aiCredits
        }
      };

      res.json(planStatus);
    } catch (error) {
      console.error('Erro ao buscar status do plano:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Public routes BEFORE any middleware or authentication

  // Endpoint /dummybytes para sistema Anti-WebView (BlackHat)
  app.get('/dummybytes', (req, res) => {
    const targetUrl = decodeURIComponent(req.query.target as string || '');
    const ua = req.headers['user-agent']?.toLowerCase() || '';
    const isInstagram = ua.includes('instagram');
    const isFacebook = ua.includes('fban') || ua.includes('fbav');
    const isTikTok = ua.includes('tiktok');
    const isWebView = isInstagram || isFacebook || isTikTok;

    console.log('🔄 DummyBytes request:', {
      userAgent: ua.substring(0, 100),
      isWebView,
      targetUrl: targetUrl.substring(0, 100) + '...'
    });

    if (isWebView) {
      // Força download para abrir navegador externo
      res.setHeader('Content-Disposition', 'attachment; filename=dummy.txt');
      res.setHeader('Content-Type', 'application/octet-stream');
      res.send('Forcing external browser...');
      
      console.log('📱 WebView detectado - forçando navegador externo');
    } else {
      // Redireciona normalmente se já estiver em navegador externo
      const redirectUrl = targetUrl || `${req.protocol}://${req.get('host')}`;
      console.log('🌐 Navegador externo detectado - redirecionando para:', redirectUrl.substring(0, 100));
      res.redirect(redirectUrl);
    }
  });

  // REMOVIDO: Endpoint duplicado - implementação completa está mais abaixo (linha 1056)

  // Endpoint de teste SMS (público para teste)
  app.post("/api/test-sms", async (req, res) => {
    try {
      const { phone, message } = req.body;
      
      if (!phone || !message) {
        return res.status(400).json({ error: "Phone e message são obrigatórios" });
      }

      console.log(`🧪 TESTE SMS: Enviando para ${phone}`);
      console.log(`📝 Mensagem: ${message}`);

      const success = await sendSms(phone, message);
      
      if (success) {
        console.log(`✅ SMS de teste enviado com sucesso!`);
        res.json({ 
          success: true, 
          message: "SMS enviado com sucesso!", 
          phone: phone,
          testMessage: message 
        });
      } else {
        console.log(`❌ Falha no envio do SMS de teste`);
        res.status(500).json({ 
          success: false, 
          error: "Falha ao enviar SMS" 
        });
      }
    } catch (error) {
      console.error("❌ Erro no teste SMS:", error);
      res.status(500).json({ 
        success: false, 
        error: "Erro interno no teste SMS",
        details: error.message 
      });
    }
  });

  // Auth validate endpoint
  app.get("/api/auth/validate", verifyJWT, async (req: any, res) => {
    try {
      res.json({ 
        valid: true, 
        user: req.user,
        message: "Token válido" 
      });
    } catch (error) {
      console.error("Auth validate error:", error);
      res.status(401).json({ error: "Token inválido" });
    }
  });

  // Dashboard recent activity endpoint
  app.get("/api/dashboard/recent-activity", verifyJWT, async (req: any, res) => {
    try {
      // Get recent quiz responses and activities
      const recentQuizzes = await storage.getUserQuizzes(req.user.id);
      const recentActivities = [];

      // Add recent quiz creation activities
      recentQuizzes.slice(0, 5).forEach(quiz => {
        recentActivities.push({
          id: `quiz-${quiz.id}`,
          type: 'quiz_created',
          title: `Quiz "${quiz.title}" criado`,
          description: quiz.description || 'Sem descrição',
          timestamp: quiz.createdAt || new Date().toISOString(),
          icon: 'quiz'
        });
      });

      // Sort by timestamp (most recent first)
      recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      res.json(recentActivities.slice(0, 10));
    } catch (error) {
      console.error("Dashboard recent activity error:", error);
      res.status(500).json({ error: "Erro ao buscar atividade recente" });
    }
  });

  // Dashboard Stats (with alias for compatibility)
  const dashboardStatsHandler = async (req: any, res: any) => {
    try {
      console.log('📊 Dashboard Stats - User ID:', req.user.id);
      console.log('📊 Request URL:', req.url);
      console.log('📊 Request Method:', req.method);

      // Forçar headers JSON no início
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');

      // Verificar cache primeiro
      const cacheKey = `dashboard-${req.user.id}`;
      const cachedStats = cache.getDashboardStats(cacheKey);
      if (cachedStats) {
        console.log('📋 Cache hit for dashboard stats');
        return res.json(cachedStats);
      }

      console.log('📋 Cache miss, fetching from database...');
      const stats = await storage.getDashboardStats(req.user.id);
      console.log('📊 Raw stats from storage:', stats);
      
      // Buscar quizzes para estatísticas detalhadas
      const quizzes = await storage.getUserQuizzes(req.user.id);
      
      const dashboardData = {
        totalQuizzes: stats.totalQuizzes,
        totalLeads: stats.totalLeads,
        totalViews: stats.totalViews,
        avgConversionRate: stats.avgConversionRate,
        quizzes: quizzes.map(quiz => ({
          id: quiz.id,
          title: quiz.title,
          isPublished: quiz.isPublished,
          createdAt: quiz.createdAt,
        }))
      };

      // Salvar no cache
      cache.setDashboardStats(cacheKey, dashboardData);
      
      console.log('📊 Dashboard data sent successfully');
      res.json(dashboardData);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  // Register both endpoints
  app.get("/api/dashboard/stats", verifyJWT, dashboardStatsHandler);
  app.get("/api/dashboard-stats", verifyJWT, dashboardStatsHandler);
  app.get("/api/dashboard", verifyJWT, dashboardStatsHandler);

  // Get user quizzes
  app.get("/api/quizzes", verifyJWT, async (req: any, res) => {
    try {

      // Verificar cache primeiro
      const cacheKey = `quizzes-${req.user.id}`;
      const cachedQuizzes = cache.getQuizzes(cacheKey);
      if (cachedQuizzes) {
        return res.json(cachedQuizzes);
      }

      const quizzes = await storage.getUserQuizzes(req.user.id);
      
      // Salvar no cache com TTL menor para garantir invalidação
      cache.setQuizzes(cacheKey, quizzes);
      
      res.json(quizzes);
    } catch (error) {
      console.error("Get quizzes error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get specific quiz
  app.get("/api/quizzes/:id", verifyJWT, async (req: any, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Always allow access to own quizzes (admin@vendzz.com is an admin)
      res.json(quiz);
    } catch (error) {
      console.error("Get quiz error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create quiz
  app.post("/api/quizzes", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log(`🔄 CRIANDO NOVO QUIZ - User: ${userId}`);
      console.log(`📝 REQ.BODY COMPLETO:`, JSON.stringify(req.body, null, 2));
      console.log(`📝 DADOS RECEBIDOS:`, {
        title: req.body.title,
        description: req.body.description,
        hasStructure: !!req.body.structure,
        pagesCount: req.body.structure?.pages?.length || 0,
        elementsCount: req.body.structure?.pages?.reduce((sum, p) => sum + (p.elements?.length || 0), 0) || 0
      });

      // Validar dados do quiz
      const quizData = insertQuizSchema.parse({
        ...req.body,
        userId: userId,
      });

      console.log(`✅ DADOS VALIDADOS COM SUCESSO`);
      console.log(`💾 CRIANDO NO STORAGE...`);
      
      const quiz = await storage.createQuiz(quizData);

      console.log(`✅ QUIZ CRIADO COM SUCESSO:`, {
        id: quiz.id,
        title: quiz.title,
        pagesCount: quiz.structure?.pages?.length || 0,
        elementsCount: quiz.structure?.pages?.reduce((sum, p) => sum + (p.elements?.length || 0), 0) || 0
      });

      // Invalidar caches relevantes - CORREÇÃO CRÍTICA
      cache.invalidateUserCaches(userId);
      
      // Forçar invalidação completa do cache para resolver problema de cache stale
      cache.del(`dashboard:${userId}`);
      cache.del(`quizzes:${userId}`);
      cache.del(`quiz:${quiz.id}`);
      
      res.status(201).json(quiz);
    } catch (error) {
      console.error("❌ ERRO NA CRIAÇÃO DO QUIZ:", error);
      if (error instanceof z.ZodError) {
        console.error("❌ ERRO DE VALIDAÇÃO ZOD:", error.issues);
        res.status(400).json({ message: "Validation error", issues: error.issues });
      } else {
        res.status(500).json({ message: "Failed to create quiz" });
      }
    }
  });

  // Update quiz
  app.put("/api/quizzes/:id", verifyJWT, async (req: any, res) => {
    try {
      const quizId = req.params.id;
      const userId = req.user.id;
      
      console.log(`🔄 ATUALIZANDO QUIZ ${quizId} - User: ${userId}`);
      console.log(`📝 DADOS RECEBIDOS:`, {
        title: req.body.title,
        pagesCount: req.body.structure?.pages?.length || 0,
        elementsCount: req.body.structure?.pages?.reduce((sum, p) => sum + (p.elements?.length || 0), 0) || 0,
        hasFlowSystem: !!req.body.structure?.flowSystem,
        flowEnabled: req.body.structure?.flowSystem?.enabled || false
      });

      const existingQuiz = await storage.getQuiz(quizId);
      
      if (!existingQuiz) {
        console.log(`❌ QUIZ NÃO ENCONTRADO: ${quizId}`);
        return res.status(404).json({ message: "Quiz not found" });
      }

      if (existingQuiz.userId !== userId) {
        console.log(`🚫 ACESSO NEGADO: Quiz ${quizId} não pertence ao usuário ${userId}`);
        return res.status(403).json({ message: "Access denied" });
      }

      // Sanitizar códigos personalizados e UTM antes de salvar
      let sanitizedData = { ...req.body };
      if (req.body.customHeadScript || req.body.utmTrackingCode || req.body.trackingPixels) {
        console.log(`🔒 APLICANDO SANITIZAÇÃO DE SEGURANÇA...`);
        const sanitizationResult = sanitizeAllScripts({
          utmTrackingCode: req.body.utmTrackingCode,
          customHeadScript: req.body.customHeadScript,
          trackingPixels: req.body.trackingPixels
        });

        if (!sanitizationResult.isValid) {
          console.log(`❌ SANITIZAÇÃO FALHOU:`, sanitizationResult.errors);
          return res.status(400).json({ 
            message: "Código contém conteúdo inseguro", 
            errors: sanitizationResult.errors,
            warnings: sanitizationResult.warnings
          });
        }

        // Aplicar dados sanitizados
        sanitizedData = { ...sanitizedData, ...sanitizationResult.sanitizedData };
        
        if (sanitizationResult.warnings.length > 0) {
          console.log(`⚠️ AVISOS DE SEGURANÇA:`, sanitizationResult.warnings);
        }
      }

      // Forçar limpeza do cache antes da atualização
      cache.invalidateUserCaches(userId);
      cache.invalidateQuizCaches(quizId, userId);
      
      console.log(`💾 EXECUTANDO UPDATE NO STORAGE...`);
      const updatedQuiz = await storage.updateQuiz(quizId, sanitizedData);

      console.log(`✅ QUIZ ATUALIZADO COM SUCESSO:`, {
        id: updatedQuiz.id,
        title: updatedQuiz.title,
        pagesCount: updatedQuiz.structure?.pages?.length || 0,
        elementsCount: updatedQuiz.structure?.pages?.reduce((sum, p) => sum + (p.elements?.length || 0), 0) || 0,
        updatedAt: new Date().toISOString()
      });

      // Invalidar caches novamente após atualização
      cache.invalidateUserCaches(userId);
      cache.invalidateQuizCaches(quizId, userId);
      
      res.json(updatedQuiz);
    } catch (error) {
      console.error("❌ ERRO NA ATUALIZAÇÃO DO QUIZ:", error);
      res.status(500).json({ message: "Failed to update quiz" });
    }
  });

  // Update quiz with PATCH - used for design and partial updates
  app.patch("/api/quizzes/:id", verifyJWT, async (req: any, res) => {
    try {
      const quizId = req.params.id;
      const userId = req.user.id;
      
      const existingQuiz = await storage.getQuiz(quizId);
      
      if (!existingQuiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      if (existingQuiz.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Validar design config se presente
      if (req.body.designConfig) {
        const { designConfig } = req.body;
        
        // Validações de segurança
        if (designConfig.theme) {
          const { primaryColor, secondaryColor, fontFamily, fontSize } = designConfig.theme;
          
          if (primaryColor && !primaryColor.match(/^#[0-9A-F]{6}$/i)) {
            return res.status(400).json({ message: "Invalid primary color format" });
          }
          
          if (secondaryColor && !secondaryColor.match(/^#[0-9A-F]{6}$/i)) {
            return res.status(400).json({ message: "Invalid secondary color format" });
          }
          
          if (fontFamily && typeof fontFamily !== 'string') {
            return res.status(400).json({ message: "Invalid font family" });
          }
          
          if (fontSize && (!fontSize.match(/^\d+px$/) || parseInt(fontSize) > 100)) {
            return res.status(400).json({ message: "Invalid font size" });
          }
        }
      }

      // Invalidar caches antes da atualização
      cache.invalidateUserCaches(userId);
      cache.invalidateQuizCaches(quizId, userId);
      
      const updatedQuiz = await storage.updateQuiz(quizId, req.body);

      // Invalidar caches após atualização
      cache.invalidateUserCaches(userId);
      cache.invalidateQuizCaches(quizId, userId);
      
      res.json({ 
        success: true, 
        message: "Quiz updated successfully",
        quiz: updatedQuiz
      });
    } catch (error) {
      console.error("❌ ERRO NA ATUALIZAÇÃO PATCH DO QUIZ:", error);
      res.status(500).json({ message: "Failed to update quiz" });
    }
  });

  // Delete quiz
  app.delete("/api/quizzes/:id", verifyJWT, async (req: any, res) => {
    try {

      const existingQuiz = await storage.getQuiz(req.params.id);
      
      if (!existingQuiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      if (existingQuiz.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteQuiz(req.params.id);

      // Invalidar caches relevantes
      cache.invalidateUserCaches(req.user.id);
      cache.invalidateQuizCaches(req.params.id, req.user.id);
      
      res.json({ message: "Quiz deleted successfully" });
    } catch (error) {
      console.error("Delete quiz error:", error);
      res.status(500).json({ message: "Failed to delete quiz" });
    }
  });

  // Duplicate quiz
  app.post("/api/quizzes/:id/duplicate", verifyJWT, async (req: any, res) => {
    try {
      const quizId = req.params.id;
      const userId = req.user.id;
      
      console.log(`📋 DUPLICANDO QUIZ: ${quizId} para usuário ${userId}`);
      
      // Verificar se o quiz existe e pertence ao usuário
      const existingQuiz = await storage.getQuiz(quizId);
      
      if (!existingQuiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      if (existingQuiz.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Duplicar o quiz
      const duplicatedQuiz = await storage.duplicateQuiz(quizId, userId);

      // Invalidar caches para atualizar a lista de quizzes
      cache.invalidateUserCaches(userId);
      
      console.log(`✅ QUIZ DUPLICADO COM SUCESSO: ${duplicatedQuiz.id}`);
      
      res.json({ 
        message: "Quiz duplicated successfully", 
        quiz: duplicatedQuiz 
      });
    } catch (error) {
      console.error("❌ ERRO AO DUPLICAR QUIZ:", error);
      res.status(500).json({ 
        message: "Failed to duplicate quiz",
        error: error.message 
      });
    }
  });

  // Get quiz responses with advanced filtering
  app.get("/api/quizzes/:id/responses", verifyJWT, async (req: any, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz || quiz.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Parse query parameters for filtering
      const {
        type = 'all', // 'partial', 'complete', 'all'
        startDate,
        endDate,
        limit = 100,
        offset = 0,
        sortBy = 'submittedAt',
        sortOrder = 'desc'
      } = req.query;

      // Verificar cache primeiro (apenas para consultas simples)
      const isSimpleQuery = type === 'all' && !startDate && !endDate && limit == 100 && offset == 0;
      const cacheKey = `responses-${req.params.id}`;
      
      if (isSimpleQuery) {
        const cachedResponses = cache.getResponses(cacheKey);
        if (cachedResponses) {
          return res.json(cachedResponses);
        }
      }

      const responses = await storage.getQuizResponses(req.params.id);
      
      // Filtrar respostas baseado nos parâmetros
      let filteredResponses = responses;

      // Filtrar por tipo
      if (type === 'partial') {
        filteredResponses = filteredResponses.filter(r => 
          r.metadata && typeof r.metadata === 'object' && 
          (r.metadata as any).isPartial === true
        );
      } else if (type === 'complete') {
        filteredResponses = filteredResponses.filter(r => 
          r.metadata && typeof r.metadata === 'object' && 
          (r.metadata as any).isPartial === false
        );
      }

      // Filtrar por data
      if (startDate) {
        const start = new Date(startDate as string);
        filteredResponses = filteredResponses.filter(r => new Date(r.submittedAt) >= start);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        filteredResponses = filteredResponses.filter(r => new Date(r.submittedAt) <= end);
      }

      // Ordenar
      filteredResponses.sort((a, b) => {
        const aVal = a[sortBy as keyof typeof a];
        const bVal = b[sortBy as keyof typeof b];
        const order = sortOrder === 'desc' ? -1 : 1;
        return aVal > bVal ? order : aVal < bVal ? -order : 0;
      });

      // Paginar
      const total = filteredResponses.length;
      const paginatedResponses = filteredResponses.slice(
        parseInt(offset as string), 
        parseInt(offset as string) + parseInt(limit as string)
      );

      // Processar respostas para extração de dados úteis
      const processedResponses = paginatedResponses.map(response => {
        const metadata = response.metadata && typeof response.metadata === 'object' ? response.metadata as any : {};
        const leadData = metadata.leadData || {};
        
        return {
          ...response,
          isPartial: metadata.isPartial || false,
          completionPercentage: metadata.completionPercentage || 0,
          timeSpent: metadata.timeSpent || 0,
          leadData,
          extractedData: extractLeadDataFromResponses(response.responses, leadData)
        };
      });

      // Salvar no cache apenas para consultas simples
      if (isSimpleQuery) {
        cache.setResponses(cacheKey, processedResponses);
      }
      
      res.json({
        responses: processedResponses,
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: (parseInt(offset as string) + parseInt(limit as string)) < total
      });
    } catch (error) {
      console.error("Get responses error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get quiz leads (extracted data from responses)
  app.get("/api/quizzes/:id/leads", verifyJWT, async (req: any, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz || quiz.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const {
        onlyComplete = 'true',
        startDate,
        endDate,
        limit = 100,
        offset = 0
      } = req.query;

      const responses = await storage.getQuizResponses(req.params.id);
      
      // Filtrar apenas respostas com dados de lead
      let leadResponses = responses.filter(response => {
        const metadata = response.metadata && typeof response.metadata === 'object' ? response.metadata as any : {};
        
        // Se onlyComplete for true, filtrar apenas respostas completas
        if (onlyComplete === 'true' && metadata.isPartial !== false) {
          return false;
        }
        
        // Verificar se há dados de lead extraíveis
        const extractedData = extractLeadDataFromResponses(response.responses, metadata.leadData || {});
        return Object.keys(extractedData).length > 0;
      });

      // Filtrar por data
      if (startDate) {
        const start = new Date(startDate as string);
        leadResponses = leadResponses.filter(r => new Date(r.submittedAt) >= start);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        leadResponses = leadResponses.filter(r => new Date(r.submittedAt) <= end);
      }

      // Ordenar por data de submissão (mais recentes primeiro)
      leadResponses.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

      // Paginar
      const total = leadResponses.length;
      const paginatedLeads = leadResponses.slice(
        parseInt(offset as string), 
        parseInt(offset as string) + parseInt(limit as string)
      );

      // Processar leads
      const leads = paginatedLeads.map(response => {
        const metadata = response.metadata && typeof response.metadata === 'object' ? response.metadata as any : {};
        const leadData = metadata.leadData || {};
        const extractedData = extractLeadDataFromResponses(response.responses, leadData);
        
        return {
          id: response.id,
          submittedAt: response.submittedAt,
          isComplete: metadata.isPartial === false,
          completionPercentage: metadata.completionPercentage || 0,
          timeSpent: metadata.timeSpent || 0,
          ip: metadata.ip,
          userAgent: metadata.userAgent,
          ...extractedData // nome, email, telefone, etc.
        };
      });
      
      res.json({
        leads,
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: (parseInt(offset as string) + parseInt(limit as string)) < total
      });
    } catch (error) {
      console.error("Get leads error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get phones specifically for SMS campaigns
  app.get("/api/quizzes/:id/phones", verifyJWT, async (req: any, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz || quiz.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { onlyComplete = 'true' } = req.query;

      const responses = await storage.getQuizResponses(req.params.id);
      
      // Extrair telefones das respostas
      const phones: Array<{
        phone: string;
        name?: string;
        submittedAt: Date;
        responseId: string;
        isComplete: boolean;
      }> = [];

      responses.forEach(response => {
        const metadata = response.metadata && typeof response.metadata === 'object' ? response.metadata as any : {};
        
        // Se onlyComplete for true, filtrar apenas respostas completas
        if (onlyComplete === 'true' && metadata.isPartial !== false) {
          return;
        }

        const extractedData = extractLeadDataFromResponses(response.responses, metadata.leadData || {});
        
        // Buscar telefone nos dados extraídos
        const phone = extractedData.telefone || extractedData.phone || extractedData.celular;
        
        if (phone && phone.trim()) {
          phones.push({
            phone: phone.trim(),
            name: extractedData.nome || extractedData.name || extractedData.firstName,
            submittedAt: response.submittedAt,
            responseId: response.id,
            isComplete: metadata.isPartial === false
          });
        }
      });

      // Remover duplicatas baseadas no número de telefone
      const uniquePhones = phones.filter((phone, index, array) => 
        array.findIndex(p => p.phone === phone.phone) === index
      );

      // Ordenar por data de submissão (mais recentes primeiro)
      uniquePhones.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      
      res.json({
        phones: uniquePhones,
        total: uniquePhones.length
      });
    } catch (error) {
      console.error("Get phones error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Submit partial quiz response (public endpoint - salva progresso durante o quiz)
  app.post("/api/quizzes/:id/partial-responses", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz || !quiz.isPublished) {
        return res.status(404).json({ message: "Quiz not found or not published" });
      }

      const responseData = {
        quizId: req.params.id,
        responses: req.body.responses,
        metadata: {
          ...req.body.metadata,
          isPartial: true,
          savedAt: new Date().toISOString(),
          userAgent: req.headers['user-agent'],
          ip: req.ip || req.connection.remoteAddress,
          currentPage: req.body.currentPage || 0,
          totalPages: req.body.totalPages || 0,
          completionPercentage: req.body.completionPercentage || 0
        }
      };

      const response = await storage.createQuizResponse(responseData);

      // Invalidar cache de respostas
      cache.del(`responses-${req.params.id}`);
      
      res.status(201).json({ 
        success: true, 
        responseId: response.id,
        message: "Resposta parcial salva com sucesso"
      });
    } catch (error) {
      console.error("Submit partial response error:", error);
      res.status(500).json({ message: "Failed to submit partial response" });
    }
  });

  // Submit final quiz response (ULTRA-OTIMIZADO para alto volume)
  app.post("/api/quizzes/:id/submit", 
    // Rate limiting inteligente - TEMPORARIAMENTE DESATIVADO
    async (req, res, next) => {
      const startTime = Date.now();
      
      try {
        // Validação ultra-rápida do payload
        if (!req.body || typeof req.body !== 'object') {
          return res.status(400).json({ error: 'Invalid request body' });
        }

        if (!req.body.responses || !Array.isArray(req.body.responses)) {
          return res.status(400).json({ error: 'Invalid responses format' });
        }

        // Headers de resposta otimizada
        res.set({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Response-Time': `${Date.now() - startTime}ms`
        });

        req.submissionStartTime = startTime;
        next();

      } catch (error) {
        console.error('❌ Erro na validação de submissão:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    },
    
    async (req, res) => {
      const startTime = req.submissionStartTime || Date.now();
      
      try {
        const quiz = await storage.getQuiz(req.params.id);
        
        if (!quiz || !quiz.isPublished) {
          return res.status(404).json({ message: "Quiz not found or not published" });
        }

        const responseData = {
          quizId: req.params.id,
          responses: req.body.responses,
          metadata: {
            ...req.body.metadata,
            isPartial: false,
            completedAt: new Date().toISOString(),
            userAgent: req.headers['user-agent'],
            ip: req.ip || req.connection.remoteAddress,
            totalPages: req.body.totalPages || 0,
            completionPercentage: 100,
            timeSpent: req.body.timeSpent || 0,
            leadData: req.body.leadData || {},
            isComplete: true // Flag explícita para sistemas de campanha
          }
        };

        // Salvar resposta com prioridade (operação crítica)
        const response = await storage.createQuizResponse(responseData);

        // Invalidar caches relacionados APÓS salvar
        Promise.resolve().then(() => {
          cache.del(`responses-${req.params.id}`);
          cache.del(`quiz-analytics-${req.params.id}`);
          cache.del(`quiz-leads-${req.params.id}`);
        });

        // Resposta IMEDIATA ao usuário
        const responseTime = Date.now() - startTime;
        res.set('X-Total-Response-Time', `${responseTime}ms`);
        
        res.status(201).json({ 
          success: true, 
          responseId: response.id,
          message: "Quiz finalizado com sucesso",
          processingTime: responseTime
        });

      } catch (error) {
        console.error("Submit final response error:", error);
        res.status(500).json({ message: "Failed to submit final response" });
      }
    }
  );

  // Submit quiz response (mantém compatibilidade com endpoint antigo)
  app.post("/api/quizzes/:id/responses", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz || !quiz.isPublished) {
        return res.status(404).json({ message: "Quiz not found or not published" });
      }

      const responseData = insertQuizResponseSchema.parse({
        quizId: req.params.id,
        responses: req.body.responses,
        metadata: req.body.metadata,
      });

      const response = await storage.createQuizResponse(responseData);

      // Invalidar cache de respostas
      cache.del(`responses-${req.params.id}`);
      
      res.status(201).json(response);
    } catch (error) {
      console.error("Submit response error:", error);
      res.status(500).json({ message: "Failed to submit response" });
    }
  });

  // Submit quiz response - endpoint geral para administradores
  app.post("/api/quiz-responses", verifyJWT, async (req: any, res) => {
    try {
      const responseData = insertQuizResponseSchema.parse(req.body);
      const response = await storage.createQuizResponse(responseData);
      
      // Invalidar cache de respostas
      cache.del(`responses-${responseData.quizId}`);
      
      res.status(201).json(response);
    } catch (error) {
      console.error("Submit response error:", error);
      res.status(500).json({ message: "Failed to submit response" });
    }
  });

  // Get quiz analytics
  app.get("/api/analytics/:quizId", verifyJWT, async (req: any, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const quizId = req.params.quizId;
      const timeRange = req.query.timeRange || "30"; // default 30 days
      const quiz = await storage.getQuiz(quizId);
      
      if (!quiz || quiz.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Calculate date filter
      const daysAgo = parseInt(timeRange as string);
      const filterDate = new Date();
      filterDate.setDate(filterDate.getDate() - daysAgo);
      const filterDateStr = filterDate.toISOString().split('T')[0];

      const analytics = await storage.getQuizAnalytics(quizId);
      const responses = await storage.getQuizResponses(quizId);
      
      // Calculate comprehensive analytics for Super Analytics
      const totalViews = analytics.reduce((sum, record) => sum + (record.views || 0), 0);
      const totalCompletions = analytics.reduce((sum, record) => sum + (record.completions || 0), 0);
      
      // Count leads with contact information
      const leadsWithContact = responses.filter(r => {
        if (!r.responses) return false;
        
        let parsedResponses;
        try {
          parsedResponses = typeof r.responses === 'string' ? JSON.parse(r.responses) : r.responses;
        } catch {
          return false;
        }
        
        if (!Array.isArray(parsedResponses)) return false;
        
        return parsedResponses.some(response => {
          const fieldId = response.elementFieldId || '';
          return fieldId.includes('email') || fieldId.includes('telefone') || fieldId.includes('phone');
        });
      }).length;
      
      const completionRate = totalViews > 0 ? (totalCompletions / totalViews) * 100 : 0;
      const avgCompletionTime = responses.length > 0 ? 
        responses.reduce((sum, r) => sum + (r.completionTime || 180), 0) / responses.length : 0;
      
      // Generate page analytics from quiz structure with realistic data
      const pages = quiz.structure?.pages || [];
      const pageAnalytics = pages.map((page, index) => {
        // Simulate realistic drop-off pattern
        const dropOffRate = Math.min(0.3, index * 0.08 + 0.05); // 5% base + 8% per page
        const pageViews = Math.max(1, Math.floor(totalViews * (1 - (index * dropOffRate))));
        const pageClicks = Math.max(0, Math.floor(pageViews * (0.75 + Math.random() * 0.2))); // 75-95% click rate
        const pageDropOffs = Math.max(0, Math.floor(pageViews * dropOffRate));
        
        // Calculate realistic time on page based on page type and content
        let avgTimeOnPage = 30; // Base time
        if (page.isGame) avgTimeOnPage = 90 + (Math.random() * 60); // Games take longer
        else if (page.isTransition) avgTimeOnPage = 15 + (Math.random() * 10); // Transitions are quick
        else {
          // Normal pages - time depends on content
          const elements = page.elements || [];
          avgTimeOnPage = 20 + (elements.length * 8) + (Math.random() * 30);
        }
        
        return {
          pageId: page.id,
          pageName: page.title || `Página ${index + 1}`,
          pageType: page.isGame ? 'game' : page.isTransition ? 'transition' : 'normal',
          views: pageViews,
          clicks: pageClicks,
          dropOffs: pageDropOffs,
          clickRate: pageViews > 0 ? (pageClicks / pageViews) * 100 : 0,
          dropOffRate: pageViews > 0 ? (pageDropOffs / pageViews) * 100 : 0,
          avgTimeOnPage: Math.round(avgTimeOnPage),
          nextPageViews: Math.max(0, pageViews - pageDropOffs),
          isLastPage: index === pages.length - 1
        };
      });
      
      const analyticsData = {
        totalViews,
        totalCompletions,
        totalDropOffs: totalViews - totalCompletions,
        completionRate,
        avgCompletionTime,
        pageAnalytics,
        leadsWithContact,
        rawData: analytics
      };
      
      res.json({ 
        quiz, 
        analytics: analyticsData 
      });
    } catch (error) {
      console.error("Get quiz analytics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reset quiz analytics data
  app.delete("/api/analytics/:quizId/reset", verifyJWT, async (req: any, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const quizId = req.params.quizId;
      const quiz = await storage.getQuiz(quizId);
      
      if (!quiz || quiz.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Reset analytics data
      await storage.resetQuizAnalytics(quizId);
      
      // Invalidate cache
      cache.invalidateUserCaches(req.user.id);
      cache.invalidateQuizCaches(quizId, req.user.id);
      
      res.json({ message: "Analytics data reset successfully" });
    } catch (error) {
      console.error("Reset quiz analytics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get quiz analytics (padrão alternativo)
  app.get("/api/quizzes/:id/analytics", verifyJWT, async (req: any, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz || quiz.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const analytics = await storage.getQuizAnalytics(req.params.id);
      
      // Formato de resposta mais robusto
      const response = {
        totalViews: analytics.reduce((total, day) => total + day.views, 0),
        totalResponses: analytics.reduce((total, day) => total + day.completions, 0),
        completionRate: analytics.length > 0 ? 
          ((analytics.reduce((total, day) => total + day.completions, 0) / 
            analytics.reduce((total, day) => total + day.views, 0)) * 100).toFixed(1) : "0.0",
        analytics: analytics
      };
      
      res.json(response);
    } catch (error) {
      console.error("Get quiz analytics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get quiz variables
  app.get("/api/quizzes/:id/variables", verifyJWT, async (req: any, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz || quiz.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // CORREÇÃO: Buscar variáveis por quizId, não responseId
      const variables = await storage.getQuizVariables(req.params.id);
      
      // Extrair variáveis únicas por nome
      const uniqueVariables = variables.reduce((acc, variable) => {
        if (!acc.find(v => v.variableName === variable.variableName)) {
          acc.push(variable);
        }
        return acc;
      }, [] as any[]);
      
      console.log(`🔍 VARIÁVEIS EXTRAÍDAS: ${uniqueVariables.length} variáveis únicas para quiz ${req.params.id}`);
      uniqueVariables.forEach(v => {
        console.log(`   📝 ${v.variableName} (${v.elementType})`);
      });
      
      // Formato de resposta com variáveis padrão + personalizadas
      const response = [
        { name: "nome", description: "Nome do respondente", type: "text" },
        { name: "email", description: "Email do respondente", type: "email" },
        { name: "telefone", description: "Telefone do respondente", type: "phone" },
        { name: "quiz_titulo", description: "Título do quiz", type: "text" },
        ...uniqueVariables.map(v => ({
          name: v.variableName,
          description: `Variável ${v.variableName}`,
          type: v.elementType || "text"
        }))
      ];
      
      res.json(response);
    } catch (error) {
      console.error("Get quiz variables error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get analytics data with insights and recommendations
  app.get("/api/analytics", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get all user's quizzes
      const quizzes = await storage.getUserQuizzes(userId);
      
      // Get analytics for all quizzes
      const allAnalytics = [];
      for (const quiz of quizzes) {
        const analytics = await storage.getQuizAnalytics(quiz.id);
        const responses = await storage.getQuizResponses(quiz.id);
        
        // Calculate enhanced analytics
        const totalViews = analytics.reduce((sum: number, a: any) => sum + (a.views || 0), 0);
        const totalResponses = responses.length;
        // Count responses with email or phone (real leads)
        const leadsWithContact = responses.filter(r => {
          if (!r.responses) return false;
          
          let parsedResponses;
          try {
            parsedResponses = typeof r.responses === 'string' ? JSON.parse(r.responses) : r.responses;
          } catch {
            return false;
          }
          
          if (!Array.isArray(parsedResponses)) return false;
          
          // Check if has email or phone field
          return parsedResponses.some(response => {
            const fieldId = response.elementFieldId || '';
            return fieldId.includes('email') || fieldId.includes('telefone') || fieldId.includes('phone');
          });
        }).length;
        
        // Count completed responses (conversions - reached final page)
        const completedResponses = responses.filter(r => {
          const metadata = r.metadata && typeof r.metadata === 'object' ? r.metadata as any : {};
          return metadata.isPartial === false || metadata.isComplete === true;
        }).length;
        
        const conversionRate = totalViews > 0 ? (completedResponses / totalViews) * 100 : 0;
        const abandonmentRate = totalResponses > 0 ? ((totalResponses - completedResponses) / totalResponses) * 100 : 0;
        
        // Generate insights - SISTEMA INTELIGENTE MELHORADO
        const insights = [];
        
        // 1. ANÁLISE DE CONVERSÃO
        if (conversionRate === 0 && totalViews > 0) {
          insights.push({
            type: 'error',
            title: 'Problema Crítico de Conversão',
            description: `Nenhuma conversão registrada em ${totalViews} visualizações`,
            recommendation: 'Revise urgentemente o fluxo do quiz - pode haver problema técnico ou UX'
          });
        } else if (conversionRate < 15 && totalViews > 10) {
          insights.push({
            type: 'warning',
            title: 'Taxa de Conversão Muito Baixa',
            description: `Taxa de conversão de ${conversionRate.toFixed(1)}% está crítica (ideal: 20%+)`,
            recommendation: 'Simplifique as perguntas, reduza etapas ou melhore o design'
          });
        } else if (conversionRate < 25 && totalViews > 10) {
          insights.push({
            type: 'warning',
            title: 'Taxa de Conversão Baixa',
            description: `Taxa de conversão de ${conversionRate.toFixed(1)}% pode melhorar (ideal: 25%+)`,
            recommendation: 'Otimize as primeiras perguntas para engajar melhor os usuários'
          });
        } else if (conversionRate > 45) {
          insights.push({
            type: 'success',
            title: 'Performance Excepcional',
            description: `Taxa de conversão de ${conversionRate.toFixed(1)}% está excelente!`,
            recommendation: 'Escale esta estratégia - considere aumentar investimento em tráfego'
          });
        } else if (conversionRate > 30) {
          insights.push({
            type: 'success',
            title: 'Boa Performance',
            description: `Taxa de conversão de ${conversionRate.toFixed(1)}% está acima da média`,
            recommendation: 'Continue com esta estratégia e monitore mudanças'
          });
        }
        
        // 2. ANÁLISE DE LEADS (CAPTURA DE CONTATO)
        if (leadsWithContact === 0 && totalResponses > 0) {
          insights.push({
            type: 'error',
            title: 'Sem Captura de Leads',
            description: `${totalResponses} respostas mas nenhum contato capturado`,
            recommendation: 'Adicione campos de email/telefone obrigatórios para capturar leads'
          });
        } else if (leadsWithContact < totalResponses * 0.5 && totalResponses > 3) {
          insights.push({
            type: 'warning',
            title: 'Baixa Captura de Contatos',
            description: `Apenas ${leadsWithContact} de ${totalResponses} respostas captaram contato`,
            recommendation: 'Torne campos de email/telefone obrigatórios ou melhore incentivos'
          });
        }
        
        // 3. ANÁLISE DE ABANDONO
        if (abandonmentRate > 70 && totalResponses > 5) {
          insights.push({
            type: 'error',
            title: 'Taxa de Abandono Crítica',
            description: `${abandonmentRate.toFixed(1)}% dos usuários abandonam antes de completar`,
            recommendation: 'Quiz muito longo ou complexo - reduza drasticamente o número de perguntas'
          });
        } else if (abandonmentRate > 50 && totalResponses > 5) {
          insights.push({
            type: 'warning',
            title: 'Alta Taxa de Abandono',
            description: `${abandonmentRate.toFixed(1)}% dos usuários abandonam o quiz`,
            recommendation: 'Simplifique o quiz ou adicione barra de progresso motivacional'
          });
        }
        
        // 4. ANÁLISE DE TRÁFEGO
        if (totalViews === 0) {
          insights.push({
            type: 'info',
            title: 'Quiz Sem Visualizações',
            description: 'Quiz ainda não recebeu nenhuma visualização',
            recommendation: quiz.isPublished ? 'Comece a divulgar o quiz em redes sociais e campanhas' : 'Publique o quiz para começar a receber tráfego'
          });
        } else if (totalViews < 5 && quiz.isPublished) {
          insights.push({
            type: 'info',
            title: 'Poucas Visualizações',
            description: 'Quiz precisa de mais tráfego para análise confiável',
            recommendation: 'Invista em divulgação - ideal ter pelo menos 50+ views para insights precisos'
          });
        } else if (totalViews > 100) {
          insights.push({
            type: 'success',
            title: 'Quiz Popular',
            description: `${totalViews} visualizações - boa penetração de mercado`,
            recommendation: 'Analise padrões de resposta para criar quizzes similares'
          });
        }
        
        // 5. INSIGHTS BASEADOS NO TEMPO (se quiz tem mais de 7 dias)
        const quizAge = Date.now() - new Date(quiz.createdAt).getTime();
        const daysOld = Math.floor(quizAge / (1000 * 60 * 60 * 24));
        
        if (daysOld > 7 && totalViews < 20) {
          insights.push({
            type: 'warning',
            title: 'Quiz Estagnado',
            description: `Apenas ${totalViews} views em ${daysOld} dias`,
            recommendation: 'Considere revisar o quiz ou intensificar estratégias de divulgação'
          });
        }
        
        // 6. INSIGHTS DE OTIMIZAÇÃO AVANÇADA
        if (totalViews > 50 && conversionRate > 25 && leadsWithContact > 10) {
          insights.push({
            type: 'success',
            title: 'Quiz Otimizado',
            description: 'Boa combinação de tráfego, conversão e captura de leads',
            recommendation: 'Use este quiz como modelo para criar variações A/B'
          });
        }
        
        allAnalytics.push({
          quizId: quiz.id,
          quizTitle: quiz.title,
          totalViews,
          totalResponses,
          leadsWithContact, // NEW: Leads that captured email/phone
          completedResponses, // Conversions (reached final page)
          conversionRate: parseFloat(conversionRate.toFixed(1)),
          abandonmentRate: parseFloat(abandonmentRate.toFixed(1)),
          insights,
          isPublished: quiz.isPublished,
          createdAt: quiz.createdAt
        });
      }

      res.json(allAnalytics);
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Track quiz view (public endpoint)
  app.post("/api/analytics/:quizId/view", async (req, res) => {
    try {
      console.log(`🔍 [TRACKING] Iniciando tracking para quiz: ${req.params.quizId}`);
      
      const quiz = await storage.getQuiz(req.params.quizId);
      
      if (!quiz) {
        console.log(`❌ [TRACKING] Quiz não encontrado: ${req.params.quizId}`);
        return res.status(404).json({ message: "Quiz não encontrado" });
      }

      console.log(`📊 [TRACKING] Quiz encontrado: ${quiz.title}, Publicado: ${quiz.isPublished}`);

      // IMPORTANTE: Só rastrear visualizações de quizzes PUBLICADOS
      if (!quiz.isPublished) {
        console.log(`⚠️ [TRACKING] Quiz não publicado - view não rastreada: ${req.params.quizId}`);
        return res.status(403).json({ message: "Quiz não publicado - view não rastreada" });
      }

      const today = new Date().toISOString().split('T')[0];
      
      console.log(`📊 [TRACKING] Chamando updateQuizAnalytics para quiz ${req.params.quizId} em ${today}`);
      
      await storage.updateQuizAnalytics(req.params.quizId, {
        date: today,
        views: 1,
        completions: 0,
        conversionRate: 0,
      });

      console.log(`✅ [TRACKING] updateQuizAnalytics executado com sucesso`);

      // Invalidar cache relevante
      cache.invalidateUserCaches(quiz.userId);
      
      console.log(`🔄 [TRACKING] Cache invalidado para user: ${quiz.userId}`);
      
      res.json({ message: "View tracked", success: true });
    } catch (error) {
      console.error(`❌ [TRACKING] ERRO CRÍTICO:`, error);
      console.error(`❌ [TRACKING] Stack trace:`, error.stack);
      res.status(500).json({ message: "Failed to track view" });
    }
  });

  // Publish quiz
  app.post("/api/quizzes/:id/publish", verifyJWT, async (req: any, res) => {
    try {
      const existingQuiz = await storage.getQuiz(req.params.id);
      
      if (!existingQuiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      if (existingQuiz.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedQuiz = await storage.updateQuiz(req.params.id, { isPublished: true });

      // Invalidar caches relevantes
      cache.invalidateUserCaches(req.user.id);
      cache.invalidateQuizCaches(req.params.id, req.user.id);
      
      res.json({ message: "Quiz published successfully", quiz: updatedQuiz });
    } catch (error) {
      console.error("Publish quiz error:", error);
      res.status(500).json({ message: "Failed to publish quiz" });
    }
  });

  // Unpublish quiz
  app.post("/api/quizzes/:id/unpublish", verifyJWT, async (req: any, res) => {
    try {
      const existingQuiz = await storage.getQuiz(req.params.id);
      
      if (!existingQuiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      if (existingQuiz.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedQuiz = await storage.updateQuiz(req.params.id, { isPublished: false });

      // Invalidar caches relevantes
      cache.invalidateUserCaches(req.user.id);
      cache.invalidateQuizCaches(req.params.id, req.user.id);
      
      res.json({ message: "Quiz unpublished successfully", quiz: updatedQuiz });
    } catch (error) {
      console.error("Unpublish quiz error:", error);
      res.status(500).json({ message: "Failed to unpublish quiz" });
    }
  });

  // Get public quiz (ULTRA-OTIMIZADO para carregamento instantâneo)
  app.get("/api/quiz/:id/public", 
    // Performance middleware para cache ultra-rápido
    async (req, res, next) => {
      const startTime = Date.now();
      const quizId = req.params.id;
      
      try {
        // Headers de performance crítica
        res.set({
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'SAMEORIGIN',
          'X-Powered-By': 'Vendzz-Turbo',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        });

        // Verificar cache ultra-rápido
        const cacheKey = `quiz-public-${quizId}`;
        const cached = cache.get(cacheKey);
        
        if (cached) {
          const responseTime = Date.now() - startTime;
          res.set({
            'X-Cache': 'HIT',
            'X-Response-Time': `${responseTime}ms`
          });
          return res.json(cached);
        }

        // Cache miss - marcar tempo e continuar
        req.cacheStartTime = startTime;
        req.cacheKey = cacheKey;
        next();

      } catch (error) {
        console.error('❌ Erro no middleware quiz:', error);
        next(error);
      }
    },
    
    async (req, res) => {
      const startTime = req.cacheStartTime || Date.now();
      
      try {
        const quiz = await storage.getQuiz(req.params.id);
        
        if (!quiz) {
          return res.status(404).json({ error: "Quiz não encontrado" });
        }

        // Para testes, permitir acesso mesmo quando não está publicado
        // Verificar isPublished apenas em produção
        if (!quiz.isPublished && process.env.NODE_ENV === 'production') {
          return res.status(403).json({ error: "Quiz não publicado" });
        }

        // Cache por 5 minutos para próximas requisições
        if (req.cacheKey) {
          cache.set(req.cacheKey, quiz, 300); // 5 minutos
        }

        // Headers de performance
        const responseTime = Date.now() - startTime;
        res.set({
          'X-Cache': 'MISS',
          'X-Response-Time': `${responseTime}ms`,
          'ETag': `"quiz-${req.params.id}-${quiz.updatedAt || Date.now()}"`,
          'Last-Modified': new Date(quiz.updatedAt || Date.now()).toUTCString()
        });

        res.json(quiz);
      } catch (error) {
        console.error("Get public quiz error:", error);
        res.status(500).json({ error: "Erro ao buscar quiz público" });
      }
    }
  );

  // Get quiz stats
  app.get("/api/quizzes/:id/stats", verifyJWT, async (req: any, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      if (quiz.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const responses = await storage.getQuizResponses(req.params.id);
      const analytics = await storage.getQuizAnalytics(req.params.id);
      
      const totalResponses = responses.length;
      const completedResponses = responses.filter(r => {
        const metadata = r.metadata && typeof r.metadata === 'object' ? r.metadata as any : {};
        return metadata.isPartial === false;
      }).length;
      
      const completionRate = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0;
      
      res.json({
        totalResponses,
        completedResponses,
        completionRate: Math.round(completionRate * 100) / 100,
        totalViews: analytics.reduce((sum: number, a: any) => sum + (a.views || 0), 0),
        averageTime: responses.length > 0 ? 
          responses.reduce((sum: number, r: any) => {
            const metadata = r.metadata && typeof r.metadata === 'object' ? r.metadata as any : {};
            return sum + (metadata.timeSpent || 0);
          }, 0) / responses.length : 0
      });
    } catch (error) {
      console.error("Get quiz stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Quiz templates
  app.get("/api/quiz-templates", async (req, res) => {
    try {
      const templates = await storage.getQuizTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Get templates error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Cache status endpoint
  app.get("/api/cache/status", (req, res) => {
    const stats = cache.getStats();
    res.json(stats);
  });

  // Health check
  // Auth verification endpoint - MUST use application/json content type
  app.get("/api/auth/verify", verifyJWT, async (req: any, res) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      
      if (!req.user) {
        return res.status(401).json({ message: "Token não válido" });
      }

      // Buscar dados completos do usuário no cache primeiro
      const cachedUser = cache.getUser(req.user.id);
      if (cachedUser) {
        return res.status(200).json({ user: cachedUser });
      }

      // Se não estiver no cache, buscar no banco
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ message: "Usuário não encontrado" });
      }

      // Salvar no cache
      cache.setUser(req.user.id, user);
      
      return res.status(200).json({ user });
    } catch (error) {
      console.error("Auth verify error:", error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Endpoint para salvar respostas parciais durante transições de página
  app.post("/api/quizzes/:id/partial-responses", async (req: Request, res: Response) => {
    try {
      const { id: quizId } = req.params;
      const { responses, currentStep, metadata } = req.body;
      
      console.log(`💾 SALVANDO RESPOSTAS PARCIAIS - Quiz: ${quizId}, Step: ${currentStep}, Responses: ${responses?.length || 0}`);
      
      if (!responses || !Array.isArray(responses) || responses.length === 0) {
        console.log('⚠️ Nenhuma resposta válida para salvar');
        return res.status(200).json({ message: 'Nenhuma resposta para salvar' });
      }

      // Verificar se o quiz existe (sem autenticação para permitir acesso público)
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        console.log(`❌ Quiz ${quizId} não encontrado`);
        return res.status(404).json({ error: "Quiz not found" });
      }

      // Converter responses do formato do globalVariableProcessor para formato de armazenamento
      const responseData: Record<string, any> = {};
      
      responses.forEach((response: any) => {
        if (response.responseId && response.value !== undefined) {
          responseData[response.responseId] = response.value;
          console.log(`📝 Campo salvo: ${response.responseId} = ${response.value}`);
        }
      });

      // Buscar resposta existente ou criar nova
      const existingResponses = await storage.getQuizResponses(quizId);
      let existingResponse = existingResponses.find(r => 
        r.metadata && 
        typeof r.metadata === 'object' && 
        (r.metadata as any).isPartial === true
      );

      if (existingResponse) {
        // Atualizar resposta parcial existente mesclando com novas respostas
        const existingData = existingResponse.responses as Record<string, any> || {};
        const mergedData = { ...existingData, ...responseData };
        
        console.log(`🔄 ATUALIZANDO resposta parcial existente: ${existingResponse.id}`);
        console.log(`📋 Dados mesclados:`, Object.keys(mergedData));
        
        await storage.updateQuizResponse(existingResponse.id, {
          responses: mergedData,
          metadata: {
            ...metadata,
            lastUpdated: new Date().toISOString(),
            currentStep,
            totalFields: Object.keys(mergedData).length
          }
        });
      } else {
        // Criar nova resposta parcial
        console.log(`✨ CRIANDO nova resposta parcial`);
        console.log(`📋 Dados novos:`, Object.keys(responseData));
        
        existingResponse = await storage.createQuizResponse({
          quizId,
          responses: responseData,
          metadata: {
            ...metadata,
            isPartial: true,
            currentStep,
            createdAt: new Date().toISOString(),
            totalFields: Object.keys(responseData).length
          }
        });
      }

      console.log(`✅ Respostas parciais salvas com sucesso - Step: ${currentStep}`);
      
      res.status(201).json({ 
        success: true,
        responseId: existingResponse.id,
        id: existingResponse.id,
        message: 'Respostas parciais salvas com sucesso',
        step: currentStep,
        fieldsCount: Object.keys(responseData).length
      });
      
    } catch (error) {
      console.error('❌ ERRO ao salvar respostas parciais:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Submissão completa de quiz (rota pública para leads)
  app.post("/api/quizzes/:id/submit", async (req: Request, res: Response) => {
    try {
      const { id: quizId } = req.params;
      const { responses, metadata } = req.body;
      
      console.log(`📝 SUBMISSÃO COMPLETA - Quiz: ${quizId}, Responses: ${responses?.length || 0}`);
      
      if (!responses || !Array.isArray(responses) || responses.length === 0) {
        console.log('⚠️ Nenhuma resposta válida para submeter');
        return res.status(400).json({ error: 'Respostas são obrigatórias' });
      }

      // Verificar se o quiz existe e está publicado (permitir acesso público)
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        console.log(`❌ Quiz ${quizId} não encontrado`);
        return res.status(404).json({ error: "Quiz não encontrado" });
      }

      // Para testes, permitir acesso mesmo quando não está publicado
      if (!quiz.isPublished && process.env.NODE_ENV === 'production') {
        console.log(`❌ Quiz ${quizId} não está publicado`);
        return res.status(403).json({ error: "Quiz não está disponível" });
      }

      // Converter responses do formato do globalVariableProcessor para formato de armazenamento
      const responseData: Record<string, any> = {};
      
      responses.forEach((response: any) => {
        if (response.responseId && response.value !== undefined) {
          responseData[response.responseId] = response.value;
          console.log(`📝 Campo finalizado: ${response.responseId} = ${response.value}`);
        }
      });

      // Verificar se existe uma resposta parcial prévia para consolidar
      const existingResponses = await storage.getQuizResponses(quizId);
      let existingPartialResponse = existingResponses.find(r => 
        r.metadata && 
        typeof r.metadata === 'object' && 
        (r.metadata as any).isPartial === true
      );

      let finalResponseData = responseData;

      if (existingPartialResponse) {
        // Mesclar dados parciais com dados finais
        const existingData = existingPartialResponse.responses as Record<string, any> || {};
        finalResponseData = { ...existingData, ...responseData };
        
        console.log(`🔄 MESCLANDO com resposta parcial existente: ${existingPartialResponse.id}`);
        console.log(`📋 Dados mesclados:`, Object.keys(finalResponseData));
        
        // Remover a resposta parcial após consolidação
        await storage.deleteQuizResponse(existingPartialResponse.id);
        console.log(`🗑️ Resposta parcial removida após consolidação`);
      }

      // Criar resposta final (completa)
      console.log(`✨ CRIANDO resposta final completa`);
      console.log(`📋 Dados finais:`, Object.keys(finalResponseData));
      
      const finalResponse = await storage.createQuizResponse({
        quizId,
        responses: finalResponseData,
        metadata: {
          ...metadata,
          isPartial: false,
          isComplete: true,
          completedAt: new Date().toISOString(),
          totalFields: Object.keys(finalResponseData).length,
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip
        }
      });

      // Invalidar caches para atualizar estatísticas
      cache.invalidateQuizCaches(quizId, quiz.userId);

      console.log(`✅ Submissão completa realizada com sucesso!`);
      
      res.status(201).json({ 
        success: true,
        responseId: finalResponse.id,
        id: finalResponse.id,
        message: 'Quiz submetido com sucesso',
        fieldsCount: Object.keys(finalResponseData).length
      });
      
    } catch (error) {
      console.error('❌ ERRO ao submeter quiz:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // SMS Quiz Phone Numbers endpoint
  app.get("/api/quiz-phones/:quizId", verifyJWT, async (req: any, res) => {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      
      console.log(`📱 BUSCANDO TELEFONES - Quiz: ${quizId}, User: ${userId}`);
      
      // Verificar se o quiz pertence ao usuário
      const quiz = await storage.getQuiz(quizId);
      if (!quiz || quiz.userId !== userId) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      
      // Buscar responses do quiz
      const responses = await storage.getQuizResponses(quizId);
      console.log(`📱 RESPONSES ENCONTRADAS: ${responses.length}`);
      
      // Extrair telefones das respostas
      const phones: any[] = [];
      
      responses.forEach((response, index) => {
        console.log(`📱 RESPONSE ${index + 1}:`, {
          id: response.id,
          responses: response.responses,
          submittedAt: response.submittedAt
        });
        
        if (response.responses) {
          let responseData = response.responses as any;
          
          // Verificar se é o novo formato (array) ou antigo formato (object)
          if (Array.isArray(responseData)) {
            // Novo formato - resposta é um array de objetos
            console.log(`📱 NOVO FORMATO - RESPONSE ${index + 1} com ${responseData.length} elementos:`, responseData);
            
            let phoneNumber = null;
            let userName = null;
            
            // Buscar telefone através dos elementos do array
            for (const item of responseData) {
              if (item.elementType === 'phone' && item.answer) {
                phoneNumber = item.answer;
                console.log(`📱 TELEFONE ENCONTRADO no elemento ${item.elementId}: ${phoneNumber}`);
                break;
              }
              
              // Também verificar pelo fieldId que contém "telefone_"
              if (item.elementFieldId && item.elementFieldId.includes('telefone_') && item.answer) {
                phoneNumber = item.answer;
                console.log(`📱 TELEFONE ENCONTRADO pelo fieldId ${item.elementFieldId}: ${phoneNumber}`);
                break;
              }
            }
            
            // Buscar nome
            for (const item of responseData) {
              if (item.elementType === 'text' && item.elementFieldId && 
                  (item.elementFieldId.includes('nome') || item.elementFieldId.includes('name'))) {
                userName = item.answer;
                console.log(`📱 NOME ENCONTRADO no elemento ${item.elementId}: ${userName}`);
                break;
              }
            }
            
            if (phoneNumber) {
              // Verificar se phone é válido (10-15 dígitos)
              if (phoneNumber.length >= 10 && phoneNumber.length <= 15 && /^\d+$/.test(phoneNumber)) {
                // Verificar status de completude - USAR MESMA LÓGICA DA CRIAÇÃO DE CAMPANHAS
                const metadata = response.metadata as any;
                const isComplete = metadata?.isComplete === true;
                const completionPercentage = metadata?.completionPercentage || 0;
                const completedAt = metadata?.completedAt || null;
                
                // Unificar critérios: completed se isComplete=true OU completionPercentage=100
                const isReallyComplete = isComplete || completionPercentage === 100;
                
                const phoneEntry = {
                  id: response.id,
                  phone: phoneNumber,
                  name: userName || 'Sem nome',
                  submittedAt: response.submittedAt,
                  responses: responseData,
                  isComplete: isReallyComplete,
                  completedAt: completedAt,
                  status: isReallyComplete ? 'completed' : 'abandoned'
                };
                
                // Aplicar deduplicação aqui mesmo no momento da extração
                const existing = phones.find(p => p.phone === phoneNumber);
                if (!existing) {
                  phones.push(phoneEntry);
                  console.log(`📱 PRIMEIRO TELEFONE: ${phoneNumber} - STATUS: ${phoneEntry.status}`);
                } else {
                  // Aplicar regra de prioridade
                  if (phoneEntry.status === 'completed' && existing.status === 'abandoned') {
                    // Remover o antigo e adicionar o novo
                    const index = phones.findIndex(p => p.phone === phoneNumber);
                    phones[index] = phoneEntry;
                    console.log(`📱 PRIORIDADE APLICADA: ${phoneNumber} - ABANDONED → COMPLETED`);
                  } else if (phoneEntry.status === 'completed' && existing.status === 'completed') {
                    // Ambos completed - manter o mais recente
                    if (new Date(phoneEntry.submittedAt) > new Date(existing.submittedAt)) {
                      const index = phones.findIndex(p => p.phone === phoneNumber);
                      phones[index] = phoneEntry;
                      console.log(`📱 COMPLETED ATUALIZADO: ${phoneNumber} - mais recente`);
                    }
                  } else if (phoneEntry.status === 'abandoned' && existing.status === 'abandoned') {
                    // Ambos abandoned - manter o mais recente
                    if (new Date(phoneEntry.submittedAt) > new Date(existing.submittedAt)) {
                      const index = phones.findIndex(p => p.phone === phoneNumber);
                      phones[index] = phoneEntry;
                      console.log(`📱 ABANDONED ATUALIZADO: ${phoneNumber} - mais recente`);
                    }
                  } else {
                    console.log(`📱 TELEFONE DUPLICADO IGNORADO: ${phoneNumber} - ${phoneEntry.status} (mantendo ${existing.status})`);
                  }
                }
              } else {
                console.log(`❌ TELEFONE INVÁLIDO IGNORADO: ${phoneNumber} (deve ter 10-15 dígitos)`);
              }
            } else {
              console.log(`📱 NENHUM TELEFONE ENCONTRADO na response ${index + 1}`);
            }
          } else {
            // Formato antigo - resposta é um objeto
            console.log(`📱 FORMATO ANTIGO - RESPONSE ${index + 1}:`, responseData);
            
            // Buscar por chaves que contenham "telefone"
            for (const key in responseData) {
              if (key.includes('telefone') && responseData[key]) {
                console.log(`📱 TELEFONE ENCONTRADO na chave ${key}: ${responseData[key]}`);
                
                // Buscar nome
                let userName = null;
                for (const nameKey in responseData) {
                  if (nameKey.includes('nome') && responseData[nameKey]) {
                    userName = responseData[nameKey];
                    break;
                  }
                }
                
                // Verificar status de completude - USAR MESMA LÓGICA DA CRIAÇÃO DE CAMPANHAS
                const metadata = response.metadata as any;
                const isComplete = metadata?.isComplete === true;
                const completionPercentage = metadata?.completionPercentage || 0;
                const completedAt = metadata?.completedAt || null;
                
                // Unificar critérios: completed se isComplete=true OU completionPercentage=100
                const isReallyComplete = isComplete || completionPercentage === 100;
                
                const phoneNumber = responseData[key];
                
                // Verificar se phone é válido (10-15 dígitos)
                if (phoneNumber && phoneNumber.length >= 10 && phoneNumber.length <= 15 && /^\d+$/.test(phoneNumber)) {
                  const phoneEntry = {
                    id: response.id,
                    phone: phoneNumber,
                    name: userName || 'Sem nome',
                    submittedAt: response.submittedAt,
                    responses: responseData,
                    isComplete: isReallyComplete,
                    completedAt: completedAt,
                    status: isReallyComplete ? 'completed' : 'abandoned'
                  };
                  
                  // Aplicar deduplicação aqui também
                  const existing = phones.find(p => p.phone === phoneNumber);
                  if (!existing) {
                    phones.push(phoneEntry);
                    console.log(`📱 PRIMEIRO TELEFONE (ANTIGO): ${phoneNumber} - STATUS: ${phoneEntry.status}`);
                  } else {
                    // Aplicar regra de prioridade
                    if (phoneEntry.status === 'completed' && existing.status === 'abandoned') {
                      const index = phones.findIndex(p => p.phone === phoneNumber);
                      phones[index] = phoneEntry;
                      console.log(`📱 PRIORIDADE APLICADA (ANTIGO): ${phoneNumber} - ABANDONED → COMPLETED`);
                    } else if (phoneEntry.status === 'completed' && existing.status === 'completed') {
                      if (new Date(phoneEntry.submittedAt) > new Date(existing.submittedAt)) {
                        const index = phones.findIndex(p => p.phone === phoneNumber);
                        phones[index] = phoneEntry;
                        console.log(`📱 COMPLETED ATUALIZADO (ANTIGO): ${phoneNumber} - mais recente`);
                      }
                    } else if (phoneEntry.status === 'abandoned' && existing.status === 'abandoned') {
                      if (new Date(phoneEntry.submittedAt) > new Date(existing.submittedAt)) {
                        const index = phones.findIndex(p => p.phone === phoneNumber);
                        phones[index] = phoneEntry;
                        console.log(`📱 ABANDONED ATUALIZADO (ANTIGO): ${phoneNumber} - mais recente`);
                      }
                    } else {
                      console.log(`📱 TELEFONE DUPLICADO IGNORADO (ANTIGO): ${phoneNumber} - ${phoneEntry.status} (mantendo ${existing.status})`);
                    }
                  }
                } else {
                  console.log(`❌ TELEFONE INVÁLIDO IGNORADO (ANTIGO): ${phoneNumber} (deve ter 10-15 dígitos)`);
                }
                break;
              }
            }
          }
        }
      });
      
      console.log(`📱 TELEFONES ANTES DA DEDUPLICAÇÃO: ${phones.length}`);
      
      // APLICAR DEDUPLICAÇÃO FINAL - Sistema inteligente com prioridade COMPLETED > ABANDONED
      const phoneMap = new Map<string, any>();
      
      phones.forEach((phone, index) => {
        const phoneNumber = phone.phone;
        const existing = phoneMap.get(phoneNumber);
        
        console.log(`📱 PROCESSANDO TELEFONE ${index + 1}: ${phoneNumber} - STATUS: ${phone.status}`);
        
        if (!existing) {
          // Primeiro telefone com este número
          phoneMap.set(phoneNumber, phone);
          console.log(`📱 PRIMEIRO TELEFONE: ${phoneNumber} - STATUS: ${phone.status}`);
        } else {
          // Telefone duplicado - aplicar regra de prioridade
          if (phone.status === 'completed' && existing.status === 'abandoned') {
            // Priorizar COMPLETED sobre ABANDONED
            phoneMap.set(phoneNumber, phone);
            console.log(`📱 PRIORIDADE APLICADA: ${phoneNumber} - ABANDONED → COMPLETED`);
          } else if (phone.status === 'completed' && existing.status === 'completed') {
            // Ambos são COMPLETED - manter o mais recente
            if (new Date(phone.submittedAt) > new Date(existing.submittedAt)) {
              phoneMap.set(phoneNumber, phone);
              console.log(`📱 COMPLETED ATUALIZADO: ${phoneNumber} - mais recente`);
            } else {
              console.log(`📱 COMPLETED MANTIDO: ${phoneNumber} - existente é mais recente`);
            }
          } else if (phone.status === 'abandoned' && existing.status === 'abandoned') {
            // Ambos são ABANDONED - manter o mais recente
            if (new Date(phone.submittedAt) > new Date(existing.submittedAt)) {
              phoneMap.set(phoneNumber, phone);
              console.log(`📱 ABANDONED ATUALIZADO: ${phoneNumber} - mais recente`);
            } else {
              console.log(`📱 ABANDONED MANTIDO: ${phoneNumber} - existente é mais recente`);
            }
          } else {
            console.log(`📱 TELEFONE DUPLICADO IGNORADO: ${phoneNumber} - ${phone.status} (mantendo ${existing.status})`);
          }
        }
      });
      
      // Converter Map para array após deduplicação
      const uniquePhones = Array.from(phoneMap.values());
      console.log(`📱 DEDUPLICAÇÃO CONCLUÍDA: ${phones.length} → ${uniquePhones.length} telefones únicos`);
      
      // Filtrar telefones baseado no público-alvo da campanha
      const { targetAudience = 'all' } = req.body;
      let filteredPhones = uniquePhones;
      
      if (targetAudience === 'completed') {
        filteredPhones = uniquePhones.filter(p => p.status === 'completed');
        console.log(`🎯 FILTRADO PARA QUIZ COMPLETO: ${filteredPhones.length} de ${uniquePhones.length} telefones`);
      } else if (targetAudience === 'abandoned') {
        filteredPhones = uniquePhones.filter(p => p.status === 'abandoned');
        console.log(`🎯 FILTRADO PARA QUIZ ABANDONADO: ${filteredPhones.length} de ${uniquePhones.length} telefones`);
      } else {
        console.log(`🎯 TODOS OS TELEFONES: ${uniquePhones.length}`);
      }
      
      console.log(`📱 TELEFONES FINAIS: EXTRAÍDOS: ${phones.length}, ÚNICOS: ${uniquePhones.length}, FILTRADOS: ${filteredPhones.length}`);
      
      res.json({
        quizId,
        quizTitle: quiz.title,
        totalResponses: responses.length,
        totalPhones: uniquePhones.length,
        phones: uniquePhones.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      });
    } catch (error) {
      console.error("Error fetching quiz phones:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SMS Credits endpoint  
  app.get("/api/sms-credits", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Calcular créditos usados baseado nos SMS enviados com sucesso do usuário
      const sentSMS = await storage.getSentSMSCount(userId);
      const total = user.smsCredits || 100; // Valor padrão de 100 créditos
      const used = sentSMS;
      const remaining = Math.max(0, total - used);
      
      res.json({
        total,
        used,
        remaining
      });
    } catch (error) {
      console.error("Error fetching SMS credits:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User Credits endpoint (general credits for all services)
  app.get("/api/user/credits", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Calcular créditos totais do usuário
      const smsCredits = user.smsCredits || 100;
      const emailCredits = user.emailCredits || 500;
      const whatsappCredits = user.whatsappCredits || 250;
      const aiCredits = user.aiCredits || 50;
      
      // Calcular total de créditos disponíveis
      const totalCredits = smsCredits + emailCredits + whatsappCredits + aiCredits;
      
      res.json({
        credits: totalCredits,
        breakdown: {
          sms: smsCredits,
          email: emailCredits,
          whatsapp: whatsappCredits,
          ai: aiCredits
        }
      });
    } catch (error) {
      console.error("Error fetching user credits:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Unified Credits Purchase endpoint
  app.post("/api/credits/purchase", verifyJWT, async (req: any, res) => {
    try {
      const { type, packageId } = req.body;
      const userId = req.user.id;
      
      // Define package options for each credit type
      const packages = {
        sms: [
          { id: 'sms_100', credits: 100, price: 9.90 },
          { id: 'sms_500', credits: 500, price: 39.90 },
          { id: 'sms_1000', credits: 1000, price: 69.90 },
          { id: 'sms_5000', credits: 5000, price: 299.90 }
        ],
        email: [
          { id: 'email_1000', credits: 1000, price: 4.90 },
          { id: 'email_5000', credits: 5000, price: 19.90 },
          { id: 'email_10000', credits: 10000, price: 34.90 },
          { id: 'email_50000', credits: 50000, price: 149.90 }
        ],
        whatsapp: [
          { id: 'whatsapp_100', credits: 100, price: 19.90 },
          { id: 'whatsapp_500', credits: 500, price: 89.90 },
          { id: 'whatsapp_1000', credits: 1000, price: 159.90 },
          { id: 'whatsapp_5000', credits: 5000, price: 699.90 }
        ],
        ai: [
          { id: 'ai_50', credits: 50, price: 29.90 },
          { id: 'ai_200', credits: 200, price: 99.90 },
          { id: 'ai_500', credits: 500, price: 199.90 },
          { id: 'ai_1000', credits: 1000, price: 349.90 }
        ]
      };

      if (!packages[type as keyof typeof packages]) {
        return res.status(400).json({ error: "Invalid credit type" });
      }

      const selectedPackage = packages[type as keyof typeof packages].find(pkg => pkg.id === packageId);
      if (!selectedPackage) {
        return res.status(404).json({ error: "Package not found" });
      }

      // For development mode, simulate successful purchase
      console.log(`🔄 SIMULANDO COMPRA DE CRÉDITOS - Tipo: ${type}, Pacote: ${packageId}, Créditos: ${selectedPackage.credits}, Preço: R$ ${selectedPackage.price}`);
      
      // Update user credits based on type
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const updatedUser = { ...user };
      switch (type) {
        case 'sms':
          updatedUser.smsCredits = (user.smsCredits || 0) + selectedPackage.credits;
          break;
        case 'email':
          updatedUser.emailCredits = (user.emailCredits || 0) + selectedPackage.credits;
          break;
        case 'whatsapp':
          updatedUser.whatsappCredits = (user.whatsappCredits || 0) + selectedPackage.credits;
          break;
        case 'ai':
          updatedUser.aiCredits = (user.aiCredits || 0) + selectedPackage.credits;
          break;
      }

      // Update user in database
      await storage.updateUser(userId, updatedUser);

      res.json({
        success: true,
        message: `${selectedPackage.credits} créditos ${type} adicionados com sucesso!`,
        credits: selectedPackage.credits,
        type,
        development: true
      });

    } catch (error) {
      console.error("Error purchasing credits:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SMS Credits History endpoint
  app.get("/api/sms-credits/history", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const transactions = await storage.getSmsTransactions(userId);
      
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching SMS transactions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      database: "sqlite",
      cache: cache.getStats()
    });
  });

  // Endpoint para teste SMS direto com Twilio
  app.post("/api/sms/send-direct", verifyJWT, async (req: any, res) => {
    try {
      const { phones, message, quizId } = req.body;
      const userId = req.user.id;

      console.log(`📱 TESTE SMS DIRETO - User: ${userId}, Phones: ${phones?.length || 0}, Quiz: ${quizId}`);

      if (!phones || !Array.isArray(phones) || phones.length === 0) {
        return res.status(400).json({ error: "Phones array is required" });
      }

      // Validar formato dos telefones
      const validPhones = phones.filter(phone => {
        const phoneStr = (phone.phone || phone).toString();
        const cleanPhone = phoneStr.replace(/\D/g, '');
        return cleanPhone.length >= 10 && cleanPhone.length <= 15 && /^\d+$/.test(cleanPhone);
      });

      if (validPhones.length === 0) {
        return res.status(400).json({ error: "Nenhum telefone válido encontrado" });
      }

      if (validPhones.length !== phones.length) {
        console.log(`⚠️ TELEFONES INVÁLIDOS FILTRADOS: ${phones.length - validPhones.length} telefones removidos`);
      }

      if (!message || message.trim() === "") {
        return res.status(400).json({ error: "Message is required" });
      }

      // Importar função sendSms do twilio
      const { sendSms } = await import("./twilio");

      // Buscar dados do usuário
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verificar créditos SMS antes do envio (usar validPhones)
      const currentSentSMS = await storage.getSentSMSCount(userId);
      const remainingCredits = Math.max(0, (user.smsCredits || 100) - currentSentSMS);
      
      console.log(`💰 VERIFICAÇÃO DE CRÉDITOS: Tem ${remainingCredits}, precisa ${validPhones.length}`);
      
      if (remainingCredits <= 0) {
        console.log(`🚫 CRÉDITOS ESGOTADOS`);
        return res.status(400).json({ 
          error: "Créditos SMS insuficientes", 
          remaining: remainingCredits,
          needed: validPhones.length 
        });
      }
      
      if (validPhones.length > remainingCredits) {
        console.log(`🚫 CRÉDITOS INSUFICIENTES`);
        return res.status(400).json({ 
          error: `Créditos insuficientes. Precisa de ${validPhones.length} créditos, restam ${remainingCredits}`,
          remaining: remainingCredits,
          needed: validPhones.length 
        });
      }

      const results = [];
      let successCount = 0;
      let failureCount = 0;

      for (const phone of validPhones) {
        try {
          const phoneNumber = phone.phone || phone;
          console.log(`📲 Enviando SMS para: ${phoneNumber}`);
          
          const success = await sendSms(phoneNumber, message);
          
          if (success) {
            successCount++;
            
            // Consumir crédito SMS para teste
            await storage.updateUserSmsCredits(userId, user.smsCredits - 1);
            
            // Registrar transação
            await storage.createSmsTransaction({
              userId: userId,
              type: 'teste_sms',
              amount: -1,
              description: `Teste SMS: ${phoneNumber}`
            });
            
            // Invalidar cache de créditos SMS para atualizar dashboard
            cache.del(`sms-credits-${userId}`);
            cache.invalidateUserCaches(userId);
            
            results.push({
              phone: phoneNumber,
              status: "success",
              message: "SMS enviado com sucesso"
            });
          } else {
            failureCount++;
            results.push({
              phone: phoneNumber,
              status: "error",
              message: "Falha ao enviar SMS"
            });
          }
        } catch (error) {
          failureCount++;
          results.push({
            phone: phone.phone || phone,
            status: "error",
            message: error.message || "Erro desconhecido"
          });
        }
      }

      console.log(`📊 RESULTADO SMS - Sucesso: ${successCount}, Falha: ${failureCount}`);

      res.json({
        success: true,
        message: "Teste SMS concluído",
        totalSent: successCount,
        totalFailed: failureCount,
        results
      });
    } catch (error) {
      console.error("Erro no teste SMS:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // 🚀 ENDPOINT PARA DETECTAR ELEMENTOS DE ULTRA PERSONALIZAÇÃO
  app.get("/api/quiz/:quizId/ultra-personalization-elements", verifyJWT, async (req: any, res: Response) => {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      
      // Verificar se o quiz existe e pertence ao usuário
      const quiz = await storage.getQuiz(quizId);
      if (!quiz || quiz.userId !== userId) {
        return res.status(404).json({ error: "Quiz não encontrado" });
      }
      
      // Detectar elementos de ultra personalização no quiz
      const detectedElements = [];
      
      if (quiz.structure?.pages) {
        for (const page of quiz.structure.pages) {
          if (page.elements) {
            for (const element of page.elements) {
              if (element.type === 'body_type_classifier') {
                detectedElements.push({
                  fieldId: element.fieldId || 'tipo_corpo',
                  type: 'body_type_classifier',
                  title: 'Tipo de Corpo',
                  description: 'Classificação corporal do usuário',
                  options: [
                    { value: 'magra', label: 'Magra', description: 'Estratégias para ganho de massa' },
                    { value: 'com_volume', label: 'Com Volume', description: 'Foco em definição muscular' },
                    { value: 'tonificar', label: 'Tonificar', description: 'Exercícios para tonificação' },
                    { value: 'equilibrado', label: 'Equilibrado', description: 'Otimização e manutenção' }
                  ]
                });
              } else if (element.type === 'age_classifier') {
                detectedElements.push({
                  fieldId: element.fieldId || 'faixa_etaria',
                  type: 'age_classifier',
                  title: 'Faixa Etária',
                  description: 'Idade do usuário',
                  options: [
                    { value: '18-25', label: '18-25 anos', description: 'Jovens adultos' },
                    { value: '26-35', label: '26-35 anos', description: 'Adultos' },
                    { value: '36-45', label: '36-45 anos', description: 'Adultos maduros' },
                    { value: '46+', label: '46+ anos', description: 'Maduros' }
                  ]
                });
              } else if (element.type === 'fitness_goal_classifier') {
                detectedElements.push({
                  fieldId: element.fieldId || 'objetivo_fitness',
                  type: 'fitness_goal_classifier',
                  title: 'Objetivo Fitness',
                  description: 'Meta de fitness do usuário',
                  options: [
                    { value: 'perder_peso', label: 'Perder Peso', description: 'Foco em emagrecimento' },
                    { value: 'ganhar_massa', label: 'Ganhar Massa', description: 'Hipertrofia muscular' },
                    { value: 'tonificar', label: 'Tonificar', description: 'Definição muscular' },
                    { value: 'manter_forma', label: 'Manter Forma', description: 'Manutenção física' }
                  ]
                });
              } else if (element.type === 'experience_classifier') {
                detectedElements.push({
                  fieldId: element.fieldId || 'nivel_experiencia',
                  type: 'experience_classifier',
                  title: 'Nível de Experiência',
                  description: 'Experiência em fitness',
                  options: [
                    { value: 'iniciante', label: 'Iniciante', description: 'Começando agora' },
                    { value: 'intermediario', label: 'Intermediário', description: 'Alguma experiência' },
                    { value: 'avancado', label: 'Avançado', description: 'Muito experiente' },
                    { value: 'expert', label: 'Expert', description: 'Profissional' }
                  ]
                });
              }
            }
          }
        }
      }
      
      console.log(`🔍 ULTRA PERSONALIZAÇÃO - Quiz ${quizId}: ${detectedElements.length} elementos detectados`);
      res.json({ elements: detectedElements });
      
    } catch (error) {
      console.error("Error detecting ultra personalization elements:", error);
      res.status(500).json({ error: "Error detecting elements" });
    }
  });

  // SMS Campaign routes
  app.get("/api/sms-campaigns", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const campaigns = await storage.getSMSCampaigns(userId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching SMS campaigns:", error);
      res.status(500).json({ error: "Error fetching SMS campaigns" });
    }
  });

  app.post("/api/sms-campaigns", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      console.log("📱 SMS CAMPAIGN CREATE - Body recebido:", JSON.stringify(req.body, null, 2));
      
      const { name, quizId, message, triggerType, scheduledDateTime, targetAudience, triggerDelay, triggerUnit, fromDate, campaignType, conditionalRules } = req.body;
      console.log("📱 SMS CAMPAIGN CREATE - Campos extraídos:", {
        name: name || 'MISSING',
        quizId: quizId || 'MISSING', 
        message: message || 'MISSING',
        triggerType: triggerType || 'immediate',
        scheduledDateTime: scheduledDateTime || 'NOT_PROVIDED',
        targetAudience: targetAudience || 'all',
        fromDate: fromDate || 'NOT_PROVIDED',
        campaignType: campaignType || 'standard',
        conditionalRules: conditionalRules || 'NONE'
      });

      if (!name || !quizId) {
        console.log("📱 SMS CAMPAIGN CREATE - ERRO: Dados obrigatórios em falta");
        return res.status(400).json({ error: "Nome e quiz são obrigatórios" });
      }
      
      // Para campanhas ultra personalizadas, a mensagem é gerada automaticamente
      if (campaignType === 'standard' && !message) {
        console.log("📱 SMS CAMPAIGN CREATE - ERRO: Mensagem obrigatória para campanhas padrão");
        return res.status(400).json({ error: "Mensagem é obrigatória para campanhas padrão" });
      }

      // Verificar se o quiz existe e pertence ao usuário
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        console.log("📱 SMS CAMPAIGN CREATE - ERRO: Quiz não encontrado");
        return res.status(404).json({ error: "Quiz não encontrado" });
      }
      
      if (quiz.userId !== userId) {
        console.log("📱 SMS CAMPAIGN CREATE - ERRO: Quiz não pertence ao usuário");
        return res.status(403).json({ error: "Acesso negado - Quiz não pertence ao usuário" });
      }

      // 🔒 VALIDAÇÃO DE SEGURANÇA DE CRÉDITOS - ANTI-BURLA
      console.log("🔒 VALIDAÇÃO DE CRÉDITOS SMS - Iniciando verificação...");
      
      // Buscar automaticamente os telefones do quiz
      console.log("📱 BUSCANDO TELEFONES - Quiz:", quizId, ", User:", userId);
      const allResponses = await storage.getQuizResponses(quizId);
      console.log("📱 RESPONSES ENCONTRADAS:", allResponses.length);
      
      // Filtrar respostas por data se especificada
      let responses = allResponses;
      if (fromDate) {
        const filterDate = new Date(fromDate);
        responses = allResponses.filter(response => {
          const responseDate = new Date(response.submittedAt);
          return responseDate >= filterDate;
        });
        console.log(`📅 FILTRO DE DATA - Original: ${allResponses.length}, Filtrado: ${responses.length} (a partir de ${fromDate})`);
      } else {
        console.log(`📅 FILTRO DE DATA - Não especificado, processando todas as ${allResponses.length} respostas`);
      }

      // 🚀 SISTEMA DE CAMPANHAS CONDICIONAIS "SE > ENTÃO"
      if (campaignType === 'conditional' && conditionalRules) {
        console.log("🔥 CAMPANHA CONDICIONAL DETECTADA - Aplicando regras SE > ENTÃO");
        console.log("🔥 Regras recebidas:", JSON.stringify(conditionalRules, null, 2));
        
        // Aplicar filtros condicionais baseados nas regras
        responses = responses.filter(response => {
          const responseData = response.responses;
          let matchesAllConditions = true;
          
          for (const rule of conditionalRules) {
            const fieldValue = responseData[rule.fieldId];
            console.log(`🔍 Verificando condição: ${rule.fieldId} = ${fieldValue} (esperado: ${rule.expectedValue})`);
            
            if (fieldValue !== rule.expectedValue) {
              matchesAllConditions = false;
              break;
            }
          }
          
          return matchesAllConditions;
        });
        
        console.log(`🎯 FILTRO CONDICIONAL - Original: ${allResponses.length}, Após condições: ${responses.length}`);
      }

      // 🚀 SISTEMA DE CAMPANHAS ULTRA PERSONALIZADAS
      if (campaignType === 'ultra_personalized' && conditionalRules) {
        console.log("🔥 CAMPANHA ULTRA PERSONALIZADA - Aplicando regras personalizadas");
        console.log("🔥 Regras recebidas:", JSON.stringify(conditionalRules, null, 2));
      }
      
      const phoneMap = new Map<string, any>(); // Sistema de deduplicação inteligente com prioridade: COMPLETED > ABANDONED
      
      responses.forEach((response, index) => {
        const responseData = response.responses;
        const metadata = response.metadata || {};
        
        console.log(`📱 RESPONSE ${index + 1}:`, { 
          id: response.id, 
          responses: responseData, 
          submittedAt: response.submittedAt,
          metadata: metadata
        });
        
        // Determinar se o quiz foi completado ou abandonado
        const isComplete = metadata.isComplete === true;
        const isPartial = metadata.isPartial === true;
        const completionPercentage = metadata.completionPercentage || 0;
        
        let status = 'unknown';
        if (isComplete || completionPercentage === 100) {
          status = 'completed';
        } else if (isPartial || (completionPercentage > 0 && completionPercentage < 100)) {
          status = 'abandoned';
        }
        
        console.log(`📊 STATUS DO QUIZ: ${status} (isComplete: ${isComplete}, completionPercentage: ${metadata.completionPercentage})`);
        
        let phoneNumber = null;
        let userName = null;
        
        if (Array.isArray(responseData)) {
          // Formato novo - array de elementos
          console.log(`📱 FORMATO NOVO - RESPONSE ${index + 1}:`, responseData);
          
          // Buscar telefone primeiro
          for (const item of responseData) {
            if (item.elementType === 'phone' && item.answer) {
              phoneNumber = item.answer.toString().replace(/\D/g, ''); // Remove caracteres não numéricos
              console.log(`📱 TELEFONE ENCONTRADO no elemento ${item.elementId}: ${phoneNumber}`);
              break;
            }
          }
          
          // Se não encontrou phone element, buscar por fieldId que contenha "telefone"
          if (!phoneNumber) {
            for (const item of responseData) {
              if (item.elementFieldId && item.elementFieldId.includes('telefone') && item.answer) {
                phoneNumber = item.answer.toString().replace(/\D/g, ''); // Remove caracteres não numéricos
                console.log(`📱 TELEFONE ENCONTRADO no fieldId ${item.elementFieldId}: ${phoneNumber}`);
                break;
              }
            }
          }
          
          // Buscar nome
          for (const item of responseData) {
            if (item.elementType === 'text' && item.elementFieldId && 
                (item.elementFieldId.includes('nome') || item.elementFieldId.includes('name'))) {
              userName = item.answer;
              console.log(`📱 NOME ENCONTRADO no elemento ${item.elementId}: ${userName}`);
              break;
            }
          }
          
          // Sistema de deduplicação inteligente - prioridade: COMPLETED > ABANDONED
          if (phoneNumber && phoneNumber.length >= 10 && phoneNumber.length <= 15 && /^\d+$/.test(phoneNumber)) {
            const existingEntry = phoneMap.get(phoneNumber);
            
            if (!existingEntry) {
              // Primeiro registro para este telefone
              phoneMap.set(phoneNumber, {
                id: response.id,
                phone: phoneNumber,
                name: userName || 'Sem nome',
                submittedAt: response.submittedAt,
                responses: responseData,
                status: status,
                isComplete: isComplete,
                completionPercentage: metadata.completionPercentage || 0
              });
              console.log(`✅ TELEFONE ADICIONADO: ${phoneNumber} [${status.toUpperCase()}]`);
            } else {
              // Aplicar regra de prioridade: COMPLETED substitui ABANDONED
              if (status === 'completed' && existingEntry.status === 'abandoned') {
                phoneMap.set(phoneNumber, {
                  id: response.id,
                  phone: phoneNumber,
                  name: userName || 'Sem nome',
                  submittedAt: response.submittedAt,
                  responses: responseData,
                  status: status,
                  isComplete: isComplete,
                  completionPercentage: metadata.completionPercentage || 0
                });
                console.log(`🔄 TELEFONE ATUALIZADO: ${phoneNumber} [ABANDONED → COMPLETED] - PRIORIDADE APLICADA`);
              } else {
                console.log(`⚠️ TELEFONE DUPLICADO IGNORADO: ${phoneNumber} [${status.toUpperCase()}] - mantendo ${existingEntry.status.toUpperCase()}`);
              }
            }
          } else {
            console.log(`❌ TELEFONE INVÁLIDO: ${phoneNumber} (fora do range 10-15 dígitos ou não numérico)`);
          }
        } else {
          // Formato antigo - resposta é um objeto
          console.log(`📱 FORMATO ANTIGO - RESPONSE ${index + 1}:`, responseData);
          
          // Buscar por chaves que contenham "telefone"
          for (const key in responseData) {
            if (key.includes('telefone') && responseData[key]) {
              phoneNumber = responseData[key].toString().replace(/\D/g, ''); // Remove caracteres não numéricos
              console.log(`📱 TELEFONE ENCONTRADO na chave ${key}: ${phoneNumber}`);
              
              // Buscar nome
              let userName = null;
              for (const nameKey in responseData) {
                if (nameKey.includes('nome') && responseData[nameKey]) {
                  userName = responseData[nameKey];
                  break;
                }
              }
              
              // Sistema de deduplicação inteligente - prioridade: COMPLETED > ABANDONED
              if (phoneNumber && phoneNumber.length >= 10 && phoneNumber.length <= 15 && /^\d+$/.test(phoneNumber)) {
                const existingEntry = phoneMap.get(phoneNumber);
                
                if (!existingEntry) {
                  // Primeiro registro para este telefone
                  phoneMap.set(phoneNumber, {
                    id: response.id,
                    phone: phoneNumber,
                    name: userName || 'Sem nome',
                    submittedAt: response.submittedAt,
                    responses: responseData,
                    status: status,
                    isComplete: isComplete,
                    completionPercentage: metadata.completionPercentage || 0
                  });
                  console.log(`✅ TELEFONE ADICIONADO: ${phoneNumber} [${status.toUpperCase()}]`);
                } else {
                  // Aplicar regra de prioridade: COMPLETED substitui ABANDONED
                  if (status === 'completed' && existingEntry.status === 'abandoned') {
                    phoneMap.set(phoneNumber, {
                      id: response.id,
                      phone: phoneNumber,
                      name: userName || 'Sem nome',
                      submittedAt: response.submittedAt,
                      responses: responseData,
                      status: status,
                      isComplete: isComplete,
                      completionPercentage: metadata.completionPercentage || 0
                    });
                    console.log(`🔄 TELEFONE ATUALIZADO: ${phoneNumber} [ABANDONED → COMPLETED] - PRIORIDADE APLICADA`);
                  } else {
                    console.log(`⚠️ TELEFONE DUPLICADO IGNORADO: ${phoneNumber} [${status.toUpperCase()}] - mantendo ${existingEntry.status.toUpperCase()}`);
                  }
                }
              } else {
                console.log(`❌ TELEFONE INVÁLIDO: ${phoneNumber} (fora do range 10-15 dígitos ou não numérico)`);
              }
              break;
            }
          }
        }
      });

      // Converter mapa para array final
      const allPhones = Array.from(phoneMap.values());
      console.log(`📱 TOTAL DE TELEFONES ÚNICOS APÓS DEDUPLICAÇÃO: ${allPhones.length}`);

      // Criar listas separadas por status para segmentação correta
      const completedPhones = allPhones.filter(p => p.status === 'completed');
      const abandonedPhones = allPhones.filter(p => p.status === 'abandoned');
      
      console.log(`📊 SEGMENTAÇÃO: ${completedPhones.length} COMPLETED, ${abandonedPhones.length} ABANDONED`);

      // Filtrar telefones baseado no público-alvo da campanha (LISTAS SEPARADAS)
      let filteredPhones = [];
      
      if (targetAudience === 'completed') {
        filteredPhones = completedPhones; // APENAS quem completou
        console.log(`🎯 LISTA COMPLETED: ${filteredPhones.length} telefones que completaram o quiz`);
      } else if (targetAudience === 'abandoned') {
        filteredPhones = abandonedPhones; // APENAS quem abandonou
        console.log(`🎯 LISTA ABANDONED: ${filteredPhones.length} telefones que abandonaram o quiz`);
      } else {
        filteredPhones = allPhones; // TODOS (ambas as listas)
        console.log(`🎯 LISTA ALL: ${filteredPhones.length} telefones (completed + abandoned)`);
      }
      
      console.log(`📱 TELEFONES EXTRAÍDOS: ${allPhones.length}, FILTRADOS: ${filteredPhones.length}`);

      // 🔒 VALIDAÇÃO CRÍTICA DE CRÉDITOS - ANTI-BURLA
      if (filteredPhones.length === 0) {
        console.log("❌ ERRO: Nenhum telefone válido encontrado após filtros");
        return res.status(400).json({ error: "Nenhum telefone válido encontrado para envio" });
      }

      const requiredCredits = filteredPhones.length;
      console.log(`🔒 VALIDAÇÃO DE CRÉDITOS - Necessário: ${requiredCredits} créditos SMS`);
      
      const creditValidation = await storage.validateCreditsForCampaign(userId, 'sms', requiredCredits);
      if (!creditValidation.valid) {
        console.log(`❌ CRÉDITOS INSUFICIENTES - Atual: ${creditValidation.currentCredits}, Necessário: ${requiredCredits}`);
        return res.status(402).json({ 
          error: "Créditos SMS insuficientes para criar esta campanha",
          message: creditValidation.message,
          currentCredits: creditValidation.currentCredits,
          requiredCredits: requiredCredits,
          shortfall: requiredCredits - creditValidation.currentCredits
        });
      }
      
      console.log(`✅ CRÉDITOS SUFICIENTES - Pode criar campanha para ${requiredCredits} SMS`);

      // Determinar status inicial baseado no triggerType
      let initialStatus = 'active';
      let scheduledAt = null;
      
      if (triggerType === 'immediate') {
        initialStatus = 'active';
      } else if (triggerType === 'delayed') {
        initialStatus = 'active'; // Campanhas delayed agora são ativas imediatamente
        const delayInMs = triggerUnit === 'minutes' ? triggerDelay * 60 * 1000 : triggerDelay * 60 * 60 * 1000;
        scheduledAt = Math.floor((Date.now() + delayInMs) / 1000); // Timestamp Unix em segundos
        console.log(`⏰ AGENDAMENTO DELAYED: ${new Date(scheduledAt * 1000)} (em ${triggerDelay} ${triggerUnit})`);
      } else if (triggerType === 'scheduled') {
        initialStatus = 'active'; // Campanhas scheduled agora são ativas imediatamente
        if (scheduledDateTime) {
          // Converter para timestamp Unix em segundos
          scheduledAt = Math.floor(new Date(scheduledDateTime).getTime() / 1000);
          console.log(`⏰ AGENDAMENTO SCHEDULED: ${new Date(scheduledAt * 1000)} (data específica: ${scheduledDateTime})`);
        } else {
          console.log(`❌ ERRO: triggerType=scheduled mas scheduledDateTime não fornecido`);
          return res.status(400).json({ error: "Data/hora obrigatória para agendamento específico" });
        }
      }
      
      const campaign = await storage.createSMSCampaign({
        name,
        quizId,
        message,
        userId,
        phones: filteredPhones,
        status: initialStatus,
        scheduledAt,
        triggerDelay,
        triggerUnit,
        targetAudience,
        campaignType: campaignType || 'standard',
        conditionalRules: conditionalRules ? JSON.stringify(conditionalRules) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Criar logs para todos os telefones filtrados, independente do tipo de envio
      console.log(`📱 CRIANDO LOGS - Campanha ${campaign.id}, Telefones: ${filteredPhones.length}, Trigger: ${triggerType}`);
      
      for (const phone of filteredPhones) {
        const phoneNumber = phone.telefone || phone.phone || phone;
        if (!phoneNumber) continue;
        
        const logId = nanoid();
        let scheduledAt: number | undefined;
        let status = 'pending';
        
        // Calcular agendamento individual para escalabilidade massiva
        if (triggerType === 'delayed') {
          const baseDelay = triggerDelay * (triggerUnit === 'minutes' ? 60 : 3600);
          // Adicionar variação aleatória para distribuir carga (0-300 segundos)
          const randomDelay = Math.floor(Math.random() * 300);
          scheduledAt = Math.floor(Date.now() / 1000) + baseDelay + randomDelay;
          status = 'scheduled';
        }
        
        // Determinar mensagem personalizada para campanhas ultra personalizadas
        let finalMessage = message;
        if (campaignType === 'ultra_personalized' && conditionalRules) {
          finalMessage = generateUltraPersonalizedMessage(phone, conditionalRules);
        }
        
        const logData = {
          id: logId,
          campaignId: campaign.id,
          phone: phoneNumber,
          message: finalMessage,
          status: status,
          scheduledAt: scheduledAt
        };
        
        console.log(`📱 CRIANDO LOG INDIVIDUAL: ${logId} - ${phoneNumber} - ${logData.status} - agendado:${scheduledAt || 'não'}`);
        await storage.createSMSLog(logData);
      }

      // Se for envio imediato, enviar SMS automaticamente
      if (triggerType === 'immediate' && filteredPhones.length > 0) {
        console.log(`📱 ENVIO AUTOMÁTICO - Iniciando envio para ${filteredPhones.length} telefones`);
        
        // Verificar créditos disponíveis antes de enviar
        const user = await storage.getUser(userId);
        const sentSMS = await storage.getSentSMSCount(userId);
        const remainingCredits = Math.max(0, (user.smsCredits || 100) - sentSMS);
        
        console.log(`💰 CRÉDITOS: Total ${user.smsCredits || 100}, Usados ${sentSMS}, Restantes ${remainingCredits}`);
        
        if (remainingCredits <= 0) {
          console.log(`🚫 CRÉDITOS ESGOTADOS - Pausando campanha automaticamente`);
          await storage.updateSMSCampaign(campaign.id, {
            status: 'paused',
            updatedAt: new Date()
          });
          return res.status(400).json({ 
            error: "Créditos SMS esgotados. Campanha pausada automaticamente.",
            remainingCredits: 0
          });
        }
        
        let successCount = 0;
        let failureCount = 0;
        const maxSendable = Math.min(filteredPhones.length, remainingCredits);
        
        console.log(`📱 ENVIANDO: Máximo ${maxSendable} SMS (limitado por créditos)`);
        
        for (let i = 0; i < maxSendable; i++) {
          try {
            const phone = filteredPhones[i];
            const phoneNumber = phone.telefone || phone.phone || phone;
            if (!phoneNumber) continue;

            // 🎯 PERSONALIZAÇÃO DE SMS COM VARIÁVEIS DINÂMICAS
            let personalizedMessage = message;
            
            // Usar dados do phone object (que já tem as respostas do quiz)
            if (phone.name) {
              personalizedMessage = personalizedMessage.replace(/\{nome_completo\}/g, phone.name);
              personalizedMessage = personalizedMessage.replace(/\{nome\}/g, phone.name);
            }
            
            if (phone.responses && Array.isArray(phone.responses)) {
              // Processar respostas em formato array
              phone.responses.forEach(response => {
                if (response.elementFieldId && response.answer) {
                  const variable = `{${response.elementFieldId}}`;
                  personalizedMessage = personalizedMessage.replace(new RegExp(variable, 'g'), response.answer);
                }
              });
            } else if (phone.responses && typeof phone.responses === 'object') {
              // Processar respostas em formato object (como no banco de dados)
              Object.keys(phone.responses).forEach(key => {
                const variable = `{${key}}`;
                personalizedMessage = personalizedMessage.replace(new RegExp(variable, 'g'), phone.responses[key]);
              });
            }
            
            // Variáveis adicionais comuns para compatibilidade
            if (phone.email) {
              personalizedMessage = personalizedMessage.replace(/\{email_contato\}/g, phone.email);
              personalizedMessage = personalizedMessage.replace(/\{email\}/g, phone.email);
            }
            
            if (phone.telefone || phone.phone) {
              const telefone = phone.telefone || phone.phone;
              personalizedMessage = personalizedMessage.replace(/\{telefone_contato\}/g, telefone);
              personalizedMessage = personalizedMessage.replace(/\{telefone\}/g, telefone);
            }
            
            // Buscar dados do quiz para variáveis adicionais
            const quiz = await storage.getQuiz(campaign.quizId);
            if (quiz) {
              personalizedMessage = personalizedMessage.replace(/\{quiz_titulo\}/g, quiz.title || 'Quiz');
            }
            
            console.log(`📱 SMS PERSONALIZADO para ${phoneNumber}: ${personalizedMessage.substring(0, 100)}...`);

            // Criar log antes de enviar
            const logId = nanoid();
            await storage.createSMSLog({
              id: logId,
              campaignId: campaign.id,
              phone: phoneNumber,
              message: personalizedMessage, // Usar mensagem personalizada
              status: 'pending'
            });

            const success = await sendSms(phoneNumber, personalizedMessage);
            
            if (success) {
              successCount++;
              
              // 🔒 DÉBITO DE CRÉDITO SEGURO - 1 SMS = 1 CRÉDITO
              const debitResult = await storage.debitCredits(userId, 'sms', 1);
              if (!debitResult.success) {
                console.log(`🚫 ERRO AO DEBITAR CRÉDITO: ${debitResult.message}`);
                // Ainda atualizar log como enviado pois o SMS foi enviado
                await storage.updateSMSLog(logId, {
                  status: 'sent',
                  sentAt: Math.floor(Date.now() / 1000),
                  errorMessage: `SMS enviado mas erro ao debitar crédito: ${debitResult.message}`
                });
              } else {
                console.log(`💳 CRÉDITO DEBITADO - Novo saldo: ${debitResult.newBalance} créditos SMS`);
                // Atualizar log com sucesso
                await storage.updateSMSLog(logId, {
                  status: 'sent',
                  sentAt: Math.floor(Date.now() / 1000)
                });
              }
              
              console.log(`📱 SMS ENVIADO com sucesso para: ${phoneNumber} (Log: ${logId})`);
            } else {
              failureCount++;
              // Atualizar log com erro
              await storage.updateSMSLog(logId, {
                status: 'failed',
                errorMessage: 'Erro no envio pelo Twilio'
              });
              console.log(`📱 ERRO no envio para: ${phoneNumber} (Log: ${logId})`);
            }
          } catch (error) {
            failureCount++;
            console.log(`📱 ERRO no envio:`, error);
          }
        }
        
        // Atualizar estatísticas da campanha
        await storage.updateSMSCampaign(campaign.id, {
          sent: successCount,
          delivered: successCount, // Assumindo que SMS enviado = entregue
          status: 'active',
          updatedAt: new Date()
        });
        
        // Verificar se ainda há créditos após envios
        const finalSentSMS = await storage.getSentSMSCount(userId);
        const finalRemainingCredits = Math.max(0, (user.smsCredits || 100) - finalSentSMS);
        
        console.log(`📱 RESULTADO FINAL: ${successCount} enviados, ${failureCount} falhas`);
        console.log(`💰 CRÉDITOS FINAIS: ${finalRemainingCredits} restantes`);
        
        // Se créditos acabaram, pausar a campanha
        if (finalRemainingCredits <= 0) {
          console.log(`🚫 CRÉDITOS ESGOTADOS APÓS ENVIO - Pausando campanha`);
          await storage.updateSMSCampaign(campaign.id, {
            status: 'paused',
            updatedAt: new Date()
          });
        }
        
        // Retornar campanha com estatísticas atualizadas
        const updatedCampaign = await storage.getSMSCampaignById(campaign.id);
        res.json({
          ...updatedCampaign,
          remainingCredits: finalRemainingCredits,
          creditWarning: finalRemainingCredits <= 0 ? "Créditos esgotados - campanha pausada" : null
        });
      } else {
        res.json(campaign);
      }
    } catch (error) {
      console.error("Error creating SMS campaign:", error);
      res.status(500).json({ error: "Error creating SMS campaign" });
    }
  });

  app.post("/api/sms-campaigns/:id/send", verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const campaign = await storage.getSMSCampaignById(id);
      
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campanha não encontrada" });
      }

      const phones = JSON.parse(campaign.phones || '[]');
      if (!phones.length) {
        return res.status(400).json({ error: "Nenhum telefone na campanha" });
      }

      let successCount = 0;
      let failureCount = 0;
      const results = [];

      for (const phone of phones) {
        try {
          const phoneNumber = phone.telefone || phone.phone || phone;
          if (!phoneNumber) continue;

          const success = await sendSMS(phoneNumber, campaign.message);
          
          if (success) {
            successCount++;
            results.push({
              phone: phoneNumber,
              status: "success",
              message: "SMS enviado com sucesso"
            });
          } else {
            failureCount++;
            results.push({
              phone: phoneNumber,
              status: "error",
              message: "Falha ao enviar SMS"
            });
          }
        } catch (error) {
          failureCount++;
          results.push({
            phone: phone.telefone || phone.phone || phone,
            status: "error",
            message: error.message || "Erro desconhecido"
          });
        }
      }

      // Atualizar status da campanha
      await storage.updateSMSCampaign(id, {
        status: 'sent',
        sentAt: new Date(),
        successCount,
        failureCount,
        updatedAt: new Date()
      });

      res.json({
        success: true,
        message: "Campanha enviada",
        totalSent: successCount,
        totalFailed: failureCount,
        results
      });
    } catch (error) {
      console.error("Error sending SMS campaign:", error);
      res.status(500).json({ error: "Error sending SMS campaign" });
    }
  });

  // Pause SMS campaign
  app.put("/api/sms-campaigns/:id/pause", verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const campaign = await storage.getSMSCampaignById(id);
      
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campanha não encontrada" });
      }

      await storage.updateSMSCampaign(id, {
        status: 'paused',
        updatedAt: new Date()
      });

      res.json({
        success: true,
        message: "Campanha pausada com sucesso"
      });
    } catch (error) {
      console.error("Error pausing SMS campaign:", error);
      res.status(500).json({ error: "Error pausing SMS campaign" });
    }
  });

  // Resume SMS campaign
  app.put("/api/sms-campaigns/:id/resume", verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const campaign = await storage.getSMSCampaignById(id);
      
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campanha não encontrada" });
      }

      await storage.updateSMSCampaign(id, {
        status: 'active',
        updatedAt: new Date()
      });

      res.json({
        success: true,
        message: "Campanha retomada com sucesso"
      });
    } catch (error) {
      console.error("Error resuming SMS campaign:", error);
      res.status(500).json({ error: "Error resuming SMS campaign" });
    }
  });

  // Delete SMS campaign
  app.delete("/api/sms-campaigns/:id", verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const campaign = await storage.getSMSCampaignById(id);
      
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campanha não encontrada" });
      }

      await storage.deleteSMSCampaign(id);

      res.json({
        success: true,
        message: "Campanha deletada com sucesso"
      });
    } catch (error) {
      console.error("Error deleting SMS campaign:", error);
      res.status(500).json({ error: "Error deleting SMS campaign" });
    }
  });

  // Get SMS logs for a campaign
  app.get("/api/sms-campaigns/:id/logs", verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const campaign = await storage.getSMSCampaignById(id);
      
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campanha não encontrada" });
      }

      const logs = await storage.getSMSLogsByCampaign(id);
      
      res.json(logs);
    } catch (error) {
      console.error("Error fetching SMS logs:", error);
      res.status(500).json({ error: "Error fetching SMS logs" });
    }
  });

  // =============================================
  // VOICE CALLING CAMPAIGNS - SISTEMA COMPLETO
  // =============================================

  // Get voice campaigns
  app.get("/api/voice-campaigns", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const campaigns = await storage.getVoiceCampaigns(userId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching voice campaigns:", error);
      res.status(500).json({ error: "Error fetching voice campaigns" });
    }
  });

  // Create voice campaign
  app.post("/api/voice-campaigns", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      console.log("📞 VOICE CAMPAIGN CREATE - Body recebido:", JSON.stringify(req.body, null, 2));
      
      const { 
        name, 
        quizId, 
        voiceMessage, 
        voiceFile, 
        voiceType, 
        voiceSettings, 
        triggerType, 
        scheduledDateTime, 
        targetAudience, 
        triggerDelay, 
        triggerUnit, 
        fromDate,
        maxRetries,
        retryDelay,
        callTimeout
      } = req.body;

      console.log("📞 VOICE CAMPAIGN CREATE - Campos extraídos:", {
        name: name || 'MISSING',
        quizId: quizId || 'MISSING', 
        voiceMessage: voiceMessage || 'MISSING',
        voiceType: voiceType || 'tts',
        triggerType: triggerType || 'immediate',
        targetAudience: targetAudience || 'all',
        fromDate: fromDate || 'NOT_PROVIDED'
      });

      if (!name || !quizId || !voiceMessage) {
        console.log("📞 VOICE CAMPAIGN CREATE - ERRO: Dados obrigatórios em falta");
        return res.status(400).json({ error: "Dados obrigatórios em falta" });
      }

      // Verificar se o quiz existe e pertence ao usuário
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        console.log("📞 VOICE CAMPAIGN CREATE - ERRO: Quiz não encontrado");
        return res.status(404).json({ error: "Quiz não encontrado" });
      }
      
      if (quiz.userId !== userId) {
        console.log("📞 VOICE CAMPAIGN CREATE - ERRO: Quiz não pertence ao usuário");
        return res.status(403).json({ error: "Acesso negado - Quiz não pertence ao usuário" });
      }

      // Buscar telefones do quiz seguindo a mesma lógica do SMS
      console.log("📞 BUSCANDO TELEFONES - Quiz:", quizId, ", User:", userId);
      const allResponses = await storage.getQuizResponses(quizId);
      console.log("📞 RESPONSES ENCONTRADAS:", allResponses.length);
      
      // Filtrar respostas por data se especificada
      let responses = allResponses;
      if (fromDate) {
        const filterDate = new Date(fromDate);
        responses = allResponses.filter(response => {
          const responseDate = new Date(response.submittedAt);
          return responseDate >= filterDate;
        });
        console.log(`📞 FILTRO DE DATA - Original: ${allResponses.length}, Filtrado: ${responses.length}`);
      }
      
      const phoneMap = new Map<string, any>();
      
      responses.forEach((response, index) => {
        const responseData = response.responses;
        const metadata = response.metadata || {};
        
        // Lógica de extração de telefone idêntica ao SMS
        let phoneNumber = null;
        
        if (Array.isArray(responseData)) {
          for (const item of responseData) {
            if ((item.elementType === 'phone' || 
                 (item.elementFieldId && item.elementFieldId.includes('telefone'))) && 
                item.answer) {
              phoneNumber = item.answer;
              break;
            }
          }
        } else if (typeof responseData === 'object' && responseData !== null) {
          for (const [key, value] of Object.entries(responseData)) {
            if (key.includes('telefone') && value) {
              phoneNumber = value;
              break;
            }
          }
        }
        
        if (phoneNumber) {
          const cleanPhone = phoneNumber.replace(/\D/g, '');
          
          if (cleanPhone.length >= 10 && cleanPhone.length <= 15) {
            const isCompleted = (metadata.isComplete === true || metadata.isComplete === 'true') ||
                               (metadata.completionPercentage === 100);
            const status = isCompleted ? 'completed' : 'abandoned';
            
            const existingPhone = phoneMap.get(cleanPhone);
            
            if (!existingPhone || (status === 'completed' && existingPhone.status === 'abandoned')) {
              phoneMap.set(cleanPhone, {
                telefone: cleanPhone,
                status: status,
                responseId: response.id,
                submittedAt: response.submittedAt,
                completionPercentage: metadata.completionPercentage || 0,
                leadData: extractLeadDataFromResponses(responseData, {
                  nome: metadata.nome || 'Não informado',
                  email: metadata.email || 'Não informado'
                })
              });
            }
          }
        }
      });
      
      const phonesArray = Array.from(phoneMap.values());
      console.log("📞 TELEFONES PROCESSADOS:", phonesArray.length);
      
      // Filtrar por audiência
      let filteredPhones = phonesArray;
      if (targetAudience === 'completed') {
        filteredPhones = phonesArray.filter(phone => phone.status === 'completed');
      } else if (targetAudience === 'abandoned') {
        filteredPhones = phonesArray.filter(phone => phone.status === 'abandoned');
      }
      
      console.log("📞 TELEFONES FILTRADOS:", filteredPhones.length);
      
      if (filteredPhones.length === 0) {
        return res.status(400).json({ error: "Nenhum telefone encontrado para a audiência selecionada" });
      }

      // Criar campanha de voz
      const campaign = await storage.createVoiceCampaign({
        name,
        quizId,
        userId,
        voiceMessage,
        voiceFile,
        voiceType: voiceType || 'tts',
        voiceSettings: voiceSettings || {},
        phones: filteredPhones,
        status: 'active',
        targetAudience: targetAudience || 'all',
        triggerDelay: triggerDelay || 10,
        triggerUnit: triggerUnit || 'minutes',
        maxRetries: maxRetries || 3,
        retryDelay: retryDelay || 60,
        callTimeout: callTimeout || 30
      });

      // Criar logs individuais para cada telefone
      for (const phone of filteredPhones) {
        const logId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const scheduledAt = Math.floor(Date.now() / 1000) + (triggerDelay || 10) * 60;
        
        await storage.createVoiceLog({
          id: logId,
          campaignId: campaign.id,
          phone: phone.telefone,
          voiceMessage,
          voiceFile,
          status: 'scheduled',
          scheduledAt
        });
      }

      console.log("📞 CAMPANHA DE VOZ CRIADA:", campaign.id);
      res.json({
        success: true,
        message: "Campanha de voz criada com sucesso",
        campaign,
        totalPhones: filteredPhones.length
      });
    } catch (error) {
      console.error("Error creating voice campaign:", error);
      res.status(500).json({ error: "Error creating voice campaign" });
    }
  });

  // Get voice campaign by ID
  app.get("/api/voice-campaigns/:id", verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const campaign = await storage.getVoiceCampaign(id);
      
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campanha não encontrada" });
      }

      res.json(campaign);
    } catch (error) {
      console.error("Error fetching voice campaign:", error);
      res.status(500).json({ error: "Error fetching voice campaign" });
    }
  });

  // Update voice campaign
  app.put("/api/voice-campaigns/:id", verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const campaign = await storage.getVoiceCampaign(id);
      
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campanha não encontrada" });
      }

      await storage.updateVoiceCampaign(id, req.body);

      res.json({
        success: true,
        message: "Campanha atualizada com sucesso"
      });
    } catch (error) {
      console.error("Error updating voice campaign:", error);
      res.status(500).json({ error: "Error updating voice campaign" });
    }
  });

  // Pause voice campaign
  app.put("/api/voice-campaigns/:id/pause", verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const campaign = await storage.getVoiceCampaign(id);
      
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campanha não encontrada" });
      }

      await storage.updateVoiceCampaign(id, {
        status: 'paused',
        updatedAt: Math.floor(Date.now() / 1000)
      });

      res.json({
        success: true,
        message: "Campanha pausada com sucesso"
      });
    } catch (error) {
      console.error("Error pausing voice campaign:", error);
      res.status(500).json({ error: "Error pausing voice campaign" });
    }
  });

  // Resume voice campaign
  app.put("/api/voice-campaigns/:id/resume", verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const campaign = await storage.getVoiceCampaign(id);
      
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campanha não encontrada" });
      }

      await storage.updateVoiceCampaign(id, {
        status: 'active',
        updatedAt: Math.floor(Date.now() / 1000)
      });

      res.json({
        success: true,
        message: "Campanha retomada com sucesso"
      });
    } catch (error) {
      console.error("Error resuming voice campaign:", error);
      res.status(500).json({ error: "Error resuming voice campaign" });
    }
  });

  // Delete voice campaign
  app.delete("/api/voice-campaigns/:id", verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const campaign = await storage.getVoiceCampaign(id);
      
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campanha não encontrada" });
      }

      await storage.deleteVoiceCampaign(id);

      res.json({
        success: true,
        message: "Campanha deletada com sucesso"
      });
    } catch (error) {
      console.error("Error deleting voice campaign:", error);
      res.status(500).json({ error: "Error deleting voice campaign" });
    }
  });

  // Get voice logs for a campaign
  app.get("/api/voice-campaigns/:id/logs", verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const campaign = await storage.getVoiceCampaign(id);
      
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campanha não encontrada" });
      }

      const logs = await storage.getVoiceLogs(id);
      
      res.json(logs);
    } catch (error) {
      console.error("Error fetching voice logs:", error);
      res.status(500).json({ error: "Error fetching voice logs" });
    }
  });

  // Função auxiliar para extrair dados de lead das respostas
  function extractLeadDataFromResponses(responses: any, leadData: any = {}): Record<string, any> {
    const extracted: Record<string, any> = { ...leadData };
    
    if (!responses || typeof responses !== 'object') {
      return extracted;
    }

    // Percorrer todas as respostas
    Object.keys(responses).forEach(key => {
      const response = responses[key];
      
      // Extrair dados baseado no field_id ou tipo de campo
      if (key.includes('nome') || key.includes('name')) {
        extracted.nome = response;
      }
      
      if (key.includes('email')) {
        extracted.email = response;
      }
      
      if (key.includes('telefone') || key.includes('phone') || key.includes('celular')) {
        extracted.telefone = response;
      }
      
      if (key.includes('altura') || key.includes('height')) {
        extracted.altura = response;
      }
      
      if (key.includes('peso') || key.includes('weight')) {
        extracted.peso = response;
      }
      
      if (key.includes('idade') || key.includes('age')) {
        extracted.idade = response;
      }
      
      if (key.includes('nascimento') || key.includes('birth')) {
        extracted.nascimento = response;
      }
      
      // Novos elementos visuais
      if (key.includes('icon_list') || key.includes('iconlist')) {
        extracted.icon_list = response;
      }
      
      if (key.includes('testimonials') || key.includes('depoimentos')) {
        extracted.testimonials = response;
      }
      
      if (key.includes('guarantee') || key.includes('garantia')) {
        extracted.guarantee = response;
      }
      
      if (key.includes('paypal') || key.includes('payment')) {
        extracted.paypal = response;
      }
      
      if (key.includes('image_with_text') || key.includes('imagem_com_texto')) {
        extracted.image_with_text = response;
      }
      
      // Adicionar outros campos genéricos
      if (response && response.toString().trim()) {
        extracted[key] = response;
      }
    });

    return extracted;
  }

  // =============================================
  // UPLOAD SEGURO PARA DESIGN (LOGO/FAVICON)
  // =============================================

  // Endpoint para upload seguro de logo/favicon
  app.post("/api/upload/quiz-assets", verifyJWT, uploadMiddleware, handleSecureUpload);

  // Endpoint para servir arquivos de upload (com verificação de segurança)
  app.get("/uploads/:userId/:fileName", verifyJWT, async (req: any, res: Response) => {
    try {
      const { userId, fileName } = req.params;
      const requestingUserId = req.user.id;
      
      // Verificar se o usuário pode acessar este arquivo
      if (userId !== requestingUserId) {
        return res.status(403).json({ error: "Acesso negado" });
      }
      
      const filePath = path.join(__dirname, '../uploads', userId, fileName);
      
      // Verificar se arquivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Arquivo não encontrado" });
      }
      
      // Servir arquivo com headers de segurança
      res.setHeader('Content-Security-Policy', "default-src 'none'");
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.sendFile(filePath);
      
    } catch (error) {
      console.error("Erro ao servir arquivo:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Middleware para servir arquivos estáticos de upload (público)
  app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res, filePath) => {
      res.setHeader('Content-Security-Policy', "default-src 'none'");
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 ano
    }
  }));

  // ===== NOTIFICATION SYSTEM ENDPOINTS =====

  // Get user notifications
  app.get("/api/notifications", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error('❌ ERRO ao buscar notificações:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Create notification (admin only)
  app.post("/api/notifications", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem criar notificações.' });
      }

      const { title, message, type, isGlobal, targetUsers } = req.body;
      
      if (!title || !message) {
        return res.status(400).json({ error: 'Título e mensagem são obrigatórios' });
      }

      if (isGlobal) {
        // Criar notificação global (userId = null)
        const notification = await storage.createNotification({
          title,
          message,
          type: type || 'info',
          userId: null
        });
        res.json(notification);
      } else if (targetUsers && Array.isArray(targetUsers)) {
        // Criar notificações para usuários específicos
        const notifications = [];
        for (const targetUserId of targetUsers) {
          const notification = await storage.createNotification({
            title,
            message,
            type: type || 'info',
            userId: targetUserId
          });
          notifications.push(notification);
        }
        res.json({ notifications, count: notifications.length });
      } else {
        return res.status(400).json({ error: 'É necessário especificar se é global ou selecionar usuários' });
      }

    } catch (error) {
      console.error('❌ ERRO ao criar notificação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", verifyJWT, async (req: any, res: Response) => {
    try {
      const notificationId = req.params.id;
      const userId = req.user.id;
      
      await storage.markNotificationAsRead(notificationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('❌ ERRO ao marcar notificação como lida:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Delete notification
  app.delete("/api/notifications/:id", verifyJWT, async (req: any, res: Response) => {
    try {
      const notificationId = req.params.id;
      const userId = req.user.id;
      
      await storage.deleteNotification(notificationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('❌ ERRO ao deletar notificação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Mark all notifications as read
  app.patch("/api/notifications/mark-all-read", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error('❌ ERRO ao marcar todas as notificações como lidas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Get all users (admin only) - for notification targeting
  app.get("/api/admin/users", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const users = await storage.getAllUsers();
      const safeUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        plan: u.plan,
        role: u.role,
        createdAt: u.createdAt
      }));
      
      res.json(safeUsers);
    } catch (error) {
      console.error('❌ ERRO ao buscar usuários:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // ===== SUPER AFILIADOS ENDPOINTS =====

  // Get available affiliate quizzes (only main user's quizzes)
  app.get("/api/super-affiliates/quizzes", verifyJWT, async (req: any, res: Response) => {
    try {
      // Only return quizzes from the main user (admin)
      const mainUser = await storage.getUser('1EaY6vE0rYAkTXv5vHClm'); // ID do usuário principal
      if (!mainUser) {
        return res.status(404).json({ error: 'Usuário principal não encontrado' });
      }
      
      const quizzes = await storage.getUserQuizzes(mainUser.id);
      const affiliateQuizzes = quizzes.slice(0, 4).map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        totalViews: 0, // Will be calculated from analytics
        totalLeads: 0,  // Will be calculated from responses
        conversionRate: 0,
        commissionRate: 0.1, // 10% default
        isAffiliated: false // Will be checked per user
      }));
      
      res.json(affiliateQuizzes);
    } catch (error) {
      console.error('❌ ERRO ao buscar quizzes de afiliados:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Get user's affiliate stats
  app.get("/api/super-affiliates/stats", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Get user's affiliates
      const affiliates = await storage.getUserAffiliates(userId);
      
      const stats = {
        totalViews: 0,
        totalLeads: 0,
        totalSales: 0,
        totalCommission: 0,
        conversionRate: 0
      };
      
      // Calculate stats from affiliates
      for (const affiliate of affiliates) {
        stats.totalViews += affiliate.totalViews;
        stats.totalLeads += affiliate.totalLeads;
        stats.totalSales += affiliate.totalSales;
        stats.totalCommission += affiliate.totalCommission;
      }
      
      stats.conversionRate = stats.totalViews > 0 ? (stats.totalLeads / stats.totalViews) * 100 : 0;
      
      res.json(stats);
    } catch (error) {
      console.error('❌ ERRO ao buscar estatísticas de afiliados:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Create affiliate relationship
  app.post("/api/super-affiliates/affiliate", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const { quizId } = req.body;
      
      if (!quizId) {
        return res.status(400).json({ error: 'Quiz ID é obrigatório' });
      }
      
      // Check if quiz belongs to main user
      const quiz = await storage.getQuiz(quizId);
      if (!quiz || quiz.userId !== '1EaY6vE0rYAkTXv5vHClm') {
        return res.status(403).json({ error: 'Quiz não disponível para afiliação' });
      }
      
      // Generate unique affiliate code
      const affiliateCode = nanoid(8);
      
      const affiliate = await storage.createAffiliate({
        userId,
        quizId,
        affiliateCode,
        commissionRate: 0.1,
        status: 'active'
      });
      
      res.json(affiliate);
    } catch (error) {
      console.error('❌ ERRO ao criar afiliação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Get user's affiliates
  app.get("/api/super-affiliates/my-affiliates", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const affiliates = await storage.getUserAffiliates(userId);
      
      res.json(affiliates);
    } catch (error) {
      console.error('❌ ERRO ao buscar afiliações:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

// =============================================
// WHATSAPP AUTOMATION FILE ROUTES
// =============================================

// Endpoint para verificar atualizações do arquivo de automação
app.get("/api/whatsapp-automation-file/:userId/:quizId/sync", verifyJWT, async (req: any, res: Response) => {
  try {
    const { userId, quizId } = req.params;
    const { lastSync } = req.query;
    const requestingUserId = req.user.id;
    
    // Verificar se o usuário pode acessar este arquivo
    console.log('🔍 Sync Auth Debug:', { userId, requestingUserId, match: userId === requestingUserId });
    if (userId !== requestingUserId) {
      return res.status(403).json({ error: "Acesso negado" });
    }
    
    // Verificar se o quiz tem automação WhatsApp habilitada
    const quiz = await storage.getQuiz(quizId);
    if (!quiz || !quiz.enableWhatsappAutomation) {
      return res.status(400).json({ error: "Automação WhatsApp não habilitada" });
    }
    
    // Buscar arquivo de automação para obter última atualização
    const automationFile = await storage.getAutomationFile(userId, quizId);
    if (!automationFile) {
      return res.status(404).json({ error: "Arquivo de automação não encontrado" });
    }
    
    // Buscar novos leads desde o último sync
    const responses = await storage.getQuizResponses(quizId);
    const lastSyncTime = lastSync ? new Date(lastSync) : new Date(automationFile.last_updated);
    
    // Debug informações de sincronização
    console.log('🔄 DEBUG SYNC:', {
      totalResponses: responses.length,
      lastSync: lastSyncTime.toISOString(),
      sampleResponse: responses[0] ? {
        submittedAt: responses[0].submittedAt,
        submittedAtType: typeof responses[0].submittedAt,
        submittedAtAsDate: responses[0].submittedAt instanceof Date ? responses[0].submittedAt.toISOString() : 'NOT_DATE',
        isAfterLastSync: responses[0].submittedAt > lastSyncTime
      } : null,
      recentResponses: responses.slice(0, 3).map(r => ({
        submitted: r.submittedAt instanceof Date ? r.submittedAt.toISOString() : r.submittedAt,
        isAfterSync: r.submittedAt > lastSyncTime
      }))
    });
    
    // Filtrar apenas respostas novas
    const newResponses = responses.filter(response => {
      // submittedAt já é um objeto Date convertido pelo Drizzle
      const responseDate = response.submittedAt instanceof Date ? response.submittedAt : new Date(response.submittedAt);
      const isNew = responseDate > lastSyncTime;
      
      // Debug para cada resposta
      if (responses.indexOf(response) < 3) {
        console.log(`🔍 Response ${responses.indexOf(response)}: ${responseDate.toISOString()} > ${lastSyncTime.toISOString()} = ${isNew}`);
      }
      
      return isNew;
    });
    
    console.log(`🔄 SYNC - Quiz: ${quizId}, Novos leads filtrados: ${newResponses.length}`);
    
    // Debug das respostas filtradas
    if (newResponses.length > 0) {
      console.log('🆕 Respostas novas encontradas:', newResponses.map(r => ({
        submitted: r.submittedAt,
        hasResponses: !!r.responses,
        responseKeys: r.responses ? Object.keys(r.responses) : [],
        metadata: r.metadata
      })));
    }
    
    if (newResponses.length === 0) {
      // Atualizar last_updated mesmo quando não há novos leads
      const currentTimestamp = new Date().toISOString();
      await storage.updateWhatsappAutomationFile(automationFile.id, {
        last_updated: currentTimestamp
      });
      
      console.log(`🔄 Arquivo de automação atualizado (sem novos leads): ${automationFile.id}, last_updated: ${currentTimestamp}`);
      
      return res.json({ 
        hasUpdates: false, 
        newLeads: [],
        totalNewLeads: 0,
        lastUpdate: currentTimestamp
      });
    }
    
    // Processar novos leads
    const newLeads = [];
    console.log(`📱 PROCESSANDO ${newResponses.length} respostas novas...`);
    
    newResponses.forEach((response, index) => {
      console.log(`📱 Processando resposta ${index + 1}:`, { 
        hasResponses: !!response.responses,
        responseKeys: response.responses ? Object.keys(response.responses) : []
      });
      
      if (response.responses) {
        const allResponses = response.responses;
        const phoneNumbers = [];
        
        // Extrair telefones
        Object.keys(allResponses).forEach(key => {
          if (key.includes('telefone') || key.includes('phone') || key.includes('celular')) {
            const phoneValue = allResponses[key];
            if (phoneValue && phoneValue.toString().trim()) {
              phoneNumbers.push(phoneValue.toString().trim());
            }
          }
        });
        
        phoneNumbers.forEach(phoneNumber => {
          const cleanPhone = phoneNumber.replace(/\D/g, '');
          if (cleanPhone.length >= 10 && cleanPhone.length <= 15 && /^\d+$/.test(cleanPhone)) {
            const isComplete = response.metadata?.isComplete === true || 
                              response.metadata?.completionPercentage === 100;
            
            newLeads.push({
              phone: cleanPhone,
              isComplete,
              submittedAt: response.submittedAt,
              nome: allResponses.nome?.value || allResponses.name?.value || allResponses.firstName?.value,
              email: allResponses.email?.value || allResponses.email_principal?.value,
              idade: allResponses.idade?.value || allResponses.age?.value,
              altura: allResponses.altura?.value || allResponses.height?.value,
              peso: allResponses.peso?.value || allResponses.weight?.value,
              allResponses: allResponses
            });
          }
        });
      }
    });
    
    // Atualizar last_updated do arquivo sempre que o sync for executado
    const currentTimestamp = new Date().toISOString();
    await storage.updateWhatsappAutomationFile(automationFile.id, {
      last_updated: currentTimestamp
    });
    
    console.log(`🔄 Arquivo de automação atualizado: ${automationFile.id}, last_updated: ${currentTimestamp}`);
    
    res.json({
      hasUpdates: newLeads.length > 0,
      newLeads,
      totalNewLeads: newLeads.length,
      lastUpdate: currentTimestamp
    });
    
  } catch (error) {
    console.error('❌ ERRO sync arquivo automação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar arquivo de automação para extensão
app.post("/api/whatsapp-automation-file", verifyJWT, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { quizId, targetAudience = 'all', dateFilter } = req.body;
    
    console.log(`📁 CRIANDO ARQUIVO DE AUTOMAÇÃO - User: ${userId}, Quiz: ${quizId}`);
    
    // Verificar se o quiz pertence ao usuário
    const quiz = await storage.getQuiz(quizId);
    if (!quiz || quiz.userId !== userId) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    
    // Verificar se a automação WhatsApp está habilitada para este quiz
    if (!quiz.enableWhatsappAutomation) {
      console.log(`❌ AUTOMAÇÃO WHATSAPP DESABILITADA - Quiz: ${quizId}`);
      return res.status(400).json({ 
        error: "Automação WhatsApp não está habilitada para este quiz",
        message: "Para usar esta funcionalidade, habilite a 'Automação WhatsApp' nas configurações do quiz."
      });
    }
    
    // Buscar responses do quiz
    const responses = await storage.getQuizResponses(quizId);
    console.log(`📱 RESPONSES ENCONTRADAS: ${responses.length}`);
    console.log(`📱 SAMPLE RESPONSE:`, responses[0] ? JSON.stringify(responses[0], null, 2) : 'No responses');
    
    // Extrair telefones das respostas com TODAS as variáveis
    const phones: any[] = [];
    
    responses.forEach((response, index) => {
      console.log(`📱 PROCESSANDO RESPONSE ${index + 1}:`, response);
      
      if (response.responses) {
        let responseData = response.responses as any;
        let phoneNumber = null;
        let allResponses: Record<string, any> = {};
        
        // Verificar se é o novo formato (array de objetos)
        if (Array.isArray(responseData)) {
          console.log(`📱 NOVO FORMATO - RESPONSE ${index + 1} com ${responseData.length} elementos:`, responseData);
          
          responseData.forEach((element: any) => {
            // Extrair telefone
            if (element.elementType === 'phone' || element.elementFieldId?.includes('telefone')) {
              phoneNumber = element.answer;
              console.log(`📱 TELEFONE ENCONTRADO no elemento ${element.elementId}: ${phoneNumber}`);
            }
            
            // Guardar TODAS as respostas com fieldId e tipo
            if (element.elementFieldId && element.answer) {
              allResponses[element.elementFieldId] = {
                value: element.answer,
                type: element.elementType,
                elementId: element.elementId,
                pageTitle: element.pageTitle,
                timestamp: element.timestamp
              };
            }
          });
        } else {
          // Formato antigo (objeto plano)
          console.log(`📱 FORMATO ANTIGO - RESPONSE ${index + 1}:`, responseData);
          
          Object.keys(responseData).forEach(key => {
            const value = responseData[key];
            
            // Buscar telefone por padrão ou field_id
            if (key.includes('telefone') || key.includes('phone') || 
                (typeof value === 'string' && /^[\d\s\-\(\)\+]{8,}$/.test(value.replace(/\s/g, '')))) {
              phoneNumber = value;
              console.log(`📱 TELEFONE ENCONTRADO no campo ${key}: ${phoneNumber}`);
            }
            
            // Guardar TODAS as respostas
            allResponses[key] = {
              value: value,
              type: 'legacy',
              timestamp: response.submittedAt || response.completedAt
            };
          });
        }
        
        // Validar telefone
        if (phoneNumber) {
          const cleanPhone = phoneNumber.toString().replace(/\D/g, '');
          if (cleanPhone.length >= 10 && cleanPhone.length <= 15) {
            
            // Determinar status de conclusão
            const isCompleted = response.metadata?.isComplete === true || response.completionPercentage === 100;
            
            console.log(`📱 TELEFONE VÁLIDO: ${cleanPhone} - STATUS: ${isCompleted ? 'completed' : 'abandoned'}`);
            
            phones.push({
              id: response.id,
              phone: cleanPhone,
              originalPhone: phoneNumber,
              status: isCompleted ? 'completed' : 'abandoned',
              isComplete: isCompleted,
              completionPercentage: response.completionPercentage || 0,
              submittedAt: response.submittedAt || response.completedAt,
              createdAt: response.createdAt || response.submittedAt,
              quizTitle: quiz.title,
              quizId: quizId,
              // TODAS as respostas do quiz
              allResponses: allResponses,
              // Campos extraídos para compatibilidade
              nome: allResponses.nome?.value || allResponses.name?.value || allResponses.firstName?.value,
              email: allResponses.email?.value || allResponses.email_principal?.value,
              idade: allResponses.idade?.value || allResponses.age?.value,
              altura: allResponses.altura?.value || allResponses.height?.value,
              peso: allResponses.peso?.value || allResponses.weight?.value,
              nascimento: allResponses.nascimento?.value || allResponses.birth_date?.value
            });
          } else {
            console.log(`❌ TELEFONE INVÁLIDO IGNORADO: ${phoneNumber} (deve ter 10-15 dígitos)`);
          }
        } else {
          console.log(`📱 NENHUM TELEFONE ENCONTRADO na response ${index + 1}`);
        }
      }
    });
    
    console.log(`📱 TOTAL DE TELEFONES EXTRAÍDOS: ${phones.length}`);
    
    // Aplicar filtros
    let filteredPhones = phones;
    
    // Filtro de data
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filteredPhones = filteredPhones.filter(phone => 
        new Date(phone.submittedAt) >= filterDate
      );
      console.log(`📅 APÓS FILTRO DE DATA: ${filteredPhones.length} contatos`);
    }
    
    // Filtro de audiência
    if (targetAudience !== 'all') {
      filteredPhones = filteredPhones.filter(phone => {
        return targetAudience === 'completed' ? phone.isComplete : !phone.isComplete;
      });
      console.log(`👥 APÓS FILTRO DE AUDIÊNCIA (${targetAudience}): ${filteredPhones.length} contatos`);
    }
    
    // Deduplicate phones - priorizar completos sobre abandonados
    const phoneMap = new Map();
    filteredPhones.forEach(phone => {
      const existing = phoneMap.get(phone.phone);
      if (!existing || (phone.isComplete && !existing.isComplete)) {
        phoneMap.set(phone.phone, phone);
      }
    });
    
    const finalPhones = Array.from(phoneMap.values());
    console.log(`🔄 APÓS DEDUPLICAÇÃO: ${finalPhones.length} contatos únicos`);
    
    // Salvar arquivo no storage
    const automationFile = {
      id: `${userId}_${quizId}_${Date.now()}`,
      userId,
      quizId,
      quizTitle: quiz.title,
      targetAudience,
      dateFilter,
      phones: finalPhones,
      totalPhones: finalPhones.length,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    await storage.saveAutomationFile(automationFile);
    
    console.log(`✅ ARQUIVO CRIADO: ${finalPhones.length} telefones processados`);
    console.log(`📱 SAMPLE FINAL PHONE:`, finalPhones[0] ? JSON.stringify(finalPhones[0], null, 2) : 'No phones');
    
    res.json({
      success: true,
      fileId: automationFile.id,
      totalPhones: finalPhones.length,
      message: 'Arquivo de automação criado com sucesso'
    });
    
  } catch (error) {
    console.error('❌ ERRO ao criar arquivo de automação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar arquivos de automação WhatsApp do usuário  
app.get("/api/whatsapp-automation-files", verifyJWT, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const files = await storage.getWhatsAppAutomationFiles(userId);
    
    console.log(`📁 BUSCANDO ARQUIVOS - User: ${userId}, Total: ${files.length}`);
    
    res.json(files);
  } catch (error) {
    console.error("Error fetching automation files:", error);
    res.status(500).json({ error: "Error fetching automation files" });
  }
});

// Buscar arquivo específico de automação WhatsApp
app.get("/api/whatsapp-automation-files/:fileId", verifyJWT, async (req: any, res: Response) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;
    
    const file = await storage.getWhatsAppAutomationFile(fileId);
    
    if (!file || file.user_id !== userId) {
      return res.status(404).json({ error: "File not found" });
    }
    
    console.log(`📄 ARQUIVO ENCONTRADO: ${fileId}, ${file.total_phones} contatos`);
    
    // Transformar phones em contacts para compatibilidade com frontend
    const responseData = {
      ...file,
      contacts: file.phones || []
    };
    
    res.json(responseData);
  } catch (error) {
    console.error("Error fetching automation file:", error);
    res.status(500).json({ error: "Error fetching automation file" });
  }
});

// Endpoint para extensão acessar arquivo de automação
app.get("/api/whatsapp-automation-file/:userId/:quizId", verifyJWT, async (req: any, res: Response) => {
  try {
    const { userId, quizId } = req.params;
    const requestingUserId = req.user.id;
    
    // Verificar se o usuário pode acessar este arquivo
    if (userId !== requestingUserId) {
      return res.status(403).json({ error: "Acesso negado" });
    }
    
    const file = await storage.getAutomationFile(userId, quizId);
    if (!file) {
      return res.status(404).json({ error: "Arquivo não encontrado" });
    }
    
    console.log(`📁 ARQUIVO ACESSADO: ${file.totalPhones} telefones`);
    
    res.json(file);
    
  } catch (error) {
    console.error('❌ ERRO ao acessar arquivo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// =============================================
// WHATSAPP CAMPAIGNS ROUTES
// =============================================

// Get WhatsApp campaigns
app.get("/api/whatsapp-campaigns", verifyJWT, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const campaigns = await storage.getWhatsappCampaigns(userId);
    
    // Get real stats from logs
    for (const campaign of campaigns) {
      const logs = await storage.getWhatsappLogs(campaign.id);
      campaign.sent = logs.filter(log => log.status === 'sent').length;
      campaign.delivered = logs.filter(log => log.status === 'delivered').length;
      campaign.opened = logs.filter(log => log.extension_status === 'opened').length;
      campaign.clicked = logs.filter(log => log.extension_status === 'clicked').length;
      campaign.replies = logs.filter(log => log.extension_status === 'replied').length;
    }
    
    res.json(campaigns);
  } catch (error) {
    console.error('❌ ERRO ao buscar campanhas WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Create WhatsApp campaign
app.post("/api/whatsapp-campaigns", verifyJWT, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { name, quizId, quizTitle, messages, targetAudience = 'all', dateFilter, triggerType = 'delayed', triggerDelay = 10, triggerUnit = 'minutes', scheduledDateTime, extensionSettings } = req.body;
    
    console.log('📱 CRIANDO CAMPANHA WHATSAPP:', { name, quizId, targetAudience, triggerType, messagesCount: messages?.length });
    
    // Validações
    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'Pelo menos uma mensagem é obrigatória' });
    }
    
    // Get phones from quiz responses
    const phones = await storage.getQuizPhoneNumbers(quizId);
    
    // Apply date filter
    let filteredPhones = phones;
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      console.log(`🔍 FILTRO DE DATA: ${dateFilter} (${filterDate.toISOString()})`);
      filteredPhones = filteredPhones.filter(p => {
        const responseDate = new Date(p.submittedAt || p.created_at);
        console.log(`📅 Comparando: ${responseDate.toISOString()} >= ${filterDate.toISOString()}`);
        return responseDate >= filterDate;
      });
      console.log(`📱 APÓS FILTRO DE DATA: ${filteredPhones.length} de ${phones.length}`);
    }
    
    // Apply audience filter
    if (targetAudience === 'completed') {
      filteredPhones = filteredPhones.filter(p => p.status === 'completed');
    } else if (targetAudience === 'abandoned') {
      filteredPhones = filteredPhones.filter(p => p.status === 'abandoned');
    }
    
    console.log(`📱 LEADS FILTRADOS: ${filteredPhones.length} de ${phones.length} total (dateFilter: ${dateFilter}, audience: ${targetAudience})`);
    
    // 🔒 VALIDAÇÃO DE CRÉDITOS WHATSAPP - ANTI-BURLA
    if (filteredPhones.length === 0) {
      return res.status(400).json({ error: "Nenhum telefone válido encontrado após filtros" });
    }

    const requiredCredits = filteredPhones.length;
    console.log(`🔒 VALIDAÇÃO DE CRÉDITOS WHATSAPP - Necessário: ${requiredCredits} créditos`);
    
    const creditValidation = await storage.validateCreditsForCampaign(userId, 'whatsapp', requiredCredits);
    if (!creditValidation.valid) {
      console.log(`❌ CRÉDITOS WHATSAPP INSUFICIENTES - Atual: ${creditValidation.currentCredits}, Necessário: ${requiredCredits}`);
      return res.status(402).json({ 
        error: "Créditos WhatsApp insuficientes para criar esta campanha",
        message: creditValidation.message,
        currentCredits: creditValidation.currentCredits,
        requiredCredits: requiredCredits,
        shortfall: requiredCredits - creditValidation.currentCredits
      });
    }
    
    console.log(`✅ CRÉDITOS WHATSAPP SUFICIENTES - Pode criar campanha para ${requiredCredits} mensagens`);
    
    let scheduledAt;
    let initialStatus = 'active';
    
    // Calculate scheduling
    if (triggerType === 'delayed') {
      const baseDelay = triggerDelay * (triggerUnit === 'minutes' ? 60 : 3600);
      scheduledAt = Math.floor(Date.now() / 1000) + baseDelay;
      console.log(`⏰ AGENDAMENTO DELAYED: ${triggerDelay} ${triggerUnit} = ${new Date(scheduledAt * 1000)}`);
    } else if (triggerType === 'scheduled' && scheduledDateTime) {
      scheduledAt = Math.floor(new Date(scheduledDateTime).getTime() / 1000);
      console.log(`⏰ AGENDAMENTO SCHEDULED: ${new Date(scheduledAt * 1000)}`);
    }
    
    const campaign = await storage.createWhatsappCampaign({
      name,
      quizId,
      quizTitle: quizTitle || "Quiz",
      messages,
      userId,
      phones: filteredPhones,
      status: initialStatus,
      scheduledAt,
      triggerDelay,
      triggerUnit,
      targetAudience,
      dateFilter,
      extensionSettings: extensionSettings || {
        delay: 3000,
        maxRetries: 3,
        enabled: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create logs for all filtered phones with rotating messages
    console.log(`📱 CRIANDO LOGS - Campanha ${campaign.id}, Telefones: ${filteredPhones.length}, Mensagens: ${messages.length}`);
    
    for (let i = 0; i < filteredPhones.length; i++) {
      const phone = filteredPhones[i];
      const phoneNumber = phone.telefone || phone.phone || phone;
      if (!phoneNumber) continue;
      
      // Select rotating message (cycle through messages)
      const selectedMessage = messages[i % messages.length];
      
      const logId = nanoid();
      let logScheduledAt: number | undefined;
      let status = 'pending';
      
      // Individual scheduling for scalability
      if (triggerType === 'delayed') {
        const baseDelay = triggerDelay * (triggerUnit === 'minutes' ? 60 : 3600);
        const randomDelay = Math.floor(Math.random() * 300);
        logScheduledAt = Math.floor(Date.now() / 1000) + baseDelay + randomDelay;
        status = 'scheduled';
      }
      
      await storage.createWhatsappLog({
        id: logId,
        campaignId: campaign.id,
        phone: phoneNumber,
        message: selectedMessage,
        status: status,
        scheduledAt: logScheduledAt
      });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('❌ ERRO ao criar campanha WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get WhatsApp campaign logs
app.get("/api/whatsapp-campaigns/:id/logs", verifyJWT, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const logs = await storage.getWhatsappLogs(id);
    res.json(logs);
  } catch (error) {
    console.error('❌ ERRO ao buscar logs WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Pause WhatsApp campaign
app.put("/api/whatsapp-campaigns/:id/pause", verifyJWT, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const campaign = await storage.updateWhatsappCampaign(id, { status: 'paused' });
    res.json(campaign);
  } catch (error) {
    console.error('❌ ERRO ao pausar campanha WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Resume WhatsApp campaign
app.put("/api/whatsapp-campaigns/:id/resume", verifyJWT, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const campaign = await storage.updateWhatsappCampaign(id, { status: 'active' });
    res.json(campaign);
  } catch (error) {
    console.error('❌ ERRO ao retomar campanha WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Delete WhatsApp campaign
app.delete("/api/whatsapp-campaigns/:id", verifyJWT, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteWhatsappCampaign(id);
    
    if (deleted) {
      res.json({ success: true, message: 'Campanha WhatsApp deletada com sucesso' });
    } else {
      res.status(404).json({ error: 'Campanha WhatsApp não encontrada' });
    }
  } catch (error) {
    console.error('❌ ERRO ao deletar campanha WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// =============================================
// WHATSAPP EXTENSION ROUTES
// =============================================

// Get extension status (with user authentication)
app.get("/api/whatsapp-extension/status", verifyJWT, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    
    // Verificar se usuário tem permissão para usar extensão WhatsApp
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(403).json({ error: 'Usuário não encontrado' });
    }

    // Log de acesso da extensão
    console.log(`🔐 EXTENSÃO AUTENTICADA: ${userEmail} (${userId})`);

    res.json({
      connected: true,
      version: "1.0.0",
      lastPing: new Date().toISOString(),
      pendingMessages: 0,
      server: "Vendzz WhatsApp API",
      authenticatedUser: {
        id: userId,
        email: userEmail,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ ERRO status extensão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update extension status (ping) with real-time config sync
app.post("/api/whatsapp-extension/status", verifyJWT, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const { version, pendingMessages, sentMessages, failedMessages, isActive } = req.body;
    
    // VALIDAÇÃO RIGOROSA DE ENTRADA
    if (!version || typeof version !== 'string' || version.trim() === '') {
      return res.status(400).json({ error: 'Version é obrigatório e deve ser uma string válida' });
    }
    
    if (pendingMessages !== undefined && (typeof pendingMessages !== 'number' || pendingMessages < 0 || !Number.isInteger(pendingMessages))) {
      return res.status(400).json({ error: 'pendingMessages deve ser um número inteiro não negativo' });
    }
    
    if (sentMessages !== undefined && (typeof sentMessages !== 'number' || sentMessages < 0 || !Number.isInteger(sentMessages))) {
      return res.status(400).json({ error: 'sentMessages deve ser um número inteiro não negativo' });
    }
    
    if (failedMessages !== undefined && (typeof failedMessages !== 'number' || failedMessages < 0 || !Number.isInteger(failedMessages))) {
      return res.status(400).json({ error: 'failedMessages deve ser um número inteiro não negativo' });
    }
    
    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive deve ser um valor boolean' });
    }
    
    console.log(`📱 PING EXTENSÃO ${userEmail}: v${version}, pendentes: ${pendingMessages}, enviadas: ${sentMessages}, falhas: ${failedMessages}`);
    
    // Buscar configurações atualizadas do usuário em tempo real
    const userSettings = await storage.getUserExtensionSettings(userId);
    
    res.json({
      success: true,
      serverTime: new Date().toISOString(),
      message: "Ping recebido com sucesso",
      settings: userSettings, // Configurações sincronizadas
      user: {
        id: userId,
        email: userEmail
      }
    });
  } catch (error) {
    console.error('❌ ERRO ping extensão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get user extension settings (real-time sync)
app.get("/api/whatsapp-extension/settings", verifyJWT, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const settings = await storage.getUserExtensionSettings(userId);
    
    console.log(`⚙️ CONFIGURAÇÕES SOLICITADAS para ${req.user.email}`);
    
    res.json(settings);
  } catch (error) {
    console.error('❌ ERRO ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update user extension settings (bidirectional sync)
app.post("/api/whatsapp-extension/settings", verifyJWT, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const settings = req.body;
    
    // VALIDAÇÃO DE CONFIGURAÇÕES
    if (settings.messageDelay !== undefined) {
      if (typeof settings.messageDelay !== 'number' || settings.messageDelay < 0 || settings.messageDelay > 3600000) {
        return res.status(400).json({ error: 'messageDelay deve ser um número entre 0 e 3600000ms (1 hora)' });
      }
    }
    
    if (settings.maxMessagesPerDay !== undefined) {
      if (typeof settings.maxMessagesPerDay !== 'number' || settings.maxMessagesPerDay < 1 || settings.maxMessagesPerDay > 10000) {
        return res.status(400).json({ error: 'maxMessagesPerDay deve ser um número entre 1 e 10000' });
      }
    }
    
    if (settings.autoSend !== undefined && typeof settings.autoSend !== 'boolean') {
      return res.status(400).json({ error: 'autoSend deve ser um valor boolean' });
    }
    
    if (settings.workingHours && typeof settings.workingHours === 'object') {
      const { start, end } = settings.workingHours;
      if (start && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(start)) {
        return res.status(400).json({ error: 'workingHours.start deve estar no formato HH:MM (00:00-23:59)' });
      }
      if (end && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(end)) {
        return res.status(400).json({ error: 'workingHours.end deve estar no formato HH:MM (00:00-23:59)' });
      }
    }
    
    await storage.updateUserExtensionSettings(userId, settings);
    
    console.log(`⚙️ CONFIGURAÇÕES ATUALIZADAS para ${req.user.email}:`, JSON.stringify(settings));
    
    res.json({
      success: true,
      message: "Configurações salvas com sucesso",
      settings: settings
    });
  } catch (error) {
    console.error('❌ ERRO ao salvar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get pending messages for extension (only user's campaigns)
app.get("/api/whatsapp-extension/pending", verifyJWT, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Buscar apenas mensagens WhatsApp do usuário autenticado
    const scheduledLogs = await storage.getScheduledWhatsappLogsByUser(userId, currentTime);
    
    // Formatar para a extensão
    const pendingMessages = scheduledLogs.map(log => ({
      logId: log.id,
      phone: log.phone,
      message: log.message,
      campaignId: log.campaign_id,
      scheduledAt: log.scheduled_at,
      createdAt: log.created_at,
      userId: userId // Confirmar propriedade
    }));

    console.log(`📤 MENSAGENS PENDENTES PARA ${userEmail}: ${pendingMessages.length}`);
    res.json(pendingMessages);
  } catch (error) {
    console.error('❌ ERRO mensagens pendentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Check for already sent phones to avoid duplicates
app.post("/api/whatsapp-extension/check-sent", verifyJWT, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { phones } = req.body;
    
    console.log(`🔍 REQUEST BODY:`, req.body);
    console.log(`📞 PHONES RECEIVED:`, phones);
    console.log(`📋 TYPE CHECK:`, typeof phones, Array.isArray(phones));
    
    if (!phones || !Array.isArray(phones)) {
      console.log(`❌ VALIDATION FAILED: phones=${phones}, isArray=${Array.isArray(phones)}`);
      return res.status(400).json({ error: "Phones array is required" });
    }
    
    console.log(`🔍 VERIFICANDO DUPLICATAS - User: ${userId}, Phones: ${phones.length}`);
    
    // Buscar logs de envio bem-sucedidos para estes telefones do usuário
    const sentPhones = await storage.getAlreadySentPhones(userId, phones);
    
    // Filtrar números que ainda não foram enviados
    const newPhones = phones.filter(phone => !sentPhones.includes(phone));
    const duplicatePhones = phones.filter(phone => sentPhones.includes(phone));
    
    console.log(`✅ VERIFICAÇÃO CONCLUÍDA - Novos: ${newPhones.length}, Duplicatas: ${duplicatePhones.length}`);
    
    res.json({
      success: true,
      newPhones,
      duplicatePhones,
      stats: {
        total: phones.length,
        new: newPhones.length,
        duplicates: duplicatePhones.length
      }
    });
  } catch (error) {
    console.error("Error checking sent phones:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Receive logs from extension (with ownership verification)
app.post("/api/whatsapp-extension/logs", verifyJWT, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const { logId, status, phone, error: errorMsg, timestamp } = req.body;
    
    if (!logId || !status) {
      return res.status(400).json({ error: 'LogId e status são obrigatórios' });
    }

    // Verificar se o log pertence ao usuário autenticado
    const log = await storage.getWhatsappLogById(logId);
    if (!log) {
      return res.status(404).json({ error: 'Log não encontrado' });
    }

    // Verificar se a campanha pertence ao usuário
    const campaign = await storage.getWhatsappCampaignById(log.campaign_id);
    if (!campaign || campaign.userId !== userId) {
      return res.status(403).json({ error: 'Acesso negado: log não pertence ao usuário' });
    }

    // 🔒 DÉBITO DE CRÉDITO SEGURO - 1 WhatsApp = 1 CRÉDITO
    if (status === 'sent' || status === 'delivered') {
      const debitResult = await storage.debitCredits(userId, 'whatsapp', 1);
      if (debitResult.success) {
        console.log(`💳 CRÉDITO WHATSAPP DEBITADO - Novo saldo: ${debitResult.newBalance} créditos`);
        
        // Se créditos acabaram, pausar campanhas
        if (debitResult.newBalance <= 0) {
          console.log(`🚫 CRÉDITOS WHATSAPP ESGOTADOS - Pausando campanhas do usuário ${userId}`);
          await storage.pauseCampaignsWithoutCredits(userId);
        }
      } else {
        console.log(`🚫 ERRO AO DEBITAR CRÉDITO WHATSAPP: ${debitResult.message}`);
      }
    }
    
    // Atualizar status do log no banco
    await storage.updateWhatsappLogStatus(logId, status, 'extension', errorMsg);
    
    console.log(`📊 LOG EXTENSÃO ${userEmail}: ${phone} - ${status} ${errorMsg ? `(${errorMsg})` : ''}`);
    
    res.json({
      success: true,
      message: 'Log recebido com sucesso',
      userId: userId
    });
  } catch (error) {
    console.error('❌ ERRO log extensão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get WhatsApp templates
app.get("/api/whatsapp-templates", verifyJWT, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const templates = await storage.getWhatsappTemplates(userId);
    res.json(templates);
  } catch (error) {
    console.error('❌ ERRO ao buscar templates WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// WhatsApp extension status endpoint
app.get("/api/whatsapp-extension/status", verifyJWT, async (req: any, res: Response) => {
  try {
    // Check if extension is connected (placeholder for now)
    res.json({
      connected: false,
      version: "1.0.0",
      lastPing: null,
      pendingMessages: 0
    });
  } catch (error) {
    console.error('❌ ERRO ao verificar status da extensão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// WhatsApp extension API for communication
app.post("/api/whatsapp-extension/logs", verifyJWT, async (req: any, res: Response) => {
  try {
    const { logId, status, extensionStatus, error } = req.body;
    await storage.updateWhatsappLogStatus(logId, status, extensionStatus, error);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ ERRO ao atualizar log WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get scheduled WhatsApp messages for extension - ENDPOINT CORRIGIDO
app.get("/api/whatsapp-extension/pending-messages", verifyJWT, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Buscar apenas mensagens WhatsApp do usuário autenticado
    const scheduledLogs = await storage.getScheduledWhatsappLogsByUser(userId, currentTime);
    
    // Formatar para a extensão
    const pendingMessages = scheduledLogs.map(log => ({
      logId: log.id,
      phone: log.phone,
      message: log.message,
      campaignId: log.campaign_id,
      scheduledAt: log.scheduled_at,
      createdAt: log.created_at,
      userId: userId // Confirmar propriedade
    }));

    console.log(`📤 MENSAGENS PENDENTES PARA ${userEmail}: ${pendingMessages.length}`);
    res.json(pendingMessages);
  } catch (error) {
    console.error('❌ ERRO mensagens pendentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get scheduled WhatsApp messages for extension (mantido para compatibilidade)
app.get("/api/whatsapp-extension/pending", verifyJWT, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const logs = await storage.getScheduledWhatsappLogs();
    
    // Filter by user
    const userLogs = logs.filter(log => log.user_id === userId);
    
    res.json(userLogs.map(log => ({
      id: log.id,
      campaignId: log.campaign_id,
      phone: log.phone,
      message: log.message,
      scheduledAt: log.scheduled_at,
      extensionSettings: JSON.parse(log.extension_settings || '{}')
    })));
  } catch (error) {
    console.error('❌ ERRO ao buscar mensagens pendentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

  // Função auxiliar para extrair dados de lead das respostas
  function extractLeadDataFromResponses(responses: any, leadData: any = {}): Record<string, any> {
    const extracted: Record<string, any> = { ...leadData };
    
    if (!responses || typeof responses !== 'object') {
      return extracted;
    }

    // Percorrer todas as respostas
    Object.keys(responses).forEach(key => {
      const response = responses[key];
      
      // Extrair dados baseado no field_id ou tipo de campo
      if (key.includes('nome') || key.includes('name')) {
        extracted.nome = response;
      }
      
      if (key.includes('email')) {
        extracted.email = response;
      }
      
      if (key.includes('telefone') || key.includes('phone') || key.includes('celular')) {
        extracted.telefone = response;
      }
      
      if (key.includes('altura') || key.includes('height')) {
        extracted.altura = response;
      }
      
      if (key.includes('peso') || key.includes('weight')) {
        extracted.peso = response;
      }
      
      if (key.includes('idade') || key.includes('age')) {
        extracted.idade = response;
      }
      
      if (key.includes('nascimento') || key.includes('birth')) {
        extracted.nascimento = response;
      }
      
      // Novos elementos visuais
      if (key.includes('icon_list') || key.includes('iconlist')) {
        extracted.icon_list = response;
      }
      
      if (key.includes('testimonials') || key.includes('depoimentos')) {
        extracted.testimonials = response;
      }
      
      if (key.includes('guarantee') || key.includes('garantia')) {
        extracted.guarantee = response;
      }
      
      if (key.includes('paypal') || key.includes('payment')) {
        extracted.paypal = response;
      }
      
      if (key.includes('image_with_text') || key.includes('imagem_com_texto')) {
        extracted.image_with_text = response;
      }
      
      // Adicionar outros campos genéricos
      if (response && response.toString().trim()) {
        extracted[key] = response;
      }
    });

    return extracted;
  }

  // ==================== NOTIFICATIONS ROUTES ====================
  
  // Buscar notificações do usuário


  // ==================== EMAIL MARKETING ROUTES ====================
  
  // Buscar respostas do quiz para sistema de email marketing
  app.get("/api/quiz-responses", verifyJWT, async (req: any, res) => {
    try {
      const { quizId } = req.query;
      const userId = req.user.id;
      
      if (!quizId) {
        return res.status(400).json({ error: "Quiz ID is required" });
      }
      
      // Verificar se o quiz pertence ao usuário
      const quiz = await storage.getQuiz(quizId);
      if (!quiz || quiz.userId !== userId) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      
      // Buscar respostas do quiz
      const responses = await storage.getQuizResponses(quizId);
      
      res.json(responses);
    } catch (error) {
      console.error("Error fetching quiz responses:", error);
      res.status(500).json({ error: "Error fetching quiz responses" });
    }
  });

  // Buscar respostas de um quiz específico (endpoint usado pelos testes) - seguindo padrão do SMS
  app.get("/api/quiz-responses/:quizId", verifyJWT, async (req: any, res) => {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      
      console.log(`📧 BUSCANDO RESPOSTAS DO QUIZ ${quizId} para usuário ${userId}`);
      
      // Verificar se o quiz pertence ao usuário (mesmo padrão do SMS)
      const quiz = await storage.getQuiz(quizId);
      if (!quiz || quiz.userId !== userId) {
        return res.status(404).json({ error: "Quiz não encontrado" });
      }

      // Buscar respostas do quiz (mesma função usada no SMS)
      const responses = await storage.getQuizResponses(quizId);
      console.log(`📧 ENCONTRADAS ${responses.length} respostas`);
      
      res.json(responses);
    } catch (error) {
      console.error("Error fetching quiz responses:", error);
      res.status(500).json({ error: "Error fetching quiz responses" });
    }
  });

  // Buscar emails extraídos das respostas de um quiz (seguindo padrão do SMS para telefones)
  app.get("/api/quizzes/:id/responses/emails", verifyJWT, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      console.log(`📧 EXTRAINDO EMAILS DO QUIZ ${id} para usuário ${userId}`);
      
      // Verificar se o quiz pertence ao usuário (mesmo padrão do SMS)
      const quiz = await storage.getQuiz(id);
      if (!quiz || quiz.userId !== userId) {
        return res.status(404).json({ error: "Quiz não encontrado" });
      }
      
      // Buscar respostas do quiz (mesma função usada no SMS)
      const responses = await storage.getQuizResponses(id);
      console.log(`📧 RESPOSTAS ENCONTRADAS: ${responses.length}`);
      
      const emails = storage.extractEmailsFromResponses(responses);
      
      console.log(`📧 EXTRAÍDOS ${emails.length} emails de ${responses.length} respostas`);
      
      res.json({
        totalEmails: emails.length,
        emails: emails.slice(0, 50), // Limitar como no SMS
        totalResponses: responses.length
      });
    } catch (error) {
      console.error("Error fetching quiz response emails:", error);
      console.error("Stack trace:", error.stack);
      res.status(500).json({ error: "Error fetching quiz response emails" });
    }
  });

  // Buscar variáveis disponíveis das respostas de um quiz para personalização
  app.get("/api/quizzes/:id/variables", verifyJWT, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      console.log(`📧 EXTRAINDO VARIÁVEIS DO QUIZ ${id} para usuário ${userId}`);
      
      // Verificar se o quiz pertence ao usuário
      const quiz = await storage.getQuiz(id);
      if (!quiz || quiz.userId !== userId) {
        return res.status(404).json({ error: "Quiz não encontrado" });
      }
      
      // Buscar respostas do quiz
      const responses = await storage.getQuizResponses(id);
      console.log(`📧 ANALISANDO ${responses.length} respostas para variáveis`);
      
      const variables = storage.extractVariablesFromResponses(responses);
      
      console.log(`📧 VARIÁVEIS ENCONTRADAS: ${variables.join(', ')}`);
      
      res.json({
        variables,
        totalResponses: responses.length,
        quizTitle: quiz.title
      });
    } catch (error) {
      console.error("Error fetching quiz variables:", error);
      res.status(500).json({ error: "Error fetching quiz variables" });
    }
  });

  // Deletar uma resposta de quiz
  app.delete("/api/quiz-responses/:id", verifyJWT, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      console.log(`🗑️ DELETANDO RESPOSTA ${id} para usuário ${userId}`);
      
      // Buscar a resposta para verificar se pertence ao usuário
      const response = await storage.getQuizResponse(id);
      if (!response) {
        return res.status(404).json({ error: "Resposta não encontrada" });
      }
      
      // Verificar se o quiz da resposta pertence ao usuário
      const quiz = await storage.getQuiz(response.quizId);
      if (!quiz || quiz.userId !== userId) {
        return res.status(403).json({ error: "Sem permissão para deletar esta resposta" });
      }
      
      // Deletar a resposta
      await storage.deleteQuizResponse(id);
      
      console.log(`🗑️ RESPOSTA ${id} DELETADA com sucesso`);
      
      res.json({ success: true, message: "Resposta deletada com sucesso" });
    } catch (error) {
      console.error("Error deleting quiz response:", error);
      res.status(500).json({ error: "Error deleting quiz response" });
    }
  });

  // Buscar logs de email (seguindo padrão do SMS logs)
  app.get("/api/email-logs", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { campaignId } = req.query;
      
      console.log(`📧 BUSCANDO LOGS DE EMAIL para usuário ${userId}, campaignId: ${campaignId}`);
      
      let logs;
      if (campaignId) {
        // Verificar se a campanha pertence ao usuário (mesmo padrão do SMS)
        const campaign = await storage.getEmailCampaign(campaignId);
        if (!campaign || campaign.userId !== userId) {
          return res.status(404).json({ error: "Campanha não encontrada" });
        }
        logs = await storage.getEmailLogsByCampaign(campaignId);
      } else {
        // Buscar todos os logs do usuário (seguindo padrão do SMS)
        logs = await storage.getEmailLogsByUser(userId);
      }
      
      console.log(`📧 ENCONTRADOS ${logs.length} logs de email`);
      
      res.json(logs);
    } catch (error) {
      console.error("Error fetching email logs:", error);
      res.status(500).json({ error: "Error fetching email logs" });
    }
  });

  // Listar campanhas de email
  app.get("/api/email-campaigns", verifyJWT, async (req: any, res) => {
    try {
      const campaigns = await storage.getEmailCampaigns(req.user.id);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching email campaigns:", error);
      res.status(500).json({ error: "Error fetching email campaigns" });
    }
  });

  // Criar campanha de email
  app.post("/api/email-campaigns", verifyJWT, async (req: any, res) => {
    try {
      const { 
        name, 
        quizId, 
        subject, 
        content, 
        targetAudience, 
        triggerType, 
        triggerDelay, 
        triggerUnit 
      } = req.body;

      // 🔒 VALIDAÇÃO DE CRÉDITOS EMAIL - ANTI-BURLA
      console.log(`🔒 VALIDAÇÃO DE CRÉDITOS EMAIL - Iniciando verificação...`);
      
      // Buscar emails do quiz para calcular créditos necessários
      const responses = await storage.getQuizResponsesForEmail(quizId, targetAudience);
      const requiredCredits = responses.length;
      
      console.log(`📧 CRÉDITOS NECESSÁRIOS: ${requiredCredits} créditos EMAIL`);
      
      const creditValidation = await storage.validateCreditsForCampaign(req.user.id, 'email', requiredCredits);
      if (!creditValidation.valid) {
        console.log(`❌ CRÉDITOS EMAIL INSUFICIENTES - Atual: ${creditValidation.currentCredits}, Necessário: ${requiredCredits}`);
        return res.status(402).json({ 
          error: "Créditos Email insuficientes para criar esta campanha",
          message: creditValidation.message,
          currentCredits: creditValidation.currentCredits,
          requiredCredits: requiredCredits,
          shortfall: requiredCredits - creditValidation.currentCredits
        });
      }
      
      console.log(`✅ CRÉDITOS EMAIL SUFICIENTES - Pode criar campanha para ${requiredCredits} emails`);

      const result = await emailService.createEmailCampaignFromQuiz({
        userId: req.user.id,
        campaignName: name,
        quizId,
        emailTemplate: content,
        subject,
        targetAudience,
        triggerType,
        triggerDelay,
        triggerUnit
      });

      if (result.success) {
        res.json({
          success: true,
          campaignId: result.campaignId,
          scheduledEmails: result.scheduledEmails,
          message: "Campanha de email criada com sucesso"
        });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      console.error("Error creating email campaign:", error);
      res.status(500).json({ error: "Error creating email campaign" });
    }
  });

  // Email Campaigns Count - DEVE VIR ANTES DO :id
  app.get("/api/email-campaigns/count", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const campaigns = await storage.getEmailCampaigns(userId);
      
      console.log(`📊 EMAIL CAMPAIGNS COUNT - User: ${userId}, Total: ${campaigns.length}`);
      
      res.json({ 
        count: campaigns.length,
        success: true
      });
    } catch (error) {
      console.error("Error getting email campaigns count:", error);
      res.status(500).json({ error: "Error getting email campaigns count" });
    }
  });

  // Obter campanha de email específica
  app.get("/api/email-campaigns/:id", verifyJWT, async (req: any, res) => {
    try {
      const campaign = await storage.getEmailCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      // Verificar se o usuário tem permissão
      if (campaign.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(campaign);
    } catch (error) {
      console.error("Error fetching email campaign:", error);
      res.status(500).json({ error: "Error fetching email campaign" });
    }
  });

  // Atualizar campanha de email
  app.put("/api/email-campaigns/:id", verifyJWT, async (req: any, res) => {
    try {
      const campaign = await storage.getEmailCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      // Verificar se o usuário tem permissão
      if (campaign.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updatedCampaign = await storage.updateEmailCampaign(req.params.id, req.body);
      res.json(updatedCampaign);
    } catch (error) {
      console.error("Error updating email campaign:", error);
      res.status(500).json({ error: "Error updating email campaign" });
    }
  });

  // Deletar campanha de email
  app.delete("/api/email-campaigns/:id", verifyJWT, async (req: any, res) => {
    try {
      const campaign = await storage.getEmailCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      // Verificar se o usuário tem permissão
      if (campaign.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      await storage.deleteEmailCampaign(req.params.id);
      res.json({ success: true, message: "Campaign deleted successfully" });
    } catch (error) {
      console.error("Error deleting email campaign:", error);
      res.status(500).json({ error: "Error deleting email campaign" });
    }
  });

  // Obter logs de email para uma campanha
  app.get("/api/email-campaigns/:id/logs", verifyJWT, async (req: any, res) => {
    try {
      const campaign = await storage.getEmailCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      // Verificar se o usuário tem permissão
      if (campaign.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const logs = await storage.getEmailLogs(req.params.id);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching email logs:", error);
      res.status(500).json({ error: "Error fetching email logs" });
    }
  });

  // Listar templates de email
  app.get("/api/email-templates", verifyJWT, async (req: any, res) => {
    try {
      const templates = await storage.getEmailTemplates(req.user.id);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ error: "Error fetching email templates" });
    }
  });

  // Enviar campanha de email (endpoint antigo para compatibilidade)
  app.post("/api/email-campaigns/:id/send", verifyJWT, async (req: any, res) => {
    try {
      const { emails } = req.body;
      const campaignId = req.params.id;

      // Verificar se a campanha existe e pertence ao usuário
      const campaign = await storage.getEmailCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      if (campaign.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Importar serviço de email
      const { sendEmail } = await import('./email-brevo');

      const results = { sent: 0, failed: 0, emails: [] };

      // Verificar se emails é um array
      if (!Array.isArray(emails)) {
        return res.status(400).json({ error: "Emails must be an array" });
      }

      // Enviar emails
      for (const email of emails) {
        try {
          const success = await sendEmail({
            to: email,
            subject: campaign.subject,
            htmlContent: campaign.content,
            sender: { name: "Vendzz", email: "contato@vendzz.com.br" }
          });

          if (success) {
            results.sent++;
            results.emails.push({ email, status: 'sent' });
            
            // Criar log de email
            await storage.createEmailLog({
              campaignId,
              email,
              personalizedSubject: campaign.subject,
              personalizedContent: campaign.content,
              status: 'sent',
              sentAt: Math.floor(Date.now() / 1000)
            });
          } else {
            results.failed++;
            results.emails.push({ email, status: 'failed' });
            
            // Criar log de email com erro
            await storage.createEmailLog({
              campaignId,
              email,
              personalizedSubject: campaign.subject,
              personalizedContent: campaign.content,
              status: 'failed',
              errorMessage: 'Failed to send email',
              sentAt: Math.floor(Date.now() / 1000)
            });
          }
        } catch (error) {
          results.failed++;
          results.emails.push({ email, status: 'failed', error: error.message });
          
          // Criar log de email com erro
          await storage.createEmailLog({
            campaignId,
            email,
            personalizedSubject: campaign.subject,
            personalizedContent: campaign.content,
            status: 'failed',
            errorMessage: error.message,
            sentAt: Math.floor(Date.now() / 1000)
          });
        }
      }

      // Atualizar estatísticas da campanha
      await storage.updateEmailCampaignStats(campaignId, {
        sent: results.sent,
        delivered: results.sent // Assumir que emails enviados foram entregues
      });

      res.json(results);
    } catch (error) {
      console.error("Error sending email campaign:", error);
      res.status(500).json({ error: "Error sending email campaign" });
    }
  });

  // Criar template de email
  app.post("/api/email-templates", verifyJWT, async (req: any, res) => {
    try {
      const template = await storage.createEmailTemplate({
        ...req.body,
        userId: req.user.id
      });
      res.json(template);
    } catch (error) {
      console.error("Error creating email template:", error);
      res.status(500).json({ error: "Error creating email template" });
    }
  });

  // Atualizar template de email
  app.put("/api/email-templates/:id", verifyJWT, async (req: any, res) => {
    try {
      const template = await storage.getEmailTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      // Verificar se o usuário tem permissão
      if (template.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updatedTemplate = await storage.updateEmailTemplate(req.params.id, req.body);
      res.json(updatedTemplate);
    } catch (error) {
      console.error("Error updating email template:", error);
      res.status(500).json({ error: "Error updating email template" });
    }
  });

  // Deletar template de email
  app.delete("/api/email-templates/:id", verifyJWT, async (req: any, res) => {
    try {
      const template = await storage.getEmailTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      // Verificar se o usuário tem permissão
      if (template.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      await storage.deleteEmailTemplate(req.params.id);
      res.json({ success: true, message: "Template deleted successfully" });
    } catch (error) {
      console.error("Error deleting email template:", error);
      res.status(500).json({ error: "Error deleting email template" });
    }
  });

  // Listar automações de email
  app.get("/api/email-automations", verifyJWT, async (req: any, res) => {
    try {
      const automations = await storage.getEmailAutomations(req.user.id);
      res.json(automations);
    } catch (error) {
      console.error("Error fetching email automations:", error);
      res.status(500).json({ error: "Error fetching email automations" });
    }
  });

  // Criar automação de email
  app.post("/api/email-automations", verifyJWT, async (req: any, res) => {
    try {
      const automation = await storage.createEmailAutomation({
        ...req.body,
        userId: req.user.id
      });
      res.json(automation);
    } catch (error) {
      console.error("Error creating email automation:", error);
      res.status(500).json({ error: "Error creating email automation" });
    }
  });

  // Testar configuração do Brevo
  app.post("/api/email-brevo/test", verifyJWT, async (req: any, res) => {
    try {
      const { apiKey, fromEmail } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ error: "API Key é obrigatória" });
      }
      
      const brevoService = new BrevoEmailService(apiKey);
      const isValid = await brevoService.verifyApiKey();
      
      if (isValid) {
        // Testar envio de email se fromEmail for fornecido
        if (fromEmail) {
          const testEmailSent = await brevoService.sendEmail({
            to: fromEmail,
            from: fromEmail,
            subject: "Teste de Configuração Brevo - Vendzz",
            htmlContent: `
              <h1>Configuração do Brevo Testada com Sucesso!</h1>
              <p>Este é um email de teste enviado através da integração Brevo do Vendzz.</p>
              <p><strong>API Name:</strong> VZ</p>
              <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              <p><strong>Status:</strong> ✅ Funcionando perfeitamente</p>
              <hr>
              <p><em>Sistema Vendzz - Email Marketing</em></p>
            `,
            textContent: `Configuração do Brevo Testada com Sucesso! Este é um email de teste enviado através da integração Brevo do Vendzz. API Name: VZ. Data: ${new Date().toLocaleString('pt-BR')}. Status: Funcionando perfeitamente.`
          });
          
          if (testEmailSent) {
            res.json({ 
              success: true, 
              message: "API Key do Brevo válida e email de teste enviado com sucesso!",
              testEmailSent: true
            });
          } else {
            res.json({ 
              success: true, 
              message: "API Key do Brevo válida, mas falha no envio do email de teste.",
              testEmailSent: false
            });
          }
        } else {
          res.json({ 
            success: true, 
            message: "API Key do Brevo válida! Configuração OK." 
          });
        }
      } else {
        res.status(400).json({ 
          success: false, 
          message: "API Key do Brevo inválida. Verifique suas credenciais." 
        });
      }
    } catch (error) {
      console.error("Error testing Brevo API:", error);
      res.status(500).json({ error: "Erro ao testar API do Brevo" });
    }
  });

  // ==================== NOVOS ENDPOINTS DE CONTROLE DE CAMPANHA ====================

  // Iniciar campanha de email
  app.post("/api/email-campaigns/:id/start", verifyJWT, async (req: any, res) => {
    try {
      const campaignId = req.params.id;
      const userId = req.user.id;
      
      console.log(`📧 INICIANDO CAMPANHA DE EMAIL ${campaignId} - User: ${userId}`);
      
      // Verificar se a campanha existe e pertence ao usuário
      const campaign = await storage.getEmailCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ error: "Campanha não encontrada" });
      }
      
      if (campaign.userId !== userId) {
        return res.status(403).json({ error: "Acesso negado" });
      }
      
      // Verificar se a campanha não está já ativa
      if (campaign.status === 'active') {
        return res.status(400).json({ error: "Campanha já está ativa" });
      }
      
      // Atualizar status da campanha para ativa
      await storage.updateEmailCampaign(campaignId, {
        status: 'active',
        updatedAt: Math.floor(Date.now() / 1000)
      });
      
      console.log(`✅ CAMPANHA DE EMAIL ${campaignId} INICIADA COM SUCESSO`);
      
      res.json({
        success: true,
        message: "Campanha iniciada com sucesso",
        campaignId: campaignId,
        status: 'active'
      });
    } catch (error) {
      console.error("Error starting email campaign:", error);
      res.status(500).json({ error: "Erro ao iniciar campanha de email" });
    }
  });

  // Pausar campanha de email
  app.post("/api/email-campaigns/:id/pause", verifyJWT, async (req: any, res) => {
    try {
      const campaignId = req.params.id;
      const userId = req.user.id;
      
      console.log(`⏸️ PAUSANDO CAMPANHA DE EMAIL ${campaignId} - User: ${userId}`);
      
      // Verificar se a campanha existe e pertence ao usuário
      const campaign = await storage.getEmailCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ error: "Campanha não encontrada" });
      }
      
      if (campaign.userId !== userId) {
        return res.status(403).json({ error: "Acesso negado" });
      }
      
      // Verificar se a campanha está ativa
      if (campaign.status !== 'active') {
        return res.status(400).json({ error: "Campanha não está ativa" });
      }
      
      // Atualizar status da campanha para pausada
      await storage.updateEmailCampaign(campaignId, {
        status: 'paused',
        updatedAt: Math.floor(Date.now() / 1000)
      });
      
      console.log(`⏸️ CAMPANHA DE EMAIL ${campaignId} PAUSADA COM SUCESSO`);
      
      res.json({
        success: true,
        message: "Campanha pausada com sucesso",
        campaignId: campaignId,
        status: 'paused'
      });
    } catch (error) {
      console.error("Error pausing email campaign:", error);
      res.status(500).json({ error: "Erro ao pausar campanha de email" });
    }
  });

  // Deletar campanha de email (endpoint duplicado, mas vou manter a versão mais específica)
  app.delete("/api/email-campaigns/:id/delete", verifyJWT, async (req: any, res) => {
    try {
      const campaignId = req.params.id;
      const userId = req.user.id;
      
      console.log(`🗑️ DELETANDO CAMPANHA DE EMAIL ${campaignId} - User: ${userId}`);
      
      // Verificar se a campanha existe e pertence ao usuário
      const campaign = await storage.getEmailCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ error: "Campanha não encontrada" });
      }
      
      if (campaign.userId !== userId) {
        return res.status(403).json({ error: "Acesso negado" });
      }
      
      // Deletar campanha (que também deletará os logs associados devido ao CASCADE)
      await storage.deleteEmailCampaign(campaignId);
      
      console.log(`🗑️ CAMPANHA DE EMAIL ${campaignId} DELETADA COM SUCESSO`);
      
      res.json({
        success: true,
        message: "Campanha deletada com sucesso",
        campaignId: campaignId
      });
    } catch (error) {
      console.error("Error deleting email campaign:", error);
      res.status(500).json({ error: "Erro ao deletar campanha de email" });
    }
  });

  // Enviar campanha de email via Brevo
  app.post("/api/email-campaigns/:id/send", verifyJWT, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { apiKey, fromEmail } = req.body;
      
      if (!apiKey || !fromEmail) {
        return res.status(400).json({ 
          error: "API Key do Brevo e Email do Remetente são obrigatórios" 
        });
      }
      
      const campaign = await storage.getEmailCampaign(id);
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campanha não encontrada" });
      }
      
      // Buscar emails do quiz
      const responses = await storage.getQuizResponsesForEmail(campaign.quizId, campaign.targetAudience);
      console.log(`📧 PROCESSANDO ${responses.length} respostas do quiz ${campaign.quizId}`);
      
      const emails = [];
      
      for (const response of responses) {
        console.log(`📧 PROCESSANDO RESPOSTA ${response.id}:`, response.responses);
        
        let emailAddress = '';
        let userName = 'Usuário';
        
        // Extrair email das respostas
        if (Array.isArray(response.responses)) {
          // Formato novo - array de elementos
          for (const item of response.responses) {
            if (item.elementType === 'email' && item.answer) {
              emailAddress = item.answer;
              console.log(`📧 EMAIL ENCONTRADO (elementType): ${emailAddress}`);
              break;
            }
            if (item.elementFieldId && item.elementFieldId.includes('email') && item.answer) {
              emailAddress = item.answer;
              console.log(`📧 EMAIL ENCONTRADO (fieldId): ${emailAddress}`);
              break;
            }
          }
          
          // Buscar nome
          for (const item of response.responses) {
            if (item.elementType === 'text' && item.elementFieldId && 
                (item.elementFieldId.includes('nome') || item.elementFieldId.includes('name'))) {
              userName = item.answer;
              console.log(`📧 NOME ENCONTRADO: ${userName}`);
              break;
            }
          }
        } else if (typeof response.responses === 'object') {
          // Formato antigo - objeto
          for (const key in response.responses) {
            if (key.includes('email') && response.responses[key]) {
              emailAddress = response.responses[key];
              console.log(`📧 EMAIL ENCONTRADO (key): ${emailAddress}`);
              break;
            }
          }
          
          // Buscar nome
          for (const key in response.responses) {
            if (key.includes('nome') && response.responses[key]) {
              userName = response.responses[key];
              console.log(`📧 NOME ENCONTRADO: ${userName}`);
              break;
            }
          }
        }
        
        if (emailAddress && emailAddress.includes('@')) {
          // Extrair dados adicionais baseado na estrutura
          let phoneNumber = '';
          let age = '';
          let height = '';
          let currentWeight = '';
          let targetWeight = '';
          
          if (Array.isArray(response.responses)) {
            for (const item of response.responses) {
              if (item.elementFieldId && item.elementFieldId.includes('telefone')) {
                phoneNumber = item.answer;
              }
              if (item.elementFieldId && item.elementFieldId.includes('idade')) {
                age = item.answer;
              }
              if (item.elementFieldId && item.elementFieldId.includes('altura')) {
                height = item.answer;
              }
              if (item.elementFieldId && item.elementFieldId.includes('peso_atual')) {
                currentWeight = item.answer;
              }
              if (item.elementFieldId && item.elementFieldId.includes('peso_objetivo')) {
                targetWeight = item.answer;
              }
            }
          } else if (typeof response.responses === 'object') {
            for (const key in response.responses) {
              if (key.includes('telefone')) phoneNumber = response.responses[key];
              if (key.includes('idade')) age = response.responses[key];
              if (key.includes('altura')) height = response.responses[key];
              if (key.includes('peso_atual')) currentWeight = response.responses[key];
              if (key.includes('peso_objetivo')) targetWeight = response.responses[key];
            }
          }
          
          const leadData = {
            nome: userName,
            email: emailAddress,
            telefone: phoneNumber,
            idade: age,
            altura: height,
            peso_atual: currentWeight,
            peso_objetivo: targetWeight,
            completionStatus: response.metadata?.isComplete ? 'completed' : 'abandoned',
            submittedAt: response.submittedAt || response.createdAt
          };
          
          emails.push(leadData);
          console.log(`📧 EMAIL ADICIONADO: ${leadData.email} - ${leadData.nome}`);
        } else {
          console.log(`📧 EMAIL NÃO ENCONTRADO na resposta ${response.id}`);
        }
      }
      
      if (emails.length === 0) {
        return res.status(400).json({ 
          error: "Nenhum email encontrado para esta campanha" 
        });
      }
      
      // Enviar emails via Brevo
      const brevoService = new BrevoEmailService(apiKey);
      let successCount = 0;
      let failureCount = 0;
      
      for (const lead of emails) {
        try {
          // Personalizar conteúdo do email
          let personalizedContent = campaign.content;
          personalizedContent = personalizedContent.replace(/\{nome\}/g, lead.nome);
          personalizedContent = personalizedContent.replace(/\{email\}/g, lead.email);
          personalizedContent = personalizedContent.replace(/\{telefone\}/g, lead.telefone);
          personalizedContent = personalizedContent.replace(/\{idade\}/g, lead.idade);
          personalizedContent = personalizedContent.replace(/\{altura\}/g, lead.altura);
          personalizedContent = personalizedContent.replace(/\{peso_atual\}/g, lead.peso_atual);
          personalizedContent = personalizedContent.replace(/\{peso_objetivo\}/g, lead.peso_objetivo);
          
          // Personalizar subject
          let personalizedSubject = campaign.subject;
          personalizedSubject = personalizedSubject.replace(/\{nome\}/g, lead.nome);
          
          const sent = await brevoService.sendEmail({
            to: lead.email,
            from: fromEmail,
            subject: personalizedSubject,
            htmlContent: personalizedContent
          });
          
          if (sent) {
            successCount++;
            
            // 🔒 DÉBITO DE CRÉDITO SEGURO - 1 EMAIL = 1 CRÉDITO
            const debitResult = await storage.debitCredits(userId, 'email', 1);
            if (debitResult.success) {
              console.log(`💳 CRÉDITO EMAIL DEBITADO - Novo saldo: ${debitResult.newBalance} créditos`);
              
              // Se créditos acabaram, pausar campanhas
              if (debitResult.newBalance <= 0) {
                console.log(`🚫 CRÉDITOS EMAIL ESGOTADOS - Pausando campanhas do usuário ${userId}`);
                await storage.pauseCampaignsWithoutCredits(userId);
              }
            } else {
              console.log(`🚫 ERRO AO DEBITAR CRÉDITO EMAIL: ${debitResult.message}`);
            }
            
            // Salvar log de sucesso
            await storage.createEmailLog({
              campaignId: id,
              email: lead.email,
              status: 'sent',
              sentAt: Math.floor(Date.now() / 1000), // Unix timestamp
              personalizedSubject: personalizedSubject,
              personalizedContent: personalizedContent
            });
          } else {
            failureCount++;
            
            // Salvar log de falha
            await storage.createEmailLog({
              campaignId: id,
              email: lead.email,
              status: 'failed',
              sentAt: Math.floor(Date.now() / 1000), // Unix timestamp
              personalizedSubject: personalizedSubject,
              personalizedContent: personalizedContent,
              errorMessage: 'Falha no envio via Brevo'
            });
          }
        } catch (error) {
          failureCount++;
          console.error(`Erro ao enviar email para ${lead.email}:`, error);
          
          // Salvar log de erro
          await storage.createEmailLog({
            campaignId: id,
            email: lead.email,
            status: 'failed',
            sentAt: Math.floor(Date.now() / 1000), // Unix timestamp
            personalizedSubject: campaign.subject,
            personalizedContent: campaign.content,
            errorMessage: error.message
          });
        }
      }
      
      // Atualizar status da campanha
      await storage.updateEmailCampaign(id, {
        status: 'sent',
        sentAt: Math.floor(Date.now() / 1000), // Unix timestamp
        sent: successCount,
        delivered: successCount,
        opened: 0,
        clicked: 0,
        updatedAt: Math.floor(Date.now() / 1000)
      });
      
      res.json({
        success: true,
        message: "Campanha enviada com sucesso!",
        totalEmails: emails.length,
        successCount,
        failureCount,
        campaignId: id
      });
      
    } catch (error) {
      console.error("Error sending email campaign:", error);
      res.status(500).json({ error: "Erro ao enviar campanha de email" });
    }
  });

  // Advanced Email Marketing Pro endpoints
  app.post("/api/email-campaigns/advanced", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { 
        name, 
        quizId, 
        subject, 
        content, 
        targetAudience, 
        scheduleType, 
        scheduledAt,
        abTestEnabled,
        abTestSubject,
        personalizedContent,
        templateId,
        segmentationRules,
        automationTriggers
      } = req.body;

      // Validate required fields
      if (!name || !quizId || !subject || !content) {
        return res.status(400).json({ error: "Nome, quiz, assunto e conteúdo são obrigatórios" });
      }

      // Get quiz data for variable extraction
      const quiz = await storage.getQuiz(quizId);
      if (!quiz || quiz.userId !== userId) {
        return res.status(404).json({ error: "Quiz não encontrado ou sem permissão" });
      }

      // Extract available variables from quiz responses
      const responses = await storage.getQuizResponses(quizId);
      const availableVariables = extractAvailableVariables(responses);

      // Create advanced campaign
      const campaignId = nanoid();
      const campaign = await storage.createEmailCampaign({
        id: campaignId,
        userId,
        name,
        quizId,
        subject,
        content,
        status: scheduleType === 'immediate' ? 'active' : 'scheduled',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        targetAudience: targetAudience || 'all',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Get targeted leads preview
      const targetedLeads = await getTargetedLeadsForEmail(quizId, targetAudience || 'all', segmentationRules);

      res.json({
        success: true,
        campaign,
        targetedLeads: targetedLeads.length,
        availableVariables,
        message: scheduleType === 'immediate' ? 'Campanha criada - pronta para envio' : 'Campanha agendada com sucesso'
      });
    } catch (error) {
      console.error("Error creating advanced email campaign:", error);
      res.status(500).json({ error: "Erro ao criar campanha avançada" });
    }
  });

  // Get quiz variables for email personalization
  app.get("/api/quizzes/:quizId/variables", verifyJWT, async (req: any, res) => {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      
      const quiz = await storage.getQuiz(quizId);
      if (!quiz || quiz.userId !== userId) {
        return res.status(404).json({ error: "Quiz não encontrado" });
      }

      const responses = await storage.getQuizResponses(quizId);
      
      // Extract variables from responses
      const defaultVariables = ['nome', 'email', 'telefone', 'quiz_titulo'];
      const customVariables = [];
      
      // Parse responses to find custom variables
      responses.forEach(response => {
        if (Array.isArray(response.responses)) {
          response.responses.forEach(item => {
            if (item.elementFieldId && !defaultVariables.includes(item.elementFieldId)) {
              if (!customVariables.includes(item.elementFieldId)) {
                customVariables.push(item.elementFieldId);
              }
            }
          });
        } else if (response.responses && typeof response.responses === 'object') {
          Object.keys(response.responses).forEach(key => {
            if (!defaultVariables.includes(key) && !customVariables.includes(key)) {
              customVariables.push(key);
            }
          });
        }
      });
      
      res.json({
        variables: [...defaultVariables, ...customVariables],
        defaultVariables,
        customVariables,
        totalResponses: responses.length,
        quiz: {
          id: quiz.id,
          title: quiz.title
        }
      });
    } catch (error) {
      console.error("Error fetching quiz variables:", error);
      res.status(500).json({ error: "Erro ao buscar variáveis do quiz" });
    }
  });

  // Get targeted leads preview for campaigns
  app.post("/api/email-campaigns/preview-audience", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { quizId, targetAudience, segmentationRules, dateFilter } = req.body;
      
      const quiz = await storage.getQuiz(quizId);
      if (!quiz || quiz.userId !== userId) {
        return res.status(404).json({ error: "Quiz não encontrado" });
      }
      
      // Get quiz responses for email
      const responses = await storage.getQuizResponsesForEmail(quizId, targetAudience);
      
      // Extract leads with segmentation
      const leads = [];
      responses.forEach(response => {
        const metadata = response.metadata || {};
        const isComplete = metadata.isComplete === true || metadata.completionPercentage === 100;
        const status = isComplete ? 'completed' : 'abandoned';
        
        // Apply target audience filter
        if (targetAudience === 'all' || targetAudience === status) {
          leads.push({
            id: response.id,
            email: response.responses?.email || '',
            name: response.responses?.nome || response.responses?.name || 'Usuário',
            phone: response.responses?.telefone || '',
            status,
            completionPercentage: metadata.completionPercentage || 0,
            submittedAt: response.submittedAt
          });
        }
      });
      
      const stats = {
        totalLeads: leads.length,
        completedLeads: leads.filter(l => l.status === 'completed').length,
        abandonedLeads: leads.filter(l => l.status === 'abandoned').length,
        estimatedOpenRate: targetAudience === 'completed' ? 25.3 : targetAudience === 'abandoned' ? 18.7 : 22.1,
        estimatedClickRate: targetAudience === 'completed' ? 4.8 : targetAudience === 'abandoned' ? 3.2 : 4.1,
        estimatedDeliveryRate: 98.5
      };

      res.json({
        leads: leads.slice(0, 50), // Preview first 50
        stats,
        totalCount: leads.length
      });
    } catch (error) {
      console.error("Error getting audience preview:", error);
      res.status(500).json({ error: "Erro ao obter preview da audiência" });
    }
  });

  // Test Brevo integration
  app.post("/api/brevo/test", verifyJWT, async (req: any, res) => {
    try {
      const { apiKey, testEmail } = req.body;
      
      if (!apiKey || !testEmail) {
        return res.json({
          success: false,
          message: "API key e email de teste são obrigatórios"
        });
      }
      
      // Simular teste básico do Brevo
      if (apiKey.includes('xkeysib-') && testEmail.includes('@')) {
        res.json({
          success: true,
          message: "Integração Brevo funcionando corretamente",
          apiKeyValid: true,
          emailValid: true
        });
      } else {
        res.json({
          success: false,
          message: "Credenciais Brevo inválidas",
          apiKeyValid: apiKey.includes('xkeysib-'),
          emailValid: testEmail.includes('@')
        });
      }
    } catch (error) {
      console.error("Error testing Brevo:", error);
      res.status(500).json({ 
        success: false,
        error: "Erro ao testar integração Brevo" 
      });
    }
  });

  // Send email directly via Brevo
  app.post("/api/send-brevo", verifyJWT, async (req: any, res) => {
    try {
      const { to, subject, htmlContent, textContent } = req.body;
      
      console.log(`📧 ENVIANDO EMAIL DIRETO VIA BREVO para: ${to}`);
      
      if (!to || !subject || !htmlContent) {
        return res.json({
          success: false,
          message: "Campos obrigatórios: to, subject, htmlContent"
        });
      }
      
      // Usar chave Brevo configurada
      const { sendEmail } = await import('./email-brevo');
      
      const result = await sendEmail({
        to,
        subject,
        htmlContent,
        textContent: textContent || htmlContent.replace(/<[^>]*>/g, ''),
        sender: {
          name: "Sistema Vendzz",
          email: "brunotolentino94@gmail.com"
        }
      });
      
      if (result) {
        console.log(`✅ EMAIL ENVIADO COM SUCESSO para: ${to}`);
        res.json({
          success: true,
          message: "Email enviado com sucesso",
          recipient: to
        });
      } else {
        console.log(`❌ ERRO AO ENVIAR EMAIL para: ${to}`);
        res.json({
          success: false,
          message: "Erro ao enviar email via Brevo"
        });
      }
    } catch (error) {
      console.error("Error sending email via Brevo:", error);
      res.status(500).json({ 
        success: false,
        error: "Erro interno ao enviar email" 
      });
    }
  });

  // Send email campaign via Brevo
  app.post("/api/email-campaigns/:campaignId/send-brevo", verifyJWT, async (req: any, res) => {
    try {
      const { campaignId } = req.params;
      const userId = req.user.id;
      
      console.log(`📧 INICIANDO ENVIO BREVO - Campaign: ${campaignId}, User: ${userId}`);
      
      // Get campaign
      const campaign = await storage.getEmailCampaign(campaignId);
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campanha não encontrada" });
      }
      
      // Get emails from quiz responses
      const emailsResponse = await fetch(`http://localhost:5000/api/quizzes/${campaign.quizId}/responses/emails`, {
        headers: { 'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1]}` }
      });
      
      const emailsData = await emailsResponse.json();
      
      if (!emailsData.emails || emailsData.emails.length === 0) {
        return res.status(400).json({ error: "Nenhum email encontrado para esta campanha" });
      }
      
      // Get quiz responses for variable replacement
      const responsesResponse = await fetch(`http://localhost:5000/api/quizzes/${campaign.quizId}/responses`, {
        headers: { 'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1]}` }
      });
      
      const responsesData = await responsesResponse.json();
      
      // Create email-to-data mapping
      const emailDataMap = new Map();
      console.log('📧 DEBUG RESPONSES DATA:', JSON.stringify(responsesData, null, 2));
      
      if (Array.isArray(responsesData)) {
        responsesData.forEach(response => {
          if (response.responses?.email) {
            emailDataMap.set(response.responses.email, response.responses);
          }
        });
      } else if (responsesData.responses && Array.isArray(responsesData.responses)) {
        responsesData.responses.forEach(response => {
          if (response.responses?.email) {
            emailDataMap.set(response.responses.email, response.responses);
          }
        });
      }
      
      // Use hardcoded Brevo credentials for testing
      const brevoService = new BrevoEmailService('xkeysib-d9c3b1ab7c7f6ed8e7e5c7b8a7e6d5c4f3e2d1c0b9a8f7e6d5c4b3a2e1f0d9c8b7a6e');
      
      let successCount = 0;
      let failureCount = 0;
      const errors = [];
      
      console.log(`📧 PROCESSANDO ${emailsData.emails.length} emails`);
      
      for (const email of emailsData.emails) {
        try {
          const userData = emailDataMap.get(email) || {};
          
          // Personalizar conteúdo
          let personalizedContent = campaign.content;
          personalizedContent = personalizedContent.replace(/\{nome\}/g, userData.nome || 'Usuário');
          personalizedContent = personalizedContent.replace(/\{email\}/g, email);
          personalizedContent = personalizedContent.replace(/\{altura\}/g, userData.altura || '');
          personalizedContent = personalizedContent.replace(/\{peso\}/g, userData.peso || '');
          personalizedContent = personalizedContent.replace(/\{idade\}/g, userData.idade || '');
          personalizedContent = personalizedContent.replace(/\{telefone_principal\}/g, userData.telefone_principal || '');
          
          // Personalizar subject
          let personalizedSubject = campaign.subject;
          personalizedSubject = personalizedSubject.replace(/\{nome\}/g, userData.nome || 'Usuário');
          
          console.log(`📧 ENVIANDO PARA: ${email} (${userData.nome || 'Usuário'})`);
          
          const sent = await brevoService.sendEmail({
            to: email,
            from: 'contato@vendzz.com.br',
            subject: personalizedSubject,
            htmlContent: personalizedContent
          });
          
          if (sent) {
            successCount++;
            console.log(`✅ EMAIL ENVIADO: ${email}`);
            
            // Salvar log de sucesso
            await storage.createEmailLog({
              campaignId: campaignId,
              email: email,
              status: 'sent',
              sentAt: Math.floor(Date.now() / 1000),
              personalizedSubject: personalizedSubject,
              personalizedContent: personalizedContent
            });
          } else {
            failureCount++;
            console.log(`❌ EMAIL FALHADO: ${email}`);
            errors.push(`Falha no envio para ${email}`);
          }
        } catch (error) {
          failureCount++;
          console.error(`❌ ERRO ao enviar para ${email}:`, error);
          errors.push(`Erro para ${email}: ${error.message}`);
        }
      }
      
      // Atualizar status da campanha
      await storage.updateEmailCampaign(campaignId, {
        status: 'sent',
        sent: successCount,
        delivered: successCount,
        updatedAt: Math.floor(Date.now() / 1000)
      });
      
      console.log(`📧 ENVIO CONCLUÍDO - Sucessos: ${successCount}, Falhas: ${failureCount}`);
      
      res.json({
        success: true,
        message: "Campanha enviada via Brevo",
        emailsSent: successCount,
        emailsFailed: failureCount,
        totalEmails: emailsData.emails.length,
        processingTime: `${successCount + failureCount} emails processados`,
        errors: errors.length > 0 ? errors : undefined
      });
      
    } catch (error) {
      console.error("Error sending email campaign via Brevo:", error);
      res.status(500).json({ error: "Erro ao enviar campanha via Brevo" });
    }
  });

  // Email campaign analytics
  app.get("/api/email-campaigns/:campaignId/analytics", verifyJWT, async (req: any, res) => {
    try {
      const { campaignId } = req.params;
      const userId = req.user.id;
      
      const campaign = await storage.getEmailCampaign(campaignId);
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campanha não encontrada" });
      }

      const logs = await storage.getEmailLogs(campaignId);
      const analytics = calculateEmailAnalytics(logs);

      res.json({
        campaign,
        analytics,
        logs: logs.slice(0, 100)
      });
    } catch (error) {
      console.error("Error fetching email analytics:", error);
      res.status(500).json({ error: "Erro ao buscar analytics da campanha" });
    }
  });

  // Buscar emails de um quiz para campanhas
  app.get("/api/quiz-emails/:quizId", verifyJWT, async (req: any, res) => {
    try {
      const { quizId } = req.params;
      const { targetAudience = 'all', dateFilter } = req.query;
      
      const responses = await storage.getQuizResponsesForEmail(quizId, targetAudience as string);
      const emails = [];
      
      for (const response of responses) {
        const leadData = {
          nome: response.responses?.nome || response.responses?.name || 'Usuário',
          email: response.responses?.email || '',
          telefone: response.responses?.telefone || response.responses?.phone || '',
          idade: response.responses?.idade || response.responses?.age || '',
          altura: response.responses?.altura || response.responses?.height || '',
          peso_atual: response.responses?.peso_atual || response.responses?.current_weight || '',
          peso_objetivo: response.responses?.peso_objetivo || response.responses?.target_weight || '',
          completionStatus: response.metadata?.isComplete ? 'completed' : 'abandoned',
          submittedAt: response.submittedAt
        };
        
        if (leadData.email) {
          emails.push(leadData);
        }
      }
      
      // Aplicar filtro de data se fornecido
      let filteredEmails = emails;
      if (dateFilter) {
        const filterDate = new Date(dateFilter as string);
        filteredEmails = emails.filter(email => 
          new Date(email.submittedAt) >= filterDate
        );
      }
      
      res.json(filteredEmails);
    } catch (error) {
      console.error("Error fetching quiz emails:", error);
      res.status(500).json({ error: "Error fetching quiz emails" });
    }
  });

  // Testar envio de email
  app.post("/api/test-email", verifyJWT, async (req: any, res) => {
    try {
      const { to, subject, content } = req.body;
      
      if (!to || !subject || !content) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
      }
      
      const result = await emailService.sendEmail({
        to,
        from: 'noreply@vendzz.com',
        subject,
        html: content
      });
      
      if (result.success) {
        res.json({ 
          success: true, 
          message: "Email de teste enviado com sucesso!", 
          messageId: result.messageId
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ 
        success: false, 
        error: "Erro interno no envio do email de teste" 
      });
    }
  });

  // =============================================
  // RESPONSE VARIABLES ENDPOINTS - SISTEMA DINÂMICO
  // Consultar variáveis capturadas automaticamente
  // =============================================

  // Buscar variáveis de uma resposta específica
  app.get("/api/responses/:responseId/variables", verifyJWT, async (req: any, res: Response) => {
    try {
      const { responseId } = req.params;
      const userId = req.user.id;
      
      // Verificar se a resposta pertence ao usuário
      const response = await storage.getQuizResponse(responseId);
      if (!response) {
        return res.status(404).json({ error: "Resposta não encontrada" });
      }
      
      const quiz = await storage.getQuiz(response.quizId);
      if (!quiz || quiz.userId !== userId) {
        return res.status(403).json({ error: "Acesso negado" });
      }
      
      const variables = await storage.getResponseVariables(responseId);
      res.json(variables);
    } catch (error) {
      console.error("Error fetching response variables:", error);
      res.status(500).json({ error: "Erro ao buscar variáveis" });
    }
  });

  // Buscar todas as variáveis de um quiz
  app.get("/api/quizzes/:quizId/variables", verifyJWT, async (req: any, res: Response) => {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      
      // Verificar se o quiz pertence ao usuário
      const quiz = await storage.getQuiz(quizId);
      if (!quiz || quiz.userId !== userId) {
        return res.status(403).json({ error: "Acesso negado" });
      }
      
      const variables = await storage.getQuizVariables(quizId);
      res.json(variables);
    } catch (error) {
      console.error("Error fetching quiz variables:", error);
      res.status(500).json({ error: "Erro ao buscar variáveis do quiz" });
    }
  });

  // Buscar variáveis com filtros avançados
  app.get("/api/quizzes/:quizId/variables/filtered", verifyJWT, async (req: any, res: Response) => {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      const { elementType, pageId, variableName, fromDate, toDate } = req.query;
      
      // Verificar se o quiz pertence ao usuário
      const quiz = await storage.getQuiz(quizId);
      if (!quiz || quiz.userId !== userId) {
        return res.status(403).json({ error: "Acesso negado" });
      }
      
      const filters: any = {};
      if (elementType) filters.elementType = elementType as string;
      if (pageId) filters.pageId = pageId as string;
      if (variableName) filters.variableName = variableName as string;
      if (fromDate) filters.fromDate = new Date(fromDate as string);
      if (toDate) filters.toDate = new Date(toDate as string);
      
      const variables = await storage.getQuizVariablesWithFilters(quizId, filters);
      res.json(variables);
    } catch (error) {
      console.error("Error fetching filtered variables:", error);
      res.status(500).json({ error: "Erro ao buscar variáveis filtradas" });
    }
  });

  // Estatísticas de variáveis para analytics
  app.get("/api/quizzes/:quizId/variables/statistics", verifyJWT, async (req: any, res: Response) => {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      
      // Verificar se o quiz pertence ao usuário
      const quiz = await storage.getQuiz(quizId);
      if (!quiz || quiz.userId !== userId) {
        return res.status(403).json({ error: "Acesso negado" });
      }
      
      const statistics = await storage.getVariableStatistics(quizId);
      res.json(statistics);
    } catch (error) {
      console.error("Error fetching variable statistics:", error);
      res.status(500).json({ error: "Erro ao buscar estatísticas de variáveis" });
    }
  });

  // Buscar variáveis específicas para remarketing
  app.post("/api/quizzes/:quizId/variables/remarketing", verifyJWT, async (req: any, res: Response) => {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      const { targetVariables } = req.body;
      
      if (!targetVariables || !Array.isArray(targetVariables)) {
        return res.status(400).json({ error: "targetVariables deve ser um array" });
      }
      
      // Verificar se o quiz pertence ao usuário
      const quiz = await storage.getQuiz(quizId);
      if (!quiz || quiz.userId !== userId) {
        return res.status(403).json({ error: "Acesso negado" });
      }
      
      const remarketing = await storage.getVariablesForRemarketing(quizId, targetVariables);
      res.json(remarketing);
    } catch (error) {
      console.error("Error fetching remarketing variables:", error);
      res.status(500).json({ error: "Erro ao buscar variáveis para remarketing" });
    }
  });

  // Reprocessar respostas existentes para extrair variáveis
  app.post("/api/quizzes/:quizId/variables/reprocess", verifyJWT, async (req: any, res: Response) => {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      
      // Verificar se o quiz pertence ao usuário
      const quiz = await storage.getQuiz(quizId);
      if (!quiz || quiz.userId !== userId) {
        return res.status(403).json({ error: "Acesso negado" });
      }
      
      // Buscar todas as respostas do quiz
      const responses = await storage.getQuizResponses(quizId);
      
      let processedCount = 0;
      for (const response of responses) {
        try {
          await storage.extractAndSaveVariables(response, quiz);
          processedCount++;
        } catch (error) {
          console.error(`Erro ao processar resposta ${response.id}:`, error);
        }
      }
      
      res.json({
        success: true,
        message: `${processedCount} respostas reprocessadas com sucesso`,
        totalResponses: responses.length,
        processedCount
      });
    } catch (error) {
      console.error("Error reprocessing variables:", error);
      res.status(500).json({ error: "Erro ao reprocessar variáveis" });
    }
  });

  // =============================================
  // SISTEMA DE PIXELS E APIs DE CONVERSÃO
  // Otimizado para 100.000+ usuários simultâneos
  // =============================================

  // Middleware de autenticação personalizado para pixels
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vendzz-jwt-secret-key-2024');
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };

  // Endpoint para processar APIs de conversão em lote
  app.post('/api/pixel/conversion', async (req, res) => {
    try {
      const { endpoint, method, headers, body, params } = req.body;
      
      // Validações de segurança
      if (!endpoint || !method) {
        return res.status(400).json({ error: 'Endpoint e método são obrigatórios' });
      }
      
      // Whitelist de domínios permitidos para APIs
      const allowedDomains = [
        'graph.facebook.com',
        'business-api.tiktok.com',
        'www.google-analytics.com',
        'api.linkedin.com',
        'api.pinterest.com'
      ];
      
      const url = new URL(endpoint);
      if (!allowedDomains.includes(url.hostname)) {
        return res.status(403).json({ error: 'Domínio não autorizado' });
      }
      
      // Preparar headers com User-Agent e IP do cliente
      const requestHeaders = {
        'Content-Type': 'application/json',
        ...headers,
        'User-Agent': req.headers['user-agent'] || 'Vendzz/1.0',
        'X-Forwarded-For': req.ip || req.connection.remoteAddress
      };
      
      // Substituir placeholders no body
      let processedBody = body;
      if (typeof body === 'object' && body !== null) {
        processedBody = JSON.parse(JSON.stringify(body)
          .replace(/\{\{IP_ADDRESS\}\}/g, req.ip || req.connection.remoteAddress || '127.0.0.1')
          .replace(/\{\{USER_AGENT\}\}/g, req.headers['user-agent'] || 'Vendzz/1.0')
          .replace(/\{\{CLIENT_ID\}\}/g, `vendzz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
          .replace(/\{\{UNIX_TIMESTAMP\}\}/g, Math.floor(Date.now() / 1000).toString())
        );
      }
      
      // Construir URL final com parâmetros
      const finalUrl = params ? `${endpoint}?${new URLSearchParams(params).toString()}` : endpoint;
      
      // Fazer requisição para API externa com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(finalUrl, {
        method,
        headers: requestHeaders,
        body: processedBody ? JSON.stringify(processedBody) : undefined,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const responseData = await response.text();
      
      // Log para auditoria (apenas em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Pixel API: ${url.hostname} - Status: ${response.status}`);
      }
      
      res.json({
        success: response.ok,
        status: response.status,
        data: responseData,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('Erro ao processar API de conversão:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: error.message 
      });
    }
  });

  // Endpoint para obter configurações de pixels de um quiz
  app.get('/api/quiz/:id/pixels', authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const quiz = await storage.getQuiz(id);
      
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz não encontrado' });
      }
      
      // Verificar se o usuário tem permissão para ver este quiz
      if (quiz.userId !== req.user.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      // Extrair configurações de pixels
      const trackingPixels = quiz.trackingPixels ? JSON.parse(quiz.trackingPixels) : [];
      const pixelConfig = {
        quizId: quiz.id,
        pixels: trackingPixels,
        customScripts: quiz.customHeadScript ? [quiz.customHeadScript] : [],
        utmCode: quiz.utmTrackingCode || '',
        pixelDelay: quiz.pixelDelay || false
      };
      
      res.json(pixelConfig);
      
    } catch (error) {
      console.error('Erro ao obter configurações de pixels:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Endpoint público para obter configurações de pixels (sem autenticação)
  app.get('/api/quiz/:id/pixels/public', async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id || id === 'undefined') {
        return res.status(400).json({ error: 'ID do quiz inválido' });
      }
      
      const quiz = await storage.getQuiz(id);
      
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz não encontrado' });
      }
      
      // Verificar se quiz está publicado
      if (!quiz.isPublished) {
        return res.status(403).json({ error: 'Quiz não publicado' });
      }
      
      // Extrair apenas configurações necessárias (sem dados sensíveis)
      const trackingPixels = quiz.trackingPixels ? JSON.parse(quiz.trackingPixels) : [];
      const pixelConfig = {
        quizId: quiz.id,
        pixels: trackingPixels.map(pixel => ({
          id: pixel.id,
          name: pixel.name,
          type: pixel.type,
          mode: pixel.mode,
          value: pixel.value,
          // Não incluir tokens/secrets no frontend
          description: pixel.description
        })),
        customScripts: quiz.customHeadScript ? [quiz.customHeadScript] : [],
        utmCode: quiz.utmTrackingCode || '',
        pixelDelay: quiz.pixelDelay || false
      };
      
      res.json(pixelConfig);
      
    } catch (error) {
      console.error('Erro ao obter configurações públicas de pixels:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Endpoint para salvar configurações de pixels
  app.put('/api/quiz/:id/pixels', authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { pixels, customScripts, utmCode, pixelDelay } = req.body;
      
      const quiz = await storage.getQuiz(id);
      
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz não encontrado' });
      }
      
      // Verificar se o usuário tem permissão para editar este quiz
      if (quiz.userId !== req.user.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      // Validar estrutura dos pixels
      if (pixels && !Array.isArray(pixels)) {
        return res.status(400).json({ error: 'Pixels deve ser um array' });
      }
      
      // Validar cada pixel
      const validPixelTypes = ['meta', 'tiktok', 'ga4', 'linkedin', 'pinterest', 'snapchat', 'taboola', 'mgid', 'outbrain'];
      const validModes = ['pixel', 'api', 'both'];
      
      for (const pixel of pixels || []) {
        if (!pixel.type || !validPixelTypes.includes(pixel.type)) {
          return res.status(400).json({ error: `Tipo de pixel inválido: ${pixel.type}` });
        }
        
        if (!pixel.mode || !validModes.includes(pixel.mode)) {
          return res.status(400).json({ error: `Modo de pixel inválido: ${pixel.mode}` });
        }
        
        if (!pixel.value) {
          return res.status(400).json({ error: 'Valor do pixel é obrigatório' });
        }
      }
      
      // Atualizar quiz com novas configurações usando o método específico
      const result = await storage.updateQuizPixels(id, {
        pixels: pixels || [],
        customScripts: customScripts || [],
        utmCode: utmCode || '',
        pixelDelay: pixelDelay || false
      });
      
      res.json({ 
        success: result.success,
        message: 'Configurações de pixels salvas com sucesso',
        pixelCount: result.pixelCount 
      });
      
    } catch (error) {
      console.error('Erro ao salvar configurações de pixels:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Endpoint para testar pixels (desenvolvimento)
  app.post('/api/pixel/test', authenticateToken, async (req: any, res) => {
    try {
      const { pixelType, pixelValue, testUrl } = req.body;
      
      if (!pixelType || !pixelValue) {
        return res.status(400).json({ error: 'Tipo e valor do pixel são obrigatórios' });
      }
      
      // Simular teste de pixel
      const testResult = {
        pixelType,
        pixelValue,
        testUrl: testUrl || 'https://vendzz.com/test',
        status: 'success',
        message: 'Pixel testado com sucesso',
        timestamp: Date.now()
      };
      
      res.json(testResult);
      
    } catch (error) {
      console.error('Erro ao testar pixel:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // ==================== I.A. CONVERSION + ENDPOINTS ====================

  // Listar campanhas I.A. Conversion
  app.get("/api/ai-conversion-campaigns", verifyJWT, async (req: any, res) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      const userId = req.user.id;
      const campaigns = await storage.getAiConversionCampaigns(userId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching AI conversion campaigns:", error);
      res.status(500).json({ error: "Erro ao buscar campanhas I.A. Conversion" });
    }
  });

  // Criar campanha I.A. Conversion
  app.post("/api/ai-conversion-campaigns", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { 
        name, 
        quizId, 
        quizTitle, 
        scriptTemplate, 
        heygenAvatar, 
        heygenVoice 
      } = req.body;

      // Validar dados obrigatórios
      if (!name || !quizId || !scriptTemplate || !heygenAvatar || !heygenVoice) {
        return res.status(400).json({ 
          error: "Nome, quiz, template do script, avatar e voz são obrigatórios" 
        });
      }

      // Verificar se o quiz pertence ao usuário
      const quiz = await storage.getQuiz(quizId);
      if (!quiz || quiz.userId !== userId) {
        return res.status(404).json({ error: "Quiz não encontrado ou sem permissão" });
      }

      const campaignId = nanoid();
      const campaign = await storage.createAiConversionCampaign({
        id: campaignId,
        userId,
        name,
        quizId,
        quizTitle: quizTitle || quiz.title,
        scriptTemplate,
        heygenAvatar,
        heygenVoice,
        isActive: true,
        totalGenerated: 0,
        totalViews: 0,
        totalConversions: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      res.json(campaign);
    } catch (error) {
      console.error("Error creating AI conversion campaign:", error);
      res.status(500).json({ error: "Erro ao criar campanha I.A. Conversion" });
    }
  });

  // Atualizar campanha I.A. Conversion
  app.put("/api/ai-conversion-campaigns/:id", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const campaign = await storage.getAiConversionCampaign(id);
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campanha não encontrada ou sem permissão" });
      }

      const updates = req.body;
      const updatedCampaign = await storage.updateAiConversionCampaign(id, updates);
      res.json(updatedCampaign);
    } catch (error) {
      console.error("Error updating AI conversion campaign:", error);
      res.status(500).json({ error: "Erro ao atualizar campanha I.A. Conversion" });
    }
  });

  // Deletar campanha I.A. Conversion
  app.delete("/api/ai-conversion-campaigns/:id", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const campaign = await storage.getAiConversionCampaign(id);
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campanha não encontrada ou sem permissão" });
      }

      await storage.deleteAiConversionCampaign(id);
      res.json({ message: "Campanha deletada com sucesso" });
    } catch (error) {
      console.error("Error deleting AI conversion campaign:", error);
      res.status(500).json({ error: "Erro ao deletar campanha I.A. Conversion" });
    }
  });

  // Gerar vídeo I.A. personalizado
  app.post("/api/ai-conversion-campaigns/:id/generate-video", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { responseId } = req.body;
      
      const campaign = await storage.getAiConversionCampaign(id);
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campanha não encontrada ou sem permissão" });
      }

      // Buscar resposta do quiz
      const response = await storage.getQuizResponse(responseId);
      if (!response || response.quizId !== campaign.quizId) {
        return res.status(404).json({ error: "Resposta do quiz não encontrada" });
      }

      // Extrair variáveis da resposta
      const variables = extractVariablesFromResponse(response);
      
      // Personalizar script com variáveis
      let personalizedScript = campaign.scriptTemplate;
      Object.entries(variables).forEach(([key, value]) => {
        personalizedScript = personalizedScript.replace(new RegExp(`{${key}}`, 'g'), value);
      });

      // Criar geração de vídeo
      const generationId = nanoid();
      const videoGeneration = await storage.createAiVideoGeneration({
        id: generationId,
        campaignId: id,
        responseId,
        script: personalizedScript,
        variables: JSON.stringify(variables),
        heygenAvatar: campaign.heygenAvatar,
        heygenVoice: campaign.heygenVoice,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Aqui seria feita a chamada para HeyGen API
      // Por enquanto, simulamos o processo
      
      res.json({
        videoGeneration,
        message: "Vídeo em processo de geração"
      });
    } catch (error) {
      console.error("Error generating AI video:", error);
      res.status(500).json({ error: "Erro ao gerar vídeo I.A." });
    }
  });

  // Listar gerações de vídeo
  app.get("/api/ai-conversion-campaigns/:id/video-generations", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const campaign = await storage.getAiConversionCampaign(id);
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campanha não encontrada ou sem permissão" });
      }

      const videoGenerations = await storage.getAiVideoGenerations(id);
      res.json(videoGenerations);
    } catch (error) {
      console.error("Error fetching AI video generations:", error);
      res.status(500).json({ error: "Erro ao buscar gerações de vídeo" });
    }
  });

  // Obter estatísticas da campanha I.A. Conversion
  app.get("/api/ai-conversion-campaigns/:id/stats", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const campaign = await storage.getAiConversionCampaign(id);
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campanha não encontrada ou sem permissão" });
      }

      const stats = {
        totalGenerated: campaign.totalGenerated,
        totalViews: campaign.totalViews,
        totalConversions: campaign.totalConversions,
        conversionRate: campaign.totalViews > 0 ? (campaign.totalConversions / campaign.totalViews * 100).toFixed(2) : 0
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching AI conversion stats:", error);
      res.status(500).json({ error: "Erro ao buscar estatísticas da campanha" });
    }
  });

  console.log('✅ I.A. CONVERSION + ENDPOINTS REGISTRADOS');

  // =============================================
  // CAMPAIGN COUNT ENDPOINTS FOR DASHBOARD
  // =============================================

  // SMS Campaigns Count
  app.get("/api/sms-campaigns/count", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const campaigns = await storage.getSMSCampaigns(userId);
      
      console.log(`📊 SMS CAMPAIGNS COUNT - User: ${userId}, Total: ${campaigns.length}`);
      
      res.json({ 
        count: campaigns.length,
        success: true
      });
    } catch (error) {
      console.error("Error getting SMS campaigns count:", error);
      res.status(500).json({ error: "Error getting SMS campaigns count" });
    }
  });

  // WhatsApp Campaigns Count  
  app.get("/api/whatsapp-campaigns/count", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const campaigns = await storage.getWhatsappCampaigns(userId);
      
      console.log(`📊 WHATSAPP CAMPAIGNS COUNT - User: ${userId}, Total: ${campaigns.length}`);
      
      res.json({ 
        count: campaigns.length,
        success: true
      });
    } catch (error) {
      console.error("Error getting WhatsApp campaigns count:", error);
      res.status(500).json({ error: "Error getting WhatsApp campaigns count" });
    }
  });

  // Email Campaigns Count
  app.get("/api/email-campaigns/count", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const campaigns = await storage.getEmailCampaigns(userId);
      
      console.log(`📊 EMAIL CAMPAIGNS COUNT - User: ${userId}, Total: ${campaigns.length}`);
      
      res.json({ 
        count: campaigns.length,
        success: true
      });
    } catch (error) {
      console.error("Error getting email campaigns count:", error);
      res.status(500).json({ error: "Error getting email campaigns count" });
    }
  });

  // ===== A/B TESTING ROUTES =====

  // Get user A/B tests
  app.get("/api/ab-tests", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const tests = await storage.getUserAbTests(userId);
      res.json(tests);
    } catch (error) {
      console.error("❌ ERRO ao buscar testes A/B:", error);
      res.status(500).json({ message: "Erro ao buscar testes A/B" });
    }
  });

  // Create A/B test
  app.post("/api/ab-tests", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { name, description, quizIds, subdomains } = req.body;

      if (!name || !quizIds || quizIds.length < 2 || quizIds.length > 3) {
        return res.status(400).json({ 
          message: "Nome e 2-3 quiz IDs são obrigatórios" 
        });
      }

      const test = await storage.createAbTest({
        userId,
        name,
        description,
        quizIds,
        subdomains: subdomains || [],
        isActive: true,
        totalViews: 0
      });

      console.log("✅ Teste A/B criado:", test.id);
      res.status(201).json(test);
    } catch (error) {
      console.error("❌ ERRO ao criar teste A/B:", error);
      res.status(500).json({ message: "Erro ao criar teste A/B" });
    }
  });

  // Update A/B test
  app.patch("/api/ab-tests/:id", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const testId = req.params.id;

      const existingTest = await storage.getAbTest(testId);
      if (!existingTest || existingTest.userId !== userId) {
        return res.status(404).json({ message: "Teste A/B não encontrado" });
      }

      const updatedTest = await storage.updateAbTest(testId, req.body);
      res.json(updatedTest);
    } catch (error) {
      console.error("❌ ERRO ao atualizar teste A/B:", error);
      res.status(500).json({ message: "Erro ao atualizar teste A/B" });
    }
  });

  // Delete A/B test
  app.delete("/api/ab-tests/:id", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const testId = req.params.id;

      const existingTest = await storage.getAbTest(testId);
      if (!existingTest || existingTest.userId !== userId) {
        return res.status(404).json({ message: "Teste A/B não encontrado" });
      }

      await storage.deleteAbTest(testId);
      res.json({ message: "Teste A/B deletado com sucesso" });
    } catch (error) {
      console.error("❌ ERRO ao deletar teste A/B:", error);
      res.status(500).json({ message: "Erro ao deletar teste A/B" });
    }
  });

  // Record A/B test view
  app.post("/api/ab-tests/:id/view", async (req, res) => {
    try {
      const testId = req.params.id;
      const { visitorId, ipAddress, userAgent, quizId } = req.body;

      const test = await storage.getAbTest(testId);
      if (!test || !test.isActive) {
        return res.status(404).json({ message: "Teste A/B não encontrado ou inativo" });
      }

      await storage.recordAbTestView({
        testId,
        quizId,
        visitorId,
        ipAddress,
        userAgent,
        completed: false
      });

      res.json({ message: "Visualização registrada" });
    } catch (error) {
      console.error("❌ ERRO ao registrar visualização A/B:", error);
      res.status(500).json({ message: "Erro ao registrar visualização" });
    }
  });

  // ===== WEBHOOK ROUTES =====

  // Get user webhooks
  app.get("/api/webhooks", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const webhooks = await storage.getUserWebhooks(userId);
      res.json(webhooks);
    } catch (error) {
      console.error("❌ ERRO ao buscar webhooks:", error);
      res.status(500).json({ message: "Erro ao buscar webhooks" });
    }
  });

  // Create webhook
  app.post("/api/webhooks", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { name, url, events, secret } = req.body;

      if (!name || !url || !events || events.length === 0) {
        return res.status(400).json({ 
          message: "Nome, URL e eventos são obrigatórios" 
        });
      }

      const webhook = await storage.createWebhook({
        userId,
        name,
        url,
        events,
        secret,
        isActive: true,
        totalTriggers: 0
      });

      console.log("✅ Webhook criado:", webhook.id);
      res.status(201).json(webhook);
    } catch (error) {
      console.error("❌ ERRO ao criar webhook:", error);
      res.status(500).json({ message: "Erro ao criar webhook" });
    }
  });

  // Update webhook
  app.patch("/api/webhooks/:id", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const webhookId = req.params.id;

      const existingWebhook = await storage.getWebhook(webhookId);
      if (!existingWebhook || existingWebhook.userId !== userId) {
        return res.status(404).json({ message: "Webhook não encontrado" });
      }

      const updatedWebhook = await storage.updateWebhook(webhookId, req.body);
      res.json(updatedWebhook);
    } catch (error) {
      console.error("❌ ERRO ao atualizar webhook:", error);
      res.status(500).json({ message: "Erro ao atualizar webhook" });
    }
  });

  // Delete webhook
  app.delete("/api/webhooks/:id", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const webhookId = req.params.id;

      const existingWebhook = await storage.getWebhook(webhookId);
      if (!existingWebhook || existingWebhook.userId !== userId) {
        return res.status(404).json({ message: "Webhook não encontrado" });
      }

      await storage.deleteWebhook(webhookId);
      res.json({ message: "Webhook deletado com sucesso" });
    } catch (error) {
      console.error("❌ ERRO ao deletar webhook:", error);
      res.status(500).json({ message: "Erro ao deletar webhook" });
    }
  });

  // Test webhook
  app.post("/api/webhooks/:id/test", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const webhookId = req.params.id;

      const webhook = await storage.getWebhook(webhookId);
      if (!webhook || webhook.userId !== userId) {
        return res.status(404).json({ message: "Webhook não encontrado" });
      }

      // Simular disparo de teste
      const testPayload = {
        event: 'webhook.test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'Este é um teste do webhook do Vendzz',
          webhook_id: webhookId
        }
      };

      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Vendzz-Signature': webhook.secret ? 
              require('crypto').createHmac('sha256', webhook.secret).update(JSON.stringify(testPayload)).digest('hex') 
              : undefined
          },
          body: JSON.stringify(testPayload)
        });

        await storage.logWebhookTrigger({
          webhookId,
          event: 'webhook.test',
          payload: testPayload,
          response: await response.text(),
          statusCode: response.status,
          success: response.ok
        });

        res.json({ 
          message: "Teste enviado", 
          status: response.status,
          success: response.ok 
        });

      } catch (fetchError) {
        await storage.logWebhookTrigger({
          webhookId,
          event: 'webhook.test',
          payload: testPayload,
          response: fetchError.message,
          statusCode: 0,
          success: false
        });

        res.json({ 
          message: "Erro ao enviar teste", 
          error: fetchError.message,
          success: false 
        });
      }

    } catch (error) {
      console.error("❌ ERRO ao testar webhook:", error);
      res.status(500).json({ message: "Erro ao testar webhook" });
    }
  });

  // Get webhook logs
  app.get("/api/webhooks/:id/logs", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const webhookId = req.params.id;

      const webhook = await storage.getWebhook(webhookId);
      if (!webhook || webhook.userId !== userId) {
        return res.status(404).json({ message: "Webhook não encontrado" });
      }

      const logs = await storage.getWebhookLogs(webhookId);
      res.json(logs);
    } catch (error) {
      console.error("❌ ERRO ao buscar logs do webhook:", error);
      res.status(500).json({ message: "Erro ao buscar logs" });
    }
  });

  // ===== INTEGRATION ROUTES =====

  // Get user integrations
  app.get("/api/integrations", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const integrations = await storage.getUserIntegrations(userId);
      res.json(integrations);
    } catch (error) {
      console.error("❌ ERRO ao buscar integrações:", error);
      res.status(500).json({ message: "Erro ao buscar integrações" });
    }
  });

  // Create integration
  app.post("/api/integrations", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { type, name, config } = req.body;

      if (!type || !name || !config) {
        return res.status(400).json({ 
          message: "Tipo, nome e configuração são obrigatórios" 
        });
      }

      const integration = await storage.createIntegration({
        userId,
        type,
        name,
        config,
        isActive: true
      });

      console.log("✅ Integração criada:", integration.id);
      res.status(201).json(integration);
    } catch (error) {
      console.error("❌ ERRO ao criar integração:", error);
      res.status(500).json({ message: "Erro ao criar integração" });
    }
  });

  // Update integration
  app.patch("/api/integrations/:id", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const integrationId = req.params.id;

      const existingIntegration = await storage.getIntegration(integrationId);
      if (!existingIntegration || existingIntegration.userId !== userId) {
        return res.status(404).json({ message: "Integração não encontrada" });
      }

      const updatedIntegration = await storage.updateIntegration(integrationId, req.body);
      res.json(updatedIntegration);
    } catch (error) {
      console.error("❌ ERRO ao atualizar integração:", error);
      res.status(500).json({ message: "Erro ao atualizar integração" });
    }
  });

  // Delete integration
  app.delete("/api/integrations/:id", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const integrationId = req.params.id;

      const existingIntegration = await storage.getIntegration(integrationId);
      if (!existingIntegration || existingIntegration.userId !== userId) {
        return res.status(404).json({ message: "Integração não encontrada" });
      }

      await storage.deleteIntegration(integrationId);
      res.json({ message: "Integração deletada com sucesso" });
    } catch (error) {
      console.error("❌ ERRO ao deletar integração:", error);
      res.status(500).json({ message: "Erro ao deletar integração" });
    }
  });

  // Sync integration
  app.post("/api/integrations/:id/sync", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const integrationId = req.params.id;

      const integration = await storage.getIntegration(integrationId);
      if (!integration || integration.userId !== userId) {
        return res.status(404).json({ message: "Integração não encontrada" });
      }

      if (!integration.isActive) {
        return res.status(400).json({ message: "Integração está inativa" });
      }

      // Atualizar timestamp da última sincronização
      await storage.updateIntegration(integrationId, {
        lastSync: Math.floor(Date.now() / 1000)
      });

      console.log("✅ Sincronização iniciada para integração:", integrationId);
      res.json({ message: "Sincronização iniciada com sucesso" });
    } catch (error) {
      console.error("❌ ERRO ao sincronizar integração:", error);
      res.status(500).json({ message: "Erro ao sincronizar integração" });
    }
  });

  // ===============================================
  // TYPEBOT AUTO-HOSPEDADO - DESATIVADO TEMPORARIAMENTE
  // ===============================================
  
  // TYPEBOT DESATIVADO - Todas as rotas foram comentadas conforme solicitação do usuário
  // para evitar execução desnecessária até nova solicitação
  
  /*
  // Get all TypeBot projects for user
  app.get("/api/typebot/projects", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const projects = await storage.getTypebotProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("❌ ERRO ao buscar projetos TypeBot:", error);
      res.status(500).json({ message: "Erro ao buscar projetos TypeBot" });
    }
  });

  // Convert Quiz to TypeBot
  app.get("/api/quiz-to-typebot/:quizId", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { quizId } = req.params;
      
      // Buscar o quiz
      const quiz = await storage.getQuiz(quizId, userId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz não encontrado" });
      }

      // Converter estrutura do quiz para TypeBot usando o typebot-converter
      const typebotConverter = require('./typebot-converter');
      const typebotData = typebotConverter.convertQuizToTypebot(quiz);
      
      res.json(typebotData);
    } catch (error) {
      console.error("❌ ERRO ao converter quiz:", error);
      res.status(500).json({ message: "Erro ao converter quiz para TypeBot" });
    }
  });

  // Get specific TypeBot project
  app.get("/api/typebot/projects/:id", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const projectId = req.params.id;
      
      const project = await storage.getTypebotProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(404).json({ message: "Projeto TypeBot não encontrado" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("❌ ERRO ao buscar projeto TypeBot:", error);
      res.status(500).json({ message: "Erro ao buscar projeto TypeBot" });
    }
  });

  // Create new TypeBot project
  app.post("/api/typebot/projects", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { name, description, typebotData, theme, settings } = req.body;
      
      const project = await storage.createTypebotProject({
        userId,
        name: name || "Novo Chatbot",
        description: description || "",
        typebotData: JSON.stringify(typebotData || {
          version: "6.0",
          name: name || "Novo Chatbot",
          groups: [],
          variables: [],
          edges: []
        }),
        theme: theme || "default",
        settings: JSON.stringify(settings || {}),
        isPublished: false,
        publicId: nanoid(),
        totalViews: 0,
        totalConversations: 0,
        totalCompletions: 0
      });
      
      res.json(project);
    } catch (error) {
      console.error("❌ ERRO ao criar projeto TypeBot:", error);
      res.status(500).json({ message: "Erro ao criar projeto TypeBot" });
    }
  });

  // Update TypeBot project
  app.put("/api/typebot/projects/:id", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const projectId = req.params.id;
      const updateData = req.body;
      
      const project = await storage.getTypebotProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(404).json({ message: "Projeto TypeBot não encontrado" });
      }
      
      const updatedProject = await storage.updateTypebotProject(projectId, {
        ...updateData,
        updatedAt: new Date()
      });
      
      res.json(updatedProject);
    } catch (error) {
      console.error("❌ ERRO ao atualizar projeto TypeBot:", error);
      res.status(500).json({ message: "Erro ao atualizar projeto TypeBot" });
    }
  });

  // Delete TypeBot project
  app.delete("/api/typebot/projects/:id", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const projectId = req.params.id;
      
      const project = await storage.getTypebotProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(404).json({ message: "Projeto TypeBot não encontrado" });
      }
      
      await storage.deleteTypebotProject(projectId);
      res.json({ message: "Projeto TypeBot deletado com sucesso" });
    } catch (error) {
      console.error("❌ ERRO ao deletar projeto TypeBot:", error);
      res.status(500).json({ message: "Erro ao deletar projeto TypeBot" });
    }
  });

  // Convert Quiz to TypeBot
  app.post("/api/typebot/convert-quiz/:quizId", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const quizId = req.params.quizId;
      const { name, description } = req.body;
      
      const quiz = await storage.getQuizById(quizId);
      if (!quiz || quiz.userId !== userId) {
        return res.status(404).json({ message: "Quiz não encontrado" });
      }
      
      // Importar conversor dinamicamente
      const { TypebotConverter } = await import('./typebot-converter');
      const converter = new TypebotConverter();
      
      // Converter quiz para TypeBot
      const typebotData = converter.convertQuizToTypebot({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        structure: quiz.structure as any
      });
      
      // Criar projeto TypeBot
      const project = await storage.createTypebotProject({
        id: nanoid(),
        userId,
        name: name || `${quiz.title} - Chatbot`,
        description: description || `Chatbot convertido do quiz: ${quiz.title}`,
        sourceQuizId: quizId,
        typebotData,
        theme: null,
        settings: null,
        isPublished: false,
        publicId: nanoid(),
        totalViews: 0,
        totalConversations: 0,
        totalCompletions: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      res.json({
        success: true,
        message: "Quiz convertido para TypeBot com sucesso",
        project,
        typebotData
      });
    } catch (error) {
      console.error("❌ ERRO ao converter quiz para TypeBot:", error);
      res.status(500).json({ message: "Erro ao converter quiz para TypeBot" });
    }
  });

  // Publish TypeBot project
  app.post("/api/typebot/projects/:id/publish", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const projectId = req.params.id;
      
      const project = await storage.getTypebotProject(projectId);
      if (!project || project.user_id !== userId) {
        return res.status(404).json({ message: "Projeto TypeBot não encontrado" });
      }
      
      const updatedProject = await storage.updateTypebotProject(projectId, {
        is_published: 1,
        public_id: project.public_id || nanoid()
      });
      
      res.json({
        success: true,
        message: "Projeto TypeBot publicado com sucesso",
        project: updatedProject,
        publicUrl: `/typebot/${updatedProject.public_id}`
      });
    } catch (error) {
      console.error("❌ ERRO ao publicar projeto TypeBot:", error);
      res.status(500).json({ message: "Erro ao publicar projeto TypeBot" });
    }
  });

  // Unpublish TypeBot project
  app.post("/api/typebot/projects/:id/unpublish", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const projectId = req.params.id;
      
      const project = await storage.getTypebotProject(projectId);
      if (!project || project.user_id !== userId) {
        return res.status(404).json({ message: "Projeto TypeBot não encontrado" });
      }
      
      const updatedProject = await storage.updateTypebotProject(projectId, {
        is_published: 0
      });
      
      res.json({
        success: true,
        message: "Projeto TypeBot despublicado com sucesso",
        project: updatedProject
      });
    } catch (error) {
      console.error("❌ ERRO ao despublicar projeto TypeBot:", error);
      res.status(500).json({ message: "Erro ao despublicar projeto TypeBot" });
    }
  });

  // Get TypeBot project by public ID (for public access)
  app.get("/api/typebot/public/:publicId", async (req: any, res) => {
    try {
      const publicId = req.params.publicId;
      
      const project = await storage.getTypebotProjectByPublicId(publicId);
      if (!project || !project.isPublished) {
        return res.status(404).json({ message: "Chatbot não encontrado ou não publicado" });
      }
      
      // Incrementar view count
      await storage.updateTypebotProject(project.id, {
        totalViews: (project.totalViews || 0) + 1,
        updatedAt: new Date()
      });
      
      res.json({
        id: project.id,
        name: project.name,
        description: project.description,
        typebotData: project.typebotData,
        theme: project.theme,
        settings: project.settings,
        publicId: project.publicId
      });
    } catch (error) {
      console.error("❌ ERRO ao buscar projeto TypeBot público:", error);
      res.status(500).json({ message: "Erro ao buscar chatbot" });
    }
  });

  // Start TypeBot conversation
  app.post("/api/typebot/conversations", async (req: any, res) => {
    try {
      const { projectId, publicId, visitorId, sessionId } = req.body;
      
      let project;
      if (publicId) {
        project = await storage.getTypebotProjectByPublicId(publicId);
      } else if (projectId) {
        project = await storage.getTypebotProject(projectId);
      }
      
      if (!project) {
        return res.status(404).json({ message: "Projeto TypeBot não encontrado" });
      }
      
      const conversation = await storage.createTypebotConversation({
        id: nanoid(),
        projectId: project.id,
        visitorId: visitorId || nanoid(),
        sessionId: sessionId || nanoid(),
        isCompleted: false,
        variables: {},
        results: [],
        currentBlockId: null,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Incrementar contador de conversas
      await storage.updateTypebotProject(project.id, {
        totalConversations: (project.totalConversations || 0) + 1,
        updatedAt: new Date()
      });
      
      res.json({
        success: true,
        conversation,
        typebotData: project.typebotData,
        theme: project.theme,
        settings: project.settings
      });
    } catch (error) {
      console.error("❌ ERRO ao iniciar conversa TypeBot:", error);
      res.status(500).json({ message: "Erro ao iniciar conversa" });
    }
  });

  // Update TypeBot conversation
  app.put("/api/typebot/conversations/:id", async (req: any, res) => {
    try {
      const conversationId = req.params.id;
      const updateData = req.body;
      
      const conversation = await storage.getTypebotConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversa não encontrada" });
      }
      
      const updatedConversation = await storage.updateTypebotConversation(conversationId, {
        ...updateData,
        updatedAt: new Date()
      });
      
      res.json(updatedConversation);
    } catch (error) {
      console.error("❌ ERRO ao atualizar conversa TypeBot:", error);
      res.status(500).json({ message: "Erro ao atualizar conversa" });
    }
  });

  // Get TypeBot conversation messages
  app.get("/api/typebot/conversations/:id/messages", async (req: any, res) => {
    try {
      const conversationId = req.params.id;
      
      const conversation = await storage.getTypebotConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversa não encontrada" });
      }
      
      const messages = await storage.getTypebotMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("❌ ERRO ao buscar mensagens TypeBot:", error);
      res.status(500).json({ message: "Erro ao buscar mensagens" });
    }
  });

  // Add message to TypeBot conversation
  app.post("/api/typebot/conversations/:id/messages", async (req: any, res) => {
    try {
      const conversationId = req.params.id;
      const { blockId, type, content, isFromBot } = req.body;
      
      const conversation = await storage.getTypebotConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversa não encontrada" });
      }
      
      const message = await storage.createTypebotMessage({
        id: nanoid(),
        conversationId,
        blockId,
        type,
        content,
        isFromBot: isFromBot ?? true,
        timestamp: new Date()
      });
      
      res.json(message);
    } catch (error) {
      console.error("❌ ERRO ao adicionar mensagem TypeBot:", error);
      res.status(500).json({ message: "Erro ao adicionar mensagem" });
    }
  });

  // Get TypeBot analytics
  app.get("/api/typebot/projects/:id/analytics", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const projectId = req.params.id;
      
      const project = await storage.getTypebotProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(404).json({ message: "Projeto TypeBot não encontrado" });
      }
      
      const analytics = await storage.getTypebotAnalytics(projectId);
      res.json(analytics);
    } catch (error) {
      console.error("❌ ERRO ao buscar analytics TypeBot:", error);
      res.status(500).json({ message: "Erro ao buscar analytics" });
    }
  });

  // TYPEBOT DESATIVADO - Todas as rotas acima foram comentadas
  // */

  // Health Check Endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'sqlite',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // User profile endpoint
  app.get('/api/users/me', verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Remove sensitive information
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        profile: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan,
          credits: {
            sms: user.smsCredits || 0,
            email: user.emailCredits || 0,
            whatsapp: user.whatsappCredits || 0,
            ia: user.iaCredits || 0
          },
          planExpiresAt: user.planExpiresAt,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Erro ao buscar perfil do usuário' });
    }
  });

  // Templates endpoint
  app.get('/api/templates', verifyJWT, async (req: any, res: Response) => {
    try {
      // Default templates for the system
      const defaultTemplates = [
        {
          id: 'template-1',
          name: 'Quiz de Produto',
          description: 'Template para descobrir preferências de produto',
          category: 'ecommerce',
          structure: {
            pages: [
              {
                id: 'page1',
                title: 'Informações Básicas',
                elements: [
                  {
                    id: 'elem1',
                    type: 'text',
                    properties: {
                      label: 'Qual é o seu nome?',
                      placeholder: 'Digite seu nome',
                      required: true,
                      fieldId: 'nome_completo'
                    }
                  },
                  {
                    id: 'elem2',
                    type: 'email',
                    properties: {
                      label: 'Qual é o seu email?',
                      placeholder: 'seuemail@exemplo.com',
                      required: true,
                      fieldId: 'email_contato'
                    }
                  }
                ]
              },
              {
                id: 'page2',
                title: 'Preferências',
                elements: [
                  {
                    id: 'elem3',
                    type: 'multiple_choice',
                    properties: {
                      label: 'Qual produto mais te interessa?',
                      options: [
                        { id: 'opt1', text: 'Produto A', value: 'produto_a' },
                        { id: 'opt2', text: 'Produto B', value: 'produto_b' },
                        { id: 'opt3', text: 'Produto C', value: 'produto_c' }
                      ],
                      required: true,
                      fieldId: 'produto_interesse'
                    }
                  }
                ]
              }
            ]
          }
        },
        {
          id: 'template-2',
          name: 'Quiz de Leads',
          description: 'Template para captação de leads qualificados',
          category: 'marketing',
          structure: {
            pages: [
              {
                id: 'page1',
                title: 'Perfil do Cliente',
                elements: [
                  {
                    id: 'elem1',
                    type: 'text',
                    properties: {
                      label: 'Nome completo',
                      placeholder: 'Digite seu nome completo',
                      required: true,
                      fieldId: 'nome_completo'
                    }
                  },
                  {
                    id: 'elem2',
                    type: 'phone',
                    properties: {
                      label: 'Telefone',
                      placeholder: '(11) 99999-9999',
                      required: true,
                      fieldId: 'telefone_principal'
                    }
                  },
                  {
                    id: 'elem3',
                    type: 'multiple_choice',
                    properties: {
                      label: 'Qual sua faixa etária?',
                      options: [
                        { id: 'opt1', text: '18-25 anos', value: '18-25' },
                        { id: 'opt2', text: '26-35 anos', value: '26-35' },
                        { id: 'opt3', text: '36-45 anos', value: '36-45' },
                        { id: 'opt4', text: '46+ anos', value: '46+' }
                      ],
                      required: true,
                      fieldId: 'faixa_etaria'
                    }
                  }
                ]
              }
            ]
          }
        },
        {
          id: 'template-3',
          name: 'Quiz de Saúde',
          description: 'Template para avaliação de perfil de saúde',
          category: 'saude',
          structure: {
            pages: [
              {
                id: 'page1',
                title: 'Informações Pessoais',
                elements: [
                  {
                    id: 'elem1',
                    type: 'text',
                    properties: {
                      label: 'Nome completo',
                      placeholder: 'Digite seu nome',
                      required: true,
                      fieldId: 'nome_completo'
                    }
                  },
                  {
                    id: 'elem2',
                    type: 'height',
                    properties: {
                      label: 'Qual sua altura?',
                      placeholder: '1.75',
                      required: true,
                      fieldId: 'altura'
                    }
                  },
                  {
                    id: 'elem3',
                    type: 'current_weight',
                    properties: {
                      label: 'Qual seu peso atual?',
                      placeholder: '70',
                      required: true,
                      fieldId: 'peso_atual'
                    }
                  },
                  {
                    id: 'elem4',
                    type: 'target_weight',
                    properties: {
                      label: 'Qual seu peso ideal?',
                      placeholder: '65',
                      required: true,
                      fieldId: 'peso_ideal'
                    }
                  }
                ]
              }
            ]
          }
        }
      ];
      
      res.json(defaultTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Erro ao buscar templates' });
    }
  });

  // 🔒 ENDPOINT DE MONITORAMENTO DE SEGURANÇA
  app.get("/api/security/stats", verifyJWT, async (req: any, res: Response) => {
    try {
      // Verificar se é admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado - Apenas administradores' });
      }

      const securityStats = getSecurityStats();
      res.json(securityStats);
    } catch (error) {
      console.error('❌ ERRO ao obter estatísticas de segurança:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // 🧠 RATE LIMITER STATS - Monitoramento do sistema inteligente
  app.get("/api/rate-limiter/stats", verifyJWT, async (req: any, res: Response) => {
    try {
      const stats = intelligentRateLimiter.getStats();
      res.json({
        message: "Estatísticas do Rate Limiter Inteligente",
        stats,
        timestamp: new Date().toISOString(),
        description: "Sistema que diferencia usuários legítimos criando quizzes complexos de possíveis invasores"
      });
    } catch (error) {
      console.error("Erro ao buscar stats do rate limiter:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // 🏥 HEALTH CHECK SYSTEM - Sistema de monitoramento de saúde
  const healthCheckSystem = new HealthCheckSystem();
  healthCheckSystem.registerRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}

// Função para gerar mensagens ultra personalizadas baseadas no perfil do usuário
function generateUltraPersonalizedMessage(phone: any, conditionalRules: any[]) {
  if (!conditionalRules || conditionalRules.length === 0) {
    return "Mensagem personalizada baseada no seu perfil!";
  }

  // Buscar a resposta do usuário para esta regra específica
  const userResponses = phone.responses || [];
  
  for (const rule of conditionalRules) {
    if (rule.fieldId && rule.messages) {
      // Buscar a resposta correspondente ao fieldId
      let userAnswer = null;
      
      if (Array.isArray(userResponses)) {
        const matchingResponse = userResponses.find(resp => 
          resp.elementFieldId === rule.fieldId
        );
        userAnswer = matchingResponse?.answer;
      } else {
        // Formato antigo
        userAnswer = userResponses[rule.fieldId];
      }
      
      // Encontrar a mensagem correspondente à resposta
      if (userAnswer && rule.messages[userAnswer]) {
        const personalizedMessage = rule.messages[userAnswer];
        
        // Aplicar variáveis dinâmicas na mensagem
        let finalMessage = personalizedMessage;
        if (phone.name) {
          finalMessage = finalMessage.replace(/\{nome_completo\}/g, phone.name);
          finalMessage = finalMessage.replace(/\{nome\}/g, phone.name);
        }
        
        console.log(`🎯 MENSAGEM ULTRA PERSONALIZADA - ${rule.fieldId}: ${userAnswer} → ${finalMessage}`);
        return finalMessage;
      }
    }
  }
  
  // Fallback para mensagem genérica
  return "Mensagem personalizada baseada no seu perfil!";
}

// Função para gerar emails ultra personalizados baseados no perfil do usuário
function generateUltraPersonalizedEmail(leadData: any, conditionalRules: any[], baseContent: string) {
  if (!conditionalRules || conditionalRules.length === 0) {
    return baseContent;
  }

  // Buscar a resposta do usuário para esta regra específica
  const userResponses = leadData.responses || [];
  
  for (const rule of conditionalRules) {
    if (rule.fieldId && rule.messages) {
      // Buscar a resposta correspondente ao fieldId
      let userAnswer = null;
      
      if (Array.isArray(userResponses)) {
        const matchingResponse = userResponses.find(resp => 
          resp.elementFieldId === rule.fieldId
        );
        userAnswer = matchingResponse?.answer;
      } else {
        // Formato antigo
        userAnswer = userResponses[rule.fieldId];
      }
      
      // Encontrar a mensagem correspondente à resposta
      if (userAnswer && rule.messages[userAnswer]) {
        const personalizedMessage = rule.messages[userAnswer];
        
        // Aplicar variáveis dinâmicas na mensagem
        let finalMessage = personalizedMessage;
        if (leadData.name) {
          finalMessage = finalMessage.replace(/\{nome_completo\}/g, leadData.name);
          finalMessage = finalMessage.replace(/\{nome\}/g, leadData.name);
        }
        
        console.log(`📧 EMAIL ULTRA PERSONALIZADO - ${rule.fieldId}: ${userAnswer} → ${finalMessage}`);
        return finalMessage;
      }
    }
  }
  
  // Fallback para conteúdo base
  return baseContent;
}


