/**
 * TESTE COMPLETO - ELEMENTO MULTIPLE CHOICE
 * Testa inserção, propriedades, salvamento, renderização E CAPTURA DE VARIÁVEIS
 */

import fetch from 'node-fetch';

// Configuração
const BASE_URL = 'http://localhost:5000';
let authToken = null;

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    },
    ...options
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const data = await response.json();
  
  return { response, data };
}

async function authenticate() {
  console.log('🔐 Autenticando usuário...');
  const { response, data } = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: {
      email: 'admin@vendzz.com',
      password: 'admin123'
    }
  });

  if (response.ok) {
    authToken = data.token || data.accessToken;
    console.log('✅ Autenticação bem-sucedida');
    return true;
  } else {
    console.log('❌ Erro na autenticação:', data.message);
    return false;
  }
}

// Teste principal do elemento multiple choice
async function testMultipleChoiceElement() {
  console.log('\n🧪 INICIANDO TESTE DO ELEMENTO MULTIPLE CHOICE');
  console.log('==================================================');

  const testResults = {
    creation: false,
    properties: false,
    saving: false,
    preview: false,
    published: false,
    variableCapture: false
  };

  try {
    // 1. TESTE DE CRIAÇÃO DE QUIZ
    console.log('\n📝 1. Criando quiz para teste...');
    const { response: createResponse, data: quizData } = await makeRequest('/api/quizzes', {
      method: 'POST',
      body: {
        title: 'Teste Elemento Multiple Choice',
        description: 'Quiz para testar elemento multiple choice e captura de variáveis',
        structure: {
          backgroundColor: '#ffffff',
          pages: [
            {
              id: 'page1',
              elements: [
                {
                  id: 'mc1',
                  type: 'multiple_choice',
                  content: 'Qual sua cor favorita?',
                  fieldId: 'cor_favorita',
                  options: ['Azul', 'Verde', 'Vermelho', 'Amarelo'],
                  properties: {
                    required: true,
                    allowMultiple: false,
                    randomizeOptions: false,
                    fontSize: 16,
                    color: '#000000'
                  }
                }
              ]
            }
          ]
        }
      }
    });

    if (createResponse.ok && quizData.id) {
      console.log('✅ Quiz criado com sucesso');
      console.log(`   📊 Quiz ID: ${quizData.id}`);
      testResults.creation = true;
    } else {
      console.log('❌ Erro ao criar quiz:', quizData.message);
      return testResults;
    }

    // 2. TESTE DE PROPRIEDADES - Atualizar elemento multiple choice
    console.log('\n🔧 2. Testando propriedades do elemento multiple choice...');
    const updatedQuiz = {
      ...quizData,
      structure: {
        ...quizData.structure,
        pages: [
          {
            id: 'page1',
            elements: [
              {
                id: 'mc1',
                type: 'multiple_choice',
                content: 'Qual sua cor favorita?',
                fieldId: 'cor_favorita',
                options: ['Azul', 'Verde', 'Vermelho', 'Amarelo'],
                properties: {
                  required: true,
                  allowMultiple: false,
                  randomizeOptions: false,
                  fontSize: 18,
                  color: '#ff0000'
                }
              },
              {
                id: 'mc2',
                type: 'multiple_choice',
                content: 'Quais esportes você pratica?',
                fieldId: 'esportes_praticados',
                options: ['Futebol', 'Basquete', 'Tennis', 'Natação', 'Corrida'],
                properties: {
                  required: false,
                  allowMultiple: true,
                  randomizeOptions: true,
                  fontSize: 16,
                  color: '#00ff00'
                }
              },
              {
                id: 'mc3',
                type: 'multiple_choice',
                content: 'Qual sua idade?',
                fieldId: 'faixa_etaria',
                options: ['18-25', '26-35', '36-45', '46-55', '55+'],
                properties: {
                  required: true,
                  allowMultiple: false,
                  randomizeOptions: false,
                  fontSize: 14,
                  color: '#0000ff'
                }
              }
            ]
          }
        ]
      }
    };

    const { response: updateResponse, data: updatedData } = await makeRequest(`/api/quizzes/${quizData.id}`, {
      method: 'PUT',
      body: updatedQuiz
    });

    if (updateResponse.ok) {
      console.log('✅ Propriedades atualizadas com sucesso');
      console.log('   📊 MC1: cor_favorita (único, obrigatório)');
      console.log('   📊 MC2: esportes_praticados (múltiplo, opcional)');
      console.log('   📊 MC3: faixa_etaria (único, obrigatório)');
      testResults.properties = true;
    } else {
      console.log('❌ Erro ao atualizar propriedades:', updatedData.message);
    }

    // 3. TESTE DE SALVAMENTO - Verificar se dados foram salvos
    console.log('\n💾 3. Testando salvamento automático...');
    const { response: getResponse, data: savedQuiz } = await makeRequest(`/api/quizzes/${quizData.id}`);

    if (getResponse.ok && savedQuiz.structure && savedQuiz.structure.pages && savedQuiz.structure.pages[0].elements) {
      const elements = savedQuiz.structure.pages[0].elements;
      const mc1 = elements.find(el => el.id === 'mc1');
      const mc2 = elements.find(el => el.id === 'mc2');
      const mc3 = elements.find(el => el.id === 'mc3');

      if (mc1 && mc2 && mc3) {
        console.log('✅ Dados salvos corretamente');
        console.log(`   📊 MC1: ${mc1.fieldId} - ${mc1.options.length} opções`);
        console.log(`   📊 MC2: ${mc2.fieldId} - ${mc2.options.length} opções (múltiplo)`);
        console.log(`   📊 MC3: ${mc3.fieldId} - ${mc3.options.length} opções`);
        testResults.saving = true;
      } else {
        console.log('❌ Elementos não encontrados no quiz salvo');
      }
    } else {
      console.log('❌ Erro ao recuperar quiz salvo:', savedQuiz.message);
    }

    // 4. TESTE DE PREVIEW - Verificar estrutura para preview
    console.log('\n👁️ 4. Testando estrutura para preview...');
    if (savedQuiz.structure && savedQuiz.structure.pages && savedQuiz.structure.pages[0].elements) {
      const elements = savedQuiz.structure.pages[0].elements;
      const mcElements = elements.filter(el => el.type === 'multiple_choice');

      if (mcElements.length === 3) {
        console.log('✅ Estrutura de preview válida');
        console.log(`   📊 ${mcElements.length} elementos multiple choice encontrados`);
        
        mcElements.forEach((el, index) => {
          console.log(`   📊 Elemento ${index + 1}: ${el.fieldId} - ${el.options.length} opções`);
        });
        
        testResults.preview = true;
      } else {
        console.log('❌ Estrutura de preview inválida');
      }
    }

    // 5. TESTE DE PUBLICAÇÃO
    console.log('\n🌐 5. Testando publicação do quiz...');
    const { response: publishResponse, data: publishData } = await makeRequest(`/api/quizzes/${quizData.id}/publish`, {
      method: 'POST'
    });

    if (publishResponse.ok) {
      console.log('✅ Quiz publicado com sucesso');
      
      // Verificar se o quiz público carrega corretamente
      const { response: publicResponse, data: publicData } = await makeRequest(`/api/quiz/${quizData.id}/public`);
      
      if (publicResponse.ok && publicData.structure && publicData.structure.pages) {
        console.log('✅ Quiz público carregado corretamente');
        console.log(`   📊 Título: ${publicData.title}`);
        console.log(`   📊 Páginas: ${publicData.structure.pages.length}`);
        console.log(`   📊 Elementos: ${publicData.structure.pages[0].elements.length}`);
        
        testResults.published = true;
      } else {
        console.log('❌ Erro ao carregar quiz público');
        if (publicData.message) {
          console.log(`   📊 Mensagem: ${publicData.message}`);
        }
      }
    } else {
      console.log('❌ Erro ao publicar quiz:', publishData.message);
    }

    // 6. TESTE DE CAPTURA DE VARIÁVEIS - Simular resposta e verificar variáveis
    console.log('\n🔍 6. Testando captura de variáveis automática...');
    
    // Simular resposta ao quiz
    const mockResponse = {
      quizId: quizData.id,
      responses: {
        cor_favorita: 'Verde',
        esportes_praticados: ['Futebol', 'Natação'],
        faixa_etaria: '26-35'
      },
      metadata: {
        isComplete: true,
        isPartial: false,
        completionPercentage: 100,
        startTime: Date.now() - 120000, // 2 minutos atrás
        endTime: Date.now()
      }
    };

    const { response: responseSubmit, data: responseData } = await makeRequest('/api/quiz-responses', {
      method: 'POST',
      body: mockResponse
    });

    if (responseSubmit.ok) {
      console.log('✅ Resposta simulada submetida com sucesso');
      console.log(`   📊 Response ID: ${responseData.id}`);
      
      // Verificar se as variáveis foram capturadas
      const { response: varsResponse, data: varsData } = await makeRequest(`/api/quizzes/${quizData.id}/variables`);
      
      if (varsResponse.ok && varsData.variables && varsData.variables.length > 0) {
        console.log('✅ Variáveis capturadas automaticamente');
        console.log(`   📊 Total de variáveis: ${varsData.variables.length}`);
        
        varsData.variables.forEach((variable, index) => {
          console.log(`   📊 Variável ${index + 1}: ${variable}`);
        });
        
        // Verificar se as variáveis específicas foram capturadas
        const hasCorFavorita = varsData.variables.includes('cor_favorita');
        const hasEsportes = varsData.variables.includes('esportes_praticados');
        const hasIdade = varsData.variables.includes('faixa_etaria');
        
        if (hasCorFavorita && hasEsportes && hasIdade) {
          console.log('✅ Todas as variáveis do multiple choice foram capturadas');
          console.log(`   📊 cor_favorita: disponível para citação`);
          console.log(`   📊 esportes_praticados: disponível para citação`);
          console.log(`   📊 faixa_etaria: disponível para citação`);
          testResults.variableCapture = true;
        } else {
          console.log('❌ Nem todas as variáveis foram capturadas');
          console.log(`   📊 Faltando: ${!hasCorFavorita ? 'cor_favorita ' : ''}${!hasEsportes ? 'esportes_praticados ' : ''}${!hasIdade ? 'faixa_etaria ' : ''}`);
        }
      } else {
        console.log('❌ Erro ao recuperar variáveis capturadas');
        console.log(`   📊 Resposta: ${JSON.stringify(varsData)}`);
      }
    } else {
      console.log('❌ Erro ao submeter resposta simulada:', responseData.message);
    }

    // 7. LIMPEZA - Deletar quiz de teste
    console.log('\n🧹 7. Limpando quiz de teste...');
    await makeRequest(`/api/quizzes/${quizData.id}`, {
      method: 'DELETE'
    });

  } catch (error) {
    console.log('❌ Erro durante o teste:', error.message);
  }

  return testResults;
}

async function main() {
  console.log('🧪 TESTE COMPLETO - ELEMENTO MULTIPLE CHOICE');
  console.log('=============================================');

  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.log('❌ Falha na autenticação. Abortando teste.');
    return;
  }

  const results = await testMultipleChoiceElement();

  console.log('\n📊 RELATÓRIO FINAL - ELEMENTO MULTIPLE CHOICE');
  console.log('=============================================');
  console.log(`✅ Criação: ${results.creation ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Propriedades: ${results.properties ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Salvamento: ${results.saving ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Preview: ${results.preview ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Publicação: ${results.published ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Captura de Variáveis: ${results.variableCapture ? 'PASSOU' : 'FALHOU'}`);

  const passedTests = Object.values(results).filter(r => r).length;
  const totalTests = Object.values(results).length;
  const successRate = (passedTests / totalTests * 100).toFixed(1);

  console.log(`\n🎯 TAXA DE SUCESSO: ${passedTests}/${totalTests} (${successRate}%)`);
  
  if (successRate === '100.0') {
    console.log('🎉 ELEMENTO MULTIPLE CHOICE: APROVADO PARA PRODUÇÃO');
  } else {
    console.log('⚠️ ELEMENTO MULTIPLE CHOICE: PRECISA DE CORREÇÕES');
  }
}

main().catch(console.error);