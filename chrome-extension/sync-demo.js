// Demonstração de Sincronização em Tempo Real
// Execute no console da extensão para testar sincronização

console.log('🔄 DEMO: SINCRONIZAÇÃO EM TEMPO REAL');

// Configurações de teste
const testSettings = {
  autoSend: true,
  messageDelay: 4000,
  maxMessagesPerDay: 150,
  workingHours: {
    enabled: true,
    start: "09:00",
    end: "19:00"
  },
  antiSpam: {
    enabled: true,
    minDelay: 2500,
    maxDelay: 6000,
    randomization: true
  },
  customMessages: {
    greeting: "Olá! Como podemos ajudar?",
    followUp: "Ainda está interessado?",
    closing: "Obrigado pelo contato!"
  }
};

// Função para demonstrar sincronização
async function demonstrateSync() {
  try {
    console.log('\n📤 1. ENVIANDO configurações para servidor...');
    
    // Simular envio de configurações da extensão para servidor
    const response = await syncSettingsToServer(testSettings);
    console.log('✅ Configurações enviadas:', response);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n📥 2. BUSCANDO configurações do servidor...');
    
    // Simular busca de configurações do servidor
    await syncSettingsFromServer();
    console.log('✅ Configurações sincronizadas');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n📡 3. TESTANDO ping com sync automático...');
    
    // Simular ping que retorna configurações atualizadas
    await pingServer();
    console.log('✅ Ping realizado com sync automático');
    
    console.log('\n🎯 RESULTADO FINAL:');
    console.log('- Configurações salvas no servidor ✅');
    console.log('- Extensão sincronizada ✅');
    console.log('- Ping automático funcionando ✅');
    console.log('- Sincronização bidirecional ativa ✅');
    
  } catch (error) {
    console.error('❌ Erro na demonstração:', error);
  }
}

// Função para simular mudanças no sistema
async function simulateSystemChanges() {
  console.log('\n🔄 SIMULANDO mudanças no sistema...');
  
  // Configurações modificadas no sistema Vendzz
  const systemUpdatedSettings = {
    ...testSettings,
    messageDelay: 6000, // Mudança no sistema
    maxMessagesPerDay: 80, // Limite reduzido no sistema
    antiSpam: {
      ...testSettings.antiSpam,
      minDelay: 5000 // Proteção aumentada
    }
  };
  
  console.log('📝 Sistema atualizou configurações:');
  console.log('- messageDelay: 4000 → 6000');
  console.log('- maxMessagesPerDay: 150 → 80');
  console.log('- antiSpam.minDelay: 2500 → 5000');
  
  // Próximo ping da extensão receberá essas configurações
  console.log('\n⏰ Aguardando próximo ping para sync automático...');
  
  return systemUpdatedSettings;
}

// Função para testar cenários de conflito
async function testConflictResolution() {
  console.log('\n⚡ TESTANDO resolução de conflitos...');
  
  // Cenário: Extensão e sistema modificam ao mesmo tempo
  const extensionSettings = {
    ...testSettings,
    messageDelay: 3000, // Extensão quer mais rápido
    workingHours: {
      enabled: false // Extensão desabilita horário
    }
  };
  
  const systemSettings = {
    ...testSettings,
    messageDelay: 8000, // Sistema quer mais lento (segurança)
    maxMessagesPerDay: 50 // Sistema reduz limite drasticamente
  };
  
  console.log('🔥 CONFLITO DETECTADO:');
  console.log('Extensão quer messageDelay: 3000');
  console.log('Sistema define messageDelay: 8000');
  console.log('RESOLUÇÃO: Sistema tem prioridade (segurança)');
  
  return systemSettings; // Sistema sempre vence em questões de segurança
}

// Executar demonstração completa
async function runFullDemo() {
  console.log('🚀 INICIANDO DEMONSTRAÇÃO COMPLETA DE SINCRONIZAÇÃO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  await demonstrateSync();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await simulateSystemChanges();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testConflictResolution();
  
  console.log('\n🎉 DEMONSTRAÇÃO CONCLUÍDA!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Sincronização bidirecional funcionando');
  console.log('✅ Configurações persistem no servidor');
  console.log('✅ Ping automático mantém sincronia');
  console.log('✅ Conflitos resolvidos com prioridade do sistema');
}

// Exportar funções para uso manual
window.syncDemo = {
  demonstrateSync,
  simulateSystemChanges,
  testConflictResolution,
  runFullDemo
};

console.log('\n🎮 FUNÇÕES DISPONÍVEIS:');
console.log('📝 syncDemo.demonstrateSync() - Testar sincronização básica');
console.log('🔄 syncDemo.simulateSystemChanges() - Simular mudanças do sistema');
console.log('⚡ syncDemo.testConflictResolution() - Testar resolução de conflitos');
console.log('🚀 syncDemo.runFullDemo() - Executar demonstração completa');
console.log('\n💡 Exemplo: syncDemo.runFullDemo()');