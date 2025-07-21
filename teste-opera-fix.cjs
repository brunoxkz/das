// Teste para verificar se o MIME type do Service Worker está correto no Opera
const http = require('http');

console.log('🔧 TESTE OPERA FIX - Verificando MIME type do Service Worker');

const testServiceWorker = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:5000/sw-simple.js', (res) => {
      const contentType = res.headers['content-type'];
      const serviceWorkerAllowed = res.headers['service-worker-allowed'];
      
      console.log('📄 Content-Type:', contentType);
      console.log('🔧 Service-Worker-Allowed:', serviceWorkerAllowed);
      
      // Verificar se o MIME type está correto
      if (contentType && contentType.includes('application/javascript')) {
        console.log('✅ MIME type correto para Opera!');
        resolve(true);
      } else {
        console.log('❌ MIME type incorreto:', contentType);
        resolve(false);
      }
    });
    
    req.on('error', (err) => {
      console.error('❌ Erro na requisição:', err.message);
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      console.log('⏰ Timeout na requisição');
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

const runTest = async () => {
  try {
    console.log('🚀 Iniciando teste...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar servidor
    
    const result = await testServiceWorker();
    
    if (result) {
      console.log('🎉 CORREÇÃO OPERA APLICADA COM SUCESSO!');
      console.log('📱 Agora o Opera deve aceitar o Service Worker');
    } else {
      console.log('⚠️  Ainda há problemas com o MIME type');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
};

runTest();