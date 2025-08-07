import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Lock, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Estilos para o Stripe Elements
const CARD_ELEMENT_OPTIONS = {
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
};

interface CheckoutSubscriptionProps {
  onSuccess?: (subscriptionId: string) => void;
  onCancel?: () => void;
}

export default function CheckoutSubscription({ onSuccess, onCancel }: CheckoutSubscriptionProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const [customerData, setCustomerData] = useState({
    email: '',
    name: '',
  });
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Query para buscar dados do usuário logado
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/verify'],
    retry: false,
  });

  // Pré-preencher os campos com dados do usuário
  useEffect(() => {
    if (userData && (userData as any).user) {
      const user = (userData as any).user;
      setCustomerData({
        email: user.email || '',
        name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email?.split('@')[0] || '',
      });
    }
  }, [userData]);

  // Mutation para processar assinatura paga
  const subscriptionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/assinatura-paga', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Assinatura Criada com Sucesso!",
        description: `Taxa de ativação cobrada. Trial de 3 dias iniciado. ID: ${data.subscription.id}`,
        variant: "default",
      });
      
      setCurrentStep(3);
      
      if (onSuccess) {
        onSuccess(data.subscription.id);
      }
    },
    onError: (error: any) => {
      console.error('Erro na assinatura:', error);
      toast({
        title: "Erro na Assinatura",
        description: error.message || "Ocorreu um erro ao processar sua assinatura",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Erro",
        description: "Stripe não carregado. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    if (!customerData.email || !customerData.name) {
      toast({
        title: "Dados Incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setCurrentStep(2);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element não encontrado');
      }

      // Criar payment method com Stripe Elements
      const { error: paymentError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: customerData.email,
          name: customerData.name,
        },
      });

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      if (!paymentMethod) {
        throw new Error('Falha ao criar método de pagamento');
      }

      // Enviar para o backend
      await subscriptionMutation.mutateAsync({
        payment_method_id: paymentMethod.id,
        customer_email: customerData.email,
        customer_name: customerData.name,
      });

    } catch (error: any) {
      console.error('Erro no processo de pagamento:', error);
      toast({
        title: "Erro no Pagamento",
        description: error.message || "Erro ao processar pagamento",
        variant: "destructive",
      });
      setCurrentStep(1);
    } finally {
      setProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados do Cliente */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Dados do Cliente</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
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
                
                <div>
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
              </div>
            </div>

            <Separator />

            {/* Dados do Cartão */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Dados do Cartão</h3>
              </div>
              
              <div className="p-4 border rounded-lg">
                <CardElement options={CARD_ELEMENT_OPTIONS} />
              </div>
              
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Seus dados estão protegidos com criptografia SSL</span>
              </div>
            </div>

            <Separator />

            {/* Resumo da Cobrança */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resumo da Cobrança</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Taxa de Ativação (hoje)
                  </span>
                  <span className="font-bold text-green-600">R$ 1,00</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Trial Gratuito
                  </span>
                  <Badge variant="secondary">3 dias</Badge>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Após trial (mensal)
                  </span>
                  <span className="font-bold">R$ 29,90/mês</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Cobrança única de R$ 1,00 para ativação</p>
                <p>• 3 dias de trial gratuito</p>
                <p>• Após trial: R$ 29,90/mês (pode cancelar a qualquer momento)</p>
                <p>• Seu cartão será salvo para cobranças futuras</p>
              </div>
            </div>

            {/* Botão de Envio */}
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!stripe || processing}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pagar R$ 1,00 e Iniciar Trial
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={onCancel}
              >
                Cancelar
              </Button>
            )}
          </form>
        );

      case 2:
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Loader2 className="h-16 w-16 text-green-600 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold">Processando Pagamento...</h3>
            <p className="text-gray-600">
              Aguarde enquanto processamos sua assinatura e taxa de ativação.
            </p>
            <Progress value={66} className="w-full" />
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-600">
              Assinatura Criada com Sucesso!
            </h3>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 font-medium">✅ Taxa de ativação de R$ 1,00 cobrada</p>
                <p className="text-green-800 font-medium">✅ Trial de 3 dias iniciado</p>
                <p className="text-green-800 font-medium">✅ Cartão salvo para cobranças futuras</p>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Você receberá um email de confirmação em breve.</p>
                <p>A primeira cobrança de R$ 29,90 será feita após o trial.</p>
              </div>
            </div>
            <Progress value={100} className="w-full" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-green-600" />
            Assinatura Premium
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-green-600' : 'bg-gray-300'}`} />
              Dados
            </span>
            <span className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-green-600' : 'bg-gray-300'}`} />
              Pagamento
            </span>
            <span className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${currentStep >= 3 ? 'bg-green-600' : 'bg-gray-300'}`} />
              Confirmação
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  );
}