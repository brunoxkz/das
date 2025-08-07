import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { db } from './database.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'quantum-tasks-secret-key-2025';
const JWT_EXPIRES_IN = '7d';

export interface AuthRequest extends Request {
  user?: any;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId),
      columns: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        timezone: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// Optional authentication - doesn't fail if no token
export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (decoded) {
        const user = await db.query.users.findFirst({
          where: eq(users.id, decoded.userId),
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            timezone: true,
            createdAt: true
          }
        });
        
        if (user) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
}