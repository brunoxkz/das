import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageEditorHorizontal } from "@/components/page-editor-horizontal";
import { QuizPreview } from "@/components/quiz-preview";
import { QuizFlowEditor } from "@/components/quiz-flow-editor";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth-jwt";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Save, 
  Play, 
  ArrowLeft, 
  Settings, 
  Eye,
  Share,
  Code,
  Globe,
  Palette,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  UserMinus,
  GitBranch,
  Network
} from "lucide-react";
import { Link } from "wouter";

export default function QuizBuilder() {
  const [match, params] = useRoute("/quizzes/:id/edit");
  const isEditing = !!params?.id;
  const quizId = params?.id;
  
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    structure: {
      pages: [{
        id: Date.now(),
        title: "Página 1",
        elements: []
      }],
      settings: {
        theme: "vendzz",
        showProgressBar: true,
        collectEmail: true,
        collectName: true,
        collectPhone: false,
        resultTitle: "",
        resultDescription: ""
      },
      // Sistema de Fluxo (Avançado)
      flowSystem: {
        enabled: false,
        nodes: [],
        connections: [],
        defaultFlow: true // Se true, usa navegação linear tradicional
      }
    },
    design: {
      brandingLogo: "",
      logoUpload: "",
      logoUrl: "",
      logoPosition: "top",
      progressBarColor: "#10b981",
      progressBarStyle: "default",
      progressBarHeight: "8",
      showProgressBar: true,
      buttonColor: "#10b981",
      backgroundColor: "#ffffff",
      primaryColor: "#10b981",
      favicon: "",
      faviconUrl: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: ""
    },
    isPublished: false,
    facebookPixel: "",
    googlePixel: "",
    ga4Id: "",
    customHeadScript: "",
    enableWhatsappAutomation: false
  });

  const [activeTab, setActiveTab] = useState<"editor" | "preview" | "settings" | "design" | "fluxo">("editor");
  const [globalTheme, setGlobalTheme] = useState<"light" | "dark" | "custom">("light");
  const [customBackgroundColor, setCustomBackgroundColor] = useState("#ffffff");
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(quizId || null);

  // Fetch quiz data if editing
  console.log("QUIZ BUILDER - Estados:", { isEditing, quizId, shouldFetch: !!isEditing && !!quizId });
  
  const { data: existingQuiz, isLoading: quizLoading, error: quizError } = useQuery({
    queryKey: [`/api/quizzes/${quizId}`],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      console.log("QUIZ BUILDER - Fazendo requisição para:", `/api/quizzes/${quizId}`, "com token:", !!token);
      
      const response = await fetch(`/api/quizzes/${quizId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      console.log("QUIZ BUILDER - Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("QUIZ BUILDER - Dados recebidos:", data);
      return data;
    },
    enabled: !!isEditing && !!quizId,
    retry: false,
  });
  
  console.log("QUIZ BUILDER - Query result:", { existingQuiz, quizLoading, quizError });



  // Save quiz mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      // Usar currentQuizId se disponível, caso contrário verificar se é edição com quizId da URL
      const hasQuizId = currentQuizId || (isEditing && quizId);
      const url = hasQuizId ? `/api/quizzes/${currentQuizId || quizId}` : "/api/quizzes";
      const method = hasQuizId ? "PUT" : "POST";
      
      console.log("SAVE MUTATION - Debug:", {
        isEditing,
        quizId,
        currentQuizId,
        hasQuizId,
        url,
        method
      });
      
      return await apiRequest(url, {
        method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: (result) => {
      // Se é um novo quiz (não editing), capturar o ID retornado
      if (!currentQuizId && result?.id) {
        setCurrentQuizId(result.id);
        console.log("SAVE MUTATION - Novo quiz criado com ID:", result.id);
      }
      
      toast({
        title: "Quiz salvo com sucesso!",
        description: "Aguarde 5 minutos para que todos os salvamentos façam efeito. (Lembre-se de publicar)",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Acesso negado",
          description: "Você precisa estar logado para salvar o quiz.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro ao salvar quiz",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  // Load existing quiz data
  useEffect(() => {
    if (existingQuiz) {
      console.log("Carregando quiz existente:", JSON.stringify(existingQuiz, null, 2));
      
      // Definir o currentQuizId quando carregamos um quiz existente
      setCurrentQuizId(existingQuiz.id);
      
      setQuizData({
        title: (existingQuiz as any).title,
        description: (existingQuiz as any).description || "",
        structure: (existingQuiz as any).structure ? {
          ...(existingQuiz as any).structure,
          // Garantir que o sistema de fluxo seja carregado ou inicializado
          flowSystem: (existingQuiz as any).structure?.flowSystem || {
            enabled: false,
            nodes: [],
            connections: [],
            defaultFlow: true
          }
        } : {
          pages: [{
            id: Date.now(),
            title: "Página 1",
            elements: []
          }],
          settings: {
            theme: "vendzz",
            showProgressBar: true,
            collectEmail: true,
            collectName: true,
            collectPhone: false,
            resultTitle: "",
            resultDescription: ""
          },
          flowSystem: {
            enabled: false,
            nodes: [],
            connections: [],
            defaultFlow: true
          }
        },
        design: {
          brandingLogo: (existingQuiz as any).brandingLogo || "",
          progressBarColor: (existingQuiz as any).progressBarColor || "#10b981",
          buttonColor: (existingQuiz as any).buttonColor || "#10b981",
          favicon: (existingQuiz as any).favicon || "",
          seoTitle: (existingQuiz as any).seoTitle || "",
          seoDescription: (existingQuiz as any).seoDescription || "",
          seoKeywords: (existingQuiz as any).seoKeywords || ""
        },
        isPublished: existingQuiz.isPublished || false,
        facebookPixel: (existingQuiz as any).facebookPixel || "",
        googlePixel: (existingQuiz as any).googlePixel || "",
        ga4Id: (existingQuiz as any).ga4Id || "",
        customHeadScript: (existingQuiz as any).customHeadScript || ""
      });
      console.log("QUIZ BUILDER DEBUG - Dados carregados:", {
        title: existingQuiz.title,
        structure: existingQuiz.structure,
        fullQuiz: existingQuiz,
        quizId: existingQuiz.id
      });
    } else {
      // Initialize with default page structure for new quiz
      setQuizData(prev => ({
        ...prev,
        structure: {
          pages: [{
            id: Date.now(),
            title: "Página 1",
            elements: []
          }],
          settings: {
            theme: "vendzz",
            showProgressBar: true,
            collectEmail: true,
            collectName: true,
            collectPhone: false,
            resultTitle: "",
            resultDescription: ""
          }
        }
      }));
    }
  }, [existingQuiz]);

  // Auth check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para acessar o editor.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const handleSave = (isPublishing = false) => {
    if (!quizData.title?.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, adicione um título ao seu quiz.",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for backend - match schema structure
    const dataToSave = {
      title: quizData.title,
      description: quizData.description || "",
      structure: quizData.structure,
      isPublished: isPublishing || quizData.isPublished || false,
      brandingLogo: quizData.design?.brandingLogo || "",
      progressBarColor: quizData.design?.progressBarColor || "#10b981",
      buttonColor: quizData.design?.buttonColor || "#10b981",
      favicon: quizData.design?.favicon || "",
      seoTitle: quizData.design?.seoTitle || "",
      seoDescription: quizData.design?.seoDescription || "",
      seoKeywords: quizData.design?.seoKeywords || "",
      facebookPixel: quizData.facebookPixel || "",
      googlePixel: quizData.googlePixel || "",
      ga4Id: quizData.ga4Id || "",
      customHeadScript: quizData.customHeadScript || ""
    };

    const action = isPublishing ? "Publicando" : "Salvando";
    console.log(`${action} quiz com dados:`, JSON.stringify(dataToSave, null, 2));
    saveMutation.mutate(dataToSave);
  };

  const handlePublish = () => {
    // Atualiza o estado local primeiro
    setQuizData(prev => ({ ...prev, isPublished: true }));
    // Salva com flag de publicação
    handleSave(true);
  };

  const handlePageChange = (pages: any[]) => {
    setQuizData(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        pages
      }
    }));
  };

  const handleSettingsChange = (settings: any) => {
    setQuizData(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        settings
      }
    }));
  };

  const handleFlowChange = (flowSystem: any) => {
    setQuizData(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        flowSystem
      }
    }));
  };

  // Extrair variáveis dos elementos do quiz
  const getAvailableVariables = () => {
    const variables = ['nome', 'email', 'telefone', 'quiz_titulo']; // Variáveis padrão
    
    if (quizData.structure?.pages) {
      quizData.structure.pages.forEach((page: any) => {
        if (page.elements) {
          page.elements.forEach((element: any) => {
            if (element.fieldId) {
              variables.push(element.fieldId);
            }
            if (element.properties?.fieldId) {
              variables.push(element.properties.fieldId);
            }
          });
        }
      });
    }
    
    return [...new Set(variables)]; // Remove duplicatas
  };

  // Função removida - agora gerenciada pelo PageEditor

  if (authLoading || (isEditing && quizLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {isEditing ? "Editar Quiz" : "Criar Novo Quiz"}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Status:</span>
                <Badge variant={quizData.isPublished ? "default" : "secondary"}>
                  {quizData.isPublished ? "Publicado" : "Rascunho"}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("preview")}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave()}
              disabled={saveMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={saveMutation.isPending || !quizData.title?.trim()}
            >
              <Globe className="w-4 h-4 mr-2" />
              Publicar
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          {[
            { id: "editor", label: "Editor", icon: <Settings className="w-4 h-4" /> },
            { id: "preview", label: "Preview", icon: <Play className="w-4 h-4" /> },
            { id: "fluxo", label: "Fluxo (Avançado)", icon: <Network className="w-4 h-4" /> },
            { id: "design", label: "Design", icon: <Palette className="w-4 h-4" /> },
            { id: "settings", label: "Configurações", icon: <Settings className="w-4 h-4" /> },

          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "editor" && (
          <div className="h-full">
            <PageEditorHorizontal
              pages={quizData.structure.pages || []}
              onPagesChange={handlePageChange}
              globalTheme={globalTheme}
              customBackgroundColor={customBackgroundColor}
              onThemeChange={(theme, customColor) => {
                setGlobalTheme(theme);
                setCustomBackgroundColor(customColor || "#ffffff");
              }}
            />
          </div>
        )}

        {activeTab === "preview" && (
          <div className="h-full overflow-y-auto bg-gray-50">
            <QuizPreview quiz={quizData} />
          </div>
        )}

        {activeTab === "fluxo" && (
          <div className="h-full">
            <QuizFlowEditor
              pages={quizData.structure.pages || []}
              flowSystem={quizData.structure?.flowSystem || {
                enabled: false,
                nodes: [],
                connections: [],
                defaultFlow: true
              }}
              onFlowChange={handleFlowChange}
              availableVariables={getAvailableVariables()}
            />
          </div>
        )}

        {activeTab === "design" && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Logo do Funil */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Logo do Funil
                  </CardTitle>
                  <p className="text-sm text-gray-600">Logo que aparece no topo de todas as páginas</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="logoUpload">Upload de Logo</Label>
                    <Input
                      id="logoUpload"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Criar URL temporária para preview
                          const logoUrl = URL.createObjectURL(file);
                          setQuizData(prev => ({ 
                            ...prev, 
                            design: { ...prev.design, logoUrl, logoUpload: file.name }
                          }));
                        }
                      }}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Formatos aceitos: PNG, JPG, SVG. Tamanho máximo: 2MB</p>
                  </div>

                  <div>
                    <Label htmlFor="logoUrl">URL da Logo (alternativa)</Label>
                    <Input
                      id="logoUrl"
                      value={quizData.design?.logoUrl || ""}
                      onChange={(e) => setQuizData(prev => ({ 
                        ...prev, 
                        design: { ...prev.design, logoUrl: e.target.value }
                      }))}
                      placeholder="https://exemplo.com/logo.png"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Logo será redimensionada automaticamente para altura de 40px</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="logoPosition">Posição da Logo</Label>
                    <select
                      id="logoPosition"
                      value={quizData.design?.logoPosition || "center"}
                      onChange={(e) => setQuizData(prev => ({ 
                        ...prev, 
                        design: { ...prev.design, logoPosition: e.target.value }
                      }))}
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="left">Esquerda</option>
                      <option value="center">Centro</option>
                      <option value="right">Direita</option>
                    </select>
                  </div>

                  {/* Preview da Logo */}
                  {quizData.design?.logoUrl && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <Label className="text-sm font-medium mb-2 block">Preview da Logo</Label>
                      <div className={`flex ${
                        quizData.design.logoPosition === 'left' ? 'justify-start' : 
                        quizData.design.logoPosition === 'right' ? 'justify-end' : 'justify-center'
                      }`}>
                        <img
                          src={quizData.design.logoUrl}
                          alt="Logo Preview"
                          className="h-10 max-w-[200px] object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Favicon */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Favicon
                  </CardTitle>
                  <p className="text-sm text-gray-600">Ícone que aparece na aba do navegador</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="faviconUpload">Upload de Favicon</Label>
                    <Input
                      id="faviconUpload"
                      type="file"
                      accept="image/*,.ico"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const faviconUrl = URL.createObjectURL(file);
                          setQuizData(prev => ({ 
                            ...prev, 
                            design: { ...prev.design, faviconUrl, favicon: file.name }
                          }));
                        }
                      }}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Formatos aceitos: ICO, PNG, JPG (16x16 ou 32x32 pixels)</p>
                  </div>

                  <div>
                    <Label htmlFor="faviconUrl">URL do Favicon (alternativa)</Label>
                    <Input
                      id="faviconUrl"
                      value={quizData.design?.faviconUrl || ""}
                      onChange={(e) => setQuizData(prev => ({ 
                        ...prev, 
                        design: { ...prev.design, faviconUrl: e.target.value }
                      }))}
                      placeholder="https://exemplo.com/favicon.ico"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">URL alternativa se não fizer upload</p>
                  </div>

                  {/* Preview do Favicon */}
                  {quizData.design?.faviconUrl && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <Label className="text-sm font-medium mb-2 block">Preview do Favicon</Label>
                      <div className="flex items-center gap-3">
                        <img
                          src={quizData.design.faviconUrl}
                          alt="Favicon Preview"
                          className="w-4 h-4 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span className="text-sm text-gray-600">16x16 pixels</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cores e Fundo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Cores e Fundo
                  </CardTitle>
                  <p className="text-sm text-gray-600">Personalize as cores do seu funil</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="backgroundColor">Cor de Fundo</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="color"
                        id="backgroundColor"
                        value={quizData.design?.backgroundColor || "#f9fafb"}
                        onChange={(e) => setQuizData(prev => ({ 
                          ...prev, 
                          design: { ...prev.design, backgroundColor: e.target.value }
                        }))}
                        className="w-12 h-12 border border-gray-300 rounded-md cursor-pointer"
                      />
                      <Input
                        value={quizData.design?.backgroundColor || "#f9fafb"}
                        onChange={(e) => setQuizData(prev => ({ 
                          ...prev, 
                          design: { ...prev.design, backgroundColor: e.target.value }
                        }))}
                        placeholder="#f9fafb"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="primaryColor">Cor Primária (Botões)</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="color"
                        id="primaryColor"
                        value={quizData.design?.primaryColor || "#10b981"}
                        onChange={(e) => setQuizData(prev => ({ 
                          ...prev, 
                          design: { ...prev.design, primaryColor: e.target.value }
                        }))}
                        className="w-12 h-12 border border-gray-300 rounded-md cursor-pointer"
                      />
                      <Input
                        value={quizData.design?.primaryColor || "#10b981"}
                        onChange={(e) => setQuizData(prev => ({ 
                          ...prev, 
                          design: { ...prev.design, primaryColor: e.target.value }
                        }))}
                        placeholder="#10b981"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="progressBarColor">Cor da Barra de Progresso</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="color"
                        id="progressBarColor"
                        value={quizData.design?.progressBarColor || "#10b981"}
                        onChange={(e) => setQuizData(prev => ({ 
                          ...prev, 
                          design: { ...prev.design, progressBarColor: e.target.value }
                        }))}
                        className="w-12 h-12 border border-gray-300 rounded-md cursor-pointer"
                      />
                      <Input
                        value={quizData.design?.progressBarColor || "#10b981"}
                        onChange={(e) => setQuizData(prev => ({ 
                          ...prev, 
                          design: { ...prev.design, progressBarColor: e.target.value }
                        }))}
                        placeholder="#10b981"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estilo da Barra de Progresso */}
              <Card>
                <CardHeader>
                  <CardTitle>Estilo da Barra de Progresso</CardTitle>
                  <p className="text-sm text-gray-600">Personalize a aparência da barra de progresso</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showProgressBar"
                      checked={quizData.design?.showProgressBar || false}
                      onChange={(e) => setQuizData(prev => ({ 
                        ...prev, 
                        design: { ...prev.design, showProgressBar: e.target.checked }
                      }))}
                    />
                    <Label htmlFor="showProgressBar">Mostrar barra de progresso</Label>
                  </div>

                  <div>
                    <Label htmlFor="progressBarStyle">Estilo</Label>
                    <select
                      id="progressBarStyle"
                      value={quizData.design?.progressBarStyle || "rounded"}
                      onChange={(e) => setQuizData(prev => ({ 
                        ...prev, 
                        design: { ...prev.design, progressBarStyle: e.target.value }
                      }))}
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="rounded">Arredondada</option>
                      <option value="square">Quadrada</option>
                      <option value="thin">Fina</option>
                      <option value="thick">Grossa</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="progressBarHeight">Altura (px)</Label>
                    <Input
                      type="number"
                      id="progressBarHeight"
                      value={quizData.design?.progressBarHeight || 8}
                      onChange={(e) => setQuizData(prev => ({ 
                        ...prev, 
                        design: { ...prev.design, progressBarHeight: parseInt(e.target.value) }
                      }))}
                      min="4"
                      max="20"
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Quiz Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Quiz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título do Quiz</Label>
                    <Input
                      id="title"
                      value={quizData.title || ""}
                      onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Digite o título do quiz"
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={quizData.description || ""}
                      onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva o objetivo do quiz"
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Quiz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tema</Label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={quizData.structure.settings.theme}
                      onChange={(e) => handleSettingsChange({
                        ...quizData.structure.settings,
                        theme: e.target.value
                      })}
                    >
                      <option value="customizado">Customizado</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>


                </CardContent>
              </Card>

              {/* Pixels de Rastreamento */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Pixels de Rastreamento
                  </CardTitle>
                  <p className="text-sm text-gray-600">Configure pixels para rastrear conversões e análises</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="facebookPixel">Facebook Pixel ID</Label>
                    <Input
                      id="facebookPixel"
                      value={quizData.facebookPixel || ""}
                      onChange={(e) => setQuizData(prev => ({ ...prev, facebookPixel: e.target.value }))}
                      placeholder="Ex: 123456789012345"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">ID do pixel do Facebook para rastreamento de conversões</p>
                  </div>

                  <div>
                    <Label htmlFor="googlePixel">Google Ads Pixel ID</Label>
                    <Input
                      id="googlePixel"
                      value={quizData.googlePixel || ""}
                      onChange={(e) => setQuizData(prev => ({ ...prev, googlePixel: e.target.value }))}
                      placeholder="Ex: AW-123456789"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">ID do pixel do Google Ads para rastreamento</p>
                  </div>

                  <div>
                    <Label htmlFor="ga4Id">Google Analytics 4 (GA4) ID</Label>
                    <Input
                      id="ga4Id"
                      value={quizData.ga4Id || ""}
                      onChange={(e) => setQuizData(prev => ({ ...prev, ga4Id: e.target.value }))}
                      placeholder="Ex: G-XXXXXXXXXX"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">ID de medição do Google Analytics 4</p>
                  </div>

                  <div>
                    <Label htmlFor="customHeadScript">Script Personalizado (Head)</Label>
                    <Textarea
                      id="customHeadScript"
                      value={quizData.customHeadScript || ""}
                      onChange={(e) => setQuizData(prev => ({ ...prev, customHeadScript: e.target.value }))}
                      placeholder="<script>/* Seu código personalizado aqui */</script>"
                      className="mt-2"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">Scripts personalizados para adicionar no &lt;head&gt; da página</p>
                  </div>
                </CardContent>
              </Card>

              {/* Automação WhatsApp */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.386"/>
                    </svg>
                    Automação WhatsApp
                  </CardTitle>
                  <p className="text-sm text-gray-600">Configure se este quiz deve gerar arquivos de automação para WhatsApp</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="enableWhatsappAutomation"
                      checked={quizData.enableWhatsappAutomation || false}
                      onChange={(e) => setQuizData(prev => ({ ...prev, enableWhatsappAutomation: e.target.checked }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <Label htmlFor="enableWhatsappAutomation" className="text-sm font-medium">
                      Ativar Automação WhatsApp
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Quando habilitado, este quiz criará automaticamente arquivos de automação para uso com a extensão Chrome do WhatsApp sempre que novas respostas forem enviadas.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compartilhamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Link público</Label>
                    <div className="flex mt-2">
                      <Input
                        value={quizData.isPublished && currentQuizId ? `${window.location.origin}/quiz/${currentQuizId}` : "Quiz não publicado"}
                        readOnly
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm" className="ml-2">
                        <Share className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Código de incorporação</Label>
                    <div className="flex mt-2">
                      <Textarea
                        value={quizData.isPublished ? `<iframe src="${window.location.origin}/quiz/${quizId}" width="100%" height="600"></iframe>` : "Quiz não publicado"}
                        readOnly
                        className="flex-1"
                        rows={3}
                      />
                      <Button variant="outline" size="sm" className="ml-2">
                        <Code className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}


