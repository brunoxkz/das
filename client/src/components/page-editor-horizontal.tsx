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
  Upload
} from "lucide-react";

interface Element {
  id: number;
  type: "multiple_choice" | "text" | "rating" | "email" | "checkbox" | "date" | "phone" | "number" | "textarea" | "image_upload" | "animated_transition" | "heading" | "paragraph" | "image" | "divider";
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
  spacing?: string;
  borderStyle?: string;
  shadowStyle?: string;
}

interface QuizPage {
  id: number;
  title: string;
  elements: Element[];
}

interface PageEditorProps {
  pages: QuizPage[];
  onPagesChange: (pages: QuizPage[]) => void;
}

export function PageEditorHorizontal({ pages, onPagesChange }: PageEditorProps) {
  const [activePage, setActivePage] = useState(0);
  const [selectedElement, setSelectedElement] = useState<number | null>(null);

  // Função para traduzir os tipos de elementos
  const getElementTypeName = (type: string) => {
    const typeNames: Record<string, string> = {
      heading: "Título",
      paragraph: "Parágrafo", 
      image: "Imagem",
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
      textarea: "Área de Texto",
      image_upload: "Upload de Imagem"
    };
    return typeNames[type] || type;
  };

  const elementTypes = [
    { type: "heading", label: "Título", icon: <Type className="w-4 h-4" /> },
    { type: "paragraph", label: "Parágrafo", icon: <AlignLeft className="w-4 h-4" /> },
    { type: "multiple_choice", label: "Múltipla Escolha", icon: <CheckSquare className="w-4 h-4" /> },
    { type: "text", label: "Campo de Texto", icon: <FileText className="w-4 h-4" /> },
    { type: "email", label: "Email", icon: <Mail className="w-4 h-4" /> },
    { type: "phone", label: "Telefone", icon: <Phone className="w-4 h-4" /> },
    { type: "number", label: "Número", icon: <Hash className="w-4 h-4" /> },
    { type: "rating", label: "Avaliação", icon: <Star className="w-4 h-4" /> },
    { type: "date", label: "Data", icon: <Calendar className="w-4 h-4" /> },
    { type: "textarea", label: "Área de Texto", icon: <TextArea className="w-4 h-4" /> },
    { type: "image", label: "Imagem", icon: <ImageIcon className="w-4 h-4" /> },
    { type: "divider", label: "Divisória", icon: <Minus className="w-4 h-4" /> },
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

  const deletePage = (index: number) => {
    if (pages.length > 1) {
      const newPages = pages.filter((_, i) => i !== index);
      onPagesChange(newPages);
      if (activePage >= newPages.length) {
        setActivePage(newPages.length - 1);
      }
    }
  };

  const addElement = (type: Element["type"]) => {
    const newElement: Element = {
      id: Date.now(),
      type,
      content: type === "heading" ? "Novo título" : type === "paragraph" ? "Novo parágrafo" : "",
      question: type === "multiple_choice" ? "Nova pergunta" : undefined,
      options: type === "multiple_choice" ? ["Opção 1", "Opção 2"] : undefined,
      required: false,
      fieldId: `campo_${Date.now()}`,
      placeholder: "",
      fontSize: "base",
      textAlign: "left"
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
                <div key={index} className={`flex items-center space-x-2 p-2 border border-gray-200 hover:border-vendzz-primary hover:bg-vendzz-primary/5 cursor-pointer ${optionClass} ${element.borderStyle === "thick" ? "border-2" : ""} ${element.shadowStyle === "sm" ? "shadow-sm" : element.shadowStyle === "md" ? "shadow-md" : ""}`}>
                  {element.showImages && element.optionImages?.[index] && (
                    <img 
                      src={element.optionImages[index]} 
                      alt={option}
                      className="w-[60px] h-[60px] object-cover rounded"
                    />
                  )}
                  <input 
                    type={element.multipleSelection ? "checkbox" : "radio"} 
                    name={`preview-${element.id}`} 
                    className="rounded" 
                  />
                  <span className="text-sm flex-1">{option}</span>
                  {element.showIcons && element.optionIcons?.[index] && (
                    <span className="text-lg">{element.optionIcons[index]}</span>
                  )}
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
            <label className="block text-sm font-medium text-gray-700">
              {element.question || "Data"}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
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
              <img 
                src={element.imageUrl} 
                alt={element.content || "Imagem"} 
                className="max-w-full h-auto rounded-lg border"
                style={{
                  textAlign: element.textAlign || "center"
                }}
              />
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
            <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Clique para fazer upload</p>
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
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  index === activePage 
                    ? 'border-vendzz-primary bg-vendzz-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setActivePage(index)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{page.title}</h4>
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
          <Button
            onClick={addPage}
            variant="outline"
            size="sm"
            className="w-full justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Página
          </Button>
        </div>
      </div>

      {/* 2. Painel Elementos */}
      <div className="w-64 border-r bg-white flex-shrink-0 flex flex-col">
        <div className="p-4 border-b bg-vendzz-primary text-white">
          <h3 className="font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Elementos
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 gap-2">
            {elementTypes.map((elementType) => (
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
            <div className="space-y-4 border border-gray-200 rounded-lg p-6 bg-white min-h-[500px]">
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
        <div className="flex-1 overflow-y-auto p-4">
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
                        <Label className="text-xs">Opções</Label>
                        <div className="space-y-2 mt-2">
                          {(selectedElementData.options || []).map((option, index) => (
                            <div key={index} className="flex gap-2">
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
                              {selectedElementData.showImages && (
                                <Input
                                  value={selectedElementData.optionImages?.[index] || ""}
                                  onChange={(e) => {
                                    const newImages = [...(selectedElementData.optionImages || [])];
                                    newImages[index] = e.target.value;
                                    updateElement(selectedElementData.id, { optionImages: newImages });
                                  }}
                                  className="w-20 text-xs"
                                  placeholder="URL"
                                />
                              )}
                              {selectedElementData.showIcons && (
                                <Input
                                  value={selectedElementData.optionIcons?.[index] || ""}
                                  onChange={(e) => {
                                    const newIcons = [...(selectedElementData.optionIcons || [])];
                                    newIcons[index] = e.target.value;
                                    updateElement(selectedElementData.id, { optionIcons: newIcons });
                                  }}
                                  className="w-16 text-xs"
                                  placeholder="📝"
                                />
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const newOptions = (selectedElementData.options || []).filter((_, i) => i !== index);
                                  updateElement(selectedElementData.id, { options: newOptions });
                                }}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
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

                      {/* Opções de imagem e ícones */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="showImages"
                            checked={selectedElementData.showImages || false}
                            onChange={(e) => updateElement(selectedElementData.id, { showImages: e.target.checked })}
                          />
                          <Label htmlFor="showImages" className="text-xs">Adicionar imagens (60x60px)</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="showIcons"
                            checked={selectedElementData.showIcons || false}
                            onChange={(e) => updateElement(selectedElementData.id, { showIcons: e.target.checked })}
                          />
                          <Label htmlFor="showIcons" className="text-xs">Adicionar ícones</Label>
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
                      placeholder="campo_email"
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