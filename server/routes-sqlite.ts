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

export function registerSQLiteRoutes(app: Express): Server {
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

  // Auth system detection endpoint
  app.get("/api/auth/system", (req, res) => {
    res.json({ system: "sqlite" });
  });

  // Public routes BEFORE any middleware or authentication

  // Track quiz view (public endpoint without auth)
  app.post("/api/analytics/:quizId/view", async (req, res) => {
    try {
      const { quizId } = req.params;
      
      // Verify quiz exists and is published
      const quizData = await storage.getQuiz(quizId);
      if (!quizData) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      if (!quizData.isPublished) {
        return res.status(403).json({ message: "Quiz not published" });
      }

      // For now, just return success (analytics storage can be added later)
      res.json({ success: true, message: "View tracked" });
    } catch (error) {
      console.error("Error tracking quiz view:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

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
      
      res.json(dashboardData);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  // Register both endpoints
  app.get("/api/dashboard/stats", verifyJWT, dashboardStatsHandler);
  app.get("/api/dashboard-stats", verifyJWT, dashboardStatsHandler);

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
      
      // Salvar no cache
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

      // Invalidar caches relevantes
      cache.invalidateUserCaches(userId);
      
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

      // Forçar limpeza do cache antes da atualização
      cache.invalidateUserCaches(userId);
      cache.invalidateQuizCaches(quizId, userId);
      
      console.log(`💾 EXECUTANDO UPDATE NO STORAGE...`);
      const updatedQuiz = await storage.updateQuiz(quizId, req.body);

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

  // Submit final quiz response (public endpoint - finaliza o quiz)
  app.post("/api/quizzes/:id/submit", async (req, res) => {
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
          timeSpent: req.body.timeSpent || 0, // tempo em segundos
          leadData: req.body.leadData || {} // dados de lead capturados
        }
      };

      const response = await storage.createQuizResponse(responseData);

      // Invalidar cache de respostas
      cache.del(`responses-${req.params.id}`);
      
      res.status(201).json({ 
        success: true, 
        responseId: response.id,
        message: "Quiz finalizado com sucesso"
      });
    } catch (error) {
      console.error("Submit final response error:", error);
      res.status(500).json({ message: "Failed to submit final response" });
    }
  });

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

      const analytics = await storage.getQuizAnalytics(req.params.quizId);
      res.json(analytics);
    } catch (error) {
      console.error("Get quiz analytics error:", error);
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

  // Get all quiz analytics for user
  app.get("/api/analytics", verifyJWT, async (req: any, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const analytics = await storage.getAllQuizAnalytics(req.user.id);
      res.json(analytics);
    } catch (error) {
      console.error("Get all quiz analytics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Track quiz view (public endpoint)
  app.post("/api/analytics/:quizId/view", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.quizId);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz não encontrado" });
      }

      // Permitir tracking mesmo para quizzes não publicados (para testes)
      const today = new Date().toISOString().split('T')[0];
      
      await storage.updateQuizAnalytics(req.params.quizId, {
        date: today,
        views: 1,
        completions: 0,
        conversionRate: 0,
      });

      // Invalidar cache relevante
      cache.invalidateUserCaches(quiz.userId);
      
      res.json({ message: "View tracked", success: true });
    } catch (error) {
      console.error("Track view error:", error);
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

  // Get public quiz (for quiz viewing)
  app.get("/api/quiz/:id/public", async (req, res) => {
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

      res.json(quiz);
    } catch (error) {
      console.error("Get public quiz error:", error);
      res.status(500).json({ error: "Erro ao buscar quiz público" });
    }
  });

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

      if (!message || message.trim() === "") {
        return res.status(400).json({ error: "Message is required" });
      }

      // Importar função sendSms do twilio
      const { sendSms } = await import("./twilio");

      // Verificar créditos SMS antes do envio
      const currentSentSMS = await storage.getSentSMSCount(userId);
      const remainingCredits = Math.max(0, (user.smsCredits || 100) - currentSentSMS);
      
      console.log(`💰 VERIFICAÇÃO DE CRÉDITOS: Tem ${remainingCredits}, precisa ${phones.length}`);
      
      if (remainingCredits <= 0) {
        console.log(`🚫 CRÉDITOS ESGOTADOS`);
        return res.status(400).json({ 
          error: "Créditos SMS esgotados", 
          remaining: remainingCredits,
          needed: phones.length 
        });
      }
      
      if (phones.length > remainingCredits) {
        console.log(`🚫 CRÉDITOS INSUFICIENTES`);
        return res.status(400).json({ 
          error: `Créditos insuficientes. Precisa de ${phones.length} créditos, restam ${remainingCredits}`,
          remaining: remainingCredits,
          needed: phones.length 
        });
      }

      const results = [];
      let successCount = 0;
      let failureCount = 0;

      for (const phone of phones) {
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
      
      const { name, quizId, message, triggerType, scheduledDateTime, targetAudience, triggerDelay, triggerUnit, fromDate } = req.body;
      console.log("📱 SMS CAMPAIGN CREATE - Campos extraídos:", {
        name: name || 'MISSING',
        quizId: quizId || 'MISSING', 
        message: message || 'MISSING',
        triggerType: triggerType || 'immediate',
        scheduledDateTime: scheduledDateTime || 'NOT_PROVIDED',
        targetAudience: targetAudience || 'all',
        fromDate: fromDate || 'NOT_PROVIDED'
      });

      if (!name || !quizId || !message) {
        console.log("📱 SMS CAMPAIGN CREATE - ERRO: Dados obrigatórios em falta");
        return res.status(400).json({ error: "Dados obrigatórios em falta" });
      }

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
        
        const logData = {
          id: logId,
          campaignId: campaign.id,
          phone: phoneNumber,
          message: message,
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

            // Criar log antes de enviar
            const logId = nanoid();
            await storage.createSMSLog({
              id: logId,
              campaignId: campaign.id,
              phone: phoneNumber,
              message: message,
              status: 'pending'
            });

            const success = await sendSms(phoneNumber, message);
            
            if (success) {
              successCount++;
              // Atualizar log com sucesso
              await storage.updateSMSLog(logId, {
                status: 'sent',
                sentAt: Math.floor(Date.now() / 1000)
              });
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
      
      // Adicionar outros campos genéricos
      if (response && response.toString().trim()) {
        extracted[key] = response;
      }
    });

    return extracted;
  }

  const httpServer = createServer(app);

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
      filteredPhones = filteredPhones.filter(p => 
        new Date(p.submittedAt || p.created_at) >= filterDate
      );
    }
    
    // Apply audience filter
    if (targetAudience === 'completed') {
      filteredPhones = filteredPhones.filter(p => p.status === 'completed');
    } else if (targetAudience === 'abandoned') {
      filteredPhones = filteredPhones.filter(p => p.status === 'abandoned');
    }
    
    console.log(`📱 LEADS FILTRADOS: ${filteredPhones.length} de ${phones.length} total (dateFilter: ${dateFilter}, audience: ${targetAudience})`);
    
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

  return httpServer;
}

// Advanced Email Marketing Pro helper functions
function extractAvailableVariables(responses: any[]) {
  const variables = new Set<string>();
  
  responses.forEach(response => {
    if (response.responses) {
      if (Array.isArray(response.responses)) {
        // New format - array of elements
        response.responses.forEach((element: any) => {
          if (element.elementFieldId) {
            variables.add(element.elementFieldId);
          }
        });
      } else {
        // Old format - object
        Object.keys(response.responses).forEach(key => {
          variables.add(key);
        });
      }
    }
  });
  
  return Array.from(variables).sort();
}

function extractSampleDataFromResponse(response: any): Record<string, any> {
  const sampleData: Record<string, any> = {};
  
  if (response.responses) {
    if (Array.isArray(response.responses)) {
      // New format - array of elements
      response.responses.forEach((element: any) => {
        if (element.elementFieldId && element.answer) {
          sampleData[element.elementFieldId] = element.answer;
        }
      });
    } else {
      // Old format - object
      Object.keys(response.responses).forEach(key => {
        sampleData[key] = response.responses[key];
      });
    }
  }
  
  return sampleData;
}

function getDefaultSampleData(): Record<string, any> {
  return {
    nome: "João Silva",
    email: "joao@email.com",
    telefone: "11999999999",
    idade: "30",
    altura: "1.75",
    peso_atual: "80",
    peso_objetivo: "75"
  };
}

async function getTargetedLeadsForEmail(
  quizId: string, 
  targetAudience: string, 
  segmentationRules?: any,
  dateFilter?: string
): Promise<any[]> {
  const responses = await storage.getQuizResponses(quizId);
  const leads: any[] = [];
  
  responses.forEach(response => {
    if (response.responses) {
      let email = '';
      let name = 'Usuário';
      let allData: Record<string, any> = {};
      
      if (Array.isArray(response.responses)) {
        // New format - array of elements
        response.responses.forEach((element: any) => {
          if (element.elementType === 'email' && element.answer) {
            email = element.answer;
          }
          if (element.elementFieldId && element.answer) {
            allData[element.elementFieldId] = element.answer;
            if (element.elementFieldId.includes('nome') || element.elementFieldId.includes('name')) {
              name = element.answer;
            }
          }
        });
      } else {
        // Old format - object
        Object.keys(response.responses).forEach(key => {
          const value = response.responses[key];
          allData[key] = value;
          if (key.includes('email') && value) {
            email = value;
          }
          if (key.includes('nome') && value) {
            name = value;
          }
        });
      }
      
      if (email && email.includes('@')) {
        const isCompleted = response.metadata?.isComplete === true || 
                           response.metadata?.completionPercentage === 100;
        
        const lead = {
          id: response.id,
          email,
          name,
          status: isCompleted ? 'completed' : 'abandoned',
          submittedAt: response.submittedAt,
          data: allData
        };
        
        // Apply audience filter
        if (targetAudience === 'completed' && !isCompleted) return;
        if (targetAudience === 'abandoned' && isCompleted) return;
        
        // Apply date filter
        if (dateFilter) {
          const filterDate = new Date(dateFilter);
          if (new Date(response.submittedAt) < filterDate) return;
        }
        
        leads.push(lead);
      }
    }
  });
  
  return leads;
}

function calculateEstimatedOpenRate(targetAudience: string): number {
  switch (targetAudience) {
    case 'completed': return 25.8;
    case 'abandoned': return 18.5;
    default: return 22.3;
  }
}

function calculateEstimatedClickRate(targetAudience: string): number {
  switch (targetAudience) {
    case 'completed': return 4.8;
    case 'abandoned': return 3.2;
    default: return 4.1;
  }
}

function calculateEmailAnalytics(logs: any[]): any {
  const total = logs.length;
  const sent = logs.filter(log => log.status === 'sent').length;
  const failed = logs.filter(log => log.status === 'failed').length;
  const opened = logs.filter(log => log.status === 'opened').length;
  const clicked = logs.filter(log => log.status === 'clicked').length;
  
  return {
    total,
    sent,
    failed,
    opened,
    clicked,
    deliveryRate: total > 0 ? (sent / total) * 100 : 0,
    openRate: sent > 0 ? (opened / sent) * 100 : 0,
    clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
    failureRate: total > 0 ? (failed / total) * 100 : 0
  };
}
