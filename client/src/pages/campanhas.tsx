import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Send, Phone, Users, Search, Plus, Eye, Clock, CheckCircle, XCircle, AlertCircle, Edit, Copy, Trash2, PlayCircle, PauseCircle, BarChart3, Filter, Download, MessageCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface SMSCampaign {
  id: string;
  name: string;
  quizId: string;
  quizTitle: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  message: string;
  scheduledDate?: string;
  targetAudience: 'all' | 'completed' | 'abandoned';
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  replies: number;
  createdAt: string;
  estimatedReach?: number;
}

interface PhoneContact {
  phone: string;
  name: string;
  email?: string;
  quizId: string;
  quizTitle: string;
  status: 'completed' | 'abandoned';
  lastActivity: string;
  responses?: any[];
}

export default function CampanhasPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [campaignDialog, setCampaignDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<SMSCampaign | null>(null);
  const [phoneDialog, setPhoneDialog] = useState(false);

  const [campaignForm, setCampaignForm] = useState({
    name: "",
    message: "",
    scheduledDate: "",
    targetAudience: "completed" as const,
    quizId: "",
    triggerType: "immediate" as const,
    triggerDelay: 1,
    triggerUnit: "hours" as const
  });

  // Fetch user's quizzes
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
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    },
  });

  // Fetch SMS campaigns
  const { data: campaigns, isLoading: campaignLoading } = useQuery<SMSCampaign[]>({
    queryKey: ["/api/sms-campaigns"],
    queryFn: async () => {
      // Mock data for now - replace with real API
      return [
        {
          id: "camp1",
          name: "Follow-up Quiz Nutrição",
          quizId: "quiz1",
          quizTitle: "Quiz de Avaliação Nutricional",
          status: "active",
          message: "Oi {{nome}}! Obrigado por completar nosso quiz. Baseado no seu resultado, temos uma oferta especial!",
          targetAudience: "completed",
          sent: 127,
          delivered: 124,
          opened: 89,
          clicked: 23,
          replies: 8,
          createdAt: "2025-01-06T10:00:00Z",
          estimatedReach: 156
        },
        {
          id: "camp2",
          name: "Recuperação de Abandonos",
          quizId: "quiz2",
          quizTitle: "Quiz de Perfil Fitness",
          status: "paused",
          message: "Que tal terminar nosso quiz? São só mais 2 minutos! Complete agora: {{link}}",
          targetAudience: "abandoned",
          sent: 45,
          delivered: 43,
          opened: 32,
          clicked: 12,
          replies: 3,
          createdAt: "2025-01-05T14:00:00Z",
          estimatedReach: 78
        }
      ];
    }
  });

  // Fetch phone numbers for selected quiz
  const { data: quizPhones, isLoading: phonesLoading } = useQuery<any>({
    queryKey: ["/api/quiz-phones", selectedQuiz],
    queryFn: async () => {
      if (!selectedQuiz) return { phones: [] };
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/quiz-phones/${selectedQuiz}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch quiz phones");
      return response.json();
    },
    enabled: !!selectedQuiz
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
      setCampaignDialog(false);
      setCampaignForm({
        name: "",
        message: "",
        scheduledDate: "",
        targetAudience: "completed",
        quizId: "",
        triggerType: "immediate",
        triggerDelay: 1,
        triggerUnit: "hours"
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Ativa", variant: "default" as const, icon: PlayCircle },
      paused: { label: "Pausada", variant: "secondary" as const, icon: PauseCircle },
      completed: { label: "Concluída", variant: "outline" as const, icon: CheckCircle },
      draft: { label: "Rascunho", variant: "destructive" as const, icon: Edit }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredPhones = quizPhones?.phones?.filter((phone: any) => 
    phone.phone.toLowerCase().includes(phoneSearch.toLowerCase()) ||
    phone.name?.toLowerCase().includes(phoneSearch.toLowerCase())
  ) || [];

  if (quizzesLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Campanhas SMS</h1>
          <p className="text-gray-600">Gerencie suas campanhas de remarketing via SMS</p>
        </div>
        <div className="flex items-center space-x-4">
          <Dialog open={campaignDialog} onOpenChange={setCampaignDialog}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Campanha
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Campanha SMS</DialogTitle>
                <DialogDescription>
                  Configure sua campanha de remarketing via SMS
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Campanha</Label>
                    <Input
                      id="name"
                      value={campaignForm.name}
                      onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                      placeholder="Ex: Follow-up Quiz Nutrição"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quiz">Selecionar Quiz</Label>
                    <Select 
                      value={campaignForm.quizId} 
                      onValueChange={(value) => setCampaignForm({...campaignForm, quizId: value})}
                    >
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    value={campaignForm.message}
                    onChange={(e) => setCampaignForm({...campaignForm, message: e.target.value})}
                    placeholder="Olá {{nome}}! Obrigado por completar nosso quiz..."
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-gray-500">
                    Use variáveis: {"{nome}"} {"{email}"} {"{resultado}"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="audience">Público-alvo</Label>
                    <Select 
                      value={campaignForm.targetAudience} 
                      onValueChange={(value: any) => setCampaignForm({...campaignForm, targetAudience: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Leads que Completaram</SelectItem>
                        <SelectItem value="abandoned">Leads que Abandonaram</SelectItem>
                        <SelectItem value="all">Todos os Leads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trigger">Tipo de Envio</Label>
                    <Select 
                      value={campaignForm.triggerType} 
                      onValueChange={(value: any) => setCampaignForm({...campaignForm, triggerType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Imediato</SelectItem>
                        <SelectItem value="delayed">Após Delay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {campaignForm.triggerType === "delayed" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="delay">Delay</Label>
                      <Input
                        id="delay"
                        type="number"
                        value={campaignForm.triggerDelay}
                        onChange={(e) => setCampaignForm({...campaignForm, triggerDelay: parseInt(e.target.value) || 1})}
                        min="1"
                        max="72"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unidade</Label>
                      <Select 
                        value={campaignForm.triggerUnit} 
                        onValueChange={(value: any) => setCampaignForm({...campaignForm, triggerUnit: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutos</SelectItem>
                          <SelectItem value="hours">Horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setCampaignDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateCampaign} className="bg-green-600 hover:bg-green-700">
                    Criar Campanha
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <MessageSquare className="w-5 h-5" />
            Sistema Inteligente de Remarketing SMS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">📱 Captura Automática</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Detecta automaticamente campos de telefone nos quizzes</li>
                <li>• Sincronização em tempo real das respostas</li>
                <li>• Validação e formatação automática dos números</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">🎯 Segmentação Inteligente</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Leads que completaram o quiz</li>
                <li>• Leads que abandonaram no meio</li>
                <li>• Filtros por quiz específico</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">⚡ Automação Avançada</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Envio imediato ou com delay configurável</li>
                <li>• Templates personalizáveis com variáveis</li>
                <li>• Métricas de entrega e conversão</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="phones">Telefones</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  Campanhas Ativas
                </CardTitle>
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
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  SMS Enviados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {campaigns?.reduce((sum, c) => sum + c.sent, 0) || 0}
                </div>
                <p className="text-xs text-gray-600 mt-1">Este mês</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Taxa de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {campaigns?.length ? Math.round((campaigns.reduce((sum, c) => sum + c.delivered, 0) / campaigns.reduce((sum, c) => sum + c.sent, 0)) * 100) : 0}%
                </div>
                <p className="text-xs text-gray-600 mt-1">Média geral</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-purple-600" />
                  Taxa de Resposta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {campaigns?.length ? Math.round((campaigns.reduce((sum, c) => sum + c.replies, 0) / campaigns.reduce((sum, c) => sum + c.sent, 0)) * 100) : 0}%
                </div>
                <p className="text-xs text-gray-600 mt-1">Engagement</p>
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
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        campaign.status === 'active' ? 'bg-green-500' : 
                        campaign.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-gray-600">{campaign.quizTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(campaign.status)}
                      <div className="text-right">
                        <p className="text-sm font-medium">{campaign.sent} enviados</p>
                        <p className="text-xs text-gray-600">{campaign.replies} respostas</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Campanhas</CardTitle>
              <CardDescription>Gerencie suas campanhas SMS</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campanha</TableHead>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Alcance</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns?.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-gray-600 truncate max-w-xs">{campaign.message}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{campaign.quizTitle}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(campaign.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{campaign.sent} / {campaign.estimatedReach || campaign.sent}</p>
                          <p className="text-gray-600">Enviados / Total</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Entrega</span>
                            <span>{Math.round((campaign.delivered / campaign.sent) * 100)}%</span>
                          </div>
                          <Progress value={(campaign.delivered / campaign.sent) * 100} className="h-1" />
                          <div className="flex justify-between text-xs">
                            <span>Resposta</span>
                            <span>{Math.round((campaign.replies / campaign.sent) * 100)}%</span>
                          </div>
                          <Progress value={(campaign.replies / campaign.sent) * 100} className="h-1" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phones Tab */}
        <TabsContent value="phones" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Telefones Capturados</CardTitle>
                  <CardDescription>Visualize todos os telefones coletados dos quizzes</CardDescription>
                </div>
                <div className="flex items-center space-x-4">
                  <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filtrar por quiz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os quizzes</SelectItem>
                      {quizzes?.map((quiz: any) => (
                        <SelectItem key={quiz.id} value={quiz.id}>
                          {quiz.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar telefone ou nome..."
                      value={phoneSearch}
                      onChange={(e) => setPhoneSearch(e.target.value)}
                      className="pl-10 w-[250px]"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {phonesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPhones.length === 0 ? (
                    <div className="text-center py-8">
                      <Phone className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">
                        {selectedQuiz ? "Nenhum telefone encontrado para este quiz" : "Selecione um quiz para ver os telefones"}
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contato</TableHead>
                          <TableHead>Quiz</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Última Atividade</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPhones.map((contact: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{contact.phone}</p>
                                {contact.name && (
                                  <p className="text-sm text-gray-600">{contact.name}</p>
                                )}
                                {contact.email && (
                                  <p className="text-xs text-gray-500">{contact.email}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{contact.quizTitle}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={contact.status === 'completed' ? 'default' : 'secondary'}>
                                {contact.status === 'completed' ? 'Completo' : 'Abandonado'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-gray-600">{contact.lastActivity}</p>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button variant="ghost" size="sm">
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance das Campanhas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns?.map((campaign) => (
                    <div key={campaign.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-gray-600">{campaign.sent} enviados</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-gray-600">Entregues</p>
                          <p className="font-semibold text-green-600">{Math.round((campaign.delivered / campaign.sent) * 100)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Visualizados</p>
                          <p className="font-semibold text-blue-600">{Math.round((campaign.opened / campaign.sent) * 100)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Respostas</p>
                          <p className="font-semibold text-purple-600">{Math.round((campaign.replies / campaign.sent) * 100)}%</p>
                        </div>
                      </div>
                      <Progress value={(campaign.delivered / campaign.sent) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total de Campanhas</span>
                    <span className="font-semibold">{campaigns?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">SMS Enviados (Total)</span>
                    <span className="font-semibold">{campaigns?.reduce((sum, c) => sum + c.sent, 0) || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Taxa Média de Entrega</span>
                    <span className="font-semibold text-green-600">
                      {campaigns?.length ? Math.round((campaigns.reduce((sum, c) => sum + c.delivered, 0) / campaigns.reduce((sum, c) => sum + c.sent, 0)) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Taxa Média de Resposta</span>
                    <span className="font-semibold text-purple-600">
                      {campaigns?.length ? Math.round((campaigns.reduce((sum, c) => sum + c.replies, 0) / campaigns.reduce((sum, c) => sum + c.sent, 0)) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Telefones Únicos</span>
                    <span className="font-semibold">{quizPhones?.phones?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}