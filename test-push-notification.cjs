const http = require('http');

const testData = {
  responses: { objetivo_fitness: "Emagrecer", nome: "Teste Admin" },
  metadata: { completionPercentage: 100 },
  totalPages: 6,
  timeSpent: 300
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

const req = http.request(options, (res) => {
  console.log(`🧪 STATUS: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('📊 RESPOSTA:', data);
    console.log('🔍 Aguarde 3 segundos para ver logs de notificação...');
  });
});

req.on('error', (e) => console.error('❌ ERRO:', e.message));
req.write(JSON.stringify(testData));
req.end();
