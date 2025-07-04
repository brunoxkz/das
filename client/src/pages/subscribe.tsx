import { useState } from 'react';
import { useAuth } from "@/hooks/useAuth-jwt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Shield, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/mês',
    badge: null,
    badgeVariant: null,
    description: 'Ideal para começar',
    features: [
      'Até 3 quizzes',
      'Até 100 leads por mês',
      'Relatórios básicos',
      'Suporte por email',
      'Elementos básicos'
    ],
    limits: {
      quizzes: 3,
      leads: 100,
      features: 'Básico'
    },
    current: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$ 49',
    period: '/mês',
    badge: 'Popular',
    badgeVariant: 'default',
    description: 'Para negócios em crescimento',
    features: [
      'Até 50 quizzes',
      'Até 5.000 leads por mês',
      'Relatórios avançados',
      'Suporte prioritário',
      'Todos os elementos',
      'Exportação de dados',
      'Templates premium'
    ],
    limits: {
      quizzes: 50,
      leads: 5000,
      features: 'Avançado'
    },
    current: false
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'R$ 149',
    period: '/mês',
    badge: 'Melhor Valor',
    badgeVariant: 'secondary',
    description: 'Para empresas de grande porte',
    features: [
      'Quizzes ilimitados',
      'Leads ilimitados',
      'Relatórios completos',
      'Suporte 24/7',
      'Elementos premium',
      'API personalizada',
      'Integração avançada',
      'Gerente de conta'
    ],
    limits: {
      quizzes: 'Ilimitado',
      leads: 'Ilimitado',
      features: 'Completo'
    },
    current: false
  }
];

export default function Subscribe() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePlanSelect = (planId: string) => {
    if (planId === 'free') {
      toast({
        title: "Você já está no plano gratuito",
        description: "Escolha um plano superior para fazer upgrade.",
        variant: "default",
      });
      return;
    }

    setSelectedPlan(planId);
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A integração com pagamentos ainda está sendo implementada.",
      variant: "default",
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Escolha Seu Plano</h1>
        <p className="text-gray-600 mb-2">
          Plano atual: <Badge variant="outline">{user.plan === 'free' ? 'Gratuito' : user.plan === 'premium' ? 'Premium' : 'Enterprise'}</Badge>
        </p>
        <p className="text-gray-600">
          Evolua seu negócio com nossos planos personalizados
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => {
          const isCurrentPlan = user.plan === plan.id;
          const isPremiumPlan = plan.id === 'premium';
          const isEnterprisePlan = plan.id === 'enterprise';

          return (
            <Card key={plan.id} className={`relative ${isPremiumPlan ? 'border-green-500 border-2' : ''} ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge variant={plan.badgeVariant as any} className="bg-green-500 text-white">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {plan.id === 'free' && <Shield className="w-8 h-8 text-gray-500" />}
                  {plan.id === 'premium' && <Zap className="w-8 h-8 text-green-500" />}
                  {plan.id === 'enterprise' && <Crown className="w-8 h-8 text-yellow-500" />}
                </div>
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-gray-900">
                  {plan.price}
                  <span className="text-sm font-normal text-gray-500">{plan.period}</span>
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="border-t pt-4 mb-6">
                  <h4 className="font-semibold mb-2">Limites do Plano:</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>• Quizzes: {plan.limits.quizzes}</p>
                    <p>• Leads: {plan.limits.leads}</p>
                    <p>• Recursos: {plan.limits.features}</p>
                  </div>
                </div>

                <Button 
                  className={`w-full ${isCurrentPlan ? 'bg-blue-500 hover:bg-blue-600' : isPremiumPlan ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-800 hover:bg-gray-900'}`}
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Plano Atual' : `Escolher ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">🔧 Funcionalidade em Desenvolvimento</h3>
          <p className="text-green-700 text-sm">
            A integração com pagamentos está sendo implementada. 
            Em breve você poderá fazer upgrade do seu plano diretamente aqui.
          </p>
        </div>

        <div className="text-sm text-gray-600">
          <p>• Todos os planos incluem suporte técnico</p>
          <p>• Cancele a qualquer momento</p>
          <p>• Sem taxas de configuração</p>
        </div>
      </div>
    </div>
  );
}