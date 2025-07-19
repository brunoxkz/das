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
  AlertCircle,
  Percent,
  Calendar,
  Repeat,
  Gift,
  TestTube,
  Layers,
  Save,
  Loader2,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth-sqlite";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function CheckoutAdmin() {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("planos");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [showTrialDialog, setShowTrialDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'BRL',
    interval: 'month',
    trial_days: 7,
    trial_price: 1.00,
    features: [],
    gateway: 'stripe',
    active: true,
    stripe_price_id: '',
    pagarme_plan_id: ''
  });

  // Buscar planos existentes
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["/api/stripe/plans"],
    enabled: isAuthenticated,
  });

  // Buscar configurações do sistema
  const { data: systemConfig, isLoading: configLoading } = useQuery({
    queryKey: ["/api/checkout/config"],
    enabled: isAuthenticated,
  });

  // Buscar analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/checkout/analytics"],
    enabled: isAuthenticated,
  });

  // Mutation para criar/editar plano
  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const endpoint = editingPlan ? `/api/stripe/plans/${editingPlan.id}` : '/api/stripe/plans';
      const method = editingPlan ? 'PUT' : 'POST';
      return apiRequest(method, endpoint, planData);
    },
    onSuccess: () => {
      toast({
        title: editingPlan ? "Plano atualizado" : "Plano criado",
        description: editingPlan ? "Plano atualizado com sucesso!" : "Plano criado com sucesso no Stripe!",
      });
      setShowCreateDialog(false);
      setEditingPlan(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/stripe/plans'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar plano",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar plano
  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/stripe/plans/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Plano deletado",
        description: "Plano deletado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/stripe/plans'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar plano",
        variant: "destructive",
      });
    },
  });

  // Mutation para criar checkout session
  const createCheckoutMutation = useMutation({
    mutationFn: async (planData: any) => {
      return apiRequest('POST', '/api/stripe/create-checkout-session', planData);
    },
    onSuccess: (response: any) => {
      toast({
        title: "Checkout criado!",
        description: "Sessão de checkout criada com sucesso!",
      });
      if (response.url) {
        window.open(response.url, '_blank');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar checkout",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'BRL',
      interval: 'month',
      trial_days: 7,
      trial_price: 1.00,
      features: [],
      gateway: 'stripe',
      active: true,
      stripe_price_id: '',
      pagarme_plan_id: ''
    });
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome e preço",
        variant: "destructive",
      });
      return;
    }

    createPlanMutation.mutate(formData);
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name || '',
      description: plan.description || '',
      price: plan.price || '',
      currency: plan.currency || 'BRL',
      interval: plan.interval || 'month',
      trial_days: plan.trial_days || 7,
      trial_price: plan.trial_price || 1.00,
      features: plan.features || [],
      gateway: plan.gateway || 'stripe',
      active: plan.active !== false,
      stripe_price_id: plan.stripe_price_id || '',
      pagarme_plan_id: plan.pagarme_plan_id || ''
    });
    setShowCreateDialog(true);
  };

  const handleTestCheckout = (plan: any) => {
    createCheckoutMutation.mutate({
      plan_id: plan.id,
      trial_days: plan.trial_days || 7,
      trial_price: plan.trial_price || 1.00,
      success_url: window.location.origin + '/checkout/success',
      cancel_url: window.location.origin + '/checkout-admin'
    });
  };

  const formatPrice = (price: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

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
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Administração de Checkout</h1>
        <p className="text-gray-600">Gerencie planos, trials e configurações de pagamento</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="planos" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Planos
          </TabsTrigger>
          <TabsTrigger value="trials" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Trials
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="planos" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Gerenciar Planos
                </CardTitle>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetForm(); setEditingPlan(null); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Plano
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nome do Plano</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleFormChange('name', e.target.value)}
                            placeholder="Ex: Plano Premium"
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Preço (R$)</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => handleFormChange('price', e.target.value)}
                            placeholder="29.90"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleFormChange('description', e.target.value)}
                          placeholder="Descrição do plano..."
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="interval">Recorrência</Label>
                          <Select value={formData.interval} onValueChange={(value) => handleFormChange('interval', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="month">Mensal</SelectItem>
                              <SelectItem value="year">Anual</SelectItem>
                              <SelectItem value="week">Semanal</SelectItem>
                              <SelectItem value="day">Diário</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="trial_days">Dias de Trial</Label>
                          <Input
                            id="trial_days"
                            type="number"
                            value={formData.trial_days}
                            onChange={(e) => handleFormChange('trial_days', parseInt(e.target.value))}
                            placeholder="7"
                          />
                        </div>
                        <div>
                          <Label htmlFor="trial_price">Preço Trial (R$)</Label>
                          <Input
                            id="trial_price"
                            type="number"
                            step="0.01"
                            value={formData.trial_price}
                            onChange={(e) => handleFormChange('trial_price', parseFloat(e.target.value))}
                            placeholder="1.00"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="gateway">Gateway</Label>
                          <Select value={formData.gateway} onValueChange={(value) => handleFormChange('gateway', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="stripe">Stripe</SelectItem>
                              <SelectItem value="pagarme">Pagar.me</SelectItem>
                              <SelectItem value="both">Ambos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="currency">Moeda</Label>
                          <Select value={formData.currency} onValueChange={(value) => handleFormChange('currency', value)}>
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
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="active"
                          checked={formData.active}
                          onCheckedChange={(checked) => handleFormChange('active', checked)}
                        />
                        <Label htmlFor="active">Plano Ativo</Label>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowCreateDialog(false)}
                          disabled={createPlanMutation.isPending}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleSubmit}
                          disabled={createPlanMutation.isPending}
                        >
                          {createPlanMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              {editingPlan ? 'Atualizar' : 'Criar'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {plansLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plans.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhum plano criado ainda</p>
                    </div>
                  ) : (
                    plans.map((plan: any) => (
                      <Card key={plan.id} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{plan.name}</CardTitle>
                              <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                            </div>
                            <Badge variant={plan.active ? "default" : "secondary"}>
                              {plan.active ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Preço:</span>
                              <span className="font-medium">{formatPrice(plan.price)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Recorrência:</span>
                              <span className="font-medium">{plan.interval}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Trial:</span>
                              <span className="font-medium">{plan.trial_days} dias</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Preço Trial:</span>
                              <span className="font-medium">{formatPrice(plan.trial_price)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Gateway:</span>
                              <Badge variant="outline">{plan.gateway}</Badge>
                            </div>
                          </div>
                          
                          <Separator className="my-4" />
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(plan)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTestCheckout(plan)}
                              className="flex-1"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Testar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Configurações de Trial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Configurações Padrão</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Dias de Trial Padrão</Label>
                      <Input className="w-24" defaultValue="7" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Preço Trial Padrão</Label>
                      <Input className="w-24" defaultValue="1.00" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Cancelamento Automático</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Opções de Trial</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Trial 3 dias - R$ 1,00</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Trial 7 dias - R$ 1,00</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Trial 14 dias - R$ 3,00</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Trial 30 dias - R$ 7,00</span>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Stripe</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Chave Pública</Label>
                      <Input 
                        value="pk_test_51RjvV9HK6al3veW1..." 
                        className="font-mono text-sm"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label>Webhook Secret</Label>
                      <Input 
                        value="whsec_sONTMghN2cWLAW..." 
                        className="font-mono text-sm"
                        readOnly
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Ativo</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Pagar.me</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Chave Pública</Label>
                      <Input 
                        placeholder="pk_test_..." 
                        className="font-mono text-sm"
                      />
                    </div>
                    <div>
                      <Label>Webhook Secret</Label>
                      <Input 
                        placeholder="whsec_..." 
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch />
                      <Label>Ativo</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Checkouts Criados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-gray-500">+12% este mês</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Conversões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-gray-500">+8% este mês</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">57%</div>
                <p className="text-xs text-gray-500">+3% este mês</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Receita</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 2.689</div>
                <p className="text-xs text-gray-500">+15% este mês</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Teste Rápido do Checkout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Teste o checkout com trial implementado. Use os dados de teste do Stripe:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Dados de Teste Stripe:</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Cartão:</strong> 4242 4242 4242 4242</p>
                    <p><strong>Validade:</strong> 12/25</p>
                    <p><strong>CVC:</strong> 123</p>
                    <p><strong>Nome:</strong> Qualquer nome</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link href="/checkout-stripe-trial">
                    <Button>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Testar Checkout Trial
                    </Button>
                  </Link>
                  <Link href="/checkout-unified">
                    <Button variant="outline">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Testar Checkout Unificado
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}