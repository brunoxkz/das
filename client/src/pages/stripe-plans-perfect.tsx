import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Zap, 
  Crown, 
  Package,
  DollarSign,
  Clock,
  Users
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  stripe_product_id: string;
  stripe_price_id: string;
  is_active: boolean;
  trial_days?: number;
  created_at: string;
}

const StripePlansPerfeito: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'brl',
    interval: 'month',
    features: [''],
    trial_days: '0'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar planos existentes
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['/api/stripe/plans'],
    staleTime: 30000,
  });

  // Mutation para criar plano
  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      return await apiRequest('POST', '/api/stripe/plans', planData);
    },
    onSuccess: () => {
      toast({
        title: "Plano criado!",
        description: "O plano foi criado com sucesso no Stripe.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/stripe/plans'] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar plano",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar plano
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, planData }: { id: string; planData: any }) => {
      return await apiRequest('PUT', `/api/stripe/plans/${id}`, planData);
    },
    onSuccess: () => {
      toast({
        title: "Plano atualizado!",
        description: "O plano foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/stripe/plans'] });
      setEditingPlan(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar plano",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar plano
  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/stripe/plans/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Plano excluído!",
        description: "O plano foi excluído com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/stripe/plans'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir plano",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'brl',
      interval: 'month',
      features: [''],
      trial_days: '0'
    });
    setIsCreating(false);
    setEditingPlan(null);
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: (plan.price / 100).toString(),
      currency: plan.currency,
      interval: plan.interval,
      features: plan.features || [''],
      trial_days: plan.trial_days?.toString() || '0'
    });
    setIsCreating(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const planData = {
      name: formData.name,
      description: formData.description,
      price: Math.round(parseFloat(formData.price) * 100),
      currency: formData.currency,
      interval: formData.interval,
      features: formData.features.filter(f => f.trim() !== ''),
      trial_days: parseInt(formData.trial_days) || 0
    };

    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, planData });
    } else {
      createPlanMutation.mutate(planData);
    }
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
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const getIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('trial') || name.includes('teste')) return <Zap className="w-5 h-5 text-green-600" />;
    if (name.includes('premium') || name.includes('pro')) return <Crown className="w-5 h-5 text-purple-600" />;
    if (name.includes('enterprise') || name.includes('business')) return <Package className="w-5 h-5 text-blue-600" />;
    return <Users className="w-5 h-5 text-gray-600" />;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Planos</h1>
          <p className="text-gray-600 mt-1">
            Crie e gerencie planos de assinatura integrados ao Stripe
          </p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Plano
        </Button>
      </div>

      {/* Formulário de Criação/Edição */}
      {isCreating && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}
            </CardTitle>
            <CardDescription>
              {editingPlan ? 'Atualize as informações do plano' : 'Crie um novo plano de assinatura'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Plano</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ex: Plano Premium"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="29.90"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="interval">Intervalo</Label>
                  <Select value={formData.interval} onValueChange={(value) => setFormData(prev => ({ ...prev, interval: value }))}>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, trial_days: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do plano..."
                />
              </div>

              <div>
                <Label>Funcionalidades</Label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 mt-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="ex: Quizzes ilimitados"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      disabled={formData.features.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFeature}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Funcionalidade
                </Button>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {editingPlan ? 'Atualizar Plano' : 'Criar Plano'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan: Plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getIcon(plan.name)}
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                <Badge variant={plan.is_active ? "default" : "secondary"}>
                  {plan.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    R$ {(plan.price / 100).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    por {plan.interval === 'month' ? 'mês' : plan.interval === 'year' ? 'ano' : plan.interval}
                  </div>
                  {plan.trial_days && plan.trial_days > 0 && (
                    <Badge className="mt-2 bg-green-100 text-green-800">
                      {plan.trial_days} dias grátis
                    </Badge>
                  )}
                </div>
                
                <ul className="space-y-2">
                  {plan.features?.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(plan)}
                    className="flex-1"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deletePlanMutation.mutate(plan.id)}
                    disabled={deletePlanMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum plano criado
          </h3>
          <p className="text-gray-600 mb-4">
            Crie seu primeiro plano de assinatura
          </p>
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Plano
          </Button>
        </div>
      )}
    </div>
  );
};

export default StripePlansPerfeito;