/**
 * SCRIPT PARA CORRIGIR PROBLEMAS DE CONEXÃO BLOQUEADA
 * Testa e resolve ERR_BLOCKED_BY_RESPONSE
 */

console.log('🔍 Diagnosticando problema de conexão bloqueada...');

// Função para testar conexão
async function testConnection() {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    console.log('✅ Conexão API funcionando:', data);
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão API:', error.message);
    return false;
  }
}

// Função para verificar Service Worker
function checkServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      if (registrations.length > 0) {
        console.log('🔄 Service Worker encontrado, removendo...');
        registrations.forEach(registration => {
          registration.unregister().then(() => {
            console.log('✅ Service Worker removido');
          });
        });
      } else {
        console.log('ℹ️ Nenhum Service Worker registrado');
      }
    });
  }
}

// Função para limpar cache
function clearBrowserCache() {
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      if (cacheNames.length > 0) {
        console.log('🧹 Limpando caches:', cacheNames);
        Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        ).then(() => {
          console.log('✅ Todos os caches limpos');
        });
      } else {
        console.log('ℹ️ Nenhum cache encontrado');
      }
    });
  }
}

// Executar diagnóstico
async function runDiagnostic() {
  console.log('📊 Iniciando diagnóstico completo...');
  
  // 1. Testar conexão básica
  const connectionOk = await testConnection();
  
  // 2. Verificar e remover Service Worker se necessário
  checkServiceWorker();
  
  // 3. Limpar caches
  clearBrowserCache();
  
  // 4. Aguardar e testar novamente
  setTimeout(async () => {
    console.log('🔄 Testando conexão após limpeza...');
    const secondTest = await testConnection();
    
    if (secondTest) {
      console.log('✅ PROBLEMA RESOLVIDO: Conexão funcionando normalmente');
      console.log('💡 Recomendação: Recarregue a página (F5) para aplicar as correções');
    } else {
      console.log('⚠️ Problema persiste. Possíveis causas:');
      console.log('   1. Firewall ou antivírus bloqueando');
      console.log('   2. Configuração de rede corporativa');
      console.log('   3. Proxy ou VPN interferindo');
      console.log('   4. Headers de segurança muito restritivos');
    }
  }, 2000);
}

// Executar
runDiagnostic();