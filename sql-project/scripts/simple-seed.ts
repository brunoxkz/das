import { createSQLiteConnection } from '../src/config/database';
import { users, products, orders } from '../src/schemas';

async function simpleSeed() {
  try {
    console.log('🌱 Iniciando seed simplificado...');
    
    const db = createSQLiteConnection();
    
    // Insert sample users
    const user1 = await db.insert(users).values({
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '+5511999999999',
      status: 'active'
    }).returning();
    
    const user2 = await db.insert(users).values({
      name: 'Maria Santos',
      email: 'maria@example.com',
      phone: '+5511888888888',
      status: 'active'
    }).returning();
    
    // Insert sample products
    const product1 = await db.insert(products).values({
      name: 'Smartphone Premium',
      description: 'Último modelo com 128GB',
      price: 1299.99,
      category: 'Eletrônicos',
      inStock: 50,
      isActive: 'true'
    }).returning();
    
    const product2 = await db.insert(products).values({
      name: 'Notebook Gaming',
      description: 'Notebook para jogos com placa de vídeo dedicada',
      price: 2999.99,
      category: 'Computadores',
      inStock: 25,
      isActive: 'true'
    }).returning();
    
    // Insert sample orders
    await db.insert(orders).values({
      userId: user1[0].id,
      total: 1299.99,
      status: 'completed',
      notes: 'Entrega expressa'
    });
    
    await db.insert(orders).values({
      userId: user2[0].id,
      total: 2999.99,
      status: 'pending',
      notes: 'Aguardando pagamento'
    });
    
    console.log('✅ Seed concluído com sucesso!');
    console.log(`📊 Criados: 2 usuários, 2 produtos, 2 pedidos`);
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  }
}

simpleSeed();