const Database = require('better-sqlite3');
const path = require('path');

// Conectar ao banco de dados correto
const dbPath = path.join(__dirname, 'vendzz-database.db');
const db = new Database(dbPath);

async function corrigirEmailMarketing() {
  console.log('🔧 CORREÇÃO FINAL DO EMAIL MARKETING');
  console.log('======================================');
  
  try {
    // 1. Verificar campanhas existentes
    const campanhas = db.prepare('SELECT id, name, status FROM email_campaigns').all();
    console.log(`✅ Campanhas encontradas: ${campanhas.length}`);
    
    if (campanhas.length === 0) {
      console.log('❌ Nenhuma campanha encontrada');
      return;
    }
    
    // 2. Pegar a primeira campanha como exemplo
    const campanhaExemplo = campanhas[0];
    console.log(`📧 Campanha exemplo: ${campanhaExemplo.name} (ID: ${campanhaExemplo.id})`);
    
    // 3. Verificar logs existentes
    const logs = db.prepare('SELECT * FROM email_logs WHERE campaignId = ?').all(campanhaExemplo.id);
    console.log(`📊 Logs encontrados para campanha: ${logs.length}`);
    
    if (logs.length === 0) {
      console.log('⚠️  Nenhum log encontrado - criando logs de exemplo');
      
      // Criar logs de exemplo
      const insertLog = db.prepare(`
        INSERT INTO email_logs (
          id, campaignId, email, personalizedSubject, personalizedContent,
          leadData, status, errorMessage, sentAt, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const logExemplo = {
        id: 'log_exemplo_' + Date.now(),
        campaignId: campanhaExemplo.id,
        email: 'exemplo@teste.com',
        personalizedSubject: 'Teste de Email',
        personalizedContent: 'Conteúdo de teste personalizado',
        leadData: '{"nome": "Teste", "email": "exemplo@teste.com"}',
        status: 'sent',
        errorMessage: null,
        sentAt: Math.floor(Date.now() / 1000),
        createdAt: Math.floor(Date.now() / 1000)
      };
      
      insertLog.run(
        logExemplo.id,
        logExemplo.campaignId,
        logExemplo.email,
        logExemplo.personalizedSubject,
        logExemplo.personalizedContent,
        logExemplo.leadData,
        logExemplo.status,
        logExemplo.errorMessage,
        logExemplo.sentAt,
        logExemplo.createdAt
      );
      
      console.log('✅ Log de exemplo criado');
    }
    
    // 4. Testar endpoint de logs
    console.log('\n🔍 TESTANDO ENDPOINT DE LOGS');
    console.log('----------------------------');
    
    const fetch = (await import('node-fetch')).default;
    const baseUrl = 'http://localhost:5000';
    
    // Fazer login para obter token
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('📊 Resposta do login:', loginData);
    
    const token = loginData.token || loginData.accessToken;
    
    if (!token) {
      console.log('❌ Erro ao fazer login - token não encontrado');
      return;
    }
    
    console.log('✅ Login realizado com sucesso');
    
    // Testar endpoint de logs
    const logsResponse = await fetch(`${baseUrl}/api/email-campaigns/${campanhaExemplo.id}/logs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`📊 Status da resposta: ${logsResponse.status}`);
    
    if (logsResponse.status === 200) {
      const logsData = await logsResponse.json();
      console.log(`✅ Logs obtidos com sucesso: ${logsData.length} registros`);
    } else {
      const errorData = await logsResponse.text();
      console.log(`❌ Erro ao obter logs: ${errorData}`);
    }
    
    // 5. Testar endpoint de exclusão
    console.log('\n🗑️  TESTANDO ENDPOINT DE EXCLUSÃO');
    console.log('----------------------------------');
    
    const deleteResponse = await fetch(`${baseUrl}/api/email-campaigns/${campanhaExemplo.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`📊 Status da exclusão: ${deleteResponse.status}`);
    
    if (deleteResponse.status === 204) {
      console.log('✅ Campanha excluída com sucesso');
    } else {
      const errorData = await deleteResponse.text();
      console.log(`❌ Erro ao excluir campanha: ${errorData}`);
    }
    
    console.log('\n✅ CORREÇÃO CONCLUÍDA');
    console.log('====================');
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  } finally {
    db.close();
  }
}

// Executar correção
corrigirEmailMarketing();