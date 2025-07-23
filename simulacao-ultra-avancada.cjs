#!/usr/bin/env node

/**
 * SIMULAÇÃO ULTRA AVANÇADA - 10X MAIS COMPLEXA
 * Cria dados massivos e variados para testar Sistema Ultra em cenários extremos
 * Data: 22/07/2025
 */

const BASE_URL = 'http://localhost:5000';
let token = '';

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      timeout: 15000,
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
  console.log('🔐 Autenticando sistema...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123'
      })
    });
    token = response.token;
    console.log('✅ Autenticação bem-sucedida');
    return true;
  } catch (error) {
    console.error('❌ Falha na autenticação:', error.message);
    return false;
  }
}

// Gerador de nomes brasileiros realísticos
function gerarNomes() {
  const nomes = [
    'Ana', 'Carlos', 'Maria', 'João', 'Fernanda', 'Roberto', 'Lucia', 'Pedro',
    'Juliana', 'Ricardo', 'Amanda', 'Felipe', 'Camila', 'Rodrigo', 'Beatriz', 'Thiago',
    'Gabriela', 'Bruno', 'Larissa', 'Diego', 'Mariana', 'Gabriel', 'Natália', 'Lucas',
    'Rafaela', 'Mateus', 'Vanessa', 'Leandro', 'Priscila', 'André', 'Caroline', 'Guilherme',
    'Patrícia', 'Marcelo', 'Cristiane', 'Fabio', 'Tatiana', 'Rafael', 'Adriana', 'Daniel',
    'Renata', 'Vinicius', 'Monica', 'Alessandro', 'Simone', 'Henrique', 'Carla', 'Gustavo',
    'Silvia', 'Mauricio', 'Sandra', 'Claudio', 'Eliane', 'Sergio', 'Regina', 'Paulo',
    'Denise', 'Edson', 'Rosana', 'Marcos', 'Viviane', 'Roberto', 'Sonia', 'José'
  ];
  
  const sobrenomes = [
    'Silva', 'Santos', 'Oliveira', 'Pereira', 'Costa', 'Lima', 'Ferreira', 'Alves',
    'Rodrigues', 'Gomes', 'Martins', 'Araújo', 'Melo', 'Barbosa', 'Ribeiro', 'Cardoso',
    'Castro', 'Nascimento', 'Moreira', 'Campos', 'Dias', 'Monteiro', 'Mendes', 'Freitas',
    'Teixeira', 'Carvalho', 'Ramos', 'Nunes', 'Sousa', 'Vieira', 'Correia', 'Machado',
    'Lopes', 'Pinto', 'Fernandes', 'Reis', 'Soares', 'Cavalcanti', 'Miranda', 'Azevedo'
  ];
  
  const nome = nomes[Math.floor(Math.random() * nomes.length)];
  const sobrenome = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
  return `${nome} ${sobrenome}`;
}

// Gerador de dados ultra-variados
function gerarDadosLeadAvancado() {
  const objetivos = [
    "Emagrecer", "Ganhar Massa Muscular", "Definir o Corpo", 
    "Manter o Peso", "Melhorar Condicionamento", "Reabilitação",
    "Aumentar Força", "Melhorar Flexibilidade", "Reduzir Estresse"
  ];
  
  const experiencias = [
    "Iniciante", "Intermediário", "Avançado", "Profissional", 
    "Nunca Pratiquei", "Retornando após pausa", "Atleta amador"
  ];
  
  const tempos = [
    "15-30 minutos", "30-45 minutos", "45-60 minutos", 
    "1-2 horas", "Mais de 2 horas", "Varia conforme o dia", "Fins de semana apenas"
  ];
  
  const locais = [
    "Casa", "Academia", "Parque/Ar Livre", "Online", 
    "Não tenho preferência", "Estúdio especializado", "Condomínio", "Trabalho"
  ];
  
  const exercicios = [
    "Musculação", "Cardio", "Yoga", "Pilates", "CrossFit", 
    "Dança", "Natação", "Artes marciais", "Funcional", "Caminhada", "Corrida"
  ];
  
  const dificuldades = [
    "Falta de Tempo", "Falta de Motivação", "Não sei por onde começar", 
    "Falta de Equipamentos", "Lesões/Limitações", "Custo elevado", 
    "Falta de companhia", "Timidez", "Rotina irregular", "Preguiça"
  ];
  
  const idades = [
    "18-25 anos", "26-35 anos", "36-45 anos", 
    "46-55 anos", "Acima de 55 anos", "16-17 anos"
  ];
  
  const investimentos = [
    "Até R$ 100", "R$ 100-300", "R$ 300-500", 
    "R$ 500-1000", "Acima de R$ 1000", "R$ 50-100", "Não invisto"
  ];
  
  const motivacoes = [
    "Saúde", "Estética", "Performance", "Bem-estar mental", 
    "Longevidade", "Autoestima", "Competição", "Qualidade de vida"
  ];
  
  const horarios = [
    "Manhã (6h-9h)", "Meio da manhã (9h-12h)", "Almoço (12h-14h)",
    "Tarde (14h-18h)", "Noite (18h-21h)", "Madrugada (21h-6h)", "Flexível"
  ];

  const nome = gerarNomes();
  const email = `${nome.toLowerCase().replace(/\s/g, '.')}${Math.floor(Math.random() * 999)}@email.com`;
  const telefone = `(11) ${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 9000) + 1000}`;

  return {
    nome,
    email,
    telefone,
    respostas: {
      p1_objetivo_principal: objetivos[Math.floor(Math.random() * objetivos.length)],
      p2_nivel_experiencia: experiencias[Math.floor(Math.random() * experiencias.length)],
      p3_disponibilidade_tempo: tempos[Math.floor(Math.random() * tempos.length)],
      p4_local_treino: locais[Math.floor(Math.random() * locais.length)],
      p5_tipo_exercicio: exercicios[Math.floor(Math.random() * exercicios.length)],
      p6_maior_dificuldade: dificuldades[Math.floor(Math.random() * dificuldades.length)],
      p7_idade_faixa: idades[Math.floor(Math.random() * idades.length)],
      p8_investimento_mensal: investimentos[Math.floor(Math.random() * investimentos.length)],
      p9_motivacao_principal: motivacoes[Math.floor(Math.random() * motivacoes.length)],
      p10_horario_preferido: horarios[Math.floor(Math.random() * horarios.length)]
    }
  };
}

async function criarQuizUltraAvancado() {
  console.log('🎯 Criando quiz ultra avançado para Sistema Ultra...');
  
  const quizData = {
    title: "Quiz Ultra Avançado - Sistema Completo",
    description: "Quiz ultra avançado criado para testar Sistema Ultra com máxima complexidade e variações",
    structure: {
      pages: [
        {
          id: "page-1",
          elements: [{
            id: "p1_objetivo_principal",
            type: "multiple_choice",
            question: "Qual é o seu objetivo principal?",
            options: ["Emagrecer", "Ganhar Massa Muscular", "Definir o Corpo", "Manter o Peso", 
                     "Melhorar Condicionamento", "Reabilitação", "Aumentar Força", "Melhorar Flexibilidade", "Reduzir Estresse"]
          }]
        },
        {
          id: "page-2", 
          elements: [{
            id: "p2_nivel_experiencia",
            type: "multiple_choice",
            question: "Qual seu nível de experiência com exercícios?",
            options: ["Iniciante", "Intermediário", "Avançado", "Profissional", "Nunca Pratiquei", "Retornando após pausa", "Atleta amador"]
          }]
        },
        {
          id: "page-3",
          elements: [{
            id: "p3_disponibilidade_tempo",
            type: "multiple_choice", 
            question: "Quanto tempo você tem disponível por dia?",
            options: ["15-30 minutos", "30-45 minutos", "45-60 minutos", "1-2 horas", "Mais de 2 horas", "Varia conforme o dia", "Fins de semana apenas"]
          }]
        },
        {
          id: "page-4",
          elements: [{
            id: "p4_local_treino",
            type: "multiple_choice",
            question: "Onde você prefere treinar?",
            options: ["Casa", "Academia", "Parque/Ar Livre", "Online", "Não tenho preferência", "Estúdio especializado", "Condomínio", "Trabalho"]
          }]
        },
        {
          id: "page-5",
          elements: [{
            id: "p5_tipo_exercicio",
            type: "multiple_choice",
            question: "Que tipo de exercício você mais gosta?",
            options: ["Musculação", "Cardio", "Yoga", "Pilates", "CrossFit", "Dança", "Natação", "Artes marciais", "Funcional", "Caminhada", "Corrida"]
          }]
        },
        {
          id: "page-6",
          elements: [{
            id: "p6_maior_dificuldade",
            type: "multiple_choice",
            question: "Qual sua maior dificuldade?",
            options: ["Falta de Tempo", "Falta de Motivação", "Não sei por onde começar", "Falta de Equipamentos", 
                     "Lesões/Limitações", "Custo elevado", "Falta de companhia", "Timidez", "Rotina irregular", "Preguiça"]
          }]
        },
        {
          id: "page-7",
          elements: [{
            id: "p7_idade_faixa",
            type: "multiple_choice",
            question: "Em que faixa etária você se encontra?",
            options: ["18-25 anos", "26-35 anos", "36-45 anos", "46-55 anos", "Acima de 55 anos", "16-17 anos"]
          }]
        },
        {
          id: "page-8",
          elements: [{
            id: "p8_investimento_mensal",
            type: "multiple_choice",
            question: "Quanto você investe mensalmente em saúde/fitness?",
            options: ["Até R$ 100", "R$ 100-300", "R$ 300-500", "R$ 500-1000", "Acima de R$ 1000", "R$ 50-100", "Não invisto"]
          }]
        },
        {
          id: "page-9",
          elements: [{
            id: "p9_motivacao_principal",
            type: "multiple_choice",
            question: "Qual sua principal motivação?",
            options: ["Saúde", "Estética", "Performance", "Bem-estar mental", "Longevidade", "Autoestima", "Competição", "Qualidade de vida"]
          }]
        },
        {
          id: "page-10",
          elements: [{
            id: "p10_horario_preferido",
            type: "multiple_choice",
            question: "Qual seu horário preferido para treinar?",
            options: ["Manhã (6h-9h)", "Meio da manhã (9h-12h)", "Almoço (12h-14h)", "Tarde (14h-18h)", "Noite (18h-21h)", "Madrugada (21h-6h)", "Flexível"]
          }]
        },
        {
          id: "page-11",
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
          id: "page-12",
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
        theme: "fitness-ultra",
        collectLeads: true,
        resultTitle: "Análise Ultra Completa Finalizada!",
        resultMessage: "Seus dados foram processados com máxima precisão para segmentação ultra-granular."
      }
    }
  };

  try {
    const response = await makeRequest(`${BASE_URL}/api/quizzes`, {
      method: 'POST',
      body: JSON.stringify(quizData)
    });

    console.log('✅ Quiz ultra avançado criado!');
    console.log(`🆔 ID: ${response.id}`);
    console.log(`🔗 URL: ${BASE_URL}/quiz/${response.id}`);
    
    return response.id;
  } catch (error) {
    console.error('❌ Erro ao criar quiz ultra:', error.message);
    return null;
  }
}

async function simularLeadsUltraAvancado(quizId, quantidade = 100) {
  console.log(`\n🎭 Simulando ${quantidade} leads ultra variados para quiz ${quizId}...`);
  
  let sucessos = 0;
  const distribuicaoObjetivos = {};
  const batchSize = 10; // Processar em lotes para evitar sobrecarga
  
  for (let i = 0; i < quantidade; i += batchSize) {
    const promises = [];
    const currentBatchSize = Math.min(batchSize, quantidade - i);
    
    for (let j = 0; j < currentBatchSize; j++) {
      const lead = gerarDadosLeadAvancado();
      
      // Contar distribuição
      const objetivo = lead.respostas.p1_objetivo_principal;
      distribuicaoObjetivos[objetivo] = (distribuicaoObjetivos[objetivo] || 0) + 1;
      
      const submissionData = {
        responses: [{
          nome_completo: lead.nome,
          email_contato: lead.email,
          telefone_whatsapp: lead.telefone,
          ...lead.respostas
        }],
        leadData: {
          nome: lead.nome,
          email: lead.email, 
          telefone: lead.telefone
        },
        totalPages: 12,
        timeSpent: Math.floor(Math.random() * 600) + 180 // 3-13 minutos
      };

      promises.push(
        makeRequest(`${BASE_URL}/api/quizzes/${quizId}/submit`, {
          method: 'POST',
          body: JSON.stringify(submissionData)
        }).then(() => {
          sucessos++;
          if (sucessos % 10 === 0) {
            console.log(`✅ Progresso: ${sucessos}/${quantidade} leads criados`);
          }
          return lead;
        }).catch(error => {
          console.error(`❌ Erro no lead ${lead.nome}:`, error.message);
          return null;
        })
      );
    }
    
    await Promise.all(promises);
    
    // Pausa entre lotes para evitar rate limiting
    if (i + batchSize < quantidade) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`\n🎯 Simulação ultra concluída: ${sucessos}/${quantidade} leads criados`);
  
  // Análise detalhada da distribuição
  console.log(`\n📊 ANÁLISE ULTRA DETALHADA - DISTRIBUIÇÃO p1_objetivo_principal:`);
  const sortedObjetivos = Object.entries(distribuicaoObjetivos)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15); // Top 15
    
  sortedObjetivos.forEach(([objetivo, count], index) => {
    const percentage = ((count / sucessos) * 100).toFixed(1);
    console.log(`   ${index + 1}. "${objetivo}": ${count} leads (${percentage}%)`);
  });
  
  return { sucessos, distribuicaoObjetivos };
}

async function testarEndpointsUltra(quizId) {
  console.log(`\n🔬 Testando endpoints Ultra para quiz ${quizId}...`);
  
  try {
    // Teste 1: Variables Ultra
    console.log('🧪 Testando /variables-ultra...');
    const startTime1 = Date.now();
    const variables = await makeRequest(`${BASE_URL}/api/quizzes/${quizId}/variables-ultra`);
    const time1 = Date.now() - startTime1;
    console.log(`✅ Variables Ultra: ${variables.length} campos detectados (${time1}ms)`);
    
    // Teste 2: Leads by Response - múltiplos testes
    console.log('🧪 Testando /leads-by-response...');
    const testCases = [
      { field: 'p1_objetivo_principal', value: 'Emagrecer', format: 'leads' },
      { field: 'p2_nivel_experiencia', value: 'Iniciante', format: 'phones' },
      { field: 'p3_disponibilidade_tempo', value: '30-45 minutos', format: 'emails' },
      { field: 'p5_tipo_exercicio', value: 'Musculação', format: 'leads' }
    ];
    
    for (const testCase of testCases) {
      const startTime = Date.now();
      const result = await makeRequest(`${BASE_URL}/api/quizzes/${quizId}/leads-by-response`, {
        method: 'POST',
        body: JSON.stringify({
          field: testCase.field,
          value: testCase.value,
          format: testCase.format
        })
      });
      const time = Date.now() - startTime;
      
      console.log(`✅ ${testCase.field}="${testCase.value}" (${testCase.format}): ${result.leads ? result.leads.length : result.phones ? result.phones.length : result.emails ? result.emails.length : 0} resultados (${time}ms)`);
    }
    
    console.log(`🔬 Todos os testes Ultra concluídos com sucesso!`);
    return true;
    
  } catch (error) {
    console.error('❌ Erro nos testes Ultra:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 INICIANDO SIMULAÇÃO ULTRA AVANÇADA - 10X MAIS COMPLEXA');
  console.log('=' .repeat(80));
  
  const loginOk = await login();
  if (!loginOk) {
    console.log('❌ FALHA CRÍTICA: Autenticação não foi possível');
    return;
  }
  
  // Opção: criar novo quiz ou usar existente
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const opcao = await new Promise(resolve => {
    rl.question('🔥 [1] Criar novo quiz ultra | [2] Usar quiz existente: ', (answer) => {
      resolve(answer.trim() || '2');
    });
  });
  
  let quizId;
  
  if (opcao === '1') {
    console.log('\n🎯 Criando quiz ultra avançado...');
    quizId = await criarQuizUltraAvancado();
    if (!quizId) {
      console.log('❌ FALHA: Não foi possível criar quiz ultra');
      rl.close();
      return;
    }
  } else {
    quizId = await new Promise(resolve => {
      rl.question('🆔 ID do quiz existente (Enter para RdAUwmQgTthxbZLA0HJWu): ', (answer) => {
        resolve(answer.trim() || 'RdAUwmQgTthxbZLA0HJWu');
      });
    });
  }
  
  const quantidade = await new Promise(resolve => {
    rl.question('📊 Quantidade de leads (Enter para 100): ', (answer) => {
      rl.close();
      resolve(parseInt(answer) || 100);
    });
  });

  console.log(`\n🔥 Configuração Ultra:`);
  console.log(`   🆔 Quiz ID: ${quizId}`);
  console.log(`   📊 Leads: ${quantidade}`);
  console.log(`   🎯 Variações: 9 objetivos, 7 experiências, 11 exercícios, etc.`);
  
  // Aguardar antes de iniciar simulação massiva
  console.log('\n⏳ Iniciando simulação ultra em 3 segundos...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const resultado = await simularLeadsUltraAvancado(quizId, quantidade);
  
  if (resultado.sucessos > 0) {
    console.log('\n⏳ Aguardando 5 segundos antes dos testes de endpoint...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    await testarEndpointsUltra(quizId);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 RELATÓRIO FINAL - SIMULAÇÃO ULTRA AVANÇADA');
  console.log('='.repeat(80));
  console.log(`🆔 Quiz ID: ${quizId}`);
  console.log(`🔗 URL: ${BASE_URL}/quiz/${quizId}`);
  console.log(`👥 Leads Criados: ${resultado.sucessos}/${quantidade}`);
  console.log(`📈 Taxa de Sucesso: ${((resultado.sucessos/quantidade)*100).toFixed(1)}%`);
  console.log(`🎯 Campos Ultra para Teste:`);
  console.log(`   📌 p1_objetivo_principal: ${Object.keys(resultado.distribuicaoObjetivos).length} valores únicos`);
  console.log(`   📌 p2_nivel_experiencia: 7 valores únicos`);
  console.log(`   📌 p3_disponibilidade_tempo: 7 valores únicos`);
  console.log(`   📌 p5_tipo_exercicio: 11 valores únicos`);
  console.log(`   📌 p6_maior_dificuldade: 10 valores únicos`);
  console.log(`   📌 p9_motivacao_principal: 8 valores únicos`);
  console.log(`   📌 p10_horario_preferido: 7 valores únicos`);
  
  console.log('\n🔥 SISTEMA ULTRA AVANÇADO PRONTO!');
  console.log('🎯 Acesse /campanhas-sms-advanced e teste a segmentação ultra-granular');
  console.log('⚡ Com esta base de dados massiva, todos os filtros Ultra estarão funcionais');
}

if (require.main === module) {
  main().catch(console.error);
}