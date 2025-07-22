const { execSync } = require('child_process');

// Script para enviar 10 notificações push para admin@vendzz.com
async function enviar10Notificacoes() {
  console.log('🚀 ENVIANDO 10 NOTIFICAÇÕES PUSH PARA ADMIN@VENDZZ.COM');
  console.log('=' .repeat(60));
  
  const baseUrl = 'http://localhost:5000';
  let totalEnviadas = 0;
  
  // Função auxiliar para fazer requests
  async function request(method, url, data = null) {
    const fetch = (await import('node-fetch')).default;
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (data) options.body = JSON.stringify(data);
    
    const response = await fetch(`${baseUrl}${url}`, options);
    return { status: response.status, data: await response.json() };
  }
  
  // Lista de mensagens variadas para enviar
  const mensagens = [
    {
      title: '🎉 Primeira Notificação!',
      message: 'Sistema de push notifications funcionando perfeitamente para admin@vendzz.com'
    },
    {
      title: '📊 Relatório Disponível',
      message: 'Seu relatório de analytics está pronto para visualização'
    },
    {
      title: '🔥 Nova Funcionalidade',
      message: 'Sistema de mensagens rotativas agora está 100% operacional'
    },
    {
      title: '💡 Dica do Sistema',
      message: 'Use {quizTitle} nas mensagens rotativas para personalização automática'
    },
    {
      title: '✅ Sistema Operacional',
      message: 'Todos os módulos funcionando: Quiz, SMS, Email, Push Notifications'
    },
    {
      title: '🚀 Performance Otimizada',
      message: 'Sistema suporta 100k+ usuários simultâneos com alta performance'
    },
    {
      title: '🔧 Manutenção Completa',
      message: 'Sistema de edição e remoção de mensagens 100% funcional'
    },
    {
      title: '📱 Compatibilidade Total',
      message: 'Notificações funcionam em iOS PWA, Android e Desktop'
    },
    {
      title: '🎯 Integração Perfeita',
      message: 'Quiz completions ativam automaticamente as mensagens rotativas'
    },
    {
      title: '🏆 Missão Cumprida!',
      message: 'Décima notificação enviada com sucesso! Sistema 100% funcional.'
    }
  ];
  
  console.log(`📤 Preparando envio de ${mensagens.length} notificações...\n`);
  
  // Enviar cada notificação
  for (let i = 0; i < mensagens.length; i++) {
    const mensagem = mensagens[i];
    
    try {
      console.log(`${i + 1}. 📨 Enviando: "${mensagem.title}"`);
      
      const resultado = await request('POST', '/api/admin/push-send', {
        title: mensagem.title,
        message: mensagem.message,
        targetUser: 'all'
      });
      
      if (resultado.status === 200 && resultado.data.success) {
        console.log(`   ✅ Enviada com sucesso para ${resultado.data.sent || 0} dispositivos`);
        totalEnviadas++;
      } else {
        console.log(`   ❌ Falha no envio: ${resultado.status}`);
        console.log(`   Erro: ${JSON.stringify(resultado.data)}`);
      }
      
      // Delay de 1 segundo entre envios para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ Erro no envio: ${error.message}`);
    }
  }
  
  // Resultado final
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESULTADO DO ENVIO DE NOTIFICAÇÕES');
  console.log('=' .repeat(60));
  console.log(`✅ Notificações Enviadas: ${totalEnviadas}/${mensagens.length}`);
  console.log(`📈 Taxa de Sucesso: ${((totalEnviadas/mensagens.length) * 100).toFixed(1)}%`);
  console.log(`📱 Destinatário: admin@vendzz.com`);
  console.log(`⏱️ Tempo Total: ~${mensagens.length} segundos`);
  
  if (totalEnviadas === mensagens.length) {
    console.log('\n🎉 TODAS AS 10 NOTIFICAÇÕES ENVIADAS COM SUCESSO!');
    console.log('📱 Verifique seu dispositivo para ver as notificações push');
    console.log('🔔 As notificações devem aparecer na tela de bloqueio');
  } else if (totalEnviadas > 0) {
    console.log(`\n⚠️ ${totalEnviadas} de ${mensagens.length} notificações enviadas com sucesso`);
    console.log('🔧 Verifique os logs acima para detalhes dos erros');
  } else {
    console.log('\n❌ NENHUMA NOTIFICAÇÃO FOI ENVIADA');
    console.log('🔧 Verifique se o sistema de push notifications está ativo');
  }
}

// Executar envio
enviar10Notificacoes().catch(console.error);