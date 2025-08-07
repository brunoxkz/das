import Stripe from 'stripe';

/**
 * IMPLEMENTAÇÃO BASEADA NA REFERÊNCIA OFICIAL DA STRIPE
 * Repositório: stripe-samples/subscription-use-cases/one-time-and-subscription
 * 
 * Fluxo completo:
 * 1. Cobra R$1 imediatamente (invoice_items)
 * 2. Salva o cartão (payment_method)
 * 3. Cria assinatura com trial de 3 dias (subscription com trial_period_days)
 * 4. Cobra R$29,90/mês automaticamente após o trial
 */

export class StripeOneTimeSubscriptionService {
  private stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY não encontrada');
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    });
  }

  /**
   * CRIAR CHECKOUT SESSION COM FLUXO COMPLETO
   * Baseado no exemplo oficial da Stripe
   */
  async createOneTimeAndSubscriptionCheckout(params: {
    customerEmail: string;
    customerName?: string;
    immediateAmount: number; // R$1.00 em centavos = 100
    trialDays: number; // 3 dias
    recurringAmount: number; // R$29.90 em centavos = 2990
    recurringInterval: 'month' | 'year' | 'quarter';
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }) {
    try {
      console.log('🔥 CRIANDO CHECKOUT ONE-TIME + SUBSCRIPTION:', params);

      // 1. Criar ou buscar cliente
      const customer = await this.stripe.customers.create({
        email: params.customerEmail,
        name: params.customerName,
        metadata: params.metadata || {},
      });

      // 2. Criar produto para a assinatura recorrente
      const subscriptionProduct = await this.stripe.products.create({
        name: 'Assinatura Mensal',
        description: 'Acesso completo à plataforma',
        type: 'service',
      });

      // 3. Criar preço para a assinatura recorrente
      const subscriptionPrice = await this.stripe.prices.create({
        unit_amount: params.recurringAmount, // R$29.90
        currency: 'brl',
        recurring: {
          interval: params.recurringInterval as any,
        },
        product: subscriptionProduct.id,
      });

      // 4. Criar sessão de checkout com fluxo completo
      const session = await this.stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: subscriptionPrice.id,
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days: params.trialDays,
          metadata: {
            immediate_amount: params.immediateAmount.toString(),
            trial_days: params.trialDays.toString(),
            ...params.metadata,
          },
        },
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: {
          customer_email: params.customerEmail,
          immediate_amount: params.immediateAmount.toString(),
          trial_days: params.trialDays.toString(),
          recurring_amount: params.recurringAmount.toString(),
          ...params.metadata,
        },
      });

      console.log('✅ CHECKOUT SESSION CRIADA:', {
        sessionId: session.id,
        customerId: customer.id,
        subscriptionPriceId: subscriptionPrice.id,
        url: session.url,
      });

      return {
        sessionId: session.id,
        customerId: customer.id,
        subscriptionPriceId: subscriptionPrice.id,
        checkoutUrl: session.url,
        customer,
        session,
      };
    } catch (error) {
      console.error('❌ ERRO AO CRIAR CHECKOUT:', error);
      throw error;
    }
  }

  /**
   * PROCESSAR WEBHOOK PARA COBRANÇA IMEDIATA
   * Executado após o checkout ser concluído
   */
  async processImmediateChargeWebhook(sessionId: string) {
    try {
      console.log('🔥 PROCESSANDO COBRANÇA IMEDIATA:', sessionId);

      // Buscar a sessão
      const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['customer', 'subscription'],
      });

      if (!session.customer || !session.subscription) {
        throw new Error('Sessão inválida');
      }

      const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
      const immediateAmount = parseInt(session.metadata?.immediate_amount || '100');

      // Criar item de cobrança imediata (R$1.00)
      const invoiceItem = await this.stripe.invoiceItems.create({
        customer: customerId,
        amount: immediateAmount,
        currency: 'brl',
        description: 'Taxa de ativação da conta',
        metadata: {
          type: 'immediate_charge',
          session_id: sessionId,
          subscription_id: subscriptionId,
        },
      });

      // Criar e processar fatura imediata
      const invoice = await this.stripe.invoices.create({
        customer: customerId,
        auto_advance: true,
        collection_method: 'charge_automatically',
        metadata: {
          type: 'immediate_charge',
          session_id: sessionId,
          subscription_id: subscriptionId,
        },
      });

      // Finalizar fatura (cobra imediatamente)
      const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(invoice.id);
      const paidInvoice = await this.stripe.invoices.pay(finalizedInvoice.id);

      console.log('✅ COBRANÇA IMEDIATA PROCESSADA:', {
        invoiceId: paidInvoice.id,
        amount: immediateAmount,
        status: paidInvoice.status,
        customerId,
        subscriptionId,
      });

      return {
        invoiceId: paidInvoice.id,
        amount: immediateAmount,
        status: paidInvoice.status,
        customerId,
        subscriptionId,
        invoiceItem,
      };
    } catch (error) {
      console.error('❌ ERRO AO PROCESSAR COBRANÇA IMEDIATA:', error);
      throw error;
    }
  }

  /**
   * CRIAR PAYMENT INTENT PARA STRIPE ELEMENTS
   * Versão para integração com Elements
   */
  async createPaymentIntentWithSubscription(params: {
    customerEmail: string;
    customerName?: string;
    immediateAmount: number;
    trialDays: number;
    recurringAmount: number;
    recurringInterval: 'month' | 'year' | 'quarter';
    metadata?: Record<string, string>;
  }) {
    try {
      console.log('🔥 CRIANDO PAYMENT INTENT + SUBSCRIPTION:', params);

      // 1. Criar ou buscar cliente
      const customer = await this.stripe.customers.create({
        email: params.customerEmail,
        name: params.customerName,
        metadata: params.metadata || {},
      });

      // 2. Criar produto para a assinatura recorrente
      const subscriptionProduct = await this.stripe.products.create({
        name: 'Assinatura Mensal',
        description: 'Acesso completo à plataforma',
      });

      // 3. Criar preço para a assinatura recorrente
      const subscriptionPrice = await this.stripe.prices.create({
        unit_amount: params.recurringAmount,
        currency: 'brl',
        recurring: {
          interval: params.recurringInterval,
        },
        product: subscriptionProduct.id,
      });

      // 4. Criar Payment Intent para cobrança imediata
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: params.immediateAmount,
        currency: 'brl',
        customer: customer.id,
        description: 'Taxa de ativação da conta',
        setup_future_usage: 'off_session', // Salvar cartão para uso futuro
        metadata: {
          customer_email: params.customerEmail,
          subscription_price_id: subscriptionPrice.id,
          trial_days: params.trialDays.toString(),
          recurring_amount: params.recurringAmount.toString(),
          type: 'immediate_charge_with_subscription',
          ...params.metadata,
        },
      });

      console.log('✅ PAYMENT INTENT CRIADO:', {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        customerId: customer.id,
        subscriptionPriceId: subscriptionPrice.id,
      });

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        customerId: customer.id,
        subscriptionPriceId: subscriptionPrice.id,
        customer,
        paymentIntent,
      };
    } catch (error) {
      console.error('❌ ERRO AO CRIAR PAYMENT INTENT:', error);
      throw error;
    }
  }

  /**
   * CRIAR ASSINATURA APÓS PAGAMENTO IMEDIATO
   * Executado após o PaymentIntent ser confirmado
   */
  async createSubscriptionAfterPayment(params: {
    customerId: string;
    paymentMethodId: string;
    subscriptionPriceId: string;
    trialDays: number;
    metadata?: Record<string, string>;
  }) {
    try {
      console.log('🔥 CRIANDO ASSINATURA APÓS PAGAMENTO:', params);

      // Anexar método de pagamento ao cliente
      await this.stripe.paymentMethods.attach(params.paymentMethodId, {
        customer: params.customerId,
      });

      // Definir como método de pagamento padrão
      await this.stripe.customers.update(params.customerId, {
        invoice_settings: {
          default_payment_method: params.paymentMethodId,
        },
      });

      // Criar assinatura com trial
      const subscription = await this.stripe.subscriptions.create({
        customer: params.customerId,
        items: [
          {
            price: params.subscriptionPriceId,
          },
        ],
        trial_period_days: params.trialDays,
        default_payment_method: params.paymentMethodId,
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          type: 'post_payment_subscription',
          trial_days: params.trialDays.toString(),
          ...params.metadata,
        },
      });

      console.log('✅ ASSINATURA CRIADA:', {
        subscriptionId: subscription.id,
        status: subscription.status,
        trialEnd: subscription.trial_end,
        customerId: params.customerId,
      });

      return {
        subscriptionId: subscription.id,
        status: subscription.status,
        trialEnd: subscription.trial_end,
        customerId: params.customerId,
        subscription,
      };
    } catch (error) {
      console.error('❌ ERRO AO CRIAR ASSINATURA:', error);
      throw error;
    }
  }

  /**
   * BUSCAR DETALHES DA ASSINATURA
   */
  async getSubscriptionDetails(subscriptionId: string) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['customer', 'default_payment_method', 'latest_invoice'],
      });

      return {
        id: subscription.id,
        status: subscription.status,
        trialEnd: subscription.trial_end,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        customer: subscription.customer,
        defaultPaymentMethod: subscription.default_payment_method,
        latestInvoice: subscription.latest_invoice,
      };
    } catch (error) {
      console.error('❌ ERRO AO BUSCAR ASSINATURA:', error);
      throw error;
    }
  }

  /**
   * CANCELAR ASSINATURA
   */
  async cancelSubscription(subscriptionId: string) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      return {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: subscription.current_period_end,
      };
    } catch (error) {
      console.error('❌ ERRO AO CANCELAR ASSINATURA:', error);
      throw error;
    }
  }
}

export default StripeOneTimeSubscriptionService;