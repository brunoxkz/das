import React, { useState, useEffect } from 'react';
// Stripe.js desabilitado para evitar erros CSP
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, CreditCard, Shield, Clock, Repeat, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Stripe public key - inicialização mais robusta
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// Stripe.js desabilitado para evitar erros CSP
const stripePromise = Promise.resolve(null);

// Configuração dos elementos individuais do Stripe
const stripeElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSmoothing: 'antialiased',
      lineHeight: '1.5',
      '::placeholder': {
        color: '#6b7280',
      },
      iconColor: '#6b7280',
    },
    invalid: {
      color: '#dc2626',
      iconColor: '#dc2626',
    },
    complete: {
      color: '#059669',
      iconColor: '#059669',
    },
  },
  // Configurações para garantir interação
  disabled: false,
  hideIcon: false,
  showIcon: true,
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
  const [cardError, setCardError] = useState<string | null>(null);

  // Verificar se os elementos do Stripe estão carregados
  useEffect(() => {
    const checkStripeElements = () => {
      if (stripe && elements) {
        console.log('✅ Stripe e Elements carregados com sucesso');
        // Verificar se os elementos individuais estão disponíveis
        setTimeout(() => {
          const cardNumber = elements.getElement(CardNumberElement);
          const cardExpiry = elements.getElement(CardExpiryElement);
          const cardCvc = elements.getElement(CardCvcElement);
          
          console.log('Elementos disponíveis:', {
            cardNumber: cardNumber ? '✅' : '❌',
            cardExpiry: cardExpiry ? '✅' : '❌',
            cardCvc: cardCvc ? '✅' : '❌'
          });
        }, 1000);
      } else {
        console.log('❌ Stripe ou Elements não carregados ainda');
      }
    };

    checkStripeElements();
  }, [stripe, elements]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    if (!customerName.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      setError('Elemento do cartão não encontrado');
      return;
    }

    setIsProcessing(true);

    try {
      // PASSO 1: Criar Payment Method com setup_future_usage
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
        billing_details: {
          name: customerName,
          email: customerEmail || undefined,
        },
      });

      if (pmError) {
        throw new Error(pmError.message);
      }

      console.log('✅ Payment Method criado:', paymentMethod.id);

      // PASSO 2: Enviar para backend - Fluxo completo
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
          <Label htmlFor="name">Nome Completo *</Label>
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

      {/* Cartão de Crédito - Elementos Individuais */}
      <div className="space-y-4">
        <Label>Dados do Cartão</Label>
        
        {/* Número do Cartão */}
        <div>
          <Label htmlFor="card-number">Número do Cartão</Label>
          <div className="relative">
            <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <CardNumberElement
                id="card-number"
                options={stripeElementOptions}
                className="w-full"
                onReady={() => {
                  console.log('✅ CardNumberElement ready and clickable');
                  setCardReady(true);
                }}
                onFocus={() => {
                  console.log('CardNumberElement focused');
                }}
                onBlur={() => {
                  console.log('CardNumberElement blurred');
                }}
                onChange={(event) => {
                  console.log('CardNumberElement change:', event);
                  if (event.error) {
                    setCardError(event.error.message);
                    setError(event.error.message);
                  } else {
                    setCardError(null);
                    if (cardError) setError(null);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Data de Validade e CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="card-expiry">Data de Validade</Label>
            <div className="relative">
              <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <CardExpiryElement
                  id="card-expiry"
                  options={stripeElementOptions}
                  className="w-full"
                  onReady={() => console.log('✅ CardExpiryElement ready')}
                  onFocus={() => console.log('CardExpiryElement focused')}
                  onBlur={() => console.log('CardExpiryElement blurred')}
                  onChange={(event) => {
                    console.log('CardExpiryElement change:', event);
                    if (event.error) {
                      setCardError(event.error.message);
                      setError(event.error.message);
                    } else {
                      setCardError(null);
                      if (cardError) setError(null);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="card-cvc">CVC</Label>
            <div className="relative">
              <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <CardCvcElement
                  id="card-cvc"
                  options={stripeElementOptions}
                  className="w-full"
                  onReady={() => console.log('✅ CardCvcElement ready')}
                  onFocus={() => console.log('CardCvcElement focused')}
                  onBlur={() => console.log('CardCvcElement blurred')}
                  onChange={(event) => {
                    console.log('CardCvcElement change:', event);
                    if (event.error) {
                      setCardError(event.error.message);
                      setError(event.error.message);
                    } else {
                      setCardError(null);
                      if (cardError) setError(null);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {cardReady && (
          <p className="text-sm text-green-600 mt-1">
            ✅ Campos do cartão estão prontos! Clique para digitar nos campos acima.
          </p>
        )}
        {cardError && (
          <p className="text-sm text-red-600 mt-1">
            ❌ {cardError}
          </p>
        )}
        <div className="bg-blue-50 p-3 rounded-lg mt-2">
          <p className="text-sm text-blue-700 font-medium">
            📋 Instruções de Teste:
          </p>
          <ul className="text-sm text-blue-600 mt-1 space-y-1">
            <li>• Número: 4242 4242 4242 4242</li>
            <li>• Data: qualquer data futura (ex: 12/25)</li>
            <li>• CVC: qualquer 3 dígitos (ex: 123)</li>
          </ul>
        </div>
        
        {/* Debug Info */}
        <div className="bg-gray-50 p-3 rounded-lg mt-2">
          <p className="text-xs text-gray-600">
            Debug: Stripe={stripe ? '✅' : '❌'} | Elements={elements ? '✅' : '❌'} | Ready={cardReady ? '✅' : '❌'}
          </p>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Botão de Pagamento */}
      <Button
        type="submit"
        className="w-full h-12 text-lg font-semibold"
        disabled={!stripe || isProcessing || !cardReady}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processando...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pagar R$ 1,00 e Ativar Plano
          </>
        )}
      </Button>
    </form>
  );
};

const CheckoutTrialFinal: React.FC = () => {
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  const handleSuccess = (result: any) => {
    console.log('✅ Checkout finalizado:', result);
    setSubscriptionData(result);
    setCheckoutCompleted(true);
  };

  if (checkoutCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-white shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">
                Pagamento Realizado com Sucesso!
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Sua assinatura foi criada e está ativa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Detalhes da Assinatura */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Detalhes da Assinatura:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cliente:</span>
                    <span className="font-medium">{subscriptionData?.customer?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assinatura ID:</span>
                    <span className="font-mono text-xs">{subscriptionData?.subscription?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium text-green-600">
                      {subscriptionData?.subscription?.status === 'trialing' ? 'Em Trial' : 'Ativo'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trial termina em:</span>
                    <span className="font-medium">
                      {new Date(subscriptionData?.trialEndDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Próxima cobrança:</span>
                    <span className="font-medium">
                      {new Date(subscriptionData?.nextBillingDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fluxo de Pagamento */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Fluxo de Pagamento:</h3>
                <div className="space-y-2 text-sm">
                  {subscriptionData?.billing_flow && Object.entries(subscriptionData.billing_flow).map(([key, value]) => (
                    <div key={key} className="flex items-start space-x-2">
                      <span className="text-blue-600 font-medium">{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Próximos Passos */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Próximos Passos:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <Clock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>Aproveite 3 dias de trial gratuito</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Repeat className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>Após o trial, R$ 29,90/mês será cobrado automaticamente</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>Você pode cancelar a qualquer momento</span>
                  </li>
                </ul>
              </div>

              {/* Botão de Ação */}
              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full h-12 text-lg font-semibold"
              >
                Ir para o Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Checkout Final - Vendzz
          </h1>
          <p className="text-lg text-gray-600">
            Sistema completo de trial + recorrência automática
          </p>
        </div>

        {/* Plano */}
        <Card className="mb-8 border-blue-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800">
              Plano Vendzz Premium
            </CardTitle>
            <CardDescription>
              Plano completo com todos os recursos da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Taxa de Ativação:</span>
                <span className="text-2xl font-bold text-green-600">R$ 1,00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Trial Gratuito:</span>
                <span className="text-xl font-bold text-blue-600">3 dias</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Depois do Trial:</span>
                <span className="text-xl font-bold text-purple-600">R$ 29,90/mês</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Características */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-800">Seguro</h3>
              <p className="text-sm text-green-700">Dados protegidos pelo Stripe</p>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-800">Automático</h3>
              <p className="text-sm text-blue-700">Cobrança automática após trial</p>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-800">Flexível</h3>
              <p className="text-sm text-purple-700">Cancele a qualquer momento</p>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de Checkout */}
        <Card className="border-gray-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">
              Dados para Pagamento
            </CardTitle>
            <CardDescription>
              Preencha os dados abaixo para finalizar sua assinatura
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!STRIPE_PUBLIC_KEY ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Stripe não configurado. Configure VITE_STRIPE_PUBLIC_KEY nas variáveis de ambiente.
                </AlertDescription>
              </Alert>
            ) : (
              <Elements stripe={stripePromise}>
                <CheckoutForm onSuccess={handleSuccess} />
              </Elements>
            )}
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Ao confirmar o pagamento, você concorda com nossos{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Termos de Uso
            </a>{' '}
            e{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutTrialFinal;