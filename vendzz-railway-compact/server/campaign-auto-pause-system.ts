/**
 * 🚨 SISTEMA AUTOMÁTICO DE PAUSE/RESUME DE CAMPANHAS
 * 
 * Sistema que:
 * 1. Pausa campanhas automaticamente quando créditos acabam
 * 2. Reativa campanhas quando novos créditos são adicionados
 * 3. Previne burla do sistema de créditos
 * 4. Monitora e valida continuamente o status das campanhas
 */

import { storage } from './storage-sqlite';
import { creditProtection } from './credit-protection';

export interface CampaignPauseResult {
  paused: number;
  reactivated: number;
  errors: string[];
  timestamp: Date;
}

export class CampaignAutoPauseSystem {
  private static instance: CampaignAutoPauseSystem;
  private isRunning = false;
  
  // Configurações do sistema
  private readonly CONFIG = {
    CHECK_INTERVAL: 30000, // 30 segundos
    BATCH_SIZE: 50, // Processar 50 campanhas por vez
    MAX_RETRIES: 3,
    TIMEOUT: 10000, // 10 segundos timeout
  };

  public static getInstance(): CampaignAutoPauseSystem {
    if (!CampaignAutoPauseSystem.instance) {
      CampaignAutoPauseSystem.instance = new CampaignAutoPauseSystem();
    }
    return CampaignAutoPauseSystem.instance;
  }

  /**
   * INICIAR SISTEMA DE MONITORAMENTO
   */
  public startMonitoring(): void {
    if (this.isRunning) {
      console.log('🔄 Sistema de pause automático já está rodando');
      return;
    }

    this.isRunning = true;
    console.log('🚀 INICIANDO SISTEMA DE PAUSE AUTOMÁTICO DE CAMPANHAS');
    
    // Executar verificação imediatamente
    this.checkAllCampaigns();
    
    // Executar verificação periodicamente
    setInterval(() => {
      this.checkAllCampaigns();
    }, this.CONFIG.CHECK_INTERVAL);
  }

  /**
   * VERIFICAR TODAS AS CAMPANHAS ATIVAS
   */
  private async checkAllCampaigns(): Promise<void> {
    try {
      console.log('🔍 VERIFICANDO CAMPANHAS PARA PAUSE/RESUME AUTOMÁTICO');
      
      // Buscar todos os usuários com campanhas ativas
      const activeUsers = await storage.getUsersWithActiveCampaigns();
      
      if (activeUsers.length === 0) {
        console.log('✅ Nenhuma campanha ativa encontrada');
        return;
      }

      console.log(`👥 Verificando ${activeUsers.length} usuários com campanhas ativas`);
      
      // Processar usuários em lotes
      for (let i = 0; i < activeUsers.length; i += this.CONFIG.BATCH_SIZE) {
        const batch = activeUsers.slice(i, i + this.CONFIG.BATCH_SIZE);
        
        await Promise.allSettled(batch.map(user => 
          this.processUserCampaigns(user.id, user.email || user.id)
        ));
        
        // Delay pequeno entre lotes
        if (i + this.CONFIG.BATCH_SIZE < activeUsers.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
    } catch (error) {
      console.error('❌ Erro na verificação geral de campanhas:', error);
    }
  }

  /**
   * PROCESSAR CAMPANHAS DE UM USUÁRIO ESPECÍFICO
   */
  private async processUserCampaigns(userId: string, userEmail: string): Promise<CampaignPauseResult> {
    const result: CampaignPauseResult = {
      paused: 0,
      reactivated: 0,
      errors: [],
      timestamp: new Date()
    };

    try {
      // Verificar créditos do usuário
      const user = await storage.getUser(userId);
      if (!user) {
        result.errors.push('Usuário não encontrado');
        return result;
      }

      // Verificar se usuário está bloqueado
      if (user.isBlocked) {
        console.log(`🚫 Usuário ${userEmail} está bloqueado - pausando todas as campanhas`);
        await this.pauseAllUserCampaigns(userId, 'Usuário bloqueado');
        return result;
      }

      // Verificar créditos por tipo
      const creditTypes = ['sms', 'email', 'whatsapp'] as const;
      
      for (const type of creditTypes) {
        const credits = this.getUserCredits(user, type);
        const activeCampaigns = await storage.getActiveCampaignsByType(userId, type);
        
        if (credits <= 0 && activeCampaigns.length > 0) {
          // Pausar campanhas sem créditos
          console.log(`⏸️ Pausando ${activeCampaigns.length} campanhas ${type} para ${userEmail} - sem créditos`);
          
          for (const campaign of activeCampaigns) {
            await this.pauseCampaign(campaign.id, type, `Créditos ${type} insuficientes`);
            result.paused++;
          }
        } else if (credits > 0) {
          // Reativar campanhas pausadas por falta de créditos
          const pausedCampaigns = await storage.getPausedCampaignsByType(userId, type);
          const creditPausedCampaigns = pausedCampaigns.filter(c => 
            c.pausedReason && c.pausedReason.includes('insuficientes')
          );
          
          if (creditPausedCampaigns.length > 0) {
            console.log(`▶️ Reativando ${creditPausedCampaigns.length} campanhas ${type} para ${userEmail} - créditos disponíveis`);
            
            for (const campaign of creditPausedCampaigns) {
              await this.resumeCampaign(campaign.id, type, 'Créditos reabastecidos');
              result.reactivated++;
            }
          }
        }
      }

      if (result.paused > 0 || result.reactivated > 0) {
        console.log(`📊 ${userEmail}: ${result.paused} pausadas, ${result.reactivated} reativadas`);
      }

    } catch (error) {
      const errorMsg = `Erro ao processar campanhas do usuário ${userEmail}`;
      console.error(`❌ ${errorMsg}:`, error);
      result.errors.push(errorMsg);
    }

    return result;
  }

  /**
   * PAUSAR CAMPANHA ESPECÍFICA
   */
  private async pauseCampaign(campaignId: string, type: string, reason: string): Promise<void> {
    try {
      switch (type) {
        case 'sms':
          await storage.updateSmsCampaign(campaignId, {
            status: 'paused',
            pausedReason: reason,
            pausedAt: new Date()
          });
          break;
        case 'email':
          await storage.updateEmailCampaign(campaignId, {
            status: 'paused',
            pausedReason: reason,
            pausedAt: new Date()
          });
          break;
        case 'whatsapp':
          await storage.updateWhatsappCampaign(campaignId, {
            status: 'paused',
            pausedReason: reason,
            pausedAt: new Date()
          });
          break;
      }

      console.log(`⏸️ Campanha ${campaignId} (${type}) pausada: ${reason}`);
    } catch (error) {
      console.error(`❌ Erro ao pausar campanha ${campaignId}:`, error);
    }
  }

  /**
   * REATIVAR CAMPANHA ESPECÍFICA
   */
  private async resumeCampaign(campaignId: string, type: string, reason: string): Promise<void> {
    try {
      switch (type) {
        case 'sms':
          await storage.updateSmsCampaign(campaignId, {
            status: 'active',
            pausedReason: null,
            pausedAt: null,
            resumedAt: new Date(),
            resumedReason: reason
          });
          break;
        case 'email':
          await storage.updateEmailCampaign(campaignId, {
            status: 'active',
            pausedReason: null,
            pausedAt: null,
            resumedAt: new Date(),
            resumedReason: reason
          });
          break;
        case 'whatsapp':
          await storage.updateWhatsappCampaign(campaignId, {
            status: 'active',
            pausedReason: null,
            pausedAt: null,
            resumedAt: new Date(),
            resumedReason: reason
          });
          break;
      }

      console.log(`▶️ Campanha ${campaignId} (${type}) reativada: ${reason}`);
    } catch (error) {
      console.error(`❌ Erro ao reativar campanha ${campaignId}:`, error);
    }
  }

  /**
   * PAUSAR TODAS AS CAMPANHAS DE UM USUÁRIO
   */
  private async pauseAllUserCampaigns(userId: string, reason: string): Promise<void> {
    try {
      const smsActive = await storage.getActiveCampaignsByType(userId, 'sms');
      const emailActive = await storage.getActiveCampaignsByType(userId, 'email');
      const whatsappActive = await storage.getActiveCampaignsByType(userId, 'whatsapp');

      const allCampaigns = [
        ...smsActive.map(c => ({ ...c, type: 'sms' })),
        ...emailActive.map(c => ({ ...c, type: 'email' })),
        ...whatsappActive.map(c => ({ ...c, type: 'whatsapp' }))
      ];

      for (const campaign of allCampaigns) {
        await this.pauseCampaign(campaign.id, campaign.type, reason);
      }

      console.log(`🚫 Todas as campanhas do usuário ${userId} pausadas: ${reason}`);
    } catch (error) {
      console.error(`❌ Erro ao pausar todas as campanhas do usuário ${userId}:`, error);
    }
  }

  /**
   * OBTER CRÉDITOS DO USUÁRIO POR TIPO
   */
  private getUserCredits(user: any, type: 'sms' | 'email' | 'whatsapp'): number {
    switch (type) {
      case 'sms':
        return user.smsCredits || 0;
      case 'email':
        return user.emailCredits || 0;
      case 'whatsapp':
        return user.whatsappCredits || 0;
      default:
        return 0;
    }
  }

  /**
   * VERIFICAR CAMPANHAS APÓS ADIÇÃO DE CRÉDITOS
   */
  public async checkCampaignsAfterCreditAddition(userId: string, creditType: string): Promise<void> {
    console.log(`🔄 Verificando campanhas após adição de créditos ${creditType} para usuário ${userId}`);
    
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        console.log('❌ Usuário não encontrado');
        return;
      }

      // Verificar se há campanhas pausadas por falta de créditos
      const pausedCampaigns = await storage.getPausedCampaignsByType(userId, creditType);
      const creditPausedCampaigns = pausedCampaigns.filter(c => 
        c.pausedReason && c.pausedReason.includes('insuficientes')
      );

      if (creditPausedCampaigns.length > 0) {
        console.log(`▶️ Reativando ${creditPausedCampaigns.length} campanhas ${creditType} após adição de créditos`);
        
        for (const campaign of creditPausedCampaigns) {
          await this.resumeCampaign(campaign.id, creditType, 'Créditos reabastecidos automaticamente');
        }
      }

    } catch (error) {
      console.error('❌ Erro ao verificar campanhas após adição de créditos:', error);
    }
  }

  /**
   * PARAR SISTEMA DE MONITORAMENTO
   */
  public stopMonitoring(): void {
    this.isRunning = false;
    console.log('🛑 Sistema de pause automático interrompido');
  }

  /**
   * VERIFICAR STATUS DO SISTEMA
   */
  public isSystemRunning(): boolean {
    return this.isRunning;
  }
}

// Exportar instância singleton
export const campaignAutoPauseSystem = CampaignAutoPauseSystem.getInstance();