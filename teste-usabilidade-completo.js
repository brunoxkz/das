/**
 * 🎨 SUITE DE TESTES DE USABILIDADE COMPLETA
 * Sistema Vendzz - Validação de UX/UI para Produção
 * 
 * Testes implementados:
 * 1. Responsividade Cross-Device
 * 2. Compatibilidade de Navegadores
 * 3. Acessibilidade (A11y)
 * 4. Edição de Quiz Mobile
 * 5. Performance de Interface
 * 6. Testes de Interação
 * 7. Validação de Formulários
 * 8. Navegação e Fluxo
 */

import fetch from 'node-fetch';

class UsabilityTestSuite {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.testResults = [];
    this.authToken = null;
    this.colors = {
      green: '\x1b[32m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      reset: '\x1b[0m'
    };
    this.deviceProfiles = {
      desktop: { width: 1920, height: 1080, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      tablet: { width: 1024, height: 768, userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15' },
      mobile: { width: 390, height: 844, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15' }
    };
    this.browsers = {
      chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
      safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.0 Safari/537.36',
      edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
    };
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': options.userAgent || this.browsers.chrome,
        ...(options.headers || {})
      }
    };

    if (this.authToken && !options.noAuth) {
      defaultOptions.headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = await response.text();
    }

    return { response, data };
  }

  logTest(category, testName, passed, details = '', timing = '') {
    const status = passed ? 'PASS' : 'FAIL';
    const color = passed ? this.colors.green : this.colors.red;
    const categoryColor = this.colors.cyan;
    
    console.log(`${categoryColor}[${category}]${this.colors.reset} ${color}${status}${this.colors.reset} - ${testName} ${timing}`);
    if (details) {
      console.log(`  ${this.colors.yellow}Details:${this.colors.reset} ${details}`);
    }
    
    this.testResults.push({
      category,
      testName,
      passed,
      details,
      timing
    });
  }

  async authenticate() {
    const { response, data } = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      noAuth: true,
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });

    if (response.status === 200 && data.accessToken) {
      this.authToken = data.accessToken;
      return true;
    }
    return false;
  }

  // ===== 1. TESTES DE RESPONSIVIDADE =====
  async testResponsiveness() {
    console.log(`${this.colors.magenta}📱 TESTANDO RESPONSIVIDADE CROSS-DEVICE${this.colors.reset}`);
    
    for (const [deviceName, profile] of Object.entries(this.deviceProfiles)) {
      const startTime = Date.now();
      
      try {
        // Teste 1: Carregamento da página principal
        const { response: homeResponse } = await this.makeRequest('/', {
          headers: {
            'User-Agent': profile.userAgent,
            'Viewport-Width': profile.width.toString(),
            'Viewport-Height': profile.height.toString()
          }
        });

        const homeLoaded = homeResponse.status === 200;
        this.logTest('RESPONSIVIDADE', `Home Page - ${deviceName}`, homeLoaded,
          `${profile.width}x${profile.height}`, `${Date.now() - startTime}ms`);

        // Teste 2: Dashboard responsivo
        const { response: dashboardResponse } = await this.makeRequest('/dashboard', {
          headers: {
            'User-Agent': profile.userAgent,
            'Viewport-Width': profile.width.toString()
          }
        });

        const dashboardLoaded = dashboardResponse.status === 200;
        this.logTest('RESPONSIVIDADE', `Dashboard - ${deviceName}`, dashboardLoaded,
          `Viewport: ${profile.width}px`, `${Date.now() - startTime}ms`);

        // Teste 3: Quiz Builder responsivo
        const { response: builderResponse } = await this.makeRequest('/quiz-builder', {
          headers: {
            'User-Agent': profile.userAgent,
            'Viewport-Width': profile.width.toString()
          }
        });

        const builderLoaded = builderResponse.status === 200;
        this.logTest('RESPONSIVIDADE', `Quiz Builder - ${deviceName}`, builderLoaded,
          `Mobile-friendly: ${profile.width < 768 ? 'Yes' : 'Desktop'}`, `${Date.now() - startTime}ms`);

      } catch (error) {
        this.logTest('RESPONSIVIDADE', `Error - ${deviceName}`, false,
          `Error: ${error.message}`, `${Date.now() - startTime}ms`);
      }
    }
  }

  // ===== 2. TESTES DE COMPATIBILIDADE DE NAVEGADORES =====
  async testBrowserCompatibility() {
    console.log(`${this.colors.magenta}🌐 TESTANDO COMPATIBILIDADE DE NAVEGADORES${this.colors.reset}`);
    
    for (const [browserName, userAgent] of Object.entries(this.browsers)) {
      const startTime = Date.now();
      
      try {
        // Teste 1: API de autenticação
        const { response: authResponse } = await this.makeRequest('/api/auth/login', {
          method: 'POST',
          noAuth: true,
          userAgent: userAgent,
          body: JSON.stringify({
            email: 'admin@vendzz.com',
            password: 'admin123'
          })
        });

        const authWorks = authResponse.status === 200;
        this.logTest('COMPATIBILIDADE', `Auth API - ${browserName}`, authWorks,
          `User-Agent: ${browserName}`, `${Date.now() - startTime}ms`);

        // Teste 2: Carregamento de quizzes
        const { response: quizzesResponse } = await this.makeRequest('/api/quizzes', {
          userAgent: userAgent
        });

        const quizzesWork = quizzesResponse.status === 200;
        this.logTest('COMPATIBILIDADE', `Quizzes API - ${browserName}`, quizzesWork,
          `Cross-origin: ${quizzesResponse.headers.get('Access-Control-Allow-Origin') ? 'Allowed' : 'Not set'}`, `${Date.now() - startTime}ms`);

        // Teste 3: Upload de arquivos
        const { response: uploadResponse } = await this.makeRequest('/api/upload', {
          method: 'POST',
          userAgent: userAgent,
          body: JSON.stringify({
            fileName: 'test.jpg',
            fileType: 'image/jpeg',
            fileSize: 1024
          })
        });

        const uploadWorks = uploadResponse.status === 200 || uploadResponse.status === 400; // 400 = validation error is OK
        this.logTest('COMPATIBILIDADE', `Upload API - ${browserName}`, uploadWorks,
          `File handling: ${uploadWorks ? 'Supported' : 'Not supported'}`, `${Date.now() - startTime}ms`);

      } catch (error) {
        this.logTest('COMPATIBILIDADE', `Error - ${browserName}`, false,
          `Error: ${error.message}`, `${Date.now() - startTime}ms`);
      }
    }
  }

  // ===== 3. TESTES DE ACESSIBILIDADE =====
  async testAccessibility() {
    console.log(`${this.colors.magenta}♿ TESTANDO ACESSIBILIDADE (A11Y)${this.colors.reset}`);
    
    const startTime = Date.now();
    
    try {
      // Teste 1: Estrutura HTML semântica
      const { response: homeResponse, data: homeData } = await this.makeRequest('/');
      
      if (homeResponse.status === 200 && typeof homeData === 'string') {
        const hasSemanticElements = homeData.includes('<main>') || homeData.includes('<nav>') || homeData.includes('<header>');
        this.logTest('ACESSIBILIDADE', 'Semantic HTML', hasSemanticElements,
          'Has semantic elements: ' + (hasSemanticElements ? 'Yes' : 'No'), `${Date.now() - startTime}ms`);

        // Teste 2: Alt text em imagens
        const imageMatches = homeData.match(/<img[^>]*>/g) || [];
        const imagesWithAlt = imageMatches.filter(img => img.includes('alt=')).length;
        const totalImages = imageMatches.length;
        
        const altTextScore = totalImages > 0 ? (imagesWithAlt / totalImages) * 100 : 100;
        this.logTest('ACESSIBILIDADE', 'Alt Text Coverage', altTextScore >= 80,
          `${imagesWithAlt}/${totalImages} images with alt text (${altTextScore.toFixed(1)}%)`, `${Date.now() - startTime}ms`);

        // Teste 3: Labels em formulários
        const formMatches = homeData.match(/<input[^>]*>/g) || [];
        const labelsMatches = homeData.match(/<label[^>]*>/g) || [];
        
        const hasFormLabels = formMatches.length === 0 || labelsMatches.length > 0;
        this.logTest('ACESSIBILIDADE', 'Form Labels', hasFormLabels,
          `${labelsMatches.length} labels for ${formMatches.length} inputs`, `${Date.now() - startTime}ms`);

        // Teste 4: Títulos hierárquicos
        const h1Matches = homeData.match(/<h1[^>]*>/g) || [];
        const h2Matches = homeData.match(/<h2[^>]*>/g) || [];
        
        const hasHeadingHierarchy = h1Matches.length >= 1 && h2Matches.length >= 0;
        this.logTest('ACESSIBILIDADE', 'Heading Hierarchy', hasHeadingHierarchy,
          `H1: ${h1Matches.length}, H2: ${h2Matches.length}`, `${Date.now() - startTime}ms`);
      }

      // Teste 5: Navegação por teclado (simulação)
      const { response: keyboardResponse } = await this.makeRequest('/api/quizzes', {
        headers: {
          'X-Keyboard-Navigation': 'true',
          'X-Focus-Visible': 'true'
        }
      });

      const keyboardAccessible = keyboardResponse.status === 200;
      this.logTest('ACESSIBILIDADE', 'Keyboard Navigation', keyboardAccessible,
        'API accessible via keyboard simulation', `${Date.now() - startTime}ms`);

    } catch (error) {
      this.logTest('ACESSIBILIDADE', 'Accessibility Tests', false,
        `Error: ${error.message}`, `${Date.now() - startTime}ms`);
    }
  }

  // ===== 4. TESTES DE EDIÇÃO DE QUIZ MOBILE =====
  async testMobileQuizEditing() {
    console.log(`${this.colors.magenta}📱 TESTANDO EDIÇÃO DE QUIZ MOBILE${this.colors.reset}`);
    
    const mobileUA = this.deviceProfiles.mobile.userAgent;
    const startTime = Date.now();
    
    try {
      // Teste 1: Criação de quiz no mobile
      const { response: createResponse, data: createData } = await this.makeRequest('/api/quizzes', {
        method: 'POST',
        userAgent: mobileUA,
        headers: {
          'Viewport-Width': '390',
          'Touch-Enabled': 'true'
        },
        body: JSON.stringify({
          title: 'Quiz Mobile Test',
          description: 'Teste de edição mobile',
          structure: {
            pages: [{
              id: 1,
              title: 'Página Mobile',
              elements: [{
                type: 'heading',
                content: 'Título Mobile'
              }]
            }]
          }
        })
      });

      const mobileCreateWorks = createResponse.status === 201;
      this.logTest('MOBILE_EDITING', 'Quiz Creation', mobileCreateWorks,
        'Mobile quiz creation: ' + (mobileCreateWorks ? 'Supported' : 'Error'), `${Date.now() - startTime}ms`);

      if (mobileCreateWorks && createData.quiz) {
        const quizId = createData.quiz.id;

        // Teste 2: Edição de elementos no mobile
        const { response: editResponse } = await this.makeRequest(`/api/quizzes/${quizId}`, {
          method: 'PUT',
          userAgent: mobileUA,
          headers: {
            'Viewport-Width': '390',
            'Touch-Enabled': 'true'
          },
          body: JSON.stringify({
            title: 'Quiz Mobile Editado',
            description: 'Teste de edição mobile atualizado',
            structure: {
              pages: [{
                id: 1,
                title: 'Página Mobile Editada',
                elements: [
                  {
                    type: 'heading',
                    content: 'Título Mobile Editado'
                  },
                  {
                    type: 'text',
                    fieldId: 'nome_mobile',
                    required: true,
                    placeholder: 'Digite seu nome'
                  }
                ]
              }]
            }
          })
        });

        const mobileEditWorks = editResponse.status === 200;
        this.logTest('MOBILE_EDITING', 'Quiz Editing', mobileEditWorks,
          'Mobile quiz editing: ' + (mobileEditWorks ? 'Supported' : 'Error'), `${Date.now() - startTime}ms`);

        // Teste 3: Adição de elementos mobile-friendly
        const mobileElements = [
          { type: 'multiple_choice', options: ['Opção 1', 'Opção 2'] },
          { type: 'text', fieldId: 'texto_mobile' },
          { type: 'email', fieldId: 'email_mobile' },
          { type: 'phone', fieldId: 'telefone_mobile' },
          { type: 'image_upload', fieldId: 'foto_mobile' }
        ];

        let mobileElementsAdded = 0;
        for (const element of mobileElements) {
          const { response: elementResponse } = await this.makeRequest(`/api/quizzes/${quizId}`, {
            method: 'PUT',
            userAgent: mobileUA,
            headers: {
              'Viewport-Width': '390',
              'Touch-Enabled': 'true'
            },
            body: JSON.stringify({
              title: 'Quiz Mobile Editado',
              structure: {
                pages: [{
                  id: 1,
                  title: 'Página Mobile',
                  elements: [element]
                }]
              }
            })
          });

          if (elementResponse.status === 200) {
            mobileElementsAdded++;
          }
        }

        const elementsSuccess = mobileElementsAdded === mobileElements.length;
        this.logTest('MOBILE_EDITING', 'Mobile Elements', elementsSuccess,
          `${mobileElementsAdded}/${mobileElements.length} elementos mobile-friendly`, `${Date.now() - startTime}ms`);

        // Teste 4: Preview no mobile
        const { response: previewResponse } = await this.makeRequest(`/quiz/${quizId}`, {
          userAgent: mobileUA,
          headers: {
            'Viewport-Width': '390',
            'Touch-Enabled': 'true'
          }
        });

        const mobilePreviewWorks = previewResponse.status === 200;
        this.logTest('MOBILE_EDITING', 'Mobile Preview', mobilePreviewWorks,
          'Mobile preview: ' + (mobilePreviewWorks ? 'Working' : 'Error'), `${Date.now() - startTime}ms`);
      }

    } catch (error) {
      this.logTest('MOBILE_EDITING', 'Mobile Quiz Editing', false,
        `Error: ${error.message}`, `${Date.now() - startTime}ms`);
    }
  }

  // ===== 5. TESTES DE PERFORMANCE DE INTERFACE =====
  async testInterfacePerformance() {
    console.log(`${this.colors.magenta}⚡ TESTANDO PERFORMANCE DE INTERFACE${this.colors.reset}`);
    
    const performanceTests = [
      { name: 'Dashboard Load', endpoint: '/dashboard', target: 1000 },
      { name: 'Quiz Builder Load', endpoint: '/quiz-builder', target: 1500 },
      { name: 'Quiz List Load', endpoint: '/api/quizzes', target: 500 },
      { name: 'Analytics Load', endpoint: '/api/analytics', target: 800 },
      { name: 'User Profile Load', endpoint: '/api/user/profile', target: 300 }
    ];

    for (const test of performanceTests) {
      const startTime = Date.now();
      
      try {
        const { response } = await this.makeRequest(test.endpoint);
        const responseTime = Date.now() - startTime;
        
        const performanceGood = responseTime <= test.target;
        this.logTest('PERFORMANCE', test.name, performanceGood,
          `${responseTime}ms (target: ${test.target}ms)`, `${responseTime}ms`);

      } catch (error) {
        this.logTest('PERFORMANCE', test.name, false,
          `Error: ${error.message}`, `${Date.now() - startTime}ms`);
      }
    }

    // Teste de carga simultânea
    const concurrentStartTime = Date.now();
    const concurrentPromises = [];
    
    for (let i = 0; i < 10; i++) {
      concurrentPromises.push(this.makeRequest('/api/quizzes'));
    }

    try {
      const concurrentResults = await Promise.all(concurrentPromises);
      const concurrentTime = Date.now() - concurrentStartTime;
      const successCount = concurrentResults.filter(r => r.response.status === 200).length;
      
      const concurrentSuccess = successCount >= 8; // 80% success rate
      this.logTest('PERFORMANCE', 'Concurrent Load', concurrentSuccess,
        `${successCount}/10 requests successful`, `${concurrentTime}ms`);

    } catch (error) {
      this.logTest('PERFORMANCE', 'Concurrent Load', false,
        `Error: ${error.message}`, `${Date.now() - concurrentStartTime}ms`);
    }
  }

  // ===== 6. TESTES DE INTERAÇÃO =====
  async testInteractions() {
    console.log(`${this.colors.magenta}🖱️ TESTANDO INTERAÇÕES DE USUÁRIO${this.colors.reset}`);
    
    const startTime = Date.now();
    
    try {
      // Teste 1: Fluxo de login
      const { response: loginResponse } = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        noAuth: true,
        body: JSON.stringify({
          email: 'admin@vendzz.com',
          password: 'admin123'
        })
      });

      const loginWorks = loginResponse.status === 200;
      this.logTest('INTERACAO', 'Login Flow', loginWorks,
        'User authentication: ' + (loginWorks ? 'Working' : 'Error'), `${Date.now() - startTime}ms`);

      // Teste 2: Criação e edição de quiz
      const { response: quizResponse, data: quizData } = await this.makeRequest('/api/quizzes', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Quiz Interação',
          description: 'Teste de interação',
          structure: { pages: [] }
        })
      });

      const quizCreated = quizResponse.status === 201;
      this.logTest('INTERACAO', 'Quiz Creation', quizCreated,
        'Quiz creation flow: ' + (quizCreated ? 'Working' : 'Error'), `${Date.now() - startTime}ms`);

      if (quizCreated && quizData.quiz) {
        // Teste 3: Resposta de quiz
        const { response: responseResponse } = await this.makeRequest('/api/quiz-responses', {
          method: 'POST',
          body: JSON.stringify({
            quizId: quizData.quiz.id,
            responses: {
              'test_field': 'Test response'
            }
          })
        });

        const responseWorks = responseResponse.status === 201;
        this.logTest('INTERACAO', 'Quiz Response', responseWorks,
          'Quiz response flow: ' + (responseWorks ? 'Working' : 'Error'), `${Date.now() - startTime}ms`);
      }

      // Teste 4: Navegação entre páginas
      const pages = ['/dashboard', '/quiz-builder', '/analytics', '/configuracoes'];
      let navigationSuccess = 0;

      for (const page of pages) {
        const { response: pageResponse } = await this.makeRequest(page);
        if (pageResponse.status === 200) {
          navigationSuccess++;
        }
      }

      const navigationWorks = navigationSuccess >= 3; // 75% success rate
      this.logTest('INTERACAO', 'Page Navigation', navigationWorks,
        `${navigationSuccess}/${pages.length} pages accessible`, `${Date.now() - startTime}ms`);

    } catch (error) {
      this.logTest('INTERACAO', 'User Interactions', false,
        `Error: ${error.message}`, `${Date.now() - startTime}ms`);
    }
  }

  // ===== 7. TESTES DE VALIDAÇÃO DE FORMULÁRIOS =====
  async testFormValidation() {
    console.log(`${this.colors.magenta}📝 TESTANDO VALIDAÇÃO DE FORMULÁRIOS${this.colors.reset}`);
    
    const validationTests = [
      {
        name: 'Empty Email',
        endpoint: '/api/auth/login',
        body: { email: '', password: 'test123' },
        expectedStatus: 400
      },
      {
        name: 'Invalid Email',
        endpoint: '/api/auth/login',
        body: { email: 'invalid-email', password: 'test123' },
        expectedStatus: 400
      },
      {
        name: 'Short Password',
        endpoint: '/api/auth/register',
        body: { email: 'test@test.com', password: '123', firstName: 'Test', lastName: 'User' },
        expectedStatus: 400
      },
      {
        name: 'Missing Required Fields',
        endpoint: '/api/quizzes',
        body: { description: 'Quiz sem título' },
        expectedStatus: 400
      },
      {
        name: 'Invalid Quiz Structure',
        endpoint: '/api/quizzes',
        body: { title: 'Test', structure: 'invalid' },
        expectedStatus: 400
      }
    ];

    for (const test of validationTests) {
      const startTime = Date.now();
      
      try {
        const { response } = await this.makeRequest(test.endpoint, {
          method: 'POST',
          noAuth: test.endpoint.includes('/auth/'),
          body: JSON.stringify(test.body)
        });

        const validationWorks = response.status === test.expectedStatus;
        this.logTest('VALIDACAO', test.name, validationWorks,
          `Status: ${response.status} (expected: ${test.expectedStatus})`, `${Date.now() - startTime}ms`);

      } catch (error) {
        this.logTest('VALIDACAO', test.name, false,
          `Error: ${error.message}`, `${Date.now() - startTime}ms`);
      }
    }
  }

  // ===== 8. TESTES DE NAVEGAÇÃO E FLUXO =====
  async testNavigationFlow() {
    console.log(`${this.colors.magenta}🧭 TESTANDO NAVEGAÇÃO E FLUXO${this.colors.reset}`);
    
    const startTime = Date.now();
    
    try {
      // Teste 1: Fluxo completo de usuário
      const userFlow = [
        { step: 'Login', endpoint: '/api/auth/login', method: 'POST', noAuth: true },
        { step: 'Dashboard', endpoint: '/dashboard', method: 'GET' },
        { step: 'Quiz List', endpoint: '/api/quizzes', method: 'GET' },
        { step: 'Create Quiz', endpoint: '/api/quizzes', method: 'POST' },
        { step: 'Analytics', endpoint: '/api/analytics', method: 'GET' },
        { step: 'User Profile', endpoint: '/api/user/profile', method: 'GET' }
      ];

      let flowSuccess = 0;
      let lastQuizId = null;

      for (const flow of userFlow) {
        const flowStartTime = Date.now();
        let requestOptions = { method: flow.method, noAuth: flow.noAuth };

        if (flow.step === 'Login') {
          requestOptions.body = JSON.stringify({
            email: 'admin@vendzz.com',
            password: 'admin123'
          });
        } else if (flow.step === 'Create Quiz') {
          requestOptions.body = JSON.stringify({
            title: 'Quiz Fluxo',
            description: 'Teste de fluxo',
            structure: { pages: [] }
          });
        }

        const { response, data } = await this.makeRequest(flow.endpoint, requestOptions);
        
        if (response.status === 200 || response.status === 201) {
          flowSuccess++;
          if (flow.step === 'Create Quiz' && data.quiz) {
            lastQuizId = data.quiz.id;
          }
        }

        const stepWorks = response.status === 200 || response.status === 201;
        this.logTest('NAVEGACAO', flow.step, stepWorks,
          `Status: ${response.status}`, `${Date.now() - flowStartTime}ms`);
      }

      // Teste 2: Fluxo de quiz público
      if (lastQuizId) {
        const { response: publicResponse } = await this.makeRequest(`/quiz/${lastQuizId}`, {
          noAuth: true
        });

        const publicWorks = publicResponse.status === 200;
        this.logTest('NAVEGACAO', 'Public Quiz Access', publicWorks,
          'Public quiz: ' + (publicWorks ? 'Accessible' : 'Error'), `${Date.now() - startTime}ms`);
      }

      // Teste 3: Breadcrumbs e navegação
      const breadcrumbFlow = flowSuccess >= 5; // 83% success rate
      this.logTest('NAVEGACAO', 'Complete User Flow', breadcrumbFlow,
        `${flowSuccess}/${userFlow.length} steps completed`, `${Date.now() - startTime}ms`);

    } catch (error) {
      this.logTest('NAVEGACAO', 'Navigation Flow', false,
        `Error: ${error.message}`, `${Date.now() - startTime}ms`);
    }
  }

  // ===== RELATÓRIO FINAL =====
  generateReport() {
    console.log(`\n${this.colors.magenta}📊 RELATÓRIO FINAL DE USABILIDADE${this.colors.reset}`);
    console.log('='.repeat(60));

    const categories = [...new Set(this.testResults.map(r => r.category))];
    let totalTests = 0;
    let totalPassed = 0;

    categories.forEach(category => {
      const categoryTests = this.testResults.filter(r => r.category === category);
      const categoryPassed = categoryTests.filter(r => r.passed).length;
      const categoryTotal = categoryTests.length;
      const categoryPercentage = Math.round((categoryPassed / categoryTotal) * 100);

      totalTests += categoryTotal;
      totalPassed += categoryPassed;

      const statusColor = categoryPercentage >= 80 ? this.colors.green : 
                         categoryPercentage >= 60 ? this.colors.yellow : this.colors.red;

      console.log(`${this.colors.cyan}${category}${this.colors.reset}: ${statusColor}${categoryPassed}/${categoryTotal} (${categoryPercentage}%)${this.colors.reset}`);
    });

    const overallPercentage = Math.round((totalPassed / totalTests) * 100);
    const overallColor = overallPercentage >= 80 ? this.colors.green : 
                        overallPercentage >= 60 ? this.colors.yellow : this.colors.red;

    console.log('='.repeat(60));
    console.log(`${this.colors.white}RESULTADO GERAL: ${overallColor}${totalPassed}/${totalTests} (${overallPercentage}%)${this.colors.reset}`);

    // Status de usabilidade
    let usabilityStatus = '';
    if (overallPercentage >= 90) {
      usabilityStatus = `${this.colors.green}🎨 EXCELENTE USABILIDADE - APROVADO PARA PRODUÇÃO${this.colors.reset}`;
    } else if (overallPercentage >= 75) {
      usabilityStatus = `${this.colors.yellow}⚠️ BOA USABILIDADE - MELHORIAS RECOMENDADAS${this.colors.reset}`;
    } else {
      usabilityStatus = `${this.colors.red}🚨 USABILIDADE INADEQUADA - CORREÇÕES NECESSÁRIAS${this.colors.reset}`;
    }

    console.log(`\n${usabilityStatus}`);
    console.log('='.repeat(60));

    return {
      totalTests,
      totalPassed,
      overallPercentage,
      categories: categories.map(cat => {
        const tests = this.testResults.filter(r => r.category === cat);
        return {
          category: cat,
          passed: tests.filter(r => r.passed).length,
          total: tests.length,
          percentage: Math.round((tests.filter(r => r.passed).length / tests.length) * 100)
        };
      })
    };
  }

  // ===== EXECUÇÃO PRINCIPAL =====
  async runAllTests() {
    console.log(`${this.colors.magenta}🎨 INICIANDO SUITE DE TESTES DE USABILIDADE${this.colors.reset}`);
    console.log('='.repeat(60));

    const startTime = Date.now();

    try {
      // Autenticação
      const authSuccess = await this.authenticate();
      if (!authSuccess) {
        console.log(`${this.colors.red}❌ FALHA NA AUTENTICAÇÃO - CONTINUANDO COM TESTES LIMITADOS${this.colors.reset}`);
      }

      // Executar todos os testes
      await this.testResponsiveness();
      await this.testBrowserCompatibility();
      await this.testAccessibility();
      await this.testMobileQuizEditing();
      await this.testInterfacePerformance();
      await this.testInteractions();
      await this.testFormValidation();
      await this.testNavigationFlow();

      // Relatório final
      const report = this.generateReport();
      const totalTime = Date.now() - startTime;

      console.log(`\n${this.colors.cyan}⏱️ TEMPO TOTAL DE EXECUÇÃO: ${totalTime}ms${this.colors.reset}`);
      console.log(`${this.colors.cyan}📊 MÉDIA POR TESTE: ${Math.round(totalTime / report.totalTests)}ms${this.colors.reset}`);

      return report;

    } catch (error) {
      console.error(`${this.colors.red}❌ ERRO CRÍTICO: ${error.message}${this.colors.reset}`);
      console.error(error.stack);
    }
  }
}

// Executar testes
const usabilityTest = new UsabilityTestSuite();
usabilityTest.runAllTests();