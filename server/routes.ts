import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertQuizSchema, 
  insertQuizResponseSchema, 
  insertQuizTemplateSchema,
  insertQuizAnalyticsSchema 
} from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not found - Stripe functionality will be disabled');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
}) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Quiz routes
  app.get("/api/quizzes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const quizzes = await storage.getUserQuizzes(userId);
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  app.get("/api/quizzes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const quiz = await storage.getQuiz(id);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      // Check if user owns this quiz
      if (quiz.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  app.post("/api/quizzes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const quizData = insertQuizSchema.parse({
        ...req.body,
        userId,
      });
      
      const quiz = await storage.createQuiz(quizData);
      res.status(201).json(quiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid quiz data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create quiz" });
    }
  });

  app.put("/api/quizzes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      console.log("=== UPDATE QUIZ DEBUG ===");
      console.log("Quiz ID:", id);
      console.log("User ID:", userId);
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      
      // Check if quiz exists and user owns it
      const existingQuiz = await storage.getQuiz(id);
      if (!existingQuiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      console.log("Existing quiz:", JSON.stringify(existingQuiz, null, 2));
      
      if (existingQuiz.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updateData = insertQuizSchema.partial().parse(req.body);
      console.log("Parsed update data:", JSON.stringify(updateData, null, 2));
      
      const quiz = await storage.updateQuiz(id, updateData);
      console.log("Updated quiz result:", JSON.stringify(quiz, null, 2));
      console.log("=== END UPDATE QUIZ DEBUG ===");
      
      res.json(quiz);
    } catch (error) {
      console.error("Error updating quiz:", error);
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid quiz data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update quiz" });
    }
  });

  app.delete("/api/quizzes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Check if quiz exists and user owns it
      const existingQuiz = await storage.getQuiz(id);
      if (!existingQuiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      if (existingQuiz.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteQuiz(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      res.status(500).json({ message: "Failed to delete quiz" });
    }
  });

  // Quiz template routes
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getQuizTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const template = await storage.getQuizTemplate(parseInt(id));
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  // Quiz response routes (public - for quiz taking)
  app.post("/api/quizzes/:id/responses", async (req, res) => {
    try {
      const { id } = req.params;
      const responseData = insertQuizResponseSchema.parse({
        ...req.body,
        quizId: id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
      
      const response = await storage.createQuizResponse(responseData);
      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating quiz response:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid response data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create response" });
    }
  });

  // Analytics routes
  app.get("/api/quizzes/:id/responses", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Check if user owns this quiz
      const quiz = await storage.getQuiz(id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      if (quiz.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const responses = await storage.getQuizResponses(id);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching responses:", error);
      res.status(500).json({ message: "Failed to fetch responses" });
    }
  });

  app.get("/api/quizzes/:id/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Check if user owns this quiz
      const quiz = await storage.getQuiz(id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      if (quiz.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const analytics = await storage.getQuizAnalytics(id);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Stripe subscription routes
  if (stripe) {
    app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        if (user.stripeSubscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          
          if (subscription.latest_invoice && typeof subscription.latest_invoice === 'object') {
            const invoice = subscription.latest_invoice;
            if (invoice.payment_intent && typeof invoice.payment_intent === 'object') {
              const paymentIntent = invoice.payment_intent;
              res.json({
                subscriptionId: subscription.id,
                clientSecret: paymentIntent.client_secret,
              });
              return;
            }
          }
        }
        
        if (!user.email) {
          return res.status(400).json({ message: 'No user email on file' });
        }

        const customer = await stripe.customers.create({
          email: user.email,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
        });

        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{
            price: process.env.STRIPE_PRICE_ID || 'price_1234567890',
          }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });

        await storage.updateUserStripeInfo(userId, customer.id, subscription.id);

        if (subscription.latest_invoice && typeof subscription.latest_invoice === 'object') {
          const invoice = subscription.latest_invoice;
          if (invoice.payment_intent && typeof invoice.payment_intent === 'object') {
            const paymentIntent = invoice.payment_intent;
            res.json({
              subscriptionId: subscription.id,
              clientSecret: paymentIntent.client_secret,
            });
            return;
          }
        }

        res.status(400).json({ message: 'Failed to create subscription' });
      } catch (error: any) {
        console.error("Error creating subscription:", error);
        res.status(500).json({ message: error.message });
      }
    });
  }

  // Admin middleware
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      next();
    } catch (error) {
      console.error("Admin middleware error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  // Admin routes
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { role, plan } = req.body;

      if (role) {
        await storage.updateUserRole(id, role);
      }
      
      if (plan) {
        await storage.updateUserPlan(id, plan);
      }

      const updatedUser = await storage.getUser(id);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
