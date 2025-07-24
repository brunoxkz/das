// Tipos de alinhamento de texto
export type TextAlign = 'left' | 'center' | 'right';

// Tipos de tamanho
export type SizeType = 'sm' | 'md' | 'lg';
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

// Tipos de layout
export type LayoutType = 'vertical' | 'horizontal' | 'grid';
export type ButtonStyle = 'rectangular' | 'rounded' | 'pills';

// Tipos de background
export type BackgroundType = 'solid' | 'gradient' | 'image';
export type GradientDirection = 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-br' | 'to-bl' | 'to-tr' | 'to-tl';

// Tipos de contador
export type CounterType = 'countdown' | 'chronometer';

// Tipos de loader
export type LoaderType = 'spinner' | 'dots' | 'bars' | 'pulse' | 'ring';

// Tipos de redirecionamento
export type RedirectAction = 'url' | 'next_page';
export type RedirectType = 'immediate' | 'countdown';

// Tipos de rating
export type RatingType = 'numbers' | 'colors' | 'icons' | 'custom';

// Tipos de animação
export type AnimationType = 'smooth' | 'fast' | 'bouncy' | 'elastic';

// Tipos de bordas
export type BorderRadius = 'none' | 'small' | 'medium' | 'large' | 'full';
export type BorderWidth = 'small' | 'medium' | 'large' | 'thin' | 'extra_large';
export type BorderStyle = 'rounded' | 'square' | 'slightly_rounded' | 'very_rounded';

// Interface base para elementos
export interface Element {
  id: string | number;
  type: string;
  content?: string;
  
  // Propriedades de texto
  textAlign?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  textColor?: string;
  color?: string;
  
  // Propriedades de layout
  layout?: string;
  buttonStyle?: string;
  
  // Propriedades de background
  backgroundType?: string;
  gradientDirection?: string;
  
  // Propriedades específicas de elementos
  counterType?: string;
  chronometerHours?: number;
  chronometerMinutes?: number;
  chronometerSeconds?: number;
  
  // Propriedades de loader
  loaderType?: string;
  loaderSize?: string;
  alternatingText1?: string;
  alternatingDuration1?: number;
  alternatingText2?: string;
  alternatingDuration2?: number;
  alternatingText3?: string;
  alternatingDuration3?: number;
  
  // Propriedades de redirecionamento
  redirectAction?: string;
  redirectType?: string;
  
  // Propriedades de rating
  ratingType?: string;
  
  // Propriedades de animação
  animationType?: string;
  
  // Propriedades de bordas
  borderRadius?: string;
  borderWidth?: string;
  borderStyle?: string;
  
  // Propriedades gerais
  size?: string;
  alignment?: string;
  fieldId?: string;
  required?: boolean;
  placeholder?: string;
  options?: any[];
  
  // Outras propriedades específicas
  [key: string]: any;
}

// Interface para páginas
export interface Page {
  id: number;
  title: string;
  elements: Element[];
  isTransition?: boolean;
}

// Interface para quiz
export interface Quiz {
  title: string;
  description: string;
  structure: {
    pages?: Page[];
    questions?: any[];
    settings: {
      theme: string;
      showProgressBar: boolean;
      collectEmail: boolean;
      collectName: boolean;
      collectPhone: boolean;
      resultTitle?: string;
      resultDescription?: string;
      // MODO DINÂMICO - Profile Building System
      dynamicMode?: boolean;
      dynamicShowName?: boolean;
      dynamicShowDate?: boolean;
      dynamicShowAge?: boolean;
      dynamicShowEmail?: boolean;
      dynamicShowPhone?: boolean;
      dynamicShowCity?: boolean;
      dynamicShowProfession?: boolean;
      dynamicShowGoal?: boolean;
    };
  };
  design?: {
    brandingLogo: string;
    logoUpload: string;
    logoUrl: string;
    logoPosition: string;
    progressBarColor: string;
    progressBarStyle: string;
    progressBarHeight: string | number;
    showProgressBar: boolean;
    buttonColor: string;
    buttonStyle: string;
    backgroundColor: string;
    favicon: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
  };
  leadCapture?: any;
  published?: boolean;
  trackingPixels?: any;
  customHeadScript?: string;
}