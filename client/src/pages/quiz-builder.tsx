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
  Network,
  Plus,
  Minus,
  Target,
  Activity,
  Search
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
    taboolaPixel: "",
    pinterestPixel: "",
    linkedinPixel: "",
    outbrainPixel: "",
    mgidPixel: "",
    customHeadScript: "",
    pixelDelay: false,
    trackingPixels: [],
    enableWhatsappAutomation: false
  });

  const [activeTab, setActiveTab] = useState<"editor" | "preview" | "settings" | "design" | "fluxo" | "pixels">("editor");
  const [globalTheme, setGlobalTheme] = useState<"light" | "dark" | "custom">("light");
  const [customBackgroundColor, setCustomBackgroundColor] = useState("#ffffff");
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(quizId || null);
  
  // Estado para pixels dinâmicos
  const [trackingPixels, setTrackingPixels] = useState([
    { id: 'facebook', name: 'Facebook Pixel', type: 'facebook', mode: 'normal', value: '', placeholder: '123456789012345', description: 'ID do pixel do Facebook para rastreamento de conversões' },
    { id: 'google', name: 'Google Ads', type: 'google', mode: 'normal', value: '', placeholder: 'AW-123456789', description: 'ID do pixel do Google Ads para rastreamento' },
    { id: 'ga4', name: 'Google Analytics 4', type: 'ga4', mode: 'normal', value: '', placeholder: 'G-XXXXXXXXXX', description: 'ID de medição do Google Analytics 4' }
  ]);
  
  // Estado para delay dos pixels
  const [pixelDelay, setPixelDelay] = useState(false);
  
  // Pixels disponíveis para adicionar
  const availablePixelTypes = [
    { type: 'facebook', name: 'Facebook', placeholder: '123456789012345', description: 'ID do pixel do Facebook para rastreamento de conversões', hasApi: true },
    { type: 'google', name: 'Google Ads', placeholder: 'AW-123456789', description: 'ID do pixel do Google Ads para rastreamento', hasApi: true },
    { type: 'ga4', name: 'Google Analytics 4', placeholder: 'G-XXXXXXXXXX', description: 'ID de medição do Google Analytics 4', hasApi: false },
    { type: 'taboola', name: 'Taboola', placeholder: '1234567', description: 'ID do pixel do Taboola para rastreamento', hasApi: false },
    { type: 'pinterest', name: 'Pinterest', placeholder: '2612345678901', description: 'ID do pixel do Pinterest para rastreamento', hasApi: false },
    { type: 'linkedin', name: 'LinkedIn', placeholder: '123456', description: 'ID do pixel do LinkedIn para rastreamento', hasApi: false },
    { type: 'outbrain', name: 'Outbrain', placeholder: '00abcdef12345678', description: 'ID do pixel do Outbrain para rastreamento', hasApi: false },
    { type: 'mgid', name: 'MGID', placeholder: '123456', description: 'ID do pixel do MGID para rastreamento', hasApi: false },
    { type: 'tiktok', name: 'TikTok', placeholder: 'C4A7..._..._...', description: 'ID do pixel do TikTok para rastreamento', hasApi: false },
    { type: 'snapchat', name: 'Snapchat', placeholder: '12345678-1234-1234-1234-123456789012', description: 'ID do pixel do Snapchat para rastreamento', hasApi: false }
  ];

  // Função para obter o ícone do pixel
  const getPixelIcon = (type: string) => {
    const iconMap = {
      facebook: <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">f</div>,
      google: <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">G</div>,
      ga4: <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">GA</div>,
      taboola: <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">T</div>,
      pinterest: <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">P</div>,
      linkedin: <div className="w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold">in</div>,
      outbrain: <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">O</div>,
      mgid: <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">M</div>,
      tiktok: <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">TT</div>,
      snapchat: <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-white text-xs font-bold">S</div>
    };
    return iconMap[type] || <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold">?</div>;
  };

  // Função para adicionar pixel
  const addPixel = (type: string) => {
    const pixelType = availablePixelTypes.find(p => p.type === type);
    if (pixelType) {
      const newPixel = {
        id: Date.now().toString(),
        name: pixelType.name,
        type: pixelType.type,
        mode: 'normal',
        value: '',
        placeholder: pixelType.placeholder,
        description: pixelType.description
      };
      setTrackingPixels(prev => [...prev, newPixel]);
    }
  };

  // Função para remover pixel
  const removePixel = (id: string) => {
    setTrackingPixels(prev => prev.filter(pixel => pixel.id !== id));
  };

  // Função para atualizar pixel
  const updatePixel = (id: string, field: string, value: string) => {
    setTrackingPixels(prev => 
      prev.map(pixel => 
        pixel.id === id ? { ...pixel, [field]: value } : pixel
      )
    );
  };

  // Estados de controle já definidos anteriormente não são redefinidos aqui

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



  // SISTEMA DE SALVAMENTO SIMPLES E EFICAZ
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const targetQuizId = currentQuizId || quizId;
      const url = targetQuizId ? `/api/quizzes/${targetQuizId}` : "/api/quizzes";
      const method = targetQuizId ? "PUT" : "POST";
      
      console.log("SALVANDO QUIZ:", {
        quizId: targetQuizId,
        url,
        method,
        pagesCount: data.structure?.pages?.length || 0,
        elementsCount: data.structure?.pages?.reduce((sum, p) => sum + (p.elements?.length || 0), 0) || 0
      });
      
      return await apiRequest(url, {
        method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: (result) => {
      // Atualizar ID se é novo quiz
      if (!currentQuizId && result?.id) {
        setCurrentQuizId(result.id);
      }
      
      // Limpar cache específico do quiz
      const quizIdToInvalidate = currentQuizId || quizId || result?.id;
      if (quizIdToInvalidate) {
        queryClient.removeQueries({ queryKey: [`/api/quizzes/${quizIdToInvalidate}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/quizzes/${quizIdToInvalidate}`] });
      }
      
      // Limpar cache geral
      queryClient.removeQueries({ queryKey: ["/api/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      
      toast({
        title: "Quiz salvo com sucesso!",
        description: "Dados salvos e cache atualizado.",
      });
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
        customHeadScript: (existingQuiz as any).customHeadScript || "",
        pixelDelay: (existingQuiz as any).pixelDelay || false,
        trackingPixels: (existingQuiz as any).trackingPixels || []
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

  // Sincronizar pixels dinâmicos quando quizData muda
  useEffect(() => {
    if (quizData.trackingPixels && Array.isArray(quizData.trackingPixels)) {
      setTrackingPixels(quizData.trackingPixels);
    }
    if (quizData.pixelDelay !== undefined) {
      setPixelDelay(quizData.pixelDelay);
    }
  }, [quizData.trackingPixels, quizData.pixelDelay]);

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

    // PROTEÇÃO CRÍTICA: Validar e sanitizar dados antes de salvar
    const validatedStructure = {
      ...quizData.structure,
      pages: quizData.structure.pages?.map(page => ({
        ...page,
        elements: page.elements || [] // Garantir que elementos sempre existam
      })) || [],
      settings: quizData.structure.settings || {
        theme: "vendzz",
        showProgressBar: true,
        collectEmail: true,
        collectName: true,
        collectPhone: false,
        resultTitle: "",
        resultDescription: ""
      },
      flowSystem: quizData.structure.flowSystem || {
        enabled: false,
        nodes: [],
        connections: [],
        defaultFlow: true
      }
    };

    // Prepare data for backend - match schema structure
    const dataToSave = {
      title: quizData.title,
      description: quizData.description || "",
      structure: validatedStructure,
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
      customHeadScript: quizData.customHeadScript || "",
      pixelDelay: pixelDelay,
      trackingPixels: trackingPixels
    };

    const action = isPublishing ? "Publicando" : "Salvando";
    console.log(`${action} quiz com dados validados:`, {
      title: dataToSave.title,
      pagesCount: dataToSave.structure.pages.length,
      totalElements: dataToSave.structure.pages.reduce((sum, p) => sum + (p.elements?.length || 0), 0),
      flowEnabled: dataToSave.structure.flowSystem.enabled,
      quizId: currentQuizId || quizId
    });
    
    // Log detalhado para debug incluindo elementos específicos
    console.log('ESTRUTURA COMPLETA:', JSON.stringify(dataToSave.structure, null, 2));
    
    // Forçar limpeza de cache antes de salvar
    const cleanCacheQuizId = currentQuizId || quizId;
    if (cleanCacheQuizId) {
      console.log("LIMPANDO CACHE ANTES DE SALVAR:", cleanCacheQuizId);
      queryClient.removeQueries({ queryKey: [`/api/quizzes/${cleanCacheQuizId}`] });
    }
    
    saveMutation.mutate(dataToSave);
  };

  const handlePublish = () => {
    // Atualiza o estado local primeiro
    setQuizData(prev => ({ ...prev, isPublished: true }));
    // Salva com flag de publicação
    handleSave(true);
  };

  const handlePageChange = (pages: any[]) => {
    console.log('QUIZ BUILDER - handlePageChange chamado com:', {
      pagesCount: pages.length,
      pages: pages.map(p => ({ 
        id: p.id, 
        title: p.title, 
        elementsCount: p.elements?.length || 0 
      }))
    });
    
    setQuizData(prev => {
      const newData = {
        ...prev,
        structure: {
          ...prev.structure,
          pages
        }
      };
      
      console.log('QUIZ BUILDER - Estado atualizado:', {
        pagesCount: newData.structure.pages.length,
        totalElements: newData.structure.pages.reduce((sum, p) => sum + (p.elements?.length || 0), 0)
      });
      
      return newData;
    });
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
    console.log('QUIZ BUILDER - handleFlowChange chamado:', {
      enabled: flowSystem.enabled,
      nodesCount: flowSystem.nodes?.length || 0,
      connectionsCount: flowSystem.connections?.length || 0
    });
    
    setQuizData(prev => {
      // PROTEÇÃO CRÍTICA: Preservar dados das páginas durante mudanças de fluxo
      const newData = {
        ...prev,
        structure: {
          ...prev.structure,
          flowSystem,
          // Garantir que as páginas não sejam afetadas por mudanças no fluxo
          pages: prev.structure.pages || []
        }
      };
      
      console.log('QUIZ BUILDER - Flow atualizado, páginas preservadas:', {
        pagesCount: newData.structure.pages.length,
        totalElements: newData.structure.pages.reduce((sum, p) => sum + (p.elements?.length || 0), 0)
      });
      
      return newData;
    });
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
            { id: "pixels", label: "Pixels/Scripts", icon: <Target className="w-4 h-4" /> },

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
                          // Validação de segurança
                          if (file.size > 1024 * 1024) { // 1MB
                            alert("Arquivo muito grande. Máximo 1MB permitido.");
                            return;
                          }
                          const faviconUrl = URL.createObjectURL(file);
                          setQuizData(prev => ({ 
                            ...prev, 
                            design: { ...prev.design, faviconUrl, favicon: file.name }
                          }));
                        }
                      }}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Formatos aceitos: ICO, PNG, JPG (16x16 ou 32x32 pixels, máx. 1MB)</p>
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

                  {/* Aviso de Segurança para Favicon */}
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>🔒 SEGURANÇA:</strong> Faça upload apenas de arquivos de fontes confiáveis. 
                      Evite usar URLs de sites desconhecidos.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Cores e Fundo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Cores e Fundo
                  </CardTitle>
                  <p className="text-sm text-gray-600">Defina a cor padrão dos botões de continuar</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cor do Botão Continuar */}
                  <div>
                    <Label htmlFor="buttonColor">Cor dos Botões Continuar</Label>
                    <div className="flex items-center space-x-3 mt-2">
                      <input
                        type="color"
                        id="buttonColor"
                        value={quizData.design?.buttonColor || "#10b981"}
                        onChange={(e) => {
                          setQuizData(prev => ({ 
                            ...prev, 
                            design: { 
                              ...prev.design, 
                              buttonColor: e.target.value
                            }
                          }));
                        }}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
                      />
                      <div className="flex-1">
                        <Input
                          type="text"
                          value={quizData.design?.buttonColor || "#10b981"}
                          onChange={(e) => {
                            setQuizData(prev => ({ 
                              ...prev, 
                              design: { 
                                ...prev.design, 
                                buttonColor: e.target.value
                              }
                            }));
                          }}
                          placeholder="#10b981"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Esta cor será aplicada em todos os botões "Continuar" do quiz</p>
                  </div>

                  {/* Estilo dos Botões */}
                  <div>
                    <Label htmlFor="buttonStyle">Estilo dos Botões</Label>
                    <select 
                      id="buttonStyle"
                      className="w-full px-3 py-2 border rounded-md text-sm mt-2"
                      value={quizData.design?.buttonStyle || "rounded"}
                      onChange={(e) => {
                        setQuizData(prev => ({ 
                          ...prev, 
                          design: { 
                            ...prev.design, 
                            buttonStyle: e.target.value
                          }
                        }));
                      }}
                    >
                      <option value="rounded">Arredondado</option>
                      <option value="square">Quadrado</option>
                      <option value="pill">Pill (muito arredondado)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Formato visual dos botões de continuar</p>
                  </div>

                  {/* Tamanho dos Botões */}
                  <div>
                    <Label htmlFor="buttonSize">Tamanho dos Botões</Label>
                    <select 
                      id="buttonSize"
                      className="w-full px-3 py-2 border rounded-md text-sm mt-2"
                      value={quizData.design?.buttonSize || "medium"}
                      onChange={(e) => {
                        setQuizData(prev => ({ 
                          ...prev, 
                          design: { 
                            ...prev.design, 
                            buttonSize: e.target.value
                          }
                        }));
                      }}
                    >
                      <option value="small">Pequeno</option>
                      <option value="medium">Médio</option>
                      <option value="large">Grande</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Tamanho dos botões de continuar</p>
                  </div>
                </CardContent>
              </Card>

              {/* Configurações da Barra de Progresso */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurações da Barra de Progresso</CardTitle>
                  <p className="text-sm text-gray-600">Personalize como a barra de progresso será exibida</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Ativar/Desativar Barra de Progresso */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showProgressBar"
                      checked={quizData.design?.showProgressBar !== false} // Padrão: ativado
                      onChange={(e) => setQuizData(prev => ({ 
                        ...prev, 
                        design: { ...prev.design, showProgressBar: e.target.checked }
                      }))}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                    />
                    <Label htmlFor="showProgressBar" className="font-medium">Mostrar barra de progresso</Label>
                  </div>

                  {/* Configurações só aparecem se a barra estiver ativa */}
                  {quizData.design?.showProgressBar !== false && (
                    <>
                      {/* Tipo de Contador */}
                      <div>
                        <Label htmlFor="progressBarType">Tipo de Contador</Label>
                        <select
                          id="progressBarType"
                          value={quizData.design?.progressBarType || "percentage"}
                          onChange={(e) => setQuizData(prev => ({ 
                            ...prev, 
                            design: { ...prev.design, progressBarType: e.target.value }
                          }))}
                          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="percentage">Porcentagem (ex: 75%)</option>
                          <option value="steps">Etapas (ex: 3/10)</option>
                          <option value="none">Sem contador (apenas barra)</option>
                        </select>
                      </div>

                      {/* Posição do Contador */}
                      {quizData.design?.progressBarType !== "none" && (
                        <div>
                          <Label htmlFor="progressBarPosition">Posição do Contador</Label>
                          <select
                            id="progressBarPosition"
                            value={quizData.design?.progressBarPosition || "center"}
                            onChange={(e) => setQuizData(prev => ({ 
                              ...prev, 
                              design: { ...prev.design, progressBarPosition: e.target.value }
                            }))}
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="left">Esquerda</option>
                            <option value="center">Centralizado</option>
                            <option value="right">Direita</option>
                            <option value="above">Acima da barra</option>
                            <option value="below">Abaixo da barra</option>
                          </select>
                        </div>
                      )}

                      {/* Cor da Barra de Progresso */}
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
                            className="w-8 h-8 border border-gray-300 rounded-full cursor-pointer"
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

                      {/* Preview do Contador */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Label className="text-sm font-medium mb-2 block">Preview da Barra de Progresso</Label>
                        <div className="space-y-2">
                          {/* Contador acima */}
                          {quizData.design?.progressBarPosition === "above" && quizData.design?.progressBarType !== "none" && (
                            <div className="text-center text-sm text-gray-600">
                              {quizData.design?.progressBarType === "percentage" && "60%"}
                              {quizData.design?.progressBarType === "steps" && "3/5"}
                            </div>
                          )}

                          {/* Contador na mesma linha */}
                          {(quizData.design?.progressBarPosition === "left" || quizData.design?.progressBarPosition === "center" || quizData.design?.progressBarPosition === "right") && quizData.design?.progressBarType !== "none" && (
                            <div className={`flex items-center ${
                              quizData.design?.progressBarPosition === "left" ? "justify-start" :
                              quizData.design?.progressBarPosition === "center" ? "justify-center" :
                              "justify-end"
                            }`}>
                              <span className="text-sm text-gray-600 mr-2">
                                {quizData.design?.progressBarType === "percentage" && "60%"}
                                {quizData.design?.progressBarType === "steps" && "3/5"}
                              </span>
                            </div>
                          )}

                          {/* Barra de progresso */}
                          <div className="w-full bg-gray-200 rounded-full" style={{ height: `${quizData.design?.progressBarHeight || 8}px` }}>
                            <div 
                              className={`rounded-full transition-all duration-300 ${
                                quizData.design?.progressBarStyle === "square" ? "rounded-none" :
                                quizData.design?.progressBarStyle === "thin" ? "rounded-full" :
                                quizData.design?.progressBarStyle === "thick" ? "rounded-full" :
                                "rounded-full"
                              }`}
                              style={{ 
                                width: "60%",
                                height: `${quizData.design?.progressBarHeight || 8}px`,
                                backgroundColor: quizData.design?.progressBarColor || "#10b981"
                              }}
                            />
                          </div>

                          {/* Contador abaixo */}
                          {quizData.design?.progressBarPosition === "below" && quizData.design?.progressBarType !== "none" && (
                            <div className="text-center text-sm text-gray-600">
                              {quizData.design?.progressBarType === "percentage" && "60%"}
                              {quizData.design?.progressBarType === "steps" && "3/5"}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Estilo Visual */}
                      <div>
                        <Label htmlFor="progressBarStyle">Estilo Visual</Label>
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
                    </>
                  )}
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

        {activeTab === "pixels" && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Pixels de Rastreamento */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Pixels de Rastreamento
                  </CardTitle>
                  <p className="text-sm text-gray-600">Configure pixels para rastrear conversões e análises (apenas na página publicada)</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Opção de Delay */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        id="pixelDelay"
                        checked={pixelDelay}
                        onChange={(e) => setPixelDelay(e.target.checked)}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                      />
                      <Label htmlFor="pixelDelay" className="text-sm font-medium text-gray-900">
                        Disparar pixels após 3 segundos
                      </Label>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Otimização CPA</Badge>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>💡 Sabia que disparar o pixel após 3 segundos de carregamento melhora seu CPA?</strong> 
                      Assim ele evita aquelas pessoas que saem antes de carregar a página, e otimiza para pessoas que veem o conteúdo todo.
                    </p>
                  </div>

                  {/* Pixels Ativos */}
                  <div className="space-y-3">
                    {trackingPixels.map((pixel) => (
                      <Card key={pixel.id} className="border-2 border-gray-200 hover:border-green-300 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {getPixelIcon(pixel.type)}
                              <div>
                                <h4 className="font-medium text-gray-900">{pixel.name}</h4>
                                <p className="text-xs text-gray-500">{pixel.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Seletor de Modo para pixels que suportam API */}
                              {availablePixelTypes.find(p => p.type === pixel.type)?.hasApi && (
                                <select
                                  value={pixel.mode}
                                  onChange={(e) => updatePixel(pixel.id, 'mode', e.target.value)}
                                  className="text-xs px-2 py-1 border rounded-md bg-white"
                                >
                                  <option value="normal">Normal</option>
                                  <option value="api">API</option>
                                </select>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removePixel(pixel.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              value={pixel.value}
                              onChange={(e) => updatePixel(pixel.id, 'value', e.target.value)}
                              placeholder={pixel.placeholder}
                              className="flex-1"
                            />
                            {pixel.mode === 'api' && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                API
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Botões para Adicionar Pixels */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Adicionar Pixels</h4>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        + Clique para adicionar
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {availablePixelTypes
                        .filter(pixelType => !trackingPixels.find(p => p.type === pixelType.type))
                        .map((pixelType) => (
                          <Button
                            key={pixelType.type}
                            variant="outline"
                            size="sm"
                            onClick={() => addPixel(pixelType.type)}
                            className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300"
                          >
                            <Plus className="w-4 h-4" />
                            {pixelType.name}
                          </Button>
                        ))}
                    </div>
                  </div>

                  {/* Script Personalizado */}
                  <div className="pt-4 border-t">
                    <Label htmlFor="customHeadScript" className="text-sm font-medium">Script Personalizado (Head)</Label>
                    <Textarea
                      id="customHeadScript"
                      value={quizData.customHeadScript || ""}
                      onChange={(e) => setQuizData(prev => ({ ...prev, customHeadScript: e.target.value }))}
                      placeholder="<script>/* Seu código personalizado aqui */</script>"
                      className="mt-2"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">Scripts personalizados para adicionar no &lt;head&gt; da página</p>
                    
                    {/* Aviso de Segurança */}
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-800">
                        <strong>⚠️ AVISO DE SEGURANÇA:</strong> Insira apenas código de fontes confiáveis. 
                        Scripts maliciosos podem comprometer a segurança do seu quiz e capturar dados dos usuários.
                      </p>
                    </div>
                  </div>

                  {/* Informações importantes */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>ℹ️ Importante:</strong> Os pixels são inseridos apenas na página publicada do quiz, não no preview. 
                      Cada quiz tem seus próprios pixels configurados individualmente.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* SEO e Meta Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    SEO e Meta Tags
                  </CardTitle>
                  <p className="text-sm text-gray-600">Configure meta tags para melhorar o posicionamento nos buscadores</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="seoTitle">Título SEO</Label>
                    <Input
                      id="seoTitle"
                      value={quizData.design?.seoTitle || ""}
                      onChange={(e) => setQuizData(prev => ({ 
                        ...prev, 
                        design: { ...prev.design, seoTitle: e.target.value }
                      }))}
                      placeholder="Título que aparece nos resultados do Google"
                      className="mt-2"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">Recomendado: 50-60 caracteres</p>
                  </div>

                  <div>
                    <Label htmlFor="seoDescription">Descrição SEO</Label>
                    <Textarea
                      id="seoDescription"
                      value={quizData.design?.seoDescription || ""}
                      onChange={(e) => setQuizData(prev => ({ 
                        ...prev, 
                        design: { ...prev.design, seoDescription: e.target.value }
                      }))}
                      placeholder="Descrição que aparece nos resultados do Google"
                      className="mt-2"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">Recomendado: 150-160 caracteres</p>
                  </div>

                  <div>
                    <Label htmlFor="seoKeywords">Palavras-chave SEO</Label>
                    <Input
                      id="seoKeywords"
                      value={quizData.design?.seoKeywords || ""}
                      onChange={(e) => setQuizData(prev => ({ 
                        ...prev, 
                        design: { ...prev.design, seoKeywords: e.target.value }
                      }))}
                      placeholder="palavra1, palavra2, palavra3"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separe por vírgula (máximo 10 palavras)</p>
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


