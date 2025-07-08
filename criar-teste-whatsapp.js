// Script para criar teste WhatsApp direto
import sqlite3 from 'sqlite3';
import { nanoid } from 'nanoid';

async function criarTesteWhatsApp() {
  console.log('🧪 CRIANDO TESTE WHATSAPP DIRETO');
  console.log('================================');
  
  const db = new sqlite3.Database('./vendzz-database.db');
  
  // IDs únicos
  const campaignId = nanoid();
  const logId = nanoid();
  const userId = 'KjctNCOlM5jcafgA_drVQ'; // ID do admin
  
  console.log('📋 Campaign ID:', campaignId);
  console.log('📱 Log ID:', logId);
  
  try {
    // Inserir campanha
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO whatsapp_campaigns (
          id, user_id, quiz_id, quiz_title, name, messages, 
          target_audience, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        campaignId,
        userId,
        'teste-manual',
        'Teste Manual',
        'Teste Manual - Olá 5511995133932',
        JSON.stringify(['Olá']),
        'all',
        'active',
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000)
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Campanha criada!');
    
    // Inserir log
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO whatsapp_logs (
          id, campaign_id, phone, message, status, 
          scheduled_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        logId,
        campaignId,
        '5511995133932',
        'Olá',
        'scheduled',
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000)
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Mensagem agendada!');
    
    // Verificar
    await new Promise((resolve, reject) => {
      db.get(`
        SELECT wl.phone, wl.message, wl.status, wc.name as campaign_name
        FROM whatsapp_logs wl
        JOIN whatsapp_campaigns wc ON wl.campaign_id = wc.id
        WHERE wl.id = ?
      `, [logId], (err, row) => {
        if (err) reject(err);
        else {
          console.log('');
          console.log('🔍 MENSAGEM CRIADA:');
          console.log('==================');
          console.log('📱 Telefone:', row.phone);
          console.log('💬 Mensagem:', row.message);
          console.log('📋 Status:', row.status);
          console.log('🏷️ Campanha:', row.campaign_name);
          resolve();
        }
      });
    });
    
    console.log('');
    console.log('🚀 TESTE PRONTO!');
    console.log('================');
    console.log('');
    console.log('📱 Mensagem criada para: 5511995133932');
    console.log('💬 Texto: Olá');
    console.log('📋 Status: scheduled (pronto para envio)');
    console.log('');
    console.log('🔄 A extensão detectará automaticamente nos próximos 30 segundos');
    console.log('📊 Você pode acompanhar na dashboard da extensão');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    db.close();
  }
}

criarTesteWhatsApp().catch(console.error);