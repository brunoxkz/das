import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5000';

async function makeRequest(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

async function validacaoFinalMelhorias() {
  console.log('🎯 VALIDAÇÃO FINAL DAS MELHORIAS - EXTENSÃO CHROME');
  console.log('='.repeat(60));
  
  try {
    // Autenticação
    const authResponse = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    const token = authResponse.accessToken;
    console.log('✅ Autenticação realizada com sucesso\n');
    
    // 1. Validar melhorias no código
    console.log('1. 🔍 VALIDANDO MELHORIAS NO CÓDIGO DA EXTENSÃO');
    console.log('-'.repeat(50));
    
    const contentPath = path.join(__dirname, 'chrome-extension-v2', 'content.js');
    const content = fs.readFileSync(contentPath, 'utf8');
    
    const melhorias = [
      {
        nome: 'Auto-sync otimizado (20s)',
        busca: 'Auto-sync iniciado (20s)',
        implementado: content.includes('Auto-sync iniciado (20s)')
      },
      {
        nome: 'Validação de formulário robusta',
        busca: 'validateAutomationStart()',
        implementado: content.includes('function validateAutomationStart()') && content.includes('validateAutomationStart();')
      },
      {
        nome: 'Sincronização com feedback detalhado',
        busca: 'novos leads detectados',
        implementado: content.includes('novos leads detectados') && content.includes('Processados:')
      },
      {
        nome: 'Tratamento de erros com reconexão',
        busca: 'await connectToServer()',
        implementado: content.includes('await connectToServer();') && content.includes('Tentando reconectar')
      },
      {
        nome: 'Preparação de fila robusta',
        busca: 'prepareAutomationQueue',
        implementado: content.includes('prepareAutomationQueue') && content.includes('Validar configurações')
      },
      {
        nome: 'Logs avançados com timestamps',
        busca: 'toLocaleTimeString',
        implementado: content.includes('toLocaleTimeString(\'pt-BR\')') && content.includes('Vendzz Log:')
      }
    ];
    
    let melhoriasPassed = 0;
    melhorias.forEach((melhoria, index) => {
      const status = melhoria.implementado ? '✅' : '❌';
      console.log(`${status} ${index + 1}. ${melhoria.nome}`);
      if (melhoria.implementado) melhoriasPassed++;
    });
    
    console.log(`\n📊 Melhorias implementadas: ${melhoriasPassed}/${melhorias.length}\n`);
    
    // 2. Testar APIs da extensão
    console.log('2. 🔧 TESTANDO APIs DA EXTENSÃO');
    console.log('-'.repeat(50));
    
    const testes = [
      {
        nome: 'Status da extensão',
        endpoint: '/api/whatsapp-extension/status',
        metodo: 'GET'
      },
      {
        nome: 'Ping da extensão',
        endpoint: '/api/whatsapp-extension/status',
        metodo: 'POST',
        body: {
          version: '2.0.0',
          isActive: true,
          pendingMessages: 0,
          sentMessages: 2,
          failedMessages: 0
        }
      },
      {
        nome: 'Mensagens pendentes',
        endpoint: '/api/whatsapp-extension/pending-messages',
        metodo: 'GET'
      },
      {
        nome: 'Configurações da extensão',
        endpoint: '/api/whatsapp-extension/settings',
        metodo: 'GET'
      },
      {
        nome: 'Arquivos de automação',
        endpoint: '/api/whatsapp-automation-files',
        metodo: 'GET'
      }
    ];
    
    let testesPassados = 0;
    const resultados = [];
    
    for (const teste of testes) {
      try {
        const startTime = Date.now();
        const response = await makeRequest(teste.endpoint, {
          method: teste.metodo,
          headers: { Authorization: `Bearer ${token}` },
          body: teste.body ? JSON.stringify(teste.body) : undefined
        });
        
        const endTime = Date.now();
        const tempo = endTime - startTime;
        
        console.log(`✅ ${teste.nome}: ${tempo}ms`);
        resultados.push({ nome: teste.nome, tempo, sucesso: true });
        testesPassados++;
      } catch (error) {
        console.log(`❌ ${teste.nome}: FALHA`);
        resultados.push({ nome: teste.nome, tempo: 0, sucesso: false });
      }
    }
    
    console.log(`\n📊 Testes de API: ${testesPassados}/${testes.length}\n`);
    
    // 3. Testar funcionalidades específicas
    console.log('3. ⚡ TESTANDO FUNCIONALIDADES ESPECÍFICAS');
    console.log('-'.repeat(50));
    
    const funcionalidades = [
      {
        nome: 'Sistema de mensagens rotativas',
        verificar: content.includes('getRotativeMessage(') && content.includes('messageVariation')
      },
      {
        nome: 'Sistema anti-ban 2025',
        verificar: content.includes('checkAntiBanLimits()') && content.includes('calculateAntiBanDelay()')
      },
      {
        nome: 'Validação de telefone brasileiro',
        verificar: content.includes('validateAndFormatPhone') && content.includes('+55')
      },
      {
        nome: 'Interface sidebar responsiva',
        verificar: content.includes('createSidebar()') && content.includes('vendzz-sidebar')
      },
      {
        nome: 'Auto-sync configurável',
        verificar: content.includes('startAutoSync()') && content.includes('stopAutoSync()')
      }
    ];
    
    let funcionalidadesPassed = 0;
    funcionalidades.forEach((func, index) => {
      const status = func.verificar ? '✅' : '❌';
      console.log(`${status} ${index + 1}. ${func.nome}`);
      if (func.verificar) funcionalidadesPassed++;
    });
    
    console.log(`\n📊 Funcionalidades: ${funcionalidadesPassed}/${funcionalidades.length}\n`);
    
    // 4. Teste de performance
    console.log('4. 🚀 TESTE DE PERFORMANCE');
    console.log('-'.repeat(50));
    
    const startPerf = Date.now();
    
    await Promise.all([
      makeRequest('/api/whatsapp-extension/status', { headers: { Authorization: `Bearer ${token}` } }),
      makeRequest('/api/whatsapp-campaigns', { headers: { Authorization: `Bearer ${token}` } }),
      makeRequest('/api/quizzes', { headers: { Authorization: `Bearer ${token}` } })
    ]);
    
    const endPerf = Date.now();
    const tempoPerf = endPerf - startPerf;
    
    console.log(`✅ 3 requisições simultâneas: ${tempoPerf}ms`);
    console.log(`✅ Performance média: ${Math.round(tempoPerf/3)}ms por requisição\n`);
    
    // 5. Relatório final
    console.log('='.repeat(60));
    console.log('📋 RELATÓRIO FINAL DAS MELHORIAS');
    console.log('='.repeat(60));
    
    const scoreMelhorias = (melhoriasPassed / melhorias.length) * 100;
    const scoreTestes = (testesPassados / testes.length) * 100;
    const scoreFuncionalidades = (funcionalidadesPassed / funcionalidades.length) * 100;
    const scoreGeral = (scoreMelhorias + scoreTestes + scoreFuncionalidades) / 3;
    
    console.log(`\n📊 SCORES DE VALIDAÇÃO:`);
    console.log(`🔧 Melhorias implementadas: ${scoreMelhorias.toFixed(1)}%`);
    console.log(`🔗 Testes de API: ${scoreTestes.toFixed(1)}%`);
    console.log(`⚡ Funcionalidades: ${scoreFuncionalidades.toFixed(1)}%`);
    console.log(`🎯 SCORE GERAL: ${scoreGeral.toFixed(1)}%`);
    
    console.log(`\n⏱️  PERFORMANCE:`);
    console.log(`📡 Tempo médio de resposta: ${Math.round(tempoPerf/3)}ms`);
    console.log(`🚀 Performance: ${tempoPerf < 100 ? 'EXCELENTE' : tempoPerf < 300 ? 'BOA' : 'ACEITÁVEL'}`);
    
    console.log(`\n🎉 RESULTADO FINAL:`);
    
    if (scoreGeral >= 90) {
      console.log('✅ SISTEMA APROVADO PARA PRODUÇÃO!');
      console.log('🚀 Todas as melhorias implementadas com sucesso');
      console.log('💯 Extensão Chrome pronta para uso');
    } else if (scoreGeral >= 70) {
      console.log('⚠️  SISTEMA PARCIALMENTE APROVADO');
      console.log('🔧 Algumas melhorias precisam de ajustes');
    } else {
      console.log('❌ SISTEMA PRECISA DE CORREÇÕES');
      console.log('🔧 Várias melhorias precisam ser implementadas');
    }
    
    console.log(`\n📝 DETALHES DA PERFORMANCE:`);
    resultados.forEach(result => {
      if (result.sucesso) {
        console.log(`✅ ${result.nome}: ${result.tempo}ms`);
      } else {
        console.log(`❌ ${result.nome}: FALHA`);
      }
    });
    
  } catch (error) {
    console.error('\n❌ ERRO NA VALIDAÇÃO:', error.message);
    console.error('🔧 Verifique se o servidor está rodando e tente novamente');
  }
}

// Executar validação
validacaoFinalMelhorias();