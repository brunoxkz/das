import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Calendar, 
  Clock, 
  Phone, 
  MapPin,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Package,
  CreditCard,
  Filter,
  Eye
} from 'lucide-react';

// Interfaces para dados do Sistema Controle
interface Attendant {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  meta_vendas_diaria: number;
  comissao_percentual: number;
  ativo: number;
}

interface Sale {
  id: string;
  atendente_id: string;
  atendente_nome?: string;
  cliente_nome: string;
  cliente_telefone: string;
  cliente_endereco?: string;
  valor_venda: number;
  comissao_calculada: number;
  categoria: 'LOGZZ' | 'AFTER PAY';
  forma_pagamento?: 'credito' | 'debito' | 'boleto' | 'pix';
  status: 'agendado' | 'pago' | 'cancelado';
  data_pedido: string;
  data_agendamento?: string;
  periodo_entrega?: 'manha' | 'tarde' | 'noite';
  observacoes?: string;
}

interface DashboardData {
  vendasHoje: number;
  valorHoje: number;
  vendasMes: number;
  valorMes: number;
  comissoesMes: number;
  entregasHoje: number;
  performanceAttendants: Array<{
    nome: string;
    vendas_mes: number;
    comissao_mes: number;
    valor_total_mes: number;
  }>;
}

export default function ControleDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAttendant, setFilterAttendant] = useState<string>('all');
  const [selectedSaleId, setSelectedSaleId] = useState<string>('');
  
  // Estado do formulário de novo pedido
  const [formData, setFormData] = useState({
    atendente_id: '',
    cliente_nome: '',
    cliente_telefone: '',
    valor_venda: '',
    categoria: 'LOGZZ' as 'LOGZZ' | 'AFTER PAY',
    data_agendamento: '',
    periodo_entrega: '' as 'manha' | 'tarde' | 'noite' | '',
    observacoes: ''
  });

  // Buscar dados do dashboard
  const { data: dashboardData, isLoading: loadingDashboard } = useQuery({
    queryKey: ['/api/controle/dashboard'],
    refetchInterval: 30000,
  });

  // Buscar atendentes
  const { data: attendants = [] } = useQuery({
    queryKey: ['/api/controle/attendants'],
  });

  // Buscar vendas
  const { data: sales = [] } = useQuery({
    queryKey: ['/api/controle/sales'],
    refetchInterval: 30000,
  });

  // Mutation para criar nova venda
  const createSaleMutation = useMutation({
    mutationFn: (saleData: any) => {
      // Calcula comissão automaticamente (10%)
      const valorVenda = parseFloat(saleData.valor_venda);
      const comissao = valorVenda * 0.10;
      
      return apiRequest('POST', '/api/controle/sales', {
        ...saleData,
        valor_venda: valorVenda,
        comissao_calculada: comissao,
        data_pedido: new Date().toISOString(), // Data atual automática
        status: 'agendado' // Padrão para novos pedidos
      });
    },
    onSuccess: () => {
      toast({ title: "Pedido criado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['/api/controle/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/controle/dashboard'] });
      setIsCreateOrderOpen(false);
      setFormData({
        atendente_id: '',
        cliente_nome: '',
        cliente_telefone: '',
        valor_venda: '',
        categoria: 'LOGZZ',
        data_agendamento: '',
        periodo_entrega: '',
        observacoes: ''
      });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar pedido", description: error.message, variant: "destructive" });
    },
  });

  // Mutation para confirmar pagamento
  const confirmPaymentMutation = useMutation({
    mutationFn: ({ id, forma_pagamento }: { id: string; forma_pagamento: string }) => 
      apiRequest('PATCH', `/api/controle/sales/${id}`, { 
        status: 'pago',
        forma_pagamento,
        comissao_calculada: sales.find(s => s.id === id)?.valor_venda * 0.10 || 0
      }),
    onSuccess: () => {
      toast({ title: "Pagamento confirmado!" });
      queryClient.invalidateQueries({ queryKey: ['/api/controle/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/controle/dashboard'] });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao confirmar pagamento", description: error.message, variant: "destructive" });
    },
  });

  // Função para formatar valor em moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrar vendas
  const filteredSales = sales.filter((sale: Sale) => {
    const statusMatch = filterStatus === 'all' || sale.status === filterStatus;
    const attendantMatch = filterAttendant === 'all' || sale.atendente_id === filterAttendant;
    return statusMatch && attendantMatch;
  });

  const handleCreateOrder = () => {
    if (!formData.atendente_id || !formData.cliente_nome || !formData.cliente_telefone || !formData.valor_venda) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    createSaleMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Sistema Controle</h1>
            <p className="text-slate-300">Dashboard administrativo para gestão de vendas</p>
          </div>
          <Button 
            onClick={() => setIsCreateOrderOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Pedido
          </Button>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Vendas Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.vendasHoje || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-600 to-green-700 border-0 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Valor Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboardData?.valorHoje || 0)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-600 to-purple-700 border-0 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Comissões Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboardData?.comissoesMes || 0)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-600 to-orange-700 border-0 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Entregas Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.entregasHoje || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Gestão */}
        <Tabs defaultValue="vendas" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="vendas" className="text-white data-[state=active]:bg-slate-700">
              Gestão de Vendas
            </TabsTrigger>
            <TabsTrigger value="atendentes" className="text-white data-[state=active]:bg-slate-700">
              Atendentes
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="text-white data-[state=active]:bg-slate-700">
              Dashboard Geral
            </TabsTrigger>
          </TabsList>

          {/* Tab Gestão de Vendas */}
          <TabsContent value="vendas" className="space-y-4">
            {/* Filtros */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-slate-300">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="agendado">Agendado</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">Atendente</Label>
                  <Select value={filterAttendant} onValueChange={setFilterAttendant}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {attendants.map((att: Attendant) => (
                        <SelectItem key={att.id} value={att.id}>{att.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Aplicar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Vendas */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Pedidos ({filteredSales.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSales.map((sale: Sale) => (
                    <div key={sale.id} className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                        <div>
                          <p className="font-medium text-white">{sale.cliente_nome}</p>
                          <p className="text-sm text-slate-300">{sale.cliente_telefone}</p>
                          <Badge variant={sale.categoria === 'LOGZZ' ? 'default' : 'secondary'} className="mt-1">
                            {sale.categoria}
                          </Badge>
                        </div>
                        
                        <div>
                          <p className="text-white font-medium">{formatCurrency(sale.valor_venda)}</p>
                          <p className="text-sm text-green-400">Comissão: {formatCurrency(sale.comissao_calculada)}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-slate-300">Pedido:</p>
                          <p className="text-white">{formatDate(sale.data_pedido)}</p>
                        </div>
                        
                        <div>
                          <Badge 
                            variant={
                              sale.status === 'pago' ? 'default' : 
                              sale.status === 'agendado' ? 'secondary' : 'destructive'
                            }
                            className={
                              sale.status === 'pago' ? 'bg-green-600' :
                              sale.status === 'agendado' ? 'bg-yellow-600' : 'bg-red-600'
                            }
                          >
                            {sale.status.toUpperCase()}
                          </Badge>
                          {sale.forma_pagamento && (
                            <p className="text-xs text-slate-400 mt-1">
                              {sale.forma_pagamento.toUpperCase()}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          {sale.data_agendamento && (
                            <>
                              <p className="text-sm text-slate-300">Agendado:</p>
                              <p className="text-white text-sm">{formatDate(sale.data_agendamento)}</p>
                              {sale.periodo_entrega && (
                                <p className="text-xs text-slate-400">{sale.periodo_entrega}</p>
                              )}
                            </>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          {sale.status === 'agendado' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 w-full">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Confirmar Pagamento
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-slate-800 border-slate-700">
                                <DialogHeader>
                                  <DialogTitle className="text-white">Confirmar Pagamento</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-slate-300">Forma de Pagamento</Label>
                                    <Select onValueChange={(value) => {
                                      confirmPaymentMutation.mutate({ 
                                        id: sale.id, 
                                        forma_pagamento: value 
                                      });
                                    }}>
                                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                        <SelectValue placeholder="Selecione a forma de pagamento" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="credito">Cartão de Crédito</SelectItem>
                                        <SelectItem value="debito">Cartão de Débito</SelectItem>
                                        <SelectItem value="boleto">Boleto</SelectItem>
                                        <SelectItem value="pix">PIX</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          
                          {sale.status === 'pago' && (
                            <div className="flex items-center text-green-400 text-sm">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Pago
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Atendentes */}
          <TabsContent value="atendentes">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Atendentes Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {attendants.map((attendant: Attendant) => (
                    <Card key={attendant.id} className="bg-slate-700 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">{attendant.nome}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-slate-300 flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          {attendant.telefone}
                        </p>
                        <p className="text-slate-300">Meta Diária: {attendant.meta_vendas_diaria} vendas</p>
                        <p className="text-green-400">Comissão: {attendant.comissao_percentual}%</p>
                        <Badge variant={attendant.ativo ? 'default' : 'secondary'} className="bg-green-600">
                          {attendant.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Dashboard Geral */}
          <TabsContent value="dashboard">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Performance dos Atendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.performanceAttendants?.map((perf: any, index: number) => (
                    <div key={index} className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="font-medium text-white">{perf.nome}</p>
                        </div>
                        <div>
                          <p className="text-slate-300">Vendas no Mês</p>
                          <p className="text-white font-medium">{perf.vendas_mes}</p>
                        </div>
                        <div>
                          <p className="text-slate-300">Valor Total</p>
                          <p className="text-white font-medium">{formatCurrency(perf.valor_total_mes)}</p>
                        </div>
                        <div>
                          <p className="text-slate-300">Comissão</p>
                          <p className="text-green-400 font-medium">{formatCurrency(perf.comissao_mes)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog para Novo Pedido */}
        <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Novo Pedido</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Atendente *</Label>
                <Select value={formData.atendente_id} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, atendente_id: value }))
                }>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione o atendente" />
                  </SelectTrigger>
                  <SelectContent>
                    {attendants.map((att: Attendant) => (
                      <SelectItem key={att.id} value={att.id}>{att.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Categoria *</Label>
                <Select value={formData.categoria} onValueChange={(value: 'LOGZZ' | 'AFTER PAY') => 
                  setFormData(prev => ({ ...prev, categoria: value }))
                }>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOGZZ">LOGZZ</SelectItem>
                    <SelectItem value="AFTER PAY">AFTER PAY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Nome do Cliente *</Label>
                <Input
                  value={formData.cliente_nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, cliente_nome: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <Label className="text-slate-300">WhatsApp do Cliente *</Label>
                <Input
                  value={formData.cliente_telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, cliente_telefone: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <Label className="text-slate-300">Valor do Produto *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor_venda}
                  onChange={(e) => setFormData(prev => ({ ...prev, valor_venda: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="0,00"
                />
                {formData.valor_venda && (
                  <p className="text-green-400 text-sm mt-1">
                    Comissão (10%): {formatCurrency(parseFloat(formData.valor_venda) * 0.10)}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-slate-300">Data Agendamento</Label>
                <Input
                  type="date"
                  value={formData.data_agendamento}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_agendamento: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-300">Período de Entrega</Label>
                <Select value={formData.periodo_entrega} onValueChange={(value: 'manha' | 'tarde' | 'noite') => 
                  setFormData(prev => ({ ...prev, periodo_entrega: value }))
                }>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manha">Manhã</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                    <SelectItem value="noite">Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label className="text-slate-300">Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateOrderOpen(false)}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateOrder}
                disabled={createSaleMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {createSaleMutation.isPending ? 'Criando...' : 'Criar Pedido'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}