import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, CreditCard, Shield, Clock } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51RjvV9HK6al3veW1pEfLvNULBNQJjbJmZBuOBPxhw4qzqTDJHhCBdVUf3AJ6mPZvhHCk8WK9f5aGnmhKQZ8Y00gLhVjdGx');

interface CheckoutFormProps {
  plan: any;
  onSuccess: (result: any) => void;
}

function CheckoutForm({ plan, onSuccess }: CheckoutFormProps) {
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

    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // Criar checkout session
      const response = await fetch('/api/public/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          customerName: customerData.name,
          customerEmail: customerData.email,
          customerPhone: customerData.phone,
          returnUrl: window.location.origin + '/checkout/success',
          cancelUrl: window.location.href
        }),
      });

      const session = await response.json();

      if (session.success) {
        // Redirecionar para Stripe Checkout
        const result = await stripe.redirectToCheckout({
          sessionId: session.sessionId
        });

        if (result.error) {
          toast({
            title: "Erro no pagamento",
            description: result.error.message,
            variant: "destructive",
          });
        }
      } else {
        throw new Error(session.message || 'Erro ao criar sessão de pagamento');
      }
    } catch (error) {
      toast({
        title: "Erro no pagamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            type="text"
            value={customerData.name}
            onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Digite seu nome completo"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={customerData.email}
            onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
            required
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            type="tel"
            value={customerData.phone}
            onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
      >
        {loading ? 'Processando...' : `Pagar R$ ${plan?.trial_price?.toFixed(2) || '1,00'}`}
      </Button>
    </form>
  );
}

export default function PublicCheckout() {
  const params = useParams();
  const planId = params.planId;
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (planId) {
      fetchPlan();
    }
  }, [planId]);

  const fetchPlan = async () => {
    try {
      const response = await fetch(`/api/public/plans/${planId}`);
      const data = await response.json();
      
      if (data.success) {
        setPlan(data.plan);
      } else {
        toast({
          title: "Plano não encontrado",
          description: "O plano solicitado não existe ou foi removido.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar plano",
        description: "Não foi possível carregar os dados do plano.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando plano...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Plano não encontrado</h2>
            <p className="text-gray-600">O plano solicitado não existe ou foi removido.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Pagamento realizado!</h2>
            <p className="text-gray-600">Seu pagamento foi processado com sucesso. Você receberá um email de confirmação em breve.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Finalizar Compra</h1>
            <p className="text-gray-600">Complete seu pagamento de forma segura</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Informações do Plano */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{plan.name}</h3>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Taxa de ativação:</span>
                    <span className="font-semibold">R$ {plan.trial_price?.toFixed(2) || '1,00'}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Trial gratuito:</span>
                    <span className="font-semibold">{plan.trial_days || 3} dias</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-gray-600">Após o trial:</span>
                    <span className="font-semibold">R$ {plan.price?.toFixed(2) || '29,90'}/mês</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>Pagamento 100% seguro</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Cancele a qualquer momento</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard className="w-4 h-4" />
                    <span>Cartão salvo para renovação</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formulário de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Dados para Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise}>
                  <CheckoutForm plan={plan} onSuccess={setSuccess} />
                </Elements>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}