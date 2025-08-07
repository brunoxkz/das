import { Request, Response } from 'express';
import FunnelScraper from '../funnel-scraper';
import { nanoid } from 'nanoid';

export async function analyzeFunnelUrl(req: Request, res: Response) {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL é obrigatória' 
      });
    }

    // Simular análise da URL
    const funnelData = await FunnelScraper.extractFromUrl(url);
    
    if (!funnelData) {
      return res.status(404).json({
        success: false,
        error: 'Nenhum funil detectado nesta URL'
      });
    }

    res.json({
      success: true,
      data: funnelData,
      message: 'Funil detectado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao analisar funil:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}

export async function importFunnel(req: Request, res: Response) {
  try {
    const { funnelData } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    if (!funnelData) {
      return res.status(400).json({
        success: false,
        error: 'Dados do funil são obrigatórios'
      });
    }

    // Criar quiz a partir do funil importado
    const quizId = nanoid();
    const quiz = {
      id: quizId,
      title: funnelData.title,
      description: funnelData.description,
      elements: funnelData.elements,
      theme: funnelData.theme,
      settings: funnelData.settings,
      userId: userId,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        importedFrom: funnelData.originalUrl,
        importedAt: new Date().toISOString(),
        source: 'funnel-importer'
      }
    };

    // Simular salvamento no banco (seria implementado com storage real)
    console.log('Quiz importado:', quiz);

    res.json({
      success: true,
      data: {
        quizId: quizId,
        title: quiz.title,
        editUrl: `/quizzes/${quizId}/edit`
      },
      message: 'Funil importado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao importar funil:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}

export async function getImportedFunnels(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    // Simular busca de funis importados
    const importedFunnels = [
      {
        id: 'imported-1',
        title: 'Fórmulas Virais - Cosméticos',
        description: 'Funil importado do InLead',
        elements: 6,
        importedFrom: 'https://inlead.digital/formulas-virais-cosmeticos-artesanais/',
        importedAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: importedFunnels,
      total: importedFunnels.length
    });

  } catch (error) {
    console.error('Erro ao buscar funis importados:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}