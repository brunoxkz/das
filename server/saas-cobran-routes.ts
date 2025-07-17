import { Router } from 'express';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Stripe from 'stripe';

// Usar instância SQLite para o SAAS COBRAN
const db = new Database('./database.sqlite');

const router = Router();

// Inicializar Stripe apenas se a chave estiver disponível
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
} else {
  console.log('⚠️ STRIPE_SECRET_KEY não configurada - funcionalidade Stripe desabilitada no SAAS COBRAN');
}

// Middleware de autenticação para SAAS COBRAN
const authenticateSaasCobran = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }
};

// Schema das tabelas do SAAS COBRAN
const createSaasCobrancaTables = () => {
  try {
    // Tabela de planos customizados
    db.exec(`
      CREATE TABLE IF NOT EXISTS saas_cobran_plans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'BRL',
        interval TEXT DEFAULT 'month',
        trial_days INTEGER DEFAULT 3,
        activation_fee REAL DEFAULT 1.00,
        stripe_price_id TEXT,
        stripe_product_id TEXT,
        active BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de clientes
    db.exec(`
      CREATE TABLE IF NOT EXISTS saas_cobran_customers (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        phone TEXT,
        stripe_customer_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de assinaturas
    db.exec(`
      CREATE TABLE IF NOT EXISTS saas_cobran_subscriptions (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        plan_id TEXT NOT NULL,
        stripe_subscription_id TEXT,
        status TEXT DEFAULT 'active',
        current_period_start DATETIME,
        current_period_end DATETIME,
        trial_end DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES saas_cobran_customers(id),
        FOREIGN KEY (plan_id) REFERENCES saas_cobran_plans(id)
      )
    `);

    // Tabela de cobranças
    db.exec(`
      CREATE TABLE IF NOT EXISTS saas_cobran_charges (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        subscription_id TEXT,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'BRL',
        type TEXT NOT NULL, -- 'activation' | 'recurring'
        status TEXT DEFAULT 'pending',
        stripe_payment_intent_id TEXT,
        stripe_charge_id TEXT,
        paid_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES saas_cobran_customers(id),
        FOREIGN KEY (subscription_id) REFERENCES saas_cobran_subscriptions(id)
      )
    `);

    console.log('✅ Tabelas do SAAS COBRAN criadas com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar tabelas do SAAS COBRAN:', error);
    return false;
  }
};

// Inicializar tabelas
createSaasCobrancaTables();

// Rota de health check
router.get('/health', (req, res) => {
  try {
    // Verificar conexão com SQLite
    const dbCheck = db.prepare('SELECT 1').get();
    
    // Verificar configuração do Stripe
    const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;
    
    res.json({
      success: true,
      saasCobrancaStatus: 'online',
      database: dbCheck ? 'connected' : 'disconnected',
      stripe: stripeConfigured ? 'configured' : 'not_configured',
      timestamp: new Date().toISOString(),
      url: '/saas-cobran'
    });
  } catch (error) {
    res.json({
      success: false,
      saasCobrancaStatus: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Rota de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Por enquanto, usar credenciais hardcoded
    if (email === 'admin@saascobran.com' && password === 'cobran123') {
      const token = jwt.sign(
        { id: 'admin-saas-cobran', email: email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        token,
        user: {
          id: 'admin-saas-cobran',
          email: email,
          name: 'Admin SAAS COBRAN'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota do dashboard
router.get('/dashboard', authenticateSaasCobran, (req, res) => {
  try {
    // Buscar métricas do banco com fallback para tabelas não existentes
    let cobrancasR1 = 0;
    let recorrentes = 0;
    let clientesAtivos = 0;
    let receitaTotal = 0;

    try {
      const result = db.prepare(`
        SELECT COUNT(*) as count 
        FROM saas_cobran_charges 
        WHERE type = 'activation' AND status = 'succeeded'
      `).get();
      cobrancasR1 = result?.count || 0;
    } catch (e) {
      // Tabela ainda não existe
    }

    try {
      const result = db.prepare(`
        SELECT COUNT(*) as count 
        FROM saas_cobran_charges 
        WHERE type = 'recurring' AND status = 'succeeded'
      `).get();
      recorrentes = result?.count || 0;
    } catch (e) {
      // Tabela ainda não existe
    }

    try {
      const result = db.prepare(`
        SELECT COUNT(*) as count 
        FROM saas_cobran_subscriptions 
        WHERE status = 'active'
      `).get();
      clientesAtivos = result?.count || 0;
    } catch (e) {
      // Tabela ainda não existe
    }

    try {
      const result = db.prepare(`
        SELECT SUM(amount) as total 
        FROM saas_cobran_charges 
        WHERE status = 'succeeded'
      `).get();
      receitaTotal = result?.total || 0;
    } catch (e) {
      // Tabela ainda não existe
    }

    res.json({
      success: true,
      metrics: {
        cobrancasR1,
        recorrentes,
        clientesAtivos,
        receitaTotal
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar dashboard',
      error: error.message
    });
  }
});

// Rota para criar plano
router.post('/plans', authenticateSaasCobran, async (req, res) => {
  const { name, description, amount, currency = 'BRL', interval = 'month', trial_days = 3 } = req.body;
  
  try {
    const planId = `plan_${Date.now()}`;
    let stripeProductId = null;
    let stripePriceId = null;
    
    // Criar produto no Stripe apenas se estiver configurado
    if (stripe) {
      try {
        const stripeProduct = await stripe.products.create({
          name: name,
          description: description,
        });

        const stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(amount * 100), // Converter para centavos
          currency: currency.toLowerCase(),
          recurring: {
            interval: interval as 'month' | 'year'
          },
        });

        stripeProductId = stripeProduct.id;
        stripePriceId = stripePrice.id;
      } catch (stripeError) {
        console.error('Erro ao criar produto/preço no Stripe:', stripeError);
        // Continuar sem Stripe
      }
    }

    // Salvar no banco
    const stmt = db.prepare(`
      INSERT INTO saas_cobran_plans (
        id, name, description, amount, currency, interval, trial_days, 
        stripe_price_id, stripe_product_id, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      planId, name, description, amount, currency, interval, trial_days,
      stripePriceId, stripeProductId, true
    );

    res.json({
      success: true,
      plan: {
        id: planId,
        name,
        description,
        amount,
        currency,
        interval,
        trial_days,
        stripe_price_id: stripePriceId,
        stripe_product_id: stripeProductId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar plano',
      error: error.message
    });
  }
});

// Rota para criar cobrança de R$1 + recorrente
router.post('/create-charge', authenticateSaasCobran, async (req, res) => {
  const { email, name, phone, plan_id } = req.body;
  
  try {
    // Buscar plano
    const plan = db.prepare('SELECT * FROM saas_cobran_plans WHERE id = ?').get(plan_id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado'
      });
    }

    // Criar ou buscar cliente
    let customer = db.prepare('SELECT * FROM saas_cobran_customers WHERE email = ?').get(email);
    
    if (!customer) {
      const customerId = `customer_${Date.now()}`;
      let stripeCustomerId = null;
      
      // Criar cliente no Stripe apenas se estiver configurado
      if (stripe) {
        try {
          const stripeCustomer = await stripe.customers.create({
            email: email,
            name: name,
            phone: phone,
          });
          stripeCustomerId = stripeCustomer.id;
        } catch (stripeError) {
          console.error('Erro ao criar cliente no Stripe:', stripeError);
        }
      }

      // Salvar no banco
      const stmt = db.prepare(`
        INSERT INTO saas_cobran_customers (id, email, name, phone, stripe_customer_id)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      stmt.run(customerId, email, name, phone, stripeCustomerId);
      
      customer = {
        id: customerId,
        email,
        name,
        phone,
        stripe_customer_id: stripeCustomerId
      };
    }

    let paymentIntentId = null;
    let clientSecret = null;

    // Criar Payment Intent para R$1 (taxa de ativação) apenas se Stripe estiver configurado
    if (stripe && customer.stripe_customer_id) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: 100, // R$1.00 em centavos
          currency: 'brl',
          customer: customer.stripe_customer_id,
          description: `Taxa de ativação - ${plan.name}`,
          setup_future_usage: 'off_session', // Salvar método de pagamento
        });
        
        paymentIntentId = paymentIntent.id;
        clientSecret = paymentIntent.client_secret;
      } catch (stripeError) {
        console.error('Erro ao criar Payment Intent:', stripeError);
      }
    }

    // Salvar cobrança no banco
    const chargeId = `charge_${Date.now()}`;
    const chargeStmt = db.prepare(`
      INSERT INTO saas_cobran_charges (
        id, customer_id, amount, currency, type, status, stripe_payment_intent_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    chargeStmt.run(
      chargeId, customer.id, 1.00, 'BRL', 'activation', 'pending', paymentIntentId
    );

    res.json({
      success: true,
      payment_intent: {
        id: paymentIntentId,
        client_secret: clientSecret,
        amount: 100,
        currency: 'brl'
      },
      customer: customer,
      plan: plan,
      charge_id: chargeId,
      stripe_configured: !!stripe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar cobrança',
      error: error.message
    });
  }
});

// Rota para listar planos
router.get('/plans', authenticateSaasCobran, (req, res) => {
  try {
    const plans = db.prepare('SELECT * FROM saas_cobran_plans WHERE active = 1').all();
    res.json({
      success: true,
      plans: plans || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar planos',
      error: error.message
    });
  }
});

// Rota para listar cobranças
router.get('/charges', authenticateSaasCobran, (req, res) => {
  try {
    const charges = db.prepare(`
      SELECT sc.*, scc.email, scc.name, scp.name as plan_name
      FROM saas_cobran_charges sc
      JOIN saas_cobran_customers scc ON sc.customer_id = scc.id
      LEFT JOIN saas_cobran_subscriptions ss ON sc.subscription_id = ss.id
      LEFT JOIN saas_cobran_plans scp ON ss.plan_id = scp.id
      ORDER BY sc.created_at DESC
    `).all();
    
    res.json({
      success: true,
      charges: charges || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cobranças',
      error: error.message
    });
  }
});

// Rota para confirmar pagamento e criar assinatura recorrente
router.post('/confirm-payment', authenticateSaasCobran, async (req, res) => {
  const { payment_intent_id, charge_id } = req.body;
  
  try {
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: 'Stripe não configurado'
      });
    }

    // Verificar status do Payment Intent
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    
    if (paymentIntent.status === 'succeeded') {
      // Atualizar cobrança
      const updateCharge = db.prepare(`
        UPDATE saas_cobran_charges 
        SET status = 'succeeded', paid_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      updateCharge.run(charge_id);

      // Buscar dados da cobrança
      const charge = db.prepare(`
        SELECT sc.*, scc.*, scp.* 
        FROM saas_cobran_charges sc
        JOIN saas_cobran_customers scc ON sc.customer_id = scc.id
        LEFT JOIN saas_cobran_subscriptions ss ON sc.subscription_id = ss.id
        LEFT JOIN saas_cobran_plans scp ON ss.plan_id = scp.id
        WHERE sc.id = ?
      `).get(charge_id);

      if (charge && charge.stripe_customer_id && charge.stripe_price_id) {
        // Criar assinatura recorrente no Stripe
        const subscription = await stripe.subscriptions.create({
          customer: charge.stripe_customer_id,
          items: [{ price: charge.stripe_price_id }],
          trial_end: Math.floor(Date.now() / 1000) + (charge.trial_days * 24 * 60 * 60), // Trial em dias
          default_payment_method: paymentIntent.payment_method,
        });

        // Salvar assinatura no banco
        const subscriptionId = `subscription_${Date.now()}`;
        const subscriptionStmt = db.prepare(`
          INSERT INTO saas_cobran_subscriptions (
            id, customer_id, plan_id, stripe_subscription_id, status,
            current_period_start, current_period_end, trial_end
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        subscriptionStmt.run(
          subscriptionId,
          charge.customer_id,
          charge.plan_id,
          subscription.id,
          'active',
          new Date(subscription.current_period_start * 1000).toISOString(),
          new Date(subscription.current_period_end * 1000).toISOString(),
          new Date(subscription.trial_end * 1000).toISOString()
        );

        res.json({
          success: true,
          message: 'Pagamento confirmado e assinatura criada',
          subscription: {
            id: subscriptionId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            trial_end: new Date(subscription.trial_end * 1000).toISOString()
          }
        });
      } else {
        res.json({
          success: true,
          message: 'Pagamento confirmado (sem assinatura recorrente - Stripe não configurado)',
          charge_id: charge_id
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Pagamento não foi bem-sucedido',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao confirmar pagamento',
      error: error.message
    });
  }
});

export default router;