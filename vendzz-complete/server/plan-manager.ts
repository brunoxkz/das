import { db } from './db-sqlite';
import { users } from '../shared/schema-sqlite';
import { eq } from 'drizzle-orm';

/**
 * Sistema Automático de Gerenciamento de Planos
 * - Regressão automática de dias de plano
 * - Bloqueio de funcionalidades quando expirado
 * - Mensagens de renovação nos funis
 * - Restauração automática após renovação
 */
export class PlanManager {
  private static instance: PlanManager;
  private intervalId: NodeJS.Timeout | null = null;

  static getInstance(): PlanManager {
    if (!PlanManager.instance) {
      PlanManager.instance = new PlanManager();
    }
    return PlanManager.instance;
  }

  /**
   * Inicializa o sistema de regressão automática
   * Executa a cada 1 hora verificando todos os usuários
   */
  startAutomaticPlanRegression() {
    console.log('🚀 INICIANDO SISTEMA DE REGRESSÃO AUTOMÁTICA DE PLANOS');
    
    // Executar imediatamente uma vez
    this.processAllUserPlans();
    
    // Executar a cada 1 hora (3600000ms)
    this.intervalId = setInterval(() => {
      this.processAllUserPlans();
    }, 3600000);
  }

  /**
   * Para o sistema automático
   */
  stopAutomaticPlanRegression() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Sistema de regressão automática parado');
    }
  }

  /**
   * Processa todos os usuários verificando expiração
   */
  private async processAllUserPlans() {
    try {
      console.log('⏰ VERIFICANDO EXPIRAÇÃO DE PLANOS DE TODOS OS USUÁRIOS');
      
      const allUsers = await db.select().from(users);
      let expiredCount = 0;
      let blockedCount = 0;
      
      for (const user of allUsers) {
        // Pular admin
        if (user.role === 'admin') continue;
        
        await this.checkAndUpdateUserPlan(user);
        
        if (user.isBlocked) blockedCount++;
        if (user.planExpiresAt && new Date() > new Date(user.planExpiresAt)) {
          expiredCount++;
        }
      }
      
      console.log(`📊 RESULTADO: ${allUsers.length} usuários processados, ${expiredCount} expirados, ${blockedCount} bloqueados`);
      
    } catch (error) {
      console.error('❌ Erro ao processar planos de usuários:', error);
    }
  }

  /**
   * Verifica e atualiza o plano de um usuário específico
   */
  async checkAndUpdateUserPlan(user: any) {
    try {
      const now = new Date();
      
      // Se usuário não tem data de expiração, criar uma (30 dias a partir de agora)
      if (!user.planExpiresAt && user.plan !== 'free') {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        
        await db.update(users)
          .set({ planExpiresAt: expirationDate })
          .where(eq(users.id, user.id));
          
        console.log(`📅 Data de expiração criada para usuário ${user.id}: ${expirationDate.toISOString()}`);
        return;
      }
      
      // Verificar se plano expirou
      if (user.planExpiresAt) {
        const expirationDate = new Date(user.planExpiresAt);
        
        if (now > expirationDate && !user.isBlocked) {
          // Plano expirou - BLOQUEAR USUÁRIO
          await this.blockUser(user.id, 'Plano expirado - Renovação necessária');
          console.log(`🔒 USUÁRIO BLOQUEADO: ${user.id} - Plano expirado em ${expirationDate.toISOString()}`);
          
        } else if (now <= expirationDate && user.isBlocked && user.planRenewalRequired) {
          // Plano foi renovado - DESBLOQUEAR USUÁRIO
          await this.unblockUser(user.id);
          console.log(`🔓 USUÁRIO DESBLOQUEADO: ${user.id} - Plano renovado`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Erro ao verificar plano do usuário ${user.id}:`, error);
    }
  }

  /**
   * Bloqueia um usuário por expiração de plano
   */
  private async blockUser(userId: string, reason: string) {
    await db.update(users)
      .set({
        isBlocked: true,
        planRenewalRequired: true,
        blockReason: reason,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  /**
   * Desbloqueia um usuário após renovação
   */
  private async unblockUser(userId: string) {
    await db.update(users)
      .set({
        isBlocked: false,
        planRenewalRequired: false,
        blockReason: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  /**
   * Calcula dias restantes do plano
   */
  getDaysRemaining(planExpiresAt: Date | string | null): number {
    if (!planExpiresAt) return 0;
    
    const now = new Date();
    const expiration = new Date(planExpiresAt);
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  /**
   * Renova plano de um usuário
   */
  async renewUserPlan(userId: string, daysToAdd: number = 30) {
    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user.length) {
        throw new Error('Usuário não encontrado');
      }

      const currentUser = user[0];
      const now = new Date();
      
      // Se plano já expirou, começar a partir de agora
      // Se ainda está válido, adicionar ao tempo restante
      let newExpirationDate: Date;
      
      if (currentUser.planExpiresAt && new Date(currentUser.planExpiresAt) > now) {
        // Plano ainda válido - adicionar dias
        newExpirationDate = new Date(currentUser.planExpiresAt);
        newExpirationDate.setDate(newExpirationDate.getDate() + daysToAdd);
      } else {
        // Plano expirado ou não existe - começar de agora
        newExpirationDate = new Date();
        newExpirationDate.setDate(newExpirationDate.getDate() + daysToAdd);
      }

      await db.update(users)
        .set({
          planExpiresAt: newExpirationDate,
          isBlocked: false,
          planRenewalRequired: false,
          blockReason: null,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      console.log(`✅ PLANO RENOVADO: Usuário ${userId} até ${newExpirationDate.toISOString()}`);
      
      return {
        success: true,
        newExpirationDate: newExpirationDate.toISOString(),
        daysAdded: daysToAdd
      };
      
    } catch (error) {
      console.error('❌ Erro ao renovar plano:', error);
      throw error;
    }
  }

  /**
   * Obtém status do plano para exibição no dashboard
   */
  async getPlanStatus(userId: string) {
    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user.length) {
        return null;
      }

      const currentUser = user[0];
      const daysRemaining = this.getDaysRemaining(currentUser.planExpiresAt);
      
      return {
        plan: currentUser.plan || 'free',
        daysRemaining,
        isBlocked: currentUser.isBlocked,
        planRenewalRequired: currentUser.planRenewalRequired,
        blockReason: currentUser.blockReason,
        planExpiresAt: currentUser.planExpiresAt?.toISOString() || null
      };
      
    } catch (error) {
      console.error('❌ Erro ao obter status do plano:', error);
      return null;
    }
  }
}

// Export singleton instance
export const planManager = PlanManager.getInstance();