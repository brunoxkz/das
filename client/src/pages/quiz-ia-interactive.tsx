import React, { useState, useEffect, useRef } from "react";
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
  Key,
  Star,
  Rocket,
  Heart,
  Crown,
  Trophy,
  Gem
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
  const [isStepChanging, setIsStepChanging] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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
    setIsStepChanging(true);
    
    // Efeito de celebração ao avançar
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 800);
    
    setTimeout(() => {
      if (currentStep < STEPS_CONFIG.length) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Gerar quiz final
        generateFinalQuiz();
      }
      setIsStepChanging(false);
    }, 300);
  };

  const prevStep = () => {
    setIsStepChanging(true);
    setTimeout(() => {
      if (currentStep > 1) {
        setCurrentStep(prev => prev - 1);
      }
      setIsStepChanging(false);
    }, 300);
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

  // Tela de sucesso ESPETACULAR
  if (isFormComplete) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background ultra moderno */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-green-500/30 to-emerald-600/30 animate-gradient-move"></div>
          
          {/* Partículas de celebração */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-sparkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`
                }}
              >
                <Star className="w-3 h-3 text-yellow-400" />
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-3xl w-full text-center">
            {/* Ícone de sucesso épico */}
            <div className="mb-8 transform animate-fadeIn">
              <div className="relative mx-auto w-32 h-32 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-green-500 rounded-full animate-pulse-glow"></div>
                <div className="relative bg-gradient-to-r from-yellow-400 to-green-500 w-full h-full rounded-full flex items-center justify-center">
                  <CheckCircle className="w-16 h-16 text-black" />
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
                🎉 QUIZ I.A. 
              </h1>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-green-500 bg-clip-text text-transparent mb-6">
                CRIADO COM SUCESSO!
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Seu funil de vendas inteligente está pronto para gerar conversões
              </p>
            </div>

            {/* Card do quiz com animações */}
            <Card className="bg-black/20 backdrop-blur-lg border border-white/20 shadow-2xl mb-8 transform animate-slideInUp quiz-ia-card">
              <CardContent className="p-8">
                <div className="bg-gradient-to-r from-yellow-400/20 to-green-500/20 p-6 rounded-xl border border-yellow-400/30 mb-6">
                  <p className="text-white font-semibold mb-3 flex items-center justify-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    URL do seu Quiz I.A.:
                  </p>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 text-white text-sm">
                      {finalQuizUrl}
                    </code>
                    <Button
                      size="lg"
                      onClick={copyQuizUrl}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold quiz-ia-button"
                    >
                      <Copy className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => window.open(finalQuizUrl, '_blank')}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold h-14 quiz-ia-button"
                  >
                    <ExternalLink className="w-5 h-5 mr-3" />
                    Visualizar Quiz I.A.
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.location.reload()}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm h-14 quiz-ia-button"
                  >
                    <RefreshCw className="w-5 h-5 mr-3" />
                    Criar Outro Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas impressionantes */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 text-center">
                <div className="text-2xl font-bold text-yellow-400">100%</div>
                <div className="text-white/80 text-sm">I.A. Powered</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 text-center">
                <div className="text-2xl font-bold text-green-400">+300%</div>
                <div className="text-white/80 text-sm">Conversões</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 text-center">
                <div className="text-2xl font-bold text-blue-400">24/7</div>
                <div className="text-white/80 text-sm">Automático</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background animado com gradientes */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-blue-500/20 to-purple-600/20 animate-pulse"></div>
        
        {/* Partículas flutuantes */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Header animado */}
          <div className="text-center mb-12 transform animate-fadeIn">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 rounded-full text-black font-bold mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Brain className="w-6 h-6 animate-pulse" />
              <Sparkles className="w-5 h-5 animate-spin" />
              I.A. QUIZ BUILDER 2025
              <Rocket className="w-5 h-5 animate-bounce" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Crie Quiz de Vendas
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              com Inteligência Artificial
            </h2>
            <p className="text-white/80 text-lg">Sistema mais avançado de criação de funis de vendas</p>
          </div>

          {/* Progress Bar Ultra Animado */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">
                  Etapa {currentStep} de {STEPS_CONFIG.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">
                  {Math.round(progress)}% completo
                </span>
              </div>
            </div>
            <div className="relative h-4 bg-black/30 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full"></div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          </div>

          {/* Step Card Ultra Moderno */}
          {currentStepConfig && (
            <div className={`transform transition-all duration-500 ${isStepChanging ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              <Card 
                ref={cardRef}
                className="relative overflow-hidden bg-black/20 backdrop-blur-lg border border-white/20 shadow-2xl"
              >
                {/* Efeito brilho animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
                
                {/* Celebração de partículas */}
                {showCelebration && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute animate-ping"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      >
                        <Star className="w-4 h-4 text-yellow-400" />
                      </div>
                    ))}
                  </div>
                )}

                <CardHeader className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-2xl text-black shadow-lg transform hover:scale-110 transition-transform duration-300">
                        {currentStepConfig.icon}
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl opacity-30 blur animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold text-white mb-2">
                        {currentStepConfig.title}
                      </CardTitle>
                      <p className="text-white/80 text-lg">{currentStepConfig.description}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-8 relative z-10">
                  {/* Input Principal Animado */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-lg font-semibold text-white flex items-center gap-2">
                        <Gem className="w-5 h-5 text-yellow-400" />
                        Sua resposta:
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSuggestions(true)}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Ver Sugestões I.A.
                      </Button>
                    </div>
                    
                    {currentStepConfig.field === 'painPoint' || currentStepConfig.field === 'solution' ? (
                      <Textarea
                        value={quizData[currentStepConfig.field]}
                        onChange={(e) => updateField(e.target.value)}
                        placeholder={currentStepConfig.placeholder}
                        className="min-h-[120px] text-lg bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/20 transition-all duration-300"
                      />
                    ) : (
                      <Input
                        value={quizData[currentStepConfig.field]}
                        onChange={(e) => updateField(e.target.value)}
                        placeholder={currentStepConfig.placeholder}
                        className="text-lg h-14 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/20 transition-all duration-300"
                      />
                    )}
                  </div>

                  {/* Navegação Ultra Animada */}
                  <div className="flex items-center justify-between pt-8">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="min-w-[140px] h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm disabled:opacity-50 transition-all duration-300"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      Anterior
                    </Button>
                    
                    <Button
                      onClick={nextStep}
                      disabled={!canProceed() || isGenerating}
                      className="min-w-[180px] h-12 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold transform hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Gerando I.A...
                        </>
                      ) : isLastStep ? (
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
  );
}