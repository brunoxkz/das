/**
 * SISTEMA DE UPLOAD SEGURO PARA 100,000+ USUÁRIOS
 * Implementa upload de logo/favicon com máxima segurança
 */

import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { nanoid } from 'nanoid';

// Configurações de segurança
const UPLOAD_CONFIG = {
  maxFileSize: 2 * 1024 * 1024, // 2MB máximo
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/x-icon',
    'image/vnd.microsoft.icon'
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.ico'],
  uploadDir: './uploads',
  maxUploadsPerUser: 10, // Limite por usuário
  rateLimitWindow: 60 * 1000, // 1 minuto
  maxUploadsPerWindow: 5 // 5 uploads por minuto por usuário
};

// Rate limiting em memória (para produção usar Redis)
const uploadRateLimit = new Map();

// Validação de tipo de arquivo por magic bytes
const MAGIC_BYTES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'image/x-icon': [0x00, 0x00, 0x01, 0x00]
};

class SecureUploadService {
  
  static async validateMagicBytes(buffer: Buffer, mimeType: string): Promise<boolean> {
    const magicBytes = MAGIC_BYTES[mimeType as keyof typeof MAGIC_BYTES];
    if (!magicBytes) return true; // SVG não tem magic bytes
    
    return magicBytes.every((byte, index) => buffer[index] === byte);
  }
  
  static async sanitizeFileName(originalName: string): Promise<string> {
    const ext = path.extname(originalName).toLowerCase();
    const safeName = originalName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 50);
    
    return `${nanoid(12)}_${safeName}`;
  }
  
  static async checkRateLimit(userId: string): Promise<boolean> {
    const now = Date.now();
    const userLimits = uploadRateLimit.get(userId) || [];
    
    // Remover uploads antigos
    const validUploads = userLimits.filter(
      (timestamp: number) => now - timestamp < UPLOAD_CONFIG.rateLimitWindow
    );
    
    if (validUploads.length >= UPLOAD_CONFIG.maxUploadsPerWindow) {
      return false;
    }
    
    validUploads.push(now);
    uploadRateLimit.set(userId, validUploads);
    return true;
  }
  
  static async validateFile(file: Express.Multer.File): Promise<{ valid: boolean; error?: string }> {
    // Verificar tamanho
    if (file.size > UPLOAD_CONFIG.maxFileSize) {
      return { valid: false, error: 'Arquivo muito grande. Máximo 2MB.' };
    }
    
    // Verificar extensão
    const ext = path.extname(file.originalname).toLowerCase();
    if (!UPLOAD_CONFIG.allowedExtensions.includes(ext)) {
      return { valid: false, error: 'Extensão não permitida.' };
    }
    
    // Verificar MIME type
    if (!UPLOAD_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Tipo de arquivo não permitido.' };
    }
    
    // Verificar magic bytes
    const isValidMagic = await this.validateMagicBytes(file.buffer, file.mimetype);
    if (!isValidMagic) {
      return { valid: false, error: 'Arquivo corrompido ou inválido.' };
    }
    
    return { valid: true };
  }
  
  static async saveFile(file: Express.Multer.File, userId: string, type: 'logo' | 'favicon'): Promise<string> {
    // Criar diretório se não existir
    const userDir = path.join(UPLOAD_CONFIG.uploadDir, userId);
    await fs.mkdir(userDir, { recursive: true });
    
    // Gerar nome seguro
    const safeName = await this.sanitizeFileName(file.originalname);
    const fileName = `${type}_${safeName}`;
    const filePath = path.join(userDir, fileName);
    
    // Salvar arquivo
    await fs.writeFile(filePath, file.buffer);
    
    // Retornar URL relativa
    return `/uploads/${userId}/${fileName}`;
  }
  
  static async deleteOldFiles(userId: string, type: 'logo' | 'favicon'): Promise<void> {
    const userDir = path.join(UPLOAD_CONFIG.uploadDir, userId);
    
    try {
      const files = await fs.readdir(userDir);
      const oldFiles = files.filter(f => f.startsWith(`${type}_`));
      
      for (const file of oldFiles) {
        await fs.unlink(path.join(userDir, file));
      }
    } catch (error) {
      // Diretório não existe, tudo bem
    }
  }
}

// Configuração do multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: UPLOAD_CONFIG.maxFileSize,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isValidExt = UPLOAD_CONFIG.allowedExtensions.includes(ext);
    const isValidMime = UPLOAD_CONFIG.allowedMimeTypes.includes(file.mimetype);
    
    if (isValidExt && isValidMime) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

// Handler de upload
export const handleSecureUpload = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    
    // Verificar rate limiting
    const canUpload = await SecureUploadService.checkRateLimit(userId);
    if (!canUpload) {
      return res.status(429).json({ 
        message: 'Muitos uploads. Tente novamente em 1 minuto.' 
      });
    }
    
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }
    
    const uploadType = req.body.type as 'logo' | 'favicon';
    if (!uploadType || !['logo', 'favicon'].includes(uploadType)) {
      return res.status(400).json({ message: 'Tipo de upload inválido' });
    }
    
    // Validar arquivo
    const validation = await SecureUploadService.validateFile(file);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.error });
    }
    
    // Deletar arquivos antigos do mesmo tipo
    await SecureUploadService.deleteOldFiles(userId, uploadType);
    
    // Salvar novo arquivo
    const fileUrl = await SecureUploadService.saveFile(file, userId, uploadType);
    
    console.log(`📤 Upload seguro realizado: ${uploadType} para usuário ${userId}`);
    
    res.json({
      success: true,
      url: fileUrl,
      type: uploadType,
      size: file.size,
      originalName: file.originalname
    });
    
  } catch (error) {
    console.error('❌ Erro no upload seguro:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Middleware de upload
export const uploadMiddleware = upload.single('file');

export default SecureUploadService;