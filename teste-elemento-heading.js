/**
 * TESTE COMPLETO - ELEMENTO HEADING
 * Testa inserção, propriedades, salvamento e renderização
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

async function testHeadingElement() {
  console.log('\n🧪 INICIANDO TESTE DO ELEMENTO HEADING');
  console.log('================================================');

  const testResults = {
    creation: false,
    properties: false,
    saving: false,
    preview: false,
    published: false
  };

  try {
    // 1. TESTE DE CRIAÇÃO DE QUIZ
    console.log('\n📝 1. Criando quiz para teste...');
    const { response: createResponse, data: quizData } = await makeRequest('/api/quizzes', {
      method: 'POST',
      body: {
        title: 'Teste Elemento Heading',
        description: 'Quiz para testar elemento heading',
        structure: {
          backgroundColor: '#ffffff',
          pages: [
            {
              id: 'page1',
              elements: [
                {
                  id: 'heading1',
                  type: 'heading',
                  content: 'Título de Teste H1',
                  properties: {
                    size: 'h1',
                    color: '#000000',
                    alignment: 'center',
                    fontWeight: 'bold'
                  }
                }
              ]
            }
          ]
        }
      }
    });

    if (createResponse.ok) {
      console.log('✅ Quiz criado com sucesso');
      console.log(`   📊 Quiz ID: ${quizData.id}`);
      testResults.creation = true;
    } else {
      console.log('❌ Erro ao criar quiz:', quizData.message);
      return testResults;
    }

    // 2. TESTE DE PROPRIEDADES - Atualizar elemento heading
    console.log('\n🔧 2. Testando propriedades do elemento heading...');
    const updatedQuiz = {
      ...quizData,
      structure: {
        ...quizData.structure,
        pages: [
          {
            id: 'page1',
            elements: [
              {
                id: 'heading1',
                type: 'heading',
                content: 'Título Atualizado H2',
                properties: {
                  size: 'h2',
                  color: '#ff0000',
                  alignment: 'left',
                  fontWeight: 'normal'
                }
              },
              {
                id: 'heading2',
                type: 'heading',
                content: 'Segundo Título H3',
                properties: {
                  size: 'h3',
                  color: '#00ff00',
                  alignment: 'right',
                  fontWeight: 'bold'
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
      console.log('   📊 Elemento 1: H2, vermelho, esquerda');
      console.log('   📊 Elemento 2: H3, verde, direita');
      testResults.properties = true;
    } else {
      console.log('❌ Erro ao atualizar propriedades:', updatedData.message);
    }

    // 3. TESTE DE SALVAMENTO - Verificar se dados foram salvos
    console.log('\n💾 3. Testando salvamento automático...');
    const { response: getResponse, data: savedQuiz } = await makeRequest(`/api/quizzes/${quizData.id}`);

    if (getResponse.ok && savedQuiz.structure && savedQuiz.structure.pages && savedQuiz.structure.pages[0].elements) {
      const elements = savedQuiz.structure.pages[0].elements;
      const heading1 = elements.find(el => el.id === 'heading1');
      const heading2 = elements.find(el => el.id === 'heading2');

      if (heading1 && heading2) {
        console.log('✅ Dados salvos corretamente');
        console.log(`   📊 Heading 1: ${heading1.content} (${heading1.properties.size})`);
        console.log(`   📊 Heading 2: ${heading2.content} (${heading2.properties.size})`);
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
      const headingElements = elements.filter(el => el.type === 'heading');

      if (headingElements.length === 2) {
        console.log('✅ Estrutura de preview válida');
        console.log(`   📊 ${headingElements.length} elementos heading encontrados`);
        
        headingElements.forEach((el, index) => {
          console.log(`   📊 Elemento ${index + 1}: ${el.content} (${el.properties.size}, ${el.properties.color})`);
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

    // 6. LIMPEZA - Deletar quiz de teste
    console.log('\n🧹 6. Limpando quiz de teste...');
    await makeRequest(`/api/quizzes/${quizData.id}`, {
      method: 'DELETE'
    });

  } catch (error) {
    console.log('❌ Erro durante o teste:', error.message);
  }

  return testResults;
}

async function main() {
  console.log('🧪 TESTE COMPLETO - ELEMENTO HEADING');
  console.log('====================================');

  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.log('❌ Falha na autenticação. Abortando teste.');
    return;
  }

  const results = await testHeadingElement();

  console.log('\n📊 RELATÓRIO FINAL - ELEMENTO HEADING');
  console.log('=====================================');
  console.log(`✅ Criação: ${results.creation ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Propriedades: ${results.properties ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Salvamento: ${results.saving ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Preview: ${results.preview ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Publicação: ${results.published ? 'PASSOU' : 'FALHOU'}`);

  const passedTests = Object.values(results).filter(r => r).length;
  const totalTests = Object.values(results).length;
  const successRate = (passedTests / totalTests * 100).toFixed(1);

  console.log(`\n🎯 TAXA DE SUCESSO: ${passedTests}/${totalTests} (${successRate}%)`);
  
  if (successRate === '100.0') {
    console.log('🎉 ELEMENTO HEADING: APROVADO PARA PRODUÇÃO');
  } else {
    console.log('⚠️ ELEMENTO HEADING: PRECISA DE CORREÇÕES');
  }
}

main().catch(console.error);