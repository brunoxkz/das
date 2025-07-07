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
import { MessageSquare, Send, Users, CheckCircle, XCircle, Phone, Search, AlertCircle, Edit, Pause, Play, Trash2, Clock3, Smartphone, Eye, Settings, Plus, RefreshCw, Calendar, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface WhatsAppCampaign {
  id: string;
  name: string;
  quizId: string;
  quizTitle: string;
  status: 'active' | 'paused' | 'completed';
  messages: string[]; // Array de mensagens rotativas
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
  const [activeTab, setActiveTab] = useState("remarketing");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<WhatsAppCampaign | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<WhatsAppCampaign | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  
  // Estados para seleção de quiz e filtros
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'completed' | 'abandoned'>('all');
  const [dateFilter, setDateFilter] = useState<string>("");

  const [rotatingMessages, setRotatingMessages] = useState<string[]>([""]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [campaignName, setCampaignName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Buscar lista de quizzes
  const { data: quizzes = [] } = useQuery({
    queryKey: ['/api/quizzes'],
    refetchInterval: autoRefresh ? 10000 : false,
  });

  // Buscar telefones do quiz selecionado
  const { data: quizPhones = [], refetch: refetchPhones } = useQuery({
    queryKey: ['/api/quiz-phones', selectedQuiz],
    enabled: !!selectedQuiz,
    refetchInterval: autoRefresh ? 10000 : false,
  });

  // Buscar campanhas WhatsApp
  const { data: campaigns = [], refetch: refetchCampaigns } = useQuery({
    queryKey: ['/api/whatsapp-campaigns'],
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // Status da extensão
  const { data: extensionStatus } = useQuery({
    queryKey: ['/api/whatsapp-extension/status'],
    refetchInterval: 5000,
  });

  // Calcular listas filtradas e contadores dinamicamente
  const getFilteredPhones = () => {
    if (!selectedQuiz || !quizPhones.length) return [];
    
    let filteredPhones = quizPhones;
    
    // Aplicar filtro de data
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filteredPhones = filteredPhones.filter(phone => 
        new Date(phone.submittedAt) >= filterDate
      );
    }
    
    // Aplicar filtro de audiência
    if (selectedAudience !== 'all') {
      filteredPhones = filteredPhones.filter(phone => {
        const isCompleted = phone.status === 'completed' || phone.completionPercentage === 100;
        return selectedAudience === 'completed' ? isCompleted : !isCompleted;
      });
    }
    
    return filteredPhones;
  };

  const getAudienceCounts = () => {
    if (!selectedQuiz || !quizPhones.length) return { completed: 0, abandoned: 0, all: 0 };
    
    let basePhones = quizPhones;
    
    // Aplicar filtro de data se especificado
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      basePhones = basePhones.filter(phone => 
        new Date(phone.submittedAt) >= filterDate
      );
    }
    
    const completed = basePhones.filter(p => p.status === 'completed' || p.completionPercentage === 100).length;
    const abandoned = basePhones.filter(p => p.status !== 'completed' && p.completionPercentage !== 100).length;
    
    return {
      completed,
      abandoned,
      all: basePhones.length
    };
  };

  const filteredPhones = getFilteredPhones();
  const audienceCounts = getAudienceCounts();

  // Função para adicionar nova mensagem rotativa
  const addRotatingMessage = () => {
    setRotatingMessages([...rotatingMessages, ""]);
  };

  // Função para remover mensagem rotativa
  const removeRotatingMessage = (index: number) => {
    if (rotatingMessages.length > 1) {
      setRotatingMessages(rotatingMessages.filter((_, i) => i !== index));
    }
  };

  // Função para atualizar mensagem rotativa
  const updateRotatingMessage = (index: number, message: string) => {
    const newMessages = [...rotatingMessages];
    newMessages[index] = message;
    setRotatingMessages(newMessages);
  };

  // Função para criar campanha
  const createCampaign = async () => {
    if (!selectedQuiz || !campaignName || rotatingMessages.filter(m => m.trim()).length === 0) {
      toast({
        title: "Erro",
        description: "Selecione um quiz, digite um nome e adicione pelo menos uma mensagem",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const selectedQuizData = quizzes.find(q => q.id === selectedQuiz);
      const validMessages = rotatingMessages.filter(m => m.trim());
      
      await apiRequest("POST", "/api/whatsapp-campaigns", {
        name: campaignName,
        quizId: selectedQuiz,
        quizTitle: selectedQuizData?.title || "Quiz",
        messages: validMessages,
        targetAudience: selectedAudience,
        dateFilter,
        extensionSettings: {
          delay: 5,
          maxRetries: 3,
          enabled: true
        }
      });
      
      toast({
        title: "Sucesso",
        description: "Campanha WhatsApp criada com sucesso!",
      });
      
      // Limpar formulário
      setCampaignName("");
      setRotatingMessages([""]);
      setSelectedQuiz("");
      setSelectedAudience('all');
      setDateFilter("");
      
      // Atualizar lista de campanhas
      refetchCampaigns();
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar campanha WhatsApp",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campanhas WhatsApp</h1>
          <p className="text-gray-600">Remarketing automático via WhatsApp Web</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={extensionStatus?.connected ? "default" : "destructive"}>
            {extensionStatus?.connected ? "Extensão Conectada" : "Extensão Desconectada"}
          </Badge>
          <Button onClick={() => setAutoRefresh(!autoRefresh)} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-Refresh: {autoRefresh ? "ON" : "OFF"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="remarketing">Remarketing</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="extension">Extensão</TabsTrigger>
        </TabsList>

        <TabsContent value="remarketing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Configurar Remarketing WhatsApp
              </CardTitle>
              <CardDescription>
                Selecione um quiz e configure mensagens rotativas para evitar ban
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seleção do Quiz */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quiz-select">Selecionar Quiz</Label>
                  <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um quiz" />
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
                
                <div>
                  <Label htmlFor="campaign-name">Nome da Campanha</Label>
                  <Input
                    id="campaign-name"
                    placeholder="Ex: Recuperação Carrinho Janeiro"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>
              </div>

              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="audience">Público-Alvo</Label>
                  <Select value={selectedAudience} onValueChange={(value: 'all' | 'completed' | 'abandoned') => setSelectedAudience(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        Todos ({audienceCounts.all})
                      </SelectItem>
                      <SelectItem value="completed">
                        Completos ({audienceCounts.completed})
                      </SelectItem>
                      <SelectItem value="abandoned">
                        Abandonados ({audienceCounts.abandoned})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date-filter">Filtro de Data</Label>
                  <Input
                    id="date-filter"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Disparar para leads a partir de {dateFilter ? new Date(dateFilter).toLocaleDateString('pt-BR') : 'data selecionada'} 
                    {dateFilter && ` (${audienceCounts.all} leads)`}
                  </p>
                </div>
              </div>

              {/* Lista de Telefones */}
              {selectedQuiz && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <Label>Lista Oficial para Envio ({filteredPhones.length})</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refetchPhones()}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto border rounded-md p-2">
                    {filteredPhones.length > 0 ? (
                      <div className="space-y-2">
                        {filteredPhones.slice(0, 50).map((contact, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="font-mono">{contact.phone}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant={contact.status === 'completed' ? "default" : "secondary"}>
                                {contact.status === 'completed' ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <Clock3 className="h-3 w-3 mr-1" />
                                )}
                                {contact.status === 'completed' ? 'Completo' : 'Abandonado'}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatDate(contact.submittedAt)}
                              </span>
                            </div>
                          </div>
                        ))}
                        {filteredPhones.length > 50 && (
                          <div className="text-xs text-gray-500 text-center">
                            ... e mais {filteredPhones.length - 50} telefones
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        Nenhum telefone encontrado para os filtros selecionados
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mensagens Rotativas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Mensagens Rotativas (Anti-Ban)</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addRotatingMessage}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Mensagem
                  </Button>
                </div>
                
                {rotatingMessages.map((message, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <Textarea
                        placeholder={`Mensagem ${index + 1} - Use {nome}, {email}, {telefone} como variáveis`}
                        value={message}
                        onChange={(e) => updateRotatingMessage(index, e.target.value)}
                        className="min-h-20"
                      />
                    </div>
                    {rotatingMessages.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRotatingMessage(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <div className="text-xs text-gray-500">
                  💡 Dica: Use múltiplas mensagens com variações para evitar detecção de spam
                </div>
              </div>

              {/* Botão de Criar Campanha */}
              <Button 
                onClick={createCampaign} 
                disabled={isCreating || !selectedQuiz || !campaignName || rotatingMessages.filter(m => m.trim()).length === 0}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Criando Campanha...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Ativar Campanha e Sincronizar com a extensão
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Ativas</CardTitle>
              <CardDescription>
                Gerencie suas campanhas de remarketing WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{campaign.name}</h3>
                          <Badge variant={campaign.status === 'active' ? "default" : "secondary"}>
                            {campaign.status === 'active' ? 'Ativa' : 'Pausada'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            {campaign.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        Quiz: {campaign.quizTitle} | Público: {campaign.targetAudience === 'completed' ? 'Completos' : campaign.targetAudience === 'abandoned' ? 'Abandonados' : 'Todos'}
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{campaign.sent}</div>
                          <div className="text-gray-500">Enviadas</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{campaign.delivered}</div>
                          <div className="text-gray-500">Entregues</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-orange-600">{campaign.opened}</div>
                          <div className="text-gray-500">Abertas</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-purple-600">{campaign.replies}</div>
                          <div className="text-gray-500">Respostas</div>
                        </div>
                      </div>
                      
                      {campaign.messages && (
                        <div className="mt-3 text-xs text-gray-500">
                          {campaign.messages.length} mensagens rotativas configuradas
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

        <TabsContent value="extension" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status da Extensão Chrome</CardTitle>
              <CardDescription>
                Monitoramento da extensão WhatsApp Web
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Status da Conexão</span>
                    <Badge variant={extensionStatus?.connected ? "default" : "destructive"}>
                      {extensionStatus?.connected ? "Conectada" : "Desconectada"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Versão</span>
                    <span className="font-mono">{extensionStatus?.version || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Último Ping</span>
                    <span className="text-sm text-gray-500">
                      {extensionStatus?.lastPing ? formatDate(extensionStatus.lastPing) : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Mensagens Pendentes</span>
                    <Badge variant="outline">{extensionStatus?.pendingMessages || 0}</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Para usar o remarketing WhatsApp, instale a extensão Chrome e mantenha o WhatsApp Web aberto.
                    </AlertDescription>
                  </Alert>
                  <Button className="w-full" disabled>
                    <Settings className="h-4 w-4 mr-2" />
                    Baixar Extensão Chrome
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}