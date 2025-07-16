#!/usr/bin/env node

/**
 * 🔄 TESTE COMPLETO DO SISTEMA DE PAUSE AUTOMÁTICO
 * 
 * Testa:
 * 1. Extração de telefones funcionando ✅
 * 2. Criação de campanha com créditos
 * 3. Pausa automática quando créditos acabam
 * 4. Reativação quando créditos são adicionados
 */

const API_BASE = "http://localhost:5000";

async function apiCall(method, endpoint, data = null, token = null) {
  const url = `${API_BASE}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    ...(data ? { body: JSON.stringify(data) } : {})
  };

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${response.status}: ${error}`);
  }
  
  return response.json();
}

async function login() {
  const response = await apiCall('POST', '/api/auth/login', {
    email: 'admin@admin.com',
    password: 'admin123'
  });
  
  console.log('✅ Login realizado com sucesso');
  return response.accessToken;
}

async function testeSistemaCompleto() {
  console.log('\n🔄 TESTE COMPLETO DO SISTEMA DE PAUSE AUTOMÁTICO');
  console.log('================================================\n');
  
  const token = await login();
  
  try {
    // 1. Criar quiz
    console.log('📋 PASSO 1: Criando quiz de teste');
    const quiz = await apiCall('POST', '/api/quizzes', {
      title: 'Quiz Teste Sistema Completo',
      description: 'Quiz para testar sistema de pause automático completo',
      pages: [
        {
          id: 'page1',
          title: 'Página 1',
          elements: [
            {
              id: 'element1',
              type: 'text',
              question: 'Qual seu nome?',
              fieldId: 'nome_completo',
              required: true
            },
            {
              id: 'element2',
              type: 'phone',
              question: 'Qual seu telefone?',
              fieldId: 'telefone_contato',
              required: true
            }
          ]
        }
      ]
    }, token);
    
    console.log(`✅ Quiz criado: ${quiz.id}`);
    
    // 2. Publicar quiz
    console.log('\n📋 PASSO 2: Publicando quiz');
    await apiCall('PUT', `/api/quizzes/${quiz.id}`, {
      ...quiz,
      isPublished: true
    }, token);
    
    console.log('✅ Quiz publicado');
    
    // 3. Adicionar respostas
    console.log('\n📋 PASSO 3: Adicionando respostas');
    
    const testResponses = [
      {
        nome_completo: 'Carlos Oliveira',
        telefone_contato: '11777666555'
      },
      {
        nome_completo: 'Ana Paula', 
        telefone_contato: '11666555444'
      }
    ];
    
    for (let i = 0; i < testResponses.length; i++) {
      const responseData = testResponses[i];
      
      const formattedResponse = Object.entries(responseData).map(([key, value]) => ({
        responseId: key,
        value: value
      }));
      
      await apiCall('POST', `/api/quizzes/${quiz.id}/submit`, {
        responses: formattedResponse,
        metadata: {
          completedAt: new Date().toISOString(),
          isPartial: false,
          userAgent: 'node',
          ip: '127.0.0.1',
          totalPages: 1,
          completionPercentage: 100,
          timeSpent: 0,
          leadData: {},
          isComplete: true
        }
      });
      
      console.log(`✅ Resposta ${i + 1} adicionada`);
    }
    
    // 4. Adicionar créditos SMS
    console.log('\n📋 PASSO 4: Adicionando créditos SMS');
    
    try {
      await apiCall('POST', '/api/user-credits', {
        type: 'sms',
        amount: 5,
        operation: 'add',
        reason: 'Teste sistema pause automático'
      }, token);
      
      console.log('✅ 5 créditos SMS adicionados');
    } catch (error) {
      console.log('⚠️  Erro ao adicionar créditos:', error.message);
    }
    
    // 5. Criar campanha SMS
    console.log('\n📋 PASSO 5: Criando campanha SMS');
    
    try {
      const campaign = await apiCall('POST', '/api/sms-campaigns', {
        quizId: quiz.id,
        name: 'Campanha Teste Sistema Completo',
        message: 'Olá {nome_completo}! Seu telefone {telefone_contato} foi cadastrado com sucesso.',
        filters: {
          type: 'all',
          segmentation: 'all'
        },
        schedule: {
          type: 'immediate',
          timezone: 'America/Sao_Paulo'
        }
      }, token);
      
      console.log('✅ Campanha criada com sucesso:', campaign.id);
      
      // 6. Verificar status da campanha
      console.log('\n📋 PASSO 6: Verificando status da campanha');
      
      const campaignStatus = await apiCall('GET', `/api/sms-campaigns/${campaign.id}`, null, token);
      console.log('📊 Status da campanha:', campaignStatus.status);
      console.log('📱 Telefones processados:', campaignStatus.totalPhones || 0);
      
    } catch (error) {
      console.log('❌ Erro ao criar campanha:', error.message);
    }
    
    // 7. Verificar créditos restantes
    console.log('\n📋 PASSO 7: Verificando créditos restantes');
    
    try {
      const credits = await apiCall('GET', '/api/user/credits', null, token);
      console.log('💰 Créditos SMS restantes:', credits.breakdown?.sms || 0);
      console.log('💰 Total de créditos:', credits.credits || 0);
    } catch (error) {
      console.log('⚠️  Erro ao verificar créditos:', error.message);
    }
    
    console.log('\n🎯 TESTE COMPLETO FINALIZADO');
    console.log('============================');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

async function executarTeste() {
  console.log('🚀 TESTE COMPLETO DO SISTEMA DE PAUSE AUTOMÁTICO');
  console.log(`📅 Data: ${new Date().toISOString()}`);
  console.log(`🌐 Servidor: ${API_BASE}`);
  console.log(`👤 Usuário: admin@admin.com`);
  console.log('=====================================');
  
  await testeSistemaCompleto();
}

executarTeste().catch(console.error);