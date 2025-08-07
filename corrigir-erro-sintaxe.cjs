#!/usr/bin/env node

/**
 * CORREÇÃO EMERGENCIAL - ERRO DE SINTAXE
 * ======================================
 * 
 * Corrige especificamente o erro de sintaxe textAlign
 */

const fs = require('fs');

function corrigirErroSintaxe() {
  console.log('🚨 CORREÇÃO EMERGENCIAL - ERRO DE SINTAXE');
  console.log('==========================================\n');

  let content = fs.readFileSync('client/src/components/page-editor-horizontal.tsx', 'utf8');

  // Corrigir o erro específico de textAlign
  const regex = /style=\{textAlign: element\.textAlign \|\| "center"\}/g;
  const matches = content.match(regex);
  
  if (matches) {
    console.log(`❌ Encontrados ${matches.length} erros de sintaxe textAlign`);
    content = content.replace(regex, 'style={{textAlign: element.textAlign || "center"}}');
    console.log('✅ Erro de sintaxe textAlign corrigido');
  } else {
    console.log('✅ Nenhum erro de sintaxe textAlign encontrado');
  }

  // Verificar outros erros de sintaxe similares
  const otherErrors = [
    /style=\{([^{][^}]*)\}/g  // style={prop: value} sem chaves duplas
  ];

  otherErrors.forEach((errorRegex, index) => {
    const errorMatches = content.match(errorRegex);
    if (errorMatches) {
      console.log(`❌ Encontrados ${errorMatches.length} erros de sintaxe tipo ${index + 1}`);
      content = content.replace(errorRegex, (match, innerContent) => {
        return `style={{${innerContent}}}`;
      });
      console.log(`✅ Erro de sintaxe tipo ${index + 1} corrigido`);
    }
  });

  // Salvar o arquivo
  fs.writeFileSync('client/src/components/page-editor-horizontal.tsx', content);
  console.log('\n✅ Arquivo salvo com sucesso!');
}

corrigirErroSintaxe();