import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Send, 
  Calendar, 
  Users, 
  BarChart3, 
  TrendingUp,
  Eye,
  MousePointer,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Filter,
  Download,
  Sparkles,
  Target,
  Zap,
  X,
  Code,
  Wand2,
  Settings,
  TestTube,
  Copy,
  Plus,
  Trash2,
  Edit3,
  FileText,
  Palette,
  Tag,
  ShoppingCart,
  Heart,
  Star,
  MessageCircle,
  ArrowRight,
  Zap as ZapIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth-jwt";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent' | 'active';
  quizId: string;
  quizTitle: string;
  emailCount: number;
  sentCount: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
  sentAt?: string;
  scheduledAt?: string;
}

interface EmailAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  bounceRate: number;
  unsubscribeRate: number;
  avgOpenRate: number;
  avgClickRate: number;
  topPerformingCampaigns: Array<{
    name: string;
    openRate: number;
    clickRate: number;
  }>;
  recentActivity: Array<{
    type: 'sent' | 'opened' | 'clicked';
    email: string;
    campaignName: string;
    timestamp: string;
  }>;
}

export default function AdvancedEmailMarketing() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("campaigns");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    quizId: "",
    subject: "",
    content: "",
    targetAudience: "completed" as "completed" | "abandoned" | "all",
    triggerType: "immediate" as "immediate" | "delayed",
    triggerDelay: 1,
    triggerUnit: "hours" as "hours" | "minutes" | "days",
    templateId: "",
    abTestEnabled: false,
    abTestSubject: "",
    personalizedVariables: [] as string[]
  });

  const [selectedQuizForPreview, setSelectedQuizForPreview] = useState<any>(null);
  const [availableVariables, setAvailableVariables] = useState<string[]>([]);
  const [emailTemplates] = useState([
    { id: "welcome", name: "Boas-vindas", category: "welcome", content: "Olá {{nome}}, bem-vindo!" },
    { id: "follow_up", name: "Follow-up", category: "follow_up", content: "Oi {{nome}}, vamos continuar?" },
    { id: "promotion", name: "Promoção", category: "promotion", content: "{{nome}}, oferta especial!" },
    { id: "abandoned", name: "Carrinho Abandonado", category: "abandoned_cart", content: "{{nome}}, você esqueceu algo!" }
  ]);

  // Fetch email campaigns usando o mesmo endpoint que funciona
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/email-campaigns"],
    enabled: isAuthenticated,
  });

  // Fetch quizzes para o dropdown
  const { data: quizzes = [] } = useQuery({
    queryKey: ["/api/quizzes"],
    enabled: isAuthenticated,
  });

  // Mutation para criar campanha
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      return await apiRequest("/api/email-campaigns", {
        method: "POST",
        body: JSON.stringify(campaignData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-campaigns"] });
      setShowNewCampaignModal(false);
      setNewCampaign({
        name: "",
        quizId: "",
        subject: "",
        content: "",
        targetAudience: "completed",
        triggerType: "immediate",
        triggerDelay: 1,
        triggerUnit: "hours"
      });
      toast({
        title: "Campanha criada com sucesso!",
        description: "Sua campanha de email foi criada e está sendo processada.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar campanha",
        description: error.message || "Ocorreu um erro ao criar a campanha.",
        variant: "destructive",
      });
    },
  });

  // Mock analytics data
  const analytics = {
    totalSent: 1250,
    totalDelivered: 1198,
    totalOpened: 485,
    avgOpenRate: 38.5,
    avgClickRate: 12.3,
    topPerformingCampaigns: [
      { name: "Campanha Promocional", openRate: 45.2, clickRate: 15.8 },
      { name: "Newsletter Semanal", openRate: 42.1, clickRate: 13.5 },
      { name: "Oferta Especial", openRate: 38.9, clickRate: 11.2 },
    ],
    recentActivity: [
      { type: "opened", email: "user@example.com", campaignName: "Campanha Promocional", timestamp: "2 min atrás" },
      { type: "clicked", email: "cliente@email.com", campaignName: "Newsletter Semanal", timestamp: "5 min atrás" },
      { type: "sent", email: "lead@teste.com", campaignName: "Oferta Especial", timestamp: "8 min atrás" },
    ]
  };

  // Filter campaigns based on status and search
  const filteredCampaigns = campaigns.filter((campaign: EmailCampaign) => {
    const matchesStatus = filterStatus === "all" || campaign.status === filterStatus;
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Real-time stats calculations
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((c: EmailCampaign) => c.status === 'active').length;
  const totalEmailsSent = campaigns.reduce((sum: number, c: EmailCampaign) => sum + (c.sentCount || 0), 0);
  const avgOpenRate = campaigns.length > 0 ? 
    Math.round(campaigns.reduce((sum: number, c: EmailCampaign) => sum + (c.openRate || 0), 0) / campaigns.length) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.quizId || !newCampaign.subject || !newCampaign.content) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    createCampaignMutation.mutate(newCampaign);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Marketing Avançado</h1>
            <p className="text-gray-600">Campanhas inteligentes com analytics detalhados</p>
          </div>
          <Button 
            onClick={() => setShowNewCampaignModal(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            <Mail className="w-4 h-4 mr-2" />
            Nova Campanha
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Campanhas</p>
                  <p className="text-2xl font-bold text-blue-900">{totalCampaigns}</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-full">
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Campanhas Ativas</p>
                  <p className="text-2xl font-bold text-purple-900">{activeCampaigns}</p>
                </div>
                <div className="bg-purple-500 p-3 rounded-full">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Emails Enviados</p>
                  <p className="text-2xl font-bold text-green-900">{totalEmailsSent.toLocaleString()}</p>
                </div>
                <div className="bg-green-500 p-3 rounded-full">
                  <Send className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Taxa de Abertura</p>
                  <p className="text-2xl font-bold text-orange-900">{avgOpenRate}%</p>
                </div>
                <div className="bg-orange-500 p-3 rounded-full">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Buscar campanhas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="sent">Enviado</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campaigns List */}
          <div className="space-y-4">
            {campaignsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <Card className="p-12 text-center">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma campanha encontrada</h3>
                <p className="text-gray-600">Crie sua primeira campanha de email marketing.</p>
              </Card>
            ) : (
              filteredCampaigns.map((campaign: EmailCampaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Assunto:</strong> {campaign.subject}
                        </p>
                        <p className="text-sm text-gray-600 mb-3">
                          <strong>Quiz:</strong> {campaign.quizTitle}
                        </p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {campaign.emailCount} emails
                          </div>
                          <div className="flex items-center gap-1">
                            <Send className="w-4 h-4" />
                            {campaign.sentCount} enviados
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {campaign.openRate}% abertura
                          </div>
                          <div className="flex items-center gap-1">
                            <MousePointer className="w-4 h-4" />
                            {campaign.clickRate}% cliques
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-2">
                          Criado em {formatDate(campaign.createdAt)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                          <Button size="sm" variant="outline">
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Analytics
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {false ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Emails Enviados</span>
                      <span className="font-semibold">{analytics?.totalSent?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taxa de Entrega</span>
                      <span className="font-semibold text-green-600">
                        {analytics?.totalSent > 0 ? 
                          Math.round((analytics?.totalDelivered / analytics?.totalSent) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taxa de Abertura</span>
                      <span className="font-semibold text-blue-600">{analytics?.avgOpenRate || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taxa de Cliques</span>
                      <span className="font-semibold text-purple-600">{analytics?.avgClickRate || 0}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Campanhas Top
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics?.topPerformingCampaigns?.map((campaign, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{campaign.name}</p>
                          <p className="text-xs text-gray-600">
                            {campaign.openRate}% abertura • {campaign.clickRate}% cliques
                          </p>
                        </div>
                        <Badge variant="secondary">#{index + 1}</Badge>
                      </div>
                    )) || (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Nenhuma campanha encontrada
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Template cards would go here */}
            <Card className="p-6 text-center">
              <Sparkles className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Templates Inteligentes</h3>
              <p className="text-gray-600 mb-4">
                Biblioteca de templates otimizados para conversão
              </p>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                Explorar Templates
              </Button>
            </Card>
            {emailTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-600">{template.content}</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setNewCampaign(prev => ({ ...prev, content: template.content, templateId: template.id }));
                      setShowNewCampaignModal(true);
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Usar Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL NOVA CAMPANHA AVANÇADA */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Nova Campanha Avançada</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowNewCampaignModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="content">Conteúdo</TabsTrigger>
                  <TabsTrigger value="targeting">Segmentação</TabsTrigger>
                  <TabsTrigger value="advanced">Avançado</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="campaign-name">Nome da Campanha</Label>
                        <Input
                          id="campaign-name"
                          placeholder="Ex: Campanha de Boas-vindas"
                          value={newCampaign.name}
                          onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="quiz-select">Selecionar Quiz</Label>
                        <Select 
                          value={newCampaign.quizId} 
                          onValueChange={(value) => {
                            setNewCampaign(prev => ({ ...prev, quizId: value }));
                            const quiz = quizzes.find(q => q.id === value);
                            setSelectedQuizForPreview(quiz);
                            const vars = ['nome', 'email', 'telefone', 'idade', 'altura', 'peso'];
                            setAvailableVariables(vars);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Escolha um quiz" />
                          </SelectTrigger>
                          <SelectContent>
                            {quizzes.map((quiz) => (
                              <SelectItem key={quiz.id} value={quiz.id}>
                                {quiz.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="template-select">Template Base</Label>
                        <Select 
                          value={newCampaign.templateId} 
                          onValueChange={(value) => {
                            const template = emailTemplates.find(t => t.id === value);
                            setNewCampaign(prev => ({ 
                              ...prev, 
                              templateId: value,
                              content: template?.content || prev.content 
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Escolha um template" />
                          </SelectTrigger>
                          <SelectContent>
                            {emailTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="campaign-subject">Assunto do Email</Label>
                        <Input
                          id="campaign-subject"
                          placeholder="Ex: Olá {{nome}}, seu resultado está aqui!"
                          value={newCampaign.subject}
                          onChange={(e) => setNewCampaign(prev => ({ ...prev, subject: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="ab-test"
                            checked={newCampaign.abTestEnabled}
                            onChange={(e) => setNewCampaign(prev => ({ ...prev, abTestEnabled: e.target.checked }))}
                          />
                          <Label htmlFor="ab-test" className="flex items-center gap-2">
                            <TestTube className="w-4 h-4" />
                            Ativar A/B Test
                          </Label>
                        </div>

                        {newCampaign.abTestEnabled && (
                          <div>
                            <Label htmlFor="ab-subject">Assunto Alternativo (B)</Label>
                            <Input
                              id="ab-subject"
                              placeholder="Ex: {{nome}}, não perca essa oportunidade!"
                              value={newCampaign.abTestSubject}
                              onChange={(e) => setNewCampaign(prev => ({ ...prev, abTestSubject: e.target.value }))}
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <Label>Variáveis Disponíveis</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {availableVariables.map((variable) => (
                            <Badge 
                              key={variable}
                              variant="outline"
                              className="cursor-pointer hover:bg-green-50"
                              onClick={() => {
                                const textarea = document.getElementById('campaign-content') as HTMLTextAreaElement;
                                const cursorPos = textarea?.selectionStart || 0;
                                const content = newCampaign.content;
                                const newContent = content.slice(0, cursorPos) + `{{${variable}}}` + content.slice(cursorPos);
                                setNewCampaign(prev => ({ ...prev, content: newContent }));
                              }}
                            >
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="campaign-content">Conteúdo do Email</Label>
                        <Textarea
                          id="campaign-content"
                          placeholder="Olá {{nome}}, 

Obrigado por participar do nosso quiz!

Baseado nas suas respostas, temos uma oferta especial para você...

Atenciosamente,
Equipe Vendzz"
                          value={newCampaign.content}
                          onChange={(e) => setNewCampaign(prev => ({ ...prev, content: e.target.value }))}
                          className="min-h-[300px]"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const content = newCampaign.content + '\n\n{{nome}} | {{email}} | {{telefone}}';
                            setNewCampaign(prev => ({ ...prev, content }));
                          }}
                        >
                          <Wand2 className="w-4 h-4 mr-2" />
                          Inserir Assinatura
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const content = newCampaign.content + '\n\n<a href="https://vendzz.com.br/unsubscribe">Cancelar inscrição</a>';
                            setNewCampaign(prev => ({ ...prev, content }));
                          }}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Link Descadastro
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Preview do Email</Label>
                        <div className="border rounded-lg p-4 bg-gray-50 min-h-[300px]">
                          <div className="bg-white rounded p-4 shadow-sm">
                            <div className="border-b pb-2 mb-4">
                              <p className="text-sm text-gray-600">
                                <strong>Assunto:</strong> {newCampaign.subject.replace(/\{\{(\w+)\}\}/g, 'João Silva')}
                              </p>
                            </div>
                            <div className="prose prose-sm max-w-none">
                              <div 
                                dangerouslySetInnerHTML={{ 
                                  __html: newCampaign.content
                                    .replace(/\{\{nome\}\}/g, 'João Silva')
                                    .replace(/\{\{email\}\}/g, 'joao@email.com')
                                    .replace(/\{\{telefone\}\}/g, '(11) 99999-9999')
                                    .replace(/\{\{idade\}\}/g, '28')
                                    .replace(/\{\{altura\}\}/g, '1,75m')
                                    .replace(/\{\{peso\}\}/g, '75kg')
                                    .replace(/\n/g, '<br>') 
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="targeting" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Público-Alvo</Label>
                        <Select 
                          value={newCampaign.targetAudience} 
                          onValueChange={(value) => setNewCampaign(prev => ({ ...prev, targetAudience: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="completed">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Leads Completos (Finalizaram o quiz)
                              </div>
                            </SelectItem>
                            <SelectItem value="abandoned">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-600" />
                                Leads Abandonados (Não finalizaram)
                              </div>
                            </SelectItem>
                            <SelectItem value="all">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-600" />
                                Todos os Leads
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Timing de Envio</Label>
                        <Select 
                          value={newCampaign.triggerType} 
                          onValueChange={(value) => setNewCampaign(prev => ({ ...prev, triggerType: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-green-600" />
                                Imediato
                              </div>
                            </SelectItem>
                            <SelectItem value="delayed">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                Agendado
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {newCampaign.triggerType === 'delayed' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Delay</Label>
                            <Input
                              type="number"
                              value={newCampaign.triggerDelay}
                              onChange={(e) => setNewCampaign(prev => ({ ...prev, triggerDelay: parseInt(e.target.value) || 1 }))}
                            />
                          </div>
                          <div>
                            <Label>Unidade</Label>
                            <Select 
                              value={newCampaign.triggerUnit} 
                              onValueChange={(value) => setNewCampaign(prev => ({ ...prev, triggerUnit: value as any }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="minutes">Minutos</SelectItem>
                                <SelectItem value="hours">Horas</SelectItem>
                                <SelectItem value="days">Dias</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Estimativa de Alcance</Label>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">Leads Estimados</span>
                          </div>
                          <div className="text-2xl font-bold text-blue-700">
                            {newCampaign.targetAudience === 'completed' ? '~85%' : 
                             newCampaign.targetAudience === 'abandoned' ? '~15%' : '100%'}
                          </div>
                          <p className="text-sm text-blue-600 mt-1">
                            dos leads do quiz selecionado
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label>Performance Esperada</Label>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Taxa de Abertura:</span>
                            <span className="font-medium">38-45%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Taxa de Cliques:</span>
                            <span className="font-medium">12-18%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Taxa de Conversão:</span>
                            <span className="font-medium">3-7%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Configurações Avançadas</Label>
                        <div className="space-y-4 mt-4">
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">Tracking de Abertura</h4>
                              <p className="text-sm text-gray-600">Rastrear quando emails são abertos</p>
                            </div>
                            <input type="checkbox" defaultChecked className="toggle" />
                          </div>

                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">Tracking de Cliques</h4>
                              <p className="text-sm text-gray-600">Rastrear cliques em links</p>
                            </div>
                            <input type="checkbox" defaultChecked className="toggle" />
                          </div>

                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">Anti-Spam</h4>
                              <p className="text-sm text-gray-600">Otimizar para evitar spam</p>
                            </div>
                            <input type="checkbox" defaultChecked className="toggle" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Integração Brevo</Label>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-medium">Brevo Conectado</span>
                          </div>
                          <p className="text-sm text-green-700">
                            Emails serão enviados via Brevo API
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Remetente: contato@vendzz.com.br
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label>Métricas de Performance</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="text-center p-3 bg-blue-50 rounded">
                            <div className="text-xl font-bold text-blue-700">98.5%</div>
                            <div className="text-sm text-blue-600">Deliverability</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded">
                            <div className="text-xl font-bold text-green-700">&lt; 1%</div>
                            <div className="text-sm text-green-600">Bounce Rate</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                <Button 
                  variant="outline"
                  onClick={() => setShowNewCampaignModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateCampaign}
                  disabled={createCampaignMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  {createCampaignMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Criar Campanha
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}