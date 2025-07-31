#!/usr/bin/env node

/**
 * DEBUG DO BANCO DE DADOS - SISTEMA EMAIL MARKETING
 * Investigação profunda dos problemas de Foreign Key e estrutura
 */

import Database from 'better-sqlite3';

const sqlite = new Database('./vendzz-database.db');

console.log('🔍 INVESTIGAÇÃO DO BANCO DE DADOS - EMAIL MARKETING');
console.log('=' .repeat(80));

// 1. Verificar foreign keys ativas
console.log('\n📋 1. VERIFICANDO FOREIGN KEYS ATIVAS');
try {
  const pragmaResult = sqlite.pragma('foreign_keys');
  console.log(`Foreign Keys Status: ${pragmaResult[0]?.foreign_keys ? 'ATIVADO' : 'DESATIVADO'}`);
} catch (error) {
  console.log('Erro ao verificar pragma foreign_keys:', error.message);
}

// 2. Verificar schema da tabela email_campaigns
console.log('\n📋 2. SCHEMA DA TABELA EMAIL_CAMPAIGNS');
try {
  const schema = sqlite.pragma('table_info(email_campaigns)');
  console.log('Colunas da tabela email_campaigns:');
  schema.forEach(col => {
    console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
  });
} catch (error) {
  console.log('Erro ao verificar schema:', error.message);
}

// 3. Verificar foreign key constraints
console.log('\n📋 3. FOREIGN KEY CONSTRAINTS');
try {
  const foreignKeys = sqlite.pragma('foreign_key_list(email_campaigns)');
  if (foreignKeys.length > 0) {
    console.log('Foreign Keys encontradas:');
    foreignKeys.forEach(fk => {
      console.log(`  ${fk.from} -> ${fk.table}.${fk.to} (ON DELETE: ${fk.on_delete}, ON UPDATE: ${fk.on_update})`);
    });
  } else {
    console.log('Nenhuma foreign key encontrada na tabela email_campaigns');
  }
} catch (error) {
  console.log('Erro ao verificar foreign keys:', error.message);
}

// 4. Verificar dados existentes
console.log('\n📋 4. DADOS EXISTENTES');
try {
  // Contar quizzes
  const quizzesCount = sqlite.prepare('SELECT COUNT(*) as count FROM quizzes').get();
  console.log(`Total de quizzes: ${quizzesCount.count}`);

  // Contar campanhas de email
  const campaignsCount = sqlite.prepare('SELECT COUNT(*) as count FROM email_campaigns').get();
  console.log(`Total de campanhas de email: ${campaignsCount.count}`);

  // Listar alguns quizzes para debug
  if (quizzesCount.count > 0) {
    console.log('\nPrimeiros 3 quizzes:');
    const quizzes = sqlite.prepare('SELECT id, title, userId FROM quizzes LIMIT 3').all();
    quizzes.forEach(quiz => {
      console.log(`  ID: ${quiz.id}, Título: ${quiz.title}, User: ${quiz.userId}`);
    });
  }

  // Listar campanhas órfãs (se existirem)
  try {
    const orphanCampaigns = sqlite.prepare(`
      SELECT ec.id, ec.name, ec.quizId 
      FROM email_campaigns ec 
      LEFT JOIN quizzes q ON ec.quizId = q.id 
      WHERE q.id IS NULL AND ec.quizId != ''
    `).all();
    
    if (orphanCampaigns.length > 0) {
      console.log('\n⚠️ CAMPANHAS ÓRFÃS ENCONTRADAS (quizId inválido):');
      orphanCampaigns.forEach(campaign => {
        console.log(`  Campanha: ${campaign.name}, Quiz ID inexistente: ${campaign.quizId}`);
      });
    } else {
      console.log('\n✅ Nenhuma campanha órfã encontrada');
    }
  } catch (error) {
    console.log('Erro ao verificar campanhas órfãs:', error.message);
  }

} catch (error) {
  console.log('Erro ao verificar dados:', error.message);
}

// 5. Testar inserção com dados válidos
console.log('\n📋 5. TESTE DE INSERÇÃO');
try {
  // Buscar um quiz válido
  const validQuiz = sqlite.prepare('SELECT id FROM quizzes WHERE id IS NOT NULL LIMIT 1').get();
  
  if (validQuiz) {
    console.log(`Quiz válido encontrado: ${validQuiz.id}`);
    
    // Tentar inserir campanha de teste
    const testCampaign = {
      id: 'test-campaign-' + Date.now(),
      userId: 'admin-user-id',
      name: 'Teste Debug',
      quizId: validQuiz.id,
      subject: 'Teste',
      content: 'Teste',
      targetAudience: 'all',
      triggerType: 'immediate',
      triggerDelay: 0,
      triggerUnit: 'minutes',
      status: 'draft',
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
      campaignType: 'standard',
      conditionalRules: null
    };

    try {
      const insertStmt = sqlite.prepare(`
        INSERT INTO email_campaigns (
          id, userId, name, quizId, subject, content, targetAudience, 
          triggerType, triggerDelay, triggerUnit, status, sent, delivered, 
          opened, clicked, createdAt, updatedAt, campaignType, conditionalRules
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = insertStmt.run(
        testCampaign.id, testCampaign.userId, testCampaign.name, testCampaign.quizId,
        testCampaign.subject, testCampaign.content, testCampaign.targetAudience,
        testCampaign.triggerType, testCampaign.triggerDelay, testCampaign.triggerUnit,
        testCampaign.status, testCampaign.sent, testCampaign.delivered,
        testCampaign.opened, testCampaign.clicked, testCampaign.createdAt,
        testCampaign.updatedAt, testCampaign.campaignType, testCampaign.conditionalRules
      );
      
      console.log(`✅ Inserção bem-sucedida! Row ID: ${result.lastInsertRowid}`);
      
      // Limpar teste
      sqlite.prepare('DELETE FROM email_campaigns WHERE id = ?').run(testCampaign.id);
      console.log('✅ Campanha de teste removida');
      
    } catch (insertError) {
      console.log(`❌ Erro na inserção: ${insertError.message}`);
      console.log('Detalhes do erro:', insertError);
    }
    
  } else {
    console.log('❌ Nenhum quiz válido encontrado para teste');
  }
} catch (error) {
  console.log('Erro no teste de inserção:', error.message);
}

// 6. Verificar índices
console.log('\n📋 6. ÍNDICES DA TABELA');
try {
  const indexes = sqlite.pragma('index_list(email_campaigns)');
  if (indexes.length > 0) {
    console.log('Índices encontrados:');
    indexes.forEach(idx => {
      console.log(`  ${idx.name}: ${idx.unique ? 'UNIQUE' : 'NON-UNIQUE'}`);
    });
  } else {
    console.log('Nenhum índice encontrado');
  }
} catch (error) {
  console.log('Erro ao verificar índices:', error.message);
}

// 7. Verificar integridade do banco
console.log('\n📋 7. VERIFICAÇÃO DE INTEGRIDADE');
try {
  const integrityCheck = sqlite.pragma('integrity_check');
  if (integrityCheck[0] === 'ok' || integrityCheck[0].result === 'ok') {
    console.log('✅ Integridade do banco: OK');
  } else {
    console.log('❌ Problemas de integridade encontrados:');
    integrityCheck.forEach(issue => {
      console.log(`  ${issue}`);
    });
  }
} catch (error) {
  console.log('Erro na verificação de integridade:', error.message);
}

console.log('\n' + '=' .repeat(80));
console.log('🎯 INVESTIGAÇÃO CONCLUÍDA');

sqlite.close();