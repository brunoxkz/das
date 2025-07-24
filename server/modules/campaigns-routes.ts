// MÓDULO DE OTIMIZAÇÃO: Campaigns Routes separado do routes-sqlite.ts principal
// Economia estimada: ~200KB do bundle principal (SMS + WhatsApp + Email)

import { Router } from 'express';
import { verifyJWT } from '../auth-sqlite';
import { sql } from 'drizzle-orm';
import { db } from '../db-sqlite';

const campaignsRouter = Router();

// Middleware de autenticação para todas as rotas de campanhas
campaignsRouter.use(verifyJWT);

// OTIMIZAÇÃO: Lazy loading das rotas de campanhas SMS
campaignsRouter.get('/sms-campaigns', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const campaigns = await db.execute(sql`
      SELECT id, name, message, status, created_at, 
             (SELECT COUNT(*) FROM sms_logs WHERE campaign_id = sms_campaigns.id) as message_count
      FROM sms_campaigns 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `).then(result => result.rows);

    const total = await db.execute(sql`SELECT COUNT(*) as count FROM sms_campaigns WHERE user_id = ${userId}`).then(result => result.rows[0]);

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar campanhas SMS:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota otimizada para criar campanha SMS
campaignsRouter.post('/sms-campaigns', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { name, message, quizId, scheduledFor, audienceType } = req.body;

    // Validações básicas
    if (!name || !message) {
      return res.status(400).json({ error: 'Nome e mensagem são obrigatórios' });
    }

    if (message.length > 160) {
      return res.status(400).json({ error: 'Mensagem muito longa (máximo 160 caracteres)' });
    }

    // Verificar créditos SMS
    const credits = db.prepare('SELECT sms_credits FROM users WHERE id = ?').get(userId);
    if (!credits || credits.sms_credits <= 0) {
      return res.status(400).json({ error: 'Créditos SMS insuficientes' });
    }

    // Criar campanha
    const campaignId = require('nanoid').nanoid();
    const campaign = {
      id: campaignId,
      user_id: userId,
      name,
      message,
      quiz_id: quizId || null,
      status: scheduledFor ? 'scheduled' : 'active',
      scheduled_for: scheduledFor || null,
      audience_type: audienceType || 'all',
      created_at: new Date().toISOString()
    };

    db.prepare(`
      INSERT INTO sms_campaigns (id, user_id, name, message, quiz_id, status, scheduled_for, audience_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      campaign.id, campaign.user_id, campaign.name, campaign.message, 
      campaign.quiz_id, campaign.status, campaign.scheduled_for, 
      campaign.audience_type, campaign.created_at
    );

    res.json({
      success: true,
      data: campaign,
      message: 'Campanha SMS criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar campanha SMS:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// OTIMIZAÇÃO: Lazy loading das rotas de campanhas WhatsApp
campaignsRouter.get('/whatsapp-campaigns', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const campaigns = db.prepare(`
      SELECT id, name, message, status, created_at,
             (SELECT COUNT(*) FROM whatsapp_logs WHERE campaign_id = whatsapp_campaigns.id) as message_count,
             (SELECT COUNT(*) FROM whatsapp_logs WHERE campaign_id = whatsapp_campaigns.id AND status = 'sent') as sent_count,
             (SELECT COUNT(*) FROM whatsapp_logs WHERE campaign_id = whatsapp_campaigns.id AND status = 'failed') as failed_count
      FROM whatsapp_campaigns 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).all(userId, limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM whatsapp_campaigns WHERE user_id = ?').get(userId);

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar campanhas WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota otimizada para pausar/retomar campanha
campaignsRouter.patch('/campaigns/:id/toggle', async (req: any, res) => {
  try {
    const { id: campaignId } = req.params;
    const userId = req.user.id;
    const { type } = req.body; // 'sms' ou 'whatsapp'

    if (!['sms', 'whatsapp'].includes(type)) {
      return res.status(400).json({ error: 'Tipo de campanha inválido' });
    }

    const table = type === 'sms' ? 'sms_campaigns' : 'whatsapp_campaigns';
    
    // Buscar campanha atual
    const campaign = db.prepare(`SELECT id, status FROM ${table} WHERE id = ? AND user_id = ?`).get(campaignId, userId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campanha não encontrada' });
    }

    // Toggle status
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    
    db.prepare(`UPDATE ${table} SET status = ? WHERE id = ?`).run(newStatus, campaignId);

    res.json({
      success: true,
      data: { id: campaignId, status: newStatus },
      message: `Campanha ${newStatus === 'active' ? 'retomada' : 'pausada'} com sucesso`
    });
  } catch (error) {
    console.error('Erro ao alterar status da campanha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota otimizada para buscar logs de campanha
campaignsRouter.get('/campaigns/:id/logs', async (req: any, res) => {
  try {
    const { id: campaignId } = req.params;
    const userId = req.user.id;
    const { type } = req.query; // 'sms' ou 'whatsapp'
    
    if (!['sms', 'whatsapp'].includes(type as string)) {
      return res.status(400).json({ error: 'Tipo de campanha inválido' });
    }

    const logsTable = type === 'sms' ? 'sms_logs' : 'whatsapp_logs';
    const campaignsTable = type === 'sms' ? 'sms_campaigns' : 'whatsapp_campaigns';
    
    // Verificar se campanha pertence ao usuário
    const campaign = db.prepare(`SELECT id FROM ${campaignsTable} WHERE id = ? AND user_id = ?`).get(campaignId, userId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campanha não encontrada' });
    }

    // Buscar logs
    const logs = db.prepare(`
      SELECT phone, status, sent_at, error_message
      FROM ${logsTable}
      WHERE campaign_id = ?
      ORDER BY sent_at DESC
      LIMIT 100
    `).all(campaignId);

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export { campaignsRouter };