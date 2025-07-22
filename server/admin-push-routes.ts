import { Request, Response, Router } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

// Caminho para o arquivo de configuração do sistema de push
const pushConfigPath = path.join(process.cwd(), 'push-config.json');
const pushSubscriptionsPath = path.join(process.cwd(), 'push-subscriptions.json');

// Carregar configuração ou usar padrão
function loadPushConfig() {
  try {
    if (fs.existsSync(pushConfigPath)) {
      const configData = fs.readFileSync(pushConfigPath, 'utf8');
      return JSON.parse(configData);
    }
  } catch (error) {
    console.error('Erro ao carregar configuração push:', error);
  }
  
  return {
    enabled: true,
    globalTemplate: {
      title: '🎉 Novo Quiz Completado!',
      message: 'Um usuário acabou de finalizar seu quiz: "{quizTitle}"'
    },
    lastUpdated: new Date().toISOString()
  };
}

// Salvar configuração
function savePushConfig(config: any) {
  try {
    fs.writeFileSync(pushConfigPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar configuração push:', error);
    return false;
  }
}

// Carregar subscriptions
function loadSubscriptions() {
  try {
    if (fs.existsSync(pushSubscriptionsPath)) {
      const data = fs.readFileSync(pushSubscriptionsPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar subscriptions:', error);
  }
  return [];
}

// GET /api/admin/push-config - Obter configurações do sistema
router.get('/push-config', (req: Request, res: Response) => {
  try {
    const config = loadPushConfig();
    res.json(config);
  } catch (error) {
    console.error('Erro ao obter configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/admin/push-config - Salvar configurações do sistema
router.post('/push-config', (req: Request, res: Response) => {
  try {
    const { enabled, globalTemplate } = req.body;
    
    const config = {
      enabled: Boolean(enabled),
      globalTemplate: globalTemplate || {
        title: '🎉 Novo Quiz Completado!',
        message: 'Um usuário acabou de finalizar seu quiz: "{quizTitle}"'
      },
      lastUpdated: new Date().toISOString()
    };
    
    if (savePushConfig(config)) {
      console.log('✅ Configurações de push atualizadas:', config);
      res.json({ success: true, config });
    } else {
      res.status(500).json({ error: 'Erro ao salvar configurações' });
    }
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/admin/push-send - Enviar mensagem personalizada
router.post('/push-send', async (req: Request, res: Response) => {
  try {
    const { title, message, targetUser } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: 'Título e mensagem são obrigatórios' });
    }

    // Enviar via sistema de push existente
    const pushResponse = await fetch('http://localhost:5000/api/push-simple/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        message,
        // Se targetUser for especificado, implementar filtro no futuro
        icon: '/icon-192x192.png'
      })
    });

    if (pushResponse.ok) {
      const result = await pushResponse.json();
      console.log(`📤 ADMIN PUSH ENVIADO: "${title}" - ${result.sent || 0} dispositivos`);
      
      res.json({ 
        success: true, 
        sent: result.sent || 0,
        failed: result.failed || 0
      });
    } else {
      const error = await pushResponse.text();
      console.error('❌ Erro ao enviar push admin:', error);
      res.status(500).json({ error: 'Erro ao enviar notificação' });
    }
  } catch (error) {
    console.error('Erro ao enviar push personalizado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/admin/users-list - Listar usuários para seleção
router.get('/users-list', async (req: Request, res: Response) => {
  try {
    // Importar storage dinamicamente para evitar circular dependency
    const { storage } = await import('./storage-sqlite');
    
    const users = await storage.getAllUsers();
    const usersList = users.map(user => ({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt
    }));
    
    res.json({ users: usersList });
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/admin/push-stats - Estatísticas detalhadas
router.get('/push-stats', (req: Request, res: Response) => {
  try {
    const subscriptions = loadSubscriptions();
    const config = loadPushConfig();
    
    // Calcular estatísticas básicas
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentSubscriptions = subscriptions.filter((sub: any) => {
      const subDate = new Date(sub.createdAt || sub.timestamp || 0);
      return subDate > oneDayAgo;
    });
    
    res.json({
      total: subscriptions.length,
      recent: recentSubscriptions.length,
      enabled: config.enabled,
      lastConfigUpdate: config.lastUpdated,
      sentToday: 0 // Implementar contagem de envios se necessário
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ 
      total: 0, 
      recent: 0, 
      enabled: true,
      sentToday: 0 
    });
  }
});

export default router;