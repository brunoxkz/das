import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DragDropItem, DragDropContainer } from "@/components/ui/drag-drop";
import { ModernButton } from "@/components/ui/modern-button";
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card";
import { animations, microInteractions } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  Plus, 
  Eye, 
  Settings, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Edit3,
  GripVertical,
  Type,
  AlignLeft,
  Image as ImageIcon,
  Minus,
  CheckSquare,
  Star,
  Mail,
  Phone,
  Calendar,
  Hash,
  FileText as TextArea,
  Upload,
  Video,
  BarChart3,
  Volume2,
  AlertCircle,
  ArrowUpDown,
  Palette,
  Loader,
  ArrowRight,
  Sparkles,
  Scale,
  Activity,
  Target,
  Calculator,
  Share2,
  CreditCard,
  DollarSign,
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  Users,
  UserCheck,
  Shield,
  Award,
  Crown,
  Trophy,
  Package,
  Gift,
  MessageSquare,
  ThumbsUp,
  Globe,
  Zap,
  Heart,
  CheckCircle,
  ExternalLink,
  ArrowLeftRight,
  HelpCircle,
  QrCode,
  Hand
} from "lucide-react";

// Função para inicializar Chart.js da roleta
declare global {
  interface Window {
    Chart: any;
    ChartDataLabels: any;
    initializeWheelChart: (canvasId: string, segments: string[], colors: string[], winningSegment: number) => void;
  }
}

// Função global para inicializar roleta
if (typeof window !== 'undefined') {
  (window as any).initializeWheelChart = (canvasId: string, segments: string[], colors: string[], winningSegment: number) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas || !window.Chart) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Configuração do rotationValues baseado nos segmentos
    const rotationValues = segments.map((_, index) => {
      const angle = 360 / segments.length;
      return {
        minDegree: index * angle,
        maxDegree: (index + 1) * angle,
        value: index
      };
    });
    
    // Dados para o Chart.js
    const data = Array(segments.length).fill(16); // Tamanho igual para cada segmento
    
    // Criar o gráfico
    const wheelChart = new window.Chart(ctx, {
      plugins: [window.ChartDataLabels],
      type: 'pie',
      data: {
        labels: segments,
        datasets: [{
          backgroundColor: colors,
          data: data,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        plugins: {
          tooltip: false,
          legend: { display: false },
          datalabels: {
            color: '#ffffff',
            formatter: (_, context) => context.chart.data.labels[context.dataIndex],
            font: { size: 12, weight: 'bold' }
          }
        }
      }
    });
    
    // Função para determinar resultado baseado no ângulo
    const valueGenerator = (angleValue: number) => {
      for (let i of rotationValues) {
        if (angleValue >= i.minDegree && angleValue <= i.maxDegree) {
          return segments[i.value];
        }
      }
      return segments[winningSegment];
    };
    
    // Função de spin
    const spinWheel = () => {
      const randomDegree = Math.floor(Math.random() * 360);
      let count = 0;
      let resultValue = 101;
      
      const rotationInterval = setInterval(() => {
        wheelChart.options.rotation = (wheelChart.options.rotation || 0) + resultValue;
        wheelChart.update();
        
        if (wheelChart.options.rotation >= 360) {
          count += 1;
          resultValue -= 5;
          wheelChart.options.rotation = 0;
        } else if (count > 15 && wheelChart.options.rotation >= randomDegree) {
          const result = valueGenerator(randomDegree);
          console.log(`Resultado: ${result}`);
          clearInterval(rotationInterval);
          count = 0;
          resultValue = 101;
        }
      }, 10);
    };
    
    // Adicionar evento de clique
    canvas.addEventListener('click', spinWheel);
  };

  // Função para Slot Machine Premium
  (window as any).spinSlotMachine = (containerId: string, symbols: string[], reels: number) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const debugEl = document.getElementById(`debug-${containerId.split('-')[1]}`);
    const reelElements = container.querySelectorAll('.reel');
    const iconHeight = 79;
    const numIcons = symbols.length;
    const timePerIcon = 100;
    
    // Função para rolar um reel
    const rollReel = (reel: HTMLElement, offset = 0) => {
      const delta = (offset + 2) * numIcons + Math.round(Math.random() * numIcons);
      
      return new Promise((resolve) => {
        const style = getComputedStyle(reel);
        const currentPos = parseFloat(style.backgroundPositionY) || 0;
        const targetPos = currentPos + delta * iconHeight;
        const normalizedPos = targetPos % (numIcons * iconHeight);
        
        setTimeout(() => {
          reel.style.transition = `background-position-y ${(8 + 1 * delta) * timePerIcon}ms cubic-bezier(.41,-0.01,.63,1.09)`;
          reel.style.backgroundPositionY = `${targetPos}px`;
        }, offset * 150);
        
        setTimeout(() => {
          reel.style.transition = 'none';
          reel.style.backgroundPositionY = `${normalizedPos}px`;
          resolve(delta % numIcons);
        }, (8 + 1 * delta) * timePerIcon + offset * 150);
      });
    };

    // Rolar todos os reels
    if (debugEl) debugEl.textContent = 'Girando...';
    
    Promise.all(
      Array.from(reelElements).map((reel, i) => rollReel(reel as HTMLElement, i))
    ).then((results: any[]) => {
      const finalSymbols = results.map(r => symbols[r]);
      
      if (debugEl) {
        debugEl.textContent = finalSymbols.join(' - ');
      }
      
      // Verificar vitórias
      const isWin = finalSymbols[0] === finalSymbols[1] || finalSymbols[1] === finalSymbols[2];
      const isJackpot = finalSymbols.every(s => s === finalSymbols[0]);
      
      if (isJackpot) {
        container.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)';
        container.style.boxShadow = '0 0 30px #FFD700';
        if (debugEl) debugEl.textContent = '🎉 JACKPOT! ' + finalSymbols.join(' - ');
      } else if (isWin) {
        container.style.background = 'linear-gradient(45deg, #90EE90, #32CD32)';
        container.style.boxShadow = '0 0 20px #32CD32';
        if (debugEl) debugEl.textContent = '✨ Vitória! ' + finalSymbols.join(' - ');
      }
      
      // Reset visual após 2 segundos
      setTimeout(() => {
        container.style.background = '';
        container.style.boxShadow = '';
        if (debugEl && !isWin) debugEl.textContent = 'Pronto para jogar...';
      }, 2000);
    });
  };

  // Função para Roda da Fortuna Premium
  (window as any).spinFortuneWheel = (wheelId: string, segments: string[], colors: string[], elementId: string) => {
    const wheel = document.getElementById(wheelId);
    const scoreEl = document.getElementById(`score-${elementId}`);
    const roundEl = document.getElementById(`round-${elementId}`);
    const pin = document.getElementById(`pin-${elementId}`);
    
    if (!wheel || !scoreEl || !roundEl) return;
    
    const currentScore = parseInt(scoreEl.textContent || '0');
    const currentRound = parseInt(roundEl.textContent || '10');
    
    if (currentRound <= 0) {
      // Game over - reset
      scoreEl.textContent = '0';
      roundEl.textContent = '10';
      return;
    }
    
    // Diminuir round
    roundEl.textContent = (currentRound - 1).toString();
    
    // Animação do ponteiro
    if (pin) {
      pin.style.animation = 'none';
      setTimeout(() => {
        pin.style.animation = 'jolt 250ms ease-out forwards';
      }, 10);
    }
    
    // Girar a roda
    const getRotationAngle = (el: HTMLElement) => {
      const computedStyle = window.getComputedStyle(el);
      const transform = computedStyle.transform || computedStyle.webkitTransform;
      if (transform === 'none') return 0;
      const values = transform.split('(')[1].split(')')[0].split(',');
      const a = parseFloat(values[0]);
      const b = parseFloat(values[1]);
      return Math.round(Math.atan2(b, a) * (180 / Math.PI));
    };
    
    const currentRotation = getRotationAngle(wheel);
    const minimumRotation = 600;
    const newRotation = minimumRotation + Math.round(Math.random() * 720);
    const time = Math.round((1 + newRotation / 180) * 1000);
    
    wheel.style.transition = `transform ${time}ms cubic-bezier(0.42, -0.1, 0.58, 1.02)`;
    wheel.style.transform = `rotate(${newRotation}deg)`;
    wheel.style.cursor = 'initial';
    
    setTimeout(() => {
      const finalRotation = newRotation % 360;
      wheel.style.transition = 'none';
      wheel.style.transform = `rotate(${finalRotation}deg)`;
      wheel.style.cursor = 'pointer';
      
      // Determinar segmento vencedor
      const segmentAngle = 360 / segments.length;
      const segmentIndex = finalRotation < 0.5 * segmentAngle
        ? segments.length - 1
        : Math.floor((finalRotation - 0.5 * segmentAngle) / segmentAngle);
      
      const reward = segments[segmentIndex];
      let newScore = currentScore;
      
      // Calcular novo score
      if (reward === 'x2') {
        newScore = Math.min(currentScore * 2, 999999);
      } else if (reward === ':2') {
        newScore = Math.floor(currentScore / 2);
      } else if (reward === '*') {
        newScore = 0;
      } else {
        const points = parseInt(reward);
        if (!isNaN(points)) {
          newScore = Math.min(currentScore + points, 999999);
        }
      }
      
      scoreEl.textContent = newScore.toString();
      
      // Efeito visual para o resultado
      wheel.style.background = `radial-gradient(circle, ${colors[segmentIndex]}, #333)`;
      wheel.style.boxShadow = `0 0 30px ${colors[segmentIndex]}`;
      
      setTimeout(() => {
        wheel.style.background = 'conic-gradient(from 0deg, ' + colors.map((color, i) => 
          `${color} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`
        ).join(', ') + ')';
        wheel.style.boxShadow = '0 0 20px 4px rgba(0,0,0,0.3)';
      }, 1500);
      
    }, time + 100);
  };
}

interface Element {
  id: number;
  type: "multiple_choice" | "text" | "rating" | "email" | "checkbox" | "date" | "phone" | "number" | "textarea" | "image_upload" | "animated_transition" | "heading" | "paragraph" | "image" | "divider" | "video" | "audio" | "birth_date" | "height" | "current_weight" | "target_weight" | "transition_background" | "transition_text" | "transition_counter" | "transition_loader" | "transition_redirect" | "transition_button" | "spacer" | "game_wheel" | "game_scratch" | "game_color_pick" | "game_brick_break" | "game_memory_cards" | "game_slot_machine" | "continue_button" | "loading_question" | "share_quiz" | "price" | "icon_list" | "testimonials" | "guarantee" | "paypal" | "image_with_text" | "chart" | "metrics" | "before_after" | "pricing_plans" | "stripe_embed" | "hotmart_upsell" | "faq" | "image_carousel" | "pix_payment" | "facial_reading" | "palm_reading";
  content: string;
  question?: string;
  description?: string;
  options?: string[];
  required?: boolean;
  fieldId?: string;
  responseId?: string; // ID único para referenciar a resposta como variável
  placeholder?: string;
  fontSize?: string;
  textAlign?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textColor?: string;
  backgroundColor?: string;
  min?: number;
  max?: number;
  color?: string;
  imageUrl?: string;
  multipleSelection?: boolean;
  optionLayout?: "vertical" | "horizontal" | "grid";
  buttonStyle?: "rectangular" | "rounded" | "pills";
  requireContinueButton?: boolean; // Para múltipla escolha - se deve aguardar botão continuar
  showImages?: boolean;
  optionImages?: string[];
  showIcons?: boolean;
  optionIcons?: string[];
  optionIds?: string[];
  spacing?: string;
  borderStyle?: string;
  shadowStyle?: string;
  hideInputs?: boolean;
  // Novos campos para elementos específicos
  heightUnit?: "cm" | "ft"; // Para altura - cm ou pés
  weightUnit?: "kg" | "lb"; // Para peso - kg ou libras
  showAgeCalculation?: boolean; // Para data de nascimento
  showBMICalculation?: boolean; // Para peso
  minAge?: number;
  maxAge?: number;
  
  // Opções visuais para elementos de altura e peso
  showUnitSelector?: boolean; // Mostrar seletor de unidade
  inputStyle?: "minimal" | "bordered" | "filled" | "rounded";
  labelPosition?: "top" | "left" | "inline";
  showIcon?: boolean;
  iconColor?: string;
  labelColor?: string;
  inputBackgroundColor?: string;
  inputBorderColor?: string;
  unitSelectorStyle?: "dropdown" | "tabs" | "buttons";
  
  // Campos específicos para elementos de transição
  backgroundType?: "solid" | "gradient" | "image";
  gradientDirection?: "to-r" | "to-l" | "to-t" | "to-b" | "to-br" | "to-bl" | "to-tr" | "to-tl";
  gradientFrom?: string;
  gradientTo?: string;
  backgroundImage?: string;
  counterStartValue?: number;
  counterEndValue?: number;
  counterDuration?: number;
  counterSuffix?: string;
  loaderType?: "spinner" | "dots" | "bars" | "pulse" | "ring";
  loaderColor?: string;
  loaderSize?: "sm" | "md" | "lg";
  redirectUrl?: string;
  redirectDelay?: number;
  showRedirectCounter?: boolean;
  visualEffect?: "fade" | "slide" | "zoom" | "bounce" | "none";
  effectDuration?: number;
  spacerSize?: "small" | "medium" | "large";
  
  // Propriedades específicas dos jogos
  wheelSegments?: string[];
  wheelColors?: string[];
  wheelWinningSegment?: number;
  wheelSpinDuration?: number;
  wheelShowPointer?: boolean;
  wheelPointerColor?: string;
  
  scratchCoverColor?: string;
  scratchRevealText?: string;
  scratchRevealImage?: string;
  scratchBrushSize?: number;
  
  colorOptions?: string[];
  colorCorrectAnswer?: string;
  colorInstruction?: string;
  
  brickRows?: number;
  brickColumns?: number;
  brickColors?: string[];
  paddleColor?: string;
  ballColor?: string;
  
  memoryCardPairs?: number;
  memoryCardTheme?: "numbers" | "colors" | "icons" | "custom";
  memoryCustomImages?: string[];
  
  slotSymbols?: string[];
  slotWinningCombination?: string[];
  slotReels?: number;
  
  // Propriedades específicas para áudio
  audioType?: "upload" | "elevenlabs";
  audioUrl?: string;
  audioFile?: File;
  elevenLabsText?: string;
  elevenLabsVoiceId?: string;
  elevenLabsApiKey?: string;
  audioDuration?: number;
  audioTitle?: string;
  showWaveform?: boolean;
  autoPlay?: boolean;
  
  // Propriedades específicas para botão continuar
  buttonText?: string;
  buttonUrl?: string;
  buttonAction?: "url" | "next_page";
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  buttonHoverColor?: string;
  buttonBorderRadius?: "none" | "small" | "medium" | "large" | "full";
  buttonSize?: "small" | "medium" | "large";
  isFixedFooter?: boolean;
  
  // Propriedades específicas para carregamento + pergunta
  loadingDuration?: number; // duração em segundos
  loadingBarColor?: string;
  loadingBarBackgroundColor?: string;
  loadingBarWidth?: "thin" | "medium" | "thick";
  loadingBarHeight?: "thin" | "small" | "medium" | "large" | "extra_large";
  loadingBarStyle?: "square" | "slightly_rounded" | "rounded" | "very_rounded";
  loadingText?: string;
  loadingTextSize?: "small" | "medium" | "large";
  loadingTextColor?: string;
  popupQuestion?: string;
  popupYesText?: string;
  popupNoText?: string;
  animationType?: "smooth" | "fast" | "bouncy" | "elastic" | "pulse" | "glow" | "wave" | "bounce";
  animationSpeed?: "slow" | "normal" | "fast";
  gradientStart?: string;
  gradientEnd?: string;
  showGlow?: boolean;
  showPercentage?: boolean;
  showTimeRemaining?: boolean;
  showStripes?: boolean;
  animateStripes?: boolean;
  percentageColor?: string;
  additionalText?: string;
  additionalTextColor?: string;
  
  // Propriedades específicas para compartilhamento
  shareMessage?: string;
  shareNetworks?: string[];
  shareButtonText?: string;
  shareButtonBackgroundColor?: string;
  shareButtonTextColor?: string;
  shareButtonBorderRadius?: "none" | "small" | "medium" | "large" | "full";
  shareButtonSize?: "small" | "medium" | "large";
  shareShowIcons?: boolean;
  shareIconSize?: "small" | "medium" | "large";
  shareLayout?: "vertical" | "horizontal";
  
  // Propriedades específicas para Análise de Respostas
  analysisTitle?: string;
  analysisItems?: string[];
  analysisLoadingDuration?: number; // duração em segundos para completar 100%
  analysisItemDelay?: number; // delay entre aparição dos itens em ms
  analysisCircleColor?: string;
  analysisTextColor?: string;
  analysisItemColor?: string;
  analysisCheckColor?: string;
  analysisAutoStart?: boolean;
  
  // Propriedades específicas para preço
  priceValue?: string;
  priceOriginalValue?: string;
  priceCurrency?: string;
  priceSymbol?: string;
  priceCurrencyPosition?: "left" | "right";
  priceLink?: string;
  priceLinkText?: string;
  priceDisplayStyle?: "simple" | "card" | "comparison" | "highlight" | "minimal";
  priceShowDiscount?: boolean;
  priceDiscountPercent?: number;
  priceShowStrikethrough?: boolean;
  priceAlignment?: "left" | "center" | "right";
  priceMainColor?: string;
  priceAccentColor?: string;
  priceBackgroundColor?: string;
  priceBorderColor?: string;
  priceTextColor?: string;
  priceOriginalColor?: string;
  priceDiscountColor?: string;
  priceFontSize?: "small" | "medium" | "large" | "xl" | "2xl";
  priceOriginalFontSize?: "small" | "medium" | "large";
  priceFontWeight?: "normal" | "medium" | "semibold" | "bold";
  priceBorderRadius?: "none" | "small" | "medium" | "large" | "full";
  pricePadding?: "none" | "small" | "medium" | "large";
  priceMargin?: "none" | "small" | "medium" | "large";
  priceShadow?: "none" | "small" | "medium" | "large";
  priceAnimation?: "none" | "pulse" | "bounce" | "shake" | "glow";
  priceShowBadge?: boolean;
  priceBadgeText?: string;
  priceBadgeColor?: string;
  priceBadgePosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  priceShowIcon?: boolean;
  priceIcon?: string;
  priceIconPosition?: "left" | "right" | "top" | "bottom";
  priceIconColor?: string;
  priceButtonStyle?: "contained" | "outlined" | "text" | "gradient";
  priceButtonColor?: string;
  priceButtonTextColor?: string;
  priceButtonHoverColor?: string;
  priceButtonBorderRadius?: "none" | "small" | "medium" | "large" | "full";
  priceButtonSize?: "small" | "medium" | "large";
  priceButtonFullWidth?: boolean;
  priceOpenInNewTab?: boolean;
  priceDescription?: string;
  priceFeatures?: string[];
  priceShowFeatures?: boolean;
  priceFeatureIcon?: string;
  
  // Gráfico Properties
  chartType?: "area" | "line" | "bar" | "pie" | "donut";
  chartData?: { label: string; value: number; color?: string }[];
  chartWidth?: string;
  chartHeight?: string;
  chartTitle?: string;
  chartShowLegend?: boolean;
  chartShowGrid?: boolean;
  chartShowAxes?: boolean;
  chartXLabel?: string;
  chartYLabel?: string;
  chartColors?: string[];
  chartGradient?: boolean;
  chartAnimation?: boolean;
  chartAnimationDuration?: number;
  chartBackgroundColor?: string;
  chartBorderRadius?: string;
  chartShadow?: boolean;
  
  // Métricas Properties
  metricsData?: { label: string; value: number; maxValue: number; color?: string; unit?: string }[];
  metricsLayout?: "horizontal" | "vertical" | "grid";
  metricsShowPercentage?: boolean;
  metricsShowValue?: boolean;
  metricsBarHeight?: string;
  metricsBarRadius?: string;
  metricsAnimation?: boolean;
  metricsAnimationDuration?: number;
  metricsLabelPosition?: "top" | "left" | "right" | "bottom";
  metricsBackgroundColor?: string;
  metricsTextColor?: string;
  
  // Planos Properties
  plansData?: {
    id: string;
    name: string;
    price: string;
    originalPrice?: string;
    currency: string;
    period: string;
    features: string[];
    highlighted?: boolean;
    badge?: string;
    buttonText: string;
    buttonLink: string;
    image?: string;
  }[];
  plansLayout?: "horizontal" | "vertical" | "grid";
  plansColumns?: number;
  plansStyle?: "card" | "simple" | "premium" | "minimal";
  plansShowDiscount?: boolean;
  plansAnimation?: boolean;
  plansCardRadius?: string;
  plansCardShadow?: boolean;
  plansHighlightColor?: string;
  
  // Antes/Depois Properties
  beforeAfterImages?: { before: string; after: string };
  beforeAfterMode?: "slider" | "auto" | "hover" | "click";
  beforeAfterOrientation?: "horizontal" | "vertical";
  beforeAfterLabels?: { before: string; after: string };
  beforeAfterShowLabels?: boolean;
  beforeAfterSliderColor?: string;
  beforeAfterBorderRadius?: string;
  beforeAfterAutoSpeed?: number;
  beforeAfterWidth?: string;
  beforeAfterHeight?: string;
  
  // FAQ Properties
  faqData?: { question: string; answer: string; id: string }[];
  faqStyle?: "accordion" | "card" | "simple" | "modern";
  faqOpenMultiple?: boolean;
  faqDefaultOpen?: string[];
  faqAnimation?: boolean;
  faqIconPosition?: "left" | "right";
  faqIcon?: string;
  faqBackgroundColor?: string;
  faqBorderColor?: string;
  faqTextColor?: string;
  faqHeaderColor?: string;
  
  // Carrossel Properties
  carouselImages?: { url: string; alt: string; caption?: string }[];
  carouselAutoplay?: boolean;
  carouselSpeed?: number;
  carouselShowDots?: boolean;
  carouselShowArrows?: boolean;
  carouselInfinite?: boolean;
  carouselSlidesToShow?: number;
  carouselSlidesToScroll?: number;
  carouselEffect?: "slide" | "fade" | "cube" | "coverflow";
  carouselArrowStyle?: "simple" | "rounded" | "square";
  carouselDotStyle?: "dots" | "lines" | "squares";
  carouselBorderRadius?: string;
  carouselImageFit?: "cover" | "contain" | "fill";
  
  // Stripe Embed Properties
  stripePublishableKey?: string;
  stripePrice?: string;
  stripeMode?: "payment" | "subscription";
  stripeSuccessUrl?: string;
  stripeCancelUrl?: string;
  stripeAllowPromotion?: boolean;
  stripeCustomerEmail?: string;
  stripeButtonText?: string;
  stripeButtonStyle?: "stripe" | "custom";
  stripeButtonColor?: string;
  stripeButtonRadius?: string;
  stripeTitle?: string;
  stripeDescription?: string;
  stripeShowLogo?: boolean;
  
  // Icon List Properties
  iconListData?: {
    id: string;
    icon: string;
    iconColor?: string;
    iconSize?: "small" | "medium" | "large";
    mainText: string;
    subText?: string;
    textColor?: string;
    subTextColor?: string;
    backgroundColor?: string;
    borderColor?: string;
  }[];
  iconListLayout?: "vertical" | "horizontal" | "grid";
  iconListColumns?: number;
  iconListSpacing?: "small" | "medium" | "large";
  iconListShowBackground?: boolean;
  iconListBorderRadius?: string;
  iconListTitle?: string;
  
  // Testimonials Properties
  testimonialsData?: {
    id: string;
    name: string;
    text: string;
    rating: number;
    photo?: string;
    position?: string;
    company?: string;
  }[];
  testimonialsLayout?: "vertical" | "horizontal" | "grid";
  testimonialsColumns?: number;
  testimonialsShowPhotos?: boolean;
  testimonialsShowRatings?: boolean;
  testimonialsStyle?: "card" | "quote" | "minimal" | "modern";
  testimonialsBackgroundColor?: string;
  testimonialsTextColor?: string;
  testimonialsTitle?: string;
  
  // Guarantee Properties
  guaranteeType?: "days" | "money_back" | "satisfaction" | "lifetime" | "custom";
  guaranteeTitle?: string;
  guaranteeDescription?: string;
  guaranteeDays?: number;
  guaranteeIcon?: string;
  guaranteeIconColor?: string;
  guaranteeBackgroundColor?: string;
  guaranteeBorderColor?: string;
  guaranteeTextColor?: string;
  guaranteeStyle?: "badge" | "card" | "banner" | "seal";
  guaranteePosition?: "center" | "left" | "right";
  guaranteeSize?: "small" | "medium" | "large";
  guaranteeAnimation?: boolean;
  iconListAlignment?: "left" | "center" | "right";
  iconListStyle?: "card" | "minimal" | "bordered" | "shadow";
  iconListAnimation?: boolean;
  iconListAnimationType?: "fade" | "slide" | "zoom" | "bounce";
  iconListIconPosition?: "left" | "top" | "right";
  iconListBackgroundColor?: string;
  iconListBorderRadius?: string;
  iconListPadding?: "small" | "medium" | "large";
  iconListMargin?: "small" | "medium" | "large";
  
  // Testimonials Properties
  testimonialsData?: {
    id: string;
    name: string;
    role?: string;
    company?: string;
    testimonial: string;
    rating?: number;
    avatar?: string;
    date?: string;
    verified?: boolean;
    featured?: boolean;
  }[];
  testimonialsLayout?: "single" | "grid" | "carousel" | "masonry";
  testimonialsColumns?: number;
  testimonialsStyle?: "card" | "quote" | "minimal" | "modern" | "elegant";
  testimonialsShowRating?: boolean;
  testimonialsShowDate?: boolean;
  testimonialsShowAvatar?: boolean;
  testimonialsShowVerified?: boolean;
  testimonialsAutoplay?: boolean;
  testimonialsSpeed?: number;
  testimonialsAnimation?: boolean;
  testimonialsAnimationType?: "fade" | "slide" | "zoom" | "flip";
  testimonialsBackgroundColor?: string;
  testimonialsTextColor?: string;
  testimonialsAccentColor?: string;
  testimonialsBorderColor?: string;
  testimonialsBorderRadius?: string;
  testimonialsPadding?: "small" | "medium" | "large";
  testimonialsMargin?: "small" | "medium" | "large";
  testimonialsShadow?: "none" | "small" | "medium" | "large";
  testimonialsQuoteIcon?: boolean;
  testimonialsQuoteColor?: string;
  testimonialsNameColor?: string;
  testimonialsRoleColor?: string;
  testimonialsCompanyColor?: string;
  
  // Guarantee Properties
  guaranteeTitle?: string;
  guaranteeDescription?: string;
  guaranteePeriod?: string;
  guaranteeIcon?: string;
  guaranteeIconColor?: string;
  guaranteeStyle?: "card" | "badge" | "minimal" | "modern" | "elegant";
  guaranteeBackgroundColor?: string;
  guaranteeBorderColor?: string;
  guaranteeTextColor?: string;
  guaranteeAccentColor?: string;
  guaranteeBorderRadius?: string;
  guaranteePadding?: "small" | "medium" | "large";
  guaranteeMargin?: "small" | "medium" | "large";
  guaranteeShadow?: "none" | "small" | "medium" | "large";
  guaranteeAnimation?: boolean;
  guaranteeAnimationType?: "fade" | "slide" | "zoom" | "bounce" | "pulse";
  guaranteeShowBadge?: boolean;
  guaranteeBadgeText?: string;
  guaranteeBadgeColor?: string;
  guaranteeFeatures?: string[];
  guaranteeShowFeatures?: boolean;
  guaranteeAlignment?: "left" | "center" | "right";
  
  // PayPal Properties
  paypalAmount?: string;
  paypalCurrency?: "USD" | "EUR" | "BRL" | "GBP" | "CAD" | "AUD";
  paypalIntent?: "sale" | "authorize" | "order";
  paypalButtonText?: string;
  paypalButtonStyle?: "gold" | "blue" | "silver" | "white" | "black";
  paypalButtonShape?: "rect" | "pill";
  paypalButtonSize?: "small" | "medium" | "large" | "responsive";
  paypalButtonLayout?: "vertical" | "horizontal";
  paypalDescription?: string;
  paypalTitle?: string;
  paypalShowLogo?: boolean;
  paypalEnvironment?: "sandbox" | "production";
  paypalClientId?: string;
  paypalSuccessUrl?: string;
  paypalCancelUrl?: string;
  paypalCustomStyle?: boolean;
  paypalCustomBackgroundColor?: string;
  paypalCustomTextColor?: string;
  paypalCustomBorderColor?: string;
  paypalCustomBorderRadius?: string;
  paypalAlignment?: "left" | "center" | "right";
  paypalMargin?: "small" | "medium" | "large";
  paypalPadding?: "small" | "medium" | "large";
  
  // Image with Text Properties
  imageWithTextUrl?: string;
  imageWithTextFile?: File;
  imageWithTextText?: string;
  imageWithTextTextPosition?: "bottom" | "top" | "overlay-bottom" | "overlay-top" | "overlay-center";
  imageWithTextTextAlign?: "left" | "center" | "right";
  imageWithTextTextSize?: "small" | "medium" | "large" | "xl";
  imageWithTextTextColor?: string;
  imageWithTextTextBackground?: string;
  imageWithTextTextPadding?: "small" | "medium" | "large";
  imageWithTextBorderStyle?: "none" | "solid" | "dashed" | "dotted" | "double";
  imageWithTextBorderColor?: string;
  imageWithTextBorderWidth?: "1" | "2" | "3" | "4" | "5";
  imageWithTextBorderRadius?: "none" | "small" | "medium" | "large" | "full";
  imageWithTextShadow?: "none" | "small" | "medium" | "large";
  imageWithTextWidth?: "auto" | "full" | "1/2" | "1/3" | "2/3" | "1/4" | "3/4";
  imageWithTextHeight?: "auto" | "small" | "medium" | "large" | "xl";
  imageWithTextObjectFit?: "cover" | "contain" | "fill" | "none";
  imageWithTextAlignment?: "left" | "center" | "right";
  imageWithTextMargin?: "small" | "medium" | "large";
  imageWithTextPadding?: "small" | "medium" | "large";
  imageWithTextAnimation?: boolean;
  imageWithTextAnimationType?: "fade" | "slide" | "zoom" | "bounce";
  imageWithTextOverlayOpacity?: "0" | "25" | "50" | "75" | "100";
  
  // Upsell Hotmart Properties
  hotmartProduct?: string;
  hotmartAffiliate?: string;
  hotmartTitle?: string;
  hotmartDescription?: string;
  hotmartPrice?: string;
  hotmartOriginalPrice?: string;
  hotmartDiscount?: string;
  hotmartImage?: string;
  hotmartButtonText?: string;
  hotmartButtonColor?: string;
  hotmartBadge?: string;
  hotmartFeatures?: string[];
  hotmartTestimonial?: string;
  hotmartTestimonialAuthor?: string;
  hotmartUrgency?: string;
  hotmartTimer?: boolean;
  hotmartTimerEndDate?: string;
  hotmartStyle?: "card" | "banner" | "popup" | "minimal";
  hotmartAnimation?: boolean;

  // Propriedades específicas para PIX Payment
  pixKey?: string;
  pixAmount?: number;
  pixDescription?: string;
  pixRecipientName?: string;
  pixCity?: string;
  pixButtonText?: string;
  pixButtonStyle?: "default" | "gradient" | "outline" | "minimal";
  pixButtonSize?: "small" | "medium" | "large";
  pixButtonColor?: string;
  pixTextColor?: string;
  pixQrSize?: "small" | "medium" | "large";
  pixQrPosition?: "center" | "left" | "right";
  pixShowKey?: boolean;
  pixShowCopy?: boolean;
  pixShowInstructions?: boolean;
  pixExpiration?: number;
  pixAutoClose?: boolean;
  pixPlaySound?: boolean;
  
  // Campos específicos para Leitura Facial
  facialTitle?: string;
  facialDescription?: string;
  facialMessage?: string;
  facialButtonText?: string;
  facialButtonColor?: string;
  
  // Campos específicos para Leitura de Mãos
  palmTitle?: string;
  palmDescription?: string;
  palmMessage?: string;
  palmButtonText?: string;
  palmButtonColor?: string;
}

interface QuizPage {
  id: number;
  title: string;
  elements: Element[];
  isTransition?: boolean;
  isGame?: boolean;
}

interface PageEditorProps {
  pages: QuizPage[];
  onPagesChange: (pages: QuizPage[]) => void;
  globalTheme?: "light" | "dark" | "custom";
  customBackgroundColor?: string;
  onThemeChange?: (theme: "light" | "dark" | "custom", customColor?: string) => void;
  onActivePageChange?: (pageIndex: number) => void;
}

export function PageEditorHorizontal({ 
  pages, 
  onPagesChange, 
  globalTheme: initialGlobalTheme = "light",
  customBackgroundColor: initialCustomBackgroundColor = "#ffffff",
  onThemeChange,
  onActivePageChange 
}: PageEditorProps) {
  const [activePage, setActivePage] = useState(0);

  // Notificar mudança de página ativa
  const handleActivePageChange = (pageIndex: number) => {
    setActivePage(pageIndex);
    if (onActivePageChange) {
      onActivePageChange(pageIndex);
    }
  };
  const [selectedElement, setSelectedElement] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'visual' | 'comportamento'>('visual');
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [editingPageTitle, setEditingPageTitle] = useState("");
  const [draggedPage, setDraggedPage] = useState<number | null>(null);
  const [dragOverPage, setDragOverPage] = useState<number | null>(null);
  const [globalTheme, setGlobalTheme] = useState<"light" | "dark" | "custom">(initialGlobalTheme);
  const [customBackgroundColor, setCustomBackgroundColor] = useState(initialCustomBackgroundColor);

  // Função para calcular cor de fundo baseada no tema
  const getBackgroundColor = () => {
    switch (globalTheme) {
      case "light":
        return "#ffffff";
      case "dark":
        return "#000000";
      case "custom":
        return customBackgroundColor;
      default:
        return "#ffffff";
    }
  };

  // Função para calcular cor de texto baseada no tema
  const getTextColor = () => {
    switch (globalTheme) {
      case "light":
        return "#000000";
      case "dark":
        return "#ffffff";
      case "custom":
        // Calcular contraste automático baseado na cor de fundo
        const color = customBackgroundColor;
        const r = parseInt(color.substr(1, 2), 16);
        const g = parseInt(color.substr(3, 2), 16);
        const b = parseInt(color.substr(5, 2), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? "#000000" : "#ffffff";
      default:
        return "#000000";
    }
  };


  // Função para traduzir os tipos de elementos
  const getElementTypeName = (type: string) => {
    const typeNames: Record<string, string> = {
      heading: "Título",
      paragraph: "Parágrafo", 
      image: "Imagem",
      video: "Vídeo",
      divider: "Divisória",
      multiple_choice: "Múltipla Escolha",
      text: "Campo de Texto",
      email: "Campo de Email",
      phone: "Campo de Telefone",
      number: "Campo Numérico",
      rating: "Avaliação",
      animated_transition: "Transição Animada",
      checkbox: "Checkbox",
      date: "Data",
      birth_date: "Data de Nascimento",
      height: "Altura",
      current_weight: "Peso Atual",
      target_weight: "Peso Desejado",
      textarea: "Área de Texto",
      image_upload: "Upload de Imagem",
      spacer: "Espaço",
      game_wheel: "Roleta",
      game_scratch: "Raspadinha",
      game_color_pick: "Escolha de Cor",
      game_brick_break: "Quebre o Muro",
      game_memory_cards: "Jogo da Memória",
      game_slot_machine: "Caça-Níquel",
      continue_button: "Botão Continuar",
      loading_question: "Carregamento + Pergunta"
    };
    return typeNames[type] || type;
  };

  // Função para converter imagem para WebP
  const convertToWebP = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          } else {
            reject(new Error('Falha na conversão'));
          }
        }, 'image/webp', 0.8);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // Função para criar embed de vídeo automático
  const getVideoEmbed = (url: string) => {
    if (!url) return null;
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    // TikTok
    const tiktokMatch = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
    if (tiktokMatch) {
      const videoId = tiktokMatch[1];
      return `https://www.tiktok.com/embed/v2/${videoId}`;
    }
    
    // Instagram
    const instagramMatch = url.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)/);
    if (instagramMatch) {
      const postId = instagramMatch[1];
      return `https://www.instagram.com/p/${postId}/embed`;
    }
    
    return null;
  };

  const elementCategories = [
    {
      name: "📝 Conteúdo",
      elements: [
        { type: "heading", label: "Título", icon: <Type className="w-4 h-4" /> },
        { type: "paragraph", label: "Texto", icon: <AlignLeft className="w-4 h-4" /> },
        { type: "divider", label: "Linha", icon: <Minus className="w-4 h-4" /> },
        { type: "spacer", label: "Espaço", icon: <ArrowUpDown className="w-4 h-4" /> },
      ]
    },
    {
      name: "❓ Perguntas",
      elements: [
        { type: "multiple_choice", label: "Múltipla", icon: <CheckSquare className="w-4 h-4" /> },
        { type: "text", label: "Campo", icon: <FileText className="w-4 h-4" /> },
        { type: "email", label: "Email", icon: <Mail className="w-4 h-4" /> },
        { type: "phone", label: "Telefone", icon: <Phone className="w-4 h-4" /> },
        { type: "number", label: "Número", icon: <Hash className="w-4 h-4" /> },
        { type: "rating", label: "Estrelas", icon: <Star className="w-4 h-4" /> },
        { type: "date", label: "Data", icon: <Calendar className="w-4 h-4" /> },
        { type: "textarea", label: "Área", icon: <TextArea className="w-4 h-4" /> },
        { type: "checkbox", label: "Seleção", icon: <CheckSquare className="w-4 h-4" /> },
        { type: "loading_question", label: "Carregamento + Pergunta", icon: <Loader className="w-4 h-4" /> },
      ]
    },
    {
      name: "📋 Formulário",
      elements: [
        { type: "birth_date", label: "Nascimento", icon: <Calendar className="w-4 h-4" /> },
        { type: "height", label: "Altura", icon: <ArrowUpDown className="w-4 h-4" /> },
        { type: "current_weight", label: "Peso Atual", icon: <Scale className="w-4 h-4" /> },
        { type: "target_weight", label: "Peso Meta", icon: <Target className="w-4 h-4" /> },
      ]
    },
    {
      name: "🎨 Mídia",
      elements: [
        { type: "image", label: "Imagem", icon: <ImageIcon className="w-4 h-4" /> },
        { type: "image_upload", label: "Upload", icon: <Upload className="w-4 h-4" /> },
        { type: "video", label: "Vídeo", icon: <Video className="w-4 h-4" /> },
        { type: "audio", label: "Áudio", icon: <Volume2 className="w-4 h-4" /> },
      ]
    },
    {
      name: "📄 Conteúdo Avançado",
      elements: [
        { type: "testimonials", label: "Depoimentos", icon: <MessageSquare className="w-4 h-4" /> },
        { type: "guarantee", label: "Garantia", icon: <Shield className="w-4 h-4" /> },
        { type: "icon_list", label: "Lista de Ícones", icon: <Star className="w-4 h-4" /> },
        { type: "faq", label: "FAQ", icon: <HelpCircle className="w-4 h-4" /> },
        { type: "image_with_text", label: "Imagem com Texto", icon: <ImageIcon className="w-4 h-4" /> },
        { type: "image_carousel", label: "Carrossel", icon: <ImageIcon className="w-4 h-4" /> },
        { type: "facial_reading", label: "Leitura Facial", icon: <Eye className="w-4 h-4" /> },
        { type: "palm_reading", label: "Leitura de Mãos", icon: <Hand className="w-4 h-4" /> },
      ]
    },
    {
      name: "🔄 Navegação",
      elements: [
        { type: "continue_button", label: "Botão", icon: <ArrowRight className="w-4 h-4" /> },
        { type: "share_quiz", label: "Compartilhar", icon: <Share2 className="w-4 h-4" /> },
        { type: "animated_transition", label: "Transição", icon: <Sparkles className="w-4 h-4" /> },
      ]
    },
    {
      name: "📊 Visualizações",
      elements: [
        { type: "chart", label: "Gráfico", icon: <BarChart3 className="w-4 h-4" /> },
        { type: "metrics", label: "Métricas", icon: <TrendingUp className="w-4 h-4" /> },
        { type: "before_after", label: "Antes/Depois", icon: <ArrowLeftRight className="w-4 h-4" /> },
      ]
    },
    {
      name: "💰 Vendas",
      elements: [
        { type: "pricing_plans", label: "Planos", icon: <CreditCard className="w-4 h-4" /> },
        { type: "stripe_embed", label: "Stripe", icon: <Shield className="w-4 h-4" /> },
        { type: "paypal", label: "PayPal", icon: <CreditCard className="w-4 h-4" /> },
        { type: "pix_payment", label: "PIX Direto", icon: <QrCode className="w-4 h-4" /> },
        { type: "hotmart_upsell", label: "Upsell Hotmart", icon: <Target className="w-4 h-4" /> },
      ]
    }
  ];

// Elementos específicos para páginas de transição
const transitionElementCategories = [
  {
    name: "🎨 Fundo",
    elements: [
      {
        type: "transition_background",
        label: "Cor de Fundo",
        icon: <Palette className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "📝 Conteúdo",
    elements: [
      {
        type: "transition_text",
        label: "Texto",
        icon: <Type className="w-4 h-4" />,
      },
      {
        type: "transition_counter",
        label: "Contador",
        icon: <Hash className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "⚡ Elementos Visuais",
    elements: [
      {
        type: "transition_loader",
        label: "Carregamento",
        icon: <Loader className="w-4 h-4" />,
      },
      {
        type: "animated_transition",
        label: "Transição Animada",
        icon: <Sparkles className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "🔄 Navegação",
    elements: [
      {
        type: "transition_button",
        label: "Botão Continuar",
        icon: <ArrowRight className="w-4 h-4" />,
      },
      {
        type: "transition_redirect",
        label: "Redirecionamento",
        icon: <ArrowRight className="w-4 h-4" />,
      },
    ],
  },

];

// Elementos específicos para páginas de jogos
const gameElementCategories = [
  {
    name: "🎰 Jogos de Sorte",
    elements: [
      {
        type: "game_wheel",
        label: "Roleta",
        icon: <BarChart3 className="w-4 h-4" />,
      },
      {
        type: "game_scratch",
        label: "Raspadinha",
        icon: <Volume2 className="w-4 h-4" />,
      },
      {
        type: "game_slot_machine",
        label: "Caça-Níquel",
        icon: <AlertCircle className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "🎯 Jogos de Habilidade",
    elements: [
      {
        type: "game_color_pick",
        label: "Escolha de Cor",
        icon: <Palette className="w-4 h-4" />,
      },
      {
        type: "game_memory_cards",
        label: "Jogo da Memória",
        icon: <Star className="w-4 h-4" />,
      },
      {
        type: "game_brick_break",
        label: "Quebre o Muro",
        icon: <Hash className="w-4 h-4" />,
      },
    ],
  },
];

  const currentPage = pages[activePage];
  const selectedElementData = selectedElement 
    ? currentPage?.elements.find(el => el.id === selectedElement)
    : null;

  const addPage = () => {
    const newPage: QuizPage = {
      id: Date.now(),
      title: `Página ${pages.length + 1}`,
      elements: []
    };
    onPagesChange([...pages, newPage]);
  };

  const addTransitionPage = () => {
    const newPage: QuizPage = {
      id: Date.now(),
      title: `Transição ${pages.filter(p => p.isTransition).length + 1}`,
      elements: [],
      isTransition: true
    };
    onPagesChange([...pages, newPage]);
  };

  const addGamePage = () => {
    const newPage: QuizPage = {
      id: Date.now(),
      title: `Jogo ${pages.filter(p => p.isGame).length + 1}`,
      elements: [],
      isGame: true
    };
    onPagesChange([...pages, newPage]);
  };

  const deletePage = (index: number) => {
    if (pages.length > 1) {
      const newPages = pages.filter((_, i) => i !== index);
      onPagesChange(newPages);
      if (activePage >= newPages.length) {
        handleActivePageChange(newPages.length - 1);
      }
    }
  };

  const reorderPages = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newPages = [...pages];
    const [draggedPage] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, draggedPage);
    
    onPagesChange(newPages);
    
    // Ajustar página ativa após reordenação
    if (activePage === fromIndex) {
      handleActivePageChange(toIndex);
    } else if (activePage > fromIndex && activePage <= toIndex) {
      handleActivePageChange(activePage - 1);
    } else if (activePage < fromIndex && activePage >= toIndex) {
      handleActivePageChange(activePage + 1);
    }
  };

  const startEditingPageTitle = (pageId: number, currentTitle: string) => {
    setEditingPageId(pageId);
    setEditingPageTitle(currentTitle);
  };

  const savePageTitle = (pageId: number) => {
    const newPages = pages.map(page => 
      page.id === pageId 
        ? { ...page, title: editingPageTitle.trim() || page.title }
        : page
    );
    onPagesChange(newPages);
    setEditingPageId(null);
    setEditingPageTitle("");
  };

  const cancelEditingPageTitle = () => {
    setEditingPageId(null);
    setEditingPageTitle("");
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedPage(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverPage(index);
  };

  const handleDragLeave = () => {
    setDragOverPage(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedPage !== null) {
      reorderPages(draggedPage, toIndex);
    }
    setDraggedPage(null);
    setDragOverPage(null);
  };

  const addElement = (type: Element["type"]) => {
    const baseElement: Element = {
      id: Date.now(),
      type,
      content: type === "heading" ? "Novo título" : type === "paragraph" ? "Novo parágrafo" : type === "continue_button" ? "Continuar" : type === "facial_reading" ? "Leitura Facial" : type === "palm_reading" ? "Leitura de Mãos" : "",
      question: undefined,
      options: type === "multiple_choice" ? ["Opção 1", "Opção 2"] : undefined,
      required: false,
      fieldId: type === "phone" ? `telefone_${Date.now()}` : `campo_${Date.now()}`,
      placeholder: "",
      fontSize: "base",
      textAlign: "left"
    };

    // Adicionar propriedades específicas por tipo
    const newElement: Element = {
      ...baseElement,
      ...(type === "birth_date" && {
        showAgeCalculation: true,
        minAge: 16,
        maxAge: 100
      }),
      ...(type === "height" && {
        unit: "cm" as const
      }),
      ...(type === "current_weight" && {
        showBMICalculation: true
      }),
      ...(type === "spacer" && {
        spacerSize: "medium" as const
      }),
      ...(type === "continue_button" && {
        buttonText: "Continuar",
        buttonAction: "next_page" as const,
        buttonSize: "medium" as const,
        buttonBorderRadius: "medium" as const,
        buttonBackgroundColor: "#10B981",
        buttonTextColor: "#FFFFFF",
        buttonHoverColor: "#059669",
        isFixedFooter: false
      }),
      ...(type === "loading_question" && {
        loadingDuration: 3,
        loadingBarColor: "#10B981",
        loadingBarBackgroundColor: "#E5E7EB",
        loadingBarWidth: "medium" as const,
        loadingBarHeight: "medium" as const,
        loadingBarStyle: "rounded" as const,
        loadingText: "Carregando...",
        loadingTextSize: "medium" as const,
        loadingTextColor: "#374151",
        popupQuestion: "Você gostaria de continuar?",
        popupYesText: "Sim",
        popupNoText: "Não",
        responseId: `pergunta_${Date.now()}`,
        animationType: "smooth" as const,
        showGlow: true,
        showPercentage: true,
        showTimeRemaining: false,
        showStripes: false,
        animateStripes: false,
        percentageColor: "#6B7280",
        additionalText: "",
        additionalTextColor: "#9CA3AF"
      }),
      ...(type === "facial_reading" && {
        facialTitle: "Leitura Facial",
        facialDescription: "Vamos analisar suas características faciais para revelar insights únicos sobre sua personalidade",
        facialMessage: "Sua análise facial revelou traços de liderança e criatividade únicos!",
        facialButtonText: "Iniciar Leitura Facial",
        facialButtonColor: "#3B82F6"
      }),
      ...(type === "palm_reading" && {
        palmTitle: "Leitura de Mãos",
        palmDescription: "Vamos analisar as linhas da sua mão para revelar seu destino e características únicas",
        palmMessage: "As linhas da sua mão revelam uma vida longa e próspera com grandes oportunidades!",
        palmButtonText: "Iniciar Leitura de Mãos",
        palmButtonColor: "#A855F7"
      })
    };

    const updatedPages = pages.map((page, index) => {
      if (index === activePage) {
        return {
          ...page,
          elements: [...page.elements, newElement]
        };
      }
      return page;
    });

    onPagesChange(updatedPages);
    setSelectedElement(newElement.id);
  };

  const updateElement = (elementId: number, updates: Partial<Element>) => {
    const updatedPages = pages.map((page, index) => {
      if (index === activePage) {
        return {
          ...page,
          elements: page.elements.map(el => 
            el.id === elementId ? { ...el, ...updates } : el
          )
        };
      }
      return page;
    });
    onPagesChange(updatedPages);
  };

  const deleteElement = (elementId: number) => {
    const updatedPages = pages.map((page, index) => {
      if (index === activePage) {
        return {
          ...page,
          elements: page.elements.filter(el => el.id !== elementId)
        };
      }
      return page;
    });
    onPagesChange(updatedPages);
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
  };

  const moveElement = (elementId: number, direction: "up" | "down") => {
    const updatedPages = pages.map((page, index) => {
      if (index === activePage) {
        const elements = [...page.elements];
        const currentIndex = elements.findIndex(el => el.id === elementId);
        
        if (direction === "up" && currentIndex > 0) {
          [elements[currentIndex], elements[currentIndex - 1]] = [elements[currentIndex - 1], elements[currentIndex]];
        } else if (direction === "down" && currentIndex < elements.length - 1) {
          [elements[currentIndex], elements[currentIndex + 1]] = [elements[currentIndex + 1], elements[currentIndex]];
        }
        
        return { ...page, elements };
      }
      return page;
    });
    onPagesChange(updatedPages);
  };

  function renderElementPreview(element: Element) {
    switch (element.type) {
      case "heading":
        const headingStyle = {
          fontSize: element.fontSize === "lg" ? "18px" : element.fontSize === "xl" ? "20px" : element.fontSize === "2xl" ? "24px" : element.fontSize === "3xl" ? "30px" : element.fontSize === "4xl" ? "36px" : "20px",
          fontWeight: element.fontWeight || "bold",
          fontStyle: element.fontStyle || "normal",
          textDecoration: element.textDecoration || "none",
          color: element.textColor || "#1f2937",
          backgroundColor: element.backgroundColor || "transparent",
          textAlign: (element.textAlign || "left") as any,
          padding: element.backgroundColor !== "transparent" ? "8px 12px" : "0",
          borderRadius: element.backgroundColor !== "transparent" ? "6px" : "0"
        };
        return (
          <h2 style={headingStyle}>
            {element.content}
          </h2>
        );
      case "paragraph":
        const paragraphStyle = {
          fontSize: element.fontSize === "sm" ? "14px" : element.fontSize === "lg" ? "18px" : "16px",
          fontWeight: element.fontWeight || "normal",
          fontStyle: element.fontStyle || "normal",
          textDecoration: element.textDecoration || "none",
          color: element.textColor || "#374151",
          backgroundColor: element.backgroundColor || "transparent",
          textAlign: (element.textAlign || "left") as any,
          padding: element.backgroundColor !== "transparent" ? "8px 12px" : "0",
          borderRadius: element.backgroundColor !== "transparent" ? "6px" : "0"
        };
        return (
          <p style={paragraphStyle}>
            {element.content}
          </p>
        );
      case "multiple_choice":
        const questionStyle = {
          fontSize: element.fontSize === "sm" ? "14px" : element.fontSize === "lg" ? "18px" : element.fontSize === "xl" ? "20px" : element.fontSize === "2xl" ? "24px" : "16px",
          fontWeight: element.fontWeight || "normal",
          fontStyle: element.fontStyle || "normal",
          textDecoration: element.textDecoration || "none",
          color: element.textColor || "#374151",
          backgroundColor: element.backgroundColor || "transparent",
          textAlign: (element.textAlign || "left") as any,
          padding: element.backgroundColor !== "transparent" ? "8px 12px" : "0",
          borderRadius: element.backgroundColor !== "transparent" ? "6px" : "0"
        };

        const containerClass = element.optionLayout === "horizontal" ? "flex flex-wrap gap-2" : 
                              element.optionLayout === "grid" ? "grid grid-cols-2 gap-2" : 
                              "space-y-2";

        const optionClass = element.buttonStyle === "rounded" ? "rounded-md" :
                           element.buttonStyle === "pills" ? "rounded-full" :
                           "rounded-sm";

        const spacingClass = element.spacing === "sm" ? "gap-1" :
                            element.spacing === "lg" ? "gap-4" :
                            "gap-2";

        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium" style={questionStyle}>
              {element.question || "Pergunta"}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className={`${containerClass} ${spacingClass}`}>
              {(element.options || []).map((option, index) => (
                <div key={index} className={`flex items-center space-x-2 p-3 border border-gray-200 hover:border-vendzz-primary hover:bg-vendzz-primary/5 cursor-pointer ${optionClass} ${element.borderStyle === "thick" ? "border-2" : ""} ${element.shadowStyle === "sm" ? "shadow-sm" : element.shadowStyle === "md" ? "shadow-md" : ""} transition-all`}>
                  {element.optionImages?.[index] && (
                    <img 
                      src={element.optionImages[index]} 
                      alt={option}
                      className="w-[60px] h-[60px] object-cover rounded border"
                    />
                  )}
                  {!element.hideInputs && (
                    <input 
                      type={element.multipleSelection ? "checkbox" : "radio"} 
                      name={`preview-${element.id}`} 
                      className="rounded" 
                    />
                  )}
                  <span className="text-sm flex-1 font-medium">{option}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case "text":
      case "email":
      case "phone":
      case "number":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.question || "Campo"}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={element.type === "email" ? "email" : element.type === "phone" ? "tel" : element.type === "number" ? "number" : "text"}
              placeholder={element.placeholder || `Digite ${element.type === "email" ? "seu email" : element.type === "phone" ? "seu telefone" : "aqui"}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        );
      case "textarea":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.question || "Área de Texto"}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              placeholder={element.placeholder || "Digite sua resposta aqui..."}
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
              rows={4}
            />
          </div>
        );
      case "date":
        return (
          <div className="space-y-2">
            {element.question && (
              <label className="block text-sm font-medium text-gray-700">
                {element.question}
                {element.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <label className="text-sm font-medium text-gray-700">
                {element.question || "Checkbox"}
                {element.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
          </div>
        );
      case "rating":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.question || "Avaliação"}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Star key={rating} className="w-6 h-6 text-yellow-400 cursor-pointer hover:text-yellow-500" />
              ))}
            </div>
          </div>
        );
      case "image":
        return (
          <div className="space-y-2">
            {element.imageUrl ? (
              <div 
                className="w-full"
                style={{ textAlign: element.textAlign || "center" }}
              >
                <img 
                  src={element.imageUrl} 
                  alt={element.content || "Imagem"} 
                  className="max-w-full h-auto rounded-lg border"
                />
              </div>
            ) : (
              <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    {element.content || "Adicione uma imagem"}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      case "divider":
        return (
          <div className="my-4">
            <hr className="border-gray-300" />
          </div>
        );
      case "image_upload":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.question || "Upload de Imagem"}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {element.imageUrl ? (
              <div 
                className="w-full"
                style={{ textAlign: element.textAlign || "center" }}
              >
                <img 
                  src={element.imageUrl} 
                  alt="Imagem carregada" 
                  className="max-w-full h-auto rounded-lg border max-h-64 object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-1">Clique para carregar imagem</p>
                  <p className="text-xs text-gray-400">Máximo 5MB - Conversão automática para WebP</p>
                </div>
              </div>
            )}
          </div>
        );
      case "video":
        const embedUrl = getVideoEmbed(element.content);
        return (
          <div className="space-y-2">
            {embedUrl ? (
              <div className="aspect-video w-full">
                <iframe
                  src={embedUrl}
                  className="w-full h-full rounded-lg border"
                  allowFullScreen
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            ) : (
              <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Video className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-1">
                    {element.content ? "URL de vídeo inválida" : "Adicione uma URL de vídeo"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Suporte: YouTube, Vimeo, TikTok, Instagram
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      case "birth_date":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.question || "Data de Nascimento"}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="DD/MM/AAAA"
            />
            {element.showAgeCalculation && (
              <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                💡 Idade será calculada automaticamente
              </div>
            )}
          </div>
        );
      case "height":
        const heightUnit = element.heightUnit || "cm";
        const showUnitSelector = element.showUnitSelector !== false;
        const inputStyle = element.inputStyle || "bordered";
        const labelPosition = element.labelPosition || "top";
        const showIcon = element.showIcon !== false;
        const unitSelectorStyle = element.unitSelectorStyle || "dropdown";
        
        const inputClasses = {
          minimal: "w-full p-3 border-0 border-b-2 bg-transparent focus:outline-none focus:border-purple-500",
          bordered: "w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500",
          filled: "w-full p-3 bg-purple-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500",
          rounded: "w-full p-3 border border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
        };
        
        return (
          <div 
            className="space-y-3 p-4 border-2 border-dashed rounded-lg"
            style={{ 
              backgroundColor: element.inputBackgroundColor || "#faf5ff",
              borderColor: element.inputBorderColor || "#e5e7eb"
            }}
          >
            <div className={`flex ${labelPosition === "left" ? "flex-row items-center space-x-3" : "flex-col"} gap-2`}>
              {showIcon && (
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <ArrowUpDown className="w-5 h-5" style={{ color: element.iconColor || "#9333ea" }} />
                </div>
              )}
              <div>
                <h3 
                  className="font-semibold text-purple-800"
                  style={{ color: element.labelColor || "#6b21a8" }}
                >
                  {element.question || "Altura"}
                </h3>
                <p className="text-sm text-purple-600">
                  {element.description || "Capture a altura do usuário"}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder={heightUnit === "cm" ? "Ex: 175" : "Ex: 5.9"}
                    className={inputClasses[inputStyle]}
                    style={{ 
                      backgroundColor: element.inputBackgroundColor || (inputStyle === "filled" ? "#faf5ff" : "white"),
                      borderColor: element.inputBorderColor || "#e5e7eb",
                      fontSize: '18px'
                    }}
                    min={element.min || (heightUnit === "cm" ? 120 : 3)}
                    max={element.max || (heightUnit === "cm" ? 250 : 8)}
                    step={heightUnit === "cm" ? 1 : 0.1}
                  />
                  
                  {showUnitSelector && (
                    <div className="flex-shrink-0">
                      {unitSelectorStyle === "dropdown" && (
                        <select 
                          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={heightUnit}
                        >
                          <option value="cm">cm</option>
                          <option value="ft">ft</option>
                        </select>
                      )}
                      
                      {unitSelectorStyle === "tabs" && (
                        <div className="flex bg-gray-100 rounded-lg p-1">
                          <button className={`px-3 py-1 text-sm rounded ${heightUnit === "cm" ? "bg-purple-500 text-white" : "text-gray-600"}`}>
                            cm
                          </button>
                          <button className={`px-3 py-1 text-sm rounded ${heightUnit === "ft" ? "bg-purple-500 text-white" : "text-gray-600"}`}>
                            ft
                          </button>
                        </div>
                      )}
                      
                      {unitSelectorStyle === "buttons" && (
                        <div className="flex space-x-2">
                          <button className={`px-3 py-2 text-sm border rounded-lg ${heightUnit === "cm" ? "bg-purple-500 text-white border-purple-500" : "border-gray-300"}`}>
                            cm
                          </button>
                          <button className={`px-3 py-2 text-sm border rounded-lg ${heightUnit === "ft" ? "bg-purple-500 text-white border-purple-500" : "border-gray-300"}`}>
                            ft
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {element.showBMICalculation && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Integração com IMC</span>
                    </div>
                    <div className="text-xs text-purple-700">
                      Será usado para calcular automaticamente o IMC quando combinado com o peso
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-xs text-purple-600 text-center">
              Elemento: Altura • Range: {heightUnit === "cm" ? "120-250cm" : "3-8ft"} • Unidade: {heightUnit.toUpperCase()}
            </div>
          </div>
        );
      case "current_weight":
        const currentWeightUnit = element.weightUnit || "kg";
        const showWeightUnitSelector = element.showUnitSelector !== false;
        const weightInputStyle = element.inputStyle || "bordered";
        const weightLabelPosition = element.labelPosition || "top";
        const showWeightIcon = element.showIcon !== false;
        const weightUnitSelectorStyle = element.unitSelectorStyle || "dropdown";
        
        const weightInputClasses = {
          minimal: "w-full p-3 border-0 border-b-2 bg-transparent focus:outline-none focus:border-blue-500",
          bordered: "w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
          filled: "w-full p-3 bg-blue-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
          rounded: "w-full p-3 border border-blue-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        };
        
        return (
          <div 
            className="space-y-3 p-4 border-2 border-dashed rounded-lg"
            style={{ 
              backgroundColor: element.inputBackgroundColor || "#eff6ff",
              borderColor: element.inputBorderColor || "#e5e7eb"
            }}
          >
            <div className={`flex ${weightLabelPosition === "left" ? "flex-row items-center space-x-3" : "flex-col"} gap-2`}>
              {showWeightIcon && (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Scale className="w-5 h-5" style={{ color: element.iconColor || "#3b82f6" }} />
                </div>
              )}
              <div>
                <h3 
                  className="font-semibold text-blue-800"
                  style={{ color: element.labelColor || "#1e40af" }}
                >
                  {element.question || "Peso Atual"}
                </h3>
                <p className="text-sm text-blue-600">
                  {element.description || "Capture o peso atual do usuário"}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder={currentWeightUnit === "kg" ? "Ex: 70.5" : "Ex: 155"}
                    className={weightInputClasses[weightInputStyle]}
                    style={{ 
                      backgroundColor: element.inputBackgroundColor || (weightInputStyle === "filled" ? "#eff6ff" : "white"),
                      borderColor: element.inputBorderColor || "#e5e7eb",
                      fontSize: '18px'
                    }}
                    min={element.min || (currentWeightUnit === "kg" ? 30 : 66)}
                    max={element.max || (currentWeightUnit === "kg" ? 300 : 660)}
                    step={currentWeightUnit === "kg" ? 0.1 : 0.1}
                  />
                  
                  {showWeightUnitSelector && (
                    <div className="flex-shrink-0">
                      {weightUnitSelectorStyle === "dropdown" && (
                        <select 
                          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={currentWeightUnit}
                        >
                          <option value="kg">kg</option>
                          <option value="lb">lb</option>
                        </select>
                      )}
                      
                      {weightUnitSelectorStyle === "tabs" && (
                        <div className="flex bg-gray-100 rounded-lg p-1">
                          <button className={`px-3 py-1 text-sm rounded ${currentWeightUnit === "kg" ? "bg-blue-500 text-white" : "text-gray-600"}`}>
                            kg
                          </button>
                          <button className={`px-3 py-1 text-sm rounded ${currentWeightUnit === "lb" ? "bg-blue-500 text-white" : "text-gray-600"}`}>
                            lb
                          </button>
                        </div>
                      )}
                      
                      {weightUnitSelectorStyle === "buttons" && (
                        <div className="flex space-x-2">
                          <button className={`px-3 py-2 text-sm border rounded-lg ${currentWeightUnit === "kg" ? "bg-blue-500 text-white border-blue-500" : "border-gray-300"}`}>
                            kg
                          </button>
                          <button className={`px-3 py-2 text-sm border rounded-lg ${currentWeightUnit === "lb" ? "bg-blue-500 text-white border-blue-500" : "border-gray-300"}`}>
                            lb
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {element.showBMICalculation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Cálculo automático do IMC</span>
                    </div>
                    <div className="text-xs text-blue-700">
                      Será calculado automaticamente quando altura e peso forem preenchidos
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-xs text-blue-600 text-center">
              Elemento: Peso Atual • Range: {currentWeightUnit === "kg" ? "30-300kg" : "66-660lb"} • Unidade: {currentWeightUnit.toUpperCase()}
            </div>
          </div>
        );
      case "target_weight":
        return (
          <div className="space-y-3 p-4 border-2 border-dashed border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-orange-800">Peso Objetivo</span>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {element.question || "Qual é seu peso objetivo?"}
                {element.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="300"
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg text-center font-semibold"
                    placeholder="65.0"
                    style={{ fontSize: '18px' }}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    kg
                  </span>
                </div>
                
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs text-orange-600 font-semibold">META</div>
                    <Target className="w-6 h-6 text-orange-700 mx-auto" />
                  </div>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Cálculo automático de diferença</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2 rounded border">
                    <div className="text-orange-600 font-semibold">Diferença</div>
                    <div className="text-orange-700 font-bold">-- kg</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="text-orange-600 font-semibold">Progresso</div>
                    <div className="text-orange-700 font-bold">--%</div>
                  </div>
                </div>
                <div className="text-xs text-orange-700 mt-2">
                  Calculado automaticamente com base no peso atual
                </div>
              </div>
              
              {element.description && (
                <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {element.description}
                </div>
              )}
            </div>
            
            <div className="text-xs text-orange-600 text-center">
              Elemento: Peso Objetivo • Range: 30-300kg • Cálculo de diferença automático
            </div>
          </div>
        );

      case "audio":
        const audioType = element.audioType || "upload";
        const audioTitle = element.audioTitle || "Mensagem de Áudio";
        const duration = element.audioDuration || 15;
        
        return (
          <div className="space-y-3 p-4 border-2 border-dashed border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Áudio</span>
            </div>
            
            {/* Visual estilo WhatsApp */}
            <div className="bg-white rounded-lg p-3 max-w-xs shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{audioTitle}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {/* Forma de onda simulada */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 8 }, (_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-green-400 rounded"
                          style={{ 
                            height: `${Math.random() * 16 + 4}px`,
                            opacity: i < 3 ? 1 : 0.3
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mt-2 text-right">
                {audioType === "elevenlabs" ? "🤖 ElevenLabs" : "📎 Upload"}
              </div>
            </div>
            
            <div className="text-xs text-green-600 text-center">
              Tipo: {audioType === "elevenlabs" ? "Texto para Fala (ElevenLabs)" : "Upload de Arquivo"}
              {audioType === "elevenlabs" && element.elevenLabsText && (
                <div className="text-gray-600 mt-1 italic">"{element.elevenLabsText.substring(0, 50)}..."</div>
              )}
              {audioType === "upload" && element.audioUrl && (
                <div className="text-gray-600 mt-1">Arquivo carregado</div>
              )}
            </div>
          </div>
        );

      case "continue_button":
        const buttonText = element.buttonText || "Continuar";
        const buttonAction = element.buttonAction || "next_page";
        const buttonSize = element.buttonSize || quiz.design?.buttonSize || "medium";
        const buttonBorderRadius = element.buttonBorderRadius || quiz.design?.buttonStyle === "square" ? "none" : quiz.design?.buttonStyle === "pill" ? "full" : "medium";
        const buttonBgColor = element.buttonBackgroundColor || quiz.design?.buttonColor || "#10B981";
        const buttonTextColor = element.buttonTextColor || "#FFFFFF";
        const isFixedFooter = element.isFixedFooter || false;
        
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
          <div className="space-y-3 p-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Botão de Navegação</span>
            </div>
            
            <div className={`flex justify-center ${isFixedFooter ? 'p-4 bg-gray-100 border-t' : ''}`}>
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
                  relative overflow-hidden
                `}
              >
                <span className="relative z-10">{buttonText}</span>
              </button>
            </div>
            
            {isFixedFooter && (
              <div className="text-xs text-orange-600 text-center mt-2">
                🔒 Fixado no rodapé (sempre visível)
              </div>
            )}
            
            <div className="text-xs text-blue-600 text-center">
              Ação: {buttonAction === "next_page" ? "Próxima página" : "URL personalizada"}
              {buttonAction === "url" && element.buttonUrl && (
                <div className="text-gray-600 mt-1">→ {element.buttonUrl}</div>
              )}
            </div>
          </div>
        );

      case "transition_button":
        const transitionButtonText = element.buttonText || "Continuar";
        const transitionButtonAction = element.buttonAction || "next_page";
        const transitionButtonSize = element.buttonSize || "medium";
        const transitionButtonBorderRadius = element.buttonBorderRadius || "medium";
        const transitionButtonBgColor = element.buttonBackgroundColor || "#10B981";
        const transitionButtonTextColor = element.buttonTextColor || "#FFFFFF";
        
        const transitionSizeClasses = {
          small: "px-4 py-2 text-sm",
          medium: "px-6 py-3 text-base",
          large: "px-8 py-4 text-lg"
        };
        
        const transitionRadiusClasses = {
          none: "rounded-none",
          small: "rounded-sm",
          medium: "rounded-md",
          large: "rounded-lg",
          full: "rounded-full"
        };
        
        return (
          <div className="space-y-3 p-4 border-2 border-dashed border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Botão de Transição</span>
            </div>
            
            <div className="flex justify-center">
              <button
                style={{
                  backgroundColor: transitionButtonBgColor,
                  color: transitionButtonTextColor,
                }}
                className={`
                  ${transitionSizeClasses[transitionButtonSize]} 
                  ${transitionRadiusClasses[transitionButtonBorderRadius]}
                  font-medium shadow-lg transform transition-all duration-200
                  hover:scale-105 hover:shadow-xl
                  relative overflow-hidden
                `}
              >
                <span className="relative z-10">{transitionButtonText}</span>
              </button>
            </div>
            
            <div className="text-xs text-green-600 text-center">
              Ação: {transitionButtonAction === "next_page" ? "Próxima página" : "URL personalizada"}
              {transitionButtonAction === "url" && element.buttonUrl && (
                <div className="text-gray-600 mt-1">→ {element.buttonUrl}</div>
              )}
            </div>
          </div>
        );

      case "transition_background":
        let backgroundStyle = {};
        if (element.backgroundType === "gradient") {
          backgroundStyle = {
            background: `linear-gradient(${element.gradientDirection || "to-r"}, ${element.gradientFrom || "#8B5CF6"}, ${element.gradientTo || "#EC4899"})`
          };
        } else if (element.backgroundType === "image" && element.backgroundImage) {
          backgroundStyle = {
            backgroundImage: `url(${element.backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          };
        } else {
          backgroundStyle = {
            backgroundColor: element.backgroundColor || "#8B5CF6"
          };
        }
        
        return (
          <div 
            className="space-y-3 p-4 border-2 border-dashed border-purple-200 rounded-lg min-h-[120px] flex flex-col justify-center"
            style={backgroundStyle}
          >
            <div className="flex items-center gap-2 bg-white/90 rounded px-2 py-1">
              <Palette className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-800">Fundo de Transição</span>
            </div>
            <div className="text-sm text-white bg-black/50 rounded px-2 py-1">
              Tipo: {element.backgroundType || "Cor sólida"}
            </div>
          </div>
        );
      case "transition_text":
        const textStyle = {
          fontSize: element.fontSize === "sm" ? "14px" : 
                   element.fontSize === "base" ? "16px" :
                   element.fontSize === "lg" ? "18px" :
                   element.fontSize === "xl" ? "20px" :
                   element.fontSize === "2xl" ? "24px" :
                   element.fontSize === "3xl" ? "30px" :
                   element.fontSize === "4xl" ? "36px" : "20px",
          fontWeight: element.fontWeight || "semibold",
          textAlign: (element.textAlign || "center") as "left" | "center" | "right",
          fontStyle: element.fontStyle || "normal",
          color: element.textColor || "#1F2937"
        };
        
        return (
          <div className="space-y-3 p-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Texto de Transição</span>
            </div>
            <div 
              className="p-4 bg-white rounded border"
              style={textStyle}
            >
              {element.content || "Preparando sua experiência..."}
            </div>
          </div>
        );
      case "transition_counter":
        const counterColor = element.color || "#10B981";
        const counterSize = element.fontSize === "xl" ? "text-xl" :
                           element.fontSize === "2xl" ? "text-2xl" :
                           element.fontSize === "3xl" ? "text-3xl" :
                           element.fontSize === "4xl" ? "text-4xl" :
                           element.fontSize === "5xl" ? "text-5xl" : "text-3xl";
        
        const isChronometer = (element as any).counterType === "chronometer";
        
        return (
          <div className="space-y-3 p-4 border-2 border-dashed border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">
                {isChronometer ? "Cronômetro Promocional" : "Contador Regressivo"}
              </span>
            </div>
            <div className="text-center">
              {isChronometer ? (
                <div 
                  className={`${counterSize} font-bold`}
                  style={{ color: counterColor }}
                >
                  {String((element as any).chronometerHours || 0).padStart(2, '0')}:
                  {String((element as any).chronometerMinutes || 15).padStart(2, '0')}:
                  {String((element as any).chronometerSeconds || 30).padStart(2, '0')}
                </div>
              ) : (
                <div 
                  className={`${counterSize} font-bold`}
                  style={{ color: counterColor }}
                >
                  {element.counterStartValue || 10}s
                </div>
              )}
            </div>
          </div>
        );
      case "transition_loader":
        const loaderColor = element.loaderColor || "#F59E0B";
        const loaderSize = element.loaderSize === "sm" ? "h-6 w-6" :
                          element.loaderSize === "lg" ? "h-12 w-12" :
                          element.loaderSize === "xl" ? "h-16 w-16" : "h-8 w-8";
        
        const renderSpinner = () => {
          const loaderType = (element as any).loaderType || "spinner";
          
          switch (loaderType) {
            case "dots":
              return (
                <div className="flex space-x-1">
                  <div className={`${loaderSize} bg-current rounded-full animate-bounce`} style={{ color: loaderColor }}></div>
                  <div className={`${loaderSize} bg-current rounded-full animate-bounce`} style={{ color: loaderColor, animationDelay: "0.1s" }}></div>
                  <div className={`${loaderSize} bg-current rounded-full animate-bounce`} style={{ color: loaderColor, animationDelay: "0.2s" }}></div>
                </div>
              );
            case "bars":
              return (
                <div className="flex space-x-1">
                  <div className={`w-1 ${loaderSize} bg-current animate-pulse`} style={{ color: loaderColor }}></div>
                  <div className={`w-1 ${loaderSize} bg-current animate-pulse`} style={{ color: loaderColor, animationDelay: "0.1s" }}></div>
                  <div className={`w-1 ${loaderSize} bg-current animate-pulse`} style={{ color: loaderColor, animationDelay: "0.2s" }}></div>
                </div>
              );
            case "pulse":
              return (
                <div className={`${loaderSize} bg-current rounded-full animate-ping`} style={{ color: loaderColor }}></div>
              );
            case "ring":
              return (
                <div className={`${loaderSize} border-4 border-gray-200 border-t-current rounded-full animate-spin`} style={{ borderTopColor: loaderColor }}></div>
              );
            case "ripple":
              return (
                <div className="relative inline-block">
                  <div className={`${loaderSize} border-2 border-current rounded-full animate-ping absolute`} style={{ borderColor: loaderColor }}></div>
                  <div className={`${loaderSize} border-2 border-current rounded-full animate-ping absolute`} style={{ borderColor: loaderColor, animationDelay: "0.5s" }}></div>
                </div>
              );
            default:
              return (
                <div className={`${loaderSize} border-2 border-gray-200 border-t-current rounded-full animate-spin`} style={{ borderTopColor: loaderColor }}></div>
              );
          }
        };
        
        const textColor = element.textColor || "#6B7280";
        const textSize = element.fontSize === "sm" ? "text-sm" :
                        element.fontSize === "lg" ? "text-lg" :
                        element.fontSize === "xl" ? "text-xl" : "text-base";
        
        return (
          <div className="space-y-3 p-4 border-2 border-dashed border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-center gap-2">
              <Loader className="w-4 h-4 text-orange-600 animate-spin" />
              <span className="font-medium text-orange-800">Carregamento</span>
            </div>
            <div className="flex flex-col items-center space-y-3 p-4">
              {renderSpinner()}
              
              {element.content && (
                <div className={`${textSize} font-medium`} style={{ color: textColor }}>
                  {element.content}
                </div>
              )}
              
              {((element as any).alternatingText1 || (element as any).alternatingText2) && (
                <div className="text-center space-y-1">
                  {(element as any).alternatingText1 && (
                    <div className={`${textSize} animate-pulse`} style={{ color: textColor }}>
                      {(element as any).alternatingText1} ({(element as any).alternatingDuration1 || 2}s)
                    </div>
                  )}
                  {(element as any).alternatingText2 && (
                    <div className={`${textSize} animate-pulse`} style={{ color: textColor, animationDelay: "1s" }}>
                      {(element as any).alternatingText2} ({(element as any).alternatingDuration2 || 2}s)
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="text-xs text-orange-600 text-center">
              Tipo: {(element as any).loaderType || "spinner"} • Tamanho: {element.loaderSize || "md"}
            </div>
          </div>
        );
      case "transition_redirect":
        const redirectType = (element as any).redirectType || "url";
        const redirectText = element.content || "Redirecionando em...";
        const redirectTextColor = element.textColor || "#DC2626";
        
        return (
          <div className="space-y-3 p-4 border-2 border-dashed border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-800">Redirecionamento</span>
            </div>
            
            <div className="text-center p-4 bg-white rounded border">
              <div className="text-lg font-medium mb-2" style={{ color: redirectTextColor }}>
                {redirectText}
              </div>
              
              {element.showRedirectCounter && (
                <div className="text-2xl font-bold text-red-600 mb-2">
                  {element.redirectDelay || 5}
                </div>
              )}
              
              <div className="text-sm text-gray-600">
                {redirectType === "url" ? (
                  <>Para: {element.redirectUrl || "https://exemplo.com"}</>
                ) : (
                  <>Para: Próxima página</>
                )}
              </div>
            </div>
            
            <div className="text-xs text-red-600 text-center">
              Tipo: {redirectType === "url" ? "URL Externa" : "Próxima Página"} • 
              Delay: {element.redirectDelay || 5}s
            </div>
          </div>
        );
        
      // Elementos de jogos
      case "game_wheel":
        const wheelSegments = element.wheelSegments || ["5000", "10", "500", "100", "2500", "50", "250", "x2", "100", ":2", "1000", "50", "250", "20", "*"];
        const wheelColors = element.wheelColors || ["#FF0000", "#0000FF", "#FFDD00", "#FFA500", "#4B0082", "#00CC00", "#EE82EE", "#FF0000", "#FFA500", "#FFDD00", "#00CC00", "#0000FF", "#4B0082", "#EE82EE", "#222222"];
        const winningSegment = element.wheelWinningSegment || 0;
        
        return (
          <div className="space-y-4 p-6 border-2 border-dashed border-yellow-200 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-yellow-400" />
              <span className="font-bold text-yellow-300 text-lg">🎡 Roda da Fortuna Premium</span>
            </div>
            
            <div className="flex flex-col items-center space-y-6">
              {/* Scores */}
              <div className="flex justify-between w-full max-w-md text-white font-mono text-2xl">
                <div>Score: <span id={`score-${element.id}`} className="text-yellow-400">0</span></div>
                <div>Round: <span id={`round-${element.id}`} className="text-green-400">10</span></div>
              </div>
              
              {/* Container da roda da fortuna */}
              <div className="casing relative">
                <div 
                  id={`wheel-fortune-${element.id}`}
                  className="wheel relative w-96 h-96 border-2 border-gray-400 rounded-full shadow-xl cursor-pointer overflow-hidden"
                  style={{ 
                    boxShadow: '0 0 20px 4px rgba(0,0,0,0.3)',
                    background: 'conic-gradient(from 0deg, ' + wheelColors.map((color, i) => 
                      `${color} ${i * 360/wheelSegments.length}deg ${(i + 1) * 360/wheelSegments.length}deg`
                    ).join(', ') + ')'
                  }}
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      (window as any).spinFortuneWheel && (window as any).spinFortuneWheel(`wheel-fortune-${element.id}`, wheelSegments, wheelColors, element.id);
                    }
                  }}
                >
                  {/* Segmentos com texto */}
                  <div className="center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    {wheelSegments.map((segment, index) => {
                      const angle = (360 / wheelSegments.length) * index;
                      return (
                        <div
                          key={index}
                          className="txt absolute text-white font-bold text-xl"
                          style={{
                            transform: `rotate(${angle + 180}deg) translateY(-140px) rotate(180deg)`,
                            transformOrigin: '50% 140px',
                            textShadow: '0 0 6px rgba(255,165,0,0.8)',
                            fontFamily: 'monospace'
                          }}
                        >
                          {segment.toString().split('').join('\n')}
                        </div>
                      );
                    })}
                    
                    {/* Divisores */}
                    {wheelSegments.map((_, index) => (
                      <div
                        key={`divider-${index}`}
                        className="divider absolute w-px h-48 bg-black"
                        style={{
                          transform: `rotate(${(360 / wheelSegments.length) * (index + 0.5)}deg)`,
                          transformOrigin: '50% 0'
                        }}
                      >
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"></div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Centro da roda */}
                  <div className="cap absolute top-1/2 left-1/2 w-20 h-20 bg-black border-4 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg z-10"></div>
                </div>
                
                {/* Ponteiro */}
                <div 
                  id={`pin-${element.id}`}
                  className="pin absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-20"
                  style={{
                    transformOrigin: '50% 4px',
                    width: '0px',
                    height: '0px',
                    borderStyle: 'solid',
                    borderWidth: '0 20px 40px 20px',
                    borderColor: 'transparent transparent #ffffff transparent',
                    borderRadius: '8px',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                  }}
                >
                </div>
              </div>
            </div>
            
            {/* Informações dos prêmios */}
            <div className="bg-black/50 rounded-lg p-4 backdrop-blur-sm">
              <div className="grid grid-cols-5 gap-2 text-xs">
                {wheelSegments.slice(0, 10).map((segment, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 rounded text-white font-bold text-center"
                    style={{ backgroundColor: wheelColors[index] || "#333" }}
                  >
                    {segment}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="text-xs text-yellow-400 text-center font-medium">
              ⚡ Roda da Fortuna Realística • {wheelSegments.length} Prêmios • Animação Premium • Clique para girar
            </div>
          </div>
        );

      case "game_scratch":
        return (
          <div className="space-y-3 p-4 border-2 border-dashed border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Raspadinha</span>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-48 h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
                <div 
                  className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-green-600"
                  style={{ backgroundColor: element.scratchCoverColor || "#e5e7eb" }}
                >
                  {element.scratchRevealText || "PARABÉNS!"}
                </div>
                <div className="absolute top-2 left-2 w-16 h-8 bg-transparent border-2 border-dashed border-white opacity-50"></div>
                <div className="absolute bottom-2 right-2 w-12 h-6 bg-transparent border-2 border-dashed border-white opacity-50"></div>
              </div>
              
              <div className="text-sm text-gray-600 text-center">
                ↑ Raspe aqui para revelar o prêmio
              </div>
              
              <div className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                Tamanho do pincel: {element.scratchBrushSize || 20}px
              </div>
            </div>
          </div>
        );

      case "game_color_pick":
        const colorOptions = element.colorOptions || ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57"];
        const correctColor = element.colorCorrectAnswer || colorOptions[0];
        
        return (
          <div className="space-y-3 p-4 border-2 border-dashed border-purple-200 rounded-lg bg-purple-50">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-800">Escolha de Cor</span>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <h4 className="font-medium text-gray-800 mb-2">
                  {element.colorInstruction || "Escolha a cor da sorte!"}
                </h4>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {colorOptions.map((color, index) => (
                  <button
                    key={index}
                    className={`w-16 h-16 rounded-full border-4 transition-all ${
                      color === correctColor ? 'border-yellow-400 ring-2 ring-yellow-300' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              <div className="text-xs text-purple-600 text-center">
                Cor vencedora: {correctColor} • {colorOptions.length} opções
              </div>
            </div>
          </div>
        );

      case "game_brick_break":
        const rows = element.brickRows || 3;
        const columns = element.brickColumns || 6;
        
        return (
          <div className="space-y-3 p-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Quebre o Muro</span>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-black p-4 rounded-lg" style={{ width: '200px', height: '160px' }}>
                {/* Blocos */}
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                  {Array.from({ length: rows * columns }, (_, index) => (
                    <div
                      key={index}
                      className="h-4 rounded-sm"
                      style={{ 
                        backgroundColor: element.brickColors?.[index % (element.brickColors?.length || 3)] || 
                        (index % 3 === 0 ? '#FF6B6B' : index % 3 === 1 ? '#4ECDC4' : '#45B7D1')
                      }}
                    />
                  ))}
                </div>
                
                {/* Barra */}
                <div 
                  className="mx-auto mt-4 h-2 w-12 rounded-full"
                  style={{ backgroundColor: element.paddleColor || '#FFFFFF' }}
                />
                
                {/* Bola */}
                <div 
                  className="w-2 h-2 rounded-full mx-auto mt-2"
                  style={{ backgroundColor: element.ballColor || '#FECA57' }}
                />
              </div>
              
              <div className="text-xs text-blue-600 text-center">
                {rows}x{columns} blocos • Use as setas ← → para mover
              </div>
            </div>
          </div>
        );

      case "game_memory_cards":
        const pairs = element.memoryCardPairs || 4;
        const theme = element.memoryCardTheme || "numbers";
        
        return (
          <div className="space-y-3 p-4 border-2 border-dashed border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Jogo da Memória</span>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: pairs * 2 }, (_, index) => (
                  <div
                    key={index}
                    className="w-12 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm"
                  >
                    {index < 2 ? (
                      theme === "numbers" ? Math.floor(index / 2) + 1 :
                      theme === "colors" ? "🔴" :
                      theme === "icons" ? "⭐" : "?"
                    ) : "?"}
                  </div>
                ))}
              </div>
              
              <div className="text-xs text-green-600 text-center">
                {pairs} pares • Tema: {theme} • Clique para virar
              </div>
            </div>
          </div>
        );

      case "game_slot_machine":
        const symbols = element.slotSymbols || ["🍌", "7️⃣", "🍒", "🍇", "🍊", "🔔", "❌", "🍋", "🍈"];
        const reels = element.slotReels || 3;
        
        return (
          <div className="space-y-4 p-6 border-2 border-dashed border-yellow-200 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <span className="font-bold text-yellow-800">🎰 Slot Machine Premium</span>
            </div>
            
            <div className="flex flex-col items-center space-y-6">
              {/* Container principal do slot machine */}
              <div className="relative bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 p-6 rounded-2xl border-4 border-gray-500 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-2xl"></div>
                
                {/* Slots container */}
                <div className="slots-container flex gap-3 relative z-10" id={`slots-${element.id}`}>
                  {Array.from({ length: reels }, (_, index) => (
                    <div key={index} className="reel-container relative">
                      <div 
                        className="reel w-20 h-24 border-2 border-gray-700 rounded-lg overflow-hidden bg-white shadow-inner"
                        style={{
                          backgroundImage: `url(data:image/svg+xml;base64,${btoa(`
                            <svg width="79" height="${79 * symbols.length}" xmlns="http://www.w3.org/2000/svg">
                              ${symbols.map((symbol, i) => `
                                <text x="39.5" y="${i * 79 + 55}" text-anchor="middle" 
                                      font-size="40" font-family="Arial, sans-serif">${symbol}</text>
                              `).join('')}
                            </svg>
                          `)})`,
                          backgroundRepeat: 'repeat-y',
                          backgroundPosition: '0 0'
                        }}
                      >
                        {/* Sobreposição com gradiente para efeito de profundidade */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none"></div>
                        <div className="absolute inset-0 shadow-inner rounded-lg pointer-events-none" style={{
                          boxShadow: 'inset 0 0 12px 4px rgba(0,0,0,0.3)'
                        }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Indicadores de linha de vitória */}
                <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60 z-20"></div>
              </div>
              
              {/* Painel de controle */}
              <div className="flex flex-col items-center space-y-3">
                <button 
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-bold text-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg border-2 border-red-400"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      (window as any).spinSlotMachine && (window as any).spinSlotMachine(`slots-${element.id}`, symbols, reels);
                    }
                  }}
                >
                  🎰 SPIN & WIN
                </button>
                
                {/* Debug info */}
                <div className="bg-black/80 text-yellow-400 px-3 py-1 rounded-full text-xs font-mono">
                  <span id={`debug-${element.id}`}>Pronto para jogar...</span>
                </div>
              </div>
            </div>
            
            {/* Informações do jogo */}
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex flex-wrap gap-2 text-xs justify-center">
                {symbols.map((symbol, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 rounded-full bg-gray-100 border border-gray-300"
                  >
                    {symbol}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="text-xs text-yellow-700 text-center font-medium">
              ⚡ Animação Premium • {reels} Rolos • {symbols.length} Símbolos • Combinações Dinâmicas
            </div>
          </div>
        );

      case "share_quiz":
        const shareButtonStyle = {
          backgroundColor: element.shareButtonBackgroundColor || "#10B981",
          color: element.shareButtonTextColor || "#FFFFFF",
          borderRadius: element.shareButtonBorderRadius === "none" ? "0px" :
                       element.shareButtonBorderRadius === "small" ? "4px" :
                       element.shareButtonBorderRadius === "medium" ? "8px" :
                       element.shareButtonBorderRadius === "large" ? "12px" :
                       element.shareButtonBorderRadius === "full" ? "9999px" : "8px",
          padding: element.shareButtonSize === "small" ? "6px 12px" :
                  element.shareButtonSize === "large" ? "12px 24px" : "8px 16px",
          fontSize: element.shareButtonSize === "small" ? "14px" :
                   element.shareButtonSize === "large" ? "18px" : "16px"
        };

        const networks = element.shareNetworks || ["whatsapp", "facebook", "twitter", "email"];
        const networkIcons = {
          whatsapp: "📱",
          facebook: "📘", 
          twitter: "🐦",
          instagram: "📸",
          email: "📧"
        };

        return (
          <div className="space-y-4 p-4 border-2 border-dashed border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Compartilhar Quiz</span>
            </div>
            
            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="text-sm text-gray-700">
                {element.shareMessage || "Faça esse teste e se surpreenda também!"}
              </div>
              
              <div className={`flex ${element.shareLayout === "vertical" ? "flex-col gap-2" : "flex-wrap gap-2"}`}>
                {networks.map((network) => (
                  <button
                    key={network}
                    style={shareButtonStyle}
                    className="flex items-center gap-2 transition-all hover:opacity-80"
                  >
                    {element.shareShowIcons !== false && (
                      <span className={`${element.shareIconSize === "small" ? "text-sm" : element.shareIconSize === "large" ? "text-lg" : "text-base"}`}>
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
            
            <div className="text-xs text-green-600 text-center">
              Redes selecionadas: {networks.length} • Layout: {element.shareLayout || "horizontal"}
            </div>
          </div>
        );

      case "animated_transition":
        const gradientStart = element.gradientStart || "#10B981";
        const gradientEnd = element.gradientEnd || "#8B5CF6";
        const animationType = element.animationType || "pulse";
        const animationSpeed = element.animationSpeed || "normal";
        
        const animationClass = animationType === "pulse" ? "animate-pulse" :
                              animationType === "glow" ? "animate-ping" :
                              animationType === "wave" ? "animate-bounce" :
                              animationType === "bounce" ? "animate-bounce" : "animate-pulse";
        
        const speedClass = animationSpeed === "slow" ? "duration-2000" :
                          animationSpeed === "fast" ? "duration-500" : "duration-1000";
        
        return (
          <div className="space-y-2">
            <div 
              className={`w-full h-32 bg-gradient-to-r rounded-lg flex items-center justify-center relative ${animationClass} ${speedClass}`}
              style={{ 
                backgroundImage: `linear-gradient(to right, ${gradientStart}, #3B82F6, ${gradientEnd})`
              }}
            >
              <div className="text-white text-center">
                <div className="text-lg font-bold mb-1">
                  {element.content || "Processando..."}
                </div>
                {element.description && (
                  <p className="text-sm opacity-90">{element.description}</p>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-pulse rounded-lg"></div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Elemento de transição • {animationType} • {animationSpeed}
            </p>
          </div>
        );

      case "response_analysis":
        const analysisItems = element.analysisItems || [
          "Calculating your overthinking score",
          "Evaluating your behavioral patterns", 
          "Identifying areas for improvement",
          "Generating potential solutions",
          "Developing your personalized plan"
        ];
        
        return (
          <div className="space-y-6 p-6 bg-white rounded-lg border border-gray-200 max-w-md mx-auto">
            {/* Círculo de progresso */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  {/* Círculo de fundo */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#f3f4f6"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Círculo de progresso */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke={element.analysisCircleColor || "#10b981"}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="314"
                    strokeDashoffset="0"
                    className="transition-all duration-2000 ease-out"
                  />
                </svg>
                {/* Texto 100% no centro */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span 
                    className="text-3xl font-bold"
                    style={{ color: element.analysisCircleColor || "#10b981" }}
                  >
                    100%
                  </span>
                </div>
              </div>
              
              {/* Título da análise */}
              <h3 
                className="text-lg font-medium mt-4 text-center"
                style={{ color: element.analysisTextColor || "#10b981" }}
              >
                {element.analysisTitle || "Analyzing your answers..."}
              </h3>
            </div>
            
            {/* Lista de itens com checkmarks */}
            <div className="space-y-3">
              {analysisItems.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-start space-x-3 opacity-100 transform translate-x-0 transition-all duration-500"
                  style={{ 
                    animationDelay: `${index * (element.analysisItemDelay || 800)}ms`,
                    color: element.analysisItemColor || "#374151"
                  }}
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: element.analysisCheckColor || "#10b981" }}
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        );

      // Novos elementos visuais
      case "chart":
        const chartData = element.chartData || [
          { label: "Ontem", value: 10, color: "#ef4444" },
          { label: "Hoje", value: 30, color: "#f59e0b" },
          { label: "Amanhã", value: 90, color: "#10b981" }
        ];
        
        return (
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            {element.chartTitle && (
              <h3 className="text-lg font-semibold text-gray-800">
                {element.chartTitle}
              </h3>
            )}
            
            <div className="relative" style={{ 
              width: element.chartWidth || "100%", 
              height: element.chartHeight || "300px" 
            }}>
              {element.chartType === "bar" && (
                <div className="w-full h-full flex items-end justify-center space-x-8 bg-gray-50 rounded-lg border p-4">
                  {chartData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-12 rounded-t-lg transition-all duration-500"
                        style={{ 
                          height: `${(item.value / 100) * 150}px`, 
                          backgroundColor: item.color || "#10b981"
                        }}
                      />
                      <span className="text-xs mt-2 text-gray-600">{item.label}</span>
                      <span className="text-xs text-gray-400">{item.value}%</span>
                    </div>
                  ))}
                </div>
              )}
              
              {element.chartType === "pie" && (
                <div className="w-full h-full flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-48 h-48">
                    <circle cx="100" cy="100" r="80" fill="#ef4444" />
                    <path d="M 100 100 L 100 20 A 80 80 0 0 1 180 100 Z" fill="#f59e0b" />
                    <path d="M 100 100 L 180 100 A 80 80 0 0 1 100 180 Z" fill="#10b981" />
                    <text x="100" y="105" textAnchor="middle" className="text-sm font-medium" fill="white">
                      Dados
                    </text>
                  </svg>
                </div>
              )}
            </div>
            
            {element.chartShowLegend && (
              <div className="flex justify-center space-x-4">
                {chartData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color || "#10b981" }}
                    />
                    <span className="text-xs text-gray-600">{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "metrics":
        const metricsData = element.metricsData || [
          { label: "Conversões", value: 85, maxValue: 100, color: "#10b981", unit: "%" },
          { label: "Engajamento", value: 72, maxValue: 100, color: "#3b82f6", unit: "%" },
          { label: "Retenção", value: 94, maxValue: 100, color: "#8b5cf6", unit: "%" }
        ];
        
        return (
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            <div className="space-y-3">
              {metricsData.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {metric.label}
                    </span>
                    {element.metricsShowValue && (
                      <span className="text-sm font-bold" style={{ color: metric.color }}>
                        {metric.value}{metric.unit}
                      </span>
                    )}
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ 
                        width: `${(metric.value / metric.maxValue) * 100}%`,
                        backgroundColor: metric.color
                      }}
                    />
                  </div>
                  
                  {element.metricsShowPercentage && (
                    <div className="text-xs text-gray-500 text-right">
                      {Math.round((metric.value / metric.maxValue) * 100)}% do objetivo
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "pricing_plans":
        const plansData = element.plansData || [
          {
            id: "7days",
            name: "7-day plan",
            price: "$6.93",
            originalPrice: "$13.86",
            currency: "USD",
            period: "per day",
            pricePerDay: "0.99",
            highlighted: false,
            badge: "",
            buttonText: "Claim my plan",
            buttonLink: "#"
          },
          {
            id: "1month",
            name: "1-month plan",
            price: "$19.99",
            originalPrice: "$39.98",
            currency: "USD", 
            period: "per day",
            pricePerDay: "0.66",
            highlighted: true,
            badge: "MOST POPULAR",
            buttonText: "Claim my plan",
            buttonLink: "#"
          },
          {
            id: "3months",
            name: "3-month plan",
            price: "$39.99",
            originalPrice: "$79.98",
            currency: "USD",
            period: "per day", 
            pricePerDay: "0.44",
            highlighted: false,
            badge: "",
            buttonText: "Claim my plan",
            buttonLink: "#"
          }
        ];
        
        return (
          <div className="space-y-4 p-4 max-w-md mx-auto">
            <div className="space-y-3">
              {plansData.map((plan, index) => (
                <div key={plan.id} className="relative">
                  {/* Badge destacado */}
                  {plan.highlighted && plan.badge && (
                    <div className="mb-2">
                      <div className="bg-green-500 text-white text-center py-2 px-4 rounded-lg text-sm font-semibold">
                        {plan.badge}
                      </div>
                    </div>
                  )}
                  
                  {/* Card do plano */}
                  <div 
                    className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                      plan.highlighted 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {/* Radio button e informações do plano */}
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          plan.highlighted 
                            ? 'border-green-500 bg-green-500' 
                            : 'border-gray-300'
                        }`}>
                          {plan.highlighted && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-gray-800">{plan.name}</h3>
                          <div className="flex items-center space-x-2">
                            {plan.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                {plan.originalPrice}
                              </span>
                            )}
                            <span className="font-bold text-gray-800">{plan.price}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Preço por dia */}
                      <div className="text-right">
                        <div className="bg-gray-100 rounded-lg px-3 py-2">
                          <div className="text-xs text-gray-600 uppercase">{plan.currency}</div>
                          <div className="text-2xl font-bold text-gray-800">
                            {plan.pricePerDay}
                          </div>
                          <div className="text-xs text-gray-600">{plan.period}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Botão principal */}
            <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
              <span>{plansData[0]?.buttonText || "Claim my plan"}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        );

      case "before_after":
        return (
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            <div className="relative overflow-hidden rounded-lg" style={{ 
              width: element.beforeAfterWidth || "100%", 
              height: element.beforeAfterHeight || "400px" 
            }}>
              <div className="absolute inset-0 flex">
                <div className="w-1/2 bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-6xl mb-2">😔</div>
                    <h3 className="text-xl font-bold">
                      {element.beforeAfterLabels?.before || "ANTES"}
                    </h3>
                    <p className="text-sm opacity-90">Situação anterior</p>
                  </div>
                </div>
                
                <div className="w-1/2 bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-6xl mb-2">😊</div>
                    <h3 className="text-xl font-bold">
                      {element.beforeAfterLabels?.after || "DEPOIS"}
                    </h3>
                    <p className="text-sm opacity-90">Resultado alcançado</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-white shadow-lg">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-300">
                  <ArrowLeftRight className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-600">
              Arraste o controle para comparar
            </div>
          </div>
        );

      case "faq":
        const faqData = element.faqData || [
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
        
        return (
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            <div className="space-y-3">
              {faqData.map((faq, index) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg">
                  <button className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50">
                    <span className="font-medium text-gray-800">{faq.question}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                  
                  <div className="px-4 pb-3 text-sm text-gray-600 border-t border-gray-100">
                    {faq.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "image_carousel":
        const carouselImages = element.carouselImages || [
          { url: "https://via.placeholder.com/600x300/10b981/white?text=Imagem+1", alt: "Imagem 1", caption: "Primeira imagem" },
          { url: "https://via.placeholder.com/600x300/3b82f6/white?text=Imagem+2", alt: "Imagem 2", caption: "Segunda imagem" },
          { url: "https://via.placeholder.com/600x300/8b5cf6/white?text=Imagem+3", alt: "Imagem 3", caption: "Terceira imagem" }
        ];
        
        return (
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            <div className="relative">
              <div className="overflow-hidden rounded-lg">
                <div className="flex transition-transform duration-300">
                  {carouselImages.map((image, index) => (
                    <div key={index} className="w-full flex-shrink-0 relative">
                      <img 
                        src={image.url} 
                        alt={image.alt}
                        className="w-full h-64 object-cover"
                      />
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                          {image.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {element.carouselShowArrows && (
                <>
                  <button className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            
            {element.carouselShowDots && (
              <div className="flex justify-center space-x-2">
                {carouselImages.map((_, index) => (
                  <button 
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case "stripe_embed":
        return (
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {element.stripeTitle || "Finalizar Compra"}
              </h3>
              <p className="text-gray-600 mb-4">
                {element.stripeDescription || "Pague com segurança usando Stripe"}
              </p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Pagamento Seguro com Stripe
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 bg-white border border-gray-200 rounded">
                    <div className="text-sm text-gray-600 mb-1">Email</div>
                    <div className="text-gray-400">seu.email@exemplo.com</div>
                  </div>
                  
                  <div className="p-3 bg-white border border-gray-200 rounded">
                    <div className="text-sm text-gray-600 mb-1">Informações do Cartão</div>
                    <div className="text-gray-400">**** **** **** ****</div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <div className="flex-1 p-3 bg-white border border-gray-200 rounded">
                      <div className="text-sm text-gray-600 mb-1">Validade</div>
                      <div className="text-gray-400">MM/AA</div>
                    </div>
                    <div className="flex-1 p-3 bg-white border border-gray-200 rounded">
                      <div className="text-sm text-gray-600 mb-1">CVC</div>
                      <div className="text-gray-400">***</div>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                  disabled
                >
                  {element.stripeButtonText || "Pagar Agora"}
                </button>
                
                <div className="text-xs text-gray-500 text-center">
                  Seus dados estão protegidos com criptografia SSL
                </div>
              </div>
            </div>
          </div>
        );

      case "hotmart_upsell":
        return (
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                  {element.hotmartBadge || "OFERTA ESPECIAL"}
                </div>
                {element.hotmartTimer && (
                  <div className="text-right">
                    <div className="text-sm opacity-90">Termina em:</div>
                    <div className="text-lg font-bold">23:59:47</div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {element.hotmartTitle || "Curso Completo de Marketing Digital"}
                  </h3>
                  <p className="opacity-90 mb-4">
                    {element.hotmartDescription || "Aprenda as estratégias que os profissionais usam para gerar resultados extraordinários."}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {(element.hotmartFeatures || [
                      "Acesso vitalício ao conteúdo",
                      "Certificado de conclusão",
                      "Suporte direto com especialistas",
                      "Garantia de 30 dias"
                    ]).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-3xl font-bold">
                      {element.hotmartPrice || "R$ 197"}
                    </div>
                    {element.hotmartOriginalPrice && (
                      <div className="text-xl opacity-75 line-through">
                        {element.hotmartOriginalPrice}
                      </div>
                    )}
                    {element.hotmartDiscount && (
                      <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-sm font-bold">
                        {element.hotmartDiscount}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-4 px-6 rounded-lg text-lg transition-colors duration-200"
                  >
                    {element.hotmartButtonText || "QUERO APROVEITAR A OFERTA"}
                  </button>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="w-full h-48 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    {element.hotmartImage ? (
                      <img 
                        src={element.hotmartImage} 
                        alt="Produto" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <Target className="w-16 h-16 mx-auto mb-2" />
                        <div className="text-sm opacity-75">Imagem do Produto</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {element.hotmartTestimonial && (
                <div className="mt-6 bg-white bg-opacity-10 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">"</div>
                    <div>
                      <p className="italic">{element.hotmartTestimonial}</p>
                      <div className="text-sm opacity-75 mt-2">
                        - {element.hotmartTestimonialAuthor || "Cliente Satisfeito"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "icon_list":
        const iconListData = element.iconListData || [
          { id: "1", icon: "CheckCircle", iconColor: "#10b981", mainText: "Benefício 1", subText: "Descrição do benefício" },
          { id: "2", icon: "Star", iconColor: "#f59e0b", mainText: "Benefício 2", subText: "Descrição do benefício" },
          { id: "3", icon: "Shield", iconColor: "#3b82f6", mainText: "Benefício 3", subText: "Descrição do benefício" }
        ];
        
        const iconListLayout = element.iconListLayout || "vertical";
        const iconListColumns = element.iconListColumns || 1;
        
        return (
          <div className={`space-y-3 p-4 rounded-lg ${iconListLayout === "grid" ? `grid grid-cols-${iconListColumns} gap-4` : "space-y-3"}`}>
            {iconListData.map((item) => (
              <div 
                key={item.id}
                className={`flex ${element.iconListIconPosition === "top" ? "flex-col" : "flex-row"} items-center gap-3 p-3 rounded-lg border hover:shadow-md transition-all duration-200`}
                style={{ backgroundColor: element.iconListBackgroundColor || "#f8fafc" }}
              >
                <div className="flex-shrink-0">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: item.iconColor || "#10b981" }}
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{item.mainText}</div>
                  {item.subText && (
                    <div className="text-sm text-gray-600 mt-1">{item.subText}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case "testimonials":
        const testimonialsData = element.testimonialsData || [
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
        
        return (
          <div className="space-y-4 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Avaliações de clientes</h3>
            {testimonialsData.map((testimonial) => (
              <div 
                key={testimonial.id}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-800">{testimonial.name}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{testimonial.testimonial}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "guarantee":
        const guaranteeTitle = element.guaranteeTitle || "Garantia de 30 dias";
        const guaranteeDescription = element.guaranteeDescription || "Se você não ficar satisfeito, devolvemos seu dinheiro";
        
        return (
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800">{guaranteeTitle}</h3>
                <p className="text-green-700 mt-1">{guaranteeDescription}</p>
                {element.guaranteeFeatures && (
                  <ul className="mt-3 space-y-1">
                    {element.guaranteeFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        );

      case "paypal":
        const paypalAmount = element.paypalAmount || "29.99";
        const paypalCurrency = element.paypalCurrency || "USD";
        
        return (
          <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {element.paypalTitle || "Finalizar Compra"}
              </h3>
              <div className="text-2xl font-bold text-gray-900">
                {paypalCurrency} {paypalAmount}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg cursor-pointer transition-colors duration-200 text-center">
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Pagar com PayPal</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                Pagamento seguro processado pelo PayPal
              </div>
            </div>
          </div>
        );

      case "image_with_text":
        const imageUrl = element.imageWithTextUrl || "/api/placeholder/400/300";
        const imageText = element.imageWithTextText || "Texto da imagem";
        const textPosition = element.imageWithTextTextPosition || "bottom";
        
        return (
          <div className="relative">
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src={imageUrl}
                alt="Imagem com texto"
                className="w-full h-64 object-cover"
                style={{ 
                  borderRadius: element.imageWithTextBorderRadius === "full" ? "50%" : "0.5rem",
                  borderWidth: element.imageWithTextBorderWidth ? `${element.imageWithTextBorderWidth}px` : "0",
                  borderColor: element.imageWithTextBorderColor || "transparent",
                  borderStyle: element.imageWithTextBorderStyle || "solid"
                }}
              />
              
              {textPosition.includes("overlay") && (
                <div 
                  className={`absolute inset-0 flex items-center justify-center text-white text-center p-4 ${
                    textPosition === "overlay-top" ? "items-start" : 
                    textPosition === "overlay-bottom" ? "items-end" : "items-center"
                  }`}
                  style={{ 
                    backgroundColor: element.imageWithTextTextBackground || "rgba(0,0,0,0.5)"
                  }}
                >
                  <div 
                    className="font-medium"
                    style={{ 
                      color: element.imageWithTextTextColor || "#ffffff",
                      fontSize: element.imageWithTextTextSize === "large" ? "1.25rem" : "1rem"
                    }}
                  >
                    {imageText}
                  </div>
                </div>
              )}
            </div>
            
            {!textPosition.includes("overlay") && (
              <div 
                className={`p-3 text-center ${textPosition === "top" ? "order-first" : ""}`}
                style={{ 
                  backgroundColor: element.imageWithTextTextBackground || "transparent",
                  color: element.imageWithTextTextColor || "#374151"
                }}
              >
                <div 
                  className="font-medium"
                  style={{ 
                    fontSize: element.imageWithTextTextSize === "large" ? "1.25rem" : "1rem"
                  }}
                >
                  {imageText}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <div className="text-sm text-gray-500">Elemento: {element.type}</div>;
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      {/* 1. Painel Páginas - Mobile First */}
      <div className="w-full lg:w-64 border-b lg:border-r lg:border-b-0 bg-white flex-shrink-0 flex flex-col">
        <div className="p-4 border-b bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <h3 className={cn(
            "font-semibold flex items-center gap-2",
            animations.fadeIn
          )}>
            <FileText className="w-4 h-4" />
            Páginas
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3 mb-4">
            {pages.map((page, index) => (
              <div 
                key={page.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={cn(
                  "group p-3 border rounded-xl cursor-pointer transition-all duration-200",
                  microInteractions.cardHover,
                  index === activePage 
                    ? 'border-primary-400 bg-primary-50 shadow-soft' 
                    : 'border-gray-200 hover:border-primary-200 hover:shadow-soft bg-white',
                  draggedPage === index && 'opacity-50 scale-95',
                  dragOverPage === index && 'border-primary-500 border-2 bg-primary-100 transform scale-105'
                )}
                onClick={() => handleActivePageChange(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Indicador de drag */}
                      <div className="flex flex-col gap-0.5 opacity-40 group-hover:opacity-70">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      </div>
                      
                      {/* Nome da página - editável */}
                      {editingPageId === page.id ? (
                        <input
                          type="text"
                          value={editingPageTitle}
                          onChange={(e) => setEditingPageTitle(e.target.value)}
                          onBlur={() => savePageTitle(page.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              savePageTitle(page.id);
                            } else if (e.key === 'Escape') {
                              cancelEditingPageTitle();
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-sm bg-white border border-vendzz-primary rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-vendzz-primary"
                          autoFocus
                        />
                      ) : (
                        <h4 
                          className="font-medium text-sm hover:text-vendzz-primary cursor-text"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingPageTitle(page.id, page.title);
                          }}
                        >
                          {page.title}
                        </h4>
                      )}
                      
                      {page.isTransition && (
                        <span className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-2 py-1 rounded-full">
                          ✨ Transição
                        </span>
                      )}
                      {page.isGame && (
                        <span className="text-xs bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 px-2 py-1 rounded-full">
                          🎮 Jogo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{page.elements.length} elementos</p>
                  </div>
                  <div className="flex gap-1">
                    {pages.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePage(index);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <ModernButton
              onClick={addPage}
              variant="secondary"
              size="sm"
              className="w-full"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Nova Página
            </ModernButton>
            <ModernButton
              onClick={addTransitionPage}
              variant="secondary"
              size="sm"
              className="w-full bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300 hover:from-purple-100 hover:to-pink-100"
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Nova Transição
            </ModernButton>
            <Button
              onClick={addGamePage}
              variant="outline"
              size="sm"
              className="w-full justify-center bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 hover:border-orange-300"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Página de Jogos
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Painel Elementos - Mobile First */}
      <div className="w-full lg:w-64 border-b lg:border-r lg:border-b-0 bg-white flex-shrink-0 flex flex-col h-auto lg:h-full">
        <div className="p-4 border-b bg-gradient-to-r from-primary-600 to-primary-700 text-white flex-shrink-0">
          <h3 className={cn(
            "font-semibold flex items-center gap-2",
            animations.fadeIn
          )}>
            <Plus className="w-4 h-4" />
            Elementos
          </h3>
        </div>
        
        {/* Seletor Global de Cor de Fundo */}
        <div className="p-4 border-b bg-gray-50">
          <Label className="text-xs font-semibold text-gray-600 mb-2 block">
            🎨 Cor de Fundo Global
          </Label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setGlobalTheme("light");
                  onThemeChange?.("light", "#ffffff");
                }}
                className={cn(
                  "flex-1 p-3 rounded-xl border-2 transition-all",
                  microInteractions.buttonPress,
                  globalTheme === "light" 
                    ? "border-primary-500 bg-primary-50 shadow-soft" 
                    : "border-gray-200 hover:border-primary-200 hover:shadow-soft"
                )}
              >
                <div className="w-full h-6 bg-white border rounded mb-2"></div>
                <div className="text-xs font-medium">Light</div>
                <div className="text-xs text-gray-500">Branco/Preto</div>
              </button>
              
              <button
                onClick={() => {
                  setGlobalTheme("dark");
                  onThemeChange?.("dark", "#000000");
                }}
                className={cn(
                  "flex-1 p-3 rounded-xl border-2 transition-all",
                  microInteractions.buttonPress,
                  globalTheme === "dark" 
                    ? "border-primary-500 bg-primary-50 shadow-soft" 
                    : "border-gray-200 hover:border-primary-200 hover:shadow-soft"
                )}
              >
                <div className="w-full h-6 bg-black border rounded mb-2"></div>
                <div className="text-xs font-medium">Dark</div>
                <div className="text-xs text-gray-500">Preto/Branco</div>
              </button>
              
              <button
                onClick={() => {
                  setGlobalTheme("custom");
                  onThemeChange?.("custom", customBackgroundColor);
                }}
                className={cn(
                  "flex-1 p-3 rounded-xl border-2 transition-all",
                  microInteractions.buttonPress,
                  globalTheme === "custom" 
                    ? "border-primary-500 bg-primary-50 shadow-soft" 
                    : "border-gray-200 hover:border-primary-200 hover:shadow-soft"
                )}
              >
                <div 
                  className="w-full h-6 border rounded mb-2"
                  style={{ backgroundColor: customBackgroundColor }}
                ></div>
                <div className="text-xs font-medium">Custom</div>
                <div className="text-xs text-gray-500">Personalizado</div>
              </button>
            </div>
            
            {globalTheme === "custom" && (
              <div className="mt-3">
                <Label className="text-xs font-medium mb-2 block">Cor personalizada</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customBackgroundColor}
                    onChange={(e) => {
                      setCustomBackgroundColor(e.target.value);
                      onThemeChange?.("custom", e.target.value);
                    }}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={customBackgroundColor}
                    onChange={(e) => {
                      setCustomBackgroundColor(e.target.value);
                      onThemeChange?.("custom", e.target.value);
                    }}
                    className="flex-1 h-8 text-xs"
                    placeholder="#000000"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Contraste automático aplicado ao texto
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Aplicado a todas as páginas automaticamente
          </p>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0" style={{ maxHeight: 'calc(100vh - 73px)' }}>
          <div className="p-4">
            <div className="space-y-4 pb-4">
              {(currentPage?.isTransition ? transitionElementCategories : 
                currentPage?.isGame ? gameElementCategories : 
                elementCategories).map((category) => (
                <div key={category.name}>
                  <h4 className="text-xs font-semibold text-gray-600 mb-2 px-2 sticky top-0 bg-white py-1 z-10">
                    {category.name}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                    {category.elements.map((elementType) => (
                      <ModernButton
                        key={elementType.type}
                        variant="secondary"
                        size="sm"
                        className={cn(
                          "justify-start h-auto p-3 w-full",
                          microInteractions.buttonPress
                        )}
                        onClick={() => addElement(elementType.type as Element["type"])}
                        leftIcon={elementType.icon}
                      >
                        <span className="font-medium text-xs">{elementType.label}</span>
                      </ModernButton>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Painel Preview - Mobile First */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden order-first lg:order-none">
        <div className="p-4 border-b bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <h3 className={cn(
            "font-semibold flex items-center gap-2",
            animations.fadeIn
          )}>
            <Eye className="w-4 h-4" />
            Preview
            {currentPage && (
              <Badge variant="secondary" className="ml-2 bg-white/20">{currentPage.title}</Badge>
            )}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {currentPage ? (
            <div 
              className={cn(
                "space-y-4 border border-gray-200 rounded-xl p-6 min-h-[500px] bg-white shadow-soft",
                animations.slideInUp
              )}
              style={{ 
                backgroundColor: getBackgroundColor(),
                color: getTextColor()
              }}
            >
              {currentPage.elements.length === 0 ? (
                <div className="text-center text-gray-500 py-16">
                  <Edit3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Página Vazia</h3>
                  <p className="text-sm">Adicione elementos usando o painel Elementos.</p>
                </div>
              ) : (
                <DragDropContainer>
                  {currentPage.elements.map((element, index) => (
                    <DragDropItem
                      key={element.id}
                      index={index}
                      onMove={(fromIndex, toIndex) => {
                        // Implementa o movimento usando a lógica existente
                        const updatedPages = pages.map((page, pageIndex) => {
                          if (pageIndex === activePage) {
                            const elements = [...page.elements];
                            const [movedElement] = elements.splice(fromIndex, 1);
                            elements.splice(toIndex, 0, movedElement);
                            return { ...page, elements };
                          }
                          return page;
                        });
                        onPagesChange(updatedPages);
                      }}
                      canMoveUp={index > 0}
                      canMoveDown={index < currentPage.elements.length - 1}
                      className={cn(
                        "group border-2 border-transparent rounded-lg p-2 cursor-pointer transition-all duration-150",
                        "hover:border-primary-200 hover:bg-primary-50/30",
                        selectedElement === element.id && "border-primary-400 bg-primary-50",
                        animations.hoverLift
                      )}
                      showArrows={true}
                      dragEnabled={true}
                    >
                      <div onClick={() => setSelectedElement(element.id)}>
                        {renderElementPreview(element)}
                        
                        {/* Controles modernos do elemento */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <ModernButton
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 bg-white/90 hover:bg-white shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteElement(element.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </ModernButton>
                        </div>
                      </div>
                    </DragDropItem>
                  ))}
                </DragDropContainer>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma página selecionada</h3>
                <p className="text-sm">Selecione uma página para começar a editar.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Painel Propriedades - Mobile First */}
      <div className="w-full lg:w-80 border-t lg:border-l lg:border-t-0 bg-white flex-shrink-0 flex flex-col">
        <div className="p-4 border-b bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <h3 className={cn(
            "font-semibold flex items-center gap-2",
            animations.fadeIn
          )}>
            <Settings className="w-4 h-4" />
            {selectedElementData ? getElementTypeName(selectedElementData.type) : 'Propriedades'}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 73px)' }}>
          {selectedElementData ? (
            <div className={cn("space-y-4", animations.slideInUp)}>
              {/* Propriedades básicas */}
              {selectedElementData.type === "heading" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="heading-content">Texto do Título</Label>
                    <Input
                      id="heading-content"
                      value={selectedElementData.content}
                      onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  
                  {/* Formatação completa */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-sm mb-3">Formatação</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Tamanho</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs"
                          value={selectedElementData.fontSize || "xl"}
                          onChange={(e) => updateElement(selectedElementData.id, { fontSize: e.target.value })}
                        >
                          <option value="lg">Pequeno</option>
                          <option value="xl">Normal</option>
                          <option value="2xl">Grande</option>
                          <option value="3xl">Muito Grande</option>
                          <option value="4xl">Extra Grande</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label className="text-xs">Peso</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs"
                          value={selectedElementData.fontWeight || "bold"}
                          onChange={(e) => updateElement(selectedElementData.id, { fontWeight: e.target.value })}
                        >
                          <option value="normal">Normal</option>
                          <option value="semibold">Semi-negrito</option>
                          <option value="bold">Negrito</option>
                          <option value="extrabold">Extra Negrito</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label className="text-xs">Alinhamento</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs"
                          value={selectedElementData.textAlign || "left"}
                          onChange={(e) => updateElement(selectedElementData.id, { textAlign: e.target.value })}
                        >
                          <option value="left">Esquerda</option>
                          <option value="center">Centro</option>
                          <option value="right">Direita</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label className="text-xs">Estilo</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs"
                          value={selectedElementData.fontStyle || "normal"}
                          onChange={(e) => updateElement(selectedElementData.id, { fontStyle: e.target.value })}
                        >
                          <option value="normal">Normal</option>
                          <option value="italic">Itálico</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Decoração e cores */}
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="heading-underline"
                          checked={selectedElementData.textDecoration === "underline"}
                          onChange={(e) => updateElement(selectedElementData.id, { 
                            textDecoration: e.target.checked ? "underline" : "none" 
                          })}
                        />
                        <Label htmlFor="heading-underline" className="text-xs">Sublinhado</Label>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Cor do Texto</Label>
                          <input
                            type="color"
                            value={selectedElementData.textColor || "#1f2937"}
                            onChange={(e) => updateElement(selectedElementData.id, { textColor: e.target.value })}
                            className="w-full h-8 border rounded"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Cor de Fundo</Label>
                          <input
                            type="color"
                            value={selectedElementData.backgroundColor || "#ffffff"}
                            onChange={(e) => updateElement(selectedElementData.id, { backgroundColor: e.target.value })}
                            className="w-full h-8 border rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedElementData.type === "paragraph" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="paragraph-content">Texto do Parágrafo</Label>
                    <textarea
                      id="paragraph-content"
                      value={selectedElementData.content}
                      onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                      rows={3}
                    />
                  </div>
                  
                  {/* Formatação do parágrafo */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-sm mb-3">Formatação</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Tamanho</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs"
                          value={selectedElementData.fontSize || "base"}
                          onChange={(e) => updateElement(selectedElementData.id, { fontSize: e.target.value })}
                        >
                          <option value="sm">Pequeno</option>
                          <option value="base">Normal</option>
                          <option value="lg">Grande</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label className="text-xs">Alinhamento</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs"
                          value={selectedElementData.textAlign || "left"}
                          onChange={(e) => updateElement(selectedElementData.id, { textAlign: e.target.value })}
                        >
                          <option value="left">Esquerda</option>
                          <option value="center">Centro</option>
                          <option value="right">Direita</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Cor do Texto</Label>
                        <input
                          type="color"
                          value={selectedElementData.textColor || "#374151"}
                          onChange={(e) => updateElement(selectedElementData.id, { textColor: e.target.value })}
                          className="w-full h-8 border rounded"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Cor de Fundo</Label>
                        <input
                          type="color"
                          value={selectedElementData.backgroundColor || "#ffffff"}
                          onChange={(e) => updateElement(selectedElementData.id, { backgroundColor: e.target.value })}
                          className="w-full h-8 border rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedElementData.type === "image" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="image-url">URL da Imagem</Label>
                    <Input
                      id="image-url"
                      value={selectedElementData.imageUrl || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { imageUrl: e.target.value })}
                      className="mt-1"
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="image-alt">Texto Alternativo</Label>
                    <Input
                      id="image-alt"
                      value={selectedElementData.content || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                      className="mt-1"
                      placeholder="Descrição da imagem"
                    />
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-sm mb-3">Alinhamento</h4>
                    <select 
                      className="w-full px-2 py-1 border rounded text-xs"
                      value={selectedElementData.textAlign || "center"}
                      onChange={(e) => updateElement(selectedElementData.id, { textAlign: e.target.value })}
                    >
                      <option value="left">Esquerda</option>
                      <option value="center">Centro</option>
                      <option value="right">Direita</option>
                    </select>
                  </div>
                </div>
              )}

              {(selectedElementData.type === "textarea" || selectedElementData.type === "date" || selectedElementData.type === "checkbox") && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="question-label">Pergunta/Label</Label>
                    <Input
                      id="question-label"
                      value={selectedElementData.question || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { question: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  
                  {selectedElementData.type === "textarea" && (
                    <div>
                      <Label htmlFor="textarea-placeholder">Placeholder</Label>
                      <Input
                        id="textarea-placeholder"
                        value={selectedElementData.placeholder || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { placeholder: e.target.value })}
                        className="mt-1"
                        placeholder="Digite sua resposta aqui..."
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="field-required"
                      checked={selectedElementData.required || false}
                      onChange={(e) => updateElement(selectedElementData.id, { required: e.target.checked })}
                    />
                    <Label htmlFor="field-required" className="text-xs">Campo obrigatório</Label>
                  </div>

                  <div>
                    <Label htmlFor="field-id-custom">ID do Campo (para captura de leads)</Label>
                    <Input
                      id="field-id-custom"
                      value={selectedElementData.fieldId || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { fieldId: e.target.value })}
                      className="mt-1"
                      placeholder="campo_comentario"
                    />
                  </div>

                  <div>
                    <Label htmlFor="response-id-custom">ID da Resposta (para uso como variável)</Label>
                    <Input
                      id="response-id-custom"
                      value={selectedElementData.responseId || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { responseId: e.target.value })}
                      className="mt-1"
                      placeholder="var_comentario"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use esse ID para referenciar a resposta em outros elementos. Ex: {{var_comentario}}
                    </p>
                  </div>
                </div>
              )}

              {(selectedElementData.type === "multiple_choice" || selectedElementData.type === "checkbox") && (
                <div className="space-y-6">
                  {/* Pergunta */}
                  <div>
                    <Label htmlFor="question">Pergunta</Label>
                    <Input
                      id="question"
                      value={selectedElementData.question || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { question: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  {/* Formatação de Texto */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-sm mb-3">Formatação de Texto</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {/* Tamanho da fonte */}
                      <div>
                        <Label className="text-xs">Tamanho</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs"
                          value={selectedElementData.fontSize || "base"}
                          onChange={(e) => updateElement(selectedElementData.id, { fontSize: e.target.value })}
                        >
                          <option value="sm">Pequeno</option>
                          <option value="base">Normal</option>
                          <option value="lg">Grande</option>
                          <option value="xl">Muito Grande</option>
                          <option value="2xl">Extra Grande</option>
                        </select>
                      </div>

                      {/* Peso da fonte */}
                      <div>
                        <Label className="text-xs">Peso</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs"
                          value={selectedElementData.fontWeight || "normal"}
                          onChange={(e) => updateElement(selectedElementData.id, { fontWeight: e.target.value })}
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Negrito</option>
                          <option value="semibold">Semi-negrito</option>
                        </select>
                      </div>

                      {/* Alinhamento */}
                      <div>
                        <Label className="text-xs">Alinhamento</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs"
                          value={selectedElementData.textAlign || "left"}
                          onChange={(e) => updateElement(selectedElementData.id, { textAlign: e.target.value })}
                        >
                          <option value="left">Esquerda</option>
                          <option value="center">Centro</option>
                          <option value="right">Direita</option>
                        </select>
                      </div>

                      {/* Estilo */}
                      <div>
                        <Label className="text-xs">Estilo</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs"
                          value={selectedElementData.fontStyle || "normal"}
                          onChange={(e) => updateElement(selectedElementData.id, { fontStyle: e.target.value })}
                        >
                          <option value="normal">Normal</option>
                          <option value="italic">Itálico</option>
                        </select>
                      </div>
                    </div>

                    {/* Decoração e cores */}
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="underline"
                          checked={selectedElementData.textDecoration === "underline"}
                          onChange={(e) => updateElement(selectedElementData.id, { 
                            textDecoration: e.target.checked ? "underline" : "none" 
                          })}
                        />
                        <Label htmlFor="underline" className="text-xs">Sublinhado</Label>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Cor do Texto</Label>
                          <input
                            type="color"
                            value={selectedElementData.textColor || "#374151"}
                            onChange={(e) => updateElement(selectedElementData.id, { textColor: e.target.value })}
                            className="w-full h-8 border rounded"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Cor de Fundo</Label>
                          <input
                            type="color"
                            value={selectedElementData.backgroundColor || "#ffffff"}
                            onChange={(e) => updateElement(selectedElementData.id, { backgroundColor: e.target.value })}
                            className="w-full h-8 border rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configurações de Dados */}
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-semibold text-sm mb-3">📊 Configurações de Dados</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">ID do Campo (captura de leads)</Label>
                        <Input
                          value={selectedElementData.fieldId || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { fieldId: e.target.value })}
                          className="text-xs mt-1"
                          placeholder="campo_escolha"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">ID da Resposta (para usar como variável)</Label>
                        <Input
                          value={selectedElementData.responseId || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { responseId: e.target.value })}
                          className="text-xs mt-1"
                          placeholder="var_escolha"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use {`{{var_escolha}}`} para referenciar a resposta selecionada em outros elementos
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Controle de Navegação */}
                  <div className="border rounded-lg p-4 bg-orange-50">
                    <h4 className="font-semibold text-sm mb-3">🎯 Navegação e Ação</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="require-continue"
                          checked={selectedElementData.requireContinueButton || false}
                          onChange={(e) => updateElement(selectedElementData.id, { requireContinueButton: e.target.checked })}
                        />
                        <Label htmlFor="require-continue" className="text-xs">Aguardar botão "Continuar"</Label>
                      </div>
                      
                      <p className="text-xs text-gray-500 bg-white p-2 rounded border">
                        {selectedElementData.requireContinueButton 
                          ? "⚠️ Usuário deve clicar em botão 'Continuar' após selecionar. Adicione um elemento 'Botão Continuar' na página."
                          : "✅ Usuário será redirecionado automaticamente ao clicar na opção."
                        }
                      </p>
                    </div>
                  </div>

                  {/* Opções de Resposta */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-sm mb-3">Opções de Resposta</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="required"
                            checked={selectedElementData.required || false}
                            onChange={(e) => updateElement(selectedElementData.id, { required: e.target.checked })}
                          />
                          <Label htmlFor="required" className="text-xs">Resposta obrigatória</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="multiple"
                            checked={selectedElementData.multipleSelection || false}
                            onChange={(e) => updateElement(selectedElementData.id, { multipleSelection: e.target.checked })}
                          />
                          <Label htmlFor="multiple" className="text-xs">Múltipla seleção</Label>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Opções de Resposta</Label>
                        <div className="space-y-3 mt-2">
                          {(selectedElementData.options || []).map((option, index) => (
                            <div key={index} className="border rounded-lg p-3 bg-white">
                              <div className="flex gap-2 mb-2">
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...(selectedElementData.options || [])];
                                    newOptions[index] = e.target.value;
                                    updateElement(selectedElementData.id, { options: newOptions });
                                  }}
                                  className="flex-1 text-xs"
                                  placeholder={`Opção ${index + 1}`}
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const newOptions = (selectedElementData.options || []).filter((_, i) => i !== index);
                                    const newImages = (selectedElementData.optionImages || []).filter((_, i) => i !== index);
                                    const newIcons = (selectedElementData.optionIcons || []).filter((_, i) => i !== index);
                                    updateElement(selectedElementData.id, { 
                                      options: newOptions,
                                      optionImages: newImages,
                                      optionIcons: newIcons
                                    });
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                              </div>
                              
                              <div className="flex gap-2">
                                {/* Botão de adicionar/remover imagem */}
                                <div className="relative">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        try {
                                          const webpUrl = await convertToWebP(file);
                                          const newImages = [...(selectedElementData.optionImages || [])];
                                          newImages[index] = webpUrl;
                                          updateElement(selectedElementData.id, { 
                                            optionImages: newImages,
                                            showImages: true
                                          });
                                        } catch (error) {
                                          console.error("Erro ao converter imagem:", error);
                                        }
                                      }
                                      e.target.value = '';
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    id={`image-upload-${selectedElementData.id}-${index}`}
                                  />
                                  <Button
                                    size="sm"
                                    variant={selectedElementData.optionImages?.[index] ? "destructive" : "outline"}
                                    className="text-xs"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      
                                      if (selectedElementData.optionImages?.[index]) {
                                        // Remover imagem existente
                                        const newImages = [...(selectedElementData.optionImages || [])];
                                        newImages[index] = "";
                                        updateElement(selectedElementData.id, { 
                                          optionImages: newImages
                                        });
                                      } else {
                                        // Ativar seleção de arquivo
                                        const fileInput = document.getElementById(`image-upload-${selectedElementData.id}-${index}`) as HTMLInputElement;
                                        if (fileInput) {
                                          fileInput.click();
                                        }
                                      }
                                    }}
                                  >
                                    <ImageIcon className="w-3 h-3 mr-1" />
                                    {selectedElementData.optionImages?.[index] ? "Remover" : "IMG"}
                                  </Button>
                                </div>
                              </div>
                              
                              {/* URL da imagem se selecionada */}
                              {selectedElementData.optionImages?.[index] && (
                                <div className="mt-2">
                                  <Label className="text-xs">URL da Imagem</Label>
                                  <Input
                                    value={selectedElementData.optionImages[index]}
                                    onChange={(e) => {
                                      const newImages = [...(selectedElementData.optionImages || [])];
                                      newImages[index] = e.target.value;
                                      updateElement(selectedElementData.id, { optionImages: newImages });
                                    }}
                                    className="text-xs mt-1"
                                    placeholder="https://exemplo.com/imagem.jpg"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newOptions = [...(selectedElementData.options || []), `Opção ${(selectedElementData.options || []).length + 1}`];
                              updateElement(selectedElementData.id, { options: newOptions });
                            }}
                            className="w-full"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Adicionar opção
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Layout Visual */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-sm mb-3">Layout Visual</h4>
                    
                    <div className="space-y-3">
                      {/* Disposição das opções */}
                      <div>
                        <Label className="text-xs">Disposição</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.optionLayout || "vertical"}
                          onChange={(e) => updateElement(selectedElementData.id, { optionLayout: e.target.value })}
                        >
                          <option value="vertical">Vertical</option>
                          <option value="horizontal">Horizontal</option>
                          <option value="grid">Grade 2x2</option>
                        </select>
                      </div>

                      {/* Estilo dos botões */}
                      <div>
                        <Label className="text-xs">Estilo dos Botões</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.buttonStyle || "rectangular"}
                          onChange={(e) => updateElement(selectedElementData.id, { buttonStyle: e.target.value })}
                        >
                          <option value="rectangular">Retangular</option>
                          <option value="rounded">Arredondado</option>
                          <option value="pills">Pills</option>
                        </select>
                      </div>

                      {/* Espaçamento */}
                      <div>
                        <Label className="text-xs">Espaçamento</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.spacing || "md"}
                          onChange={(e) => updateElement(selectedElementData.id, { spacing: e.target.value })}
                        >
                          <option value="sm">Pequeno</option>
                          <option value="md">Médio</option>
                          <option value="lg">Grande</option>
                        </select>
                      </div>

                      {/* Bordas e sombras */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Bordas</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.borderStyle || "normal"}
                            onChange={(e) => updateElement(selectedElementData.id, { borderStyle: e.target.value })}
                          >
                            <option value="normal">Normal</option>
                            <option value="thick">Grossas</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs">Sombra</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.shadowStyle || "none"}
                            onChange={(e) => updateElement(selectedElementData.id, { shadowStyle: e.target.value })}
                          >
                            <option value="none">Nenhuma</option>
                            <option value="sm">Pequena</option>
                            <option value="md">Média</option>
                          </select>
                        </div>
                      </div>

                      {/* Opções de interação */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="hideInputs"
                            checked={selectedElementData.hideInputs || false}
                            onChange={(e) => updateElement(selectedElementData.id, { hideInputs: e.target.checked })}
                          />
                          <Label htmlFor="hideInputs" className="text-xs">Remover checkbox/radio (apenas texto)</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(selectedElementData.type === "text" || selectedElementData.type === "email" || selectedElementData.type === "phone") && (
                <div>
                  <Label htmlFor="question">Pergunta/Label</Label>
                  <Input
                    id="question"
                    value={selectedElementData.question || ""}
                    onChange={(e) => updateElement(selectedElementData.id, { question: e.target.value })}
                    className="mt-1"
                  />
                  
                  <div className="mt-4">
                    <Label htmlFor="placeholder">Placeholder</Label>
                    <Input
                      id="placeholder"
                      value={selectedElementData.placeholder || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { placeholder: e.target.value })}
                      className="mt-1"
                      placeholder="Texto de exemplo no campo"
                    />
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="required"
                        checked={selectedElementData.required || false}
                        onChange={(e) => updateElement(selectedElementData.id, { required: e.target.checked })}
                      />
                      <Label htmlFor="required">Campo obrigatório</Label>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="field-id">ID do Campo (para captura de leads)</Label>
                    <Input
                      id="field-id"
                      value={selectedElementData.fieldId || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { fieldId: e.target.value })}
                      className="mt-1"
                      placeholder={selectedElementData.type === "phone" ? "telefone_" : "campo_email"}
                      readOnly={selectedElementData.type === "phone"}
                    />
                    {selectedElementData.type === "phone" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Campos de telefone usam automaticamente o prefixo "telefone_" para garantir a detecção correta.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedElementData.type === "video" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="video-url">URL do Vídeo</Label>
                    <Input
                      id="video-url"
                      value={selectedElementData.content || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                      className="mt-1"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Suporte para YouTube, Vimeo, TikTok e Instagram
                    </p>
                  </div>

                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-sm mb-3">Configurações</h4>
                    <div>
                      <Label className="text-xs">Alinhamento</Label>
                      <select 
                        className="w-full px-2 py-1 border rounded text-xs"
                        value={selectedElementData.textAlign || "center"}
                        onChange={(e) => updateElement(selectedElementData.id, { textAlign: e.target.value })}
                      >
                        <option value="left">Esquerda</option>
                        <option value="center">Centro</option>
                        <option value="right">Direita</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {selectedElementData.type === "image_upload" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="upload-question">Pergunta/Label</Label>
                    <Input
                      id="upload-question"
                      value={selectedElementData.question || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { question: e.target.value })}
                      className="mt-1"
                      placeholder="Faça upload da sua foto"
                    />
                  </div>

                  <div>
                    <Label htmlFor="upload-button">Botão de Upload</Label>
                    <Button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.style.display = 'none';
                        
                        input.onchange = async (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            // Verificar tamanho máximo (5MB)
                            if (file.size > 5 * 1024 * 1024) {
                              alert('Arquivo muito grande! Máximo 5MB permitido.');
                              return;
                            }
                            
                            try {
                              // Converter para WebP
                              const webpDataUrl = await convertToWebP(file);
                              updateElement(selectedElementData.id, { imageUrl: webpDataUrl });
                            } catch (error) {
                              alert('Erro ao processar imagem. Tente novamente.');
                            }
                          }
                        };
                        
                        document.body.appendChild(input);
                        input.click();
                        document.body.removeChild(input);
                      }}
                      className="w-full"
                      variant="outline"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar Imagem (Máx 5MB)
                    </Button>
                    {selectedElementData.imageUrl && (
                      <Button
                        onClick={() => updateElement(selectedElementData.id, { imageUrl: "" })}
                        className="w-full mt-2"
                        variant="destructive"
                        size="sm"
                      >
                        Remover Imagem
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="upload-required"
                      checked={selectedElementData.required || false}
                      onChange={(e) => updateElement(selectedElementData.id, { required: e.target.checked })}
                    />
                    <Label htmlFor="upload-required" className="text-xs">Campo obrigatório</Label>
                  </div>

                  <div>
                    <Label htmlFor="upload-field-id">ID do Campo (para captura de leads)</Label>
                    <Input
                      id="upload-field-id"
                      value={selectedElementData.fieldId || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { fieldId: e.target.value })}
                      className="mt-1"
                      placeholder="campo_foto"
                    />
                  </div>

                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-sm mb-3">Alinhamento</h4>
                    <select 
                      className="w-full px-2 py-1 border rounded text-xs"
                      value={selectedElementData.textAlign || "center"}
                      onChange={(e) => updateElement(selectedElementData.id, { textAlign: e.target.value })}
                    >
                      <option value="left">Esquerda</option>
                      <option value="center">Centro</option>
                      <option value="right">Direita</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Propriedades para Data de Nascimento */}
              {selectedElementData.type === "birth_date" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="birth-question">Pergunta</Label>
                    <Input
                      id="birth-question"
                      value={selectedElementData.question || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { question: e.target.value })}
                      className="mt-1"
                      placeholder="Data de Nascimento"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="birth-required"
                      checked={selectedElementData.required || false}
                      onChange={(e) => updateElement(selectedElementData.id, { required: e.target.checked })}
                    />
                    <Label htmlFor="birth-required">Campo obrigatório</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="show-age"
                      checked={selectedElementData.showAgeCalculation || false}
                      onChange={(e) => updateElement(selectedElementData.id, { showAgeCalculation: e.target.checked })}
                    />
                    <Label htmlFor="show-age">Mostrar cálculo de idade</Label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Idade Mínima</Label>
                      <Input
                        type="number"
                        value={selectedElementData.minAge || 16}
                        onChange={(e) => updateElement(selectedElementData.id, { minAge: parseInt(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Idade Máxima</Label>
                      <Input
                        type="number"
                        value={selectedElementData.maxAge || 100}
                        onChange={(e) => updateElement(selectedElementData.id, { maxAge: parseInt(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="birth-field-id">ID do Campo (para captura de leads)</Label>
                    <Input
                      id="birth-field-id"
                      value={selectedElementData.fieldId || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { fieldId: e.target.value })}
                      className="mt-1"
                      placeholder="data_nascimento"
                    />
                  </div>
                </div>
              )}

              {/* Propriedades para Altura */}
              {selectedElementData.type === "height" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="height-question">Pergunta</Label>
                    <Input
                      id="height-question"
                      value={selectedElementData.question || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { question: e.target.value })}
                      className="mt-1"
                      placeholder="Qual sua altura?"
                    />
                  </div>

                  {/* Formatação do Texto */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Tamanho da Fonte</Label>
                      <select 
                        className="w-full px-2 py-1 border rounded text-xs mt-1"
                        value={selectedElementData.fontSize || "base"}
                        onChange={(e) => updateElement(selectedElementData.id, { fontSize: e.target.value })}
                      >
                        <option value="xs">Muito Pequeno</option>
                        <option value="sm">Pequeno</option>
                        <option value="base">Normal</option>
                        <option value="lg">Grande</option>
                        <option value="xl">Muito Grande</option>
                        <option value="2xl">Gigante</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs">Alinhamento</Label>
                      <select 
                        className="w-full px-2 py-1 border rounded text-xs mt-1"
                        value={selectedElementData.textAlign || "left"}
                        onChange={(e) => updateElement(selectedElementData.id, { textAlign: e.target.value })}
                      >
                        <option value="left">Esquerda</option>
                        <option value="center">Centro</option>
                        <option value="right">Direita</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Peso da Fonte</Label>
                      <select 
                        className="w-full px-2 py-1 border rounded text-xs mt-1"
                        value={selectedElementData.fontWeight || "normal"}
                        onChange={(e) => updateElement(selectedElementData.id, { fontWeight: e.target.value })}
                      >
                        <option value="light">Leve</option>
                        <option value="normal">Normal</option>
                        <option value="medium">Médio</option>
                        <option value="semibold">Semi-negrito</option>
                        <option value="bold">Negrito</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs">Cor do Texto</Label>
                      <input
                        type="color"
                        value={selectedElementData.textColor || "#000000"}
                        onChange={(e) => updateElement(selectedElementData.id, { textColor: e.target.value })}
                        className="w-full h-8 border rounded mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="height-required"
                      checked={selectedElementData.required || false}
                      onChange={(e) => updateElement(selectedElementData.id, { required: e.target.checked })}
                    />
                    <Label htmlFor="height-required">Campo obrigatório</Label>
                  </div>

                  <div>
                    <Label className="text-xs">Unidade</Label>
                    <select 
                      className="w-full px-2 py-1 border rounded text-xs mt-1"
                      value={selectedElementData.unit || "cm"}
                      onChange={(e) => updateElement(selectedElementData.id, { unit: e.target.value as "cm" | "m" })}
                    >
                      <option value="cm">Centímetros (cm)</option>
                      <option value="m">Metros (m)</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="height-field-id">ID do Campo (para captura de leads)</Label>
                    <Input
                      id="height-field-id"
                      value={selectedElementData.fieldId || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { fieldId: e.target.value })}
                      className="mt-1"
                      placeholder="altura"
                    />
                  </div>

                  <div>
                    <Label htmlFor="height-description">Descrição/Ajuda</Label>
                    <Input
                      id="height-description"
                      value={selectedElementData.description || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { description: e.target.value })}
                      className="mt-1"
                      placeholder="Texto adicional para ajudar o usuário"
                    />
                  </div>
                </div>
              )}

              {/* Propriedades para Peso Atual */}
              {selectedElementData.type === "current_weight" && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Scale className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Peso Atual - Configurações</span>
                    </div>
                    <div className="text-xs text-blue-700">
                      Este elemento permite capturar o peso atual do usuário com validação automática
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="weight-question">Pergunta</Label>
                    <Input
                      id="weight-question"
                      value={selectedElementData.question || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { question: e.target.value })}
                      className="mt-1"
                      placeholder="Qual é seu peso atual?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="weight-description">Descrição adicional</Label>
                    <Input
                      id="weight-description"
                      value={selectedElementData.description || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { description: e.target.value })}
                      className="mt-1"
                      placeholder="Informações extras sobre o peso"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="weight-required"
                      checked={selectedElementData.required || false}
                      onChange={(e) => updateElement(selectedElementData.id, { required: e.target.checked })}
                    />
                    <Label htmlFor="weight-required">Campo obrigatório</Label>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="show-bmi"
                        checked={selectedElementData.showBMICalculation || false}
                        onChange={(e) => updateElement(selectedElementData.id, { showBMICalculation: e.target.checked })}
                      />
                      <Label htmlFor="show-bmi">Mostrar cálculo de IMC</Label>
                    </div>

                    {selectedElementData.showBMICalculation && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-800">Sincronização IMC Ativa</span>
                        </div>
                        <div className="text-xs text-green-700 space-y-1">
                          <div>• IMC será calculado automaticamente quando altura e peso forem preenchidos</div>
                          <div>• Certifique-se de ter um elemento "Altura" no seu formulário</div>
                          <div>• O cálculo aparecerá em tempo real durante o preenchimento</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="weight-field-id">ID do Campo (para captura de leads)</Label>
                    <Input
                      id="weight-field-id"
                      value={selectedElementData.fieldId || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { fieldId: e.target.value })}
                      className="mt-1"
                      placeholder="peso_atual"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Identificador único para capturar esse dado na geração de leads
                    </div>
                  </div>
                </div>
              )}

              {/* Propriedades para Peso Desejado */}
              {selectedElementData.type === "target_weight" && (
                <div className="space-y-4">
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-orange-800">Peso Objetivo - Configurações</span>
                    </div>
                    <div className="text-xs text-orange-700">
                      Este elemento captura o peso desejado e calcula automaticamente a diferença com o peso atual
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="target-question">Pergunta</Label>
                    <Input
                      id="target-question"
                      value={selectedElementData.question || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { question: e.target.value })}
                      className="mt-1"
                      placeholder="Qual é seu peso objetivo?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="target-description">Descrição adicional</Label>
                    <Input
                      id="target-description"
                      value={selectedElementData.description || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { description: e.target.value })}
                      className="mt-1"
                      placeholder="Informações sobre sua meta de peso"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="target-required"
                      checked={selectedElementData.required || false}
                      onChange={(e) => updateElement(selectedElementData.id, { required: e.target.checked })}
                    />
                    <Label htmlFor="target-required">Campo obrigatório</Label>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-orange-800">Cálculo Automático Ativo</span>
                    </div>
                    <div className="text-xs text-orange-700 space-y-1">
                      <div>• Diferença será calculada automaticamente com base no peso atual</div>
                      <div>• Mostra percentual de progresso e quanto falta para atingir a meta</div>
                      <div>• Certifique-se de ter um elemento "Peso Atual" no seu formulário</div>
                      <div>• Cálculos aparecem em tempo real durante o preenchimento</div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="target-field-id">ID do Campo (para captura de leads)</Label>
                    <Input
                      id="target-field-id"
                      value={selectedElementData.fieldId || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { fieldId: e.target.value })}
                      className="mt-1"
                      placeholder="peso_objetivo"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Identificador único para capturar esse dado na geração de leads
                    </div>
                  </div>
                </div>
              )}

              {/* Propriedades para Lista de Ícones */}
              {selectedElementData.type === "icon_list" && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Lista de Ícones - Configurações</span>
                    </div>
                    <div className="text-xs text-blue-700">
                      Exiba benefícios, características ou pontos importantes com ícones visuais
                    </div>
                  </div>

                  <div>
                    <Label>Layout</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.iconListLayout || "vertical"}
                      onChange={(e) => updateElement(selectedElementData.id, { iconListLayout: e.target.value })}
                    >
                      <option value="vertical">Vertical</option>
                      <option value="grid">Grade</option>
                    </select>
                  </div>

                  {selectedElementData.iconListLayout === "grid" && (
                    <div>
                      <Label>Colunas</Label>
                      <select 
                        className="w-full px-3 py-2 border rounded-md mt-1"
                        value={selectedElementData.iconListColumns || 2}
                        onChange={(e) => updateElement(selectedElementData.id, { iconListColumns: parseInt(e.target.value) })}
                      >
                        <option value={1}>1 Coluna</option>
                        <option value={2}>2 Colunas</option>
                        <option value={3}>3 Colunas</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <Label>Posição do Ícone</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.iconListIconPosition || "left"}
                      onChange={(e) => updateElement(selectedElementData.id, { iconListIconPosition: e.target.value })}
                    >
                      <option value="left">Esquerda</option>
                      <option value="top">Topo</option>
                    </select>
                  </div>

                  <div>
                    <Label>Cor de Fundo</Label>
                    <Input
                      type="color"
                      value={selectedElementData.iconListBackgroundColor || "#f8fafc"}
                      onChange={(e) => updateElement(selectedElementData.id, { iconListBackgroundColor: e.target.value })}
                      className="mt-1 h-10"
                    />
                  </div>
                </div>
              )}

              {/* Propriedades para Depoimentos */}
              {selectedElementData.type === "testimonials" && (
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Depoimentos - Configurações</span>
                    </div>
                    <div className="text-xs text-green-700">
                      Exiba avaliações e comentários de clientes para aumentar a credibilidade
                    </div>
                  </div>

                  <div>
                    <Label>Título dos Depoimentos</Label>
                    <Input
                      value={selectedElementData.testimonialsTitle || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { testimonialsTitle: e.target.value })}
                      className="mt-1"
                      placeholder="Avaliações de clientes"
                    />
                  </div>

                  <div>
                    <Label>Estilo do Layout</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.testimonialsLayout || "stacked"}
                      onChange={(e) => updateElement(selectedElementData.id, { testimonialsLayout: e.target.value })}
                    >
                      <option value="stacked">Empilhado</option>
                      <option value="carousel">Carrossel</option>
                      <option value="grid">Grade</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="show-ratings"
                      checked={selectedElementData.testimonialsShowRating !== false}
                      onChange={(e) => updateElement(selectedElementData.id, { testimonialsShowRating: e.target.checked })}
                    />
                    <Label htmlFor="show-ratings">Mostrar estrelas de avaliação</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="show-avatars"
                      checked={selectedElementData.testimonialsShowAvatar !== false}
                      onChange={(e) => updateElement(selectedElementData.id, { testimonialsShowAvatar: e.target.checked })}
                    />
                    <Label htmlFor="show-avatars">Mostrar fotos dos clientes</Label>
                  </div>
                </div>
              )}

              {/* Propriedades para Garantia */}
              {selectedElementData.type === "guarantee" && (
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Garantia - Configurações</span>
                    </div>
                    <div className="text-xs text-green-700">
                      Transmita confiança e segurança com garantias claras
                    </div>
                  </div>

                  <div>
                    <Label>Título da Garantia</Label>
                    <Input
                      value={selectedElementData.guaranteeTitle || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { guaranteeTitle: e.target.value })}
                      className="mt-1"
                      placeholder="Garantia de 30 dias"
                    />
                  </div>

                  <div>
                    <Label>Descrição</Label>
                    <Input
                      value={selectedElementData.guaranteeDescription || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { guaranteeDescription: e.target.value })}
                      className="mt-1"
                      placeholder="Se você não ficar satisfeito, devolvemos seu dinheiro"
                    />
                  </div>

                  <div>
                    <Label>Tipo de Garantia</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.guaranteeType || "satisfaction"}
                      onChange={(e) => updateElement(selectedElementData.id, { guaranteeType: e.target.value })}
                    >
                      <option value="satisfaction">Satisfação</option>
                      <option value="money_back">Dinheiro de volta</option>
                      <option value="quality">Qualidade</option>
                      <option value="lifetime">Vitalícia</option>
                    </select>
                  </div>

                  <div>
                    <Label>Cor do Ícone</Label>
                    <Input
                      type="color"
                      value={selectedElementData.guaranteeIconColor || "#10b981"}
                      onChange={(e) => updateElement(selectedElementData.id, { guaranteeIconColor: e.target.value })}
                      className="mt-1 h-10"
                    />
                  </div>
                </div>
              )}

              {/* Propriedades para PayPal */}
              {selectedElementData.type === "paypal" && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">PayPal - Configurações</span>
                    </div>
                    <div className="text-xs text-blue-700">
                      Configure o botão de pagamento PayPal para processar transações
                    </div>
                  </div>

                  <div>
                    <Label>Título</Label>
                    <Input
                      value={selectedElementData.paypalTitle || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { paypalTitle: e.target.value })}
                      className="mt-1"
                      placeholder="Finalizar Compra"
                    />
                  </div>

                  <div>
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={selectedElementData.paypalAmount || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { paypalAmount: e.target.value })}
                      className="mt-1"
                      placeholder="29.99"
                    />
                  </div>

                  <div>
                    <Label>Moeda</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.paypalCurrency || "USD"}
                      onChange={(e) => updateElement(selectedElementData.id, { paypalCurrency: e.target.value })}
                    >
                      <option value="USD">USD - Dólar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="BRL">BRL - Real</option>
                      <option value="GBP">GBP - Libra</option>
                    </select>
                  </div>

                  <div>
                    <Label>Alinhamento</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.paypalAlignment || "center"}
                      onChange={(e) => updateElement(selectedElementData.id, { paypalAlignment: e.target.value })}
                    >
                      <option value="left">Esquerda</option>
                      <option value="center">Centro</option>
                      <option value="right">Direita</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Propriedades para Imagem com Texto */}
              {selectedElementData.type === "image_with_text" && (
                <div className="space-y-4">
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-purple-800">Imagem com Texto - Configurações</span>
                    </div>
                    <div className="text-xs text-purple-700">
                      Combine imagens com textos personalizados para criar elementos visuais impactantes
                    </div>
                  </div>

                  <div>
                    <Label>URL da Imagem</Label>
                    <Input
                      value={selectedElementData.imageWithTextUrl || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { imageWithTextUrl: e.target.value })}
                      className="mt-1"
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>

                  <div>
                    <Label>Texto</Label>
                    <Input
                      value={selectedElementData.imageWithTextText || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { imageWithTextText: e.target.value })}
                      className="mt-1"
                      placeholder="Texto da imagem"
                    />
                  </div>

                  <div>
                    <Label>Posição do Texto</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.imageWithTextTextPosition || "bottom"}
                      onChange={(e) => updateElement(selectedElementData.id, { imageWithTextTextPosition: e.target.value })}
                    >
                      <option value="bottom">Abaixo da imagem</option>
                      <option value="top">Acima da imagem</option>
                      <option value="overlay-bottom">Sobreposto - Embaixo</option>
                      <option value="overlay-top">Sobreposto - Topo</option>
                      <option value="overlay-center">Sobreposto - Centro</option>
                    </select>
                  </div>

                  <div>
                    <Label>Alinhamento do Texto</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.imageWithTextTextAlign || "center"}
                      onChange={(e) => updateElement(selectedElementData.id, { imageWithTextTextAlign: e.target.value })}
                    >
                      <option value="left">Esquerda</option>
                      <option value="center">Centro</option>
                      <option value="right">Direita</option>
                    </select>
                  </div>

                  <div>
                    <Label>Tamanho do Texto</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.imageWithTextTextSize || "medium"}
                      onChange={(e) => updateElement(selectedElementData.id, { imageWithTextTextSize: e.target.value })}
                    >
                      <option value="small">Pequeno</option>
                      <option value="medium">Médio</option>
                      <option value="large">Grande</option>
                      <option value="xl">Extra Grande</option>
                    </select>
                  </div>

                  <div>
                    <Label>Cor do Texto</Label>
                    <Input
                      type="color"
                      value={selectedElementData.imageWithTextTextColor || "#374151"}
                      onChange={(e) => updateElement(selectedElementData.id, { imageWithTextTextColor: e.target.value })}
                      className="mt-1 h-10"
                    />
                  </div>

                  <div>
                    <Label>Estilo da Borda</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.imageWithTextBorderStyle || "none"}
                      onChange={(e) => updateElement(selectedElementData.id, { imageWithTextBorderStyle: e.target.value })}
                    >
                      <option value="none">Sem borda</option>
                      <option value="solid">Sólida</option>
                      <option value="dashed">Tracejada</option>
                      <option value="dotted">Pontilhada</option>
                    </select>
                  </div>

                  {selectedElementData.imageWithTextBorderStyle !== "none" && (
                    <>
                      <div>
                        <Label>Cor da Borda</Label>
                        <Input
                          type="color"
                          value={selectedElementData.imageWithTextBorderColor || "#d1d5db"}
                          onChange={(e) => updateElement(selectedElementData.id, { imageWithTextBorderColor: e.target.value })}
                          className="mt-1 h-10"
                        />
                      </div>

                      <div>
                        <Label>Espessura da Borda</Label>
                        <select 
                          className="w-full px-3 py-2 border rounded-md mt-1"
                          value={selectedElementData.imageWithTextBorderWidth || "1"}
                          onChange={(e) => updateElement(selectedElementData.id, { imageWithTextBorderWidth: e.target.value })}
                        >
                          <option value="1">1px</option>
                          <option value="2">2px</option>
                          <option value="3">3px</option>
                          <option value="4">4px</option>
                          <option value="5">5px</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <Label>Arredondamento</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.imageWithTextBorderRadius || "small"}
                      onChange={(e) => updateElement(selectedElementData.id, { imageWithTextBorderRadius: e.target.value })}
                    >
                      <option value="none">Sem arredondamento</option>
                      <option value="small">Pequeno</option>
                      <option value="medium">Médio</option>
                      <option value="large">Grande</option>
                      <option value="full">Circular</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Propriedades para Fundo de Transição */}
              {selectedElementData.type === "transition_background" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bg-question">Título/Pergunta</Label>
                    <Input
                      id="bg-question"
                      value={selectedElementData.question || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { question: e.target.value })}
                      className="mt-1"
                      placeholder="Configuração de fundo"
                    />
                  </div>

                  <div>
                    <Label>Tipo de Fundo</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.backgroundType || "solid"}
                      onChange={(e) => updateElement(selectedElementData.id, { backgroundType: e.target.value })}
                    >
                      <option value="solid">Cor Sólida</option>
                      <option value="gradient">Gradiente</option>
                      <option value="image">Imagem</option>
                    </select>
                  </div>

                  {selectedElementData.backgroundType === "solid" && (
                    <div>
                      <Label>Cor de Fundo (RGB)</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="color"
                          value={selectedElementData.backgroundColor || "#8B5CF6"}
                          onChange={(e) => updateElement(selectedElementData.id, { backgroundColor: e.target.value })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={selectedElementData.backgroundColor || "#8B5CF6"}
                          onChange={(e) => updateElement(selectedElementData.id, { backgroundColor: e.target.value })}
                          placeholder="#8B5CF6"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}

                  {selectedElementData.backgroundType === "gradient" && (
                    <div className="space-y-3">
                      <div>
                        <Label>Direção do Gradiente</Label>
                        <select 
                          className="w-full px-3 py-2 border rounded-md mt-1"
                          value={selectedElementData.gradientDirection || "to-r"}
                          onChange={(e) => updateElement(selectedElementData.id, { gradientDirection: e.target.value })}
                        >
                          <option value="to-r">→ Esquerda para Direita</option>
                          <option value="to-l">← Direita para Esquerda</option>
                          <option value="to-t">↑ Baixo para Cima</option>
                          <option value="to-b">↓ Cima para Baixo</option>
                          <option value="to-br">↘ Diagonal (Baixo-Direita)</option>
                          <option value="to-bl">↙ Diagonal (Baixo-Esquerda)</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label>Cor Inicial</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={selectedElementData.gradientFrom || "#8B5CF6"}
                            onChange={(e) => updateElement(selectedElementData.id, { gradientFrom: e.target.value })}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={selectedElementData.gradientFrom || "#8B5CF6"}
                            onChange={(e) => updateElement(selectedElementData.id, { gradientFrom: e.target.value })}
                            placeholder="#8B5CF6"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Cor Final</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={selectedElementData.gradientTo || "#EC4899"}
                            onChange={(e) => updateElement(selectedElementData.id, { gradientTo: e.target.value })}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={selectedElementData.gradientTo || "#EC4899"}
                            onChange={(e) => updateElement(selectedElementData.id, { gradientTo: e.target.value })}
                            placeholder="#EC4899"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedElementData.backgroundType === "image" && (
                    <div>
                      <Label>URL da Imagem</Label>
                      <Input
                        value={selectedElementData.backgroundImage || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { backgroundImage: e.target.value })}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Propriedades para Texto de Transição */}
              {selectedElementData.type === "transition_text" && (
                <div className="space-y-4">
                  <div>
                    <Label>Texto</Label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md mt-1 resize-none"
                      rows={3}
                      value={selectedElementData.content || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                      placeholder="Preparando sua experiência..."
                    />
                  </div>

                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-sm mb-3">Formatação</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Tamanho</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs"
                          value={selectedElementData.fontSize || "xl"}
                          onChange={(e) => updateElement(selectedElementData.id, { fontSize: e.target.value })}
                        >
                          <option value="sm">Pequeno</option>
                          <option value="base">Normal</option>
                          <option value="lg">Grande</option>
                          <option value="xl">Extra Grande</option>
                          <option value="2xl">2X Grande</option>
                          <option value="3xl">3X Grande</option>
                          <option value="4xl">4X Grande</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label className="text-xs">Peso</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs"
                          value={selectedElementData.fontWeight || "semibold"}
                          onChange={(e) => updateElement(selectedElementData.id, { fontWeight: e.target.value })}
                        >
                          <option value="normal">Normal</option>
                          <option value="medium">Médio</option>
                          <option value="semibold">Semi-negrito</option>
                          <option value="bold">Negrito</option>
                          <option value="extrabold">Extra Negrito</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label className="text-xs">Alinhamento</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs"
                          value={selectedElementData.textAlign || "center"}
                          onChange={(e) => updateElement(selectedElementData.id, { textAlign: e.target.value as any })}
                        >
                          <option value="left">Esquerda</option>
                          <option value="center">Centro</option>
                          <option value="right">Direita</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label className="text-xs">Estilo</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs"
                          value={selectedElementData.fontStyle || "normal"}
                          onChange={(e) => updateElement(selectedElementData.id, { fontStyle: e.target.value })}
                        >
                          <option value="normal">Normal</option>
                          <option value="italic">Itálico</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Label className="text-xs">Cor do Texto</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="color"
                          value={selectedElementData.textColor || "#1F2937"}
                          onChange={(e) => updateElement(selectedElementData.id, { textColor: e.target.value })}
                          className="w-16 h-8 p-1"
                        />
                        <Input
                          value={selectedElementData.textColor || "#1F2937"}
                          onChange={(e) => updateElement(selectedElementData.id, { textColor: e.target.value })}
                          placeholder="#1F2937"
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Propriedades para Contador */}
              {selectedElementData.type === "transition_counter" && (
                <div className="space-y-4">
                  <div>
                    <Label>Tipo de Contador</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.counterType || "countdown"}
                      onChange={(e) => updateElement(selectedElementData.id, { counterType: e.target.value })}
                    >
                      <option value="countdown">Contador Regressivo (segundos)</option>
                      <option value="chronometer">Cronômetro Promocional</option>
                    </select>
                  </div>

                  {selectedElementData.counterType === "countdown" && (
                    <div className="space-y-3">
                      <div>
                        <Label>Valor Inicial (segundos)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={selectedElementData.counterStartValue || "10"}
                          onChange={(e) => updateElement(selectedElementData.id, { counterStartValue: parseInt(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label>Valor Final</Label>
                        <Input
                          type="number"
                          min="0"
                          value={selectedElementData.counterEndValue || "0"}
                          onChange={(e) => updateElement(selectedElementData.id, { counterEndValue: parseInt(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {selectedElementData.counterType === "chronometer" && (
                    <div className="space-y-3">
                      <div>
                        <Label>Horas</Label>
                        <Input
                          type="number"
                          min="0"
                          max="23"
                          value={selectedElementData.chronometerHours || "0"}
                          onChange={(e) => updateElement(selectedElementData.id, { chronometerHours: parseInt(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label>Minutos</Label>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={selectedElementData.chronometerMinutes || "15"}
                          onChange={(e) => updateElement(selectedElementData.id, { chronometerMinutes: parseInt(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label>Segundos</Label>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={selectedElementData.chronometerSeconds || "30"}
                          onChange={(e) => updateElement(selectedElementData.id, { chronometerSeconds: parseInt(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Cor do Contador</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedElementData.color || "#10B981"}
                        onChange={(e) => updateElement(selectedElementData.id, { color: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={selectedElementData.color || "#10B981"}
                        onChange={(e) => updateElement(selectedElementData.id, { color: e.target.value })}
                        placeholder="#10B981"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Tamanho do Contador</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.fontSize || "3xl"}
                      onChange={(e) => updateElement(selectedElementData.id, { fontSize: e.target.value })}
                    >
                      <option value="xl">Pequeno</option>
                      <option value="2xl">Médio</option>
                      <option value="3xl">Grande</option>
                      <option value="4xl">Extra Grande</option>
                      <option value="5xl">Gigante</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Propriedades para Transição Animada */}
              {selectedElementData.type === "animated_transition" && (
                <div className="space-y-4">
                  <div>
                    <Label>Texto Principal</Label>
                    <Input
                      value={selectedElementData.content || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                      placeholder="Processando..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Descrição (opcional)</Label>
                    <Input
                      value={selectedElementData.description || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { description: e.target.value })}
                      placeholder="Aguarde um momento..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Tipo de Animação</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.animationType || "pulse"}
                      onChange={(e) => updateElement(selectedElementData.id, { animationType: e.target.value })}
                    >
                      <option value="pulse">Pulso Suave</option>
                      <option value="glow">Brilho Intenso</option>
                      <option value="wave">Onda de Luz</option>
                      <option value="bounce">Salto Suave</option>
                    </select>
                  </div>

                  <div>
                    <Label>Velocidade da Animação</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.animationSpeed || "normal"}
                      onChange={(e) => updateElement(selectedElementData.id, { animationSpeed: e.target.value })}
                    >
                      <option value="slow">Lenta</option>
                      <option value="normal">Normal</option>
                      <option value="fast">Rápida</option>
                    </select>
                  </div>

                  <div>
                    <Label>Cores do Gradiente</Label>
                    <div className="space-y-2 mt-1">
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={selectedElementData.gradientStart || "#10B981"}
                          onChange={(e) => updateElement(selectedElementData.id, { gradientStart: e.target.value })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={selectedElementData.gradientStart || "#10B981"}
                          onChange={(e) => updateElement(selectedElementData.id, { gradientStart: e.target.value })}
                          placeholder="Cor inicial"
                          className="flex-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={selectedElementData.gradientEnd || "#8B5CF6"}
                          onChange={(e) => updateElement(selectedElementData.id, { gradientEnd: e.target.value })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={selectedElementData.gradientEnd || "#8B5CF6"}
                          onChange={(e) => updateElement(selectedElementData.id, { gradientEnd: e.target.value })}
                          placeholder="Cor final"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Propriedades para Carregamento */}
              {selectedElementData.type === "transition_loader" && (
                <div className="space-y-4">
                  <div>
                    <Label>Tipo de Spinner</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.loaderType || "spinner"}
                      onChange={(e) => updateElement(selectedElementData.id, { loaderType: e.target.value })}
                    >
                      <option value="spinner">Spinner Clássico</option>
                      <option value="dots">Pontos Saltitantes</option>
                      <option value="bars">Barras Animadas</option>
                      <option value="pulse">Pulso</option>
                      <option value="ring">Anel</option>
                      <option value="ripple">Ondas</option>
                    </select>
                  </div>

                  <div>
                    <Label>Tamanho</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.loaderSize || "md"}
                      onChange={(e) => updateElement(selectedElementData.id, { loaderSize: e.target.value })}
                    >
                      <option value="sm">Pequeno</option>
                      <option value="md">Médio</option>
                      <option value="lg">Grande</option>
                      <option value="xl">Extra Grande</option>
                    </select>
                  </div>

                  <div>
                    <Label>Cor do Spinner</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedElementData.loaderColor || "#F59E0B"}
                        onChange={(e) => updateElement(selectedElementData.id, { loaderColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={selectedElementData.loaderColor || "#F59E0B"}
                        onChange={(e) => updateElement(selectedElementData.id, { loaderColor: e.target.value })}
                        placeholder="#F59E0B"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Texto Principal</Label>
                    <Input
                      value={selectedElementData.content || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                      placeholder="Carregando..."
                      className="mt-1"
                    />
                  </div>

                  <div className="border rounded-lg p-3 bg-gray-50">
                    <h4 className="font-semibold text-sm mb-3">Textos Alternativos (Piscantes)</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Texto 1</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            value={selectedElementData.alternatingText1 || ""}
                            onChange={(e) => updateElement(selectedElementData.id, { alternatingText1: e.target.value })}
                            placeholder="Processando dados..."
                            className="flex-1 text-xs"
                          />
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={selectedElementData.alternatingDuration1 || "2"}
                            onChange={(e) => updateElement(selectedElementData.id, { alternatingDuration1: parseInt(e.target.value) })}
                            placeholder="2s"
                            className="w-16 text-xs"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs">Texto 2</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            value={selectedElementData.alternatingText2 || ""}
                            onChange={(e) => updateElement(selectedElementData.id, { alternatingText2: e.target.value })}
                            placeholder="Analisando respostas..."
                            className="flex-1 text-xs"
                          />
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={selectedElementData.alternatingDuration2 || "2"}
                            onChange={(e) => updateElement(selectedElementData.id, { alternatingDuration2: parseInt(e.target.value) })}
                            placeholder="2s"
                            className="w-16 text-xs"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs">Texto 3 (opcional)</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            value={selectedElementData.alternatingText3 || ""}
                            onChange={(e) => updateElement(selectedElementData.id, { alternatingText3: e.target.value })}
                            placeholder="Finalizando..."
                            className="flex-1 text-xs"
                          />
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={selectedElementData.alternatingDuration3 || "2"}
                            onChange={(e) => updateElement(selectedElementData.id, { alternatingDuration3: parseInt(e.target.value) })}
                            placeholder="2s"
                            className="w-16 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Tamanho do Texto</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.fontSize || "base"}
                      onChange={(e) => updateElement(selectedElementData.id, { fontSize: e.target.value })}
                    >
                      <option value="sm">Pequeno</option>
                      <option value="base">Normal</option>
                      <option value="lg">Grande</option>
                      <option value="xl">Extra Grande</option>
                    </select>
                  </div>

                  <div>
                    <Label>Cor do Texto</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedElementData.textColor || "#6B7280"}
                        onChange={(e) => updateElement(selectedElementData.id, { textColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={selectedElementData.textColor || "#6B7280"}
                        onChange={(e) => updateElement(selectedElementData.id, { textColor: e.target.value })}
                        placeholder="#6B7280"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="border rounded-lg p-3 bg-gray-50">
                    <h4 className="font-semibold text-sm mb-3">Redirecionamento</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <Label>Após Carregamento</Label>
                        <select 
                          className="w-full px-3 py-2 border rounded-md mt-1"
                          value={selectedElementData.redirectAction || "manual"}
                          onChange={(e) => updateElement(selectedElementData.id, { redirectAction: e.target.value })}
                        >
                          <option value="manual">Não Redirecionar (Manual)</option>
                          <option value="next_page">Próxima Página</option>
                          <option value="custom_url">URL Customizada</option>
                        </select>
                      </div>

                      {selectedElementData.redirectAction !== "manual" && (
                        <div>
                          <Label>Tempo de Carregamento (segundos)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="60"
                            value={selectedElementData.redirectDelay || 5}
                            onChange={(e) => updateElement(selectedElementData.id, { redirectDelay: parseInt(e.target.value) })}
                            placeholder="5"
                            className="mt-1"
                          />
                        </div>
                      )}

                      {selectedElementData.redirectAction === "custom_url" && (
                        <div>
                          <Label>URL de Destino</Label>
                          <Input
                            value={selectedElementData.redirectUrl || ""}
                            onChange={(e) => updateElement(selectedElementData.id, { redirectUrl: e.target.value })}
                            placeholder="https://exemplo.com"
                            className="mt-1"
                          />
                        </div>
                      )}

                      {selectedElementData.redirectAction !== "manual" && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="showCounter"
                            checked={selectedElementData.showRedirectCounter || false}
                            onChange={(e) => updateElement(selectedElementData.id, { showRedirectCounter: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <Label htmlFor="showCounter" className="text-sm">
                            Mostrar contador regressivo
                          </Label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Propriedades para Botão de Transição */}
              {selectedElementData.type === "transition_button" && (
                <div className="space-y-4">
                  <div>
                    <Label>Texto do Botão</Label>
                    <Input
                      value={selectedElementData.buttonText || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { buttonText: e.target.value })}
                      placeholder="Continuar"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Ação do Botão</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.buttonAction || "next_page"}
                      onChange={(e) => updateElement(selectedElementData.id, { buttonAction: e.target.value })}
                    >
                      <option value="next_page">Próxima Página</option>
                      <option value="url">URL Personalizada</option>
                    </select>
                  </div>

                  {selectedElementData.buttonAction === "url" && (
                    <div>
                      <Label>URL de Destino</Label>
                      <Input
                        value={selectedElementData.buttonUrl || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { buttonUrl: e.target.value })}
                        placeholder="https://exemplo.com"
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Tamanho do Botão</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.buttonSize || "medium"}
                      onChange={(e) => updateElement(selectedElementData.id, { buttonSize: e.target.value })}
                    >
                      <option value="small">Pequeno</option>
                      <option value="medium">Médio</option>
                      <option value="large">Grande</option>
                    </select>
                  </div>

                  <div>
                    <Label>Bordas</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.buttonBorderRadius || "medium"}
                      onChange={(e) => updateElement(selectedElementData.id, { buttonBorderRadius: e.target.value })}
                    >
                      <option value="none">Sem bordas</option>
                      <option value="small">Pequenas</option>
                      <option value="medium">Médias</option>
                      <option value="large">Grandes</option>
                      <option value="full">Totalmente arredondado</option>
                    </select>
                  </div>

                  <div>
                    <Label>Cor de Fundo</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedElementData.buttonBackgroundColor || "#10B981"}
                        onChange={(e) => updateElement(selectedElementData.id, { buttonBackgroundColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={selectedElementData.buttonBackgroundColor || "#10B981"}
                        onChange={(e) => updateElement(selectedElementData.id, { buttonBackgroundColor: e.target.value })}
                        placeholder="#10B981"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Cor do Texto</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedElementData.buttonTextColor || "#FFFFFF"}
                        onChange={(e) => updateElement(selectedElementData.id, { buttonTextColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={selectedElementData.buttonTextColor || "#FFFFFF"}
                        onChange={(e) => updateElement(selectedElementData.id, { buttonTextColor: e.target.value })}
                        placeholder="#FFFFFF"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Propriedades para Redirecionamento */}
              {selectedElementData.type === "transition_redirect" && (
                <div className="space-y-4">
                  <div>
                    <Label>Tipo de Redirecionamento</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.redirectType || "url"}
                      onChange={(e) => updateElement(selectedElementData.id, { redirectType: e.target.value })}
                    >
                      <option value="url">URL Externa</option>
                      <option value="next_page">Próxima Página</option>
                    </select>
                  </div>

                  {selectedElementData.redirectType === "url" && (
                    <div>
                      <Label>URL de Destino</Label>
                      <Input
                        value={selectedElementData.redirectUrl || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { redirectUrl: e.target.value })}
                        placeholder="https://exemplo.com"
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Tempo de Espera (segundos)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={selectedElementData.redirectDelay || "5"}
                      onChange={(e) => updateElement(selectedElementData.id, { redirectDelay: parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="show-redirect-counter"
                      checked={selectedElementData.showRedirectCounter || false}
                      onChange={(e) => updateElement(selectedElementData.id, { showRedirectCounter: e.target.checked })}
                    />
                    <Label htmlFor="show-redirect-counter">Mostrar contador regressivo</Label>
                  </div>

                  <div>
                    <Label>Texto do Redirecionamento</Label>
                    <Input
                      value={selectedElementData.content || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                      placeholder="Redirecionando em..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Cor do Texto</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedElementData.textColor || "#DC2626"}
                        onChange={(e) => updateElement(selectedElementData.id, { textColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={selectedElementData.textColor || "#DC2626"}
                        onChange={(e) => updateElement(selectedElementData.id, { textColor: e.target.value })}
                        placeholder="#DC2626"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Propriedades para Espaço */}
              {selectedElementData.type === "spacer" && (
                <div className="space-y-4">
                  <div>
                    <Label>Tamanho do Espaçamento</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.spacerSize || "medium"}
                      onChange={(e) => updateElement(selectedElementData.id, { spacerSize: e.target.value as "small" | "medium" | "large" })}
                    >
                      <option value="small">Pequeno (20px)</option>
                      <option value="medium">Médio (40px)</option>
                      <option value="large">Grande (80px)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Propriedades para Roleta da Sorte */}
              {selectedElementData.type === "game_wheel" && (
                <div className="space-y-4">
                  <div>
                    <Label>Segmentos da Roleta</Label>
                    <div className="space-y-2 mt-2">
                      {(selectedElementData.wheelSegments || ["Prêmio 1", "Prêmio 2", "Prêmio 3", "Prêmio 4"]).map((segment, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={segment}
                            onChange={(e) => {
                              const newSegments = [...(selectedElementData.wheelSegments || ["Prêmio 1", "Prêmio 2", "Prêmio 3", "Prêmio 4"])];
                              newSegments[index] = e.target.value;
                              updateElement(selectedElementData.id, { wheelSegments: newSegments });
                            }}
                            placeholder={`Segmento ${index + 1}`}
                            className="flex-1"
                          />
                          <Input
                            type="color"
                            value={(selectedElementData.wheelColors || ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"])[index] || "#e2e8f0"}
                            onChange={(e) => {
                              const newColors = [...(selectedElementData.wheelColors || ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"])];
                              newColors[index] = e.target.value;
                              updateElement(selectedElementData.id, { wheelColors: newColors });
                            }}
                            className="w-12 h-8 p-1"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newSegments = (selectedElementData.wheelSegments || ["Prêmio 1", "Prêmio 2", "Prêmio 3", "Prêmio 4"]).filter((_, i) => i !== index);
                              const newColors = (selectedElementData.wheelColors || ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"]).filter((_, i) => i !== index);
                              updateElement(selectedElementData.id, { wheelSegments: newSegments, wheelColors: newColors });
                            }}
                            className="p-2"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const currentSegments = selectedElementData.wheelSegments || ["Prêmio 1", "Prêmio 2", "Prêmio 3", "Prêmio 4"];
                          const currentColors = selectedElementData.wheelColors || ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"];
                          updateElement(selectedElementData.id, { 
                            wheelSegments: [...currentSegments, `Prêmio ${currentSegments.length + 1}`],
                            wheelColors: [...currentColors, "#e2e8f0"]
                          });
                        }}
                        className="w-full"
                      >
                        + Adicionar Segmento
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Segmento Vencedor</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.wheelWinningSegment || 0}
                      onChange={(e) => updateElement(selectedElementData.id, { wheelWinningSegment: parseInt(e.target.value) })}
                    >
                      {(selectedElementData.wheelSegments || ["Prêmio 1", "Prêmio 2", "Prêmio 3", "Prêmio 4"]).map((segment, index) => (
                        <option key={index} value={index}>{segment}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Cor do Ponteiro</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedElementData.wheelPointerColor || "#DC2626"}
                        onChange={(e) => updateElement(selectedElementData.id, { wheelPointerColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={selectedElementData.wheelPointerColor || "#DC2626"}
                        onChange={(e) => updateElement(selectedElementData.id, { wheelPointerColor: e.target.value })}
                        placeholder="#DC2626"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Duração da Animação (segundos)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={selectedElementData.wheelSpinDuration || 3}
                      onChange={(e) => updateElement(selectedElementData.id, { wheelSpinDuration: parseInt(e.target.value) })}
                      placeholder="3"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Propriedades para Raspadinha */}
              {selectedElementData.type === "game_scratch" && (
                <div className="space-y-4">
                  <div>
                    <Label>Cor da Cobertura</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedElementData.scratchCoverColor || "#e5e7eb"}
                        onChange={(e) => updateElement(selectedElementData.id, { scratchCoverColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={selectedElementData.scratchCoverColor || "#e5e7eb"}
                        onChange={(e) => updateElement(selectedElementData.id, { scratchCoverColor: e.target.value })}
                        placeholder="#e5e7eb"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Texto a Revelar</Label>
                    <Input
                      value={selectedElementData.scratchRevealText || "PARABÉNS!"}
                      onChange={(e) => updateElement(selectedElementData.id, { scratchRevealText: e.target.value })}
                      placeholder="PARABÉNS!"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Imagem a Revelar (URL)</Label>
                    <Input
                      value={selectedElementData.scratchRevealImage || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { scratchRevealImage: e.target.value })}
                      placeholder="https://exemplo.com/premio.jpg"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Tamanho do Pincel</Label>
                    <Input
                      type="number"
                      min="5"
                      max="50"
                      value={selectedElementData.scratchBrushSize || 20}
                      onChange={(e) => updateElement(selectedElementData.id, { scratchBrushSize: parseInt(e.target.value) })}
                      placeholder="20"
                      className="mt-1"
                    />
                    <div className="text-xs text-gray-500 mt-1">Pixels (5-50)</div>
                  </div>
                </div>
              )}

              {/* Propriedades para Escolha de Cor */}
              {selectedElementData.type === "game_color_pick" && (
                <div className="space-y-4">
                  <div>
                    <Label>Instrução do Jogo</Label>
                    <Input
                      value={selectedElementData.colorInstruction || "Escolha a cor da sorte!"}
                      onChange={(e) => updateElement(selectedElementData.id, { colorInstruction: e.target.value })}
                      placeholder="Escolha a cor da sorte!"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Opções de Cores</Label>
                    <div className="space-y-2 mt-2">
                      {(selectedElementData.colorOptions || ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57"]).map((color, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            type="color"
                            value={color}
                            onChange={(e) => {
                              const newColors = [...(selectedElementData.colorOptions || ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57"])];
                              newColors[index] = e.target.value;
                              updateElement(selectedElementData.id, { colorOptions: newColors });
                            }}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={color}
                            onChange={(e) => {
                              const newColors = [...(selectedElementData.colorOptions || ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57"])];
                              newColors[index] = e.target.value;
                              updateElement(selectedElementData.id, { colorOptions: newColors });
                            }}
                            placeholder="#FF6B6B"
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newColors = (selectedElementData.colorOptions || ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57"]).filter((_, i) => i !== index);
                              updateElement(selectedElementData.id, { colorOptions: newColors });
                            }}
                            className="p-2"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const currentColors = selectedElementData.colorOptions || ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57"];
                          updateElement(selectedElementData.id, { colorOptions: [...currentColors, "#e2e8f0"] });
                        }}
                        className="w-full"
                      >
                        + Adicionar Cor
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Cor Vencedora</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.colorCorrectAnswer || (selectedElementData.colorOptions || ["#FF6B6B"])[0]}
                      onChange={(e) => updateElement(selectedElementData.id, { colorCorrectAnswer: e.target.value })}
                    >
                      {(selectedElementData.colorOptions || ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57"]).map((color, index) => (
                        <option key={index} value={color}>Cor {index + 1} ({color})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Propriedades para Quebra Blocos */}
              {selectedElementData.type === "game_brick_break" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Linhas de Blocos</Label>
                      <Input
                        type="number"
                        min="1"
                        max="8"
                        value={selectedElementData.brickRows || 3}
                        onChange={(e) => updateElement(selectedElementData.id, { brickRows: parseInt(e.target.value) })}
                        placeholder="3"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Colunas de Blocos</Label>
                      <Input
                        type="number"
                        min="3"
                        max="12"
                        value={selectedElementData.brickColumns || 6}
                        onChange={(e) => updateElement(selectedElementData.id, { brickColumns: parseInt(e.target.value) })}
                        placeholder="6"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Cores dos Blocos</Label>
                    <div className="space-y-2 mt-2">
                      {(selectedElementData.brickColors || ["#FF6B6B", "#4ECDC4", "#45B7D1"]).map((color, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            type="color"
                            value={color}
                            onChange={(e) => {
                              const newColors = [...(selectedElementData.brickColors || ["#FF6B6B", "#4ECDC4", "#45B7D1"])];
                              newColors[index] = e.target.value;
                              updateElement(selectedElementData.id, { brickColors: newColors });
                            }}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={color}
                            onChange={(e) => {
                              const newColors = [...(selectedElementData.brickColors || ["#FF6B6B", "#4ECDC4", "#45B7D1"])];
                              newColors[index] = e.target.value;
                              updateElement(selectedElementData.id, { brickColors: newColors });
                            }}
                            placeholder="#FF6B6B"
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newColors = (selectedElementData.brickColors || ["#FF6B6B", "#4ECDC4", "#45B7D1"]).filter((_, i) => i !== index);
                              updateElement(selectedElementData.id, { brickColors: newColors });
                            }}
                            className="p-2"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const currentColors = selectedElementData.brickColors || ["#FF6B6B", "#4ECDC4", "#45B7D1"];
                          updateElement(selectedElementData.id, { brickColors: [...currentColors, "#e2e8f0"] });
                        }}
                        className="w-full"
                      >
                        + Adicionar Cor
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Cor da Raquete</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedElementData.paddleColor || "#FFFFFF"}
                        onChange={(e) => updateElement(selectedElementData.id, { paddleColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={selectedElementData.paddleColor || "#FFFFFF"}
                        onChange={(e) => updateElement(selectedElementData.id, { paddleColor: e.target.value })}
                        placeholder="#FFFFFF"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Cor da Bola</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedElementData.ballColor || "#FECA57"}
                        onChange={(e) => updateElement(selectedElementData.id, { ballColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={selectedElementData.ballColor || "#FECA57"}
                        onChange={(e) => updateElement(selectedElementData.id, { ballColor: e.target.value })}
                        placeholder="#FECA57"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Propriedades para Jogo da Memória */}
              {selectedElementData.type === "game_memory_cards" && (
                <div className="space-y-4">
                  <div>
                    <Label>Número de Pares</Label>
                    <Input
                      type="number"
                      min="2"
                      max="8"
                      value={selectedElementData.memoryCardPairs || 4}
                      onChange={(e) => updateElement(selectedElementData.id, { memoryCardPairs: parseInt(e.target.value) })}
                      placeholder="4"
                      className="mt-1"
                    />
                    <div className="text-xs text-gray-500 mt-1">Total de cartas: {(selectedElementData.memoryCardPairs || 4) * 2}</div>
                  </div>

                  <div>
                    <Label>Tema das Cartas</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.memoryCardTheme || "numbers"}
                      onChange={(e) => updateElement(selectedElementData.id, { memoryCardTheme: e.target.value })}
                    >
                      <option value="numbers">Números (1, 2, 3...)</option>
                      <option value="colors">Cores (🔴, 🔵, 🟢...)</option>
                      <option value="icons">Ícones (⭐, ❤️, 🎯...)</option>
                      <option value="custom">Imagens Customizadas</option>
                    </select>
                  </div>

                  {selectedElementData.memoryCardTheme === "custom" && (
                    <div>
                      <Label>URLs das Imagens Customizadas</Label>
                      <div className="space-y-2 mt-2">
                        {Array.from({ length: selectedElementData.memoryCardPairs || 4 }, (_, index) => (
                          <Input
                            key={index}
                            value={(selectedElementData.memoryCustomImages || [])[index] || ""}
                            onChange={(e) => {
                              const newImages = [...(selectedElementData.memoryCustomImages || [])];
                              newImages[index] = e.target.value;
                              updateElement(selectedElementData.id, { memoryCustomImages: newImages });
                            }}
                            placeholder={`URL da imagem ${index + 1}`}
                            className="text-xs"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Propriedades para Caça-Níquel */}
              {selectedElementData.type === "game_slot_machine" && (
                <div className="space-y-4">
                  <div>
                    <Label>Número de Rolos</Label>
                    <Input
                      type="number"
                      min="3"
                      max="5"
                      value={selectedElementData.slotReels || 3}
                      onChange={(e) => updateElement(selectedElementData.id, { slotReels: parseInt(e.target.value) })}
                      placeholder="3"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Símbolos Disponíveis</Label>
                    <div className="space-y-2 mt-2">
                      {(selectedElementData.slotSymbols || ["🍒", "🍋", "🍊", "🔔", "⭐"]).map((symbol, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={symbol}
                            onChange={(e) => {
                              const newSymbols = [...(selectedElementData.slotSymbols || ["🍒", "🍋", "🍊", "🔔", "⭐"])];
                              newSymbols[index] = e.target.value;
                              updateElement(selectedElementData.id, { slotSymbols: newSymbols });
                            }}
                            placeholder="🍒"
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newSymbols = (selectedElementData.slotSymbols || ["🍒", "🍋", "🍊", "🔔", "⭐"]).filter((_, i) => i !== index);
                              updateElement(selectedElementData.id, { slotSymbols: newSymbols });
                            }}
                            className="p-2"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const currentSymbols = selectedElementData.slotSymbols || ["🍒", "🍋", "🍊", "🔔", "⭐"];
                          updateElement(selectedElementData.id, { slotSymbols: [...currentSymbols, "🎯"] });
                        }}
                        className="w-full"
                      >
                        + Adicionar Símbolo
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Combinação Vencedora</Label>
                    <div className="space-y-2 mt-2">
                      {Array.from({ length: selectedElementData.slotReels || 3 }, (_, index) => (
                        <select
                          key={index}
                          className="w-full px-3 py-2 border rounded-md"
                          value={(selectedElementData.slotWinningCombination || [])[index] || (selectedElementData.slotSymbols || ["🍒", "🍋", "🍊"])[0]}
                          onChange={(e) => {
                            const newCombination = [...(selectedElementData.slotWinningCombination || [])];
                            newCombination[index] = e.target.value;
                            updateElement(selectedElementData.id, { slotWinningCombination: newCombination });
                          }}
                        >
                          {(selectedElementData.slotSymbols || ["🍒", "🍋", "🍊", "🔔", "⭐"]).map((symbol, symbolIndex) => (
                            <option key={symbolIndex} value={symbol}>Rolo {index + 1}: {symbol}</option>
                          ))}
                        </select>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Combinação: {(selectedElementData.slotWinningCombination || []).join(" ") || "Não definida"}
                    </div>
                  </div>
                </div>
              )}

              {/* Propriedades para Áudio */}
              {selectedElementData.type === "audio" && (
                <div className="space-y-4">
                  <div>
                    <Label>Tipo de Áudio</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.audioType || "upload"}
                      onChange={(e) => updateElement(selectedElementData.id, { audioType: e.target.value as "upload" | "elevenlabs" })}
                    >
                      <option value="upload">Upload de Arquivo</option>
                      <option value="elevenlabs">ElevenLabs (Texto para Fala)</option>
                    </select>
                  </div>

                  <div>
                    <Label>Título do Áudio</Label>
                    <Input
                      value={selectedElementData.audioTitle || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { audioTitle: e.target.value })}
                      placeholder="Mensagem de Áudio"
                      className="mt-1"
                    />
                  </div>

                  {selectedElementData.audioType === "upload" && (
                    <>
                      <div>
                        <Label>Upload de Arquivo de Áudio</Label>
                        <Input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Verificar tamanho (máximo 10MB)
                              if (file.size > 10 * 1024 * 1024) {
                                alert("Arquivo muito grande. Máximo 10MB.");
                                return;
                              }
                              // Criar URL temporária para preview
                              const audioUrl = URL.createObjectURL(file);
                              updateElement(selectedElementData.id, { 
                                audioFile: file,
                                audioUrl: audioUrl,
                                audioDuration: 0 // Será atualizado quando o áudio carregar
                              });
                            }
                          }}
                          className="mt-1"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Formatos suportados: MP3, WAV, OGG, M4A (máximo 10MB)
                        </div>
                      </div>

                      {selectedElementData.audioUrl && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <Label className="text-xs">Preview do Áudio</Label>
                          <audio 
                            controls 
                            className="w-full mt-2"
                            src={selectedElementData.audioUrl}
                            onLoadedMetadata={(e) => {
                              const duration = Math.floor((e.target as HTMLAudioElement).duration);
                              updateElement(selectedElementData.id, { audioDuration: duration });
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {selectedElementData.audioType === "elevenlabs" && (
                    <>
                      <div>
                        <Label>Texto para Converter em Fala</Label>
                        <textarea
                          value={selectedElementData.elevenLabsText || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { elevenLabsText: e.target.value })}
                          placeholder="Digite o texto que será convertido em áudio..."
                          className="w-full px-3 py-2 border rounded-md mt-1 min-h-[100px] resize-none"
                          maxLength={1000}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Máximo 1000 caracteres. Você pode usar variáveis como {`{nome}`}, {`{email}`}, etc.
                        </div>
                      </div>

                      <div>
                        <Label>Voice ID do ElevenLabs</Label>
                        <Input
                          value={selectedElementData.elevenLabsVoiceId || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { elevenLabsVoiceId: e.target.value })}
                          placeholder="pNInz6obpgDQGcFmaJgB"
                          className="mt-1"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Encontre o Voice ID na sua biblioteca do ElevenLabs
                        </div>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-800 mb-2">⚙️ Configuração da API</h4>
                        <div className="text-xs text-blue-700">
                          <p>• Configure sua chave API do ElevenLabs nas configurações do projeto</p>
                          <p>• O áudio será gerado automaticamente quando o quiz for executado</p>
                          <p>• Custo aproximado: $0.30 por 1000 caracteres</p>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <Label>Duração Estimada (segundos)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="300"
                      value={selectedElementData.audioDuration || 15}
                      onChange={(e) => updateElement(selectedElementData.id, { audioDuration: parseInt(e.target.value) })}
                      placeholder="15"
                      className="mt-1"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedElementData.audioType === "upload" ? "Detectado automaticamente após upload" : "Estimativa para o áudio gerado"}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="showWaveform"
                        checked={selectedElementData.showWaveform || false}
                        onChange={(e) => updateElement(selectedElementData.id, { showWaveform: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="showWaveform" className="text-sm">Mostrar forma de onda visual</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="autoPlay"
                        checked={selectedElementData.autoPlay || false}
                        onChange={(e) => updateElement(selectedElementData.id, { autoPlay: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="autoPlay" className="text-sm">Reproduzir automaticamente</Label>
                    </div>
                  </div>
                </div>
              )}

              {selectedElementData.type === "continue_button" && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">🔄 Botão de Navegação</h4>
                    <p className="text-xs text-blue-700">
                      Configure um botão para navegar para a próxima página ou URL externa.
                    </p>
                  </div>

                  <div>
                    <Label>Texto do Botão</Label>
                    <Input
                      value={selectedElementData.buttonText || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { buttonText: e.target.value })}
                      placeholder="Continuar"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Ação do Botão</Label>
                    <select
                      value={selectedElementData.buttonAction || "next_page"}
                      onChange={(e) => updateElement(selectedElementData.id, { buttonAction: e.target.value as "url" | "next_page" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                    >
                      <option value="next_page">Próxima página</option>
                      <option value="url">URL personalizada</option>
                    </select>
                  </div>

                  {selectedElementData.buttonAction === "url" && (
                    <div>
                      <Label>URL de Destino</Label>
                      <Input
                        value={selectedElementData.buttonUrl || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { buttonUrl: e.target.value })}
                        placeholder="https://exemplo.com"
                        className="mt-1"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        URL completa incluindo https://
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Tamanho do Botão</Label>
                    <select
                      value={selectedElementData.buttonSize || "medium"}
                      onChange={(e) => updateElement(selectedElementData.id, { buttonSize: e.target.value as "small" | "medium" | "large" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                    >
                      <option value="small">Pequeno</option>
                      <option value="medium">Médio</option>
                      <option value="large">Grande</option>
                    </select>
                  </div>

                  <div>
                    <Label>Estilo da Borda</Label>
                    <select
                      value={selectedElementData.buttonBorderRadius || "medium"}
                      onChange={(e) => updateElement(selectedElementData.id, { buttonBorderRadius: e.target.value as "none" | "small" | "medium" | "large" | "full" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                    >
                      <option value="none">Sem borda</option>
                      <option value="small">Borda pequena</option>
                      <option value="medium">Borda média</option>
                      <option value="large">Borda grande</option>
                      <option value="full">Borda redonda</option>
                    </select>
                  </div>

                  <div>
                    <Label>Cor de Fundo</Label>
                    <Input
                      type="color"
                      value={selectedElementData.buttonBackgroundColor || "#10B981"}
                      onChange={(e) => updateElement(selectedElementData.id, { buttonBackgroundColor: e.target.value })}
                      className="mt-1 h-10"
                    />
                  </div>

                  <div>
                    <Label>Cor do Texto</Label>
                    <Input
                      type="color"
                      value={selectedElementData.buttonTextColor || "#FFFFFF"}
                      onChange={(e) => updateElement(selectedElementData.id, { buttonTextColor: e.target.value })}
                      className="mt-1 h-10"
                    />
                  </div>

                  <div>
                    <Label>Cor ao Passar o Mouse</Label>
                    <Input
                      type="color"
                      value={selectedElementData.buttonHoverColor || "#059669"}
                      onChange={(e) => updateElement(selectedElementData.id, { buttonHoverColor: e.target.value })}
                      className="mt-1 h-10"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Fixar no Rodapé</Label>
                        <p className="text-xs text-gray-500 mt-1">
                          Botão sempre visível na parte inferior da tela
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedElementData.isFixedFooter || false}
                        onChange={(e) => updateElement(selectedElementData.id, { isFixedFooter: e.target.checked })}
                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                    </div>
                    
                    {selectedElementData.isFixedFooter && (
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-orange-600">🔒</span>
                          <span className="font-medium text-orange-800">Botão Fixo Ativo</span>
                        </div>
                        <div className="text-xs text-orange-700">
                          O botão permanecerá sempre visível na parte inferior da tela, mesmo quando o usuário rolar a página.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedElementData.type === "loading_question" && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-green-800 mb-2">⏳ Carregamento + Pergunta</h4>
                    <p className="text-xs text-green-700">
                      Barra de carregamento visual com opções avançadas de personalização e popup com pergunta.
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">⚙️ Configurações Gerais</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Duração (segundos)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          value={selectedElementData.loadingDuration || 3}
                          onChange={(e) => updateElement(selectedElementData.id, { loadingDuration: parseInt(e.target.value) })}
                          placeholder="3"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Tipo de Animação</Label>
                        <select
                          value={selectedElementData.animationType || "smooth"}
                          onChange={(e) => updateElement(selectedElementData.id, { animationType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                        >
                          <option value="smooth">Suave</option>
                          <option value="fast">Rápida</option>
                          <option value="bouncy">Elástica</option>
                          <option value="elastic">Dinâmica</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label>Texto Durante o Carregamento</Label>
                      <Input
                        value={selectedElementData.loadingText || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { loadingText: e.target.value })}
                        placeholder="Carregando..."
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Tamanho do Texto</Label>
                        <select
                          value={selectedElementData.loadingTextSize || "medium"}
                          onChange={(e) => updateElement(selectedElementData.id, { loadingTextSize: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                        >
                          <option value="small">Pequeno</option>
                          <option value="medium">Médio</option>
                          <option value="large">Grande</option>
                        </select>
                      </div>
                      <div>
                        <Label>Cor do Texto</Label>
                        <Input
                          type="color"
                          value={selectedElementData.loadingTextColor || "#374151"}
                          onChange={(e) => updateElement(selectedElementData.id, { loadingTextColor: e.target.value })}
                          className="mt-1 h-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">🎨 Estilo da Barra</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Altura da Barra</Label>
                        <select
                          value={selectedElementData.loadingBarHeight || "medium"}
                          onChange={(e) => updateElement(selectedElementData.id, { loadingBarHeight: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                        >
                          <option value="thin">Muito Fina</option>
                          <option value="small">Fina</option>
                          <option value="medium">Média</option>
                          <option value="large">Grossa</option>
                          <option value="extra_large">Muito Grossa</option>
                        </select>
                      </div>
                      <div>
                        <Label>Estilo das Bordas</Label>
                        <select
                          value={selectedElementData.loadingBarStyle || "rounded"}
                          onChange={(e) => updateElement(selectedElementData.id, { loadingBarStyle: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                        >
                          <option value="square">Quadrada</option>
                          <option value="slightly_rounded">Levemente Arredondada</option>
                          <option value="rounded">Arredondada</option>
                          <option value="very_rounded">Muito Arredondada</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Cor da Barra</Label>
                        <Input
                          type="color"
                          value={selectedElementData.loadingBarColor || "#10B981"}
                          onChange={(e) => updateElement(selectedElementData.id, { loadingBarColor: e.target.value })}
                          className="mt-1 h-10"
                        />
                      </div>
                      <div>
                        <Label>Cor de Fundo</Label>
                        <Input
                          type="color"
                          value={selectedElementData.loadingBarBackgroundColor || "#E5E7EB"}
                          onChange={(e) => updateElement(selectedElementData.id, { loadingBarBackgroundColor: e.target.value })}
                          className="mt-1 h-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">✨ Efeitos Visuais</h5>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Efeito de Brilho</Label>
                        <input
                          type="checkbox"
                          checked={selectedElementData.showGlow !== false}
                          onChange={(e) => updateElement(selectedElementData.id, { showGlow: e.target.checked })}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label>Mostrar Porcentagem</Label>
                        <input
                          type="checkbox"
                          checked={selectedElementData.showPercentage !== false}
                          onChange={(e) => updateElement(selectedElementData.id, { showPercentage: e.target.checked })}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Mostrar Tempo Restante</Label>
                        <input
                          type="checkbox"
                          checked={selectedElementData.showTimeRemaining || false}
                          onChange={(e) => updateElement(selectedElementData.id, { showTimeRemaining: e.target.checked })}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Listras Animadas</Label>
                        <input
                          type="checkbox"
                          checked={selectedElementData.showStripes || false}
                          onChange={(e) => updateElement(selectedElementData.id, { showStripes: e.target.checked })}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                      </div>

                      {selectedElementData.showStripes && (
                        <div className="flex items-center justify-between pl-6">
                          <Label>Animar Listras</Label>
                          <input
                            type="checkbox"
                            checked={selectedElementData.animateStripes || false}
                            onChange={(e) => updateElement(selectedElementData.id, { animateStripes: e.target.checked })}
                            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                        </div>
                      )}
                      
                      <div>
                        <Label>Cor da Porcentagem</Label>
                        <Input
                          type="color"
                          value={selectedElementData.percentageColor || "#6B7280"}
                          onChange={(e) => updateElement(selectedElementData.id, { percentageColor: e.target.value })}
                          className="mt-1 h-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📝 Texto Adicional</h5>
                    
                    <div>
                      <Label>Texto Adicional (opcional)</Label>
                      <Input
                        value={selectedElementData.additionalText || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { additionalText: e.target.value })}
                        placeholder="Texto que aparece abaixo da barra"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Cor do Texto Adicional</Label>
                      <Input
                        type="color"
                        value={selectedElementData.additionalTextColor || "#9CA3AF"}
                        onChange={(e) => updateElement(selectedElementData.id, { additionalTextColor: e.target.value })}
                        className="mt-1 h-10"
                      />
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">💬 Configuração do Popup</h5>
                    
                    <div>
                      <Label>Pergunta do Popup</Label>
                      <Input
                        value={selectedElementData.popupQuestion || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { popupQuestion: e.target.value })}
                        placeholder="Você gostaria de continuar?"
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <Label>Texto do "Sim"</Label>
                        <Input
                          value={selectedElementData.popupYesText || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { popupYesText: e.target.value })}
                          placeholder="Sim"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Texto do "Não"</Label>
                        <Input
                          value={selectedElementData.popupNoText || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { popupNoText: e.target.value })}
                          placeholder="Não"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-sm mb-3">🎯 Captura de Resposta</h5>
                    <div>
                      <Label>ID da Variável</Label>
                      <Input
                        value={selectedElementData.responseId || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { responseId: e.target.value })}
                        placeholder="pergunta_continuacao"
                        className="mt-1"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Use {"{{"}{selectedElementData.responseId || 'pergunta_continuacao'}{"}}"} em outros elementos para referenciar a resposta (sim/não)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NOVOS ELEMENTOS - PAINÉIS DE CONFIGURAÇÃO */}
              {selectedElementData.type === "chart" && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">📊 Gráfico</h4>
                    <p className="text-xs text-blue-700">
                      Exibe dados visuais em formato de gráfico de barras animado
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📝 Conteúdo</h5>
                    
                    <div>
                      <Label>Título do Gráfico</Label>
                      <Input
                        value={selectedElementData.chartTitle || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { chartTitle: e.target.value })}
                        placeholder="Gráfico de Dados"
                        className="mt-1"
                      />
                    </div>

                    <div className="mt-3">
                      <Label>Descrição</Label>
                      <Input
                        value={selectedElementData.chartDescription || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { chartDescription: e.target.value })}
                        placeholder="Visualização dos dados em tempo real"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📊 Dados</h5>
                    
                    <div>
                      <Label>Valores (separados por vírgula)</Label>
                      <Input
                        value={(selectedElementData.chartData || [65, 45, 80, 30, 90]).join(", ")}
                        onChange={(e) => {
                          const values = e.target.value.split(",").map(v => parseInt(v.trim()) || 0);
                          updateElement(selectedElementData.id, { chartData: values });
                        }}
                        placeholder="65, 45, 80, 30, 90"
                        className="mt-1"
                      />
                    </div>

                    <div className="mt-3">
                      <Label>Cores (separadas por vírgula)</Label>
                      <Input
                        value={(selectedElementData.chartColors || ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]).join(", ")}
                        onChange={(e) => {
                          const colors = e.target.value.split(",").map(c => c.trim());
                          updateElement(selectedElementData.id, { chartColors: colors });
                        }}
                        placeholder="#10b981, #3b82f6, #f59e0b"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-sm mb-3">🎨 Estilo</h5>
                    
                    <div>
                      <Label>Cor do Título</Label>
                      <Input
                        type="color"
                        value={selectedElementData.chartTitleColor || "#1f2937"}
                        onChange={(e) => updateElement(selectedElementData.id, { chartTitleColor: e.target.value })}
                        className="mt-1 h-10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedElementData.type === "metrics" && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-purple-800 mb-2">📈 Métricas</h4>
                    <p className="text-xs text-purple-700">
                      Exibe métricas de performance com barras de progresso
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📝 Conteúdo</h5>
                    
                    <div>
                      <Label>Título das Métricas</Label>
                      <Input
                        value={selectedElementData.metricsTitle || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { metricsTitle: e.target.value })}
                        placeholder="Métricas de Performance"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-sm mb-3">🎨 Estilo</h5>
                    
                    <div>
                      <Label>Cor do Título</Label>
                      <Input
                        type="color"
                        value={selectedElementData.metricsColor || "#1f2937"}
                        onChange={(e) => updateElement(selectedElementData.id, { metricsColor: e.target.value })}
                        className="mt-1 h-10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedElementData.type === "stripe_embed" && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">💳 Stripe Checkout</h4>
                    <p className="text-xs text-blue-700">
                      Formulário de pagamento seguro via Stripe
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📝 Conteúdo</h5>
                    
                    <div>
                      <Label>Título</Label>
                      <Input
                        value={selectedElementData.stripeTitle || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { stripeTitle: e.target.value })}
                        placeholder="Checkout Seguro"
                        className="mt-1"
                      />
                    </div>

                    <div className="mt-3">
                      <Label>Descrição</Label>
                      <Input
                        value={selectedElementData.stripeDescription || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { stripeDescription: e.target.value })}
                        placeholder="Processamento seguro via Stripe"
                        className="mt-1"
                      />
                    </div>

                    <div className="mt-3">
                      <Label>Valor</Label>
                      <Input
                        value={selectedElementData.stripeAmount || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { stripeAmount: e.target.value })}
                        placeholder="R$ 97,00"
                        className="mt-1"
                      />
                    </div>

                    <div className="mt-3">
                      <Label>Texto do Botão</Label>
                      <Input
                        value={selectedElementData.stripeButtonText || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { stripeButtonText: e.target.value })}
                        placeholder="Pagar com Stripe"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedElementData.type === "paypal" && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-yellow-800 mb-2">💰 PayPal Checkout</h4>
                    <p className="text-xs text-yellow-700">
                      Botão de pagamento rápido e seguro via PayPal
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📝 Conteúdo</h5>
                    
                    <div>
                      <Label>Título</Label>
                      <Input
                        value={selectedElementData.paypalTitle || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { paypalTitle: e.target.value })}
                        placeholder="PayPal Checkout"
                        className="mt-1"
                      />
                    </div>

                    <div className="mt-3">
                      <Label>Descrição</Label>
                      <Input
                        value={selectedElementData.paypalDescription || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { paypalDescription: e.target.value })}
                        placeholder="Pagamento rápido e seguro"
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <Label>Valor</Label>
                        <Input
                          value={selectedElementData.paypalAmount || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { paypalAmount: e.target.value })}
                          placeholder="$ 29.99"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Moeda</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.paypalCurrency || "USD"}
                          onChange={(e) => updateElement(selectedElementData.id, { paypalCurrency: e.target.value })}
                        >
                          <option value="USD">USD</option>
                          <option value="BRL">BRL</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Label>Texto do Botão</Label>
                      <Input
                        value={selectedElementData.paypalButtonText || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { paypalButtonText: e.target.value })}
                        placeholder="Pagar com PayPal"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-sm mb-3">🎨 Estilo do Botão</h5>
                    
                    <div>
                      <Label>Estilo</Label>
                      <select 
                        className="w-full px-2 py-1 border rounded text-xs mt-1"
                        value={selectedElementData.paypalButtonStyle || "gold"}
                        onChange={(e) => updateElement(selectedElementData.id, { paypalButtonStyle: e.target.value })}
                      >
                        <option value="gold">Dourado</option>
                        <option value="blue">Azul</option>
                        <option value="silver">Prata</option>
                        <option value="black">Preto</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {selectedElementData.type === "before_after" && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-green-800 mb-2">🔄 Antes & Depois</h4>
                    <p className="text-xs text-green-700">
                      Comparação visual entre situação anterior e posterior
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📝 Conteúdo</h5>
                    
                    <div>
                      <Label>Título</Label>
                      <Input
                        value={selectedElementData.beforeAfterTitle || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { beforeAfterTitle: e.target.value })}
                        placeholder="Transformação Incrível"
                        className="mt-1"
                      />
                    </div>

                    <div className="mt-3">
                      <Label>Itens "Antes" (um por linha)</Label>
                      <textarea
                        className="w-full px-2 py-1 border rounded text-xs mt-1"
                        rows={3}
                        value={(selectedElementData.beforeItems || ["Problema 1", "Problema 2", "Problema 3"]).join("\n")}
                        onChange={(e) => {
                          const items = e.target.value.split("\n").filter(item => item.trim());
                          updateElement(selectedElementData.id, { beforeItems: items });
                        }}
                        placeholder="Problema 1&#10;Problema 2&#10;Problema 3"
                      />
                    </div>

                    <div className="mt-3">
                      <Label>Itens "Depois" (um por linha)</Label>
                      <textarea
                        className="w-full px-2 py-1 border rounded text-xs mt-1"
                        rows={3}
                        value={(selectedElementData.afterItems || ["Benefício 1", "Benefício 2", "Benefício 3"]).join("\n")}
                        onChange={(e) => {
                          const items = e.target.value.split("\n").filter(item => item.trim());
                          updateElement(selectedElementData.id, { afterItems: items });
                        }}
                        placeholder="Benefício 1&#10;Benefício 2&#10;Benefício 3"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedElementData.type === "pricing_plans" && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-indigo-800 mb-2">💎 Tabela de Preços</h4>
                    <p className="text-xs text-indigo-700">
                      Exibe opções de planos com preços e funcionalidades
                    </p>
                  </div>

                  <div>
                    <h5 className="font-semibold text-sm mb-3">📝 Conteúdo</h5>
                    
                    <div>
                      <Label>Título</Label>
                      <Input
                        value={selectedElementData.pricingTitle || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { pricingTitle: e.target.value })}
                        placeholder="Escolha Seu Plano"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedElementData.type === "share_quiz" && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-green-800 mb-2">🔗 Compartilhar Quiz</h4>
                    <p className="text-xs text-green-700">
                      Permite que os usuários compartilhem o quiz em redes sociais com mensagem personalizável.
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">💬 Mensagem</h5>
                    
                    <div>
                      <Label>Mensagem de Compartilhamento</Label>
                      <Input
                        value={selectedElementData.shareMessage || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { shareMessage: e.target.value })}
                        placeholder="Faça esse teste e se surpreenda também!"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📱 Redes Sociais</h5>
                    
                    <div className="space-y-2">
                      {["whatsapp", "facebook", "twitter", "instagram", "email"].map((network) => (
                        <div key={network} className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <span className="capitalize">
                              {network === "whatsapp" ? "WhatsApp" : network}
                            </span>
                          </Label>
                          <input
                            type="checkbox"
                            checked={(selectedElementData.shareNetworks || []).includes(network)}
                            onChange={(e) => {
                              const networks = selectedElementData.shareNetworks || [];
                              if (e.target.checked) {
                                updateElement(selectedElementData.id, { shareNetworks: [...networks, network] });
                              } else {
                                updateElement(selectedElementData.id, { shareNetworks: networks.filter(n => n !== network) });
                              }
                            }}
                            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mt-3">
                      <Label>Layout dos Botões</Label>
                      <select 
                        className="w-full px-2 py-1 border rounded text-xs mt-1"
                        value={selectedElementData.shareLayout || "horizontal"}
                        onChange={(e) => updateElement(selectedElementData.id, { shareLayout: e.target.value })}
                      >
                        <option value="horizontal">Horizontal</option>
                        <option value="vertical">Vertical</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">🎨 Estilo dos Botões</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Tamanho</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.shareButtonSize || "medium"}
                          onChange={(e) => updateElement(selectedElementData.id, { shareButtonSize: e.target.value })}
                        >
                          <option value="small">Pequeno</option>
                          <option value="medium">Médio</option>
                          <option value="large">Grande</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label>Bordas</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.shareButtonBorderRadius || "medium"}
                          onChange={(e) => updateElement(selectedElementData.id, { shareButtonBorderRadius: e.target.value })}
                        >
                          <option value="none">Quadrado</option>
                          <option value="small">Pequeno</option>
                          <option value="medium">Médio</option>
                          <option value="large">Grande</option>
                          <option value="full">Circular</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <Label>Cor de Fundo</Label>
                        <Input
                          type="color"
                          value={selectedElementData.shareButtonBackgroundColor || "#10B981"}
                          onChange={(e) => updateElement(selectedElementData.id, { shareButtonBackgroundColor: e.target.value })}
                          className="mt-1 h-10"
                        />
                      </div>
                      
                      <div>
                        <Label>Cor do Texto</Label>
                        <Input
                          type="color"
                          value={selectedElementData.shareButtonTextColor || "#FFFFFF"}
                          onChange={(e) => updateElement(selectedElementData.id, { shareButtonTextColor: e.target.value })}
                          className="mt-1 h-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-sm mb-3">🔧 Opções</h5>
                    
                    <div className="flex items-center justify-between">
                      <Label>Mostrar Ícones</Label>
                      <input
                        type="checkbox"
                        checked={selectedElementData.shareShowIcons !== false}
                        onChange={(e) => updateElement(selectedElementData.id, { shareShowIcons: e.target.checked })}
                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                    </div>

                    {selectedElementData.shareShowIcons !== false && (
                      <div className="mt-3">
                        <Label>Tamanho dos Ícones</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.shareIconSize || "medium"}
                          onChange={(e) => updateElement(selectedElementData.id, { shareIconSize: e.target.value })}
                        >
                          <option value="small">Pequeno</option>
                          <option value="medium">Médio</option>
                          <option value="large">Grande</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedElementData.type === "testimonials" && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-purple-800 mb-2">💬 Depoimentos</h4>
                    <p className="text-xs text-purple-700">
                      Avaliações e comentários de clientes satisfeitos
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📝 Conteúdo</h5>
                    
                    <div>
                      <Label>Título</Label>
                      <Input
                        value={selectedElementData.testimonialsTitle || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { testimonialsTitle: e.target.value })}
                        placeholder="O que nossos clientes dizem"
                        className="mt-1"
                      />
                    </div>

                    <div className="mt-3">
                      <Label>Depoimentos</Label>
                      <div className="space-y-2 mt-2">
                        {(selectedElementData.testimonialsData || []).map((testimonial: any, index: number) => (
                          <div key={testimonial.id} className="border p-3 rounded-lg bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-medium text-gray-600">Depoimento {index + 1}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const newTestimonials = selectedElementData.testimonialsData.filter((t: any) => t.id !== testimonial.id);
                                  updateElement(selectedElementData.id, { testimonialsData: newTestimonials });
                                }}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <Input
                                placeholder="Nome do cliente"
                                value={testimonial.name}
                                onChange={(e) => {
                                  const newTestimonials = selectedElementData.testimonialsData.map((t: any) => 
                                    t.id === testimonial.id ? { ...t, name: e.target.value } : t
                                  );
                                  updateElement(selectedElementData.id, { testimonialsData: newTestimonials });
                                }}
                                className="text-xs"
                              />
                              <Input
                                placeholder="Depoimento"
                                value={testimonial.text}
                                onChange={(e) => {
                                  const newTestimonials = selectedElementData.testimonialsData.map((t: any) => 
                                    t.id === testimonial.id ? { ...t, text: e.target.value } : t
                                  );
                                  updateElement(selectedElementData.id, { testimonialsData: newTestimonials });
                                }}
                                className="text-xs"
                              />
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Cargo"
                                  value={testimonial.position || ""}
                                  onChange={(e) => {
                                    const newTestimonials = selectedElementData.testimonialsData.map((t: any) => 
                                      t.id === testimonial.id ? { ...t, position: e.target.value } : t
                                    );
                                    updateElement(selectedElementData.id, { testimonialsData: newTestimonials });
                                  }}
                                  className="text-xs flex-1"
                                />
                                <select
                                  className="text-xs px-2 py-1 border rounded"
                                  value={testimonial.rating || 5}
                                  onChange={(e) => {
                                    const newTestimonials = selectedElementData.testimonialsData.map((t: any) => 
                                      t.id === testimonial.id ? { ...t, rating: parseInt(e.target.value) } : t
                                    );
                                    updateElement(selectedElementData.id, { testimonialsData: newTestimonials });
                                  }}
                                >
                                  <option value={1}>⭐</option>
                                  <option value={2}>⭐⭐</option>
                                  <option value={3}>⭐⭐⭐</option>
                                  <option value={4}>⭐⭐⭐⭐</option>
                                  <option value={5}>⭐⭐⭐⭐⭐</option>
                                </select>
                              </div>
                              <div>
                                <Label className="text-xs">Foto do Cliente</Label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        const newTestimonials = selectedElementData.testimonialsData.map((t: any) => 
                                          t.id === testimonial.id ? { ...t, photo: event.target?.result as string } : t
                                        );
                                        updateElement(selectedElementData.id, { testimonialsData: newTestimonials });
                                      };
                                      reader.readAsDataURL(e.target.files[0]);
                                    }
                                  }}
                                  className="w-full text-xs mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button
                          onClick={() => {
                            const newTestimonial = {
                              id: Date.now().toString(),
                              name: "Cliente",
                              text: "Excelente produto! Recomendo.",
                              rating: 5,
                              position: "",
                              photo: ""
                            };
                            const currentTestimonials = selectedElementData.testimonialsData || [];
                            updateElement(selectedElementData.id, { testimonialsData: [...currentTestimonials, newTestimonial] });
                          }}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Depoimento
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-sm mb-3">🎨 Estilo</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Layout</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.testimonialsLayout || "grid"}
                          onChange={(e) => updateElement(selectedElementData.id, { testimonialsLayout: e.target.value })}
                        >
                          <option value="vertical">Vertical</option>
                          <option value="horizontal">Horizontal</option>
                          <option value="grid">Grid</option>
                        </select>
                      </div>
                      <div>
                        <Label>Estilo</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.testimonialsStyle || "card"}
                          onChange={(e) => updateElement(selectedElementData.id, { testimonialsStyle: e.target.value })}
                        >
                          <option value="card">Card</option>
                          <option value="quote">Quote</option>
                          <option value="minimal">Minimal</option>
                          <option value="modern">Modern</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="flex items-center justify-between">
                        <Label>Mostrar Fotos</Label>
                        <input
                          type="checkbox"
                          checked={selectedElementData.testimonialsShowPhotos !== false}
                          onChange={(e) => updateElement(selectedElementData.id, { testimonialsShowPhotos: e.target.checked })}
                          className="h-4 w-4"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Mostrar Estrelas</Label>
                        <input
                          type="checkbox"
                          checked={selectedElementData.testimonialsShowRatings !== false}
                          onChange={(e) => updateElement(selectedElementData.id, { testimonialsShowRatings: e.target.checked })}
                          className="h-4 w-4"
                        />
                      </div>
                    </div>

                    {/* NOVAS OPÇÕES AVANÇADAS */}
                    <div className="mt-4 space-y-4 border-t pt-4">
                      <h6 className="font-semibold text-sm text-purple-600">🎭 Opções Avançadas</h6>
                      
                      {/* Layout Avançado */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Colunas (Grid)</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.testimonialsColumns || 2}
                            onChange={(e) => updateElement(selectedElementData.id, { testimonialsColumns: parseInt(e.target.value) })}
                          >
                            <option value={1}>1 Coluna</option>
                            <option value={2}>2 Colunas</option>
                            <option value={3}>3 Colunas</option>
                            <option value={4}>4 Colunas</option>
                          </select>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Sombra do Card</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.testimonialsShadow || "medium"}
                            onChange={(e) => updateElement(selectedElementData.id, { testimonialsShadow: e.target.value })}
                          >
                            <option value="none">Sem Sombra</option>
                            <option value="small">Pequena</option>
                            <option value="medium">Média</option>
                            <option value="large">Grande</option>
                          </select>
                        </div>
                      </div>

                      {/* Cores Personalizadas */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Cor de Fundo</Label>
                          <input
                            type="color"
                            value={selectedElementData.testimonialsBackgroundColor || "#ffffff"}
                            onChange={(e) => updateElement(selectedElementData.id, { testimonialsBackgroundColor: e.target.value })}
                            className="w-full h-8 border rounded"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs">Cor do Texto</Label>
                          <input
                            type="color"
                            value={selectedElementData.testimonialsTextColor || "#374151"}
                            onChange={(e) => updateElement(selectedElementData.id, { testimonialsTextColor: e.target.value })}
                            className="w-full h-8 border rounded"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs">Cor de Destaque</Label>
                          <input
                            type="color"
                            value={selectedElementData.testimonialsAccentColor || "#10b981"}
                            onChange={(e) => updateElement(selectedElementData.id, { testimonialsAccentColor: e.target.value })}
                            className="w-full h-8 border rounded"
                          />
                        </div>
                      </div>

                      {/* Bordas e Espaçamento */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Raio da Borda</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.testimonialsBorderRadius || "md"}
                            onChange={(e) => updateElement(selectedElementData.id, { testimonialsBorderRadius: e.target.value })}
                          >
                            <option value="none">Sem Borda</option>
                            <option value="sm">Pequeno</option>
                            <option value="md">Médio</option>
                            <option value="lg">Grande</option>
                            <option value="xl">Extra Grande</option>
                            <option value="full">Circular</option>
                          </select>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Espaçamento</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.testimonialsPadding || "medium"}
                            onChange={(e) => updateElement(selectedElementData.id, { testimonialsPadding: e.target.value })}
                          >
                            <option value="small">Pequeno</option>
                            <option value="medium">Médio</option>
                            <option value="large">Grande</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* ANIMAÇÕES */}
                    <div className="mt-4 space-y-3 border-t pt-4">
                      <h6 className="font-semibold text-sm text-green-600">✨ Animações</h6>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Ativar Animações</Label>
                        <input
                          type="checkbox"
                          checked={selectedElementData.testimonialsAnimation || false}
                          onChange={(e) => updateElement(selectedElementData.id, { testimonialsAnimation: e.target.checked })}
                          className="h-4 w-4"
                        />
                      </div>

                      {selectedElementData.testimonialsAnimation && (
                        <div className="space-y-3 pl-4 border-l-2 border-green-200">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Tipo de Animação</Label>
                              <select 
                                className="w-full px-2 py-1 border rounded text-xs mt-1"
                                value={selectedElementData.testimonialsAnimationType || "fade"}
                                onChange={(e) => updateElement(selectedElementData.id, { testimonialsAnimationType: e.target.value })}
                              >
                                <option value="fade">Fade In</option>
                                <option value="slide">Slide Up</option>
                                <option value="zoom">Zoom In</option>
                                <option value="flip">Flip</option>
                              </select>
                            </div>
                            
                            <div>
                              <Label className="text-xs">Velocidade (ms)</Label>
                              <Input
                                type="number"
                                value={selectedElementData.testimonialsSpeed || 600}
                                onChange={(e) => updateElement(selectedElementData.id, { testimonialsSpeed: parseInt(e.target.value) })}
                                min="100"
                                max="3000"
                                className="text-xs"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Auto-play (Carrossel)</Label>
                            <input
                              type="checkbox"
                              checked={selectedElementData.testimonialsAutoplay || false}
                              onChange={(e) => updateElement(selectedElementData.id, { testimonialsAutoplay: e.target.checked })}
                              className="h-4 w-4"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* TIPOGRAFIA AVANÇADA */}
                    <div className="mt-4 space-y-3 border-t pt-4">
                      <h6 className="font-semibold text-sm text-blue-600">📝 Tipografia</h6>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Cor do Nome</Label>
                          <input
                            type="color"
                            value={selectedElementData.testimonialsNameColor || "#1f2937"}
                            onChange={(e) => updateElement(selectedElementData.id, { testimonialsNameColor: e.target.value })}
                            className="w-full h-8 border rounded"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs">Cor do Cargo</Label>
                          <input
                            type="color"
                            value={selectedElementData.testimonialsRoleColor || "#6b7280"}
                            onChange={(e) => updateElement(selectedElementData.id, { testimonialsRoleColor: e.target.value })}
                            className="w-full h-8 border rounded"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Cor da Empresa</Label>
                          <input
                            type="color"
                            value={selectedElementData.testimonialsCompanyColor || "#9ca3af"}
                            onChange={(e) => updateElement(selectedElementData.id, { testimonialsCompanyColor: e.target.value })}
                            className="w-full h-8 border rounded"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs">Cor das Aspas</Label>
                          <input
                            type="color"
                            value={selectedElementData.testimonialsQuoteColor || "#d1d5db"}
                            onChange={(e) => updateElement(selectedElementData.id, { testimonialsQuoteColor: e.target.value })}
                            className="w-full h-8 border rounded"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Mostrar Ícone de Aspas</Label>
                        <input
                          type="checkbox"
                          checked={selectedElementData.testimonialsQuoteIcon !== false}
                          onChange={(e) => updateElement(selectedElementData.id, { testimonialsQuoteIcon: e.target.checked })}
                          className="h-4 w-4"
                        />
                      </div>
                    </div>

                    {/* FUNCIONALIDADES EXTRAS */}
                    <div className="mt-4 space-y-3 border-t pt-4">
                      <h6 className="font-semibold text-sm text-orange-600">🚀 Extras</h6>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Mostrar Data</Label>
                          <input
                            type="checkbox"
                            checked={selectedElementData.testimonialsShowDate || false}
                            onChange={(e) => updateElement(selectedElementData.id, { testimonialsShowDate: e.target.checked })}
                            className="h-4 w-4"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Selo Verificado</Label>
                          <input
                            type="checkbox"
                            checked={selectedElementData.testimonialsShowVerified || false}
                            onChange={(e) => updateElement(selectedElementData.id, { testimonialsShowVerified: e.target.checked })}
                            className="h-4 w-4"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Título da Seção</Label>
                        <Input
                          value={selectedElementData.testimonialsTitle || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { testimonialsTitle: e.target.value })}
                          placeholder="Ex: O que nossos clientes dizem"
                          className="text-xs mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedElementData.type === "guarantee" && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">🛡️ Garantia</h4>
                    <p className="text-xs text-blue-700">
                      Selo de garantia para transmitir confiança
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📝 Configurações</h5>
                    
                    <div>
                      <Label>Tipo de Garantia</Label>
                      <select 
                        className="w-full px-2 py-1 border rounded text-xs mt-1"
                        value={selectedElementData.guaranteeType || "days"}
                        onChange={(e) => updateElement(selectedElementData.id, { guaranteeType: e.target.value })}
                      >
                        <option value="days">Dias</option>
                        <option value="money_back">Dinheiro de Volta</option>
                        <option value="satisfaction">Satisfação</option>
                        <option value="lifetime">Vitalícia</option>
                        <option value="custom">Personalizada</option>
                      </select>
                    </div>

                    {selectedElementData.guaranteeType === "days" && (
                      <div className="mt-3">
                        <Label>Número de Dias</Label>
                        <Input
                          type="number"
                          value={selectedElementData.guaranteeDays || 30}
                          onChange={(e) => updateElement(selectedElementData.id, { guaranteeDays: parseInt(e.target.value) })}
                          className="mt-1"
                          min="1"
                        />
                      </div>
                    )}

                    <div className="mt-3">
                      <Label>Título</Label>
                      <Input
                        value={selectedElementData.guaranteeTitle || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { guaranteeTitle: e.target.value })}
                        placeholder="Garantia de Satisfação"
                        className="mt-1"
                      />
                    </div>

                    <div className="mt-3">
                      <Label>Descrição</Label>
                      <Input
                        value={selectedElementData.guaranteeDescription || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { guaranteeDescription: e.target.value })}
                        placeholder="100% seguro e confiável"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-sm mb-3">🎨 Estilo</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Estilo</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.guaranteeStyle || "badge"}
                          onChange={(e) => updateElement(selectedElementData.id, { guaranteeStyle: e.target.value })}
                        >
                          <option value="badge">Badge</option>
                          <option value="card">Card</option>
                          <option value="banner">Banner</option>
                          <option value="seal">Selo</option>
                          <option value="modern">Moderno</option>
                          <option value="minimal">Minimalista</option>
                        </select>
                      </div>
                      <div>
                        <Label>Tamanho</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.guaranteeSize || "medium"}
                          onChange={(e) => updateElement(selectedElementData.id, { guaranteeSize: e.target.value })}
                        >
                          <option value="small">Pequeno</option>
                          <option value="medium">Médio</option>
                          <option value="large">Grande</option>
                        </select>
                      </div>
                    </div>

                    {/* CORES PERSONALIZADAS */}
                    <div className="mt-4 space-y-3 border-t pt-4">
                      <h6 className="font-semibold text-sm text-blue-600">🎨 Cores</h6>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Cor Principal</Label>
                          <input
                            type="color"
                            value={selectedElementData.guaranteeColor || "#3b82f6"}
                            onChange={(e) => updateElement(selectedElementData.id, { guaranteeColor: e.target.value })}
                            className="w-full h-8 border rounded"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs">Cor do Texto</Label>
                          <input
                            type="color"
                            value={selectedElementData.guaranteeTextColor || "#ffffff"}
                            onChange={(e) => updateElement(selectedElementData.id, { guaranteeTextColor: e.target.value })}
                            className="w-full h-8 border rounded"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Cor de Fundo</Label>
                          <input
                            type="color"
                            value={selectedElementData.guaranteeBackgroundColor || "#f3f4f6"}
                            onChange={(e) => updateElement(selectedElementData.id, { guaranteeBackgroundColor: e.target.value })}
                            className="w-full h-8 border rounded"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs">Cor da Borda</Label>
                          <input
                            type="color"
                            value={selectedElementData.guaranteeBorderColor || "#d1d5db"}
                            onChange={(e) => updateElement(selectedElementData.id, { guaranteeBorderColor: e.target.value })}
                            className="w-full h-8 border rounded"
                          />
                        </div>
                      </div>
                    </div>

                    {/* LAYOUT E POSICIONAMENTO */}
                    <div className="mt-4 space-y-3 border-t pt-4">
                      <h6 className="font-semibold text-sm text-green-600">📐 Layout</h6>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Alinhamento</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.guaranteeAlignment || "center"}
                            onChange={(e) => updateElement(selectedElementData.id, { guaranteeAlignment: e.target.value })}
                          >
                            <option value="left">Esquerda</option>
                            <option value="center">Centro</option>
                            <option value="right">Direita</option>
                          </select>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Posição do Ícone</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.guaranteeIconPosition || "left"}
                            onChange={(e) => updateElement(selectedElementData.id, { guaranteeIconPosition: e.target.value })}
                          >
                            <option value="left">Esquerda</option>
                            <option value="top">Topo</option>
                            <option value="right">Direita</option>
                            <option value="none">Sem Ícone</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Espaçamento</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.guaranteePadding || "medium"}
                            onChange={(e) => updateElement(selectedElementData.id, { guaranteePadding: e.target.value })}
                          >
                            <option value="small">Pequeno</option>
                            <option value="medium">Médio</option>
                            <option value="large">Grande</option>
                          </select>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Raio da Borda</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.guaranteeBorderRadius || "md"}
                            onChange={(e) => updateElement(selectedElementData.id, { guaranteeBorderRadius: e.target.value })}
                          >
                            <option value="none">Sem Borda</option>
                            <option value="sm">Pequeno</option>
                            <option value="md">Médio</option>
                            <option value="lg">Grande</option>
                            <option value="xl">Extra Grande</option>
                            <option value="full">Circular</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* EFEITOS VISUAIS */}
                    <div className="mt-4 space-y-3 border-t pt-4">
                      <h6 className="font-semibold text-sm text-purple-600">✨ Efeitos</h6>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Sombra</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.guaranteeShadow || "medium"}
                            onChange={(e) => updateElement(selectedElementData.id, { guaranteeShadow: e.target.value })}
                          >
                            <option value="none">Sem Sombra</option>
                            <option value="small">Pequena</option>
                            <option value="medium">Média</option>
                            <option value="large">Grande</option>
                            <option value="xl">Extra Grande</option>
                          </select>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Animação</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.guaranteeAnimation || "none"}
                            onChange={(e) => updateElement(selectedElementData.id, { guaranteeAnimation: e.target.value })}
                          >
                            <option value="none">Sem Animação</option>
                            <option value="pulse">Pulsante</option>
                            <option value="bounce">Saltitante</option>
                            <option value="glow">Brilhante</option>
                            <option value="shake">Tremulante</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Efeito Hover</Label>
                        <input
                          type="checkbox"
                          checked={selectedElementData.guaranteeHoverEffect !== false}
                          onChange={(e) => updateElement(selectedElementData.id, { guaranteeHoverEffect: e.target.checked })}
                          className="h-4 w-4"
                        />
                      </div>
                    </div>

                    {/* CONTEÚDO ADICIONAL */}
                    <div className="mt-4 space-y-3 border-t pt-4">
                      <h6 className="font-semibold text-sm text-orange-600">📝 Conteúdo</h6>
                      
                      <div>
                        <Label className="text-xs">Texto do Botão (Opcional)</Label>
                        <Input
                          value={selectedElementData.guaranteeButtonText || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { guaranteeButtonText: e.target.value })}
                          placeholder="Ex: Saiba Mais"
                          className="text-xs mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Link do Botão (Opcional)</Label>
                        <Input
                          value={selectedElementData.guaranteeButtonLink || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { guaranteeButtonLink: e.target.value })}
                          placeholder="Ex: https://exemplo.com/garantia"
                          className="text-xs mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Texto Adicional</Label>
                        <Input
                          value={selectedElementData.guaranteeSubtitle || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { guaranteeSubtitle: e.target.value })}
                          placeholder="Ex: Sem riscos, total tranquilidade"
                          className="text-xs mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedElementData.type === "pix_payment" && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-green-800 mb-2">💳 PIX Direto</h4>
                    <p className="text-xs text-green-700">
                      Botão que gera QR Code PIX para pagamento instantâneo
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">💰 Configurações PIX</h5>
                    
                    <div className="space-y-3">
                      <div>
                        <Label>Chave PIX</Label>
                        <Input
                          value={selectedElementData.pixKey || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { pixKey: e.target.value })}
                          placeholder="Ex: contato@empresa.com ou CPF/CNPJ"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Valor (R$)</Label>
                        <Input
                          type="number"
                          value={selectedElementData.pixAmount || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { pixAmount: parseFloat(e.target.value) || 0 })}
                          placeholder="Ex: 29.90"
                          className="mt-1"
                          step="0.01"
                          min="0"
                        />
                      </div>

                      <div>
                        <Label>Descrição do Pagamento</Label>
                        <Input
                          value={selectedElementData.pixDescription || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { pixDescription: e.target.value })}
                          placeholder="Ex: Compra do produto X"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Nome do Beneficiário</Label>
                        <Input
                          value={selectedElementData.pixRecipientName || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { pixRecipientName: e.target.value })}
                          placeholder="Ex: João Silva"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Cidade</Label>
                        <Input
                          value={selectedElementData.pixCity || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { pixCity: e.target.value })}
                          placeholder="Ex: São Paulo"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">🎨 Aparência</h5>
                    
                    <div className="space-y-3">
                      <div>
                        <Label>Texto do Botão</Label>
                        <Input
                          value={selectedElementData.pixButtonText || "PAGAR NO PIX"}
                          onChange={(e) => updateElement(selectedElementData.id, { pixButtonText: e.target.value })}
                          placeholder="Ex: PAGAR NO PIX"
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Estilo do Botão</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.pixButtonStyle || "default"}
                            onChange={(e) => updateElement(selectedElementData.id, { pixButtonStyle: e.target.value })}
                          >
                            <option value="default">Padrão</option>
                            <option value="gradient">Gradiente</option>
                            <option value="outline">Contorno</option>
                            <option value="minimal">Minimalista</option>
                          </select>
                        </div>

                        <div>
                          <Label>Tamanho</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.pixButtonSize || "medium"}
                            onChange={(e) => updateElement(selectedElementData.id, { pixButtonSize: e.target.value })}
                          >
                            <option value="small">Pequeno</option>
                            <option value="medium">Médio</option>
                            <option value="large">Grande</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Cor do Botão</Label>
                          <input
                            type="color"
                            value={selectedElementData.pixButtonColor || "#00d4aa"}
                            onChange={(e) => updateElement(selectedElementData.id, { pixButtonColor: e.target.value })}
                            className="w-full h-8 border rounded"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs">Cor do Texto</Label>
                          <input
                            type="color"
                            value={selectedElementData.pixTextColor || "#ffffff"}
                            onChange={(e) => updateElement(selectedElementData.id, { pixTextColor: e.target.value })}
                            className="w-full h-8 border rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📱 QR Code</h5>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Tamanho do QR</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.pixQrSize || "medium"}
                            onChange={(e) => updateElement(selectedElementData.id, { pixQrSize: e.target.value })}
                          >
                            <option value="small">Pequeno (150px)</option>
                            <option value="medium">Médio (200px)</option>
                            <option value="large">Grande (250px)</option>
                          </select>
                        </div>

                        <div>
                          <Label>Posição do QR</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.pixQrPosition || "center"}
                            onChange={(e) => updateElement(selectedElementData.id, { pixQrPosition: e.target.value })}
                          >
                            <option value="center">Centro</option>
                            <option value="left">Esquerda</option>
                            <option value="right">Direita</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Mostrar Chave PIX</Label>
                        <input
                          type="checkbox"
                          checked={selectedElementData.pixShowKey !== false}
                          onChange={(e) => updateElement(selectedElementData.id, { pixShowKey: e.target.checked })}
                          className="h-4 w-4"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Botão Copiar Chave</Label>
                        <input
                          type="checkbox"
                          checked={selectedElementData.pixShowCopy !== false}
                          onChange={(e) => updateElement(selectedElementData.id, { pixShowCopy: e.target.checked })}
                          className="h-4 w-4"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Instruções de Pagamento</Label>
                        <input
                          type="checkbox"
                          checked={selectedElementData.pixShowInstructions !== false}
                          onChange={(e) => updateElement(selectedElementData.id, { pixShowInstructions: e.target.checked })}
                          className="h-4 w-4"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-sm mb-3">⚙️ Configurações Avançadas</h5>
                    
                    <div className="space-y-3">
                      <div>
                        <Label>Tempo de Expiração (minutos)</Label>
                        <Input
                          type="number"
                          value={selectedElementData.pixExpiration || 30}
                          onChange={(e) => updateElement(selectedElementData.id, { pixExpiration: parseInt(e.target.value) || 30 })}
                          placeholder="30"
                          className="mt-1"
                          min="1"
                          max="1440"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Fechar Modal Automaticamente</Label>
                        <input
                          type="checkbox"
                          checked={selectedElementData.pixAutoClose !== false}
                          onChange={(e) => updateElement(selectedElementData.id, { pixAutoClose: e.target.checked })}
                          className="h-4 w-4"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Som de Confirmação</Label>
                        <input
                          type="checkbox"
                          checked={selectedElementData.pixPlaySound !== false}
                          onChange={(e) => updateElement(selectedElementData.id, { pixPlaySound: e.target.checked })}
                          className="h-4 w-4"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Facial Reading Properties */}
              {selectedElementData.type === "facial_reading" && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">👁️ Leitura Facial</h4>
                    <p className="text-xs text-blue-700">
                      Captura foto da face do usuário para análise personalizada
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📝 Conteúdo</h5>
                    
                    <div className="space-y-3">
                      <div>
                        <Label>Título</Label>
                        <Input
                          value={selectedElementData.facialTitle || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { facialTitle: e.target.value })}
                          placeholder="Leitura Facial"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Descrição</Label>
                        <Input
                          value={selectedElementData.facialDescription || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { facialDescription: e.target.value })}
                          placeholder="Vamos analisar suas características faciais..."
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Mensagem do Resultado</Label>
                        <Input
                          value={selectedElementData.facialMessage || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { facialMessage: e.target.value })}
                          placeholder="Sua análise facial revelou..."
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Texto do Botão</Label>
                        <Input
                          value={selectedElementData.facialButtonText || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { facialButtonText: e.target.value })}
                          placeholder="Iniciar Leitura Facial"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Cor do Botão</Label>
                        <Input
                          type="color"
                          value={selectedElementData.facialButtonColor || "#3B82F6"}
                          onChange={(e) => updateElement(selectedElementData.id, { facialButtonColor: e.target.value })}
                          className="mt-1 h-10 w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Palm Reading Properties */}
              {selectedElementData.type === "palm_reading" && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-purple-800 mb-2">🤚 Leitura de Mãos</h4>
                    <p className="text-xs text-purple-700">
                      Captura foto das mãos do usuário para análise de linhas
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📝 Conteúdo</h5>
                    
                    <div className="space-y-3">
                      <div>
                        <Label>Título</Label>
                        <Input
                          value={selectedElementData.palmTitle || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { palmTitle: e.target.value })}
                          placeholder="Leitura de Mãos"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Descrição</Label>
                        <Input
                          value={selectedElementData.palmDescription || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { palmDescription: e.target.value })}
                          placeholder="Vamos analisar as linhas da sua mão..."
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Mensagem do Resultado</Label>
                        <Input
                          value={selectedElementData.palmMessage || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { palmMessage: e.target.value })}
                          placeholder="As linhas da sua mão revelam..."
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Texto do Botão</Label>
                        <Input
                          value={selectedElementData.palmButtonText || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { palmButtonText: e.target.value })}
                          placeholder="Iniciar Leitura de Mãos"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Cor do Botão</Label>
                        <Input
                          type="color"
                          value={selectedElementData.palmButtonColor || "#A855F7"}
                          onChange={(e) => updateElement(selectedElementData.id, { palmButtonColor: e.target.value })}
                          className="mt-1 h-10 w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Selecione um elemento</h3>
                <p className="text-sm">Clique em um elemento no preview para editar suas propriedades.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}