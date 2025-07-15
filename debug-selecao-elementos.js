/**
 * DEBUG ESPECÍFICO - SELEÇÃO DE ELEMENTOS
 * Investigar especificamente o problema da tela branca
 */

import fs from 'fs';

console.log('🔍 INVESTIGANDO PROBLEMA DA TELA BRANCA NA SELEÇÃO DE ELEMENTOS');
console.log('================================================================');

// Verificar se há problemas específicos com variáveis undefined
const content = fs.readFileSync('client/src/components/page-editor-horizontal.tsx', 'utf8');

// Buscar por padrões específicos que podem causar o erro
const problematicPatterns = [
  {
    name: 'Variáveis undefined',
    regex: /var_\w+/g,
    description: 'Variáveis que podem estar undefined'
  },
  {
    name: 'Template literals problemáticos',
    regex: /\{\`[^}]*\`\}/g,
    description: 'Template literals que podem causar erro'
  },
  {
    name: 'Interpolação incorreta',
    regex: /\{\{[^}]*\}\}/g,
    description: 'Interpolação que pode estar incorreta'
  },
  {
    name: 'Referências JSX problemáticas',
    regex: /\{[^}]*var_[^}]*\}/g,
    description: 'Referências JSX com variáveis var_'
  }
];

let problemasEncontrados = [];

problematicPatterns.forEach(pattern => {
  const matches = content.match(pattern.regex);
  if (matches) {
    // Filtrar apenas matches que não são parte de propriedades style
    const filteredMatches = matches.filter(match => {
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(match)) {
          // Verificar se não é parte de uma propriedade style
          const line = lines[i].trim();
          if (!line.includes('style=') && !line.includes('backgroundColor:') && !line.includes('color:')) {
            return true;
          }
        }
      }
      return false;
    });
    
    if (filteredMatches.length > 0) {
      problemasEncontrados.push({
        name: pattern.name,
        matches: filteredMatches,
        count: filteredMatches.length,
        description: pattern.description
      });
    }
  }
});

console.log('\n📊 RESULTADOS DA INVESTIGAÇÃO:');
console.log('=============================');

if (problemasEncontrados.length === 0) {
  console.log('✅ Nenhum problema específico encontrado');
  console.log('✅ Correções anteriores foram efetivas');
} else {
  console.log('❌ Problemas encontrados:');
  problemasEncontrados.forEach(problema => {
    console.log(`\n  🔴 ${problema.name}:`);
    console.log(`     - Descrição: ${problema.description}`);
    console.log(`     - Ocorrências: ${problema.count}`);
    console.log(`     - Matches: ${problema.matches.slice(0, 5).join(', ')}${problema.matches.length > 5 ? '...' : ''}`);
  });
}

// Verificar especificamente as correções já aplicadas
console.log('\n🔧 VERIFICANDO CORREÇÕES APLICADAS:');
console.log('==================================');

const correcoes = [
  { 
    problema: 'var_comentario em template string', 
    corrigido: !content.includes('{{var_comentario}}') 
  },
  { 
    problema: 'var_escolha em template string', 
    corrigido: !content.includes('{{var_escolha}}') 
  },
  { 
    problema: 'pergunta_continuacao em template string', 
    corrigido: !content.includes('{{pergunta_continuacao}}') 
  }
];

correcoes.forEach(correcao => {
  console.log(`${correcao.corrigido ? '✅' : '❌'} ${correcao.problema}`);
});

console.log('\n📝 RECOMENDAÇÕES:');
console.log('=================');

if (problemasEncontrados.length === 0) {
  console.log('✅ Todas as correções foram aplicadas com sucesso');
  console.log('✅ O problema da tela branca deve estar resolvido');
  console.log('✅ Teste acessando o editor de quiz novamente');
} else {
  console.log('⚠️  Ainda existem problemas que precisam ser corrigidos');
  console.log('⚠️  Revise as ocorrências encontradas acima');
}