// Teste das melhorias implementadas na extensão Chrome
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 TESTANDO MELHORIAS DA EXTENSÃO CHROME');
console.log('=' .repeat(50));

// Verificar se as melhorias estão implementadas no código
function checkImplementations() {
  const contentPath = path.join(__dirname, 'chrome-extension-v2', 'content.js');
  
  if (!fs.existsSync(contentPath)) {
    console.log('❌ Arquivo content.js não encontrado');
    return false;
  }
  
  const content = fs.readFileSync(contentPath, 'utf8');
  
  const improvements = [
    {
      name: 'Auto-sync com intervalo otimizado (20s)',
      check: content.includes('20000') && content.includes('Auto-sync iniciado (20s)'),
      line: content.match(/Auto-sync iniciado \(20s\)/)?.[0]
    },
    {
      name: 'Validação de formulário antes da automação',
      check: content.includes('function validateAutomationStart()') && content.includes('validateAutomationStart();'),
      line: content.match(/function validateAutomationStart\(\)/)?.[0]
    },
    {
      name: 'Sincronização melhorada com feedback',
      check: content.includes('addLog(`🆕 ${newLeadsCount} novos leads detectados`)') && content.includes('updateContactsList();'),
      line: content.match(/addLog\(`🆕 \${newLeadsCount} novos leads detectados`\)/)?.[0]
    },
    {
      name: 'Tratamento de erros com reconexão automática',
      check: content.includes('await connectToServer();') && content.includes('if (error.message.includes(\'fetch\')'),
      line: content.match(/await connectToServer\(\);/)?.[0]
    },
    {
      name: 'Preparação de fila mais robusta',
      check: content.includes('addLog(`📊 Processados: ${processedCount} contatos') && content.includes('Validar configurações essenciais'),
      line: content.match(/addLog\(`📊 Processados:/)?.[0]
    },
    {
      name: 'Logs com timestamp e melhor feedback',
      check: content.includes('new Date().toLocaleTimeString(\'pt-BR\')') && content.includes('📝 Vendzz Log:'),
      line: content.match(/new Date\(\)\.toLocaleTimeString\('pt-BR'\)/)?.[0]
    }
  ];
  
  console.log('\n✅ MELHORIAS IMPLEMENTADAS:');
  console.log('-'.repeat(30));
  
  let allImplemented = true;
  
  improvements.forEach((improvement, index) => {
    const status = improvement.check ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${improvement.name}`);
    
    if (!improvement.check) {
      allImplemented = false;
      console.log(`   ⚠️  Funcionalidade não encontrada no código`);
    }
  });
  
  return allImplemented;
}

// Verificar estrutura da extensão
function checkExtensionStructure() {
  console.log('\n🏗️ VERIFICANDO ESTRUTURA DA EXTENSÃO:');
  console.log('-'.repeat(35));
  
  const requiredFiles = [
    'chrome-extension-v2/manifest.json',
    'chrome-extension-v2/background.js',
    'chrome-extension-v2/content.js',
    'chrome-extension-v2/popup.html',
    'chrome-extension-v2/popup.js'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    console.log(`${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
  });
  
  return allFilesExist;
}

// Verificar funcionalidades específicas
function checkSpecificFeatures() {
  console.log('\n🔧 VERIFICANDO FUNCIONALIDADES ESPECÍFICAS:');
  console.log('-'.repeat(40));
  
  const contentPath = path.join(__dirname, 'chrome-extension-v2', 'content.js');
  const content = fs.readFileSync(contentPath, 'utf8');
  
  const features = [
    {
      name: 'Sistema de mensagens rotativas',
      check: content.includes('getRotativeMessage(') && content.includes('messageVariation')
    },
    {
      name: 'Sistema anti-ban 2025',
      check: content.includes('checkAntiBanLimits()') && content.includes('calculateAntiBanDelay()')
    },
    {
      name: 'Validação de telefone brasileira',
      check: content.includes('validateAndFormatPhone') && content.includes('+55')
    },
    {
      name: 'Interface sidebar completa',
      check: content.includes('createSidebar()') && content.includes('vendzz-sidebar')
    },
    {
      name: 'Sistema de auto-sync configurável',
      check: content.includes('vendzz-auto-sync') && content.includes('startAutoSync()') && content.includes('stopAutoSync()')
    },
    {
      name: 'Múltiplos métodos de envio WhatsApp',
      check: content.includes('sendMessageDirectly') && content.includes('sendViaDOMManipulation')
    }
  ];
  
  features.forEach((feature, index) => {
    const status = feature.check ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${feature.name}`);
  });
  
  return features.every(f => f.check);
}

// Executar todos os testes
function runTests() {
  console.log('🚀 INICIANDO TESTES DAS MELHORIAS...\n');
  
  const structureOk = checkExtensionStructure();
  const implementationsOk = checkImplementations();
  const featuresOk = checkSpecificFeatures();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMO DOS TESTES:');
  console.log('='.repeat(50));
  
  console.log(`🏗️  Estrutura da extensão: ${structureOk ? '✅ OK' : '❌ FALHA'}`);
  console.log(`🔧 Implementações: ${implementationsOk ? '✅ OK' : '❌ FALHA'}`);
  console.log(`⚡ Funcionalidades: ${featuresOk ? '✅ OK' : '❌ FALHA'}`);
  
  const allTestsPassed = structureOk && implementationsOk && featuresOk;
  
  console.log('\n' + (allTestsPassed ? '🎉' : '⚠️') + ' RESULTADO FINAL:');
  
  if (allTestsPassed) {
    console.log('✅ TODAS AS MELHORIAS FORAM IMPLEMENTADAS COM SUCESSO!');
    console.log('🚀 Extensão Chrome pronta para uso em produção.');
  } else {
    console.log('❌ ALGUMAS MELHORIAS PRECISAM SER AJUSTADAS.');
    console.log('🔧 Verifique os itens marcados com ❌ acima.');
  }
  
  return allTestsPassed;
}

// Executar testes
runTests();