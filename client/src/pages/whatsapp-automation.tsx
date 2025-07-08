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
import { MessageSquare, Send, Users, CheckCircle, XCircle, Phone, Search, AlertCircle, Edit, Pause, Play, Trash2, Clock3, Smartphone, Eye, Settings, Plus, RefreshCw, Calendar, Filter, Zap, Target, BarChart3 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface Quiz {
  id: string;
  title: string;
  description: string;
}

interface AutomationCampaign {
  id: string;
  name: string;
  quizId: string;
  quizTitle: string;
  status: 'active' | 'paused' | 'completed';
  messages: string[];
  targetAudience: 'all' | 'completed' | 'abandoned';
  timing: {
    type: 'immediate' | 'delayed';
    delayMinutes?: number;
  };
  workingHours: {
    start: string;
    end: string;
    enabled: boolean;
  };
  limits: {
    messagesPerDay: number;
    intervalSeconds: number;
  };
  stats: {
    contactsDetected: number;
    messagesSent: number;
    messagesDelivered: number;
    successRate: number;
  };
  createdAt: string;
}

export default function WhatsAppAutomation() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    messages: [''],
    targetAudience: 'all' as const,
    timing: { type: 'immediate' as const, delayMinutes: 10 },
    workingHours: { start: '09:00', end: '18:00', enabled: true },
    limits: { messagesPerDay: 200, intervalSeconds: 5 }
  });

  // Queries
  const { data: quizzes = [], isLoading: quizzesLoading } = useQuery({
    queryKey: ['/api/quizzes'],
    enabled: !!user
  });

  const { data: campaigns = [], isLoading: campaignsLoading, refetch: refetchCampaigns } = useQuery({
    queryKey: ['/api/whatsapp/automation'],
    enabled: !!user
  });

  const { data: extensionStatus } = useQuery({
    queryKey: ['/api/whatsapp/extension-status'],
    enabled: !!user,
    refetchInterval: 10000 // Atualizar a cada 10 segundos
  });

  // Mutations
  const activateQuizMutation = useMutation({
    mutationFn: async (quizId: string) => {
      return apiRequest(`/api/whatsapp/activate-quiz`, {
        method: 'POST',
        body: JSON.stringify({ quizId })
      });
    },
    onSuccess: () => {
      toast({ title: "Quiz ativado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/extension-status'] });
    }
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      return apiRequest(`/api/whatsapp/automation`, {
        method: 'POST',
        body: JSON.stringify(campaignData)
      });
    },
    onSuccess: () => {
      toast({ title: "Campanha criada com sucesso!" });
      refetchCampaigns();
      setNewCampaign({
        name: '',
        messages: [''],
        targetAudience: 'all',
        timing: { type: 'immediate', delayMinutes: 10 },
        workingHours: { start: '09:00', end: '18:00', enabled: true },
        limits: { messagesPerDay: 200, intervalSeconds: 5 }
      });
    }
  });

  const toggleCampaignMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'pause' | 'resume' }) => {
      return apiRequest(`/api/whatsapp/automation/${id}/${action}`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      refetchCampaigns();
    }
  });

  // Handlers
  const handleActivateQuiz = async (quizId: string) => {
    setActiveQuiz(quizId);
    await activateQuizMutation.mutateAsync(quizId);
  };

  const handleAddMessage = () => {
    if (newCampaign.messages.length < 10) {
      setNewCampaign(prev => ({
        ...prev,
        messages: [...prev.messages, '']
      }));
    }
  };

  const handleRemoveMessage = (index: number) => {
    if (newCampaign.messages.length > 1) {
      setNewCampaign(prev => ({
        ...prev,
        messages: prev.messages.filter((_, i) => i !== index)
      }));
    }
  };

  const handleUpdateMessage = (index: number, value: string) => {
    setNewCampaign(prev => ({
      ...prev,
      messages: prev.messages.map((msg, i) => i === index ? value : msg)
    }));
  };

  const handleCreateCampaign = async () => {
    if (!activeQuiz) {
      toast({ title: "Erro", description: "Selecione um quiz primeiro", variant: "destructive" });
      return;
    }

    if (newCampaign.messages.filter(m => m.trim()).length < 4) {
      toast({ title: "Erro", description: "Adicione pelo menos 4 mensagens diferentes", variant: "destructive" });
      return;
    }

    const campaignData = {
      ...newCampaign,
      quizId: activeQuiz,
      messages: newCampaign.messages.filter(m => m.trim())
    };

    await createCampaignMutation.mutateAsync(campaignData);
  };

  if (quizzesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automação WhatsApp</h1>
          <p className="text-gray-600">Configure campanhas inteligentes e automação completa</p>
        </div>
        <Badge variant={extensionStatus?.connected ? "default" : "destructive"} className="text-sm">
          <Smartphone className="w-4 h-4 mr-1" />
          Extensão {extensionStatus?.connected ? 'Conectada' : 'Desconectada'}
        </Badge>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Configuração</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="extension">Extensão</TabsTrigger>
        </TabsList>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quiz Ativo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Quiz Ativo para WhatsApp
                </CardTitle>
                <CardDescription>
                  Selecione qual quiz será usado para capturar contatos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={activeQuiz || ''} onValueChange={handleActivateQuiz}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar quiz..." />
                  </SelectTrigger>
                  <SelectContent>
                    {quizzes.map((quiz: Quiz) => (
                      <SelectItem key={quiz.id} value={quiz.id}>
                        {quiz.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {activeQuiz && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Quiz ativo! A extensão detectará automaticamente novos contatos.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Estatísticas Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Estatísticas em Tempo Real
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {extensionStatus?.contactsDetected || 0}
                    </div>
                    <div className="text-sm text-gray-500">Contatos Detectados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {extensionStatus?.messagesSent || 0}
                    </div>
                    <div className="text-sm text-gray-500">Mensagens Enviadas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {extensionStatus?.successRate || 100}%
                    </div>
                    <div className="text-sm text-gray-500">Taxa de Sucesso</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {campaigns.filter((c: AutomationCampaign) => c.status === 'active').length}
                    </div>
                    <div className="text-sm text-gray-500">Campanhas Ativas</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Criar Nova Campanha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Criar Nova Campanha
              </CardTitle>
              <CardDescription>
                Configure uma campanha de automação completa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nome da Campanha */}
              <div>
                <Label htmlFor="campaign-name">Nome da Campanha</Label>
                <Input
                  id="campaign-name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Campanha Emagrecimento Janeiro"
                />
              </div>

              {/* Mensagens Rotativas */}
              <div>
                <Label>Mensagens Rotativas (mínimo 4)</Label>
                <div className="space-y-3 mt-2">
                  {newCampaign.messages.map((message, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1">
                        <Textarea
                          value={message}
                          onChange={(e) => handleUpdateMessage(index, e.target.value)}
                          placeholder={`Mensagem ${index + 1}...`}
                          rows={2}
                        />
                      </div>
                      {newCampaign.messages.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMessage(index)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={handleAddMessage}
                    disabled={newCampaign.messages.length >= 10}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Mensagem
                  </Button>
                </div>
              </div>

              {/* Configurações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Público-alvo */}
                <div>
                  <Label>Público-alvo</Label>
                  <Select
                    value={newCampaign.targetAudience}
                    onValueChange={(value: any) => setNewCampaign(prev => ({ ...prev, targetAudience: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Contatos</SelectItem>
                      <SelectItem value="completed">Quiz Completos</SelectItem>
                      <SelectItem value="abandoned">Quiz Abandonados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Timing */}
                <div>
                  <Label>Timing de Envio</Label>
                  <div className="flex gap-2">
                    <Select
                      value={newCampaign.timing.type}
                      onValueChange={(value: any) => setNewCampaign(prev => ({
                        ...prev,
                        timing: { ...prev.timing, type: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Imediato</SelectItem>
                        <SelectItem value="delayed">Agendado</SelectItem>
                      </SelectContent>
                    </Select>
                    {newCampaign.timing.type === 'delayed' && (
                      <Input
                        type="number"
                        value={newCampaign.timing.delayMinutes}
                        onChange={(e) => setNewCampaign(prev => ({
                          ...prev,
                          timing: { ...prev.timing, delayMinutes: parseInt(e.target.value) }
                        }))}
                        placeholder="Minutos"
                        className="w-24"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Criar Campanha */}
              <Button
                onClick={handleCreateCampaign}
                disabled={!activeQuiz || createCampaignMutation.isPending}
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                {createCampaignMutation.isPending ? 'Criando...' : 'Criar Campanha'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campanhas Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Ativas</CardTitle>
              <CardDescription>
                Gerencie suas campanhas de automação
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map((campaign: AutomationCampaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{campaign.name}</h3>
                          <p className="text-sm text-gray-600">
                            Quiz: {campaign.quizTitle} | Público: {
                              campaign.targetAudience === 'completed' ? 'Completos' :
                              campaign.targetAudience === 'abandoned' ? 'Abandonados' : 'Todos'
                            }
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status === 'active' ? 'Ativa' : 'Pausada'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleCampaignMutation.mutate({
                              id: campaign.id,
                              action: campaign.status === 'active' ? 'pause' : 'resume'
                            })}
                          >
                            {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{campaign.stats.contactsDetected}</div>
                          <div className="text-gray-500">Contatos</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{campaign.stats.messagesSent}</div>
                          <div className="text-gray-500">Enviadas</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-purple-600">{campaign.stats.messagesDelivered}</div>
                          <div className="text-gray-500">Entregues</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-orange-600">{campaign.stats.successRate}%</div>
                          <div className="text-gray-500">Sucesso</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma campanha criada ainda
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Detalhados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Analytics detalhados em desenvolvimento
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Extension Tab */}
        <TabsContent value="extension">
          <Card>
            <CardHeader>
              <CardTitle>Status da Extensão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Status de Conexão</span>
                  <Badge variant={extensionStatus?.connected ? "default" : "destructive"}>
                    {extensionStatus?.connected ? 'Conectada' : 'Desconectada'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Último Ping</span>
                  <span className="text-sm text-gray-600">
                    {extensionStatus?.lastPing ? new Date(extensionStatus.lastPing).toLocaleString() : 'Nunca'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Versão</span>
                  <span className="text-sm text-gray-600">{extensionStatus?.version || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}