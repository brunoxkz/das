import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  CreditCard, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Eye,
  Code,
  Link,
  Crown,
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link as RouterLink } from "wouter";

export default function AdminDashboardPlanos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [stats, setStats] = useState({
    totalPlanos: 0,
    assinaturasAtivas: 0,
    receitaMensal: 0,
    embedsGerados: 0,
    checkoutsHoje: 0,
    conversaoHoje: 0
  });

  // Estado para o formulário de criação/edição de plano
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 29.90,
    currency: 'BRL',
    interval: 'month',
    interval_count: 1,
    trial_days: 3,
    trial_price: 1.00,
    active: true,
    features: [] as string[]
  });

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 29.90,
      currency: 'BRL',
      interval: 'month',
      interval_count: 1,
      trial_days: 3,
      trial_price: 1.00,
      active: true,
      features: []
    });
  };

  // Mutation para criar plano
  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const response = await apiRequest('POST', '/api/stripe/plans', planData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Plano criado com sucesso!",
        description: "O plano foi criado e está pronto para uso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stripe/plans"] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar plano",
        description: error.message || "Ocorreu um erro ao criar o plano.",
        variant: "destructive"
      });
    }
  });

  // Mutation para editar plano
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, planData }: { id: string; planData: any }) => {
      const response = await apiRequest('PUT', `/api/stripe/plans/${id}`, planData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Plano atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stripe/plans"] });
      setIsEditDialogOpen(false);
      setEditingPlan(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar plano",
        description: error.message || "Ocorreu um erro ao atualizar o plano.",
        variant: "destructive"
      });
    }
  });

  // Mutation para ativar/desativar plano
  const togglePlanMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const response = await apiRequest('PATCH', `/api/stripe/plans/${id}/toggle`, { active });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Status do plano alterado!",
        description: "O plano foi ativado/desativado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stripe/plans"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao alterar status",
        description: error.message || "Ocorreu um erro ao alterar o status do plano.",
        variant: "destructive"
      });
    }
  });

  // Mutation para deletar plano
  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/stripe/plans/${id}`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Plano deletado!",
        description: "O plano foi removido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stripe/plans"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar plano",
        description: error.message || "Ocorreu um erro ao deletar o plano.",
        variant: "destructive"
      });
    }
  });

  // Função para gerar links de checkout e embed
  const generateCheckoutLink = (planId: string) => {
    return `${window.location.origin}/checkout-embed/${planId}`;
  };

  const generateEmbedCode = (planId: string) => {
    const checkoutUrl = generateCheckoutLink(planId);
    return `<iframe src="${checkoutUrl}" width="100%" height="600" frameborder="0" scrolling="no"></iframe>`;
  };

  // Função para abrir dialog de edição
  const openEditDialog = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name || '',
      description: plan.description || '',
      price: plan.price || 29.90,
      currency: plan.currency || 'BRL',
      interval: plan.interval || 'month',
      trial_days: plan.trial_days || 3,
      trial_price: plan.trial_price || 1.00,
      active: plan.active !== 0,
      features: plan.features || []
    });
    setIsEditDialogOpen(true);
  };

  // Buscar estatísticas dos planos
  const { data: planos } = useQuery({
    queryKey: ["/api/stripe/plans"],
  });

  // Buscar transações recentes
  const { data: transacoes } = useQuery({
    queryKey: ["/api/stripe/transactions"],
  });

  // Buscar assinaturas ativas
  const { data: assinaturas } = useQuery({
    queryKey: ["/api/stripe/subscriptions"],
  });

  useEffect(() => {
    if (planos && transacoes && assinaturas) {
      const planosArray = Array.isArray(planos) ? planos : [];
      const transacoesArray = Array.isArray(transacoes) ? transacoes : [];
      const assinaturasArray = Array.isArray(assinaturas) ? assinaturas : [];

      const hoje = new Date().toDateString();
      const checkoutsHoje = transacoesArray.filter((t: any) => 
        new Date(t.createdAt).toDateString() === hoje
      ).length;

      const receitaMensal = assinaturasArray.reduce((acc: number, sub: any) => {
        if (sub.status === 'active') {
          return acc + (sub.amount || 2990); // R$29,90 padrão
        }
        return acc;
      }, 0);

      setStats({
        totalPlanos: planosArray.length,
        assinaturasAtivas: assinaturasArray.filter((s: any) => s.status === 'active').length,
        receitaMensal: receitaMensal / 100, // Converter centavos para reais
        embedsGerados: planosArray.filter((p: any) => p.embedCode).length,
        checkoutsHoje,
        conversaoHoje: checkoutsHoje > 0 ? Math.round((checkoutsHoje / 100) * 100) : 0
      });
    }
  }, [planos, transacoes, assinaturas]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${type} copiado para a área de transferência`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Dashboard Administrativo - Planos & Assinaturas
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Visão geral completa do sistema de pagamentos e assinaturas
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total de Planos
              </CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.totalPlanos}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Planos criados
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Assinaturas Ativas
              </CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.assinaturasAtivas}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Clientes ativos
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Receita Mensal
              </CardTitle>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                R$ {stats.receitaMensal.toFixed(2)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receita recorrente
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Embeds Gerados
              </CardTitle>
              <Code className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.embedsGerados}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Códigos embed
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-cyan-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Checkouts Hoje
              </CardTitle>
              <Activity className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.checkoutsHoje}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pagamentos hoje
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Conversão
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.conversaoHoje}%
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Taxa hoje
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs com Detalhes */}
        <Tabs defaultValue="planos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="planos">Planos Criados</TabsTrigger>
            <TabsTrigger value="assinaturas">Assinaturas</TabsTrigger>
            <TabsTrigger value="embeds">Embeds</TabsTrigger>
            <TabsTrigger value="acoes">Ações Rápidas</TabsTrigger>
          </TabsList>

          <TabsContent value="planos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Planos Criados
                  </div>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetForm}>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Novo Plano
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Criar Novo Plano</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Nome do Plano</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              placeholder="Plano Básico"
                            />
                          </div>
                          <div>
                            <Label htmlFor="price">Preço Mensal (R$)</Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              value={formData.price}
                              onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description">Descrição</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Descrição do plano..."
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="interval">Intervalo de Cobrança</Label>
                            <Select value={formData.interval} onValueChange={(value) => setFormData({...formData, interval: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="month">📅 Mensal</SelectItem>
                                <SelectItem value="quarter">📅 Trimestral</SelectItem>
                                <SelectItem value="year">📅 Anual</SelectItem>
                                <SelectItem value="week">📅 Semanal</SelectItem>
                                <SelectItem value="day">📅 Diário</SelectItem>
                                <SelectItem value="hour">⏰ Por Hora (Teste)</SelectItem>
                                <SelectItem value="minute">⏰ Por Minuto (Teste)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="interval_count">Quantidade</Label>
                            <Input
                              id="interval_count"
                              type="number"
                              min="1"
                              max="999"
                              value={formData.interval_count}
                              onChange={(e) => setFormData({...formData, interval_count: parseInt(e.target.value) || 1})}
                              placeholder="1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="currency">Moeda</Label>
                            <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="BRL">BRL - Real</SelectItem>
                                <SelectItem value="USD">USD - Dólar</SelectItem>
                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="trial_days">Dias de Trial</Label>
                            <Input
                              id="trial_days"
                              type="number"
                              value={formData.trial_days}
                              onChange={(e) => setFormData({...formData, trial_days: parseInt(e.target.value)})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="trial_price">Preço Trial (R$)</Label>
                            <Input
                              id="trial_price"
                              type="number"
                              step="0.01"
                              value={formData.trial_price}
                              onChange={(e) => setFormData({...formData, trial_price: parseFloat(e.target.value)})}
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="active"
                            checked={formData.active}
                            onCheckedChange={(checked) => setFormData({...formData, active: checked})}
                          />
                          <Label htmlFor="active">Plano Ativo</Label>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => createPlanMutation.mutate(formData)}
                            disabled={createPlanMutation.isPending}
                          >
                            {createPlanMutation.isPending ? 'Criando...' : 'Criar Plano'}
                          </Button>
                          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(planos) && planos.length > 0 ? (
                    planos.map((plano: any) => (
                      <div key={plano.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Package className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                                {plano.name || 'Plano Básico'}
                              </h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                R$ {(plano.price || 29.90).toFixed(2)}/mês • Trial: {plano.trial_days || 3} dias por R$ {(plano.trial_price || 1.00).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={plano.active ? 'default' : 'secondary'}>
                              {plano.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => togglePlanMutation.mutate({ id: plano.id, active: !plano.active })}
                            >
                              {plano.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(plano)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (confirm('Tem certeza que deseja deletar este plano?')) {
                                  deletePlanMutation.mutate(plano.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {plano.active && (
                          <div className="space-y-3">
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <ExternalLink className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                  Link de Checkout
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={generateCheckoutLink(plano.id)}
                                  readOnly
                                  className="flex-1 px-2 py-1 text-xs bg-white dark:bg-slate-800 border rounded"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(generateCheckoutLink(plano.id), 'Link de Checkout')}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(generateCheckoutLink(plano.id), '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Code className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                  Código Embed
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <textarea
                                  value={generateEmbedCode(plano.id)}
                                  readOnly
                                  className="flex-1 px-2 py-1 text-xs bg-white dark:bg-slate-800 border rounded h-20 resize-none"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(generateEmbedCode(plano.id), 'Código Embed')}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum plano criado ainda</p>
                      <p className="text-sm">Clique em "Criar Novo Plano" para começar</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dialog de Edição */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Editar Plano</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-name">Nome do Plano</Label>
                      <Input
                        id="edit-name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Plano Básico"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-price">Preço Mensal (R$)</Label>
                      <Input
                        id="edit-price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Descrição</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Descrição do plano..."
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-trial_days">Dias de Trial</Label>
                      <Input
                        id="edit-trial_days"
                        type="number"
                        value={formData.trial_days}
                        onChange={(e) => setFormData({...formData, trial_days: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-trial_price">Preço Trial (R$)</Label>
                      <Input
                        id="edit-trial_price"
                        type="number"
                        step="0.01"
                        value={formData.trial_price}
                        onChange={(e) => setFormData({...formData, trial_price: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-currency">Moeda</Label>
                      <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRL">BRL - Real</SelectItem>
                          <SelectItem value="USD">USD - Dólar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-active"
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({...formData, active: checked})}
                    />
                    <Label htmlFor="edit-active">Plano Ativo</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => updatePlanMutation.mutate({ id: editingPlan?.id, planData: formData })}
                      disabled={updatePlanMutation.isPending}
                    >
                      {updatePlanMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="assinaturas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Assinaturas Ativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(assinaturas) && assinaturas.length > 0 ? (
                    assinaturas.slice(0, 10).map((assinatura: any) => (
                      <div key={assinatura.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                              {assinatura.customerEmail || 'Cliente'}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              R$ {((assinatura.amount || 2990) / 100).toFixed(2)}/mês
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={assinatura.status === 'active' ? 'default' : 'secondary'}>
                            {assinatura.status === 'active' ? 'Ativa' : 'Inativa'}
                          </Badge>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {assinatura.createdAt && new Date(assinatura.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      Nenhuma assinatura ativa
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="embeds" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Códigos Embed Gerados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(planos) && planos.length > 0 ? (
                    planos.filter((p: any) => p.embedCode).map((plano: any) => (
                      <div key={plano.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            {plano.name || 'Plano Básico'}
                          </h3>
                          <Badge variant="outline">
                            Embed Gerado
                          </Badge>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                          <code className="text-sm text-slate-700 dark:text-slate-300">
                            {plano.embedCode || 'Código não disponível'}
                          </code>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(plano.embedCode || '', 'Código Embed')}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copiar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/checkout/${plano.id}`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Testar
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      Nenhum embed gerado ainda
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="acoes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Gerenciar Planos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Criar, editar e gerenciar planos de assinatura
                  </p>
                  <RouterLink href="/stripe-plans-perfect">
                    <Button className="w-full">
                      Acessar Planos Perfeitos
                    </Button>
                  </RouterLink>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Checkout Oficial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Gerar códigos embed e links de pagamento
                  </p>
                  <RouterLink href="/checkout-oficial">
                    <Button className="w-full">
                      Acessar Checkout Oficial
                    </Button>
                  </RouterLink>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Assinaturas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Gerenciar assinaturas e clientes
                  </p>
                  <RouterLink href="/subscriptions-manager">
                    <Button className="w-full">
                      Gerenciar Assinaturas
                    </Button>
                  </RouterLink>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Códigos Embed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Gerar códigos HTML/React para integração
                  </p>
                  <RouterLink href="/checkout-embed-codes">
                    <Button className="w-full">
                      Gerar Códigos Embed
                    </Button>
                  </RouterLink>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Monitoramento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Monitorar transações e status do Stripe
                  </p>
                  <RouterLink href="/stripe-monitoring">
                    <Button className="w-full">
                      Ver Monitoramento
                    </Button>
                  </RouterLink>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Visualizar métricas e relatórios
                  </p>
                  <RouterLink href="/analytics">
                    <Button className="w-full">
                      Ver Analytics
                    </Button>
                  </RouterLink>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}