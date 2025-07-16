import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Settings, 
  Palette, 
  ShoppingCart, 
  TrendingUp, 
  Star, 
  Shield,
  ExternalLink,
  Download,
  Upload
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface CheckoutConfig {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: 'BRL' | 'USD' | 'EUR';
  billingType: 'one_time' | 'subscription';
  subscriptionInterval?: 'monthly' | 'yearly';
  features: string[];
  orderBumps: OrderBump[];
  upsells: Upsell[];
  design: CheckoutDesign;
  active: boolean;
  stats: {
    views: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface OrderBump {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  features: string[];
  popular?: boolean;
}

interface Upsell {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  features: string[];
  triggerCondition: 'after_main_product' | 'after_payment' | 'exit_intent';
  design: {
    backgroundColor: string;
    textColor: string;
    buttonColor: string;
  };
}

interface CheckoutDesign {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  headerImage?: string;
  logo?: string;
  testimonials: Testimonial[];
  urgencyTimer: boolean;
  socialProof: boolean;
  guaranteeBadge: boolean;
  securityBadges: boolean;
}

interface Testimonial {
  name: string;
  photo?: string;
  rating: number;
  comment: string;
  verified: boolean;
}

const CheckoutAdmin: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedCheckout, setSelectedCheckout] = useState<CheckoutConfig | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Buscar checkouts
  const { data: checkouts, isLoading } = useQuery({
    queryKey: ['/api/checkout-admin'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/checkout-admin');
      return response.json();
    }
  });

  // Mutation para criar checkout
  const createCheckoutMutation = useMutation({
    mutationFn: async (data: Partial<CheckoutConfig>) => {
      const response = await apiRequest('POST', '/api/checkout-admin', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Checkout criado!",
        description: "O novo checkout foi criado com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/checkout-admin'] });
      setShowCreateModal(false);
    }
  });

  // Mutation para atualizar checkout
  const updateCheckoutMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CheckoutConfig> }) => {
      const response = await apiRequest('PUT', `/api/checkout-admin/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Checkout atualizado!",
        description: "As alterações foram salvas com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/checkout-admin'] });
      setShowEditModal(false);
    }
  });

  // Mutation para deletar checkout
  const deleteCheckoutMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/checkout-admin/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Checkout deletado!",
        description: "O checkout foi removido com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/checkout-admin'] });
    }
  });

  // Mutation para duplicar checkout
  const duplicateCheckoutMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('POST', `/api/checkout-admin/${id}/duplicate`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Checkout duplicado!",
        description: "Uma cópia do checkout foi criada."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/checkout-admin'] });
    }
  });

  // Formatação de moeda
  const formatPrice = (price: number, currency: string = 'BRL') => {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency
    });
    return formatter.format(price);
  };

  // Formatação de porcentagem
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Copiar URL do checkout
  const copyCheckoutUrl = (id: string) => {
    const url = `${window.location.origin}/checkout/${id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copiada!",
      description: "O link do checkout foi copiado para a área de transferência."
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Checkout System</h1>
          <p className="text-gray-600">Gerencie seus checkouts personalizados</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Checkout
        </Button>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Checkouts</p>
                <p className="text-2xl font-bold">{checkouts?.length || 0}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Visualizações</p>
                <p className="text-2xl font-bold">
                  {checkouts?.reduce((acc, c) => acc + c.stats.views, 0) || 0}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversões</p>
                <p className="text-2xl font-bold">
                  {checkouts?.reduce((acc, c) => acc + c.stats.conversions, 0) || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold">
                  {formatPrice(checkouts?.reduce((acc, c) => acc + c.stats.revenue, 0) || 0)}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Checkouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {checkouts?.map((checkout: CheckoutConfig) => (
          <Card key={checkout.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{checkout.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={checkout.active ? "default" : "secondary"}>
                    {checkout.active ? "Ativo" : "Inativo"}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyCheckoutUrl(checkout.id)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/checkout/${checkout.id}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{checkout.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold">Preço:</span>
                  <span className="text-sm">{formatPrice(checkout.price, checkout.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold">Visualizações:</span>
                  <span className="text-sm">{checkout.stats.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold">Conversões:</span>
                  <span className="text-sm">{checkout.stats.conversions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold">Taxa de Conversão:</span>
                  <span className="text-sm">{formatPercentage(checkout.stats.conversionRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold">Receita:</span>
                  <span className="text-sm font-bold text-green-600">
                    {formatPrice(checkout.stats.revenue, checkout.currency)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedCheckout(checkout);
                    setShowEditModal(true);
                  }}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => duplicateCheckoutMutation.mutate(checkout.id)}
                  disabled={duplicateCheckoutMutation.isPending}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => deleteCheckoutMutation.mutate(checkout.id)}
                  disabled={deleteCheckoutMutation.isPending}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal para Criar Checkout */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Checkout</DialogTitle>
          </DialogHeader>
          <CreateCheckoutForm 
            onSubmit={(data) => createCheckoutMutation.mutate(data)}
            loading={createCheckoutMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para Editar Checkout */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Checkout</DialogTitle>
          </DialogHeader>
          {selectedCheckout && (
            <EditCheckoutForm 
              checkout={selectedCheckout}
              onSubmit={(data) => updateCheckoutMutation.mutate({ 
                id: selectedCheckout.id, 
                data 
              })}
              loading={updateCheckoutMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Componente para criar checkout
const CreateCheckoutForm: React.FC<{
  onSubmit: (data: Partial<CheckoutConfig>) => void;
  loading: boolean;
}> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'BRL',
    billingType: 'one_time',
    features: [''],
    design: {
      primaryColor: '#10b981',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      buttonColor: '#10b981',
      buttonTextColor: '#ffffff',
      testimonials: [],
      urgencyTimer: false,
      socialProof: false,
      guaranteeBadge: true,
      securityBadges: true
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome do Produto</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Preço</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currency">Moeda</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">Real (BRL)</SelectItem>
              <SelectItem value="USD">Dólar (USD)</SelectItem>
              <SelectItem value="EUR">Euro (EUR)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="billingType">Tipo de Cobrança</Label>
          <Select
            value={formData.billingType}
            onValueChange={(value) => setFormData(prev => ({ ...prev, billingType: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one_time">Pagamento Único</SelectItem>
              <SelectItem value="subscription">Assinatura</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Recursos/Benefícios</Label>
        <div className="space-y-2">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder="Ex: Acesso ilimitado à plataforma"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeFeature(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addFeature}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Recurso
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar Checkout"}
        </Button>
      </div>
    </form>
  );
};

// Componente para editar checkout
const EditCheckoutForm: React.FC<{
  checkout: CheckoutConfig;
  onSubmit: (data: Partial<CheckoutConfig>) => void;
  loading: boolean;
}> = ({ checkout, onSubmit, loading }) => {
  const [formData, setFormData] = useState(checkout);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="orderBumps">Order Bumps</TabsTrigger>
          <TabsTrigger value="upsells">Upsells</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Produto</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
            />
            <Label htmlFor="active">Checkout Ativo</Label>
          </div>
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryColor">Cor Primária</Label>
              <Input
                id="primaryColor"
                type="color"
                value={formData.design.primaryColor}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  design: { ...prev.design, primaryColor: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="buttonColor">Cor do Botão</Label>
              <Input
                id="buttonColor"
                type="color"
                value={formData.design.buttonColor}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  design: { ...prev.design, buttonColor: e.target.value }
                }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="urgencyTimer"
                checked={formData.design.urgencyTimer}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  design: { ...prev.design, urgencyTimer: checked }
                }))}
              />
              <Label htmlFor="urgencyTimer">Timer de Urgência</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="socialProof"
                checked={formData.design.socialProof}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  design: { ...prev.design, socialProof: checked }
                }))}
              />
              <Label htmlFor="socialProof">Prova Social</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="guaranteeBadge"
                checked={formData.design.guaranteeBadge}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  design: { ...prev.design, guaranteeBadge: checked }
                }))}
              />
              <Label htmlFor="guaranteeBadge">Badge de Garantia</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="securityBadges"
                checked={formData.design.securityBadges}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  design: { ...prev.design, securityBadges: checked }
                }))}
              />
              <Label htmlFor="securityBadges">Badges de Segurança</Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orderBumps" className="space-y-4">
          <p className="text-sm text-gray-600">
            Configure ofertas complementares que aparecem no checkout
          </p>
          {/* Implementar formulário de order bumps */}
        </TabsContent>

        <TabsContent value="upsells" className="space-y-4">
          <p className="text-sm text-gray-600">
            Configure ofertas especiais após a compra principal
          </p>
          {/* Implementar formulário de upsells */}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 mt-6">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  );
};

export default CheckoutAdmin;