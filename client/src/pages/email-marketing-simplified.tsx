import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth-jwt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, Clock, Users, Target, Upload, FileText, Eye, ArrowRight, CheckCircle, AlertCircle, Calendar, Zap, Crown, Package, Brain, Flame, FolderOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.values(EMAIL_CAMPAIGN_TYPES).map((type) => {
                      const Icon = type.icon;
                      return (
                        <Card 
                          key={type.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            form.type === type.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                          }`}
                          onClick={() => setForm(prev => ({ ...prev, type: type.id }))}
                        >
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
                      );
                    })}
                  </div>
                  
                  {form.type && (
                    <div className="mt-4">
                      <Label htmlFor="campaign-name">Nome da Campanha</Label>
                      <Input 
                        id="campaign-name"
                        placeholder="Ex: Remarketing Quiz Emagrecimento"
                        value={form.name}
                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                  )}
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
              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Voltar
                </Button>
                
                <div className="flex gap-2">
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
    </div>
  );
}