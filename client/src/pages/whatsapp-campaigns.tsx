import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, Send, Users, CheckCircle, XCircle, Phone, Search, AlertCircle, Edit, Pause, Play, Trash2, Clock3, Smartphone, Eye, Settings, Plus, RefreshCw, Calendar, Filter, FileText, Download, Clock, Target, Crown } from "lucide-react";
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
  const [fromDate, setFromDate] = useState<string>("");
  
  // Estados para seletor de estilo de campanha
  const [showCampaignStyleSelector, setShowCampaignStyleSelector] = useState(false);
  const [selectedCampaignStyle, setSelectedCampaignStyle] = useState<CampaignStyle | null>(null);

  const [rotatingMessages, setRotatingMessages] = useState<string[]>([""]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [campaignName, setCampaignName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [leadDelay, setLeadDelay] = useState(10); // minutos
  const [distributionDelay, setDistributionDelay] = useState(180); // segundos
  const [generatingFile, setGeneratingFile] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Buscar quizzes usando o mesmo padrão do SMS que funciona
  const { data: quizzes = [], isLoading: quizzesLoading, error: quizzesError } = useQuery({
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

  // Log dos quizzes para debug
  console.log('🔍 Estado dos quizzes WhatsApp:', {
    loading: quizzesLoading,
    error: quizzesError,
    data: quizzes,
    length: quizzes?.length
  });
  
  // Hook de autenticação
  const { user } = useAuth();

  // Função para gerar arquivo de automação
  const generateAutomationFile = async () => {
    if (!selectedQuiz) return;
    
    setGeneratingFile(true);
    try {
      const response = await apiRequest('POST', '/api/whatsapp-automation-file', {
        quizId: selectedQuiz,
        targetAudience: selectedAudience,
        dateFilter: dateFilter
      });
      
      toast({
        title: "Arquivo gerado com sucesso!",
        description: `Arquivo criado para o quiz. A extensão pode acessá-lo agora.`,
      });
      
    } catch (error) {
      console.error('Erro ao gerar arquivo:', error);
      toast({
        title: "Erro ao gerar arquivo",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setGeneratingFile(false);
    }
  };
  
  // Sistema funcionando corretamente - logs removidos
  




  // Buscar telefones do quiz selecionado usando apiRequest
  const { data: quizPhones = {}, refetch: refetchPhones, isLoading: phonesLoading } = useQuery({
    queryKey: ['/api/quiz-phones', selectedQuiz],
    enabled: !!selectedQuiz,
    queryFn: async () => {
      if (!selectedQuiz) return {};
      try {
        return await apiRequest('GET', `/api/quiz-phones/${selectedQuiz}`);
      } catch (error) {
        console.error('Erro ao buscar telefones:', error);
        return { phones: [], totalPhones: 0 };
      }
    },
    refetchInterval: autoRefresh ? 10000 : false,
  });

  // Buscar campanhas WhatsApp usando fetch com token
  const { data: campaigns = [], refetch: refetchCampaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/whatsapp-campaigns'],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/whatsapp-campaigns", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch campaigns");
      return response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // Status da extensão
  const { data: extensionStatus } = useQuery({
    queryKey: ['/api/whatsapp-extension/status'],
    refetchInterval: 5000,
  });

  // Buscar logs de WhatsApp para verificar telefones já enviados
  const { data: whatsappLogs = [] } = useQuery({
    queryKey: ['/api/whatsapp-campaigns', selectedQuiz, 'logs'],
    enabled: !!selectedQuiz,
    refetchInterval: autoRefresh ? 10000 : false,
  });



  // Calcular listas filtradas e contadores dinamicamente
  const getFilteredPhones = () => {
    if (!selectedQuiz || !quizPhones?.phones || !quizPhones.phones.length) return [];
    
    let filteredPhones = quizPhones.phones;
    
    // Aplicar filtro de data (se não selecionado, inclui todos)
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filteredPhones = filteredPhones.filter(phone => 
        new Date(phone.submittedAt) >= filterDate
      );
    }
    
    // Aplicar filtro de audiência
    if (selectedAudience !== 'all') {
      filteredPhones = filteredPhones.filter(phone => {
        const isCompleted = phone.status === 'completed' || phone.isComplete === true;
        return selectedAudience === 'completed' ? isCompleted : !isCompleted;
      });
    }
    
    return filteredPhones;
  };

  const getAudienceCounts = () => {
    if (!selectedQuiz || !quizPhones.phones || !quizPhones.phones.length) return { completed: 0, abandoned: 0, all: 0 };
    
    let basePhones = quizPhones.phones;
    
    // Aplicar filtro de data se especificado (se não selecionado, inclui todos)
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      basePhones = basePhones.filter(phone => 
        new Date(phone.submittedAt) >= filterDate
      );
    }
    
    const completed = basePhones.filter(p => p.status === 'completed' || p.isComplete === true).length;
    const abandoned = basePhones.filter(p => p.status !== 'completed' && p.isComplete !== true).length;
    
    return {
      completed,
      abandoned,
      all: basePhones.length
    };
  };

  const filteredPhones = getFilteredPhones();
  const audienceCounts = getAudienceCounts();

  // Função para verificar se telefone já foi enviado
  const isPhoneSent = (phone: string) => {
    return whatsappLogs.some(log => log.phone === phone && (log.status === 'sent' || log.status === 'delivered'));
  };

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

  const handleCreateRemarketingCampaign = async () => {
    await createCampaignWithStyle('remarketing');
  };

  const handleCreateRemarketingUltraCustomizedCampaign = async () => {
    await createCampaignWithStyle('remarketing_ultra_customizado');
  };

  const handleCreateStandardCampaign = async () => {
    await createCampaignWithStyle('ao_vivo_tempo_real');
  };

  const handleCreateUltraCustomizedCampaign = async () => {
    await createCampaignWithStyle('ao_vivo_ultra_customizada');
  };

  // Função para criar campanha com estilo específico
  const createCampaignWithStyle = async (campaignType: string) => {
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
      
      const stylePrefix = 
        campaignType === 'remarketing' ? '[REMARKETING]' : 
        campaignType === 'remarketing_ultra_customizado' ? '[REMARKETING ULTRA CUSTOMIZADO]' :
        campaignType === 'ao_vivo_tempo_real' ? '[AO VIVO TEMPO REAL]' : 
        '[AO VIVO ULTRA CUSTOMIZADA]';
      
      await apiRequest("POST", "/api/whatsapp-campaigns", {
        name: `${stylePrefix} ${campaignName}`,
        quizId: selectedQuiz,
        quizTitle: selectedQuizData?.title || "Quiz",
        messages: validMessages,
        targetAudience: selectedAudience,
        dateFilter,
        leadDelay,
        distributionDelay,
        campaignType,
        extensionSettings: {
          delay: 5,
          maxRetries: 3,
          enabled: true
        }
      });
      
      toast({
        title: "Sucesso",
        description: `Campanha ${stylePrefix} criada com sucesso!`,
      });
      
      // Limpar formulário
      setCampaignName("");
      setRotatingMessages([""]);
      setSelectedQuiz("");
      setSelectedAudience('all');
      setDateFilter("");
      setSelectedCampaignStyle(null);
      
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
          <p className="text-gray-600">Crie e gerencie campanhas WhatsApp com diferentes estilos</p>
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

      {/* Campaign Style Selection Card */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <MessageSquare className="w-5 h-5" />
            Criar Nova Campanha WhatsApp
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
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 px-8"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="remarketing">Remarketing</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="extension">Extensão</TabsTrigger>
        </TabsList>

        <TabsContent value="remarketing" className="space-y-6">
          {/* Explicação dos Tipos de Campanha */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">📚 Tipos de Campanha WhatsApp - Guia Completo</CardTitle>
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
                    <p className="text-sm text-green-600 font-medium mt-2">📱 Transforme WhatsApp "mortos" em VENDAS!</p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Selecione entre leads antigos que abandonaram ou completaram o quiz e datas</strong>
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-600">
                        🎯 <strong>Vantagens:</strong> Leads gratuitos • Segmentação automática • Timing inteligente
                      </div>
                      <div className="text-xs text-green-600 font-bold">
                        💸 <strong>LUCRO REAL:</strong> +42% taxa resposta • R$ 420 a mais para cada R$ 1.000 investido!
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4 bg-white p-4 rounded-lg shadow-lg">
                    <h3 className="font-bold text-purple-700 flex items-center gap-2">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">🚀 REMARKETING ULTRA CUSTOMIZADO</span>
                    </h3>
                    <p className="text-sm text-purple-600 font-medium mt-2">💎 O segredo dos REIS do WhatsApp!</p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Selecione entre leads antigos que abandonaram ou completaram o quiz e datas, mas que também dispare funis diferentes para cada faixa de idade, peso, altura, ou como preferir, isso aumenta muito a conversão!</strong>
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-600">
                        🎯 <strong>Vantagens:</strong> Mensagens por idade/peso/altura • Funis únicos • Personalização máxima
                      </div>
                      <div className="text-xs text-purple-600 font-bold">
                        💰 <strong>LUCRO EXPLOSIVO:</strong> +65% conversão • R$ 6.500 a mais para cada R$ 10.000!
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-l-4 border-orange-500 pl-4 bg-white p-4 rounded-lg shadow-lg">
                    <h3 className="font-bold text-orange-700 flex items-center gap-2">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">⚡ AO VIVO TEMPO REAL</span>
                    </h3>
                    <p className="text-sm text-orange-600 font-medium mt-2">🔥 Pegue o lead no WhatsApp QUENTE!</p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Mensagens personalizadas para pessoas que abandonaram ou completaram o quiz, escolha quanto tempo após a ação vai disparar a mensagem personalizada desejada</strong>
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-600">
                        🎯 <strong>Vantagens:</strong> Automático 24h • Timing perfeito • Sem perder leads
                      </div>
                      <div className="text-xs text-orange-600 font-bold">
                        🔥 <strong>CONVERSÃO INSANA:</strong> +95% taxa resposta • Lead quente no WhatsApp = venda garantida!
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4 bg-white p-4 rounded-lg shadow-lg">
                    <h3 className="font-bold text-red-700 flex items-center gap-2">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">💎 AO VIVO ULTRA CUSTOMIZADA</span>
                    </h3>
                    <p className="text-sm text-red-600 font-medium mt-2">👑 O NIVEL SUPREMO do WhatsApp!</p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Mensagens personalizadas para pessoas que abandonaram ou completaram o quiz, escolha quanto tempo após a ação vai disparar a mensagem personalizada desejada mas que também dispare funis diferentes para cada faixa de idade, peso, altura, ou como preferir, isso aumenta muito a conversão!</strong>
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-gray-600">
                        🎯 <strong>Vantagens:</strong> Tempo real + personalização • Funis únicos • Máxima conversão
                      </div>
                      <div className="text-xs text-red-600 font-bold">
                        💰 <strong>LUCRO ESTRATOSFÉRICO:</strong> +200% conversão • R$ 20.000 a mais para cada R$ 10.000!
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
                      <strong>COMBINE TUDO:</strong> Use <strong>Remarketing</strong> nos leads antigos (custo R$ 0,00), <strong>Ao Vivo</strong> nos frescos (resposta 95%+). 
                      As versões <strong>Ultra Customizadas</strong> são o segredo dos especialistas que faturam R$ 300k+/mês com WhatsApp!
                    </p>
                    <p className="text-xs text-yellow-600 mt-2 font-bold">
                      ⚡ RESULTADO: Até R$ 100.000 extras por mês só com WhatsApp automático!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-red-600 mt-1">⚠️</div>
                  <div>
                    <h4 className="font-semibold text-red-800">Importante - Proteção contra Ban</h4>
                    <p className="text-sm text-red-700 mt-1">
                      <strong>WhatsApp é mais restritivo:</strong> Use mensagens rotativas, evite spam, respeite intervalos de tempo. 
                      Nossa extensão Chrome protege automaticamente contra banimentos.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Criar Nova Campanha WhatsApp
              </CardTitle>
              <CardDescription>
                Selecione o estilo de campanha que melhor se adapta ao seu objetivo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seleção do Quiz */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quiz-select">Selecionar Quiz</Label>
                  <div className="space-y-2">
                    <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                      <SelectTrigger>
                        <SelectValue placeholder={quizzesLoading ? "🔄 Carregando..." : quizzes.length === 0 ? "❌ Nenhum quiz encontrado" : "✅ Escolha um quiz"} />
                      </SelectTrigger>
                      <SelectContent>
                        {quizzes && quizzes.length > 0 ? (
                          quizzes.map((quiz: any) => (
                            <SelectItem key={quiz.id} value={quiz.id}>
                              {quiz.title}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-quiz" disabled>
                            {quizzesLoading ? "Carregando..." : "Nenhum quiz encontrado"}
                          </SelectItem>
                        )}
                    </SelectContent>
                  </Select>
                  
                  {quizzesError && (
                    <div className="text-red-600 text-sm p-2 bg-red-50 rounded border">
                      ❌ <strong>Erro:</strong> {String(quizzesError.message || quizzesError)}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600">
                    {quizzesLoading ? (
                      "🔄 Buscando quizzes..."
                    ) : quizzes.length === 0 ? (
                      "📋 Nenhum quiz encontrado - crie um primeiro"
                    ) : (
                      `📊 ${quizzes.length} quiz(es) disponível(eis)`
                    )}
                  </div>

                  {/* Gerador de Arquivo para Extensão */}
                  {selectedQuiz && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium text-blue-900">Arquivo para Extensão WhatsApp</h3>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">
                        Gere um arquivo interno com todos os telefones deste quiz. A extensão Chrome acessará automaticamente este arquivo.
                      </p>
                      <Button 
                        onClick={generateAutomationFile}
                        disabled={generatingFile}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {generatingFile ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Gerando Arquivo...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Gerar Arquivo de Automação
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
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

              {/* Seleção de Público-Alvo */}
              {selectedQuiz && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target-audience">Público-Alvo</Label>
                    <Select value={selectedAudience} onValueChange={(value: 'all' | 'completed' | 'abandoned') => setSelectedAudience(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o público" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Quiz Completo - Leads Qualificados ({audienceCounts.completed})
                          </div>
                        </SelectItem>
                        <SelectItem value="abandoned">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Quiz Abandonado - Recuperação ({audienceCounts.abandoned})
                          </div>
                        </SelectItem>
                        <SelectItem value="all">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Todos os Leads ({audienceCounts.all})
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                  <Label htmlFor="date-filter">Filtrar Leads por Data de Chegada</Label>
                  <Input
                    id="date-filter"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    placeholder="Selecione a data mínima"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {dateFilter ? (
                      <>📅 Incluir apenas leads que responderam ao quiz <strong>a partir de {new Date(dateFilter).toLocaleDateString('pt-BR')}</strong> ({audienceCounts.all} leads filtrados)</>
                    ) : (
                      <>📋 Incluir todos os leads - sem filtro de data ({audienceCounts.all} leads total)</>
                    )}
                  </p>
                </div>
                </div>
              )}

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
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      🔄 <strong>Auto-detecção ativa:</strong> Novos números que responderem ao quiz serão automaticamente adicionados à campanha ativa em até 30 segundos.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="max-h-48 overflow-y-auto border rounded-md p-2">
                    {filteredPhones.length > 0 ? (
                      <div className="space-y-2">
                        {filteredPhones.slice(0, 50).map((contact, index) => {
                          const alreadySent = isPhoneSent(contact.phone);
                          return (
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
                                {alreadySent && (
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    <Send className="h-3 w-3 mr-1" />
                                    WhatsApp Enviado
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                  {formatDate(contact.submittedAt)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
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

              {/* Configurações de Timing */}
              <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-800">⏱️ Configurações de Timing</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="leadDelay">Aguardar depois que o Lead chega (minutos)</Label>
                    <Input
                      id="leadDelay"
                      type="number"
                      value={leadDelay}
                      onChange={(e) => setLeadDelay(parseInt(e.target.value) || 10)}
                      min="1"
                      max="1440"
                      placeholder="10"
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Tempo que o sistema aguarda após capturar o telefone do quiz antes de agendar o envio
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="distributionDelay">Distribuição entre mensagens (segundos)</Label>
                    <Input
                      id="distributionDelay"
                      type="number"
                      value={distributionDelay}
                      onChange={(e) => setDistributionDelay(parseInt(e.target.value) || 180)}
                      min="30"
                      max="600"
                      placeholder="180"
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Recomendado: 120-300 segundos</span> para evitar bloqueios do WhatsApp
                    </p>
                  </div>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>💡 Dica:</strong> O sistema aplica distribuição aleatória automática baseada no valor configurado para garantir envios seguros e evitar detecção de spam.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Mensagens Rotativas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Mensagens Rotativas (Anti-Ban)</Label>
                  <Button
                    onClick={addRotatingMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    <Plus className="h-5 w-5 mr-2" />
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
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>⚠️ Recomendação Anti-Spam:</strong> Use no mínimo 4-5 mensagens diferentes com variações de texto, emojis e estrutura. Isso evita detecção de spam pelo WhatsApp e melhora a entregabilidade.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Status das Mensagens */}
              <div className="flex items-center gap-2">
                <Badge variant={rotatingMessages.filter(m => m.trim()).length >= 4 ? "default" : "secondary"}>
                  {rotatingMessages.filter(m => m.trim()).length >= 4 ? "✅ Anti-Spam OK" : "⚠️ Mais mensagens recomendadas"}
                </Badge>
                <span className="text-sm text-gray-500">
                  {rotatingMessages.filter(m => m.trim()).length} de 4+ mensagens configuradas
                </span>
              </div>

              {/* Botão Criar Campanha */}
              <div className="pt-4">
                <Button 
                  onClick={() => setShowCampaignStyleSelector(true)}
                  disabled={!selectedQuiz || !campaignName.trim() || isCreating || rotatingMessages.filter(m => m.trim()).length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                >
                  {isCreating ? (
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <MessageSquare className="h-5 w-5 mr-2" />
                  )}
                  {isCreating ? "Criando Campanha..." : `Selecionar Estilo de Campanha (${filteredPhones.length} leads)`}
                </Button>
              </div>
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
              {campaignsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Carregando campanhas...</p>
                </div>
              ) : campaigns.length > 0 ? (
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
                        Quiz: {campaign.quizTitle || campaign.quiz_title || 'Quiz não encontrado'} | Público: {campaign.targetAudience === 'completed' ? 'Completos' : campaign.targetAudience === 'abandoned' ? 'Abandonados' : 'Todos'} | Status: {campaign.status}
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

      {/* Campaign Style Selector Modal */}
      <CampaignStyleSelector
        open={showCampaignStyleSelector}
        onClose={() => setShowCampaignStyleSelector(false)}
        onStyleSelect={handleCampaignStyleSelect}
        platform="whatsapp"
      />
    </div>
  );
}