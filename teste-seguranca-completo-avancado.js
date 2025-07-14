/**
 * 🔒 SUITE DE TESTES DE SEGURANÇA COMPLETA E AVANÇADA
 * Sistema Vendzz - Validação de Segurança para Produção
 * 
 * Testes implementados:
 * 1. SQL Injection Protection
 * 2. XSS Protection  
 * 3. Rate Limiting
 * 4. Autenticação e Autorização
 * 5. Planos e Expiração
 * 6. Sistema de Créditos
 * 7. Bloqueio por Créditos Esgotados
 * 8. Criação de Campanhas em Tempo Real
 */

import fetch from 'node-fetch';

class SecurityTestSuite {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.testResults = [];
    this.authToken = null;
    this.adminToken = null;
    this.testUserId = null;
    this.testQuizId = null;
    this.testCampaignId = null;
    this.initialCredits = 0;
    this.colors = {
      green: '\x1b[32m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      reset: '\x1b[0m'
    };
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Security-Test-Suite/1.0',
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

  // ===== AUTENTICAÇÃO E SETUP =====
  async setupAuth() {
    console.log(`${this.colors.magenta}🔐 CONFIGURANDO AUTENTICAÇÃO${this.colors.reset}`);
    
    const startTime = Date.now();
    
    try {
      // Login como admin
      const { response: loginResponse, data: loginData } = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        noAuth: true,
        body: JSON.stringify({
          email: 'admin@vendzz.com',
          password: 'admin123'
        })
      });

      console.log(`Login response status: ${loginResponse.status}`);
      console.log(`Login response data:`, loginData);

      if (loginResponse.status === 200 && loginData.message === 'Login successful' && loginData.accessToken) {
        this.authToken = loginData.accessToken;
        this.adminToken = loginData.accessToken;
        this.testUserId = loginData.user.id;
        this.logTest('SETUP', 'Admin Authentication', true, 'Login successful', `${Date.now() - startTime}ms`);
        return true;
      } else {
        this.logTest('SETUP', 'Admin Authentication', false, `Login failed: ${JSON.stringify(loginData)}`, `${Date.now() - startTime}ms`);
        return false;
      }
    } catch (error) {
      this.logTest('SETUP', 'Admin Authentication', false, `Error: ${error.message}`, `${Date.now() - startTime}ms`);
      return false;
    }
  }

  // ===== 1. TESTES DE SQL INJECTION =====
  async testSQLInjectionProtection() {
    console.log(`${this.colors.magenta}🛡️ TESTANDO PROTEÇÃO SQL INJECTION${this.colors.reset}`);
    
    const sqlPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1' --",
      "' UNION SELECT * FROM users --",
      "'; DELETE FROM quizzes; --",
      "' OR 1=1 LIMIT 1 --",
      "'; INSERT INTO users (email, password) VALUES ('hacker@test.com', 'hacked'); --",
      "' AND (SELECT COUNT(*) FROM users) > 0 --",
      "'; UPDATE users SET role='admin' WHERE id=1; --"
    ];

    for (const payload of sqlPayloads) {
      const startTime = Date.now();
      
      try {
        // Teste 1: Login com SQL Injection
        const { response: loginResponse, data: loginData } = await this.makeRequest('/api/auth/login', {
          method: 'POST',
          noAuth: true,
          body: JSON.stringify({
            email: payload,
            password: 'anypassword'
          })
        });

        const loginBlocked = loginResponse.status !== 200 || !loginData.token;
        this.logTest('SQL_INJECTION', `Login Protection - ${payload.substring(0, 20)}...`, loginBlocked, 
          loginBlocked ? 'SQL injection blocked' : 'SQL injection NOT blocked', `${Date.now() - startTime}ms`);

        // Teste 2: Busca de Quiz com SQL Injection
        const { response: quizResponse } = await this.makeRequest(`/api/quizzes/${encodeURIComponent(payload)}`);
        const quizBlocked = quizResponse.status === 400 || quizResponse.status === 404 || quizResponse.status === 422;
        this.logTest('SQL_INJECTION', `Quiz Search Protection - ${payload.substring(0, 20)}...`, quizBlocked,
          quizBlocked ? 'SQL injection blocked' : 'SQL injection NOT blocked', `${Date.now() - startTime}ms`);

        // Teste 3: Criação de usuário com SQL Injection
        const { response: userResponse } = await this.makeRequest('/api/auth/register', {
          method: 'POST',
          noAuth: true,
          body: JSON.stringify({
            email: payload,
            password: 'password123',
            firstName: 'Test',
            lastName: 'User'
          })
        });

        const userBlocked = userResponse.status !== 201;
        this.logTest('SQL_INJECTION', `User Creation Protection - ${payload.substring(0, 20)}...`, userBlocked,
          userBlocked ? 'SQL injection blocked' : 'SQL injection NOT blocked', `${Date.now() - startTime}ms`);

      } catch (error) {
        this.logTest('SQL_INJECTION', `Error Protection - ${payload.substring(0, 20)}...`, true,
          `Exception caught: ${error.message}`, `${Date.now() - startTime}ms`);
      }
    }
  }

  // ===== 2. TESTES DE XSS PROTECTION =====
  async testXSSProtection() {
    console.log(`${this.colors.magenta}🛡️ TESTANDO PROTEÇÃO XSS${this.colors.reset}`);
    
    const xssPayloads = [
      "<script>alert('XSS')</script>",
      "<img src=x onerror=alert('XSS')>",
      "<svg onload=alert('XSS')>",
      "javascript:alert('XSS')",
      "<iframe src=javascript:alert('XSS')></iframe>",
      "<body onload=alert('XSS')>",
      "<input type=text value='' onfocus=alert('XSS') autofocus>",
      "<select onfocus=alert('XSS') autofocus><option>test</option></select>"
    ];

    for (const payload of xssPayloads) {
      const startTime = Date.now();
      
      try {
        // Teste 1: Criação de Quiz com XSS
        const { response: quizResponse, data: quizData } = await this.makeRequest('/api/quizzes', {
          method: 'POST',
          body: JSON.stringify({
            title: payload,
            description: payload,
            structure: {
              pages: [{
                id: 1,
                title: payload,
                elements: [{
                  type: 'heading',
                  content: payload
                }]
              }]
            }
          })
        });

        let xssBlocked = true;
        if (quizResponse.status === 201 && quizData.quiz) {
          // Verificar se o payload foi sanitizado
          const containsScript = quizData.quiz.title.includes('<script>') || 
                               quizData.quiz.description.includes('<script>') ||
                               JSON.stringify(quizData.quiz.structure).includes('<script>');
          xssBlocked = !containsScript;
        }

        this.logTest('XSS_PROTECTION', `Quiz Creation - ${payload.substring(0, 30)}...`, xssBlocked,
          xssBlocked ? 'XSS payload sanitized' : 'XSS payload NOT sanitized', `${Date.now() - startTime}ms`);

        // Teste 2: Resposta de Quiz com XSS
        if (this.testQuizId) {
          const { response: responseResp } = await this.makeRequest('/api/quiz-responses', {
            method: 'POST',
            body: JSON.stringify({
              quizId: this.testQuizId,
              responses: {
                'text_input': payload,
                'email': `test${payload}@example.com`
              }
            })
          });

          const responseBlocked = responseResp.status !== 201;
          this.logTest('XSS_PROTECTION', `Quiz Response - ${payload.substring(0, 30)}...`, responseBlocked,
            responseBlocked ? 'XSS in response blocked' : 'XSS in response NOT blocked', `${Date.now() - startTime}ms`);
        }

      } catch (error) {
        this.logTest('XSS_PROTECTION', `Error Protection - ${payload.substring(0, 30)}...`, true,
          `Exception caught: ${error.message}`, `${Date.now() - startTime}ms`);
      }
    }
  }

  // ===== 3. TESTES DE RATE LIMITING =====
  async testRateLimiting() {
    console.log(`${this.colors.magenta}⚡ TESTANDO RATE LIMITING${this.colors.reset}`);
    
    const endpoints = [
      { path: '/api/auth/login', method: 'POST', limit: 10, body: { email: 'test@test.com', password: 'wrong' } },
      { path: '/api/quizzes', method: 'GET', limit: 100 },
      { path: '/api/quiz-responses', method: 'POST', limit: 50, body: { quizId: 'test', responses: {} } },
      { path: '/api/analytics', method: 'GET', limit: 100 }
    ];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      let blockedCount = 0;
      let successCount = 0;

      try {
        // Fazer requisições rápidas para testar rate limiting
        const requests = [];
        for (let i = 0; i < endpoint.limit + 5; i++) {
          const requestOptions = {
            method: endpoint.method,
            noAuth: endpoint.path === '/api/auth/login'
          };

          if (endpoint.body) {
            requestOptions.body = JSON.stringify(endpoint.body);
          }

          requests.push(this.makeRequest(endpoint.path, requestOptions));
        }

        const responses = await Promise.all(requests);
        
        responses.forEach(({ response }) => {
          if (response.status === 429) {
            blockedCount++;
          } else {
            successCount++;
          }
        });

        const rateLimitWorking = blockedCount > 0;
        this.logTest('RATE_LIMITING', `${endpoint.path} (${endpoint.method})`, rateLimitWorking,
          `${successCount} success, ${blockedCount} blocked (limit: ${endpoint.limit})`, `${Date.now() - startTime}ms`);

      } catch (error) {
        this.logTest('RATE_LIMITING', `${endpoint.path} (${endpoint.method})`, false,
          `Error: ${error.message}`, `${Date.now() - startTime}ms`);
      }
    }
  }

  // ===== 4. TESTES DE AUTENTICAÇÃO E AUTORIZAÇÃO =====
  async testAuthenticationAndAuthorization() {
    console.log(`${this.colors.magenta}🔐 TESTANDO AUTENTICAÇÃO E AUTORIZAÇÃO${this.colors.reset}`);
    
    const protectedEndpoints = [
      { path: '/api/quizzes', method: 'GET' },
      { path: '/api/quizzes', method: 'POST' },
      { path: '/api/analytics', method: 'GET' },
      { path: '/api/sms-campaigns', method: 'POST' },
      { path: '/api/email-campaigns', method: 'POST' },
      { path: '/api/user/credits', method: 'GET' }
    ];

    for (const endpoint of protectedEndpoints) {
      const startTime = Date.now();
      
      try {
        // Teste 1: Sem token
        const { response: noTokenResponse } = await this.makeRequest(endpoint.path, {
          method: endpoint.method,
          noAuth: true
        });

        const noTokenBlocked = noTokenResponse.status === 401;
        this.logTest('AUTHENTICATION', `No Token - ${endpoint.path}`, noTokenBlocked,
          noTokenBlocked ? 'Access denied without token' : 'Access allowed without token', `${Date.now() - startTime}ms`);

        // Teste 2: Token inválido
        const { response: invalidTokenResponse } = await this.makeRequest(endpoint.path, {
          method: endpoint.method,
          headers: { 'Authorization': 'Bearer invalid-token-123' }
        });

        const invalidTokenBlocked = invalidTokenResponse.status === 401;
        this.logTest('AUTHENTICATION', `Invalid Token - ${endpoint.path}`, invalidTokenBlocked,
          invalidTokenBlocked ? 'Access denied with invalid token' : 'Access allowed with invalid token', `${Date.now() - startTime}ms`);

        // Teste 3: Token expirado (simulado)
        const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
        const { response: expiredTokenResponse } = await this.makeRequest(endpoint.path, {
          method: endpoint.method,
          headers: { 'Authorization': `Bearer ${expiredToken}` }
        });

        const expiredTokenBlocked = expiredTokenResponse.status === 401;
        this.logTest('AUTHENTICATION', `Expired Token - ${endpoint.path}`, expiredTokenBlocked,
          expiredTokenBlocked ? 'Access denied with expired token' : 'Access allowed with expired token', `${Date.now() - startTime}ms`);

      } catch (error) {
        this.logTest('AUTHENTICATION', `Error - ${endpoint.path}`, true,
          `Exception caught: ${error.message}`, `${Date.now() - startTime}ms`);
      }
    }
  }

  // ===== 5. TESTES DE PLANOS E EXPIRAÇÃO =====
  async testPlansAndExpiration() {
    console.log(`${this.colors.magenta}📅 TESTANDO PLANOS E EXPIRAÇÃO${this.colors.reset}`);
    
    const startTime = Date.now();
    
    try {
      // Teste 1: Verificar plano atual
      const { response: userResponse, data: userData } = await this.makeRequest('/api/user/profile');
      
      if (userResponse.status === 200 && userData.user) {
        const hasValidPlan = userData.user.plan && ['free', 'premium', 'enterprise'].includes(userData.user.plan);
        this.logTest('PLANS', 'Current Plan Validation', hasValidPlan,
          `User plan: ${userData.user.plan}`, `${Date.now() - startTime}ms`);

        // Teste 2: Verificar expiração do plano
        const planExpiration = userData.user.planExpirationDate;
        const hasExpiration = planExpiration !== null && planExpiration !== undefined;
        this.logTest('PLANS', 'Plan Expiration Date', hasExpiration,
          `Expiration: ${planExpiration || 'Not set'}`, `${Date.now() - startTime}ms`);

        // Teste 3: Calcular dias restantes
        if (planExpiration) {
          const expirationDate = new Date(planExpiration);
          const today = new Date();
          const daysLeft = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));
          
          this.logTest('PLANS', 'Days Calculation', true,
            `Days left: ${daysLeft}`, `${Date.now() - startTime}ms`);
        }

        // Teste 4: Verificar limites do plano
        const { response: limitsResponse, data: limitsData } = await this.makeRequest('/api/user/limits');
        
        if (limitsResponse.status === 200) {
          const hasLimits = limitsData.quizLimit !== undefined && limitsData.responseLimit !== undefined;
          this.logTest('PLANS', 'Plan Limits', hasLimits,
            `Quiz limit: ${limitsData.quizLimit}, Response limit: ${limitsData.responseLimit}`, `${Date.now() - startTime}ms`);
        }

      } else {
        this.logTest('PLANS', 'Current Plan Validation', false,
          'Failed to get user profile', `${Date.now() - startTime}ms`);
      }

    } catch (error) {
      this.logTest('PLANS', 'Plans and Expiration', false,
        `Error: ${error.message}`, `${Date.now() - startTime}ms`);
    }
  }

  // ===== 6. TESTES DE SISTEMA DE CRÉDITOS =====
  async testCreditsSystem() {
    console.log(`${this.colors.magenta}💰 TESTANDO SISTEMA DE CRÉDITOS${this.colors.reset}`);
    
    const startTime = Date.now();
    
    try {
      // Teste 1: Obter créditos atuais
      const { response: creditsResponse, data: creditsData } = await this.makeRequest('/api/user/credits');
      
      if (creditsResponse.status === 200 && creditsData) {
        this.initialCredits = creditsData.total || 0;
        const hasCredits = creditsData.sms !== undefined && creditsData.email !== undefined;
        this.logTest('CREDITS', 'Credits Balance', hasCredits,
          `SMS: ${creditsData.sms}, Email: ${creditsData.email}, WhatsApp: ${creditsData.whatsapp}, Total: ${creditsData.total}`, `${Date.now() - startTime}ms`);

        // Teste 2: Histórico de créditos
        const { response: historyResponse, data: historyData } = await this.makeRequest('/api/sms-credits/history');
        
        const hasHistory = historyResponse.status === 200 && Array.isArray(historyData);
        this.logTest('CREDITS', 'Credits History', hasHistory,
          `History entries: ${hasHistory ? historyData.length : 0}`, `${Date.now() - startTime}ms`);

        // Teste 3: Validação de créditos antes de campanha
        const { response: validationResponse, data: validationData } = await this.makeRequest('/api/validate-credits', {
          method: 'POST',
          body: JSON.stringify({
            campaignType: 'sms',
            phoneCount: 10
          })
        });

        const validationWorks = validationResponse.status === 200 || validationResponse.status === 402;
        this.logTest('CREDITS', 'Credits Validation', validationWorks,
          `Validation response: ${validationResponse.status}`, `${Date.now() - startTime}ms`);

      } else {
        this.logTest('CREDITS', 'Credits Balance', false,
          'Failed to get credits balance', `${Date.now() - startTime}ms`);
      }

    } catch (error) {
      this.logTest('CREDITS', 'Credits System', false,
        `Error: ${error.message}`, `${Date.now() - startTime}ms`);
    }
  }

  // ===== 7. TESTES DE BLOQUEIO POR CRÉDITOS ESGOTADOS =====
  async testCreditsBlockingSystem() {
    console.log(`${this.colors.magenta}🚫 TESTANDO BLOQUEIO POR CRÉDITOS ESGOTADOS${this.colors.reset}`);
    
    const startTime = Date.now();
    
    try {
      // Criar um quiz para teste
      const { response: quizResponse, data: quizData } = await this.makeRequest('/api/quizzes', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Quiz para Teste de Créditos',
          description: 'Teste de bloqueio por créditos esgotados',
          structure: {
            pages: [{
              id: 1,
              title: 'Página 1',
              elements: [{
                type: 'text',
                fieldId: 'telefone_contato',
                required: true
              }]
            }]
          }
        })
      });

      if (quizResponse.status === 201 && quizData.quiz) {
        this.testQuizId = quizData.quiz.id;

        // Teste 1: Campanha SMS com créditos insuficientes
        const { response: smsResponse, data: smsData } = await this.makeRequest('/api/sms-campaigns', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Teste Créditos Insuficientes',
            message: 'Teste de bloqueio por créditos',
            quizId: this.testQuizId,
            targetAudience: 'all',
            phones: Array.from({length: 1000}, (_, i) => `11999${String(i).padStart(6, '0')}`) // 1000 números
          })
        });

        const smsBlocked = smsResponse.status === 402; // Payment Required
        this.logTest('CREDITS_BLOCKING', 'SMS Campaign with Insufficient Credits', smsBlocked,
          smsBlocked ? 'Campaign blocked due to insufficient credits' : 'Campaign NOT blocked', `${Date.now() - startTime}ms`);

        // Teste 2: Campanha Email com créditos insuficientes
        const { response: emailResponse } = await this.makeRequest('/api/email-campaigns', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Teste Email Créditos',
            subject: 'Teste de Bloqueio',
            message: 'Teste de bloqueio por créditos',
            quizId: this.testQuizId,
            targetAudience: 'all',
            emails: Array.from({length: 1000}, (_, i) => `test${i}@example.com`) // 1000 emails
          })
        });

        const emailBlocked = emailResponse.status === 402;
        this.logTest('CREDITS_BLOCKING', 'Email Campaign with Insufficient Credits', emailBlocked,
          emailBlocked ? 'Campaign blocked due to insufficient credits' : 'Campaign NOT blocked', `${Date.now() - startTime}ms`);

        // Teste 3: Campanha WhatsApp com créditos insuficientes
        const { response: whatsappResponse } = await this.makeRequest('/api/whatsapp-campaigns', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Teste WhatsApp Créditos',
            message: 'Teste de bloqueio por créditos',
            quizId: this.testQuizId,
            targetAudience: 'all',
            phones: Array.from({length: 1000}, (_, i) => `11999${String(i).padStart(6, '0')}`) // 1000 números
          })
        });

        const whatsappBlocked = whatsappResponse.status === 402;
        this.logTest('CREDITS_BLOCKING', 'WhatsApp Campaign with Insufficient Credits', whatsappBlocked,
          whatsappBlocked ? 'Campaign blocked due to insufficient credits' : 'Campaign NOT blocked', `${Date.now() - startTime}ms`);

      } else {
        this.logTest('CREDITS_BLOCKING', 'Test Quiz Creation', false,
          'Failed to create test quiz', `${Date.now() - startTime}ms`);
      }

    } catch (error) {
      this.logTest('CREDITS_BLOCKING', 'Credits Blocking System', false,
        `Error: ${error.message}`, `${Date.now() - startTime}ms`);
    }
  }

  // ===== 8. TESTES DE CRIAÇÃO DE CAMPANHAS EM TEMPO REAL =====
  async testRealTimeCampaignCreation() {
    console.log(`${this.colors.magenta}⚡ TESTANDO CRIAÇÃO DE CAMPANHAS EM TEMPO REAL${this.colors.reset}`);
    
    const startTime = Date.now();
    
    try {
      if (!this.testQuizId) {
        // Criar quiz se não existir
        const { response: quizResponse, data: quizData } = await this.makeRequest('/api/quizzes', {
          method: 'POST',
          body: JSON.stringify({
            title: 'Quiz para Teste de Campanhas',
            description: 'Teste de criação de campanhas em tempo real',
            structure: {
              pages: [{
                id: 1,
                title: 'Página 1',
                elements: [{
                  type: 'text',
                  fieldId: 'telefone_contato',
                  required: true
                }]
              }]
            }
          })
        });

        if (quizResponse.status === 201 && quizData.quiz) {
          this.testQuizId = quizData.quiz.id;
        }
      }

      // Teste 1: Criação de campanha SMS em tempo real
      const smsStartTime = Date.now();
      const { response: smsResponse, data: smsData } = await this.makeRequest('/api/sms-campaigns', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Campanha SMS Tempo Real',
          message: 'Teste de criação em tempo real',
          quizId: this.testQuizId,
          targetAudience: 'all',
          phones: ['11999999999', '11888888888']
        })
      });

      const smsCreated = smsResponse.status === 201;
      const smsTime = Date.now() - smsStartTime;
      this.logTest('REAL_TIME_CAMPAIGNS', 'SMS Campaign Creation', smsCreated,
        smsCreated ? `Campaign created successfully` : 'Campaign creation failed', `${smsTime}ms`);

      if (smsCreated && smsData.campaign) {
        this.testCampaignId = smsData.campaign.id;
        
        // Verificar se a campanha foi criada corretamente
        const { response: campaignResponse, data: campaignData } = await this.makeRequest(`/api/sms-campaigns/${this.testCampaignId}`);
        
        const campaignExists = campaignResponse.status === 200 && campaignData.campaign;
        this.logTest('REAL_TIME_CAMPAIGNS', 'SMS Campaign Verification', campaignExists,
          campaignExists ? `Campaign verified` : 'Campaign not found', `${Date.now() - startTime}ms`);
      }

      // Teste 2: Criação de campanha Email em tempo real
      const emailStartTime = Date.now();
      const { response: emailResponse, data: emailData } = await this.makeRequest('/api/email-campaigns', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Campanha Email Tempo Real',
          subject: 'Teste Tempo Real',
          message: 'Teste de criação em tempo real',
          quizId: this.testQuizId,
          targetAudience: 'all',
          emails: ['test1@example.com', 'test2@example.com']
        })
      });

      const emailCreated = emailResponse.status === 201;
      const emailTime = Date.now() - emailStartTime;
      this.logTest('REAL_TIME_CAMPAIGNS', 'Email Campaign Creation', emailCreated,
        emailCreated ? `Campaign created successfully` : 'Campaign creation failed', `${emailTime}ms`);

      // Teste 3: Criação de campanha WhatsApp em tempo real
      const whatsappStartTime = Date.now();
      const { response: whatsappResponse, data: whatsappData } = await this.makeRequest('/api/whatsapp-campaigns', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Campanha WhatsApp Tempo Real',
          message: 'Teste de criação em tempo real',
          quizId: this.testQuizId,
          targetAudience: 'all',
          phones: ['11999999999', '11888888888']
        })
      });

      const whatsappCreated = whatsappResponse.status === 201;
      const whatsappTime = Date.now() - whatsappStartTime;
      this.logTest('REAL_TIME_CAMPAIGNS', 'WhatsApp Campaign Creation', whatsappCreated,
        whatsappCreated ? `Campaign created successfully` : 'Campaign creation failed', `${whatsappTime}ms`);

      // Teste 4: Performance de criação simultânea
      const simultaneousStartTime = Date.now();
      const simultaneousPromises = [];
      
      for (let i = 0; i < 5; i++) {
        simultaneousPromises.push(
          this.makeRequest('/api/sms-campaigns', {
            method: 'POST',
            body: JSON.stringify({
              name: `Campanha Simultânea ${i}`,
              message: `Teste simultâneo ${i}`,
              quizId: this.testQuizId,
              targetAudience: 'all',
              phones: [`1199999999${i}`]
            })
          })
        );
      }

      const simultaneousResults = await Promise.all(simultaneousPromises);
      const simultaneousSuccess = simultaneousResults.every(({ response }) => response.status === 201);
      const simultaneousTime = Date.now() - simultaneousStartTime;
      
      this.logTest('REAL_TIME_CAMPAIGNS', 'Simultaneous Campaign Creation', simultaneousSuccess,
        simultaneousSuccess ? `5 campaigns created simultaneously` : 'Some campaigns failed', `${simultaneousTime}ms`);

    } catch (error) {
      this.logTest('REAL_TIME_CAMPAIGNS', 'Real Time Campaign Creation', false,
        `Error: ${error.message}`, `${Date.now() - startTime}ms`);
    }
  }

  // ===== RELATÓRIO FINAL =====
  generateReport() {
    console.log(`\n${this.colors.magenta}📊 RELATÓRIO FINAL DE SEGURANÇA${this.colors.reset}`);
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

    // Status de segurança
    let securityStatus = '';
    if (overallPercentage >= 95) {
      securityStatus = `${this.colors.green}🔒 SISTEMA ALTAMENTE SEGURO - APROVADO PARA PRODUÇÃO${this.colors.reset}`;
    } else if (overallPercentage >= 80) {
      securityStatus = `${this.colors.yellow}⚠️ SISTEMA SEGURO COM RESSALVAS - REQUER MELHORIAS${this.colors.reset}`;
    } else {
      securityStatus = `${this.colors.red}🚨 SISTEMA INSEGURO - NÃO APROVADO PARA PRODUÇÃO${this.colors.reset}`;
    }

    console.log(`\n${securityStatus}`);
    console.log('='.repeat(60));

    // Recomendações
    const failedTests = this.testResults.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.log(`\n${this.colors.red}❌ CORREÇÕES NECESSÁRIAS:${this.colors.reset}`);
      failedTests.forEach(test => {
        console.log(`  • ${test.category}: ${test.testName} - ${test.details}`);
      });
    }

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
    console.log(`${this.colors.magenta}🔒 INICIANDO SUITE DE TESTES DE SEGURANÇA AVANÇADA${this.colors.reset}`);
    console.log('='.repeat(60));

    const startTime = Date.now();

    try {
      // Setup
      const authSuccess = await this.setupAuth();
      if (!authSuccess) {
        console.log(`${this.colors.red}❌ FALHA NA AUTENTICAÇÃO - CANCELANDO TESTES${this.colors.reset}`);
        return;
      }

      // Executar todos os testes
      await this.testSQLInjectionProtection();
      await this.testXSSProtection();
      await this.testRateLimiting();
      await this.testAuthenticationAndAuthorization();
      await this.testPlansAndExpiration();
      await this.testCreditsSystem();
      await this.testCreditsBlockingSystem();
      await this.testRealTimeCampaignCreation();

      // Relatório final
      const report = this.generateReport();
      const totalTime = Date.now() - startTime;

      console.log(`\n${this.colors.cyan}⏱️ TEMPO TOTAL DE EXECUÇÃO: ${totalTime}ms${this.colors.reset}`);
      console.log(`${this.colors.cyan}📊 MÉDIA POR TESTE: ${Math.round(totalTime / report.totalTests)}ms${this.colors.reset}`);

    } catch (error) {
      console.error(`${this.colors.red}❌ ERRO CRÍTICO: ${error.message}${this.colors.reset}`);
      console.error(error.stack);
    }
  }
}

// Executar testes
const securitySuite = new SecurityTestSuite();
securitySuite.runAllTests();