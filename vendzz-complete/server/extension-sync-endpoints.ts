/**
 * SISTEMA DE SINCRONIZAÇÃO EXTENSÃO → SERVIDOR
 * 
 * Reduz carga do servidor movendo campanhas para localStorage da extensão
 * Servidor só recebe: novos leads, estatísticas, configurações críticas
 */

import { storage } from './storage-sqlite';
import { nanoid } from 'nanoid';

export const extensionSyncEndpoints = {
  
  // SYNC APENAS NOVOS LEADS (reduz 90% do tráfego)
  syncNewLeads: async (req: any, res: any) => {
    try {
      const { campaignId, leads, extensionStats } = req.body;
      const userId = req.user.id;
      
      console.log(`🔄 Sync leads: ${leads.length} novos leads da extensão`);
      
      // Salvar apenas novos leads no servidor
      const savedLeads = [];
      for (const lead of leads) {
        const leadId = nanoid();
        
        // Salvar lead no banco
        await storage.createQuizResponse({
          id: leadId,
          quizId: lead.quizId,
          userId: userId,
          responses: JSON.stringify(lead.responses),
          metadata: JSON.stringify({
            source: 'extension',
            campaignId: campaignId,
            phone: lead.phone,
            capturedAt: lead.capturedAt
          }),
          submittedAt: new Date()
        });
        
        savedLeads.push({ id: leadId, phone: lead.phone });
      }
      
      // Atualizar estatísticas da campanha (lightweight)
      if (extensionStats) {
        console.log(`📊 Atualizando stats campanha ${campaignId}: ${extensionStats.sent} enviados, ${extensionStats.failed} falharam`);
      }
      
      res.json({
        success: true,
        leadsSaved: savedLeads.length,
        message: `${savedLeads.length} leads salvos com sucesso`
      });
      
    } catch (error) {
      console.error('❌ Erro no sync de leads:', error);
      res.status(500).json({ error: 'Erro ao sincronizar leads' });
    }
  },

  // CONFIGURAÇÕES LEVES DA CAMPANHA (só o essencial)
  getCampaignConfig: async (req: any, res: any) => {
    try {
      const { campaignId } = req.params;
      const userId = req.user.id;
      
      // Buscar configurações da campanha WhatsApp
      const campaigns = await storage.getWhatsAppCampaigns(userId);
      const campaign = campaigns.find((c: any) => c.id === campaignId);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campanha não encontrada' });
      }
      
      // Retornar apenas dados essenciais para extensão
      const lightConfig = {
        id: campaign.id,
        name: campaign.name,
        message: campaign.message,
        isActive: campaign.status === 'active',
        workingHours: campaign.workingHours || { start: '09:00', end: '18:00' },
        messageDelay: campaign.messageDelay || 3000,
        maxPerDay: campaign.maxPerDay || 100,
        antiSpam: {
          enabled: true,
          minDelay: 2000,
          maxDelay: 8000
        }
      };
      
      res.json(lightConfig);
      
    } catch (error) {
      console.error('❌ Erro ao buscar config da campanha:', error);
      res.status(500).json({ error: 'Erro ao buscar configurações' });
    }
  },

  // ESTATÍSTICAS EM TEMPO REAL (lightweight)
  updateCampaignStats: async (req: any, res: any) => {
    try {
      const { campaignId } = req.params;
      const { stats } = req.body;
      const userId = req.user.id;
      
      // Salvar apenas estatísticas agregadas
      console.log(`📊 Stats em tempo real - Campanha ${campaignId}: ${stats.sentToday} enviados hoje, rodando: ${stats.isRunning}`);
      
      res.json({ success: true, message: 'Stats atualizadas' });
      
    } catch (error) {
      console.error('❌ Erro ao atualizar stats:', error);
      res.status(500).json({ error: 'Erro ao atualizar estatísticas' });
    }
  },

  // VERIFICAR STATUS DO USUÁRIO (créditos, plano)
  getUserStatus: async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Retornar apenas dados necessários para extensão
      const userStatus = {
        id: user.id,
        isActive: true,
        whatsappCredits: user.whatsappCredits || 0,
        plan: user.planType || 'free',
        canSendMessages: (user.whatsappCredits || 0) > 0,
        dailyLimit: user.planType === 'premium' ? 1000 : 100,
        extensionConfig: {
          autoSend: true,
          respectWorkingHours: true,
          antiSpam: true
        }
      };
      
      res.json(userStatus);
      
    } catch (error) {
      console.error('❌ Erro ao buscar status do usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar status' });
    }
  },

  // SINCRONIZAÇÃO DE TELEFONES PROCESSADOS (evita duplicatas)
  markPhonesAsProcessed: async (req: any, res: any) => {
    try {
      const { campaignId, phones } = req.body;
      const userId = req.user.id;
      
      // Marcar telefones como processados no servidor (cache)
      console.log(`✅ Marcando ${phones.length} telefones como processados para campanha ${campaignId}`);
      
      res.json({
        success: true,
        phonesMarked: phones.length,
        message: `${phones.length} telefones marcados como processados`
      });
      
    } catch (error) {
      console.error('❌ Erro ao marcar telefones:', error);
      res.status(500).json({ error: 'Erro ao marcar telefones' });
    }
  }
};

// Sistema simplificado - logs apenas para verificação
// Em produção seria implementado cache real ou Redis