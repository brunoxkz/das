import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth-jwt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, Send, Users, CheckCircle, XCircle, Phone, Search, AlertCircle, Edit, Pause, Play, Trash2, Clock3, Smartphone, Eye, Settings, Plus, RefreshCw, Calendar, Filter, FileText, Download, Clock, Target, Crown, Book, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { CampaignStyleSelector, CampaignStyle } from "@/components/campaign-style-selector";

interface WhatsAppCampaign {
  id: string;
  name: string;
  quizId: string;
  quizTitle: string;
  status: 'active' | 'paused' | 'completed';
  messages: string[];
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

interface PhoneContact {
  phone: string;
  status: 'completed' | 'abandoned';
  completionPercentage: number;
  submittedAt: string;
  name?: string;
  email?: string;
  leadData?: any;
}

interface ExtensionStatus {
  connected: boolean;
  version: string;
  lastPing: string | null;
  pendingMessages: number;
}

export default function WhatsAppCampaignsPage() {
  const [activeTab, setActiveTab] = useState("extensao");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<WhatsAppCampaign | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<WhatsAppCampaign | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'completed' | 'abandoned'>('all');
  const [dateFilter, setDateFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  
  const [showCampaignStyleSelector, setShowCampaignStyleSelector] = useState(false);
  const [selectedCampaignStyle, setSelectedCampaignStyle] = useState<CampaignStyle | null>(null);

  const [rotatingMessages, setRotatingMessages] = useState<string[]>([""]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [campaignName, setCampaignName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [leadDelay, setLeadDelay] = useState(10);
  const [distributionDelay, setDistributionDelay] = useState(180);
  const [generatingFile, setGeneratingFile] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: quizzes = [] } = useQuery({
    queryKey: ["/api/quizzes"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/quizzes", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch quizzes");
      return response.json();
    }
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["/api/whatsapp/campaigns"],
    enabled: activeTab === "campanhas",
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const { data: extensionStatus } = useQuery({
    queryKey: ["/api/whatsapp/extension/status"],
    refetchInterval: 10000,
  });

  const { user } = useAuth();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCampaignStyleSelect = (style: CampaignStyle) => {
    setSelectedCampaignStyle(style);
    setShowCampaignStyleSelector(false);
    setShowCreateForm(true);
  };

  const createCampaign = async () => {
    if (!selectedQuiz || !campaignName || rotatingMessages.filter(msg => msg.trim()).length === 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const validMessages = rotatingMessages.filter(msg => msg.trim());
      
      await apiRequest("POST", "/api/whatsapp/campaigns", {
        name: campaignName,
        quizId: selectedQuiz,
        messages: validMessages,
        targetAudience: selectedAudience,
        leadDelay: leadDelay,
        distributionDelay: distributionDelay,
        extensionSettings: {
          delay: distributionDelay,
          maxRetries: 3,
          enabled: true
        }
      });

      toast({
        title: "Sucesso",
        description: "Campanha criada com sucesso!",
      });

      setShowCreateForm(false);
      setCampaignName("");
      setRotatingMessages([""]);
      setSelectedQuiz("");
      setSelectedAudience('all');
      setLeadDelay(10);
      setDistributionDelay(180);
      setSelectedCampaignStyle(null);
      
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/campaigns"] });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar campanha",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Campaigns</h1>
          <p className="text-gray-600">Automatize seus envios e multiplique suas conversões</p>
        </div>
      </div>

      {/* Link de Download da Extensão em Destaque */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">
                  🚀 Extensão WhatsApp V2.0 - GRATUITA E ILIMITADA
                </CardTitle>
                <CardDescription className="text-green-100">
                  Automatize completamente seus envios e AUMENTE SUA CONVERSÃO em até 300%
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-yellow-400 text-black font-bold text-sm px-3 py-1">
              100% GRÁTIS
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-green-100">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="font-semibold">Envios Ilimitados</span>
            </div>
            <div className="flex items-center gap-2 text-green-100">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="font-semibold">Automação Total</span>
            </div>
            <div className="flex items-center gap-2 text-green-100">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="font-semibold">+300% Conversão</span>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <h4 className="font-bold text-white mb-2">⚡ Como Funciona:</h4>
            <p className="text-green-100 text-sm leading-relaxed">
              Nossa extensão Chrome V2.0 conecta automaticamente ao seu WhatsApp Web e envia mensagens personalizadas 
              para todos os leads dos seus quizzes. Sistema 100% automatizado que funciona 24/7 sem limites de envio.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a 
              href="/chrome-extension-v2/vendzz-whatsapp-v2.zip" 
              download
              className="flex-1"
            >
              <Button className="w-full bg-white text-green-600 hover:bg-green-50 font-bold py-3 px-6 text-lg">
                <Download className="w-5 h-5 mr-2" />
                BAIXAR EXTENSÃO V2.0
              </Button>
            </a>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 font-semibold"
              onClick={() => window.open('/chrome-extension-v2/INSTALACAO.md', '_blank')}
            >
              <Book className="w-4 h-4 mr-2" />
              Tutorial de Instalação
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="extensao">Extensão</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
        </TabsList>

        {/* Aba Extensão */}
        <TabsContent value="extensao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Status da Extensão Chrome
              </CardTitle>
              <CardDescription>
                Monitore o status da sua extensão WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${extensionStatus?.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="font-medium">
                      {extensionStatus?.connected ? '✅ Extensão Conectada' : '❌ Extensão Desconectada'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {extensionStatus?.connected 
                        ? `Versão ${extensionStatus.version} - Última comunicação: ${extensionStatus.lastPing ? new Date(extensionStatus.lastPing).toLocaleString() : 'N/A'}`
                        : 'Instale e ative a extensão Chrome'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Instalar Extensão
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar Status
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sincronização com Token */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Sincronização e Configurações
              </CardTitle>
              <CardDescription>
                Configure a sincronização automática com seus dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">🔄 Auto-Sincronização</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Sincronização automática ativada com token JWT seguro
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-600">Sincronizando a cada 30 segundos</span>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">📡 Auto-Detecção</h4>
                  <p className="text-sm text-green-700 mb-3">
                    Detecção automática de novos leads e telefones
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600">Detectando leads em tempo real</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">🔐 Segurança</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Token JWT autenticado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Conexão HTTPS segura</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Dados criptografados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Backup automático</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas da Extensão */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Estatísticas da Extensão
              </CardTitle>
              <CardDescription>
                Métricas de performance e uso da extensão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {extensionStatus?.pendingMessages || 0}
                  </div>
                  <div className="text-sm text-blue-700">Mensagens Pendentes</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">24/7</div>
                  <div className="text-sm text-green-700">Funcionamento</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">∞</div>
                  <div className="text-sm text-purple-700">Envios Ilimitados</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">300%</div>
                  <div className="text-sm text-orange-700">+ Conversão</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tutorial de Instalação */}
          <Card>
            <CardHeader>
              <CardTitle>Tutorial de Instalação</CardTitle>
              <CardDescription>
                Siga estes passos para instalar e configurar a extensão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Baixe a extensão</h3>
                    <p className="text-sm text-gray-600">Clique no botão "BAIXAR EXTENSÃO V2.0" acima</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Instale no Chrome</h3>
                    <p className="text-sm text-gray-600">Vá em chrome://extensions/ e ative "Modo do desenvolvedor"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Configure</h3>
                    <p className="text-sm text-gray-600">Clique em "Carregar sem compactação" e selecione a pasta extraída</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium">Sincronize</h3>
                    <p className="text-sm text-gray-600">A extensão se conectará automaticamente usando seu token de autenticação</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba API */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Business API</CardTitle>
              <CardDescription>
                Integração com WhatsApp Business para volumes maiores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Funcionalidade em desenvolvimento. Use a extensão Chrome para envios por enquanto.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Campanhas */}
        <TabsContent value="campanhas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Campanhas WhatsApp
              </CardTitle>
              <CardDescription>
                Visualize e gerencie suas campanhas do WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => setShowCampaignStyleSelector(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Campanha
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                  />
                  <span className="text-sm">Auto-atualizar</span>
                </div>
              </div>

              {campaigns && campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map((campaign: WhatsAppCampaign) => (
                    <div
                      key={campaign.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{campaign.name}</h3>
                          <p className="text-sm text-gray-600">
                            Quiz: {campaign.quizTitle}
                          </p>
                          <p className="text-sm text-gray-500">
                            Criado em: {formatDate(campaign.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status === 'active' ? 'Ativa' : 'Pausada'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCampaign(campaign)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Enviadas</div>
                          <div className="text-gray-600">{campaign.sent}</div>
                        </div>
                        <div>
                          <div className="font-medium">Entregues</div>
                          <div className="text-gray-600">{campaign.delivered}</div>
                        </div>
                        <div>
                          <div className="font-medium">Abertas</div>
                          <div className="text-gray-600">{campaign.opened}</div>
                        </div>
                        <div>
                          <div className="font-medium">Respostas</div>
                          <div className="text-gray-600">{campaign.replies}</div>
                        </div>
                      </div>
                      
                      {campaign.messages && Array.isArray(campaign.messages) && campaign.messages.length > 0 && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                          <div className="font-medium text-gray-700 mb-1">
                            {campaign.messages.length} mensagem{campaign.messages.length > 1 ? 's' : ''} rotativa{campaign.messages.length > 1 ? 's' : ''}
                          </div>
                          <div className="text-gray-600 max-h-20 overflow-y-auto">
                            {campaign.messages.map((msg, idx) => (
                              <div key={idx} className="mb-1">
                                {idx + 1}. {msg.substring(0, 100)}{msg.length > 100 ? '...' : ''}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
      </Tabs>

      {/* Campaign Style Selector Dialog */}
      <Dialog open={showCampaignStyleSelector} onOpenChange={setShowCampaignStyleSelector}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Selecione o Estilo da Campanha</DialogTitle>
            <DialogDescription>
              Escolha o tipo de campanha que melhor se adapta ao seu objetivo
            </DialogDescription>
          </DialogHeader>
          <CampaignStyleSelector onSelectStyle={handleCampaignStyleSelect} />
        </DialogContent>
      </Dialog>

      {/* Create Campaign Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Campanha WhatsApp</DialogTitle>
            <DialogDescription>
              {selectedCampaignStyle ? `Criando campanha: ${selectedCampaignStyle.name}` : 'Configure sua campanha'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="campaignName">Nome da Campanha</Label>
              <Input
                id="campaignName"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Digite o nome da campanha"
              />
            </div>
            
            <div>
              <Label htmlFor="quiz">Quiz</Label>
              <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um quiz" />
                </SelectTrigger>
                <SelectContent>
                  {quizzes.map((quiz: any) => (
                    <SelectItem key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="audience">Público Alvo</Label>
              <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os leads</SelectItem>
                  <SelectItem value="completed">Apenas leads completos</SelectItem>
                  <SelectItem value="abandoned">Apenas leads abandonados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Mensagens (uma por linha)</Label>
              {rotatingMessages.map((message, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Textarea
                    value={message}
                    onChange={(e) => {
                      const newMessages = [...rotatingMessages];
                      newMessages[index] = e.target.value;
                      setRotatingMessages(newMessages);
                    }}
                    placeholder={`Mensagem ${index + 1}`}
                    rows={3}
                  />
                  {rotatingMessages.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newMessages = rotatingMessages.filter((_, i) => i !== index);
                        setRotatingMessages(newMessages);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotatingMessages([...rotatingMessages, ""])}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Mensagem
              </Button>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={createCampaign}
                disabled={isCreating}
                className="flex-1"
              >
                {isCreating ? "Criando..." : "Criar Campanha"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}