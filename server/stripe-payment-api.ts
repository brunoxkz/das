import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export interface PaymentIntentConfig {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName?: string;
  description?: string;
  metadata?: Record<string, string>;
  setupFutureUsage?: boolean;
}

export interface SubscriptionConfig {
  customerId: string;
  priceId: string;
  trialDays: number;
  paymentMethodId: string;
}

export class StripePaymentAPI {
  private stripe: Stripe;

  constructor() {
    this.stripe = stripe;
  }

  /**
   * Cria um Payment Intent para processamento direto via API
   */
  async createPaymentIntent(config: PaymentIntentConfig): Promise<{
    clientSecret: string;
    paymentIntentId: string;
    customerId: string;
    success: boolean;
  }> {
    try {
      console.log('🔧 CRIANDO PAYMENT INTENT DIRETO:', config);

      // 1. Criar ou buscar customer
      let customer;
      try {
        const existingCustomers = await this.stripe.customers.list({
          email: config.customerEmail,
          limit: 1,
        });

        if (existingCustomers.data.length > 0) {
          customer = existingCustomers.data[0];
          console.log('✅ Customer existente encontrado:', customer.id);
        } else {
          throw new Error('Customer not found');
        }
      } catch (error) {
        customer = await this.stripe.customers.create({
          email: config.customerEmail,
          name: config.customerName || 'Cliente Vendzz',
          metadata: {
            source: 'vendzz_checkout_api',
            ...config.metadata,
          },
        });
        console.log('✅ Novo customer criado:', customer.id);
      }

      // 2. Criar Payment Intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(config.amount * 100),
        currency: config.currency.toLowerCase(),
        customer: customer.id,
        description: config.description || 'Pagamento Vendzz',
        setup_future_usage: config.setupFutureUsage ? 'off_session' : undefined,
        metadata: {
          type: 'direct_payment',
          customer_email: config.customerEmail,
          ...config.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log('✅ Payment Intent criado:', paymentIntent.id);

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
        customerId: customer.id,
        success: true,
      };

    } catch (error) {
      console.error('❌ Erro ao criar Payment Intent:', error);
      throw error;
    }
  }

  /**
   * Confirma pagamento e cria subscription se necessário
   */
  async confirmPaymentAndCreateSubscription(
    paymentIntentId: string,
    subscriptionConfig?: SubscriptionConfig
  ): Promise<{
    paymentIntent: Stripe.PaymentIntent;
    subscription?: Stripe.Subscription;
    success: boolean;
  }> {
    try {
      console.log('🔧 CONFIRMANDO PAGAMENTO:', paymentIntentId);

      // 1. Buscar Payment Intent
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      console.log('✅ Payment Intent status:', paymentIntent.status);

      if (paymentIntent.status !== 'succeeded') {
        throw new Error(`Payment Intent não foi bem-sucedido: ${paymentIntent.status}`);
      }

      let subscription;

      // 2. Criar subscription se configurado
      if (subscriptionConfig) {
        console.log('🔧 CRIANDO SUBSCRIPTION:', subscriptionConfig);

        subscription = await this.stripe.subscriptions.create({
          customer: subscriptionConfig.customerId,
          items: [
            {
              price: subscriptionConfig.priceId,
            },
          ],
          default_payment_method: subscriptionConfig.paymentMethodId,
          trial_period_days: subscriptionConfig.trialDays,
          metadata: {
            type: 'trial_subscription',
            original_payment_intent: paymentIntentId,
            trial_days: subscriptionConfig.trialDays.toString(),
          },
        });

        console.log('✅ Subscription criada:', subscription.id);
      }

      return {
        paymentIntent,
        subscription,
        success: true,
      };

    } catch (error) {
      console.error('❌ Erro ao confirmar pagamento:', error);
      throw error;
    }
  }

  /**
   * Cria produto e preço para subscription
   */
  async createProductAndPrice(
    productName: string,
    price: number,
    currency: string = 'BRL'
  ): Promise<{
    productId: string;
    priceId: string;
    success: boolean;
  }> {
    try {
      console.log('🔧 CRIANDO PRODUTO E PREÇO:', { productName, price, currency });

      // 1. Criar produto
      const product = await this.stripe.products.create({
        name: productName,
        description: `Assinatura ${productName} - Processamento direto via API`,
        metadata: {
          type: 'subscription_product',
          source: 'vendzz_api',
        },
      });

      console.log('✅ Produto criado:', product.id);

      // 2. Criar preço
      const priceObj = await this.stripe.prices.create({
        unit_amount: Math.round(price * 100),
        currency: currency.toLowerCase(),
        recurring: {
          interval: 'month',
        },
        product: product.id,
        metadata: {
          type: 'monthly_subscription',
        },
      });

      console.log('✅ Preço criado:', priceObj.id);

      return {
        productId: product.id,
        priceId: priceObj.id,
        success: true,
      };

    } catch (error) {
      console.error('❌ Erro ao criar produto/preço:', error);
      throw error;
    }
  }

  /**
   * Busca método de pagamento de um Payment Intent
   */
  async getPaymentMethodFromIntent(paymentIntentId: string): Promise<string | null> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent.payment_method as string | null;
    } catch (error) {
      console.error('❌ Erro ao buscar método de pagamento:', error);
      return null;
    }
  }
}

export const stripePaymentAPI = new StripePaymentAPI();