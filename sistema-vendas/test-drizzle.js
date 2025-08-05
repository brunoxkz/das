import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { users } from './shared/schema.ts';
import bcrypt from 'bcryptjs';

console.log('🧪 Testando Drizzle ORM...');

// Direct SQLite connection
const sqlite = new Database('./database.db');
console.log('Database file:', './database.db');

// Create Drizzle instance
const db = drizzle(sqlite);

// Test Drizzle query
try {
  console.log('\n🔍 Testando query Drizzle:');
  const allUsers = await db.select().from(users);
  console.log('Users found via Drizzle:', allUsers.length);
  
  allUsers.forEach(user => {
    console.log(`👤 ${user.username} | Active: ${user.isActive}`);
  });
  
  // Test specific user query (how auth does it)
  console.log('\n🔐 Testando query de autenticação:');
  const [adminUser] = await db.select().from(users).where(eq(users.username, 'admin'));
  
  if (adminUser) {
    console.log('Admin user found via Drizzle:', !!adminUser);
    console.log('User object:', {
      id: adminUser.id,
      username: adminUser.username,
      password: adminUser.password?.substring(0, 20) + '...',
      isActive: adminUser.isActive,
      role: adminUser.role
    });
    
    // Test password comparison
    const passwordTest = await bcrypt.compare('admin123', adminUser.password);
    console.log('Password comparison result:', passwordTest);
    
  } else {
    console.log('❌ Admin user NOT found via Drizzle');
  }
  
} catch (error) {
  console.error('❌ Drizzle error:', error);
}

sqlite.close();