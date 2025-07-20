// Teste direto da função getQuiz via API

async function importFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function testQuizAPI() {
  console.log('🔍 TESTE DIRETO API - Quiz Access');
  
  try {
    // Login
    const fetch = await importFetch();
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('🔐 Login Status:', loginResponse.status, loginData.accessToken ? 'HAS TOKEN' : 'NO TOKEN');
    
    if (!loginData.accessToken) {
      console.log('❌ Login falhou');
      return;
    }

    // Test Quiz API
    const quizResponse = await fetch('http://localhost:5000/api/quizzes/G6_IWD6lNpzIlnqb6EVnm', {
      headers: { 'Authorization': `Bearer ${loginData.accessToken}` }
    });
    
    const quizData = await quizResponse.json();
    console.log('📋 Quiz API Status:', quizResponse.status);
    console.log('📋 Quiz API Response:', JSON.stringify(quizData, null, 2));
    
    // Test Manual SQLite
    console.log('\n🔍 TESTE DIRETO SQLITE - Via SQLite');
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./database.sqlite');
    
    db.get('SELECT id, title, userId FROM quizzes WHERE id = ?', ['G6_IWD6lNpzIlnqb6EVnm'], (err, row) => {
      if (err) {
        console.error('❌ SQLite Error:', err.message);
      } else if (row) {
        console.log('✅ SQLite Direct Success:', row);
      } else {
        console.log('❌ SQLite Direct: No data found');
      }
      db.close();
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testQuizAPI();