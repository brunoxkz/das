import { db } from './server/db-sqlite.js';
import { whatsappAutomationFiles } from './shared/schema-sqlite.js';

async function criarTesteWhatsApp() {
  try {
    console.log('🔑 CRIANDO ARQUIVO DE TESTE PARA 11995133932\n');

    const fileId = `test-11995133932-${Date.now()}`;
    const testData = {
      id: fileId,
      user_id: 'KjctNCOlM5jcafgA_drVQ',
      quiz_id: 'test-quiz-11995133932',
      quiz_title: 'TESTE DIRETO - Telefone 11995133932',
      target_audience: 'completed',
      date_filter: null,
      total_phones: 1,
      contacts: JSON.stringify([{
        phone: '11995133932',
        nome: 'Rafael Silva',
        email: 'rafael.silva@teste.com',
        idade: '28',
        altura: '180',
        peso: '75',
        status: 'completed',
        submissionDate: new Date().toISOString(),
        responses: {
          nome: 'Rafael Silva',
          email: 'rafael.silva@teste.com',
          telefone_principal: '11995133932',
          idade: '28',
          altura: '180',
          peso_atual: '75',
          peso_desejado: '70',
          objetivo: 'Perder 5kg em 3 meses'
        }
      }]),
      created_at: new Date().toISOString()
    };

    // Inserir arquivo no banco
    await db.insert(whatsappAutomationFiles).values(testData);
    
    console.log('✅ Arquivo criado com sucesso!');
    console.log(`📋 ID: ${fileId}`);
    console.log(`📱 Telefone: 11995133932`);
    console.log(`👤 Nome: Rafael Silva`);
    console.log(`📧 Email: rafael.silva@teste.com`);
    console.log(`👨 Idade: 28 anos`);
    console.log(`📏 Altura: 180cm`);
    console.log(`⚖️ Peso: 75kg`);

    console.log('\n🎯 MENSAGEM PERSONALIZADA DE EXEMPLO:');
    console.log('Olá Rafael Silva! 🎉 Parabéns por completar nosso quiz!');
    console.log('Com 28 anos, altura de 180cm e peso atual de 75kg,');
    console.log('temos o plano perfeito para você atingir seus objetivos! 💪');

    console.log('\n🔧 COMO USAR NA EXTENSÃO:');
    console.log('1. Abra WhatsApp Web');
    console.log('2. Sidebar aparece automaticamente');
    console.log('3. Clique "🔄 Conectar"');
    console.log('4. Selecione "TESTE DIRETO - Telefone 11995133932"');
    console.log('5. Configure mensagem personalizada com {nome}, {idade}, {altura}, {peso}');
    console.log('6. Clique "🚀 Iniciar Automação"');

    console.log('\n📞 FORMATAÇÃO AUTOMÁTICA:');
    console.log('11995133932 → +5511995133932 (WhatsApp)');

    console.log('\n✅ ARQUIVO PRONTO PARA TESTE!');
    
  } catch (error) {
    console.error('❌ Erro ao criar arquivo:', error);
  }
}

criarTesteWhatsApp();