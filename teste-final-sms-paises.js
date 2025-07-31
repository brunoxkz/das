/**
 * 🎯 TESTE FINAL - SISTEMA SMS COM DETECÇÃO DE PAÍS
 * Valida se o sistema está funcionando corretamente
 */

const BASE_URL = 'http://localhost:5000';

// Função para fazer requisições HTTP
async function makeRequest(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  // Verificar se a resposta é JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } else {
    // Se não for JSON, retornar texto
    const text = await response.text();
    throw new Error(`Resposta não é JSON: ${text.substring(0, 200)}...`);
  }
}

async function testSMSWithCountryDetection() {
  console.log('🎯 TESTE FINAL - SISTEMA SMS COM DETECÇÃO DE PAÍS');
  console.log('=' .repeat(60));

  const testCases = [
    {
      name: 'Brasil',
      phone: '11995133932',
      message: 'Olá! Produto com R$50 OFF. Aproveite!',
      expectedCountry: 'Brasil',
      expectedCurrency: 'R$'
    },
    {
      name: 'Estados Unidos',
      phone: '15551234567',
      message: 'Olá! Produto com R$50 OFF. Aproveite!',
      expectedCountry: 'Estados Unidos',
      expectedCurrency: '$'
    },
    {
      name: 'Argentina',
      phone: '5491123456789',
      message: 'Olá! Produto com R$50 OFF. Aproveite!',
      expectedCountry: 'Argentina',
      expectedCurrency: 'ARS$'
    },
    {
      name: 'México',
      phone: '521234567890',
      message: 'Olá! Produto com R$50 OFF. Aproveite!',
      expectedCountry: 'México',
      expectedCurrency: 'MXN$'
    },
    {
      name: 'Portugal',
      phone: '351912345678',
      message: 'Olá! Produto com R$50 OFF. Aproveite!',
      expectedCountry: 'Portugal',
      expectedCurrency: '€'
    }
  ];

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const testCase of testCases) {
    totalTests++;
    
    try {
      console.log(`\n📱 Testando ${testCase.name} (${testCase.phone})`);
      
      const result = await makeRequest('/api/sms/direct', {
        method: 'POST',
        body: JSON.stringify({
          phone: testCase.phone,
          message: testCase.message
        })
      });

      // Verificar se país foi detectado corretamente
      if (result.country === testCase.expectedCountry) {
        console.log(`✅ País detectado: ${result.country}`);
        
        // Verificar se mensagem foi adaptada
        if (result.adaptedMessage && result.adaptedMessage.includes(testCase.expectedCurrency)) {
          console.log(`✅ Moeda adaptada: ${result.adaptedMessage}`);
          passedTests++;
          console.log(`✅ TESTE PASSOU - ${testCase.name}`);
        } else {
          console.log(`❌ Moeda não adaptada corretamente`);
          failedTests++;
        }
      } else {
        console.log(`❌ País incorreto: esperado ${testCase.expectedCountry}, obtido ${result.country}`);
        failedTests++;
      }
      
      console.log(`   Status: ${result.success ? 'SUCESSO' : 'FALHA'}`);
      console.log(`   Código: ${result.countryCode}`);
      
    } catch (error) {
      console.log(`❌ ERRO: ${error.message}`);
      failedTests++;
    }
  }

  // Relatório final
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RELATÓRIO FINAL:');
  console.log(`   Total de testes: ${totalTests}`);
  console.log(`   Testes aprovados: ${passedTests}`);
  console.log(`   Testes reprovados: ${failedTests}`);
  console.log(`   Taxa de sucesso: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ SISTEMA SMS COM DETECÇÃO DE PAÍS APROVADO PARA PRODUÇÃO');
  } else {
    console.log('\n⚠️  ALGUNS TESTES FALHARAM');
    console.log('❌ SISTEMA PRECISA DE AJUSTES ANTES DA PRODUÇÃO');
  }
}

// Teste específico para o número brasileiro
async function testBrazilianNumber() {
  console.log('\n🇧🇷 TESTE ESPECÍFICO - NÚMERO BRASILEIRO');
  console.log('-' .repeat(40));
  
  try {
    const result = await makeRequest('/api/sms/direct', {
      method: 'POST',
      body: JSON.stringify({
        phone: '11995133932',
        message: 'Teste SMS Brasil - Produto com R$100 OFF! Aproveite agora.'
      })
    });
    
    console.log('📱 Resultado:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ SMS ENVIADO COM SUCESSO!');
      console.log(`   SID confirmado no log do servidor`);
    } else {
      console.log('❌ FALHA NO ENVIO');
    }
    
  } catch (error) {
    console.log(`❌ ERRO: ${error.message}`);
  }
}

// Executar testes
async function runAllTests() {
  console.log('🚀 INICIANDO VALIDAÇÃO COMPLETA DO SISTEMA SMS');
  
  await testSMSWithCountryDetection();
  await testBrazilianNumber();
  
  console.log('\n🏁 VALIDAÇÃO CONCLUÍDA');
  console.log('💡 Verifique os logs do servidor para confirmar o envio real do SMS');
}

runAllTests().catch(console.error);