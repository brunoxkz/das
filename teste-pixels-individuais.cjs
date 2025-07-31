/**
 * TESTE INDIVIDUAL DE PIXELS - VALIDAÇÃO COMPLETA
 * Testa cada tipo de pixel individualmente: inserção, salvamento, funcionamento
 * LEMBRETE: Quiz deve estar PUBLICADO para pixels serem salvos corretamente
 */

const QUIZ_ID = 'DQzYMWml7p-GraT-IEvgh';
const BASE_URL = 'http://localhost:5000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFFYVk2dkUwcllBa1RYdjV2SENsbSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInJvbGUiOiJhZG1pbiIsInBsYW4iOiJlbnRlcnByaXNlIiwiaWF0IjoxNzUyMTMxNzAwLCJub25jZSI6Imd4Ym1vaiIsImV4cCI6MTc1MjEzMjYwMH0.z7Hi2BCrLK-XasG37xrhR3kRa7JapIwMjo1z5hoS9jA';

// Definir pixels de teste
const PIXELS_TESTE = [
  {
    id: 'meta-test',
    type: 'meta',
    name: 'Meta/Facebook',
    value: '123456789012345',
    mode: 'pixel',
    isActive: true,
    expectedCode: 'fbq'
  },
  {
    id: 'ga4-test',
    type: 'ga4',
    name: 'Google Analytics 4',
    value: 'G-XXXXXXXXXX',
    mode: 'pixel',
    isActive: true,
    expectedCode: 'gtag'
  },
  {
    id: 'tiktok-test',
    type: 'tiktok',
    name: 'TikTok',
    value: 'C4A7B1C2D3E4F5G6H7I8J9K0L1M2N3O4',
    mode: 'pixel',
    isActive: true,
    expectedCode: 'ttq'
  },
  {
    id: 'linkedin-test',
    type: 'linkedin',
    name: 'LinkedIn',
    value: '1234567',
    mode: 'pixel',
    isActive: true,
    expectedCode: '_linkedin_partner_id'
  },
  {
    id: 'pinterest-test',
    type: 'pinterest',
    name: 'Pinterest',
    value: '2613123456789',
    mode: 'pixel',
    isActive: true,
    expectedCode: 'pintrk'
  },
  {
    id: 'twitter-test',
    type: 'twitter',
    name: 'Twitter/X',
    value: 'o1234',
    mode: 'pixel',
    isActive: true,
    expectedCode: 'twq'
  },
  {
    id: 'snapchat-test',
    type: 'snapchat',
    name: 'Snapchat',
    value: '12345678-1234-1234-1234-123456789012',
    mode: 'pixel',
    isActive: true,
    expectedCode: 'snaptr'
  }
];

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
      ...options.headers
    }
  });
  
  const data = await response.json();
  return { response, data };
}

async function testePixelIndividual(pixel) {
  console.log(`\n🔍 TESTANDO PIXEL: ${pixel.name}`);
  console.log('─'.repeat(50));
  
  const resultados = {
    configuracao: false,
    salvamento: false,
    recuperacao: false,
    geracao: false,
    codigo: false
  };
  
  try {
    // 1. Configurar pixel individual
    console.log(`1. Configurando pixel ${pixel.type}...`);
    const { response: configResponse, data: configData } = await makeRequest(`/api/quiz/${QUIZ_ID}/pixels`, {
      method: 'PUT',
      body: JSON.stringify({
        pixels: [pixel],
        pixelDelay: false,
        customScripts: []
      })
    });
    
    if (configResponse.ok) {
      resultados.configuracao = true;
      console.log('✅ Pixel configurado com sucesso');
    } else {
      console.log('❌ Erro na configuração:', configData.message);
      return resultados;
    }
    
    // 2. Verificar se foi salvo
    console.log(`2. Verificando salvamento...`);
    const { response: getResponse, data: getData } = await makeRequest(`/api/quiz/${QUIZ_ID}/pixels`);
    
    if (getResponse.ok && getData.pixels && getData.pixels.length > 0) {
      const pixelSalvo = getData.pixels.find(p => p.type === pixel.type);
      if (pixelSalvo && pixelSalvo.value === pixel.value) {
        resultados.salvamento = true;
        console.log('✅ Pixel salvo corretamente');
      } else {
        console.log('❌ Pixel não encontrado ou valor incorreto');
        return resultados;
      }
    } else {
      console.log('❌ Erro ao recuperar pixels salvos');
      return resultados;
    }
    
    // 3. Verificar configuração pública
    console.log(`3. Verificando configuração pública...`);
    const { response: publicResponse, data: publicData } = await makeRequest(`/api/quiz/${QUIZ_ID}/pixels/public`);
    
    if (publicResponse.ok && publicData.pixels) {
      const pixelPublico = publicData.pixels.find(p => p.type === pixel.type);
      if (pixelPublico && pixelPublico.value === pixel.value) {
        resultados.recuperacao = true;
        console.log('✅ Pixel disponível na configuração pública');
      } else {
        console.log('❌ Pixel não disponível na configuração pública');
        return resultados;
      }
    } else {
      console.log('❌ Erro na configuração pública');
      return resultados;
    }
    
    // 4. Testar geração de código
    console.log(`4. Testando geração de código...`);
    const { response: generateResponse, data: generateData } = await makeRequest(`/api/quiz/${QUIZ_ID}/pixels/generate`, {
      method: 'POST'
    });
    
    if (generateResponse.ok && generateData.codes) {
      resultados.geracao = true;
      console.log('✅ Código gerado com sucesso');
      
      // 5. Verificar se código contém elementos esperados
      console.log(`5. Verificando código gerado...`);
      const codigo = generateData.codes;
      
      if (codigo.includes(pixel.expectedCode) && codigo.includes(pixel.value)) {
        resultados.codigo = true;
        console.log('✅ Código contém elementos esperados');
        console.log(`   - Contém ${pixel.expectedCode}: ✓`);
        console.log(`   - Contém ${pixel.value}: ✓`);
      } else {
        console.log('❌ Código não contém elementos esperados');
        console.log(`   - Contém ${pixel.expectedCode}: ${codigo.includes(pixel.expectedCode) ? '✓' : '✗'}`);
        console.log(`   - Contém ${pixel.value}: ${codigo.includes(pixel.value) ? '✓' : '✗'}`);
      }
    } else {
      console.log('❌ Erro na geração de código');
    }
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error.message);
  }
  
  return resultados;
}

async function verificarQuizPublicado() {
  console.log('\n🔍 VERIFICANDO STATUS DO QUIZ...');
  const { response, data } = await makeRequest(`/api/quizzes/${QUIZ_ID}`);
  
  if (response.ok && data.isPublished) {
    console.log('✅ Quiz está PUBLICADO - pixels serão salvos corretamente');
    return true;
  } else {
    console.log('⚠️  ATENÇÃO: Quiz NÃO está publicado!');
    console.log('🔔 LEMBRETE: Publique o quiz para que os pixels sejam salvos corretamente');
    return false;
  }
}

async function executarTodosOsTestes() {
  console.log('🚀 TESTE INDIVIDUAL DE PIXELS - VALIDAÇÃO COMPLETA');
  console.log('════════════════════════════════════════════════════');
  
  // Verificar se quiz está publicado
  const quizPublicado = await verificarQuizPublicado();
  
  const resultadosGerais = {};
  
  // Testar cada pixel individualmente
  for (const pixel of PIXELS_TESTE) {
    const resultados = await testePixelIndividual(pixel);
    resultadosGerais[pixel.type] = resultados;
  }
  
  // Relatório final
  console.log('\n════════════════════════════════════════════════════');
  console.log('📊 RELATÓRIO FINAL - TESTE DE PIXELS INDIVIDUAIS');
  console.log('════════════════════════════════════════════════════');
  
  let totalTestes = 0;
  let testesAprovados = 0;
  
  Object.entries(resultadosGerais).forEach(([tipo, resultados]) => {
    const aprovados = Object.values(resultados).filter(Boolean).length;
    const total = Object.keys(resultados).length;
    const taxa = ((aprovados / total) * 100).toFixed(1);
    
    totalTestes += total;
    testesAprovados += aprovados;
    
    console.log(`\n${tipo.toUpperCase()}:`);
    console.log(`  Taxa de sucesso: ${aprovados}/${total} (${taxa}%)`);
    Object.entries(resultados).forEach(([teste, sucesso]) => {
      const emoji = sucesso ? '✅' : '❌';
      console.log(`  ${emoji} ${teste}`);
    });
  });
  
  const taxaGeral = ((testesAprovados / totalTestes) * 100).toFixed(1);
  console.log(`\n📈 TAXA GERAL DE SUCESSO: ${testesAprovados}/${totalTestes} (${taxaGeral}%)`);
  
  if (!quizPublicado) {
    console.log('\n🔔 LEMBRETE IMPORTANTE:');
    console.log('   Para que os pixels sejam salvos corretamente,');
    console.log('   certifique-se de PUBLICAR o quiz antes de configurar pixels!');
  }
  
  console.log('\n🏁 TESTE INDIVIDUAL DE PIXELS FINALIZADO');
  
  return { resultadosGerais, taxaGeral, quizPublicado };
}

// Executar testes
executarTodosOsTestes().catch(console.error);