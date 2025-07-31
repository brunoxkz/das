const http = require('http');

// Teste completo dos ícones HD do VENDZZ
async function testIconsHD() {
  console.log('🧪 INICIANDO TESTE DOS ÍCONES HD VENDZZ');
  
  const icons = [
    { name: 'Favicon ICO', url: '/favicon.ico', expectedSize: 2734, contentType: 'image/x-icon' },
    { name: 'Apple Touch Icon', url: '/apple-touch-icon.png', expectedSize: 9547, contentType: 'image/png' },
    { name: 'PWA Icon 192x192', url: '/icon-192x192.png', expectedSize: 10147, contentType: 'image/png' },
    { name: 'PWA Icon 512x512', url: '/icon-512x512.png', expectedSize: 48975, contentType: 'image/png' }
  ];
  
  let passedTests = 0;
  let totalTests = icons.length;
  
  for (const icon of icons) {
    try {
      console.log(`\n🔍 Testando ${icon.name} (${icon.url})...`);
      
      const result = await new Promise((resolve, reject) => {
        const req = http.request({
          hostname: 'localhost',
          port: 5000,
          path: icon.url,
          method: 'HEAD'
        }, (res) => {
          resolve({
            statusCode: res.statusCode,
            contentType: res.headers['content-type'],
            contentLength: parseInt(res.headers['content-length'] || '0')
          });
        });
        
        req.on('error', reject);
        req.setTimeout(5000, () => reject(new Error('Timeout')));
        req.end();
      });
      
      // Verificações
      const statusOk = result.statusCode === 200;
      const typeOk = result.contentType === icon.contentType;
      const sizeOk = result.contentLength === icon.expectedSize;
      
      console.log(`   Status: ${result.statusCode} ${statusOk ? '✅' : '❌'}`);
      console.log(`   Content-Type: ${result.contentType} ${typeOk ? '✅' : '❌'}`);
      console.log(`   Tamanho: ${result.contentLength}B (esperado: ${icon.expectedSize}B) ${sizeOk ? '✅' : '❌'}`);
      
      if (statusOk && typeOk && sizeOk) {
        console.log(`✅ ${icon.name} - APROVADO EM ALTA QUALIDADE`);
        passedTests++;
      } else {
        console.log(`❌ ${icon.name} - REPROVADO`);
      }
      
    } catch (error) {
      console.log(`❌ ${icon.name} - ERRO: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 RESULTADO FINAL DO TESTE DE ÍCONES HD:`);
  console.log(`   Aprovados: ${passedTests}/${totalTests}`);
  console.log(`   Taxa de Sucesso: ${((passedTests/totalTests)*100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 TODOS OS ÍCONES HD FUNCIONANDO PERFEITAMENTE!');
    console.log('✅ Sistema PWA pronto para instalação com qualidade profissional');
    console.log('✅ Ícones otimizados para iPhone e Android');
    console.log('✅ Favicon de alta qualidade resolvido');
  } else {
    console.log('⚠️  Alguns ícones precisam de ajustes');
  }
  
  console.log('='.repeat(60));
}

// Executar teste
testIconsHD().catch(console.error);