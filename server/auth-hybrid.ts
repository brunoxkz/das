import type { Express, Request, Response, NextFunction, RequestHandler } from "express";
import { setupJWTAuth, verifyJWT as verifyJWTPostgres } from "./auth";
import { setupSQLiteAuth, verifyJWT as verifyJWTSQLite } from "./auth-sqlite";
import jwt from 'jsonwebtoken';
import { cache } from './cache';

// Detecta automaticamente qual sistema de auth usar baseado no ambiente
const detectAuthSystem = () => {
  // Se DATABASE_URL estiver presente, usa PostgreSQL (Railway)
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
    return 'postgresql';
  }
  // Caso contrário, usa SQLite local
  return 'sqlite';
};

export const authSystem = detectAuthSystem();

// JWT Secret unificado - EXATAMENTE O MESMO SEGREDO EM TODOS OS SISTEMAS
const JWT_SECRET = process.env.JWT_SECRET || 'vendzz-jwt-secret-key-2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'vendzz-jwt-refresh-secret-2024';

// Middleware de verificação JWT híbrido que funciona para ambos os sistemas
export const verifyJWT: RequestHandler = async (req: any, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Cache check primeiro para performance
    const cacheKey = `auth:${token.slice(-10)}`;
    let user = cache.get(cacheKey);
    
    if (!user) {
      // Decodifica e valida o token JWT
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      if (authSystem === 'postgresql') {
        // Para PostgreSQL, importa storage dinamicamente  
        const { storage } = await import('./storage');
        user = await storage.getUser(decoded.id);
      } else {
        // Para SQLite, importa storage dinamicamente
        const { storage } = await import('./storage-sqlite');
        user = await storage.getUser(decoded.id);
      }

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Cache do usuário por 5 minutos
      cache.set(cacheKey, user, 300);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export function setupHybridAuth(app: Express) {
  console.log(`🔐 Configurando sistema de autenticação: ${authSystem.toUpperCase()}`);
  
  if (authSystem === 'postgresql') {
    setupJWTAuth(app);
  } else {
    setupSQLiteAuth(app);
  }
  
  // Endpoint para detectar qual sistema está sendo usado
  app.get('/api/auth/system', (req, res) => {
    res.json({ system: authSystem });
  });
}