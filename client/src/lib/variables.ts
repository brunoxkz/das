// Sistema de variáveis para quiz - permite referenciar respostas de elementos em outros elementos

export interface QuizResponse {
  elementId: number;
  responseId: string;
  value: any;
  type: 'text' | 'number' | 'date' | 'choice' | 'email' | 'phone';
}

export interface CalculationRule {
  id: string;
  formula: string;
  resultVariable: string;
  dependencies: string[];
}

export class VariableProcessor {
  private responses: Map<string, QuizResponse> = new Map();
  private calculations: CalculationRule[] = [];

  // Registra uma resposta
  setResponse(responseId: string, value: any, type: QuizResponse['type'], elementId: number) {
    this.responses.set(responseId, {
      elementId,
      responseId,
      value,
      type
    });
    
    // Recalcula variáveis dependentes
    this.recalculateVariables();
  }

  // Obtém uma resposta
  getResponse(responseId: string): QuizResponse | undefined {
    return this.responses.get(responseId);
  }

  // Obtém todas as respostas
  getAllResponses(): QuizResponse[] {
    return Array.from(this.responses.values());
  }

  // Processa texto substituindo variáveis
  processText(text: string): string {
    if (!text) return text;

    // Substitui variáveis no formato {{variavel}}
    return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
      const trimmedName = variableName.trim();
      
      // Verifica se é uma variável calculada
      const calculatedValue = this.getCalculatedValue(trimmedName);
      if (calculatedValue !== undefined) {
        return String(calculatedValue);
      }
      
      // Verifica se é uma resposta direta
      const response = this.responses.get(trimmedName);
      if (response) {
        return this.formatValue(response.value, response.type);
      }
      
      // Retorna o placeholder se não encontrou
      return `{{${trimmedName}}}`;
    });
  }

  // Formata valores baseado no tipo
  private formatValue(value: any, type: QuizResponse['type']): string {
    switch (type) {
      case 'number':
        return typeof value === 'number' ? value.toString() : '0';
      case 'date':
        return value ? new Date(value).toLocaleDateString('pt-BR') : '';
      case 'choice':
        return Array.isArray(value) ? value.join(', ') : String(value || '');
      default:
        return String(value || '');
    }
  }

  // Adiciona regra de cálculo
  addCalculation(rule: CalculationRule) {
    this.calculations.push(rule);
    this.recalculateVariables();
  }

  // Recalcula todas as variáveis dependentes
  private recalculateVariables() {
    for (const calc of this.calculations) {
      try {
        const result = this.evaluateFormula(calc.formula);
        this.responses.set(calc.resultVariable, {
          elementId: -1, // Variável calculada
          responseId: calc.resultVariable,
          value: result,
          type: 'number'
        });
      } catch (error) {
        console.warn(`Erro ao calcular ${calc.id}:`, error);
      }
    }
  }

  // Avalia fórmulas matemáticas
  private evaluateFormula(formula: string): number {
    // Substitui variáveis na fórmula
    const processedFormula = formula.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
      const response = this.responses.get(variableName.trim());
      if (response && typeof response.value === 'number') {
        return response.value.toString();
      }
      return '0';
    });

    // Avalia a fórmula (implementação básica e segura)
    return this.safeEval(processedFormula);
  }

  // Avaliação segura de expressões matemáticas
  private safeEval(expression: string): number {
    // Remove espaços
    expression = expression.replace(/\s+/g, '');
    
    // Valida que contém apenas números, operadores e parênteses
    if (!/^[0-9+\-*/().,]+$/.test(expression)) {
      throw new Error('Fórmula inválida');
    }

    try {
      // Substitui vírgula por ponto para decimais
      expression = expression.replace(/,/g, '.');
      return Function('"use strict"; return (' + expression + ')')();
    } catch (error) {
      throw new Error('Erro na avaliação da fórmula');
    }
  }

  // Obtém valor calculado
  private getCalculatedValue(variableName: string): number | undefined {
    const response = this.responses.get(variableName);
    return response?.value;
  }

  // Cálculos pré-definidos úteis
  static createBMICalculation(heightVar: string, weightVar: string, resultVar: string = 'imc'): CalculationRule {
    return {
      id: 'bmi',
      formula: `{{${weightVar}}} / (({{${heightVar}}} / 100) * ({{${heightVar}}} / 100))`,
      resultVariable: resultVar,
      dependencies: [heightVar, weightVar]
    };
  }

  static createAgeCalculation(birthDateVar: string, resultVar: string = 'idade'): CalculationRule {
    return {
      id: 'age',
      formula: `(new Date().getTime() - new Date({{${birthDateVar}}}).getTime()) / (365.25 * 24 * 60 * 60 * 1000)`,
      resultVariable: resultVar,
      dependencies: [birthDateVar]
    };
  }

  static createWeightDifferenceCalculation(currentVar: string, targetVar: string, resultVar: string = 'diferenca_peso'): CalculationRule {
    return {
      id: 'weight_diff',
      formula: `{{${currentVar}}} - {{${targetVar}}}`,
      resultVariable: resultVar,
      dependencies: [currentVar, targetVar]
    };
  }

  // Obtém todas as variáveis disponíveis
  getAvailableVariables(): string[] {
    return Array.from(this.responses.keys());
  }

  // Limpa todas as respostas
  clear() {
    this.responses.clear();
  }
}

// Instância global do processador
export const globalVariableProcessor = new VariableProcessor();

// Funções auxiliares
export function setQuizResponse(responseId: string, value: any, type: QuizResponse['type'], elementId: number) {
  globalVariableProcessor.setResponse(responseId, value, type, elementId);
}

export function processVariables(text: string): string {
  return globalVariableProcessor.processText(text);
}

export function addCalculationRule(rule: CalculationRule) {
  globalVariableProcessor.addCalculation(rule);
}