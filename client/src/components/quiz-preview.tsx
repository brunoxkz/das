import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Mail, 
  User, 
  Phone,
  Sparkles
} from "lucide-react";

interface QuizPreviewProps {
  quiz: {
    title: string;
    description: string;
    structure: {
      questions: any[];
      settings: {
        theme: string;
        showProgressBar: boolean;
        collectEmail: boolean;
        collectName: boolean;
        collectPhone: boolean;
      };
    };
  };
}

export function QuizPreview({ quiz }: QuizPreviewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [leadData, setLeadData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const { pages, settings } = quiz.structure;
  
  // Incluir todas as páginas (normais e de transição)
  const allPages = pages || [];
  const totalSteps = allPages.length + (settings.collectEmail || settings.collectName || settings.collectPhone ? 1 : 0) + 1; // +1 for result
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleAnswer = (questionId: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderPage = (page: any, pageIndex: number) => {
    const isActive = currentStep === pageIndex;
    if (!isActive) return null;

    // Se a página não tem elementos, pula
    if (!page.elements || page.elements.length === 0) {
      setTimeout(handleNext, 100);
      return null;
    }

    // Verificar se é página de transição
    const isTransitionPage = page.isTransition || page.elements.some((el: any) => 
      ['transition_background', 'transition_text', 'transition_counter', 'transition_loader', 'transition_redirect'].includes(el.type)
    );

    if (isTransitionPage) {
      return renderTransitionPage(page, pageIndex);
    }

    // Renderizar elementos interativos da página
    const interactiveElements = page.elements.filter((el: any) => 
      ['multiple_choice', 'text', 'email', 'phone', 'number', 'rating', 'date', 'textarea', 'checkbox', 'birth_date', 'height', 'current_weight', 'target_weight'].includes(el.type)
    );

    const contentElements = page.elements.filter((el: any) => 
      ['heading', 'paragraph', 'image', 'video', 'divider'].includes(el.type)
    );

    return (
      <div className="max-w-2xl mx-auto text-center">
        {/* Renderizar elementos de conteúdo primeiro */}
        {contentElements.map((element: any) => (
          <div key={element.id} className="mb-6">
            {renderContentElement(element)}
          </div>
        ))}

        {/* Renderizar primeiro elemento interativo */}
        {interactiveElements.length > 0 && renderInteractiveElement(interactiveElements[0], pageIndex)}
      </div>
    );
  };

  const renderContentElement = (element: any) => {
    switch (element.type) {
      case 'heading':
        const HeadingTag = element.fontSize === 'xs' ? 'h6' : 
                          element.fontSize === 'sm' ? 'h5' :
                          element.fontSize === 'base' ? 'h4' :
                          element.fontSize === 'lg' ? 'h3' :
                          element.fontSize === 'xl' ? 'h2' : 'h1';
        return (
          <HeadingTag 
            className={`font-bold text-gray-900 mb-4 text-${element.textAlign || 'left'}`}
            style={{ color: element.textColor }}
          >
            {element.content}
          </HeadingTag>
        );
      
      case 'paragraph':
        return (
          <p 
            className={`text-gray-600 mb-4 text-${element.textAlign || 'left'}`}
            style={{ color: element.textColor }}
          >
            {element.content}
          </p>
        );
      
      case 'image':
        return (
          <div className={`mb-4 text-${element.textAlign || 'center'}`}>
            <img 
              src={element.imageUrl || element.content} 
              alt="Imagem" 
              className="max-w-full h-auto rounded-lg mx-auto"
            />
          </div>
        );
      
      case 'divider':
        return <hr className="my-6 border-gray-300" />;
      
      default:
        return null;
    }
  };

  const renderTransitionPage = (page: any, pageIndex: number) => {
    // Auto-avançar após alguns segundos para páginas de transição
    setTimeout(() => {
      if (currentStep === pageIndex) {
        handleNext();
      }
    }, 3000);

    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Página de Transição
          </h2>
          <p className="text-gray-600">
            Aguarde um momento...
          </p>
        </div>
      </div>
    );
  };

  const renderInteractiveElement = (element: any, pageIndex: number) => {
    const isActive = currentStep === pageIndex;
    if (!isActive) return null;

    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {element.question || `Pergunta`}
          </h2>
          {element.description && (
            <p className="text-gray-600 text-lg">{element.description}</p>
          )}
        </div>

        <div className="space-y-3">
          {element.type === "multiple_choice" && element.options?.map((option: string, optionIndex: number) => (
            <Button
              key={optionIndex}
              variant={answers[element.id] === option ? "default" : "outline"}
              className="w-full justify-start text-left p-4 h-auto"
              onClick={() => {
                handleAnswer(element.id, option);
                setTimeout(handleNext, 300);
              }}
            >
              <div className={`w-4 h-4 rounded-full mr-3 ${
                answers[element.id] === option 
                  ? 'bg-white' 
                  : 'border-2 border-gray-300'
              }`} />
              {option}
            </Button>
          ))}

          {element.type === "text" && (
            <div className="space-y-4">
              <Input
                placeholder="Digite sua resposta..."
                value={answers[element.id] || ""}
                onChange={(e) => handleAnswer(element.id, e.target.value)}
                className="text-center"
              />
              <Button 
                onClick={handleNext}
                disabled={!answers[element.id]?.trim()}
              >
                Próxima <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {element.type === "rating" && (
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={answers[element.id] === rating ? "default" : "outline"}
                  className="w-12 h-12 rounded-full"
                  onClick={() => {
                    handleAnswer(element.id, rating);
                    setTimeout(handleNext, 300);
                  }}
                >
                  {rating}
                </Button>
              ))}
            </div>
          )}

          {(element.type === "email" || element.type === "phone" || element.type === "number") && (
            <div className="space-y-4">
              <Input
                type={element.type === "email" ? "email" : element.type === "phone" ? "tel" : "number"}
                placeholder={element.placeholder || `Digite ${element.type === "email" ? "seu email" : element.type === "phone" ? "seu telefone" : "um número"}...`}
                value={answers[element.id] || ""}
                onChange={(e) => handleAnswer(element.id, e.target.value)}
                className="text-center"
              />
              <Button 
                onClick={handleNext}
                disabled={element.required && !answers[element.id]?.toString().trim()}
              >
                Próxima <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {element.type === "date" && (
            <div className="space-y-4">
              <Input
                type="date"
                value={answers[element.id] || ""}
                onChange={(e) => handleAnswer(element.id, e.target.value)}
                className="text-center"
              />
              <Button 
                onClick={handleNext}
                disabled={element.required && !answers[element.id]}
              >
                Próxima <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {element.type === "birth_date" && (
            <div className="space-y-4">
              <Input
                type="date"
                value={answers[element.id] || ""}
                onChange={(e) => handleAnswer(element.id, e.target.value)}
                className="text-center"
              />
              <Button 
                onClick={handleNext}
                disabled={element.required && !answers[element.id]}
              >
                Próxima <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {(element.type === "height" || element.type === "current_weight" || element.type === "target_weight") && (
            <div className="space-y-4">
              <Input
                type="number"
                placeholder={element.placeholder || "Digite o valor..."}
                value={answers[element.id] || ""}
                onChange={(e) => handleAnswer(element.id, e.target.value)}
                className="text-center"
                min={element.min}
                max={element.max}
              />
              <Button 
                onClick={handleNext}
                disabled={element.required && !answers[element.id]?.toString().trim()}
              >
                Próxima <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {element.type === "textarea" && (
            <div className="space-y-4">
              <textarea
                placeholder={element.placeholder || "Digite sua resposta..."}
                value={answers[element.id] || ""}
                onChange={(e) => handleAnswer(element.id, e.target.value)}
                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button 
                onClick={handleNext}
                disabled={element.required && !answers[element.id]?.toString().trim()}
              >
                Próxima <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {element.type === "checkbox" && element.options?.map((option: string, optionIndex: number) => (
            <div key={optionIndex} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                id={`${element.id}-${optionIndex}`}
                checked={answers[element.id]?.includes(option) || false}
                onChange={(e) => {
                  const currentAnswers = answers[element.id] || [];
                  const newAnswers = e.target.checked
                    ? [...currentAnswers, option]
                    : currentAnswers.filter((a: string) => a !== option);
                  handleAnswer(element.id, newAnswers);
                }}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor={`${element.id}-${optionIndex}`} className="text-left flex-1 cursor-pointer">
                {option}
              </label>
            </div>
          ))}

          {element.type === "checkbox" && (
            <div className="mt-4">
              <Button 
                onClick={handleNext}
                disabled={element.required && (!answers[element.id] || answers[element.id].length === 0)}
              >
                Próxima <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLeadCapture = () => {
    const isActive = currentStep === allPages.length;
    if (!isActive) return null;

    return (
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quase lá!
          </h2>
          <p className="text-gray-600">
            Para ver seus resultados personalizados, precisamos de algumas informações:
          </p>
        </div>

        <div className="space-y-4">
          {settings.collectName && (
            <div>
              <Label htmlFor="name">Nome</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={leadData.name}
                  onChange={(e) => setLeadData(prev => ({ ...prev, name: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {settings.collectEmail && (
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={leadData.email}
                  onChange={(e) => setLeadData(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {settings.collectPhone && (
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={leadData.phone}
                  onChange={(e) => setLeadData(prev => ({ ...prev, phone: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <Button 
            className="w-full" 
            onClick={handleNext}
            disabled={
              (settings.collectEmail && !leadData.email) ||
              (settings.collectName && !leadData.name)
            }
          >
            Ver Meus Resultados
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    const isActive = currentStep === totalSteps - 1;
    if (!isActive) return null;

    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Obrigado por participar!
          </h2>
          <p className="text-gray-600 text-lg">
            Suas respostas foram registradas com sucesso. Em breve você receberá seus resultados personalizados por email.
          </p>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Próximos Passos:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Verifique seu email para resultados detalhados</li>
              <li>• Nossa equipe entrará em contato em até 24h</li>
              <li>• Siga-nos nas redes sociais para dicas exclusivas</li>
            </ul>
          </CardContent>
        </Card>

        <Button className="mt-6" onClick={() => {
          setCurrentStep(0);
          setAnswers({});
          setLeadData({ name: "", email: "", phone: "" });
        }}>
          Refazer Quiz
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {quiz.title || "Preview do Quiz"}
          </h1>
          {quiz.description && (
            <p className="text-gray-600 text-lg">{quiz.description}</p>
          )}
        </div>

        {/* Progress Bar */}
        {settings.showProgressBar && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Etapa {currentStep + 1} de {totalSteps}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(progress)}% completo
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Quiz Content */}
        <Card className="min-h-[400px]">
          <CardContent className="p-8 flex items-center justify-center">
            {/* Pages */}
            {allPages.map((page, index) => (
              <div key={page.id || index}>
                {renderPage(page, index)}
              </div>
            ))}
            
            {/* Lead Capture */}
            {renderLeadCapture()}
            
            {/* Result */}
            {renderResult()}

            {/* Empty State */}
            {allPages.length === 0 && currentStep === 0 && (
              <div className="text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Quiz Vazio</h3>
                <p>Adicione páginas no editor para ver o preview</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        {allPages.length > 0 && currentStep < totalSteps - 1 && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            
            <Badge variant="outline">
              {currentStep < allPages.length ? "Página" : currentStep === allPages.length ? "Captura" : "Resultado"}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
