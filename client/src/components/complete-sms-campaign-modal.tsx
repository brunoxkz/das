import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Zap, 
  Crown, 
  Users, 
  Target, 
  Sparkles,
  ArrowRight,
  CheckCircle,
  Info,
  RefreshCw,
  MessageSquare,
  Send,
  Settings,
  FileQuestion,
  Eye,
  Upload,
  FileText
} from 'lucide-react';

export type CampaignStyle = 'remarketing' | 'remarketing_ultra_customizado' | 'ao_vivo_tempo_real' | 'ao_vivo_ultra_customizada' | 'disparo_massa';

interface CompleteSMSCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onCreateCampaign: (campaignData: any) => void;
  quizzes: any[];
  isCreating: boolean;
  selectedStyle?: CampaignStyle;
}

const campaignStyles = {
  remarketing: {
    id: 'remarketing' as CampaignStyle,
    title: 'REMARKETING',
    subtitle: 'Leads "mortos" viram VENDAS!',
    description: 'Selecione entre leads antigos que abandonaram ou completaram o quiz e datas',
    icon: RefreshCw,
    color: 'bg-gradient-to-br from-orange-500 to-red-600',
    features: [
      'Reative leads antigos automaticamente',
      'Escolha abandonados ou completos',
      'Custo R$ 0,00 - leads gratuitos',
      'Máquina de vendas 24h automática'
    ],
    badge: 'GRATUITO',
    badgeColor: 'bg-orange-500'
  },
  remarketing_ultra_customizado: {
    id: 'remarketing_ultra_customizado' as CampaignStyle,
    title: 'REMARKETING ULTRA CUSTOMIZADO',
    subtitle: 'Segredo dos TOP AFILIADOS!',
    description: 'Selecione entre leads antigos que abandonaram ou completaram o quiz e datas, mas que também dispare funis diferentes para cada faixa de idade, peso, altura, ou como preferir, isso aumenta muito a conversão!',
    icon: Crown,
    color: 'bg-gradient-to-br from-purple-500 to-pink-600',
    features: [
      'Mensagens diferentes para CADA perfil',
      'Jovens 18-25 vs pessoas 40+',
      'Funis únicos por idade/peso/altura',
      '+40% conversão garantida'
    ],
    badge: 'TOP VENDAS',
    badgeColor: 'bg-purple-500'
  },
  ao_vivo_tempo_real: {
    id: 'ao_vivo_tempo_real' as CampaignStyle,
    title: 'AO VIVO (TEMPO REAL)',
    subtitle: 'Pegue o lead no momento QUENTE!',
    description: 'Mensagens personalizadas para pessoas que abandonaram ou completaram o quiz, escolha quanto tempo após a ação vai disparar a mensagem personalizada desejada',
    icon: Zap,
    color: 'bg-gradient-to-br from-green-500 to-blue-600',
    features: [
      'Automático e IMEDIATO!',
      'Abandona = SMS em 5 minutos',
      'Vendedor que NUNCA dorme',
      '+85% taxa de resposta'
    ],
    badge: 'IMEDIATO',
    badgeColor: 'bg-green-500'
  },
  ao_vivo_ultra_customizada: {
    id: 'ao_vivo_ultra_customizada' as CampaignStyle,
    title: 'AO VIVO ULTRA CUSTOMIZADA',
    subtitle: 'Nível MÁXIMO de vendas!',
    description: 'Mensagens personalizadas por perfil disparadas em tempo real',
    icon: Crown,
    color: 'bg-gradient-to-br from-red-500 to-pink-600',
    features: [
      'Mensagens por perfil em tempo real',
      'Atleta = "Nutrição performance"',
      'Sedentário = "Vamos começar"',
      'Conversão MÁXIMA garantida'
    ],
    badge: 'MÁXIMO',
    badgeColor: 'bg-red-500'
  },
  disparo_massa: {
    id: 'disparo_massa' as CampaignStyle,
    title: 'DISPARO EM MASSA',
    subtitle: 'Sua própria lista de contatos!',
    description: 'Importe sua lista de telefones/emails e dispare mensagens personalizadas em massa',
    icon: Upload,
    color: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    features: [
      'Importe arquivo CSV/TXT com contatos',
      'Disparo simultâneo para milhares',
      'Personalização por nome/dados',
      'Controle total da sua lista'
    ],
    badge: 'MASSA',
    badgeColor: 'bg-indigo-500'
  }
};

export function CompleteSMSCampaignModal({
  open,
  onClose,
  onCreateCampaign,
  quizzes,
  isCreating,
  selectedStyle: initialSelectedStyle
}: CompleteSMSCampaignModalProps) {
  const [selectedStyle, setSelectedStyle] = useState<CampaignStyle | null>(initialSelectedStyle || null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    message: '',
    quizId: '',
    targetAudience: 'completed' as 'completed' | 'abandoned' | 'all',
    triggerType: 'immediate' as 'immediate' | 'delayed' | 'scheduled',
    triggerDelay: 1,
    triggerUnit: 'hours' as 'hours' | 'minutes',
    contactsFile: null as File | null,
    contactsList: [] as Array<{phone?: string, email?: string, name?: string}>
  });

  const handleStyleSelect = (style: CampaignStyle) => {
    setSelectedStyle(style);
    setCurrentStep('config');
    
    // Auto-preencher nome baseado no estilo
    const styleData = campaignStyles[style];
    setCampaignForm(prev => ({
      ...prev,
      name: `[${styleData.title}] `
    }));
  };

  const handleBackToStyles = () => {
    setCurrentStep('style');
    setSelectedStyle(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCampaignForm(prev => ({ ...prev, contactsFile: file }));

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      const contacts = lines.map(line => {
        const parts = line.split(',').map(part => part.trim());
        return {
          phone: parts[0] || '',
          name: parts[1] || '',
          email: parts[2] || ''
        };
      }).filter(contact => contact.phone);

      setCampaignForm(prev => ({ ...prev, contactsList: contacts }));
    };
    reader.readAsText(file);
  };

  const handleCreateCampaign = () => {
    if (!selectedStyle || !campaignForm.message) return;
    
    // Para disparo em massa, não precisa de quiz, mas precisa de lista de contatos
    if (selectedStyle === 'disparo_massa') {
      if (campaignForm.contactsList.length === 0) return;
    } else {
      // Para outros tipos, precisa de quiz
      if (!campaignForm.quizId) return;
    }

    const selectedQuiz = quizzes.find(q => q.id === campaignForm.quizId);
    const finalName = campaignForm.name || `[${campaignStyles[selectedStyle].title}] ${selectedQuiz?.title || 'Campanha'}`;

    onCreateCampaign({
      ...campaignForm,
      name: finalName,
      campaignType: selectedStyle
    });
  };

  const renderStyleSelector = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Escolha o Estilo da Campanha SMS</h2>
        <p className="text-gray-600">Selecione o tipo de campanha que melhor se adapta ao seu objetivo</p>
      </div>

      <div className="grid gap-4">
        {Object.values(campaignStyles).map((style) => {
          const Icon = style.icon;
          return (
            <Card 
              key={style.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-500"
              onClick={() => handleStyleSelect(style.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${style.color} text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{style.title}</CardTitle>
                      <CardDescription className="font-medium text-blue-600">
                        {style.subtitle}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={`${style.badgeColor} text-white`}>
                    {style.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-3">{style.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {style.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-xs">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderConfigForm = () => {
    const styleData = selectedStyle ? campaignStyles[selectedStyle] : null;
    if (!styleData) return null;

    const Icon = styleData.icon;

    return (
      <div className="space-y-6">
        {/* Header com estilo selecionado */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <div className={`p-2 rounded-lg ${styleData.color} text-white`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">{styleData.title}</h3>
            <p className="text-sm text-gray-600">{styleData.subtitle}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToStyles}
            className="ml-auto"
          >
            Alterar Estilo
          </Button>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="timing">Timing</TabsTrigger>
            <TabsTrigger value="audience">Audiência</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Nome da Campanha</Label>
              <Input
                id="campaign-name"
                placeholder="Ex: Campanha Black Friday"
                value={campaignForm.name}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* Seleção de Quiz - Oculta para disparo em massa */}
            {selectedStyle !== 'disparo_massa' && (
              <div className="space-y-3">
                <Label>Selecionar Funil/Quiz</Label>
                <div className="grid gap-3 max-h-60 overflow-y-auto">
                  {quizzes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileQuestion className="w-6 h-6" />
                      </div>
                      <p>Nenhum quiz encontrado</p>
                      <p className="text-sm">Crie um quiz primeiro para usar campanhas SMS</p>
                    </div>
                  ) : (
                    quizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          campaignForm.quizId === quiz.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setCampaignForm(prev => ({ ...prev, quizId: quiz.id }))}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{quiz.title}</h4>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{quiz.description || 'Sem descrição'}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {quiz.views || 0} views
                              </span>
                              <span className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {quiz.responses || 0} respostas
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                quiz.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {quiz.published ? 'Publicado' : 'Rascunho'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center ml-3">
                            {campaignForm.quizId === quiz.id && (
                              <CheckCircle className="w-5 h-5 text-blue-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Upload de Lista para Disparo em Massa */}
            {selectedStyle === 'disparo_massa' && (
              <div className="space-y-3">
                <Label>Upload de Lista de Contatos</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500">
                      Formatos aceitos: CSV, TXT
                    </p>
                    <p className="text-xs text-gray-400">
                      Formato CSV: telefone,nome,email (opcional)
                    </p>
                  </div>
                </div>
                {campaignForm.contactsList.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      ✅ {campaignForm.contactsList.length} contatos carregados
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem SMS</Label>
              <Textarea
                id="message"
                placeholder="Digite sua mensagem personalizada..."
                value={campaignForm.message}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Use variáveis como {'{nome_completo}'}, {'{email_contato}'}, {'{telefone_contato}'}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="timing" className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Envio</Label>
              <Select value={campaignForm.triggerType} onValueChange={(value: any) => setCampaignForm(prev => ({ ...prev, triggerType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Imediato</SelectItem>
                  <SelectItem value="delayed">Atrasado</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {campaignForm.triggerType === 'delayed' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Atraso</Label>
                  <Input
                    type="number"
                    min="1"
                    value={campaignForm.triggerDelay}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, triggerDelay: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Select value={campaignForm.triggerUnit} onValueChange={(value: any) => setCampaignForm(prev => ({ ...prev, triggerUnit: value }))}>
                    <SelectTrigger>
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
          </TabsContent>

          <TabsContent value="audience" className="space-y-4">
            <div className="space-y-2">
              <Label>Público-Alvo</Label>
              <Select value={campaignForm.targetAudience} onValueChange={(value: any) => setCampaignForm(prev => ({ ...prev, targetAudience: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Quizzes Completados</SelectItem>
                  <SelectItem value="abandoned">Quizzes Abandonados</SelectItem>
                  <SelectItem value="all">Todos os Leads</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {campaignForm.targetAudience === 'completed' && 'Enviar para pessoas que completaram o quiz'}
                {campaignForm.targetAudience === 'abandoned' && 'Enviar para pessoas que abandonaram o quiz'}
                {campaignForm.targetAudience === 'all' && 'Enviar para todos os leads do quiz'}
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBackToStyles}>
            Voltar aos Estilos
          </Button>
          <Button 
            onClick={handleCreateCampaign}
            disabled={
              !campaignForm.message || 
              isCreating ||
              (selectedStyle === 'disparo_massa' ? campaignForm.contactsList.length === 0 : !campaignForm.quizId)
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Criando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Criar Campanha
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Criar Campanha SMS</span>
          </DialogTitle>
        </DialogHeader>

        {currentStep === 'style' ? renderStyleSelector() : renderConfigForm()}
      </DialogContent>
    </Dialog>
  );
}