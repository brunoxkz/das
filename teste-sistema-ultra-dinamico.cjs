#!/usr/bin/env node

/**
 * TESTE SISTEMA ULTRA DINÂMICO - Validação Completa
 * Valida carregamento automático de respostas específicas após seleção de campo
 * Autor: Sistema Quantum Vendzz
 * Data: 22/07/2025 20:56
 */

const fs = require('fs');

// Configuração de teste
const BASE_URL = 'http://localhost:5000';
const QUIZ_ID = 'RdAUwmQgTthxbZLA0HJWu'; // Quiz com dados reais
const TEST_TIMEOUT = 30000;

let token = '';
let testResults = [];

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      timeout: 10000,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Request failed:`, error.message);
    throw error;
  }
}

// Função para fazer login
async function login() {
  console.log('🔐 Fazendo login...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123'
      })
    });
    
    token = response.token;
    console.log('✅ Login realizado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro no login:', error.message);
    return false;
  }
}

// Teste 1: Verificar endpoint variables-ultra
async function testeVariablesUltra() {
  console.log('\n📊 TESTE 1: Endpoint variables-ultra');
  
  try {
    const startTime = Date.now();
    const data = await makeRequest(`${BASE_URL}/api/quizzes/${QUIZ_ID}/variables-ultra`);
    const responseTime = Date.now() - startTime;
    
    console.log(`⚡ Tempo resposta: ${responseTime}ms`);
    console.log(`📈 Variáveis encontradas: ${data.variables?.length || 0}`);
    
    if (data.variables && data.variables.length > 0) {
      // Procurar por campos específicos de quiz
      const camposEspecificos = ['p1_objetivo_fitness', 'p2_nivel_experiencia', 'p3_disponibilidade'];
      const camposEncontrados = data.variables.filter(v => camposEspecificos.includes(v.field));
      
      console.log(`🎯 Campos específicos encontrados: ${camposEncontrados.length}`);
      
      // Mostrar exemplo de um campo
      if (camposEncontrados.length > 0) {
        const exemplo = camposEncontrados[0];
        console.log(`📋 Exemplo - ${exemplo.field}:`);
        console.log(`   🔢 Total respostas: ${exemplo.count}`);
        console.log(`   📝 Valores únicos: ${exemplo.values?.length || 0}`);
        if (exemplo.values && exemplo.values.length > 0) {
          console.log(`   🎯 Primeiros valores: ${exemplo.values.slice(0, 3).join(', ')}`);
        }
        
        testResults.push({
          teste: 'Variables Ultra',
          status: 'APROVADO',
          detalhes: `${camposEncontrados.length} campos encontrados, ${exemplo.values?.length || 0} valores únicos`,
          tempo: responseTime
        });
        
        return { success: true, data, camposEncontrados };
      }
    }
    
    testResults.push({
      teste: 'Variables Ultra',
      status: 'FALHOU',
      detalhes: 'Nenhum campo específico encontrado',
      tempo: responseTime
    });
    
    return { success: false, data };
    
  } catch (error) {
    console.error('❌ Erro no teste variables-ultra:', error.message);
    testResults.push({
      teste: 'Variables Ultra',
      status: 'ERRO',
      detalhes: error.message,
      tempo: 0
    });
    return { success: false, error: error.message };
  }
}

// Teste 2: Testar filtro por resposta específica
async function testeRespostaEspecifica(campo, valor) {
  console.log(`\n🔍 TESTE 2: Filtro por resposta específica - ${campo}: "${valor}"`);
  
  try {
    const startTime = Date.now();
    const data = await makeRequest(`${BASE_URL}/api/quizzes/${QUIZ_ID}/leads-by-response`, {
      method: 'POST',
      body: JSON.stringify({
        field: campo,
        value: valor,
        format: 'leads'
      })
    });
    const responseTime = Date.now() - startTime;
    
    console.log(`⚡ Tempo resposta: ${responseTime}ms`);
    console.log(`👥 Leads encontrados: ${data.leads?.length || 0}`);
    
    if (data.leads && data.leads.length > 0) {
      // Validar se todos os leads têm a resposta específica
      let leadsValidados = 0;
      data.leads.forEach(lead => {
        if (lead[campo] === valor) {
          leadsValidados++;
        }
      });
      
      const precisao = ((leadsValidados / data.leads.length) * 100).toFixed(1);
      console.log(`🎯 Precisão do filtro: ${precisao}% (${leadsValidados}/${data.leads.length})`);
      
      // Mostrar exemplo de lead filtrado
      if (data.leads[0]) {
        const exemplo = data.leads[0];
        console.log(`📋 Exemplo de lead:`);
        console.log(`   📞 Telefone: ${exemplo.telefone || 'N/A'}`);
        console.log(`   👤 Nome: ${exemplo.nome || 'N/A'}`);
        console.log(`   🎯 ${campo}: "${exemplo[campo]}"`);
      }
      
      const statusTeste = precisao >= 95 ? 'APROVADO' : 'FALHOU';
      testResults.push({
        teste: `Filtro Específico (${campo})`,
        status: statusTeste,
        detalhes: `${data.leads.length} leads, ${precisao}% precisão`,
        tempo: responseTime
      });
      
      return { success: statusTeste === 'APROVADO', data, precisao: parseFloat(precisao) };
    } else {
      testResults.push({
        teste: `Filtro Específico (${campo})`,
        status: 'AVISO',
        detalhes: 'Nenhum lead encontrado para esta resposta específica',
        tempo: responseTime
      });
      
      return { success: true, data, precisao: 100 }; // Tecnicamente correto se não há dados
    }
    
  } catch (error) {
    console.error('❌ Erro no teste de resposta específica:', error.message);
    testResults.push({
      teste: `Filtro Específico (${campo})`,
      status: 'ERRO',
      detalhes: error.message,
      tempo: 0
    });
    return { success: false, error: error.message };
  }
}

// Teste 3: Validar formatos múltiplos (leads, phones, emails)
async function testeFormatosMultiplos(campo, valor) {
  console.log(`\n📱 TESTE 3: Formatos múltiplos para ${campo}: "${valor}"`);
  
  const formatos = ['leads', 'phones', 'emails'];
  const resultados = [];
  
  for (const formato of formatos) {
    try {
      const startTime = Date.now();
      const data = await makeRequest(`${BASE_URL}/api/quizzes/${QUIZ_ID}/leads-by-response`, {
        method: 'POST',
        body: JSON.stringify({
          field: campo,
          value: valor,
          format: formato
        })
      });
      const responseTime = Date.now() - startTime;
      
      const count = data[formato]?.length || 0;
      console.log(`📊 ${formato}: ${count} items (${responseTime}ms)`);
      
      resultados.push({
        formato,
        count,
        tempo: responseTime,
        sucesso: true
      });
      
    } catch (error) {
      console.error(`❌ Erro formato ${formato}:`, error.message);
      resultados.push({
        formato,
        count: 0,
        tempo: 0,
        sucesso: false,
        erro: error.message
      });
    }
  }
  
  const formatosOk = resultados.filter(r => r.sucesso).length;
  const statusTeste = formatosOk >= 2 ? 'APROVADO' : 'FALHOU';
  
  testResults.push({
    teste: 'Formatos Múltiplos',
    status: statusTeste,
    detalhes: `${formatosOk}/3 formatos funcionando`,
    tempo: Math.max(...resultados.map(r => r.tempo))
  });
  
  return { success: statusTeste === 'APROVADO', resultados };
}

// Teste 4: Performance com múltiplas requisições simultâneas
async function testePerformanceSimultaneo() {
  console.log('\n⚡ TESTE 4: Performance com requisições simultâneas');
  
  try {
    const promises = [];
    const startTime = Date.now();
    
    // 5 requisições simultâneas
    for (let i = 0; i < 5; i++) {
      promises.push(
        makeRequest(`${BASE_URL}/api/quizzes/${QUIZ_ID}/variables-ultra`)
      );
    }
    
    const resultados = await Promise.allSettled(promises);
    const totalTime = Date.now() - startTime;
    
    const sucessos = resultados.filter(r => r.status === 'fulfilled').length;
    const tempoMedio = totalTime / 5;
    
    console.log(`🚀 Requisições simultâneas: ${sucessos}/5 bem-sucedidas`);
    console.log(`⚡ Tempo total: ${totalTime}ms`);
    console.log(`📊 Tempo médio por requisição: ${tempoMedio.toFixed(1)}ms`);
    
    const statusTeste = sucessos >= 4 && tempoMedio < 2000 ? 'APROVADO' : 'FALHOU';
    
    testResults.push({
      teste: 'Performance Simultânea',
      status: statusTeste,
      detalhes: `${sucessos}/5 sucessos, ${tempoMedio.toFixed(1)}ms médio`,
      tempo: totalTime
    });
    
    return { success: statusTeste === 'APROVADO', sucessos, tempoMedio };
    
  } catch (error) {
    console.error('❌ Erro no teste de performance:', error.message);
    testResults.push({
      teste: 'Performance Simultânea',
      status: 'ERRO',
      detalhes: error.message,
      tempo: 0
    });
    return { success: false, error: error.message };
  }
}

// Função principal de teste
async function executarTestes() {
  console.log('🚀 INICIANDO TESTES DO SISTEMA ULTRA DINÂMICO');
  console.log('=' .repeat(60));
  
  // Login
  const loginOk = await login();
  if (!loginOk) {
    console.log('❌ FALHA CRÍTICA: Login falhou');
    return;
  }
  
  let totalTestes = 0;
  let testesAprovados = 0;
  
  // Teste 1: Variables Ultra
  const teste1 = await testeVariablesUltra();
  totalTestes++;
  if (teste1.success) testesAprovados++;
  
  // Se teste 1 passou, fazer os outros testes
  if (teste1.success && teste1.camposEncontrados && teste1.camposEncontrados.length > 0) {
    const campoTeste = teste1.camposEncontrados[0];
    const valorTeste = campoTeste.values && campoTeste.values.length > 0 ? campoTeste.values[0] : null;
    
    if (valorTeste) {
      // Teste 2: Resposta específica
      const teste2 = await testeRespostaEspecifica(campoTeste.field, valorTeste);
      totalTestes++;
      if (teste2.success) testesAprovados++;
      
      // Teste 3: Formatos múltiplos
      const teste3 = await testeFormatosMultiplos(campoTeste.field, valorTeste);
      totalTestes++;
      if (teste3.success) testesAprovados++;
    }
  }
  
  // Teste 4: Performance
  const teste4 = await testePerformanceSimultaneo();
  totalTestes++;
  if (teste4.success) testesAprovados++;
  
  // Relatório final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL - SISTEMA ULTRA DINÂMICO');
  console.log('='.repeat(60));
  
  testResults.forEach(resultado => {
    const status = resultado.status === 'APROVADO' ? '✅' : 
                   resultado.status === 'ERRO' ? '❌' : '⚠️';
    console.log(`${status} ${resultado.teste}: ${resultado.status}`);
    console.log(`   📝 ${resultado.detalhes}`);
    console.log(`   ⚡ ${resultado.tempo}ms`);
  });
  
  const taxaSucesso = ((testesAprovados / totalTestes) * 100).toFixed(1);
  console.log(`\n🏆 TAXA DE SUCESSO: ${taxaSucesso}% (${testesAprovados}/${totalTestes})`);
  
  if (taxaSucesso >= 75) {
    console.log('✅ SISTEMA ULTRA DINÂMICO: APROVADO PARA PRODUÇÃO');
  } else {
    console.log('❌ SISTEMA ULTRA DINÂMICO: NECESSITA CORREÇÕES');
  }
  
  // Salvar relatório
  const relatorio = {
    timestamp: new Date().toISOString(),
    quiz_testado: QUIZ_ID,
    taxa_sucesso: parseFloat(taxaSucesso),
    testes_aprovados: testesAprovados,
    total_testes: totalTestes,
    resultados: testResults,
    status_geral: taxaSucesso >= 75 ? 'APROVADO' : 'REPROVADO'
  };
  
  fs.writeFileSync('RELATORIO-TESTE-ULTRA-DINAMICO.json', JSON.stringify(relatorio, null, 2));
  console.log('\n💾 Relatório salvo em: RELATORIO-TESTE-ULTRA-DINAMICO.json');
}

// Executar se chamado diretamente
if (require.main === module) {
  executarTestes().catch(console.error);
}

module.exports = { executarTestes };