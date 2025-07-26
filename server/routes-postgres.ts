import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-postgres";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const JWT_SECRET = process.env.JWT_SECRET || "vendzz_jwt_secret_key";

// PostgreSQL-based routes with enhanced performance and scalability
export async function registerPostgreSQLRoutes(app: Express): Promise<Server> {
  
  // Authentication middleware for PostgreSQL
  const authenticateToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await storage.getUser(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };

  // Auth routes - PostgreSQL optimized
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || !await bcrypt.compare(password, user.password || '')) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          plan: user.plan,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      
      const user = await storage.createUser({
        id: nanoid(),
        email,
        password: hashedPassword,
        firstName,
        lastName,
        plan: 'trial',
        role: 'user',
        smsCredits: 10,
        emailCredits: 100,
        whatsappCredits: 5,
        aiCredits: 3
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          plan: user.plan,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/auth/verify', authenticateToken, async (req: any, res) => {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        plan: req.user.plan,
        role: req.user.role,
        smsCredits: req.user.smsCredits,
        emailCredits: req.user.emailCredits,
        whatsappCredits: req.user.whatsappCredits,
        aiCredits: req.user.aiCredits
      }
    });
  });

  // Quiz routes - PostgreSQL optimized with connection pooling
  app.post('/api/quizzes', authenticateToken, async (req: any, res) => {
    try {
      const quiz = await storage.createQuiz({
        ...req.body,
        userId: req.user.id,
        id: nanoid()
      });

      res.json(quiz);
    } catch (error) {
      console.error('Create quiz error:', error);
      res.status(500).json({ message: 'Failed to create quiz' });
    }
  });

  app.get('/api/quizzes/:id', async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      res.json(quiz);
    } catch (error) {
      console.error('Get quiz error:', error);
      res.status(500).json({ message: 'Failed to get quiz' });
    }
  });

  app.get('/api/user/quizzes', authenticateToken, async (req: any, res) => {
    try {
      const quizzes = await storage.getUserQuizzes(req.user.id);
      res.json(quizzes);
    } catch (error) {
      console.error('Get user quizzes error:', error);
      res.status(500).json({ message: 'Failed to get quizzes' });
    }
  });

  app.put('/api/quizzes/:id', authenticateToken, async (req: any, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz || quiz.userId !== req.user.id) {
        return res.status(404).json({ message: 'Quiz not found or unauthorized' });
      }

      const updatedQuiz = await storage.updateQuiz(req.params.id, req.body);
      res.json(updatedQuiz);
    } catch (error) {
      console.error('Update quiz error:', error);
      res.status(500).json({ message: 'Failed to update quiz' });
    }
  });

  app.delete('/api/quizzes/:id', authenticateToken, async (req: any, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz || quiz.userId !== req.user.id) {
        return res.status(404).json({ message: 'Quiz not found or unauthorized' });
      }

      await storage.deleteQuiz(req.params.id);
      res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
      console.error('Delete quiz error:', error);
      res.status(500).json({ message: 'Failed to delete quiz' });
    }
  });

  // Quiz responses - optimized for high volume
  app.post('/api/quizzes/:id/submit', async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      const response = await storage.createQuizResponse({
        id: nanoid(),
        quizId: req.params.id,
        responses: req.body.responses,
        metadata: {
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          submittedAt: new Date().toISOString(),
          ...req.body.metadata
        }
      });

      res.json({ 
        success: true, 
        responseId: response.id,
        message: 'Quiz submitted successfully' 
      });
    } catch (error) {
      console.error('Submit quiz response error:', error);
      res.status(500).json({ message: 'Failed to submit quiz response' });
    }
  });

  app.get('/api/quizzes/:id/responses', authenticateToken, async (req: any, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      
      if (!quiz || quiz.userId !== req.user.id) {
        return res.status(404).json({ message: 'Quiz not found or unauthorized' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const responses = await storage.getQuizResponses(req.params.id, limit, offset);
      const totalCount = await storage.getQuizResponsesCount(req.params.id);

      res.json({
        responses,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Get quiz responses error:', error);
      res.status(500).json({ message: 'Failed to get quiz responses' });
    }
  });

  // Quantum Tasks - PostgreSQL powered for real-time performance
  app.get('/api/dashboard-stats', authenticateToken, async (req: any, res) => {
    try {
      const stats = await storage.getDashboardStats(req.user.id);
      res.json(stats);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ message: 'Failed to get dashboard stats' });
    }
  });

  // Health check for PostgreSQL
  app.get('/api/health/postgres', async (req, res) => {
    try {
      // Simple query to test connection
      await storage.getDashboardStats('test-user-id');
      res.json({ 
        status: 'healthy', 
        database: 'PostgreSQL',
        timestamp: new Date().toISOString(),
        message: 'PostgreSQL connection active'
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'unhealthy', 
        database: 'PostgreSQL',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}