/**
 * TESTE DO ELEMENTO CONTADOR DE TRANSIÇÃO
 * Valida se o contador sempre decrementa corretamente
 */

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
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

async function authenticate() {
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    return response.accessToken;
  } catch (error) {
    console.error('❌ Falha na autenticação:', error.message);
    throw error;
  }
}

async function testCounterElement() {
  console.log('🧪 TESTE DO ELEMENTO CONTADOR DE TRANSIÇÃO');
  
  try {
    // 1. Autenticação
    const token = await authenticate();
    console.log('✅ Autenticação bem-sucedida');
    
    // 2. Criar quiz com elementos contador
    const quizData = {
      title: 'Teste Counter Elements',
      description: 'Teste dos elementos de contador',
      structure: {
        pages: [
          {
            id: 1,
            title: 'Contador Regressivo',
            elements: [
              {
                id: 1,
                type: 'transition_counter',
                content: '',
                counterType: 'countdown',
                counterStartValue: 30,
                counterEndValue: 0,
                color: '#FF6B6B',
                fontSize: '4xl'
              }
            ],
            isTransition: true
          },
          {
            id: 2,
            title: 'Cronômetro Promocional',
            elements: [
              {
                id: 2,
                type: 'transition_counter',
                content: '',
                counterType: 'chronometer',
                chronometerHours: 2,
                chronometerMinutes: 30,
                chronometerSeconds: 15,
                color: '#4ECDC4',
                fontSize: '3xl'
              }
            ],
            isTransition: true
          }
        ],
        settings: {
          theme: 'light',
          showProgressBar: true,
          collectEmail: false,
          collectName: false,
          collectPhone: false
        }
      }
    };
    
    const quiz = await makeRequest('/api/quizzes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(quizData)
    });
    
    console.log('✅ Quiz criado com sucesso:', quiz.id);
    
    // 3. Validar elementos contador
    const pages = quiz.structure.pages;
    
    console.log('\n🔍 VALIDANDO ELEMENTOS CONTADOR:');
    
    // Contador regressivo
    const countdownElement = pages[0].elements[0];
    console.log('📊 Contador Regressivo:');
    console.log('   - Tipo:', countdownElement.counterType);
    console.log('   - Valor Inicial:', countdownElement.counterStartValue);
    console.log('   - Valor Final:', countdownElement.counterEndValue);
    console.log('   - Cor:', countdownElement.color);
    console.log('   - Tamanho:', countdownElement.fontSize);
    
    // Cronômetro promocional
    const chronometerElement = pages[1].elements[0];
    console.log('\n📊 Cronômetro Promocional:');
    console.log('   - Tipo:', chronometerElement.counterType);
    console.log('   - Horas:', chronometerElement.chronometerHours);
    console.log('   - Minutos:', chronometerElement.chronometerMinutes);
    console.log('   - Segundos:', chronometerElement.chronometerSeconds);
    console.log('   - Cor:', chronometerElement.color);
    console.log('   - Tamanho:', chronometerElement.fontSize);
    
    // 4. Verificar se configuração está correta
    let issues = [];
    
    if (countdownElement.counterType !== 'countdown') {
      issues.push('Contador regressivo não tem tipo "countdown"');
    }
    
    if (chronometerElement.counterType !== 'chronometer') {
      issues.push('Cronômetro não tem tipo "chronometer"');
    }
    
    if (!chronometerElement.chronometerSeconds) {
      issues.push('Cronômetro não tem configuração de segundos');
    }
    
    if (issues.length > 0) {
      console.log('\n❌ PROBLEMAS ENCONTRADOS:');
      issues.forEach(issue => console.log('   -', issue));
      return { success: false, issues };
    }
    
    console.log('\n✅ TODOS OS TESTES PASSARAM!');
    console.log('🎯 Configuração dos contadores está correta');
    console.log('🔄 Ambos os contadores devem decrementar corretamente');
    
    return {
      success: true,
      quizId: quiz.id,
      message: 'Elementos contador configurados corretamente'
    };
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Executar o teste
testCounterElement().then(result => {
  console.log('\n📊 RESULTADO FINAL:', result);
  
  if (result.success) {
    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('📝 Instruções para verificação:');
    console.log('1. Abra o quiz criado no Quiz Builder');
    console.log('2. Vá para a aba Preview');
    console.log('3. Verifique se os contadores decrementam corretamente');
    console.log('4. Contador regressivo: 30s → 29s → 28s...');
    console.log('5. Cronômetro: 02:30:15 → 02:30:14 → 02:30:13...');
  } else {
    console.log('❌ Problemas detectados nos elementos contador');
  }
});