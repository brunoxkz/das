import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-sqlite";
import { cache } from "./cache";
import { nanoid } from "nanoid";
import { insertQuizSchema, insertQuizResponseSchema } from "../shared/schema-sqlite";
import { verifyJWT } from "./auth-sqlite";

export function registerSQLiteRoutes(app: Express): Server {
  // Public routes BEFORE any middleware or authentication
  // Public quiz viewing (without auth)
  app.get("/api/quiz/:id/public", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz || !quiz.isPublished) {
        return res.status(404).json({ error: 'Quiz não encontrado ou não publicado' });
      }
      res.json(quiz);
    } catch (error) {
      console.error("Get public quiz error:", error);
      res.status(500).json({ error: 'Erro ao buscar quiz público' });
    }
  });

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

  // Dashboard Stats
  app.get("/api/dashboard/stats", async (req: any, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Verificar cache primeiro
      const cacheKey = `dashboard-${req.user.id}`;
      const cachedStats = cache.getDashboardStats(cacheKey);
      if (cachedStats) {
        return res.json(cachedStats);
      }

      const stats = await storage.getDashboardStats(req.user.id);
      
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
  });

  // Get user quizzes
  app.get("/api/quizzes", async (req: any, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

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
  app.get("/api/quizzes/:id", async (req: any, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Check if user owns this quiz or if it's published
      if (quiz.userId !== req.user?.id && !quiz.isPublished) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(quiz);
    } catch (error) {
      console.error("Get quiz error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create quiz
  app.post("/api/quizzes", async (req: any, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Validar dados do quiz
      const quizData = insertQuizSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const quiz = await storage.createQuiz(quizData);

      // Invalidar caches relevantes
      cache.invalidateUserCaches(req.user.id);
      
      res.status(201).json(quiz);
    } catch (error) {
      console.error("Create quiz error:", error);
      res.status(500).json({ message: "Failed to create quiz" });
    }
  });

  // Update quiz
  app.put("/api/quizzes/:id", async (req: any, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const existingQuiz = await storage.getQuiz(req.params.id);
      
      if (!existingQuiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      if (existingQuiz.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedQuiz = await storage.updateQuiz(req.params.id, req.body);

      // Invalidar caches relevantes
      cache.invalidateUserCaches(req.user.id);
      cache.invalidateQuizCaches(req.params.id, req.user.id);
      
      res.json(updatedQuiz);
    } catch (error) {
      console.error("Update quiz error:", error);
      res.status(500).json({ message: "Failed to update quiz" });
    }
  });

  // Delete quiz
  app.delete("/api/quizzes/:id", async (req: any, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

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

  // Get quiz responses
  app.get("/api/quizzes/:id/responses", async (req: any, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz || quiz.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Verificar cache primeiro
      const cacheKey = `responses-${req.params.id}`;
      const cachedResponses = cache.getResponses(cacheKey);
      if (cachedResponses) {
        return res.json(cachedResponses);
      }

      const responses = await storage.getQuizResponses(req.params.id);
      
      // Salvar no cache
      cache.setResponses(cacheKey, responses);
      
      res.json(responses);
    } catch (error) {
      console.error("Get responses error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Submit quiz response (public endpoint)
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

  // Analytics endpoint
  app.get("/api/analytics/:quizId", async (req: any, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const quiz = await storage.getQuiz(req.params.quizId);
      
      if (!quiz || quiz.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const analytics = await storage.getQuizAnalytics(req.params.quizId);
      res.json(analytics);
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Track quiz view (public endpoint)
  app.post("/api/analytics/:quizId/view", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.quizId);
      
      if (!quiz || !quiz.isPublished) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      const today = new Date().toISOString().split('T')[0];
      
      await storage.updateQuizAnalytics(req.params.quizId, {
        date: today,
        views: 1,
        completions: 0,
        conversionRate: 0,
      });

      // Invalidar cache relevante
      cache.invalidateUserCaches(quiz.userId);
      
      res.json({ message: "View tracked" });
    } catch (error) {
      console.error("Track view error:", error);
      res.status(500).json({ message: "Failed to track view" });
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

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      database: "sqlite",
      cache: cache.getStats()
    });
  });



  const httpServer = createServer(app);
  return httpServer;
}