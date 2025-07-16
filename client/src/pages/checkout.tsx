import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, CreditCard, Lock, Shield, Users, Star, Clock, ArrowRight, Check, X } from 'lucide-react';
import { formatPrice } from '@/utils/currency';
import { useToast } from '@/hooks/use-toast';

interface CheckoutProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  features: string;
  paymentMode: 'one_time' | 'subscription';
  recurringInterval?: 'monthly' | 'quarterly' | 'yearly';
  trialPeriod?: number;
  trialPrice?: number;
  status: 'active' | 'inactive' | 'draft';
}

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  document: string;
}

export default function CheckoutPage() {
  const [selectedProduct, setSelectedProduct] = useState<CheckoutProduct | null>(null);
  const [activeTab, setActiveTab] = useState('products');
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    document: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | 'boleto'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();

  // Buscar produtos ativos
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/checkout-products'],
    select: (data) => data.filter((p: CheckoutProduct) => p.status === 'active')
  });

  // Mutation para criar pagamento
  const createPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/create-subscription', data);
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Pagamento processado!",
        description: "Redirecionando para pagamento...",
      });
      
      // Redirecionar para Stripe Checkout ou processar pagamento
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro no pagamento",
        description: error.message || "Erro ao processar pagamento",
        variant: "destructive",
      });
    }
  });

  const handleSelectProduct = (product: CheckoutProduct) => {
    setSelectedProduct(product);
    setActiveTab('checkout');
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;

    setIsProcessing(true);
    
    try {
      await createPaymentMutation.mutateAsync({
        productId: selectedProduct.id,
        customer: customerData,
        paymentMethod,
        returnUrl: window.location.origin + '/success',
        cancelUrl: window.location.origin + '/checkout'
      });
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getRecurringText = (interval?: string) => {
    switch (interval) {
      case 'monthly': return 'mês';
      case 'quarterly': return 'trimestre';
      case 'yearly': return 'ano';
      default: return 'mês';
    }
  };

  const getFeaturesList = (features: string) => {
    return features.split(',').map(f => f.trim()).filter(Boolean);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Vendzz Checkout</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Pagamento 100% Seguro</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="products">Planos</TabsTrigger>
            <TabsTrigger value="checkout" disabled={!selectedProduct}>
              Checkout
            </TabsTrigger>
          </TabsList>

          {/* Produtos */}
          <TabsContent value="products" className="mt-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Escolha seu Plano
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Comece com nosso trial de 3 dias por apenas R$ 1,00 e depois continue com o plano completo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: CheckoutProduct) => (
                <Card key={product.id} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {product.paymentMode === 'subscription' && product.trialPrice && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                        Trial R$ {product.trialPrice}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl text-gray-900">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {product.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Preço */}
                    <div className="text-center">
                      {product.paymentMode === 'subscription' && product.trialPrice ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-2xl font-bold text-green-600">
                              R$ {product.trialPrice}
                            </span>
                            <span className="text-sm text-gray-500">
                              por {product.trialPeriod || 3} dias
                            </span>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <span>Depois</span>
                            <span className="text-lg font-semibold text-gray-900">
                              {formatPrice(product.price, product.currency)}
                            </span>
                            <span>/{getRecurringText(product.recurringInterval)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-3xl font-bold text-gray-900">
                          {formatPrice(product.price, product.currency)}
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Incluso:</h4>
                      <ul className="space-y-2">
                        {getFeaturesList(product.features).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Botão de seleção */}
                    <Button
                      onClick={() => handleSelectProduct(product)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-3"
                    >
                      {product.paymentMode === 'subscription' && product.trialPrice ? 
                        'Começar Trial' : 'Comprar Agora'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Checkout */}
          <TabsContent value="checkout" className="mt-8">
            {selectedProduct && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulário de Checkout */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Dados do Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitPayment} className="space-y-6">
                      {/* Dados pessoais */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">Dados Pessoais</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input
                              id="name"
                              type="text"
                              value={customerData.name}
                              onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                              placeholder="Seu nome completo"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={customerData.email}
                              onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                              placeholder="seu@email.com"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={customerData.phone}
                              onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                              placeholder="(11) 99999-9999"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="document">CPF/CNPJ</Label>
                            <Input
                              id="document"
                              type="text"
                              value={customerData.document}
                              onChange={(e) => setCustomerData({...customerData, document: e.target.value})}
                              placeholder="000.000.000-00"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Método de pagamento */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">Método de Pagamento</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <Button
                            type="button"
                            variant={paymentMethod === 'card' ? 'default' : 'outline'}
                            onClick={() => setPaymentMethod('card')}
                            className="flex flex-col items-center gap-2 h-16"
                          >
                            <CreditCard className="w-5 h-5" />
                            <span className="text-xs">Cartão</span>
                          </Button>
                          <Button
                            type="button"
                            variant={paymentMethod === 'pix' ? 'default' : 'outline'}
                            onClick={() => setPaymentMethod('pix')}
                            className="flex flex-col items-center gap-2 h-16"
                          >
                            <div className="w-5 h-5 bg-current rounded" />
                            <span className="text-xs">PIX</span>
                          </Button>
                          <Button
                            type="button"
                            variant={paymentMethod === 'boleto' ? 'default' : 'outline'}
                            onClick={() => setPaymentMethod('boleto')}
                            className="flex flex-col items-center gap-2 h-16"
                          >
                            <div className="w-5 h-5 bg-current rounded" />
                            <span className="text-xs">Boleto</span>
                          </Button>
                        </div>
                      </div>

                      {/* Botão de pagamento */}
                      <Button
                        type="submit"
                        disabled={isProcessing || createPaymentMutation.isPending}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-3"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Finalizar Pagamento
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Resumo do pedido */}
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-900">{selectedProduct.name}</h3>
                      <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                    </div>

                    <Separator />

                    {/* Preços */}
                    <div className="space-y-3">
                      {selectedProduct.paymentMode === 'subscription' && selectedProduct.trialPrice ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Trial ({selectedProduct.trialPeriod || 3} dias)
                            </span>
                            <span className="font-medium">
                              R$ {selectedProduct.trialPrice}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>Depois: {getRecurringText(selectedProduct.recurringInterval)}</span>
                            <span>{formatPrice(selectedProduct.price, selectedProduct.currency)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total</span>
                          <span className="font-medium">
                            {formatPrice(selectedProduct.price, selectedProduct.currency)}
                          </span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Features */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Você terá acesso a:</h4>
                      <ul className="space-y-2">
                        {getFeaturesList(selectedProduct.features).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Garantia */}
                    <Alert>
                      <Shield className="w-4 h-4" />
                      <AlertDescription>
                        <strong>Garantia de 7 dias</strong> - Cancele a qualquer momento durante o período trial
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}