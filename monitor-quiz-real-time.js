#!/usr/bin/env node

// Monitor em tempo real para capturar erros durante teste do usuário
import fs from 'fs';

console.log('🔍 MONITORANDO SISTEMA EM TEMPO REAL - 15 SEGUNDOS');
console.log('⏰ Iniciado em:', new Date().toISOString());
console.log('📱 URL de teste: https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/quiz/rLguPFaH3FES_ZGfNSHQU');
console.log('👀 Aguardando atividade...\n');

let requestCount = 0;
let lastActivity = Date.now();

// Monitor contínuo por 15 segundos
const monitorInterval = setInterval(async () => {
  try {
    // 1. Verificar subscriptions
    const subscriptions = JSON.parse(fs.readFileSync('./push-subscriptions.json', 'utf8'));
    console.log(`📱 Subscriptions ativas: ${subscriptions.length}`);
    
    // 2. Testar conectividade do sistema
    const healthCheck = await fetch('http://localhost:5000/api/push-simple/stats');
    if (healthCheck.ok) {
      const stats = await healthCheck.json();
      console.log(`📊 Sistema operacional - Stats: ${JSON.stringify(stats)}`);
    }
    
    // 3. Verificar logs recentes (simular)
    const currentTime = Date.now();
    if (currentTime - lastActivity < 2000) {
      console.log(`🔥 ATIVIDADE DETECTADA há ${currentTime - lastActivity}ms`);
    }
    
  } catch (error) {
    console.error(`❌ Erro no monitor: ${error.message}`);
  }
}, 2000);

// Monitor específico para quiz submissions
let submissionDetected = false;
const submissionMonitor = setInterval(async () => {
  try {
    // Verificar se houve submissão recente
    const response = await fetch('http://localhost:5000/api/quizzes/rLguPFaH3FES_ZGfNSHQU/responses', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    }).catch(() => null);
    
    if (response && response.ok) {
      const data = await response.json();
      if (data.responses && data.responses.length > 0) {
        const latestResponse = data.responses[0];
        const responseTime = new Date(latestResponse.submittedAt).getTime();
        const timeDiff = Date.now() - responseTime;
        
        if (timeDiff < 10000 && !submissionDetected) { // Última submissão nos últimos 10s
          submissionDetected = true;
          console.log(`🎯 SUBMISSÃO DETECTADA!`);
          console.log(`📝 Response ID: ${latestResponse.id}`);
          console.log(`⏰ Há ${timeDiff}ms atrás`);
          console.log(`📊 Dados: ${JSON.stringify(latestResponse.responses)}`);
        }
      }
    }
  } catch (error) {
    // Ignorar erros de auth - foco no monitoramento
  }
}, 1000);

// Finalizar após 15 segundos
setTimeout(() => {
  clearInterval(monitorInterval);
  clearInterval(submissionMonitor);
  
  console.log('\n⏰ MONITORAMENTO FINALIZADO');
  console.log(`📊 Total de verificações: ${Math.floor(15/2)}`);
  console.log(`📱 Submissão detectada: ${submissionDetected ? 'SIM' : 'NÃO'}`);
  console.log('🔍 Verifique os logs do servidor para detalhes completos');
  
  process.exit(0);
}, 15000);

// Capturar qualquer sinal de interrupção
process.on('SIGINT', () => {
  console.log('\n⚠️ Monitor interrompido pelo usuário');
  process.exit(0);
});