import Stripe from 'stripe';
import { storage } from './storage-sqlite';

export class StripeWebhookHandler {
  private stripe: Stripe;

  constructor(stripeSecretKey: string) {
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-06-30.basil',
    });
  }

  /**
   * HANDLER PRINCIPAL DE WEBHOOKS DO STRIPE
   */
  async handleWebhook(body: any, signature: string, endpointSecret: string) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (error) {
      console.error('❌ WEBHOOK SIGNATURE INVÁLIDA:', error);
      throw new Error('Webhook signature verification failed');
    }

    console.log('🔔 WEBHOOK RECEBIDO:', event.type);

    switch (event.type) {
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      case 'setup_intent.succeeded':
        await this.handleSetupIntentSucceeded(event.data.object as Stripe.SetupIntent);
        break;
      
      // 🔥 CRÍTICO: Processar conversão Trial → Recurring automaticamente
      case 'customer.subscription.trial_will_end':
        await this.handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;
      
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`⚠️ WEBHOOK NÃO TRATADO: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * SUBSCRIPTION CREATED - Notificar usuário sobre criação
   */
  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    console.log('✅ ASSINATURA CRIADA:', subscription.id);
    
    try {
      // Buscar usuário pelo customer_id
      const customer = await this.stripe.customers.retrieve(subscription.customer as string);
      
      if ('email' in customer && customer.email) {
        console.log('📧 Enviando notificação de assinatura criada para:', customer.email);
        
        // TODO: Enviar email de boas-vindas
        // await emailService.sendSubscriptionCreatedEmail(customer.email, subscription);
      }
    } catch (error) {
      console.error('❌ ERRO AO PROCESSAR SUBSCRIPTION CREATED:', error);
    }
  }

  /**
   * SUBSCRIPTION UPDATED - Verificar se saiu do trial
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    console.log('🔄 ASSINATURA ATUALIZADA:', subscription.id, 'Status:', subscription.status);
    
    try {
      // Verificar se acabou o trial e começou a cobrança
      if (subscription.status === 'active' && !subscription.trial_end) {
        console.log('🎯 TRIAL FINALIZADO - COBRANÇA RECORRENTE INICIADA');
        
        const customer = await this.stripe.customers.retrieve(subscription.customer as string);
        
        if ('email' in customer && customer.email) {
          console.log('📧 Enviando notificação de cobrança recorrente para:', customer.email);
          
          // TODO: Enviar email sobre fim do trial
          // await emailService.sendTrialEndedEmail(customer.email, subscription);
        }
      }
    } catch (error) {
      console.error('❌ ERRO AO PROCESSAR SUBSCRIPTION UPDATED:', error);
    }
  }

  /**
   * SUBSCRIPTION DELETED - Cancelamento
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    console.log('❌ ASSINATURA CANCELADA:', subscription.id);
    
    try {
      const customer = await this.stripe.customers.retrieve(subscription.customer as string);
      
      if ('email' in customer && customer.email) {
        console.log('📧 Enviando notificação de cancelamento para:', customer.email);
        
        // TODO: Enviar email de cancelamento
        // await emailService.sendSubscriptionCancelledEmail(customer.email, subscription);
      }
    } catch (error) {
      console.error('❌ ERRO AO PROCESSAR SUBSCRIPTION DELETED:', error);
    }
  }

  /**
   * INVOICE PAYMENT SUCCEEDED - Pagamento recorrente bem-sucedido
   */
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    console.log('✅ PAGAMENTO RECORRENTE SUCESSO:', invoice.id);
    
    try {
      // Verificar se é um pagamento recorrente (não o primeiro)
      if (invoice.billing_reason === 'subscription_cycle') {
        console.log('🔄 PAGAMENTO RECORRENTE MENSAL PROCESSADO');
        
        const customer = await this.stripe.customers.retrieve(invoice.customer as string);
        
        if ('email' in customer && customer.email) {
          console.log('📧 Enviando recibo de pagamento para:', customer.email);
          
          // TODO: Enviar recibo
          // await emailService.sendPaymentReceiptEmail(customer.email, invoice);
        }
      }
    } catch (error) {
      console.error('❌ ERRO AO PROCESSAR INVOICE PAYMENT SUCCEEDED:', error);
    }
  }

  /**
   * INVOICE PAYMENT FAILED - Falha no pagamento
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    console.log('❌ FALHA NO PAGAMENTO:', invoice.id);
    
    try {
      const customer = await this.stripe.customers.retrieve(invoice.customer as string);
      
      if ('email' in customer && customer.email) {
        console.log('📧 Enviando notificação de falha no pagamento para:', customer.email);
        
        // TODO: Enviar alerta de falha
        // await emailService.sendPaymentFailedEmail(customer.email, invoice);
      }
    } catch (error) {
      console.error('❌ ERRO AO PROCESSAR INVOICE PAYMENT FAILED:', error);
    }
  }

  /**
   * SETUP INTENT SUCCEEDED - Cartão salvo com sucesso
   */
  private async handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
    console.log('✅ CARTÃO SALVO COM SUCESSO:', setupIntent.id);
    
    try {
      // Processar pagamento automaticamente se não foi processado ainda
      if (setupIntent.metadata?.auto_process === 'true') {
        console.log('🎯 PROCESSANDO PAGAMENTO AUTOMATICAMENTE');
        
        // Importar e usar o sistema de elementos
        const { StripeElementsSystem } = await import('./stripe-elements-system');
        const elementsSystem = new StripeElementsSystem(process.env.STRIPE_SECRET_KEY!);
        
        try {
          const paymentResult = await elementsSystem.processElementsPayment(setupIntent.id);
          console.log('✅ PAGAMENTO AUTOMÁTICO PROCESSADO:', paymentResult);
        } catch (error) {
          console.error('❌ ERRO NO PAGAMENTO AUTOMÁTICO:', error);
        }
      }
    } catch (error) {
      console.error('❌ ERRO AO PROCESSAR SETUP INTENT SUCCEEDED:', error);
    }
  }

  /**
   * 🔥 CRÍTICO: Processar quando trial vai terminar
   */
  private async handleTrialWillEnd(subscription: Stripe.Subscription) {
    console.log('⚠️ Trial terminando em breve para subscription:', subscription.id);
    
    try {
      // Verificar se tem payment method anexado
      const customerId = subscription.customer as string;
      const customer = await this.stripe.customers.retrieve(customerId);
      
      if (customer.deleted) {
        console.error('❌ Customer foi deletado:', customerId);
        return;
      }
      
      const defaultPaymentMethod = (customer as Stripe.Customer).invoice_settings?.default_payment_method;
      
      if (!defaultPaymentMethod) {
        console.error('❌ Nenhum payment method padrão encontrado para customer:', customerId);
        // Cancelar subscription se não tiver payment method
        await this.stripe.subscriptions.update(subscription.id, {
          cancel_at_period_end: true,
        });
        console.log('❌ Subscription cancelada por falta de payment method');
        return;
      }
      
      console.log('✅ Trial será convertido automaticamente para recurring');
      console.log('💳 Payment method disponível:', defaultPaymentMethod);
      
    } catch (error) {
      console.error('❌ Erro ao processar trial_will_end:', error);
    }
  }

  /**
   * 🔥 CRÍTICO: Processar payment intent bem-sucedido (R$1,00)
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log('💰 Payment Intent bem-sucedido:', paymentIntent.id);
    
    try {
      // Verificar se é payment intent de ativação
      const metadata = paymentIntent.metadata;
      
      if (metadata?.type === 'onetime_payment' || metadata?.step === 'onetime') {
        console.log('🔥 PAYMENT INTENT DE ATIVAÇÃO PROCESSADO');
        console.log('✅ R$1,00 cobrado com sucesso');
        console.log('🎯 Trial de 3 dias iniciado');
        
        console.log('✅ Pagamento de ativação processado com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao processar payment intent succeeded:', error);
    }
  }
}