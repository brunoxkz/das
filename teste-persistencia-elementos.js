/**
 * TESTE DE PERSISTÊNCIA DE ELEMENTOS - Validação das correções aplicadas
 * Verifica se os elementos adicionados ao quiz persistem após salvamento
 */

async function testePersistenciaElementos() {
  console.log('🔍 INICIANDO TESTE DE PERSISTÊNCIA DE ELEMENTOS...');
  
  const baseUrl = 'http://localhost:5000';
  let token = null;
  
  // Função para fazer requisições autenticadas
  const makeRequest = async (endpoint, options = {}) => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
    
    return await response.json();
  };
  
  try {
    // 1. Autenticação
    console.log('🔐 Fazendo autenticação...');
    const authResult = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    token = authResult.accessToken;
    console.log('✅ Autenticação realizada com sucesso');
    
    // 2. Buscar quiz de teste
    const quizId = 'eSUu8rVQmP7Pb9RUKpEcl'; // Quiz Atualizado 1752101858424
    console.log('📄 Buscando quiz:', quizId);
    
    const currentQuiz = await makeRequest(`/api/quizzes/${quizId}`);
    console.log('Quiz carregado:', {
      id: currentQuiz.id,
      title: currentQuiz.title,
      pagesCount: currentQuiz.structure?.pages?.length || 0
    });
    
    // 3. Verificar página 2 (ID: 1752104601215)
    const page2 = currentQuiz.structure?.pages?.find(p => p.id === 1752104601215);
    if (!page2) {
      throw new Error('Página 2 não encontrada no quiz');
    }
    
    console.log('📋 Página 2 antes da modificação:', {
      id: page2.id,
      title: page2.title,
      elementsCount: page2.elements?.length || 0,
      elementos: page2.elements?.map(el => ({
        id: el.id,
        type: el.type,
        content: el.content
      })) || []
    });
    
    // 4. Adicionar elemento de teste
    const novoElemento = {
      id: Date.now(),
      type: "text",
      content: "Campo de teste - Persistência validada",
      required: true,
      fieldId: `teste_persistencia_${Date.now()}`,
      placeholder: "Digite sua resposta aqui",
      fontSize: "base",
      textAlign: "left"
    };
    
    console.log('➕ Adicionando elemento de teste:', {
      id: novoElemento.id,
      type: novoElemento.type,
      content: novoElemento.content
    });
    
    // 5. Criar estrutura atualizada
    const estruturaAtualizada = {
      ...currentQuiz.structure,
      pages: currentQuiz.structure.pages.map(page => {
        if (page.id === 1752104601215) {
          return {
            ...page,
            elements: [...(page.elements || []), novoElemento]
          };
        }
        return page;
      })
    };
    
    // 6. Salvar quiz com novo elemento
    console.log('💾 Salvando quiz com elemento adicionado...');
    
    const quizAtualizado = {
      ...currentQuiz,
      structure: estruturaAtualizada
    };
    
    await makeRequest(`/api/quizzes/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify(quizAtualizado)
    });
    
    console.log('✅ Quiz salvo com sucesso!');
    
    // 7. Aguardar processamento
    console.log('⏳ Aguardando processamento (3 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 8. Verificar persistência
    console.log('🔍 Verificando persistência...');
    
    const quizVerificado = await makeRequest(`/api/quizzes/${quizId}`);
    const page2Verificada = quizVerificado.structure?.pages?.find(p => p.id === 1752104601215);
    
    if (!page2Verificada) {
      throw new Error('Página 2 não encontrada após salvamento');
    }
    
    console.log('📋 Página 2 após salvamento:', {
      id: page2Verificada.id,
      title: page2Verificada.title,
      elementsCount: page2Verificada.elements?.length || 0,
      elementos: page2Verificada.elements?.map(el => ({
        id: el.id,
        type: el.type,
        content: el.content
      })) || []
    });
    
    // 9. Verificar se o elemento foi persistido
    const elementoPersistido = page2Verificada.elements?.find(
      el => el.id === novoElemento.id && el.content === novoElemento.content
    );
    
    if (elementoPersistido) {
      console.log('✅ TESTE APROVADO! Elemento persistido com sucesso:');
      console.log('Elemento encontrado:', {
        id: elementoPersistido.id,
        type: elementoPersistido.type,
        content: elementoPersistido.content,
        fieldId: elementoPersistido.fieldId
      });
      
      // Contagem final
      const totalElementos = quizVerificado.structure.pages.reduce(
        (sum, p) => sum + (p.elements?.length || 0), 0
      );
      
      console.log('📊 RESUMO DO TESTE:');
      console.log('- Quiz ID:', quizId);
      console.log('- Páginas:', quizVerificado.structure.pages.length);
      console.log('- Total de elementos:', totalElementos);
      console.log('- Elemento de teste persistido: ✅');
      console.log('- Status: APROVADO');
      
      return true;
    } else {
      console.log('❌ TESTE FALHOU! Elemento não foi persistido');
      console.log('Elementos encontrados na página 2:', page2Verificada.elements);
      return false;
    }
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
    return false;
  }
}

// Executar o teste
testePersistenciaElementos()
  .then(success => {
    console.log('\n' + '='.repeat(60));
    console.log(success ? '✅ TESTE CONCLUÍDO COM SUCESSO!' : '❌ TESTE FALHOU!');
    console.log('='.repeat(60));
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ ERRO CRÍTICO:', error);
    process.exit(1);
  });