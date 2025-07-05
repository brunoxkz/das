import type { Express, Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { storage } from "./storage-sqlite";
import { cache } from "./cache";

// USAR EXATAMENTE O MESMO SEGREDO DO AUTH-HYBRID PARA COMPATIBILIDADE
const JWT_SECRET = process.env.JWT_SECRET || 'vendzz-jwt-secret-key-2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'vendzz-jwt-refresh-secret-2024';

export function generateTokens(user: any) {
  const accessToken = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      plan: user.plan 
    },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id, type: "refresh" },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
}

export const verifyJWT: RequestHandler = async (req: any, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      // Verificar cache do usuário primeiro
      let user = cache.getUser(decoded.id);
      
      if (!user) {
        user = await storage.getUser(decoded.id);
        if (user) {
          cache.setUser(decoded.id, user);
        }
      }

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

export function setupSQLiteAuth(app: Express) {
  // Login endpoint
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { accessToken, refreshToken } = generateTokens(user);
      
      // Armazenar refresh token
      await storage.storeRefreshToken(user.id, refreshToken);
      
      // Cache do usuário
      cache.setUser(user.id, user);

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          plan: user.plan,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Register endpoint
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ 
          message: "All fields are required" 
        });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const user = await storage.createUserWithPassword({
        email,
        password,
        firstName,
        lastName,
      });

      const { accessToken, refreshToken } = generateTokens(user);
      await storage.storeRefreshToken(user.id, refreshToken);
      
      // Cache do usuário
      cache.setUser(user.id, user);

      res.status(201).json({
        message: "Registration successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          plan: user.plan,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Refresh token endpoint
  app.post('/api/auth/refresh', async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
      }

      const decoded: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      
      const isValid = await storage.isValidRefreshToken(decoded.id, refreshToken);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      const user = await storage.getUser(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
      await storage.storeRefreshToken(user.id, newRefreshToken);

      res.json({
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(401).json({ message: "Invalid refresh token" });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', verifyJWT, async (req: any, res: Response) => {
    try {
      await storage.invalidateRefreshTokens(req.user.id);
      cache.del(`user-${req.user.id}`);
      res.json({ message: "Logout successful" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current user endpoint
  app.get('/api/user', verifyJWT, (req: any, res: Response) => {
    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      plan: req.user.plan,
    });
  });
}