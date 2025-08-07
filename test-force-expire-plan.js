#!/usr/bin/env node

// Script para simular expiração de plano e testar bloqueios

import { storage } from './server/storage-sqlite.js';

async function forceExpirePlan() {
  try {
    console.log('🔧 Forçando expiração do plano do usuário admin...');
    
    // Buscar usuário admin
    const adminUser = await storage.getUserById('admin-user-id');
    console.log('👤 Usuário atual:', {
      id: adminUser?.id,
      plan: adminUser?.plan,
      planExpirationDate: adminUser?.planExpirationDate,
      isBlocked: adminUser?.isBlocked
    });
    
    // Forçar expiração (data no passado)
    const expiredDate = new Date('2023-01-01').toISOString();
    
    await storage.updateUserPlan('admin-user-id', {
      plan: 'basic',
      planExpirationDate: expiredDate,
      isBlocked: true,
      blockReason: 'Plano expirado - Teste de bloqueio'
    });
    
    console.log('✅ Plano expirado com sucesso');
    
    // Verificar estado final
    const updatedUser = await storage.getUserById('admin-user-id');
    console.log('👤 Usuário após expiração:', {
      id: updatedUser?.id,
      plan: updatedUser?.plan,
      planExpirationDate: updatedUser?.planExpirationDate,
      isBlocked: updatedUser?.isBlocked,
      blockReason: updatedUser?.blockReason
    });
    
  } catch (error) {
    console.error('❌ Erro ao forçar expiração:', error);
  }
}

forceExpirePlan().then(() => {
  console.log('🧪 Agora execute: node test-plan-blocking-system.js');
}).catch(console.error);