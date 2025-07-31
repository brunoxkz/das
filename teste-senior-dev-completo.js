/**
 * TESTE SENIOR DEV - SISTEMA EMAIL MARKETING COMPLETO
 * Bateria de testes profissional para encontrar erros críticos
 * Author: Senior Developer
 */

async function makeRequest(endpoint, options = {}) {
  const url = `http://localhost:5000${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  let data;
  try {
    data = await response.json();
  } catch (e) {
    const text = await response.text();
    throw new Error(`Response is not JSON: ${text.substring(0, 200)}...`);
  }
  
  return { response, data };
}

async function authenticate() {
  const { response, data } = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vendzz.com',
      password: 'admin123'
    })
  });
  
  console.log(`🔐 AUTH DEBUG - Status: ${response.status}, Data: ${JSON.stringify(data)}`);
  
  if (!response.ok) {
    throw new Error(`Auth failed: ${data.error || data.message}`);
  }
  
  // Verificar se o token está presente
  if (!data.token && !data.accessToken) {
    throw new Error(`Token não encontrado na resposta: ${JSON.stringify(data)}`);
  }
  
  return data.token || data.accessToken;
}

async function testEmailCampaignSystem() {
  console.log('🧪 TESTE SENIOR DEV - SISTEMA EMAIL MARKETING COMPLETO');
  console.log('===========================================================');
  
  let token;
  try {
    token = await authenticate();
    console.log('✅ Autenticação realizada com sucesso');
  } catch (error) {
    console.log(`❌ ERRO CRÍTICO na autenticação: ${error.message}`);
    return;
  }
  
  const headers = { Authorization: `Bearer ${token}` };
  
  // 1. TESTE CRÍTICO: DEBUG DE AUTENTICAÇÃO
  console.log('\n🎯 1. TESTE CRÍTICO: DEBUG DE AUTENTICAÇÃO');
  if (token) {
    console.log(`🔑 Token: ${token.substring(0, 20)}...${token.substring(token.length-10)}`);
  } else {
    console.log('❌ ERRO: Token é undefined ou null');
    return;
  }
  
  // 2. TESTE CRÍTICO: Verificar se o token funciona com endpoint simples
  console.log('\n🎯 2. TESTE CRÍTICO: VERIFICANDO TOKEN COM ENDPOINT SIMPLES');
  try {
    const { response: testResponse, data: testData } = await makeRequest('/api/email-campaigns', {
      method: 'GET',
      headers
    });
    
    console.log(`📊 Status: ${testResponse.status}`);
    console.log(`📊 Data: ${JSON.stringify(testData)}`);
    
    if (testResponse.ok) {
      console.log('✅ Token funcionando corretamente');
    } else {
      console.log('❌ ERRO: Token não está funcionando');
      console.log(`❌ ERRO ESPECÍFICO: ${testData.error || testData.message}`);
      return;
    }
  } catch (error) {
    console.log(`❌ ERRO no teste de token: ${error.message}`);
    return;
  }
  
  // 3. TESTE CRÍTICO: Criar campanha com dados mínimos
  console.log('\n🎯 3. TESTE CRÍTICO: CRIANDO CAMPANHA COM DADOS MÍNIMOS');
  try {
    const campaignData = {
      name: 'TESTE SENIOR DEV - Email Real',
      quizId: 'Qm4wxpfPgkMrwoMhDFNLZ',
      subject: 'Teste Senior Dev - {{nome}}',
      content: 'Olá {{nome}}, este é um teste com email real para {{email}}',
      targetAudience: 'completed',
      triggerType: 'scheduled',
      triggerDelay: 1,
      triggerUnit: 'minutes'
    };
    
    console.log(`📊 Dados da campanha: ${JSON.stringify(campaignData, null, 2)}`);
    
    const { response: createResponse, data: createData } = await makeRequest('/api/email-campaigns', {
      method: 'POST',
      headers,
      body: JSON.stringify(campaignData)
    });
    
    console.log(`📊 Status resposta: ${createResponse.status}`);
    console.log(`📊 Data resposta: ${JSON.stringify(createData, null, 2)}`);
    
    if (createResponse.ok) {
      console.log(`✅ Campanha criada com sucesso`);
      
      // 4. TESTE CRÍTICO: Criar resposta com email real
      console.log('\n🎯 4. TESTE CRÍTICO: CRIANDO RESPOSTA COM EMAIL REAL');
      const { response: responseCreateResponse, data: responseCreateData } = await makeRequest('/api/quizzes/Qm4wxpfPgkMrwoMhDFNLZ/responses', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          responses: {
            nome: 'Bruno Tamaso',
            email: 'brunotamaso@gmail.com',
            telefone_principal: '11999887766',
            idade: '35'
          },
          metadata: {
            type: 'completed',
            isComplete: true,
            completionPercentage: 100,
            isPartial: false,
            completedAt: new Date().toISOString(),
            userAgent: 'senior-dev-test',
            ip: '127.0.0.1',
            totalPages: 4,
            timeSpent: 30000,
            leadData: {}
          }
        })
      });
      
      if (responseCreateResponse.ok) {
        console.log(`✅ Resposta criada com email real: ${responseCreateData.id}`);
        
        // Aguardar 2 segundos para garantir que o sistema processou
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 5. TESTE CRÍTICO: Verificar extração de emails
        console.log('\n🎯 5. TESTE CRÍTICO: VERIFICANDO EXTRAÇÃO DE EMAILS');
        const { response: emailsResponse, data: emailsData } = await makeRequest(`/api/quizzes/Qm4wxpfPgkMrwoMhDFNLZ/responses/emails`, {
          method: 'GET',
          headers
        });
        
        if (emailsResponse.ok) {
          console.log(`✅ ${emailsData.totalEmails} emails extraídos`);
          const hasBrunoEmail = emailsData.emails.some(email => email.email === 'brunotamaso@gmail.com');
          if (hasBrunoEmail) {
            console.log('✅ Email brunotamaso@gmail.com ENCONTRADO nos dados extraídos');
          } else {
            console.log('❌ ERRO: Email brunotamaso@gmail.com NÃO ENCONTRADO');
          }
        } else {
          console.log(`❌ ERRO na extração de emails: ${emailsData.error}`);
        }
        
        // 6. TESTE CRÍTICO: Iniciar campanha (onde ocorrem os erros)
        console.log('\n🎯 6. TESTE CRÍTICO: INICIANDO CAMPANHA (POTENCIAL ERRO)');
        try {
          const { response: startResponse, data: startData } = await makeRequest(`/api/email-campaigns/${createData.campaignId}/start`, {
            method: 'POST',
            headers
          });
          
          if (startResponse.ok) {
            console.log(`✅ Campanha iniciada com sucesso: ${startData.message}`);
            
            // Aguardar processamento
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // 7. TESTE CRÍTICO: Verificar logs para o email específico
            console.log('\n🎯 7. TESTE CRÍTICO: VERIFICANDO LOGS DO EMAIL ESPECÍFICO');
            const { response: logsResponse, data: logsData } = await makeRequest(`/api/email-logs?campaignId=${createData.campaignId}`, {
              method: 'GET',
              headers
            });
            
            if (logsResponse.ok) {
              console.log(`✅ ${logsData.length} logs encontrados`);
              
              const brunoLog = logsData.find(log => log.email === 'brunotamaso@gmail.com');
              if (brunoLog) {
                console.log('✅ LOG ENCONTRADO para brunotamaso@gmail.com:');
                console.log(`   Status: ${brunoLog.status}`);
                console.log(`   Assunto: ${brunoLog.personalizedSubject}`);
                console.log(`   Conteúdo: ${brunoLog.personalizedContent.substring(0, 100)}...`);
              } else {
                console.log('❌ ERRO: Nenhum log encontrado para brunotamaso@gmail.com');
              }
            } else {
              console.log(`❌ ERRO ao buscar logs: ${logsData.error}`);
            }
            
          } else {
            console.log(`❌ ERRO CRÍTICO ao iniciar campanha: ${startData.error}`);
          }
        } catch (error) {
          console.log(`❌ ERRO CRÍTICO no início da campanha: ${error.message}`);
        }
        
      } else {
        console.log(`❌ ERRO ao criar resposta: ${responseCreateData.error}`);
      }
      
    } else {
      console.log(`❌ ERRO ao criar campanha: ${createData.error || createData.message || 'Erro desconhecido'}`);
    }
    
  } catch (error) {
    console.log(`❌ ERRO CRÍTICO no sistema: ${error.message}`);
  }
  
  // 6. TESTE DE STRESS: Múltiplas operações simultâneas
  console.log('\n🎯 6. TESTE DE STRESS: MÚLTIPLAS OPERAÇÕES SIMULTÂNEAS');
  try {
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(makeRequest('/api/email-campaigns', {
        method: 'GET',
        headers
      }));
    }
    
    const results = await Promise.all(promises);
    const allSuccessful = results.every(({ response }) => response.ok);
    
    if (allSuccessful) {
      console.log('✅ Teste de stress: Todas as 5 requisições simultâneas foram bem-sucedidas');
    } else {
      console.log('❌ ERRO: Algumas requisições falharam no teste de stress');
    }
    
  } catch (error) {
    console.log(`❌ ERRO no teste de stress: ${error.message}`);
  }
  
  // 7. TESTE DE SEGURANÇA: Token inválido
  console.log('\n🎯 7. TESTE DE SEGURANÇA: TOKEN INVÁLIDO');
  try {
    const { response: securityResponse } = await makeRequest('/api/email-campaigns', {
      method: 'GET',
      headers: { Authorization: 'Bearer token-invalido' }
    });
    
    if (securityResponse.status === 401) {
      console.log('✅ Segurança: Token inválido corretamente rejeitado (401)');
    } else {
      console.log(`❌ ERRO DE SEGURANÇA: Token inválido aceito (${securityResponse.status})`);
    }
    
  } catch (error) {
    console.log(`❌ ERRO no teste de segurança: ${error.message}`);
  }
  
  console.log('\n🏁 TESTE SENIOR DEV FINALIZADO!');
  console.log('===========================================');
}

// Executar teste
testEmailCampaignSystem().catch(console.error);