import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar, 
  Users, 
  TrendingUp,
  Settings,
  Clock,
  CreditCard,
  Target,
  Zap,
  Shield,
  CheckCircle,
  XCircle
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'one_time' | 'recurring';
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  trial_days: number;
  setup_fee: number;
  features: string[];
  metadata: Record<string, any>;
  gateway_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Gateway {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

export default function ProductBuilder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'BRL',
    type: 'recurring' as 'one_time' | 'recurring',
    recurrence: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    trial_days: 7,
    setup_fee: 0,
    features: [''],
    gateway_id: '',
    active: true
  });

  // Buscar produtos
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["/api/products"],
  });

  // Buscar gateways
  const { data: gatewaysData } = useQuery({
    queryKey: ["/api/payment-gateways"],
  });

  const products = productsData?.products || [];
  const gateways = gatewaysData?.gateways || [];

  // Mutation para criar produto
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      return await apiRequest("POST", "/api/products", productData);
    },
    onSuccess: () => {
      toast({
        title: "Produto criado com sucesso!",
        description: "O produto foi criado e já está disponível.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsCreating(false);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        currency: 'BRL',
        type: 'recurring',
        recurrence: 'monthly',
        trial_days: 7,
        setup_fee: 0,
        features: [''],
        gateway_id: '',
        active: true
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar produto
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...productData }: any) => {
      return await apiRequest("PUT", `/api/products/${id}`, productData);
    },
    onSuccess: () => {
      toast({
        title: "Produto atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setEditingProduct(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar produto
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Produto deletado com sucesso!",
        description: "O produto foi removido permanentemente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar produto",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!newProduct.name || !newProduct.gateway_id) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome e gateway de pagamento.",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      ...newProduct,
      features: newProduct.features.filter(f => f.trim() !== ''),
      metadata: {
        created_by: 'product_builder',
        features_count: newProduct.features.length
      }
    };

    createProductMutation.mutate(productData);
  };

  const handleUpdate = () => {
    if (!editingProduct) return;

    const productData = {
      ...editingProduct,
      features: editingProduct.features.filter(f => f.trim() !== ''),
      metadata: {
        ...editingProduct.metadata,
        updated_by: 'product_builder',
        last_updated: new Date().toISOString()
      }
    };

    updateProductMutation.mutate(productData);
  };

  const addFeature = () => {
    if (isCreating) {
      setNewProduct({
        ...newProduct,
        features: [...newProduct.features, '']
      });
    } else if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        features: [...editingProduct.features, '']
      });
    }
  };

  const removeFeature = (index: number) => {
    if (isCreating) {
      setNewProduct({
        ...newProduct,
        features: newProduct.features.filter((_, i) => i !== index)
      });
    } else if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        features: editingProduct.features.filter((_, i) => i !== index)
      });
    }
  };

  const updateFeature = (index: number, value: string) => {
    if (isCreating) {
      const newFeatures = [...newProduct.features];
      newFeatures[index] = value;
      setNewProduct({
        ...newProduct,
        features: newFeatures
      });
    } else if (editingProduct) {
      const newFeatures = [...editingProduct.features];
      newFeatures[index] = value;
      setEditingProduct({
        ...editingProduct,
        features: newFeatures
      });
    }
  };

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(priceInCents / 100);
  };

  const getRecurrenceLabel = (recurrence: string) => {
    const labels = {
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal',
      yearly: 'Anual'
    };
    return labels[recurrence] || recurrence;
  };

  if (loadingProducts) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Criador de Produtos</h1>
          <p className="text-gray-600 mt-2">
            Crie produtos personalizados com recorrência e trial configuráveis
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Formulário de Criação */}
      {isCreating && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Criar Novo Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Ex: Plano Premium"
                />
              </div>
              <div>
                <Label htmlFor="gateway">Gateway de Pagamento *</Label>
                <Select
                  value={newProduct.gateway_id}
                  onValueChange={(value) => setNewProduct({...newProduct, gateway_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um gateway" />
                  </SelectTrigger>
                  <SelectContent>
                    {gateways.map((gateway: Gateway) => (
                      <SelectItem key={gateway.id} value={gateway.id}>
                        {gateway.name} - {gateway.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                placeholder="Descreva o produto..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="setup_fee">Taxa de Ativação (R$)</Label>
                <Input
                  id="setup_fee"
                  type="number"
                  step="0.01"
                  value={newProduct.setup_fee}
                  onChange={(e) => setNewProduct({...newProduct, setup_fee: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="trial_days">Dias de Trial</Label>
                <Input
                  id="trial_days"
                  type="number"
                  value={newProduct.trial_days}
                  onChange={(e) => setNewProduct({...newProduct, trial_days: parseInt(e.target.value) || 0})}
                  placeholder="7"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="type">Tipo de Produto</Label>
                <Select
                  value={newProduct.type}
                  onValueChange={(value: 'one_time' | 'recurring') => setNewProduct({...newProduct, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">Pagamento Único</SelectItem>
                    <SelectItem value="recurring">Recorrente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newProduct.type === 'recurring' && (
                <div>
                  <Label htmlFor="recurrence">Recorrência</Label>
                  <Select
                    value={newProduct.recurrence}
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => setNewProduct({...newProduct, recurrence: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div>
              <Label>Funcionalidades</Label>
              <div className="space-y-2">
                {newProduct.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Ex: Quizzes ilimitados"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFeature}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Funcionalidade
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={newProduct.active}
                onCheckedChange={(checked) => setNewProduct({...newProduct, active: checked})}
              />
              <Label htmlFor="active">Produto Ativo</Label>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleSubmit}
                disabled={createProductMutation.isPending}
              >
                {createProductMutation.isPending ? 'Criando...' : 'Criar Produto'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCreating(false)}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product: Product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProduct(product)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteProductMutation.mutate(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(product.price)}
                  </span>
                  <Badge variant={product.active ? "default" : "secondary"}>
                    {product.active ? (
                      <><CheckCircle className="w-3 h-3 mr-1" />Ativo</>
                    ) : (
                      <><XCircle className="w-3 h-3 mr-1" />Inativo</>
                    )}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {product.type === 'recurring' ? 
                      `${getRecurrenceLabel(product.recurrence || '')}` : 
                      'Pagamento único'
                    }
                  </span>
                </div>

                {product.trial_days > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-600">
                      {product.trial_days} dias de trial
                    </span>
                  </div>
                )}

                {product.setup_fee > 0 && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600">
                      Taxa: {formatPrice(product.setup_fee)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-purple-600">
                    {gateways.find(g => g.id === product.gateway_id)?.name || 'Gateway'}
                  </span>
                </div>

                {product.features.length > 0 && (
                  <div className="pt-2">
                    <Label className="text-xs text-gray-500 mb-1">Funcionalidades:</Label>
                    <div className="flex flex-wrap gap-1">
                      {product.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {product.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.features.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && !isCreating && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum produto criado ainda
          </h3>
          <p className="text-gray-600 mb-4">
            Crie seu primeiro produto personalizado com recorrência configurável
          </p>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Produto
          </Button>
        </div>
      )}
    </div>
  );
}