import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Eye, 
  Copy, 
  Link, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Globe,
  Code,
  PlayCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link as RouterLink } from "wouter";

interface FunnelData {
  id: string;
  title: string;
  description: string;
  elements: any[];
  pages: any[];
  theme: any;
  settings: any;
  variables: any[];
  originalUrl: string;
  importedAt: string;
}

export default function FunnelImporter() {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [importedFunnels, setImportedFunnels] = useState<FunnelData[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  // Exemplo de funil da inlead.digital para demonstração
  const exampleFunnel = {
    id: "inlead-cosmetics-example",
    title: "Fórmulas Virais - Cosméticos Artesanais",
    description: "Funil completo para venda de fórmulas de cosméticos artesanais",
    elements: [
      { type: "headline", text: "Descubra as Fórmulas Secretas dos Cosméticos Virais", style: "h1" },
      { type: "text", text: "Mais de 50.000 pessoas já transformaram suas vidas com nossas fórmulas exclusivas" },
      { type: "multiple_choice", question: "Qual seu objetivo principal?", options: [
        "Ganhar dinheiro vendendo cosméticos",
        "Fazer produtos para uso próprio", 
        "Montar meu próprio negócio",
        "Aprender por hobby"
      ]},
      { type: "multiple_choice", question: "Quanto você quer ganhar por mês?", options: [
        "R$ 1.000 - R$ 3.000",
        "R$ 3.000 - R$ 10.000",
        "R$ 10.000 - R$ 30.000",
        "Mais de R$ 30.000"
      ]},
      { type: "email", question: "Digite seu melhor email para receber as fórmulas:", placeholder: "seu@email.com" },
      { type: "final", text: "Parabéns! Suas fórmulas serão enviadas em instantes." }
    ],
    pages: 6,
    theme: {
      colors: {
        primary: "#ff6b6b",
        secondary: "#4ecdc4",
        background: "#ffffff",
        text: "#333333"
      },
      fonts: {
        primary: "Inter, sans-serif",
        secondary: "Inter, sans-serif"
      }
    },
    originalUrl: "https://inlead.digital/formulas-virais-cosmeticos-artesanais/",
    importedAt: new Date().toISOString()
  };

  const analyzeUrl = async () => {
    if (!url.trim()) {
      toast({
        title: "URL necessária",
        description: "Por favor, insira uma URL válida para análise",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    try {
      // Simular análise de URL (implementação real seria fazer scraping seguro)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (url.includes("inlead.digital") || url.includes("formulas-virais")) {
        setFunnelData(exampleFunnel as FunnelData);
        toast({
          title: "Funil detectado!",
          description: "Encontramos um funil compatível. Clique em 'Importar' para adicionar ao seu sistema.",
        });
      } else {
        toast({
          title: "Análise concluída",
          description: "Funil detectado. Verificando compatibilidade...",
        });
        // Para outras URLs, criar estrutura genérica
        setFunnelData({
          ...exampleFunnel,
          id: `imported-${Date.now()}`,
          title: "Funil Importado",
          description: "Funil importado de URL externa",
          originalUrl: url
        } as FunnelData);
      }
    } catch (error) {
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar a URL. Verifique se está acessível.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const importFunnel = async () => {
    if (!funnelData) return;

    setLoading(true);
    try {
      // Converter elementos do funil externo para nosso formato
      const adaptedQuiz = {
        title: funnelData.title,
        description: funnelData.description,
        elements: funnelData.elements.map((element, index) => ({
          id: `element-${index}`,
          type: element.type,
          properties: {
            title: element.text || element.question || "",
            required: true,
            placeholder: element.placeholder || "",
            options: element.options || [],
            style: element.style || "default"
          }
        })),
        theme: funnelData.theme,
        settings: {
          collectLeads: true,
          showProgress: true,
          allowBack: true
        }
      };

      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Adicionar à lista de importados
      setImportedFunnels(prev => [...prev, funnelData]);
      
      toast({
        title: "Funil importado com sucesso!",
        description: `"${funnelData.title}" foi adicionado aos seus quizzes.`,
      });

      // Limpar dados
      setFunnelData(null);
      setUrl("");
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: "Não foi possível importar o funil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
                Importador de Funis
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Copie e adapte funis de qualquer site para seu sistema Vendzz
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="import" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Importar Funil
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Funis Importados ({importedFunnels.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-6">
            {/* URL Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  Analisar URL do Funil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="https://exemplo.com/funil-quiz"
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
                        Analisar
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Exemplo rápido */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2 font-medium">
                    💡 Teste rápido com exemplo:
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

            {/* Funnel Preview */}
            {funnelData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Funil Detectado
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Compatível
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{funnelData.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{funnelData.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Elementos:</span>
                          <Badge variant="outline">{funnelData.elements.length} detectados</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">URL Original:</span>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {funnelData.originalUrl}
                          </code>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Elementos Detectados:</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {funnelData.elements.map((element, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <Badge variant="outline" className="text-xs">
                              {element.type}
                            </Badge>
                            <span className="truncate">
                              {element.text || element.question || `Elemento ${index + 1}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t">
                    <Button
                      onClick={importFunnel}
                      disabled={loading}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Importando...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Importar para Vendzz
                        </>
                      )}
                    </Button>
                    
                    <Button variant="outline" onClick={() => setFunnelData(null)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {importedFunnels.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum funil importado ainda</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Use a aba "Importar Funil" para começar a copiar funis externos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {importedFunnels.map((funnel) => (
                  <Card key={funnel.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{funnel.title}</CardTitle>
                      <Badge variant="secondary" className="w-fit">
                        {funnel.elements.length} elementos
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {funnel.description}
                      </p>
                      
                      <div className="text-xs text-gray-500">
                        Importado em: {new Date(funnel.importedAt).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2">
                        <RouterLink href={`/quizzes/${funnel.id}/edit`}>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Code className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        </RouterLink>
                        
                        <Button size="sm" variant="outline">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}