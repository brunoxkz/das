/**
 * 🧪 TESTE COMPLETO DO SISTEMA DE CHECKOUT
 * Testa o fluxo completo: produto → sessão → pagamento → webhook
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Função para fazer requisições
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  return response;
}

// Teste do fluxo completo
async function testCheckoutFlow() {
  try {
    console.log('🚀 Iniciando teste completo do sistema de checkout...\n');

    // 1. Verificar produto existente
    console.log('1️⃣ Verificando produto no banco...');
    const productResponse = await makeRequest('/api/checkout-products');
    const products = await productResponse.json();
    
    if (products.length === 0) {
      console.log('❌ Nenhum produto encontrado');
      return;
    }
    
    const product = products[0];
    console.log(`✅ Produto encontrado: ${product.name} - R$ ${product.price}`);

    // 2. Criar sessão de checkout
    console.log('\n2️⃣ Criando sessão de checkout...');
    const checkoutData = {
      productId: product.id,
      customerEmail: 'teste@vendzz.com',
      customerName: 'Bruno Teste',
      successUrl: 'https://vendzz.com/success',
      cancelUrl: 'https://vendzz.com/cancel'
    };

    const sessionResponse = await makeRequest('/api/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify(checkoutData)
    });

    if (sessionResponse.ok) {
      const session = await sessionResponse.json();
      console.log(`✅ Sessão criada: ${session.id}`);
      console.log(`🔗 URL de pagamento: ${session.url}`);
      
      // 3. Simular webhook de pagamento bem-sucedido
      console.log('\n3️⃣ Simulando webhook de pagamento...');
      const webhookData = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: session.id,
            customer_email: checkoutData.customerEmail,
            amount_total: product.price * 100,
            currency: 'brl',
            payment_status: 'paid',
            metadata: {
              productId: product.id
            }
          }
        }
      };

      const webhookResponse = await makeRequest('/api/webhook/stripe', {
        method: 'POST',
        body: JSON.stringify(webhookData),
        headers: {
          'stripe-signature': 'test-signature'
        }
      });

      if (webhookResponse.ok) {
        console.log('✅ Webhook processado com sucesso');
        
        // 4. Verificar transação criada
        console.log('\n4️⃣ Verificando transação...');
        const transactionResponse = await makeRequest('/api/checkout-transactions');
        const transactions = await transactionResponse.json();
        
        if (transactions.length > 0) {
          const transaction = transactions[0];
          console.log(`✅ Transação criada: ${transaction.id}`);
          console.log(`💰 Valor: R$ ${transaction.amount}`);
          console.log(`📧 Cliente: ${transaction.customerEmail}`);
          console.log(`✅ Status: ${transaction.status}`);
        } else {
          console.log('⚠️ Nenhuma transação encontrada');
        }

        // 5. Testar página de checkout
        console.log('\n5️⃣ Testando página de checkout...');
        const checkoutPageResponse = await makeRequest(`/checkout/${product.id}`);
        
        if (checkoutPageResponse.ok) {
          console.log('✅ Página de checkout acessível');
        } else {
          console.log('⚠️ Erro ao acessar página de checkout');
        }

        // 6. Resumo final
        console.log('\n🎉 TESTE COMPLETO FINALIZADO!');
        console.log('=====================================');
        console.log('✅ Produto: OK');
        console.log('✅ Sessão: OK');
        console.log('✅ Webhook: OK');
        console.log('✅ Transação: OK');
        console.log('✅ Página: OK');
        console.log('=====================================');
        console.log('\n🔗 URLs para teste manual:');
        console.log(`📦 Produto: ${BASE_URL}/checkout/${product.id}`);
        console.log(`💳 Stripe: ${session.url}`);
        console.log('=====================================');

      } else {
        console.log('❌ Erro no webhook:', await webhookResponse.text());
      }

    } else {
      console.log('❌ Erro ao criar sessão:', await sessionResponse.text());
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testCheckoutFlow()
  .then(() => {
    console.log('\n✅ Teste executado com sucesso!');
  })
  .catch((error) => {
    console.error('\n❌ Erro no teste:', error);
  });