#!/usr/bin/env node

/**
 * CORREÇÃO CRÍTICA - TODAS AS INTERPOLAÇÕES DUPLAS
 * ==================================================
 * 
 * Remove TODAS as interpolações duplas {{}} do código JSX
 * convertendo para interpolações simples {}
 */

const fs = require('fs');

function corrigirTodasInterpolacoes() {
  console.log('🔧 CORREÇÃO CRÍTICA - TODAS AS INTERPOLAÇÕES DUPLAS');
  console.log('===================================================\n');

  let content = fs.readFileSync('client/src/components/page-editor-horizontal.tsx', 'utf8');
  let mudancas = 0;

  // 1. Identificar todas as interpolações duplas
  const doubleInterpolationRegex = /style=\{\{([^}]+)\}\}/g;
  const matches = content.match(doubleInterpolationRegex);
  
  if (matches) {
    console.log(`❌ Encontradas ${matches.length} interpolações duplas:`);
    matches.forEach((match, index) => {
      console.log(`   ${index + 1}. ${match.substring(0, 80)}...`);
    });

    // 2. Corrigir todas as interpolações duplas
    content = content.replace(doubleInterpolationRegex, (match, innerContent) => {
      mudancas++;
      return `style={${innerContent.trim()}}`;
    });

    console.log(`\n✅ ${mudancas} interpolações duplas corrigidas!`);
  } else {
    console.log('✅ Nenhuma interpolação dupla encontrada');
  }

  // 3. Salvar as mudanças
  if (mudancas > 0) {
    fs.writeFileSync('client/src/components/page-editor-horizontal.tsx', content);
    console.log('\n✅ Arquivo salvo com sucesso!');
  }

  // 4. Verificação final
  const finalContent = fs.readFileSync('client/src/components/page-editor-horizontal.tsx', 'utf8');
  const finalMatches = finalContent.match(doubleInterpolationRegex);
  
  console.log('\n📊 RESULTADO FINAL:');
  console.log('===================');
  console.log(`Interpolações duplas restantes: ${finalMatches ? finalMatches.length : 0}`);
  console.log(`Total de correções: ${mudancas}`);
  
  if (!finalMatches || finalMatches.length === 0) {
    console.log('🎯 SUCESSO! Todas as interpolações duplas foram corrigidas');
  } else {
    console.log('⚠️  Algumas interpolações duplas ainda persistem');
  }
}

corrigirTodasInterpolacoes();