/**
 * DEBUG - SIMULAÇÃO DE RATE LIMITING PARA 100K+ USUÁRIOS
 * Teste para verificar se os limites são adequados
 */

console.log('🚀 TESTE DE RATE LIMITING PARA 100K+ USUÁRIOS');

// Simular diferentes cenários de uso
const scenarios = {
  'usuario_normal': {
    dashboard: 20,  // 20 req/min dashboard
    quiz_edit: 15,  // 15 req/min editando quiz
    api_calls: 50,  // 50 req/min API geral
    total: 85       // 85 req/min total
  },
  'usuario_power': {
    dashboard: 100, // 100 req/min dashboard
    quiz_edit: 50,  // 50 req/min editando quiz
    api_calls: 200, // 200 req/min API geral
    total: 350      // 350 req/min total
  },
  'usuario_extremo': {
    dashboard: 200, // 200 req/min dashboard
    quiz_edit: 100, // 100 req/min editando quiz
    api_calls: 500, // 500 req/min API geral
    total: 800      // 800 req/min total
  }
};

// Limites atuais do sistema
const systemLimits = {
  general: 5000,    // 5000 req/min por usuário
  dashboard: 500,   // 500 req/min por usuário
  quizCreation: 200, // 200 req/min por usuário
  auth: 50,         // 50 req/min por IP
  upload: 100       // 100 req/min por usuário
};

console.log('\n📊 ANÁLISE DE CENÁRIOS:');
console.log('=======================');

Object.entries(scenarios).forEach(([type, usage]) => {
  const utilizacaoAPI = (usage.total / systemLimits.general * 100).toFixed(1);
  const utilizacaoDashboard = (usage.dashboard / systemLimits.dashboard * 100).toFixed(1);
  const utilizacaoQuiz = (usage.quiz_edit / systemLimits.quizCreation * 100).toFixed(1);
  
  console.log(`\n${type.toUpperCase()}:`);
  console.log(`  Uso total: ${usage.total} req/min`);
  console.log(`  Utilização API: ${utilizacaoAPI}% (${usage.total}/${systemLimits.general})`);
  console.log(`  Utilização Dashboard: ${utilizacaoDashboard}% (${usage.dashboard}/${systemLimits.dashboard})`);
  console.log(`  Utilização Quiz: ${utilizacaoQuiz}% (${usage.quiz_edit}/${systemLimits.quizCreation})`);
  
  const status = usage.total < systemLimits.general ? '✅ PASSOU' : '❌ BLOQUEADO';
  console.log(`  Status: ${status}`);
});

// Calcular quantos usuários simultâneos o sistema suporta
console.log('\n🔢 CAPACIDADE SIMULTÂNEA:');
console.log('==========================');

Object.entries(scenarios).forEach(([type, usage]) => {
  const capacidadeMaxima = Math.floor(systemLimits.general / usage.total);
  console.log(`${type}: ${capacidadeMaxima.toLocaleString()} usuários simultâneos`);
});

// Simular 100k usuários com distribuição realista
const distribuicao = {
  usuarios_normais: 70000,    // 70% usuários normais
  usuarios_power: 25000,      // 25% usuários power
  usuarios_extremos: 5000     // 5% usuários extremos
};

console.log('\n🎯 SIMULAÇÃO 100K USUÁRIOS:');
console.log('============================');

let totalReqMin = 0;
Object.entries(distribuicao).forEach(([type, count]) => {
  const scenarioKey = type.replace('usuarios_', 'usuario_');
  const reqPerUser = scenarios[scenarioKey]?.total || 0;
  const totalReqs = count * reqPerUser;
  totalReqMin += totalReqs;
  
  console.log(`${type}: ${count.toLocaleString()} × ${reqPerUser} = ${totalReqs.toLocaleString()} req/min`);
});

console.log(`\n📈 TOTAL SISTEMA: ${totalReqMin.toLocaleString()} req/min`);
console.log(`📈 TOTAL SISTEMA: ${(totalReqMin / 60).toLocaleString()} req/seg`);
console.log(`📈 PICO ESTIMADO: ${(totalReqMin * 1.5 / 60).toLocaleString()} req/seg`);

// Verificar se os limites são adequados
const capacidadeTotal = systemLimits.general * 100000; // 100k usuários
const utilizacaoPercentual = (totalReqMin / capacidadeTotal * 100).toFixed(2);

console.log(`\n🚨 ANÁLISE FINAL:`);
console.log(`Capacidade Total: ${capacidadeTotal.toLocaleString()} req/min`);
console.log(`Uso Real: ${totalReqMin.toLocaleString()} req/min`);
console.log(`Utilização: ${utilizacaoPercentual}%`);

if (parseFloat(utilizacaoPercentual) < 50) {
  console.log('✅ SISTEMA SUPORTA 100K+ USUÁRIOS COM FOLGA');
} else if (parseFloat(utilizacaoPercentual) < 80) {
  console.log('⚠️ SISTEMA SUPORTA 100K+ USUÁRIOS COM MONITORAMENTO');
} else {
  console.log('❌ SISTEMA PRECISA DE AJUSTES PARA 100K+ USUÁRIOS');
}

console.log('\n💡 RECOMENDAÇÕES:');
console.log('- Monitorar uso real vs estimado');
console.log('- Implementar rate limiting adaptativo');
console.log('- Cache inteligente para reduzir requests');
console.log('- Load balancing para distribuir carga');