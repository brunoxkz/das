#!/usr/bin/env node

/**
 * 🚀 SCRIPT DE CRIAÇÃO DE PRODUTO DE TESTE PARA STRIPE
 * Cria produto de assinatura com trial de 3 dias por R$1,00 + R$29,90/mês
 */

import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';

// Conectar ao banco de dados
const db = new Database('./server/database.db');

// Função para criar produto de teste
function createTestProduct() {
  try {
    // Verificar se a tabela existe
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='checkout_products'
    `).get();

    if (!tableExists) {
      console.log('❌ Tabela checkout_products não encontrada. Execute a aplicação primeiro.');
      return;
    }

    // Dados do produto de teste
    const productData = {
      id: nanoid(),
      userId: 'admin-user-id',
      name: 'Vendzz Pro - Assinatura Trial',
      description: 'Acesso completo à plataforma Vendzz com sistema de trial de 3 dias',
      price: 29.90,
      originalPrice: 59.90,
      currency: 'BRL',
      category: 'Software',
      paymentMode: 'subscription',
      recurringInterval: 'monthly',
      trialPeriod: 3,
      trialPrice: 1.00,
      features: JSON.stringify([
        'Quizzes ilimitados',
        'Campanhas de email',
        'Campanhas de SMS',
        'Campanhas de WhatsApp',
        'Analytics avançados',
        'Suporte prioritário',
        'Integrações API',
        'Webhooks personalizados'
      ]),
      design: JSON.stringify({
        primaryColor: '#22c55e',
        secondaryColor: '#16a34a',
        backgroundColor: '#f8fafc',
        textColor: '#1e293b',
        borderRadius: '8px',
        buttonStyle: 'solid',
        theme: 'modern'
      }),
      orderBumps: JSON.stringify([
        {
          id: 'bump-1',
          name: 'Setup Personalizado',
          description: 'Configuração completa da sua conta por especialista',
          price: 49.90,
          active: true
        }
      ]),
      upsells: JSON.stringify([
        {
          id: 'upsell-1',
          name: 'Vendzz Enterprise',
          description: 'Upgrade para plano Enterprise com recursos avançados',
          price: 149.90,
          active: true
        }
      ]),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Inserir produto no banco
    const insertQuery = `
      INSERT INTO checkout_products (
        id, userId, name, description, price, originalPrice, currency, category,
        paymentMode, recurringInterval, trialPeriod, trialPrice, features,
        design, order_bumps, upsells, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const stmt = db.prepare(insertQuery);
    stmt.run(
      productData.id,
      productData.userId,
      productData.name,
      productData.description,
      productData.price,
      productData.originalPrice,
      productData.currency,
      productData.category,
      productData.paymentMode,
      productData.recurringInterval,
      productData.trialPeriod,
      productData.trialPrice,
      productData.features,
      productData.design,
      productData.orderBumps,
      productData.upsells,
      productData.status,
      productData.createdAt,
      productData.updatedAt
    );

    console.log('✅ Produto de teste criado com sucesso!');
    console.log('📊 Dados do produto:');
    console.log(`   ID: ${productData.id}`);
    console.log(`   Nome: ${productData.name}`);
    console.log(`   Preço: R$ ${productData.price.toFixed(2)}/mês`);
    console.log(`   Trial: ${productData.trialPeriod} dias por R$ ${productData.trialPrice.toFixed(2)}`);
    console.log(`   Status: ${productData.status}`);
    console.log('');
    console.log('🔗 Acesse: http://localhost:5000/checkout-public para testar');
    console.log('');
    console.log('🎯 Configuração do Stripe necessária:');
    console.log('   - STRIPE_SECRET_KEY: Sua chave secreta do Stripe');
    console.log('   - VITE_STRIPE_PUBLIC_KEY: Sua chave pública do Stripe');
    console.log('   - STRIPE_WEBHOOK_SECRET: Webhook secret do Stripe');

  } catch (error) {
    console.error('❌ Erro ao criar produto de teste:', error);
  } finally {
    db.close();
  }
}

// Executar criação
createTestProduct();