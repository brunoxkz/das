import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth-jwt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Clock, Users, Target, Upload, FileText, Eye, ArrowRight, CheckCircle, AlertCircle, Calendar, Zap, Crown, Package, Brain, Flame, FolderOpen, ChevronDown, ChevronUp, Play, Pause, Trash2, BarChart3, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/useLanguage";
import SMSCampaignModal from "@/components/SMSCampaignModal";

// Componente para exibir logs da campanha
const CampaignLogs = ({ campaignId }: { campaignId: string }) => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['/api/sms-campaigns', campaignId, 'logs'],
    queryFn: async () => {
      const response = await fetch(`/api/sms-campaigns/${campaignId}/logs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Erro ao carregar logs');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs && logs.length > 0 ? (
        logs.map((log: any, index: number) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={log.status === 'sent' ? 'default' : log.status === 'delivered' ? 'secondary' : 'destructive'}>
                    {log.status === 'sent' ? 'Enviado' : log.status === 'delivered' ? 'Entregue' : 'Erro'}
                  </Badge>
                  <span className="text-sm text-gray-600">{log.phone}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{log.message}</p>
                <div className="text-xs text-gray-500">
                  {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          Nenhum log encontrado para esta campanha.
        </div>
      )}
    </div>
  );
};

// Componente para exibir analytics da campanha
const CampaignAnalytics = ({ campaignId }: { campaignId: string }) => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/sms-campaigns', campaignId, 'analytics'],
    queryFn: async () => {
      const response = await fetch(`/api/sms-campaigns/${campaignId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Erro ao carregar analytics');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {analytics ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border">
              <div className="text-3xl font-bold text-blue-600">{analytics.totalSent || 0}</div>
              <div className="text-sm text-gray-600">Total Enviados</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border">
              <div className="text-3xl font-bold text-green-600">{analytics.totalDelivered || 0}</div>
              <div className="text-sm text-gray-600">Total Entregues</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border">
              <div className="text-3xl font-bold text-red-600">{analytics.totalFailed || 0}</div>
              <div className="text-sm text-gray-600">Total Falhas</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border">
              <div className="text-3xl font-bold text-purple-600">
                {analytics.totalSent > 0 ? Math.round((analytics.totalDelivered / analytics.totalSent) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Taxa de Entrega</div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">Detalhes da Campanha</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Criada em:</span>
                <span>{analytics.createdAt ? format(new Date(analytics.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant={analytics.status === 'active' ? 'default' : 'secondary'}>
                  {analytics.status === 'active' ? 'Ativa' : 'Pausada'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Créditos utilizados:</span>
                <span>{analytics.creditsUsed || 0}</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Nenhum dado de analytics disponível para esta campanha.
        </div>
      )}
    </div>
  );
};

// Tipos de campanha conforme especificação
const CAMPAIGN_TYPES = {
  remarketing: {
    id: 'remarketing',
    name: 'Remarketing',
    icon: Package,
    description: 'Envie SMS para quem já respondeu ou abandonou o quiz',
    color: 'bg-blue-500'
  },
  remarketing_custom: {
    id: 'remarketing_custom',
    name: 'Remarketing Avançado',
    icon: Brain,
    description: 'Envie SMS ultra segmentado (idade, gênero, respostas)',
    color: 'bg-purple-500'
  },
  live: {
    id: 'live',
    name: 'Ao Vivo',
    icon: Zap,
    description: 'Envie automaticamente após novos leads responderem o quiz',
    color: 'bg-green-500'
  },
  live_custom: {
    id: 'live_custom',
    name: 'Ao Vivo Avançado',
    icon: Flame,
    description: 'Envie para novos leads com segmentação por resposta do quiz',
    color: 'bg-orange-500'
  },
  mass: {
    id: 'mass',
    name: 'Disparo em Massa',
    icon: FolderOpen,
    description: 'Suba um CSV e envie SMS em lote com variáveis simples',
    color: 'bg-gray-500'
  }
};

interface Quiz {
  id: string;
  title: string;
  published: boolean;
  responses: number;
}

interface CampaignForm {
  type: string;
  name: string;
  funnelId: string;
  segment: 'completed' | 'abandoned' | 'all';
  message: string;
  scheduleType: 'now' | 'scheduled' | 'delayed';
  scheduledDate?: string;
  scheduledTime?: string;
  delayMinutes?: number;
  // Filtros avançados
  ageMin?: number;
  ageMax?: number;
  gender?: 'male' | 'female' | 'all';
  responseFilter?: {
    field: string;
    value: string;
  };
  // Upload CSV
  csvFile?: File;
  csvData?: any[];
}

export default function SMSCampaignsAdvanced() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  
  // Estados do formulário
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<CampaignForm>({
    type: '',
    name: '',
    funnelId: '',
    segment: 'all',
    message: '',
    scheduleType: 'now'
  });
  
  // Estados auxiliares
  const [messageCount, setMessageCount] = useState(0);
  const [previewMessage, setPreviewMessage] = useState('');
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showLeadsList, setShowLeadsList] = useState(false);
  const [leadsCount, setLeadsCount] = useState({ completed: 0, abandoned: 0, all: 0 });
  const [scheduleUnit, setScheduleUnit] = useState<'minutes' | 'hours'>('minutes');
  
  // Queries
  const { data: quizzes = [], isLoading: loadingQuizzes } = useQuery({
    queryKey: ['/api/quizzes'],
    enabled: !!user
  });
  
  const { data: credits = { remaining: 0 } } = useQuery({
    queryKey: ['/api/sms-credits'],
    enabled: !!user
  });

  // Query para buscar leads por segmento
  const { data: leadsBySegment, isLoading: loadingLeads } = useQuery({
    queryKey: ['/api/quiz-responses', form.funnelId, 'segment'],
    enabled: !!form.funnelId,
    select: (data: any[]) => {
      const completed = data.filter(r => r.submittedAt && r.responses && Object.keys(r.responses).length > 0);
      const abandoned = data.filter(r => !r.submittedAt || !r.responses || Object.keys(r.responses).length === 0);
      
      return {
        completed,
        abandoned,
        all: data,
        counts: {
          completed: completed.length,
          abandoned: abandoned.length,
          all: data.length
        }
      };
    }
  });

  // Query para buscar campanhas existentes
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ['/api/sms-campaigns'],
    enabled: !!user
  });
  
  // Variáveis disponíveis para personalização
  const availableVariables = [
    { key: '{{nome}}', description: 'Nome do lead' },
    { key: '{{telefone}}', description: 'Telefone do lead' },
    { key: '{{email}}', description: 'Email do lead' },
    { key: '{{resposta_dor}}', description: 'Resposta sobre dor/problema' },
    { key: '{{idade}}', description: 'Idade do lead' },
    { key: '{{genero}}', description: 'Gênero do lead' }
  ];
  
  // Efeitos
  useEffect(() => {
    setMessageCount(form.message.length);
    generatePreview();
  }, [form.message]);
  
  // Funções auxiliares
  const generatePreview = () => {
    let preview = form.message;
    availableVariables.forEach(variable => {
      preview = preview.replace(variable.key, getExampleValue(variable.key));
    });
    setPreviewMessage(preview);
  };
  
  const getExampleValue = (key: string) => {
    const examples = {
      '{{nome}}': 'João Silva',
      '{{telefone}}': '(11) 99999-9999',
      '{{email}}': 'joao@email.com',
      '{{resposta_dor}}': 'dor nas costas',
      '{{idade}}': '35 anos',
      '{{genero}}': 'masculino'
    };
    return examples[key] || key;
  };
  
  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1, 4).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index]?.trim() || '';
          return obj;
        }, {} as any);
      });
      
      setCsvPreview(data);
      setForm(prev => ({ ...prev, csvFile: file, csvData: data }));
    };
    reader.readAsText(file);
  };
  
  const insertVariable = (variable: string) => {
    setForm(prev => ({
      ...prev,
      message: prev.message + variable
    }));
  };
  
  const isAdvancedType = () => {
    return form.type === 'remarketing_custom' || form.type === 'live_custom';
  };
  
  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return form.type;
      case 2: return form.type === 'mass' ? form.csvFile : form.funnelId;
      case 3: return form.message.trim() && form.message.length <= 160;
      case 4: return form.scheduleType === 'now' || 
                    (form.scheduleType === 'scheduled' && form.scheduledDate && form.scheduledTime) ||
                    (form.scheduleType === 'delayed' && form.delayMinutes);
      default: return true;
    }
  };
  
  const createCampaign = async () => {
    setIsCreating(true);
    try {
      // Validação antes de enviar
      if (form.type !== 'mass' && (!leadsBySegment || leadsBySegment.counts[form.segment] === 0)) {
        toast({
          title: "Nenhum lead encontrado",
          description: `Não foram encontrados leads ${form.segment === 'completed' ? 'completos' : form.segment === 'abandoned' ? 'abandonados' : ''} para este funil.`,
          variant: "destructive"
        });
        setIsCreating(false);
        return;
      }

      if (credits.remaining <= 0) {
        toast({
          title: "Créditos insuficientes",
          description: "Você não possui créditos SMS suficientes para criar esta campanha.",
          variant: "destructive"
        });
        setIsCreating(false);
        return;
      }

      const response = await fetch('/api/sms-campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...form,
          delayMinutes: scheduleUnit === 'hours' ? (form.delayMinutes || 0) * 60 : form.delayMinutes
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar campanha');
      }
      
      toast({
        title: "Campanha criada com sucesso!",
        description: "Sua campanha SMS foi criada e está sendo processada.",
      });
      
      // Atualizar queries
      queryClient.invalidateQueries({ queryKey: ['/api/sms-campaigns'] });
      
      // Reset form
      setForm({
        type: '',
        name: '',
        funnelId: '',
        segment: 'all',
        message: '',
        scheduleType: 'now'
      });
      setCurrentStep(1);
      
    } catch (error: any) {
      toast({
        title: "Erro ao criar campanha",
        description: error.message || "Verifique os dados e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="w-8 h-8 text-green-500" />
          <h1 className="text-3xl font-bold">Criar Campanha SMS</h1>
        </div>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <Progress value={(currentStep / 5) * 100} className="h-2" />
          </div>
          <span className="text-sm text-gray-500 font-medium">
            Passo {currentStep} de 5
          </span>
        </div>
        
        {/* Credits Info */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <span className="font-medium">Créditos SMS Disponíveis</span>
            </div>
            <Badge variant="outline" className="bg-white">
              {credits.remaining} créditos
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {currentStep === 1 && t("sms.selectCampaignType")}
                {currentStep === 2 && t("sms.leadSegmentation")}
                {currentStep === 3 && t("sms.messageCreation")}
                {currentStep === 4 && t("sms.scheduling")}
                {currentStep === 5 && t("sms.campaignSummary")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Step 1: Tipo de Campanha */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">Escolha o Tipo de Campanha SMS</h3>
                    <p className="text-gray-600">Selecione o tipo de campanha que deseja criar. Cada tipo abrirá um assistente personalizado.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.values(CAMPAIGN_TYPES).map((type) => {
                      const Icon = type.icon;
                      return (
                        <SMSCampaignModal
                          key={type.id}
                          onCampaignCreated={() => {
                            queryClient.invalidateQueries({ queryKey: ['/api/sms-campaigns'] });
                            toast({
                              title: "Campanha Criada",
                              description: "Sua campanha SMS foi criada com sucesso!",
                            });
                          }}
                        >
                          <Card className="cursor-pointer transition-all hover:shadow-md hover:scale-105">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${type.color} text-white`}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                  <h3 className="font-medium">{type.name}</h3>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {type.description}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </SMSCampaignModal>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Step 2: Segmentação */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {form.type !== 'mass' ? (
                    <>
                      <div>
                        <Label htmlFor="funnel">{t("sms.quizFunnel")}</Label>
                        <Select 
                          value={form.funnelId} 
                          onValueChange={(value) => setForm(prev => ({ ...prev, funnelId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("sms.selectQuiz")} />
                          </SelectTrigger>
                          <SelectContent>
                            {quizzes.map((quiz: Quiz) => (
                              <SelectItem key={quiz.id} value={quiz.id}>
                                {quiz.title} ({quiz.responses} respostas)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="segment">{t("sms.segment")}</Label>
                        <Select 
                          value={form.segment} 
                          onValueChange={(value: 'completed' | 'abandoned' | 'all') => 
                            setForm(prev => ({ ...prev, segment: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="completed">
                              ✅ {t("sms.completedQuiz")} 
                              {leadsBySegment && (
                                <Badge variant="secondary" className="ml-2">
                                  {leadsBySegment.counts.completed} leads
                                </Badge>
                              )}
                            </SelectItem>
                            <SelectItem value="abandoned">
                              ❌ {t("sms.abandonedQuiz")}
                              {leadsBySegment && (
                                <Badge variant="secondary" className="ml-2">
                                  {leadsBySegment.counts.abandoned} leads
                                </Badge>
                              )}
                            </SelectItem>
                            <SelectItem value="all">
                              👥 {t("sms.allLeads")}
                              {leadsBySegment && (
                                <Badge variant="secondary" className="ml-2">
                                  {leadsBySegment.counts.all} leads
                                </Badge>
                              )}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {/* Mostrar contagem e botão para ver lista */}
                        {leadsBySegment && form.funnelId && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium">
                                  {leadsBySegment.counts[form.segment]} {t("sms.leadsFound")}
                                </span>
                              </div>
                              {leadsBySegment.counts[form.segment] > 0 && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Eye className="w-4 h-4 mr-1" />
                                      {t("sms.viewList")}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        {t("sms.leadsList")} - {form.segment === 'completed' ? t("sms.completed") : form.segment === 'abandoned' ? t("sms.abandoned") : t("sms.all")}
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-2">
                                      {leadsBySegment[form.segment].slice(0, 100).map((lead: any, index: number) => (
                                        <div key={index} className="p-3 border rounded-lg bg-white">
                                          <div className="flex items-start justify-between">
                                            <div>
                                              <p className="font-medium">
                                                {lead.responses?.nome || lead.responses?.email || `Lead ${index + 1}`}
                                              </p>
                                              <p className="text-sm text-gray-600">
                                                {lead.responses?.telefone || lead.responses?.phone || 'Telefone não informado'}
                                              </p>
                                              <p className="text-sm text-gray-500">
                                                {lead.submittedAt ? format(new Date(lead.submittedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'Em progresso'}
                                              </p>
                                            </div>
                                            <Badge variant={lead.submittedAt ? 'default' : 'secondary'}>
                                              {lead.submittedAt ? t("sms.complete") : t("sms.abandoned")}
                                            </Badge>
                                          </div>
                                        </div>
                                      ))}
                                      {leadsBySegment[form.segment].length > 100 && (
                                        <div className="text-center text-gray-500 text-sm">
                                          Mostrando primeiros 100 leads de {leadsBySegment[form.segment].length} total
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Filtros Avançados */}
                      {isAdvancedType() && (
                        <div className="border-t pt-4">
                          <h3 className="font-medium mb-4 text-purple-600">Filtros Avançados</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Idade (anos)</Label>
                              <div className="flex gap-2">
                                <Input 
                                  type="number" 
                                  placeholder="Mín" 
                                  value={form.ageMin || ''}
                                  onChange={(e) => setForm(prev => ({ ...prev, ageMin: Number(e.target.value) }))}
                                />
                                <Input 
                                  type="number" 
                                  placeholder="Máx" 
                                  value={form.ageMax || ''}
                                  onChange={(e) => setForm(prev => ({ ...prev, ageMax: Number(e.target.value) }))}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label>Gênero</Label>
                              <Select 
                                value={form.gender || 'all'} 
                                onValueChange={(value: 'male' | 'female' | 'all') => 
                                  setForm(prev => ({ ...prev, gender: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Todos</SelectItem>
                                  <SelectItem value="male">Masculino</SelectItem>
                                  <SelectItem value="female">Feminino</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <Label>Filtro por Resposta</Label>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="Campo (ex: resposta_dor)" 
                                value={form.responseFilter?.field || ''}
                                onChange={(e) => setForm(prev => ({ 
                                  ...prev, 
                                  responseFilter: { ...prev.responseFilter, field: e.target.value } 
                                }))}
                              />
                              <Input 
                                placeholder="Valor (ex: dor nas costas)" 
                                value={form.responseFilter?.value || ''}
                                onChange={(e) => setForm(prev => ({ 
                                  ...prev, 
                                  responseFilter: { ...prev.responseFilter, value: e.target.value } 
                                }))}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    // Upload CSV para disparo em massa
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="csv">Upload CSV</Label>
                        <Input 
                          id="csv"
                          type="file" 
                          accept=".csv"
                          onChange={handleCsvUpload}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Arquivo CSV com colunas: nome, telefone, email
                        </p>
                      </div>
                      
                      {csvPreview.length > 0 && (
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <h4 className="font-medium mb-2">Preview (3 primeiras linhas)</h4>
                          <div className="space-y-2">
                            {csvPreview.map((row, index) => (
                              <div key={index} className="text-sm">
                                <strong>{row.nome}</strong> - {row.telefone} - {row.email}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Step 3: Mensagem */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome da Campanha</Label>
                    <Input 
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Remarketing Dor nas Costas"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="message">Mensagem SMS</Label>
                      <Badge variant={messageCount > 160 ? "destructive" : "outline"}>
                        {messageCount}/160
                      </Badge>
                    </div>
                    <Textarea 
                      id="message"
                      value={form.message}
                      onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Olá {{nome}}, vimos que você respondeu '{{resposta_dor}}'. Temos algo especial pra você."
                      className="min-h-[100px]"
                      maxLength={160}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {availableVariables.map((variable) => (
                      <Button 
                        key={variable.key}
                        variant="outline" 
                        size="sm"
                        onClick={() => insertVariable(variable.key)}
                      >
                        {variable.key}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Step 4: Agendamento */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label>Quando enviar?</Label>
                    <Select 
                      value={form.scheduleType} 
                      onValueChange={(value: 'now' | 'scheduled' | 'delayed') => 
                        setForm(prev => ({ ...prev, scheduleType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="now">⚡ Enviar agora</SelectItem>
                        <SelectItem value="scheduled">📅 Agendar para data/hora</SelectItem>
                        {(form.type === 'live' || form.type === 'live_custom') && (
                          <SelectItem value="delayed">⏱️ Enviar X minutos após lead responder</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {form.scheduleType === 'scheduled' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Data</Label>
                        <Input 
                          type="date"
                          value={form.scheduledDate || ''}
                          onChange={(e) => setForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Hora</Label>
                        <Input 
                          type="time"
                          value={form.scheduledTime || ''}
                          onChange={(e) => setForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                  
                  {form.scheduleType === 'delayed' && (
                    <div className="space-y-3">
                      <Label>Atraso após resposta</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="number"
                          value={form.delayMinutes || ''}
                          onChange={(e) => setForm(prev => ({ ...prev, delayMinutes: Number(e.target.value) }))}
                          placeholder="Ex: 30"
                          className="flex-1"
                        />
                        <Select 
                          value={scheduleUnit} 
                          onValueChange={(value: 'minutes' | 'hours') => setScheduleUnit(value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minutes">Minutos</SelectItem>
                            <SelectItem value="hours">Horas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="text-sm text-gray-500 bg-blue-50 p-2 rounded">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Será enviado {form.delayMinutes || 0} {scheduleUnit === 'hours' ? 'horas' : 'minutos'} após o lead responder o quiz
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Step 5: Resumo */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Tipo de Campanha</h3>
                      <p className="text-sm text-gray-600">
                        {CAMPAIGN_TYPES[form.type as keyof typeof CAMPAIGN_TYPES]?.name}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Nome</h3>
                      <p className="text-sm text-gray-600">{form.name}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Segmento</h3>
                      <p className="text-sm text-gray-600">
                        {form.segment === 'completed' ? 'Completou o quiz' : 
                         form.segment === 'abandoned' ? 'Abandonou o quiz' : 'Todos os leads'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Agendamento</h3>
                      <p className="text-sm text-gray-600">
                        {form.scheduleType === 'now' ? 'Enviar agora' : 
                         form.scheduleType === 'scheduled' ? `${form.scheduledDate} às ${form.scheduledTime}` :
                         `${form.delayMinutes} minutos após resposta`}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Mensagem</h3>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <p className="text-sm">{form.message}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Navigation Buttons */}
              <div className="flex justify-end gap-2 mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Voltar
                </Button>
                
                {currentStep < 5 ? (
                  <Button 
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canProceedToNext()}
                  >
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={createCampaign}
                    disabled={isCreating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Criar Campanha
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Preview da Mensagem */}
          {form.message && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">SMS Preview</span>
                  </div>
                  <p className="text-sm text-gray-700">{previewMessage}</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Variáveis Disponíveis */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Variáveis Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availableVariables.map((variable) => (
                    <div 
                      key={variable.key} 
                      className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                      onClick={() => insertVariable(variable.key)}
                    >
                      <div>
                        <code className="text-sm font-mono text-purple-600">{variable.key}</code>
                        <p className="text-xs text-gray-500">{variable.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Dicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                Dicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Mensagens personalizadas têm 3x mais engajamento</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Limite de 160 caracteres por SMS</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Teste sempre antes de enviar em massa</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Campanhas avançadas têm melhor performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Dashboard de Campanhas */}
      {campaigns.length > 0 && (
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Minhas Campanhas SMS
              </CardTitle>
              <CardDescription>
                Gerencie suas campanhas ativas e visualize estatísticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign: any) => (
                  <div key={campaign.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                          campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {campaign.status === 'active' ? <Play className="w-4 h-4" /> :
                           campaign.status === 'paused' ? <Pause className="w-4 h-4" /> :
                           <CheckCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-gray-600">
                            {CAMPAIGN_TYPES[campaign.type as keyof typeof CAMPAIGN_TYPES]?.name || campaign.type}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        campaign.status === 'active' ? 'default' :
                        campaign.status === 'paused' ? 'secondary' :
                        'outline'
                      }>
                        {campaign.status === 'active' ? 'Ativa' :
                         campaign.status === 'paused' ? 'Pausada' :
                         'Finalizada'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{campaign.totalSent || 0}</div>
                        <div className="text-sm text-gray-600">Enviados</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{campaign.totalDelivered || 0}</div>
                        <div className="text-sm text-gray-600">Entregues</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {campaign.totalSent > 0 ? Math.round((campaign.totalDelivered / campaign.totalSent) * 100) : 0}%
                        </div>
                        <div className="text-sm text-gray-600">Taxa Entrega</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {campaign.creditsUsed || 0}
                        </div>
                        <div className="text-sm text-gray-600">Créditos</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      {campaign.status === 'active' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/sms-campaigns/${campaign.id}/pause`, {
                                method: 'PUT',
                                headers: {
                                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                              });
                              
                              if (response.ok) {
                                toast({
                                  title: "Campanha pausada",
                                  description: "A campanha foi pausada com sucesso.",
                                });
                                queryClient.invalidateQueries({ queryKey: ['/api/sms-campaigns'] });
                              } else {
                                throw new Error('Erro ao pausar campanha');
                              }
                            } catch (error) {
                              toast({
                                title: "Erro ao pausar campanha",
                                description: "Tente novamente em alguns instantes.",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          Pausar
                        </Button>
                      )}
                      
                      {campaign.status === 'paused' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/sms-campaigns/${campaign.id}/resume`, {
                                method: 'PUT',
                                headers: {
                                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                              });
                              
                              if (response.ok) {
                                toast({
                                  title: "Campanha reativada",
                                  description: "A campanha foi reativada com sucesso.",
                                });
                                queryClient.invalidateQueries({ queryKey: ['/api/sms-campaigns'] });
                              } else {
                                throw new Error('Erro ao reativar campanha');
                              }
                            } catch (error) {
                              toast({
                                title: "Erro ao reativar campanha",
                                description: "Tente novamente em alguns instantes.",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Reativar
                        </Button>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-1" />
                            Ver Logs
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Logs da Campanha - {campaign.name}</DialogTitle>
                          </DialogHeader>
                          <CampaignLogs campaignId={campaign.id} />
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Analytics
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Analytics da Campanha - {campaign.name}</DialogTitle>
                          </DialogHeader>
                          <CampaignAnalytics campaignId={campaign.id} />
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={async () => {
                          if (confirm('Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.')) {
                            try {
                              const response = await fetch(`/api/sms-campaigns/${campaign.id}`, {
                                method: 'DELETE',
                                headers: {
                                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                                }
                              });
                              
                              if (response.ok) {
                                toast({
                                  title: "Campanha excluída",
                                  description: "A campanha foi excluída permanentemente.",
                                });
                                queryClient.invalidateQueries({ queryKey: ['/api/sms-campaigns'] });
                              } else {
                                throw new Error('Erro ao excluir campanha');
                              }
                            } catch (error) {
                              toast({
                                title: "Erro ao excluir campanha",
                                description: "Tente novamente em alguns instantes.",
                                variant: "destructive"
                              });
                            }
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}