// Health Check Endpoint para Monitoramento de 1000+ Usuários
import { Request, Response } from 'express';
import { cache } from './cache';

export function healthCheck(req: Request, res: Response) {
  try {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    // Coletar métricas críticas
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: `${Math.round(uptime)}s`,
      memory: {
        heap: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
      },
      cache: cache.getStats(),
      performance: {
        loadAverage: process.platform === 'linux' ? require('os').loadavg() : [0, 0, 0],
        cpuUsage: process.cpuUsage()
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        nodeEnv: process.env.NODE_ENV || 'development'
      }
    };
    
    // Verificar se sistema está saudável
    const heapMB = memUsage.heapUsed / 1024 / 1024;
    const warnings = [];
    
    if (heapMB > 500) {
      warnings.push('High memory usage detected');
      healthData.status = 'warning';
    }
    
    if (uptime < 60) {
      warnings.push('Recent restart detected');
    }
    
    if (warnings.length > 0) {
      healthData.warnings = warnings;
    }
    
    res.json(healthData);
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Endpoint detalhado para debugging
export function detailedHealth(req: Request, res: Response) {
  try {
    const processInfo = {
      pid: process.pid,
      title: process.title,
      arch: process.arch,
      platform: process.platform,
      versions: process.versions,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? '***configured***' : 'not set',
        JWT_SECRET: process.env.JWT_SECRET ? '***configured***' : 'not set'
      }
    };
    
    res.json({
      status: 'detailed',
      timestamp: new Date().toISOString(),
      process: processInfo,
      cache: cache.getStats(),
      system: {
        totalMemory: require('os').totalmem(),
        freeMemory: require('os').freemem(),
        cpus: require('os').cpus().length,
        loadAverage: require('os').loadavg(),
        uptime: require('os').uptime()
      }
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Detailed health check failed',
      error: error.message
    });
  }
}