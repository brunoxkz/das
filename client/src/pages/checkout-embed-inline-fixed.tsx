import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Phone, Mail, User, Shield, CheckCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51RjvV9HK6al3veW1NLGtWPQTaGT5nLFHoSJFYfUAqfKtNhZpxhNQT4jEJwJSqpO1sVrZgfZYE8pzE4YD2mAK4zrM00bNAHaOQE');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!stripe || !elements) {
      toast({
        title: "Erro",
        description: "Stripe ainda não foi carregado",
        variant: "destructive",
      });
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast({
        title: "Erro",
        description: "Elemento do cartão não encontrado",
        variant: "destructive",
      });
      return;
    }

    try {
      // Criar método de pagamento com os dados do cartão
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Processar pagamento com método criado
      const response = await fetch('/api/stripe/process-payment-inline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          customerData,
          amount: 1.00,
          currency: 'BRL',
          planName: 'Vendzz Pro'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Pagamento processado com sucesso!",
          description: `Assinatura ativada! Trial até ${new Date(data.trialEnd).toLocaleDateString('pt-BR')}`,
          variant: "default",
        });
        
        setTimeout(() => {
          window.location.href = '/payment-success';
        }, 2000);
      } else {
        toast({
          title: "Erro no pagamento",
          description: data.message || "Erro ao processar pagamento",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no pagamento",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

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
      // Processar pagamento via API
      await handlePayment();
      
    } catch (error) {
      toast({
        title: "Erro no processamento",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-2xl mx-auto p-6">
        <Card className="border-2 border-green-200">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-green-800">
              Vendzz Pro - Checkout Inline
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

              {/* Informações do cartão */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Informações do cartão
                </h3>
                
                <div className="p-4 border border-gray-300 rounded-lg bg-white">
                  <CardElement 
                    options={{
                      hidePostalCode: true,
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                        invalid: {
                          color: '#9e2146',
                        },
                      },
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
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processando pagamento...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Pagar R$ 1,00 via API
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
    </div>
  );
};

// Componente principal com wrapper Elements
export default function CheckoutEmbedInlineFixed() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}