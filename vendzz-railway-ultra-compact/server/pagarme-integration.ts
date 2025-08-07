/**
 * INTEGRAÇÃO PAGAR.ME - SISTEMA DE ASSINATURAS
 * Implementa funcionalidades de pagamento recorrente brasileiro
 */

import pagarme from 'pagarme';

interface PagarmeConfig {
  apiKey: string;
  publicKey: string;
  environment: 'sandbox' | 'production';
}

interface CustomerData {
  name: string;
  email: string;
  document: string;
  phone: string;
  address: {
    street: string;
    street_number: string;
    zipcode: string;
    city: string;
    state: string;
    country: string;
  };
}

interface SubscriptionData {
  customerId: string;
  cardToken: string;
  planId: string;
  amount: number;
  interval: 'day' | 'week' | 'month' | 'year';
  intervalCount: number;
  setupFee?: number;
  description: string;
}

export class PagarmeIntegration {
  private client: any;
  private config: PagarmeConfig;

  constructor(config: PagarmeConfig) {
    this.config = config;
  }

  async initialize() {
    try {
      this.client = await pagarme.client.connect({
        api_key: this.config.apiKey
      });
      console.log('✅ Pagar.me inicializado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar Pagar.me:', error);
      return false;
    }
  }

  // Criar cliente na Pagar.me
  async createCustomer(customerData: CustomerData) {
    try {
      const customer = await this.client.customers.create({
        name: customerData.name,
        email: customerData.email,
        document_number: customerData.document,
        type: 'individual',
        country: 'br',
        phone_numbers: [`+55${customerData.phone}`],
        address: {
          street: customerData.address.street,
          street_number: customerData.address.street_number,
          zipcode: customerData.address.zipcode,
          city: customerData.address.city,
          state: customerData.address.state,
          country: customerData.address.country
        }
      });

      console.log('✅ Cliente criado na Pagar.me:', customer.id);
      return customer;
    } catch (error) {
      console.error('❌ Erro ao criar cliente:', error);
      throw error;
    }
  }

  // Criar plano de assinatura
  async createPlan(planData: {
    name: string;
    amount: number;
    interval: 'day' | 'week' | 'month' | 'year';
    intervalCount: number;
    trialDays?: number;
  }) {
    try {
      const plan = await this.client.plans.create({
        name: planData.name,
        amount: planData.amount,
        days: planData.intervalCount,
        payment_methods: ['credit_card'],
        trial_days: planData.trialDays || 0
      });

      console.log('✅ Plano criado na Pagar.me:', plan.id);
      return plan;
    } catch (error) {
      console.error('❌ Erro ao criar plano:', error);
      throw error;
    }
  }

  // Criar assinatura com taxa de setup
  async createSubscriptionWithSetup(subscriptionData: SubscriptionData) {
    try {
      // 1. Criar cobrança de setup (taxa de ativação)
      let setupTransaction = null;
      if (subscriptionData.setupFee && subscriptionData.setupFee > 0) {
        setupTransaction = await this.client.transactions.create({
          amount: subscriptionData.setupFee,
          payment_method: 'credit_card',
          card_token: subscriptionData.cardToken,
          customer: {
            id: subscriptionData.customerId
          },
          metadata: {
            type: 'setup_fee',
            description: 'Taxa de ativação - Vendzz Premium'
          }
        });

        console.log('✅ Taxa de setup processada:', setupTransaction.id);
      }

      // 2. Criar assinatura recorrente
      const subscription = await this.client.subscriptions.create({
        customer: {
          id: subscriptionData.customerId
        },
        plan: {
          id: subscriptionData.planId
        },
        payment_method: 'credit_card',
        card_token: subscriptionData.cardToken,
        metadata: {
          setupFee: subscriptionData.setupFee ? 'paid' : 'none',
          setupTransactionId: setupTransaction ? setupTransaction.id : null
        }
      });

      console.log('✅ Assinatura criada na Pagar.me:', subscription.id);

      return {
        subscription,
        setupTransaction,
        success: true
      };
    } catch (error) {
      console.error('❌ Erro ao criar assinatura:', error);
      throw error;
    }
  }

  // Obter detalhes da assinatura
  async getSubscription(subscriptionId: string) {
    try {
      const subscription = await this.client.subscriptions.find({
        id: subscriptionId
      });

      return subscription;
    } catch (error) {
      console.error('❌ Erro ao buscar assinatura:', error);
      throw error;
    }
  }

  // Cancelar assinatura
  async cancelSubscription(subscriptionId: string) {
    try {
      const subscription = await this.client.subscriptions.update({
        id: subscriptionId,
        status: 'canceled'
      });

      console.log('✅ Assinatura cancelada:', subscriptionId);
      return subscription;
    } catch (error) {
      console.error('❌ Erro ao cancelar assinatura:', error);
      throw error;
    }
  }

  // Criar token de cartão (para uso no frontend)
  async createCardToken(cardData: {
    number: string;
    holder_name: string;
    exp_month: string;
    exp_year: string;
    cvv: string;
  }) {
    try {
      const cardHash = await this.client.security.encrypt({
        card_number: cardData.number,
        card_holder_name: cardData.holder_name,
        card_expiration_date: `${cardData.exp_month}${cardData.exp_year}`,
        card_cvv: cardData.cvv
      });

      console.log('✅ Token de cartão criado com sucesso');
      return cardHash;
    } catch (error) {
      console.error('❌ Erro ao criar token:', error);
      throw error;
    }
  }

  // Processar webhook
  async processWebhook(payload: any) {
    try {
      console.log('📨 Webhook recebido:', payload.event);
      
      switch (payload.event) {
        case 'subscription_status_changed':
          return this.handleSubscriptionStatusChange(payload);
        case 'transaction_status_changed':
          return this.handleTransactionStatusChange(payload);
        default:
          console.log('⚠️ Evento não processado:', payload.event);
          return { processed: false };
      }
    } catch (error) {
      console.error('❌ Erro ao processar webhook:', error);
      throw error;
    }
  }

  private async handleSubscriptionStatusChange(payload: any) {
    const { subscription } = payload;
    console.log(`🔄 Assinatura ${subscription.id} mudou para: ${subscription.status}`);
    
    // Aqui você pode atualizar seu banco de dados local
    return { processed: true, type: 'subscription_status_changed' };
  }

  private async handleTransactionStatusChange(payload: any) {
    const { transaction } = payload;
    console.log(`💳 Transação ${transaction.id} mudou para: ${transaction.status}`);
    
    // Aqui você pode atualizar seu banco de dados local
    return { processed: true, type: 'transaction_status_changed' };
  }
}

// Instância singleton
let pagarmeIntegration: PagarmeIntegration | null = null;

export function initializePagarme(): PagarmeIntegration | null {
  if (!process.env.PAGARME_API_KEY) {
    console.log('⚠️ PAGARME_API_KEY não encontrada - Pagar.me desabilitado');
    return null;
  }

  const config: PagarmeConfig = {
    apiKey: process.env.PAGARME_API_KEY,
    publicKey: process.env.PAGARME_PUBLIC_KEY || '',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
  };

  pagarmeIntegration = new PagarmeIntegration(config);
  pagarmeIntegration.initialize();
  
  return pagarmeIntegration;
}

export { pagarmeIntegration };