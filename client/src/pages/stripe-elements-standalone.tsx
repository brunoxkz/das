import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface CheckoutConfig {
  name: string;
  description: string;
  immediateAmount: number;
  trialDays: number;
  recurringAmount: number;
  currency: string;
  layout: 'tabs' | 'accordion' | 'auto';
  appearance: 'default' | 'night' | 'stripe' | 'minimal';
}

const PaymentForm: React.FC<{
  config: CheckoutConfig;
  onPaymentSuccess: (result: any) => void;
}> = ({ config, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      toast({
        title: "Erro",
        description: "Sistema de pagamento não carregado. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      const { error } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        throw error;
      }

      setPaymentStatus('succeeded');
      onPaymentSuccess({ success: true });
      
      toast({
        title: "Pagamento Processado!",
        description: `Cobrança imediata de R$ ${config.immediateAmount.toFixed(2)} realizada. Trial de ${config.trialDays} dias iniciado.`,
      });
    } catch (error: any) {
      setPaymentStatus('failed');
      toast({
        title: "Erro no Pagamento",
        description: error.message || "Erro desconhecido ao processar pagamento",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === 'succeeded') {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Pagamento Aprovado!</h2>
          <p className="text-gray-600">
            Cobrança imediata processada com sucesso. Sua assinatura está ativa com trial de {config.trialDays} dias.
          </p>
        </div>
        <Button onClick={() => window.close()} className="mt-4">
          Fechar
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg">
        <PaymentElement 
          options={{
            layout: config.layout,
            paymentMethodOrder: ['card'],
            fields: {
              billingDetails: {
                name: 'auto',
                email: 'auto',
                phone: 'auto',
                address: 'auto'
              }
            }
          }}
        />
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || !elements || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pagar R$ {config.immediateAmount.toFixed(2)} + Trial {config.trialDays} dias
          </>
        )}
      </Button>

      <div className="text-xs text-gray-500 text-center">
        <p>Após o trial, será cobrado R$ {config.recurringAmount.toFixed(2)}/mês</p>
        <p>Você pode cancelar a qualquer momento</p>
      </div>
    </form>
  );
};

export default function StripeElementsStandalone() {
  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const configParam = urlParams.get('config');
    const clientSecretParam = urlParams.get('clientSecret');

    if (configParam && clientSecretParam) {
      try {
        setConfig(JSON.parse(configParam));
        setClientSecret(clientSecretParam);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Configuração inválida na URL",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handlePaymentSuccess = (result: any) => {
    console.log('Payment successful:', result);
  };

  if (!config || !clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold mb-2">Carregando Checkout...</h2>
          <p className="text-gray-600">Aguarde enquanto preparamos seu pagamento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">{config.name}</h1>
            <p className="text-gray-600">{config.description}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Finalizar Pagamento</CardTitle>
            <CardDescription className="text-center">
              Preencha os dados do seu cartão para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: config.appearance === 'night' ? 'night' : 'stripe',
                  variables: {
                    colorPrimary: '#10b981',
                    colorBackground: '#ffffff',
                    colorText: '#374151',
                    colorDanger: '#ef4444',
                    fontFamily: 'Inter, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px',
                  },
                },
              }}
            >
              <PaymentForm
                config={config}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </Elements>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Pagamento seguro processado pela Stripe</p>
          <p className="mt-1">Seus dados estão protegidos com criptografia SSL</p>
        </div>
      </div>
    </div>
  );
}