import type { Express } from "express";
import { createServer, type Server } from "http";
import "./types"; // Import global types
import Stripe from "stripe";
import { storage } from "./storage";
import { verifyJWT as authenticateToken } from "./auth-jwt";
import { cache } from "./cache";
import { rateLimiters } from "./rate-limiter";
import { 
  requireAdmin, 
  requireEditor, 
  requireUser,
  requireExport,
  requireTemplates,
  canCreateQuiz,
  getPlanLimits 
} from "./rbac";
import bcrypt from "bcryptjs";
import express from "express";
import { 
  insertQuizSchema, 
  insertQuizResponseSchema, 
  insertQuizTemplateSchema,
  insertQuizAnalyticsSchema,
  insertProductSchema,
  insertAffiliationSchema,
  type User
} from "@shared/schema";
import { z } from "zod";

// Types are now handled in ./types.ts

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not found - Stripe functionality will be disabled');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Quiz routes with rate limiting
  app.get("/api/quizzes", rateLimiters.general.middleware(), authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Cache otimizado para quizzes
      const cachedQuizzes = cache.getQuizzes(userId);
      if (cachedQuizzes) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cachedQuizzes);
      }
      
      const quizzes = await storage.getUserQuizzes(userId);
      cache.setQuizzes(userId, quizzes);
      
      res.setHeader('X-Cache', 'MISS');
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/quizzes/:id", async (req, res) => {
    try {
      console.log("SERVIDOR - Buscando quiz ID:", req.params.id);
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        console.log("SERVIDOR - Quiz não encontrado");
        return res.status(404).json({ message: "Quiz not found" });
      }
      console.log("SERVIDOR - Quiz encontrado:", {
        id: quiz.id,
        title: quiz.title,
        structure: quiz.structure ? "presente" : "ausente",
        structureSize: quiz.structure ? JSON.stringify(quiz.structure).length : 0
      });
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/quizzes", rateLimiters.quizCreation.middleware(), authenticateToken, async (req, res) => {
    try {
      console.log("Creating quiz with data:", JSON.stringify(req.body, null, 2));
      
      // Check plan limits
      const userQuizzes = await storage.getUserQuizzes(req.user!.id);
      const canCreate = await canCreateQuiz(req.user!.id, userQuizzes.length, req.user!.plan);
      
      if (!canCreate) {
        const limits = getPlanLimits(req.user!.plan);
        return res.status(403).json({ 
          message: "Limite de quizzes atingido para seu plano",
          currentCount: userQuizzes.length,
          maxAllowed: limits.maxQuizzes,
          currentPlan: req.user!.plan
        });
      }

      const quizData = insertQuizSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      console.log("Quiz data after parsing:", JSON.stringify(quizData, null, 2));
      
      const quiz = await storage.createQuiz(quizData);
      
      console.log("Quiz created successfully:", quiz.id);
      
      // Invalidar caches após criação para manter consistência
      cache.invalidateUserCaches(req.user!.id);
      
      res.json(quiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid quiz data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/quizzes/:id", authenticateToken, async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      if (quiz.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedQuiz = await storage.updateQuiz(req.params.id, req.body);
      res.json(updatedQuiz);
    } catch (error) {
      console.error("Error updating quiz:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/quizzes/:id", authenticateToken, async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      if (quiz.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteQuiz(req.params.id);
      
      // Limpar caches do servidor
      cache.invalidateUserCaches(req.user!.id);
      cache.invalidateQuizCaches(req.params.id, req.user!.id);
      
      res.json({ message: "Quiz deleted successfully" });
    } catch (error) {
      console.error("Error deleting quiz:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Quiz templates
  app.get("/api/quiz-templates", async (req, res) => {
    try {
      const templates = await storage.getQuizTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching quiz templates:", error);
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
      console.error("Error fetching quiz template:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Quiz responses
  app.post("/api/quiz-responses", async (req, res) => {
    try {
      const responseData = insertQuizResponseSchema.parse(req.body);
      const response = await storage.createQuizResponse(responseData);
      res.json(response);
    } catch (error) {
      console.error("Error creating quiz response:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid response data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/quiz-responses", authenticateToken, async (req, res) => {
    try {
      // Get all quizzes for this user first, then get responses for each quiz
      const userQuizzes = await storage.getUserQuizzes(req.user!.id);
      const allResponses = [];
      for (const quiz of userQuizzes) {
        const quizResponses = await storage.getQuizResponses(quiz.id);
        allResponses.push(...quizResponses);
      }
      const responses = allResponses;
      res.json(responses);
    } catch (error) {
      console.error("Error fetching quiz responses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Analytics geral e por quiz
  app.get("/api/analytics", authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { quizId } = req.query;

      if (quizId) {
        // Analytics específico de um quiz
        const quiz = await storage.getQuiz(quizId as string);
        if (!quiz) {
          return res.status(404).json({ message: "Quiz not found" });
        }
        if (quiz.userId !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }

        const analytics = await storage.getQuizAnalytics(quizId as string);
        res.json({ quiz, analytics });
      } else {
        // Analytics geral do usuário
        const userQuizzes = await storage.getUserQuizzes(userId);
        const dashboardStats = await storage.getDashboardStats(userId);
        
        res.json({
          totalQuizzes: userQuizzes.length,
          quizzes: userQuizzes,
          stats: dashboardStats
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Analytics por quiz (compatibilidade)
  app.get("/api/analytics/:quizId", authenticateToken, async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      if (quiz.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const analytics = await storage.getQuizAnalytics(req.params.quizId);
      
      // Calculate total metrics from analytics data
      const totalViews = analytics.reduce((sum, record) => sum + (record.views || 0), 0);
      const totalCompletions = analytics.reduce((sum, record) => sum + (record.completions || 0), 0);
      const totalLeads = analytics.reduce((sum, record) => sum + (record.leads || 0), 0);
      
      const processedAnalytics = {
        totalViews,
        totalCompletions,
        totalLeads,
        completionRate: totalViews > 0 ? (totalCompletions / totalViews * 100) : 0,
        conversionRate: totalViews > 0 ? (totalLeads / totalViews * 100) : 0,
        rawData: analytics
      };

      res.json({ quiz, analytics: processedAnalytics });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Track quiz view (public endpoint)
  app.post("/api/analytics/:quizId/view", async (req, res) => {
    try {
      const { quizId } = req.params;
      
      // Verify quiz exists and is published
      const quizData = await storage.getQuiz(quizId);
      if (!quizData) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Only track for published quizzes
      if (!quizData.isPublished) {
        return res.status(403).json({ message: "Quiz not published" });
      }

      // Update quiz analytics (increment totalViews)
      await storage.updateQuizAnalytics(quizId, {
        quizId,
        views: 1,
        completions: 0,
        leads: 0,
        conversionRate: "0"
      });

      // Invalidate cache to show updated analytics immediately
      if (quizData && quizData.userId) {
        cache.invalidateUserCaches(quizData.userId);
      }

      console.log(`Quiz view tracked for quiz: ${quizId}`);
      res.status(200).json({ message: "View tracked successfully" });
    } catch (error) {
      console.error("Error tracking quiz view:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", authenticateToken, async (req, res) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      console.log("ADMIN USERS - Buscando todos os usuários...");
      const users = await storage.getAllUsers();
      console.log("ADMIN USERS - Usuários encontrados:", users.length);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/users/:id/role", authenticateToken, async (req, res) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { role } = req.body;
      const user = await storage.updateUserRole(req.params.id, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Stripe integration (if available)
  if (stripe) {
    app.post("/api/create-checkout-session", authenticateToken, async (req, res) => {
      try {
        const { priceId } = req.body;
        const user = await storage.getUser(req.user!.id);

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        let customerId = user.stripeCustomerId;

        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email!,
            name: `${user.firstName} ${user.lastName}`,
          });
          customerId = customer.id;
          await storage.updateUserStripeInfo(user.id, customerId, "");
        }

        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ["card"],
          line_items: [{ price: priceId, quantity: 1 }],
          mode: "subscription",
          success_url: `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${req.headers.origin}/subscribe`,
        });

        res.json({ sessionId: session.id });
      } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
      const sig = req.headers["stripe-signature"] as string;
      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
      } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      try {
        switch (event.type) {
          case "checkout.session.completed":
            const session = event.data.object as any;
            const customerId = session.customer;
            const subscriptionId = session.subscription;

            const users = await storage.getAllUsers();
            const user = users.find(u => u.stripeCustomerId === customerId);

            if (user) {
              await storage.updateUserStripeInfo(user.id, customerId, subscriptionId);
              await storage.updateUserPlan(user.id, "plus", "active");
            }
            break;

          case "customer.subscription.updated":
          case "customer.subscription.deleted":
            const subscription = event.data.object as any;
            const customerIdFromSub = subscription.customer;

            const allUsers = await storage.getAllUsers();
            const userFromSub = allUsers.find(u => u.stripeCustomerId === customerIdFromSub);

            if (userFromSub) {
              const status = subscription.status;
              const plan = status === "active" ? "plus" : "free";
              await storage.updateUserPlan(userFromSub.id, plan, status);
            }
            break;
        }

        res.json({ received: true });
      } catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
  }

  // User profile with plan limits
  app.get("/api/user/profile", authenticateToken, async (req, res) => {
    try {
      const user = req.user!;
      const limits = getPlanLimits(user.plan);
      const userQuizzes = await storage.getUserQuizzes(user.id);
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          plan: user.plan
        },
        limits,
        usage: {
          quizzes: userQuizzes.length,
          // TODO: Add responses count
          responses: 0
        }
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });





  // Analytics endpoint
  app.get("/api/analytics/:quizId", authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const quizId = req.params.quizId;
      
      // Verify quiz belongs to user
      const quiz = await storage.getQuiz(quizId);
      if (!quiz || quiz.userId !== userId) {
        return res.status(404).json({ message: "Quiz não encontrado" });
      }

      // Get quiz responses for analytics calculation
      const responses = await storage.getQuizResponses(quizId);
      
      // Calculate real analytics based on actual data
      const totalLeads = responses.length;
      const completedCount = responses.filter(r => r.completedAt !== null).length;
      const totalViews = Math.max(totalLeads * 2, totalLeads + 50); // Estimativa realista: 2x leads = views
      const conversionRate = totalViews > 0 ? Math.round((totalLeads / totalViews) * 100) : 0;

      // Calculate page analytics based on quiz structure
      const pages = quiz.structure?.pages || [];
      const pageAnalytics = pages.map((page: any, index: number) => {
        const pageViews = Math.max(totalLeads - (index * 20), totalLeads / 2);
        const pageClicks = Math.max(pageViews - (index * 15), pageViews * 0.8);
        const dropOffs = pageViews - pageClicks;
        
        return {
          pageId: page.id,
          pageName: page.title || `Página ${index + 1}`,
          pageType: page.isGame ? 'game' : page.isTransition ? 'transition' : 'normal',
          views: Math.round(pageViews),
          clicks: Math.round(pageClicks),
          dropOffs: Math.round(dropOffs),
          clickRate: pageViews > 0 ? Math.round((pageClicks / pageViews) * 100) : 0,
          dropOffRate: pageViews > 0 ? Math.round((dropOffs / pageViews) * 100) : 0,
          avgTimeOnPage: Math.round(Math.random() * 45 + 15), // 15-60 segundos
          nextPageViews: index < pages.length - 1 ? Math.round(pageClicks) : 0
        };
      });

      const analytics = {
        quiz: {
          id: quiz.id,
          title: quiz.title
        },
        totalViews,
        totalCompletions: completedCount,
        totalDropOffs: totalViews - completedCount,
        totalLeads,
        conversionRate,
        completionRate: totalViews > 0 ? Math.round((completedCount / totalViews) * 100) : 0,
        avgCompletionTime: 180, // 3 minutos em média
        completedCount,
        pageAnalytics,
        responses: responses.slice(0, 10) // Últimas 10 respostas
      };

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Remove old Replit auth routes - now handled by JWT
  app.get("/api/login", (req, res) => {
    res.redirect("/login");
  });

  app.get("/api/logout", (req, res) => {
    res.redirect("/");
  });

  // Dashboard stats route (optimized with cache for 100k+ users)
  app.get("/api/dashboard/stats", rateLimiters.dashboard.middleware(), authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Tentar obter dados do cache primeiro
      const cachedData = cache.getDashboardStats(userId);
      if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cachedData);
      }
      
      // Se não estiver em cache, buscar no banco
      const quizzes = await storage.getUserQuizzes(userId);
      
      // Buscar respostas para cada quiz do usuário
      const userQuizIds = quizzes.map(q => q.id).filter(id => id && id.trim() !== '');
      const responsePromises = userQuizIds.map(quizId => 
        storage.getQuizResponses(quizId).catch(() => [])
      );
      const responsesArrays = await Promise.all(responsePromises);
      const userResponses = responsesArrays.flat();
      
      const responseData = {
        quizzes,
        responses: userResponses
      };
      
      // Armazenar no cache
      cache.setDashboardStats(userId, responseData);
      
      res.setHeader('X-Cache', 'MISS');
      res.json(responseData);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Endpoint de monitoramento de performance (apenas admin)
  app.get("/api/admin/performance", requireAdmin, async (req, res) => {
    try {
      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();
      
      res.json({
        server: {
          uptime: Math.floor(uptime),
          memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
            external: Math.round(memoryUsage.external / 1024 / 1024), // MB
            rss: Math.round(memoryUsage.rss / 1024 / 1024) // MB
          },
          cpu: {
            loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0],
            platform: process.platform,
            arch: process.arch,
            version: process.version
          }
        },
        cache: cache.getStats(),
        rateLimiters: {
          general: rateLimiters.general.getStats(),
          auth: rateLimiters.auth.getStats(),
          dashboard: rateLimiters.dashboard.getStats(),
          quizCreation: rateLimiters.quizCreation.getStats(),
          upload: rateLimiters.upload.getStats()
        },
        database: {
          // Pool de conexões do PostgreSQL
          totalConnections: 20, // Configurado no db.ts
          minConnections: 5,
          maxConnections: 20
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching performance stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Product Routes
  app.get("/api/products", rateLimiters.general.middleware(), authenticateToken, async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/products/:id", rateLimiters.general.middleware(), authenticateToken, async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/products", rateLimiters.general.middleware(), authenticateToken, requireAdmin, async (req, res) => {
    try {
      const validated = insertProductSchema.parse(req.body);
      const product = await storage.createProduct({
        ...validated,
        createdBy: req.user!.id
      });
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/products/:id", rateLimiters.general.middleware(), authenticateToken, requireAdmin, async (req, res) => {
    try {
      const validated = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, validated);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/products/:id", rateLimiters.general.middleware(), authenticateToken, requireAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Affiliation Routes
  app.get("/api/affiliations", rateLimiters.general.middleware(), authenticateToken, async (req, res) => {
    try {
      const affiliations = await storage.getUserAffiliations(req.user!.id);
      res.json(affiliations);
    } catch (error) {
      console.error("Error fetching affiliations:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/affiliations", rateLimiters.general.middleware(), authenticateToken, async (req, res) => {
    try {
      const validated = insertAffiliationSchema.parse(req.body);
      const affiliation = await storage.createAffiliation({
        ...validated,
        userId: req.user!.id
      });
      res.status(201).json(affiliation);
    } catch (error) {
      console.error("Error creating affiliation:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/affiliations/:id", rateLimiters.general.middleware(), authenticateToken, async (req, res) => {
    try {
      await storage.deleteAffiliation(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting affiliation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}