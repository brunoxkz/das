import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth-hybrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageSquare, Phone, Users, Calendar, Settings, Smartphone, Wifi, 
  Plus, Play, Pause, Trash2, Edit, Send, Clock, Filter, CheckCircle, 
  XCircle, AlertCircle, Eye, RefreshCw 
} from "lucide-react";

// ========================================
// INTERFACES
// ========================================

interface Quiz {
  id: string;
  title: string;
  description: string;
  phoneFilters: Array<{
    phone: string;
    status: 'completed' | 'abandoned';
    submittedAt: string;
    completionPercentage: number;
  }>;
  responseCount: number;
}

interface WhatsAppCampaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  quizId: string;
  quizTitle: string;
  targetAudience: 'all' | 'completed' | 'abandoned';
  dateFilter: string;
  messages: string[];
  variables: Record<string, string>;
  sendingConfig: {
    delay: number;
    workingHours: { start: string; end: string; enabled: boolean };
    maxPerDay: number;
    randomInterval: boolean;
  };
  scheduledAt?: string;
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    failed: number;
  };
  createdAt: string;
}

interface ExtensionStatus {
  isConnected: boolean;
  isActive: boolean;
  lastSync: string;
  phoneCount: number;
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function WhatsAppCampaignsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [extensionStatus, setExtensionStatus] = useState<ExtensionStatus>({
    isConnected: false,
    isActive: false,
    lastSync: "",
    phoneCount: 0
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Dados dos quizzes
  const { data: quizzes = [], isLoading: loadingQuizzes } = useQuery({
    queryKey: ['/api/quizzes'],
    enabled: !!user
  });

  // Dados das campanhas
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ['/api/whatsapp/automation'],
    enabled: !!user
  });

  // Status da extensão
  const { data: extensionData } = useQuery({
    queryKey: ['/api/whatsapp/extension-status'],
    enabled: !!user,
    refetchInterval: 10000
  });

  useEffect(() => {
    if (extensionData) {
      setExtensionStatus(extensionData);
    }
  }, [extensionData]);

  // ========================================
  // CONEXÃO COM EXTENSÃO CHROME
  // ========================================

  const sendQuizDataToExtension = async (quizId: string) => {
    try {
      const quiz = quizzes.find(q => q.id === quizId);
      if (!quiz) return;

      // Buscar telefones filtrados do quiz
      const response = await apiRequest(`/api/quiz-phones/${quizId}`);
      const phoneData = await response.json();

      // Preparar dados completos para a extensão
      const extensionData = {
        type: 'QUIZ_DATA_UPDATE',
        timestamp: Date.now(),
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          phoneFilters: phoneData.phones || [],
          responseCount: phoneData.total || 0,
          variables: {
            nome: '{nome}',
            telefone: '{telefone}',
            quiz_titulo: quiz.title,
            quiz_descricao: quiz.description,
            total_respostas: phoneData.total || 0,
            data_atual: new Date().toLocaleDateString(),
            data_resposta: '{data_resposta}',
            status: '{status}',
            completacao_percentual: '{completacao_percentual}'
          }
        },
        filters: {
          completed: phoneData.phones?.filter(p => p.status === 'completed') || [],
          abandoned: phoneData.phones?.filter(p => p.status === 'abandoned') || [],
          all: phoneData.phones || []
        },
        recommendedConfig: {
          interval: 5000, // 5 segundos recomendado
          minInterval: 3000, // mínimo 3 segundos
          maxInterval: 10000, // máximo 10 segundos
          randomInterval: true,
          workingHours: { start: '09:00', end: '18:00', enabled: true },
          maxPerDay: 100
        }
      };

      // Salvar no localStorage para a extensão ler
      localStorage.setItem('vendzz_quiz_data', JSON.stringify(extensionData));
      localStorage.setItem('vendzz_quiz_selected', quizId);
      localStorage.setItem('vendzz_last_update', Date.now().toString());
      
      console.log('📤 Dados enviados para extensão:', extensionData);
      
      toast({
        title: "Dados enviados",
        description: `Quiz "${quiz.title}" enviado para a extensão com ${phoneData.total} telefones`,
      });

    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      toast({
        title: "Erro",
        description: "Falha ao preparar dados para a extensão",
        variant: "destructive"
      });
    }
  };

  const checkExtensionConnection = async () => {
    try {
      // Verificar se extensão está conectada
      const response = await apiRequest('/api/whatsapp/extension-status');
      const status = await response.json();
      
      setExtensionStatus(status);
      
      if (!status.isConnected) {
        toast({
          title: "Extensão desconectada",
          description: "Instale e ative a extensão Chrome do Vendzz",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Erro ao verificar extensão:', error);
    }
  };

  useEffect(() => {
    checkExtensionConnection();
    const interval = setInterval(checkExtensionConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // ========================================
  // CRIAÇÃO DE CAMPANHAS
  // ========================================

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    quizId: "",
    targetAudience: "all" as 'all' | 'completed' | 'abandoned',
    dateFilter: "",
    messages: [""],
    variables: {} as Record<string, string>,
    sendingConfig: {
      delay: 5,
      workingHours: { start: "09:00", end: "18:00", enabled: true },
      maxPerDay: 100,
      randomInterval: true
    }
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      const response = await apiRequest('/api/whatsapp/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/automation'] });
      setShowCreateDialog(false);
      setCurrentStep(1);
      setNewCampaign({
        name: "",
        quizId: "",
        targetAudience: "all",
        dateFilter: "",
        messages: [""],
        variables: {},
        sendingConfig: {
          delay: 5,
          workingHours: { start: "09:00", end: "18:00", enabled: true },
          maxPerDay: 100,
          randomInterval: true
        }
      });
      toast({
        title: "Campanha criada",
        description: "Campanha WhatsApp criada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar campanha",
        variant: "destructive"
      });
    }
  });

  const addMessage = () => {
    setNewCampaign(prev => ({
      ...prev,
      messages: [...prev.messages, ""]
    }));
  };

  const updateMessage = (index: number, value: string) => {
    setNewCampaign(prev => ({
      ...prev,
      messages: prev.messages.map((msg, i) => i === index ? value : msg)
    }));
  };

  const removeMessage = (index: number) => {
    if (newCampaign.messages.length > 1) {
      setNewCampaign(prev => ({
        ...prev,
        messages: prev.messages.filter((_, i) => i !== index)
      }));
    }
  };

  // ========================================
  // AÇÕES DAS CAMPANHAS
  // ========================================

  const toggleCampaignMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'pause' | 'resume' }) => {
      const response = await apiRequest(`/api/whatsapp/automation/${id}/${action}`, {
        method: 'POST'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/automation'] });
    }
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(`/api/whatsapp/automation/${id}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/automation'] });
      toast({
        title: "Campanha removida",
        description: "Campanha excluída com sucesso",
      });
    }
  });

  // ========================================
  // RENDERIZAÇÃO
  // ========================================

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campanhas WhatsApp</h1>
          <p className="text-gray-600">Automação inteligente de mensagens com integração direta</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries()}
            disabled={loadingCampaigns}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Campanha
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Campanha WhatsApp</DialogTitle>
                <DialogDescription>
                  Configure sua campanha de mensagens automatizadas
                </DialogDescription>
              </DialogHeader>
              
              {/* Wizard de criação */}
              <div className="space-y-6">
                {/* Progress */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'
                    }`}>
                      1
                    </div>
                    <span className="ml-2">Quiz & Audiência</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-gray-200">
                    <div className={`h-full bg-green-600 transition-all ${
                      currentStep >= 2 ? 'w-full' : 'w-0'
                    }`} />
                  </div>
                  <div className="flex items-center text-sm">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'
                    }`}>
                      2
                    </div>
                    <span className="ml-2">Mensagens</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-gray-200">
                    <div className={`h-full bg-green-600 transition-all ${
                      currentStep >= 3 ? 'w-full' : 'w-0'
                    }`} />
                  </div>
                  <div className="flex items-center text-sm">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'
                    }`}>
                      3
                    </div>
                    <span className="ml-2">Configurações</span>
                  </div>
                </div>

                {/* Etapa 1: Quiz e Audiência */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="campaign-name">Nome da Campanha</Label>
                      <Input
                        id="campaign-name"
                        value={newCampaign.name}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Leads Abandonados - Produto X"
                      />
                    </div>

                    <div>
                      <Label htmlFor="quiz-select">Selecionar Quiz</Label>
                      <Select
                        value={newCampaign.quizId}
                        onValueChange={(value) => {
                          setNewCampaign(prev => ({ ...prev, quizId: value }));
                          sendQuizDataToExtension(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha um quiz" />
                        </SelectTrigger>
                        <SelectContent>
                          {quizzes.map((quiz: any) => (
                            <SelectItem key={quiz.id} value={quiz.id}>
                              {quiz.title} ({quiz.responseCount || 0} respostas)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="audience-select">Público Alvo</Label>
                      <Select
                        value={newCampaign.targetAudience}
                        onValueChange={(value: 'all' | 'completed' | 'abandoned') => 
                          setNewCampaign(prev => ({ ...prev, targetAudience: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2 text-blue-500" />
                              Todos os Leads
                            </div>
                          </SelectItem>
                          <SelectItem value="completed">
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              Quiz Completo
                            </div>
                          </SelectItem>
                          <SelectItem value="abandoned">
                            <div className="flex items-center">
                              <XCircle className="h-4 w-4 mr-2 text-orange-500" />
                              Quiz Abandonado
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="date-filter">Filtro de Data (Leads a partir de)</Label>
                      <Input
                        id="date-filter"
                        type="date"
                        value={newCampaign.dateFilter}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, dateFilter: e.target.value }))}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Apenas leads que responderam o quiz a partir desta data
                      </p>
                    </div>

                    <Button 
                      onClick={() => setCurrentStep(2)} 
                      className="w-full"
                      disabled={!newCampaign.name || !newCampaign.quizId}
                    >
                      Próximo: Configurar Mensagens
                    </Button>
                  </div>
                )}

                {/* Etapa 2: Mensagens Rotativas */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Mensagens Rotativas</Label>
                      <p className="text-sm text-gray-500 mb-3">
                        Configure diferentes mensagens que serão enviadas alternadamente
                      </p>
                      
                      {newCampaign.messages.map((message, index) => (
                        <div key={index} className="flex gap-2 mb-3">
                          <div className="flex-1">
                            <Textarea
                              value={message}
                              onChange={(e) => updateMessage(index, e.target.value)}
                              placeholder={`Mensagem ${index + 1}...`}
                              rows={3}
                            />
                          </div>
                          {newCampaign.messages.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeMessage(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        onClick={addMessage}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Mensagem
                      </Button>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Variáveis disponíveis:</strong><br />
                        {`{nome}, {telefone}, {quiz_titulo}, {quiz_descricao}, {data_resposta}, {completacao_percentual}`}
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setCurrentStep(1)}>
                        Voltar
                      </Button>
                      <Button 
                        onClick={() => setCurrentStep(3)} 
                        className="flex-1"
                        disabled={!newCampaign.messages.some(msg => msg.trim())}
                      >
                        Próximo: Configurações de Envio
                      </Button>
                    </div>
                  </div>
                )}

                {/* Etapa 3: Configurações de Envio */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="delay">Intervalo entre envios (segundos)</Label>
                        <Input
                          id="delay"
                          type="number"
                          min="1"
                          max="3600"
                          value={newCampaign.sendingConfig.delay}
                          onChange={(e) => setNewCampaign(prev => ({
                            ...prev,
                            sendingConfig: { ...prev.sendingConfig, delay: parseInt(e.target.value) || 5 }
                          }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="max-per-day">Máximo por dia</Label>
                        <Input
                          id="max-per-day"
                          type="number"
                          min="1"
                          max="1000"
                          value={newCampaign.sendingConfig.maxPerDay}
                          onChange={(e) => setNewCampaign(prev => ({
                            ...prev,
                            sendingConfig: { ...prev.sendingConfig, maxPerDay: parseInt(e.target.value) || 100 }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newCampaign.sendingConfig.workingHours.enabled}
                        onCheckedChange={(checked) => setNewCampaign(prev => ({
                          ...prev,
                          sendingConfig: { 
                            ...prev.sendingConfig, 
                            workingHours: { ...prev.sendingConfig.workingHours, enabled: checked }
                          }
                        }))}
                      />
                      <Label>Respeitar horário comercial</Label>
                    </div>

                    {newCampaign.sendingConfig.workingHours.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start-time">Início</Label>
                          <Input
                            id="start-time"
                            type="time"
                            value={newCampaign.sendingConfig.workingHours.start}
                            onChange={(e) => setNewCampaign(prev => ({
                              ...prev,
                              sendingConfig: { 
                                ...prev.sendingConfig, 
                                workingHours: { ...prev.sendingConfig.workingHours, start: e.target.value }
                              }
                            }))}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="end-time">Fim</Label>
                          <Input
                            id="end-time"
                            type="time"
                            value={newCampaign.sendingConfig.workingHours.end}
                            onChange={(e) => setNewCampaign(prev => ({
                              ...prev,
                              sendingConfig: { 
                                ...prev.sendingConfig, 
                                workingHours: { ...prev.sendingConfig.workingHours, end: e.target.value }
                              }
                            }))}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newCampaign.sendingConfig.randomInterval}
                        onCheckedChange={(checked) => setNewCampaign(prev => ({
                          ...prev,
                          sendingConfig: { ...prev.sendingConfig, randomInterval: checked }
                        }))}
                      />
                      <Label>Intervalo aleatório (mais natural)</Label>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setCurrentStep(2)}>
                        Voltar
                      </Button>
                      <Button 
                        onClick={() => createCampaignMutation.mutate(newCampaign)} 
                        className="flex-1"
                        disabled={createCampaignMutation.isPending}
                      >
                        {createCampaignMutation.isPending ? 'Criando...' : 'Criar Campanha'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status da Extensão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Status da Conexão WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                extensionStatus.isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm">
                {extensionStatus.isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                extensionStatus.isActive ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm">
                {extensionStatus.isActive ? 'Ativo' : 'Pausado'}
              </span>
            </div>
            
            <div className="text-sm">
              <span className="text-gray-500">Telefones:</span> {extensionStatus.phoneCount}
            </div>
            
            <div className="text-sm">
              <span className="text-gray-500">Última sync:</span> {extensionStatus.lastSync}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Campanhas */}
      <div className="grid gap-6">
        {loadingCampaigns ? (
          <div className="text-center py-8">Carregando campanhas...</div>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma campanha criada</h3>
              <p className="text-gray-600 mb-4">
                Crie sua primeira campanha WhatsApp para começar a enviar mensagens automatizadas
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Campanha
              </Button>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign: WhatsAppCampaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {campaign.name}
                      <Badge variant={
                        campaign.status === 'active' ? 'default' : 
                        campaign.status === 'paused' ? 'secondary' : 'outline'
                      }>
                        {campaign.status === 'active' ? 'Ativa' : 
                         campaign.status === 'paused' ? 'Pausada' : 'Finalizada'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Quiz: {campaign.quizTitle} • Público: {
                        campaign.targetAudience === 'all' ? 'Todos' :
                        campaign.targetAudience === 'completed' ? 'Completos' : 'Abandonados'
                      }
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCampaignMutation.mutate({
                        id: campaign.id,
                        action: campaign.status === 'active' ? 'pause' : 'resume'
                      })}
                    >
                      {campaign.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCampaignMutation.mutate(campaign.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {campaign.stats.sent}
                    </div>
                    <div className="text-sm text-gray-500">Enviadas</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {campaign.stats.delivered}
                    </div>
                    <div className="text-sm text-gray-500">Entregues</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {campaign.stats.opened}
                    </div>
                    <div className="text-sm text-gray-500">Abertas</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {campaign.stats.failed}
                    </div>
                    <div className="text-sm text-gray-500">Falharam</div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Mensagens: {campaign.messages.length} rotativas</span>
                    <span>Criada em: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}