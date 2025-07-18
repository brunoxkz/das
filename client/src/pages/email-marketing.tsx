import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth-jwt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, Clock, Users, Target, Upload, FileText, Eye, ArrowRight, CheckCircle, AlertCircle, Calendar, Zap, Crown, Package, Brain, Flame, FolderOpen, ChevronDown, ChevronUp, Play, Pause, Trash2, BarChart3, X, TrendingUp, Edit3, Plus, Settings, Sparkles, RefreshCw, TestTube, Wand2, Code, Info, Loader2, XCircle, Clock3 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Tipos de campanha de email seguindo o padrão EXATO do SMS
type CampaignStyle = 'remarketing' | 'remarketing_ultra_customizado' | 'ao_vivo_tempo_real' | 'ao_vivo_ultra_customizada';

const CAMPAIGN_STYLES: Record<CampaignStyle, { name: string; icon: any; description: string; color: string; }> = {
  remarketing: {
    name: 'Remarketing',
    icon: Package,
    description: 'Envie emails para quem já respondeu ou abandonou o quiz',
    color: 'bg-blue-500'
  },
  remarketing_ultra_customizado: {
    name: 'Remarketing Ultra Customizado',
    icon: Brain,
    description: 'Envie emails ultra segmentados por idade, gênero, respostas específicas',
    color: 'bg-purple-500'
  },
  ao_vivo_tempo_real: {
    name: 'Ao Vivo (Tempo Real)',
    icon: Zap,
    description: 'Envie automaticamente para novos leads que responderem o quiz',
    color: 'bg-green-500'
  },
  ao_vivo_ultra_customizada: {
    name: 'Ao Vivo Ultra Customizada',
    icon: Flame,
    description: 'Envie para novos leads com segmentação avançada automática',
    color: 'bg-orange-500'
  }
};

interface Quiz {
  id: string;
  title: string;
  published: boolean;
  responses: number;
}

interface EmailCampaign {
  id: string;
  name: string;
  quizId: string;
  quizTitle: string;
  status: 'active' | 'paused' | 'completed';
  subject: string;
  content: string;
  targetAudience: 'all' | 'completed' | 'abandoned';
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  createdAt: string;
  campaignType?: string;
}

interface EmailCampaignForm {
  name: string;
  subject: string;
  content: string;
  targetAudience: 'completed' | 'abandoned' | 'all';
  quizId: string;
  triggerType: 'immediate' | 'delayed' | 'scheduled';
  triggerDelay?: number;
  triggerUnit?: 'minutes' | 'hours' | 'days';
  fromDate?: string;
  campaignType?: string;
}

export default function EmailMarketing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados principais seguindo padrão do SMS
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'campaigns' | 'logs'>('overview');
  const [selectedCampaignStyle, setSelectedCampaignStyle] = useState<CampaignStyle | null>(null);
  const [selectedCampaignLogs, setSelectedCampaignLogs] = useState<string | null>(null);
  const [showUltraPersonalizedModal, setShowUltraPersonalizedModal] = useState(false);
  const [selectedQuizForUltraPersonalized, setSelectedQuizForUltraPersonalized] = useState<{ id: string; title: string } | null>(null);

  // Form seguindo estrutura do SMS
  const [campaignForm, setCampaignForm] = useState<EmailCampaignForm>({
    name: "",
    subject: "",
    content: "",
    targetAudience: "completed",
    quizId: "",
    triggerType: "immediate",
    triggerDelay: 1,
    triggerUnit: "hours",
    fromDate: "",
    campaignType: ""
  });

  // Buscar créditos de email
  const { data: emailCredits } = useQuery({
    queryKey: ["/api/email-credits"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/email-credits", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch email credits");
      return response.json();
    }
  });

  // Buscar campanhas de email
  const { data: emailCampaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/email-campaigns"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/email-campaigns", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch email campaigns");
      return response.json();
    }
  });

  // Buscar quizzes
  const { data: quizzes } = useQuery({
    queryKey: ["/api/quizzes"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/quizzes", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch quizzes");
      return response.json();
    }
  });

  // Buscar emails do quiz (adaptado do SMS)
  const { data: quizEmails } = useQuery({
    queryKey: ["/api/quiz-emails", campaignForm.quizId],
    queryFn: async () => {
      if (!campaignForm.quizId) return { emails: [] };
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/quiz-emails/${campaignForm.quizId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch quiz emails");
      return response.json();
    },
    enabled: !!campaignForm.quizId,
    staleTime: 30000,
    cacheTime: 60000,
    refetchInterval: 60000
  });

  // Calcular contadores dinâmicos de leads por público-alvo
  const getLeadCounts = () => {
    if (!quizEmails?.emails) return { completed: 0, abandoned: 0, all: 0 };
    
    const emails = quizEmails.emails;
    const completed = emails.filter((e: any) => e.status === 'completed').length;
    const abandoned = emails.filter((e: any) => e.status === 'abandoned').length;
    const all = emails.length;
    
    return { completed, abandoned, all };
  };

  // Calcular leads após filtro de data (LISTA OFICIAL PARA ENVIO)
  const getFilteredLeadCounts = () => {
    if (!quizEmails?.emails) return { completed: 0, abandoned: 0, all: 0, totalBeforeFilter: 0 };
    
    let emails = quizEmails.emails;
    const totalBeforeFilter = emails.length;
    
    // Aplicar filtro de data se especificado
    if (campaignForm.fromDate) {
      const filterDate = new Date(campaignForm.fromDate);
      emails = emails.filter((e: any) => {
        const responseDate = new Date(e.submittedAt);
        return responseDate >= filterDate;
      });
    }
    
    // Aplicar filtro de público-alvo
    let filteredEmails = emails;
    if (campaignForm.targetAudience === 'completed') {
      filteredEmails = emails.filter((e: any) => e.status === 'completed');
    } else if (campaignForm.targetAudience === 'abandoned') {
      filteredEmails = emails.filter((e: any) => e.status === 'abandoned');
    }
    
    return {
      completed: emails.filter((e: any) => e.status === 'completed').length,
      abandoned: emails.filter((e: any) => e.status === 'abandoned').length,
      all: emails.length,
      totalBeforeFilter,
      finalCount: filteredEmails.length,
      filteredByDate: totalBeforeFilter - emails.length
    };
  };

  const leadCounts = getLeadCounts();
  const filteredCounts = getFilteredLeadCounts();

  // Criar campanha de email
  const createEmailCampaignMutation = useMutation({
    mutationFn: async (formData: EmailCampaignForm) => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/email-campaigns", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error("Failed to create email campaign");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Campanha de Email Criada",
        description: "Sua campanha foi criada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email-campaigns"] });
      setActiveTab('campaigns');
      setSelectedCampaignStyle(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar campanha",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Pausar/reativar campanha
  const toggleCampaignMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'pause' | 'resume' }) => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/email-campaigns/${id}/${action}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Failed to ${action} campaign`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-campaigns"] });
      toast({
        title: "Status atualizado",
        description: "O status da campanha foi atualizado com sucesso!",
      });
    }
  });

  // Deletar campanha
  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/email-campaigns/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to delete campaign");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-campaigns"] });
      toast({
        title: "Campanha deletada",
        description: "A campanha foi deletada com sucesso!",
      });
    }
  });

  // Função para criar campanha
  const handleCreateCampaign = () => {
    if (!selectedCampaignStyle) return;
    
    const formData = {
      ...campaignForm,
      campaignType: selectedCampaignStyle
    };
    
    createEmailCampaignMutation.mutate(formData);
  };

  // Renderizar seleção de estilo de campanha
  const renderCampaignStyleSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha o Estilo da Campanha de Email</h2>
        <p className="text-gray-600">Selecione o tipo de campanha de email que você deseja criar</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(CAMPAIGN_STYLES).map(([key, style]) => {
          const IconComponent = style.icon;
          return (
            <Card 
              key={key}
              className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                selectedCampaignStyle === key ? 'border-green-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedCampaignStyle(key as CampaignStyle)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`${style.color} text-white p-3 rounded-lg`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{style.name}</h3>
                    <p className="text-gray-600 text-sm">{style.description}</p>
                  </div>
                  {selectedCampaignStyle === key && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {selectedCampaignStyle && (
        <div className="flex justify-center">
          <Button onClick={() => setActiveTab('create')} className="px-8">
            Continuar <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );

  // Renderizar formulário de criação
  const renderCampaignForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => {
            setActiveTab('overview');
            setSelectedCampaignStyle(null);
          }}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Voltar à Seleção
        </Button>
        {selectedCampaignStyle && (
          <Badge className={`${CAMPAIGN_STYLES[selectedCampaignStyle].color} text-white`}>
            {CAMPAIGN_STYLES[selectedCampaignStyle].name}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurar Campanha de Email</CardTitle>
          <CardDescription>
            Preencha os detalhes da sua campanha de email marketing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nome da Campanha */}
          <div>
            <Label htmlFor="campaignName">Nome da Campanha</Label>
            <Input
              id="campaignName"
              value={campaignForm.name}
              onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Remarketing Quiz Produto X"
            />
          </div>

          {/* Seleção de Quiz */}
          <div>
            <Label htmlFor="quizSelection">Selecionar Quiz</Label>
            <Select 
              value={campaignForm.quizId} 
              onValueChange={(value) => setCampaignForm(prev => ({ ...prev, quizId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha um quiz" />
              </SelectTrigger>
              <SelectContent>
                {quizzes?.map((quiz: Quiz) => (
                  <SelectItem key={quiz.id} value={quiz.id}>
                    {quiz.title} ({quiz.responses} respostas)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Público-alvo */}
          <div>
            <Label>Público-alvo</Label>
            <Select 
              value={campaignForm.targetAudience} 
              onValueChange={(value: any) => setCampaignForm(prev => ({ ...prev, targetAudience: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">
                  Leads que completaram o quiz ({leadCounts.completed})
                </SelectItem>
                <SelectItem value="abandoned">
                  Leads que abandonaram o quiz ({leadCounts.abandoned})
                </SelectItem>
                <SelectItem value="all">
                  Todos os leads ({leadCounts.all})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assunto do Email */}
          <div>
            <Label htmlFor="subject">Assunto do Email</Label>
            <Input
              id="subject"
              value={campaignForm.subject}
              onChange={(e) => setCampaignForm(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Ex: Oferta especial para você!"
            />
          </div>

          {/* Conteúdo do Email */}
          <div>
            <Label htmlFor="content">Conteúdo do Email</Label>
            <Textarea
              id="content"
              value={campaignForm.content}
              onChange={(e) => setCampaignForm(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Digite o conteúdo do seu email..."
              rows={8}
            />
          </div>

          {/* Filtro de Data */}
          <div>
            <Label htmlFor="fromDate">Leads a partir de (opcional)</Label>
            <Input
              id="fromDate"
              type="date"
              value={campaignForm.fromDate}
              onChange={(e) => setCampaignForm(prev => ({ ...prev, fromDate: e.target.value }))}
            />
            {campaignForm.fromDate && filteredCounts.filteredByDate > 0 && (
              <p className="text-sm text-orange-600 mt-1">
                {filteredCounts.filteredByDate} leads serão filtrados por data
              </p>
            )}
          </div>

          {/* Preview dos Leads */}
          {campaignForm.quizId && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Preview da Lista de Envio</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total de Leads:</span>
                  <span className="ml-2 font-medium">{filteredCounts.finalCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Créditos Necessários:</span>
                  <span className="ml-2 font-medium">{filteredCounts.finalCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Créditos Disponíveis:</span>
                  <span className={`ml-2 font-medium ${
                    (emailCredits?.emailCredits || 0) >= filteredCounts.finalCount 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {emailCredits?.emailCredits || 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Botão de Criar */}
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setActiveTab('overview');
                setSelectedCampaignStyle(null);
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateCampaign}
              disabled={!campaignForm.name || !campaignForm.quizId || !campaignForm.subject || !campaignForm.content || createEmailCampaignMutation.isPending}
            >
              {createEmailCampaignMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Send className="mr-2 w-4 h-4" />
                  Criar Campanha
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Mail className="mr-3 w-8 h-8 text-blue-600" />
              Email Marketing
            </h1>
            <p className="text-gray-600 mt-2">
              Gerencie suas campanhas de email marketing com integração Brevo
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="px-3 py-1">
              <Clock className="mr-1 w-4 h-4" />
              Créditos: {emailCredits?.emailCredits || 0}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab as any} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="create" disabled={!selectedCampaignStyle}>Criar Campanha</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderCampaignStyleSelection()}
        </TabsContent>

        <TabsContent value="create">
          {selectedCampaignStyle && renderCampaignForm()}
        </TabsContent>

        <TabsContent value="campaigns">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Campanhas Ativas</h2>
              <Button onClick={() => setActiveTab('overview')}>
                <Plus className="mr-2 w-4 h-4" />
                Nova Campanha
              </Button>
            </div>

            {campaignsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : emailCampaigns && emailCampaigns.length > 0 ? (
              <div className="grid gap-4">
                {emailCampaigns.map((campaign: EmailCampaign) => (
                  <Card key={campaign.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg">{campaign.name}</h3>
                            <Badge variant={
                              campaign.status === 'active' ? 'default' : 
                              campaign.status === 'paused' ? 'secondary' : 'outline'
                            }>
                              {campaign.status === 'active' ? 'Ativa' : 
                               campaign.status === 'paused' ? 'Pausada' : 'Completa'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{campaign.subject}</p>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Enviados:</span>
                              <span className="ml-1 font-medium">{campaign.sent}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Entregues:</span>
                              <span className="ml-1 font-medium">{campaign.delivered}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Abertos:</span>
                              <span className="ml-1 font-medium">{campaign.opened}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Cliques:</span>
                              <span className="ml-1 font-medium">{campaign.clicked}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCampaignLogs(campaign.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleCampaignMutation.mutate({
                              id: campaign.id,
                              action: campaign.status === 'active' ? 'pause' : 'resume'
                            })}
                          >
                            {campaign.status === 'active' ? 
                              <Pause className="w-4 h-4" /> : 
                              <Play className="w-4 h-4" />
                            }
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteCampaignMutation.mutate(campaign.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Mail className="mx-auto w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma campanha criada
                </h3>
                <p className="text-gray-600 mb-6">
                  Crie sua primeira campanha de email marketing para começar.
                </p>
                <Button onClick={() => setActiveTab('overview')}>
                  <Plus className="mr-2 w-4 h-4" />
                  Criar Primeira Campanha
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Logs de Campanhas</h2>
            <p className="text-gray-600">
              Visualize logs detalhados de todas as suas campanhas de email.
            </p>
            {/* Implementar logs aqui */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}