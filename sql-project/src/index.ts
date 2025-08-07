import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { sql } from 'drizzle-orm';
import { config } from './config/env';
import { db } from './config/database';
import apiRoutes from './api/routes';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
if (config.ENABLE_CORS) {
  app.use(cors({
    origin: config.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : true,
    credentials: true
  }));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (config.ENABLE_LOGGING) {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    database: config.DATABASE_URL?.includes('postgresql') ? 'PostgreSQL' : 'SQLite'
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado',
    path: req.originalUrl
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: config.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await db.execute(sql`SELECT 1 as test`);
    console.log(`✅ Conexão com banco de dados estabelecida`);
    
    app.listen(config.PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${config.PORT}`);
      console.log(`🌍 Environment: ${config.NODE_ENV}`);
      console.log(`📊 Database: ${config.DATABASE_URL?.includes('postgresql') ? 'PostgreSQL' : 'SQLite'}`);
      console.log(`🔗 Health check: http://localhost:${config.PORT}/health`);
      console.log(`📡 API base: http://localhost:${config.PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

startServer();