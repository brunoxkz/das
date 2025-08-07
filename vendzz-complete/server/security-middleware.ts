import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { logRateLimitAttempt } from './rate-limiting-monitor';

// Intelligent rate limiting configuration with context awareness
export const createIntelligentRateLimit = (config: {
  windowMs: number;
  baseMax: number;
  message: string;
  isFlexible?: boolean;
  allowAutomatic?: boolean;
  allowAssets?: boolean;
}) => {
  return rateLimit({
    windowMs: config.windowMs,
    max: (req) => {
      // Asset requests (JS, CSS, images) get much higher limits
      if (config.allowAssets && isAssetRequest(req)) {
        return config.baseMax * 50; // 50x more for assets
      }
      
      // Automatic/system requests get higher limits
      if (config.allowAutomatic && isAutomaticRequest(req)) {
        return config.baseMax * 20; // 20x more for automatic processes
      }
      
      // Complex quiz editing gets higher limits
      if (config.isFlexible && isComplexQuizWork(req)) {
        return config.baseMax * 10; // 10x more for complex quiz editing
      }
      
      // Authenticated users get higher limits
      if (hasValidUserSession(req)) {
        return config.baseMax * 3; // 3x more for authenticated users
      }
      
      return config.baseMax;
    },
    message: { error: config.message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      const requestType = getRequestType(req);
      const limit = calculateLimitForRequest(req, config.baseMax, config);
      
      // Log the rate limit attempt for monitoring
      logRateLimitAttempt(req, requestType, true, limit, limit + 1);
      
      // Only log non-asset rate limits to avoid spam
      if (requestType !== 'asset') {
        console.log(`🚨 RATE LIMIT EXCEEDED: ${req.ip} - ${req.method} ${req.path} (${requestType})`);
      }
      
      res.status(429).json({ 
        error: config.message,
        retryAfter: Math.ceil(config.windowMs / 1000),
        type: requestType,
        path: req.path
      });
    },
    skip: (req) => {
      // Pular completamente requisições do Sistema Controle
      if (isSistemaControleRequest(req)) {
        return true;
      }
      
      // Log successful requests for monitoring
      const requestType = getRequestType(req);
      const limit = calculateLimitForRequest(req, config.baseMax, config);
      logRateLimitAttempt(req, requestType, false, limit, 0);
      return false; // Don't actually skip
    }
  });
};

// Helper functions for intelligent rate limiting
function isSistemaControleRequest(req: any): boolean {
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

function isAssetRequest(req: any): boolean {
  const assetExtensions = ['.js', '.css', '.tsx', '.ts', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  const assetPaths = ['/src/', '/@fs/', '/node_modules/', '/public/', '/assets/'];
  
  return assetExtensions.some(ext => req.path.includes(ext)) || 
         assetPaths.some(path => req.path.includes(path)) ||
         req.path === '/sw.js' || 
         req.path === '/manifest.json' ||
         req.path === '/favicon.ico';
}

function isAutomaticRequest(req: any): boolean {
  const automaticPaths = [
    '/api/campaigns/process',
    '/api/whatsapp/auto',
    '/api/sms/auto', 
    '/api/email/auto',
    '/api/system/health',
    '/api/analytics/auto',
    '/api/push-simple/',
    '/api/push/',
    '/api/real-time/',
    '/api/automation/'
  ];
  
  const userAgent = req.get('User-Agent') || '';
  const isSystemCall = automaticPaths.some(path => req.path.includes(path));
  const isServiceWorker = userAgent.includes('ServiceWorker');
  const isCronJob = req.get('X-Cron-Job') === 'true';
  const isInternalCall = req.get('X-Internal-Request') === 'true';
  
  return isSystemCall || isServiceWorker || isCronJob || isInternalCall;
}

function isComplexQuizWork(req: any): boolean {
  const quizPaths = [
    '/api/quizzes/',
    '/api/quiz-builder/',
    '/src/pages/quiz-builder',
    '/src/components/page-editor',
    '/src/components/quiz-preview',
    '/src/pages/product-builder'
  ];
  
  const isQuizEditor = quizPaths.some(path => req.path.includes(path));
  
  // Check if working with complex quiz data
  const hasComplexData = req.body && (
    (req.body.pages && req.body.pages.length > 5) ||
    (req.body.elements && req.body.elements.length > 10) ||
    (typeof req.body === 'object' && JSON.stringify(req.body).length > 5000)
  );
  
  return isQuizEditor || hasComplexData;
}

function hasValidUserSession(req: any): boolean {
  const authHeader = req.get('Authorization');
  const hasJWT = authHeader && authHeader.startsWith('Bearer ');
  const hasSession = req.session && req.session.user;
  
  return hasJWT || hasSession;
}

function getRequestType(req: any): string {
  if (isSistemaControleRequest(req)) return 'sistema-controle';
  if (isAssetRequest(req)) return 'assets';
  if (isAutomaticRequest(req)) return 'automatic';
  if (isComplexQuizWork(req)) return 'quiz-complex';
  if (hasValidUserSession(req)) return 'authenticated';
  return 'default';
}

// Helper function to calculate limit for a request (for monitoring)
function calculateLimitForRequest(req: any, baseMax: number, config: any): number {
  if (config.allowAssets && isAssetRequest(req)) {
    return baseMax * 50;
  }
  if (config.allowAutomatic && isAutomaticRequest(req)) {
    return baseMax * 20;
  }
  if (config.isFlexible && isComplexQuizWork(req)) {
    return baseMax * 10;
  }
  if (hasValidUserSession(req)) {
    return baseMax * 3;
  }
  return baseMax;
}

// Different rate limits for different operations using intelligent rate limiting
export const generalRateLimit = createIntelligentRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  baseMax: 500, // Increased base limit
  message: 'Too many requests, please try again later',
  isFlexible: true,
  allowAutomatic: true,
  allowAssets: true
});

export const quizSubmissionRateLimit = createIntelligentRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  baseMax: 100, // Increased from 20 to 100
  message: 'Too many quiz submissions, please slow down',
  isFlexible: true,
  allowAutomatic: true
});

export const pushNotificationRateLimit = createIntelligentRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  baseMax: 1000, // Massively increased from 10 to 1000
  message: 'Push notification rate limit exceeded',
  allowAutomatic: true
});

export const authRateLimit = createIntelligentRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  baseMax: 20, // Increased from 5 to 20
  message: 'Too many authentication attempts'
});

// Special asset rate limit for development/production assets
export const assetRateLimit = createIntelligentRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  baseMax: 10000, // Very high for assets
  message: 'Asset rate limit exceeded',
  allowAssets: true,
  allowAutomatic: true
});

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // Remove potential SQL injection patterns
      return value
        .replace(/['";]/g, '') // Remove quotes and semicolons
        .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi, '') // Remove SQL keywords
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
    }
    
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = Array.isArray(value) ? [] : {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    
    return value;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
};

// Validate request size and structure
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  // Check payload size (max 1MB)
  const maxSize = 1024 * 1024; // 1MB
  const contentLength = req.get('content-length');
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    console.log(`🚨 PAYLOAD TOO LARGE: ${req.ip} - ${contentLength} bytes`);
    return res.status(413).json({ 
      error: 'Payload too large',
      maxSize: '1MB'
    });
  }

  // Validate JSON structure for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    try {
      // Check for deeply nested objects (max 10 levels)
      const checkDepth = (obj: any, depth = 0): boolean => {
        if (depth > 10) return false;
        if (typeof obj === 'object' && obj !== null) {
          for (const key in obj) {
            if (!checkDepth(obj[key], depth + 1)) return false;
          }
        }
        return true;
      };

      if (!checkDepth(req.body)) {
        console.log(`🚨 OBJECT TOO DEEP: ${req.ip} - ${req.method} ${req.path}`);
        return res.status(400).json({ 
          error: 'Request structure too complex',
          maxDepth: 10
        });
      }
    } catch (error) {
      console.log(`🚨 INVALID JSON: ${req.ip} - ${req.method} ${req.path}`);
      return res.status(400).json({ error: 'Invalid JSON format' });
    }
  }

  next();
};

// Header validation
export const validateHeaders = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-originating-ip',
    'x-cluster-client-ip'
  ];

  // Check for suspicious header manipulation
  for (const header of suspiciousHeaders) {
    const value = req.get(header);
    if (value && (value.includes('<') || value.includes('>') || value.includes('script'))) {
      console.log(`🚨 MALICIOUS HEADER: ${req.ip} - ${header}: ${value}`);
      return res.status(400).json({ error: 'Invalid header format' });
    }
  }

  // Validate User-Agent
  const userAgent = req.get('user-agent');
  if (userAgent && userAgent.length > 500) {
    console.log(`🚨 SUSPICIOUS USER AGENT: ${req.ip} - Length: ${userAgent.length}`);
    return res.status(400).json({ error: 'Invalid user agent' });
  }

  next();
};

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "ws:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for SharedArrayBuffer in some contexts
});

// IP monitoring and blocking
class IPMonitor {
  private suspiciousIPs: Map<string, { count: number, lastSeen: number }> = new Map();
  private blockedIPs: Set<string> = new Set();

  track(ip: string) {
    const now = Date.now();
    const record = this.suspiciousIPs.get(ip) || { count: 0, lastSeen: now };
    
    // Reset count if last seen was more than 1 hour ago
    if (now - record.lastSeen > 60 * 60 * 1000) {
      record.count = 0;
    }
    
    record.count++;
    record.lastSeen = now;
    this.suspiciousIPs.set(ip, record);
    
    // Block IP if too many suspicious activities
    if (record.count > 50) {
      this.blockedIPs.add(ip);
      console.log(`🔒 IP BLOCKED: ${ip} (${record.count} suspicious activities)`);
    }
  }

  isBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  unblock(ip: string) {
    this.blockedIPs.delete(ip);
    this.suspiciousIPs.delete(ip);
  }
}

export const ipMonitor = new IPMonitor();

export const checkBlockedIP = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  if (ipMonitor.isBlocked(ip)) {
    console.log(`🚫 BLOCKED IP ATTEMPT: ${ip} - ${req.method} ${req.path}`);
    return res.status(403).json({ 
      error: 'Access denied',
      reason: 'IP blocked due to suspicious activity'
    });
  }
  
  next();
};

// SQL injection detection middleware
export const detectSQLInjection = (req: Request, res: Response, next: NextFunction) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b.*=)/gi,
    /(union\s+select)/gi,
    /(or\s+1\s*=\s*1)/gi,
    /(and\s+1\s*=\s*1)/gi,
    /('.*or.*'.*=.*')/gi,
    /(;.*drop\s+table)/gi,
    /(;.*delete\s+from)/gi
  ];

  const checkForSQLInjection = (value: string): boolean => {
    return sqlPatterns.some(pattern => pattern.test(value));
  };

  const recursiveCheck = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return checkForSQLInjection(obj);
    }
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (recursiveCheck(obj[key])) return true;
      }
    }
    return false;
  };

  // Check body, query, and params
  const hasInjection = recursiveCheck(req.body) || 
                      recursiveCheck(req.query) || 
                      recursiveCheck(req.params);

  if (hasInjection) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    console.log(`🚨 SQL INJECTION ATTEMPT: ${ip} - ${req.method} ${req.path}`);
    ipMonitor.track(ip);
    
    return res.status(400).json({ 
      error: 'Invalid request format',
      reason: 'Suspicious patterns detected'
    });
  }

  next();
};