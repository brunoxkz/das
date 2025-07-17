import React, { useState, useEffect } from 'react';
// Stripe.js desabilitado para evitar erros CSP
// import { loadStripe } from '@stripe/stripe-js';
// Stripe Elements desabilitado para evitar erros CSP
// import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, CreditCard, Shield, Clock, Repeat, AlertCircle, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';

// Stripe public key - sistema otimizado
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// Stripe.js desabilitado para evitar erros CSP
const stripePromise = Promise.resolve(null);

// Configuração otimizada dos elementos Stripe
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
    },
    invalid: {
      color: '#dc2626',
    },
    complete: {
      color: '#059669',
    },
  },
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
  const [customerPhone, setCustomerPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveCard, setSaveCard] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements || !acceptedTerms) {
      toast({
        title: "Erro",
        description: "Por favor, aceite os termos e condições",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Criar flow completo de trial
      const response = await apiRequest('POST', '/api/stripe/create-trial-flow', {
        customerName,
        customerEmail,
        customerPhone,
        saveCard,
        trialAmount: 100, // R$ 1,00 em centavos
        recurringAmount: 2990, // R$ 29,90 em centavos
        trialDays: 3,
        currency: 'brl'
      });

      if (response.success) {
        const { clientSecret } = response.data;
        
        // Confirmar pagamento
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardNumberElement)!,
            billing_details: {
              name: customerName,
              email: customerEmail,
              phone: customerPhone,
            },
          },
          setup_future_usage: saveCard ? 'off_session' : undefined,
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        onSuccess(result);
      } else {
        throw new Error(response.message || 'Erro ao processar pagamento');
      }
    } catch (error: any) {
      toast({
        title: "Erro no pagamento",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações do Cliente */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="name">Nome Completo</Label>
          <Input
            id="name"
            type="text"
            placeholder="Seu nome completo"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            required
            className="mt-1"
          />
        </div>
      </div>

      {/* Informações do Cartão */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Informações do Cartão</Label>
        
        <div className="border rounded-lg p-4 space-y-4">
          <div>
            <Label htmlFor="cardNumber">Número do Cartão</Label>
            <div className="mt-1 border rounded-md p-3">
              <CardNumberElement 
                options={stripeElementOptions} 
                className="StripeElement"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cardExpiry">Validade</Label>
              <div className="mt-1 border rounded-md p-3">
                <CardExpiryElement 
                  options={stripeElementOptions} 
                  className="StripeElement"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="cardCvc">CVC</Label>
              <div className="mt-1 border rounded-md p-3">
                <CardCvcElement 
                  options={stripeElementOptions} 
                  className="StripeElement"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Opção de Salvar Cartão */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="saveCard"
          checked={saveCard}
          onChange={(e) => setSaveCard(e.target.checked)}
          className="rounded border-gray-300"
        />
        <Label htmlFor="saveCard" className="text-sm">
          Salvar cartão para pagamentos futuros
        </Label>
      </div>

      {/* Termos e Condições */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="terms"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="rounded border-gray-300"
          required
        />
        <Label htmlFor="terms" className="text-sm">
          Aceito os termos e condições
        </Label>
      </div>

      {/* Botão de Pagamento */}
      <Button
        type="submit"
        disabled={!stripe || isLoading || !acceptedTerms}
        className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Processando...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Ativar Trial R$ 1,00</span>
          </div>
        )}
      </Button>
    </form>
  );
};

const CheckoutTrialPerfect: React.FC = () => {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const { toast } = useToast();

  const handlePaymentSuccess = (result: any) => {
    setPaymentResult(result);
    setPaymentSuccess(true);
    
    toast({
      title: "Pagamento Realizado!",
      description: "Seu trial foi ativado com sucesso. Agora você tem acesso completo!",
      variant: "default",
    });
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
        <div className="max-w-2xl mx-auto py-12">
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">
                Trial Ativado com Sucesso!
              </CardTitle>
              <CardDescription className="text-green-600 text-base">
                Seu pagamento foi processado e o trial está ativo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">
                  Próximos Passos:
                </h3>
                <ul className="text-green-700 space-y-2">
                  <li>• Trial de 3 dias por R$ 1,00 ✓</li>
                  <li>• Acesso completo à plataforma ✓</li>
                  <li>• Cartão salvo para cobrança automática ✓</li>
                  <li>• Após 3 dias: R$ 29,90/mês automaticamente</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Ir para Dashboard
                </Button>
                <Button 
                  onClick={() => window.location.href = '/subscriptions-manager'}
                  variant="outline"
                  className="flex-1"
                >
                  Gerenciar Assinatura
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna Esquerda - Informações do Plano */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <Badge className="mb-4 bg-green-600 text-white">
                Oferta Especial
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Trial Vendzz Premium
              </h1>
              <p className="text-gray-600 text-lg">
                Comece agora por apenas R$ 1,00 e tenha acesso completo por 3 dias
              </p>
            </div>

            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  <span>Plano Premium</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">R$ 1,00</div>
                  <div className="text-sm text-gray-500">por 3 dias</div>
                  <div className="text-lg text-gray-700 mt-2">
                    Depois R$ 29,90/mês
                  </div>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Quizzes ilimitados</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Campanhas SMS/Email/WhatsApp</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Analytics avançados</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Suporte prioritário</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Alert>
              <Shield className="w-4 h-4" />
              <AlertDescription>
                <strong>Segurança Garantida:</strong> Pagamento 100% seguro com criptografia SSL. 
                Cancele a qualquer momento sem taxas.
              </AlertDescription>
            </Alert>
          </div>

          {/* Coluna Direita - Formulário de Checkout */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Finalizar Compra</span>
                </CardTitle>
                <CardDescription>
                  Preencha seus dados para ativar o trial
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!STRIPE_PUBLIC_KEY ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Stripe não configurado. Configure as chaves nas variáveis de ambiente.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Elements stripe={stripePromise}>
                    <CheckoutForm onSuccess={handlePaymentSuccess} />
                  </Elements>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutTrialPerfect;