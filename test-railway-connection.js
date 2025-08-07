import pkg from 'pg';
const { Client } = pkg;

async function testRailwayConnection() {
  const client = new Client({
    connectionString: 'postgresql://postgres:DQTpWPNOZbFcLHzomqRDkzwwYFEVjpol@yamanote.proxy.rlwy.net:56203/railway',
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('🔄 Testando conexão PostgreSQL Railway...');
    await client.connect();
    console.log('✅ CONEXÃO ESTABELECIDA COM SUCESSO!');
    
    // Testar versão
    const versionResult = await client.query('SELECT version()');
    console.log('📊 PostgreSQL Version:', versionResult.rows[0].version.split(' ')[0] + ' ' + versionResult.rows[0].version.split(' ')[1]);
    
    // Testar timestamp
    const timeResult = await client.query('SELECT NOW() as current_time');
    console.log('⏰ Timestamp atual:', timeResult.rows[0].current_time);
    
    // Testar criação de tabela simples
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_connection (
        id SERIAL PRIMARY KEY,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('🔧 Tabela de teste criada');
    
    // Inserir registro de teste
    await client.query(`
      INSERT INTO test_connection (message) 
      VALUES ('Teste Railway PostgreSQL - Vendzz Platform')
    `);
    console.log('📝 Registro de teste inserido');
    
    // Verificar dados
    const testResult = await client.query('SELECT * FROM test_connection ORDER BY id DESC LIMIT 1');
    console.log('📋 Último registro:', testResult.rows[0]);
    
    // Limpar tabela de teste
    await client.query('DROP TABLE test_connection');
    console.log('🗑️ Tabela de teste removida');
    
    await client.end();
    console.log('🎉 TESTE COMPLETO - RAILWAY POSTGRESQL 100% FUNCIONAL!');
    console.log('🚀 PRONTO PARA DEPLOY DO SISTEMA VENDZZ!');
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
    process.exit(1);
  }
}

testRailwayConnection();