import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CreditCard, Shield, Clock, User, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Configurar Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51RjvV9HK6al3veW1YJvFPzLq5RZWrMRFSGrYTm5Yqrc9HvnPLEMqT7IlxYYNXsqHhpjjg2cCaBZjm8bJOGMx00kCpzavcL');

// Componente de checkout usando Stripe Elements
function CheckoutForm({ plan }: { plan: any }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !email) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Obter elemento do cartão
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Elemento do cartão não encontrado');
      }

      // Criar método de pagamento
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: email,
        },
      });

      if (methodError) {
        throw new Error(methodError.message);
      }

      // Processar pagamento via API usando endpoint público
      const response = await apiRequest('POST', '/api/stripe/simple-trial-public', {
        paymentMethodId: paymentMethod!.id,
        planId: plan.id,
        email: email,
        name: 'Cliente Vendzz',
        metadata: {
          plan_name: plan.name,
          source: 'checkout_embed'
        }
      });

      if (response.success) {
        toast({
          title: "Pagamento processado!",
          description: `Sua assinatura foi criada com sucesso. Trial de ${plan.trial_days || 3} dias iniciado.`,
          variant: "default",
        });
        
        // Redirecionar para página de sucesso
        window.location.href = '/payment-success';
      } else {
        throw new Error(response.message || 'Erro ao processar pagamento');
      }

    } catch (error: any) {
      console.error('Erro no pagamento:', error);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Erro ao processar pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="seu@email.com"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Cartão de Crédito</label>
        <div className="p-3 border border-gray-300 rounded-md">
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
                invalid: {
                  color: '#9e2146',
                },
              },
              hidePostalCode: true,
            }}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        disabled={loading || !stripe}
      >
        {loading ? 'Processando...' : `Pagar R$ ${(plan.trial_price || 1.00).toFixed(2)} e Iniciar Trial`}
      </Button>
    </form>
  );
}

export default function CheckoutEmbed() {
  const [, params] = useRoute('/checkout-embed/:planId');
  const planId = params?.planId;

  console.log('🔍 DEBUG Frontend - Checkout Embed:', { planId, params });

  const { data: plan, isLoading, error } = useQuery({
    queryKey: [`/api/public/plans/${planId}`],
    enabled: !!planId,
  });

  console.log('🔍 DEBUG Frontend - Query Result:', { plan, isLoading, error });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Plano não encontrado</h2>
            <p className="text-gray-600">O plano solicitado não existe ou foi removido.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center pb-8">
              <div className="mb-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  Oferta Especial
                </Badge>
              </div>
              <CardTitle className="text-3xl font-bold mb-2">{plan.name}</CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                {plan.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              {/* Pricing Section */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      R$ {(plan.trial_price || 1.00).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Hoje</div>
                  </div>
                  <div className="text-gray-400">+</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      R$ {(plan.price || 29.90).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      /mês
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-blue-700">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">
                      {plan.trial_days || 3} dias de trial gratuito após primeiro pagamento
                    </span>
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Includes:</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Quizzes ilimitados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Leads ilimitados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Analytics completo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Integração WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Suporte prioritário</span>
                  </div>
                </div>
              </div>

              {/* Checkout Form */}
              <CheckoutForm plan={plan} />

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Seguro</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    <span>Pagamento protegido</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Garantia 30 dias</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Elements>
  );
}