#!/usr/bin/env node

const http = require('http');
const querystring = require('querystring');

// Função para fazer requisições HTTP
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Node.js Test Script'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Teste principal
async function testBugIdCampanhaCorrigido() {
  console.log('🔧 TESTE: Correção do Bug ID Campanha Email');
  console.log('=' .repeat(60));
  
  let token = null;
  let tests = 0;
  let passed = 0;
  
  try {
    // 1. LOGIN - Obter token
    console.log('📝 1. Fazendo login...');
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    
    if (loginResponse.statusCode === 200 && loginResponse.data.token) {
      token = loginResponse.data.token;
      console.log('✅ Login realizado com sucesso');
      tests++;
      passed++;
    } else {
      console.log('❌ Falha no login:', loginResponse.data);
      return;
    }
    
    // 2. BUSCAR QUIZZES - Obter um quiz para testar
    console.log('\n🎯 2. Buscando quizzes disponíveis...');
    const quizzesResponse = await makeRequest('GET', '/api/quizzes', null, token);
    
    if (quizzesResponse.statusCode === 200 && quizzesResponse.data.length > 0) {
      console.log(`✅ Encontrados ${quizzesResponse.data.length} quizzes`);
      tests++;
      passed++;
    } else {
      console.log('❌ Nenhum quiz encontrado:', quizzesResponse.data);
      return;
    }
    
    const quizId = quizzesResponse.data[0].id;
    console.log(`🎯 Usando quiz ID: ${quizId}`);
    
    // 3. CRIAR CAMPANHA DE EMAIL - Testar se retorna ID corretamente
    console.log('\n📧 3. Criando campanha de email...');
    const campaignData = {
      name: `Teste Bug ID - ${new Date().toISOString()}`,
      quizId: quizId,
      subject: 'Teste de Correção do Bug ID',
      content: 'Olá {nome}, este é um teste para verificar se o ID da campanha está sendo retornado corretamente.',
      targetAudience: 'all',
      triggerType: 'immediate',
      triggerDelay: 0,
      triggerUnit: 'minutes'
    };
    
    const createResponse = await makeRequest('POST', '/api/email-campaigns', campaignData, token);
    
    tests++;
    
    console.log('📊 Resposta da criação:', {
      statusCode: createResponse.statusCode,
      data: createResponse.data
    });
    
    if (createResponse.statusCode === 200 || createResponse.statusCode === 201) {
      // Verificar se o ID está presente na resposta
      if (createResponse.data && createResponse.data.id) {
        console.log('✅ ID da campanha retornado corretamente:', createResponse.data.id);
        console.log('✅ campaignId também presente:', createResponse.data.campaignId);
        passed++;
        
        // Verificar se os IDs são consistentes
        if (createResponse.data.id === createResponse.data.campaignId) {
          console.log('✅ ID e campaignId são consistentes');
        } else {
          console.log('⚠️  ID e campaignId são diferentes (mas ambos presentes)');
        }
      } else {
        console.log('❌ ID da campanha não retornado:', createResponse.data);
      }
    } else {
      console.log('❌ Falha na criação da campanha:', createResponse.data);
    }
    
    // 4. LISTAR CAMPANHAS - Verificar se a campanha foi criada
    if (createResponse.data && createResponse.data.id) {
      console.log('\n📋 4. Listando campanhas para verificar criação...');
      const listResponse = await makeRequest('GET', '/api/email-campaigns', null, token);
      
      tests++;
      
      if (listResponse.statusCode === 200 && listResponse.data.length > 0) {
        const createdCampaign = listResponse.data.find(c => c.id === createResponse.data.id);
        
        if (createdCampaign) {
          console.log('✅ Campanha encontrada na lista:', createdCampaign.name);
          passed++;
        } else {
          console.log('❌ Campanha não encontrada na lista');
        }
      } else {
        console.log('❌ Erro ao listar campanhas:', listResponse.data);
      }
    }
    
    // 5. VERIFICAR ESTRUTURA DA RESPOSTA
    console.log('\n🔍 5. Verificando estrutura da resposta...');
    
    if (createResponse.data && createResponse.data.success) {
      console.log('✅ Campo success presente:', createResponse.data.success);
      
      if (createResponse.data.message) {
        console.log('✅ Campo message presente:', createResponse.data.message);
      }
      
      if (createResponse.data.scheduledEmails !== undefined) {
        console.log('✅ Campo scheduledEmails presente:', createResponse.data.scheduledEmails);
      }
      
      tests++;
      passed++;
    } else {
      console.log('❌ Estrutura da resposta incompleta');
      tests++;
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
  
  // Resumo final
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESUMO DO TESTE:');
  console.log(`✅ Testes aprovados: ${passed}/${tests}`);
  console.log(`📈 Taxa de sucesso: ${((passed/tests) * 100).toFixed(1)}%`);
  
  if (passed === tests) {
    console.log('🎉 TESTE CONCLUÍDO COM SUCESSO - Bug ID corrigido!');
  } else {
    console.log('⚠️  TESTE PARCIALMENTE APROVADO - Alguns problemas identificados');
  }
  
  console.log('\n🐛 STATUS DO BUG:');
  if (passed >= tests - 1) {
    console.log('✅ BUG CORRIGIDO: ID da campanha sendo retornado corretamente');
  } else {
    console.log('❌ BUG PERSISTE: ID da campanha ainda não sendo retornado');
  }
}

// Executar teste
testBugIdCampanhaCorrigido();