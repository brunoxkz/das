import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sparkles, Rocket, Brain, Lightbulb, ChevronRight, Star, Trophy, Zap, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface QuizIAStep {
  id: string;
  title: string;
  subtitle: string;
  field: string;
  type: "text" | "textarea" | "select";
  aiTip: string;
  suggestions: string[];
}

const quizSteps: QuizIAStep[] = [
  {
    id: "1",
    title: "Qual é o seu nicho ou área de atuação?",
    subtitle: "Defina seu mercado principal",
    field: "niche",
    type: "text",
    aiTip: "💡 Seja específico! 'Emagrecimento para mulheres 40+' funciona melhor que apenas 'saúde'",
    suggestions: [
      "Emagrecimento e nutrição",
      "Marketing digital para pequenas empresas",
      "Desenvolvimento pessoal e mindset",
      "Educação financeira e investimentos",
      "Beleza e cuidados estéticos"
    ]
  },
  {
    id: "2", 
    title: "Qual problema principal você resolve?",
    subtitle: "A dor que seu cliente sente",
    field: "problem",
    type: "textarea",
    aiTip: "🎯 Foque na dor emocional! 'Se sente envergonhada com o corpo' é mais forte que 'precisa emagrecer'",
    suggestions: [
      "Se sente insegura com o próprio corpo e autoestima baixa",
      "Não consegue organizar as finanças e vive no vermelho",
      "Quer empreender mas não sabe por onde começar",
      "Tem dificuldade para atrair clientes online",
      "Sente ansiedade e falta de propósito na vida"
    ]
  },
  {
    id: "3",
    title: "Qual transformação você oferece?",
    subtitle: "O resultado que seu cliente alcança",
    field: "transformation", 
    type: "textarea",
    aiTip: "🚀 Prometa a transformação completa! Não apenas o resultado, mas como a vida muda",
    suggestions: [
      "Conquistar o corpo dos sonhos e se sentir confiante",
      "Ter uma renda extra de R$ 5.000/mês online",
      "Superar a ansiedade e viver com propósito",
      "Multiplicar vendas e ter fila de espera de clientes",
      "Criar um negócio lucrativo do zero em 90 dias"
    ]
  }
];

export default function QuizIAInteractiveClean() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showAITip, setShowAITip] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Animação de partículas
  useEffect(() => {
    const particles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setStars(particles);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowAITip(true), 1000);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const currentStepConfig = quizSteps[currentStep];
  const progress = ((currentStep + 1) / quizSteps.length) * 100;

  const handleInputChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      [currentStepConfig.field]: value
    }));
  };

  const selectSuggestion = (suggestion: string) => {
    handleInputChange(suggestion);
    setShowSuggestions(false);
    toast({
      title: "💡 Sugestão aplicada!",
      description: "Você pode editar o texto conforme sua necessidade"
    });
  };

  const nextStep = () => {
    if (!formData[currentStepConfig.field]?.trim()) {
      toast({
        title: "⚠️ Campo obrigatório",
        description: "Preencha este campo para continuar",
        variant: "destructive"
      });
      return;
    }

    if (currentStep < quizSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setShowAITip(false);
    } else {
      generateQuiz();
    }
  };

  const generateQuiz = async () => {
    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setShowSuccess(true);
      
      toast({
        title: "🎉 Quiz I.A. gerado com sucesso!",
        description: "Seu funil está pronto para converter!"
      });
      
    } catch (error) {
      toast({
        title: "❌ Erro ao gerar quiz",
        description: "Tente novamente em alguns momentos",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center">
        {/* Efeito de partículas celebrativas */}
        {stars.map(star => (
          <div
            key={star.id}
            className="absolute animate-ping"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              animationDelay: `${star.delay}s`
            }}
          >
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
          </div>
        ))}
        
        <Card className="w-full max-w-2xl mx-4 bg-white/10 backdrop-blur-lg border border-white/20 text-white">
          <CardContent className="p-12 text-center">
            <div className="mb-8">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Trophy className="w-12 h-12 text-black" />
              </div>
              
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                🎉 Quiz I.A. Criado!
              </h1>
              
              <p className="text-xl text-white/80 mb-8">
                Seu funil inteligente foi gerado com sucesso e está pronto para converter leads em vendas!
              </p>
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={() => setLocation("/dashboard")}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 text-lg transform transition-all duration-300 hover:scale-105"
              >
                <Zap className="w-5 h-5 mr-2" />
                Ver no Dashboard
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Criar Outro Quiz I.A.
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background animado com gradientes */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-blue-500/20 to-purple-600/20 animate-pulse"></div>
      </div>

      {/* Efeito de partículas flutuantes */}
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute w-2 h-2 bg-white/30 rounded-full animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationDelay: `${star.delay}s`,
            animationDuration: '3s'
          }}
        />
      ))}

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8">
          
          {/* Badge I.A. Epic */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 rounded-full text-black font-bold text-lg shadow-2xl animate-pulse transform hover:scale-105 transition-all duration-300">
              <Sparkles className="w-6 h-6" />
              I.A. QUIZ BUILDER 2025
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          {/* Progress Bar Ultra Moderna */}
          <div className="space-y-2">
            <div className="flex justify-between text-white/80 text-sm">
              <span>Progresso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Card Principal Glassmorphism */}
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl overflow-hidden">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-2 rounded-full">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/60 text-sm font-medium">
                  Passo {currentStep + 1} de {quizSteps.length}
                </span>
              </div>
              
              <CardTitle className="text-2xl font-bold text-white mb-2 leading-tight">
                {currentStepConfig.title}
              </CardTitle>
              
              <p className="text-white/70 text-lg">
                {currentStepConfig.subtitle}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-white/90 font-medium text-base">
                  Sua resposta:
                </Label>
                
                {currentStepConfig.type === "textarea" ? (
                  <Textarea
                    value={formData[currentStepConfig.field] || ""}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Digite sua resposta aqui..."
                    className="bg-white/5 border-white/20 text-white placeholder-white/50 min-h-[120px] resize-none focus:bg-white/10 transition-all duration-300"
                  />
                ) : (
                  <Input
                    value={formData[currentStepConfig.field] || ""}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Digite sua resposta aqui..."
                    className="bg-white/5 border-white/20 text-white placeholder-white/50 h-12 focus:bg-white/10 transition-all duration-300"
                  />
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowSuggestions(true)}
                    variant="outline"
                    className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border-yellow-400/30 text-yellow-300 hover:bg-yellow-400/30 transition-all duration-300"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Ver Sugestões I.A.
                  </Button>
                </div>
              </div>

              <div className="flex justify-between">
                {currentStep > 0 && (
                  <Button
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    variant="outline"
                    className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                )}
                
                <div className="ml-auto">
                  <Button
                    onClick={nextStep}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3 transform transition-all duration-300 hover:scale-105 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full" />
                        Gerando...
                      </>
                    ) : currentStep === quizSteps.length - 1 ? (
                      <>
                        <Rocket className="w-5 h-5 mr-2 animate-pulse" />
                        Criar Quiz I.A.
                      </>
                    ) : (
                      <>
                        <ChevronRight className="w-5 h-5 mr-2" />
                        Próximo Step
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dica da I.A. Ultra Moderna */}
          {showAITip && currentStepConfig && (
            <div className="transform transition-all duration-500 animate-slideInUp">
              <Alert className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-400 p-2 rounded-full animate-pulse">
                    <Brain className="w-4 h-4 text-black" />
                  </div>
                  <AlertDescription className="text-white font-medium">
                    {currentStepConfig.aiTip}
                  </AlertDescription>
                </div>
              </Alert>
            </div>
          )}
          
          {/* Modal de Sugestões I.A. */}
          <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
            <DialogContent className="sm:max-w-lg bg-black/90 backdrop-blur-lg border border-white/20 text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-full">
                    <Lightbulb className="w-5 h-5 text-black" />
                  </div>
                  Sugestões da I.A. 2025
                </DialogTitle>
                <DialogDescription className="text-white/80">
                  Clique em uma sugestão para usar ou se inspire para criar a sua própria resposta
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {currentStepConfig?.suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start h-auto p-4 text-left bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 transform hover:scale-[1.02]"
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-1 rounded-full">
                        <Sparkles className="w-3 h-3 text-black" />
                      </div>
                      <span className="text-white">{suggestion}</span>
                    </div>
                  </Button>
                ))}
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowSuggestions(false)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}