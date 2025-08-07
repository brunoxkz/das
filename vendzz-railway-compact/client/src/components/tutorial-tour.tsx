import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowLeft, ArrowRight, Play } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector do elemento alvo
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'highlight' | 'scroll';
  actionTarget?: string;
}

interface TutorialTourProps {
  steps: TutorialStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function TutorialTour({ steps, isOpen, onClose, onComplete }: TutorialTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen || !steps[currentStep]) return;

    const updateTargetElement = () => {
      const element = document.querySelector(steps[currentStep].target) as HTMLElement;
      if (element) {
        setTargetElement(element);
        
        // Calcular posição do tooltip
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset;
        const scrollLeft = window.pageXOffset;
        
        let top = 0, left = 0;
        
        switch (steps[currentStep].position) {
          case 'top':
            top = rect.top + scrollTop - 120;
            left = rect.left + scrollLeft + rect.width / 2 - 150;
            break;
          case 'bottom':
            top = rect.bottom + scrollTop + 20;
            left = rect.left + scrollLeft + rect.width / 2 - 150;
            break;
          case 'left':
            top = rect.top + scrollTop + rect.height / 2 - 60;
            left = rect.left + scrollLeft - 320;
            break;
          case 'right':
            top = rect.top + scrollTop + rect.height / 2 - 60;
            left = rect.right + scrollLeft + 20;
            break;
        }
        
        setTooltipPosition({ top, left });
        
        // Scroll suave para o elemento
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
        
        // Destacar elemento
        element.style.position = 'relative';
        element.style.zIndex = '9999';
        element.style.outline = '3px solid #10B981';
        element.style.outlineOffset = '2px';
        element.style.borderRadius = '8px';
        element.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
      }
    };

    // Delay para garantir que o DOM foi atualizado
    setTimeout(updateTargetElement, 100);

    return () => {
      // Limpar destaque
      if (targetElement) {
        targetElement.style.position = '';
        targetElement.style.zIndex = '';
        targetElement.style.outline = '';
        targetElement.style.outlineOffset = '';
        targetElement.style.borderRadius = '';
        targetElement.style.backgroundColor = '';
      }
    };
  }, [currentStep, isOpen, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Limpar destaque do último elemento
    if (targetElement) {
      targetElement.style.position = '';
      targetElement.style.zIndex = '';
      targetElement.style.outline = '';
      targetElement.style.outlineOffset = '';
      targetElement.style.borderRadius = '';
      targetElement.style.backgroundColor = '';
    }
    
    onComplete();
    onClose();
  };

  const handleAction = () => {
    const step = steps[currentStep];
    if (step.action && step.actionTarget) {
      const element = document.querySelector(step.actionTarget) as HTMLElement;
      if (element) {
        switch (step.action) {
          case 'click':
            element.click();
            break;
          case 'scroll':
            element.scrollIntoView({ behavior: 'smooth' });
            break;
        }
      }
    }
  };

  if (!isOpen || !steps[currentStep]) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Overlay escuro */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      />
      
      {/* Tooltip do tutorial */}
      <Card 
        className="fixed z-[60] w-80 shadow-2xl border-2 border-vendzz-primary"
        style={{ 
          top: tooltipPosition.top, 
          left: Math.max(10, Math.min(window.innerWidth - 330, tooltipPosition.left))
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-vendzz-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                {currentStep + 1}
              </div>
              <h3 className="font-semibold text-lg">{step.title}</h3>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="p-1 h-6 w-6"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-gray-700 mb-4 leading-relaxed">{step.content}</p>
          
          {step.action && (
            <Button
              size="sm"
              onClick={handleAction}
              className="mb-4 w-full bg-blue-600 hover:bg-blue-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {step.action === 'click' ? 'Clique aqui' : 'Ir para local'}
            </Button>
          )}
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {currentStep + 1} de {steps.length}
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                className="bg-vendzz-primary hover:bg-vendzz-primary/90"
              >
                {currentStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-1 mt-3">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded ${
                  index <= currentStep ? 'bg-vendzz-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Passos do tutorial para o editor de quiz
export const quizEditorTutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Editor Vendzz!',
    content: 'Vamos fazer um tour rápido para você aprender a criar quizzes incríveis. Este tutorial vai te mostrar todas as funcionalidades principais.',
    target: '[data-tutorial="editor-container"]',
    position: 'bottom'
  },
  {
    id: 'pages-panel',
    title: 'Painel de Páginas',
    content: 'Aqui você vê todas as páginas do seu quiz. Cada página pode ter diferentes elementos como perguntas, texto, imagens e muito mais.',
    target: '[data-tutorial="pages-panel"]',
    position: 'right'
  },
  {
    id: 'add-page',
    title: 'Adicionar Nova Página',
    content: 'Use este botão para criar uma nova página normal no seu quiz.',
    target: '[data-tutorial="add-page-btn"]',
    position: 'bottom'
  },
  {
    id: 'add-transition',
    title: 'Páginas de Transição',
    content: 'As páginas de transição criam momentos especiais entre as perguntas, como carregamentos animados ou redirecionamentos.',
    target: '[data-tutorial="add-transition-btn"]',
    position: 'bottom'
  },
  {
    id: 'add-game',
    title: 'Páginas de Jogos',
    content: 'Adicione jogos interativos como roleta da sorte, raspadinha e quebra-blocos para tornar seu quiz mais envolvente.',
    target: '[data-tutorial="add-game-btn"]',
    position: 'bottom'
  },
  {
    id: 'elements-panel',
    title: 'Painel de Elementos',
    content: 'Aqui estão todos os elementos que você pode adicionar às suas páginas. Os elementos mudam dependendo do tipo de página selecionada.',
    target: '[data-tutorial="elements-panel"]',
    position: 'left'
  },
  {
    id: 'content-elements',
    title: 'Elementos de Conteúdo',
    content: 'Use títulos, parágrafos e divisores para estruturar o conteúdo das suas páginas.',
    target: '[data-tutorial="content-elements"]',
    position: 'left'
  },
  {
    id: 'question-elements',
    title: 'Elementos de Pergunta',
    content: 'Aqui estão os tipos de perguntas: múltipla escolha, texto livre, avaliações e muito mais.',
    target: '[data-tutorial="question-elements"]',
    position: 'left'
  },
  {
    id: 'preview-area',
    title: 'Área de Preview',
    content: 'Esta é a área de preview onde você vê como sua página ficará para os usuários. Clique em qualquer elemento para editá-lo.',
    target: '[data-tutorial="preview-area"]',
    position: 'top'
  },
  {
    id: 'properties-panel',
    title: 'Painel de Propriedades',
    content: 'Quando você seleciona um elemento, suas propriedades aparecem aqui. É onde você personaliza cores, textos, opções e muito mais.',
    target: '[data-tutorial="properties-panel"]',
    position: 'left'
  },
  {
    id: 'tabs',
    title: 'Abas de Navegação',
    content: 'Use as abas Editor, Preview e Configurações para navegar entre diferentes modos de edição do seu quiz.',
    target: '[data-tutorial="tabs"]',
    position: 'bottom'
  },
  {
    id: 'save-btn',
    title: 'Salvar Quiz',
    content: 'Não esqueça de salvar suas alterações regularmente usando este botão.',
    target: '[data-tutorial="save-btn"]',
    position: 'bottom'
  }
];

// Passos do tutorial para a dashboard
export const dashboardTutorialSteps: TutorialStep[] = [
  {
    id: 'dashboard-welcome',
    title: 'Dashboard do Vendzz',
    content: 'Esta é sua central de controle! Aqui você gerencia todos os seus quizzes, vê estatísticas e acessa ferramentas importantes.',
    target: '[data-tutorial="dashboard-main"]',
    position: 'bottom'
  },
  {
    id: 'stats-cards',
    title: 'Estatísticas Principais',
    content: 'Acompanhe o desempenho dos seus quizzes: total de quizzes criados, leads capturados, visualizações e taxa de conversão.',
    target: '[data-tutorial="stats-cards"]',
    position: 'bottom'
  },
  {
    id: 'create-quiz-btn',
    title: 'Criar Novo Quiz',
    content: 'Use este botão para começar a criar um novo quiz do zero.',
    target: '[data-tutorial="create-quiz-btn"]',
    position: 'bottom'
  },
  {
    id: 'quizzes-list',
    title: 'Lista de Quizzes',
    content: 'Aqui você vê todos os seus quizzes criados. Clique em qualquer um para editá-lo ou ver suas estatísticas.',
    target: '[data-tutorial="quizzes-list"]',
    position: 'top'
  },
  {
    id: 'sidebar-navigation',
    title: 'Navegação Lateral',
    content: 'Use o menu lateral para navegar entre Dashboard, Analytics, Leads, Templates e outras seções importantes.',
    target: '[data-tutorial="sidebar"]',
    position: 'right'
  }
];