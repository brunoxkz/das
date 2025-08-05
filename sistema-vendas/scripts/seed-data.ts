import { storage } from '../server/storage';

/**
 * Script para popular o banco com dados de teste
 */

async function seedTestData() {
  console.log('🌱 Populando banco com dados de teste...');

  try {
    // Criar produtos adicionais
    const products = [
      { name: 'Kit Beleza Premium', description: 'Kit completo de produtos de beleza', price: 129.90, category: 'Beleza' },
      { name: 'Suplemento Natural', description: 'Suplemento 100% natural', price: 89.90, category: 'Saúde' },
      { name: 'Ebook Fitness', description: 'Guia completo de exercícios', price: 39.90, category: 'Digital' },
      { name: 'Curso Online', description: 'Curso de marketing digital', price: 297.00, category: 'Educação' },
      { name: 'Acessório Premium', description: 'Acessório de alta qualidade', price: 199.90, category: 'Acessórios' },
    ];

    for (const productData of products) {
      try {
        await storage.createProduct(productData);
        console.log(`✅ Produto criado: ${productData.name}`);
      } catch (error) {
        console.log(`⚠️ Produto já existe: ${productData.name}`);
      }
    }

    // Criar atendentes adicionais
    const attendants = [
      { username: 'maria', password: 'senha123', name: 'Maria Santos', whatsappNumber: '+5511888888888' },
      { username: 'pedro', password: 'senha123', name: 'Pedro Silva', whatsappNumber: '+5511777777777' },
      { username: 'ana', password: 'senha123', name: 'Ana Costa', whatsappNumber: '+5511666666666' },
    ];

    for (const attendantData of attendants) {
      try {
        await storage.createUser({ ...attendantData, role: 'attendant' });
        console.log(`✅ Atendente criado: ${attendantData.name}`);
      } catch (error) {
        console.log(`⚠️ Atendente já existe: ${attendantData.username}`);
      }
    }

    // Criar pedidos de exemplo
    const users = await storage.getAllUsers();
    const attendant = users.find(u => u.role === 'attendant');
    const allProducts = await storage.getAllProducts();

    if (attendant && allProducts.length > 0) {
      const sampleOrders = [
        {
          attendantId: attendant.id,
          customerName: 'João da Silva',
          customerPhone: '+5511999999999',
          whatsappNumber: attendant.whatsappNumber || '+5511999999999',
          paymentMethod: 'logzz' as const,
          orderDate: new Date(),
          deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          notes: 'Cliente prefere entrega pela manhã',
        },
        {
          attendantId: attendant.id,
          customerName: 'Maria Oliveira',
          customerPhone: '+5511888888888',
          whatsappNumber: attendant.whatsappNumber || '+5511999999999',
          paymentMethod: 'online' as const,
          orderDate: new Date(),
          deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
          notes: 'Pagamento já confirmado',
        },
      ];

      for (const orderData of sampleOrders) {
        try {
          const items = [
            {
              productId: allProducts[0].id,
              productName: allProducts[0].name,
              quantity: 2,
              unitPrice: allProducts[0].price,
              totalPrice: allProducts[0].price * 2,
            }
          ];

          await storage.createOrder({
            ...orderData,
            totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
          }, items);

          console.log(`✅ Pedido criado para: ${orderData.customerName}`);
        } catch (error) {
          console.log(`❌ Erro ao criar pedido: ${error}`);
        }
      }
    }

    console.log('✅ Dados de teste criados com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao popular dados:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedTestData();
}

export { seedTestData };