import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { STRIPE_CURRENCIES, STRIPE_INTERVALS, getCurrencySymbol, formatPrice } from '@/lib/stripe-currencies';
import StripeIntegration from '@/components/stripe-integration';
import {
  CreditCard,
  ShoppingCart,
  Gift,
  Percent,
  Lock,
  Calendar,
  Mail,
  Phone,
  User,
  MapPin,
  Check,
  X,
  Plus,
  Minus,
  Star,
  Zap,
  Crown,
  Package,
  Sparkles,
  ArrowRight,
  Info,
  AlertCircle,
  CheckCircle,
  FileText,
  Globe,
  Eye,
  Copy,
  Settings,
  Palette,
  Link,
  DollarSign,
  Repeat,
  Clock,
  Save,
  ExternalLink
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
  category: string;
  features: string[];
  paymentMode: 'one_time' | 'recurring';
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringIntervalCount?: number;
  trialPeriod?: number;
  trialType?: 'none' | 'days' | 'usage';
  status: 'active' | 'inactive';
  paymentLink?: string;
  customization: {
    theme: 'light' | 'dark' | 'custom';
    primaryColor: string;
    buttonColor: string;
    backgroundColor: string;
    textColor: string;
  };
  stripeProductId?: string;
  stripePriceId?: string;
  stripeConfig?: {
    billingScheme: 'per_unit' | 'tiered';
    usageType: 'licensed' | 'metered';
    aggregateUsage?: string;
    taxRates: boolean;
    coupons: boolean;
    collectionMethod: 'automatic' | 'manual';
  };
}

interface CheckoutPage {
  id: string;
  productId: string;
  title: string;
  subtitle: string;
  testimonials: Array<{
    name: string;
    comment: string;
    rating: number;
    avatar?: string;
  }>;
  guarantees: string[];
  urgency: {
    enabled: boolean;
    message: string;
    timer?: number;
  };
  orderBumps: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    enabled: boolean;
  }>;
  paymentMethods: {
    creditCard: boolean;
    pix: boolean;
    boleto: boolean;
    installments: boolean;
    maxInstallments: number;
  };
}

export default function CheckoutBuilder() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("produtos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Product Form State - Usando useCallback para evitar re-renders
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    currency: "BRL",
    category: "digital",
    features: [],
    paymentMode: "one_time",
    recurringInterval: "monthly",
    trialPeriod: 0,
    status: "active",
    customization: {
      theme: "light",
      primaryColor: "#10B981",
      buttonColor: "#10B981",
      backgroundColor: "#FFFFFF",
      textColor: "#1F2937"
    }
  });

  // Checkout Page Form State
  const [checkoutForm, setCheckoutForm] = useState<Partial<CheckoutPage>>({
    title: "",
    subtitle: "",
    testimonials: [],
    guarantees: [],
    urgency: {
      enabled: false,
      message: ""
    },
    orderBumps: [],
    paymentMethods: {
      creditCard: true,
      pix: true,
      boleto: true,
      installments: true,
      maxInstallments: 12
    }
  });

  // Queries
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Erro ao carregar produtos');
      return response.json();
    }
  });

  const { data: checkoutPages = [], isLoading: isLoadingPages } = useQuery({
    queryKey: ['/api/checkout-pages'],
    queryFn: async () => {
      const response = await fetch('/api/checkout-pages', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Erro ao carregar páginas de checkout');
      return response.json();
    }
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao criar produto');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Produto Criado",
        description: "Produto criado com sucesso!"
      });
      setProductForm({
        name: "",
        description: "",
        price: 0,
        category: "digital",
        features: [],
        paymentMode: "one_time",
        status: "active",
        customization: {
          theme: "light",
          primaryColor: "#10B981",
          buttonColor: "#10B981",
          backgroundColor: "#FFFFFF",
          textColor: "#1F2937"
        }
      });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao atualizar produto');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Produto Atualizado",
        description: "Produto atualizado com sucesso!"
      });
      setEditingProduct(null);
    }
  });

  const createCheckoutPageMutation = useMutation({
    mutationFn: async (data: Partial<CheckoutPage>) => {
      const response = await fetch('/api/checkout-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao criar página de checkout');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Página de Checkout Criada",
        description: "Página de checkout criada com sucesso!"
      });
    }
  });

  const generatePaymentLinkMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/products/${productId}/generate-link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Erro ao gerar link de pagamento');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Link Gerado",
        description: "Link de pagamento gerado com sucesso!"
      });
      // Atualizar o produto com o novo link
      const updatedProducts = products?.map(p => 
        p.id === data.productId ? { ...p, paymentLink: data.paymentLink } : p
      );
      // Refresh da query
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    }
  });

  const handleCreateProduct = () => {
    if (!productForm.name || !productForm.description || !productForm.price) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    createProductMutation.mutate(productForm);
  };

  const handleUpdateProduct = (id: string) => {
    if (!editingProduct) return;
    updateProductMutation.mutate({ id, data: editingProduct });
  };

  const handleAddFeature = (feature: string) => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        features: [...(editingProduct.features || []), feature]
      });
    } else {
      setProductForm({
        ...productForm,
        features: [...(productForm.features || []), feature]
      });
    }
  };

  const handleRemoveFeature = (index: number) => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        features: editingProduct.features?.filter((_, i) => i !== index) || []
      });
    } else {
      setProductForm({
        ...productForm,
        features: productForm.features?.filter((_, i) => i !== index) || []
      });
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copiado",
      description: "Link copiado para a área de transferência!"
    });
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
          </div>
          <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
            {product.status === 'active' ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {formatPrice(product.price, product.currency || 'BRL')}
            </span>
            <Badge variant="outline">
              {product.paymentMode === 'one_time' ? 'Pagamento Único' : 'Recorrente'}
            </Badge>
          </div>
          
          {product.features.length > 0 && (
            <div className="space-y-1">
              <Label className="text-sm font-medium">Funcionalidades:</Label>
              <ul className="text-sm text-muted-foreground space-y-1">
                {product.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-500" />
                    {feature}
                  </li>
                ))}
                {product.features.length > 3 && (
                  <li className="text-xs text-muted-foreground">
                    +{product.features.length - 3} mais...
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingProduct(product)}
            >
              <Settings className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generatePaymentLinkMutation.mutate(product.id)}
            >
              <Link className="h-4 w-4 mr-1" />
              Gerar Link
            </Button>
            {product.paymentLink && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyLink(product.paymentLink!)}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copiar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProductForm = ({ product, onSave }: { product?: Product; onSave: () => void }) => {
    const currentProduct = product || productForm;
    const isEditing = !!product;

    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Editar Produto' : 'Criar Novo Produto'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={currentProduct.name || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (isEditing) {
                    setEditingProduct(prev => ({ ...prev!, name: value }));
                  } else {
                    setProductForm(prev => ({ ...prev, name: value }));
                  }
                }}
                placeholder="Ex: Curso de Marketing Digital"
              />
            </div>
            
            <div>
              <Label htmlFor="currency">Moeda *</Label>
              <Select 
                value={currentProduct.currency || 'BRL'} 
                onValueChange={(value) => {
                  if (isEditing) {
                    setEditingProduct(prev => ({ ...prev!, currency: value }));
                  } else {
                    setProductForm(prev => ({ ...prev, currency: value }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {STRIPE_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{currency.symbol}</span>
                        <span className="font-medium">{currency.code}</span>
                        <span className="text-sm text-muted-foreground">
                          {currency.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="price">Preço ({getCurrencySymbol(currentProduct.currency || 'BRL')}) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={currentProduct.price || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  if (isEditing) {
                    setEditingProduct(prev => ({ ...prev!, price: value }));
                  } else {
                    setProductForm(prev => ({ ...prev, price: value }));
                  }
                }}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={currentProduct.description || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (isEditing) {
                  setEditingProduct(prev => ({ ...prev!, description: value }));
                } else {
                  setProductForm(prev => ({ ...prev, description: value }));
                }
              }}
              placeholder="Descreva seu produto..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={currentProduct.category}
                onValueChange={(value) => {
                  if (isEditing) {
                    setEditingProduct({ ...editingProduct!, category: value });
                  } else {
                    setProductForm({ ...productForm, category: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital">Produto Digital</SelectItem>
                  <SelectItem value="physical">Produto Físico</SelectItem>
                  <SelectItem value="service">Serviço</SelectItem>
                  <SelectItem value="course">Curso</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentMode">Modalidade de Pagamento</Label>
              <Select
                value={currentProduct.paymentMode || 'one_time'}
                onValueChange={(value: 'one_time' | 'recurring') => {
                  if (isEditing) {
                    setEditingProduct(prev => ({ ...prev!, paymentMode: value }));
                  } else {
                    setProductForm(prev => ({ ...prev, paymentMode: value }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a modalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Pagamento Único</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="recurring">
                    <div className="flex items-center gap-2">
                      <Repeat className="h-4 w-4" />
                      <span>Recorrente</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {currentProduct.paymentMode === 'recurring' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recurringInterval">Intervalo de Cobrança</Label>
                <Select
                  value={currentProduct.recurringInterval || 'monthly'}
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
                    if (isEditing) {
                      setEditingProduct(prev => ({ ...prev!, recurringInterval: value }));
                    } else {
                      setProductForm(prev => ({ ...prev, recurringInterval: value }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o intervalo" />
                  </SelectTrigger>
                  <SelectContent>
                    {STRIPE_INTERVALS.map((interval) => (
                      <SelectItem key={interval.value} value={interval.value}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{interval.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="trialPeriod">Período de Teste (dias)</Label>
                <Input
                  id="trialPeriod"
                  type="number"
                  value={currentProduct.trialPeriod || ''}
                  onChange={(e) => {
                    if (isEditing) {
                      setEditingProduct({ ...editingProduct!, trialPeriod: parseInt(e.target.value) });
                    } else {
                      setProductForm({ ...productForm, trialPeriod: parseInt(e.target.value) });
                    }
                  }}
                  placeholder="7"
                />
              </div>
            </div>
          )}

          <div>
            <Label>Funcionalidades</Label>
            <div className="space-y-2">
              {currentProduct.features?.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={feature} readOnly />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveFeature(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Adicione uma funcionalidade..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddFeature(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Adicione uma funcionalidade..."]') as HTMLInputElement;
                    if (input.value) {
                      handleAddFeature(input.value);
                      input.value = '';
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              Cancelar
            </Button>
            <Button onClick={onSave}>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Salvar Alterações' : 'Criar Produto'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Checkout Builder</h1>
          <p className="text-muted-foreground">
            Crie produtos, configure pagamentos e gere links únicos de checkout
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open('/assinatura', '_blank')}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Testar Assinatura
          </Button>
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Sair do Preview' : 'Preview'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="produtos">
            <Package className="h-4 w-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="checkout">
            <Settings className="h-4 w-4 mr-2" />
            Checkout
          </TabsTrigger>
          <TabsTrigger value="pagamentos">
            <CreditCard className="h-4 w-4 mr-2" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="links">
            <Link className="h-4 w-4 mr-2" />
            Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Meus Produtos</h2>
              <div className="space-y-4">
                {isLoadingProducts ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : products.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum produto criado ainda</p>
                  </Card>
                ) : (
                  products.map((product: Product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">
                {editingProduct ? 'Editar Produto' : 'Criar Produto'}
              </h2>
              <ProductForm
                product={editingProduct}
                onSave={() => editingProduct ? handleUpdateProduct(editingProduct.id) : handleCreateProduct()}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="checkout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Checkout</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade em desenvolvimento. Aqui você poderá personalizar a aparência e comportamento das suas páginas de checkout.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagamentos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integração com Stripe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade em desenvolvimento. Aqui você poderá configurar suas chaves do Stripe e métodos de pagamento.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Links de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products?.map((product: Product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            {product.paymentMode === 'one_time' ? 'Pagamento Único' : 'Recorrente'}
                          </Badge>
                          <Badge variant="outline" className="text-green-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {product.paymentLink ? (
                          <div className="flex items-center gap-2">
                            <Input
                              readOnly
                              value={`${window.location.origin}/checkout/${product.paymentLink}`}
                              className="w-64"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/checkout/${product.paymentLink}`);
                                toast({
                                  title: "Link copiado!",
                                  description: "Link de pagamento copiado para a área de transferência"
                                });
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`${window.location.origin}/checkout/${product.paymentLink}`, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => generatePaymentLinkMutation.mutate(product.id)}
                            disabled={generatePaymentLinkMutation.isPending}
                          >
                            {generatePaymentLinkMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Gerando...
                              </>
                            ) : (
                              <>
                                <Link className="w-4 h-4 mr-2" />
                                Gerar Link
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {product.paymentLink && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Link de acesso rápido:</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => generatePaymentLinkMutation.mutate(product.id)}
                            disabled={generatePaymentLinkMutation.isPending}
                          >
                            Regenerar Link
                          </Button>
                        </div>
                        <code className="text-xs text-blue-600 break-all">
                          {`${window.location.origin}/checkout/${product.paymentLink}`}
                        </code>
                      </div>
                    )}
                  </div>
                ))}
                
                {(!products || products.length === 0) && (
                  <div className="text-center py-8">
                    <Link className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Nenhum produto criado ainda</p>
                    <p className="text-sm text-gray-400">Crie um produto primeiro para gerar links de pagamento</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}