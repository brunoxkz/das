#!/usr/bin/env node

/**
 * DEBUG DO ELEMENTO MÉTRICA
 * =========================
 * 
 * Investigar problemas que causam tela branca no elemento métrica
 */

import fs from 'fs';

console.log('🔍 INVESTIGANDO PROBLEMAS NO ELEMENTO MÉTRICA');
console.log('==============================================\n');

// Ler o arquivo do editor
const editorFile = fs.readFileSync('client/src/components/page-editor-horizontal.tsx', 'utf8');

// Procurar por problemas no elemento métrica
const problemsFound = [];

// 1. Verificar se há variáveis undefined ou referências problemáticas
const undefinedVariables = editorFile.match(/\b(var_[a-zA-Z_]+)\b/g);
if (undefinedVariables) {
  problemsFound.push({
    type: 'Variáveis undefined',
    description: 'Variáveis que podem estar undefined',
    count: undefinedVariables.length,
    matches: undefinedVariables
  });
}

// 2. Verificar interpolação incorreta em JSX
const badInterpolation = editorFile.match(/\{\{[^}]+\}\}/g);
if (badInterpolation) {
  problemsFound.push({
    type: 'Interpolação incorreta',
    description: 'Interpolação que pode estar incorreta',
    count: badInterpolation.length,
    matches: badInterpolation
  });
}

// 3. Verificar referências JSX problemáticas
const badJSXReferences = editorFile.match(/\{\"[^\"]*var_[^\"]*\"/g);
if (badJSXReferences) {
  problemsFound.push({
    type: 'Referências JSX problemáticas',
    description: 'Referências JSX com variáveis var_',
    count: badJSXReferences.length,
    matches: badJSXReferences
  });
}

// 4. Verificar se há erros específicos no elemento métrica
const metricsSection = editorFile.match(/case "metrics":(.*?)(?=case "|default:)/s);
if (metricsSection) {
  const metricsCode = metricsSection[1];
  
  // Verificar se há variáveis undefined no código de métrica
  const metricsUndefined = metricsCode.match(/\b(var_[a-zA-Z_]+)\b/g);
  if (metricsUndefined) {
    problemsFound.push({
      type: 'Variáveis undefined no elemento métrica',
      description: 'Variáveis undefined específicas do elemento métrica',
      count: metricsUndefined.length,
      matches: metricsUndefined
    });
  }
  
  // Verificar interpolação problemática no elemento métrica
  const metricsInterpolation = metricsCode.match(/\{\{[^}]+\}\}/g);
  if (metricsInterpolation) {
    problemsFound.push({
      type: 'Interpolação problemática no elemento métrica',
      description: 'Interpolação que pode causar erro no elemento métrica',
      count: metricsInterpolation.length,
      matches: metricsInterpolation
    });
  }
}

// 5. Verificar se há imports faltantes
const imports = editorFile.match(/import\s+\{[^}]+\}\s+from\s+['"]/g);
const lucideImports = editorFile.match(/import\s+\{[^}]+\}\s+from\s+['"]lucide-react['"]/);
if (lucideImports) {
  const importedIcons = lucideImports[0].match(/\b[A-Z][a-zA-Z0-9]*\b/g);
  
  // Verificar se TrendingUp está importado (usado no elemento métrica)
  if (!importedIcons || !importedIcons.includes('TrendingUp')) {
    problemsFound.push({
      type: 'Import faltante',
      description: 'TrendingUp não está importado mas é usado no elemento métrica',
      count: 1,
      matches: ['TrendingUp']
    });
  }
}

// Exibir resultados
console.log('📊 RESULTADOS DA INVESTIGAÇÃO:');
console.log('=============================');

if (problemsFound.length === 0) {
  console.log('✅ Nenhum problema específico encontrado no elemento métrica');
} else {
  console.log('❌ Problemas encontrados:\n');
  problemsFound.forEach(problem => {
    console.log(`  🔴 ${problem.type}:`);
    console.log(`     - Descrição: ${problem.description}`);
    console.log(`     - Ocorrências: ${problem.count}`);
    console.log(`     - Matches: ${problem.matches.join(', ')}\n`);
  });
}

console.log('🔧 VERIFICANDO CORREÇÕES APLICADAS:');
console.log('==================================');

// Verificar se as correções anteriores foram aplicadas
const hasVarComentario = editorFile.includes('var_comentario');
const hasVarEscolha = editorFile.includes('var_escolha');
const hasPerguntaContinuacao = editorFile.includes('pergunta_continuacao');

console.log(hasVarComentario ? '❌ var_comentario ainda presente' : '✅ var_comentario removido');
console.log(hasVarEscolha ? '❌ var_escolha ainda presente' : '✅ var_escolha removido');
console.log(hasPerguntaContinuacao ? '❌ pergunta_continuacao ainda presente' : '✅ pergunta_continuacao removido');

console.log('\n📝 RECOMENDAÇÕES:');
console.log('=================');

if (problemsFound.length > 0) {
  console.log('⚠️  Problemas encontrados que podem causar tela branca');
  console.log('⚠️  Revise as ocorrências encontradas acima');
  console.log('⚠️  Corrija as referências problemáticas antes de testar');
} else {
  console.log('✅ Nenhum problema óbvio encontrado no elemento métrica');
  console.log('✅ O problema pode estar em outro lugar do código');
  console.log('✅ Recomenda-se verificar logs do console do navegador');
}