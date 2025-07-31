#!/usr/bin/env node

const fetch = require('node-fetch');
const BASE_URL = 'http://localhost:5000';

async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    method: 'GET',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText} - ${await response.text()}`);
  }

  return await response.json();
}

async function main() {
  console.log('🚀 CRIANDO QUIZ ULTRA COMPLETO + 50 LEADS');
  console.log('='.repeat(60));

  try {
    // Login
    console.log('🔐 Fazendo login admin...');
    const loginData = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123'
      })
    });

    if (!loginData.token && !loginData.accessToken) {
      console.log('Response:', JSON.stringify(loginData, null, 2));
      throw new Error('Login failed: no token');
    }
    
    const token = loginData.token || loginData.accessToken;
    
    console.log('✅ Login success');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Criar quiz
    console.log('\n📝 Criando quiz ultra fitness...');
    const quizData = {
      title: 'Quiz Ultra Fitness - Sistema 10x Avançado',
      description: 'Quiz para segmentação ultra-granular de leads',
      elements: [
        {
          id: 'p1_objetivo_principal',
          type: 'multiple_choice',
          title: 'Qual seu objetivo principal?',
          options: [
            'Emagrecer', 'Ganhar Massa Muscular', 'Definir o Corpo',
            'Manter o Peso', 'Melhorar Condicionamento', 'Reduzir Estresse',
            'Aumentar Força', 'Melhorar Flexibilidade', 'Tonificar',
            'Queimar Gordura', 'Ganhar Resistência', 'Reabilitação'
          ],
          required: true
        },
        {
          id: 'p2_nivel_experiencia',
          type: 'multiple_choice',
          title: 'Qual seu nível de experiência?',
          options: [
            'Iniciante', 'Intermediário', 'Avançado', 'Profissional',
            'Nunca Pratiquei', 'Retornando após pausa', 'Atleta amador',
            'Recreativo', 'Competitivo'
          ],
          required: true
        },
        {
          id: 'nome_completo',
          type: 'text',
          title: 'Qual seu nome completo?',
          required: true
        },
        {
          id: 'email_contato',
          type: 'email',
          title: 'Qual seu email?',
          required: true
        },
        {
          id: 'telefone_whatsapp',
          type: 'phone',
          title: 'Qual seu WhatsApp?',
          required: true
        }
      ],
      settings: {
        allowMultipleSubmissions: true,
        collectLeadData: true
      },
      theme: {
        primaryColor: '#22c55e',
        backgroundColor: '#ffffff'
      }
    };

    const quizResponse = await makeRequest(`${BASE_URL}/api/quizzes`, {
      method: 'POST',
      headers,
      body: JSON.stringify(quizData)
    });

    const quizId = quizResponse.id;
    console.log(`✅ Quiz criado: ${quizId}`);

    // Dados para leads variados
    const OBJETIVOS = [
      "Emagrecer", "Ganhar Massa Muscular", "Definir o Corpo", 
      "Manter o Peso", "Melhorar Condicionamento", "Reduzir Estresse",
      "Aumentar Força", "Melhorar Flexibilidade", "Tonificar",
      "Queimar Gordura", "Ganhar Resistência", "Reabilitação"
    ];

    const EXPERIENCIAS = [
      "Iniciante", "Intermediário", "Avançado", "Profissional", 
      "Nunca Pratiquei", "Retornando após pausa", "Atleta amador",
      "Recreativo", "Competitivo"
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
      'Henrique Santos', 'Carla Oliveira', 'Paulo Gomes', 'Silvia Lima', 'Mauricio Ferreira'
    ];

    // Criar 50 leads variados
    console.log(`\n🎯 Criando 50 leads ultra variados...`);
    let sucessos = 0;
    const distribuicao = {};

    for (let i = 0; i < 50; i++) {
      const nome = NOMES[i % NOMES.length];
      const objetivo = OBJETIVOS[Math.floor(Math.random() * OBJETIVOS.length)];
      const experiencia = EXPERIENCIAS[Math.floor(Math.random() * EXPERIENCIAS.length)];
      
      distribuicao[objetivo] = (distribuicao[objetivo] || 0) + 1;

      const submissionData = {
        responses: {
          p1_objetivo_principal: objetivo,
          p2_nivel_experiencia: experiencia,
          nome_completo: nome,
          email_contato: `${nome.toLowerCase().replace(/\s+/g, '.')}${i}@email.com`,
          telefone_whatsapp: `(11) ${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 9000) + 1000}`
        },
        leadData: {
          nome: nome,
          email: `${nome.toLowerCase().replace(/\s+/g, '.')}${i}@email.com`,
          telefone: `(11) ${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 9000) + 1000}`
        },
        totalPages: 5,
        timeSpent: Math.floor(Math.random() * 300) + 60
      };

      try {
        await makeRequest(`${BASE_URL}/api/quizzes/${quizId}/submit`, {
          method: 'POST',
          headers,
          body: JSON.stringify(submissionData)
        });
        
        sucessos++;
        if (sucessos % 10 === 0) {
          console.log(`  ✅ Progresso: ${sucessos}/50 leads criados`);
        }
      } catch (error) {
        console.error(`  ❌ Erro lead ${i + 1}:`, error.message.substring(0, 100));
      }

      // Pequena pausa
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n🎉 CRIAÇÃO CONCLUÍDA: ${sucessos}/50 leads`);
    
    console.log('\n📊 DISTRIBUIÇÃO OBJETIVOS:');
    Object.entries(distribuicao)
      .sort(([,a], [,b]) => b - a)
      .forEach(([objetivo, count], index) => {
        const percentage = ((count / sucessos) * 100).toFixed(1);
        console.log(`   ${index + 1}. "${objetivo}": ${count} leads (${percentage}%)`);
      });

    console.log('\n' + '='.repeat(60));
    console.log('🔥 SISTEMA ULTRA COMPLETO E PRONTO!');
    console.log('='.repeat(60));
    console.log(`🆔 Quiz ID: ${quizId}`);
    console.log(`✅ Taxa de Sucesso: ${((sucessos/50)*100).toFixed(1)}%`);
    console.log(`🎯 Campos únicos para Sistema Ultra:`);
    console.log(`   📌 p1_objetivo_principal: ${Object.keys(distribuicao).length} valores`);
    console.log(`   📌 p2_nivel_experiencia: ${EXPERIENCIAS.length} valores`);
    
    console.log(`\n🧪 TESTE O SISTEMA ULTRA AGORA:`);
    console.log(`curl -s -H "Authorization: Bearer ${token}" \\`);
    console.log(`  "http://localhost:5000/api/quizzes/${quizId}/variables-ultra"`);
    
    console.log(`\n🎯 TESTE SEGMENTAÇÃO:`);
    console.log(`curl -s -X POST -H "Authorization: Bearer ${token}" \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"field":"p1_objetivo_principal","value":"Emagrecer","format":"leads"}' \\`);
    console.log(`  "http://localhost:5000/api/quizzes/${quizId}/leads-by-response"`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

main();