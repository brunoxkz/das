import { useState } from 'react';
import { useAuth } from "@/hooks/useAuth-jwt";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Check, Crown, Zap, Shield, X, MessageSquare, Mail, Smartphone, Bot, CreditCard, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

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
      'Elementos básicos',
      '50 SMS grátis',
      '100 E-mails grátis'
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
      'Templates premium',
      '500 SMS inclusos',
      '2.000 E-mails inclusos',
      '200 WhatsApp inclusos'
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
      'Gerente de conta',
      '2.000 SMS inclusos',
      '10.000 E-mails inclusos',
      '1.000 WhatsApp inclusos',
      '500 Vídeos IA inclusos'
    ],
    limits: {
      quizzes: 'Ilimitado',
      leads: 'Ilimitado',
      features: 'Completo'
    },
    current: false
  }
];

const creditPackages = {
  sms: [
    { id: 'sms_100', name: '100 SMS', price: 'R$ 9,90', credits: 100, popular: false },
    { id: 'sms_500', name: '500 SMS', price: 'R$ 39,90', credits: 500, popular: true },
    { id: 'sms_1000', name: '1.000 SMS', price: 'R$ 69,90', credits: 1000, popular: false },
    { id: 'sms_5000', name: '5.000 SMS', price: 'R$ 299,90', credits: 5000, popular: false }
  ],
  email: [
    { id: 'email_1000', name: '1.000 E-mails', price: 'R$ 4,90', credits: 1000, popular: false },
    { id: 'email_5000', name: '5.000 E-mails', price: 'R$ 19,90', credits: 5000, popular: true },
    { id: 'email_10000', name: '10.000 E-mails', price: 'R$ 34,90', credits: 10000, popular: false },
    { id: 'email_50000', name: '50.000 E-mails', price: 'R$ 149,90', credits: 50000, popular: false }
  ],
  whatsapp: [
    { id: 'whatsapp_100', name: '100 WhatsApp', price: 'R$ 19,90', credits: 100, popular: false },
    { id: 'whatsapp_500', name: '500 WhatsApp', price: 'R$ 89,90', credits: 500, popular: true },
    { id: 'whatsapp_1000', name: '1.000 WhatsApp', price: 'R$ 159,90', credits: 1000, popular: false },
    { id: 'whatsapp_5000', name: '5.000 WhatsApp', price: 'R$ 699,90', credits: 5000, popular: false }
  ],
  ai: [
    { id: 'ai_50', name: '50 Vídeos IA', price: 'R$ 29,90', credits: 50, popular: false },
    { id: 'ai_200', name: '200 Vídeos IA', price: 'R$ 99,90', credits: 200, popular: true },
    { id: 'ai_500', name: '500 Vídeos IA', price: 'R$ 199,90', credits: 500, popular: false },
    { id: 'ai_1000', name: '1.000 Vídeos IA', price: 'R$ 349,90', credits: 1000, popular: false }
  ]
};

export default function Subscribe() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Fetch user credits
  const { data: userCredits, isLoading: creditsLoading } = useQuery({
    queryKey: ["/api/user/credits"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/user/credits", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch credits");
      return response.json();
    }
  });

  // Purchase credits mutation
  const purchaseCreditsMutation = useMutation({
    mutationFn: async ({ type, packageId }: { type: string, packageId: string }) => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ type, packageId })
      });
      if (!response.ok) throw new Error("Failed to purchase credits");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/credits"] });
      toast({
        title: "Créditos Adquiridos",
        description: "Seus créditos foram adicionados com sucesso!"
      });
    },
    onError: () => {
      toast({
        title: "Erro na Compra",
        description: "Funcionalidade em desenvolvimento. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  });

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

  const handleCreditPurchase = (type: string, packageId: string) => {
    purchaseCreditsMutation.mutate({ type, packageId });
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
        <h1 className="text-3xl font-bold mb-4">Planos e Créditos</h1>
        <p className="text-gray-600 mb-2">
          Plano atual: <Badge variant="outline">{user.plan === 'free' ? 'Gratuito' : user.plan === 'premium' ? 'Premium' : 'Enterprise'}</Badge>
        </p>
        <p className="text-gray-600">
          Gerencie seu plano e créditos para maximizar seus resultados
        </p>
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Planos de Assinatura
          </TabsTrigger>
          <TabsTrigger value="credits" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Comprar Créditos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrentPlan = user.plan === plan.id;
              const isPremiumPlan = plan.id === 'premium';

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
          </div>
        </TabsContent>

        <TabsContent value="credits" className="space-y-6">
          {/* Current Credits Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Seus Créditos Atuais
              </CardTitle>
            </CardHeader>
            <CardContent>
              {creditsLoading ? (
                <div className="text-center py-4">Carregando créditos...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Smartphone className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <div className="font-bold text-xl">{userCredits?.breakdown?.sms || 0}</div>
                    <div className="text-sm text-gray-600">SMS</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Mail className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <div className="font-bold text-xl">{userCredits?.breakdown?.email || 0}</div>
                    <div className="text-sm text-gray-600">E-mails</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <MessageSquare className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <div className="font-bold text-xl">{userCredits?.breakdown?.whatsapp || 0}</div>
                    <div className="text-sm text-gray-600">WhatsApp</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Bot className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <div className="font-bold text-xl">{userCredits?.breakdown?.ai || 0}</div>
                    <div className="text-sm text-gray-600">Vídeos IA</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Credit Packages */}
          <div className="space-y-8">
            {/* SMS Credits */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                Créditos SMS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {creditPackages.sms.map((pkg) => (
                  <Card key={pkg.id} className={`relative transition-transform hover:scale-105 ${pkg.popular ? 'border-blue-500 border-2' : ''}`}>
                    {pkg.popular && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary">
                          <Star className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <div className="text-2xl font-bold text-blue-600">{pkg.price}</div>
                      <p className="text-sm text-gray-600">{pkg.credits} créditos SMS</p>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => handleCreditPurchase('sms', pkg.id)}
                        className="w-full"
                        variant={pkg.popular ? "default" : "outline"}
                        disabled={purchaseCreditsMutation.isPending}
                      >
                        {purchaseCreditsMutation.isPending ? "Processando..." : "Comprar"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Email Credits */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-600" />
                Créditos E-mail Marketing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {creditPackages.email.map((pkg) => (
                  <Card key={pkg.id} className={`relative transition-transform hover:scale-105 ${pkg.popular ? 'border-green-500 border-2' : ''}`}>
                    {pkg.popular && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary">
                          <Star className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <div className="text-2xl font-bold text-green-600">{pkg.price}</div>
                      <p className="text-sm text-gray-600">{pkg.credits} créditos de e-mail</p>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => handleCreditPurchase('email', pkg.id)}
                        className="w-full"
                        variant={pkg.popular ? "default" : "outline"}
                        disabled={purchaseCreditsMutation.isPending}
                      >
                        {purchaseCreditsMutation.isPending ? "Processando..." : "Comprar"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* WhatsApp Credits */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                Créditos WhatsApp
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {creditPackages.whatsapp.map((pkg) => (
                  <Card key={pkg.id} className={`relative transition-transform hover:scale-105 ${pkg.popular ? 'border-purple-500 border-2' : ''}`}>
                    {pkg.popular && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary">
                          <Star className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <div className="text-2xl font-bold text-purple-600">{pkg.price}</div>
                      <p className="text-sm text-gray-600">{pkg.credits} créditos WhatsApp</p>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => handleCreditPurchase('whatsapp', pkg.id)}
                        className="w-full"
                        variant={pkg.popular ? "default" : "outline"}
                        disabled={purchaseCreditsMutation.isPending}
                      >
                        {purchaseCreditsMutation.isPending ? "Processando..." : "Comprar"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* AI Video Credits */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5 text-orange-600" />
                Créditos Vídeos IA
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {creditPackages.ai.map((pkg) => (
                  <Card key={pkg.id} className={`relative transition-transform hover:scale-105 ${pkg.popular ? 'border-orange-500 border-2' : ''}`}>
                    {pkg.popular && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary">
                          <Star className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <div className="text-2xl font-bold text-orange-600">{pkg.price}</div>
                      <p className="text-sm text-gray-600">{pkg.credits} vídeos com IA</p>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => handleCreditPurchase('ai', pkg.id)}
                        className="w-full"
                        variant={pkg.popular ? "default" : "outline"}
                        disabled={purchaseCreditsMutation.isPending}
                      >
                        {purchaseCreditsMutation.isPending ? "Processando..." : "Comprar"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}