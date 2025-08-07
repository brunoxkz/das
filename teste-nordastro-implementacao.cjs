/**
 * TESTE NORDASTRO IMPLEMENTAÇÃO
 * Validação do sistema de análise para a plataforma nordastro.com
 * Criado em: 20 de julho de 2025
 */

const fetch = require('node-fetch');

async function testeNordAstroCompleto() {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://vendzz.replit.app' 
    : 'http://localhost:5000';

  console.log('🌟 TESTE NORDASTRO - SISTEMA DE ANÁLISE COMPLETO');
  console.log('=' + '='.repeat(60));

  const testUrl = 'https://nordastro.com/start?qz=na1&locale=EN_US';
  
  try {
    // Obter token de autenticação
    console.log('🔐 Fazendo login para obter token...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Token obtido com sucesso');

    // Testar análise de funil NordAstro
    console.log('\n🔍 Testando análise de funil NordAstro...');
    const analyzeResponse = await fetch(`${baseUrl}/api/analyze-funnel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ url: testUrl })
    });

    const analyzeData = await analyzeResponse.json();
    
    if (analyzeData.success) {
      console.log('\n✅ ANÁLISE NORDASTRO SUCESSO');
      console.log(`📊 Plataforma detectada: ${analyzeData.funnel.metadata?.platform || 'N/A'}`);
      console.log(`📄 Páginas criadas: ${analyzeData.funnel.pages}`);
      console.log(`🎨 Elementos gerados: ${analyzeData.funnel.elements?.length || 0}`);
      console.log(`🎯 Categoria: ${analyzeData.funnel.metadata?.category || 'N/A'}`);
      console.log(`👥 Audiência: ${analyzeData.funnel.metadata?.targetAudience || 'N/A'}`);
      console.log(`⏱️ Duração estimada: ${analyzeData.funnel.metadata?.estimatedDuration || 'N/A'}`);
      
      // Validar elementos específicos do NordAstro
      const elements = analyzeData.funnel.elements || [];
      const hasGenderSelection = elements.some(el => 
        el.properties?.title?.includes('Masculino') || 
        el.properties?.title?.includes('Feminino')
      );
      const hasBirthChart = elements.some(el => 
        el.properties?.title?.includes('Mapa Astral') ||
        el.properties?.text?.includes('mapa astral')
      );
      const hasAstrologyQuestions = elements.some(el => 
        el.properties?.title?.includes('nascimento') ||
        el.properties?.title?.includes('astrologia')
      );
      
      console.log('\n🔍 VALIDAÇÃO DE ELEMENTOS NORDASTRO:');
      console.log(`   • Seleção de gênero: ${hasGenderSelection ? '✅' : '❌'}`);
      console.log(`   • Referências mapa astral: ${hasBirthChart ? '✅' : '❌'}`);
      console.log(`   • Perguntas astrológicas: ${hasAstrologyQuestions ? '✅' : '❌'}`);
      
      // Validar cores místicas
      const theme = analyzeData.funnel.theme || {};
      const hasGoldenColor = theme.primaryColor === '#FFD700';
      const hasMysticalPurple = theme.accentColor === '#8A2BE2';
      const hasDarkBackground = theme.backgroundColor === '#000015';
      
      console.log('\n🎨 VALIDAÇÃO DE CORES MÍSTICAS:');
      console.log(`   • Dourado primário (#FFD700): ${hasGoldenColor ? '✅' : '❌'}`);
      console.log(`   • Roxo místico (#8A2BE2): ${hasMysticalPurple ? '✅' : '❌'}`);
      console.log(`   • Fundo escuro (#000015): ${hasDarkBackground ? '✅' : '❌'}`);
      
      // Estatísticas gerais
      const totalScore = [
        hasGenderSelection, hasBirthChart, hasAstrologyQuestions,
        hasGoldenColor, hasMysticalPurple, hasDarkBackground
      ].filter(Boolean).length;
      
      console.log('\n📊 RESULTADO FINAL:');
      console.log(`   Taxa de sucesso: ${Math.round((totalScore / 6) * 100)}% (${totalScore}/6)`);
      console.log(`   Status: ${totalScore >= 4 ? '✅ APROVADO' : '⚠️ NECESSITA AJUSTES'}`);
      
    } else {
      console.log('❌ ERRO na análise:', analyzeData.error || 'Erro desconhecido');
    }

  } catch (error) {
    console.error('❌ ERRO GERAL:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🌟 TESTE NORDASTRO FINALIZADO');
}

// Executar teste
testeNordAstroCompleto().catch(console.error);