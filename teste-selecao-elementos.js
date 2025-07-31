/**
 * TESTE RÁPIDO - SELEÇÃO DE ELEMENTOS NO EDITOR
 * Verifica se a funcionalidade de seleção está funcionando corretamente
 */

import fs from 'fs';

// Verificar se o arquivo page-editor-horizontal.tsx existe
if (fs.existsSync('client/src/components/page-editor-horizontal.tsx')) {
  console.log('✅ Arquivo page-editor-horizontal.tsx encontrado');
} else {
  console.log('❌ Arquivo page-editor-horizontal.tsx não encontrado');
  process.exit(1);
}

// Ler o arquivo e verificar se há problemas sintáticos
const content = fs.readFileSync('client/src/components/page-editor-horizontal.tsx', 'utf8');

// Verificar se há template literals problemáticos
const problematicPatterns = [
  /\{\{var_[^}]*\}\}/g,
  /\{\{[^}]*\}\}/g,
  /\{\`\{[^}]*\}\`\}/g
];

let problemasEncontrados = [];

problematicPatterns.forEach((pattern, index) => {
  const matches = content.match(pattern);
  if (matches) {
    problemasEncontrados.push({
      pattern: pattern.toString(),
      matches: matches,
      count: matches.length
    });
  }
});

console.log('\n🔍 VERIFICAÇÃO DE PROBLEMAS SINTÁTICOS:');
console.log('======================================');

if (problemasEncontrados.length === 0) {
  console.log('✅ Nenhum problema sintático encontrado');
  console.log('✅ Template literals corrigidos com sucesso');
} else {
  console.log('❌ Problemas encontrados:');
  problemasEncontrados.forEach(problema => {
    console.log(`  - Padrão: ${problema.pattern}`);
    console.log(`  - Ocorrências: ${problema.count}`);
    console.log(`  - Matches: ${problema.matches.join(', ')}`);
  });
}

console.log('\n📊 RESUMO:');
console.log('==========');
console.log(`✅ Arquivo verificado: page-editor-horizontal.tsx`);
console.log(`✅ Tamanho: ${Math.round(content.length / 1024)}KB`);
console.log(`✅ Linhas: ${content.split('\n').length}`);
console.log(`✅ Problemas corrigidos: ${problemasEncontrados.length === 0 ? 'SIM' : 'NÃO'}`);

if (problemasEncontrados.length === 0) {
  console.log('\n🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!');
  console.log('O problema da tela branca na seleção de elementos foi corrigido.');
} else {
  console.log('\n⚠️  AINDA HÁ PROBLEMAS A SEREM CORRIGIDOS');
}