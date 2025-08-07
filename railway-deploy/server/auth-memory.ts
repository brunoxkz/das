// Sistema de autenticação em memória temporário
import jwt from 'jsonwebtoken';
import { memoryStorage } from './storage-memory';
import type { Express, Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'temp-secret-key';

export function generateTokens(user: any) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    plan: user.plan
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
}

export const verifyJWT = async (req: any, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const user = await memoryStorage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export function setupMemoryAuth(app: Express) {
  // Login endpoint
  app.post('/api/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      const user = await memoryStorage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Para simplicidade, aceitar qualquer senha temporariamente
      const { accessToken, refreshToken } = generateTokens(user);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          plan: user.plan
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Register endpoint
  app.post('/api/register', async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      const existingUser = await memoryStorage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      const user = await memoryStorage.createUser({
        email,
        password, // Em produção, fazer hash da senha
        firstName,
        lastName,
        plan: 'free',
        role: 'user'
      });

      const { accessToken, refreshToken } = generateTokens(user);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          plan: user.plan
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Get user profile endpoint
  app.get('/api/user', verifyJWT, (req: any, res: Response) => {
    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      plan: req.user.plan
    });
  });
}