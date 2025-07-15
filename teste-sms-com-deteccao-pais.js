/**
 * 🧪 TESTE COMPLETO - SMS COM DETECÇÃO DE PAÍS
 * Testa o endpoint /api/sms/direct com detectção automática de país
 */

const BASE_URL = 'https://213e1b23-2bf1-4b9a-806a-b24f2a4b81d8-00-2jqhpg18e1x9m.worf.replit.dev';

// Teste para diferentes países
async function testCountryDetection() {
  console.log('🌍 TESTE DE DETECÇÃO DE PAÍS - INICIADO');
  
  const testCases = [
    {
      phone: '11995133932',
      message: 'Olá! Oferta especial com R$50 OFF. Aproveite agora!',
      expectedCountry: 'Brasil'
    },
    {
      phone: '+15551234567',
      message: 'Olá! Oferta especial com R$50 OFF. Aproveite agora!',
      expectedCountry: 'Estados Unidos'
    },
    {
      phone: '5491123456789',
      message: 'Olá! Oferta especial com R$50 OFF. Aproveite agora!',
      expectedCountry: 'Argentina'
    },
    {
      phone: '521234567890',
      message: 'Olá! Oferta especial com R$50 OFF. Aproveite agora!',
      expectedCountry: 'México'
    },
    {
      phone: '351912345678',
      message: 'Olá! Oferta especial com R$50 OFF. Aproveite agora!',
      expectedCountry: 'Portugal'
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    try {
      console.log(`\n📱 Testando ${testCase.phone} (${testCase.expectedCountry})`);
      
      const response = await fetch(`${BASE_URL}/api/sms/direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: testCase.phone,
          message: testCase.message
        })
      });

      const result = await response.json();
      
      if (result.country === testCase.expectedCountry) {
        console.log(`✅ PASSOU: País detectado corretamente (${result.country})`);
        console.log(`   Mensagem adaptada: ${result.adaptedMessage}`);
        passedTests++;
      } else {
        console.log(`❌ FALHOU: País esperado ${testCase.expectedCountry}, detectado ${result.country}`);
      }
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Resultado: ${JSON.stringify(result, null, 2)}`);
      
    } catch (error) {
      console.log(`❌ ERRO: ${error.message}`);
    }
  }

  console.log(`\n🎯 RESULTADO FINAL: ${passedTests}/${totalTests} testes passaram (${Math.round(passedTests/totalTests*100)}%)`);
  
  if (passedTests === totalTests) {
    console.log('✅ TODOS OS TESTES PASSARAM - SISTEMA APROVADO!');
  } else {
    console.log('❌ ALGUNS TESTES FALHARAM - REQUER AJUSTES');
  }
}

// Teste específico para o número 11995133932
async function testSpecificBrazilianNumber() {
  console.log('\n🇧🇷 TESTE ESPECÍFICO - NÚMERO BRASILEIRO 11995133932');
  
  try {
    const response = await fetch(`${BASE_URL}/api/sms/direct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '11995133932',
        message: 'Teste de SMS direto para número brasileiro. Oferta especial com R$100 OFF!'
      })
    });

    const result = await response.json();
    
    console.log('📝 Resposta do servidor:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ SMS ENVIADO COM SUCESSO!');
      console.log(`   País: ${result.country}`);
      console.log(`   Código: ${result.countryCode}`);
      console.log(`   Mensagem: ${result.adaptedMessage}`);
    } else {
      console.log('❌ FALHA NO ENVIO DO SMS');
      console.log(`   Erro: ${result.error}`);
    }
    
  } catch (error) {
    console.log(`❌ ERRO DE CONEXÃO: ${error.message}`);
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 INICIANDO TESTES COMPLETOS DO SISTEMA SMS');
  console.log('=' .repeat(50));
  
  await testCountryDetection();
  await testSpecificBrazilianNumber();
  
  console.log('\n🏁 TESTES CONCLUÍDOS');
}

// Executar
runAllTests().catch(console.error);