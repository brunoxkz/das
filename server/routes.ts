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

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Setup Replit authentication
  setupAuth(app);

  // Quiz routes
  app.get("/api/quizzes", isAuthenticated, async (req, res) => {
    try {
      const quizzes = await storage.getUserQuizzes(req.user!.claims.sub);
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/quizzes/:id", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/quizzes", isAuthenticated, async (req, res) => {
    try {
      const quizData = insertQuizSchema.parse({
        ...req.body,
        userId: req.user!.claims.sub
      });
      const quiz = await storage.createQuiz(quizData);
      res.json(quiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/quizzes/:id", isAuthenticated, async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      if (quiz.userId !== req.user!.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updates = insertQuizSchema.partial().parse(req.body);
      const updatedQuiz = await storage.updateQuiz(req.params.id, updates);
      res.json(updatedQuiz);
    } catch (error) {
      console.error("Error updating quiz:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/quizzes/:id", isAuthenticated, async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      if (quiz.userId !== req.user!.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteQuiz(req.params.id);
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

  app.post("/api/quiz-templates", async (req, res) => {
    try {
      const templateData = insertQuizTemplateSchema.parse(req.body);
      const template = await storage.createQuizTemplate(templateData);
      res.json(template);
    } catch (error) {
      console.error("Error creating quiz template:", error);
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
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/quiz-responses/:quizId", isAuthenticated, async (req, res) => {
    try {
      const responses = await storage.getQuizResponses(req.params.quizId);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching quiz responses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Analytics
  app.get("/api/analytics/:quizId", isAuthenticated, async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      if (quiz.userId !== req.user!.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      const analytics = await storage.getQuizAnalytics(req.params.quizId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.user!.claims.sub);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", isAuthenticated, async (req, res) => {
    try {
      if (req.user!.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/users/:id/role", isAuthenticated, async (req, res) => {
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

  // Stripe routes
  if (stripe) {
    app.post("/api/create-checkout-session", isAuthenticated, async (req, res) => {
      try {
        const { priceId } = req.body;
        const user = req.user!;

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${req.headers.origin}/subscribe`,
          customer_email: user.email,
          metadata: {
            userId: user.claims.sub,
          },
        });

        res.json({ sessionId: session.id });
      } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/api/stripe/webhook", async (req, res) => {
      const sig = req.headers["stripe-signature"];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      try {
        switch (event.type) {
          case "checkout.session.completed":
            const session = event.data.object;
            const userId = session.metadata!.userId;
            const customerId = session.customer as string;
            const subscriptionId = session.subscription as string;

            await storage.updateUserStripeInfo(userId, customerId, subscriptionId);
            await storage.updateUserPlan(userId, "plus", "active");
            break;

          case "customer.subscription.updated":
            const subscription = event.data.object;
            const customer = await stripe.customers.retrieve(subscription.customer as string);
            if (customer && !customer.deleted && customer.email) {
              const user = await storage.getUserByEmail(customer.email);
              if (user) {
                await storage.updateUserPlan(user.id, "plus", subscription.status);
              }
            }
            break;

          case "customer.subscription.deleted":
            const deletedSubscription = event.data.object;
            const deletedCustomer = await stripe.customers.retrieve(deletedSubscription.customer as string);
            if (deletedCustomer && !deletedCustomer.deleted && deletedCustomer.email) {
              const deletedUser = await storage.getUserByEmail(deletedCustomer.email);
              if (deletedUser) {
                await storage.updateUserPlan(deletedUser.id, "free", "canceled");
              }
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

  return httpServer;
}