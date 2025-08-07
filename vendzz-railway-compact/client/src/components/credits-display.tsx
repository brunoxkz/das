import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, ShoppingCart, MessageSquare, Mail, Phone, Bot } from 'lucide-react';

interface CreditsDisplayProps {
  credits: {
    sms: number;
    email: number;
    whatsapp: number;
    ia: number;
  };
  platform: 'sms' | 'email' | 'whatsapp' | 'ia';
  onBuyCredits: () => void;
}

export function CreditsDisplay({ credits, platform, onBuyCredits }: CreditsDisplayProps) {
  const getCreditsInfo = () => {
    switch (platform) {
      case 'sms':
        return {
          credits: credits.sms,
          icon: <MessageSquare className="w-5 h-5" />,
          name: 'SMS',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
          price: 'R$ 0,12/SMS'
        };
      case 'email':
        return {
          credits: credits.email,
          icon: <Mail className="w-5 h-5" />,
          name: 'Email',
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
          price: 'R$ 0,05/Email'
        };
      case 'whatsapp':
        return {
          credits: credits.whatsapp,
          icon: <Bot className="w-5 h-5" />,
          name: 'WhatsApp',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 border-purple-200',
          price: 'R$ 0,15/Mensagem'
        };
      case 'ia':
        return {
          credits: credits.ia,
          icon: <Bot className="w-5 h-5" />,
          name: 'I.A.',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 border-orange-200',
          price: 'R$ 2,50/Processamento'
        };
      default:
        return {
          credits: 0,
          icon: <Coins className="w-5 h-5" />,
          name: 'Créditos',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200',
          price: 'Variável'
        };
    }
  };

  const creditsInfo = getCreditsInfo();
  const isLowCredits = creditsInfo.credits < 10;

  return (
    <Card className={`${creditsInfo.bgColor} border-2 mb-6`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`${creditsInfo.color}`}>
              {creditsInfo.icon}
            </div>
            <span className="font-bold">Créditos {creditsInfo.name}</span>
          </div>
          <Badge 
            variant={isLowCredits ? "destructive" : "secondary"}
            className="text-sm font-bold"
          >
            {creditsInfo.credits.toLocaleString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <p className="font-medium">Preço por envio: {creditsInfo.price}</p>
            {isLowCredits && (
              <p className="text-red-600 font-medium mt-1">
                ⚠️ Créditos baixos! Recomendamos recarregar.
              </p>
            )}
          </div>
          <Button
            onClick={onBuyCredits}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Comprar Créditos
          </Button>
        </div>

        {/* Barra de progresso visual */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              isLowCredits ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}
            style={{ 
              width: `${Math.min((creditsInfo.credits / 100) * 100, 100)}%` 
            }}
          />
        </div>

        <div className="text-xs text-gray-500 text-center">
          {isLowCredits ? 
            `Apenas ${creditsInfo.credits} créditos restantes` : 
            `${creditsInfo.credits} créditos disponíveis`
          }
        </div>
      </CardContent>
    </Card>
  );
}