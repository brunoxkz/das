import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initializeDatabase } from './database.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import recurringRoutes from './routes/recurring.js';
import cron from 'node-cron';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const app = express();
const PORT = process.env.PORT || 3001;

// ======================
// MIDDLEWARE
// ======================

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://quantum-tasks.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ======================
// ROUTES
// ======================

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/recurring', recurringRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Quantum Tasks API',
    version: '1.0.0'
  });
});

// Status endpoint
app.get('/api/status', async (req, res) => {
  try {
    // Simple database check
    const { db } = await import('./database.js');
    const userCount = await db.query.users.findMany();
    
    res.json({
      status: 'healthy',
      database: 'connected',
      users: userCount.length,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// ======================
// WEBSOCKET FOR REAL-TIME
// ======================

const server = createServer(app);
const wss = new WebSocketServer({ 
  server, 
  path: '/ws',
  perMessageDeflate: false 
});

const clients = new Map();

wss.on('connection', (ws, req) => {
  console.log('🔌 New WebSocket connection');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'auth' && data.userId) {
        clients.set(data.userId, ws);
        ws.userId = data.userId;
        ws.send(JSON.stringify({ type: 'auth_success', userId: data.userId }));
      }
      
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
      
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    if (ws.userId) {
      clients.delete(ws.userId);
      console.log(`🔌 WebSocket disconnected for user: ${ws.userId}`);
    }
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
  
  // Send initial connection message
  ws.send(JSON.stringify({ 
    type: 'connected', 
    timestamp: new Date().toISOString(),
    message: 'Welcome to Quantum Tasks real-time system'
  }));
});

// Broadcast function for real-time updates
export function broadcastToUser(userId: string, message: any) {
  const client = clients.get(userId);
  if (client && client.readyState === client.OPEN) {
    client.send(JSON.stringify(message));
  }
}

// ======================
// RECURRING TASKS PROCESSOR
// ======================

// Process recurring patterns every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  try {
    console.log('🔄 Processing recurring patterns...');
    
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`http://localhost:${PORT}/api/recurring/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer system-cron-token' // System token for cron jobs
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Processed ${result.processed} recurring patterns`);
      
      // Broadcast updates to connected clients
      for (const [userId, client] of clients) {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({
            type: 'recurring_processed',
            count: result.processed,
            timestamp: new Date().toISOString()
          }));
        }
      }
    }
  } catch (error) {
    console.error('❌ Recurring patterns processing error:', error);
  }
});

// ======================
// EMAIL SYNC PROCESSOR (Future Implementation)
// ======================

// Process email sync every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('📧 Processing email sync...');
    // Future: Process email accounts and fetch new messages
    // This will be implemented in Phase 2
  } catch (error) {
    console.error('❌ Email sync error:', error);
  }
});

// ======================
// AI SUGGESTIONS PROCESSOR (Future Implementation)
// ======================

// Process AI suggestions every hour
cron.schedule('0 * * * *', async () => {
  try {
    console.log('🤖 Processing AI suggestions...');
    // Future: Generate AI suggestions based on user patterns
    // This will be implemented in Phase 3
  } catch (error) {
    console.error('❌ AI suggestions error:', error);
  }
});

// ======================
// START SERVER
// ======================

async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Start server
    server.listen(PORT, () => {
      console.log('\n🚀 ===================================');
      console.log('🎯 QUANTUM TASKS API SERVER STARTED');
      console.log('🚀 ===================================\n');
      console.log(`📡 HTTP Server: http://localhost:${PORT}`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
      console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔍 Status: http://localhost:${PORT}/api/status`);
      console.log('\n📋 Available Endpoints:');
      console.log('   • POST /api/auth/register - User registration');
      console.log('   • POST /api/auth/login - User login');
      console.log('   • GET  /api/auth/me - Current user info');
      console.log('   • GET  /api/tasks - List tasks');
      console.log('   • POST /api/tasks - Create task');
      console.log('   • GET  /api/tasks/projects - List projects');
      console.log('   • POST /api/tasks/projects - Create project');
      console.log('   • GET  /api/recurring/patterns - List recurring patterns');
      console.log('   • POST /api/recurring/patterns - Create recurring pattern');
      console.log('   • POST /api/recurring/process - Process recurring tasks');
      console.log('\n🔄 Cron Jobs Active:');
      console.log('   • Recurring patterns: Every 15 minutes');
      console.log('   • Email sync: Every 5 minutes (future)');
      console.log('   • AI suggestions: Every hour (future)');
      console.log('\n💾 Database: SQLite (quantum-tasks.db)');
      console.log('🔐 Authentication: JWT');
      console.log('📧 Default Admin: admin@quantumtasks.com / admin123');
      console.log('\n✅ Ready for connections!\n');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n🛑 SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();