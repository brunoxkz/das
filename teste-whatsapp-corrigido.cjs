/**
 * TESTE ESPECÍFICO - CORREÇÃO WHATSAPP
 * Testa o canal WhatsApp com data correta
 */

const http = require('http');
const Database = require('better-sqlite3');
const path = require('path');

// Conectar ao banco de dados
const dbPath = path.join(__dirname, 'vendzz-database.db');
const db = new Database(dbPath);

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
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Função principal
async function testeWhatsAppCorrigido() {
  console.log('🔧 TESTE WHATSAPP CORRIGIDO - DATA VÁLIDA');
  console.log('==========================================');
  
  try {
    // Login
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@vendzz.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.accessToken || loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    
    console.log('✅ Login realizado com sucesso');
    
    // Restaurar créditos WhatsApp
    db.prepare('UPDATE users SET whatsappCredits = 500 WHERE id = ?').run(userId);
    console.log('✅ Créditos WhatsApp restaurados: 500');
    
    // Testar com data atual (não filtra nada)
    const dataAtual = new Date().toISOString().split('T')[0];
    
    console.log('\n🧪 TESTE 1: Sem filtro de data');
    const response1 = await makeRequest('POST', '/api/whatsapp-campaigns', {
      name: 'Teste WhatsApp Sem Data',
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
      messages: ['Teste WhatsApp sem filtro de data'],
      targetAudience: 'all'
    }, token);
    
    console.log(`Status: ${response1.status}`);
    if (response1.status === 200) {
      console.log('✅ Campanha criada SEM filtro de data');
    } else {
      console.log(`❌ Falha SEM filtro de data: ${response1.data.error}`);
    }
    
    console.log('\n🧪 TESTE 2: Com data atual');
    const response2 = await makeRequest('POST', '/api/whatsapp-campaigns', {
      name: 'Teste WhatsApp Com Data Atual',
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
      messages: ['Teste WhatsApp com data atual'],
      targetAudience: 'all',
      dateFilter: dataAtual
    }, token);
    
    console.log(`Status: ${response2.status}`);
    if (response2.status === 200) {
      console.log('✅ Campanha criada COM data atual');
    } else {
      console.log(`❌ Falha COM data atual: ${response2.data.error}`);
    }
    
    console.log('\n🧪 TESTE 3: Zerar créditos e testar validação');
    db.prepare('UPDATE users SET whatsappCredits = 0 WHERE id = ?').run(userId);
    
    const response3 = await makeRequest('POST', '/api/whatsapp-campaigns', {
      name: 'Teste WhatsApp Sem Créditos',
      quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
      messages: ['Teste WhatsApp sem créditos'],
      targetAudience: 'all'
    }, token);
    
    console.log(`Status: ${response3.status}`);
    if (response3.status === 402) {
      console.log('✅ Validação de créditos funcionando (HTTP 402)');
    } else {
      console.log(`❌ Validação de créditos falhou: Status ${response3.status}`);
    }
    
    console.log('\n📊 RESULTADO FINAL:');
    console.log(`- Sem filtro de data: ${response1.status === 200 ? 'PASSOU' : 'FALHOU'}`);
    console.log(`- Com data atual: ${response2.status === 200 ? 'PASSOU' : 'FALHOU'}`);
    console.log(`- Validação de créditos: ${response3.status === 402 ? 'PASSOU' : 'FALHOU'}`);
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    db.close();
    console.log('\n🔚 Teste concluído!');
  }
}

// Executar teste
testeWhatsAppCorrigido();