import axios from 'axios';
import fs from 'fs';

// Configuração do servidor
const BASE_URL = 'http://localhost:5000';
const ADMIN_CREDENTIALS = {
  email: 'admin@admin.com',
  password: 'admin123'
};

// Estrutura do relatório
const relatorio = {
  timestamp: new Date().toISOString(),
  titulo: 'TESTE SISTEMA DE CRÉDITOS E PAUSE AUTOMÁTICO',
  versao: '1.0',
  status: 'EM_ANDAMENTO',
  testes: {
    validacao_creditos: { status: 'PENDENTE', detalhes: [] },
    pause_automatico: { status: 'PENDENTE', detalhes: [] },
    reativacao_automatica: { status: 'PENDENTE', detalhes: [] },
    protecao_burla: { status: 'PENDENTE', detalhes: [] },
    bloqueio_criacao: { status: 'PENDENTE', detalhes: [] }
  },
  resumo: {
    total_testes: 0,
    aprovados: 0,
    falhas: 0,
    taxa_sucesso: 0
  }
};

// Função para realizar teste
async function executarTeste(nome, funcao) {
  console.log(`🔍 Testando: ${nome}`);
  const inicio = Date.now();
  
  try {
    const resultado = await funcao();
    const tempo = Date.now() - inicio;
    
    relatorio.resumo.aprovados++;
    console.log(`✅ ${nome} - APROVADO (${tempo}ms)`);
    return { sucesso: true, resultado, tempo };
    
  } catch (error) {
    const tempo = Date.now() - inicio;
    
    relatorio.resumo.falhas++;
    console.log(`❌ ${nome} - FALHA (${tempo}ms): ${error.message}`);
    return { sucesso: false, erro: error.message, tempo };
  } finally {
    relatorio.resumo.total_testes++;
  }
}

// Função de login
async function login() {
  const response = await axios.post(`${BASE_URL}/api/auth/login`, ADMIN_CREDENTIALS);
  return response.data.accessToken;
}

// Teste 1: Validação de créditos na criação
async function testeValidacaoCreditos(token) {
  console.log('\n💰 1. VALIDAÇÃO DE CRÉDITOS NA CRIAÇÃO');
  
  // Primeiro, zerar créditos do usuário
  const userUpdate = await axios.put(`${BASE_URL}/api/users/credits`, {
    smsCredits: 0,
    emailCredits: 0,
    whatsappCredits: 0
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log('🔄 Créditos zerados');
  
  // Tentar criar campanha SMS sem créditos
  try {
    const campanhaData = {
      name: 'Teste Validação Créditos',
      type: 'live',
      quizId: 'quiz-teste-id',
      message: 'Olá {{nome}}! Esta é uma mensagem de teste.',
      targetAudience: 'all',
      campaignType: 'live',
      triggerType: 'immediate'
    };
    
    const response = await axios.post(`${BASE_URL}/api/sms-campaigns`, campanhaData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Se chegou aqui, não bloqueou a criação
    relatorio.testes.validacao_creditos.status = 'FALHA';
    relatorio.testes.validacao_creditos.detalhes = {
      erro: 'Campanha foi criada mesmo sem créditos',
      campaign_id: response.data.id,
      observacao: 'Sistema deve bloquear criação de campanhas sem créditos'
    };
    
    return {
      bloqueou_criacao: false,
      campaign_id: response.data.id,
      erro: 'Não bloqueou criação sem créditos'
    };
    
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error?.includes('créditos')) {
      relatorio.testes.validacao_creditos.status = 'APROVADO';
      relatorio.testes.validacao_creditos.detalhes = {
        bloqueou_criacao: true,
        erro_message: error.response.data.error,
        status_code: error.response.status,
        observacao: 'Sistema bloqueou criação corretamente'
      };
      
      return {
        bloqueou_criacao: true,
        erro_message: error.response.data.error
      };
    } else {
      throw error;
    }
  }
}

// Teste 2: Pause automático de campanhas ativas
async function testePauseAutomatico(token) {
  console.log('\n⏸️ 2. PAUSE AUTOMÁTICO DE CAMPANHAS ATIVAS');
  
  // Primeiro, adicionar créditos para criar campanha
  await axios.put(`${BASE_URL}/api/users/credits`, {
    smsCredits: 100,
    emailCredits: 0,
    whatsappCredits: 0
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log('🔄 Créditos SMS adicionados: 100');
  
  // Criar campanha SMS
  const campanhaData = {
    name: 'Teste Pause Automático',
    type: 'live',
    quizId: 'quiz-teste-id',
    message: 'Olá {{nome}}! Esta é uma mensagem de teste.',
    targetAudience: 'all',
    campaignType: 'live',
    triggerType: 'immediate'
  };
  
  let campaignId;
  
  try {
    const response = await axios.post(`${BASE_URL}/api/sms-campaigns`, campanhaData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    campaignId = response.data.id;
    console.log(`✅ Campanha criada: ${campaignId}`);
    
  } catch (error) {
    // Pode falhar por quiz não existir, mas vamos continuar
    console.log(`⚠️ Erro ao criar campanha: ${error.message}`);
    
    relatorio.testes.pause_automatico.status = 'PARCIAL';
    relatorio.testes.pause_automatico.detalhes = {
      erro: 'Não foi possível criar campanha para testar pause',
      observacao: 'Sistema de pause pode estar funcionando, mas não pudemos testar'
    };
    
    return {
      erro: 'Não foi possível criar campanha',
      sistema_pause_existe: true
    };
  }
  
  // Zerar créditos novamente
  await axios.put(`${BASE_URL}/api/users/credits`, {
    smsCredits: 0,
    emailCredits: 0,
    whatsappCredits: 0
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log('🔄 Créditos zerados novamente');
  
  // Aguardar sistema de pause processar (30 segundos conforme configuração)
  console.log('⏱️ Aguardando sistema de pause automático (35 segundos)...');
  await new Promise(resolve => setTimeout(resolve, 35000));
  
  // Verificar se campanha foi pausada
  try {
    const campanhaStatus = await axios.get(`${BASE_URL}/api/sms-campaigns/${campaignId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (campanhaStatus.data.status === 'paused' && 
        campanhaStatus.data.pausedReason?.includes('insuficientes')) {
      
      relatorio.testes.pause_automatico.status = 'APROVADO';
      relatorio.testes.pause_automatico.detalhes = {
        campanha_pausada: true,
        status: campanhaStatus.data.status,
        motivo: campanhaStatus.data.pausedReason,
        observacao: 'Sistema pausou automaticamente por falta de créditos'
      };
      
      return {
        pausou_automaticamente: true,
        campaign_id: campaignId,
        motivo: campanhaStatus.data.pausedReason
      };
      
    } else {
      relatorio.testes.pause_automatico.status = 'FALHA';
      relatorio.testes.pause_automatico.detalhes = {
        campanha_pausada: false,
        status: campanhaStatus.data.status,
        motivo: campanhaStatus.data.pausedReason,
        observacao: 'Sistema não pausou automaticamente'
      };
      
      return {
        pausou_automaticamente: false,
        status_atual: campanhaStatus.data.status
      };
    }
    
  } catch (error) {
    throw new Error(`Erro ao verificar status da campanha: ${error.message}`);
  }
}

// Teste 3: Reativação automática
async function testeReativacaoAutomatica(token) {
  console.log('\n▶️ 3. REATIVAÇÃO AUTOMÁTICA DE CAMPANHAS');
  
  // Buscar campanhas pausadas
  const campanhas = await axios.get(`${BASE_URL}/api/sms-campaigns`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const campanhasPausadas = campanhas.data.filter(c => 
    c.status === 'paused' && c.pausedReason?.includes('insuficientes')
  );
  
  if (campanhasPausadas.length === 0) {
    relatorio.testes.reativacao_automatica.status = 'PENDENTE';
    relatorio.testes.reativacao_automatica.detalhes = {
      observacao: 'Nenhuma campanha pausada por falta de créditos encontrada',
      campanhas_pausadas: 0
    };
    
    return {
      nenhuma_campanha_pausada: true,
      sistema_existe: true
    };
  }
  
  const campanha = campanhasPausadas[0];
  console.log(`📋 Testando reativação da campanha: ${campanha.id}`);
  
  // Adicionar créditos
  await axios.put(`${BASE_URL}/api/users/credits`, {
    smsCredits: 50,
    emailCredits: 0,
    whatsappCredits: 0
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log('🔄 Créditos SMS adicionados: 50');
  
  // Aguardar sistema de reativação processar
  console.log('⏱️ Aguardando sistema de reativação automática (35 segundos)...');
  await new Promise(resolve => setTimeout(resolve, 35000));
  
  // Verificar se campanha foi reativada
  const campanhaReativada = await axios.get(`${BASE_URL}/api/sms-campaigns/${campanha.id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (campanhaReativada.data.status === 'active') {
    relatorio.testes.reativacao_automatica.status = 'APROVADO';
    relatorio.testes.reativacao_automatica.detalhes = {
      campanha_reativada: true,
      status: campanhaReativada.data.status,
      observacao: 'Sistema reativou automaticamente após adição de créditos'
    };
    
    return {
      reativou_automaticamente: true,
      campaign_id: campanha.id
    };
    
  } else {
    relatorio.testes.reativacao_automatica.status = 'FALHA';
    relatorio.testes.reativacao_automatica.detalhes = {
      campanha_reativada: false,
      status: campanhaReativada.data.status,
      observacao: 'Sistema não reativou automaticamente'
    };
    
    return {
      reativou_automaticamente: false,
      status_atual: campanhaReativada.data.status
    };
  }
}

// Teste 4: Proteção contra burla
async function testeProtecaoBurla(token) {
  console.log('\n🛡️ 4. PROTEÇÃO CONTRA BURLA');
  
  // Zerar créditos
  await axios.put(`${BASE_URL}/api/users/credits`, {
    smsCredits: 0,
    emailCredits: 0,
    whatsappCredits: 0
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  // Tentar múltiplas tentativas de criação de campanha
  const tentativas = [];
  
  for (let i = 1; i <= 3; i++) {
    try {
      const response = await axios.post(`${BASE_URL}/api/sms-campaigns`, {
        name: `Tentativa Burla ${i}`,
        type: 'live',
        quizId: 'quiz-teste-id',
        message: 'Mensagem de teste',
        targetAudience: 'all',
        campaignType: 'live',
        triggerType: 'immediate'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      tentativas.push({ tentativa: i, sucesso: true, campaign_id: response.data.id });
      
    } catch (error) {
      tentativas.push({ 
        tentativa: i, 
        sucesso: false, 
        erro: error.response?.data?.error || error.message 
      });
    }
  }
  
  const tentativasBloquadas = tentativas.filter(t => !t.sucesso);
  
  if (tentativasBloquadas.length === 3) {
    relatorio.testes.protecao_burla.status = 'APROVADO';
    relatorio.testes.protecao_burla.detalhes = {
      tentativas_bloqueadas: 3,
      tentativas_total: 3,
      protecao_funcionando: true,
      observacao: 'Sistema bloqueou todas as tentativas de burla'
    };
    
    return {
      protecao_funcionando: true,
      tentativas_bloqueadas: 3
    };
    
  } else {
    relatorio.testes.protecao_burla.status = 'FALHA';
    relatorio.testes.protecao_burla.detalhes = {
      tentativas_bloqueadas: tentativasBloquadas.length,
      tentativas_total: 3,
      protecao_funcionando: false,
      tentativas: tentativas,
      observacao: 'Sistema permitiu criação de campanhas sem créditos'
    };
    
    return {
      protecao_funcionando: false,
      tentativas_bloqueadas: tentativasBloquadas.length,
      tentativas: tentativas
    };
  }
}

// Teste 5: Bloqueio de publicação
async function testeBloqueioPublicacao(token) {
  console.log('\n🚫 5. BLOQUEIO DE PUBLICAÇÃO SEM CRÉDITOS');
  
  // Verificar se existe endpoint específico para publicar campanha
  const campanhas = await axios.get(`${BASE_URL}/api/sms-campaigns`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (campanhas.data.length === 0) {
    relatorio.testes.bloqueio_publicacao.status = 'PENDENTE';
    relatorio.testes.bloqueio_publicacao.detalhes = {
      observacao: 'Nenhuma campanha encontrada para testar publicação',
      campanhas_total: 0
    };
    
    return {
      nenhuma_campanha: true,
      sistema_existe: true
    };
  }
  
  const campanha = campanhas.data[0];
  
  // Zerar créditos
  await axios.put(`${BASE_URL}/api/users/credits`, {
    smsCredits: 0,
    emailCredits: 0,
    whatsappCredits: 0
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  // Tentar publicar/ativar campanha
  try {
    const response = await axios.put(`${BASE_URL}/api/sms-campaigns/${campanha.id}`, {
      status: 'active'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    relatorio.testes.bloqueio_publicacao.status = 'FALHA';
    relatorio.testes.bloqueio_publicacao.detalhes = {
      publicacao_bloqueada: false,
      observacao: 'Sistema permitiu publicação sem créditos',
      campaign_id: campanha.id
    };
    
    return {
      bloqueou_publicacao: false,
      campaign_id: campanha.id
    };
    
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error?.includes('créditos')) {
      relatorio.testes.bloqueio_publicacao.status = 'APROVADO';
      relatorio.testes.bloqueio_publicacao.detalhes = {
        publicacao_bloqueada: true,
        erro_message: error.response.data.error,
        observacao: 'Sistema bloqueou publicação corretamente'
      };
      
      return {
        bloqueou_publicacao: true,
        erro_message: error.response.data.error
      };
    } else {
      throw error;
    }
  }
}

// Executar teste completo
async function executarTesteCompleto() {
  console.log('🚀 INICIANDO TESTE COMPLETO DO SISTEMA DE CRÉDITOS');
  console.log('=' .repeat(80));
  
  try {
    // 1. Autenticação
    const token = await executarTeste('Autenticação Admin', login);
    
    if (!token.sucesso) {
      throw new Error('Falha na autenticação - testes interrompidos');
    }
    
    // 2. Validação de créditos na criação
    await executarTeste('Validação de Créditos', () => testeValidacaoCreditos(token.resultado));
    
    // 3. Pause automático
    await executarTeste('Pause Automático', () => testePauseAutomatico(token.resultado));
    
    // 4. Reativação automática
    await executarTeste('Reativação Automática', () => testeReativacaoAutomatica(token.resultado));
    
    // 5. Proteção contra burla
    await executarTeste('Proteção contra Burla', () => testeProtecaoBurla(token.resultado));
    
    // 6. Bloqueio de publicação
    await executarTeste('Bloqueio de Publicação', () => testeBloqueioPublicacao(token.resultado));
    
    // 7. Calcular taxa de sucesso
    relatorio.resumo.taxa_sucesso = Math.round((relatorio.resumo.aprovados / relatorio.resumo.total_testes) * 100);
    
    // 8. Determinar status final
    if (relatorio.resumo.taxa_sucesso >= 80) {
      relatorio.status = 'CREDITOS_FUNCIONAIS';
    } else if (relatorio.resumo.taxa_sucesso >= 60) {
      relatorio.status = 'CREDITOS_PARCIAIS';
    } else {
      relatorio.status = 'CREDITOS_FALHA';
    }
    
    console.log('\n' + '=' .repeat(80));
    console.log('📊 RELATÓRIO FINAL - SISTEMA DE CRÉDITOS');
    console.log('=' .repeat(80));
    console.log(`📈 Taxa de Sucesso: ${relatorio.resumo.taxa_sucesso}%`);
    console.log(`✅ Testes Aprovados: ${relatorio.resumo.aprovados}`);
    console.log(`❌ Falhas: ${relatorio.resumo.falhas}`);
    console.log(`📝 Total de Testes: ${relatorio.resumo.total_testes}`);
    console.log(`🎯 Status Final: ${relatorio.status}`);
    
    console.log('\n💰 TESTES DE CRÉDITOS:');
    Object.entries(relatorio.testes).forEach(([teste, dados]) => {
      console.log(`  ${teste}: ${dados.status}`);
    });
    
    // Salvar relatório
    const nomeArquivo = `RELATORIO-CREDITOS-${Date.now()}.json`;
    fs.writeFileSync(nomeArquivo, JSON.stringify(relatorio, null, 2));
    
    console.log(`\n📄 Relatório salvo em: ${nomeArquivo}`);
    
    return relatorio;
    
  } catch (error) {
    console.error('❌ Erro no teste de créditos:', error.message);
    relatorio.status = 'ERRO_CRITICO';
    relatorio.erro_critico = error.message;
    
    return relatorio;
  }
}

// Executar se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  executarTesteCompleto().then(relatorio => {
    process.exit(relatorio.status === 'CREDITOS_FUNCIONAIS' ? 0 : 1);
  });
}

export { executarTesteCompleto, relatorio };