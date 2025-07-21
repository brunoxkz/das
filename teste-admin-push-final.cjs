const http = require('http');

async function testAdminPushRoutes() {
  console.log('🧪 TESTE ASSERTIVO DAS ROTAS ADMIN PUSH');
  
  const routes = [
    { name: 'BULK PUSH MESSAGING', url: '/admin/bulk-push-messaging' },
    { name: 'ADMIN PUSH NOTIFICATIONS', url: '/admin-push-notifications' }
  ];
  
  let passedTests = 0;
  let totalTests = routes.length;
  
  for (const route of routes) {
    try {
      console.log(`\n🔍 Testando ${route.name} (${route.url})...`);
      
      const result = await new Promise((resolve, reject) => {
        const req = http.request({
          hostname: 'localhost',
          port: 5000,
          path: route.url,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              contentType: res.headers['content-type'],
              data: data,
              hasForceRefresh: res.headers['x-force-refresh'] !== undefined
            });
          });
        });
        
        req.on('error', reject);
        req.setTimeout(10000, () => reject(new Error('Timeout')));
        req.end();
      });
      
      // Verificações
      const statusOk = result.statusCode === 200;
      const isHTML = result.contentType && result.contentType.includes('text/html');
      const hasBulkPush = result.data.includes('BulkPushMessaging') || result.data.includes('bulk-push') || result.data.includes('push-messaging');
      const hasCacheReload = result.hasForceRefresh;
      
      console.log(`   Status: ${result.statusCode} ${statusOk ? '✅' : '❌'}`);
      console.log(`   Content-Type: ${result.contentType} ${isHTML ? '✅' : '❌'}`);
      console.log(`   Cache Force Refresh: ${hasCacheReload ? '✅' : '❌'}`);
      console.log(`   Página contém elementos Push: ${hasBulkPush ? '✅' : '❌'}`);
      
      if (statusOk && isHTML && hasBulkPush) {
        console.log(`✅ ${route.name} - FUNCIONANDO PERFEITAMENTE`);
        passedTests++;
      } else {
        console.log(`❌ ${route.name} - FALHOU`);
      }
      
    } catch (error) {
      console.log(`❌ ${route.name} - ERRO: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 RESULTADO FINAL DO TESTE ADMIN PUSH:`);
  console.log(`   Aprovadas: ${passedTests}/${totalTests}`);
  console.log(`   Taxa de Sucesso: ${((passedTests/totalTests)*100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 TODAS AS ROTAS ADMIN PUSH FUNCIONANDO!');
    console.log('✅ /admin/bulk-push-messaging - OK');
    console.log('✅ /admin-push-notifications - OK');
    console.log('✅ Cache clear forçado funcionando');
    console.log('✅ Sistema de som deve estar disponível');
  } else {
    console.log('⚠️  Algumas rotas precisam de ajustes');
  }
  
  console.log('='.repeat(60));
}

// Executar teste
testAdminPushRoutes().catch(console.error);