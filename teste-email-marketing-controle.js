/**
 * TESTE COMPLETO DO SISTEMA DE CONTROLE DE CAMPANHAS EMAIL MARKETING
 * Validação das funcionalidades implementadas: start, pause, delete, logs
 * Author: Dev Senior
 */

async function makeRequest(endpoint, options = {}) {
  const url = `http://localhost:5000${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return { response, data };
  } catch (error) {
    console.error(`❌ Erro na requisição ${endpoint}:`, error.message);
    return { response: null, data: { error: error.message } };
  }
}

async function authenticate() {
  const { response, data } = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });

  if (response && response.ok) {
    return data.token || data.accessToken;
  }
  throw new Error('Falha na autenticação');
}

async function testEmailCampaignControls() {
  console.log("🔥 TESTE COMPLETO - CONTROLES DE CAMPANHAS EMAIL MARKETING\n");

  try {
    // 1. Autenticação
    console.log("🔐 1. AUTENTICANDO...");
    const token = await authenticate();
    console.log("✅ Autenticado com sucesso");

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Criar campanha de teste
    console.log("\n📧 2. CRIANDO CAMPANHA DE TESTE...");
    const campaignData = {
      name: 'Teste Controle Email Marketing',
      quizId: 'Qm4wxpfPgkMrwoMhDFNLZ',
      subject: 'Teste {nome}',
      content: 'Olá {nome}, este é um teste!',
      targetAudience: 'all',
      triggerType: 'delayed',
      triggerDelay: 10,
      triggerUnit: 'minutes',
      fromDate: '2025-07-01'
    };

    const { response: createResponse, data: createData } = await makeRequest('/api/email-campaigns', {
      method: 'POST',
      headers,
      body: JSON.stringify(campaignData)
    });

    if (createResponse && createResponse.ok) {
      console.log("✅ Campanha criada com sucesso");
      console.log(`   ID: ${createData.campaignId}`);
      console.log(`   Status: ${createData.status}`);
    } else {
      console.log(`❌ Erro ao criar campanha: ${createData.error || createData.message}`);
      return;
    }

    const testCampaign = { id: createData.campaignId };

    // 3. Pausar campanha
    console.log("\n⏸️ 3. TESTANDO PAUSAR CAMPANHA...");
    const { response: pauseResponse, data: pauseData } = await makeRequest(`/api/email-campaigns/${testCampaign.id}/pause`, {
      method: 'POST',
      headers
    });

    if (pauseResponse && pauseResponse.ok) {
      console.log("✅ Campanha pausada com sucesso");
      console.log(`   Status: ${pauseData.status}`);
    } else {
      console.log(`❌ Erro ao pausar campanha: ${pauseData.error || pauseData.message}`);
    }

    // 4. Testar logs da campanha
    console.log("\n📊 4. TESTANDO LOGS DA CAMPANHA...");
    const { response: logsResponse, data: logsData } = await makeRequest(`/api/email-campaigns/${testCampaign.id}/logs`, {
      method: 'GET',
      headers
    });

    if (logsResponse && logsResponse.ok) {
      console.log("✅ Logs obtidos com sucesso");
      console.log(`   Total de logs: ${Array.isArray(logsData) ? logsData.length : 0}`);
    } else {
      console.log(`❌ Erro ao obter logs: ${logsData.error || logsData.message}`);
    }

    // 5. Deletar campanha
    console.log("\n🗑️ 5. TESTANDO DELETAR CAMPANHA...");
    const { response: deleteResponse, data: deleteData } = await makeRequest(`/api/email-campaigns/${testCampaign.id}`, {
      method: 'DELETE',
      headers
    });

    if (deleteResponse && deleteResponse.ok) {
      console.log("✅ Campanha deletada com sucesso");
      console.log(`   Mensagem: ${deleteData.message}`);
    } else {
      console.log(`❌ Erro ao deletar campanha: ${deleteData.error || deleteData.message}`);
    }

    // 6. Testar também o endpoint alternativo de delete
    console.log("\n🗑️ 6. TESTANDO ENDPOINT ALTERNATIVO DE DELETE...");
    
    // Primeiro criar outra campanha para testar o endpoint alternativo
    const { response: createResponse2, data: createData2 } = await makeRequest('/api/email-campaigns', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...campaignData,
        name: 'Teste Delete Alternativo'
      })
    });

    if (createResponse2 && createResponse2.ok) {
      const testCampaign2 = { id: createData2.campaignId };
      
      const { response: deleteResponse2, data: deleteData2 } = await makeRequest(`/api/email-campaigns/${testCampaign2.id}/delete`, {
        method: 'DELETE',
        headers
      });

      if (deleteResponse2 && deleteResponse2.ok) {
        console.log("✅ Campanha deletada com endpoint alternativo");
        console.log(`   Mensagem: ${deleteData2.message}`);
      } else {
        console.log(`❌ Erro no endpoint alternativo: ${deleteData2.error || deleteData2.message}`);
      }
    }

    console.log("\n🎉 TESTE DE CONTROLES CONCLUÍDO!");

  } catch (error) {
    console.error("❌ ERRO GERAL:", error.message);
  }
}

// Executar
testEmailCampaignControls();