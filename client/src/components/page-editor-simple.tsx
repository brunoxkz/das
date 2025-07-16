import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Trash2,
  Edit3,
  Type,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Hash,
  AlignLeft,
  Star,
  Image as ImageIcon,
  Minus,
  Sparkles,
  FileText,
  Heading1,
  Menu,
  ChevronLeft,
  ChevronRight,
  Copy
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
  min?: number;
  max?: number;
  color?: string;
  imageUrl?: string;
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

export function PageEditor({ pages, onPagesChange }: PageEditorProps) {
  const [activePage, setActivePage] = useState(0);
  const [selectedElement, setSelectedElement] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'pages' | 'elements'>('pages');

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
    { type: "heading" as const, label: "Título", icon: <Heading1 className="w-4 h-4" /> },
    { type: "paragraph" as const, label: "Parágrafo", icon: <FileText className="w-4 h-4" /> },
    { type: "image" as const, label: "Imagem", icon: <ImageIcon className="w-4 h-4" /> },
    { type: "divider" as const, label: "Divisória", icon: <Minus className="w-4 h-4" /> },
    { type: "multiple_choice" as const, label: "Múltipla Escolha", icon: <MessageSquare className="w-4 h-4" /> },
    { type: "text" as const, label: "Texto", icon: <Type className="w-4 h-4" /> },
    { type: "email" as const, label: "Email", icon: <Mail className="w-4 h-4" /> },
    { type: "phone" as const, label: "Telefone", icon: <Phone className="w-4 h-4" /> },
    { type: "number" as const, label: "Número", icon: <Hash className="w-4 h-4" /> },
    { type: "rating" as const, label: "Avaliação", icon: <Star className="w-4 h-4" /> },
    { type: "animated_transition" as const, label: "Transição", icon: <Sparkles className="w-4 h-4" /> }
  ];

  const addPage = () => {
    const newPage: QuizPage = {
      id: Date.now(),
      title: `Página ${pages.length + 1}`,
      elements: []
    };
    onPagesChange([...pages, newPage]);
    setActivePage(pages.length);
  };

  const duplicatePage = (pageIndex: number) => {
    const pageToDuplicate = pages[pageIndex];
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
    
    const duplicatedPage: QuizPage = {
      id: timestamp,
      title: `${pageToDuplicate.title} (Cópia)`,
      elements: pageToDuplicate.elements.map((element, elementIndex) => {
        const newElement = {
          ...element,
          id: timestamp + elementIndex + 1
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
      })
    };
    
    const newPages = [...pages];
    newPages.splice(pageIndex + 1, 0, duplicatedPage);
    onPagesChange(newPages);
    setActivePage(pageIndex + 1);
  };

  const deletePage = (pageIndex: number) => {
    if (pages.length <= 1) return;
    const newPages = pages.filter((_, index) => index !== pageIndex);
    onPagesChange(newPages);
    if (activePage >= newPages.length) {
      setActivePage(newPages.length - 1);
    }
  };

  const updatePageTitle = (pageIndex: number, title: string) => {
    const newPages = [...pages];
    newPages[pageIndex].title = title;
    onPagesChange(newPages);
  };

  const addElement = (type: Element["type"]) => {
    if (!pages[activePage]) return;

    const newElement: Element = {
      id: Date.now(),
      type,
      content: type === "heading" ? "Novo Título" : type === "paragraph" ? "Novo parágrafo" : "",
      question: ["multiple_choice", "text", "email", "phone", "number", "rating"].includes(type) ? "Nova pergunta" : undefined,
      options: type === "multiple_choice" ? ["Opção 1", "Opção 2"] : undefined,
      required: ["multiple_choice", "text", "email", "phone", "number", "rating"].includes(type),
      fieldId: ["multiple_choice", "text", "email", "phone", "number", "rating"].includes(type) ? 
        (type === "phone" ? `telefone_${Date.now()}` : `campo_${Date.now()}`) : undefined,
      placeholder: type === "email" ? "seu@email.com" : type === "phone" ? "(11) 99999-9999" : "",
      fontSize: type === "heading" ? "xl" : "base",
      textAlign: "left"
    };

    const newPages = [...pages];
    newPages[activePage].elements.push(newElement);
    onPagesChange(newPages);
    setSelectedElement(newElement.id);
  };

  const updateElement = (elementId: number, updates: Partial<Element>) => {
    const newPages = [...pages];
    const pageIndex = activePage;
    const elementIndex = newPages[pageIndex].elements.findIndex(el => el.id === elementId);
    
    if (elementIndex >= 0) {
      newPages[pageIndex].elements[elementIndex] = {
        ...newPages[pageIndex].elements[elementIndex],
        ...updates
      };
      onPagesChange(newPages);
    }
  };

  const deleteElement = (elementId: number) => {
    const newPages = [...pages];
    newPages[activePage].elements = newPages[activePage].elements.filter(el => el.id !== elementId);
    onPagesChange(newPages);
    setSelectedElement(null);
  };

  const currentPage = pages[activePage];
  const selectedElementData = selectedElement 
    ? currentPage?.elements.find(el => el.id === selectedElement)
    : null;

  function renderElementPreview(element: Element) {
    // Helper function to get font size classes
    const getFontSizeClass = (size?: string) => {
      switch (size) {
        case "xs": return "text-xs";
        case "sm": return "text-sm";
        case "base": return "text-base";
        case "lg": return "text-lg";
        case "xl": return "text-xl";
        case "2xl": return "text-2xl";
        case "3xl": return "text-3xl";
        case "4xl": return "text-4xl";
        default: return "text-base";
      }
    };

    // Helper function to get text alignment classes
    const getAlignClass = (align?: string) => {
      switch (align) {
        case "left": return "text-left";
        case "center": return "text-center";
        case "right": return "text-right";
        default: return "text-left";
      }
    };

    switch (element.type) {
      case "heading":
        return (
          <h2 
            className={`font-bold ${getFontSizeClass(element.fontSize || "xl")} ${getAlignClass(element.textAlign)}`}
            style={{ color: element.color || "#000000" }}
          >
            {element.content || "Título"}
          </h2>
        );
      case "paragraph":
        return (
          <p 
            className={`${getFontSizeClass(element.fontSize)} ${getAlignClass(element.textAlign)}`}
            style={{ color: element.color || "#374151" }}
          >
            {element.content || "Parágrafo de texto"}
          </p>
        );
      case "image":
        return (
          <div className={`w-full ${getAlignClass(element.textAlign)}`}>
            {element.imageUrl ? (
              <img 
                src={element.imageUrl} 
                alt={element.content || "Imagem"} 
                className="max-w-full h-auto rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`${element.imageUrl ? 'hidden' : ''} w-full h-32 bg-gray-200 rounded border-2 border-dashed border-gray-300 flex items-center justify-center`}>
              <ImageIcon className="w-8 h-8 text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">
                {element.imageUrl ? 'Erro ao carregar' : 'Adicione URL da imagem'}
              </span>
            </div>
          </div>
        );
      case "divider":
        return <hr className="my-4 border-gray-300" />;
      case "multiple_choice":
        // Configurações de estilo para múltipla escolha
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
            <label className="block text-sm font-medium text-gray-700">
              {element.question || "Pergunta"}
              
            </label>
            <div className={`${containerClass} ${spacingClass}`}>
              {(element.options || ["Opção 1", "Opção 2"]).map((option, index) => (
                <div key={index} className={`flex items-center space-x-2 p-3 border border-gray-200 hover:border-gray-300 cursor-pointer ${optionClass} ${element.borderStyle === "thick" ? "border-2" : ""} ${element.shadowStyle === "sm" ? "shadow-sm" : element.shadowStyle === "md" ? "shadow-md" : ""} transition-all`}>
                  {!element.hideInputs && (
                    <input 
                      type={element.multipleSelection ? "checkbox" : "radio"} 
                      name={`preview-${element.id}`} 
                      className="rounded" 
                      disabled
                    />
                  )}
                  <span className="text-sm flex-1 font-medium" style={{
                    color: element.optionTextColor || "#374151",
                    fontSize: element.optionFontSize === "sm" ? "12px" : element.optionFontSize === "lg" ? "18px" : "14px"
                  }}>
                    {typeof option === 'string' ? option : option?.text || `Opção ${index + 1}`}
                  </span>
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
              {element.question || "Pergunta"}
            </label>
            <input
              type={element.type === "email" ? "email" : element.type === "number" ? "number" : "text"}
              placeholder={element.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled
            />
          </div>
        );
      case "rating":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.question || "Pergunta"}
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Star key={rating} className="w-6 h-6 text-gray-300" />
              ))}
            </div>
          </div>
        );
      default:
        return <div className="text-sm text-gray-500">Elemento: {element.type}</div>;
    }
  }

  return (
    <div className="flex h-screen bg-gray-100" style={{ overflow: 'hidden' }}>
      {/* Sidebar esquerdo com funcionalidade de recolher */}
      <div className={`${sidebarCollapsed ? 'w-12' : 'w-80'} border-r bg-gray-50 transition-all duration-300 relative flex-shrink-0 min-h-0`}>
        {/* Botão de recolher/expandir */}
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 z-10"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>

        {!sidebarCollapsed && (
          <div className="flex-1 flex flex-col">
            {/* Abas */}
            <div className="flex border-b bg-white">
              <button
                className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                  activeTab === 'pages'
                    ? 'text-vendzz-primary border-b-2 border-vendzz-primary bg-vendzz-primary/5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('pages')}
              >
                <FileText className="w-4 h-4" />
                Páginas
              </button>
              <button
                className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                  activeTab === 'elements'
                    ? 'text-vendzz-primary border-b-2 border-vendzz-primary bg-vendzz-primary/5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('elements')}
              >
                <Plus className="w-4 h-4" />
                Elementos
              </button>
            </div>

            {/* Conteúdo das Abas */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'pages' && (
                <div className="space-y-4">
                  {/* Controles de Página */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Suas Páginas</h3>
                      <Button size="sm" onClick={addPage}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {pages.map((page, index) => (
                        <div
                          key={page.id}
                          className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-all ${
                            activePage === index ? 'bg-vendzz-primary/10 border-vendzz-primary' : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setActivePage(index)}
                        >
                          <div>
                            <span className="text-sm font-medium block">{page.title}</span>
                            <span className="text-xs text-gray-500">{page.elements.length} elementos</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-6 h-6 p-0 text-blue-500 hover:bg-blue-50"
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
                                className="w-6 h-6 p-0 text-red-500 hover:bg-red-50"
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
                      ))}
                    </div>
                  </div>

                  {/* Título da Página Ativa */}
                  {currentPage && (
                    <div>
                      <Label htmlFor="page-title">Título da Página</Label>
                      <Input
                        id="page-title"
                        value={currentPage.title}
                        onChange={(e) => updatePageTitle(activePage, e.target.value)}
                        className="mt-1"
                        placeholder="Nome da página..."
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'elements' && (
                <div>
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Adicionar Elementos</h3>
                    <p className="text-xs text-gray-600">Clique em um elemento para adicioná-lo à página ativa</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {elementTypes.map((elementType) => (
                      <Button
                        key={elementType.type}
                        variant="outline"
                        size="sm"
                        className="justify-start h-auto p-3 hover:bg-vendzz-primary/5 hover:border-vendzz-primary"
                        onClick={() => {
                          addElement(elementType.type);
                          setActiveTab('pages'); // Volta para aba de páginas após adicionar
                        }}
                      >
                        <div className="flex items-center">
                          {elementType.icon}
                          <span className="ml-2 font-medium">{elementType.label}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sidebar recolhido */}
        {sidebarCollapsed && (
          <div className="p-2 pt-12">
            <div className="space-y-2">
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0"
                title="Expandir sidebar"
                onClick={() => setSidebarCollapsed(false)}
              >
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Área central - Preview da página */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden max-w-[calc(100vw-720px)]">
        <div className="p-4 border-b flex-shrink-0">
          {currentPage && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">{currentPage.title}</Badge>
              <h2 className="text-lg font-semibold">Preview da Página</h2>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {currentPage ? (
            <div className="w-full space-y-4">
            
            <div className="space-y-4 border border-gray-200 rounded-lg p-6 bg-white min-h-[500px]">
              {currentPage.elements.length === 0 ? (
                <div className="text-center text-gray-500 py-16">
                  <Edit3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Página Vazia</h3>
                  <p className="text-sm">Adicione elementos à sua página usando o painel lateral.</p>
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
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Plus className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma página</h3>
              <p className="text-sm mb-4">Crie sua primeira página para começar.</p>
              <Button onClick={addPage}>Criar Primeira Página</Button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar direito - Propriedades do elemento selecionado */}
      <div className="w-80 border-l bg-gray-50 flex-shrink-0 flex flex-col h-full" style={{ minWidth: '320px', maxWidth: '320px' }}>
        <div className="p-4 border-b bg-vendzz-primary text-white flex-shrink-0">
          <h3 className="font-semibold">
            {selectedElementData ? `Editando: ${getElementTypeName(selectedElementData.type)}` : 'Propriedades do Elemento'}
          </h3>
          {selectedElementData && (
            <p className="text-xs text-green-100 mt-1">
              Clique em outro elemento para editar suas propriedades
            </p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {selectedElementData ? (
          <div className="space-y-4">
            
            {/* Propriedades básicas */}
            {selectedElementData.type === "heading" && (
              <div>
                <Label htmlFor="heading-content">Texto do Título</Label>
                <Input
                  id="heading-content"
                  value={selectedElementData.content}
                  onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                  className="mt-1"
                />
                
                {/* Opções de formatação */}
                <div className="mt-4 space-y-2">
                  <Label>Formatação</Label>
                  <div className="flex gap-2">
                    <select 
                      className="px-2 py-1 border rounded text-sm"
                      value={selectedElementData.fontSize || "xl"}
                      onChange={(e) => updateElement(selectedElementData.id, { fontSize: e.target.value })}
                    >
                      <option value="lg">Pequeno</option>
                      <option value="xl">Normal</option>
                      <option value="2xl">Grande</option>
                      <option value="3xl">Muito Grande</option>
                      <option value="4xl">Gigante</option>
                    </select>
                    
                    <select 
                      className="px-2 py-1 border rounded text-sm"
                      value={selectedElementData.textAlign || "left"}
                      onChange={(e) => updateElement(selectedElementData.id, { textAlign: e.target.value })}
                    >
                      <option value="left">Esquerda</option>
                      <option value="center">Centro</option>
                      <option value="right">Direita</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      className="w-8 h-8 border rounded"
                      value={selectedElementData.color || "#000000"}
                      onChange={(e) => updateElement(selectedElementData.id, { color: e.target.value })}
                    />
                    <Label className="text-sm">Cor do Texto</Label>
                  </div>
                </div>
              </div>
            )}

            {selectedElementData.type === "paragraph" && (
              <div>
                <Label htmlFor="paragraph-content">Texto do Parágrafo</Label>
                <Textarea
                  id="paragraph-content"
                  value={selectedElementData.content}
                  onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                  className="mt-1"
                  rows={4}
                />
                
                {/* Opções de formatação */}
                <div className="mt-4 space-y-2">
                  <Label>Formatação</Label>
                  <div className="flex gap-2">
                    <select 
                      className="px-2 py-1 border rounded text-sm"
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
                    
                    <select 
                      className="px-2 py-1 border rounded text-sm"
                      value={selectedElementData.textAlign || "left"}
                      onChange={(e) => updateElement(selectedElementData.id, { textAlign: e.target.value })}
                    >
                      <option value="left">Esquerda</option>
                      <option value="center">Centro</option>
                      <option value="right">Direita</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      className="w-8 h-8 border rounded"
                      value={selectedElementData.color || "#000000"}
                      onChange={(e) => updateElement(selectedElementData.id, { color: e.target.value })}
                    />
                    <Label className="text-sm">Cor do Texto</Label>
                  </div>
                </div>
              </div>
            )}

            {selectedElementData.type === "image" && (
              <div>
                <Label htmlFor="image-url">URL da Imagem</Label>
                <Input
                  id="image-url"
                  value={selectedElementData.imageUrl || ""}
                  onChange={(e) => updateElement(selectedElementData.id, { imageUrl: e.target.value })}
                  className="mt-1"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                
                <div className="mt-4">
                  <Label htmlFor="image-alt">Texto Alternativo</Label>
                  <Input
                    id="image-alt"
                    value={selectedElementData.content || ""}
                    onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                    className="mt-1"
                    placeholder="Descrição da imagem"
                  />
                </div>
                
                <div className="mt-4">
                  <Label>Alinhamento</Label>
                  <select 
                    className="w-full px-2 py-1 border rounded mt-1"
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

            {["multiple_choice", "text", "email", "phone", "number", "rating", "textarea", "checkbox", "date"].includes(selectedElementData.type) && (
              <>
                <div>
                  <Label htmlFor="question-text">Pergunta</Label>
                  <Input
                    id="question-text"
                    value={selectedElementData.question || ""}
                    onChange={(e) => updateElement(selectedElementData.id, { question: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                {selectedElementData.type !== "rating" && (
                  <div>
                    <Label htmlFor="placeholder">Placeholder</Label>
                    <Input
                      id="placeholder"
                      value={selectedElementData.placeholder || ""}
                      onChange={(e) => updateElement(selectedElementData.id, { placeholder: e.target.value })}
                      className="mt-1"
                      placeholder="Texto de exemplo..."
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="field-id">ID do Campo</Label>
                  <Input
                    id="field-id"
                    value={selectedElementData.fieldId || ""}
                    onChange={(e) => updateElement(selectedElementData.id, { fieldId: e.target.value })}
                    className="mt-1"
                    placeholder={selectedElementData.type === "phone" ? "telefone_" : "nome, email, empresa..."}
                    readOnly={selectedElementData.type === "phone"}
                  />
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

                {(selectedElementData.type === "multiple_choice" || selectedElementData.type === "checkbox") && (
                  <div>
                    <Label>Opções de Resposta</Label>
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
                            placeholder={`Opção ${index + 1}`}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newOptions = [...(selectedElementData.options || [])];
                              newOptions.splice(index, 1);
                              updateElement(selectedElementData.id, { options: newOptions });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newOptions = [...(selectedElementData.options || []), `Opção ${(selectedElementData.options?.length || 0) + 1}`];
                          updateElement(selectedElementData.id, { options: newOptions });
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar Opção
                      </Button>
                    </div>
                  </div>
                )}

                {selectedElementData.type === "multiple_choice" && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-sm mb-3">Estilo Visual</h4>
                    
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

                      {/* Borda */}
                      <div>
                        <Label className="text-xs">Estilo da Borda</Label>
                        <select 
                          className="w-full px-2 py-1 border rounded text-xs mt-1"
                          value={selectedElementData.borderStyle || "normal"}
                          onChange={(e) => updateElement(selectedElementData.id, { borderStyle: e.target.value })}
                        >
                          <option value="normal">Normal</option>
                          <option value="thick">Grosso</option>
                        </select>
                      </div>

                      {/* Sombra */}
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

                      {/* Ocultar inputs */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="hide-inputs"
                          checked={selectedElementData.hideInputs || false}
                          onChange={(e) => updateElement(selectedElementData.id, { hideInputs: e.target.checked })}
                        />
                        <Label htmlFor="hide-inputs" className="text-xs">Ocultar radio/checkbox</Label>
                      </div>
                    </div>
                  </div>
                )}

                {selectedElementData.type === "number" && (
                  <>
                    <div>
                      <Label htmlFor="min-value">Valor Mínimo</Label>
                      <Input
                        id="min-value"
                        type="number"
                        value={selectedElementData.min || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { min: parseInt(e.target.value) || undefined })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-value">Valor Máximo</Label>
                      <Input
                        id="max-value"
                        type="number"
                        value={selectedElementData.max || ""}
                        onChange={(e) => updateElement(selectedElementData.id, { max: parseInt(e.target.value) || undefined })}
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Edit3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Selecione um elemento</h3>
              <p className="text-sm">Clique em um elemento na página para editá-lo.</p>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  </div>
  );
}