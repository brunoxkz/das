import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth-jwt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Clock, Users, Target, Upload, FileText, Eye, ArrowRight, CheckCircle, AlertCircle, Calendar, Zap, Crown, Package, Brain, Flame, FolderOpen, ChevronDown, ChevronUp, Play, Pause, Trash2, BarChart3, X, Sparkles, Layers, Filter, CheckSquare } from "lucide-react";
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
  quantum_remarketing: {
    id: 'quantum_remarketing',
    name: 'Quantum Remarketing',
    icon: Zap,
    description: 'Sistema ultra-granular para remarketing avançado por resposta específica',
    color: 'bg-gradient-to-r from-purple-600 to-blue-600'
  },
  live: {
    id: 'live',
    name: 'Ao Vivo',
    icon: Layers,
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
  quantum_live: {
    id: 'quantum_live',
    name: 'Ao Vivo Quantum',
    icon: Sparkles,
    description: 'Monitoramento em tempo real com segmentação quantum automática',
    color: 'bg-gradient-to-r from-emerald-500 to-teal-500'
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
  const [uniqueResponses, setUniqueResponses] = useState<string[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  
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

  // Buscar respostas únicas quando o campo for selecionado (Sistema Ultra)
  useEffect(() => {
    if (form.type?.includes('quantum') && form.responseFilter?.field) {
      fetchUniqueResponses(form.responseFilter.field);
    } else {
      setUniqueResponses([]);
    }
  }, [form.responseFilter?.field, form.funnelId]);
  
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

  // Função para buscar respostas únicas de um campo específico (Sistema Ultra)
  const fetchUniqueResponses = async (fieldName: string) => {
    if (!form.funnelId || !fieldName) {
      setUniqueResponses([]);
      return;
    }

    setLoadingResponses(true);
    try {
      const response = await fetch(`/api/quizzes/${form.funnelId}/variables-ultra`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const fieldData = data.variables.find((v: any) => v.field === fieldName);
        if (fieldData && fieldData.values) {
          setUniqueResponses(fieldData.values);
        } else {
          setUniqueResponses([]);
        }
      } else {
        setUniqueResponses([]);
      }
    } catch (error) {
      console.error('Erro ao buscar respostas únicas:', error);
      setUniqueResponses([]);
    } finally {
      setLoadingResponses(false);
    }
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
                    <p className="text-gray-600">Selecione o tipo de campanha que deseja criar. Cada tipo possui suas próprias configurações específicas.</p>
                  </div>
                  
                  {/* Layout responsivo melhorado para 5 itens - todos visíveis */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-4 md:gap-3">
                    {Object.values(CAMPAIGN_TYPES).map((type) => {
                      const Icon = type.icon;
                      const isQuantum = type.id.includes('quantum');
                      const isSelected = form.type === type.id;
                      
                      return (
                        <Card 
                          key={type.id}
                          className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 transform ${
                            isSelected 
                              ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg' 
                              : 'hover:bg-gray-50'
                          } ${isQuantum ? 'relative overflow-hidden border-purple-200' : ''}`}
                          onClick={() => setForm(prev => ({ ...prev, type: type.id }))}
                        >
                          <CardContent className="p-4 h-full">
                            {isQuantum && (
                              <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-blue-600 text-white text-xs px-2 py-1 rounded-bl-lg font-medium">
                                QUANTUM
                              </div>
                            )}
                            
                            {/* Indicador de seleção */}
                            {isSelected && (
                              <div className="absolute top-2 left-2 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                <CheckSquare className="w-2 h-2 text-white" />
                              </div>
                            )}
                            
                            <div className="flex flex-col items-center text-center space-y-3 mt-2">
                              {/* Ícone centralizado e maior */}
                              <div className={`p-3 rounded-xl ${
                                isQuantum 
                                  ? type.color + ' shadow-lg' 
                                  : type.color + ' text-white shadow-md'
                              } ${isSelected ? 'scale-110' : ''} transition-transform duration-300`}>
                                <Icon className={`w-6 h-6 ${isQuantum ? 'text-white' : ''}`} />
                              </div>
                              
                              {/* Nome e badge quantum */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-center gap-1">
                                  <h3 className={`font-semibold text-sm ${
                                    isSelected ? 'text-blue-700' : 'text-gray-800'
                                  }`}>
                                    {type.name}
                                  </h3>
                                  {isQuantum && <Sparkles className="w-3 h-3 text-purple-600" />}
                                </div>
                                
                                {isQuantum && (
                                  <div className="text-xs text-purple-600 font-medium bg-purple-100 px-2 py-1 rounded-full">
                                    Ultra-Granular ⚡
                                  </div>
                                )}
                              </div>
                              
                              {/* Descrição compacta */}
                              <p className="text-xs text-gray-600 leading-tight h-9 overflow-hidden">
                                {type.description}
                              </p>
                              
                              {/* Botão visual de seleção */}
                              <div className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                                isSelected 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}>
                                {isSelected ? '✓ Selecionado' : 'Selecionar'}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  {/* Quantum Info Alert */}
                  {form.type && (form.type === 'quantum_remarketing' || form.type === 'quantum_live') && (
                    <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <AlertDescription className="text-purple-800">
                        <strong>Sistema Quantum Selecionado!</strong> {' '}
                        {form.type === 'quantum_remarketing' 
                          ? 'Este sistema permite segmentação ultra-granular por respostas específicas para remarketing avançado.'
                          : 'Este sistema monitora leads em tempo real e aplica segmentação quantum automática para máxima eficiência.'
                        }
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
              
              {/* Step 2: Segmentação */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {form.type !== 'mass' ? (
                    <>
                      <div>
                        <Label htmlFor="funnel">
                          {form.type?.includes('quantum') ? 'Quiz/Funil para Sistema Quantum' : 'Quiz/Funil'}
                        </Label>
                        <Select 
                          value={form.funnelId} 
                          onValueChange={(value) => setForm(prev => ({ ...prev, funnelId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              form.type?.includes('quantum') 
                                ? "Selecione quiz para análise ultra-granular" 
                                : "Selecione o quiz"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {quizzes.map((quiz: Quiz) => (
                              <SelectItem key={quiz.id} value={quiz.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{quiz.title}</span>
                                  <div className="flex items-center gap-2 ml-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {quiz.responses} respostas
                                    </Badge>
                                    {form.type?.includes('quantum') && quiz.responses > 10 && (
                                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600">
                                        QUANTUM OK
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.type?.includes('quantum') && form.funnelId && (
                          <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center gap-2 text-purple-800 text-sm">
                              <Sparkles className="w-4 h-4" />
                              <span className="font-medium">Sistema Quantum Ativo</span>
                            </div>
                            <p className="text-purple-700 text-xs mt-1">
                              Este quiz será analisado com segmentação ultra-granular por resposta específica
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* SMS Remarketing - Filtros Específicos */}
                      {form.type === 'quantum_remarketing' && (
                        <div className="space-y-4 border p-4 rounded-lg bg-gradient-to-r from-purple-50 to-white border-purple-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Target className="w-5 h-5 text-purple-600" />
                            <h3 className="font-medium text-purple-800">SMS Remarketing - Filtros de Data</h3>
                            <Badge className="bg-purple-600 text-white">QUANTUM</Badge>
                          </div>
                          
                          <div>
                            <Label className="flex items-center gap-2">
                              <Filter className="w-4 h-4" />
                              Status do Lead
                            </Label>
                            <Select 
                              value={form.segment} 
                              onValueChange={(value: 'completed' | 'abandoned' | 'all') => 
                                setForm(prev => ({ ...prev, segment: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="abandoned">⏸️ Lead Abandonou Quiz</SelectItem>
                                <SelectItem value="completed">✅ Lead Completou Quiz</SelectItem>
                                <SelectItem value="all">📊 Todos os Leads</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Período de Leads (Data X até Data X)
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <Input 
                                type="date"
                                value={form.dateFrom || ''} 
                                onChange={(e) => setForm(prev => ({ ...prev, dateFrom: e.target.value }))}
                                placeholder="Data inicial"
                                className="border-purple-200"
                              />
                              <Input 
                                type="date"
                                value={form.dateTo || ''} 
                                onChange={(e) => setForm(prev => ({ ...prev, dateTo: e.target.value }))}
                                placeholder="Data final"
                                className="border-purple-200"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Quando Disparar
                            </Label>
                            <Select 
                              value={form.dispatchTiming || 'immediate'} 
                              onValueChange={(value: 'immediate' | 'delayed') => 
                                setForm(prev => ({ ...prev, dispatchTiming: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="immediate">⚡ Disparar Imediatamente</SelectItem>
                                <SelectItem value="delayed">⏱️ Disparar Daqui X Tempo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {form.dispatchTiming === 'delayed' && (
                            <div className="ml-4 p-3 bg-blue-50 rounded border border-blue-200">
                              <Label className="text-sm">Delay para Disparo</Label>
                              <div className="flex gap-2 mt-1">
                                <Input 
                                  type="number"
                                  placeholder="30"
                                  value={form.dispatchDelayValue || ''}
                                  onChange={(e) => setForm(prev => ({ ...prev, dispatchDelayValue: Number(e.target.value) }))}
                                  className="w-24"
                                />
                                <Select 
                                  value={form.dispatchDelayUnit || 'minutes'} 
                                  onValueChange={(value: 'minutes' | 'hours' | 'days') => 
                                    setForm(prev => ({ ...prev, dispatchDelayUnit: value }))}
                                >
                                  <SelectTrigger className="w-32">
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
                          )}
                        </div>
                      )}
                      
                      {/* Remarketing Avançado - Filtros + Respostas Específicas */}
                      {form.type === 'quantum_live' && (
                        <div className="space-y-4 border p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Layers className="w-5 h-5 text-blue-600" />
                            <h3 className="font-medium text-blue-800">Remarketing Avançado - Filtros + Respostas</h3>
                            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">ADVANCED</Badge>
                          </div>
                          
                          <div>
                            <Label className="flex items-center gap-2">
                              <Filter className="w-4 h-4" />
                              Status do Lead
                            </Label>
                            <Select 
                              value={form.segment} 
                              onValueChange={(value: 'completed' | 'abandoned' | 'all') => 
                                setForm(prev => ({ ...prev, segment: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="abandoned">⏸️ Lead Abandonou Quiz</SelectItem>
                                <SelectItem value="completed">✅ Lead Completou Quiz</SelectItem>
                                <SelectItem value="all">📊 Todos os Leads</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Período de Leads (Data X até Data X)
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <Input 
                                type="date"
                                value={form.dateFrom || ''} 
                                onChange={(e) => setForm(prev => ({ ...prev, dateFrom: e.target.value }))}
                                placeholder="Data inicial"
                                className="border-blue-200"
                              />
                              <Input 
                                type="date"
                                value={form.dateTo || ''} 
                                onChange={(e) => setForm(prev => ({ ...prev, dateTo: e.target.value }))}
                                placeholder="Data final"
                                className="border-blue-200"
                              />
                            </div>
                          </div>
                          
                          <div className="border-t pt-4">
                            <Label className="flex items-center gap-2 mb-3">
                              <CheckSquare className="w-4 h-4 text-purple-600" />
                              Respostas Específicas do Quiz (Escolha quantas quiser)
                            </Label>
                            
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-sm">Campo da Resposta</Label>
                                  <Select 
                                    value={form.responseFilter?.field || ''} 
                                    onValueChange={(value) => setForm(prev => ({ 
                                      ...prev, 
                                      responseFilter: { ...prev.responseFilter, field: value } 
                                    }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione campo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="p1_objetivo_fitness">p1_objetivo_fitness</SelectItem>
                                      <SelectItem value="p2_nivel_experiencia">p2_nivel_experiencia</SelectItem>
                                      <SelectItem value="p3_disponibilidade">p3_disponibilidade</SelectItem>
                                      <SelectItem value="p4_dor_problema">p4_dor_problema</SelectItem>
                                      <SelectItem value="p5_meta_principal">p5_meta_principal</SelectItem>
                                      <SelectItem value="nome">nome</SelectItem>
                                      <SelectItem value="email">email</SelectItem>
                                      <SelectItem value="telefone">telefone</SelectItem>
                                      <SelectItem value="idade">idade</SelectItem>
                                      <SelectItem value="peso">peso</SelectItem>
                                      <SelectItem value="altura">altura</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <Label className="text-sm">Valor da Resposta</Label>
                                  <Input 
                                    placeholder="Ex: Emagrecer, Ganhar Massa, etc." 
                                    value={form.responseFilter?.value || ''}
                                    onChange={(e) => setForm(prev => ({ 
                                      ...prev, 
                                      responseFilter: { ...prev.responseFilter, value: e.target.value } 
                                    }))}
                                  />
                                </div>
                              </div>
                              
                              {form.responseFilter?.field && form.responseFilter?.value && (
                                <div className="p-3 bg-green-50 rounded border border-green-200">
                                  <div className="flex items-center gap-2 text-green-800">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="font-medium text-sm">
                                      Filtro: {form.responseFilter.field} = "{form.responseFilter.value}"
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <Label className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Quando Disparar
                            </Label>
                            <Select 
                              value={form.dispatchTiming || 'immediate'} 
                              onValueChange={(value: 'immediate' | 'delayed') => 
                                setForm(prev => ({ ...prev, dispatchTiming: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="immediate">⚡ Disparar Imediatamente</SelectItem>
                                <SelectItem value="delayed">⏱️ Disparar Daqui X Tempo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {form.dispatchTiming === 'delayed' && (
                            <div className="ml-4 p-3 bg-purple-50 rounded border border-purple-200">
                              <Label className="text-sm">Delay para Disparo</Label>
                              <div className="flex gap-2 mt-1">
                                <Input 
                                  type="number"
                                  placeholder="30"
                                  value={form.dispatchDelayValue || ''}
                                  onChange={(e) => setForm(prev => ({ ...prev, dispatchDelayValue: Number(e.target.value) }))}
                                  className="w-24"
                                />
                                <Select 
                                  value={form.dispatchDelayUnit || 'minutes'} 
                                  onValueChange={(value: 'minutes' | 'hours' | 'days') => 
                                    setForm(prev => ({ ...prev, dispatchDelayUnit: value }))}
                                >
                                  <SelectTrigger className="w-32">
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
                          )}
                        </div>
                      )}
                      
                      {/* Campanhas Tradicionais - Filtros Padrão */}
                      {!form.type?.includes('quantum') && (
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
                        </div>
                      )}
                      
                      {/* Filtros Quantum Ultra-Granulares */}
                      {form.type?.includes('quantum') && form.funnelId && (
                        <div className="border-t pt-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Zap className="w-5 h-5 text-purple-600" />
                            <h3 className="font-medium text-purple-600">Filtros Quantum Ultra-Granulares</h3>
                            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
                              ADVANCED
                            </Badge>
                          </div>
                          
                          <div className="space-y-4">
                            <Alert className="border-purple-200 bg-purple-50">
                              <Sparkles className="h-4 w-4 text-purple-600" />
                              <AlertDescription className="text-purple-800">
                                <strong>Sistema Ultra Ativo:</strong> Configure filtros ultra-específicos baseados nas respostas exatas dos leads. 
                                {form.type === 'quantum_remarketing' 
                                  ? ' Ideal para remarketing preciso por comportamento.'
                                  : ' Monitora automaticamente novos leads com estas características.'
                                }
                              </AlertDescription>
                            </Alert>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="flex items-center gap-2">
                                  <Target className="w-4 h-4 text-purple-600" />
                                  Campo Ultra-Específico
                                </Label>
                                <Select 
                                  value={form.responseFilter?.field || ''} 
                                  onValueChange={(value) => setForm(prev => ({ 
                                    ...prev, 
                                    responseFilter: { ...prev.responseFilter, field: value } 
                                  }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione campo para filtro quantum" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="p1_objetivo_fitness">p1_objetivo_fitness</SelectItem>
                                    <SelectItem value="p2_nivel_experiencia">p2_nivel_experiencia</SelectItem>
                                    <SelectItem value="p3_disponibilidade">p3_disponibilidade</SelectItem>
                                    <SelectItem value="p4_dor_problema">p4_dor_problema</SelectItem>
                                    <SelectItem value="p5_meta_principal">p5_meta_principal</SelectItem>
                                    <SelectItem value="nome">nome</SelectItem>
                                    <SelectItem value="email">email</SelectItem>
                                    <SelectItem value="telefone">telefone</SelectItem>
                                    <SelectItem value="idade">idade</SelectItem>
                                    <SelectItem value="peso">peso</SelectItem>
                                    <SelectItem value="altura">altura</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label className="flex items-center gap-2">
                                  <Layers className="w-4 h-4 text-purple-600" />
                                  Resposta Ultra-Específica
                                  {loadingResponses && (
                                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                  )}
                                </Label>
                                {form.responseFilter?.field ? (
                                  <Select 
                                    value={form.responseFilter?.value || ''}
                                    onValueChange={(value) => setForm(prev => ({ 
                                      ...prev, 
                                      responseFilter: { ...prev.responseFilter, value } 
                                    }))}
                                    disabled={loadingResponses || uniqueResponses.length === 0}
                                  >
                                    <SelectTrigger className="border-purple-200 focus:ring-purple-500">
                                      <SelectValue placeholder={
                                        loadingResponses 
                                          ? "Carregando respostas..." 
                                          : uniqueResponses.length === 0 
                                            ? "Nenhuma resposta encontrada"
                                            : "Selecione uma resposta específica"
                                      } />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {uniqueResponses.map((response, index) => (
                                        <SelectItem key={index} value={response}>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">"{response}"</span>
                                            <Badge variant="outline" className="text-xs">
                                              Ultra
                                            </Badge>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="p-3 border border-dashed border-purple-300 rounded-lg bg-purple-50">
                                    <p className="text-purple-600 text-sm">
                                      Primeiro selecione um campo para ver as respostas específicas disponíveis
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {form.responseFilter?.field && form.responseFilter?.value && (
                              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="font-medium text-purple-800">Filtro Ultra Configurado</span>
                                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
                                    ULTRA PRECISÃO
                                  </Badge>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-purple-700 text-sm">
                                    <span className="font-medium">Campo:</span> {form.responseFilter.field}
                                  </p>
                                  <p className="text-purple-700 text-sm">
                                    <span className="font-medium">Resposta Ultra-específica:</span> 
                                    <span className="ml-2 px-2 py-1 bg-purple-100 rounded-md font-bold">
                                      "{form.responseFilter.value}"
                                    </span>
                                  </p>
                                  <p className="text-purple-600 text-xs mt-2">
                                    Apenas leads que responderam EXATAMENTE isso serão segmentados
                                  </p>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-xs text-purple-600">
                                  <Zap className="w-3 h-3" />
                                  <span>Sistema Ultra ativo - Segmentação ultra-granular</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Filtros Avançados Tradicionais */}
                      {(isAdvancedType() && !form.type?.includes('quantum')) && (
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
              
              {/* Step 3: Mensagem Quantum */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name">
                      {form.type?.includes('quantum') ? 'Nome da Campanha Quantum' : 'Nome da Campanha'}
                    </Label>
                    <Input 
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={form.type?.includes('quantum') 
                        ? "Ex: Quantum Remarketing - Emagrecer Ultra-Específico" 
                        : "Ex: Remarketing Dor nas Costas"
                      }
                      className={form.type?.includes('quantum') ? 'border-purple-200 focus:ring-purple-500' : ''}
                    />
                  </div>
                  
                  {form.type?.includes('quantum') && (
                    <Alert className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <AlertDescription className="text-purple-800">
                        <strong>Personalização Quantum Ativada!</strong> Use as variáveis ultra-específicas abaixo para criar mensagens com 300% mais engajamento. 
                        O sistema automaticamente personalizará cada mensagem com as respostas exatas do lead.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="message" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        {form.type?.includes('quantum') ? 'Mensagem Quantum Personalizada' : 'Mensagem SMS'}
                        {form.type?.includes('quantum') && <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">ULTRA</Badge>}
                      </Label>
                      <Badge variant={messageCount > 160 ? "destructive" : "outline"}>
                        {messageCount}/160
                      </Badge>
                    </div>
                    <Textarea 
                      id="message"
                      value={form.message}
                      onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder={form.type?.includes('quantum')
                        ? "Oi {{nome}}! Vi que seu objetivo é {{p1_objetivo_fitness}} e sua dor é {{p4_dor_problema}}. Tenho uma solução ultra-específica pra você! 🎯"
                        : "Olá {{nome}}, vimos que você respondeu '{{resposta_dor}}'. Temos algo especial pra você."
                      }
                      className={`min-h-[120px] ${form.type?.includes('quantum') ? 'border-purple-200 focus:ring-purple-500' : ''}`}
                      maxLength={160}
                    />
                  </div>
                  
                  {/* Variáveis Quantum Ultra-Específicas */}
                  {form.type?.includes('quantum') && (
                    <div className="space-y-4">
                      <div className="border-t pt-4">
                        <h4 className="font-medium flex items-center gap-2 mb-3 text-purple-600">
                          <Zap className="w-4 h-4" />
                          Variáveis Quantum Ultra-Específicas
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {[
                            { key: '{{nome}}', desc: 'Nome do lead', color: 'bg-green-100 text-green-800' },
                            { key: '{{p1_objetivo_fitness}}', desc: 'Objetivo específico', color: 'bg-purple-100 text-purple-800' },
                            { key: '{{p4_dor_problema}}', desc: 'Dor/problema exato', color: 'bg-red-100 text-red-800' },
                            { key: '{{p2_nivel_experiencia}}', desc: 'Nível de experiência', color: 'bg-blue-100 text-blue-800' },
                            { key: '{{peso}}', desc: 'Peso atual', color: 'bg-orange-100 text-orange-800' },
                            { key: '{{idade}}', desc: 'Idade', color: 'bg-yellow-100 text-yellow-800' }
                          ].map((variable) => (
                            <Button 
                              key={variable.key}
                              variant="outline" 
                              size="sm"
                              onClick={() => insertVariable(variable.key)}
                              className={`${variable.color} border-0 hover:scale-105 transition-all`}
                            >
                              <div className="text-center">
                                <div className="font-mono text-xs">{variable.key}</div>
                                <div className="text-xs opacity-75">{variable.desc}</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                        <h5 className="font-medium text-purple-800 mb-2">💡 Exemplos de Mensagens Quantum:</h5>
                        <div className="space-y-2 text-sm text-purple-700">
                          <div className="bg-white p-2 rounded border">
                            "Oi {{nome}}! Seu objetivo {{p1_objetivo_fitness}} + problema {{p4_dor_problema}} = solução perfeita que criei! 🎯"
                          </div>
                          <div className="bg-white p-2 rounded border">
                            "{{nome}}, {{peso}}kg → meta {{p1_objetivo_fitness}}? Método específico para {{p4_dor_problema}} pronto!"
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Variáveis Tradicionais para outras campanhas */}
                  {!form.type?.includes('quantum') && (
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
                  )}
                </div>
              )}
              
              {/* Step 4: Agendamento Quantum */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {form.type?.includes('quantum') && (
                    <Alert className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                      <Zap className="h-4 w-4 text-purple-600" />
                      <AlertDescription className="text-purple-800">
                        <strong>Sistema Quantum de Agendamento Ativo!</strong> {' '}
                        {form.type === 'quantum_live' 
                          ? 'Monitoramento automático 24/7 para novos leads com suas características ultra-específicas.'
                          : 'Remarketing inteligente com timing otimizado por padrões comportamentais.'
                        }
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {form.type?.includes('quantum') ? 'Estratégia de Timing Quantum' : 'Quando enviar?'}
                    </Label>
                    <Select 
                      value={form.scheduleType} 
                      onValueChange={(value: 'now' | 'scheduled' | 'delayed') => 
                        setForm(prev => ({ ...prev, scheduleType: value }))}
                    >
                      <SelectTrigger className={form.type?.includes('quantum') ? 'border-purple-200' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="now">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>⚡ Enviar agora{form.type?.includes('quantum') ? ' (Quantum Imediato)' : ''}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="scheduled">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>📅 Agendar data/hora{form.type?.includes('quantum') ? ' (Quantum Programado)' : ''}</span>
                          </div>
                        </SelectItem>
                        {(form.type === 'live' || form.type === 'live_custom' || form.type?.includes('quantum')) && (
                          <SelectItem value="delayed">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span>⏱️ Delay após resposta{form.type?.includes('quantum') ? ' (Quantum Inteligente)' : ''}</span>
                            </div>
                          </SelectItem>
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
                      <Label className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {form.type?.includes('quantum') ? 'Delay Quantum Inteligente' : 'Atraso após resposta'}
                      </Label>
                      <div className="flex gap-2">
                        <Input 
                          type="number"
                          value={form.delayMinutes || ''}
                          onChange={(e) => setForm(prev => ({ ...prev, delayMinutes: Number(e.target.value) }))}
                          placeholder="Ex: 30"
                          className={`flex-1 ${form.type?.includes('quantum') ? 'border-purple-200' : ''}`}
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
                      <div className={`text-sm p-3 rounded-lg ${
                        form.type?.includes('quantum') 
                          ? 'text-purple-700 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200' 
                          : 'text-gray-500 bg-blue-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">
                            {form.type?.includes('quantum') ? 'Sistema Quantum de Timing:' : 'Agendamento:'}
                          </span>
                        </div>
                        <p>
                          Será enviado {form.delayMinutes || 0} {scheduleUnit === 'hours' ? 'horas' : 'minutos'} após o lead responder o quiz
                          {form.type?.includes('quantum') && ' com personalização ultra-específica baseada nas respostas'}
                        </p>
                        {form.type?.includes('quantum') && (
                          <div className="mt-2 flex items-center gap-2 text-purple-600 text-xs">
                            <Zap className="w-3 h-3" />
                            <span>Otimização automática por padrões comportamentais</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Configurações Avançadas Quantum */}
                  {form.type?.includes('quantum') && (
                    <div className="border-t pt-4 space-y-4">
                      <h4 className="font-medium flex items-center gap-2 text-purple-600">
                        <Settings className="w-4 h-4" />
                        Configurações Quantum Avançadas
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-purple-600" />
                            <span className="font-medium text-purple-800">Ultra-Precisão</span>
                          </div>
                          <p className="text-purple-700 text-sm">
                            Apenas leads com características exatas definidas no filtro receberão as mensagens
                          </p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-3 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-blue-800">Análise em Tempo Real</span>
                          </div>
                          <p className="text-blue-700 text-sm">
                            Sistema monitora e otimiza automaticamente baseado no engajamento
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Step 5: Resumo Quantum */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  {form.type?.includes('quantum') && (
                    <Alert className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <AlertDescription className="text-purple-800">
                        <strong>Campanha Quantum Configurada!</strong> Sistema ultra-granular pronto para ativação com personalização máxima e segmentação por respostas específicas.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={form.type?.includes('quantum') ? 'bg-gradient-to-r from-purple-50 to-white p-3 rounded-lg border border-purple-200' : ''}>
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        {form.type?.includes('quantum') && <Zap className="w-4 h-4 text-purple-600" />}
                        Tipo de Campanha
                      </h3>
                      <p className={`text-sm ${form.type?.includes('quantum') ? 'text-purple-800 font-medium' : 'text-gray-600'}`}>
                        {CAMPAIGN_TYPES[form.type as keyof typeof CAMPAIGN_TYPES]?.name}
                        {form.type?.includes('quantum') && <Badge className="ml-2 bg-purple-600 text-white">QUANTUM</Badge>}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Nome da Campanha</h3>
                      <p className="text-sm text-gray-600">{form.name}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Segmentação</h3>
                      <p className="text-sm text-gray-600">
                        {form.segment === 'completed' ? 'Leads que completaram o quiz' : 
                         form.segment === 'abandoned' ? 'Leads que abandonaram o quiz' : 'Todos os leads do quiz'}
                      </p>
                      {form.type?.includes('quantum') && form.responseFilter?.field && form.responseFilter?.value && (
                        <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
                          <p className="text-xs text-purple-700">
                            <strong>Filtro Quantum:</strong> {form.responseFilter.field} = "{form.responseFilter.value}"
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Timing</h3>
                      <p className="text-sm text-gray-600">
                        {form.scheduleType === 'now' ? (form.type?.includes('quantum') ? 'Quantum Imediato' : 'Enviar agora') : 
                         form.scheduleType === 'scheduled' ? `${form.scheduledDate} às ${form.scheduledTime}` :
                         `${form.delayMinutes} ${scheduleUnit === 'hours' ? 'horas' : 'minutos'} após resposta`}
                      </p>
                      {form.type?.includes('quantum') && (
                        <div className="mt-1 text-xs text-purple-600 flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          <span>Com otimização comportamental automática</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      {form.type?.includes('quantum') ? 'Mensagem Quantum Personalizada' : 'Mensagem'}
                    </h3>
                    <div className={`p-4 rounded-lg border ${
                      form.type?.includes('quantum') 
                        ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200' 
                        : 'bg-gray-50'
                    }`}>
                      <p className={`text-sm ${form.type?.includes('quantum') ? 'text-purple-800' : 'text-gray-800'}`}>
                        {form.message}
                      </p>
                      {form.type?.includes('quantum') && (
                        <div className="mt-3 flex items-center gap-2 text-purple-600 text-xs">
                          <Sparkles className="w-3 h-3" />
                          <span>Variáveis será substituídas automaticamente com dados ultra-específicos de cada lead</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {form.type?.includes('quantum') && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-purple-600 mb-3">🚀 Recursos Quantum Ativados:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <div className="text-green-800 font-medium text-sm">✓ Ultra-Segmentação</div>
                          <div className="text-green-600 text-xs">Filtros por resposta específica</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <div className="text-blue-800 font-medium text-sm">✓ Personalização Max</div>
                          <div className="text-blue-600 text-xs">Variáveis ultra-específicas</div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <div className="text-purple-800 font-medium text-sm">✓ IA Comportamental</div>
                          <div className="text-purple-600 text-xs">Otimização automática</div>
                        </div>
                      </div>
                    </div>
                  )}
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