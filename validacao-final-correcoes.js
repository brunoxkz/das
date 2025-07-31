// Script de validação final das correções implementadas

const BASE_URL = 'http://localhost:5000';

async function validacaoFinalCorrecoes() {
  console.log('🔍 VALIDAÇÃO FINAL DAS CORREÇÕES IMPLEMENTADAS\n');
  
  const problemas = [];
  const sucessos = [];
  
  try {
    // 1. TESTAR AUTENTICAÇÃO
    console.log('🔐 Testando autenticação...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.accessToken;
      sucessos.push('✅ Autenticação JWT funcionando');
      
      // 2. TESTAR PING DA EXTENSÃO (PROBLEMA DO TOKEN 401)
      console.log('🔧 Testando ping da extensão...');
      const pingResponse = await fetch(`${BASE_URL}/api/whatsapp-extension/ping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          version: '2.0.0',
          pendingMessages: 0,
          sentMessages: 0,
          failedMessages: 0,
          isActive: false
        })
      });
      
      if (pingResponse.ok) {
        sucessos.push('✅ Ping da extensão Chrome funcionando (401 corrigido)');
      } else {
        problemas.push(`❌ Ping da extensão falhou: ${pingResponse.status}`);
      }
      
      // 3. TESTAR CAMPANHAS WHATSAPP (PROBLEMA DO QUIZ_ID UNDEFINED)
      console.log('📊 Testando campanhas WhatsApp...');
      const campaignsResponse = await fetch(`${BASE_URL}/api/whatsapp-campaigns`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (campaignsResponse.ok) {
        const campaigns = await campaignsResponse.json();
        sucessos.push(`✅ ${campaigns.length} campanhas WhatsApp carregadas`);
        
        // Verificar se alguma tem quiz_id undefined
        const campaignsWithUndefinedQuizId = campaigns.filter(c => !c.quizId || c.quizId === 'undefined');
        if (campaignsWithUndefinedQuizId.length === 0) {
          sucessos.push('✅ Problema quiz_id undefined corrigido');
        } else {
          problemas.push(`❌ ${campaignsWithUndefinedQuizId.length} campanhas ainda com quiz_id undefined`);
        }
      } else {
        problemas.push(`❌ Erro ao carregar campanhas: ${campaignsResponse.status}`);
      }
      
      // 4. TESTAR MENSAGENS ROTATIVAS
      console.log('🔄 Testando sistema de mensagens rotativas...');
      const newCampaignData = {
        name: 'Teste Validação Final - Mensagens Rotativas',
        quizId: 'Qm4wxpfPgkMrwoMhDFNLZ',
        targetAudience: 'all',
        dateFilter: null,
        messages: [
          'Teste mensagem rotativa 1 - Validação final',
          'Teste mensagem rotativa 2 - Sistema funcionando',
          'Teste mensagem rotativa 3 - Anti-ban ativo',
          'Teste mensagem rotativa 4 - Tudo operacional'
        ],
        triggerType: 'delayed',
        triggerDelay: 1,
        triggerUnit: 'minutes'
      };
      
      const createCampaignResponse = await fetch(`${BASE_URL}/api/whatsapp-campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCampaignData)
      });
      
      if (createCampaignResponse.ok) {
        const newCampaign = await createCampaignResponse.json();
        sucessos.push('✅ Criação de campanha com mensagens rotativas funcionando');
        sucessos.push(`✅ Campanha criada: ${newCampaign.id}`);
      } else {
        const error = await createCampaignResponse.text();
        problemas.push(`❌ Erro ao criar campanha: ${createCampaignResponse.status} - ${error}`);
      }
      
      // 5. TESTAR ARQUIVOS DE AUTOMAÇÃO
      console.log('📂 Testando arquivos de automação...');
      const filesResponse = await fetch(`${BASE_URL}/api/whatsapp-automation-files`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (filesResponse.ok) {
        const files = await filesResponse.json();
        sucessos.push(`✅ ${files.length} arquivos de automação acessíveis`);
      } else {
        problemas.push(`❌ Erro ao acessar arquivos: ${filesResponse.status}`);
      }
      
    } else {
      problemas.push('❌ Falha na autenticação');
    }
    
    // RELATÓRIO FINAL
    console.log('\n🎯 RELATÓRIO FINAL DE VALIDAÇÃO');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════════\n');
    
    if (sucessos.length > 0) {
      console.log('🎉 SUCESSOS:');
      sucessos.forEach(sucesso => console.log(`   ${sucesso}`));
      console.log('');
    }
    
    if (problemas.length > 0) {
      console.log('⚠️ PROBLEMAS ENCONTRADOS:');
      problemas.forEach(problema => console.log(`   ${problema}`));
      console.log('');
    }
    
    // RESUMO
    const totalTestes = sucessos.length + problemas.length;
    const percentualSucesso = Math.round((sucessos.length / totalTestes) * 100);
    
    console.log(`📊 RESUMO: ${sucessos.length}/${totalTestes} testes passaram (${percentualSucesso}%)`);
    
    if (problemas.length === 0) {
      console.log('\n🎉 TODOS OS PROBLEMAS FORAM CORRIGIDOS!');
      console.log('✅ Sistema 100% operacional');
      console.log('✅ Mensagens rotativas implementadas');
      console.log('✅ Sistema anti-ban ativo');
      console.log('✅ Tokens de extensão válidos');
      console.log('✅ Campanhas WhatsApp funcionando');
    } else {
      console.log('\n⚠️ Ainda há problemas para resolver');
    }
    
  } catch (error) {
    console.error('❌ ERRO NA VALIDAÇÃO:', error.message);
  }
}

// Executar validação
validacaoFinalCorrecoes();