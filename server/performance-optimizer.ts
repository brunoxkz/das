/**
 * SISTEMA DE OTIMIZAÇÃO DE PERFORMANCE PARA 100.000+ USUÁRIOS SIMULTÂNEOS
 * 
 * Este módulo otimiza o sistema de detecção automática de leads
 * mantendo total compatibilidade com todas as funcionalidades existentes
 */

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private detectionCount = 0;
  private readonly MAX_DETECTION_CYCLES = 60; // Limite por hora
  private readonly MAX_CAMPAIGNS_PER_CYCLE = 20; // Máximo 20 campanhas por ciclo
  private readonly BATCH_SIZE = 3; // Processar 3 campanhas por vez
  private readonly BATCH_DELAY = 300; // 300ms entre lotes
  private readonly CYCLE_INTERVAL = 60000; // 1 minuto entre ciclos

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Otimiza uma lista de campanhas aplicando limites inteligentes
   */
  optimizeCampaignList<T>(campaigns: T[], type: string): T[] {
    if (campaigns.length <= this.MAX_CAMPAIGNS_PER_CYCLE) {
      return campaigns;
    }

    // Distribuir campanhas ao longo dos ciclos
    const cycleIndex = this.detectionCount % Math.ceil(campaigns.length / this.MAX_CAMPAIGNS_PER_CYCLE);
    const startIndex = cycleIndex * this.MAX_CAMPAIGNS_PER_CYCLE;
    const endIndex = Math.min(startIndex + this.MAX_CAMPAIGNS_PER_CYCLE, campaigns.length);
    
    const optimized = campaigns.slice(startIndex, endIndex);
    console.log(`🔧 OTIMIZAÇÃO ${type}: ${optimized.length}/${campaigns.length} campanhas (ciclo ${cycleIndex + 1})`);
    
    return optimized;
  }

  /**
   * Processa campanhas em lotes com delay para evitar sobrecarga
   */
  async processCampaignsInBatches<T>(
    campaigns: T[], 
    processor: (campaign: T) => Promise<void>,
    type: string
  ): Promise<void> {
    for (let i = 0; i < campaigns.length; i += this.BATCH_SIZE) {
      const batch = campaigns.slice(i, i + this.BATCH_SIZE);
      const batchNumber = Math.floor(i / this.BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(campaigns.length / this.BATCH_SIZE);
      
      console.log(`⚡ PROCESSANDO LOTE ${type} ${batchNumber}/${totalBatches}: ${batch.length} campanhas`);
      
      // Processar lote em paralelo
      await Promise.all(batch.map(campaign => 
        processor(campaign).catch(error => {
          console.error(`❌ ERRO na campanha ${type}:`, error.message);
        })
      ));
      
      // Delay entre lotes apenas se não for o último
      if (i + this.BATCH_SIZE < campaigns.length) {
        await this.delay(this.BATCH_DELAY);
      }
    }
  }

  /**
   * Verifica se pode executar um novo ciclo de detecção
   */
  canRunDetectionCycle(): boolean {
    return this.detectionCount < this.MAX_DETECTION_CYCLES;
  }

  /**
   * Incrementa contador de ciclos
   */
  incrementDetectionCount(): void {
    this.detectionCount++;
  }

  /**
   * Reset contador de ciclos (chamado a cada hora)
   */
  resetDetectionCount(): void {
    console.log(`🔄 RESET CONTADOR DETECÇÃO: ${this.detectionCount}/${this.MAX_DETECTION_CYCLES} ciclos executados na última hora`);
    this.detectionCount = 0;
  }

  /**
   * Obtém estatísticas de performance
   */
  getPerformanceStats(): {
    currentCycles: number;
    maxCycles: number;
    utilizationPercentage: number;
    cycleInterval: number;
    maxCampaignsPerCycle: number;
    batchSize: number;
  } {
    return {
      currentCycles: this.detectionCount,
      maxCycles: this.MAX_DETECTION_CYCLES,
      utilizationPercentage: Math.round((this.detectionCount / this.MAX_DETECTION_CYCLES) * 100),
      cycleInterval: this.CYCLE_INTERVAL,
      maxCampaignsPerCycle: this.MAX_CAMPAIGNS_PER_CYCLE,
      batchSize: this.BATCH_SIZE
    };
  }

  /**
   * Delay auxiliar
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validação de performance para grandes volumes
   */
  validatePerformanceConstraints(
    smsCampaigns: any[], 
    whatsappCampaigns: any[], 
    emailCampaigns: any[]
  ): {
    isOptimal: boolean;
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const totalCampaigns = smsCampaigns.length + whatsappCampaigns.length + emailCampaigns.length;

    if (totalCampaigns > 100) {
      warnings.push(`⚠️ ALTO VOLUME: ${totalCampaigns} campanhas ativas`);
      recommendations.push('Considere pausar campanhas inativas');
    }

    if (smsCampaigns.length > 50) {
      warnings.push(`⚠️ SMS: ${smsCampaigns.length} campanhas (limite recomendado: 50)`);
    }

    if (whatsappCampaigns.length > 30) {
      warnings.push(`⚠️ WhatsApp: ${whatsappCampaigns.length} campanhas (limite recomendado: 30)`);
    }

    if (emailCampaigns.length > 40) {
      warnings.push(`⚠️ Email: ${emailCampaigns.length} campanhas (limite recomendado: 40)`);
    }

    const isOptimal = warnings.length === 0;

    return { isOptimal, warnings, recommendations };
  }
}

/**
 * Configurações de otimização para diferentes cenários de carga
 */
export const PERFORMANCE_CONFIGS = {
  // Configuração para até 1.000 usuários simultâneos
  LOW_LOAD: {
    detectionInterval: 30000, // 30 segundos
    maxCampaignsPerCycle: 50,
    batchSize: 5,
    batchDelay: 100
  },
  
  // Configuração para até 10.000 usuários simultâneos
  MEDIUM_LOAD: {
    detectionInterval: 45000, // 45 segundos
    maxCampaignsPerCycle: 30,
    batchSize: 4,
    batchDelay: 200
  },
  
  // Configuração para até 100.000+ usuários simultâneos
  HIGH_LOAD: {
    detectionInterval: 60000, // 1 minuto
    maxCampaignsPerCycle: 20,
    batchSize: 3,
    batchDelay: 300
  }
};

export default PerformanceOptimizer;