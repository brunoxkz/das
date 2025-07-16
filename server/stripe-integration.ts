import Stripe from 'stripe';

// Inicializar Stripe apenas se a chave existir
let stripe: Stripe | null = null;

// Verificar .env explicitamente
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51RjvV9HK6al3veW1FPD5bTV1on2NQLlm9ud45AJDggFHdsGA9UAo5jfbSRvWF83W3uTp5cpZYa8tJBvm4ttefrk800mUs47pFA';

if (stripeSecretKey && stripeSecretKey.startsWith('sk_')) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-09-30.acacia',
  });
  console.log('✅ Stripe inicializado com sucesso');
} else {
  console.log('⚠️ Stripe não inicializado - chave não encontrada');
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
    if (!stripe) {
      throw new Error('Stripe não foi inicializado');
    }
    this.stripe = stripe;
  }

  // Criar cliente Stripe
  async createCustomer(customerData: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email: customerData.email,
        name: customerData.name,
        phone: customerData.phone,
        metadata: customerData.metadata || {}
      });
      return customer;
    } catch (error) {
      console.error('Erro ao criar cliente Stripe:', error);
      throw new Error('Falha ao criar cliente no Stripe');
    }
  }

  // Criar checkout session com trial
  async createCheckoutSession(params: {
    priceId: string;
    customerId?: string;
    customerEmail?: string;
    trialPeriodDays?: number;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Checkout.Session> {
    try {
      const sessionData: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{
          price: params.priceId,
          quantity: 1,
        }],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: params.metadata || {}
      };

      // Adicionar cliente se fornecido
      if (params.customerId) {
        sessionData.customer = params.customerId;
      } else if (params.customerEmail) {
        sessionData.customer_email = params.customerEmail;
      }

      // Configurar período de trial
      if (params.trialPeriodDays && params.trialPeriodDays > 0) {
        sessionData.subscription_data = {
          trial_period_days: params.trialPeriodDays,
          metadata: params.metadata || {}
        };
      }

      const session = await this.stripe.checkout.sessions.create(sessionData);
      return session;
    } catch (error) {
      console.error('Erro ao criar checkout session:', error);
      throw new Error('Falha ao criar sessão de checkout');
    }
  }

  // Criar assinatura direta
  async createSubscription(params: {
    customerId: string;
    priceId: string;
    trialPeriodDays?: number;
    paymentMethodId?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Subscription> {
    try {
      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: params.customerId,
        items: [{ price: params.priceId }],
        metadata: params.metadata || {}
      };

      // Adicionar período de trial
      if (params.trialPeriodDays && params.trialPeriodDays > 0) {
        subscriptionData.trial_period_days = params.trialPeriodDays;
      }

      // Adicionar método de pagamento se fornecido
      if (params.paymentMethodId) {
        subscriptionData.default_payment_method = params.paymentMethodId;
      }

      const subscription = await this.stripe.subscriptions.create(subscriptionData);
      return subscription;
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      throw new Error('Falha ao criar assinatura');
    }
  }

  // Obter assinatura
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Erro ao obter assinatura:', error);
      throw new Error('Falha ao obter assinatura');
    }
  }

  // Criar token de cartão
  async createCardToken(card: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  }): Promise<Stripe.Token> {
    try {
      const token = await this.stripe.tokens.create({
        card: {
          number: card.number,
          exp_month: card.exp_month,
          exp_year: card.exp_year,
          cvc: card.cvc
        }
      });
      return token;
    } catch (error) {
      console.error('Erro ao criar token de cartão:', error);
      throw new Error('Falha ao criar token de cartão');
    }
  }

  // Criar preço para produto
  async createPrice(params: {
    productId: string;
    unitAmount: number;
    currency: string;
    recurring?: { interval: string };
  }): Promise<Stripe.Price> {
    try {
      const priceData: Stripe.PriceCreateParams = {
        product: params.productId,
        unit_amount: params.unitAmount,
        currency: params.currency
      };

      if (params.recurring) {
        priceData.recurring = {
          interval: params.recurring.interval as 'month' | 'year'
        };
      }

      const price = await this.stripe.prices.create(priceData);
      return price;
    } catch (error) {
      console.error('Erro ao criar preço:', error);
      throw new Error('Falha ao criar preço');
    }
  }

  // Anexar método de pagamento ao cliente
  async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });
      return paymentMethod;
    } catch (error) {
      console.error('Erro ao anexar método de pagamento:', error);
      throw new Error('Falha ao anexar método de pagamento');
    }
  }

  // Criar fatura
  async createInvoice(params: {
    customer: string;
    subscription?: string;
    auto_advance?: boolean;
  }): Promise<Stripe.Invoice> {
    try {
      const invoice = await this.stripe.invoices.create({
        customer: params.customer,
        subscription: params.subscription,
        auto_advance: params.auto_advance
      });
      return invoice;
    } catch (error) {
      console.error('Erro ao criar fatura:', error);
      throw new Error('Falha ao criar fatura');
    }
  }

  // Atualizar assinatura
  async updateSubscription(subscriptionId: string, params: {
    cancel_at_period_end?: boolean;
    priceId?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, params);
      return subscription;
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error);
      throw new Error('Falha ao atualizar assinatura');
    }
  }

  // Cancelar assinatura
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      throw new Error('Falha ao cancelar assinatura');
    }
  }

  // Verificar webhook
  verifyWebhook(payload: string, signature: string): Stripe.Event {
    try {
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!endpointSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET não configurado');
      }

      const event = this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
      return event;
    } catch (error) {
      console.error('Erro ao verificar webhook:', error);
      throw new Error('Falha na verificação do webhook');
    }
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

  // Criar Payment Intent
  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    customerId?: string;
    paymentMethodId?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntentData: Stripe.PaymentIntentCreateParams = {
        amount: params.amount,
        currency: params.currency,
        metadata: params.metadata || {}
      };

      if (params.customerId) {
        paymentIntentData.customer = params.customerId;
      }

      if (params.paymentMethodId) {
        paymentIntentData.payment_method = params.paymentMethodId;
        paymentIntentData.confirm = true;
      }

      return await this.stripe.paymentIntents.create(paymentIntentData);
    } catch (error) {
      console.error('Erro ao criar Payment Intent:', error);
      throw new Error('Falha ao criar Payment Intent');
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