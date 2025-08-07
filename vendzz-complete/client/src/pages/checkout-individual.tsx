import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ShoppingCart, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Shield,
  CheckCircle,
  Star,
  Clock,
  Gift,
  Zap,
  Package,
  Heart,
  Trophy,
  Target,
  Sparkles,
  DollarSign,
  Lock,
  Loader2
} from "lucide-react";

export default function CheckoutIndividual() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [customerData, setCustomerData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil'
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptedOrderBumps, setAcceptedOrderBumps] = useState<string[]>([]);
  const [acceptedUpsells, setAcceptedUpsells] = useState<string[]>([]);

  // Buscar dados do produto
  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/checkout-products/${id}`],
    enabled: !!id,
  });

  // Buscar analytics para incrementar visualizações
  useEffect(() => {
    if (id) {
      apiRequest('GET', `/api/checkout-analytics/${id}`).catch(console.error);
    }
  }, [id]);

  // Mutation para processar o pagamento
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      return apiRequest('POST', '/api/checkout-transaction', paymentData);
    },
    onSuccess: (data) => {
      toast({
        title: "Pagamento processado!",
        description: "Redirecionando para finalização...",
      });
      // Aqui você redirecionaria para a página de sucesso
      window.location.href = `/checkout/success/${data.transaction.id}`;
    },
    onError: (error: any) => {
      toast({
        title: "Erro no pagamento",
        description: error.message || "Ocorreu um erro ao processar o pagamento",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Validar dados obrigatórios
      if (!customerData.firstName || !customerData.lastName || !customerData.email) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      // Calcular valor total
      const basePrice = product?.price || 0;
      const orderBumpsPrice = acceptedOrderBumps.reduce((sum, bumpId) => {
        const bump = product?.orderBumps?.find((b: any) => b.id === bumpId);
        return sum + (bump?.price || 0);
      }, 0);
      const upsellsPrice = acceptedUpsells.reduce((sum, upsellId) => {
        const upsell = product?.upsells?.find((u: any) => u.id === upsellId);
        return sum + (upsell?.price || 0);
      }, 0);
      
      const totalAmount = basePrice + orderBumpsPrice + upsellsPrice;

      // Processar pagamento
      await processPaymentMutation.mutateAsync({
        checkoutId: id,
        stripePaymentIntentId: `pi_mock_${Date.now()}`, // Aqui você integraria com o Stripe real
        customerData,
        totalAmount,
        currency: 'BRL',
        orderBumps: acceptedOrderBumps,
        acceptedUpsells: acceptedUpsells
      });

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleOrderBump = (bumpId: string) => {
    setAcceptedOrderBumps(prev => 
      prev.includes(bumpId) 
        ? prev.filter(id => id !== bumpId)
        : [...prev, bumpId]
    );
  };

  const toggleUpsell = (upsellId: string) => {
    setAcceptedUpsells(prev => 
      prev.includes(upsellId) 
        ? prev.filter(id => id !== upsellId)
        : [...prev, upsellId]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Produto não encontrado</h1>
          <p className="text-gray-600">O produto que você está procurando não existe ou foi removido.</p>
        </div>
      </div>
    );
  }

  // Calcular preços
  const basePrice = product.price;
  const orderBumpsPrice = acceptedOrderBumps.reduce((sum, bumpId) => {
    const bump = product.orderBumps?.find((b: any) => b.id === bumpId);
    return sum + (bump?.price || 0);
  }, 0);
  const upsellsPrice = acceptedUpsells.reduce((sum, upsellId) => {
    const upsell = product.upsells?.find((u: any) => u.id === upsellId);
    return sum + (upsell?.price || 0);
  }, 0);
  const totalPrice = basePrice + orderBumpsPrice + upsellsPrice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar - Resumo do Produto */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  <p className="text-gray-600 text-sm mt-2">{product.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Preço */}
                  <div className="text-center">
                    {product.originalPrice && product.originalPrice > product.price && (
                      <p className="text-sm text-gray-500 line-through">
                        De R$ {product.originalPrice.toFixed(2)}
                      </p>
                    )}
                    <p className="text-3xl font-bold text-green-600">
                      R$ {basePrice.toFixed(2)}
                    </p>
                    {product.paymentMode === 'recurring' && (
                      <p className="text-sm text-gray-600">
                        /{product.recurringInterval === 'monthly' ? 'mês' : 'ano'}
                      </p>
                    )}
                  </div>

                  {/* Características */}
                  {product.features && product.features.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center">
                        <Star className="w-4 h-4 mr-2 text-yellow-500" />
                        Incluído:
                      </h3>
                      <ul className="space-y-2">
                        {product.features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Garantia */}
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Shield className="w-4 h-4 text-green-600 mr-2" />
                      <span className="font-semibold text-green-800">Garantia de 30 dias</span>
                    </div>
                    <p className="text-xs text-green-700">
                      Não gostou? Devolvemos 100% do seu dinheiro.
                    </p>
                  </div>

                  {/* Segurança */}
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                    <Lock className="w-3 h-3" />
                    <span>Pagamento 100% seguro</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conteúdo Principal */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dados Pessoais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Dados Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Nome *</Label>
                        <Input
                          id="firstName"
                          value={customerData.firstName}
                          onChange={(e) => setCustomerData({...customerData, firstName: e.target.value})}
                          placeholder="Seu nome"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Sobrenome *</Label>
                        <Input
                          id="lastName"
                          value={customerData.lastName}
                          onChange={(e) => setCustomerData({...customerData, lastName: e.target.value})}
                          placeholder="Seu sobrenome"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={customerData.email}
                          onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={customerData.phone}
                          onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Endereço */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Endereço
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="address">Endereço</Label>
                        <Input
                          id="address"
                          value={customerData.address}
                          onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                          placeholder="Rua, número, complemento"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={customerData.city}
                          onChange={(e) => setCustomerData({...customerData, city: e.target.value})}
                          placeholder="Sua cidade"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          value={customerData.state}
                          onChange={(e) => setCustomerData({...customerData, state: e.target.value})}
                          placeholder="SP"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">CEP</Label>
                        <Input
                          id="zipCode"
                          value={customerData.zipCode}
                          onChange={(e) => setCustomerData({...customerData, zipCode: e.target.value})}
                          placeholder="00000-000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">País</Label>
                        <Input
                          id="country"
                          value={customerData.country}
                          onChange={(e) => setCustomerData({...customerData, country: e.target.value})}
                          placeholder="Brasil"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Bumps */}
                {product.orderBumps && product.orderBumps.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Gift className="w-5 h-5 mr-2" />
                        Ofertas Especiais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {product.orderBumps.map((bump: any) => (
                        <div
                          key={bump.id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            acceptedOrderBumps.includes(bump.id)
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                          onClick={() => toggleOrderBump(bump.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold">{bump.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{bump.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                +R$ {bump.price.toFixed(2)}
                              </p>
                              {acceptedOrderBumps.includes(bump.id) && (
                                <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Upsells */}
                {product.upsells && product.upsells.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Zap className="w-5 h-5 mr-2" />
                        Recomendações para Você
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {product.upsells.map((upsell: any) => (
                        <div
                          key={upsell.id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            acceptedUpsells.includes(upsell.id)
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                          onClick={() => toggleUpsell(upsell.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold">{upsell.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{upsell.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-purple-600">
                                +R$ {upsell.price.toFixed(2)}
                              </p>
                              {acceptedUpsells.includes(upsell.id) && (
                                <CheckCircle className="w-5 h-5 text-purple-500 mt-1" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Resumo do Pedido */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Resumo do Pedido
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>{product.name}</span>
                        <span>R$ {basePrice.toFixed(2)}</span>
                      </div>
                      
                      {acceptedOrderBumps.map(bumpId => {
                        const bump = product.orderBumps?.find((b: any) => b.id === bumpId);
                        return bump ? (
                          <div key={bumpId} className="flex justify-between text-green-600">
                            <span>{bump.name}</span>
                            <span>+R$ {bump.price.toFixed(2)}</span>
                          </div>
                        ) : null;
                      })}
                      
                      {acceptedUpsells.map(upsellId => {
                        const upsell = product.upsells?.find((u: any) => u.id === upsellId);
                        return upsell ? (
                          <div key={upsellId} className="flex justify-between text-purple-600">
                            <span>{upsell.name}</span>
                            <span>+R$ {upsell.price.toFixed(2)}</span>
                          </div>
                        ) : null;
                      })}
                      
                      <Separator />
                      
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-green-600">R$ {totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Botão de Finalizar */}
                <Card>
                  <CardContent className="pt-6">
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Finalizar Compra - R$ {totalPrice.toFixed(2)}
                        </>
                      )}
                    </Button>
                    
                    <div className="flex items-center justify-center space-x-2 mt-4 text-xs text-gray-500">
                      <Shield className="w-3 h-3" />
                      <span>Seus dados estão protegidos por criptografia SSL</span>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}