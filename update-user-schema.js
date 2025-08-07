import { db } from './server/db-sqlite.js';

async function updateUserSchema() {
  try {
    console.log('🔄 Atualizando schema de usuários...');
    
    // Adicionar coluna whatsapp se não existir
    const alterQuery = `
      ALTER TABLE users ADD COLUMN whatsapp TEXT;
    `;
    
    try {
      await db.exec(alterQuery);
      console.log('✅ Coluna whatsapp adicionada com sucesso');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log('✅ Coluna whatsapp já existe');
      } else {
        throw error;
      }
    }
    
    console.log('✅ Schema atualizado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar schema:', error);
  }
}

updateUserSchema();