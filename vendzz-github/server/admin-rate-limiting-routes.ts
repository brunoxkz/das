/**
 * ENDPOINTS ADMINISTRATIVOS PARA MONITORAMENTO DE RATE LIMITING
 * 
 * Painel administrativo para acompanhar o consumo de rate limiting
 * em tempo real, identificar hotspots e prever necessidades de ajuste.
 */

import { Express } from 'express';
import { rateLimitMonitor } from './rate-limiting-monitor';
import { verifyJWT } from './auth-sqlite';

export function registerRateLimitingAdminRoutes(app: Express) {
  
  // 📊 ENDPOINT: Estatísticas gerais do rate limiting
  app.get('/api/admin/rate-limiting/stats', verifyJWT, async (req: any, res) => {
    try {
      // Verificar se é admin
      if (req.user.id !== 'admin-user-id') {
        return res.status(403).json({ error: 'Acesso negado - apenas administradores' });
      }
      
      const stats = rateLimitMonitor.getStats();
      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de rate limiting:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // 📈 ENDPOINT: Análise de tendências e recomendações
  app.get('/api/admin/rate-limiting/trends', verifyJWT, async (req: any, res) => {
    try {
      // Verificar se é admin
      if (req.user.id !== 'admin-user-id') {
        return res.status(403).json({ error: 'Acesso negado - apenas administradores' });
      }
      
      const trends = rateLimitMonitor.getTrendAnalysis();
      const alerts = rateLimitMonitor.getAlerts();
      
      res.json({
        success: true,
        data: {
          trends,
          alerts,
          summary: {
            categoriesNeedingIncrease: trends.filter(t => t.needsIncrease).length,
            highestUtilization: trends[0]?.utilizationRate || 0,
            alertLevel: alerts.some(a => a.severity === 'CRITICAL') ? 'CRITICAL' : 
                       alerts.some(a => a.severity === 'WARNING') ? 'WARNING' : 'OK'
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro ao buscar análise de tendências:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // 🚫 ENDPOINT: IPs bloqueados e suspeitos
  app.get('/api/admin/rate-limiting/blocked-ips', verifyJWT, async (req: any, res) => {
    try {
      // Verificar se é admin
      if (req.user.id !== 'admin-user-id') {
        return res.status(403).json({ error: 'Acesso negado - apenas administradores' });
      }
      
      const blockedIPs = rateLimitMonitor.getAllBlockedIPs();
      const stats = rateLimitMonitor.getStats();
      
      res.json({
        success: true,
        data: {
          blockedIPs: blockedIPs.sort((a, b) => b.count - a.count), // Ordenar por número de bloqueios
          topBlockedPaths: stats.topBlockedPaths,
          totalUniqueBlockedIPs: blockedIPs.length,
          mostBlockedIP: blockedIPs[0] || null
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro ao buscar IPs bloqueados:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // 📋 ENDPOINT: Requisições recentes (para debug)
  app.get('/api/admin/rate-limiting/recent-requests', verifyJWT, async (req: any, res) => {
    try {
      // Verificar se é admin
      if (req.user.id !== 'admin-user-id') {
        return res.status(403).json({ error: 'Acesso negado - apenas administradores' });
      }
      
      const limit = parseInt(req.query.limit as string) || 50;
      const recentRequests = rateLimitMonitor.getRecentRequests(limit);
      
      res.json({
        success: true,
        data: {
          requests: recentRequests,
          count: recentRequests.length,
          filters: {
            blocked: recentRequests.filter(r => r.blocked).length,
            allowed: recentRequests.filter(r => !r.blocked).length,
            categories: [...new Set(recentRequests.map(r => r.category))]
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro ao buscar requisições recentes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // 🔍 ENDPOINT: Detalhes de um IP específico
  app.get('/api/admin/rate-limiting/ip-details/:ip', verifyJWT, async (req: any, res) => {
    try {
      // Verificar se é admin
      if (req.user.id !== 'admin-user-id') {
        return res.status(403).json({ error: 'Acesso negado - apenas administradores' });
      }
      
      const ip = req.params.ip;
      const details = rateLimitMonitor.getBlockedIPDetails(ip);
      
      if (!details) {
        return res.status(404).json({ error: 'IP não encontrado nos registros de bloqueio' });
      }
      
      res.json({
        success: true,
        data: {
          ip,
          ...details,
          riskLevel: details.count > 500 ? 'HIGH' : 
                    details.count > 100 ? 'MEDIUM' : 'LOW'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro ao buscar detalhes do IP:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // ⚙️ ENDPOINT: Configurações atuais dos limites
  app.get('/api/admin/rate-limiting/limits-config', verifyJWT, async (req: any, res) => {
    try {
      // Verificar se é admin
      if (req.user.id !== 'admin-user-id') {
        return res.status(403).json({ error: 'Acesso negado - apenas administradores' });
      }
      
      // Configurações atuais hardcoded do sistema
      const currentLimits = {
        assets: { limit: 10000, multiplier: '50x', description: 'JS, CSS, TSX, TS files' },
        automatic: { limit: 2000, multiplier: '20x', description: 'Sistema automático, campanhas' },
        'quiz-complex': { limit: 1000, multiplier: '10x', description: 'Quiz com 40+ páginas' },
        authenticated: { limit: 300, multiplier: '3x', description: 'Usuários logados' },
        'push-notifications': { limit: 1000, multiplier: 'Específico', description: 'Push notifications' },
        default: { limit: 100, multiplier: '1x', description: 'Requisições padrão' }
      };
      
      res.json({
        success: true,
        data: {
          currentLimits,
          notes: [
            'Limites são aplicados por janela de 15 minutos',
            'Multiplicadores são baseados no tipo de requisição',
            'Sistema detecta automaticamente o tipo da requisição'
          ]
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro ao buscar configurações de limites:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // 📊 ENDPOINT: Dashboard em tempo real (polling endpoint)
  app.get('/api/admin/rate-limiting/dashboard', verifyJWT, async (req: any, res) => {
    try {
      // Verificar se é admin
      if (req.user.id !== 'admin-user-id') {
        return res.status(403).json({ error: 'Acesso negado - apenas administradores' });
      }
      
      const stats = rateLimitMonitor.getStats();
      const trends = rateLimitMonitor.getTrendAnalysis();
      const alerts = rateLimitMonitor.getAlerts();
      const blockedIPs = rateLimitMonitor.getAllBlockedIPs();
      
      // Calcular métricas do dashboard
      const dashboard = {
        overview: {
          totalRequests: stats.totalRequests,
          blockedRequests: stats.blockedRequests,
          blockRate: stats.blockRate,
          lastBlockedAt: stats.lastBlockedAt,
          categoriesCount: Object.keys(stats.categoryStats).length
        },
        categories: Object.entries(stats.categoryStats).map(([category, data]) => ({
          name: category,
          requests: data.requests,
          blocked: data.blocked,
          blockRate: data.rate,
          status: data.rate > 10 ? 'HIGH' : data.rate > 5 ? 'MEDIUM' : 'LOW'
        })),
        topIssues: {
          blockedIPs: blockedIPs.slice(0, 5).map(ip => ({
            ip: ip.ip,
            count: ip.count,
            lastBlocked: ip.lastBlocked
          })),
          blockedPaths: stats.topBlockedPaths.slice(0, 5)
        },
        alerts: alerts.slice(0, 10), // Últimos 10 alertas
        trends: trends.filter(t => t.needsIncrease).slice(0, 5), // Top 5 categorias que precisam de aumento
        timeSeries: stats.timeSeriesData.slice(-30) // Últimos 30 pontos de dados
      };
      
      res.json({
        success: true,
        data: dashboard,
        timestamp: new Date().toISOString(),
        refreshInterval: 30000 // Recomenda refresh a cada 30 segundos
      });
    } catch (error) {
      console.error('❌ Erro ao buscar dashboard:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  console.log('✅ Rotas administrativas de Rate Limiting registradas');
}