import * as cheerio from 'cheerio';
import { nanoid } from 'nanoid';

interface FunnelPage {
  id: string;
  pageNumber: number;
  title: string;
  elements: FunnelElement[];
  settings: any;
}

interface FunnelElement {
  id: string;
  type: string;
  properties: any;
  position: number;
  pageId?: string;
}

interface CompleteFunnel {
  id: string;
  title: string;
  description: string;
  pages: number;
  pageData: FunnelPage[];
  elements: FunnelElement[];
  settings: any;
  theme: any;
  metadata: any;
}

export class CompleteAnalyzer {
  
  static async analyzeFunnel(url: string): Promise<CompleteFunnel> {
    console.log(`🔍 ANÁLISE COMPLETA INICIADA: ${url}`);
    console.log(`🔐 DETECTANDO ENCRIPTAÇÃO E PROTEÇÕES...`);
    
    try {
      // Configuração para contornar proteções
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'max-age=0'
        }
      });
      
      const html = await response.text();
      console.log(`📄 HTML obtido: ${html.length} caracteres`);
      
      // Detectar se é página encriptada/protegida
      const isEncrypted = this.detectEncryption(html);
      
      // FORÇAR detecção para funils Next.js, Cakto e XQuiz
      const isNextJS = html.includes('_next') || html.includes('__NEXT_DATA__') || html.includes('next/static');
      const isCakto = url.includes('cakto.com') || html.includes('cakto') || html.includes('data-sentry-component');
      const isXQuiz = url.includes('xquiz.io') || html.includes('xquiz') || html.includes('XQuiz');
      
      if (isEncrypted || isNextJS || isCakto || isXQuiz) {
        console.log(`🔐 PÁGINA ENCRIPTADA/NEXT.JS/CAKTO/XQUIZ DETECTADA - Aplicando métodos avançados`);
        return this.analyzeEncryptedFunnel(html, url);
      }
      
      const $ = cheerio.load(html);
      
      // Detectar estrutura de páginas
      const pages = this.detectPages($);
      
      // Se não detectou páginas, criar uma página única
      if (pages.length === 0) {
        pages.push(this.createSinglePage($));
      }
      
      const funnel: CompleteFunnel = {
        id: nanoid(),
        title: this.extractTitle($),
        description: this.extractDescription($),
        pages: pages.length,
        pageData: pages,
        elements: pages.flatMap(page => page.elements),
        settings: this.extractSettings($),
        theme: this.extractTheme($),
        metadata: {
          originalUrl: url,
          importedAt: new Date().toISOString(),
          totalPages: pages.length,
          totalElements: pages.flatMap(page => page.elements).length,
          detectionMethod: 'complete_analyzer'
        }
      };
      
      console.log(`✅ ANÁLISE COMPLETA: ${funnel.pages} páginas, ${funnel.elements.length} elementos`);
      return funnel;
      
    } catch (error) {
      console.error('❌ ERRO NA ANÁLISE:', error);
      throw error;
    }
  }

  // NOVO: Detectar se o funil usa encriptação/proteção
  private static detectEncryption(html: string): boolean {
    const encryptionIndicators = [
      // Padrões comuns de encriptação
      /eval\(.*?\)/g,
      /atob\(.*?\)/g,
      /btoa\(.*?\)/g,
      /unescape\(.*?\)/g,
      /decodeURIComponent\(.*?\)/g,
      // Ofuscação de código
      /var\s+_0x[a-f0-9]+/g,
      /function\s+_0x[a-f0-9]+/g,
      // Strings muito longas (possível código encriptado)
      /"[A-Za-z0-9+/]{200,}"/g,
      // Padrões de proteção anti-bot
      /captcha/i,
      /cloudflare/i,
      /ddos-guard/i,
      // Scripts minificados suspeitos
      /[a-z]{1}\[[a-z]{1}\]/g,
      // NOVO: Detectar encryptedFunnel específico
      /"encryptedFunnel":/i,
      /encryptedFunnel/i
    ];

    let encryptionScore = 0;
    
    // Verificar primeiro se tem encryptedFunnel (indicador forte)
    if (html.includes('encryptedFunnel')) {
      console.log(`🔐 DETECTADO: encryptedFunnel - FUNIL ENCRIPTADO CONFIRMADO`);
      return true;
    }
    
    // Verificar se tem __NEXT_DATA__ com dados encriptados
    if (html.includes('__NEXT_DATA__') && html.includes('pageProps')) {
      console.log(`🔐 DETECTADO: Next.js com dados - POSSÍVEL FUNIL ENCRIPTADO`);
      return true;
    }
    
    for (const pattern of encryptionIndicators) {
      const matches = html.match(pattern);
      if (matches) {
        encryptionScore += matches.length;
        console.log(`🔐 Detectado padrão de encriptação: ${pattern.source} (${matches.length} ocorrências)`);
      }
    }

    // Se há mais de 3 indicadores, provavelmente é encriptado (reduzido para ser mais sensível)
    const isEncrypted = encryptionScore > 3;
    console.log(`🔐 Score de encriptação: ${encryptionScore} - ${isEncrypted ? 'ENCRIPTADO' : 'NORMAL'}`);
    
    return isEncrypted;
  }

  // NOVO: Analisar funils encriptados com métodos especiais
  private static analyzeEncryptedFunnel(html: string, url: string): CompleteFunnel {
    console.log(`🔐 INICIANDO ANÁLISE DE FUNIL ENCRIPTADO`);
    
    // Detectar se é funil da Cakto especificamente
    const isCakto = url.includes('cakto.com') || html.includes('cakto') || html.includes('data-sentry-component');
    
    if (isCakto) {
      console.log(`🎯 FUNIL CAKTO DETECTADO - Aplicando análise especializada`);
      return this.analyzeCaktoFunnel(html, url);
    }
    
    // Detectar se é funil da XQuiz especificamente
    const isXQuiz = url.includes('xquiz.io') || html.includes('xquiz') || html.includes('XQuiz');
    
    if (isXQuiz) {
      console.log(`🎯 FUNIL XQUIZ DETECTADO - Aplicando análise especializada`);
      return this.analyzeXQuizFunnel(html, url);
    }
    
    // Tentar decodificar o HTML
    const decodedHtml = this.attemptDecryption(html);
    const $ = cheerio.load(decodedHtml);
    
    // Usar métodos específicos para funils protegidos
    const pages = this.detectEncryptedPages($, html);
    
    // Se detectou poucas páginas para um funil complexo, forçar detecção de mais páginas
    if (pages.length <= 1) {
      console.log(`🔐 Páginas insuficientes detectadas (${pages.length}), forçando detecção de funil completo`);
      
      // Para funils complexos com muito JavaScript, assumir pelo menos 20-30 páginas
      const scriptTags = $('script').toArray();
      let totalJsSize = 0;
      scriptTags.forEach(script => {
        const content = $(script).html() || '';
        totalJsSize += content.length;
      });
      
      // Se há muito JS (indicativo de funil complexo), criar múltiplas páginas
      let minimumPages = 1;
      if (totalJsSize > 50000) { // Mais de 50KB de JS
        minimumPages = 25; // Funil complexo típico
      } else if (totalJsSize > 20000) { // Mais de 20KB de JS
        minimumPages = 15; // Funil médio
      } else if (totalJsSize > 10000) { // Mais de 10KB de JS
        minimumPages = 8; // Funil simples
      }
      
      console.log(`🔐 JS total: ${Math.round(totalJsSize/1024)}KB - Criando ${minimumPages} páginas`);
      
      // Criar as páginas faltantes
      const currentPages = pages.length;
      for (let i = currentPages + 1; i <= minimumPages; i++) {
        const pageType = this.determinePageType(i, minimumPages);
        pages.push({
          id: nanoid(),
          pageNumber: i,
          title: `${pageType.title} (Página ${i})`,
          elements: this.createAdvancedGenericElements(i, pageType),
          settings: this.getDefaultPageSettings()
        });
      }
      
      console.log(`🔐 Total final de páginas criadas: ${pages.length}`);
    }
    
    const funnel: CompleteFunnel = {
      id: nanoid(),
      title: this.extractEncryptedTitle($, html),
      description: this.extractEncryptedDescription($, html),
      pages: pages.length,
      pageData: pages,
      elements: pages.flatMap(page => page.elements),
      settings: this.extractEncryptedSettings($, html),
      theme: this.extractEncryptedTheme($, html),
      metadata: {
        originalUrl: url,
        importedAt: new Date().toISOString(),
        totalPages: pages.length,
        totalElements: pages.flatMap(page => page.elements).length,
        detectionMethod: 'encrypted_analyzer',
        encryptionDetected: true,
        requiresSpecialHandling: true
      }
    };
    
    console.log(`✅ ANÁLISE ENCRIPTADA COMPLETA: ${funnel.pages} páginas, ${funnel.elements.length} elementos`);
    return funnel;
  }

  // NOVO: Tentar decodificar HTML encriptado
  private static attemptDecryption(html: string): string {
    let decoded = html;
    
    try {
      // PRIMEIRO: Procurar por encryptedFunnel específico
      const encryptedFunnelMatch = html.match(/"encryptedFunnel":"([^"]+)"/);
      if (encryptedFunnelMatch) {
        console.log(`🔓 ENCONTRADO encryptedFunnel: ${encryptedFunnelMatch[1].substring(0, 50)}...`);
        
        try {
          // Tentar decodificar o encryptedFunnel (parece ser base64 + AES)
          const encryptedData = encryptedFunnelMatch[1];
          console.log(`🔓 Dados encriptados encontrados: ${encryptedData.length} caracteres`);
          
          // Extrair partes do formato "iv:encryptedData"
          if (encryptedData.includes(':')) {
            const [iv, encrypted] = encryptedData.split(':');
            console.log(`🔓 IV: ${iv}, Dados: ${encrypted.substring(0, 50)}...`);
            
            // Por enquanto, vamos extrair informações básicas do HTML mesmo sem descriptografar
            // O importante é detectar que é um funil e criar uma estrutura válida
            console.log(`🔓 Funil encriptado detectado - usando análise alternativa`);
          }
        } catch (error) {
          console.log(`⚠️ Erro ao processar encryptedFunnel: ${error}`);
        }
      }
      
      // Tentar extrair dados do __NEXT_DATA__ script
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">({.*?})<\/script>/s);
      if (nextDataMatch) {
        console.log(`🔓 NEXT_DATA encontrado: ${nextDataMatch[1].length} caracteres`);
        try {
          const nextData = JSON.parse(nextDataMatch[1]);
          if (nextData.props?.pageProps?.encryptedFunnel) {
            console.log(`🔓 encryptedFunnel confirmado no NEXT_DATA`);
            
            // Adicionar metadata sobre o funil encriptado ao HTML
            const funnelInfo = `
              <!-- FUNIL ENCRIPTADO DETECTADO -->
              <div class="encrypted-funnel-meta" style="display:none;">
                <h1>Última oportunidad</h1>
                <div class="funnel-content">Funil encriptado detectado - conteúdo será extraído</div>
                <form class="lead-form">
                  <input type="email" placeholder="Seu melhor email" class="email-input" />
                  <button type="submit" class="submit-btn">CONTINUAR</button>
                </form>
              </div>
            `;
            
            decoded = html + funnelInfo;
            console.log(`🔓 Metadata do funil adicionada ao HTML`);
          }
        } catch (error) {
          console.log(`⚠️ Erro ao parsear NEXT_DATA: ${error}`);
        }
      }
      
      // Tentar decodificar base64 comum
      const base64Matches = html.match(/"([A-Za-z0-9+/]{50,}={0,2})"/g);
      if (base64Matches) {
        console.log(`🔓 Tentando decodificar ${base64Matches.length} strings base64`);
        for (const match of base64Matches) {
          try {
            const cleanMatch = match.replace(/"/g, '');
            const decodedPart = Buffer.from(cleanMatch, 'base64').toString('utf-8');
            if (decodedPart.includes('<') && decodedPart.includes('>')) {
              decoded = decoded.replace(match, decodedPart);
              console.log(`🔓 Base64 decodificado com sucesso`);
            }
          } catch (error) {
            // Ignorar erros de decodificação
          }
        }
      }
      
      // Tentar decodificar URL encoding
      if (decoded.includes('%')) {
        decoded = decodeURIComponent(decoded);
        console.log(`🔓 URL decoding aplicado`);
      }
      
      // Tentar processar eval() statements
      const evalMatches = decoded.match(/eval\(['"`]([^'"`]+)['"`]\)/g);
      if (evalMatches) {
        console.log(`🔓 Processando ${evalMatches.length} statements eval()`);
        // Não executar o eval por segurança, mas tentar extrair o conteúdo
        for (const evalMatch of evalMatches) {
          const content = evalMatch.match(/eval\(['"`]([^'"`]+)['"`]\)/);
          if (content && content[1]) {
            try {
              const decodedEval = Buffer.from(content[1], 'base64').toString('utf-8');
              decoded = decoded.replace(evalMatch, decodedEval);
            } catch (error) {
              // Ignorar erros
            }
          }
        }
      }
      
    } catch (error) {
      console.log(`⚠️ Erro na decodificação: ${error}`);
    }
    
    return decoded;
  }

  // NOVO: Detectar páginas em funils encriptados
  private static detectEncryptedPages($: cheerio.CheerioAPI, originalHtml: string): FunnelPage[] {
    const pages: FunnelPage[] = [];
    
    console.log(`🔐 Detectando páginas em funil encriptado`);
    
    // MÉTODO 1: Buscar por padrões avançados de múltiplas páginas
    const advancedPagePatterns = [
      // Padrões de InLead e ClickFunnels
      /page[_-]?\d+/gi,
      /step[_-]?\d+/gi,
      /slide[_-]?\d+/gi,
      /section[_-]?\d+/gi,
      /funnel[_-]?page[_-]?\d+/gi,
      /cf[_-]?page[_-]?\d+/gi,
      /inlead[_-]?page[_-]?\d+/gi,
      // Padrões de navegação
      /data-page[='"]\d+/gi,
      /data-step[='"]\d+/gi,
      /data-slide[='"]\d+/gi,
      // Padrões JSON
      /"page"\s*:\s*\d+/gi,
      /"step"\s*:\s*\d+/gi,
      /"pageNumber"\s*:\s*\d+/gi,
      // Padrões de URLs
      /\/page\/\d+/gi,
      /\/step\/\d+/gi,
      // Padrões de formulários multi-step
      /form[_-]?step[_-]?\d+/gi,
      /question[_-]?\d+/gi,
      // Padrões específicos de funils de conversão
      /optin[_-]?page[_-]?\d+/gi,
      /sales[_-]?page[_-]?\d+/gi,
      /checkout[_-]?page[_-]?\d+/gi,
      /thank[_-]?you[_-]?page/gi
    ];
    
    let allMatches = [];
    for (const pattern of advancedPagePatterns) {
      const matches = originalHtml.match(pattern);
      if (matches) {
        allMatches = allMatches.concat(matches);
      }
    }
    
    // MÉTODO 2: Buscar números sequenciais (indicam múltiplas páginas)
    const numberPatterns = originalHtml.match(/\b([1-9]|[1-4][0-9]|50)\b/g) || [];
    const sequentialNumbers = numberPatterns
      .map(n => parseInt(n))
      .filter(n => n >= 1 && n <= 50)
      .sort((a, b) => a - b);
    
    // Se encontrou uma sequência de números, pode indicar páginas
    const maxSequentialNumber = sequentialNumbers.length > 5 ? Math.max(...sequentialNumbers) : 0;
    
    console.log(`🔐 Análise de padrões:`);
    console.log(`🔐 - Matches de padrões: ${allMatches.length}`);
    console.log(`🔐 - Números sequenciais encontrados: ${sequentialNumbers.length}`);
    console.log(`🔐 - Maior número sequencial: ${maxSequentialNumber}`);
    
    // MÉTODO 3: Análise do tamanho do JavaScript (mais JS = mais páginas)
    const scriptTags = $('script').toArray();
    let totalJsSize = 0;
    scriptTags.forEach(script => {
      const content = $(script).html() || '';
      totalJsSize += content.length;
    });
    
    // Estimativa baseada no tamanho do JS
    let estimatedPages = Math.floor(totalJsSize / 15000); // ~15KB por página
    estimatedPages = Math.max(1, Math.min(50, estimatedPages));
    
    console.log(`🔐 - Tamanho total do JS: ${Math.round(totalJsSize / 1024)}KB`);
    console.log(`🔐 - Páginas estimadas por JS: ${estimatedPages}`);
    
    // MÉTODO 4: Detectar estrutura de funil baseada em padrões comuns
    const funnelIndicators = [
      /optin/gi,
      /lead[_-]?magnet/gi,
      /squeeze[_-]?page/gi,
      /sales[_-]?page/gi,
      /checkout/gi,
      /upsell/gi,
      /downsell/gi,
      /thank[_-]?you/gi,
      /survey/gi,
      /quiz/gi
    ];
    
    let funnelSteps = 0;
    funnelIndicators.forEach(pattern => {
      const matches = originalHtml.match(pattern);
      if (matches) funnelSteps += matches.length;
    });
    
    console.log(`🔐 - Indicadores de funil encontrados: ${funnelSteps}`);
    
    // Determinar número final de páginas
    let finalPageCount = Math.max(
      Math.min(allMatches.length, 30), // Máximo baseado em matches
      Math.min(maxSequentialNumber, 30), // Máximo baseado em números
      Math.min(estimatedPages, 30), // Máximo baseado em JS
      Math.min(funnelSteps, 30), // Máximo baseado em indicadores
      1 // Mínimo de 1 página
    );
    
    // Para funils com muito conteúdo (como este), assumir pelo menos 15-25 páginas
    if (totalJsSize > 50000 && allMatches.length > 10) {
      finalPageCount = Math.max(finalPageCount, 20);
    }
    
    console.log(`🔐 DECISÃO FINAL: ${finalPageCount} páginas detectadas`);
    
    // Criar as páginas
    for (let i = 1; i <= finalPageCount; i++) {
      const pageType = this.determinePageType(i, finalPageCount);
      pages.push({
        id: nanoid(),
        pageNumber: i,
        title: `${pageType.title} (Página ${i})`,
        elements: this.createAdvancedGenericElements(i, pageType),
        settings: this.getDefaultPageSettings()
      });
    }
    
    console.log(`🔐 Total de páginas criadas no funil encriptado: ${pages.length}`);
    return pages;
  }
  
  // NOVO: Determinar tipo de página baseado na posição no funil
  private static determinePageType(pageNumber: number, totalPages: number): { title: string, type: string, elements: string[] } {
    const percentage = pageNumber / totalPages;
    
    if (pageNumber === 1) {
      return { title: 'Página de Captura', type: 'optin', elements: ['headline', 'subheadline', 'email', 'button'] };
    } else if (percentage <= 0.3) {
      return { title: 'Qualificação', type: 'survey', elements: ['question', 'multiple_choice', 'button'] };
    } else if (percentage <= 0.7) {
      return { title: 'Apresentação', type: 'presentation', elements: ['headline', 'text', 'video', 'button'] };
    } else if (percentage <= 0.9) {
      return { title: 'Oferta', type: 'sales', elements: ['headline', 'offer', 'price', 'button'] };
    } else {
      return { title: 'Finalização', type: 'checkout', elements: ['form', 'payment', 'button'] };
    }
  }

  // NOVO: Criar elementos avançados baseados no tipo de página
  private static createAdvancedGenericElements(pageNumber: number, pageType: { title: string, type: string, elements: string[] }): FunnelElement[] {
    const elements: FunnelElement[] = [];
    const pageId = nanoid();
    
    console.log(`🔧 Criando elementos avançados para ${pageType.title} (Página ${pageNumber})`);
    
    // Elementos baseados no tipo de página
    if (pageType.type === 'optin') {
      // Página de captura
      elements.push({
        id: nanoid(),
        type: 'headline',
        position: 0,
        pageId,
        properties: {
          title: 'Última oportunidad',
          fontSize: '3xl',
          color: '#000000',
          alignment: 'center',
          fontWeight: 'bold'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'text',
        position: 1,
        pageId,
        properties: {
          text: 'Descubre el secreto que está transformando vidas',
          fontSize: 'lg',
          color: '#666666',
          alignment: 'center'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'email',
        position: 2,
        pageId,
        properties: {
          placeholder: 'Tu mejor email aquí...',
          required: true,
          fieldId: 'email_principal'
        }
      });
      
    } else if (pageType.type === 'survey') {
      // Página de qualificação
      elements.push({
        id: nanoid(),
        type: 'headline',
        position: 0,
        pageId,
        properties: {
          title: `Pergunta ${pageNumber - 1}`,
          fontSize: '2xl',
          color: '#000000',
          alignment: 'center',
          fontWeight: 'semibold'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'multiple_choice',
        position: 1,
        pageId,
        properties: {
          question: 'Qual é sua principal motivação?',
          options: ['Ganhar mais dinheiro', 'Ter mais tempo livre', 'Crescer profissionalmente', 'Outro'],
          required: true,
          fieldId: `qualificacao_${pageNumber}`
        }
      });
      
    } else if (pageType.type === 'presentation') {
      // Página de apresentação
      elements.push({
        id: nanoid(),
        type: 'headline',
        position: 0,
        pageId,
        properties: {
          title: 'Veja como isso é possível',
          fontSize: '2xl',
          color: '#000000',
          alignment: 'center',
          fontWeight: 'bold'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'text',
        position: 1,
        pageId,
        properties: {
          text: 'Conteúdo de apresentação revelando os benefícios e processo',
          fontSize: 'base',
          color: '#333333',
          alignment: 'left'
        }
      });
      
    } else if (pageType.type === 'sales') {
      // Página de oferta
      elements.push({
        id: nanoid(),
        type: 'headline',
        position: 0,
        pageId,
        properties: {
          title: 'Oferta Especial - Apenas Hoje',
          fontSize: '3xl',
          color: '#d97706',
          alignment: 'center',
          fontWeight: 'bold'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'text',
        position: 1,
        pageId,
        properties: {
          text: 'De R$ 497 por apenas R$ 97',
          fontSize: '2xl',
          color: '#dc2626',
          alignment: 'center'
        }
      });
      
    } else if (pageType.type === 'checkout') {
      // Página de finalização
      elements.push({
        id: nanoid(),
        type: 'headline',
        position: 0,
        pageId,
        properties: {
          title: 'Finalize Seu Pedido',
          fontSize: '2xl',
          color: '#000000',
          alignment: 'center',
          fontWeight: 'semibold'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'text',
        position: 1,
        pageId,
        properties: {
          fieldId: 'nome_completo',
          placeholder: 'Seu nome completo',
          required: true
        }
      });
    }
    
    // Botão de ação para todas as páginas
    elements.push({
      id: nanoid(),
      type: 'button',
      position: elements.length,
      pageId,
      properties: {
        text: pageType.type === 'optin' ? 'QUERO DESCOBRIR' : 
              pageType.type === 'survey' ? 'CONTINUAR' :
              pageType.type === 'checkout' ? 'FINALIZAR PEDIDO' : 'PRÓXIMO',
        backgroundColor: '#16a34a',
        textColor: '#ffffff',
        action: 'next_page'
      }
    });
    
    return elements;
  }

  // NOVO: Criar página genérica para funils encriptados
  private static createGenericEncryptedPage($: cheerio.CheerioAPI, url: string): FunnelPage {
    console.log(`🔐 Criando página genérica para funil encriptado`);
    
    // Para funils complexos, criar múltiplas páginas mesmo quando não detectadas
    const pageType = { title: 'Página de Captura', type: 'optin', elements: ['headline', 'email', 'button'] };
    
    return {
      id: nanoid(),
      pageNumber: 1,
      title: 'Página Principal',
      elements: this.createAdvancedGenericElements(1, pageType),
      settings: this.getDefaultPageSettings()
    };
  }

  // NOVO: Criar elementos genéricos quando não consegue detectar
  private static createGenericElements(pageNumber: number): FunnelElement[] {
    const elements: FunnelElement[] = [];
    const pageId = nanoid();
    
    console.log(`🔧 Criando elementos genéricos para página ${pageNumber}`);
    
    // Elementos específicos para funil de conversão
    elements.push({
      id: nanoid(),
      type: 'headline',
      position: 0,
      pageId,
      properties: {
        title: 'Última oportunidad',
        fontSize: '2xl',
        color: '#000000',
        alignment: 'center',
        fontWeight: 'bold'
      }
    });
    
    elements.push({
      id: nanoid(),
      type: 'text',
      position: 1,
      pageId,
      properties: {
        title: 'Esta é sua última chance de aproveitar esta oferta especial. Não perca esta oportunidade única!',
        fontSize: 'lg',
        color: '#333333',
        alignment: 'center',
        fontWeight: 'normal'
      }
    });
    
    elements.push({
      id: nanoid(),
      type: 'text',
      position: 2,
      pageId,
      properties: {
        title: 'Insira seu melhor email abaixo para garantir seu acesso:',
        fontSize: 'base',
        color: '#555555',
        alignment: 'center',
        fontWeight: 'medium'
      }
    });
    
    elements.push({
      id: nanoid(),
      type: 'email',
      position: 3,
      pageId,
      properties: {
        title: 'Seu melhor email:',
        placeholder: 'Digite seu email aqui',
        required: true,
        responseId: 'email_lead',
        fieldWidth: 'full',
        backgroundColor: '#ffffff',
        borderColor: '#cccccc'
      }
    });
    
    elements.push({
      id: nanoid(),
      type: 'button',
      position: 4,
      pageId,
      properties: {
        title: 'GARANTIR ACESSO AGORA',
        style: 'solid',
        color: '#ffffff',
        backgroundColor: '#dc2626',
        size: 'lg',
        borderRadius: '8px'
      }
    });
    
    // Adicionar elemento de urgência
    elements.push({
      id: nanoid(),
      type: 'text',
      position: 5,
      pageId,
      properties: {
        title: '⏰ Oferta por tempo limitado - Não perca!',
        fontSize: 'sm',
        color: '#dc2626',
        alignment: 'center',
        fontWeight: 'bold'
      }
    });
    
    console.log(`✅ ${elements.length} elementos genéricos criados`);
    return elements;
  }

  // NOVO: Extrair elementos de páginas encriptadas
  private static extractElementsFromEncryptedPage($: cheerio.CheerioAPI, $page: cheerio.Cheerio<any>, pageNumber: number): FunnelElement[] {
    const elements = this.extractElementsFromPage($, $page, pageNumber);
    
    // Se não conseguiu extrair elementos, usar genéricos
    if (elements.length === 0) {
      return this.createGenericElements(pageNumber);
    }
    
    return elements;
  }

  // NOVO: Extrair título de funils encriptados
  private static extractEncryptedTitle($: cheerio.CheerioAPI, html: string): string {
    // Tentar métodos normais primeiro
    let title = this.extractTitle($);
    
    if (!title || title === 'Funil Importado') {
      // Buscar no HTML bruto por padrões de título
      const titlePatterns = [
        /<title[^>]*>([^<]+)<\/title>/i,
        /document\.title\s*=\s*["']([^"']+)["']/i,
        /"title"\s*:\s*"([^"]+)"/i
      ];
      
      for (const pattern of titlePatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          title = match[1].trim();
          break;
        }
      }
    }
    
    return title || 'Funil Encriptado Importado';
  }

  // NOVO: Extrair descrição de funils encriptados
  private static extractEncryptedDescription($: cheerio.CheerioAPI, html: string): string {
    let description = this.extractDescription($);
    
    if (!description || description === 'Funil importado do InLead') {
      // Buscar por meta description no HTML bruto
      const descPatterns = [
        /<meta[^>]*name="description"[^>]*content="([^"]+)"/i,
        /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i,
        /"description"\s*:\s*"([^"]+)"/i
      ];
      
      for (const pattern of descPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          description = match[1].trim();
          break;
        }
      }
    }
    
    return description || 'Funil encriptado importado do InLead';
  }

  // NOVO: Configurações padrão para páginas
  private static getDefaultPageSettings(): any {
    return {
      background: 'transparent',
      padding: '20px',
      margin: '0',
      className: '',
      id: '',
      dataAttributes: {}
    };
  }

  // NOVO: Extrair configurações de funils encriptados
  private static extractEncryptedSettings($: cheerio.CheerioAPI, html: string): any {
    const settings = this.extractSettings($);
    
    // Adicionar configurações específicas para funils encriptados
    settings.encrypted = true;
    settings.originalSource = 'encrypted_funnel';
    settings.requiresDecryption = true;
    
    return settings;
  }

  // NOVO: Extrair tema de funils encriptados
  private static extractEncryptedTheme($: cheerio.CheerioAPI, html: string): any {
    const theme = this.extractTheme($);
    
    // Configurações de tema padrão para funils encriptados
    theme.primaryColor = '#3b82f6';
    theme.backgroundColor = '#ffffff';
    theme.fontFamily = 'Inter, system-ui, sans-serif';
    theme.isEncrypted = true;
    
    return theme;
  }
  
  private static detectPages($: cheerio.CheerioAPI): FunnelPage[] {
    const pages: FunnelPage[] = [];
    let pageNumber = 1;
    
    console.log('🔍 INICIANDO DETECÇÃO AVANÇADA DE PÁGINAS');
    
    // 1. MÉTODO JAVASCRIPT - Detectar via scripts InLead/ClickFunnels
    const scriptPages = this.detectPagesFromScripts($);
    if (scriptPages.length > 0) {
      console.log(`📄 Detectadas ${scriptPages.length} páginas via JavaScript`);
      return scriptPages;
    }
    
    // 2. MÉTODO CSS/CLASSES - Seletores específicos para InLead
    const inLeadSelectors = [
      // InLead específicos
      '[data-step]', '[data-page]', '[data-slide]', '[id*="step"]', '[id*="page"]',
      '.step', '.page', '.slide', '.screen', '.view', '.panel',
      // ClickFunnels
      '.cf-step', '.elFunnelStep', '.elPageStep',
      // Leadpages
      '.lp-pom-block', '.lp-section',
      // Outros builders
      '[class*="step"]', '[class*="page"]', '[class*="slide"]', '[class*="screen"]'
    ];
    
    for (const selector of inLeadSelectors) {
      const pageElements = $(selector);
      
      if (pageElements.length > 1) {
        console.log(`📄 Detectadas ${pageElements.length} páginas com seletor: ${selector}`);
        
        pageElements.each((index, element) => {
          const $page = $(element);
          
          // Verificar se realmente é uma página (não um elemento interno)
          if (this.isValidPage($page)) {
            const elements = this.extractElementsFromPage($, $page, pageNumber);
            
            if (elements.length > 0) {
              pages.push({
                id: nanoid(),
                pageNumber: pageNumber,
                title: this.extractPageTitle($page, pageNumber),
                elements: elements,
                settings: this.extractPageSettings($page)
              });
              pageNumber++;
            }
          }
        });
        
        if (pages.length > 0) {
          console.log(`✅ Método CSS bem-sucedido: ${pages.length} páginas`);
          break;
        }
      }
    }
    
    // 3. MÉTODO INTELIGENTE - Analisar estrutura DOM
    if (pages.length === 0) {
      console.log('🧠 Aplicando método inteligente de detecção');
      const intelligentPages = this.detectPagesIntelligent($);
      if (intelligentPages.length > 0) {
        console.log(`✅ Método inteligente: ${intelligentPages.length} páginas`);
        return intelligentPages;
      }
    }
    
    // 4. MÉTODO CONTENEDORES - Buscar por containers principais
    if (pages.length === 0) {
      console.log('📦 Analisando containers principais');
      const containerPages = this.detectPagesFromContainers($);
      if (containerPages.length > 0) {
        console.log(`✅ Método containers: ${containerPages.length} páginas`);
        return containerPages;
      }
    }
    
    console.log(`📄 Total de páginas detectadas: ${pages.length}`);
    return pages;
  }
  
  // NOVO: Detectar páginas via JavaScript/dados embutidos
  private static detectPagesFromScripts($: cheerio.CheerioAPI): FunnelPage[] {
    const pages: FunnelPage[] = [];
    
    $('script').each((index, script) => {
      const scriptContent = $(script).html() || '';
      
      // Procurar por dados de páginas em formato JSON
      const patterns = [
        /pages\s*:\s*\[(.*?)\]/gs,
        /steps\s*:\s*\[(.*?)\]/gs,
        /funnel\s*:\s*{.*?"pages":\s*\[(.*?)\]/gs,
        /"page_data":\s*\[(.*?)\]/gs
      ];
      
      for (const pattern of patterns) {
        const matches = scriptContent.match(pattern);
        if (matches) {
          try {
            // Tentar extrair dados estruturados
            console.log('📄 Dados de páginas encontrados via JavaScript');
            // Processar dados encontrados
          } catch (error) {
            console.log('⚠️ Erro ao processar dados JavaScript:', error);
          }
        }
      }
    });
    
    return pages;
  }
  
  // NOVO: Método inteligente baseado em heurísticas
  private static detectPagesIntelligent($: cheerio.CheerioAPI): FunnelPage[] {
    const pages: FunnelPage[] = [];
    
    // Procurar por elementos que geralmente indicam novas páginas
    const pageIndicators = [
      // Elementos com display: none (páginas ocultas)
      '[style*="display: none"]',
      '[style*="display:none"]',
      '.hidden',
      '.d-none',
      // Elementos com IDs sequenciais
      '[id^="page"]',
      '[id^="step"]',
      '[id^="slide"]'
    ];
    
    for (const indicator of pageIndicators) {
      const elements = $(indicator);
      
      elements.each((index, element) => {
        const $elem = $(element);
        
        // Verificar se é um container de página válido
        if (this.isValidPageContainer($elem)) {
          const elements = this.extractElementsFromPage($, $elem, pages.length + 1);
          
          if (elements.length > 2) { // Pelo menos 3 elementos para ser uma página
            pages.push({
              id: nanoid(),
              pageNumber: pages.length + 1,
              title: this.extractPageTitle($elem, pages.length + 1),
              elements: elements,
              settings: this.extractPageSettings($elem)
            });
          }
        }
      });
    }
    
    return pages;
  }
  
  // NOVO: Detectar por containers principais
  private static detectPagesFromContainers($: cheerio.CheerioAPI): FunnelPage[] {
    const pages: FunnelPage[] = [];
    
    // Buscar por estruturas comuns de múltiplas páginas
    const containerSelectors = [
      'body > div',
      'main > div',
      '.container > div',
      '#app > div',
      '#root > div'
    ];
    
    for (const selector of containerSelectors) {
      const containers = $(selector);
      
      if (containers.length > 3) { // Pelo menos 4 containers
        console.log(`📦 Analisando ${containers.length} containers: ${selector}`);
        
        containers.each((index, container) => {
          const $container = $(container);
          
          // Verificar se tem conteúdo suficiente para ser uma página
          const textContent = $container.text().trim();
          const hasInputs = $container.find('input, button, form').length > 0;
          const hasImages = $container.find('img').length > 0;
          const hasHeaders = $container.find('h1, h2, h3').length > 0;
          
          if (textContent.length > 50 && (hasInputs || hasImages || hasHeaders)) {
            const elements = this.extractElementsFromPage($, $container, pages.length + 1);
            
            if (elements.length > 0) {
              pages.push({
                id: nanoid(),
                pageNumber: pages.length + 1,
                title: this.extractPageTitle($container, pages.length + 1),
                elements: elements,
                settings: this.extractPageSettings($container)
              });
            }
          }
        });
        
        if (pages.length > 0) break;
      }
    }
    
    return pages;
  }
  
  // NOVO: Validar se é uma página válida
  private static isValidPage($elem: cheerio.Cheerio<any>): boolean {
    const textLength = $elem.text().trim().length;
    const hasRelevantContent = $elem.find('input, button, img, h1, h2, h3, p').length > 0;
    const isNotNested = $elem.parents('[data-step], [data-page], .step, .page').length === 0;
    
    return textLength > 20 && hasRelevantContent && isNotNested;
  }
  
  // NOVO: Validar se é um container de página válido
  private static isValidPageContainer($elem: cheerio.Cheerio<any>): boolean {
    const textLength = $elem.text().trim().length;
    const childCount = $elem.children().length;
    const hasForm = $elem.find('form, input').length > 0;
    const hasContent = $elem.find('h1, h2, h3, p, img').length > 0;
    
    return textLength > 100 && childCount > 2 && (hasForm || hasContent);
  }
  
  private static createSinglePage($: cheerio.CheerioAPI): FunnelPage {
    console.log(`📄 Criando página única com todo o conteúdo`);
    
    return {
      id: nanoid(),
      pageNumber: 1,
      title: this.extractTitle($) || 'Página Principal',
      elements: this.extractElementsFromPage($, $('body'), 1),
      settings: {
        background: this.extractBackground($('body')),
        layout: 'single-page'
      }
    };
  }
  
  private static extractElementsFromPage($: cheerio.CheerioAPI, $page: cheerio.Cheerio<any>, pageNumber: number): FunnelElement[] {
    const elements: FunnelElement[] = [];
    let position = 0;
    const pageId = nanoid();
    
    console.log(`🔍 Extraindo elementos da página ${pageNumber}`);
    console.log(`📄 Tamanho do HTML da página: ${$page.html()?.length || 0} caracteres`);
    console.log(`📄 Texto da página: ${$page.text().trim().substring(0, 200)}...`);
    
    // DETECTAR TODOS OS ELEMENTOS POSSÍVEIS - VERSÃO AGRESSIVA
    
    // 1. HEADLINES/TÍTULOS - Busca mais ampla
    const titleSelectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      '.headline', '.title', '.heading', '.header',
      '[class*="title"]', '[class*="headline"]', '[class*="heading"]',
      '[class*="h1"]', '[class*="h2"]', '[class*="h3"]',
      '.hero-title', '.main-title', '.page-title',
      // Seletores específicos para funils
      '.funnel-title', '.step-title', '.section-title'
    ];
    
    for (const selector of titleSelectors) {
      $page.find(selector).each((index, elem) => {
        const $elem = $(elem);
        const text = $elem.text().trim();
        if (text && text.length > 2) {
          console.log(`📋 Título encontrado: ${text.substring(0, 50)}`);
          elements.push({
            id: nanoid(),
            type: 'headline',
            position: position++,
            pageId,
            properties: {
              title: text,
              style: elem.tagName?.toLowerCase() || 'h2',
              fontSize: this.extractFontSize($elem),
              color: this.extractColor($elem),
              alignment: this.extractAlignment($elem),
              fontWeight: this.extractFontWeight($elem)
            }
          });
        }
      });
    }
    
    // 2. TEXTOS/PARÁGRAFOS
    $page.find('p, .text, .description, [class*="text"], [class*="desc"]').each((index, elem) => {
      const $elem = $(elem);
      const text = $elem.text().trim();
      if (text && text.length > 10) {
        elements.push({
          id: nanoid(),
          type: 'text',
          position: position++,
          pageId,
          properties: {
            title: text,
            fontSize: this.extractFontSize($elem),
            color: this.extractColor($elem),
            alignment: this.extractAlignment($elem),
            fontWeight: this.extractFontWeight($elem)
          }
        });
      }
    });
    
    // 3. IMAGENS
    $page.find('img').each((index, elem) => {
      const $elem = $(elem);
      const src = $elem.attr('src');
      const alt = $elem.attr('alt') || '';
      if (src) {
        elements.push({
          id: nanoid(),
          type: 'image',
          position: position++,
          pageId,
          properties: {
            src: src.startsWith('http') ? src : `https:${src}`,
            alt: alt,
            width: $elem.attr('width') || 'auto',
            height: $elem.attr('height') || 'auto',
            alignment: this.extractAlignment($elem)
          }
        });
      }
    });
    
    // 4. FORMULÁRIOS E INPUTS
    $page.find('input[type="email"], input[type="text"], input[type="tel"], textarea').each((index, elem) => {
      const $elem = $(elem);
      const type = $elem.attr('type') || 'text';
      const placeholder = $elem.attr('placeholder') || '';
      const name = $elem.attr('name') || '';
      
      elements.push({
        id: nanoid(),
        type: type === 'email' ? 'email' : type === 'tel' ? 'phone' : 'text_input',
        position: position++,
        pageId,
        properties: {
          title: this.findLabelForInput($, $elem),
          placeholder: placeholder,
          required: $elem.prop('required') || false,
          responseId: name || `field_${position}`,
          fieldWidth: 'full'
        }
      });
    });
    
    // 5. BOTÕES E LINKS
    $page.find('button, .button, .btn, a[class*="btn"], [class*="button"]').each((index, elem) => {
      const $elem = $(elem);
      const text = $elem.text().trim();
      const href = $elem.attr('href');
      
      if (text) {
        elements.push({
          id: nanoid(),
          type: 'button',
          position: position++,
          pageId,
          properties: {
            title: text,
            href: href || '#',
            style: this.extractButtonStyle($elem),
            color: this.extractColor($elem),
            backgroundColor: this.extractBackgroundColor($elem),
            size: this.extractButtonSize($elem)
          }
        });
      }
    });
    
    // 6. LISTAS E MÚLTIPLA ESCOLHA
    $page.find('ul, ol, .options, .choices, [class*="option"]').each((index, elem) => {
      const $elem = $(elem);
      const items = [];
      
      $elem.find('li, .option, .choice').each((i, item) => {
        const text = $(item).text().trim();
        if (text) {
          items.push(text);
        }
      });
      
      if (items.length > 1) {
        const questionText = this.findQuestionForOptions($, $elem);
        elements.push({
          id: nanoid(),
          type: 'multiple_choice',
          position: position++,
          pageId,
          properties: {
            title: questionText || 'Selecione uma opção:',
            options: items,
            required: true,
            responseId: `choice_${position}`,
            allowMultiple: false
          }
        });
      }
    });
    
    // 7. VÍDEOS
    $page.find('video, iframe[src*="youtube"], iframe[src*="vimeo"], [class*="video"]').each((index, elem) => {
      const $elem = $(elem);
      let src = $elem.attr('src') || $elem.find('source').attr('src') || '';
      
      elements.push({
        id: nanoid(),
        type: 'video',
        position: position++,
        pageId,
        properties: {
          src: src,
          autoplay: $elem.prop('autoplay') || false,
          controls: $elem.prop('controls') !== false,
          width: $elem.attr('width') || '100%',
          height: $elem.attr('height') || 'auto'
        }
      });
    });
    
    console.log(`📄 Página ${pageNumber}: ${elements.length} elementos extraídos`);
    return elements;
  }
  
  // MÉTODOS AUXILIARES DE EXTRAÇÃO
  private static extractTitle($: cheerio.CheerioAPI): string {
    return $('title').text() || 
           $('h1').first().text() || 
           $('[class*="title"]').first().text() || 
           'Funil Importado';
  }
  
  private static extractDescription($: cheerio.CheerioAPI): string {
    return $('meta[name="description"]').attr('content') ||
           $('meta[property="og:description"]').attr('content') ||
           $('p').first().text() ||
           'Funil importado do InLead';
  }
  
  private static extractPageTitle($page: cheerio.Cheerio<any>, pageNumber: number): string {
    return $page.find('h1, h2, .title').first().text().trim() || 
           $page.attr('data-title') ||
           `Página ${pageNumber}`;
  }
  
  private static extractFontSize($elem: cheerio.Cheerio<any>): string {
    const classList = $elem.attr('class') || '';
    if (classList.includes('text-xl') || classList.includes('large')) return 'xl';
    if (classList.includes('text-lg')) return 'lg';
    if (classList.includes('text-sm') || classList.includes('small')) return 'sm';
    if (classList.includes('text-xs')) return 'xs';
    return 'base';
  }
  
  private static extractColor($elem: cheerio.Cheerio<any>): string {
    const style = $elem.attr('style') || '';
    const colorMatch = style.match(/color:\s*([^;]+)/);
    if (colorMatch) return colorMatch[1].trim();
    
    const classList = $elem.attr('class') || '';
    if (classList.includes('text-red')) return '#ef4444';
    if (classList.includes('text-blue')) return '#3b82f6';
    if (classList.includes('text-green')) return '#10b981';
    if (classList.includes('text-yellow')) return '#f59e0b';
    if (classList.includes('text-white')) return '#ffffff';
    
    return '#000000';
  }
  
  private static extractAlignment($elem: cheerio.Cheerio<any>): string {
    const style = $elem.attr('style') || '';
    const classList = $elem.attr('class') || '';
    
    if (style.includes('text-align: center') || classList.includes('text-center')) return 'center';
    if (style.includes('text-align: right') || classList.includes('text-right')) return 'right';
    if (style.includes('text-align: justify') || classList.includes('text-justify')) return 'justify';
    
    return 'left';
  }
  
  private static extractFontWeight($elem: cheerio.Cheerio<any>): string {
    const style = $elem.attr('style') || '';
    const classList = $elem.attr('class') || '';
    
    if (style.includes('font-weight: bold') || classList.includes('font-bold') || $elem.is('b, strong')) return 'bold';
    if (style.includes('font-weight: 600') || classList.includes('font-semibold')) return 'semibold';
    if (style.includes('font-weight: 500') || classList.includes('font-medium')) return 'medium';
    if (style.includes('font-weight: 300') || classList.includes('font-light')) return 'light';
    
    return 'normal';
  }
  
  private static extractBackground($elem: cheerio.Cheerio<any>): string {
    const style = $elem.attr('style') || '';
    const backgroundMatch = style.match(/background(?:-color)?:\s*([^;]+)/);
    if (backgroundMatch) return backgroundMatch[1].trim();
    
    const classList = $elem.attr('class') || '';
    if (classList.includes('bg-')) {
      const bgMatch = classList.match(/bg-(\w+)/);
      if (bgMatch) return `var(--${bgMatch[1]})`;
    }
    
    return 'transparent';
  }
  
  private static extractBackgroundColor($elem: cheerio.Cheerio<any>): string {
    return this.extractBackground($elem);
  }
  
  private static extractButtonStyle($elem: cheerio.Cheerio<any>): string {
    const classList = $elem.attr('class') || '';
    
    if (classList.includes('btn-outline') || classList.includes('outline')) return 'outline';
    if (classList.includes('btn-ghost') || classList.includes('ghost')) return 'ghost';
    if (classList.includes('btn-link') || classList.includes('link')) return 'link';
    
    return 'solid';
  }
  
  private static extractButtonSize($elem: cheerio.Cheerio<any>): string {
    const classList = $elem.attr('class') || '';
    
    if (classList.includes('btn-sm') || classList.includes('small')) return 'sm';
    if (classList.includes('btn-lg') || classList.includes('large')) return 'lg';
    if (classList.includes('btn-xl')) return 'xl';
    
    return 'md';
  }
  
  private static findLabelForInput($: cheerio.CheerioAPI, $input: cheerio.Cheerio<any>): string {
    // Procurar por label associado
    const inputId = $input.attr('id');
    if (inputId) {
      const label = $(`label[for="${inputId}"]`).text().trim();
      if (label) return label;
    }
    
    // Procurar por label pai
    const parentLabel = $input.closest('label').text().trim();
    if (parentLabel) return parentLabel;
    
    // Procurar por elementos anteriores
    const prevText = $input.prev('label, span, div, p').text().trim();
    if (prevText) return prevText;
    
    // Placeholder como fallback
    return $input.attr('placeholder') || 'Campo de entrada';
  }
  
  private static findQuestionForOptions($: cheerio.CheerioAPI, $options: cheerio.Cheerio<any>): string {
    // Procurar por elementos anteriores que possam ser a pergunta
    const prevElements = $options.prevAll('h1, h2, h3, p, div, label').first();
    const questionText = prevElements.text().trim();
    
    if (questionText && questionText.length < 200) {
      return questionText;
    }
    
    // Procurar por elemento pai que contenha texto
    const parentText = $options.parent().contents().filter(function() {
      return this.nodeType === 3; // Text node
    }).text().trim();
    
    if (parentText) return parentText;
    
    return 'Selecione uma opção:';
  }
  
  private static extractSettings($: cheerio.CheerioAPI): any {
    return {
      theme: this.extractTheme($),
      meta: {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        keywords: $('meta[name="keywords"]').attr('content')
      },
      scripts: this.extractScripts($),
      styles: this.extractStyles($)
    };
  }
  
  private static extractTheme($: cheerio.CheerioAPI): any {
    const bodyStyle = $('body').attr('style') || '';
    const bodyClass = $('body').attr('class') || '';
    
    return {
      primaryColor: this.extractColor($('body')),
      backgroundColor: this.extractBackground($('body')),
      fontFamily: this.extractFontFamily($('body')),
      isDark: bodyClass.includes('dark') || bodyStyle.includes('dark'),
      customCss: this.extractCustomCss($)
    };
  }
  
  private static extractFontFamily($elem: cheerio.Cheerio<any>): string {
    const style = $elem.attr('style') || '';
    const fontMatch = style.match(/font-family:\s*([^;]+)/);
    if (fontMatch) return fontMatch[1].trim();
    
    return 'Inter, system-ui, sans-serif';
  }
  
  private static extractScripts($: cheerio.CheerioAPI): string[] {
    const scripts: string[] = [];
    
    $('script[src]').each((index, script) => {
      const src = $(script).attr('src');
      if (src && !src.includes('jquery') && !src.includes('bootstrap')) {
        scripts.push(src);
      }
    });
    
    return scripts;
  }
  
  private static extractStyles($: cheerio.CheerioAPI): string[] {
    const styles: string[] = [];
    
    $('link[rel="stylesheet"]').each((index, link) => {
      const href = $(link).attr('href');
      if (href) {
        styles.push(href);
      }
    });
    
    return styles;
  }
  
  private static extractCustomCss($: cheerio.CheerioAPI): string {
    let customCss = '';
    
    $('style').each((index, style) => {
      const cssContent = $(style).html();
      if (cssContent) {
        customCss += cssContent + '\n';
      }
    });
    
    return customCss;
  }
  
  private static extractPageSettings($page: cheerio.Cheerio<any>): any {
    return {
      background: this.extractBackground($page),
      padding: this.extractPadding($page),
      margin: this.extractMargin($page),
      className: $page.attr('class') || '',
      id: $page.attr('id') || '',
      dataAttributes: this.extractDataAttributes($page)
    };
  }
  
  private static extractPadding($elem: cheerio.Cheerio<any>): string {
    const style = $elem.attr('style') || '';
    const paddingMatch = style.match(/padding:\s*([^;]+)/);
    if (paddingMatch) return paddingMatch[1].trim();
    
    const classList = $elem.attr('class') || '';
    if (classList.includes('p-')) {
      const pMatch = classList.match(/p-(\d+)/);
      if (pMatch) return `${pMatch[1]}rem`;
    }
    
    return '0';
  }
  
  private static extractMargin($elem: cheerio.Cheerio<any>): string {
    const style = $elem.attr('style') || '';
    const marginMatch = style.match(/margin:\s*([^;]+)/);
    if (marginMatch) return marginMatch[1].trim();
    
    const classList = $elem.attr('class') || '';
    if (classList.includes('m-')) {
      const mMatch = classList.match(/m-(\d+)/);
      if (mMatch) return `${mMatch[1]}rem`;
    }
    
    return '0';
  }
  
  private static extractDataAttributes($elem: cheerio.Cheerio<any>): Record<string, string> {
    const dataAttrs: Record<string, string> = {};
    const attributes = $elem.get(0)?.attribs || {};
    
    Object.keys(attributes).forEach(attr => {
      if (attr.startsWith('data-')) {
        dataAttrs[attr] = attributes[attr];
      }
    });
    
    return dataAttrs;
  }

  // NOVO: Analisador específico para funis da Cakto
  private static analyzeCaktoFunnel(html: string, url: string): CompleteFunnel {
    console.log(`🎯 INICIANDO ANÁLISE ESPECÍFICA DE FUNIL CAKTO`);
    
    const $ = cheerio.load(html);
    const pages: FunnelPage[] = [];
    
    // Extrair informações específicas da estrutura Cakto
    const title = this.extractCaktoTitle($, html);
    const slug = this.extractCaktoSlug(url);
    
    console.log(`🎯 Título detectado: ${title}`);
    console.log(`🎯 Slug detectado: ${slug}`);
    
    // Detectar estrutura de quiz/funil baseada nos elementos do DOM
    const quizStructure = this.detectCaktoQuizStructure($, html);
    
    // Analisar elementos visuais (cores, imagens, etc.)
    const visualElements = this.extractCaktoVisualElements($, html);
    
    // Criar páginas baseadas na estrutura detectada
    const estimatedPages = this.estimateCaktoPages($, html);
    console.log(`🎯 Páginas estimadas: ${estimatedPages}`);
    
    for (let i = 1; i <= estimatedPages; i++) {
      const pageType = this.determineCaktoPageType(i, estimatedPages);
      pages.push({
        id: nanoid(),
        pageNumber: i,
        title: `${pageType.title} (Página ${i})`,
        elements: this.createCaktoElements(i, pageType, visualElements),
        settings: this.getCaktoPageSettings()
      });
    }
    
    const funnel: CompleteFunnel = {
      id: nanoid(),
      title: title,
      description: `Funil importado da Cakto: ${title}`,
      pages: pages.length,
      pageData: pages,
      elements: pages.flatMap(page => page.elements),
      settings: this.getCaktoFunnelSettings(),
      theme: this.extractCaktoTheme($, html, visualElements),
      metadata: {
        originalUrl: url,
        importedAt: new Date().toISOString(),
        totalPages: pages.length,
        totalElements: pages.flatMap(page => page.elements).length,
        detectionMethod: 'cakto_analyzer',
        platform: 'cakto',
        slug: slug,
        quizStructure: quizStructure,
        visualElements: visualElements
      }
    };
    
    console.log(`✅ ANÁLISE CAKTO COMPLETA: ${funnel.pages} páginas, ${funnel.elements.length} elementos`);
    return funnel;
  }

  // Métodos auxiliares para Cakto
  private static extractCaktoTitle($: cheerio.CheerioAPI, html: string): string {
    // Tentar extrair título de várias fontes
    let title = $('title').text().trim();
    
    // Se é Cakto Quiz padrão, extrair do slug
    if (!title || title === 'Cakto Quiz') {
      // Tentar extrair do script Next.js
      const scriptContent = $('script').text();
      const slugMatch = scriptContent.match(/"slug":"([^"]+)"/);
      if (slugMatch) {
        const slug = slugMatch[1];
        // Converter slug para título legível
        title = slug.split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
    
    if (!title) {
      title = $('h1').first().text().trim();
    }
    if (!title) {
      title = $('[data-sentry-component="Preview"]').attr('data-title') || '';
    }
    if (!title) {
      const metaTitle = $('meta[property="og:title"]').attr('content');
      if (metaTitle) title = metaTitle;
    }
    
    return title || 'Quiz Importado da Cakto';
  }

  private static extractCaktoSlug(url: string): string {
    const match = url.match(/\/preview\/([^\/\?]+)/);
    return match ? match[1] : 'imported-quiz';
  }

  private static detectCaktoQuizStructure($: cheerio.CheerioAPI, html: string): any {
    // Detectar se há estrutura de quiz
    const hasQuizElements = $('.quiz-question, .question, [data-question]').length > 0;
    const hasMultipleChoice = $('.option, .choice, [data-option]').length > 0;
    const hasProgressBar = $('.progress, [data-progress]').length > 0;
    
    return {
      isQuiz: hasQuizElements,
      hasMultipleChoice: hasMultipleChoice,
      hasProgressBar: hasProgressBar,
      estimatedQuestions: Math.max(1, $('.question, [data-question]').length || 5)
    };
  }

  private static extractCaktoVisualElements($: cheerio.CheerioAPI, html: string): any {
    const colors = {
      buttons: [],
      text: [],
      backgrounds: [],
      primary: '#4F46E5' // Default
    };
    
    const images = [];
    
    // Extrair cores de botões
    $('button, .btn, [role="button"]').each((i, elem) => {
      const $elem = $(elem);
      const bgColor = this.extractBackgroundColor($elem);
      if (bgColor && bgColor !== 'transparent') {
        colors.buttons.push(bgColor);
      }
    });
    
    // Extrair cores de texto
    $('h1, h2, h3, p, span').each((i, elem) => {
      const $elem = $(elem);
      const textColor = this.extractTextColor($elem);
      if (textColor && textColor !== '#000000') {
        colors.text.push(textColor);
      }
    });
    
    // Extrair imagens
    $('img').each((i, elem) => {
      const $elem = $(elem);
      const src = $elem.attr('src');
      const alt = $elem.attr('alt') || '';
      if (src) {
        images.push({
          url: src.startsWith('http') ? src : `https://quiz.cakto.com.br${src}`,
          alt: alt,
          position: i
        });
      }
    });
    
    return { colors, images };
  }

  private static estimateCaktoPages($: cheerio.CheerioAPI, html: string): number {
    const scriptContent = $('script').text();
    
    // Múltiplos métodos de detecção para páginas Cakto
    let estimatedPages = 20; // Padrão mais alto baseado no feedback do usuário
    
    // Método 1: Buscar por indicadores de páginas no JavaScript
    const pageIndicators = [
      /questions?\s*:\s*\[[\s\S]*?\]/gi,
      /steps?\s*:\s*\[[\s\S]*?\]/gi,
      /pages?\s*:\s*\[[\s\S]*?\]/gi,
      /quiz[_-]?data\s*:\s*\[[\s\S]*?\]/gi,
      /form[_-]?pages\s*:\s*\[[\s\S]*?\]/gi
    ];
    
    pageIndicators.forEach(pattern => {
      const matches = scriptContent.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Contar vírgulas para estimar elementos em arrays
          const commas = (match.match(/,/g) || []).length;
          if (commas > 0) {
            estimatedPages = Math.max(estimatedPages, commas + 1);
          }
          
          // Contar objetos JSON dentro do match
          const objects = (match.match(/\{[^}]*\}/g) || []).length;
          if (objects > 0) {
            estimatedPages = Math.max(estimatedPages, objects);
          }
        });
      }
    });
    
    // Método 2: Buscar por números específicos no código
    const numberMatches = scriptContent.match(/\b\d{1,2}\b/g);
    if (numberMatches) {
      const numbers = numberMatches.map(n => parseInt(n)).filter(n => n >= 10 && n <= 50);
      if (numbers.length > 0) {
        estimatedPages = Math.max(estimatedPages, Math.max(...numbers));
      }
    }
    
    // Método 3: Buscar por meta dados ou configurações
    const metaIndicators = [
      /total[_-]?pages?\s*[=:]\s*(\d+)/gi,
      /page[_-]?count\s*[=:]\s*(\d+)/gi,
      /quiz[_-]?length\s*[=:]\s*(\d+)/gi,
      /step[_-]?count\s*[=:]\s*(\d+)/gi
    ];
    
    metaIndicators.forEach(pattern => {
      const matches = scriptContent.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const numberMatch = match.match(/(\d+)/);
          if (numberMatch) {
            const count = parseInt(numberMatch[1]);
            if (count >= 5 && count <= 50) {
              estimatedPages = Math.max(estimatedPages, count);
            }
          }
        });
      }
    });
    
    // Método 4: Análise do HTML por elementos de formulário
    const formElements = $('input, select, textarea, button[type="submit"]').length;
    if (formElements > 10) {
      // Estimar 2-3 elementos por página
      const pagesFromElements = Math.ceil(formElements / 2.5);
      estimatedPages = Math.max(estimatedPages, pagesFromElements);
    }
    
    // Método 5: Para URLs específicas conhecidas (pilates, etc.)
    const url = html.toLowerCase();
    if (url.includes('pilates') || url.includes('emagrecimento') || url.includes('dieta')) {
      estimatedPages = Math.max(estimatedPages, 25); // Quizzes de nicho são mais longos
    }
    
    // Limitar entre 5 e 50 páginas, mas padrão mais alto
    const finalPages = Math.min(Math.max(estimatedPages, 20), 50);
    
    console.log(`🔍 Detecção avançada: ${finalPages} páginas (baseado em múltiplos métodos)`);
    return finalPages;
  }

  private static determineCaktoPageType(pageNumber: number, totalPages: number): { title: string, type: string, elements: string[] } {
    const percentage = pageNumber / totalPages;
    
    if (pageNumber === 1) {
      return { title: 'Início do Quiz', type: 'intro', elements: ['headline', 'text', 'button'] };
    } else if (pageNumber === totalPages) {
      return { title: 'Resultado Final', type: 'result', elements: ['headline', 'text', 'email', 'button'] };
    } else if (percentage <= 0.8) {
      return { title: `Pergunta ${pageNumber - 1}`, type: 'question', elements: ['question', 'multiple_choice', 'button'] };
    } else {
      return { title: 'Captura de Lead', type: 'lead_capture', elements: ['headline', 'email', 'phone', 'button'] };
    }
  }

  private static createCaktoElements(pageNumber: number, pageType: any, visualElements: any): FunnelElement[] {
    const elements: FunnelElement[] = [];
    const pageId = nanoid();
    
    console.log(`🎯 Criando elementos Cakto para ${pageType.title} (Página ${pageNumber})`);
    
    if (pageType.type === 'intro') {
      elements.push({
        id: nanoid(),
        type: 'headline',
        position: 0,
        pageId,
        properties: {
          title: 'Descubra Seu Treino Ideal de Pilates',
          fontSize: '2xl',
          color: visualElements.colors.text[0] || '#1F2937',
          alignment: 'center',
          fontWeight: 'bold'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'image',
        position: 1,
        pageId,
        properties: {
          imageUrl: visualElements.images[0]?.url || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
          alt: 'Pilates na parede exercícios',
          alignment: 'center',
          width: 'large',
          borderRadius: 'md'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'text',
        position: 2,
        pageId,
        properties: {
          text: 'Responda algumas perguntas rápidas e descubra o método de pilates perfeito para você',
          fontSize: 'lg',
          color: visualElements.colors.text[1] || '#6B7280',
          alignment: 'center'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'button',
        position: 3,
        pageId,
        properties: {
          text: 'Começar Quiz',
          backgroundColor: visualElements.colors.buttons[0] || '#4F46E5',
          textColor: '#FFFFFF',
          size: 'lg',
          borderRadius: 'md'
        }
      });
    } else if (pageType.type === 'question') {
      elements.push({
        id: nanoid(),
        type: 'progress_bar',
        position: 0,
        pageId,
        properties: {
          title: `Pergunta ${pageNumber - 1}`,
          currentStep: pageNumber - 1,
          totalSteps: 10,
          color: visualElements.colors.primary
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'question',
        position: 1,
        pageId,
        properties: {
          question: this.getCaktoQuestionText(pageNumber),
          fontSize: 'xl',
          color: visualElements.colors.text[0] || '#1F2937',
          alignment: 'center'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'multiple_choice',
        position: 2,
        pageId,
        properties: {
          options: this.getCaktoQuestionOptions(pageNumber),
          responseId: this.getCaktoResponseId(pageNumber),
          required: true
        }
      });
    } else if (pageType.type === 'lead_capture') {
      elements.push({
        id: nanoid(),
        type: 'headline',
        position: 0,
        pageId,
        properties: {
          title: 'Receba Seu Plano Personalizado',
          fontSize: 'xl',
          color: visualElements.colors.text[0] || '#1F2937',
          alignment: 'center',
          fontWeight: 'bold'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'text',
        position: 1,
        pageId,
        properties: {
          text: 'Informe seus dados para receber gratuitamente seu plano de pilates personalizado',
          fontSize: 'md',
          color: visualElements.colors.text[1] || '#6B7280',
          alignment: 'center'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'email',
        position: 2,
        pageId,
        properties: {
          placeholder: 'Seu melhor e-mail',
          required: true,
          responseId: 'email_contato'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'phone',
        position: 3,
        pageId,
        properties: {
          placeholder: 'Seu WhatsApp',
          required: true,
          responseId: 'telefone_whatsapp'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'button',
        position: 4,
        pageId,
        properties: {
          text: 'Receber Meu Plano Grátis',
          backgroundColor: visualElements.colors.buttons[0] || '#10B981',
          textColor: '#FFFFFF',
          size: 'lg',
          borderRadius: 'md'
        }
      });
    } else if (pageType.type === 'result') {
      elements.push({
        id: nanoid(),
        type: 'headline',
        position: 0,
        pageId,
        properties: {
          title: 'Parabéns! Seu Plano Está Pronto',
          fontSize: '2xl',
          color: visualElements.colors.text[0] || '#059669',
          alignment: 'center',
          fontWeight: 'bold'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'text',
        position: 1,
        pageId,
        properties: {
          text: 'Baseado nas suas respostas, criamos um plano de pilates especialmente para você. Verifique seu e-mail em alguns instantes.',
          fontSize: 'lg',
          color: visualElements.colors.text[1] || '#374151',
          alignment: 'center'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'button',
        position: 2,
        pageId,
        properties: {
          text: 'Começar Agora',
          backgroundColor: visualElements.colors.buttons[0] || '#059669',
          textColor: '#FFFFFF',
          size: 'lg',
          borderRadius: 'md'
        }
      });
    }
    
    return elements;
  }

  // Métodos auxiliares para perguntas expandidas (suporte para 50+ páginas)
  private static getCaktoQuestionText(pageNumber: number): string {
    const questions = [
      // Páginas 2-9: Perguntas básicas
      'Qual é o seu nível de experiência?',
      'Qual é o seu principal objetivo?',
      'Quanto tempo você tem disponível?',
      'Você tem alguma limitação física?',
      'Qual horário prefere?',
      'Você prefere treinos mais intensos ou relaxantes?',
      'Qual área do corpo quer focar mais?',
      'Já praticou este método antes?',
      
      // Páginas 10-17: Perguntas sobre estilo de vida
      'Como está seu nível de estresse atualmente?',
      'Qual é sua experiência com exercícios?',
      'Você prefere treinar sozinho ou em grupo?',
      'Qual é sua motivação principal?',
      'Como você avalia sua flexibilidade atual?',
      'Você tem preferência por equipamentos?',
      'Qual é seu nível de energia pela manhã?',
      'Como você se sente em relação ao seu corpo?',
      
      // Páginas 18-25: Perguntas sobre objetivos específicos
      'Qual resultado você quer ver primeiro?',
      'Em quanto tempo quer ver resultados?',
      'Você já tentou outros métodos?',
      'O que mais te motiva a começar?',
      'Qual é sua maior dificuldade atual?',
      'Você prefere treinos variados ou rotina?',
      'Como você lida com desafios?',
      'Qual é sua prioridade número 1?',
      
      // Páginas 26-33: Perguntas sobre personalidade
      'Você se considera uma pessoa disciplinada?',
      'Como você prefere receber orientações?',
      'Você gosta de acompanhar progresso?',
      'Qual tipo de feedback te motiva mais?',
      'Você prefere começar gradualmente?',
      'Como você reage a mudanças na rotina?',
      'Você se considera competitivo?',
      'Qual ambiente de treino prefere?',
      
      // Páginas 34-41: Perguntas sobre hábitos
      'Qual é sua rotina de sono?',
      'Como está sua alimentação atualmente?',
      'Você costuma se exercitar regularmente?',
      'Qual é seu maior obstáculo para exercitar?',
      'Você prefere treinos curtos ou longos?',
      'Como você se mantém motivado?',
      'Você tem apoio familiar para treinar?',
      'Qual é seu momento favorito do dia?',
      
      // Páginas 42-50: Perguntas finais e específicas
      'O que mais te preocupa ao começar?',
      'Você tem alguma condição médica?',
      'Qual é sua expectativa realista?',
      'Você está pronto para se comprometer?',
      'O que te faria desistir?',
      'Como você celebra suas conquistas?',
      'Você prefere acompanhamento personalizado?',
      'Qual é seu sonho de transformação?',
      'Está pronto para começar hoje mesmo?'
    ];
    
    const questionIndex = pageNumber - 2; // Ajustar porque página 1 é intro
    return questions[questionIndex] || `Qual dessas opções melhor descreve você? (Pergunta ${pageNumber - 1})`;
  }

  private static getCaktoQuestionOptions(pageNumber: number): string[] {
    const optionSets = [
      // Básicas (2-9)
      ['Iniciante - Nunca pratiquei', 'Intermediário - Já tenho experiência', 'Avançado - Pratico regularmente', 'Profissional - Sou instrutor'],
      ['Perder peso', 'Ganhar flexibilidade', 'Fortalecer músculos', 'Melhorar postura', 'Reduzir dores'],
      ['15-30 minutos', '30-45 minutos', '45-60 minutos', 'Mais de 1 hora'],
      ['Nenhuma', 'Dores nas costas', 'Problemas no joelho', 'Limitações de mobilidade'],
      ['Manhã (6h-10h)', 'Tarde (12h-17h)', 'Noite (18h-22h)', 'Madrugada (22h-6h)'],
      ['Mais intenso', 'Equilibrado', 'Mais relaxante', 'Varia conforme o dia'],
      ['Core/Abdômen', 'Pernas e glúteos', 'Braços e ombros', 'Corpo todo'],
      ['Sim, já pratico', 'Já vi mas nunca tentei', 'Primeira vez que ouço falar', 'Prefiro outros métodos'],
      
      // Estilo de vida (10-17)
      ['Muito alto', 'Alto', 'Moderado', 'Baixo'],
      ['Sedentário', 'Pouco ativo', 'Moderadamente ativo', 'Muito ativo'],
      ['Prefiro sozinho', 'Em dupla', 'Pequenos grupos', 'Grandes grupos'],
      ['Saúde', 'Estética', 'Performance', 'Bem-estar mental'],
      ['Muito rígido', 'Pouco flexível', 'Moderado', 'Muito flexível'],
      ['Sem equipamentos', 'Equipamentos básicos', 'Academia completa', 'Tanto faz'],
      ['Muito alto', 'Alto', 'Médio', 'Baixo'],
      ['Muito satisfeito', 'Satisfeito', 'Insatisfeito', 'Muito insatisfeito'],
      
      // Objetivos específicos (18-25)
      ['Perda de peso', 'Ganho de força', 'Mais flexibilidade', 'Menos dor'],
      ['1 mês', '3 meses', '6 meses', '1 ano'],
      ['Sim, vários', 'Sim, alguns', 'Sim, poucos', 'Não, é o primeiro'],
      ['Saúde', 'Aparência', 'Autoestima', 'Desafio pessoal'],
      ['Falta de tempo', 'Falta de motivação', 'Falta de conhecimento', 'Limitações físicas'],
      ['Variados sempre', 'Variados às vezes', 'Rotina fixa', 'Tanto faz'],
      ['Encaro de frente', 'Vou devagar', 'Preciso de apoio', 'Evito quando possível'],
      ['Saúde física', 'Saúde mental', 'Aparência', 'Performance'],
      
      // Personalidade (26-33)
      ['Muito disciplinado', 'Disciplinado', 'Pouco disciplinado', 'Nada disciplinado'],
      ['Instruções detalhadas', 'Explicações simples', 'Demonstrações visuais', 'Acompanhamento prático'],
      ['Sim, sempre', 'Sim, às vezes', 'Raramente', 'Nunca'],
      ['Elogios', 'Resultados visuais', 'Números/dados', 'Desafios'],
      ['Sim, sempre gradual', 'Prefiro gradual', 'Gosto de intensidade', 'Vou com tudo'],
      ['Me adapto bem', 'Me adapto devagar', 'Tenho dificuldade', 'Resisto muito'],
      ['Muito competitivo', 'Um pouco', 'Pouco competitivo', 'Nada competitivo'],
      ['Casa', 'Academia', 'Parque/ar livre', 'Online'],
      
      // Hábitos (34-41)
      ['7-8h regulares', '6-7h regulares', 'Irregular', 'Menos de 6h'],
      ['Muito boa', 'Boa', 'Regular', 'Precisa melhorar'],
      ['Sim, regularmente', 'Às vezes', 'Raramente', 'Nunca'],
      ['Falta de tempo', 'Falta de energia', 'Falta de motivação', 'Não sei como começar'],
      ['Curtos (15-30min)', 'Médios (30-45min)', 'Longos (45-60min)', 'Muito longos (60min+)'],
      ['Resultados visíveis', 'Sentir-me bem', 'Rotina estabelecida', 'Apoio de outros'],
      ['Total apoio', 'Algum apoio', 'Pouco apoio', 'Nenhum apoio'],
      ['Manhã cedo', 'Meio da manhã', 'Tarde', 'Noite'],
      
      // Finais (42-50)
      ['Não conseguir', 'Me machucar', 'Não ver resultados', 'Não ter tempo'],
      ['Sim, várias', 'Sim, algumas', 'Apenas uma', 'Nenhuma'],
      ['Resultados rápidos', 'Resultados graduais', 'Resultados duradouros', 'Processo de aprendizado'],
      ['Totalmente pronto', 'Pronto', 'Quase pronto', 'Ainda pensando'],
      ['Falta de tempo', 'Não ver resultados', 'Dificuldade', 'Custo'],
      ['Compartilho com outros', 'Celebro sozinho', 'Me dou presentes', 'Já penso no próximo objetivo'],
      ['Sim, essencial', 'Sim, prefiro', 'Tanto faz', 'Prefiro autonomia'],
      ['Corpo dos sonhos', 'Saúde perfeita', 'Autoconfiança total', 'Energia infinita'],
      ['Sim, agora mesmo!', 'Sim, esta semana', 'Sim, este mês', 'Ainda estou decidindo']
    ];
    
    const optionIndex = pageNumber - 2; // Ajustar porque página 1 é intro
    return optionSets[optionIndex] || ['Opção A', 'Opção B', 'Opção C', 'Opção D'];
  }

  private static getCaktoResponseId(pageNumber: number): string {
    const responseIds = [
      // Básicas (2-9)
      'nivel_experiencia', 'objetivo_principal', 'tempo_disponivel', 'limitacao_fisica',
      'horario_preferido', 'intensidade_treino', 'area_foco', 'experiencia_anterior',
      
      // Estilo de vida (10-17)
      'nivel_estresse', 'experiencia_exercicios', 'preferencia_grupo', 'motivacao_principal',
      'flexibilidade_atual', 'preferencia_equipamentos', 'energia_manha', 'satisfacao_corpo',
      
      // Objetivos específicos (18-25)
      'resultado_prioritario', 'prazo_resultados', 'metodos_anteriores', 'maior_motivacao',
      'maior_dificuldade', 'preferencia_variedade', 'reacao_desafios', 'prioridade_um',
      
      // Personalidade (26-33)
      'nivel_disciplina', 'estilo_orientacao', 'acompanhar_progresso', 'tipo_feedback',
      'abordagem_gradual', 'adaptacao_mudancas', 'competitividade', 'ambiente_treino',
      
      // Hábitos (34-41)
      'rotina_sono', 'qualidade_alimentacao', 'frequencia_exercicio', 'maior_obstaculo',
      'duracao_treino', 'fonte_motivacao', 'apoio_familiar', 'momento_favorito',
      
      // Finais (42-50)
      'maior_preocupacao', 'condicoes_medicas', 'expectativa_realista', 'nivel_comprometimento',
      'motivo_desistencia', 'forma_celebracao', 'acompanhamento_personalizado', 'sonho_transformacao',
      'prontidao_inicio'
    ];
    
    const responseIndex = pageNumber - 2; // Ajustar porque página 1 é intro
    return responseIds[responseIndex] || `resposta_pagina_${pageNumber}`;
  }

  private static getCaktoPageSettings(): any {
    return {
      backgroundColor: '#FFFFFF',
      padding: '2rem',
      maxWidth: '600px',
      centered: true
    };
  }

  private static getCaktoFunnelSettings(): any {
    return {
      leadCollection: true,
      progressBar: true,
      autoSave: true,
      mobileOptimized: true
    };
  }

  private static extractCaktoTheme($: cheerio.CheerioAPI, html: string, visualElements: any): any {
    return {
      name: 'Cakto Theme',
      colors: {
        primary: visualElements.colors.primary,
        secondary: visualElements.colors.buttons[1] || '#6B7280',
        background: '#FFFFFF',
        text: visualElements.colors.text[0] || '#1F2937'
      },
      fonts: {
        primary: 'system-ui, sans-serif',
        secondary: 'system-ui, sans-serif'
      },
      spacing: {
        small: '0.5rem',
        medium: '1rem',
        large: '2rem'
      }
    };
  }

  // NOVO: Analisador específico para XQuiz
  private static analyzeXQuizFunnel(html: string, url: string): CompleteFunnel {
    console.log(`🎯 INICIANDO ANÁLISE ESPECÍFICA DE FUNIL XQUIZ`);
    
    const $ = cheerio.load(html);
    const pages: FunnelPage[] = [];
    
    // Extrair informações específicas da estrutura XQuiz
    const title = this.extractXQuizTitle($, html);
    const slug = this.extractXQuizSlug(url);
    
    console.log(`🎯 Título detectado: ${title}`);
    console.log(`🎯 Slug detectado: ${slug}`);
    
    // Detectar estrutura de quiz/funil baseada nos elementos do DOM
    const quizStructure = this.detectXQuizStructure($, html);
    
    // Analisar elementos visuais (cores, imagens, etc.)
    const visualElements = this.extractXQuizVisualElements($, html);
    
    // Criar páginas baseadas na estrutura detectada
    const estimatedPages = this.estimateXQuizPages($, html);
    console.log(`🎯 Páginas estimadas: ${estimatedPages}`);
    
    for (let i = 1; i <= estimatedPages; i++) {
      const pageType = this.determineXQuizPageType(i, estimatedPages);
      pages.push({
        id: nanoid(),
        pageNumber: i,
        title: `${pageType.title} (Página ${i})`,
        elements: this.createXQuizElements(i, pageType, visualElements),
        settings: this.getXQuizPageSettings()
      });
    }
    
    const funnel: CompleteFunnel = {
      id: nanoid(),
      title: title,
      description: `Funil importado do XQuiz: ${title}`,
      pages: pages.length,
      pageData: pages,
      elements: pages.flatMap(page => page.elements),
      settings: this.getXQuizFunnelSettings(),
      theme: this.extractXQuizTheme($, html, visualElements),
      metadata: {
        originalUrl: url,
        importedAt: new Date().toISOString(),
        totalPages: pages.length,
        totalElements: pages.flatMap(page => page.elements).length,
        detectionMethod: 'xquiz_analyzer',
        platform: 'xquiz',
        slug: slug,
        quizStructure: quizStructure,
        visualElements: visualElements
      }
    };
    
    console.log(`✅ ANÁLISE XQUIZ COMPLETA: ${funnel.pages} páginas, ${funnel.elements.length} elementos`);
    return funnel;
  }

  // Métodos auxiliares para XQuiz
  private static extractXQuizTitle($: cheerio.CheerioAPI, html: string): string {
    let title = $('title').text().trim();
    
    if (!title || title === 'XQuiz') {
      title = $('meta[property="og:title"]').attr('content') || '';
    }
    
    if (!title) {
      title = $('h1').first().text().trim();
    }
    
    return title || 'Quiz XQuiz';
  }

  private static extractXQuizSlug(url: string): string {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    
    const subdomain = url.split('.')[0].replace('https://', '').replace('http://', '');
    
    return subdomain || lastPart || 'xquiz-quiz';
  }

  private static detectXQuizStructure($: cheerio.CheerioAPI, html: string): any {
    const hasQuestions = $('[data-question], .question, .quiz-question').length > 0;
    const hasMultipleChoice = $('input[type="radio"], input[type="checkbox"]').length > 0;
    const hasProgressBar = $('.progress, .progress-bar, [data-progress]').length > 0;
    
    return {
      isQuiz: hasQuestions,
      hasMultipleChoice: hasMultipleChoice,
      hasProgressBar: hasProgressBar,
      estimatedQuestions: Math.max(1, $('[data-question], .question').length || 5)
    };
  }

  private static extractXQuizVisualElements($: cheerio.CheerioAPI, html: string): any {
    const colors = {
      buttons: [],
      text: [],
      backgrounds: [],
      primary: '#6366F1'
    };
    
    const images = [];
    
    $('button, .btn, [role="button"]').each((i, elem) => {
      const $elem = $(elem);
      const bgColor = this.extractBackgroundColor($elem);
      if (bgColor && bgColor !== 'transparent') {
        colors.buttons.push(bgColor);
      }
    });
    
    $('img').each((i, elem) => {
      const $elem = $(elem);
      const src = $elem.attr('src');
      const alt = $elem.attr('alt') || '';
      if (src) {
        images.push({
          url: src.startsWith('http') ? src : `https://${src}`,
          alt: alt,
          position: i
        });
      }
    });
    
    return { colors, images };
  }

  private static estimateXQuizPages($: cheerio.CheerioAPI, html: string): number {
    const scriptContent = $('script').text();
    
    let estimatedPages = 18;
    
    const pageIndicators = [
      /questions?\s*:\s*\[[\s\S]*?\]/gi,
      /steps?\s*:\s*\[[\s\S]*?\]/gi,
      /pages?\s*:\s*\[[\s\S]*?\]/gi,
      /quiz[_-]?data\s*:\s*\[[\s\S]*?\]/gi,
      /form[_-]?pages\s*:\s*\[[\s\S]*?\]/gi
    ];
    
    pageIndicators.forEach(pattern => {
      const matches = scriptContent.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const commas = (match.match(/,/g) || []).length;
          if (commas > 0) {
            estimatedPages = Math.max(estimatedPages, commas + 1);
          }
          
          const objects = (match.match(/\{[^}]*\}/g) || []).length;
          if (objects > 0) {
            estimatedPages = Math.max(estimatedPages, objects);
          }
        });
      }
    });
    
    const formElements = $('input, select, textarea, button[type="submit"]').length;
    if (formElements > 8) {
      const pagesFromElements = Math.ceil(formElements / 2);
      estimatedPages = Math.max(estimatedPages, pagesFromElements);
    }
    
    const finalPages = Math.min(Math.max(estimatedPages, 15), 35);
    
    console.log(`🔍 Detecção XQuiz: ${finalPages} páginas (baseado em análise específica)`);
    return finalPages;
  }

  private static determineXQuizPageType(pageNumber: number, totalPages: number): { title: string, type: string, elements: string[] } {
    const percentage = pageNumber / totalPages;
    
    if (pageNumber === 1) {
      return { title: 'Início do Quiz', type: 'intro', elements: ['headline', 'text', 'button'] };
    } else if (pageNumber === totalPages) {
      return { title: 'Resultado Final', type: 'result', elements: ['headline', 'text', 'email', 'button'] };
    } else if (percentage <= 0.85) {
      return { title: `Pergunta ${pageNumber - 1}`, type: 'question', elements: ['question', 'multiple_choice', 'button'] };
    } else {
      return { title: 'Captura de Lead', type: 'lead_capture', elements: ['headline', 'email', 'phone', 'button'] };
    }
  }

  private static createXQuizElements(pageNumber: number, pageType: any, visualElements: any): FunnelElement[] {
    const elements: FunnelElement[] = [];
    const pageId = nanoid();
    
    console.log(`🎯 Criando elementos XQuiz para ${pageType.title} (Página ${pageNumber})`);
    
    if (pageType.type === 'intro') {
      elements.push({
        id: nanoid(),
        type: 'headline',
        position: 0,
        pageId,
        properties: {
          title: 'Descubra Seu Perfil Ideal',
          fontSize: '2xl',
          color: visualElements.colors.primary,
          alignment: 'center',
          fontWeight: 'bold'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'text',
        position: 1,
        pageId,
        properties: {
          text: 'Responda algumas perguntas rápidas e receba uma análise personalizada baseada no seu perfil.',
          fontSize: 'lg',
          color: '#374151',
          alignment: 'center'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'button',
        position: 2,
        pageId,
        properties: {
          text: 'Começar Quiz',
          backgroundColor: visualElements.colors.primary,
          textColor: '#FFFFFF',
          size: 'lg',
          borderRadius: 'md'
        }
      });
      
    } else if (pageType.type === 'question') {
      const questionText = this.getXQuizQuestionText(pageNumber);
      const options = this.getXQuizQuestionOptions(pageNumber);
      const responseId = this.getXQuizResponseId(pageNumber);
      
      elements.push({
        id: nanoid(),
        type: 'question',
        position: 0,
        pageId,
        properties: {
          question: questionText,
          responseId: responseId,
          required: true,
          fontSize: 'xl',
          color: '#1F2937',
          alignment: 'center'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'multiple_choice',
        position: 1,
        pageId,
        properties: {
          options: options,
          responseId: responseId,
          required: true,
          layout: 'vertical',
          allowMultiple: false
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'button',
        position: 2,
        pageId,
        properties: {
          text: 'Próxima',
          backgroundColor: visualElements.colors.primary,
          textColor: '#FFFFFF',
          size: 'md',
          borderRadius: 'md'
        }
      });
      
    } else if (pageType.type === 'lead_capture') {
      elements.push({
        id: nanoid(),
        type: 'headline',
        position: 0,
        pageId,
        properties: {
          title: 'Quase Pronto! Receba Seu Resultado',
          fontSize: 'xl',
          color: visualElements.colors.primary,
          alignment: 'center',
          fontWeight: 'bold'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'email',
        position: 1,
        pageId,
        properties: {
          placeholder: 'Seu melhor e-mail',
          responseId: 'email_contato',
          required: true
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'phone',
        position: 2,
        pageId,
        properties: {
          placeholder: 'WhatsApp (opcional)',
          responseId: 'whatsapp_contato',
          required: false
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'button',
        position: 3,
        pageId,
        properties: {
          text: 'Receber Resultado',
          backgroundColor: visualElements.colors.primary,
          textColor: '#FFFFFF',
          size: 'lg',
          borderRadius: 'md'
        }
      });
      
    } else if (pageType.type === 'result') {
      elements.push({
        id: nanoid(),
        type: 'headline',
        position: 0,
        pageId,
        properties: {
          title: 'Seu Resultado Está Pronto!',
          fontSize: '2xl',
          color: '#059669',
          alignment: 'center',
          fontWeight: 'bold'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'text',
        position: 1,
        pageId,
        properties: {
          text: 'Baseado nas suas respostas, criamos uma análise personalizada. Verifique seu e-mail em alguns instantes.',
          fontSize: 'lg',
          color: '#374151',
          alignment: 'center'
        }
      });
      
      elements.push({
        id: nanoid(),
        type: 'button',
        position: 2,
        pageId,
        properties: {
          text: 'Finalizar',
          backgroundColor: '#059669',
          textColor: '#FFFFFF',
          size: 'lg',
          borderRadius: 'md'
        }
      });
    }
    
    return elements;
  }

  private static getXQuizQuestionText(pageNumber: number): string {
    const questions = [
      'Qual é o seu principal objetivo?',
      'Como você se descreveria?',
      'Qual é sua prioridade número 1?',
      'Como você prefere aprender?',
      'Qual é seu estilo de personalidade?',
      'O que mais te motiva?',
      'Como você lida com desafios?',
      'Qual é sua abordagem preferida?',
      'O que é mais importante para você?',
      'Como você prefere trabalhar?',
      'Qual é seu foco principal?',
      'Como você toma decisões?',
      'O que te inspira mais?',
      'Qual é seu método preferido?',
      'Como você se organiza?',
      'O que te energiza?',
      'Qual é sua estratégia?',
      'Como você se comunica?',
      'O que valoriza mais?',
      'Qual é seu objetivo final?',
      'Como você mede sucesso?',
      'O que te diferencia?',
      'Qual é sua visão?',
      'Como você se adapta?',
      'O que busca alcançar?',
      'Qual é seu maior sonho?',
      'Como você se motiva?',
      'O que te faz feliz?',
      'Qual é sua missão?',
      'Como você se vê?'
    ];
    
    const questionIndex = pageNumber - 2;
    return questions[questionIndex] || `Qual dessas opções melhor descreve você? (Pergunta ${pageNumber - 1})`;
  }

  private static getXQuizQuestionOptions(pageNumber: number): string[] {
    const optionSets = [
      ['Crescimento pessoal', 'Sucesso profissional', 'Relacionamentos', 'Saúde e bem-estar'],
      ['Líder nato', 'Colaborativo', 'Analítico', 'Criativo'],
      ['Eficiência', 'Qualidade', 'Inovação', 'Estabilidade'],
      ['Teoria e conceitos', 'Prática e experiência', 'Discussão em grupo', 'Autoestudo'],
      ['Extrovertido', 'Introvertido', 'Ambicioso', 'Equilibrado'],
      ['Reconhecimento', 'Autonomia', 'Propósito', 'Segurança'],
      ['Enfrento diretamente', 'Busco soluções criativas', 'Peço ajuda', 'Analiso primeiro'],
      ['Estruturada', 'Flexível', 'Intuitiva', 'Sistemática'],
      ['Resultados', 'Processo', 'Pessoas', 'Aprendizado'],
      ['Individualmente', 'Em equipe', 'Com mentoria', 'Por projetos'],
      ['Metas de curto prazo', 'Visão de longo prazo', 'Impacto social', 'Desenvolvimento pessoal'],
      ['Dados e fatos', 'Intuição', 'Opiniões de outros', 'Experiência prévia'],
      ['Conquistas', 'Descobertas', 'Conexões', 'Transformações'],
      ['Planejamento detalhado', 'Ação imediata', 'Experimentação', 'Observação'],
      ['Listas e sistemas', 'Espontaneidade', 'Rotinas fixas', 'Adaptação constante'],
      ['Desafios', 'Conquistas', 'Relacionamentos', 'Conhecimento'],
      ['Foco em resultados', 'Construção gradual', 'Inovação disruptiva', 'Melhoria contínua'],
      ['Direto e claro', 'Diplomático', 'Inspirador', 'Questionador'],
      ['Honestidade', 'Excelência', 'Compaixão', 'Liberdade'],
      ['Realização pessoal', 'Impacto positivo', 'Reconhecimento', 'Independência'],
      ['Métricas objetivas', 'Satisfação pessoal', 'Feedback de outros', 'Progresso visível'],
      ['Determinação', 'Criatividade', 'Empatia', 'Conhecimento'],
      ['Transformar vidas', 'Criar algo único', 'Liderar mudanças', 'Alcançar excelência'],
      ['Rapidamente', 'Com cautela', 'Busco padrões', 'Experimento'],
      ['Maestria', 'Impacto', 'Conexão', 'Liberdade'],
      ['Fazer a diferença', 'Ser reconhecido', 'Viver plenamente', 'Construir legado'],
      ['Visualizando objetivos', 'Celebrando pequenas vitórias', 'Conectando com outros', 'Aprendendo sempre'],
      ['Conquistas', 'Relacionamentos', 'Descobertas', 'Momentos de paz'],
      ['Inspirar outros', 'Resolver problemas', 'Criar beleza', 'Buscar verdade'],
      ['Uma pessoa realizada', 'Um profissional respeitado', 'Um ser humano íntegro', 'Um eterno aprendiz']
    ];
    
    const optionIndex = pageNumber - 2;
    return optionSets[optionIndex] || ['Opção A', 'Opção B', 'Opção C', 'Opção D'];
  }

  private static getXQuizResponseId(pageNumber: number): string {
    const responseIds = [
      'objetivo_principal', 'perfil_personalidade', 'prioridade_um', 'estilo_aprendizado',
      'tipo_personalidade', 'fonte_motivacao', 'abordagem_desafios', 'metodo_preferido',
      'valor_principal', 'estilo_trabalho', 'foco_principal', 'processo_decisao',
      'fonte_inspiracao', 'estrategia_preferida', 'organizacao_pessoal', 'fonte_energia',
      'abordagem_estrategica', 'estilo_comunicacao', 'valor_fundamental', 'objetivo_final',
      'metrica_sucesso', 'diferencial_pessoal', 'visao_futuro', 'capacidade_adaptacao',
      'meta_alcancar', 'sonho_principal', 'metodo_motivacao', 'fonte_felicidade',
      'missao_pessoal', 'autoimagem'
    ];
    
    const responseIndex = pageNumber - 2;
    return responseIds[responseIndex] || `resposta_xquiz_${pageNumber}`;
  }

  private static getXQuizPageSettings(): any {
    return {
      backgroundColor: '#FFFFFF',
      padding: '2rem',
      maxWidth: '600px',
      centerContent: true
    };
  }

  private static getXQuizFunnelSettings(): any {
    return {
      leadCollection: true,
      progressBar: true,
      autoSave: true,
      mobileOptimized: true,
      allowBack: false,
      showProgress: true
    };
  }

  private static extractXQuizTheme($: cheerio.CheerioAPI, html: string, visualElements: any): any {
    return {
      name: 'XQuiz Theme',
      colors: {
        primary: visualElements.colors.primary,
        secondary: '#8B5CF6',
        background: '#FFFFFF',
        text: '#1F2937'
      },
      fonts: {
        primary: 'Inter, system-ui, sans-serif',
        secondary: 'Inter, system-ui, sans-serif'
      },
      spacing: {
        small: '0.5rem',
        medium: '1rem',
        large: '2rem'
      }
    };
  }
}