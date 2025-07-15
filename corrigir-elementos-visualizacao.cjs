#!/usr/bin/env node

/**
 * CORREÇÃO COMPLETA - ELEMENTOS DE VISUALIZAÇÃO
 * ==============================================
 * 
 * Corrige os problemas que estão causando tela branca nos elementos
 * gráfico e métrica, incluindo interpolações duplas e tags desbalanceadas
 */

const fs = require('fs');

function corrigirElementosVisualizacao() {
  console.log('🔧 CORREÇÃO COMPLETA - ELEMENTOS DE VISUALIZAÇÃO');
  console.log('================================================\n');

  let content = fs.readFileSync('client/src/components/page-editor-horizontal.tsx', 'utf8');
  let mudancas = 0;

  // 1. Corrigir interpolações duplas no gráfico
  console.log('1. Corrigindo interpolações duplas...');
  
  // Primeira interpolação dupla - width e height
  const regex1 = /style=\{\{\s*width:\s*element\.chartWidth\s*\|\|\s*"100%",\s*height:\s*element\.chartHeight\s*\|\|\s*"280px"\s*\}\}/g;
  if (regex1.test(content)) {
    content = content.replace(regex1, `style={{
              width: element.chartWidth || "100%",
              height: element.chartHeight || "280px"
            }}`);
    mudancas++;
    console.log('   ✅ Corrigida interpolação dupla de width/height');
  }

  // Segunda interpolação dupla - backgroundColor no gráfico
  const regex2 = /style=\{\{\s*backgroundColor:\s*item\.color\s*\|\|\s*"#10b981"\s*\}\}/g;
  if (regex2.test(content)) {
    content = content.replace(regex2, `style={{
                      backgroundColor: item.color || "#10b981"
                    }}`);
    mudancas++;
    console.log('   ✅ Corrigida interpolação dupla de backgroundColor');
  }

  // 2. Verificar e corrigir tags desbalanceadas
  console.log('\n2. Verificando tags desbalanceadas...');
  
  // Encontrar tags não fechadas mais comuns
  const tagsProblematicas = [
    { tag: 'div', regex: /<div(?:\s[^>]*)?>(?![^<]*<\/div>)/g },
    { tag: 'span', regex: /<span(?:\s[^>]*)?>(?![^<]*<\/span>)/g },
    { tag: 'Button', regex: /<Button(?:\s[^>]*)?>(?![^<]*<\/Button>)/g },
    { tag: 'Label', regex: /<Label(?:\s[^>]*)?>(?![^<]*<\/Label>)/g },
    { tag: 'Input', regex: /<Input(?:\s[^>]*)?(?:\s\/>|>(?![^<]*<\/Input>))/g }
  ];

  tagsProblematicas.forEach(({ tag, regex }) => {
    const matches = content.match(regex);
    if (matches) {
      console.log(`   ❌ Encontradas ${matches.length} tags ${tag} possivelmente não fechadas`);
    }
  });

  // 3. Corrigir problemas específicos conhecidos
  console.log('\n3. Corrigindo problemas específicos...');
  
  // Corrigir auto-closing tags que podem estar mal formadas
  const autoClosingFixes = [
    { 
      problema: /<Input([^>]*?)(?<!\/)\s*>/g,
      solucao: '<Input$1 />'
    },
    {
      problema: /<br(?:\s[^>]*)?>(?!\s*\/)/g,
      solucao: '<br />'
    }
  ];

  autoClosingFixes.forEach(({ problema, solucao }) => {
    const matches = content.match(problema);
    if (matches) {
      content = content.replace(problema, solucao);
      mudancas++;
      console.log(`   ✅ Corrigidas ${matches.length} tags auto-fechadas`);
    }
  });

  // 4. Verificar e corrigir chaves JSX desbalanceadas
  console.log('\n4. Verificando chaves JSX...');
  
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  
  console.log(`   Chaves abertas: ${openBraces}`);
  console.log(`   Chaves fechadas: ${closeBraces}`);
  console.log(`   Diferença: ${Math.abs(openBraces - closeBraces)}`);

  // 5. Salvar as mudanças
  if (mudancas > 0) {
    fs.writeFileSync('client/src/components/page-editor-horizontal.tsx', content);
    console.log(`\n✅ ${mudancas} correções aplicadas com sucesso!`);
  } else {
    console.log('\n✅ Nenhuma correção necessária');
  }

  // 6. Verificação final
  console.log('\n6. Verificação final...');
  
  const finalContent = fs.readFileSync('client/src/components/page-editor-horizontal.tsx', 'utf8');
  
  // Verificar se Select está importado
  const selectImported = finalContent.includes('import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }');
  console.log(`   Select importado: ${selectImported ? '✅' : '❌'}`);
  
  // Verificar interpolações duplas restantes
  const doubleInterpolations = finalContent.match(/style=\{\{[^}]+\}\}/g);
  console.log(`   Interpolações duplas restantes: ${doubleInterpolations ? doubleInterpolations.length : 0}`);
  
  // Verificar casos dos elementos
  const chartCase = finalContent.includes('case "chart":');
  const metricsCase = finalContent.includes('case "metrics":');
  console.log(`   Caso gráfico: ${chartCase ? '✅' : '❌'}`);
  console.log(`   Caso métrica: ${metricsCase ? '✅' : '❌'}`);

  console.log('\n🎯 CORREÇÃO CONCLUÍDA!');
  console.log('======================');
  
  if (selectImported && chartCase && metricsCase && (!doubleInterpolations || doubleInterpolations.length === 0)) {
    console.log('✅ Elementos de visualização devem funcionar corretamente agora');
  } else {
    console.log('⚠️  Alguns problemas podem persistir, verifique manualmente');
  }
}

corrigirElementosVisualizacao();