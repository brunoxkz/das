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

// Mock JWT Verification - Always success
const verifyMockJWT = (req: any, res: any, next: any) => {
  console.log("🔓 MOCK JWT VERIFICATION - Always success");
  req.user = mockUser; // Attach mock user to request
  next();
};

// Mock Cloaker Service and Storage (replace with actual implementations)
const cloakerService = {
  analyzeRequest: (req: any, config: any) => {
    // Mock analysis - block if user agent contains "AdLibrary"
    const userAgent = req.get('user-agent') || '';
    const referrer = req.get('referer') || '';
    const ip = req.ip || req.connection?.remoteAddress || '';
    const utmParams = req.query;

    let isBlocked = false;
    let reason = '';

    if (userAgent.includes('AdLibrary')) {
      isBlocked = true;
      reason = 'User-Agent contém AdLibrary';
    }

    if (config.requireUtm && Object.keys(utmParams).length === 0) {
      isBlocked = true;
      reason = 'UTM parameters are required but missing';
    }

    return {
      isBlocked,
      reason,
      userAgent,
      referrer,
      ip,
      utmParams
    };
  },
  getStats: () => ({
    totalRequests: 100,
    blockedRequests: 10
  })
};

const cloakerStorage = {
  cloakerConfigs: new Map(),
  usageStats: new Map(),

  getCloakerConfig: async (quizId: string) => {
    // Mock config - always return enabled, requires UTM, default block page
    let config = cloakerStorage.cloakerConfigs.get(quizId);

    if (!config) {
      config = {
        quizId: quizId,
        isEnabled: false,
        requireUtm: false,
        blockPage: 'maintenance',
        customBlockMessage: 'Acesso não autorizado',
        allowedIps: [],
        blockedIps: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return config;
  },
  saveCloakerConfig: async (quizId: string, userId: string, config: any) => {
    config.quizId = quizId;
    config.userId = userId;
    config.createdAt = new Date();
    config.updatedAt = new Date();
    cloakerStorage.cloakerConfigs.set(quizId, config);
    return config;
  },
  updateCloakerConfig: async (quizId: string, userId: string, config: any) => {
    const existingConfig = await cloakerStorage.getCloakerConfig(quizId);
    if (!existingConfig) {
      throw new Error('Cloaker config not found');
    }

    config.quizId = quizId;
    config.userId = userId;
    config.createdAt = existingConfig.createdAt;
    config.updatedAt = new Date();

    cloakerStorage.cloakerConfigs.set(quizId, config);
    return config;
  },
  removeCloakerConfig: async (quizId: string) => {
    cloakerStorage.cloakerConfigs.delete(quizId);
  },
  getCloakerUsageStats: async (userId: string) => {
    let stats = cloakerStorage.usageStats.get(userId);
    if (!stats) {
      stats = {
        userId: userId,
        totalTests: 5,
        totalBlocks: 2,
        lastTest: new Date()
      };
    }
    return stats;
  },
  getActiveCloackers: async (userId: string) => {
    const active = Array.from(cloakerStorage.cloakerConfigs.values()).filter(c => c.userId === userId && c.isEnabled);
    return active;
  }
};

export function registerMockRoutes(app: Express): Server {
  // Public quiz viewing (with cloaker protection)
  app.get("/api/quiz/:id/public", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz || !quiz.isPublished) {
        return res.status(404).json({ error: 'Quiz não encontrado ou não publicado' });
      }

      // Verificar se quiz tem proteção cloaker ativa
      const cloakerConfig = await cloakerStorage.getCloakerConfig(req.params.id);

      if (cloakerConfig.isEnabled) {
        const detection = cloakerService.analyzeRequest(req, cloakerConfig);

        if (detection.isBlocked) {
          console.log(`🚫 CLOAKER: Quiz ${req.params.id} blocked - ${detection.reason}`);

          // Retornar página de bloqueio baseada na configuração
          res.setHeader('Content-Type', 'text/html; charset=utf-8');

          let content = '';
          switch (cloakerConfig.blockPage) {
            case 'maintenance':
              content = getMaintenancePage();
              break;
            case 'unavailable':
              content = getUnavailablePage();
              break;
            case 'custom':
              content = getCustomPage(cloakerConfig.customBlockMessage || 'Acesso não autorizado');
              break;
            default:
              content = getMaintenancePage();
          }

          return res.status(503).send(content);
        }
      }

      res.json(quiz);
    } catch (error) {
      console.error("Get public quiz error:", error);
      res.status(500).json({ error: 'Erro ao buscar quiz público' });
    }
  });

  // Funções auxiliares para páginas de bloqueio
  function getMaintenancePage(): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site em Manutenção</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #666; margin-bottom: 20px; }
        p { color: #888; line-height: 1.6; }
        .icon { font-size: 48px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🔧</div>
        <h1>Site em Manutenção</h1>
        <p>Estamos realizando melhorias em nosso sistema.</p>
        <p>Por favor, tente novamente em alguns minutos.</p>
        <p><small>Obrigado pela compreensão.</small></p>
    </div>
</body>
</html>`;
  }

  function getUnavailablePage(): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Página Indisponível</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #666; margin-bottom: 20px; }
        p { color: #888; line-height: 1.6; }
        .icon { font-size: 48px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">⚠️</div>
        <h1>Página Indisponível</h1>
        <p>Esta página está temporariamente indisponível.</p>
        <p>Tente acessar novamente mais tarde.</p>
    </div>
</body>
</html>`;
  }

  function getCustomPage(message: string): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acesso Restrito</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #666; margin-bottom: 20px; }
        p { color: #888; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Acesso Restrito</h1>
        <p>${message}</p>
    </div>
</body>
</html>`;
  }

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

  // Cloaker Configuration Routes
  app.get("/api/cloaker/config/:quizId", verifyMockJWT, async (req: any, res) => {
    try {
      const { quizId } = req.params;

      // Mock config padrão
      const mockConfig = {
        isEnabled: false,
        requiredUTMParams: ['utm_source', 'utm_campaign'],
        blockAdLibrary: true,
        blockDirectAccess: false,
        blockPage: 'maintenance',
        customBlockMessage: 'Site temporariamente indisponível para manutenção.',
        whitelistedIPs: ['127.0.0.1', '192.168.1.1'],
        maxAttemptsPerIP: 3,
        blockDuration: 60
      };

      console.log(`🛡️ MOCK CLOAKER CONFIG - Quiz ${quizId}`);
      res.json(mockConfig);
    } catch (error) {
      console.error("Error fetching cloaker config:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/cloaker/config/:quizId", verifyMockJWT, async (req: any, res) => {
    try {
      const { quizId } = req.params;

      console.log(`🛡️ MOCK CLOAKER SAVE - Quiz ${quizId}`, req.body);

      // Retorna a configuração salva
      const savedConfig = {
        ...req.body,
        quizId,
        userId: req.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      res.json(savedConfig);
    } catch (error) {
      console.error("Error saving cloaker config:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Cloaker Analytics & Monitoring
  app.get("/api/cloaker/stats", verifyMockJWT, async (req: any, res) => {
    try {
      console.log("🛡️ MOCK CLOAKER STATS");

      const mockStats = {
        detection: {
          totalRequests: 1247,
          blockedRequests: 89,
          blockRate: 7.14,
          topReasons: [
            { reason: "Biblioteca de anúncios detectada", count: 34 },
            { reason: "Acesso direto bloqueado", count: 28 },
            { reason: "Parâmetros UTM ausentes", count: 27 }
          ],
          topUserAgents: [
            { userAgent: "Facebook Ad Library", count: 18 },
            { userAgent: "Google Ads Bot", count: 16 },
            { userAgent: "Direct Access", count: 12 }
          ],
          recentDetections: [
            {
              isBlocked: true,
              reason: "Biblioteca de anúncios detectada",
              clientIP: "203.0.113.45",
              userAgent: "Facebook Ad Library",
              referrer: "https://facebook.com/ads",
              utmParams: {},
              timestamp: new Date(Date.now() - 300000)
            },
            {
              isBlocked: true,
              reason: "Acesso direto bloqueado",
              clientIP: "198.51.100.22",
              userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
              referrer: "",
              utmParams: {},
              timestamp: new Date(Date.now() - 600000)
            }
          ]
        },
        usage: {
          totalLinksProtected: 5,
          totalDetections: 89,
          successfulBlocks: 89,
          averageBlockRate: 7.14
        }
      };

      res.json(mockStats);
    } catch (error) {
      console.error("Error fetching cloaker stats:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/cloaker/active", verifyMockJWT, async (req: any, res) => {
    try {
      console.log("🛡️ MOCK ACTIVE CLOACKERS");

      const mockActiveCloackers = [
        {
          quizId: "quiz_1",
          userId: "7fK49CWfbjBvVpgH59vm2",
          isEnabled: true,
          requiredUTMParams: ['utm_source', 'utm_campaign'],
          blockAdLibrary: true,
          blockDirectAccess: false,
          blockPage: 'maintenance',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20')
        },
        {
          quizId: "quiz_2",
          userId: "7fK49CWfbjBvVpgH59vm2",
          isEnabled: true,
          requiredUTMParams: ['utm_source'],
          blockAdLibrary: true,
          blockDirectAccess: true,
          blockPage: 'unavailable',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-18')
        }
      ];

      res.json(mockActiveCloackers);
    } catch (error) {
      console.error("Error fetching active cloackers:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // SMS Templates endpoints
  app.get("/api/sms-templates", verifyMockJWT, async (req: any, res: any) => {
    try {
      const userId = mockUser.id;

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

  // SMS Quiz Phone Numbers endpoint
  app.get("/api/sms/quiz/:quizId/phones", verifyMockJWT, async (req: any, res: any) => {
    try {
      const { quizId } = req.params;
      const userId = mockUser.id;

      console.log(`📱 BUSCANDO TELEFONES - Quiz: ${quizId}, User: ${userId}`);

      // Buscar quiz responses reais do banco
      const responses = await storage.getQuizResponses(quizId);
      console.log(`📱 RESPONSES ENCONTRADAS: ${responses.length}`);

      // Extrair telefones das respostas
      const phones = [];

      responses.forEach((response, index) => {
        console.log(`📱 RESPONSE ${index + 1}:`, response);

        if (response.responses && typeof response.responses === 'object') {
          const responseData = response.responses as any;

          // Procurar campo telefone em diferentes formatos
          const phoneFields = ['telefone', 'phone', 'celular', 'whatsapp', 'numero'];
          let phoneNumber = null;
          let userName = null;

          // Buscar telefone
          for (const field of phoneFields) {
            if (responseData[field]) {
              phoneNumber = responseData[field];
              break;
            }
          }

          // Buscar nome
          const nameFields = ['nome', 'name', 'nomeCompleto', 'firstName'];
          for (const field of nameFields) {
            if (responseData[field]) {
              userName = responseData[field];
              break;
            }
          }

          if (phoneNumber) {
            phones.push({
              id: response.id,
              phone: phoneNumber,
              name: userName || 'Sem nome',
              submittedAt: response.submittedAt || response.completedAt,
              responses: responseData
            });
          }
        }
      });

      console.log(`📱 TELEFONES EXTRAÍDOS: ${phones.length}`);

      res.json({
        quizId,
        totalResponses: responses.length,
        totalPhones: phones.length,
        phones: phones.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      });
    } catch (error) {
      console.error("Error fetching quiz phone numbers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/sms-campaigns/:id/send", verifyMockJWT, async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const userId = mockUser.id;

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

  // Endpoint para envio direto de SMS via Twilio
  app.post("/api/sms/send-direct", verifyMockJWT, async (req: any, res: any) => {
    try {
      const { phones, message, quizId } = req.body;
      const userId = mockUser.id;

      console.log(`📱 ENVIO DIRETO SMS - User: ${userId}, Phones: ${phones.length}, Quiz: ${quizId}`);

      if (!phones || !Array.isArray(phones) || phones.length === 0) {
        return res.status(400).json({ error: "Lista de telefones é obrigatória" });
      }

      if (!message || message.trim() === '') {
        return res.status(400).json({ error: "Mensagem é obrigatória" });
      }

      // Simulação do Twilio (substitua pela integração real)
      const results = [];
      for (const phone of phones) {
        // Simular envio
        const success = Math.random() > 0.1; // 90% de sucesso
        results.push({
          phone,
          status: success ? 'sent' : 'failed',
          messageId: success ? `twilio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null,
          error: success ? null : 'Número inválido'
        });
      }

      const sentCount = results.filter(r => r.status === 'sent').length;
      const failedCount = results.filter(r => r.status === 'failed').length;

      console.log(`📱 RESULTADO ENVIO - Enviados: ${sentCount}, Falharam: ${failedCount}`);

      res.json({
        success: true,
        sent: sentCount,
        failed: failedCount,
        total: phones.length,
        results,
        message: `${sentCount} SMS enviados com sucesso, ${failedCount} falharam`
      });
    } catch (error) {
      console.error("Error sending direct SMS:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      database: "mock",
      cache: cache.getStats(),
      cloaker: cloakerService.getStats()
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}