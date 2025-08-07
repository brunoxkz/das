import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Send, Bot, Settings, BarChart3, MessageCircle, Users, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TelegramCampaigns() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // States para configuração do bot
  const [botConfig, setBotConfig] = useState({
    botToken: '',
    botName: '',
    webhookUrl: ''
  });

  // States para nova campanha
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    quizId: '',
    messages: [''],
    targetAudience: 'all',
    triggerDelay: 10,
    triggerUnit: 'minutes',
    campaignMode: 'leads_ja_na_base'
  });

  // Buscar campanhas existentes
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/telegram-campaigns'],
    retry: false
  });

  // Buscar quizzes do usuário
  const { data: quizzesData } = useQuery({
    queryKey: ['/api/quizzes'],
    retry: false
  });

  // Buscar templates
  const { data: templatesData } = useQuery({
    queryKey: ['/api/telegram-templates'],
    retry: false
  });

  // Buscar analytics
  const { data: analyticsData } = useQuery({
    queryKey: ['/api/telegram-bot/analytics'],
    retry: false
  });

  // Mutation para configurar bot
  const configBotMutation = useMutation({
    mutationFn: async (config) => {
      return await apiRequest('POST', '/api/telegram-bot/config', config);
    },
    onSuccess: () => {
      toast({
        title: "Bot Configurado",
        description: "Telegram Bot configurado com sucesso!"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao configurar bot",
        variant: "destructive"
      });
    }
  });

  // Mutation para testar conexão
  const testConnectionMutation = useMutation({
    mutationFn: async (botToken) => {
      return await apiRequest('POST', '/api/telegram-bot/test-connection', { botToken });
    },
    onSuccess: (data) => {
      toast({
        title: "Conexão Testada",
        description: data.message || "Conexão estabelecida com sucesso!"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro de Conexão",
        description: error.message || "Falha ao conectar com Telegram Bot API",
        variant: "destructive"
      });
    }
  });

  // Mutation para criar campanha
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData) => {
      return await apiRequest('POST', '/api/telegram-campaigns', campaignData);
    },
    onSuccess: () => {
      toast({
        title: "Campanha Criada",
        description: "Campanha Telegram criada com sucesso!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/telegram-campaigns'] });
      // Reset form
      setNewCampaign({
        name: '',
        quizId: '',
        messages: [''],
        targetAudience: 'all',
        triggerDelay: 10,
        triggerUnit: 'minutes',
        campaignMode: 'leads_ja_na_base'
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar campanha",
        variant: "destructive"
      });
    }
  });

  // Mutation para enviar mensagem de teste
  const sendTestMutation = useMutation({
    mutationFn: async (testData) => {
      return await apiRequest('POST', '/api/telegram-bot/send-test', testData);
    },
    onSuccess: () => {
      toast({
        title: "Mensagem Enviada",
        description: "Mensagem de teste enviada com sucesso!"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar mensagem de teste",
        variant: "destructive"
      });
    }
  });

  // Funções auxiliares
  const addMessage = () => {
    setNewCampaign(prev => ({
      ...prev,
      messages: [...prev.messages, '']
    }));
  };

  const updateMessage = (index, value) => {
    setNewCampaign(prev => ({
      ...prev,
      messages: prev.messages.map((msg, i) => i === index ? value : msg)
    }));
  };

  const removeMessage = (index) => {
    setNewCampaign(prev => ({
      ...prev,
      messages: prev.messages.filter((_, i) => i !== index)
    }));
  };

  const quizzes = quizzesData?.quizzes || [];
  const templates = templatesData?.templates || [];
  const analytics = analyticsData?.analytics || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Send className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Telegram Marketing
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-3xl mx-auto">
            Sistema completo de automação via Telegram Bot API. Crie campanhas personalizadas e automatize o engajamento com seus leads através do Telegram.
          </p>
        </div>

        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Campanhas
            </TabsTrigger>
            <TabsTrigger value="bot-config" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Bot Config
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Aba Campanhas */}
          <TabsContent value="campaigns" className="space-y-6">
            
            {/* Estatísticas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Mensagens Enviadas</p>
                      <p className="text-2xl font-bold text-blue-600">{analytics.messagesSent || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Taxa de Entrega</p>
                      <p className="text-2xl font-bold text-green-600">{analytics.deliveryRate || '0%'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Taxa de Leitura</p>
                      <p className="text-2xl font-bold text-cyan-600">{analytics.readRate || '0%'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Send className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Taxa de Resposta</p>
                      <p className="text-2xl font-bold text-purple-600">{analytics.responseRate || '0%'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Nova Campanha */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Nova Campanha Telegram
                </CardTitle>
                <CardDescription>
                  Crie uma nova campanha automatizada via Telegram Bot. Todas as campanhas são GRATUITAS e ILIMITADAS.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="campaignName">Nome da Campanha</Label>
                    <Input
                      id="campaignName"
                      placeholder="Ex: Boas-vindas Telegram"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quizSelect">Quiz</Label>
                    <Select 
                      value={newCampaign.quizId} 
                      onValueChange={(value) => setNewCampaign(prev => ({ ...prev, quizId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um quiz" />
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Audiência Alvo</Label>
                    <Select 
                      value={newCampaign.targetAudience} 
                      onValueChange={(value) => setNewCampaign(prev => ({ ...prev, targetAudience: value }))}
                    >
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

                  <div className="space-y-2">
                    <Label htmlFor="triggerDelay">Delay do Disparo</Label>
                    <Input
                      id="triggerDelay"
                      type="number"
                      min="1"
                      value={newCampaign.triggerDelay}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, triggerDelay: parseInt(e.target.value) || 1 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="triggerUnit">Unidade</Label>
                    <Select 
                      value={newCampaign.triggerUnit} 
                      onValueChange={(value) => setNewCampaign(prev => ({ ...prev, triggerUnit: value }))}
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

                {/* Mensagens */}
                <div className="space-y-4">
                  <Label>Mensagens da Campanha</Label>
                  {newCampaign.messages.map((message, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        placeholder={`Mensagem ${index + 1} - Use {nome}, {email}, {telefone} para personalizar`}
                        value={message}
                        onChange={(e) => updateMessage(index, e.target.value)}
                        className="min-h-[80px]"
                      />
                      {newCampaign.messages.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeMessage(index)}
                          className="mt-2"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={addMessage}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Mensagem
                  </Button>
                </div>

                <Button 
                  onClick={() => createCampaignMutation.mutate(newCampaign)}
                  disabled={!newCampaign.name || !newCampaign.quizId || newCampaign.messages.some(m => !m.trim()) || createCampaignMutation.isPending}
                  className="w-full"
                >
                  {createCampaignMutation.isPending ? 'Criando...' : 'Criar Campanha Telegram'}
                </Button>
              </CardContent>
            </Card>

            {/* Lista de Campanhas */}
            <Card>
              <CardHeader>
                <CardTitle>Campanhas Ativas</CardTitle>
                <CardDescription>
                  Gerencie suas campanhas Telegram em execução
                </CardDescription>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-2 text-slate-600">Carregando campanhas...</p>
                  </div>
                ) : campaigns?.campaigns?.length > 0 ? (
                  <div className="space-y-4">
                    {campaigns.campaigns.map((campaign) => (
                      <div key={campaign.id} className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{campaign.name}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Quiz: {campaign.quizTitle} • {campaign.totalPhones} telefones
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                              {campaign.status === 'active' ? 'Ativo' : 'Pausado'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600 dark:text-slate-400">Enviadas:</span>
                            <span className="ml-1 font-medium">{campaign.messagesSent || 0}</span>
                          </div>
                          <div>
                            <span className="text-slate-600 dark:text-slate-400">Entregues:</span>
                            <span className="ml-1 font-medium">{campaign.messagesDelivered || 0}</span>
                          </div>
                          <div>
                            <span className="text-slate-600 dark:text-slate-400">Lidas:</span>
                            <span className="ml-1 font-medium">{campaign.messagesRead || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma campanha Telegram criada ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Configuração do Bot */}
          <TabsContent value="bot-config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Configuração do Telegram Bot
                </CardTitle>
                <CardDescription>
                  Configure seu bot do Telegram para envio automático de mensagens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="botToken">Token do Bot</Label>
                  <Input
                    id="botToken"
                    type="password"
                    placeholder="Ex: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    value={botConfig.botToken}
                    onChange={(e) => setBotConfig(prev => ({ ...prev, botToken: e.target.value }))}
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Obtenha seu token do @BotFather no Telegram
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="botName">Nome do Bot</Label>
                  <Input
                    id="botName"
                    placeholder="Ex: Meu Bot Marketing"
                    value={botConfig.botName}
                    onChange={(e) => setBotConfig(prev => ({ ...prev, botName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">URL do Webhook (Opcional)</Label>
                  <Input
                    id="webhookUrl"
                    placeholder="https://seusite.com/webhook"
                    value={botConfig.webhookUrl}
                    onChange={(e) => setBotConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => testConnectionMutation.mutate(botConfig.botToken)}
                    disabled={!botConfig.botToken || testConnectionMutation.isPending}
                    variant="outline"
                  >
                    {testConnectionMutation.isPending ? 'Testando...' : 'Testar Conexão'}
                  </Button>
                  
                  <Button 
                    onClick={() => configBotMutation.mutate(botConfig)}
                    disabled={!botConfig.botToken || configBotMutation.isPending}
                  >
                    {configBotMutation.isPending ? 'Salvando...' : 'Salvar Configuração'}
                  </Button>
                </div>

                {/* Teste de Mensagem */}
                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold">Teste de Mensagem</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Chat ID (ex: 123456789)"
                      onChange={(e) => setBotConfig(prev => ({ ...prev, testChatId: e.target.value }))}
                    />
                    <Input
                      placeholder="Mensagem de teste"
                      onChange={(e) => setBotConfig(prev => ({ ...prev, testMessage: e.target.value }))}
                    />
                  </div>
                  <Button 
                    onClick={() => sendTestMutation.mutate({
                      chatId: botConfig.testChatId,
                      message: botConfig.testMessage,
                      botToken: botConfig.botToken
                    })}
                    disabled={!botConfig.testChatId || !botConfig.testMessage || !botConfig.botToken || sendTestMutation.isPending}
                    variant="outline"
                    className="w-full"
                  >
                    {sendTestMutation.isPending ? 'Enviando...' : 'Enviar Mensagem de Teste'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Templates */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Templates de Mensagem</CardTitle>
                <CardDescription>
                  Templates pré-configurados para suas campanhas Telegram
                </CardDescription>
              </CardHeader>
              <CardContent>
                {templates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <div key={template.id} className="p-4 border rounded-lg">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant="secondary" className="my-2">
                          {template.category}
                        </Badge>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                          {template.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            Variáveis: {template.variables.join(', ')}
                          </span>
                          <Button size="sm" variant="outline">
                            Usar Template
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                    <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum template disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Analytics Telegram
                </CardTitle>
                <CardDescription>
                  Métricas detalhadas das suas campanhas Telegram
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Mensagens Enviadas</p>
                    <p className="text-3xl font-bold">{analytics.messagesSent || 0}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Taxa de Entrega</p>
                    <p className="text-3xl font-bold text-green-600">{analytics.deliveryRate || '0%'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Taxa de Leitura</p>
                    <p className="text-3xl font-bold text-blue-600">{analytics.readRate || '0%'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Taxa de Resposta</p>
                    <p className="text-3xl font-bold text-purple-600">{analytics.responseRate || '0%'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Bots Ativos</p>
                    <p className="text-3xl font-bold">{analytics.bots?.active || 0}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total de Chats</p>
                    <p className="text-3xl font-bold">{analytics.bots?.totalChats || 0}</p>
                  </div>
                </div>

                {analytics.last30Days && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-4">Últimos 30 Dias</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Mensagens Enviadas</p>
                        <p className="text-xl font-bold">{analytics.last30Days.messagesSent}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Tempo Médio de Resposta</p>
                        <p className="text-xl font-bold">{analytics.last30Days.averageResponseTime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Campanha Top</p>
                        <p className="text-xl font-bold">{analytics.last30Days.topPerformingCampaign}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}