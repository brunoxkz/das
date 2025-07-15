import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { CompleteSMSCampaignModal } from "@/components/complete-sms-campaign-modal";
import { 
  MessageSquare, 
  Clock, 
  AlertCircle, 
  Users, 
  TrendingUp, 
  Send, 
  Edit3,
  Eye,
  Trash2,
  Plus,
  Code,
  Wand2,
  Settings,
  TestTube,
  CheckCircle,
  Loader2,
  Info,
  Sparkles,
  RefreshCw,
  Target,
  Crown,
  Upload,
  FileText,
  BarChart3,
  Phone,
  CheckCircle2
} from "lucide-react";

interface SMSCampaign {
  id: string;
  name: string;
  message: string;
  quizId: string;
  quizTitle: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  triggerType: 'immediate' | 'delayed';
  triggerDelay?: number;
  triggerUnit?: 'minutes' | 'hours' | 'days';
  targetAudience: 'all' | 'completed' | 'abandoned';
  variables: string[];
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  createdAt: string;
  campaignStyle: string;
}

const campaignStyles = [
  {
    id: 'remarketing',
    title: 'Campanha Remarketing',
    description: 'Reative leads antigos com mensagens personalizadas',
    icon: RefreshCw,
    color: 'from-green-500 to-emerald-600',
    features: ['Leads inativas', 'Segmentação automática', 'Personalização avançada']
  },
  {
    id: 'remarketing_ultra_customizado',
    title: 'Remarketing Ultra Customizado',
    description: 'Reativação com mensagens ultra personalizadas por perfil',
    icon: Crown,
    color: 'from-purple-500 to-indigo-600',
    features: ['Mensagens únicas', 'Perfil específico', 'Alta conversão']
  },
  {
    id: 'ao_vivo_tempo_real',
    title: 'Campanha Ao Vivo Tempo Real',
    description: 'Envios automáticos para leads que acabaram de responder',
    icon: Clock,
    color: 'from-blue-500 to-cyan-600',
    features: ['Tempo real', 'Automação total', 'Resposta imediata']
  },
  {
    id: 'ao_vivo_ultra_customizada',
    title: 'Ao Vivo Ultra Customizada',
    description: 'Mensagens específicas baseadas nas respostas do quiz',
    icon: Target,
    color: 'from-orange-500 to-red-600',
    features: ['Condicional', 'Baseada em respostas', 'Segmentação avançada']
  },
  {
    id: 'disparo_massa',
    title: 'Disparo em Massa',
    description: 'Envie para sua própria lista de contatos',
    icon: Users,
    color: 'from-pink-500 to-rose-600',
    features: ['Lista própria', 'Upload CSV', 'Envio em lote']
  }
];

export default function SMSCampaignsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [showCampaignStyles, setShowCampaignStyles] = useState(false);
  const [selectedCampaignStyle, setSelectedCampaignStyle] = useState<string>("");
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState<{
    name: string;
    message: string;
    quizId: string;
    targetAudience: 'all' | 'completed' | 'abandoned';
    triggerType: 'immediate' | 'delayed';
    triggerDelay?: number;
    triggerUnit?: 'minutes' | 'hours' | 'days';
    campaignStyle: string;
  }>({
    name: "",
    message: "",
    quizId: "",
    targetAudience: "completed",
    triggerType: "immediate",
    campaignStyle: ""
  });

  // Fetch campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/sms-campaigns']
  });

  // Fetch quizzes
  const { data: quizzes } = useQuery({
    queryKey: ['/api/user/quizzes']
  });

  // Fetch credits
  const { data: credits } = useQuery({
    queryKey: ['/api/user/credits']
  });

  // Fetch quiz variables
  const { data: quizVariables } = useQuery({
    queryKey: ['/api/quiz-variables', selectedQuiz],
    enabled: !!selectedQuiz
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      const response = await apiRequest("POST", "/api/sms-campaigns", campaignData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Campanha criada com sucesso!",
        description: "Sua campanha SMS foi criada e está pronta para ser ativada.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sms-campaigns'] });
      setShowCampaignModal(false);
      setShowCampaignStyles(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar campanha",
        description: error.message || "Ocorreu um erro ao criar a campanha.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setCampaignForm({
      name: "",
      message: "",
      quizId: "",
      targetAudience: "completed",
      triggerType: "immediate",
      campaignStyle: ""
    });
    setSelectedQuiz("");
  };

  const handleCampaignStyleSelect = (styleId: string) => {
    setSelectedCampaignStyle(styleId);
    setCampaignForm({...campaignForm, campaignStyle: styleId});
    setShowCampaignModal(true);
    setShowCampaignStyles(false);
  };

  const handleCreateCampaign = () => {
    if (!campaignForm.name || !campaignForm.message || !campaignForm.quizId) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    createCampaignMutation.mutate(campaignForm);
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('sms-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + `{${variable}}` + after;
      setCampaignForm({...campaignForm, message: newText});
    }
  };

  const smsCredits = credits?.sms || 0;
  const totalCampaigns = campaigns?.length || 0;
  const activeCampaigns = campaigns?.filter((c: SMSCampaign) => c.status === 'active').length || 0;
  const totalSent = campaigns?.reduce((sum: number, c: SMSCampaign) => sum + (c.sent || 0), 0) || 0;
  const totalDelivered = campaigns?.reduce((sum: number, c: SMSCampaign) => sum + (c.delivered || 0), 0) || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Campanhas SMS</h1>
        <p className="text-muted-foreground mb-6">
          Gerencie suas campanhas de SMS marketing
        </p>
        
        {/* Botão principal centralizado e chamativo */}
        <div className="flex justify-center">
          <Button 
            onClick={() => setShowCampaignStyles(!showCampaignStyles)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            size="lg"
          >
            <Sparkles className="w-6 h-6 mr-3" />
            {showCampaignStyles ? 'Ocultar Estilos' : 'Selecionar Estilo de Campanha'}
            <Sparkles className="w-6 h-6 ml-3" />
          </Button>
        </div>
      </div>

      {/* Seleção de Estilos de Campanha */}
      {showCampaignStyles && (
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Escolha o Estilo da Sua Campanha</h2>
            <p className="text-muted-foreground">Selecione o tipo de campanha que melhor se adequa ao seu objetivo</p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campaignStyles.map((style) => {
              const IconComponent = style.icon;
              return (
                <Card
                  key={style.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => handleCampaignStyleSelect(style.id)}
                >
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${style.color} flex items-center justify-center mb-3`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{style.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {style.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {style.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Main content in tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
          <TabsTrigger value="credits">Créditos</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Campanhas</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCampaigns}</div>
                <p className="text-xs text-muted-foreground">SMS campaigns criadas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeCampaigns}</div>
                <p className="text-xs text-muted-foreground">Em execução</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SMS Enviados</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSent}</div>
                <p className="text-xs text-muted-foreground">Total enviado</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Entregues com sucesso</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Recentes</CardTitle>
              <CardDescription>Últimas campanhas SMS criadas</CardDescription>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : campaigns?.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.slice(0, 5).map((campaign: SMSCampaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">{campaign.quizTitle}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {campaign.sent || 0} enviados
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma campanha criada ainda</p>
                  <Button 
                    onClick={() => setShowCampaignStyles(true)}
                    className="mt-4"
                    variant="outline"
                  >
                    Criar Primeira Campanha
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Campanhas</CardTitle>
              <CardDescription>Gerencie todas as suas campanhas SMS</CardDescription>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : campaigns?.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map((campaign: SMSCampaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">{campaign.quizTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          Criada em {new Date(campaign.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{campaign.sent || 0} enviados</div>
                          <div className="text-xs text-muted-foreground">
                            {campaign.delivered || 0} entregues
                          </div>
                        </div>
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma campanha criada ainda</p>
                  <Button 
                    onClick={() => setShowCampaignStyles(true)}
                    className="mt-4"
                    variant="outline"
                  >
                    Criar Primeira Campanha
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates de SMS</CardTitle>
              <CardDescription>Modelos prontos para suas campanhas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Templates em breve...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análises Detalhadas</CardTitle>
              <CardDescription>Métricas e insights das suas campanhas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Análises em breve...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credits Tab */}
        <TabsContent value="credits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Créditos SMS</CardTitle>
              <CardDescription>Compre e gerencie seus créditos para SMS</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Créditos Atuais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{smsCredits}</div>
                    <p className="text-sm text-muted-foreground">SMS restantes</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Pacote Básico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ 50</div>
                    <p className="text-sm text-muted-foreground">500 SMS (R$ 0,10 cada)</p>
                    <Button className="w-full mt-2" variant="outline">
                      Comprar
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Pacote Premium</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ 200</div>
                    <p className="text-sm text-muted-foreground">2.500 SMS (R$ 0,08 cada)</p>
                    <Button className="w-full mt-2">
                      Comprar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Criação de Campanha */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Nova Campanha SMS</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaign-name">Nome da Campanha</Label>
                <Input
                  id="campaign-name"
                  placeholder="Ex: Boas-vindas Quiz Nutrição"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="quiz-select">Quiz Base</Label>
                <Select 
                  value={campaignForm.quizId} 
                  onValueChange={(value) => {
                    setCampaignForm({...campaignForm, quizId: value});
                    setSelectedQuiz(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um quiz" />
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
                <Select 
                  value={campaignForm.targetAudience} 
                  onValueChange={(value) => setCampaignForm({...campaignForm, targetAudience: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Leads que completaram</SelectItem>
                    <SelectItem value="abandoned">Leads que abandonaram</SelectItem>
                    <SelectItem value="all">Todos os leads</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Variables Panel */}
              {selectedQuiz && quizVariables && (
                <div>
                  <Label>Variáveis Disponíveis</Label>
                  <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg">
                    {quizVariables.map((variable: string) => (
                      <Button
                        key={variable}
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable(variable)}
                        className="text-xs justify-start"
                      >
                        <Code className="w-3 h-3 mr-1" />
                        {variable}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Clique nas variáveis para inserir no conteúdo
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="sms-content">Mensagem SMS</Label>
                <Textarea
                  id="sms-content"
                  placeholder="Olá {nome}! Obrigado por participar do quiz sobre {tema}. Baseado nas suas respostas..."
                  value={campaignForm.message}
                  onChange={(e) => setCampaignForm({...campaignForm, message: e.target.value})}
                  className="min-h-32"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Limite de 160 caracteres por SMS
                </p>
              </div>

              <div className="space-y-3">
                <Label>Momento do Envio</Label>
                <Select 
                  value={campaignForm.triggerType} 
                  onValueChange={(value) => setCampaignForm({...campaignForm, triggerType: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Enviar imediatamente</SelectItem>
                    <SelectItem value="delayed">Enviar depois de X tempo</SelectItem>
                  </SelectContent>
                </Select>
                
                {campaignForm.triggerType === "delayed" && (
                  <div className="flex gap-2 items-center bg-blue-50 p-3 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <Input
                      type="number"
                      placeholder="1"
                      value={campaignForm.triggerDelay || ""}
                      onChange={(e) => setCampaignForm({...campaignForm, triggerDelay: parseInt(e.target.value)})}
                      className="w-20"
                    />
                    <Select 
                      value={campaignForm.triggerUnit || "hours"}
                      onValueChange={(value) => setCampaignForm({...campaignForm, triggerUnit: value as any})}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutos</SelectItem>
                        <SelectItem value="hours">Horas</SelectItem>
                        <SelectItem value="days">Dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateCampaign}
                  disabled={createCampaignMutation.isPending}
                  className="flex-1"
                >
                  {createCampaignMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Criar Campanha
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCampaignModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}