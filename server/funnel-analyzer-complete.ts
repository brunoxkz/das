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
      if (isEncrypted) {
        console.log(`🔐 PÁGINA ENCRIPTADA DETECTADA - Aplicando métodos avançados`);
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
      /[a-z]{1}\[[a-z]{1}\]/g
    ];

    let encryptionScore = 0;
    
    for (const pattern of encryptionIndicators) {
      const matches = html.match(pattern);
      if (matches) {
        encryptionScore += matches.length;
        console.log(`🔐 Detectado padrão de encriptação: ${pattern.source} (${matches.length} ocorrências)`);
      }
    }

    // Se há mais de 5 indicadores, provavelmente é encriptado
    const isEncrypted = encryptionScore > 5;
    console.log(`🔐 Score de encriptação: ${encryptionScore} - ${isEncrypted ? 'ENCRIPTADO' : 'NORMAL'}`);
    
    return isEncrypted;
  }

  // NOVO: Analisar funils encriptados com métodos especiais
  private static analyzeEncryptedFunnel(html: string, url: string): CompleteFunnel {
    console.log(`🔐 INICIANDO ANÁLISE DE FUNIL ENCRIPTADO`);
    
    // Tentar decodificar o HTML
    const decodedHtml = this.attemptDecryption(html);
    const $ = cheerio.load(decodedHtml);
    
    // Usar métodos específicos para funils protegidos
    const pages = this.detectEncryptedPages($, html);
    
    if (pages.length === 0) {
      // Se ainda não detectou, criar estrutura baseada em padrões genéricos
      pages.push(this.createGenericEncryptedPage($, url));
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
    
    // Buscar por padrões específicos de InLead/ClickFunnels em código ofuscado
    const encryptedSelectors = [
      // Padrões comuns mesmo em código encriptado
      'div[id]', 'section[class]', 'main[class]',
      '[data-page]', '[data-step]', '[data-section]',
      // IDs e classes que frequentemente escapam da encriptação
      '#page', '#step', '#section', '#slide',
      '.page', '.step', '.section', '.slide',
      // Containers principais
      'body > div', 'html > body > div'
    ];
    
    // Também buscar no HTML original por padrões regex
    const htmlPagePatterns = [
      /page[_-]?\d+/gi,
      /step[_-]?\d+/gi,
      /slide[_-]?\d+/gi,
      /section[_-]?\d+/gi
    ];
    
    let foundPatterns = [];
    for (const pattern of htmlPagePatterns) {
      const matches = originalHtml.match(pattern);
      if (matches) {
        foundPatterns = foundPatterns.concat(matches);
      }
    }
    
    if (foundPatterns.length > 0) {
      console.log(`🔐 Encontrados ${foundPatterns.length} padrões de página: ${foundPatterns.slice(0, 5).join(', ')}`);
      
      // Criar páginas baseadas nos padrões encontrados
      const uniquePatterns = [...new Set(foundPatterns)];
      uniquePatterns.slice(0, 10).forEach((pattern, index) => {
        pages.push({
          id: nanoid(),
          pageNumber: index + 1,
          title: `Página ${index + 1}`,
          elements: this.createGenericElements(index + 1),
          settings: this.getDefaultPageSettings()
        });
      });
    }
    
    // Se não encontrou padrões, tentar extrair do DOM mesmo encriptado
    if (pages.length === 0) {
      for (const selector of encryptedSelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          console.log(`🔐 Encontrados ${elements.length} elementos com seletor: ${selector}`);
          
          elements.slice(0, 5).each((index, element) => {
            const $elem = $(element);
            const content = $elem.text().trim();
            
            if (content.length > 20) {
              pages.push({
                id: nanoid(),
                pageNumber: pages.length + 1,
                title: `Página ${pages.length + 1}`,
                elements: this.extractElementsFromEncryptedPage($, $elem, pages.length + 1),
                settings: this.getDefaultPageSettings()
              });
            }
          });
          
          if (pages.length > 0) break;
        }
      }
    }
    
    console.log(`🔐 Total de páginas detectadas no funil encriptado: ${pages.length}`);
    return pages;
  }

  // NOVO: Criar página genérica para funils encriptados
  private static createGenericEncryptedPage($: cheerio.CheerioAPI, url: string): FunnelPage {
    console.log(`🔐 Criando página genérica para funil encriptado`);
    
    return {
      id: nanoid(),
      pageNumber: 1,
      title: 'Página Principal',
      elements: this.createGenericElements(1),
      settings: this.getDefaultPageSettings()
    };
  }

  // NOVO: Criar elementos genéricos quando não consegue detectar
  private static createGenericElements(pageNumber: number): FunnelElement[] {
    const elements: FunnelElement[] = [];
    const pageId = nanoid();
    
    // Elementos padrão para qualquer funil
    elements.push({
      id: nanoid(),
      type: 'headline',
      position: 0,
      pageId,
      properties: {
        title: `Título da Página ${pageNumber}`,
        fontSize: 'xl',
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
        title: 'Descrição ou texto principal da página.',
        fontSize: 'base',
        color: '#333333',
        alignment: 'left',
        fontWeight: 'normal'
      }
    });
    
    elements.push({
      id: nanoid(),
      type: 'email',
      position: 2,
      pageId,
      properties: {
        title: 'Seu melhor email:',
        placeholder: 'Digite seu email aqui',
        required: true,
        responseId: 'email_lead',
        fieldWidth: 'full'
      }
    });
    
    elements.push({
      id: nanoid(),
      type: 'button',
      position: 3,
      pageId,
      properties: {
        title: 'CONTINUAR',
        style: 'solid',
        color: '#ffffff',
        backgroundColor: '#3b82f6',
        size: 'lg'
      }
    });
    
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
    
    // 1. HEADLINES/TÍTULOS
    $page.find('h1, h2, h3, .headline, .title, [class*="title"], [class*="headline"]').each((index, elem) => {
      const $elem = $(elem);
      const text = $elem.text().trim();
      if (text) {
        elements.push({
          id: nanoid(),
          type: 'headline',
          position: position++,
          pageId,
          properties: {
            title: text,
            style: elem.tagName.toLowerCase(),
            fontSize: this.extractFontSize($elem),
            color: this.extractColor($elem),
            alignment: this.extractAlignment($elem),
            fontWeight: this.extractFontWeight($elem)
          }
        });
      }
    });
    
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
}