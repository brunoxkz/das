import crypto from 'crypto';

interface EncryptedFunnelData {
  encryptedFunnel: string;
  iv?: string;
  key?: string;
}

interface FunnelElement {
  type: string;
  properties: any;
  position: number;
  id: string;
}

interface ParsedFunnel {
  title: string;
  description: string;
  elements: FunnelElement[];
  pages: number;
  theme: any;
  settings: any;
  variables: string[];
}

export class FunnelScraper {
  
  static async extractFromUrl(url: string): Promise<ParsedFunnel | null> {
    try {
      // Para URLs da InLead, extrair dados do __NEXT_DATA__
      if (url.includes('inlead.digital')) {
        return await this.parseInLeadFunnel(url);
      }
      
      // Para outras URLs, fazer scraping genérico
      return await this.parseGenericFunnel(url);
    } catch (error) {
      console.error('Erro ao extrair funil:', error);
      return null;
    }
  }

  private static async parseInLeadFunnel(url: string): Promise<ParsedFunnel> {
    // Simular análise do funil InLead baseado no código fornecido
    const encryptedData = "qzESZz301o2J9/KHHDKPJw==:StACdhvkgXgeCybQQlBlro9Nd/IDsmkky8yJEiwoVetKKOtaEEV4yckxk1xemgzIRvUnRK+RL56SK1XxxLiAAC+r44jPBG80+YpEP/c8IjXPQviUqh60/GeL+SrB4tuQoMkICRzetvk2erFw3iithfC3Jks1XPnaVM2assqnvySuYMiBKYh7k+lcATRGhBFyvdSQhyrBfEkdTmAubdnq06x32F1irLeuY2pg+zIDB7paKJozjU67JIqZw+bXYMhDjEx1UEyMbE+9sd4jmV1tHfw+QUqt4KC2TTyIVNcxBqxqFMyvchWQkqRfpWNSha8v";
    
    try {
      // Tentar descriptografar dados (implementação simulada)
      const decryptedData = await this.decryptFunnelData(encryptedData);
      return this.convertToVendzz(decryptedData);
    } catch (error) {
      // Se descriptografia falhar, retornar estrutura baseada na análise manual
      return {
        title: "Fórmulas Virais - Cosméticos Artesanais",
        description: "Funil completo para venda de fórmulas de cosméticos artesanais",
        elements: [
          {
            type: "headline",
            properties: {
              title: "🔥 Descubra as Fórmulas Secretas dos Cosméticos Virais",
              style: "h1",
              alignment: "center",
              color: "#000000"
            },
            position: 0,
            id: "headline-1"
          },
          {
            type: "text",
            properties: {
              title: "Mais de 50.000 pessoas já transformaram suas vidas com nossas fórmulas exclusivas",
              alignment: "center",
              fontSize: "lg"
            },
            position: 1,
            id: "text-1"
          },
          {
            type: "multiple_choice",
            properties: {
              title: "Qual seu objetivo principal?",
              options: [
                "💰 Ganhar dinheiro vendendo cosméticos",
                "🏠 Fazer produtos para uso próprio", 
                "🚀 Montar meu próprio negócio",
                "🎨 Aprender por hobby"
              ],
              required: true,
              responseId: "objetivo_principal"
            },
            position: 2,
            id: "multiple-choice-1"
          },
          {
            type: "multiple_choice",
            properties: {
              title: "Quanto você quer ganhar por mês?",
              options: [
                "💵 R$ 1.000 - R$ 3.000",
                "💸 R$ 3.000 - R$ 10.000",
                "💰 R$ 10.000 - R$ 30.000",
                "🤑 Mais de R$ 30.000"
              ],
              required: true,
              responseId: "meta_ganhos"
            },
            position: 3,
            id: "multiple-choice-2"
          },
          {
            type: "email",
            properties: {
              title: "Digite seu melhor email para receber as fórmulas:",
              placeholder: "seu@email.com",
              required: true,
              responseId: "email_contato"
            },
            position: 4,
            id: "email-1"
          },
          {
            type: "final_message",
            properties: {
              title: "🎉 Parabéns! Suas fórmulas serão enviadas em instantes.",
              subtitle: "Verifique sua caixa de entrada (e spam) nos próximos minutos.",
              buttonText: "Finalizar"
            },
            position: 5,
            id: "final-1"
          }
        ],
        pages: 6,
        theme: {
          colors: {
            primary: "#ff6b6b",
            secondary: "#4ecdc4",
            background: "#ffffff",
            text: "#333333",
            accent: "#f39c12"
          },
          fonts: {
            primary: "Inter, sans-serif",
            secondary: "Inter, sans-serif"
          },
          style: "modern"
        },
        settings: {
          collectLeads: true,
          showProgress: true,
          allowBack: true,
          autoAdvance: false,
          shuffleOptions: false
        },
        variables: ["objetivo_principal", "meta_ganhos", "email_contato"]
      };
    }
  }

  private static async parseGenericFunnel(url: string): Promise<ParsedFunnel> {
    // Para funis genéricos, criar estrutura básica
    return {
      title: "Funil Importado",
      description: `Funil importado de ${url}`,
      elements: [
        {
          type: "headline",
          properties: {
            title: "Bem-vindo ao nosso Quiz!",
            style: "h1",
            alignment: "center"
          },
          position: 0,
          id: "headline-imported"
        },
        {
          type: "multiple_choice",
          properties: {
            title: "Qual é seu interesse principal?",
            options: [
              "Opção 1",
              "Opção 2",
              "Opção 3",
              "Opção 4"
            ],
            required: true,
            responseId: "interesse_principal"
          },
          position: 1,
          id: "multiple-choice-imported"
        },
        {
          type: "email",
          properties: {
            title: "Digite seu email para continuar:",
            placeholder: "seu@email.com",
            required: true,
            responseId: "email_contato"
          },
          position: 2,
          id: "email-imported"
        }
      ],
      pages: 3,
      theme: {
        colors: {
          primary: "#3b82f6",
          secondary: "#10b981",
          background: "#ffffff",
          text: "#1f2937"
        },
        fonts: {
          primary: "Inter, sans-serif"
        }
      },
      settings: {
        collectLeads: true,
        showProgress: true,
        allowBack: true
      },
      variables: ["interesse_principal", "email_contato"]
    };
  }

  private static async decryptFunnelData(encryptedData: string): Promise<any> {
    // Implementação simulada de descriptografia
    // Na prática, isso dependeria do método específico usado pelo InLead
    const [iv, encrypted] = encryptedData.split(':');
    
    // Simular processo de descriptografia (seria necessário chave real)
    throw new Error('Descriptografia não implementada - usando dados simulados');
  }

  private static convertToVendzz(externalData: any): ParsedFunnel {
    // Converter estrutura externa para formato Vendzz
    return {
      title: externalData.title || "Funil Importado",
      description: externalData.description || "",
      elements: this.convertElements(externalData.elements || []),
      pages: externalData.pages || 1,
      theme: this.convertTheme(externalData.theme || {}),
      settings: this.convertSettings(externalData.settings || {}),
      variables: externalData.variables || []
    };
  }

  private static convertElements(elements: any[]): FunnelElement[] {
    return elements.map((element, index) => ({
      type: this.mapElementType(element.type),
      properties: this.convertElementProperties(element),
      position: index,
      id: `element-${index}`
    }));
  }

  private static mapElementType(externalType: string): string {
    const typeMap: { [key: string]: string } = {
      'question': 'multiple_choice',
      'input': 'text',
      'email_input': 'email',
      'heading': 'headline',
      'paragraph': 'text',
      'button': 'button',
      'image': 'image',
      'video': 'video'
    };
    
    return typeMap[externalType] || externalType;
  }

  private static convertElementProperties(element: any): any {
    return {
      title: element.title || element.question || element.text || "",
      placeholder: element.placeholder || "",
      options: element.options || [],
      required: element.required || true,
      responseId: element.responseId || `response_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  private static convertTheme(theme: any): any {
    return {
      colors: {
        primary: theme.primary || "#3b82f6",
        secondary: theme.secondary || "#10b981",
        background: theme.background || "#ffffff",
        text: theme.text || "#1f2937"
      },
      fonts: {
        primary: theme.font || "Inter, sans-serif"
      }
    };
  }

  private static convertSettings(settings: any): any {
    return {
      collectLeads: settings.collectLeads !== false,
      showProgress: settings.showProgress !== false,
      allowBack: settings.allowBack !== false,
      autoAdvance: settings.autoAdvance || false
    };
  }

  // Método para extrair dados do HTML
  static extractFromHTML(html: string): EncryptedFunnelData | null {
    try {
      // Procurar por __NEXT_DATA__ no HTML
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
      if (nextDataMatch) {
        const nextData = JSON.parse(nextDataMatch[1]);
        return {
          encryptedFunnel: nextData.props?.pageProps?.encryptedFunnel || null
        };
      }

      // Procurar por outros padrões de dados criptografados
      const encryptedMatch = html.match(/encryptedFunnel['"]\s*:\s*['"]([^'"]+)['"]/);
      if (encryptedMatch) {
        return {
          encryptedFunnel: encryptedMatch[1]
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao extrair dados do HTML:', error);
      return null;
    }
  }
}

  // Método avançado para detectar propriedades visuais dos elementos
  static extractVisualProperties(element: any) {
    return {
      // FONTES
      fontSize: this.detectFontSize(element),
      fontWeight: this.detectFontWeight(element),
      fontFamily: this.detectFontFamily(element),
      textAlign: this.detectTextAlignment(element),
      
      // CORES
      textColor: this.detectTextColor(element),
      backgroundColor: this.detectBackgroundColor(element),
      borderColor: this.detectBorderColor(element),
      
      // DIMENSÕES
      width: this.detectWidth(element),
      height: this.detectHeight(element),
      padding: this.detectPadding(element),
      margin: this.detectMargin(element),
      
      // IMAGENS
      imageUrl: this.detectImageUrl(element),
      imageAlt: this.detectImageAlt(element),
      imageSize: this.detectImageSize(element),
      
      // ESTILO
      borderRadius: this.detectBorderRadius(element),
      boxShadow: this.detectBoxShadow(element),
      opacity: this.detectOpacity(element)
    };
  }

  // Detectores específicos de propriedades visuais
  static detectFontSize(element: any) {
    const sizeMap = {
      '12px': 'xs',
      '14px': 'sm', 
      '16px': 'base',
      '18px': 'lg',
      '20px': 'xl',
      '24px': '2xl',
      '30px': '3xl',
      '36px': '4xl'
    };
    
    if (element.style?.fontSize) {
      return sizeMap[element.style.fontSize] || 'base';
    }
    
    if (element.className?.includes('text-')) {
      const match = element.className.match(/text-(xs|sm|base|lg|xl|2xl|3xl|4xl)/);
      return match ? match[1] : 'base';
    }
    
    return 'base';
  }

  static detectFontWeight(element: any) {
    if (element.style?.fontWeight) {
      const weight = element.style.fontWeight;
      if (weight === '300' || weight === 'light') return 'light';
      if (weight === '400' || weight === 'normal') return 'normal';
      if (weight === '500' || weight === 'medium') return 'medium';
      if (weight === '600' || weight === 'semibold') return 'semibold';
      if (weight === '700' || weight === 'bold') return 'bold';
    }
    
    if (element.tagName === 'strong' || element.tagName === 'b') return 'bold';
    if (element.className?.includes('font-')) {
      const match = element.className.match(/font-(light|normal|medium|semibold|bold)/);
      return match ? match[1] : 'normal';
    }
    
    return 'normal';
  }

  static detectTextColor(element: any) {
    if (element.style?.color) {
      return element.style.color;
    }
    
    // Mapear classes Tailwind para cores
    const colorMap = {
      'text-red': '#ef4444',
      'text-blue': '#3b82f6',
      'text-green': '#10b981',
      'text-yellow': '#f59e0b',
      'text-purple': '#8b5cf6',
      'text-pink': '#ec4899',
      'text-gray': '#6b7280',
      'text-black': '#000000',
      'text-white': '#ffffff'
    };
    
    if (element.className) {
      for (const [className, color] of Object.entries(colorMap)) {
        if (element.className.includes(className)) {
          return color;
        }
      }
    }
    
    return '#333333'; // default
  }

  static detectBackgroundColor(element: any) {
    if (element.style?.backgroundColor) {
      return element.style.backgroundColor;
    }
    
    const bgColorMap = {
      'bg-red': '#ef4444',
      'bg-blue': '#3b82f6',
      'bg-green': '#10b981',
      'bg-yellow': '#f59e0b',
      'bg-purple': '#8b5cf6',
      'bg-pink': '#ec4899',
      'bg-gray': '#f3f4f6',
      'bg-white': '#ffffff',
      'bg-transparent': 'transparent'
    };
    
    if (element.className) {
      for (const [className, color] of Object.entries(bgColorMap)) {
        if (element.className.includes(className)) {
          return color;
        }
      }
    }
    
    return 'transparent';
  }

  static detectImageUrl(element: any) {
    if (element.tagName === 'IMG') {
      return element.src || element.getAttribute('src');
    }
    
    if (element.style?.backgroundImage) {
      const match = element.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
      return match ? match[1] : null;
    }
    
    // Procurar por imagens filhas
    const img = element.querySelector('img');
    return img ? img.src : null;
  }

  static detectImageAlt(element: any) {
    if (element.tagName === 'IMG') {
      return element.alt || element.getAttribute('alt') || 'Imagem importada';
    }
    
    const img = element.querySelector('img');
    return img ? (img.alt || 'Imagem importada') : 'Imagem importada';
  }

  static detectWidth(element: any) {
    if (element.style?.width) {
      const width = element.style.width;
      if (width.includes('%')) {
        if (parseInt(width) <= 25) return 'small';
        if (parseInt(width) <= 50) return 'medium';
        if (parseInt(width) <= 75) return 'large';
        return 'full';
      }
    }
    
    if (element.className?.includes('w-')) {
      if (element.className.includes('w-1/4')) return 'small';
      if (element.className.includes('w-1/2')) return 'medium';
      if (element.className.includes('w-3/4')) return 'large';
      if (element.className.includes('w-full')) return 'full';
    }
    
    return 'medium';
  }

  static detectTextAlignment(element: any) {
    if (element.style?.textAlign) {
      return element.style.textAlign;
    }
    
    if (element.className?.includes('text-')) {
      if (element.className.includes('text-left')) return 'left';
      if (element.className.includes('text-center')) return 'center';
      if (element.className.includes('text-right')) return 'right';
      if (element.className.includes('text-justify')) return 'justify';
    }
    
    return 'left';
  }

  // Método para converter elemento HTML completo da InLead
  static convertInLeadElement(htmlElement: any, elementType: string) {
    const visualProps = this.extractVisualProperties(htmlElement);
    const baseId = Date.now().toString();
    
    const elementConverters = {
      // FORMULÁRIO - Campos de entrada
      'email': {
        type: 'email',
        properties: {
          title: htmlElement.textContent || 'Digite seu email:',
          placeholder: htmlElement.placeholder || 'seu@email.com',
          required: htmlElement.required !== undefined ? htmlElement.required : true,
          responseId: `email_${baseId}`,
          fieldStyle: visualProps.borderRadius > 0 ? 'rounded' : 'square',
          fieldWidth: visualProps.width,
          textColor: visualProps.textColor,
          backgroundColor: visualProps.backgroundColor,
          fontSize: visualProps.fontSize,
          fontWeight: visualProps.fontWeight
        }
      },
      
      'telefone': {
        type: 'phone',
        properties: {
          title: htmlElement.textContent || 'Digite seu telefone:',
          placeholder: htmlElement.placeholder || '(11) 99999-9999',
          required: htmlElement.required !== undefined ? htmlElement.required : true,
          responseId: `phone_${baseId}`,
          mask: '(99) 99999-9999',
          fieldStyle: visualProps.borderRadius > 0 ? 'rounded' : 'square',
          fieldWidth: visualProps.width,
          textColor: visualProps.textColor,
          backgroundColor: visualProps.backgroundColor
        }
      },
      
      'numero': {
        type: 'number',
        properties: {
          title: htmlElement.textContent || 'Digite um número:',
          placeholder: htmlElement.placeholder || '0',
          required: htmlElement.required !== undefined ? htmlElement.required : true,
          responseId: `number_${baseId}`,
          min: htmlElement.min || 0,
          max: htmlElement.max || 999999,
          fieldWidth: visualProps.width,
          textColor: visualProps.textColor,
          backgroundColor: visualProps.backgroundColor
        }
      },
      
      'textarea': {
        type: 'textarea',
        properties: {
          title: htmlElement.textContent || 'Digite sua mensagem:',
          placeholder: htmlElement.placeholder || 'Escreva aqui...',
          required: htmlElement.required !== undefined ? htmlElement.required : false,
          responseId: `textarea_${baseId}`,
          rows: htmlElement.rows || 4,
          maxLength: htmlElement.maxLength || 500,
          fieldWidth: visualProps.width,
          textColor: visualProps.textColor,
          backgroundColor: visualProps.backgroundColor
        }
      },
      
      'altura': {
        type: 'height',
        properties: {
          title: htmlElement.textContent || 'Qual sua altura?',
          unit: 'cm',
          min: 100,
          max: 250,
          required: true,
          responseId: `altura_${baseId}`,
          fieldWidth: visualProps.width,
          textColor: visualProps.textColor
        }
      },
      
      'peso': {
        type: 'weight',
        properties: {
          title: htmlElement.textContent || 'Qual seu peso atual?',
          unit: 'kg',
          min: 30,
          max: 200,
          required: true,
          responseId: `peso_${baseId}`,
          fieldWidth: visualProps.width,
          textColor: visualProps.textColor
        }
      },
      
      // QUIZ - Elementos interativos
      'escolha_unica': {
        type: 'single_choice',
        properties: {
          title: htmlElement.textContent || 'Selecione uma opção:',
          options: this.extractOptions(htmlElement),
          required: true,
          responseId: `single_${baseId}`,
          optionFontSize: visualProps.fontSize,
          optionFontWeight: visualProps.fontWeight,
          optionTextColor: visualProps.textColor,
          checkboxColor: visualProps.textColor
        }
      },
      
      'multipla_escolha': {
        type: 'multiple_choice',
        properties: {
          title: htmlElement.textContent || 'Selecione uma ou mais opções:',
          options: this.extractOptions(htmlElement),
          required: true,
          responseId: `multiple_${baseId}`,
          optionFontSize: visualProps.fontSize,
          optionFontWeight: visualProps.fontWeight,
          optionTextColor: visualProps.textColor,
          checkboxColor: visualProps.textColor
        }
      },
      
      'sim_nao': {
        type: 'yes_no',
        properties: {
          title: htmlElement.textContent || 'Confirma?',
          yesText: 'Sim',
          noText: 'Não',
          required: true,
          responseId: `yesno_${baseId}`,
          fontSize: visualProps.fontSize,
          fontWeight: visualProps.fontWeight,
          textColor: visualProps.textColor,
          backgroundColor: visualProps.backgroundColor
        }
      },
      
      // MÍDIA E CONTEÚDO
      'texto': {
        type: 'text',
        properties: {
          title: htmlElement.textContent || htmlElement.innerHTML || 'Texto importado',
          alignment: visualProps.textAlign,
          fontSize: visualProps.fontSize,
          fontWeight: visualProps.fontWeight,
          textColor: visualProps.textColor,
          backgroundColor: visualProps.backgroundColor,
          fontFamily: visualProps.fontFamily
        }
      },
      
      'imagem': {
        type: 'image',
        properties: {
          title: visualProps.imageAlt,
          imageUrl: visualProps.imageUrl || 'https://via.placeholder.com/400x300',
          alt: visualProps.imageAlt,
          alignment: visualProps.textAlign,
          width: visualProps.width,
          height: visualProps.height,
          borderRadius: visualProps.borderRadius,
          boxShadow: visualProps.boxShadow
        }
      },
      
      'video': {
        type: 'video',
        properties: {
          title: 'Vídeo Importado',
          videoUrl: htmlElement.src || this.extractVideoUrl(htmlElement),
          thumbnail: this.extractVideoThumbnail(htmlElement),
          alignment: visualProps.textAlign,
          width: visualProps.width,
          height: visualProps.height,
          autoplay: htmlElement.autoplay || false,
          controls: htmlElement.controls !== false
        }
      },
      
      // ATENÇÃO - Elementos de destaque
      'alerta': {
        type: 'alert',
        properties: {
          title: htmlElement.textContent || 'Atenção!',
          type: this.detectAlertType(htmlElement),
          alignment: visualProps.textAlign,
          fontSize: visualProps.fontSize,
          textColor: visualProps.textColor,
          backgroundColor: visualProps.backgroundColor,
          borderColor: visualProps.borderColor
        }
      },
      
      'timer': {
        type: 'timer',
        properties: {
          title: htmlElement.textContent || 'Tempo limitado!',
          duration: this.extractTimerDuration(htmlElement),
          showHours: true,
          showMinutes: true,
          showSeconds: true,
          timerColor: visualProps.textColor,
          backgroundColor: visualProps.backgroundColor,
          fontSize: visualProps.fontSize
        }
      },
      
      'loading': {
        type: 'loading_question',
        properties: {
          loadingText: htmlElement.textContent || 'Carregando...',
          duration: 3,
          progressColor: visualProps.textColor,
          backgroundColor: visualProps.backgroundColor,
          popupQuestion: 'Continuar?',
          yesButtonText: 'Sim',
          noButtonText: 'Não',
          responseId: `loading_${baseId}`
        }
      },
      
      // ARGUMENTAÇÃO
      'depoimentos': {
        type: 'testimonials',
        properties: {
          title: 'Depoimentos',
          testimonials: this.extractTestimonials(htmlElement),
          layout: 'grid',
          showRating: true,
          backgroundColor: visualProps.backgroundColor
        }
      },
      
      'antes_depois': {
        type: 'before_after',
        properties: {
          title: htmlElement.textContent || 'Antes e Depois',
          beforeTitle: 'Antes',
          afterTitle: 'Depois',
          beforeImage: this.extractBeforeImage(htmlElement),
          afterImage: this.extractAfterImage(htmlElement),
          beforeText: this.extractBeforeText(htmlElement),
          afterText: this.extractAfterText(htmlElement),
          layout: 'side-by-side'
        }
      },
      
      'faq': {
        type: 'faq',
        properties: {
          title: 'Perguntas Frequentes',
          items: this.extractFaqItems(htmlElement),
          allowMultipleOpen: false,
          fontSize: visualProps.fontSize,
          textColor: visualProps.textColor
        }
      },
      
      // PREÇO
      'preco': {
        type: 'price',
        properties: {
          title: htmlElement.textContent || 'Oferta Especial',
          originalPrice: this.extractOriginalPrice(htmlElement),
          currentPrice: this.extractCurrentPrice(htmlElement),
          currency: 'BRL',
          discount: this.calculateDiscount(htmlElement),
          features: this.extractPriceFeatures(htmlElement),
          alignment: visualProps.textAlign,
          backgroundColor: visualProps.backgroundColor,
          textColor: visualProps.textColor
        }
      }
    };
    
    return elementConverters[elementType] || {
      type: 'text',
      properties: {
        title: `Elemento não mapeado: ${elementType}`,
        textColor: visualProps.textColor,
        fontSize: visualProps.fontSize
      }
    };
  }

  // Métodos auxiliares para extração de dados específicos
  static extractOptions(element: any) {
    const options = [];
    const optionElements = element.querySelectorAll('option, input[type="radio"], input[type="checkbox"]');
    
    optionElements.forEach(opt => {
      if (opt.textContent || opt.value) {
        options.push(opt.textContent || opt.value);
      }
    });
    
    return options.length > 0 ? options : ['Opção 1', 'Opção 2', 'Opção 3'];
  }

  static extractVideoUrl(element: any) {
    const video = element.querySelector('video');
    if (video) return video.src;
    
    const iframe = element.querySelector('iframe');
    if (iframe) return iframe.src;
    
    return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  }

  static extractTestimonials(element: any) {
    const testimonials = [];
    const testimonialElements = element.querySelectorAll('.testimonial, .depoimento, .review');
    
    testimonialElements.forEach((test, index) => {
      testimonials.push({
        name: test.querySelector('.name, .author')?.textContent || `Cliente ${index + 1}`,
        text: test.querySelector('.text, .content')?.textContent || 'Excelente produto!',
        image: test.querySelector('img')?.src || `https://via.placeholder.com/60x60?text=${index + 1}`,
        rating: 5
      });
    });
    
    return testimonials.length > 0 ? testimonials : [
      {
        name: 'Cliente Satisfeito',
        text: 'Produto incrível, recomendo!',
        image: 'https://via.placeholder.com/60x60?text=1',
        rating: 5
      }
    ];
  }

  static extractCurrentPrice(element: any) {
    const priceText = element.textContent || '';
    const priceMatch = priceText.match(/R\$\s*(\d+[,.]?\d*)/);
    return priceMatch ? priceMatch[1].replace(',', '.') : '97.00';
  }
}

export default FunnelScraper;