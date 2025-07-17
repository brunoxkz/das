import Stripe from 'stripe';
import { nanoid } from 'nanoid';
import Database from 'better-sqlite3';

export interface CustomPlan {
  id: string;
  name: string;
  description: string;
  trialAmount: number;
  trialDays: number;
  recurringAmount: number;
  recurringInterval: string;
  currency: string;
  userId: string;
  active: boolean;
  paymentLink?: string;
  stripeProductId?: string;
  stripePriceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomPlanData {
  name: string;
  description: string;
  trialAmount: number;
  trialDays: number;
  recurringAmount: number;
  recurringInterval: string;
  currency: string;
  userId: string;
}

export class CustomPlansSystem {
  private stripe: Stripe;
  private sqlite: Database.Database;

  constructor(stripeSecretKey: string) {
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
    this.sqlite = new Database('./vendzz-database.db');
  }

  async createCustomPlan(data: CreateCustomPlanData): Promise<CustomPlan> {
    const planId = nanoid();
    
    try {
      // Criar produto no Stripe
      const product = await this.stripe.products.create({
        name: data.name,
        description: data.description,
      });

      // Criar preço recorrente no Stripe (R$29,90/mês)
      const recurringPrice = await this.stripe.prices.create({
        unit_amount: Math.round(data.recurringAmount * 100), // Converter para centavos
        currency: data.currency.toLowerCase(),
        recurring: {
          interval: data.recurringInterval as 'month' | 'year',
        },
        product: product.id,
      });

      // Criar preço único para trial (R$1) - seguindo documentação oficial
      const trialPrice = await this.stripe.prices.create({
        unit_amount: Math.round(data.trialAmount * 100), // R$1 = 100 centavos
        currency: data.currency.toLowerCase(),
        product: product.id,
        // Preço one-time para cobrança imediata
      });

      // Criar link de pagamento usando checkout session customizado
      const paymentLink = await this.stripe.paymentLinks.create({
        line_items: [
          {
            price: recurringPrice.id,
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days: data.trialDays,
        },
      });

      // Salvar no banco de dados local
      const customPlan: CustomPlan = {
        id: planId,
        name: data.name,
        description: data.description,
        trialAmount: data.trialAmount,
        trialDays: data.trialDays,
        recurringAmount: data.recurringAmount,
        recurringInterval: data.recurringInterval,
        currency: data.currency,
        userId: data.userId,
        active: true,
        paymentLink: paymentLink.url,
        stripeProductId: product.id,
        stripePriceId: recurringPrice.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Inserir no banco
      await this.savePlanToDatabase(customPlan);

      console.log('✅ PLANO CUSTOMIZADO CRIADO COM SUCESSO:', customPlan);
      
      return customPlan;
    } catch (error) {
      console.error('❌ ERRO AO CRIAR PLANO CUSTOMIZADO:', error);
      throw new Error(`Falha ao criar plano customizado: ${error.message}`);
    }
  }

  async listUserPlans(userId: string): Promise<CustomPlan[]> {
    try {
      const plans = await this.getPlansByUserId(userId);
      return plans.filter(plan => plan.active);
    } catch (error) {
      console.error('❌ ERRO AO LISTAR PLANOS:', error);
      return [];
    }
  }

  async deactivatePlan(planId: string, userId: string): Promise<boolean> {
    try {
      // Buscar plano no banco
      const plan = await this.getPlanById(planId);
      
      if (!plan || plan.userId !== userId) {
        throw new Error('Plano não encontrado ou não pertence ao usuário');
      }

      // Desativar produto no Stripe
      if (plan.stripeProductId) {
        await this.stripe.products.update(plan.stripeProductId, {
          active: false,
        });
      }

      // Marcar como inativo no banco
      await this.updatePlanStatus(planId, false);

      console.log('✅ PLANO DESATIVADO COM SUCESSO:', planId);
      return true;
    } catch (error) {
      console.error('❌ ERRO AO DESATIVAR PLANO:', error);
      throw new Error(`Falha ao desativar plano: ${error.message}`);
    }
  }

  async createCheckoutSession(planId: string, customerEmail: string): Promise<{sessionId: string, url: string}> {
    try {
      const plan = await this.getPlanById(planId);
      
      if (!plan || !plan.active) {
        throw new Error('Plano não encontrado ou inativo');
      }

      // Criar customer no Stripe
      const customer = await this.stripe.customers.create({
        email: customerEmail,
        metadata: {
          plan_id: planId,
          trial_amount: plan.trialAmount.toString(),
        },
      });

      // Criar checkout session seguindo documentação oficial
      const session = await this.stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cancel`,
        subscription_data: {
          trial_period_days: plan.trialDays,
          metadata: {
            plan_id: planId,
            trial_amount: plan.trialAmount.toString(),
          },
        },
      });

      return {
        sessionId: session.id,
        url: session.url!,
      };
    } catch (error) {
      console.error('❌ ERRO AO CRIAR CHECKOUT SESSION:', error);
      throw new Error(`Falha ao criar checkout session: ${error.message}`);
    }
  }

  // Método para criar subscription usando API direta com add_invoice_items
  async createSubscriptionWithImmediateCharge(customerEmail: string, planId: string): Promise<{
    subscriptionId: string,
    paymentIntentId: string,
    clientSecret: string
  }> {
    try {
      const plan = await this.getPlanById(planId);
      
      if (!plan || !plan.active) {
        throw new Error('Plano não encontrado ou inativo');
      }

      // Criar customer no Stripe
      const customer = await this.stripe.customers.create({
        email: customerEmail,
        metadata: {
          plan_id: planId,
          trial_amount: plan.trialAmount.toString(),
        },
      });

      // Criar preço one-time para cobrança imediata (R$1)
      const oneTimePrice = await this.stripe.prices.create({
        unit_amount: Math.round(plan.trialAmount * 100), // R$1 = 100 centavos
        currency: plan.currency.toLowerCase(),
        product: plan.stripeProductId,
        metadata: {
          type: 'trial_activation_fee',
          plan_id: planId,
        },
      });

      // Criar subscription com trial + cobrança imediata usando add_invoice_items
      const subscription = await this.stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: plan.stripePriceId,
        }],
        trial_period_days: plan.trialDays,
        // Adicionar item de cobrança imediata (R$1) ao primeiro invoice
        add_invoice_items: [{
          price: oneTimePrice.id,
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          plan_id: planId,
          trial_amount: plan.trialAmount.toString(),
          billing_model: 'immediate_charge_then_trial',
        },
      });

      const invoice = subscription.latest_invoice as any;
      const paymentIntent = invoice.payment_intent;

      console.log('✅ SUBSCRIPTION CRIADA COM COBRANÇA IMEDIATA:', {
        subscriptionId: subscription.id,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        trialEnd: new Date(subscription.trial_end! * 1000),
      });

      return {
        subscriptionId: subscription.id,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      console.error('❌ ERRO AO CRIAR SUBSCRIPTION COM COBRANÇA IMEDIATA:', error);
      throw new Error(`Falha ao criar subscription: ${error.message}`);
    }
  }

  // Métodos auxiliares para o banco de dados
  private async savePlanToDatabase(plan: CustomPlan): Promise<void> {
    const query = `
      INSERT INTO custom_plans (
        id, name, description, trial_amount, trial_days, 
        recurring_amount, recurring_interval, currency, user_id, 
        active, payment_link, stripe_product_id, stripe_price_id,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      plan.id,
      plan.name,
      plan.description,
      plan.trialAmount,
      plan.trialDays,
      plan.recurringAmount,
      plan.recurringInterval,
      plan.currency,
      plan.userId,
      plan.active ? 1 : 0,
      plan.paymentLink,
      plan.stripeProductId,
      plan.stripePriceId,
      plan.createdAt.toISOString(),
      plan.updatedAt.toISOString(),
    ];

    console.log('🔍 DEBUG QUERY:', query);
    console.log('🔍 DEBUG PARAMS:', params);
    console.log('🔍 DEBUG PARAMS LENGTH:', params.length);

    // Usar SQLite diretamente ao invés do Drizzle ORM
    const stmt = this.sqlite.prepare(query);
    const result = stmt.run(...params);
    
    console.log('✅ Plano salvo no banco:', result);
  }

  private async getPlansByUserId(userId: string): Promise<CustomPlan[]> {
    const query = `
      SELECT * FROM custom_plans 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;

    const stmt = this.sqlite.prepare(query);
    const rows = stmt.all(userId);
    return rows.map(this.mapRowToPlan);
  }

  private async getPlanById(planId: string): Promise<CustomPlan | null> {
    console.log('🔍 DEBUG getPlanById - planId:', planId);
    const query = `SELECT * FROM custom_plans WHERE id = ?`;
    console.log('🔍 DEBUG getPlanById - query:', query);
    
    try {
      // Criar instância SQLite isolada para evitar conflitos
      const db = new Database('./vendzz-database.db');
      const stmt = db.prepare(query);
      const row = stmt.get(planId);
      db.close();
      console.log('🔍 DEBUG getPlanById - row:', row);
      return row ? this.mapRowToPlan(row) : null;
    } catch (error) {
      console.error('❌ ERROR getPlanById:', error);
      throw error;
    }
  }

  private async updatePlanStatus(planId: string, active: boolean): Promise<void> {
    const query = `
      UPDATE custom_plans 
      SET active = ?, updated_at = ? 
      WHERE id = ?
    `;

    const stmt = this.sqlite.prepare(query);
    stmt.run(active ? 1 : 0, new Date().toISOString(), planId);
  }

  private mapRowToPlan(row: any): CustomPlan {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      trialAmount: row.trial_amount,
      trialDays: row.trial_days,
      recurringAmount: row.recurring_amount,
      recurringInterval: row.recurring_interval,
      currency: row.currency,
      userId: row.user_id,
      active: Boolean(row.active),
      paymentLink: row.payment_link,
      stripeProductId: row.stripe_product_id,
      stripePriceId: row.stripe_price_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}