import Stripe from 'stripe';
import { nanoid } from 'nanoid';

export interface TrialSubscriptionConfig {
  name: string;
  description: string;
  trialAmount: number; // R$1,00
  trialDays: number; // 3 dias
  recurringAmount: number; // R$29,90
  recurringInterval: 'month' | 'year';
  currency: string;
  customerEmail: string;
}

export class StripeCheckoutCustom {
  private stripe: Stripe;

  constructor(stripeSecretKey: string) {
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * MODELO CORRETO: R$1,00 IMEDIATO + R$29,90/MÊS APÓS 3 DIAS
   * Estratégia técnica: Setup Intent + Payment Intent + Scheduled Subscription
   */
  async createTrialSubscriptionCheckout(config: TrialSubscriptionConfig): Promise<{
    checkoutSessionId: string;
    clientSecret: string;
    customerId: string;
    productId: string;
    recurringPriceId: string;
    immediatePaymentIntentId: string;
  }> {
    try {
      // 1. Criar/encontrar cliente
      const customer = await this.stripe.customers.create({
        email: config.customerEmail,
        metadata: {
          subscription_type: 'trial_to_recurring',
          trial_amount: config.trialAmount.toString(),
          trial_days: config.trialDays.toString(),
        },
      });

      // 2. Criar produto
      const product = await this.stripe.products.create({
        name: config.name,
        description: config.description,
        metadata: {
          payment_model: 'immediate_trial_then_recurring',
        },
      });

      // 3. Criar preço recorrente (R$29,90/mês)
      const recurringPrice = await this.stripe.prices.create({
        unit_amount: Math.round(config.recurringAmount * 100),
        currency: config.currency.toLowerCase(),
        recurring: {
          interval: config.recurringInterval,
        },
        product: product.id,
      });

      // 4. PAYMENT INTENT PARA COBRANÇA IMEDIATA DE R$1,00
      const immediatePaymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(config.trialAmount * 100), // R$1,00 = 100 centavos
        currency: config.currency.toLowerCase(),
        customer: customer.id,
        description: `Taxa de ativação - ${config.name}`,
        metadata: {
          type: 'trial_activation_fee',
          customer_id: customer.id,
          product_id: product.id,
          recurring_price_id: recurringPrice.id,
          trial_days: config.trialDays.toString(),
        },
        // Confirmar automaticamente após pagamento
        confirm: false,
        payment_method_types: ['card'],
      });

      // 5. CRIAR CHECKOUT SESSION PERSONALIZADA
      const checkoutSession = await this.stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        mode: 'payment', // Modo payment para cobrança imediata
        line_items: [
          {
            price_data: {
              currency: config.currency.toLowerCase(),
              product_data: {
                name: `${config.name} - Taxa de Ativação`,
                description: `R$${config.trialAmount.toFixed(2)} por ${config.trialDays} dias, depois R$${config.recurringAmount.toFixed(2)}/${config.recurringInterval}`,
              },
              unit_amount: Math.round(config.trialAmount * 100),
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/checkout/cancel`,
        metadata: {
          payment_type: 'trial_activation',
          customer_id: customer.id,
          product_id: product.id,
          recurring_price_id: recurringPrice.id,
          trial_days: config.trialDays.toString(),
          recurring_amount: config.recurringAmount.toString(),
        },
      });

      return {
        checkoutSessionId: checkoutSession.id,
        clientSecret: immediatePaymentIntent.client_secret!,
        customerId: customer.id,
        productId: product.id,
        recurringPriceId: recurringPrice.id,
        immediatePaymentIntentId: immediatePaymentIntent.id,
      };
    } catch (error) {
      console.error('❌ ERRO AO CRIAR CHECKOUT CUSTOMIZADO:', error);
      throw new Error(`Falha ao criar checkout: ${error.message}`);
    }
  }

  /**
   * WEBHOOK HANDLER: Processar pagamento da taxa de ativação
   * Após pagamento de R$1,00, criar assinatura recorrente com delay
   */
  async handleTrialActivationPayment(paymentIntentId: string): Promise<void> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        const customerId = paymentIntent.customer as string;
        const recurringPriceId = paymentIntent.metadata.recurring_price_id;
        const trialDays = parseInt(paymentIntent.metadata.trial_days);

        // Criar assinatura que começará após o período de trial
        const subscriptionStartDate = new Date();
        subscriptionStartDate.setDate(subscriptionStartDate.getDate() + trialDays);

        const subscription = await this.stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: recurringPriceId }],
          // Começar a assinatura após o período de trial
          billing_cycle_anchor: Math.floor(subscriptionStartDate.getTime() / 1000),
          metadata: {
            payment_model: 'trial_to_recurring',
            trial_payment_intent: paymentIntentId,
            activation_date: new Date().toISOString(),
            recurring_start_date: subscriptionStartDate.toISOString(),
          },
        });

        console.log('✅ ASSINATURA RECORRENTE CRIADA:', subscription.id);
        console.log('🕒 INÍCIO DA COBRANÇA:', subscriptionStartDate.toISOString());
      }
    } catch (error) {
      console.error('❌ ERRO AO PROCESSAR ATIVAÇÃO:', error);
      throw error;
    }
  }

  /**
   * VERIFICAR STATUS DO CHECKOUT
   */
  async getCheckoutStatus(sessionId: string): Promise<{
    status: string;
    paymentStatus: string;
    subscriptionId?: string;
  }> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      
      let subscriptionId: string | undefined;
      
      if (session.payment_status === 'paid') {
        // Buscar assinatura criada pelo webhook
        const subscriptions = await this.stripe.subscriptions.list({
          customer: session.customer as string,
          limit: 1,
        });
        
        subscriptionId = subscriptions.data[0]?.id;
      }

      return {
        status: session.status || 'unknown',
        paymentStatus: session.payment_status || 'unknown',
        subscriptionId,
      };
    } catch (error) {
      console.error('❌ ERRO AO VERIFICAR STATUS:', error);
      throw error;
    }
  }
}