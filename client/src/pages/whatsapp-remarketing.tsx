
import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  Download, 
  Chrome, 
  Smartphone,
  Clock,
  Target,
  Zap,
  Settings,
  Play,
  Pause,
  BarChart3,
  Users,
  CheckCircle,
  AlertTriangle,
  Code,
  Calendar,
  Filter,
  Plus,
  Trash2,
  Edit,
  Copy,
  Eye,
  Send,
  Globe,
  Wifi,
  WifiOff,
  Bot,
  User,
  MessageSquare,
  Phone,
  Hash,
  Clock3,
  Bell,
  Lightbulb,
  Star
} from "lucide-react";

interface WhatsAppCampaign {
  id: string;
  name: string;
  quizId: string;
  quizTitle: string;
  status: 'active' | 'paused' | 'draft' | 'completed';
  message: string;
  variables: string[];
  targetAudience: 'completed' | 'abandoned' | 'specific_answer' | 'all';
  triggerType: 'immediate' | 'delayed';
  triggerDelay: number;
  triggerUnit: 'minutes' | 'hours' | 'days';
  scheduleType: 'anytime' | 'business_hours' | 'custom';
  businessHours: { start: string; end: string; days: string[] };
  customSchedule: { date: string; time: string }[];
  personalizedMessage: boolean;
  messageVariations: { condition: string; message: string }[];
  sent: number;
  delivered: number;
  viewed: number;
  replied: number;
  clicks: number;
  createdAt: string;
  isExtensionConnected: boolean;
}

interface ExtensionStatus {
  isConnected: boolean;
  isOnline: boolean;
  phoneNumber: string;
  whatsappVersion: string;
  lastActivity: string;
  messagesSent: number;
  messagesQueue: number;
}

export default function WhatsAppRemarketingPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const [extensionStatus, setExtensionStatus] = useState<ExtensionStatus>({
    isConnected: false,
    isOnline: false,
    phoneNumber: "",
    whatsappVersion: "",
    lastActivity: "",
    messagesSent: 0,
    messagesQueue: 0
  });

  const [campaignForm, setCampaignForm] = useState({
    name: "",
    message: "",
    quizId: "",
    targetAudience: "completed" as const,
    triggerType: "immediate" as const,
    triggerDelay: 1,
    triggerUnit: "hours" as const,
    scheduleType: "anytime" as const,
    businessHours: {
      start: "09:00",
      end: "18:00",
      days: ["monday", "tuesday", "wednesday", "thursday", "friday"]
    },
    personalizedMessage: true,
    messageVariations: [
      { condition: "score > 80", message: "Parabéns pelo excelente resultado! 🎉" },
      { condition: "score < 50", message: "Que tal melhorarmos juntos? 💪" }
    ]
  });

  // Fetch user's quizzes
  const { data: quizzes } = useQuery({
    queryKey: ["/api/quizzes"],
  });

  // Fetch WhatsApp campaigns
  const { data: campaigns } = useQuery<WhatsAppCampaign[]>({
    queryKey: ["/api/whatsapp-campaigns"],
    queryFn: async () => {
      // Mock data - substituir pela API real
      return [
        {
          id: "camp1",
          name: "Follow-up Quiz Nutrição",
          quizId: "quiz1",
          quizTitle: "Quiz de Avaliação Nutricional",
          status: "active",
          message: "Oi {{nome}}! Vi que você completou nosso quiz. Baseado no seu perfil {{resultado}}, tenho uma dica especial! 🌟",
          variables: ["nome", "resultado", "pontuacao"],
          targetAudience: "completed",
          triggerType: "delayed",
          triggerDelay: 2,
          triggerUnit: "hours",
          scheduleType: "business_hours",
          businessHours: { start: "09:00", end: "18:00", days: ["monday", "tuesday", "wednesday", "thursday", "friday"] },
          customSchedule: [],
          personalizedMessage: true,
          messageVariations: [],
          sent: 87,
          delivered: 84,
          viewed: 72,
          replied: 23,
          clicks: 15,
          createdAt: "2025-01-05T10:00:00Z",
          isExtensionConnected: true
        },
        {
          id: "camp2",
          name: "Recuperação de Abandonos",
          quizId: "quiz2",
          quizTitle: "Quiz de Perfil Fitness",
          status: "paused",
          message: "Oi! Notei que você começou nosso quiz mas não terminou. Que tal completar? São só mais 2 minutos! ⏰",
          variables: ["nome"],
          targetAudience: "abandoned",
          triggerType: "delayed",
          triggerDelay: 30,
          triggerUnit: "minutes",
          scheduleType: "anytime",
          businessHours: { start: "09:00", end: "18:00", days: [] },
          customSchedule: [],
          personalizedMessage: false,
          messageVariations: [],
          sent: 45,
          delivered: 43,
          viewed: 38,
          replied: 12,
          clicks: 8,
          createdAt: "2025-01-04T14:00:00Z",
          isExtensionConnected: false
        }
      ];
    }
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaign: typeof campaignForm) => {
      // Mock - substituir pela API real
      return { success: true, campaignId: `camp_${Date.now()}` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp-campaigns"] });
      toast({
        title: "Campanha WhatsApp Criada",
        description: "Sua campanha foi configurada com sucesso!"
      });
    }
  });

  // Simulate extension connection
  useEffect(() => {
    const checkExtension = () => {
      // Simular verificação da extensão
      const isInstalled = Math.random() > 0.3; // 70% chance de estar instalada
      setIsExtensionInstalled(isInstalled);
      
      if (isInstalled) {
        setExtensionStatus({
          isConnected: true,
          isOnline: Math.random() > 0.2, // 80% chance de estar online
          phoneNumber: "+55 11 99999-9999",
          whatsappVersion: "2.2.24.18",
          lastActivity: "Agora mesmo",
          messagesSent: 127,
          messagesQueue: 5
        });
      }
    };

    checkExtension();
    const interval = setInterval(checkExtension, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleCreateCampaign = () => {
    if (!campaignForm.name || !campaignForm.message || !campaignForm.quizId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    createCampaignMutation.mutate(campaignForm);
  };

  const downloadExtension = () => {
    // Simular download da extensão
    const extensionUrl = "https://chrome.google.com/webstore/detail/vendzz-whatsapp-bot/fake-id";
    window.open(extensionUrl, '_blank');
    
    toast({
      title: "Download Iniciado",
      description: "A extensão será instalada automaticamente no Chrome"
    });
  };

  const insertVariable = (variable: string) => {
    const textarea = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
    if (textarea) {
      const cursorPos = textarea.selectionStart || 0;
      const currentContent = campaignForm.message;
      const newContent = currentContent.slice(0, cursorPos) + `{{${variable}}}` + currentContent.slice(cursorPos);
      setCampaignForm({...campaignForm, message: newContent});
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Remarketing</h1>
          <p className="text-gray-600 mt-1">Sistema completo de remarketing via WhatsApp com extensão do Chrome</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Extension Status */}
          <Card className={`${extensionStatus.isConnected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                {extensionStatus.isConnected ? (
                  <Wifi className="w-5 h-5 text-green-600" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <p className={`text-sm font-medium ${extensionStatus.isConnected ? 'text-green-700' : 'text-red-700'}`}>
                    {extensionStatus.isConnected ? 'Conectado' : 'Desconectado'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {extensionStatus.isConnected ? extensionStatus.phoneNumber : 'Extensão offline'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Extension Installation Alert */}
      {!isExtensionInstalled && (
        <Alert className="bg-blue-50 border-blue-200">
          <Chrome className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>Extensão do Chrome Necessária</strong>
                <p className="mt-1">Para usar o WhatsApp Remarketing, você precisa instalar nossa extensão gratuita do Chrome.</p>
              </div>
              <Button onClick={downloadExtension} className="ml-4">
                <Download className="w-4 h-4 mr-2" />
                Instalar Extensão
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Info Section */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <MessageCircle className="w-5 h-5" />
            Sistema WhatsApp Remarketing Completo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">🤖 Como Funciona</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>Extensão Chrome:</strong> Instale nossa extensão gratuita</li>
                <li>• <strong>Conexão Automática:</strong> A extensão se conecta ao seu WhatsApp Web</li>
                <li>• <strong>Sincronização:</strong> Dados do quiz sincronizam em tempo real</li>
                <li>• <strong>Envio Inteligente:</strong> Mensagens personalizadas automáticas</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">🎯 Segmentação Avançada</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>Por Resultado:</strong> Baseado nas respostas do quiz</li>
                <li>• <strong>Por Comportamento:</strong> Completou ou abandonou</li>
                <li>• <strong>Por Pontuação:</strong> Alto, médio ou baixo score</li>
                <li>• <strong>Por Tempo:</strong> Horários e dias específicos</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">⚡ Recursos Premium</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>Mensagens Variadas:</strong> Diferentes textos por condição</li>
                <li>• <strong>Horário Inteligente:</strong> Respeita horário comercial</li>
                <li>• <strong>Anti-Spam:</strong> Controle de frequência automático</li>
                <li>• <strong>Analytics Completo:</strong> Métricas detalhadas</li>
              </ul>
            </div>
          </div>
          
          <Alert className="bg-yellow-50 border-yellow-200">
            <Lightbulb className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>100% Gratuito e Seguro:</strong> A extensão é totalmente gratuita, não armazena dados pessoais e funciona localmente no seu navegador.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="extension">Extensão</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Campanhas Ativas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {campaigns?.filter(c => c.status === 'active').length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Send className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Mensagens Enviadas</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {campaigns?.reduce((sum, c) => sum + c.sent, 0) || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Taxa de Visualização</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {campaigns?.length ? Math.round((campaigns.reduce((sum, c) => sum + c.viewed, 0) / campaigns.reduce((sum, c) => sum + c.sent, 0)) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Taxa de Resposta</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {campaigns?.length ? Math.round((campaigns.reduce((sum, c) => sum + c.replied, 0) / campaigns.reduce((sum, c) => sum + c.sent, 0)) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Extension Status Detail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Chrome className="w-5 h-5" />
                Status da Extensão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${extensionStatus.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium">{extensionStatus.isConnected ? 'Conectado' : 'Desconectado'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">WhatsApp</p>
                    <p className="font-medium">{extensionStatus.phoneNumber || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Mensagens Enviadas</p>
                    <p className="font-medium">{extensionStatus.messagesSent}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock3 className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Última Atividade</p>
                    <p className="font-medium">{extensionStatus.lastActivity}</p>
                  </div>
                </div>
              </div>
              
              {extensionStatus.messagesQueue > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      <strong>{extensionStatus.messagesQueue} mensagens na fila</strong> para envio
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Recentes</CardTitle>
              <CardDescription>Suas últimas campanhas WhatsApp</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns?.slice(0, 5).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        campaign.status === 'active' ? 'bg-green-500' : 
                        campaign.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-gray-600">{campaign.quizTitle}</p>
                      </div>
                      {campaign.isExtensionConnected && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          <Wifi className="w-3 h-3 mr-1" />
                          Conectado
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{campaign.sent} enviadas</p>
                      <p className="text-xs text-gray-600">{campaign.replied} respostas</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Campaign Creation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Nova Campanha WhatsApp
                </CardTitle>
                <CardDescription>
                  Configure uma campanha personalizada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="campaign-name">Nome da Campanha</Label>
                  <Input
                    id="campaign-name"
                    placeholder="Ex: Follow-up Quiz Nutrição"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="quiz-select">Quiz Base</Label>
                  <Select 
                    value={campaignForm.quizId} 
                    onValueChange={(value) => setCampaignForm({...campaignForm, quizId: value})}
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
                      <SelectItem value="completed">Completaram o quiz</SelectItem>
                      <SelectItem value="abandoned">Abandonaram o quiz</SelectItem>
                      <SelectItem value="specific_answer">Resposta específica</SelectItem>
                      <SelectItem value="all">Todos os leads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Variables Panel */}
                {campaignForm.quizId && (
                  <div>
                    <Label>Variáveis Disponíveis</Label>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg">
                      {['nome', 'resultado', 'pontuacao', 'email', 'telefone'].map((variable) => (
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
                      Clique nas variáveis para inserir na mensagem
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="message">Mensagem WhatsApp</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Oi {{nome}}! 👋&#10;&#10;Vi que você completou nosso quiz sobre {{tema}}!&#10;&#10;Baseado no seu resultado {{resultado}}, tenho uma dica especial para você..."
                    value={campaignForm.message}
                    onChange={(e) => setCampaignForm({...campaignForm, message: e.target.value})}
                    className="min-h-32"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {campaignForm.message.length} caracteres
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

                <div className="space-y-3">
                  <Label>Horário de Envio</Label>
                  <Select 
                    value={campaignForm.scheduleType} 
                    onValueChange={(value) => setCampaignForm({...campaignForm, scheduleType: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anytime">Qualquer horário</SelectItem>
                      <SelectItem value="business_hours">Horário comercial</SelectItem>
                      <SelectItem value="custom">Horário personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {campaignForm.scheduleType === "business_hours" && (
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label className="text-xs">Início</Label>
                          <Input
                            type="time"
                            value={campaignForm.businessHours.start}
                            onChange={(e) => setCampaignForm({
                              ...campaignForm, 
                              businessHours: {...campaignForm.businessHours, start: e.target.value}
                            })}
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs">Fim</Label>
                          <Input
                            type="time"
                            value={campaignForm.businessHours.end}
                            onChange={(e) => setCampaignForm({
                              ...campaignForm, 
                              businessHours: {...campaignForm.businessHours, end: e.target.value}
                            })}
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => (
                          <Button
                            key={day}
                            variant={campaignForm.businessHours.days.includes(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][index]) ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs"
                          >
                            {day}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Label>Personalização Inteligente</Label>
                    <p className="text-xs text-gray-600">Mensagens diferentes baseadas no resultado</p>
                  </div>
                  <Switch
                    checked={campaignForm.personalizedMessage}
                    onCheckedChange={(checked) => setCampaignForm({...campaignForm, personalizedMessage: checked})}
                  />
                </div>

                <Button 
                  onClick={handleCreateCampaign} 
                  className="w-full"
                  disabled={createCampaignMutation.isPending || !isExtensionInstalled}
                >
                  {createCampaignMutation.isPending ? "Criando..." : "Criar Campanha"}
                </Button>
                
                {!isExtensionInstalled && (
                  <p className="text-xs text-amber-600 text-center">
                    ⚠️ Instale a extensão para criar campanhas
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Campaign List */}
            <Card>
              <CardHeader>
                <CardTitle>Campanhas Existentes</CardTitle>
                <CardDescription>Gerencie suas campanhas WhatsApp</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaigns?.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{campaign.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                          {campaign.isExtensionConnected && (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              <Wifi className="w-3 h-3 mr-1" />
                              Online
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{campaign.quizTitle}</p>
                      <p className="text-sm bg-gray-50 p-2 rounded line-clamp-2">{campaign.message}</p>
                      <div className="grid grid-cols-5 gap-2 mt-3 text-xs text-center">
                        <div>
                          <p className="font-medium">{campaign.sent}</p>
                          <p className="text-gray-500">Enviadas</p>
                        </div>
                        <div>
                          <p className="font-medium">{campaign.delivered}</p>
                          <p className="text-gray-500">Entregues</p>
                        </div>
                        <div>
                          <p className="font-medium">{campaign.viewed}</p>
                          <p className="text-gray-500">Visualizadas</p>
                        </div>
                        <div>
                          <p className="font-medium">{campaign.replied}</p>
                          <p className="text-gray-500">Respostas</p>
                        </div>
                        <div>
                          <p className="font-medium">
                            {campaign.sent > 0 ? Math.round((campaign.replied / campaign.sent) * 100) : 0}%
                          </p>
                          <p className="text-gray-500">Taxa</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            Detalhes
                          </Button>
                        </div>
                        <Button 
                          size="sm" 
                          variant={campaign.status === 'active' ? 'secondary' : 'default'}
                        >
                          {campaign.status === 'active' ? (
                            <>
                              <Pause className="w-3 h-3 mr-1" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              Ativar
                            </>
                          )}
                        </Button>
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

        {/* Extension Tab */}
        <TabsContent value="extension" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Installation Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Chrome className="w-5 h-5" />
                  Guia de Instalação
                </CardTitle>
                <CardDescription>
                  Como instalar e configurar a extensão
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">1</div>
                    <div>
                      <h4 className="font-medium">Baixar Extensão</h4>
                      <p className="text-sm text-gray-600">Clique no botão abaixo para instalar a extensão gratuita</p>
                      <Button size="sm" className="mt-2" onClick={downloadExtension}>
                        <Download className="w-4 h-4 mr-2" />
                        Instalar no Chrome
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">2</div>
                    <div>
                      <h4 className="font-medium">Abrir WhatsApp Web</h4>
                      <p className="text-sm text-gray-600">Acesse web.whatsapp.com e faça login normalmente</p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => window.open('https://web.whatsapp.com', '_blank')}>
                        <Globe className="w-4 h-4 mr-2" />
                        Abrir WhatsApp Web
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">3</div>
                    <div>
                      <h4 className="font-medium">Conectar Extensão</h4>
                      <p className="text-sm text-gray-600">A extensão detectará automaticamente o WhatsApp e se conectará</p>
                      <div className="mt-2 p-2 bg-green-50 rounded flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800">Conexão automática ativa</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">4</div>
                    <div>
                      <h4 className="font-medium">Começar a Usar</h4>
                      <p className="text-sm text-gray-600">Crie suas campanhas e veja a mágica acontecer!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Extension Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Status da Extensão
                </CardTitle>
                <CardDescription>
                  Monitoramento em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Extensão Instalada</span>
                    <div className="flex items-center gap-2">
                      {isExtensionInstalled ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">Instalada</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-600">Não instalada</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">WhatsApp Conectado</span>
                    <div className="flex items-center gap-2">
                      {extensionStatus.isConnected ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">Conectado</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-600">Desconectado</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status Online</span>
                    <div className="flex items-center gap-2">
                      {extensionStatus.isOnline ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600">Online</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span className="text-sm text-gray-600">Offline</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {extensionStatus.isConnected && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium">Informações da Conta</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Telefone</p>
                          <p className="font-medium">{extensionStatus.phoneNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Versão WhatsApp</p>
                          <p className="font-medium">{extensionStatus.whatsappVersion}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Mensagens Enviadas</p>
                          <p className="font-medium">{extensionStatus.messagesSent}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Fila de Envio</p>
                          <p className="font-medium">{extensionStatus.messagesQueue}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle>Resolução de Problemas</CardTitle>
              <CardDescription>Soluções para problemas comuns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">❌ Extensão não conecta</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Verifique se o WhatsApp Web está aberto e logado</li>
                    <li>• Recarregue a página do WhatsApp Web</li>
                    <li>• Desative e reative a extensão no Chrome</li>
                    <li>• Limpe o cache do navegador</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">⚠️ Mensagens não são enviadas</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Verifique se você não foi bloqueado pelos contatos</li>
                    <li>• Aguarde alguns minutos entre envios</li>
                    <li>• Certifique-se de que os números estão no formato correto</li>
                    <li>• Verifique se há campanhas em conflito</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">🔄 Sincronização com quiz</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Os dados sincronizam em tempo real automaticamente</li>
                    <li>• Se houver atraso, verifique sua conexão com a internet</li>
                    <li>• Recarregue a página do Vendzz se necessário</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: "welcome",
                name: "Boas-vindas",
                message: "Oi {{nome}}! 👋\n\nObrigado por participar do nosso quiz!\n\nSeu resultado foi: {{resultado}}\n\nQue tal agendar uma conversa?",
                category: "follow_up",
                variables: ["nome", "resultado"]
              },
              {
                id: "abandoned",
                name: "Carrinho Abandonado",
                message: "Oi {{nome}}! 🤔\n\nVi que você começou nosso quiz mas não terminou...\n\nSão só mais 2 minutinhos! Complete agora: {{link}}",
                category: "recovery",
                variables: ["nome", "link"]
              },
              {
                id: "high_score",
                name: "Alto Score",
                message: "Parabéns {{nome}}! 🎉\n\nVocê teve um resultado INCRÍVEL: {{pontuacao}} pontos!\n\n{{resultado}}\n\nTenho uma proposta especial para você...",
                category: "conversion",
                variables: ["nome", "pontuacao", "resultado"]
              },
              {
                id: "low_score",
                name: "Baixo Score",
                message: "Oi {{nome}}! 💪\n\nVi que você fez nosso quiz e tem potencial para muito mais!\n\nQue tal uma consultoria gratuita para te ajudar?",
                category: "nurturing",
                variables: ["nome"]
              },
              {
                id: "promotion",
                name: "Promoção",
                message: "{{nome}}, oferta especial! 🎁\n\nBaseado no seu perfil {{resultado}}, separei um desconto de 30% só para você!\n\nVálido até amanhã!",
                category: "sales",
                variables: ["nome", "resultado"]
              },
              {
                id: "appointment",
                name: "Agendamento",
                message: "Oi {{nome}}! 📅\n\nQue tal marcarmos uma conversa sobre seus resultados?\n\nTenho algumas dicas personalizadas para o seu perfil {{resultado}}",
                category: "conversion",
                variables: ["nome", "resultado"]
              }
            ].map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    {template.name}
                    <Badge variant="outline">{template.category}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm bg-gray-50 p-3 rounded-lg">
                      {template.message.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="secondary" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Copy className="w-3 h-3 mr-1" />
                        Usar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Send className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Taxa de Entrega</p>
                    <p className="text-2xl font-bold text-blue-600">96.8%</p>
                  </div>
                </div>
                <Progress value={96.8} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Taxa de Visualização</p>
                    <p className="text-2xl font-bold text-green-600">78.3%</p>
                  </div>
                </div>
                <Progress value={78.3} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Taxa de Resposta</p>
                    <p className="text-2xl font-bold text-purple-600">24.7%</p>
                  </div>
                </div>
                <Progress value={24.7} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Taxa de Conversão</p>
                    <p className="text-2xl font-bold text-orange-600">12.1%</p>
                  </div>
                </div>
                <Progress value={12.1} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Performance by Campaign */}
          <Card>
            <CardHeader>
              <CardTitle>Performance por Campanha</CardTitle>
              <CardDescription>Análise detalhada de cada campanha</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns?.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">{campaign.name}</h3>
                        <p className="text-sm text-gray-600">{campaign.quizTitle}</p>
                      </div>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{campaign.sent}</p>
                        <p className="text-xs text-gray-600">Enviadas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{campaign.delivered}</p>
                        <p className="text-xs text-gray-600">Entregues</p>
                        <p className="text-xs text-green-600">
                          {campaign.sent > 0 ? Math.round((campaign.delivered / campaign.sent) * 100) : 0}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-purple-600">{campaign.viewed}</p>
                        <p className="text-xs text-gray-600">Visualizadas</p>
                        <p className="text-xs text-purple-600">
                          {campaign.delivered > 0 ? Math.round((campaign.viewed / campaign.delivered) * 100) : 0}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-orange-600">{campaign.replied}</p>
                        <p className="text-xs text-gray-600">Respostas</p>
                        <p className="text-xs text-orange-600">
                          {campaign.viewed > 0 ? Math.round((campaign.replied / campaign.viewed) * 100) : 0}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-red-600">{campaign.clicks}</p>
                        <p className="text-xs text-gray-600">Cliques</p>
                        <p className="text-xs text-red-600">
                          {campaign.replied > 0 ? Math.round((campaign.clicks / campaign.replied) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>Configurações do sistema WhatsApp</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Anti-Spam Inteligente</Label>
                    <p className="text-xs text-gray-600">Previne envio excessivo para o mesmo contato</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Verificação de Número</Label>
                    <p className="text-xs text-gray-600">Valida números antes do envio</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Retry Automático</Label>
                    <p className="text-xs text-gray-600">Tenta reenviar mensagens que falharam</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Intervalo entre mensagens (segundos)</Label>
                  <Input type="number" min="1" max="300" defaultValue="5" />
                  <p className="text-xs text-gray-600">
                    Recomendado: 3-10 segundos para evitar bloqueios
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Máximo de mensagens por hora</Label>
                  <Input type="number" min="1" max="1000" defaultValue="100" />
                  <p className="text-xs text-gray-600">
                    Limite recomendado: 50-200 por hora
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Configure quando ser notificado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Campanha Iniciada</Label>
                    <p className="text-xs text-gray-600">Notificar quando campanha começar</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Campanha Finalizada</Label>
                    <p className="text-xs text-gray-600">Notificar quando campanha terminar</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Erros de Envio</Label>
                    <p className="text-xs text-gray-600">Notificar quando houver falhas</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Relatórios Diários</Label>
                    <p className="text-xs text-gray-600">Resumo diário por email</p>
                  </div>
                  <Switch />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Email para notificações</Label>
                  <Input type="email" placeholder="seu@email.com" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
              <CardDescription>Para usuários experientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Atenção:</strong> Alterar essas configurações pode afetar a performance e segurança do sistema.
                </AlertDescription>
              </Alert>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Timeout da extensão (ms)</Label>
                  <Input type="number" min="1000" max="30000" defaultValue="5000" />
                </div>
                
                <div className="space-y-2">
                  <Label>Tentativas de reconexão</Label>
                  <Input type="number" min="1" max="10" defaultValue="3" />
                </div>
                
                <div className="space-y-2">
                  <Label>Cache de contatos (horas)</Label>
                  <Input type="number" min="1" max="168" defaultValue="24" />
                </div>
                
                <div className="space-y-2">
                  <Label>Log level</Label>
                  <Select defaultValue="info">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline">
                  Resetar Configurações
                </Button>
                <Button>
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
