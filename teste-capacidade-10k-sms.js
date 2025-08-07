import sqlite3 from 'better-sqlite3';
import path from 'path';

// Teste de capacidade: 10.000 SMS no mesmo horário
async function testeCapacidade10kSMS() {
  console.log('🚀 INICIANDO TESTE: 10.000 SMS simultâneos no mesmo horário');
  
  const db = sqlite3(path.join(__dirname, 'db.sqlite'));
  
  // Timestamp para hoje 14h00
  const targetTime = Math.floor(Date.now() / 1000) + 3600; // +1 hora
  const startTime = Date.now();
  
  try {
    // Simular criação de 10.000 SMS agendados para o mesmo horário
    const insertStmt = db.prepare(`
      INSERT INTO sms_logs (id, campaignId, phone, message, status, scheduledAt, createdAt)
      VALUES (?, ?, ?, ?, 'scheduled', ?, ?)
    `);
    
    console.log(`📅 Agendando 10.000 SMS para ${new Date(targetTime * 1000).toLocaleString()}`);
    
    const insertMany = db.transaction(() => {
      for (let i = 1; i <= 10000; i++) {
        insertStmt.run(
          `test-${i}-${Date.now()}`,
          `campaign-${Math.ceil(i / 100)}`, // 100 campanhas de 100 SMS cada
          `119${String(i).padStart(8, '0')}`,
          `Mensagem de teste ${i}`,
          targetTime,
          Math.floor(Date.now() / 1000)
        );
      }
    });
    
    insertMany();
    
    const insertTime = Date.now() - startTime;
    console.log(`✅ 10.000 SMS inseridos em ${insertTime}ms`);
    
    // Testar capacidade de busca e processamento
    console.log('\n🔍 TESTANDO CAPACIDADE DE PROCESSAMENTO:');
    
    const searchStart = Date.now();
    
    // Buscar SMS do horário específico (como o sistema faz)
    const scheduledSMS = db.prepare(`
      SELECT * FROM sms_logs 
      WHERE scheduledAt <= ? AND status = 'scheduled'
      ORDER BY scheduledAt ASC
      LIMIT 10000
    `).all(targetTime + 60); // +60s de margem
    
    const searchTime = Date.now() - searchStart;
    console.log(`📊 Busca de ${scheduledSMS.length} SMS: ${searchTime}ms`);
    
    // Simular processamento em lotes (como sistema real)
    console.log('\n⚡ SIMULANDO PROCESSAMENTO EM LOTES:');
    
    const batchSize = 2500; // 25 campanhas × 100 SMS
    const batches = Math.ceil(scheduledSMS.length / batchSize);
    
    let totalProcessed = 0;
    const processStart = Date.now();
    
    for (let batch = 0; batch < batches; batch++) {
      const batchStart = Date.now();
      const batchSMS = scheduledSMS.slice(batch * batchSize, (batch + 1) * batchSize);
      
      // Simular processamento (sem envio real)
      for (const sms of batchSMS) {
        totalProcessed++;
        // Simular delay de processamento real
        await new Promise(resolve => setTimeout(resolve, 0.1)); // 0.1ms por SMS
      }
      
      const batchTime = Date.now() - batchStart;
      console.log(`📦 Lote ${batch + 1}/${batches}: ${batchSMS.length} SMS em ${batchTime}ms`);
      
      // Delay entre lotes (como sistema real)
      if (batch < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms
      }
    }
    
    const totalProcessTime = Date.now() - processStart;
    
    console.log('\n📈 RESULTADOS DO TESTE:');
    console.log(`✅ Total processado: ${totalProcessed} SMS`);
    console.log(`⏱️ Tempo total: ${totalProcessTime}ms (${(totalProcessTime/1000).toFixed(1)}s)`);
    console.log(`🚀 Taxa de processamento: ${Math.round(totalProcessed / (totalProcessTime/1000))} SMS/segundo`);
    console.log(`📊 Throughput por hora: ${Math.round((totalProcessed / (totalProcessTime/1000)) * 3600)} SMS/hora`);
    
    // Calcular se suporta horários simultâneos
    const smsPerMinute = Math.round(totalProcessed / (totalProcessTime/1000/60));
    console.log(`📱 SMS por minuto: ${smsPerMinute}`);
    
    if (smsPerMinute >= 10000) {
      console.log('🎯 RESULTADO: ✅ SUPORTA 10K SMS/HORA COM FOLGA!');
    } else {
      console.log('⚠️ RESULTADO: Pode ter limitações em picos extremos');
    }
    
    // Limpeza dos dados de teste
    db.prepare(`DELETE FROM sms_logs WHERE id LIKE 'test-%'`).run();
    console.log('\n🧹 Dados de teste removidos');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    db.close();
  }
}

// Executar teste
testeCapacidade10kSMS().catch(console.error);