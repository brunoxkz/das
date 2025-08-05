import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage.js';
import type { User } from '../shared/schema.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken: string;
}

export class AuthService {
  static generateTokens(user: User): { token: string; refreshToken: string } {
    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });

    return { token, refreshToken };
  }

  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async login(username: string, password: string): Promise<AuthResponse> {
    console.log('🔍 AuthService.login - username:', username);
    const user = await storage.getUserByUsername(username);
    console.log('👤 User found:', user ? 'YES' : 'NO');
    
    if (!user || !user.isActive) {
      console.log('❌ User not found or inactive');
      throw new Error('Usuário não encontrado ou inativo');
    }

    console.log('🔐 Password hash from DB:', user.password);
    console.log('🔑 Password to compare:', password);
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('✅ Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      throw new Error('Senha inválida');
    }

    const { token, refreshToken } = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        whatsappNumber: user.whatsappNumber,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
      refreshToken,
    };
  }

  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = this.verifyToken(refreshToken);
      const user = await storage.getUserByUsername(payload.username);
      
      if (!user || !user.isActive) {
        throw new Error('Usuário não encontrado ou inativo');
      }

      const tokens = this.generateTokens(user);

      return {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          whatsappNumber: user.whatsappNumber,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token: tokens.token,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new Error('Token de refresh inválido');
    }
  }
}

// Authentication middleware
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de acesso requerido' });
    }

    const token = authHeader.substring(7);
    const payload = AuthService.verifyToken(token);
    
    const user = await storage.getUserByUsername(payload.username);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Authorization middleware
export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    next();
  };
};

// Admin only middleware
export const adminOnly = authorize(['admin']);

// Owner or admin middleware (for accessing own data)
export const ownerOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  const resourceUserId = req.params.userId || req.body.attendantId;
  
  if (req.user.role === 'admin' || req.user.id === resourceUserId) {
    next();
  } else {
    return res.status(403).json({ error: 'Acesso negado' });
  }
};