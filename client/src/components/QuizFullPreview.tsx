import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X, Eye, ArrowDown } from "lucide-react";
import { useState } from "react";

interface QuizPage {
  id: string;
  pageNumber: number;
  title: string;
  elements: QuizElement[];
}

interface QuizElement {
  id: string;
  type: string;
  position: number;
  properties: any;
}

interface Quiz {
  id: string;
  title: string;
  pages: number;
  pageData: QuizPage[];
  elements: QuizElement[];
}

interface QuizFullPreviewProps {
  quiz: Quiz | null;
  isOpen: boolean;
  onClose: () => void;
}

// Componente para renderizar elementos individuais
const ElementRenderer = ({ element }: { element: QuizElement }) => {
  const { type, properties } = element;

  const getElementStyle = () => {
    const baseStyle = "w-full mb-4 transition-all duration-200";
    
    switch (type) {
      case 'headline':
        return `${baseStyle} font-bold text-${properties.fontSize || 'xl'} text-${properties.alignment || 'center'} ${
          properties.fontWeight === 'bold' ? 'font-bold' : 
          properties.fontWeight === 'semibold' ? 'font-semibold' : 'font-normal'
        }`;
      case 'text':
        return `${baseStyle} text-${properties.fontSize || 'base'} text-${properties.alignment || 'left'}`;
      case 'button':
        return `${baseStyle} text-center`;
      default:
        return baseStyle;
    }
  };

  switch (type) {
    case 'headline':
      return (
        <div 
          className={getElementStyle()}
          style={{ color: properties.color || '#000000' }}
        >
          {properties.title || 'Título'}
        </div>
      );

    case 'text':
      return (
        <div 
          className={getElementStyle()}
          style={{ color: properties.color || '#333333' }}
        >
          {properties.text || properties.title || 'Texto do elemento'}
        </div>
      );

    case 'email':
      return (
        <div className={getElementStyle()}>
          <input
            type="email"
            placeholder={properties.placeholder || 'Digite seu email'}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            style={{ 
              backgroundColor: properties.backgroundColor || '#ffffff',
              borderColor: properties.borderColor || '#cccccc'
            }}
            disabled
          />
        </div>
      );

    case 'multiple_choice':
      return (
        <div className={getElementStyle()}>
          <div className="mb-3 font-medium">{properties.question || 'Pergunta de múltipla escolha'}</div>
          <div className="space-y-2">
            {(properties.options || ['Opção 1', 'Opção 2', 'Opção 3']).map((option: string, index: number) => (
              <label key={index} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="radio" name={`question-${element.id}`} disabled className="text-green-600" />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case 'button':
      return (
        <div className={getElementStyle()}>
          <Button
            className="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: properties.backgroundColor || '#16a34a',
              color: properties.textColor || '#ffffff'
            }}
            disabled
          >
            {properties.text || properties.title || 'Botão'}
          </Button>
        </div>
      );

    default:
      return (
        <div className={`${getElementStyle()} p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50`}>
          <div className="text-sm text-gray-500 mb-1">Elemento: {type}</div>
          <div className="text-gray-700">
            {properties.title || properties.text || `Elemento do tipo ${type}`}
          </div>
        </div>
      );
  }
};

// Componente para renderizar uma página completa
const PageRenderer = ({ page, isLast }: { page: QuizPage; isLast: boolean }) => {
  const getPageTypeColor = (title: string) => {
    if (title.includes('Captura')) return 'bg-blue-100 text-blue-800';
    if (title.includes('Qualificação')) return 'bg-purple-100 text-purple-800';
    if (title.includes('Apresentação')) return 'bg-green-100 text-green-800';
    if (title.includes('Oferta')) return 'bg-orange-100 text-orange-800';
    if (title.includes('Finalização')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const sortedElements = [...page.elements].sort((a, b) => a.position - b.position);

  return (
    <Card className="p-6 mb-6 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200">
      {/* Cabeçalho da página */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-lg font-semibold px-3 py-1">
            Página {page.pageNumber}
          </Badge>
          <Badge className={getPageTypeColor(page.title)}>
            {page.title}
          </Badge>
        </div>
        <div className="text-sm text-gray-500">
          {sortedElements.length} elementos
        </div>
      </div>

      {/* Elementos da página */}
      <div className="space-y-4">
        {sortedElements.map((element) => (
          <ElementRenderer key={element.id} element={element} />
        ))}
      </div>

      {/* Separador para próxima página */}
      {!isLast && (
        <div className="flex items-center justify-center mt-8 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-gray-400">
            <ArrowDown className="w-5 h-5" />
            <span className="text-sm">Próxima página</span>
            <ArrowDown className="w-5 h-5" />
          </div>
        </div>
      )}
    </Card>
  );
};

export default function QuizFullPreview({ quiz, isOpen, onClose }: QuizFullPreviewProps) {
  const [currentFilter, setCurrentFilter] = useState<string>('all');

  if (!quiz) return null;

  const filteredPages = quiz.pageData.filter(page => {
    if (currentFilter === 'all') return true;
    return page.title.toLowerCase().includes(currentFilter.toLowerCase());
  });

  const pageTypes = [
    { key: 'all', label: 'Todas as Páginas', count: quiz.pageData.length },
    { key: 'captura', label: 'Captura', count: quiz.pageData.filter(p => p.title.includes('Captura')).length },
    { key: 'qualificação', label: 'Qualificação', count: quiz.pageData.filter(p => p.title.includes('Qualificação')).length },
    { key: 'apresentação', label: 'Apresentação', count: quiz.pageData.filter(p => p.title.includes('Apresentação')).length },
    { key: 'oferta', label: 'Oferta', count: quiz.pageData.filter(p => p.title.includes('Oferta')).length },
    { key: 'finalização', label: 'Finalização', count: quiz.pageData.filter(p => p.title.includes('Finalização')).length },
  ].filter(type => type.count > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                <Eye className="inline w-6 h-6 mr-2" />
                {quiz.title}
              </DialogTitle>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <span>{quiz.pages} páginas</span>
                <span>•</span>
                <span>{quiz.elements.length} elementos</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Filtros de tipo de página */}
          <div className="flex flex-wrap gap-2 mt-4">
            {pageTypes.map((type) => (
              <Button
                key={type.key}
                variant={currentFilter === type.key ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentFilter(type.key)}
                className="text-xs"
              >
                {type.label} ({type.count})
              </Button>
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 pt-4">
          <div className="space-y-0">
            {filteredPages.map((page, index) => (
              <PageRenderer 
                key={page.id} 
                page={page} 
                isLast={index === filteredPages.length - 1}
              />
            ))}
          </div>

          {filteredPages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma página encontrada para o filtro selecionado.</p>
            </div>
          )}
        </ScrollArea>

        <div className="p-6 pt-0 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Visualizando {filteredPages.length} de {quiz.pages} páginas
            </div>
            <Button onClick={onClose} variant="outline">
              Fechar Visualização
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}