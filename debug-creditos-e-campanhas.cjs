#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

// Função para verificar créditos e campanhas
function debugCreditosECampanhas() {
  console.log('🔍 DEBUG: Créditos e Campanhas');
  console.log('=' .repeat(50));
  
  try {
    const db = new Database(path.join(__dirname, 'database.sqlite'));
    
    // 1. Verificar créditos de todos os usuários
    console.log('💰 CRÉDITOS DOS USUÁRIOS:');
    const users = db.prepare('SELECT id, email, smsCredits, emailCredits, whatsappCredits FROM users').all();
    users.forEach(user => {
      console.log(`👤 ${user.email}:`);
      console.log(`   SMS: ${user.smsCredits || 0} créditos`);
      console.log(`   Email: ${user.emailCredits || 0} créditos`);
      console.log(`   WhatsApp: ${user.whatsappCredits || 0} créditos`);
    });
    
    // 2. Verificar campanhas de email
    console.log('\n📧 CAMPANHAS DE EMAIL:');
    const emailCampaigns = db.prepare('SELECT id, userId, name, status, createdAt FROM email_campaigns ORDER BY createdAt DESC LIMIT 10').all();
    console.log(`Total de campanhas: ${emailCampaigns.length}`);
    emailCampaigns.forEach(campaign => {
      const userEmail = users.find(u => u.id === campaign.userId)?.email || 'Unknown';
      console.log(`📧 ${campaign.name} (${userEmail}) - Status: ${campaign.status}`);
    });
    
    // 3. Verificar campanhas de SMS
    console.log('\n📱 CAMPANHAS DE SMS:');
    const smsCampaigns = db.prepare('SELECT id, userId, name, status, createdAt FROM sms_campaigns ORDER BY createdAt DESC LIMIT 10').all();
    console.log(`Total de campanhas: ${smsCampaigns.length}`);
    smsCampaigns.forEach(campaign => {
      const userEmail = users.find(u => u.id === campaign.userId)?.email || 'Unknown';
      console.log(`📱 ${campaign.name} (${userEmail}) - Status: ${campaign.status}`);
    });
    
    // 4. Verificar estrutura da tabela users
    console.log('\n🏗️ ESTRUTURA DA TABELA USERS:');
    const userTableInfo = db.prepare('PRAGMA table_info(users)').all();
    userTableInfo.forEach(column => {
      console.log(`📋 ${column.name}: ${column.type} (${column.notnull ? 'NOT NULL' : 'NULL'})`);
    });
    
    // 5. Verificar transações de créditos
    console.log('\n💳 TRANSAÇÕES DE CRÉDITOS:');
    try {
      const creditTransactions = db.prepare('SELECT * FROM credit_transactions ORDER BY createdAt DESC LIMIT 5').all();
      console.log(`Total de transações: ${creditTransactions.length}`);
      creditTransactions.forEach(transaction => {
        console.log(`💳 ${transaction.type}: ${transaction.amount} créditos (${transaction.description})`);
      });
    } catch (error) {
      console.log('❌ Tabela credit_transactions não encontrada');
    }
    
    // 6. Verificar se há problema com campos de créditos
    console.log('\n🔍 VERIFICAÇÃO DE CAMPOS DE CRÉDITOS:');
    const userWithCredits = db.prepare('SELECT * FROM users WHERE email = ? LIMIT 1').get('admin@admin.com');
    if (userWithCredits) {
      console.log('👤 Admin user:');
      console.log(`   ID: ${userWithCredits.id}`);
      console.log(`   Email: ${userWithCredits.email}`);
      console.log(`   SMS Credits: ${userWithCredits.smsCredits} (tipo: ${typeof userWithCredits.smsCredits})`);
      console.log(`   Email Credits: ${userWithCredits.emailCredits} (tipo: ${typeof userWithCredits.emailCredits})`);
      console.log(`   WhatsApp Credits: ${userWithCredits.whatsappCredits} (tipo: ${typeof userWithCredits.whatsappCredits})`);
    }
    
    db.close();
    
  } catch (error) {
    console.error('❌ Erro ao debugar:', error);
  }
}

// Executar debug
debugCreditosECampanhas();