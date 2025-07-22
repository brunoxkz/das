import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Lightbulb
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth-jwt";

interface QuizData {
  niche: string;
  targetAudience: string;
  painPoint: string;
  solution: string;
  productName: string;
  productPrice: string;
  pixKey: string;
  generatedQuiz?: any;
  quizId?: string;
}

interface GeneratedContent {
  questions: Array<{
    id: string;
    type: string;
    question: string;
    options?: string[];
    placeholder?: string;
  }>;
  transitions: {
    goodNews: string;
    badNews: string;
    pitch: string;
  };
  checkout: {
    headline: string;
    description: string;
    features: string[];
  };
}

const STEPS = [
  { id: 1, title: "Definir Nicho", description: "Conte-nos sobre seu mercado" },
  { id: 2, title: "I.A. Gerando", description: "Criando seu quiz automaticamente" },
  { id: 3, title: "Configurar PIX", description: "Configure sua chave PIX" },
  { id: 4, title: "Quiz Pronto", description: "Tudo pronto para vender!" }
];

const NICHES_EXAMPLES = [
  "Emagrecimento e dieta",
  "Marketing digital",
  "Ganhar dinheiro online",
  "Relacionamentos",
  "Desenvolvimento pessoal",
  "Fitness e musculação",
  "Beleza e cuidados",
  "Culinária e receitas"
];

export default function QuizIA() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizData, setQuizData] = useState<QuizData>({
    niche: "",
    targetAudience: "",
    painPoint: "",
    solution: "",
    productName: "",
    productPrice: "",
    pixKey: ""
  });
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [finalQuizUrl, setFinalQuizUrl] = useState("");

  const progress = (currentStep / STEPS.length) * 100;

  // Função para gerar conteúdo com I.A.
  const generateQuizContent = async () => {
    setIsGenerating(true);
    
    try {
      const response = await apiRequest("/api/quiz-ia/generate", {
        method: "POST",
        body: JSON.stringify({
          niche: quizData.niche,
          targetAudience: quizData.targetAudience,
          painPoint: quizData.painPoint,
          solution: quizData.solution,
          productName: quizData.productName,
          productPrice: quizData.productPrice
        })
      });

      if (response.success) {
        setGeneratedContent(response.content);
        toast({
          title: "🚀 Quiz I.A. Gerado!",
          description: "Seu quiz foi criado automaticamente pela inteligência artificial!",
        });
        setCurrentStep(3);
      } else {
        throw new Error(response.error || "Erro ao gerar quiz");
      }
    } catch (error) {
      console.error("Erro ao gerar quiz I.A.:", error);
      toast({
        title: "Erro na Geração",
        description: "Ocorreu um erro ao gerar seu quiz. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Função para criar o quiz final
  const createFinalQuiz = async () => {
    if (!generatedContent) return;
    
    setIsCreatingQuiz(true);
    
    try {
      const response = await apiRequest("/api/quiz-ia/create", {
        method: "POST",
        body: JSON.stringify({
          quizData,
          generatedContent,
          pixKey: quizData.pixKey
        })
      });

      if (response.success) {
        setFinalQuizUrl(response.quizUrl);
        setCurrentStep(4);
        toast({
          title: "🎉 Quiz Criado!",
          description: "Seu quiz está pronto para gerar vendas!",
        });
      } else {
        throw new Error(response.error || "Erro ao criar quiz");
      }
    } catch (error) {
      console.error("Erro ao criar quiz final:", error);
      toast({
        title: "Erro na Criação",
        description: "Ocorreu um erro ao criar o quiz final. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  // Função para copiar URL
  const copyQuizUrl = () => {
    navigator.clipboard.writeText(finalQuizUrl);
    toast({
      title: "URL Copiada!",
      description: "A URL do seu quiz foi copiada para a área de transferência.",
    });
  };

  // Função para verificar se pode avançar
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return quizData.niche && quizData.targetAudience && quizData.painPoint && 
               quizData.solution && quizData.productName && quizData.productPrice;
      case 3:
        return quizData.pixKey;
      default:
        return true;
    }
  };

  // Render do Step 1 - Definir Nicho
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full text-purple-700 font-semibold mb-4">
          <Brain className="w-5 h-5" />
          I.A. QUIZ BUILDER
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Monte seu Quiz com I.A.
        </h1>
        <p className="text-lg text-gray-600">
          Faça sua primeira venda em 24 horas recebendo diretamente no seu PIX
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Conte-nos sobre seu nicho
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qual é o seu nicho/mercado?
            </label>
            <Input
              placeholder="Ex: Emagrecimento, Marketing Digital, Relacionamentos..."
              value={quizData.niche}
              onChange={(e) => setQuizData(prev => ({ ...prev, niche: e.target.value }))}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {NICHES_EXAMPLES.slice(0, 4).map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuizData(prev => ({ ...prev, niche: example }))}
                  className="text-xs"
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quem é seu público-alvo?
            </label>
            <Input
              placeholder="Ex: Mulheres de 25-45 anos que querem emagrecer..."
              value={quizData.targetAudience}
              onChange={(e) => setQuizData(prev => ({ ...prev, targetAudience: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qual é a principal dor/problema?
            </label>
            <Textarea
              placeholder="Ex: Não conseguem emagrecer mesmo fazendo dieta..."
              value={quizData.painPoint}
              onChange={(e) => setQuizData(prev => ({ ...prev, painPoint: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qual é sua solução/produto?
            </label>
            <Textarea
              placeholder="Ex: Método único de emagrecimento em 30 dias..."
              value={quizData.solution}
              onChange={(e) => setQuizData(prev => ({ ...prev, solution: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do produto
              </label>
              <Input
                placeholder="Ex: Método Emagreça Rápido"
                value={quizData.productName}
                onChange={(e) => setQuizData(prev => ({ ...prev, productName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço (R$)
              </label>
              <Input
                placeholder="Ex: 97"
                value={quizData.productPrice}
                onChange={(e) => setQuizData(prev => ({ ...prev, productPrice: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render do Step 2 - I.A. Gerando
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 px-4 py-2 rounded-full text-green-700 font-semibold mb-4">
          <Wand2 className="w-5 h-5 animate-pulse" />
          I.A. TRABALHANDO
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Criando seu quiz automaticamente...
        </h2>
        <p className="text-gray-600">
          Nossa I.A. está gerando perguntas, transições e checkout personalizados
        </p>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
                <Sparkles className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700">Analisando seu nicho: {quizData.niche}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
                <span className="text-blue-700">Gerando perguntas inteligentes...</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Lightbulb className="w-5 h-5 text-purple-600 animate-pulse" />
                <span className="text-purple-700">Criando transições persuasivas...</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Target className="w-5 h-5 text-orange-600 animate-pulse" />
                <span className="text-orange-700">Configurando checkout PIX...</span>
              </div>
            </div>

            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <strong>Tempo estimado:</strong> 30-60 segundos para gerar todo o conteúdo
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render do Step 3 - Configurar PIX
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-yellow-100 px-4 py-2 rounded-full text-green-700 font-semibold mb-4">
          <QrCode className="w-5 h-5" />
          CONFIGURAR PIX
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Quiz gerado com sucesso! 🎉
        </h2>
        <p className="text-gray-600">
          Agora configure sua chave PIX para receber os pagamentos
        </p>
      </div>

      {generatedContent && (
        <div className="space-y-6">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                Preview Completo do Quiz Gerado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">{generatedContent.questions.length}</div>
                    <div className="text-sm text-gray-600">Perguntas</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">3</div>
                    <div className="text-sm text-gray-600">Transições</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-purple-600">1</div>
                    <div className="text-sm text-gray-600">Checkout</div>
                  </div>
                </div>

                {/* Preview detalhado das perguntas */}
                <div>
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Todas as Perguntas Criadas:
                  </h4>
                  <div className="space-y-3">
                    {generatedContent.questions.map((question: any, index: number) => (
                      <div key={question.id} className="bg-white p-4 rounded-lg border">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 mb-2">{question.question}</p>
                            {question.type === 'multiple_choice' && question.options && (
                              <div className="grid grid-cols-1 gap-2">
                                {question.options.map((option: string, optIndex: number) => (
                                  <div key={optIndex} className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                    {option}
                                  </div>
                                ))}
                              </div>
                            )}
                            {(question.type === 'text' || question.type === 'email') && (
                              <div className="text-sm text-gray-500 italic">
                                Campo de entrada: {question.placeholder}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview das transições */}
                <div>
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Transições Inteligentes:
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <div className="font-medium text-green-700 mb-2">✅ Boa Notícia:</div>
                      <p className="text-sm text-gray-700">{generatedContent.transitions.goodNews}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <div className="font-medium text-orange-700 mb-2">⚠️ Má Notícia:</div>
                      <p className="text-sm text-gray-700">{generatedContent.transitions.badNews}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <div className="font-medium text-purple-700 mb-2">🚀 Pitch de Vendas:</div>
                      <p className="text-sm text-gray-700">{generatedContent.transitions.pitch}</p>
                    </div>
                  </div>
                </div>

                {/* Preview do checkout */}
                <div>
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Página de Checkout:
                  </h4>
                  <div className="bg-white p-4 rounded-lg border border-purple-200">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{generatedContent.checkout.headline}</h3>
                      <p className="text-gray-600">{generatedContent.checkout.description}</p>
                      <div className="text-2xl font-bold text-green-600 mt-2">R$ {quizData.productPrice}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium text-gray-800">✨ Você vai receber:</div>
                      {generatedContent.checkout.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>🎯 Quiz Completo!</strong> Sua I.A. criou um funil de vendas completo com {generatedContent.questions.length} perguntas estratégicas, transições persuasivas e checkout otimizado para conversão.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-green-600" />
            Configuração PIX - Receba Direto na Sua Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sua chave PIX (onde receberá os pagamentos) *
            </label>
            <Input
              placeholder="Digite sua chave PIX (CPF, telefone, email ou chave aleatória)"
              value={quizData.pixKey}
              onChange={(e) => setQuizData(prev => ({ ...prev, pixKey: e.target.value }))}
              className={`text-base ${quizData.pixKey ? 'border-green-500 bg-green-50' : ''}`}
            />
            {quizData.pixKey && (
              <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                Chave PIX configurada
              </div>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Esta chave será usada para gerar QR codes de pagamento automaticamente
            </p>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>🔐 Não tem chave PIX?</strong> Abra o app do seu banco → PIX → Minhas Chaves → Criar nova chave. Use seu CPF, email ou telefone como chave.
            </AlertDescription>
          </Alert>

          <Alert>
            <QrCode className="h-4 w-4" />
            <AlertDescription>
              <strong>💰 Como funciona:</strong> Quando alguém completar seu quiz, será direcionado para checkout com QR code PIX. O pagamento de R$ {quizData.productPrice} cai direto na sua conta instantaneamente!
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-800 mb-1">Tipos aceitos:</div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• CPF: 123.456.789-00</div>
                <div>• Email: seu@email.com</div>
                <div>• Telefone: +5511999887766</div>
                <div>• Chave aleatória: código do banco</div>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-800 mb-1">Vantagens:</div>
              <div className="text-sm text-green-600 space-y-1">
                <div>• Pagamento instantâneo</div>
                <div>• Sem taxas para você</div>
                <div>• QR code automático</div>
                <div>• Confirmação em tempo real</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render do Step 4 - Quiz Pronto
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-yellow-100 px-4 py-2 rounded-full text-green-700 font-semibold mb-4">
          <CheckCircle className="w-5 h-5" />
          QUIZ PRONTO!
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🚀 Seu quiz está pronto para vender!
        </h2>
        <p className="text-gray-600">
          Comece a divulgar agora e faça sua primeira venda em 24 horas
        </p>
      </div>

      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">URL do seu quiz:</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={copyQuizUrl}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar
              </Button>
            </div>
            <div className="p-3 bg-white border rounded-lg">
              <code className="text-sm text-blue-600 break-all">
                {finalQuizUrl || `${window.location.origin}/quiz/seu-quiz-id`}
              </code>
            </div>
            
            <div className="flex gap-3">
              <Button 
                className="flex-1" 
                onClick={() => window.open(finalQuizUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visualizar Quiz
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setCurrentStep(1);
                  setQuizData({
                    niche: "",
                    targetAudience: "",
                    painPoint: "",
                    solution: "",
                    productName: "",
                    productPrice: "",
                    pixKey: ""
                  });
                  setGeneratedContent(null);
                  setFinalQuizUrl("");
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Criar Outro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🎯 Próximos passos para vender</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <span>Divulgue o link do quiz nas suas redes sociais</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <span>Impulsione o post ou faça anúncios pagos</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span>Monitore os leads e vendas pelo dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <span>Receba os pagamentos diretamente no seu PIX!</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Quiz I.A.</h1>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {STEPS[currentStep - 1]?.title}
            </Badge>
          </div>
          
          <Progress value={progress} className="mb-4" />
          
          <div className="flex justify-between items-center">
            {STEPS.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex items-center ${index !== STEPS.length - 1 ? 'flex-1' : ''}`}
              >
                <div className={`flex items-center gap-2 ${
                  currentStep >= step.id ? 'text-purple-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step.id 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                  </div>
                  <div className="hidden md:block">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index !== STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1 || isGenerating || isCreatingQuiz}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </Button>

          <div className="space-x-3">
            {currentStep === 1 && (
              <Button
                onClick={() => {
                  setCurrentStep(2);
                  generateQuizContent();
                }}
                disabled={!canProceed() || isGenerating}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="w-4 h-4" />
                Gerar com I.A.
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}

            {currentStep === 3 && (
              <Button
                onClick={createFinalQuiz}
                disabled={!canProceed() || isCreatingQuiz}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {isCreatingQuiz ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Finalizar Quiz
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}