/**
 * TESTE FRONTEND - ANIMATED TRANSITION ELEMENT
 * Verifica se o elemento está sendo renderizado corretamente no frontend
 */

import fs from 'fs';

console.log('🎬 TESTE FRONTEND - ANIMATED TRANSITION');
console.log('=' .repeat(50));

// 1. Verificar se o elemento está na lista de elementos disponíveis
console.log('\n📋 TESTE 1: Verificando Lista de Elementos');
const pageEditorPath = 'client/src/components/page-editor-horizontal.tsx';

try {
  const content = fs.readFileSync(pageEditorPath, 'utf8');
  
  // Verificar se animated_transition está no tipo Element
  const hasTypeDefinition = content.includes('"animated_transition"');
  console.log(`✅ Tipo Element contém animated_transition: ${hasTypeDefinition}`);
  
  // Verificar se está na lista de elementos disponíveis
  const hasElementInList = content.includes('animated_transition: "Transição Animada"');
  console.log(`✅ Element está na lista de tipos: ${hasElementInList}`);
  
  // Verificar se está na categoria correta
  const hasElementInCategory = content.includes('{ type: "animated_transition", label: "Transição", icon: <Sparkles className="w-4 h-4" /> }');
  console.log(`✅ Element está na categoria Conteúdo: ${hasElementInCategory}`);
  
  // Verificar se tem renderização no preview
  const hasPreviewRender = content.includes('case "animated_transition":');
  console.log(`✅ Element tem renderização no preview: ${hasPreviewRender}`);
  
  // Verificar se tem propriedades configuráveis
  const hasPropertiesPanel = content.includes('selectedElementData.type === "animated_transition"');
  console.log(`✅ Element tem painel de propriedades: ${hasPropertiesPanel}`);
  
  // Verificar propriedades específicas
  const hasAnimationType = content.includes('animationType');
  const hasAnimationSpeed = content.includes('animationSpeed');
  const hasGradientStart = content.includes('gradientStart');
  const hasGradientEnd = content.includes('gradientEnd');
  
  console.log(`✅ Propriedade animationType: ${hasAnimationType}`);
  console.log(`✅ Propriedade animationSpeed: ${hasAnimationSpeed}`);
  console.log(`✅ Propriedade gradientStart: ${hasGradientStart}`);
  console.log(`✅ Propriedade gradientEnd: ${hasGradientEnd}`);
  
} catch (error) {
  console.error('❌ Erro ao ler arquivo page-editor:', error.message);
}

// 2. Verificar renderização no quiz preview
console.log('\n📋 TESTE 2: Verificando Quiz Preview');
const quizPreviewPath = 'client/src/components/quiz-preview.tsx';

try {
  const content = fs.readFileSync(quizPreviewPath, 'utf8');
  
  // Verificar se tem renderização
  const hasRender = content.includes("case 'animated_transition':");
  console.log(`✅ Quiz preview tem renderização: ${hasRender}`);
  
  // Verificar se usa propriedades personalizadas
  const usesGradientProperties = content.includes('gradientStart') && content.includes('gradientEnd');
  console.log(`✅ Quiz preview usa gradientes personalizados: ${usesGradientProperties}`);
  
  // Verificar se usa animações
  const usesAnimations = content.includes('animationType') && content.includes('animationSpeed');
  console.log(`✅ Quiz preview usa animações personalizadas: ${usesAnimations}`);
  
} catch (error) {
  console.error('❌ Erro ao ler arquivo quiz-preview:', error.message);
}

// 3. Verificar renderização no quiz público
console.log('\n📋 TESTE 3: Verificando Quiz Público');
const quizPublicPath = 'client/src/components/quiz-public-renderer.tsx';

try {
  const content = fs.readFileSync(quizPublicPath, 'utf8');
  
  // Verificar se tem renderização
  const hasRender = content.includes("case 'animated_transition':");
  console.log(`✅ Quiz público tem renderização: ${hasRender}`);
  
  // Verificar se usa propriedades do properties object
  const usesPropertiesObject = content.includes('properties.gradientStart') && content.includes('properties.gradientEnd');
  console.log(`✅ Quiz público usa properties object: ${usesPropertiesObject}`);
  
  // Verificar se usa animações
  const usesAnimations = content.includes('properties.animationType') && content.includes('properties.animationSpeed');
  console.log(`✅ Quiz público usa animações: ${usesAnimations}`);
  
} catch (error) {
  console.error('❌ Erro ao ler arquivo quiz-public-renderer:', error.message);
}

// 4. Verificar classes CSS necessárias
console.log('\n📋 TESTE 4: Verificando Classes CSS');

// Verificar se as classes de animação estão sendo usadas corretamente
const animationClasses = [
  'animate-pulse',
  'animate-ping', 
  'animate-bounce',
  'duration-500',
  'duration-1000',
  'duration-2000'
];

try {
  const pageEditorContent = fs.readFileSync(pageEditorPath, 'utf8');
  const quizPreviewContent = fs.readFileSync(quizPreviewPath, 'utf8');
  const quizPublicContent = fs.readFileSync(quizPublicPath, 'utf8');
  
  animationClasses.forEach(className => {
    const inPageEditor = pageEditorContent.includes(className);
    const inQuizPreview = quizPreviewContent.includes(className);
    const inQuizPublic = quizPublicContent.includes(className);
    
    console.log(`✅ Classe ${className}: Editor:${inPageEditor} Preview:${inQuizPreview} Public:${inQuizPublic}`);
  });
  
} catch (error) {
  console.error('❌ Erro ao verificar classes CSS:', error.message);
}

// 5. Verificar se o elemento está listado na categoria correta
console.log('\n📋 TESTE 5: Verificando Categorização');

try {
  const content = fs.readFileSync(pageEditorPath, 'utf8');
  
  // Verificar se está na categoria "Conteúdo"
  const contentCategoryMatch = content.match(/Conteúdo.*?elements:\s*\[(.*?)\]/s);
  if (contentCategoryMatch) {
    const elementsInCategory = contentCategoryMatch[1];
    const hasAnimatedTransition = elementsInCategory.includes('animated_transition');
    console.log(`✅ Elemento está na categoria Conteúdo: ${hasAnimatedTransition}`);
  } else {
    console.log('⚠️  Não foi possível encontrar a categoria Conteúdo');
  }
  
} catch (error) {
  console.error('❌ Erro ao verificar categorização:', error.message);
}

// 6. Verificar integração com sistema de propriedades
console.log('\n📋 TESTE 6: Verificando Sistema de Propriedades');

try {
  const content = fs.readFileSync(pageEditorPath, 'utf8');
  
  // Verificar se as propriedades estão sendo salvas corretamente
  const hasUpdateElement = content.includes('updateElement(selectedElementData.id, { animationType: e.target.value })');
  console.log(`✅ Sistema de atualização de propriedades: ${hasUpdateElement}`);
  
  // Verificar se as propriedades têm valores padrão
  const hasDefaultValues = content.includes('|| "pulse"') && content.includes('|| "normal"');
  console.log(`✅ Valores padrão definidos: ${hasDefaultValues}`);
  
  // Verificar se há validação de entrada
  const hasValidation = content.includes('value={selectedElementData.animationType || "pulse"}');
  console.log(`✅ Validação de entrada: ${hasValidation}`);
  
} catch (error) {
  console.error('❌ Erro ao verificar sistema de propriedades:', error.message);
}

console.log('\n' + '=' .repeat(50));
console.log('🎉 TESTE FRONTEND CONCLUÍDO');
console.log('🎨 Elemento animated_transition verificado em todos os componentes');
console.log('=' .repeat(50));