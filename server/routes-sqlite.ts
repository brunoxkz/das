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
      
      res.json({ message: "View tracked", success: true });
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
        
        await storage.createQuizResponse({
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
      
      res.status(200).json({ 
        message: 'Respostas parciais salvas com sucesso',
        step: currentStep,
        fieldsCount: Object.keys(responseData).length
      });
      
    } catch (error) {
      console.error('❌ ERRO ao salvar respostas parciais:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // SMS Quiz Phone Numbers endpoint
  app.get("/api/quizzes/:quizId/phones", verifyJWT, async (req: any, res) => {
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
              submittedAt: response.submittedAt,
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
      console.error("Error fetching quiz phones:", error);
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



  const httpServer = createServer(app);
  return httpServer;
}