/**
 * TESTE SIMPLES - PERSISTÊNCIA DE ELEMENTOS
 */

const API_BASE = 'http://localhost:5000';

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function authenticate() {
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    return response.accessToken || response.token;
  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    return null;
  }
}

async function testSimple() {
  console.log('🧪 TESTE SIMPLES DE PERSISTÊNCIA');
  console.log('=================================');
  
  const token = await authenticate();
  if (!token) {
    console.log('❌ Falha na autenticação');
    return;
  }
  
  console.log('✅ Token obtido');
  
  // Criar quiz básico
  const quizBasico = {
    title: 'Quiz Teste Simples',
    description: 'Teste básico de persistência',
    structure: {
      pages: [
        {
          id: 'page1',
          title: 'Página 1',
          elements: [
            {
              id: 'elemento1',
              type: 'heading',
              content: 'Título de Teste',
              properties: {
                fontSize: 'lg'
              }
            }
          ]
        }
      ]
    }
  };
  
  try {
    console.log('📝 Criando quiz...');
    const quizCriado = await makeRequest('/api/quizzes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(quizBasico)
    });
    
    console.log('✅ Quiz criado:', quizCriado.id);
    console.log('📊 Elementos iniciais:', quizCriado.structure.pages[0].elements.length);
    
    // Recarregar o quiz
    console.log('🔄 Recarregando quiz...');
    const quizRecarregado = await makeRequest(`/api/quizzes/${quizCriado.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📊 Elementos após recarga:', quizRecarregado.structure.pages[0].elements.length);
    
    // Verificar se elemento ainda existe
    const elemento = quizRecarregado.structure.pages[0].elements.find(e => e.id === 'elemento1');
    if (elemento) {
      console.log('✅ Elemento persistiu corretamente');
      console.log('📝 Conteúdo:', elemento.content);
    } else {
      console.log('❌ PROBLEMA: Elemento desapareceu!');
    }
    
    // Limpar
    await makeRequest(`/api/quizzes/${quizCriado.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('🗑️ Quiz deletado');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testSimple();