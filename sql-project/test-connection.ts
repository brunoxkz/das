import { createDatabase } from './src/config/database';
import { users } from './src/schemas';

async function testConnection() {
  try {
    console.log('🔄 Testando conexão com banco de dados...');
    
    const db = createDatabase();
    
    // Test basic query
    const result = await db.select().from(users).limit(1);
    console.log('✅ Conexão bem-sucedida!');
    console.log(`📊 Resultado: ${result.length} registros encontrados`);
    
    console.log('🎉 Projeto SQL independente funcionando!');
    console.log('\n💡 Para usar o projeto:');
    console.log('   1. cd sql-project');
    console.log('   2. npm run dev');
    console.log('   3. Acesse: http://localhost:3001/health');
    
  } catch (error) {
    console.log('❌ Erro na conexão:', error instanceof Error ? error.message : error);
    console.log('\n💡 Isso é normal na primeira execução.');
    console.log('   Execute: npm run db:migrate && npm run db:seed');
  }
}

testConnection();