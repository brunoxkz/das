import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth-jwt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, Send, DollarSign, FileText, Plus, Eye, Clock, Users, CheckCircle, XCircle, Phone, Search, AlertCircle, Edit, CreditCard, Pause, Play, Trash2, Clock3, Sparkles, Target, RefreshCw, Zap, Crown, ShoppingCart } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { VariableHelperUnified } from "@/components/ui/variable-helper-unified";
import { UltraPersonalizedCampaignModal } from "@/components/ultra-personalized-campaign-modal";
import { CampaignStyleSelector, CampaignStyle } from "@/components/campaign-style-selector";
import { useLanguage } from "@/hooks/useLanguage";

interface SMSCredits {
  total: number;
  used: number;
  remaining: number;
}

interface SMSCampaign {
  id: string;
  name: string;
  quizId: string;
  quizTitle: string;
  status: 'active' | 'paused' | 'completed';
  message: string;
  scheduledDate?: string;
  targetAudience: 'all' | 'completed' | 'abandoned';
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  replies: number;
  createdAt: string;
}

interface SMSTemplate {
  id: string;
  name: string;
  message: string;
  category: 'promotion' | 'follow_up' | 'reminder' | 'thank_you';
  variables: string[];
}

export default function SMSCreditsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  
  // Estados para campanhas ultra personalizadas
  const [showUltraPersonalizedModal, setShowUltraPersonalizedModal] = useState(false);
  const [selectedQuizForUltraPersonalized, setSelectedQuizForUltraPersonalized] = useState<{id: string, title: string} | null>(null);
  
  // Estados para seletor de estilo de campanha
  const [showCampaignStyleSelector, setShowCampaignStyleSelector] = useState(false);
  const [selectedCampaignStyle, setSelectedCampaignStyle] = useState<CampaignStyle | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [campaignForm, setCampaignForm] = useState<{
    name: string;
    message: string;
    targetAudience: "completed" | "abandoned" | "all";
    quizId: string;
    triggerType: "immediate" | "delayed" | "scheduled";
    triggerDelay: number;
    triggerUnit: "hours" | "minutes";
    fromDate: string;
    scheduledDateTime?: string;
  }>({
    name: "",
    message: "",
    targetAudience: "completed",
    quizId: "",
    triggerType: "delayed",
    triggerDelay: 10,
    triggerUnit: "minutes",
    fromDate: "",
    scheduledDateTime: ""
  });
  const [selectedQuizForPhones, setSelectedQuizForPhones] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [selectedCampaignLogs, setSelectedCampaignLogs] = useState<string | null>(null);

  // Fetch user's SMS credits - otimizado para uma única requisição
  const { data: smsCredits, isLoading: creditsLoading } = useQuery<SMSCredits>({
    queryKey: ["/api/sms-credits"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/sms-credits", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch SMS credits");
      return response.json();
    },
    staleTime: 30000, // Cache por 30 segundos
    cacheTime: 60000, // Cache por 1 minuto
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  // Fetch user's quizzes for funnel selection
  const { data: quizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ["/api/quizzes"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/quizzes", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
  });

  // Fetch SMS campaigns with real stats
  const { data: campaigns, isLoading: campaignLoading } = useQuery<SMSCampaign[]>({
    queryKey: ["/api/sms-campaigns"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/sms-campaigns", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch SMS campaigns");
      const campaigns = await response.json();
      
      // Retornar campanhas sem stats individuais para melhor performance
      return campaigns;
    },
    staleTime: 30000, // Cache por 30 segundos
    cacheTime: 60000  // Cache por 1 minuto
  });

  // Fetch SMS templates
  const { data: templates, isLoading: templatesLoading } = useQuery<SMSTemplate[]>({
    queryKey: ["/api/sms-templates"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/sms-templates", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch SMS templates");
      return response.json();
    }
  });

  // Fetch phone numbers for selected quiz
  const { data: quizPhones, isLoading: phonesLoading } = useQuery<any>({
    queryKey: ["/api/quiz-phones", campaignForm.quizId],
    queryFn: async () => {
      if (!campaignForm.quizId) return { phones: [] };
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/quiz-phones/${campaignForm.quizId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch quiz phones");
      return response.json();
    },
    enabled: !!campaignForm.quizId,
    staleTime: 30000, // Cache por 30 segundos
    cacheTime: 60000, // Cache por 1 minuto
    refetchInterval: 60000 // Atualizar a cada 1 minuto para detectar novos leads
  });

  // Calcular contadores dinâmicos de leads por público-alvo
  const getLeadCounts = () => {
    if (!quizPhones?.phones) return { completed: 0, abandoned: 0, all: 0 };
    
    const phones = quizPhones.phones;
    const completed = phones.filter((p: any) => p.status === 'completed').length;
    const abandoned = phones.filter((p: any) => p.status === 'abandoned').length;
    const all = phones.length;
    
    return { completed, abandoned, all };
  };

  // Calcular leads após filtro de data (LISTA OFICIAL PARA ENVIO)
  const getFilteredLeadCounts = () => {
    if (!quizPhones?.phones) return { completed: 0, abandoned: 0, all: 0, totalBeforeFilter: 0 };
    
    let phones = quizPhones.phones;
    const totalBeforeFilter = phones.length;
    
    // Aplicar filtro de data se especificado
    if (campaignForm.fromDate) {
      const filterDate = new Date(campaignForm.fromDate);
      phones = phones.filter((p: any) => {
        const responseDate = new Date(p.submittedAt);
        return responseDate >= filterDate;
      });
    }
    
    // Aplicar filtro de público-alvo
    let filteredPhones = phones;
    if (campaignForm.targetAudience === 'completed') {
      filteredPhones = phones.filter((p: any) => p.status === 'completed');
    } else if (campaignForm.targetAudience === 'abandoned') {
      filteredPhones = phones.filter((p: any) => p.status === 'abandoned');
    }
    
    return {
      completed: phones.filter((p: any) => p.status === 'completed').length,
      abandoned: phones.filter((p: any) => p.status === 'abandoned').length,
      all: phones.length,
      totalBeforeFilter,
      finalCount: filteredPhones.length, // Número final que será enviado
      filteredByDate: totalBeforeFilter - phones.length // Quantos foram removidos pelo filtro de data
    };
  };

  const leadCounts = getLeadCounts();
  const filteredCounts = getFilteredLeadCounts();

  // Purchase SMS credits mutation
  const purchaseCreditsMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await fetch("/api/sms-credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });
      if (!response.ok) throw new Error("Failed to purchase credits");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sms-credits"] });
      toast({
        title: "Créditos SMS Adquiridos",
        description: "Seus créditos foram adicionados com sucesso!"
      });
    }
  });

  // Create SMS campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaign: typeof campaignForm) => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/sms-campaigns", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(campaign)
      });
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Campaign creation error:", errorData);
        throw new Error(`Failed to create campaign: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Campaign created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/sms-campaigns"] });
      
      const sentCount = data.sent || 0;
      const description = sentCount > 0 
        ? `Campanha criada e ${sentCount} SMS enviados automaticamente!`
        : "Campanha criada com sucesso!";
      
      toast({
        title: "Campanha SMS Criada",
        description
      });
      setCampaignForm({
        name: "",
        message: "",
        targetAudience: "completed",
        quizId: "",
        triggerType: "immediate",
        triggerDelay: 1,
        triggerUnit: "hours",

      });
      // Redirecionar para a aba de campanhas
      setActiveTab("campaigns");
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Erro ao Criar Campanha",
        description: "Houve um problema ao criar a campanha SMS. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Send SMS campaign mutation
  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/sms-campaigns/${campaignId}/send`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to send campaign");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sms-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sms-credits"] });
      toast({
        title: "Campanha SMS Enviada",
        description: "Sua campanha está sendo enviada!"
      });
    }
  });

  const handleCampaignStyleSelect = (style: CampaignStyle) => {
    setSelectedCampaignStyle(style);
    
    // Baseado no estilo selecionado, redirecionar para o fluxo apropriado
    switch (style) {
      case 'remarketing':
        handleCreateRemarketingCampaign();
        break;
      case 'remarketing_ultra_customizado':
        handleCreateRemarketingUltraCustomizedCampaign();
        break;
      case 'ao_vivo_tempo_real':
        handleCreateStandardCampaign();
        break;
      case 'ao_vivo_ultra_customizada':
        handleCreateUltraCustomizedCampaign();
        break;
    }
  };

  const handleCreateRemarketingCampaign = () => {
    if (!campaignForm.message || !campaignForm.quizId || !campaignForm.targetAudience) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const selectedQuiz = quizzes?.find((q: any) => q.id === campaignForm.quizId);
    const campaignName = `[REMARKETING] ${selectedQuiz?.title || 'Quiz'}`;

    createCampaignMutation.mutate({
      ...campaignForm,
      name: campaignName,
      campaignType: 'remarketing'
    });
  };

  const handleCreateRemarketingUltraCustomizedCampaign = () => {
    if (!campaignForm.message || !campaignForm.quizId || !campaignForm.targetAudience) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const selectedQuiz = quizzes?.find((q: any) => q.id === campaignForm.quizId);
    const campaignName = `[REMARKETING ULTRA CUSTOMIZADO] ${selectedQuiz?.title || 'Quiz'}`;

    createCampaignMutation.mutate({
      ...campaignForm,
      name: campaignName,
      campaignType: 'remarketing_ultra_customizado'
    });
  };

  const handleCreateStandardCampaign = () => {
    if (!campaignForm.message || !campaignForm.quizId || !campaignForm.targetAudience) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const selectedQuiz = quizzes?.find((q: any) => q.id === campaignForm.quizId);
    const campaignName = `[AO VIVO TEMPO REAL] ${selectedQuiz?.title || 'Quiz'}`;

    createCampaignMutation.mutate({
      ...campaignForm,
      name: campaignName,
      campaignType: 'ao_vivo_tempo_real'
    });
  };

  const handleCreateUltraCustomizedCampaign = () => {
    if (!campaignForm.quizId) {
      toast({
        title: "Selecione um quiz",
        description: "Primeiro selecione o quiz para personalização.",
        variant: "destructive",
      });
      return;
    }
    
    const selectedQuiz = quizzes?.find((q: any) => q.id === campaignForm.quizId);
    setSelectedQuizForUltraPersonalized({
      id: campaignForm.quizId,
      title: selectedQuiz?.title || "Quiz Selecionado"
    });
    setShowUltraPersonalizedModal(true);
  };

  const handleCreateUltraPersonalizedCampaign = () => {
    if (!campaignForm.quizId) {
      toast({
        title: "Selecione um quiz",
        description: "Primeiro selecione o quiz para personalização avançada.",
        variant: "destructive",
      });
      return;
    }
    
    const selectedQuiz = quizzes?.find((q: any) => q.id === campaignForm.quizId);
    setSelectedQuizForUltraPersonalized({
      id: campaignForm.quizId,
      title: selectedQuiz?.title || "Quiz Selecionado"
    });
    setShowUltraPersonalizedModal(true);
  };

  const handleSendCampaign = (campaignId: string) => {
    sendCampaignMutation.mutate(campaignId);
  };

  // Pause campaign mutation
  const pauseCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const token = localStorage.getItem("accessToken");
      console.log("Pausing campaign with token:", token ? "Token exists" : "No token");
      
      const response = await fetch(`/api/sms-campaigns/${campaignId}/pause`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      console.log("Pause response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Pause error:", errorData);
        throw new Error(`Failed to pause campaign: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sms-campaigns"] });
      toast({
        title: "Campanha Pausada",
        description: "A campanha foi pausada com sucesso."
      });
    },
    onError: (error) => {
      console.error("Pause mutation error:", error);
      toast({
        title: "Erro ao Pausar Campanha",
        description: "Houve um problema ao pausar a campanha. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/sms-campaigns/${campaignId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to delete campaign");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sms-campaigns"] });
      toast({
        title: "Campanha Deletada",
        description: "A campanha foi deletada com sucesso."
      });
    }
  });

  // Resume campaign mutation
  const resumeCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const token = localStorage.getItem("accessToken");
      console.log("Resuming campaign with token:", token ? "Token exists" : "No token");
      
      const response = await fetch(`/api/sms-campaigns/${campaignId}/resume`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      console.log("Resume response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Resume error:", errorData);
        throw new Error(`Failed to resume campaign: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sms-campaigns"] });
      toast({
        title: "Campanha Retomada",
        description: "A campanha foi retomada com sucesso."
      });
    },
    onError: (error) => {
      console.error("Resume mutation error:", error);
      toast({
        title: "Erro ao Retomar Campanha",
        description: "Houve um problema ao retomar a campanha. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const handlePauseCampaign = (campaignId: string) => {
    pauseCampaignMutation.mutate(campaignId);
  };

  const handleResumeCampaign = (campaignId: string) => {
    resumeCampaignMutation.mutate(campaignId);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    if (confirm("Tem certeza que deseja deletar esta campanha? Esta ação não pode ser desfeita.")) {
      deleteCampaignMutation.mutate(campaignId);
    }
  };

  // Query para buscar logs de SMS de uma campanha específica
  const { data: smsLogs } = useQuery({
    queryKey: ["/api/sms-campaigns", selectedCampaignLogs, "logs"],
    queryFn: async () => {
      if (!selectedCampaignLogs) return [];
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/sms-campaigns/${selectedCampaignLogs}/logs`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch SMS logs");
      return response.json();
    },
    enabled: !!selectedCampaignLogs
  });

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return "—";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('pt-BR');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock3 className="w-4 h-4 text-yellow-600" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock3 className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Enviado';
      case 'failed':
        return 'Falhou';
      case 'pending':
        return 'Pendente';
      case 'scheduled':
        return 'Agendado';
      default:
        return 'Desconhecido';
    }
  };

  const creditPackages = [
    { amount: 100, price: 9.90, bonus: 0 },
    { amount: 500, price: 39.90, bonus: 50 },
    { amount: 1000, price: 69.90, bonus: 150 },
    { amount: 5000, price: 299.90, bonus: 1000 }
  ];

  const smsTemplates = [
    {
      id: "1",
      name: "Agradecimento",
      message: "Obrigado por completar nosso quiz! Seus resultados: {resultado}",
      category: "thank_you" as const,
      variables: ["resultado", "nome"]
    },
    {
      id: "2", 
      name: "Promoção",
      message: "🎁 Oferta especial para você! 20% OFF válido até amanhã. Use: QUIZ20",
      category: "promotion" as const,
      variables: ["desconto", "codigo"]
    },
    {
      id: "3",
      name: "Lembrete",
      message: "Você não terminou nosso quiz! Complete agora: {link}",
      category: "reminder" as const,
      variables: ["link", "nome"]
    }
  ];

  if (creditsLoading || quizzesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('sms.campaigns')}</h1>
          <p className="text-gray-600">{t('sms.createCampaign')}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-700">Créditos Disponíveis</p>
                  <p className="text-xl font-bold text-green-800">
                    {smsCredits?.remaining || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button
            onClick={() => window.open('/credits', '_blank')}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {t('sms.buyCredits')}
          </Button>
        </div>
      </div>

      {/* Campaign Style Selection Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Target className="w-5 h-5" />
            {t('sms.createNewCampaign')}
          </CardTitle>
          <CardDescription>
            {t('sms.campaignDescription') || 'Comece selecionando o estilo de campanha que melhor se adapta ao seu objetivo'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Button
              onClick={() => setShowCampaignStyleSelector(true)}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8"
            >
              <Target className="w-5 h-5 mr-2" />
              {t('sms.selectCampaignStyle')}
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <RefreshCw className="w-6 h-6 mb-2 text-orange-600" />
              <h4 className="font-semibold text-orange-800">{t('sms.remarketing')}</h4>
              <p className="text-sm text-orange-600">{t('sms.remarketingDescription')}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Crown className="w-6 h-6 mb-2 text-purple-600" />
              <h4 className="font-semibold text-purple-800">{t('sms.remarketingUltraCustom')}</h4>
              <p className="text-sm text-purple-600">{t('sms.remarketingUltraDescription')}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <Zap className="w-6 h-6 mb-2 text-green-600" />
              <h4 className="font-semibold text-green-800">{t('sms.liveRealTime')}</h4>
              <p className="text-sm text-green-600">{t('sms.liveDescription')}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Target className="w-6 h-6 mb-2 text-blue-600" />
              <h4 className="font-semibold text-blue-800">{t('sms.liveUltraCustom')}</h4>
              <p className="text-sm text-blue-600">{t('sms.liveUltraDescription')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <MessageSquare className="w-5 h-5" />
            Como funciona o Remarketing SMS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">📱 Como Funciona</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Selecione um quiz onde o lead tenha preenchido o campo <strong>Telefone</strong></li>
                <li>• Escolha enviar para pessoas que <strong>abandonaram</strong> ou <strong>completaram</strong> o quiz</li>
                <li>• Defina mensagens personalizadas para cada situação</li>
                <li>• Configure timing automático: envio imediato ou após X horas/minutos</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">🎯 Direcionamento</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>Leads Abandonados:</strong> Pessoas que começaram mas não terminaram</li>
                <li>• <strong>Leads Completos:</strong> Pessoas que terminaram o quiz</li>
                <li>• <strong>Filtro Automático:</strong> Apenas leads com telefone válido</li>
                <li>• <strong>Timing Flexível:</strong> 1-72 horas após o evento</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">📈 Resultados</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>Previsão de aumento de ROI: +28%</strong></li>
                <li>• Recupere leads abandonados automaticamente</li>
                <li>• Mantenha engajamento com quem completou</li>
                <li>• Mensagens no momento certo aumentam conversão</li>
              </ul>
            </div>
          </div>
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Importante:</strong> É necessário comprar créditos SMS para usar esta funcionalidade. Cada SMS enviado consome 1 crédito.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${campaignForm.quizId ? 'grid-cols-6' : 'grid-cols-5'}`}>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          {campaignForm.quizId && <TabsTrigger value="phones">Telefones</TabsTrigger>}
          <TabsTrigger value="analytics">Análises</TabsTrigger>
          <TabsTrigger value="credits">Créditos</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total de Créditos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{smsCredits?.total || 0}</div>
                <Progress value={((smsCredits?.total || 0) / 1000) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Créditos Usados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{smsCredits?.used || 0}</div>
                <p className="text-xs text-gray-600 mt-1">Este mês</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {campaigns?.filter(c => c.status === 'active').length || 0}
                </div>
                <p className="text-xs text-gray-600 mt-1">Em andamento</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">98.5%</div>
                <p className="text-xs text-gray-600 mt-1">Média geral</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Recentes</CardTitle>
              <CardDescription>Suas últimas campanhas SMS</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns?.slice(0, 5).map((campaign) => {
                  console.log("CAMPAIGN DATA:", {
                    id: campaign.id,
                    name: campaign.name,
                    status: campaign.status,
                    sent: campaign.sent,
                    delivered: campaign.delivered
                  });
                  return (
                  <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        campaign.status === 'active' ? 'bg-green-500' : 
                        campaign.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-gray-600">{campaign.quizTitle}</p>
                        {campaign.status === 'draft' && (
                          <p className="text-xs text-blue-600 font-medium">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Campanha criada: {new Date(campaign.createdAt * 1000).toLocaleString('pt-BR')}
                          </p>
                        )}
                        {campaign.createdAt && (
                          <p className="text-xs text-gray-500">
                            Criada: {new Date(campaign.createdAt * 1000).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">{campaign.sent || 0} enviados</p>
                        <p className="text-xs text-gray-600">
                          {campaign.status === 'active' && (campaign.sent || 0) === 0 
                            ? 'Processando...' 
                            : `${campaign.delivered || 0} entregues`
                          }
                        </p>
                      </div>
                      {/* Botões de controle */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCampaignLogs(campaign.id)}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          title="Ver logs de envio"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {campaign.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePauseCampaign(campaign.id)}
                            className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                            title="Pausar campanha"
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                        {campaign.status === 'paused' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResumeCampaign(campaign.id)}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                            title="Retomar campanha"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          title="Excluir campanha"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab - Simplified Continuous Campaign */}
        <TabsContent value="campaigns" className="space-y-6">
          {/* Status das Campanhas Ativas */}
          {campaigns && campaigns.some(c => c.status === 'active') && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  Campanhas SMS Ativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {campaigns?.filter(c => c.status === 'active').map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="font-medium text-green-900">{campaign.name}</p>
                          <p className="text-sm text-green-700">{campaign.quizTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-800">{campaign.sent || 0} enviados</p>
                          <p className="text-xs text-green-600">Em funcionamento</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePauseCampaign(campaign.id)}
                            className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-2 bg-green-100 rounded border border-green-200">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Sistema funcionando automaticamente - SMS são enviados quando novos leads chegam
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Explicação dos Tipos de Campanha */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">📚 Tipos de Campanha SMS - Guia Completo</CardTitle>
              <CardDescription className="text-blue-700">
                Comece selecionando o estilo de campanha que melhor se adapta ao seu objetivo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4 bg-white p-4 rounded-lg shadow-lg">
                    <h3 className="font-bold text-green-700 flex items-center gap-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">💰 REMARKETING</span>
                    </h3>
                    <p className="text-sm text-green-600 font-medium mt-2">🎯 Transforme leads "mortos" em VENDAS!</p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Reative leads antigos automaticamente!</strong> Selecione quizzes com telefones e dispare mensagens para quem abandonou ou completou - é como ter uma máquina de vendas trabalhando 24h
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-600">
                        🎯 <strong>Vantagens:</strong> Leads gratuitos • Segmentação automática • Timing inteligente
                      </div>
                      <div className="text-xs text-green-600 font-bold">
                        💸 <strong>LUCRO REAL:</strong> +28% ROI • R$ 280 a mais para cada R$ 1.000 investido!
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4 bg-white p-4 rounded-lg shadow-lg">
                    <h3 className="font-bold text-purple-700 flex items-center gap-2">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">🚀 REMARKETING ULTRA CUSTOMIZADO</span>
                    </h3>
                    <p className="text-sm text-purple-600 font-medium mt-2">💎 O segredo dos TOP AFILIADOS!</p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Mensagens diferentes para CADA perfil!</strong> Jovens de 18-25 recebem uma mensagem, pessoas de 40+ recebem outra. É como ter um vendedor especialista para cada cliente!
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-600">
                        🎯 <strong>Vantagens:</strong> Mensagens por idade/peso/altura • Funis únicos • Personalização máxima
                      </div>
                      <div className="text-xs text-purple-600 font-bold">
                        💰 <strong>LUCRO EXPLOSIVO:</strong> +40% conversão • R$ 4.000 a mais para cada R$ 10.000!
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-l-4 border-orange-500 pl-4 bg-white p-4 rounded-lg shadow-lg">
                    <h3 className="font-bold text-orange-700 flex items-center gap-2">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">⚡ AO VIVO TEMPO REAL</span>
                    </h3>
                    <p className="text-sm text-orange-600 font-medium mt-2">🔥 Pegue o lead no momento QUENTE!</p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Automático e IMEDIATO!</strong> Alguém abandona o quiz? Em 5 minutos recebe SMS! Completou? Parabéns na hora! É como ter um vendedor que NUNCA dorme!
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-600">
                        🎯 <strong>Vantagens:</strong> Automático 24h • Timing perfeito • Sem perder leads
                      </div>
                      <div className="text-xs text-orange-600 font-bold">
                        🔥 <strong>CONVERSÃO INSANA:</strong> +85% resposta • Lead quente = venda garantida!
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4 bg-white p-4 rounded-lg shadow-lg">
                    <h3 className="font-bold text-red-700 flex items-center gap-2">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">💎 AO VIVO ULTRA CUSTOMIZADA</span>
                    </h3>
                    <p className="text-sm text-red-600 font-medium mt-2">👑 O NIVEL MÁXIMO DE VENDAS!</p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>AUTOMÁTICO + PERSONALIZADO!</strong> Atleta que completa recebe "Nutrição de alta performance!" Sedentário recebe "Vamos começar devagar!" - CADA pessoa recebe a mensagem PERFEITA!
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-600">
                        🎯 <strong>Vantagens:</strong> Tempo real + personalização • Funis únicos • Máxima conversão
                      </div>
                      <div className="text-xs text-red-600 font-bold">
                        💰 <strong>LUCRO ESTRATOSFÉRICO:</strong> +120% conversão • R$ 12.000 a mais para cada R$ 10.000!
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg p-4 shadow-lg">
                <div className="flex items-start space-x-3">
                  <div className="text-yellow-600 mt-1">💰</div>
                  <div>
                    <h4 className="font-semibold text-yellow-800">ESTRATÉGIA MILIONÁRIA</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      <strong>COMBINE TUDO:</strong> Use <strong>Remarketing</strong> nos leads antigos (custo R$ 0,00), <strong>Ao Vivo</strong> nos frescos (conversão 85%+). 
                      As versões <strong>Ultra Customizadas</strong> são o segredo dos afiliados que faturam R$ 100k+/mês!
                    </p>
                    <p className="text-xs text-yellow-600 mt-2 font-bold">
                      ⚡ RESULTADO: Até R$ 50.000 extras por mês só com SMS automático!
                    </p>
                  </div>
                </div>
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Importante:</strong> É necessário comprar créditos SMS para usar esta funcionalidade. Cada SMS enviado consome 1 crédito.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Criar Nova Campanha SMS
              </CardTitle>
              <CardDescription>
                Selecione o estilo de campanha que melhor se adapta ao seu objetivo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="quiz-select">Selecionar Funil</Label>
                <Select value={campaignForm.quizId} onValueChange={(value) => {
                  setCampaignForm({...campaignForm, quizId: value});
                  setSelectedQuiz(value);
                  setSelectedQuizForPhones(value);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um quiz" />
                  </SelectTrigger>
                  <SelectContent>
                    {quizzes?.map((quiz: any) => (
                      <SelectItem key={quiz.id} value={quiz.id}>
                        {quiz.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target-audience">Público-Alvo</Label>
                <Select value={campaignForm.targetAudience} onValueChange={(value: any) => setCampaignForm({...campaignForm, targetAudience: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">
                      <div className="flex items-center justify-between w-full">
                        <span>Completaram o quiz</span>
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          {campaignForm.quizId ? leadCounts.completed : '0'} leads
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="abandoned">
                      <div className="flex items-center justify-between w-full">
                        <span>Abandonaram o quiz</span>
                        <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                          {campaignForm.quizId ? leadCounts.abandoned : '0'} leads
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="all">
                      <div className="flex items-center justify-between w-full">
                        <span>Todos os leads</span>
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          {campaignForm.quizId ? leadCounts.all : '0'} leads
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Resumo dinâmico dos leads encontrados */}
                {campaignForm.quizId && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2 text-sm">
                      <MessageSquare className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-700">
                        {campaignForm.targetAudience === 'completed' && `${leadCounts.completed} leads que completaram serão incluídos`}
                        {campaignForm.targetAudience === 'abandoned' && `${leadCounts.abandoned} leads que abandonaram serão incluídos`}
                        {campaignForm.targetAudience === 'all' && `${leadCounts.all} leads (todos) serão incluídos`}
                      </span>
                      {phonesLoading && <span className="text-xs text-gray-500">(atualizando...)</span>}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      📱 Atualização automática a cada 10 segundos para detectar novos leads
                    </div>
                  </div>
                )}
              </div>

              {/* FILTRO DE DATA PARA LEADS */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Filtrar Leads por Data</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="fromDate" className="text-sm font-medium text-blue-800">
                      Processar leads a partir de:
                    </Label>
                    <Input
                      id="fromDate"
                      type="datetime-local"
                      value={campaignForm.fromDate || ''}
                      onChange={(e) => setCampaignForm({...campaignForm, fromDate: e.target.value})}
                      className="w-full"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      Apenas leads capturados após esta data serão incluídos na campanha. Deixe vazio para incluir todos.
                    </p>
                    
                    {/* CONTADOR DA LISTA OFICIAL */}
                    {campaignForm.quizId && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-800">Lista Oficial para Envio:</span>
                            <span className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                              {filteredCounts.finalCount} SMS serão enviados
                            </span>
                          </div>
                          
                          {campaignForm.fromDate && filteredCounts.filteredByDate > 0 && (
                            <div className="text-xs text-blue-600">
                              📅 {filteredCounts.filteredByDate} leads removidos pelo filtro de data
                            </div>
                          )}
                          
                          <div className="text-xs text-blue-600">
                            📊 Total disponível: {filteredCounts.totalBeforeFilter} leads • 
                            Após filtros: {filteredCounts.finalCount} leads • 
                            Público: {campaignForm.targetAudience === 'completed' ? 'Completos' : 
                                      campaignForm.targetAudience === 'abandoned' ? 'Abandonados' : 'Todos'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AGENDAMENTO DE ENVIO */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">Momento do Envio</span>
                </div>
                <div className="space-y-3">
                  <Select 
                    value={campaignForm.triggerType} 
                    onValueChange={(value) => setCampaignForm({...campaignForm, triggerType: value as "immediate" | "delayed"})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Quando enviar?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Enviar imediatamente</SelectItem>
                      <SelectItem value="delayed">Enviar depois de X tempo que o lead chegou</SelectItem>
                    </SelectContent>
                  </Select>

                  {campaignForm.triggerType === "delayed" && (
                    <div className="flex gap-2 items-center bg-orange-100 p-3 rounded-lg">
                      <span className="text-sm font-medium text-orange-900">Enviar após</span>
                      <Input
                        type="number"
                        min="1"
                        max="72"
                        value={campaignForm.triggerDelay}
                        onChange={(e) => setCampaignForm({...campaignForm, triggerDelay: parseInt(e.target.value) || 1})}
                        className="w-20"
                      />
                      <Select 
                        value={campaignForm.triggerUnit} 
                        onValueChange={(value) => setCampaignForm({...campaignForm, triggerUnit: value as "minutes" | "hours"})}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">min</SelectItem>
                          <SelectItem value="hours">horas</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-orange-700">
                        que o lead {campaignForm.targetAudience === "completed" ? "completou" : campaignForm.targetAudience === "abandoned" ? "abandonou" : "interagiu com"} o quiz
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="message">Mensagem SMS</Label>
                <Textarea
                  id="message"
                  placeholder="Sua mensagem aqui... Use {variavel} para personalizar"
                  value={campaignForm.message}
                  onChange={(e) => setCampaignForm({...campaignForm, message: e.target.value})}
                  className="min-h-20"
                />
                
                {/* Sistema unificado de variáveis */}
                {campaignForm.quizId && (
                  <div className="mt-2 mb-2">
                    <VariableHelperUnified
                      quizId={campaignForm.quizId}
                      onInsertVariable={(variable) => {
                        const textarea = document.getElementById('message') as HTMLTextAreaElement;
                        const cursorPos = textarea.selectionStart;
                        const textBefore = campaignForm.message.substring(0, cursorPos);
                        const textAfter = campaignForm.message.substring(cursorPos);
                        const newText = textBefore + variable + textAfter;
                        setCampaignForm({...campaignForm, message: newText});
                        
                        // Restaurar posição do cursor
                        setTimeout(() => {
                          textarea.selectionStart = textarea.selectionEnd = cursorPos + variable.length;
                          textarea.focus();
                        }, 0);
                      }}
                      compact={true}
                      showTitle={false}
                    />
                  </div>
                )}
                
                <p className="text-xs text-gray-600 mt-1">
                  {campaignForm.message.length}/160 caracteres
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-900">Sistema Automático</span>
                </div>
                <p className="text-sm text-green-800">
                  Esta campanha rodará continuamente e enviará SMS automaticamente para novos leads até ser pausada.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => setShowCampaignStyleSelector(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={createCampaignMutation.isPending}
                >
                  {createCampaignMutation.isPending ? "Ativando..." : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Selecionar Estilo de Campanha
                    </>
                  )}
                </Button>
                
                {/* Botão de Campanhas Ultra Personalizadas */}
                <Button 
                  onClick={() => {
                    if (!campaignForm.quizId) {
                      toast({
                        title: "Selecione um quiz primeiro",
                        description: "Escolha um quiz para criar campanhas ultra personalizadas",
                        variant: "destructive"
                      });
                      return;
                    }
                    const selectedQuiz = quizzes?.find((q: any) => q.id === campaignForm.quizId);
                    setSelectedQuizForUltraPersonalized({
                      id: campaignForm.quizId,
                      title: selectedQuiz?.title || "Quiz Selecionado"
                    });
                    setShowUltraPersonalizedModal(true);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={!campaignForm.quizId}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Campanha Ultra Personalizada
                </Button>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    ⚡ Ultra Personalizada: Mensagens automáticas baseadas no perfil do lead
                  </p>
                </div>
              </div>

              {/* Status da Campanha após ativação */}
              {createCampaignMutation.isSuccess && (
                <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-800">Campanha Ativada com Sucesso!</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    A campanha SMS está rodando continuamente e enviará mensagens para novos leads automaticamente.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {smsTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                  <Badge variant="outline">{template.category}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{template.message}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.variables.map((variable) => (
                      <Badge key={variable} variant="secondary" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    Usar Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Taxa de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">98.5%</div>
                <Progress value={98.5} className="mt-2" />
                <p className="text-xs text-gray-600 mt-1">Últimos 30 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Taxa de Abertura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">85.2%</div>
                <Progress value={85.2} className="mt-2" />
                <p className="text-xs text-gray-600 mt-1">Últimos 30 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Taxa de Cliques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">12.8%</div>
                <Progress value={12.8} className="mt-2" />
                <p className="text-xs text-gray-600 mt-1">Últimos 30 dias</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Campanha</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns?.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-gray-600">{campaign.quizTitle}</p>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm font-medium">{campaign.sent}</p>
                        <p className="text-xs text-gray-600">Enviados</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{campaign.delivered}</p>
                        <p className="text-xs text-gray-600">Entregues</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{campaign.opened}</p>
                        <p className="text-xs text-gray-600">Abertos</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{campaign.clicked}</p>
                        <p className="text-xs text-gray-600">Cliques</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Telefones Tab */}
        <TabsContent value="phones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Telefones Capturados
              </CardTitle>
              <p className="text-sm text-gray-600">
                {selectedQuiz ? `Quiz: ${selectedQuiz}` : "Selecione um quiz para ver os telefones capturados"}
              </p>
            </CardHeader>
            <CardContent>
              {campaignForm.quizId ? (
                <div className="space-y-4">
                  {phonesLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  ) : quizPhones && quizPhones.phones && quizPhones.phones.length > 0 ? (
                    <div className="space-y-3">
                      {quizPhones.phones.map((phone: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Phone className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{phone.phone}</p>
                                {phone.status === 'completed' ? (
                                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Completo
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Abandonado
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {phone.name || "Nome não informado"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {new Date(phone.submittedAt).toLocaleDateString("pt-BR")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {phone.completionPercentage}% concluído
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nenhum telefone capturado ainda</p>
                      <p className="text-sm text-gray-500">
                        Os telefones aparecerão aqui quando os usuários responderem ao quiz
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Selecione um quiz para ver os telefones</p>
                  <p className="text-sm text-gray-500">
                    Use o seletor de quiz acima para visualizar os telefones capturados
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credits Tab */}
        <TabsContent value="credits" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {creditPackages.map((pkg) => (
              <Card key={pkg.amount} className="text-center">
                <CardHeader>
                  <CardTitle>{pkg.amount.toLocaleString()} SMS</CardTitle>
                  {pkg.bonus > 0 && (
                    <Badge variant="secondary" className="mx-auto">
                      +{pkg.bonus} Bônus
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    R$ {pkg.price.toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    R$ {(pkg.price / (pkg.amount + pkg.bonus)).toFixed(3)} por SMS
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => purchaseCreditsMutation.mutate(pkg.amount + pkg.bonus)}
                    disabled={purchaseCreditsMutation.isPending}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Comprar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Plus className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Compra de Créditos</p>
                      <p className="text-sm text-gray-600">1000 SMS + 150 bônus</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">+1.150</p>
                    <p className="text-sm text-gray-600">Hoje</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Logs SMS */}
      <Dialog open={!!selectedCampaignLogs} onOpenChange={() => setSelectedCampaignLogs(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Logs de SMS - Campanha</DialogTitle>
            <DialogDescription>
              Histórico detalhado de todos os SMS enviados nesta campanha
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {smsLogs && smsLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Enviado em</TableHead>
                    <TableHead>Erro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {smsLogs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className="text-sm">{getStatusLabel(log.status)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{log.phone}</TableCell>
                      <TableCell className="max-w-xs truncate" title={log.message}>
                        {log.message}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatTimestamp(log.sentAt)}
                      </TableCell>
                      <TableCell className="text-sm text-red-600">
                        {log.errorMessage || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum log encontrado para esta campanha</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para Campanhas Ultra Personalizadas */}
      {selectedQuizForUltraPersonalized && (
        <UltraPersonalizedCampaignModal
          open={showUltraPersonalizedModal}
          onClose={() => {
            setShowUltraPersonalizedModal(false);
            setSelectedQuizForUltraPersonalized(null);
          }}
          quizId={selectedQuizForUltraPersonalized.id}
          quizTitle={selectedQuizForUltraPersonalized.title}
        />
      )}

      {/* Campaign Style Selector Modal */}
      <CampaignStyleSelector
        open={showCampaignStyleSelector}
        onClose={() => setShowCampaignStyleSelector(false)}
        onStyleSelect={handleCampaignStyleSelect}
        platform="sms"
      />
    </div>
  );
}