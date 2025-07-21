#!/usr/bin/env node

const Database = require('better-sqlite3');
const { nanoid } = require('nanoid');

console.log('🎯 INSERÇÃO SIMPLES DE QUIZ COMPLETIONS');
console.log('📊 Inserindo 10 registros para testar sistema de detecção\n');

const db = new Database('./database.sqlite');

function insertCompletions() {
  try {
    const quizId = 'G6_IWD6lNpzIlnqb6EVnm';
    console.log(`📝 Usando quiz: ${quizId}\n`);
    
    // Inserir apenas na tabela quiz_responses (sem foreign key de users)
    const insertResponse = db.prepare(`
      INSERT INTO quiz_responses (
        id, quizId, responses, metadata, submittedAt, country, phoneCountryCode
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const now = Date.now();
    
    for (let i = 1; i <= 10; i++) {
      const responseId = nanoid();
      const timestamp = now + (i * 2000); // 2 segundos de diferença entre cada
      
      const responses = JSON.stringify({
        nome_completo: `Admin Teste ${i}`,
        email_contato: 'admin@vendzz.com',
        telefone: `11999887${String(i).padStart(3, '0')}`,
        produto_interesse: i % 2 === 0 ? 'Premium' : 'Basic',
        quiz_completed: true
      });
      
      const metadata = JSON.stringify({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        device: 'iPhone',
        source: 'test_simulation',
        ip: '192.168.1.100',
        completion_duration: Math.floor(Math.random() * 200) + 60,
        notification_eligible: true,
        admin_test: true
      });
      
      insertResponse.run(
        responseId,
        quizId,
        responses,
        metadata,
        timestamp,
        'Brasil',
        '+55'
      );
      
      console.log(`✅ Quiz completion ${i}/10: Admin Teste ${i} - Timestamp: ${timestamp}`);
    }
    
    // Verificar inserção
    const count = db.prepare('SELECT COUNT(*) as count FROM quiz_responses WHERE quizId = ?').get(quizId);
    console.log(`\n📊 Total de responses para quiz ${quizId}: ${count.count}`);
    
    // Mostrar os últimos registros
    const recent = db.prepare(`
      SELECT id, responses, submittedAt 
      FROM quiz_responses 
      WHERE quizId = ? 
      ORDER BY submittedAt DESC 
      LIMIT 5
    `).all(quizId);
    
    console.log('\n📋 Últimos 5 registros inseridos:');
    recent.forEach((row, index) => {
      const responses = JSON.parse(row.responses);
      const date = new Date(row.submittedAt).toLocaleString();
      console.log(`${index + 1}. ${responses.nome_completo} - ${date}`);
    });
    
    console.log('\n🎉 INSERÇÃO CONCLUÍDA!');
    console.log('🔔 O sistema de detecção automática deve ativar em segundos');
    console.log('📱 Aguarde as notificações push serem enviadas');
    console.log('🔊 Som ModernSaleSound deve tocar automaticamente');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    db.close();
  }
}

insertCompletions();