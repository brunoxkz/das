const fetch = require('node-fetch');

async function testeCaktoAnalyzer() {
  console.log('🎯 TESTANDO ANALISADOR CAKTO');
  
  const url = 'https://quiz.cakto.com.br/preview/pilates-na-parede-VsvLBF';
  
  try {
    // Testar o endpoint de análise
    const response = await fetch('http://localhost:5000/api/funnel/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItaWQiLCJ1c2VybmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBhZG1pbi5jb20iLCJpYXQiOjE3MzcyNTI5MTN9.RZhgHjsQ3jyLhIxE-G2OLDcqgRGKQ7L0Y3eSlMHhP5Y'
      },
      body: JSON.stringify({ url: url })
    });
    
    const result = await response.json();
    
    console.log(`📊 Resultado da análise:`);
    console.log(`   Título: ${result.funnel?.title}`);
    console.log(`   Páginas: ${result.funnel?.pages}`);
    console.log(`   Elementos: ${result.funnel?.elements?.length}`);
    console.log(`   Plataforma: ${result.funnel?.metadata?.platform}`);
    console.log(`   Método: ${result.funnel?.metadata?.detectionMethod}`);
    console.log(`   Slug: ${result.funnel?.metadata?.slug}`);
    
    if (result.funnel?.metadata?.quizStructure) {
      console.log(`   Quiz Structure:`, result.funnel.metadata.quizStructure);
    }
    
    // Verificar se detectou como Cakto
    if (result.funnel?.metadata?.platform === 'cakto') {
      console.log('✅ CAKTO DETECTADO CORRETAMENTE');
    } else {
      console.log('❌ Cakto não foi detectado');
    }
    
    // Verificar páginas criadas
    if (result.funnel?.pageData) {
      console.log(`📄 Páginas criadas:`);
      result.funnel.pageData.forEach(page => {
        console.log(`   ${page.pageNumber}: ${page.title} (${page.elements.length} elementos)`);
      });
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    return null;
  }
}

// Executar teste
testeCaktoAnalyzer()
  .then(result => {
    if (result) {
      console.log('\n🎯 TESTE CAKTO CONCLUÍDO COM SUCESSO');
    } else {
      console.log('\n❌ TESTE CAKTO FALHOU');
    }
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
  });