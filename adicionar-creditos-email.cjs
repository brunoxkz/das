#!/usr/bin/env node

/**
 * SCRIPT PARA ADICIONAR CRÉDITOS DE EMAIL AO USUÁRIO ADMIN
 * Adiciona créditos necessários para teste do sistema de email marketing
 */

const sqlite3 = require('better-sqlite3');

function addEmailCredits() {
  try {
    console.log('📧 Adicionando créditos de email ao usuário admin...');
    
    const db = sqlite3('./vendzz-database.db');
    
    // Atualizar usuário admin com créditos de email
    const updateStmt = db.prepare('UPDATE users SET emailCredits = ? WHERE email = ?');
    const result = updateStmt.run(500, 'admin@vendzz.com');
    
    if (result.changes > 0) {
      console.log('✅ Créditos de email adicionados com sucesso!');
      
      // Verificar créditos atualizados
      const user = db.prepare('SELECT email, smsCredits, emailCredits, whatsappCredits, aiCredits FROM users WHERE email = ?').get('admin@vendzz.com');
      console.log('📊 Créditos atuais:', user);
    } else {
      console.log('❌ Usuário admin não encontrado');
    }
    
    db.close();
    
  } catch (error) {
    console.error('❌ Erro ao adicionar créditos:', error.message);
  }
}

// Executar
addEmailCredits();