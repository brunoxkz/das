// Integração Real com Logzz - Sistema de Preenchimento Automático
console.log('🛒 Logzz Real Integration Module carregado');

// Configurações do site Logzz
const LOGZZ_CONFIG = {
  baseUrl: 'https://entrega.logzz.com.br',
  productUrl: '/pay/memqpe8km/1-mes-de-tratamento-ganha-mais-1-mes-de-brinde',
  selectors: {
    nameField: 'input[name="order_name"]#order_name',
    phoneField: 'input[name="order_phone"]',
    cepField: 'input[name="order_zipcode"]#order_zipcode',
    numberField: 'input[name="order_address_number"]',
    confirmAddressBtn: 'button[type="button"].btn.btn-primary.btn-lg',
    deliveryCards: '.card.p-3[class*="card-day-"]',
    finalizeBtn: '.d-grid.gap-2 button[type="button"].fw-bolder.btn.btn-primary.btn-lg'
  }
};

// Classe para integração real com Logzz
class LogzzRealIntegration {
  constructor() {
    this.currentTab = null;
    this.orderData = null;
    this.deliveryOptions = [];
  }

  // Abrir nova aba e preencher formulário
  async createRealOrder(orderData) {
    try {
      console.log('🚀 Iniciando integração real com Logzz:', orderData);
      
      // Validar dados antes de continuar
      const validation = this.validateOrderData(orderData);
      if (!validation.valid) {
        throw new Error(`Dados inválidos: ${validation.error}`);
      }
      
      // Normalizar telefone
      const normalizedPhone = this.normalizePhone(orderData.customer.phone);
      if (!normalizedPhone) {
        throw new Error('Telefone inválido');
      }
      
      // Abrir nova aba com o produto
      const tab = await this.openLogzzTab();
      if (!tab) {
        throw new Error('Não foi possível abrir a página da Logzz');
      }
      
      this.currentTab = tab;
      
      // Aguardar carregamento da página
      await this.waitForPageLoad(tab.id);
      
      // Preencher formulário
      await this.fillOrderForm(tab.id, {
        ...orderData,
        customer: {
          ...orderData.customer,
          phone: normalizedPhone
        }
      });
      
      return {
        success: true,
        tabId: tab.id,
        message: 'Formulário preenchido com sucesso'
      };
      
    } catch (error) {
      console.error('❌ Erro na integração Logzz:', error);
      throw error;
    }
  }

  // Abrir nova aba da Logzz
  async openLogzzTab() {
    try {
      const fullUrl = LOGZZ_CONFIG.baseUrl + LOGZZ_CONFIG.productUrl;
      
      const tab = await chrome.tabs.create({
        url: fullUrl,
        active: true
      });
      
      console.log('🌐 Aba Logzz aberta:', tab.id);
      return tab;
      
    } catch (error) {
      console.error('❌ Erro ao abrir aba Logzz:', error);
      return null;
    }
  }

  // Aguardar carregamento da página
  async waitForPageLoad(tabId) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout ao carregar página'));
      }, 15000);
      
      const listener = (tabIdChanged, changeInfo) => {
        if (tabIdChanged === tabId && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          clearTimeout(timeout);
          
          // Aguardar um pouco mais para garantir que JS carregou
          setTimeout(resolve, 2000);
        }
      };
      
      chrome.tabs.onUpdated.addListener(listener);
    });
  }

  // Preencher formulário na página
  async fillOrderForm(tabId, orderData) {
    try {
      console.log('📝 Preenchendo formulário Logzz...');
      
      // Script para preencher o formulário
      const fillScript = `
        (function() {
          console.log('🔍 Iniciando preenchimento automático Logzz');
          
          // Configurações
          const selectors = ${JSON.stringify(LOGZZ_CONFIG.selectors)};
          const orderData = ${JSON.stringify(orderData)};
          
          // Função para aguardar elemento
          function waitForElement(selector, timeout = 10000) {
            return new Promise((resolve, reject) => {
              const element = document.querySelector(selector);
              if (element) {
                resolve(element);
                return;
              }
              
              const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                  observer.disconnect();
                  resolve(element);
                }
              });
              
              observer.observe(document.body, {
                childList: true,
                subtree: true
              });
              
              setTimeout(() => {
                observer.disconnect();
                reject(new Error('Elemento não encontrado: ' + selector));
              }, timeout);
            });
          }
          
          // Função para preencher campo
          function fillField(element, value) {
            if (!element) return false;
            
            element.focus();
            element.value = value;
            
            // Disparar eventos
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            element.dispatchEvent(new Event('blur', { bubbles: true }));
            
            return true;
          }
          
          // Função para clicar em elemento
          function clickElement(element) {
            if (!element) return false;
            
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            setTimeout(() => {
              element.click();
              element.dispatchEvent(new Event('click', { bubbles: true }));
            }, 500);
            
            return true;
          }
          
          // Processo principal
          async function fillForm() {
            try {
              console.log('📝 Preenchendo dados do cliente...');
              
              // 1. Preencher nome
              const nameField = await waitForElement(selectors.nameField);
              if (fillField(nameField, orderData.customer.name)) {
                console.log('✅ Nome preenchido:', orderData.customer.name);
              }
              
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // 2. Preencher telefone (se campo existir)
              try {
                const phoneField = await waitForElement('input[name="order_phone"]', 3000);
                if (fillField(phoneField, orderData.customer.phone)) {
                  console.log('✅ Telefone preenchido:', orderData.customer.phone);
                }
              } catch (e) {
                console.log('ℹ️ Campo telefone não encontrado (pode não existir)');
              }
              
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // 3. Preencher CEP
              const cepField = await waitForElement(selectors.cepField);
              if (fillField(cepField, orderData.customer.address.cep.replace(/\D/g, ''))) {
                console.log('✅ CEP preenchido:', orderData.customer.address.cep);
              }
              
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // 4. Preencher número
              const numberField = await waitForElement(selectors.numberField);
              if (fillField(numberField, orderData.customer.address.number)) {
                console.log('✅ Número preenchido:', orderData.customer.address.number);
              }
              
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // 5. Clicar em confirmar endereço
              const confirmBtn = await waitForElement(selectors.confirmAddressBtn);
              if (confirmBtn && !confirmBtn.disabled) {
                console.log('🔄 Clicando em confirmar endereço...');
                clickElement(confirmBtn);
                
                // 6. Aguardar opções de entrega (8 segundos)
                console.log('⏳ Aguardando opções de entrega (8 segundos)...');
                await new Promise(resolve => setTimeout(resolve, 8000));
                
                // 7. Buscar e exibir opções de entrega
                const deliveryCards = document.querySelectorAll(selectors.deliveryCards);
                console.log('📅 Opções de entrega encontradas:', deliveryCards.length);
                
                const options = [];
                deliveryCards.forEach((card, index) => {
                  const text = card.textContent.trim();
                  options.push({
                    index,
                    text,
                    element: card
                  });
                  console.log(\`📦 Opção \${index + 1}: \${text}\`);
                });
                
                // 8. Auto-selecionar primeira opção disponível
                if (options.length > 0) {
                  console.log('🎯 Selecionando primeira opção de entrega...');
                  clickElement(options[0].element);
                  
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  
                  // 9. Procurar botão finalizar
                  try {
                    const finalizeBtn = await waitForElement(selectors.finalizeBtn, 5000);
                    if (finalizeBtn) {
                      console.log('🎉 Botão finalizar encontrado! Pronto para finalizar compra.');
                      finalizeBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      
                      // Destacar botão
                      finalizeBtn.style.border = '3px solid #ff6600';
                      finalizeBtn.style.boxShadow = '0 0 10px #ff6600';
                      
                      return {
                        success: true,
                        message: 'Formulário preenchido com sucesso',
                        deliveryOptions: options,
                        readyToFinalize: true
                      };
                    }
                  } catch (e) {
                    console.log('⚠️ Botão finalizar não encontrado automaticamente');
                  }
                }
                
                return {
                  success: true,
                  message: 'Formulário preenchido, aguardando seleção manual',
                  deliveryOptions: options,
                  readyToFinalize: false
                };
                
              } else {
                throw new Error('Botão confirmar endereço não encontrado ou desabilitado');
              }
              
            } catch (error) {
              console.error('❌ Erro no preenchimento:', error);
              return {
                success: false,
                error: error.message
              };
            }
          }
          
          // Executar preenchimento
          return fillForm();
        })();
      `;
      
      // Executar script na aba
      const result = await chrome.scripting.executeScript({
        target: { tabId },
        func: new Function('return ' + fillScript)
      });
      
      const fillResult = result[0].result;
      console.log('📋 Resultado do preenchimento:', fillResult);
      
      return fillResult;
      
    } catch (error) {
      console.error('❌ Erro ao preencher formulário:', error);
      throw error;
    }
  }

  // Normalizar telefone seguindo as regras especificadas
  normalizePhone(phone) {
    if (!phone) return null;
    
    // Remover todos os caracteres não numéricos
    let cleaned = phone.toString().replace(/\D/g, '');
    
    console.log('📞 Normalizando telefone:', phone, '→', cleaned);
    
    // Se já tem 55 no início, remover
    if (cleaned.startsWith('55')) {
      cleaned = cleaned.substring(2);
    }
    
    // Verificar se precisa adicionar 9 após DDD
    if (cleaned.length === 10) {
      // Formato: DDxxxxxxxx (8 dígitos após DDD)
      // Adicionar 9 após DDD
      const ddd = cleaned.substring(0, 2);
      const number = cleaned.substring(2);
      cleaned = ddd + '9' + number;
      console.log('📞 Adicionado 9 após DDD:', cleaned);
    }
    
    // Verificar se tem 11 dígitos (formato esperado: DDx9xxxxxxx)
    if (cleaned.length === 11) {
      // Adicionar 55 no início
      const final = '55' + cleaned;
      console.log('📞 Telefone normalizado final:', final);
      return final;
    }
    
    console.log('❌ Telefone inválido após normalização:', cleaned);
    return null;
  }

  // Validar dados do pedido
  validateOrderData(orderData) {
    // Verificar campos obrigatórios
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
    
    // Validar formato do CEP
    const cep = orderData.customer.address.cep.replace(/\D/g, '');
    if (cep.length !== 8) {
      return { valid: false, error: 'CEP deve ter 8 dígitos' };
    }
    
    return { valid: true };
  }

  // Fechar aba atual (se necessário)
  async closeCurrentTab() {
    if (this.currentTab) {
      try {
        await chrome.tabs.remove(this.currentTab.id);
        this.currentTab = null;
      } catch (error) {
        console.error('❌ Erro ao fechar aba:', error);
      }
    }
  }
}

// Instância global
const logzzRealIntegration = new LogzzRealIntegration();

// Exportar para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LogzzRealIntegration, logzzRealIntegration };
}

console.log('✅ Logzz Real Integration configurado com preenchimento automático');