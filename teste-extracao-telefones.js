#!/usr/bin/env node

/**
 * 🔍 TESTE ESPECÍFICO - EXTRAÇÃO DE TELEFONES
 * 
 * Este teste foca apenas na extração de telefones das respostas do quiz
 * para diagnosticar e corrigir o problema específico.
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

async function testeTelefoneExtraction() {
  console.log('\n🔍 TESTE DE EXTRAÇÃO DE TELEFONES');
  console.log('=====================================\n');
  
  const token = await login();
  
  try {
    // 1. Criar quiz de teste
    console.log('📋 PASSO 1: Criando quiz de teste');
    const quiz = await apiCall('POST', '/api/quizzes', {
      title: 'Quiz Teste Telefone',
      description: 'Quiz para testar extração de telefones',
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
    
    // 3. Adicionar respostas de teste
    console.log('\n📋 PASSO 3: Adicionando respostas de teste');
    
    const testResponses = [
      {
        nome_completo: 'João Silva',
        telefone_contato: '11999887766'
      },
      {
        nome_completo: 'Maria Santos', 
        telefone_contato: '11888776655'
      }
    ];
    
    for (let i = 0; i < testResponses.length; i++) {
      const responseData = testResponses[i];
      
      // Formato novo que o sistema espera
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
    
    // 4. Testar extração de telefones via campanha SMS
    console.log('\n📋 PASSO 4: Testando extração via campanha SMS');
    
    try {
      await apiCall('POST', '/api/sms-campaigns', {
        quizId: quiz.id,
        name: 'Teste Extração Telefones',
        message: 'Olá {nome_completo}! Seu telefone {telefone_contato} foi cadastrado.',
        filters: {
          type: 'all',
          segmentation: 'all'
        },
        schedule: {
          type: 'immediate',
          timezone: 'America/Sao_Paulo'
        }
      }, token);
      
      console.log('❌ ERRO: Deveria ter falhado por falta de créditos, mas passou');
      
    } catch (error) {
      if (error.message.includes('Nenhum telefone válido encontrado')) {
        console.log('❌ PROBLEMA CONFIRMADO: Extração de telefones não funciona');
        console.log('   Mensagem:', error.message);
      } else if (error.message.includes('Créditos SMS insuficientes')) {
        console.log('✅ SUCESSO: Telefones extraídos corretamente!');
        console.log('   Falha por falta de créditos (comportamento esperado)');
      } else {
        console.log('⚠️  ERRO INESPERADO:', error.message);
      }
    }
    
    console.log('\n🔍 DIAGNÓSTICO COMPLETO');
    console.log('======================');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

async function executarTeste() {
  console.log('🚀 TESTE ESPECÍFICO DE EXTRAÇÃO DE TELEFONES');
  console.log(`📅 Data: ${new Date().toISOString()}`);
  console.log(`🌐 Servidor: ${API_BASE}`);
  console.log(`👤 Usuário: admin@admin.com`);
  console.log('=====================================');
  
  await testeTelefoneExtraction();
}

executarTeste().catch(console.error);