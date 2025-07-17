import Stripe from 'stripe';
import { nanoid } from 'nanoid';
import { db } from './db-sqlite';

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

  constructor(stripeSecretKey: string) {
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
  }

  async createCustomPlan(data: CreateCustomPlanData): Promise<CustomPlan> {
    const planId = nanoid();
    
    try {
      // Criar produto no Stripe
      const product = await this.stripe.products.create({
        name: data.name,
        description: data.description,
      });

      // Criar preço recorrente no Stripe
      const price = await this.stripe.prices.create({
        unit_amount: Math.round(data.recurringAmount * 100), // Converter para centavos
        currency: data.currency.toLowerCase(),
        recurring: {
          interval: data.recurringInterval as 'month' | 'year',
        },
        product: product.id,
      });

      // Criar link de pagamento
      const paymentLink = await this.stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days: data.trialDays,
        },
        invoice_creation: {
          enabled: true,
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
        stripePriceId: price.id,
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

      const session = await this.stripe.checkout.sessions.create({
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
        customer_email: customerEmail,
        subscription_data: {
          trial_period_days: plan.trialDays,
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

    await db.run(query, [
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
    ]);
  }

  private async getPlansByUserId(userId: string): Promise<CustomPlan[]> {
    const query = `
      SELECT * FROM custom_plans 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;

    const rows = await db.all(query, [userId]);
    return rows.map(this.mapRowToPlan);
  }

  private async getPlanById(planId: string): Promise<CustomPlan | null> {
    const query = `SELECT * FROM custom_plans WHERE id = ?`;
    const row = await db.get(query, [planId]);
    return row ? this.mapRowToPlan(row) : null;
  }

  private async updatePlanStatus(planId: string, active: boolean): Promise<void> {
    const query = `
      UPDATE custom_plans 
      SET active = ?, updated_at = ? 
      WHERE id = ?
    `;

    await db.run(query, [active ? 1 : 0, new Date().toISOString(), planId]);
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