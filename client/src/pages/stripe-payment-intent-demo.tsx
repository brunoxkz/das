import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CreditCard, Check, AlertCircle, Loader2 } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51RjvV9HK6al3veW1FPD5bTAHQJq8QRPmgOZJlYVSKsrDzAZxFVLFjRmCWAWdLfyDSASSdVfqN8sQcCUYBLRq5J800bCCNJJhH');

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [customerData, setCustomerData] = useState({
    email: 'admin@vendzz.com',
    name: 'Admin Vendzz',
    immediateAmount: 1,
    trialDays: 3,
    recurringAmount: 29.9,
    recurringInterval: 'monthly'
  });

  const createPaymentIntent = async () => {
    try {
      setIsProcessing(true);
      
      const response = await apiRequest("POST", "/api/stripe/create-payment-intent-subscription", customerData);
      
      if (response.success) {
        setClientSecret(response.clientSecret);
        setPaymentData(response);
        
        toast({
          title: "Payment Intent criado!",
          description: "Agora você pode finalizar o pagamento usando o cartão abaixo.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao criar Payment Intent",
        description: "Tente novamente ou contate o suporte.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    
    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setIsProcessing(false);
      return;
    }

    try {
      // Confirmar pagamento
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerData.name,
            email: customerData.email,
          },
        },
      });

      if (error) {
        toast({
          title: "Erro no pagamento",
          description: error.message,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Criar assinatura após pagamento bem-sucedido
        const subscriptionResponse = await apiRequest("POST", "/api/stripe/create-subscription-after-payment", {
          customerId: paymentData.customerId,
          paymentMethodId: paymentIntent.payment_method,
          subscriptionPriceId: paymentData.subscriptionPriceId,
          trialDays: customerData.trialDays,
        });

        if (subscriptionResponse.success) {
          setPaymentSuccess(true);
          
          toast({
            title: "Pagamento realizado com sucesso!",
            description: `Cobrança imediata: R$ ${customerData.immediateAmount.toFixed(2)}. Trial de ${customerData.trialDays} dias iniciado.`,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erro ao processar pagamento",
        description: "Tente novamente ou contate o suporte.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Pagamento Realizado!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Fluxo Completo Executado:</h3>
            <div className="space-y-2 text-sm text-green-700">
              <p>✅ Cobrança imediata: R$ {customerData.immediateAmount.toFixed(2)}</p>
              <p>✅ Cartão salvo para futuras cobranças</p>
              <p>✅ Trial de {customerData.trialDays} dias iniciado</p>
              <p>✅ Assinatura criada: R$ {customerData.recurringAmount.toFixed(2)}/{customerData.recurringInterval}</p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">Próximos Passos:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Trial gratuito até {new Date(Date.now() + customerData.trialDays * 24 * 60 * 60 * 1000).toLocaleDateString()}</li>
              <li>• Primeira cobrança recorrente automática após o trial</li>
              <li>• Cancele a qualquer momento no painel de controle</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Demonstração Payment Intent + Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuração do Plano */}
        <div className="space-y-4">
          <h3 className="font-semibold">Configuração do Plano</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email do Cliente</Label>
              <Input
                id="email"
                type="email"
                value={customerData.email}
                onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="name">Nome do Cliente</Label>
              <Input
                id="name"
                value={customerData.name}
                onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="immediateAmount">Taxa Imediata (R$)</Label>
              <Input
                id="immediateAmount"
                type="number"
                step="0.01"
                value={customerData.immediateAmount}
                onChange={(e) => setCustomerData({...customerData, immediateAmount: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="trialDays">Trial (dias)</Label>
              <Input
                id="trialDays"
                type="number"
                value={customerData.trialDays}
                onChange={(e) => setCustomerData({...customerData, trialDays: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="recurringAmount">Recorrente (R$)</Label>
              <Input
                id="recurringAmount"
                type="number"
                step="0.01"
                value={customerData.recurringAmount}
                onChange={(e) => setCustomerData({...customerData, recurringAmount: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
        </div>

        {/* Botão para criar Payment Intent */}
        {!clientSecret && (
          <Button
            onClick={createPaymentIntent}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando Payment Intent...
              </div>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Criar Payment Intent
              </>
            )}
          </Button>
        )}

        {/* Formulário de Pagamento */}
        {clientSecret && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Dados do Cartão</Label>
              <div className="mt-2 p-3 border rounded-lg">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Resumo do Pagamento:</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p>🔥 Cobrança imediata: R$ {customerData.immediateAmount.toFixed(2)}</p>
                <p>🎁 Trial gratuito: {customerData.trialDays} dias</p>
                <p>💳 Depois: R$ {customerData.recurringAmount.toFixed(2)}/{customerData.recurringInterval}</p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando pagamento...
                </div>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Finalizar Pagamento
                </>
              )}
            </Button>
          </form>
        )}

        {/* Informações de Teste */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Cartões de Teste:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Sucesso:</strong> 4242 4242 4242 4242</p>
            <p><strong>Falha:</strong> 4000 0000 0000 0002</p>
            <p><strong>CVC:</strong> Qualquer 3 dígitos</p>
            <p><strong>Data:</strong> Qualquer data futura</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function StripePaymentIntentDemo() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demonstração Payment Intent + Subscription
          </h1>
          <p className="text-gray-600">
            Fluxo completo: R$1 imediato → salvar cartão → trial 3 dias → R$29,90/mês
          </p>
        </div>

        <Elements stripe={stripePromise}>
          <PaymentForm />
        </Elements>
      </div>
    </div>
  );
}