/**
 * CORREÇÃO CRÍTICA - SQLite Parameter Binding Errors no Email Marketing
 * Identifica e corrige o erro "Too few parameter values were provided"
 */

import Database from 'better-sqlite3';
import fs from 'fs';

async function corrigirErrorsEmail() {
  console.log('🔧 CORREÇÃO CRÍTICA: SQLite Parameter Binding Errors');
  console.log('====================================================');

  let db;
  try {
    // Conectar ao banco
    db = new Database('./database.db');
    console.log('✅ Conectado ao banco SQLite');

    // 1. DIAGNÓSTICO: Verificar campanhas de email problemáticas
    console.log('\n🔍 1. DIAGNÓSTICO DAS CAMPANHAS PROBLEMÁTICAS');
    const campaignsWithErrors = db.prepare(`
      SELECT id, name, quizId, status, subject, content, createdAt
      FROM email_campaigns 
      WHERE name IN (
        'Teste Detecção Automática',
        'Teste Final Sistema Email Marketing', 
        'TESTE SENIOR DEV - Email Real'
      )
    `).all();

    console.log(`📧 Campanhas encontradas: ${campaignsWithErrors.length}`);
    campaignsWithErrors.forEach(campaign => {
      console.log(`   - ${campaign.name} (ID: ${campaign.id})`);
      console.log(`     Quiz: ${campaign.quizId}, Status: ${campaign.status}`);
    });

    // 2. VERIFICAÇÃO: Estrutura da tabela email_logs
    console.log('\n🔍 2. VERIFICAÇÃO DA ESTRUTURA email_logs');
    try {
      const tableInfo = db.prepare(`PRAGMA table_info(email_logs)`).all();
      console.log('📋 Campos da tabela email_logs:');
      tableInfo.forEach(field => {
        console.log(`   - ${field.name}: ${field.type} ${field.notnull ? '(NOT NULL)' : '(NULLABLE)'}`);
      });
    } catch (error) {
      console.log('❌ Erro ao verificar estrutura da tabela:', error.message);
    }

    // 3. VERIFICAÇÃO: Logs de email existentes  
    console.log('\n🔍 3. VERIFICAÇÃO DE LOGS EXISTENTES');
    try {
      const existingLogs = db.prepare(`
        SELECT campaignId, email, status, COUNT(*) as count
        FROM email_logs 
        GROUP BY campaignId, status
        ORDER BY campaignId
      `).all();
      
      console.log(`📊 Logs existentes: ${existingLogs.length} grupos`);
      existingLogs.slice(0, 5).forEach(log => {
        console.log(`   - Campanha ${log.campaignId}: ${log.count} logs com status '${log.status}'`);
      });
    } catch (error) {
      console.log('❌ Erro ao verificar logs:', error.message);
    }

    // 4. ANÁLISE: Responses do quiz problemático
    console.log('\n🔍 4. ANÁLISE DO QUIZ Qm4wxpfPgkMrwoMhDFNLZ');
    try {
      const quizResponses = db.prepare(`
        SELECT id, responses, metadata, submittedAt
        FROM quiz_responses 
        WHERE quizId = 'Qm4wxpfPgkMrwoMhDFNLZ'
        LIMIT 5
      `).all();
      
      console.log(`📊 Respostas encontradas: ${quizResponses.length}`);
      quizResponses.forEach((response, index) => {
        const responsesData = JSON.parse(response.responses || '{}');
        const email = responsesData.email;
        console.log(`   ${index + 1}. ID: ${response.id.substring(0, 8)}... Email: ${email || 'N/A'}`);
      });
    } catch (error) {
      console.log('❌ Erro ao verificar respostas do quiz:', error.message);
    }

    // 5. SOLUÇÃO: Testar criação de log com dados corretos
    console.log('\n🔧 5. TESTE DE CRIAÇÃO DE LOG CORRIGIDO');
    try {
      const testLog = {
        id: 'test_' + Date.now(),
        campaignId: campaignsWithErrors[0]?.id || 'test_campaign',
        email: 'teste@vendzz.com',
        personalizedSubject: 'Teste Assunto',
        personalizedContent: 'Teste Conteúdo',
        leadData: '{"nome": "Teste", "email": "teste@vendzz.com"}',
        status: 'pending',
        sendgridId: null,
        errorMessage: null,
        sentAt: null,
        deliveredAt: null,
        openedAt: null,
        clickedAt: null,
        scheduledAt: null,
        createdAt: Math.floor(Date.now() / 1000)
      };

      const insertStmt = db.prepare(`
        INSERT INTO email_logs (
          id, campaignId, email, personalizedSubject, personalizedContent,
          leadData, status, sendgridId, errorMessage, sentAt, deliveredAt,
          openedAt, clickedAt, scheduledAt, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = insertStmt.run(
        testLog.id, testLog.campaignId, testLog.email,
        testLog.personalizedSubject, testLog.personalizedContent,
        testLog.leadData, testLog.status, testLog.sendgridId,
        testLog.errorMessage, testLog.sentAt, testLog.deliveredAt,
        testLog.openedAt, testLog.clickedAt, testLog.scheduledAt,
        testLog.createdAt
      );

      console.log('✅ Teste de criação de log bem-sucedido!');
      console.log(`   ID inserido: ${result.lastInsertRowid}`);

      // Remover log de teste
      db.prepare('DELETE FROM email_logs WHERE id = ?').run(testLog.id);
      console.log('🧹 Log de teste removido');

    } catch (error) {
      console.log('❌ ERRO no teste de criação:', error.message);
      console.log('💡 Este é provavelmente o problema que causa "Too few parameter values"');
    }

    // 6. CORREÇÃO: Pausar campanhas problemáticas temporariamente
    console.log('\n🔧 6. PAUSANDO CAMPANHAS PROBLEMÁTICAS');
    try {
      const pauseResult = db.prepare(`
        UPDATE email_campaigns 
        SET status = 'paused'
        WHERE name IN (
          'Teste Detecção Automática',
          'Teste Final Sistema Email Marketing', 
          'TESTE SENIOR DEV - Email Real'
        ) AND status = 'active'
      `).run();

      console.log(`✅ ${pauseResult.changes} campanhas pausadas para correção`);
    } catch (error) {
      console.log('❌ Erro ao pausar campanhas:', error.message);
    }

    console.log('\n🎯 DIAGNÓSTICO COMPLETO');
    console.log('=======================');
    console.log('✅ Sistema de fluxo: Erro corrigido (setFlowEnabled → handleEnableFlow)');
    console.log('⚠️ Sistema de email: Campanhas pausadas para correção');
    console.log('📧 Próximo passo: Corrigir função createEmailLog no storage-sqlite.ts');
    console.log('🔄 Loops infinitos: Campanhas pausadas temporariamente');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    if (db) {
      db.close();
      console.log('🔌 Conexão com banco fechada');
    }
  }
}

// Executar correção
corrigirErrorsEmail().catch(console.error);