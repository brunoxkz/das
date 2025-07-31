/**
 * TESTE COMPLETO - ELEMENTO VIDEO
 * Testa inserção, propriedades, salvamento e renderização do elemento video
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

// Teste principal do elemento video
async function testVideoElement() {
  console.log('\n🧪 INICIANDO TESTE DO ELEMENTO VIDEO');
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
        title: 'Teste Elemento Video',
        description: 'Quiz para testar elemento video',
        structure: {
          backgroundColor: '#ffffff',
          pages: [
            {
              id: 'page1',
              elements: [
                {
                  id: 'video1',
                  type: 'video',
                  src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  platform: 'youtube',
                  properties: {
                    width: 560,
                    height: 315,
                    alignment: 'center',
                    autoplay: false,
                    controls: true,
                    muted: false
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

    // 2. TESTE DE PROPRIEDADES - Atualizar elemento video
    console.log('\n🔧 2. Testando propriedades do elemento video...');
    const updatedQuiz = {
      ...quizData,
      structure: {
        ...quizData.structure,
        pages: [
          {
            id: 'page1',
            elements: [
              {
                id: 'video1',
                type: 'video',
                src: 'https://vimeo.com/148751763',
                embedUrl: 'https://player.vimeo.com/video/148751763',
                platform: 'vimeo',
                properties: {
                  width: 640,
                  height: 360,
                  alignment: 'left',
                  autoplay: true,
                  controls: true,
                  muted: true
                }
              },
              {
                id: 'video2',
                type: 'video',
                src: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
                embedUrl: 'https://www.youtube.com/embed/M7lc1UVf-VE',
                platform: 'youtube',
                properties: {
                  width: 480,
                  height: 270,
                  alignment: 'right',
                  autoplay: false,
                  controls: false,
                  muted: false
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
      console.log('   📊 Elemento 1: Vimeo 640x360, esquerda, autoplay, muted');
      console.log('   📊 Elemento 2: YouTube 480x270, direita, sem autoplay');
      testResults.properties = true;
    } else {
      console.log('❌ Erro ao atualizar propriedades:', updatedData.message);
    }

    // 3. TESTE DE SALVAMENTO - Verificar se dados foram salvos
    console.log('\n💾 3. Testando salvamento automático...');
    const { response: getResponse, data: savedQuiz } = await makeRequest(`/api/quizzes/${quizData.id}`);

    if (getResponse.ok && savedQuiz.structure && savedQuiz.structure.pages && savedQuiz.structure.pages[0].elements) {
      const elements = savedQuiz.structure.pages[0].elements;
      const video1 = elements.find(el => el.id === 'video1');
      const video2 = elements.find(el => el.id === 'video2');

      if (video1 && video2) {
        console.log('✅ Dados salvos corretamente');
        console.log(`   📊 Video 1: ${video1.platform} ${video1.properties.width}x${video1.properties.height} (${video1.properties.alignment})`);
        console.log(`   📊 Video 2: ${video2.platform} ${video2.properties.width}x${video2.properties.height} (${video2.properties.alignment})`);
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
      const videoElements = elements.filter(el => el.type === 'video');

      if (videoElements.length === 2) {
        console.log('✅ Estrutura de preview válida');
        console.log(`   📊 ${videoElements.length} elementos video encontrados`);
        
        videoElements.forEach((el, index) => {
          console.log(`   📊 Elemento ${index + 1}: ${el.platform} ${el.properties.width}x${el.properties.height} (${el.properties.alignment})`);
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
        
        // Verificar se os vídeos têm URLs válidas
        const videoElements = publicData.structure.pages[0].elements.filter(el => el.type === 'video');
        videoElements.forEach((el, index) => {
          console.log(`   📊 Video ${index + 1}: ${el.platform} - ${el.embedUrl ? 'URL embed válida' : 'URL embed inválida'}`);
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
  console.log('🧪 TESTE COMPLETO - ELEMENTO VIDEO');
  console.log('===================================');

  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.log('❌ Falha na autenticação. Abortando teste.');
    return;
  }

  const results = await testVideoElement();

  console.log('\n📊 RELATÓRIO FINAL - ELEMENTO VIDEO');
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
    console.log('🎉 ELEMENTO VIDEO: APROVADO PARA PRODUÇÃO');
  } else {
    console.log('⚠️ ELEMENTO VIDEO: PRECISA DE CORREÇÕES');
  }
}

main().catch(console.error);