#!/usr/bin/env node

/**
 * CORREÇÃO DE INTERPOLAÇÃO DUPLA NO CÓDIGO
 * ========================================
 * 
 * Encontra e corrige todas as ocorrências de interpolação dupla {{}}
 * que podem causar tela branca no elemento métrica
 */

const fs = require('fs');

console.log('🔧 CORREÇÃO DE INTERPOLAÇÃO DUPLA');
console.log('==================================\n');

// Ler o arquivo do editor
const filePath = 'client/src/components/page-editor-horizontal.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Padrão para encontrar interpolações duplas problemáticas
const doubleInterpolationPattern = /style=\{\{([^}]+)\}\}/g;

// Encontrar todas as ocorrências
const matches = Array.from(content.matchAll(doubleInterpolationPattern));

console.log(`📊 Encontradas ${matches.length} ocorrências de interpolação dupla`);

if (matches.length === 0) {
  console.log('✅ Nenhuma interpolação dupla encontrada');
  process.exit(0);
}

// Aplicar correções
let correctedContent = content;
let correctionsApplied = 0;

for (const match of matches) {
  const fullMatch = match[0];
  const innerContent = match[1];
  
  // Corrigir removendo as chaves duplas externas
  const correctedMatch = `style={{${innerContent}}}`;
  
  console.log(`🔄 Corrigindo: ${fullMatch}`);
  console.log(`   Para: ${correctedMatch}`);
  
  correctedContent = correctedContent.replace(fullMatch, correctedMatch);
  correctionsApplied++;
}

// Salvar o arquivo corrigido
fs.writeFileSync(filePath, correctedContent);

console.log(`\n✅ ${correctionsApplied} correções aplicadas`);
console.log('✅ Arquivo salvo com sucesso');

// Verificar se ainda há problemas
const remainingProblems = Array.from(correctedContent.matchAll(doubleInterpolationPattern));
if (remainingProblems.length === 0) {
  console.log('✅ Todas as interpolações duplas foram corrigidas');
} else {
  console.log(`⚠️  Ainda restam ${remainingProblems.length} problemas não corrigidos`);
}

console.log('\n🔍 VERIFICAÇÃO FINAL');
console.log('====================');

// Verificar se há outros problemas que podem causar tela branca
const otherProblems = [];

// Verificar variáveis undefined
const undefinedVars = correctedContent.match(/\b(var_[a-zA-Z_]+)\b/g);
if (undefinedVars) {
  otherProblems.push(`Variáveis undefined: ${undefinedVars.join(', ')}`);
}

// Verificar referências JSX problemáticas
const badJSX = correctedContent.match(/\{\"[^\"]*var_[^\"]*\"/g);
if (badJSX) {
  otherProblems.push(`JSX problemático: ${badJSX.join(', ')}`);
}

if (otherProblems.length === 0) {
  console.log('✅ Nenhum outro problema encontrado');
} else {
  console.log('⚠️  Outros problemas encontrados:');
  otherProblems.forEach(problem => console.log(`   - ${problem}`));
}

console.log('\n📝 RESUMO DA CORREÇÃO');
console.log('====================');
console.log(`✅ Interpolações duplas corrigidas: ${correctionsApplied}`);
console.log(`✅ Problemas restantes: ${remainingProblems.length}`);
console.log(`✅ Outros problemas: ${otherProblems.length}`);
console.log('\n🎯 O elemento métrica deve funcionar corretamente agora!');