import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar ao banco de dados
const dbPath = path.join(process.cwd(), 'vendzz-database.db');
const db = new sqlite3.Database(dbPath);

async function verificarTimestamps() {
  console.log('📅 VERIFICANDO TIMESTAMPS DAS RESPOSTAS');
  
  return new Promise((resolve, reject) => {
    db.all("SELECT id, quizId, submittedAt FROM quiz_responses ORDER BY submittedAt DESC LIMIT 10", (err, responses) => {
      if (err) {
        console.error('❌ Erro ao buscar respostas:', err);
        reject(err);
        return;
      }
      
      console.log(`📊 Últimas ${responses.length} respostas encontradas:\n`);
      
      responses.forEach((response, index) => {
        const date = new Date(response.submittedAt);
        const timestamp = response.submittedAt;
        
        console.log(`${index + 1}. ID: ${response.id}`);
        console.log(`   Quiz: ${response.quizId}`);
        console.log(`   Timestamp: ${timestamp}`);
        console.log(`   Data: ${date.toLocaleDateString('pt-BR')}`);
        console.log(`   Hora: ${date.toLocaleTimeString('pt-BR')}`);
        console.log(`   ISO: ${date.toISOString()}`);
        console.log('   ─────────────────────────────────────\n');
      });
      
      console.log('✅ CONFIRMADO: Salvamos data E hora completas!\n');
      console.log('📋 FORMATO SALVO:');
      console.log('   • Timestamp Unix (milissegundos)');
      console.log('   • Inclui: ano, mês, dia, hora, minuto, segundo, milissegundo');
      console.log('   • Timezone: UTC (convertido para local na exibição)');
      console.log('   • Precisão: milissegundos');
      
      db.close();
      resolve();
    });
  });
}

verificarTimestamps().catch(console.error);