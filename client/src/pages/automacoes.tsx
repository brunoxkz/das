import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Package, 
  Brain, 
  Zap, 
  Flame, 
  Folder, 
  Target, 
  Clock,
  Upload,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Users,
  Filter,
  Send,
  FileText,
  Eye,
  Settings,
  CreditCard,
  MessageCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth-jwt';

// Tipos para o formulário
interface CampaignData {
  channel: 'SMS' | 'WhatsApp' | 'Email';
  type: 'remarketing' | 'super_personalizado' | 'ao_vivo' | 'ao_vivo_super' | 'disparo_massa';
  quizId: string;
  segmentation: {
    completed: boolean;
    abandoned: boolean;
    all: boolean;
  };
  filters: {
    minAge?: number;
    maxAge?: number;
    gender?: string;
    customResponse?: string;
  };
  message: string;
  subject?: string;
  mediaUrl?: string;
  scheduling: {
    type: 'immediate' | 'scheduled' | 'delay';
    scheduledDate?: string;
    delayMinutes?: number;
  };
  csvData?: string;
}

const CAMPAIGN_TYPES = [
  {
    id: 'remarketing',
    icon: Package,
    title: 'Remarketing',
    description: 'Reengaja leads antigos que já interagiram com seus quizzes',
    color: 'bg-blue-500',
    badge: 'LEADS ANTIGOS'
  },
  {
    id: 'super_personalizado',
    icon: Brain,
    title: 'Super Personalizado',
    description: 'Mensagens únicas baseadas em respostas específicas do quiz',
    color: 'bg-purple-500',
    badge: 'IA AVANÇADA'
  },
  {
    id: 'ao_vivo',
    icon: Zap,
    title: 'Ao Vivo',
    description: 'Disparo automático para leads que completam ou abandonam o quiz',
    color: 'bg-green-500',
    badge: 'TEMPO REAL'
  },
  {
    id: 'ao_vivo_super',
    icon: Flame,
    title: 'Ao Vivo Super',
    description: 'Automação avançada com filtros e segmentação em tempo real',
    color: 'bg-orange-500',
    badge: 'PREMIUM'
  },
  {
    id: 'disparo_massa',
    icon: Folder,
    title: 'Disparo em Massa',
    description: 'Envio para lista personalizada via upload de CSV',
    color: 'bg-red-500',
    badge: 'BULK'
  }
];

export default function Automacoes() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<CampaignData>({
    channel: 'SMS',
    type: 'remarketing',
    quizId: '',
    segmentation: { completed: false, abandoned: false, all: true },
    filters: {},
    message: '',
    scheduling: { type: 'immediate' },
    csvData: ''
  });

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Buscar quizzes do usuário
  const { data: quizzes = [], isLoading: quizzesLoading } = useQuery({
    queryKey: ['/api/quizzes'],
    enabled: !!user
  });

  // Buscar créditos do usuário
  const { data: credits = { sms: 0, email: 0, whatsapp: 0 }, isLoading: creditsLoading } = useQuery({
    queryKey: ['/api/user/credits'],
    enabled: !!user
  });

  // Função para processar CSV
  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Erro no arquivo",
        description: "Por favor, selecione um arquivo CSV válido",
        variant: "destructive"
      });
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n').filter(line => line.trim());
      setCsvPreview(lines.slice(0, 5)); // Mostrar apenas 5 primeiras linhas
      setFormData(prev => ({ ...prev, csvData: csv }));
    };
    reader.readAsText(file);
  };

  // Função para criar campanha
  const createCampaign = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    // Validar créditos
    const requiredCredits = formData.type === 'disparo_massa' ? csvPreview.length : 1;
    const userCredits = credits[formData.channel.toLowerCase() as keyof typeof credits];
    
    if (userCredits < requiredCredits) {
      toast({
        title: "Créditos insuficientes",
        description: `Você precisa de ${requiredCredits} créditos de ${formData.channel} para criar esta campanha`,
        variant: "destructive"
      });
      return;
    }

    // Validações básicas
    if (!formData.message.trim()) {
      toast({
        title: "Erro",
        description: "Mensagem é obrigatória",
        variant: "destructive"
      });
      return;
    }

    if (formData.type !== 'disparo_massa' && !formData.quizId) {
      toast({
        title: "Erro",
        description: "Selecione um quiz para a campanha",
        variant: "destructive"
      });
      return;
    }

    if (formData.type === 'disparo_massa' && !formData.csvData) {
      toast({
        title: "Erro",
        description: "Upload do arquivo CSV é obrigatório para disparo em massa",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      let endpoint = '';
      
      switch (formData.channel) {
        case 'SMS':
          endpoint = '/api/sms-campaigns';
          break;
        case 'Email':
          endpoint = '/api/email-campaigns';
          break;
        case 'WhatsApp':
          endpoint = '/api/whatsapp-campaigns';
          break;
      }

      const response = await apiRequest('POST', endpoint, {
        ...formData,
        userId: user.id
      });

      if (response.ok) {
        toast({
          title: "Campanha criada com sucesso!",
          description: `Sua campanha de ${formData.channel} foi criada e está ativa`,
        });
        
        // Reset form
        setFormData({
          channel: 'SMS',
          type: 'remarketing',
          quizId: '',
          segmentation: { completed: false, abandoned: false, all: true },
          filters: {},
          message: '',
          scheduling: { type: 'immediate' },
          csvData: ''
        });
        setCsvFile(null);
        setCsvPreview([]);
      } else {
        throw new Error('Erro ao criar campanha');
      }
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a campanha. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Função para comprar créditos
  const buyCredits = (channel: string) => {
    toast({
      title: "Redirecionando",
      description: `Redirecionando para compra de créditos de ${channel}...`,
    });
    // Aqui você pode implementar a navegação para página de compra
  };

  // Função para obter contador de caracteres
  const getCharacterCount = () => {
    if (formData.channel === 'SMS') {
      return `${formData.message.length}/160`;
    }
    return null;
  };

  // Função para obter variáveis disponíveis
  const getAvailableVariables = () => {
    const baseVars = ['{{nome}}', '{{telefone}}', '{{email}}'];
    if (formData.quizId) {
      baseVars.push('{{resposta_1}}', '{{resposta_2}}', '{{quiz_titulo}}');
    }
    return baseVars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Automações
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Crie campanhas inteligentes para engajar seus leads automaticamente
            </p>
          </div>

          {/* Cards de Créditos */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-200 dark:border-blue-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <MessageSquare className="w-5 h-5" />
                  SMS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{credits.sms}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => buyCredits('SMS')}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <CreditCard className="w-4 h-4 mr-1" />
                    Comprar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-green-200 dark:border-green-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{credits.whatsapp}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => buyCredits('WhatsApp')}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <CreditCard className="w-4 h-4 mr-1" />
                    Comprar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <Mail className="w-5 h-5" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{credits.email}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => buyCredits('Email')}
                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                  >
                    <CreditCard className="w-4 h-4 mr-1" />
                    Comprar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulário Principal */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6" />
                Nova Campanha
              </CardTitle>
              <CardDescription>
                Configure sua campanha de automação personalizada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Seleção do Canal */}
              <div>
                <Label className="text-lg font-semibold mb-4 block">Canal de Envio</Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'SMS', icon: MessageSquare, color: 'blue' },
                    { id: 'WhatsApp', icon: MessageCircle, color: 'green' },
                    { id: 'Email', icon: Mail, color: 'purple' }
                  ].map((channel) => (
                    <Button
                      key={channel.id}
                      variant={formData.channel === channel.id ? "default" : "outline"}
                      className={`h-16 flex-col gap-2 ${
                        formData.channel === channel.id 
                          ? `bg-${channel.color}-500 hover:bg-${channel.color}-600` 
                          : `border-${channel.color}-200 hover:bg-${channel.color}-50`
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, channel: channel.id as any }))}
                    >
                      <channel.icon className="w-6 h-6" />
                      {channel.id}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Tipo de Campanha */}
              <div>
                <Label className="text-lg font-semibold mb-4 block">Tipo de Campanha</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CAMPAIGN_TYPES.map((type) => (
                    <Card
                      key={type.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        formData.type === type.id 
                          ? 'ring-2 ring-blue-500 shadow-lg' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, type: type.id as any }))}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${type.color} text-white`}>
                            <type.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-sm">{type.title}</CardTitle>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {type.badge}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {type.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Seleção do Quiz (exceto para disparo em massa) */}
              {formData.type !== 'disparo_massa' && (
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Quiz Alvo</Label>
                  <Select 
                    value={formData.quizId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, quizId: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um quiz" />
                    </SelectTrigger>
                    <SelectContent>
                      {quizzes.map((quiz: any) => (
                        <SelectItem key={quiz.id} value={quiz.id}>
                          {quiz.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Segmentação de Leads */}
              {formData.type !== 'disparo_massa' && (
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Segmentação de Leads</Label>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="completed"
                        checked={formData.segmentation.completed}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ 
                            ...prev, 
                            segmentation: { ...prev.segmentation, completed: checked as boolean }
                          }))
                        }
                      />
                      <Label htmlFor="completed">Completou o quiz</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="abandoned"
                        checked={formData.segmentation.abandoned}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ 
                            ...prev, 
                            segmentation: { ...prev.segmentation, abandoned: checked as boolean }
                          }))
                        }
                      />
                      <Label htmlFor="abandoned">Abandonou o quiz</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="all"
                        checked={formData.segmentation.all}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ 
                            ...prev, 
                            segmentation: { ...prev.segmentation, all: checked as boolean }
                          }))
                        }
                      />
                      <Label htmlFor="all">Todos os leads</Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Filtros Avançados */}
              {(formData.type === 'super_personalizado' || formData.type === 'ao_vivo_super') && (
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Filtros Avançados</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minAge">Idade Mínima</Label>
                      <Input
                        id="minAge"
                        type="number"
                        value={formData.filters.minAge || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          filters: { ...prev.filters, minAge: Number(e.target.value) || undefined }
                        }))}
                        placeholder="Ex: 18"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxAge">Idade Máxima</Label>
                      <Input
                        id="maxAge"
                        type="number"
                        value={formData.filters.maxAge || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          filters: { ...prev.filters, maxAge: Number(e.target.value) || undefined }
                        }))}
                        placeholder="Ex: 65"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Upload CSV para Disparo em Massa */}
              {formData.type === 'disparo_massa' && (
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Upload de Lista</Label>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600 mb-2">
                        Faça upload do arquivo CSV com campos: nome, telefone, email
                      </p>
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={handleCsvUpload}
                        className="max-w-xs mx-auto"
                      />
                    </div>
                    
                    {csvPreview.length > 0 && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium mb-2 block">Preview do arquivo:</Label>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
                          {csvPreview.map((line, index) => (
                            <div key={index} className="font-mono text-xs mb-1">
                              {line}
                            </div>
                          ))}
                          {csvPreview.length >= 5 && (
                            <p className="text-gray-500 text-xs mt-2">
                              ... e mais {csvFile ? Math.max(0, csvFile.size / 50 - 5) : 0} linhas
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              {/* Mensagem */}
              <div>
                <Label className="text-lg font-semibold mb-4 block">Mensagem</Label>
                
                {/* Campo de Assunto para Email */}
                {formData.channel === 'Email' && (
                  <div className="mb-4">
                    <Label htmlFor="subject">Assunto</Label>
                    <Input
                      id="subject"
                      value={formData.subject || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Digite o assunto do email"
                    />
                  </div>
                )}

                {/* Campo de Mensagem */}
                <div className="space-y-2">
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder={`Digite sua mensagem para ${formData.channel}...`}
                    rows={6}
                    className="resize-none"
                  />
                  
                  {/* Contador de caracteres para SMS */}
                  {formData.channel === 'SMS' && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {getCharacterCount()}
                      </span>
                      {formData.message.length > 160 && (
                        <Badge variant="destructive" className="text-xs">
                          Excedeu limite SMS
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Variáveis Disponíveis */}
                <div className="mt-4">
                  <Label className="text-sm font-medium mb-2 block">Variáveis disponíveis:</Label>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableVariables().map((variable) => (
                      <Badge 
                        key={variable} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-gray-200"
                        onClick={() => setFormData(prev => ({ ...prev, message: prev.message + variable }))}
                      >
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* URL de Mídia para WhatsApp */}
                {formData.channel === 'WhatsApp' && (
                  <div className="mt-4">
                    <Label htmlFor="mediaUrl">URL da Mídia (opcional)</Label>
                    <Input
                      id="mediaUrl"
                      value={formData.mediaUrl || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, mediaUrl: e.target.value }))}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Agendamento */}
              <div>
                <Label className="text-lg font-semibold mb-4 block">Agendamento</Label>
                <Tabs 
                  value={formData.scheduling.type} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    scheduling: { ...prev.scheduling, type: value as any }
                  }))}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="immediate">Imediato</TabsTrigger>
                    <TabsTrigger value="scheduled">Agendar</TabsTrigger>
                    <TabsTrigger value="delay">Delay</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="immediate" className="mt-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        A campanha será enviada imediatamente após criação
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                  
                  <TabsContent value="scheduled" className="mt-4">
                    <div>
                      <Label htmlFor="scheduledDate">Data e Hora</Label>
                      <Input
                        id="scheduledDate"
                        type="datetime-local"
                        value={formData.scheduling.scheduledDate || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          scheduling: { ...prev.scheduling, scheduledDate: e.target.value }
                        }))}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="delay" className="mt-4">
                    <div>
                      <Label htmlFor="delayMinutes">Delay em minutos</Label>
                      <Input
                        id="delayMinutes"
                        type="number"
                        value={formData.scheduling.delayMinutes || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          scheduling: { ...prev.scheduling, delayMinutes: Number(e.target.value) }
                        }))}
                        placeholder="Ex: 30"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Aviso para campanhas ao vivo */}
                {(formData.type === 'ao_vivo' || formData.type === 'ao_vivo_super') && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Campanhas "Ao Vivo" são enviadas automaticamente para novos leads que interagirem com o quiz
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Separator />

              {/* Botão de Criar Campanha */}
              <div className="flex justify-end">
                <Button
                  onClick={createCampaign}
                  disabled={isCreating || !formData.message.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg"
                >
                  {isCreating ? (
                    <>
                      <Settings className="w-5 h-5 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Criar Campanha
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}