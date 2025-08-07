import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CreditCard, Shield, Clock, CheckCircle } from "lucide-react";

interface CheckoutSession {
  sessionId: string;
  url: string;
  customerId: string;
  productId?: string;
  monthlyPriceId?: string;
  trialPriceId?: string;
  amount?: number;
  currency?: string;
  paymentType?: string;
}

export default function CheckoutStripeTrial() {
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const { toast } = useToast();

  const createCheckoutSession = useMutation({
    mutationFn: async (params: {
      trial_period_days: number;
      trial_price: number;
      regular_price: number;
      currency: string;
    }) => {
      const response = await apiRequest("POST", "/api/stripe/create-checkout-session", params);
      return response as CheckoutSession;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível criar a sessão de checkout",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Erro ao criar checkout session:", error);
      toast({
        title: "Erro no Checkout",
        description: "Falha ao criar sessão de pagamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const createTrialFeeSession = useMutation({
    mutationFn: async (params: {
      trial_period_days: number;
      trial_price: number;
      regular_price: number;
      currency: string;
    }) => {
      const response = await apiRequest("POST", "/api/stripe/create-checkout-session-with-trial-fee", params);
      return response as CheckoutSession;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível criar a sessão de checkout",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Erro ao criar trial fee session:", error);
      toast({
        title: "Erro no Checkout",
        description: "Falha ao criar sessão de pagamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleCreateSubscription = async () => {
    setIsCreatingSession(true);
    try {
      await createCheckoutSession.mutateAsync({
        trial_period_days: 3,
        trial_price: 1.00,
        regular_price: 29.90,
        currency: "BRL"
      });
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleCreateTrialFee = async () => {
    setIsCreatingSession(true);
    try {
      await createTrialFeeSession.mutateAsync({
        trial_period_days: 3,
        trial_price: 1.00,
        regular_price: 29.90,
        currency: "BRL"
      });
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Checkout Stripe Trial</h1>
        <p className="text-muted-foreground">
          Teste o sistema de cobrança trial do Stripe - R$1,00 por 3 dias + R$29,90/mês
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Plano Trial com Subscription */}
        <Card className="relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Plano Trial (Subscription)
              </CardTitle>
              <Badge variant="secondary">Recomendado</Badge>
            </div>
            <CardDescription>
              Trial de 3 dias com cobrança automática mensal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-sm">3 dias de trial por R$1,00</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Depois R$29,90/mês recorrente</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm">Cancelamento automático se não pagar</span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="text-2xl font-bold">R$1,00</div>
              <div className="text-sm text-muted-foreground">
                Por 3 dias, depois R$29,90/mês
              </div>
            </div>

            <Button 
              onClick={handleCreateSubscription}
              disabled={isCreatingSession}
              className="w-full"
            >
              {isCreatingSession ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando Sessão...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Criar Plano Trial
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Taxa de Ativação do Trial */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Taxa de Ativação
            </CardTitle>
            <CardDescription>
              Cobrança única para ativar o período de teste
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Pagamento único de R$1,00</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Ativa acesso por 3 dias</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Sem cobrança recorrente automática</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-2xl font-bold">R$1,00</div>
              <div className="text-sm text-muted-foreground">
                Taxa única de ativação
              </div>
            </div>

            <Button 
              onClick={handleCreateTrialFee}
              disabled={isCreatingSession}
              className="w-full"
              variant="outline"
            >
              {isCreatingSession ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando Sessão...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Pagar Taxa de Ativação
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Informações do Teste:</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Ambos os botões criam sessões válidas no Stripe</li>
          <li>• O primeiro usa mode='subscription' com add_invoice_items</li>
          <li>• O segundo usa mode='payment' para cobrança única</li>
          <li>• Teste com cartão: 4242 4242 4242 4242</li>
          <li>• Qualquer data futura e CVC válido</li>
        </ul>
      </div>
    </div>
  );
}