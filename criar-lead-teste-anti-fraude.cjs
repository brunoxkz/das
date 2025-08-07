/**
 * CRIAR LEAD DE TESTE PARA VALIDAR SISTEMA ANTI-FRAUDE
 * Adiciona resposta de quiz com telefone válido para testar o sistema
 */

const Database = require('better-sqlite3');
const path = require('path');

// Conectar ao banco de dados
const dbPath = path.join(__dirname, 'vendzz-database.db');
const db = new Database(dbPath);

console.log('🔧 CRIANDO LEAD DE TESTE PARA VALIDAR SISTEMA ANTI-FRAUDE');
console.log('====================================================');

try {
  // Criar uma resposta de teste com telefone válido
  const quizResponse = {
    id: 'test-response-anti-fraude-' + Date.now(),
    quizId: 'Fwu7L-y0L7eS8xA5sZQmq',
    responses: JSON.stringify([
      {
        elementId: 'phone-element',
        elementType: 'phone',
        elementFieldId: 'telefone_contato',
        answer: '11995133932'
      },
      {
        elementId: 'nome-element',
        elementType: 'text',
        elementFieldId: 'nome_completo',
        answer: 'João Silva Teste'
      },
      {
        elementId: 'email-element',
        elementType: 'email',
        elementFieldId: 'email_contato',
        answer: 'joao.teste@gmail.com'
      }
    ]),
    metadata: JSON.stringify({
      isComplete: true,
      isPartial: false,
      completionPercentage: 100,
      currentPageIndex: 2,
      totalPages: 3
    }),
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Inserir no banco
  const insertStmt = db.prepare(`
    INSERT INTO quiz_responses (id, quizId, responses, metadata, submittedAt)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertStmt.run(
    quizResponse.id,
    quizResponse.quizId,
    quizResponse.responses,
    quizResponse.metadata,
    Date.now()
  );

  console.log('✅ Lead de teste criado com sucesso!');
  console.log(`📱 Telefone: 11995133932`);
  console.log(`📧 Email: joao.teste@gmail.com`);
  console.log(`👤 Nome: João Silva Teste`);
  console.log(`🎯 Quiz ID: Fwu7L-y0L7eS8xA5sZQmq`);
  console.log(`🔄 Status: Completado (100%)`);

  // Verificar se foi criado corretamente
  const verificacao = db.prepare(`
    SELECT * FROM quiz_responses 
    WHERE id = ? AND quizId = ?
  `).get(quizResponse.id, quizResponse.quizId);

  if (verificacao) {
    console.log('✅ Verificação: Lead encontrado no banco de dados');
    console.log(`📊 Resposta ID: ${verificacao.id}`);
  } else {
    console.log('❌ Erro: Lead não encontrado no banco após inserção');
  }

} catch (error) {
  console.error('❌ Erro ao criar lead de teste:', error);
} finally {
  db.close();
  console.log('\n🔚 Processo concluído. Agora você pode testar o sistema anti-fraude!');
}