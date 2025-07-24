// MÓDULO DE OTIMIZAÇÃO: Analytics Routes separado do routes-sqlite.ts principal
// Economia estimada: ~150KB do bundle principal

import { Router } from 'express';
import { verifyJWT } from '../auth-sqlite';
import { sql } from 'drizzle-orm';
import { db } from '../db-sqlite';

const analyticsRouter = Router();

// Middleware de autenticação para todas as rotas de analytics
analyticsRouter.use(verifyJWT);

// OTIMIZAÇÃO: Lazy loading das rotas de analytics
analyticsRouter.get('/dashboard/stats', async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    // Consultas otimizadas para dashboard usando API correta do Drizzle
    const [quizStats, responseStats, recentActivity] = await Promise.all([
      db.execute(sql`
        SELECT COUNT(*) as total_quizzes, 
               COUNT(CASE WHEN created_at > datetime('now', '-7 days') THEN 1 END) as recent_quizzes
        FROM quizzes WHERE user_id = ${userId}
      `).then(result => result.rows[0]),
      
      db.execute(sql`
        SELECT COUNT(*) as total_responses,
               COUNT(CASE WHEN submitted_at > datetime('now', '-7 days') THEN 1 END) as recent_responses
        FROM quiz_responses WHERE quiz_id IN (SELECT id FROM quizzes WHERE user_id = ${userId})
      `).then(result => result.rows[0]),
      
      db.execute(sql`
        SELECT q.name, COUNT(qr.id) as response_count
        FROM quizzes q 
        LEFT JOIN quiz_responses qr ON q.id = qr.quiz_id
        WHERE q.user_id = ${userId} AND qr.submitted_at > datetime('now', '-30 days')
        GROUP BY q.id, q.name
        ORDER BY response_count DESC
        LIMIT 5
      `).then(result => result.rows)
    ]);

    res.json({
      success: true,
      data: {
        quizzes: quizStats,
        responses: responseStats,
        topQuizzes: recentActivity
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota otimizada para análise de performance de quiz específico
analyticsRouter.get('/quiz/:id/analytics', async (req: any, res) => {
  try {
    const { id: quizId } = req.params;
    const userId = req.user.id;
    
    // Verificar se o quiz pertence ao usuário usando API correta
    const quizCheck = await db.execute(sql`SELECT id FROM quizzes WHERE id = ${quizId} AND user_id = ${userId}`);
    if (!quizCheck.rows[0]) {
      return res.status(404).json({ error: 'Quiz não encontrado' });
    }

    // Analytics completas do quiz usando API correta do Drizzle
    const analytics = await Promise.all([
      // Estatísticas gerais
      db.execute(sql`
        SELECT 
          COUNT(*) as total_responses,
          COUNT(CASE WHEN metadata LIKE '%"isPartial":false%' THEN 1 END) as completed_responses,
          AVG(CASE WHEN metadata LIKE '%"timeSpent":%' THEN 
            CAST(substr(metadata, instr(metadata, '"timeSpent":') + 12, 
                 instr(substr(metadata, instr(metadata, '"timeSpent":') + 12), ',') - 1) AS INTEGER)
          END) as avg_time_spent
        FROM quiz_responses WHERE quiz_id = ${quizId}
      `).then(result => result.rows[0]),
      
      // Análise por página
      db.execute(sql`
        SELECT 
          CASE WHEN metadata LIKE '%"currentPage":%' THEN 
            CAST(substr(metadata, instr(metadata, '"currentPage":') + 14, 
                 instr(substr(metadata, instr(metadata, '"currentPage":') + 14), ',') - 1) AS INTEGER)
          ELSE 0 END as page_number,
          COUNT(*) as exits_on_page
        FROM quiz_responses 
        WHERE quiz_id = ${quizId} AND metadata LIKE '%"isPartial":true%'
        GROUP BY page_number
        ORDER BY page_number
      `).then(result => result.rows),
      
      // Respostas recentes (últimas 7 dias)
      db.execute(sql`
        SELECT DATE(submitted_at) as date, COUNT(*) as responses
        FROM quiz_responses 
        WHERE quiz_id = ${quizId} AND submitted_at > datetime('now', '-7 days')
        GROUP BY DATE(submitted_at)
        ORDER BY date DESC
      `).then(result => result.rows)
    ]);

    res.json({
      success: true,
      data: {
        overview: analytics[0],
        pageAnalysis: analytics[1],
        recentTrend: analytics[2]
      }
    });
  } catch (error) {
    console.error('Erro ao buscar analytics do quiz:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export { analyticsRouter };