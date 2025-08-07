#!/usr/bin/env node

// Script para simular 10 quiz completions para testar o sistema de notificações automáticas
// Este script vai inserir registros reais no banco de dados SQLite

const Database = require('better-sqlite3');
const { nanoid } = require('nanoid');

console.log('🎯 SIMULANDO 10 QUIZ COMPLETIONS PARA ADMIN@VENDZZ.COM');
console.log('📊 Este script vai inserir registros reais no banco para testar detecção automática\n');

try {
  // Conectar ao banco de dados SQLite
  const db = new Database('./database.sqlite');
  
  // Buscar um quiz existente para usar nas simulações
  const existingQuiz = db.prepare('SELECT id, title FROM quizzes LIMIT 1').get();
  
  if (!existingQuiz) {
    console.log('❌ Nenhum quiz encontrado no banco. Criando um quiz de teste...');
    
    // Criar um quiz simples para teste
    const quizId = nanoid();
    const quizStructure = {
      pages: [
        {
          id: 'page_1',
          title: 'Página 1',
          elements: [
            {
              id: 'element_1',
              type: 'text',
              question: 'Qual é o seu nome?',
              responseId: 'nome_completo'
            }
          ]
        },
        {
          id: 'page_2', 
          title: 'Página 2',
          elements: [
            {
              id: 'element_2',
              type: 'email',
              question: 'Qual é o seu email?',
              responseId: 'email_contato'
            }
          ]
        }
      ]
    };
    
    db.prepare(`
      INSERT INTO quizzes (id, title, description, structure, userId, isPublished, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      quizId,
      'Quiz de Teste - Notificações Push',
      'Quiz criado automaticamente para testar sistema de notificações',
      JSON.stringify(quizStructure),
      'admin-user-id',
      1,
      Math.floor(Date.now() / 1000),
      Math.floor(Date.now() / 1000)
    );
    
    console.log(`✅ Quiz de teste criado: ${quizId}`);
    existingQuiz = { id: quizId, title: 'Quiz de Teste - Notificações Push' };
  }
  
  console.log(`📝 Usando quiz: ${existingQuiz.title} (ID: ${existingQuiz.id})\n`);
  
  // Simular 10 quiz completions
  const completions = [];
  const now = Math.floor(Date.now() / 1000);
  
  for (let i = 1; i <= 10; i++) {
    const responseId = nanoid();
    const submittedAt = now - (i * 30); // Espalhar ao longo dos últimos 5 minutos
    
    const responses = {
      nome_completo: `Admin Teste ${i}`,
      email_contato: 'admin@vendzz.com',
      telefone: `11999887${String(i).padStart(3, '0')}`,
      produto_interesse: i % 2 === 0 ? 'Produto Premium' : 'Produto Basic',
      quiz_completed: true,
      completion_time: new Date(submittedAt * 1000).toISOString()
    };
    
    const metadata = {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      device: 'iPhone',
      source: 'direct',
      ip: '192.168.1.100',
      completion_duration: Math.floor(Math.random() * 300) + 60, // 1-6 minutos
      pages_viewed: 2,
      conversion_step: 'completed'
    };
    
    // Inserir quiz response
    db.prepare(`
      INSERT INTO quiz_responses (id, quizId, userId, responses, metadata, submittedAt, country, phoneCountryCode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      responseId,
      existingQuiz.id,
      null, // userId null para respostas anônimas
      JSON.stringify(responses),
      JSON.stringify(metadata),
      submittedAt,
      'Brasil',
      '+55'
    );
    
    // Inserir variáveis de resposta para segmentação
    const variables = [
      { name: 'nome_completo', value: responses.nome_completo, type: 'text', pageId: 'page_1', elementId: 'element_1' },
      { name: 'email_contato', value: responses.email_contato, type: 'email', pageId: 'page_2', elementId: 'element_2' },
      { name: 'telefone', value: responses.telefone, type: 'phone', pageId: 'page_2', elementId: 'element_3' },
      { name: 'produto_interesse', value: responses.produto_interesse, type: 'multiple_choice', pageId: 'page_3', elementId: 'element_4' }
    ];
    
    for (const variable of variables) {
      db.prepare(`
        INSERT INTO response_variables (id, responseId, quizId, variableName, variableValue, elementType, pageId, elementId, pageOrder, question, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        nanoid(),
        responseId,
        existingQuiz.id,
        variable.name,
        variable.value,
        variable.type,
        variable.pageId,
        variable.elementId,
        parseInt(variable.pageId.split('_')[1]),
        `Pergunta ${variable.name}`,
        submittedAt
      );
    }
    
    completions.push({
      id: responseId,
      submittedAt,
      email: responses.email_contato,
      name: responses.nome_completo
    });
    
    console.log(`✅ Quiz completion ${i}/10 criado: ${responses.nome_completo} (${new Date(submittedAt * 1000).toLocaleTimeString()})`);
  }
  
  console.log('\n🎉 SIMULAÇÃO CONCLUÍDA!');
  console.log(`📊 ${completions.length} quiz completions inseridos no banco de dados`);
  console.log(`⏰ Timestamps: ${new Date(completions[0].submittedAt * 1000).toLocaleTimeString()} até ${new Date(completions[completions.length - 1].submittedAt * 1000).toLocaleTimeString()}`);
  console.log(`📧 Todos os completions são para: admin@vendzz.com`);
  console.log(`🔔 Quiz ID: ${existingQuiz.id}`);
  
  console.log('\n📱 PRÓXIMOS PASSOS:');
  console.log('1. Aguarde o sistema detectar automaticamente os novos completions');
  console.log('2. Verifique se as notificações push são enviadas');
  console.log('3. Observe os logs do servidor para confirmação');
  console.log('4. Teste o som de notificação de venda');
  
  console.log('\n🔍 SISTEMA DE DETECÇÃO:');
  console.log('- Verifica novos quiz_responses a cada 10 segundos');
  console.log('- Filtra apenas usuários com push notifications ativadas');
  console.log('- Admin sempre recebe (override para teste)');
  console.log('- Mensagens rotativas das 9 opções configuradas');
  
  db.close();
  
} catch (error) {
  console.error('❌ Erro durante simulação:', error);
  process.exit(1);
}