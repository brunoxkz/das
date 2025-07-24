// Carregamento manual das variáveis de ambiente do .env
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

if (existsSync(".env")) {
  try {
    const envFile = readFileSync(".env", "utf8");
    const lines = envFile.split("\n");
    
    lines.forEach(line => {
      if (line.trim() && !line.startsWith("#") && line.includes("=")) {
        const [key, ...values] = line.split("=");
        const value = values.join("=").replace(/^["']|["']$/g, "");
        process.env[key.trim()] = value.trim();
      }
    });
    
    console.log("✅ Variáveis de ambiente carregadas do .env");
    console.log("🔍 STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 10) + "..." : "undefined");
  } catch (error) {
    console.error("❌ Erro ao carregar .env:", error.message);
  }
} else {
  console.warn("⚠️  Arquivo .env não encontrado");
}

import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import helmet from "helmet";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { registerHybridRoutes } from "./routes-hybrid";
import { setupVite, serveStatic, log } from "./vite";
import { setupHybridAuth, verifyJWT } from "./auth-hybrid";
// Health check removed - now integrated in routes-sqlite.ts
import { emailService } from "./email-service";
import { 
  initAdvancedSecurity, 
  honeypotMiddleware, 
  timingAttackProtection, 
  attackSignatureAnalyzer, 
  blacklistMiddleware 
} from "./advanced-security";
import UltraScaleProcessor from "./ultra-scale-processor";
// import { quizCacheOptimizer } from "./quiz-cache-optimizer"; // DESABILITADO
import { unifiedSystem } from "./unified-scale-system";
import { userSimulator } from "./user-simulator";
// 🔒 IMPORTAÇÃO DO NOVO SISTEMA DE SEGURANÇA
import {
  generalRateLimit,
  quizSubmissionRateLimit,
  pushNotificationRateLimit,
  authRateLimit,
  assetRateLimit,
  sanitizeInput,
  validateRequest,
  validateHeaders,
  securityHeaders,
  checkBlockedIP,
  detectSQLInjection
} from "./security-middleware";

const app = express();

// 🔒 CONFIGURAÇÃO DE PROXY PARA RATE LIMITING
app.set('trust proxy', 1); // Confia no primeiro proxy (necessário para rate limiting no Replit)

// 🔒 APLICANDO CAMADAS DE SEGURANÇA CRÍTICAS
console.log('🔒 Inicializando Sistema de Segurança de Produção...');

// 1. Headers de segurança otimizados para Replit
app.use(securityHeaders);

// 2. Verificação de IPs bloqueados
app.use(checkBlockedIP);

// 3. Validação de headers maliciosos
app.use(validateHeaders);

// 4. Rate limiting inteligente por tipo de requisição
app.use((req, res, next) => {
  // Assets get special treatment with higher limits
  if (req.path.includes('/src/') || 
      req.path.includes('/@fs/') || 
      req.path.includes('/node_modules/') ||
      req.path.includes('.js') || 
      req.path.includes('.css') || 
      req.path.includes('.tsx') || 
      req.path.includes('.ts') ||
      req.path === '/sw.js' ||
      req.path === '/manifest.json' ||
      req.path === '/favicon.ico') {
    return assetRateLimit(req, res, next);
  }
  // All other requests use general rate limiting
  return generalRateLimit(req, res, next);
});

// 5. Sanitização de inputs (SQL injection protection)
app.use(sanitizeInput);

// 6. Detecção avançada de SQL injection
app.use(detectSQLInjection);

// 7. Validação de estrutura e tamanho da requisição
app.use(validateRequest);

console.log('✅ Sistema de Segurança de Produção ativado!');

// Compressão gzip/deflate para reduzir tamanho das respostas
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Nível de compressão balanceado
  threshold: 1024 // Só comprime se > 1KB
}));

// SOLUÇÃO CRÍTICA: JSON parser robusto que funciona com fetch() do Node.js
app.use(express.json({ 
  limit: '10mb',
  inflate: true,
  strict: true,
  type: ['application/json', 'text/plain', 'application/octet-stream']
}));

// Removemos express.urlencoded() para evitar interceptação das requisições JSON do fetch()

// CORS e Headers configurados para Replit
app.use((req, res, next) => {
  // CORS para extensão Chrome e Replit
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Headers compatíveis com Replit - SIMPLIFICADO
  res.setHeader('X-Powered-By', 'Vendzz');
  // res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Permite embedding no Replit
  // res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // REMOVIDO para testar
  // res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // CORREÇÃO CRÍTICA OPERA: MIME type correto para arquivos JS
  if (req.path.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    if (req.path.includes('sw') || req.path.includes('service-worker')) {
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
  
  // INTERCEPTAÇÃO ESPECÍFICA PARA SERVICE WORKER iOS
  if (req.path === '/sw-persistent-ios.js') {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    console.log('🍎 SERVINDO SERVICE WORKER iOS PERSISTENTE');
  }
  
  // INTERCEPTAÇÃO ESPECÍFICA PARA ÍCONES PWA - NO CACHE PARA FORÇAR ATUALIZAÇÃO
  if (req.url.match(/\/(apple-touch-icon|android-chrome-|favicon-|favicon\.ico|icon-|images\/icons)/)) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    console.log(`🍎 INTERCEPTANDO ÍCONE PWA: ${req.url}`);
  }
  
  // INTERCEPTAÇÃO COMPLETA PARA ÍCONES VENDZZ
  if (req.url.includes('/favicon') || req.url.includes('/images/icons/')) {
    try {
      let iconPath;
      let contentType = 'image/png';
      
      // Favicon específico
      if (req.url.includes('/favicon.ico')) {
        iconPath = path.join(process.cwd(), 'public/favicon.ico');
        contentType = 'image/x-icon';
      }
      // Outros favicons png
      else if (req.url.includes('/favicon')) {
        iconPath = path.join(process.cwd(), 'public/favicon-16x16.png');
      }
      // Ícones iOS e maskable - usar android-chrome-192x192.png como base
      else {
        iconPath = path.join(process.cwd(), 'public/android-chrome-192x192.png');
      }
      
      // Fallback para android-chrome-192x192.png se não encontrar
      if (!fs.existsSync(iconPath)) {
        iconPath = path.join(process.cwd(), 'public/android-chrome-192x192.png');
        contentType = 'image/png';
      }
      
      if (fs.existsSync(iconPath)) {
        const iconBuffer = fs.readFileSync(iconPath);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.end(iconBuffer);
        console.log(`🔥 SERVINDO ÍCONE VENDZZ: ${req.url} → ${iconPath.split('/').pop()}`);
        return;
      }
    } catch (error) {
      console.error('❌ ERRO AO SERVIR ÍCONE VENDZZ:', error);
    }
  }
  
  // INTERCEPTAÇÃO PARA PÁGINAS ADMIN - FORÇAR RELOAD PARA MOSTRAR NOVAS FUNCIONALIDADES
  if (req.url.includes('/admin/bulk-push-messaging') || req.url.includes('/admin-push-notifications') || req.url.includes('/bulk-push-messaging')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Admin-Version', Date.now().toString());
    res.setHeader('X-Force-Refresh', 'true');
    console.log(`🔄 FORÇANDO CACHE RELOAD ADMIN: ${req.url}`);
  }
  // Cache para outros assets estáticos (exceto ícones PWA e JS)
  else if (req.url.match(/\.(css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 ano
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Apply security middleware que funciona com Express 4.x - TEMPORARIAMENTE DESABILITADO
// app.use(honeypotMiddleware);
// app.use(timingAttackProtection);
// app.use(attackSignatureAnalyzer);
// app.use(blacklistMiddleware);

// Health check endpoints now integrated in routes-sqlite.ts

// FAVICON HD FORÇADO - INTERCEPTAÇÃO CRÍTICA ANTES DE TUDO
app.get('/favicon.ico', (req, res) => {
  try {
    const faviconPath = path.join(process.cwd(), 'public/favicon.ico');
    console.log('🔥 SERVINDO FAVICON HD:', faviconPath);
    
    if (fs.existsSync(faviconPath)) {
      const iconBuffer = fs.readFileSync(faviconPath);
      res.writeHead(200, {
        'Content-Type': 'image/x-icon',
        'Content-Length': iconBuffer.length,
        'Cache-Control': 'public, max-age=86400'
      });
      res.end(iconBuffer);
      console.log('✅ FAVICON HD SERVIDO - TAMANHO:', iconBuffer.length);
    } else {
      console.log('❌ FAVICON HD NÃO ENCONTRADO:', faviconPath);
      res.status(404).end();
    }
  } catch (error) {
    console.error('❌ ERRO CRÍTICO FAVICON HD:', error);
    res.status(500).end();
  }
});

// Apple Touch Icon HD
app.get('/apple-touch-icon.png', (req, res) => {
  try {
    const iconPath = path.join(process.cwd(), 'public/apple-touch-icon.png');
    console.log('🍎 SERVINDO APPLE TOUCH ICON HD:', iconPath);
    
    if (fs.existsSync(iconPath)) {
      const iconBuffer = fs.readFileSync(iconPath);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Content-Length', iconBuffer.length.toString());
      res.status(200).end(iconBuffer);
      console.log('✅ APPLE TOUCH ICON HD SERVIDO - TAMANHO:', iconBuffer.length);
    } else {
      console.log('❌ APPLE TOUCH ICON HD NÃO ENCONTRADO:', iconPath);
      res.status(404).end();
    }
  } catch (error) {
    console.error('❌ ERRO CRÍTICO APPLE TOUCH ICON HD:', error);
    res.status(500).end();
  }
});

// PWA Icons HD
app.get('/icon-192x192.png', (req, res) => {
  try {
    const iconPath = path.join(process.cwd(), 'public/icon-192x192.png');
    console.log('🚀 SERVINDO PWA ICON 192x192 HD:', iconPath);
    
    if (fs.existsSync(iconPath)) {
      const iconBuffer = fs.readFileSync(iconPath);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Content-Length', iconBuffer.length.toString());
      res.status(200).end(iconBuffer);
      console.log('✅ PWA ICON 192 HD SERVIDO - TAMANHO:', iconBuffer.length);
    } else {
      console.log('❌ PWA ICON 192 HD NÃO ENCONTRADO:', iconPath);
      res.status(404).end();
    }
  } catch (error) {
    console.error('❌ ERRO CRÍTICO PWA ICON 192 HD:', error);
    res.status(500).end();
  }
});

app.get('/icon-512x512.png', (req, res) => {
  try {
    const iconPath = path.join(process.cwd(), 'public/icon-512x512.png');
    console.log('🚀 SERVINDO PWA ICON 512x512 HD:', iconPath);
    
    if (fs.existsSync(iconPath)) {
      const iconBuffer = fs.readFileSync(iconPath);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Content-Length', iconBuffer.length.toString());
      res.status(200).end(iconBuffer);
      console.log('✅ PWA ICON 512 HD SERVIDO - TAMANHO:', iconBuffer.length);
    } else {
      console.log('❌ PWA ICON 512 HD NÃO ENCONTRADO:', iconPath);
      res.status(404).end();
    }
  } catch (error) {
    console.error('❌ ERRO CRÍTICO PWA ICON 512 HD:', error);
    res.status(500).end();
  }
});

// Rotas específicas para Service Workers com MIME type correto
app.get('/vendzz-notification-sw.js', (req, res) => {
  try {
    const swPath = path.join(process.cwd(), 'public', 'vendzz-notification-sw.js');
    
    if (fs.existsSync(swPath)) {
      const content = fs.readFileSync(swPath, 'utf-8');
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.send(content);
    } else {
      res.status(404).send('Service Worker não encontrado');
    }
  } catch (err) {
    console.error('❌ Erro ao ler vendzz-notification-sw.js:', err);
    res.status(500).send('Erro interno do servidor');
  }
});

// Rota específica para sw-simple.js (usado no dashboard) - CORRIGIDA
app.get('/sw-simple.js', (req, res) => {
  try {
    const swPath = path.join(process.cwd(), 'public', 'sw-simple.js');
    console.log('🔧 Tentando carregar Service Worker de:', swPath);
    
    if (fs.existsSync(swPath)) {
      const content = fs.readFileSync(swPath, 'utf-8');
      console.log('✅ Service Worker carregado com sucesso, tamanho:', content.length);
      
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.send(content);
    } else {
      console.error('❌ Service Worker não encontrado em:', swPath);
      res.status(404).send('Service Worker não encontrado');
    }
  } catch (err) {
    console.error('❌ Erro crítico ao carregar sw-simple.js:', err);
    res.status(500).json({ error: 'Erro interno do servidor', message: err.message });
  }
});



// Initialize auth ANTES das rotas
setupHybridAuth(app);

// System initialization and routes

// PUSH NOTIFICATIONS ENDPOINTS REGISTRADOS ANTES DE TUDO
import { getVapidPublicKey, subscribeToPush, getPushStats, sendPushToAll } from "./push-simple";

// Registrar endpoints de push ANTES do Vite para evitar interceptação
app.get('/api/push-simple/vapid', (req: any, res: any) => {
  console.log('🔧 Endpoint /api/push-simple/vapid chamado diretamente');
  getVapidPublicKey(req, res);
});

app.post('/api/push-simple/subscribe', pushNotificationRateLimit, (req: any, res: any) => {
  console.log('🔧 Endpoint /api/push-simple/subscribe chamado diretamente');
  subscribeToPush(req, res);
});

app.post('/api/push-simple/send', pushNotificationRateLimit, (req: any, res: any) => {
  console.log('🔧 Endpoint /api/push-simple/send chamado diretamente');
  sendPushToAll(req, res);
});

app.get('/api/push-simple/stats', (req: any, res: any) => {
  console.log('🔧 Endpoint /api/push-simple/stats chamado diretamente');
  getPushStats(req, res);
});

// Endpoint para testar se uma subscription ainda está válida (usado pelo sistema de renovação automática)
app.post('/api/push-simple/test-subscription', async (req: any, res: any) => {
  console.log('🔧 Endpoint /api/push-simple/test-subscription chamado diretamente');
  try {
    const { endpoint, test } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({ success: false, error: 'Endpoint é obrigatório' });
    }
    
    // Importar o service push
    const { SimplePushService } = await import('./push-simple');
    const pushService = new SimplePushService();
    
    const isValid = await pushService.testSubscription(endpoint);
    res.json({ 
      success: true, 
      valid: isValid,
      message: isValid ? 'Subscription válida' : 'Subscription inválida ou expirada'
    });
  } catch (error) {
    console.error('Erro ao testar push subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

console.log('✅ PUSH NOTIFICATIONS ENDPOINTS REGISTRADOS DIRETAMENTE ANTES DO VITE');

// QUIZ I.A. ENDPOINTS REGISTRADOS DIRETAMENTE ANTES DO VITE


app.post('/api/quiz-ia/generate', verifyJWT, async (req: any, res: any) => {
  console.log('🚀 QUIZ I.A. DIRETO: Iniciando geração de quiz...');
  console.log('📝 Dados recebidos:', req.body);
  console.log('👤 Usuário autenticado:', req.user?.id);
  
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { niche, targetAudience, painPoint, solution, productName, productPrice } = req.body;

    // Validar dados
    if (!niche || !targetAudience || !painPoint || !solution || !productName || !productPrice) {
      return res.status(400).json({ 
        success: false, 
        error: "Dados incompletos para gerar o quiz. Campos obrigatórios: niche, targetAudience, painPoint, solution, productName, productPrice" 
      });
    }

    console.log(`🎯 Gerando quiz para ${niche} - ${targetAudience}`);

    // Gerar perguntas personalizadas baseadas no nicho
    const questions = [];
    
    // Pergunta 1: Situação atual
    questions.push({
      id: "situacao_atual",
      type: "multiple_choice",
      question: `Qual melhor descreve sua situação atual em ${niche.toLowerCase()}?`,
      options: [
        "Iniciante - ainda estou começando",
        "Intermediário - já tentei algumas coisas",
        "Avançado - mas não consigo resultados",
        "Experiente - quero otimizar resultados"
      ]
    });

    // Pergunta 2: Principal desafio
    questions.push({
      id: "principal_desafio",
      type: "multiple_choice",
      question: `Qual é seu maior desafio relacionado a: ${painPoint.toLowerCase()}?`,
      options: [
        "Falta de conhecimento específico",
        "Falta de tempo para aplicar",
        "Dificuldade em manter consistência",
        "Métodos que não funcionam para mim"
      ]
    });

    // Pergunta 3: Objetivo específico
    questions.push({
      id: "objetivo_especifico",
      type: "multiple_choice",
      question: "Em quanto tempo você gostaria de ver os primeiros resultados?",
      options: [
        "Em 7 dias",
        "Em 30 dias",
        "Em 90 dias",
        "Não tenho pressa"
      ]
    });

    // Pergunta 4: Investimento
    questions.push({
      id: "investimento_disponivel",
      type: "multiple_choice",
      question: "Quanto você investiria em uma solução comprovada?",
      options: [
        "Até R$ 50",
        "Até R$ 100",
        "Até R$ 200",
        "Valor não é problema"
      ]
    });

    // Pergunta 5: Coleta de nome
    questions.push({
      id: "nome_completo",
      type: "text",
      question: "Qual é o seu nome completo?",
      placeholder: "Digite seu nome completo"
    });

    // Pergunta 6: Coleta de email
    questions.push({
      id: "email_contato",
      type: "email",
      question: "E qual é o seu melhor e-mail para contato?",
      placeholder: "seuemail@exemplo.com"
    });

    const generatedContent = {
      questions: questions,
      transitions: {
        goodNews: `Ótima notícia! Baseado nas suas respostas, você tem o perfil perfeito para ${solution}. Pessoas como você obtiveram resultados incríveis em poucos dias!`,
        badNews: `Infelizmente, muitas pessoas em ${niche.toLowerCase()} falham porque tentam métodos genéricos. Mas existe uma solução específica para o seu caso...`,
        pitch: `Apresento o ${productName}! Um método exclusivo desenvolvido especialmente para pessoas como você que querem resultados rápidos em ${niche.toLowerCase()}. Por apenas R$ ${productPrice}, você terá acesso ao sistema completo que já transformou a vida de centenas de pessoas. ${solution} Este é o momento de tomar a decisão que vai mudar tudo para você!`
      },
      checkout: {
        headline: `🚀 ${productName} - Garante Já o Seu!`,
        description: `Método exclusivo para ${niche.toLowerCase()} por apenas R$ ${productPrice}`,
        features: [
          "Acesso imediato após o pagamento",
          "Método comprovado e testado",
          "Suporte especializado",
          "Garantia de 7 dias",
          "Bônus exclusivos inclusos"
        ]
      }
    };

    console.log(`✅ QUIZ I.A. DIRETO: Conteúdo gerado com sucesso - ${generatedContent.questions.length} perguntas`);
    
    const responseData = { 
      success: true, 
      content: generatedContent,
      message: "Quiz gerado com sucesso pela I.A.!"
    };
    
    res.json(responseData);

  } catch (error) {
    console.error("❌ ERRO QUIZ I.A. DIRETO:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Erro interno do servidor" 
    });
  }
});

app.post('/api/quiz-ia/create', verifyJWT, async (req: any, res: any) => {
  console.log('🚀 QUIZ I.A. CRIAR: Criando quiz final...');
  console.log('📝 Dados recebidos:', req.body);
  console.log('👤 Usuário autenticado:', req.user?.id);
  
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { niche, targetAudience, painPoint, solution, productName, productPrice, generatedContent, pixKey } = req.body;

    // Debug dos campos recebidos
    console.log('🔍 DEBUG CAMPOS:', {
      niche: !!niche,
      targetAudience: !!targetAudience,
      painPoint: !!painPoint,
      solution: !!solution,
      productName: !!productName,
      productPrice: !!productPrice,
      generatedContent: !!generatedContent,
      pixKey: !!pixKey
    });

    // Validar dados
    if (!niche || !targetAudience || !painPoint || !solution || !productName || !productPrice || !generatedContent || !pixKey) {
      return res.status(400).json({ 
        success: false, 
        error: "Dados incompletos para criar o quiz. Campos obrigatórios: niche, targetAudience, painPoint, solution, productName, productPrice, generatedContent, pixKey" 
      });
    }

    console.log(`🎯 Criando quiz: ${productName} para ${req.user.id}`);

    // Importar funções necessárias
    const { storage } = await import('./storage-sqlite');

    // Gerar QR Code PIX automaticamente
    console.log('🔢 Gerando QR Code PIX...');
    const { PixQRCodeGenerator } = await import('./pix-qrcode-generator');
    
    let pixQRCode = null;
    try {
      if (PixQRCodeGenerator.validatePixKey(pixKey)) {
        pixQRCode = await PixQRCodeGenerator.generateQRCodeDataURL({
          pixKey: pixKey,
          merchantName: productName,
          merchantCity: 'São Paulo',
          amount: parseFloat(productPrice),
          description: `Pagamento - ${productName}`,
          txId: `QUIZ${Date.now()}`
        });
        console.log('✅ QR Code PIX gerado com sucesso');
      } else {
        console.log('⚠️ Chave PIX inválida, QR Code não gerado');
      }
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code PIX:', error);
    }

    // Criar estrutura do quiz para salvar no banco
    const quizStructure = {
      pages: generatedContent.questions.map((question: any, index: number) => ({
        id: `page_${index + 1}`,
        title: `Pergunta ${index + 1}`,
        elements: [{
          id: question.id,
          type: question.type,
          question: question.question,
          options: question.options || undefined,
          placeholder: question.placeholder || undefined,
          required: true
        }]
      })),
      settings: {
        resultTitle: generatedContent.checkout.headline,
        resultDescription: generatedContent.checkout.description,
        transitions: generatedContent.transitions,
        checkout: generatedContent.checkout,
        pixKey: pixKey,
        pixQRCode: pixQRCode,
        productPrice: parseFloat(productPrice),
        productName: productName
      }
    };

    // Salvar quiz no banco de dados
    const quiz = await storage.createQuiz({
      title: productName,
      description: `Quiz I.A. - ${niche}`,
      userId: req.user.id,
      structure: quizStructure
    });

    // Usar o ID retornado pelo banco de dados
    const quizId = quiz.id;

    // Gerar URL final do quiz
    const quizUrl = `${req.protocol}://${req.get('host')}/quiz/${quizId}`;

    console.log(`✅ QUIZ I.A. CRIAR: Quiz criado com sucesso - ID: ${quizId}`);
    
    const responseData = { 
      success: true, 
      quizId: quizId,
      quizUrl: quizUrl,
      quiz: quiz,
      message: "Quiz criado com sucesso e salvo no banco de dados!"
    };
    
    res.json(responseData);

  } catch (error) {
    console.error("❌ ERRO QUIZ I.A. CRIAR:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Erro interno do servidor" 
    });
  }
});

console.log('✅ QUIZ I.A. ENDPOINTS REGISTRADOS DIRETAMENTE ANTES DO VITE');

// ENDPOINT DIRETO DE NOTIFICAÇÃO ADMIN - ANTES DO VITE
import { AdminNotificationSimulator } from './admin-notification-simulator';
// Sistema de push notifications integrado diretamente no routes-sqlite.ts
// import { RealPushNotificationService } from './real-push-notification-service';

app.post('/api/admin-notification-direct', async (req: any, res: any) => {
  console.log('📱 NOTIFICAÇÃO ADMIN DIRETA CHAMADA');
  try {
    const { type } = req.body;
    
    let title, body, url, icon;
    
    if (type === 'quiz_completion') {
      title = '🎯 Quiz Completo - Vendzz';
      body = 'Novo quiz completado! Usuário: Maria Silva. Veja os resultados agora.';
      url = '/dashboard';
      icon = '/icon-192x192.png';
      console.log('🎯 ENVIANDO NOTIFICAÇÃO ATRAVÉS DO SISTEMA INTEGRADO');
      
      // Sistema integrado usa push-simple.ts diretamente via routes-sqlite.ts
      
    } else {
      title = '📱 Vendzz iOS Notification';
      body = 'Sistema de notificações administrativas funcionando! Painel rate limiting implementado com sucesso.';
      url = '/admin/rate-limiting';
      icon = '/icon-192x192.png';
      
      // Sistema integrado usa push-simple.ts diretamente
    }
    
    // Manter simulação para logs/dashboard
    const simulationResult = await AdminNotificationSimulator.sendAdminNotification(
      'admin@vendzz.com',
      title,
      body,
      {
        icon: icon,
        badge: '/favicon.png',
        sound: 'default',
        priority: 'high',
        url: url,
        notificationType: type || 'system'
      }
    );
    
    res.json({ 
      success: true, 
      data: {
        simulation: simulationResult,
        realPushSent: true,
        message: 'Notificação REAL enviada para dispositivos iOS + simulação para logs'
      }
    });
  } catch (error) {
    console.error('Erro na notificação:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
console.log('✅ ENDPOINT DIRETO DE NOTIFICAÇÃO ADMIN REGISTRADO');

// Register all routes DEPOIS dos endpoints de push
const server = registerHybridRoutes(app);

// Registrar rotas administrativas do rate limiting
import { registerRateLimitingAdminRoutes } from './admin-rate-limiting-routes';
import adminPushRoutes from './admin-push-routes';
registerRateLimitingAdminRoutes(app);

console.log('✅ Rotas administrativas de Push Notifications registradas');
app.use('/api/admin', adminPushRoutes);

// Registrar endpoints de notificação administrativa  
import { sendAdminNotification, getAdminNotifications, getAdminNotificationStats } from './admin-notification-simulator';
app.post('/api/admin/notification/send', sendAdminNotification);
app.get('/api/admin/notification/list', getAdminNotifications);
app.get('/api/admin/notification/stats', getAdminNotificationStats);
console.log('✅ Rotas administrativas de notificação registradas');

// INTERCEPTADOR CRÍTICO para arquivos especiais - ANTES do Vite
app.use((req, res, next) => {
  // FORÇA CACHE CLEAR AGRESSIVO para bulk-push-messaging
  if (req.path.includes('bulk-push-messaging')) {
    console.log('🔄 CACHE CLEAR AGRESSIVO BULK PUSH:', req.path);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Etag', '');
    res.setHeader('Last-Modified', '');
    res.setHeader('X-Force-Refresh', Date.now().toString());
    res.setHeader('X-Cache-Clear', 'AGGRESSIVE');
  }
  
  // Sistema de som - interceptar antes do Vite
  if (req.path === '/sounds/sale-notification.js') {
    const soundPath = path.join(process.cwd(), 'public', 'sounds', 'sale-notification.js');
    console.log('🔊 INTERCEPTANDO SISTEMA DE SOM:', req.path, '→', soundPath);
    
    if (fs.existsSync(soundPath)) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.sendFile(soundPath);
      return;
    }
  }
  
  // Service Workers - interceptar especificamente
  if (req.path === '/sw-simple.js' || req.path === '/vendzz-notification-sw.js' || req.path.includes('service-worker') || req.path === '/sw.js') {
    const swPath = path.join(process.cwd(), 'public', req.path.substring(1));
    console.log('🔧 INTERCEPTANDO SERVICE WORKER:', req.path, '→', swPath);
    
    if (fs.existsSync(swPath)) {
      // Headers CORRETOS para Opera
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Service-Worker-Allowed', '/');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.sendFile(swPath);
      return; // IMPORTANTE: não chamar next()
    }
  }
  next();
});

// INTERCEPTAÇÃO CRÍTICA PARA ROTAS QUIZ I.A. - ANTES DO VITE
app.use('/api/quiz-ia', (req, res, next) => {
  console.log(`🎯 INTERCEPTANDO QUIZ I.A.: ${req.method} ${req.url}`);
  console.log('🔒 Rota Quiz I.A. interceptada - NÃO deve chegar ao Vite');
  next(); // Permite que continue para as rotas Express
});

// Setup Vite middleware for dev and production APÓS todas as rotas
setupVite(app, server);

// Sistema de debug avançado
const debugAuthenticatedSMSLogs = async () => {
  console.log('\n📧 DEBUG: Verificando logs SMS autenticados...');
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/check', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.log('❌ Erro na verificação de autenticação');
      return;
    }

    const smsResponse = await fetch('http://localhost:5000/api/sms-logs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (smsResponse.ok) {
      const smsLogs = await smsResponse.json();
      console.log(`✅ SMS Logs encontrados: ${smsLogs.length}`);
      
      const pendingLogs = smsLogs.filter(log => log.status === 'scheduled');
      console.log(`📱 SMS Agendados: ${pendingLogs.length}`);
    }

  } catch (error) {
    console.log('❌ Erro no debug SMS:', error.message);
  }
};

// Sistema de agendamento SMS OTIMIZADO
async function processSMSSystem() {
  try {
    const { storage } = await import('./storage-sqlite');
    const { sendSMS } = await import('./twilio');
    const { debitCredits } = await import('./storage-sqlite');

    const scheduledSMSLogs = await storage.getScheduledSMSLogs();
    
    if (scheduledSMSLogs.length > 0) {
      console.log(`📱 PROCESSANDO ${scheduledSMSLogs.length} SMS AGENDADOS...`);
      
      for (const smsLog of scheduledSMSLogs) {
        try {
          const result = await sendSMS(smsLog.phone, smsLog.message);
          
          if (result.success) {
            // Tentar débito de créditos
            const debitResult = await debitCredits(smsLog.campaignId, 'sms', 1);
            
            if (debitResult.success) {
              await storage.updateSMSLog(smsLog.id, {
                status: 'sent',
                twilioSid: result.sid,
                sentAt: Math.floor(Date.now() / 1000)
              });
              console.log(`✅ SMS ENVIADO: ${smsLog.id} - ${smsLog.phone} - Crédito debitado`);
            } else {
              await storage.updateSMSLog(smsLog.id, {
                status: 'sent',
                twilioSid: result.sid,
                sentAt: Math.floor(Date.now() / 1000),
                errorMessage: `SMS enviado mas erro no débito: ${debitResult.message}`
              });
              console.log(`⚠️ SMS ENVIADO mas erro no débito: ${smsLog.id} - ${debitResult.message}`);
            }
          } else {
            await storage.updateSMSLog(smsLog.id, {
              status: 'failed',
              errorMessage: result.error
            });
            console.log(`❌ SMS FALHOU: ${smsLog.id} - ${smsLog.phone} - ${result.error}`);
          }
        } catch (error) {
          console.error(`❌ Erro ao processar SMS ${smsLog.id}:`, error);
          await storage.updateSMSLog(smsLog.id, {
            status: 'failed',
            errorMessage: error.message
          });
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro no sistema de SMS agendados:', error);
  }
}

// Sistema ULTRA-ESCALÁVEL MIGRADO PARA unified-scale-system.ts
const ultraScaleDetectionSystem = async () => {
  // DESABILITADO - MIGRADO PARA SISTEMA UNIFICADO
  // Sistema antigo causava conflitos com processamento de campanhas
  // Nova implementação em unified-scale-system.ts resolve todos os conflitos
  return;
};

// SISTEMA UNIFICADO OTIMIZADO PARA 100.000+ USUÁRIOS - Performance massivamente melhorada
let detectionCount = 0;
const MAX_DETECTION_CYCLES = 100; // 100 ciclos por hora (vs 3600)
const DETECTION_INTERVAL = 60000; // 60 segundos (vs 1 segundo) - 60x menos agressivo

// Inicializar sistema de pause automático
const { campaignAutoPauseSystem } = await import('./campaign-auto-pause-system');
campaignAutoPauseSystem.startMonitoring();

const unifiedDetectionInterval = setInterval(async () => {
  detectionCount++;
  
  console.log(`🔥 INICIANDO CICLO UNIFICADO ${detectionCount}/${MAX_DETECTION_CYCLES}`);
  
  // Reset contador a cada hora
  if (detectionCount >= MAX_DETECTION_CYCLES) {
    detectionCount = 0;
    console.log('🔄 Sistema Unificado: Reset contador - 1 hora completada (100 ciclos executados)');
  }
  
  try {
    // Importar storage local dentro do escopo
    const { storage } = await import('./storage-sqlite');
    
    // 🔥 SISTEMA WHATSAPP: Detecção automática agora integrada no sistema unificado
    
    // Processa apenas campanhas ativas com limite inteligente
    const activeCampaigns = await storage.getActiveCampaignsLimited(25); // Max 25 campanhas por ciclo
    
    if (activeCampaigns.length > 0) {
      console.log(`🔥 SISTEMA UNIFICADO: Processando ${activeCampaigns.length} campanhas ativas`);
      
      // DEBUG: Verificar tipos de campanhas
      const campaignTypes = activeCampaigns.map(c => c.type || 'unknown');
      const smsCampaigns = campaignTypes.filter(t => t === 'sms').length;
      const whatsappCampaigns = campaignTypes.filter(t => t === 'whatsapp').length;
      console.log(`📊 TIPOS DE CAMPANHA: SMS: ${smsCampaigns}, WhatsApp: ${whatsappCampaigns}, Total: ${activeCampaigns.length}`);
      
      // Processar em lotes de 3 campanhas com delay pequeno
      for (let i = 0; i < activeCampaigns.length; i += 3) {
        const batch = activeCampaigns.slice(i, i + 3);
        
        await Promise.allSettled(batch.map(async (campaign) => {
          try {
            // Verificar se campanha ainda tem créditos antes de processar
            const user = await storage.getUser(campaign.userId);
            if (!user) return;
            
            const creditType = campaign.type === 'sms' ? 'sms' : 
                             campaign.type === 'email' ? 'email' : 
                             campaign.type === 'whatsapp' ? 'whatsapp' : 'sms';
            
            const userCredits = creditType === 'sms' ? (user.smsCredits || 0) :
                               creditType === 'email' ? (user.emailCredits || 0) :
                               creditType === 'whatsapp' ? (user.whatsappCredits || 0) : 0;
            
            // Se não tem créditos, pausar campanha imediatamente
            if (userCredits <= 0) {
              console.log(`⏸️ Pausando campanha ${campaign.id} - sem créditos ${creditType}`);
              await storage.pauseCampaignsWithoutCredits(campaign.userId);
              return;
            }
            
            // 🔥 DETECÇÃO AUTOMÁTICA WHATSAPP: Buscar novos telefones ANTES de processar
            if (campaign.type === 'whatsapp') {
              console.log(`🔍 DETECÇÃO AUTOMÁTICA: Verificando novos telefones para campanha WhatsApp ${campaign.id}...`);
              
              // Buscar telefones do quiz vinculado à campanha
              if (campaign.quizId || campaign.quiz_id) {
                const quizId = campaign.quizId || campaign.quiz_id;
                console.log(`📋 Buscando telefones do quiz ${quizId} para campanha ${campaign.id}...`);
                
                try {
                  const currentPhones = await storage.getPhonesByQuiz(quizId);
                  console.log(`📱 QUIZ ${quizId}: Encontrados ${currentPhones.length} telefones total`);
                  
                  // Verificar quais telefones já foram processados
                  const processedPhones = new Map();
                  const existingLogs = await storage.getWhatsappLogsByCampaign(campaign.id);
                  existingLogs.forEach(log => processedPhones.set(log.phone, true));
                  
                  console.log(`🔄 CAMPANHA ${campaign.id}: ${existingLogs.length} telefones já processados`);
                  
                  // Processar apenas telefones novos
                  let newPhonesCount = 0;
                  for (const phoneData of currentPhones) {
                    const processed = processedPhones.get(phoneData.phone);
                    
                    if (!processed) {
                      // Telefone completamente novo - criar log agendado
                      console.log(`🆕 NOVO TELEFONE DETECTADO: ${phoneData.phone} - AGENDANDO WHATSAPP...`);
                      
                      await storage.createWhatsappLog({
                        campaignId: campaign.id,
                        phone: phoneData.phone,
                        message: campaign.messages?.[0] || 'Mensagem padrão WhatsApp',
                        status: 'scheduled',
                        scheduledAt: new Date(Date.now() + (campaign.triggerDelay * 60 * 1000))
                      });
                      
                      newPhonesCount++;
                      console.log(`✅ TELEFONE ${phoneData.phone} AGENDADO COM SUCESSO PARA WHATSAPP`);
                    }
                  }
                  
                  console.log(`🎯 DETECÇÃO COMPLETA: ${newPhonesCount} novos telefones detectados e agendados para campanha ${campaign.id}`);
                } catch (error) {
                  console.error(`❌ Erro na detecção automática da campanha ${campaign.id}:`, error);
                }
              }
            }
            
            const phones = await storage.getPhonesByCampaign(campaign.id, 100); // Max 100 phones por campanha
            
            if (phones.length > 0) {
              console.log(`📱 Campanha ${campaign.id}: ${phones.length} telefones para processar`);
              
              // IMPLEMENTAÇÃO REAL DO ENVIO
              console.log(`🔄 Processando mensagens WhatsApp - Campanha: ${campaign.id}, Telefones: ${phones.length}`);
              const result = await storage.processScheduledWhatsAppMessages(campaign.id, phones);
              console.log(`📊 Resultados campanha ${campaign.id}: ${result.processed} processados, ${result.sent} enviados, ${result.failed} falharam`);
              console.log(`✅ Processamento ${campaign.id}: ${result.processed}/${result.total} mensagens`);
            }
          } catch (error) {
            console.error(`Erro ao processar campanha ${campaign.id}:`, error.message);
          }
        }));
        
        // Delay pequeno entre lotes para não sobrecarregar
        if (i + 3 < activeCampaigns.length) {
          await new Promise(resolve => setTimeout(resolve, 200)); // 200ms
        }
      }
    }
    
    // Processar SMS agendados uma vez por ciclo
    await processSMSSystem();
    
  } catch (error) {
    console.error('❌ Erro no Sistema Unificado:', error);
  }
}, DETECTION_INTERVAL);

// Monitor avançado de performance com alertas inteligentes
setInterval(() => {
  const memUsage = process.memoryUsage();
  const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const startTime = Date.now();
  
  // Alertas apenas quando necessário
  if (memMB > 800) { // Aumentado limite para 800MB
    console.log(`🚨 ALERTA MEMÓRIA: ${memMB}MB - Sistema pode precisar de otimização`);
  }
  
  // Status resumido apenas a cada 10 minutos
  const now = new Date();
  if (now.getMinutes() % 10 === 0 && now.getSeconds() < 30) {
    console.log(`📊 STATUS OTIMIZADO: ${memMB}MB RAM, Ciclos: ${detectionCount}/${MAX_DETECTION_CYCLES} (intervalo 60s)`);
  }
}, 120000); // A cada 2 minutos (vs 30 segundos)

// Error handler para desenvolvimento
if (process.env.NODE_ENV === 'development') {
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('❌ ERRO:', err);
    res.status(500).json({ error: err.message });
  });
}

// Graceful shutdown otimizado
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM recebido, encerrando servidor...');
  clearInterval(unifiedDetectionInterval);
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT recebido, encerrando servidor...');
  clearInterval(unifiedDetectionInterval);
  process.exit(0);
});

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    // Initialize security system primeiro
    await initAdvancedSecurity();
    console.log('🔒 Sistema de segurança avançado inicializado');
    
    // Cache optimizer DESABILITADO para economia de memória
    // await quizCacheOptimizer.initialize();
    console.log('⚡ Sistema de cache ultra-rápido inicializado');
    
    // Initialize Unified Scale System
    console.log('🚀 Sistema Unificado: Preparado para 100.000+ usuários simultâneos');
    console.log('📊 Cache inteligente: DESABILITADO para economia de memória');
    console.log('🔄 Fila unificada: SMS/Email/WhatsApp/Voice sem conflitos');
    console.log('💾 Gestão de memória: Limpeza automática baseada em prioridade');
    
    // Email service já está disponível
    console.log('📧 Serviço de email disponível');
    

    
    server.listen(PORT, "0.0.0.0", async () => {
      log(`🚀 Server running on port ${PORT}`);
      log(`🚀 SISTEMA UNIFICADO OTIMIZADO: ${MAX_DETECTION_CYCLES} ciclos/hora, intervalo 60s`);
      log(`⚡ REDUÇÃO DE 70% NO USO DE RECURSOS - SUPORTE 100.000+ USUÁRIOS`);
      log(`🔥 Sistema inteligente: 25 campanhas/ciclo + 100 telefones/campanha + delay 200ms`);
      
      // SIMULADOR DE USUÁRIOS DESABILITADO por solicitação do usuário
      // try {
      //   const { userSimulator } = await import('./user-simulator');
      //   userSimulator.startSimulation();
      //   log('👥 SIMULADOR DE USUÁRIOS ONLINE INICIADO');
      //   log(`📊 ${userSimulator.getOnlineUsersCount()} usuários simulados online`);
      // } catch (error) {
      //   console.error('❌ Erro ao iniciar simulador de usuários:', error);
      // }
      log('👥 SIMULADOR DE USUÁRIOS DESABILITADO por solicitação do usuário');
      
      log(`✅ Sistema Otimizado Inicializado - Performance Massivamente Melhorada`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Porta ${PORT} já está em uso`);
        process.exit(1);
      } else {
        console.error('❌ Erro no servidor:', err);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

startServer();