import { Router } from 'express';
import { checkDatabaseConnection } from './db-postgresql.js';

export const healthRouter = Router();

healthRouter.get('/health', async (req, res) => {
  try {
    const dbConnected = await checkDatabaseConnection();
    
    if (dbConnected) {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        service: 'vendzz-platform'
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        service: 'vendzz-platform'
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      service: 'vendzz-platform'
    });
  }
});