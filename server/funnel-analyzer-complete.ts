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
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const html = await response.text();
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
  
  private static detectPages($: cheerio.CheerioAPI): FunnelPage[] {
    const pages: FunnelPage[] = [];
    let pageNumber = 1;
    
    // Seletores para detectar páginas/seções
    const pageSelectors = [
      '.page', '.step', '.section', '.funnel-page', '.quiz-page',
      '[data-page]', '[data-step]', '[data-section]',
      '.container > div', 'main > section', '.content > div'
    ];
    
    for (const selector of pageSelectors) {
      const pageElements = $(selector);
      
      if (pageElements.length > 1) {
        console.log(`📄 Detectadas ${pageElements.length} páginas com: ${selector}`);
        
        pageElements.each((index, element) => {
          const $page = $(element);
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
        });
        
        if (pages.length > 0) break;
      }
    }
    
    return pages;
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
    return colorMatch ? colorMatch[1].trim() : '#000000';
  }
  
  private static extractBackgroundColor($elem: cheerio.Cheerio<any>): string {
    const style = $elem.attr('style') || '';
    const bgMatch = style.match(/background-color:\s*([^;]+)/);
    return bgMatch ? bgMatch[1].trim() : '#3b82f6';
  }
  
  private static extractAlignment($elem: cheerio.Cheerio<any>): string {
    const classList = $elem.attr('class') || '';
    const style = $elem.attr('style') || '';
    
    if (classList.includes('text-center') || style.includes('text-align: center')) return 'center';
    if (classList.includes('text-right') || style.includes('text-align: right')) return 'right';
    return 'left';
  }
  
  private static extractFontWeight($elem: cheerio.Cheerio<any>): string {
    const classList = $elem.attr('class') || '';
    if (classList.includes('font-bold') || classList.includes('bold')) return 'bold';
    if (classList.includes('font-semibold')) return 'semibold';
    if (classList.includes('font-medium')) return 'medium';
    if (classList.includes('font-light')) return 'light';
    return 'normal';
  }
  
  private static extractButtonStyle($elem: cheerio.Cheerio<any>): string {
    const classList = $elem.attr('class') || '';
    if (classList.includes('rounded')) return 'rounded';
    if (classList.includes('pill')) return 'pill';
    return 'default';
  }
  
  private static extractButtonSize($elem: cheerio.Cheerio<any>): string {
    const classList = $elem.attr('class') || '';
    if (classList.includes('btn-lg') || classList.includes('large')) return 'lg';
    if (classList.includes('btn-sm') || classList.includes('small')) return 'sm';
    return 'md';
  }
  
  private static extractBackground($elem: cheerio.Cheerio<any>): any {
    const style = $elem.attr('style') || '';
    const classList = $elem.attr('class') || '';
    
    return {
      color: this.extractBackgroundColor($elem),
      gradient: classList.includes('gradient'),
      image: style.match(/background-image:\s*url\(([^)]+)\)/) || null
    };
  }
  
  private static findLabelForInput($: cheerio.CheerioAPI, $input: cheerio.Cheerio<any>): string {
    // Procurar por label associado
    const id = $input.attr('id');
    if (id) {
      const label = $(`label[for="${id}"]`).text().trim();
      if (label) return label;
    }
    
    // Procurar por label pai
    const parentLabel = $input.closest('label').text().trim();
    if (parentLabel) return parentLabel;
    
    // Procurar por texto anterior
    const prevText = $input.prev().text().trim();
    if (prevText) return prevText;
    
    // Placeholder como fallback
    return $input.attr('placeholder') || 'Campo de entrada';
  }
  
  private static findQuestionForOptions($: cheerio.CheerioAPI, $options: cheerio.Cheerio<any>): string {
    // Procurar por título anterior
    const prevHeading = $options.prevAll('h1, h2, h3, h4, h5, h6, .question').first().text().trim();
    if (prevHeading) return prevHeading;
    
    // Procurar por parágrafo anterior
    const prevP = $options.prevAll('p').first().text().trim();
    if (prevP && prevP.includes('?')) return prevP;
    
    return 'Selecione uma opção:';
  }
  
  private static extractSettings($: cheerio.CheerioAPI): any {
    return {
      progressBar: $('[class*="progress"]').length > 0,
      navigation: {
        showBack: $('[class*="back"], [class*="prev"]').length > 0,
        showNext: $('[class*="next"], [class*="continue"]').length > 0
      },
      layout: 'vertical',
      animations: true
    };
  }
  
  private static extractTheme($: cheerio.CheerioAPI): any {
    const bodyClass = $('body').attr('class') || '';
    const bodyStyle = $('body').attr('style') || '';
    
    return {
      colors: {
        primary: this.extractBackgroundColor($('body')),
        background: '#ffffff',
        text: this.extractColor($('body'))
      },
      fonts: {
        family: 'Inter, sans-serif',
        size: 'base'
      },
      spacing: 'normal',
      borderRadius: 'md'
    };
  }
  
  private static extractPageSettings($page: cheerio.Cheerio<any>): any {
    return {
      background: this.extractBackground($page),
      padding: 'normal',
      maxWidth: '800px',
      alignment: 'center'
    };
  }
}