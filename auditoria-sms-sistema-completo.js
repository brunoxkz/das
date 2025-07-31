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
  titulo: 'AUDITORIA COMPLETA DO SISTEMA SMS',
  versao: '1.0',
  status: 'EM_ANDAMENTO',
  testes: [],
  resumo: {
    total: 0,
    aprovados: 0,
    falhas: 0,
    taxa_sucesso: 0
  },
  funcionalidades: {
    autodeteccao: { status: 'PENDENTE', detalhes: [] },
    autenticacao: { status: 'PENDENTE', detalhes: [] },
    campanhas: { status: 'PENDENTE', detalhes: [] },
    creditos: { status: 'PENDENTE', detalhes: [] },
    envio_direto: { status: 'PENDENTE', detalhes: [] },
    logs: { status: 'PENDENTE', detalhes: [] },
    analytics: { status: 'PENDENTE', detalhes: [] }
  }
};

// Função para realizar teste
async function executarTeste(nome, funcao) {
  console.log(`🔍 Testando: ${nome}`);
  const inicio = Date.now();
  
  try {
    const resultado = await funcao();
    const tempo = Date.now() - inicio;
    
    relatorio.testes.push({
      nome,
      status: 'APROVADO',
      tempo: `${tempo}ms`,
      resultado: resultado
    });
    
    relatorio.resumo.aprovados++;
    console.log(`✅ ${nome} - APROVADO (${tempo}ms)`);
    return { sucesso: true, resultado };
    
  } catch (error) {
    const tempo = Date.now() - inicio;
    
    relatorio.testes.push({
      nome,
      status: 'FALHA',
      tempo: `${tempo}ms`,
      erro: error.message
    });
    
    relatorio.resumo.falhas++;
    console.log(`❌ ${nome} - FALHA (${tempo}ms): ${error.message}`);
    return { sucesso: false, erro: error.message };
  } finally {
    relatorio.resumo.total++;
  }
}

// Função de login
async function login() {
  const response = await axios.post(`${BASE_URL}/api/auth/login`, ADMIN_CREDENTIALS);
  return response.data.accessToken;
}

// Testes de autodetecção
async function testeAutodeteccao(token) {
  const testeCasos = [
    { phone: '+5511995133932', expectedCountry: 'Brasil', expectedCode: '+55' },
    { phone: '+17145551234', expectedCountry: 'Estados Unidos', expectedCode: '+1' },
    { phone: '+8613812345678', expectedCountry: 'China', expectedCode: '+86' },
    { phone: '+972123456789', expectedCountry: 'Israel', expectedCode: '+972' },
    { phone: '+4915123456789', expectedCountry: 'Alemanha', expectedCode: '+49' }
  ];
  
  const resultados = [];
  
  for (const caso of testeCasos) {
    try {
      const response = await axios.post(`${BASE_URL}/api/sms/direct`, {
        phone: caso.phone,
        message: 'Test autodetecção'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const country = response.data.country;
      const countryCode = response.data.countryCode;
      
      const aprovado = country === caso.expectedCountry && countryCode === caso.expectedCode;
      
      resultados.push({
        phone: caso.phone,
        detectado: `${country} (${countryCode})`,
        esperado: `${caso.expectedCountry} (${caso.expectedCode})`,
        status: aprovado ? 'APROVADO' : 'FALHA'
      });
      
      relatorio.funcionalidades.autodeteccao.detalhes.push({
        numero: caso.phone,
        pais_detectado: country,
        codigo_detectado: countryCode,
        pais_esperado: caso.expectedCountry,
        codigo_esperado: caso.expectedCode,
        correto: aprovado
      });
      
    } catch (error) {
      resultados.push({
        phone: caso.phone,
        erro: error.message,
        status: 'ERRO'
      });
    }
  }
  
  const aprovados = resultados.filter(r => r.status === 'APROVADO').length;
  const total = resultados.length;
  
  relatorio.funcionalidades.autodeteccao.status = 
    aprovados === total ? 'APROVADO' : 
    aprovados > total * 0.8 ? 'PARCIAL' : 'FALHA';
  
  return {
    resultados,
    taxa_sucesso: `${aprovados}/${total} (${Math.round(aprovados/total*100)}%)`
  };
}

// Teste de campanhas
async function testeCampanhas(token) {
  const response = await axios.get(`${BASE_URL}/api/sms-campaigns`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const campanhas = response.data;
  
  relatorio.funcionalidades.campanhas.detalhes = {
    total_campanhas: campanhas.length,
    campanhas_ativas: campanhas.filter(c => c.status === 'active').length,
    campanhas_pausadas: campanhas.filter(c => c.status === 'paused').length,
    campanhas_completas: campanhas.filter(c => c.status === 'completed').length
  };
  
  relatorio.funcionalidades.campanhas.status = 
    campanhas.length > 0 ? 'APROVADO' : 'FALHA';
  
  return {
    total: campanhas.length,
    estrutura_valida: campanhas.every(c => c.id && c.name && c.status)
  };
}

// Teste de créditos
async function testeCreditos(token) {
  const response = await axios.get(`${BASE_URL}/api/sms-credits`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const creditos = response.data;
  
  relatorio.funcionalidades.creditos.detalhes = {
    total: creditos.total,
    usados: creditos.used,
    restantes: creditos.remaining,
    plano: creditos.plan,
    valido: creditos.valid
  };
  
  relatorio.funcionalidades.creditos.status = 
    creditos.valid && creditos.total > 0 ? 'APROVADO' : 'FALHA';
  
  return creditos;
}

// Teste de logs
async function testeLogs(token) {
  // Primeiro pegar uma campanha para testar logs
  const campanhas = await axios.get(`${BASE_URL}/api/sms-campaigns`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (campanhas.data.length === 0) {
    throw new Error('Nenhuma campanha encontrada para testar logs');
  }
  
  const campaignId = campanhas.data[0].id;
  
  try {
    const response = await axios.get(`${BASE_URL}/api/sms-campaigns/${campaignId}/logs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const logs = response.data;
    
    relatorio.funcionalidades.logs.detalhes = {
      campaign_id: campaignId,
      total_logs: logs.length,
      estrutura_valida: logs.length > 0 ? logs.every(l => l.phone && l.status) : true
    };
    
    relatorio.funcionalidades.logs.status = 'APROVADO';
    
    return {
      campaign_id: campaignId,
      logs_count: logs.length,
      funcionando: true
    };
    
  } catch (error) {
    relatorio.funcionalidades.logs.status = 'FALHA';
    throw error;
  }
}

// Executar auditoria completa
async function executarAuditoria() {
  console.log('🚀 INICIANDO AUDITORIA COMPLETA DO SISTEMA SMS');
  console.log('=' .repeat(60));
  
  try {
    // 1. Teste de Autenticação
    const token = await executarTeste('Autenticação Admin', login);
    
    if (!token.sucesso) {
      throw new Error('Falha na autenticação - testes interrompidos');
    }
    
    relatorio.funcionalidades.autenticacao.status = 'APROVADO';
    relatorio.funcionalidades.autenticacao.detalhes = { token_obtido: true };
    
    // 2. Teste de Autodetecção
    await executarTeste('Autodetecção de Países', () => testeAutodeteccao(token.resultado));
    
    // 3. Teste de Campanhas
    await executarTeste('Sistema de Campanhas', () => testeCampanhas(token.resultado));
    
    // 4. Teste de Créditos
    await executarTeste('Sistema de Créditos', () => testeCreditos(token.resultado));
    
    // 5. Teste de Logs
    await executarTeste('Sistema de Logs', () => testeLogs(token.resultado));
    
    // 6. Calcular taxa de sucesso
    relatorio.resumo.taxa_sucesso = Math.round((relatorio.resumo.aprovados / relatorio.resumo.total) * 100);
    
    // 7. Determinar status final
    if (relatorio.resumo.taxa_sucesso >= 90) {
      relatorio.status = 'APROVADO_PRODUCAO';
    } else if (relatorio.resumo.taxa_sucesso >= 70) {
      relatorio.status = 'APROVADO_CONDICIONAL';
    } else {
      relatorio.status = 'REPROVADO';
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RELATÓRIO FINAL');
    console.log('=' .repeat(60));
    console.log(`📈 Taxa de Sucesso: ${relatorio.resumo.taxa_sucesso}%`);
    console.log(`✅ Aprovados: ${relatorio.resumo.aprovados}`);
    console.log(`❌ Falhas: ${relatorio.resumo.falhas}`);
    console.log(`📝 Total: ${relatorio.resumo.total}`);
    console.log(`🎯 Status: ${relatorio.status}`);
    
    // Salvar relatório
    const nomeArquivo = `RELATORIO-SMS-AUDITORIA-${Date.now()}.json`;
    fs.writeFileSync(nomeArquivo, JSON.stringify(relatorio, null, 2));
    
    console.log(`\n📄 Relatório salvo em: ${nomeArquivo}`);
    
    return relatorio;
    
  } catch (error) {
    console.error('❌ Erro na auditoria:', error.message);
    relatorio.status = 'ERRO_CRITICO';
    relatorio.erro_critico = error.message;
    
    // Salvar relatório mesmo com erro
    const nomeArquivo = `RELATORIO-SMS-AUDITORIA-ERRO-${Date.now()}.json`;
    fs.writeFileSync(nomeArquivo, JSON.stringify(relatorio, null, 2));
    
    return relatorio;
  }
}

// Executar se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  executarAuditoria().then(relatorio => {
    process.exit(relatorio.status === 'APROVADO_PRODUCAO' ? 0 : 1);
  });
}

export { executarAuditoria, relatorio };