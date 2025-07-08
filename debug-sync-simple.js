import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conectar ao banco de dados
const dbPath = path.join(__dirname, 'vendzz-database.db');
const db = new sqlite3.Database(dbPath);

// Verificar último sync
db.get(
  "SELECT * FROM whatsapp_automation_files WHERE user_id = 'KjctNCOlM5jcafgA_drVQ' AND quiz_id = 'Qm4wxpfPgkMrwoMhDFNLZ'",
  (err, file) => {
    if (err) {
      console.error('Erro ao buscar arquivo:', err);
      return;
    }
    
    if (file) {
      console.log('📁 Arquivo encontrado:', {
        id: file.id,
        last_sync: file.last_sync,
        lastSyncAsDate: new Date(file.last_sync).toISOString()
      });
      
      // Buscar respostas mais recentes
      db.all(
        "SELECT submittedAt, metadata FROM quiz_responses WHERE quizId = 'Qm4wxpfPgkMrwoMhDFNLZ' ORDER BY submittedAt DESC LIMIT 5",
        (err, responses) => {
          if (err) {
            console.error('Erro ao buscar respostas:', err);
            return;
          }
          
          console.log('📊 Respostas recentes:');
          responses.forEach((resp, i) => {
            const submittedDate = new Date(resp.submittedAt * 1000);
            const lastSyncDate = new Date(file.last_sync);
            const isNew = submittedDate > lastSyncDate;
            
            console.log(`${i+1}. ${submittedDate.toISOString()} > ${lastSyncDate.toISOString()} = ${isNew}`);
          });
          
          db.close();
        }
      );
    } else {
      console.log('❌ Arquivo não encontrado');
      db.close();
    }
  }
);