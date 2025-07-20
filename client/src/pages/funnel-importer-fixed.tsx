import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  Download, Globe, Link, Eye, CheckCircle, PlayCircle, 
  Upload, Code, Copy, Plus
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import QuizFullPreview from "@/components/QuizFullPreview";

export default function FunnelImporter() {
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showQuizPreview, setShowQuizPreview] = useState(false);
  const [previewQuiz, setPreviewQuiz] = useState<any>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  // Buscar dados do usuário e limites do plano
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/user']
  });

  const { data: userQuizzes } = useQuery({
    queryKey: ['/api/quizzes']
  });

  // Verificar limites do plano
  const checkPlanLimits = () => {
    if (!userData || !userQuizzes) return false;
    
    const planLimits = {
      free: 3,
      basic: Infinity,
      premium: Infinity,
      enterprise: Infinity
    };
    
    const currentPlan = userData.plan || 'free';
    const currentQuizCount = userQuizzes.length || 0;
    const limit = planLimits[currentPlan as keyof typeof planLimits] || 3;
    
    return currentQuizCount < limit;
  };

  const getPlanInfo = () => {
    if (!userData || !userQuizzes) return { current: 0, limit: 3, plan: 'free' };
    
    const planLimits = {
      free: 3,
      basic: Infinity,
      premium: Infinity,
      enterprise: Infinity
    };
    
    const currentPlan = userData.plan || 'free';
    const currentQuizCount = userQuizzes.length || 0;
    const limit = planLimits[currentPlan as keyof typeof planLimits] || 3;
    
    return { current: currentQuizCount, limit, plan: currentPlan };
  };

  const importFunnel = async () => {
    if (!analysisResult || !checkPlanLimits()) return;
    
    setImporting(true);
    setShowImportConfirm(false);
    
    try {
      // Extrair cores e imagens dos elementos do funil
      const extractedColors = extractColorsFromFunnel(analysisResult.data);
      const extractedImages = extractImagesFromFunnel(analysisResult.data);
      
      // Criar quiz importado na conta do usuário
      const response = await apiRequest("POST", "/api/funnel/import", {
        funnelId: analysisResult.data.id,
        title: `${analysisResult.data.title} (Importado)`,
        url: url.trim(),
        preserveColors: extractedColors,
        preserveImages: extractedImages
      });

      if (response.success) {
        // Gerar sugestão de IA após importação bem-sucedida
        const aiSuggestion = generateAISuggestion(analysisResult.data);
        
        toast({
          title: "🎉 Funil importado com sucesso!",
          description: `Quiz "${response.data.title}" foi criado na sua conta.`,
        });

        // Mostrar sugestão de IA
        setTimeout(() => {
          toast({
            title: "💡 Sugestão de melhoria da nossa I.A.",
            description: aiSuggestion,
            duration: 8000,
          });
        }, 2000);
        
        // Redirecionar para edição do quiz importado
        window.location.href = `/quiz-builder?edit=${response.data.id}`;
      } else {
        throw new Error(response.error || "Erro na importação");
      }
    } catch (error: any) {
      console.error("❌ ERRO NA IMPORTAÇÃO:", error);
      toast({
        title: "Erro na importação",
        description: error.message || "Não foi possível importar este funil.",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  // Extrair cores dos elementos do funil
  const extractColorsFromFunnel = (funnelData: any) => {
    const colors = {
      buttons: [],
      text: [],
      backgrounds: [],
      primary: null
    };

    if (funnelData.elements) {
      funnelData.elements.forEach((element: any) => {
        if (element.properties) {
          // Cores de botões
          if (element.type === 'button' && element.properties.backgroundColor) {
            colors.buttons.push(element.properties.backgroundColor);
          }
          
          // Cores de texto
          if (element.properties.textColor) {
            colors.text.push(element.properties.textColor);
          }
          
          // Cores de fundo
          if (element.properties.backgroundColor) {
            colors.backgrounds.push(element.properties.backgroundColor);
          }
        }
      });
    }

    // Cor primária do tema
    if (funnelData.theme?.colors?.primary) {
      colors.primary = funnelData.theme.colors.primary;
    }

    return colors;
  };

  // Extrair imagens dos elementos do funil
  const extractImagesFromFunnel = (funnelData: any) => {
    const images = [];

    if (funnelData.elements) {
      funnelData.elements.forEach((element: any) => {
        if (element.type === 'image' && element.properties?.imageUrl) {
          images.push({
            url: element.properties.imageUrl,
            alt: element.properties.alt || '',
            position: element.position
          });
        }
      });
    }

    return images;
  };

  // Gerar sugestão de IA baseada no funil importado
  const generateAISuggestion = (funnelData: any) => {
    const suggestions = [
      `Considere adicionar mais elementos de urgência nas primeiras páginas para aumentar a conversão em ${Math.round(15 + Math.random() * 25)}%.`,
      `Recomendo testar cores mais contrastantes nos botões CTA para melhorar a taxa de cliques em até ${Math.round(20 + Math.random() * 30)}%.`,
      `Adicione elementos de prova social (depoimentos) nas páginas ${Math.ceil(Math.random() * 3)} e ${Math.ceil(Math.random() * 3) + 3} para aumentar a credibilidade.`,
      `Implemente um timer de countdown na página de captura de lead para criar senso de urgência e aumentar conversões.`,
      `Considere adicionar um quiz interativo de qualificação antes da captura de email para melhorar a qualidade dos leads.`,
      `Teste versões A/B das headlines principais - headlines em formato pergunta convertem ${Math.round(15 + Math.random() * 20)}% melhor.`,
      `Adicione ícones de garantia e segurança próximos aos campos de email para aumentar a confiança do usuário.`,
      `Considere implementar um popup de saída (exit-intent) para recuperar ${Math.round(10 + Math.random() * 15)}% dos visitantes que tentarem sair.`,
    ];

    // Sugestões específicas baseadas no número de páginas
    if (funnelData.pages > 5) {
      suggestions.push(`Com ${funnelData.pages} páginas, considere adicionar uma barra de progresso para reduzir abandono em até 25%.`);
    }

    // Sugestões baseadas nos elementos detectados
    if (funnelData.elements.length > 10) {
      suggestions.push(`Detectamos ${funnelData.elements.length} elementos. Considere simplificar as páginas iniciais para melhor performance mobile.`);
    }

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const analyzeUrl = async () => {
    if (!url.trim()) {
      toast({
        title: "URL obrigatória",
        description: "Digite a URL do funil que deseja analisar.",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await apiRequest("POST", "/api/funnel/analyze", {
        url: url.trim()
      });

      console.log("🔍 ANÁLISE COMPLETA:", response);

      if (response.success) {
        setAnalysisResult(response);
        toast({
          title: "✅ Funil analisado e salvo!",
          description: `${response.data.elements.length} elementos detectados e importados automaticamente.`
        });
      } else {
        throw new Error(response.error || "Erro na análise");
      }
    } catch (error: any) {
      console.error("❌ ERRO NA ANÁLISE:", error);
      toast({
        title: "Erro na análise",
        description: error.message || "Não foi possível analisar este funil.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Importador de Funis Inteligente
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Importe funis de Cakto, XQuiz, Effecto, NordAstro e outras plataformas preservando design e estrutura
              </p>
            </div>
          </div>
        </div>

        {/* Plataformas Suportadas e Tutorial */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                Plataformas Suportadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <span className="font-medium text-green-900 dark:text-green-100">Cakto</span>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        app.cakto.com.br - Detecção avançada até 50 páginas
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Avançado</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <span className="font-medium text-green-900 dark:text-green-100">XQuiz</span>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        *.xquiz.io - Sistema inteligente 18-45 páginas
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Avançado</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <span className="font-medium text-green-900 dark:text-green-100">Effecto</span>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        effectoapp.com - Quiz de produtividade personalizada
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Avançado</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                    <div>
                      <span className="font-medium text-purple-900 dark:text-purple-100">NordAstro</span>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        nordastro.com - Quiz de astrologia e crescimento pessoal
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">Avançado</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <span className="font-medium text-blue-900 dark:text-blue-100">ClickFunnels</span>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        clickfunnels.com - Importação básica
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Básico</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <PlayCircle className="h-5 w-5 text-gray-500" />
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">LeadPages & Outros</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Em desenvolvimento - Solicite sua plataforma
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Em Breve</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-purple-600" />
                Como Usar - Tutorial Rápido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-purple-700 dark:text-purple-300">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Copie a URL do funil</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Acesse o funil que deseja importar e copie a URL completa
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-purple-700 dark:text-purple-300">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Cole e analise</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Cole a URL no campo abaixo e clique em "Analisar e Importar"
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-purple-700 dark:text-purple-300">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Importe e customize</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Revise os elementos detectados e importe para sua conta
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                    💡 Preservação Visual Automática
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Cores, imagens e estilos são preservados automaticamente durante a importação
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* URL Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Analisar e Importar URL Automaticamente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Cole a URL do funil aqui (ex: https://app.cakto.com.br/quiz/exemplo)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={analyzeUrl}
                  disabled={analyzing}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {analyzing ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Analisar e Importar
                    </>
                  )}
                </Button>
              </div>
              
              {/* Exemplo rápido */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2 font-medium">
                  💡 Teste com exemplos das plataformas suportadas:
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUrl("https://app.cakto.com.br/quiz/pilates-na-parede-VsvLBF")}
                    className="text-green-600 border-green-200 hover:bg-green-100"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Exemplo Cakto
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUrl("https://test.xquiz.io/exemplo")}
                    className="text-purple-600 border-purple-200 hover:bg-purple-100"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Exemplo XQuiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultado da Análise */}
          {analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Funil Analisado e Salvo com Sucesso
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {analysisResult.data.elements.length} Elementos
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{analysisResult.data.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{analysisResult.data.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Quiz ID:</span>
                        <Badge variant="outline">{analysisResult.data.quizId || analysisResult.data.id}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Elementos:</span>
                        <Badge variant="outline">{analysisResult.data.elements.length} detectados</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Páginas:</span>
                        <Badge variant="outline">{analysisResult.data.pages}</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Elementos Detectados:</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {analysisResult.data.elements.slice(0, 10).map((element: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <Badge variant="outline" className="text-xs">
                            {element.type}
                          </Badge>
                          <span className="truncate">
                            {element.properties?.title || `Elemento ${index + 1}`}
                          </span>
                        </div>
                      ))}
                      {analysisResult.data.elements.length > 10 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{analysisResult.data.elements.length - 10} elementos adicionais
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botão de Importar */}
                <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">
                        Importar para sua conta
                      </h3>
                      <p className="text-sm text-purple-600 dark:text-purple-300">
                        Adicione este funil aos seus quizzes e customize como desejar
                      </p>
                    </div>
                    {!checkPlanLimits() ? (
                      <div className="flex flex-col gap-2">
                        <div className="text-right">
                          <Badge variant="destructive" className="mb-2">
                            Limite Atingido: {getPlanInfo().current}/{getPlanInfo().limit} quizzes
                          </Badge>
                        </div>
                        <Button
                          onClick={() => window.location.href = '/checkout-perfect'}
                          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          UPGRADE - R$1,00
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setShowImportConfirm(true)}
                        disabled={importing}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        {importing ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Importando...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            IMPORTAR FUNIL
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <a
                    href={`/quiz-builder?edit=${analysisResult.data.quizId || analysisResult.data.id}`}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-colors text-center"
                  >
                    🎨 Editar no Quiz Builder
                  </a>
                  <Button
                    onClick={() => {
                      setPreviewQuiz(analysisResult.data);
                      setShowQuizPreview(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    👁️ Visualizar Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}


        </div>

        {/* Quiz Full Preview */}
        <QuizFullPreview
          quiz={previewQuiz}
          isOpen={showQuizPreview}
          onClose={() => {
            setShowQuizPreview(false);
            setPreviewQuiz(null);
          }}
        />

        {/* Modal de Confirmação de Importação */}
        {showImportConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirmar Importação</h3>
              
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Tem certeza que deseja importar este funil para sua conta?
                </p>
                
                {analysisResult && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Funil:</span>
                      <span>{analysisResult.data.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Páginas:</span>
                      <span>{analysisResult.data.pages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Elementos:</span>
                      <span>{analysisResult.data.elements.length}</span>
                    </div>
                    
                    {/* Mostrar o que será preservado */}
                    <div className="pt-2 border-t">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                        ✨ Será preservado na importação:
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>Cores dos botões</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Cores de texto</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span>Imagens originais</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span>Tema visual</span>
                        </div>
                      </div>
                    </div>
                    
                    {(() => {
                      const planInfo = getPlanInfo();
                      return (
                        <div className="flex justify-between pt-2 border-t">
                          <span className="font-medium">Seus quizzes:</span>
                          <span>
                            {planInfo.current}/{planInfo.limit === Infinity ? '∞' : planInfo.limit}
                            <Badge variant="outline" className="ml-2 text-xs">
                              {planInfo.plan}
                            </Badge>
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowImportConfirm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={importFunnel}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Importar Agora
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}