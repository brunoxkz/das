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
import QuizPreview from "@/components/quiz-preview";
import { QuizFlowEditor } from "@/components/quiz-flow-editor";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth-jwt";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLanguage } from "@/hooks/useLanguage";
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
  BarChart,
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
  const { t } = useLanguage();

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
    enableWhatsappAutomation: false,
    subdomains: []
  });

  const [activeTab, setActiveTab] = useState<"editor" | "preview" | "settings" | "design" | "fluxo" | "pixels" | "blackhat" | "backredirect" | "teste-ab">("editor");
  const [globalTheme, setGlobalTheme] = useState<"light" | "dark" | "custom">("light");
  const [customBackgroundColor, setCustomBackgroundColor] = useState("#ffffff");
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(quizId || null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  // Estado para pixels dinâmicos - iniciar vazio, carregará da API
  const [trackingPixels, setTrackingPixels] = useState([]);
  
  // Estado para delay dos pixels
  const [pixelDelay, setPixelDelay] = useState(false);
  
  // Estado para controlar o salvamento
  const [isSaving, setIsSaving] = useState(false);
  
  // Pixels disponíveis para adicionar - compatível com API
  const availablePixelTypes = [
    { type: 'meta', name: 'Meta/Facebook', placeholder: '123456789012345', description: 'ID do pixel do Facebook/Instagram para rastreamento de conversões', hasApi: true },
    { type: 'tiktok', name: 'TikTok', placeholder: 'C4A7..._..._...', description: 'ID do pixel do TikTok para rastreamento', hasApi: true },
    { type: 'ga4', name: 'Google Analytics 4', placeholder: 'G-XXXXXXXXXX', description: 'ID de medição do Google Analytics 4', hasApi: true },
    { type: 'linkedin', name: 'LinkedIn', placeholder: '123456', description: 'ID do pixel do LinkedIn para rastreamento', hasApi: true },
    { type: 'pinterest', name: 'Pinterest', placeholder: '2612345678901', description: 'ID do pixel do Pinterest para rastreamento', hasApi: true },
    { type: 'snapchat', name: 'Snapchat', placeholder: '12345678-1234-1234-1234-123456789012', description: 'ID do pixel do Snapchat para rastreamento', hasApi: false },
    { type: 'taboola', name: 'Taboola', placeholder: '1234567', description: 'ID do pixel do Taboola para rastreamento', hasApi: false },
    { type: 'mgid', name: 'MGID', placeholder: '123456', description: 'ID do pixel do MGID para rastreamento', hasApi: false },
    { type: 'outbrain', name: 'Outbrain', placeholder: '00abcdef12345678', description: 'ID do pixel do Outbrain para rastreamento', hasApi: false }
  ];

  // Função para obter o ícone do pixel
  const getPixelIcon = (type: string) => {
    const iconMap = {
      meta: <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">f</div>,
      tiktok: <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">TT</div>,
      ga4: <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">GA</div>,
      linkedin: <div className="w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold">in</div>,
      pinterest: <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">P</div>,
      snapchat: <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-white text-xs font-bold">S</div>,
      taboola: <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">T</div>,
      mgid: <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">M</div>,
      outbrain: <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">O</div>
    };
    return iconMap[type] || <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold">?</div>;
  };

  // Função para adicionar pixel
  const addPixel = (type: string) => {
    try {
      const pixelType = availablePixelTypes.find(p => p.type === type);
      if (pixelType) {
        const newPixel = {
          id: Date.now().toString(),
          name: pixelType.name,
          type: pixelType.type,
          mode: 'pixel', // Padrão para pixel ao invés de 'normal'
          value: '',
          placeholder: pixelType.placeholder,
          description: pixelType.description
        };
        setTrackingPixels(prev => [...prev, newPixel]);
        toast({
          title: "Pixel Adicionado",
          description: `${pixelType.name} adicionado com sucesso`,
        });
      } else {
        throw new Error(`Tipo de pixel não encontrado: ${type}`);
      }
    } catch (error) {
      console.error('Erro ao adicionar pixel:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar pixel",
        variant: "destructive",
      });
    }
  };

  // Função para remover pixel
  const removePixel = (id: string) => {
    try {
      setTrackingPixels(prev => prev.filter(pixel => pixel.id !== id));
      toast({
        title: "Pixel Removido",
        description: "Pixel removido com sucesso",
      });
    } catch (error) {
      console.error('Erro ao remover pixel:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover pixel",
        variant: "destructive",
      });
    }
  };

  // Função para carregar pixels via API
  const loadPixelsFromAPI = async (quizId: string) => {
    try {
      const response = await fetch(`/api/quiz/${quizId}/pixels/config`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const pixelData = await response.json();
        if (pixelData.pixels && Array.isArray(pixelData.pixels)) {
          setTrackingPixels(pixelData.pixels);
          setPixelDelay(pixelData.pixelDelay || false);
          
          // Atualizar também o customHeadScript se existir
          if (pixelData.customScripts && pixelData.customScripts.length > 0) {
            setQuizData(prev => ({
              ...prev,
              customHeadScript: pixelData.customScripts.join('\n')
            }));
          }
          
          console.log('✅ Pixels carregados via API:', pixelData.pixels.length);
        }
      } else {
        console.log('ℹ️ Nenhum pixel configurado ou erro ao carregar pixels');
      }
    } catch (error) {
      console.error('Erro ao carregar pixels:', error);
    }
  };



  // Função para atualizar pixel
  const updatePixel = (id: string, field: string, value: string) => {
    setTrackingPixels(prev => 
      prev.map(pixel => 
        pixel.id === id ? { ...pixel, [field]: value } : pixel
      )
    );
  };

  // Função para gerar preview real dos códigos usando a API pixelCodeGenerator
  const generateRealPreview = (pixel: any) => {
    // Simular estrutura QuizPixelData
    const quizPixelData = {
      quizId: currentQuizId || 'preview',
      quizUrl: window.location.href,
      pixels: [pixel],
      customScripts: [],
      utmCode: ''
    };

    // Gerar códigos usando a mesma lógica da API
    try {
      if (pixel.type === 'meta') {
        return `<!-- Meta Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s){
    if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
    t=b.createElement(e);t.async=!0;t.src=v;
    s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
  }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${pixel.value}');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" src="https://www.facebook.com/tr?id=${pixel.value}&ev=PageView&noscript=1"/></noscript>`;
      }
      
      if (pixel.type === 'ga4') {
        return `<!-- Google Analytics 4 Code -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${pixel.value}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${pixel.value}');
</script>`;
      }
      
      if (pixel.type === 'tiktok') {
        return `<!-- TikTok Pixel Code -->
<script>
  !function (w, d, t) {
    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
    ttq.load('${pixel.value}');
    ttq.page();
  }(window, document, 'ttq');
</script>`;
      }
      
      return `<!-- ${pixel.name} -->
<script>
  ${pixel.type}_pixel('${pixel.value}');
</script>`;
    } catch (error) {
      return `<!-- Erro ao gerar código para ${pixel.name} -->`;
    }
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
        title: t('quizBuilder.messages.quizSaved'),
        description: t('quizBuilder.messages.quizSaved'),
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t('quizBuilder.messages.unauthorized'),
          description: t('quizBuilder.messages.unauthorizedDesc'),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: t('quizBuilder.messages.errorSaving'),
        description: t('quizBuilder.messages.errorSaving'),
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
      
      // Carregar pixels via API se o quiz está publicado
      if (existingQuiz.isPublished) {
        loadPixelsFromAPI(existingQuiz.id);
      }
      
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
        title: t('quizBuilder.messages.accessDenied'),
        description: t('quizBuilder.messages.accessDeniedDesc'),
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
        title: t('quizBuilder.messages.titleRequired'),
        description: t('quizBuilder.messages.titleRequiredDesc'),
        variant: "destructive",
      });
      setActiveTab("settings"); // Redireciona para a aba de configurações
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
      globalBackgroundColor: quizData.design?.globalBackgroundColor || "",
      favicon: quizData.design?.favicon || "",
      seoTitle: quizData.design?.seoTitle || "",
      seoDescription: quizData.design?.seoDescription || "",
      seoKeywords: quizData.design?.seoKeywords || "",
      facebookPixel: quizData.facebookPixel || "",
      googlePixel: quizData.googlePixel || "",
      ga4Id: quizData.ga4Id || "",
      customHeadScript: quizData.customHeadScript || "",
      pixelDelay: pixelDelay,
      trackingPixels: trackingPixels,
      // Anti-WebView (BlackHat) configuration
      antiWebViewEnabled: quizData.antiWebViewEnabled || false,
      detectInstagram: quizData.detectInstagram !== false,
      detectFacebook: quizData.detectFacebook !== false,
      detectTikTok: quizData.detectTikTok || false,
      detectOthers: quizData.detectOthers || false,
      enableIOS17: quizData.enableIOS17 !== false,
      enableOlderIOS: quizData.enableOlderIOS !== false,
      enableAndroid: quizData.enableAndroid !== false,
      safeMode: quizData.safeMode !== false,
      redirectDelay: quizData.redirectDelay || 0,
      debugMode: quizData.debugMode || false,
      // BackRedirect configuration
      backRedirectEnabled: quizData.backRedirectEnabled || false,
      backRedirectUrl: quizData.backRedirectUrl || "",
      backRedirectDelay: quizData.backRedirectDelay || 0,
      // Cloaker configuration
      cloakerEnabled: quizData.cloakerEnabled || false,
      cloakerMode: quizData.cloakerMode || "simple",
      cloakerFallbackUrl: quizData.cloakerFallbackUrl || "",
      cloakerWhitelistIps: quizData.cloakerWhitelistIps || "",
      cloakerBlacklistUserAgents: quizData.cloakerBlacklistUserAgents || ""
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

  // Função específica para salvar apenas as configurações de pixels
  const handleSaveQuiz = async () => {
    setIsSaving(true);
    try {
      // Salva o quiz com as configurações de pixels atuais
      await handleSave(false);
      toast({
        title: "Pixels salvos",
        description: "Configurações de pixels foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar pixels:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações de pixels. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
              {t('quizBuilder.preview')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave()}
              disabled={saveMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? t('quizBuilder.saving') : t('quizBuilder.save')}
            </Button>
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={saveMutation.isPending || !quizData.title?.trim()}
            >
              <Globe className="w-4 h-4 mr-2" />
              {t('quizBuilder.publish')}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          {[
            { id: "editor", label: t('quizBuilder.tabs.editor'), icon: <Settings className="w-4 h-4" /> },
            { id: "preview", label: t('quizBuilder.tabs.preview'), icon: <Play className="w-4 h-4" /> },
            { id: "fluxo", label: t('quizBuilder.tabs.flow'), icon: <Network className="w-4 h-4" /> },
            { id: "design", label: t('quizBuilder.tabs.design'), icon: <Palette className="w-4 h-4" /> },
            { id: "settings", label: t('quizBuilder.tabs.settings'), icon: <Settings className="w-4 h-4" /> },
            { id: "teste-ab", label: t('quizBuilder.tabs.abTest'), icon: <BarChart className="w-4 h-4" /> },
            { id: "pixels", label: t('quizBuilder.tabs.pixels'), icon: <Target className="w-4 h-4" /> },
            { id: "blackhat", label: t('quizBuilder.tabs.blackhat'), icon: <Target className="w-4 h-4" /> },

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
                // Salvar cor global no design do quiz
                setQuizData(prev => ({
                  ...prev,
                  design: {
                    ...prev.design,
                    globalBackgroundColor: customColor || (theme === "dark" ? "#000000" : theme === "light" ? "#ffffff" : "#ffffff")
                  }
                }));
              }}
              onActivePageChange={(pageIndex) => {
                setCurrentPageIndex(pageIndex);
              }}
            />
          </div>
        )}

        {activeTab === "preview" && (
          <div className="h-full overflow-y-auto bg-gray-50 p-6">
            <div className="w-full">
              <QuizPreview 
                quiz={quizData} 
                initialPage={currentPageIndex} 
                onClose={() => setActiveTab("editor")} 
              />
            </div>
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
                    <Label htmlFor="logoSize">Tamanho da Logo</Label>
                    <select
                      id="logoSize"
                      value={quizData.design?.logoSize || "medium"}
                      onChange={(e) => setQuizData(prev => ({ 
                        ...prev, 
                        design: { ...prev.design, logoSize: e.target.value }
                      }))}
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="small">Pequeno (30px)</option>
                      <option value="medium">Médio (40px)</option>
                      <option value="large">Grande (60px)</option>
                    </select>
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
                  <p className="text-sm text-gray-600">Configure o favicon do seu quiz para uma aparência mais profissional</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="faviconUpload">Upload do Favicon</Label>
                    <Input
                      id="faviconUpload"
                      type="file"
                      accept="image/*,.ico"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validação de segurança
                          if (file.size > 1024 * 1024) { // 1MB
                            alert("Arquivo muito grande. Máximo 2MB.");
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
                    <Label htmlFor="faviconUrl">URL do Favicon</Label>
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
                  <p className="text-sm text-gray-600">Configure como a barra de progresso será exibida no seu quiz</p>
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
                    <Label htmlFor="showProgressBar" className="font-medium">Mostrar Barra de Progresso</Label>
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
                          <option value="percentage">Porcentagem</option>
                          <option value="steps">Passos</option>
                          <option value="none">Sem contador</option>
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
                            <option value="center">Centro</option>
                            <option value="right">Direita</option>
                            <option value="above">Acima</option>
                            <option value="below">Abaixo</option>
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
                        <Label className="text-sm font-medium mb-2 block">Pré-visualização da Barra de Progresso</Label>
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
                          <option value="rounded">Arredondado</option>
                          <option value="square">Quadrado</option>
                          <option value="thin">Fino</option>
                          <option value="thick">Grosso</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="progressBarHeight">Altura</Label>
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
                      placeholder="Digite o título do seu quiz"
                      className="mt-2"
                    />
                  </div>
                  
                  
                  {/* Status de Publicação */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">Status da Publicação</p>
                        <p className="text-sm text-gray-600">
                          {quizData.isPublished ? "Quiz publicado e disponível publicamente" : "Quiz em modo rascunho"}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        quizData.isPublished 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {quizData.isPublished ? "Publicado" : "Rascunho"}
                      </div>
                    </div>
                    
                    {quizData.isPublished && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await apiRequest(`/api/quizzes/${currentQuizId}/unpublish`, {
                              method: "POST",
                            });
                            setQuizData(prev => ({ ...prev, isPublished: false }));
                            queryClient.invalidateQueries({ queryKey: ['/api/quizzes', currentQuizId] });
                            queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
                          } catch (error) {
                            console.error("Erro ao despublicar quiz:", error);
                          }
                        }}
                        className="w-full mt-2"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Despublicar Quiz
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>







              <Card>
                <CardHeader>
                  <CardTitle>Compartilhamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Link Público</Label>
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
                    <Label>Código de Incorporação</Label>
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

              {/* Configurações de Subdomínios */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Subdomínios Personalizados
                  </CardTitle>
                  <p className="text-sm text-gray-600">Configure subdomínios personalizados para seus quizzes (máximo 3)</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Lista de subdomínios */}
                  <div className="space-y-3">
                    {(quizData.subdomains || []).map((subdomain, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <Input
                            value={subdomain}
                            onChange={(e) => {
                              const newSubdomains = [...(quizData.subdomains || [])];
                              newSubdomains[index] = e.target.value;
                              setQuizData(prev => ({ ...prev, subdomains: newSubdomains }));
                            }}
                            placeholder="quiz.seudominio.com"
                            className="font-mono text-sm"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newSubdomains = (quizData.subdomains || []).filter((_, i) => i !== index);
                            setQuizData(prev => ({ ...prev, subdomains: newSubdomains }));
                          }}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Botão para adicionar subdomínio */}
                  {(quizData.subdomains?.length || 0) < 3 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newSubdomains = [...(quizData.subdomains || []), ""];
                        setQuizData(prev => ({ ...prev, subdomains: newSubdomains }));
                      }}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Subdomínio ({(quizData.subdomains?.length || 0)}/3)
                    </Button>
                  )}

                  {/* Informações sobre subdomínios */}
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Como usar:</strong> Configure o DNS do seu subdomínio para apontar para nossos servidores. 
                      Após a configuração, estará disponível em até 24 horas.
                    </p>
                  </div>
                </CardContent>
              </Card>


            </div>
          </div>
        )}

        {activeTab === "teste-ab" && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Cabeçalho da Aba */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Teste A/B</h2>
                <p className="text-gray-600">Configure testes A/B para otimizar a performance do seu quiz</p>
              </div>

              {/* Configuração do Teste A/B */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="w-5 h-5" />
                    Configurar Teste A/B
                  </CardTitle>
                  <p className="text-sm text-gray-600">Crie variações do seu quiz para testar o que funciona melhor</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Ativar/Desativar Teste A/B */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        id="abTestEnabled"
                        checked={quizData.abTestEnabled || false}
                        onChange={(e) => setQuizData(prev => ({ ...prev, abTestEnabled: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor="abTestEnabled" className="text-sm font-medium text-gray-900">
                        Ativar Teste A/B
                      </Label>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">Otimização</Badge>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>🎯 Teste Diferentes Versões:</strong> Compare diferentes elementos, títulos, cores ou fluxos completos
                    </p>
                  </div>

                  {quizData.abTestEnabled && (
                    <div className="space-y-4">
                      {/* Nome do Teste */}
                      <div>
                        <Label htmlFor="abTestName" className="text-sm font-medium">Nome do Teste</Label>
                        <Input
                          id="abTestName"
                          value={quizData.abTestName || ""}
                          onChange={(e) => setQuizData(prev => ({ ...prev, abTestName: e.target.value }))}
                          placeholder="Ex: Título vs Título Alternativo"
                          className="mt-1"
                        />
                      </div>

                      {/* Divisão de Tráfego */}
                      <div>
                        <Label className="text-sm font-medium">Divisão de Tráfego</Label>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Versão A (Original)</span>
                            <span className="text-sm font-medium">{quizData.abTestSplit || 50}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Versão B (Variação)</span>
                            <span className="text-sm font-medium">{100 - (quizData.abTestSplit || 50)}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="90"
                            value={quizData.abTestSplit || 50}
                            onChange={(e) => setQuizData(prev => ({ ...prev, abTestSplit: parseInt(e.target.value) }))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Tipo de Teste */}
                      <div>
                        <Label className="text-sm font-medium">Tipo de Teste</Label>
                        <select
                          value={quizData.abTestType || "title"}
                          onChange={(e) => setQuizData(prev => ({ ...prev, abTestType: e.target.value }))}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="title">Teste de Título</option>
                          <option value="design">Teste de Design/Cores</option>
                          <option value="flow">Teste de Fluxo de Páginas</option>
                          <option value="elements">Teste de Elementos/Perguntas</option>
                          <option value="complete">Teste de Quiz Completo</option>
                        </select>
                      </div>

                      {/* Configurações da Versão B */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Configurações da Versão B</h4>
                        
                        {quizData.abTestType === "title" && (
                          <div>
                            <Label htmlFor="abTestTitleB" className="text-sm font-medium">Título Alternativo</Label>
                            <Input
                              id="abTestTitleB"
                              value={quizData.abTestTitleB || ""}
                              onChange={(e) => setQuizData(prev => ({ ...prev, abTestTitleB: e.target.value }))}
                              placeholder="Digite o título alternativo para testar"
                              className="mt-1"
                            />
                          </div>
                        )}

                        {quizData.abTestType === "design" && (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="abTestColorB" className="text-sm font-medium">Cor Primária Alternativa</Label>
                              <Input
                                id="abTestColorB"
                                type="color"
                                value={quizData.abTestColorB || "#3b82f6"}
                                onChange={(e) => setQuizData(prev => ({ ...prev, abTestColorB: e.target.value }))}
                                className="mt-1 h-10"
                              />
                            </div>
                            <div>
                              <Label htmlFor="abTestBackgroundB" className="text-sm font-medium">Cor de Fundo Alternativa</Label>
                              <Input
                                id="abTestBackgroundB"
                                type="color"
                                value={quizData.abTestBackgroundB || "#f3f4f6"}
                                onChange={(e) => setQuizData(prev => ({ ...prev, abTestBackgroundB: e.target.value }))}
                                className="mt-1 h-10"
                              />
                            </div>
                          </div>
                        )}

                        {quizData.abTestType === "complete" && (
                          <div>
                            <Label className="text-sm font-medium">Quiz Alternativo</Label>
                            <p className="text-sm text-gray-600 mt-1">
                              Para testes completos, você pode criar um quiz totalmente diferente
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Métricas a Acompanhar */}
                      <div>
                        <Label className="text-sm font-medium">Métricas a Acompanhar</Label>
                        <div className="mt-2 space-y-2">
                          {[
                            { id: "completion", label: "Taxa de Conclusão" },
                            { id: "conversion", label: "Taxa de Conversão" },
                            { id: "engagement", label: "Engajamento" },
                            { id: "leadquality", label: "Qualidade dos Leads" }
                          ].map((metric) => (
                            <div key={metric.id} className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id={`metric-${metric.id}`}
                                checked={quizData.abTestMetrics?.includes(metric.id) || false}
                                onChange={(e) => {
                                  const currentMetrics = quizData.abTestMetrics || [];
                                  const newMetrics = e.target.checked
                                    ? [...currentMetrics, metric.id]
                                    : currentMetrics.filter(m => m !== metric.id);
                                  setQuizData(prev => ({ ...prev, abTestMetrics: newMetrics }));
                                }}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <Label htmlFor={`metric-${metric.id}`} className="text-sm">
                                {metric.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Duração do Teste */}
                      <div>
                        <Label htmlFor="abTestDuration" className="text-sm font-medium">Duração do Teste (dias)</Label>
                        <Input
                          id="abTestDuration"
                          type="number"
                          min="1"
                          max="90"
                          value={quizData.abTestDuration || 14}
                          onChange={(e) => setQuizData(prev => ({ ...prev, abTestDuration: parseInt(e.target.value) }))}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Recomendamos no mínimo 7 dias para resultados estatisticamente significativos
                        </p>
                      </div>

                      {/* Botão para Iniciar Teste */}
                      <Button 
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: "Teste A/B Configurado",
                            description: "O teste será iniciado quando o quiz for publicado",
                          });
                        }}
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Configurar Teste A/B
                      </Button>
                    </div>
                  )}

                  {/* Informações sobre Teste A/B */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">💡 Dicas para Teste A/B Eficaz</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Teste apenas uma variável por vez para resultados claros</li>
                      <li>• Execute o teste por no mínimo 7 dias para dados confiáveis</li>
                      <li>• Aguarde pelo menos 100 visualizações em cada versão</li>
                      <li>• Monitore estatísticas de conversão e engajamento</li>
                    </ul>
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
                  <p className="text-sm text-gray-600">Configure pixels de rastreamento para Facebook, Google e outras plataformas</p>
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
                        Delay de Pixel Inteligente
                      </Label>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Otimização de CPA</Badge>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>💡 Benefício do Delay:</strong> 
                      Dispara o pixel apenas quando o usuário está realmente engajado, melhorando as métricas de qualidade.
                    </p>
                  </div>

                  {/* Opções de Integração com Marketing */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="pixelEmailMarketing"
                        checked={quizData.pixelEmailMarketing || false}
                        onChange={(e) => setQuizData(prev => ({ ...prev, pixelEmailMarketing: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor="pixelEmailMarketing" className="text-sm font-medium text-gray-900">
                        Adicionar pixels no Email Marketing
                      </Label>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3 mb-2">
                        <input
                          type="checkbox"
                          id="pixelSMS"
                          checked={quizData.pixelSMS || false}
                          onChange={(e) => setQuizData(prev => ({ ...prev, pixelSMS: e.target.checked }))}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                        />
                        <Label htmlFor="pixelSMS" className="text-sm font-medium text-green-800">
                          Adicionar pixels no SMS
                        </Label>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                          Recomendado
                        </Badge>
                      </div>
                      <p className="text-xs text-green-700 ml-7">
                        Recomendado para melhorar otimização, audiências e CPA das campanhas
                      </p>
                    </div>
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
                          <div className="space-y-2">
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
                            {pixel.mode === 'api' && (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={pixel.accessToken || ''}
                                  onChange={(e) => updatePixel(pixel.id, 'accessToken', e.target.value)}
                                  placeholder="Token de acesso da API"
                                  className="flex-1 text-xs"
                                />
                                <Input
                                  value={pixel.testEventCode || ''}
                                  onChange={(e) => updatePixel(pixel.id, 'testEventCode', e.target.value)}
                                  placeholder="Código de teste"
                                  className="flex-1 text-xs"
                                />
                              </div>
                            )}
                            {pixel.value && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                <div className="text-green-600 font-medium mb-1">✅ Código será inserido automaticamente na URL pública</div>
                                <div className="text-gray-600">
                                  Trigger: <span className="font-mono">pageview</span>
                                  {pixel.mode === 'api' && <span className="text-purple-600"> + Enhanced API tracking</span>}
                                </div>
                              </div>
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

                  {/* Prévia dos Códigos */}
                  {trackingPixels.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-3">Códigos Gerados (Preview)</h4>
                      <div className="p-3 bg-gray-900 rounded-lg text-green-400 text-xs font-mono max-h-32 overflow-y-auto">
                        {trackingPixels.filter(p => p.value).length > 0 ? (
                          <div className="space-y-4">
                            {trackingPixels
                              .filter(p => p.value)
                              .map(pixel => (
                                <div key={pixel.id}>
                                  <div className="text-blue-400 mb-2">/* {pixel.name} */</div>
                                  <pre className="text-gray-300 text-xs whitespace-pre-wrap">
                                    {generateRealPreview(pixel)}
                                  </pre>
                                  {pixel.mode === 'api' && (
                                    <div className="text-purple-400 mt-2">/* + Enhanced API tracking */</div>
                                  )}
                                </div>
                              ))
                            }
                          </div>
                        ) : (
                          <div className="text-gray-500">Configure os pixels acima para ver os códigos...</div>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-gray-600 bg-amber-50 p-2 rounded border border-amber-200">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className="font-medium">Importante:</span> Códigos são inseridos automaticamente apenas na URL pública do quiz
                        </div>
                        <div className="mt-1 text-amber-700">
                          • No editor: Nenhum código é executado
                          <br />
                          • Na URL pública: Todos os códigos são inseridos automaticamente
                        </div>
                      </div>
                    </div>
                  )}

                  {/* UTM e Rastreamento Avançado */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <Label htmlFor="utmTrackingCode" className="text-sm font-medium">UTM e Rastreamento Avançado</Label>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        UTMify, Voluum, RedTrack
                      </Badge>
                    </div>
                    <Textarea
                      id="utmTrackingCode"
                      value={quizData.utmTrackingCode || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Limite de segurança: 5000 caracteres
                        if (value.length <= 5000) {
                          setQuizData(prev => ({ ...prev, utmTrackingCode: value }));
                        }
                      }}
                      placeholder="<!-- Códigos UTM/Tracking (UTMify, Voluum, RedTrack, etc.) -->"
                      className="mt-2"
                      rows={4}
                      maxLength={5000}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        Códigos para UTMify, Voluum, RedTrack e outros rastreadores
                      </p>
                      <span className="text-xs text-gray-400">
                        {(quizData.utmTrackingCode || "").length}/5000
                      </span>
                    </div>
                  </div>

                  {/* Script Personalizado */}
                  <div className="pt-4 border-t">
                    <Label htmlFor="customHeadScript" className="text-sm font-medium">Script Personalizado (Head)</Label>
                    <Textarea
                      id="customHeadScript"
                      value={quizData.customHeadScript || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Limite de segurança: 10000 caracteres
                        if (value.length <= 10000) {
                          setQuizData(prev => ({ ...prev, customHeadScript: value }));
                        }
                      }}
                      placeholder="<script>/* Seu código personalizado aqui */</script>"
                      className="mt-2"
                      rows={4}
                      maxLength={10000}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">Scripts personalizados para adicionar no &lt;head&gt; da página</p>
                      <span className="text-xs text-gray-400">
                        {(quizData.customHeadScript || "").length}/10000
                      </span>
                    </div>
                    
                    {/* Aviso de Segurança */}
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-800">
                        <strong>⚠️ AVISO DE SEGURANÇA:</strong> Insira apenas código de fontes confiáveis. 
                        Scripts maliciosos podem comprometer a segurança do seu quiz e capturar dados dos usuários.
                      </p>
                      <div className="mt-2 text-xs text-red-700">
                        <strong>Proteções ativas:</strong>
                        <ul className="list-disc list-inside mt-1">
                          <li>Limite de 10.000 caracteres por script</li>
                          <li>Sanitização automática de conteúdo perigoso</li>
                          <li>Validação de estrutura HTML/JS</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Botão de Salvar Configurações de Pixels */}
                  {(trackingPixels.length > 0 || (quizData.customHeadScript && quizData.customHeadScript.length > 0) || (quizData.utmTrackingCode && quizData.utmTrackingCode.length > 0)) && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-green-700">Configurações de Pixels Alteradas</span>
                        </div>
                        <Button
                          onClick={handleSaveQuiz}
                          disabled={isSaving}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isSaving ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Salvando...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Save className="w-4 h-4" />
                              Salvar Pixels
                            </div>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Clique para salvar as configurações de pixels e scripts personalizados
                      </p>
                    </div>
                  )}

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

        {activeTab === "blackhat" && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Cabeçalho da Aba */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">BlackHat - Anti-WebView</h2>
                <p className="text-gray-600">Sistema avançado de redirecionamento que detecta WebView do Instagram/Facebook e força abertura em navegador externo para melhorar ROI e conversões</p>
              </div>

              {/* Sistema Anti-WebView */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Anti-WebView Detection
                  </CardTitle>
                  <p className="text-sm text-gray-600">Detecta acessos via WebView e redireciona para navegador externo automaticamente</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Ativar/Desativar Anti-WebView */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        id="antiWebViewEnabled"
                        checked={quizData.antiWebViewEnabled || false}
                        onChange={(e) => setQuizData(prev => ({ ...prev, antiWebViewEnabled: e.target.checked }))}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                      />
                      <Label htmlFor="antiWebViewEnabled" className="text-sm font-medium text-gray-900">
                        Ativar Anti-WebView (Redirecionamento Inteligente)
                      </Label>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">ROI Maximizado</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                      <div>
                        <p><strong>🎯 Funcionalidade:</strong> Detecta acesso via WebView do Instagram/Facebook</p>
                        <p><strong>🚀 Ação:</strong> Força abertura em navegador externo (Safari/Chrome)</p>
                        <p><strong>📈 Benefícios:</strong> Aumenta ROI, melhora rastreamento e conversões</p>
                      </div>
                      <div>
                        <p><strong>📱 Compatível:</strong> iOS 17+, Android 10+, fallback para versões antigas</p>
                        <p><strong>🔄 Remarketing:</strong> Usuário mantém acesso mesmo após fechar Instagram</p>
                        <p><strong>🛡️ Seguro:</strong> Preserva UTMs, pixels e parâmetros de rastreamento</p>
                      </div>
                    </div>
                  </div>

                  {quizData.antiWebViewEnabled && (
                    <div className="space-y-6">
                      
                      {/* Configurações de Detecção */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Detecção de Plataformas</h4>
                          
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="detectInstagram"
                                checked={quizData.detectInstagram !== false}
                                onChange={(e) => setQuizData(prev => ({ ...prev, detectInstagram: e.target.checked }))}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <Label htmlFor="detectInstagram" className="text-sm">Instagram WebView</Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="detectFacebook"
                                checked={quizData.detectFacebook !== false}
                                onChange={(e) => setQuizData(prev => ({ ...prev, detectFacebook: e.target.checked }))}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <Label htmlFor="detectFacebook" className="text-sm">Facebook WebView</Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="detectTikTok"
                                checked={quizData.detectTikTok || false}
                                onChange={(e) => setQuizData(prev => ({ ...prev, detectTikTok: e.target.checked }))}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <Label htmlFor="detectTikTok" className="text-sm">TikTok WebView</Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="detectOthers"
                                checked={quizData.detectOthers || false}
                                onChange={(e) => setQuizData(prev => ({ ...prev, detectOthers: e.target.checked }))}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <Label htmlFor="detectOthers" className="text-sm">Outros WebViews (WhatsApp, LinkedIn, etc.)</Label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Configurações de Sistema</h4>
                          
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="enableIOS17"
                                checked={quizData.enableIOS17 !== false}
                                onChange={(e) => setQuizData(prev => ({ ...prev, enableIOS17: e.target.checked }))}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <Label htmlFor="enableIOS17" className="text-sm">iOS 17+ (x-safari- protocol)</Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="enableOlderIOS"
                                checked={quizData.enableOlderIOS !== false}
                                onChange={(e) => setQuizData(prev => ({ ...prev, enableOlderIOS: e.target.checked }))}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <Label htmlFor="enableOlderIOS" className="text-sm">iOS &lt; 17 (fallback dummybytes)</Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="enableAndroid"
                                checked={quizData.enableAndroid !== false}
                                onChange={(e) => setQuizData(prev => ({ ...prev, enableAndroid: e.target.checked }))}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <Label htmlFor="enableAndroid" className="text-sm">Android 10+ (dummybytes)</Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="safeMode"
                                checked={quizData.safeMode !== false}
                                onChange={(e) => setQuizData(prev => ({ ...prev, safeMode: e.target.checked }))}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <Label htmlFor="safeMode" className="text-sm">Modo Seguro (evita Android antigo)</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Configurações de Redirecionamento */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Configurações de Redirecionamento</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="redirectDelay" className="text-sm font-medium">Delay do Redirecionamento</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Input
                                id="redirectDelay"
                                type="number"
                                min="0"
                                max="5"
                                value={quizData.redirectDelay || 0}
                                onChange={(e) => setQuizData(prev => ({ ...prev, redirectDelay: parseInt(e.target.value) || 0 }))}
                                className="w-20"
                              />
                              <span className="text-sm text-gray-500">segundos</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Tempo antes da detecção (0 = imediato)
                            </p>
                          </div>
                          
                          <div>
                            <Label htmlFor="debugMode" className="text-sm font-medium">Modo Debug</Label>
                            <div className="flex items-center space-x-2 mt-2">
                              <input
                                type="checkbox"
                                id="debugMode"
                                checked={quizData.debugMode || false}
                                onChange={(e) => setQuizData(prev => ({ ...prev, debugMode: e.target.checked }))}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <Label htmlFor="debugMode" className="text-sm">Ativar logs de debug</Label>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Exibe logs no console para desenvolvimento
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Preview das configurações */}
                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <Label className="text-sm font-medium mb-2 block">Configuração Atual</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                          <div>
                            <p><strong>Plataformas:</strong> 
                              {[
                                quizData.detectInstagram !== false && "Instagram",
                                quizData.detectFacebook !== false && "Facebook", 
                                quizData.detectTikTok && "TikTok",
                                quizData.detectOthers && "Outros"
                              ].filter(Boolean).join(", ") || "Nenhuma"}
                            </p>
                            <p><strong>Sistemas:</strong> 
                              {[
                                quizData.enableIOS17 !== false && "iOS 17+",
                                quizData.enableOlderIOS !== false && "iOS < 17",
                                quizData.enableAndroid !== false && "Android 10+"
                              ].filter(Boolean).join(", ") || "Nenhum"}
                            </p>
                          </div>
                          <div>
                            <p><strong>Delay:</strong> {quizData.redirectDelay || 0} segundos</p>
                            <p><strong>Modo Seguro:</strong> {quizData.safeMode !== false ? "Ativado" : "Desativado"}</p>
                            <p><strong>Debug:</strong> {quizData.debugMode ? "Ativado" : "Desativado"}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Explicação de Resultados */}
                      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                        <Label className="text-sm font-medium mb-2 block">📈 Resultados Esperados</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                          <div>
                            <p>• <strong>ROI aumentado:</strong> Usuários mantêm acesso após fechar Instagram</p>
                            <p>• <strong>Melhor rastreamento:</strong> Pixels funcionam corretamente no navegador</p>
                            <p>• <strong>Maior conversão:</strong> Navegador externo é mais estável</p>
                          </div>
                          <div>
                            <p>• <strong>Remarketing eficaz:</strong> Usuário pode voltar ao quiz facilmente</p>
                            <p>• <strong>Tempo de permanência:</strong> Sessão não é perdida ao fechar app</p>
                            <p>• <strong>Menor custo:</strong> Reduz perda de leads por problemas técnicos</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sistema BackRedirect */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5" />
                    BackRedirect Universal
                  </CardTitle>
                  <p className="text-sm text-gray-600">Sistema de redirecionamento quando usuário tenta voltar pelo navegador</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Ativar/Desativar BackRedirect */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        id="backRedirectEnabled"
                        checked={quizData.backRedirectEnabled || false}
                        onChange={(e) => setQuizData(prev => ({ ...prev, backRedirectEnabled: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor="backRedirectEnabled" className="text-sm font-medium text-gray-900">
                        Ativar BackRedirect Universal
                      </Label>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">Compatibilidade Total</Badge>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <p className="mb-2">
                        <strong>🔄 Como funciona:</strong> Quando o usuário tenta voltar pelo navegador (botão "voltar"), 
                        ao invés de sair do quiz, é redirecionado para uma URL específica que você define.
                      </p>
                      <p className="mb-2">
                        <strong>📱 Compatibilidade:</strong> Funciona em todos os dispositivos móveis (Android/iPhone) 
                        e dentro de apps sociais (Instagram, Facebook, WhatsApp, etc.)
                      </p>
                      <p className="text-purple-700">
                        <strong>⚠️ Importante:</strong> Este sistema é para manter o usuário engajado no funil, 
                        não para moderação ou violação de políticas.
                      </p>
                    </div>
                  </div>

                  {quizData.backRedirectEnabled && (
                    <div className="space-y-4">
                      {/* URL de Redirecionamento */}
                      <div>
                        <Label htmlFor="backRedirectUrl" className="text-sm font-medium">URL de Redirecionamento</Label>
                        <Input
                          id="backRedirectUrl"
                          value={quizData.backRedirectUrl || ""}
                          onChange={(e) => setQuizData(prev => ({ ...prev, backRedirectUrl: e.target.value }))}
                          placeholder="https://exemplo.com/obrigado"
                          className="mt-2"
                          type="url"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          URL para onde o usuário será redirecionado quando tentar voltar
                        </p>
                      </div>

                      {/* Delay do Redirecionamento */}
                      <div>
                        <Label htmlFor="backRedirectDelay" className="text-sm font-medium">Delay do Redirecionamento</Label>
                        <div className="mt-2 flex items-center space-x-2">
                          <Input
                            id="backRedirectDelay"
                            type="number"
                            min="0"
                            max="60"
                            value={quizData.backRedirectDelay || 0}
                            onChange={(e) => setQuizData(prev => ({ ...prev, backRedirectDelay: parseInt(e.target.value) || 0 }))}
                            className="w-20"
                          />
                          <span className="text-sm text-gray-600">segundos</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Tempo de espera antes do redirecionamento (0 = imediato)
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sistema Cloaker */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Cloaker Avançado
                  </CardTitle>
                  <p className="text-sm text-gray-600">Sistema de ocultação de conteúdo para diferentes visitantes</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Ativar/Desativar Cloaker */}
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        id="cloakerEnabled"
                        checked={quizData.cloakerEnabled || false}
                        onChange={(e) => setQuizData(prev => ({ ...prev, cloakerEnabled: e.target.checked }))}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <Label htmlFor="cloakerEnabled" className="text-sm font-medium text-gray-900">
                        Ativar Cloaker Avançado
                      </Label>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">Proteção Inteligente</Badge>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <p className="mb-2">
                        <strong>🛡️ Como funciona:</strong> Mostra conteúdo diferente baseado no visitante. 
                        Usuários reais veem seu quiz, enquanto outros podem ver conteúdo alternativo.
                      </p>
                      <p className="mb-2">
                        <strong>🎯 Detecção inteligente:</strong> Analisa IP, user-agent, comportamento de navegação 
                        e outros fatores para determinar se é um visitante real.
                      </p>
                      <p className="text-purple-700">
                        <strong>⚠️ Importante:</strong> Este sistema é para proteger seu conteúdo e melhorar a experiência 
                        do usuário, não para moderação ou violação de políticas.
                      </p>
                    </div>
                  </div>

                  {quizData.cloakerEnabled && (
                    <div className="space-y-4">
                      {/* Modo do Cloaker */}
                      <div>
                        <Label htmlFor="cloakerMode" className="text-sm font-medium">Modo do Cloaker</Label>
                        <select
                          id="cloakerMode"
                          value={quizData.cloakerMode || "simple"}
                          onChange={(e) => setQuizData(prev => ({ ...prev, cloakerMode: e.target.value }))}
                          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="simple">Simples - Baseado em IP</option>
                          <option value="advanced">Avançado - IP + User-Agent</option>
                          <option value="smart">Inteligente - Análise Comportamental</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Nível de detecção: Simples (mais rápido), Avançado (balanceado), Inteligente (mais preciso)
                        </p>
                      </div>

                      {/* URL de Fallback */}
                      <div>
                        <Label htmlFor="cloakerFallbackUrl" className="text-sm font-medium">URL de Fallback</Label>
                        <Input
                          id="cloakerFallbackUrl"
                          value={quizData.cloakerFallbackUrl || ""}
                          onChange={(e) => setQuizData(prev => ({ ...prev, cloakerFallbackUrl: e.target.value }))}
                          placeholder="https://exemplo.com/site-alternativo"
                          className="mt-2"
                          type="url"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          URL para onde visitantes não-reais serão redirecionados
                        </p>
                      </div>

                      {/* Whitelist IPs */}
                      <div>
                        <Label htmlFor="cloakerWhitelistIps" className="text-sm font-medium">IPs na Whitelist</Label>
                        <Textarea
                          id="cloakerWhitelistIps"
                          value={quizData.cloakerWhitelistIps || ""}
                          onChange={(e) => setQuizData(prev => ({ ...prev, cloakerWhitelistIps: e.target.value }))}
                          placeholder="192.168.1.1&#10;203.0.113.0/24&#10;2001:db8::/32"
                          className="mt-2"
                          rows={3}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          IPs que sempre verão o conteúdo real (um por linha, suporta CIDR)
                        </p>
                      </div>

                      {/* Blacklist User-Agents */}
                      <div>
                        <Label htmlFor="cloakerBlacklistUserAgents" className="text-sm font-medium">User-Agents Bloqueados</Label>
                        <Textarea
                          id="cloakerBlacklistUserAgents"
                          value={quizData.cloakerBlacklistUserAgents || ""}
                          onChange={(e) => setQuizData(prev => ({ ...prev, cloakerBlacklistUserAgents: e.target.value }))}
                          placeholder="bot&#10;crawler&#10;spider&#10;monitor"
                          className="mt-2"
                          rows={3}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          User-agents que serão redirecionados (um por linha, busca por substring)
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Manter BackRedirect original para compatibilidade */}
        {activeTab === "backredirect" && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              
              {/* Cabeçalho da Aba */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">BackRedirect Universal</h2>
                <p className="text-gray-600">Sistema de redirecionamento para compatibilidade móvel total</p>
              </div>

              {/* Sistema BackRedirect */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5" />
                    Configurações de Redirecionamento
                  </CardTitle>
                  <p className="text-sm text-gray-600">Configure redirecionamento quando usuário tenta voltar pelo navegador</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Ativar/Desativar BackRedirect */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="checkbox"
                        id="backRedirectEnabled"
                        checked={quizData.backRedirectEnabled || false}
                        onChange={(e) => setQuizData(prev => ({ ...prev, backRedirectEnabled: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor="backRedirectEnabled" className="text-sm font-medium text-gray-900">
                        Ativar BackRedirect Universal
                      </Label>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">Compatibilidade Total</Badge>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>📱 Sistema ultra-compatível:</strong> Funciona em todos os dispositivos móveis (Android/iPhone) 
                      e dentro de apps sociais (Instagram, Facebook, WhatsApp, etc.)
                    </p>
                  </div>

                  {quizData.backRedirectEnabled && (
                    <div className="space-y-4">
                      {/* URL de Redirecionamento */}
                      <div>
                        <Label htmlFor="backRedirectUrl" className="text-sm font-medium">URL de Redirecionamento</Label>
                        <Input
                          id="backRedirectUrl"
                          value={quizData.backRedirectUrl || ""}
                          onChange={(e) => setQuizData(prev => ({ ...prev, backRedirectUrl: e.target.value }))}
                          placeholder="https://exemplo.com/obrigado"
                          className="mt-2"
                          type="url"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          URL para onde o usuário será redirecionado após completar o quiz
                        </p>
                      </div>

                      {/* Delay do Redirecionamento */}
                      <div>
                        <Label htmlFor="backRedirectDelay" className="text-sm font-medium">Delay do Redirecionamento</Label>
                        <div className="mt-2 flex items-center space-x-2">
                          <Input
                            id="backRedirectDelay"
                            type="number"
                            min="0"
                            max="60"
                            value={quizData.backRedirectDelay || 0}
                            onChange={(e) => setQuizData(prev => ({ ...prev, backRedirectDelay: parseInt(e.target.value) || 0 }))}
                            className="w-20"
                          />
                          <span className="text-sm text-gray-600">segundos</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Tempo de espera antes do redirecionamento (0 = imediato)
                        </p>
                      </div>

                      {/* Preview do Redirecionamento */}
                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <Label className="text-sm font-medium mb-2 block">Preview do Redirecionamento</Label>
                        <div className="text-sm text-gray-700">
                          <p><strong>URL:</strong> {quizData.backRedirectUrl || "Não configurado"}</p>
                          <p><strong>Delay:</strong> {quizData.backRedirectDelay || 0} segundos</p>
                          <p><strong>Execução:</strong> {quizData.backRedirectDelay === 0 ? "Imediata" : `Aguarda ${quizData.backRedirectDelay}s`}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informações Técnicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Compatibilidade Técnica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Compatibilidade Garantida */}
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800 font-medium mb-2">
                        <strong>✅ Compatibilidade Garantida:</strong>
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                        <div>
                          <strong>Dispositivos:</strong>
                          <ul className="mt-1 space-y-1">
                            <li>• iOS Safari (nativo e WebView)</li>
                            <li>• Android Chrome/WebView</li>
                            <li>• Todos os navegadores móveis</li>
                          </ul>
                        </div>
                        <div>
                          <strong>Apps Sociais:</strong>
                          <ul className="mt-1 space-y-1">
                            <li>• Instagram In-App Browser</li>
                            <li>• Facebook In-App Browser</li>
                            <li>• WhatsApp In-App Browser</li>
                            <li>• TikTok In-App Browser</li>
                          </ul>
                        </div>
                      </div>
                    </div>



                    {/* Métodos de Redirecionamento */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 font-medium mb-2">
                        <strong>🔧 Métodos de Redirecionamento:</strong>
                      </p>
                      <div className="text-xs text-blue-700 space-y-1">
                        <p>• <strong>Método 1:</strong> window.location.href (principal)</p>
                        <p>• <strong>Método 2:</strong> window.location.replace (fallback)</p>
                        <p>• <strong>Método 3:</strong> window.open (WebViews)</p>
                        <p>• <strong>Método 4:</strong> window.top.location (apps sociais)</p>
                        <p>• <strong>Método 5:</strong> history.pushState (fallback final)</p>
                      </div>
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


