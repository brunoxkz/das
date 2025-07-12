/**
 * LISTA DE QUIZZES OTIMIZADA PARA MEMÓRIA
 * Substitui a lista existente mantendo todas as funcionalidades
 */

import React, { useMemo } from 'react';
import { VirtualScrollList } from './VirtualScrollList';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Users, Edit, Trash2, ExternalLink } from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  description?: string;
  isPublished: boolean;
  views?: number;
  responses?: number;
  createdAt?: string;
}

interface OptimizedQuizListProps {
  quizzes: Quiz[];
  onEdit: (quiz: Quiz) => void;
  onDelete: (quiz: Quiz) => void;
  onView: (quiz: Quiz) => void;
  isLoading?: boolean;
  containerHeight?: number;
}

export function MemoryOptimizedQuizList({
  quizzes,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
  containerHeight = 600
}: OptimizedQuizListProps) {
  
  // Altura fixa para cada item do quiz
  const ITEM_HEIGHT = 200;

  // Renderizar um item individual do quiz
  const renderQuizItem = (quiz: Quiz, index: number) => (
    <Card className="mb-4 hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
              {quiz.title}
            </CardTitle>
            {quiz.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                {quiz.description}
              </p>
            )}
          </div>
          <Badge
            variant={quiz.isPublished ? "default" : "secondary"}
            className={quiz.isPublished ? "bg-green-100 text-green-800" : ""}
          >
            {quiz.isPublished ? "Publicado" : "Rascunho"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Estatísticas */}
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <Eye size={16} />
            <span>{quiz.views || 0} views</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <Users size={16} />
            <span>{quiz.responses || 0} respostas</span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(quiz)}
            className="flex items-center gap-1"
          >
            <Edit size={16} />
            Editar
          </Button>
          
          {quiz.isPublished && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(quiz)}
              className="flex items-center gap-1"
            >
              <ExternalLink size={16} />
              Ver Quiz
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(quiz)}
            className="flex items-center gap-1 text-red-600 hover:text-red-700"
          >
            <Trash2 size={16} />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Otimização para casos com poucos quizzes
  if (quizzes.length <= 10) {
    return (
      <div className="space-y-4">
        {isLoading ? (
          // Skeleton loading
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : quizzes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum quiz encontrado. Crie seu primeiro quiz!
              </p>
            </CardContent>
          </Card>
        ) : (
          quizzes.map((quiz, index) => (
            <div key={quiz.id}>
              {renderQuizItem(quiz, index)}
            </div>
          ))
        )}
      </div>
    );
  }

  // Para listas grandes, usar Virtual Scrolling
  return (
    <div className="virtual-quiz-container">
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum quiz encontrado. Crie seu primeiro quiz!
            </p>
          </CardContent>
        </Card>
      ) : (
        <VirtualScrollList
          items={quizzes}
          itemHeight={ITEM_HEIGHT}
          containerHeight={containerHeight}
          renderItem={renderQuizItem}
          overscan={3}
          className="virtual-quiz-list"
        />
      )}
    </div>
  );
}

/**
 * HOOK PARA OTIMIZAÇÃO DE PERFORMANCE DA LISTA
 */
export function useOptimizedQuizList(quizzes: Quiz[]) {
  // Memoização dos quizzes processados
  const processedQuizzes = useMemo(() => {
    return quizzes.map(quiz => ({
      ...quiz,
      // Garantir que campos numéricos existam
      views: quiz.views || 0,
      responses: quiz.responses || 0
    }));
  }, [quizzes]);

  // Estatísticas computadas
  const stats = useMemo(() => ({
    total: processedQuizzes.length,
    published: processedQuizzes.filter(q => q.isPublished).length,
    drafts: processedQuizzes.filter(q => !q.isPublished).length,
    totalViews: processedQuizzes.reduce((sum, q) => sum + (q.views || 0), 0),
    totalResponses: processedQuizzes.reduce((sum, q) => sum + (q.responses || 0), 0)
  }), [processedQuizzes]);

  return {
    quizzes: processedQuizzes,
    stats
  };
}