const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

// VAPID keys estáticas para funcionamento
const vapidKeys = {
  publicKey: 'BKVRmJs10mOKMM_5r5ulr2lwK7874bDfO2xKcJstwEKo2zH-IovON2BG8_847MbQnzo_75QqRAEkjC_BwzwiccQ',
  privateKey: 'q_5w5kdx_9lBfN5I2OjBaXBfVq7x7b5wMXjTJ4VvKF8'
};

// Configurar VAPID
webpush.setVapidDetails(
  'mailto:admin@vendzz.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

/**
 * Enviar push notification para usuário específico
 * @param {string} userId - ID do usuário
 * @param {object} payload - Payload da notificação
 */
async function sendPushToSpecificUser(userId, payload) {
  try {
    console.log(`🎯 ENVIANDO PUSH PARA USUÁRIO ESPECÍFICO: ${userId}`);
    
    const subscriptionsPath = path.join(process.cwd(), 'push-subscriptions.json');
    
    if (!fs.existsSync(subscriptionsPath)) {
      console.log('📄 Arquivo push-subscriptions.json não encontrado');
      return { success: false, message: 'No subscriptions file' };
    }

    const subscriptionsData = fs.readFileSync(subscriptionsPath, 'utf8');
    const subscriptions = JSON.parse(subscriptionsData);
    
    // Filtrar subscriptions do usuário específico
    const userSubscriptions = subscriptions.filter(sub => sub.userId === userId);
    
    if (userSubscriptions.length === 0) {
      console.log(`📱 Nenhuma subscription encontrada para usuário ${userId}`);
      return { success: false, message: 'No subscriptions for user' };
    }

    console.log(`📨 Enviando para ${userSubscriptions.length} dispositivos do usuário ${userId}`);
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const subscription of userSubscriptions) {
      try {
        const result = await webpush.sendNotification(
          subscription.subscription,
          JSON.stringify(payload)
        );
        
        console.log(`✅ Push enviado com sucesso para dispositivo do usuário ${userId}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Erro ao enviar push para dispositivo do usuário ${userId}:`, error.message);
        failureCount++;
      }
    }
    
    console.log(`📊 RESULTADO USER PUSH: ${successCount} sucessos, ${failureCount} falhas`);
    
    return {
      success: successCount > 0,
      successCount,
      failureCount,
      message: `Enviado para ${successCount}/${userSubscriptions.length} dispositivos`
    };
    
  } catch (error) {
    console.error('❌ ERRO GERAL sendPushToSpecificUser:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Enviar push notification para todos os usuários
 * @param {object} payload - Payload da notificação
 */
async function sendPushToAll(payload) {
  try {
    console.log('🌍 ENVIANDO PUSH PARA TODOS OS USUÁRIOS');
    
    const subscriptionsPath = path.join(process.cwd(), 'push-subscriptions.json');
    
    if (!fs.existsSync(subscriptionsPath)) {
      console.log('📄 Arquivo push-subscriptions.json não encontrado');
      return { success: false, message: 'No subscriptions file' };
    }

    const subscriptionsData = fs.readFileSync(subscriptionsPath, 'utf8');
    const subscriptions = JSON.parse(subscriptionsData);
    
    if (subscriptions.length === 0) {
      console.log('📱 Nenhuma subscription encontrada');
      return { success: false, message: 'No subscriptions' };
    }

    console.log(`📨 Enviando para ${subscriptions.length} dispositivos...`);
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const subscriptionData of subscriptions) {
      try {
        const result = await webpush.sendNotification(
          subscriptionData.subscription,
          JSON.stringify(payload)
        );
        
        console.log(`✅ Push enviado com sucesso!`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Erro ao enviar push:`, error.message);
        failureCount++;
      }
    }
    
    console.log(`📊 RESULTADO BROADCAST: ${successCount} sucessos, ${failureCount} falhas`);
    
    return {
      success: successCount > 0,
      successCount,
      failureCount,
      message: `Enviado para ${successCount}/${subscriptions.length} dispositivos`
    };
    
  } catch (error) {
    console.error('❌ ERRO GERAL sendPushToAll:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Obter estatísticas de subscriptions
 */
function getSubscriptionStats() {
  try {
    const subscriptionsPath = path.join(process.cwd(), 'push-subscriptions.json');
    
    if (!fs.existsSync(subscriptionsPath)) {
      return { total: 0, recent: 0 };
    }

    const subscriptionsData = fs.readFileSync(subscriptionsPath, 'utf8');
    const subscriptions = JSON.parse(subscriptionsData);
    
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    
    const recentSubscriptions = subscriptions.filter(sub => 
      sub.timestamp && sub.timestamp > last24Hours
    );
    
    return {
      total: subscriptions.length,
      recent: recentSubscriptions.length
    };
    
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    return { total: 0, recent: 0 };
  }
}

module.exports = {
  sendPushToSpecificUser,
  sendPushToAll,
  getSubscriptionStats,
  vapidKeys
};