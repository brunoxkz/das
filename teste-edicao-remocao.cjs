const { execSync } = require('child_process');

// Teste específico para edição e remoção de mensagens rotativas
async function testarEdicaoRemocao() {
  console.log('🧪 TESTE ESPECÍFICO: EDIÇÃO E REMOÇÃO DE MENSAGENS');
  console.log('=' .repeat(50));
  
  const baseUrl = 'http://localhost:5000';
  let totalTestes = 0;
  let testesPassaram = 0;
  
  // Função auxiliar para fazer requests
  async function request(method, url, data = null) {
    const fetch = (await import('node-fetch')).default;
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (data) options.body = JSON.stringify(data);
    
    const response = await fetch(`${baseUrl}${url}`, options);
    return { status: response.status, data: await response.json() };
  }
  
  let messageId = null;
  
  // Teste 1: Adicionar mensagem para teste
  try {
    totalTestes++;
    console.log('\n1. ➕ Adicionando mensagem para teste...');
    const newMessage = {
      title: '🧪 Teste Edição',
      message: 'Mensagem original para teste de edição'
    };
    
    const addResult = await request('POST', '/api/admin/push-messages', newMessage);
    
    if (addResult.status === 200 && addResult.data.success) {
      messageId = addResult.data.message.id;
      console.log(`✅ Mensagem criada: ID ${messageId}`);
      testesPassaram++;
    } else {
      console.log(`❌ Falha ao criar mensagem: ${addResult.status}`);
      console.log(`   Erro: ${JSON.stringify(addResult.data)}`);
    }
  } catch (error) {
    console.log(`❌ Erro ao criar mensagem: ${error.message}`);
  }
  
  // Teste 2: Verificar se mensagem foi criada
  if (messageId) {
    try {
      totalTestes++;
      console.log('\n2. 🔍 Verificando se mensagem foi criada...');
      const config = await request('GET', '/api/admin/push-config');
      
      if (config.status === 200) {
        const foundMessage = config.data.messages?.find(m => m.id === messageId);
        if (foundMessage) {
          console.log(`✅ Mensagem encontrada: "${foundMessage.title}"`);
          testesPassaram++;
        } else {
          console.log(`❌ Mensagem não encontrada na lista`);
        }
      } else {
        console.log(`❌ Erro ao buscar configuração: ${config.status}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar mensagem: ${error.message}`);
    }
  }
  
  // Teste 3: Editar mensagem
  if (messageId) {
    try {
      totalTestes++;
      console.log('\n3. ✏️ Editando mensagem...');
      const updatedMessage = {
        title: '🔄 Teste Editado',
        message: 'Mensagem editada com sucesso!'
      };
      
      const editResult = await request('PUT', `/api/admin/push-messages/${messageId}`, updatedMessage);
      
      if (editResult.status === 200 && editResult.data.success) {
        console.log(`✅ Mensagem editada com sucesso`);
        testesPassaram++;
      } else {
        console.log(`❌ Falha ao editar mensagem: ${editResult.status}`);
        console.log(`   Erro: ${JSON.stringify(editResult.data)}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao editar mensagem: ${error.message}`);
    }
  }
  
  // Teste 4: Verificar se edição foi aplicada
  if (messageId) {
    try {
      totalTestes++;
      console.log('\n4. 🔍 Verificando se edição foi aplicada...');
      const config = await request('GET', '/api/admin/push-config');
      
      if (config.status === 200) {
        const foundMessage = config.data.messages?.find(m => m.id === messageId);
        if (foundMessage && foundMessage.title === '🔄 Teste Editado') {
          console.log(`✅ Edição aplicada: "${foundMessage.title}"`);
          console.log(`   Nova mensagem: "${foundMessage.message}"`);
          testesPassaram++;
        } else {
          console.log(`❌ Edição não foi aplicada`);
          console.log(`   Encontrado: ${foundMessage ? foundMessage.title : 'mensagem não encontrada'}`);
        }
      } else {
        console.log(`❌ Erro ao verificar edição: ${config.status}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar edição: ${error.message}`);
    }
  }
  
  // Teste 5: Ativar/desativar mensagem
  if (messageId) {
    try {
      totalTestes++;
      console.log('\n5. 🔄 Testando ativar/desativar mensagem...');
      const toggleResult = await request('PUT', `/api/admin/push-messages/${messageId}`, { active: false });
      
      if (toggleResult.status === 200 && toggleResult.data.success) {
        console.log(`✅ Status alterado com sucesso`);
        testesPassaram++;
      } else {
        console.log(`❌ Falha ao alterar status: ${toggleResult.status}`);
        console.log(`   Erro: ${JSON.stringify(toggleResult.data)}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao alterar status: ${error.message}`);
    }
  }
  
  // Teste 6: Remover mensagem
  if (messageId) {
    try {
      totalTestes++;
      console.log('\n6. 🗑️ Removendo mensagem...');
      const deleteResult = await request('DELETE', `/api/admin/push-messages/${messageId}`);
      
      if (deleteResult.status === 200 && deleteResult.data.success) {
        console.log(`✅ Mensagem removida com sucesso`);
        testesPassaram++;
      } else {
        console.log(`❌ Falha ao remover mensagem: ${deleteResult.status}`);
        console.log(`   Erro: ${JSON.stringify(deleteResult.data)}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao remover mensagem: ${error.message}`);
    }
  }
  
  // Teste 7: Verificar se mensagem foi removida
  if (messageId) {
    try {
      totalTestes++;
      console.log('\n7. 🔍 Verificando se mensagem foi removida...');
      const config = await request('GET', '/api/admin/push-config');
      
      if (config.status === 200) {
        const foundMessage = config.data.messages?.find(m => m.id === messageId);
        if (!foundMessage) {
          console.log(`✅ Mensagem removida da lista`);
          testesPassaram++;
        } else {
          console.log(`❌ Mensagem ainda existe na lista`);
        }
      } else {
        console.log(`❌ Erro ao verificar remoção: ${config.status}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar remoção: ${error.message}`);
    }
  }
  
  // Resultado final
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RESULTADO DO TESTE DE EDIÇÃO/REMOÇÃO');
  console.log('=' .repeat(50));
  console.log(`✅ Testes Passaram: ${testesPassaram}/${totalTestes}`);
  console.log(`📈 Taxa de Sucesso: ${((testesPassaram/totalTestes) * 100).toFixed(1)}%`);
  
  if (testesPassaram === totalTestes) {
    console.log('🎉 SISTEMA DE EDIÇÃO E REMOÇÃO 100% FUNCIONAL!');
    console.log('✅ Todas as operações CRUD funcionando perfeitamente');
  } else if (testesPassaram >= totalTestes * 0.8) {
    console.log('✅ SISTEMA FUNCIONAL COM PEQUENOS PROBLEMAS');
    console.log('🔧 Verificar endpoints que falharam');
  } else {
    console.log('❌ SISTEMA DE EDIÇÃO/REMOÇÃO COM PROBLEMAS');
    console.log('🔧 Verificar implementação dos endpoints');
  }
}

// Executar teste
testarEdicaoRemocao().catch(console.error);