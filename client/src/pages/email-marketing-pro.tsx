import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Settings
} from 'lucide-react';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  quizId: string;
  status: 'active' | 'sent' | 'draft' | 'scheduled';
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
  
  const [selectedTab, setSelectedTab] = useState('campaigns');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [showCampaignLogs, setShowCampaignLogs] = useState(false);
  const [selectedCampaignForLogs, setSelectedCampaignForLogs] = useState<EmailCampaign | null>(null);
  const [quizEmails, setQuizEmails] = useState<{[key: string]: {emails: number, variables: string[]}}>({});
  const [availableVariables, setAvailableVariables] = useState<string[]>([]);
  
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    content: '',
    quizId: '',
    campaignType: 'remarketing' as const,
    targetAudience: 'all' as const,
    triggerType: 'delayed' as const,
    triggerDelay: 10,
    triggerUnit: 'minutes' as const,
    dateFilter: null as Date | null
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'welcome'
  });

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

  // Query para emails disponíveis por quiz
  const { data: quizEmailsData } = useQuery({
    queryKey: ['/api/quiz-emails-count'],
    queryFn: async () => {
      const results: {[key: string]: {emails: number, variables: string[]}} = {};
      
      for (const quiz of quizzes) {
        try {
          const emailsResponse = await fetch(`/api/quizzes/${quiz.id}/responses/emails`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (emailsResponse.ok) {
            const emailsData = await emailsResponse.json();
            
            // Buscar variáveis disponíveis
            const responsesResponse = await fetch(`/api/quiz-responses/${quiz.id}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            let variables: string[] = [];
            if (responsesResponse.ok) {
              const responsesData = await responsesResponse.json();
              if (responsesData.length > 0) {
                const firstResponse = responsesData[0];
                const responseData = typeof firstResponse.responses === 'string' ? 
                  JSON.parse(firstResponse.responses) : firstResponse.responses;
                variables = Object.keys(responseData);
              }
            }
            
            results[quiz.id] = {
              emails: emailsData.totalEmails || 0,
              variables: variables
            };
          }
        } catch (error) {
          console.error(`Erro ao buscar emails para quiz ${quiz.id}:`, error);
        }
      }
      
      return results;
    },
    enabled: quizzes.length > 0
  });

  // Query para logs de campanha
  const { data: campaignLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['/api/email-logs', selectedCampaignForLogs?.id],
    queryFn: async () => {
      if (!selectedCampaignForLogs) return [];
      
      const response = await fetch(`/api/email-logs?campaignId=${selectedCampaignForLogs.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!selectedCampaignForLogs
  });

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
        description: "Sua campanha de email foi criada e está pronta para envio.",
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
        title: "Template criado com sucesso!",
        description: "Seu template de email foi criado e pode ser usado em campanhas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar template",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const startCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await fetch(`/api/email-campaigns/${campaignId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to start campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
      toast({
        title: "Campanha iniciada!",
        description: "Sua campanha foi ativada e os emails serão enviados conforme agendamento.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao iniciar campanha",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const pauseCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await fetch(`/api/email-campaigns/${campaignId}/pause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to pause campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
      toast({
        title: "Campanha pausada!",
        description: "Sua campanha foi pausada e não enviará mais emails.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao pausar campanha",
        description: error.message,
        variant: "destructive",
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
        title: "Campanha excluída!",
        description: "Sua campanha foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir campanha",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      subject: '',
      content: '',
      quizId: '',
      campaignType: 'remarketing',
      targetAudience: 'all',
      triggerType: 'delayed',
      triggerDelay: 10,
      triggerUnit: 'minutes',
      dateFilter: null
    });
    setAvailableVariables([]);
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
    if (!campaignForm.name || !campaignForm.subject || !campaignForm.content || !campaignForm.quizId || !campaignForm.campaignType) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const campaignData = {
      ...campaignForm,
      dateFilter: campaignForm.dateFilter ? Math.floor(campaignForm.dateFilter.getTime() / 1000) : null,
      variables: []
    };

    createCampaignMutation.mutate(campaignData);
  };

  const handleCreateTemplate = () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.content) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    createTemplateMutation.mutate(templateForm);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'sent': return 'bg-green-500';
      case 'draft': return 'bg-gray-500';
      case 'scheduled': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'sent': return 'Enviada';
      case 'draft': return 'Rascunho';
      case 'scheduled': return 'Agendada';
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

  const calculateOpenRate = (sent: number, opened: number) => {
    if (sent === 0) return 0;
    return Math.round((opened / sent) * 100);
  };

  const calculateClickRate = (sent: number, clicked: number) => {
    if (sent === 0) return 0;
    return Math.round((clicked / sent) * 100);
  };

  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0);
  const totalOpened = campaigns.reduce((sum, c) => sum + c.opened, 0);
  const avgOpenRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Email Marketing
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Gerencie campanhas de email para seus leads
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
          <Sparkles className="w-3 h-3 mr-1" />
          Pro
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Campanhas</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{totalCampaigns}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Campanhas Ativas</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{activeCampaigns}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Emails Enviados</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{totalSent}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Send className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Abertura</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{avgOpenRate}%</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              {/* Campaigns Tab */}
              <TabsContent value="campaigns" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Campanhas de Email
                    </h2>
                    <Badge variant="outline">{campaigns.length} campanhas</Badge>
                  </div>
                  <Button 
                    onClick={() => setShowCreateCampaign(true)}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Campanha
                  </Button>
                </div>

                {showCreateCampaign && (
                  <Card className="bg-slate-50 dark:bg-slate-900 border border-green-200 dark:border-green-800">
                    <CardHeader>
                      <CardTitle className="text-base">Criar Nova Campanha</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="quiz">1. Selecione o Quiz</Label>
                          <Select 
                            value={campaignForm.quizId} 
                            onValueChange={(value) => {
                              setCampaignForm({...campaignForm, quizId: value});
                              setSelectedQuiz(value);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um quiz para vincular a campanha" />
                            </SelectTrigger>
                            <SelectContent>
                              {quizzes.map((quiz) => (
                                <SelectItem key={quiz.id} value={quiz.id}>
                                  {quiz.title} ({quiz.responses} respostas)
                                  {quizEmailsData && quizEmailsData[quiz.id] && (
                                    <span className="text-green-600 ml-2">
                                      • {quizEmailsData[quiz.id].emails} emails
                                    </span>
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedQuiz && (
                          <div className="border-2 border-dashed border-orange-200 dark:border-orange-700 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
                            <Label className="text-base font-medium text-orange-800 dark:text-orange-200">
                              2. Tipo de Campanha
                            </Label>
                            <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                              Escolha como deseja capturar leads para essa campanha:
                            </p>
                            <div className="space-y-3">
                              <div 
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                  campaignForm.campaignType === 'live' 
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                }`}
                                onClick={() => setCampaignForm({...campaignForm, campaignType: 'live'})}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    campaignForm.campaignType === 'live' 
                                      ? 'border-green-500 bg-green-500' 
                                      : 'border-gray-300'
                                  }`}>
                                    {campaignForm.campaignType === 'live' && (
                                      <div className="w-2 h-2 bg-white rounded-full" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-green-800 dark:text-green-200">
                                      🔴 CAMPANHA AO VIVO
                                    </p>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                      Captura leads em tempo real conforme chegam novos quiz responses
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div 
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                  campaignForm.campaignType === 'remarketing' 
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                }`}
                                onClick={() => setCampaignForm({...campaignForm, campaignType: 'remarketing'})}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    campaignForm.campaignType === 'remarketing' 
                                      ? 'border-blue-500 bg-blue-500' 
                                      : 'border-gray-300'
                                  }`}>
                                    {campaignForm.campaignType === 'remarketing' && (
                                      <div className="w-2 h-2 bg-white rounded-full" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-blue-800 dark:text-blue-200">
                                      📧 CAMPANHA REMARKETING
                                    </p>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      Envia para leads antigos que já responderam o quiz anteriormente
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {campaignForm.campaignType && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">3. Nome da Campanha</Label>
                              <Input
                                id="name"
                                value={campaignForm.name}
                                onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                                placeholder={
                                  campaignForm.campaignType === 'live' 
                                    ? "Ex: Boas-vindas em tempo real" 
                                    : "Ex: Remarketing - Completaram quiz"
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="audience">4. Público Alvo</Label>
                              <Select 
                                value={campaignForm.targetAudience} 
                                onValueChange={(value: any) => setCampaignForm({...campaignForm, targetAudience: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">📊 Todos os leads
                                    {quizEmailsData && quizEmailsData[selectedQuiz] && (
                                      <span className="text-blue-600 ml-2">
                                        ({quizEmailsData[selectedQuiz].emails} emails)
                                      </span>
                                    )}
                                  </SelectItem>
                                  <SelectItem value="completed">✅ Quiz completo</SelectItem>
                                  <SelectItem value="abandoned">⏰ Quiz abandonado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        {campaignForm.campaignType === 'remarketing' && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                            <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              Filtro de Data (Opcional)
                            </Label>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                              Escolha leads que responderam o quiz a partir de uma data específica
                            </p>
                            <Input
                              type="date"
                              value={campaignForm.dateFilter ? new Date(campaignForm.dateFilter).toISOString().split('T')[0] : ''}
                              onChange={(e) => setCampaignForm({
                                ...campaignForm, 
                                dateFilter: e.target.value ? new Date(e.target.value) : null
                              })}
                              className="max-w-xs"
                            />
                          </div>
                        )}
                      </div>

                      {campaignForm.campaignType && (
                        <>
                          <div>
                            <Label htmlFor="subject">5. Assunto do Email</Label>
                            <Input
                              id="subject"
                              value={campaignForm.subject}
                              onChange={(e) => setCampaignForm({...campaignForm, subject: e.target.value})}
                              placeholder={
                                campaignForm.campaignType === 'live' 
                                  ? "Ex: Bem-vindo, {nome}! Sua resposta foi recebida"
                                  : "Ex: {nome}, não perca esta oportunidade!"
                              }
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Use variáveis: {'{nome}'}, {'{email}'}, {'{telefone}'}
                            </p>
                          </div>

                          <div>
                            <Label htmlFor="content">6. Conteúdo do Email</Label>
                            <Textarea
                              id="content"
                              value={campaignForm.content}
                              onChange={(e) => setCampaignForm({...campaignForm, content: e.target.value})}
                              placeholder={
                                campaignForm.campaignType === 'live' 
                                  ? "Olá {nome}, obrigado por responder nosso quiz! Sua resposta foi registrada..."
                                  : "Olá {nome}, notamos que você já participou do nosso quiz. Que tal conhecer nossa oferta especial?"
                              }
                              rows={6}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Variáveis disponíveis: {quizEmailsData && quizEmailsData[selectedQuiz] ? 
                                quizEmailsData[selectedQuiz].variables.map(v => `{${v}}`).join(', ') : 
                                '{nome}, {email}, {telefone}, {idade}, {altura}, {peso}'}
                            </p>
                            <p className="text-xs text-amber-600 mt-1">
                              ⚠️ Variáveis só serão enviadas se o campo for preenchido, caso contrário será processado como espaço vazio.
                            </p>
                          </div>

                          <div>
                            <Label htmlFor="trigger">7. Tipo de Disparo</Label>
                            <Select 
                              value={campaignForm.triggerType} 
                              onValueChange={(value: any) => setCampaignForm({...campaignForm, triggerType: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="delayed">⏰ Agendado (recomendado)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {campaignForm.campaignType === 'live' && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                                🔴 Campanha ao Vivo Ativa
                              </h4>
                              <p className="text-sm text-green-700 dark:text-green-300">
                                Esta campanha será executada automaticamente para todos os novos leads que responderem o quiz selecionado.
                                O sistema monitora continuamente e enviará emails conforme chegam novas respostas.
                              </p>
                            </div>
                          )}

                          {campaignForm.campaignType === 'remarketing' && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                                📧 Campanha de Remarketing
                              </h4>
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                Esta campanha será enviada para leads que já responderam o quiz anteriormente.
                                {campaignForm.dateFilter ? 
                                  ` Apenas leads que responderam a partir de ${new Date(campaignForm.dateFilter).toLocaleDateString('pt-BR')} serão incluídos.` :
                                  ' Todos os leads históricos serão incluídos.'}
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      {selectedQuiz && (
                        <div className="flex items-center gap-2 pt-4 border-t">
                          <Button 
                            onClick={handleCreateCampaign}
                            disabled={createCampaignMutation.isPending || !campaignForm.name || !campaignForm.subject || !campaignForm.content || !campaignForm.campaignType}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                          >
                            {createCampaignMutation.isPending ? 'Criando...' : 
                             campaignForm.campaignType === 'live' ? 'Ativar Campanha ao Vivo' : 'Criar Campanha Remarketing'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setShowCreateCampaign(false);
                              setSelectedQuiz('');
                              resetCampaignForm();
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
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
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Nenhuma campanha encontrada. Crie sua primeira campanha!
                    </div>
                  ) : (
                    campaigns.map((campaign) => (
                      <Card key={campaign.id} className="bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                  {campaign.name}
                                </h3>
                                <Badge className={`${getStatusColor(campaign.status)} text-white text-xs`}>
                                  {getStatusText(campaign.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                📧 {campaign.subject}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                <span>
                                  {campaign.targetAudience === 'all' ? '📊 Todos' : 
                                   campaign.targetAudience === 'completed' ? '✅ Quiz Completo' : 
                                   '⏰ Quiz Abandonado'}
                                </span>
                                <span>•</span>
                                <span>{formatDate(campaign.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {campaign.status === 'draft' && (
                                <Button 
                                  onClick={() => startCampaignMutation.mutate(campaign.id)}
                                  disabled={startCampaignMutation.isPending}
                                  size="sm"
                                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                >
                                  <Send className="w-3 h-3 mr-1" />
                                  Iniciar
                                </Button>
                              )}
                              {campaign.status === 'active' && (
                                <Button 
                                  onClick={() => pauseCampaignMutation.mutate(campaign.id)}
                                  disabled={pauseCampaignMutation.isPending}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pausar
                                </Button>
                              )}
                              <Button 
                                onClick={() => deleteCampaignMutation.mutate(campaign.id)}
                                disabled={deleteCampaignMutation.isPending}
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                              >
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Excluir
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedCampaignForLogs(campaign);
                                  setShowCampaignLogs(true);
                                }}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Logs
                              </Button>
                            </div>
                          </div>
                          
                          {campaign.sent > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <div className="grid grid-cols-4 gap-4 text-sm">
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {campaign.sent}
                                  </div>
                                  <div className="text-gray-600 dark:text-gray-400">Enviados</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {campaign.delivered}
                                  </div>
                                  <div className="text-gray-600 dark:text-gray-400">Entregues</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                                    {campaign.opened}
                                  </div>
                                  <div className="text-gray-600 dark:text-gray-400">Abertos</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                    {campaign.clicked}
                                  </div>
                                  <div className="text-gray-600 dark:text-gray-400">Cliques</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Templates de Email
                    </h2>
                    <Badge variant="outline">{templates.length} templates</Badge>
                  </div>
                  <Button 
                    onClick={() => setShowCreateTemplate(true)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Template
                  </Button>
                </div>

                {showCreateTemplate && (
                  <Card className="bg-slate-50 dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                      <CardTitle className="text-lg">Criar Novo Template</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="templateName">Nome do Template</Label>
                          <Input
                            id="templateName"
                            value={templateForm.name}
                            onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                            placeholder="Ex: Boas-vindas"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Categoria</Label>
                          <Select 
                            value={templateForm.category} 
                            onValueChange={(value) => setTemplateForm({...templateForm, category: value})}
                          >
                            <SelectTrigger>
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
                        <Label htmlFor="templateSubject">Assunto</Label>
                        <Input
                          id="templateSubject"
                          value={templateForm.subject}
                          onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                          placeholder="Ex: Bem-vindo, {nome}!"
                        />
                      </div>

                      <div>
                        <Label htmlFor="templateContent">Conteúdo</Label>
                        <Textarea
                          id="templateContent"
                          value={templateForm.content}
                          onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                          placeholder="Digite o conteúdo do template..."
                          rows={8}
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-4">
                        <Button 
                          onClick={handleCreateTemplate}
                          disabled={createTemplateMutation.isPending}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                          {createTemplateMutation.isPending ? 'Criando...' : 'Criar Template'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowCreateTemplate(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templateLoading ? (
                    <div className="col-span-full flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                      Nenhum template encontrado. Crie seu primeiro template!
                    </div>
                  ) : (
                    templates.map((template) => (
                      <Card key={template.id} className="bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {template.name}
                            </h3>
                            <Badge variant="outline">{template.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {template.subject}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                            <Button variant="outline" size="sm">
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
              <TabsContent value="analytics" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Analytics de Email
                  </h2>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-1" />
                    Filtros
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Taxa de Entrega
                        </h3>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {totalSent > 0 ? Math.round((campaigns.reduce((sum, c) => sum + c.delivered, 0) / totalSent) * 100) : 0}%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {campaigns.reduce((sum, c) => sum + c.delivered, 0)} de {totalSent} emails entregues
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Taxa de Abertura
                        </h3>
                        <Eye className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {avgOpenRate}%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {totalOpened} emails abertos
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Taxa de Cliques
                        </h3>
                        <Target className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {totalSent > 0 ? Math.round((campaigns.reduce((sum, c) => sum + c.clicked, 0) / totalSent) * 100) : 0}%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {campaigns.reduce((sum, c) => sum + c.clicked, 0)} cliques registrados
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Performance por Campanha</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {campaigns.filter(c => c.sent > 0).map((campaign) => (
                        <div key={campaign.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {campaign.name}
                            </h4>
                            <Badge className={`${getStatusColor(campaign.status)} text-white`}>
                              {getStatusText(campaign.status)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600 dark:text-gray-400">Enviados</div>
                              <div className="font-semibold text-gray-900 dark:text-white">{campaign.sent}</div>
                            </div>
                            <div>
                              <div className="text-gray-600 dark:text-gray-400">Taxa Abertura</div>
                              <div className="font-semibold text-green-600 dark:text-green-400">
                                {calculateOpenRate(campaign.sent, campaign.opened)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600 dark:text-gray-400">Taxa Cliques</div>
                              <div className="font-semibold text-blue-600 dark:text-blue-400">
                                {calculateClickRate(campaign.sent, campaign.clicked)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600 dark:text-gray-400">Data</div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {formatDate(campaign.createdAt)}
                              </div>
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

      {/* Campaign Logs Dialog */}
      <Dialog open={showCampaignLogs} onOpenChange={setShowCampaignLogs}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Logs da Campanha: {selectedCampaignForLogs?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : campaignLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum log encontrado para esta campanha.
              </div>
            ) : (
              <div className="space-y-2">
                {campaignLogs.map((log: any) => (
                  <div key={log.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {log.recipientEmail}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {log.personalizedSubject}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${log.status === 'sent' ? 'bg-green-500' : 
                          log.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
                          {log.status}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {log.errorMessage && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
                        {log.errorMessage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}