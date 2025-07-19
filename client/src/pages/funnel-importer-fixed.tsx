import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, Globe, Link, Eye, CheckCircle, PlayCircle, 
  Upload, Code, Copy
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function FunnelImporter() {
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { toast } = useToast();

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

                <div className="flex gap-4 pt-4 border-t">
                  <a
                    href={`/quiz-builder?edit=${analysisResult.data.quizId || analysisResult.data.id}`}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-colors text-center"
                  >
                    🎨 Editar no Quiz Builder
                  </a>
                  <a
                    href={`/quiz-public/${analysisResult.data.quizId || analysisResult.data.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-center"
                  >
                    👁️ Visualizar Quiz
                  </a>
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
      </div>
    </div>
  );
}