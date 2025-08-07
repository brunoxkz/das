/**
 * DEBUG DIRETO DO SQLITE
 * Testa diretamente a consulta no banco SQLite
 */

import Database from 'better-sqlite3';

// Conectar ao banco SQLite
const sqlite = new Database('./vendzz-database.db');

console.log('🔍 TESTANDO CONSULTA DIRETA NO SQLITE');

// Buscar todas as respostas do quiz
const quizId = 'ey15ofZ96pBzDIWv_k19T';
console.log(`\n📊 Buscando respostas para quiz: ${quizId}`);

const stmt1 = sqlite.prepare(`
  SELECT id, quizId, responses, metadata, submittedAt 
  FROM quiz_responses 
  WHERE quizId = ? 
  ORDER BY submittedAt DESC
`);

const allResponses = stmt1.all(quizId);
console.log(`📊 Total de respostas encontradas: ${allResponses.length}`);

if (allResponses.length > 0) {
  allResponses.forEach((response, index) => {
    console.log(`\n📋 Resposta ${index + 1}:`);
    console.log(`  ID: ${response.id}`);
    console.log(`  Quiz ID: ${response.quizId}`);
    console.log(`  Submitted At: ${response.submittedAt}`);
    
    try {
      const metadata = JSON.parse(response.metadata || '{}');
      console.log(`  Metadata: ${JSON.stringify(metadata, null, 2)}`);
    } catch (e) {
      console.log(`  Metadata (raw): ${response.metadata}`);
    }
    
    try {
      const responses = JSON.parse(response.responses || '{}');
      console.log(`  Responses: ${JSON.stringify(responses, null, 2)}`);
    } catch (e) {
      console.log(`  Responses (raw): ${response.responses}`);
    }
  });
}

// Testar a consulta com filtros
console.log('\n📊 Testando consulta com filtros...');

// Primeiro, vou testar diferentes versões da consulta para ver o que funciona
console.log('\n📊 Testando consulta 1 (JSON_EXTRACT):');
const stmt2 = sqlite.prepare(`
  SELECT id, quizId, responses, metadata, submittedAt
  FROM quiz_responses
  WHERE quizId = ?
  AND (
    (JSON_EXTRACT(metadata, '$.isComplete') = 'true') OR 
    (JSON_EXTRACT(metadata, '$.completionPercentage') = 100) OR
    (JSON_EXTRACT(metadata, '$.isComplete') = 'false' AND JSON_EXTRACT(metadata, '$.isPartial') != 'true')
  )
`);

const filteredResponses = stmt2.all(quizId);
console.log(`📊 Respostas filtradas: ${filteredResponses.length}`);

// Teste 2: Tentativa com sintaxe json_extract
console.log('\n📊 Testando consulta 2 (json_extract):');
const stmt3 = sqlite.prepare(`
  SELECT id, quizId, responses, metadata, submittedAt
  FROM quiz_responses
  WHERE quizId = ?
  AND (
    (json_extract(metadata, '$.isComplete') = 'true') OR 
    (json_extract(metadata, '$.completionPercentage') = 100) OR
    (json_extract(metadata, '$.isComplete') = 'false' AND json_extract(metadata, '$.isPartial') != 'true')
  )
`);

const filteredResponses2 = stmt3.all(quizId);
console.log(`📊 Respostas filtradas: ${filteredResponses2.length}`);

// Teste 3: Tentativa mais simples
console.log('\n📊 Testando consulta 3 (simples):');
const stmt4 = sqlite.prepare(`
  SELECT id, quizId, responses, metadata, submittedAt
  FROM quiz_responses
  WHERE quizId = ?
  AND (
    (json_extract(metadata, '$.isComplete') = 1) OR 
    (json_extract(metadata, '$.completionPercentage') = 100)
  )
`);

const filteredResponses3 = stmt4.all(quizId);
console.log(`📊 Respostas filtradas: ${filteredResponses3.length}`);

// Fechar conexão
sqlite.close();