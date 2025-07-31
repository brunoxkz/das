#!/usr/bin/env node

/**
 * SIMULAÇÃO DE LEADS PARA QUIZ EXISTENTE
 * Adiciona leads simulados a um quiz já existente para testar Sistema Ultra
 * Data: 22/07/2025
 */

const BASE_URL = 'http://localhost:5000';
let token = '';

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      timeout: 10000,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Request failed:`, error.message);
    throw error;
  }
}

async function login() {
  console.log('🔐 Fazendo login...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123'
      })
    });
    token = response.token;
    console.log('✅ Login realizado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro no login:', error.message);
    return false;
  }
}

async function simularLeadsParaQuiz(quizId) {
  console.log(`\n🎭 Simulando leads variados para quiz ${quizId}...`);
  
  const leadsData = [
    {
      nome: "Ana Silva",
      email: "ana.silva@email.com", 
      telefone: "(11) 99999-0001",
      respostas: {
        p1_objetivo_principal: "Emagrecer",
        p2_nivel_experiencia: "Iniciante", 
        p3_disponibilidade_tempo: "30-45 minutos",
        p4_local_treino: "Casa",
        p5_tipo_exercicio: "Cardio",
        p6_maior_dificuldade: "Falta de Tempo",
        p7_idade_faixa: "26-35 anos",
        p8_investimento_mensal: "Até R$ 100"
      }
    },
    {
      nome: "Carlos Santos",
      email: "carlos@email.com",
      telefone: "(11) 99999-0002", 
      respostas: {
        p1_objetivo_principal: "Ganhar Massa Muscular",
        p2_nivel_experiencia: "Intermediário",
        p3_disponibilidade_tempo: "1-2 horas", 
        p4_local_treino: "Academia",
        p5_tipo_exercicio: "Musculação",
        p6_maior_dificuldade: "Falta de Motivação",
        p7_idade_faixa: "18-25 anos",
        p8_investimento_mensal: "R$ 300-500"
      }
    },
    {
      nome: "Maria Oliveira", 
      email: "maria.oliveira@email.com",
      telefone: "(11) 99999-0003",
      respostas: {
        p1_objetivo_principal: "Emagrecer",
        p2_nivel_experiencia: "Nunca Pratiquei",
        p3_disponibilidade_tempo: "15-30 minutos",
        p4_local_treino: "Casa", 
        p5_tipo_exercicio: "Yoga",
        p6_maior_dificuldade: "Não sei por onde começar",
        p7_idade_faixa: "36-45 anos",
        p8_investimento_mensal: "R$ 100-300"
      }
    },
    {
      nome: "João Pereira",
      email: "joao.pereira@email.com",
      telefone: "(11) 99999-0004",
      respostas: {
        p1_objetivo_principal: "Definir o Corpo",
        p2_nivel_experiencia: "Avançado",
        p3_disponibilidade_tempo: "45-60 minutos",
        p4_local_treino: "Academia",
        p5_tipo_exercicio: "CrossFit", 
        p6_maior_dificuldade: "Lesões/Limitações",
        p7_idade_faixa: "26-35 anos",
        p8_investimento_mensal: "R$ 500-1000"
      }
    },
    {
      nome: "Fernanda Costa",
      email: "fernanda@email.com",
      telefone: "(11) 99999-0005",
      respostas: {
        p1_objetivo_principal: "Emagrecer", 
        p2_nivel_experiencia: "Intermediário",
        p3_disponibilidade_tempo: "30-45 minutos",
        p4_local_treino: "Parque/Ar Livre",
        p5_tipo_exercicio: "Dança",
        p6_maior_dificuldade: "Falta de Motivação",
        p7_idade_faixa: "18-25 anos",
        p8_investimento_mensal: "R$ 100-300"
      }
    },
    {
      nome: "Roberto Lima",
      email: "roberto.lima@email.com", 
      telefone: "(11) 99999-0006",
      respostas: {
        p1_objetivo_principal: "Manter o Peso",
        p2_nivel_experiencia: "Profissional", 
        p3_disponibilidade_tempo: "Mais de 2 horas",
        p4_local_treino: "Academia",
        p5_tipo_exercicio: "Musculação",
        p6_maior_dificuldade: "Falta de Equipamentos",
        p7_idade_faixa: "46-55 anos", 
        p8_investimento_mensal: "Acima de R$ 1000"
      }
    },
    {
      nome: "Lucia Ferreira",
      email: "lucia@email.com",
      telefone: "(11) 99999-0007", 
      respostas: {
        p1_objetivo_principal: "Emagrecer",
        p2_nivel_experiencia: "Iniciante",
        p3_disponibilidade_tempo: "45-60 minutos",
        p4_local_treino: "Online", 
        p5_tipo_exercicio: "Pilates",
        p6_maior_dificuldade: "Falta de Tempo",
        p7_idade_faixa: "36-45 anos",
        p8_investimento_mensal: "R$ 300-500"
      }
    },
    {
      nome: "Pedro Alves",
      email: "pedro@email.com",
      telefone: "(11) 99999-0008",
      respostas: {
        p1_objetivo_principal: "Melhorar Condicionamento", 
        p2_nivel_experiencia: "Intermediário",
        p3_disponibilidade_tempo: "1-2 horas",
        p4_local_treino: "Parque/Ar Livre",
        p5_tipo_exercicio: "Cardio",
        p6_maior_dificuldade: "Falta de Motivação", 
        p7_idade_faixa: "18-25 anos",
        p8_investimento_mensal: "R$ 100-300"
      }
    }
  ];

  let sucessos = 0;
  
  for (const lead of leadsData) {
    try {
      const submissionData = {
        responses: [
          {
            nome_completo: lead.nome,
            email_contato: lead.email,
            telefone_whatsapp: lead.telefone,
            ...lead.respostas
          }
        ],
        leadData: {
          nome: lead.nome,
          email: lead.email, 
          telefone: lead.telefone
        },
        totalPages: 10,
        timeSpent: Math.floor(Math.random() * 300) + 120 // 2-7 minutos
      };

      await makeRequest(`${BASE_URL}/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify(submissionData)
      });

      console.log(`✅ Lead simulado: ${lead.nome} - ${lead.respostas.p1_objetivo_principal}`);
      sucessos++;
      
      // Delay entre submissões
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error(`❌ Erro ao simular lead ${lead.nome}:`, error.message);
    }
  }
  
  console.log(`\n🎯 Simulação concluída: ${sucessos}/${leadsData.length} leads criados`);
  
  // Mostrar distribuição das respostas
  console.log(`\n📊 DISTRIBUIÇÃO DAS RESPOSTAS p1_objetivo_principal:`);
  const distribuicao = {};
  leadsData.forEach(lead => {
    const objetivo = lead.respostas.p1_objetivo_principal;
    distribuicao[objetivo] = (distribuicao[objetivo] || 0) + 1;
  });
  
  Object.entries(distribuicao).forEach(([objetivo, count]) => {
    console.log(`   📌 "${objetivo}": ${count} leads`);
  });
  
  return sucessos;
}

async function main() {
  console.log('🚀 SIMULADOR DE LEADS PARA TESTE ULTRA');
  console.log('=' .repeat(60));
  
  // Pedir o ID do quiz
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const quizId = await new Promise(resolve => {
    rl.question('🆔 Digite o ID do quiz (ou Enter para usar RdAUwmQgTthxbZLA0HJWu): ', (answer) => {
      rl.close();
      resolve(answer.trim() || 'RdAUwmQgTthxbZLA0HJWu');
    });
  });

  console.log(`\n🎯 Usando quiz ID: ${quizId}`);
  
  const loginOk = await login();
  if (!loginOk) {
    console.log('❌ FALHA: Não foi possível fazer login');
    return;
  }
  
  const leadsSimulados = await simularLeadsParaQuiz(quizId);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL - LEADS SIMULADOS');
  console.log('='.repeat(60));
  console.log(`🆔 Quiz ID: ${quizId}`);
  console.log(`🔗 URL do Quiz: ${BASE_URL}/quiz/${quizId}`);
  console.log(`👥 Leads Adicionados: ${leadsSimulados}`);
  console.log(`🎯 Campo Principal de Teste: p1_objetivo_principal`);
  console.log(`📋 Valores disponíveis para filtrar:`);
  console.log(`   🔸 "Emagrecer" - leads focados em perda de peso`);
  console.log(`   🔸 "Ganhar Massa Muscular" - leads para hipertrofia`);
  console.log(`   🔸 "Definir o Corpo" - leads para definição muscular`);
  console.log(`   🔸 "Manter o Peso" - leads para manutenção`);
  console.log(`   🔸 "Melhorar Condicionamento" - leads para condicionamento físico`);
  
  console.log('\n✅ LEADS SIMULADOS COM SUCESSO!');
  console.log('🔥 Agora teste o Sistema Ultra na página SMS Campaigns Advanced!');
  console.log('📍 Acesse: /campanhas-sms-advanced');
  console.log('🎯 Selecione o tipo "Ultra específico" e teste o campo p1_objetivo_principal');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { simularLeadsParaQuiz };