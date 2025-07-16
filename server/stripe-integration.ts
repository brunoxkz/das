/**
 * INTEGRAÇÃO STRIPE - SISTEMA DE PAGAMENTOS
 * Implementação completa do Stripe com webhooks e assinaturas
 */

import Stripe from 'stripe';
import { storage } from './storage-sqlite';
import { creditProtection } from './credit-protection';
import { nanoid } from 'nanoid';

// Configuração do Stripe - Verificar se a chave está disponível
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

if (STRIPE_SECRET_KEY) {
  stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
  console.log('✅ Stripe inicializado com sucesso');
} else {
  console.log('⚠️  STRIPE_SECRET_KEY não encontrada - funcionalidade Stripe desabilitada');
}

export interface StripeSubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  stripePriceId: string;
  features: string[];
  credits: {
    sms: number;
    email: number;
    whatsapp: number;
    ai: number;
    video: number;
  };
}

export interface StripePaymentResult {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  subscriptionId?: string;
  error?: string;
}

export class StripeIntegration {
  private static instance: StripeIntegration;
  
  static getInstance(): StripeIntegration {
    if (!StripeIntegration.instance) {
      StripeIntegration.instance = new StripeIntegration();
    }
    return StripeIntegration.instance;
  }

  /**
   * CRIAR CLIENTE STRIPE
   */
  async createStripeCustomer(userId: string, email: string, name?: string): Promise<string> {
    try {
      if (!stripe) {
        throw new Error('Stripe não está configurado - STRIPE_SECRET_KEY não encontrada');
      }

      const customer = await stripe.customers.create({
        email,
        name: name || email,
        metadata: { userId }
      });

      // Salvar customer ID no banco
      await storage.updateUser(userId, { stripeCustomerId: customer.id });

      console.log(`✅ Cliente Stripe criado: ${customer.id} para usuário ${userId}`);
      return customer.id;

    } catch (error) {
      console.error('❌ Erro ao criar cliente Stripe:', error);
      throw error;
    }
  }

  /**
   * CRIAR ASSINATURA
   */
  async createSubscription(
    userId: string, 
    planId: string, 
    paymentMethodId: string
  ): Promise<StripePaymentResult> {
    try {
      if (!stripe) {
        return { success: false, error: 'Stripe não está configurado - STRIPE_SECRET_KEY não encontrada' };
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      // Buscar plano
      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return { success: false, error: 'Plano não encontrado' };
      }

      let customerId = user.stripeCustomerId;
      
      // Criar cliente se não existir
      if (!customerId) {
        customerId = await this.createStripeCustomer(userId, user.email, user.firstName);
      }

      // Anexar método de pagamento
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Definir como método padrão
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Criar assinatura
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: plan.stripePriceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Salvar subscription ID
      await storage.updateUser(userId, { 
        stripeSubscriptionId: subscription.id,
        plan: planId,
        subscriptionStatus: 'active',
        planExpiresAt: new Date(subscription.current_period_end * 1000)
      });

      // Adicionar créditos do plano
      const planData = JSON.parse(plan.limits);
      await creditProtection.addCreditsSecurely(
        userId,
        'sms',
        planData.sms,
        'Créditos inclusos no plano',
        'stripe_subscription',
        subscription.id
      );

      await creditProtection.addCreditsSecurely(
        userId,
        'email',
        planData.email,
        'Créditos inclusos no plano',
        'stripe_subscription',
        subscription.id
      );

      await creditProtection.addCreditsSecurely(
        userId,
        'whatsapp',
        planData.whatsapp,
        'Créditos inclusos no plano',
        'stripe_subscription',
        subscription.id
      );

      await creditProtection.addCreditsSecurely(
        userId,
        'ai',
        planData.ai,
        'Créditos inclusos no plano',
        'stripe_subscription',
        subscription.id
      );

      // Registrar transação
      await storage.createSubscriptionTransaction({
        id: nanoid(),
        userId,
        planId,
        stripeSubscriptionId: subscription.id,
        amount: plan.price,
        currency: 'BRL',
        status: 'pending',
        paymentMethod: 'stripe'
      });

      const paymentIntent = subscription.latest_invoice?.payment_intent as any;

      return {
        success: true,
        subscriptionId: subscription.id,
        paymentIntentId: paymentIntent?.id,
        clientSecret: paymentIntent?.client_secret
      };

    } catch (error) {
      console.error('❌ Erro ao criar assinatura:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * CANCELAR ASSINATURA
   */
  async cancelSubscription(userId: string): Promise<boolean> {
    try {
      if (!stripe) {
        console.error('❌ Stripe não configurado');
        return false;
      }

      const user = await storage.getUser(userId);
      if (!user?.stripeSubscriptionId) {
        return false;
      }

      await stripe.subscriptions.cancel(user.stripeSubscriptionId);

      // Atualizar status no banco
      await storage.updateUser(userId, { 
        subscriptionStatus: 'cancelled',
        plan: 'free'
      });

      console.log(`✅ Assinatura cancelada para usuário ${userId}`);
      return true;

    } catch (error) {
      console.error('❌ Erro ao cancelar assinatura:', error);
      return false;
    }
  }

  /**
   * COMPRAR CRÉDITOS AVULSOS
   */
  async purchaseCredits(
    userId: string,
    type: 'sms' | 'email' | 'whatsapp' | 'ai' | 'video',
    packageId: string,
    paymentMethodId: string
  ): Promise<StripePaymentResult> {
    try {
      if (!stripe) {
        return { success: false, error: 'Stripe não está configurado - STRIPE_SECRET_KEY não encontrada' };
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      // Pacotes de créditos
      const packages = {
        sms: [
          { id: 'sms_100', credits: 100, price: 990 }, // R$ 9,90
          { id: 'sms_500', credits: 500, price: 3990 }, // R$ 39,90
          { id: 'sms_1000', credits: 1000, price: 6990 }, // R$ 69,90
        ],
        email: [
          { id: 'email_1000', credits: 1000, price: 490 }, // R$ 4,90
          { id: 'email_5000', credits: 5000, price: 1990 }, // R$ 19,90
          { id: 'email_10000', credits: 10000, price: 3490 }, // R$ 34,90
        ],
        whatsapp: [
          { id: 'whatsapp_100', credits: 100, price: 1990 }, // R$ 19,90
          { id: 'whatsapp_500', credits: 500, price: 8990 }, // R$ 89,90
          { id: 'whatsapp_1000', credits: 1000, price: 15990 }, // R$ 159,90
        ],
        ai: [
          { id: 'ai_50', credits: 50, price: 2990 }, // R$ 29,90
          { id: 'ai_200', credits: 200, price: 9990 }, // R$ 99,90
          { id: 'ai_500', credits: 500, price: 19990 }, // R$ 199,90
        ],
        video: [
          { id: 'video_10', credits: 10, price: 4990 }, // R$ 49,90
          { id: 'video_50', credits: 50, price: 19990 }, // R$ 199,90
          { id: 'video_100', credits: 100, price: 34990 }, // R$ 349,90
        ]
      };

      const selectedPackage = packages[type]?.find(pkg => pkg.id === packageId);
      if (!selectedPackage) {
        return { success: false, error: 'Pacote não encontrado' };
      }

      let customerId = user.stripeCustomerId;
      
      // Criar cliente se não existir
      if (!customerId) {
        customerId = await this.createStripeCustomer(userId, user.email, user.firstName);
      }

      // Criar payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: selectedPackage.price,
        currency: 'brl',
        customer: customerId,
        payment_method: paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        metadata: {
          userId,
          type,
          packageId,
          credits: selectedPackage.credits.toString()
        }
      });

      if (paymentIntent.status === 'succeeded') {
        // Adicionar créditos
        await creditProtection.addCreditsSecurely(
          userId,
          type,
          selectedPackage.credits,
          'Compra de créditos',
          undefined,
          paymentIntent.id
        );

        console.log(`✅ Créditos adicionados: ${selectedPackage.credits} ${type} para usuário ${userId}`);
      }

      return {
        success: paymentIntent.status === 'succeeded',
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret
      };

    } catch (error) {
      console.error('❌ Erro ao comprar créditos:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * WEBHOOK HANDLER
   */
  async handleWebhook(body: any, signature: string): Promise<void> {
    try {
      if (!stripe) {
        throw new Error('Stripe não está configurado - STRIPE_SECRET_KEY não encontrada');
      }

      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      console.log(`🔔 Webhook recebido: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.handleSubscriptionPayment(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancelled(event.data.object);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        default:
          console.log(`⚠️ Evento não tratado: ${event.type}`);
      }

    } catch (error) {
      console.error('❌ Erro no webhook:', error);
      throw error;
    }
  }

  /**
   * HANDLERS PRIVADOS
   */
  private async handlePaymentSucceeded(paymentIntent: any): Promise<void> {
    const userId = paymentIntent.metadata?.userId;
    if (!userId) return;

    const { type, credits } = paymentIntent.metadata;

    if (type && credits) {
      // Pagamento de créditos avulsos
      await creditProtection.addCreditsSecurely(
        userId,
        type,
        parseInt(credits),
        'Compra de créditos via Stripe',
        undefined,
        paymentIntent.id
      );
    }
  }

  private async handleSubscriptionPayment(invoice: any): Promise<void> {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;

    // Buscar usuário pelo customer ID
    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) return;

    // Atualizar status da assinatura
    await storage.updateUser(user.id, {
      subscriptionStatus: 'active',
      planExpiresAt: new Date(invoice.period_end * 1000)
    });

    // Reativar conta se estiver bloqueada
    if (user.isBlocked) {
      await storage.updateUser(user.id, {
        isBlocked: false,
        planRenewalRequired: false,
        blockReason: null
      });
    }

    console.log(`✅ Pagamento de assinatura processado para usuário ${user.id}`);
  }

  private async handleSubscriptionCancelled(subscription: any): Promise<void> {
    const customerId = subscription.customer;
    
    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) return;

    await storage.updateUser(user.id, {
      subscriptionStatus: 'cancelled',
      plan: 'free'
    });

    console.log(`✅ Assinatura cancelada para usuário ${user.id}`);
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    const customerId = subscription.customer;
    
    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) return;

    await storage.updateUser(user.id, {
      subscriptionStatus: subscription.status,
      planExpiresAt: new Date(subscription.current_period_end * 1000)
    });

    console.log(`✅ Assinatura atualizada para usuário ${user.id}`);
  }
}

// Instância singleton
export const stripeIntegration = StripeIntegration.getInstance();