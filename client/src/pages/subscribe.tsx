import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Shield, Clock, CreditCard } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn('VITE_STRIPE_PUBLIC_KEY not found - Stripe functionality will be disabled');
}

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Falha no Pagamento",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Pagamento Realizado com Sucesso",
        description: "Você está inscrito!",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe} 
        className="w-full"
        size="lg"
      >
        <Crown className="w-4 h-4 mr-2" />
        Assinar Agora
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "R$ 97",
      period: "/mês",
      features: [
        "Até 5 quizzes ativos",
        "1.000 respostas/mês",
        "Templates básicos",
        "Analytics básico",
        "Suporte por email"
      ],
      popular: false
    },
    {
      id: "professional",
      name: "Professional",
      price: "R$ 197",
      period: "/mês",
      features: [
        "Quizzes ilimitados",
        "10.000 respostas/mês",
        "Todos os templates",
        "Analytics avançado",
        "Integrações premium",
        "Suporte prioritário"
      ],
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "R$ 497",
      period: "/mês",
      features: [
        "Recursos ilimitados",
        "100.000 respostas/mês",
        "White-label",
        "API personalizada",
        "Gerente de conta",
        "Suporte 24/7"
      ],
      popular: false
    }
  ];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para assinar.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (isAuthenticated && stripePromise) {
      // Create subscription as soon as the page loads
      apiRequest("POST", "/api/create-subscription")
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          if (isUnauthorizedError(error)) {
            toast({
              title: "Sessão expirada",
              description: "Fazendo login novamente...",
              variant: "destructive",
            });
            setTimeout(() => {
              window.location.href = "/api/login";
            }, 500);
            return;
          }
          toast({
            title: "Erro ao processar assinatura",
            description: "Tente novamente mais tarde.",
            variant: "destructive",
          });
        });
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Pagamentos Indisponíveis</h2>
            <p className="text-gray-600">
              O sistema de pagamentos não está configurado no momento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Escolha seu Plano</h1>
            <p className="text-gray-600 mt-2">Selecione o plano ideal para suas necessidades</p>
          </div>
        </div>

        {/* Plans */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-primary">{plan.price}</div>
                  <div className="text-gray-600">{plan.period}</div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="text-accent mr-3 w-4 h-4" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full mt-6" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    Selecionar Plano
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Loading state */}
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Finalizar Assinatura</h1>
          <p className="text-gray-600 mt-2">Complete seu pagamento para ativar sua conta premium</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Informações de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <SubscribeForm />
                </Elements>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Plano Professional</span>
                  <span className="text-2xl font-bold text-primary">R$ 197/mês</span>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Incluído no seu plano:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm">
                      <Check className="text-accent mr-2 w-4 h-4" />
                      Quizzes ilimitados
                    </li>
                    <li className="flex items-center text-sm">
                      <Check className="text-accent mr-2 w-4 h-4" />
                      10.000 respostas/mês
                    </li>
                    <li className="flex items-center text-sm">
                      <Check className="text-accent mr-2 w-4 h-4" />
                      Analytics avançado
                    </li>
                    <li className="flex items-center text-sm">
                      <Check className="text-accent mr-2 w-4 h-4" />
                      Suporte prioritário
                    </li>
                  </ul>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="w-4 h-4 mr-2" />
                    Pagamento seguro e criptografado
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    Cancele a qualquer momento
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Zap className="w-4 h-4 mr-2" />
                    Ativação imediata
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
