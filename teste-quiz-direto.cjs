// Teste direto da função getQuiz do storage

const { DatabaseStorageSQLite } = require('./server/storage-sqlite.ts');

async function testQuizDirect() {
  console.log('🔍 TESTE DIRETO - Storage getQuiz');
  
  try {
    const storage = new DatabaseStorageSQLite();
    const quiz = await storage.getQuiz('G6_IWD6lNpzIlnqb6EVnm');
    
    console.log('📋 Resultado:', quiz ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
    if (quiz) {
      console.log('✅ ID:', quiz.id);
      console.log('✅ Title:', quiz.title);
      console.log('✅ Owner:', quiz.userId);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testQuizDirect();