#!/usr/bin/env node

// Script para simular quiz completions no quiz 'blablabla' e monitorar TODOS os logs
import Database from 'better-sqlite3';
import fs from 'fs';

const QUIZ_ID = 'rLguPFaH3FES_ZGfNSHQU'; // ID real do quiz 'blablabla'
const SERVER_URL = 'http://localhost:5000';

// Função para fazer request com logs detalhados
async function makeQuizSubmission(testData) {
  const payload = {
    responses: testData.responses,
    metadata: {
      completedAt: new Date().toISOString(),
      isComplete: true,
      userAgent: testData.userAgent || 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      ip: testData.ip || '192.168.1.100'
    },
    leadData: testData.leadData,
    timeSpent: testData.timeSpent || Math.floor(Math.random() * 300) + 60
  };

  console.log(`\n🧪 TESTE ${testData.name}:`);
  console.log(`📱 Simulando: ${testData.description}`);
  console.log(`📋 Payload:`, JSON.stringify(payload, null, 2));
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${SERVER_URL}/api/quizzes/${QUIZ_ID}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': testData.userAgent || 'TestBot/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    const responseTime = Date.now() - startTime;
    const responseText = await response.text();
    
    console.log(`\n📊 RESULTADO ${testData.name}:`);
    console.log(`⏱️ Tempo de resposta: ${responseTime}ms`);
    console.log(`📡 Status HTTP: ${response.status} ${response.statusText}`);
    console.log(`📄 Headers de resposta:`, Object.fromEntries(response.headers.entries()));
    console.log(`💬 Body da resposta: ${responseText}`);
    
    if (response.ok) {
      console.log(`✅ SUCESSO: Quiz completion processado`);
      return { success: true, data: JSON.parse(responseText), responseTime };
    } else {
      console.log(`❌ ERRO: ${response.status} - ${responseText}`);
      return { success: false, error: responseText, status: response.status };
    }
    
  } catch (error) {
    console.log(`💥 EXCEÇÃO: ${error.message}`);
    return { success: false, exception: error.message };
  }
}

// Função para verificar push subscriptions
function checkPushSubscriptions() {
  console.log(`\n🔍 VERIFICANDO PUSH SUBSCRIPTIONS:`);
  
  const pushFile = './push-subscriptions.json';
  if (fs.existsSync(pushFile)) {
    const subscriptions = JSON.parse(fs.readFileSync(pushFile, 'utf8'));
    console.log(`📱 Total de subscriptions: ${subscriptions.length}`);
    
    subscriptions.forEach((sub, index) => {
      console.log(`📱 Subscription ${index + 1}:`);
      console.log(`   User ID: ${sub.userId}`);
      console.log(`   Endpoint: ${sub.endpoint.substring(0, 50)}...`);
      console.log(`   Criada em: ${new Date(sub.timestamp).toLocaleString()}`);
    });
    
    const adminSubs = subscriptions.filter(s => s.userId === 'admin-user-id');
    console.log(`👑 Admin subscriptions: ${adminSubs.length}`);
    
  } else {
    console.log(`❌ Arquivo push-subscriptions.json não encontrado`);
  }
}

// Função para verificar o quiz no banco
function checkQuizInDatabase() {
  console.log(`\n🗄️ VERIFICANDO QUIZ NO BANCO:`);
  
  try {
    const db = new Database('./vendzz-database.db');
    
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(QUIZ_ID);
    if (quiz) {
      console.log(`✅ Quiz encontrado:`);
      console.log(`   ID: ${quiz.id}`);
      console.log(`   Título: ${quiz.title}`);
      console.log(`   Dono: ${quiz.userId}`);
      console.log(`   Publicado: ${quiz.isPublished ? 'Sim' : 'Não'}`);
      console.log(`   Criado em: ${new Date(quiz.createdAt).toLocaleString()}`);
    } else {
      console.log(`❌ Quiz '${QUIZ_ID}' não encontrado no banco`);
    }
    
    // Verificar responses existentes
    const responses = db.prepare('SELECT COUNT(*) as total FROM quiz_responses WHERE quizId = ?').get(QUIZ_ID);
    console.log(`📝 Responses existentes: ${responses.total}`);
    
    db.close();
    return quiz;
    
  } catch (error) {
    console.log(`💥 Erro ao verificar banco: ${error.message}`);
    return null;
  }
}

// Cenários de teste variados
const testScenarios = [
  {
    name: "TESTE_1_CLIENTE_REAL",
    description: "Cliente real completando quiz pela primeira vez",
    responses: [
      { question: "Pergunta 1", answer: "Opção A" },
      { question: "Pergunta 2", answer: "Sim, muito interessado" }
    ],
    leadData: {
      email: "cliente.real@gmail.com",
      nome: "Maria Silva",
      telefone: "11999887766"
    },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
    timeSpent: 145
  },
  {
    name: "TESTE_2_LEAD_QUALIFICADO",
    description: "Lead qualificado com interesse alto",
    responses: [
      { question: "Nível de interesse", answer: "Muito alto" },
      { question: "Orçamento disponível", answer: "R$ 5.000+" }
    ],
    leadData: {
      email: "lead.qualificado@hotmail.com",
      nome: "João Santos",
      empresa: "Tech Solutions Ltda"
    },
    timeSpent: 89
  },
  {
    name: "TESTE_3_MOBILE_PWA",
    description: "Usuário mobile usando PWA instalado",
    responses: [
      { question: "Como nos conheceu?", answer: "Redes sociais" },
      { question: "Interesse em comprar?", answer: "Sim, em breve" }
    ],
    leadData: {
      email: "mobile.user@outlook.com",
      nome: "Ana Costa"
    },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    timeSpent: 203
  }
];

async function runAllTests() {
  console.log(`🚀 INICIANDO MONITORAMENTO COMPLETO DO QUIZ '${QUIZ_ID}'\n`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  
  // Verificações iniciais
  const quiz = checkQuizInDatabase();
  if (!quiz) {
    console.log(`\n❌ ERRO CRÍTICO: Quiz '${QUIZ_ID}' não existe. Criação necessária.`);
    return;
  }
  
  checkPushSubscriptions();
  
  console.log(`\n🧪 EXECUTANDO ${testScenarios.length} CENÁRIOS DE TESTE:\n`);
  
  let successCount = 0;
  let totalTime = 0;
  
  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`\n${'='.repeat(60)}`);
    
    const result = await makeQuizSubmission(scenario);
    
    if (result.success) {
      successCount++;
      totalTime += result.responseTime;
    }
    
    // Aguardar um pouco entre testes
    if (i < testScenarios.length - 1) {
      console.log(`\n⏳ Aguardando 3 segundos antes do próximo teste...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // Relatório final
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 RELATÓRIO FINAL:`);
  console.log(`✅ Sucessos: ${successCount}/${testScenarios.length}`);
  console.log(`⏱️ Tempo médio: ${totalTime / successCount}ms`);
  console.log(`📈 Taxa de sucesso: ${(successCount / testScenarios.length * 100).toFixed(1)}%`);
  
  if (successCount > 0) {
    console.log(`\n🎯 PUSH NOTIFICATIONS: Verifique se ${successCount} notificações foram enviadas!`);
    console.log(`📱 Instruções: Vá para o iPhone e verifique se as notificações apareceram na tela de bloqueio`);
  }
  
  console.log(`\n✅ MONITORAMENTO COMPLETO FINALIZADO`);
}

// Executar
runAllTests().catch(console.error);