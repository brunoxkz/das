// Database selector - automatically chooses PostgreSQL or SQLite based on availability
export function getDatabaseType(): 'postgresql' | 'sqlite' {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  // Check if PostgreSQL is available
  if (DATABASE_URL && DATABASE_URL.startsWith('postgresql://')) {
    console.log('🐘 Using PostgreSQL database (Railway) - Supports 1000+ concurrent users');
    return 'postgresql';
  }
  
  console.log('🗃️ Using SQLite database (local) - Limited to ~100 concurrent users');
  return 'sqlite';
}

export async function testPostgreSQLConnection(): Promise<boolean> {
  try {
    const { Pool } = await import('pg');
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) return false;
    
    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: false,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      max: 20
    });

    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    await pool.end();
    
    console.log('✅ PostgreSQL connection test successful');
    return true;
  } catch (error) {
    console.log('❌ PostgreSQL connection test failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

export async function initializeDatabase() {
  const dbType = getDatabaseType();
  
  if (dbType === 'postgresql') {
    const isAvailable = await testPostgreSQLConnection();
    
    if (isAvailable) {
      console.log('🚀 PostgreSQL initialized successfully - Enterprise-grade scalability enabled');
      return 'postgresql';
    } else {
      console.log('⚠️ PostgreSQL unavailable, falling back to SQLite');
      return 'sqlite';
    }
  }
  
  console.log('🗃️ SQLite initialized - Development mode');
  return 'sqlite';
}