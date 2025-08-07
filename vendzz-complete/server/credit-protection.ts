/**
 * SISTEMA DE PROTEÇÃO ANTI-BURLA DE CRÉDITOS
 * Sistema robusto para prevenir fraudes e manipulações no sistema de créditos
 */

import { storage } from './storage-sqlite';
import { nanoid } from 'nanoid';

export interface CreditValidation {
  valid: boolean;
  error?: string;
  remaining: number;
  userPlan: string;
  rateLimit?: boolean;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'sms' | 'email' | 'whatsapp' | 'ai' | 'video';
  amount: number;
  operation: 'add' | 'subtract';
  reason: string;
  metadata?: any;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

export class CreditProtectionSystem {
  private static instance: CreditProtectionSystem;
  private transactionLog: Map<string, CreditTransaction[]> = new Map();
  private rateLimitCache: Map<string, number[]> = new Map();
  
  static getInstance(): CreditProtectionSystem {
    if (!CreditProtectionSystem.instance) {
      CreditProtectionSystem.instance = new CreditProtectionSystem();
    }
    return CreditProtectionSystem.instance;
  }

  /**
   * VALIDAÇÃO RIGOROSA DE CRÉDITOS ANTES DE USAR
   */
  async validateCreditsBeforeUse(
    userId: string, 
    type: 'sms' | 'email' | 'whatsapp' | 'ai' | 'video',
    amount: number = 1,
    ip?: string,
    userAgent?: string
  ): Promise<CreditValidation> {
    try {
      // 1. Verificar se usuário existe e não está bloqueado
      const user = await storage.getUser(userId);
      if (!user) {
        return { valid: false, error: 'Usuário não encontrado', remaining: 0, userPlan: 'none' };
      }

      if (user.isBlocked) {
        return { 
          valid: false, 
          error: `Conta bloqueada: ${user.blockReason}`, 
          remaining: 0, 
          userPlan: user.plan || 'free' 
        };
      }

      // 2. Verificar expiração de plano
      if (user.planExpiresAt && new Date() > new Date(user.planExpiresAt)) {
        return { 
          valid: false, 
          error: 'Plano expirado - renovação necessária', 
          remaining: 0, 
          userPlan: user.plan || 'free' 
        };
      }

      // 3. Verificar rate limiting (prevenir spam)
      const rateLimitCheck = this.checkRateLimit(userId, type, ip);
      if (!rateLimitCheck.valid) {
        return { 
          valid: false, 
          error: 'Limite de taxa excedido - aguarde alguns minutos', 
          remaining: 0, 
          userPlan: user.plan || 'free',
          rateLimit: true 
        };
      }

      // 4. Verificar créditos disponíveis
      const currentCredits = this.getCurrentCredits(user, type);
      if (currentCredits < amount) {
        return { 
          valid: false, 
          error: `Créditos insuficientes. Disponível: ${currentCredits}, Necessário: ${amount}`, 
          remaining: currentCredits, 
          userPlan: user.plan || 'free' 
        };
      }

      // 5. Verificar limites do plano
      const planLimits = this.getPlanLimits(user.plan || 'free');
      const usageToday = await this.getTodayUsage(userId, type);
      
      if (usageToday + amount > planLimits[type]) {
        return { 
          valid: false, 
          error: `Limite diário do plano excedido. Limite: ${planLimits[type]}, Uso hoje: ${usageToday}`, 
          remaining: currentCredits, 
          userPlan: user.plan || 'free' 
        };
      }

      // 6. Validação adicional para comportamento suspeito
      const suspiciousActivity = await this.detectSuspiciousActivity(userId, type, amount, ip, userAgent);
      if (suspiciousActivity.detected) {
        return { 
          valid: false, 
          error: `Atividade suspeita detectada: ${suspiciousActivity.reason}`, 
          remaining: currentCredits, 
          userPlan: user.plan || 'free' 
        };
      }

      return { 
        valid: true, 
        remaining: currentCredits - amount, 
        userPlan: user.plan || 'free' 
      };

    } catch (error) {
      console.error('❌ Erro na validação de créditos:', error);
      return { valid: false, error: 'Erro interno na validação', remaining: 0, userPlan: 'free' };
    }
  }

  /**
   * DÉBITO SEGURO DE CRÉDITOS COM AUDITORIA
   */
  async debitCreditsSecurely(
    userId: string, 
    type: 'sms' | 'email' | 'whatsapp' | 'ai' | 'video',
    amount: number,
    reason: string,
    metadata?: any,
    ip?: string,
    userAgent?: string
  ): Promise<boolean> {
    try {
      // Validar antes de debitar
      const validation = await this.validateCreditsBeforeUse(userId, type, amount, ip, userAgent);
      if (!validation.valid) {
        console.log(`❌ Débito rejeitado para ${userId}: ${validation.error}`);
        return false;
      }

      // Executar débito
      const user = await storage.getUser(userId);
      const currentCredits = this.getCurrentCredits(user, type);
      const newCredits = currentCredits - amount;

      // Atualizar créditos no banco
      const updateData = { [`${type}Credits`]: newCredits };
      await storage.updateUser(userId, updateData);

      // Registrar transação para auditoria
      const transaction: CreditTransaction = {
        id: nanoid(),
        userId,
        type,
        amount,
        operation: 'subtract',
        reason,
        metadata,
        timestamp: new Date(),
        ip,
        userAgent
      };

      await this.logTransaction(transaction);

      console.log(`✅ Débito realizado: ${amount} créditos ${type} para ${userId}. Restam: ${newCredits}`);
      return true;

    } catch (error) {
      console.error('❌ Erro no débito de créditos:', error);
      return false;
    }
  }

  /**
   * ADIÇÃO SEGURA DE CRÉDITOS (APENAS ADMIN OU COMPRA)
   */
  async addCreditsSecurely(
    userId: string, 
    type: 'sms' | 'email' | 'whatsapp' | 'ai' | 'video',
    amount: number,
    reason: string,
    adminId?: string,
    stripePaymentId?: string,
    metadata?: any
  ): Promise<boolean> {
    try {
      // Validar que apenas admin ou sistema pode adicionar créditos
      if (!adminId && !stripePaymentId) {
        console.log('❌ Tentativa não autorizada de adicionar créditos');
        return false;
      }

      const user = await storage.getUser(userId);
      if (!user) {
        console.log('❌ Usuário não encontrado para adicionar créditos');
        return false;
      }

      const currentCredits = this.getCurrentCredits(user, type);
      const newCredits = currentCredits + amount;

      // Atualizar créditos no banco
      const updateData = { [`${type}Credits`]: newCredits };
      await storage.updateUser(userId, updateData);

      // Registrar transação para auditoria
      const transaction: CreditTransaction = {
        id: nanoid(),
        userId,
        type,
        amount,
        operation: 'add',
        reason,
        metadata: {
          ...metadata,
          adminId,
          stripePaymentId
        },
        timestamp: new Date()
      };

      await this.logTransaction(transaction);

      console.log(`✅ Créditos adicionados: ${amount} créditos ${type} para ${userId}. Total: ${newCredits}`);
      
      // 🔄 INTEGRAÇÃO COM SISTEMA DE REATIVAÇÃO AUTOMÁTICA
      try {
        const { campaignAutoPauseSystem } = await import('./campaign-auto-pause-system');
        await campaignAutoPauseSystem.checkCampaignsAfterCreditAddition(userId, type);
        console.log(`▶️ Sistema de reativação automática executado para ${type} créditos (via proteção)`);
      } catch (error) {
        console.error('⚠️ Erro no sistema de reativação automática:', error);
        // Não bloquear a operação se o sistema de reativação falhar
      }
      
      return true;

    } catch (error) {
      console.error('❌ Erro ao adicionar créditos:', error);
      return false;
    }
  }

  /**
   * VERIFICAÇÃO DE RATE LIMITING
   */
  private checkRateLimit(userId: string, type: string, ip?: string): { valid: boolean; error?: string } {
    const key = `${userId}_${type}`;
    const now = Date.now();
    const timeWindow = 60000; // 1 minuto
    const maxRequests = this.getRateLimitByType(type);

    if (!this.rateLimitCache.has(key)) {
      this.rateLimitCache.set(key, []);
    }

    const requests = this.rateLimitCache.get(key)!;
    
    // Limpar requests antigos
    const validRequests = requests.filter(time => now - time < timeWindow);
    
    if (validRequests.length >= maxRequests) {
      return { valid: false, error: `Limite de ${maxRequests} requisições por minuto excedido` };
    }

    // Adicionar nova requisição
    validRequests.push(now);
    this.rateLimitCache.set(key, validRequests);

    return { valid: true };
  }

  /**
   * DETECÇÃO DE ATIVIDADE SUSPEITA
   */
  private async detectSuspiciousActivity(
    userId: string, 
    type: string, 
    amount: number, 
    ip?: string, 
    userAgent?: string
  ): Promise<{ detected: boolean; reason?: string }> {
    try {
      // Verificar múltiplas requisições do mesmo IP
      if (ip) {
        const recentTransactions = await this.getRecentTransactions(userId, 300000); // 5 minutos
        const sameIpCount = recentTransactions.filter(t => t.ip === ip).length;
        
        if (sameIpCount > 10) {
          return { detected: true, reason: 'Múltiplas requisições do mesmo IP' };
        }
      }

      // Verificar padrões anômalos de uso
      const recentUsage = await this.getRecentTransactions(userId, 3600000); // 1 hora
      if (recentUsage.length > 100) {
        return { detected: true, reason: 'Uso excessivo em pouco tempo' };
      }

      // Verificar se user agent está suspeito
      if (userAgent && (userAgent.includes('bot') || userAgent.includes('crawler') || userAgent.length < 10)) {
        return { detected: true, reason: 'User agent suspeito' };
      }

      return { detected: false };

    } catch (error) {
      console.error('❌ Erro na detecção de atividade suspeita:', error);
      return { detected: false };
    }
  }

  /**
   * MÉTODOS AUXILIARES
   */
  private getCurrentCredits(user: any, type: string): number {
    switch (type) {
      case 'sms': return user.smsCredits || 0;
      case 'email': return user.emailCredits || 0;
      case 'whatsapp': return user.whatsappCredits || 0;
      case 'ai': return user.aiCredits || 0;
      case 'video': return user.videoCredits || 0;
      default: return 0;
    }
  }

  private getPlanLimits(plan: string): Record<string, number> {
    const limits = {
      'free': { sms: 50, email: 100, whatsapp: 25, ai: 10, video: 5 },
      'basic': { sms: 500, email: 1000, whatsapp: 250, ai: 50, video: 20 },
      'premium': { sms: 2500, email: 5000, whatsapp: 1000, ai: 200, video: 100 },
      'enterprise': { sms: 10000, email: 20000, whatsapp: 5000, ai: 1000, video: 500 }
    };

    return limits[plan] || limits['free'];
  }

  private getRateLimitByType(type: string): number {
    const limits = {
      'sms': 10,      // 10 SMS por minuto
      'email': 20,    // 20 emails por minuto
      'whatsapp': 5,  // 5 WhatsApp por minuto
      'ai': 3,        // 3 IA por minuto
      'video': 1      // 1 vídeo por minuto
    };

    return limits[type] || 1;
  }

  private async getTodayUsage(userId: string, type: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const transactions = this.transactionLog.get(userId) || [];
    const todayTransactions = transactions.filter(t => 
      t.timestamp >= today && 
      t.type === type && 
      t.operation === 'subtract'
    );

    return todayTransactions.reduce((sum, t) => sum + t.amount, 0);
  }

  private async getRecentTransactions(userId: string, timeWindow: number): Promise<CreditTransaction[]> {
    const now = Date.now();
    const transactions = this.transactionLog.get(userId) || [];
    
    return transactions.filter(t => now - t.timestamp.getTime() < timeWindow);
  }

  private async logTransaction(transaction: CreditTransaction): Promise<void> {
    if (!this.transactionLog.has(transaction.userId)) {
      this.transactionLog.set(transaction.userId, []);
    }

    const userTransactions = this.transactionLog.get(transaction.userId)!;
    userTransactions.push(transaction);

    // Manter apenas últimas 1000 transações por usuário
    if (userTransactions.length > 1000) {
      userTransactions.splice(0, userTransactions.length - 1000);
    }

    // Salvar no banco para auditoria permanente
    try {
      await storage.logCreditTransaction(transaction);
    } catch (error) {
      console.error('❌ Erro ao salvar transação:', error);
    }
  }

  /**
   * RELATÓRIO DE AUDITORIA
   */
  async generateAuditReport(userId: string, days: number = 30): Promise<any> {
    try {
      const transactions = this.transactionLog.get(userId) || [];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const relevantTransactions = transactions.filter(t => t.timestamp >= cutoffDate);

      const report = {
        userId,
        period: `${days} dias`,
        totalTransactions: relevantTransactions.length,
        creditsSummary: {
          sms: { added: 0, used: 0, net: 0 },
          email: { added: 0, used: 0, net: 0 },
          whatsapp: { added: 0, used: 0, net: 0 },
          ai: { added: 0, used: 0, net: 0 },
          video: { added: 0, used: 0, net: 0 }
        },
        suspiciousActivity: [],
        generatedAt: new Date()
      };

      // Calcular estatísticas
      relevantTransactions.forEach(t => {
        const summary = report.creditsSummary[t.type];
        if (t.operation === 'add') {
          summary.added += t.amount;
        } else {
          summary.used += t.amount;
        }
        summary.net = summary.added - summary.used;
      });

      return report;

    } catch (error) {
      console.error('❌ Erro ao gerar relatório de auditoria:', error);
      return null;
    }
  }
}

// Instância singleton
export const creditProtection = CreditProtectionSystem.getInstance();