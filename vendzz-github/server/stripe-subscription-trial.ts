import Stripe from 'stripe';

// Inicialização do Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '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', {
  apiVersion: '2024-09-30.acacia',
});

export interface TrialSubscriptionData {
  paymentMethodId: string;
  customerName: string;
  customerEmail?: string;
  trialDays?: number;
  activationFee?: number; // R$ 1,00
  monthlyPrice?: number; // R$ 29,90
}

export class StripeTrialSubscriptionService {
  
  // PASSO 1: Criar cliente e cobrar R$1 (FLUXO OFICIAL STRIPE)
  async createCustomerAndChargeActivation(data: TrialSubscriptionData) {
    try {
      const uniqueId = Date.now();
      console.log(`🚀 [${uniqueId}] FLUXO OFICIAL STRIPE - Iniciando:`, {
        paymentMethodId: data.paymentMethodId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
      });

      // 1. Criar cliente primeiro
      const customer = await stripe.customers.create({
        name: data.customerName,
        email: data.customerEmail,
        metadata: {
          source: 'vendzz_trial_system',
          activation_fee: (data.activationFee || 1.00).toString(),
        },
      });

      console.log(`✅ [${uniqueId}] Cliente criado:`, customer.id);

      // 2. Anexar payment method ao cliente
      await stripe.paymentMethods.attach(data.paymentMethodId, {
        customer: customer.id,
      });

      console.log(`✅ [${uniqueId}] Payment method anexado ao cliente`);

      // 3. Definir payment method como padrão
      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: data.paymentMethodId,
        },
      });

      console.log(`✅ [${uniqueId}] Payment method definido como padrão`);

      // 4. Cobrar R$1,00 imediatamente (taxa de ativação)
      const activationInvoiceItem = await stripe.invoiceItems.create({
        customer: customer.id,
        amount: Math.round((data.activationFee || 1.00) * 100), // R$1,00 em centavos
        currency: 'brl',
        description: 'Taxa de Ativação - Plano Vendzz Premium',
      });

      console.log(`✅ [${uniqueId}] Invoice item de ativação criado:`, activationInvoiceItem.id);

      // 5. Criar e finalizar invoice para cobrança imediata
      const invoice = await stripe.invoices.create({
        customer: customer.id,
        auto_advance: true, // Finalizar automaticamente
        collection_method: 'charge_automatically',
        default_payment_method: data.paymentMethodId,
      });

      // 6. Finalizar invoice (cobrar R$1,00 agora)
      const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
      
      console.log(`💰 [${uniqueId}] Invoice finalizada - R$1,00 cobrado:`, finalizedInvoice.id);

      return {
        success: true,
        customer,
        activationInvoice: finalizedInvoice,
        activationInvoiceItem,
        message: 'Cliente criado e taxa de ativação (R$1,00) cobrada com sucesso',
      };

    } catch (error) {
      console.error('❌ Erro ao criar cliente e cobrar ativação:', error);
      throw error;
    }
  }

  // PASSO 2: Criar assinatura com trial de 3 dias (FLUXO OFICIAL STRIPE)
  async createTrialSubscription(customerId: string, data: TrialSubscriptionData) {
    try {
      const uniqueId = Date.now();
      console.log(`🚀 [${uniqueId}] Criando assinatura com trial:`, {
        customerId,
        trialDays: data.trialDays || 3,
        monthlyPrice: data.monthlyPrice || 29.90,
      });

      // 1. Criar produto (se não existir)
      const product = await stripe.products.create({
        name: 'Plano Vendzz Premium',
        description: 'Plano completo com todos os recursos da plataforma',
        type: 'service',
      });

      console.log(`✅ [${uniqueId}] Produto criado:`, product.id);

      // 2. Criar preço mensal
      const monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round((data.monthlyPrice || 29.90) * 100), // R$29,90 em centavos
        currency: 'brl',
        recurring: {
          interval: 'month',
          interval_count: 1,
        },
        nickname: 'Plano Mensal - R$29,90',
      });

      console.log(`✅ [${uniqueId}] Preço mensal criado:`, monthlyPrice.id);

      // 3. Criar assinatura com trial
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: monthlyPrice.id,
          },
        ],
        trial_period_days: data.trialDays || 3,
        default_payment_method: data.paymentMethodId,
        metadata: {
          source: 'vendzz_trial_system',
          monthly_price: (data.monthlyPrice || 29.90).toString(),
          trial_days: (data.trialDays || 3).toString(),
        },
      });

      console.log(`✅ [${uniqueId}] Assinatura criada:`, {
        subscriptionId: subscription.id,
        status: subscription.status,
        trialEnd: subscription.trial_end,
        currentPeriodEnd: subscription.current_period_end,
      });

      return {
        success: true,
        subscription,
        product,
        monthlyPrice,
        trialEndDate: new Date(subscription.trial_end! * 1000),
        nextBillingDate: new Date(subscription.current_period_end * 1000),
        message: 'Assinatura com trial criada com sucesso',
      };

    } catch (error) {
      console.error('❌ Erro ao criar assinatura com trial:', error);
      throw error;
    }
  }

  // FLUXO COMPLETO: Criar cliente + cobrar R$1 + criar assinatura com trial
  async createCompleteTrialFlow(data: TrialSubscriptionData) {
    try {
      const uniqueId = Date.now();
      console.log(`🎯 [${uniqueId}] FLUXO COMPLETO INICIADO:`, data);

      // PASSO 1: Criar cliente e cobrar R$1,00
      const customerResult = await this.createCustomerAndChargeActivation(data);

      // PASSO 2: Criar assinatura com trial
      const subscriptionResult = await this.createTrialSubscription(
        customerResult.customer.id,
        data
      );

      console.log(`🎉 [${uniqueId}] FLUXO COMPLETO FINALIZADO:`, {
        customerId: customerResult.customer.id,
        subscriptionId: subscriptionResult.subscription.id,
        activationInvoiceId: customerResult.activationInvoice.id,
        trialEndDate: subscriptionResult.trialEndDate,
        nextBillingDate: subscriptionResult.nextBillingDate,
      });

      return {
        success: true,
        customer: customerResult.customer,
        subscription: subscriptionResult.subscription,
        activationInvoice: customerResult.activationInvoice,
        trialEndDate: subscriptionResult.trialEndDate,
        nextBillingDate: subscriptionResult.nextBillingDate,
        billing_flow: {
          step_1: `✅ R$${(data.activationFee || 1.00).toFixed(2)} cobrado IMEDIATAMENTE (taxa de ativação)`,
          step_2: `⏱️ ${data.trialDays || 3} dias de trial GRATUITO`,
          step_3: `🔄 R$${(data.monthlyPrice || 29.90).toFixed(2)} cobrado AUTOMATICAMENTE após o trial`,
          step_4: `📅 Recorrência mensal até cancelamento`,
        },
        technical_details: {
          customer_id: customerResult.customer.id,
          subscription_id: subscriptionResult.subscription.id,
          payment_method_saved: true,
          auto_renewal: true,
          trial_end_date: subscriptionResult.trialEndDate,
          next_billing_date: subscriptionResult.nextBillingDate,
        },
      };

    } catch (error) {
      console.error('❌ Erro no fluxo completo:', error);
      throw error;
    }
  }

  // Buscar status da assinatura
  async getSubscriptionStatus(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['customer', 'latest_invoice.payment_intent'],
      });
      
      return {
        subscription,
        status: subscription.status,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        customer: subscription.customer,
      };
    } catch (error) {
      console.error('❌ Erro ao buscar status da assinatura:', error);
      throw error;
    }
  }

  // Cancelar assinatura
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd,
      });
      
      console.log('✅ Assinatura cancelada:', subscriptionId);
      return subscription;
    } catch (error) {
      console.error('❌ Erro ao cancelar assinatura:', error);
      throw error;
    }
  }
}

export const stripeTrialService = new StripeTrialSubscriptionService();