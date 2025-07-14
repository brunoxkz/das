// JWT REFRESH ENDPOINT CORRECTION - GARANTIR 100% DE SUCESSO
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { generateTokens } from './auth-sqlite';
import { storage } from './storage-sqlite';

export const handleJWTRefresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        success: false,
        message: "Refresh token required" 
      });
    }

    // Verificar se é um token válido
    const decoded: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'vendzz-jwt-refresh-secret-2024');
    
    const isValid = await storage.isValidRefreshToken(decoded.id, refreshToken);
    if (!isValid) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid refresh token" 
      });
    }

    const user = await storage.getUser(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Gerar novos tokens
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
    res.status(200).json(response);

  } catch (error) {
    console.error("❌ JWT REFRESH ERROR:", error);
    res.status(401).json({ 
      success: false,
      message: "Invalid refresh token" 
    });
  }
};