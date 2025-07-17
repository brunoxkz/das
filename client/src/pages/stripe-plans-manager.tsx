import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Check, X, DollarSign, Calendar, Users, Zap, Copy, ExternalLink, Link } from 'lucide-react';

interface StripePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  trial_period_days: number;
  activation_fee: number;
  stripe_price_id?: string;
  stripe_product_id?: string;
  features: string[];
  active: boolean;
  created_at: string;
}

export default function StripePlansManager() {
  const [plans, setPlans] = useState<StripePlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<StripePlan | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Formulário para criar/editar plano
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 29.90,
    currency: 'BRL',
    interval: 'month' as 'month' | 'year',
    trial_period_days: 3,
    activation_fee: 1.00,
    features: [] as string[],
    active: true
  });

  const [newFeature, setNewFeature] = useState('');

  // Carregar planos existentes
  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/stripe/custom-plans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  const handleCreatePlan = async () => {
    if (!formData.name || !formData.description || formData.price <= 0) {
      toast({
        title: "Erro de validação",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/stripe/create-custom-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          trialAmount: formData.activation_fee,
          trialDays: formData.trial_period_days,
          recurringAmount: formData.price,
          recurringInterval: formData.interval,
          currency: formData.currency
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Plano criado com sucesso!",
          description: `Link de pagamento: ${data.paymentLink}`,
          variant: "default"
        });
        
        // Copiar link para clipboard
        navigator.clipboard.writeText(data.paymentLink);
        
        // Recarregar planos
        loadPlans();
        
        // Limpar formulário
        setFormData({
          name: '',
          description: '',
          price: 29.90,
          currency: 'BRL',
          interval: 'month',
          trial_period_days: 3,
          activation_fee: 1.00,
          features: [],
          active: true
        });
        setShowCreateForm(false);
      } else {
        const error = await response.json();
        toast({
          title: "Erro ao criar plano",
          description: error.error || "Erro desconhecido",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      toast({
        title: "Erro no servidor",
        description: "Falha ao criar plano. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({ 
        ...prev, 
        features: [...prev.features, newFeature.trim()] 
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      features: prev.features.filter((_, i) => i !== index) 
    }));
  };

  const handleCopyLink = async (plan: StripePlan) => {
    try {
      await navigator.clipboard.writeText(plan.paymentLink);
      toast({
        title: "Link copiado!",
        description: `Link de pagamento do plano ${plan.name} copiado para a área de transferência`,
      });
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      toast({
        title: "Erro ao copiar link",
        description: "Não foi possível copiar o link. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/stripe/custom-plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Plano desativado",
          description: "O plano foi desativado com sucesso",
        });
        loadPlans();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao desativar plano');
      }
    } catch (error) {
      console.error('Erro ao desativar plano:', error);
      toast({
        title: "Erro ao desativar plano",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestCheckout = async (plan: StripePlan) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/stripe/create-checkout-for-plan/${plan.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customerEmail: 'test@example.com'
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Checkout criado",
          description: `Redirecionando para pagamento do plano ${plan.name}`,
        });
        
        // Redirecionar para o Stripe Checkout
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        }
      } else {
        throw new Error(data.error || 'Erro ao criar checkout');
      }
    } catch (error) {
      toast({
        title: "Erro no checkout",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerenciador de Planos Stripe</h1>
          <p className="text-gray-600">Crie e gerencie planos de assinatura com trial automático</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {/* Formulário de criação */}
      {showCreateForm && (
        <Card className="mb-8 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Criar Novo Plano</CardTitle>
            <CardDescription>Configure um novo plano de assinatura com trial</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Plano</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Plano Premium"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do plano"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="price">Preço Mensal (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="activation_fee">Taxa de Ativação (R$)</Label>
                <Input
                  id="activation_fee"
                  type="number"
                  step="0.01"
                  value={formData.activation_fee}
                  onChange={(e) => setFormData(prev => ({ ...prev, activation_fee: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="trial_days">Dias de Trial</Label>
                <Input
                  id="trial_days"
                  type="number"
                  value={formData.trial_period_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, trial_period_days: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="currency">Moeda</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
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

            <div>
              <Label htmlFor="features">Recursos do Plano</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Ex: 1000 SMS por mês"
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                />
                <Button type="button" onClick={addFeature} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {feature}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeFeature(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreatePlan}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Criando...' : 'Criar Plano'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="border-2 hover:border-green-300 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
                <Badge variant={plan.active ? "default" : "secondary"}>
                  {plan.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    R$ {(plan.recurringAmount || plan.price || 0).toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">/{plan.recurringInterval || plan.interval || 'mês'}</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Taxa de ativação: R$ {plan.trialAmount?.toFixed(2) || plan.activation_fee?.toFixed(2) || '0.00'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Trial: {plan.trialDays || plan.trial_period_days || 0} dias
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-600" />
                    Moeda: {plan.currency}
                  </div>
                  {plan.paymentLink && (
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-purple-600" />
                      <span className="text-purple-600 truncate max-w-[200px]">
                        {plan.paymentLink}
                      </span>
                    </div>
                  )}
                </div>

                {plan.features && plan.features.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium">Recursos:</span>
                    <div className="flex flex-wrap gap-1">
                      {plan.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleCopyLink(plan)}
                    className="flex-1"
                    disabled={!plan.paymentLink}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Link
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleTestCheckout(plan)}
                    className="flex-1"
                    disabled={loading}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Testar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleDeletePlan(plan.id)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && !showCreateForm && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-500 mb-4">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum plano criado ainda</p>
              <p className="text-sm">Crie seu primeiro plano de assinatura</p>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Plano
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}