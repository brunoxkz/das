// Integração campo a campo com Logzz - Preenchimento sequencial com retornos
console.log('🚚 Logzz Field-by-Field Integration carregada');

let orderData = null;
let currentStep = 0;
let stepInProgress = false;

// Steps do processo Logzz
const LOGZZ_STEPS = [
  { name: 'name', selector: 'input[name="name"], input[placeholder*="nome"], #nome', description: 'Nome do cliente' },
  { name: 'phone', selector: 'input[name="phone"], input[name="telefone"], input[placeholder*="telefone"], #telefone', description: 'Telefone' },
  { name: 'cep', selector: 'input[name="cep"], input[placeholder*="cep"], #cep', description: 'CEP' },
  { name: 'wait_address', delay: 3000, description: 'Aguardar carregamento do endereço' },
  { name: 'number', selector: 'input[name="number"], input[name="numero"], input[placeholder*="número"], #numero', description: 'Número da residência' },
  { name: 'confirm_address', selector: 'button[type="submit"], .btn-confirmar, button:contains("Confirmar")', description: 'Confirmar endereço' },
  { name: 'wait_shipping', delay: 8000, description: 'Aguardar opções de entrega' },
  { name: 'select_shipping', selector: '.shipping-option:first-child, .opcao-entrega:first-child, input[type="radio"]:first-of-type', description: 'Selecionar primeira opção de entrega' },
  { name: 'finalize', selector: 'button:contains("Finalizar"), .btn-finalizar, #finalizar-compra', description: 'Finalizar compra' }
];

// Listener para mensagens do background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FILL_LOGZZ_FORM') {
    console.log('📋 Recebidos dados para preenchimento:', message.data);
    orderData = message.data;
    currentStep = 0;
    startFieldByFieldProcess();
    sendResponse({ success: true });
  }
});

// Iniciar processo campo a campo
function startFieldByFieldProcess() {
  if (!orderData) {
    console.error('❌ Dados do pedido não disponíveis');
    return;
  }
  
  console.log('🚀 Iniciando preenchimento campo a campo...');
  executeStep();
}

// Executar step atual
function executeStep() {
  if (stepInProgress) {
    console.log('⏳ Step em progresso, aguardando...');
    return;
  }
  
  if (currentStep >= LOGZZ_STEPS.length) {
    console.log('✅ Processo completo!');
    highlightFinalButton();
    return;
  }
  
  const step = LOGZZ_STEPS[currentStep];
  console.log(`📝 Executando step ${currentStep + 1}/${LOGZZ_STEPS.length}: ${step.description}`);
  
  stepInProgress = true;
  
  // Se é um delay, aguardar
  if (step.delay) {
    console.log(`⏱️ Aguardando ${step.delay}ms...`);
    setTimeout(() => {
      stepInProgress = false;
      currentStep++;
      executeStep();
    }, step.delay);
    return;
  }
  
  // Encontrar elemento
  const element = findElement(step.selector);
  
  if (!element) {
    console.warn(`⚠️ Elemento não encontrado para step "${step.name}": ${step.selector}`);
    // Tentar próximo step após delay
    setTimeout(() => {
      stepInProgress = false;
      currentStep++;
      executeStep();
    }, 2000);
    return;
  }
  
  // Executar ação baseada no tipo de step
  switch (step.name) {
    case 'name':
      fillField(element, orderData.name);
      break;
      
    case 'phone':
      fillField(element, orderData.phone);
      break;
      
    case 'cep':
      fillField(element, orderData.cep);
      // Aguardar um pouco para CEP processar
      setTimeout(() => {
        stepInProgress = false;
        currentStep++;
        executeStep();
      }, 2000);
      return;
      
    case 'number':
      fillField(element, orderData.number || '123');
      break;
      
    case 'confirm_address':
    case 'select_shipping':
    case 'finalize':
      clickElement(element);
      break;
      
    default:
      console.log(`🔄 Step customizado: ${step.name}`);
      break;
  }
  
  // Próximo step após delay
  setTimeout(() => {
    stepInProgress = false;
    currentStep++;
    executeStep();
  }, 1500);
}

// Encontrar elemento com múltiplos seletores
function findElement(selectors) {
  const selectorList = selectors.split(', ');
  
  for (const selector of selectorList) {
    try {
      // Seletor normal
      let element = document.querySelector(selector);
      if (element) return element;
      
      // Tentar xpath se contém texto
      if (selector.includes(':contains(')) {
        const text = selector.match(/:contains\("([^"]+)"\)/)?.[1];
        if (text) {
          const xpath = `//*[contains(text(), "${text}")]`;
          element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          if (element) return element;
        }
      }
      
    } catch (error) {
      console.warn(`⚠️ Erro no seletor "${selector}":`, error);
    }
  }
  
  return null;
}

// Preencher campo
function fillField(element, value) {
  if (!element || !value) return;
  
  console.log(`✍️ Preenchendo campo com: ${value}`);
  
  // Limpar campo primeiro
  element.value = '';
  element.focus();
  
  // Simular digitação humana
  const chars = value.toString().split('');
  let charIndex = 0;
  
  const typeChar = () => {
    if (charIndex < chars.length) {
      element.value += chars[charIndex];
      
      // Disparar eventos
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      
      charIndex++;
      setTimeout(typeChar, Math.random() * 100 + 50); // 50-150ms entre caracteres
    } else {
      // Finalizar
      element.blur();
      console.log(`✅ Campo preenchido: ${value}`);
    }
  };
  
  setTimeout(typeChar, 100);
}

// Clicar elemento
function clickElement(element) {
  if (!element) return;
  
  console.log('🖱️ Clicando elemento:', element);
  
  // Scroll para elemento
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // Destacar elemento
  const originalBorder = element.style.border;
  element.style.border = '3px solid #ff6b35';
  
  setTimeout(() => {
    // Clicar
    element.click();
    
    // Restaurar borda
    setTimeout(() => {
      element.style.border = originalBorder;
    }, 1000);
    
    console.log('✅ Elemento clicado');
  }, 500);
}

// Destacar botão finalizar
function highlightFinalButton() {
  const finalButtons = [
    'button:contains("Finalizar")',
    '.btn-finalizar',
    '#finalizar-compra',
    'button[type="submit"]'
  ];
  
  for (const selector of finalButtons) {
    const button = findElement(selector);
    if (button) {
      console.log('🎯 Destacando botão finalizar...');
      
      // Destacar com borda laranja pulsante
      button.style.border = '4px solid #ff6b35';
      button.style.boxShadow = '0 0 20px rgba(255, 107, 53, 0.6)';
      button.style.animation = 'pulse 2s infinite';
      
      // Adicionar CSS para animação
      if (!document.getElementById('logzz-highlight-styles')) {
        const style = document.createElement('style');
        style.id = 'logzz-highlight-styles';
        style.textContent = `
          @keyframes pulse {
            0% { box-shadow: 0 0 20px rgba(255, 107, 53, 0.6); }
            50% { box-shadow: 0 0 30px rgba(255, 107, 53, 1); }
            100% { box-shadow: 0 0 20px rgba(255, 107, 53, 0.6); }
          }
        `;
        document.head.appendChild(style);
      }
      
      // Scroll para botão
      button.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      break;
    }
  }
}

// Auto-preenchimento se dados estão disponíveis
function checkForAutoFill() {
  // Verificar se estamos na página de checkout da Logzz
  if (window.location.hostname.includes('logzz.com.br')) {
    console.log('🚚 Página Logzz detectada');
    
    // Verificar se há dados pendentes no storage
    chrome.storage.local.get(['pendingLogzzOrder'], (result) => {
      if (result.pendingLogzzOrder) {
        console.log('📋 Dados de pedido pendente encontrados');
        orderData = result.pendingLogzzOrder;
        
        // Remover dados pendentes
        chrome.storage.local.remove(['pendingLogzzOrder']);
        
        // Aguardar página carregar e iniciar preenchimento
        setTimeout(startFieldByFieldProcess, 3000);
      }
    });
  }
}

// Inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkForAutoFill);
} else {
  checkForAutoFill();
}

console.log('✅ Logzz Field-by-Field Integration pronta');