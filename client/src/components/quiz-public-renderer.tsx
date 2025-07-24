import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, CheckCircle, Calendar, Star, Target, Scale, ArrowUpDown, Share2, Loader2, BarChart3, TrendingUp, PlayCircle, Shield, Award, Heart, Lock, Zap, Trophy, Gift, ChevronDown } from "lucide-react";
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

// Componente AdvancedCarousel com funcionalidades completas
const AdvancedCarousel = ({ id, properties }: { id: string, properties: any }) => {
  const carouselImages = properties.carouselImages || [
    { id: "img-1", url: "https://via.placeholder.com/600x300/10b981/white?text=Imagem+1", alt: "Imagem 1", caption: "Primeira imagem do carrossel", title: "Título da Imagem 1" },
    { id: "img-2", url: "https://via.placeholder.com/600x300/3b82f6/white?text=Imagem+2", alt: "Imagem 2", caption: "Segunda imagem do carrossel", title: "Título da Imagem 2" },
    { id: "img-3", url: "https://via.placeholder.com/600x300/8b5cf6/white?text=Imagem+3", alt: "Imagem 3", caption: "Terceira imagem do carrossel", title: "Título da Imagem 3" }
  ];

  // Estados para o carrossel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Configurações do carrossel
  const carouselHeight = properties.carouselHeight || "medium";
  const carouselBorderRadius = properties.carouselBorderRadius || "lg";
  const carouselTransition = properties.carouselTransition || "slide";
  const carouselSpeed = properties.carouselSpeed || "normal";
  const carouselAutoplay = properties.carouselAutoplay || false;
  const carouselAutoplayInterval = properties.carouselAutoplayInterval || 3;
  const carouselShowArrows = properties.carouselShowArrows !== false;
  const carouselShowDots = properties.carouselShowDots !== false;
  const carouselInfinite = properties.carouselInfinite !== false;
  const carouselTheme = properties.carouselTheme || "default";
  const carouselImageFit = properties.carouselImageFit || "cover";
  const carouselArrowStyle = properties.carouselArrowStyle || "simple";
  const carouselDotStyle = properties.carouselDotStyle || "dots";
  const carouselShowThumbnails = properties.carouselShowThumbnails || false;
  const carouselShowProgress = properties.carouselShowProgress || false;
  const carouselPauseOnHover = properties.carouselPauseOnHover !== false;
  const carouselSwipeEnabled = properties.carouselSwipeEnabled !== false;
  const carouselKeyboardNav = properties.carouselKeyboardNav !== false;
  const carouselSlidesToShow = properties.carouselSlidesToShow || 1;

  // Classes e estilos
  const heightClasses = {
    small: "h-48",
    medium: "h-72", 
    large: "h-96",
    xlarge: "h-[500px]"
  };

  const borderRadiusClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md", 
    lg: "rounded-lg",
    xl: "rounded-xl"
  };

  const speedDurations = {
    slow: 1000,
    normal: 500,
    fast: 300,
    instant: 100
  };

  const imageFitClasses = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill"
  };

  // Temas
  const themeStyles = {
    default: {
      container: "bg-gray-100",
      arrows: "bg-black/50 hover:bg-black/70 text-white",
      dots: "bg-gray-300 hover:bg-gray-400",
      activeDot: "bg-blue-500"
    },
    dark: {
      container: "bg-gray-900",
      arrows: "bg-white/20 hover:bg-white/40 text-white",
      dots: "bg-gray-600 hover:bg-gray-500",
      activeDot: "bg-white"
    },
    minimal: {
      container: "bg-white",
      arrows: "bg-gray-200 hover:bg-gray-300 text-gray-700",
      dots: "bg-gray-200 hover:bg-gray-300",
      activeDot: "bg-gray-700"
    },
    colorful: {
      container: "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500",
      arrows: "bg-white/80 hover:bg-white text-gray-800",
      dots: "bg-white/60 hover:bg-white/80",
      activeDot: "bg-white"
    }
  };

  const currentTheme = themeStyles[carouselTheme as keyof typeof themeStyles] || themeStyles.default;

  // Funções de navegação
  const nextImage = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentImageIndex(prev => {
        if (carouselInfinite) {
          return (prev + 1) % carouselImages.length;
        } else {
          return prev < carouselImages.length - 1 ? prev + 1 : prev;
        }
      });
      setIsTransitioning(false);
    }, 50);
  }, [isTransitioning, carouselInfinite, carouselImages.length]);

  const prevImage = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentImageIndex(prev => {
        if (carouselInfinite) {
          return prev === 0 ? carouselImages.length - 1 : prev - 1;
        } else {
          return prev > 0 ? prev - 1 : prev;
        }
      });
      setIsTransitioning(false);
    }, 50);
  }, [isTransitioning, carouselInfinite, carouselImages.length]);

  const goToImage = useCallback((index: number) => {
    if (isTransitioning || index === currentImageIndex) return;
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentImageIndex(index);
      setIsTransitioning(false);
    }, 50);
  }, [isTransitioning, currentImageIndex]);

  // Autoplay
  useEffect(() => {
    if (carouselAutoplay && carouselImages.length > 1 && !isPaused) {
      intervalRef.current = setInterval(() => {
        nextImage();
      }, carouselAutoplayInterval * 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [carouselAutoplay, carouselAutoplayInterval, currentImageIndex, isPaused, nextImage, carouselImages.length]);

  // Controle por teclado
  useEffect(() => {
    if (!carouselKeyboardNav) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [carouselKeyboardNav, prevImage, nextImage]);

  // Touch/Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!carouselSwipeEnabled) return;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!carouselSwipeEnabled) return;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!carouselSwipeEnabled || !touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextImage();
    }
    if (isRightSwipe) {
      prevImage();
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Pausar/Retomar no hover
  const handleMouseEnter = () => {
    if (carouselPauseOnHover && carouselAutoplay) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (carouselPauseOnHover && carouselAutoplay) {
      setIsPaused(false);
    }
  };

  // Estilos de transição
  const getTransitionStyles = () => {
    const duration = speedDurations[carouselSpeed as keyof typeof speedDurations];
    
    switch (carouselTransition) {
      case "fade":
        return {
          opacity: isTransitioning ? 0 : 1,
          transition: `opacity ${duration}ms ease-in-out`
        };
      case "zoom":
        return {
          transform: isTransitioning ? "scale(1.1)" : "scale(1)",
          opacity: isTransitioning ? 0 : 1,
          transition: `all ${duration}ms ease-in-out`
        };
      case "flip":
        return {
          transform: isTransitioning ? "rotateY(90deg)" : "rotateY(0deg)",
          transition: `transform ${duration}ms ease-in-out`
        };
      case "slide":
      default:
        return {
          transform: `translateX(-${currentImageIndex * (100 / carouselSlidesToShow)}%)`,
          transition: `transform ${duration}ms ease-in-out`
        };
    }
  };

  const currentImage = carouselImages[currentImageIndex];

  // Estilos das setas baseados no estilo escolhido
  const getArrowClasses = () => {
    const baseClasses = `absolute top-1/2 -translate-y-1/2 ${currentTheme.arrows} p-2 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed`;
    
    switch (carouselArrowStyle) {
      case "rounded":
        return `${baseClasses} rounded-full`;
      case "square":
        return `${baseClasses} rounded-none`;
      case "simple":
      default:
        return `${baseClasses} rounded`;
    }
  };

  // Estilos dos indicadores
  const getDotClasses = (index: number, isActive: boolean) => {
    const baseClasses = "transition-all duration-200";
    const activeClasses = isActive ? `${currentTheme.activeDot} scale-110` : `${currentTheme.dots}`;
    
    switch (carouselDotStyle) {
      case "lines":
        return `${baseClasses} ${activeClasses} h-1 ${isActive ? 'w-8' : 'w-4'} rounded-full`;
      case "squares":
        return `${baseClasses} ${activeClasses} w-3 h-3 rounded-sm`;
      case "dots":
      default:
        return `${baseClasses} ${activeClasses} w-3 h-3 rounded-full`;
    }
  };

  return (
    <div 
      className="w-full space-y-4"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`relative overflow-hidden ${heightClasses[carouselHeight as keyof typeof heightClasses]} ${borderRadiusClasses[carouselBorderRadius as keyof typeof borderRadiusClasses]} ${currentTheme.container}`}>
        
        {/* Barra de Progresso */}
        {carouselShowProgress && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-black/20 z-10">
            <div 
              className={`h-full ${currentTheme.activeDot} transition-all duration-300`}
              style={{ 
                width: `${((currentImageIndex + 1) / carouselImages.length) * 100}%` 
              }}
            />
          </div>
        )}

        {/* Container das imagens */}
        {carouselTransition === "slide" ? (
          <div 
            className="flex h-full"
            style={getTransitionStyles()}
          >
            {carouselImages.map((image: any, index: number) => (
              <div
                key={image.id || index}
                className={`${carouselSlidesToShow === 1 ? 'w-full' : `w-1/${carouselSlidesToShow}`} h-full flex-shrink-0 relative`}
              >
                <img 
                  src={image.url} 
                  alt={image.alt || `Imagem ${index + 1}`}
                  className={`w-full h-full ${imageFitClasses[carouselImageFit as keyof typeof imageFitClasses]}`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://via.placeholder.com/600x300/6b7280/white?text=Erro+ao+Carregar`;
                  }}
                />
                
                {/* Overlay com título e legenda */}
                {(image.title || image.caption) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    {image.title && (
                      <h4 className="text-white font-bold text-lg mb-1">
                        {image.title}
                      </h4>
                    )}
                    {image.caption && (
                      <p className="text-white/90 text-sm">
                        {image.caption}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Para outros tipos de transição (fade, zoom, flip)
          <div className="relative w-full h-full">
            <img 
              src={currentImage.url} 
              alt={currentImage.alt || `Imagem ${currentImageIndex + 1}`}
              className={`w-full h-full ${imageFitClasses[carouselImageFit as keyof typeof imageFitClasses]}`}
              style={getTransitionStyles()}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://via.placeholder.com/600x300/6b7280/white?text=Erro+ao+Carregar`;
              }}
            />
            
            {/* Overlay com título e legenda */}
            {(currentImage.title || currentImage.caption) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                {currentImage.title && (
                  <h4 className="text-white font-bold text-lg mb-1">
                    {currentImage.title}
                  </h4>
                )}
                {currentImage.caption && (
                  <p className="text-white/90 text-sm">
                    {currentImage.caption}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Setas de navegação */}
        {carouselShowArrows && carouselImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              disabled={!carouselInfinite && currentImageIndex === 0}
              className={`${getArrowClasses()} left-2`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={nextImage}
              disabled={!carouselInfinite && currentImageIndex === carouselImages.length - 1}
              className={`${getArrowClasses()} right-2`}
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Contador de imagens */}
        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
          {currentImageIndex + 1} / {carouselImages.length}
        </div>
      </div>

      {/* Miniaturas */}
      {carouselShowThumbnails && carouselImages.length > 1 && (
        <div className="flex justify-center space-x-2 overflow-x-auto pb-2">
          {carouselImages.map((image: any, index: number) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all duration-200 ${
                index === currentImageIndex 
                  ? `border-blue-500 opacity-100` 
                  : 'border-gray-300 opacity-70 hover:opacity-100'
              }`}
            >
              <img 
                src={image.url} 
                alt={`Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://via.placeholder.com/64x48/6b7280/white?text=${index + 1}`;
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Indicadores (pontinhos) */}
      {carouselShowDots && carouselImages.length > 1 && (
        <div className="flex justify-center space-x-2">
          {carouselImages.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={getDotClasses(index, index === currentImageIndex)}
            />
          ))}
        </div>
      )}

      {/* Informações da imagem atual */}
      {currentImage && (currentImage.title || currentImage.caption) && (
        <div className="text-center space-y-1">
          {currentImage.title && (
            <h3 className="font-semibold text-lg text-gray-800">
              {currentImage.title}
            </h3>
          )}
          {currentImage.caption && (
            <p className="text-gray-600 text-sm max-w-2xl mx-auto">
              {currentImage.caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

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
      pageBackground?: string;
      customBackgroundColor?: string;
    };
    backRedirectEnabled?: boolean;
    backRedirectUrl?: string;
    backRedirectDelay?: number;
  };
}

// Funções para aplicar fundo de página
const getPageBackgroundStyle = (quiz: QuizPublicRendererProps['quiz']) => {
  if (!quiz?.design?.pageBackground) {
    return { backgroundColor: '#ffffff', color: '#000000' };
  }

  const { pageBackground, customBackgroundColor } = quiz.design;
  
  switch (pageBackground) {
    case 'white':
      return { backgroundColor: '#ffffff', color: '#000000' };
    case 'black':
      return { backgroundColor: '#000000', color: '#ffffff' };
    case 'custom':
      if (customBackgroundColor) {
        const isLight = isLightColor(customBackgroundColor);
        return { 
          backgroundColor: customBackgroundColor, 
          color: isLight ? '#000000' : '#ffffff' 
        };
      }
      return { backgroundColor: '#ffffff', color: '#000000' };
    default:
      return { backgroundColor: '#ffffff', color: '#000000' };
  }
};

// Função para determinar se uma cor é clara
const isLightColor = (color: string): boolean => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness > 128;
};

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
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
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
          
          // Iniciar redirecionamento se habilitado
          if (properties.progressEnableRedirect) {
            const delay = properties.progressRedirectDelay || 5;
            setRedirectCountdown(delay);
            
            const countdownTimer = setInterval(() => {
              setRedirectCountdown((prev) => {
                if (prev === null || prev <= 1) {
                  clearInterval(countdownTimer);
                  
                  // Executar redirecionamento
                  if (properties.progressRedirectType === "custom_url" && properties.progressRedirectUrl) {
                    window.location.href = properties.progressRedirectUrl;
                  } else {
                    // Redirecionamento para próxima página
                    const nextPageEvent = new CustomEvent('goToNextPage');
                    window.dispatchEvent(nextPageEvent);
                  }
                  
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
            
            return () => clearInterval(countdownTimer);
          }
          
          return 100;
        }
        return prev + 1;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [properties.progressDuration, properties.progressEnableRedirect, properties.progressRedirectDelay, properties.progressRedirectType, properties.progressRedirectUrl]);
  
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
      
      <div 
        className="w-full rounded-full" 
        style={{ 
          height: properties.progressHeight || 8,
          backgroundColor: properties.progressBackgroundColor || "#e5e7eb"
        }}
      >
        <div 
          className="h-full transition-all duration-100"
          style={{ 
            width: `${progress}%`,
            backgroundColor: properties.progressColor || "#3b82f6",
            borderRadius: properties.progressStyle === "squared" ? "0" : 
                         properties.progressStyle === "pill" ? "50px" : "4px"
          }}
        />
      </div>
      
      {isComplete && !redirectCountdown && (
        <div className="text-center text-green-600 font-medium">
          ✓ Completo!
        </div>
      )}
      
      {redirectCountdown && redirectCountdown > 0 && (
        <div className="text-center space-y-2">
          <div className="text-green-600 font-medium">
            ✓ Completo!
          </div>
          <div className="text-sm text-blue-600">
            {properties.progressRedirectType === "custom_url" 
              ? `Redirecionando para URL em ${redirectCountdown}s...`
              : `Seguindo para próxima página em ${redirectCountdown}s...`
            }
          </div>
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
    // 🔥 SILENT RESPONSE - Não mostrar "resposta registrada"
  };
  
  return (
    <div className="w-full space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
      {!showQuestion && (
        <div className="space-y-3">
          {properties.loadingText && (
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-800">
                {properties.loadingText}
              </h4>
            </div>
          )}
          <div className="flex items-center justify-between">
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
  const [hoveredStars, setHoveredStars] = useState<Record<string, number | null>>({});
  const [expandedFaqs, setExpandedFaqs] = useState<Record<string, boolean>>({});

  const pages = quiz.structure.pages || [];
  const currentPage = pages[currentPageIndex];
  const isLastPage = currentPageIndex === pages.length - 1;

  // Função para salvar dados antes de sair da página
  const saveCurrentPageData = async () => {
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }

    // Salvar imediatamente os dados da página atual com validação mais flexível
    const currentResponses = quizResponses.filter(r => r.pageId === currentPage.id);
    const validResponses = currentResponses.filter(r => {
      // Para telefones, aceitar se tiver pelo menos 8 dígitos para não perder dados parciais válidos
      if (r.elementType === 'phone' && r.answer) {
        const phoneNumber = r.answer.replace(/\D/g, '');
        return phoneNumber.length >= 8 && phoneNumber.length <= 15 && /^\d+$/.test(phoneNumber);
      }
      // Para emails, aceitar se tiver @ e pelo menos 5 caracteres
      if (r.elementType === 'email' && r.answer) {
        return r.answer.includes('@') && r.answer.length >= 5;
      }
      // Para outros campos, salvar se não estiver vazio
      return r.answer && r.answer.toString().trim().length > 0;
    });

    if (validResponses.length > 0) {
      try {
        await fetch(`/api/quizzes/${quiz.id}/partial-responses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            responses: validResponses,
            isPartial: true,
            pageTransition: true // Flag para indicar que é uma transição de página
          })
        });
        console.log('Dados da página salvos antes da transição:', validResponses.length, 'campos');
      } catch (error) {
        console.error('Erro ao salvar dados da página:', error);
      }
    }
  };

  // Função para avançar para próxima página
  const goToNextPage = async () => {
    // Salvar dados da página atual antes de avançar
    await saveCurrentPageData();
    
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      // Limpar respostas da página atual quando avançar
      setAnswers({});
    } else {
      // Finalizar quiz
      setShowResults(true);
    }
  };

  // Função para voltar para página anterior
  const goToPreviousPage = async () => {
    // Salvar dados da página atual antes de voltar
    await saveCurrentPageData();
    
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      // Limpar respostas da página atual quando voltar
      setAnswers({});
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
        
        // Delay diferenciado: telefones precisam de mais tempo para evitar fragmentação
        const hasPhoneResponse = updated.some(r => r.elementType === 'phone');
        const saveDelay = hasPhoneResponse ? 3500 : 2000; // 3.5s para telefones, 2s para outros
        
        autoSaveRef.current = setTimeout(async () => {
          try {
            // Filtrar apenas campos completos/válidos para salvar
            const validResponses = updated.filter(r => {
              // Para telefones, validação rigorosa para evitar fragmentação
              if (r.elementType === 'phone' && r.answer) {
                const phoneNumber = r.answer.replace(/\D/g, '');
                // Só salvar se tiver entre 10-15 dígitos E não for fragmentado
                return phoneNumber.length >= 10 && 
                       phoneNumber.length <= 15 && 
                       phoneNumber.length > 8 && // Evita números muito curtos
                       /^\d+$/.test(phoneNumber); // Só números
              }
              // Para emails, validação mais robusta contra fragmentação
              if (r.elementType === 'email' && r.answer) {
                const email = r.answer.trim().toLowerCase();
                // Validação rigorosa: deve ter @, domínio válido e pelo menos 7 caracteres
                return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email) && 
                       email.length >= 7 && 
                       email.length <= 254; // RFC 5321 limit
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
        }, saveDelay); // Delay diferenciado baseado no tipo de campo
        
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
        const targetWeightUnit = properties?.weightUnit || "kg";
        const targetLabelStyle = properties?.fontSize === 'xs' ? 'text-xs' : 
                                properties?.fontSize === 'sm' ? 'text-sm' : 
                                properties?.fontSize === 'lg' ? 'text-lg' : 
                                properties?.fontSize === 'xl' ? 'text-xl' : 'text-base';
        const targetFontWeight = properties?.fontWeight === 'light' ? 'font-light' :
                                properties?.fontWeight === 'medium' ? 'font-medium' :
                                properties?.fontWeight === 'semibold' ? 'font-semibold' :
                                properties?.fontWeight === 'bold' ? 'font-bold' : 'font-normal';
        const targetTextAlign = properties?.textAlign === 'center' ? 'text-center' :
                               properties?.textAlign === 'right' ? 'text-right' : 'text-left';
        
        return (
          <div 
            key={id} 
            className="space-y-4"
            style={{ width: properties?.width || "100%" }}
          >
            <div className="bg-white rounded-lg p-4 shadow-sm" style={{ width: properties?.width || "100%" }}>
              <label className={`block mb-2 ${targetLabelStyle} ${targetFontWeight} ${targetTextAlign} text-gray-700`}>
                {properties?.question || "Qual é seu peso objetivo?"}
              </label>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Input
                    type="number"
                    step={targetWeightUnit === "kg" ? 0.1 : 0.1}
                    min={properties?.min || (targetWeightUnit === "kg" ? 30 : 66)}
                    max={properties?.max || (targetWeightUnit === "kg" ? 300 : 660)}
                    placeholder={properties?.placeholder || (targetWeightUnit === "kg" ? "Ex: 65.0" : "Ex: 143")}
                    value={answer || ''}
                    onChange={(e) => handleElementAnswer(id, type, e.target.value, properties?.fieldId || 'peso_objetivo')}
                    required={properties?.required}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    style={{
                      fontSize: properties?.fontSize === 'xs' ? '12px' : 
                              properties?.fontSize === 'sm' ? '14px' : 
                              properties?.fontSize === 'lg' ? '18px' : 
                              properties?.fontSize === 'xl' ? '20px' : '16px',
                      fontWeight: properties?.fontWeight || 'normal',
                      textAlign: properties?.textAlign || 'left'
                    }}
                  />
                  
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button 
                        type="button" 
                        className={`px-3 py-1 text-sm rounded ${targetWeightUnit === "kg" ? "bg-gray-600 text-white" : "text-gray-600"}`}
                      >
                        kg
                      </button>
                      <button 
                        type="button" 
                        className={`px-3 py-1 text-sm rounded ${targetWeightUnit === "lb" ? "bg-gray-600 text-white" : "text-gray-600"}`}
                      >
                        lb
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {properties?.showDifferenceCalculation && properties?.currentWeightFieldId && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Cálculo de diferença ativo</span>
                  </div>
                  <div className="text-xs text-green-700">
                    Vinculado com peso atual: {properties.currentWeightFieldId}
                  </div>
                </div>
              )}
              
              {properties?.showProgressCalculation && properties?.currentWeightFieldId && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Progresso será calculado automaticamente</span>
                  </div>
                  <div className="text-xs text-blue-700">
                    Baseado na diferença entre peso atual e peso objetivo
                  </div>
                </div>
              )}
              
              {properties?.description && (
                <div className={`mt-3 text-gray-600 bg-gray-50 p-2 rounded ${targetLabelStyle} ${targetFontWeight} ${targetTextAlign}`}>
                  {properties.description}
                </div>
              )}
            </div>
          </div>
        );

      case 'rating':
        const starCount = properties?.starCount || 5;
        const starSize = properties?.starSize || "medium";
        const starColor = properties?.starColor || "#FBBF24";
        const isInteractive = properties?.isInteractive || false;
        const filledStars = properties?.filledStars || 0;
        
        const starSizeClass = {
          small: "w-4 h-4",
          medium: "w-6 h-6", 
          large: "w-8 h-8"
        };
        
        const hoveredStar = hoveredStars[id];
        
        return (
          <div key={id} className="space-y-4">
            {(properties?.question || properties?.label) && (
              <h3 className="text-lg font-semibold text-gray-800">
                {properties?.question || properties?.label || 'Avaliação'}
                {isInteractive && properties?.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
            )}
            <div className="flex space-x-1">
              {Array.from({ length: starCount }, (_, i) => {
                let shouldFill = false;
                
                if (isInteractive) {
                  // Modo interativo - preenchimento baseado em hover ou seleção
                  if (hoveredStar !== null && hoveredStar !== undefined) {
                    shouldFill = i <= hoveredStar;
                  } else if (answer) {
                    shouldFill = i < answer;
                  }
                } else {
                  // Modo visualização - preenchimento fixo baseado em filledStars
                  shouldFill = i < filledStars;
                }
                
                return isInteractive ? (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleElementAnswer(id, type, i + 1, properties?.fieldId)}
                    onMouseEnter={() => setHoveredStars(prev => ({ ...prev, [id]: i }))}
                    onMouseLeave={() => setHoveredStars(prev => ({ ...prev, [id]: null }))}
                    className={`p-1 transition-all duration-200 hover:scale-110 ${
                      shouldFill ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                    }`}
                    style={{ color: starColor }}
                  >
                    <Star 
                      className={starSizeClass[starSize]}
                      fill={shouldFill ? starColor : 'none'}
                      strokeWidth={2}
                    />
                  </button>
                ) : (
                  <div
                    key={i}
                    className="p-1"
                    style={{ color: starColor }}
                  >
                    <Star 
                      className={starSizeClass[starSize]}
                      fill={shouldFill ? starColor : 'none'}
                      strokeWidth={2}
                    />
                  </div>
                );
              })}
            </div>
            {isInteractive && answer && (
              <div className="text-sm text-gray-600">
                Avaliação: {answer}/{starCount} estrelas
              </div>
            )}
            {!isInteractive && (
              <div className="text-sm text-gray-600">
                {filledStars}/{starCount} estrelas
              </div>
            )}
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
        // Função para obter URL do embed do vídeo
        const getVideoEmbed = (url: string): { embedUrl: string; platform: string } | null => {
          if (!url) return null;
          
          // YouTube
          if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId = '';
            if (url.includes('youtu.be/')) {
              videoId = url.split('youtu.be/')[1].split('?')[0];
            } else if (url.includes('watch?v=')) {
              videoId = url.split('watch?v=')[1].split('&')[0];
            }
            return videoId ? { embedUrl: `https://www.youtube.com/embed/${videoId}`, platform: 'youtube' } : null;
          }
          
          // Vimeo
          if (url.includes('vimeo.com')) {
            const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
            return videoId ? { embedUrl: `https://player.vimeo.com/video/${videoId}`, platform: 'vimeo' } : null;
          }
          
          // TikTok (embed)
          if (url.includes('tiktok.com')) {
            const videoId = url.split('/video/')[1]?.split('?')[0];
            return videoId ? { embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`, platform: 'tiktok' } : null;
          }
          
          // Instagram
          if (url.includes('instagram.com')) {
            const postUrl = url.split('?')[0];
            return { embedUrl: `${postUrl}embed/`, platform: 'instagram' };
          }
          
          // VTURB (player específico)
          if (url.includes('vturb.com.br') || url.includes('vturb')) {
            return { embedUrl: url, platform: 'vturb' };
          }
          
          // VSLPlayer
          if (url.includes('vslplayer') || url.includes('vsl')) {
            return { embedUrl: url, platform: 'vslplayer' };
          }
          
          // PandaVideo
          if (url.includes('pandavideo') || url.includes('panda')) {
            return { embedUrl: url, platform: 'pandavideo' };
          }
          
          // Outros embeds diretos
          return { embedUrl: url, platform: 'other' };
        };

        const videoUrl = properties.content || element.content;
        const videoEmbed = getVideoEmbed(videoUrl);
        
        // Configurações de layout
        const videoAlignment = properties.videoAlignment || "center";
        const videoWidth = properties.videoWidth || "100";
        const aspectRatio = properties.aspectRatio || "16/9";
        const mobileSize = properties.mobileSize || "100";
        const tabletSize = properties.tabletSize || "100";
        
        // Configurações avançadas
        const autoplay = properties.autoplay ? "1" : "0";
        const muted = properties.muted ? "1" : "0";
        const loop = properties.loop ? "1" : "0";
        const controls = properties.controls !== false ? "1" : "0";
        
        // Classes de alinhamento
        const alignmentClasses = {
          left: "justify-start",
          center: "justify-center", 
          right: "justify-end"
        };
        
        // Classes de aspect ratio
        const aspectRatioClasses = {
          "16/9": "aspect-video",
          "4/3": "aspect-[4/3]",
          "1/1": "aspect-square",
          "21/9": "aspect-[21/9]"
        };
        
        // Construir URL com parâmetros
        let finalEmbedUrl = videoEmbed?.embedUrl;
        if (finalEmbedUrl && videoEmbed && (videoEmbed.platform === 'youtube' || videoEmbed.platform === 'vimeo')) {
          const params = new URLSearchParams();
          if (autoplay === "1") params.append('autoplay', '1');
          if (muted === "1") params.append('muted', '1');
          if (loop === "1") params.append('loop', '1');
          if (controls === "0") params.append('controls', '0');
          
          finalEmbedUrl += (finalEmbedUrl.includes('?') ? '&' : '?') + params.toString();
        }

        return (
          <div key={id} className="space-y-2">
            <div className={`flex ${alignmentClasses[videoAlignment as keyof typeof alignmentClasses] || alignmentClasses.center} w-full`}>
              <div 
                className={`
                  ${aspectRatioClasses[aspectRatio as keyof typeof aspectRatioClasses] || aspectRatioClasses["16/9"]} 
                  bg-gray-100 rounded-lg overflow-hidden
                  w-full
                  max-w-[${videoWidth}%]
                  lg:max-w-[${videoWidth}%]
                  md:max-w-[${tabletSize}%]
                  sm:max-w-[${mobileSize}%]
                `}
                style={{ 
                  width: `${videoWidth}%`,
                  maxWidth: `${videoWidth}%`
                }}
              >
                {videoEmbed?.embedUrl ? (
                  <iframe
                    src={finalEmbedUrl}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title="Vídeo"
                    style={{ border: 'none' }}
                  />
                ) : videoUrl ? (
                  <div className="w-full h-full flex items-center justify-center bg-red-50">
                    <div className="text-center p-4">
                      <PlayCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                      <p className="text-red-600 text-sm">URL de vídeo inválida</p>
                      <p className="text-red-500 text-xs mt-1">Verifique o formato da URL</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center p-4">
                      <PlayCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Vídeo não configurado</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Informações técnicas (se habilitado) */}
            {properties.showVideoStats && videoEmbed && (
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2">
                <span>📹 {videoEmbed.platform.toUpperCase()}</span>
                <span>•</span>
                <span>📐 {aspectRatio}</span>
                <span>•</span>
                <span>📱 {videoWidth}%</span>
              </div>
            )}
          </div>
        );

      case 'share_quiz':
        const shareButtonStyle = {
          backgroundColor: properties.shareButtonBackgroundColor || "#10B981",
          color: properties.shareButtonTextColor || "#FFFFFF",
          borderRadius: properties.shareButtonBorderRadius === "none" ? "0px" :
                       properties.shareButtonBorderRadius === "small" ? "4px" :
                       properties.shareButtonBorderRadius === "medium" ? "8px" :
                       properties.shareButtonBorderRadius === "large" ? "12px" :
                       properties.shareButtonBorderRadius === "full" ? "9999px" : "8px",
          padding: properties.shareButtonSize === "small" ? "6px 12px" :
                  properties.shareButtonSize === "large" ? "12px 24px" : "8px 16px",
          fontSize: properties.shareButtonSize === "small" ? "14px" :
                   properties.shareButtonSize === "large" ? "18px" : "16px"
        };

        const networks = properties.shareNetworks || ["whatsapp", "facebook", "twitter", "email"];
        
        // Ícones reais das plataformas sociais em SVG
        const networkIcons = {
          whatsapp: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
          ),
          facebook: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          ),
          twitter: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          ),
          instagram: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          ),
          email: (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h3.819l6.545 4.91 6.545-4.91h3.819A1.636 1.636 0 0 1 24 5.457z"/>
            </svg>
          )
        };

        // Função para gerar URL correta do quiz
        const getCurrentQuizUrl = () => {
          const currentUrl = window.location.href;
          // Se já estamos em uma URL de quiz público, usar essa URL
          if (currentUrl.includes('/quiz/')) {
            return currentUrl;
          }
          // Caso contrário, construir URL baseada no ID do quiz se disponível
          const quizId = quiz?.id;
          if (quizId) {
            const baseUrl = window.location.origin;
            return `${baseUrl}/quiz/${quizId}`;
          }
          // Fallback para URL atual
          return currentUrl;
        };

        const quizUrl = getCurrentQuizUrl();
        const shareMessage = properties.shareMessage || 'Faça esse teste e se surpreenda também!';

        const handleShare = (network: string) => {
          let url = '';
          
          switch (network) {
            case 'whatsapp':
              url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)} ${encodeURIComponent(quizUrl)}`;
              break;
            case 'facebook':
              url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(quizUrl)}`;
              break;
            case 'twitter':
              url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(quizUrl)}`;
              break;
            case 'instagram':
              // Instagram não permite compartilhamento direto via URL, então copiamos para clipboard
              navigator.clipboard.writeText(`${shareMessage} ${quizUrl}`);
              alert('Link copiado para área de transferência! Cole no Instagram.');
              return;
            case 'email':
              url = `mailto:?subject=${encodeURIComponent('Quiz Interessante')}&body=${encodeURIComponent(`${shareMessage}\n\n${quizUrl}`)}`;
              break;
            default:
              return;
          }
          
          if (url) {
            window.open(url, '_blank', 'width=600,height=400');
          }
        };

        return (
          <div key={id} className="space-y-4 p-4 bg-transparent">
            <div className="text-sm text-gray-700 mb-3">
              {shareMessage}
            </div>
            
            <div className={`flex ${properties.shareLayout === "vertical" ? "flex-col gap-2" : "flex-wrap gap-2"}`}>
              {networks.map((network) => (
                <button
                  key={network}
                  onClick={() => handleShare(network)}
                  style={shareButtonStyle}
                  className="flex items-center gap-2 transition-all hover:opacity-80 hover:scale-105 border-none"
                >
                  {properties.shareShowIcons !== false && (
                    <span className={`${properties.shareIconSize === "small" ? "text-sm" : properties.shareIconSize === "large" ? "text-lg" : "text-base"}`}>
                      {networkIcons[network as keyof typeof networkIcons]}
                    </span>
                  )}
                  <span className="capitalize">
                    {network === "whatsapp" ? "WhatsApp" : network}
                  </span>
                </button>
              ))}
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
          large: "px-8 py-4 text-lg",
          full: "w-full px-6 py-3 text-base"
        };
        
        const styleClasses = {
          square: "rounded-none",
          rounded: "rounded-md",
          pill: "rounded-full"
        };
        
        return (
          <div key={id} className={`${isFixedFooter ? 'fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-t shadow-lg p-4' : 'flex justify-center'}`}>
            <Button
              onClick={handleNextPage}
              disabled={isSubmitting}
              className={`${sizeClasses[buttonSize]} ${styleClasses[buttonStyle]} font-medium shadow-lg transition-all duration-200 hover:shadow-xl ${buttonSize === 'full' ? '' : 'hover:scale-105'}`}
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

        // Componente com redirecionamento funcional
        const AnimatedTransitionWithRedirect = () => {
          const [countdown, setCountdown] = React.useState(properties.redirectDelay || 5);

          React.useEffect(() => {
            if (!properties.enableRedirect) return;

            const timer = setInterval(() => {
              setCountdown((prev) => {
                if (prev <= 1) {
                  clearInterval(timer);
                  // Executar redirecionamento
                  if (properties.redirectType === "custom_url" && properties.redirectUrl) {
                    window.location.href = properties.redirectUrl;
                  } else {
                    // Redirecionar para próxima página
                    handleNextPage();
                  }
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);

            // Cleanup
            return () => clearInterval(timer);
          }, []);

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
                    {properties.enableRedirect && countdown > 0 && (
                      <div className="text-xs mt-3 opacity-80">
                        🔄 Redirecionamento em {countdown}s
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-pulse rounded-lg"></div>
              </div>
            </div>
          );
        };

        return <AnimatedTransitionWithRedirect />;



      case 'chart':
        const chartBars = properties.chartBars || [
          { label: "Resultado 1", value: 85, color: "#3b82f6" },
          { label: "Resultado 2", value: 72, color: "#10b981" },
          { label: "Resultado 3", value: 94, color: "#f59e0b" }
        ];
        
        return (
          <div key={id} className="w-full bg-transparent p-4 mb-6">
            {properties.chartTitle && (
              <h3 className="text-lg font-semibold mb-4 text-center" style={{ color: properties.chartTitleColor || '#1f2937' }}>
                {properties.chartTitle}
              </h3>
            )}
            
            <div className="space-y-3">
              {chartBars.map((bar, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{bar.label}</span>
                    <span className="text-sm text-gray-600">{bar.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div 
                      className="h-6 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                      style={{ 
                        width: `${Math.min(100, Math.max(0, bar.value))}%`,
                        backgroundColor: bar.color
                      }}
                    >
                      <span className="text-xs text-white font-medium">
                        {bar.value}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'metrics':
        const metricsData = properties.metricsData || [
          { label: "Conversões", value: 85, color: "#3b82f6" },
          { label: "Engajamento", value: 72, color: "#10b981" },
          { label: "Retenção", value: 94, color: "#f59e0b" }
        ];
        
        return (
          <div key={id} className="w-full bg-transparent p-4 mb-6">
            {properties.metricsTitle && (
              <h3 className="text-lg font-semibold mb-4 text-center">
                {properties.metricsTitle}
              </h3>
            )}
            
            <div className="space-y-3">
              {metricsData.map((metric, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <span className="text-sm text-gray-600">{metric.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div 
                      className="h-6 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                      style={{ 
                        width: `${Math.min(100, Math.max(0, metric.value))}%`,
                        backgroundColor: metric.color
                      }}
                    >
                      <span className="text-xs text-white font-medium">
                        {metric.value}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'before_after':
        const displayType = properties.beforeAfterDisplayType || 'bars';
        const beforeValue = properties.beforeValue || 25;
        const afterValue = properties.afterValue || 85;
        
        return (
          <div key={id} className="w-full bg-transparent p-4 border border-gray-200 rounded-lg">
            {properties.beforeAfterTitle && (
              <h3 className="text-lg font-semibold mb-4 text-center" style={{ color: properties.titleColor || '#1f2937' }}>
                {properties.beforeAfterTitle}
              </h3>
            )}
            
            {displayType === 'bars' && (
              <div className="space-y-4">
                {/* Barra Antes */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium" style={{ color: properties.beforeColor || '#ef4444' }}>
                      {properties.beforeLabel || 'Antes'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {beforeValue}{properties.beforeAfterShowPercent ? '%' : ''}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div 
                      className="h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ 
                        width: `${Math.min(100, Math.max(0, beforeValue))}%`,
                        backgroundColor: properties.beforeColor || '#ef4444'
                      }}
                    >
                      <span className="text-xs text-white font-medium">
                        {beforeValue}{properties.beforeAfterShowPercent ? '%' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Barra Depois */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium" style={{ color: properties.afterColor || '#10b981' }}>
                      {properties.afterLabel || 'Depois'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {afterValue}{properties.beforeAfterShowPercent ? '%' : ''}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div 
                      className="h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ 
                        width: `${Math.min(100, Math.max(0, afterValue))}%`,
                        backgroundColor: properties.afterColor || '#10b981'
                      }}
                    >
                      <span className="text-xs text-white font-medium">
                        {afterValue}{properties.beforeAfterShowPercent ? '%' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {displayType === 'metrics' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-6 rounded-lg border-2" style={{ 
                  borderColor: properties.beforeColor || '#ef4444',
                  backgroundColor: properties.beforeBgColor || '#fef2f2'
                }}>
                  <div className="text-4xl mb-2">{properties.beforeIcon || '😔'}</div>
                  <div className="text-3xl font-bold mb-2" style={{ color: properties.beforeColor || '#ef4444' }}>
                    {beforeValue}{properties.beforeAfterShowPercent ? '%' : ''}
                  </div>
                  <h4 className="text-lg font-semibold mb-1" style={{ color: properties.beforeColor || '#ef4444' }}>
                    {properties.beforeLabel || 'ANTES'}
                  </h4>
                  <p className="text-sm text-gray-600">{properties.beforeDescription || 'Situação anterior'}</p>
                </div>
                
                <div className="text-center p-6 rounded-lg border-2" style={{ 
                  borderColor: properties.afterColor || '#10b981',
                  backgroundColor: properties.afterBgColor || '#f0fdf4'
                }}>
                  <div className="text-4xl mb-2">{properties.afterIcon || '😊'}</div>
                  <div className="text-3xl font-bold mb-2" style={{ color: properties.afterColor || '#10b981' }}>
                    {afterValue}{properties.beforeAfterShowPercent ? '%' : ''}
                  </div>
                  <h4 className="text-lg font-semibold mb-1" style={{ color: properties.afterColor || '#10b981' }}>
                    {properties.afterLabel || 'DEPOIS'}
                  </h4>
                  <p className="text-sm text-gray-600">{properties.afterDescription || 'Resultado alcançado'}</p>
                </div>
              </div>
            )}
            
            {displayType === 'timeline' && (
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-center">
                    <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-3" style={{ 
                      backgroundColor: properties.beforeColor || '#ef4444' 
                    }}>
                      <span className="text-white text-2xl">{properties.beforeIcon || '😔'}</span>
                    </div>
                    <div className="text-2xl font-bold mb-1" style={{ color: properties.beforeColor || '#ef4444' }}>
                      {beforeValue}{properties.beforeAfterShowPercent ? '%' : ''}
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{properties.beforeLabel || 'ANTES'}</h4>
                    <p className="text-xs text-gray-600">{properties.beforeDescription || 'Situação anterior'}</p>
                  </div>
                  
                  <div className="px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-0.5 bg-gray-300"></div>
                      <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">→</span>
                      </div>
                      <div className="w-8 h-0.5 bg-gray-300"></div>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center">
                    <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-3" style={{ 
                      backgroundColor: properties.afterColor || '#10b981' 
                    }}>
                      <span className="text-white text-2xl">{properties.afterIcon || '😊'}</span>
                    </div>
                    <div className="text-2xl font-bold mb-1" style={{ color: properties.afterColor || '#10b981' }}>
                      {afterValue}{properties.beforeAfterShowPercent ? '%' : ''}
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{properties.afterLabel || 'DEPOIS'}</h4>
                    <p className="text-xs text-gray-600">{properties.afterDescription || 'Resultado alcançado'}</p>
                  </div>
                </div>
              </div>
            )}
            
            {displayType === 'chart' && (
              <div className="w-full h-64">
                <Chart
                  type={properties.beforeAfterChartType || 'bar'}
                  data={[
                    { label: "Antes", value: beforeValue, color: properties.beforeColor || "#ef4444" },
                    { label: "Depois", value: afterValue, color: properties.afterColor || "#10b981" }
                  ]}
                  title={properties.beforeAfterTitle}
                  showLegend={properties.beforeAfterShowLegend !== false}
                  backgroundColor={properties.beforeAfterChartBg || '#3b82f6'}
                  borderColor={properties.beforeAfterChartBorder || '#1d4ed8'}
                  height={250}
                />
              </div>
            )}
            
            {properties.beforeAfterMainDescription && (
              <p className="text-sm text-gray-600 text-center mt-4">
                {properties.beforeAfterMainDescription}
              </p>
            )}
          </div>
        );

      case 'pricing_plans':
        const [selectedPlan, setSelectedPlan] = useState<string>("");
        const plansData = properties.plansData || [];
        
        const handlePlanAction = (plan: any) => {
          if (properties.autoRedirect) {
            // Redirecionamento automático
            if (plan.url) {
              window.open(plan.url, '_blank');
            }
          } else {
            // Seleção manual com botão
            setSelectedPlan(plan.id);
          }
        };
        
        const handlePlanButton = () => {
          const selectedPlanData = plansData.find((p: any) => p.id === selectedPlan);
          if (selectedPlanData && selectedPlanData.url) {
            window.open(selectedPlanData.url, '_blank');
          }
        };
        
        return (
          <div key={id} className="w-full bg-transparent p-6">
            {/* Título e Descrição */}
            {properties.pricingTitle && (
              <h2 
                className="text-3xl font-bold text-center mb-4" 
                style={{ color: properties.titleColor || '#1f2937' }}
              >
                {properties.pricingTitle}
              </h2>
            )}
            
            {properties.pricingDescription && (
              <p 
                className="text-center mb-8 text-lg"
                style={{ color: properties.descriptionColor || '#6b7280' }}
              >
                {properties.pricingDescription}
              </p>
            )}
            
            {/* Grid de Planos */}
            <div className={`grid gap-6 ${plansData.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : plansData.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {plansData.map((plan: any, index: number) => (
                <div
                  key={plan.id || index}
                  className={`relative border rounded-lg p-6 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                    plan.highlighted ? 'scale-105 ring-2 ring-purple-500' : ''
                  } ${
                    !properties.autoRedirect && selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{
                    backgroundColor: plan.backgroundColor || '#ffffff',
                    borderColor: plan.borderColor || '#e5e7eb',
                    color: plan.textColor || '#1f2937'
                  }}
                  onClick={() => handlePlanAction(plan)}
                >
                  {/* Badge de Promoção */}
                  {plan.promotion && (
                    <div 
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: properties.promotionBgColor || '#10b981' }}
                    >
                      {plan.promotion}
                    </div>
                  )}
                  
                  {/* Checkbox para seleção (apenas se não for auto-redirect) */}
                  {!properties.autoRedirect && (
                    <div className="absolute top-4 right-4">
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        selectedPlan === plan.id 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        {selectedPlan === plan.id && (
                          <div className="w-full h-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Nome do Plano */}
                  <h3 className="text-xl font-bold mb-2 text-center">
                    {plan.name}
                  </h3>
                  
                  {/* Preços */}
                  <div className="text-center mb-4">
                    {plan.originalPrice && (
                      <div 
                        className="text-sm line-through opacity-60"
                        style={{ color: plan.textColor || '#6b7280' }}
                      >
                        De {plan.originalPrice}
                      </div>
                    )}
                    <div className="text-3xl font-bold">
                      {plan.price}
                    </div>
                  </div>
                  
                  {/* Descrição */}
                  {plan.description && (
                    <p 
                      className="text-center text-sm mb-4 opacity-80"
                      style={{ color: plan.textColor || '#6b7280' }}
                    >
                      {plan.description}
                    </p>
                  )}
                  
                  {/* Indicador de destaque */}
                  {plan.highlighted && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Botão de Ação (apenas se não for auto-redirect) */}
            {!properties.autoRedirect && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={handlePlanButton}
                  disabled={!selectedPlan}
                  className="px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: selectedPlan ? (properties.buttonBgColor || '#10b981') : '#9ca3af',
                    color: properties.buttonTextColor || '#ffffff'
                  }}
                >
                  {properties.buttonIcon && (
                    <span className="mr-2">{properties.buttonIcon}</span>
                  )}
                  {properties.buttonText || 'Escolher Plano'}
                </Button>
              </div>
            )}
            
            {/* Mensagem de instrução */}
            {plansData.length > 0 && (
              <p className="text-center text-sm text-gray-500 mt-4">
                {properties.autoRedirect 
                  ? "Clique no plano desejado para ser redirecionado"
                  : "Selecione um plano e clique no botão abaixo"
                }
              </p>
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

      case 'testimonials':
        // Dados padrão dos depoimentos
        const testimonials = properties.testimonialsData || [
          {
            id: "1",
            name: "Debi Macdonald",
            testimonial: "É fácil de usar e seguir. Perdi 6 kg em 25 dias.",
            rating: 5,
            avatar: "/api/placeholder/40/40"
          },
          {
            id: "2", 
            name: "Theresa Hamilton",
            testimonial: "Perdi 3 kg em uma semana. ❤️ Às vezes o estômago reclama da fome, mas é muito melhor do que o sofrimento que eu passava com os vigilantes do peso ou fazendo dietas 'low carb'.",
            rating: 5,
            avatar: "/api/placeholder/40/40"
          },
          {
            id: "3",
            name: "Alicia Wheeler Johnson", 
            testimonial: "É um jeito mais fácil de introduzir a alimentação saudável e a perda de peso na sua rotina e no seu estilo de vida. 🚀",
            rating: 5,
            avatar: "/api/placeholder/40/40"
          }
        ];

        // Configurações de layout e estilo
        const testimonialsTitle = properties.testimonialsTitle || "O que nossos clientes dizem";
        const titleSize = properties.testimonialsTitleSize || "lg";
        const layout = properties.testimonialsLayout || "vertical";
        const columns = properties.testimonialsColumns || 1;
        const width = properties.testimonialsWidth || 100;
        const backgroundColor = properties.testimonialsBackgroundColor || "#ffffff";
        const textColor = properties.testimonialsTextColor || "#374151";
        const nameColor = properties.testimonialsNameColor || "#111827";
        const showStars = properties.testimonialsShowStars !== false;
        const showPhotos = properties.testimonialsShowPhotos !== false;
        const showShadow = properties.testimonialsShowShadow !== false;

        // Estilos do título
        const titleStyle = {
          fontSize: titleSize === "xs" ? "14px" : 
                   titleSize === "sm" ? "16px" : 
                   titleSize === "base" ? "18px" :
                   titleSize === "lg" ? "20px" : 
                   titleSize === "xl" ? "24px" :
                   titleSize === "2xl" ? "28px" : "20px",
          fontWeight: "600",
          color: nameColor,
          textAlign: "center" as any,
          marginBottom: "24px"
        };

        // Container width para testimonials
        const testimonialsContainerWidth = `${Math.min(Math.max(width, 10), 100)}%`;

        // Grid classes baseado no layout
        const gridClasses = layout === "grid" 
          ? `grid gap-6 ${columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`
          : "space-y-6";

        // Função para renderizar estrelas
        const renderStars = (rating: number) => {
          return Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
          ));
        };

        return (
          <div key={id} className="w-full" style={{ width: testimonialsContainerWidth, maxWidth: testimonialsContainerWidth }}>
            <div 
              className="p-6 rounded-lg"
              style={{ 
                backgroundColor: backgroundColor,
                boxShadow: showShadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none'
              }}
            >
              {/* Título */}
              {testimonialsTitle && (
                <h3 style={titleStyle}>
                  {testimonialsTitle}
                </h3>
              )}

              {/* Grid/Lista de depoimentos */}
              <div className={gridClasses}>
                {testimonials.map((testimonial: any) => (
                  <div 
                    key={testimonial.id} 
                    className="p-4 border border-gray-200 rounded-lg bg-white"
                    style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
                  >
                    {/* Header com foto e nome */}
                    <div className="flex items-center mb-3">
                      {showPhotos && (
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                          onError={(e) => {
                            e.currentTarget.src = "/api/placeholder/40/40";
                          }}
                        />
                      )}
                      <div>
                        <h4 
                          className="font-semibold text-sm"
                          style={{ color: nameColor }}
                        >
                          {testimonial.name}
                        </h4>
                        {showStars && (
                          <div className="flex mt-1">
                            {renderStars(testimonial.rating)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Texto do depoimento */}
                    <p 
                      className="text-sm leading-relaxed"
                      style={{ color: textColor }}
                    >
                      "{testimonial.testimonial}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'guarantee':
        const guaranteeTitle = properties.guaranteeTitle || "Garantia de 30 dias";
        const guaranteeDescription = properties.guaranteeDescription || "Se você não ficar satisfeito, devolvemos seu dinheiro";
        const guaranteeButtonText = properties.guaranteeButtonText || "";
        const guaranteeIcon = properties.guaranteeIcon || "Shield";
        const guaranteeBackgroundColor = properties.guaranteeBackgroundColor || "transparent";
        const guaranteeTextColor = properties.guaranteeTextColor || "#374151";
        const guaranteeTitleColor = properties.guaranteeTitleColor || "#111827";
        const guaranteeIconColor = properties.guaranteeIconColor || "#10b981";
        const guaranteeLayout = properties.guaranteeLayout || "horizontal";
        const guaranteeStyle = properties.guaranteeStyle || "card";
        const guaranteeTitleSize = properties.guaranteeTitleSize || "lg";
        const guaranteeTitleWeight = properties.guaranteeTitleWeight || "semibold";
        const guaranteeTitleAlign = properties.guaranteeTitleAlign || "left";
        const guaranteeWidth = properties.guaranteeWidth || 100;
        
        // Ícone dinâmico
        const GuaranteeIconComponent = guaranteeIcon === "Shield" ? Shield :
                             guaranteeIcon === "CheckCircle" ? CheckCircle :
                             guaranteeIcon === "Award" ? Award :
                             guaranteeIcon === "Star" ? Star :
                             guaranteeIcon === "Heart" ? Heart :
                             guaranteeIcon === "Lock" ? Lock :
                             guaranteeIcon === "Zap" ? Zap :
                             guaranteeIcon === "Trophy" ? Trophy :
                             guaranteeIcon === "Gift" ? Gift : Shield;
        
        // Estilos do título
        const guaranteeTitleStyle = {
          fontSize: guaranteeTitleSize === "xs" ? "14px" : 
                   guaranteeTitleSize === "sm" ? "16px" : 
                   guaranteeTitleSize === "base" ? "18px" :
                   guaranteeTitleSize === "lg" ? "20px" : 
                   guaranteeTitleSize === "xl" ? "24px" :
                   guaranteeTitleSize === "2xl" ? "28px" : "20px",
          fontWeight: guaranteeTitleWeight === "normal" ? "400" :
                     guaranteeTitleWeight === "medium" ? "500" :
                     guaranteeTitleWeight === "semibold" ? "600" :
                     guaranteeTitleWeight === "bold" ? "700" : "600",
          color: guaranteeTitleColor,
          textAlign: guaranteeTitleAlign as any
        };
        
        // Container width
        const guaranteeContainerWidth = `${Math.min(Math.max(guaranteeWidth, 10), 100)}%`;
        
        return (
          <div 
            key={id}
            className="w-full"
            style={{ width: guaranteeContainerWidth, maxWidth: guaranteeContainerWidth }}
          >
            <div 
              className={`p-6 rounded-lg ${guaranteeStyle === "card" ? "border" : ""} ${guaranteeStyle === "shadow" ? "shadow-lg" : ""}`}
              style={{ 
                backgroundColor: guaranteeBackgroundColor,
                borderColor: guaranteeStyle === "card" ? "rgba(0, 0, 0, 0.1)" : "transparent"
              }}
            >
              <div className={`${guaranteeLayout === "vertical" ? "flex flex-col items-center text-center gap-4" : "flex items-center gap-4"}`}>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <GuaranteeIconComponent className="w-6 h-6" style={{ color: guaranteeIconColor }} />
                </div>
                <div className="flex-1">
                  <h3 style={guaranteeTitleStyle}>{guaranteeTitle}</h3>
                  <p className="mt-1" style={{ color: guaranteeTextColor }}>{guaranteeDescription}</p>
                  {properties.guaranteeFeatures && (
                    <ul className="mt-3 space-y-1">
                      {properties.guaranteeFeatures.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center gap-2 text-sm" style={{ color: guaranteeTextColor }}>
                          <CheckCircle className="w-3 h-3" style={{ color: guaranteeIconColor }} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  {guaranteeButtonText && (
                    <button 
                      className="mt-4 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                      style={{ 
                        backgroundColor: guaranteeIconColor,
                        color: "white"
                      }}
                    >
                      {guaranteeButtonText}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'faq':
        // Dados padrão do FAQ se não houver
        const faqData = properties.faqData || [
          {
            id: "faq-1",
            question: "Como funciona o sistema?",
            answer: "O sistema é muito simples de usar. Você cria seus quizzes, compartilha com sua audiência e acompanha os resultados em tempo real através do dashboard."
          },
          {
            id: "faq-2", 
            question: "Posso cancelar a qualquer momento?",
            answer: "Sim, você pode cancelar sua assinatura a qualquer momento. Não há taxas de cancelamento ou multas."
          },
          {
            id: "faq-3",
            question: "Há limite de respostas?",
            answer: "Depende do seu plano. O plano básico tem 1000 respostas/mês, o profissional tem 10000 e o enterprise é ilimitado."
          }
        ];

        // Configurações visuais com valores padrão
        const faqTitle = properties.faqTitle || "Perguntas Frequentes";
        const faqTitleSize = properties.faqTitleSize || "lg";
        const faqTitleWeight = properties.faqTitleWeight || "semibold";
        const faqTitleAlign = properties.faqTitleAlign || "center";
        const faqTitleColor = properties.faqTitleColor || "#111827";
        const faqBackgroundColor = properties.faqBackgroundColor || "#ffffff";
        const faqBorderColor = properties.faqBorderColor || "#e5e7eb";
        const faqHeaderColor = properties.faqHeaderColor || "#374151";
        const faqTextColor = properties.faqTextColor || "#6b7280";
        const faqIconColor = properties.faqIconColor || "#10b981";
        const faqWidth = properties.faqWidth || 100;
        const faqQuestionSize = properties.faqQuestionSize || "base";
        const faqQuestionWeight = properties.faqQuestionWeight || "medium";
        const faqAnswerSize = properties.faqAnswerSize || "sm";
        const faqAnswerWeight = properties.faqAnswerWeight || "normal";

        // Estilos do título principal
        const faqMainTitleStyle = {
          fontSize: faqTitleSize === "xs" ? "14px" : 
                   faqTitleSize === "sm" ? "16px" : 
                   faqTitleSize === "base" ? "18px" :
                   faqTitleSize === "lg" ? "20px" : 
                   faqTitleSize === "xl" ? "24px" :
                   faqTitleSize === "2xl" ? "28px" : "20px",
          fontWeight: faqTitleWeight === "light" ? "300" :
                     faqTitleWeight === "normal" ? "400" :
                     faqTitleWeight === "medium" ? "500" :
                     faqTitleWeight === "semibold" ? "600" :
                     faqTitleWeight === "bold" ? "700" : "600",
          color: faqTitleColor,
          textAlign: faqTitleAlign as any,
          marginBottom: "24px"
        };

        // Estilos das perguntas
        const faqQuestionStyle = {
          fontSize: faqQuestionSize === "xs" ? "12px" : 
                   faqQuestionSize === "sm" ? "14px" : 
                   faqQuestionSize === "base" ? "16px" :
                   faqQuestionSize === "lg" ? "18px" : 
                   faqQuestionSize === "xl" ? "20px" : "16px",
          fontWeight: faqQuestionWeight === "light" ? "300" :
                     faqQuestionWeight === "normal" ? "400" :
                     faqQuestionWeight === "medium" ? "500" :
                     faqQuestionWeight === "semibold" ? "600" :
                     faqQuestionWeight === "bold" ? "700" : "500",
          color: faqHeaderColor
        };

        // Estilos das respostas
        const faqAnswerStyle = {
          fontSize: faqAnswerSize === "xs" ? "12px" : 
                   faqAnswerSize === "sm" ? "14px" : 
                   faqAnswerSize === "base" ? "16px" :
                   faqAnswerSize === "lg" ? "18px" : 
                   faqAnswerSize === "xl" ? "20px" : "14px",
          fontWeight: faqAnswerWeight === "light" ? "300" :
                     faqAnswerWeight === "normal" ? "400" :
                     faqAnswerWeight === "medium" ? "500" :
                     faqAnswerWeight === "semibold" ? "600" :
                     faqAnswerWeight === "bold" ? "700" : "400",
          color: faqTextColor
        };

        // Container width
        const faqContainerWidth = `${Math.min(Math.max(faqWidth, 10), 100)}%`;

        // Função para toggle do FAQ
        const toggleFaq = (faqId: string) => {
          setExpandedFaqs(prev => ({
            ...prev,
            [faqId]: !prev[faqId]
          }));
        };

        return (
          <div 
            key={id}
            className="w-full"
            style={{ width: faqContainerWidth, maxWidth: faqContainerWidth }}
          >
            <div 
              className="p-6 rounded-lg"
              style={{ backgroundColor: faqBackgroundColor }}
            >
              {/* Título principal */}
              {faqTitle && (
                <h3 style={faqMainTitleStyle}>
                  {faqTitle}
                </h3>
              )}

              {/* Lista de FAQs */}
              <div className="space-y-3">
                {faqData.map((faq: any) => (
                  <div 
                    key={faq.id} 
                    className="border rounded-lg overflow-hidden"
                    style={{ borderColor: faqBorderColor }}
                  >
                    <button 
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => toggleFaq(faq.id)}
                      style={{ backgroundColor: expandedFaqs[faq.id] ? 'rgba(0, 0, 0, 0.02)' : 'transparent' }}
                    >
                      <span style={faqQuestionStyle}>
                        {faq.question}
                      </span>
                      <ChevronDown 
                        className={`w-5 h-5 transition-transform duration-200 ${expandedFaqs[faq.id] ? 'rotate-180' : ''}`}
                        style={{ color: faqIconColor }}
                      />
                    </button>
                    
                    {/* Resposta expandível */}
                    {expandedFaqs[faq.id] && (
                      <div 
                        className="px-4 pb-3 border-t"
                        style={{ borderColor: faqBorderColor }}
                      >
                        <p style={faqAnswerStyle} className="mt-2">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'image_carousel':
        return <AdvancedCarousel key={id} id={id} properties={properties} />;

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
      <div 
        className="min-h-screen flex items-center justify-center p-4" 
        style={{
          ...getPageBackgroundStyle(quiz),
          backgroundColor: backgroundColor || getPageBackgroundStyle(quiz).backgroundColor,
          color: textColor || getPageBackgroundStyle(quiz).color
        }}
      >
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
      <div 
        className="min-h-screen flex items-center justify-center" 
        style={{
          ...getPageBackgroundStyle(quiz),
          backgroundColor: backgroundColor || getPageBackgroundStyle(quiz).backgroundColor,
          color: textColor || getPageBackgroundStyle(quiz).color
        }}
      >
        <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>Nenhuma página encontrada</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4"
      style={{ 
        ...getPageBackgroundStyle(quiz),
        backgroundColor: backgroundColor || getPageBackgroundStyle(quiz).backgroundColor,
        color: textColor || getPageBackgroundStyle(quiz).color,
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