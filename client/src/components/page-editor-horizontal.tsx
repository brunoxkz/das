import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Brain,
  Copy,
  Timer,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Settings2,
  Move3D
} from "lucide-react";

// Função utilitária para gerar IDs de remarketing estruturados
function generateRemarketingId(pageIndex: number, quizName: string, fieldId?: string): string {
  // Limpa o nome do quiz removendo caracteres especiais e espaços
  const cleanQuizName = quizName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  // Se tem fieldId customizado, usa ele, senão usa padrão baseado na página
  if (fieldId && fieldId !== '') {
    return fieldId;
  }
  
  // Formato padrão: p{pageNumber}_{quizName}
  return `p${pageIndex}_${cleanQuizName}`;
}

interface Element {
  id: number;
  type: "multiple_choice" | "text" | "rating" | "email" | "checkbox" | "date" | "phone" | "number" | "textarea" | "image_upload" | "animated_transition" | "heading" | "paragraph" | "image" | "divider" | "video" | "audio" | "birth_date" | "height" | "current_weight" | "target_weight" | "transition_background" | "transition_text" | "transition_counter" | "transition_loader" | "transition_redirect" | "transition_button" | "spacer" | "game_wheel" | "game_scratch" | "game_color_pick" | "game_brick_break" | "game_memory_cards" | "game_slot_machine" | "continue_button" | "loading_question" | "share_quiz" | "price" | "icon_list" | "testimonials" | "guarantee" | "paypal" | "image_with_text" | "chart" | "metrics" | "before_after" | "pricing_plans" | "stripe_embed" | "hotmart_upsell" | "faq" | "image_carousel" | "body_type_classifier" | "age_classifier" | "fitness_goal_classifier" | "experience_classifier" | "progress_bar" | "loading_with_question";
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
  optionFontSize?: string;
  optionFontWeight?: string;
  optionTextColor?: string;
  checkboxColor?: string;
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
  
  // Configurações específicas para progress_bar
  progressDuration?: number; // Duração em segundos
  progressColor?: string; // Cor da barra de progresso
  progressBackgroundColor?: string; // Cor do fundo da barra
  progressStyle?: "rounded" | "squared" | "pill"; // Estilo da barra
  progressHeight?: number; // Altura da barra em pixels
  progressAnimation?: "smooth" | "stepped" | "pulse"; // Tipo de animação
  progressShowPercentage?: boolean; // Mostrar porcentagem
  progressShowText?: boolean; // Mostrar texto customizado
  progressText?: string; // Texto personalizado durante carregamento
  progressAutoStart?: boolean; // Iniciar automaticamente
  
  // Configurações específicas para loading_with_question
  loadingDuration?: number; // Duração do carregamento em segundos
  loadingColor?: string; // Cor da barra de carregamento
  loadingBackgroundColor?: string; // Cor do fundo
  loadingStyle?: "rounded" | "squared" | "pill"; // Estilo da barra
  loadingHeight?: number; // Altura da barra
  loadingAnimation?: "smooth" | "stepped" | "pulse"; // Animação
  loadingShowPercentage?: boolean; // Mostrar porcentagem
  loadingText?: string; // Texto durante carregamento
  questionTitle?: string; // Título da pergunta após carregamento
  questionDescription?: string; // Descrição da pergunta
  yesButtonText?: string; // Texto do botão "Sim"
  noButtonText?: string; // Texto do botão "Não"
  questionAutoShow?: boolean; // Mostrar pergunta automaticamente
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
  customSpacerSize?: string;
  dividerThickness?: "thin" | "medium" | "thick";
  dividerColor?: string;
  
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
  
  // Propriedades específicas para elemento rating
  starCount?: number; // Quantidade de estrelas (1-10)
  starColor?: string; // Cor das estrelas
  starFilled?: boolean; // Se as estrelas devem estar preenchidas ou apenas contorno
  starSize?: "small" | "medium" | "large"; // Tamanho das estrelas
  ratingRequired?: boolean; // Se a avaliação é obrigatória
  
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
  
  // 🔥 NOVA FUNCIONALIDADE: Propriedades para classificadores ultra personalizados
  classifierType?: "body_type" | "age_group" | "fitness_goal" | "experience_level";
  classifierTitle?: string;
  classifierDescription?: string;
  classifierOptions?: {
    id: string;
    label: string;
    description: string;
    icon?: string;
    color?: string;
    campaignTrigger?: {
      sms?: string;
      email?: string;
      whatsapp?: string;
    };
  }[];
  classifierRequired?: boolean;
  classifierMultipleSelect?: boolean;
  
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
  carouselImages?: { id: string; url: string; alt: string; caption?: string; title?: string }[];
  carouselAutoplay?: boolean;
  carouselSpeed?: string;
  carouselShowDots?: boolean;
  carouselShowArrows?: boolean;
  carouselInfinite?: boolean;
  carouselSlidesToShow?: number;
  carouselSlidesToScroll?: number;
  carouselTransition?: "slide" | "fade" | "zoom" | "flip";
  carouselArrowStyle?: "simple" | "rounded" | "square";
  carouselDotStyle?: "dots" | "lines" | "squares";
  carouselBorderRadius?: string;
  carouselImageFit?: "cover" | "contain" | "fill";
  carouselTitle?: string;
  carouselHeight?: string;
  carouselWidth?: number;
  carouselShowThumbnails?: boolean;
  carouselShowProgress?: boolean;
  carouselAutoplayInterval?: number;
  carouselTheme?: string;
  carouselPauseOnHover?: boolean;
  carouselSwipeEnabled?: boolean;
  carouselKeyboardNav?: boolean;
  
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
  activePageIndex?: number;
  defaultButtonColor?: string;
  defaultButtonTextColor?: string;
  onDefaultButtonColorChange?: (color: string) => void;
  onDefaultButtonTextColorChange?: (color: string) => void;
}

export function PageEditorHorizontal({ 
  pages, 
  onPagesChange, 
  globalTheme: initialGlobalTheme = "light",
  customBackgroundColor: initialCustomBackgroundColor = "#ffffff",
  onThemeChange,
  onActivePageChange,
  activePageIndex = 0,
  defaultButtonColor = "#10b981",
  defaultButtonTextColor = "#ffffff",
  onDefaultButtonColorChange,
  onDefaultButtonTextColorChange
}: PageEditorProps) {

  const [activePage, setActivePage] = useState(activePageIndex);

  // Sincronizar estado interno com prop externa
  useEffect(() => {
    setActivePage(activePageIndex);
  }, [activePageIndex]);

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
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    globalBackground: false,
    buttonColors: false
  });
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile'); // Mobile-first como solicitado

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


  // Função para traduzir os tipos de elementos - texto português direto
  const getElementTypeName = (type: string) => {
    // Mapear tipos para texto em português diretamente
    const typeNameMap: Record<string, string> = {
      heading: "Título",
      paragraph: "Parágrafo",
      image: "Imagem",
      video: "Vídeo",
      divider: "Divisor",
      multiple_choice: "Perguntas",
      text: "Texto",
      email: "E-mail",
      phone: "Telefone/Whats",
      number: "Número",
      rating: "Avaliação",
      animated_transition: "Transição Animada",
      checkbox: "Checkbox",
      date: "Data",
      birth_date: "Data de Nascimento",
      height: "Altura",
      current_weight: "Peso Atual",
      target_weight: "Peso Meta",
      textarea: "Área de Texto",
      image_upload: "Upload de Imagem",
      spacer: "Espaçador",
      game_wheel: "Roleta",
      game_scratch: "Raspadinha",
      game_color_pick: "Escolha de Cor",
      game_brick_break: "Quebra Tijolos",
      game_memory_cards: "Jogo da Memória",
      game_slot_machine: "Caça-níquel",
      continue_button: "Botão Continuar",
      loading_question: "Pergunta Carregando",
      body_type_classifier: "Classificador de Tipo Corporal",
      age_classifier: "Classificador de Idade",
      fitness_goal_classifier: "Classificador de Meta Fitness",
      experience_classifier: "Classificador de Experiência",
      share_quiz: "Compartilhar Quiz",
      social_proof: "Prova Social",
      urgency_timer: "Timer de Urgência",
      testimonials: "Depoimentos",
      guarantee: "Garantia",
      icon_list: "Lista com Ícones",
      faq: "FAQ",
      image_with_text: "Imagem com Texto",
      image_carousel: "Carrossel de Imagens",
      cta_button: "Botão CTA",
      price_comparison: "Comparação de Preços",
      metrics: "Métricas",
      plans: "Planos",
      before_after: "Antes e Depois",
      stripe_embed: "Stripe Embed",
      calculator: "Calculadora",
      countdown: "Contador Regressivo",
      audio: "Áudio",
      progress_bar: "Barra de Progresso",
      chart: "Gráfico",
      pricing_plans: "Planos de Preços",
      paypal: "PayPal",
      hotmart_upsell: "Hotmart Upsell",
      transition_background: "Fundo de Transição",
      transition_text: "Texto de Transição",
      transition_counter: "Contador de Transição",
      transition_loader: "Carregador de Transição",
      transition_button: "Botão de Transição",
      transition_redirect: "Redirecionamento de Transição",
      netflix_intro: "Intro Netflix"
    };
    
    return typeNameMap[type] || type;
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

  // Função avançada para detectar e gerar embed de múltiplas plataformas de vídeo
  const getVideoEmbed = (url: string) => {
    if (!url) return null;
    
    // YouTube (youtube.com, youtu.be)
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&controls=1`;
    }
    
    // Vimeo (vimeo.com)
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      return `https://player.vimeo.com/video/${videoId}?color=ffffff&title=0&byline=0&portrait=0`;
    }
    
    // TikTok (tiktok.com)
    const tiktokMatch = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)|tiktok\.com\/t\/([A-Za-z0-9]+)/);
    if (tiktokMatch) {
      const videoId = tiktokMatch[1] || tiktokMatch[2];
      return `https://www.tiktok.com/embed/v2/${videoId}`;
    }
    
    // Instagram (instagram.com/p/ ou instagram.com/reel/)
    const instagramMatch = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
    if (instagramMatch) {
      const postId = instagramMatch[1];
      return `https://www.instagram.com/p/${postId}/embed`;
    }
    
    // VTURB (vturb.com.br)
    const vturbMatch = url.match(/vturb\.com\.br\/v\/([A-Za-z0-9_-]+)|vturb\.com\.br\/watch\?v=([A-Za-z0-9_-]+)/);
    if (vturbMatch) {
      const videoId = vturbMatch[1] || vturbMatch[2];
      return `https://vturb.com.br/embed/${videoId}`;
    }
    
    // VSLPlayer (player.vslplayer.com ou vslplayer.com)
    const vslMatch = url.match(/(?:player\.)?vslplayer\.com\/v\/([A-Za-z0-9_-]+)|vslplayer\.com\/watch\?v=([A-Za-z0-9_-]+)/);
    if (vslMatch) {
      const videoId = vslMatch[1] || vslMatch[2];
      return `https://player.vslplayer.com/embed/${videoId}`;
    }
    
    // PandaVideo (player.pandavideo.com)
    const pandaMatch = url.match(/player\.pandavideo\.com\/embed\/([A-Za-z0-9_-]+)|pandavideo\.com\/v\/([A-Za-z0-9_-]+)/);
    if (pandaMatch) {
      const videoId = pandaMatch[1] || pandaMatch[2];
      return `https://player.pandavideo.com/embed/${videoId}`;
    }
    
    // Wistia (wistia.com)
    const wistiaMatch = url.match(/wistia\.com\/medias\/([A-Za-z0-9_-]+)|wi\.st\/([A-Za-z0-9_-]+)/);
    if (wistiaMatch) {
      const videoId = wistiaMatch[1] || wistiaMatch[2];
      return `https://fast.wistia.net/embed/iframe/${videoId}`;
    }
    
    // JWPlayer (jwplayer.com)
    const jwMatch = url.match(/jwplayer\.com\/players\/([A-Za-z0-9_-]+)/);
    if (jwMatch) {
      const playerId = jwMatch[1];
      return `https://content.jwplatform.com/players/${playerId}.html`;
    }
    
    // Brightcove (players.brightcove.net)
    const brightcoveMatch = url.match(/players\.brightcove\.net\/(\d+)\/([A-Za-z0-9_-]+)_default\/index\.html\?videoId=(\d+)/);
    if (brightcoveMatch) {
      const [, accountId, playerId, videoId] = brightcoveMatch;
      return `https://players.brightcove.net/${accountId}/${playerId}_default/index.html?videoId=${videoId}`;
    }
    
    // Fallback: Se contém "embed" na URL, usar diretamente
    if (url.includes('/embed/') || url.includes('embed.')) {
      return url;
    }
    
    return null;
  };

  // Função para detectar plataforma do vídeo
  const getVideoPlatform = (url: string) => {
    if (!url) return 'unknown';
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('vturb.com')) return 'vturb';
    if (url.includes('vslplayer.com')) return 'vslplayer';
    if (url.includes('pandavideo.com')) return 'pandavideo';
    if (url.includes('wistia.com')) return 'wistia';
    if (url.includes('jwplayer.com')) return 'jwplayer';
    if (url.includes('brightcove.net')) return 'brightcove';
    
    return 'custom';
  };

  const elementCategories = [
    {
      name: 'Conteúdo',
      elements: [
        { type: "heading", label: getElementTypeName("heading"), icon: <Type className="w-4 h-4" /> },
        { type: "paragraph", label: getElementTypeName("paragraph"), icon: <AlignLeft className="w-4 h-4" /> },
        { type: "divider", label: getElementTypeName("divider"), icon: <Minus className="w-4 h-4" /> },
        { type: "spacer", label: getElementTypeName("spacer"), icon: <ArrowUpDown className="w-4 h-4" /> },
      ]
    },
    {
      name: 'Perguntas',
      elements: [
        { type: "multiple_choice", label: getElementTypeName("multiple_choice"), icon: <CheckSquare className="w-4 h-4" /> },
        { type: "text", label: getElementTypeName("text"), icon: <FileText className="w-4 h-4" /> },
        { type: "email", label: getElementTypeName("email"), icon: <Mail className="w-4 h-4" /> },
        { type: "phone", label: getElementTypeName("phone"), icon: <Phone className="w-4 h-4" /> },
        { type: "number", label: getElementTypeName("number"), icon: <Hash className="w-4 h-4" /> },
        { type: "rating", label: getElementTypeName("rating"), icon: <Star className="w-4 h-4" /> },
        { type: "date", label: getElementTypeName("date"), icon: <Calendar className="w-4 h-4" /> },
        { type: "textarea", label: getElementTypeName("textarea"), icon: <TextArea className="w-4 h-4" /> },

        { type: "loading_question", label: getElementTypeName("loading_question"), icon: <Loader className="w-4 h-4" /> },
      ]
    },
    {
      name: 'Formulário',
      elements: [
        { type: "birth_date", label: getElementTypeName("birth_date"), icon: <Calendar className="w-4 h-4" /> },
        { type: "height", label: getElementTypeName("height"), icon: <ArrowUpDown className="w-4 h-4" /> },
        { type: "current_weight", label: getElementTypeName("current_weight"), icon: <Scale className="w-4 h-4" /> },
        { type: "target_weight", label: getElementTypeName("target_weight"), icon: <Target className="w-4 h-4" /> },
      ]
    },
    {
      name: 'Mídia',
      elements: [
        { type: "image", label: getElementTypeName("image"), icon: <ImageIcon className="w-4 h-4" /> },
        { type: "image_upload", label: getElementTypeName("image_upload"), icon: <Upload className="w-4 h-4" /> },
        { type: "video", label: getElementTypeName("video"), icon: <Video className="w-4 h-4" /> },
        { type: "audio", label: getElementTypeName("audio"), icon: <Volume2 className="w-4 h-4" /> },
      ]
    },
    {
      name: 'Conteúdo Avançado',
      elements: [
        { type: "testimonials", label: getElementTypeName("testimonials"), icon: <MessageSquare className="w-4 h-4" /> },
        { type: "guarantee", label: getElementTypeName("guarantee"), icon: <Shield className="w-4 h-4" /> },
        { type: "icon_list", label: getElementTypeName("icon_list"), icon: <Star className="w-4 h-4" /> },
        { type: "faq", label: getElementTypeName("faq"), icon: <HelpCircle className="w-4 h-4" /> },
        { type: "image_with_text", label: getElementTypeName("image_with_text"), icon: <ImageIcon className="w-4 h-4" /> },
        { type: "image_carousel", label: getElementTypeName("image_carousel"), icon: <ImageIcon className="w-4 h-4" /> },
      ]
    },
    {
      name: 'Navegação',
      elements: [
        { type: "continue_button", label: getElementTypeName("continue_button"), icon: <ArrowRight className="w-4 h-4" /> },
        { type: "share_quiz", label: getElementTypeName("share_quiz"), icon: <Share2 className="w-4 h-4" /> },
        { type: "animated_transition", label: getElementTypeName("animated_transition"), icon: <Sparkles className="w-4 h-4" /> },
        { type: "progress_bar", label: getElementTypeName("progress_bar"), icon: <BarChart3 className="w-4 h-4" /> },
      ]
    },
    {
      name: 'Visualizações',
      elements: [
        { type: "chart", label: getElementTypeName("chart"), icon: <BarChart3 className="w-4 h-4" /> },
        { type: "metrics", label: getElementTypeName("metrics"), icon: <TrendingUp className="w-4 h-4" /> },
        { type: "before_after", label: getElementTypeName("before_after"), icon: <ArrowLeftRight className="w-4 h-4" /> },
      ]
    },
    {
      name: 'Vendas',
      elements: [
        { type: "pricing_plans", label: getElementTypeName("pricing_plans"), icon: <CreditCard className="w-4 h-4" /> },
        { type: "stripe_embed", label: getElementTypeName("stripe_embed"), icon: <Shield className="w-4 h-4" /> },
        { type: "paypal", label: getElementTypeName("paypal"), icon: <CreditCard className="w-4 h-4" /> },
        { type: "hotmart_upsell", label: getElementTypeName("hotmart_upsell"), icon: <Target className="w-4 h-4" /> },
      ]
    },
    {
      name: 'Ultra Personalização',
      elements: [
        { type: "body_type_classifier", label: getElementTypeName("body_type_classifier"), icon: <Users className="w-4 h-4" /> },
        { type: "age_classifier", label: getElementTypeName("age_classifier"), icon: <Calendar className="w-4 h-4" /> },
        { type: "fitness_goal_classifier", label: getElementTypeName("fitness_goal_classifier"), icon: <Target className="w-4 h-4" /> },
        { type: "experience_classifier", label: getElementTypeName("experience_classifier"), icon: <Award className="w-4 h-4" /> },
      ]
    }
  ];

// Elementos específicos para páginas de transição
const transitionElementCategories = [
  {
    name: 'Fundo',
    elements: [
      {
        type: "transition_background",
        label: getElementTypeName("transition_background"),
        icon: <Palette className="w-4 h-4" />,
      },
    ],
  },
  {
    name: 'Conteúdo',
    elements: [
      {
        type: "transition_text",
        label: getElementTypeName("transition_text"),
        icon: <Type className="w-4 h-4" />,
      },
      {
        type: "transition_counter",
        label: getElementTypeName("transition_counter"),
        icon: <Hash className="w-4 h-4" />,
      },
    ],
  },
  {
    name: 'Elementos Visuais',
    elements: [
      {
        type: "transition_loader",
        label: getElementTypeName("transition_loader"),
        icon: <Loader className="w-4 h-4" />,
      },
      {
        type: "animated_transition",
        label: getElementTypeName("animated_transition"),
        icon: <Sparkles className="w-4 h-4" />,
      },
      {
        type: "netflix_intro",
        label: getElementTypeName("netflix_intro"),
        icon: <Sparkles className="w-4 h-4" />,
      },
    ],
  },
  {
    name: 'Navegação',
    elements: [
      {
        type: "transition_button",
        label: getElementTypeName("transition_button"),
        icon: <ArrowRight className="w-4 h-4" />,
      },
      {
        type: "transition_redirect",
        label: getElementTypeName("transition_redirect"),
        icon: <ArrowRight className="w-4 h-4" />,
      },
    ],
  },

];

// Elementos específicos para páginas de jogos
const gameElementCategories = [
  {
    name: "Jogos 🎰",
    elements: [
      {
        type: "game_wheel",
        label: getElementTypeName("game_wheel"),
        icon: <BarChart3 className="w-4 h-4" />,
      },
      {
        type: "game_scratch",
        label: getElementTypeName("game_scratch"),
        icon: <Volume2 className="w-4 h-4" />,
      },
      {
        type: "game_slot_machine",
        label: getElementTypeName("game_slot_machine"),
        icon: <AlertCircle className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "Jogos 🎯",
    elements: [
      {
        type: "game_color_pick",
        label: getElementTypeName("game_color_pick"),
        icon: <Palette className="w-4 h-4" />,
      },
      {
        type: "game_memory_cards",
        label: getElementTypeName("game_memory_cards"),
        icon: <Star className="w-4 h-4" />,
      },
      {
        type: "game_brick_break",
        label: getElementTypeName("game_brick_break"),
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

  const duplicatePage = (index: number) => {
    const originalPage = pages[index];
    const timestamp = Date.now();
    
    // Função para gerar IDs únicos para fieldId e responseId
    const generateUniqueId = (baseId: string, existingIds: Set<string>): string => {
      if (!existingIds.has(baseId)) {
        return baseId;
      }
      
      let counter = 1;
      let newId = `${baseId}${counter}`;
      while (existingIds.has(newId)) {
        counter++;
        newId = `${baseId}${counter}`;
      }
      return newId;
    };
    
    // Coletar todos os fieldIds e responseIds existentes no quiz
    const existingFieldIds = new Set<string>();
    const existingResponseIds = new Set<string>();
    
    pages.forEach(page => {
      page.elements.forEach(element => {
        if (element.fieldId) existingFieldIds.add(element.fieldId);
        if (element.responseId) existingResponseIds.add(element.responseId);
      });
    });
    
    // Criar uma cópia profunda da página
    const duplicatedPage: QuizPage = {
      id: timestamp,
      title: `${originalPage.title} (Cópia)`,
      elements: originalPage.elements.map((element, elementIndex) => {
        const newElement = {
          ...element,
          id: timestamp + elementIndex + 1, // ID único sequencial para cada elemento
        };
        
        // Gerar IDs únicos para fieldId e responseId
        if (element.fieldId) {
          newElement.fieldId = generateUniqueId(element.fieldId, existingFieldIds);
          existingFieldIds.add(newElement.fieldId);
        }
        
        if (element.responseId) {
          newElement.responseId = generateUniqueId(element.responseId, existingResponseIds);
          existingResponseIds.add(newElement.responseId);
        }
        
        return newElement;
      }),
      isTransition: originalPage.isTransition,
      isGame: originalPage.isGame
    };
    
    // Inserir a página duplicada logo após a original
    const newPages = [...pages];
    newPages.splice(index + 1, 0, duplicatedPage);
    
    onPagesChange(newPages);
    
    // Ativar a página duplicada
    handleActivePageChange(index + 1);
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
    const timestamp = Date.now();
    
    // Função para gerar IDs únicos para fieldId e responseId
    const generateUniqueId = (baseId: string, existingIds: Set<string>): string => {
      if (!existingIds.has(baseId)) {
        return baseId;
      }
      
      let counter = 1;
      let newId = `${baseId}_${counter}`;
      while (existingIds.has(newId)) {
        counter++;
        newId = `${baseId}_${counter}`;
      }
      return newId;
    };
    
    // Coletar todos os fieldIds e responseIds existentes no quiz
    const existingFieldIds = new Set<string>();
    const existingResponseIds = new Set<string>();
    
    pages.forEach(page => {
      page.elements.forEach(element => {
        if (element.fieldId) existingFieldIds.add(element.fieldId);
        if (element.responseId) existingResponseIds.add(element.responseId);
      });
    });
    
    // Gerar IDs únicos para o novo elemento
    const baseFieldId = type === "phone" ? `telefone_${timestamp}` : `campo_${timestamp}`;
    const baseResponseId = `resposta_${timestamp}`;
    
    const uniqueFieldId = generateUniqueId(baseFieldId, existingFieldIds);
    const uniqueResponseId = generateUniqueId(baseResponseId, existingResponseIds);
    
    const baseElement: Element = {
      id: timestamp,
      type,
      content: type === "heading" ? "Novo Título" : type === "paragraph" ? "Novo Parágrafo" : type === "continue_button" ? "Continuar" : "",
      question: undefined,
      options: type === "multiple_choice" ? ["Opção 1", "Opção 2"] : undefined,
      required: false,
      fieldId: uniqueFieldId,
      responseId: uniqueResponseId,
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
        buttonBackgroundColor: defaultButtonColor, // 🎨 Usa cor padrão configurada no quiz
        buttonTextColor: defaultButtonTextColor, // 🎨 Usa cor de texto padrão configurada no quiz
        buttonHoverColor: defaultButtonColor === "#10b981" ? "#059669" : defaultButtonColor, // Hover inteligente
        isFixedFooter: false
      }),
      // 🔥 NOVA FUNCIONALIDADE: Configurações padrão para classificadores ultra personalizados
      ...(type === "body_type_classifier" && {
        classifierType: "body_type",
        classifierTitle: "Qual é o seu tipo corporal atual?",
        classifierDescription: "Selecione a opção que melhor descreve seu corpo:",
        classifierRequired: true,
        classifierMultipleSelect: false,
        fieldId: "tipo_corpo",
        classifierOptions: [
          {
            id: "magra",
            label: "Magra/Muito magra",
            description: "Corpo naturalmente magro, dificuldade para ganhar peso",
            icon: "👤",
            color: "#3b82f6",
            campaignTrigger: {
              sms: "Oi {nome_completo}! Seu corpo MAGRO precisa de estratégias específicas para ganhar massa. Temos o protocolo perfeito para você! 💪",
              email: "Protocolo Especial para Corpos Magros - Ganhe Massa Rapidamente",
              whatsapp: "🔥 {nome_completo}, descobrimos que você tem corpo MAGRO! Temos estratégias exclusivas para seu biotipo."
            }
          },
          {
            id: "com_volume",
            label: "Com Volume/Sobrepeso",
            description: "Corpo com mais volume, foco na definição muscular",
            icon: "💪",
            color: "#f59e0b",
            campaignTrigger: {
              sms: "Oi {nome_completo}! Seu corpo COM VOLUME tem potencial incrível para definição. Vamos transformar isso em músculos! 🔥",
              email: "Plano de Definição para Corpos com Volume - Resultados Garantidos",
              whatsapp: "💪 {nome_completo}, seu corpo COM VOLUME pode alcançar resultados incríveis com as técnicas certas!"
            }
          },
          {
            id: "tonifica",
            label: "Para Definir/Tonificar",
            description: "Corpo que precisa de tonificação e fortalecimento",
            icon: "⚡",
            color: "#10b981",
            campaignTrigger: {
              sms: "Oi {nome_completo}! Vamos TONIFICAR seu corpo com exercícios específicos. Prepare-se para a transformação! ⚡",
              email: "Programa de Tonificação Acelerada - Seu Corpo Definido",
              whatsapp: "⚡ {nome_completo}, identificamos que você quer TONIFICAR! Temos o programa perfeito para você."
            }
          },
          {
            id: "equilibrado",
            label: "Equilibrado/Normal",
            description: "Corpo com proporções equilibradas, manutenção e melhoria",
            icon: "⚖️",
            color: "#8b5cf6",
            campaignTrigger: {
              sms: "Oi {nome_completo}! Seu corpo EQUILIBRADO pode ser otimizado para resultados ainda melhores! Vamos evoluir juntos! ⚖️",
              email: "Otimização para Corpos Equilibrados - Maximize seus Resultados",
              whatsapp: "⚖️ {nome_completo}, seu corpo EQUILIBRADO tem grande potencial! Vamos maximizar seus resultados."
            }
          }
        ]
      }),
      
      ...(type === "age_classifier" && {
        classifierType: "age_group",
        classifierTitle: "Qual é a sua faixa etária?",
        classifierDescription: "Selecione sua idade atual:",
        classifierRequired: true,
        classifierMultipleSelect: false,
        fieldId: "faixa_etaria",
        classifierOptions: [
          {
            id: "18-25",
            label: "18-25 anos",
            description: "Metabolismo acelerado, alta capacidade de recuperação",
            icon: "🚀",
            color: "#3b82f6",
            campaignTrigger: {
              sms: "Oi {nome_completo}! Aos {faixa_etaria} você tem METABOLISMO TURBINADO! Vamos usar isso a seu favor! 🚀",
              email: "Método Jovem (18-25 anos) - Maximize seu Metabolismo Acelerado",
              whatsapp: "🚀 {nome_completo}, na faixa dos {faixa_etaria} seu corpo tem potencial EXPLOSIVO!"
            }
          },
          {
            id: "26-35",
            label: "26-35 anos",
            description: "Pico de performance, equilibrio ideal para resultados",
            icon: "💪",
            color: "#10b981",
            campaignTrigger: {
              sms: "Oi {nome_completo}! {faixa_etaria} é a IDADE PERFEITA para transformação corporal. Vamos aproveitar! 💪",
              email: "Programa Prime (26-35 anos) - Idade Ideal para Transformação",
              whatsapp: "💪 {nome_completo}, {faixa_etaria} é a idade PRIME para resultados incríveis!"
            }
          },
          {
            id: "36-45",
            label: "36-45 anos",
            description: "Maturidade e experiência, foco em eficiência",
            icon: "🎯",
            color: "#f59e0b",
            campaignTrigger: {
              sms: "Oi {nome_completo}! Aos {faixa_etaria} você tem EXPERIÊNCIA e maturidade. Método eficiente para sua idade! 🎯",
              email: "Estratégia Madura (36-45 anos) - Eficiência e Resultados Duradouros",
              whatsapp: "🎯 {nome_completo}, {faixa_etaria} é perfeito para métodos EFICIENTES e inteligentes!"
            }
          },
          {
            id: "46+",
            label: "46+ anos",
            description: "Sabedoria e determinação, foco em saúde e vitalidade",
            icon: "🌟",
            color: "#8b5cf6",
            campaignTrigger: {
              sms: "Oi {nome_completo}! Aos {faixa_etaria} você tem SABEDORIA e determinação. Saúde e vitalidade em foco! 🌟",
              email: "Programa Vitalidade (46+ anos) - Saúde e Energia Renovada",
              whatsapp: "🌟 {nome_completo}, {faixa_etaria} é a idade da SABEDORIA! Vitalidade e saúde em primeiro lugar."
            }
          }
        ]
      }),
      
      ...(type === "fitness_goal_classifier" && {
        classifierType: "fitness_goal",
        classifierTitle: "Qual é o seu objetivo fitness?",
        classifierDescription: "Selecione o que você quer alcançar:",
        classifierRequired: true,
        classifierMultipleSelect: false,
        fieldId: "objetivo_fitness",
        classifierOptions: [
          {
            id: "perder_peso",
            label: "Perder Peso",
            description: "Reduzir gordura corporal e alcançar peso ideal",
            icon: "📉",
            color: "#ef4444",
            campaignTrigger: {
              sms: "Oi {nome_completo}! Seu objetivo é PERDER PESO? Temos o método que já ajudou +10mil pessoas! 📉",
              email: "Protocolo Queima Gordura - Perca Peso de Forma Saudável e Duradoura",
              whatsapp: "📉 {nome_completo}, vamos PERDER PESO juntos! Método comprovado e eficaz esperando por você."
            }
          },
          {
            id: "ganhar_massa",
            label: "Ganhar Massa",
            description: "Aumentar massa muscular e definição",
            icon: "💪",
            color: "#10b981",
            campaignTrigger: {
              sms: "Oi {nome_completo}! Quer GANHAR MASSA MUSCULAR? Protocolo científico para hipertrofia garantida! 💪",
              email: "Sistema de Hipertrofia - Ganhe Massa Muscular Rapidamente",
              whatsapp: "💪 {nome_completo}, vamos GANHAR MASSA! Sistema de hipertrofia que realmente funciona."
            }
          },
          {
            id: "tonificar",
            label: "Tonificar",
            description: "Definir músculos e melhorar forma física",
            icon: "⚡",
            color: "#f59e0b",
            campaignTrigger: {
              sms: "Oi {nome_completo}! Objetivo TONIFICAR? Exercícios específicos para definição muscular perfeita! ⚡",
              email: "Programa de Tonificação Completa - Corpo Definido e Saudável", 
              whatsapp: "⚡ {nome_completo}, vamos TONIFICAR! Definição muscular que você sempre sonhou."
            }
          },
          {
            id: "manter_forma",
            label: "Manter Forma",
            description: "Manutenção da forma física atual",
            icon: "⚖️",
            color: "#8b5cf6",
            campaignTrigger: {
              sms: "Oi {nome_completo}! Quer MANTER SUA FORMA? Rotina inteligente para sustentabilidade a longo prazo! ⚖️",
              email: "Manutenção Inteligente - Mantenha sua Forma Física Ideal",
              whatsapp: "⚖️ {nome_completo}, vamos MANTER SUA FORMA! Sustentabilidade e qualidade de vida."
            }
          }
        ]
      }),
      
      ...(type === "experience_classifier" && {
        classifierType: "experience_level",
        classifierTitle: "Qual é o seu nível de experiência?",
        classifierDescription: "Selecione seu nível atual de condicionamento físico:",
        classifierRequired: true,
        classifierMultipleSelect: false,
        fieldId: "nivel_experiencia",
        classifierOptions: [
          {
            id: "iniciante",
            label: "Iniciante",
            description: "Pouca ou nenhuma experiência com exercícios",
            icon: "🌱",
            color: "#10b981",
            campaignTrigger: {
              sms: "Oi {nome_completo}! INICIANTE? Perfeito! Método gradual e seguro para começar com o pé direito! 🌱",
              email: "Guia do Iniciante - Comece sua Jornada Fitness com Segurança",
              whatsapp: "🌱 {nome_completo}, ser INICIANTE é uma vantagem! Método desenvolvido especialmente para você."
            }
          },
          {
            id: "intermediario",
            label: "Intermediário",
            description: "Alguns meses de experiência, conhecimento básico",
            icon: "🔥",
            color: "#f59e0b",
            campaignTrigger: {
              sms: "Oi {nome_completo}! Nível INTERMEDIÁRIO? Hora de dar o próximo passo e quebrar plateaus! 🔥",
              email: "Evolução Intermediária - Quebre Plateaus e Acelere Resultados",
              whatsapp: "🔥 {nome_completo}, nível INTERMEDIÁRIO significa que é hora de EVOLUIR! Próximo nível te espera."
            }
          },
          {
            id: "avancado",
            label: "Avançado",
            description: "Experiência sólida, busca por otimização",
            icon: "⚡",
            color: "#8b5cf6",
            campaignTrigger: {
              sms: "Oi {nome_completo}! AVANÇADO? Técnicas de elite para maximizar seus resultados já conquistados! ⚡",
              email: "Protocolo Avançado - Técnicas de Elite para Resultados Superiores",
              whatsapp: "⚡ {nome_completo}, nível AVANÇADO merece técnicas de ELITE! Vamos maximizar tudo."
            }
          },
          {
            id: "expert",
            label: "Especialista",
            description: "Experiência extensa, conhecimento profundo",
            icon: "👑",
            color: "#6366f1",
            campaignTrigger: {
              sms: "Oi {nome_completo}! EXPERT? Você merece estratégias de outro nível. Vamos para a maestria! 👑",
              email: "Maestria Fitness - Estratégias Exclusivas para Experts",
              whatsapp: "👑 {nome_completo}, EXPERT merece o que há de mais avançado! Maestria total te aguarda."
            }
          }
        ]
      }),

      ...(type === "loading_question" && {
        loadingDuration: 3,
        loadingBarColor: "#10B981",
        loadingBarBackgroundColor: "#E5E7EB",
        loadingBarHeight: 8,
        loadingText: "Processando...",
        popupQuestion: "Você gostaria de continuar?",
        popupQuestionColor: "#1F2937",
        popupYesText: "Sim",
        popupNoText: "Não",
        yesButtonBgColor: "transparent",
        yesButtonTextColor: "#000000",
        noButtonBgColor: "transparent",
        noButtonTextColor: "#000000",
        showPercentage: true,
        enableShine: false,
        enableStripes: false,
        showRemainingTime: false,
        progressText: "Carregando...",
        responseId: `pergunta_${Date.now()}`
      }),

      ...(type === "progress_bar" && {
        progressStyle: "striped",
        progressColor: "#FCBC51",
        progressBackgroundColor: "#2c303a",
        progressHeight: 18,
        progressBorderRadius: 6,
        progressWidth: 75,
        showPercentage: true,
        animationDuration: 6,
        progressTitle: "Progresso"
      }),

      ...(type === "netflix_intro" && {
        netflixTitle: "NETFLIX",
        netflixDuration: 4,
        netflixShowTitle: true,
        netflixAutoAdvance: true,
        netflixFullscreen: true,
        netflixLetters: "N-E-T-F-L-I-X",
        netflixAnimationSpeed: "normal"
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

  // Função para atualizar o fundo da página
  const updatePageBackground = (backgroundType: 'white' | 'black' | 'custom') => {
    const updatedPages = pages.map((page, index) => {
      if (index === activePage) {
        return {
          ...page,
          pageBackground: backgroundType,
          // Se for personalizado e não houver cor definida, usar cinza como padrão
          customBackgroundColor: backgroundType === 'custom' && !page.customBackgroundColor 
            ? '#f3f4f6' 
            : page.customBackgroundColor
        };
      }
      return page;
    });
    onPagesChange(updatedPages);
  };

  // Função para atualizar a cor personalizada do fundo
  const updateCustomBackgroundColor = (color: string) => {
    const updatedPages = pages.map((page, index) => {
      if (index === activePage) {
        return {
          ...page,
          customBackgroundColor: color,
          pageBackground: 'custom' // Garantir que o tipo seja personalizado
        };
      }
      return page;
    });
    onPagesChange(updatedPages);
  };

  // Função para obter a cor de fundo da página atual
  const getPageBackgroundStyle = () => {
    const currentPage = pages[activePage];
    if (!currentPage?.pageBackground || currentPage.pageBackground === 'white') {
      return { backgroundColor: '#ffffff' };
    }
    if (currentPage.pageBackground === 'black') {
      return { backgroundColor: '#000000' };
    }
    if (currentPage.pageBackground === 'custom') {
      return { backgroundColor: currentPage.customBackgroundColor || '#f3f4f6' };
    }
    return { backgroundColor: '#ffffff' };
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
          borderRadius: element.backgroundColor !== "transparent" ? "6px" : "0",
          // 🔥 NOVA FUNCIONALIDADE: Gradientes de texto
          background: element.textGradient ? `linear-gradient(${element.gradientDirection || "135deg"}, ${element.gradientFrom || "#667eea"}, ${element.gradientTo || "#764ba2"})` : undefined,
          WebkitBackgroundClip: element.textGradient ? "text" : undefined,
          WebkitTextFillColor: element.textGradient ? "transparent" : undefined,
          backgroundClip: element.textGradient ? "text" : undefined,
          // 🔥 NOVA FUNCIONALIDADE: Sombras de texto
          textShadow: element.textShadow === "sm" ? "1px 1px 2px rgba(0,0,0,0.1)" : 
                     element.textShadow === "md" ? "2px 2px 4px rgba(0,0,0,0.2)" :
                     element.textShadow === "lg" ? "3px 3px 6px rgba(0,0,0,0.3)" :
                     element.textShadow === "neon" ? "0 0 10px currentColor" : undefined
        };

        // 🔥 NOVA FUNCIONALIDADE: Animações de entrada
        const animationClass = element.animation === "fadeIn" ? "animate-fade-in" :
                              element.animation === "slideUp" ? "animate-slide-up" :
                              element.animation === "typewriter" ? "animate-typewriter" :
                              "";

        return (
          <div className={`relative ${animationClass}`}>
            {/* 🔥 NOVA FUNCIONALIDADE: Ícone decorativo */}
            {element.decorativeIcon && (
              <span className="absolute -left-8 top-0 text-2xl opacity-30">
                {element.decorativeIcon}
              </span>
            )}
            
            <h2 style={headingStyle} className={`relative ${element.letterSpacing === "wide" ? "tracking-wide" : element.letterSpacing === "wider" ? "tracking-wider" : ""}`}>
              {/* 🔥 NOVA FUNCIONALIDADE: Destaque de palavras-chave */}
              {element.highlightKeywords ? 
                element.content?.split(' ').map((word, index) => {
                  const isKeyword = element.keywords?.includes(word.toLowerCase());
                  return (
                    <span key={index} className={isKeyword ? "bg-yellow-200 px-1 rounded" : ""}>
                      {word}{index < (element.content?.split(' ').length || 0) - 1 ? ' ' : ''}
                    </span>
                  );
                }) : 
                element.content
              }
              
              {/* 🔥 NOVA FUNCIONALIDADE: Badge decorativo */}
              {element.badge && (
                <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  element.badgeColor === "blue" ? "bg-blue-100 text-blue-800" :
                  element.badgeColor === "green" ? "bg-green-100 text-green-800" :
                  element.badgeColor === "red" ? "bg-red-100 text-red-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {element.badge}
                </span>
              )}
            </h2>
            
            {/* 🔥 NOVA FUNCIONALIDADE: Linha decorativa */}
            {element.decorativeLine && (
              <div className={`w-12 h-1 mt-2 ${
                element.lineColor === "primary" ? "bg-vendzz-primary" :
                element.lineColor === "secondary" ? "bg-gray-400" :
                "bg-gradient-to-r from-blue-500 to-purple-500"
              } ${element.lineAlignment === "center" ? "mx-auto" : element.lineAlignment === "right" ? "ml-auto" : ""}`}></div>
            )}
          </div>
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
                              element.optionLayout === "cards" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" :
                              "space-y-2";

        const optionClass = element.buttonStyle === "rounded" ? "rounded-lg" :
                           element.buttonStyle === "pills" ? "rounded-full" :
                           element.buttonStyle === "cards" ? "rounded-xl shadow-md hover:shadow-lg" :
                           "rounded-sm";

        const spacingClass = element.spacing === "sm" ? "gap-1" :
                            element.spacing === "lg" ? "gap-4" :
                            "gap-2";

        // 🔥 NOVA FUNCIONALIDADE: Animação e randomização
        const optionAnimationClass = element.animateOptions ? "transform hover:scale-105 transition-all duration-200" : "transition-all";
        const shouldRandomize = element.randomizeOptions;

        // 🔥 NOVA FUNCIONALIDADE: Opcões com imagens melhoradas
        const displayOptions = shouldRandomize ? 
          [...(element.options || [])].sort(() => Math.random() - 0.5) : 
          (element.options || []);

        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium" style={questionStyle}>
              {element.question || "Pergunta"}
              
              {element.showQuestionNumber && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">#{element.questionNumber || 1}</span>}
            </label>
            
            {/* 🔥 NOVA FUNCIONALIDADE: Descrição da pergunta */}
            {element.questionDescription && (
              <p className="text-sm text-gray-600 mt-1">{element.questionDescription}</p>
            )}
            
            <div className={`${containerClass} ${spacingClass}`}>
              {displayOptions.map((option, index) => (
                <div key={index} className={`group relative flex items-center space-x-3 p-4 border border-gray-200 hover:border-vendzz-primary hover:bg-vendzz-primary/5 cursor-pointer ${optionClass} ${element.borderStyle === "thick" ? "border-2" : ""} ${element.shadowStyle === "sm" ? "shadow-sm" : element.shadowStyle === "md" ? "shadow-md" : ""} ${optionAnimationClass}`}>
                  
                  {/* 🔥 NOVA FUNCIONALIDADE: Imagens melhoradas com overlay */}
                  {element.optionImages?.[index] && (
                    <div className="relative">
                      <img 
                        src={element.optionImages[index]} 
                        alt={option}
                        className={`${element.imageSize === "sm" ? "w-12 h-12" : element.imageSize === "lg" ? "w-20 h-20" : "w-16 h-16"} object-cover rounded-lg border-2 border-gray-200 group-hover:border-vendzz-primary transition-colors`}
                      />
                      {element.imageOverlay && (
                        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg group-hover:bg-opacity-0 transition-all"></div>
                      )}
                    </div>
                  )}
                  
                  {/* 🔥 NOVA FUNCIONALIDADE: Ícones nas opções */}
                  {element.optionIcons?.[index] && !element.optionImages?.[index] && (
                    <div className={`${element.iconSize === "sm" ? "w-6 h-6" : element.iconSize === "lg" ? "w-10 h-10" : "w-8 h-8"} flex items-center justify-center rounded-full bg-vendzz-primary/10 text-vendzz-primary`}>
                      <span className="text-xl">{element.optionIcons[index]}</span>
                    </div>
                  )}
                  
                  {!element.hideInputs && (
                    <input 
                      type={element.multipleSelection ? "checkbox" : "radio"} 
                      name={`preview-${element.id}`} 
                      className={`${element.inputStyle === "modern" ? "w-5 h-5 bg-transparent border-2 rounded-md focus:ring-2" : "w-4 h-4 bg-transparent border-2 rounded"}`}
                      style={{
                        borderColor: element.checkboxColor || "#374151",
                        accentColor: element.checkboxColor || "#374151"
                      }}
                    />
                  )}
                  
                  <div className="flex-1">
                    <span className={`font-medium ${element.optionTextSize === "sm" ? "text-xs" : element.optionTextSize === "lg" ? "text-base" : "text-sm"}`} style={{
                      color: element.optionTextColor || "#374151",
                      fontSize: element.optionFontSize === "xs" ? "12px" : 
                               element.optionFontSize === "sm" ? "14px" : 
                               element.optionFontSize === "lg" ? "18px" : 
                               element.optionFontSize === "xl" ? "20px" : "16px",
                      fontWeight: element.optionFontWeight === "light" ? "300" :
                                 element.optionFontWeight === "medium" ? "500" :
                                 element.optionFontWeight === "semibold" ? "600" :
                                 element.optionFontWeight === "bold" ? "700" : "400"
                    }}>
                      {typeof option === 'string' ? option : option?.text || `Opção ${index + 1}`}
                    </span>
                    
                    {/* 🔥 NOVA FUNCIONALIDADE: Subtexto nas opções */}
                    {element.optionSubtexts?.[index] && (
                      <p className="text-xs text-gray-500 mt-1">{element.optionSubtexts[index]}</p>
                    )}
                    
                    {/* 🔥 NOVA FUNCIONALIDADE: Pontuação visível */}
                    {element.showOptionPoints && element.optionPoints?.[index] && (
                      <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        +{element.optionPoints[index]} pts
                      </span>
                    )}
                  </div>
                  
                  {/* 🔥 NOVA FUNCIONALIDADE: Badge "Mais Popular" */}
                  {element.popularOption === index && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                      ⭐ Popular
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* 🔥 NOVA FUNCIONALIDADE: Seleção mínima/máxima */}
            {element.multipleSelection && (element.minSelections || element.maxSelections) && (
              <p className="text-xs text-gray-500 mt-2">
                {element.minSelections && element.maxSelections ? 
                  `Selecione entre ${element.minSelections} e ${element.maxSelections} opções` :
                  element.minSelections ? 
                    `Selecione pelo menos ${element.minSelections} opção(ões)` :
                    `Selecione até ${element.maxSelections} opção(ões)`
                }
              </p>
            )}
          </div>
        );
      case "text":
      case "email":
      case "phone":
      case "number":
        // Aplicar estilos de formatação de texto
        const fieldLabelStyle = {
          fontSize: element.fontSize === "xs" ? "12px" : 
                   element.fontSize === "sm" ? "14px" : 
                   element.fontSize === "lg" ? "18px" : 
                   element.fontSize === "xl" ? "20px" : "16px",
          fontWeight: element.fontWeight || "500",
          color: element.textColor || "#374151",
          textAlign: (element.textAlign || "left") as any,
        };

        // Largura em porcentagem da tela
        const widthPercentage = element.widthPercentage || 100;
        const containerWidth = `${Math.min(Math.max(widthPercentage, 10), 100)}%`;

        const inputStyle = element.inputStyle === "modern" ? "rounded-lg border-2 border-gray-200 focus:border-vendzz-primary focus:ring-2 focus:ring-vendzz-primary/20" :
                          element.inputStyle === "minimal" ? "border-0 border-b-2 border-gray-200 focus:border-vendzz-primary rounded-none bg-transparent" :
                          element.inputStyle === "filled" ? "bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-vendzz-primary" :
                          "border border-gray-300 rounded-md focus:border-vendzz-primary focus:ring-1 focus:ring-vendzz-primary";
        
        const iconMap = {
          email: "📧",
          phone: "📱", 
          text: "✏️",
          number: "🔢"
        };

        return (
          <div className="w-full" style={{ width: containerWidth, maxWidth: containerWidth }}>
            <div className="space-y-2">
              <label className="block font-medium" style={fieldLabelStyle}>
                {element.question || "Campo"}
                
                {element.showFieldIcon && <span className="ml-2">{iconMap[element.type as keyof typeof iconMap]}</span>}
              </label>
              
              {/* Descrição do campo */}
              {element.fieldDescription && (
                <p className="text-sm text-gray-500">{element.fieldDescription}</p>
              )}
              
              <div className="relative">
                {/* Ícone dentro do input */}
                {element.showInlineIcon && (
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm">{iconMap[element.type as keyof typeof iconMap]}</span>
                  </div>
                )}
                
                <input
                  type={element.type === "email" ? "email" : element.type === "phone" ? "tel" : element.type === "number" ? "number" : "text"}
                  placeholder={element.placeholder || `Digite aqui ${element.type === "email" ? "seu email" : element.type === "phone" ? "seu telefone" : ""}`}
                  className={`w-full px-3 py-3 ${element.showInlineIcon ? "pl-10" : ""} ${inputStyle} transition-all duration-200`}
                  maxLength={element.type === "text" ? 200 : element.type === "email" ? 150 : element.type === "phone" ? 20 : undefined}
                  {...(element.type === "email" && element.emailValidation && {
                    pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$"
                  })}
                  {...(element.type === "phone" && element.phoneFormat && {
                    pattern: element.phoneFormat
                  })}
                  {...(element.type === "number" && {
                    min: element.min,
                    max: element.max,
                    step: element.numberStep || 1
                  })}
                />
                
                {/* Contador de caracteres para campo texto, email e telefone */}
                {(element.type === "text" || element.type === "email" || element.type === "phone") && (
                  <div className="absolute bottom-1 right-2 text-xs text-gray-400">
                    {element.type === "text" ? "200" : element.type === "email" ? "150" : "20"} caracteres máx.
                  </div>
                )}
                
                {/* Validação em tempo real */}
                {element.type === "email" && element.showValidation && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                  </div>
                )}
                
                {/* Máscara de telefone */}
                {element.type === "phone" && element.showPhoneMask && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {element.countryCode || "+55"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case "textarea":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.question || "Área de Texto"}
              
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
                
              </label>
            </div>
          </div>
        );
      case "rating":
        // Configurações do elemento rating
        const starCount = element.starCount || 5;
        const starColor = element.starColor || "#FBBF24";
        const starFilled = element.starFilled || false;
        const starSizeClass = {
          small: "w-4 h-4",
          medium: "w-6 h-6", 
          large: "w-8 h-8"
        };
        const starSize = starSizeClass[element.starSize || "medium"];
        
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.question || "Avaliação"}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex space-x-1">
              {Array.from({ length: starCount }, (_, index) => (
                <Star 
                  key={index} 
                  className={`${starSize} cursor-pointer hover:opacity-80 transition-all`}
                  style={{ color: starColor }}
                  fill={starFilled ? starColor : 'none'}
                />
              ))}
            </div>
            <div className="text-xs text-gray-500">
              {starCount} estrelas • Cor: {starColor} • {starFilled ? 'Preenchidas' : 'Contorno apenas'}
            </div>
          </div>
        );
      case "image":
        return (
          <div className="space-y-2">
            {element.imageUrl ? (
              <div 
                className="w-full"
                style={{textAlign: element.textAlign || "center"}}
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
        const dividerThickness = element.dividerThickness || "medium";
        const dividerColor = element.dividerColor || "#d1d5db";
        
        const thicknessMap = {
          thin: "1px",
          medium: "2px", 
          thick: "4px"
        };
        
        return (
          <div className="my-4">
            <hr 
              style={{
                borderColor: dividerColor,
                borderWidth: thicknessMap[dividerThickness],
                borderStyle: "solid"
              }}
            />
          </div>
        );
      case "image_upload":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.question || "Upload de Imagem"}
              
            </label>
            {element.imageUrl ? (
              <div 
                className="w-full"
                style={{textAlign: element.textAlign || "center"}}
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
                  <p className="text-sm text-gray-500 mb-1">Clique para enviar imagem</p>
                  <p className="text-xs text-gray-400">Max 5MB</p>
                </div>
              </div>
            )}
          </div>
        );
      case "video":
        // Sistema completo de embed de vídeo sincronizado
        const videoUrl = element.content || '';
        const videoEmbed = getVideoEmbed(videoUrl);
        const videoPlatform = getVideoPlatform(videoUrl);
        
        // Configurações de largura responsiva sincronizadas com painel
        const videoWidth = element.videoWidth || 100;
        const tabletSize = element.tabletSize || Math.min(videoWidth + 20, 100);
        const mobileSize = element.mobileSize || Math.min(videoWidth + 40, 100);
        
        // Configurações de alinhamento
        const videoAlignment = element.videoAlignment || 'center';
        const alignmentClasses = {
          left: 'justify-start',
          center: 'justify-center', 
          right: 'justify-end'
        };
        
        // Configurações de aspect ratio
        const aspectRatio = element.aspectRatio || '16/9';
        const aspectRatioClasses = {
          "16/9": "aspect-video",
          "4/3": "aspect-[4/3]",
          "1/1": "aspect-square",
          "21/9": "aspect-[21/9]"
        };
        
        // Configurações de controles
        const autoplay = element.autoplay || "0";
        const muted = element.muted || "0"; 
        const controls = element.controls || "1";
        const loop = element.loop || "0";
        
        // Ícones por plataforma
        const platformIcons = {
          youtube: '📺',
          vimeo: '🎬',
          tiktok: '🎵',
          instagram: '📸',
          vturb: '🎥',
          vslplayer: '▶️',
          pandavideo: '🐼',
          wistia: '🎯',
          jwplayer: '⚡',
          brightcove: '☁️',
          custom: '🎞️',
          unknown: '❓'
        };
        
        // Construir URL com parâmetros
        let finalEmbedUrl = videoEmbed?.embedUrl;
        if (finalEmbedUrl && videoEmbed && (videoEmbed.platform === 'youtube' || videoEmbed.platform === 'vimeo')) {
          const params = new URLSearchParams();
          if (autoplay === "1") params.append('autoplay', '1');
          if (muted === "1") params.append('muted', '1');
          if (controls === "0") params.append('controls', '0');
          if (loop === "1") params.append('loop', '1');
          
          finalEmbedUrl += (finalEmbedUrl.includes('?') ? '&' : '?') + params.toString();
        }

        return (
          <div className="space-y-2">
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
                      <p className="text-sm text-red-600 font-medium">URL de vídeo não suportada</p>
                      <p className="text-xs text-red-500 mt-1">Verifique se a URL está correta</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center p-4">
                      <PlayCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 font-medium">Cole a URL do vídeo</p>
                      <p className="text-xs text-gray-500 mt-1">No painel de propriedades</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Info da plataforma detectada */}
            {videoEmbed?.embedUrl && videoPlatform !== 'unknown' && (
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span>{platformIcons[videoPlatform]}</span>
                <span>Plataforma: {videoPlatform.toUpperCase()}</span>
                <span>•</span>
                <span>Largura: {videoWidth}%</span>
                <span>•</span>
                <span>Aspecto: {aspectRatio}</span>
              </div>
            )}
          </div>
        );
      case "birth_date":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.question || "Data de Nascimento"}
              
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
        const heightInputStyle = element.inputStyle || "bordered";
        const labelPosition = element.labelPosition || "top";
        const showIcon = element.showIcon !== false;
        const unitSelectorStyle = element.unitSelectorStyle || "dropdown";
        
        // Aplicar formatação de fonte
        const heightLabelStyle = {
          fontSize: element.fontSize === 'xs' ? '0.75rem' : 
                   element.fontSize === 'sm' ? '0.875rem' : 
                   element.fontSize === 'lg' ? '1.125rem' : 
                   element.fontSize === 'xl' ? '1.25rem' : '1rem',
          fontWeight: element.fontWeight === 'light' ? '300' :
                     element.fontWeight === 'normal' ? '400' :
                     element.fontWeight === 'medium' ? '500' :
                     element.fontWeight === 'semibold' ? '600' :
                     element.fontWeight === 'bold' ? '700' : '500',
          textAlign: element.textAlign === 'left' ? 'left' :
                    element.textAlign === 'center' ? 'center' :
                    element.textAlign === 'right' ? 'right' : 'left'
        };

        const heightFieldLabelStyle = {
          fontSize: element.fontSize === 'xs' ? '0.75rem' : 
                   element.fontSize === 'sm' ? '0.875rem' : 
                   element.fontSize === 'lg' ? '1.125rem' : 
                   element.fontSize === 'xl' ? '1.25rem' : '1rem',
          fontWeight: element.fontWeight === 'light' ? '300' :
                     element.fontWeight === 'normal' ? '400' :
                     element.fontWeight === 'medium' ? '500' :
                     element.fontWeight === 'semibold' ? '600' :
                     element.fontWeight === 'bold' ? '700' : '500'
        };
        
        const inputClasses = {
          minimal: "w-full p-3 border-0 border-b-2 bg-transparent focus:outline-none focus:border-gray-500",
          bordered: "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500",
          filled: "w-full p-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500",
          rounded: "w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500"
        };
        
        // Calcular largura baseada na porcentagem
        const widthClass = element.width === '25%' ? 'w-1/4' :
                          element.width === '50%' ? 'w-1/2' :
                          element.width === '75%' ? 'w-3/4' :
                          'w-full';
        
        return (
          <div 
            className={`space-y-3 p-4 border-2 border-dashed rounded-lg bg-transparent ${widthClass}`}
            style={{borderColor: element.inputBorderColor || "#e5e7eb"}}
          >
            <div className={`flex ${labelPosition === "left" ? "flex-row items-center space-x-3" : "flex-col"} gap-2`}>
              {showIcon && (
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <ArrowUpDown className="w-5 h-5 text-gray-600" />
                </div>
              )}
              <div style={{ textAlign: heightLabelStyle.textAlign }}>
                <h3 
                  className="font-medium text-gray-800"
                  style={heightLabelStyle}
                >
                  {element.question || "Altura"}
                </h3>
                <p className="text-sm text-gray-600">
                  {element.description || "Digite sua altura"}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder={heightUnit === "cm" ? "Ex: 175" : "Ex: 5.9"}
                    className={inputClasses[heightInputStyle]}
                    style={{
                      backgroundColor: element.inputBackgroundColor || "white",
                      borderColor: element.inputBorderColor || "#e5e7eb",
                      ...heightFieldLabelStyle
                    }}
                    min={element.min || (heightUnit === "cm" ? 120 : 3)}
                    max={element.max || (heightUnit === "cm" ? 250 : 8)}
                    step={heightUnit === "cm" ? 1 : 0.1}
                  />
                  
                  {showUnitSelector && (
                    <div className="flex-shrink-0">
                      {unitSelectorStyle === "dropdown" && (
                        <select 
                          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                          value={heightUnit}
                          onChange={(e) => {
                            // Funcionalidade será implementada no handler
                          }}
                        >
                          <option value="cm">cm</option>
                          <option value="ft">ft</option>
                        </select>
                      )}
                      
                      {unitSelectorStyle === "tabs" && (
                        <div className="flex bg-gray-100 rounded-lg p-1">
                          <button className={`px-3 py-1 text-sm rounded ${heightUnit === "cm" ? "bg-gray-600 text-white" : "text-gray-600"}`}>
                            cm
                          </button>
                          <button className={`px-3 py-1 text-sm rounded ${heightUnit === "ft" ? "bg-gray-600 text-white" : "text-gray-600"}`}>
                            ft
                          </button>
                        </div>
                      )}
                      
                      {unitSelectorStyle === "buttons" && (
                        <div className="flex space-x-2">
                          <button className={`px-3 py-2 text-sm border rounded-lg ${heightUnit === "cm" ? "bg-gray-600 text-white border-gray-600" : "border-gray-300"}`}>
                            cm
                          </button>
                          <button className={`px-3 py-2 text-sm border rounded-lg ${heightUnit === "ft" ? "bg-gray-600 text-white border-gray-600" : "border-gray-300"}`}>
                            ft
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  Limite de 15 dígitos (altura em {heightUnit}) • Range: {heightUnit === "cm" ? "120-250cm" : "3.0-8.0ft"}
                </div>
              </div>
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
        
        const weightLabelStyle = `text-${element.fontSize || 'sm'} font-${element.fontWeight || 'normal'} text-${element.textAlign || 'left'}`;
        const weightFieldLabelStyle = `text-${element.fontSize || 'sm'} font-${element.fontWeight || 'normal'} text-${element.textAlign || 'left'}`;
        
        return (
          <div 
            className="space-y-3 p-4 border-2 border-dashed rounded-lg bg-transparent"
            style={{
              width: element.width || "100%",
              borderColor: "#e5e7eb"
            }}
          >
            <div className={`flex ${weightLabelPosition === "left" ? "flex-row items-center space-x-3" : "flex-col"} gap-2`}>
              {showWeightIcon && (
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Scale className="w-5 h-5 text-gray-600" />
                </div>
              )}
              <div>
                <h3 className={weightLabelStyle}>
                  {element.question || "Peso Atual"}
                </h3>
                <p className={`text-xs text-gray-500 ${weightFieldLabelStyle}`}>
                  {element.description || "Capture o peso atual do usuário"}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm" style={{ width: element.width || "100%" }}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder={element.placeholder || (currentWeightUnit === "kg" ? "Ex: 70.5" : "Ex: 155")}
                    className={weightInputClasses[weightInputStyle]}
                    style={{
                      backgroundColor: "white",
                      borderColor: "#e5e7eb",
                      fontSize: element.fontSize === 'xs' ? '12px' : element.fontSize === 'sm' ? '14px' : element.fontSize === 'lg' ? '18px' : element.fontSize === 'xl' ? '20px' : '16px',
                      fontWeight: element.fontWeight || 'normal',
                      textAlign: element.textAlign || 'left'
                    }}
                    min={element.min || (currentWeightUnit === "kg" ? 30 : 66)}
                    max={element.max || (currentWeightUnit === "kg" ? 300 : 660)}
                    step={currentWeightUnit === "kg" ? 0.1 : 0.1}
                  />
                  
                  {showWeightUnitSelector && (
                    <div className="flex-shrink-0">
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button className={`px-3 py-1 text-sm rounded ${currentWeightUnit === "kg" ? "bg-gray-600 text-white" : "text-gray-600"}`}>
                          kg
                        </button>
                        <button className={`px-3 py-1 text-sm rounded ${currentWeightUnit === "lb" ? "bg-gray-600 text-white" : "text-gray-600"}`}>
                          lb
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {element.showBMICalculation && element.heightFieldId && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">IMC será calculado automaticamente</span>
                    </div>
                    <div className="text-xs text-green-700">
                      Sincronizado com campo altura: {element.heightFieldId}
                    </div>
                  </div>
                )}
                
                {element.showBMICalculation && !element.heightFieldId && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">⚠️ ID do campo altura não configurado</span>
                    </div>
                    <div className="text-xs text-red-700">
                      Configure o ID do campo altura nas propriedades para ativar o cálculo do IMC
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
        const targetWeightUnit = element.weightUnit || "kg";
        const showTargetUnitSelector = element.showUnitSelector !== false;
        const targetLabelStyle = `text-${element.fontSize || 'sm'} font-${element.fontWeight || 'normal'} text-${element.textAlign || 'left'}`;
        const targetFieldLabelStyle = `text-${element.fontSize || 'sm'} font-${element.fontWeight || 'normal'} text-${element.textAlign || 'left'}`;
        
        return (
          <div 
            className="space-y-3 p-4 border-2 border-dashed rounded-lg bg-transparent"
            style={{
              width: element.width || "100%",
              borderColor: "#e5e7eb"
            }}
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-800">Peso Objetivo</span>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm" style={{ width: element.width || "100%" }}>
              <label className={`block mb-2 ${targetLabelStyle}`}>
                {element.question || "Qual é seu peso objetivo?"}
              </label>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    step={targetWeightUnit === "kg" ? 0.1 : 0.1}
                    min={element.min || (targetWeightUnit === "kg" ? 30 : 66)}
                    max={element.max || (targetWeightUnit === "kg" ? 300 : 660)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder={element.placeholder || (targetWeightUnit === "kg" ? "Ex: 65.0" : "Ex: 143")}
                    style={{
                      fontSize: element.fontSize === 'xs' ? '12px' : element.fontSize === 'sm' ? '14px' : element.fontSize === 'lg' ? '18px' : element.fontSize === 'xl' ? '20px' : '16px',
                      fontWeight: element.fontWeight || 'normal',
                      textAlign: element.textAlign || 'left'
                    }}
                  />
                  
                  {showTargetUnitSelector && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button className={`px-3 py-1 text-sm rounded ${targetWeightUnit === "kg" ? "bg-gray-600 text-white" : "text-gray-600"}`}>
                          kg
                        </button>
                        <button className={`px-3 py-1 text-sm rounded ${targetWeightUnit === "lb" ? "bg-gray-600 text-white" : "text-gray-600"}`}>
                          lb
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {element.showDifferenceCalculation && element.currentWeightFieldId && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Cálculo de diferença ativo</span>
                  </div>
                  <div className="text-xs text-green-700">
                    Vinculado com peso atual: {element.currentWeightFieldId}
                  </div>
                </div>
              )}
              
              {element.showDifferenceCalculation && !element.currentWeightFieldId && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">⚠️ ID do peso atual não configurado</span>
                  </div>
                  <div className="text-xs text-red-700">
                    Configure o ID do campo peso atual nas propriedades para ativar o cálculo
                  </div>
                </div>
              )}
              
              {element.showProgressCalculation && element.currentWeightFieldId && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Progresso será calculado automaticamente</span>
                  </div>
                  <div className="text-xs text-blue-700">
                    Baseado na diferença entre peso atual e peso objetivo
                  </div>
                </div>
              )}
              
              {element.description && (
                <div className={`mt-3 text-gray-600 bg-gray-50 p-2 rounded ${targetFieldLabelStyle}`}>
                  {element.description}
                </div>
              )}
            </div>
            
            <div className="text-xs text-gray-600 text-center">
              Elemento: Peso Objetivo • Range: {targetWeightUnit === "kg" ? "30-300kg" : "66-660lb"} • Unidade: {targetWeightUnit.toUpperCase()}
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
        const buttonSize = element.buttonSize || "medium";
        const buttonBorderRadius = element.buttonBorderRadius || "medium";
        const buttonBgColor = element.buttonBackgroundColor || "#10B981";
        const buttonTextColor = element.buttonTextColor || "#FFFFFF";
        const isFixedFooter = element.isFixedFooter || false;
        
        const buttonSizeClasses = {
          small: "px-4 py-2 text-sm",
          medium: "px-6 py-3 text-base",
          large: "px-8 py-4 text-lg",
          full: "w-full px-6 py-3 text-base"
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
            
            <div className={`${isFixedFooter ? 'fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-t shadow-lg p-4' : 'flex justify-center'}`}>
              <button
                style={{
                  backgroundColor: buttonBgColor,
                  color: buttonTextColor,
                }}
                className={`
                  ${buttonSizeClasses[buttonSize]} 
                  ${radiusClasses[buttonBorderRadius]}
                  font-medium shadow-lg transition-all duration-200
                  hover:shadow-xl relative overflow-hidden
                  ${buttonSize === 'full' ? '' : 'hover:scale-105'}
                `}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = element.buttonHoverColor || "#059669";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = buttonBgColor;
                }}
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
                style={{backgroundColor: transitionButtonBgColor,
                  color: transitionButtonTextColor,}}
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
            style={{backgroundStyle}}
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
              style={{textStyle}}
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
                  style={{color: counterColor}}
                >
                  {String((element as any).chronometerHours || 0).padStart(2, '0')}:
                  {String((element as any).chronometerMinutes || 15).padStart(2, '0')}:
                  {String((element as any).chronometerSeconds || 30).padStart(2, '0')}
                </div>
              ) : (
                <div 
                  className={`${counterSize} font-bold`}
                  style={{color: counterColor}}
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
                  <div className={`${loaderSize} bg-current rounded-full animate-bounce`} style={{color: loaderColor}}></div>
                  <div className={`${loaderSize} bg-current rounded-full animate-bounce`} style={{color: loaderColor, animationDelay: "0.1s"}}></div>
                  <div className={`${loaderSize} bg-current rounded-full animate-bounce`} style={{color: loaderColor, animationDelay: "0.2s"}}></div>
                </div>
              );
            case "bars":
              return (
                <div className="flex space-x-1">
                  <div className={`w-1 ${loaderSize} bg-current animate-pulse`} style={{color: loaderColor}}></div>
                  <div className={`w-1 ${loaderSize} bg-current animate-pulse`} style={{color: loaderColor, animationDelay: "0.1s"}}></div>
                  <div className={`w-1 ${loaderSize} bg-current animate-pulse`} style={{color: loaderColor, animationDelay: "0.2s"}}></div>
                </div>
              );
            case "pulse":
              return (
                <div className={`${loaderSize} bg-current rounded-full animate-ping`} style={{color: loaderColor}}></div>
              );
            case "ring":
              return (
                <div className={`${loaderSize} border-4 border-gray-200 border-t-current rounded-full animate-spin`} style={{borderTopColor: loaderColor}}></div>
              );
            case "ripple":
              return (
                <div className="relative inline-block">
                  <div className={`${loaderSize} border-2 border-current rounded-full animate-ping absolute`} style={{borderColor: loaderColor}}></div>
                  <div className={`${loaderSize} border-2 border-current rounded-full animate-ping absolute`} style={{borderColor: loaderColor, animationDelay: "0.5s"}}></div>
                </div>
              );
            default:
              return (
                <div className={`${loaderSize} border-2 border-gray-200 border-t-current rounded-full animate-spin`} style={{borderTopColor: loaderColor}}></div>
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
                <div className={`${textSize} font-medium`} style={{color: textColor}}>
                  {element.content}
                </div>
              )}
              
              {((element as any).alternatingText1 || (element as any).alternatingText2) && (
                <div className="text-center space-y-1">
                  {(element as any).alternatingText1 && (
                    <div className={`${textSize} animate-pulse`} style={{color: textColor}}>
                      {(element as any).alternatingText1} ({(element as any).alternatingDuration1 || 2}s)
                    </div>
                  )}
                  {(element as any).alternatingText2 && (
                    <div className={`${textSize} animate-pulse`} style={{color: textColor, animationDelay: "1s"}}>
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
              <div className="text-lg font-medium mb-2" style={{color: redirectTextColor}}>
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
        const wheelSegments = element.wheelSegments || ["Prêmio 1", "Prêmio 2", "Prêmio 3", "Prêmio 4"];
        const wheelColors = element.wheelColors || ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"];
        const winningSegment = element.wheelWinningSegment || 0;
        
        return (
          <div className="space-y-4 p-4 border-2 border-dashed border-orange-200 rounded-lg bg-gradient-to-br from-orange-50 to-yellow-50 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <span className="font-bold text-orange-800">🎰 Roleta da Sorte Premium</span>
              </div>
              {/* 🔥 INTEGRAÇÃO COM SISTEMA: Indica captura automática */}
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                📊 Auto-Captura
              </span>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
                  {wheelSegments.map((segment, index) => {
                    const angle = 360 / wheelSegments.length;
                    const startAngle = index * angle;
                    const endAngle = (index + 1) * angle;
                    const isWinning = index === winningSegment;
                    
                    const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
                    const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
                    const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
                    const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);
                    
                    const largeArcFlag = angle > 180 ? 1 : 0;
                    
                    return (
                      <g key={index}>
                        <path
                          d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                          fill={wheelColors[index] || "#e2e8f0"}
                          stroke={isWinning ? "#fbbf24" : "#ffffff"}
                          strokeWidth={isWinning ? "4" : "2"}
                          className={isWinning ? "animate-pulse-glow" : ""}
                        />
                        <text
                          x={100 + 55 * Math.cos(((startAngle + endAngle) / 2 * Math.PI) / 180)}
                          y={100 + 55 * Math.sin(((startAngle + endAngle) / 2 * Math.PI) / 180)}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="10"
                          fill="white"
                          fontWeight="bold"
                          className="drop-shadow-md"
                        >
                          {segment.length > 8 ? segment.substring(0, 8) + "..." : segment}
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Centro decorativo */}
                  <circle cx="100" cy="100" r="15" fill="url(#centerGradient)" stroke="#ffffff" strokeWidth="3" />
                  <defs>
                    <radialGradient id="centerGradient">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </radialGradient>
                  </defs>
                  
                  {/* Ponteiro melhorado */}
                  <polygon
                    points="100,15 107,35 93,35"
                    fill={element.wheelPointerColor || "#DC2626"}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="drop-shadow-lg"
                  />
                </svg>
              </div>
              
              <div className="w-full space-y-3">
                <button className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all transform hover:scale-105 animate-pulse-glow shadow-xl">
                  🎰 GIRAR ROLETA AGORA
                </button>
                
                {/* 🔥 NOVA FUNCIONALIDADE: Estatísticas dos prêmios */}
                <div className="grid grid-cols-2 gap-2">
                  {wheelSegments.slice(0, 4).map((segment, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-lg border shadow-sm">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
                        style={{backgroundColor: wheelColors[index] || "#e2e8f0"}}
                      ></div>
                      <span className="text-xs font-medium text-gray-700 truncate">{segment}</span>
                      {index === winningSegment && (
                        <span className="text-xs text-yellow-600">👑</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* 🔥 INTEGRAÇÃO: Mostra captura de dados no sistema */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600">💾</span>
                <span className="text-sm font-bold text-blue-800">Integração Automática Ativa</span>
              </div>
              <div className="text-xs text-blue-700 space-y-1">
                <div>• <strong>Campo capturado:</strong> "{element.fieldId || 'premio_roleta'}"</div>
                <div>• <strong>Sistemas integrados:</strong> SMS, Email, WhatsApp, Voz</div>
                <div>• <strong>Resultado:</strong> {wheelSegments[winningSegment]} será salvo automaticamente</div>
              </div>
            </div>
            
            <div className="text-xs text-orange-600 text-center bg-orange-100 p-2 rounded-lg">
              🎯 <strong>Estatísticas:</strong> {wheelSegments.length} segmentos • Vencedor atual: <strong>{wheelSegments[winningSegment]}</strong> • Modo: Interativo
            </div>
          </div>
        );

      case "game_scratch":
        const scratchPrizes = element.scratchPrizes || [
          "10% OFF", "R$ 50 OFF", "FRETE GRÁTIS", "TENTE NOVAMENTE"
        ];
        const winningPrize = scratchPrizes[Math.floor(Math.random() * scratchPrizes.length)];
        
        return (
          <div className="space-y-4 p-4 border-2 border-dashed border-purple-200 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-purple-800">🪙 Raspadinha Premium</span>
              </div>
              {/* 🔥 INTEGRAÇÃO COM SISTEMA */}
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                🎯 Captura Ativa
              </span>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                {/* 🔥 NOVA FUNCIONALIDADE: Raspadinha realística */}
                <div className="w-48 h-32 border-3 border-purple-400 rounded-xl bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 flex items-center justify-center relative overflow-hidden shadow-xl">
                  
                  {/* Camada do prêmio (embaixo) */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-black text-purple-800 drop-shadow-lg">
                        {winningPrize}
                      </div>
                      <div className="text-xs font-bold text-purple-700 mt-1">
                        🎉 PARABÉNS!
                      </div>
                    </div>
                  </div>
                  
                  {/* Camada a ser arranhada (cima) */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white drop-shadow-lg">
                        💰 ARRANHE AQUI
                      </div>
                      <div className="text-xs text-gray-200 mt-1">
                        Clique e arraste para revelar
                      </div>
                    </div>
                  </div>
                  
                  {/* Efeito de brilho */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform skew-x-12 animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* 🔥 NOVA FUNCIONALIDADE: Controles e prêmios possíveis */}
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-bold py-3 px-4 rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
                ✨ ARRANHAR CARTELA
              </button>
              
              {/* Prêmios disponíveis */}
              <div className="bg-white p-3 rounded-xl border shadow-sm">
                <div className="text-xs font-bold text-purple-800 mb-2 text-center">🏆 PRÊMIOS DISPONÍVEIS</div>
                <div className="grid grid-cols-2 gap-2">
                  {scratchPrizes.map((prize, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                      <span className="text-xs">🎁</span>
                      <span className="text-xs font-medium text-purple-700">{prize}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* 🔥 INTEGRAÇÃO: Mostra captura no sistema */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600">💾</span>
                <span className="text-sm font-bold text-green-800">Sistema de Captura Integrado</span>
              </div>
              <div className="text-xs text-green-700 space-y-1">
                <div>• <strong>Campo salvo:</strong> "{element.fieldId || 'premio_raspadinha'}"</div>
                <div>• <strong>Valor capturado:</strong> {winningPrize}</div>
                <div>• <strong>Disponível em:</strong> Campanhas SMS, Email, WhatsApp</div>
              </div>
            </div>
            
            <div className="text-xs text-purple-600 text-center bg-purple-100 p-2 rounded-lg">
              🎮 <strong>Status:</strong> Pronto para arranhar • <strong>Prêmio:</strong> {winningPrize} • <strong>Modo:</strong> Touch/Mouse
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
                    style={{backgroundColor: color}}
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
              <div className="bg-black p-4 rounded-lg" style={{width: '200px', height: '160px'}}>
                {/* Blocos */}
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                  {Array.from({ length: rows * columns }, (_, index) => (
                    <div
                      key={index}
                      className="h-4 rounded-sm"
                      style={{backgroundColor: element.brickColors?.[index % (element.brickColors?.length || 3)] || 
                        (index % 3 === 0 ? '#FF6B6B' : index % 3 === 1 ? '#4ECDC4' : '#45B7D1')}}
                    />
                  ))}
                </div>
                
                {/* Barra */}
                <div 
                  className="mx-auto mt-4 h-2 w-12 rounded-full"
                  style={{backgroundColor: element.paddleColor || '#FFFFFF'}}
                />
                
                {/* Bola */}
                <div 
                  className="w-2 h-2 rounded-full mx-auto mt-2"
                  style={{backgroundColor: element.ballColor || '#FECA57'}}
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
        const symbols = element.slotSymbols || ["🍒", "🍋", "🍊", "🔔", "⭐"];
        const reels = element.slotReels || 3;
        
        return (
          <div className="space-y-3 p-4 border-2 border-dashed border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-800">Caça-Níquel</span>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gradient-to-b from-yellow-300 to-yellow-500 p-4 rounded-lg border-4 border-yellow-600">
                <div className="flex gap-2">
                  {Array.from({ length: reels }, (_, index) => (
                    <div key={index} className="bg-white w-16 h-20 rounded border-2 border-gray-300 flex items-center justify-center">
                      <span className="text-2xl">
                        {symbols[index % symbols.length]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <button className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors">
                🎰 JOGAR
              </button>
              
              <div className="text-xs text-red-600 text-center">
                {reels} rolos • {symbols.length} símbolos • Combinação: {element.slotWinningCombination?.join(" ") || symbols.slice(0, reels).join(" ")}
              </div>
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

        return (
          <div className="space-y-4 p-4 border-2 border-dashed border-green-200 rounded-lg bg-transparent">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Compartilhar Quiz</span>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 space-y-3">
              <div className="text-sm text-gray-700">
                {element.shareMessage || "Faça esse teste e se surpreenda também!"}
              </div>
              
              <div className={`flex ${element.shareLayout === "vertical" ? "flex-col gap-2" : "flex-wrap gap-2"}`}>
                {networks.map((network) => (
                  <button
                    key={network}
                    style={shareButtonStyle}
                    className="flex items-center gap-2 transition-all hover:opacity-80 hover:scale-105"
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
        
        const loaderAnimationClass = animationType === "pulse" ? "animate-pulse" :
                              animationType === "glow" ? "animate-ping" :
                              animationType === "wave" ? "animate-bounce" :
                              animationType === "bounce" ? "animate-bounce" : "animate-pulse";
        
        const speedClass = animationSpeed === "slow" ? "duration-2000" :
                          animationSpeed === "fast" ? "duration-500" : "duration-1000";
        
        return (
          <div className="space-y-2">
            <div 
              className={`w-full h-32 bg-gradient-to-r rounded-lg flex items-center justify-center relative ${loaderAnimationClass} ${speedClass}`}
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
          "Analisando suas respostas...",
          "Calculando percentuais de acertos...", 
          "Identificando padrões comportamentais...",
          "Gerando insights personalizados...",
          "Criando seu relatório final..."
        ];
        
        // 🔥 NOVA FUNCIONALIDADE: Dados visuais reais
        const progressPercentage = 85;
        const scoreData = [75, 88, 92, 67, 81];
        const labels = ["Perfil", "Comportamento", "Preferências", "Objetivos", "Resultados"];
        
        return (
          <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl border-2 border-blue-200 shadow-lg animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-blue-800">📊 Análise de Respostas</span>
              </div>
              {/* 🔥 INTEGRAÇÃO COM SISTEMA */}
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                ✅ Sistema Ativo
              </span>
            </div>
            
            {/* 🔥 NOVA FUNCIONALIDADE: Círculo de progresso com dados reais */}
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                  {/* Círculo de fundo */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  {/* Círculo de progresso com gradiente */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#progressGradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(progressPercentage / 100) * 439.8} 439.8`}
                    className="transition-all duration-2000 ease-out"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-black text-gray-800">{progressPercentage}%</div>
                  <div className="text-sm font-medium text-gray-600">Concluído</div>
                </div>
              </div>
            </div>
            
            {/* 🔥 NOVA FUNCIONALIDADE: Gráfico de barras com dados reais */}
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="text-sm font-bold text-gray-800 mb-3 text-center">📈 Pontuação por Categoria</div>
              <div className="space-y-3">
                {scoreData.map((score, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-20 text-xs font-medium text-gray-700 truncate">{labels[index]}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${score}%` }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-white drop-shadow">{score}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 🔥 NOVA FUNCIONALIDADE: Lista de análise com animações */}
            <div className="space-y-3">
              <div className="text-sm font-bold text-gray-800 text-center">🔍 Etapas da Análise</div>
              {analysisItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-sm text-gray-700 flex-1">{item}</span>
                  <div className="w-8 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"
                      style={{width: '100%'}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 🔥 INTEGRAÇÃO: Mostra captura no sistema */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600">💾</span>
                <span className="text-sm font-bold text-green-800">Análise Integrada ao Sistema</span>
              </div>
              <div className="text-xs text-green-700 space-y-1">
                <div>• <strong>Dados capturados:</strong> {analysisItems.length} etapas processadas</div>
                <div>• <strong>Score final:</strong> {progressPercentage}% de compatibilidade</div>
                <div>• <strong>Uso em:</strong> Campanhas SMS, Email, WhatsApp personalizadas</div>
              </div>
            </div>
            
            <div className="text-xs text-blue-600 text-center bg-blue-100 p-2 rounded-lg">
              📊 <strong>Análise:</strong> {progressPercentage}% concluído • <strong>Categorias:</strong> {scoreData.length} avaliadas • <strong>Status:</strong> Processando em tempo real
            </div>
          </div>
        );
        
      case "body_scan_analyzer":
        // SVG e elementos existentes já implementados em casos anteriores
        return (
          <div className="space-y-4 p-6 bg-gradient-to-br from-teal-50 via-white to-blue-50 rounded-xl border-2 border-teal-200">
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 120 120">
                  {/* Círculo de fundo */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Círculo de progresso */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#14b8a6"
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
                  <span className="text-3xl font-bold text-teal-600">
                    100%
                  </span>
                </div>
              </div>
              
              {/* Título da análise */}
              <h3 className="text-lg font-medium mt-4 text-center text-teal-800">
                Analisando seu corpo...
              </h3>
            </div>
            
            <div className="text-xs text-teal-600 text-center bg-teal-100 p-2 rounded-lg">
              🧬 Análise corporal avançada • Detectando biotipo e características
            </div>
          </div>
        );

      // Novos elementos visuais
      case "chart":
        const chartType = element.chartType || "bar";
        const chartData = element.chartData || [
          { label: "Semana 1", value: 45, color: "#ef4444" },
          { label: "Semana 2", value: 65, color: "#f59e0b" },
          { label: "Semana 3", value: 85, color: "#10b981" },
          { label: "Semana 4", value: 92, color: "#3b82f6" }
        ];
        
        return (
          <div className="space-y-4 p-4 border-2 border-dashed border-blue-200 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-blue-800">📊 Gráfico</span>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                {chartType.toUpperCase()}
              </span>
            </div>
            
            {element.chartTitle && (
              <h3 className="text-lg font-semibold text-gray-800 text-center">
                {element.chartTitle}
              </h3>
            )}
            
            <div className="bg-white rounded-lg p-4 shadow-sm border" style={{ height: "280px" }}>
              <div className="w-full h-full flex items-center justify-center text-center">
                <div className="text-gray-500">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                  <p className="text-sm font-medium">Gráfico {chartType.toUpperCase()}</p>
                  <p className="text-xs text-gray-400 mt-1">Visualização no quiz público</p>
                </div>
              </div>
            </div>
            
            {element.chartDescription && (
              <p className="text-sm text-gray-600 text-center bg-white p-3 rounded-lg border">
                {element.chartDescription}
              </p>
            )}
          </div>
        );

      case "metrics":
        const metricsData = element.metricsData || [
          { label: "Conversões", value: 85, color: "#10b981", icon: "🎯" },
          { label: "Engajamento", value: 72, color: "#3b82f6", icon: "💡" },
          { label: "Retenção", value: 94, color: "#8b5cf6", icon: "🔄" },
          { label: "Vendas", value: 158, color: "#f59e0b", icon: "💰" }
        ];
        
        return (
          <div className="space-y-4 p-4 border-2 border-dashed border-purple-200 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-purple-800">📈 Métricas</span>
              </div>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                TEMPO REAL
              </span>
            </div>
            
            {element.metricsTitle && (
              <h3 className="text-lg font-semibold text-gray-800 text-center">
                {element.metricsTitle}
              </h3>
            )}
            
            <div className="bg-white rounded-lg p-4 shadow-sm border" style={{ height: "280px" }}>
              <div className="w-full h-full flex items-center justify-center text-center">
                <div className="text-gray-500">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                  <p className="text-sm font-medium">Métricas em Tempo Real</p>
                  <p className="text-xs text-gray-400 mt-1">Visualização no quiz público</p>
                </div>
              </div>
            </div>
            
            {element.metricsDescription && (
              <p className="text-sm text-gray-600 text-center bg-white p-3 rounded-lg border">
                {element.metricsDescription}
              </p>
            )}
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
        // Dados para gráfico antes/depois
        const beforeAfterData = element.beforeAfterData || [
          { label: "Antes", value: element.beforeValue || 25, color: element.beforeColor || "#ef4444" },
          { label: "Depois", value: element.afterValue || 85, color: element.afterColor || "#10b981" }
        ];

        return (
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            {element.beforeAfterTitle && (
              <h3 className="text-lg font-bold text-center mb-4" style={{ color: element.titleColor || '#1f2937' }}>
                {element.beforeAfterTitle}
              </h3>
            )}
            
            {element.beforeAfterDisplayType === 'chart' ? (
              <div className="w-full h-64">
                <Chart
                  type={element.beforeAfterChartType || 'bar'}
                  data={beforeAfterData}
                  title={element.beforeAfterTitle}
                  showLegend={element.beforeAfterShowLegend !== false}
                  backgroundColor={element.beforeAfterChartBg || '#3b82f6'}
                  borderColor={element.beforeAfterChartBorder || '#1d4ed8'}
                  height={250}
                />
              </div>
            ) : element.beforeAfterDisplayType === 'metrics' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-6 rounded-lg" style={{ backgroundColor: element.beforeColor || '#fef2f2' }}>
                  <div className="text-4xl font-bold mb-2" style={{ color: element.beforeColor || '#dc2626' }}>
                    {element.beforeValue || 25}
                    {element.beforeAfterShowPercent && '%'}
                  </div>
                  <h4 className="text-lg font-semibold mb-1" style={{ color: element.beforeColor || '#dc2626' }}>
                    {element.beforeAfterLabels?.before || "ANTES"}
                  </h4>
                  <p className="text-sm opacity-80">{element.beforeDescription || "Situação anterior"}</p>
                </div>
                
                <div className="text-center p-6 rounded-lg" style={{ backgroundColor: element.afterColor || '#f0fdf4' }}>
                  <div className="text-4xl font-bold mb-2" style={{ color: element.afterColor || '#16a34a' }}>
                    {element.afterValue || 85}
                    {element.beforeAfterShowPercent && '%'}
                  </div>
                  <h4 className="text-lg font-semibold mb-1" style={{ color: element.afterColor || '#16a34a' }}>
                    {element.beforeAfterLabels?.after || "DEPOIS"}
                  </h4>
                  <p className="text-sm opacity-80">{element.afterDescription || "Resultado alcançado"}</p>
                </div>
              </div>
            ) : (
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
                      <p className="text-sm opacity-90">{element.beforeDescription || "Situação anterior"}</p>
                    </div>
                  </div>
                  
                  <div className="w-1/2 bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-6xl mb-2">😊</div>
                      <h3 className="text-xl font-bold">
                        {element.beforeAfterLabels?.after || "DEPOIS"}
                      </h3>
                      <p className="text-sm opacity-90">{element.afterDescription || "Resultado alcançado"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-white shadow-lg">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-300">
                    <ArrowLeftRight className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>
            )}
            
            {element.beforeAfterDisplayType !== 'visual' && (
              <div className="text-center text-sm text-gray-600">
                {element.beforeAfterDescription || "Comparação entre antes e depois"}
              </div>
            )}
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

        // Aplicar configurações de estilo
        const faqStyle = element.faqStyle || "accordion";
        const faqWidth = element.faqWidth || 100;
        const faqTitleSize = element.faqTitleSize || "base";
        const faqTitleWeight = element.faqTitleWeight || "medium";
        const faqTitleAlign = element.faqTitleAlign || "left";
        const faqBackgroundColor = element.faqBackgroundColor || "#ffffff";
        const faqHeaderColor = element.faqHeaderColor || "#111827";
        const faqTextColor = element.faqTextColor || "#374151";
        const faqBorderColor = element.faqBorderColor || "#e5e7eb";

        // Classes de tamanho de fonte
        const titleSizeClass = {
          xs: "text-xs",
          sm: "text-sm", 
          base: "text-base",
          lg: "text-lg",
          xl: "text-xl",
          "2xl": "text-2xl"
        }[faqTitleSize];

        // Classes de peso de fonte
        const titleWeightClass = {
          normal: "font-normal",
          medium: "font-medium",
          semibold: "font-semibold",
          bold: "font-bold"
        }[faqTitleWeight];

        // Classes de alinhamento
        const titleAlignClass = {
          left: "text-left",
          center: "text-center",
          right: "text-right"
        }[faqTitleAlign];

        // Estilo do container
        const containerStyle = {
          width: `${faqWidth}%`,
          backgroundColor: faqBackgroundColor === "transparent" ? "transparent" : faqBackgroundColor
        };

        // Estilo da borda
        const borderStyle = {
          borderColor: faqBorderColor
        };

        // Estilo do título
        const faqTitleStyle = {
          color: faqHeaderColor
        };

        // Estilo do texto
        const faqTextStyle = {
          color: faqTextColor
        };
        
        return (
          <div 
            className="space-y-4 p-4 border rounded-lg"
            style={containerStyle}
          >
            <div className="space-y-3">
              {faqData.map((faq, index) => (
                <div key={faq.id} className="border rounded-lg" style={borderStyle}>
                  <button className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <span 
                      className={`${titleSizeClass} ${titleWeightClass} ${titleAlignClass}`}
                      style={faqTitleStyle}
                    >
                      {faq.question}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" />
                  </button>
                  
                  <div 
                    className="px-4 pb-3 text-sm border-t border-gray-100"
                    style={faqTextStyle}
                  >
                    {faq.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "image_carousel":
        const carouselImages = element.carouselImages || [
          { id: "img-1", url: "https://via.placeholder.com/600x300/10b981/white?text=Imagem+1", alt: "Imagem 1", caption: "Primeira imagem do carrossel", title: "Título da Imagem 1" },
          { id: "img-2", url: "https://via.placeholder.com/600x300/3b82f6/white?text=Imagem+2", alt: "Imagem 2", caption: "Segunda imagem do carrossel", title: "Título da Imagem 2" },
          { id: "img-3", url: "https://via.placeholder.com/600x300/8b5cf6/white?text=Imagem+3", alt: "Imagem 3", caption: "Terceira imagem do carrossel", title: "Título da Imagem 3" }
        ];

        // Configurações do carrossel com valores padrão
        const carouselAutoplay = element.carouselAutoplay ?? true;
        const carouselSpeed = element.carouselSpeed || 3000;
        const carouselShowDots = element.carouselShowDots ?? true;
        const carouselShowArrows = element.carouselShowArrows ?? true;
        const carouselInfinite = element.carouselInfinite ?? true;
        const carouselSlidesToShow = element.carouselSlidesToShow || 1;
        const carouselEffect = element.carouselEffect || "slide";
        const carouselArrowStyle = element.carouselArrowStyle || "rounded";
        const carouselDotStyle = element.carouselDotStyle || "dots";
        const carouselBorderRadius = element.carouselBorderRadius || "8px";
        const carouselImageFit = element.carouselImageFit || "cover";
        const carouselHeight = element.carouselHeight || "300px";
        const carouselWidth = element.carouselWidth || 100;

        // Estilos dinâmicos baseados nas configurações
        const carouselContainerStyle = {
          width: `${Math.min(Math.max(carouselWidth, 10), 100)}%`,
          borderRadius: carouselBorderRadius
        };

        const imageStyle = {
          height: carouselHeight,
          objectFit: carouselImageFit as any,
          borderRadius: carouselBorderRadius
        };

        // Estilos das setas baseados na configuração
        const arrowBaseClass = "absolute top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 transition-all duration-200 shadow-lg z-10";
        const arrowStyleClass = carouselArrowStyle === "simple" ? "p-1" :
                               carouselArrowStyle === "rounded" ? "p-2 rounded-full" :
                               "p-2 rounded-md";

        // Estilos dos dots baseados na configuração
        const dotBaseClass = "transition-all duration-200 cursor-pointer";
        const dotStyleClass = carouselDotStyle === "dots" ? "w-3 h-3 rounded-full" :
                             carouselDotStyle === "lines" ? "w-8 h-1 rounded-full" :
                             "w-3 h-3 rounded-sm";

        // Simulação de estado atual do slide (no preview sempre mostra o primeiro)
        const currentSlide = 0;

        return (
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white" style={carouselContainerStyle}>
            {/* Título do carrossel */}
            {element.carouselTitle && (
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">
                {element.carouselTitle}
              </h3>
            )}

            <div className="relative overflow-hidden" style={{ borderRadius: carouselBorderRadius }}>
              {/* Container das imagens */}
              <div 
                className={`flex transition-all duration-500 ${
                  carouselEffect === "fade" ? "absolute" : 
                  carouselEffect === "cube" ? "transform-gpu perspective-1000" :
                  carouselEffect === "coverflow" ? "transform-gpu" : ""
                }`}
                style={{
                  transform: carouselEffect === "slide" ? `translateX(-${currentSlide * (100 / carouselSlidesToShow)}%)` : 'none'
                }}
              >
                {carouselImages.map((image, index) => (
                  <div 
                    key={image.id}
                    className={`relative flex-shrink-0 ${
                      carouselEffect === "fade" && index !== currentSlide ? "opacity-0" : "opacity-100"
                    }`}
                    style={{ 
                      width: `${100 / carouselSlidesToShow}%`,
                      transform: carouselEffect === "cube" ? `rotateY(${(index - currentSlide) * 90}deg) translateZ(150px)` :
                               carouselEffect === "coverflow" ? `rotateY(${(index - currentSlide) * 45}deg) translateZ(${index === currentSlide ? 0 : -100}px)` :
                               'none'
                    }}
                  >
                    <img 
                      src={image.url} 
                      alt={image.alt}
                      className="w-full transition-transform duration-300 hover:scale-105"
                      style={imageStyle}
                    />
                    
                    {/* Overlay com título e caption */}
                    {(image.title || image.caption) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent to-transparent p-4">
                        {image.title && (
                          <h4 className="text-white font-semibold text-lg mb-1">
                            {image.title}
                          </h4>
                        )}
                        {image.caption && (
                          <p className="text-white text-sm opacity-90">
                            {image.caption}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Indicador de slide atual */}
                    {index === currentSlide && (
                      <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        {index + 1} / {carouselImages.length}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Setas de navegação */}
              {carouselShowArrows && carouselImages.length > 1 && (
                <>
                  <button className={`${arrowBaseClass} ${arrowStyleClass} left-3`}>
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button className={`${arrowBaseClass} ${arrowStyleClass} right-3`}>
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}

              {/* Controles de autoplay */}
              {carouselAutoplay && (
                <div className="absolute top-3 left-3 flex space-x-1">
                  <button className="bg-black bg-opacity-50 text-white p-1 rounded hover:bg-opacity-70 transition-opacity">
                    <Play className="w-3 h-3" />
                  </button>
                  <button className="bg-black bg-opacity-50 text-white p-1 rounded hover:bg-opacity-70 transition-opacity">
                    <Pause className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Indicadores (dots) */}
            {carouselShowDots && carouselImages.length > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                {carouselImages.map((_, index) => (
                  <button 
                    key={index}
                    className={`${dotBaseClass} ${dotStyleClass} ${
                      index === currentSlide 
                        ? 'bg-blue-500' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Thumbnail navigation (opcional) */}
            {element.carouselShowThumbnails && carouselImages.length > 1 && (
              <div className="flex justify-center space-x-2 mt-3 overflow-x-auto pb-2">
                {carouselImages.map((image, index) => (
                  <button 
                    key={index}
                    className={`flex-shrink-0 relative overflow-hidden rounded transition-all duration-200 ${
                      index === currentSlide 
                        ? 'ring-2 ring-blue-500 opacity-100' 
                        : 'opacity-60 hover:opacity-80'
                    }`}
                  >
                    <img 
                      src={image.url} 
                      alt={image.alt}
                      className="w-16 h-10 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Progress bar para autoplay */}
            {carouselAutoplay && element.carouselShowProgress && (
              <div className="w-full bg-gray-200 rounded-full h-1 mt-3">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-100"
                  style={{ width: `${((Date.now() % carouselSpeed) / carouselSpeed) * 100}%` }}
                />
              </div>
            )}

            {/* Informações adicionais */}
            <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
              <span>{carouselImages.length} imagens</span>
              {carouselAutoplay && (
                <span className="flex items-center space-x-1">
                  <Play className="w-3 h-3" />
                  <span>Auto: {carouselSpeed/1000}s</span>
                </span>
              )}
              <span>Efeito: {carouselEffect}</span>
            </div>
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
                style={{backgroundColor: element.iconListBackgroundColor || "#f8fafc"}}
              >
                <div className="flex-shrink-0">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{backgroundColor: item.iconColor || "#10b981"}}
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

        // Aplicar configurações de estilo do elemento
        const testimonialsLayout = element.testimonialsLayout || "vertical";
        const testimonialsColumns = element.testimonialsColumns || 1;
        const testimonialsBackgroundColor = element.testimonialsBackgroundColor || "#ffffff";
        const testimonialsTextColor = element.testimonialsTextColor || "#374151";
        const testimonialsNameColor = element.testimonialsNameColor || "#111827";
        const testimonialsShowStars = element.testimonialsShowStars !== false;
        const testimonialsShowPhotos = element.testimonialsShowPhotos !== false;
        const testimonialsShowShadow = element.testimonialsShowShadow !== false;
        const testimonialsTitle = element.testimonialsTitle || "Avaliações de clientes";
        const testimonialsTitleSize = element.testimonialsTitleSize || "lg";
        const testimonialsWidth = element.testimonialsWidth || 100;

        // Classes de tamanho do título
        const titleSizeClasses = {
          xs: "text-xs",
          sm: "text-sm", 
          base: "text-base",
          lg: "text-lg",
          xl: "text-xl",
          "2xl": "text-2xl"
        };

        return (
          <div 
            className="p-4"
            style={{ width: `${testimonialsWidth}%` }}
          >
            {testimonialsTitle && (
              <h3 
                className={`${titleSizeClasses[testimonialsTitleSize]} font-semibold mb-4`}
                style={{ color: testimonialsNameColor }}
              >
                {testimonialsTitle}
              </h3>
            )}
            <div className={`
              ${testimonialsLayout === "grid" ? `grid grid-cols-${testimonialsColumns} gap-4` : "space-y-4"}
            `}>
              {testimonialsData.map((testimonial) => (
                <div 
                  key={testimonial.id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    testimonialsShowShadow ? "shadow-sm hover:shadow-md" : ""
                  }`}
                  style={{ backgroundColor: testimonialsBackgroundColor }}
                >
                  <div className="flex items-start gap-3">
                    {testimonialsShowPhotos && (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                        <img 
                          src={testimonial.avatar} 
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span 
                          className="font-medium"
                          style={{ color: testimonialsNameColor }}
                        >
                          {testimonial.name}
                        </span>
                        {testimonialsShowStars && (
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <p 
                        className="text-sm leading-relaxed"
                        style={{ color: testimonialsTextColor }}
                      >
                        {testimonial.testimonial}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "guarantee":
        const guaranteeTitle = element.guaranteeTitle || "Garantia de 30 dias";
        const guaranteeDescription = element.guaranteeDescription || "Se você não ficar satisfeito, devolvemos seu dinheiro";
        const guaranteeButtonText = element.guaranteeButtonText || "";
        const guaranteeIcon = element.guaranteeIcon || "Shield";
        const guaranteeBackgroundColor = element.guaranteeBackgroundColor || "transparent";
        const guaranteeTextColor = element.guaranteeTextColor || "#374151";
        const guaranteeTitleColor = element.guaranteeTitleColor || "#111827";
        const guaranteeIconColor = element.guaranteeIconColor || "#10b981";
        const guaranteeLayout = element.guaranteeLayout || "horizontal";
        const guaranteeStyle = element.guaranteeStyle || "card";
        const guaranteeTitleSize = element.guaranteeTitleSize || "lg";
        const guaranteeTitleWeight = element.guaranteeTitleWeight || "semibold";
        const guaranteeTitleAlign = element.guaranteeTitleAlign || "left";
        const guaranteeWidth = element.guaranteeWidth || 100;
        
        // Ícone dinâmico
        const IconComponent = guaranteeIcon === "Shield" ? Shield :
                             guaranteeIcon === "CheckCircle" ? CheckCircle :
                             guaranteeIcon === "Award" ? Award :
                             guaranteeIcon === "Star" ? Star :
                             guaranteeIcon === "Heart" ? Heart :
                             guaranteeIcon === "Lock" ? Lock :
                             guaranteeIcon === "Zap" ? Zap :
                             guaranteeIcon === "Trophy" ? Trophy :
                             guaranteeIcon === "Gift" ? Gift : Shield;
        
        // Estilos do título
        const titleStyle = {
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
                  <IconComponent className="w-6 h-6" style={{ color: guaranteeIconColor }} />
                </div>
                <div className="flex-1">
                  <h3 style={titleStyle}>{guaranteeTitle}</h3>
                  <p className="mt-1" style={{ color: guaranteeTextColor }}>{guaranteeDescription}</p>
                  {element.guaranteeFeatures && (
                    <ul className="mt-3 space-y-1">
                      {element.guaranteeFeatures.map((feature, index) => (
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
                  style={{backgroundColor: element.imageWithTextTextBackground || "rgba(0,0,0,0.5)"}}
                >
                  <div 
                    className="font-medium"
                    style={{color: element.imageWithTextTextColor || "#ffffff",
                      fontSize: element.imageWithTextTextSize === "large" ? "1.25rem" : "1rem"}}
                  >
                    {imageText}
                  </div>
                </div>
              )}
            </div>
            
            {!textPosition.includes("overlay") && (
              <div 
                className={`p-3 text-center ${textPosition === "top" ? "order-first" : ""}`}
                style={{backgroundColor: element.imageWithTextTextBackground || "transparent",
                  color: element.imageWithTextTextColor || "#374151"}}
              >
                <div 
                  className="font-medium"
                  style={{fontSize: element.imageWithTextTextSize === "large" ? "1.25rem" : "1rem"}}
                >
                  {imageText}
                </div>
              </div>
            )}
          </div>
        );

      case "loading_question":
        const loadingMessage = element.loadingText;
        const loadingDuration = element.loadingDuration || 3;
        const showProgressPercentage = element.showPercentage !== false;
        const enableShineEffect = element.enableShine || false;
        const enableStripesEffect = element.enableStripes || false;
        const showRemainingTimeText = element.showRemainingTime || false;
        const progressBarText = element.progressText || "Carregando...";
        const popupQuestionColor = element.popupQuestionColor || "#1F2937";
        
        return (
          <div className="space-y-4 py-6 px-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            {loadingMessage && (
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{loadingMessage}</h3>
              </div>
            )}
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">Tempo: {loadingDuration}s</p>
            </div>
            
            {/* Barra de progresso aprimorada */}
            <div className="space-y-2">
              <div className="text-center text-sm text-gray-600 mb-2">
                {progressBarText}
              </div>
              <div 
                className="w-full rounded-full relative overflow-hidden"
                style={{ 
                  backgroundColor: element.loadingBarBackgroundColor || "#E5E7EB",
                  height: `${element.loadingBarHeight || 8}px`
                }}
              >
                <div 
                  className={`rounded-full transition-all duration-500 relative ${
                    enableShineEffect ? 'animate-pulse' : ''
                  }`}
                  style={{ 
                    width: "75%", 
                    height: `${element.loadingBarHeight || 8}px`,
                    backgroundColor: element.loadingBarColor || "#10B981",
                    backgroundImage: enableStripesEffect ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' : 'none'
                  }}
                >
                  {enableShineEffect && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                {showProgressPercentage && <span>75%</span>}
                {showRemainingTimeText && <span>Tempo restante: {loadingDuration - 2}s</span>}
              </div>
            </div>
            
            {/* Popup de pergunta com cor customizada */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h4 
                className="text-base font-medium mb-3 text-center"
                style={{ color: popupQuestionColor }}
              >
                {element.popupQuestion || "Você gostaria de continuar?"}
              </h4>
              <div className="flex gap-3 justify-center">
                <button 
                  className="px-4 py-2 rounded border transition-colors"
                  style={{
                    backgroundColor: element.yesButtonBgColor || "transparent",
                    color: element.yesButtonTextColor || "#000000",
                    borderColor: element.yesButtonTextColor || "#000000"
                  }}
                >
                  {element.popupYesText || "Sim"}
                </button>
                <button 
                  className="px-4 py-2 rounded border transition-colors"
                  style={{
                    backgroundColor: element.noButtonBgColor || "transparent",
                    color: element.noButtonTextColor || "#000000",
                    borderColor: element.noButtonTextColor || "#000000"
                  }}
                >
                  {element.popupNoText || "Não"}
                </button>
              </div>
            </div>
          </div>
        );

      case "progress_bar":
        const progressStyle = element.progressStyle || "striped";
        const progressColor = element.progressColor || "#FCBC51";
        const progressBg = element.progressBackgroundColor || "#2c303a";
        const progressHeight = element.progressHeight || 18;
        const progressRadius = element.progressBorderRadius || 6;
        const progressWidth = element.progressWidth || 75;
        const showPercentage = element.showPercentage !== false;
        const animationDuration = element.animationDuration || 6;
        const progressTitle = element.progressTitle || "Progresso";
        
        const getProgressBarStyle = () => {
          const baseStyle = {
            height: `${progressHeight}px`,
            borderRadius: `${progressRadius}px`,
            transition: `${animationDuration}s linear`,
            width: `${progressWidth}%`
          };
          
          if (progressStyle === "striped") {
            return {
              ...baseStyle,
              backgroundColor: progressColor,
              backgroundImage: `linear-gradient(45deg, ${progressColor} 25%, transparent 25%, transparent 50%, ${progressColor} 50%, ${progressColor} 75%, transparent 75%, transparent)`,
              backgroundSize: "20px 20px",
              animation: `progressStriped ${animationDuration}s linear infinite`
            };
          } else if (progressStyle === "rounded") {
            return {
              ...baseStyle,
              borderRadius: "30px",
              backgroundColor: progressColor,
              backgroundImage: "linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05))"
            };
          } else if (progressStyle === "rainbow") {
            return {
              ...baseStyle,
              width: "100%",
              backgroundImage: "linear-gradient(to right, #4cd964, #5ac8fa, #007aff, #7DC8E8, #5856d6, #ff2d55)",
              animation: `rainbowAnimation 1s infinite`
            };
          }
          
          return baseStyle;
        };
        
        return (
          <div className="space-y-4 py-6 px-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{progressTitle}</h3>
              {showPercentage && (
                <p className="text-sm text-gray-600">{progressWidth}%</p>
              )}
            </div>
            
            <div className="relative">
              <div 
                className="progress-container"
                style={{
                  padding: "6px",
                  backgroundColor: progressBg,
                  borderRadius: `${progressRadius}px`,
                  boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.25), 0 1px rgba(255, 255, 255, 0.08)"
                }}
              >
                <div 
                  className="progress-bar-element"
                  style={getProgressBarStyle()}
                />
              </div>
            </div>
            
            <style jsx>{`
              @keyframes progressStriped {
                0% { background-position: 0 0; }
                100% { background-position: 20px 0; }
              }
              
              @keyframes rainbowAnimation {
                0% { background-image: linear-gradient(to right, #4cd964, #5ac8fa, #007aff, #7DC8E8, #5856d6, #ff2d55); }
                20% { background-image: linear-gradient(to right, #5ac8fa, #007aff, #7DC8E8, #5856d6, #ff2d55, #4cd964); }
                40% { background-image: linear-gradient(to right, #007aff, #7DC8E8, #5856d6, #ff2d55, #4cd964, #5ac8fa); }
                60% { background-image: linear-gradient(to right, #7DC8E8, #5856d6, #ff2d55, #4cd964, #5ac8fa, #007aff); }
                100% { background-image: linear-gradient(to right, #5856d6, #ff2d55, #4cd964, #5ac8fa, #007aff, #7DC8E8); }
              }
            `}</style>
          </div>
        );

      // 🚀 NOVA FUNCIONALIDADE: Elementos de classificação ultra personalizados
      case "body_type_classifier":
      case "age_classifier":
      case "fitness_goal_classifier":
      case "experience_classifier":
        const classifierTitle = element.classifierTitle || "Faça sua seleção";
        const classifierDescription = element.classifierDescription || "Escolha a opção que melhor se aplica ao seu perfil";
        const classifierOptions = element.classifierOptions || [];
        
        return (
          <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-xl border-2 border-purple-200 shadow-lg">
            {/* 🔥 CABEÇALHO ULTRA PERSONALIZAÇÃO */}
            <div className="text-center">
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold rounded-full">
                  🚀 ULTRA PERSONALIZAÇÃO
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{classifierTitle}</h3>
              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">{classifierDescription}</p>
            </div>
            
            {/* 🔥 OPÇÕES ULTRA AVANÇADAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classifierOptions.map((option, index) => (
                <div 
                  key={option.id}
                  className="group relative bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105"
                  style={{ borderColor: option.color ? `${option.color}20` : undefined }}
                >
                  {/* 🔥 INTEGRAÇÃO: Indicador de campanha ativa */}
                  <div className="absolute top-3 right-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white shadow-sm"></div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    {/* 🔥 ÍCONE PERSONALIZADO */}
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl shadow-sm border-2"
                      style={{ 
                        backgroundColor: option.color ? `${option.color}15` : "#f3f4f6",
                        borderColor: option.color || "#e5e7eb"
                      }}
                    >
                      {option.icon || "📋"}
                    </div>
                    
                    <div className="flex-1">
                      {/* 🔥 TÍTULO DA OPÇÃO */}
                      <h4 
                        className="text-lg font-bold mb-2"
                        style={{color: option.color || "#374151"}}
                      >
                        {option.label}
                      </h4>
                      
                      {/* 🔥 DESCRIÇÃO DETALHADA */}
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {option.description}
                      </p>
                      
                      {/* 🔥 INTEGRAÇÃO: Preview da mensagem personalizada */}
                      {option.campaignTrigger && (
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-purple-700 mb-2">
                            📱 Mensagens personalizadas que serão enviadas:
                          </div>
                          
                          {/* SMS Preview */}
                          {option.campaignTrigger.sms && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-green-600">📱</span>
                                <span className="text-xs font-bold text-green-800">SMS:</span>
                              </div>
                              <p className="text-xs text-green-700 leading-relaxed">
                                {option.campaignTrigger.sms.replace('{nome_completo}', 'João Silva')}
                              </p>
                            </div>
                          )}
                          
                          {/* Email Preview */}
                          {option.campaignTrigger.email && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-blue-600">📧</span>
                                <span className="text-xs font-bold text-blue-800">Email:</span>
                              </div>
                              <p className="text-xs text-blue-700 leading-relaxed">
                                {option.campaignTrigger.email}
                              </p>
                            </div>
                          )}
                          
                          {/* WhatsApp Preview */}
                          {option.campaignTrigger.whatsapp && (
                            <div className="bg-gradient-to-r from-green-50 to-lime-50 p-3 rounded-lg border border-lime-200">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lime-600">💬</span>
                                <span className="text-xs font-bold text-lime-800">WhatsApp:</span>
                              </div>
                              <p className="text-xs text-lime-700 leading-relaxed">
                                {option.campaignTrigger.whatsapp.replace('{nome_completo}', 'João Silva')}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 🔥 BOTÃO DE SELEÇÃO */}
                  <div className="mt-4">
                    <button 
                      className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                      style={{backgroundColor: option.color || "#8b5cf6",
                        color: "white"}}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Selecionar {option.label}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 🔥 INTEGRAÇÃO: Informações do sistema */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-600">🤖</span>
                <span className="text-sm font-bold text-purple-800">Sistema Ultra Personalizado Ativo</span>
              </div>
              <div className="text-xs text-purple-700 space-y-1">
                <div>• <strong>Classificação:</strong> {getElementTypeName(element.type)}</div>
                <div>• <strong>Campanhas:</strong> SMS, Email e WhatsApp automáticas baseadas na seleção</div>
                <div>• <strong>Personalização:</strong> Mensagens específicas para cada perfil identificado</div>
                <div>• <strong>Field ID:</strong> {element.fieldId || 'campo_personalizado'} (usado para campanhas)</div>
              </div>
            </div>
            
            <div className="text-xs text-center bg-gradient-to-r from-purple-100 to-blue-100 p-3 rounded-lg text-purple-700">
              🚀 <strong>Ultra Personalização:</strong> Cada seleção gera campanhas específicas • <strong>Integração total:</strong> SMS + Email + WhatsApp • <strong>Automação:</strong> 100% baseada na resposta
            </div>
          </div>
        );



      case "loading_with_question":
        return (
          <div className="w-full space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
            {/* Fase 1: Carregamento */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {element.loadingText && (
                  <h4 className="font-semibold text-gray-800">
                    {element.loadingText}
                  </h4>
                )}
                {element.loadingShowPercentage && (
                  <span className="text-sm font-mono text-gray-600">0%</span>
                )}
              </div>
              
              <div className="w-full bg-gray-200 rounded-full" style={{ height: element.loadingHeight || 8 }}>
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: "0%",
                    backgroundColor: element.loadingColor || "#3b82f6",
                    borderRadius: element.loadingStyle === "squared" ? "0" : 
                                 element.loadingStyle === "pill" ? "50px" : "4px"
                  }}
                />
              </div>
            </div>
            
            {/* Fase 2: Pergunta (mostrada após carregamento) */}
            <div className="border-t pt-4 space-y-3 opacity-50">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {element.questionTitle || "Pergunta Personalizada"}
                </h3>
                {element.questionDescription && (
                  <p className="text-sm text-gray-600 mb-4">
                    {element.questionDescription}
                  </p>
                )}
              </div>
              
              <div className="flex gap-3 justify-center">
                <button 
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  disabled
                >
                  {element.yesButtonText || "Sim"}
                </button>
                <button 
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  disabled
                >
                  {element.noButtonText || "Não"}
                </button>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              Carregamento: {element.loadingDuration || 3}s • Pergunta aparece após 100%
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs bg-purple-50 p-2 rounded border border-purple-200">
              <Timer className="w-4 h-4 text-purple-600" />
              <span className="text-purple-700">
                <strong>Carregamento + Pergunta:</strong> Barra animada → Pergunta Sim/Não
              </span>
            </div>
          </div>
        );

      case "netflix_intro":
        return (
          <div className="space-y-4 p-4 border-2 border-dashed border-red-200 rounded-lg bg-gradient-to-br from-red-50 to-black animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-600" />
                <span className="font-bold text-red-800">🎬 Netflix Intro</span>
              </div>
              <span className="text-xs bg-black text-red-500 px-2 py-1 rounded-full font-medium">
                ⚡ Transição
              </span>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                {/* Preview da animação Netflix */}
                <div className="w-64 h-40 bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
                  
                  {/* Simulação do logo Netflix */}
                  <div className="text-center">
                    <div className="text-4xl font-black text-red-600 tracking-wider mb-2">
                      {element.netflixLetters?.split('-').join('') || 'NETFLIX'}
                    </div>
                    <div className="text-xs text-gray-400">
                      Animação: {element.netflixAnimationSpeed || 'normal'}
                    </div>
                  </div>
                  
                  {/* Efeitos visuais simulados */}
                  <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full opacity-20">
                      {/* Simulação das luzes coloridas */}
                      <div className="absolute top-1/4 left-1/4 w-2 h-8 bg-red-500 opacity-60"></div>
                      <div className="absolute top-1/3 left-1/2 w-2 h-6 bg-yellow-500 opacity-60"></div>
                      <div className="absolute top-1/2 left-3/4 w-2 h-4 bg-blue-500 opacity-60"></div>
                      <div className="absolute bottom-1/4 left-1/3 w-2 h-5 bg-green-500 opacity-60"></div>
                    </div>
                  </div>
                  
                  {/* Brilho central */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-10 transform skew-x-12 animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-black p-3 rounded-xl border border-red-800 text-red-400">
                <div className="text-xs font-bold mb-2 text-center">🎭 CONFIGURAÇÕES DA ANIMAÇÃO</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>• <strong>Duração:</strong> {element.netflixDuration || 4}s</div>
                  <div>• <strong>Tela cheia:</strong> {element.netflixFullscreen ? 'Sim' : 'Não'}</div>
                  <div>• <strong>Título:</strong> {element.netflixShowTitle ? 'Visível' : 'Oculto'}</div>
                  <div>• <strong>Avanço:</strong> {element.netflixAutoAdvance ? 'Auto' : 'Manual'}</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-900 to-black p-3 rounded-xl border border-red-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-400">🎬</span>
                  <span className="text-sm font-bold text-red-300">Netflix Intro Autêntico</span>
                </div>
                <div className="text-xs text-red-200 space-y-1">
                  <div>• <strong>Animação:</strong> Zoom + Brush Effects + Luzes coloridas</div>
                  <div>• <strong>Letras:</strong> {element.netflixLetters || 'N-E-T-F-L-I-X'}</div>
                  <div>• <strong>Qualidade:</strong> Fidelidade total ao original</div>
                  <div>• <strong>Uso:</strong> Ideal para transições impactantes</div>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-red-700 text-center bg-red-100 p-2 rounded-lg">
              🎥 <strong>Status:</strong> Animação Netflix completa • <strong>Duração:</strong> {element.netflixDuration || 4}s • <strong>Modo:</strong> Transição cinematográfica
            </div>
          </div>
        );

      case "spacer":
        const spacerSize = element.spacerSize || "medium";
        const customSize = element.customSpacerSize || "2rem";
        
        // Mapeamento responsivo dos tamanhos de spacer
        const spacerSizeMap = {
          small: "1rem",
          medium: "2rem", 
          large: "4rem"
        };
        
        // Usar tamanho personalizado se definido e maior que 0.5rem
        const finalSize = spacerSize === "custom" && customSize ? customSize : spacerSizeMap[spacerSize];
        
        return (
          <div 
            className="w-full"
            style={{ 
              height: finalSize,
              minHeight: "0.5rem",
              maxHeight: "10rem"
            }}
            aria-hidden="true"
          >
            {/* Indicador visual apenas no editor */}
            <div className="w-full h-full border-2 border-dashed border-gray-200 bg-gray-50 rounded-lg flex items-center justify-center opacity-40 hover:opacity-60 transition-opacity">
              <span className="text-xs text-gray-400 font-mono">
                Espaçador ({finalSize})
              </span>
            </div>
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
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicatePage(index);
                      }}
                      title="Duplicar página"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    {pages.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePage(index);
                        }}
                        title="Deletar página"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PRIMEIRO: Seções Compactas e Expansíveis - Fundo Global e Cor Botão Global */}
          <div className="space-y-2 pt-4 border-t">
            {/* Fundo Global - PRIMEIRO */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSections(prev => ({
                  ...prev,
                  globalBackground: !prev.globalBackground
                }))}
                className="w-full p-2 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{backgroundColor: globalTheme === "custom" ? customBackgroundColor : globalTheme === "dark" ? "#000000" : "#ffffff"}}
                  ></div>
                  <span className="text-xs font-semibold">🎨 Fundo Global</span>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform",
                  expandedSections.globalBackground && "rotate-180"
                )} />
              </button>
              
              {expandedSections.globalBackground && (
                <div className="p-3 border-t bg-white space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={globalTheme === "custom" ? customBackgroundColor : globalTheme === "dark" ? "#000000" : "#ffffff"}
                      onChange={(e) => {
                        setGlobalTheme("custom");
                        setCustomBackgroundColor(e.target.value);
                        onThemeChange?.("custom", e.target.value);
                      }}
                      className="w-6 h-6 rounded-full border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={globalTheme === "custom" ? customBackgroundColor : globalTheme === "dark" ? "#000000" : "#ffffff"}
                      onChange={(e) => {
                        setGlobalTheme("custom");
                        setCustomBackgroundColor(e.target.value);
                        onThemeChange?.("custom", e.target.value);
                      }}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                      placeholder="#ffffff"
                    />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setGlobalTheme("light");
                        onThemeChange?.("light", "#ffffff");
                      }}
                      className={cn(
                        "flex-1 p-1 text-xs rounded border",
                        globalTheme === "light" ? "bg-primary-100 border-primary-300" : "bg-gray-50 border-gray-200"
                      )}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => {
                        setGlobalTheme("dark");
                        onThemeChange?.("dark", "#000000");
                      }}
                      className={cn(
                        "flex-1 p-1 text-xs rounded border",
                        globalTheme === "dark" ? "bg-primary-100 border-primary-300" : "bg-gray-50 border-gray-200"
                      )}
                    >
                      Dark
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cor Botão Global - SEGUNDO */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSections(prev => ({
                  ...prev,
                  buttonColors: !prev.buttonColors
                }))}
                className="w-full p-2 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{backgroundColor: defaultButtonColor}}
                  ></div>
                  <span className="text-xs font-semibold">🔘 Cor Botão Global</span>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform",
                  expandedSections.buttonColors && "rotate-180"
                )} />
              </button>
              
              {expandedSections.buttonColors && (
                <div className="p-3 border-t bg-white space-y-3">
                  {/* Cor de Fundo */}
                  <div>
                    <label className="text-xs font-medium mb-1 block">Fundo</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={defaultButtonColor}
                        onChange={(e) => onDefaultButtonColorChange?.(e.target.value)}
                        className="w-6 h-6 rounded-full border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={defaultButtonColor}
                        onChange={(e) => onDefaultButtonColorChange?.(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                        placeholder="#10b981"
                      />
                    </div>
                  </div>

                  {/* Cor do Texto */}
                  <div>
                    <label className="text-xs font-medium mb-1 block">Texto</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={defaultButtonTextColor}
                        onChange={(e) => onDefaultButtonTextColorChange?.(e.target.value)}
                        className="w-6 h-6 rounded-full border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={defaultButtonTextColor}
                        onChange={(e) => onDefaultButtonTextColorChange?.(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  {/* Preview Compacto */}
                  <div className="pt-2 border-t">
                    <label className="text-xs font-medium mb-2 block">Preview</label>
                    <button
                      style={{
                        backgroundColor: defaultButtonColor,
                        color: defaultButtonTextColor
                      }}
                      className="w-full py-2 px-3 rounded text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* APÓS as configurações globais: Botões de Nova Página */}
          <div className="space-y-3 pt-4 border-t">
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
              Páginas de Jogo
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
        


        <div className="flex-1 overflow-y-auto min-h-0" style={{maxHeight: 'calc(100vh - 73px)'}}>
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
          <div className="flex items-center justify-between">
            <h3 className={cn(
              "font-semibold flex items-center gap-2",
              animations.fadeIn
            )}>
              <Eye className="w-4 h-4" />
              Prévia
              {currentPage && (
                <Badge variant="secondary" className="ml-2 bg-white/20">{currentPage.title}</Badge>
              )}
            </h3>
            
            {/* Controles de Device - Mobile First */}
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium transition-all duration-200",
                  previewDevice === 'mobile' 
                    ? "bg-white text-primary-600 shadow-sm" 
                    : "text-white/80 hover:text-white hover:bg-white/20"
                )}
              >
                📱 Mobile
              </button>
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium transition-all duration-200",
                  previewDevice === 'desktop' 
                    ? "bg-white text-primary-600 shadow-sm" 
                    : "text-white/80 hover:text-white hover:bg-white/20"
                )}
              >
                🖥️ Desktop
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {currentPage ? (
            <div className={cn(
              "mx-auto transition-all duration-300",
              previewDevice === 'mobile' 
                ? "max-w-[375px] border-8 border-gray-800 rounded-[2.5rem] bg-gray-800 p-1 shadow-xl" 
                : "max-w-full"
            )}>
              <div 
                className={cn(
                  "space-y-4 border border-gray-200 rounded-xl p-6 min-h-[500px] shadow-soft",
                  animations.slideInUp,
                  previewDevice === 'mobile' ? "rounded-[1.75rem] min-h-[600px]" : ""
                )}
                style={getPageBackgroundStyle()}
              >
              {currentPage.elements.length === 0 ? (
                <div className="text-center text-gray-500 py-16">
                  <Edit3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Página Vazia</h3>
                  <p className="text-sm">Adicione elementos para começar</p>
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
                        <div className="absolute -top-3 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
                          <ModernButton
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 bg-red-50 hover:bg-red-100 shadow-md border border-red-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteElement(element.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </ModernButton>
                        </div>
                      </div>
                    </DragDropItem>
                  ))}
                </DragDropContainer>
              )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma Página Selecionada</h3>
                <p className="text-sm">Selecione uma página para editar</p>
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
            {selectedElementData ? getElementTypeName(selectedElementData.type) : "Propriedades"}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4" style={{maxHeight: 'calc(100vh - 73px)'}}>
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

              {(selectedElementData.type === "textarea" || selectedElementData.type === "date") && (
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
                    <>
                      {/* Formatação de Texto para Textarea */}
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-semibold text-sm mb-3">🎨 Formatação de Texto</h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {/* Tamanho da fonte */}
                          <div>
                            <Label className="text-xs">Tamanho</Label>
                            <select 
                              className="w-full px-2 py-1 border rounded text-xs mt-1"
                              value={selectedElementData.fontSize || "base"}
                              onChange={(e) => updateElement(selectedElementData.id, { fontSize: e.target.value })}
                            >
                              <option value="xs">Extra Pequeno</option>
                              <option value="sm">Pequeno</option>
                              <option value="base">Normal</option>
                              <option value="lg">Grande</option>
                              <option value="xl">Extra Grande</option>
                            </select>
                          </div>

                          {/* Peso da fonte */}
                          <div>
                            <Label className="text-xs">Peso</Label>
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
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          {/* Alinhamento */}
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

                          {/* Largura do Campo */}
                          <div>
                            <Label className="text-xs">Largura</Label>
                            <select 
                              className="w-full px-2 py-1 border rounded text-xs mt-1"
                              value={selectedElementData.fieldWidth || "full"}
                              onChange={(e) => updateElement(selectedElementData.id, { fieldWidth: e.target.value })}
                            >
                              <option value="small">Pequeno</option>
                              <option value="medium">Médio</option>
                              <option value="large">Grande</option>
                              <option value="full">Largura Total</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="textarea-placeholder">Placeholder</Label>
                        <Input
                          id="textarea-placeholder"
                          value={selectedElementData.placeholder || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { placeholder: e.target.value })}
                          className="mt-1"
                          placeholder="Digite sua resposta..."
                        />
                      </div>

                      <div>
                        <Label htmlFor="maxLength">Limite de Caracteres</Label>
                        <Input
                          id="maxLength"
                          type="number"
                          value={selectedElementData.maxLength || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { maxLength: e.target.value })}
                          className="mt-1"
                          placeholder="Ex: 500"
                        />
                      </div>
                    </>
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
                      placeholder="comentario"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use esse ID para referenciar a resposta em outros elementos. Ex: &#123;comentario&#125;
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
                          placeholder="escolha"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use &#123;escolha&#125; para referenciar a resposta selecionada em outros elementos
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
                      
                      {selectedElementData.requireContinueButton && (
                        <div className="mt-2">
                          <Button
                            onClick={() => {
                              const currentPage = quiz.structure.pages[activePageIndex];
                              const hasButtonContinue = currentPage.elements.some(el => el.type === 'continue_button');
                              
                              if (!hasButtonContinue) {
                                addElement('continue_button');
                              }
                            }}
                            size="sm"
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Adicionar Botão Continuar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Formatação das Respostas */}
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h4 className="font-semibold text-sm mb-3">🎨 Formatação das Respostas</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {/* Tamanho da fonte das opções */}
                      <div>
                        <Label className="text-xs">Tamanho das Opções</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs"
                          value={selectedElementData.optionFontSize || "base"}
                          onChange={(e) => updateElement(selectedElementData.id, { optionFontSize: e.target.value })}
                        >
                          <option value="xs">Extra Pequeno</option>
                          <option value="sm">Pequeno</option>
                          <option value="base">Normal</option>
                          <option value="lg">Grande</option>
                          <option value="xl">Muito Grande</option>
                        </select>
                      </div>

                      {/* Peso da fonte das opções */}
                      <div>
                        <Label className="text-xs">Peso das Opções</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs"
                          value={selectedElementData.optionFontWeight || "normal"}
                          onChange={(e) => updateElement(selectedElementData.id, { optionFontWeight: e.target.value })}
                        >
                          <option value="light">Leve</option>
                          <option value="normal">Normal</option>
                          <option value="medium">Médio</option>
                          <option value="semibold">Semi-negrito</option>
                          <option value="bold">Negrito</option>
                        </select>
                      </div>

                      {/* Cor das opções */}
                      <div>
                        <Label className="text-xs">Cor das Opções</Label>
                        <input
                          type="color"
                          value={selectedElementData.optionTextColor || "#374151"}
                          onChange={(e) => updateElement(selectedElementData.id, { optionTextColor: e.target.value })}
                          className="w-full h-8 border rounded"
                        />
                      </div>

                      {/* Cor das checkboxes */}
                      <div>
                        <Label className="text-xs">Cor de Seleção</Label>
                        <input
                          type="color"
                          value={selectedElementData.checkboxColor || "#374151"}
                          onChange={(e) => updateElement(selectedElementData.id, { checkboxColor: e.target.value })}
                          className="w-full h-8 border rounded"
                        />
                      </div>
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

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="requireContinue"
                            checked={selectedElementData.requireContinueButton || false}
                            onChange={(e) => updateElement(selectedElementData.id, { requireContinueButton: e.target.checked })}
                          />
                          <Label htmlFor="requireContinue" className="text-xs">Aguardar botão "Continuar"</Label>
                        </div>
                        
                        {selectedElementData.requireContinueButton && (
                          <div className="pl-6">
                            <Button
                              onClick={() => {
                                const currentPage = quiz.structure.pages[activePageIndex];
                                const hasButtonContinue = currentPage.elements.some(el => el.type === 'continue_button');
                                
                                if (!hasButtonContinue) {
                                  addElement('continue_button');
                                }
                              }}
                              size="sm"
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Adicionar Botão Continuar
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* ID de Remarketing */}
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-800 text-xs">ID para Campanhas</span>
                        </div>
                        <div className="text-xs text-blue-700 space-y-1">
                          <div className="font-mono bg-blue-100 px-2 py-1 rounded text-blue-900">
                            p{activePageIndex + 1}_r_quiz
                          </div>
                          <p className="text-blue-600">
                            Este ID será usado automaticamente para segmentação em campanhas de SMS, Email e WhatsApp
                          </p>
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

              {(selectedElementData.type === "text" || selectedElementData.type === "email" || selectedElementData.type === "phone" || selectedElementData.type === "number") && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="question">Pergunta/Label</Label>
                    <Input
                      id="question"
                      value={selectedElementData.question || ""}
                      onChange={(e) => {
                        const text = e.target.value.slice(0, 200); // Limite de 200 caracteres
                        updateElement(selectedElementData.id, { question: text });
                      }}
                      maxLength={200}
                      className="mt-1"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {(selectedElementData.question || "").length}/200 caracteres
                    </div>
                  </div>
                  
                  {/* Formatação de Texto */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-sm mb-3">🎨 Formatação de Texto</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {/* Tamanho da fonte */}
                      <div>
                        <Label className="text-xs">Tamanho</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.fontSize || "base"}
                          onChange={(e) => updateElement(selectedElementData.id, { fontSize: e.target.value })}
                        >
                          <option value="xs">Extra Pequeno</option>
                          <option value="sm">Pequeno</option>
                          <option value="base">Normal</option>
                          <option value="lg">Grande</option>
                          <option value="xl">Extra Grande</option>
                        </select>
                      </div>

                      {/* Peso da fonte */}
                      <div>
                        <Label className="text-xs">Peso</Label>
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
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {/* Alinhamento */}
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

                      {/* Largura do Campo em % */}
                      <div>
                        <Label className="text-xs">Largura (% da tela)</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.widthPercentage || "100"}
                          onChange={(e) => updateElement(selectedElementData.id, { widthPercentage: parseInt(e.target.value) })}
                        >
                          <option value="25">25% da tela</option>
                          <option value="50">50% da tela</option>
                          <option value="75">75% da tela</option>
                          <option value="100">100% da tela</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="placeholder">Placeholder</Label>
                    <Input
                      id="placeholder"
                      value={selectedElementData.placeholder || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { placeholder: e.target.value })}
                      className="mt-1"
                      placeholder="Texto de exemplo no campo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxLength">{selectedElementData.type === "number" ? "Limite de Dígitos" : "Limite de Caracteres"}</Label>
                    <Input
                      id="maxLength"
                      type="number"
                      value={selectedElementData.maxLength || selectedElementData.digitLimit || (selectedElementData.type === "text" ? "200" : selectedElementData.type === "email" ? "150" : selectedElementData.type === "phone" ? "20" : selectedElementData.type === "number" ? "15" : "")}
                      onChange={(e) => {
                        const maxValue = selectedElementData.type === "text" ? 200 : selectedElementData.type === "email" ? 150 : selectedElementData.type === "phone" ? 20 : selectedElementData.type === "number" ? 15 : 500;
                        const value = Math.min(parseInt(e.target.value) || maxValue, maxValue);
                        if (selectedElementData.type === "number") {
                          updateElement(selectedElementData.id, { digitLimit: value });
                        } else {
                          updateElement(selectedElementData.id, { maxLength: value });
                        }
                      }}
                      max={selectedElementData.type === "text" ? "200" : selectedElementData.type === "email" ? "150" : selectedElementData.type === "phone" ? "20" : selectedElementData.type === "number" ? "15" : "500"}
                      min="1"
                      className="mt-1"
                      placeholder={selectedElementData.type === "text" ? "Máx: 200" : selectedElementData.type === "email" ? "Máx: 150" : selectedElementData.type === "phone" ? "Máx: 20" : selectedElementData.type === "number" ? "Máx: 15" : "Ex: 100"}
                      readOnly={selectedElementData.type === "number"}
                    />
                    {(selectedElementData.type === "text" || selectedElementData.type === "email" || selectedElementData.type === "phone" || selectedElementData.type === "number") && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ Campos {selectedElementData.type === "text" ? "de texto limitados a 200 caracteres" : selectedElementData.type === "email" ? "de email limitados a 150 caracteres" : selectedElementData.type === "phone" ? "de telefone limitados a 20 caracteres" : selectedElementData.type === "number" ? "de número limitados a 15 dígitos (não editável)" : ""} por segurança
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="required"
                      checked={selectedElementData.required || false}
                      onChange={(e) => updateElement(selectedElementData.id, { required: e.target.checked })}
                    />
                    <Label htmlFor="required">Campo obrigatório</Label>
                  </div>

                  <div>
                    <Label htmlFor="field-id">ID do Campo (para captura de leads)</Label>
                    <Input
                      id="field-id"
                      value={selectedElementData.fieldId || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { fieldId: e.target.value })}
                      className="mt-1"
                      placeholder={selectedElementData.type === "phone" ? "telefone_" : selectedElementData.type === "number" ? "numero_" : "campo_email"}
                      readOnly={selectedElementData.type === "phone" || selectedElementData.type === "number"}
                    />
                    {selectedElementData.type === "phone" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Campos de telefone usam automaticamente o prefixo "telefone_" para garantir a detecção correta.
                      </p>
                    )}
                    {selectedElementData.type === "number" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Campos de número usam automaticamente o prefixo "numero_" para garantir a detecção correta.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedElementData.type === "rating" && (
                <div className="space-y-4">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Configurações de Avaliação</span>
                    </div>
                    <div className="text-xs text-yellow-700">
                      Configure modo (visualização/interativo), quantidade de estrelas e aparência
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="rating-question">Pergunta/Label</Label>
                    <Input
                      id="rating-question"
                      value={selectedElementData.question || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { question: e.target.value })}
                      className="mt-1"
                      placeholder="Como você avalia nosso produto?"
                    />
                  </div>

                  {/* Modo de funcionamento */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Modo de Funcionamento</Label>
                    <div className="space-y-2">
                      <label className="flex items-start space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name={`ratingMode-${selectedElementData.id}`}
                          checked={!selectedElementData.isInteractive}
                          onChange={() => updateElement(selectedElementData.id, { isInteractive: false })}
                          className="mt-1 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">📊 Apenas Visualização</span>
                          <div className="text-xs text-gray-500 mt-1">
                            Criador define quantas estrelas aparecem preenchidas. Usuário não pode interagir.
                          </div>
                        </div>
                      </label>
                      <label className="flex items-start space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name={`ratingMode-${selectedElementData.id}`}
                          checked={selectedElementData.isInteractive === true}
                          onChange={() => updateElement(selectedElementData.id, { isInteractive: true })}
                          className="mt-1 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">⭐ Interativo</span>
                          <div className="text-xs text-gray-500 mt-1">
                            Usuário pode clicar nas estrelas para dar nota. Preenchimento dinâmico em tempo real.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="star-count">Quantidade Total de Estrelas</Label>
                      <select
                        id="star-count"
                        value={selectedElementData.starCount || 5}
                        onChange={(e) => updateElement(selectedElementData.id, { starCount: Number(e.target.value) })}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={num}>{num} estrela{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="star-size">Tamanho das Estrelas</Label>
                      <select
                        id="star-size"
                        value={selectedElementData.starSize || "medium"}
                        onChange={(e) => updateElement(selectedElementData.id, { starSize: e.target.value })}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                      >
                        <option value="small">Pequeno</option>
                        <option value="medium">Médio</option>
                        <option value="large">Grande</option>
                      </select>
                    </div>
                  </div>

                  {/* Estrelas preenchidas (apenas no modo visualização) */}
                  {!selectedElementData.isInteractive && (
                    <div>
                      <Label htmlFor="filled-stars">Estrelas Preenchidas (Visualização)</Label>
                      <select
                        id="filled-stars"
                        value={selectedElementData.filledStars || 0}
                        onChange={(e) => updateElement(selectedElementData.id, { filledStars: Number(e.target.value) })}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                      >
                        {Array.from({ length: (selectedElementData.starCount || 5) + 1 }, (_, i) => (
                          <option key={i} value={i}>
                            {i} de {selectedElementData.starCount || 5} estrelas preenchidas
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Defina quantas estrelas aparecerão preenchidas no modo visualização
                      </p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="star-color">Cor das Estrelas</Label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        id="star-color"
                        value={selectedElementData.starColor || "#FBBF24"}
                        onChange={(e) => updateElement(selectedElementData.id, { starColor: e.target.value })}
                        className="w-12 h-8 border border-gray-300 rounded"
                      />
                      <Input
                        value={selectedElementData.starColor || "#FBBF24"}
                        onChange={(e) => updateElement(selectedElementData.id, { starColor: e.target.value })}
                        className="flex-1"
                        placeholder="#FBBF24"
                      />
                    </div>
                  </div>

                  {selectedElementData.isInteractive && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="rating-required"
                        checked={selectedElementData.required || false}
                        onChange={(e) => updateElement(selectedElementData.id, { required: e.target.checked })}
                      />
                      <Label htmlFor="rating-required">Campo obrigatório</Label>
                    </div>
                  )}

                  {selectedElementData.isInteractive && (
                    <>
                      <div>
                        <Label htmlFor="rating-field-id">ID do Campo (para captura de leads)</Label>
                        <Input
                          id="rating-field-id"
                          value={selectedElementData.fieldId || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { fieldId: e.target.value })}
                          className="mt-1"
                          placeholder="avaliacao_produto"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Identificador único para capturar essa avaliação na geração de leads
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="rating-response-id">ID da Resposta (para usar como variável)</Label>
                        <Input
                          id="rating-response-id"
                          value={selectedElementData.responseId || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { responseId: e.target.value })}
                          className="mt-1"
                          placeholder="avaliacao"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use &#123;avaliacao&#125; em campanhas SMS/Email/WhatsApp
                        </p>
                      </div>
                    </>
                  )}

                  {/* Preview das estrelas configuradas */}
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <Label className="text-xs font-medium text-gray-700 mb-2 block">
                      Preview da Configuração {selectedElementData.isInteractive ? '(Interativo)' : '(Visualização)'}:
                    </Label>
                    <div className="flex space-x-1">
                      {Array.from({ length: selectedElementData.starCount || 5 }, (_, index) => {
                        const starSizeClass = {
                          small: "w-4 h-4",
                          medium: "w-6 h-6",
                          large: "w-8 h-8"
                        };
                        const starSize = starSizeClass[selectedElementData.starSize || "medium"];
                        
                        // Lógica para preenchimento baseada no modo
                        const shouldFill = selectedElementData.isInteractive ? 
                          false : // No modo interativo, mostra vazio no preview
                          index < (selectedElementData.filledStars || 0); // No modo visualização, usa filledStars
                        
                        return (
                          <Star 
                            key={index} 
                            className={`${starSize} transition-all ${
                              selectedElementData.isInteractive ? 'cursor-pointer hover:scale-110' : ''
                            }`}
                            style={{ color: selectedElementData.starColor || "#FBBF24" }}
                            fill={shouldFill ? (selectedElementData.starColor || "#FBBF24") : 'none'}
                            strokeWidth={2}
                          />
                        );
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {selectedElementData.starCount || 5} estrelas • 
                      Cor: {selectedElementData.starColor || "#FBBF24"} • 
                      Tamanho: {selectedElementData.starSize || "medium"} • 
                      {selectedElementData.isInteractive ? 
                        'Modo Interativo (usuário pode clicar)' : 
                        `Modo Visualização (${selectedElementData.filledStars || 0}/${selectedElementData.starCount || 5} preenchidas)`
                      }
                    </div>
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

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Unidade de Medida</Label>
                      <select 
                        className="w-full px-2 py-1 border rounded text-xs mt-1"
                        value={selectedElementData.heightUnit || "cm"}
                        onChange={(e) => updateElement(selectedElementData.id, { heightUnit: e.target.value })}
                      >
                        <option value="cm">Centímetros (cm)</option>
                        <option value="ft">Pés (ft)</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs">Largura do Elemento</Label>
                      <select 
                        className="w-full px-2 py-1 border rounded text-xs mt-1"
                        value={selectedElementData.width || "100%"}
                        onChange={(e) => updateElement(selectedElementData.id, { width: e.target.value })}
                      >
                        <option value="25%">25% da tela</option>
                        <option value="50%">50% da tela</option>
                        <option value="75%">75% da tela</option>
                        <option value="100%">100% da tela</option>
                      </select>
                    </div>
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
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-4 h-4 text-red-600" />
                          <span className="font-medium text-red-800">**IMPORTANTE**: ID do Campo ALTURA Obrigatório</span>
                        </div>
                        <div className="text-xs text-red-700 space-y-2">
                          <div>**Para calcular o IMC, você DEVE colar aqui o ID do campo ALTURA:**</div>
                          <Input
                            value={selectedElementData.heightFieldId || ""}
                            onChange={(e) => updateElement(selectedElementData.id, { heightFieldId: e.target.value })}
                            placeholder="**COLE AQUI O ID DO CAMPO ALTURA**"
                            className="mt-1 border-red-300 focus:ring-red-500"
                          />
                          <div className="text-xs text-red-600">
                            **SEM ESSE ID, O IMC NÃO SERÁ CALCULADO. Vá no elemento altura e copie o "ID do Campo"**
                          </div>
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

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Unidade de Peso</Label>
                      <select 
                        className="w-full px-2 py-1 border rounded text-xs mt-1"
                        value={selectedElementData.weightUnit || "kg"}
                        onChange={(e) => updateElement(selectedElementData.id, { weightUnit: e.target.value })}
                      >
                        <option value="kg">Quilogramas (kg)</option>
                        <option value="lb">Libras (lb)</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs">Largura do Elemento</Label>
                      <select 
                        className="w-full px-2 py-1 border rounded text-xs mt-1"
                        value={selectedElementData.width || "100%"}
                        onChange={(e) => updateElement(selectedElementData.id, { width: e.target.value })}
                      >
                        <option value="25%">25% da tela</option>
                        <option value="50%">50% da tela</option>
                        <option value="75%">75% da tela</option>
                        <option value="100%">100% da tela</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Placeholder do Campo</Label>
                    <Input
                      value={selectedElementData.placeholder || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { placeholder: e.target.value })}
                      className="mt-1"
                      placeholder="Ex: Digite seu peso"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-semibold">Formatação de Texto</Label>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Tamanho da Fonte</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.fontSize || "md"}
                          onChange={(e) => updateElement(selectedElementData.id, { fontSize: e.target.value })}
                        >
                          <option value="xs">Extra Pequeno</option>
                          <option value="sm">Pequeno</option>
                          <option value="md">Médio</option>
                          <option value="lg">Grande</option>
                          <option value="xl">Extra Grande</option>
                        </select>
                      </div>

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
                          <option value="semibold">Semi Negrito</option>
                          <option value="bold">Negrito</option>
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
                  </div>

                  <div>
                    <Label htmlFor="weight-placeholder">Placeholder</Label>
                    <Input
                      id="weight-placeholder"
                      value={selectedElementData.placeholder || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { placeholder: e.target.value })}
                      className="mt-1"
                      placeholder="Ex: 70"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weight-min">Peso Mínimo</Label>
                      <Input
                        id="weight-min"
                        type="number"
                        value={selectedElementData.min || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { min: Number(e.target.value) })}
                        className="mt-1"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight-max">Peso Máximo</Label>
                      <Input
                        id="weight-max"
                        type="number"
                        value={selectedElementData.max || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { max: Number(e.target.value) })}
                        className="mt-1"
                        placeholder="200"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="weight-unit">Unidade</Label>
                    <select
                      id="weight-unit"
                      value={selectedElementData.unit || "kg"}
                      onChange={(e) => updateElement(selectedElementData.id, { unit: e.target.value })}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    >
                      <option value="kg">Quilogramas (kg)</option>
                      <option value="lb">Libras (lb)</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="weight-field-width">Largura do Campo</Label>
                    <select
                      id="weight-field-width"
                      value={selectedElementData.fieldWidth || "medium"}
                      onChange={(e) => updateElement(selectedElementData.id, { fieldWidth: e.target.value })}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    >
                      <option value="small">Pequeno</option>
                      <option value="medium">Médio</option>
                      <option value="large">Grande</option>
                      <option value="full">Largura Total</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="weight-field-align">Alinhamento</Label>
                    <select
                      id="weight-field-align"
                      value={selectedElementData.fieldAlign || "center"}
                      onChange={(e) => updateElement(selectedElementData.id, { fieldAlign: e.target.value })}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    >
                      <option value="left">Esquerda</option>
                      <option value="center">Centro</option>
                      <option value="right">Direita</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="weight-field-style">Estilo do Campo</Label>
                    <select
                      id="weight-field-style"
                      value={selectedElementData.fieldStyle || "default"}
                      onChange={(e) => updateElement(selectedElementData.id, { fieldStyle: e.target.value })}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    >
                      <option value="default">Padrão</option>
                      <option value="rounded">Arredondado</option>
                      <option value="square">Quadrado</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="weight-show-range"
                      checked={selectedElementData.showWeightRange || false}
                      onChange={(e) => updateElement(selectedElementData.id, { showWeightRange: e.target.checked })}
                    />
                    <Label htmlFor="weight-show-range">Mostrar barra de progresso</Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weight-font-size">Tamanho da Fonte</Label>
                      <select
                        id="weight-font-size"
                        value={selectedElementData.fontSize || "text-base"}
                        onChange={(e) => updateElement(selectedElementData.id, { fontSize: e.target.value })}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                      >
                        <option value="text-xs">Muito Pequeno</option>
                        <option value="text-sm">Pequeno</option>
                        <option value="text-base">Médio</option>
                        <option value="text-lg">Grande</option>
                        <option value="text-xl">Muito Grande</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="weight-font-weight">Peso da Fonte</Label>
                      <select
                        id="weight-font-weight"
                        value={selectedElementData.fontWeight || "font-normal"}
                        onChange={(e) => updateElement(selectedElementData.id, { fontWeight: e.target.value })}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                      >
                        <option value="font-light">Leve</option>
                        <option value="font-normal">Normal</option>
                        <option value="font-medium">Médio</option>
                        <option value="font-semibold">Semi-Bold</option>
                        <option value="font-bold">Bold</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="weight-text-align">Alinhamento do Texto</Label>
                    <select
                      id="weight-text-align"
                      value={selectedElementData.textAlign || "text-left"}
                      onChange={(e) => updateElement(selectedElementData.id, { textAlign: e.target.value })}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    >
                      <option value="text-left">Esquerda</option>
                      <option value="text-center">Centro</option>
                      <option value="text-right">Direita</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Propriedades para Peso Desejado */}
              {selectedElementData.type === "target_weight" && (
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-800">Peso Objetivo - Configurações</span>
                    </div>
                    <div className="text-xs text-gray-700">
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

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Unidade de Peso</Label>
                      <select 
                        className="w-full px-2 py-1 border rounded text-xs mt-1"
                        value={selectedElementData.weightUnit || "kg"}
                        onChange={(e) => updateElement(selectedElementData.id, { weightUnit: e.target.value })}
                      >
                        <option value="kg">Quilogramas (kg)</option>
                        <option value="lb">Libras (lb)</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs">Largura do Elemento</Label>
                      <select 
                        className="w-full px-2 py-1 border rounded text-xs mt-1"
                        value={selectedElementData.width || "100%"}
                        onChange={(e) => updateElement(selectedElementData.id, { width: e.target.value })}
                      >
                        <option value="25%">25% da tela</option>
                        <option value="50%">50% da tela</option>
                        <option value="75%">75% da tela</option>
                        <option value="100%">100% da tela</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Placeholder do Campo</Label>
                    <Input
                      value={selectedElementData.placeholder || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { placeholder: e.target.value })}
                      className="mt-1"
                      placeholder="Ex: Digite seu peso objetivo"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Peso Mínimo (kg)</Label>
                      <Input
                        type="number"
                        value={selectedElementData.min || "30"}
                        onChange={(e) => updateElement(selectedElementData.id, { min: Number(e.target.value) })}
                        className="mt-1"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Peso Máximo (kg)</Label>
                      <Input
                        type="number"
                        value={selectedElementData.max || "300"}
                        onChange={(e) => updateElement(selectedElementData.id, { max: Number(e.target.value) })}
                        className="mt-1"
                        placeholder="300"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-semibold">Formatação de Texto</Label>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Tamanho da Fonte</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.fontSize || "md"}
                          onChange={(e) => updateElement(selectedElementData.id, { fontSize: e.target.value })}
                        >
                          <option value="xs">Extra Pequeno</option>
                          <option value="sm">Pequeno</option>
                          <option value="md">Médio</option>
                          <option value="lg">Grande</option>
                          <option value="xl">Extra Grande</option>
                        </select>
                      </div>

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
                          <option value="semibold">Semi Negrito</option>
                          <option value="bold">Negrito</option>
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
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-semibold">⚙️ Recursos Avançados Opcionais</Label>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="show-difference-calc"
                          checked={selectedElementData.showDifferenceCalculation || false}
                          onChange={(e) => updateElement(selectedElementData.id, { showDifferenceCalculation: e.target.checked })}
                        />
                        <Label htmlFor="show-difference-calc" className="text-xs">Cálculo de diferença automático</Label>
                      </div>

                      {selectedElementData.showDifferenceCalculation && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Calculator className="w-4 h-4 text-red-600" />
                            <span className="font-medium text-red-800">**IMPORTANTE**: ID do Peso Atual Obrigatório</span>
                          </div>
                          <div className="text-xs text-red-700 space-y-2">
                            <div>**Para calcular a diferença, você DEVE colar aqui o ID do campo PESO ATUAL:**</div>
                            <Input
                              value={selectedElementData.currentWeightFieldId || ""}
                              onChange={(e) => updateElement(selectedElementData.id, { currentWeightFieldId: e.target.value })}
                              placeholder="**COLE AQUI O ID DO CAMPO PESO ATUAL**"
                              className="mt-1 border-red-300 focus:ring-red-500"
                            />
                            <div className="text-xs text-red-600">
                              **SEM ESSE ID, A DIFERENÇA NÃO SERÁ CALCULADA. Vá no elemento peso atual e copie o "ID do Campo"**
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="show-progress-calc"
                          checked={selectedElementData.showProgressCalculation || false}
                          onChange={(e) => updateElement(selectedElementData.id, { showProgressCalculation: e.target.checked })}
                        />
                        <Label htmlFor="show-progress-calc" className="text-xs">Cálculo de progresso automático</Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="target-font-size">Tamanho da Fonte</Label>
                      <select
                        id="target-font-size"
                        value={selectedElementData.fontSize || "text-base"}
                        onChange={(e) => updateElement(selectedElementData.id, { fontSize: e.target.value })}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                      >
                        <option value="text-xs">Muito Pequeno</option>
                        <option value="text-sm">Pequeno</option>
                        <option value="text-base">Médio</option>
                        <option value="text-lg">Grande</option>
                        <option value="text-xl">Muito Grande</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="target-font-weight">Peso da Fonte</Label>
                      <select
                        id="target-font-weight"
                        value={selectedElementData.fontWeight || "font-normal"}
                        onChange={(e) => updateElement(selectedElementData.id, { fontWeight: e.target.value })}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                      >
                        <option value="font-light">Leve</option>
                        <option value="font-normal">Normal</option>
                        <option value="font-medium">Médio</option>
                        <option value="font-semibold">Semi-Bold</option>
                        <option value="font-bold">Bold</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="target-text-align">Alinhamento do Texto</Label>
                    <select
                      id="target-text-align"
                      value={selectedElementData.textAlign || "text-left"}
                      onChange={(e) => updateElement(selectedElementData.id, { textAlign: e.target.value })}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    >
                      <option value="text-left">Esquerda</option>
                      <option value="text-center">Centro</option>
                      <option value="text-right">Direita</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Propriedades para Lista de Ícones */}
              {selectedElementData.type === "icon_list" && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Lista de Ícones - Configurações</span>
                    </div>
                    <div className="text-xs text-blue-700">
                      Edite, adicione ou remova ícones individualmente da sua lista
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📝 Configurações Gerais</h5>
                    
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
                      <div className="mt-3">
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

                    <div className="mt-3">
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

                    <div className="mt-3">
                      <Label>Cor de Fundo</Label>
                      <Input
                        type="color"
                        value={selectedElementData.iconListBackgroundColor || "#f8fafc"}
                        onChange={(e) => updateElement(selectedElementData.id, { iconListBackgroundColor: e.target.value })}
                        className="mt-1 h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-sm mb-3">🔧 Editar Ícones</h5>
                    
                    <div className="space-y-3">
                      {((selectedElementData.iconListData || [
                        { id: "1", icon: "CheckCircle", iconColor: "#10b981", mainText: "Benefício 1", subText: "Descrição do benefício" },
                        { id: "2", icon: "Star", iconColor: "#f59e0b", mainText: "Benefício 2", subText: "Descrição do benefício" },
                        { id: "3", icon: "Shield", iconColor: "#3b82f6", mainText: "Benefício 3", subText: "Descrição do benefício" }
                      ])).map((iconItem, index) => (
                        <div key={iconItem.id} className="p-3 border rounded-lg bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <h6 className="text-sm font-semibold">Ícone {index + 1}</h6>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const currentData = selectedElementData.iconListData || [
                                  { id: "1", icon: "CheckCircle", iconColor: "#10b981", mainText: "Benefício 1", subText: "Descrição do benefício" },
                                  { id: "2", icon: "Star", iconColor: "#f59e0b", mainText: "Benefício 2", subText: "Descrição do benefício" },
                                  { id: "3", icon: "Shield", iconColor: "#3b82f6", mainText: "Benefício 3", subText: "Descrição do benefício" }
                                ];
                                const filteredData = currentData.filter(item => item.id !== iconItem.id);
                                updateElement(selectedElementData.id, { iconListData: filteredData });
                              }}
                              className="p-2 text-red-600 hover:text-red-800"
                            >
                              ×
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs">Ícone</Label>
                              <select
                                className="w-full px-2 py-1 border rounded text-xs mt-1"
                                value={iconItem.icon}
                                onChange={(e) => {
                                  const currentData = selectedElementData.iconListData || [
                                    { id: "1", icon: "CheckCircle", iconColor: "#10b981", mainText: "Benefício 1", subText: "Descrição do benefício" },
                                    { id: "2", icon: "Star", iconColor: "#f59e0b", mainText: "Benefício 2", subText: "Descrição do benefício" },
                                    { id: "3", icon: "Shield", iconColor: "#3b82f6", mainText: "Benefício 3", subText: "Descrição do benefício" }
                                  ];
                                  const updatedData = currentData.map(item => 
                                    item.id === iconItem.id ? { ...item, icon: e.target.value } : item
                                  );
                                  updateElement(selectedElementData.id, { iconListData: updatedData });
                                }}
                              >
                                <option value="CheckCircle">✓ Check</option>
                                <option value="Star">⭐ Estrela</option>
                                <option value="Shield">🛡️ Escudo</option>
                                <option value="Heart">❤️ Coração</option>
                                <option value="Zap">⚡ Raio</option>
                                <option value="Trophy">🏆 Troféu</option>
                                <option value="Target">🎯 Alvo</option>
                                <option value="Gift">🎁 Presente</option>
                                <option value="Crown">👑 Coroa</option>
                                <option value="Gem">💎 Diamante</option>
                                <option value="Rocket">🚀 Foguete</option>
                                <option value="Sparkles">✨ Brilho</option>
                              </select>
                            </div>
                            
                            <div>
                              <Label className="text-xs">Cor do Ícone</Label>
                              <Input
                                type="color"
                                value={iconItem.iconColor}
                                onChange={(e) => {
                                  const currentData = selectedElementData.iconListData || [
                                    { id: "1", icon: "CheckCircle", iconColor: "#10b981", mainText: "Benefício 1", subText: "Descrição do benefício" },
                                    { id: "2", icon: "Star", iconColor: "#f59e0b", mainText: "Benefício 2", subText: "Descrição do benefício" },
                                    { id: "3", icon: "Shield", iconColor: "#3b82f6", mainText: "Benefício 3", subText: "Descrição do benefício" }
                                  ];
                                  const updatedData = currentData.map(item => 
                                    item.id === iconItem.id ? { ...item, iconColor: e.target.value } : item
                                  );
                                  updateElement(selectedElementData.id, { iconListData: updatedData });
                                }}
                                className="mt-1 h-8 w-full"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-xs">Texto Principal</Label>
                              <Input
                                value={iconItem.mainText}
                                onChange={(e) => {
                                  const currentData = selectedElementData.iconListData || [
                                    { id: "1", icon: "CheckCircle", iconColor: "#10b981", mainText: "Benefício 1", subText: "Descrição do benefício" },
                                    { id: "2", icon: "Star", iconColor: "#f59e0b", mainText: "Benefício 2", subText: "Descrição do benefício" },
                                    { id: "3", icon: "Shield", iconColor: "#3b82f6", mainText: "Benefício 3", subText: "Descrição do benefício" }
                                  ];
                                  const updatedData = currentData.map(item => 
                                    item.id === iconItem.id ? { ...item, mainText: e.target.value } : item
                                  );
                                  updateElement(selectedElementData.id, { iconListData: updatedData });
                                }}
                                placeholder="Texto principal"
                                className="mt-1 text-xs"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-xs">Texto Secundário</Label>
                              <Input
                                value={iconItem.subText}
                                onChange={(e) => {
                                  const currentData = selectedElementData.iconListData || [
                                    { id: "1", icon: "CheckCircle", iconColor: "#10b981", mainText: "Benefício 1", subText: "Descrição do benefício" },
                                    { id: "2", icon: "Star", iconColor: "#f59e0b", mainText: "Benefício 2", subText: "Descrição do benefício" },
                                    { id: "3", icon: "Shield", iconColor: "#3b82f6", mainText: "Benefício 3", subText: "Descrição do benefício" }
                                  ];
                                  const updatedData = currentData.map(item => 
                                    item.id === iconItem.id ? { ...item, subText: e.target.value } : item
                                  );
                                  updateElement(selectedElementData.id, { iconListData: updatedData });
                                }}
                                placeholder="Descrição"
                                className="mt-1 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      onClick={() => {
                        const currentData = selectedElementData.iconListData || [
                          { id: "1", icon: "CheckCircle", iconColor: "#10b981", mainText: "Benefício 1", subText: "Descrição do benefício" },
                          { id: "2", icon: "Star", iconColor: "#f59e0b", mainText: "Benefício 2", subText: "Descrição do benefício" },
                          { id: "3", icon: "Shield", iconColor: "#3b82f6", mainText: "Benefício 3", subText: "Descrição do benefício" }
                        ];
                        const newIcon = {
                          id: Date.now().toString(),
                          icon: "CheckCircle",
                          iconColor: "#10b981",
                          mainText: `Benefício ${currentData.length + 1}`,
                          subText: "Descrição do benefício"
                        };
                        updateElement(selectedElementData.id, { iconListData: [...currentData, newIcon] });
                      }}
                      className="w-full mt-3"
                      size="sm"
                    >
                      + Adicionar Ícone
                    </Button>
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
                    <Label>Tamanho do Título</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.testimonialsTitleSize || "lg"}
                      onChange={(e) => updateElement(selectedElementData.id, { testimonialsTitleSize: e.target.value })}
                    >
                      <option value="xs">Extra Pequeno (xs)</option>
                      <option value="sm">Pequeno (sm)</option>
                      <option value="base">Base</option>
                      <option value="lg">Grande (lg)</option>
                      <option value="xl">Extra Grande (xl)</option>
                      <option value="2xl">2X Grande (2xl)</option>
                    </select>
                  </div>

                  <div>
                    <Label>Layout</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.testimonialsLayout || "vertical"}
                      onChange={(e) => updateElement(selectedElementData.id, { testimonialsLayout: e.target.value })}
                    >
                      <option value="vertical">Vertical</option>
                      <option value="grid">Grid</option>
                    </select>
                  </div>

                  {selectedElementData.testimonialsLayout === "grid" && (
                    <div>
                      <Label>Número de Colunas</Label>
                      <select
                        className="w-full px-3 py-2 border rounded-md mt-1"
                        value={selectedElementData.testimonialsColumns || 1}
                        onChange={(e) => updateElement(selectedElementData.id, { testimonialsColumns: parseInt(e.target.value) })}
                      >
                        <option value={1}>1 Coluna</option>
                        <option value={2}>2 Colunas</option>
                        <option value={3}>3 Colunas</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <Label>Largura (%)</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.testimonialsWidth || 100}
                      onChange={(e) => updateElement(selectedElementData.id, { testimonialsWidth: parseInt(e.target.value) })}
                    >
                      <option value={25}>25%</option>
                      <option value={50}>50%</option>
                      <option value={75}>75%</option>
                      <option value={100}>100%</option>
                    </select>
                  </div>

                  <div>
                    <Label>Cor de Fundo</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedElementData.testimonialsBackgroundColor || "#ffffff"}
                        onChange={(e) => updateElement(selectedElementData.id, { testimonialsBackgroundColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={selectedElementData.testimonialsBackgroundColor || "#ffffff"}
                        onChange={(e) => updateElement(selectedElementData.id, { testimonialsBackgroundColor: e.target.value })}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Cor do Texto</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedElementData.testimonialsTextColor || "#374151"}
                        onChange={(e) => updateElement(selectedElementData.id, { testimonialsTextColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={selectedElementData.testimonialsTextColor || "#374151"}
                        onChange={(e) => updateElement(selectedElementData.id, { testimonialsTextColor: e.target.value })}
                        placeholder="#374151"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Cor do Nome</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedElementData.testimonialsNameColor || "#111827"}
                        onChange={(e) => updateElement(selectedElementData.id, { testimonialsNameColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={selectedElementData.testimonialsNameColor || "#111827"}
                        onChange={(e) => updateElement(selectedElementData.id, { testimonialsNameColor: e.target.value })}
                        placeholder="#111827"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showStars"
                      checked={selectedElementData.testimonialsShowStars !== false}
                      onChange={(e) => updateElement(selectedElementData.id, { testimonialsShowStars: e.target.checked })}
                    />
                    <Label htmlFor="showStars">Mostrar Estrelas</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showPhotos"
                      checked={selectedElementData.testimonialsShowPhotos !== false}
                      onChange={(e) => updateElement(selectedElementData.id, { testimonialsShowPhotos: e.target.checked })}
                    />
                    <Label htmlFor="showPhotos">Mostrar Fotos</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showShadow"
                      checked={selectedElementData.testimonialsShowShadow !== false}
                      onChange={(e) => updateElement(selectedElementData.id, { testimonialsShowShadow: e.target.checked })}
                    />
                    <Label htmlFor="showShadow">Mostrar Sombra</Label>
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

              {/* Propriedades para Vídeo */}
              {selectedElementData.type === "video" && (
                <div className="space-y-6">
                  {/* URL do Vídeo */}
                  <div>
                    <Label>URL do Vídeo</Label>
                    <Input
                      value={selectedElementData.content || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      className="mt-1"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Suporte: YouTube, Vimeo, TikTok, Instagram, VTURB, VSLPlayer, PandaVideo
                    </div>
                  </div>

                  {/* Configurações de Layout */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-sm mb-3">🎯 Layout do Vídeo</h4>
                    
                    {/* Alinhamento */}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Alinhamento</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.videoAlignment || "center"}
                          onChange={(e) => updateElement(selectedElementData.id, { videoAlignment: e.target.value })}
                        >
                          <option value="left">Esquerda</option>
                          <option value="center">Centro</option>
                          <option value="right">Direita</option>
                        </select>
                      </div>

                      {/* Largura */}
                      <div>
                        <Label className="text-xs">Largura (%)</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.videoWidth || "100"}
                          onChange={(e) => updateElement(selectedElementData.id, { videoWidth: e.target.value })}
                        >
                          <option value="25">25% da tela</option>
                          <option value="50">50% da tela</option>
                          <option value="75">75% da tela</option>
                          <option value="100">100% da tela</option>
                        </select>
                      </div>

                      {/* Proporção */}
                      <div>
                        <Label className="text-xs">Proporção</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.aspectRatio || "16/9"}
                          onChange={(e) => updateElement(selectedElementData.id, { aspectRatio: e.target.value })}
                        >
                          <option value="16/9">16:9 (Padrão)</option>
                          <option value="4/3">4:3 (Clássico)</option>
                          <option value="1/1">1:1 (Quadrado)</option>
                          <option value="21/9">21:9 (Cinema)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Configurações Avançadas */}
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-semibold text-sm mb-3">⚙️ Configurações Avançadas</h4>
                    
                    <div className="space-y-3">
                      {/* Auto Play */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="autoplay"
                          checked={selectedElementData.autoplay || false}
                          onChange={(e) => updateElement(selectedElementData.id, { autoplay: e.target.checked })}
                        />
                        <Label htmlFor="autoplay" className="text-xs">▶️ Auto Play</Label>
                      </div>

                      {/* Muted */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="muted"
                          checked={selectedElementData.muted || false}
                          onChange={(e) => updateElement(selectedElementData.id, { muted: e.target.checked })}
                        />
                        <Label htmlFor="muted" className="text-xs">🔇 Silenciado</Label>
                      </div>

                      {/* Loop */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="loop"
                          checked={selectedElementData.loop || false}
                          onChange={(e) => updateElement(selectedElementData.id, { loop: e.target.checked })}
                        />
                        <Label htmlFor="loop" className="text-xs">🔄 Repetir</Label>
                      </div>

                      {/* Controles */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="controls"
                          checked={selectedElementData.controls !== false}
                          onChange={(e) => updateElement(selectedElementData.id, { controls: e.target.checked })}
                        />
                        <Label htmlFor="controls" className="text-xs">🎮 Mostrar Controles</Label>
                      </div>
                    </div>
                  </div>

                  {/* Configurações de Responsividade */}
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h4 className="font-semibold text-sm mb-3">📱 Responsividade</h4>
                    
                    <div className="space-y-3">
                      {/* Mobile Size */}
                      <div>
                        <Label className="text-xs">Tamanho no Mobile (%)</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.mobileSize || "100"}
                          onChange={(e) => updateElement(selectedElementData.id, { mobileSize: e.target.value })}
                        >
                          <option value="80">80%</option>
                          <option value="90">90%</option>
                          <option value="100">100%</option>
                        </select>
                      </div>

                      {/* Tablet Size */}
                      <div>
                        <Label className="text-xs">Tamanho no Tablet (%)</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.tabletSize || "100"}
                          onChange={(e) => updateElement(selectedElementData.id, { tabletSize: e.target.value })}
                        >
                          <option value="75">75%</option>
                          <option value="90">90%</option>
                          <option value="100">100%</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Estatísticas do Vídeo */}
                  <div className="border rounded-lg p-4 bg-purple-50">
                    <h4 className="font-semibold text-sm mb-3">📊 Estatísticas</h4>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showVideoStats"
                        checked={selectedElementData.showVideoStats || false}
                        onChange={(e) => updateElement(selectedElementData.id, { showVideoStats: e.target.checked })}
                      />
                      <Label htmlFor="showVideoStats" className="text-xs">Mostrar informações técnicas</Label>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-2">
                      Exibe plataforma detectada, aspecto e tamanho responsivo
                    </div>
                  </div>
                </div>
              )}

              {/* Propriedades para Divisor */}
              {selectedElementData.type === "divider" && (
                <div className="space-y-4">
                  <div>
                    <Label>Espessura da Linha</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.dividerThickness || "medium"}
                      onChange={(e) => updateElement(selectedElementData.id, { dividerThickness: e.target.value as "thin" | "medium" | "thick" })}
                    >
                      <option value="thin">Fino (1px)</option>
                      <option value="medium">Médio (2px)</option>
                      <option value="thick">Grosso (4px)</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label>Cor da Linha</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedElementData.dividerColor || "#d1d5db"}
                        onChange={(e) => updateElement(selectedElementData.id, { dividerColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={selectedElementData.dividerColor || "#d1d5db"}
                        onChange={(e) => updateElement(selectedElementData.id, { dividerColor: e.target.value })}
                        placeholder="#d1d5db"
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
                      onChange={(e) => updateElement(selectedElementData.id, { spacerSize: e.target.value as "small" | "medium" | "large" | "custom" })}
                    >
                      <option value="small">Pequeno (1rem)</option>
                      <option value="medium">Médio (2rem)</option>
                      <option value="large">Grande (4rem)</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>
                  
                  {/* Campo de tamanho personalizado */}
                  {selectedElementData.spacerSize === "custom" && (
                    <div>
                      <Label>Tamanho Personalizado</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          min="0.5"
                          max="10"
                          step="0.1"
                          value={parseFloat(selectedElementData.customSpacerSize?.replace('rem', '') || '2')}
                          onChange={(e) => updateElement(selectedElementData.id, { customSpacerSize: `${e.target.value}rem` })}
                          className="flex-1"
                          placeholder="2.0"
                        />
                        <span className="text-sm text-gray-500">rem</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Entre 0.5rem e 10rem (1rem ≈ 16px)
                      </div>
                    </div>
                  )}
                  
                  {/* Preview visual do espaçamento */}
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <Label className="text-xs text-gray-600">Preview do Espaçamento:</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded flex items-center justify-center"
                         style={{ 
                           height: selectedElementData.spacerSize === "custom" && selectedElementData.customSpacerSize 
                             ? selectedElementData.customSpacerSize 
                             : selectedElementData.spacerSize === "small" ? "1rem" 
                             : selectedElementData.spacerSize === "large" ? "4rem" 
                             : "2rem"
                         }}
                    >
                      <span className="text-xs text-gray-400">
                        {selectedElementData.spacerSize === "custom" && selectedElementData.customSpacerSize 
                          ? selectedElementData.customSpacerSize 
                          : selectedElementData.spacerSize === "small" ? "1rem" 
                          : selectedElementData.spacerSize === "large" ? "4rem" 
                          : "2rem"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Propriedades para Progresso + Pergunta */}
              {selectedElementData.type === "loading_question" && (
                <div className="space-y-4">
                  <div>
                    <Label>Texto do Carregamento</Label>
                    <Input
                      value={selectedElementData.loadingText || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { loadingText: e.target.value })}
                      placeholder="Deixe vazio para não mostrar texto"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">💡 Deixe vazio para ocultar o texto de carregamento</p>
                  </div>

                  <div>
                    <Label>Duração (segundos)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={selectedElementData.loadingDuration || 3}
                      onChange={(e) => updateElement(selectedElementData.id, { loadingDuration: parseInt(e.target.value) })}
                      placeholder="3"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Cor da Barra de Progresso</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedElementData.loadingBarColor || "#10B981"}
                        onChange={(e) => updateElement(selectedElementData.id, { loadingBarColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={selectedElementData.loadingBarColor || "#10B981"}
                        onChange={(e) => updateElement(selectedElementData.id, { loadingBarColor: e.target.value })}
                        placeholder="#10B981"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Cor do Fundo da Barra</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedElementData.loadingBarBackgroundColor || "#E5E7EB"}
                        onChange={(e) => updateElement(selectedElementData.id, { loadingBarBackgroundColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={selectedElementData.loadingBarBackgroundColor || "#E5E7EB"}
                        onChange={(e) => updateElement(selectedElementData.id, { loadingBarBackgroundColor: e.target.value })}
                        placeholder="#E5E7EB"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Pergunta do Popup</Label>
                    <Input
                      value={selectedElementData.popupQuestion || "Você gostaria de continuar?"}
                      onChange={(e) => updateElement(selectedElementData.id, { popupQuestion: e.target.value })}
                      placeholder="Você gostaria de continuar?"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Texto Botão "Sim"</Label>
                      <Input
                        value={selectedElementData.popupYesText || "Sim"}
                        onChange={(e) => updateElement(selectedElementData.id, { popupYesText: e.target.value })}
                        placeholder="Sim"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Texto Botão "Não"</Label>
                      <Input
                        value={selectedElementData.popupNoText || "Não"}
                        onChange={(e) => updateElement(selectedElementData.id, { popupNoText: e.target.value })}
                        placeholder="Não"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>ID da Resposta (para usar como variável)</Label>
                    <Input
                      value={selectedElementData.responseId || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { responseId: e.target.value })}
                      placeholder="pergunta_decisao"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use {'{'}resposta{'}'} para referenciar a resposta (Sim/Não) em outras campanhas
                    </p>
                  </div>

                  <div>
                    <Label>Exibir Porcentagem</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="checkbox"
                        checked={selectedElementData.showPercentage || false}
                        onChange={(e) => updateElement(selectedElementData.id, { showPercentage: e.target.checked })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Mostrar porcentagem na barra</span>
                    </div>
                  </div>

                  <div>
                    <Label>Adicionar Brilho</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="checkbox"
                        checked={selectedElementData.enableShine || false}
                        onChange={(e) => updateElement(selectedElementData.id, { enableShine: e.target.checked })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Adicionar efeito de brilho</span>
                    </div>
                  </div>

                  <div>
                    <Label>Padrão de Listras</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="checkbox"
                        checked={selectedElementData.enableStripes || false}
                        onChange={(e) => updateElement(selectedElementData.id, { enableStripes: e.target.checked })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Adicionar listras animadas</span>
                    </div>
                  </div>

                  <div>
                    <Label>Exibir Tempo Restante</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="checkbox"
                        checked={selectedElementData.showRemainingTime || false}
                        onChange={(e) => updateElement(selectedElementData.id, { showRemainingTime: e.target.checked })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Mostrar tempo restante</span>
                    </div>
                  </div>

                  <div>
                    <Label>Texto da Barra</Label>
                    <Input
                      value={selectedElementData.progressText || "Carregando..."}
                      onChange={(e) => updateElement(selectedElementData.id, { progressText: e.target.value })}
                      placeholder="Carregando..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Cor da Pergunta no Popup</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedElementData.popupQuestionColor || "#1F2937"}
                        onChange={(e) => updateElement(selectedElementData.id, { popupQuestionColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={selectedElementData.popupQuestionColor || "#1F2937"}
                        onChange={(e) => updateElement(selectedElementData.id, { popupQuestionColor: e.target.value })}
                        placeholder="#1F2937"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Propriedades para Barra de Progresso */}
              {selectedElementData.type === "progress_bar" && (
                <div className="space-y-4">
                  <div>
                    <Label>Título da Barra</Label>
                    <Input
                      value={selectedElementData.progressTitle || "Progresso"}
                      onChange={(e) => updateElement(selectedElementData.id, { progressTitle: e.target.value })}
                      placeholder="Progresso"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Estilo da Animação</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.progressStyle || "striped"}
                      onChange={(e) => updateElement(selectedElementData.id, { progressStyle: e.target.value })}
                    >
                      <option value="striped">Listrado (Striped)</option>
                      <option value="rounded">Arredondado (Rounded)</option>
                      <option value="rainbow">Arco-íris (Rainbow)</option>
                    </select>
                  </div>

                  <div>
                    <Label>Cor da Barra</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedElementData.progressColor || "#FCBC51"}
                        onChange={(e) => updateElement(selectedElementData.id, { progressColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={selectedElementData.progressColor || "#FCBC51"}
                        onChange={(e) => updateElement(selectedElementData.id, { progressColor: e.target.value })}
                        placeholder="#FCBC51"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Cor do Fundo</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={selectedElementData.progressBackgroundColor || "#2c303a"}
                        onChange={(e) => updateElement(selectedElementData.id, { progressBackgroundColor: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={selectedElementData.progressBackgroundColor || "#2c303a"}
                        onChange={(e) => updateElement(selectedElementData.id, { progressBackgroundColor: e.target.value })}
                        placeholder="#2c303a"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Altura (px)</Label>
                      <Input
                        type="number"
                        min="10"
                        max="50"
                        value={selectedElementData.progressHeight || 18}
                        onChange={(e) => updateElement(selectedElementData.id, { progressHeight: parseInt(e.target.value) })}
                        placeholder="18"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Largura (%)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={selectedElementData.progressWidth || 75}
                        onChange={(e) => updateElement(selectedElementData.id, { progressWidth: parseInt(e.target.value) })}
                        placeholder="75"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Arredondamento das Bordas (px)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="30"
                      value={selectedElementData.progressBorderRadius || 6}
                      onChange={(e) => updateElement(selectedElementData.id, { progressBorderRadius: parseInt(e.target.value) })}
                      placeholder="6"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Duração da Animação (segundos)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={selectedElementData.animationDuration || 6}
                      onChange={(e) => updateElement(selectedElementData.id, { animationDuration: parseInt(e.target.value) })}
                      placeholder="6"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="show-percentage"
                      checked={selectedElementData.showPercentage !== false}
                      onChange={(e) => updateElement(selectedElementData.id, { showPercentage: e.target.checked })}
                    />
                    <Label htmlFor="show-percentage" className="text-sm">Mostrar porcentagem</Label>
                  </div>
                </div>
              )}

              {/* Propriedades para Netflix Intro */}
              {selectedElementData.type === "netflix_intro" && (
                <div className="space-y-4">
                  <div>
                    <Label>Título Netflix</Label>
                    <Input
                      value={selectedElementData.netflixTitle || "NETFLIX"}
                      onChange={(e) => updateElement(selectedElementData.id, { netflixTitle: e.target.value })}
                      placeholder="NETFLIX"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Letras da Animação</Label>
                    <Input
                      value={selectedElementData.netflixLetters || "N-E-T-F-L-I-X"}
                      onChange={(e) => updateElement(selectedElementData.id, { netflixLetters: e.target.value })}
                      placeholder="N-E-T-F-L-I-X"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separe as letras com "-" para animação individual
                    </p>
                  </div>

                  <div>
                    <Label>Duração (segundos)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={selectedElementData.netflixDuration || 4}
                      onChange={(e) => updateElement(selectedElementData.id, { netflixDuration: parseInt(e.target.value) })}
                      placeholder="4"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Velocidade da Animação</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      value={selectedElementData.netflixAnimationSpeed || "normal"}
                      onChange={(e) => updateElement(selectedElementData.id, { netflixAnimationSpeed: e.target.value })}
                    >
                      <option value="slow">Lenta</option>
                      <option value="normal">Normal</option>
                      <option value="fast">Rápida</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="netflix-show-title"
                        checked={selectedElementData.netflixShowTitle !== false}
                        onChange={(e) => updateElement(selectedElementData.id, { netflixShowTitle: e.target.checked })}
                      />
                      <Label htmlFor="netflix-show-title" className="text-sm">Mostrar título</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="netflix-fullscreen"
                        checked={selectedElementData.netflixFullscreen !== false}
                        onChange={(e) => updateElement(selectedElementData.id, { netflixFullscreen: e.target.checked })}
                      />
                      <Label htmlFor="netflix-fullscreen" className="text-sm">Tela cheia</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="netflix-auto-advance"
                        checked={selectedElementData.netflixAutoAdvance !== false}
                        onChange={(e) => updateElement(selectedElementData.id, { netflixAutoAdvance: e.target.checked })}
                      />
                      <Label htmlFor="netflix-auto-advance" className="text-sm">Avançar automaticamente</Label>
                    </div>
                  </div>

                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-600">🎬</span>
                      <span className="text-sm font-bold text-red-800">Netflix Intro Autêntico</span>
                    </div>
                    <div className="text-xs text-red-700">
                      Animação completa com zoom, brush effects e luzes coloridas, 
                      idêntica à intro original do Netflix. Ideal para criar transições 
                      cinematográficas impactantes.
                    </div>
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
                      onChange={(e) => updateElement(selectedElementData.id, { buttonSize: e.target.value as "small" | "medium" | "large" | "full" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                    >
                      <option value="small">Pequeno</option>
                      <option value="medium">Médio</option>
                      <option value="large">Grande</option>
                      <option value="full">Largura Total</option>
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
                        <Label>Altura da Barra (px)</Label>
                        <Input
                          type="number"
                          min="4"
                          max="30"
                          value={selectedElementData.loadingBarHeight || 8}
                          onChange={(e) => updateElement(selectedElementData.id, { loadingBarHeight: parseInt(e.target.value) })}
                          placeholder="8"
                          className="mt-1"
                        />
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
                    <h5 className="font-semibold text-sm mb-3">✨ Opções de Exibição</h5>
                    
                    <div className="space-y-3">
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
                        <Label>Adicionar Brilho</Label>
                        <input
                          type="checkbox"
                          checked={selectedElementData.enableShine || false}
                          onChange={(e) => updateElement(selectedElementData.id, { enableShine: e.target.checked })}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Padrão de Listras</Label>
                        <input
                          type="checkbox"
                          checked={selectedElementData.enableStripes || false}
                          onChange={(e) => updateElement(selectedElementData.id, { enableStripes: e.target.checked })}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Tempo Restante</Label>
                        <input
                          type="checkbox"
                          checked={selectedElementData.showRemainingTime || false}
                          onChange={(e) => updateElement(selectedElementData.id, { showRemainingTime: e.target.checked })}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                      </div>
                      
                      <div>
                        <Label>Texto da Barra</Label>
                        <Input
                          value={selectedElementData.progressText || "Carregando..."}
                          onChange={(e) => updateElement(selectedElementData.id, { progressText: e.target.value })}
                          placeholder="Carregando..."
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">🎨 Popup e Pergunta</h5>
                    
                    <div className="space-y-3">
                      <div>
                        <Label>Pergunta do Popup</Label>
                        <Input
                          value={selectedElementData.popupQuestion || "Você gostaria de continuar?"}
                          onChange={(e) => updateElement(selectedElementData.id, { popupQuestion: e.target.value })}
                          placeholder="Você gostaria de continuar?"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Cor da Pergunta</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={selectedElementData.popupQuestionColor || "#1F2937"}
                            onChange={(e) => updateElement(selectedElementData.id, { popupQuestionColor: e.target.value })}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={selectedElementData.popupQuestionColor || "#1F2937"}
                            onChange={(e) => updateElement(selectedElementData.id, { popupQuestionColor: e.target.value })}
                            placeholder="#1F2937"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Texto Botão "Sim"</Label>
                          <Input
                            value={selectedElementData.popupYesText || "Sim"}
                            onChange={(e) => updateElement(selectedElementData.id, { popupYesText: e.target.value })}
                            placeholder="Sim"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Texto Botão "Não"</Label>
                          <Input
                            value={selectedElementData.popupNoText || "Não"}
                            onChange={(e) => updateElement(selectedElementData.id, { popupNoText: e.target.value })}
                            placeholder="Não"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">🎯 Cores dos Botões</h5>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Fundo Botão "Sim"</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              type="color"
                              value={selectedElementData.yesButtonBgColor || "transparent"}
                              onChange={(e) => updateElement(selectedElementData.id, { yesButtonBgColor: e.target.value })}
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={selectedElementData.yesButtonBgColor || "transparent"}
                              onChange={(e) => updateElement(selectedElementData.id, { yesButtonBgColor: e.target.value })}
                              placeholder="transparent"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Texto Botão "Sim"</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              type="color"
                              value={selectedElementData.yesButtonTextColor || "#000000"}
                              onChange={(e) => updateElement(selectedElementData.id, { yesButtonTextColor: e.target.value })}
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={selectedElementData.yesButtonTextColor || "#000000"}
                              onChange={(e) => updateElement(selectedElementData.id, { yesButtonTextColor: e.target.value })}
                              placeholder="#000000"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Fundo Botão "Não"</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              type="color"
                              value={selectedElementData.noButtonBgColor || "transparent"}
                              onChange={(e) => updateElement(selectedElementData.id, { noButtonBgColor: e.target.value })}
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={selectedElementData.noButtonBgColor || "transparent"}
                              onChange={(e) => updateElement(selectedElementData.id, { noButtonBgColor: e.target.value })}
                              placeholder="transparent"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Texto Botão "Não"</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              type="color"
                              value={selectedElementData.noButtonTextColor || "#000000"}
                              onChange={(e) => updateElement(selectedElementData.id, { noButtonTextColor: e.target.value })}
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              value={selectedElementData.noButtonTextColor || "#000000"}
                              onChange={(e) => updateElement(selectedElementData.id, { noButtonTextColor: e.target.value })}
                              placeholder="#000000"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>ID da Resposta (para uso como variável)</Label>
                    <Input
                      value={selectedElementData.responseId || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { responseId: e.target.value })}
                      placeholder="resposta_pergunta"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use esse ID para referenciar a resposta em campanhas. Ex: &#123;resposta_pergunta&#125;
                    </p>
                  </div>
                </div>
              )}

              {/* NOVOS ELEMENTOS - PAINÉIS DE CONFIGURAÇÃO */}
              {selectedElementData.type === "chart" && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">📊 Gráfico Avançado</h4>
                    <p className="text-xs text-blue-700">
                      Gráficos interativos com barras, linhas, antes/depois e dados em tempo real
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📝 Conteúdo</h5>
                    
                    <div>
                      <Label>Título do Gráfico</Label>
                      <Input
                        value={selectedElementData.chartTitle || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { chartTitle: e.target.value })}
                        placeholder="Resultados da Sua Transformação"
                        className="mt-1"
                      />
                    </div>

                    <div className="mt-3">
                      <Label>Período dos Dados</Label>
                      <Select 
                        value={selectedElementData.timePeriod || "weeks"}
                        onValueChange={(value) => updateElement(selectedElementData.id, { timePeriod: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">Últimos 7 dias</SelectItem>
                          <SelectItem value="weeks">Últimas 4 semanas</SelectItem>
                          <SelectItem value="months">Últimos 6 meses</SelectItem>
                          <SelectItem value="custom">Período personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📊 Tipo de Gráfico</h5>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={selectedElementData.chartType === "bar" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateElement(selectedElementData.id, { chartType: "bar" })}
                      >
                        📊 Barras
                      </Button>
                      <Button
                        variant={selectedElementData.chartType === "line" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateElement(selectedElementData.id, { chartType: "line" })}
                      >
                        📈 Linha
                      </Button>
                      <Button
                        variant={selectedElementData.chartType === "before_after" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateElement(selectedElementData.id, { chartType: "before_after" })}
                      >
                        ⚖️ Antes/Depois
                      </Button>
                      <Button
                        variant={selectedElementData.chartType === "pie" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateElement(selectedElementData.id, { chartType: "pie" })}
                      >
                        🥧 Pizza
                      </Button>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📊 Dados</h5>
                    
                    <div>
                      <Label>Valores (separados por vírgula)</Label>
                      <Input
                        value={(selectedElementData.chartData || [45, 65, 85, 92]).map(item => 
                          typeof item === 'object' ? item.value : item
                        ).join(", ")}
                        onChange={(e) => {
                          const values = e.target.value.split(",").map((v, index) => ({
                            label: `Semana ${index + 1}`,
                            value: parseInt(v.trim()) || 0,
                            color: ["#ef4444", "#f59e0b", "#10b981", "#3b82f6"][index] || "#10b981"
                          }));
                          updateElement(selectedElementData.id, { chartData: values });
                        }}
                        placeholder="45, 65, 85, 92"
                        className="mt-1"
                      />
                    </div>

                    <div className="mt-3">
                      <Label>Cores (separadas por vírgula)</Label>
                      <Input
                        value={(selectedElementData.chartColors || ["#ef4444", "#f59e0b", "#10b981", "#3b82f6"]).join(", ")}
                        onChange={(e) => {
                          const colors = e.target.value.split(",").map(c => c.trim());
                          updateElement(selectedElementData.id, { chartColors: colors });
                        }}
                        placeholder="#ef4444, #f59e0b, #10b981, #3b82f6"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">⚖️ Dados Antes/Depois</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Valor Antes</Label>
                        <Input
                          type="number"
                          value={selectedElementData.beforeAfterData?.before?.value || 25}
                          onChange={(e) => updateElement(selectedElementData.id, { 
                            beforeAfterData: {
                              ...selectedElementData.beforeAfterData,
                              before: { 
                                value: parseInt(e.target.value) || 0, 
                                label: "Antes" 
                              }
                            }
                          })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Valor Depois</Label>
                        <Input
                          type="number"
                          value={selectedElementData.beforeAfterData?.after?.value || 85}
                          onChange={(e) => updateElement(selectedElementData.id, { 
                            beforeAfterData: {
                              ...selectedElementData.beforeAfterData,
                              after: { 
                                value: parseInt(e.target.value) || 0, 
                                label: "Depois" 
                              }
                            }
                          })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-sm mb-3">🎨 Estilo</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Cor do Título</Label>
                        <Input
                          type="color"
                          value={selectedElementData.chartTitleColor || "#1f2937"}
                          onChange={(e) => updateElement(selectedElementData.id, { chartTitleColor: e.target.value })}
                          className="mt-1 h-10"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedElementData.chartShowLegend !== false}
                          onChange={(e) => updateElement(selectedElementData.id, { chartShowLegend: e.target.checked })}
                          className="rounded"
                        />
                        <Label>Mostrar Legenda</Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedElementData.type === "metrics" && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-purple-800 mb-2">📈 Métricas Avançadas</h4>
                    <p className="text-xs text-purple-700">
                      Métricas de performance em tempo real com gráficos semanais e indicadores visuais
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📝 Conteúdo</h5>
                    
                    <div>
                      <Label>Título das Métricas</Label>
                      <Input
                        value={selectedElementData.metricsTitle || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { metricsTitle: e.target.value })}
                        placeholder="Seus Resultados em Tempo Real"
                        className="mt-1"
                      />
                    </div>

                    <div className="mt-3">
                      <Label>Período dos Dados</Label>
                      <Select 
                        value={selectedElementData.timePeriod || "Últimas 7 dias"}
                        onValueChange={(value) => updateElement(selectedElementData.id, { timePeriod: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Últimas 24 horas">Últimas 24 horas</SelectItem>
                          <SelectItem value="Últimas 7 dias">Últimas 7 dias</SelectItem>
                          <SelectItem value="Últimos 30 dias">Últimos 30 dias</SelectItem>
                          <SelectItem value="Últimos 3 meses">Últimos 3 meses</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📊 Configuração das Métricas</h5>
                    
                    <div>
                      <Label>Métrica 1 - Nome</Label>
                      <Input
                        value={selectedElementData.metric1Name || "Conversões"}
                        onChange={(e) => updateElement(selectedElementData.id, { metric1Name: e.target.value })}
                        placeholder="Conversões"
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <Label>Valor Atual</Label>
                        <Input
                          type="number"
                          value={selectedElementData.metric1Value || 85}
                          onChange={(e) => updateElement(selectedElementData.id, { metric1Value: parseInt(e.target.value) || 0 })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Valor Máximo</Label>
                        <Input
                          type="number"
                          value={selectedElementData.metric1Max || 100}
                          onChange={(e) => updateElement(selectedElementData.id, { metric1Max: parseInt(e.target.value) || 100 })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <Label>Métrica 2 - Nome</Label>
                      <Input
                        value={selectedElementData.metric2Name || "Engajamento"}
                        onChange={(e) => updateElement(selectedElementData.id, { metric2Name: e.target.value })}
                        placeholder="Engajamento"
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <Label>Valor Atual</Label>
                        <Input
                          type="number"
                          value={selectedElementData.metric2Value || 72}
                          onChange={(e) => updateElement(selectedElementData.id, { metric2Value: parseInt(e.target.value) || 0 })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Valor Máximo</Label>
                        <Input
                          type="number"
                          value={selectedElementData.metric2Max || 100}
                          onChange={(e) => updateElement(selectedElementData.id, { metric2Max: parseInt(e.target.value) || 100 })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <Label>Métrica 3 - Nome</Label>
                      <Input
                        value={selectedElementData.metric3Name || "Retenção"}
                        onChange={(e) => updateElement(selectedElementData.id, { metric3Name: e.target.value })}
                        placeholder="Retenção"
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <Label>Valor Atual</Label>
                        <Input
                          type="number"
                          value={selectedElementData.metric3Value || 94}
                          onChange={(e) => updateElement(selectedElementData.id, { metric3Value: parseInt(e.target.value) || 0 })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Valor Máximo</Label>
                        <Input
                          type="number"
                          value={selectedElementData.metric3Max || 100}
                          onChange={(e) => updateElement(selectedElementData.id, { metric3Max: parseInt(e.target.value) || 100 })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📈 Gráfico Semanal</h5>
                    
                    <div>
                      <Label>Valores da Semana (Seg-Dom, separados por vírgula)</Label>
                      <Input
                        value={(selectedElementData.weeklyData || [45, 52, 48, 67, 73, 85, 62]).join(", ")}
                        onChange={(e) => {
                          const values = e.target.value.split(",").map(v => parseInt(v.trim()) || 0);
                          const weeklyData = values.map((value, index) => ({
                            day: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"][index],
                            value
                          }));
                          updateElement(selectedElementData.id, { weeklyData });
                        }}
                        placeholder="45, 52, 48, 67, 73, 85, 62"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-sm mb-3">🎨 Estilo</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Cor do Título</Label>
                        <Input
                          type="color"
                          value={selectedElementData.metricsColor || "#1f2937"}
                          onChange={(e) => updateElement(selectedElementData.id, { metricsColor: e.target.value })}
                          className="mt-1 h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedElementData.metricsShowValue !== false}
                            onChange={(e) => updateElement(selectedElementData.id, { metricsShowValue: e.target.checked })}
                            className="rounded"
                          />
                          <Label>Mostrar Valores</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedElementData.metricsShowPercentage !== false}
                            onChange={(e) => updateElement(selectedElementData.id, { metricsShowPercentage: e.target.checked })}
                            className="rounded"
                          />
                          <Label>Mostrar Porcentagem</Label>
                        </div>
                      </div>
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
                      Comparação visual, gráfica ou métrica entre situação anterior e posterior
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">📊 Tipo de Exibição</h5>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={selectedElementData.beforeAfterDisplayType === "visual" ? "default" : "outline"}
                        onClick={() => updateElement(selectedElementData.id, { beforeAfterDisplayType: "visual" })}
                      >
                        Visual
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedElementData.beforeAfterDisplayType === "chart" ? "default" : "outline"}
                        onClick={() => updateElement(selectedElementData.id, { beforeAfterDisplayType: "chart" })}
                      >
                        Gráfico
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedElementData.beforeAfterDisplayType === "metrics" ? "default" : "outline"}
                        onClick={() => updateElement(selectedElementData.id, { beforeAfterDisplayType: "metrics" })}
                      >
                        Métricas
                      </Button>
                    </div>
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
                      <Label>Descrição</Label>
                      <Input
                        value={selectedElementData.beforeAfterDescription || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { beforeAfterDescription: e.target.value })}
                        placeholder="Veja a diferença incrível"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {(selectedElementData.beforeAfterDisplayType === "chart" || selectedElementData.beforeAfterDisplayType === "metrics") && (
                    <div className="border-b pb-4">
                      <h5 className="font-semibold text-sm mb-3">🔢 Valores</h5>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Valor "Antes"</Label>
                          <Input
                            type="number"
                            value={selectedElementData.beforeValue || 25}
                            onChange={(e) => updateElement(selectedElementData.id, { beforeValue: parseFloat(e.target.value) || 0 })}
                            placeholder="25"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Valor "Depois"</Label>
                          <Input
                            type="number"
                            value={selectedElementData.afterValue || 85}
                            onChange={(e) => updateElement(selectedElementData.id, { afterValue: parseFloat(e.target.value) || 0 })}
                            placeholder="85"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <Label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedElementData.beforeAfterShowPercent || false}
                            onChange={(e) => updateElement(selectedElementData.id, { beforeAfterShowPercent: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span>Exibir como porcentagem (%)</span>
                        </Label>
                      </div>
                    </div>
                  )}

                  {selectedElementData.beforeAfterDisplayType === "chart" && (
                    <div className="border-b pb-4">
                      <h5 className="font-semibold text-sm mb-3">📊 Configurações do Gráfico</h5>
                      
                      <div>
                        <Label>Tipo de Gráfico</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.beforeAfterChartType || "bar"}
                          onChange={(e) => updateElement(selectedElementData.id, { beforeAfterChartType: e.target.value })}
                        >
                          <option value="bar">Barras</option>
                          <option value="line">Linha</option>
                          <option value="pie">Pizza</option>
                          <option value="doughnut">Rosca</option>
                        </select>
                      </div>

                      <div className="mt-3">
                        <Label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedElementData.beforeAfterShowLegend !== false}
                            onChange={(e) => updateElement(selectedElementData.id, { beforeAfterShowLegend: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span>Exibir legenda</span>
                        </Label>
                      </div>
                    </div>
                  )}

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">🎨 Cores e Estilo</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Cor "Antes"</Label>
                        <Input
                          type="color"
                          value={selectedElementData.beforeColor || "#ef4444"}
                          onChange={(e) => updateElement(selectedElementData.id, { beforeColor: e.target.value })}
                          className="mt-1 h-8"
                        />
                      </div>
                      <div>
                        <Label>Cor "Depois"</Label>
                        <Input
                          type="color"
                          value={selectedElementData.afterColor || "#10b981"}
                          onChange={(e) => updateElement(selectedElementData.id, { afterColor: e.target.value })}
                          className="mt-1 h-8"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <Label>Cor do Título</Label>
                      <Input
                        type="color"
                        value={selectedElementData.titleColor || "#1f2937"}
                        onChange={(e) => updateElement(selectedElementData.id, { titleColor: e.target.value })}
                        className="mt-1 h-8"
                      />
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-sm mb-3">📝 Rótulos e Descrições</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Rótulo "Antes"</Label>
                        <Input
                          value={selectedElementData.beforeAfterLabels?.before || "ANTES"}
                          onChange={(e) => updateElement(selectedElementData.id, { 
                            beforeAfterLabels: { 
                              ...selectedElementData.beforeAfterLabels, 
                              before: e.target.value 
                            } 
                          })}
                          placeholder="ANTES"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Rótulo "Depois"</Label>
                        <Input
                          value={selectedElementData.beforeAfterLabels?.after || "DEPOIS"}
                          onChange={(e) => updateElement(selectedElementData.id, { 
                            beforeAfterLabels: { 
                              ...selectedElementData.beforeAfterLabels, 
                              after: e.target.value 
                            } 
                          })}
                          placeholder="DEPOIS"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <Label>Descrição "Antes"</Label>
                        <Input
                          value={selectedElementData.beforeDescription || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { beforeDescription: e.target.value })}
                          placeholder="Situação anterior"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Descrição "Depois"</Label>
                        <Input
                          value={selectedElementData.afterDescription || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { afterDescription: e.target.value })}
                          placeholder="Resultado alcançado"
                          className="mt-1"
                        />
                      </div>
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
                      Avaliações e comentários de clientes satisfeitos (3 exemplos editáveis)
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

                    <div className="mt-4">
                      <Label className="text-sm font-semibold mb-3 block">Editar Depoimentos:</Label>
                      {(selectedElementData.testimonialsData || [
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
                      ]).map((testimonial, index) => (
                        <div key={testimonial.id} className="border p-3 rounded-lg mb-3 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">Depoimento {index + 1}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const currentData = selectedElementData.testimonialsData || [
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
                                const newData = currentData.filter((_, i) => i !== index);
                                updateElement(selectedElementData.id, { testimonialsData: newData });
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              ×
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs">Nome</Label>
                              <Input
                                value={testimonial.name}
                                onChange={(e) => {
                                  const currentData = selectedElementData.testimonialsData || [
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
                                  const newData = [...currentData];
                                  newData[index] = { ...newData[index], name: e.target.value };
                                  updateElement(selectedElementData.id, { testimonialsData: newData });
                                }}
                                placeholder="Nome do cliente"
                                className="text-xs"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-xs">Depoimento</Label>
                              <textarea
                                value={testimonial.testimonial}
                                onChange={(e) => {
                                  const currentData = selectedElementData.testimonialsData || [
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
                                  const newData = [...currentData];
                                  newData[index] = { ...newData[index], testimonial: e.target.value };
                                  updateElement(selectedElementData.id, { testimonialsData: newData });
                                }}
                                placeholder="Comentário do cliente"
                                className="w-full px-3 py-2 border rounded-md text-xs resize-none"
                                rows={3}
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <Label className="text-xs">Estrelas</Label>
                                <select
                                  value={testimonial.rating}
                                  onChange={(e) => {
                                    const currentData = selectedElementData.testimonialsData || [
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
                                    const newData = [...currentData];
                                    newData[index] = { ...newData[index], rating: parseInt(e.target.value) };
                                    updateElement(selectedElementData.id, { testimonialsData: newData });
                                  }}
                                  className="w-full px-2 py-1 border rounded text-xs"
                                >
                                  <option value={1}>⭐ (1 estrela)</option>
                                  <option value={2}>⭐⭐ (2 estrelas)</option>
                                  <option value={3}>⭐⭐⭐ (3 estrelas)</option>
                                  <option value={4}>⭐⭐⭐⭐ (4 estrelas)</option>
                                  <option value={5}>⭐⭐⭐⭐⭐ (5 estrelas)</option>
                                </select>
                              </div>
                              
                              <div className="flex-1">
                                <Label className="text-xs">URL Avatar</Label>
                                <Input
                                  value={testimonial.avatar}
                                  onChange={(e) => {
                                    const currentData = selectedElementData.testimonialsData || [
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
                                    const newData = [...currentData];
                                    newData[index] = { ...newData[index], avatar: e.target.value };
                                    updateElement(selectedElementData.id, { testimonialsData: newData });
                                  }}
                                  placeholder="URL da foto"
                                  className="text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const currentData = selectedElementData.testimonialsData || [
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
                          const newData = [...currentData, {
                            id: Date.now().toString(),
                            name: "Novo Cliente",
                            testimonial: "Adicione seu depoimento aqui...",
                            rating: 5,
                            avatar: "/api/placeholder/40/40"
                          }];
                          updateElement(selectedElementData.id, { testimonialsData: newData });
                        }}
                        className="w-full"
                      >
                        + Adicionar Depoimento
                      </Button>
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
                    <h5 className="font-semibold text-sm mb-3">📝 Conteúdo</h5>
                    
                    <div className="space-y-3">
                      <div>
                        <Label>Título</Label>
                        <Input
                          value={selectedElementData.guaranteeTitle || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { guaranteeTitle: e.target.value })}
                          placeholder="Garantia de 30 dias"
                          className="mt-1 text-xs"
                        />
                      </div>

                      <div>
                        <Label>Descrição</Label>
                        <Input
                          value={selectedElementData.guaranteeDescription || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { guaranteeDescription: e.target.value })}
                          placeholder="Se você não ficar satisfeito, devolvemos seu dinheiro"
                          className="mt-1 text-xs"
                        />
                      </div>

                      <div>
                        <Label>Texto do Botão (opcional)</Label>
                        <Input
                          value={selectedElementData.guaranteeButtonText || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { guaranteeButtonText: e.target.value })}
                          placeholder="Saiba Mais"
                          className="mt-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">🎨 Estilo</h5>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Ícone</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.guaranteeIcon || "Shield"}
                            onChange={(e) => updateElement(selectedElementData.id, { guaranteeIcon: e.target.value })}
                          >
                            <option value="Shield">Escudo</option>
                            <option value="CheckCircle">Check</option>
                            <option value="Award">Prêmio</option>
                            <option value="Star">Estrela</option>
                            <option value="Heart">Coração</option>
                            <option value="Lock">Cadeado</option>
                            <option value="Zap">Raio</option>
                            <option value="Trophy">Troféu</option>
                            <option value="Gift">Presente</option>
                          </select>
                        </div>

                        <div>
                          <Label>Layout</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.guaranteeLayout || "horizontal"}
                            onChange={(e) => updateElement(selectedElementData.id, { guaranteeLayout: e.target.value })}
                          >
                            <option value="horizontal">Horizontal</option>
                            <option value="vertical">Vertical</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Estilo</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.guaranteeStyle || "card"}
                            onChange={(e) => updateElement(selectedElementData.id, { guaranteeStyle: e.target.value })}
                          >
                            <option value="card">Card</option>
                            <option value="minimal">Minimal</option>
                            <option value="shadow">Sombra</option>
                          </select>
                        </div>

                        <div>
                          <Label>Largura (%)</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.guaranteeWidth || 100}
                            onChange={(e) => updateElement(selectedElementData.id, { guaranteeWidth: parseInt(e.target.value) })}
                          >
                            <option value={25}>25%</option>
                            <option value={50}>50%</option>
                            <option value={75}>75%</option>
                            <option value={100}>100%</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-sm mb-3">🎨 Formatação do Título</h5>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Tamanho</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.guaranteeTitleSize || "lg"}
                            onChange={(e) => updateElement(selectedElementData.id, { guaranteeTitleSize: e.target.value })}
                          >
                            <option value="xs">XS</option>
                            <option value="sm">SM</option>
                            <option value="base">Base</option>
                            <option value="lg">LG</option>
                            <option value="xl">XL</option>
                            <option value="2xl">2XL</option>
                          </select>
                        </div>

                        <div>
                          <Label>Peso</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.guaranteeTitleWeight || "semibold"}
                            onChange={(e) => updateElement(selectedElementData.id, { guaranteeTitleWeight: e.target.value })}
                          >
                            <option value="normal">Normal</option>
                            <option value="medium">Medium</option>
                            <option value="semibold">Semibold</option>
                            <option value="bold">Bold</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label>Alinhamento</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.guaranteeTitleAlign || "left"}
                          onChange={(e) => updateElement(selectedElementData.id, { guaranteeTitleAlign: e.target.value })}
                        >
                          <option value="left">Esquerda</option>
                          <option value="center">Centro</option>
                          <option value="right">Direita</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-sm mb-3">🎨 Cores</h5>
                    
                    <div className="space-y-3">
                      <div>
                        <Label>Cor de Fundo</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={selectedElementData.guaranteeBackgroundColor || "#ffffff"}
                            onChange={(e) => updateElement(selectedElementData.id, { guaranteeBackgroundColor: e.target.value })}
                            className="w-12 h-8 p-0 border rounded"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateElement(selectedElementData.id, { guaranteeBackgroundColor: "transparent" })}
                            className="text-xs"
                          >
                            Transparente
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Cor do Título</Label>
                          <Input
                            type="color"
                            value={selectedElementData.guaranteeTitleColor || "#111827"}
                            onChange={(e) => updateElement(selectedElementData.id, { guaranteeTitleColor: e.target.value })}
                            className="w-full h-8 mt-1"
                          />
                        </div>

                        <div>
                          <Label>Cor do Texto</Label>
                          <Input
                            type="color"
                            value={selectedElementData.guaranteeTextColor || "#374151"}
                            onChange={(e) => updateElement(selectedElementData.id, { guaranteeTextColor: e.target.value })}
                            className="w-full h-8 mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Cor do Ícone</Label>
                        <Input
                          type="color"
                          value={selectedElementData.guaranteeIconColor || "#10b981"}
                          onChange={(e) => updateElement(selectedElementData.id, { guaranteeIconColor: e.target.value })}
                          className="w-full h-8 mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Propriedades para Carrossel de Imagens */}
              {selectedElementData.type === "image_carousel" && (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Images className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-800">Carrossel de Imagens</h4>
                    </div>

                    <div className="space-y-4">
                      {/* Configurações Gerais */}
                      <div className="border-b pb-4">
                        <h5 className="font-semibold text-sm mb-3">⚙️ Configurações Gerais</h5>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Altura</Label>
                              <select 
                                className="w-full px-2 py-1 border rounded text-xs"
                                value={selectedElementData.carouselHeight || "medium"}
                                onChange={(e) => updateElement(selectedElementData.id, { carouselHeight: e.target.value })}
                              >
                                <option value="small">Pequena (200px)</option>
                                <option value="medium">Média (300px)</option>
                                <option value="large">Grande (400px)</option>
                                <option value="xlarge">Extra Grande (500px)</option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs">Bordas</Label>
                              <select 
                                className="w-full px-2 py-1 border rounded text-xs"
                                value={selectedElementData.carouselBorderRadius || "lg"}
                                onChange={(e) => updateElement(selectedElementData.id, { carouselBorderRadius: e.target.value })}
                              >
                                <option value="none">Sem bordas</option>
                                <option value="sm">Pequenas</option>
                                <option value="md">Médias</option>
                                <option value="lg">Grandes</option>
                                <option value="xl">Extra Grandes</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Efeito de Transição</Label>
                              <select 
                                className="w-full px-2 py-1 border rounded text-xs"
                                value={selectedElementData.carouselTransition || "slide"}
                                onChange={(e) => updateElement(selectedElementData.id, { carouselTransition: e.target.value })}
                              >
                                <option value="slide">Deslizar</option>
                                <option value="fade">Desvanecer</option>
                                <option value="zoom">Zoom</option>
                                <option value="flip">Virar</option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs">Velocidade</Label>
                              <select 
                                className="w-full px-2 py-1 border rounded text-xs"
                                value={selectedElementData.carouselSpeed || "normal"}
                                onChange={(e) => updateElement(selectedElementData.id, { carouselSpeed: e.target.value })}
                              >
                                <option value="slow">Lenta (1s)</option>
                                <option value="normal">Normal (0.5s)</option>
                                <option value="fast">Rápida (0.3s)</option>
                                <option value="instant">Instantânea (0.1s)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Autoplay e Navegação */}
                      <div className="border-b pb-4">
                        <h5 className="font-semibold text-sm mb-3">🔄 Autoplay e Navegação</h5>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="carousel-autoplay"
                              checked={selectedElementData.carouselAutoplay || false}
                              onChange={(e) => updateElement(selectedElementData.id, { carouselAutoplay: e.target.checked })}
                              className="rounded"
                            />
                            <Label htmlFor="carousel-autoplay" className="text-xs">Ativar reprodução automática</Label>
                          </div>

                          {selectedElementData.carouselAutoplay && (
                            <div>
                              <Label className="text-xs">Intervalo de Autoplay (segundos)</Label>
                              <select 
                                className="w-full px-2 py-1 border rounded text-xs mt-1"
                                value={selectedElementData.carouselAutoplayInterval || "3"}
                                onChange={(e) => updateElement(selectedElementData.id, { carouselAutoplayInterval: parseInt(e.target.value) })}
                              >
                                <option value="2">2 segundos</option>
                                <option value="3">3 segundos</option>
                                <option value="4">4 segundos</option>
                                <option value="5">5 segundos</option>
                                <option value="7">7 segundos</option>
                                <option value="10">10 segundos</option>
                              </select>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="carousel-show-arrows"
                              checked={selectedElementData.carouselShowArrows !== false}
                              onChange={(e) => updateElement(selectedElementData.id, { carouselShowArrows: e.target.checked })}
                              className="rounded"
                            />
                            <Label htmlFor="carousel-show-arrows" className="text-xs">Mostrar setas de navegação</Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="carousel-show-dots"
                              checked={selectedElementData.carouselShowDots !== false}
                              onChange={(e) => updateElement(selectedElementData.id, { carouselShowDots: e.target.checked })}
                              className="rounded"
                            />
                            <Label htmlFor="carousel-show-dots" className="text-xs">Mostrar indicadores (pontinhos)</Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="carousel-infinite"
                              checked={selectedElementData.carouselInfinite !== false}
                              onChange={(e) => updateElement(selectedElementData.id, { carouselInfinite: e.target.checked })}
                              className="rounded"
                            />
                            <Label htmlFor="carousel-infinite" className="text-xs">Loop infinito</Label>
                          </div>
                        </div>
                      </div>

                      {/* Configurações Avançadas de Estilo */}
                      <div className="border-b pb-4">
                        <h5 className="font-semibold text-sm mb-3">🎨 Estilo Avançado</h5>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Ajuste da Imagem</Label>
                              <select 
                                className="w-full px-2 py-1 border rounded text-xs"
                                value={selectedElementData.carouselImageFit || "cover"}
                                onChange={(e) => updateElement(selectedElementData.id, { carouselImageFit: e.target.value })}
                              >
                                <option value="cover">Cobrir (recorta)</option>
                                <option value="contain">Conter (mostra tudo)</option>
                                <option value="fill">Esticar</option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs">Estilo das Setas</Label>
                              <select 
                                className="w-full px-2 py-1 border rounded text-xs"
                                value={selectedElementData.carouselArrowStyle || "simple"}
                                onChange={(e) => updateElement(selectedElementData.id, { carouselArrowStyle: e.target.value })}
                              >
                                <option value="simple">Simples</option>
                                <option value="rounded">Arredondadas</option>
                                <option value="square">Quadradas</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Estilo dos Indicadores</Label>
                              <select 
                                className="w-full px-2 py-1 border rounded text-xs"
                                value={selectedElementData.carouselDotStyle || "dots"}
                                onChange={(e) => updateElement(selectedElementData.id, { carouselDotStyle: e.target.value })}
                              >
                                <option value="dots">Pontos</option>
                                <option value="lines">Linhas</option>
                                <option value="squares">Quadrados</option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs">Tema do Carrossel</Label>
                              <select 
                                className="w-full px-2 py-1 border rounded text-xs"
                                value={selectedElementData.carouselTheme || "default"}
                                onChange={(e) => updateElement(selectedElementData.id, { carouselTheme: e.target.value })}
                              >
                                <option value="default">Padrão</option>
                                <option value="dark">Escuro</option>
                                <option value="minimal">Minimalista</option>
                                <option value="colorful">Colorido</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="carousel-show-thumbnails"
                              checked={selectedElementData.carouselShowThumbnails || false}
                              onChange={(e) => updateElement(selectedElementData.id, { carouselShowThumbnails: e.target.checked })}
                              className="rounded"
                            />
                            <Label htmlFor="carousel-show-thumbnails" className="text-xs">Mostrar miniaturas</Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="carousel-show-progress"
                              checked={selectedElementData.carouselShowProgress || false}
                              onChange={(e) => updateElement(selectedElementData.id, { carouselShowProgress: e.target.checked })}
                              className="rounded"
                            />
                            <Label htmlFor="carousel-show-progress" className="text-xs">Mostrar barra de progresso</Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="carousel-pause-on-hover"
                              checked={selectedElementData.carouselPauseOnHover !== false}
                              onChange={(e) => updateElement(selectedElementData.id, { carouselPauseOnHover: e.target.checked })}
                              className="rounded"
                            />
                            <Label htmlFor="carousel-pause-on-hover" className="text-xs">Pausar ao passar o mouse</Label>
                          </div>
                        </div>
                      </div>

                      {/* Configurações de Responsividade */}
                      <div className="border-b pb-4">
                        <h5 className="font-semibold text-sm mb-3">📱 Responsividade</h5>
                        
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">Slides por visualização (Desktop)</Label>
                            <select 
                              className="w-full px-2 py-1 border rounded text-xs"
                              value={selectedElementData.carouselSlidesToShow || "1"}
                              onChange={(e) => updateElement(selectedElementData.id, { carouselSlidesToShow: parseInt(e.target.value) })}
                            >
                              <option value="1">1 slide</option>
                              <option value="2">2 slides</option>
                              <option value="3">3 slides</option>
                              <option value="4">4 slides</option>
                            </select>
                          </div>

                          <div>
                            <Label className="text-xs">Slides para rolar</Label>
                            <select 
                              className="w-full px-2 py-1 border rounded text-xs"
                              value={selectedElementData.carouselSlidesToScroll || "1"}
                              onChange={(e) => updateElement(selectedElementData.id, { carouselSlidesToScroll: parseInt(e.target.value) })}
                            >
                              <option value="1">1 slide por vez</option>
                              <option value="2">2 slides por vez</option>
                              <option value="3">3 slides por vez</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="carousel-swipe-enabled"
                              checked={selectedElementData.carouselSwipeEnabled !== false}
                              onChange={(e) => updateElement(selectedElementData.id, { carouselSwipeEnabled: e.target.checked })}
                              className="rounded"
                            />
                            <Label htmlFor="carousel-swipe-enabled" className="text-xs">Permitir deslizar (touch/swipe)</Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="carousel-keyboard-nav"
                              checked={selectedElementData.carouselKeyboardNav !== false}
                              onChange={(e) => updateElement(selectedElementData.id, { carouselKeyboardNav: e.target.checked })}
                              className="rounded"
                            />
                            <Label htmlFor="carousel-keyboard-nav" className="text-xs">Navegação por teclado (setas)</Label>
                          </div>
                        </div>
                      </div>

                      {/* Gerenciar Imagens */}
                      <div>
                        <h5 className="font-semibold text-sm mb-3">🖼️ Gerenciar Imagens</h5>
                        
                        <div className="space-y-3">
                          {(selectedElementData.carouselImages || []).map((image: any, index: number) => (
                            <div key={index} className="border rounded p-3 bg-white">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium">Imagem {index + 1}</span>
                                <button
                                  onClick={() => {
                                    const currentImages = selectedElementData.carouselImages || [];
                                    const newImages = currentImages.filter((_: any, i: number) => i !== index);
                                    updateElement(selectedElementData.id, { carouselImages: newImages });
                                  }}
                                  className="text-red-500 hover:text-red-700 text-xs font-bold"
                                >
                                  ×
                                </button>
                              </div>
                              
                              <div className="space-y-2">
                                <div>
                                  <Label className="text-xs">URL da Imagem</Label>
                                  <Input
                                    type="text"
                                    value={image.url || ""}
                                    onChange={(e) => {
                                      const currentImages = [...(selectedElementData.carouselImages || [])];
                                      currentImages[index] = { ...currentImages[index], url: e.target.value };
                                      updateElement(selectedElementData.id, { carouselImages: currentImages });
                                    }}
                                    placeholder="https://exemplo.com/imagem.jpg"
                                    className="text-xs"
                                  />
                                </div>
                                
                                <div>
                                  <Label className="text-xs">Título</Label>
                                  <Input
                                    type="text"
                                    value={image.title || ""}
                                    onChange={(e) => {
                                      const currentImages = [...(selectedElementData.carouselImages || [])];
                                      currentImages[index] = { ...currentImages[index], title: e.target.value };
                                      updateElement(selectedElementData.id, { carouselImages: currentImages });
                                    }}
                                    placeholder="Título da imagem"
                                    className="text-xs"
                                  />
                                </div>
                                
                                <div>
                                  <Label className="text-xs">Legenda</Label>
                                  <Input
                                    type="text"
                                    value={image.caption || ""}
                                    onChange={(e) => {
                                      const currentImages = [...(selectedElementData.carouselImages || [])];
                                      currentImages[index] = { ...currentImages[index], caption: e.target.value };
                                      updateElement(selectedElementData.id, { carouselImages: currentImages });
                                    }}
                                    placeholder="Legenda da imagem"
                                    className="text-xs"
                                  />
                                </div>
                                
                                <div>
                                  <Label className="text-xs">Texto Alternativo (Alt)</Label>
                                  <Input
                                    type="text"
                                    value={image.alt || ""}
                                    onChange={(e) => {
                                      const currentImages = [...(selectedElementData.carouselImages || [])];
                                      currentImages[index] = { ...currentImages[index], alt: e.target.value };
                                      updateElement(selectedElementData.id, { carouselImages: currentImages });
                                    }}
                                    placeholder="Descrição para acessibilidade"
                                    className="text-xs"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <button
                            onClick={() => {
                              const currentImages = selectedElementData.carouselImages || [];
                              const newImage = {
                                id: `img-${Date.now()}`,
                                url: "https://via.placeholder.com/600x300/3b82f6/white?text=Nova+Imagem",
                                alt: "Nova imagem",
                                caption: "Legenda da nova imagem",
                                title: "Título da Nova Imagem"
                              };
                              updateElement(selectedElementData.id, { carouselImages: [...currentImages, newImage] });
                            }}
                            className="w-full px-3 py-2 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                          >
                            + Adicionar Nova Imagem
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Propriedades para FAQ */}
              {selectedElementData.type === "faq" && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <HelpCircle className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">FAQ</h4>
                    </div>

                    <div className="space-y-4">
                      {/* Configurações Gerais */}
                      <div className="border-b pb-4">
                        <h5 className="font-semibold text-sm mb-3">⚙️ Configurações Gerais</h5>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Estilo</Label>
                              <select 
                                className="w-full px-2 py-1 border rounded text-xs mt-1"
                                value={selectedElementData.faqStyle || "accordion"}
                                onChange={(e) => updateElement(selectedElementData.id, { faqStyle: e.target.value })}
                              >
                                <option value="accordion">Accordion</option>
                                <option value="card">Card</option>
                                <option value="simple">Simples</option>
                                <option value="modern">Moderno</option>
                              </select>
                            </div>

                            <div>
                              <Label>Largura (%)</Label>
                              <select 
                                className="w-full px-2 py-1 border rounded text-xs mt-1"
                                value={selectedElementData.faqWidth || 100}
                                onChange={(e) => updateElement(selectedElementData.id, { faqWidth: parseInt(e.target.value) })}
                              >
                                <option value={25}>25%</option>
                                <option value={50}>50%</option>
                                <option value={75}>75%</option>
                                <option value={100}>100%</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Múltiplas Abertas</Label>
                            <input
                              type="checkbox"
                              checked={selectedElementData.faqOpenMultiple || false}
                              onChange={(e) => updateElement(selectedElementData.id, { faqOpenMultiple: e.target.checked })}
                              className="h-4 w-4"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Animação</Label>
                            <input
                              type="checkbox"
                              checked={selectedElementData.faqAnimation !== false}
                              onChange={(e) => updateElement(selectedElementData.id, { faqAnimation: e.target.checked })}
                              className="h-4 w-4"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Formatação do Título */}
                      <div className="border-b pb-4">
                        <h5 className="font-semibold text-sm mb-3">🎨 Formatação do Título</h5>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Tamanho</Label>
                              <select 
                                className="w-full px-2 py-1 border rounded text-xs mt-1"
                                value={selectedElementData.faqTitleSize || "base"}
                                onChange={(e) => updateElement(selectedElementData.id, { faqTitleSize: e.target.value })}
                              >
                                <option value="xs">XS</option>
                                <option value="sm">SM</option>
                                <option value="base">Base</option>
                                <option value="lg">LG</option>
                                <option value="xl">XL</option>
                                <option value="2xl">2XL</option>
                              </select>
                            </div>

                            <div>
                              <Label>Peso</Label>
                              <select 
                                className="w-full px-2 py-1 border rounded text-xs mt-1"
                                value={selectedElementData.faqTitleWeight || "medium"}
                                onChange={(e) => updateElement(selectedElementData.id, { faqTitleWeight: e.target.value })}
                              >
                                <option value="normal">Normal</option>
                                <option value="medium">Medium</option>
                                <option value="semibold">Semibold</option>
                                <option value="bold">Bold</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <Label>Alinhamento do Título</Label>
                            <select 
                              className="w-full px-2 py-1 border rounded text-xs mt-1"
                              value={selectedElementData.faqTitleAlign || "left"}
                              onChange={(e) => updateElement(selectedElementData.id, { faqTitleAlign: e.target.value })}
                            >
                              <option value="left">Esquerda</option>
                              <option value="center">Centro</option>
                              <option value="right">Direita</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Cores */}
                      <div className="border-b pb-4">
                        <h5 className="font-semibold text-sm mb-3">🎨 Cores</h5>
                        
                        <div className="space-y-3">
                          <div>
                            <Label>Cor de Fundo</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                type="color"
                                value={selectedElementData.faqBackgroundColor || "#ffffff"}
                                onChange={(e) => updateElement(selectedElementData.id, { faqBackgroundColor: e.target.value })}
                                className="w-12 h-8 p-0 border rounded"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateElement(selectedElementData.id, { faqBackgroundColor: "transparent" })}
                                className="text-xs"
                              >
                                Transparente
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Cor do Título</Label>
                              <Input
                                type="color"
                                value={selectedElementData.faqHeaderColor || "#111827"}
                                onChange={(e) => updateElement(selectedElementData.id, { faqHeaderColor: e.target.value })}
                                className="w-full h-8 mt-1"
                              />
                            </div>

                            <div>
                              <Label>Cor do Texto</Label>
                              <Input
                                type="color"
                                value={selectedElementData.faqTextColor || "#374151"}
                                onChange={(e) => updateElement(selectedElementData.id, { faqTextColor: e.target.value })}
                                className="w-full h-8 mt-1"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Cor da Borda</Label>
                            <Input
                              type="color"
                              value={selectedElementData.faqBorderColor || "#e5e7eb"}
                              onChange={(e) => updateElement(selectedElementData.id, { faqBorderColor: e.target.value })}
                              className="w-full h-8 mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Edição Individual das Perguntas */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-sm">✏️ Editar Perguntas</h5>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const currentFaqData = selectedElementData.faqData || [
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

                              const newFaq = {
                                id: `faq-${Date.now()}`,
                                question: "Nova pergunta",
                                answer: "Nova resposta"
                              };
                              
                              updateElement(selectedElementData.id, {
                                faqData: [...currentFaqData, newFaq]
                              });
                            }}
                            className="text-xs"
                          >
                            + Adicionar
                          </Button>
                        </div>

                        <div className="max-h-80 overflow-y-auto space-y-3">
                          {(selectedElementData.faqData || [
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
                          ]).map((faq, index) => (
                            <div key={faq.id} className="p-3 border rounded-lg bg-white">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-600">FAQ #{index + 1}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const currentFaqData = selectedElementData.faqData || [];
                                    const updatedFaqData = currentFaqData.filter(item => item.id !== faq.id);
                                    updateElement(selectedElementData.id, {
                                      faqData: updatedFaqData
                                    });
                                  }}
                                  className="text-xs text-red-600 hover:text-red-700 h-6 w-6 p-0"
                                >
                                  ×
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <Label className="text-xs">Pergunta</Label>
                                  <Input
                                    value={faq.question}
                                    onChange={(e) => {
                                      const currentFaqData = selectedElementData.faqData || [];
                                      const updatedFaqData = currentFaqData.map(item =>
                                        item.id === faq.id
                                          ? { ...item, question: e.target.value }
                                          : item
                                      );
                                      updateElement(selectedElementData.id, {
                                        faqData: updatedFaqData
                                      });
                                    }}
                                    className="text-xs mt-1"
                                    placeholder="Digite a pergunta"
                                  />
                                </div>

                                <div>
                                  <Label className="text-xs">Resposta</Label>
                                  <textarea
                                    value={faq.answer}
                                    onChange={(e) => {
                                      const currentFaqData = selectedElementData.faqData || [];
                                      const updatedFaqData = currentFaqData.map(item =>
                                        item.id === faq.id
                                          ? { ...item, answer: e.target.value }
                                          : item
                                      );
                                      updateElement(selectedElementData.id, {
                                        faqData: updatedFaqData
                                      });
                                    }}
                                    className="w-full px-2 py-1 border rounded text-xs mt-1 resize-none"
                                    rows={3}
                                    placeholder="Digite a resposta"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Propriedades para Barra de Progresso */}
              {selectedElementData.type === "progress_bar" && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">Barra de Progresso</h4>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Texto do Progresso</Label>
                        <Input
                          value={selectedElementData.progressText || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { progressText: e.target.value })}
                          placeholder="Ex: Carregando..."
                          className="text-xs mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Duração (segundos)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="30"
                            value={selectedElementData.progressDuration || 5}
                            onChange={(e) => updateElement(selectedElementData.id, { progressDuration: parseInt(e.target.value) || 5 })}
                            className="text-xs mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">Altura (pixels)</Label>
                          <Input
                            type="number"
                            min="4"
                            max="50"
                            value={selectedElementData.progressHeight || 8}
                            onChange={(e) => updateElement(selectedElementData.id, { progressHeight: parseInt(e.target.value) || 8 })}
                            className="text-xs mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Cor da Barra</Label>
                        <Input
                          type="color"
                          value={selectedElementData.progressColor || "#3b82f6"}
                          onChange={(e) => updateElement(selectedElementData.id, { progressColor: e.target.value })}
                          className="h-8 mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Estilo</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.progressStyle || "rounded"}
                            onChange={(e) => updateElement(selectedElementData.id, { progressStyle: e.target.value })}
                          >
                            <option value="rounded">Arredondado</option>
                            <option value="squared">Quadrado</option>
                            <option value="pill">Pill</option>
                          </select>
                        </div>

                        <div>
                          <Label className="text-xs">Animação</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.progressAnimation || "smooth"}
                            onChange={(e) => updateElement(selectedElementData.id, { progressAnimation: e.target.value })}
                          >
                            <option value="smooth">Suave</option>
                            <option value="steps">Por Etapas</option>
                            <option value="bounce">Saltitante</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Mostrar Porcentagem</Label>
                        <input
                          type="checkbox"
                          checked={selectedElementData.progressShowPercentage !== false}
                          onChange={(e) => updateElement(selectedElementData.id, { progressShowPercentage: e.target.checked })}
                          className="h-4 w-4"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Propriedades para Carregamento + Pergunta */}
              {selectedElementData.type === "loading_with_question" && (
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Timer className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-800">Carregamento + Pergunta</h4>
                    </div>

                    {/* Seção de Carregamento */}
                    <div className="space-y-3 mb-4">
                      <h6 className="font-semibold text-sm text-purple-600">🔄 Carregamento</h6>
                      
                      <div>
                        <Label className="text-xs">Texto do Carregamento</Label>
                        <Input
                          value={selectedElementData.loadingText || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { loadingText: e.target.value })}
                          placeholder="Deixe vazio para não mostrar texto"
                          className="text-xs mt-1"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          💡 Deixe vazio para ocultar o texto de carregamento
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Duração (segundos)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="15"
                            value={selectedElementData.loadingDuration || 3}
                            onChange={(e) => updateElement(selectedElementData.id, { loadingDuration: parseInt(e.target.value) || 3 })}
                            className="text-xs mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">Altura (pixels)</Label>
                          <Input
                            type="number"
                            min="4"
                            max="50"
                            value={selectedElementData.loadingHeight || 8}
                            onChange={(e) => updateElement(selectedElementData.id, { loadingHeight: parseInt(e.target.value) || 8 })}
                            className="text-xs mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Cor da Barra</Label>
                        <Input
                          type="color"
                          value={selectedElementData.loadingColor || "#3b82f6"}
                          onChange={(e) => updateElement(selectedElementData.id, { loadingColor: e.target.value })}
                          className="h-8 mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Estilo</Label>
                          <select 
                            className="w-full px-2 py-1 border rounded text-xs mt-1"
                            value={selectedElementData.loadingStyle || "rounded"}
                            onChange={(e) => updateElement(selectedElementData.id, { loadingStyle: e.target.value })}
                          >
                            <option value="rounded">Arredondado</option>
                            <option value="squared">Quadrado</option>
                            <option value="pill">Pill</option>
                          </select>
                        </div>

                        <div>
                          <Label className="text-xs">Mostrar %</Label>
                          <input
                            type="checkbox"
                            checked={selectedElementData.loadingShowPercentage !== false}
                            onChange={(e) => updateElement(selectedElementData.id, { loadingShowPercentage: e.target.checked })}
                            className="h-4 w-4"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Seção da Pergunta */}
                    <div className="space-y-3 border-t pt-4">
                      <h6 className="font-semibold text-sm text-purple-600">❓ Pergunta</h6>
                      
                      <div>
                        <Label className="text-xs">Título da Pergunta</Label>
                        <Input
                          value={selectedElementData.questionTitle || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { questionTitle: e.target.value })}
                          placeholder="Ex: Você gostou do resultado?"
                          className="text-xs mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Descrição (Opcional)</Label>
                        <Input
                          value={selectedElementData.questionDescription || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { questionDescription: e.target.value })}
                          placeholder="Ex: Sua resposta nos ajuda a melhorar"
                          className="text-xs mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Texto Botão "Sim"</Label>
                          <Input
                            value={selectedElementData.yesButtonText || ""}
                            onChange={(e) => updateElement(selectedElementData.id, { yesButtonText: e.target.value })}
                            placeholder="Sim"
                            className="text-xs mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">Texto Botão "Não"</Label>
                          <Input
                            value={selectedElementData.noButtonText || ""}
                            onChange={(e) => updateElement(selectedElementData.id, { noButtonText: e.target.value })}
                            placeholder="Não"
                            className="text-xs mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Field ID da Resposta</Label>
                        <Input
                          value={selectedElementData.fieldId || ""}
                          onChange={(e) => updateElement(selectedElementData.id, { fieldId: e.target.value })}
                          placeholder="Ex: satisfacao_usuario"
                          className="text-xs mt-1"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Usado para capturar a resposta (sim/não) nas campanhas
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Painel de IDs de Remarketing - Elementos com Campo */}
              {selectedElementData && selectedElementData.fieldId && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-green-600">🎯</span>
                    <h3 className="text-sm font-bold text-green-800">ID de Remarketing</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border">
                      <div className="text-xs text-gray-600 mb-1">ID Gerado Automaticamente:</div>
                      <div className="flex items-center gap-2">
                        <div className="font-mono text-sm bg-gray-100 p-2 rounded border flex-1">
                          {generateRemarketingId(activePage + 1, 'quiz', selectedElementData.fieldId)}
                        </div>
                        <div className="group relative">
                          <span className="text-gray-400 cursor-help" title="Campo não editável - cite essa variável em outra etapa ou use em suas campanhas de remarketing">
                            🔒
                          </span>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                            Cite essa variável em outra etapa ou use em suas campanhas de remarketing
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Painel Geral - Todos os IDs do Quiz */}
              {pages?.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-purple-600">📊</span>
                    <h3 className="text-sm font-bold text-purple-800">IDs Disponíveis para Campanhas</h3>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {pages.map((page, pageIndex) =>
                      page.elements
                        ?.filter(el => el.fieldId)
                        .map((element, elementIndex) => (
                          <div key={`${pageIndex}-${elementIndex}`} className="bg-white p-2 rounded border text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-mono text-purple-700 flex-1">
                                {generateRemarketingId(pageIndex + 1, 'quiz', element.fieldId)}
                              </div>
                              <div className="group relative">
                                <span className="text-gray-400 cursor-help">🔒</span>
                                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                  Cite essa variável em outra etapa ou use em suas campanhas de remarketing
                                </div>
                              </div>
                            </div>
                            <div className="text-gray-600 mt-1">
                              Página {pageIndex + 1} - {element.type === 'multiple_choice' ? 'Múltipla Escolha' :
                               element.type === 'text' ? 'Texto' :
                               element.type === 'email' ? 'Email' :
                               element.type === 'rating' ? 'Avaliação' :
                               element.type === 'number' ? 'Número' :
                               element.type === 'date' ? 'Data' : 'Campo'}
                            </div>
                          </div>
                        ))
                    ).flat()}
                    {!pages.some(page => page.elements?.some(el => el.fieldId)) && (
                      <div className="text-center text-gray-500 text-xs py-4">
                        Nenhum campo de coleta configurado.
                        <br />
                        Adicione Field IDs aos elementos para gerar IDs de remarketing.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Configurações removidas - agora disponíveis na aba "Páginas" */}
              
              {/* Instruções */}
              <div className="text-center text-gray-500">
                <Settings className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-semibold mb-2">Configurações da Página</h3>
                <p className="text-sm">Clique em um elemento para editar suas propriedades ou use a aba "Páginas" para configurações globais.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}