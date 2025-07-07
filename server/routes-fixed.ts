import { Express, Request, Response, NextFunction } from "express";
import { createServer, Server } from "http";
import { IncomingMessage } from "http";
import { storage } from "./storage-sqlite";
import { cache } from "./cache";
import { verifyJWT } from "./auth-hybrid";
import { sendSMS } from "./twilio";
import { sendBulkEmails } from "./sendgrid";
import { rateLimiters } from "./rate-limiter";

interface RequestWithRawBody extends Request {
  rawBody?: Buffer;
}

function authenticateToken(req: any, res: Response, next: NextFunction) {
  return verifyJWT(req, res, next);
}

function getPlanLimits(plan: string) {
  switch (plan) {
    case "enterprise":
      return { maxQuizzes: Infinity, maxResponses: Infinity };
    case "plus":
      return { maxQuizzes: 50, maxResponses: 10000 };
    default:
      return { maxQuizzes: 5, maxResponses: 100 };
  }
}

export function registerRoutes(app: Express): Server {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      database: "sqlite",
      cache: cache.getStats()
    });
  });

  // User profile with plan limits
  app.get("/api/user/profile", authenticateToken, async (req: any, res: Response) => {
    try {
      const user = req.user!;
      const limits = getPlanLimits(user.plan);
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: user.plan,
        role: user.role,
        limits
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", rateLimiters.dashboard.middleware(), authenticateToken, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Check cache first
      const cachedData = cache.getDashboardStats(userId);
      if (cachedData) {
        return res.json(cachedData);
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
          description: quiz.description,
          isPublished: quiz.isPublished,
          createdAt: quiz.createdAt,
          updatedAt: quiz.updatedAt,
          responses: 0
        }))
      };
      
      // Cache for 1 minute
      cache.setDashboardStats(userId, dashboardData);
      
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Quiz management
  app.get("/api/quizzes", rateLimiters.general.middleware(), authenticateToken, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Check cache first
      const cachedQuizzes = cache.getQuizzes(userId);
      if (cachedQuizzes) {
        return res.json(cachedQuizzes);
      }
      
      const quizzes = await storage.getUserQuizzes(userId);
      
      // Cache for 30 seconds
      cache.setQuizzes(userId, quizzes);
      
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/quizzes/:id", authenticateToken, async (req: any, res: Response) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      
      if (quiz.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/quizzes", rateLimiters.quizCreation.middleware(), authenticateToken, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const user = req.user;
      
      // Check plan limits
      const limits = getPlanLimits(user.plan);
      const existingQuizzes = await storage.getUserQuizzes(userId);
      
      if (existingQuizzes.length >= limits.maxQuizzes) {
        return res.status(403).json({ 
          error: "Quiz limit reached for your plan",
          limit: limits.maxQuizzes,
          current: existingQuizzes.length
        });
      }
      
      const quizData = {
        ...req.body,
        userId
      };
      
      const quiz = await storage.createQuiz(quizData);
      
      // Invalidate cache
      cache.invalidateUserCaches(userId);
      
      res.status(201).json(quiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/quizzes/:id", authenticateToken, async (req: any, res: Response) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      
      if (quiz.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updatedQuiz = await storage.updateQuiz(req.params.id, req.body);
      
      // Invalidate cache
      cache.invalidateUserCaches(req.user.id);
      cache.invalidateQuizCaches(req.params.id, req.user.id);
      
      res.json(updatedQuiz);
    } catch (error) {
      console.error("Error updating quiz:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/quizzes/:id", authenticateToken, async (req: any, res: Response) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      
      if (quiz.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      await storage.deleteQuiz(req.params.id);
      
      // Invalidate cache
      cache.invalidateUserCaches(req.user.id);
      cache.invalidateQuizCaches(req.params.id, req.user.id);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Public quiz access
  app.get("/api/quizzes/:id/public", async (req: Request, res: Response) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz || !quiz.isPublished) {
        return res.status(404).json({ error: "Quiz not found or not published" });
      }
      
      res.json({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        structure: quiz.structure,
        design: quiz.design,
        settings: quiz.settings
      });
    } catch (error) {
      console.error("Error fetching public quiz:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Quiz responses
  app.post("/api/quizzes/:id/responses", async (req: Request, res: Response) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz || !quiz.isPublished) {
        return res.status(404).json({ error: "Quiz not found or not published" });
      }
      
      const responseData = {
        quizId: req.params.id,
        responses: req.body.responses,
        metadata: req.body.metadata || {}
      };
      
      const response = await storage.createQuizResponse(responseData);
      
      // Invalidate response cache
      cache.invalidateQuizCaches(req.params.id, quiz.userId);
      
      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating quiz response:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/quizzes/:id/responses", authenticateToken, async (req: any, res: Response) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz || quiz.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Check cache first
      const cachedResponses = cache.getResponses(req.params.id);
      if (cachedResponses) {
        return res.json(cachedResponses);
      }
      
      const responses = await storage.getQuizResponses(req.params.id);
      
      // Cache for 15 seconds
      cache.setResponses(req.params.id, responses);
      
      res.json(responses);
    } catch (error) {
      console.error("Error fetching quiz responses:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Analytics endpoint for tracking quiz views
  app.post("/api/analytics/:quizId/view", async (req: Request, res: Response) => {
    try {
      const { quizId } = req.params;
      
      // Verificar se o quiz existe e está publicado
      const quiz = await storage.getQuiz(quizId);
      if (!quiz || !quiz.isPublished) {
        return res.status(404).json({ error: "Quiz not found or not published" });
      }
      
      // Registrar visualização
      const analytics = {
        quizId,
        date: new Date().toISOString().split('T')[0],
        views: 1,
        completions: 0,
        conversionRate: 0,
        metadata: {
          userAgent: req.headers['user-agent'] || '',
          ip: req.ip || '',
          timestamp: new Date().toISOString()
        }
      };
      
      await storage.updateQuizAnalytics(quizId, analytics);
      
      // Invalidar cache do quiz
      cache.invalidateQuizCaches(quizId, quiz.userId);
      
      res.json({ success: true, message: "View tracked successfully" });
    } catch (error) {
      console.error("Error tracking quiz view:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Quiz templates
  app.get("/api/quiz-templates", async (req: Request, res: Response) => {
    try {
      const templates = await storage.getQuizTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching quiz templates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get phones specifically for SMS campaigns
  app.get("/api/quizzes/:id/phones", authenticateToken, async (req: any, res: Response) => {
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

      res.json({
        quizId: req.params.id,
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

  // SMS Quiz Phone Numbers endpoint
  app.get("/api/quiz-phones/:quizId", authenticateToken, async (req: any, res: Response) => {
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

  // SMS Campaigns endpoints
  app.get("/api/sms-campaigns", authenticateToken, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Get SMS campaigns from database
      const campaigns = await storage.getSmsCampaigns(userId);
      
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching SMS campaigns:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/sms-campaigns", authenticateToken, async (req: any, res: Response) => {
    try {
      const { name, message, quizId, targetAudience, scheduledDate } = req.body;
      const userId = req.user.id;
      
      if (!name || !message || !quizId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const campaignData = {
        name,
        message,
        quizId,
        targetAudience: targetAudience || 'all',
        status: 'draft',
        scheduledDate,
        userId
      };

      const campaign = await storage.createSmsCampaign(campaignData);
      
      res.json(campaign);
    } catch (error) {
      console.error("Error creating SMS campaign:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/sms-campaigns/:id/send", authenticateToken, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Get campaign
      const campaign = await storage.getSmsCampaign(id);
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      // Get quiz phones
      const quiz = await storage.getQuiz(campaign.quizId);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      const responses = await storage.getQuizResponses(campaign.quizId);
      
      // Extract phones based on target audience
      const phones: string[] = [];
      responses.forEach(response => {
        if (response.responses && Array.isArray(response.responses)) {
          for (const item of response.responses) {
            if ((item.elementType === 'phone' || 
                (item.elementFieldId && item.elementFieldId.includes('telefone_'))) && 
                item.answer) {
              phones.push(item.answer);
              break;
            }
          }
        }
      });

      // Remove duplicates
      const uniquePhones = [...new Set(phones)];

      // Send SMS messages
      let sentCount = 0;
      let errors = 0;

      for (const phone of uniquePhones) {
        try {
          await sendSMS(phone, campaign.message);
          sentCount++;
        } catch (error) {
          console.error(`Error sending SMS to ${phone}:`, error);
          errors++;
        }
      }

      // Update campaign status
      await storage.updateSmsCampaign(id, { 
        status: 'completed',
        sent: sentCount,
        deliveryErrors: errors
      });
      
      res.json({ 
        success: true, 
        message: "Campanha SMS enviada com sucesso",
        campaignId: id,
        sent: sentCount,
        errors,
        total: uniquePhones.length
      });
    } catch (error) {
      console.error("Error sending SMS campaign:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SMS Templates endpoints
  app.get("/api/sms-templates", authenticateToken, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      
      const templates = await storage.getSmsTemplates(userId);
      
      res.json(templates);
    } catch (error) {
      console.error("Error fetching SMS templates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SMS Credits endpoints - simplified without credits system
  app.get("/api/sms-credits", authenticateToken, async (req: any, res: Response) => {
    try {
      // Return unlimited credits for simplified system
      const mockCredits = {
        total: 999999,
        used: 0,
        remaining: 999999
      };

      res.json(mockCredits);
    } catch (error) {
      console.error("Error fetching SMS credits:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/sms-credits/purchase", authenticateToken, async (req: any, res: Response) => {
    try {
      // Mock successful purchase for simplified system
      res.json({
        success: true,
        message: "Credits purchased successfully",
        newBalance: 999999
      });
    } catch (error) {
      console.error("Error purchasing SMS credits:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Email campaigns
  app.get("/api/email-campaigns", rateLimiters.general.middleware(), authenticateToken, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const campaigns = await storage.getEmailCampaigns(userId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching email campaigns:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/email-campaigns/:id", rateLimiters.general.middleware(), authenticateToken, async (req: any, res: Response) => {
    try {
      const campaign = await storage.getEmailCampaign(req.params.id);
      
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      if (campaign.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching email campaign:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/email-campaigns", rateLimiters.general.middleware(), authenticateToken, async (req: any, res: Response) => {
    try {
      const campaignData = {
        ...req.body,
        userId: req.user.id
      };
      
      const campaign = await storage.createEmailCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating email campaign:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/email-campaigns/:id", rateLimiters.general.middleware(), authenticateToken, async (req: any, res: Response) => {
    try {
      const campaign = await storage.getEmailCampaign(req.params.id);
      
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      if (campaign.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updatedCampaign = await storage.updateEmailCampaign(req.params.id, req.body);
      res.json(updatedCampaign);
    } catch (error) {
      console.error("Error updating email campaign:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/email-campaigns/:id", rateLimiters.general.middleware(), authenticateToken, async (req: any, res: Response) => {
    try {
      const campaign = await storage.getEmailCampaign(req.params.id);
      
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      if (campaign.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      await storage.deleteEmailCampaign(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting email campaign:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Email templates
  app.get("/api/email-templates", rateLimiters.general.middleware(), authenticateToken, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const templates = await storage.getEmailTemplates(userId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/email-templates/:id", rateLimiters.general.middleware(), authenticateToken, async (req: any, res: Response) => {
    try {
      const template = await storage.getEmailTemplate(req.params.id);
      
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      if (template.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(template);
    } catch (error) {
      console.error("Error fetching email template:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/email-templates", rateLimiters.general.middleware(), authenticateToken, async (req: any, res: Response) => {
    try {
      const templateData = {
        ...req.body,
        userId: req.user.id
      };
      
      const template = await storage.createEmailTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating email template:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/email-templates/:id", rateLimiters.general.middleware(), authenticateToken, async (req: any, res: Response) => {
    try {
      const template = await storage.getEmailTemplate(req.params.id);
      
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      if (template.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updatedTemplate = await storage.updateEmailTemplate(req.params.id, req.body);
      res.json(updatedTemplate);
    } catch (error) {
      console.error("Error updating email template:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/email-templates/:id", rateLimiters.general.middleware(), authenticateToken, async (req: any, res: Response) => {
    try {
      const template = await storage.getEmailTemplate(req.params.id);
      
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      if (template.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      await storage.deleteEmailTemplate(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting email template:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Email campaign sending
  app.post("/api/email-campaigns/:id/send", rateLimiters.general.middleware(), authenticateToken, async (req: any, res: Response) => {
    try {
      const campaign = await storage.getEmailCampaign(req.params.id);
      
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      if (campaign.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Get quiz responses for email extraction
      const responses = await storage.getQuizResponsesForEmail(campaign.quizId, campaign.targetAudience);
      const emails = storage.extractEmailsFromResponses(responses);
      
      if (emails.length === 0) {
        return res.status(400).json({ error: "No email addresses found for this quiz" });
      }
      
      // Send emails
      await sendBulkEmails(emails, campaign.subject, campaign.content);
      
      // Update campaign status
      await storage.updateEmailCampaign(req.params.id, {
        status: 'sent',
        sentAt: new Date(),
        recipientCount: emails.length
      });
      
      res.json({
        success: true,
        message: "Email campaign sent successfully",
        recipientCount: emails.length
      });
    } catch (error) {
      console.error("Error sending email campaign:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get emails from quiz responses
  app.get("/api/quizzes/:id/responses/emails", rateLimiters.general.middleware(), authenticateToken, async (req: any, res: Response) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz || quiz.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const { targetAudience = 'all' } = req.query;
      const responses = await storage.getQuizResponsesForEmail(req.params.id, targetAudience as string);
      const emails = storage.extractEmailsFromResponses(responses);
      
      res.json({
        quizId: req.params.id,
        quizTitle: quiz.title,
        targetAudience,
        totalResponses: responses.length,
        totalEmails: emails.length,
        emails: emails.map((email, index) => ({
          id: index + 1,
          email,
          responseId: responses[index]?.id
        }))
      });
    } catch (error) {
      console.error("Error fetching quiz emails:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

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
    } else if (key.includes('email')) {
      extracted.email = response;
    } else if (key.includes('telefone') || key.includes('phone') || key.includes('celular')) {
      extracted.telefone = response;
    } else if (key.includes('idade') || key.includes('age')) {
      extracted.idade = response;
    }
  });

  return extracted;
}