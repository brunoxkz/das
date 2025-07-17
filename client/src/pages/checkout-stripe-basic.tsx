import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, CreditCard, Shield, Clock, Repeat, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Stripe Integration - Carregamento Manual
declare global {
  interface Window {
    Stripe: any;
  }
}

const STRIPE_PUBLIC_KEY = 'pk_test_51RjvV9HK6al3veW1PjziXLVqAk2y8HUIh5Rg2xP3wUUJ6Jdvaob5KB3PlKsWYWOtldtdbeLh0TpcMF5Pb5FfO6p100hNkeeWih';

interface CheckoutFormProps {
  onSuccess: (result: any) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripeReady, setStripeReady] = useState(false);
  const [stripe, setStripe] = useState<any>(null);
  const [cardElement, setCardElement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar Stripe manualmente
  useEffect(() => {
    const loadStripe = async () => {
      try {
        // Verificar se o Stripe já está carregado
        if (window.Stripe) {
          console.log('✅ Stripe já carregado na window');
          const stripeInstance = window.Stripe(STRIPE_PUBLIC_KEY);
          setStripe(stripeInstance);
          setStripeReady(true);
          setIsLoading(false);
          return;
        }

        // Carregar script do Stripe
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        script.onload = () => {
          console.log('✅ Script Stripe carregado');
          if (window.Stripe) {
            const stripeInstance = window.Stripe(STRIPE_PUBLIC_KEY);
            setStripe(stripeInstance);
            setStripeReady(true);
            console.log('✅ Stripe inicializado com sucesso');
          } else {
            console.error('❌ Stripe não encontrado após carregar script');
            setError('Erro ao carregar Stripe');
          }
          setIsLoading(false);
        };
        script.onerror = () => {
          console.error('❌ Erro ao carregar script Stripe');
          setError('Erro ao carregar Stripe');
          setIsLoading(false);
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('❌ Erro geral ao carregar Stripe:', error);
        setError('Erro ao carregar Stripe');
        setIsLoading(false);
      }
    };

    loadStripe();
  }, []);

  // Criar elemento do cartão quando Stripe estiver pronto
  useEffect(() => {
    if (stripe && stripeReady) {
      try {
        const elements = stripe.elements();
        const card = elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#1f2937',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              '::placeholder': {
                color: '#6b7280',
              },
            },
            invalid: {
              color: '#dc2626',
            },
          },
        });
        
        card.mount('#card-element');
        setCardElement(card);
        console.log('✅ Card Element montado');
        
        card.on('change', (event: any) => {
          if (event.error) {
            setError(event.error.message);
          } else {
            setError(null);
          }
        });
      } catch (error) {
        console.error('❌ Erro ao criar card element:', error);
        setError('Erro ao criar elemento do cartão');
      }
    }
  }, [stripe, stripeReady]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!stripe || !cardElement) {
      setError('Stripe não inicializado');
      return;
    }

    if (!customerName.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    setIsProcessing(true);

    try {
      // Criar Payment Method
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: customerName,
          email: customerEmail || undefined,
        },
      });

      if (pmError) {
        throw new Error(pmError.message);
      }

      console.log('✅ Payment Method criado:', paymentMethod.id);

      // Enviar para backend
      const response = await apiRequest('POST', '/api/stripe/create-trial-flow', {
        paymentMethodId: paymentMethod.id,
        customerName,
        customerEmail,
        trialDays: 3,
        activationFee: 1.00,
        monthlyPrice: 29.90,
      });

      console.log('✅ Fluxo completo executado:', response);

      toast({
        title: "Sucesso!",
        description: "Pagamento processado e assinatura criada com sucesso!",
      });

      onSuccess(response.data);

    } catch (error) {
      console.error('❌ Erro no checkout:', error);
      const errorMessage = error.message || 'Erro ao processar pagamento';
      setError(errorMessage);
      
      toast({
        title: "Erro no pagamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando Stripe...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Debug Info */}
      <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
        <p>Debug: Stripe={stripeReady ? '✅' : '❌'} | CardElement={cardElement ? '✅' : '❌'}</p>
      </div>

      {/* Informações do Cliente */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome Completo</Label>
          <Input
            id="name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Digite seu nome completo"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email (opcional)</Label>
          <Input
            id="email"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Digite seu email"
          />
        </div>
      </div>

      {/* Cartão de Crédito */}
      <div className="space-y-4">
        <Label>Dados do Cartão</Label>
        <div className="p-4 border rounded-lg bg-background">
          <div id="card-element" className="min-h-[40px]">
            {/* Stripe Card Element será montado aqui */}
          </div>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Plano de Assinatura */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Plano Vendzz PRO</h3>
        </div>
        
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span><strong>R$ 1,00</strong> hoje (taxa de ativação)</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span><strong>3 dias grátis</strong> para testar</span>
          </div>
          <div className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-purple-600" />
            <span><strong>R$ 29,90/mês</strong> após o período gratuito</span>
          </div>
        </div>
      </div>

      {/* Botão de Pagamento */}
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
        disabled={!stripeReady || isProcessing || !cardElement}
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processando...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Confirmar Pagamento R$ 1,00
          </div>
        )}
      </Button>

      {/* Informações de Segurança */}
      <div className="text-xs text-gray-500 text-center">
        <p>🔒 Pagamento seguro processado pelo Stripe</p>
        <p>Você pode cancelar a qualquer momento</p>
      </div>
    </form>
  );
};

export default function CheckoutStripeBasic() {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const handlePaymentSuccess = (result: any) => {
    setPaymentResult(result);
    setPaymentSuccess(true);
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-green-200 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">Pagamento Realizado com Sucesso!</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Sua assinatura foi criada e está ativa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Próximos Passos:</h3>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• Você tem 3 dias grátis para testar todas as funcionalidades</li>
                  <li>• Após o período gratuito, será cobrado R$ 29,90/mês</li>
                  <li>• Você pode cancelar a qualquer momento</li>
                </ul>
              </div>
              
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                Acessar Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-green-200 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Checkout Vendzz PRO
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Carregamento Manual do Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CheckoutForm onSuccess={handlePaymentSuccess} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}