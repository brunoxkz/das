import { useState } from "react";
import { useAuth } from "@/hooks/useAuth-jwt";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink,
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Star,
  AlertCircle
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  commissionRate: number;
  commissionValue: number;
  category: string;
  brand: string;
  affiliateLink: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Affiliation {
  id: string;
  userId: string;
  productId: string;
  status: string;
  affiliateCode: string;
  customLink: string;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

export default function Encapsulados() {
  const { user } = useAuth();
  const userData = user as any;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'myAffiliations'>('marketplace');
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    image: '',
    price: 0,
    commissionRate: 0,
    commissionValue: 0,
    category: '',
    brand: '',
    affiliateLink: ''
  });

  // Buscar produtos
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    enabled: true
  });

  // Buscar afiliações do usuário
  const { data: affiliations, isLoading: affiliationsLoading } = useQuery<Affiliation[]>({
    queryKey: ['/api/affiliations', userData?.id],
    enabled: !!userData?.id
  });

  // Criar produto (apenas admin)
  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/products', {
        ...data,
        createdBy: userData?.id
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Produto criado com sucesso!",
        description: "O produto foi adicionado ao marketplace.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  });

  // Atualizar produto
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PUT', `/api/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Produto atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  });

  // Deletar produto
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/products/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Produto deletado com sucesso!",
        description: "O produto foi removido do marketplace.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar produto",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  });

  // Afiliar-se a produto
  const affiliateMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiRequest('POST', '/api/affiliations', {
        productId,
        userId: userData?.id
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Afiliação criada com sucesso!",
        description: "Agora você pode promover este produto.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/affiliations', userData?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar afiliação",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  });

  // Cancelar afiliação
  const cancelAffiliationMutation = useMutation({
    mutationFn: async (affiliationId: string) => {
      await apiRequest('DELETE', `/api/affiliations/${affiliationId}`);
    },
    onSuccess: () => {
      toast({
        title: "Afiliação cancelada com sucesso!",
        description: "A afiliação foi removida da sua lista.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/affiliations', userData?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cancelar afiliação",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      image: '',
      price: 0,
      commissionRate: 0,
      commissionValue: 0,
      category: '',
      brand: '',
      affiliateLink: ''
    });
  };

  const handleCreateProduct = () => {
    if (!productForm.name || !productForm.price || !productForm.commissionRate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, preço e taxa de comissão.",
        variant: "destructive",
      });
      return;
    }
    createProductMutation.mutate(productForm);
  };

  const handleUpdateProduct = () => {
    if (!selectedProduct || !productForm.name || !productForm.price || !productForm.commissionRate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, preço e taxa de comissão.",
        variant: "destructive",
      });
      return;
    }
    updateProductMutation.mutate({ id: selectedProduct.id, data: productForm });
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      image: product.image || '',
      price: product.price,
      commissionRate: product.commissionRate,
      commissionValue: product.commissionValue || 0,
      category: product.category || '',
      brand: product.brand || '',
      affiliateLink: product.affiliateLink || ''
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este produto?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleAffiliate = (productId: string) => {
    affiliateMutation.mutate(productId);
  };

  const handleCancelAffiliation = (affiliationId: string) => {
    if (window.confirm('Tem certeza que deseja cancelar esta afiliação?')) {
      cancelAffiliationMutation.mutate(affiliationId);
    }
  };

  const isAffiliated = (productId: string) => {
    return affiliations?.some((affiliation: Affiliation) => affiliation.productId === productId) || false;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const productsList = Array.isArray(products) ? products : [];
  const affiliationsList = Array.isArray(affiliations) ? affiliations : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Encapsulados</h1>
          <p className="text-muted-foreground">Marketplace de produtos físicos para afiliação</p>
        </div>
        
        {userData?.role === 'admin' && (
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Produto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Produto*</Label>
                    <Input
                      id="name"
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Suplemento Whey Protein"
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand">Marca</Label>
                    <Input
                      id="brand"
                      value={productForm.brand}
                      onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder="Ex: Growth Supplements"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o produto e seus benefícios..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="image">URL da Imagem</Label>
                    <Input
                      id="image"
                      value={productForm.image}
                      onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={productForm.category} onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="suplementos">Suplementos</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="saude">Saúde</SelectItem>
                        <SelectItem value="beleza">Beleza</SelectItem>
                        <SelectItem value="tecnologia">Tecnologia</SelectItem>
                        <SelectItem value="casa">Casa e Jardim</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Preço (R$)*</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="99.90"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commissionRate">Taxa Comissão (%)*</Label>
                    <Input
                      id="commissionRate"
                      type="number"
                      step="0.01"
                      value={productForm.commissionRate}
                      onChange={(e) => setProductForm(prev => ({ ...prev, commissionRate: parseFloat(e.target.value) || 0 }))}
                      placeholder="10.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commissionValue">Comissão (R$)</Label>
                    <Input
                      id="commissionValue"
                      type="number"
                      step="0.01"
                      value={productForm.commissionValue}
                      onChange={(e) => setProductForm(prev => ({ ...prev, commissionValue: parseFloat(e.target.value) || 0 }))}
                      placeholder="9.99"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="affiliateLink">Link de Afiliação</Label>
                  <Input
                    id="affiliateLink"
                    value={productForm.affiliateLink}
                    onChange={(e) => setProductForm(prev => ({ ...prev, affiliateLink: e.target.value }))}
                    placeholder="https://exemplo.com/produto"
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateProduct} disabled={createProductMutation.isPending}>
                    {createProductMutation.isPending ? 'Criando...' : 'Criar Produto'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`px-4 py-2 font-medium rounded-t-lg ${
            activeTab === 'marketplace'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🛍️ Marketplace
        </button>
        <button
          onClick={() => setActiveTab('myAffiliations')}
          className={`px-4 py-2 font-medium rounded-t-lg ${
            activeTab === 'myAffiliations'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          ⭐ Minhas Afiliações
        </button>
      </div>

      {/* Marketplace Tab */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6">
          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="bg-gray-200 h-40 rounded-lg mb-4"></div>
                    <div className="space-y-2">
                      <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                      <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                      <div className="bg-gray-200 h-3 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : productsList.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum produto disponível</h3>
                <p className="text-muted-foreground">
                  {userData?.role === 'admin' 
                    ? 'Crie o primeiro produto para começar o marketplace.'
                    : 'Aguarde enquanto novos produtos são adicionados.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsList.map((product: Product) => (
                <Card key={product.id} className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${!product.isActive ? 'opacity-60' : ''}`}>
                  <div className="relative">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    {!product.isActive && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="destructive">Inativo</Badge>
                      </div>
                    )}
                    {product.category && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="outline" className="bg-white/90">
                          {product.category}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                        {product.brand && (
                          <p className="text-sm text-muted-foreground">{product.brand}</p>
                        )}
                      </div>
                      
                      {product.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-xl font-bold text-primary">
                            {formatCurrency(product.price)}
                          </div>
                          <div className="text-sm text-green-600">
                            {product.commissionRate}% comissão
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {userData?.role === 'admin' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          
                          {userData?.role !== 'admin' && (
                            <>
                              {isAffiliated(product.id) ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled
                                  className="text-green-600 border-green-600"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Afiliado
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleAffiliate(product.id)}
                                  disabled={affiliateMutation.isPending}
                                >
                                  <Star className="w-4 h-4 mr-2" />
                                  Afiliar
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Affiliations Tab */}
      {activeTab === 'myAffiliations' && (
        <div className="space-y-6">
          {affiliationsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="bg-gray-200 h-40 rounded-lg mb-4"></div>
                    <div className="space-y-2">
                      <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                      <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                      <div className="bg-gray-200 h-3 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : affiliationsList.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma afiliação ativa</h3>
                <p className="text-muted-foreground">
                  Navegue pelo marketplace e afilie-se a produtos para começar a ganhar comissões.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {affiliationsList.map((affiliation: Affiliation) => (
                <Card key={affiliation.id} className="overflow-hidden transition-all duration-200 hover:shadow-lg">
                  <div className="relative">
                    {affiliation.product.image && (
                      <img
                        src={affiliation.product.image}
                        alt={affiliation.product.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={affiliation.status === 'active' ? 'default' : 'secondary'}>
                        {affiliation.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    {affiliation.product.category && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="outline" className="bg-white/90">
                          {affiliation.product.category}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{affiliation.product.name}</h3>
                        {affiliation.product.brand && (
                          <p className="text-sm text-muted-foreground">{affiliation.product.brand}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-xl font-bold text-primary">
                            {formatCurrency(affiliation.product.price)}
                          </div>
                          <div className="text-sm text-green-600">
                            {affiliation.product.commissionRate}% comissão
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {affiliation.product.affiliateLink && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(affiliation.product.affiliateLink, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelAffiliation(affiliation.id)}
                            disabled={cancelAffiliationMutation.isPending}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {affiliation.affiliateCode && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">Código de afiliado:</p>
                          <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                            {affiliation.affiliateCode}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nome do Produto*</Label>
                <Input
                  id="edit-name"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Suplemento Whey Protein"
                />
              </div>
              <div>
                <Label htmlFor="edit-brand">Marca</Label>
                <Input
                  id="edit-brand"
                  value={productForm.brand}
                  onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Ex: Growth Supplements"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={productForm.description}
                onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o produto e seus benefícios..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-image">URL da Imagem</Label>
                <Input
                  id="edit-image"
                  value={productForm.image}
                  onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Categoria</Label>
                <Select value={productForm.category} onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suplementos">Suplementos</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="saude">Saúde</SelectItem>
                    <SelectItem value="beleza">Beleza</SelectItem>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="casa">Casa e Jardim</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-price">Preço (R$)*</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="99.90"
                />
              </div>
              <div>
                <Label htmlFor="edit-commissionRate">Taxa Comissão (%)*</Label>
                <Input
                  id="edit-commissionRate"
                  type="number"
                  step="0.01"
                  value={productForm.commissionRate}
                  onChange={(e) => setProductForm(prev => ({ ...prev, commissionRate: parseFloat(e.target.value) || 0 }))}
                  placeholder="10.00"
                />
              </div>
              <div>
                <Label htmlFor="edit-commissionValue">Comissão (R$)</Label>
                <Input
                  id="edit-commissionValue"
                  type="number"
                  step="0.01"
                  value={productForm.commissionValue}
                  onChange={(e) => setProductForm(prev => ({ ...prev, commissionValue: parseFloat(e.target.value) || 0 }))}
                  placeholder="9.99"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-affiliateLink">Link de Afiliação</Label>
              <Input
                id="edit-affiliateLink"
                value={productForm.affiliateLink}
                onChange={(e) => setProductForm(prev => ({ ...prev, affiliateLink: e.target.value }))}
                placeholder="https://exemplo.com/produto"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateProduct} disabled={updateProductMutation.isPending}>
                {updateProductMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}