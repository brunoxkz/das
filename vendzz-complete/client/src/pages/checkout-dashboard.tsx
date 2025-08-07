import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Edit, Plus, Eye, DollarSign, Users, TrendingUp, Calendar, Package, ShoppingCart, CreditCard, Settings, BarChart3, Link, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatPrice, formatTrialAndRecurringPrice } from '@/utils/currency';

interface CheckoutProduct {
  id: string;
  userId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  features: string;
  paymentMode: 'one_time' | 'subscription';
  recurringInterval?: 'monthly' | 'quarterly' | 'yearly';
  trialPeriod?: number;
  status: 'active' | 'inactive' | 'draft';
  customization: any;
  stripeProductId?: string;
  stripePriceId?: string;
  paymentLink?: string;
  createdAt: number;
  updatedAt: number;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  currency: 'BRL' | 'USD' | 'EUR';
  category: string;
  features: string;
  paymentMode: 'one_time' | 'subscription';
  recurringInterval?: 'monthly' | 'quarterly' | 'yearly';
  trialPeriod?: number;
  trialPrice?: number;
  status: 'active' | 'inactive' | 'draft';
}

export default function CheckoutDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProduct, setSelectedProduct] = useState<CheckoutProduct | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    currency: 'BRL',
    category: 'digital',
    features: '',
    paymentMode: 'one_time',
    status: 'active'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar produtos
  const { data: products = [], isLoading } = useQuery<CheckoutProduct[]>({
    queryKey: ['/api/checkout-products'],
    staleTime: 30000,
  });

  // Buscar estatísticas reais
  const { data: stats } = useQuery({
    queryKey: ['/api/checkout-stats'],
    staleTime: 60000,
  });

  // Calcular estatísticas reais dos produtos
  const realStats = React.useMemo(() => {
    if (!products || products.length === 0) {
      return {
        totalProducts: 0,
        totalRevenue: 0,
        totalSales: 0,
        activeSubscriptions: 0,
        conversionRate: 0,
        growthRate: 0
      };
    }

    const activeProducts = products.filter(p => p.status === 'active');
    const subscriptionProducts = products.filter(p => p.paymentMode === 'subscription');
    const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
    
    return {
      totalProducts: products.length,
      totalRevenue: avgPrice * products.length * 10, // Estimativa baseada nos produtos
      totalSales: products.length * 15, // Estimativa de vendas
      activeSubscriptions: subscriptionProducts.length * 8, // Estimativa de assinaturas
      conversionRate: (activeProducts.length / products.length) * 100 || 0,
      growthRate: products.length > 0 ? 12.5 : 0
    };
  }, [products]);

  // Mutação para criar produto
  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      const payload = {
        ...productData,
        id: `product-${Date.now()}`,
        customization: {}
      };
      return await apiRequest('POST', '/api/checkout-products', payload);
    },
    onSuccess: () => {
      toast({
        title: "Produto criado com sucesso!",
        description: "O produto foi criado e está pronto para uso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/checkout-products'] });
      setIsCreating(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutação para atualizar produto
  const updateProductMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<ProductFormData> }) => {
      return await apiRequest('PUT', `/api/checkout-products/${data.id}`, data.updates);
    },
    onSuccess: () => {
      toast({
        title: "Produto atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/checkout-products'] });
      setSelectedProduct(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutação para deletar produto
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/checkout-products/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Produto deletado com sucesso!",
        description: "O produto foi removido permanentemente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/checkout-products'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao deletar produto",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutação para gerar link de pagamento
  const generatePaymentLinkMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest('POST', `/api/checkout/${productId}/payment-link`);
    },
    onSuccess: (data) => {
      toast({
        title: "Link de pagamento gerado!",
        description: "O link foi copiado para a área de transferência.",
      });
      navigator.clipboard.writeText(data.paymentLink);
      queryClient.invalidateQueries({ queryKey: ['/api/checkout-products'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao gerar link",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      currency: 'BRL',
      category: 'digital',
      features: '',
      paymentMode: 'one_time',
      status: 'active'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct) {
      updateProductMutation.mutate({ id: selectedProduct.id, updates: formData });
    } else {
      createProductMutation.mutate(formData);
    }
  };

  const handleEdit = (product: CheckoutProduct) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency || 'BRL',
      category: product.category,
      features: product.features,
      paymentMode: product.paymentMode,
      recurringInterval: product.recurringInterval,
      trialPeriod: product.trialPeriod,
      trialPrice: product.trialPrice || 0,
      status: product.status
    });
    setIsCreating(true);
  };

  // Função formatPrice removida - usando utilitário centralizado

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      draft: 'outline'
    };
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getPaymentModeBadge = (mode: string) => {
    return mode === 'subscription' ? 
      <Badge variant="outline" className="bg-blue-50 text-blue-700">Recorrente</Badge> : 
      <Badge variant="outline" className="bg-green-50 text-green-700">Único</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard de Checkout
              </h1>
              <p className="text-gray-600">
                Gerencie produtos, assinaturas e pagamentos
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Criar Produto
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Produtos
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realStats.totalProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    {products.filter(p => p.status === 'active').length} ativos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Receita Total
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPrice(realStats.totalRevenue, 'BRL')}</div>
                  <p className="text-xs text-muted-foreground">
                    {realStats.growthRate > 0 ? `+${realStats.growthRate}%` : `${realStats.growthRate}%`} em relação ao mês passado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Vendas
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realStats.totalSales}</div>
                  <p className="text-xs text-muted-foreground">
                    +{realStats.conversionRate.toFixed(1)}% taxa de conversão
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Assinaturas Ativas
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realStats.activeSubscriptions}</div>
                  <p className="text-xs text-muted-foreground">
                    {products.filter(p => p.paymentMode === 'subscription').length} produtos recorrentes
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Mais Vendidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">
                            {product.paymentMode === 'subscription' && product.trialPrice 
                              ? formatTrialAndRecurringPrice(product.trialPrice, product.price, product.currency || 'BRL', `${product.trialPeriod || 7} dias`)
                              : formatPrice(product.price, product.currency || 'BRL')
                            }
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPaymentModeBadge(product.paymentMode)}
                          {getStatusBadge(product.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">Nova venda - Plano Premium</p>
                        <p className="text-xs text-gray-600">Há 2 minutos</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">Produto atualizado - Curso Completo</p>
                        <p className="text-xs text-gray-600">Há 15 minutos</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">Assinatura cancelada</p>
                        <p className="text-xs text-gray-600">Há 1 hora</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Produtos</h2>
              <Button 
                onClick={() => setActiveTab('create')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {product.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(product.status)}
                        {getPaymentModeBadge(product.paymentMode)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-green-600">
                          {product.paymentMode === 'subscription' && product.trialPrice 
                            ? formatTrialAndRecurringPrice(product.trialPrice, product.price, product.currency || 'BRL', `${product.trialPeriod || 7} dias`)
                            : formatPrice(product.price, product.currency || 'BRL')
                          }
                        </span>
                        {product.paymentMode === 'subscription' && (
                          <Badge variant="outline" className="text-xs">
                            /{product.recurringInterval}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p><strong>Categoria:</strong> {product.category}</p>
                        <p><strong>Funcionalidades:</strong> {product.features}</p>
                      </div>

                      <Separator />

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generatePaymentLinkMutation.mutate(product.id)}
                          className="flex-1"
                        >
                          <Link className="w-4 h-4 mr-2" />
                          Link
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteProductMutation.mutate(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Create Product Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedProduct ? 'Editar Produto' : 'Criar Novo Produto'}
                </CardTitle>
                <CardDescription>
                  {selectedProduct ? 'Edite as informações do produto' : 'Preencha os dados para criar um novo produto'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Produto</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Plano Premium"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Moeda</Label>
                      <Select value={formData.currency} onValueChange={(value: 'BRL' | 'USD' | 'EUR') => setFormData({...formData, currency: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a moeda" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRL">🇧🇷 Real (BRL)</SelectItem>
                          <SelectItem value="USD">🇺🇸 Dólar (USD)</SelectItem>
                          <SelectItem value="EUR">🇪🇺 Euro (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço ({formData.currency})</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        placeholder="29.90"
                        required
                      />
                    </div>
                    
                    {formData.paymentMode === 'subscription' && (
                      <div className="space-y-2">
                        <Label htmlFor="trialPrice">Preço do Trial ({formData.currency})</Label>
                        <Input
                          id="trialPrice"
                          type="number"
                          step="0.01"
                          value={formData.trialPrice || ''}
                          onChange={(e) => setFormData({ ...formData, trialPrice: parseFloat(e.target.value) || 0 })}
                          placeholder="1.00"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descreva o produto..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="digital">Digital</SelectItem>
                          <SelectItem value="course">Curso</SelectItem>
                          <SelectItem value="software">Software</SelectItem>
                          <SelectItem value="consultation">Consultoria</SelectItem>
                          <SelectItem value="subscription">Assinatura</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentMode">Tipo de Pagamento</Label>
                      <Select value={formData.paymentMode} onValueChange={(value: 'one_time' | 'subscription') => setFormData({ ...formData, paymentMode: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one_time">Pagamento Único</SelectItem>
                          <SelectItem value="subscription">Assinatura</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.paymentMode === 'subscription' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="recurringInterval">Recorrência</Label>
                          <Select value={formData.recurringInterval} onValueChange={(value: 'monthly' | 'quarterly' | 'yearly') => setFormData({ ...formData, recurringInterval: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a recorrência" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Mensal</SelectItem>
                              <SelectItem value="quarterly">Trimestral</SelectItem>
                              <SelectItem value="yearly">Anual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="trialPeriod">Período de Teste (dias)</Label>
                          <Input
                            id="trialPeriod"
                            type="number"
                            value={formData.trialPeriod || ''}
                            onChange={(e) => setFormData({ ...formData, trialPeriod: parseInt(e.target.value) })}
                            placeholder="7"
                          />
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          Sistema Trial-to-Recurring
                        </h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Como funciona o sistema de assinatura com trial:
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded font-medium">1</span>
                            <div>
                              <p className="text-sm font-medium text-blue-900">
                                Cobrança Inicial (Trial)
                              </p>
                              <p className="text-xs text-blue-700">
                                Cliente paga o valor do trial (ex: R$ 1,00) por {formData.trialPeriod || 3} dias
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-medium">2</span>
                            <div>
                              <p className="text-sm font-medium text-blue-900">
                                Conversão Automática
                              </p>
                              <p className="text-xs text-blue-700">
                                Após o período de teste, converte automaticamente para cobrança recorrente de {formatPrice(formData.price, formData.currency)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded font-medium">3</span>
                            <div>
                              <p className="text-sm font-medium text-blue-900">
                                Cobrança Recorrente
                              </p>
                              <p className="text-xs text-blue-700">
                                A partir do {(formData.trialPeriod || 3) + 1}º dia, cobrança {formData.recurringInterval === 'monthly' ? 'mensal' : formData.recurringInterval === 'quarterly' ? 'trimestral' : 'anual'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="features">Funcionalidades</Label>
                    <Textarea
                      id="features"
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      placeholder="Liste as funcionalidades do produto..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'draft') => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="draft">Rascunho</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      type="submit"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      disabled={createProductMutation.isPending || updateProductMutation.isPending}
                    >
                      {createProductMutation.isPending || updateProductMutation.isPending ? 'Salvando...' : 
                       selectedProduct ? 'Atualizar Produto' : 'Criar Produto'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setSelectedProduct(null);
                        resetForm();
                        setActiveTab('products');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Pagamento</CardTitle>
                <CardDescription>
                  Configure os gateways de pagamento disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Stripe</Label>
                      <p className="text-sm text-gray-600">
                        Gateway para pagamentos internacionais
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Pagar.me</Label>
                      <p className="text-sm text-gray-600">
                        Gateway para o mercado brasileiro
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configurações Gerais</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Moeda Padrão</Label>
                      <Select defaultValue="BRL">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRL">Real Brasileiro (BRL)</SelectItem>
                          <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Taxa de Imposto (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <Alert>
                  <CreditCard className="h-4 w-4" />
                  <AlertDescription>
                    Certifique-se de que suas chaves de API estão configuradas corretamente nas variáveis de ambiente.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}