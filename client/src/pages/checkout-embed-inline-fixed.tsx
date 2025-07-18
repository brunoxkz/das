import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Phone, Mail, User, Shield, CheckCircle } from 'lucide-react';

const stripePromise = loadStripe('pk_test_51RjvV9HK6al3veW1tLnPzQNrT4CJSQ8J3NdmEoWZNqPKqvMZZb5yBnDxGVvvqVJJVVdULJo3oSqJqcCKDDj8b9s400D7TlvCbx');

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const { toast } = useToast();

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

    if (!customerData.name || !customerData.email || !customerData.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Confirmar pagamento
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
          receipt_email: customerData.email,
        },
      });

      if (error) {
        toast({
          title: "Erro no pagamento",
          description: error.message || "Erro ao processar pagamento",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Pagamento processado!",
          description: "Redirecionando para confirmação...",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no pagamento",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <Card className="border-2 border-green-200">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-green-800">
            Vendzz Pro - Pagamento Inline
          </CardTitle>
          <CardDescription className="text-gray-600">
            Plataforma completa de quiz funnels e marketing digital
          </CardDescription>
          
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CreditCard className="w-4 h-4 mr-1" />
              R$ 1,00 ativação
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Shield className="w-4 h-4 mr-1" />
              3 dias trial
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <CheckCircle className="w-4 h-4 mr-1" />
              R$ 29,90/mês
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações do cliente */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                Suas informações
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Nome completo *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    className="mt-1 border-gray-300 focus:border-green-500"
                    value={customerData.name}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Telefone *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    className="mt-1 border-gray-300 focus:border-green-500"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="mt-1 border-gray-300 focus:border-green-500"
                  value={customerData.email}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <Separator />

            {/* Elemento de pagamento Stripe */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                Dados do pagamento
              </h3>
              
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <PaymentElement 
                  options={{
                    layout: 'tabs',
                  }}
                />
              </div>
            </div>

            <Separator />

            {/* Resumo do plano */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Resumo do plano:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Taxa de ativação:</span>
                  <span className="font-semibold">R$ 1,00</span>
                </div>
                <div className="flex justify-between">
                  <span>Trial gratuito:</span>
                  <span className="font-semibold text-green-600">3 dias</span>
                </div>
                <div className="flex justify-between">
                  <span>Após o trial:</span>
                  <span className="font-semibold">R$ 29,90/mês</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-green-800">
                  <span>Total hoje:</span>
                  <span>R$ 1,00</span>
                </div>
              </div>
            </div>

            {/* Botão de pagamento */}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-lg"
              disabled={!stripe || loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processando pagamento...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Pagar R$ 1,00 e ativar assinatura
                </div>
              )}
            </Button>

            {/* Informações de segurança */}
            <div className="text-center text-sm text-gray-500 space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Pagamento seguro processado pelo Stripe</span>
              </div>
              <p>Seus dados estão protegidos com criptografia SSL</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutEmbedInlineFixed() {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/public/checkout/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: 1.00,
            currency: 'BRL',
            planName: 'Vendzz Pro',
          }),
        });

        const data = await response.json();
        
        if (data.success && data.clientSecret) {
          setClientSecret(data.clientSecret);
        }
      } catch (error) {
        console.error('Erro ao criar Payment Intent:', error);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando checkout...</p>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erro ao carregar checkout. Tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Elements 
        stripe={stripePromise} 
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#16a34a',
            },
          },
        }}
      >
        <CheckoutForm />
      </Elements>
    </div>
  );
}