
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { Express, RequestHandler } from 'express';
import { storage } from './storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// JWT token generation
export function generateTokens(user: any) {
  const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  
  return { accessToken, refreshToken };
}

// JWT verification middleware
export const verifyJWT: RequestHandler = async (req: any, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Token de acesso requerido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await storage.getUser(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expirado' });
    }
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Setup JWT auth routes
export function setupJWTAuth(app: Express) {
  // Register route
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email já está em uso' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create user
      const user = await storage.createUserWithPassword({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id);
      
      // Store refresh token (optional - for token blacklisting)
      await storage.storeRefreshToken(user.id, refreshToken);

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName 
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error('Register error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Login route
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: 'Email ou senha incorretos' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Email ou senha incorretos' });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id);
      
      // Store refresh token
      await storage.storeRefreshToken(user.id, refreshToken);

      res.json({
        message: 'Login realizado com sucesso',
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName 
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Dados inválidos' });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Refresh token route
  app.post('/api/auth/refresh', async (req, res) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token requerido' });
      }

      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
      const user = await storage.getUser(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }

      // Check if refresh token is still valid (stored in DB)
      const isValidRefreshToken = await storage.isValidRefreshToken(user.id, refreshToken);
      if (!isValidRefreshToken) {
        return res.status(401).json({ message: 'Refresh token inválido' });
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);
      
      // Store new refresh token and invalidate old one
      await storage.storeRefreshToken(user.id, newRefreshToken);

      res.json({
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({ message: 'Refresh token inválido' });
    }
  });

  // Logout route
  app.post('/api/auth/logout', verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Invalidate all refresh tokens for this user
      await storage.invalidateRefreshTokens(userId);
      
      res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Verify token route
  app.get('/api/auth/verify', verifyJWT, async (req: any, res) => {
    try {
      res.json({
        user: {
          id: req.user.id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          role: req.user.role,
          plan: req.user.plan
        }
      });
    } catch (error) {
      console.error('Verify token error:', error);
      res.status(500).json({ message: 'Erro ao verificar token' });
    }
  });

  // Get current user (JWT version)
  app.get('/api/auth/user', verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
  });
}
