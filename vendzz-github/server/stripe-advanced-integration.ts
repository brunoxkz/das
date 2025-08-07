import Stripe from 'stripe';

// Configuração do Stripe conforme documentação oficial
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

interface CreateAdvancedCheckoutParams {
  userId: string;
  userEmail: string;
  userName: string;
  activationFee?: number;
  subscriptionPrice?: number;
  trialPeriodDays?: number;
  currency?: string;
}

export class StripeAdvancedIntegration {
  private stripe: Stripe;

  constructor() {
    this.stripe = stripe;
  }

  /**
   * Cria checkout session com Invoice Item R$1,00 + Subscription com trial
   * Baseado na documentação oficial do Stripe
   */
  async createAdvancedCheckoutSession(params: CreateAdvancedCheckoutParams) {
    const {
      userId,
      userEmail,
      userName,
      activationFee = 1.00,
      subscriptionPrice = 29.00,
      trialPeriodDays = 3,
      currency = 'BRL'
    } = params;

    console.log('🔥 IMPLEMENTAÇÃO AVANÇADA STRIPE - INVOICE ITEM + SUBSCRIPTION');
    console.log('📊 Parâmetros:', params);

    // 1. Criar ou recuperar customer
    const customer = await this.stripe.customers.create({
      email: userEmail,
      name: userName,
      metadata: {
        userId,
        flow: 'advanced_checkout'
      }
    });

    console.log('👤 Customer criado:', customer.id);

    // 2. Criar produto para assinatura mensal
    const subscriptionProduct = await this.stripe.products.create({
      name: 'Plano Premium - Vendzz',
      description: `Assinatura mensal R$${subscriptionPrice}`,
      metadata: {
        type: 'subscription',
        userId
      }
    });

    // 3. Criar preço para assinatura
    const subscriptionPrice_obj = await this.stripe.prices.create({
      product: subscriptionProduct.id,
      currency: currency.toLowerCase(),
      recurring: {
        interval: 'month'
      },
      unit_amount: Math.round(subscriptionPrice * 100)
    });

    console.log('💰 Preço de assinatura criado:', subscriptionPrice_obj.id);

    // 4. Criar Invoice Item para taxa de ativação R$1,00
    // Conforme: https://stripe.com/docs/invoicing/invoice-items
    const invoiceItem = await this.stripe.invoiceItems.create({
      customer: customer.id,
      amount: Math.round(activationFee * 100),
      currency: currency.toLowerCase(),
      description: `Taxa de ativação - Trial ${trialPeriodDays} dias`,
      metadata: {
        type: 'activation_fee',
        userId,
        trialPeriodDays: trialPeriodDays.toString()
      }
    });

    console.log('📄 Invoice Item criado:', invoiceItem.id);

    // 5. Criar Subscription com trial
    // Conforme: https://stripe.com/docs/billing/subscriptions/trials
    const subscription = await this.stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: subscriptionPrice_obj.id,
      }],
      trial_period_days: trialPeriodDays,
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription', // Salvar cartão
        payment_method_types: ['card']
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId,
        activationFee: activationFee.toString(),
        flow: 'advanced_checkout'
      }
    });

    console.log('🔄 Subscription criada:', subscription.id);

    // 6. Criar checkout session combinando invoice item + subscription
    // Baseado em: https://stripe.com/docs/billing/invoices/subscription-one-time
    const checkoutSession = await this.stripe.checkout.sessions.create({
      mode: 'setup',
      customer: customer.id,
      payment_method_types: ['card'],
      setup_intent_data: {
        metadata: {
          customer_id: customer.id,
          subscription_id: subscription.id,
          userId,
          flow: 'advanced_checkout'
        }
      },
      success_url: `${process.env.FRONTEND_URL || 'https://example.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://example.com'}/cancel`,
      metadata: {
        customer_id: customer.id,
        subscription_id: subscription.id,
        invoice_item_id: invoiceItem.id,
        userId,
        flow: 'advanced_checkout'
      }
    });

    console.log('✅ Checkout session criada:', checkoutSession.id);

    // 7. Após setup bem-sucedido, processar cobrança da taxa de ativação
    // Isso será feito via webhook

    return {
      checkoutSessionId: checkoutSession.id,
      checkoutUrl: checkoutSession.url,
      customerId: customer.id,
      subscriptionId: subscription.id,
      invoiceItemId: invoiceItem.id,
      subscriptionPriceId: subscriptionPrice_obj.id,
      clientSecret: checkoutSession.client_secret,
      
      // Informações de transparência
      billing_details: {
        immediate_charge: `R$${activationFee} (taxa de ativação)`,
        trial_period: `${trialPeriodDays} dias de trial gratuito`,
        recurring_charge: `R$${subscriptionPrice}/mês após ${trialPeriodDays} dias`,
        payment_method: 'Cartão salvo automaticamente',
        cancellation: 'Cancele a qualquer momento'
      },
      
      // Detalhes técnicos
      technical_details: {
        method: 'invoice_item_plus_subscription',
        invoice_item: invoiceItem.id,
        subscription: subscription.id,
        customer: customer.id,
        stripe_native: 'Implementação oficial Stripe',
        webhook_required: true
      }
    };
  }

  /**
   * Processa webhook do Stripe
   * Conforme: https://stripe.com/docs/webhooks
   */
  async processWebhook(event: Stripe.Event) {
    console.log('🔔 Webhook recebido:', event.type);

    switch (event.type) {
      case 'setup_intent.succeeded':
        return await this.handleSetupIntentSucceeded(event);
      
      case 'invoice.payment_succeeded':
        return await this.handleInvoicePaymentSucceeded(event);
      
      case 'customer.subscription.created':
        return await this.handleSubscriptionCreated(event);
      
      case 'customer.subscription.updated':
        return await this.handleSubscriptionUpdated(event);
      
      case 'customer.subscription.deleted':
        return await this.handleSubscriptionDeleted(event);
      
      default:
        console.log('📝 Webhook não processado:', event.type);
        return { received: true };
    }
  }

  /**
   * Quando setup_intent é bem-sucedido, processar cobrança da taxa de ativação
   */
  private async handleSetupIntentSucceeded(event: Stripe.Event) {
    const setupIntent = event.data.object as Stripe.SetupIntent;
    const customerId = setupIntent.customer as string;
    const paymentMethodId = setupIntent.payment_method as string;

    console.log('✅ Setup Intent bem-sucedido:', setupIntent.id);
    console.log('👤 Customer:', customerId);
    console.log('💳 Payment Method:', paymentMethodId);

    try {
      // 1. Definir payment method como padrão
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      // 2. Criar e finalizar invoice com taxa de ativação
      const invoice = await this.stripe.invoices.create({
        customer: customerId,
        auto_advance: true,
        collection_method: 'charge_automatically',
        description: 'Taxa de ativação - Trial Vendzz',
        metadata: {
          type: 'activation_fee',
          setup_intent_id: setupIntent.id
        }
      });

      const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(invoice.id);
      
      console.log('📄 Invoice de ativação criada e finalizada:', finalizedInvoice.id);

      // 3. Atualizar subscription para usar o payment method
      const subscriptionId = setupIntent.metadata?.subscription_id;
      if (subscriptionId) {
        await this.stripe.subscriptions.update(subscriptionId, {
          default_payment_method: paymentMethodId
        });
        console.log('🔄 Subscription atualizada com payment method:', subscriptionId);
      }

      return {
        success: true,
        invoice: finalizedInvoice.id,
        subscription: subscriptionId,
        payment_method: paymentMethodId
      };

    } catch (error) {
      console.error('❌ Erro ao processar setup_intent:', error);
      return { success: false, error: error.message };
    }
  }

  private async handleInvoicePaymentSucceeded(event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice;
    console.log('💰 Pagamento de invoice bem-sucedido:', invoice.id);
    
    // Lógica para atualizar status do usuário no banco
    return { success: true, invoice: invoice.id };
  }

  private async handleSubscriptionCreated(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;
    console.log('🔄 Subscription criada:', subscription.id);
    
    return { success: true, subscription: subscription.id };
  }

  private async handleSubscriptionUpdated(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;
    console.log('🔄 Subscription atualizada:', subscription.id);
    
    return { success: true, subscription: subscription.id };
  }

  private async handleSubscriptionDeleted(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;
    console.log('❌ Subscription cancelada:', subscription.id);
    
    return { success: true, subscription: subscription.id };
  }

  /**
   * Recupera informações detalhadas de uma session
   */
  async getCheckoutSessionDetails(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['setup_intent', 'customer', 'setup_intent.payment_method']
    });

    return session;
  }

  /**
   * Cancela uma subscription
   */
  async cancelSubscription(subscriptionId: string) {
    const subscription = await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    return subscription;
  }
}

export const stripeAdvanced = new StripeAdvancedIntegration();