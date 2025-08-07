/**
 * SELETOR DE GATEWAY DE PAGAMENTO
 * Permite escolher entre Stripe e Pagar.me
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, CreditCard, DollarSign, Clock, Globe, MapPin } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Gateway {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  countries: string[];
  features: string[];
  pricing: {
    setup_fee: number;
    monthly_fee: number;
    trial_days: number;
  };
}

interface GatewaySelectorProps {
  selectedGateway: string;
  onGatewayChange: (gateway: string) => void;
  onContinue: () => void;
  disabled?: boolean;
}

export default function GatewaySelector({ 
  selectedGateway, 
  onGatewayChange, 
  onContinue, 
  disabled = false 
}: GatewaySelectorProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Buscar gateways disponíveis
  const { data: gatewaysData, isLoading: gatewaysLoading } = useQuery({
    queryKey: ['/api/payment-gateways'],
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const gateways: Gateway[] = gatewaysData?.gateways || [];

  // Definir gateway padrão se não houver seleção
  useEffect(() => {
    if (!selectedGateway && gateways.length > 0) {
      onGatewayChange(gateways[0].id);
    }
  }, [gateways, selectedGateway, onGatewayChange]);

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(priceInCents / 100);
  };

  const getGatewayIcon = (gatewayId: string) => {
    switch (gatewayId) {
      case 'stripe':
        return <Globe className="w-5 h-5 text-blue-500" />;
      case 'pagarme':
        return <MapPin className="w-5 h-5 text-green-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />;
      case 'subscriptions':
        return <Clock className="w-4 h-4" />;
      case 'webhooks':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getFeatureLabel = (feature: string) => {
    const labels = {
      'credit_card': 'Cartão de Crédito',
      'boleto': 'Boleto',
      'pix': 'Pix',
      'subscriptions': 'Assinaturas',
      'webhooks': 'Webhooks',
      'trial_periods': 'Períodos de Teste'
    };
    return labels[feature] || feature;
  };

  if (gatewaysLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Carregando gateways de pagamento...</p>
        </div>
      </div>
    );
  }

  if (gateways.length === 0) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-destructive font-medium">Nenhum gateway de pagamento configurado</p>
            <p className="text-sm text-muted-foreground mt-2">
              Entre em contato com o suporte para configurar os métodos de pagamento.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Escolha seu Gateway de Pagamento</h3>
        <p className="text-sm text-muted-foreground">
          Selecione como deseja processar seus pagamentos
        </p>
      </div>

      <RadioGroup value={selectedGateway} onValueChange={onGatewayChange}>
        <div className="space-y-4">
          {gateways.map((gateway) => (
            <div key={gateway.id} className="relative">
              <Card className={`cursor-pointer transition-all ${
                selectedGateway === gateway.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-primary/50'
              }`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={gateway.id} id={gateway.id} />
                      <Label htmlFor={gateway.id} className="flex items-center space-x-2 cursor-pointer">
                        {getGatewayIcon(gateway.id)}
                        <span className="font-medium">{gateway.name}</span>
                      </Label>
                    </div>
                    <Badge 
                      variant={gateway.enabled ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {gateway.enabled ? 'Disponível' : 'Indisponível'}
                    </Badge>
                  </div>
                  <CardDescription className="ml-8">
                    {gateway.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Preços */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Taxa de Ativação</p>
                        <p className="font-medium text-green-600">
                          {formatPrice(gateway.pricing.setup_fee)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mensalidade</p>
                        <p className="font-medium">
                          {formatPrice(gateway.pricing.monthly_fee)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Trial gratuito de {gateway.pricing.trial_days} dias
                    </div>
                  </div>

                  {/* Recursos */}
                  <div>
                    <p className="text-sm font-medium mb-2">Recursos Disponíveis</p>
                    <div className="flex flex-wrap gap-2">
                      {gateway.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          <span className="flex items-center space-x-1">
                            {getFeatureIcon(feature)}
                            <span>{getFeatureLabel(feature)}</span>
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Países */}
                  <div>
                    <p className="text-sm font-medium mb-2">Países Suportados</p>
                    <div className="flex flex-wrap gap-1">
                      {gateway.countries.map((country) => (
                        <Badge key={country} variant="secondary" className="text-xs">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </RadioGroup>

      {/* Botão de Continuar */}
      <div className="flex justify-center pt-4">
        <Button 
          onClick={onContinue}
          disabled={!selectedGateway || disabled || isLoading}
          className="w-full max-w-md"
        >
          {isLoading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Processando...
            </>
          ) : (
            <>
              Continuar com {gateways.find(g => g.id === selectedGateway)?.name}
              <CheckCircle className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}