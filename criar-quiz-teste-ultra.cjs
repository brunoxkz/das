#!/usr/bin/env node

/**
 * CRIAÇÃO DE QUIZ DE TESTE PARA SISTEMA ULTRA
 * Cria quiz com 10 perguntas diferentes para testar sistema Ultra dinâmico
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

async function criarQuizTeste() {
  console.log('🎯 Criando quiz de teste para Sistema Ultra...');
  
  const quizData = {
    title: "Quiz Ultra Test - 10 Perguntas",
    description: "Quiz criado especificamente para testar o Sistema Ultra de segmentação granular",
    structure: {
      pages: [
        {
          id: "page-1",
          elements: [
            {
              id: "p1_objetivo_principal",
              type: "multiple_choice",
              question: "Qual é o seu objetivo principal?",
              options: ["Emagrecer", "Ganhar Massa Muscular", "Definir o Corpo", "Manter o Peso", "Melhorar Condicionamento"]
            }
          ]
        },
        {
          id: "page-2", 
          elements: [
            {
              id: "p2_nivel_experiencia",
              type: "multiple_choice",
              question: "Qual seu nível de experiência com exercícios?",
              options: ["Iniciante", "Intermediário", "Avançado", "Profissional", "Nunca Pratiquei"]
            }
          ]
        },
        {
          id: "page-3",
          elements: [
            {
              id: "p3_disponibilidade_tempo",
              type: "multiple_choice", 
              question: "Quanto tempo você tem disponível por dia?",
              options: ["15-30 minutos", "30-45 minutos", "45-60 minutos", "1-2 horas", "Mais de 2 horas"]
            }
          ]
        },
        {
          id: "page-4",
          elements: [
            {
              id: "p4_local_treino",
              type: "multiple_choice",
              question: "Onde você prefere treinar?",
              options: ["Casa", "Academia", "Parque/Ar Livre", "Online", "Não tenho preferência"]
            }
          ]
        },
        {
          id: "page-5",
          elements: [
            {
              id: "p5_tipo_exercicio",
              type: "multiple_choice",
              question: "Que tipo de exercício você mais gosta?",
              options: ["Musculação", "Cardio", "Yoga", "Pilates", "CrossFit", "Dança"]
            }
          ]
        },
        {
          id: "page-6",
          elements: [
            {
              id: "p6_maior_dificuldade",
              type: "multiple_choice",
              question: "Qual sua maior dificuldade?",
              options: ["Falta de Tempo", "Falta de Motivação", "Não sei por onde começar", "Falta de Equipamentos", "Lesões/Limitações"]
            }
          ]
        },
        {
          id: "page-7",
          elements: [
            {
              id: "p7_idade_faixa",
              type: "multiple_choice",
              question: "Em que faixa etária você se encontra?",
              options: ["18-25 anos", "26-35 anos", "36-45 anos", "46-55 anos", "Acima de 55 anos"]
            }
          ]
        },
        {
          id: "page-8",
          elements: [
            {
              id: "p8_investimento_mensal",
              type: "multiple_choice",
              question: "Quanto você investe mensalmente em saúde/fitness?",
              options: ["Até R$ 100", "R$ 100-300", "R$ 300-500", "R$ 500-1000", "Acima de R$ 1000"]
            }
          ]
        },
        {
          id: "page-9",
          elements: [
            {
              id: "nome_completo",
              type: "text",
              question: "Qual é o seu nome completo?",
              placeholder: "Digite seu nome completo"
            }
          ]
        },
        {
          id: "page-10",
          elements: [
            {
              id: "email_contato",
              type: "email",
              question: "Qual é o seu melhor email?",
              placeholder: "seu@email.com"
            },
            {
              id: "telefone_whatsapp", 
              type: "text",
              question: "Qual é o seu WhatsApp?",
              placeholder: "(11) 99999-9999"
            }
          ]
        }
      ],
      settings: {
        theme: "fitness",
        collectLeads: true,
        resultTitle: "Obrigado por participar!",
        resultMessage: "Suas respostas foram registradas com sucesso."
      }
    }
  };

  try {
    const response = await makeRequest(`${BASE_URL}/api/quizzes`, {
      method: 'POST',
      body: JSON.stringify(quizData)
    });

    console.log('✅ Quiz criado com sucesso!');
    console.log(`🆔 ID do Quiz: ${response.id}`);
    console.log(`🔗 URL: ${BASE_URL}/quiz/${response.id}`);
    
    return response.id;
  } catch (error) {
    console.error('❌ Erro ao criar quiz:', error.message);
    return null;
  }
}

async function simularLeads(quizId) {
  console.log(`\n🎭 Simulando leads para quiz ${quizId}...`);
  
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
    }
  ];

  let sucessos = 0;
  
  for (const lead of leadsData) {
    try {
      const submissionData = {
        responses: {
          nome_completo: lead.nome,
          email_contato: lead.email,
          telefone_whatsapp: lead.telefone,
          ...lead.respostas
        },
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
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Erro ao simular lead ${lead.nome}:`, error.message);
    }
  }
  
  console.log(`\n🎯 Simulação concluída: ${sucessos}/${leadsData.length} leads criados com sucesso`);
  return sucessos;
}

async function main() {
  console.log('🚀 INICIANDO CRIAÇÃO DE QUIZ PARA TESTE ULTRA');
  console.log('=' .repeat(60));
  
  const loginOk = await login();
  if (!loginOk) {
    console.log('❌ FALHA: Não foi possível fazer login');
    return;
  }
  
  const quizId = await criarQuizTeste();
  if (!quizId) {
    console.log('❌ FALHA: Não foi possível criar o quiz');
    return;
  }
  
  // Aguardar um pouco antes de simular leads
  console.log('\n⏳ Aguardando 2 segundos antes de simular leads...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const leadsSimulados = await simularLeads(quizId);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL');
  console.log('='.repeat(60));
  console.log(`🆔 Quiz ID: ${quizId}`);
  console.log(`🔗 URL do Quiz: ${BASE_URL}/quiz/${quizId}`);
  console.log(`👥 Leads Simulados: ${leadsSimulados}`);
  console.log(`🎯 Campo Teste Principal: p1_objetivo_principal`);
  console.log(`📋 Respostas Disponíveis:`);
  console.log(`   - Emagrecer (3 leads)`);
  console.log(`   - Ganhar Massa Muscular (1 lead)`);
  console.log(`   - Definir o Corpo (1 lead)`);
  console.log(`   - Manter o Peso (1 lead)`);
  
  console.log('\n✅ QUIZ DE TESTE CRIADO E POPULADO COM SUCESSO!');
  console.log('🔥 Agora você pode testar o Sistema Ultra na interface!');
}

if (require.main === module) {
  main().catch(console.error);
}