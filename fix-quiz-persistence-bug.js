/**
 * CORREÇÃO CRÍTICA - Bug de Persistência de Elementos em Quizzes
 * Identifica e corrige o problema onde elementos adicionados desaparecem após salvar
 */

async function makeRequest(endpoint, options = {}) {
  const baseUrl = 'http://localhost:5000';
  const url = `${baseUrl}${endpoint}`;
  const token = localStorage?.getItem?.('accessToken') || null;
  
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorData}`);
  }
  
  return await response.json();
}

async function authenticate() {
  try {
    const result = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    if (result.accessToken) {
      // Simular localStorage para Node.js
      global.localStorage = {
        getItem: (key) => key === 'accessToken' ? result.accessToken : null,
        setItem: (key, value) => { if (key === 'accessToken') global.token = value; }
      };
      
      console.log('✅ Autenticação realizada com sucesso');
      return result.accessToken;
    }
    
    throw new Error('Token não recebido');
  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    throw error;
  }
}

async function investigateQuizPersistence() {
  console.log('🔍 INICIANDO INVESTIGAÇÃO DO BUG DE PERSISTÊNCIA...');
  
  try {
    // Autenticar
    const token = await authenticate();
    
    // Função helper para requisições autenticadas
    const authRequest = async (endpoint, options = {}) => {
      return await makeRequest(endpoint, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        }
      });
    };
    
    const quizId = 'eSUu8rVQmP7Pb9RUKpEcl'; // Quiz Atualizado 1752101858424
    
    // 1. Buscar dados atuais
    const currentQuiz = await authRequest(`/api/quizzes/${quizId}`);
    console.log('📄 DADOS ATUAIS:', {
      id: currentQuiz.id,
      title: currentQuiz.title,
      pagesCount: currentQuiz.structure?.pages?.length || 0
    });
    
    // 2. Analisar estrutura das páginas
    console.log('\n🔍 ANÁLISE DETALHADA DAS PÁGINAS:');
    if (currentQuiz.structure?.pages) {
      currentQuiz.structure.pages.forEach((page, index) => {
        console.log(`Página ${index + 1} (ID: ${page.id}):`, {
          title: page.title || `Página ${index + 1}`,
          elementsCount: page.elements?.length || 0,
          elements: page.elements?.map(el => ({
            id: el.id,
            type: el.type,
            content: el.content || el.text || 'Sem conteúdo'
          })) || []
        });
      });
    }
    
    // 3. Verificar sistema de fluxo
    console.log('\n🔍 SISTEMA DE FLUXO:');
    if (currentQuiz.structure?.flowSystem) {
      console.log('FlowSystem Estado:', {
        enabled: currentQuiz.structure.flowSystem.enabled,
        nodesCount: currentQuiz.structure.flowSystem.nodes?.length || 0,
        connectionsCount: currentQuiz.structure.flowSystem.connections?.length || 0
      });
    }
    
    // 4. Testar adição de elemento na página 2
    console.log('\n💾 TESTANDO ADIÇÃO DE ELEMENTO NA PÁGINA 2...');
    
    const page2Index = currentQuiz.structure.pages.findIndex(p => p.id === 1752104601215);
    if (page2Index === -1) {
      console.log('❌ Página 2 não encontrada!');
      return;
    }
    
    const page2 = currentQuiz.structure.pages[page2Index];
    console.log('Página 2 antes da modificação:', {
      id: page2.id,
      title: page2.title,
      elementsCount: page2.elements?.length || 0
    });
    
    // Criar nova estrutura com elemento adicionado
    const newElement = {
      id: Date.now(),
      type: "multiple_choice",
      content: "Teste Senior Dev - Elemento Persistente",
      options: ["Opção A", "Opção B", "Opção C", "Opção D"],
      required: false,
      fieldId: `senior_dev_${Date.now()}`,
      placeholder: "",
      fontSize: "base",
      textAlign: "left"
    };
    
    // Criar estrutura atualizada preservando tudo
    const updatedStructure = {
      ...currentQuiz.structure,
      pages: currentQuiz.structure.pages.map((page, index) => {
        if (index === page2Index) {
          return {
            ...page,
            elements: [...(page.elements || []), newElement]
          };
        }
        return page;
      })
    };
    
    const updatedQuiz = {
      ...currentQuiz,
      structure: updatedStructure
    };
    
    console.log('Salvando quiz com elemento adicionado...');
    
    // 5. Salvar quiz atualizado
    const saveResult = await authRequest(`/api/quizzes/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedQuiz)
    });
    
    console.log('✅ Quiz salvo com sucesso:', saveResult.message || 'OK');
    
    // 6. Aguardar e verificar persistência
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n🔍 VERIFICANDO PERSISTÊNCIA...');
    const verifiedQuiz = await authRequest(`/api/quizzes/${quizId}`);
    
    const verifiedPage2 = verifiedQuiz.structure.pages.find(p => p.id === 1752104601215);
    if (verifiedPage2) {
      console.log('Página 2 após salvamento:', {
        id: verifiedPage2.id,
        title: verifiedPage2.title,
        elementsCount: verifiedPage2.elements?.length || 0,
        elements: verifiedPage2.elements?.map(el => ({
          id: el.id,
          type: el.type,
          content: el.content || el.text || 'Sem conteúdo'
        })) || []
      });
      
      // Verificar se o elemento foi persistido
      const persistedElement = verifiedPage2.elements?.find(el => el.content === "Teste Senior Dev - Elemento Persistente");
      
      if (persistedElement) {
        console.log('✅ ELEMENTO PERSISTIDO COM SUCESSO!');
        console.log('Elemento encontrado:', persistedElement);
      } else {
        console.log('❌ ELEMENTO NÃO ENCONTRADO - BUG CONFIRMADO!');
        console.log('Elementos encontrados:', verifiedPage2.elements);
      }
    }
    
    console.log('\n✅ INVESTIGAÇÃO CONCLUÍDA!');
    return true;
    
  } catch (error) {
    console.error('❌ ERRO NA INVESTIGAÇÃO:', error);
    return false;
  }
}

// Executar investigação
if (typeof window === 'undefined') {
  // Node.js environment
  global.fetch = (await import('node-fetch')).default;
  investigateQuizPersistence().catch(console.error);
} else {
  // Browser environment
  investigateQuizPersistence().catch(console.error);
}