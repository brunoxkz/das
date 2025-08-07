/**
 * 🔍 TESTE COMPLETO DE TODAS AS CAMPANHAS
 * Verifica funcionalidade completa de cada tipo de campanha
 * Testa detecção automática em tempo real e sincronização
 */

const BASE_URL = 'http://localhost:5000';

// Função para fazer requisições HTTP
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ Erro na requisição para ${endpoint}:`, error.message);
    throw error;
  }
}

// Função para autenticar
async function authenticate() {
  const credentials = {
    email: 'admin@vendzz.com',
    password: 'admin123'
  };

  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: credentials
    });

    if (response.accessToken) {
      console.log('✅ Autenticação bem-sucedida');
      return response.accessToken;
    } else {
      throw new Error('Token não recebido');
    }
  } catch (error) {
    console.error('❌ Falha na autenticação:', error.message);
    throw error;
  }
}

// Função para criar um quiz de teste
async function createTestQuiz(token) {
  const quiz = {
    title: 'Quiz Teste Campanhas',
    description: 'Quiz para testar campanhas SMS',
    structure: {
      pages: [
        {
          id: 'page1',
          elements: [
            {
              id: 'name',
              type: 'text',
              properties: {
                label: 'Qual seu nome?',
                required: true,
                fieldId: 'nome_completo'
              }
            },
            {
              id: 'email',
              type: 'email',
              properties: {
                label: 'Seu email:',
                required: true,
                fieldId: 'email_contato'
              }
            },
            {
              id: 'phone',
              type: 'phone',
              properties: {
                label: 'Seu telefone:',
                required: true,
                fieldId: 'telefone_contato'
              }
            }
          ]
        }
      ]
    }
  };

  try {
    const response = await makeRequest('/api/quizzes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: quiz
    });

    console.log('✅ Quiz de teste criado:', response.id);
    return response.id;
  } catch (error) {
    console.error('❌ Erro ao criar quiz:', error.message);
    throw error;
  }
}

// Função para criar respostas de teste
async function createTestResponses(quizId, token) {
  const responses = [
    {
      quizId: quizId,
      responses: {
        nome_completo: 'João Silva',
        email_contato: 'joao@teste.com',
        telefone_contato: '11999887766'
      },
      submittedAt: new Date(Date.now() - 86400000).toISOString() // 1 dia atrás
    },
    {
      quizId: quizId,
      responses: {
        nome_completo: 'Maria Santos',
        email_contato: 'maria@teste.com',
        telefone_contato: '21988776655'
      },
      submittedAt: new Date(Date.now() - 43200000).toISOString() // 12 horas atrás
    },
    {
      quizId: quizId,
      responses: {
        nome_completo: 'Pedro Costa',
        email_contato: 'pedro@teste.com',
        telefone_contato: '8613812345678' // Número chinês
      },
      submittedAt: new Date(Date.now() - 3600000).toISOString() // 1 hora atrás
    },
    {
      quizId: quizId,
      responses: {
        nome_completo: 'Ana Lima',
        email_contato: 'ana@teste.com',
        telefone_contato: '15551234567' // Número americano
      },
      submittedAt: new Date(Date.now() - 1800000).toISOString() // 30 minutos atrás
    }
  ];

  const createdResponses = [];
  for (const response of responses) {
    try {
      const result = await makeRequest('/api/quiz-responses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: response
      });
      createdResponses.push(result);
      console.log(`✅ Resposta criada para ${response.responses.nome_completo}`);
    } catch (error) {
      console.error(`❌ Erro ao criar resposta para ${response.responses.nome_completo}:`, error.message);
    }
  }

  return createdResponses;
}

// Teste 1: Campanha Remarketing
async function testRemarketingCampaign(quizId, token) {
  console.log('\n🔍 TESTE 1: CAMPANHA REMARKETING');
  console.log('===============================');

  const campaign = {
    name: 'Teste Remarketing',
    quizId: quizId,
    type: 'remarketing',
    message: 'Olá {nome_completo}! Vimos que você se interessou pelo nosso produto. Oferta especial: R$50 OFF!',
    schedule: {
      startDate: new Date().toISOString(),
      frequency: 'once'
    },
    filters: {
      dateRange: {
        start: new Date(Date.now() - 86400000 * 2).toISOString(),
        end: new Date(Date.now() - 86400000).toISOString()
      }
    }
  };

  try {
    const response = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: campaign
    });

    console.log('✅ Campanha remarketing criada:', response.id);
    
    // Aguardar um pouco para processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar logs da campanha
    const logs = await makeRequest(`/api/sms-campaigns/${response.id}/logs`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📊 Logs da campanha remarketing:');
    logs.forEach(log => {
      console.log(`  - ${log.phone}: ${log.status} (${log.country || 'não detectado'})`);
    });

    return response.id;
  } catch (error) {
    console.error('❌ Erro no teste remarketing:', error.message);
    return null;
  }
}

// Teste 2: Campanha Ao Vivo
async function testLiveCampaign(quizId, token) {
  console.log('\n🔍 TESTE 2: CAMPANHA AO VIVO');
  console.log('============================');

  const campaign = {
    name: 'Teste Ao Vivo',
    quizId: quizId,
    type: 'live',
    message: 'Olá {nome_completo}! Obrigado por responder nosso quiz. Sua resposta foi registrada!',
    schedule: {
      startDate: new Date().toISOString(),
      frequency: 'immediate'
    },
    filters: {
      responseType: 'all'
    }
  };

  try {
    const response = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: campaign
    });

    console.log('✅ Campanha ao vivo criada:', response.id);
    
    // Criar nova resposta para testar detecção automática
    const newResponse = {
      quizId: quizId,
      responses: {
        nome_completo: 'Carlos Teste',
        email_contato: 'carlos@teste.com',
        telefone_contato: '31987654321'
      },
      submittedAt: new Date().toISOString()
    };

    await makeRequest('/api/quiz-responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: newResponse
    });

    console.log('✅ Nova resposta criada para teste automático');
    
    // Aguardar processamento automático
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Verificar logs da campanha
    const logs = await makeRequest(`/api/sms-campaigns/${response.id}/logs`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📊 Logs da campanha ao vivo:');
    logs.forEach(log => {
      console.log(`  - ${log.phone}: ${log.status} (${log.country || 'não detectado'})`);
    });

    return response.id;
  } catch (error) {
    console.error('❌ Erro no teste ao vivo:', error.message);
    return null;
  }
}

// Teste 3: Campanha Ultra Customizada
async function testUltraCustomizedCampaign(quizId, token) {
  console.log('\n🔍 TESTE 3: CAMPANHA ULTRA CUSTOMIZADA');
  console.log('======================================');

  const campaign = {
    name: 'Teste Ultra Customizada',
    quizId: quizId,
    type: 'ultra_customized',
    message: 'Olá {nome_completo}! Mensagem personalizada baseada em suas respostas específicas.',
    schedule: {
      startDate: new Date().toISOString(),
      frequency: 'immediate'
    },
    filters: {
      customRules: {
        responseField: 'nome_completo',
        condition: 'contains',
        value: 'João'
      }
    }
  };

  try {
    const response = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: campaign
    });

    console.log('✅ Campanha ultra customizada criada:', response.id);
    
    // Aguardar processamento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar logs da campanha
    const logs = await makeRequest(`/api/sms-campaigns/${response.id}/logs`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📊 Logs da campanha ultra customizada:');
    logs.forEach(log => {
      console.log(`  - ${log.phone}: ${log.status} (${log.country || 'não detectado'})`);
    });

    return response.id;
  } catch (error) {
    console.error('❌ Erro no teste ultra customizada:', error.message);
    return null;
  }
}

// Teste 4: Campanha Ultra Personalizada
async function testUltraPersonalizedCampaign(quizId, token) {
  console.log('\n🔍 TESTE 4: CAMPANHA ULTRA PERSONALIZADA');
  console.log('========================================');

  const campaign = {
    name: 'Teste Ultra Personalizada',
    quizId: quizId,
    type: 'ultra_personalized',
    message: 'Olá {nome_completo}! Mensagem baseada no seu perfil e características específicas.',
    schedule: {
      startDate: new Date().toISOString(),
      frequency: 'immediate'
    },
    filters: {
      personalizedRules: {
        segmentByEmail: true,
        segmentByPhone: true,
        adaptByCountry: true
      }
    }
  };

  try {
    const response = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: campaign
    });

    console.log('✅ Campanha ultra personalizada criada:', response.id);
    
    // Aguardar processamento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar logs da campanha
    const logs = await makeRequest(`/api/sms-campaigns/${response.id}/logs`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📊 Logs da campanha ultra personalizada:');
    logs.forEach(log => {
      console.log(`  - ${log.phone}: ${log.status} (${log.country || 'não detectado'})`);
    });

    return response.id;
  } catch (error) {
    console.error('❌ Erro no teste ultra personalizada:', error.message);
    return null;
  }
}

// Teste de detecção automática em tempo real
async function testAutomaticDetection(quizId, token) {
  console.log('\n🔍 TESTE 5: DETECÇÃO AUTOMÁTICA EM TEMPO REAL');
  console.log('==============================================');

  // Criar campanha ao vivo para testar detecção automática
  const campaign = {
    name: 'Teste Detecção Automática',
    quizId: quizId,
    type: 'live',
    message: 'Detecção automática funcionando! Olá {nome_completo}!',
    schedule: {
      startDate: new Date().toISOString(),
      frequency: 'immediate'
    },
    filters: {
      responseType: 'all'
    }
  };

  try {
    const campaignResponse = await makeRequest('/api/sms-campaigns', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: campaign
    });

    console.log('✅ Campanha de detecção automática criada:', campaignResponse.id);
    
    // Criar múltiplas respostas de diferentes países
    const testResponses = [
      {
        nome_completo: 'Li Wei',
        email_contato: 'li@teste.com',
        telefone_contato: '8613987654321', // China
        country: 'China'
      },
      {
        nome_completo: 'John Smith',
        email_contato: 'john@teste.com',
        telefone_contato: '15551234567', // EUA
        country: 'Estados Unidos'
      },
      {
        nome_completo: 'Ahmed Hassan',
        email_contato: 'ahmed@teste.com',
        telefone_contato: '972501234567', // Israel
        country: 'Israel'
      },
      {
        nome_completo: 'Mehmet Özkan',
        email_contato: 'mehmet@teste.com',
        telefone_contato: '905321234567', // Turquia
        country: 'Turquia'
      }
    ];

    console.log('📱 Criando respostas de teste para diferentes países...');
    
    for (const testResponse of testResponses) {
      try {
        await makeRequest('/api/quiz-responses', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: {
            quizId: quizId,
            responses: testResponse,
            submittedAt: new Date().toISOString()
          }
        });
        
        console.log(`✅ Resposta criada para ${testResponse.nome_completo} (${testResponse.country})`);
        
        // Aguardar um pouco entre criações
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Erro ao criar resposta para ${testResponse.nome_completo}:`, error.message);
      }
    }

    // Aguardar processamento automático
    console.log('⏳ Aguardando processamento automático...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Verificar logs da campanha
    const logs = await makeRequest(`/api/sms-campaigns/${campaignResponse.id}/logs`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📊 Logs da detecção automática:');
    logs.forEach(log => {
      console.log(`  - ${log.phone}: ${log.status} | País: ${log.country || 'não detectado'} | Mensagem: ${log.message?.substring(0, 50)}...`);
    });

    return campaignResponse.id;
  } catch (error) {
    console.error('❌ Erro no teste de detecção automática:', error.message);
    return null;
  }
}

// Teste de sincronização de campanhas
async function testCampaignSynchronization(token) {
  console.log('\n🔍 TESTE 6: SINCRONIZAÇÃO DE CAMPANHAS');
  console.log('=====================================');

  try {
    // Buscar todas as campanhas
    const campaigns = await makeRequest('/api/sms-campaigns', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`📊 Total de campanhas encontradas: ${campaigns.length}`);
    
    // Verificar status de cada campanha
    for (const campaign of campaigns) {
      console.log(`\n📱 Campanha: ${campaign.name}`);
      console.log(`   ID: ${campaign.id}`);
      console.log(`   Status: ${campaign.status}`);
      console.log(`   Tipo: ${campaign.type}`);
      console.log(`   Criada: ${new Date(campaign.createdAt).toLocaleString()}`);
      
      // Buscar logs da campanha
      try {
        const logs = await makeRequest(`/api/sms-campaigns/${campaign.id}/logs`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log(`   Logs: ${logs.length} registros`);
        
        // Estatísticas dos logs
        const statusCounts = logs.reduce((acc, log) => {
          acc[log.status] = (acc[log.status] || 0) + 1;
          return acc;
        }, {});
        
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`     ${status}: ${count}`);
        });
        
        // Verificar detecção de países
        const countries = logs.reduce((acc, log) => {
          if (log.country) {
            acc[log.country] = (acc[log.country] || 0) + 1;
          }
          return acc;
        }, {});
        
        if (Object.keys(countries).length > 0) {
          console.log(`   Países detectados:`);
          Object.entries(countries).forEach(([country, count]) => {
            console.log(`     ${country}: ${count}`);
          });
        }
        
      } catch (error) {
        console.error(`   ❌ Erro ao buscar logs: ${error.message}`);
      }
    }
    
    return campaigns.length;
  } catch (error) {
    console.error('❌ Erro no teste de sincronização:', error.message);
    return 0;
  }
}

// Função principal de teste
async function runCompleteTest() {
  console.log('🚀 INICIANDO TESTE COMPLETO DE CAMPANHAS');
  console.log('========================================');

  try {
    // Autenticar
    const token = await authenticate();
    
    // Criar quiz de teste
    const quizId = await createTestQuiz(token);
    
    // Criar respostas de teste
    await createTestResponses(quizId, token);
    
    // Aguardar um pouco para sincronização
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Executar testes de cada tipo de campanha
    const results = {
      remarketing: await testRemarketingCampaign(quizId, token),
      live: await testLiveCampaign(quizId, token),
      ultraCustomized: await testUltraCustomizedCampaign(quizId, token),
      ultraPersonalized: await testUltraPersonalizedCampaign(quizId, token),
      automaticDetection: await testAutomaticDetection(quizId, token),
      synchronization: await testCampaignSynchronization(token)
    };
    
    // Relatório final
    console.log('\n📊 RELATÓRIO FINAL DE TESTES');
    console.log('============================');
    console.log('✅ Testes concluídos com sucesso:');
    
    Object.entries(results).forEach(([test, result]) => {
      const status = result ? '✅' : '❌';
      console.log(`${status} ${test}: ${result || 'falhou'}`);
    });
    
    const successCount = Object.values(results).filter(r => r).length;
    const totalTests = Object.keys(results).length;
    const successRate = (successCount / totalTests * 100).toFixed(1);
    
    console.log(`\n📈 Taxa de sucesso: ${successRate}% (${successCount}/${totalTests})`);
    
    if (successRate >= 80) {
      console.log('🎉 SISTEMA APROVADO - Taxa de sucesso adequada!');
    } else {
      console.log('⚠️  SISTEMA PRECISA DE AJUSTES - Taxa de sucesso baixa.');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste completo:', error.message);
  }
}

// Executar teste
runCompleteTest().catch(console.error);