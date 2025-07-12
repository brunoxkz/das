/**
 * REQUEST OPTIMIZER - COMPRESSÃO E HEADERS OTIMIZADOS
 * Middleware para otimizar requests e responses sem modificar vite.config.ts
 */

import compression from 'compression';
import { Request, Response, NextFunction } from 'express';

/**
 * MIDDLEWARE DE COMPRESSÃO INTELIGENTE
 */
export function intelligentCompression() {
  return compression({
    // Comprimir apenas se response > 1KB
    threshold: 1024,
    
    // Filtro inteligente
    filter: (req, res) => {
      // Não comprimir se já comprimido
      if (res.getHeader('Content-Encoding')) {
        return false;
      }

      // Comprimir JSON, text, HTML, CSS, JS
      const contentType = res.getHeader('Content-Type');
      if (contentType) {
        const type = contentType.toString().toLowerCase();
        return type.includes('json') || 
               type.includes('text') || 
               type.includes('html') || 
               type.includes('css') || 
               type.includes('javascript');
      }

      return compression.filter(req, res);
    },
    
    // Nível de compressão otimizado
    level: 6, // Balanço entre velocidade e compressão
    
    // Window bits para melhor compressão
    windowBits: 15,
    
    // Memory level
    memLevel: 8
  });
}

/**
 * MIDDLEWARE DE HEADERS OTIMIZADOS
 */
export function optimizedHeaders() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Cache headers para assets estáticos
    if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 ano
      res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
    }
    
    // Cache para API com validação
    else if (req.url.startsWith('/api/')) {
      // Quiz público - cache mais longo
      if (req.url.startsWith('/api/quiz/') && req.method === 'GET') {
        res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60'); // 5min
        res.setHeader('ETag', `"quiz-${Date.now()}"`);
      }
      // Dashboard e dados privados - cache curto
      else if (req.url.includes('dashboard') || req.url.includes('analytics')) {
        res.setHeader('Cache-Control', 'private, max-age=60, must-revalidate'); // 1min
      }
      // Outros endpoints - sem cache
      else {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
    
    // Headers de performance
    res.setHeader('X-DNS-Prefetch-Control', 'on');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Preload critical resources
    if (req.url === '/' || req.url.includes('index.html')) {
      res.setHeader('Link', [
        '</manifest.json>; rel=manifest',
        '</sw.js>; rel=serviceworker'
      ].join(', '));
    }

    next();
  };
}

/**
 * MIDDLEWARE DE PERFORMANCE MONITORING
 */
export function performanceMonitoring() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Override end para capturar timing
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      const duration = Date.now() - startTime;
      
      // Adicionar header de timing apenas se não foi enviado
      try {
        if (!res.headersSent) {
          res.setHeader('X-Response-Time', `${duration}ms`);
        }
      } catch (error) {
        // Headers já enviados, ignorar
      }
      
      // Log apenas requests lentos (>1s)
      if (duration > 1000) {
        console.warn(`⚠️ Slow request: ${req.method} ${req.url} - ${duration}ms`);
      }
      
      // Log extremamente lentos (>5s)
      if (duration > 5000) {
        console.error(`🚨 Critical slow request: ${req.method} ${req.url} - ${duration}ms`);
      }
      
      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}

/**
 * MIDDLEWARE DE PREFETCH INTELIGENTE
 */
export function intelligentPrefetch() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Headers de prefetch baseados na rota
    if (req.url === '/dashboard') {
      res.setHeader('Link', [
        '</api/dashboard>; rel=prefetch',
        '</api/quizzes>; rel=prefetch'
      ].join(', '));
    }
    
    else if (req.url.startsWith('/quiz/')) {
      res.setHeader('Link', [
        '</api/analytics>; rel=prefetch'
      ].join(', '));
    }
    
    else if (req.url === '/quizzes') {
      res.setHeader('Link', [
        '</api/quizzes>; rel=prefetch',
        '</api/analytics>; rel=prefetch'
      ].join(', '));
    }

    next();
  };
}

/**
 * MIDDLEWARE DE RESOURCE HINTS
 */
export function resourceHints() {
  return (req: Request, res: Response, next: NextFunction) => {
    // DNS prefetch para CDNs e APIs externas
    if (req.url === '/' || req.url.includes('index.html')) {
      res.setHeader('Link', [
        '//fonts.googleapis.com; rel=dns-prefetch',
        '//cdnjs.cloudflare.com; rel=dns-prefetch',
        '//api.vendzz.com; rel=dns-prefetch'
      ].join(', '));
    }

    next();
  };
}

/**
 * MIDDLEWARE DE COMPRESSION ADAPTATIVO
 */
export function adaptiveCompression() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Detectar conexão lenta e ajustar compressão
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
    const isSlowConnection = req.headers['save-data'] === 'on' || 
                            req.headers['connection'] === 'slow-2g';

    if (isMobile || isSlowConnection) {
      // Compressão mais agressiva para conexões lentas
      res.locals.compressionLevel = 9;
      res.setHeader('Vary', 'Accept-Encoding, Save-Data');
    } else {
      res.locals.compressionLevel = 6;
    }

    next();
  };
}

/**
 * BUNDLE DE MIDDLEWARE COMPLETO
 */
export function applyRequestOptimizations() {
  return [
    adaptiveCompression(),
    intelligentCompression(),
    optimizedHeaders(),
    performanceMonitoring(),
    intelligentPrefetch(),
    resourceHints()
  ];
}

console.log('⚡ Request Optimizer carregado - Performance melhorada');