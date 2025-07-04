import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { verifyJWT as authenticateToken, generateTokens } from "./auth";
import bcrypt from "bcryptjs";
import express from "express";
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

  // Quiz routes
  app.get("/api/quizzes", authenticateToken, async (req, res) => {
    try {
      const quizzes = await storage.getUserQuizzes(req.user!.id);
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

  app.post("/api/quizzes", authenticateToken, async (req, res) => {
    try {
      const quizData = insertQuizSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const quiz = await storage.createQuiz(quizData);
      res.json(quiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      if (error instanceof z.ZodError) {
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
      const responses = await storage.getUserQuizResponses(req.user!.id);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching quiz responses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Analytics
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
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", authenticateToken, async (req, res) => {
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

  // Remove old Replit auth routes - now handled by JWT
  app.get("/api/login", (req, res) => {
    res.redirect("/login");
  });

  app.get("/api/logout", (req, res) => {
    res.redirect("/");
  });

  return httpServer;
}