import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, CheckCircle, AlertCircle, Clock, DollarSign, Link, Monitor, ExternalLink, Settings } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Configuração do Stripe
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

interface CheckoutConfig {
  name: string;
  description: string;
  immediateAmount: number;
  trialDays: number;
  recurringAmount: number;
  currency: string;
  layout: 'tabs' | 'accordion' | 'auto';
  appearance: 'default' | 'night' | 'stripe' | 'minimal';
}

// Componente do formulário de pagamento
const PaymentForm: React.FC<{
  clientSecret: string;
  setupIntentId: string;
  config: CheckoutConfig;
  onPaymentSuccess: (result: any) => void;
}> = ({ clientSecret, setupIntentId, config, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle');

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

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      // Confirmar setup intent para salvar método de pagamento
      const { setupIntent, error } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required'
      });

      if (error) {
        throw error;
      }

      if (setupIntent?.status === 'succeeded') {
        // Processar pagamento imediato e configurar assinatura
        const paymentResult = await apiRequest('POST', '/api/stripe/process-elements-payment', {
          setupIntentId: setupIntent.id,
          paymentMethodId: setupIntent.payment_method,
          customerId: setupIntent.customer,
          immediateAmount: config.immediateAmount,
          recurringAmount: config.recurringAmount,
          trialDays: config.trialDays,
          currency: config.currency
        });

        if (paymentResult.success) {
          setPaymentStatus('succeeded');
          onPaymentSuccess(paymentResult);
          
          toast({
            title: "Pagamento Processado!",
            description: `Cobrança imediata de R$ ${config.immediateAmount.toFixed(2)} realizada. Trial de ${config.trialDays} dias iniciado.`,
          });
        } else {
          throw new Error(paymentResult.message || 'Erro ao processar pagamento');
        }
      }
    } catch (error: any) {
      setPaymentStatus('failed');
      toast({
        title: "Erro no Pagamento",
        description: error.message || "Erro desconhecido ao processar pagamento",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === 'succeeded') {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold">Pagamento Aprovado!</h3>
        <p className="text-gray-600">
          Cobrança imediata processada com sucesso. Sua assinatura está ativa com trial de {config.trialDays} dias.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg">
        <PaymentElement 
          options={{
            layout: config.layout,
            paymentMethodOrder: ['card', 'ideal', 'sepa_debit'],
            fields: {
              billingDetails: {
                name: 'auto',
                email: 'auto',
                phone: 'auto',
                address: {
                  country: 'auto',
                  line1: 'auto',
                  line2: 'auto',
                  city: 'auto',
                  state: 'auto',
                  postalCode: 'auto'
                }
              }
            }
          }}
        />
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || !elements || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pagar R$ {config.immediateAmount.toFixed(2)} + Trial {config.trialDays} dias
          </>
        )}
      </Button>

      <div className="text-xs text-gray-500 text-center">
        <p>Após o trial, será cobrado R$ {config.recurringAmount.toFixed(2)}/mês</p>
        <p>Você pode cancelar a qualquer momento</p>
      </div>
    </form>
  );
};

export default function StripeElementsCheckout() {
  const [config, setConfig] = useState<CheckoutConfig>({
    name: 'Plano Premium - Vendzz',
    description: 'Acesso completo à plataforma com trial de 3 dias',
    immediateAmount: 1,
    trialDays: 3,
    recurringAmount: 29.9,
    currency: 'BRL',
    layout: 'tabs',
    appearance: 'default'
  });

  const [checkoutData, setCheckoutData] = useState<ElementsCheckoutData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deploymentType, setDeploymentType] = useState<'embed' | 'standalone'>('embed');
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const { toast } = useToast();

  const createElementsCheckout = async () => {
    setIsCreating(true);
    try {
      const response = await apiRequest('POST', '/api/stripe/create-elements-checkout', config);
      
      if (response.success) {
        setCheckoutData(response);
        
        // Gerar URL para página standalone
        if (deploymentType === 'standalone') {
          const params = new URLSearchParams({
            clientSecret: response.clientSecret,
            setupIntentId: response.setupIntentId,
            config: JSON.stringify(config)
          });
          setGeneratedUrl(`${window.location.origin}/stripe-elements-standalone?${params.toString()}`);
        }

        toast({
          title: "Checkout Criado!",
          description: "Stripe Elements configurado com sucesso",
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar checkout",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handlePaymentSuccess = (result: any) => {
    console.log('Payment successful:', result);
    toast({
      title: "Sucesso!",
      description: "Pagamento processado e assinatura ativada",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Checkout Stripe Elements</h1>
        <p className="text-gray-600">
          Configure e personalize seu checkout com Stripe Elements
        </p>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">
            <Settings className="w-4 h-4 mr-2" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="embed">
            <Monitor className="w-4 h-4 mr-2" />
            Embed
          </TabsTrigger>
          <TabsTrigger value="standalone">
            <ExternalLink className="w-4 h-4 mr-2" />
            Página Única
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Checkout</CardTitle>
              <CardDescription>
                Configure os detalhes do seu plano e personalização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Plano</Label>
                  <Input
                    id="name"
                    value={config.name}
                    onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Plano Premium"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={config.description}
                    onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição do plano"
                  />
                </div>

                <div>
                  <Label htmlFor="immediateAmount">Valor Imediato (R$)</Label>
                  <Input
                    id="immediateAmount"
                    type="number"
                    step="0.01"
                    value={config.immediateAmount}
                    onChange={(e) => setConfig(prev => ({ ...prev, immediateAmount: parseFloat(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="trialDays">Dias de Trial</Label>
                  <Input
                    id="trialDays"
                    type="number"
                    value={config.trialDays}
                    onChange={(e) => setConfig(prev => ({ ...prev, trialDays: parseInt(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="recurringAmount">Valor Recorrente (R$)</Label>
                  <Input
                    id="recurringAmount"
                    type="number"
                    step="0.01"
                    value={config.recurringAmount}
                    onChange={(e) => setConfig(prev => ({ ...prev, recurringAmount: parseFloat(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Moeda</Label>
                  <Select value={config.currency} onValueChange={(value) => setConfig(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">BRL (Real)</SelectItem>
                      <SelectItem value="USD">USD (Dólar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="layout">Layout</Label>
                  <Select value={config.layout} onValueChange={(value: any) => setConfig(prev => ({ ...prev, layout: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tabs">Tabs</SelectItem>
                      <SelectItem value="accordion">Accordion</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="appearance">Aparência</Label>
                  <Select value={config.appearance} onValueChange={(value: any) => setConfig(prev => ({ ...prev, appearance: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Padrão</SelectItem>
                      <SelectItem value="night">Noturno</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Tipo de Implementação</Label>
                <div className="flex space-x-4">
                  <Button 
                    variant={deploymentType === 'embed' ? 'default' : 'outline'}
                    onClick={() => setDeploymentType('embed')}
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Embed
                  </Button>
                  <Button 
                    variant={deploymentType === 'standalone' ? 'default' : 'outline'}
                    onClick={() => setDeploymentType('standalone')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Página Única
                  </Button>
                </div>
              </div>

              <Button 
                onClick={createElementsCheckout}
                disabled={isCreating}
                className="w-full"
                size="lg"
              >
                {isCreating ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Criando Checkout...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Criar Stripe Elements Checkout
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed">
          <Card>
            <CardHeader>
              <CardTitle>Checkout Embed</CardTitle>
              <CardDescription>
                Checkout integrado diretamente na página
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkoutData && deploymentType === 'embed' ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: checkoutData.clientSecret,
                    appearance: {
                      theme: config.appearance === 'night' ? 'night' : 'stripe',
                      variables: {
                        colorPrimary: '#10b981',
                        colorBackground: '#ffffff',
                        colorText: '#374151',
                        colorDanger: '#ef4444',
                        fontFamily: 'Inter, sans-serif',
                        spacingUnit: '4px',
                        borderRadius: '8px',
                      },
                    },
                  }}
                >
                  <PaymentForm
                    clientSecret={checkoutData.clientSecret}
                    setupIntentId={checkoutData.setupIntentId}
                    config={config}
                    onPaymentSuccess={handlePaymentSuccess}
                  />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Configure o Checkout</h3>
                  <p className="text-gray-600">
                    Vá para a aba "Configuração" e clique em "Criar Stripe Elements Checkout"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="standalone">
          <Card>
            <CardHeader>
              <CardTitle>Página Única</CardTitle>
              <CardDescription>
                Link dedicado para o checkout
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedUrl && deploymentType === 'standalone' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium">URL do Checkout</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input value={generatedUrl} readOnly />
                      <Button 
                        onClick={() => {
                          navigator.clipboard.writeText(generatedUrl);
                          toast({
                            title: "Copiado!",
                            description: "URL copiada para a área de transferência",
                          });
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Link className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => window.open(generatedUrl, '_blank')}
                      variant="outline"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir em Nova Aba
                    </Button>

                    <Button 
                      onClick={() => window.location.href = generatedUrl}
                    >
                      <Monitor className="w-4 h-4 mr-2" />
                      Ir para Checkout
                    </Button>
                  </div>

                  <div className="mt-6 p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Resumo do Plano</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Cobrança Imediata:</span>
                        <Badge variant="outline">R$ {config.immediateAmount.toFixed(2)}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Trial:</span>
                        <Badge variant="outline">{config.trialDays} dias</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Valor Recorrente:</span>
                        <Badge variant="outline">R$ {config.recurringAmount.toFixed(2)}/mês</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ExternalLink className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Configure o Checkout</h3>
                  <p className="text-gray-600">
                    Selecione "Página Única" na configuração e clique em "Criar Stripe Elements Checkout"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}