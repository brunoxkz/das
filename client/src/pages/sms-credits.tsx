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
import { MessageSquare, Send, DollarSign, FileText, Plus, Eye, Clock, Users, CheckCircle, XCircle, Phone, Search, AlertCircle, Edit, CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [campaignForm, setCampaignForm] = useState<{
    name: string;
    message: string;
    targetAudience: "completed" | "abandoned" | "all";
    quizId: string;
    triggerType: "immediate" | "delayed";
    triggerDelay: number;
    triggerUnit: "hours" | "minutes";
  }>({
    name: "",
    message: "",
    targetAudience: "completed",
    quizId: "",
    triggerType: "immediate",
    triggerDelay: 1,
    triggerUnit: "hours"
  });
  const [selectedQuizForPhones, setSelectedQuizForPhones] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");

  // Fetch user's SMS credits
  const { data: smsCredits, isLoading: creditsLoading } = useQuery<SMSCredits>({
    queryKey: ["/api/sms-credits"],
    queryFn: async () => {
      const response = await fetch("/api/sms-credits");
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
      const response = await fetch("/api/sms-campaigns");
      if (!response.ok) throw new Error("Failed to fetch SMS campaigns");
      return response.json();
    }
  });

  // Fetch SMS templates
  const { data: templates, isLoading: templatesLoading } = useQuery<SMSTemplate[]>({
    queryKey: ["/api/sms-templates"],
    queryFn: async () => {
      const response = await fetch("/api/sms-templates");
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
      const response = await fetch("/api/sms-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaign)
      });
      if (!response.ok) throw new Error("Failed to create campaign");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sms-campaigns"] });
      toast({
        title: "Campanha SMS Criada",
        description: "Sua campanha foi criada com sucesso!"
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
    }
  });

  // Send SMS campaign mutation
  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await fetch(`/api/sms-campaigns/${campaignId}/send`, {
        method: "POST"
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
    if (!campaignForm.name || !campaignForm.message || !campaignForm.quizId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    createCampaignMutation.mutate(campaignForm);
  };

  const handleSendCampaign = (campaignId: string) => {
    sendCampaignMutation.mutate(campaignId);
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
                {campaigns?.slice(0, 5).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        campaign.status === 'active' ? 'bg-green-500' : 
                        campaign.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-gray-600">{campaign.quizTitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{campaign.sent} enviados</p>
                      <p className="text-xs text-gray-600">{campaign.delivered} entregues</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab - Simplified Continuous Campaign */}
        <TabsContent value="campaigns" className="space-y-6">
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
                  placeholder="Sua mensagem aqui..."
                  value={campaignForm.message}
                  onChange={(e) => setCampaignForm({...campaignForm, message: e.target.value})}
                  className="min-h-20"
                />
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
                              <p className="font-medium">{phone.phone}</p>
                              <p className="text-sm text-gray-600">
                                {phone.name || "Nome não informado"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {new Date(phone.submittedAt).toLocaleDateString("pt-BR")}
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
    </div>
  );
}