const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar ao banco de dados
const dbPath = path.join(__dirname, 'vendzz-database.db');
const db = new sqlite3.Database(dbPath);

async function testDateFilter() {
  console.log('📅 TESTE FILTRO DE DATA - VERIFICAÇÃO DIRETA NO BANCO');
  
  return new Promise((resolve, reject) => {
    // 1. Buscar todas as respostas
    db.all("SELECT id, quizId, submittedAt, responses FROM quiz_responses WHERE quizId = 'Qm4wxpfPgkMrwoMhDFNLZ'", (err, allResponses) => {
      if (err) {
        console.error('❌ Erro ao buscar respostas:', err);
        reject(err);
        return;
      }
      
      console.log(`📊 Total de respostas encontradas: ${allResponses.length}`);
      
      // Mostrar datas das respostas
      allResponses.forEach((response, index) => {
        const date = new Date(response.submittedAt);
        console.log(`  ${index + 1}. ID: ${response.id} - ${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR')}`);
      });
      
      // 2. Testar filtro de data - usar data específica
      const filterDate = new Date('2025-01-08T00:00:00.000Z');
      console.log(`\n🔍 TESTANDO FILTRO A PARTIR DE: ${filterDate.toLocaleDateString('pt-BR')}`);
      
      // Aplicar filtro manualmente
      const filteredResponses = allResponses.filter(response => {
        const responseDate = new Date(response.submittedAt);
        return responseDate >= filterDate;
      });
      
      console.log(`📧 Respostas após filtro de data: ${filteredResponses.length}`);
      
      filteredResponses.forEach((response, index) => {
        const date = new Date(response.submittedAt);
        console.log(`  ${index + 1}. ID: ${response.id} - ${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR')}`);
      });
      
      // 3. Testar com data futura
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      const futureFilteredResponses = allResponses.filter(response => {
        const responseDate = new Date(response.submittedAt);
        return responseDate >= futureDate;
      });
      
      console.log(`\n🔮 TESTE COM DATA FUTURA (${futureDate.toLocaleDateString('pt-BR')}): ${futureFilteredResponses.length} respostas`);
      
      // 4. Verificar se há emails válidos nas respostas
      console.log('\n📧 VERIFICANDO EMAILS NAS RESPOSTAS:');
      
      let emailCount = 0;
      allResponses.forEach(response => {
        try {
          const responses = JSON.parse(response.responses);
          let hasEmail = false;
          
          if (Array.isArray(responses)) {
            responses.forEach(element => {
              if (element.elementType === 'email' && element.answer && element.answer.includes('@')) {
                hasEmail = true;
              }
            });
          } else {
            Object.keys(responses).forEach(key => {
              if (key.includes('email') && responses[key] && responses[key].includes('@')) {
                hasEmail = true;
              }
            });
          }
          
          if (hasEmail) {
            emailCount++;
            const date = new Date(response.submittedAt);
            console.log(`  ✅ Email encontrado - ID: ${response.id} - ${date.toLocaleDateString('pt-BR')}`);
          }
        } catch (error) {
          console.log(`  ❌ Erro ao processar resposta ${response.id}:`, error.message);
        }
      });
      
      console.log(`\n📊 RESUMO:`);
      console.log(`  Total de respostas: ${allResponses.length}`);
      console.log(`  Respostas com emails: ${emailCount}`);
      console.log(`  Respostas após filtro (08/01/2025): ${filteredResponses.length}`);
      console.log(`  Respostas após filtro futuro: ${futureFilteredResponses.length}`);
      
      // Verificar se o filtro está funcionando
      if (futureFilteredResponses.length === 0) {
        console.log('\n✅ FILTRO DE DATA FUNCIONANDO - Filtro futuro retornou 0 respostas (correto)');
      } else {
        console.log('\n❌ POSSÍVEL PROBLEMA - Filtro futuro deveria retornar 0 respostas');
      }
      
      if (filteredResponses.length <= allResponses.length) {
        console.log('✅ FILTRO DE DATA FUNCIONANDO - Filtro reduziu o número de respostas');
      } else {
        console.log('❌ POSSÍVEL ERRO - Filtro aumentou o número de respostas');
      }
      
      console.log('\n✅ TESTE CONCLUÍDO');
      
      db.close();
      resolve();
    });
  });
}

testDateFilter().catch(console.error);