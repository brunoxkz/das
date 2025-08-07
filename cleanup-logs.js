// Script para limpar logs duplicados na campanha
import fs from 'fs';
import Database from 'better-sqlite3';

const db = new Database('./vendzz-database.db');

console.log('🧹 INICIANDO LIMPEZA DE LOGS DUPLICADOS...');

// Buscar logs da campanha específica
const campaignId = 'f3ddacd0-93ab-471a-af78-79b630d12dab';
const logs = db.prepare(`
  SELECT * FROM sms_logs 
  WHERE campaignId = ? 
  ORDER BY phone, createdAt DESC
`).all(campaignId);

console.log(`📊 LOGS ENCONTRADOS: ${logs.length}`);

// Agrupar por telefone e manter apenas o mais recente
const phoneMap = new Map();
logs.forEach(log => {
  if (!phoneMap.has(log.phone)) {
    phoneMap.set(log.phone, log);
  }
});

console.log(`📱 TELEFONES ÚNICOS: ${phoneMap.size}`);

// Deletar todos os logs da campanha
db.prepare(`DELETE FROM sms_logs WHERE campaignId = ?`).run(campaignId);
console.log('🗑️ LOGS ANTIGOS REMOVIDOS');

// Inserir apenas os logs únicos
const insert = db.prepare(`
  INSERT INTO sms_logs (id, campaignId, phone, message, status, twilioSid, errorMessage, sentAt, deliveredAt, scheduledAt, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

phoneMap.forEach(log => {
  insert.run(
    log.id,
    log.campaignId,
    log.phone,
    log.message,
    log.status,
    log.twilioSid,
    log.errorMessage,
    log.sentAt,
    log.deliveredAt,
    log.scheduledAt,
    log.createdAt
  );
});

console.log(`✅ LIMPEZA CONCLUÍDA: ${phoneMap.size} logs únicos mantidos`);

// Verificar resultado final
const finalCount = db.prepare(`SELECT COUNT(*) as count FROM sms_logs WHERE campaignId = ?`).get(campaignId);
console.log(`📋 TOTAL FINAL: ${finalCount.count} logs`);

db.close();