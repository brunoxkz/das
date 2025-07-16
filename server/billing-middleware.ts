import { Request, Response, NextFunction } from "express";
import { storage } from "./storage-sqlite";

// Middleware para verificar se usuário tem créditos suficientes
export async function checkCredits(category: string, amount: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const balance = await storage.getCreditBalance(userId);
      const categoryBalance = balance[category] || 0;

      if (categoryBalance < amount) {
        // Log do acesso negado
        await storage.logAccess(userId, 'credit_check', category, 'denied', `Insufficient credits: ${categoryBalance} < ${amount}`);
        
        return res.status(402).json({ 
          error: "Insufficient credits", 
          required: amount, 
          available: categoryBalance,
          message: `Você precisa de ${amount} créditos de ${category} para esta ação. Você tem apenas ${categoryBalance} créditos.`
        });
      }

      // Prosseguir com a requisição
      req.creditCheck = { category, amount };
      next();
    } catch (error) {
      console.error('Error in credit check middleware:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}

// Middleware para verificar acesso baseado no plano
export async function checkPlanAccess(action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const accessCheck = await storage.checkAccess(userId, action, req.path);
      
      if (!accessCheck.allowed) {
        // Log do acesso negado
        await storage.logAccess(userId, action, req.path, 'denied', accessCheck.reason);
        
        return res.status(403).json({ 
          error: "Access denied", 
          reason: accessCheck.reason,
          message: `Acesso negado: ${accessCheck.reason}`
        });
      }

      // Log do acesso permitido
      await storage.logAccess(userId, action, req.path, 'allowed');
      
      next();
    } catch (error) {
      console.error('Error in plan access middleware:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}

// Middleware para debitar créditos após ação bem-sucedida
export async function debitCreditsAfterSuccess(category: string, amount: number, reason: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Interceptar o response para debitar créditos apenas em caso de sucesso
    const originalSend = res.send;
    
    res.send = function(data) {
      // Verificar se a resposta foi bem-sucedida (status 200-299)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id;
        if (userId) {
          // Debitar créditos de forma assíncrona
          storage.debitCredits(userId, category, amount, reason, req.body?.id || req.params?.id)
            .then(success => {
              if (success) {
                console.log(`✅ Créditos debitados: ${amount} ${category} para usuário ${userId}`);
              } else {
                console.error(`❌ Erro ao debitar créditos: ${amount} ${category} para usuário ${userId}`);
              }
            })
            .catch(error => {
              console.error('Erro ao debitar créditos:', error);
            });
        }
      }
      
      // Chamar o send original
      return originalSend.call(this, data);
    };

    next();
  };
}

// Middleware para validar se usuário não está bloqueado
export async function checkUserBlocked(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const isBlocked = await storage.isUserBlocked(userId);
    
    if (isBlocked) {
      // Log do acesso negado
      await storage.logAccess(userId, 'access_check', req.path, 'blocked', 'User is blocked');
      
      return res.status(403).json({ 
        error: "User blocked", 
        message: "Sua conta foi bloqueada. Entre em contato com o suporte."
      });
    }

    next();
  } catch (error) {
    console.error('Error in user blocked middleware:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Middleware para atualizar estatísticas de uso
export async function updateUsageStats(statsUpdates: Partial<{
  quizzesCreated: number;
  campaignsCreated: number;
  quizResponsesReceived: number;
  smsCreditsUsed: number;
  emailCreditsUsed: number;
  whatsappCreditsUsed: number;
  aiCreditsUsed: number;
  voiceCreditsUsed: number;
}>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Interceptar o response para atualizar stats apenas em caso de sucesso
    const originalSend = res.send;
    
    res.send = function(data) {
      // Verificar se a resposta foi bem-sucedida (status 200-299)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id;
        if (userId) {
          // Atualizar estatísticas de forma assíncrona
          const month = new Date().toISOString().slice(0, 7); // YYYY-MM
          
          storage.updateUsageStats(userId, month, statsUpdates)
            .then(() => {
              console.log(`✅ Estatísticas de uso atualizadas para usuário ${userId}`);
            })
            .catch(error => {
              console.error('Erro ao atualizar estatísticas de uso:', error);
            });
        }
      }
      
      // Chamar o send original
      return originalSend.call(this, data);
    };

    next();
  };
}

// Tipos para extend do Request
declare global {
  namespace Express {
    interface Request {
      creditCheck?: {
        category: string;
        amount: number;
      };
    }
  }
}