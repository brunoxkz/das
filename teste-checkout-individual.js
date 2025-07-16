/**
 * TESTE DE CHECKOUT INDIVIDUAL - DEBUG DA PÁGINA PÚBLICA
 * Testa se a página de checkout individual está funcionando corretamente
 */

import fetch from 'node-fetch';

async function testeCheckoutIndividual() {
  try {
    console.log('🔍 TESTANDO CHECKOUT INDIVIDUAL...');
    
    // Testar se o produto existe
    console.log('1. Testando API do produto...');
    const response = await fetch('http://localhost:5000/api/checkout-products/XOo0LKW1oozG1mv98b-Dl');
    
    if (!response.ok) {
      console.error('❌ API não responde:', response.status, response.statusText);
      return;
    }
    
    const product = await response.json();
    console.log('✅ Produto encontrado:', {
      id: product.id,
      name: product.name,
      price: product.price,
      features: product.features
    });
    
    // Testar se a página abre sem erro
    console.log('2. Testando acesso à página...');
    const pageResponse = await fetch('http://localhost:5000/checkout-individual/XOo0LKW1oozG1mv98b-Dl');
    
    if (!pageResponse.ok) {
      console.error('❌ Página não carrega:', pageResponse.status, pageResponse.statusText);
      return;
    }
    
    console.log('✅ Página carrega corretamente!');
    
    // Testar se há problemas de CORS
    console.log('3. Testando CORS...');
    const corsResponse = await fetch('http://localhost:5000/api/checkout-products/XOo0LKW1oozG1mv98b-Dl', {
      headers: {
        'Origin': 'http://localhost:5000'
      }
    });
    
    if (!corsResponse.ok) {
      console.error('❌ CORS bloqueado:', corsResponse.status);
      return;
    }
    
    console.log('✅ CORS funcionando!');
    
    console.log('🎉 CHECKOUT INDIVIDUAL FUNCIONANDO CORRETAMENTE!');
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error.message);
  }
}

testeCheckoutIndividual();