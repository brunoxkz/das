/**
 * SISTEMA DE RATE LIMITING INTELIGENTE
 * Diferencia usuários legítimos de invasores usando machine learning básico
 */

import { RATE_LIMITS, SUSPICIOUS_PATTERNS, WHITELIST, DYNAMIC_LIMITS } from './rate-limiter-config';

interface UserBehavior {
  userId: string;
  requests: number;
  quizComplexity: number;
  timeSpent: number;
  patterns: string[];
  legitimacyScore: number;
  lastActivity: Date;
}

interface RateLimitRule {
  endpoint: string;
  maxRequests: number;
  timeWindow: number; // em segundos
  complexityMultiplier: number;
  legitimacyThreshold: number;
}

class IntelligentRateLimiter {
  private userBehaviors = new Map<string, UserBehavior>();
  private rules: RateLimitRule[] = [
    {
      endpoint: '/api/quizzes',
      maxRequests: 10,
      timeWindow: 60,
      complexityMultiplier: 2.0,
      legitimacyThreshold: 0.7
    },
    {
      endpoint: '/api/elements',
      maxRequests: 500, // Permitir muitos elementos para quizzes complexos
      timeWindow: 60,
      complexityMultiplier: 1.5,
      legitimacyThreshold: 0.8
    },
    {
      endpoint: '/api/campaigns',
      maxRequests: 20,
      timeWindow: 60,
      complexityMultiplier: 1.0,
      legitimacyThreshold: 0.9
    }
  ];

  // Calcula score de legitimidade baseado em comportamento
  private calculateLegitimacyScore(behavior: UserBehavior): number {
    let score = 0.5; // Base score

    // Tempo gasto indica usuário humano
    if (behavior.timeSpent > 30) score += 0.2;
    if (behavior.timeSpent > 120) score += 0.2;

    // Complexidade dos quizzes indica uso legítimo
    if (behavior.quizComplexity > 20) score += 0.3;
    if (behavior.quizComplexity > 50) score += 0.2;

    // Padrões de comportamento humano
    const hasVariedPatterns = behavior.patterns.length > 3;
    if (hasVariedPatterns) score += 0.2;

    // Penalizar comportamento muito rápido (bots)
    if (behavior.timeSpent < 5 && behavior.requests > 50) score -= 0.4;

    return Math.max(0, Math.min(1, score));
  }

  // Detecta complexidade do quiz baseado na requisição
  private detectQuizComplexity(body: any): number {
    if (!body || !body.structure) return 1;

    let complexity = 0;
    
    // Contar páginas
    const pages = body.structure.pages || [];
    complexity += pages.length * 2;

    // Contar elementos totais
    pages.forEach((page: any) => {
      if (page.elements) {
        complexity += page.elements.length;
        
        // Elementos complexos valem mais
        page.elements.forEach((element: any) => {
          if (element.type === 'multiple_choice' && element.options?.length > 5) {
            complexity += 3;
          }
          if (element.type === 'form' || element.type === 'advanced_form') {
            complexity += 5;
          }
        });
      }
    });

    return complexity;
  }

  // Middleware principal
  public middleware() {
    return (req: any, res: any, next: any) => {
      // Exceção para Sistema Controle - permitir acesso irrestrito
      if (this.isSistemaControleRequest(req)) {
        return next();
      }
      
      const userId = req.user?.id || req.ip;
      const endpoint = this.getEndpointPattern(req.path);
      const rule = this.rules.find(r => endpoint.includes(r.endpoint));

      if (!rule) return next();

      // Obter ou criar comportamento do usuário
      let behavior = this.userBehaviors.get(userId);
      if (!behavior) {
        behavior = {
          userId,
          requests: 0,
          quizComplexity: 0,
          timeSpent: 0,
          patterns: [],
          legitimacyScore: 0.5,
          lastActivity: new Date()
        };
        this.userBehaviors.set(userId, behavior);
      }

      // Atualizar comportamento
      const now = new Date();
      const timeSinceLastActivity = (now.getTime() - behavior.lastActivity.getTime()) / 1000;
      
      behavior.requests++;
      behavior.timeSpent += timeSinceLastActivity;
      behavior.patterns.push(`${req.method}:${endpoint}:${Math.floor(timeSinceLastActivity)}`);
      behavior.lastActivity = now;

      // Detectar complexidade se for criação de quiz
      if (req.method === 'POST' && endpoint.includes('/quizzes')) {
        const complexity = this.detectQuizComplexity(req.body);
        behavior.quizComplexity = Math.max(behavior.quizComplexity, complexity);
      }

      // Calcular legitimidade
      behavior.legitimacyScore = this.calculateLegitimacyScore(behavior);

      // Aplicar rate limiting inteligente
      const timeWindow = rule.timeWindow * 1000;
      const recentRequests = this.getRecentRequests(userId, timeWindow);
      
      // Calcular limite dinâmico baseado em legitimidade e complexidade
      let dynamicLimit = rule.maxRequests;
      
      if (behavior.legitimacyScore > rule.legitimacyThreshold) {
        // Usuário legítimo - aumentar limite baseado na complexidade
        dynamicLimit *= rule.complexityMultiplier;
        
        // Bonus para quizzes muito complexos
        if (behavior.quizComplexity > 30) {
          dynamicLimit *= 1.5;
        }
        if (behavior.quizComplexity > 50) {
          dynamicLimit *= 2.0;
        }
      } else {
        // Usuário suspeito - aplicar limite mais restritivo
        dynamicLimit *= 0.5;
      }

      if (recentRequests >= dynamicLimit) {
        console.warn(`🚫 Rate limit exceeded for ${userId}: ${recentRequests}/${dynamicLimit} (legitimacy: ${behavior.legitimacyScore.toFixed(2)})`);
        
        return res.status(429).json({
          error: 'Rate limit exceeded',
          retryAfter: rule.timeWindow,
          legitimacyScore: behavior.legitimacyScore,
          message: behavior.legitimacyScore > 0.7 
            ? 'Seu quiz é complexo, aguarde alguns segundos para continuar'
            : 'Muitas requisições em pouco tempo, tente novamente em alguns minutos'
        });
      }

      // Log para usuários com alta complexidade
      if (behavior.quizComplexity > 30) {
        console.log(`✅ Usuário legítimo criando quiz complexo: ${userId} (${behavior.quizComplexity} elementos, score: ${behavior.legitimacyScore.toFixed(2)})`);
      }

      next();
    };
  }

  private isSistemaControleRequest(req: any): boolean {
    // Exceção para Sistema Controle - porta 3001 independente
    const sistemaControlePaths = [
      '/sistema-controle',
      '/api/controle',
      '/controle',
      '/atendentes'
    ];
    
    // Verificar se é requisição do sistema controle
    const isSistemaControle = sistemaControlePaths.some(path => 
      req.path.includes(path) || req.url.includes(path)
    );
    
    // Verificar se a porta é 3001 (sistema controle)
    const isPort3001 = req.get('host')?.includes(':3001');
    
    return isSistemaControle || isPort3001;
  }

  private getEndpointPattern(path: string): string {
    // Normalizar endpoints para padrões
    if (path.includes('/api/quizzes')) return '/api/quizzes';
    if (path.includes('/api/elements')) return '/api/elements';
    if (path.includes('/api/campaigns')) return '/api/campaigns';
    return path;
  }

  private getRecentRequests(userId: string, timeWindow: number): number {
    const behavior = this.userBehaviors.get(userId);
    if (!behavior) return 0;

    const now = new Date();
    const cutoff = new Date(now.getTime() - timeWindow);
    
    return behavior.patterns.filter(pattern => {
      const timestamp = pattern.split(':')[2];
      return parseInt(timestamp) > (cutoff.getTime() / 1000);
    }).length;
  }

  // Limpar dados antigos para economizar memória
  public cleanup() {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 horas

    for (const [userId, behavior] of this.userBehaviors) {
      if (behavior.lastActivity < cutoff) {
        this.userBehaviors.delete(userId);
      }
    }

    console.log(`🧹 Limpeza do rate limiter: ${this.userBehaviors.size} usuários ativos`);
  }

  // Estatísticas para monitoramento
  public getStats() {
    const behaviors = Array.from(this.userBehaviors.values());
    
    return {
      totalUsers: behaviors.length,
      legitimateUsers: behaviors.filter(b => b.legitimacyScore > 0.7).length,
      suspiciousUsers: behaviors.filter(b => b.legitimacyScore < 0.3).length,
      complexQuizUsers: behaviors.filter(b => b.quizComplexity > 30).length,
      avgLegitimacyScore: behaviors.reduce((sum, b) => sum + b.legitimacyScore, 0) / behaviors.length,
      avgQuizComplexity: behaviors.reduce((sum, b) => sum + b.quizComplexity, 0) / behaviors.length
    };
  }
}

export const intelligentRateLimiter = new IntelligentRateLimiter();

// Cleanup automático a cada hora
setInterval(() => {
  intelligentRateLimiter.cleanup();
}, 60 * 60 * 1000);