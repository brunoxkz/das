import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Rocket, Brain, Lightbulb, ArrowLeft, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function QuizIASimple() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    niche: "",
    problem: "",
    transformation: "",
    title: "",
    description: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateQuiz = async () => {
    if (!formData.niche || !formData.problem || !formData.transformation) {
      toast({
        title: "Campos Obrigatórios",
        description: "Preencha pelo menos nicho, problema e transformação",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Etapa 1: Gerar estrutura do quiz com I.A.
      const generateResponse = await apiRequest("/api/quiz-ia/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!generateResponse.ok) {
        throw new Error("Erro ao gerar quiz");
      }

      const quizStructure = await generateResponse.json();

      // Etapa 2: Criar quiz no banco com a estrutura gerada
      const createResponse = await apiRequest("/api/quiz-ia/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title || quizStructure.title,
          description: formData.description || quizStructure.description,
          structure: quizStructure.structure,
          formData: formData
        })
      });

      if (!createResponse.ok) {
        throw new Error("Erro ao salvar quiz");
      }

      const result = await createResponse.json();

      toast({
        title: "🎉 Quiz I.A. Criado com Sucesso!",
        description: "Seu quiz foi criado e está pronto para ser editado",
        duration: 4000
      });

      // Redirecionar para editar o quiz criado
      setTimeout(() => {
        setLocation(`/quizzes/${result.id}/edit`);
      }, 1500);

    } catch (error) {
      console.error("Erro na criação do Quiz I.A.:", error);
      toast({
        title: "Erro ao gerar Quiz I.A.",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      {/* Particles Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Button
            onClick={() => setLocation("/dashboard")}
            variant="ghost"
            className="absolute top-0 left-0 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full mr-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Quiz I.A. - Criação Inteligente
            </h1>
          </div>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Crie funis de vendas completos com nossa I.A. avançada
          </p>
        </div>

        {/* Formulário Principal */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl text-center text-gray-800 flex items-center justify-center">
              <Sparkles className="w-6 h-6 mr-2 text-yellow-500" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coluna Esquerda */}
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 font-medium">Seu Nicho *</Label>
                  <Input
                    placeholder="Ex: Emagrecimento para mulheres 40+"
                    value={formData.niche}
                    onChange={(e) => handleInputChange("niche", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Título do Quiz (opcional)</Label>
                  <Input
                    placeholder="Ex: Qual Dieta Ideal Para Você?"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Descrição (opcional)</Label>
                  <Textarea
                    placeholder="Breve descrição do seu quiz..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>

              {/* Coluna Direita */}
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 font-medium">Problema Principal *</Label>
                  <Textarea
                    placeholder="Ex: Se sente insegura com o próprio corpo..."
                    value={formData.problem}
                    onChange={(e) => handleInputChange("problem", e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-gray-700 font-medium">Transformação Oferecida *</Label>
                  <Textarea
                    placeholder="Ex: Conquistar o corpo dos sonhos e autoestima..."
                    value={formData.transformation}
                    onChange={(e) => handleInputChange("transformation", e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Dicas I.A. */}
            <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <Lightbulb className="w-4 h-4 text-blue-500" />
              <AlertDescription className="text-blue-700">
                <strong>Dica I.A.:</strong> Seja específico no nicho e focado na dor emocional do problema. 
                Isso ajuda a I.A. a criar perguntas mais envolventes e direcionadas.
              </AlertDescription>
            </Alert>

            {/* Botão de Geração */}
            <div className="pt-6">
              <Button
                onClick={generateQuiz}
                disabled={isGenerating || !formData.niche || !formData.problem || !formData.transformation}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 text-lg font-semibold shadow-lg transform transition-all duration-200 hover:scale-105"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Criando Quiz com I.A...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-3" />
                    Gerar Quiz com Inteligência Artificial
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Benefícios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Rocket className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-800 mb-2">Criação Rápida</h3>
              <p className="text-gray-600 text-sm">Quiz completo gerado em menos de 30 segundos</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-800 mb-2">I.A. Inteligente</h3>
              <p className="text-gray-600 text-sm">Perguntas otimizadas para máxima conversão</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-800 mb-2">Personalização</h3>
              <p className="text-gray-600 text-sm">Totalmente adaptado ao seu nicho e objetivos</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}