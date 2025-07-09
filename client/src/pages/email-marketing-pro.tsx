import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/contexts/theme-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Send, 
  Users, 
  BarChart3, 
  Eye, 
  Plus,
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Target,
  Filter,
  Settings,
  Play,
  Pause,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  quizId: string;
  status: 'active' | 'sent' | 'draft' | 'scheduled' | 'paused';
  targetAudience: 'all' | 'completed' | 'abandoned';
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  createdAt: number;
}

interface Quiz {
  id: string;
  title: string;
  responses: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
}

export default function EmailMarketingPro() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  
  const [selectedTab, setSelectedTab] = useState('campaigns');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    content: '',
    quizId: '',
    targetAudience: 'all' as const,
    triggerType: 'immediate' as const,
    triggerDelay: 0,
    triggerUnit: 'minutes' as const
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'welcome'
  });

  // Auto-refresh active campaigns for new leads
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [queryClient]);

  // Queries
  const { data: campaigns = [], isLoading: campaignLoading } = useQuery({
    queryKey: ['/api/email-campaigns'],
    select: (data: EmailCampaign[]) => data || []
  });

  const { data: quizzes = [], isLoading: quizLoading } = useQuery({
    queryKey: ['/api/quizzes'],
    select: (data: Quiz[]) => data || []
  });

  const { data: templates = [], isLoading: templateLoading } = useQuery({
    queryKey: ['/api/email-templates'],
    select: (data: EmailTemplate[]) => data || []
  });

  // Pagination
  const totalPages = Math.ceil(campaigns.length / itemsPerPage);
  const paginatedCampaigns = campaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Mutations
  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/email-campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to create campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
      setShowCreateCampaign(false);
      resetCampaignForm();
      toast({
        title: "Campanha criada com sucesso!",
        description: "Sua campanha está ativa e detectará novos leads automaticamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar campanha",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const pauseCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await fetch(`/api/email-campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'paused' })
      });
      
      if (!response.ok) throw new Error('Failed to pause campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
      toast({
        title: "Campanha pausada",
        description: "A campanha foi pausada e não detectará novos leads.",
      });
    }
  });

  const resumeCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await fetch(`/api/email-campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'active' })
      });
      
      if (!response.ok) throw new Error('Failed to resume campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
      toast({
        title: "Campanha reativada",
        description: "A campanha voltou a detectar novos leads automaticamente.",
      });
    }
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await fetch(`/api/email-campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
      toast({
        title: "Campanha excluída",
        description: "A campanha foi excluída permanentemente.",
      });
    }
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await fetch(`/api/email-campaigns/${campaignId}/send-brevo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          apiKey: 'xkeysib-d9c81f8bf32940bbee0c3826b7c7bd65ad4e16fd81686265b31ab5cd7908cc6e',
          fromEmail: 'contato@vendzz.com.br'
        })
      });
      
      if (!response.ok) throw new Error('Failed to send campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
      toast({
        title: "Emails enviados!",
        description: "Todos os emails da campanha foram enviados com sucesso.",
      });
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/email-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-templates'] });
      setShowCreateTemplate(false);
      resetTemplateForm();
      toast({
        title: "Template criado!",
        description: "Seu template está pronto para usar em campanhas.",
      });
    }
  });

  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      subject: '',
      content: '',
      quizId: '',
      targetAudience: 'all',
      triggerType: 'immediate',
      triggerDelay: 0,
      triggerUnit: 'minutes'
    });
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      subject: '',
      content: '',
      category: 'welcome'
    });
  };

  const handleCreateCampaign = () => {
    if (!campaignForm.name || !campaignForm.subject || !campaignForm.content || !campaignForm.quizId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para criar a campanha.",
        variant: "destructive",
      });
      return;
    }
    createCampaignMutation.mutate(campaignForm);
  };

  const handleCreateTemplate = () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.content) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para criar o template.",
        variant: "destructive",
      });
      return;
    }
    createTemplateMutation.mutate(templateForm);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 hover:bg-green-600';
      case 'sent': return 'bg-blue-500 hover:bg-blue-600';
      case 'paused': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'draft': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'sent': return 'Enviada';
      case 'paused': return 'Pausada';
      case 'draft': return 'Rascunho';
      default: return 'Desconhecido';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0);
  const totalOpened = campaigns.reduce((sum, c) => sum + c.opened, 0);
  const avgOpenRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'min-h-screen bg-gray-900 text-white';
      case 'future':
        return 'min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white';
      default:
        return 'min-h-screen bg-white text-black';
    }
  };

  const getCardClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-800 border-gray-700 text-white';
      case 'future':
        return 'bg-gray-800/50 border-purple-500/30 text-white card-glow glass-effect';
      default:
        return 'bg-white border-gray-200 text-black';
    }
  };

  return (
    <div className={getThemeClasses()}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Email Marketing Pro
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">
                  Campanhas inteligentes com detecção automática de leads
                </p>
              </div>
            </div>
            <Badge className="bg-green-500 text-white hover:bg-green-600 w-fit">
              <Sparkles className="w-3 h-3 mr-1" />
              Pro
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className={`${getCardClasses()} border-0 shadow-lg`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className={`text-xs sm:text-sm truncate ${theme === 'default' ? 'text-gray-600' : 'text-gray-300'}`}>Campanhas</p>
                  <p className={`text-xl sm:text-2xl font-bold ${theme === 'default' ? 'text-black' : 'text-white'}`}>{totalCampaigns}</p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center ml-2">
                  <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white text-black border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Ativas</p>
                  <p className="text-xl sm:text-2xl font-bold text-black">{activeCampaigns}</p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center ml-2">
                  <Target className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white text-black border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Enviados</p>
                  <p className="text-xl sm:text-2xl font-bold text-black">{totalSent}</p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center ml-2">
                  <Send className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white text-black border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Abertura</p>
                  <p className="text-xl sm:text-2xl font-bold text-black">{avgOpenRate}%</p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center ml-2">
                  <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className={`${getCardClasses()} border-0 shadow-lg`}>
          <CardHeader className="pb-4">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                <TabsTrigger value="campaigns" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                  Campanhas
                </TabsTrigger>
                <TabsTrigger value="templates" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                  Templates
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                  Analytics
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              {/* Campaigns Tab */}
              <TabsContent value="campaigns" className="space-y-6 mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <h2 className="text-xl font-semibold text-black">
                      Campanhas de Email
                    </h2>
                    <Badge variant="outline" className="w-fit">{campaigns.length} campanhas</Badge>
                  </div>
                  <Button 
                    onClick={() => setShowCreateCampaign(true)}
                    className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Campanha
                  </Button>
                </div>

                {showCreateCampaign && (
                  <Card className="bg-gray-50 border-2 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-black">Criar Nova Campanha</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-black">Nome da Campanha</Label>
                          <Input
                            id="name"
                            value={campaignForm.name}
                            onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                            placeholder="Ex: Boas-vindas aos novos leads"
                            className="bg-white text-black"
                          />
                        </div>
                        <div>
                          <Label htmlFor="quiz" className="text-black">Quiz</Label>
                          <Select 
                            value={campaignForm.quizId} 
                            onValueChange={(value) => setCampaignForm({...campaignForm, quizId: value})}
                          >
                            <SelectTrigger className="bg-white text-black">
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

                      <div>
                        <Label htmlFor="subject" className="text-black">Assunto do Email</Label>
                        <Input
                          id="subject"
                          value={campaignForm.subject}
                          onChange={(e) => setCampaignForm({...campaignForm, subject: e.target.value})}
                          placeholder="Ex: Obrigado por participar, {nome}!"
                          className="bg-white text-black"
                        />
                      </div>

                      <div>
                        <Label htmlFor="content" className="text-black">Conteúdo do Email</Label>
                        <Textarea
                          id="content"
                          value={campaignForm.content}
                          onChange={(e) => setCampaignForm({...campaignForm, content: e.target.value})}
                          placeholder="Digite o conteúdo do email..."
                          rows={6}
                          className="bg-white text-black"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Variáveis: {'{nome}'}, {'{email}'}, {'{telefone}'}, {'{altura}'}, {'{peso}'}, {'{idade}'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="audience" className="text-black">Público Alvo</Label>
                          <Select 
                            value={campaignForm.targetAudience} 
                            onValueChange={(value: any) => setCampaignForm({...campaignForm, targetAudience: value})}
                          >
                            <SelectTrigger className="bg-white text-black">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos os leads</SelectItem>
                              <SelectItem value="completed">Quiz completo</SelectItem>
                              <SelectItem value="abandoned">Quiz abandonado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="trigger" className="text-black">Tipo de Disparo</Label>
                          <Select 
                            value={campaignForm.triggerType} 
                            onValueChange={(value: any) => setCampaignForm({...campaignForm, triggerType: value})}
                          >
                            <SelectTrigger className="bg-white text-black">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Imediato</SelectItem>
                              <SelectItem value="delayed">Agendado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-4">
                        <Button 
                          onClick={handleCreateCampaign}
                          disabled={createCampaignMutation.isPending}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          {createCampaignMutation.isPending ? 'Criando...' : 'Criar Campanha'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowCreateCampaign(false)}
                          className="border-gray-300 text-black hover:bg-gray-50"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Campaigns List */}
                <div className="space-y-4">
                  {campaignLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                  ) : campaigns.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma campanha encontrada. Crie sua primeira campanha!
                    </div>
                  ) : (
                    <>
                      {paginatedCampaigns.map((campaign) => (
                        <Card key={campaign.id} className="bg-white border shadow-sm hover:shadow-md transition-all">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-black truncate">
                                    {campaign.name}
                                  </h3>
                                  <Badge className={`${getStatusColor(campaign.status)} text-white w-fit`}>
                                    {getStatusText(campaign.status)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2 break-words">
                                  {campaign.subject}
                                </p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                                  <span>Público: {campaign.targetAudience === 'all' ? 'Todos' : campaign.targetAudience === 'completed' ? 'Quiz Completo' : 'Quiz Abandonado'}</span>
                                  <span className="hidden sm:inline">•</span>
                                  <span>Criado: {formatDate(campaign.createdAt)}</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                                {campaign.status === 'active' && (
                                  <>
                                    <Button 
                                      onClick={() => sendCampaignMutation.mutate(campaign.id)}
                                      disabled={sendCampaignMutation.isPending}
                                      size="sm"
                                      className="bg-green-500 hover:bg-green-600 text-white"
                                    >
                                      <Send className="w-4 h-4 mr-1" />
                                      Enviar
                                    </Button>
                                    <Button 
                                      onClick={() => pauseCampaignMutation.mutate(campaign.id)}
                                      disabled={pauseCampaignMutation.isPending}
                                      size="sm"
                                      variant="outline"
                                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                                    >
                                      <Pause className="w-4 h-4 mr-1" />
                                      Pausar
                                    </Button>
                                  </>
                                )}
                                
                                {campaign.status === 'paused' && (
                                  <Button 
                                    onClick={() => resumeCampaignMutation.mutate(campaign.id)}
                                    disabled={resumeCampaignMutation.isPending}
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                  >
                                    <Play className="w-4 h-4 mr-1" />
                                    Retomar
                                  </Button>
                                )}
                                
                                <Button 
                                  onClick={() => deleteCampaignMutation.mutate(campaign.id)}
                                  disabled={deleteCampaignMutation.isPending}
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Excluir
                                </Button>
                              </div>
                            </div>
                            
                            {campaign.sent > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                  <div className="text-center">
                                    <div className="text-lg font-semibold text-black">{campaign.sent}</div>
                                    <div className="text-gray-600">Enviados</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-semibold text-black">{campaign.delivered}</div>
                                    <div className="text-gray-600">Entregues</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-semibold text-green-600">{campaign.opened}</div>
                                    <div className="text-gray-600">Abertos</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-lg font-semibold text-blue-600">{campaign.clicked}</div>
                                    <div className="text-gray-600">Cliques</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                      
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                          <Button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            variant="outline"
                            size="sm"
                            className="border-gray-300 text-black hover:bg-gray-50"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Anterior
                          </Button>
                          
                          <span className="text-sm text-gray-600">
                            Página {currentPage} de {totalPages}
                          </span>
                          
                          <Button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            variant="outline"
                            size="sm"
                            className="border-gray-300 text-black hover:bg-gray-50"
                          >
                            Próxima
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-6 mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <h2 className="text-xl font-semibold text-black">Templates de Email</h2>
                    <Badge variant="outline" className="w-fit">{templates.length} templates</Badge>
                  </div>
                  <Button 
                    onClick={() => setShowCreateTemplate(true)}
                    className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Template
                  </Button>
                </div>

                {showCreateTemplate && (
                  <Card className="bg-gray-50 border-2 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-black">Criar Novo Template</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="templateName" className="text-black">Nome do Template</Label>
                          <Input
                            id="templateName"
                            value={templateForm.name}
                            onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                            placeholder="Ex: Boas-vindas"
                            className="bg-white text-black"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category" className="text-black">Categoria</Label>
                          <Select 
                            value={templateForm.category} 
                            onValueChange={(value) => setTemplateForm({...templateForm, category: value})}
                          >
                            <SelectTrigger className="bg-white text-black">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="welcome">Boas-vindas</SelectItem>
                              <SelectItem value="followup">Follow-up</SelectItem>
                              <SelectItem value="promotional">Promocional</SelectItem>
                              <SelectItem value="newsletter">Newsletter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="templateSubject" className="text-black">Assunto</Label>
                        <Input
                          id="templateSubject"
                          value={templateForm.subject}
                          onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                          placeholder="Ex: Bem-vindo, {nome}!"
                          className="bg-white text-black"
                        />
                      </div>

                      <div>
                        <Label htmlFor="templateContent" className="text-black">Conteúdo</Label>
                        <Textarea
                          id="templateContent"
                          value={templateForm.content}
                          onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                          placeholder="Digite o conteúdo do template..."
                          rows={6}
                          className="bg-white text-black"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-4">
                        <Button 
                          onClick={handleCreateTemplate}
                          disabled={createTemplateMutation.isPending}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          {createTemplateMutation.isPending ? 'Criando...' : 'Criar Template'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowCreateTemplate(false)}
                          className="border-gray-300 text-black hover:bg-gray-50"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {templateLoading ? (
                    <div className="col-span-full flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      Nenhum template encontrado. Crie seu primeiro template!
                    </div>
                  ) : (
                    templates.map((template) => (
                      <Card key={template.id} className="bg-white border shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-black truncate">
                              {template.name}
                            </h3>
                            <Badge variant="outline">{template.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-4 break-words">
                            {template.subject}
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="border-gray-300 text-black hover:bg-gray-50">
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                            <Button variant="outline" size="sm" className="border-gray-300 text-black hover:bg-gray-50">
                              <Settings className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6 mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-xl font-semibold text-black">Analytics de Email</h2>
                  <Button variant="outline" size="sm" className="border-gray-300 text-black hover:bg-gray-50 w-full sm:w-auto">
                    <Filter className="w-4 h-4 mr-1" />
                    Filtros
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <Card className="bg-white border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-black">Taxa de Entrega</h3>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="text-3xl font-bold text-black mb-2">
                        {totalSent > 0 ? Math.round((campaigns.reduce((sum, c) => sum + c.delivered, 0) / totalSent) * 100) : 0}%
                      </div>
                      <p className="text-sm text-gray-600">
                        {campaigns.reduce((sum, c) => sum + c.delivered, 0)} de {totalSent} emails entregues
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-black">Taxa de Abertura</h3>
                        <Eye className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="text-3xl font-bold text-black mb-2">{avgOpenRate}%</div>
                      <p className="text-sm text-gray-600">{totalOpened} emails abertos</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-black">Taxa de Cliques</h3>
                        <Target className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="text-3xl font-bold text-black mb-2">
                        {totalSent > 0 ? Math.round((campaigns.reduce((sum, c) => sum + c.clicked, 0) / totalSent) * 100) : 0}%
                      </div>
                      <p className="text-sm text-gray-600">
                        {campaigns.reduce((sum, c) => sum + c.clicked, 0)} cliques registrados
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-black">Performance por Campanha</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {campaigns.filter(c => c.sent > 0).map((campaign) => (
                        <div key={campaign.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-black truncate">{campaign.name}</h4>
                            <Badge className={`${getStatusColor(campaign.status)} text-white w-fit`}>
                              {getStatusText(campaign.status)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Enviados</div>
                              <div className="font-semibold text-black">{campaign.sent}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Taxa Abertura</div>
                              <div className="font-semibold text-green-600">
                                {campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0}%
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Taxa Cliques</div>
                              <div className="font-semibold text-blue-600">
                                {campaign.sent > 0 ? Math.round((campaign.clicked / campaign.sent) * 100) : 0}%
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Data</div>
                              <div className="font-semibold text-black">{formatDate(campaign.createdAt)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}