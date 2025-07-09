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
import { Switch } from "@/components/ui/switch";
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
  Play,
  Pause,
  LineChart,
  Activity,
  Database,
  Sliders,
  Layers,
  Maximize2,
  GitBranch,
  Timer,
  Repeat,
  Filter as FilterIcon,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth-jwt";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Quiz {
  id: string;
  title: string;
  responseCount: number;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent' | 'active';
  quizId: string;
  quizTitle: string;
  targetAudience: string;
  emailCount: number;
  sentCount: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
  sentAt?: string;
  scheduledAt?: string;
  availableVariables?: string[];
}

interface QuizVariable {
  name: string;
  type: string;
  description: string;
  sampleValue: string;
}

interface AudienceStats {
  totalLeads: number;
  completedLeads: number;
  abandonedLeads: number;
  estimatedOpenRate: number;
  estimatedClickRate: number;
  estimatedDeliveryRate: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  previewImage?: string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Boas-vindas',
    category: 'Engajamento',
    subject: 'Bem-vindo(a), {nome}! Vamos começar sua jornada?',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #22c55e; text-align: center;">Olá, {nome}! 👋</h1>
      <p>Obrigado por responder nosso quiz! Ficamos empolgados em ajudá-lo(a) a alcançar seus objetivos.</p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Seus dados do quiz:</h3>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Telefone:</strong> {telefone}</p>
        <p><strong>Idade:</strong> {idade}</p>
      </div>
      <p>Em breve entraremos em contato com mais informações personalizadas!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Começar Agora</a>
      </div>
    </div>`
  },
  {
    id: 'abandoned',
    name: 'Carrinho Abandonado',
    category: 'Reengajamento',
    subject: '{nome}, você esqueceu de algo importante!',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #ef4444; text-align: center;">Ops! Você não terminou, {nome}!</h1>
      <p>Notamos que você começou nosso quiz mas não finalizou. Que tal completar agora?</p>
      <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
        <h3>⏰ Não perca essa oportunidade!</h3>
        <p>Milhares de pessoas já transformaram suas vidas com nossos resultados.</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Finalizar Quiz</a>
      </div>
    </div>`
  },
  {
    id: 'promotional',
    name: 'Promocional',
    category: 'Vendas',
    subject: '🔥 Oferta Especial para {nome} - 50% OFF',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #f59e0b; text-align: center;">Oferta Exclusiva para Você, {nome}!</h1>
      <p>Com base nas suas respostas do quiz, temos uma oferta especial!</p>
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h2 style="color: #92400e; margin: 0;">🎉 50% DE DESCONTO</h2>
        <p style="font-size: 18px; margin: 10px 0;">Válido apenas por 24 horas!</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="background: #f59e0b; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 18px;">Aproveitar Desconto</a>
      </div>
    </div>`
  }
];

export default function AdvancedEmailMarketing() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedTab, setSelectedTab] = useState("campaigns");
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [audiencePreview, setAudiencePreview] = useState<AudienceStats | null>(null);
  const [variablePreview, setVariablePreview] = useState<Record<string, any>>({});
  const [showVariableHelper, setShowVariableHelper] = useState(false);
  
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    subject: "",
    content: "",
    quizId: "",
    targetAudience: "all",
    scheduleType: "immediate",
    scheduledAt: "",
    abTestEnabled: false,
    abTestSubject: "",
    personalizedContent: true,
    dateFilter: "",
    segmentationRules: {}
  });

  // Fetch quizzes
  const { data: quizzes = [], isLoading: loadingQuizzes } = useQuery<Quiz[]>({
    queryKey: ['/api/quizzes'],
    enabled: isAuthenticated,
  });

  // Fetch email campaigns
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery<EmailCampaign[]>({
    queryKey: ['/api/email-campaigns'],
    enabled: isAuthenticated,
  });

  // Fetch quiz variables when quiz is selected
  const { data: quizVariables, isLoading: loadingVariables } = useQuery({
    queryKey: ['/api/quiz/:quizId/variables', selectedQuiz],
    enabled: isAuthenticated && !!selectedQuiz,
  });

  // Get audience preview
  const audiencePreviewMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/email-campaigns/preview-audience', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data) => {
      setAudiencePreview(data.stats);
    },
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/email-campaigns/advanced', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Campanha criada com sucesso!",
        description: `${data.targetedLeads} leads foram segmentados para esta campanha.`,
      });
      setShowNewCampaignModal(false);
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar campanha",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNewCampaign({
      name: "",
      subject: "",
      content: "",
      quizId: "",
      targetAudience: "all",
      scheduleType: "immediate",
      scheduledAt: "",
      abTestEnabled: false,
      abTestSubject: "",
      personalizedContent: true,
      dateFilter: "",
      segmentationRules: {}
    });
    setSelectedQuiz("");
    setSelectedTemplate("");
    setAudiencePreview(null);
    setVariablePreview({});
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setNewCampaign({
      ...newCampaign,
      subject: template.subject,
      content: template.content
    });
    setSelectedTemplate(template.id);
  };

  const handleQuizSelect = (quizId: string) => {
    setSelectedQuiz(quizId);
    setNewCampaign({
      ...newCampaign,
      quizId
    });
    
    // Preview audience
    audiencePreviewMutation.mutate({
      quizId,
      targetAudience: newCampaign.targetAudience,
      dateFilter: newCampaign.dateFilter
    });
  };

  const handleAudienceChange = (audience: string) => {
    setNewCampaign({
      ...newCampaign,
      targetAudience: audience
    });
    
    if (selectedQuiz) {
      audiencePreviewMutation.mutate({
        quizId: selectedQuiz,
        targetAudience: audience,
        dateFilter: newCampaign.dateFilter
      });
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('campaign-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + `{${variable}}` + after;
      
      setNewCampaign({
        ...newCampaign,
        content: newText
      });
      
      // Focus back on textarea
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 2, start + variable.length + 2);
      }, 0);
    }
  };

  const previewContent = () => {
    let preview = newCampaign.content;
    if (quizVariables?.sampleData) {
      Object.keys(quizVariables.sampleData).forEach(key => {
        const value = quizVariables.sampleData[key];
        preview = preview.replace(new RegExp(`{${key}}`, 'g'), value);
      });
    }
    return preview;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Marketing Pro</h1>
            <p className="mt-2 text-gray-600">
              Sistema avançado de email marketing com personalização total
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowNewCampaignModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Campanha
            </Button>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total de Campanhas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaigns.length}</div>
                  <p className="text-xs text-gray-500">+12% vs mês anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Emails Enviados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {campaigns.reduce((acc, c) => acc + c.sentCount, 0)}
                  </div>
                  <p className="text-xs text-gray-500">+18% vs mês anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Abertura</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {campaigns.length > 0 
                      ? (campaigns.reduce((acc, c) => acc + c.openRate, 0) / campaigns.length).toFixed(1)
                      : 0}%
                  </div>
                  <p className="text-xs text-gray-500">+2.3% vs mês anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Cliques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {campaigns.length > 0 
                      ? (campaigns.reduce((acc, c) => acc + c.clickRate, 0) / campaigns.length).toFixed(1)
                      : 0}%
                  </div>
                  <p className="text-xs text-gray-500">+1.2% vs mês anterior</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Campanhas Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCampaigns ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma campanha criada</h3>
                    <p className="text-gray-500 mb-4">Crie sua primeira campanha avançada de email marketing</p>
                    <Button onClick={() => setShowNewCampaignModal(true)}>
                      Criar Primeira Campanha
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                            <p className="text-sm text-gray-500">{campaign.subject}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'}>
                                {campaign.status}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                Quiz: {campaign.quizTitle}
                              </span>
                              <span className="text-sm text-gray-500">
                                {campaign.emailCount} emails • {campaign.sentCount} enviados
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-sm font-medium">{campaign.openRate}%</p>
                              <p className="text-xs text-gray-500">Abertura</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{campaign.clickRate}%</p>
                              <p className="text-xs text-gray-500">Cliques</p>
                            </div>
                            <Button size="sm" variant="outline">
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Templates de Email</CardTitle>
                <p className="text-sm text-gray-500">
                  Templates prontos para diferentes tipos de campanhas
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {EMAIL_TEMPLATES.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.subject}</p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Usar Template
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Taxa de Entrega</span>
                      <span className="text-sm font-bold">98.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Taxa de Abertura</span>
                      <span className="text-sm font-bold">24.3%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Taxa de Cliques</span>
                      <span className="text-sm font-bold">4.7%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Taxa de Conversão</span>
                      <span className="text-sm font-bold">2.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tendências</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-8">
                    <TrendingUp className="h-16 w-16 text-green-500" />
                  </div>
                  <p className="text-center text-sm text-gray-500">
                    Gráficos em tempo real serão exibidos aqui
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-send">Envio Automático</Label>
                      <p className="text-sm text-gray-500">Enviar campanhas automaticamente quando agendadas</p>
                    </div>
                    <Switch id="auto-send" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="track-opens">Rastrear Aberturas</Label>
                      <p className="text-sm text-gray-500">Acompanhar quando emails são abertos</p>
                    </div>
                    <Switch id="track-opens" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="track-clicks">Rastrear Cliques</Label>
                      <p className="text-sm text-gray-500">Acompanhar cliques em links dos emails</p>
                    </div>
                    <Switch id="track-clicks" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal para Nova Campanha */}
        {showNewCampaignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Nova Campanha Avançada</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowNewCampaignModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="campaign-name">Nome da Campanha</Label>
                      <Input
                        id="campaign-name"
                        placeholder="Ex: Boas-vindas Nutrição"
                        value={newCampaign.name}
                        onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="quiz-select">Quiz Fonte</Label>
                      <Select value={selectedQuiz} onValueChange={handleQuizSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um quiz" />
                        </SelectTrigger>
                        <SelectContent>
                          {quizzes.map((quiz) => (
                            <SelectItem key={quiz.id} value={quiz.id}>
                              {quiz.title} ({quiz.responseCount} respostas)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="campaign-subject">Assunto do Email</Label>
                    <Input
                      id="campaign-subject"
                      placeholder="Ex: Olá {nome}, aqui está seu resultado!"
                      value={newCampaign.subject}
                      onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="campaign-content">Conteúdo do Email</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowVariableHelper(!showVariableHelper)}
                      >
                        <Code className="h-4 w-4 mr-1" />
                        Variáveis
                        {showVariableHelper ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                      </Button>
                    </div>
                    
                    {showVariableHelper && quizVariables?.variables && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium mb-2">Variáveis Disponíveis:</p>
                        <div className="flex flex-wrap gap-2">
                          {quizVariables.variables.map((variable: string) => (
                            <Button
                              key={variable}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => insertVariable(variable)}
                            >
                              {variable}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Textarea
                      id="campaign-content"
                      placeholder="Digite o conteúdo do email..."
                      value={newCampaign.content}
                      onChange={(e) => setNewCampaign({...newCampaign, content: e.target.value})}
                      rows={8}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="target-audience">Público-Alvo</Label>
                      <Select value={newCampaign.targetAudience} onValueChange={handleAudienceChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Leads</SelectItem>
                          <SelectItem value="completed">Quiz Completo</SelectItem>
                          <SelectItem value="abandoned">Quiz Abandonado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="schedule-type">Tipo de Envio</Label>
                      <Select value={newCampaign.scheduleType} onValueChange={(value) => setNewCampaign({...newCampaign, scheduleType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Imediato</SelectItem>
                          <SelectItem value="scheduled">Agendado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date-filter">Filtro de Data</Label>
                      <Input
                        id="date-filter"
                        type="date"
                        value={newCampaign.dateFilter}
                        onChange={(e) => setNewCampaign({...newCampaign, dateFilter: e.target.value})}
                      />
                    </div>
                  </div>

                  {audiencePreview && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Preview da Audiência</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{audiencePreview.totalLeads}</div>
                            <div className="text-sm text-gray-500">Total de Leads</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{audiencePreview.completedLeads}</div>
                            <div className="text-sm text-gray-500">Completos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{audiencePreview.abandonedLeads}</div>
                            <div className="text-sm text-gray-500">Abandonados</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{audiencePreview.estimatedOpenRate}%</div>
                            <div className="text-sm text-gray-500">Taxa Estimada</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={() => setShowNewCampaignModal(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={() => createCampaignMutation.mutate(newCampaign)}
                      disabled={!newCampaign.name || !newCampaign.subject || !newCampaign.content || !selectedQuiz || createCampaignMutation.isPending}
                    >
                      {createCampaignMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Criar Campanha
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}