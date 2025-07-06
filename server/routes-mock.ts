import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-sqlite";
import { cache } from "./cache";
import { nanoid } from "nanoid";
import { insertQuizSchema, insertQuizResponseSchema } from "../shared/schema-sqlite";

// Mock JWT - Always returns the admin user for ANY valid token format
const mockUser = {
  id: "7fK49CWfbjBvVpgH59vm2",
  email: "admin@vendzz.com",
  password: "$2b$10$9lEIm9VESliDd8oWxnj3rOAtUJyD4Ze/Luwxko5bcrcMFBTZme9tC",
  firstName: "Admin",
  lastName: "Vendzz",
  profileImageUrl: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  plan: "enterprise",
  role: "admin",
  refreshToken: "mock_refresh_token",
  subscriptionStatus: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

export function registerMockRoutes(app: Express): Server {
  // Public routes - NO authentication required
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

  app.post("/api/analytics/:quizId/view", async (req, res) => {
    try {
      const { quizId } = req.params;
      const quizData = await storage.getQuiz(quizId);
      if (!quizData) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      if (!quizData.isPublished) {
        return res.status(403).json({ message: "Quiz not published" });
      }
      res.json({ success: true, message: "View tracked" });
    } catch (error) {
      console.error("Error tracking quiz view:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Auth routes - COMPLETELY BYPASS ALL AUTH - Always return success
  app.post("/api/auth/login", async (req, res) => {
    console.log("🔓 MOCK LOGIN - Always success");
    res.json({
      message: "Login successful",
      user: mockUser,
      accessToken: "mock_access_token_" + Date.now(),
      refreshToken: "mock_refresh_token_" + Date.now()
    });
  });

  app.post("/api/auth/register", async (req, res) => {
    console.log("🔓 MOCK REGISTER - Always success");
    res.json({
      message: "Registration successful", 
      user: mockUser,
      accessToken: "mock_access_token_" + Date.now(),
      refreshToken: "mock_refresh_token_" + Date.now()
    });
  });

  app.get("/api/auth/verify", async (req, res) => {
    console.log("🔓 MOCK VERIFY - Always return user");
    res.json({ user: mockUser });
  });

  app.post("/api/auth/refresh", async (req, res) => {
    console.log("🔓 MOCK REFRESH - Always return new tokens");
    res.json({
      accessToken: "mock_access_token_" + Date.now(),
      refreshToken: "mock_refresh_token_" + Date.now()
    });
  });

  app.post("/api/auth/logout", async (req, res) => {
    console.log("🔓 MOCK LOGOUT - Always success");
    res.json({ message: "Logout successful" });
  });

  // Dashboard Stats - COMPLETELY NO AUTH - Always works
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      console.log("📊 MOCK DASHBOARD - No auth required");
      const userId = mockUser.id;
      
      // Check cache first
      const cachedStats = cache.getDashboardStats(userId);
      if (cachedStats) {
        return res.json(cachedStats);
      }

      const stats = await storage.getDashboardStats(userId);
      const quizzes = await storage.getUserQuizzes(userId);
      
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

      // Save to cache
      cache.setDashboardStats(userId, dashboardData);
      res.json(dashboardData);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user quizzes - COMPLETELY NO AUTH - Always works
  app.get("/api/quizzes", async (req, res) => {
    try {
      console.log("📝 MOCK QUIZZES - No auth required");
      const userId = mockUser.id;
      
      // Check cache first
      const cachedQuizzes = cache.getQuizzes(userId);
      if (cachedQuizzes) {
        return res.json(cachedQuizzes);
      }

      const quizzes = await storage.getUserQuizzes(userId);
      
      // Save to cache
      cache.setQuizzes(userId, quizzes);
      res.json(quizzes);
    } catch (error) {
      console.error("Get quizzes error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get specific quiz - Always works with mock user
  app.get("/api/quizzes/:id", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Always allow access since we're using mock user
      res.json(quiz);
    } catch (error) {
      console.error("Get quiz error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create quiz - COMPLETELY NO AUTH - Always works
  app.post("/api/quizzes", async (req, res) => {
    try {
      console.log("✨ MOCK CREATE QUIZ - No auth required");
      const userId = mockUser.id;

      // Validate quiz data
      const quizData = insertQuizSchema.parse({
        ...req.body,
        userId: userId,
      });

      const quiz = await storage.createQuiz(quizData);
      
      // Invalidate cache
      cache.invalidateUserCaches(userId);
      
      res.status(201).json(quiz);
    } catch (error) {
      console.error("Create quiz error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update quiz - Always works with mock user
  app.put("/api/quizzes/:id", async (req, res) => {
    try {
      const userId = mockUser.id;
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Allow access with mock user
      const updatedQuiz = await storage.updateQuiz(req.params.id, req.body);
      
      // Invalidate cache
      cache.invalidateUserCaches(userId);
      cache.invalidateQuizCaches(req.params.id, userId);
      
      res.json(updatedQuiz);
    } catch (error) {
      console.error("Update quiz error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete quiz - Always works with mock user
  app.delete("/api/quizzes/:id", async (req, res) => {
    try {
      console.log("🗑️ DELETE QUIZ - Starting deletion for ID:", req.params.id);
      const userId = mockUser.id;
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz) {
        console.log("❌ DELETE QUIZ - Quiz not found:", req.params.id);
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Allow access with mock user
      console.log("🗑️ DELETE QUIZ - Deleting from storage...");
      await storage.deleteQuiz(req.params.id);
      
      // Invalidate cache
      console.log("🔄 CACHE INVALIDATION - Clearing caches for userId:", userId, "quizId:", req.params.id);
      cache.invalidateUserCaches(userId);
      cache.invalidateQuizCaches(req.params.id, userId);
      console.log("✅ CACHE INVALIDATION - Completed");
      
      console.log("✅ DELETE QUIZ - Successfully deleted:", req.params.id);
      res.json({ message: "Quiz deleted successfully" });
    } catch (error) {
      console.error("❌ Delete quiz error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin routes - Always work with mock admin user
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/users/:id/role", async (req, res) => {
    try {
      const { role } = req.body;
      const user = await storage.updateUserRole(req.params.id, role);
      res.json(user);
    } catch (error) {
      console.error("Update user role error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Quiz responses
  app.get("/api/quizzes/:id/responses", async (req, res) => {
    try {
      const responses = await storage.getQuizResponses(req.params.id);
      res.json(responses);
    } catch (error) {
      console.error("Get quiz responses error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/quizzes/:id/responses", async (req, res) => {
    try {
      const responseData = insertQuizResponseSchema.parse({
        ...req.body,
        quizId: req.params.id,
      });

      const response = await storage.createQuizResponse(responseData);
      res.status(201).json(response);
    } catch (error) {
      console.error("Create quiz response error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Quiz templates
  app.get("/api/quiz-templates", async (req, res) => {
    try {
      const templates = await storage.getQuizTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Get quiz templates error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/quiz-templates/:id", async (req, res) => {
    try {
      const template = await storage.getQuizTemplate(parseInt(req.params.id));
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      res.json(template);
    } catch (error) {
      console.error("Get quiz template error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Analytics
  app.get("/api/analytics/:quizId", async (req, res) => {
    try {
      const analytics = await storage.getQuizAnalytics(req.params.quizId);
      res.json(analytics);
    } catch (error) {
      console.error("Get quiz analytics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}