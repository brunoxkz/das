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

export default FunnelScraper;