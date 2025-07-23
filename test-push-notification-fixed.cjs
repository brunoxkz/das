const http = require('http');

const testData = {
  responses: [
    { pageIndex: 0, objetivo_fitness: "Emagrecer" },
    { pageIndex: 1, nome: "Teste Admin Push" }
  ],
  metadata: { completionPercentage: 100 },
  totalPages: 2,
  timeSpent: 120
};

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/quizzes/vqKf3jVQMhkMkuiZFL_5d/submit',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbi11c2VyLWlkIiwiZW1haWwiOiJhZG1pbkB2ZW5kenovY29tIiwiaWF0IjoxNzUzMjM0NDcwLCJleHAiOjE3NTMyMzUzNzB9.8rwwmzKEy6BkdCbS8nCfAu-_EQEYYGcKr2MwXoE0dMI'
  }
};

console.log('🔔 Testando sistema de notificação automática...');
const req = http.request(options, (res) => {
  console.log(`📊 STATUS: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('✅ RESPOSTA:', data);
    console.log('🔍 Verificando se há tentativa de notificação nos logs em 2 segundos...');
  });
});

req.on('error', (e) => console.error('❌ ERRO:', e.message));
req.write(JSON.stringify(testData));
req.end();
