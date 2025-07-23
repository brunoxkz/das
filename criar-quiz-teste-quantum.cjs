// CRIAR QUIZ DE TESTE PARA SISTEMA QUANTUM

const http = require('http');

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      rejectUnauthorized: false
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function criarQuizTeste() {
  console.log('🎯 CRIANDO QUIZ DE TESTE PARA SISTEMA QUANTUM');
  console.log('=' .repeat(60));

  try {
    // 1. LOGIN
    console.log('\n1. 🔑 Login como admin...');
    const loginResult = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    
    if (loginResult.status !== 200) {
      throw new Error(`Login failed: ${loginResult.status}`);
    }
    
    const token = loginResult.data.token || loginResult.data.accessToken;
    console.log(`✅ Login realizado com sucesso`);

    // 2. CRIAR QUIZ DE TESTE QUANTUM
    console.log('\n2. 🎯 Criando Quiz de Teste Quantum...');
    
    const quizData = {
      title: 'Quiz Teste Quantum',
      description: 'Quiz criado especificamente para testar o Sistema Quantum',
      structure: {
        pages: [
          {
            id: 'page-1',
            elements: [
              {
                id: 'p1_objetivo_fitness',
                type: 'multiple_choice',
                question: 'Qual é o seu objetivo principal de fitness?',
                options: ['Emagrecer', 'Ganhar Massa', 'Definir', 'Manter Peso'],
                required: true
              }
            ]
          },
          {
            id: 'page-2',
            elements: [
              {
                id: 'p2_nome',
                type: 'text',
                question: 'Qual é o seu nome?',
                required: true,
                placeholder: 'Digite seu nome completo'
              }
            ]
          },
          {
            id: 'page-3',
            elements: [
              {
                id: 'p3_telefone',
                type: 'text',
                question: 'Qual é o seu WhatsApp?',
                required: true,
                placeholder: '(11) 99999-9999'
              }
            ]
          }
        ],
        settings: {
          resultTitle: 'Obrigado por participar!',
          resultDescription: 'Em breve entraremos em contato.',
          theme: {
            primaryColor: '#10B981',
            backgroundColor: '#FFFFFF'
          }
        }
      },
      settings: {
        collectLeads: true,
        showProgress: true
      },
      isPublished: true
    };

    const createQuizResult = await makeRequest('/api/quizzes', 'POST', quizData, token);
    
    if (createQuizResult.status === 201 || createQuizResult.status === 200) {
      const quizId = createQuizResult.data.quiz?.id || createQuizResult.data.id;
      console.log(`✅ Quiz criado com sucesso!`);
      console.log(`   Quiz ID: ${quizId}`);
      console.log(`   URL: https://localhost:5000/quiz/${quizId}`);
      
      // 3. CRIAR ALGUMAS RESPOSTAS DE TESTE
      console.log('\n3. 📝 Criando respostas de teste...');
      
      const testResponses = [
        {
          responses: {
            p1_objetivo_fitness: 'Emagrecer',
            p2_nome: 'Ana Silva',
            p3_telefone: '+5511999999001'
          },
          leadData: {
            nome: 'Ana Silva',
            telefone: '+5511999999001'
          }
        },
        {
          responses: {
            p1_objetivo_fitness: 'Ganhar Massa',
            p2_nome: 'João Santos',
            p3_telefone: '+5511999999002'
          },
          leadData: {
            nome: 'João Santos',
            telefone: '+5511999999002'
          }
        },
        {
          responses: {
            p1_objetivo_fitness: 'Definir',
            p2_nome: 'Maria Oliveira',
            p3_telefone: '+5511999999003'
          },
          leadData: {
            nome: 'Maria Oliveira',
            telefone: '+5511999999003'
          }
        }
      ];
      
      for (let i = 0; i < testResponses.length; i++) {
        const responseData = {
          ...testResponses[i],
          totalPages: 3,
          completionPercentage: 100,
          timeSpent: 45000 + (i * 1000)
        };
        
        const responseResult = await makeRequest(`/api/quizzes/${quizId}/submit`, 'POST', responseData, token);
        
        if (responseResult.status === 201 || responseResult.status === 200) {
          console.log(`   ✅ Resposta ${i + 1} criada: ${testResponses[i].leadData.nome}`);
        } else {
          console.log(`   ❌ Erro resposta ${i + 1}: Status ${responseResult.status}`);
        }
      }
      
      console.log('\n🎉 QUIZ DE TESTE QUANTUM CRIADO COM SUCESSO!');
      console.log('=' .repeat(60));
      console.log(`📋 Quiz ID: ${quizId}`);
      console.log(`🔗 URL de Teste: https://localhost:5000/quiz/${quizId}`);
      console.log(`🎯 Remarketing Quantum: https://localhost:5000/remarketing-quantum`);
      console.log(`⚡ Ao Vivo Quantum: https://localhost:5000/ao-vivo-quantum`);
      console.log(`🔬 Sistema Ultra: https://localhost:5000/sistema-ultra-demo`);
      console.log('\n✨ Agora você pode testar o Sistema Quantum com dados reais!');
      
    } else {
      console.log(`❌ Erro ao criar quiz: Status ${createQuizResult.status}`);
      console.log(`   Dados: ${JSON.stringify(createQuizResult.data)}`);
    }

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
  }
}

criarQuizTeste().catch(console.error);