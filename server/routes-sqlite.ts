import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-sqlite";
import { verifyJWT } from "./auth-sqlite";

export function registerSQLiteRoutes(app: Express): Server {
  // Basic health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Change password endpoint (for user settings)
  app.post("/api/user/change-password", verifyJWT, async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres' });
      }

      const success = await storage.changeUserPasswordWithVerification(userId, currentPassword, newPassword);
      
      if (success) {
        res.json({ success: true, message: 'Senha alterada com sucesso' });
      } else {
        res.status(400).json({ error: 'Senha atual incorreta' });
      }
    } catch (error) {
      console.error('❌ ERRO ao alterar senha:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}