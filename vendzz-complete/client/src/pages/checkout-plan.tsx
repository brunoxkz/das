import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Phone, Mail, User, Shield, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const CheckoutFormForPlan = ({ planId }: { planId: string }) => {
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const { toast } = useToast();

  // Buscar dados do plano - usando o mesmo endpoint que funcionava no checkout-embed
  const { data: plan, isLoading: planLoading } = useQuery({
    queryKey: ['/api/stripe/plans', planId],
    enabled: !!planId,
  });

  const handlePayment = async () => {
    try {
      // Usar o sistema de checkout que funcionava antes
      const response = await fetch('/api/stripe/simple-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: planId,
          planName: plan?.name || 'Vendzz Pro',
          customerEmail: customerData.email,
          customerName: customerData.name,
          trialAmount: plan?.trial_price || 1.00,
          trialDays: plan?.trial_days || 3,
          recurringAmount: plan?.price || 29.90,
          currency: 'BRL'
        }),
      });

      const data = await response.json();
      
      if (data.success && data.checkoutUrl) {
        toast({
          title: "Checkout criado com sucesso!",
          description: "Redirecionando para o pagamento...",
          variant: "default",
        });
        
        // Redirecionar para o checkout do Stripe
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: "Erro no checkout",
          description: data.message || "Erro ao criar checkout",
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

  if (planLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando plano...</p>
        </div>
      </div>
    );
  }

  if (!plan && !planLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-2xl mx-auto p-6">
        <Card className="border-2 border-green-200">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-green-800">
              {plan.name}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {plan.description || 'Plataforma completa de quiz funnels e marketing digital'}
            </CardDescription>
            
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CreditCard className="w-4 h-4 mr-1" />
                R$ {(plan.trial_price || 1.00).toFixed(2)} ativação
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Shield className="w-4 h-4 mr-1" />
                {plan.trial_days || 3} dias trial
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <CheckCircle className="w-4 h-4 mr-1" />
                R$ {(plan.price || 29.90).toFixed(2)}/mês
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

              {/* Informações do pagamento */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Fluxo de Pagamento Seguro
                </h3>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    ✅ <strong>Etapa 1:</strong> Você pagará R$ {(plan.trial_price || 1.00).toFixed(2)} para validar seu cartão<br/>
                    ✅ <strong>Etapa 2:</strong> Acesso imediato com {plan.trial_days || 3} dias de trial gratuito<br/>
                    ✅ <strong>Etapa 3:</strong> Após o trial, R$ {(plan.price || 29.90).toFixed(2)}/mês automaticamente<br/>
                    🔒 <strong>Segurança:</strong> Certificado SSL e proteção Stripe
                  </p>
                </div>
              </div>

              <Separator />

              {/* Resumo do plano */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Resumo do plano:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Taxa de ativação:</span>
                    <span className="font-semibold">R$ {(plan.trial_price || 1.00).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trial gratuito:</span>
                    <span className="font-semibold text-green-600">{plan.trial_days || 3} dias</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Após o trial:</span>
                    <span className="font-semibold">R$ {(plan.price || 29.90).toFixed(2)}/mês</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-green-800">
                    <span>Total hoje:</span>
                    <span>R$ {(plan.trial_price || 1.00).toFixed(2)}</span>
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
                    Iniciar Checkout → R$ {(plan.trial_price || 1.00).toFixed(2)} + Trial
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

export default function CheckoutPlan() {
  const [, params] = useRoute('/checkout/:planId');
  const planId = params?.planId;

  if (!planId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Plano não especificado</h2>
            <p className="text-gray-600">Por favor, especifique um plano válido.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <CheckoutFormForPlan planId={planId} />;
}