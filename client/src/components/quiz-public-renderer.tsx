import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, CheckCircle, Calendar, Star, Target, Scale, ArrowUpDown, Share2, Loader2 } from "lucide-react";
import { nanoid } from "nanoid";

interface Element {
  id: string;
  type: string;
  properties: any;
}

interface Page {
  id: number;
  title: string;
  elements: Element[];
  type?: string;
}

interface QuizPublicRendererProps {
  quiz: {
    id: string;
    title: string;
    description?: string;
    structure: {
      pages: Page[];
      settings: {
        theme: string;
        showProgressBar: boolean;
        collectEmail: boolean;
        collectName: boolean;
        collectPhone: boolean;
        resultTitle: string;
        resultDescription: string;
      };
    };
    design?: {
      brandingLogo: string;
      logoUpload: string;
      logoUrl: string;
      logoPosition: string;
      progressBarColor: string;
      progressBarStyle: string;
      progressBarHeight: string;
      showProgressBar: boolean;
      buttonColor: string;
      buttonStyle: string;
      buttonCorners: string;
      buttonSize: string;
      favicon: string;
      seoTitle: string;
      seoDescription: string;
      seoKeywords: string;
      globalBackgroundColor: string;
    };
  };
}

// Tipos para sistema de respostas
interface QuizResponse {
  elementId: string;
  elementType: string;
  elementFieldId?: string;
  answer: any;
  timestamp: Date;
  pageId: number;
  pageTitle: string;
}

interface SavedResponse {
  id: string;
  quizId: string;
  responses: QuizResponse[];
  submittedAt: Date;
}

export function QuizPublicRenderer({ quiz }: QuizPublicRendererProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [quizResponses, setQuizResponses] = useState<QuizResponse[]>([]);
  const [sessionId] = useState(() => nanoid());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [autoSaveEnabled] = useState(true);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  const pages = quiz.structure.pages || [];
  const currentPage = pages[currentPageIndex];
  const isLastPage = currentPageIndex === pages.length - 1;

  // Função para salvar resposta automática
  const saveResponseAutomatically = async (response: QuizResponse) => {
    if (!autoSaveEnabled) return;

    try {
      // Adicionar resposta ao array local
      setQuizResponses(prev => {
        const updated = [...prev.filter(r => r.elementId !== response.elementId), response];
        
        // Salvar no servidor automaticamente
        if (autoSaveRef.current) {
          clearTimeout(autoSaveRef.current);
        }
        
        autoSaveRef.current = setTimeout(async () => {
          try {
            await fetch(`/api/quizzes/${quiz.id}/partial-responses`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sessionId,
                responses: updated,
                isPartial: true
              })
            });
            console.log('Resposta salva automaticamente:', response);
          } catch (error) {
            console.error('Erro ao salvar resposta automática:', error);
          }
        }, 1000); // Salvar após 1 segundo de inatividade
        
        return updated;
      });

    } catch (error) {
      console.error('Erro ao processar resposta:', error);
    }
  };

  // Função para capturar resposta de qualquer elemento
  const handleElementAnswer = (elementId: string, elementType: string, answer: any, fieldId?: string) => {
    const response: QuizResponse = {
      elementId,
      elementType,
      elementFieldId: fieldId,
      answer,
      timestamp: new Date(),
      pageId: currentPage.id,
      pageTitle: currentPage.title
    };

    // Salvar localmente
    setAnswers(prev => ({
      ...prev,
      [elementId]: answer
    }));

    // Salvar automaticamente no servidor
    saveResponseAutomatically(response);
  };

  // Função para finalizar quiz
  const handleQuizSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Salvar resposta completa
      const finalResponse = await fetch(`/api/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          responses: quizResponses,
          isComplete: true
        })
      });

      if (finalResponse.ok) {
        console.log('Quiz completado com sucesso!');
        setShowResults(true);
      } else {
        console.error('Erro ao finalizar quiz');
      }
    } catch (error) {
      console.error('Erro ao enviar quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextPage = () => {
    if (isLastPage) {
      handleQuizSubmit();
    } else {
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  const calculateProgress = () => {
    if (pages.length === 0) return 0;
    return ((currentPageIndex + 1) / pages.length) * 100;
  };

  // Renderizar elementos com captura automática de resposta
  const renderElement = (element: Element) => {
    const { id, type, properties } = element;
    const answer = answers[id];

    switch (type) {
      case 'multiple_choice':
        return (
          <div key={id} className="space-y-4">
            <h3 className="text-lg font-semibold">{properties.question}</h3>
            <RadioGroup 
              value={answer} 
              onValueChange={(value) => handleElementAnswer(id, type, value, properties.fieldId)}
            >
              {properties.options?.map((option: any, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.text} id={`${id}-${index}`} />
                  <Label htmlFor={`${id}-${index}`}>{option.text}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'text':
        return (
          <div key={id} className="space-y-4">
            <h3 className="text-lg font-semibold">{properties.question}</h3>
            <Input
              type="text"
              placeholder={properties.placeholder}
              value={answer || ''}
              onChange={(e) => handleElementAnswer(id, type, e.target.value, properties.fieldId)}
              required={properties.required}
            />
          </div>
        );

      case 'email':
        return (
          <div key={id} className="space-y-4">
            <h3 className="text-lg font-semibold">{properties.question}</h3>
            <Input
              type="email"
              placeholder={properties.placeholder || 'Digite seu email'}
              value={answer || ''}
              onChange={(e) => handleElementAnswer(id, type, e.target.value, properties.fieldId || 'email')}
              required={properties.required}
            />
          </div>
        );

      case 'phone':
        return (
          <div key={id} className="space-y-4">
            {(properties.question || properties.label) && (
              <h3 className="text-lg font-semibold">{properties.question || properties.label || 'Telefone'}</h3>
            )}
            <Input
              type="tel"
              placeholder={properties.placeholder || 'Digite seu telefone'}
              value={answer || ''}
              onChange={(e) => handleElementAnswer(id, type, e.target.value, properties.fieldId || 'telefone_principal')}
              required={properties.required}
            />
          </div>
        );

      case 'number':
        return (
          <div key={id} className="space-y-4">
            {(properties.question || properties.label) && (
              <h3 className="text-lg font-semibold">{properties.question || properties.label || 'Número'}</h3>
            )}
            <Input
              type="number"
              placeholder={properties.placeholder}
              value={answer || ''}
              onChange={(e) => handleElementAnswer(id, type, Number(e.target.value), properties.fieldId)}
              required={properties.required}
              min={properties.min}
              max={properties.max}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={id} className="space-y-4">
            {(properties.question || properties.label) && (
              <h3 className="text-lg font-semibold">{properties.question || properties.label || 'Texto'}</h3>
            )}
            <Textarea
              placeholder={properties.placeholder}
              value={answer || ''}
              onChange={(e) => handleElementAnswer(id, type, e.target.value, properties.fieldId)}
              required={properties.required}
              rows={properties.rows || 4}
            />
          </div>
        );

      case 'checkbox':
        return (
          <div key={id} className="space-y-4">
            {(properties.question || properties.label) && (
              <h3 className="text-lg font-semibold">{properties.question || properties.label || 'Opções'}</h3>
            )}
            <div className="space-y-2">
              {properties.options?.map((option: any, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${id}-${index}`}
                    checked={answer?.includes(option.text)}
                    onCheckedChange={(checked) => {
                      const currentAnswers = answer || [];
                      const newAnswers = checked
                        ? [...currentAnswers, option.text]
                        : currentAnswers.filter((a: string) => a !== option.text);
                      handleElementAnswer(id, type, newAnswers, properties.fieldId);
                    }}
                  />
                  <Label htmlFor={`${id}-${index}`}>{option.text}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'date':
        return (
          <div key={id} className="space-y-4">
            {(properties.question || properties.label) && (
              <h3 className="text-lg font-semibold">{properties.question || properties.label || 'Data'}</h3>
            )}
            <Input
              type="date"
              value={answer || ''}
              onChange={(e) => handleElementAnswer(id, type, e.target.value, properties.fieldId)}
              required={properties.required}
            />
          </div>
        );

      case 'birth_date':
        return (
          <div key={id} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold">{properties.question || 'Data de Nascimento'}</h3>
            </div>
            <Input
              type="date"
              value={answer || ''}
              onChange={(e) => handleElementAnswer(id, type, e.target.value, properties.fieldId || 'data_nascimento')}
              required={properties.required}
            />
          </div>
        );

      case 'height':
        return (
          <div key={id} className="space-y-4">
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold">{properties.question || 'Altura'}</h3>
            </div>
            <Input
              type="number"
              placeholder={properties.placeholder || '170'}
              value={answer || ''}
              onChange={(e) => handleElementAnswer(id, type, Number(e.target.value), properties.fieldId || 'altura')}
              required={properties.required}
              min={properties.min || 100}
              max={properties.max || 250}
            />
          </div>
        );

      case 'current_weight':
        return (
          <div key={id} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Scale className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold">{properties.question || 'Peso Atual'}</h3>
            </div>
            <Input
              type="number"
              placeholder={properties.placeholder || '70'}
              value={answer || ''}
              onChange={(e) => handleElementAnswer(id, type, Number(e.target.value), properties.fieldId || 'peso_atual')}
              required={properties.required}
              min={properties.min || 30}
              max={properties.max || 300}
            />
          </div>
        );

      case 'target_weight':
        return (
          <div key={id} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold">{properties.question || 'Peso Meta'}</h3>
            </div>
            <Input
              type="number"
              placeholder={properties.placeholder || '65'}
              value={answer || ''}
              onChange={(e) => handleElementAnswer(id, type, Number(e.target.value), properties.fieldId || 'peso_meta')}
              required={properties.required}
              min={properties.min || 30}
              max={properties.max || 300}
            />
          </div>
        );

      case 'rating':
        return (
          <div key={id} className="space-y-4">
            {(properties.question || properties.label) && (
              <h3 className="text-lg font-semibold">{properties.question || properties.label || 'Avaliação'}</h3>
            )}
            <div className="flex space-x-2">
              {Array.from({ length: properties.maxRating || 5 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleElementAnswer(id, type, i + 1, properties.fieldId)}
                  className={`p-2 ${answer === i + 1 ? 'text-yellow-500' : 'text-gray-300'}`}
                >
                  <Star className="w-6 h-6" fill={answer === i + 1 ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>
        );

      case 'heading':
        return (
          <div key={id} className="space-y-2">
            <h2 className="text-2xl font-bold">{properties.text}</h2>
          </div>
        );

      case 'paragraph':
        return (
          <div key={id} className="space-y-2">
            <p className="text-gray-700">{properties.text}</p>
          </div>
        );

      case 'image':
        return (
          <div key={id} className="space-y-2">
            {properties.src && (
              <img 
                src={properties.src} 
                alt={properties.alt || 'Imagem'} 
                className="max-w-full h-auto rounded-md"
              />
            )}
          </div>
        );

      case 'video':
        return (
          <div key={id} className="space-y-2">
            {properties.src && (
              <div className="aspect-video">
                <iframe
                  src={properties.src}
                  className="w-full h-full rounded-md"
                  allowFullScreen
                  title={properties.title || 'Vídeo'}
                />
              </div>
            )}
          </div>
        );

      case 'share_quiz':
        return (
          <div key={id} className="space-y-4">
            <h3 className="text-lg font-semibold">{properties.message || 'Compartilhe este quiz'}</h3>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(properties.message || 'Confira este quiz!')} ${encodeURIComponent(window.location.href)}`;
                  window.open(url, '_blank');
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
                  window.open(url, '_blank');
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(properties.message || 'Confira este quiz!')}&url=${encodeURIComponent(window.location.href)}`;
                  window.open(url, '_blank');
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Twitter
              </Button>
            </div>
          </div>
        );

      case 'continue_button':
        return (
          <div key={id} className="flex justify-center">
            <Button
              onClick={handleNextPage}
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  {properties.text || (isLastPage ? 'Finalizar' : 'Continuar')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        );

      default:
        return (
          <div key={id} className="p-4 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-600">
              Elemento não suportado: {type}
            </p>
          </div>
        );
    }
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">
              {quiz.structure.settings.resultTitle || 'Obrigado!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {quiz.structure.settings.resultDescription || 'Suas respostas foram enviadas com sucesso!'}
            </p>
            <div className="text-sm text-gray-500">
              Total de respostas capturadas: {quizResponses.length}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Nenhuma página encontrada</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4"
      style={{ 
        backgroundColor: quiz.design?.globalBackgroundColor || '#f9fafb' 
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Barra de Progresso */}
        {quiz.structure.settings.showProgressBar && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Página {currentPageIndex + 1} de {pages.length}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(calculateProgress())}%
              </span>
            </div>
            <Progress 
              value={calculateProgress()} 
              className="h-2"
              style={{ 
                backgroundColor: quiz.design?.progressBarColor || '#10b981' 
              }}
            />
          </div>
        )}

        {/* Conteúdo da Página */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{currentPage.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentPage.elements.map(renderElement)}
          </CardContent>
        </Card>

        {/* Navegação */}
        <div className="flex justify-between items-center mt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevPage}
            disabled={currentPageIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="text-sm text-gray-500">
            Respostas salvas: {quizResponses.length}
          </div>

          <Button 
            onClick={handleNextPage}
            disabled={isSubmitting}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                {isLastPage ? 'Finalizar' : 'Próxima'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}