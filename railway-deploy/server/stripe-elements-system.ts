import Stripe from 'stripe';

export interface StripeElementsConfig {
  name: string;
  description: string;
  immediateAmount: number; // R$1,00
  trialDays: number; // 3 dias  
  recurringAmount: number; // R$29,90
  currency: string;
  customerEmail: string;
  customerName?: string;
}

export class StripeElementsSystem {
  private stripe: Stripe;

  constructor(stripeSecretKey: string) {
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * FLUXO CORRETO COM STRIPE ELEMENTS:
   * 1. Cliente insere cartão (Elements)
   * 2. Salva payment_method e cria customer
   * 3. Cobra R$1 agora (via invoice)
   * 4. Cria assinatura com trial de 3 dias
   * 5. Stripe cobra R$29,90 automaticamente após trial
   */
  async createElementsCheckout(config: StripeElementsConfig): Promise<{
    clientSecret: string;
    customerId: string;
    productId: string;
    subscriptionPriceId: string;
    setupIntentId: string;
  }> {
    try {
      // 1. Criar customer
      const customer = await this.stripe.customers.create({
        email: config.customerEmail,
        name: config.customerName || config.customerEmail,
        metadata: {
          checkout_type: 'elements_immediate_then_subscription',
          immediate_amount: config.immediateAmount.toString(),
          trial_days: config.trialDays.toString(),
          recurring_amount: config.recurringAmount.toString(),
        },
      });

      // 2. Criar produto para assinatura
      const product = await this.stripe.products.create({
        name: config.name,
        description: config.description,
        metadata: {
          payment_model: 'immediate_invoice_then_subscription',
        },
      });

      // 3. Criar preço recorrente
      const recurringPrice = await this.stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(config.recurringAmount * 100),
        currency: config.currency.toLowerCase(),
        recurring: {
          interval: 'month',
        },
      });

      // 4. Criar Setup Intent para salvar cartão
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customer.id,
        payment_method_types: ['card'],
        usage: 'off_session',
        metadata: {
          customer_id: customer.id,
          product_id: product.id,
          recurring_price_id: recurringPrice.id,
          immediate_amount: config.immediateAmount.toString(),
          trial_days: config.trialDays.toString(),
        },
      });

      console.log('✅ STRIPE ELEMENTS CHECKOUT CRIADO:', {
        customerId: customer.id,
        productId: product.id,
        subscriptionPriceId: recurringPrice.id,
        setupIntentId: setupIntent.id,
        clientSecret: setupIntent.client_secret,
      });

      return {
        clientSecret: setupIntent.client_secret!,
        customerId: customer.id,
        productId: product.id,
        subscriptionPriceId: recurringPrice.id,
        setupIntentId: setupIntent.id,
      };
    } catch (error) {
      console.error('❌ ERRO AO CRIAR ELEMENTS CHECKOUT:', error);
      throw new Error(`Falha ao criar checkout: ${error.message}`);
    }
  }

  /**
   * PROCESSAR PAGAMENTO APÓS SETUP INTENT CONFIRMADO
   * Chamado após o cliente confirmar o cartão no frontend
   */
  async processElementsPayment(setupIntentId: string): Promise<{
    invoiceId: string;
    subscriptionId: string;
    immediateChargeStatus: string;
    trialEndDate: string;
  }> {
    try {
      // 1. Recuperar setup intent
      const setupIntent = await this.stripe.setupIntents.retrieve(setupIntentId);
      
      if (setupIntent.status !== 'succeeded') {
        throw new Error('Setup Intent não foi confirmado');
      }

      const customerId = setupIntent.customer as string;
      const paymentMethodId = setupIntent.payment_method as string;
      const metadata = setupIntent.metadata;

      // 2. Definir payment method como padrão
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // 3. CRIAR INVOICE ITEM DE R$1 (COBRANÇA IMEDIATA)
      const invoiceItem = await this.stripe.invoiceItems.create({
        customer: customerId,
        amount: Math.round(parseFloat(metadata.immediate_amount) * 100),
        currency: 'brl',
        description: 'Taxa de ativação - Acesso imediato',
        metadata: {
          type: 'immediate_activation_fee',
          setup_intent_id: setupIntentId,
        },
      });

      // 4. CRIAR E COBRAR INVOICE IMEDIATAMENTE
      const invoice = await this.stripe.invoices.create({
        customer: customerId,
        auto_advance: true,
        metadata: {
          type: 'immediate_charge',
          setup_intent_id: setupIntentId,
        },
      });

      const paidInvoice = await this.stripe.invoices.pay(invoice.id, {
        payment_method: paymentMethodId,
      });

      // 5. CRIAR ASSINATURA COM TRIAL (só após pagamento bem-sucedido)
      if (paidInvoice.status === 'paid') {
        const trialDays = parseInt(metadata.trial_days);
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + trialDays);

        const subscription = await this.stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: metadata.recurring_price_id }],
          trial_end: Math.floor(trialEndDate.getTime() / 1000),
          default_payment_method: paymentMethodId,
          metadata: {
            setup_intent_id: setupIntentId,
            immediate_invoice_id: invoice.id,
            activation_fee_paid: metadata.immediate_amount,
            trial_days: metadata.trial_days,
          },
        });

        console.log('✅ PAGAMENTO PROCESSADO COM SUCESSO:', {
          invoiceId: invoice.id,
          subscriptionId: subscription.id,
          immediateChargeStatus: paidInvoice.status,
          trialEndDate: trialEndDate.toISOString(),
        });

        return {
          invoiceId: invoice.id,
          subscriptionId: subscription.id,
          immediateChargeStatus: paidInvoice.status,
          trialEndDate: trialEndDate.toISOString(),
        };
      } else {
        throw new Error('Falha ao processar pagamento imediato');
      }
    } catch (error) {
      console.error('❌ ERRO AO PROCESSAR PAGAMENTO:', error);
      throw error;
    }
  }

  /**
   * VERIFICAR STATUS DO PAGAMENTO
   */
  async getPaymentStatus(setupIntentId: string): Promise<{
    status: string;
    paymentConfirmed: boolean;
    subscriptionId?: string;
    invoiceId?: string;
    trialEndDate?: string;
  }> {
    try {
      const setupIntent = await this.stripe.setupIntents.retrieve(setupIntentId);
      
      let subscriptionId: string | undefined;
      let invoiceId: string | undefined;
      let trialEndDate: string | undefined;

      if (setupIntent.status === 'succeeded') {
        // Buscar subscription e invoice criados
        const subscriptions = await this.stripe.subscriptions.list({
          customer: setupIntent.customer as string,
          limit: 1,
        });

        const invoices = await this.stripe.invoices.list({
          customer: setupIntent.customer as string,
          limit: 1,
        });

        subscriptionId = subscriptions.data[0]?.id;
        invoiceId = invoices.data[0]?.id;
        trialEndDate = subscriptions.data[0]?.trial_end 
          ? new Date(subscriptions.data[0].trial_end * 1000).toISOString()
          : undefined;
      }

      return {
        status: setupIntent.status,
        paymentConfirmed: setupIntent.status === 'succeeded',
        subscriptionId,
        invoiceId,
        trialEndDate,
      };
    } catch (error) {
      console.error('❌ ERRO AO VERIFICAR STATUS:', error);
      throw error;
    }
  }
}