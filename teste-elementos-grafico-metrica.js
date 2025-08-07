#!/usr/bin/env node

/**
 * TESTE ESPECÍFICO - ELEMENTOS GRÁFICO E MÉTRICA
 * ===============================================
 * 
 * Testa se os elementos gráfico e métrica funcionam corretamente
 * após todas as correções aplicadas
 */

const baseUrl = 'http://localhost:5000';

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error(`❌ Erro na requisição para ${endpoint}:`, error.message);
    throw error;
  }
}

async function authenticate() {
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    
    if (data.token) {
      console.log('✅ Autenticação bem-sucedida');
      return data.token;
    } else {
      throw new Error('Token não encontrado na resposta');
    }
  } catch (error) {
    console.error('❌ Erro na autenticação:', error.message);
    throw error;
  }
}

async function criarQuizComElementos(token) {
  try {
    // Criar quiz básico
    const quizData = {
      title: "Teste Elementos Visualização",
      description: "Quiz para testar gráfico e métrica",
      structure: {
        pages: [
          {
            id: 1,
            title: "Página com Gráfico",
            elements: [
              {
                id: 1,
                type: "chart",
                chartTitle: "Gráfico de Teste",
                chartType: "bar",
                timePeriod: "weeks",
                chartWidth: "100%",
                chartHeight: "300px"
              }
            ]
          },
          {
            id: 2,
            title: "Página com Métrica",
            elements: [
              {
                id: 2,
                type: "metrics",
                metricsTitle: "Métricas de Teste",
                metricsShowValue: true,
                metricsShowPercentage: true
              }
            ]
          }
        ]
      },
      isPublished: true
    };

    const response = await makeRequest('/api/quizzes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(quizData)
    });

    const data = await response.json();
    
    if (data.id) {
      console.log('✅ Quiz criado com sucesso:', data.id);
      return data.id;
    } else {
      throw new Error('ID do quiz não encontrado na resposta');
    }
  } catch (error) {
    console.error('❌ Erro ao criar quiz:', error.message);
    throw error;
  }
}

async function testarQuizPublico(quizId) {
  try {
    const response = await makeRequest(`/quiz/${quizId}`);
    
    if (response.ok) {
      console.log('✅ Quiz público acessível');
      return true;
    } else {
      console.log('❌ Quiz público não acessível');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar quiz público:', error.message);
    return false;
  }
}

async function executarTeste() {
  console.log('🧪 TESTE ESPECÍFICO - ELEMENTOS GRÁFICO E MÉTRICA');
  console.log('=================================================\n');

  try {
    // 1. Autenticar
    console.log('1. Autenticando...');
    const token = await authenticate();
    
    // 2. Criar quiz com elementos
    console.log('\n2. Criando quiz com elementos gráfico e métrica...');
    const quizId = await criarQuizComElementos(token);
    
    // 3. Testar acesso público
    console.log('\n3. Testando acesso público...');
    const acessoPublico = await testarQuizPublico(quizId);
    
    // 4. Resultado final
    console.log('\n📊 RESULTADO DO TESTE:');
    console.log('======================');
    console.log(`Quiz ID: ${quizId}`);
    console.log(`Acesso público: ${acessoPublico ? '✅ Funcionando' : '❌ Falhou'}`);
    console.log(`URL do teste: http://localhost:5000/quiz/${quizId}`);
    
    if (acessoPublico) {
      console.log('\n🎯 SUCESSO! Os elementos gráfico e métrica podem estar funcionando');
      console.log('👀 Verifique visualmente acessando a URL acima');
    } else {
      console.log('\n⚠️  FALHA! Há problemas com o quiz público');
    }
    
  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO:', error.message);
    console.log('\n💡 POSSÍVEIS CAUSAS:');
    console.log('- Servidor não está rodando');
    console.log('- Problemas de autenticação');
    console.log('- Erros de sintaxe nos elementos');
    console.log('- Problemas de conectividade');
  }
}

// Importar fetch se não disponível
if (typeof fetch === 'undefined') {
  const { default: fetch } = await import('node-fetch');
  global.fetch = fetch;
}

executarTeste();