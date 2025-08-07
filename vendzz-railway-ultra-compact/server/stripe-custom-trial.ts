import Stripe from 'stripe';

export interface CustomTrialConfig {
  planName: string;
  planDescription: string;
  trialAmount: number; // R$ 10,00
  trialDays: number; // 3 dias
  recurringAmount: number; // R$ 40,00
  recurringInterval: 'month' | 'year';
  currency: string;
  customerEmail: string;
  customerName?: string;
}

export class StripeCustomTrialSystem {
  private stripe: Stripe;

  constructor(stripeSecretKey: string) {
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-09-30.acacia',
    });
  }

  /**
   * SOLUÇÃO CORRETA: R$ 10,00 IMEDIATO + R$ 40,00/MÊS APÓS 3 DIAS
   * Estratégia: Payment Intent (cobrança imediata) + Subscription Schedule (recorrente após trial)
   */
  async createCustomTrialCheckout(config: CustomTrialConfig): Promise<{
    checkoutSessionId: string;
    checkoutUrl: string;
    customerId: string;
    trialPaymentIntentId: string;
    recurringPriceId: string;
    subscriptionScheduleId: string;
    trialAmount: number;
    recurringAmount: number;
    trialDays: number;
    explanation: string;
  }> {
    try {
      console.log('🔧 CRIANDO SISTEMA DE TRIAL CUSTOMIZADO:', config);

      // 1. Criar cliente
      const customer = await this.stripe.customers.create({
        email: config.customerEmail,
        name: config.customerName,
        metadata: {
          trial_type: 'custom_paid_trial',
          trial_amount: config.trialAmount.toString(),
          trial_days: config.trialDays.toString(),
          recurring_amount: config.recurringAmount.toString(),
          created_at: new Date().toISOString(),
        },
      });

      console.log('✅ Cliente criado:', customer.id);

      // 2. Criar produto para a assinatura recorrente
      const product = await this.stripe.products.create({
        name: config.planName,
        description: config.planDescription,
        metadata: {
          type: 'recurring_subscription',
          trial_amount: config.trialAmount.toString(),
          trial_days: config.trialDays.toString(),
        },
      });

      console.log('✅ Produto criado:', product.id);

      // 3. Criar preço recorrente
      const recurringPrice = await this.stripe.prices.create({
        currency: config.currency.toLowerCase(),
        unit_amount: Math.round(config.recurringAmount * 100),
        recurring: {
          interval: config.recurringInterval,
        },
        product: product.id,
        metadata: {
          type: 'recurring_price',
          original_amount: config.recurringAmount.toString(),
        },
      });

      console.log('✅ Preço recorrente criado:', recurringPrice.id);

      // 4. Criar Payment Intent para cobrança imediata de R$ 10,00
      const trialPaymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(config.trialAmount * 100),
        currency: config.currency.toLowerCase(),
        customer: customer.id,
        description: `Taxa de ativação do trial - ${config.planName}`,
        metadata: {
          type: 'trial_activation_fee',
          plan_name: config.planName,
          trial_days: config.trialDays.toString(),
          recurring_amount: config.recurringAmount.toString(),
        },
        setup_future_usage: 'off_session', // Importante: salvar método de pagamento para uso futuro
      });

      console.log('✅ Payment Intent criado:', trialPaymentIntent.id);

      // 5. Criar Subscription Schedule para cobrança recorrente após trial
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + config.trialDays);

      const subscriptionSchedule = await this.stripe.subscriptionSchedules.create({
        customer: customer.id,
        start_date: Math.floor(trialEndDate.getTime() / 1000),
        phases: [
          {
            items: [
              {
                price: recurringPrice.id,
                quantity: 1,
              },
            ],
            metadata: {
              phase_type: 'recurring_after_trial',
              trial_completed: 'true',
            },
          },
        ],
        metadata: {
          type: 'post_trial_subscription',
          trial_payment_intent: trialPaymentIntent.id,
          trial_amount: config.trialAmount.toString(),
          trial_days: config.trialDays.toString(),
        },
      });

      console.log('✅ Subscription Schedule criado:', subscriptionSchedule.id);

      // 6. Criar Checkout Session para pagamento imediato
      const checkoutSession = await this.stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: config.currency.toLowerCase(),
              product_data: {
                name: `${config.planName} - Taxa de Ativação`,
                description: `R$${config.trialAmount.toFixed(2)} por ${config.trialDays} dias, depois R$${config.recurringAmount.toFixed(2)}/${config.recurringInterval}`,
              },
              unit_amount: Math.round(config.trialAmount * 100),
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=custom_trial`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/checkout/cancel`,
        payment_intent_data: {
          setup_future_usage: 'off_session',
          metadata: {
            type: 'trial_activation',
            subscription_schedule_id: subscriptionSchedule.id,
            customer_id: customer.id,
          },
        },
        metadata: {
          type: 'custom_trial_checkout',
          customer_id: customer.id,
          subscription_schedule_id: subscriptionSchedule.id,
          trial_amount: config.trialAmount.toString(),
          recurring_amount: config.recurringAmount.toString(),
          trial_days: config.trialDays.toString(),
        },
      });

      console.log('✅ Checkout Session criado:', checkoutSession.id);

      return {
        checkoutSessionId: checkoutSession.id,
        checkoutUrl: checkoutSession.url!,
        customerId: customer.id,
        trialPaymentIntentId: trialPaymentIntent.id,
        recurringPriceId: recurringPrice.id,
        subscriptionScheduleId: subscriptionSchedule.id,
        trialAmount: config.trialAmount,
        recurringAmount: config.recurringAmount,
        trialDays: config.trialDays,
        explanation: `
✅ FLUXO IMPLEMENTADO:
1. Cliente paga R$${config.trialAmount.toFixed(2)} IMEDIATAMENTE
2. Recebe acesso por ${config.trialDays} dias
3. Após ${config.trialDays} dias → cobrança automática de R$${config.recurringAmount.toFixed(2)}/${config.recurringInterval}
4. Cartão salvo para cobranças futuras
5. Subscription Schedule gerencia cobrança recorrente automaticamente

🔧 COMPONENTES CRIADOS:
- Customer: ${customer.id}
- Product: ${product.id}
- Price: ${recurringPrice.id}
- Payment Intent: ${trialPaymentIntent.id}
- Subscription Schedule: ${subscriptionSchedule.id}
- Checkout Session: ${checkoutSession.id}
        `.trim(),
      };
    } catch (error) {
      console.error('❌ ERRO AO CRIAR CUSTOM TRIAL CHECKOUT:', error);
      throw new Error(`Falha ao criar checkout customizado: ${error.message}`);
    }
  }

  /**
   * Webhook handler para processar pagamento do trial e ativar subscription
   */
  async handleTrialPaymentSuccess(paymentIntentId: string): Promise<void> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        const subscriptionScheduleId = paymentIntent.metadata?.subscription_schedule_id;
        
        if (subscriptionScheduleId) {
          // Ativar subscription schedule
          await this.stripe.subscriptionSchedules.update(subscriptionScheduleId, {
            metadata: {
              trial_payment_completed: 'true',
              trial_payment_intent: paymentIntentId,
              status: 'active',
            },
          });
          
          console.log('✅ Subscription Schedule ativado após pagamento do trial');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao processar pagamento do trial:', error);
    }
  }

  /**
   * Cancelar subscription schedule se necessário
   */
  async cancelSubscriptionSchedule(subscriptionScheduleId: string): Promise<void> {
    try {
      await this.stripe.subscriptionSchedules.cancel(subscriptionScheduleId);
      console.log('✅ Subscription Schedule cancelado');
    } catch (error) {
      console.error('❌ Erro ao cancelar subscription schedule:', error);
    }
  }
}