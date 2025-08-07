#!/usr/bin/env node

/**
 * CRIAR 100 LEADS ULTRA DIRETO
 * Versão otimizada para criação máxima de leads
 * Data: 22/07/2025
 */

const BASE_URL = 'http://localhost:5000';
let token = '';

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
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
  try {
    const response = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123'
      })
    });
    token = response.token;
    console.log('✅ Login realizado');
    return true;
  } catch (error) {
    console.error('❌ Falha no login:', error.message);
    return false;
  }
}

// Dados ultra variados
const OBJETIVOS = [
  "Emagrecer", "Ganhar Massa Muscular", "Definir o Corpo", 
  "Manter o Peso", "Melhorar Condicionamento", "Reabilitação",
  "Aumentar Força", "Melhorar Flexibilidade", "Reduzir Estresse",
  "Tonificar", "Queimar Gordura", "Ganhar Resistência"
];

const EXPERIENCIAS = [
  "Iniciante", "Intermediário", "Avançado", "Profissional", 
  "Nunca Pratiquei", "Retornando após pausa", "Atleta amador",
  "Recreativo", "Competitivo"
];

const TEMPOS = [
  "15-30 minutos", "30-45 minutos", "45-60 minutos", 
  "1-2 horas", "Mais de 2 horas", "Varia conforme o dia", 
  "Fins de semana apenas", "Manhãs", "Noites", "Almoços"
];

const LOCAIS = [
  "Casa", "Academia", "Parque/Ar Livre", "Online", 
  "Não tenho preferência", "Estúdio especializado", 
  "Condomínio", "Trabalho", "Clube", "Quadra"
];

const EXERCICIOS = [
  "Musculação", "Cardio", "Yoga", "Pilates", "CrossFit", 
  "Dança", "Natação", "Artes marciais", "Funcional", 
  "Caminhada", "Corrida", "Ciclismo", "Alongamento"
];

const DIFICULDADES = [
  "Falta de Tempo", "Falta de Motivação", "Não sei por onde começar", 
  "Falta de Equipamentos", "Lesões/Limitações", "Custo elevado", 
  "Falta de companhia", "Timidez", "Rotina irregular", "Preguiça",
  "Clima", "Distância", "Horários incompatíveis"
];

const IDADES = [
  "18-25 anos", "26-35 anos", "36-45 anos", 
  "46-55 anos", "Acima de 55 anos", "16-17 anos"
];

const INVESTIMENTOS = [
  "Até R$ 100", "R$ 100-300", "R$ 300-500", 
  "R$ 500-1000", "Acima de R$ 1000", "R$ 50-100", "Não invisto"
];

const MOTIVACOES = [
  "Saúde", "Estética", "Performance", "Bem-estar mental", 
  "Longevidade", "Autoestima", "Competição", "Qualidade de vida",
  "Prevenção de doenças", "Socialização"
];

const HORARIOS = [
  "Manhã (6h-9h)", "Meio da manhã (9h-12h)", "Almoço (12h-14h)",
  "Tarde (14h-18h)", "Noite (18h-21h)", "Madrugada (21h-6h)", "Flexível"
];

const NOMES = [
  'Ana Silva', 'Carlos Santos', 'Maria Oliveira', 'João Pereira', 'Fernanda Costa',
  'Roberto Lima', 'Lucia Ferreira', 'Pedro Alves', 'Juliana Rodrigues', 'Ricardo Gomes',
  'Amanda Martins', 'Felipe Araújo', 'Camila Melo', 'Rodrigo Barbosa', 'Beatriz Ribeiro',
  'Thiago Cardoso', 'Gabriela Castro', 'Bruno Nascimento', 'Larissa Moreira', 'Diego Campos',
  'Mariana Dias', 'Gabriel Monteiro', 'Natália Mendes', 'Lucas Freitas', 'Rafaela Teixeira',
  'Mateus Carvalho', 'Vanessa Ramos', 'Leandro Nunes', 'Priscila Sousa', 'André Vieira',
  'Caroline Correia', 'Guilherme Machado', 'Patrícia Lopes', 'Marcelo Pinto', 'Cristiane Fernandes',
  'Fabio Reis', 'Tatiana Soares', 'Rafael Cavalcanti', 'Adriana Miranda', 'Daniel Azevedo',
  'Renata Barros', 'Vinicius Rocha', 'Monica Almeida', 'Alessandro Costa', 'Simone Pereira',
  'Henrique Santos', 'Carla Oliveira', 'Gustavo Silva', 'Silvia Lima', 'Mauricio Ferreira',
  'Sandra Alves', 'Claudio Rodrigues', 'Eliane Gomes', 'Sergio Martins', 'Regina Araújo',
  'Paulo Melo', 'Denise Barbosa', 'Edson Ribeiro', 'Rosana Cardoso', 'Marcos Castro',
  'Viviane Nascimento', 'Roberto Moreira', 'Sonia Campos', 'José Dias', 'Carmen Monteiro',
  'Antonio Mendes', 'Helena Freitas', 'Francisco Teixeira', 'Vera Carvalho', 'Luiz Ramos',
  'Teresa Nunes', 'Eduardo Sousa', 'Cristina Vieira', 'Renato Correia', 'Marta Machado',
  'Sebastião Lopes', 'Conceição Pinto', 'João Fernandes', 'Francisca Reis', 'Miguel Soares',
  'Antonia Cavalcanti', 'Raimundo Miranda', 'Joana Azevedo', 'Manoel Barros', 'Rosa Rocha',
  'Domingos Almeida', 'Terezinha Costa', 'Benedito Pereira', 'Aparecida Santos', 'Geraldo Oliveira',
  'Marlene Silva', 'Joaquim Lima', 'Edna Ferreira', 'Osvaldo Alves', 'Neusa Rodrigues',
  'Waldemar Gomes', 'Zilda Martins', 'Arlindo Araújo', 'Solange Melo', 'Expedito Barbosa'
];

function gerarDadosLead() {
  const nome = NOMES[Math.floor(Math.random() * NOMES.length)];
  const email = `${nome.toLowerCase().replace(/\s+/g, '.')}${Math.floor(Math.random() * 999)}@email.com`;
  const telefone = `(11) ${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 9000) + 1000}`;

  return {
    nome,
    email,
    telefone,
    respostas: {
      p1_objetivo_principal: OBJETIVOS[Math.floor(Math.random() * OBJETIVOS.length)],
      p2_nivel_experiencia: EXPERIENCIAS[Math.floor(Math.random() * EXPERIENCIAS.length)],
      p3_disponibilidade_tempo: TEMPOS[Math.floor(Math.random() * TEMPOS.length)],
      p4_local_treino: LOCAIS[Math.floor(Math.random() * LOCAIS.length)],
      p5_tipo_exercicio: EXERCICIOS[Math.floor(Math.random() * EXERCICIOS.length)],
      p6_maior_dificuldade: DIFICULDADES[Math.floor(Math.random() * DIFICULDADES.length)],
      p7_idade_faixa: IDADES[Math.floor(Math.random() * IDADES.length)],
      p8_investimento_mensal: INVESTIMENTOS[Math.floor(Math.random() * INVESTIMENTOS.length)],
      p9_motivacao_principal: MOTIVACOES[Math.floor(Math.random() * MOTIVACOES.length)],
      p10_horario_preferido: HORARIOS[Math.floor(Math.random() * HORARIOS.length)]
    }
  };
}

async function criarLeads(quizId, quantidade = 100) {
  console.log(`🎯 Criando ${quantidade} leads ultra variados para quiz ${quizId}...`);
  
  const distribuicaoObjetivos = {};
  const batchSize = 5;
  let sucessos = 0;
  
  for (let i = 0; i < quantidade; i += batchSize) {
    const promises = [];
    const currentBatchSize = Math.min(batchSize, quantidade - i);
    
    for (let j = 0; j < currentBatchSize; j++) {
      const lead = gerarDadosLead();
      
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
        timeSpent: Math.floor(Math.random() * 600) + 180
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
    
    // Pausa entre lotes
    if (i + batchSize < quantidade) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`\n🎉 Criação concluída: ${sucessos}/${quantidade} leads`);
  
  // Análise da distribuição
  console.log('\n📊 DISTRIBUIÇÃO p1_objetivo_principal:');
  const sorted = Object.entries(distribuicaoObjetivos)
    .sort(([,a], [,b]) => b - a);
    
  sorted.forEach(([objetivo, count], index) => {
    const percentage = ((count / sucessos) * 100).toFixed(1);
    console.log(`   ${index + 1}. "${objetivo}": ${count} leads (${percentage}%)`);
  });
  
  return { sucessos, distribuicaoObjetivos };
}

async function main() {
  console.log('🚀 CRIANDO 100 LEADS ULTRA VARIADOS');
  console.log('='.repeat(60));
  
  const loginOk = await login();
  if (!loginOk) return;
  
  const quizId = 'RdAUwmQgTthxbZLA0HJWu';
  const quantidade = 100;
  
  console.log(`🆔 Quiz: ${quizId}`);
  console.log(`📊 Quantidade: ${quantidade} leads`);
  console.log(`🔥 Variações: ${OBJETIVOS.length} objetivos × ${EXPERIENCIAS.length} experiências`);
  
  const resultado = await criarLeads(quizId, quantidade);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL');
  console.log('='.repeat(60));
  console.log(`✅ Taxa de Sucesso: ${((resultado.sucessos/quantidade)*100).toFixed(1)}%`);
  console.log(`🎯 Total de campos únicos para Sistema Ultra:`);
  console.log(`   📌 p1_objetivo_principal: ${Object.keys(resultado.distribuicaoObjetivos).length} valores`);
  console.log(`   📌 p2_nivel_experiencia: ${EXPERIENCIAS.length} valores`);
  console.log(`   📌 p3_disponibilidade_tempo: ${TEMPOS.length} valores`);
  console.log(`   📌 p5_tipo_exercicio: ${EXERCICIOS.length} valores`);
  
  console.log('\n🔥 SISTEMA ULTRA PRONTO!');
  console.log('🎯 Acesse /campanhas-sms-advanced');
  console.log('⚡ Teste "Ultra específico" com segmentação ultra-granular');
}

if (require.main === module) {
  main().catch(console.error);
}