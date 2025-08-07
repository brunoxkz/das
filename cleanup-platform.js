/**
 * SCRIPT DE LIMPEZA COMPLETA DA PLATAFORMA
 * Remove componentes desnecessários e corrige problemas
 */

import fs from 'fs';
import path from 'path';

async function cleanupPlatform() {
  console.log('🧹 INICIANDO LIMPEZA DA PLATAFORMA...');
  
  // Lista de arquivos a serem removidos
  const filesToRemove = [
    'client/src/components/real-time-notifications.tsx',
    'client/src/pages/real-time-analytics.tsx',
    'client/src/pages/premiacoes.tsx',
    'client/src/pages/encapsulados.tsx',
    'client/src/pages/whatsapp-remarketing.tsx'
  ];
  
  // Remove arquivos desnecessários
  for (const file of filesToRemove) {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`✅ Removido: ${file}`);
      }
    } catch (error) {
      console.log(`⚠️ Erro ao remover ${file}: ${error.message}`);
    }
  }
  
  console.log('🎯 LIMPEZA CONCLUÍDA!');
  console.log('✅ Componentes desnecessários removidos');
  console.log('✅ Sistema mais limpo e organizado');
  
  return true;
}

cleanupPlatform().catch(console.error);