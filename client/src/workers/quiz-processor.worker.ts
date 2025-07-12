/**
 * WEB WORKER PARA PROCESSING DE QUIZ
 * Processa validação e compressão em background sem bloquear UI
 */

// Tipos para TypeScript
interface QuizData {
  id: string;
  title: string;
  pages: any[];
  responses?: any[];
}

interface ProcessingTask {
  id: string;
  type: 'validate' | 'compress' | 'analyze' | 'extract';
  data: any;
  timestamp: number;
}

interface ProcessingResult {
  id: string;
  success: boolean;
  result?: any;
  error?: string;
  processingTime: number;
}

// Cache de resultados processados
const resultCache = new Map<string, any>();

/**
 * VALIDAÇÃO DE QUIZ EM BACKGROUND
 */
function validateQuiz(quizData: QuizData): any {
  const startTime = Date.now();
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Validar estrutura básica
    if (!quizData.title || quizData.title.trim().length === 0) {
      errors.push('Título do quiz é obrigatório');
    }

    if (!quizData.pages || quizData.pages.length === 0) {
      errors.push('Quiz deve ter pelo menos uma página');
    }

    // Validar cada página
    quizData.pages?.forEach((page, index) => {
      if (!page.elements || page.elements.length === 0) {
        warnings.push(`Página ${index + 1} está vazia`);
      }

      // Validar elementos obrigatórios
      page.elements?.forEach((element: any, elemIndex: number) => {
        if (element.required && !element.properties?.placeholder) {
          warnings.push(`Elemento ${elemIndex + 1} da página ${index + 1} é obrigatório mas não tem placeholder`);
        }

        if (element.type === 'email' && !element.properties?.validation) {
          warnings.push(`Campo de email na página ${index + 1} precisa de validação`);
        }
      });
    });

    const processingTime = Date.now() - startTime;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      stats: {
        totalPages: quizData.pages?.length || 0,
        totalElements: quizData.pages?.reduce((sum, page) => sum + (page.elements?.length || 0), 0) || 0,
        requiredFields: quizData.pages?.reduce((sum, page) => 
          sum + (page.elements?.filter((el: any) => el.required)?.length || 0), 0) || 0
      },
      processingTime
    };

  } catch (error) {
    return {
      isValid: false,
      errors: ['Erro interno na validação'],
      warnings: [],
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * COMPRESSÃO DE DADOS
 */
function compressData(data: any): any {
  const startTime = Date.now();

  try {
    // Simular compressão removendo dados desnecessários
    const compressed = JSON.parse(JSON.stringify(data));

    // Remover campos de debug
    function removeDebugFields(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map(removeDebugFields);
      }
      
      if (obj && typeof obj === 'object') {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (!key.startsWith('_') && !key.startsWith('debug')) {
            cleaned[key] = removeDebugFields(value);
          }
        }
        return cleaned;
      }
      
      return obj;
    }

    const cleanedData = removeDebugFields(compressed);
    const originalSize = JSON.stringify(data).length;
    const compressedSize = JSON.stringify(cleanedData).length;
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

    return {
      data: cleanedData,
      originalSize,
      compressedSize,
      compressionRatio: `${compressionRatio}%`,
      processingTime: Date.now() - startTime
    };

  } catch (error) {
    return {
      error: 'Erro na compressão de dados',
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * ANÁLISE DE PERFORMANCE
 */
function analyzePerformance(responses: any[]): any {
  const startTime = Date.now();

  try {
    if (!responses || responses.length === 0) {
      return {
        totalResponses: 0,
        completionRate: 0,
        avgCompletionTime: 0,
        dropoffPages: [],
        processingTime: Date.now() - startTime
      };
    }

    const completed = responses.filter(r => r.metadata?.isComplete);
    const completionRate = (completed.length / responses.length * 100).toFixed(1);

    // Calcular tempo médio de conclusão
    const completionTimes = completed
      .filter(r => r.submittedAt && r.startedAt)
      .map(r => r.submittedAt - r.startedAt);

    const avgCompletionTime = completionTimes.length > 0 
      ? Math.round(completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length / 1000) 
      : 0;

    // Identificar páginas com maior abandono
    const pageDropoffs = new Map<number, number>();
    responses.forEach(response => {
      const lastPage = response.answers?.length || 0;
      pageDropoffs.set(lastPage, (pageDropoffs.get(lastPage) || 0) + 1);
    });

    const dropoffPages = Array.from(pageDropoffs.entries())
      .map(([page, count]) => ({ page, abandonments: count }))
      .sort((a, b) => b.abandonments - a.abandonments)
      .slice(0, 3);

    return {
      totalResponses: responses.length,
      completedResponses: completed.length,
      completionRate: `${completionRate}%`,
      avgCompletionTime: `${avgCompletionTime}s`,
      dropoffPages,
      processingTime: Date.now() - startTime
    };

  } catch (error) {
    return {
      error: 'Erro na análise de performance',
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * EXTRAÇÃO DE LEADS
 */
function extractLeads(responses: any[]): any {
  const startTime = Date.now();

  try {
    const leads: any[] = [];
    const fieldStats = new Map<string, number>();

    responses.forEach(response => {
      const lead: any = {
        id: response.id,
        submittedAt: response.submittedAt,
        isComplete: response.metadata?.isComplete || false,
        completionPercentage: response.metadata?.completionPercentage || 0
      };

      // Extrair campos de contato
      response.answers?.forEach((answer: any) => {
        const fieldId = answer.elementId || answer.fieldId;
        
        if (fieldId) {
          fieldStats.set(fieldId, (fieldStats.get(fieldId) || 0) + 1);
          
          // Identificar tipos de campo
          if (fieldId.includes('email')) {
            lead.email = answer.value;
          } else if (fieldId.includes('telefone') || fieldId.includes('phone')) {
            lead.phone = answer.value;
          } else if (fieldId.includes('nome') || fieldId.includes('name')) {
            lead.name = answer.value;
          } else {
            // Campo personalizado
            lead[fieldId] = answer.value;
          }
        }
      });

      leads.push(lead);
    });

    // Estatísticas dos campos mais coletados
    const topFields = Array.from(fieldStats.entries())
      .map(([field, count]) => ({ field, responses: count }))
      .sort((a, b) => b.responses - a.responses)
      .slice(0, 5);

    const leadsWithEmail = leads.filter(l => l.email).length;
    const leadsWithPhone = leads.filter(l => l.phone).length;

    return {
      totalLeads: leads.length,
      leadsWithEmail,
      leadsWithPhone,
      emailCaptureRate: `${(leadsWithEmail / leads.length * 100).toFixed(1)}%`,
      phoneCaptureRate: `${(leadsWithPhone / leads.length * 100).toFixed(1)}%`,
      topFields,
      leads: leads.slice(0, 100), // Retornar apenas os primeiros 100
      processingTime: Date.now() - startTime
    };

  } catch (error) {
    return {
      error: 'Erro na extração de leads',
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * PROCESSOR PRINCIPAL
 */
function processTask(task: ProcessingTask): ProcessingResult {
  const startTime = Date.now();
  
  try {
    // Verificar cache primeiro
    const cacheKey = `${task.type}-${JSON.stringify(task.data).substring(0, 100)}`;
    if (resultCache.has(cacheKey)) {
      return {
        id: task.id,
        success: true,
        result: resultCache.get(cacheKey),
        processingTime: Date.now() - startTime
      };
    }

    let result: any;

    switch (task.type) {
      case 'validate':
        result = validateQuiz(task.data);
        break;
      case 'compress':
        result = compressData(task.data);
        break;
      case 'analyze':
        result = analyzePerformance(task.data);
        break;
      case 'extract':
        result = extractLeads(task.data);
        break;
      default:
        throw new Error(`Tipo de task desconhecido: ${task.type}`);
    }

    // Salvar no cache se o resultado for pequeno
    if (JSON.stringify(result).length < 10000) {
      resultCache.set(cacheKey, result);
    }

    return {
      id: task.id,
      success: true,
      result,
      processingTime: Date.now() - startTime
    };

  } catch (error) {
    return {
      id: task.id,
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * MESSAGE HANDLER
 */
self.onmessage = function(event) {
  const task: ProcessingTask = event.data;
  
  if (!task || !task.id) {
    self.postMessage({
      success: false,
      error: 'Task inválida recebida'
    });
    return;
  }

  const result = processTask(task);
  self.postMessage(result);
};

// Cleanup do cache periodicamente
setInterval(() => {
  if (resultCache.size > 100) {
    resultCache.clear();
    console.log('🧹 Worker cache limpo');
  }
}, 300000); // 5 minutos

console.log('🚀 Quiz Processor Worker inicializado');