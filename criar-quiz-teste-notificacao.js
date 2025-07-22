#!/usr/bin/env node

// Script para criar um quiz '123-teste' para testar notificações automáticas
import Database from 'better-sqlite3';
import fs from 'fs';

try {
  const db = new Database('./vendzz-database.db');
  
  // Primeiro, vamos verificar se já existe
  const existingQuiz = db.prepare('SELECT id, title, userId, isPublished FROM quizzes WHERE id = ?').get('123-teste');
  
  if (existingQuiz) {
    console.log('✅ Quiz 123-teste já existe:', existingQuiz);
    
    // Se não está publicado, vamos publicar
    if (!existingQuiz.isPublished) {
      db.prepare('UPDATE quizzes SET isPublished = 1 WHERE id = ?').run('123-teste');
      console.log('✅ Quiz 123-teste publicado com sucesso!');
    }
  } else {
    // Criar novo quiz de teste usando schema correto
    const quizStructure = JSON.stringify([
      {
        id: 'page-1',
        type: 'question',
        title: 'Pergunta de Teste',
        elements: [
          {
            id: 'q1',
            type: 'multiple_choice',
            question: 'Como você está testando o sistema?',
            options: ['Muito bem', 'Excelente', 'Perfeito'],
            required: true
          }
        ]
      },
      {
        id: 'page-2',
        type: 'lead_capture',
        title: 'Seus Dados',
        elements: [
          {
            id: 'email',
            type: 'email',
            question: 'Qual seu email?',
            required: true
          },
          {
            id: 'nome',
            type: 'text',
            question: 'Qual seu nome?',
            required: true
          }
        ]
      }
    ]);
    
    const currentTime = Date.now();
    
    db.prepare(`
      INSERT INTO quizzes (
        id, 
        userId, 
        title, 
        description, 
        isPublished, 
        structure,
        createdAt, 
        updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      '123-teste',
      'admin-user-id',
      'Quiz Teste Notificação Automática',
      'Quiz criado especificamente para testar as notificações automáticas de completion',
      1,
      quizStructure,
      currentTime,
      currentTime
    );
    
    console.log('✅ Quiz 123-teste criado com sucesso!');
  }
  
  // Verificar se o quiz está acessível
  const finalQuiz = db.prepare('SELECT id, title, userId, isPublished FROM quizzes WHERE id = ?').get('123-teste');
  console.log('🎯 Quiz final:', finalQuiz);
  
  // Verificar se o admin tem push notifications ativas
  const pushSubscriptionsFile = './push-subscriptions.json';
  
  if (fs.existsSync(pushSubscriptionsFile)) {
    const subscriptions = JSON.parse(fs.readFileSync(pushSubscriptionsFile, 'utf8'));
    const adminSubscriptions = subscriptions.filter(s => s.userId === 'admin-user-id');
    console.log(`📱 Admin tem ${adminSubscriptions.length} push subscriptions ativas`);
    
    if (adminSubscriptions.length === 0) {
      console.log('⚠️ IMPORTANTE: Admin não tem push notifications ativas!');
      console.log('💡 Vá para /admin/bulk-push-messaging e clique em "Ativar Notificações" primeiro');
    }
  } else {
    console.log('⚠️ Arquivo push-subscriptions.json não encontrado');
  }
  
  db.close();
  console.log('\n🧪 Agora você pode testar o quiz em: /quiz/123-teste');
  console.log('📱 As notificações automáticas devem aparecer no iPhone quando completar o quiz!');
  
} catch (error) {
  console.error('❌ Erro ao criar quiz de teste:', error);
  process.exit(1);
}