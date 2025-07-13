import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  RefreshCw
} from 'lucide-react';

export type CampaignStyle = 'remarketing' | 'remarketing_ultra_customizado' | 'ao_vivo_tempo_real' | 'ao_vivo_ultra_customizada';

interface CampaignStyleSelectorProps {
  open: boolean;
  onClose: () => void;
  onStyleSelect: (style: CampaignStyle) => void;
  platform: 'sms' | 'whatsapp' | 'email';
}

const campaignStyles = {
  remarketing: {
    id: 'remarketing' as CampaignStyle,
    title: 'REMARKETING',
    subtitle: 'Leads "mortos" viram VENDAS!',
    description: 'selecione entre leads antigos que abandonaram ou completaram o quiz e datas',
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
    description: 'selecione entre leads antigos que abandonaram ou completaram o quiz e datas, mas que também dispare funis diferentes para cada faixa de idade, peso, altura, ou como preferir, isso aumenta muito a conversão!',
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
    description: 'mensagens personalizadas para pessoas que abandonaram ou completaram o quiz, escolha quanto tempo após a ação vai disparar a mensagem personalizada desejada',
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
    subtitle: 'NÍVEL SUPREMO de conversão!',
    description: 'mensagens personalizadas para pessoas que abandonaram ou completaram o quiz, escolha quanto tempo após a ação vai disparar a mensagem personalizada desejada mas que também dispare funis diferentes para cada faixa de idade, peso, altura, ou como preferir, isso aumenta muito a conversão!',
    icon: Target,
    color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    features: [
      'AUTOMÁTICO + PERSONALIZADO!',
      'Atleta = mensagem fitness',
      'Sedentário = abordagem gentil',
      '+150% taxa de conversão'
    ],
    badge: 'EXPERT',
    badgeColor: 'bg-blue-500'
  }
};

export function CampaignStyleSelector({ open, onClose, onStyleSelect, platform }: CampaignStyleSelectorProps) {
  const [selectedStyle, setSelectedStyle] = useState<CampaignStyle | null>(null);

  const handleStyleSelect = (style: CampaignStyle) => {
    setSelectedStyle(style);
  };

  const handleConfirm = () => {
    if (selectedStyle) {
      onStyleSelect(selectedStyle);
      onClose();
    }
  };

  const getPlatformName = () => {
    switch (platform) {
      case 'sms': return 'SMS';
      case 'whatsapp': return 'WhatsApp';
      case 'email': return 'Email';
      default: return 'Campanha';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Selecione o Estilo de Campanha - {getPlatformName()}
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            Escolha o tipo de campanha que melhor se adapta ao seu objetivo
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {Object.values(campaignStyles).map((style) => {
            const Icon = style.icon;
            const isSelected = selectedStyle === style.id;
            
            return (
              <Card
                key={style.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
                onClick={() => handleStyleSelect(style.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 rounded-full ${style.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge className={`${style.badgeColor} text-white`}>
                      {style.badge}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-lg font-bold leading-tight">
                    {style.title}
                  </CardTitle>
                  
                  <CardDescription className="text-sm font-medium text-gray-600">
                    {style.subtitle}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700">
                    {style.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Recursos:</h4>
                    <ul className="space-y-1">
                      {style.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {isSelected && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Estilo selecionado
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Informações adicionais */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Como funciona?</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium text-orange-600">Remarketing:</span> Selecione leads antigos que abandonaram ou completaram o quiz e datas
            </div>
            <div>
              <span className="font-medium text-purple-600">Remarketing Ultra Customizado:</span> Leads antigos + funis diferentes por faixa etária, peso, altura
            </div>
            <div>
              <span className="font-medium text-green-600">Ao Vivo (Tempo Real):</span> Mensagens personalizadas, você escolhe o tempo de disparo
            </div>
            <div>
              <span className="font-medium text-blue-600">Ao Vivo Ultra Customizada:</span> Mensagens + funis segmentados por perfil físico
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedStyle}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {selectedStyle ? (
              <>
                <ArrowRight className="w-4 h-4 mr-2" />
                Continuar com {campaignStyles[selectedStyle].title}
              </>
            ) : (
              'Selecione um estilo'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}