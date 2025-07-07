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
import { MessageSquare, Send, Users, CheckCircle, XCircle, Phone, Search, AlertCircle, Edit, Pause, Play, Trash2, Clock3, Smartphone, Eye, Settings, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface WhatsAppCampaign {
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
  extensionSettings: {
    delay: number;
    maxRetries: number;
    enabled: boolean;
  };
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  message: string;
  category: 'promotion' | 'follow_up' | 'reminder' | 'thank_you';
  variables: string[];
}

interface ExtensionStatus {
  connected: boolean;
  version: string;
  lastPing: string | null;
  pendingMessages: number;
}

export default function WhatsAppCampaignsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    quizId: '',
    message: '',
    targetAudience: 'all' as 'all' | 'completed' | 'abandoned',
    triggerType: 'delayed' as 'immediate' | 'delayed' | 'scheduled',
    triggerDelay: 10,
    triggerUnit: 'minutes' as 'minutes' | 'hours',
    scheduledDateTime: '',
    extensionSettings: {
      delay: 3000,
      maxRetries: 3,
      enabled: true
    }
  });

  // UI state
  const [selectedCampaignLogs, setSelectedCampaignLogs] = useState<string | null>(null);
  const [phoneFilterQuery, setPhoneFilterQuery] = useState('');
  const [leadCounts, setLeadCounts] = useState({ all: 0, completed: 0, abandoned: 0 });

  // Fetch WhatsApp campaigns
  const { data: campaigns, isLoading: campaignLoading } = useQuery<WhatsAppCampaign[]>({
    queryKey: ["/api/whatsapp-campaigns"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/whatsapp-campaigns", {
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
    staleTime: 0,
    cacheTime: 0,
    refetchInterval: 10000 // Update every 10 seconds
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

  // Fetch WhatsApp templates
  const { data: templates, isLoading: templatesLoading } = useQuery<WhatsAppTemplate[]>({
    queryKey: ["/api/whatsapp-templates"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/whatsapp-templates", {
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

  // Fetch extension status
  const { data: extensionStatus } = useQuery<ExtensionStatus>({
    queryKey: ["/api/whatsapp-extension/status"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/whatsapp-extension/status", {
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
    refetchInterval: 5000
  });

  // Create WhatsApp campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaign: typeof campaignForm) => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/whatsapp-campaigns", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(campaign),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar campanha");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Reset form
      setCampaignForm({
        name: '',
        quizId: '',
        message: '',
        targetAudience: 'all',
        triggerType: 'delayed',
        triggerDelay: 10,
        triggerUnit: 'minutes',
        scheduledDateTime: '',
        extensionSettings: {
          delay: 3000,
          maxRetries: 3,
          enabled: true
        }
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp-campaigns"] });
      toast({
        title: "Campanha WhatsApp Criada",
        description: "Sua campanha foi criada e será processada pela extensão!"
      });
    }
  });

  // Update lead counts when quiz changes
  useEffect(() => {
    if (campaignForm.quizId) {
      updateLeadCounts();
    }
  }, [campaignForm.quizId]);

  const updateLeadCounts = async () => {
    if (!campaignForm.quizId) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/quiz-phones/${campaignForm.quizId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const phones = await response.json();
        setLeadCounts({
          all: phones.length,
          completed: phones.filter((p: any) => p.status === 'completed').length,
          abandoned: phones.filter((p: any) => p.status === 'abandoned').length
        });
      }
    } catch (error) {
      console.error('Erro ao contar leads:', error);
    }
  };

  const handleCreateCampaign = () => {
    console.log("📱 VALORES DO FORMULÁRIO:", {
      message: campaignForm.message,
      quizId: campaignForm.quizId,
      targetAudience: campaignForm.targetAudience,
      triggerType: campaignForm.triggerType,
      scheduledDateTime: campaignForm.scheduledDateTime,
      messageLength: campaignForm.message?.length,
    });

    if (!campaignForm.name || !campaignForm.quizId || !campaignForm.message) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (campaignForm.triggerType === 'scheduled' && !campaignForm.scheduledDateTime) {
      toast({
        title: "Erro de Agendamento",
        description: "Data e hora são obrigatórias para agendamento específico.",
        variant: "destructive"
      });
      return;
    }

    createCampaignMutation.mutate(campaignForm);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Ativa</Badge>;
      case 'paused':
        return <Badge variant="secondary">Pausada</Badge>;
      case 'completed':
        return <Badge variant="outline">Completa</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getExtensionStatusBadge = () => {
    if (!extensionStatus) {
      return <Badge variant="secondary">Verificando...</Badge>;
    }
    
    return extensionStatus.connected ? 
      <Badge variant="default" className="bg-green-500">Conectada</Badge> :
      <Badge variant="destructive">Desconectada</Badge>;
  };

  if (!user) {
    setLocation('/login');
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campanhas WhatsApp</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie campanhas de remarketing via WhatsApp Web
          </p>
        </div>
        
        {/* Extension Status */}
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          <span className="text-sm">Extensão:</span>
          {getExtensionStatusBadge()}
        </div>
      </div>

      {/* Extension Alert */}
      {!extensionStatus?.connected && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            A extensão Chrome não está conectada. Para enviar mensagens WhatsApp, você precisa instalar e ativar a extensão Vendzz WhatsApp.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList>
          <TabsTrigger value="campaigns">📱 Campanhas</TabsTrigger>
          <TabsTrigger value="create">➕ Nova Campanha</TabsTrigger>
          <TabsTrigger value="templates">📝 Templates</TabsTrigger>
          <TabsTrigger value="extension">🔧 Extensão</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Campanhas WhatsApp
              </CardTitle>
              <CardDescription>
                Acompanhe suas campanhas de remarketing WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaignLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : !campaigns?.length ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma campanha encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie sua primeira campanha WhatsApp para começar o remarketing
                  </p>
                  <Button onClick={() => document.querySelector('[value="create"]')?.click?.()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Campanha
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Campaign Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Enviadas</p>
                            <p className="text-2xl font-bold text-green-500">
                              {campaigns.reduce((sum, c) => sum + c.sent, 0)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Entregues</p>
                            <p className="text-2xl font-bold text-blue-500">
                              {campaigns.reduce((sum, c) => sum + c.delivered, 0)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-purple-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Visualizadas</p>
                            <p className="text-2xl font-bold text-purple-500">
                              {campaigns.reduce((sum, c) => sum + c.opened, 0)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-orange-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Respostas</p>
                            <p className="text-2xl font-bold text-orange-500">
                              {campaigns.reduce((sum, c) => sum + c.replies, 0)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Campaigns Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Quiz</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Público</TableHead>
                        <TableHead>Enviadas</TableHead>
                        <TableHead>Taxa Entrega</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.name}</TableCell>
                          <TableCell>{campaign.quizTitle || campaign.quizId}</TableCell>
                          <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {campaign.targetAudience === 'all' ? 'Todos' : 
                               campaign.targetAudience === 'completed' ? 'Completos' : 'Abandonados'}
                            </Badge>
                          </TableCell>
                          <TableCell>{campaign.sent}</TableCell>
                          <TableCell>
                            {campaign.sent > 0 ? 
                              `${Math.round((campaign.delivered / campaign.sent) * 100)}%` : 
                              '0%'
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedCampaignLogs(campaign.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Campaign Tab */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nova Campanha WhatsApp
              </CardTitle>
              <CardDescription>
                Crie uma campanha de remarketing WhatsApp para seus leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Nome da Campanha *</Label>
                  <Input
                    id="campaign-name"
                    placeholder="Ex: Remarketing Quiz Nutrição"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quiz-select">Selecionar Funil *</Label>
                  <Select
                    value={campaignForm.quizId}
                    onValueChange={(value) => setCampaignForm(prev => ({ ...prev, quizId: value }))}
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

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem WhatsApp *</Label>
                <Textarea
                  id="message"
                  placeholder="Olá! Vi que você se interessou pelo nosso quiz sobre nutrição. Que tal continuar nossa conversa? 😊"
                  value={campaignForm.message}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  {campaignForm.message.length} caracteres (WhatsApp suporta até 4096)
                </p>
              </div>

              {/* Audience & Timing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Público-Alvo</Label>
                  <Select
                    value={campaignForm.targetAudience}
                    onValueChange={(value: 'all' | 'completed' | 'abandoned') => 
                      setCampaignForm(prev => ({ ...prev, targetAudience: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        Todos ({leadCounts.all} leads)
                      </SelectItem>
                      <SelectItem value="completed">
                        Quiz Completo ({leadCounts.completed} leads)
                      </SelectItem>
                      <SelectItem value="abandoned">
                        Quiz Abandonado ({leadCounts.abandoned} leads)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Tipo de Envio</Label>
                  <Select
                    value={campaignForm.triggerType}
                    onValueChange={(value: 'immediate' | 'delayed' | 'scheduled') => 
                      setCampaignForm(prev => ({ ...prev, triggerType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Envio Imediato</SelectItem>
                      <SelectItem value="delayed">Envio com Delay</SelectItem>
                      <SelectItem value="scheduled">Agendamento Específico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Timing Details */}
              {campaignForm.triggerType === 'delayed' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Delay</Label>
                    <Input
                      type="number"
                      min="1"
                      value={campaignForm.triggerDelay}
                      onChange={(e) => setCampaignForm(prev => ({ 
                        ...prev, 
                        triggerDelay: parseInt(e.target.value) || 1 
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Select
                      value={campaignForm.triggerUnit}
                      onValueChange={(value: 'minutes' | 'hours') => 
                        setCampaignForm(prev => ({ ...prev, triggerUnit: value }))
                      }
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

              {campaignForm.triggerType === 'scheduled' && (
                <div className="space-y-2">
                  <Label>Data e Hora do Envio</Label>
                  <Input
                    type="datetime-local"
                    value={campaignForm.scheduledDateTime}
                    onChange={(e) => setCampaignForm(prev => ({ 
                      ...prev, 
                      scheduledDateTime: e.target.value 
                    }))}
                  />
                </div>
              )}

              {/* Extension Settings */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="text-lg font-medium">Configurações da Extensão</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Delay entre mensagens (ms)</Label>
                    <Input
                      type="number"
                      min="1000"
                      max="10000"
                      value={campaignForm.extensionSettings.delay}
                      onChange={(e) => setCampaignForm(prev => ({ 
                        ...prev, 
                        extensionSettings: {
                          ...prev.extensionSettings,
                          delay: parseInt(e.target.value) || 3000
                        }
                      }))}
                    />
                    <p className="text-sm text-muted-foreground">
                      Recomendado: 3000ms para evitar bloqueios
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Máximo de tentativas</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={campaignForm.extensionSettings.maxRetries}
                      onChange={(e) => setCampaignForm(prev => ({ 
                        ...prev, 
                        extensionSettings: {
                          ...prev.extensionSettings,
                          maxRetries: parseInt(e.target.value) || 3
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Create Button */}
              <Button
                onClick={handleCreateCampaign}
                disabled={createCampaignMutation.isPending}
                className="w-full"
                size="lg"
              >
                {createCampaignMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando Campanha...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Criar Campanha WhatsApp
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Templates WhatsApp
              </CardTitle>
              <CardDescription>
                Templates pré-prontos para suas campanhas WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      id: '1',
                      name: 'Boas-vindas Nutrição',
                      category: 'follow_up',
                      message: 'Olá! 👋 Vi que você se interessou pelo nosso quiz sobre nutrição. Que tal continuar nossa conversa? Tenho algumas dicas personalizadas para você! 😊'
                    },
                    {
                      id: '2', 
                      name: 'Carrinho Abandonado',
                      category: 'reminder',
                      message: 'Oi! 😊 Notei que você começou nosso quiz mas não finalizou. Que tal completar? São só mais algumas perguntas e você terá acesso ao seu resultado personalizado! 🎯'
                    },
                    {
                      id: '3',
                      name: 'Oferta Especial',
                      category: 'promotion', 
                      message: 'Oferta exclusiva para você! 🎉 Com base no seu perfil do quiz, preparei um desconto especial de 30% no nosso programa. Válido até amanhã! 💪'
                    },
                    {
                      id: '4',
                      name: 'Agradecimento',
                      category: 'thank_you',
                      message: 'Muito obrigado por completar nosso quiz! 🙏 Seu resultado está pronto. Quer que eu envie algumas dicas extras baseadas no seu perfil? 📊'
                    }
                  ].map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{template.name}</h3>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                          {template.message}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCampaignForm(prev => ({ 
                            ...prev, 
                            message: template.message 
                          }))}
                        >
                          Usar Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Extension Tab */}
        <TabsContent value="extension">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Extensão WhatsApp
              </CardTitle>
              <CardDescription>
                Status e configurações da extensão Chrome
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Extension Status */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Status da Extensão</h3>
                  {getExtensionStatusBadge()}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Versão</p>
                    <p className="font-medium">{extensionStatus?.version || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Último Ping</p>
                    <p className="font-medium">
                      {extensionStatus?.lastPing ? 
                        new Date(extensionStatus.lastPing).toLocaleTimeString() : 
                        'Nunca'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mensagens Pendentes</p>
                    <p className="font-medium">{extensionStatus?.pendingMessages || 0}</p>
                  </div>
                </div>
              </div>

              {/* Installation Instructions */}
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">Como Instalar a Extensão</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Acesse a Chrome Web Store</li>
                  <li>Pesquise por "Vendzz WhatsApp Extension"</li>
                  <li>Clique em "Adicionar ao Chrome"</li>
                  <li>Abra o WhatsApp Web (web.whatsapp.com)</li>
                  <li>Faça login com seu número</li>
                  <li>A extensão se conectará automaticamente</li>
                </ol>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-4">
                <Button variant="outline" disabled={!extensionStatus?.connected}>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Extensão
                </Button>
                <Button variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Abrir WhatsApp Web
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}