
import { storage } from './storage-sqlite';
import type { CloakerConfig } from './cloaker';

export interface QuizCloakerSettings extends CloakerConfig {
  quizId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

class CloakerStorage {
  // Configuração padrão
  private getDefaultConfig(): CloakerConfig {
    return {
      isEnabled: false,
      requiredUTMParams: ['utm_source', 'utm_campaign'],
      blockAdLibrary: true,
      blockDirectAccess: true,
      blockPage: 'maintenance',
      customBlockMessage: '',
      whitelistedIPs: [],
      maxAttemptsPerIP: 5,
      blockDuration: 30 // 30 minutos
    };
  }

  // Salvar configuração do cloaker para um quiz
  async saveCloakerConfig(quizId: string, userId: string, config: Partial<CloakerConfig>): Promise<QuizCloakerSettings> {
    const fullConfig = { ...this.getDefaultConfig(), ...config };
    
    const settings: QuizCloakerSettings = {
      quizId,
      userId,
      ...fullConfig,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Simular armazenamento (em produção, usar SQLite)
    const key = `cloaker_${quizId}`;
    const data = JSON.stringify(settings);
    
    // Por enquanto, usar cache como storage temporário
    const { cache } = await import('./cache');
    cache.set(key, data, 24 * 60 * 60); // 24 horas
    
    return settings;
  }

  // Obter configuração do cloaker para um quiz
  async getCloakerConfig(quizId: string): Promise<CloakerConfig> {
    const key = `cloaker_${quizId}`;
    const { cache } = await import('./cache');
    const data = cache.get(key);
    
    if (data) {
      try {
        const settings: QuizCloakerSettings = JSON.parse(data);
        const { quizId: _, userId: __, createdAt: ___, updatedAt: ____, ...config } = settings;
        return config;
      } catch (error) {
        console.error('Error parsing cloaker config:', error);
      }
    }
    
    return this.getDefaultConfig();
  }

  // Listar todos os quizzes com cloaker ativo
  async getActiveCloackers(userId: string): Promise<QuizCloakerSettings[]> {
    // Simular busca (em produção, usar consulta SQL)
    const userQuizzes = await storage.getUserQuizzes(userId);
    const activeCloackers: QuizCloakerSettings[] = [];
    
    for (const quiz of userQuizzes) {
      const config = await this.getCloakerConfig(quiz.id);
      if (config.isEnabled) {
        activeCloackers.push({
          quizId: quiz.id,
          userId,
          ...config,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    
    return activeCloackers;
  }

  // Remover configuração do cloaker
  async removeCloakerConfig(quizId: string): Promise<void> {
    const key = `cloaker_${quizId}`;
    const { cache } = await import('./cache');
    cache.del(key);
  }

  // Verificar se quiz tem cloaker ativo
  async isQuizProtected(quizId: string): Promise<boolean> {
    const config = await this.getCloakerConfig(quizId);
    return config.isEnabled;
  }

  // Atualizar configuração
  async updateCloakerConfig(quizId: string, userId: string, updates: Partial<CloakerConfig>): Promise<QuizCloakerSettings> {
    const currentConfig = await this.getCloakerConfig(quizId);
    const newConfig = { ...currentConfig, ...updates };
    return this.saveCloakerConfig(quizId, userId, newConfig);
  }

  // Obter estatísticas de uso
  async getCloakerUsageStats(userId: string) {
    const activeCloackers = await this.getActiveCloackers(userId);
    const userQuizzes = await storage.getUserQuizzes(userId);
    
    return {
      totalQuizzes: userQuizzes.length,
      protectedQuizzes: activeCloackers.length,
      protectionRate: userQuizzes.length > 0 ? (activeCloackers.length / userQuizzes.length * 100) : 0,
      activeCloackers: activeCloackers.map(c => ({
        quizId: c.quizId,
        quizTitle: userQuizzes.find(q => q.id === c.quizId)?.title || 'Quiz não encontrado',
        isEnabled: c.isEnabled,
        blockAdLibrary: c.blockAdLibrary,
        requiredUTMParams: c.requiredUTMParams
      }))
    };
  }
}

export const cloakerStorage = new CloakerStorage();
