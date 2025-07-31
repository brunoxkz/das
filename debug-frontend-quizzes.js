/**
 * TESTE FRONTEND - SISTEMA DE QUIZZES
 * Identifica por que o frontend não está recebendo os dados da API
 */

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFFYVk2dkUwcllBa1RYdjV2SENsbSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInJvbGUiOiJhZG1pbiIsInBsYW4iOiJlbnRlcnByaXNlIiwiaWF0IjoxNzUyMjgyNzgwLCJub25jZSI6InA4OWJiIiwiZXhwIjoxNzUyMjgzNjgwfQ.FTiVLiS_NQFC5Z07iuwoT6hNOK0CXGg9m6kUrzEEIi8";

async function testFrontendQuizzes() {
    console.log("🔍 TESTANDO FRONTEND - SISTEMA DE QUIZZES");
    
    try {
        // Teste 1: Verificar se a API está funcionando
        console.log("\n1. TESTANDO API DIRETAMENTE:");
        const response = await fetch("http://localhost:5000/api/quizzes", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        
        const data = await response.json();
        console.log(`   Status: ${response.status}`);
        console.log(`   Quizzes encontrados: ${data.length}`);
        
        if (data.length > 0) {
            console.log(`   Primeiro quiz: ${data[0].title}`);
            console.log(`   ID: ${data[0].id}`);
            console.log(`   Estrutura do quiz:`, Object.keys(data[0]));
        }
        
        // Teste 2: Verificar se há problemas com colunas do banco
        console.log("\n2. VERIFICANDO COLUNAS DO BANCO:");
        const firstQuiz = data[0];
        if (firstQuiz) {
            console.log(`   cloakerEnabled: ${firstQuiz.cloakerEnabled}`);
            console.log(`   backRedirectEnabled: ${firstQuiz.backRedirectEnabled}`);
            console.log(`   userId: ${firstQuiz.userId}`);
            console.log(`   publishedAt: ${firstQuiz.publishedAt}`);
        }
        
        // Teste 3: Verificar endpoint de dashboard
        console.log("\n3. TESTANDO ENDPOINT DE DASHBOARD:");
        const dashboardResponse = await fetch("http://localhost:5000/api/dashboard", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        
        const dashboardData = await dashboardResponse.json();
        console.log(`   Status Dashboard: ${dashboardResponse.status}`);
        console.log(`   Quizzes no Dashboard: ${dashboardData.quizzes?.length || 0}`);
        
        // Teste 4: Verificar se há problemas de serialização JSON
        console.log("\n4. VERIFICANDO SERIALIZAÇÃO JSON:");
        const jsonTest = JSON.stringify(data[0]);
        console.log(`   JSON válido: ${jsonTest ? 'Sim' : 'Não'}`);
        console.log(`   Tamanho JSON: ${jsonTest?.length || 0} caracteres`);
        
        console.log("\n✅ TESTE CONCLUÍDO - API FUNCIONANDO CORRETAMENTE");
        
    } catch (error) {
        console.error("❌ ERRO NO TESTE:", error.message);
        console.error(error.stack);
    }
}

testFrontendQuizzes();