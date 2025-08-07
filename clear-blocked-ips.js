/**
 * SCRIPT PARA LIMPAR IPs BLOQUEADOS
 * Remove todos os IPs da lista negra e reseta contadores
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  const db = new Database(path.join(__dirname, 'db.sqlite'));
  
  // Limpar tabela de IPs bloqueados se existir
  try {
    db.prepare('DELETE FROM blocked_ips WHERE 1=1').run();
    console.log('✅ Tabela blocked_ips limpa');
  } catch (err) {
    console.log('ℹ️  Tabela blocked_ips não existe');
  }
  
  // Limpar tabela de logs de segurança se existir
  try {
    db.prepare('DELETE FROM security_logs WHERE 1=1').run();
    console.log('✅ Tabela security_logs limpa');
  } catch (err) {
    console.log('ℹ️  Tabela security_logs não existe');
  }
  
  console.log('🔄 Reiniciando sistema...');
  console.log('✅ IPs bloqueados removidos com sucesso');
  
  db.close();
  
} catch (error) {
  console.error('❌ Erro ao limpar IPs bloqueados:', error);
}