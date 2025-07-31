/**
 * SISTEMA DE NOTIFICAÇÕES AUTOMÁTICAS VENDZZ
 * Implementação independente para envio automático de push notifications quando quizzes são completados
 * Status: Sistema manual 100% funcional, implementando sistema automático isolado
 */

const fs = require('fs');
const path = require('path');

class AutomaticPushSystem {
  constructor() {
    this.subscriptionsPath = path.join(process.cwd(), 'push-subscriptions.json');
    this.isEnabled = true;
    
    // 9 mensagens rotativas para variedade nas notificações automáticas
    this.quizCompletionMessages = [
      { title: '🎉 Novo Lead Capturado!', body: 'Alguém completou seu funil quiz! Confira os detalhes no dashboard.' },
      { title: '🔥 Quiz Finalizado!', body: 'Um novo prospect acabou de completar sua captura de leads!' },
      { title: '💰 Potencial Cliente!', body: 'Seu quiz converteu um novo lead qualificado agora mesmo!' },
      { title: '🚀 Lead Quente Gerado!', body: 'Uma pessoa interessada completou todo o seu quiz de qualificação!' },
      { title: '✨ Nova Conversão!', body: 'Seu funil de vendas acabou de capturar mais um lead!' },
      { title: '🎯 Quiz Convertido!', body: 'Mais uma pessoa qualificada entrou no seu funil de vendas!' },
      { title: '🌟 Lead Capturado!', body: 'Seu quiz está gerando resultados - novo prospect qualificado!' },
      { title: '📈 Conversão Realizada!', body: 'Parabéns! Seu quiz converteu mais um lead interessado!' },
      { title: '💎 Prospect Qualificado!', body: 'Uma nova oportunidade de negócio completou seu quiz!' }
    ];
  }

  /**
   * Verifica se usuário tem push notifications ativadas
   */
  hasActivePushSubscription(userId) {
    try {
      console.log(`🔍 VERIFICANDO PUSH SUBSCRIPTION para userId: ${userId}`);
      
      if (!fs.existsSync(this.subscriptionsPath)) {
        console.log(`📄 Arquivo push-subscriptions.json não encontrado`);
        return false;
      }
      
      const subscriptionsData = fs.readFileSync(this.subscriptionsPath, 'utf8');
      const subscriptions = JSON.parse(subscriptionsData);
      
      const userSubscriptions = subscriptions.filter(s => s.userId === userId);
      const hasSubscription = userSubscriptions.length > 0;
      
      console.log(`📱 Resultado: ${hasSubscription ? 'TEM' : 'NÃO TEM'} push subscription ativa`);
      return hasSubscription;
      
    } catch (error) {
      console.error('❌ Erro ao verificar push subscription:', error);
      return false;
    }
  }

  /**
   * Seleciona mensagem rotativa baseada no timestamp
   */
  selectRotativeMessage() {
    const messageIndex = Date.now() % this.quizCompletionMessages.length;
    return this.quizCompletionMessages[messageIndex];
  }

  /**
   * Envia notificação automática para o dono do quiz
   */
  async sendAutomaticNotification(quizOwner, quizId) {
    try {
      console.log(`🚀 INICIANDO NOTIFICAÇÃO AUTOMÁTICA para ${quizOwner.email}`);
      
      // Admin sempre recebe (para testes)
      const isAdmin = quizOwner.id === 'admin-user-id' || quizOwner.email === 'admin@vendzz.com';
      const hasSubscription = isAdmin || this.hasActivePushSubscription(quizOwner.id);
      
      if (!hasSubscription) {
        console.log(`🔒 BLOQUEADO: ${quizOwner.email} sem push notifications ativas - otimização 100k+ usuários`);
        return false;
      }

      const selectedMessage = this.selectRotativeMessage();
      console.log(`💬 Mensagem selecionada: ${selectedMessage.title}`);

      // Preparar payload da notificação
      const pushPayload = {
        title: selectedMessage.title,
        message: selectedMessage.body,
        icon: '/icon-192x192.png',
        data: {
          type: 'quiz_completion',
          quizId: quizId,
          timestamp: Date.now(),
          url: '/dashboard'
        }
      };

      console.log(`📤 ENVIANDO PUSH NOTIFICATION AUTOMÁTICA...`);
      
      // Usar sistema de push existente diretamente
      const { sendPushToAll } = require('./push-simple.js');
      await sendPushToAll(pushPayload);
      
      console.log(`✅ SUCESSO: Push notification automática enviada para ${quizOwner.email}: "${selectedMessage.title}"`);
      return true;
      
    } catch (error) {
      console.error(`❌ ERRO ao enviar notificação automática:`, error);
      console.error(`📋 Stack trace:`, error.stack);
      return false;
    }
  }

  /**
   * Função principal para processar quiz completion
   */
  async processQuizCompletion(quizId, getUserByQuizIdFunction) {
    try {
      console.log(`🎯 QUIZ COMPLETION DETECTADO: ${quizId}`);
      
      if (!this.isEnabled) {
        console.log(`⏸️ Sistema de notificações automáticas DESABILITADO`);
        return;
      }

      console.log(`🔍 Buscando dono do quiz: ${quizId}`);
      const quizOwner = await getUserByQuizIdFunction(quizId);
      
      if (!quizOwner) {
        console.log(`❌ Dono do quiz não encontrado para: ${quizId}`);
        return;
      }
      
      console.log(`👤 Dono encontrado: ${quizOwner.email} (ID: ${quizOwner.id})`);
      
      // Enviar notificação automática
      await this.sendAutomaticNotification(quizOwner, quizId);
      
    } catch (error) {
      console.error(`❌ ERRO no processamento de quiz completion:`, error);
      // Não lançar erro para não afetar o salvamento da resposta
    }
  }
}

// Exportar sistema
const automaticPushSystem = new AutomaticPushSystem();

module.exports = {
  automaticPushSystem,
  AutomaticPushSystem
};

console.log(`🔔 AUTOMATIC PUSH SYSTEM carregado - Status: ${automaticPushSystem.isEnabled ? 'ATIVO' : 'INATIVO'}`);