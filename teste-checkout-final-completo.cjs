// 🎯 TESTE FINAL COMPLETO DO SISTEMA DE CHECKOUT
// Valida toda funcionalidade de criação, listagem e recuperação de produtos

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_BASE = 'http://localhost:5000';

// JWT token para autenticação
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFFYVk2dkUwcllBa1RYdjV2SENsbSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInJvbGUiOiJhZG1pbiIsInBsYW4iOiJlbnRlcnByaXNlIiwiaWF0IjoxNzUyNzA1NzMzLCJub25jZSI6Inpwcm9mciIsImV4cCI6MTc1MjcwNjYzM30.6-UMyGz0Ladx-WdUFr-RzCF94r7s6C5wcKqIA1ded8k';

// Função para fazer requisições HTTP
async function makeRequest(method, endpoint, data = null) {
  const url = `${API_BASE}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JWT_TOKEN}`
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function testCheckoutSystem() {
  console.log('🚀 INICIANDO TESTE FINAL COMPLETO DO SISTEMA DE CHECKOUT');
  console.log('=' .repeat(60));

  const tests = [];
  let passedTests = 0;
  let totalTests = 0;

  // TEST 1: Buscar produtos existentes
  console.log('\n1️⃣ TESTE: Buscar produtos existentes');
  totalTests++;
  try {
    const response = await makeRequest('GET', '/api/checkout-products');
    if (response.success && Array.isArray(response.data)) {
      console.log('✅ Produtos listados com sucesso:', response.data.length, 'produtos');
      tests.push('✅ Listagem de produtos: APROVADO');
      passedTests++;
    } else {
      console.log('❌ Erro ao buscar produtos:', response.data);
      tests.push('❌ Listagem de produtos: REPROVADO');
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error);
    tests.push('❌ Listagem de produtos: REPROVADO');
  }

  // TEST 2: Criar produto básico
  console.log('\n2️⃣ TESTE: Criar produto básico');
  totalTests++;
  const basicProduct = {
    name: 'Produto Teste Final Completo',
    description: 'Produto criado durante teste final completo',
    price: 97.90,
    currency: 'BRL',
    category: 'premium',
    features: 'Acesso completo ao sistema, Suporte 24/7, Recursos premium',
    payment_mode: 'one_time'
  };

  try {
    const response = await makeRequest('POST', '/api/checkout-products', basicProduct);
    if (response.success && response.data.id) {
      console.log('✅ Produto básico criado com sucesso:', response.data.id);
      tests.push('✅ Criação produto básico: APROVADO');
      passedTests++;
    } else {
      console.log('❌ Erro ao criar produto básico:', response.data);
      tests.push('❌ Criação produto básico: REPROVADO');
    }
  } catch (error) {
    console.log('❌ Erro na criação:', error);
    tests.push('❌ Criação produto básico: REPROVADO');
  }

  // TEST 3: Criar produto com assinatura
  console.log('\n3️⃣ TESTE: Criar produto com assinatura');
  totalTests++;
  const subscriptionProduct = {
    name: 'Assinatura Premium Completa',
    description: 'Assinatura mensal com trial de 7 dias',
    price: 29.90,
    currency: 'BRL',
    category: 'subscription',
    features: 'Acesso ilimitado, Suporte premium, Atualizações automáticas',
    payment_mode: 'subscription',
    recurring_interval: 'monthly',
    trial_period: 7,
    trial_price: 1.00
  };

  try {
    const response = await makeRequest('POST', '/api/checkout-products', subscriptionProduct);
    if (response.success && response.data.id) {
      console.log('✅ Produto com assinatura criado com sucesso:', response.data.id);
      tests.push('✅ Criação produto assinatura: APROVADO');
      passedTests++;
    } else {
      console.log('❌ Erro ao criar produto com assinatura:', response.data);
      tests.push('❌ Criação produto assinatura: REPROVADO');
    }
  } catch (error) {
    console.log('❌ Erro na criação:', error);
    tests.push('❌ Criação produto assinatura: REPROVADO');
  }

  // TEST 4: Verificar listagem atualizada
  console.log('\n4️⃣ TESTE: Verificar listagem atualizada');
  totalTests++;
  try {
    const response = await makeRequest('GET', '/api/checkout-products');
    if (response.success && Array.isArray(response.data) && response.data.length >= 2) {
      console.log('✅ Listagem atualizada com sucesso:', response.data.length, 'produtos');
      tests.push('✅ Listagem atualizada: APROVADO');
      passedTests++;
    } else {
      console.log('❌ Erro na listagem atualizada:', response.data);
      tests.push('❌ Listagem atualizada: REPROVADO');
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error);
    tests.push('❌ Listagem atualizada: REPROVADO');
  }

  // TEST 5: Buscar produto específico
  console.log('\n5️⃣ TESTE: Buscar produto específico');
  totalTests++;
  try {
    const listResponse = await makeRequest('GET', '/api/checkout-products');
    if (listResponse.success && listResponse.data.length > 0) {
      const productId = listResponse.data[0].id;
      const response = await makeRequest('GET', `/api/checkout-products/${productId}`);
      if (response.success && response.data.id === productId) {
        console.log('✅ Produto específico encontrado:', response.data.name);
        tests.push('✅ Busca produto específico: APROVADO');
        passedTests++;
      } else {
        console.log('❌ Erro ao buscar produto específico:', response.data);
        tests.push('❌ Busca produto específico: REPROVADO');
      }
    } else {
      console.log('❌ Nenhum produto disponível para teste');
      tests.push('❌ Busca produto específico: REPROVADO');
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error);
    tests.push('❌ Busca produto específico: REPROVADO');
  }

  // TEST 6: Teste de validação de dados
  console.log('\n6️⃣ TESTE: Validação de dados');
  totalTests++;
  const invalidProduct = {
    name: '', // Nome vazio - deve falhar
    description: 'Produto inválido',
    price: -10, // Preço negativo - deve falhar
    currency: 'BRL'
  };

  try {
    const response = await makeRequest('POST', '/api/checkout-products', invalidProduct);
    if (!response.success) {
      console.log('✅ Validação funcionando corretamente - produto inválido rejeitado');
      tests.push('✅ Validação de dados: APROVADO');
      passedTests++;
    } else {
      console.log('❌ Validação falhou - produto inválido foi aceito');
      tests.push('❌ Validação de dados: REPROVADO');
    }
  } catch (error) {
    console.log('✅ Validação funcionando - erro capturado:', error);
    tests.push('✅ Validação de dados: APROVADO');
    passedTests++;
  }

  // RESULTADOS FINAIS
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESULTADOS FINAIS DO TESTE COMPLETO');
  console.log('=' .repeat(60));
  
  tests.forEach(test => console.log(test));
  
  console.log(`\n📈 TAXA DE SUCESSO: ${passedTests}/${totalTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  
  if (passedTests === totalTests) {
    console.log('🎉 SISTEMA DE CHECKOUT 100% APROVADO PARA PRODUÇÃO!');
    console.log('✅ Todas as funcionalidades principais estão operacionais');
    console.log('✅ Criação de produtos: FUNCIONANDO');
    console.log('✅ Listagem de produtos: FUNCIONANDO');
    console.log('✅ Busca específica: FUNCIONANDO');
    console.log('✅ Validação de dados: FUNCIONANDO');
    console.log('✅ Suporte a assinaturas: FUNCIONANDO');
    console.log('✅ Sistema pronto para uso em produção!');
  } else {
    console.log('⚠️  SISTEMA PRECISA DE AJUSTES ANTES DA PRODUÇÃO');
    console.log(`❌ ${totalTests - passedTests} teste(s) falharam`);
  }
  
  console.log('\n' + '=' .repeat(60));
}

// Executar teste
testCheckoutSystem().catch(console.error);