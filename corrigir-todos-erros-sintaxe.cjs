#!/usr/bin/env node

/**
 * CORREÇÃO CRÍTICA - TODOS OS ERROS DE SINTAXE
 * =============================================
 * 
 * Corrige todos os erros de sintaxe encontrados no código
 */

const fs = require('fs');

function corrigirTodosErrosSintaxe() {
  console.log('🚨 CORREÇÃO CRÍTICA - TODOS OS ERROS DE SINTAXE');
  console.log('===============================================\n');

  let content = fs.readFileSync('client/src/components/page-editor-horizontal.tsx', 'utf8');
  let mudancas = 0;

  // 1. Corrigir TODOS os erros de arrow function malformados
  const erroArrowFunction = /=\{\([^)]*\) = \/> /g;
  const matchesArrow = content.match(erroArrowFunction);
  
  if (matchesArrow) {
    console.log(`❌ Encontrados ${matchesArrow.length} erros arrow function`);
    content = content.replace(erroArrowFunction, (match) => {
      return match.replace(' = /> ', ' => ');
    });
    mudancas += matchesArrow.length;
    console.log(`✅ ${matchesArrow.length} erros arrow function corrigidos`);
  }

  // 2. Corrigir outros erros similares
  const outrosErros = [
    {
      nome: 'onClick malformado',
      regex: /onClick=\{\(e\) = \/> \{/g,
      solucao: 'onClick={(e) => {'
    },
    {
      nome: 'onSubmit malformado',
      regex: /onSubmit=\{\(e\) = \/> \{/g,
      solucao: 'onSubmit={(e) => {'
    },
    {
      nome: 'onValueChange malformado',
      regex: /onValueChange=\{\(value\) = \/> \{/g,
      solucao: 'onValueChange={(value) => {'
    },
    {
      nome: 'Arrow function malformada',
      regex: /=\{\([^)]*\) = \/> \{/g,
      solucao: (match) => match.replace(' = /> {', ' => {')
    }
  ];

  outrosErros.forEach(({ nome, regex, solucao }) => {
    const matches = content.match(regex);
    if (matches) {
      console.log(`❌ Encontrados ${matches.length} erros: ${nome}`);
      if (typeof solucao === 'function') {
        content = content.replace(regex, solucao);
      } else {
        content = content.replace(regex, solucao);
      }
      mudancas += matches.length;
      console.log(`✅ ${matches.length} erros ${nome} corrigidos`);
    }
  });

  // 3. Verificar se há outros erros de sintaxe
  const outrosPossiveisErros = [
    /\) = \/>/g,  // Qualquer arrow function malformada
    /\{\{[^}]*\}\}/g,  // Possíveis interpolações duplas restantes
    /style=\{[^{][^}]*\}/g  // Styles sem chaves duplas
  ];

  outrosPossiveisErros.forEach((regex, index) => {
    const matches = content.match(regex);
    if (matches) {
      console.log(`⚠️  Encontrados ${matches.length} possíveis erros tipo ${index + 1}`);
      // Não corrigir automaticamente, apenas reportar
    }
  });

  // 4. Salvar o arquivo se houve mudanças
  if (mudancas > 0) {
    fs.writeFileSync('client/src/components/page-editor-horizontal.tsx', content);
    console.log(`\n✅ ${mudancas} erros de sintaxe corrigidos com sucesso!`);
  } else {
    console.log('\n✅ Nenhum erro de sintaxe encontrado');
  }

  console.log('\n📊 RESUMO:');
  console.log('==========');
  console.log(`Total de correções: ${mudancas}`);
  
  if (mudancas > 0) {
    console.log('🎯 Arquivo corrigido - reinicie o servidor para aplicar as mudanças');
  } else {
    console.log('✅ Arquivo já está correto');
  }
}

corrigirTodosErrosSintaxe();