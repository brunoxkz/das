#!/usr/bin/env node

/**
 * DEBUG ESPECÍFICO - ELEMENTOS DE VISUALIZAÇÃO
 * =============================================
 * 
 * Testa especificamente os elementos gráfico e métrica para identificar
 * problemas que causam tela branca
 */

const fs = require('fs');

function debugElementsVisualization() {
  console.log('🔍 DEBUG ELEMENTOS DE VISUALIZAÇÃO');
  console.log('===================================\n');

  const content = fs.readFileSync('client/src/components/page-editor-horizontal.tsx', 'utf8');

  // 1. Verificar se Select foi importado corretamente
  const selectImport = content.includes('import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }');
  console.log(`✅ Importação Select: ${selectImport ? 'ENCONTRADA' : 'AUSENTE'}`);

  // 2. Verificar casos específicos dos elementos
  const chartCase = content.includes('case "chart":');
  const metricsCase = content.includes('case "metrics":');
  
  console.log(`✅ Caso gráfico: ${chartCase ? 'ENCONTRADO' : 'AUSENTE'}`);
  console.log(`✅ Caso métrica: ${metricsCase ? 'ENCONTRADO' : 'AUSENTE'}`);

  // 3. Verificar se TrendingUp foi importado
  const trendingUpImport = content.includes('TrendingUp');
  console.log(`✅ TrendingUp importado: ${trendingUpImport ? 'SIM' : 'NÃO'}`);

  // 4. Verificar interpolações duplas nos elementos
  const chartSection = content.match(/case "chart":(.*?)(?=case "|default:)/s);
  const metricsSection = content.match(/case "metrics":(.*?)(?=case "|default:)/s);

  if (chartSection) {
    const chartCode = chartSection[1];
    const chartDoubleInterpolations = chartCode.match(/style=\{\{[^}]+\}\}/g);
    console.log(`✅ Interpolações duplas no gráfico: ${chartDoubleInterpolations ? chartDoubleInterpolations.length : 0}`);
    
    if (chartDoubleInterpolations) {
      console.log('❌ INTERPOLAÇÕES DUPLAS ENCONTRADAS NO GRÁFICO:');
      chartDoubleInterpolations.forEach((match, index) => {
        console.log(`  ${index + 1}. ${match}`);
      });
    }
  }

  if (metricsSection) {
    const metricsCode = metricsSection[1];
    const metricsDoubleInterpolations = metricsCode.match(/style=\{\{[^}]+\}\}/g);
    console.log(`✅ Interpolações duplas na métrica: ${metricsDoubleInterpolations ? metricsDoubleInterpolations.length : 0}`);
    
    if (metricsDoubleInterpolations) {
      console.log('❌ INTERPOLAÇÕES DUPLAS ENCONTRADAS NA MÉTRICA:');
      metricsDoubleInterpolations.forEach((match, index) => {
        console.log(`  ${index + 1}. ${match}`);
      });
    }
  }

  // 5. Verificar variáveis undefined
  const undefinedVars = content.match(/\b(var_[a-zA-Z_]+|pergunta_[a-zA-Z_]+)\b/g);
  if (undefinedVars) {
    const uniqueVars = [...new Set(undefinedVars)];
    console.log(`❌ Variáveis undefined encontradas: ${uniqueVars.length}`);
    uniqueVars.forEach((varName, index) => {
      console.log(`  ${index + 1}. ${varName}`);
    });
  } else {
    console.log('✅ Nenhuma variável undefined encontrada');
  }

  // 6. Verificar erros de sintaxe JSX
  const jsxErrors = [];
  
  // Verificar tags não fechadas
  const openTags = content.match(/<[a-zA-Z][^>]*(?<!\/)>/g) || [];
  const closeTags = content.match(/<\/[a-zA-Z][^>]*>/g) || [];
  
  if (openTags.length !== closeTags.length) {
    jsxErrors.push(`Tags desbalanceadas: ${openTags.length} abertas, ${closeTags.length} fechadas`);
  }

  // Verificar chaves JSX desbalanceadas
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    jsxErrors.push(`Chaves JSX desbalanceadas: ${openBraces} abertas, ${closeBraces} fechadas`);
  }

  console.log(`✅ Erros de sintaxe JSX: ${jsxErrors.length}`);
  
  if (jsxErrors.length > 0) {
    console.log('❌ ERROS DE SINTAXE ENCONTRADOS:');
    jsxErrors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }

  // 7. Resumo final
  console.log('\n📊 RESUMO FINAL:');
  console.log('================');
  
  const allGood = selectImport && chartCase && metricsCase && trendingUpImport && 
                  jsxErrors.length === 0 && !undefinedVars;
  
  if (allGood) {
    console.log('🎯 TODOS OS ELEMENTOS DEVEM FUNCIONAR CORRETAMENTE');
    console.log('✅ Importações: OK');
    console.log('✅ Casos: OK');
    console.log('✅ Sintaxe: OK');
    console.log('✅ Variáveis: OK');
  } else {
    console.log('⚠️  PROBLEMAS ENCONTRADOS - TELA BRANCA PODE OCORRER');
    console.log(`❌ Importações: ${selectImport ? 'OK' : 'ERRO'}`);
    console.log(`❌ Casos: ${chartCase && metricsCase ? 'OK' : 'ERRO'}`);
    console.log(`❌ Sintaxe: ${jsxErrors.length === 0 ? 'OK' : 'ERRO'}`);
    console.log(`❌ Variáveis: ${!undefinedVars ? 'OK' : 'ERRO'}`);
  }
}

debugElementsVisualization();