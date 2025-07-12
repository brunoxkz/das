import { nanoid } from 'nanoid';
import type { TypebotData, TypebotGroup, TypebotBlock, TypebotVariable, TypebotEdge } from '@shared/schema-sqlite';

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  structure: {
    pages: QuizPage[];
    globalBackgroundColor?: string;
  };
}

export interface QuizPage {
  id: string;
  title: string;
  type: 'normal' | 'transition';
  elements: QuizElement[];
}

export interface QuizElement {
  id: string;
  type: string;
  content: any;
  properties?: any;
  fieldId?: string;
}

export class TypebotConverter {
  private currentX = 0;
  private currentY = 0;
  private readonly SPACING_X = 300;
  private readonly SPACING_Y = 200;

  /**
   * Converte um Quiz Vendzz para formato TypeBot
   */
  public convertQuizToTypebot(quiz: Quiz): TypebotData {
    const groups: TypebotGroup[] = [];
    const variables: TypebotVariable[] = [];
    const edges: TypebotEdge[] = [];

    // Resetar posição
    this.currentX = 0;
    this.currentY = 0;

    // Criar variáveis a partir dos fieldIds dos elementos
    this.extractVariables(quiz, variables);

    // Converter cada página do quiz em um grupo TypeBot
    quiz.structure.pages.forEach((page, pageIndex) => {
      const group = this.convertPageToGroup(page, pageIndex, quiz.structure.pages.length);
      groups.push(group);

      // Criar conexões entre páginas
      if (pageIndex < quiz.structure.pages.length - 1) {
        const nextPage = quiz.structure.pages[pageIndex + 1];
        const nextGroup = groups.find(g => g.title === nextPage.title);
        
        if (nextGroup) {
          edges.push({
            id: nanoid(),
            from: {
              groupId: group.id,
              blockId: group.blocks[group.blocks.length - 1]?.id || group.blocks[0]?.id
            },
            to: {
              groupId: nextGroup.id
            }
          });
        }
      }
    });

    return {
      version: "6.0",
      name: quiz.title,
      groups,
      variables,
      edges,
      settings: {
        general: {
          isBrandingEnabled: false,
          isInputPrefillEnabled: true,
          isHideQueryParamsEnabled: false,
          isNewResultOnRefreshEnabled: true
        },
        typingEmulation: {
          enabled: true,
          speed: 300,
          maxDelay: 1500
        },
        security: {
          allowedOrigins: []
        }
      },
      theme: {
        general: {
          font: "Open Sans",
          background: {
            type: "solid",
            content: quiz.structure.globalBackgroundColor || "#ffffff"
          }
        },
        chat: {
          container: {
            backgroundColor: "#ffffff",
            color: "#303235"
          },
          hostBubbles: {
            backgroundColor: "#0042DA",
            color: "#ffffff"
          },
          guestBubbles: {
            backgroundColor: "#F7F8FF",
            color: "#303235"
          },
          inputs: {
            backgroundColor: "#ffffff",
            color: "#303235",
            placeholderColor: "#9095A0"
          },
          buttons: {
            backgroundColor: "#0042DA",
            color: "#ffffff"
          }
        }
      }
    };
  }

  /**
   * Extrai variáveis dos elementos do quiz
   */
  private extractVariables(quiz: Quiz, variables: TypebotVariable[]) {
    // Variáveis padrão
    variables.push(
      { id: nanoid(), name: "nome", value: "", type: "text" },
      { id: nanoid(), name: "email", value: "", type: "email" },
      { id: nanoid(), name: "telefone", value: "", type: "phone" },
      { id: nanoid(), name: "quiz_titulo", value: quiz.title, type: "text" }
    );

    // Extrair variáveis dos elementos
    quiz.structure.pages.forEach(page => {
      page.elements.forEach(element => {
        if (element.fieldId && !variables.find(v => v.name === element.fieldId)) {
          variables.push({
            id: nanoid(),
            name: element.fieldId,
            value: "",
            type: this.getVariableType(element.type)
          });
        }
      });
    });
  }

  /**
   * Converte uma página do quiz em um grupo TypeBot
   */
  private convertPageToGroup(page: QuizPage, pageIndex: number, totalPages: number): TypebotGroup {
    const group: TypebotGroup = {
      id: nanoid(),
      title: page.title || `Página ${pageIndex + 1}`,
      graphCoordinates: {
        x: this.currentX,
        y: this.currentY
      },
      blocks: []
    };

    // Atualizar posição para próximo grupo
    this.currentX += this.SPACING_X;
    if (this.currentX > this.SPACING_X * 3) {
      this.currentX = 0;
      this.currentY += this.SPACING_Y;
    }

    // Converter elementos da página em blocks
    page.elements.forEach((element, elementIndex) => {
      const blocks = this.convertElementToBlocks(element, pageIndex, elementIndex);
      group.blocks.push(...blocks);
    });

    // Adicionar bloco de navegação se não for a última página
    if (pageIndex < totalPages - 1) {
      group.blocks.push(this.createNavigationBlock());
    }

    return group;
  }

  /**
   * Converte um elemento do quiz em blocks TypeBot
   */
  private convertElementToBlocks(element: QuizElement, pageIndex: number, elementIndex: number): TypebotBlock[] {
    const blocks: TypebotBlock[] = [];

    switch (element.type) {
      case 'heading':
        blocks.push({
          id: nanoid(),
          type: 'text',
          content: {
            richText: [{
              type: 'p',
              children: [{
                text: element.content?.text || '',
                bold: true
              }]
            }]
          }
        });
        break;

      case 'paragraph':
        blocks.push({
          id: nanoid(),
          type: 'text',
          content: {
            richText: [{
              type: 'p',
              children: [{
                text: element.content?.text || ''
              }]
            }]
          }
        });
        break;

      case 'image':
        blocks.push({
          id: nanoid(),
          type: 'image',
          content: {
            url: element.content?.src || '',
            alt: element.content?.alt || ''
          }
        });
        break;

      case 'video':
        blocks.push({
          id: nanoid(),
          type: 'video',
          content: {
            url: element.content?.src || '',
            type: 'url'
          }
        });
        break;

      case 'multiple_choice':
        blocks.push({
          id: nanoid(),
          type: 'choice input',
          content: {
            question: element.content?.question || 'Escolha uma opção:',
            options: element.content?.options?.map((option: any) => ({
              id: nanoid(),
              label: option.text || option.label || ''
            })) || []
          },
          settings: {
            isMultipleChoice: element.content?.allowMultiple || false,
            saveVariableName: element.fieldId || `resposta_${pageIndex}_${elementIndex}`
          }
        });
        break;

      case 'text':
        blocks.push({
          id: nanoid(),
          type: 'text input',
          content: {
            question: element.content?.question || element.properties?.label || 'Digite sua resposta:',
            placeholder: element.properties?.placeholder || ''
          },
          settings: {
            saveVariableName: element.fieldId || `texto_${pageIndex}_${elementIndex}`
          }
        });
        break;

      case 'email':
        blocks.push({
          id: nanoid(),
          type: 'email input',
          content: {
            question: element.content?.question || element.properties?.label || 'Digite seu email:',
            placeholder: element.properties?.placeholder || 'seu@email.com'
          },
          settings: {
            saveVariableName: element.fieldId || 'email'
          }
        });
        break;

      case 'phone':
        blocks.push({
          id: nanoid(),
          type: 'phone input',
          content: {
            question: element.content?.question || element.properties?.label || 'Digite seu telefone:',
            placeholder: element.properties?.placeholder || '(00) 00000-0000'
          },
          settings: {
            saveVariableName: element.fieldId || 'telefone'
          }
        });
        break;

      case 'number':
        blocks.push({
          id: nanoid(),
          type: 'number input',
          content: {
            question: element.content?.question || element.properties?.label || 'Digite um número:',
            placeholder: element.properties?.placeholder || ''
          },
          settings: {
            saveVariableName: element.fieldId || `numero_${pageIndex}_${elementIndex}`,
            min: element.properties?.min,
            max: element.properties?.max
          }
        });
        break;

      case 'date':
        blocks.push({
          id: nanoid(),
          type: 'date input',
          content: {
            question: element.content?.question || element.properties?.label || 'Selecione uma data:',
            placeholder: element.properties?.placeholder || 'dd/mm/aaaa'
          },
          settings: {
            saveVariableName: element.fieldId || `data_${pageIndex}_${elementIndex}`
          }
        });
        break;

      case 'rating':
        blocks.push({
          id: nanoid(),
          type: 'rating input',
          content: {
            question: element.content?.question || element.properties?.label || 'Dê uma nota:',
            buttonType: 'Numbers',
            length: element.properties?.max || 5
          },
          settings: {
            saveVariableName: element.fieldId || `avaliacao_${pageIndex}_${elementIndex}`
          }
        });
        break;

      case 'textarea':
        blocks.push({
          id: nanoid(),
          type: 'text input',
          content: {
            question: element.content?.question || element.properties?.label || 'Digite sua mensagem:',
            placeholder: element.properties?.placeholder || ''
          },
          settings: {
            saveVariableName: element.fieldId || `mensagem_${pageIndex}_${elementIndex}`,
            isLong: true
          }
        });
        break;

      case 'continue_button':
        // Não precisa converter, a navegação é automática no TypeBot
        break;

      case 'loading_question':
        blocks.push({
          id: nanoid(),
          type: 'text',
          content: {
            richText: [{
              type: 'p',
              children: [{
                text: element.content?.text || 'Processando...'
              }]
            }]
          }
        });
        break;

      default:
        // Elementos não suportados são convertidos em texto
        blocks.push({
          id: nanoid(),
          type: 'text',
          content: {
            richText: [{
              type: 'p',
              children: [{
                text: `Elemento ${element.type} (não suportado diretamente)`
              }]
            }]
          }
        });
        break;
    }

    return blocks;
  }

  /**
   * Cria um bloco de navegação entre páginas
   */
  private createNavigationBlock(): TypebotBlock {
    return {
      id: nanoid(),
      type: 'text',
      content: {
        richText: [{
          type: 'p',
          children: [{
            text: '→ Próxima'
          }]
        }]
      }
    };
  }

  /**
   * Determina o tipo de variável baseado no tipo do elemento
   */
  private getVariableType(elementType: string): string {
    switch (elementType) {
      case 'email':
        return 'email';
      case 'phone':
        return 'phone';
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      case 'rating':
        return 'number';
      default:
        return 'text';
    }
  }
}