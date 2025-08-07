/**
 * HANDLER SEGURO PARA UPLOAD DE ARQUIVOS .TXT
 * 
 * Suporte para campanhas SMS e WhatsApp
 * Validação completa e sanitização de dados
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';

// Configuração segura do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/txt-files';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Nome único com timestamp para evitar conflitos
    const uniqueName = `${nanoid()}_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Filtro de arquivos - apenas .txt
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype === 'text/plain' || path.extname(file.originalname).toLowerCase() === '.txt') {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos .txt são permitidos'), false);
  }
};

// Configuração do multer com limites de segurança
export const txtUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 1 // Apenas 1 arquivo por vez
  }
});

export class TxtFileProcessor {
  
  // PROCESSAR ARQUIVO TXT PARA SMS
  static async processSMSFile(filePath: string): Promise<{ phones: string[], stats: any }> {
    try {
      console.log(`📱 Processando arquivo SMS: ${filePath}`);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      const validPhones: string[] = [];
      const invalidLines: string[] = [];
      
      for (const line of lines) {
        const phone = this.sanitizePhone(line);
        if (this.validatePhone(phone)) {
          validPhones.push(phone);
        } else {
          invalidLines.push(line);
        }
      }
      
      // Remover duplicatas
      const uniquePhones = [...new Set(validPhones)];
      
      const stats = {
        totalLines: lines.length,
        validPhones: uniquePhones.length,
        duplicatesRemoved: validPhones.length - uniquePhones.length,
        invalidLines: invalidLines.length,
        invalidSamples: invalidLines.slice(0, 5) // Primeiras 5 linhas inválidas como exemplo
      };
      
      console.log(`✅ SMS processado: ${stats.validPhones} telefones válidos de ${stats.totalLines} linhas`);
      
      // Limpar arquivo após processamento
      this.cleanupFile(filePath);
      
      return { phones: uniquePhones, stats };
      
    } catch (error) {
      console.error('❌ Erro ao processar arquivo SMS:', error);
      this.cleanupFile(filePath);
      throw new Error('Erro ao processar arquivo de telefones');
    }
  }
  
  // PROCESSAR ARQUIVO TXT PARA WHATSAPP
  static async processWhatsAppFile(filePath: string): Promise<{ phones: string[], stats: any }> {
    try {
      console.log(`💬 Processando arquivo WhatsApp: ${filePath}`);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      const validPhones: string[] = [];
      const invalidLines: string[] = [];
      
      for (const line of lines) {
        const phone = this.sanitizePhone(line);
        if (this.validateWhatsAppPhone(phone)) {
          validPhones.push(phone);
        } else {
          invalidLines.push(line);
        }
      }
      
      // Remover duplicatas
      const uniquePhones = [...new Set(validPhones)];
      
      const stats = {
        totalLines: lines.length,
        validPhones: uniquePhones.length,
        duplicatesRemoved: validPhones.length - uniquePhones.length,
        invalidLines: invalidLines.length,
        invalidSamples: invalidLines.slice(0, 5)
      };
      
      console.log(`✅ WhatsApp processado: ${stats.validPhones} telefones válidos de ${stats.totalLines} linhas`);
      
      // Limpar arquivo após processamento
      this.cleanupFile(filePath);
      
      return { phones: uniquePhones, stats };
      
    } catch (error) {
      console.error('❌ Erro ao processar arquivo WhatsApp:', error);
      this.cleanupFile(filePath);
      throw new Error('Erro ao processar arquivo de telefones WhatsApp');
    }
  }
  
  // SANITIZAR TELEFONE (remover caracteres especiais)
  static sanitizePhone(input: string): string {
    // Remover tudo exceto números
    let phone = input.replace(/[^\d]/g, '');
    
    // Remover zeros à esquerda exceto se for código do país
    if (phone.startsWith('0') && phone.length > 10) {
      phone = phone.substring(1);
    }
    
    // Adicionar código do país Brasil se não tiver
    if (phone.length === 10 || phone.length === 11) {
      phone = '55' + phone;
    }
    
    return phone;
  }
  
  // VALIDAR TELEFONE PARA SMS
  static validatePhone(phone: string): boolean {
    // Telefone brasileiro com DDD: 5511999887766 (13 dígitos)
    // Ou telefone internacional válido: 10-15 dígitos
    const brazilianPattern = /^55\d{10,11}$/; // Brasil
    const internationalPattern = /^\d{10,15}$/; // Internacional
    
    return brazilianPattern.test(phone) || internationalPattern.test(phone);
  }
  
  // VALIDAR TELEFONE PARA WHATSAPP
  static validateWhatsAppPhone(phone: string): boolean {
    // WhatsApp aceita formatos similares ao SMS
    // Mas é mais restritivo com números válidos
    const brazilianPattern = /^55\d{10,11}$/;
    const internationalPattern = /^\d{10,15}$/;
    
    if (!brazilianPattern.test(phone) && !internationalPattern.test(phone)) {
      return false;
    }
    
    // Validações específicas do WhatsApp
    if (phone.startsWith('55')) {
      // Telefone brasileiro
      const localNumber = phone.substring(2);
      
      // Deve ter 10 ou 11 dígitos locais
      if (localNumber.length !== 10 && localNumber.length !== 11) {
        return false;
      }
      
      // Se tem 11 dígitos, o primeiro deve ser 9 (celular)
      if (localNumber.length === 11 && !localNumber.startsWith('9')) {
        return false;
      }
      
      // DDD válido (11-99)
      const ddd = parseInt(localNumber.substring(0, 2));
      if (ddd < 11 || ddd > 99) {
        return false;
      }
    }
    
    return true;
  }
  
  // LIMPAR ARQUIVO APÓS PROCESSAMENTO
  static cleanupFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🧹 Arquivo limpo: ${filePath}`);
      }
    } catch (error) {
      console.error('⚠️ Erro ao limpar arquivo:', error);
    }
  }
  
  // VALIDAR TAMANHO E CONTEÚDO DO ARQUIVO
  static validateFileContent(filePath: string): { isValid: boolean, error?: string, lineCount?: number } {
    try {
      const stats = fs.statSync(filePath);
      
      // Verificar tamanho (máximo 5MB)
      if (stats.size > 5 * 1024 * 1024) {
        return { isValid: false, error: 'Arquivo muito grande (máximo 5MB)' };
      }
      
      // Verificar se é arquivo vazio
      if (stats.size === 0) {
        return { isValid: false, error: 'Arquivo vazio' };
      }
      
      // Contar linhas
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      
      // Verificar número de linhas (máximo 10.000 para performance)
      if (lines.length > 10000) {
        return { isValid: false, error: 'Máximo 10.000 telefones por arquivo' };
      }
      
      if (lines.length === 0) {
        return { isValid: false, error: 'Arquivo não contém telefones válidos' };
      }
      
      return { isValid: true, lineCount: lines.length };
      
    } catch (error) {
      return { isValid: false, error: 'Erro ao validar arquivo' };
    }
  }
  
  // OBTER ESTATÍSTICAS DETALHADAS
  static getDetailedStats(phones: string[]): any {
    const stats = {
      total: phones.length,
      brazilian: 0,
      international: 0,
      mobile: 0,
      landline: 0,
      regions: new Map<string, number>()
    };
    
    phones.forEach(phone => {
      if (phone.startsWith('55')) {
        stats.brazilian++;
        const localNumber = phone.substring(2);
        const ddd = localNumber.substring(0, 2);
        
        // Contar por região (DDD)
        const currentCount = stats.regions.get(ddd) || 0;
        stats.regions.set(ddd, currentCount + 1);
        
        // Identificar se é celular ou fixo
        if (localNumber.length === 11 && localNumber.startsWith('9')) {
          stats.mobile++;
        } else {
          stats.landline++;
        }
      } else {
        stats.international++;
      }
    });
    
    return {
      ...stats,
      regions: Object.fromEntries(stats.regions)
    };
  }
}