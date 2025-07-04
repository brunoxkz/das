import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Plus, 
  Eye, 
  Settings, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Edit3,
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
  Calculator
} from "lucide-react";

interface Element {
  id: number;
  type: "multiple_choice" | "text" | "rating" | "email" | "checkbox" | "date" | "phone" | "number" | "textarea" | "image_upload" | "animated_transition" | "heading" | "paragraph" | "image" | "divider" | "video" | "audio" | "birth_date" | "height" | "current_weight" | "target_weight" | "transition_background" | "transition_text" | "transition_counter" | "transition_loader" | "transition_redirect" | "spacer" | "game_wheel" | "game_scratch" | "game_color_pick" | "game_brick_break" | "game_memory_cards" | "game_slot_machine" | "continue_button";
  content: string;
  question?: string;
  description?: string;
  options?: string[];
  required?: boolean;
  fieldId?: string;
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
  unit?: "cm" | "m"; // Para altura
  showAgeCalculation?: boolean; // Para data de nascimento
  showBMICalculation?: boolean; // Para peso
  minAge?: number;
  maxAge?: number;
  phoneValidation?: "brazilian" | "free"; // Para validação de telefone
  
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
}

export function PageEditorHorizontal({ pages, onPagesChange }: PageEditorProps) {
  const [activePage, setActivePage] = useState(0);
  const [selectedElement, setSelectedElement] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'visual' | 'comportamento'>('visual');
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [editingPageTitle, setEditingPageTitle] = useState("");
  const [draggedPage, setDraggedPage] = useState<number | null>(null);
  const [dragOverPage, setDragOverPage] = useState<number | null>(null);


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
      continue_button: "Botão Continuar"
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
      ]
    },
    {
      name: "📋 Formulário",
      elements: [
        { type: "birth_date", label: "Nascimento", icon: <Calendar className="w-4 h-4" /> },
        { type: "height", label: "Altura", icon: <Hash className="w-4 h-4" /> },
        { type: "current_weight", label: "Peso Atual", icon: <Hash className="w-4 h-4" /> },
        { type: "target_weight", label: "Peso Meta", icon: <Hash className="w-4 h-4" /> },
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
      name: "🔄 Navegação",
      elements: [
        { type: "continue_button", label: "Botão", icon: <ArrowRight className="w-4 h-4" /> },
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
    ],
  },
  {
    name: "🔄 Navegação",
    elements: [
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
        setActivePage(newPages.length - 1);
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
      setActivePage(toIndex);
    } else if (activePage > fromIndex && activePage <= toIndex) {
      setActivePage(activePage - 1);
    } else if (activePage < fromIndex && activePage >= toIndex) {
      setActivePage(activePage + 1);
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
      content: type === "heading" ? "Novo título" : type === "paragraph" ? "Novo parágrafo" : type === "continue_button" ? "Continuar" : "",
      question: undefined,
      options: type === "multiple_choice" ? ["Opção 1", "Opção 2"] : undefined,
      required: false,
      fieldId: `campo_${Date.now()}`,
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
        buttonHoverColor: "#059669"
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
        return (
          <div className="space-y-3 p-4 border-2 border-dashed border-purple-200 rounded-lg bg-purple-50">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-800">Altura</span>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {element.question || "Qual é sua altura?"}
                {element.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    step="0.01"
                    min={element.unit === "cm" ? "120" : "1.20"}
                    max={element.unit === "cm" ? "220" : "2.20"}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg text-center font-semibold"
                    placeholder={element.unit === "cm" ? "175" : "1.75"}
                    style={{ fontSize: '18px' }}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    {element.unit || "cm"}
                  </span>
                </div>
                
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <ArrowUpDown className="w-6 h-6 text-purple-700 mx-auto" />
                    <div className="text-xs text-purple-600 font-semibold mt-1">
                      {element.unit === "cm" ? "CM" : "M"}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Altura para cálculo do IMC</span>
                </div>
                <div className="text-xs text-purple-700">
                  Esta altura será usada para calcular automaticamente o IMC quando combinada com o peso
                </div>
              </div>
              
              {element.description && (
                <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {element.description}
                </div>
              )}
            </div>
            
            <div className="text-xs text-purple-600 text-center">
              Elemento: Altura • Range: {element.unit === "cm" ? "120-220cm" : "1.20-2.20m"} • Necessário para IMC
            </div>
          </div>
        );
      case "current_weight":
        return (
          <div className="space-y-3 p-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Peso Atual</span>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {element.question || "Qual é seu peso atual?"}
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
                    placeholder="70.5"
                    style={{ fontSize: '18px' }}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    kg
                  </span>
                </div>
                
                {element.showBMICalculation && (
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs text-green-600 font-semibold">IMC</div>
                      <div className="text-sm font-bold text-green-700">--</div>
                    </div>
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
              
              {element.description && (
                <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {element.description}
                </div>
              )}
            </div>
            
            <div className="text-xs text-blue-600 text-center">
              Elemento: Peso Atual • Range: 30-300kg
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
        const buttonSize = element.buttonSize || "medium";
        const buttonBorderRadius = element.buttonBorderRadius || "medium";
        const buttonBgColor = element.buttonBackgroundColor || "#10B981";
        const buttonTextColor = element.buttonTextColor || "#FFFFFF";
        
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
            
            <div className="flex justify-center">
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
              >
                <span className="relative z-10">{buttonText}</span>
                <div className="absolute inset-0 bg-white opacity-20 animate-ping rounded-full"></div>
              </button>
            </div>
            
            <div className="text-xs text-blue-600 text-center">
              Ação: {buttonAction === "next_page" ? "Próxima página" : "URL personalizada"}
              {buttonAction === "url" && element.buttonUrl && (
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
        const wheelSegments = element.wheelSegments || ["Prêmio 1", "Prêmio 2", "Prêmio 3", "Prêmio 4"];
        const wheelColors = element.wheelColors || ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"];
        const winningSegment = element.wheelWinningSegment || 0;
        
        return (
          <div className="space-y-3 p-4 border-2 border-dashed border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-orange-800">Roleta da Sorte</span>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 200 200" className="w-full h-full">
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
                  {/* Ponteiro */}
                  <polygon
                    points="100,20 105,35 95,35"
                    fill={element.wheelPointerColor || "#DC2626"}
                  />
                </svg>
              </div>
              
              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                🎰 Girar Roleta
              </button>
            </div>
            
            <div className="text-xs text-orange-600 text-center">
              Segmentos: {wheelSegments.length} • Vencedor: {wheelSegments[winningSegment]}
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


        
      default:
        return <div className="text-sm text-gray-500">Elemento: {element.type}</div>;
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 1. Painel Páginas */}
      <div className="w-64 border-r bg-white flex-shrink-0 flex flex-col">
        <div className="p-4 border-b bg-vendzz-primary text-white">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Páginas
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2 mb-4">
            {pages.map((page, index) => (
              <div 
                key={page.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={`group p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                  index === activePage 
                    ? 'border-vendzz-primary bg-vendzz-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  draggedPage === index ? 'opacity-50 scale-95' : ''
                } ${
                  dragOverPage === index ? 'border-vendzz-primary border-2 bg-vendzz-primary/10 transform scale-105' : ''
                }`}
                onClick={() => setActivePage(index)}
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
          <div className="space-y-2">
            <Button
              onClick={addPage}
              variant="outline"
              size="sm"
              className="w-full justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Página
            </Button>
            <Button
              onClick={addTransitionPage}
              variant="outline"
              size="sm"
              className="w-full justify-center bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Nova Transição
            </Button>
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

      {/* 2. Painel Elementos */}
      <div className="w-64 border-r bg-white flex-shrink-0 flex flex-col h-full">
        <div className="p-4 border-b bg-vendzz-primary text-white flex-shrink-0">
          <h3 className="font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Elementos
          </h3>
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
                  <div className="grid grid-cols-1 gap-2">
                    {category.elements.map((elementType) => (
                      <Button
                        key={elementType.type}
                        variant="outline"
                        size="sm"
                        className="justify-start h-auto p-3 hover:bg-vendzz-primary/5 hover:border-vendzz-primary"
                        onClick={() => addElement(elementType.type as Element["type"])}
                      >
                        <div className="flex items-center">
                          {elementType.icon}
                          <span className="ml-2 font-medium text-xs">{elementType.label}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Painel Preview */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="p-4 border-b bg-vendzz-primary text-white">
          <h3 className="font-semibold flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
            {currentPage && (
              <Badge variant="secondary" className="ml-2">{currentPage.title}</Badge>
            )}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {currentPage ? (
            <div className="space-y-4 border border-gray-200 rounded-lg p-6 bg-white min-h-[500px] h-auto">
              {currentPage.elements.length === 0 ? (
                <div className="text-center text-gray-500 py-16">
                  <Edit3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Página Vazia</h3>
                  <p className="text-sm">Adicione elementos usando o painel Elementos.</p>
                </div>
              ) : (
                currentPage.elements.map((element) => (
                  <div
                    key={element.id}
                    className={`group relative border-2 border-transparent rounded-lg p-2 hover:border-blue-200 cursor-pointer ${
                      selectedElement === element.id ? "border-blue-400 bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    {renderElementPreview(element)}
                    
                    {/* Controles do elemento */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveElement(element.id, "up");
                        }}
                      >
                        <ChevronUp className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveElement(element.id, "down");
                        }}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0 bg-white/80 hover:bg-white text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(element.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
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

      {/* 4. Painel Propriedades */}
      <div className="w-80 border-l bg-white flex-shrink-0 flex flex-col">
        <div className="p-4 border-b bg-vendzz-primary text-white">
          <h3 className="font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {selectedElementData ? getElementTypeName(selectedElementData.type) : 'Propriedades'}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 73px)' }}>
          {selectedElementData ? (
            <div className="space-y-4">
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
                </div>
              )}

              {selectedElementData.type === "multiple_choice" && (
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

              {/* Propriedades para Campo de Texto */}
              {selectedElementData.type === "text" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="text-question">Título da Pergunta *</Label>
                    <textarea
                      id="text-question"
                      value={selectedElementData.question || ""}
                      onChange={(e) => {
                        if (e.target.value.length <= 240) {
                          updateElement(selectedElementData.id, { question: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 border rounded mt-1 resize-none"
                      placeholder="Digite sua pergunta aqui"
                      maxLength={240}
                      rows={3}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {(selectedElementData.question || "").length}/240 caracteres
                    </div>
                  </div>

                  {/* Formatação do Texto */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-sm mb-3">Formatação do Título</h4>
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

                    <div className="grid grid-cols-2 gap-2 mt-2">
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
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="text-required"
                      checked={selectedElementData.required || false}
                      onChange={(e) => updateElement(selectedElementData.id, { required: e.target.checked })}
                    />
                    <Label htmlFor="text-required">Campo obrigatório</Label>
                  </div>

                  <div>
                    <Label htmlFor="text-placeholder">Placeholder</Label>
                    <Input
                      id="text-placeholder"
                      value={selectedElementData.placeholder || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { placeholder: e.target.value })}
                      className="mt-1"
                      placeholder="Texto de exemplo no campo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="text-field-id">ID do Campo (para captura de leads)</Label>
                    <Input
                      id="text-field-id"
                      value={selectedElementData.fieldId || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { fieldId: e.target.value })}
                      className="mt-1"
                      placeholder="nome_campo"
                    />
                  </div>
                </div>
              )}

              {/* Propriedades para Campo de E-mail */}
              {selectedElementData.type === "email" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email-question">Título da Pergunta *</Label>
                    <textarea
                      id="email-question"
                      value={selectedElementData.question || ""}
                      onChange={(e) => {
                        if (e.target.value.length <= 240) {
                          updateElement(selectedElementData.id, { question: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 border rounded mt-1 resize-none"
                      placeholder="Digite sua pergunta aqui"
                      maxLength={240}
                      rows={3}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {(selectedElementData.question || "").length}/240 caracteres
                    </div>
                  </div>

                  {/* Formatação do Texto */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-sm mb-3">Formatação do Título</h4>
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

                    <div className="grid grid-cols-2 gap-2 mt-2">
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
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="email-required"
                      checked={selectedElementData.required || false}
                      onChange={(e) => updateElement(selectedElementData.id, { required: e.target.checked })}
                    />
                    <Label htmlFor="email-required">Campo obrigatório</Label>
                  </div>

                  <div>
                    <Label htmlFor="email-placeholder">Placeholder</Label>
                    <Input
                      id="email-placeholder"
                      value={selectedElementData.placeholder || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { placeholder: e.target.value })}
                      className="mt-1"
                      placeholder="seuemail@exemplo.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email-field-id">ID do Campo (para captura de leads)</Label>
                    <Input
                      id="email-field-id"
                      value={selectedElementData.fieldId || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { fieldId: e.target.value })}
                      className="mt-1"
                      placeholder="email"
                    />
                  </div>
                </div>
              )}

              {/* Propriedades para Campo de Telefone */}
              {selectedElementData.type === "phone" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone-question">Título da Pergunta *</Label>
                    <textarea
                      id="phone-question"
                      value={selectedElementData.question || ""}
                      onChange={(e) => {
                        if (e.target.value.length <= 240) {
                          updateElement(selectedElementData.id, { question: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 border rounded mt-1 resize-none"
                      placeholder="Digite sua pergunta aqui"
                      maxLength={240}
                      rows={3}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {(selectedElementData.question || "").length}/240 caracteres
                    </div>
                  </div>

                  {/* Formatação do Texto */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-sm mb-3">Formatação do Título</h4>
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

                    <div className="grid grid-cols-2 gap-2 mt-2">
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
                  </div>

                  {/* Validação de Telefone */}
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-semibold text-sm mb-3">Validação de Telefone</h4>
                    <div>
                      <Label className="text-xs">Tipo de Validação</Label>
                      <select 
                        className="w-full px-2 py-1 border rounded text-xs mt-1"
                        value={selectedElementData.phoneValidation || "brazilian"}
                        onChange={(e) => {
                          const validation = e.target.value;
                          updateElement(selectedElementData.id, { 
                            phoneValidation: validation,
                            placeholder: validation === "brazilian" ? "(11) 99999-9999" : "Digite seu telefone"
                          });
                        }}
                      >
                        <option value="brazilian">Telefone Brasileiro</option>
                        <option value="free">Formato Livre</option>
                      </select>
                      <div className="text-xs text-gray-600 mt-1">
                        {selectedElementData.phoneValidation === "brazilian" 
                          ? "Formato: (11) 99999-9999 - Valida telefones brasileiros" 
                          : "Permite qualquer formato de telefone"
                        }
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="phone-required"
                      checked={selectedElementData.required || false}
                      onChange={(e) => updateElement(selectedElementData.id, { required: e.target.checked })}
                    />
                    <Label htmlFor="phone-required">Campo obrigatório</Label>
                  </div>

                  <div>
                    <Label htmlFor="phone-placeholder">Placeholder</Label>
                    <Input
                      id="phone-placeholder"
                      value={selectedElementData.placeholder || (selectedElementData.phoneValidation === "brazilian" ? "(11) 99999-9999" : "Digite seu telefone")}
                      onChange={(e) => updateElement(selectedElementData.id, { placeholder: e.target.value })}
                      className="mt-1"
                      placeholder="Placeholder automático baseado na validação"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone-field-id">ID do Campo (para captura de leads)</Label>
                    <Input
                      id="phone-field-id"
                      value={selectedElementData.fieldId || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { fieldId: e.target.value })}
                      className="mt-1"
                      placeholder="telefone"
                    />
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