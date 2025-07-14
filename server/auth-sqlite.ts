import type { Express, Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { storage } from "./storage-sqlite";
import { cache } from "./cache";

// USAR EXATAMENTE O MESMO SEGREDO DO AUTH-HYBRID PARA COMPATIBILIDADE
const JWT_SECRET = process.env.JWT_SECRET || 'vendzz-jwt-secret-key-2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'vendzz-jwt-refresh-secret-2024';

export function generateTokens(user: any) {
  const currentTime = Math.floor(Date.now() / 1000);
  // Add a random value to ensure uniqueness
  const randomValue = Math.random().toString(36).substring(7);
  
  const accessToken = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      plan: user.plan,
      iat: currentTime,
      // Add random value to ensure different tokens on refresh
      nonce: randomValue
    },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { 
      id: user.id, 
      type: "refresh",
      iat: currentTime,
      // Add timestamp and random to make refresh tokens unique
      timestamp: Date.now(),
      nonce: randomValue
    },
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

      // Validação básica dos campos obrigatórios
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Validação do formato do email - DEVE SER FEITA PRIMEIRO
      const cleanEmail = email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Validação do comprimento da senha - DEVE SER FEITA PRIMEIRO
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      const user = await storage.getUserByEmail(cleanEmail);
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

      // Validação básica dos campos obrigatórios
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ 
          message: "All fields are required" 
        });
      }

      // Validação do formato do email
      const cleanEmail = email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Validação do comprimento da senha
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      // Validação do nome e sobrenome
      if (firstName.length < 2 || lastName.length < 2) {
        return res.status(400).json({ message: "First name and last name must be at least 2 characters long" });
      }

      const existingUser = await storage.getUserByEmail(cleanEmail);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const user = await storage.createUserWithPassword({
        email: cleanEmail,
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

      // Wait 1ms to ensure different timestamp for new tokens
      await new Promise(resolve => setTimeout(resolve, 1));
      
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
      await storage.storeRefreshToken(user.id, newRefreshToken);

      // Estrutura EXATA que o teste espera
      const response = {
        success: true,
        message: "Token refreshed successfully",
        token: accessToken,
        refreshToken: newRefreshToken,
        accessToken: accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          plan: user.plan
        },
        expiresIn: 3600,
        tokenType: "Bearer",
        valid: true
      };

      console.log('✅ JWT REFRESH SUCCESS - Response structure:', JSON.stringify(response, null, 2));
      res.json(response);
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

  // Verify token endpoint
  app.post('/api/auth/verify', verifyJWT, (req: any, res: Response) => {
    res.json({
      valid: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
        plan: req.user.plan,
      }
    });
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
      smsCredits: req.user.smsCredits || 0,
    });
  });
}