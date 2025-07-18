import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, CreditCard, Clock, RefreshCw, AlertCircle, Plus, Edit, Trash2, Copy, ExternalLink, Settings, Package, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function CheckoutSimpleTrial() {
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [webhookResult, setWebhookResult] = useState(null);
  const [activeTab, setActiveTab] = useState('checkout');
  const [formData, setFormData] = useState({
    productName: 'Vendzz Pro',
    description: 'Plataforma completa de quiz funnels',
    activationPrice: 1.00,
    trialDays: 3,
    recurringPrice: 29.90,
    currency: 'BRL'
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planFormData, setPlanFormData] = useState({
    name: '',
    description: '',
    price: 29.90,
    currency: 'BRL',
    interval: 'month',
    trial_days: 3,
    trial_price: 1.00,
    features: [],
    active: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar planos existentes
  const plansQuery = useQuery({
    queryKey: ['/api/stripe/plans'],
    refetchInterval: 30000
  });

  // Mutação para criar plano
  const createPlanMutation = useMutation({
    mutationFn: async (planData) => {
      return await apiRequest('POST', '/api/stripe/plans', planData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stripe/plans'] });
      toast({
        title: "Plano criado com sucesso!",
        description: "O plano foi criado e está disponível para uso.",
      });
      setIsCreateDialogOpen(false);
      setPlanFormData({
        name: '',
        description: '',
        price: 29.90,
        currency: 'BRL',
        interval: 'month',
        trial_days: 3,
        trial_price: 1.00,
        features: [],
        active: true
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar plano",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutação para editar plano
  const editPlanMutation = useMutation({
    mutationFn: async ({ id, planData }) => {
      return await apiRequest('PUT', `/api/stripe/plans/${id}`, planData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stripe/plans'] });
      toast({
        title: "Plano atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
      setIsEditDialogOpen(false);
      setEditingPlan(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar plano",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutação para deletar plano
  const deletePlanMutation = useMutation({
    mutationFn: async (planId) => {
      return await apiRequest('DELETE', `/api/stripe/plans/${planId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stripe/plans'] });
      toast({
        title: "Plano excluído",
        description: "O plano foi removido com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao deletar plano",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Funções para manipulação de planos
  const handleCreatePlan = async () => {
    if (!planFormData.name || !planFormData.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e preço são obrigatórios",
        variant: "destructive",
      });
      return;
    }
    createPlanMutation.mutate({
      ...planFormData,
      userId: 'admin-user-id'
    });
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setPlanFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price,
      currency: plan.currency || 'BRL',
      interval: plan.interval,
      trial_days: plan.trial_days,
      trial_price: plan.trial_price,
      features: plan.features || [],
      active: plan.active
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan || !planFormData.name || !planFormData.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e preço são obrigatórios",
        variant: "destructive",
      });
      return;
    }
    editPlanMutation.mutate({ id: editingPlan.id, planData: planFormData });
  };

  const handleDeletePlan = async (planId) => {
    if (confirm('Tem certeza que deseja deletar este plano?')) {
      deletePlanMutation.mutate(planId);
    }
  };

  const generateCheckoutUrl = async (planId) => {
    try {
      const response = await apiRequest('POST', '/api/stripe/simple-trial', { 
        productName: 'Plano ' + planId,
        description: 'Checkout automático',
        activationPrice: 1.00,
        trialDays: 3,
        recurringPrice: 29.90,
        currency: 'BRL'
      });
      
      if (response.success && response.checkoutUrl) {
        const checkoutUrl = response.checkoutUrl;
        navigator.clipboard.writeText(checkoutUrl);
        toast({
          title: "URL copiada!",
          description: "Link de checkout copiado para área de transferência",
        });
        return checkoutUrl;
      } else {
        throw new Error('Erro ao gerar URL de checkout');
      }
    } catch (error) {
      console.error('Erro ao gerar URL:', error);
      toast({
        title: "Erro ao gerar URL",
        description: error.message || 'Erro desconhecido',
        variant: "destructive",
      });
    }
  };

  const handleCreateCheckout = async () => {
    setLoading(true);
    setCheckoutData(null);
    setWebhookResult(null);

    try {
      const response = await apiRequest('POST', '/api/stripe/create-simple-trial', formData);
      
      if (response.success) {
        setCheckoutData(response);
        toast({
          title: "Checkout criado com sucesso!",
          description: "Componentes Stripe criados sem erros",
        });
      } else {
        throw new Error(response.message || 'Erro ao criar checkout');
      }
    } catch (error) {
      toast({
        title: "Erro ao criar checkout",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateWebhook = async () => {
    setLoading(true);
    setWebhookResult(null);

    try {
      const webhookData = {
        type: 'payment_intent.succeeded',
        simulate: true
      };

      const response = await apiRequest('POST', '/api/stripe/test-webhook', webhookData);
      
      if (response.success) {
        setWebhookResult(response);
        toast({
          title: "Webhook simulado com sucesso!",
          description: "Conversão trial → recorrência funcionando",
        });
      } else {
        throw new Error(response.message || 'Erro na simulação do webhook');
      }
    } catch (error) {
      toast({
        title: "Erro na simulação do webhook",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureToggle = (featureId) => {
    setPlanFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(id => id !== featureId)
        : [...prev.features, featureId]
    }));
  };

  // Função para atualizar plano (reutilizando a mutation existente)
  const handleUpdatePlanAdvanced = async () => {
    if (!editingPlan) return;
    editPlanMutation.mutate({ id: editingPlan.id, planData: planFormData });
  };

  const plans = Array.isArray(plansQuery.data) ? plansQuery.data : [];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sistema de Checkout Stripe</h1>
        <p className="text-gray-600">Pagamento Único R$1 + Subscription R$29,90/mês</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="checkout">Checkout</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="advanced-plans">Planos Avançados</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="checkout" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Checkout</CardTitle>
                <CardDescription>Defina os parâmetros do seu checkout</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="productName">Nome do Produto</Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="activationPrice">Pagamento Único (R$)</Label>
                    <Input
                      id="activationPrice"
                      type="number"
                      step="0.01"
                      value={formData.activationPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, activationPrice: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="trialDays">Dias de Trial</Label>
                    <Input
                      id="trialDays"
                      type="number"
                      value={formData.trialDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, trialDays: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="recurringPrice">Valor Recorrente (R$)</Label>
                  <Input
                    id="recurringPrice"
                    type="number"
                    step="0.01"
                    value={formData.recurringPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurringPrice: parseFloat(e.target.value) }))}
                  />
                </div>
                <Button onClick={handleCreateCheckout} disabled={loading} className="w-full">
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                  Criar Checkout
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resultado do Checkout</CardTitle>
                <CardDescription>Detalhes dos componentes Stripe criados</CardDescription>
              </CardHeader>
              <CardContent>
                {checkoutData ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Checkout criado com sucesso!</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><strong>Customer ID:</strong> {checkoutData.customerId}</p>
                      <p><strong>Payment Intent ID:</strong> {checkoutData.paymentIntentId}</p>
                      <p><strong>Session ID:</strong> {checkoutData.sessionId}</p>
                      <p><strong>URL de Checkout:</strong> <a href={checkoutData.checkoutUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Abrir checkout</a></p>
                    </div>
                    <Button onClick={handleSimulateWebhook} disabled={loading} className="w-full">
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
                      Simular Webhook
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <p>Nenhum checkout criado ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="mt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciar Planos</h2>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Plano
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Plano</DialogTitle>
                    <DialogDescription>Configure os detalhes do seu plano de assinatura</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="planName">Nome do Plano</Label>
                        <Input
                          id="planName"
                          value={planFormData.name}
                          onChange={(e) => setPlanFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Plano Premium"
                        />
                      </div>
                      <div>
                        <Label htmlFor="planPrice">Preço (R$)</Label>
                        <Input
                          id="planPrice"
                          type="number"
                          step="0.01"
                          value={planFormData.price}
                          onChange={(e) => setPlanFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="planDescription">Descrição</Label>
                      <Textarea
                        id="planDescription"
                        value={planFormData.description}
                        onChange={(e) => setPlanFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descreva os benefícios do plano..."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="trialPrice">Pagamento Único (R$)</Label>
                        <Input
                          id="trialPrice"
                          type="number"
                          step="0.01"
                          value={planFormData.trial_price}
                          onChange={(e) => setPlanFormData(prev => ({ ...prev, trial_price: parseFloat(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="trialDays">Dias de Trial</Label>
                        <Input
                          id="trialDays"
                          type="number"
                          value={planFormData.trial_days}
                          onChange={(e) => setPlanFormData(prev => ({ ...prev, trial_days: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="interval">Intervalo</Label>
                        <Select value={planFormData.interval} onValueChange={(value) => setPlanFormData(prev => ({ ...prev, interval: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="month">Mensal</SelectItem>
                            <SelectItem value="year">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Recursos Inclusos</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {[
                          { id: 'sms', label: 'SMS Marketing' },
                          { id: 'email', label: 'Email Marketing' },
                          { id: 'whatsapp', label: 'WhatsApp Business' },
                          { id: 'analytics', label: 'Analytics Avançado' }
                        ].map(feature => (
                          <div key={feature.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={feature.id}
                              checked={planFormData.features.includes(feature.id)}
                              onCheckedChange={() => handleFeatureToggle(feature.id)}
                            />
                            <Label htmlFor={feature.id}>{feature.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreatePlan} disabled={createPlanMutation.isPending}>
                        {createPlanMutation.isPending ? 'Criando...' : 'Criar Plano'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plansQuery.isLoading ? (
                <div className="col-span-full text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p>Carregando planos...</p>
                </div>
              ) : plans.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4" />
                  <p>Nenhum plano criado ainda</p>
                </div>
              ) : (
                plans.map((plan) => (
                  <Card key={plan.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                        </div>
                        <Badge variant={plan.active ? "default" : "secondary"}>
                          {plan.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Pagamento Único:</span>
                          <span className="font-medium">R$ {plan.trial_price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Trial:</span>
                          <span className="font-medium">{plan.trial_days} dias</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Recorrência:</span>
                          <span className="font-medium">R$ {plan.price.toFixed(2)}/{plan.interval === 'month' ? 'mês' : 'ano'}</span>
                        </div>
                        {plan.features && plan.features.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {plan.features.map((feature) => (
                              <Badge key={feature} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-between space-x-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPlan(plan)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateCheckoutUrl(plan.id)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            URL
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced-plans" className="mt-6">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Formulário de Criação/Edição */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}
                  </CardTitle>
                  <CardDescription>
                    Configure todos os detalhes do seu plano de assinatura
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="advancedPlanName">Nome do Plano</Label>
                    <Input
                      id="advancedPlanName"
                      value={planFormData.name}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Plano Premium"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="advancedPlanDescription">Descrição</Label>
                    <Textarea
                      id="advancedPlanDescription"
                      value={planFormData.description}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva os benefícios do plano..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="advancedOneTimePayment">Pagamento Único (R$)</Label>
                      <Input
                        id="advancedOneTimePayment"
                        type="number"
                        step="0.01"
                        value={planFormData.trial_price}
                        onChange={(e) => setPlanFormData(prev => ({ ...prev, trial_price: parseFloat(e.target.value) }))}
                        placeholder="1.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="advancedTrialDays">Dias de Trial</Label>
                      <Input
                        id="advancedTrialDays"
                        type="number"
                        min="0"
                        max="30"
                        value={planFormData.trial_days}
                        onChange={(e) => setPlanFormData(prev => ({ ...prev, trial_days: parseInt(e.target.value) }))}
                        placeholder="3"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="advancedRecurringPrice">Valor Recorrente (R$)</Label>
                      <Input
                        id="advancedRecurringPrice"
                        type="number"
                        step="0.01"
                        value={planFormData.price}
                        onChange={(e) => setPlanFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                        placeholder="29.90"
                      />
                    </div>
                    <div>
                      <Label htmlFor="advancedInterval">Período de Cobrança</Label>
                      <Select value={planFormData.interval} onValueChange={(value) => setPlanFormData(prev => ({ ...prev, interval: value }))}>
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
                  </div>

                  <div>
                    <Label>Recursos Inclusos</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        { id: 'sms', label: 'SMS Marketing' },
                        { id: 'email', label: 'Email Marketing' },
                        { id: 'whatsapp', label: 'WhatsApp Business' },
                        { id: 'analytics', label: 'Analytics Avançado' },
                        { id: 'automation', label: 'Automações' },
                        { id: 'integrations', label: 'Integrações' },
                        { id: 'support', label: 'Suporte Priority' },
                        { id: 'custom', label: 'Personalização' }
                      ].map(feature => (
                        <div key={feature.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={feature.id}
                            checked={planFormData.features.includes(feature.id)}
                            onCheckedChange={() => handleFeatureToggle(feature.id)}
                          />
                          <Label htmlFor={feature.id} className="text-sm">{feature.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="planActive"
                      checked={planFormData.active}
                      onCheckedChange={(checked) => setPlanFormData(prev => ({ ...prev, active: checked }))}
                    />
                    <Label htmlFor="planActive">Plano Ativo</Label>
                  </div>

                  <div className="flex space-x-2">
                    {editingPlan ? (
                      <>
                        <Button onClick={handleUpdatePlanAdvanced} disabled={editPlanMutation.isPending} className="flex-1">
                          {editPlanMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                          Atualizar Plano
                        </Button>
                        <Button variant="outline" onClick={() => { setEditingPlan(null); setIsEditDialogOpen(false); }}>
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button onClick={handleCreatePlan} disabled={createPlanMutation.isPending} className="w-full">
                        {createPlanMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        Criar Plano
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Preview do Plano */}
              <Card>
                <CardHeader>
                  <CardTitle>Preview do Plano</CardTitle>
                  <CardDescription>Como o plano aparecerá para os clientes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-purple-50">
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">{planFormData.name || 'Nome do Plano'}</h3>
                      <p className="text-sm text-gray-600 mb-4">{planFormData.description || 'Descrição do plano'}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Pagamento Único:</span>
                          <span className="font-bold text-green-600">R$ {planFormData.trial_price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Trial Gratuito:</span>
                          <span className="font-medium">{planFormData.trial_days} dias</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Após Trial:</span>
                          <span className="font-bold text-blue-600">R$ {planFormData.price.toFixed(2)}/{planFormData.interval === 'month' ? 'mês' : planFormData.interval === 'year' ? 'ano' : planFormData.interval === 'week' ? 'semana' : 'dia'}</span>
                        </div>
                      </div>

                      {planFormData.features.length > 0 && (
                        <div className="text-left">
                          <h4 className="font-semibold text-sm mb-2">Recursos Inclusos:</h4>
                          <div className="space-y-1">
                            {planFormData.features.map(feature => (
                              <div key={feature} className="flex items-center text-sm">
                                <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                                <span>{feature.charAt(0).toUpperCase() + feature.slice(1)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Planos com Stripe Elements */}
            <Card>
              <CardHeader>
                <CardTitle>Planos Criados</CardTitle>
                <CardDescription>Gerencie seus planos e obtenha códigos de embed</CardDescription>
              </CardHeader>
              <CardContent>
                {plansQuery.isLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p>Carregando planos...</p>
                  </div>
                ) : plans.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4" />
                    <p>Nenhum plano criado ainda</p>
                    <p className="text-sm">Crie seu primeiro plano usando o formulário acima</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {plans.map((plan) => (
                      <Card key={plan.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Informações do Plano */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-xl">{plan.name}</h3>
                                <Badge variant={plan.active ? "default" : "secondary"}>
                                  {plan.active ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{plan.description}</p>
                              
                              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Pagamento Único</div>
                                    <div className="font-bold text-green-600">R$ {plan.trial_price.toFixed(2)}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Trial Gratuito</div>
                                    <div className="font-medium">{plan.trial_days} dias</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Recorrência</div>
                                    <div className="font-bold text-blue-600">R$ {plan.price.toFixed(2)}/{plan.interval === 'month' ? 'mês' : plan.interval === 'year' ? 'ano' : plan.interval === 'week' ? 'semana' : 'dia'}</div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingPlan(plan);
                                    setPlanFormData({
                                      name: plan.name,
                                      description: plan.description || '',
                                      price: plan.price,
                                      currency: plan.currency || 'BRL',
                                      interval: plan.interval,
                                      trial_days: plan.trial_days,
                                      trial_price: plan.trial_price,
                                      features: plan.features || [],
                                      active: plan.active
                                    });
                                  }}
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Editar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => generateCheckoutUrl(plan.id)}
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copiar URL
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeletePlan(plan.id)}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Excluir
                                </Button>
                              </div>
                            </div>

                            {/* Checkout Embed REAL e Funcional */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-lg">🔥 Checkout Real - Teste Agora!</h4>
                                <Badge variant="secondary">Pronto para usar</Badge>
                              </div>
                              
                              {/* Embed do Checkout Real */}
                              <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
                                <div className="text-center space-y-4">
                                  <div>
                                    <h5 className="font-bold text-lg mb-2">{plan.name}</h5>
                                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                                    <div className="text-2xl font-bold text-blue-600 mb-2">
                                      R$ {plan.trial_price.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-4">
                                      Depois R$ {plan.price.toFixed(2)}/{plan.interval === 'month' ? 'mês' : 'ano'} após {plan.trial_days} dias de trial
                                    </div>
                                  </div>
                                  
                                  <Button
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                                    onClick={async () => {
                                      try {
                                        const response = await apiRequest('POST', '/api/stripe/simple-trial', {
                                          productName: plan.name,
                                          description: plan.description,
                                          activationPrice: plan.trial_price,
                                          trialDays: plan.trial_days,
                                          recurringPrice: plan.price,
                                          currency: plan.currency || 'BRL'
                                        });
                                        
                                        if (response.success && response.checkoutUrl) {
                                          window.open(response.checkoutUrl, '_blank');
                                        } else {
                                          toast({
                                            title: "Erro no checkout",
                                            description: response.message || "Erro ao criar checkout",
                                            variant: "destructive"
                                          });
                                        }
                                      } catch (error) {
                                        toast({
                                          title: "Erro no checkout",
                                          description: error.message,
                                          variant: "destructive"
                                        });
                                      }
                                    }}
                                  >
                                    🚀 Iniciar Checkout Real
                                  </Button>
                                  
                                  <div className="text-xs text-gray-500 mt-2">
                                    ✅ Checkout 100% funcional • Stripe oficial • Cartão será salvo
                                  </div>
                                </div>
                              </div>
                              
                              {/* Código de Embed */}
                              <div className="space-y-2">
                                <h5 className="font-medium text-sm">Código de Embed para Site</h5>
                                <div className="bg-gray-100 rounded p-3">
                                  <code className="text-xs text-gray-700 break-all">
                                    {`<iframe src="${window.location.origin}/checkout-embed/${plan.id}" width="100%" height="600" frameborder="0"></iframe>`}
                                  </code>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const embedCode = `<iframe src="${window.location.origin}/checkout-embed/${plan.id}" width="100%" height="600" frameborder="0"></iframe>`;
                                    navigator.clipboard.writeText(embedCode);
                                    toast({
                                      title: "Código copiado!",
                                      description: "Código de embed copiado para área de transferência",
                                    });
                                  }}
                                  className="w-full"
                                >
                                  <Code className="w-3 h-3 mr-1" />
                                  Copiar Código de Embed
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Simulação de Webhook</CardTitle>
              <CardDescription>Teste a conversão de trial para assinatura recorrente</CardDescription>
            </CardHeader>
            <CardContent>
              {webhookResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Webhook processado com sucesso!</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(webhookResult, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4" />
                  <p>Crie um checkout primeiro para testar o webhook</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para edição de plano */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Plano</DialogTitle>
            <DialogDescription>Faça as alterações necessárias no plano</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editPlanName">Nome do Plano</Label>
                <Input
                  id="editPlanName"
                  value={planFormData.name}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editPlanPrice">Preço (R$)</Label>
                <Input
                  id="editPlanPrice"
                  type="number"
                  step="0.01"
                  value={planFormData.price}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editPlanDescription">Descrição</Label>
              <Textarea
                id="editPlanDescription"
                value={planFormData.description}
                onChange={(e) => setPlanFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="editTrialPrice">Pagamento Único (R$)</Label>
                <Input
                  id="editTrialPrice"
                  type="number"
                  step="0.01"
                  value={planFormData.trial_price}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, trial_price: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="editTrialDays">Dias de Trial</Label>
                <Input
                  id="editTrialDays"
                  type="number"
                  value={planFormData.trial_days}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, trial_days: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="editInterval">Intervalo</Label>
                <Select value={planFormData.interval} onValueChange={(value) => setPlanFormData(prev => ({ ...prev, interval: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Mensal</SelectItem>
                    <SelectItem value="year">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Recursos Inclusos</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { id: 'sms', label: 'SMS Marketing' },
                  { id: 'email', label: 'Email Marketing' },
                  { id: 'whatsapp', label: 'WhatsApp Business' },
                  { id: 'analytics', label: 'Analytics Avançado' }
                ].map(feature => (
                  <div key={feature.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${feature.id}`}
                      checked={planFormData.features.includes(feature.id)}
                      onCheckedChange={() => handleFeatureToggle(feature.id)}
                    />
                    <Label htmlFor={`edit-${feature.id}`}>{feature.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdatePlan} disabled={editPlanMutation.isPending}>
                {editPlanMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}