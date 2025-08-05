import express from 'express';
import cors from 'cors';
import path from 'path';
import { router } from './routes.js';
import { initializeDatabase, healthCheck } from './db.js';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api', router);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Dashboard route - serve the dashboard
app.get('/vendas', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'sistema-vendas', 'public', 'index.html'));
});

app.get('/vendas-dashboard', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'sistema-vendas', 'public', 'index.html'));
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Initialize and start server
async function startServer() {
  try {
    console.log('🚀 Iniciando Sistema de Vendas WhatsApp...');
    
    // Initialize database
    await initializeDatabase();
    
    // Check database health
    if (!healthCheck()) {
      throw new Error('Database health check failed');
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Servidor rodando na porta ${PORT}`);
      console.log(`📊 API disponível em http://localhost:${PORT}/api`);
      console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
      console.log('');
      console.log('📋 Credenciais padrão:');
      console.log('👑 Admin: admin / admin123');
      console.log('👤 Atendente: atendente1 / admin123');
      console.log('');
      console.log('🎯 Sistema pronto para uso!');
    });
  } catch (error) {
    console.error('❌ Falha ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

startServer();