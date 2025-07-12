/**
 * HOOK PARA USAR WEB WORKER DE QUIZ PROCESSING
 * Executa tarefas pesadas em background sem bloquear UI
 */

import { useRef, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';

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

type TaskCallback = (result: ProcessingResult) => void;

export function useQuizWorker() {
  const workerRef = useRef<Worker | null>(null);
  const pendingTasks = useRef<Map<string, TaskCallback>>(new Map());

  // Inicializar worker
  useEffect(() => {
    if (typeof Worker !== 'undefined') {
      try {
        workerRef.current = new Worker(
          new URL('../workers/quiz-processor.worker.ts', import.meta.url),
          { type: 'module' }
        );

        workerRef.current.onmessage = (event) => {
          const result: ProcessingResult = event.data;
          const callback = pendingTasks.current.get(result.id);
          
          if (callback) {
            callback(result);
            pendingTasks.current.delete(result.id);
          }
        };

        workerRef.current.onerror = (error) => {
          console.error('❌ Quiz Worker erro:', error);
        };

        console.log('🚀 Quiz Worker inicializado');
      } catch (error) {
        console.warn('⚠️ Web Workers não suportados:', error);
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        pendingTasks.current.clear();
      }
    };
  }, []);

  // Executar task no worker
  const runTask = useCallback(async (
    type: ProcessingTask['type'],
    data: any
  ): Promise<ProcessingResult> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        // Fallback para execução síncrona se worker não disponível
        resolve({
          id: nanoid(),
          success: false,
          error: 'Web Worker não disponível',
          processingTime: 0
        });
        return;
      }

      const taskId = nanoid();
      const task: ProcessingTask = {
        id: taskId,
        type,
        data,
        timestamp: Date.now()
      };

      // Registrar callback
      pendingTasks.current.set(taskId, (result) => {
        if (result.success) {
          resolve(result);
        } else {
          reject(new Error(result.error || 'Erro desconhecido no worker'));
        }
      });

      // Timeout para evitar travamento
      setTimeout(() => {
        if (pendingTasks.current.has(taskId)) {
          pendingTasks.current.delete(taskId);
          reject(new Error('Timeout na execução do worker'));
        }
      }, 30000); // 30 segundos

      // Enviar task para worker
      workerRef.current.postMessage(task);
    });
  }, []);

  // Funções específicas
  const validateQuiz = useCallback(async (quizData: any) => {
    try {
      const result = await runTask('validate', quizData);
      return result.result;
    } catch (error) {
      console.error('Erro na validação:', error);
      return { isValid: false, errors: ['Erro na validação'], warnings: [] };
    }
  }, [runTask]);

  const compressData = useCallback(async (data: any) => {
    try {
      const result = await runTask('compress', data);
      return result.result;
    } catch (error) {
      console.error('Erro na compressão:', error);
      return { error: 'Falha na compressão' };
    }
  }, [runTask]);

  const analyzePerformance = useCallback(async (responses: any[]) => {
    try {
      const result = await runTask('analyze', responses);
      return result.result;
    } catch (error) {
      console.error('Erro na análise:', error);
      return { error: 'Falha na análise de performance' };
    }
  }, [runTask]);

  const extractLeads = useCallback(async (responses: any[]) => {
    try {
      const result = await runTask('extract', responses);
      return result.result;
    } catch (error) {
      console.error('Erro na extração:', error);
      return { error: 'Falha na extração de leads' };
    }
  }, [runTask]);

  return {
    validateQuiz,
    compressData,
    analyzePerformance,
    extractLeads,
    isWorkerAvailable: !!workerRef.current
  };
}