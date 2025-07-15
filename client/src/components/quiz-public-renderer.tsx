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
import { backRedirectManager } from "@/utils/backRedirectManager";

// Função para ajustar brilho da cor
function adjustColorBrightness(color: string, amount: number): string {
  const usePound = color[0] === '#';
  const col = usePound ? color.slice(1) : color;
  
  const num = parseInt(col, 16);
  let r = (num >> 16) + amount;
  let g = (num >> 8 & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;
  
  r = r > 255 ? 255 : r < 0 ? 0 : r;
  g = g > 255 ? 255 : g < 0 ? 0 : g;
  b = b > 255 ? 255 : b < 0 ? 0 : b;
  
  return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

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
      logoSize: string;
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
    backRedirectEnabled?: boolean;
    backRedirectUrl?: string;
    backRedirectDelay?: number;
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

  // Configurar BackRedirect quando o quiz carrega
  useEffect(() => {
    if (quiz.backRedirectEnabled && quiz.backRedirectUrl) {
      backRedirectManager.configure({
        enabled: true,
        url: quiz.backRedirectUrl,
        delay: quiz.backRedirectDelay || 0
      });
    }
  }, [quiz.backRedirectEnabled, quiz.backRedirectUrl, quiz.backRedirectDelay]);
  
  // Tema escuro - CORRIGIDO para usar a estrutura correta
  const isDarkMode = quiz.design?.darkMode || false;
  const customBackgroundColor = quiz.design?.globalBackgroundColor || null;
  const backgroundColor = customBackgroundColor || (isDarkMode ? '#1f2937' : '#f9fafb');
  const textColor = isDarkMode ? '#f9fafb' : '#1f2937';
  const cardBgColor = isDarkMode ? '#374151' : '#ffffff';
  const borderColor = isDarkMode ? '#4b5563' : '#e5e7eb';
  const inputBgColor = isDarkMode ? '#1f2937' : '#ffffff';
  const inputTextColor = isDarkMode ? '#f9fafb' : '#1f2937';

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
            // Filtrar apenas campos completos/válidos para salvar
            const validResponses = updated.filter(r => {
              // Para telefones, só salvar se tiver pelo menos 10 dígitos
              if (r.elementType === 'phone' && r.answer) {
                const phoneNumber = r.answer.replace(/\D/g, '');
                return phoneNumber.length >= 10;
              }
              // Para emails, só salvar se for válido
              if (r.elementType === 'email' && r.answer) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.answer);
              }
              // Para outros campos, só salvar se não estiver vazio
              return r.answer && r.answer.toString().trim().length > 0;
            });

            if (validResponses.length > 0) {
              await fetch(`/api/quizzes/${quiz.id}/partial-responses`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  sessionId,
                  responses: validResponses,
                  isPartial: true
                })
              });
              console.log('Resposta válida salva automaticamente:', validResponses.length, 'campos');
            }
          } catch (error) {
            console.error('Erro ao salvar resposta automática:', error);
          }
        }, 2000); // Salvar após 2 segundos de inatividade
        
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
    const { id, type, properties = {} } = element;
    const answer = answers[id];

    // Verificação de segurança para properties
    if (!properties || typeof properties !== 'object') {
      console.warn(`Elemento ${id} do tipo ${type} não possui properties válidas`);
      return <div key={id} className="text-red-500">Erro: Propriedades do elemento não encontradas</div>;
    }

    switch (type) {
      case 'multiple_choice':
        const multipleChoiceOptions = element.options || properties?.options || [];
        return (
          <div key={id} className="space-y-4">
            <h3 className="text-lg font-semibold">{element.content || properties?.question || properties?.content || 'Pergunta'}</h3>
            <RadioGroup 
              value={answer} 
              onValueChange={(value) => handleElementAnswer(id, type, value, element.fieldId || properties?.fieldId)}
              className="space-y-2"
            >
              {Array.isArray(multipleChoiceOptions) && multipleChoiceOptions.length > 0 ? (
                multipleChoiceOptions.map((option: any, index: number) => {
                  // Suporte para opções em string simples ou objeto {text: "..."}
                  const optionValue = typeof option === 'string' ? option : (option?.text || `Opção ${index + 1}`);
                  return (
                    <div key={index} className="flex items-center space-x-2 p-3 border border-gray-200 hover:border-blue-500 rounded-lg cursor-pointer transition-all">
                      <RadioGroupItem value={optionValue} id={`${id}-${index}`} />
                      <Label htmlFor={`${id}-${index}`} className="flex-1 cursor-pointer">{optionValue}</Label>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-500 p-4 border rounded-md">
                  Nenhuma opção configurada
                </div>
              )}
            </RadioGroup>
          </div>
        );

      case 'text':
        return (
          <div key={id} className="space-y-4">
            <h3 className="text-lg font-semibold">{properties?.question || 'Texto'}</h3>
            <Input
              type="text"
              placeholder={properties?.placeholder || 'Digite aqui'}
              value={answer || ''}
              onChange={(e) => handleElementAnswer(id, type, e.target.value, properties?.fieldId)}
              required={properties?.required}
            />
          </div>
        );

      case 'email':
        return (
          <div key={id} className="space-y-4">
            <h3 className="text-lg font-semibold">{properties?.question || 'E-mail'}</h3>
            <Input
              type="email"
              placeholder={properties?.placeholder || 'Digite seu email'}
              value={answer || ''}
              onChange={(e) => handleElementAnswer(id, type, e.target.value, properties?.fieldId || 'email')}
              required={properties?.required}
            />
          </div>
        );

      case 'phone':
        return (
          <div key={id} className="space-y-4">
            {(properties?.question || properties?.label) && (
              <h3 className="text-lg font-semibold">{properties?.question || properties?.label || 'Telefone'}</h3>
            )}
            <Input
              type="tel"
              placeholder={properties?.placeholder || 'Digite seu telefone'}
              value={answer || ''}
              onChange={(e) => handleElementAnswer(id, type, e.target.value, properties?.fieldId || 'telefone_principal')}
              required={properties?.required}
            />
          </div>
        );

      case 'number':
        return (
          <div key={id} className="space-y-4">
            {(properties?.question || properties?.label) && (
              <h3 className="text-lg font-semibold">{properties?.question || properties?.label || 'Número'}</h3>
            )}
            <Input
              type="number"
              placeholder={properties?.placeholder || 'Digite um número'}
              value={answer || ''}
              onChange={(e) => handleElementAnswer(id, type, Number(e.target.value), properties?.fieldId)}
              required={properties?.required}
              min={properties?.min}
              max={properties?.max}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={id} className="space-y-4">
            {(properties?.question || properties?.label) && (
              <h3 className="text-lg font-semibold">{properties?.question || properties?.label || 'Texto'}</h3>
            )}
            <Textarea
              placeholder={properties?.placeholder || 'Digite seu texto aqui...'}
              value={answer || ''}
              onChange={(e) => handleElementAnswer(id, type, e.target.value, properties?.fieldId)}
              required={properties?.required}
              rows={properties?.rows || 4}
            />
          </div>
        );

      case 'checkbox':
        const checkboxOptions = element.options || properties?.options || [];
        return (
          <div key={id} className="space-y-4">
            {(element.content || properties?.question || properties?.label) && (
              <h3 className="text-lg font-semibold">{element.content || properties?.question || properties?.label || 'Opções'}</h3>
            )}
            <div className="space-y-2">
              {Array.isArray(checkboxOptions) && checkboxOptions.length > 0 ? (
                checkboxOptions.map((option: any, index: number) => {
                  // Suporte para opções em string simples ou objeto {text: "..."}
                  const optionValue = typeof option === 'string' ? option : (option?.text || `Opção ${index + 1}`);
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${id}-${index}`}
                        checked={Array.isArray(answer) && answer.includes(optionValue)}
                        onCheckedChange={(checked) => {
                          const currentAnswers = Array.isArray(answer) ? answer : [];
                          const newAnswers = checked
                            ? [...currentAnswers, optionValue]
                            : currentAnswers.filter((a: string) => a !== optionValue);
                          handleElementAnswer(id, type, newAnswers, element.fieldId || properties?.fieldId);
                        }}
                      />
                      <Label htmlFor={`${id}-${index}`}>{optionValue}</Label>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-500 p-4 border rounded-md">
                  Nenhuma opção configurada
                </div>
              )}
            </div>
          </div>
        );

      case 'date':
        return (
          <div key={id} className="space-y-4">
            {(properties?.question || properties?.label) && (
              <h3 className="text-lg font-semibold">{properties?.question || properties?.label || 'Data'}</h3>
            )}
            <Input
              type="date"
              value={answer || ''}
              onChange={(e) => handleElementAnswer(id, type, e.target.value, properties?.fieldId)}
              required={properties?.required}
            />
          </div>
        );

      case 'birth_date':
        return (
          <div key={id} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold">{properties?.question || 'Data de Nascimento'}</h3>
            </div>
            <Input
              type="date"
              value={answer || ''}
              onChange={(e) => handleElementAnswer(id, type, e.target.value, properties?.fieldId || 'data_nascimento')}
              required={properties?.required}
            />
          </div>
        );

      case 'height':
        return (
          <div key={id} className="space-y-4">
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold">{properties?.question || 'Altura'}</h3>
            </div>
            <Input
              type="number"
              placeholder={properties?.placeholder || '170'}
              value={answer || ''}
              onChange={(e) => handleElementAnswer(id, type, Number(e.target.value), properties?.fieldId || 'altura')}
              required={properties?.required}
              min={properties?.min || 100}
              max={properties?.max || 250}
            />
          </div>
        );

      case 'current_weight':
        return (
          <div key={id} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Scale className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold">{properties?.question || 'Peso Atual'}</h3>
            </div>
            <Input
              type="number"
              placeholder={properties?.placeholder || '70'}
              value={answer || ''}
              onChange={(e) => handleElementAnswer(id, type, Number(e.target.value), properties?.fieldId || 'peso_atual')}
              required={properties?.required}
              min={properties?.min || 30}
              max={properties?.max || 300}
            />
          </div>
        );

      case 'target_weight':
        return (
          <div key={id} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold">{properties?.question || 'Peso Meta'}</h3>
            </div>
            <Input
              type="number"
              placeholder={properties?.placeholder || '65'}
              value={answer || ''}
              onChange={(e) => handleElementAnswer(id, type, Number(e.target.value), properties?.fieldId || 'peso_meta')}
              required={properties?.required}
              min={properties?.min || 30}
              max={properties?.max || 300}
            />
          </div>
        );

      case 'rating':
        return (
          <div key={id} className="space-y-4">
            {(properties?.question || properties?.label) && (
              <h3 className="text-lg font-semibold">{properties?.question || properties?.label || 'Avaliação'}</h3>
            )}
            <div className="flex space-x-2">
              {Array.from({ length: properties?.maxRating || 5 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleElementAnswer(id, type, i + 1, properties?.fieldId)}
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
            <h2 className="text-2xl font-bold">{properties.text || 'Título'}</h2>
          </div>
        );

      case 'paragraph':
        return (
          <div key={id} className="space-y-2">
            <p className="text-gray-700">{properties.text || 'Parágrafo'}</p>
          </div>
        );

      case 'image':
        return (
          <div key={id} className="space-y-2">
            <img 
              src={properties.src || '/placeholder-image.jpg'} 
              alt={properties.alt || 'Imagem'} 
              className="max-w-full h-auto rounded-md"
            />
          </div>
        );

      case 'video':
        return (
          <div key={id} className="space-y-2">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              {properties.src ? (
                <iframe
                  src={properties.src}
                  className="w-full h-full rounded-md"
                  allowFullScreen
                  title={properties.title || 'Vídeo'}
                />
              ) : (
                <div className="text-center">
                  <PlayCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Vídeo não configurado</p>
                </div>
              )}
            </div>
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
        const buttonBgColor = properties.buttonBackgroundColor || quiz.design?.buttonColor || "#10b981";
        const buttonTextColor = properties.buttonTextColor || "#ffffff";
        const buttonHoverColor = properties.buttonHoverColor || (properties.buttonBackgroundColor ? adjustColorBrightness(properties.buttonBackgroundColor, -20) : quiz.design?.buttonColor ? adjustColorBrightness(quiz.design.buttonColor, -20) : "#059669");
        const buttonSize = properties.buttonSize || quiz.design?.buttonSize || "medium";
        const buttonStyle = properties.buttonBorderRadius || quiz.design?.buttonStyle || "rounded";
        const isFixedFooter = properties.isFixedFooter || false;
        
        const sizeClasses = {
          small: "px-4 py-2 text-sm",
          medium: "px-6 py-3 text-base", 
          large: "px-8 py-4 text-lg"
        };
        
        const styleClasses = {
          square: "rounded-none",
          rounded: "rounded-md",
          pill: "rounded-full"
        };
        
        return (
          <div key={id} className={`flex justify-center ${isFixedFooter ? 'fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-t shadow-lg py-4' : ''}`}>
            <Button
              onClick={handleNextPage}
              disabled={isSubmitting}
              className={`${sizeClasses[buttonSize]} ${styleClasses[buttonStyle]} font-medium shadow-lg transition-all duration-200 hover:shadow-xl`}
              style={{
                backgroundColor: buttonBgColor,
                color: buttonTextColor,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = buttonHoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = buttonBgColor;
              }}
            >
              {properties.buttonText || "Continuar"}
            </Button>
          </div>
        );

      case 'animated_transition':
        const gradientStart = properties.gradientStart || "#10B981";
        const gradientEnd = properties.gradientEnd || "#8B5CF6";
        const animationType = properties.animationType || "pulse";
        const animationSpeed = properties.animationSpeed || "normal";
        
        const animationClass = animationType === "pulse" ? "animate-pulse" :
                              animationType === "glow" ? "animate-ping" :
                              animationType === "wave" ? "animate-bounce" :
                              animationType === "bounce" ? "animate-bounce" : "animate-pulse";
        
        const speedClass = animationSpeed === "slow" ? "duration-2000" :
                          animationSpeed === "fast" ? "duration-500" : "duration-1000";
        
        return (
          <div key={id} className="mb-6 text-center">
            <div className="relative">
              <div 
                className={`bg-gradient-to-r rounded-lg p-6 ${animationClass} ${speedClass}`}
                style={{ 
                  backgroundImage: `linear-gradient(to right, ${gradientStart}, #3B82F6, ${gradientEnd})`
                }}
              >
                <div className="text-white">
                  <div className="text-xl font-bold mb-2">
                    {properties.content || "Processando..."}
                  </div>
                  {properties.description && (
                    <p className="text-sm opacity-90">{properties.description}</p>
                  )}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-pulse rounded-lg"></div>
            </div>
          </div>
        );

      case 'chart':
        return (
          <div key={id} className="mb-6">
            <Card className="p-6">
              <CardHeader>
                <CardTitle style={{ color: properties.chartTitleColor || '#1F2937' }}>
                  {properties.chartTitle || 'Gráfico de Resultados'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                  {properties.chartType === 'bar' && (
                    <div className="flex items-end space-x-3 h-32">
                      <div className="w-8 bg-blue-500 rounded-t" style={{ height: '60%' }}></div>
                      <div className="w-8 bg-green-500 rounded-t" style={{ height: '80%' }}></div>
                      <div className="w-8 bg-purple-500 rounded-t" style={{ height: '40%' }}></div>
                      <div className="w-8 bg-orange-500 rounded-t" style={{ height: '95%' }}></div>
                    </div>
                  )}
                  {properties.chartType === 'line' && (
                    <div className="relative w-48 h-32">
                      <svg className="w-full h-full" viewBox="0 0 200 120">
                        <polyline
                          points="20,80 60,40 100,60 140,20 180,30"
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="3"
                        />
                        <circle cx="20" cy="80" r="4" fill="#3B82F6" />
                        <circle cx="60" cy="40" r="4" fill="#3B82F6" />
                        <circle cx="100" cy="60" r="4" fill="#3B82F6" />
                        <circle cx="140" cy="20" r="4" fill="#3B82F6" />
                        <circle cx="180" cy="30" r="4" fill="#3B82F6" />
                      </svg>
                    </div>
                  )}
                  {properties.chartType === 'pie' && (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full"></div>
                    </div>
                  )}
                  {properties.chartType === 'before_after' && (
                    <div className="flex items-end space-x-8">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-red-400 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                          {properties.beforeAfterData?.before?.value || 25}
                        </div>
                        <span className="text-sm text-gray-600">Antes</span>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                          {properties.beforeAfterData?.after?.value || 85}
                        </div>
                        <span className="text-sm text-gray-600">Depois</span>
                      </div>
                    </div>
                  )}
                </div>
                {properties.chartShowLegend && (
                  <div className="mt-4 flex justify-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-sm text-gray-600">Dados 1</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-sm text-gray-600">Dados 2</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'metrics':
        return (
          <div key={id} className="mb-6">
            <Card className="p-6">
              <CardHeader>
                <CardTitle>
                  {properties.metricsTitle || 'Métricas de Performance'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {properties.metric1Name && (
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {properties.metricsShowValue ? properties.metric1Value || 0 : '—'}
                        {properties.metricsShowPercentage && '%'}
                      </div>
                      <div className="text-sm text-gray-600">{properties.metric1Name}</div>
                      <Progress 
                        value={((properties.metric1Value || 0) / (properties.metric1Max || 100)) * 100} 
                        className="mt-2"
                      />
                    </div>
                  )}
                  {properties.metric2Name && (
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {properties.metricsShowValue ? properties.metric2Value || 0 : '—'}
                        {properties.metricsShowPercentage && '%'}
                      </div>
                      <div className="text-sm text-gray-600">{properties.metric2Name}</div>
                      <Progress 
                        value={((properties.metric2Value || 0) / (properties.metric2Max || 100)) * 100} 
                        className="mt-2"
                      />
                    </div>
                  )}
                  {properties.metric3Name && (
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {properties.metricsShowValue ? properties.metric3Value || 0 : '—'}
                        {properties.metricsShowPercentage && '%'}
                      </div>
                      <div className="text-sm text-gray-600">{properties.metric3Name}</div>
                      <Progress 
                        value={((properties.metric3Value || 0) / (properties.metric3Max || 100)) * 100} 
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>
                {properties.weeklyData && (
                  <div className="mt-6">
                    <div className="text-sm text-gray-600 mb-3">
                      {properties.timePeriod || 'Últimos 7 dias'}
                    </div>
                    <div className="flex items-end space-x-2 h-16">
                      {properties.weeklyData.map((value: number, index: number) => (
                        <div
                          key={index}
                          className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t opacity-80"
                          style={{ height: `${(value / Math.max(...properties.weeklyData)) * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: backgroundColor, color: textColor }}>
        <Card className="w-full max-w-2xl" style={{ backgroundColor: cardBgColor, border: `1px solid ${borderColor}` }}>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: isDarkMode ? '#047857' : '#dcfce7' }}>
              <CheckCircle className="w-8 h-8" style={{ color: isDarkMode ? '#10b981' : '#059669' }} />
            </div>
            <CardTitle className="text-2xl" style={{ color: textColor }}>
              {quiz.structure.settings.resultTitle || 'Obrigado!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}>
              {quiz.structure.settings.resultDescription || 'Suas respostas foram enviadas com sucesso!'}
            </p>
            <div className="text-sm" style={{ color: isDarkMode ? '#9ca3af' : '#9ca3af' }}>
              Total de respostas capturadas: {quizResponses.length}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: backgroundColor, color: textColor }}>
        <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>Nenhuma página encontrada</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4"
      style={{ 
        backgroundColor: backgroundColor,
        color: textColor,
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Logo apenas se existir */}
        {quiz.design?.logoUrl && (
          <div className={`mb-6 flex ${
            quiz.design.logoPosition === 'left' ? 'justify-start' :
            quiz.design.logoPosition === 'right' ? 'justify-end' :
            'justify-center'
          }`}>
            <img
              src={quiz.design.logoUrl}
              alt="Logo"
              className={`max-w-[200px] object-contain ${
                quiz.design.logoSize === 'small' ? 'h-8' :
                quiz.design.logoSize === 'large' ? 'h-16' :
                'h-10'
              }`}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Conteúdo da Página */}
        <Card style={{ backgroundColor: cardBgColor, border: `1px solid ${borderColor}` }}>
          <CardContent className="space-y-6 p-6">
            {/* Barra de Progresso dentro do card */}
            {(quiz.design?.showProgressBar !== false) && (
              <div className="mb-6">
                {/* Renderizar contador baseado na posição */}
                {(() => {
                  const progressBarType = quiz.design?.progressBarType || "percentage";
                  const progressBarPosition = quiz.design?.progressBarPosition || "center";
                  const progress = calculateProgress();
                  
                  const getCounterText = () => {
                    if (progressBarType === "percentage") {
                      return `${Math.round(progress)}%`;
                    } else if (progressBarType === "steps") {
                      return `${currentPageIndex + 1}/${pages.length}`;
                    }
                    return "";
                  };

                  const counterElement = progressBarType !== "none" ? (
                    <span className="text-sm font-medium" style={{ color: textColor }}>
                      {getCounterText()}
                    </span>
                  ) : null;

                  return (
                    <div className="space-y-2">
                      {/* Contador acima da barra */}
                      {progressBarPosition === "above" && counterElement && (
                        <div className="text-center">
                          {counterElement}
                        </div>
                      )}

                      {/* Contador na mesma linha da barra */}
                      {(progressBarPosition === "left" || progressBarPosition === "center" || progressBarPosition === "right") && counterElement && (
                        <div className={`flex items-center mb-2 ${
                          progressBarPosition === "left" ? "justify-start" :
                          progressBarPosition === "center" ? "justify-center" :
                          "justify-end"
                        }`}>
                          {counterElement}
                        </div>
                      )}

                      {/* Barra de progresso */}
                      <div 
                        className={`w-full overflow-hidden ${
                          quiz.design?.progressBarStyle === 'square' ? 'rounded-none' :
                          quiz.design?.progressBarStyle === 'thin' ? 'rounded-sm' :
                          quiz.design?.progressBarStyle === 'thick' ? 'rounded-lg' :
                          'rounded-full'
                        }`}
                        style={{ 
                          height: `${quiz.design?.progressBarHeight || 8}px`,
                          backgroundColor: isDarkMode ? '#4b5563' : '#e5e7eb'
                        }}
                      >
                        <div
                          className={`h-full transition-all duration-300 ${
                            quiz.design?.progressBarStyle === 'square' ? 'rounded-none' :
                            quiz.design?.progressBarStyle === 'thin' ? 'rounded-sm' :
                            quiz.design?.progressBarStyle === 'thick' ? 'rounded-lg' :
                            'rounded-full'
                          }`}
                          style={{ 
                            width: `${progress}%`,
                            backgroundColor: quiz.design?.progressBarColor || '#10b981'
                          }}
                        />
                      </div>

                      {/* Contador abaixo da barra */}
                      {progressBarPosition === "below" && counterElement && (
                        <div className="text-center">
                          {counterElement}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
            
            {currentPage.elements.map(renderElement)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}