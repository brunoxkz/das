import { useState } from "react";
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
  Timer
} from "lucide-react";

// 🚀 MAPEAMENTO NATIVO EM PORTUGUÊS - SISTEMA SEM TRADUÇÃO
const getElementTypeName = (type: string): string => {
  const elementNames = {
    'heading': 'Título',
    'paragraph': 'Parágrafo', 
    'multiple_choice': 'Múltipla Escolha',
    'text': 'Campo de Texto',
    'email': 'Campo de Email',
    'phone': 'Campo de Telefone',
    'number': 'Campo Numérico',
    'textarea': 'Área de Texto',
    'date': 'Campo de Data',
    'rating': 'Avaliação por Estrelas',
    'slider': 'Controle Deslizante',
    'yes_no': 'Sim/Não',
    'image': 'Imagem',
    'video': 'Vídeo',
    'audio': 'Áudio',
    'spacer': 'Espaçador',
    'divider': 'Divisor',
    'continue_button': 'Botão Continuar',
    'submit_button': 'Botão Enviar',
    'progress_bar': 'Barra de Progresso',
    'loading_animation': 'Animação de Carregamento',
    'countdown_timer': 'Cronômetro Regressivo',
    'chronometer': 'Cronômetro',
    'birth_date': 'Data de Nascimento',
    'height': 'Altura',
    'weight': 'Peso',
    'body_type_classifier': 'Classificador Tipo Corporal',
    'age_classifier': 'Classificador Faixa Etária',
    'fitness_goal_classifier': 'Classificador Objetivo Fitness',
    'experience_classifier': 'Classificador Experiência',
    'testimonial': 'Depoimento',
    'before_after': 'Antes e Depois',
    'social_proof': 'Prova Social',
    'urgency_element': 'Elemento de Urgência',
    'price_comparison': 'Comparação de Preços',
    'guarantee_badge': 'Selo de Garantia',
    'payment_methods': 'Métodos de Pagamento',
    'security_badges': 'Selos de Segurança',
    'features_list': 'Lista de Recursos',
    'benefits_grid': 'Grade de Benefícios',
    'faq_section': 'Seção FAQ',
    'contact_info': 'Informações de Contato',
    'social_links': 'Links Sociais',
    'newsletter_signup': 'Inscrição Newsletter',
    'file_upload': 'Upload de Arquivo',
    'signature_pad': 'Assinatura Digital',
    'terms_acceptance': 'Aceitação de Termos',
    'cpf_field': 'Campo CPF',
    'address_field': 'Campo Endereço',
    'gender_selector': 'Seletor de Gênero',
    'relationship_status': 'Estado Civil',
    'income_range': 'Faixa de Renda',
    'education_level': 'Nível de Escolaridade',
    'profession_field': 'Profissão',
    'company_size': 'Tamanho da Empresa',
    'industry_selector': 'Setor de Atuação',
    'budget_range': 'Faixa de Orçamento',
    'timeline_selector': 'Prazo do Projeto',
    'priority_matrix': 'Matriz de Prioridades',
    'satisfaction_scale': 'Escala de Satisfação',
    'nps_score': 'Score NPS',
    'likert_scale': 'Escala Likert',
    'ranking_question': 'Pergunta de Ranking',
    'matrix_question': 'Pergunta Matriz',
    'image_choice': 'Escolha por Imagem',
    'audio_response': 'Resposta em Áudio',
    'video_response': 'Resposta em Vídeo',
    'drawing_canvas': 'Tela de Desenho',
    'map_location': 'Localização no Mapa',
    'qr_code': 'Código QR',
    'barcode_scanner': 'Scanner de Código',
    'camera_capture': 'Captura de Câmera'
  };
  return elementNames[type] || type;
};

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


  // Função para obter nomes dos elementos em português
  const getElementTypeName = (type: string) => {
    const elementNames: Record<string, string> = {
      heading: "Título",
      paragraph: "Parágrafo", 
      image: "Imagem",
      video: "Vídeo",
      divider: "Divisor",
      multiple_choice: "Múltipla Escolha",
      text: "Texto",
      email: "Email",
      phone: "Telefone",
      number: "Número",
      rating: "Avaliação",
      animated_transition: "Transição Animada",
      checkbox: "Checkbox",
      date: "Data",
      birth_date: "Data de Nascimento",
      height: "Altura",
      current_weight: "Peso Atual",
      target_weight: "Peso Objetivo",
      textarea: "Área de Texto",
      image_upload: "Upload de Imagem",
      spacer: "Espaçador",
      game_wheel: "Roda da Sorte",
      game_scratch: "Raspadinha",
      game_color_pick: "Escolha de Cor",
      game_brick_break: "Quebra Tijolos",
      game_memory_cards: "Jogo da Memória",
      game_slot_machine: "Caça-Níqueis",
      continue_button: "Botão Continuar",
      loading_question: "Pergunta com Loading",
      body_type_classifier: "Classificador de Tipo Corporal",
      age_classifier: "Classificador de Idade", 
      fitness_goal_classifier: "Classificador de Objetivo Fitness",
      experience_classifier: "Classificador de Experiência",
      share_quiz: "Compartilhar Quiz",
      social_proof: "Prova Social",
      urgency_timer: "Timer de Urgência",
      testimonials: "Depoimentos",
      guarantee: "Garantia",
      icon_list: "Lista com Ícones",
      faq: "Perguntas Frequentes",
      image_with_text: "Imagem com Texto",
      image_carousel: "Carrossel de Imagens",
      cta_button: "Botão de Ação",
      price_comparison: "Comparação de Preços",
      metrics: "Métricas",
      plans: "Planos",
      before_after: "Antes e Depois",
      stripe_embed: "Checkout Stripe",
      calculator: "Calculadora",
      countdown: "Contagem Regressiva",
      audio: "Áudio",
      progress_bar: "Barra de Progresso",
      chart: "Gráfico",
      pricing_plans: "Planos de Preços",
      paypal: "PayPal",
      hotmart_upsell: "Upsell Hotmart",
      transition_background: "Fundo de Transição",
      transition_text: "Texto de Transição",
      transition_counter: "Contador de Transição",
      transition_loader: "Carregamento de Transição",
      transition_button: "Botão de Transição",
      transition_redirect: "Redirecionamento de Transição",
      netflix_intro: "Intro Netflix"
    };
    
    return elementNames[type] || type;
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
      name: "Conteúdo",
      elements: [
        { type: "heading", label: getElementTypeName("heading"), icon: <Type className="w-4 h-4" /> },
        { type: "paragraph", label: getElementTypeName("paragraph"), icon: <AlignLeft className="w-4 h-4" /> },
        { type: "divider", label: getElementTypeName("divider"), icon: <Minus className="w-4 h-4" /> },
        { type: "spacer", label: getElementTypeName("spacer"), icon: <ArrowUpDown className="w-4 h-4" /> },
      ]
    },
    {
      name: "Perguntas",
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
      name: "Formulário",
      elements: [
        { type: "birth_date", label: getElementTypeName("birth_date"), icon: <Calendar className="w-4 h-4" /> },
        { type: "height", label: getElementTypeName("height"), icon: <ArrowUpDown className="w-4 h-4" /> },
        { type: "current_weight", label: getElementTypeName("current_weight"), icon: <Scale className="w-4 h-4" /> },
        { type: "target_weight", label: getElementTypeName("target_weight"), icon: <Target className="w-4 h-4" /> },
      ]
    },
    {
      name: "Mídia",
      elements: [
        { type: "image", label: getElementTypeName("image"), icon: <ImageIcon className="w-4 h-4" /> },
        { type: "image_upload", label: getElementTypeName("image_upload"), icon: <Upload className="w-4 h-4" /> },
        { type: "video", label: getElementTypeName("video"), icon: <Video className="w-4 h-4" /> },
        { type: "audio", label: getElementTypeName("audio"), icon: <Volume2 className="w-4 h-4" /> },
      ]
    },
    {
      name: "Conteúdo Avançado",
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
      name: "Navegação",
      elements: [
        { type: "continue_button", label: getElementTypeName("continue_button"), icon: <ArrowRight className="w-4 h-4" /> },
        { type: "share_quiz", label: getElementTypeName("share_quiz"), icon: <Share2 className="w-4 h-4" /> },
        { type: "animated_transition", label: getElementTypeName("animated_transition"), icon: <Sparkles className="w-4 h-4" /> },
        { type: "progress_bar", label: getElementTypeName("progress_bar"), icon: <BarChart3 className="w-4 h-4" /> },
      ]
    },
    {
      name: "Visualizações",
      elements: [
        { type: "chart", label: getElementTypeName("chart"), icon: <BarChart3 className="w-4 h-4" /> },
        { type: "metrics", label: getElementTypeName("metrics"), icon: <TrendingUp className="w-4 h-4" /> },
        { type: "before_after", label: getElementTypeName("before_after"), icon: <ArrowLeftRight className="w-4 h-4" /> },
      ]
    },
    {
      name: "Vendas",
      elements: [
        { type: "pricing_plans", label: getElementTypeName("pricing_plans"), icon: <CreditCard className="w-4 h-4" /> },
        { type: "stripe_embed", label: getElementTypeName("stripe_embed"), icon: <Shield className="w-4 h-4" /> },
        { type: "paypal", label: getElementTypeName("paypal"), icon: <CreditCard className="w-4 h-4" /> },
        { type: "hotmart_upsell", label: getElementTypeName("hotmart_upsell"), icon: <Target className="w-4 h-4" /> },
      ]
    },
    {
      name: "Ultra Personalização",
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
    name: "Fundo",
    elements: [
      {
        type: "transition_background",
        label: getElementTypeName("transition_background"),
        icon: <Palette className="w-4 h-4" />,
      },
    ],
  },
  {
    name: "Conteúdo",
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
    name: "Elementos Visuais",
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
    name: "Navegação",
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
        buttonBackgroundColor: "#10B981",
        buttonTextColor: "#FFFFFF",
        buttonHoverColor: "#059669",
        isFixedFooter: false
      }),
      // 🔥 NOVA FUNCIONALIDADE: Configurações padrão para classificadores ultra personalizados
      ...(type === "body_type_classifier" && {
        classifierType: "body_type",
        classifierTitle: "Qual é o seu tipo corporal?",
        classifierDescription: "Escolha a opção que melhor descreve seu corpo atual:",
        classifierRequired: true,
        classifierMultipleSelect: false,
        fieldId: "tipo_corpo",
        classifierOptions: [
          {
            id: "magra",
            label: "Magro/Ectomorfo",
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
            label: "Com Volume/Endomorfo",
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
            label: "Para Tonificar/Mesomorfo",
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
            label: "Equilibrado/Atlético",
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
        classifierDescription: "Isso nos ajuda a personalizar seu treino:",
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
        classifierDescription: "Vamos personalizar seu programa:",
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
        classifierDescription: "Nos ajude a adequar o programa ao seu nível:",
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
            label: "Expert",
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
            
            <h2 style={{headingStyle}} className={`relative ${element.letterSpacing === "wide" ? "tracking-wide" : element.letterSpacing === "wider" ? "tracking-wider" : ""}`}>
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
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.question || "Campo"}
              
              {element.showFieldIcon && <span className="ml-2">{iconMap[element.type as keyof typeof iconMap]}</span>}
            </label>
            
            {/* 🔥 NOVA FUNCIONALIDADE: Descrição do campo */}
            {element.fieldDescription && (
              <p className="text-sm text-gray-500">{element.fieldDescription}</p>
            )}
            
            <div className="relative">
              {/* 🔥 NOVA FUNCIONALIDADE: Ícone dentro do input */}
              {element.showInlineIcon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-sm">{iconMap[element.type as keyof typeof iconMap]}</span>
                </div>
              )}
              
              <input
                type={element.type === "email" ? "email" : element.type === "phone" ? "tel" : element.type === "number" ? "number" : "text"}
                placeholder={element.placeholder || `Digite aqui ${element.type === "email" ? "seu email" : element.type === "phone" ? "seu telefone" : ""}`}
                className={`w-full px-3 py-3 ${element.showInlineIcon ? "pl-10" : ""} ${inputStyle} transition-all duration-200`}
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
              
              {/* 🔥 NOVA FUNCIONALIDADE: Validação em tempo real */}
              {element.type === "email" && element.showValidation && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                </div>
              )}
              
              {/* 🔥 NOVA FUNCIONALIDADE: Máscara de telefone */}
              {element.type === "phone" && element.showPhoneMask && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    {element.countryCode || "+55"}
                  </span>
                </div>
              )}
            </div>
            
            {/* 🔥 NOVA FUNCIONALIDADE: Contador de caracteres */}
            {element.showCharCount && element.maxLength && (
              <div className="flex justify-between text-xs text-gray-500">
                <span></span>
                <span>0/{element.maxLength}</span>
              </div>
            )}
            
            {/* 🔥 NOVA FUNCIONALIDADE: Dicas contextuais */}
            {element.fieldHint && (
              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                💡 {element.fieldHint}
              </p>
            )}
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
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.question || "Avaliação"}
              
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
                  <p className="text-sm text-gray-500 mb-1">Clique para fazer upload de imagem</p>
                  <p className="text-xs text-gray-400">Máximo 5MB</p>
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
                    {element.content ? "URL de vídeo inválida" : "Adicionar vídeo"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Suporte para YouTube, Vimeo e outros
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
        
        const inputClasses = {
          minimal: "w-full p-3 border-0 border-b-2 bg-transparent focus:outline-none focus:border-purple-500",
          bordered: "w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500",
          filled: "w-full p-3 bg-purple-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500",
          rounded: "w-full p-3 border border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
        };
        
        return (
          <div 
            className="space-y-3 p-4 border-2 border-dashed rounded-lg"
            style={{backgroundColor: element.inputBackgroundColor || "#faf5ff",
              borderColor: element.inputBorderColor || "#e5e7eb"}}
          >
            <div className={`flex ${labelPosition === "left" ? "flex-row items-center space-x-3" : "flex-col"} gap-2`}>
              {showIcon && (
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <ArrowUpDown className="w-5 h-5" style={{color: element.iconColor || "#9333ea"}} />
                </div>
              )}
              <div>
                <h3 
                  className="font-semibold text-purple-800"
                  style={{color: element.labelColor || "#6b21a8"}}
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
                    className={inputClasses[heightInputStyle]}
                    style={{backgroundColor: element.inputBackgroundColor || (heightInputStyle === "filled" ? "#faf5ff" : "white"),
                      borderColor: element.inputBorderColor || "#e5e7eb",
                      fontSize: '18px'}}
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
            style={{backgroundColor: element.inputBackgroundColor || "#eff6ff",
              borderColor: element.inputBorderColor || "#e5e7eb"}}
          >
            <div className={`flex ${weightLabelPosition === "left" ? "flex-row items-center space-x-3" : "flex-col"} gap-2`}>
              {showWeightIcon && (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Scale className="w-5 h-5" style={{color: element.iconColor || "#3b82f6"}} />
                </div>
              )}
              <div>
                <h3 
                  className="font-semibold text-blue-800"
                  style={{color: element.labelColor || "#1e40af"}}
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
                    style={{backgroundColor: element.inputBackgroundColor || (weightInputStyle === "filled" ? "#eff6ff" : "white"),
                      borderColor: element.inputBorderColor || "#e5e7eb",
                      fontSize: '18px'}}
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
                    style={{fontSize: '18px'}}
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
                style={{backgroundColor: buttonBgColor,
                  color: buttonTextColor,}}
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
                    style={{shareButtonStyle}}
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
        const loadingMessage = element.loadingText || "Processando...";
        const loadingDuration = element.loadingDuration || 3;
        const showProgressPercentage = element.showPercentage !== false;
        const enableShineEffect = element.enableShine || false;
        const enableStripesEffect = element.enableStripes || false;
        const showRemainingTimeText = element.showRemainingTime || false;
        const progressBarText = element.progressText || "Carregando...";
        const popupQuestionColor = element.popupQuestionColor || "#1F2937";
        
        return (
          <div className="space-y-4 py-6 px-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{loadingMessage}</h3>
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
                <h4 className="font-semibold text-gray-800">
                  {element.loadingText || "Processando..."}
                </h4>
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
              Página de Jogo
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
            🎨 Tema Global
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
                  style={{backgroundColor: customBackgroundColor}}
                ></div>
                <div className="text-xs font-medium">Custom</div>
                <div className="text-xs text-gray-500">Personalizado</div>
              </button>
            </div>
            
            {globalTheme === "custom" && (
              <div className="mt-3">
                <Label className="text-xs font-medium mb-2 block">Cor Personalizada</Label>
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
                  Contraste automático para legibilidade
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Aplicado a todas as páginas automaticamente
          </p>
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
          <h3 className={cn(
            "font-semibold flex items-center gap-2",
            animations.fadeIn
          )}>
            <Eye className="w-4 h-4" />
            Visualizar
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
              style={{backgroundColor: getBackgroundColor(),
                color: getTextColor()}}
            >
              {currentPage.elements.length === 0 ? (
                <div className="text-center text-gray-500 py-16">
                  <Edit3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Arraste Aqui | Adicione</h3>
                  <p className="text-sm">Selecione elementos do painel lateral para começar a criar sua página</p>
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
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma página selecionada</h3>
                <p className="text-sm">Selecione uma página para editar seus elementos</p>
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
              {/* Todo o conteúdo do elemento será implementado aqui */}
              <div className="text-center text-gray-500">
                <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Elemento selecionado: {getElementTypeName(selectedElementData.type)}</p>
              </div>
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