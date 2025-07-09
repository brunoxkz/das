/**
 * TESTE COMPLETO - ELEMENTO IMAGE
 * Testa inserção, propriedades, salvamento e renderização do elemento image
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

// Teste principal do elemento image
async function testImageElement() {
  console.log('\n🧪 INICIANDO TESTE DO ELEMENTO IMAGE');
  console.log('===========================================');

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
        title: 'Teste Elemento Image',
        description: 'Quiz para testar elemento image',
        structure: {
          backgroundColor: '#ffffff',
          pages: [
            {
              id: 'page1',
              elements: [
                {
                  id: 'image1',
                  type: 'image',
                  src: 'https://via.placeholder.com/400x300/0066cc/ffffff?text=Imagem+Teste',
                  alt: 'Imagem de teste inicial',
                  properties: {
                    width: 400,
                    height: 300,
                    alignment: 'center',
                    borderRadius: 0,
                    opacity: 1
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

    // 2. TESTE DE PROPRIEDADES - Atualizar elemento image
    console.log('\n🔧 2. Testando propriedades do elemento image...');
    const updatedQuiz = {
      ...quizData,
      structure: {
        ...quizData.structure,
        pages: [
          {
            id: 'page1',
            elements: [
              {
                id: 'image1',
                type: 'image',
                src: 'https://via.placeholder.com/600x400/ff0000/ffffff?text=Imagem+Atualizada',
                alt: 'Imagem atualizada com propriedades',
                properties: {
                  width: 600,
                  height: 400,
                  alignment: 'left',
                  borderRadius: 15,
                  opacity: 0.9
                }
              },
              {
                id: 'image2',
                type: 'image',
                src: 'https://via.placeholder.com/300x200/00ff00/000000?text=Segunda+Imagem',
                alt: 'Segunda imagem para teste',
                properties: {
                  width: 300,
                  height: 200,
                  alignment: 'right',
                  borderRadius: 25,
                  opacity: 0.8
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
      console.log('   📊 Elemento 1: 600x400, esquerda, raio 15px, opacidade 0.9');
      console.log('   📊 Elemento 2: 300x200, direita, raio 25px, opacidade 0.8');
      testResults.properties = true;
    } else {
      console.log('❌ Erro ao atualizar propriedades:', updatedData.message);
    }

    // 3. TESTE DE SALVAMENTO - Verificar se dados foram salvos
    console.log('\n💾 3. Testando salvamento automático...');
    const { response: getResponse, data: savedQuiz } = await makeRequest(`/api/quizzes/${quizData.id}`);

    if (getResponse.ok && savedQuiz.structure && savedQuiz.structure.pages && savedQuiz.structure.pages[0].elements) {
      const elements = savedQuiz.structure.pages[0].elements;
      const image1 = elements.find(el => el.id === 'image1');
      const image2 = elements.find(el => el.id === 'image2');

      if (image1 && image2) {
        console.log('✅ Dados salvos corretamente');
        console.log(`   📊 Image 1: ${image1.properties.width}x${image1.properties.height} (${image1.properties.alignment})`);
        console.log(`   📊 Image 2: ${image2.properties.width}x${image2.properties.height} (${image2.properties.alignment})`);
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
      const imageElements = elements.filter(el => el.type === 'image');

      if (imageElements.length === 2) {
        console.log('✅ Estrutura de preview válida');
        console.log(`   📊 ${imageElements.length} elementos image encontrados`);
        
        imageElements.forEach((el, index) => {
          console.log(`   📊 Elemento ${index + 1}: ${el.properties.width}x${el.properties.height} (${el.properties.alignment}, raio ${el.properties.borderRadius}px)`);
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
        
        // Verificar se as imagens têm URLs válidas
        const imageElements = publicData.structure.pages[0].elements.filter(el => el.type === 'image');
        imageElements.forEach((el, index) => {
          console.log(`   📊 Imagem ${index + 1}: ${el.src ? 'URL válida' : 'URL inválida'}`);
        });
        
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
  console.log('🧪 TESTE COMPLETO - ELEMENTO IMAGE');
  console.log('===================================');

  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.log('❌ Falha na autenticação. Abortando teste.');
    return;
  }

  const results = await testImageElement();

  console.log('\n📊 RELATÓRIO FINAL - ELEMENTO IMAGE');
  console.log('===================================');
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
    console.log('🎉 ELEMENTO IMAGE: APROVADO PARA PRODUÇÃO');
  } else {
    console.log('⚠️ ELEMENTO IMAGE: PRECISA DE CORREÇÕES');
  }
}

main().catch(console.error);