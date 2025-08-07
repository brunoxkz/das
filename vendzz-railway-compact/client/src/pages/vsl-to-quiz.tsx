import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Play, Download, Upload, Zap, CheckCircle, AlertCircle, Clock, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function VSLToQuiz() {
  const [vslText, setVslText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateQuizMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest("POST", "/api/ai/vsl-to-quiz", { vslText: text });
    },
    onSuccess: (data) => {
      toast({
        title: "Quiz gerado com sucesso!",
        description: "O funil foi criado automaticamente pela nossa IA.",
      });
      setIsGenerating(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao gerar quiz",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  const handleGenerateQuiz = () => {
    if (!vslText.trim()) {
      toast({
        title: "Texto necessário",
        description: "Cole o texto da VSL para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    generateQuizMutation.mutate(vslText);
  };

  const tutorialSteps = [
    {
      step: "1",
      title: "Baixar a VSL em MP3",
      description: "Use nossa extensão para extrair o áudio",
      icon: <Download className="w-5 h-5" />,
      color: "bg-blue-500",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">📥 Extensão Vendzz VSL Downloader</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Instale nossa extensão gratuita para Chrome/Firefox que permite baixar qualquer VSL como MP3.
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Instalar Extensão
            </Button>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-medium">Como usar:</h5>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Acesse a página com a VSL</li>
              <li>• Clique no ícone da extensão Vendzz</li>
              <li>• Aguarde a detecção automática do vídeo</li>
              <li>• Clique em "Baixar MP3" (qualidade 128kbps)</li>
              <li>• O arquivo será salvo na pasta Downloads</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      step: "2", 
      title: "Transcrever no Assembly AI",
      description: "Converta o áudio em texto preciso",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "bg-purple-500",
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">🎤 Assembly AI - Transcrição Profissional</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Use o Assembly AI para obter a transcrição mais precisa do mercado (98%+ precisão).
            </p>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <Upload className="w-4 h-4 mr-2" />
              Abrir Assembly AI
            </Button>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-medium">Passo a passo:</h5>
            <ol className="space-y-1 text-sm text-muted-foreground">
              <li>1. Acesse assemblyai.com e faça login</li>
              <li>2. Clique em "Upload" e selecione seu MP3</li>
              <li>3. Escolha idioma: "Portuguese (Brazil)"</li>
              <li>4. Aguarde 2-5 minutos para processamento</li>
              <li>5. Copie todo o texto transcrito</li>
            </ol>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="font-medium text-amber-700 dark:text-amber-300">Dica Importante</span>
            </div>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Para melhor resultado, certifique-se que o áudio tem qualidade clara e sem ruídos de fundo.
            </p>
          </div>
        </div>
      )
    },
    {
      step: "3",
      title: "Colar Texto e Gerar",
      description: "Nossa IA criará o funil automaticamente", 
      icon: <Zap className="w-5 h-5" />,
      color: "bg-green-500",
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">🤖 IA Avançada da Vendzz</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Nossa IA analisa o texto e cria automaticamente um quiz personalizado baseado no conteúdo da VSL.
            </p>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-medium">O que nossa IA faz:</h5>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✓ Identifica pontos de dor mencionados</li>
              <li>✓ Extrai benefícios e soluções principais</li>
              <li>✓ Cria perguntas de qualificação inteligentes</li>
              <li>✓ Gera CTA e copy persuasivos</li>
              <li>✓ Estrutura o funil com lógica de conversão</li>
              <li>✓ Personaliza para o nicho detectado</li>
            </ul>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="font-medium text-emerald-700 dark:text-emerald-300">Resultado Esperado</span>
            </div>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Quiz completo com 8-15 páginas otimizado para conversão no seu nicho específico.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Play className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Converter VSL → Quiz</h1>
            <p className="text-muted-foreground">
              Transforme suas Video Sales Letters em quizzes de alta conversão com IA
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30">
            IA Avançada
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30">
            Conversão Otimizada
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30">
            Tutorial Completo
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="tutorial" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tutorial" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Tutorial Passo a Passo
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Gerador de Quiz
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tutorial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Tutorial Completo: VSL → Quiz
              </CardTitle>
              <CardDescription>
                Siga este processo simples de 3 etapas para converter qualquer VSL em um quiz de alta conversão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {tutorialSteps.map((step, index) => (
                  <div key={step.step}>
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 ${step.color} rounded-full flex items-center justify-center text-white`}>
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">Etapa {step.step}</h3>
                          <Badge variant="outline">{step.title}</Badge>
                        </div>
                        <p className="text-muted-foreground mb-4">{step.description}</p>
                        {step.content}
                      </div>
                    </div>
                    {index < tutorialSteps.length - 1 && (
                      <Separator className="my-8" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                Gerador de Quiz com IA
              </CardTitle>
              <CardDescription>
                Cole aqui o texto da sua VSL transcrita pelo Assembly AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="vsl-text">Texto da VSL Transcrita</Label>
                <Textarea
                  id="vsl-text"
                  placeholder="Cole aqui todo o texto da sua VSL transcrita pelo Assembly AI...

Exemplo:
'Você já se perguntou por que algumas pessoas conseguem emagrecer facilmente enquanto outras lutam constantemente contra a balança? A verdade é que existe um segredo que a indústria das dietas não quer que você saiba...'

Nossa IA analisará o conteúdo e criará um quiz personalizado para o seu nicho."
                  value={vslText}
                  onChange={(e) => setVslText(e.target.value)}
                  className="min-h-[300px] resize-none"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{vslText.length} caracteres</span>
                  <span>Recomendado: 500-5000 caracteres</span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  Como obter o melhor resultado
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Cole o texto completo da VSL (não apenas trechos)</li>
                  <li>• Certifique-se que a transcrição está limpa e sem erros</li>
                  <li>• Inclua as CTAs e ofertas mencionadas na VSL</li>
                  <li>• Nossa IA funciona melhor com VSLs de 3-20 minutos</li>
                </ul>
              </div>

              <Button 
                onClick={handleGenerateQuiz}
                disabled={!vslText.trim() || isGenerating}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Gerando Quiz com IA...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Gerar Quiz Automaticamente
                  </>
                )}
              </Button>

              {vslText.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">
                    🎯 Preview do que será gerado:
                  </h4>
                  <ul className="space-y-1 text-sm text-green-600 dark:text-green-400">
                    <li>✓ Quiz com 8-15 perguntas de qualificação</li>
                    <li>✓ Páginas de resultados personalizadas</li>
                    <li>✓ CTAs otimizadas para conversão</li>
                    <li>✓ Captura de leads integrada</li>
                    <li>✓ Design responsivo e profissional</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}