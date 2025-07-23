import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, CheckCircle, Calendar, Star, Target, Scale, ArrowUpDown, Share2, Loader2, BarChart3, TrendingUp } from "lucide-react";
import { nanoid } from "nanoid";
import { backRedirectManager } from "@/utils/backRedirectManager";
import Chart from "./Chart";

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

// Componente para barra de progresso (versão pública)
const ProgressBarElementPublic = ({ element }: { element: any }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const properties = element.properties || {};
  
  useEffect(() => {
    const duration = (properties.progressDuration || 5) * 1000;
    const steps = 100;
    const interval = duration / steps;
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsComplete(true);
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [properties.progressDuration]);
  
  return (
    <div className="w-full space-y-3 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800">
          {properties.progressText || "Carregando..."}
        </h4>
        {properties.progressShowPercentage && (
          <span className="text-sm font-mono text-gray-600">{progress}%</span>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full" style={{ height: properties.progressHeight || 8 }}>
        <div 
          className="h-full rounded-full transition-all duration-100"
          style={{ 
            width: `${progress}%`,
            backgroundColor: properties.progressColor || "#3b82f6",
            borderRadius: properties.progressStyle === "squared" ? "0" : 
                         properties.progressStyle === "pill" ? "50px" : "4px"
          }}
        />
      </div>
      
      {isComplete && (
        <div className="text-center text-green-600 font-medium">
          ✓ Completo!
        </div>
      )}
    </div>
  );
};

// Componente para carregamento + pergunta (versão pública)
const LoadingWithQuestionElementPublic = ({ element, handleAnswer }: { element: any, handleAnswer: any }) => {
  const [progress, setProgress] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const properties = element.properties || {};
  
  useEffect(() => {
    const duration = (properties.loadingDuration || 3) * 1000;
    const steps = 100;
    const interval = duration / steps;
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setShowQuestion(true);
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [properties.loadingDuration]);
  
  const handleQuestionAnswer = (value: string) => {
    setAnswer(value);
    handleAnswer(element.id, element.type, value, element.fieldId || properties.fieldId);
  };
  
  return (
    <div className="w-full space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
      {!showQuestion && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800">
              {properties.loadingText || "Processando..."}
            </h4>
            {properties.loadingShowPercentage && (
              <span className="text-sm font-mono text-gray-600">{progress}%</span>
            )}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full" style={{ height: properties.loadingHeight || 8 }}>
            <div 
              className="h-full rounded-full transition-all duration-100"
              style={{ 
                width: `${progress}%`,
                backgroundColor: properties.loadingColor || "#3b82f6",
                borderRadius: properties.loadingStyle === "squared" ? "0" : 
                             properties.loadingStyle === "pill" ? "50px" : "4px"
              }}
            />
          </div>
        </div>
      )}
      
      {showQuestion && (
        <div className="space-y-3">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {properties.questionTitle || "Pergunta Personalizada"}
            </h3>
            {properties.questionDescription && (
              <p className="text-sm text-gray-600 mb-4">
                {properties.questionDescription}
              </p>
            )}
          </div>
          
          <div className="flex gap-3 justify-center">
            <button 
              className={`px-6 py-2 rounded-lg transition-colors ${
                answer === 'yes' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
              onClick={() => handleQuestionAnswer('yes')}
            >
              {properties.yesButtonText || "Sim"}
            </button>
            <button 
              className={`px-6 py-2 rounded-lg transition-colors ${
                answer === 'no' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
              onClick={() => handleQuestionAnswer('no')}
            >
              {properties.noButtonText || "Não"}
            </button>
          </div>
          
          {answer && (
            <div className="text-center text-gray-600 text-sm mt-2">
              Resposta registrada: {answer === 'yes' ? 'Sim' : 'Não'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente para netflix_intro (versão pública)
const NetflixIntroElementPublic = ({ element }: { element: any }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentLetter, setCurrentLetter] = useState(0);
  const properties = element.properties || {};
  
  const letters = (properties.netflixLetters || "N-E-T-F-L-I-X").split("-");
  const duration = (properties.netflixDuration || 4) * 1000;
  const speed = properties.netflixAnimationSpeed || "normal";
  const animationDelay = speed === "slow" ? 400 : speed === "fast" ? 200 : 300;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (isVisible && currentLetter < letters.length) {
      const timer = setTimeout(() => {
        setCurrentLetter(prev => prev + 1);
      }, animationDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, currentLetter, letters.length, animationDelay]);
  
  useEffect(() => {
    if (properties.netflixAutoAdvance && currentLetter >= letters.length) {
      const timer = setTimeout(() => {
        // Auto advance logic can be added here
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentLetter, letters.length, properties.netflixAutoAdvance]);
  
  if (!isVisible) return null;
  
  return (
    <div className={`netflix-intro-container ${properties.netflixFullscreen ? 'netflix-fullscreen' : ''}`}>
      <div className="netflix-intro-content">
        {properties.netflixShowTitle && (
          <h1 className="netflix-intro-title">
            {properties.netflixTitle || "NETFLIX"}
          </h1>
        )}
        
        <div className="netflix-intro-letters">
          {letters.map((letter, index) => (
            <span
              key={index}
              className={`netflix-intro-letter ${index < currentLetter ? 'netflix-intro-letter-visible' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente para loading_question (versão pública) - com popup modal
const LoadingQuestionElementPublic = ({ element, handleAnswer }: { element: any, handleAnswer: any }) => {
  const [progress, setProgress] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const properties = element.properties || {};
  
  useEffect(() => {
    const duration = (properties.loadingDuration || 4) * 1000;
    const steps = 100;
    const interval = duration / steps;
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setShowPopup(true);
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [properties.loadingDuration]);
  
  const handleQuestionAnswer = (value: string) => {
    setAnswer(value);
    setShowPopup(false);
    handleAnswer(element.id, element.type, value, element.fieldId || properties.fieldId);
  };
  
  const showProgressPercentage = element.showPercentage !== false;
  const enableShineEffect = element.enableShine || false;
  const enableStripesEffect = element.enableStripes || false;
  const showRemainingTimeText = element.showRemainingTime || false;
  const progressBarText = element.progressText || "Carregando...";
  const popupQuestionColor = element.popupQuestionColor || "#1F2937";
  const remainingTime = Math.max(0, ((element.loadingDuration || 4) * (100 - progress)) / 100);
  
  return (
    <>
      {/* Barra de carregamento aprimorada */}
      <div className="w-full space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800">
              {element.loadingText || "Processando..."}
            </h4>
            {showProgressPercentage && (
              <span className="text-sm font-mono text-gray-600">{progress}%</span>
            )}
          </div>
          
          <div className="text-center text-sm text-gray-600 mb-2">
            {progressBarText}
          </div>
          
          <div 
            className="w-full rounded-full relative overflow-hidden" 
            style={{ 
              height: element.loadingBarHeight || 8,
              backgroundColor: element.loadingBarBackgroundColor || "#E5E7EB"
            }}
          >
            <div 
              className={`h-full rounded-full transition-all duration-100 relative ${
                enableShineEffect ? 'animate-pulse' : ''
              }`}
              style={{ 
                width: `${progress}%`,
                backgroundColor: element.loadingBarColor || "#10B981",
                backgroundImage: enableStripesEffect ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' : 'none'
              }}
            >
              {enableShineEffect && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              )}
            </div>
          </div>
          
          {showRemainingTimeText && (
            <div className="text-center text-xs text-gray-500">
              Tempo restante: {remainingTime.toFixed(1)}s
            </div>
          )}
        </div>
        
        {answer && (
          <div className="text-center text-gray-600 text-sm mt-2">
            Resposta registrada: {answer === 'yes' ? (element.popupYesText || 'Sim') : (element.popupNoText || 'Não')}
          </div>
        )}
      </div>
      
      {/* Popup Modal com cor customizada */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <div className="text-center">
              <h3 
                className="text-lg font-bold mb-4"
                style={{ color: popupQuestionColor }}
              >
                {element.popupQuestion || "Você gostaria de continuar?"}
              </h3>
              
              <div className="flex gap-3 justify-center">
                <button 
                  className="px-6 py-2 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: element.yesButtonBgColor || "transparent",
                    color: element.yesButtonTextColor || "#000000",
                    borderColor: element.yesButtonTextColor || "#000000"
                  }}
                  onClick={() => handleQuestionAnswer('yes')}
                >
                  {element.popupYesText || "Sim"}
                </button>
                <button 
                  className="px-6 py-2 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: element.noButtonBgColor || "transparent",
                    color: element.noButtonTextColor || "#000000",
                    borderColor: element.noButtonTextColor || "#000000"
                  }}
                  onClick={() => handleQuestionAnswer('no')}
                >
                  {element.popupNoText || "Não"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

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

  // Função para avançar para próxima página
  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      // Limpar respostas da página atual quando avançar
      setAnswers({});
    } else {
      // Finalizar quiz
      setShowResults(true);
    }
  };

  // Função para aplicar estilos visuais baseados nas propriedades
  const getElementStyles = (element: any) => {
    const styles: any = {};
    
    // Debug: log das propriedades
    if (element?.fontSize || element?.textColor || element?.fontWeight || element?.textAlign) {
      console.log('Element with visual properties:', element);
    }
    
    // Tamanho do texto - usar element.fontSize
    if (element?.fontSize) {
      switch (element.fontSize) {
        case 'sm':
          styles.fontSize = '14px';
          break;
        case 'base':
          styles.fontSize = '16px';
          break;
        case 'lg':
          styles.fontSize = '18px';
          break;
        case 'xl':
          styles.fontSize = '20px';
          break;
        case '2xl':
          styles.fontSize = '24px';
          break;
        case '3xl':
          styles.fontSize = '30px';
          break;
        case '4xl':
          styles.fontSize = '36px';
          break;
        default:
          styles.fontSize = '16px';
      }
    }
    
    // Cor do texto
    if (element?.textColor) {
      styles.color = element.textColor;
    }
    
    // Peso da fonte
    if (element?.fontWeight) {
      styles.fontWeight = element.fontWeight;
    }
    
    // Alinhamento
    if (element?.textAlign) {
      styles.textAlign = element.textAlign;
    }
    
    // Estilo da fonte
    if (element?.fontStyle) {
      styles.fontStyle = element.fontStyle;
    }
    
    // Decoração do texto (sublinhado)
    if (element?.textDecoration) {
      styles.textDecoration = element.textDecoration;
    }
    
    // Cor de fundo
    if (element?.backgroundColor) {
      styles.backgroundColor = element.backgroundColor;
    }
    
    // Padding para cor de fundo
    if (element?.backgroundColor) {
      styles.padding = '8px 12px';
      styles.borderRadius = '4px';
    }
    
    return styles;
  };

  // Função para obter classes CSS baseadas nas propriedades
  const getElementClasses = (element: any) => {
    let classes = '';
    
    // Tamanho do texto
    if (element?.fontSize) {
      switch (element.fontSize) {
        case 'sm':
          classes += ' text-sm';
          break;
        case 'base':
          classes += ' text-base';
          break;
        case 'lg':
          classes += ' text-lg';
          break;
        case 'xl':
          classes += ' text-xl';
          break;
        case '2xl':
          classes += ' text-2xl';
          break;
        case '3xl':
          classes += ' text-3xl';
          break;
        case '4xl':
          classes += ' text-4xl';
          break;
      }
    }
    
    // Peso da fonte
    if (element?.fontWeight) {
      switch (element.fontWeight) {
        case 'light':
          classes += ' font-light';
          break;
        case 'normal':
          classes += ' font-normal';
          break;
        case 'medium':
          classes += ' font-medium';
          break;
        case 'bold':
          classes += ' font-bold';
          break;
      }
    }
    
    // Alinhamento
    if (element?.textAlign) {
      switch (element.textAlign) {
        case 'left':
          classes += ' text-left';
          break;
        case 'center':
          classes += ' text-center';
          break;
        case 'right':
          classes += ' text-right';
          break;
      }
    }
    
    // Estilo da fonte
    if (element?.fontStyle === 'italic') {
      classes += ' italic';
    }
    
    // Decoração do texto
    if (element?.textDecoration === 'underline') {
      classes += ' underline';
    }
    
    return classes;
  };

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
            <h3 
              className={`text-lg font-semibold${getElementClasses(element)}`}
              style={getElementStyles(element)}
            >
              {element.content || properties?.question || properties?.content || 'Pergunta'}
            </h3>
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
                      <RadioGroupItem 
                        value={optionValue} 
                        id={`${id}-${index}`}
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: element.checkboxColor || properties?.checkboxColor || "#374151",
                          accentColor: element.checkboxColor || properties?.checkboxColor || "#374151"
                        }}
                      />
                      <Label 
                        htmlFor={`${id}-${index}`} 
                        className="flex-1 cursor-pointer"
                        style={{
                          color: element.optionTextColor || properties?.optionTextColor || "#374151",
                          fontSize: element.optionFontSize === 'xs' ? '0.75rem' :
                                  element.optionFontSize === 'sm' ? '0.875rem' :
                                  element.optionFontSize === 'lg' ? '1.125rem' :
                                  element.optionFontSize === 'xl' ? '1.25rem' : '1rem',
                          fontWeight: element.optionFontWeight === 'light' ? '300' :
                                     element.optionFontWeight === 'medium' ? '500' :
                                     element.optionFontWeight === 'semibold' ? '600' :
                                     element.optionFontWeight === 'bold' ? '700' : '400'
                        }}
                      >
                        {optionValue}
                      </Label>
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
        // Aplicar estilos de formatação de texto
        const fieldLabelStyle = {
          fontSize: properties?.fontSize === "xs" ? "12px" : 
                   properties?.fontSize === "sm" ? "14px" : 
                   properties?.fontSize === "lg" ? "18px" : 
                   properties?.fontSize === "xl" ? "20px" : "16px",
          fontWeight: properties?.fontWeight || "500",
          color: properties?.textColor || "#374151",
          textAlign: (properties?.textAlign || "left") as any,
        };

        // Largura em porcentagem da tela
        const widthPercentage = properties?.widthPercentage || 100;
        const containerWidth = `${Math.min(Math.max(widthPercentage, 10), 100)}%`;

        return (
          <div key={id} className="w-full" style={{ width: containerWidth, maxWidth: containerWidth }}>
            <div className="space-y-4">
              <h3 style={fieldLabelStyle}>
                {properties?.question || 'Texto'}
                {properties?.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              <Input
                type="text"
                placeholder={properties?.placeholder || 'Digite aqui'}
                value={answer || ''}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 200); // Limite de 200 caracteres
                  handleElementAnswer(id, type, value, properties?.fieldId);
                }}
                maxLength={200}
                required={properties?.required}
              />
              <div className="text-xs text-gray-500 text-right">
                {(answer || '').length}/200 caracteres
              </div>
            </div>
          </div>
        );

      case 'email':
        // Aplicar estilos de formatação de texto para email
        const emailFieldLabelStyle = {
          fontSize: properties?.fontSize === "xs" ? "12px" : 
                   properties?.fontSize === "sm" ? "14px" : 
                   properties?.fontSize === "lg" ? "18px" : 
                   properties?.fontSize === "xl" ? "20px" : "16px",
          fontWeight: properties?.fontWeight || "500",
          color: properties?.textColor || "#374151",
          textAlign: (properties?.textAlign || "left") as any,
        };

        // Largura em porcentagem da tela
        const emailWidthPercentage = properties?.widthPercentage || 100;
        const emailContainerWidth = `${Math.min(Math.max(emailWidthPercentage, 10), 100)}%`;

        return (
          <div key={id} className="w-full" style={{ width: emailContainerWidth, maxWidth: emailContainerWidth }}>
            <div className="space-y-4">
              <h3 style={emailFieldLabelStyle}>
                {properties?.question || 'E-mail'}
                {properties?.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              <Input
                type="email"
                placeholder={properties?.placeholder || 'Digite seu email'}
                value={answer || ''}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 150); // Limite de 150 caracteres para email
                  handleElementAnswer(id, type, value, properties?.fieldId || 'email');
                }}
                maxLength={150}
                required={properties?.required}
              />
              <div className="text-xs text-gray-500 text-right">
                {(answer || '').length}/150 caracteres (limite fixo para email)
              </div>
            </div>
          </div>
        );

      case 'phone':
        // Aplicar estilos de formatação de texto para telefone
        const phoneFieldLabelStyle = {
          fontSize: properties?.fontSize === "xs" ? "12px" : 
                   properties?.fontSize === "sm" ? "14px" : 
                   properties?.fontSize === "lg" ? "18px" : 
                   properties?.fontSize === "xl" ? "20px" : "16px",
          fontWeight: properties?.fontWeight || "500",
          color: properties?.textColor || "#374151",
          textAlign: (properties?.textAlign || "left") as any,
        };

        // Largura em porcentagem da tela
        const phoneWidthPercentage = properties?.widthPercentage || 100;
        const phoneContainerWidth = `${Math.min(Math.max(phoneWidthPercentage, 10), 100)}%`;

        return (
          <div key={id} className="w-full" style={{ width: phoneContainerWidth, maxWidth: phoneContainerWidth }}>
            <div className="space-y-4">
              <h3 style={phoneFieldLabelStyle}>
                {properties?.question || 'Telefone/WhatsApp'}
                {properties?.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              <Input
                type="tel"
                placeholder={properties?.placeholder || 'Digite seu telefone/WhatsApp'}
                value={answer || ''}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 20); // Limite de 20 caracteres para telefone
                  handleElementAnswer(id, type, value, properties?.fieldId || 'telefone_principal');
                }}
                maxLength={20}
                required={properties?.required}
              />
              <div className="text-xs text-gray-500 text-right">
                {(answer || '').length}/20 caracteres (limite fixo para telefone)
              </div>
            </div>
          </div>
        );

      case 'number':
        // Aplicar estilos de formatação de texto para número
        const numberFieldLabelStyle = {
          fontSize: properties?.fontSize === "xs" ? "12px" : 
                   properties?.fontSize === "sm" ? "14px" : 
                   properties?.fontSize === "lg" ? "18px" : 
                   properties?.fontSize === "xl" ? "20px" : "16px",
          fontWeight: properties?.fontWeight || "500",
          color: properties?.textColor || "#374151",
          textAlign: (properties?.textAlign || "left") as any,
        };

        // Largura em porcentagem da tela
        const numberWidthPercentage = properties?.widthPercentage || 100;
        const numberContainerWidth = `${Math.min(Math.max(numberWidthPercentage, 10), 100)}%`;

        // Limite de dígitos (padrão 15, não editável)
        const digitLimit = properties?.digitLimit || 15;

        return (
          <div key={id} className="w-full" style={{ width: numberContainerWidth, maxWidth: numberContainerWidth }}>
            <div className="space-y-4">
              <h3 style={numberFieldLabelStyle}>
                {properties?.question || 'Número'}
                {properties?.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={properties?.placeholder || 'Digite um número'}
                value={answer || ''}
                onChange={(e) => {
                  // Permitir apenas números e limitar ao número de dígitos configurado
                  const value = e.target.value.replace(/\D/g, '').slice(0, digitLimit);
                  handleElementAnswer(id, type, value, properties?.fieldId);
                }}
                maxLength={digitLimit}
                required={properties?.required}
              />
              <div className="text-xs text-gray-500 text-right">
                {(answer || '').toString().length}/{digitLimit} dígitos (limite fixo para números)
              </div>
            </div>
          </div>
        );

      case 'textarea':
        return (
          <div key={id} className="space-y-4">
            {(properties?.question || properties?.label) && (
              <h3 
                className={`text-lg font-semibold${getElementClasses(properties)}`}
                style={getElementStyles(properties)}
              >
                {properties?.question || properties?.label || 'Texto'}
              </h3>
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
              <h3 
                className={`text-lg font-semibold${getElementClasses(properties)}`}
                style={getElementStyles(properties)}
              >
                {element.content || properties?.question || properties?.label || 'Opções'}
              </h3>
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
      case 'altura':
        return (
          <div key={id} className="space-y-4">
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-5 h-5 text-purple-500" />
              <h3 
                className={`text-lg font-semibold${getElementClasses(properties)}`}
                style={getElementStyles(properties)}
              >
                {properties?.question || element.content || 'Altura'}
              </h3>
            </div>
            <div className="space-y-2">
              {properties?.unitSystem === 'imperial' ? (
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="5"
                      value={answer?.feet || ''}
                      onChange={(e) => handleElementAnswer(id, type, { ...answer, feet: e.target.value }, properties?.fieldId || 'altura')}
                      required={properties?.required}
                      min={3}
                      max={8}
                    />
                    <label className="text-sm text-gray-600 mt-1 block">Pés</label>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="10"
                      value={answer?.inches || ''}
                      onChange={(e) => handleElementAnswer(id, type, { ...answer, inches: e.target.value }, properties?.fieldId || 'altura')}
                      required={properties?.required}
                      min={0}
                      max={11}
                    />
                    <label className="text-sm text-gray-600 mt-1 block">Polegadas</label>
                  </div>
                </div>
              ) : (
                <Input
                  type="number"
                  placeholder={properties?.placeholder || '170'}
                  value={answer || ''}
                  onChange={(e) => handleElementAnswer(id, type, Number(e.target.value), properties?.fieldId || 'altura')}
                  required={properties?.required}
                  min={properties?.min || 100}
                  max={properties?.max || 250}
                />
              )}
            </div>
          </div>
        );

      case 'current_weight':
        return (
          <div key={id} className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Scale className="w-5 h-5 text-blue-600" />
                <h3 className={`${properties?.fontSize || 'text-lg'} ${properties?.fontWeight || 'font-semibold'} ${properties?.textAlign || 'text-left'} text-blue-800`}>{properties?.question || 'Peso Atual'}</h3>
              </div>
              {properties?.description && (
                <p className="text-sm text-blue-700 mb-3">{properties.description}</p>
              )}
              <div className={`${
                properties?.fieldWidth === 'small' ? 'max-w-xs' :
                properties?.fieldWidth === 'medium' ? 'max-w-sm' :
                properties?.fieldWidth === 'large' ? 'max-w-md' :
                'max-w-full'
              } ${
                properties?.fieldAlign === 'left' ? 'mr-auto' :
                properties?.fieldAlign === 'right' ? 'ml-auto' :
                'mx-auto'
              }`}>
                <Input
                  type="number"
                  placeholder={properties?.placeholder || '70'}
                  value={answer || ''}
                  onChange={(e) => handleElementAnswer(id, type, Number(e.target.value), properties?.fieldId || 'peso_atual')}
                  required={properties?.required}
                  min={properties?.min || 30}
                  max={properties?.max || 300}
                  className={`${
                    properties?.fieldStyle === 'rounded' ? 'rounded-full' :
                    properties?.fieldStyle === 'square' ? 'rounded-none' :
                    'rounded-md'
                  }`}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-blue-600">{properties?.unit || 'kg'}</span>
                  {properties?.showWeightRange && (
                    <span className="text-xs text-blue-600">
                      {properties?.min || 30} - {properties?.max || 300} {properties?.unit || 'kg'}
                    </span>
                  )}
                </div>
              </div>
              {properties?.showWeightRange && answer && (
                <div className="mt-3">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${((answer - (properties?.min || 30)) / ((properties?.max || 300) - (properties?.min || 30))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'target_weight':
        return (
          <div key={id} className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-orange-600" />
                <h3 className={`${properties?.fontSize || 'text-lg'} ${properties?.fontWeight || 'font-semibold'} ${properties?.textAlign || 'text-left'} text-orange-800`}>{properties?.question || 'Peso Meta'}</h3>
              </div>
              {properties?.description && (
                <p className="text-sm text-orange-700 mb-3">{properties.description}</p>
              )}
              <div className={`${
                properties?.fieldWidth === 'small' ? 'max-w-xs' :
                properties?.fieldWidth === 'medium' ? 'max-w-sm' :
                properties?.fieldWidth === 'large' ? 'max-w-md' :
                'max-w-full'
              } ${
                properties?.fieldAlign === 'left' ? 'mr-auto' :
                properties?.fieldAlign === 'right' ? 'ml-auto' :
                'mx-auto'
              }`}>
                <Input
                  type="number"
                  placeholder={properties?.placeholder || '65'}
                  value={answer || ''}
                  onChange={(e) => handleElementAnswer(id, type, Number(e.target.value), properties?.fieldId || 'peso_meta')}
                  required={properties?.required}
                  min={properties?.min || 30}
                  max={properties?.max || 300}
                  className={`${
                    properties?.fieldStyle === 'rounded' ? 'rounded-full' :
                    properties?.fieldStyle === 'square' ? 'rounded-none' :
                    'rounded-md'
                  }`}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-orange-600">{properties?.unit || 'kg'}</span>
                  {properties?.showTargetProgress && (
                    <span className="text-xs text-orange-600">
                      Meta: {properties?.min || 30} - {properties?.max || 300} {properties?.unit || 'kg'}
                    </span>
                  )}
                </div>
              </div>
              {properties?.showTargetProgress && answer && (
                <div className="mt-3">
                  <div className="w-full bg-orange-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${((answer - (properties?.min || 30)) / ((properties?.max || 300) - (properties?.min || 30))) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-xs text-orange-600 font-medium">
                      Meta: {answer}{properties?.unit || 'kg'}
                    </span>
                  </div>
                </div>
              )}
            </div>
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
      case 'title':
        return (
          <div key={id} className="space-y-2">
            <h2 
              className={`text-2xl font-bold${getElementClasses(properties)}`}
              style={getElementStyles(properties)}
            >
              {properties.text || properties.content || element.content || 'Título'}
            </h2>
          </div>
        );

      case 'paragraph':
        return (
          <div key={id} className="space-y-2">
            <p 
              className={`text-gray-700${getElementClasses(properties)}`}
              style={getElementStyles(properties)}
            >
              {properties.text || properties.content || element.content || 'Parágrafo'}
            </p>
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
        const chartData = properties.chartData || [
          { label: "Semana 1", value: 45, color: "#ef4444" },
          { label: "Semana 2", value: 65, color: "#f59e0b" },
          { label: "Semana 3", value: 85, color: "#10b981" },
          { label: "Semana 4", value: 92, color: "#3b82f6" }
        ];
        
        return (
          <div key={id} className="mb-6">
            <Card className="p-6">
              <CardHeader>
                <CardTitle style={{ color: properties.chartTitleColor || '#1F2937' }}>
                  {properties.chartTitle || 'Gráfico de Resultados'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64">
                  <Chart
                    type={properties.chartType || 'bar'}
                    data={chartData}
                    title={properties.chartTitle}
                    showLegend={properties.chartShowLegend !== false}
                    backgroundColor={properties.chartBackgroundColor || '#3b82f6'}
                    borderColor={properties.chartBorderColor || '#1d4ed8'}
                    height={250}
                  />
                </div>
                {properties.chartDescription && (
                  <p className="mt-4 text-sm text-gray-600 text-center">
                    {properties.chartDescription}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'metrics':
        const metricsData = properties.metricsData || [
          { label: "Conversões", value: 85, color: "#10b981", icon: "🎯" },
          { label: "Engajamento", value: 72, color: "#3b82f6", icon: "💡" },
          { label: "Retenção", value: 94, color: "#8b5cf6", icon: "🔄" },
          { label: "Vendas", value: 158, color: "#f59e0b", icon: "💰" }
        ];
        
        return (
          <div key={id} className="mb-6">
            <Card className="p-6">
              <CardHeader>
                <CardTitle>
                  {properties.metricsTitle || 'Métricas de Performance'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64">
                  <Chart
                    type="bar"
                    data={metricsData}
                    title={properties.metricsTitle}
                    showLegend={properties.metricsShowLegend !== false}
                    backgroundColor="#8b5cf6"
                    borderColor="#7c3aed"
                    height={250}
                  />
                </div>
                {properties.metricsDescription && (
                  <p className="mt-4 text-sm text-gray-600 text-center">
                    {properties.metricsDescription}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'before_after':
        // Dados para gráfico antes/depois
        const beforeAfterData = properties.beforeAfterData || [
          { label: "Antes", value: properties.beforeValue || 25, color: properties.beforeColor || "#ef4444" },
          { label: "Depois", value: properties.afterValue || 85, color: properties.afterColor || "#10b981" }
        ];

        return (
          <div key={id} className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            {properties.beforeAfterTitle && (
              <h3 className="text-lg font-bold text-center mb-4" style={{ color: properties.titleColor || '#1f2937' }}>
                {properties.beforeAfterTitle}
              </h3>
            )}
            
            {properties.beforeAfterDisplayType === 'chart' ? (
              <div className="w-full h-64">
                <Chart
                  type={properties.beforeAfterChartType || 'bar'}
                  data={beforeAfterData}
                  title={properties.beforeAfterTitle}
                  showLegend={properties.beforeAfterShowLegend !== false}
                  backgroundColor={properties.beforeAfterChartBg || '#3b82f6'}
                  borderColor={properties.beforeAfterChartBorder || '#1d4ed8'}
                  height={250}
                />
              </div>
            ) : properties.beforeAfterDisplayType === 'metrics' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-6 rounded-lg" style={{ backgroundColor: properties.beforeColor || '#fef2f2' }}>
                  <div className="text-4xl font-bold mb-2" style={{ color: properties.beforeColor || '#dc2626' }}>
                    {properties.beforeValue || 25}
                    {properties.beforeAfterShowPercent && '%'}
                  </div>
                  <h4 className="text-lg font-semibold mb-1" style={{ color: properties.beforeColor || '#dc2626' }}>
                    {properties.beforeAfterLabels?.before || "ANTES"}
                  </h4>
                  <p className="text-sm opacity-80">{properties.beforeDescription || "Situação anterior"}</p>
                </div>
                
                <div className="text-center p-6 rounded-lg" style={{ backgroundColor: properties.afterColor || '#f0fdf4' }}>
                  <div className="text-4xl font-bold mb-2" style={{ color: properties.afterColor || '#16a34a' }}>
                    {properties.afterValue || 85}
                    {properties.beforeAfterShowPercent && '%'}
                  </div>
                  <h4 className="text-lg font-semibold mb-1" style={{ color: properties.afterColor || '#16a34a' }}>
                    {properties.beforeAfterLabels?.after || "DEPOIS"}
                  </h4>
                  <p className="text-sm opacity-80">{properties.afterDescription || "Resultado alcançado"}</p>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-lg" style={{
                width: properties.beforeAfterWidth || "100%", 
                height: properties.beforeAfterHeight || "400px"
              }}>
                <div className="absolute inset-0 flex">
                  <div className="w-1/2 bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-6xl mb-2">😔</div>
                      <h3 className="text-xl font-bold">
                        {properties.beforeAfterLabels?.before || "ANTES"}
                      </h3>
                      <p className="text-sm opacity-90">{properties.beforeDescription || "Situação anterior"}</p>
                    </div>
                  </div>
                  
                  <div className="w-1/2 bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-6xl mb-2">😊</div>
                      <h3 className="text-xl font-bold">
                        {properties.beforeAfterLabels?.after || "DEPOIS"}
                      </h3>
                      <p className="text-sm opacity-90">{properties.afterDescription || "Resultado alcançado"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-white shadow-lg">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-300">
                    <ArrowUpDown className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>
            )}
            
            {properties.beforeAfterDisplayType !== 'visual' && (
              <div className="text-center text-sm text-gray-600">
                {properties.beforeAfterDescription || "Comparação entre antes e depois"}
              </div>
            )}
          </div>
        );

      case 'progress_bar':
        return (
          <div key={id} className="mb-4">
            <ProgressBarElementPublic element={element} />
          </div>
        );

      case 'loading_with_question':
        return (
          <div key={id} className="mb-4">
            <LoadingWithQuestionElementPublic element={element} handleAnswer={handleElementAnswer} />
          </div>
        );

      case 'loading_question':
        return (
          <div key={id} className="mb-4">
            <LoadingQuestionElementPublic element={element} handleAnswer={handleElementAnswer} />
          </div>
        );

      case 'netflix_intro':
        return (
          <div key={id} className="mb-4">
            <NetflixIntroElementPublic element={element} />
          </div>
        );

      case 'spacer':
        const spacerSize = properties.spacerSize || "medium";
        const customSize = properties.customSpacerSize || "2rem";
        
        // Mapeamento responsivo dos tamanhos de spacer
        const spacerSizeMap = {
          small: "1rem",
          medium: "2rem", 
          large: "4rem"
        };
        
        // Usar tamanho personalizado se definido
        const finalSize = spacerSize === "custom" && customSize ? customSize : spacerSizeMap[spacerSize];
        
        return (
          <div 
            key={id}
            className="w-full"
            style={{ 
              height: finalSize,
              minHeight: "0.5rem"
            }}
            aria-hidden="true"
          >
            {/* Spacer invisível no quiz público */}
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
              {quiz.structure?.settings?.resultTitle || 'Obrigado!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}>
              {quiz.structure?.settings?.resultDescription || 'Suas respostas foram enviadas com sucesso!'}
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