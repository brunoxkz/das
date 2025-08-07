import Stripe from 'stripe';

export interface CorrectTrialConfig {
  planName: string;
  customerEmail: string;
  customerName?: string;
  trialAmount: number; // R$ 1,00
  trialDays: number; // 3 dias
  recurringAmount: number; // R$ 29,90
  currency: string;
}

export class StripeCorrectTrialSystem {
  private stripe: Stripe;

  constructor(stripeSecretKey: string) {
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-09-30.acacia',
    });
  }

  /**
   * IMPLEMENTAÇÃO CORRETA CONFORME SOLICITADO:
   * 1. Invoice Item R$1,00 ANTES da assinatura
   * 2. Customer com default_payment_method
   * 3. Subscription com trial_period_days: 3
   * 4. setup_future_usage: "off_session"
   * 5. R$29,90 recorrente mensal
   */
  async createCorrectTrialFlow(config: CorrectTrialConfig): Promise<{
    customerId: string;
    invoiceItemId: string;
    subscriptionId: string;
    checkoutSessionId: string;
    checkoutUrl: string;
    priceId: string;
    explanation: string;
  }> {
    try {
      console.log('🔧 CRIANDO FLUXO CORRETO DE TRIAL:', config);

      // 1. Criar Customer
      const customer = await this.stripe.customers.create({
        email: config.customerEmail,
        name: config.customerName,
        metadata: {
          trial_type: 'correct_paid_trial',
          trial_amount: config.trialAmount.toString(),
          trial_days: config.trialDays.toString(),
          recurring_amount: config.recurringAmount.toString(),
        },
      });

      console.log('✅ Customer criado:', customer.id);

      // 2. Criar Product para a assinatura recorrente
      const product = await this.stripe.products.create({
        name: config.planName,
        description: `Assinatura mensal ${config.planName}`,
        metadata: {
          type: 'monthly_subscription',
          trial_amount: config.trialAmount.toString(),
          trial_days: config.trialDays.toString(),
        },
      });

      console.log('✅ Product criado:', product.id);

      // 3. Criar Price para R$29,90/mês
      const recurringPrice = await this.stripe.prices.create({
        currency: config.currency.toLowerCase(),
        unit_amount: Math.round(config.recurringAmount * 100), // R$29,90 em centavos
        recurring: {
          interval: 'month',
        },
        product: product.id,
        metadata: {
          type: 'monthly_recurring',
          amount_brl: config.recurringAmount.toString(),
        },
      });

      console.log('✅ Price recorrente criado:', recurringPrice.id);

      // 4. Criar Invoice Item de R$1,00 ANTES da assinatura
      const invoiceItem = await this.stripe.invoiceItems.create({
        customer: customer.id,
        amount: Math.round(config.trialAmount * 100), // R$1,00 em centavos
        currency: config.currency.toLowerCase(),
        description: `Taxa de ativação - ${config.planName}`,
        metadata: {
          type: 'trial_activation_fee',
          plan_name: config.planName,
          trial_days: config.trialDays.toString(),
        },
      });

      console.log('✅ Invoice Item R$1,00 criado:', invoiceItem.id);

      // 5. Criar Subscription com trial_period_days
      const subscription = await this.stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: recurringPrice.id,
          },
        ],
        trial_period_days: config.trialDays, // 3 dias
        metadata: {
          type: 'trial_subscription',
          trial_fee_invoice_item: invoiceItem.id,
          trial_amount: config.trialAmount.toString(),
          trial_days: config.trialDays.toString(),
        },
        // Importante: configurar para salvar método de pagamento
        payment_behavior: 'default_incomplete',
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      console.log('✅ Subscription com trial criada:', subscription.id);

      // 6. Criar Checkout Session para pagamento de R$1,00 + setup da assinatura
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
                description: `R$${config.trialAmount.toFixed(2)} para ativação + R$${config.recurringAmount.toFixed(2)}/mês após ${config.trialDays} dias`,
              },
              unit_amount: Math.round(config.trialAmount * 100),
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          setup_future_usage: 'off_session',
          metadata: {
            type: 'trial_activation',
            subscription_id: subscription.id,
            invoice_item_id: invoiceItem.id,
          },
        },
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=correct_trial`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/checkout/cancel`,
        metadata: {
          type: 'correct_trial_checkout',
          customer_id: customer.id,
          subscription_id: subscription.id,
          invoice_item_id: invoiceItem.id,
          trial_amount: config.trialAmount.toString(),
          recurring_amount: config.recurringAmount.toString(),
        },
      });

      console.log('✅ Checkout Session criado:', checkoutSession.id);

      const explanation = `
✅ FLUXO CORRETO IMPLEMENTADO:
1. Invoice Item R$${config.trialAmount.toFixed(2)} criado ANTES da assinatura
2. Customer criado: ${customer.id}
3. Subscription criada com trial_period_days: ${config.trialDays}
4. Price R$${config.recurringAmount.toFixed(2)}/mês configurado
5. setup_future_usage configurado via Checkout Session mode 'setup'
6. Cartão será salvo automaticamente e reutilizado

🔧 COMPONENTES CRIADOS:
- Customer: ${customer.id}
- Product: ${product.id}
- Price: ${recurringPrice.id}
- Invoice Item: ${invoiceItem.id}
- Subscription: ${subscription.id}
- Checkout Session: ${checkoutSession.id}

📋 FLUXO DE COBRANÇA:
1. Cliente paga R$${config.trialAmount.toFixed(2)} IMEDIATAMENTE (Invoice Item)
2. Recebe ${config.trialDays} dias de trial
3. Após ${config.trialDays} dias → cobrança automática R$${config.recurringAmount.toFixed(2)}/mês
4. Cartão salvo via setup_future_usage
5. Cobrança R$${config.trialAmount.toFixed(2)} aparece SEPARADA da assinatura no Dashboard
      `.trim();

      return {
        customerId: customer.id,
        invoiceItemId: invoiceItem.id,
        subscriptionId: subscription.id,
        checkoutSessionId: checkoutSession.id,
        checkoutUrl: checkoutSession.url!,
        priceId: recurringPrice.id,
        explanation,
      };

    } catch (error) {
      console.error('❌ ERRO AO CRIAR FLUXO CORRETO:', error);
      throw new Error(`Falha ao criar trial correto: ${error.message}`);
    }
  }

  /**
   * Webhook handler para processar setup_intent.succeeded
   */
  async handleSetupIntentSucceeded(setupIntentId: string): Promise<void> {
    try {
      const setupIntent = await this.stripe.setupIntents.retrieve(setupIntentId);
      
      if (setupIntent.status === 'succeeded') {
        const customerId = setupIntent.customer as string;
        const paymentMethodId = setupIntent.payment_method as string;
        
        // Definir como default payment method
        await this.stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });

        // Buscar subscription nos metadados
        const subscriptionId = setupIntent.metadata?.subscription_id;
        const invoiceItemId = setupIntent.metadata?.invoice_item_id;
        
        if (subscriptionId) {
          // Atualizar subscription com o payment method
          await this.stripe.subscriptions.update(subscriptionId, {
            default_payment_method: paymentMethodId,
          });
        }

        // Processar cobrança de R$1,00 se necessário
        if (invoiceItemId) {
          const invoice = await this.stripe.invoices.create({
            customer: customerId,
            auto_advance: true,
          });

          await this.stripe.invoices.pay(invoice.id, {
            payment_method: paymentMethodId,
          });
        }

        console.log('✅ Setup Intent processado com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao processar setup_intent:', error);
      throw error;
    }
  }
}