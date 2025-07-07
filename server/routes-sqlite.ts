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
  insertSmsCampaignSchema,
  type User
} from "@shared/schema-sqlite";
import { z } from "zod";
import { sendSms, twilioClient } from './twilio';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not found - Stripe functionality will be disabled');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export function registerSQLiteRoutes(app: Express): Server {
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
          plan: req.user!.plan
        });
      }

      // Validate data using Zod schema
      const validatedData = insertQuizSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      const quiz = await storage.createQuiz(validatedData);
      
      // Invalidate user caches
      cache.invalidateUserCaches(req.user!.id);
      
      console.log("Quiz created successfully with ID:", quiz.id);
      res.status(201).json(quiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid quiz data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/quizzes/:id", rateLimiters.quizCreation.middleware(), authenticateToken, async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      if (quiz.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Para debugging - log da estrutura enviada
      console.log("Updating quiz with structure:", {
        id: req.params.id,
        hasStructure: !!req.body.structure,
        structureKeys: req.body.structure ? Object.keys(req.body.structure) : [],
        structureSize: req.body.structure ? JSON.stringify(req.body.structure).length : 0
      });

      const updatedQuiz = await storage.updateQuiz(req.params.id, req.body);
      
      // Invalidate related caches
      cache.invalidateUserCaches(req.user!.id);
      cache.invalidateQuizCaches(req.params.id, req.user!.id);
      
      console.log("Quiz updated successfully:", {
        id: updatedQuiz.id,
        title: updatedQuiz.title,
        hasStructure: !!updatedQuiz.structure
      });
      
      res.json(updatedQuiz);
    } catch (error) {
      console.error("Error updating quiz:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/quizzes/:id", rateLimiters.general.middleware(), authenticateToken, async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      if (quiz.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deleteQuiz(req.params.id);
      
      // Clear all related cache
      cache.invalidateUserCaches(req.user!.id);
      cache.invalidateQuizCaches(req.params.id, req.user!.id);
      
      res.status(204).send();
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

  app.post("/api/quiz-templates", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertQuizTemplateSchema.parse(req.body);
      const template = await storage.createQuizTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating quiz template:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Quiz responses
  app.get("/api/quizzes/:id/responses", authenticateToken, async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      if (quiz.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Cache otimizado para respostas
      const cachedResponses = cache.getResponses(req.params.id);
      if (cachedResponses) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cachedResponses);
      }

      const responses = await storage.getQuizResponses(req.params.id);
      cache.setResponses(req.params.id, responses);
      
      res.setHeader('X-Cache', 'MISS');
      res.json(responses);
    } catch (error) {
      console.error("Error fetching quiz responses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/quizzes/:id/responses", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      const validatedData = insertQuizResponseSchema.parse({
        ...req.body,
        quizId: req.params.id,
      });

      const response = await storage.createQuizResponse(validatedData);
      
      // Invalidate responses cache
      cache.invalidateQuizCaches(req.params.id, quiz.userId);
      
      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating quiz response:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid response data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/:quizId", authenticateToken, async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      if (quiz.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized" });
      }

      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const analytics = await storage.getQuizAnalytics(req.params.quizId, startDate, endDate);
      
      // Processar dados de analytics para o frontend
      const processedAnalytics = analytics.map(item => ({
        id: item.id,
        date: item.date,
        quizId: item.quizId,
        views: item.views || 0,
        completions: item.completions || 0,
        conversionRate: item.conversionRate || 0,
        leads: item.completions || 0, // Add leads field for frontend compatibility
        metadata: item.metadata
      }));

      res.json(processedAnalytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Endpoint for tracking quiz views
  app.post("/api/analytics/:quizId/view", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      if (!quiz.isPublished) {
        return res.status(403).json({ message: "Quiz is not published" });
      }

      const today = new Date().toISOString().split('T')[0];
      
      // Update analytics
      await storage.updateQuizAnalytics(req.params.quizId, {
        quizId: req.params.quizId,
        date: today,
        views: 1,
        completions: 0,
        conversionRate: 0,
        metadata: {}
      });

      // Invalidate analytics cache
      cache.invalidateQuizCaches(req.params.quizId, quiz.userId);

      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking view:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", rateLimiters.dashboard.middleware(), authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Cache otimizado para dashboard
      const cachedStats = cache.getDashboardStats(userId);
      if (cachedStats) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cachedStats);
      }
      
      const stats = await storage.getDashboardStats(userId);
      cache.setDashboardStats(userId, stats);
      
      res.setHeader('X-Cache', 'MISS');
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // SMS credits routes
  app.get("/api/sms/credits", authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        credits: user.smsCredits || 0
      });
    } catch (error) {
      console.error("Error fetching SMS credits:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/sms/credits/purchase", authenticateToken, async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const credits = parseInt(amount) || 0;
      const user = await storage.updateUserSmsCredits(req.user!.id, credits);
      
      // Log the transaction
      await storage.createSmsTransaction({
        userId: req.user!.id,
        type: 'purchase',
        amount: credits,
        description: `Purchase of ${credits} SMS credits`
      });

      res.json({ 
        success: true, 
        credits: user.smsCredits,
        message: `${credits} créditos SMS adicionados com sucesso!`
      });
    } catch (error) {
      console.error("Error purchasing SMS credits:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // SMS sending route
  app.post("/api/sms/send", authenticateToken, async (req, res) => {
    try {
      const { phoneNumbers, message } = req.body;

      if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
        return res.status(400).json({ message: "Phone numbers are required" });
      }

      if (!message || message.trim() === '') {
        return res.status(400).json({ message: "Message is required" });
      }

      // Check user SMS credits
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const requiredCredits = phoneNumbers.length;
      if ((user.smsCredits || 0) < requiredCredits) {
        return res.status(400).json({ 
          message: `Créditos SMS insuficientes. Necessário: ${requiredCredits}, Disponível: ${user.smsCredits || 0}` 
        });
      }

      const results = [];
      let successCount = 0;
      let errorCount = 0;

      // Send SMS to each phone number
      for (const phone of phoneNumbers) {
        try {
          const success = await sendSms(phone, message);
          if (success) {
            results.push({ phone, status: 'sent', sid: 'success' });
            successCount++;
          } else {
            results.push({ phone, status: 'failed', error: 'SMS sending failed' });
            errorCount++;
          }
        } catch (error) {
          console.error(`Error sending SMS to ${phone}:`, error);
          results.push({ phone, status: 'failed', error: error.message });
          errorCount++;
        }
      }

      // Deduct credits for successful sends
      if (successCount > 0) {
        await storage.updateUserSmsCredits(req.user!.id, (user.smsCredits || 0) - successCount);
        
        // Log the transaction
        await storage.createSmsTransaction({
          userId: req.user!.id,
          type: 'send',
          amount: -successCount,
          description: `SMS sent to ${successCount} numbers`
        });
      }

      res.json({
        success: true,
        totalSent: successCount,
        totalFailed: errorCount,
        results,
        remainingCredits: (user.smsCredits || 0) - successCount
      });

    } catch (error) {
      console.error("Error sending SMS:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // SMS transactions history
  app.get("/api/sms/transactions", authenticateToken, async (req, res) => {
    try {
      const transactions = await storage.getSmsTransactions(req.user!.id);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching SMS transactions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Route to get quiz responses with phone numbers for SMS campaigns
  app.get("/api/quizzes/:id/phones", authenticateToken, async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      if (quiz.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized" });
      }

      const responses = await storage.getQuizResponses(req.params.id);
      
      // Extract phone numbers from responses
      let phones: any[] = [];
      
      responses.forEach(response => {
        if (response.completedAt && response.responses) {
          // Check if structure has pages (new format) or questions (old format)
          const structure = quiz.structure as any || {};
          const pages = structure.pages || [];
          
          if (pages.length > 0) {
            // New format with pages
            pages.forEach((page: any) => {
              if (page.elements) {
                page.elements.forEach((element: any) => {
                  if (element.type === 'phone' && element.fieldId) {
                    const phoneValue = (response.responses as any)[element.fieldId];
                    if (phoneValue) {
                      phones.push({
                        phone: phoneValue,
                        responseId: response.id,
                        submittedAt: response.submittedAt
                      });
                    }
                  }
                });
              }
            });
          } else {
            // Old format with questions - fallback for compatibility
            const questions = structure.questions || [];
            questions.forEach((question: any) => {
              if (question.type === 'phone' && question.fieldId) {
                const phoneValue = (response.responses as any)[question.fieldId];
                if (phoneValue) {
                  phones.push({
                    phone: phoneValue,
                    responseId: response.id,
                    submittedAt: response.submittedAt
                  });
                }
              }
            });
          }
        }
      });

      // Remove duplicates based on phone number
      const uniquePhones = phones.filter((phone, index, self) => 
        index === self.findIndex(p => p.phone === phone.phone)
      );

      res.json({
        total: uniquePhones.length,
        phones: uniquePhones
      });
    } catch (error) {
      console.error("Error fetching quiz phones:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Route to get quiz responses with phone numbers filtered by completed responses
  app.get("/api/quizzes/:id/completed-phones", authenticateToken, async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      if (quiz.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized" });
      }

      const responses = await storage.getQuizResponses(req.params.id);
      
      // Extract phone numbers only from completed responses
      let phones: any[] = [];
      
      responses.forEach(response => {
        if (response.completedAt && response.responses) {
          // Check if structure has pages (new format) or questions (old format)
          const structure = quiz.structure as any || {};
          const pages = structure.pages || [];
          
          if (pages.length > 0) {
            // New format with pages
            pages.forEach((page: any) => {
              if (page.elements) {
                page.elements.forEach((element: any) => {
                  if (element.type === 'phone' && element.fieldId && element.fieldId.startsWith('telefone_')) {
                    const phoneValue = (response.responses as any)[element.fieldId];
                    if (phoneValue) {
                      phones.push({
                        phone: phoneValue,
                        responseId: response.id,
                        submittedAt: response.submittedAt,
                        completedAt: response.completedAt
                      });
                    }
                  }
                });
              }
            });
          } else {
            // Old format fallback
            const questions = structure.questions || [];
            questions.forEach((question: any) => {
              if (question.type === 'phone' && question.fieldId && question.fieldId.startsWith('telefone_')) {
                const phoneValue = (response.responses as any)[question.fieldId];
                if (phoneValue) {
                  phones.push({
                    phone: phoneValue,
                    responseId: response.id,
                    submittedAt: response.submittedAt,
                    completedAt: response.completedAt
                  });
                }
              }
            });
          }
        }
      });

      // Remove duplicates and return only valid phone numbers
      const uniquePhones = phones.filter((phone, index, self) => 
        index === self.findIndex(p => p.phone === phone.phone) && 
        phone.phone && 
        phone.phone.trim() !== ''
      );

      res.json({
        total: uniquePhones.length,
        phones: uniquePhones
      });
    } catch (error) {
      console.error("Error fetching completed quiz phones:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // SMS Campaigns routes
  app.get("/api/sms/campaigns", authenticateToken, async (req, res) => {
    try {
      const campaigns = await storage.getSmsCampaigns(req.user!.id);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching SMS campaigns:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/sms/campaigns", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertSmsCampaignSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      const campaign = await storage.createSmsCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating SMS campaign:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid campaign data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/sms/campaigns/:id", authenticateToken, async (req, res) => {
    try {
      const campaign = await storage.getSmsCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      if (campaign.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized" });
      }

      res.json(campaign);
    } catch (error) {
      console.error("Error fetching SMS campaign:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/sms/campaigns/:id", authenticateToken, async (req, res) => {
    try {
      const campaign = await storage.getSmsCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      if (campaign.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updatedCampaign = await storage.updateSmsCampaign(req.params.id, req.body);
      res.json(updatedCampaign);
    } catch (error) {
      console.error("Error updating SMS campaign:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/sms/campaigns/:id", authenticateToken, async (req, res) => {
    try {
      const campaign = await storage.getSmsCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      if (campaign.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deleteSmsCampaign(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting SMS campaign:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Execute SMS campaign
  app.post("/api/sms/campaigns/:id/execute", authenticateToken, async (req, res) => {
    try {
      const campaign = await storage.getSmsCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      if (campaign.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Check user SMS credits
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get target phone numbers based on campaign settings
      const quiz = await storage.getQuiz(campaign.quizId!);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found for campaign" });
      }

      const responses = await storage.getQuizResponses(campaign.quizId!);
      
      // Extract phone numbers from completed responses
      let phones: string[] = [];
      
      responses.forEach(response => {
        if (response.completedAt && response.responses) {
          const structure = quiz.structure as any || {};
          const pages = structure.pages || [];
          
          pages.forEach((page: any) => {
            if (page.elements) {
              page.elements.forEach((element: any) => {
                if (element.type === 'phone' && element.fieldId && element.fieldId.startsWith('telefone_')) {
                  const phoneValue = (response.responses as any)[element.fieldId];
                  if (phoneValue) {
                    phones.push(phoneValue);
                  }
                }
              });
            }
          });
        }
      });

      // Remove duplicates
      const uniquePhones = [...new Set(phones)];

      if (uniquePhones.length === 0) {
        return res.status(400).json({ message: "No phone numbers found for this campaign" });
      }

      const requiredCredits = uniquePhones.length;
      if ((user.smsCredits || 0) < requiredCredits) {
        return res.status(400).json({ 
          message: `Créditos SMS insuficientes. Necessário: ${requiredCredits}, Disponível: ${user.smsCredits || 0}` 
        });
      }

      const results = [];
      let successCount = 0;
      let errorCount = 0;

      // Send SMS to each phone number
      for (const phone of uniquePhones) {
        try {
          const result = await sendSms(phone, campaign.message!);
          results.push({ phone, status: 'sent', sid: result.sid });
          successCount++;
        } catch (error) {
          console.error(`Error sending SMS to ${phone}:`, error);
          results.push({ phone, status: 'failed', error: error.message });
          errorCount++;
        }
      }

      // Deduct credits for successful sends
      if (successCount > 0) {
        await storage.updateUserSmsCredits(req.user!.id, (user.smsCredits || 0) - successCount);
        
        // Log the transaction
        await storage.createSmsTransaction({
          userId: req.user!.id,
          type: 'campaign',
          amount: -successCount,
          description: `SMS campaign "${campaign.name}" sent to ${successCount} numbers`
        });
      }

      // Update campaign with execution results
      await storage.updateSmsCampaign(req.params.id, {
        lastExecuted: new Date(),
        status: 'executed'
      });

      res.json({
        success: true,
        campaignName: campaign.name,
        totalSent: successCount,
        totalFailed: errorCount,
        results,
        remainingCredits: (user.smsCredits || 0) - successCount
      });

    } catch (error) {
      console.error("Error executing SMS campaign:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Email campaigns routes
  app.get("/api/email/campaigns", authenticateToken, async (req, res) => {
    try {
      const campaigns = await storage.getEmailCampaigns(req.user!.id);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching email campaigns:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/email/campaigns", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertEmailCampaignSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      const campaign = await storage.createEmailCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating email campaign:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid campaign data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/email/campaigns/:id", authenticateToken, async (req, res) => {
    try {
      const campaign = await storage.getEmailCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      if (campaign.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized" });
      }

      res.json(campaign);
    } catch (error) {
      console.error("Error fetching email campaign:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/email/campaigns/:id", authenticateToken, async (req, res) => {
    try {
      const campaign = await storage.getEmailCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      if (campaign.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updatedCampaign = await storage.updateEmailCampaign(req.params.id, req.body);
      res.json(updatedCampaign);
    } catch (error) {
      console.error("Error updating email campaign:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/email/campaigns/:id", authenticateToken, async (req, res) => {
    try {
      const campaign = await storage.getEmailCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      if (campaign.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deleteEmailCampaign(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting email campaign:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Email templates routes
  app.get("/api/email/templates", authenticateToken, async (req, res) => {
    try {
      const templates = await storage.getEmailTemplates(req.user!.id);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/email/templates", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertEmailTemplateSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      const template = await storage.createEmailTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating email template:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/email/templates/:id", authenticateToken, async (req, res) => {
    try {
      const template = await storage.getEmailTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      if (template.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized" });
      }

      res.json(template);
    } catch (error) {
      console.error("Error fetching email template:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/email/templates/:id", authenticateToken, async (req, res) => {
    try {
      const template = await storage.getEmailTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      if (template.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updatedTemplate = await storage.updateEmailTemplate(req.params.id, req.body);
      res.json(updatedTemplate);
    } catch (error) {
      console.error("Error updating email template:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/email/templates/:id", authenticateToken, async (req, res) => {
    try {
      const template = await storage.getEmailTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      if (template.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deleteEmailTemplate(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting email template:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User management routes
  app.get("/api/user", authenticateToken, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Cache do usuário
      const cachedUser = cache.getUser(userId);
      if (cachedUser) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cachedUser);
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      cache.setUser(userId, user);
      res.setHeader('X-Cache', 'MISS');
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/users/:id/role", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      
      if (!role || !['user', 'editor', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await storage.updateUserRole(req.params.id, role);
      
      // Invalidate user cache
      cache.del(`user:${req.params.id}`);
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      
      // Invalidate user caches
      cache.invalidateUserCaches(req.params.id);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Stripe webhook
  if (stripe) {
    app.post("/api/stripe/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'] as string, process.env.STRIPE_WEBHOOK_SECRET!);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      try {
        switch (event.type) {
          case 'customer.subscription.created':
          case 'customer.subscription.updated':
            const subscription = event.data.object;
            // Update user's subscription status
            // Implementation depends on your user-subscription mapping
            break;
          case 'customer.subscription.deleted':
            // Handle subscription cancellation
            break;
          default:
            console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
      } catch (error) {
        console.error("Error handling webhook:", error);
        res.status(500).json({ message: "Webhook handler failed" });
      }
    });
  }

  // Performance monitoring endpoint
  app.get("/api/performance/stats", async (req, res) => {
    try {
      const stats = cache.getStats();
      res.json({
        cache: stats,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      });
    } catch (error) {
      console.error("Error fetching performance stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}