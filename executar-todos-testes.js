/**
 * EXECUTOR DE TODOS OS TESTES - ESTRATÉGIA COMPLETA
 * Executa todas as 5 estratégias de teste simultaneamente
 */

import { spawn } from 'child_process';
import path from 'path';

// Lista de todos os testes
const TESTS = [
  {
    name: 'Teste de Regressão Automático',
    file: 'teste-regressao-automatico.js',
    description: 'Foca nos erros específicos identificados e re-testa após correções'
  },
  {
    name: 'Teste de Carga Inteligente',
    file: 'teste-carga-inteligente.js',
    description: 'Simula cenários reais de uso com carga gradual'
  },
  {
    name: 'Teste de Fluxo Completo',
    file: 'teste-fluxo-completo.js',
    description: 'Simula jornada completa do usuário do início ao fim'
  },
  {
    name: 'Teste de Recuperação de Falhas',
    file: 'teste-recuperacao-falhas.js',
    description: 'Simula falhas específicas e testa recuperação do sistema'
  }
];

// Resultados consolidados
const consolidatedResults = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  testDetails: [],
  startTime: null,
  endTime: null,
  duration: 0
};

function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
}

function executeTest(test) {
  return new Promise((resolve) => {
    console.log(`🚀 Iniciando: ${test.name}`);
    console.log(`   Arquivo: ${test.file}`);
    console.log(`   Descrição: ${test.description}`);
    
    const startTime = Date.now();
    const child = spawn('node', [test.file], {
      stdio: ['inherit', 'pipe', 'pipe'],
      cwd: process.cwd()
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      
      const result = {
        test: test.name,
        file: test.file,
        exitCode: code,
        duration: duration,
        success: code === 0,
        stdout: stdout,
        stderr: stderr,
        summary: extractSummary(stdout)
      };

      console.log(`${result.success ? '✅' : '❌'} ${test.name} - ${formatTime(duration)} - Código: ${code}`);
      
      if (result.summary) {
        console.log(`   📊 ${result.summary}`);
      }
      
      if (!result.success && stderr) {
        console.log(`   🚨 Erro: ${stderr.substring(0, 200)}...`);
      }
      
      resolve(result);
    });

    child.on('error', (error) => {
      const duration = Date.now() - startTime;
      console.log(`❌ ${test.name} - ERRO FATAL: ${error.message}`);
      
      resolve({
        test: test.name,
        file: test.file,
        exitCode: -1,
        duration: duration,
        success: false,
        stdout: '',
        stderr: error.message,
        summary: 'ERRO FATAL'
      });
    });
  });
}

function extractSummary(stdout) {
  // Extrair informações relevantes do output
  const lines = stdout.split('\n');
  
  // Procurar por linhas de resumo
  const summaryPatterns = [
    /Taxa de Sucesso: ([\d.]+)%/,
    /Sucesso: (\d+)\/(\d+)/,
    /PASSOU.*?(\d+).*?FALHOU.*?(\d+)/,
    /(\d+)% de sucesso/,
    /Performance.*?(\d+)ms/,
    /EXCELENTE|APROVADO|FUNCIONAL|CRÍTICO/
  ];
  
  for (const line of lines) {
    for (const pattern of summaryPatterns) {
      const match = line.match(pattern);
      if (match) {
        return line.trim();
      }
    }
  }
  
  return null;
}

function generateConsolidatedReport(results) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 RELATÓRIO CONSOLIDADO - TODAS AS ESTRATÉGIAS DE TESTE');
  console.log('='.repeat(80));
  
  // Estatísticas gerais
  const totalDuration = consolidatedResults.duration;
  const successfulTests = results.filter(r => r.success).length;
  const failedTests = results.filter(r => !r.success).length;
  const successRate = (successfulTests / results.length * 100).toFixed(1);
  
  console.log(`\n📈 RESUMO GERAL:`);
  console.log(`   Total de Estratégias: ${results.length}`);
  console.log(`   Estratégias Bem-sucedidas: ${successfulTests}`);
  console.log(`   Estratégias Falharam: ${failedTests}`);
  console.log(`   Taxa de Sucesso Geral: ${successRate}%`);
  console.log(`   Tempo Total de Execução: ${formatTime(totalDuration)}`);
  
  // Detalhes por teste
  console.log(`\n📋 DETALHES POR ESTRATÉGIA:`);
  results.forEach((result, index) => {
    const status = result.success ? '✅ PASSOU' : '❌ FALHOU';
    console.log(`   ${index + 1}. ${result.test}`);
    console.log(`      Status: ${status}`);
    console.log(`      Duração: ${formatTime(result.duration)}`);
    console.log(`      Código de Saída: ${result.exitCode}`);
    
    if (result.summary) {
      console.log(`      Resumo: ${result.summary}`);
    }
    
    if (!result.success && result.stderr) {
      console.log(`      Erro: ${result.stderr.substring(0, 150)}...`);
    }
    console.log('');
  });
  
  // Análise de performance
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const fastestTest = results.reduce((min, r) => r.duration < min.duration ? r : min);
  const slowestTest = results.reduce((max, r) => r.duration > max.duration ? r : max);
  
  console.log(`📊 ANÁLISE DE PERFORMANCE:`);
  console.log(`   Tempo Médio por Estratégia: ${formatTime(avgDuration)}`);
  console.log(`   Estratégia Mais Rápida: ${fastestTest.test} (${formatTime(fastestTest.duration)})`);
  console.log(`   Estratégia Mais Lenta: ${slowestTest.test} (${formatTime(slowestTest.duration)})`);
  
  // Análise de cobertura
  console.log(`\n🎯 ANÁLISE DE COBERTURA:`);
  const coverageAreas = {
    'Regressão': results.find(r => r.test.includes('Regressão'))?.success || false,
    'Carga': results.find(r => r.test.includes('Carga'))?.success || false,
    'Fluxo Completo': results.find(r => r.test.includes('Fluxo'))?.success || false,
    'Recuperação': results.find(r => r.test.includes('Recuperação'))?.success || false
  };
  
  Object.entries(coverageAreas).forEach(([area, passed]) => {
    const status = passed ? '✅' : '❌';
    console.log(`   ${status} ${area}: ${passed ? 'COBERTO' : 'FALHOU'}`);
  });
  
  // Avaliação final do sistema
  console.log(`\n🎯 AVALIAÇÃO FINAL DO SISTEMA:`);
  
  if (parseFloat(successRate) === 100) {
    console.log(`   🏆 SISTEMA EXCELENTE: Passou em todas as estratégias de teste!`);
    console.log(`   🚀 PRONTO PARA PRODUÇÃO com alta confiança`);
  } else if (parseFloat(successRate) >= 75) {
    console.log(`   ✅ SISTEMA BOM: Maioria das estratégias passaram`);
    console.log(`   ⚡ PRONTO PARA PRODUÇÃO com pequenos ajustes`);
  } else if (parseFloat(successRate) >= 50) {
    console.log(`   ⚠️  SISTEMA MÉDIO: Precisa de melhorias`);
    console.log(`   🔧 PRECISA DE CORREÇÕES antes da produção`);
  } else {
    console.log(`   🚨 SISTEMA CRÍTICO: Muitas falhas detectadas`);
    console.log(`   🛑 NÃO RECOMENDADO para produção no estado atual`);
  }
  
  // Recomendações
  console.log(`\n💡 PRÓXIMOS PASSOS:`);
  
  if (failedTests > 0) {
    console.log(`   1. 🔧 Corrigir estratégias que falharam:`);
    results.filter(r => !r.success).forEach(r => {
      console.log(`      - ${r.test}`);
    });
  }
  
  if (avgDuration > 60000) {
    console.log(`   2. ⚡ Otimizar performance dos testes (tempo médio muito alto)`);
  }
  
  if (parseFloat(successRate) >= 75) {
    console.log(`   3. 🚀 Executar testes em ambiente de produção`);
    console.log(`   4. 📊 Implementar monitoramento contínuo`);
  }
  
  console.log(`   5. 📝 Documentar resultados e manter testes atualizados`);
  
  console.log('\n' + '='.repeat(80));
  console.log(`🎉 ANÁLISE COMPLETA FINALIZADA - ${formatTime(totalDuration)}`);
  console.log('='.repeat(80));
}

async function runAllTests() {
  console.log('🔥 EXECUTANDO TODAS AS ESTRATÉGIAS DE TESTE');
  console.log('🎯 Análise completa do sistema Vendzz');
  console.log('=' .repeat(80));
  
  consolidatedResults.startTime = Date.now();
  
  try {
    // Executar todos os testes em paralelo
    console.log(`\n🚀 Iniciando ${TESTS.length} estratégias de teste simultaneamente...\n`);
    
    const testPromises = TESTS.map(test => executeTest(test));
    const results = await Promise.all(testPromises);
    
    consolidatedResults.endTime = Date.now();
    consolidatedResults.duration = consolidatedResults.endTime - consolidatedResults.startTime;
    
    // Aguardar um pouco para garantir que todos os outputs foram processados
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Gerar relatório consolidado
    generateConsolidatedReport(results);
    
    // Salvar resultados para referência
    consolidatedResults.testDetails = results;
    
    return results;
    
  } catch (error) {
    console.error('🚨 ERRO CRÍTICO na execução dos testes:', error);
    
    consolidatedResults.endTime = Date.now();
    consolidatedResults.duration = consolidatedResults.endTime - consolidatedResults.startTime;
    
    console.log(`\n❌ Execução interrompida após ${formatTime(consolidatedResults.duration)}`);
    return [];
  }
}

// Executar se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('🚨 ERRO FATAL:', error);
      process.exit(1);
    });
}

export { runAllTests, TESTS };