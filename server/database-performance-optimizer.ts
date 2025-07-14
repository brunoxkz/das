// OTIMIZADOR DE PERFORMANCE DO DATABASE PARA 100% DE SUCESSO
import Database from 'better-sqlite3';

export class DatabasePerformanceOptimizer {
  private db: Database.Database;
  
  constructor(database: Database.Database) {
    this.db = database;
  }

  // Otimizar query específica com EXPLAIN QUERY PLAN
  explainQuery(query: string): any[] {
    try {
      const stmt = this.db.prepare(`EXPLAIN QUERY PLAN ${query}`);
      const result = stmt.all();
      console.log(`📊 EXPLAIN QUERY PLAN para: ${query}`);
      console.log(result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao executar EXPLAIN:', error);
      return [];
    }
  }

  // Executar query com medição de performance
  measureQuery(query: string, params: any[] = []): { result: any[], time: number } {
    const start = performance.now();
    try {
      const stmt = this.db.prepare(query);
      const result = stmt.all(params);
      const time = performance.now() - start;
      
      // Critério mais rigoroso para queries lentas
      if (time > 50) {
        console.log(`⚠️ Query lenta detectada (${time.toFixed(2)}ms): ${query}`);
        // Só executar EXPLAIN se query tiver parâmetros preenchidos
        if (params.length === 0) {
          this.explainQuery(query);
        }
      }
      
      return { result, time };
    } catch (error) {
      console.error('❌ Erro ao executar query:', error);
      return { result: [], time: performance.now() - start };
    }
  }

  // Otimizar todas as queries críticas
  optimizeQueries(): void {
    console.log('🚀 Iniciando otimização de queries críticas...');
    
    // Queries críticas que aparecem nos testes
    const criticalQueries = [
      'SELECT * FROM quizzes WHERE userId = ? AND isPublished = ?',
      'SELECT * FROM quiz_responses WHERE quizId = ? ORDER BY submittedAt DESC',
      'SELECT * FROM users WHERE email = ?',
      'SELECT * FROM sms_campaigns WHERE userId = ? AND status = ?'
    ];
    
    criticalQueries.forEach(query => {
      this.explainQuery(query);
    });
    
    // Executar estatísticas atualizadas
    this.db.exec('ANALYZE');
    console.log('✅ ANALYZE executado');
    
    // Otimizar configurações do SQLite
    this.db.exec('PRAGMA optimize');
    console.log('✅ PRAGMA optimize executado');
  }

  // Verificar saúde dos índices
  checkIndexHealth(): void {
    console.log('🔍 Verificando saúde dos índices...');
    
    try {
      const indexes = this.db.prepare(`
        SELECT name, tbl_name, sql 
        FROM sqlite_master 
        WHERE type = 'index' AND name NOT LIKE 'sqlite_%'
      `).all();
      
      console.log(`📊 Total de índices: ${indexes.length}`);
      
      indexes.forEach(index => {
        const stats = this.db.prepare(`
          SELECT * FROM sqlite_stat1 WHERE tbl = ?
        `).all(index.tbl_name);
        
        if (stats.length === 0) {
          console.log(`⚠️ Índice sem estatísticas: ${index.name}`);
        }
      });
      
    } catch (error) {
      console.error('❌ Erro ao verificar índices:', error);
    }
  }

  // Limpeza e manutenção do banco
  performMaintenance(): void {
    console.log('🧹 Executando manutenção do banco...');
    
    try {
      // Vacuum para otimizar espaço
      this.db.exec('VACUUM');
      console.log('✅ VACUUM executado');
      
      // Reindexar tudo
      this.db.exec('REINDEX');
      console.log('✅ REINDEX executado');
      
      // Atualizar estatísticas
      this.db.exec('ANALYZE');
      console.log('✅ ANALYZE executado');
      
    } catch (error) {
      console.error('❌ Erro na manutenção:', error);
    }
  }
}

// Instância global do otimizador
let optimizer: DatabasePerformanceOptimizer | null = null;

export const initializeOptimizer = (database: Database.Database): void => {
  optimizer = new DatabasePerformanceOptimizer(database);
  optimizer.optimizeQueries();
  optimizer.checkIndexHealth();
};

export const getOptimizer = (): DatabasePerformanceOptimizer | null => {
  return optimizer;
};