import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  Clock, 
  Zap,
  Wand2,
  Brain,
  Target,
  Coins,
  QrCode,
  Copy,
  ExternalLink,
  RefreshCw,
  Lightbulb,
  Users,
  TrendingUp,
  DollarSign,
  Key
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface QuizData {
  niche: string;
  targetAudience: string;
  painPoint: string;
  solution: string;
  productName: string;
  productPrice: string;
  pixKey: string;
}

interface StepConfig {
  id: number;
  title: string;
  description: string;
  field: keyof QuizData;
  placeholder: string;
  suggestions: string[];
  aiTip: string;
  icon: React.ReactNode;
}

const STEPS_CONFIG: StepConfig[] = [
  {
    id: 1,
    title: "Qual é o seu nicho?",
    description: "Defina o mercado que você quer atingir",
    field: "niche",
    placeholder: "Ex: Emagrecimento, Marketing Digital, Ganhar Dinheiro Online...",
    suggestions: [
      "Emagrecimento e dieta",
      "Marketing digital", 
      "Ganhar dinheiro online",
      "Relacionamentos",
      "Desenvolvimento pessoal",
      "Fitness e musculação",
      "Beleza e autocuidado",
      "Culinária saudável"
    ],
    aiTip: "💡 Dica da I.A.: Escolha um nicho que você conhece bem ou tem paixão! Nichos específicos convertem melhor que nichos amplos.",
    icon: <Target className="w-6 h-6" />
  },
  {
    id: 2,
    title: "Quem é seu público-alvo?",
    description: "Descreva seu cliente ideal",
    field: "targetAudience", 
    placeholder: "Ex: Mulheres de 25-40 anos que querem emagrecer...",
    suggestions: [
      "Mulheres de 25-40 anos",
      "Homens empreendedores de 30-50 anos",
      "Jovens de 18-25 anos",
      "Mães que trabalham",
      "Profissionais liberais",
      "Aposentados ativos",
      "Estudantes universitários",
      "Pequenos empresários"
    ],
    aiTip: "🎯 Dica da I.A.: Seja específico! Idade, gênero, situação profissional e problemas específicos ajudam a criar quizzes mais certeiros.",
    icon: <Users className="w-6 h-6" />
  },
  {
    id: 3,
    title: "Qual a principal dor deles?",
    description: "Identifique o maior problema que eles enfrentam",
    field: "painPoint",
    placeholder: "Ex: Não conseguem emagrecer mesmo tentando várias dietas...",
    suggestions: [
      "Não conseguem emagrecer",
      "Falta de tempo para se cuidar",
      "Não sabem como ganhar dinheiro online",
      "Relacionamentos que não dão certo",
      "Falta de motivação e disciplina",
      "Não sabem por onde começar",
      "Medo de não conseguir resultados",
      "Já tentaram tudo e não funciona"
    ],
    aiTip: "😰 Dica da I.A.: A dor precisa ser emocional! Não é só 'estar acima do peso', é 'se sentir feia e sem autoestima'.",
    icon: <TrendingUp className="w-6 h-6" />
  },
  {
    id: 4,
    title: "Qual é sua solução?",
    description: "Como você vai resolver o problema deles?",
    field: "solution",
    placeholder: "Ex: Método exclusivo de emagrecimento sem dietas restritivas...",
    suggestions: [
      "Método exclusivo e comprovado",
      "Sistema passo a passo simples",
      "Técnica revolucionária",
      "Estratégia que poucos conhecem",
      "Fórmula testada e aprovada",
      "Processo único e eficaz",
      "Método científico inovador",
      "Sistema automatizado"
    ],
    aiTip: "✨ Dica da I.A.: Sua solução deve ser única! Use palavras como 'exclusivo', 'revolucionário', 'método secreto'.",
    icon: <Lightbulb className="w-6 h-6" />
  },
  {
    id: 5,
    title: "Nome do seu produto",
    description: "Como vai chamar sua oferta?",
    field: "productName",
    placeholder: "Ex: Emagreça Rápido VIP, Fórmula do Sucesso...",
    suggestions: [
      "Método [Seu Nicho] Turbinado",
      "Fórmula [Resultado] Express",
      "[Benefício] em 30 Dias",
      "Sistema [Solução] VIP",
      "Método [Nome] Exclusivo",
      "Transformação [Área] Total",
      "Protocolo [Resultado] Avançado",
      "Masterclass [Nicho] Pro"
    ],
    aiTip: "🏆 Dica da I.A.: Use palavras que transmitem velocidade, exclusividade e resultado! VIP, Express, Turbinado, Exclusivo.",
    icon: <Sparkles className="w-6 h-6" />
  },
  {
    id: 6,
    title: "Preço do produto (R$)",
    description: "Qual será o valor da sua oferta?",
    field: "productPrice",
    placeholder: "Ex: 97, 197, 297...",
    suggestions: [
      "97",
      "197", 
      "297",
      "497",
      "697",
      "997",
      "1997",
      "2997"
    ],
    aiTip: "💰 Dica da I.A.: Preços quebrados (97, 197) convertem melhor! Para digitais: R$97-497. Para alta conversão: R$197.",
    icon: <DollarSign className="w-6 h-6" />
  },
  {
    id: 7,
    title: "Sua chave PIX",
    description: "Para onde vão os pagamentos?",
    field: "pixKey",
    placeholder: "Ex: seuemail@gmail.com, seu telefone ou chave aleatória...",
    suggestions: [
      "seuemail@gmail.com",
      "11999887766",
      "Chave aleatória",
      "CNPJ da empresa",
      "CPF pessoal"
    ],
    aiTip: "💳 Dica da I.A.: Email é mais fácil de lembrar! Certifique-se que a chave está ativa no seu banco.",
    icon: <Key className="w-6 h-6" />
  }
];

export default function QuizIAInteractive() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [quizData, setQuizData] = useState<QuizData>({
    niche: "",
    targetAudience: "",
    painPoint: "",
    solution: "",
    productName: "",
    productPrice: "",
    pixKey: ""
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [finalQuizUrl, setFinalQuizUrl] = useState("");
  const [showAITip, setShowAITip] = useState(false);

  const currentStepConfig = STEPS_CONFIG[currentStep - 1];
  const progress = (currentStep / STEPS_CONFIG.length) * 100;
  const isLastStep = currentStep === STEPS_CONFIG.length;
  const isFormComplete = currentStep > STEPS_CONFIG.length;

  // Auto-mostrar dica da I.A. quando entra na etapa
  useEffect(() => {
    if (currentStepConfig) {
      setShowAITip(true);
      setTimeout(() => setShowAITip(false), 5000); // Esconde após 5s
    }
  }, [currentStep]);

  const updateField = (value: string) => {
    setQuizData(prev => ({
      ...prev,
      [currentStepConfig.field]: value
    }));
  };

  const selectSuggestion = (suggestion: string) => {
    updateField(suggestion);
    setShowSuggestions(false);
  };

  const nextStep = () => {
    if (currentStep < STEPS_CONFIG.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Gerar quiz final
      generateFinalQuiz();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const generateFinalQuiz = async () => {
    setIsGenerating(true);
    
    try {
      // Primeiro gerar o conteúdo
      const generateResponse = await apiRequest("/api/quiz-ia/generate", {
        method: "POST",
        body: JSON.stringify(quizData)
      });

      if (generateResponse.success) {
        // Depois criar o quiz final
        const createResponse = await apiRequest("/api/quiz-ia/create", {
          method: "POST",
          body: JSON.stringify({
            ...quizData,
            generatedContent: generateResponse.content
          })
        });

        if (createResponse.success) {
          setFinalQuizUrl(createResponse.quizUrl);
          setCurrentStep(STEPS_CONFIG.length + 1);
          toast({
            title: "🎉 Quiz I.A. Criado!",
            description: "Seu quiz está pronto para gerar vendas!",
          });
        }
      }
    } catch (error) {
      console.error("Erro ao gerar quiz:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao gerar seu quiz. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyQuizUrl = () => {
    navigator.clipboard.writeText(finalQuizUrl);
    toast({
      title: "URL Copiada!",
      description: "A URL do seu quiz foi copiada para a área de transferência.",
    });
  };

  const canProceed = () => {
    if (!currentStepConfig) return false;
    return quizData[currentStepConfig.field].trim().length > 0;
  };

  // Tela de sucesso final
  if (isFormComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">🎉 Quiz I.A. Criado com Sucesso!</CardTitle>
            <p className="text-gray-600">Seu quiz inteligente está pronto para gerar vendas</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">URL do seu quiz:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white p-2 rounded border text-sm">
                  {finalQuizUrl}
                </code>
                <Button
                  size="sm"
                  onClick={copyQuizUrl}
                  variant="outline"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => window.open(finalQuizUrl, '_blank')}
                className="bg-green-600 hover:bg-green-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visualizar Quiz
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Criar Outro Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full text-purple-700 font-semibold mb-4">
            <Brain className="w-5 h-5" />
            I.A. QUIZ BUILDER INTERATIVO
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crie seu Quiz de Vendas com Inteligência Artificial
          </h1>
          <p className="text-gray-600">Responda as perguntas e a I.A. criará um quiz completo para você</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Etapa {currentStep} de {STEPS_CONFIG.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% completo
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Card */}
        {currentStepConfig && (
          <Card className="mb-6 shadow-lg border-0 bg-white">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-3 rounded-xl text-purple-600">
                  {currentStepConfig.icon}
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">
                    {currentStepConfig.title}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">{currentStepConfig.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Input Principal */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Sua resposta:
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSuggestions(true)}
                    className="text-purple-600"
                  >
                    <Lightbulb className="w-4 h-4 mr-1" />
                    Ver Sugestões
                  </Button>
                </div>
                
                {currentStepConfig.field === 'painPoint' || currentStepConfig.field === 'solution' ? (
                  <Textarea
                    value={quizData[currentStepConfig.field]}
                    onChange={(e) => updateField(e.target.value)}
                    placeholder={currentStepConfig.placeholder}
                    className="min-h-[100px] text-base"
                  />
                ) : (
                  <Input
                    value={quizData[currentStepConfig.field]}
                    onChange={(e) => updateField(e.target.value)}
                    placeholder={currentStepConfig.placeholder}
                    className="text-base h-12"
                  />
                )}
              </div>

              {/* Navegação */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="min-w-[120px]"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                
                <Button
                  onClick={nextStep}
                  disabled={!canProceed() || isGenerating}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 min-w-[120px]"
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  ) : isLastStep ? (
                    <Zap className="w-4 h-4 mr-1" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-1" />
                  )}
                  {isGenerating ? "Gerando..." : isLastStep ? "Gerar Quiz I.A." : "Próximo"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dica da I.A. (Alert animado) */}
        {showAITip && currentStepConfig && (
          <Alert className="mb-6 border-purple-200 bg-purple-50 animate-pulse">
            <Brain className="w-4 h-4 text-purple-600" />
            <AlertDescription className="text-purple-700">
              {currentStepConfig.aiTip}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Modal de Sugestões */}
      <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Sugestões da I.A.
            </DialogTitle>
            <DialogDescription>
              Clique em uma sugestão para usar ou se inspire para criar a sua própria
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {currentStepConfig?.suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start h-auto p-3 text-left"
                onClick={() => selectSuggestion(suggestion)}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span className="text-sm">{suggestion}</span>
                </div>
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuggestions(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}