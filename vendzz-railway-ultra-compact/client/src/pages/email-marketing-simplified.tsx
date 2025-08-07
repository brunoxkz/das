import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth-jwt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, Clock, Users, Target, Upload, FileText, Eye, ArrowRight, CheckCircle, AlertCircle, Calendar, Zap, Crown, Package, Brain, Flame, FolderOpen, Play, Pause, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EmailCampaignModal from "@/components/EmailCampaignModal";

// Tipos de campanha de email seguindo o padrão do SMS
const EMAIL_CAMPAIGN_TYPES = {
  remarketing: {
    id: 'remarketing',
    name: 'Remarketing',
    icon: Package,
    description: 'Envie emails para quem já respondeu ou abandonou o quiz',
    color: 'bg-blue-500'
  },
  remarketing_custom: {
    id: 'remarketing_custom',
    name: 'Remarketing Avançado',
    icon: Brain,
    description: 'Envie emails ultra segmentados (idade, gênero, respostas)',
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
    description: 'Suba um CSV e envie emails em lote com variáveis simples',
    color: 'bg-gray-500'
  }
};

interface Quiz {
  id: string;
  title: string;
  published: boolean;
  responses: number;
}

interface EmailCampaignForm {
  type: string;
  name: string;
  funnelId: string;
  segment: 'completed' | 'abandoned' | 'all';
  subject: string;
  message: string;
  scheduleType: 'now' | 'scheduled' | 'delayed';
  scheduledDate?: string;
  scheduledTime?: string;
  delayMinutes?: number;
  csvFile?: File;
  csvData?: any[];
}

export default function EmailMarketingSimplified() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados do formulário
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<EmailCampaignForm>({
    type: '',
    name: '',
    funnelId: '',
    segment: 'all',
    subject: '',
    message: '',
    scheduleType: 'now'
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [scheduleUnit, setScheduleUnit] = useState<'minutes' | 'hours'>('minutes');
  const [previewMessage, setPreviewMessage] = useState('');
  
  // Queries
  const { data: quizzes = [], isLoading: loadingQuizzes } = useQuery({
    queryKey: ['/api/quizzes'],
    enabled: !!user
  });
  
  const { data: emailCredits = { remaining: 0 } } = useQuery({
    queryKey: ['/api/email-credits'],
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
    queryKey: ['/api/email-campaigns'],
    enabled: !!user
  });

  // Mutations para gerenciar campanhas
  const toggleCampaignMutation = useMutation({
    mutationFn: async ({ campaignId, action }: { campaignId: string; action: 'play' | 'pause' }) => {
      const response = await fetch(`/api/email-campaigns/${campaignId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Erro ao alterar status da campanha');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da campanha",
        variant: "destructive"
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
      if (!response.ok) {
        throw new Error('Erro ao deletar campanha');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
      toast({
        title: "Sucesso",
        description: "Campanha deletada com sucesso"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível deletar a campanha",
        variant: "destructive"
      });
    }
  });
  
  // Variáveis disponíveis para personalização
  const availableVariables = [
    { key: '{{nome}}', description: 'Nome do lead' },
    { key: '{{email}}', description: 'Email do lead' },
    { key: '{{telefone}}', description: 'Telefone do lead' },
    { key: '{{resposta_dor}}', description: 'Resposta sobre dor/problema' },
    { key: '{{idade}}', description: 'Idade do lead' },
    { key: '{{genero}}', description: 'Gênero do lead' }
  ];
  
  // Efeitos
  useEffect(() => {
    generatePreview();
  }, [form.subject, form.message]);
  
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
      '{{email}}': 'joao@email.com',
      '{{telefone}}': '(11) 99999-9999',
      '{{resposta_dor}}': 'dor nas costas',
      '{{idade}}': '35 anos',
      '{{genero}}': 'masculino'
    };
    return examples[key] || key;
  };
  
  const insertVariable = (variable: string) => {
    setForm(prev => ({
      ...prev,
      message: prev.message + variable
    }));
  };
  
  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return form.type;
      case 2: return form.type === 'mass' ? form.csvFile : form.funnelId;
      case 3: return form.subject.trim() && form.message.trim();
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

      if (emailCredits.remaining <= 0) {
        toast({
          title: "Créditos insuficientes",
          description: "Você não possui créditos de email suficientes para criar esta campanha.",
          variant: "destructive"
        });
        setIsCreating(false);
        return;
      }

      const response = await fetch('/api/email-campaigns', {
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
        description: "Sua campanha de email foi criada e está sendo processada.",
      });
      
      // Atualizar queries
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
      
      // Reset form
      setForm({
        type: '',
        name: '',
        funnelId: '',
        segment: 'all',
        subject: '',
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
  
  // Componente para exibir logs da campanha
  const EmailCampaignLogs = ({ campaignId }: { campaignId: string }) => {
    const { data: logs = [], isLoading } = useQuery({
      queryKey: ['/api/email-campaigns', campaignId, 'logs'],
      enabled: !!campaignId
    });

    if (isLoading) {
      return <div className="animate-pulse">Carregando logs...</div>;
    }

    return (
      <div className="max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-gray-500">Nenhum log encontrado</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log: any, index: number) => (
              <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{log.recipientEmail}</p>
                    <p className="text-gray-600">{log.message}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      log.status === 'sent' ? 'bg-green-100 text-green-800' :
                      log.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {log.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {log.timestamp ? format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Criar Campanha de Email</h1>
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
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Créditos de Email Disponíveis</span>
            </div>
            <Badge variant="outline" className="bg-white">
              {emailCredits.remaining} créditos
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
                {currentStep === 1 && "Selecione o Tipo de Campanha"}
                {currentStep === 2 && "Segmentação de Leads"}
                {currentStep === 3 && "Criação do Email"}
                {currentStep === 4 && "Agendamento"}
                {currentStep === 5 && "Resumo da Campanha"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Step 1: Tipo de Campanha */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">Escolha o Tipo de Campanha</h3>
                    <p className="text-gray-600">Selecione o tipo de campanha que deseja criar. Cada tipo abrirá um assistente personalizado.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.values(EMAIL_CAMPAIGN_TYPES).map((type) => {
                      const Icon = type.icon;
                      return (
                        <EmailCampaignModal
                          key={type.id}
                          onCampaignCreated={() => {
                            queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
                            toast({
                              title: "Campanha Criada",
                              description: "Sua campanha foi criada com sucesso!",
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
                        </EmailCampaignModal>
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
                        <Label htmlFor="funnel">Quiz/Funil</Label>
                        <Select 
                          value={form.funnelId} 
                          onValueChange={(value) => setForm(prev => ({ ...prev, funnelId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um quiz" />
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
                        <Label htmlFor="segment">Segmento</Label>
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
                              ✅ Completou o quiz 
                              {leadsBySegment && (
                                <Badge variant="secondary" className="ml-2">
                                  {leadsBySegment.counts.completed} leads
                                </Badge>
                              )}
                            </SelectItem>
                            <SelectItem value="abandoned">
                              ❌ Abandonou o quiz
                              {leadsBySegment && (
                                <Badge variant="secondary" className="ml-2">
                                  {leadsBySegment.counts.abandoned} leads
                                </Badge>
                              )}
                            </SelectItem>
                            <SelectItem value="all">
                              👥 Todos os leads
                              {leadsBySegment && (
                                <Badge variant="secondary" className="ml-2">
                                  {leadsBySegment.counts.all} leads
                                </Badge>
                              )}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <div>
                      <Label htmlFor="csv-upload">Upload CSV</Label>
                      <Input 
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setForm(prev => ({ ...prev, csvFile: file }));
                          }
                        }}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Arquivo CSV com colunas: nome, email, telefone
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Step 3: Criação do Email */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Assunto do Email</Label>
                    <Input 
                      id="subject"
                      placeholder="Ex: Oferta especial para {{nome}}"
                      value={form.subject}
                      onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Mensagem do Email</Label>
                    <Textarea 
                      id="message"
                      placeholder="Digite sua mensagem aqui..."
                      value={form.message}
                      onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                      className="min-h-32"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Variáveis Disponíveis</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {availableVariables.map((variable) => (
                        <Button
                          key={variable.key}
                          variant="outline"
                          size="sm"
                          onClick={() => insertVariable(variable.key)}
                          className="text-xs"
                        >
                          {variable.key}
                        </Button>
                      ))}
                    </div>
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
                        {EMAIL_CAMPAIGN_TYPES[form.type as keyof typeof EMAIL_CAMPAIGN_TYPES]?.name}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Nome</h3>
                      <p className="text-sm text-gray-600">{form.name}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Assunto</h3>
                      <p className="text-sm text-gray-600">{form.subject}</p>
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
                    className="bg-blue-600 hover:bg-blue-700"
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
          {/* Preview do Email */}
          {form.subject && form.message && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Email Preview</span>
                  </div>
                  <div className="border-b border-blue-200 pb-2 mb-2">
                    <p className="text-sm font-medium">{form.subject}</p>
                  </div>
                  <p className="text-sm text-gray-700">{previewMessage}</p>
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
                  <p>Assuntos personalizados têm 50% mais abertura</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Emails responsivos têm melhor engajamento</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Teste sempre antes de enviar em massa</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Campanhas segmentadas têm melhor ROI</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Campanhas Existentes */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Campanhas de Email Criadas
            </CardTitle>
            <CardDescription>
              Gerencie suas campanhas de email marketing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCampaigns ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma campanha criada ainda</p>
                <p className="text-sm text-gray-400 mt-2">
                  Crie sua primeira campanha de email usando o formulário acima
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign: any) => (
                  <div key={campaign.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-blue-600" />
                            <h3 className="font-medium">{campaign.name}</h3>
                          </div>
                          <Badge 
                            variant={campaign.status === 'active' ? 'default' : 
                                   campaign.status === 'paused' ? 'secondary' : 'outline'}
                            className={campaign.status === 'active' ? 'bg-green-100 text-green-800' : 
                                     campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 
                                     'bg-gray-100 text-gray-800'}
                          >
                            {campaign.status === 'active' ? 'Ativo' : 
                             campaign.status === 'paused' ? 'Pausado' : 'Inativo'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Assunto</p>
                            <p className="font-medium truncate">{campaign.subject}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Quiz</p>
                            <p className="font-medium truncate">{campaign.quizTitle || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Enviados</p>
                            <p className="font-medium">{campaign.sent || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Taxa de Abertura</p>
                            <p className="font-medium">
                              {campaign.sent > 0 ? Math.round(((campaign.opened || 0) / campaign.sent) * 100) : 0}%
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-2">
                          <div>
                            <p className="text-gray-500">Tipo</p>
                            <p className="font-medium capitalize">
                              {EMAIL_CAMPAIGN_TYPES[campaign.campaignType as keyof typeof EMAIL_CAMPAIGN_TYPES]?.name || 'Standard'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Abertos</p>
                            <p className="font-medium">{campaign.opened || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Cliques</p>
                            <p className="font-medium">{campaign.clicked || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Criado em</p>
                            <p className="font-medium">
                              {campaign.createdAt ? format(new Date(campaign.createdAt), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {/* Botão Play/Pause */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const action = campaign.status === 'active' ? 'pause' : 'play';
                            toggleCampaignMutation.mutate({ campaignId: campaign.id, action });
                            toast({
                              title: campaign.status === 'active' ? 'Campanha pausada' : 'Campanha ativada',
                              description: `Campanha ${campaign.name} foi ${campaign.status === 'active' ? 'pausada' : 'ativada'}.`
                            });
                          }}
                          disabled={toggleCampaignMutation.isPending}
                          className={campaign.status === 'active' ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {toggleCampaignMutation.isPending ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-1" />
                          ) : campaign.status === 'active' ? (
                            <>
                              <Pause className="w-4 h-4 mr-1" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-1" />
                              Iniciar
                            </>
                          )}
                        </Button>
                        
                        {/* Botão Analytics */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            toast({
                              title: "Analytics",
                              description: "Abrindo analytics da campanha..."
                            });
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Analytics
                        </Button>
                        
                        {/* Botão Logs */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-purple-600 hover:text-purple-700"
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Logs
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Logs da Campanha: {campaign.name}</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                              <EmailCampaignLogs campaignId={campaign.id} />
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {/* Botão Deletar */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('Tem certeza que deseja deletar esta campanha?')) {
                              deleteCampaignMutation.mutate(campaign.id);
                            }
                          }}
                          disabled={deleteCampaignMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          {deleteCampaignMutation.isPending ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin mr-1" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-1" />
                          )}
                          Deletar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}