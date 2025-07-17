import Stripe from 'stripe';

export interface CustomPlanConfig {
  name: string;
  description: string;
  trialAmount: number; // Valor cobrado no trial (ex: R$ 1.00)
  trialDays: number; // Dias de trial (ex: 3)
  recurringAmount: number; // Valor recorrente (ex: R$ 29.90)
  recurringInterval: 'month' | 'year' | 'week'; // Frequência da cobrança
  currency: string; // BRL, USD, etc.
  userId: string;
}

export interface CustomPlan {
  id: string;
  name: string;
  description: string;
  trialAmount: number;
  trialDays: number;
  recurringAmount: number;
  recurringInterval: 'month' | 'year' | 'week';
  currency: string;
  userId: string;
  stripeProductId: string;
  stripePriceId: string;
  paymentLink: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export class CustomPlansSystem {
  private stripe: Stripe;

  constructor(stripeSecretKey: string) {
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-09-30.acacia'
    });
  }

  /**
   * Cria um plano customizado no Stripe
   */
  async createCustomPlan(config: CustomPlanConfig): Promise<CustomPlan> {
    try {
      console.log('🎯 CRIANDO PLANO CUSTOMIZADO:', config);

      // 1. Criar produto no Stripe
      const product = await this.stripe.products.create({
        name: config.name,
        description: config.description,
        metadata: {
          userId: config.userId,
          trialAmount: config.trialAmount.toString(),
          trialDays: config.trialDays.toString(),
          recurringAmount: config.recurringAmount.toString(),
          recurringInterval: config.recurringInterval,
          type: 'custom_plan'
        }
      });

      // 2. Criar preço recorrente
      const price = await this.stripe.prices.create({
        product: product.id,
        currency: config.currency.toLowerCase(),
        recurring: {
          interval: config.recurringInterval
        },
        unit_amount: Math.round(config.recurringAmount * 100), // Converter para centavos
        metadata: {
          trialAmount: config.trialAmount.toString(),
          trialDays: config.trialDays.toString(),
          userId: config.userId
        }
      });

      // 3. Criar payment link
      const paymentLink = await this.stripe.paymentLinks.create({
        line_items: [{
          price: price.id,
          quantity: 1
        }],
        metadata: {
          userId: config.userId,
          planType: 'custom_plan',
          trialAmount: config.trialAmount.toString(),
          trialDays: config.trialDays.toString()
        }
      });

      const customPlan: CustomPlan = {
        id: product.id,
        name: config.name,
        description: config.description,
        trialAmount: config.trialAmount,
        trialDays: config.trialDays,
        recurringAmount: config.recurringAmount,
        recurringInterval: config.recurringInterval,
        currency: config.currency,
        userId: config.userId,
        stripeProductId: product.id,
        stripePriceId: price.id,
        paymentLink: paymentLink.url,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };

      console.log('✅ PLANO CUSTOMIZADO CRIADO:', {
        productId: product.id,
        priceId: price.id,
        paymentLink: paymentLink.url
      });

      return customPlan;

    } catch (error) {
      console.error('❌ Erro ao criar plano customizado:', error);
      throw new Error(`Falha ao criar plano customizado: ${error.message}`);
    }
  }

  /**
   * Cria checkout session para plano customizado
   */
  async createCheckoutSession(planId: string, customerEmail?: string): Promise<{ sessionId: string; url: string }> {
    try {
      console.log('🛒 CRIANDO CHECKOUT SESSION PARA PLANO:', planId);

      // Buscar produto no Stripe
      const product = await this.stripe.products.retrieve(planId);
      if (!product) {
        throw new Error('Plano não encontrado');
      }

      // Buscar preço do produto
      const prices = await this.stripe.prices.list({
        product: planId,
        active: true,
        limit: 1
      });

      if (prices.data.length === 0) {
        throw new Error('Preço não encontrado para o plano');
      }

      const price = prices.data[0];
      const trialAmount = parseFloat(product.metadata.trialAmount || '0');
      const trialDays = parseInt(product.metadata.trialDays || '0');

      // Criar checkout session
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{
          price: price.id,
          quantity: 1
        }],
        success_url: `${process.env.BASE_URL || 'https://example.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL || 'https://example.com'}/cancel`,
        customer_email: customerEmail,
        subscription_data: {
          trial_period_days: trialDays,
          metadata: {
            planId: planId,
            trialAmount: trialAmount.toString(),
            userId: product.metadata.userId
          }
        },
        metadata: {
          planId: planId,
          trialAmount: trialAmount.toString(),
          userId: product.metadata.userId,
          type: 'custom_plan_checkout'
        }
      });

      console.log('✅ CHECKOUT SESSION CRIADA:', {
        sessionId: session.id,
        url: session.url
      });

      return {
        sessionId: session.id,
        url: session.url
      };

    } catch (error) {
      console.error('❌ Erro ao criar checkout session:', error);
      throw new Error(`Falha ao criar checkout session: ${error.message}`);
    }
  }

  /**
   * Lista todos os planos de um usuário
   */
  async listUserPlans(userId: string): Promise<CustomPlan[]> {
    try {
      console.log('📋 LISTANDO PLANOS DO USUÁRIO:', userId);

      const products = await this.stripe.products.list({
        active: true,
        limit: 100
      });

      const userPlans: CustomPlan[] = [];

      for (const product of products.data) {
        if (product.metadata.userId === userId && product.metadata.type === 'custom_plan') {
          // Buscar preço
          const prices = await this.stripe.prices.list({
            product: product.id,
            active: true,
            limit: 1
          });

          if (prices.data.length > 0) {
            const price = prices.data[0];
            
            // Buscar payment link
            const paymentLinks = await this.stripe.paymentLinks.list({
              active: true,
              limit: 10
            });

            let paymentLink = '';
            for (const link of paymentLinks.data) {
              if (link.line_items.data.some(item => item.price.id === price.id)) {
                paymentLink = link.url;
                break;
              }
            }

            const plan: CustomPlan = {
              id: product.id,
              name: product.name,
              description: product.description || '',
              trialAmount: parseFloat(product.metadata.trialAmount || '0'),
              trialDays: parseInt(product.metadata.trialDays || '0'),
              recurringAmount: price.unit_amount ? price.unit_amount / 100 : 0,
              recurringInterval: price.recurring?.interval as 'month' | 'year' | 'week',
              currency: price.currency.toUpperCase(),
              userId: product.metadata.userId,
              stripeProductId: product.id,
              stripePriceId: price.id,
              paymentLink: paymentLink,
              createdAt: new Date(product.created * 1000),
              updatedAt: new Date(product.updated * 1000),
              isActive: product.active
            };

            userPlans.push(plan);
          }
        }
      }

      console.log('✅ PLANOS ENCONTRADOS:', userPlans.length);
      return userPlans;

    } catch (error) {
      console.error('❌ Erro ao listar planos:', error);
      throw new Error(`Falha ao listar planos: ${error.message}`);
    }
  }

  /**
   * Desativa um plano customizado
   */
  async deactivatePlan(planId: string, userId: string): Promise<boolean> {
    try {
      console.log('🔴 DESATIVANDO PLANO:', planId);

      // Verificar se o plano pertence ao usuário
      const product = await this.stripe.products.retrieve(planId);
      if (product.metadata.userId !== userId) {
        throw new Error('Plano não pertence ao usuário');
      }

      // Desativar produto
      await this.stripe.products.update(planId, {
        active: false
      });

      // Desativar preços
      const prices = await this.stripe.prices.list({
        product: planId,
        active: true
      });

      for (const price of prices.data) {
        await this.stripe.prices.update(price.id, {
          active: false
        });
      }

      console.log('✅ PLANO DESATIVADO COM SUCESSO');
      return true;

    } catch (error) {
      console.error('❌ Erro ao desativar plano:', error);
      throw new Error(`Falha ao desativar plano: ${error.message}`);
    }
  }
}