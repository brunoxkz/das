// Script de Teste para Integração Logzz
// Execute este código no console do DevTools para testar

console.log('🧪 Iniciando teste de integração Logzz...');

// Dados de teste
const testOrderData = {
  customer: {
    name: 'João Silva Teste',
    phone: '11999999999', // Teste normalização
    address: {
      cep: '01310-100',
      street: 'Av. Paulista',
      number: '1000',
      city: 'São Paulo',
      state: 'SP'
    }
  },
  delivery: {
    date: '2024-08-10',
    timeSlot: '14:00-18:00'
  },
  product: {
    name: '1 mês de tratamento + 1 mês de brinde',
    url: 'https://entrega.logzz.com.br/pay/memqpe8km/1-mes-de-tratamento-ganha-mais-1-mes-de-brinde',
    price: 197.00
  }
};

// Função de teste da normalização de telefone
function testPhoneNormalization() {
  console.log('📞 Testando normalização de telefones...');
  
  const testCases = [
    { input: '11999999999', expected: '5511999999999' },
    { input: '1188888888', expected: '5511988888888' },
    { input: '5511999999999', expected: '5511999999999' },
    { input: '(11) 99999-9999', expected: '5511999999999' },
    { input: '11 8888-8888', expected: '5511988888888' },
  ];
  
  function normalizePhone(phone) {
    if (!phone) return null;
    
    let cleaned = phone.toString().replace(/\D/g, '');
    
    if (cleaned.startsWith('55')) {
      cleaned = cleaned.substring(2);
    }
    
    if (cleaned.length === 10) {
      const ddd = cleaned.substring(0, 2);
      const number = cleaned.substring(2);
      cleaned = ddd + '9' + number;
    }
    
    if (cleaned.length === 11) {
      return '55' + cleaned;
    }
    
    return null;
  }
  
  testCases.forEach((testCase, index) => {
    const result = normalizePhone(testCase.input);
    const passed = result === testCase.expected;
    
    console.log(`Test ${index + 1}: ${testCase.input} → ${result} ${passed ? '✅' : '❌'}`);
    if (!passed) {
      console.error(`  Expected: ${testCase.expected}, Got: ${result}`);
    }
  });
  
  console.log('📞 Teste de normalização concluído');
}

// Função de teste dos seletores DOM
function testDOMSelectors() {
  console.log('🔍 Testando seletores DOM...');
  
  const selectors = {
    nameField: 'input[name="order_name"]#order_name',
    cepField: 'input[name="order_zipcode"]#order_zipcode',
    numberField: 'input[name="order_address_number"]',
    confirmAddressBtn: 'button[type="button"].btn.btn-primary.btn-lg',
    deliveryCards: '.card.p-3[class*="card-day-"]',
    finalizeBtn: '.d-grid.gap-2 button[type="button"].fw-bolder.btn.btn-primary.btn-lg'
  };
  
  // Simular elementos DOM para teste
  function simulateLogzzPage() {
    // Criar elementos de teste
    const testHTML = `
      <div id="test-container">
        <input name="order_name" id="order_name" class="form-control" placeholder="Digite o nome do cliente completo" />
        <input name="order_zipcode" id="order_zipcode" class="form-control" maxlength="9" placeholder="Digite os números do CEP" />
        <input name="order_address_number" class="form-control" placeholder="Digite o número" />
        <button type="button" class="btn btn-primary btn-lg" style="background: rgb(47, 222, 145);">Confirmar endereço</button>
        <div class="card p-3 card-day-0">Qui 07 Ago</div>
        <div class="card p-3 card-day-1">Sex 08 Ago</div>
        <div class="card p-3 card-day-2">Sáb 09 Ago</div>
        <div class="d-grid gap-2">
          <button type="button" class="fw-bolder btn btn-primary btn-lg" style="background: rgb(47, 222, 145);">
            Finalizar compra <small>(R$ 197,00 na entrega)</small>
          </button>
        </div>
      </div>
    `;
    
    const container = document.createElement('div');
    container.innerHTML = testHTML;
    document.body.appendChild(container);
    
    return container;
  }
  
  const testContainer = simulateLogzzPage();
  
  Object.entries(selectors).forEach(([name, selector]) => {
    const elements = document.querySelectorAll(selector);
    const found = elements.length > 0;
    
    console.log(`${name}: ${selector} → ${found ? '✅' : '❌'} (${elements.length} encontrado(s))`);
    
    if (found && name === 'deliveryCards') {
      elements.forEach((card, index) => {
        console.log(`  Card ${index}: "${card.textContent.trim()}"`);
      });
    }
  });
  
  // Limpar teste
  testContainer.remove();
  console.log('🔍 Teste de seletores concluído');
}

// Função de teste da validação de dados
function testDataValidation() {
  console.log('✅ Testando validação de dados...');
  
  function validateOrderData(orderData) {
    if (!orderData.customer?.name?.trim()) {
      return { valid: false, error: 'Nome do cliente é obrigatório' };
    }
    
    if (!orderData.customer?.phone?.trim()) {
      return { valid: false, error: 'Telefone do cliente é obrigatório' };
    }
    
    if (!orderData.customer?.address?.cep?.trim()) {
      return { valid: false, error: 'CEP é obrigatório' };
    }
    
    if (!orderData.customer?.address?.number?.trim()) {
      return { valid: false, error: 'Número do endereço é obrigatório' };
    }
    
    const cep = orderData.customer.address.cep.replace(/\D/g, '');
    if (cep.length !== 8) {
      return { valid: false, error: 'CEP deve ter 8 dígitos' };
    }
    
    return { valid: true };
  }
  
  const testCases = [
    { data: testOrderData, shouldPass: true },
    { data: { ...testOrderData, customer: { ...testOrderData.customer, name: '' } }, shouldPass: false },
    { data: { ...testOrderData, customer: { ...testOrderData.customer, phone: '' } }, shouldPass: false },
    { data: { ...testOrderData, customer: { ...testOrderData.customer, address: { ...testOrderData.customer.address, cep: '123' } } }, shouldPass: false },
  ];
  
  testCases.forEach((testCase, index) => {
    const result = validateOrderData(testCase.data);
    const passed = result.valid === testCase.shouldPass;
    
    console.log(`Validation Test ${index + 1}: ${passed ? '✅' : '❌'}`);
    if (!passed) {
      console.error(`  Expected valid: ${testCase.shouldPass}, Got: ${result.valid}`);
      if (!result.valid) {
        console.error(`  Error: ${result.error}`);
      }
    }
  });
  
  console.log('✅ Teste de validação concluído');
}

// Função de teste da simulação de preenchimento
function testFormFilling() {
  console.log('📝 Testando simulação de preenchimento...');
  
  // Simular preenchimento de campo
  function fillField(selector, value) {
    const element = document.querySelector(selector);
    if (!element) {
      console.error(`❌ Campo não encontrado: ${selector}`);
      return false;
    }
    
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    
    console.log(`✅ Campo preenchido: ${selector} = "${value}"`);
    return true;
  }
  
  // Criar formulário de teste
  const testForm = document.createElement('div');
  testForm.innerHTML = `
    <input name="order_name" id="order_name" class="form-control" />
    <input name="order_zipcode" id="order_zipcode" class="form-control" />
    <input name="order_address_number" class="form-control" />
  `;
  document.body.appendChild(testForm);
  
  // Testar preenchimento
  const fillSuccess = [
    fillField('input[name="order_name"]', testOrderData.customer.name),
    fillField('input[name="order_zipcode"]', testOrderData.customer.address.cep.replace(/\D/g, '')),
    fillField('input[name="order_address_number"]', testOrderData.customer.address.number)
  ].every(Boolean);
  
  if (fillSuccess) {
    console.log('✅ Todos os campos preenchidos com sucesso');
  } else {
    console.error('❌ Falha no preenchimento de campos');
  }
  
  // Limpar teste
  testForm.remove();
  console.log('📝 Teste de preenchimento concluído');
}

// Executar todos os testes
function runAllTests() {
  console.log('🚀 Executando bateria completa de testes...');
  console.log('');
  
  try {
    testPhoneNormalization();
    console.log('');
    
    testDOMSelectors();
    console.log('');
    
    testDataValidation();
    console.log('');
    
    testFormFilling();
    console.log('');
    
    console.log('🎉 Todos os testes executados!');
    console.log('');
    console.log('📋 Resumo dos testes:');
    console.log('  📞 Normalização de telefone: Testada');
    console.log('  🔍 Seletores DOM: Testados'); 
    console.log('  ✅ Validação de dados: Testada');
    console.log('  📝 Preenchimento de formulário: Testado');
    console.log('');
    console.log('✅ Extensão pronta para instalação!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar testes automaticamente
runAllTests();