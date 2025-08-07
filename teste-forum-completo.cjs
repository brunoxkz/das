const fs = require('fs');

// Função para fazer login e obter token
async function getAuthToken() {
  const loginData = {
    email: 'admin@admin.com',
    password: 'admin123'
  };

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('❌ Erro no login:', error.message);
    return null;
  }
}

// Função para testar endpoints do fórum
async function testForumEndpoints(token) {
  const tests = [
    {
      name: 'Buscar categorias do fórum',
      endpoint: '/api/forum/categories',
      method: 'GET'
    },
    {
      name: 'Buscar estatísticas do fórum',
      endpoint: '/api/forum/stats',
      method: 'GET'
    },
    {
      name: 'Buscar tópicos recentes',
      endpoint: '/api/forum/recent',
      method: 'GET'
    },
    {
      name: 'Criar novo tópico',
      endpoint: '/api/forum/topics',
      method: 'POST',
      body: {
        title: 'Teste de criação de tópico via API',
        content: 'Este é um tópico de teste criado via API para validar o sistema do fórum.',
        categoryId: 'marketing-digital-cat',
        tags: ['teste', 'api', 'validação']
      }
    }
  ];

  const results = [];

  for (const test of tests) {
    try {
      console.log(`🔍 Testando: ${test.name}`);

      const options = {
        method: test.method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const response = await fetch(`http://localhost:5000${test.endpoint}`, options);
      
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (response.ok) {
        console.log(`✅ ${test.name}: SUCESSO`);
        console.log(`   Status: ${response.status}`);
        
        if (typeof responseData === 'object') {
          if (Array.isArray(responseData)) {
            console.log(`   Dados: Array com ${responseData.length} itens`);
            if (responseData.length > 0) {
              console.log(`   Primeiro item:`, JSON.stringify(responseData[0], null, 2));
            }
          } else {
            console.log(`   Dados:`, JSON.stringify(responseData, null, 2));
          }
        } else {
          console.log(`   Resposta (texto): ${responseData.slice(0, 200)}...`);
        }
        
        results.push({
          test: test.name,
          status: 'SUCESSO',
          statusCode: response.status,
          data: responseData
        });
      } else {
        console.log(`❌ ${test.name}: FALHOU`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Erro: ${responseData}`);
        
        results.push({
          test: test.name,
          status: 'FALHOU',
          statusCode: response.status,
          error: responseData
        });
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERRO`);
      console.log(`   Erro: ${error.message}`);
      
      results.push({
        test: test.name,
        status: 'ERRO',
        error: error.message
      });
    }

    console.log(''); // Linha em branco para separar os testes
  }

  return results;
}

// Função principal para executar os testes
async function runForumTests() {
  console.log('🚀 Iniciando testes do sistema de fórum...\n');

  // 1. Fazer login
  console.log('🔐 Fazendo login...');
  const token = await getAuthToken();
  
  if (!token) {
    console.log('❌ Não foi possível obter token de autenticação');
    return;
  }
  
  console.log('✅ Login realizado com sucesso\n');

  // 2. Testar endpoints do fórum
  const results = await testForumEndpoints(token);

  // 3. Gerar relatório
  console.log('📊 RELATÓRIO FINAL DOS TESTES:');
  console.log('=' .repeat(50));
  
  const sucessos = results.filter(r => r.status === 'SUCESSO').length;
  const falhas = results.filter(r => r.status === 'FALHOU').length;
  const erros = results.filter(r => r.status === 'ERRO').length;
  
  console.log(`✅ Sucessos: ${sucessos}`);
  console.log(`❌ Falhas: ${falhas}`);
  console.log(`🔥 Erros: ${erros}`);
  console.log(`📈 Taxa de sucesso: ${((sucessos / results.length) * 100).toFixed(1)}%`);
  
  // Salvar relatório em arquivo
  const timestamp = new Date().getTime();
  const reportData = {
    timestamp,
    testDate: new Date().toISOString(),
    summary: {
      total: results.length,
      sucessos,
      falhas,
      erros,
      taxaSucesso: ((sucessos / results.length) * 100).toFixed(1) + '%'
    },
    results
  };

  const filename = `RELATORIO-FORUM-${timestamp}.json`;
  fs.writeFileSync(filename, JSON.stringify(reportData, null, 2));
  console.log(`\n📄 Relatório salvo em: ${filename}`);
  
  if (sucessos === results.length) {
    console.log('\n🎉 SISTEMA DE FÓRUM 100% FUNCIONAL - APROVADO PARA PRODUÇÃO!');
  } else {
    console.log('\n⚠️ Sistema de fórum com problemas - verificar logs acima');
  }
}

// Executar os testes
runForumTests().catch(console.error);