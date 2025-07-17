/**
 * CHECKOUT UNIFICADO - STRIPE + PAGAR.ME
 * Permite escolher entre os dois gateways de pagamento
 */

import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
// Stripe.js desabilitado para evitar erros CSP
// import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  CreditCard, 
  Shield, 
  Clock, 
  CheckCircle,
  Loader2,
  DollarSign
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import GatewaySelector from '@/components/GatewaySelector';
import CheckoutSubscription from './checkout-subscription';

// Stripe.js desabilitado para evitar erros CSP
const stripePromise = Promise.resolve(null);

interface CheckoutUnifiedProps {
  onSuccess?: (subscriptionId: string) => void;
  onCancel?: () => void;
}

export default function CheckoutUnified({ onSuccess, onCancel }: CheckoutUnifiedProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGateway, setSelectedGateway] = useState('');
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    document: '',
    phone: '',
    address: {
      street: '',
      street_number: '',
      zipcode: '',
      city: '',
      state: '',
      country: 'BR'
    }
  });
  const [cardData, setCardData] = useState({
    number: '',
    holder_name: '',
    exp_month: '',
    exp_year: '',
    cvv: ''
  });

  // Mutation para Pagar.me
  const pagarmeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/assinatura-pagarme', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Assinatura Pagar.me Criada!",
        description: `Taxa de ativação cobrada. ID: ${data.subscription.id}`,
        variant: "default",
      });
      
      setCurrentStep(4);
      
      if (onSuccess) {
        onSuccess(data.subscription.id);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Assinatura",
        description: error.message || "Erro ao processar pagamento",
        variant: "destructive",
      });
    },
  });

  const handleGatewaySelect = () => {
    if (!selectedGateway) {
      toast({
        title: "Selecione um Gateway",
        description: "Por favor, escolha um método de pagamento",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(2);
  };

  const handleCustomerDataSubmit = () => {
    if (!customerData.name || !customerData.email) {
      toast({
        title: "Dados Incompletos",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (selectedGateway === 'stripe') {
      setCurrentStep(3);
    } else if (selectedGateway === 'pagarme') {
      setCurrentStep(3);
    }
  };

  const handlePagarmeSubmit = () => {
    if (!cardData.number || !cardData.holder_name || !cardData.exp_month || !cardData.exp_year || !cardData.cvv) {
      toast({
        title: "Dados do Cartão Incompletos",
        description: "Por favor, preencha todos os dados do cartão",
        variant: "destructive",
      });
      return;
    }

    pagarmeMutation.mutate({
      cardData,
      customerData
    });
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: 'Gateway', completed: currentStep > 1 },
      { number: 2, title: 'Dados', completed: currentStep > 2 },
      { number: 3, title: 'Pagamento', completed: currentStep > 3 },
      { number: 4, title: 'Confirmação', completed: currentStep > 4 }
    ];

    return (
      <div className="flex items-center justify-center space-x-4 mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${step.completed || currentStep === step.number 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
              }
            `}>
              {step.completed ? <CheckCircle className="w-4 h-4" /> : step.number}
            </div>
            <span className={`ml-2 text-sm ${
              step.completed || currentStep === step.number 
                ? 'text-foreground' 
                : 'text-muted-foreground'
            }`}>
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div className="w-8 h-0.5 bg-muted mx-4" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderStep1 = () => (
    <GatewaySelector
      selectedGateway={selectedGateway}
      onGatewayChange={setSelectedGateway}
      onContinue={handleGatewaySelect}
    />
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Dados Pessoais</span>
        </CardTitle>
        <CardDescription>
          Preencha seus dados para criar a assinatura
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              value={customerData.name}
              onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
              placeholder="João Silva"
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={customerData.email}
              onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
              placeholder="joao@email.com"
            />
          </div>
        </div>

        {selectedGateway === 'pagarme' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="document">CPF/CNPJ *</Label>
                <Input
                  id="document"
                  value={customerData.document}
                  onChange={(e) => setCustomerData({...customerData, document: e.target.value})}
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Endereço</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Input
                    placeholder="Rua"
                    value={customerData.address.street}
                    onChange={(e) => setCustomerData({
                      ...customerData,
                      address: {...customerData.address, street: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Número"
                    value={customerData.address.street_number}
                    onChange={(e) => setCustomerData({
                      ...customerData,
                      address: {...customerData.address, street_number: e.target.value}
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Input
                    placeholder="CEP"
                    value={customerData.address.zipcode}
                    onChange={(e) => setCustomerData({
                      ...customerData,
                      address: {...customerData.address, zipcode: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Cidade"
                    value={customerData.address.city}
                    onChange={(e) => setCustomerData({
                      ...customerData,
                      address: {...customerData.address, city: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Estado"
                    value={customerData.address.state}
                    onChange={(e) => setCustomerData({
                      ...customerData,
                      address: {...customerData.address, state: e.target.value}
                    })}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setCurrentStep(1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={handleCustomerDataSubmit}>
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => {
    if (selectedGateway === 'stripe') {
      return (
        <Elements stripe={stripePromise}>
          <CheckoutSubscription onSuccess={onSuccess} onCancel={() => setCurrentStep(2)} />
        </Elements>
      );
    } else if (selectedGateway === 'pagarme') {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Dados do Cartão - Pagar.me</span>
            </CardTitle>
            <CardDescription>
              Seus dados estão protegidos com criptografia SSL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Número do Cartão *</Label>
              <Input
                id="cardNumber"
                value={cardData.number}
                onChange={(e) => setCardData({...cardData, number: e.target.value})}
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div>
              <Label htmlFor="holderName">Nome no Cartão *</Label>
              <Input
                id="holderName"
                value={cardData.holder_name}
                onChange={(e) => setCardData({...cardData, holder_name: e.target.value})}
                placeholder="João Silva"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="expMonth">Mês *</Label>
                <Input
                  id="expMonth"
                  value={cardData.exp_month}
                  onChange={(e) => setCardData({...cardData, exp_month: e.target.value})}
                  placeholder="12"
                />
              </div>
              <div>
                <Label htmlFor="expYear">Ano *</Label>
                <Input
                  id="expYear"
                  value={cardData.exp_year}
                  onChange={(e) => setCardData({...cardData, exp_year: e.target.value})}
                  placeholder="2025"
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                  placeholder="123"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button 
                onClick={handlePagarmeSubmit}
                disabled={pagarmeMutation.isPending}
              >
                {pagarmeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Finalizar Pagamento
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
  };

  const renderStep4 = () => (
    <Card className="text-center">
      <CardContent className="pt-6">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Assinatura Criada com Sucesso!</h3>
        <p className="text-muted-foreground mb-4">
          Sua assinatura foi processada e está ativa. Você pode começar a usar todos os recursos premium agora.
        </p>
        <div className="flex justify-center space-x-4">
          <Button onClick={onSuccess ? () => onSuccess('') : undefined}>
            Ir para Dashboard
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Fechar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Assinatura Vendzz Premium</h1>
        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            7 dias grátis
          </Badge>
          <Badge variant="secondary">
            <DollarSign className="w-3 h-3 mr-1" />
            R$ 1,00 + R$ 29,90/mês
          </Badge>
        </div>
      </div>

      {renderStepIndicator()}

      <div className="space-y-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>
    </div>
  );
}