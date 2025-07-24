/**
 * ANÁLISE DE BUNDLE SIZE - SISTEMA VENDZZ
 * Análise detalhada do tamanho do bundle JavaScript e otimizações
 */

import fs from 'fs';
import path from 'path';

class BundleSizeAnalyzer {
  constructor() {
    this.results = {
      totalSize: 0,
      components: [],
      dependencies: [],
      suggestions: [],
      criticalFiles: [],
      optimizations: []
    };
  }

  analyzeDirectory(dirPath, prefix = '') {
    if (!fs.existsSync(dirPath)) {
      console.log(`❌ Diretório não encontrado: ${dirPath}`);
      return;
    }

    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !this.shouldSkipDirectory(item)) {
        this.analyzeDirectory(fullPath, `${prefix}${item}/`);
      } else if (stat.isFile() && this.shouldAnalyzeFile(item)) {
        this.analyzeFile(fullPath, `${prefix}${item}`);
      }
    });
  }

  shouldSkipDirectory(dirname) {
    const skipDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next'];
    return skipDirs.includes(dirname);
  }

  shouldAnalyzeFile(filename) {
    const extensions = ['.tsx', '.ts', '.jsx', '.js', '.css', '.scss'];
    return extensions.some(ext => filename.endsWith(ext));
  }

  analyzeFile(filePath, relativePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const size = content.length;
    const lines = content.split('\n').length;
    
    this.results.totalSize += size;
    
    const fileAnalysis = {
      path: relativePath,
      size: size,
      sizeKB: Math.round(size / 1024 * 100) / 100,
      lines: lines,
      type: this.getFileType(filePath),
      imports: this.extractImports(content),
      exports: this.extractExports(content),
      complexity: this.calculateComplexity(content)
    };
    
    this.results.components.push(fileAnalysis);
    
    // Identificar arquivos críticos (> 100KB)
    if (size > 100 * 1024) {
      this.results.criticalFiles.push({
        ...fileAnalysis,
        reason: 'Arquivo muito grande (>100KB)'
      });
    }
    
    // Identificar arquivos com muitas linhas (> 1000)
    if (lines > 1000) {
      this.results.criticalFiles.push({
        ...fileAnalysis,
        reason: `Muitas linhas (${lines})`
      });
    }
  }

  getFileType(filePath) {
    if (filePath.includes('/components/')) return 'component';
    if (filePath.includes('/pages/')) return 'page';
    if (filePath.includes('/hooks/')) return 'hook';
    if (filePath.includes('/lib/')) return 'library';
    if (filePath.includes('/utils/')) return 'utility';
    if (filePath.includes('server/')) return 'server';
    return 'other';
  }

  extractImports(content) {
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  extractExports(content) {
    const exportRegex = /export\s+(default\s+)?(function|const|class|interface|type)\s+(\w+)/g;
    const exports = [];
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[3]);
    }
    
    return exports;
  }

  calculateComplexity(content) {
    // Métrica simples de complexidade baseada em palavras-chave
    const complexityKeywords = [
      'if', 'else', 'for', 'while', 'switch', 'case', 
      'try', 'catch', 'function', 'class', '&&', '||'
    ];
    
    let complexity = 0;
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) complexity += matches.length;
    });
    
    return complexity;
  }

  analyzeDependencies() {
    console.log('📦 Analisando dependências...');
    
    const packageJsonPath = 'package.json';
    if (!fs.existsSync(packageJsonPath)) {
      console.log('❌ package.json não encontrado');
      return;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Dependências pesadas conhecidas
    const heavyDeps = {
      '@radix-ui': 'UI Library pesada',
      'framer-motion': 'Animações pesadas',
      'react-chartjs-2': 'Gráficos pesados',
      'lucide-react': 'Muitos ícones',
      '@tanstack/react-query': 'State management'
    };
    
    Object.keys(deps).forEach(dep => {
      const size = this.estimateDepSize(dep);
      this.results.dependencies.push({
        name: dep,
        version: deps[dep],
        estimatedSize: size,
        category: this.categorizeDependency(dep),
        isHeavy: heavyDeps[dep] ? true : false,
        reason: heavyDeps[dep] || ''
      });
    });
  }

  estimateDepSize(depName) {
    // Estimativas baseadas em conhecimento comum
    const sizeEstimates = {
      'react': 45,
      'react-dom': 130,
      '@radix-ui/react-dialog': 25,
      '@radix-ui/react-dropdown-menu': 30,
      'lucide-react': 150,
      'framer-motion': 180,
      'react-chartjs-2': 120,
      '@tanstack/react-query': 80,
      'tailwindcss': 200,
      'drizzle-orm': 60
    };
    
    return sizeEstimates[depName] || 15; // Default 15KB
  }

  categorizeDependency(depName) {
    if (depName.includes('react')) return 'React';
    if (depName.includes('@radix-ui')) return 'UI';
    if (depName.includes('tailwind')) return 'Styling';
    if (depName.includes('drizzle')) return 'Database';
    if (depName.includes('chart')) return 'Charts';
    return 'Other';
  }

  generateOptimizations() {
    console.log('🔧 Gerando otimizações...');
    
    const sorted = this.results.components.sort((a, b) => b.size - a.size);
    const largestFiles = sorted.slice(0, 10);
    
    largestFiles.forEach(file => {
      if (file.sizeKB > 50) {
        this.results.optimizations.push({
          file: file.path,
          type: 'CODE_SPLITTING',
          description: `Arquivo grande (${file.sizeKB}KB) - considerar code splitting`,
          priority: 'HIGH',
          estimatedSaving: `${Math.round(file.sizeKB * 0.3)}KB`
        });
      }
      
      if (file.imports.length > 20) {
        this.results.optimizations.push({
          file: file.path,
          type: 'IMPORT_OPTIMIZATION',
          description: `${file.imports.length} imports - otimizar tree shaking`,
          priority: 'MEDIUM',
          estimatedSaving: `${Math.round(file.sizeKB * 0.15)}KB`
        });
      }
      
      if (file.complexity > 100) {
        this.results.optimizations.push({
          file: file.path,
          type: 'COMPLEXITY_REDUCTION',
          description: `Alta complexidade (${file.complexity}) - refatorar`,
          priority: 'MEDIUM',
          estimatedSaving: `${Math.round(file.sizeKB * 0.2)}KB`
        });
      }
    });
    
    // Otimizações específicas para dependências
    this.results.dependencies.forEach(dep => {
      if (dep.isHeavy) {
        this.results.optimizations.push({
          file: `package.json (${dep.name})`,
          type: 'DEPENDENCY_OPTIMIZATION',
          description: `${dep.name} é pesada (${dep.estimatedSize}KB) - ${dep.reason}`,
          priority: dep.estimatedSize > 100 ? 'HIGH' : 'MEDIUM',
          estimatedSaving: `${Math.round(dep.estimatedSize * 0.4)}KB`
        });
      }
    });
  }

  generateReport() {
    console.log('\n📊 RELATÓRIO DE ANÁLISE DE BUNDLE SIZE\n');
    console.log('='.repeat(60));
    
    const totalSizeMB = Math.round(this.results.totalSize / 1024 / 1024 * 100) / 100;
    const totalSizeKB = Math.round(this.results.totalSize / 1024);
    
    console.log(`📁 Total de arquivos: ${this.results.components.length}`);
    console.log(`📦 Tamanho total: ${totalSizeMB}MB (${totalSizeKB}KB)`);
    console.log(`🚨 Arquivos críticos: ${this.results.criticalFiles.length}`);
    console.log(`🔧 Otimizações possíveis: ${this.results.optimizations.length}`);
    
    // Top 10 maiores arquivos
    console.log('\n📈 TOP 10 MAIORES ARQUIVOS:');
    const sorted = this.results.components.sort((a, b) => b.size - a.size);
    sorted.slice(0, 10).forEach((file, index) => {
      console.log(`${index + 1}. ${file.path} - ${file.sizeKB}KB (${file.lines} linhas)`);
    });
    
    // Arquivos críticos
    if (this.results.criticalFiles.length > 0) {
      console.log('\n🚨 ARQUIVOS CRÍTICOS:');
      this.results.criticalFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file.path}`);
        console.log(`   Tamanho: ${file.sizeKB}KB`);
        console.log(`   Motivo: ${file.reason}`);
        console.log(`   Imports: ${file.imports.length}`);
      });
    }
    
    // Dependências pesadas
    console.log('\n📦 DEPENDÊNCIAS PESADAS:');
    const heavyDeps = this.results.dependencies.filter(dep => dep.isHeavy);
    heavyDeps.forEach((dep, index) => {
      console.log(`${index + 1}. ${dep.name} - ~${dep.estimatedSize}KB`);
      console.log(`   Motivo: ${dep.reason}`);
    });
    
    // Otimizações prioritárias
    console.log('\n🔧 OTIMIZAÇÕES PRIORITÁRIAS:');
    const highPriority = this.results.optimizations.filter(opt => opt.priority === 'HIGH');
    highPriority.slice(0, 5).forEach((opt, index) => {
      console.log(`${index + 1}. ${opt.file}`);
      console.log(`   Tipo: ${opt.type}`);
      console.log(`   Descrição: ${opt.description}`);
      console.log(`   Economia estimada: ${opt.estimatedSaving}`);
    });
    
    // Resumo de economia total
    const totalSavings = this.results.optimizations.reduce((acc, opt) => {
      const saving = parseFloat(opt.estimatedSaving.replace('KB', ''));
      return acc + saving;
    }, 0);
    
    console.log(`\n💰 ECONOMIA TOTAL ESTIMADA: ${Math.round(totalSavings)}KB`);
    
    return this.results;
  }

  run() {
    console.log('🚀 INICIANDO ANÁLISE DE BUNDLE SIZE\n');
    
    // Analisar client/src
    console.log('📁 Analisando client/src...');
    this.analyzeDirectory('client/src');
    
    // Analisar server
    console.log('📁 Analisando server...');
    this.analyzeDirectory('server');
    
    // Analisar dependências
    this.analyzeDependencies();
    
    // Gerar otimizações
    this.generateOptimizations();
    
    // Gerar relatório
    const results = this.generateReport();
    
    // Salvar resultados
    fs.writeFileSync('bundle-size-analysis-results.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Resultados salvos em: bundle-size-analysis-results.json');
    
    return results;
  }
}

// Executar análise
const analyzer = new BundleSizeAnalyzer();
const results = analyzer.run();

export { BundleSizeAnalyzer, results };