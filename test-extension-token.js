import fetch from 'node-fetch';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkxDT0FhNmdqdUdHa2hJbFVubHVoRSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInB1cnBvc2UiOiJjaHJvbWVfZXh0ZW5zaW9uIiwidHlwZSI6ImV4dGVuc2lvbiIsImlhdCI6MTc1MTk1MDc5MiwiZXhwIjoxNzU0NTQyNzkyfQ.5j9ENP2VxTLSbDik46DEn523dFYLWMu33MZ48TV_STw';

async function testarToken() {
  try {
    const response = await fetch('https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/api/extension/sync', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('🔍 TESTE DO TOKEN:');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      console.log('✅ TOKEN FUNCIONANDO PERFEITAMENTE!');
      console.log('🎯 Quizzes encontrados:', data.quizzes.length);
    } else {
      console.log('❌ Problema:', data.message || 'Token inválido');
    }
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

testarToken();