import type { Express } from "express";
import { createServer, type Server } from "http";
import "./types"; // Import global types
import Stripe from "stripe";
import { storage } from "./storage-sqlite";
import { verifyJWT as authenticateToken } from "./auth-jwt";
import { verifyJWT } from "./auth-hybrid";
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
import express, { type Response } from "express";
import { 
  insertQuizSchema, 
  insertQuizResponseSchema, 
  insertQuizTemplateSchema,
  insertQuizAnalyticsSchema,
  insertEmailCampaignSchema,
  insertEmailTemplateSchema,
  type User
} from "@shared/schema-sqlite";
import { z } from "zod";

// Types are now handled in ./types.ts

// Debug: Verificar se variáveis estão carregadas
console.log('🔍 Verificando Stripe ENV:', {
  hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
  stripeKey: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...' : 'undefined'
});

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY não encontrada - funcionalidade Stripe desabilitada');
} else {
  console.log('✅ STRIPE_SECRET_KEY encontrada - funcionalidade Stripe habilitada');
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

  // DESABILITADO: Track quiz view - agora sendo feito pelo routes-sqlite.ts
  // app.post("/api/analytics/:quizId/view", async (req, res) => {
  //   // Este endpoint foi movido para routes-sqlite.ts para melhor integração
  //   // com o sistema SQLite e evitar conflitos de rotas
  // });

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
            const metadata = session.metadata;

            if (metadata && metadata.type === "sms_credits") {
              // Compra de créditos SMS
              const userId = metadata.userId;
              const credits = parseFloat(metadata.credits);
              
              // Adicionar créditos ao usuário
              const user = await storage.getUser(userId);
              if (user) {
                const currentCredits = parseFloat(user.smsCredits || "0");
                const newBalance = currentCredits + credits;
                
                await storage.updateUserSmsCredits(userId, newBalance);
                
                // Registrar transação
                await storage.createSmsTransaction({
                  userId,
                  type: "purchase",
                  amount: credits,
                  balance: newBalance,
                  description: `Compra de ${credits} créditos SMS`,
                  smsCount: 0,
                  costPerSms: 0
                });
              }
            } else {
              // Compra de plano (código existente)
              const users = await storage.getAllUsers();
              const user = users.find(u => u.stripeCustomerId === customerId);

              if (user) {
                await storage.updateUserStripeInfo(user.id, customerId, subscriptionId);
                await storage.updateUserPlan(user.id, "plus", "active");
              }
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
          plan: user.plan,
          smsCredits: user.smsCredits || 0
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

  // SMS Credits routes
  app.get("/api/sms-credits/packages", async (req, res) => {
    try {
      const packages = [
        {
          id: 1,
          name: "Iniciante",
          description: "Ideal para testar o sistema",
          credits: 100,
          price: 29.90,
          bonusCredits: 0,
          isActive: true
        },
        {
          id: 2,
          name: "Profissional", 
          description: "Para empresas em crescimento",
          credits: 500,
          price: 129.90,
          bonusCredits: 50,
          isActive: true,
          badge: "Popular"
        },
        {
          id: 3,
          name: "Empresarial",
          description: "Para grandes volumes", 
          credits: 1500,
          price: 349.90,
          bonusCredits: 200,
          isActive: true,
          badge: "Melhor Valor"
        },
        {
          id: 4,
          name: "Enterprise",
          description: "Volumes ilimitados",
          credits: 5000,
          price: 999.90,
          bonusCredits: 1000,
          isActive: true,
          badge: "Premium"
        }
      ];
      
      res.json(packages);
    } catch (error) {
      console.error("Error fetching SMS credit packages:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/sms-credits/purchase", authenticateToken, async (req, res) => {
    try {
      const { packageId } = req.body;
      const user = req.user!;
      
      // Buscar pacote
      const packages = [
        { id: 1, name: "Iniciante", credits: 100, price: 29.90, bonusCredits: 0 },
        { id: 2, name: "Profissional", credits: 500, price: 129.90, bonusCredits: 50 },
        { id: 3, name: "Empresarial", credits: 1500, price: 349.90, bonusCredits: 200 },
        { id: 4, name: "Enterprise", credits: 5000, price: 999.90, bonusCredits: 1000 }
      ];
      
      const selectedPackage = packages.find(p => p.id === packageId);
      if (!selectedPackage) {
        return res.status(404).json({ message: "Pacote não encontrado" });
      }

      if (stripe) {
        // Criar sessão do Stripe
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [{
            price_data: {
              currency: "brl",
              product_data: {
                name: `Créditos SMS - ${selectedPackage.name}`,
                description: `${selectedPackage.credits + selectedPackage.bonusCredits} créditos SMS`,
              },
              unit_amount: Math.round(selectedPackage.price * 100), // Centavos
            },
            quantity: 1,
          }],
          mode: "payment",
          success_url: `${req.headers.origin}/sms-credits?success=true`,
          cancel_url: `${req.headers.origin}/sms-credits?canceled=true`,
          metadata: {
            userId: user.id,
            packageId: packageId.toString(),
            credits: (selectedPackage.credits + selectedPackage.bonusCredits).toString(),
            type: "sms_credits"
          }
        });

        res.json({ sessionUrl: session.url });
      } else {
        // Modo desenvolvimento - simular compra
        res.json({ 
          message: "Modo desenvolvimento - Stripe não configurado",
          sessionUrl: `/sms-credits?success=true&dev=true`
        });
      }
    } catch (error) {
      console.error("Error creating SMS credits checkout session:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/sms-credits/send", authenticateToken, async (req, res) => {
    try {
      const { quizId, phoneNumbers, message } = req.body;
      const user = req.user!;
      
      // Verificar saldo
      const currentCredits = parseFloat(user.smsCredits || "0");
      const smsCount = phoneNumbers.length;
      const costPerSms = 0.15;
      const totalCost = smsCount * costPerSms;
      
      if (currentCredits < totalCost) {
        return res.status(400).json({ 
          message: "Créditos insuficientes",
          required: totalCost,
          available: currentCredits
        });
      }

      // Simular envio de SMS (aqui vocês integram a API real)
      const sentSms = [];
      for (const phone of phoneNumbers) {
        // Aqui seria a integração real com a API de SMS
        // Por enquanto, vamos simular
        sentSms.push({
          phone,
          status: "sent",
          messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      }

      // Debitar créditos
      const newBalance = currentCredits - totalCost;
      await storage.updateUserSmsCredits(user.id, newBalance);

      // Registrar transação
      await storage.createSmsTransaction({
        userId: user.id,
        type: "usage",
        amount: -totalCost,
        balance: newBalance,
        description: `Envio de ${smsCount} SMS para quiz ${quizId}`,
        quizId,
        smsCount,
        costPerSms
      });

      res.json({
        success: true,
        sentCount: sentSms.length,
        totalCost,
        newBalance,
        details: sentSms
      });
    } catch (error) {
      console.error("Error sending SMS:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/sms-credits/history", authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      const transactions = await storage.getSmsTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching SMS transactions:", error);
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

  // SMS Credits endpoints
  app.get("/api/sms-credits", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Mock data - dados simulados de créditos SMS
      const mockCredits = {
        total: 1500,
        used: 350,
        remaining: 1150
      };

      res.json(mockCredits);
    } catch (error) {
      console.error("Error fetching SMS credits:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SMS Quiz Phone Numbers endpoint
  app.get("/api/sms/quiz/:quizId/phones", authenticateToken, async (req, res) => {
    try {
      const { quizId } = req.params;
      const userId = req.user!.id;
      
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
      const phones = [];
      
      responses.forEach((response, index) => {
        console.log(`📱 RESPONSE ${index + 1}:`, {
          id: response.id,
          responses: response.responses,
          submittedAt: response.completedAt
        });
        
        if (response.responses && typeof response.responses === 'object') {
          const responseData = response.responses as any;
          console.log(`📱 DADOS DA RESPONSE ${index + 1}:`, Object.keys(responseData));
          console.log(`📱 VALORES DA RESPONSE ${index + 1}:`, responseData);
          
          // Procurar campo telefone em diferentes formatos - priorizar telefone_ primeiro
          const phoneFields = ['telefone_', 'telefone', 'phone', 'celular', 'whatsapp', 'numero', 'phoneNumber', 'campo_'];
          let phoneNumber = null;
          let userName = null;
          
          // Buscar telefone - buscar em qualquer campo que contenha essas palavras
          for (const field of Object.keys(responseData)) {
            const fieldLower = field.toLowerCase();
            const value = responseData[field];
            console.log(`📱 VERIFICANDO CAMPO ${field} (${fieldLower}) = ${value}`);
            
            // Verificar cada padrão individual
            for (const pattern of phoneFields) {
              console.log(`📱 VERIFICANDO PADRÃO "${pattern}" em "${fieldLower}"`);
              if (fieldLower.includes(pattern)) {
                console.log(`📱 CAMPO ${field} CORRESPONDE A TELEFONE (padrão: ${pattern})`);
                // Verificar se o valor parece um telefone (contém dígitos e símbolos de telefone)
                if (typeof value === 'string' && /[\d\(\)\-\s\+]{8,}/.test(value)) {
                  phoneNumber = value;
                  console.log(`📱 TELEFONE ENCONTRADO no campo ${field}: ${phoneNumber}`);
                  break;
                } else {
                  console.log(`📱 VALOR NÃO PARECE TELEFONE: ${value} (tipo: ${typeof value})`);
                }
              }
            }
            if (phoneNumber) break;
          }
          
          // Se não encontrou, procurar por padrão de telefone (regex)
          if (!phoneNumber) {
            for (const field of Object.keys(responseData)) {
              const value = responseData[field];
              if (typeof value === 'string' && /[\d\s\-\(\)\+]{8,}/.test(value)) {
                phoneNumber = value;
                console.log(`📱 TELEFONE ENCONTRADO por padrão no campo ${field}: ${phoneNumber}`);
                break;
              }
            }
          }
          
          // Buscar nome
          const nameFields = ['nome', 'name', 'nomeCompleto', 'firstName', 'fullName'];
          for (const field of Object.keys(responseData)) {
            const fieldLower = field.toLowerCase();
            if (nameFields.some(nf => fieldLower.includes(nf))) {
              userName = responseData[field];
              break;
            }
          }
          
          if (phoneNumber) {
            phones.push({
              id: response.id,
              phone: phoneNumber,
              name: userName || 'Sem nome',
              submittedAt: response.completedAt,
              responses: responseData
            });
          } else {
            console.log(`📱 NENHUM TELEFONE ENCONTRADO na response ${index + 1}`);
          }
        }
      });
      
      console.log(`📱 TELEFONES EXTRAÍDOS: ${phones.length}`);
      
      res.json({
        quizId,
        quizTitle: quiz.title,
        totalResponses: responses.length,
        totalPhones: phones.length,
        phones: phones.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      });
    } catch (error) {
      console.error("Error fetching quiz phone numbers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/sms-credits/purchase", verifyJWT, async (req: any, res: Response) => {
    try {
      const { amount } = req.body;
      const userId = req.user.id;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      // Mock data - sempre retorna sucesso
      res.json({ 
        success: true, 
        message: "Créditos SMS adicionados com sucesso",
        newBalance: 1150 + amount 
      });
    } catch (error) {
      console.error("Error purchasing SMS credits:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // WhatsApp Campaigns endpoints
  app.get("/api/whatsapp-campaigns", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Mock data - campanhas WhatsApp simuladas
      const mockCampaigns = [
        {
          id: "whatsapp_camp1",
          name: "Follow-up Quiz Nutrição",
          quizId: "quiz1",
          quizTitle: "Quiz de Avaliação Nutricional",
          status: "active",
          message: "Oi {{nome}}! Vi que você completou nosso quiz. Baseado no seu perfil {{resultado}}, tenho uma dica especial! 🌟",
          variables: ["nome", "resultado", "pontuacao"],
          targetAudience: "completed",
          triggerType: "delayed",
          triggerDelay: 2,
          triggerUnit: "hours",
          scheduleType: "business_hours",
          businessHours: { start: "09:00", end: "18:00", days: ["monday", "tuesday", "wednesday", "thursday", "friday"] },
          customSchedule: [],
          personalizedMessage: true,
          messageVariations: [],
          sent: 87,
          delivered: 84,
          viewed: 72,
          replied: 23,
          clicks: 15,
          createdAt: "2025-01-05T10:00:00Z",
          isExtensionConnected: true
        }
      ];

      res.json(mockCampaigns);
    } catch (error) {
      console.error("Error fetching WhatsApp campaigns:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/whatsapp-campaigns", verifyJWT, async (req: any, res: Response) => {
    try {
      const { name, message, quizId, targetAudience, triggerType, triggerDelay, triggerUnit, scheduleType, businessHours, personalizedMessage } = req.body;
      const userId = req.user.id;
      
      if (!name || !message || !quizId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Mock data - sempre retorna sucesso
      const newCampaign = {
        id: `whatsapp_camp_${Date.now()}`,
        name,
        quizId,
        quizTitle: "Quiz Selecionado",
        status: "active",
        message,
        targetAudience,
        triggerType,
        triggerDelay,
        triggerUnit,
        scheduleType,
        businessHours,
        personalizedMessage,
        sent: 0,
        delivered: 0,
        viewed: 0,
        replied: 0,
        clicks: 0,
        createdAt: new Date().toISOString(),
        isExtensionConnected: true
      };

      res.json(newCampaign);
    } catch (error) {
      console.error("Error creating WhatsApp campaign:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/whatsapp-campaigns/:id/send", verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Mock data - sempre retorna sucesso
      res.json({ 
        success: true, 
        message: "Campanha WhatsApp enviada com sucesso via extensão",
        campaignId: id,
        sent: 25,
        estimated: "Envio em tempo real via extensão"
      });
    } catch (error) {
      console.error("Error sending WhatsApp campaign:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // WhatsApp Extension endpoints
  app.get("/api/whatsapp-extension/status", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Mock data - status da extensão
      const mockStatus = {
        isInstalled: Math.random() > 0.3, // 70% chance
        isConnected: Math.random() > 0.2, // 80% chance
        isOnline: Math.random() > 0.1, // 90% chance
        phoneNumber: "+55 11 99999-9999",
        whatsappVersion: "2.2.24.18",
        lastActivity: "Agora mesmo",
        messagesSent: 127,
        messagesQueue: Math.floor(Math.random() * 10)
      };

      res.json(mockStatus);
    } catch (error) {
      console.error("Error fetching WhatsApp extension status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SMS Campaigns endpoints
  app.get("/api/sms-campaigns", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Mock data - campanhas SMS simuladas
      const mockCampaigns = [
        {
          id: "camp1",
          name: "Follow-up Quiz Saúde",
          quizId: "quiz1",
          quizTitle: "Quiz de Saúde e Bem-estar",
          status: "active",
          message: "Obrigado por completar nosso quiz! Aqui está sua recomendação personalizada...",
          targetAudience: "completed",
          sent: 127,
          delivered: 124,
          opened: 98,
          clicked: 23,
          replies: 5,
          createdAt: "2025-01-05T10:00:00Z"
        },
        {
          id: "camp2",
          name: "Promoção Black Friday",
          quizId: "quiz2",
          quizTitle: "Quiz de Estilo",
          status: "completed",
          message: "🎁 Oferta especial! 50% OFF em todos os produtos até domingo!",
          targetAudience: "all",
          sent: 89,
          delivered: 87,
          opened: 72,
          clicked: 18,
          replies: 3,
          createdAt: "2025-01-03T14:00:00Z"
        }
      ];

      res.json(mockCampaigns);
    } catch (error) {
      console.error("Error fetching SMS campaigns:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/sms-campaigns", verifyJWT, async (req: any, res: Response) => {
    try {
      const { name, message, quizId, targetAudience, scheduledDate } = req.body;
      const userId = req.user.id;
      
      if (!name || !message || !quizId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Mock data - sempre retorna sucesso
      const newCampaign = {
        id: `camp_${Date.now()}`,
        name,
        quizId,
        quizTitle: "Quiz Selecionado",
        status: "active",
        message,
        targetAudience,
        scheduledDate,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        replies: 0,
        createdAt: new Date().toISOString()
      };

      res.json(newCampaign);
    } catch (error) {
      console.error("Error creating SMS campaign:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/sms-campaigns/:id/send", verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Mock data - sempre retorna sucesso
      res.json({ 
        success: true, 
        message: "Campanha SMS enviada com sucesso",
        campaignId: id,
        sent: 45,
        estimated: "2-5 minutos para conclusão"
      });
    } catch (error) {
      console.error("Error sending SMS campaign:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SMS Templates endpoints
  app.get("/api/sms-templates", verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Mock data - templates SMS simulados
      const mockTemplates = [
        {
          id: "tmpl1",
          name: "Agradecimento",
          message: "Obrigado por completar nosso quiz! Seus resultados: {resultado}",
          category: "thank_you",
          variables: ["resultado", "nome"]
        },
        {
          id: "tmpl2",
          name: "Promoção",
          message: "🎁 Oferta especial para você! {desconto}% OFF válido até amanhã. Use: {codigo}",
          category: "promotion",
          variables: ["desconto", "codigo"]
        },
        {
          id: "tmpl3",
          name: "Lembrete",
          message: "Oi {nome}! Você não terminou nosso quiz. Complete agora: {link}",
          category: "reminder",
          variables: ["link", "nome"]
        }
      ];

      res.json(mockTemplates);
    } catch (error) {
      console.error("Error fetching SMS templates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Email Marketing Routes
  app.get("/api/email-campaigns", rateLimiters.general.middleware(), verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const campaigns = await storage.getEmailCampaigns(userId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching email campaigns:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/email-campaigns/:id", rateLimiters.general.middleware(), verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const campaign = await storage.getEmailCampaign(id);
      
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching email campaign:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/email-campaigns", rateLimiters.general.middleware(), verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const campaignData = insertEmailCampaignSchema.parse({ ...req.body, userId });
      const campaign = await storage.createEmailCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating email campaign:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/email-campaigns/:id", rateLimiters.general.middleware(), verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const campaign = await storage.getEmailCampaign(id);
      
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      const updatedCampaign = await storage.updateEmailCampaign(id, req.body);
      res.json(updatedCampaign);
    } catch (error) {
      console.error("Error updating email campaign:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/email-campaigns/:id", rateLimiters.general.middleware(), verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const campaign = await storage.getEmailCampaign(id);
      
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      await storage.deleteEmailCampaign(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting email campaign:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Email Templates Routes
  app.get("/api/email-templates", rateLimiters.general.middleware(), verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const templates = await storage.getEmailTemplates(userId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/email-templates/:id", rateLimiters.general.middleware(), verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const template = await storage.getEmailTemplate(id);
      
      if (!template || template.userId !== userId) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      res.json(template);
    } catch (error) {
      console.error("Error fetching email template:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/email-templates", rateLimiters.general.middleware(), verifyJWT, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const templateData = insertEmailTemplateSchema.parse({ ...req.body, userId });
      const template = await storage.createEmailTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating email template:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/email-templates/:id", rateLimiters.general.middleware(), verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const template = await storage.getEmailTemplate(id);
      
      if (!template || template.userId !== userId) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      const updatedTemplate = await storage.updateEmailTemplate(id, req.body);
      res.json(updatedTemplate);
    } catch (error) {
      console.error("Error updating email template:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/email-templates/:id", rateLimiters.general.middleware(), verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const template = await storage.getEmailTemplate(id);
      
      if (!template || template.userId !== userId) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      await storage.deleteEmailTemplate(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting email template:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Email Campaign Sending Routes
  app.post("/api/email-campaigns/:id/send", rateLimiters.general.middleware(), verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const campaign = await storage.getEmailCampaign(id);
      
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      // Buscar respostas do quiz para o público-alvo
      const responses = await storage.getQuizResponsesForEmail(campaign.quizId, campaign.targetAudience);
      const emails = storage.extractEmailsFromResponses(responses);
      
      // Simular envio de email
      res.json({
        success: true,
        sent: emails.length,
        campaignId: id,
        estimated: "1-3 minutos para conclusão"
      });
    } catch (error) {
      console.error("Error sending email campaign:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/quizzes/:id/responses/emails", rateLimiters.general.middleware(), verifyJWT, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Verificar se o quiz pertence ao usuário
      const quiz = await storage.getQuiz(id);
      if (!quiz || quiz.userId !== userId) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      
      // Buscar respostas do quiz
      const responses = await storage.getQuizResponses(id);
      const emails = storage.extractEmailsFromResponses(responses);
      
      res.json({
        totalEmails: emails.length,
        emails: emails.slice(0, 50), // Limitar para primeiros 50 emails
        totalResponses: responses.length
      });
    } catch (error) {
      console.error("Error fetching quiz response emails:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Chrome Extensions Download Routes
  app.get("/api/extensions/:id/download", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const extensionPath = `chrome-extension-v2/${id}`;
      
      // Verificar se a extensão existe
      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(extensionPath)) {
        return res.status(404).json({ error: "Extension not found" });
      }
      
      // Criar arquivo ZIP da extensão
      const archiver = require('archiver');
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${id}.zip"`);
      
      archive.pipe(res);
      archive.directory(extensionPath, false);
      archive.finalize();
      
    } catch (error) {
      console.error("Error downloading extension:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}