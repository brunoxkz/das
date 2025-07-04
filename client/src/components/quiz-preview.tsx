import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Mail, 
  User, 
  Phone,
  Sparkles,
  ArrowUpDown,
  Scale,
  Target,
  Activity
} from "lucide-react";
import { globalVariableProcessor, processVariables, setQuizResponse, addCalculationRule, VariableProcessor } from "@/lib/variables";

// Componente para textos alternantes
const AlternatingText = ({ texts, color, fontSize }: { 
  texts: Array<{ text: string; duration: number }>, 
  color: string, 
  fontSize: string 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (texts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, texts[currentIndex].duration * 1000);

    return () => clearInterval(interval);
  }, [texts, currentIndex]);

  if (!texts.length) return null;

  return (
    <div className="mb-4">
      <p 
        className={`text-${fontSize} font-medium transition-opacity duration-300`}
        style={{ color }}
      >
        {texts[currentIndex].text}
      </p>
    </div>
  );
};

// Componente para contador animado
const AnimatedCounter = ({ element }: { element: any }) => {
  const [currentValue, setCurrentValue] = useState(
    element.counterType === 'countdown' 
      ? (element.counterStartValue || 10)
      : { hours: element.chronometerHours || 0, minutes: element.chronometerMinutes || 0, seconds: element.chronometerSeconds || 0 }
  );

  useEffect(() => {
    if (element.counterType === 'countdown') {
      if (currentValue <= 0) return;

      const interval = setInterval(() => {
        setCurrentValue((prev: number) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(interval);
    } else {
      // Cronômetro promocional - DECREMENTA (regressivo)
      const interval = setInterval(() => {
        setCurrentValue((prev: any) => {
          let newSeconds = prev.seconds - 1;
          let newMinutes = prev.minutes;
          let newHours = prev.hours;

          if (newSeconds < 0) {
            newSeconds = 59;
            newMinutes--;
          }
          if (newMinutes < 0) {
            newMinutes = 59;
            newHours--;
          }
          if (newHours < 0) {
            newHours = 0;
            newMinutes = 0;
            newSeconds = 0;
          }

          return { hours: newHours, minutes: newMinutes, seconds: newSeconds };
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [element.counterType, currentValue]);

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  return (
    <div className="mb-6">
      <div 
        className="text-4xl font-bold"
        style={{ color: element.color || '#000000' }}
      >
        {element.counterType === 'countdown' 
          ? `${currentValue}s` 
          : `${formatTime(currentValue.hours)}:${formatTime(currentValue.minutes)}:${formatTime(currentValue.seconds)}`
        }
      </div>
    </div>
  );
};

// Componente para redirecionamento
const RedirectComponent = ({ element, onRedirect }: { element: any, onRedirect?: () => void }) => {
  const [countdown, setCountdown] = useState(element.redirectDelay || 5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev: number) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Executar redirecionamento
          setTimeout(() => {
            if (element.redirectAction === 'custom_url' && element.redirectUrl) {
              window.location.href = element.redirectUrl;
            } else if (element.redirectAction === 'next_page' && onRedirect) {
              onRedirect();
            }
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [element.redirectAction, element.redirectUrl, onRedirect]);

  return (
    <div className="mb-6">
      {element.showRedirectCounter && (
        <>
          <p className="text-lg text-gray-700 mb-2">
            Redirecionando em: {countdown} segundos
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-vendzz-primary h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(countdown / (element.redirectDelay || 5)) * 100}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
};

interface QuizPreviewProps {
  quiz: {
    title: string;
    description: string;
    structure: {
      questions: any[];
      settings: {
        theme: string;
        showProgressBar: boolean;
        collectEmail: boolean;
        collectName: boolean;
        collectPhone: boolean;
      };
    };
  };
}

export function QuizPreview({ quiz }: QuizPreviewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [leadData, setLeadData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const { pages, settings } = quiz.structure;
  
  // Incluir todas as páginas (normais e de transição)
  const allPages = pages || [];
  const totalSteps = allPages.length + (settings.collectEmail || settings.collectName || settings.collectPhone ? 1 : 0) + 1; // +1 for result
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Configurar cálculos automáticos quando o quiz carrega
  useEffect(() => {
    // Limpar cálculos anteriores
    globalVariableProcessor.clear();
    
    // Encontrar elementos com responseId para configurar cálculos automáticos
    const allElements: any[] = [];
    allPages.forEach(page => {
      if (page.elements) {
        allElements.push(...page.elements);
      }
    });

    // Detectar elementos de altura, peso atual e peso alvo
    const heightElement = allElements.find(el => el.type === 'height' && el.responseId);
    const currentWeightElement = allElements.find(el => el.type === 'current_weight' && el.responseId);
    const targetWeightElement = allElements.find(el => el.type === 'target_weight' && el.responseId);

    // Configurar cálculo de IMC se altura e peso atual existem
    if (heightElement?.responseId && currentWeightElement?.responseId) {
      addCalculationRule(VariableProcessor.createBMICalculation(
        heightElement.responseId,
        currentWeightElement.responseId,
        'imc'
      ));
    }

    // Configurar cálculo de diferença de peso se peso atual e alvo existem
    if (currentWeightElement?.responseId && targetWeightElement?.responseId) {
      addCalculationRule(VariableProcessor.createWeightDifferenceCalculation(
        currentWeightElement.responseId,
        targetWeightElement.responseId,
        'diferenca_peso'
      ));
    }
  }, [quiz]);
  
  // Determinar se é página de transição e encontrar elemento de fundo
  const currentPage = allPages[currentStep];
  const isTransitionPage = currentPage?.isTransition;
  const backgroundElement = isTransitionPage 
    ? currentPage?.elements?.find((el: any) => el.type === 'transition_background')
    : null;
    
  // Estilo do fundo da página
  const getPageBackgroundStyle = () => {
    if (!backgroundElement) return {};
    
    if (backgroundElement.backgroundType === "gradient") {
      return {
        background: `linear-gradient(${backgroundElement.gradientDirection || "to-r"}, ${backgroundElement.gradientFrom || "#8B5CF6"}, ${backgroundElement.gradientTo || "#EC4899"})`
      };
    } else if (backgroundElement.backgroundType === "image" && backgroundElement.backgroundImage) {
      return {
        backgroundImage: `url(${backgroundElement.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      };
    } else {
      return {
        backgroundColor: backgroundElement.backgroundColor || "#8B5CF6"
      };
    }
  };

  const handleAnswer = (questionId: number, answer: any, element?: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Se o elemento tem responseId, registra a resposta no sistema de variáveis
    if (element?.responseId) {
      const responseType = element.type === 'multiple_choice' ? 'choice' :
                          element.type === 'number' || element.type === 'rating' ? 'number' :
                          element.type === 'email' ? 'email' :
                          element.type === 'phone' ? 'phone' :
                          element.type === 'date' || element.type === 'birth_date' ? 'date' :
                          'text';
      
      setQuizResponse(element.responseId, answer, responseType, questionId);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderPage = (page: any, pageIndex: number) => {
    const isActive = currentStep === pageIndex;
    if (!isActive) return null;

    // Se a página não tem elementos, pula
    if (!page.elements || page.elements.length === 0) {
      setTimeout(handleNext, 100);
      return null;
    }

    // Verificar se é página de transição
    const isTransitionPage = page.isTransition || page.elements.some((el: any) => 
      ['transition_background', 'transition_text', 'transition_counter', 'transition_loader', 'transition_redirect'].includes(el.type)
    );

    if (isTransitionPage) {
      return renderTransitionPage(page, pageIndex);
    }

    // Renderizar elementos interativos da página (incluindo jogos)
    const interactiveElements = page.elements.filter((el: any) => 
      ['multiple_choice', 'text', 'email', 'phone', 'number', 'rating', 'date', 'textarea', 'checkbox', 'birth_date', 'height', 'current_weight', 'target_weight', 'game_wheel', 'game_scratch', 'game_color_pick', 'game_brick_break', 'game_memory_cards', 'game_slot_machine'].includes(el.type)
    );

    const contentElements = page.elements.filter((el: any) => 
      ['heading', 'paragraph', 'image', 'video', 'divider'].includes(el.type)
    );

    return (
      <div className="max-w-2xl mx-auto text-center">
        {/* Renderizar elementos de conteúdo primeiro */}
        {contentElements.map((element: any) => (
          <div key={element.id} className="mb-6">
            {renderContentElement(element)}
          </div>
        ))}

        {/* Renderizar primeiro elemento interativo */}
        {interactiveElements.length > 0 && renderInteractiveElement(interactiveElements[0], pageIndex)}
      </div>
    );
  };

  const renderContentElement = (element: any) => {
    switch (element.type) {
      case 'heading':
        const HeadingTag = element.fontSize === 'xs' ? 'h6' : 
                          element.fontSize === 'sm' ? 'h5' :
                          element.fontSize === 'base' ? 'h4' :
                          element.fontSize === 'lg' ? 'h3' :
                          element.fontSize === 'xl' ? 'h2' : 'h1';
        return (
          <HeadingTag 
            className={`font-bold text-gray-900 mb-4 text-${element.textAlign || 'left'}`}
            style={{ color: element.textColor }}
          >
            {processVariables(element.content || '')}
          </HeadingTag>
        );
      
      case 'paragraph':
        return (
          <p 
            className={`text-gray-600 mb-4 text-${element.textAlign || 'left'}`}
            style={{ color: element.textColor }}
          >
            {processVariables(element.content || '')}
          </p>
        );
      
      case 'image':
        return (
          <div className={`mb-4 text-${element.textAlign || 'center'}`}>
            <img 
              src={element.imageUrl || element.content} 
              alt="Imagem" 
              className="max-w-full h-auto rounded-lg mx-auto"
            />
          </div>
        );
      
      case 'divider':
        return <hr className="my-6 border-gray-300" />;

      case 'birth_date':
        return (
          <div className="mb-6">
            {(element.question && element.question.trim() !== '') ? (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {element.question}
                {element.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            ) : (
              <label className="block text-sm font-medium text-gray-500 mb-2 italic">
                Título em branco
              </label>
            )}
            <input
              type="date"
              placeholder={element.placeholder || "dd/mm/aaaa"}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {element.showAgeCalculation && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-blue-800">🎂 Cálculo automático de idade</span>
                </div>
                <div className="text-xs text-blue-700">
                  A idade será calculada automaticamente quando uma data for selecionada
                </div>
              </div>
            )}
          </div>
        );

      case 'height':
        return (
          <div className="mb-6">
            {(element.question && element.question.trim() !== '') && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {element.question}
                {element.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min={element.unit === "cm" ? "120" : "1.20"}
                max={element.unit === "cm" ? "220" : "2.20"}
                step={element.unit === "cm" ? "1" : "0.01"}
                placeholder={element.placeholder || (element.unit === "cm" ? "175" : "1.75")}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="text-gray-600">{element.unit || "cm"}</span>
            </div>
          </div>
        );

      case 'current_weight':
        return (
          <div className="mb-6">
            {(element.question && element.question.trim() !== '') && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {processVariables(element.question || '')}
                {element.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Scale className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800">Peso Atual</h4>
                  <p className="text-xs text-blue-600">Seu peso corporal atual</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="30"
                  max="300"
                  step="0.1"
                  placeholder={element.placeholder || "70.0"}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-semibold"
                  onChange={(e) => handleAnswer(element.id, parseFloat(e.target.value) || 0, element)}
                />
                <span className="text-gray-600 font-medium">kg</span>
              </div>
            </div>
          </div>
        );

      case 'target_weight':
        return (
          <div className="mb-6">
            {(element.question && element.question.trim() !== '') && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {processVariables(element.question || '')}
                {element.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <div className="bg-orange-50 border-2 border-dashed border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-orange-800">Peso Objetivo</h4>
                  <p className="text-xs text-orange-600">Meta de peso que deseja atingir</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="30"
                  max="300"
                  step="0.1"
                  placeholder={element.placeholder || "65.0"}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-center font-semibold"
                  onChange={(e) => handleAnswer(element.id, parseFloat(e.target.value) || 0, element)}
                />
                <span className="text-gray-600 font-medium">kg</span>
              </div>
            </div>
          </div>
        );

      case 'continue_button':
        const buttonText = element.buttonText || "Continuar";
        const buttonSize = element.buttonSize || "medium";
        const buttonBorderRadius = element.buttonBorderRadius || "medium";
        const buttonBgColor = element.buttonBackgroundColor || "#10B981";
        const buttonTextColor = element.buttonTextColor || "#FFFFFF";
        const buttonHoverColor = element.buttonHoverColor || "#059669";
        
        const sizeClasses = {
          small: "px-4 py-2 text-sm",
          medium: "px-6 py-3 text-base",
          large: "px-8 py-4 text-lg"
        };
        
        const radiusClasses = {
          none: "rounded-none",
          small: "rounded-sm",
          medium: "rounded-md",
          large: "rounded-lg",
          full: "rounded-full"
        };
        
        return (
          <div className="mb-6 flex justify-center">
            <button
              style={{
                backgroundColor: buttonBgColor,
                color: buttonTextColor,
              }}
              className={`
                ${sizeClasses[buttonSize]} 
                ${radiusClasses[buttonBorderRadius]}
                font-medium shadow-lg transform transition-all duration-200
                hover:scale-105 hover:shadow-xl
                animate-pulse
                relative overflow-hidden
              `}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = buttonHoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = buttonBgColor;
              }}
              onClick={() => {
                if (element.buttonAction === "url" && element.buttonUrl) {
                  window.open(element.buttonUrl, '_blank');
                } else {
                  // Próxima página
                  handleNext();
                }
              }}
            >
              <span className="relative z-10">{buttonText}</span>
              <div className="absolute inset-0 bg-white opacity-20 animate-ping rounded-full"></div>
            </button>
          </div>
        );

      case 'loading_question':
        return <LoadingQuestionElement element={element} onAnswer={(answer) => handleAnswer(element.id, answer, element)} />;
      
      case 'spacer':
        const spacerSize = element.spacerSize || "medium";
        const spacerHeight = spacerSize === "small" ? "20px" : 
                            spacerSize === "large" ? "60px" : "40px";
        return <div style={{ height: spacerHeight }} />;

      case 'text':
        return (
          <div className="mb-6">
            {(element.question && element.question.trim() !== '') && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {element.question}
                {element.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <input
              type="text"
              placeholder={element.placeholder || "Digite sua resposta..."}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e) => handleAnswer(element.id, e.target.value, element)}
            />
          </div>
        );

      case 'email':
        return (
          <div className="mb-6">
            {element.question && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {element.question}
              </label>
            )}
            <input
              type="email"
              placeholder={element.placeholder || "seu@email.com"}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e) => handleAnswer(element.id, e.target.value, element)}
            />
          </div>
        );

      case 'phone':
        return (
          <div className="mb-6">
            {element.question && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {element.question}
              </label>
            )}
            <input
              type="tel"
              placeholder={element.placeholder || "(11) 99999-9999"}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e) => handleAnswer(element.id, e.target.value, element)}
            />
          </div>
        );

      case 'number':
        return (
          <div className="mb-6">
            {element.question && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {element.question}
              </label>
            )}
            <input
              type="number"
              min={element.min || undefined}
              max={element.max || undefined}
              placeholder={element.placeholder || "Digite um número..."}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e) => handleAnswer(element.id, parseFloat(e.target.value) || 0, element)}
            />
          </div>
        );

      case 'rating':
        return (
          <div className="mb-6">
            {element.question && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {element.question}
              </label>
            )}
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className="text-2xl text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>
        );

      case 'date':
        return (
          <div className="mb-6">
            {element.question && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {element.question}
              </label>
            )}
            <input
              type="date"
              placeholder={element.placeholder || "dd/mm/aaaa"}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        );

      case 'textarea':
        return (
          <div className="mb-6">
            {element.question && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {element.question}
              </label>
            )}
            <textarea
              placeholder={element.placeholder || "Digite sua mensagem..."}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
        );

      case 'image_upload':
        return (
          <div className="mb-6">
            {element.question && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {element.question}
              </label>
            )}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">📁</div>
              <p className="text-gray-500 mb-2">Clique para enviar uma imagem</p>
              <p className="text-xs text-gray-400">PNG, JPG até 5MB</p>
            </div>
          </div>
        );

      case 'video':
        if (element.imageUrl) {
          const videoId = element.imageUrl.includes('youtube.com') || element.imageUrl.includes('youtu.be') ?
            element.imageUrl.split('v=')[1]?.split('&')[0] || element.imageUrl.split('/').pop() :
            null;
          
          if (videoId) {
            return (
              <div className="mb-6">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>
              </div>
            );
          }
        }
        return (
          <div className="mb-6">
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">🎥</div>
              <p className="text-gray-500">Vídeo será carregado aqui</p>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-6 text-center border">
              <div className="text-3xl mb-3">🔊</div>
              <p className="text-gray-700 font-medium mb-3">
                {element.audioTitle || "Mensagem de Áudio"}
              </p>
              <div className="flex justify-center">
                <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-colors">
                  ▶️ Reproduzir
                </button>
              </div>
            </div>
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="mb-6">
            {element.question && (
              <label className="block text-lg font-medium text-gray-700 mb-4">
                {element.question}
              </label>
            )}
            {element.description && (
              <p className="text-gray-600 mb-4 text-sm">{element.description}</p>
            )}
            <div className={`space-y-3 ${element.optionLayout === 'grid' ? 'grid grid-cols-2 gap-3' : ''}`}>
              {element.options?.map((option: string, index: number) => {
                const buttonStyle = element.buttonStyle || 'rectangular';
                const baseClasses = "w-full p-4 border text-left transition-all duration-200 hover:bg-green-50 hover:border-green-500";
                const styleClasses = buttonStyle === 'rounded' ? 'rounded-lg' : 
                                  buttonStyle === 'pills' ? 'rounded-full' : 'rounded-md';
                
                return (
                  <button
                    key={index}
                    className={`${baseClasses} ${styleClasses} border-gray-300 bg-white`}
                  >
                    <div className="flex items-center">
                      {element.optionImages?.[index] && (
                        <img 
                          src={element.optionImages[index]} 
                          alt={option}
                          className="w-8 h-8 object-cover rounded mr-3"
                        />
                      )}
                      <span className="text-gray-700">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderTransitionPage = (page: any, pageIndex: number) => {
    // Buscar elemento de redirect se existir
    const redirectElement = page.elements.find((el: any) => el.type === 'transition_redirect');
    const loaderElement = page.elements.find((el: any) => el.type === 'transition_loader');
    
    // Verificar redirecionamento do elemento redirect
    if (redirectElement && redirectElement.redirectDelay) {
      setTimeout(() => {
        if (currentStep === pageIndex) {
          handleNext();
        }
      }, redirectElement.redirectDelay * 1000);
    }
    
    // Verificar redirecionamento do elemento loader
    if (loaderElement && loaderElement.redirectAction !== 'manual' && loaderElement.redirectDelay) {
      setTimeout(() => {
        if (currentStep === pageIndex) {
          if (loaderElement.redirectAction === 'custom_url' && loaderElement.redirectUrl) {
            window.open(loaderElement.redirectUrl, '_blank');
          } else {
            handleNext();
          }
        }
      }, loaderElement.redirectDelay * 1000);
    }

    // Buscar elementos de fundo
    const backgroundElement = page.elements.find((el: any) => el.type === 'transition_background');
    const textElement = page.elements.find((el: any) => el.type === 'transition_text');
    const counterElement = page.elements.find((el: any) => el.type === 'transition_counter');
    const loader = page.elements.find((el: any) => el.type === 'transition_loader');

    // Aplicar estilo de fundo
    let backgroundStyle: any = {};
    if (backgroundElement) {
      if (backgroundElement.backgroundType === 'solid') {
        backgroundStyle.backgroundColor = backgroundElement.backgroundColor || '#ffffff';
      } else if (backgroundElement.backgroundType === 'gradient') {
        const direction = backgroundElement.gradientDirection || 'to-r';
        const from = backgroundElement.gradientFrom || '#000000';
        const to = backgroundElement.gradientTo || '#ffffff';
        backgroundStyle.background = `linear-gradient(${direction.replace('to-', '')}, ${from}, ${to})`;
      } else if (backgroundElement.backgroundType === 'image' && backgroundElement.backgroundImage) {
        backgroundStyle.backgroundImage = `url(${backgroundElement.backgroundImage})`;
        backgroundStyle.backgroundSize = 'cover';
        backgroundStyle.backgroundPosition = 'center';
      }
    }

    return (
      <div 
        className="max-w-2xl mx-auto text-center min-h-[400px] flex flex-col justify-center"
        style={backgroundStyle}
      >
        {/* Texto de transição */}
        {textElement && textElement.content && (
          <h2 
            className="font-bold mb-6"
            style={{ 
              color: textElement.textColor || '#000000',
              fontSize: textElement.fontSize === 'xs' ? '1rem' :
                        textElement.fontSize === 'sm' ? '1.25rem' :
                        textElement.fontSize === 'base' ? '1.5rem' :
                        textElement.fontSize === 'lg' ? '2rem' :
                        textElement.fontSize === 'xl' ? '2.5rem' : '3rem',
              fontWeight: textElement.fontWeight || 'bold',
              textAlign: textElement.textAlign || 'center'
            }}
          >
            {textElement.content}
          </h2>
        )}

        {/* Contador */}
        {counterElement && (
          <AnimatedCounter element={counterElement} />
        )}

        {/* Loader */}
        {loader && (
          <div className="mb-6 flex justify-center">
            {loader.loaderType === 'spinner' && (
              <div 
                className={`animate-spin rounded-full border-4 border-t-transparent ${
                  loader.loaderSize === 'sm' ? 'w-8 h-8' :
                  loader.loaderSize === 'lg' ? 'w-16 h-16' : 'w-12 h-12'
                }`}
                style={{ 
                  borderColor: `${loader.loaderColor || '#10b981'} transparent transparent transparent`
                }}
              />
            )}
            
            {loader.loaderType === 'dots' && (
              <div className="flex space-x-2">
                {[0, 1, 2].map(i => (
                  <div 
                    key={i}
                    className={`animate-bounce rounded-full ${
                      loader.loaderSize === 'sm' ? 'w-2 h-2' :
                      loader.loaderSize === 'lg' ? 'w-4 h-4' : 'w-3 h-3'
                    }`}
                    style={{ 
                      backgroundColor: loader.loaderColor || '#10b981',
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            )}

            {loader.loaderType === 'bars' && (
              <div className="flex space-x-1 items-end">
                {[0, 1, 2, 3, 4].map(i => (
                  <div 
                    key={i}
                    className={`animate-pulse ${
                      loader.loaderSize === 'sm' ? 'w-1 h-6' :
                      loader.loaderSize === 'lg' ? 'w-2 h-12' : 'w-1.5 h-8'
                    }`}
                    style={{ 
                      backgroundColor: loader.loaderColor || '#10b981',
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            )}

            {loader.loaderType === 'pulse' && (
              <div 
                className={`animate-pulse rounded-full ${
                  loader.loaderSize === 'sm' ? 'w-8 h-8' :
                  loader.loaderSize === 'lg' ? 'w-16 h-16' : 'w-12 h-12'
                }`}
                style={{ backgroundColor: loader.loaderColor || '#10b981' }}
              />
            )}

            {loader.loaderType === 'ring' && (
              <div 
                className={`animate-spin rounded-full border-2 ${
                  loader.loaderSize === 'sm' ? 'w-8 h-8' :
                  loader.loaderSize === 'lg' ? 'w-16 h-16' : 'w-12 h-12'
                }`}
                style={{ 
                  borderColor: `${loader.loaderColor || '#10b981'}20`,
                  borderTopColor: loader.loaderColor || '#10b981'
                }}
              />
            )}
          </div>
        )}

        {/* Texto do loader alternado */}
        {loader && (loader.alternatingText1 || loader.alternatingText2 || loader.alternatingText3) && (
          <AlternatingText 
            texts={[
              loader.alternatingText1 && { text: loader.alternatingText1, duration: loader.alternatingDuration1 || 2 },
              loader.alternatingText2 && { text: loader.alternatingText2, duration: loader.alternatingDuration2 || 2 },
              loader.alternatingText3 && { text: loader.alternatingText3, duration: loader.alternatingDuration3 || 2 }
            ].filter(Boolean)}
            color={loader.textColor || '#666666'}
            fontSize={loader.fontSize || 'base'}
          />
        )}

        {/* Redirect com contador */}
        {redirectElement && (
          <RedirectComponent 
            element={redirectElement} 
            onRedirect={() => setCurrentStep(currentStep + 1)}
          />
        )}

        {/* Contador do loader */}
        {loader && loader.redirectAction !== 'manual' && loader.showRedirectCounter && (
          <div className="mt-6">
            <p className="text-sm text-gray-600">
              {loader.redirectAction === 'custom_url' 
                ? `Redirecionando para ${loader.redirectUrl || 'URL'} em ${loader.redirectDelay || 5} segundos...`
                : `Avançando em ${loader.redirectDelay || 5} segundos...`
              }
            </p>
          </div>
        )}

        {/* Fallback se não tiver elementos */}
        {!textElement && !counterElement && !loaderElement && !redirectElement && (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Página de Transição
            </h2>
            <p className="text-gray-600">
              Configure elementos de transição no editor
            </p>
          </div>
        )}

        {/* Botão de pular (opcional) */}
        {!redirectElement && (
          <div className="mt-8">
            <button 
              onClick={handleNext}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderInteractiveElement = (element: any, pageIndex: number) => {
    const isActive = currentStep === pageIndex;
    if (!isActive) return null;

    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {element.question || `Pergunta`}
          </h2>
          {element.description && (
            <p className="text-gray-600 text-lg">{element.description}</p>
          )}
        </div>

        <div className="space-y-3">
          {element.type === "multiple_choice" && element.options?.map((option: string, optionIndex: number) => (
            <Button
              key={optionIndex}
              variant={answers[element.id] === option ? "default" : "outline"}
              className="w-full justify-start text-left p-4 h-auto"
              onClick={() => {
                handleAnswer(element.id, option);
                setTimeout(handleNext, 300);
              }}
            >
              <div className={`w-4 h-4 rounded-full mr-3 ${
                answers[element.id] === option 
                  ? 'bg-white' 
                  : 'border-2 border-gray-300'
              }`} />
              {option}
            </Button>
          ))}

          {element.type === "text" && (
            <div className="space-y-4">
              <Input
                placeholder="Digite sua resposta..."
                value={answers[element.id] || ""}
                onChange={(e) => handleAnswer(element.id, e.target.value)}
                className="text-center"
              />
              <Button 
                onClick={handleNext}
                disabled={!answers[element.id]?.trim()}
              >
                Próxima <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {element.type === "rating" && (
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={answers[element.id] === rating ? "default" : "outline"}
                  className="w-12 h-12 rounded-full"
                  onClick={() => {
                    handleAnswer(element.id, rating);
                    setTimeout(handleNext, 300);
                  }}
                >
                  {rating}
                </Button>
              ))}
            </div>
          )}

          {(element.type === "email" || element.type === "phone" || element.type === "number") && (
            <div className="space-y-4">
              <Input
                type={element.type === "email" ? "email" : element.type === "phone" ? "tel" : "number"}
                placeholder={element.placeholder || `Digite ${element.type === "email" ? "seu email" : element.type === "phone" ? "seu telefone" : "um número"}...`}
                value={answers[element.id] || ""}
                onChange={(e) => handleAnswer(element.id, e.target.value)}
                className="text-center"
              />
              <Button 
                onClick={handleNext}
                disabled={element.required && !answers[element.id]?.toString().trim()}
              >
                Próxima <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {element.type === "date" && (
            <div className="space-y-4">
              <Input
                type="date"
                value={answers[element.id] || ""}
                onChange={(e) => handleAnswer(element.id, e.target.value)}
                className="text-center"
              />
              <Button 
                onClick={handleNext}
                disabled={element.required && !answers[element.id]}
              >
                Próxima <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {element.type === "birth_date" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎂</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800">Data de Nascimento</h3>
                    <p className="text-sm text-blue-600">Para cálculo automático da idade</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <Input
                    type="date"
                    value={answers[element.id] || ""}
                    onChange={(e) => {
                      handleAnswer(element.id, e.target.value);
                      // Auto-avançar após 1 segundo
                      setTimeout(() => handleNext(), 1000);
                    }}
                    className="text-center text-lg font-semibold"
                    style={{ fontSize: '18px' }}
                  />
                </div>
                
                {element.showAgeCalculation && answers[element.id] && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-green-800">
                        🎯 Idade calculada: {Math.floor((new Date().getTime() - new Date(answers[element.id]).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} anos
                      </span>
                    </div>
                    <div className="text-xs text-green-700">
                      Idade calculada automaticamente para análise personalizada
                    </div>
                  </div>
                )}
                
                {!element.showAgeCalculation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-700">
                      Data de nascimento coletada para análise demográfica
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {element.type === "height" && (
            <div className="space-y-4">
              <div className="bg-purple-50 border-2 border-dashed border-purple-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <ArrowUpDown className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-800">Altura</h3>
                    <p className="text-sm text-purple-600">Para cálculo do IMC</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={element.placeholder || (element.unit === "cm" ? "175" : "1.75")}
                        value={answers[element.id] || ""}
                        onChange={(e) => handleAnswer(element.id, e.target.value)}
                        className="text-center text-lg font-semibold pr-12"
                        min={element.unit === "cm" ? "120" : "1.20"}
                        max={element.unit === "cm" ? "220" : "2.20"}
                        style={{ fontSize: '18px' }}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        {element.unit || "cm"}
                      </span>
                    </div>
                    
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xs text-purple-600 font-semibold mt-1">
                          {element.unit === "cm" ? "CM" : "M"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Altura para cálculo do IMC</span>
                  </div>
                  <div className="text-xs text-purple-700">
                    Esta altura será usada para calcular automaticamente o IMC quando combinada com o peso
                  </div>
                </div>
              </div>
            </div>
          )}

          {element.type === "current_weight" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Scale className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800">Peso Atual</h3>
                    <p className="text-sm text-blue-600">Peso corporal atual</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <Input
                        type="number"
                        step="0.1"
                        placeholder={element.placeholder || "70.5"}
                        value={answers[element.id] || ""}
                        onChange={(e) => handleAnswer(element.id, e.target.value)}
                        className="text-center text-lg font-semibold pr-12"
                        min="30"
                        max="300"
                        style={{ fontSize: '18px' }}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        kg
                      </span>
                    </div>
                    
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xs text-blue-600 font-semibold">PESO</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {element.showBMICalculation && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Cálculo do IMC habilitado</span>
                    </div>
                    <div className="text-xs text-green-700">
                      Quando combinado com a altura, calculará automaticamente seu IMC
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {element.type === "target_weight" && (
            <div className="space-y-4">
              <div className="bg-orange-50 border-2 border-dashed border-orange-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-800">Peso Objetivo</h3>
                    <p className="text-sm text-orange-600">Meta de peso desejada</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <Input
                        type="number"
                        step="0.1"
                        placeholder={element.placeholder || "65.0"}
                        value={answers[element.id] || ""}
                        onChange={(e) => handleAnswer(element.id, e.target.value)}
                        className="text-center text-lg font-semibold pr-12"
                        min="30"
                        max="300"
                        style={{ fontSize: '18px' }}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        kg
                      </span>
                    </div>
                    
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xs text-orange-600 font-semibold">META</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Objetivo de perda/ganho de peso</span>
                  </div>
                  <div className="text-xs text-orange-700">
                    Diferença será calculada automaticamente quando comparado com o peso atual
                  </div>
                </div>
              </div>
            </div>
          )}

          {element.type === "textarea" && (
            <div className="space-y-4">
              <textarea
                placeholder={element.placeholder || "Digite sua resposta..."}
                value={answers[element.id] || ""}
                onChange={(e) => handleAnswer(element.id, e.target.value)}
                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button 
                onClick={handleNext}
                disabled={element.required && !answers[element.id]?.toString().trim()}
              >
                Próxima <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {element.type === "checkbox" && element.options?.map((option: string, optionIndex: number) => (
            <div key={optionIndex} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                id={`${element.id}-${optionIndex}`}
                checked={answers[element.id]?.includes(option) || false}
                onChange={(e) => {
                  const currentAnswers = answers[element.id] || [];
                  const newAnswers = e.target.checked
                    ? [...currentAnswers, option]
                    : currentAnswers.filter((a: string) => a !== option);
                  handleAnswer(element.id, newAnswers);
                }}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor={`${element.id}-${optionIndex}`} className="text-left flex-1 cursor-pointer">
                {option}
              </label>
            </div>
          ))}

          {element.type === "checkbox" && (
            <div className="mt-4">
              <Button 
                onClick={handleNext}
                disabled={element.required && (!answers[element.id] || answers[element.id].length === 0)}
              >
                Próxima <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Elementos de Jogos */}
          {element.type === "game_wheel" && (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-60 h-60 relative">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {(element.wheelSegments || ["Prêmio 1", "Prêmio 2", "Prêmio 3", "Prêmio 4"]).map((segment, index) => {
                      const total = element.wheelSegments?.length || 4;
                      const angle = 360 / total;
                      const startAngle = index * angle;
                      const endAngle = startAngle + angle;
                      const isWinning = index === (element.wheelWinningSegment || 0);
                      
                      return (
                        <g key={index}>
                          <path
                            d={`M 100 100 L ${100 + 80 * Math.cos((startAngle * Math.PI) / 180)} ${100 + 80 * Math.sin((startAngle * Math.PI) / 180)} A 80 80 0 ${angle > 180 ? 1 : 0} 1 ${100 + 80 * Math.cos((endAngle * Math.PI) / 180)} ${100 + 80 * Math.sin((endAngle * Math.PI) / 180)} Z`}
                            fill={isWinning ? "#FFD700" : (element.wheelColors?.[index] || "#4ECDC4")}
                            stroke={isWinning ? "#fbbf24" : "#ffffff"}
                            strokeWidth={isWinning ? "3" : "2"}
                          />
                          <text
                            x={100 + 50 * Math.cos(((startAngle + endAngle) / 2 * Math.PI) / 180)}
                            y={100 + 50 * Math.sin(((startAngle + endAngle) / 2 * Math.PI) / 180)}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="10"
                            fill="white"
                            fontWeight="bold"
                          >
                            {segment.length > 8 ? segment.substring(0, 8) + "..." : segment}
                          </text>
                        </g>
                      );
                    })}
                    <polygon
                      points="100,20 105,35 95,35"
                      fill={element.wheelPointerColor || "#DC2626"}
                    />
                  </svg>
                </div>
              </div>
              
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => {
                  handleAnswer(element.id, "girado");
                  setTimeout(handleNext, 1000);
                }}
              >
                🎰 Girar Roleta
              </Button>
            </div>
          )}

          {element.type === "game_scratch" && (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative w-64 h-40 border-2 border-gray-300 rounded-lg overflow-hidden">
                  <div 
                    className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-green-600 cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: element.scratchCoverColor || "#e5e7eb" }}
                    onClick={() => {
                      handleAnswer(element.id, "raspado");
                      setTimeout(handleNext, 500);
                    }}
                  >
                    {element.scratchRevealText || "PARABÉNS!"}
                  </div>
                  <div className="absolute top-4 left-4 text-xs text-gray-600">
                    ↑ Clique para raspar
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={() => {
                  handleAnswer(element.id, "raspado");
                  setTimeout(handleNext, 500);
                }}
              >
                🎫 Raspar Cartela
              </Button>
            </div>
          )}

          {element.type === "game_color_pick" && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h4 className="font-medium text-gray-800 mb-4">
                  {element.colorInstruction || "Escolha a cor da sorte!"}
                </h4>
                
                <div className="grid grid-cols-3 gap-3 justify-center max-w-sm mx-auto">
                  {(element.colorOptions || ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57"]).map((color, index) => (
                    <button
                      key={index}
                      className="w-16 h-16 rounded-full border-4 border-gray-300 hover:border-yellow-400 transition-all hover:scale-105"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        handleAnswer(element.id, color);
                        setTimeout(handleNext, 500);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {element.type === "game_memory_cards" && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h4 className="font-medium text-gray-800 mb-4">
                  Jogo da Memória - Encontre os pares!
                </h4>
                
                <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
                  {Array.from({ length: (element.memoryCardPairs || 4) * 2 }, (_, index) => (
                    <div
                      key={index}
                      className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors"
                      onClick={() => {
                        if (index === 0) {
                          handleAnswer(element.id, "completado");
                          setTimeout(handleNext, 1000);
                        }
                      }}
                    >
                      <span className="text-white font-bold">?</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => {
                  handleAnswer(element.id, "completado");
                  setTimeout(handleNext, 1000);
                }}
              >
                🧠 Começar Jogo
              </Button>
            </div>
          )}

          {element.type === "game_slot_machine" && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h4 className="font-medium text-gray-800 mb-4">
                  Máquina Caça-Níqueis
                </h4>
                
                <div className="flex justify-center space-x-2 mb-4">
                  {Array.from({ length: element.slotReels || 3 }, (_, index) => (
                    <div key={index} className="w-16 h-16 border-2 border-gray-400 rounded-lg bg-white flex items-center justify-center">
                      <span className="text-2xl">🎰</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button 
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                onClick={() => {
                  handleAnswer(element.id, "jogado");
                  setTimeout(handleNext, 1000);
                }}
              >
                🎰 Puxar Alavanca
              </Button>
            </div>
          )}

          {element.type === "game_brick_break" && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h4 className="font-medium text-gray-800 mb-4">
                  Quebra Tijolos
                </h4>
                
                <div className="relative bg-black rounded-lg p-4 mx-auto max-w-sm">
                  <div className="grid grid-cols-6 gap-1 mb-4">
                    {Array.from({ length: (element.brickRows || 3) * (element.brickColumns || 6) }, (_, index) => (
                      <div
                        key={index}
                        className="w-6 h-3 rounded-sm"
                        style={{ backgroundColor: element.brickColors?.[index % (element.brickColors?.length || 1)] || "#FF6B6B" }}
                      />
                    ))}
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="w-12 h-2 rounded-full" style={{ backgroundColor: element.paddleColor || "#4ECDC4" }} />
                  </div>
                  
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: element.ballColor || "#FFD700" }} />
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full bg-red-500 hover:bg-red-600 text-white"
                onClick={() => {
                  handleAnswer(element.id, "jogado");
                  setTimeout(handleNext, 1000);
                }}
              >
                🧱 Começar Jogo
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLeadCapture = () => {
    const isActive = currentStep === allPages.length;
    if (!isActive) return null;

    return (
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quase lá!
          </h2>
          <p className="text-gray-600">
            Para ver seus resultados personalizados, precisamos de algumas informações:
          </p>
        </div>

        <div className="space-y-4">
          {settings.collectName && (
            <div>
              <Label htmlFor="name">Nome</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={leadData.name}
                  onChange={(e) => setLeadData(prev => ({ ...prev, name: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {settings.collectEmail && (
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={leadData.email}
                  onChange={(e) => setLeadData(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {settings.collectPhone && (
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={leadData.phone}
                  onChange={(e) => setLeadData(prev => ({ ...prev, phone: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <Button 
            className="w-full" 
            onClick={handleNext}
            disabled={
              (settings.collectEmail && !leadData.email) ||
              (settings.collectName && !leadData.name)
            }
          >
            Ver Meus Resultados
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    const isActive = currentStep === totalSteps - 1;
    if (!isActive) return null;

    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Obrigado por participar!
          </h2>
          <p className="text-gray-600 text-lg">
            Suas respostas foram registradas com sucesso. Em breve você receberá seus resultados personalizados por email.
          </p>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Próximos Passos:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Verifique seu email para resultados detalhados</li>
              <li>• Nossa equipe entrará em contato em até 24h</li>
              <li>• Siga-nos nas redes sociais para dicas exclusivas</li>
            </ul>
          </CardContent>
        </Card>

        <Button className="mt-6" onClick={() => {
          setCurrentStep(0);
          setAnswers({});
          setLeadData({ name: "", email: "", phone: "" });
        }}>
          Refazer Quiz
        </Button>
      </div>
    );
  };

  return (
    <div 
      className={`min-h-screen py-12 ${isTransitionPage ? '' : 'bg-gray-50'}`}
      style={isTransitionPage ? getPageBackgroundStyle() : {}}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {!isTransitionPage && (
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {quiz.title || "Preview do Quiz"}
            </h1>
            {quiz.description && (
              <p className="text-gray-600 text-lg">{quiz.description}</p>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {settings.showProgressBar && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Etapa {currentStep + 1} de {totalSteps}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(progress)}% completo
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Quiz Content */}
        <Card className="min-h-[400px]">
          <CardContent className="p-8 flex items-center justify-center">
            {/* Pages */}
            {allPages.map((page, index) => (
              <div key={page.id || index}>
                {renderPage(page, index)}
              </div>
            ))}
            
            {/* Lead Capture */}
            {renderLeadCapture()}
            
            {/* Result */}
            {renderResult()}

            {/* Empty State */}
            {allPages.length === 0 && currentStep === 0 && (
              <div className="text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Quiz Vazio</h3>
                <p>Adicione páginas no editor para ver o preview</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        {allPages.length > 0 && currentStep < totalSteps - 1 && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            
            <Badge variant="outline">
              {currentStep < allPages.length ? "Página" : currentStep === allPages.length ? "Captura" : "Resultado"}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente específico para elemento "Carregamento + Pergunta"
const LoadingQuestionElement = ({ element, onAnswer }: { 
  element: any, 
  onAnswer: (answer: string) => void 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [loadingText, setLoadingText] = useState(element.loadingText || "Carregando...");

  const loadingDuration = (element.loadingDuration || 3) * 1000; // converter para ms
  const barColor = element.loadingBarColor || "#10B981";
  const barWidth = element.loadingBarWidth || "medium";
  const popupQuestion = element.popupQuestion || "Você gostaria de continuar?";
  const yesText = element.popupYesText || "Sim";
  const noText = element.popupNoText || "Não";

  // Classes para largura da barra
  const barWidthClasses = {
    thin: "h-2",
    medium: "h-4", 
    thick: "h-6"
  };

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    if (isLoading) {
      const incrementValue = 100 / (loadingDuration / 50); // atualizar a cada 50ms
      
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + incrementValue;
          
          if (newProgress >= 100) {
            setIsLoading(false);
            setShowPopup(true);
            return 100;
          }
          
          return newProgress;
        });
      }, 50);
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [isLoading, loadingDuration]);

  const handlePopupAnswer = (answer: "sim" | "não") => {
    setShowPopup(false);
    onAnswer(answer);
  };

  return (
    <div className="mb-6">
      {/* Barra de Carregamento */}
      {isLoading && (
        <div className="text-center">
          <div className="mb-4">
            <p className="text-lg font-medium text-gray-700 mb-4">
              {processVariables(loadingText)}
            </p>
            
            <div className={`w-full bg-gray-200 rounded-full ${barWidthClasses[barWidth as keyof typeof barWidthClasses]} mx-auto max-w-md`}>
              <div 
                className={`${barWidthClasses[barWidth as keyof typeof barWidthClasses]} rounded-full transition-all duration-100 ease-out`}
                style={{
                  width: `${progress}%`,
                  backgroundColor: barColor
                }}
              />
            </div>
            
            <div className="mt-2 text-sm text-gray-500">
              {Math.round(progress)}%
            </div>
          </div>
        </div>
      )}

      {/* Popup de Pergunta */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {processVariables(popupQuestion)}
                </h3>
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => handlePopupAnswer("sim")}
                  className="px-6 py-2"
                  style={{ backgroundColor: barColor }}
                >
                  {yesText}
                </Button>
                
                <Button
                  onClick={() => handlePopupAnswer("não")}
                  variant="outline"
                  className="px-6 py-2"
                >
                  {noText}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estado após resposta */}
      {!isLoading && !showPopup && (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-green-700 font-medium">
            Resposta registrada!
          </p>
        </div>
      )}
    </div>
  );
};
