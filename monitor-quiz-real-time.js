#!/usr/bin/env node

// Monitor em tempo real para capturar quiz completion real
import Database from 'better-sqlite3';
import fs from 'fs';

const QUIZ_ID = 'rLguPFaH3FES_ZGfNSHQU';
const MONITOR_DURATION = 25000; // 25 segundos de monitoramento

console.log(`🔍 INICIANDO MONITORAMENTO EM TEMPO REAL DO QUIZ: ${QUIZ_ID}`);
console.log(`⏰ Timestamp inicial: ${new Date().toISOString()}`);
console.log(`🌐 URL monitorada: https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/quiz/${QUIZ_ID}`);

let db;
let lastResponseCount = 0;
let lastAnalyticsCompletions = 0;
let monitoringActive = true;

function initializeDatabase() {
  try {
    db = new Database('./vendzz-database.db');
    
    // Contar responses iniciais
    const initialCount = db.prepare('SELECT COUNT(*) as total FROM quiz_responses WHERE quizId = ?').get(QUIZ_ID);
    lastResponseCount = initialCount.total;
    
    // Contar analytics iniciais
    const today = new Date().toISOString().split('T')[0];
    const analytics = db.prepare('SELECT completions FROM quiz_analytics WHERE quizId = ? AND date = ?').get(QUIZ_ID, today);
    lastAnalyticsCompletions = analytics ? analytics.completions : 0;
    
    console.log(`📊 Estado inicial:`);
    console.log(`   Quiz Responses: ${lastResponseCount}`);
    console.log(`   Analytics Completions: ${lastAnalyticsCompletions}`);
    console.log(`   Data: ${today}`);
    
  } catch (error) {
    console.error(`❌ Erro ao inicializar banco: ${error.message}`);
  }
}

function checkForNewResponses() {
  if (!monitoringActive || !db) return;
  
  try {
    // Verificar novas responses
    const currentCount = db.prepare('SELECT COUNT(*) as total FROM quiz_responses WHERE quizId = ?').get(QUIZ_ID);
    
    if (currentCount.total > lastResponseCount) {
      const newResponses = currentCount.total - lastResponseCount;
      console.log(`\n🚨 NOVA RESPONSE DETECTADA!`);
      console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
      console.log(`📈 Responses: ${lastResponseCount} → ${currentCount.total} (+${newResponses})`);
      
      // Buscar a response mais recente
      const latestResponse = db.prepare(`
        SELECT id, responses, metadata, leadData, submittedAt 
        FROM quiz_responses 
        WHERE quizId = ? 
        ORDER BY submittedAt DESC 
        LIMIT 1
      `).get(QUIZ_ID);
      
      if (latestResponse) {
        console.log(`🔍 Response ID: ${latestResponse.id}`);
        console.log(`📧 Lead Data:`, JSON.parse(latestResponse.leadData || '{}'));
        console.log(`📝 Metadata:`, JSON.parse(latestResponse.metadata || '{}'));
        console.log(`⏱️ Submitted: ${new Date(latestResponse.submittedAt).toISOString()}`);
      }
      
      lastResponseCount = currentCount.total;
    }
    
    // Verificar analytics
    const today = new Date().toISOString().split('T')[0];
    const analytics = db.prepare('SELECT completions FROM quiz_analytics WHERE quizId = ? AND date = ?').get(QUIZ_ID, today);
    const currentCompletions = analytics ? analytics.completions : 0;
    
    if (currentCompletions > lastAnalyticsCompletions) {
      const newCompletions = currentCompletions - lastAnalyticsCompletions;
      console.log(`📊 ANALYTICS ATUALIZADA: ${lastAnalyticsCompletions} → ${currentCompletions} (+${newCompletions})`);
      lastAnalyticsCompletions = currentCompletions;
    }
    
  } catch (error) {
    console.error(`❌ Erro no monitoramento: ${error.message}`);
  }
}

function checkPushSubscriptions() {
  try {
    const pushFile = './push-subscriptions.json';
    if (fs.existsSync(pushFile)) {
      const subscriptions = JSON.parse(fs.readFileSync(pushFile, 'utf8'));
      console.log(`📱 Push subscriptions ativas: ${subscriptions.length}`);
      
      subscriptions.forEach((sub, index) => {
        console.log(`   ${index + 1}. User: ${sub.userId} | Endpoint: ${sub.endpoint.substring(0, 30)}...`);
      });
    } else {
      console.log(`❌ Arquivo push-subscriptions.json não encontrado`);
    }
  } catch (error) {
    console.error(`❌ Erro ao verificar push subscriptions: ${error.message}`);
  }
}

function startMonitoring() {
  console.log(`\n🚀 MONITORAMENTO ATIVO - Verificando a cada 1 segundo por ${MONITOR_DURATION/1000} segundos`);
  console.log(`📝 Complete o quiz na URL pública e observe as notificações automáticas!\n`);
  
  checkPushSubscriptions();
  
  const interval = setInterval(checkForNewResponses, 1000);
  
  setTimeout(() => {
    monitoringActive = false;
    clearInterval(interval);
    
    console.log(`\n⏰ MONITORAMENTO FINALIZADO`);
    console.log(`📊 Resultado final:`);
    console.log(`   Quiz Responses: ${lastResponseCount}`);
    console.log(`   Analytics Completions: ${lastAnalyticsCompletions}`);
    console.log(`⏱️ Timestamp final: ${new Date().toISOString()}`);
    
    if (db) {
      db.close();
    }
    
    console.log(`\n✅ Se você completou o quiz, as notificações automáticas devem ter sido enviadas!`);
    console.log(`📱 Verifique o iPhone para confirmar se as push notifications chegaram na tela de bloqueio.`);
    
    process.exit(0);
  }, MONITOR_DURATION);
}

// Inicializar e começar monitoramento
initializeDatabase();
startMonitoring();