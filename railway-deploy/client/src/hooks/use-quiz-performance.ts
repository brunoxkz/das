/**
 * HOOK DE PERFORMANCE ULTRA-RÁPIDA PARA QUIZ LOADING
 * 
 * Otimizado para carregamento instantâneo e zero travamentos
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useCallback, useMemo, useRef } from 'react';

interface QuizPerformanceOptions {
  enablePreloading?: boolean;
  cacheTime?: number;
  staleTime?: number;
  retryDelay?: number;
}

interface QuizSubmissionData {
  responses: any[];
  metadata?: any;
  leadData?: any;
  timeSpent?: number;
  totalPages?: number;
  completionPercentage?: number;
}

export function useQuizPerformance(quizId: string, options: QuizPerformanceOptions = {}) {
  const queryClient = useQueryClient();
  const submissionTimeRef = useRef<number>(Date.now());
  
  const {
    enablePreloading = true,
    cacheTime = 5 * 60 * 1000, // 5 minutos
    staleTime = 30 * 1000, // 30 segundos
    retryDelay = 1000
  } = options;

  // QUERY ULTRA-OTIMIZADA para carregamento do quiz
  const quizQuery = useQuery({
    queryKey: ['quiz-public', quizId],
    queryFn: async () => {
      const startTime = Date.now();
      console.log(`🚀 Loading quiz ${quizId}...`);
      
      try {
        const response = await fetch(`/api/quiz/${quizId}/public`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'max-age=300', // 5 minutos
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load quiz: ${response.status}`);
        }

        const data = await response.json();
        const loadTime = Date.now() - startTime;
        
        console.log(`✅ Quiz loaded in ${loadTime}ms (Cache: ${response.headers.get('X-Cache')})`);
        
        return data;
      } catch (error) {
        console.error('❌ Quiz loading error:', error);
        throw error;
      }
    },
    staleTime,
    gcTime: cacheTime,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(retryDelay * Math.pow(2, attemptIndex), 5000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    networkMode: 'online'
  });

  // MUTATION ULTRA-OTIMIZADA para submissão do quiz
  const submitMutation = useMutation({
    mutationFn: async (data: QuizSubmissionData) => {
      const startTime = Date.now();
      console.log(`🚀 Submitting quiz ${quizId}...`);
      
      try {
        const response = await fetch(`/api/quizzes/${quizId}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            timeSpent: Math.floor((Date.now() - submissionTimeRef.current) / 1000),
            submittedAt: new Date().toISOString()
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Submission failed: ${response.status}`);
        }

        const result = await response.json();
        const submitTime = Date.now() - startTime;
        
        console.log(`✅ Quiz submitted in ${submitTime}ms`);
        
        // Invalidar caches relacionados
        queryClient.invalidateQueries({ queryKey: ['quiz-analytics', quizId] });
        queryClient.invalidateQueries({ queryKey: ['quiz-responses', quizId] });
        
        return result;
      } catch (error) {
        console.error('❌ Quiz submission error:', error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: 2000,
  });

  // MUTATION para salvar progresso (respostas parciais)
  const saveProgressMutation = useMutation({
    mutationFn: async (data: Partial<QuizSubmissionData> & { currentPage: number }) => {
      const response = await fetch(`/api/quizzes/${quizId}/partial-responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          metadata: {
            ...data.metadata,
            isPartial: true,
            savedAt: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }

      return response.json();
    },
    retry: 1,
    onSuccess: () => {
      console.log('💾 Progress saved');
    }
  });

  // PRELOADING inteligente
  const preloadQuiz = useCallback(async (targetQuizId: string) => {
    if (!enablePreloading) return;
    
    await queryClient.prefetchQuery({
      queryKey: ['quiz-public', targetQuizId],
      queryFn: () => fetch(`/api/quiz/${targetQuizId}/public`).then(r => r.json()),
      staleTime: 60000, // 1 minuto
    });
  }, [queryClient, enablePreloading]);

  // RESET timer para nova submissão
  const resetSubmissionTimer = useCallback(() => {
    submissionTimeRef.current = Date.now();
  }, []);

  // VERIFICAÇÃO de performance em tempo real
  const performanceStats = useMemo(() => {
    const cached = queryClient.getQueryData(['quiz-public', quizId]);
    const isFromCache = !!cached;
    
    return {
      isLoaded: !!quizQuery.data,
      isLoading: quizQuery.isLoading,
      isFromCache,
      hasError: !!quizQuery.error,
      isSubmitting: submitMutation.isPending,
      isSavingProgress: saveProgressMutation.isPending,
      loadTime: isFromCache ? '<1ms (cached)' : 'Loading...',
      cacheStatus: isFromCache ? 'HIT' : 'MISS'
    };
  }, [quizQuery, submitMutation, saveProgressMutation, queryClient, quizId]);

  // RETRY otimizado
  const retryLoad = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['quiz-public', quizId] });
    quizQuery.refetch();
  }, [queryClient, quizId, quizQuery]);

  return {
    // Dados
    quiz: quizQuery.data,
    error: quizQuery.error,
    
    // Estados
    isLoading: quizQuery.isLoading,
    isSubmitting: submitMutation.isPending,
    isSavingProgress: saveProgressMutation.isPending,
    isError: quizQuery.isError,
    
    // Ações
    submitQuiz: submitMutation.mutateAsync,
    saveProgress: saveProgressMutation.mutateAsync,
    preloadQuiz,
    resetSubmissionTimer,
    retryLoad,
    
    // Performance
    performanceStats,
    
    // Resultados
    submissionResult: submitMutation.data,
    submissionError: submitMutation.error,
  };
}

// HOOK para múltiplos quizzes (preloading avançado)
export function useQuizBatch(quizIds: string[]) {
  const queryClient = useQueryClient();
  
  const preloadAll = useCallback(async () => {
    const promises = quizIds.map(id => 
      queryClient.prefetchQuery({
        queryKey: ['quiz-public', id],
        queryFn: () => fetch(`/api/quiz/${id}/public`).then(r => r.json()),
        staleTime: 60000,
      })
    );
    
    await Promise.all(promises);
    console.log(`✅ Preloaded ${quizIds.length} quizzes`);
  }, [queryClient, quizIds]);

  return { preloadAll };
}

// HOOK para analytics de performance
export function useQuizAnalytics(quizId: string) {
  return useQuery({
    queryKey: ['quiz-performance-analytics', quizId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/analytics/${quizId}/performance`);
      return response.json();
    },
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // Atualizar a cada minuto
  });
}