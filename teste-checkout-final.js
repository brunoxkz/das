import { nanoid } from 'nanoid';
import Database from 'better-sqlite3';

console.log('🔍 Teste de nanoid...');
const id1 = nanoid();
const id2 = nanoid();
console.log('✅ ID1:', id1, 'tipo:', typeof id1);
console.log('✅ ID2:', id2, 'tipo:', typeof id2);

const db = new Database('database.sqlite');

console.log('\n🔍 Testando criação de produto...');
const productData = {
  id: nanoid(),
  user_id: '1EaY6vE0rYAkTXv5vHClm',
  name: 'Produto Teste Final',
  description: 'Teste final do sistema',
  price: 29.90,
  currency: 'BRL',
  category: 'digital',
  features: 'Teste',
  payment_mode: 'one_time',
  recurring_interval: null,
  trial_period: null,
  trial_price: null,
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

console.log('📦 Dados do produto:');
console.log('- ID:', productData.id);
console.log('- User ID:', productData.user_id);
console.log('- Nome:', productData.name);

try {
  const stmt = db.prepare(`
    INSERT INTO checkout_products (
      id, user_id, name, description, price, currency, 
      category, features, payment_mode, recurring_interval, 
      trial_period, trial_price, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    productData.id,
    productData.user_id,
    productData.name,
    productData.description,
    productData.price,
    productData.currency,
    productData.category,
    productData.features,
    productData.payment_mode,
    productData.recurring_interval,
    productData.trial_period,
    productData.trial_price,
    productData.status,
    productData.created_at,
    productData.updated_at
  );

  console.log('✅ Produto criado com sucesso!');
  console.log('📊 Resultado:', result);

  // Buscar produto criado
  const produto = db.prepare('SELECT * FROM checkout_products WHERE id = ?').get(productData.id);
  console.log('📦 Produto encontrado:', produto);

} catch (error) {
  console.error('❌ Erro:', error);
} finally {
  db.close();
}