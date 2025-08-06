// Integração com Logzz - Sistema de Pedidos Automático
console.log('🛒 Logzz Integration Module carregado');

// URL base da Logzz
const LOGZZ_BASE_URL = 'https://entrega.logzz.com.br';
const PRODUCT_URL = '/pay/memqpe8km/1-mes-de-tratamento-ganha-mais-1-mes-de-brinde';

// Classe para gerenciar integração com Logzz
class LogzzIntegration {
  constructor() {
    this.sessionData = null;
    this.deliveryOptions = [];
  }

  // Simular criação de pedido na Logzz
  async createOrder(orderData) {
    try {
      console.log('📦 Iniciando criação de pedido na Logzz:', orderData);
      
      // Em implementação real, faria requests HTTP para a API da Logzz
      // Por agora, simulamos o processo
      
      // 1. Validar dados do pedido
      const validation = this.validateOrderData(orderData);
      if (!validation.valid) {
        throw new Error(`Dados inválidos: ${validation.error}`);
      }
      
      // 2. Simular busca de opções de entrega
      const deliveryOptions = await this.getDeliveryOptions(orderData.customer.address);
      
      // 3. Validar data de entrega selecionada
      if (!this.validateDeliveryDate(orderData.delivery, deliveryOptions)) {
        throw new Error('Data de entrega inválida ou indisponível');
      }
      
      // 4. Simular criação do pedido
      const order = await this.submitOrder(orderData);
      
      console.log('✅ Pedido criado com sucesso:', order);
      return order;
      
    } catch (error) {
      console.error('❌ Erro ao criar pedido na Logzz:', error);
      throw error;
    }
  }

  // Validar dados do pedido
  validateOrderData(orderData) {
    const required = ['customer', 'delivery', 'product'];
    
    for (const field of required) {
      if (!orderData[field]) {
        return { valid: false, error: `Campo obrigatório: ${field}` };
      }
    }
    
    // Validar dados do cliente
    const customerRequired = ['name', 'phone', 'address'];
    for (const field of customerRequired) {
      if (!orderData.customer[field]) {
        return { valid: false, error: `Campo obrigatório: customer.${field}` };
      }
    }
    
    // Validar endereço
    const addressRequired = ['cep', 'street', 'number', 'city', 'state'];
    for (const field of addressRequired) {
      if (!orderData.customer.address[field]) {
        return { valid: false, error: `Campo obrigatório: address.${field}` };
      }
    }
    
    // Validar CEP
    const cep = orderData.customer.address.cep.replace(/\D/g, '');
    if (cep.length !== 8) {
      return { valid: false, error: 'CEP deve ter 8 dígitos' };
    }
    
    // Validar telefone
    const phone = orderData.customer.phone.replace(/\D/g, '');
    if (phone.length < 10 || phone.length > 11) {
      return { valid: false, error: 'Telefone inválido' };
    }
    
    return { valid: true };
  }

  // Buscar opções de entrega disponíveis
  async getDeliveryOptions(address) {
    try {
      console.log('📅 Buscando opções de entrega para:', address);
      
      // Simular delay de API
      await this.delay(1000);
      
      // Gerar opções de entrega baseadas no CEP
      const options = this.generateDeliveryOptions(address.cep);
      
      this.deliveryOptions = options;
      return options;
      
    } catch (error) {
      console.error('❌ Erro ao buscar opções de entrega:', error);
      return [];
    }
  }

  // Gerar opções de entrega simuladas
  generateDeliveryOptions(cep) {
    const today = new Date();
    const options = [];
    
    // Calcular dias de entrega baseado no CEP
    const deliveryDays = this.calculateDeliveryDays(cep);
    
    // Gerar opções a partir do dia mínimo
    for (let i = deliveryDays.min; i <= deliveryDays.max; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Pular fins de semana se necessário
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }
      
      options.push({
        date: date.toISOString().split('T')[0],
        dateFormatted: date.toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        }),
        timeSlots: ['08:00-12:00', '14:00-18:00'],
        available: true,
        price: this.calculateDeliveryPrice(cep, i)
      });
    }
    
    return options.slice(0, 5); // Máximo 5 opções
  }

  // Calcular dias de entrega baseado no CEP
  calculateDeliveryDays(cep) {
    const cepNumber = parseInt(cep.substring(0, 5));
    
    // São Paulo e região metropolitana
    if (cepNumber >= 1000 && cepNumber <= 19999) {
      return { min: 1, max: 3 };
    }
    
    // Capitais do Sudeste
    if (cepNumber >= 20000 && cepNumber <= 39999) {
      return { min: 2, max: 4 };
    }
    
    // Demais regiões
    return { min: 3, max: 7 };
  }

  // Calcular preço da entrega
  calculateDeliveryPrice(cep, days) {
    const baseFee = 15.90;
    const urgencyFee = days <= 2 ? 5.00 : 0;
    const distanceFee = this.calculateDistanceFee(cep);
    
    return baseFee + urgencyFee + distanceFee;
  }

  // Calcular taxa por distância
  calculateDistanceFee(cep) {
    const cepNumber = parseInt(cep.substring(0, 5));
    
    if (cepNumber >= 1000 && cepNumber <= 19999) return 0; // SP
    if (cepNumber >= 20000 && cepNumber <= 29999) return 2.50; // RJ
    if (cepNumber >= 30000 && cepNumber <= 39999) return 3.00; // MG
    
    return 5.00; // Demais estados
  }

  // Validar data de entrega
  validateDeliveryDate(selectedDelivery, availableOptions) {
    if (!selectedDelivery || !selectedDelivery.date) {
      return false;
    }
    
    return availableOptions.some(option => 
      option.date === selectedDelivery.date && option.available
    );
  }

  // Submeter pedido final
  async submitOrder(orderData) {
    try {
      console.log('📝 Submetendo pedido final...');
      
      // Simular delay de processamento
      await this.delay(2000);
      
      // Simular sucesso (95% das vezes)
      const success = Math.random() > 0.05;
      
      if (!success) {
        throw new Error('Erro interno no sistema de pagamento');
      }
      
      // Gerar ID do pedido simulado
      const orderId = this.generateOrderId();
      
      const order = {
        id: orderId,
        status: 'confirmed',
        customer: orderData.customer,
        delivery: {
          ...orderData.delivery,
          fee: this.calculateDeliveryPrice(
            orderData.customer.address.cep, 
            this.daysBetween(new Date(), new Date(orderData.delivery.date))
          )
        },
        product: orderData.product,
        total: 197.90, // Preço fixo do produto
        paymentUrl: `${LOGZZ_BASE_URL}/payment/${orderId}`,
        trackingUrl: `${LOGZZ_BASE_URL}/tracking/${orderId}`,
        createdAt: new Date().toISOString(),
        estimatedDelivery: orderData.delivery.date
      };
      
      // Salvar pedido no histórico local
      await this.saveOrderToHistory(order);
      
      return order;
      
    } catch (error) {
      console.error('❌ Erro ao submeter pedido:', error);
      throw error;
    }
  }

  // Salvar pedido no histórico
  async saveOrderToHistory(order) {
    try {
      const result = await chrome.storage.local.get(['orderHistory']);
      const history = result.orderHistory || [];
      
      history.unshift(order); // Adicionar no início
      
      // Manter apenas os últimos 50 pedidos
      const trimmedHistory = history.slice(0, 50);
      
      await chrome.storage.local.set({ orderHistory: trimmedHistory });
      
      console.log('💾 Pedido salvo no histórico:', order.id);
      
    } catch (error) {
      console.error('❌ Erro ao salvar pedido:', error);
    }
  }

  // Utilitários
  generateOrderId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `LGZ-${timestamp}-${random}`.toUpperCase();
  }

  daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1 - date2) / oneDay));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Buscar histórico de pedidos
  async getOrderHistory(limit = 10) {
    try {
      const result = await chrome.storage.local.get(['orderHistory']);
      const history = result.orderHistory || [];
      
      return history.slice(0, limit);
      
    } catch (error) {
      console.error('❌ Erro ao buscar histórico:', error);
      return [];
    }
  }

  // Verificar status de pedido
  async checkOrderStatus(orderId) {
    try {
      console.log('🔍 Verificando status do pedido:', orderId);
      
      // Simular consulta à API
      await this.delay(500);
      
      // Simular diferentes status
      const statuses = ['confirmed', 'processing', 'shipped', 'delivered'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        orderId,
        status: randomStatus,
        statusText: this.getStatusText(randomStatus),
        lastUpdate: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      return null;
    }
  }

  getStatusText(status) {
    const texts = {
      confirmed: 'Pedido confirmado',
      processing: 'Preparando para envio',
      shipped: 'Enviado para entrega',
      delivered: 'Entregue'
    };
    
    return texts[status] || 'Status desconhecido';
  }
}

// Instância global
const logzzIntegration = new LogzzIntegration();

// Exportar para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LogzzIntegration;
}

console.log('✅ Logzz Integration configurado');