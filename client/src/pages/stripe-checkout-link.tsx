import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, CheckCircle, AlertCircle, Clock, DollarSign, ExternalLink } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Configuração do Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface CheckoutLinkConfig {
  name: string;
  description: string;
  immediateAmount: number;
  trialDays: number;
  recurringAmount: number;
  currency: string;
  userId: string;
}

interface CheckoutLinkData {
  success: boolean;
  valid: boolean;
  config: CheckoutLinkConfig;
  error?: string;
}

interface CheckoutSessionData {
  success: boolean;
  clientSecret: string;
  customerId: string;
  productId: string;
  subscriptionPriceId: string;
  setupIntentId: string;
  message: string;
}

interface PaymentResult {
  success: boolean;
  invoiceId: string;
  subscriptionId: string;
  immediateChargeStatus: string;
  trialEndDate: string;
  message: string;
}

// Componente do formulário de pagamento
const PaymentForm: React.FC<{
  clientSecret: string;
  setupIntentId: string;
  config: CheckoutLinkConfig;
  onPaymentSuccess: (result: PaymentResult) => void;
}> = ({ clientSecret, setupIntentId, config, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element não encontrado');
      }

      // 1. Confirmar setup intent (salvar cartão)
      const { setupIntent, error } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // 2. Processar pagamento no backend
      const response = await fetch('/api/stripe/process-elements-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setupIntentId: setupIntent.id,
        }),
      });

      const paymentResult = await response.json();

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Falha ao processar pagamento');
      }

      onPaymentSuccess(paymentResult);

      toast({
        title: "Pagamento Processado!",
        description: "Cobrança imediata realizada e assinatura criada com sucesso",
      });

    } catch (error) {
      console.error('Erro no pagamento:', error);
      toast({
        title: "Erro no Pagamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-700 rounded-lg">
        <Label className="text-white mb-2 block">Dados do Cartão</Label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#ffffff',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#fa755a',
              },
            },
          }}
          className="p-3"
        />
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3"
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processando Pagamento...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Pagar R${config.immediateAmount.toFixed(2)} e Criar Assinatura
          </div>
        )}
      </Button>
    </form>
  );
};

// Componente principal
export default function StripeCheckoutLink() {
  const { linkId } = useParams<{ linkId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Estados do componente
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkData, setLinkData] = useState<CheckoutLinkConfig | null>(null);
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSessionData | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Extrair token da URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  // Validar link ao carregar
  useEffect(() => {
    if (!linkId || !token) {
      setError('Link ou token inválido');
      setLoading(false);
      return;
    }

    validateCheckoutLink();
  }, [linkId, token]);

  const validateCheckoutLink = async () => {
    try {
      const response = await fetch(`/api/stripe/validate-checkout-link/${linkId}?token=${token}`);
      const data: CheckoutLinkData = await response.json();

      if (!data.success || !data.valid) {
        setError(data.error || 'Link inválido ou expirado');
        return;
      }

      setLinkData(data.config);
    } catch (error) {
      setError('Erro ao validar link');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCheckoutSession = async () => {
    if (!linkId || !token || !customerEmail) {
      toast({
        title: "Erro",
        description: "Email obrigatório para continuar",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/stripe/process-checkout-link/${linkId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          customerEmail,
          customerName,
        }),
      });

      const data: CheckoutSessionData = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Falha ao criar sessão de checkout');
      }

      setCheckoutSession(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (result: PaymentResult) => {
    setPaymentResult(result);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Carregando checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-white">Link Inválido</CardTitle>
            <CardDescription className="text-gray-400">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => window.close()}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white"
            >
              Fechar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Exibir resultado do pagamento
  if (paymentResult) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-white">Pagamento Realizado!</CardTitle>
            <CardDescription className="text-gray-400">
              Sua assinatura foi criada com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Detalhes da Assinatura:</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div>Status: {paymentResult.immediateChargeStatus}</div>
                <div>Invoice: {paymentResult.invoiceId}</div>
                <div>Subscription: {paymentResult.subscriptionId}</div>
                <div>Trial até: {new Date(paymentResult.trialEndDate).toLocaleDateString('pt-BR')}</div>
              </div>
            </div>
            
            <Button
              onClick={() => window.close()}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Concluir
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Exibir checkout session
  if (checkoutSession) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <CreditCard className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <CardTitle className="text-white">Finalizar Pagamento</CardTitle>
            <CardDescription className="text-gray-400">
              {linkData?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise}>
              <PaymentForm
                clientSecret={checkoutSession.clientSecret}
                setupIntentId={checkoutSession.setupIntentId}
                config={linkData!}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </Elements>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Exibir formulário de dados do cliente
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <DollarSign className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-white">{linkData?.name}</CardTitle>
          <CardDescription className="text-gray-400">
            {linkData?.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pricing Info */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Plano de Pagamento:</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Taxa de ativação:</span>
                <span className="text-green-400 font-semibold">R$ {linkData?.immediateAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Trial gratuito:</span>
                <span className="text-blue-400">{linkData?.trialDays} dias</span>
              </div>
              <div className="flex justify-between">
                <span>Após trial:</span>
                <span className="text-yellow-400">R$ {linkData?.recurringAmount.toFixed(2)}/mês</span>
              </div>
            </div>
          </div>

          {/* Customer Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Email *</Label>
              <Input
                id="email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="name" className="text-white">Nome (opcional)</Label>
              <Input
                id="name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Seu nome"
              />
            </div>
          </div>

          <Button
            onClick={handleCreateCheckoutSession}
            disabled={!customerEmail || loading}
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Criando Checkout...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Continuar para Pagamento
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}