import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, CheckCircle, AlertCircle, Clock, DollarSign } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Configuração do Stripe - CORRIGIDO
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface ElementsCheckoutData {
  success: boolean;
  clientSecret: string;
  customerId: string;
  productId: string;
  subscriptionPriceId: string;
  setupIntentId: string;
  message: string;
  billing_flow: {
    step_1: string;
    step_2: string;
    step_3: string;
    step_4: string;
    step_5: string;
  };
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
  onPaymentSuccess: (result: PaymentResult) => void;
}> = ({ clientSecret, setupIntentId, onPaymentSuccess }) => {
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
      const paymentResult = await apiRequest('POST', '/api/stripe/process-elements-payment', {
        setupIntentId: setupIntent.id,
      });

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
            Pagar R$1,00 e Criar Assinatura
          </div>
        )}
      </Button>
    </form>
  );
};

// Componente principal
export default function StripeElementsCheckout() {
  const [formData, setFormData] = useState({
    name: 'Plano Premium - Vendzz',
    description: 'Acesso completo à plataforma com trial de 3 dias',
    immediateAmount: 1.00,
    trialDays: 3,
    recurringAmount: 29.90,
    currency: 'BRL'
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [checkoutData, setCheckoutData] = useState<ElementsCheckoutData | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [linkData, setLinkData] = useState<any>(null);
  const [isLinkMode, setIsLinkMode] = useState(false);
  const { toast } = useToast();

  // Verificar se é um link direto na inicialização
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const linkId = urlParams.get('linkId');
    const token = urlParams.get('token');

    if (linkId && token) {
      setIsLinkMode(true);
      initializeFromLink(linkId, token);
    }
  }, []);

  const initializeFromLink = async (linkId: string, token: string) => {
    setIsCreating(true);
    try {
      // Validar o link primeiro
      const validationResponse = await apiRequest('GET', `/api/stripe/validate-checkout-link/${linkId}?token=${token}`);
      
      if (!validationResponse.success) {
        throw new Error(validationResponse.error || 'Link inválido');
      }

      setLinkData(validationResponse);
      
      // Atualizar dados do formulário com os dados do link
      setFormData({
        name: validationResponse.config.name,
        description: validationResponse.config.description,
        immediateAmount: validationResponse.config.immediateAmount,
        trialDays: validationResponse.config.trialDays,
        recurringAmount: validationResponse.config.recurringAmount,
        currency: validationResponse.config.currency.toUpperCase()
      });

      // Criar checkout automaticamente
      const response = await apiRequest('POST', '/api/stripe/create-elements-checkout', {
        name: validationResponse.config.name,
        description: validationResponse.config.description,
        immediateAmount: validationResponse.config.immediateAmount,
        trialDays: validationResponse.config.trialDays,
        recurringAmount: validationResponse.config.recurringAmount,
        currency: validationResponse.config.currency,
        metadata: {
          source: 'checkout_link',
          linkId: linkId,
        }
      });
      
      setCheckoutData(response);
      
      toast({
        title: "Checkout do Link Carregado!",
        description: "Agora você pode inserir os dados do cartão",
      });
    } catch (error) {
      toast({
        title: "Erro no Link de Checkout",
        description: error.message || "Link inválido ou expirado",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateCheckout = async () => {
    setIsCreating(true);
    try {
      const response = await apiRequest('POST', '/api/stripe/create-elements-checkout', formData);
      setCheckoutData(response);
      
      toast({
        title: "Checkout Criado!",
        description: "Agora você pode inserir os dados do cartão",
      });
    } catch (error) {
      toast({
        title: "Erro ao Criar Checkout",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handlePaymentSuccess = (result: PaymentResult) => {
    setPaymentResult(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Stripe Elements - Checkout Correto
            </h1>
            <p className="text-xl text-gray-300">
              Fluxo: Invoice Item (R$1) → Subscription com Trial (R$29,90/mês)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuração */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  Configuração do Plano
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Nome do Plano</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Taxa Imediata (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.immediateAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, immediateAmount: parseFloat(e.target.value) }))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Dias de Trial</Label>
                    <Input
                      type="number"
                      value={formData.trialDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, trialDays: parseInt(e.target.value) }))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Valor Recorrente (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.recurringAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurringAmount: parseFloat(e.target.value) }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <Button
                  onClick={handleCreateCheckout}
                  disabled={isCreating}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                >
                  {isCreating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Criando Checkout...
                    </div>
                  ) : (
                    'Criar Checkout Elements'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Formulário de Pagamento */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-400" />
                  Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentResult ? (
                  <div className="space-y-4">
                    <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-semibold">Pagamento Realizado!</span>
                      </div>
                      <p className="text-sm text-green-300">{paymentResult.message}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-700 p-3 rounded">
                        <label className="text-xs text-gray-400">Invoice ID</label>
                        <p className="text-sm font-mono text-white">{paymentResult.invoiceId}</p>
                      </div>
                      <div className="bg-gray-700 p-3 rounded">
                        <label className="text-xs text-gray-400">Subscription ID</label>
                        <p className="text-sm font-mono text-white">{paymentResult.subscriptionId}</p>
                      </div>
                      <div className="bg-gray-700 p-3 rounded">
                        <label className="text-xs text-gray-400">Status Cobrança</label>
                        <p className="text-sm font-mono text-white">{paymentResult.immediateChargeStatus}</p>
                      </div>
                      <div className="bg-gray-700 p-3 rounded">
                        <label className="text-xs text-gray-400">Trial Termina Em</label>
                        <p className="text-sm font-mono text-white">{new Date(paymentResult.trialEndDate).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ) : checkoutData ? (
                  <Elements stripe={stripePromise}>
                    <PaymentForm
                      clientSecret={checkoutData.clientSecret}
                      setupIntentId={checkoutData.setupIntentId}
                      onPaymentSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Aguardando criação do checkout...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Fluxo Técnico */}
          {checkoutData && (
            <Card className="bg-gray-800/50 border-gray-700 mt-8">
              <CardHeader>
                <CardTitle className="text-white">Fluxo Técnico Elements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {Object.entries(checkoutData.billing_flow).map(([key, step], index) => (
                    <div key={key} className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-2">{index + 1}</div>
                      <p className="text-sm text-blue-300">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}