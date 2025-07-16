import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShoppingCart, CreditCard, Lock, CheckCircle, Package } from 'lucide-react';

const checkoutFormSchema = z.object({
  customerName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  customerEmail: z.string().email('Email inválido'),
  customerPhone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  customerAddress: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  paymentMethod: z.enum(['credit_card', 'pix', 'boleto'], {
    required_error: 'Selecione um método de pagamento'
  })
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  features: string[];
  billingType: 'one_time' | 'recurring';
  subscriptionInterval?: 'monthly' | 'yearly';
}

export default function CheckoutPublic() {
  const { linkId } = useParams<{ linkId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [processingPayment, setProcessingPayment] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      paymentMethod: 'credit_card'
    }
  });

  // Buscar dados do produto pelo link
  const { data: product, isLoading: loadingProduct } = useQuery<Product>({
    queryKey: ['/api/checkout/product', linkId],
    enabled: !!linkId,
    retry: false
  });

  // Processar pagamento
  const processPaymentMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      return apiRequest('POST', '/api/checkout/process', {
        productId: product?.id,
        customerData: data,
        paymentMethod: data.paymentMethod
      });
    },
    onSuccess: (response) => {
      toast({
        title: "Pagamento Processado",
        description: "Seu pagamento foi processado com sucesso!",
        variant: "default",
      });
      
      // Redirecionar para página de sucesso
      navigate(`/checkout/success/${response.transactionId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no Pagamento",
        description: error.message || "Erro ao processar pagamento",
        variant: "destructive",
      });
      setProcessingPayment(false);
    }
  });

  const handleSubmit = async (data: CheckoutFormData) => {
    setProcessingPayment(true);
    processPaymentMutation.mutate(data);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />;
      case 'pix':
        return <Package className="w-4 h-4" />;
      case 'boleto':
        return <Package className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
          <p className="text-gray-600">Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Produto Não Encontrado</CardTitle>
            <CardDescription>O link de checkout não é válido ou o produto não existe.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar ao Início
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalizar Compra</h1>
          <p className="text-gray-600">Checkout seguro e protegido</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-green-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className={`w-16 h-0.5 ${currentStep >= 3 ? 'bg-green-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Product Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(product.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxas:</span>
                    <span>R$ 0,00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-green-600">{formatPrice(product.price)}</span>
                  </div>
                </div>

                {product.billingType === 'recurring' && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Assinatura {product.subscriptionInterval === 'monthly' ? 'Mensal' : 'Anual'}</strong>
                      <br />
                      Cobrança recorrente de {formatPrice(product.price)} {product.subscriptionInterval === 'monthly' ? 'por mês' : 'por ano'}
                    </p>
                  </div>
                )}

                {product.features && product.features.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recursos Inclusos:</h4>
                    <ul className="space-y-1">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Badge */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <Lock className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Pagamento Seguro</p>
                    <p className="text-sm">Seus dados estão protegidos com criptografia SSL</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Informações de Pagamento</CardTitle>
                <CardDescription>
                  Preencha seus dados para finalizar a compra
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    
                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Dados Pessoais</h3>
                      
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Digite seu nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="seu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="(11) 99999-9999" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input placeholder="Rua, Número, Cidade - CEP" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    {/* Payment Method */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Método de Pagamento</h3>
                      
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Forma de Pagamento</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o método" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="credit_card">
                                  <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    Cartão de Crédito
                                  </div>
                                </SelectItem>
                                <SelectItem value="pix">
                                  <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    PIX
                                  </div>
                                </SelectItem>
                                <SelectItem value="boleto">
                                  <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Boleto Bancário
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                      disabled={processingPayment}
                    >
                      {processingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processando Pagamento...
                        </>
                      ) : (
                        <>
                          {getPaymentMethodIcon(form.watch('paymentMethod'))}
                          <span className="ml-2">Finalizar Compra - {formatPrice(product.price)}</span>
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}