import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from './badge';
import { Button } from './button';
import { Sparkles, Copy, Check } from 'lucide-react';

interface VariableHelperProps {
  quizId: string;
  onInsertVariable?: (variable: string) => void;
  showTitle?: boolean;
  compact?: boolean;
}

export function VariableHelperUnified({ 
  quizId, 
  onInsertVariable, 
  showTitle = true,
  compact = false 
}: VariableHelperProps) {
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);

  const { data: variables, isLoading } = useQuery({
    queryKey: ['/api/quizzes', quizId, 'variables'],
    enabled: !!quizId,
  });

  const handleVariableClick = (variable: string) => {
    const variableText = `{${variable}}`;
    
    if (onInsertVariable) {
      onInsertVariable(variableText);
    } else {
      navigator.clipboard.writeText(variableText);
      setCopiedVariable(variable);
      setTimeout(() => setCopiedVariable(null), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className={`${compact ? 'p-2' : 'p-4'} bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-600`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-300 rounded w-16"></div>
            <div className="h-6 bg-gray-300 rounded w-20"></div>
            <div className="h-6 bg-gray-300 rounded w-14"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!variables || !variables.variables || variables.variables.length === 0) {
    return null;
  }

  return (
    <div className={`${compact ? 'p-2' : 'p-4'} bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-600`}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Variáveis de Personalização
          </h3>
        </div>
      )}
      
      <div>
        <p className={`text-xs text-gray-600 dark:text-gray-400 ${compact ? 'mb-2' : 'mb-3'}`}>
          {onInsertVariable ? 'Clique para inserir:' : 'Clique para copiar:'}
        </p>
        <div className="flex flex-wrap gap-2">
          {variables.variables.map((variable: string) => (
            <Badge 
              key={variable} 
              variant="outline" 
              className="text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              onClick={() => handleVariableClick(variable)}
            >
              <span className="font-mono">{`{${variable}}`}</span>
              {copiedVariable === variable && !onInsertVariable && (
                <Check className="w-3 h-3 ml-1 text-green-600" />
              )}
            </Badge>
          ))}
        </div>
        <p className={`text-xs text-gray-500 dark:text-gray-400 ${compact ? 'mt-1' : 'mt-2'}`}>
          {onInsertVariable ? 
            '💡 Clique na variável para inserir no texto' : 
            '💡 Clique na variável para copiar. Exemplo: {nome}, {email}, {telefone}'
          }
        </p>
      </div>
    </div>
  );
}

// Hook para usar em qualquer lugar
export function useQuizVariables(quizId: string) {
  const { data: variables, isLoading } = useQuery({
    queryKey: ['/api/quizzes', quizId, 'variables'],
    enabled: !!quizId,
  });

  return {
    variables: variables?.variables || [],
    isLoading,
    totalResponses: variables?.totalResponses || 0
  };
}