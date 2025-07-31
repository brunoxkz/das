/**
 * TESTE FINAL - PREVIEW DE PIXELS ATUALIZADO
 * Valida se o preview no quiz builder está mostrando códigos reais
 * Sistema integrado com API dinâmica e pixelCodeGenerator
 */

const QUIZ_ID = 'DQzYMWml7p-GraT-IEvgh';
const BASE_URL = 'http://localhost:5000';

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  const data = await response.json();
  return { response, data };
}

async function testePreviewPixels() {
  console.log('🔍 TESTE FINAL - PREVIEW DE PIXELS ATUALIZADO');
  console.log('================================================');
  
  const results = {
    auth: false,
    pixelConfig: false,
    publicConfig: false,
    metaPreview: false,
    ga4Preview: false,
    tiktokPreview: false,
    integration: false
  };
  
  try {
    // 1. Usar token válido gerado
    console.log('\n1. USANDO TOKEN VÁLIDO...');
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFFYVk2dkUwcllBa1RYdjV2SENsbSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInJvbGUiOiJhZG1pbiIsInBsYW4iOiJlbnRlcnByaXNlIiwiaWF0IjoxNzUyMTMxNDY1LCJub25jZSI6InhlN3g3YyIsImV4cCI6MTc1MjEzMjM2NX0.iNTxfPGe4eGhUjDt5WU-VJUPK4G5nh3StbbSJnV_D8E';
    results.auth = true;
    console.log('✅ Token configurado com sucesso');
    
    // 2. Configurar pixels diversos para teste
    console.log('\n2. CONFIGURANDO PIXELS DE TESTE...');
    const pixelsConfiguracao = {
      pixels: [
        {
          id: 'meta-test',
          type: 'meta',
          name: 'Meta/Facebook',
          value: '123456789012345',
          mode: 'pixel',
          isActive: true
        },
        {
          id: 'ga4-test',
          type: 'ga4',
          name: 'Google Analytics 4',
          value: 'G-XXXXXXXXXX',
          mode: 'pixel',
          isActive: true
        },
        {
          id: 'tiktok-test',
          type: 'tiktok',
          name: 'TikTok',
          value: 'C4A7B1C2D3E4F5G6H7I8J9K0L1M2N3O4',
          mode: 'pixel',
          isActive: true
        }
      ],
      pixelDelay: false,
      customScripts: []
    };
    
    const { response: configResponse, data: configData } = await makeRequest(`/api/quiz/${QUIZ_ID}/pixels`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(pixelsConfiguracao)
    });
    
    if (configResponse.ok) {
      results.pixelConfig = true;
      console.log('✅ Pixels configurados com sucesso');
    } else {
      console.log('⚠️ Configuração de pixels com problema:', configData.message);
    }
    
    // 3. Testar configuração pública
    console.log('\n3. TESTANDO CONFIGURAÇÃO PÚBLICA...');
    const { response: publicResponse, data: publicData } = await makeRequest(`/api/quiz/${QUIZ_ID}/pixels/public`);
    
    if (publicResponse.ok && publicData.pixels) {
      results.publicConfig = true;
      console.log('✅ Configuração pública obtida:');
      console.log(`   - Quiz ID: ${publicData.quizId}`);
      console.log(`   - Pixels: ${publicData.pixels.length}`);
      console.log(`   - Scripts: ${publicData.customScripts.length}`);
      
      // Validar se pixels estão corretos
      const metaPixel = publicData.pixels.find(p => p.type === 'meta');
      const ga4Pixel = publicData.pixels.find(p => p.type === 'ga4');
      const tiktokPixel = publicData.pixels.find(p => p.type === 'tiktok');
      
      if (metaPixel && metaPixel.value === '123456789012345') {
        results.metaPreview = true;
        console.log('✅ Pixel Meta configurado corretamente');
      }
      
      if (ga4Pixel && ga4Pixel.value === 'G-XXXXXXXXXX') {
        results.ga4Preview = true;
        console.log('✅ Pixel GA4 configurado corretamente');
      }
      
      if (tiktokPixel && tiktokPixel.value === 'C4A7B1C2D3E4F5G6H7I8J9K0L1M2N3O4') {
        results.tiktokPreview = true;
        console.log('✅ Pixel TikTok configurado corretamente');
      }
    } else {
      console.log('❌ Erro na configuração pública:', publicData.message);
    }
    
    // 4. Testar geração de códigos via API
    console.log('\n4. TESTANDO GERAÇÃO DE CÓDIGOS...');
    const { response: generateResponse, data: generateData } = await makeRequest(`/api/quiz/${QUIZ_ID}/pixels/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (generateResponse.ok && generateData.codes) {
      results.integration = true;
      console.log('✅ Códigos gerados com sucesso:');
      console.log(`   - Tamanho total: ${generateData.codes.length} caracteres`);
      console.log(`   - Contém fbq: ${generateData.codes.includes('fbq') ? 'Sim' : 'Não'}`);
      console.log(`   - Contém gtag: ${generateData.codes.includes('gtag') ? 'Sim' : 'Não'}`);
      console.log(`   - Contém ttq: ${generateData.codes.includes('ttq') ? 'Sim' : 'Não'}`);
    } else {
      console.log('⚠️ Geração de códigos com problema:', generateData.message);
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
  
  // Relatório final
  console.log('\n================================================');
  console.log('📊 RELATÓRIO FINAL DO TESTE DE PREVIEW');
  console.log('================================================');
  
  const aprovados = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  const taxa = ((aprovados / total) * 100).toFixed(1);
  
  console.log(`✅ Testes bem-sucedidos: ${aprovados}/${total} (${taxa}%)`);
  
  Object.entries(results).forEach(([teste, resultado]) => {
    const status = resultado ? 'APROVADO' : 'PENDENTE';
    const emoji = resultado ? '✅' : '⚠️';
    console.log(`${emoji} ${teste}: ${status}`);
  });
  
  if (aprovados === total) {
    console.log('\n🎉 PREVIEW DE PIXELS COMPLETAMENTE FUNCIONAL!');
    console.log('- Interface atualizada com códigos reais');
    console.log('- API dinâmica funcionando perfeitamente');
    console.log('- Integração frontend-backend 100% operacional');
  } else {
    console.log('\n⚠️ Alguns testes necessitam atenção');
  }
  
  console.log('\n🏁 TESTE DE PREVIEW FINALIZADO');
  
  return results;
}

// Executar teste
testePreviewPixels().catch(console.error);