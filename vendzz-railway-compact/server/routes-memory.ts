// Rotas simplificadas para armazenamento em memória temporário
import type { Express } from "express";
import { createServer, type Server } from "http";
import { memoryStorage } from "./storage-memory";
import { verifyJWT } from "./auth-memory";

export function registerMemoryRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Quiz routes
  app.get("/api/quizzes", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const quizzes = await memoryStorage.getQuizzesByUserId(userId);
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar quizzes' });
    }
  });

  app.get("/api/quizzes/:id", verifyJWT, async (req: any, res) => {
    try {
      const quiz = await memoryStorage.getQuizById(req.params.id);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz não encontrado' });
      }
      if (quiz.userId !== req.user.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar quiz' });
    }
  });

  app.post("/api/quizzes", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const quizData = {
        ...req.body,
        userId,
        structure: req.body.structure || { pages: [], settings: {} }
      };
      
      const quiz = await memoryStorage.createQuiz(quizData);
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar quiz' });
    }
  });

  app.put("/api/quizzes/:id", verifyJWT, async (req: any, res) => {
    try {
      const quiz = await memoryStorage.getQuizById(req.params.id);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz não encontrado' });
      }
      if (quiz.userId !== req.user.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const updatedQuiz = await memoryStorage.updateQuiz(req.params.id, req.body);
      res.json(updatedQuiz);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar quiz' });
    }
  });

  app.delete("/api/quizzes/:id", verifyJWT, async (req: any, res) => {
    try {
      const quiz = await memoryStorage.getQuizById(req.params.id);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz não encontrado' });
      }
      if (quiz.userId !== req.user.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      await memoryStorage.deleteQuiz(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar quiz' });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await memoryStorage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  });

  // Public quiz viewing (without auth)
  app.get("/api/quiz/:id/public", async (req, res) => {
    try {
      const quiz = await memoryStorage.getQuizById(req.params.id);
      if (!quiz || !quiz.isPublished) {
        return res.status(404).json({ error: 'Quiz não encontrado ou não publicado' });
      }
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar quiz público' });
    }
  });

  return httpServer;
}