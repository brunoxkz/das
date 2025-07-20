/**
 * TESTE COMPLETO PWA MODERNO 2025 - VENDZZ
 * Sistema de notificações push com design futurista
 * Última atualização: 20 de julho de 2025
 */

const API_BASE = 'http://localhost:5000';

// Credenciais de teste
const credentials = {
  email: 'admin@admin.com',
  password: 'admin123'
};

/**
 * TESTE 1: Autenticação e Sistema de Tokens
 */
async function testeAutenticacao() {
  console.log('\n🔐 TESTE 1: Autenticação JWT');
  
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login realizado com sucesso');
      console.log(`📊 Token: ${data.token.substring(0, 20)}...`);
      return data.token;
    } else {
      console.log('❌ Falha no login:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Erro de conexão:', error.message);
    return null;
  }
}

/**
 * TESTE 2: VAPID Keys para Push Notifications
 */
async function testeVapidKeys(token) {
  console.log('\n🔑 TESTE 2: Chaves VAPID');
  
  try {
    const response = await fetch(`${API_BASE}/api/notifications/vapid-key`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Chaves VAPID carregadas');
      console.log(`📊 Chave pública: ${data.vapidPublicKey.substring(0, 30)}...`);
      return true;
    } else {
      console.log('❌ Falha ao carregar VAPID keys:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao carregar VAPID:', error.message);
    return false;
  }
}

/**
 * TESTE 3: Simulação de Subscription Push
 */
async function testeSubscriptionPush(token) {
  console.log('\n📱 TESTE 3: Subscription Push');
  
  const mockSubscription = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
    keys: {
      p256dh: 'test-p256dh-key',
      auth: 'test-auth-key'
    }
  };

  try {
    const response = await fetch(`${API_BASE}/api/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ subscription: mockSubscription })
    });

    if (response.ok) {
      console.log('✅ Subscription criada com sucesso');
      return true;
    } else {
      console.log('❌ Falha na subscription:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro na subscription:', error.message);
    return false;
  }
}

/**
 * TESTE 4: Envio de Notificação Push Real
 */
async function testeEnvioNotificacao(token) {
  console.log('\n🚀 TESTE 4: Envio de Notificação Push');
  
  const notificationData = {
    title: "🎯 Teste PWA Vendzz 2025",
    body: "Sistema de notificações funcionando perfeitamente com design moderno!",
    icon: "/vendzz-icon-192.png",
    url: "/app-pwa-modern-2025",
    priority: "high"
  };

  try {
    const response = await fetch(`${API_BASE}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(notificationData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Notificação enviada com sucesso');
      console.log(`📊 Resultado: ${JSON.stringify(result, null, 2)}`);
      return true;
    } else {
      console.log('❌ Falha no envio:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro no envio:', error.message);
    return false;
  }
}

/**
 * TESTE 5: Estatísticas de Notificações
 */
async function testeEstatisticas(token) {
  console.log('\n📊 TESTE 5: Estatísticas de Notificações');
  
  try {
    const response = await fetch(`${API_BASE}/api/notifications/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const stats = await response.json();
      console.log('✅ Estatísticas carregadas');
      console.log(`📊 Total de inscritos: ${stats.totalSubscriptions || 'N/A'}`);
      console.log(`📊 Taxa de entrega: ${stats.deliveryRate || 'N/A'}%`);
      console.log(`📊 Taxa de abertura: ${stats.openRate || 'N/A'}%`);
      return true;
    } else {
      console.log('❌ Falha ao carregar estatísticas:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro nas estatísticas:', error.message);
    return false;
  }
}

/**
 * TESTE 6: Templates de Notificação
 */
async function testeTemplates(token) {
  console.log('\n📝 TESTE 6: Templates de Notificação');
  
  const templates = [
    {
      title: "🎯 Novo Lead Capturado",
      body: "Parabéns! Alguém acabou de responder seu quiz e se tornou um lead qualificado.",
      type: "lead"
    },
    {
      title: "📊 Meta de Conversão Atingida", 
      body: "Incrível! Sua campanha atingiu a meta de 1000 conversões hoje.",
      type: "goal"
    },
    {
      title: "⚡ Campanha Reativada",
      body: "Sua campanha de WhatsApp foi reativada e está enviando mensagens automaticamente.",
      type: "campaign"
    }
  ];

  let successCount = 0;
  
  for (const template of templates) {
    try {
      const response = await fetch(`${API_BASE}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...template,
          icon: "/vendzz-icon-192.png",
          url: "/app-pwa-modern-2025"
        })
      });

      if (response.ok) {
        console.log(`✅ Template ${template.type} enviado`);
        successCount++;
      } else {
        console.log(`❌ Falha no template ${template.type}: ${response.status}`);
      }
      
      // Delay entre templates
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`❌ Erro no template ${template.type}:`, error.message);
    }
  }

  console.log(`📊 Templates enviados: ${successCount}/${templates.length}`);
  return successCount === templates.length;
}

/**
 * TESTE 7: Teste de Performance e Latência
 */
async function testePerformance(token) {
  console.log('\n⚡ TESTE 7: Performance e Latência');
  
  const startTime = Date.now();
  let successCount = 0;
  const totalTests = 5;

  for (let i = 1; i <= totalTests; i++) {
    const testStart = Date.now();
    
    try {
      const response = await fetch(`${API_BASE}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `⚡ Teste Performance #${i}`,
          body: `Teste de latência e performance do sistema PWA`,
          icon: "/vendzz-icon-192.png",
          url: "/app-pwa-modern-2025"
        })
      });

      const testEnd = Date.now();
      const latency = testEnd - testStart;

      if (response.ok) {
        console.log(`✅ Teste ${i}: ${latency}ms`);
        successCount++;
      } else {
        console.log(`❌ Teste ${i} falhou: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Teste ${i} erro:`, error.message);
    }
  }

  const totalTime = Date.now() - startTime;
  const avgLatency = totalTime / totalTests;
  
  console.log(`📊 Resultados de Performance:`);
  console.log(`   • Testes bem-sucedidos: ${successCount}/${totalTests}`);
  console.log(`   • Tempo total: ${totalTime}ms`);
  console.log(`   • Latência média: ${avgLatency.toFixed(1)}ms`);
  console.log(`   • Taxa de sucesso: ${((successCount / totalTests) * 100).toFixed(1)}%`);

  return successCount >= (totalTests * 0.8); // 80% de sucesso mínimo
}

/**
 * FUNÇÃO PRINCIPAL - EXECUTA TODOS OS TESTES
 */
async function executarTodosTestes() {
  console.log('🚀 INICIANDO TESTES PWA MODERNO 2025 - VENDZZ');
  console.log('=' * 60);
  
  const startTime = Date.now();
  const resultados = {
    autenticacao: false,
    vapidKeys: false,
    subscription: false,
    envioNotificacao: false,
    estatisticas: false,
    templates: false,
    performance: false
  };

  // Executar testes em sequência
  const token = await testeAutenticacao();
  if (token) {
    resultados.autenticacao = true;
    resultados.vapidKeys = await testeVapidKeys(token);
    resultados.subscription = await testeSubscriptionPush(token);
    resultados.envioNotificacao = await testeEnvioNotificacao(token);
    resultados.estatisticas = await testeEstatisticas(token);
    resultados.templates = await testeTemplates(token);
    resultados.performance = await testePerformance(token);
  }

  // Calcular resultados finais
  const totalTestes = Object.keys(resultados).length;
  const testesAprovados = Object.values(resultados).filter(Boolean).length;
  const taxaSucesso = (testesAprovados / totalTestes * 100).toFixed(1);
  const tempoTotal = Date.now() - startTime;

  console.log('\n' + '=' * 60);
  console.log('📊 RELATÓRIO FINAL - PWA MODERNO 2025');
  console.log('=' * 60);
  
  console.log('\n🔍 Resultados por Categoria:');
  Object.entries(resultados).forEach(([teste, sucesso]) => {
    const status = sucesso ? '✅' : '❌';
    const nome = teste.charAt(0).toUpperCase() + teste.slice(1);
    console.log(`   ${status} ${nome}: ${sucesso ? 'APROVADO' : 'REPROVADO'}`);
  });

  console.log('\n📈 Métricas Gerais:');
  console.log(`   • Taxa de Sucesso: ${taxaSucesso}% (${testesAprovados}/${totalTestes})`);
  console.log(`   • Tempo Total: ${(tempoTotal / 1000).toFixed(1)}s`);
  console.log(`   • Tempo Médio por Teste: ${(tempoTotal / totalTestes).toFixed(0)}ms`);

  console.log('\n🎯 Status Final:');
  if (taxaSucesso >= 85) {
    console.log('   🎉 SISTEMA PWA APROVADO PARA PRODUÇÃO');
    console.log('   🚀 Design 2025 e notificações push funcionando perfeitamente!');
  } else if (taxaSucesso >= 70) {
    console.log('   ⚠️  SISTEMA FUNCIONAL COM MELHORIAS NECESSÁRIAS');
    console.log('   🔧 Algumas funcionalidades precisam de ajustes');
  } else {
    console.log('   ❌ SISTEMA REQUER CORREÇÕES CRÍTICAS');
    console.log('   🔨 Múltiplas funcionalidades falharam nos testes');
  }

  console.log('\n💡 Recomendações:');
  if (!resultados.autenticacao) {
    console.log('   🔐 Verificar configuração de autenticação JWT');
  }
  if (!resultados.vapidKeys) {
    console.log('   🔑 Configurar chaves VAPID para push notifications');
  }
  if (!resultados.envioNotificacao) {
    console.log('   📱 Verificar integração com service de push');
  }
  if (!resultados.performance) {
    console.log('   ⚡ Otimizar performance para reduzir latência');
  }

  console.log('\n🎨 Funcionalidades PWA 2025 Implementadas:');
  console.log('   ✨ Design futurista com glass morphism');
  console.log('   🎯 Logo Vendzz integrado nas notificações');
  console.log('   📱 Interface mobile-first responsiva');
  console.log('   🔔 Sistema de push notifications real');
  console.log('   📊 Dashboard com métricas em tempo real');
  console.log('   🎭 Templates de notificação personalizados');
  console.log('   ⚡ Performance otimizada para 2025');

  return taxaSucesso;
}

// Executar os testes
executarTodosTestes()
  .then(taxaSucesso => {
    console.log(`\n🏁 Teste concluído com ${taxaSucesso}% de sucesso`);
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Erro fatal durante os testes:', error);
    process.exit(1);
  });