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
      // Criar quiz importado na conta do usuário
      const response = await apiRequest("POST", "/api/funnel/import", {
        funnelId: analysisResult.data.id,
        title: `${analysisResult.data.title} (Importado)`,
        url: url.trim()
      });

      if (response.success) {
        toast({
          title: "🎉 Funil importado com sucesso!",
          description: `Quiz "${response.data.title}" foi criado na sua conta.`,
        });
        
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
                Importador de Funis InLead
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Sistema completo de detecção e importação de todos os elementos
              </p>
            </div>
          </div>
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
                  placeholder="https://inlead.digital/seu-funil-exemplo/"
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
                  💡 Teste rápido com exemplo funcional:
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUrl("https://inlead.digital/formulas-virais-cosmeticos-artesanais/")}
                  className="text-blue-600 border-blue-200 hover:bg-blue-100"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Usar Exemplo InLead
                </Button>
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
                    <Button
                      onClick={() => {
                        if (!checkPlanLimits()) {
                          const planInfo = getPlanInfo();
                          toast({
                            title: "Limite de quizzes atingido",
                            description: `Plano ${planInfo.plan}: ${planInfo.current}/${planInfo.limit === Infinity ? '∞' : planInfo.limit} quizzes. Faça upgrade para criar mais quizzes.`,
                            variant: "destructive"
                          });
                          return;
                        }
                        setShowImportConfirm(true);
                      }}
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

          {/* Elementos Suportados */}
          <Card>
            <CardHeader>
              <CardTitle>✅ Elementos InLead Suportados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
                {[
                  "formulário", "campo", "e-mail", "telefone", "botão", "número",
                  "textarea", "data", "altura", "peso", "quiz", "escolha única",
                  "múltipla escolha", "sim/não", "texto", "imagem", "vídeo", "áudio",
                  "timer", "loading", "depoimentos", "antes/depois", "FAQ", "preço",
                  "gráficos", "métricas", "personalização", "argumentação", "argumentos",
                  "carrossel", "atenção", "alerta", "notificação", "nível", "espaço", "script"
                ].map((element) => (
                  <Badge key={element} variant="outline" className="text-xs">
                    {element}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
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