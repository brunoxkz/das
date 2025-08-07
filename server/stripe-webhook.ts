import { Request, Response } from 'express';
import Stripe from 'stripe';
import { storage } from './storage-sqlite';
import { nanoid } from 'nanoid';

if (!process.env.STRIPE_SECRET_KEY) {
  console.log('⚠️ STRIPE_SECRET_KEY não encontrada - webhook desabilitado');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
}) : null;

// Endpoint para webhook do Stripe
export async function handleStripeWebhook(req: Request, res: Response) {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe não configurado' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.log('❌ Webhook signature ou secret não encontrado');
    return res.status(400).json({ error: 'Webhook não configurado' });
  }

  let event: Stripe.Event;

  try {
    // Verificar assinatura do webhook
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log('✅ Webhook Stripe verificado:', event.type);
  } catch (err) {
    console.log('❌ Erro na verificação do webhook:', err.message);
    return res.status(400).json({ error: 'Webhook signature inválida' });
  }

  try {
    // Processar diferentes tipos de eventos
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log('📝 Evento webhook não processado:', event.type);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Processar pagamento inicial bem-sucedido (taxa de ativação)
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('💰 Payment Intent succeeded:', paymentIntent.id);
  
  try {
    // Verificar se é um pagamento único
    if (paymentIntent.metadata?.type === 'onetime_payment') {
      console.log('🔄 PROCESSANDO PAGAMENTO ÚNICO - Criando subscription automática com trial');
      
      const customerId = paymentIntent.metadata.customer_id;
      const recurringPriceId = paymentIntent.metadata.recurring_price_id;
      const trialDays = parseInt(paymentIntent.metadata.trial_days || '3');
      
      if (!customerId || !recurringPriceId) {
        console.error('❌ Metadata incompleta para criar subscription');
        return;
      }
      
      // Buscar o payment method usado no pagamento
      const paymentMethod = paymentIntent.payment_method;
      
      if (!paymentMethod) {
        console.error('❌ Payment method não encontrado');
        return;
      }
      
      // Anexar payment method ao customer (já foi salvo via setup_future_usage)
      await stripe.paymentMethods.attach(paymentMethod as string, {
        customer: customerId,
      });
      
      // Definir como payment method padrão
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethod as string,
        },
      });
      
      // Criar subscription com trial
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: recurringPriceId,
        }],
        trial_period_days: trialDays,
        default_payment_method: paymentMethod as string,
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          type: 'auto_created_after_trial_payment',
          original_payment_intent: paymentIntent.id,
          trial_days: trialDays.toString(),
        },
      });
      
      console.log('✅ SUBSCRIPTION CRIADA AUTOMATICAMENTE:', subscription.id);
      console.log('📅 Trial end:', new Date(subscription.trial_end * 1000).toISOString());
      console.log('💳 Payment method anexado:', paymentMethod);
      
      // Salvar informações no banco de dados local
      try {
        await storage.createSubscription({
          userId: paymentIntent.metadata.user_id || 'unknown',
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerId,
          stripePriceId: recurringPriceId,
          status: 'trialing',
          trialEndsAt: new Date(subscription.trial_end * 1000),
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          paymentIntentId: paymentIntent.id,
        });
        console.log('✅ Subscription salva no banco local');
      } catch (dbError) {
        console.log('⚠️ Erro ao salvar no banco local (subscription criada no Stripe):', dbError.message);
      }
      
      return;
    }
    
    // Lógica original para outras assinaturas
    const subscription = await storage.getSubscriptionByPaymentIntent(paymentIntent.id);
    
    if (subscription) {
      await storage.updateSubscriptionStatus(subscription.id, 'active');
      console.log('✅ Assinatura ativada:', subscription.stripeSubscriptionId);
    }
  } catch (error) {
    console.error('❌ Erro ao processar payment_intent.succeeded:', error);
  }
}

// Processar pagamento de fatura bem-sucedido
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('📄 Invoice payment succeeded:', invoice.id);
  
  try {
    const subscriptionId = invoice.subscription as string;
    
    if (subscriptionId) {
      // Buscar assinatura no banco
      const subscription = await storage.getSubscriptionByStripeId(subscriptionId);
      
      if (subscription) {
        // Atualizar próxima data de cobrança
        const nextBillingDate = new Date(invoice.period_end * 1000);
        await storage.updateSubscriptionBilling(subscription.id, nextBillingDate);
        console.log('✅ Próxima cobrança atualizada:', nextBillingDate.toISOString());
      }
    }
  } catch (error) {
    console.error('❌ Erro ao processar invoice.payment_succeeded:', error);
  }
}

// Processar criação de assinatura
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('🆕 Subscription created:', subscription.id);
  
  try {
    // Buscar customer
    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
    
    // Criar registro no banco de dados
    const subscriptionData = {
      id: nanoid(),
      userId: customer.metadata?.userId || 'unknown',
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customer.id,
      status: subscription.status,
      planName: 'Vendzz Premium',
      planDescription: 'Plano completo com todos os recursos',
      activationFee: 1.00,
      monthlyPrice: 29.90,
      trialDays: 3,
      trialStartDate: new Date(subscription.trial_start * 1000).toISOString(),
      trialEndDate: new Date(subscription.trial_end * 1000).toISOString(),
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      nextBillingDate: new Date(subscription.current_period_end * 1000).toISOString(),
      customerName: customer.name || 'Cliente',
      customerEmail: customer.email || '',
      metadata: JSON.stringify({
        stripeSubscriptionId: subscription.id,
        createdBy: 'webhook'
      }),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await storage.createSubscription(subscriptionData);
    console.log('✅ Assinatura criada no banco:', subscription.id);
  } catch (error) {
    console.error('❌ Erro ao processar subscription.created:', error);
  }
}

// Processar atualização de assinatura
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id);
  
  try {
    const dbSubscription = await storage.getSubscriptionByStripeId(subscription.id);
    
    if (dbSubscription) {
      // Atualizar dados da assinatura
      await storage.updateSubscription(dbSubscription.id, {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        nextBillingDate: new Date(subscription.current_period_end * 1000).toISOString(),
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end ? 1 : 0,
        updatedAt: Date.now()
      });
      
      console.log('✅ Assinatura atualizada:', subscription.id);
    }
  } catch (error) {
    console.error('❌ Erro ao processar subscription.updated:', error);
  }
}

// Processar cancelamento de assinatura
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Subscription deleted:', subscription.id);
  
  try {
    const dbSubscription = await storage.getSubscriptionByStripeId(subscription.id);
    
    if (dbSubscription) {
      // Marcar como cancelada
      await storage.updateSubscription(dbSubscription.id, {
        status: 'canceled',
        canceledAt: new Date().toISOString(),
        updatedAt: Date.now()
      });
      
      console.log('✅ Assinatura cancelada:', subscription.id);
    }
  } catch (error) {
    console.error('❌ Erro ao processar subscription.deleted:', error);
  }
}

// Processar falha de pagamento
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('💳 Invoice payment failed:', invoice.id);
  
  try {
    const subscriptionId = invoice.subscription as string;
    
    if (subscriptionId) {
      const subscription = await storage.getSubscriptionByStripeId(subscriptionId);
      
      if (subscription) {
        // Marcar como pagamento falhou
        await storage.updateSubscription(subscription.id, {
          status: 'past_due',
          updatedAt: Date.now()
        });
        
        console.log('⚠️ Assinatura marcada como past_due:', subscriptionId);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao processar invoice.payment_failed:', error);
  }
}

export default handleStripeWebhook;