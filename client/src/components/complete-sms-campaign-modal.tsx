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
  Settings
} from 'lucide-react';

export type CampaignStyle = 'remarketing' | 'remarketing_ultra_customizado' | 'ao_vivo_tempo_real' | 'ao_vivo_ultra_customizada';

interface CompleteSMSCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onCreateCampaign: (campaignData: any) => void;
  quizzes: any[];
  isCreating: boolean;
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
  }
};

export function CompleteSMSCampaignModal({
  open,
  onClose,
  onCreateCampaign,
  quizzes,
  isCreating
}: CompleteSMSCampaignModalProps) {
  const [currentStep, setCurrentStep] = useState<'style' | 'config'>('style');
  const [selectedStyle, setSelectedStyle] = useState<CampaignStyle | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    message: '',
    quizId: '',
    targetAudience: 'completed' as 'completed' | 'abandoned' | 'all',
    triggerType: 'immediate' as 'immediate' | 'delayed' | 'scheduled',
    triggerDelay: 1,
    triggerUnit: 'hours' as 'hours' | 'minutes'
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

  const handleCreateCampaign = () => {
    if (!selectedStyle || !campaignForm.quizId) return;

    const selectedQuiz = quizzes.find(q => q.id === campaignForm.quizId);
    const finalName = campaignForm.name || `[${campaignStyles[selectedStyle].title}] ${selectedQuiz?.title || 'Quiz'}`;

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

            <div className="space-y-2">
              <Label htmlFor="quiz-select">Selecionar Quiz</Label>
              <Select value={campaignForm.quizId} onValueChange={(value) => setCampaignForm(prev => ({ ...prev, quizId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um quiz" />
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
            disabled={!campaignForm.quizId || !campaignForm.message || isCreating}
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