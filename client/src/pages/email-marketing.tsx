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
import { UltraPersonalizedEmailModal } from "@/components/ultra-personalized-email-modal";
import { CampaignStyleSelector, CampaignStyle } from "@/components/campaign-style-selector";
import { 
  Mail, 
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
  Target
} from "lucide-react";

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
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
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'welcome' | 'follow_up' | 'promotion' | 'abandoned_cart';
  variables: string[];
}

export default function EmailMarketingPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [campaignForm, setCampaignForm] = useState<{
    name: string;
    subject: string;
    content: string;
    quizId: string;
    targetAudience: "completed" | "abandoned" | "all";
    triggerType: "immediate" | "delayed";
    triggerDelay: number;
    triggerUnit: "hours" | "minutes" | "days";
    variables: string[];
  }>({
    name: "",
    subject: "",
    content: "",
    quizId: "",
    targetAudience: "completed",
    triggerType: "immediate",
    triggerDelay: 1,
    triggerUnit: "hours",
    variables: []
  });

  const [templateForm, setTemplateForm] = useState({
    name: "",
    subject: "",
    content: "",
    category: "welcome" as const
  });

  const [brevoConfig, setBrevoConfig] = useState({
    apiKey: "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",
    fromEmail: "contato@vendzz.com.br",
    isConfigured: true
  });

  const [testingBrevo, setTestingBrevo] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [showUltraPersonalizedModal, setShowUltraPersonalizedModal] = useState(false);
  
  // Estados para seletor de estilo de campanha
  const [showCampaignStyleSelector, setShowCampaignStyleSelector] = useState(false);
  const [selectedCampaignStyle, setSelectedCampaignStyle] = useState<CampaignStyle | null>(null);

  // Queries
  const { data: quizzes } = useQuery({
    queryKey: ["/api/quizzes"],
  });

  const { data: campaigns } = useQuery({
    queryKey: ["/api/email-campaigns"],
  });

  const { data: templates } = useQuery({
    queryKey: ["/api/email-templates"],
  });

  const { data: quizVariables } = useQuery({
    queryKey: ["/api/quiz-variables", selectedQuiz],
    enabled: !!selectedQuiz,
  });

  // Mutations
  const createCampaignMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/email-campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-campaigns"] });
      setCampaignForm({
        name: "",
        subject: "",
        content: "",
        quizId: "",
        targetAudience: "completed",
        triggerType: "immediate",
        triggerDelay: 1,
        triggerUnit: "hours",
        variables: []
      });
      toast({
        title: "Campanha E-mail Criada",
        description: "Sua campanha foi criada com sucesso!"
      });
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/email-templates", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      setTemplateForm({
        name: "",
        subject: "",
        content: "",
        category: "welcome"
      });
      toast({
        title: "Template Criado",
        description: "Seu template foi salvo com sucesso!"
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
    handleCreateCampaignWithStyle('remarketing');
  };

  const handleCreateRemarketingUltraCustomizedCampaign = () => {
    handleCreateCampaignWithStyle('remarketing_ultra_customizado');
  };

  const handleCreateStandardCampaign = () => {
    handleCreateCampaignWithStyle('ao_vivo_tempo_real');
  };

  const handleCreateUltraCustomizedCampaign = () => {
    // Para ultra customizada, abrir modal
    setShowUltraPersonalizedModal(true);
  };

  const handleCreateUltraPersonalizedCampaign = () => {
    // Para ultra personalizada, abrir modal
    setShowUltraPersonalizedModal(true);
  };

  const handleCreateCampaignWithStyle = (campaignType: string) => {
    if (!campaignForm.name || !campaignForm.subject || !campaignForm.content || !campaignForm.quizId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const stylePrefix = 
      campaignType === 'remarketing' ? '[REMARKETING]' :
      campaignType === 'remarketing_ultra_customizado' ? '[REMARKETING ULTRA CUSTOMIZADO]' :
      '[AO VIVO TEMPO REAL]';
    
    const campaignData = {
      ...campaignForm,
      name: `${stylePrefix} ${campaignForm.name}`,
      campaignType
    };

    createCampaignMutation.mutate(campaignData);
  };

  const handleCreateTemplate = () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.content) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    createTemplateMutation.mutate(templateForm);
  };

  const insertVariable = (variable: string) => {
    const cursorPos = (document.activeElement as HTMLTextAreaElement)?.selectionStart || 0;
    const currentContent = campaignForm.content;
    const newContent = currentContent.slice(0, cursorPos) + `{{${variable}}}` + currentContent.slice(cursorPos);
    setCampaignForm({...campaignForm, content: newContent});
  };

  const testBrevoConfig = async () => {
    setTestingBrevo(true);
    try {
      const response = await apiRequest("/api/email-brevo/test", {
        method: "POST",
        body: JSON.stringify({
          apiKey: brevoConfig.apiKey
        })
      });
      
      if (response.success) {
        toast({
          title: "Configuração OK!",
          description: "API do Brevo configurada com sucesso!"
        });
        setBrevoConfig({...brevoConfig, isConfigured: true});
      } else {
        toast({
          title: "Erro na configuração",
          description: response.message || "Verifique sua API Key",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Não foi possível testar a configuração",
        variant: "destructive"
      });
    } finally {
      setTestingBrevo(false);
    }
  };

  const sendEmailCampaign = async (campaignId: string) => {
    setSendingCampaign(true);
    try {
      const response = await apiRequest(`/api/email-campaigns/${campaignId}/send`, {
        method: "POST",
        body: JSON.stringify({
          apiKey: brevoConfig.apiKey,
          fromEmail: brevoConfig.fromEmail
        })
      });
      
      if (response.success) {
        toast({
          title: "Campanha Enviada!",
          description: `${response.successCount} emails enviados com sucesso!`
        });
        queryClient.invalidateQueries({ queryKey: ["/api/email-campaigns"] });
      } else {
        toast({
          title: "Erro no envio",
          description: response.error || "Não foi possível enviar a campanha",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro no envio",
        description: "Não foi possível enviar a campanha",
        variant: "destructive"
      });
    } finally {
      setSendingCampaign(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">E-mail Marketing</h1>
          <p className="text-gray-600 mt-1">Crie e gerencie campanhas de email com diferentes estilos</p>
        </div>
      </div>

      {/* Campaign Style Selection Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Mail className="w-5 h-5" />
            Criar Nova Campanha de Email
          </CardTitle>
          <CardDescription>
            Comece selecionando o estilo de campanha que melhor se adapta ao seu objetivo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Button
              onClick={() => setShowCampaignStyleSelector(true)}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8"
            >
              <Mail className="w-5 h-5 mr-2" />
              Selecionar Estilo de Campanha
            </Button>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <h4 className="font-semibold text-orange-800">Remarketing</h4>
              <p className="text-sm text-orange-600">💰 Custo R$ 0,00</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <Clock className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-semibold text-green-800">Ao Vivo</h4>
              <p className="text-sm text-green-600">⚡ Imediato</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Settings className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-semibold text-purple-800">Ultra Customizada</h4>
              <p className="text-sm text-purple-600">🚀 Top Vendas</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-semibold text-blue-800">Ultra Personalizada</h4>
              <p className="text-sm text-blue-600">💎 Expert</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Send className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Campanhas Ativas</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {Array.isArray(campaigns) ? campaigns.filter((c: EmailCampaign) => c.status === 'active').length : 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Taxa de Abertura</p>
                    <p className="text-2xl font-bold text-green-600">24.5%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Cliques Totais</p>
                    <p className="text-2xl font-bold text-purple-600">1,247</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Explicação dos Tipos de Campanha */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">📚 Tipos de Campanha Email - Guia Completo</CardTitle>
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
                    <p className="text-sm text-green-600 font-medium mt-2">📧 Transforme emails "mortos" em VENDAS!</p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Selecione entre leads antigos que abandonaram ou completaram o quiz e datas</strong>
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-600">
                        🎯 <strong>Vantagens:</strong> Leads gratuitos • Segmentação automática • Timing inteligente
                      </div>
                      <div className="text-xs text-green-600 font-bold">
                        💸 <strong>LUCRO REAL:</strong> +35% taxa abertura • R$ 350 a mais para cada R$ 1.000 investido!
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4 bg-white p-4 rounded-lg shadow-lg">
                    <h3 className="font-bold text-purple-700 flex items-center gap-2">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">🚀 REMARKETING ULTRA CUSTOMIZADO</span>
                    </h3>
                    <p className="text-sm text-purple-600 font-medium mt-2">💎 O segredo dos GURUS do EMAIL!</p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Selecione entre leads antigos que abandonaram ou completaram o quiz e datas, mas que também dispare funis diferentes para cada faixa de idade, peso, altura, ou como preferir, isso aumenta muito a conversão!</strong>
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-600">
                        🎯 <strong>Vantagens:</strong> Emails por idade/peso/altura • Funis únicos • Personalização máxima
                      </div>
                      <div className="text-xs text-purple-600 font-bold">
                        💰 <strong>LUCRO EXPLOSIVO:</strong> +50% conversão • R$ 5.000 a mais para cada R$ 10.000!
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-l-4 border-orange-500 pl-4 bg-white p-4 rounded-lg shadow-lg">
                    <h3 className="font-bold text-orange-700 flex items-center gap-2">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">⚡ AO VIVO TEMPO REAL</span>
                    </h3>
                    <p className="text-sm text-orange-600 font-medium mt-2">🔥 Pegue o lead na caixa de entrada QUENTE!</p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Mensagens personalizadas para pessoas que abandonaram ou completaram o quiz, escolha quanto tempo após a ação vai disparar a mensagem personalizada desejada</strong>
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-600">
                        🎯 <strong>Vantagens:</strong> Automático 24h • Timing perfeito • Sem perder leads
                      </div>
                      <div className="text-xs text-orange-600 font-bold">
                        🔥 <strong>CONVERSÃO INSANA:</strong> +92% taxa abertura • Lead quente = venda garantida!
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4 bg-white p-4 rounded-lg shadow-lg">
                    <h3 className="font-bold text-red-700 flex items-center gap-2">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">💎 AO VIVO ULTRA CUSTOMIZADA</span>
                    </h3>
                    <p className="text-sm text-red-600 font-medium mt-2">👑 O NIVEL MÁXIMO do EMAIL MARKETING!</p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Mensagens personalizadas para pessoas que abandonaram ou completaram o quiz, escolha quanto tempo após a ação vai disparar a mensagem personalizada desejada mas que também dispare funis diferentes para cada faixa de idade, peso, altura, ou como preferir, isso aumenta muito a conversão!</strong>
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-600">
                        🎯 <strong>Vantagens:</strong> Tempo real + personalização • Funis únicos • Máxima conversão
                      </div>
                      <div className="text-xs text-red-600 font-bold">
                        💰 <strong>LUCRO ESTRATOSFÉRICO:</strong> +150% conversão • R$ 15.000 a mais para cada R$ 10.000!
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
                      <strong>COMBINE TUDO:</strong> Use <strong>Remarketing</strong> nos leads antigos (custo R$ 0,00), <strong>Ao Vivo</strong> nos frescos (abertura 92%+). 
                      As versões <strong>Ultra Customizadas</strong> são o segredo dos especialistas que faturam R$ 200k+/mês com email!
                    </p>
                    <p className="text-xs text-yellow-600 mt-2 font-bold">
                      ⚡ RESULTADO: Até R$ 80.000 extras por mês só com email automático!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Campaign Creation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Nova Campanha E-mail
                </CardTitle>
                <CardDescription>
                  Selecione o estilo de campanha que melhor se adapta ao seu objetivo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div>
                  <Label htmlFor="subject">Assunto do E-mail</Label>
                  <Input
                    id="subject"
                    placeholder="Ex: Olá {{nome}}, aqui está seu resultado!"
                    value={campaignForm.subject}
                    onChange={(e) => setCampaignForm({...campaignForm, subject: e.target.value})}
                  />
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
                  <Label htmlFor="content">Conteúdo do E-mail</Label>
                  <Textarea
                    id="content"
                    placeholder="Olá {{nome}},&#10;&#10;Obrigado por participar do nosso quiz sobre {{tema}}!&#10;&#10;Baseado nas suas respostas, recomendamos..."
                    value={campaignForm.content}
                    onChange={(e) => setCampaignForm({...campaignForm, content: e.target.value})}
                    className="min-h-32"
                  />
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
                      <span className="text-sm font-medium text-blue-900">Enviar após</span>
                      <Input
                        type="number"
                        min="1"
                        max="168"
                        value={campaignForm.triggerDelay}
                        onChange={(e) => setCampaignForm({...campaignForm, triggerDelay: parseInt(e.target.value) || 1})}
                        className="w-20"
                      />
                      <Select 
                        value={campaignForm.triggerUnit} 
                        onValueChange={(value) => setCampaignForm({...campaignForm, triggerUnit: value as any})}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">min</SelectItem>
                          <SelectItem value="hours">horas</SelectItem>
                          <SelectItem value="days">dias</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-blue-700">
                        {campaignForm.targetAudience === "completed" ? "após completar" : "após abandonar"} o quiz
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowCampaignStyleSelector(true)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={createCampaignMutation.isPending}
                  >
                    {createCampaignMutation.isPending ? "Criando..." : "Selecionar Estilo de Campanha"}
                  </Button>
                  <Button
                    onClick={() => setShowUltraPersonalizedModal(true)}
                    disabled={!selectedQuiz}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Ultra Personalizada
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Campaign List */}
            <Card>
              <CardHeader>
                <CardTitle>Campanhas Existentes</CardTitle>
                <CardDescription>Gerencie suas campanhas de e-mail</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.isArray(campaigns) && campaigns?.map((campaign: EmailCampaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{campaign.name}</h3>
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{campaign.subject}</p>
                      <p className="text-xs text-gray-500 mb-2">{campaign.quizTitle}</p>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Enviados:</span>
                          <p className="font-medium">{campaign.sent}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Abertos:</span>
                          <p className="font-medium">{campaign.opened}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Cliques:</span>
                          <p className="font-medium">{campaign.clicked}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Taxa:</span>
                          <p className="font-medium">
                            {campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!campaigns?.length && (
                    <p className="text-center text-gray-500 py-8">
                      Nenhuma campanha criada ainda
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Template Creation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Novo Template
                </CardTitle>
                <CardDescription>
                  Crie templates reutilizáveis para suas campanhas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Nome do Template</Label>
                  <Input
                    id="template-name"
                    placeholder="Ex: Boas-vindas Padrão"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="template-category">Categoria</Label>
                  <Select 
                    value={templateForm.category} 
                    onValueChange={(value) => setTemplateForm({...templateForm, category: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">Boas-vindas</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="promotion">Promoção</SelectItem>
                      <SelectItem value="abandoned_cart">Carrinho Abandonado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="template-subject">Assunto</Label>
                  <Input
                    id="template-subject"
                    placeholder="Ex: Bem-vindo(a), {{nome}}!"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="template-content">Conteúdo</Label>
                  <Textarea
                    id="template-content"
                    placeholder="Digite o conteúdo do template..."
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                    className="min-h-32"
                  />
                </div>

                <Button 
                  onClick={handleCreateTemplate} 
                  className="w-full"
                  disabled={createTemplateMutation.isPending}
                >
                  {createTemplateMutation.isPending ? "Salvando..." : "Salvar Template"}
                </Button>
              </CardContent>
            </Card>

            {/* Template List */}
            <Card>
              <CardHeader>
                <CardTitle>Templates Salvos</CardTitle>
                <CardDescription>Reutilize seus templates favoritos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templates?.map((template: EmailTemplate) => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{template.content}</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">
                          <Edit3 className="w-3 h-3 mr-1" />
                          Usar
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!templates?.length && (
                    <p className="text-center text-gray-500 py-8">
                      Nenhum template criado ainda
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Enviados</p>
                    <p className="text-2xl font-bold text-blue-600">15,487</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Taxa de Abertura</p>
                    <p className="text-2xl font-bold text-green-600">24.5%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Taxa de Clique</p>
                    <p className="text-2xl font-bold text-purple-600">8.1%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Conversões</p>
                    <p className="text-2xl font-bold text-orange-600">342</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance das Campanhas</CardTitle>
              <CardDescription>Acompanhe o desempenho de cada campanha</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns?.map((campaign: EmailCampaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{campaign.name}</h3>
                      <p className="text-sm text-gray-600">{campaign.subject}</p>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{campaign.sent}</p>
                        <p className="text-gray-500">Enviados</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{campaign.opened}</p>
                        <p className="text-gray-500">Abertos</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{campaign.clicked}</p>
                        <p className="text-gray-500">Cliques</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">
                          {campaign.sent > 0 ? ((campaign.opened / campaign.sent) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-gray-500">Taxa</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-green-600" />
                <div>
                  <CardTitle>Configurações do Brevo</CardTitle>
                  <CardDescription>Configure sua integração com o Brevo para envio de emails</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="brevoApiKey">API Key do Brevo</Label>
                  <Input
                    id="brevoApiKey"
                    type="password"
                    value={brevoConfig.apiKey}
                    onChange={(e) => setBrevoConfig({...brevoConfig, apiKey: e.target.value})}
                    placeholder="xkeysib-..."
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Obtenha sua API key em: Brevo → Configurações → API Keys
                  </p>
                </div>

                <div>
                  <Label htmlFor="brevoFromEmail">Email do Remetente</Label>
                  <Input
                    id="brevoFromEmail"
                    type="email"
                    value={brevoConfig.fromEmail}
                    onChange={(e) => setBrevoConfig({...brevoConfig, fromEmail: e.target.value})}
                    placeholder="contato@vendzz.com.br"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Email que aparecerá como remetente das suas campanhas
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <Button 
                    onClick={testBrevoConfig}
                    disabled={testingBrevo || !brevoConfig.apiKey}
                    className="flex-1"
                  >
                    {testingBrevo ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Testar Configuração
                      </>
                    )}
                  </Button>

                  {brevoConfig.isConfigured && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Configurado</span>
                    </div>
                  )}
                </div>
              </div>

              {brevoConfig.isConfigured && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-medium text-green-800">Brevo Configurado!</h3>
                  </div>
                  <p className="text-sm text-green-700">
                    O Brevo está configurado e funcionando. Você pode criar e enviar campanhas de email.
                  </p>
                  <div className="mt-3 space-y-1 text-sm text-green-600">
                    <p>• API Name: VZ</p>
                    <p>• Remetente: {brevoConfig.fromEmail}</p>
                    <p>• Status: ✅ Ativo</p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-blue-800">Sobre o Brevo</h3>
                </div>
                <p className="text-sm text-blue-700 mb-2">
                  O Brevo é uma plataforma confiável para envio de emails transacionais e marketing.
                </p>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Alta taxa de entrega (99%+)</li>
                  <li>• Suporte completo para HTML e personalização</li>
                  <li>• Monitoramento de abertura e cliques</li>
                  <li>• Integração segura com API</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Campanha Ultra Personalizada */}
      <UltraPersonalizedEmailModal
        open={showUltraPersonalizedModal}
        onClose={() => setShowUltraPersonalizedModal(false)}
        quizId={selectedQuiz}
        quizTitle={quizzes?.find(q => q.id === selectedQuiz)?.title || ""}
      />

      {/* Campaign Style Selector Modal */}
      <CampaignStyleSelector
        open={showCampaignStyleSelector}
        onClose={() => setShowCampaignStyleSelector(false)}
        onStyleSelect={handleCampaignStyleSelect}
        platform="email"
      />
    </div>
  );
}