#!/usr/bin/env node

/**
 * DEBUG ESPECÍFICO - VERIFICAR CORREÇÃO DA INTERPOLAÇÃO
 * =====================================================
 * 
 * Verifica se a interpolação dupla foi corrigida corretamente
 */

const fs = require('fs');

const content = fs.readFileSync('client/src/components/page-editor-horizontal.tsx', 'utf8');

// Procurar especificamente pelo elemento métrica
const metricsSection = content.match(/case "metrics":(.*?)(?=case "|default:)/s);

if (metricsSection) {
  console.log('🔍 VERIFICANDO ELEMENTO MÉTRICA');
  console.log('==============================\n');
  
  const metricsCode = metricsSection[1];
  
  // Procurar por interpolações duplas no código de métrica
  const doubleInterpolations = metricsCode.match(/style=\{\{[^}]+\}\}/g);
  
  if (doubleInterpolations) {
    console.log('❌ INTERPOLAÇÕES DUPLAS ENCONTRADAS NO ELEMENTO MÉTRICA:');
    doubleInterpolations.forEach((match, index) => {
      console.log(`${index + 1}. ${match}`);
    });
  } else {
    console.log('✅ NENHUMA INTERPOLAÇÃO DUPLA ENCONTRADA NO ELEMENTO MÉTRICA');
  }
  
  // Procurar por interpolações simples corretas
  const correctInterpolations = metricsCode.match(/style=\{[^{][^}]*\}/g);
  
  if (correctInterpolations) {
    console.log('\n✅ INTERPOLAÇÕES CORRETAS ENCONTRADAS:');
    correctInterpolations.forEach((match, index) => {
      console.log(`${index + 1}. ${match}`);
    });
  }
  
  // Procurar por variáveis undefined
  const undefinedVars = metricsCode.match(/\b(var_[a-zA-Z_]+)\b/g);
  
  if (undefinedVars) {
    console.log('\n❌ VARIÁVEIS UNDEFINED ENCONTRADAS:');
    undefinedVars.forEach((match, index) => {
      console.log(`${index + 1}. ${match}`);
    });
  } else {
    console.log('\n✅ NENHUMA VARIÁVEL UNDEFINED ENCONTRADA');
  }
  
  // Verificar se TrendingUp está sendo usado
  const trendingUpUsage = metricsCode.includes('TrendingUp');
  console.log(`\n📊 TrendingUp usado: ${trendingUpUsage ? '✅ Sim' : '❌ Não'}`);
  
  // Verificar se há erros óbvios de sintaxe
  const syntaxErrors = [];
  
  // Verificar chaves desbalanceadas
  const openBraces = (metricsCode.match(/\{/g) || []).length;
  const closeBraces = (metricsCode.match(/\}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    syntaxErrors.push(`Chaves desbalanceadas: ${openBraces} abertas, ${closeBraces} fechadas`);
  }
  
  // Verificar parênteses desbalanceados
  const openParens = (metricsCode.match(/\(/g) || []).length;
  const closeParens = (metricsCode.match(/\)/g) || []).length;
  
  if (openParens !== closeParens) {
    syntaxErrors.push(`Parênteses desbalanceados: ${openParens} abertas, ${closeParens} fechadas`);
  }
  
  if (syntaxErrors.length > 0) {
    console.log('\n❌ ERROS DE SINTAXE ENCONTRADOS:');
    syntaxErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  } else {
    console.log('\n✅ NENHUM ERRO DE SINTAXE ÓBVIO ENCONTRADO');
  }
  
  console.log('\n📝 RESUMO:');
  console.log('==========');
  console.log(`✅ Interpolações duplas: ${doubleInterpolations ? doubleInterpolations.length : 0}`);
  console.log(`✅ Interpolações corretas: ${correctInterpolations ? correctInterpolations.length : 0}`);
  console.log(`✅ Variáveis undefined: ${undefinedVars ? undefinedVars.length : 0}`);
  console.log(`✅ TrendingUp usado: ${trendingUpUsage ? 'Sim' : 'Não'}`);
  console.log(`✅ Erros de sintaxe: ${syntaxErrors.length}`);
  
  if (doubleInterpolations || undefinedVars || syntaxErrors.length > 0) {
    console.log('\n⚠️  PROBLEMAS ENCONTRADOS - ELEMENTO MÉTRICA PODE NÃO FUNCIONAR');
  } else {
    console.log('\n🎯 ELEMENTO MÉTRICA DEVE FUNCIONAR CORRETAMENTE');
  }
  
} else {
  console.log('❌ ELEMENTO MÉTRICA NÃO ENCONTRADO NO CÓDIGO');
}