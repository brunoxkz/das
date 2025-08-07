import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  CheckCircle, 
  Shield, 
  Clock, 
  CreditCard, 
  Star,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  trial_days: number;
  trial_price: number;
  features?: string[];
}

const CheckoutPublico: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const [, setLocation] = useLocation();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (planId) {
      fetchPlan();
    }
  }, [planId]);

  const fetchPlan = async () => {
    try {
      const response = await apiRequest('GET', `/api/stripe/plans/${planId}`);
      setPlan(response);
    } catch (error) {
      console.error('Erro ao buscar plano:', error);
      toast({
        title: "Erro",
        description: "Plano não encontrado ou não disponível.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!plan) return;

    if (!customerData.name || !customerData.email) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha nome e email.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    
    try {
      const response = await apiRequest('POST', '/api/stripe/create-checkout-session', {
        planId: plan.id,
        customerEmail: customerData.email,
        customerName: customerData.name,
        successUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/payment-cancel`
      });

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        throw new Error('URL de checkout não retornada');
      }
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      toast({
        title: "Erro no checkout",
        description: "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando plano...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 mb-4">
              <Shield className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-bold mb-2">Plano não encontrado</h2>
            <p className="text-gray-600">O plano solicitado não está disponível.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {plan.name}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {plan.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Informações do Plano */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Detalhes do Plano
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Preço */}
                <div className="text-center p-6 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg">
                  <div className="text-3xl font-bold mb-2">
                    R$ {plan.trial_price.toFixed(2)}
                  </div>
                  <div className="text-lg opacity-90">
                    por {plan.trial_days} dias
                  </div>
                  <Separator className="my-4 bg-white/20" />
                  <div className="text-sm opacity-80">
                    Depois R$ {plan.price.toFixed(2)}/{plan.interval === 'month' ? 'mês' : 'ano'}
                  </div>
                </div>

                {/* Benefícios */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Teste gratuito por {plan.trial_days} dias</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Cancele a qualquer momento</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Acesso completo a todas as funcionalidades</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Suporte 24/7</span>
                  </div>
                </div>

                {/* Garantias */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Garantias</span>
                  </div>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Pagamento 100% seguro</li>
                    <li>• Seus dados protegidos</li>
                    <li>• Garantia de 30 dias</li>
                  </ul>
                </div>

              </CardContent>
            </Card>

            {/* Formulário de Checkout */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Finalizar Compra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleCheckout(); }} className="space-y-4">
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={customerData.name}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone (opcional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <Separator className="my-6" />

                  {/* Resumo do Pedido */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-3">Resumo do Pedido</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Teste por {plan.trial_days} dias</span>
                        <span>R$ {plan.trial_price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Renovação {plan.interval === 'month' ? 'mensal' : 'anual'}</span>
                        <span>R$ {plan.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Iniciar Teste Grátis
                      </>
                    )}
                  </Button>

                  <div className="text-xs text-gray-500 text-center">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Você será redirecionado para o checkout seguro do Stripe
                  </div>

                </form>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPublico;