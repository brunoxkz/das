import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth-hybrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, Send, DollarSign, FileText, Plus, Eye, Clock, Users, CheckCircle, XCircle, Phone, Search, AlertCircle, Edit, CreditCard, Pause, Play, Trash2, Clock3 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

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
    triggerType: "immediate",
    triggerDelay: 1,
    triggerUnit: "hours",
    fromDate: "",
    scheduledDateTime: ""
  });
  const [selectedQuizForPhones, setSelectedQuizForPhones] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [selectedCampaignLogs, setSelectedCampaignLogs] = useState<string | null>(null);

  // Fetch user's SMS credits
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
    }
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

  // Fetch SMS campaigns
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
      return response.json();
    },
    staleTime: 0, // Force fresh data
    cacheTime: 0  // No cache
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
    enabled: !!campaignForm.quizId
  });

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

  const handleCreateCampaign = () => {
    console.log("🔍 VALORES DO FORMULÁRIO:", {
      message: campaignForm.message,
      quizId: campaignForm.quizId,
      targetAudience: campaignForm.targetAudience,
      triggerType: campaignForm.triggerType,
      scheduledDateTime: campaignForm.scheduledDateTime,
      messageLength: campaignForm.message?.length,
      messageEmpty: !campaignForm.message,
      quizIdEmpty: !campaignForm.quizId,
      targetAudienceEmpty: !campaignForm.targetAudience
    });
    
    // Validações obrigatórias
    if (!campaignForm.message || !campaignForm.quizId || !campaignForm.targetAudience) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Validação obrigatória para data/hora quando tipo é 'scheduled'
    if (campaignForm.triggerType === "scheduled" && !campaignForm.scheduledDateTime) {
      toast({
        title: "Erro",
        description: "A data e hora do agendamento são obrigatórias",
        variant: "destructive"
      });
      return;
    }

    // Validação se data/hora está no futuro (mínimo 5 minutos)
    if (campaignForm.triggerType === "scheduled" && campaignForm.scheduledDateTime) {
      const scheduledTime = new Date(campaignForm.scheduledDateTime);
      const now = new Date();
      const minTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutos no futuro
      
      if (scheduledTime < minTime) {
        toast({
          title: "Erro",
          description: "A data/hora deve ser pelo menos 5 minutos no futuro",
          variant: "destructive"
        });
        return;
      }
    }

    // Gerar o nome automaticamente baseado no quiz selecionado
    const selectedQuiz = quizzes?.find((q: any) => q.id === campaignForm.quizId);
    const campaignName = `Sistema Contínuo - ${selectedQuiz?.title || 'Quiz'}`;

    createCampaignMutation.mutate({
      ...campaignForm,
      name: campaignName
    });
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
          <h1 className="text-3xl font-bold text-gray-900">Remarketing SMS</h1>
          <p className="text-gray-600">Gerencie seus créditos SMS e campanhas de remarketing</p>
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
        </div>
      </div>

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
                        {campaign.status === 'draft' && campaign.scheduledAt && (
                          <p className="text-xs text-blue-600 font-medium">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Agendada para: {new Date(campaign.scheduledAt * 1000).toLocaleString('pt-BR')}
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Sistema de Envio Contínuo
              </CardTitle>
              <CardDescription>
                Configure um sistema que envia SMS automaticamente quando novos leads chegam
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
                    <SelectItem value="completed">Completaram o quiz</SelectItem>
                    <SelectItem value="abandoned">Abandonaram o quiz</SelectItem>
                    <SelectItem value="all">Todos os leads</SelectItem>
                  </SelectContent>
                </Select>
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
                
                {/* Barra horizontal de variáveis dinâmicas */}
                {campaignForm.quizId && (
                  <div className="mt-2 mb-2">
                    <p className="text-xs text-gray-700 mb-2 font-medium">Variáveis disponíveis para personalização:</p>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                      {(() => {
                        const selectedQuiz = quizzes?.find((q: any) => q.id === campaignForm.quizId);
                        if (!selectedQuiz?.structure) return null;
                        
                        const variables = new Set<string>();
                        
                        // Extrair variáveis das páginas
                        const pages = selectedQuiz.structure.pages || [];
                        pages.forEach((page: any) => {
                          if (page.elements) {
                            page.elements.forEach((element: any) => {
                              if (element.fieldId && element.fieldId.trim()) {
                                variables.add(element.fieldId.trim());
                              }
                            });
                          }
                        });
                        
                        // Adicionar variáveis padrão do sistema
                        variables.add('nome');
                        variables.add('telefone');
                        variables.add('email');
                        variables.add('quiz_titulo');
                        
                        const variableArray = Array.from(variables).sort();
                        
                        return variableArray.map((variable) => (
                          <button
                            key={variable}
                            type="button"
                            onClick={() => {
                              const textarea = document.getElementById('message') as HTMLTextAreaElement;
                              const cursorPos = textarea.selectionStart;
                              const textBefore = campaignForm.message.substring(0, cursorPos);
                              const textAfter = campaignForm.message.substring(cursorPos);
                              const newText = textBefore + `{${variable}}` + textAfter;
                              setCampaignForm({...campaignForm, message: newText});
                              
                              // Restaurar posição do cursor
                              setTimeout(() => {
                                textarea.selectionStart = textarea.selectionEnd = cursorPos + variable.length + 2;
                                textarea.focus();
                              }, 0);
                            }}
                            className="flex-shrink-0 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded-md border border-blue-200 transition-colors whitespace-nowrap"
                          >
                            {variable}
                          </button>
                        ));
                      })()}
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-600 mt-1">
                  {campaignForm.message.length}/160 caracteres
                </p>
              </div>

              <div className="space-y-3">
                <Label>Momento do Envio</Label>
                <Select 
                  value={campaignForm.triggerType} 
                  onValueChange={(value) => setCampaignForm({...campaignForm, triggerType: value as "immediate" | "delayed"})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione quando enviar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Enviar imediatamente</SelectItem>
                    <SelectItem value="delayed">Enviar depois de X tempo</SelectItem>
                    <SelectItem value="scheduled">Agendar para data/hora específica</SelectItem>
                  </SelectContent>
                </Select>

                {campaignForm.triggerType === "delayed" && (
                  <div className="flex gap-2 items-center bg-blue-50 p-3 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Enviar após</span>
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
                    <span className="text-sm text-blue-700">
                      {campaignForm.targetAudience === "completed" ? "após completar" : "após abandonar"} o quiz
                    </span>
                  </div>
                )}

                {campaignForm.triggerType === "scheduled" && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Agendar envio para:</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="scheduledDate" className="text-sm font-medium text-purple-800">
                          Data e Hora *
                        </Label>
                        <Input
                          id="scheduledDate"
                          type="datetime-local"
                          value={campaignForm.scheduledDateTime || ''}
                          onChange={(e) => setCampaignForm({...campaignForm, scheduledDateTime: e.target.value})}
                          min={new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)} // Mínimo 5 minutos a partir de agora
                          className="w-full"
                          required
                        />
                        <p className="text-xs text-purple-600 mt-1">
                          A campanha será enviada exatamente na data/hora especificada
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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

              <Button 
                onClick={handleCreateCampaign} 
                className="w-full"
                disabled={createCampaignMutation.isPending}
              >
                {createCampaignMutation.isPending ? "Ativando..." : "Ativar Sistema Contínuo"}
              </Button>

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
    </div>
  );
}