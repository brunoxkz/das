import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth-jwt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Clock, Users, Target, Upload, FileText, Eye, ArrowRight, CheckCircle, AlertCircle, Calendar, Zap, Crown, Package, Brain, Flame, FolderOpen } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  
  // Queries
  const { data: quizzes = [], isLoading: loadingQuizzes } = useQuery({
    queryKey: ['/api/quizzes'],
    enabled: !!user
  });
  
  const { data: credits = { remaining: 0 } } = useQuery({
    queryKey: ['/api/sms-credits'],
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
      const response = await fetch('/api/sms-campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(form)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao criar campanha');
      }
      
      toast({
        title: "Campanha criada com sucesso!",
        description: "Sua campanha SMS foi criada e está sendo processada.",
      });
      
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
      
    } catch (error) {
      toast({
        title: "Erro ao criar campanha",
        description: "Verifique os dados e tente novamente.",
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
                {currentStep === 1 && "Selecione o Tipo de Campanha"}
                {currentStep === 2 && "Segmentação de Leads"}
                {currentStep === 3 && "Criação da Mensagem"}
                {currentStep === 4 && "Agendamento"}
                {currentStep === 5 && "Resumo da Campanha"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Step 1: Tipo de Campanha */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.values(CAMPAIGN_TYPES).map((type) => {
                      const Icon = type.icon;
                      return (
                        <Card 
                          key={type.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            form.type === type.id ? 'ring-2 ring-green-500 bg-green-50' : ''
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
                            <SelectItem value="completed">✅ Completou o quiz</SelectItem>
                            <SelectItem value="abandoned">❌ Abandonou o quiz</SelectItem>
                            <SelectItem value="all">👥 Todos os leads</SelectItem>
                          </SelectContent>
                        </Select>
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
                    <div>
                      <Label>Atraso (minutos)</Label>
                      <Input 
                        type="number"
                        value={form.delayMinutes || ''}
                        onChange={(e) => setForm(prev => ({ ...prev, delayMinutes: Number(e.target.value) }))}
                        placeholder="Ex: 30"
                      />
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
    </div>
  );
}