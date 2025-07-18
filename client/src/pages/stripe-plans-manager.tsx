import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Copy, ExternalLink, Power } from 'lucide-react';

interface StripePlan {
  id: string;
  name: string;
  description: string;
  trialAmount: number;
  trialDays: number;
  recurringAmount: number;
  recurringInterval: string;
  currency: string;
  active: boolean;
  paymentLink: string;
  createdAt: string;
  updatedAt: string;
}

interface PlanFormData {
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  interval_count?: number;
  trial_period_days: number;
  activation_fee: number;
  features: string[];
  active: boolean;
}

export default function StripePlansManager() {
  const [plans, setPlans] = useState<StripePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StripePlan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>({
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
  const [newFeature, setNewFeature] = useState('');
  const { toast } = useToast();

  const loadPlans = async () => {
    setLoading(true);
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
      } else {
        console.error('Erro ao carregar planos:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!formData.name.trim() || !formData.description.trim() || formData.price <= 0) {
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
        resetForm();
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
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/stripe/custom-plans/${editingPlan.id}`, {
        method: 'PUT',
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
        toast({
          title: "Plano atualizado com sucesso!",
          description: `Plano ${formData.name} foi atualizado`
        });
        
        loadPlans();
        resetForm();
        setEditingPlan(null);
        setShowCreateForm(false);
      } else {
        const error = await response.json();
        toast({
          title: "Erro ao atualizar plano",
          description: error.error || "Erro desconhecido",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      toast({
        title: "Erro no servidor",
        description: "Falha ao atualizar plano. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlan = async (planId: string, active: boolean) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/stripe/custom-plans/${planId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active })
      });

      if (response.ok) {
        toast({
          title: `Plano ${active ? 'ativado' : 'desativado'} com sucesso!`,
          description: `O plano foi ${active ? 'ativado' : 'desativado'} no Stripe`
        });
        
        loadPlans();
      } else {
        const error = await response.json();
        toast({
          title: "Erro ao alterar status",
          description: error.error || "Erro desconhecido",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro no servidor",
        description: "Falha ao alterar status. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
          title: "Plano deletado com sucesso!",
          description: "O plano foi removido do sistema e arquivado no Stripe"
        });
        
        loadPlans();
      } else {
        const error = await response.json();
        toast({
          title: "Erro ao deletar plano",
          description: error.error || "Erro desconhecido",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao deletar plano:', error);
      toast({
        title: "Erro no servidor",
        description: "Falha ao deletar plano. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (plan: StripePlan) => {
    try {
      await navigator.clipboard.writeText(plan.paymentLink);
      toast({
        title: "Link copiado!",
        description: `Link de pagamento do plano ${plan.name} copiado para a área de transferência`
      });
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      toast({
        title: "Erro ao copiar link",
        description: "Não foi possível copiar o link. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
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
    setNewFeature('');
  };

  const startEdit = (plan: StripePlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.recurringAmount,
      currency: plan.currency,
      interval: plan.recurringInterval,
      trial_period_days: plan.trialDays,
      activation_fee: plan.trialAmount,
      features: [],
      active: plan.active
    });
    setShowCreateForm(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  useEffect(() => {
    loadPlans();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Gerenciamento de Planos</h1>
        <p className="text-gray-400">Crie e gerencie planos personalizados com integração Stripe</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Planos Customizados</h2>
          <p className="text-gray-400">
            {plans.length} planos criados
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Novo Plano
        </Button>
      </div>

      {/* Grid de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <Card key={plan.id} className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-green-400 text-lg">{plan.name}</CardTitle>
                  <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
                </div>
                <div className={`p-2 rounded-full ${plan.active ? 'bg-green-600' : 'bg-gray-600'}`}>
                  <Power className="w-4 h-4 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Taxa de Ativação:</span>
                  <span className="text-white font-medium">{formatCurrency(plan.trialAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Trial:</span>
                  <span className="text-white font-medium">{plan.trialDays} dias</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Recorrência:</span>
                  <span className="text-white font-medium">
                    {formatCurrency(plan.recurringAmount)}/{plan.recurringInterval === 'month' ? 'mês' : 'ano'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Criado:</span>
                  <span className="text-white font-medium">{formatDate(plan.createdAt)}</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyLink(plan)}
                    className="flex-1"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar Link
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(plan.paymentLink, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(plan)}
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTogglePlan(plan.id, !plan.active)}
                    className="flex-1"
                  >
                    <Power className="w-3 h-3 mr-1" />
                    {plan.active ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeletePlan(plan.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formulário de Criação/Edição */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="bg-gray-800 border-gray-700 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-green-400">
                {editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white">Nome do Plano</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Ex: Plano Premium"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-white">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Descrição do plano..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="activation_fee" className="text-white">Taxa de Ativação (R$)</Label>
                  <Input
                    id="activation_fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.activation_fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, activation_fee: parseFloat(e.target.value) || 0 }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="trial_period_days" className="text-white">Dias de Trial</Label>
                  <Input
                    id="trial_period_days"
                    type="number"
                    min="1"
                    value={formData.trial_period_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, trial_period_days: parseInt(e.target.value) || 1 }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-white">Preço Recorrente (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="interval" className="text-white">Intervalo de Cobrança</Label>
                  <Select value={formData.interval} onValueChange={(value) => setFormData(prev => ({ ...prev, interval: value }))}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Selecione o intervalo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minute">📍 Minutos (Teste)</SelectItem>
                      <SelectItem value="hour">⏰ Horas (Teste)</SelectItem>
                      <SelectItem value="day">📅 Diário</SelectItem>
                      <SelectItem value="week">📆 Semanal</SelectItem>
                      <SelectItem value="month">📊 Mensal</SelectItem>
                      <SelectItem value="quarter">📈 Trimestral</SelectItem>
                      <SelectItem value="year">🎯 Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Configuração de Intervalo Personalizado */}
              {(formData.interval === 'minute' || formData.interval === 'hour') && (
                <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
                  <h3 className="text-yellow-400 font-medium mb-2">⚠️ Configuração para Testes</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="interval_count" className="text-white">
                        Quantidade de {formData.interval === 'minute' ? 'Minutos' : 'Horas'}
                      </Label>
                      <Input
                        id="interval_count"
                        type="number"
                        min="1"
                        max={formData.interval === 'minute' ? 60 : 24}
                        value={formData.interval_count || 1}
                        onChange={(e) => setFormData(prev => ({ ...prev, interval_count: parseInt(e.target.value) || 1 }))}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder={formData.interval === 'minute' ? 'Ex: 10' : 'Ex: 2'}
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="text-sm text-yellow-300">
                        {formData.interval === 'minute' ? 
                          `Cobrança a cada ${formData.interval_count || 1} minuto(s)` : 
                          `Cobrança a cada ${formData.interval_count || 1} hora(s)`
                        }
                      </div>
                    </div>
                  </div>
                  <p className="text-yellow-300 text-xs mt-2">
                    💡 Ideal para testes rápidos. Em produção, use intervalos maiores.
                  </p>
                </div>
              )}

              {formData.interval === 'quarter' && (
                <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
                  <h3 className="text-blue-400 font-medium mb-2">📈 Cobrança Trimestral</h3>
                  <p className="text-blue-300 text-sm">
                    Cliente será cobrado a cada 3 meses. Valor total: R$ {(formData.price * 3).toFixed(2)}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="currency" className="text-white">Moeda</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione a moeda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real (R$)</SelectItem>
                    <SelectItem value="USD">Dólar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            
            <div className="flex justify-end gap-2 p-6 pt-0">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingPlan(null);
                  resetForm();
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={editingPlan ? handleUpdatePlan : handleCreatePlan}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? 'Salvando...' : editingPlan ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}