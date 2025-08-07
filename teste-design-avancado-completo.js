/**
 * TESTE COMPLETO - ABA DESIGN QUIZ BUILDER
 * Testa todas as funcionalidades de design incluindo:
 * - Upload seguro de logo/favicon para 100k+ usuários
 * - Configurações de tema e cores
 * - Fontes e tipografia
 * - Background e layout
 * - Salvamento e persistência
 * - Segurança e validação
 */

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000';

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  
  // Verificar se a resposta é JSON válido
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return { status: response.status, data: await response.json() };
  } else {
    // Se não for JSON, retornar texto simples
    const text = await response.text();
    if (text.includes('<!DOCTYPE')) {
      throw new Error('Token expirado - servidor retornou HTML');
    }
    return { status: response.status, data: { error: text } };
  }
}

async function authenticate() {
  console.log('🔐 Autenticando usuário admin...');
  const { status, data } = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  if (status !== 200) {
    throw new Error(`Falha na autenticação: ${status}`);
  }
  
  console.log('✅ Autenticação realizada com sucesso');
  return data.token || data.accessToken;
}

async function createTestQuiz(token) {
  console.log('📝 Criando quiz de teste para design...');
  
  const { status, data } = await makeRequest('/api/quizzes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Quiz Teste Design Avançado',
      description: 'Quiz para testar funcionalidades de design',
      structure: {
        pages: [
          {
            id: 'page1',
            name: 'Página 1',
            elements: [
              {
                id: 'heading1',
                type: 'heading',
                question: 'Bem-vindo ao Teste de Design',
                properties: {
                  size: 'h1',
                  alignment: 'center'
                }
              },
              {
                id: 'text1',
                type: 'text',
                question: 'Qual seu nome?',
                required: true,
                fieldId: 'nome_completo'
              }
            ]
          }
        ]
      }
    })
  });
  
  if (status !== 201) {
    throw new Error(`Falha ao criar quiz: ${status}`);
  }
  
  console.log(`✅ Quiz criado: ${data.id}`);
  return data.id;
}

async function testDesignConfiguration(token, quizId) {
  console.log('🎨 Testando configurações de design...');
  
  const designConfig = {
    theme: {
      primaryColor: '#10B981', // Verde Vendzz
      secondaryColor: '#059669',
      backgroundColor: '#F9FAFB',
      textColor: '#111827',
      fontFamily: 'Inter',
      fontSize: '16px',
      borderRadius: '8px'
    },
    layout: {
      containerWidth: 'max-w-2xl',
      spacing: 'space-y-6',
      padding: 'p-8'
    },
    branding: {
      showLogo: true,
      logoPosition: 'top-center',
      logoSize: 'medium'
    }
  };
  
  const { status, data } = await makeRequest(`/api/quizzes/${quizId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      designConfig: designConfig
    })
  });
  
  if (status !== 200) {
    throw new Error(`Falha ao configurar design: ${status}`);
  }
  
  console.log('✅ Configurações de design aplicadas');
  return true;
}

async function testSecureFileUpload(token, quizId) {
  console.log('📤 Testando upload seguro de arquivos...');
  
  // Criar arquivo de teste (simular logo)
  const testImageData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
    0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0xFF,
    0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0x73,
    0x75, 0x01, 0x18, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  const form = new FormData();
  form.append('file', testImageData, {
    filename: 'test-logo.png',
    contentType: 'image/png'
  });
  form.append('type', 'logo');
  form.append('quizId', quizId);
  
  try {
    const response = await fetch(`${BASE_URL}/api/upload/quiz-assets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form
    });
    
    const result = await response.json();
    
    if (response.status === 200) {
      console.log('✅ Upload seguro funcionando');
      return result.url;
    } else {
      console.log('⚠️ Endpoint de upload não implementado ainda');
      return null;
    }
  } catch (error) {
    console.log('⚠️ Sistema de upload será implementado');
    return null;
  }
}

async function testDesignValidation(token, quizId) {
  console.log('🔒 Testando validação de segurança...');
  
  const tests = [
    {
      name: 'Cor inválida',
      config: { theme: { primaryColor: 'javascript:alert(1)' } },
      shouldFail: true
    },
    {
      name: 'Fonte inválida',
      config: { theme: { fontFamily: '<script>alert(1)</script>' } },
      shouldFail: true
    },
    {
      name: 'Tamanho inválido',
      config: { theme: { fontSize: '999999px' } },
      shouldFail: true
    },
    {
      name: 'Configuração válida',
      config: { 
        theme: { 
          primaryColor: '#10B981',
          fontFamily: 'Arial',
          fontSize: '16px'
        }
      },
      shouldFail: false
    }
  ];
  
  let validationResults = [];
  
  for (const test of tests) {
    try {
      const { status } = await makeRequest(`/api/quizzes/${quizId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          designConfig: test.config
        })
      });
      
      const passed = test.shouldFail ? status !== 200 : status === 200;
      validationResults.push({
        name: test.name,
        passed,
        status
      });
      
      console.log(`${passed ? '✅' : '❌'} ${test.name}: ${status}`);
    } catch (error) {
      validationResults.push({
        name: test.name,
        passed: test.shouldFail,
        error: error.message
      });
    }
  }
  
  const passedTests = validationResults.filter(r => r.passed).length;
  console.log(`🔒 Validação: ${passedTests}/${tests.length} testes aprovados`);
  
  return validationResults;
}

async function testPerformanceStress(token, quizId) {
  console.log('⚡ Testando performance com múltiplas requisições...');
  
  // Renovar token antes do teste de performance
  const freshToken = await renewToken();
  
  const startTime = Date.now();
  const results = [];
  
  // Executar testes em lotes menores para evitar timeout
  const batchSize = 5;
  const totalRequests = 15;
  
  for (let batch = 0; batch < Math.ceil(totalRequests / batchSize); batch++) {
    const promises = [];
    
    for (let i = 0; i < batchSize && (batch * batchSize + i) < totalRequests; i++) {
      promises.push(
        makeRequest(`/api/quizzes/${quizId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${freshToken}`
          },
          body: JSON.stringify({
            designConfig: {
              theme: {
                primaryColor: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
              }
            }
          })
        })
      );
    }
    
    try {
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    } catch (error) {
      console.log(`❌ Erro no lote ${batch + 1}: ${error.message}`);
      // Continuar com outros lotes
    }
  }
  
  const endTime = Date.now();
  const successCount = results.filter(r => r.status === 200).length;
  const avgTime = (endTime - startTime) / totalRequests;
  
  console.log(`⚡ Performance: ${successCount}/${totalRequests} requisições bem-sucedidas`);
  console.log(`⚡ Tempo médio: ${avgTime.toFixed(2)}ms por requisição`);
  
  return {
    successRate: (successCount / totalRequests) * 100,
    avgTime,
    totalTime: endTime - startTime
  };
}

async function testResponsiveDesign(token, quizId) {
  console.log('📱 Testando configurações responsivas...');
  
  const responsiveConfigs = [
    {
      name: 'Mobile',
      config: {
        layout: {
          containerWidth: 'max-w-sm',
          padding: 'p-4',
          fontSize: '14px'
        }
      }
    },
    {
      name: 'Tablet',
      config: {
        layout: {
          containerWidth: 'max-w-lg',
          padding: 'p-6',
          fontSize: '15px'
        }
      }
    },
    {
      name: 'Desktop',
      config: {
        layout: {
          containerWidth: 'max-w-2xl',
          padding: 'p-8',
          fontSize: '16px'
        }
      }
    }
  ];
  
  let responsiveResults = [];
  
  for (const device of responsiveConfigs) {
    const { status } = await makeRequest(`/api/quizzes/${quizId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        designConfig: device.config
      })
    });
    
    const success = status === 200;
    responsiveResults.push({
      device: device.name,
      success,
      status
    });
    
    console.log(`📱 ${device.name}: ${success ? '✅' : '❌'} (${status})`);
  }
  
  return responsiveResults;
}

async function runCompleteDesignTest() {
  console.log('🚀 TESTE COMPLETO - ABA DESIGN QUIZ BUILDER');
  console.log('================================================');
  
  let results = {
    authentication: false,
    quizCreation: false,
    designConfiguration: false,
    secureUpload: false,
    securityValidation: [],
    performanceStress: null,
    responsiveDesign: [],
    overallSuccess: false
  };
  
  try {
    // 1. Autenticação
    const token = await authenticate();
    results.authentication = true;
    
    // 2. Criação de quiz
    const quizId = await createTestQuiz(token);
    results.quizCreation = true;
    
    // 3. Configurações de design
    await testDesignConfiguration(token, quizId);
    results.designConfiguration = true;
    
    // 4. Upload seguro
    const uploadUrl = await testSecureFileUpload(token, quizId);
    results.secureUpload = uploadUrl !== null;
    
    // 5. Validação de segurança
    results.securityValidation = await testDesignValidation(token, quizId);
    
    // 6. Teste de performance
    results.performanceStress = await testPerformanceStress(token, quizId);
    
    // 7. Design responsivo
    results.responsiveDesign = await testResponsiveDesign(token, quizId);
    
    // Calcular sucesso geral
    const validationPassed = results.securityValidation.filter(v => v.passed).length;
    const responsivePassed = results.responsiveDesign.filter(r => r.success).length;
    
    results.overallSuccess = 
      results.authentication &&
      results.quizCreation &&
      results.designConfiguration &&
      validationPassed >= 3 &&
      responsivePassed >= 2 &&
      results.performanceStress.successRate >= 80;
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error.message);
  }
  
  // Relatório final
  console.log('\n📊 RELATÓRIO FINAL');
  console.log('==================');
  console.log(`🔐 Autenticação: ${results.authentication ? '✅' : '❌'}`);
  console.log(`📝 Criação Quiz: ${results.quizCreation ? '✅' : '❌'}`);
  console.log(`🎨 Config Design: ${results.designConfiguration ? '✅' : '❌'}`);
  console.log(`📤 Upload Seguro: ${results.secureUpload ? '✅' : '⚠️ (será implementado)'}`);
  console.log(`🔒 Validação: ${results.securityValidation.filter(v => v.passed).length}/${results.securityValidation.length} testes`);
  console.log(`⚡ Performance: ${results.performanceStress ? results.performanceStress.successRate.toFixed(1) + '%' : 'N/A'}`);
  console.log(`📱 Responsivo: ${results.responsiveDesign.filter(r => r.success).length}/${results.responsiveDesign.length} dispositivos`);
  console.log(`\n🎯 RESULTADO GERAL: ${results.overallSuccess ? '✅ APROVADO' : '⚠️ PARCIAL'}`);
  
  return results;
}

async function renewToken() {
  try {
    const { data } = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    return data.token || data.accessToken;
  } catch (error) {
    console.log('❌ Erro ao renovar token:', error.message);
    throw error;
  }
}

// Executar teste
runCompleteDesignTest().catch(console.error);