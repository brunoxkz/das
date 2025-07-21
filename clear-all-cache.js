#!/usr/bin/env node

/**
 * SCRIPT COMPLETO DE LIMPEZA DE CACHE
 * Remove todos os caches do sistema para garantir funcionamento limpo
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function clearAllCache() {
  console.log('🧹 INICIANDO LIMPEZA COMPLETA DE CACHE...');
  
  const cacheDirs = [
    'node_modules/.cache',
    '.vite',
    'dist',
    'client/dist',
    '.next',
    '.nuxt',
    'uploads/temp',
    '.cache'
  ];
  
  // Limpar diretórios de cache
  for (const dir of cacheDirs) {
    try {
      if (fs.existsSync(dir)) {
        await execAsync(`rm -rf ${dir}`);
        console.log(`✅ Removido: ${dir}`);
      }
    } catch (error) {
      console.log(`⚠️  Não foi possível remover: ${dir}`);
    }
  }
  
  // Limpar arquivos temporários
  try {
    await execAsync('find . -name "*.tmp" -type f -delete 2>/dev/null || true');
    console.log('✅ Arquivos .tmp removidos');
  } catch (error) {
    console.log('⚠️  Não foi possível remover arquivos .tmp');
  }
  
  // Limpar logs
  try {
    await execAsync('find . -name "*.log" -type f -delete 2>/dev/null || true');
    console.log('✅ Arquivos .log removidos');
  } catch (error) {
    console.log('⚠️  Não foi possível remover arquivos .log');
  }
  
  console.log('✅ LIMPEZA DE CACHE CONCLUÍDA!');
  console.log('🔄 Recomenda-se reiniciar o servidor após esta limpeza');
}

clearAllCache().catch(console.error);