// SISTEMA DE DEDUPLICAÇÃO DE QUIZ COMPLETIONS
// Garante que apenas 1 notificação seja enviada por completion real

export class QuizCompletionDeduplicator {
  private static processedCompletions: Set<string> = new Set();
  private static userCompletionTimes: Map<string, number> = new Map();
  
  /**
   * Verifica se uma completion já foi processada
   * Usa múltiplas estratégias anti-duplicata
   */
  static isCompletionAlreadyProcessed(quizId: string, userId: string): boolean {
    const now = Date.now();
    
    // Estratégia 1: Chave única por quiz + user
    const uniqueKey = `${quizId}_${userId}`;
    
    // Estratégia 2: Verificar se user já completou este quiz recentemente (últimos 30 segundos)
    const lastCompletionTime = this.userCompletionTimes.get(uniqueKey);
    if (lastCompletionTime && (now - lastCompletionTime) < 30000) {
      console.log(`🔄 DUPLICATA TEMPORAL: Quiz ${quizId} já processado há ${(now - lastCompletionTime)/1000}s para usuário ${userId} - ignorando`);
      return true;
    }
    
    // Estratégia 3: Verificar se já está na lista de processados
    if (this.processedCompletions.has(uniqueKey)) {
      console.log(`🔄 DUPLICATA DETECTADA: Quiz ${quizId} + User ${userId} já processado - ignorando`);
      return true;
    }
    
    // NOVA COMPLETION: Marcar como processada
    this.processedCompletions.add(uniqueKey);
    this.userCompletionTimes.set(uniqueKey, now);
    
    console.log(`✅ NOVA COMPLETION APROVADA: Quiz ${quizId} para usuário ${userId} será processada`);
    
    // Limpeza automática (manter apenas últimas 1000 entradas)
    if (this.processedCompletions.size > 1000) {
      this.cleanupOldEntries();
    }
    
    return false;
  }
  
  /**
   * Limpa entradas antigas para evitar memory leak
   */
  private static cleanupOldEntries(): void {
    const now = Date.now();
    const expireTime = 60 * 60 * 1000; // 1 hora
    
    // Remover entradas antigas
    for (const [key, timestamp] of this.userCompletionTimes.entries()) {
      if (now - timestamp > expireTime) {
        this.userCompletionTimes.delete(key);
        this.processedCompletions.delete(key);
      }
    }
    
    console.log(`🧹 Limpeza automática: ${this.processedCompletions.size} entradas ativas, antigas removidas`);
  }
  
  /**
   * Força reset do sistema (para testes)
   */
  static reset(): void {
    this.processedCompletions.clear();
    this.userCompletionTimes.clear();
    console.log(`🔄 Sistema de deduplicação resetado`);
  }
  
  /**
   * Estatísticas do sistema
   */
  static getStats() {
    return {
      totalProcessed: this.processedCompletions.size,
      oldestEntry: Math.min(...Array.from(this.userCompletionTimes.values())),
      newestEntry: Math.max(...Array.from(this.userCompletionTimes.values())),
      systemStatus: 'active'
    };
  }
}