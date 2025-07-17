import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Shield, Clock, TestTube, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Separator } from '@/components/ui/separator';

// Stripe público do ambiente
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51RjvV9HK6al3veW1PjziXLVqAk2y8HUIh5Rg2xP3wUUJ6Jdvaob5KB3PlKsWYWOtldtdbeLh0TpcMF5Pb5FfO6p100hNkeeWih');

interface CheckoutFormProps {
  clientSecret: string;
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
    trial_period_days: number;
    trial_price: number;
  };
}

function CheckoutForm({ clientSecret, plan }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTestingAccelerated, setIsTestingAccelerated] = useState(false);

  const handleAcceleratedTest = async () => {
    if (!stripe || !elements) {
      toast({
        title: "Erro",
        description: "Stripe ainda não foi carregado",
        variant: "destructive",
      });
      return;
    }

    setIsTestingAccelerated(true);

    try {
      // Primeiro, criar o payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement('card') || elements.getElement('cardNumber')!,
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      // Agora chamar o endpoint de teste acelerado
      const response = await apiRequest("POST", "/api/stripe/test-accelerated-billing", {
        paymentMethodId: paymentMethod.id,
        testMinutes: 2 // Cobrança recorrente após 2 minutos
      });

      toast({
        title: "🚀 Teste Acelerado Iniciado!",
        description: response.message,
      });

      // Mostrar detalhes do teste
      setTimeout(() => {
        toast({
          title: "💰 Cobrança Trial",
          description: `R$ ${response.trialAmount} cobrado com sucesso!`,
        });
      }, 2000);

      // Avisar sobre cobrança recorrente
      setTimeout(() => {
        toast({
          title: "⏰ Cobrança Recorrente Programada",
          description: `R$ ${response.recurringAmount} será cobrado em ${response.scheduledChargeIn}`,
        });
      }, 4000);

    } catch (error: any) {
      toast({
        title: "Erro no teste acelerado",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsTestingAccelerated(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
      });

      if (error) {
        toast({
          title: "Erro no pagamento",
          description: error.message || "Ocorreu um erro ao processar o pagamento",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Pagamento processado!",
          description: "Seu trial foi ativado com sucesso",
        });
      }
    } catch (err) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900 dark:text-blue-100">
              Trial de {plan.trial_period_days} dias
            </span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Comece por apenas R$ {plan.trial_price.toFixed(2)} por {plan.trial_period_days} dias, 
            depois R$ {plan.price.toFixed(2)}/mês
          </p>
        </div>

        <PaymentElement />
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || isProcessing || isTestingAccelerated}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processando...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Iniciar Trial por R$ {plan.trial_price.toFixed(2)}
          </>
        )}
      </Button>

      <Separator className="my-6" />

      <div className="space-y-4">
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-2">
            <TestTube className="h-5 w-5 text-orange-600" />
            <span className="font-medium text-orange-900 dark:text-orange-100">
              Teste Acelerado
            </span>
          </div>
          <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
            Teste o sistema de cobrança em modo acelerado: R$ 1,00 cobrado agora + R$ 29,90 após 2 minutos
          </p>
          <Button 
            type="button"
            variant="outline"
            onClick={handleAcceleratedTest}
            disabled={!stripe || isProcessing || isTestingAccelerated}
            className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            {isTestingAccelerated ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                Iniciando Teste...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Testar Cobrança Acelerada
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <Shield className="h-4 w-4 inline mr-1" />
          Seguro e protegido pelo Stripe
        </p>
      </div>
    </form>
  );
}

export default function CheckoutStripeTrial() {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    createCheckoutSession();
  }, []);

  const createCheckoutSession = async () => {
    try {
      const response = await apiRequest("POST", "/api/stripe/create-checkout-session", {
        price_id: "price_trial_premium", // ID do preço do Stripe
        trial_period_days: 3,
        trial_price: 1.00,
        regular_price: 29.90,
        currency: "BRL",
        mode: "subscription"
      });

      setClientSecret(response.clientSecret);
      setPlan({
        id: response.priceId,
        name: "Plano Premium",
        price: 29.90,
        currency: "BRL",
        trial_period_days: 3,
        trial_price: 1.00
      });
    } catch (error) {
      toast({
        title: "Erro ao carregar checkout",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!clientSecret || !plan) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Erro no Checkout</CardTitle>
            <CardDescription>
              Não foi possível carregar o checkout. Tente novamente.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Resumo do Plano */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">Trial</Badge>
                {plan.name}
              </CardTitle>
              <CardDescription>
                Experimente todos os recursos por {plan.trial_period_days} dias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Trial ({plan.trial_period_days} dias)</span>
                  <span className="font-medium">R$ {plan.trial_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Depois do trial</span>
                  <span>R$ {plan.price.toFixed(2)}/mês</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Recursos incluídos:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Quizzes ilimitados
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Campanhas SMS/WhatsApp
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Analytics avançados
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Suporte prioritário
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Importante:</strong> Você pode cancelar a qualquer momento. 
                  Após o trial, será cobrado R$ {plan.price.toFixed(2)} mensalmente.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle>Dados de Pagamento</CardTitle>
              <CardDescription>
                Inicie seu trial com segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm clientSecret={clientSecret} plan={plan} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}