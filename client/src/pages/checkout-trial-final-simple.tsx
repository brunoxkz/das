import React, { useState, useEffect } from 'react';
// Stripe.js desabilitado para evitar erros CSP
// import { loadStripe } from '@stripe/stripe-js';
// Stripe Elements desabilitado para evitar erros CSP
// import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, CreditCard, Shield, Clock, Repeat, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Stripe key - versão simplificada
// Stripe.js desabilitado para evitar erros CSP
const stripePromise = Promise.resolve(null);

// Configuração do CardElement - mais simples
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#6b7280',
      },
    },
    invalid: {
      color: '#dc2626',
    },
    complete: {
      color: '#059669',
    },
  },
  hidePostalCode: true,
};

interface CheckoutFormProps {
  onSuccess: (result: any) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardReady, setCardReady] = useState(false);

  // Debug simples
  useEffect(() => {
    console.log('Status Stripe:', {
      stripe: stripe ? '✅' : '❌',
      elements: elements ? '✅' : '❌'
    });
  }, [stripe, elements]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!stripe || !elements) {
      console.error('Stripe não inicializado');
      return;
    }

    if (!customerName.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Elemento do cartão não encontrado');
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Cartão de Crédito - Elemento Único */}
      <div className="space-y-4">
        <Label>Dados do Cartão</Label>
        <div className="p-4 border rounded-lg bg-background">
          <CardElement 
            options={cardElementOptions}
            onReady={() => {
              setCardReady(true);
              console.log('✅ CardElement pronto');
            }}
            onChange={(event) => {
              if (event.error) {
                setError(event.error.message);
              } else {
                setError(null);
              }
            }}
          />
        </div>
      </div>

      {/* Debug info */}
      <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
        <p>Debug: Stripe={stripe ? '✅' : '❌'} | Elements={elements ? '✅' : '❌'} | Ready={cardReady ? '✅' : '❌'}</p>
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
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

export default function CheckoutTrialFinalSimple() {
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
              Versão Simplificada - Teste de Funcionalidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise}>
              <CheckoutForm onSuccess={handlePaymentSuccess} />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}