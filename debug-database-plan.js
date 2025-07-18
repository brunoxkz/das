import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'vendzz-database.db');

console.log('🔍 Verificando plano no banco de dados...');
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Verificar se a tabela existe
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='stripe_plans'").all();
  console.log('Tabela stripe_plans existe:', tables.length > 0);
  
  if (tables.length > 0) {
    // Listar todos os planos
    const allPlans = db.prepare("SELECT id, name, active FROM stripe_plans").all();
    console.log('Todos os planos:', allPlans);
    
    // Buscar plano específico
    const specificPlan = db.prepare("SELECT * FROM stripe_plans WHERE id = ?").get('YeIVDpw7yDSfftA6bxRG8');
    console.log('Plano específico:', specificPlan);
    
    // Verificar se está ativo
    const activePlan = db.prepare("SELECT * FROM stripe_plans WHERE id = ? AND active = 1").get('YeIVDpw7yDSfftA6bxRG8');
    console.log('Plano ativo:', activePlan);
  }
  
  db.close();
  console.log('✅ Verificação concluída');
  
} catch (error) {
  console.error('❌ Erro ao verificar banco:', error.message);
}