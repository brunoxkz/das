import { db } from '../src/config/database';
import { users, products, orders } from '../src/schemas';
import { userService } from '../src/services/userService';

const sampleUsers = [
  {
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '+5511999999999',
    status: 'active'
  },
  {
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '+5511888888888',
    status: 'active'
  },
  {
    name: 'Pedro Oliveira',
    email: 'pedro@email.com',
    phone: '+5511777777777',
    status: 'active'
  },
  {
    name: 'Ana Costa',
    email: 'ana@email.com',
    phone: '+5511666666666',
    status: 'active'
  },
  {
    name: 'Carlos Ferreira',
    email: 'carlos@email.com',
    phone: '+5511555555555',
    status: 'active'
  }
];

const sampleProducts = [
  {
    name: 'Produto A',
    description: 'Descrição do produto A',
    price: 99.99,
    category: 'categoria1',
    inStock: 100,
    isActive: 'true'
  },
  {
    name: 'Produto B',
    description: 'Descrição do produto B',
    price: 149.99,
    category: 'categoria2',
    inStock: 50,
    isActive: 'true'
  },
  {
    name: 'Produto C',
    description: 'Descrição do produto C',
    price: 79.99,
    category: 'categoria1',
    inStock: 75,
    isActive: 'true'
  },
  {
    name: 'Produto D',
    description: 'Descrição do produto D',
    price: 199.99,
    category: 'categoria3',
    inStock: 25,
    isActive: 'true'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Clear existing data (optional)
    console.log('🗑️ Limpando dados existentes...');
    await db.delete(orders);
    await db.delete(products);
    await db.delete(users);

    // Seed users
    console.log('👥 Inserindo usuários...');
    const insertedUsers = await userService.createMany(sampleUsers);
    console.log(`✅ ${insertedUsers.length} usuários criados`);

    // Seed products
    console.log('📦 Inserindo produtos...');
    const insertedProducts = await db.insert(products).values(sampleProducts).returning();
    console.log(`✅ ${insertedProducts.length} produtos criados`);

    // Seed orders
    console.log('📋 Inserindo pedidos...');
    const sampleOrders = [
      {
        userId: insertedUsers[0].id,
        total: 249.98,
        status: 'completed',
        notes: 'Pedido de teste 1'
      },
      {
        userId: insertedUsers[1].id,
        total: 99.99,
        status: 'pending',
        notes: 'Pedido de teste 2'
      },
      {
        userId: insertedUsers[2].id,
        total: 379.97,
        status: 'processing',
        notes: 'Pedido de teste 3'
      }
    ];

    const insertedOrders = await db.insert(orders).values(sampleOrders).returning();
    console.log(`✅ ${insertedOrders.length} pedidos criados`);

    console.log('🎉 Seed concluído com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   - Usuários: ${insertedUsers.length}`);
    console.log(`   - Produtos: ${insertedProducts.length}`);
    console.log(`   - Pedidos: ${insertedOrders.length}`);

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  }
}

seedDatabase();