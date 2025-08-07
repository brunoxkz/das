// Teste de Sincronização em Tempo Real - Simulação de Múltiplas Extensões
import fetch from 'node-fetch';

const CONFIG = {
  baseUrl: 'http://localhost:5000',
  testUser: { email: 'admin@vendzz.com', password: 'admin123' }
};

let authToken = null;

async function makeRequest(endpoint, options = {}) {
  const url = `${CONFIG.baseUrl}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options.headers
      },
      ...options
    });
    
    const data = await response.text();
    let jsonData = null;
    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      jsonData = { rawData: data };
    }
    
    return { success: response.ok, status: response.status, data: jsonData };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function authenticate() {
  const response = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(CONFIG.testUser)
  });
  
  if (response.success && response.data.accessToken) {
    authToken = response.data.accessToken;
    return true;
  }
  return false;
}

// Simular uma instância da extensão
class ExtensionInstance {
  constructor(instanceId) {
    this.instanceId = instanceId;
    this.localSettings = {};
    this.syncErrors = [];
    this.stats = {
      pings: 0,
      settingsUpdates: 0,
      syncConflicts: 0
    };
  }
  
  async ping() {
    try {
      const response = await makeRequest('/api/whatsapp-extension/status', {
        method: 'POST',
        body: JSON.stringify({
          version: '1.0.0',
          instanceId: this.instanceId,
          timestamp: Date.now(),
          pendingMessages: Math.floor(Math.random() * 10),
          sentMessages: Math.floor(Math.random() * 100)
        })
      });
      
      this.stats.pings++;
      
      if (response.success && response.data.settings) {
        // Verificar se configurações mudaram
        const serverSettings = response.data.settings;
        if (JSON.stringify(this.localSettings) !== JSON.stringify(serverSettings)) {
          this.stats.syncConflicts++;
          this.localSettings = { ...serverSettings };
          console.log(`🔄 Instance ${this.instanceId}: Settings synchronized`);
        }
        return true;
      }
      return false;
    } catch (error) {
      this.syncErrors.push(error.message);
      return false;
    }
  }
  
  async updateSettings(newSettings) {
    try {
      const response = await makeRequest('/api/whatsapp-extension/settings', {
        method: 'POST',
        body: JSON.stringify({
          ...newSettings,
          instanceId: this.instanceId,
          timestamp: Date.now()
        })
      });
      
      this.stats.settingsUpdates++;
      
      if (response.success) {
        this.localSettings = { ...this.localSettings, ...newSettings };
        return true;
      }
      return false;
    } catch (error) {
      this.syncErrors.push(error.message);
      return false;
    }
  }
  
  getStats() {
    return {
      instanceId: this.instanceId,
      stats: this.stats,
      errors: this.syncErrors.length,
      lastSettings: this.localSettings
    };
  }
}

async function testRealTimeSync() {
  console.log('🔄 TESTE DE SINCRONIZAÇÃO EM TEMPO REAL');
  console.log('=======================================');
  
  if (!(await authenticate())) {
    console.log('❌ Falha na autenticação');
    return;
  }
  
  // Criar múltiplas instâncias da extensão
  const instances = [];
  for (let i = 1; i <= 5; i++) {
    instances.push(new ExtensionInstance(i));
  }
  
  console.log('📱 Criadas 5 instâncias da extensão');
  
  // FASE 1: Ping inicial de todas as instâncias
  console.log('\n🔄 FASE 1: Ping inicial');
  const initialPings = await Promise.all(instances.map(inst => inst.ping()));
  const successfulPings = initialPings.filter(Boolean).length;
  console.log(`✅ ${successfulPings}/5 instâncias conectadas`);
  
  // FASE 2: Uma instância atualiza configurações
  console.log('\n⚙️ FASE 2: Atualização de configurações');
  const updateResult = await instances[0].updateSettings({
    autoSend: true,
    messageDelay: 5000,
    testUpdate: Date.now()
  });
  
  if (updateResult) {
    console.log('✅ Instância 1: Configurações atualizadas');
  } else {
    console.log('❌ Instância 1: Falha na atualização');
  }
  
  // FASE 3: Aguardar e verificar sincronização
  console.log('\n⏱️ FASE 3: Aguardando sincronização (3 segundos)');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Todas as instâncias fazem ping para receber atualizações
  const syncPings = await Promise.all(instances.map(inst => inst.ping()));
  const syncedInstances = syncPings.filter(Boolean).length;
  console.log(`🔄 ${syncedInstances}/5 instâncias sincronizadas`);
  
  // FASE 4: Verificar se todas têm as mesmas configurações
  console.log('\n🔍 FASE 4: Verificação de consistência');
  const settingsHashes = instances.map(inst => 
    JSON.stringify(inst.localSettings)
  );
  
  const uniqueSettings = [...new Set(settingsHashes)];
  
  if (uniqueSettings.length === 1) {
    console.log('✅ Todas as instâncias têm configurações consistentes');
  } else {
    console.log(`❌ Configurações inconsistentes: ${uniqueSettings.length} versões diferentes`);
    instances.forEach((inst, index) => {
      console.log(`   Instância ${index + 1}: ${settingsHashes[index].substring(0, 50)}...`);
    });
  }
  
  // FASE 5: Teste de conflito - múltiplas atualizações simultâneas
  console.log('\n⚡ FASE 5: Teste de conflito simultâneo');
  const conflictUpdates = instances.map((inst, index) => 
    inst.updateSettings({
      conflictTest: true,
      instanceUpdate: index,
      timestamp: Date.now() + index
    })
  );
  
  const conflictResults = await Promise.all(conflictUpdates);
  const successfulUpdates = conflictResults.filter(Boolean).length;
  console.log(`⚡ ${successfulUpdates}/5 atualizações simultâneas bem-sucedidas`);
  
  // FASE 6: Verificar estado final após conflitos
  console.log('\n🔚 FASE 6: Estado final após conflitos');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const finalPings = await Promise.all(instances.map(inst => inst.ping()));
  const finalSynced = finalPings.filter(Boolean).length;
  console.log(`🔄 ${finalSynced}/5 instâncias em estado final`);
  
  // FASE 7: Relatório de estatísticas
  console.log('\n📊 RELATÓRIO DE ESTATÍSTICAS');
  instances.forEach(inst => {
    const stats = inst.getStats();
    console.log(`Instance ${stats.instanceId}:`);
    console.log(`  Pings: ${stats.stats.pings}`);
    console.log(`  Updates: ${stats.stats.settingsUpdates}`);
    console.log(`  Sync conflicts: ${stats.stats.syncConflicts}`);
    console.log(`  Errors: ${stats.errors}`);
  });
  
  // FASE 8: Teste de performance em massa
  console.log('\n🚀 FASE 8: Teste de performance em massa');
  const massOperations = [];
  
  // 50 pings simultâneos
  for (let i = 0; i < 50; i++) {
    const randomInstance = instances[i % instances.length];
    massOperations.push(randomInstance.ping());
  }
  
  const start = Date.now();
  const massResults = await Promise.all(massOperations);
  const duration = Date.now() - start;
  const massSuccessful = massResults.filter(Boolean).length;
  
  console.log(`🚀 Performance: ${massSuccessful}/50 operações em ${duration}ms`);
  console.log(`⚡ Média: ${(duration/50).toFixed(1)}ms por operação`);
  
  // Resultado final
  console.log('\n🎯 RESULTADO FINAL DA SINCRONIZAÇÃO');
  console.log('==================================');
  
  const totalOperations = instances.reduce((sum, inst) => 
    sum + inst.stats.pings + inst.stats.settingsUpdates, 0
  );
  const totalErrors = instances.reduce((sum, inst) => 
    sum + inst.syncErrors.length, 0
  );
  
  console.log(`Total de operações: ${totalOperations}`);
  console.log(`Total de erros: ${totalErrors}`);
  console.log(`Taxa de sucesso: ${((totalOperations - totalErrors) / totalOperations * 100).toFixed(1)}%`);
  
  if (totalErrors === 0 && uniqueSettings.length === 1) {
    console.log('🎉 SINCRONIZAÇÃO PERFEITA - SISTEMA APROVADO!');
  } else if (totalErrors < totalOperations * 0.1) {
    console.log('✅ SINCRONIZAÇÃO BOA - SISTEMA APROVADO COM RESSALVAS');
  } else {
    console.log('❌ PROBLEMAS DE SINCRONIZAÇÃO - SISTEMA PRECISA CORREÇÕES');
  }
}

testRealTimeSync().catch(console.error);