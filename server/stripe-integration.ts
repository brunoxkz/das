import Stripe from 'stripe';

// Inicializar Stripe apenas se a chave existir
let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-09-30.acacia',
  });
}

export interface StripeProductConfig {
  name: string;
  description: string;
  currency: string;
  price: number;
  paymentMode: 'one_time' | 'recurring';
  recurringInterval?: 'day' | 'week' | 'month' | 'year';
  recurringIntervalCount?: number;
  trialPeriodDays?: number;
  billingScheme?: 'per_unit' | 'tiered';
  usageType?: 'licensed' | 'metered';
  aggregateUsage?: 'sum' | 'last_during_period' | 'last_ever' | 'max';
  taxRates?: boolean;
  coupons?: boolean;
  collectionMethod?: 'automatic' | 'manual';
}

export class StripeService {
  private stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }
    this.stripe = stripe;
  }

  // Criar produto no Stripe
  async createProduct(config: StripeProductConfig): Promise<{ product: Stripe.Product; price: Stripe.Price }> {
    try {
      // Criar produto
      const product = await this.stripe.products.create({
        name: config.name,
        description: config.description,
        metadata: {
          created_by: 'vendzz_checkout_builder',
          payment_mode: config.paymentMode,
          currency: config.currency
        }
      });

      // Configurar preço
      const priceData: Stripe.PriceCreateParams = {
        product: product.id,
        unit_amount: Math.round(config.price * 100), // Converter para centavos
        currency: config.currency.toLowerCase(),
        billing_scheme: config.billingScheme || 'per_unit'
      };

      // Configurações de recorrência
      if (config.paymentMode === 'recurring') {
        priceData.recurring = {
          interval: config.recurringInterval || 'month',
          interval_count: config.recurringIntervalCount || 1,
          usage_type: config.usageType || 'licensed'
        };

        if (config.usageType === 'metered' && config.aggregateUsage) {
          priceData.recurring.aggregate_usage = config.aggregateUsage;
        }
      }

      // Criar preço
      const price = await this.stripe.prices.create(priceData);

      return { product, price };
    } catch (error) {
      console.error('Erro ao criar produto no Stripe:', error);
      throw new Error('Falha ao criar produto no Stripe');
    }
  }

  // Atualizar produto
  async updateProduct(productId: string, config: Partial<StripeProductConfig>): Promise<Stripe.Product> {
    try {
      const updateData: Stripe.ProductUpdateParams = {};
      
      if (config.name) updateData.name = config.name;
      if (config.description) updateData.description = config.description;
      
      updateData.metadata = {
        updated_by: 'vendzz_checkout_builder',
        last_updated: new Date().toISOString()
      };

      return await this.stripe.products.update(productId, updateData);
    } catch (error) {
      console.error('Erro ao atualizar produto no Stripe:', error);
      throw new Error('Falha ao atualizar produto no Stripe');
    }
  }

  // Criar sessão de checkout
  async createCheckoutSession(
    priceId: string,
    options: {
      successUrl: string;
      cancelUrl: string;
      customerId?: string;
      trialPeriodDays?: number;
      allowPromotionCodes?: boolean;
      collectTaxes?: boolean;
      mode?: 'payment' | 'subscription' | 'setup';
    }
  ): Promise<Stripe.Checkout.Session> {
    try {
      const sessionData: Stripe.Checkout.SessionCreateParams = {
        mode: options.mode || 'payment',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: options.successUrl,
        cancel_url: options.cancelUrl,
        automatic_tax: {
          enabled: options.collectTaxes || false,
        },
        allow_promotion_codes: options.allowPromotionCodes || false,
      };

      if (options.customerId) {
        sessionData.customer = options.customerId;
      }

      if (options.mode === 'subscription' && options.trialPeriodDays) {
        sessionData.subscription_data = {
          trial_period_days: options.trialPeriodDays,
        };
      }

      return await this.stripe.checkout.sessions.create(sessionData);
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      throw new Error('Falha ao criar sessão de checkout');
    }
  }

  // Listar produtos
  async listProducts(limit = 100): Promise<Stripe.Product[]> {
    try {
      const products = await this.stripe.products.list({
        limit,
        active: true,
      });
      return products.data;
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      throw new Error('Falha ao listar produtos');
    }
  }

  // Listar preços de um produto
  async listPrices(productId: string): Promise<Stripe.Price[]> {
    try {
      const prices = await this.stripe.prices.list({
        product: productId,
        active: true,
      });
      return prices.data;
    } catch (error) {
      console.error('Erro ao listar preços:', error);
      throw new Error('Falha ao listar preços');
    }
  }

  // Criar cliente
  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.create({
        email,
        name,
        metadata: {
          created_by: 'vendzz_checkout_builder',
        },
      });
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw new Error('Falha ao criar cliente');
    }
  }

  // Buscar cliente por email
  async findCustomerByEmail(email: string): Promise<Stripe.Customer | null> {
    try {
      const customers = await this.stripe.customers.list({
        email,
        limit: 1,
      });
      return customers.data.length > 0 ? customers.data[0] : null;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }
  }

  // Criar portal de cobrança
  async createBillingPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    try {
      return await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
    } catch (error) {
      console.error('Erro ao criar portal de cobrança:', error);
      throw new Error('Falha ao criar portal de cobrança');
    }
  }

  // Webhook para processar eventos
  async processWebhook(body: string, signature: string, endpointSecret: string): Promise<Stripe.Event> {
    try {
      return this.stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw new Error('Falha ao processar webhook');
    }
  }

  // Verificar status de assinatura
  async getSubscriptionStatus(subscriptionId: string): Promise<{
    status: string;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
  }> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return {
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    } catch (error) {
      console.error('Erro ao verificar status da assinatura:', error);
      throw new Error('Falha ao verificar status da assinatura');
    }
  }

  // Cancelar assinatura
  async cancelSubscription(subscriptionId: string, atPeriodEnd = true): Promise<Stripe.Subscription> {
    try {
      if (atPeriodEnd) {
        return await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      } else {
        return await this.stripe.subscriptions.cancel(subscriptionId);
      }
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      throw new Error('Falha ao cancelar assinatura');
    }
  }

  // Obter todas as moedas suportadas
  async getSupportedCurrencies(): Promise<string[]> {
    // Lista baseada na documentação do Stripe
    return [
      'usd', 'eur', 'gbp', 'brl', 'cad', 'aud', 'jpy', 'cny', 'inr', 'krw',
      'mxn', 'ars', 'clp', 'cop', 'pen', 'uyu', 'chf', 'nok', 'sek', 'dkk',
      'pln', 'czk', 'huf', 'rub', 'try', 'zar', 'sgd', 'hkd', 'nzd', 'thb',
      'myr', 'idr', 'php', 'vnd', 'egp', 'mad', 'ngn', 'kes', 'ghs', 'xof',
      'xaf', 'ils', 'sar', 'aed', 'qar', 'kwd', 'bhd', 'omr', 'jod', 'lbp'
    ];
  }
}

// Exportar apenas se a chave do Stripe existir
export const stripeService = process.env.STRIPE_SECRET_KEY ? new StripeService() : null;