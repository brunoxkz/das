import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Bot, MessageCircle, Send, Users, Settings, Check, X, AlertCircle, Download, Zap, Globe } from "lucide-react";

export default function TelegramAutomation() {
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'completed' | 'abandoned'>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [botToken, setBotToken] = useState<string>('');
  const [chatId, setChatId] = useState<string>('');
  const [testMessage, setTestMessage] = useState<string>('Olá! Esta é uma mensagem de teste do Telegram.');
  const [syncData, setSyncData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's quizzes
  const { data: quizzes, isLoading: isLoadingQuizzes } = useQuery({
    queryKey: ['/api/quizzes'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch bot status
  const { data: botStatus, isLoading: isLoadingBotStatus } = useQuery({
    queryKey: ['/api/telegram-bot/status'],
    staleTime: 30 * 1000, // 30 seconds
  });

  // Configure bot mutation
  const configureBotMutation = useMutation({
    mutationFn: async (data: { botToken: string; chatId?: string }) => {
      return await apiRequest('POST', '/api/telegram-bot/config', data);
    },
    onSuccess: (data) => {
      toast({
        title: "Bot configurado com sucesso!",
        description: `Bot ${data.botInfo.username} está conectado`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/telegram-bot/status'] });
      setBotToken('');
      setChatId('');
    },
    onError: (error: any) => {
      toast({
        title: "Erro na configuração",
        description: error.message || "Não foi possível configurar o bot",
        variant: "destructive",
      });
    },
  });

  // Test bot connection mutation
  const testBotMutation = useMutation({
    mutationFn: async (data: { botToken: string; chatId?: string; message?: string }) => {
      return await apiRequest('POST', '/api/telegram/test', data);
    },
    onSuccess: (data) => {
      if (data.messageSent) {
        toast({
          title: "Teste realizado com sucesso!",
          description: `Mensagem enviada para ${data.botInfo.username}`,
        });
      } else {
        toast({
          title: "Bot conectado",
          description: `Bot ${data.botInfo.username} está funcionando`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro no teste",
        description: error.message || "Não foi possível testar o bot",
        variant: "destructive",
      });
    },
  });

  // Generate automation file
  const generateAutomationFile = async () => {
    if (!selectedQuiz) {
      toast({
        title: "Selecione um quiz",
        description: "Por favor, selecione um quiz para sincronizar",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiRequest('POST', '/api/telegram-automation-file', {
        quizId: selectedQuiz,
        targetAudience,
        dateFilter: dateFilter || null,
      });

      setSyncData(response);
      toast({
        title: "Funil sincronizado!",
        description: `${response.totalContacts} contatos prontos para Telegram`,
      });
    } catch (error: any) {
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível gerar o arquivo",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Send bulk messages
  const sendBulkMessages = async () => {
    if (!selectedQuiz || !message.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um quiz e digite a mensagem",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const response = await apiRequest('POST', '/api/telegram/send-bulk', {
        quizId: selectedQuiz,
        message: message.trim(),
        targetAudience,
      });

      toast({
        title: "Mensagens enviadas!",
        description: `${response.totalSent} mensagens enviadas via Telegram`,
      });
      setMessage('');
    } catch (error: any) {
      toast({
        title: "Erro no envio",
        description: error.message || "Não foi possível enviar as mensagens",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleConfigureBot = () => {
    if (!botToken.trim()) {
      toast({
        title: "Token obrigatório",
        description: "Por favor, insira o token do bot Telegram",
        variant: "destructive",
      });
      return;
    }

    configureBotMutation.mutate({
      botToken: botToken.trim(),
      chatId: chatId.trim() || undefined,
    });
  };

  const handleTestBot = () => {
    if (!botToken.trim()) {
      toast({
        title: "Token obrigatório",
        description: "Por favor, insira o token do bot Telegram",
        variant: "destructive",
      });
      return;
    }

    testBotMutation.mutate({
      botToken: botToken.trim(),
      chatId: chatId.trim() || undefined,
      message: testMessage.trim() || undefined,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Automação Telegram
        </h1>
        <p className="text-xl text-muted-foreground">
          Sistema de automação avançada para Telegram - Mais poderoso que WhatsApp!
        </p>
      </div>

      {/* Advantages Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Vantagens do Telegram vs WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-green-700 flex items-center gap-2">
                <Check className="h-4 w-4" />
                ✅ Telegram (Recomendado)
              </h3>
              <ul className="text-sm space-y-1 text-green-600">
                <li>• API oficial gratuita</li>
                <li>• Envio ilimitado de mensagens</li>
                <li>• Bots nativos suportados</li>
                <li>• Sem risco de banimento</li>
                <li>• Extensões Chrome estáveis</li>
                <li>• Web Apps integradas</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-red-700 flex items-center gap-2">
                <X className="h-4 w-4" />
                ❌ WhatsApp (Limitado)
              </h3>
              <ul className="text-sm space-y-1 text-red-600">
                <li>• API paga e restrita</li>
                <li>• Limites de envio rigorosos</li>
                <li>• Risco de banimento</li>
                <li>• Aprovação manual necessária</li>
                <li>• Extensões instáveis</li>
                <li>• Foco apenas em suporte</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="bot">Configurar Bot</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Sincronize seu Funil com Telegram (ROI +45%)
              </CardTitle>
              <CardDescription>
                Telegram oferece API oficial com muito mais recursos que WhatsApp! Sem limitações de envio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz-select">Selecionar Quiz</Label>
                  <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
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

                <div className="space-y-2">
                  <Label htmlFor="audience-select">Público-Alvo</Label>
                  <Select value={targetAudience} onValueChange={setTargetAudience}>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-filter">Filtrar por Data (opcional)</Label>
                <Input
                  id="date-filter"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={generateAutomationFile}
                  disabled={isGenerating || !selectedQuiz}
                  className="flex-1"
                >
                  {isGenerating ? 'Gerando...' : 'Sincronizar Funil'}
                </Button>
              </div>

              {syncData && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Sincronizado:</strong> {syncData.totalContacts} contatos encontrados 
                    para o quiz "{syncData.quizTitle}"
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Enviar Mensagens</h3>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Olá {nome_completo}! Temos uma oferta especial para você..."
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    Use {'{nome_completo}'} para personalizar a mensagem
                  </p>
                </div>

                <Button 
                  onClick={sendBulkMessages}
                  disabled={isSending || !selectedQuiz || !message.trim()}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSending ? 'Enviando...' : 'Enviar Mensagens'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bot Configuration Tab */}
        <TabsContent value="bot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Configurar Bot Telegram
              </CardTitle>
              <CardDescription>
                Crie um bot no @BotFather e configure as credenciais aqui
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bot Status */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Status do Bot</p>
                  <p className="text-sm text-muted-foreground">
                    {botStatus?.connected ? 'Bot Conectado' : 'Bot Desconectado'}
                  </p>
                </div>
                <Badge variant={botStatus?.connected ? 'default' : 'secondary'}>
                  {botStatus?.connected ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Conectado
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3 mr-1" />
                      Desconectado
                    </>
                  )}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bot-token">Token do Bot</Label>
                <Input
                  id="bot-token"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                />
                <p className="text-sm text-muted-foreground">
                  Obtenha no @BotFather: /newbot → nome do bot → @username → copie o token
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chat-id">Chat ID (opcional)</Label>
                <Input
                  id="chat-id"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="123456789"
                />
                <p className="text-sm text-muted-foreground">
                  Para testes: fale com @userinfobot para obter seu Chat ID
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-message">Mensagem de Teste</Label>
                <Textarea
                  id="test-message"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleTestBot}
                  disabled={testBotMutation.isPending || !botToken.trim()}
                  variant="outline"
                  className="flex-1"
                >
                  {testBotMutation.isPending ? 'Testando...' : 'Testar Conexão'}
                </Button>
                <Button 
                  onClick={handleConfigureBot}
                  disabled={configureBotMutation.isPending || !botToken.trim()}
                  className="flex-1"
                >
                  {configureBotMutation.isPending ? 'Configurando...' : 'Configurar Bot'}
                </Button>
              </div>

              {/* How to create bot */}
              <Card className="bg-muted">
                <CardHeader>
                  <CardTitle className="text-lg">Como criar um bot:</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Abra o Telegram e procure por @BotFather</li>
                    <li>Digite /newbot e siga as instruções</li>
                    <li>Copie o token gerado e cole acima</li>
                    <li>Seu bot estará pronto para uso!</li>
                  </ol>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Campanhas Telegram
              </CardTitle>
              <CardDescription>
                Gerencie suas campanhas de Telegram com muito mais liberdade que WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Globe className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">🚀 Campanhas Telegram em desenvolvimento</h3>
                <p className="text-muted-foreground">
                  Use a aba Dashboard para funcionalidades básicas.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                API Telegram
              </CardTitle>
              <CardDescription>
                Integração com a API oficial do Telegram - muito mais poderosa que WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">🔥 Recursos Avançados da API</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>• Envio de mensagens em massa</li>
                    <li>• Mídia (fotos, vídeos, documentos)</li>
                    <li>• Teclados inline personalizados</li>
                    <li>• Web Apps integradas</li>
                    <li>• Callbacks e webhooks</li>
                    <li>• Grupos e canais</li>
                  </ul>
                </CardContent>
              </Card>
              
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">🔧 Recursos avançados da API em desenvolvimento</h3>
                <p className="text-muted-foreground">
                  Configure seu bot na aba anterior.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações
              </CardTitle>
              <CardDescription>
                Configurações avançadas do sistema Telegram
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">⚙️ Configurações avançadas em desenvolvimento</h3>
                <p className="text-muted-foreground">
                  Use a aba Bot para configurações básicas.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}