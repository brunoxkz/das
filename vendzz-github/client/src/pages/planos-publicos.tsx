import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, CreditCard, Shield, Clock, ArrowRight, Users, Zap } from 'lucide-react';

export default function PlanosPublicos() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const { toast } = useToast();

  const plans = [
    {
      id: 'plan_basico',
      name: 'Plano Básico',
      description: 'Perfeito para começar',
      price: 29.90,
      trialPrice: 1.00,
      trialDays: 3,
      features: [
        'Quiz Builder Completo',
        'SMS Marketing Ilimitado',
        'Email Marketing Avançado',
        'WhatsApp Business',
        'Analytics Detalhado',
        'Suporte 24/7'
      ],
      color: 'green',
      popular: true
    },
    {
      id: 'plan_premium',
      name: 'Plano Premium',
      description: 'Para empresas em crescimento',
      price: 69.90,
      trialPrice: 1.00,
      trialDays: 7,
      features: [
        'Tudo do Básico',
        'A/B Testing Avançado',
        'Automação IA',
        'Vídeos Faceless',
        'Integrações Premium',
        'Relatórios Personalizados',
        'API Completa'
      ],
      color: 'purple',
      popular: false
    },
    {
      id: 'plan_enterprise',
      name: 'Plano Enterprise',
      description: 'Para grandes operações',
      price: 149.90,
      trialPrice: 1.00,
      trialDays: 14,
      features: [
        'Tudo do Premium',
        'Usuários Ilimitados',
        'White Label',
        'Manager Dedicado',
        'Implementação Personalizada',
        'SLA 99.9%',
        'Treinamento da Equipe'
      ],
      color: 'orange',
      popular: false
    }
  ];

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handleCheckout = async () => {
    if (!selectedPlan) return;

    setLoading(selectedPlan.id);

    try {
      const response = await fetch('/api/public/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          customerName: customerData.name,
          customerEmail: customerData.email,
          customerPhone: customerData.phone,
          returnUrl: window.location.origin + '/checkout/success',
          cancelUrl: window.location.href
        }),
      });

      const session = await response.json();

      if (session.success) {
        // Redirecionar para Stripe Checkout
        window.location.href = session.checkoutUrl;
      } else {
        throw new Error(session.message || 'Erro ao criar sessão de pagamento');
      }
    } catch (error) {
      toast({
        title: "Erro no pagamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  if (showCheckout && selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <button
              onClick={() => setShowCheckout(false)}
              className="mb-4 text-gray-400 hover:text-white transition-colors"
            >
              ← Voltar aos planos
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">
              Finalizar Assinatura
            </h1>
            <p className="text-gray-300">
              {selectedPlan.name} - R$ {selectedPlan.price.toFixed(2).replace('.', ',')}/mês
            </p>
          </div>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Dados para Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white">Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                    placeholder="Seu nome completo"
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                    placeholder="seu@email.com"
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-white">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-700 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2">Resumo do Pagamento</h3>
                <div className="text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>Taxa de Ativação:</span>
                    <span>R$ {selectedPlan.trialPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trial Gratuito:</span>
                    <span>{selectedPlan.trialDays} dias</span>
                  </div>
                  <div className="flex justify-between font-semibold text-white mt-2 pt-2 border-t border-slate-600">
                    <span>Após o trial:</span>
                    <span>R$ {selectedPlan.price.toFixed(2).replace('.', ',')}/mês</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={loading === selectedPlan.id || !customerData.name || !customerData.email || !customerData.phone}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3"
              >
                {loading === selectedPlan.id ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Criando sessão...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Pagar R$ {selectedPlan.trialPrice.toFixed(2).replace('.', ',')} e Ativar
                  </div>
                )}
              </Button>

              <div className="text-center text-sm text-gray-400">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="w-4 h-4" />
                  <span>Pagamento 100% seguro via Stripe</span>
                </div>
                <p>
                  Você pode cancelar a qualquer momento durante o trial gratuito.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-4">
            Escolha Seu Plano
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Comece com apenas R$ 1,00 e tenha acesso completo à plataforma mais avançada de marketing digital do Brasil
          </p>
          <div className="flex justify-center items-center gap-4 mt-6">
            <Badge className="bg-green-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              R$ 1,00 Ativação
            </Badge>
            <Badge className="bg-blue-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Trial Gratuito
            </Badge>
            <Badge className="bg-purple-600 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Cancele Quando Quiser
            </Badge>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative bg-slate-800 border-slate-700 hover:scale-105 transition-transform duration-300 ${
                plan.popular ? 'ring-2 ring-green-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-600 text-white px-4 py-1">
                    MAIS POPULAR
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                <p className="text-gray-300 text-sm">{plan.description}</p>
                
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">
                      R$ {plan.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-gray-400">/mês</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Comece com apenas R$ {plan.trialPrice.toFixed(2).replace('.', ',')} + {plan.trialDays} dias grátis
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={loading === plan.id}
                  className={`w-full font-semibold py-3 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
                      : 'bg-slate-700 hover:bg-slate-600'
                  } text-white`}
                >
                  {loading === plan.id ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Carregando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Escolher {plan.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Card className="bg-slate-800 border-slate-700 max-w-4xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Por que escolher a Vendzz?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="text-center">
                  <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-300">
                    <strong className="text-white">+10.000</strong> empresas confiam
                  </p>
                </div>
                <div className="text-center">
                  <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-gray-300">
                    <strong className="text-white">99.9%</strong> de disponibilidade
                  </p>
                </div>
                <div className="text-center">
                  <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-gray-300">
                    <strong className="text-white">Segurança</strong> garantida
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}