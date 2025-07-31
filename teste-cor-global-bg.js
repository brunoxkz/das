/**
 * TESTE - COR GLOBAL DE BACKGROUND
 * Testa se a cor global está sendo aplicada corretamente no preview e no quiz publicado
 */
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await axios({
      method: options.method || 'GET',
      url: `${BASE_URL}${endpoint}`,
      data: options.data,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Erro na requisição ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
}

async function authenticate() {
  console.log('🔐 Fazendo login...');
  const response = await makeRequest('/api/auth/login', {
    method: 'POST',
    data: {
      email: 'admin@vendzz.com',
      password: 'admin123'
    }
  });
  
  console.log('✅ Login realizado com sucesso');
  return response.token;
}

async function testCorGlobal() {
  try {
    // 1. Autenticação
    const token = await authenticate();
    
    // 2. Buscar quizzes
    console.log('📋 Buscando quizzes...');
    const quizzes = await makeRequest('/api/quizzes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (quizzes.length === 0) {
      console.log('❌ Nenhum quiz encontrado');
      return;
    }
    
    const quiz = quizzes[0];
    console.log(`✅ Quiz encontrado: ${quiz.title} (ID: ${quiz.id})`);
    
    // 3. Testar cor global definida
    const corTeste = "#FF5733"; // Cor laranja para teste
    console.log(`🎨 Definindo cor global: ${corTeste}`);
    
    const quizAtualizado = {
      ...quiz,
      globalBackgroundColor: corTeste
    };
    
    // 4. Salvar quiz com cor global
    console.log('💾 Salvando quiz com cor global...');
    await makeRequest(`/api/quizzes/${quiz.id}`, {
      method: 'PUT',
      data: quizAtualizado,
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // 5. Verificar se foi salvo
    console.log('🔍 Verificando se cor foi salva...');
    const quizVerificado = await makeRequest(`/api/quizzes/${quiz.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ RESULTADO DO TESTE:');
    console.log(`  - Quiz ID: ${quizVerificado.id}`);
    console.log(`  - Cor definida: ${corTeste}`);
    console.log(`  - Cor salva: ${quizVerificado.globalBackgroundColor}`);
    console.log(`  - Status: ${quizVerificado.globalBackgroundColor === corTeste ? '✅ SUCESSO' : '❌ FALHA'}`);
    
    // 6. Testar acesso público
    console.log('🌐 Testando acesso público...');
    const quizPublico = await makeRequest(`/api/quiz/${quiz.id}/public`);
    console.log(`  - Cor no quiz público: ${quizPublico.globalBackgroundColor}`);
    console.log(`  - Status público: ${quizPublico.globalBackgroundColor === corTeste ? '✅ SUCESSO' : '❌ FALHA'}`);
    
    console.log('\n📊 RESUMO FINAL:');
    console.log(`  ✅ Autenticação: OK`);
    console.log(`  ✅ Salvamento: ${quizVerificado.globalBackgroundColor === corTeste ? 'OK' : 'FALHA'}`);
    console.log(`  ✅ Público: ${quizPublico.globalBackgroundColor === corTeste ? 'OK' : 'FALHA'}`);
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Executar teste
testCorGlobal();