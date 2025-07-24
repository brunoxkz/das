/**
 * ANÁLISE DE MEMORY LEAKS - SISTEMA VENDZZ
 * Análise automática de vazamentos de memória em componentes React
 */

import fs from 'fs';
import path from 'path';

// Padrões que podem causar memory leaks
const MEMORY_LEAK_PATTERNS = {
  // Event listeners não removidos
  uncleanedEventListeners: [
    /addEventListener\s*\([^)]+\)/g,
    /on[A-Z]\w+\s*=/g,
    /document\.addEventListener/g,
    /window\.addEventListener/g
  ],
  
  // Timers não limpos
  uncleanedTimers: [
    /setTimeout\s*\(/g,
    /setInterval\s*\(/g,
    /requestAnimationFrame\s*\(/g
  ],
  
  // Subscriptions não canceladas
  uncleanedSubscriptions: [
    /subscribe\s*\(/g,
    /\.on\s*\(/g,
    /queryClient\.getQueryData/g
  ],
  
  // useEffect sem cleanup
  missingCleanup: [
    /useEffect\s*\(\s*\(\s*\)\s*=>/g,
    /useEffect\s*\(\s*async/g
  ],
  
  // Estados grandes não otimizados
  largeStates: [
    /useState\s*\(\s*\{[\s\S]{100,}\}/g,
    /useState\s*\(\s*\[[\s\S]{50,}\]/g
  ]
};

// Componentes para análise
const COMPONENTS_TO_ANALYZE = [
  'client/src/components/page-editor-horizontal.tsx',
  'client/src/components/quiz-preview.tsx',
  'client/src/components/quiz-public-renderer.tsx',
  'client/src/pages/dashboard.tsx',
  'client/src/pages/quantum-members.tsx',
  'client/src/pages/quantum-course-manage.tsx'
];

class MemoryLeakAnalyzer {
  constructor() {
    this.results = {
      totalFiles: 0,
      issuesFound: 0,
      criticalIssues: [],
      warningIssues: [],
      suggestions: []
    };
  }

  analyzeFile(filePath) {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Arquivo não encontrado: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    console.log(`🔍 Analisando: ${fileName}`);
    
    this.results.totalFiles++;
    
    // Análise de event listeners
    this.checkEventListeners(content, fileName);
    
    // Análise de timers
    this.checkTimers(content, fileName);
    
    // Análise de subscriptions
    this.checkSubscriptions(content, fileName);
    
    // Análise de useEffect
    this.checkUseEffectCleanup(content, fileName);
    
    // Análise de estados grandes
    this.checkLargeStates(content, fileName);
    
    // Análise específica de componentes grandes
    this.checkComponentSize(content, fileName);
  }

  checkEventListeners(content, fileName) {
    const eventListeners = content.match(/addEventListener\s*\([^)]+\)/g) || [];
    const removeEventListeners = content.match(/removeEventListener\s*\([^)]+\)/g) || [];
    
    if (eventListeners.length > removeEventListeners.length) {
      this.results.criticalIssues.push({
        file: fileName,
        type: 'EVENT_LISTENERS',
        message: `${eventListeners.length} event listeners adicionados, apenas ${removeEventListeners.length} removidos`,
        severity: 'CRITICAL',
        suggestion: 'Adicionar removeEventListener em useEffect cleanup'
      });
    }
  }

  checkTimers(content, fileName) {
    const setTimeouts = content.match(/setTimeout\s*\(/g) || [];
    const setIntervals = content.match(/setInterval\s*\(/g) || [];
    const clearTimeouts = content.match(/clearTimeout\s*\(/g) || [];
    const clearIntervals = content.match(/clearInterval\s*\(/g) || [];
    
    const totalTimers = setTimeouts.length + setIntervals.length;
    const totalClears = clearTimeouts.length + clearIntervals.length;
    
    if (totalTimers > totalClears) {
      this.results.criticalIssues.push({
        file: fileName,
        type: 'TIMERS',
        message: `${totalTimers} timers criados, apenas ${totalClears} limpos`,
        severity: 'CRITICAL',
        suggestion: 'Adicionar clearTimeout/clearInterval em useEffect cleanup'
      });
    }
  }

  checkSubscriptions(content, fileName) {
    const subscriptions = content.match(/\.subscribe\s*\(/g) || [];
    const unsubscribes = content.match(/\.unsubscribe\s*\(/g) || [];
    
    if (subscriptions.length > unsubscribes.length) {
      this.results.warningIssues.push({
        file: fileName,
        type: 'SUBSCRIPTIONS',
        message: `${subscriptions.length} subscriptions, apenas ${unsubscribes.length} unsubscribes`,
        severity: 'WARNING',
        suggestion: 'Verificar se todas as subscriptions são canceladas'
      });
    }
  }

  checkUseEffectCleanup(content, fileName) {
    const useEffects = content.match(/useEffect\s*\(/g) || [];
    const cleanupFunctions = content.match(/return\s*\(\s*\)\s*=>/g) || [];
    const cleanupFunctions2 = content.match(/return\s*function/g) || [];
    
    const totalCleanups = cleanupFunctions.length + cleanupFunctions2.length;
    
    if (useEffects.length > 3 && totalCleanups === 0) {
      this.results.warningIssues.push({
        file: fileName,
        type: 'USE_EFFECT',
        message: `${useEffects.length} useEffects sem cleanup functions`,
        severity: 'WARNING',
        suggestion: 'Adicionar cleanup functions onde necessário'
      });
    }
  }

  checkLargeStates(content, fileName) {
    // Procurar por estados muito grandes
    const largeStateMatches = content.match(/useState\s*\(\s*\{[\s\S]{200,}?\}/g) || [];
    
    if (largeStateMatches.length > 0) {
      this.results.warningIssues.push({
        file: fileName,
        type: 'LARGE_STATES',
        message: `${largeStateMatches.length} estados grandes detectados`,
        severity: 'WARNING',
        suggestion: 'Considerar useReducer ou context para estados complexos'
      });
    }
  }

  checkComponentSize(content, fileName) {
    const lines = content.split('\n').length;
    const fileSize = content.length;
    
    if (lines > 2000) {
      this.results.criticalIssues.push({
        file: fileName,
        type: 'COMPONENT_SIZE',
        message: `Componente muito grande: ${lines} linhas (${Math.round(fileSize/1024)}KB)`,
        severity: 'CRITICAL',
        suggestion: 'Dividir em componentes menores'
      });
    } else if (lines > 1000) {
      this.results.warningIssues.push({
        file: fileName,
        type: 'COMPONENT_SIZE',
        message: `Componente grande: ${lines} linhas (${Math.round(fileSize/1024)}KB)`,
        severity: 'WARNING',
        suggestion: 'Considerar refatoração'
      });
    }
  }

  generateReport() {
    console.log('\n📊 RELATÓRIO DE ANÁLISE DE MEMORY LEAKS\n');
    console.log('='.repeat(50));
    
    console.log(`📁 Arquivos analisados: ${this.results.totalFiles}`);
    console.log(`🚨 Issues críticos: ${this.results.criticalIssues.length}`);
    console.log(`⚠️  Issues de warning: ${this.results.warningIssues.length}`);
    
    if (this.results.criticalIssues.length > 0) {
      console.log('\n🚨 ISSUES CRÍTICOS:');
      this.results.criticalIssues.forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.file}`);
        console.log(`   Tipo: ${issue.type}`);
        console.log(`   Problema: ${issue.message}`);
        console.log(`   Sugestão: ${issue.suggestion}`);
      });
    }
    
    if (this.results.warningIssues.length > 0) {
      console.log('\n⚠️  ISSUES DE WARNING:');
      this.results.warningIssues.forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.file}`);
        console.log(`   Tipo: ${issue.type}`);
        console.log(`   Problema: ${issue.message}`);
        console.log(`   Sugestão: ${issue.suggestion}`);
      });
    }
    
    // Gerar sugestões gerais
    this.generateSuggestions();
    
    return this.results;
  }

  generateSuggestions() {
    console.log('\n💡 SUGESTÕES GERAIS:');
    
    const suggestions = [
      '1. Implementar React.memo() em componentes que re-renderizam frequentemente',
      '2. Usar useCallback() e useMemo() para otimizar funções e valores computados',
      '3. Implementar virtualization para listas grandes',
      '4. Considerar lazy loading para componentes pesados',
      '5. Monitorar com React DevTools Profiler',
      '6. Implementar error boundaries para evitar memory leaks por erros'
    ];
    
    suggestions.forEach(suggestion => {
      console.log(`   ${suggestion}`);
    });
  }

  run() {
    console.log('🚀 INICIANDO ANÁLISE DE MEMORY LEAKS\n');
    
    COMPONENTS_TO_ANALYZE.forEach(filePath => {
      this.analyzeFile(filePath);
    });
    
    const results = this.generateReport();
    
    // Salvar resultados
    fs.writeFileSync('memory-leak-analysis-results.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Resultados salvos em: memory-leak-analysis-results.json');
    
    return results;
  }
}

// Executar análise
const analyzer = new MemoryLeakAnalyzer();
const results = analyzer.run();

// Export para uso em outros scripts
export { MemoryLeakAnalyzer, results };