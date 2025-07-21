#!/usr/bin/env node

const Database = require('better-sqlite3');
const { nanoid } = require('nanoid');

console.log('🎯 SIMULAÇÃO DIRETA NO BANCO SQLITE');
console.log('📊 Inserindo 10 quiz completions para testar detecção automática\n');

const db = new Database('./database.sqlite');

function simulateQuizCompletions() {
  try {
    // Quiz existente
    const quizId = 'G6_IWD6lNpzIlnqb6EVnm';
    console.log(`📝 Usando quiz: ${quizId} (Última oportunidad)\n`);
    
    // Inserir 10 quiz responses
    const insertResponse = db.prepare(`
      INSERT INTO quiz_responses (
        id, quizId, userId, responses, metadata, submittedAt, country, phoneCountryCode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertVariable = db.prepare(`
      INSERT INTO response_variables (
        id, responseId, quizId, variableName, variableValue, 
        elementType, pageId, elementId, pageOrder, question, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const now = Date.now();
    
    for (let i = 1; i <= 10; i++) {
      const responseId = nanoid();
      const timestamp = now + (i * 1000); // Espaçar 1 segundo entre cada
      
      // Dados do response principal
      const responses = JSON.stringify({
        nome_completo: `Admin Vendzz ${i}`,
        email_contato: 'admin@vendzz.com',
        telefone: `11999887${String(i).padStart(3, '0')}`,
        produto_interesse: i % 2 === 0 ? 'Produto Premium' : 'Produto Basic',
        quiz_completed: true
      });
      
      const metadata = JSON.stringify({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        device: 'iPhone',
        source: 'direct_simulation',
        ip: '192.168.1.100',
        completion_duration: Math.floor(Math.random() * 300) + 60,
        pages_viewed: 4,
        conversion_step: 'completed',
        notification_eligible: true
      });
      
      // Inserir quiz response
      insertResponse.run(
        responseId,
        quizId,
        'admin@vendzz.com', // userId
        responses,
        metadata,
        timestamp,
        'Brasil',
        '+55'
      );
      
      // Inserir variáveis específicas
      const variables = [
        { name: 'nome_completo', value: `Admin Vendzz ${i}`, type: 'text', page: 'page_1', element: 'nome_input' },
        { name: 'email_contato', value: 'admin@vendzz.com', type: 'email', page: 'page_2', element: 'email_input' },
        { name: 'telefone', value: `11999887${String(i).padStart(3, '0')}`, type: 'text', page: 'page_3', element: 'phone_input' },
        { name: 'produto_interesse', value: i % 2 === 0 ? 'Produto Premium' : 'Produto Basic', type: 'multiple_choice', page: 'page_4', element: 'produto_choice' }
      ];
      
      variables.forEach((variable, index) => {
        insertVariable.run(
          nanoid(),
          responseId,
          quizId,
          variable.name,
          variable.value,
          variable.type,
          variable.page,
          variable.element,
          index + 1,
          `Pergunta ${index + 1}`,
          timestamp
        );
      });
      
      console.log(`✅ Quiz completion ${i}/10: ${`Admin Vendzz ${i}`} - ${timestamp}`);
    }
    
    console.log('\n🎉 SIMULAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('📊 10 quiz responses inseridos diretamente no banco');
    console.log('📧 Todos os completions são para: admin@vendzz.com');
    console.log(`🔔 Quiz ID: ${quizId}`);
    
    // Verificar os dados inseridos
    const countResponses = db.prepare('SELECT COUNT(*) as count FROM quiz_responses WHERE quizId = ?').get(quizId);
    const countVariables = db.prepare('SELECT COUNT(*) as count FROM response_variables WHERE quizId = ?').get(quizId);
    
    console.log(`\n📈 ESTATÍSTICAS:`)
    console.log(`- Total quiz_responses para este quiz: ${countResponses.count}`);
    console.log(`- Total response_variables para este quiz: ${countVariables.count}`);
    
    console.log('\n📱 PRÓXIMOS PASSOS:');
    console.log('1. O sistema detectará automaticamente estes novos completions');
    console.log('2. As notificações push serão enviadas em poucos segundos');
    console.log('3. Observe os logs do servidor para confirmação');
    console.log('4. Teste o som de notificação de venda ModernSaleSound');
    
    console.log('\n🔍 SISTEMA DE DETECÇÃO ATIVO:');
    console.log('- Verifica novos quiz_responses a cada 10 segundos');
    console.log('- Filtra usuários com push notifications ativadas');
    console.log('- Admin sempre recebe (override automático)');
    console.log('- Mensagens rotativas das 9 opções configuradas');
    
  } catch (error) {
    console.error('❌ Erro durante simulação:', error);
  } finally {
    db.close();
  }
}

simulateQuizCompletions();