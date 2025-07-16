import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Copy,
  Settings,
  BarChart3,
  Users,
  DollarSign,
  ShoppingCart,
  Package,
  Globe,
  Palette,
  Code,
  Zap,
  CreditCard,
  FileText,
  Target,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth-jwt";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function CheckoutSystem() {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("produtos");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Buscar produtos de checkout
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/checkout-products"],
    enabled: isAuthenticated,
  });

  // Buscar transações
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/checkout-transactions"],
    enabled: isAuthenticated,
  });

  // Buscar analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/checkout-analytics"],
    enabled: isAuthenticated,
  });

  // Mutation para criar/editar produto
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const endpoint = editingProduct ? `/api/checkout-products/${editingProduct.id}` : '/api/checkout-products';
      const method = editingProduct ? 'PUT' : 'POST';
      return apiRequest(method, endpoint, productData);
    },
    onSuccess: () => {
      toast({
        title: editingProduct ? "Produto atualizado" : "Produto criado",
        description: editingProduct ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!",
      });
      setShowCreateDialog(false);
      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: ['/api/checkout-products'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar produto",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar produto
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/checkout-products/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Produto deletado",
        description: "Produto deletado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/checkout-products'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar produto",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você precisa fazer login para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Sistema de Checkout</h1>
            <p className="text-gray-600 mt-2">Gerencie seus produtos, transações e analytics de checkout</p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Produto
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="produtos">
              <Package className="w-4 h-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="transacoes">
              <CreditCard className="w-4 h-4 mr-2" />
              Transações
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="configuracoes">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Tab: Produtos */}
          <TabsContent value="produtos" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productsLoading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando produtos...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum produto encontrado</h3>
                  <p className="text-gray-500 mb-4">Crie seu primeiro produto de checkout</p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Produto
                  </Button>
                </div>
              ) : (
                products.map((product: any) => (
                  <Card key={product.id} className="border-2 border-gray-200 hover:border-green-300 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingProduct(product);
                              setShowCreateDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
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
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-green-600">
                            R$ {product.price}
                          </span>
                          <Badge variant={product.active ? "default" : "secondary"}>
                            {product.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Tipo:</span>
                            <span className="ml-1 font-medium">
                              {product.paymentMode === 'recurring' ? 'Recorrente' : 'Único'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Trial:</span>
                            <span className="ml-1 font-medium">
                              {product.trialPeriod ? `${product.trialPeriod} dias` : 'Não'}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-2 mt-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const url = `${window.location.origin}/checkout-individual/${product.id}`;
                              navigator.clipboard.writeText(url);
                              toast({
                                title: "Link copiado!",
                                description: "Link do checkout copiado para a área de transferência",
                              });
                            }}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copiar Link
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(`/checkout-individual/${product.id}`, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Visualizar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Tab: Transações */}
          <TabsContent value="transacoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando transações...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhuma transação encontrada</h3>
                    <p className="text-gray-500">As transações aparecerão aqui quando os clientes fizerem compras</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction: any) => (
                      <div key={transaction.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">Transação #{transaction.id.slice(-8)}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(transaction.createdAt).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <Badge 
                            variant={
                              transaction.status === 'paid' ? 'default' : 
                              transaction.status === 'pending' ? 'secondary' : 
                              'destructive'
                            }
                          >
                            {transaction.status === 'paid' ? 'Pago' : 
                             transaction.status === 'pending' ? 'Pendente' : 
                             'Falhou'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Valor:</span>
                            <span className="ml-1 font-medium">R$ {transaction.totalAmount}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Cliente:</span>
                            <span className="ml-1 font-medium">
                              {transaction.customerData?.firstName} {transaction.customerData?.lastName}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Email:</span>
                            <span className="ml-1 font-medium">{transaction.customerData?.email}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Produto:</span>
                            <span className="ml-1 font-medium">
                              {products.find((p: any) => p.id === transaction.checkoutId)?.name || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Total de Produtos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Total de Transações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{transactions.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Receita Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    R$ {transactions
                      .filter((t: any) => t.status === 'paid')
                      .reduce((sum: number, t: any) => sum + t.totalAmount, 0)
                      .toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Taxa de Conversão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {transactions.length > 0 ? 
                      ((transactions.filter((t: any) => t.status === 'paid').length / transactions.length) * 100).toFixed(1) : 0}%
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Configurações */}
          <TabsContent value="configuracoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Integração Stripe</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Sistema Configurado</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Sistema de checkout pronto para uso.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog para criar/editar produto */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Criar Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            <ProductForm 
              product={editingProduct}
              onSubmit={(data) => createProductMutation.mutate(data)}
              onCancel={() => {
                setShowCreateDialog(false);
                setEditingProduct(null);
              }}
              loading={createProductMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Componente do formulário de produto
function ProductForm({ product, onSubmit, onCancel, loading }: {
  product?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || 'digital',
    price: product?.price || '',
    originalPrice: product?.originalPrice || '',
    paymentMode: product?.paymentMode || 'one_time',
    recurringInterval: product?.recurringInterval || 'monthly',
    trialPeriod: product?.trialPeriod || '',
    features: product?.features ? product.features.join('\n') : '',
    active: product?.active !== undefined ? product.active : true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
      trialPeriod: formData.trialPeriod ? parseInt(formData.trialPeriod) : null,
      features: formData.features.split('\n').filter(f => f.trim()),
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Ex: Curso de Marketing Digital"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="category">Categoria</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="digital">Produto Digital</SelectItem>
              <SelectItem value="curso">Curso Online</SelectItem>
              <SelectItem value="ebook">E-book</SelectItem>
              <SelectItem value="software">Software</SelectItem>
              <SelectItem value="consultoria">Consultoria</SelectItem>
              <SelectItem value="assinatura">Assinatura</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Descreva seu produto..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="price">Preço (R$) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            placeholder="29.90"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="originalPrice">Preço Original (R$)</Label>
          <Input
            id="originalPrice"
            type="number"
            step="0.01"
            value={formData.originalPrice}
            onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
            placeholder="59.90"
          />
        </div>
        
        <div>
          <Label htmlFor="paymentMode">Tipo de Pagamento</Label>
          <Select value={formData.paymentMode} onValueChange={(value) => setFormData({...formData, paymentMode: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one_time">Pagamento Único</SelectItem>
              <SelectItem value="recurring">Recorrente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="features">Recursos (um por linha)</Label>
        <Textarea
          id="features"
          value={formData.features}
          onChange={(e) => setFormData({...formData, features: e.target.value})}
          placeholder="Acesso vitalício&#10;Suporte 24/7&#10;Certificado de conclusão"
          rows={4}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={formData.active}
          onCheckedChange={(checked) => setFormData({...formData, active: checked})}
        />
        <Label htmlFor="active">Produto ativo</Label>
      </div>

      <div className="flex space-x-3 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Salvando...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              {product ? 'Atualizar' : 'Criar'} Produto
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}