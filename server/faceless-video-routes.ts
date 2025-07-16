/**
 * FACELESS VIDEO ROUTES - API ENDPOINTS
 * Rotas para geração e publicação de vídeos virais
 */

import { Express } from 'express';
import { FacelessVideoGenerator } from './faceless-video-generator';
import { SocialMediaPublisher } from './social-media-publisher';
import { verifyJWT } from './auth-sqlite';
import { storage } from './storage-sqlite';
import { nanoid } from 'nanoid';
import multer from 'multer';
import path from 'path';

// Configuração de upload
const upload = multer({
  dest: 'uploads/videos/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Instâncias dos geradores
const videoGenerator = new FacelessVideoGenerator();
const socialPublisher = new SocialMediaPublisher();

export function registerFacelessVideoRoutes(app: Express) {
  console.log('📹 Registrando rotas de Faceless Videos...');

  /**
   * GERAR VÍDEO VIRAL
   */
  app.post('/api/faceless-videos/generate', verifyJWT, async (req: any, res) => {
    try {
      const { title, topic, duration, style, voice } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Validar entrada
      if (!title || !topic) {
        return res.status(400).json({ error: 'Título e tópico são obrigatórios' });
      }

      // Verificar créditos
      const user = await storage.getUserById(userId);
      if (!user || (user.videoCredits || 0) < 1) {
        return res.status(403).json({ error: 'Créditos insuficientes' });
      }

      // Criar projeto de vídeo
      const project = await storage.createVideoProject({
        userId,
        title,
        topic,
        duration: duration || 30,
        style: style || 'viral',
        voice: voice || 'masculina',
        status: 'generating',
        progress: 0,
        videoUrl: null,
        thumbnailUrl: null
      });

      // Débito do crédito
      await storage.updateUser(userId, {
        videoCredits: (user.videoCredits || 0) - 1
      });

      // Simulação de processamento assíncrono
      setTimeout(async () => {
        try {
          // Simular geração de vídeo
          await storage.updateVideoProject(project.id, {
            status: 'completed',
            progress: 100,
            videoUrl: `/uploads/videos/sample_${project.id}.mp4`,
            thumbnailUrl: `/uploads/thumbnails/thumb_${project.id}.jpg`
          });
        } catch (error) {
          console.error('❌ Erro no processamento:', error);
          await storage.updateVideoProject(project.id, {
            status: 'failed',
            progress: 0
          });
        }
      }, 30000); // 30 segundos para conclusão

      res.json({
        success: true,
        project,
        message: 'Vídeo sendo processado'
      });

    } catch (error) {
      console.error('❌ Erro ao gerar vídeo:', error);
      res.status(500).json({ error: 'Falha ao gerar vídeo' });
    }
  });

  /**
   * LISTAR PROJETOS DE VÍDEO
   */
  app.get('/api/faceless-videos/projects', verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const projects = await storage.getVideoProjects(userId);
      
      res.json(projects);

    } catch (error) {
      console.error('❌ Erro ao listar projetos:', error);
      res.status(500).json({ error: 'Falha ao carregar projetos' });
    }
  });

  /**
   * PUBLICAR VÍDEO EM REDES SOCIAIS
   */
  app.post('/api/faceless-videos/publish/:videoId', verifyJWT, async (req: any, res) => {
    try {
      const { videoId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Buscar projeto
      const project = await storage.getVideoProject(videoId);
      if (!project || project.userId !== userId) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
      }

      if (project.status === 'published') {
        return res.status(400).json({ error: 'Vídeo já publicado' });
      }

      // Preparar dados para publicação
      const videoResult = {
        videoUrl: project.videoUrl,
        thumbnailUrl: project.thumbnailUrl,
        script: project.script,
        hashtags: JSON.parse(project.hashtags || '[]'),
        caption: project.caption,
        duration: project.duration,
        platforms: JSON.parse(project.platforms || '[]')
      };

      // Publicar em todas as plataformas
      const postingSchedules = await socialPublisher.publishToAllPlatforms(videoResult, userId);

      // Atualizar status do projeto
      await storage.updateVideoProject(videoId, {
        status: 'published',
        publishedAt: new Date().toISOString(),
        postingSchedules: JSON.stringify(postingSchedules)
      });

      console.log(`✅ Vídeo publicado: ${videoId}`);
      res.json({
        success: true,
        message: 'Vídeo publicado com sucesso',
        postingSchedules
      });

    } catch (error) {
      console.error('❌ Erro ao publicar vídeo:', error);
      res.status(500).json({ 
        error: 'Falha na publicação',
        details: error.message 
      });
    }
  });

  /**
   * OBTER MÉTRICAS VIRAIS
   */
  app.get('/api/faceless-videos/metrics/:videoId', verifyJWT, async (req: any, res) => {
    try {
      const { videoId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Buscar projeto
      const project = await storage.getVideoProject(videoId);
      if (!project || project.userId !== userId) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
      }

      if (project.status !== 'published') {
        return res.status(400).json({ error: 'Vídeo não foi publicado ainda' });
      }

      // Monitorar performance
      const postingSchedules = JSON.parse(project.postingSchedules || '[]');
      const viralMetrics = await socialPublisher.monitorViralPerformance(postingSchedules);

      // Salvar métricas no banco
      await storage.updateVideoProject(videoId, {
        viralMetrics: JSON.stringify(viralMetrics),
        status: viralMetrics.viralScore > 70 ? 'viral' : 'published'
      });

      res.json({
        success: true,
        metrics: viralMetrics,
        postingSchedules
      });

    } catch (error) {
      console.error('❌ Erro ao obter métricas:', error);
      res.status(500).json({ 
        error: 'Falha ao obter métricas',
        details: error.message 
      });
    }
  });

  /**
   * OBTER CRÉDITOS DE VÍDEO
   */
  app.get('/api/video-credits/:userId', verifyJWT, async (req: any, res) => {
    try {
      const { userId } = req.params;
      
      if (req.user?.id !== userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({
        videoCredits: user.videoCredits || 0,
        plan: user.plan || 'free'
      });

    } catch (error) {
      console.error('❌ Erro ao obter créditos:', error);
      res.status(500).json({ error: 'Falha ao obter créditos' });
    }
  });

  /**
   * OBTER CRÉDITOS COMPLETOS PARA FACELESS VIDEOS
   */
  app.get('/api/faceless-videos/credits', verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const videoCredits = user.videoCredits || 0;
      const aiCredits = user.aiCredits || 0;
      const totalCredits = videoCredits + aiCredits + (user.smsCredits || 0) + (user.emailCredits || 0) + (user.whatsappCredits || 0);

      res.json({
        videoCredits,
        aiCredits,
        totalCredits,
        plan: user.plan || 'free'
      });

    } catch (error) {
      console.error('❌ Erro ao obter créditos:', error);
      res.status(500).json({ error: 'Falha ao obter créditos' });
    }
  });

  /**
   * LISTAR PROJETOS DE VÍDEO
   */
  app.get('/api/faceless-videos/projects', verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const projects = await storage.getVideoProjects(userId);
      
      res.json(projects);

    } catch (error) {
      console.error('❌ Erro ao listar projetos:', error);
      res.status(500).json({ error: 'Falha ao listar projetos' });
    }
  });

  /**
   * UPLOAD DE VÍDEO CUSTOMIZADO
   */
  app.post('/api/faceless-videos/upload', verifyJWT, upload.single('video'), async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const file = req.file;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      // Validar tipo de arquivo
      const allowedTypes = ['video/mp4', 'video/mov', 'video/avi'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: 'Tipo de arquivo não suportado' });
      }

      // Mover arquivo para diretório final
      const finalPath = path.join('uploads/videos', `${nanoid()}.${file.originalname.split('.').pop()}`);
      
      res.json({
        success: true,
        videoUrl: `/${finalPath}`,
        filename: file.originalname,
        size: file.size
      });

    } catch (error) {
      console.error('❌ Erro no upload:', error);
      res.status(500).json({ error: 'Falha no upload' });
    }
  });

  /**
   * DUPLICAR VÍDEO
   */
  app.post('/api/faceless-videos/duplicate/:videoId', verifyJWT, async (req: any, res) => {
    try {
      const { videoId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Buscar projeto original
      const originalProject = await storage.getVideoProject(videoId);
      if (!originalProject || originalProject.userId !== userId) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
      }

      // Criar cópia
      const duplicatedProject = {
        ...originalProject,
        id: nanoid(),
        title: `${originalProject.title} (Cópia)`,
        status: 'ready',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: null,
        postingSchedules: null,
        viralMetrics: null
      };

      await storage.createVideoProject(duplicatedProject);

      console.log(`✅ Vídeo duplicado: ${videoId} → ${duplicatedProject.id}`);
      res.json({
        success: true,
        message: 'Vídeo duplicado com sucesso',
        duplicatedId: duplicatedProject.id
      });

    } catch (error) {
      console.error('❌ Erro ao duplicar vídeo:', error);
      res.status(500).json({ 
        error: 'Falha ao duplicar vídeo',
        details: error.message 
      });
    }
  });

  /**
   * DELETAR VÍDEO
   */
  app.delete('/api/faceless-videos/:videoId', verifyJWT, async (req: any, res) => {
    try {
      const { videoId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Buscar projeto
      const project = await storage.getVideoProject(videoId);
      if (!project || project.userId !== userId) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
      }

      // Deletar projeto
      await storage.deleteVideoProject(videoId);

      console.log(`✅ Vídeo deletado: ${videoId}`);
      res.json({
        success: true,
        message: 'Vídeo deletado com sucesso'
      });

    } catch (error) {
      console.error('❌ Erro ao deletar vídeo:', error);
      res.status(500).json({ 
        error: 'Falha ao deletar vídeo',
        details: error.message 
      });
    }
  });

  /**
   * TEMPLATES DE VÍDEO
   */
  app.get('/api/faceless-videos/templates', async (req, res) => {
    try {
      const templates = [
        {
          id: 'viral-money',
          title: 'Dinheiro Viral',
          description: 'Como ganhar dinheiro online',
          niche: 'dinheiro',
          style: 'viral',
          duration: 30,
          thumbnail: '/assets/templates/viral-money.jpg'
        },
        {
          id: 'health-tips',
          title: 'Dicas de Saúde',
          description: 'Transformação de saúde',
          niche: 'saude',
          style: 'educational',
          duration: 45,
          thumbnail: '/assets/templates/health-tips.jpg'
        },
        {
          id: 'tech-secrets',
          title: 'Segredos Tech',
          description: 'Truques de tecnologia',
          niche: 'tecnologia',
          style: 'trending',
          duration: 60,
          thumbnail: '/assets/templates/tech-secrets.jpg'
        }
      ];

      res.json({ templates });

    } catch (error) {
      console.error('❌ Erro ao obter templates:', error);
      res.status(500).json({ error: 'Falha ao carregar templates' });
    }
  });

  /**
   * ESTATÍSTICAS GERAIS
   */
  app.get('/api/faceless-videos/stats/:userId', verifyJWT, async (req: any, res) => {
    try {
      const { userId } = req.params;
      
      if (req.user?.id !== userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const projects = await storage.getVideoProjects(userId);
      
      const stats = {
        totalVideos: projects.length,
        publishedVideos: projects.filter(p => p.status === 'published' || p.status === 'viral').length,
        viralVideos: projects.filter(p => p.status === 'viral').length,
        totalViews: projects.reduce((acc, p) => {
          const metrics = p.viralMetrics ? JSON.parse(p.viralMetrics) : null;
          return acc + (metrics?.totalViews || 0);
        }, 0),
        totalLikes: projects.reduce((acc, p) => {
          const metrics = p.viralMetrics ? JSON.parse(p.viralMetrics) : null;
          return acc + (metrics?.totalLikes || 0);
        }, 0),
        avgViralScore: projects.reduce((acc, p) => {
          const metrics = p.viralMetrics ? JSON.parse(p.viralMetrics) : null;
          return acc + (metrics?.viralScore || 0);
        }, 0) / (projects.length || 1)
      };

      res.json({ stats });

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      res.status(500).json({ error: 'Falha ao obter estatísticas' });
    }
  });

  console.log('✅ Rotas de Faceless Videos registradas');
}