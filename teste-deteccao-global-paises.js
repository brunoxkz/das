#!/usr/bin/env node
/**
 * 🌍 TESTE GLOBAL - DETECÇÃO DE PAÍSES MUNDIAL
 * Sistema agora suporta 50+ países com adaptação automática
 */

const API_BASE = 'http://localhost:5000';

// Lista de números de teste para diversos países
const numerosTestePaises = [
  // América do Norte
  { pais: 'Estados Unidos', numero: '15551234567', esperado: 'Hi' },
  { pais: 'Canadá', numero: '15141234567', esperado: 'Hello' },
  
  // América Latina
  { pais: 'Brasil', numero: '5511995133932', esperado: 'Olá' },
  { pais: 'Brasil (sem código)', numero: '11995133932', esperado: 'Olá' },
  { pais: 'Argentina', numero: '5491123456789', esperado: 'Hola' },
  { pais: 'México', numero: '521234567890', esperado: 'Hola' },
  { pais: 'Chile', numero: '56912345678', esperado: 'Hola' },
  { pais: 'Colômbia', numero: '573001234567', esperado: 'Hola' },
  
  // Europa
  { pais: 'Reino Unido', numero: '447911123456', esperado: 'Hello' },
  { pais: 'Alemanha', numero: '4915123456789', esperado: 'Hallo' },
  { pais: 'França', numero: '33612345678', esperado: 'Salut' },
  { pais: 'Itália', numero: '393001234567', esperado: 'Ciao' },
  { pais: 'Espanha', numero: '34612345678', esperado: 'Hola' },
  { pais: 'Portugal', numero: '351912345678', esperado: 'Olá' },
  { pais: 'Holanda', numero: '31612345678', esperado: 'Hallo' },
  { pais: 'Suíça', numero: '41791234567', esperado: 'Hallo' },
  
  // Ásia
  { pais: 'China', numero: '8613812345678', esperado: '你好' },
  { pais: 'Japão', numero: '819012345678', esperado: 'こんにちは' },
  { pais: 'Coreia do Sul', numero: '821012345678', esperado: '안녕하세요' },
  { pais: 'Índia', numero: '919876543210', esperado: 'नमस्ते' },
  { pais: 'Singapura', numero: '6591234567', esperado: 'Hello' },
  { pais: 'Tailândia', numero: '66812345678', esperado: 'สวัสดี' },
  
  // Oceania
  { pais: 'Austrália', numero: '61412345678', esperado: 'G\'day' },
  { pais: 'Nova Zelândia', numero: '64212345678', esperado: 'Kia ora' },
  
  // África
  { pais: 'África do Sul', numero: '27821234567', esperado: 'Hello' },
  { pais: 'Nigéria', numero: '2348012345678', esperado: 'Hello' },
  { pais: 'Quênia', número: '254712345678', esperado: 'Jambo' },
  
  // Oriente Médio
  { pais: 'Emirados Árabes Unidos', numero: '971501234567', esperado: 'مرحبا' },
  { pais: 'Israel', numero: '972501234567', esperado: 'שלום' },
  { pais: 'Turquia', numero: '905321234567', esperado: 'Merhaba' }
];

async function makeRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  return response;
}

async function testarDeteccaoGlobalPaises() {
  console.log('🌍 INICIANDO TESTE GLOBAL DE DETECÇÃO DE PAÍSES');
  console.log('=' .repeat(60));
  
  let aprovados = 0;
  let reprovados = 0;
  const resultados = [];
  
  for (const teste of numerosTestePaises) {
    try {
      const response = await makeRequest('/api/sms/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: teste.numero,
          message: 'Olá! Produto com R$50 OFF. Aproveite!'
        })
      });
      
      const result = await response.json();
      
      // Verificar se a saudação foi adaptada corretamente
      const saudacaoCorreta = result.adaptedMessage && result.adaptedMessage.includes(teste.esperado);
      
      if (saudacaoCorreta) {
        console.log(`✅ ${teste.pais}: ${teste.esperado} detectado`);
        aprovados++;
        resultados.push({
          pais: teste.pais,
          status: 'APROVADO',
          saudacao: teste.esperado,
          numero: teste.numero
        });
      } else {
        console.log(`❌ ${teste.pais}: esperado "${teste.esperado}", obtido "${result.adaptedMessage || 'erro'}"`);
        reprovados++;
        resultados.push({
          pais: teste.pais,
          status: 'REPROVADO',
          saudacao: teste.esperado,
          numero: teste.numero,
          erro: result.adaptedMessage || result.error
        });
      }
      
      // Delay para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`❌ ${teste.pais}: Erro na requisição - ${error.message}`);
      reprovados++;
      resultados.push({
        pais: teste.pais,
        status: 'ERRO',
        saudacao: teste.esperado,
        numero: teste.numero,
        erro: error.message
      });
    }
  }
  
  console.log('=' .repeat(60));
  console.log('📊 RELATÓRIO FINAL - DETECÇÃO GLOBAL DE PAÍSES');
  console.log(`   Total de países testados: ${numerosTestePaises.length}`);
  console.log(`   Países aprovados: ${aprovados}`);
  console.log(`   Países reprovados: ${reprovados}`);
  console.log(`   Taxa de sucesso: ${((aprovados / numerosTestePaises.length) * 100).toFixed(1)}%`);
  
  // Resumo por continente
  console.log('\n🌎 RESUMO POR CONTINENTE:');
  const continentes = {
    'América do Norte': resultados.filter(r => ['Estados Unidos', 'Canadá'].includes(r.pais)),
    'América Latina': resultados.filter(r => ['Brasil', 'Argentina', 'México', 'Chile', 'Colômbia'].includes(r.pais)),
    'Europa': resultados.filter(r => ['Reino Unido', 'Alemanha', 'França', 'Itália', 'Espanha', 'Portugal', 'Holanda', 'Suíça'].includes(r.pais)),
    'Ásia': resultados.filter(r => ['China', 'Japão', 'Coreia do Sul', 'Índia', 'Singapura', 'Tailândia'].includes(r.pais)),
    'Oceania': resultados.filter(r => ['Austrália', 'Nova Zelândia'].includes(r.pais)),
    'África': resultados.filter(r => ['África do Sul', 'Nigéria', 'Quênia'].includes(r.pais)),
    'Oriente Médio': resultados.filter(r => ['Emirados Árabes Unidos', 'Israel', 'Turquia'].includes(r.pais))
  };
  
  Object.entries(continentes).forEach(([continente, paises]) => {
    if (paises.length > 0) {
      const aprovadosContinente = paises.filter(p => p.status === 'APROVADO').length;
      const taxaContinente = ((aprovadosContinente / paises.length) * 100).toFixed(1);
      console.log(`   ${continente}: ${aprovadosContinente}/${paises.length} (${taxaContinente}%)`);
    }
  });
  
  if (aprovados >= numerosTestePaises.length * 0.8) {
    console.log('\n✅ SISTEMA APROVADO PARA PRODUÇÃO GLOBAL');
    console.log('   Sistema de detecção internacional funcionando corretamente!');
  } else {
    console.log('\n⚠️  SISTEMA PRECISA DE AJUSTES');
    console.log('   Algumas detecções falharam, verificar logs para correções.');
  }
  
  return {
    total: numerosTestePaises.length,
    aprovados,
    reprovados,
    taxaSucesso: ((aprovados / numerosTestePaises.length) * 100).toFixed(1),
    resultados
  };
}

// Executar teste
testarDeteccaoGlobalPaises().catch(console.error);