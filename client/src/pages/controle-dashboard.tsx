import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Package
} from 'lucide-react';

// Interface para dados do Sistema Controle
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
  status: 'agendado' | 'pago' | 'cancelado';
  data_venda: string;
  data_agendamento?: string;
  periodo_entrega?: 'manha' | 'tarde' | 'noite';
  comissao_calculada: number;
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
  const [selectedAttendant, setSelectedAttendant] = useState<string>('admin');
  const [newSaleDialog, setNewSaleDialog] = useState(false);
  const [editSaleDialog, setEditSaleDialog] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Buscar dados do dashboard
  const { data: dashboardData, isLoading: loadingDashboard } = useQuery({
    queryKey: ['/api/controle/dashboard/admin'],
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  // Buscar attendants
  const { data: attendants = [] } = useQuery({
    queryKey: ['/api/controle/attendants'],
  });

  // Buscar vendas
  const { data: sales = [] } = useQuery({
    queryKey: ['/api/controle/sales', selectedAttendant],
    queryFn: () => apiRequest('GET', `/api/controle/sales?${selectedAttendant !== 'admin' ? `attendantId=${selectedAttendant}` : ''}`),
  });

  // Buscar entregas de hoje
  const { data: todayDeliveries = [] } = useQuery({
    queryKey: ['/api/controle/deliveries/today'],
  });

  // Mutation para criar nova venda
  const createSaleMutation = useMutation({
    mutationFn: (saleData: any) => apiRequest('POST', '/api/controle/sales', saleData),
    onSuccess: () => {
      toast({ title: "Venda criada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['/api/controle/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/controle/dashboard/admin'] });
      setNewSaleDialog(false);
    },
    onError: (error) => {
      toast({ title: "Erro ao criar venda", description: error.message, variant: "destructive" });
    },
  });

  // Mutation para atualizar venda
  const updateSaleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest('PATCH', `/api/controle/sales/${id}`, data),
    onSuccess: () => {
      toast({ title: "Venda atualizada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['/api/controle/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/controle/dashboard/admin'] });
      setEditSaleDialog(false);
      setSelectedSale(null);
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar venda", description: error.message, variant: "destructive" });
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
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Componente de formulário de venda
  const SaleForm = ({ sale, onSubmit, isEditing = false }: { 
    sale?: Sale; 
    onSubmit: (data: any) => void; 
    isEditing?: boolean;
  }) => {
    const [formData, setFormData] = useState({
      atendente_id: sale?.atendente_id || '',
      cliente_nome: sale?.cliente_nome || '',
      cliente_telefone: sale?.cliente_telefone || '',
      cliente_endereco: sale?.cliente_endereco || '',
      valor_venda: sale?.valor_venda || 0,
      status: sale?.status || 'agendado',
      data_venda: sale?.data_venda || new Date().toISOString().split('T')[0],
      data_agendamento: sale?.data_agendamento || '',
      periodo_entrega: sale?.periodo_entrega || '',
      observacoes: sale?.observacoes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="atendente_id">Atendente</Label>
            <Select value={formData.atendente_id} onValueChange={(value) => 
              setFormData({ ...formData, atendente_id: value })
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um atendente" />
              </SelectTrigger>
              <SelectContent>
                {attendants.map((att: Attendant) => (
                  <SelectItem key={att.id} value={att.id}>{att.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => 
              setFormData({ ...formData, status: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cliente_nome">Nome do Cliente</Label>
            <Input
              id="cliente_nome"
              value={formData.cliente_nome}
              onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="cliente_telefone">Telefone</Label>
            <Input
              id="cliente_telefone"
              value={formData.cliente_telefone}
              onChange={(e) => setFormData({ ...formData, cliente_telefone: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="cliente_endereco">Endereço</Label>
          <Input
            id="cliente_endereco"
            value={formData.cliente_endereco}
            onChange={(e) => setFormData({ ...formData, cliente_endereco: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="valor_venda">Valor da Venda</Label>
            <Input
              id="valor_venda"
              type="number"
              step="0.01"
              value={formData.valor_venda}
              onChange={(e) => setFormData({ ...formData, valor_venda: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div>
            <Label htmlFor="data_venda">Data da Venda</Label>
            <Input
              id="data_venda"
              type="date"
              value={formData.data_venda}
              onChange={(e) => setFormData({ ...formData, data_venda: e.target.value })}
              required
            />
          </div>
        </div>

        {formData.status === 'agendado' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_agendamento">Data de Agendamento</Label>
              <Input
                id="data_agendamento"
                type="date"
                value={formData.data_agendamento}
                onChange={(e) => setFormData({ ...formData, data_agendamento: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="periodo_entrega">Período de Entrega</Label>
              <Select value={formData.periodo_entrega} onValueChange={(value) => 
                setFormData({ ...formData, periodo_entrega: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manha">Manhã</SelectItem>
                  <SelectItem value="tarde">Tarde</SelectItem>
                  <SelectItem value="noite">Noite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="observacoes">Observações</Label>
          <Input
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          />
        </div>

        <Button type="submit" className="w-full">
          {isEditing ? 'Atualizar Venda' : 'Criar Venda'}
        </Button>
      </form>
    );
  };

  if (loadingDashboard) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const dashboard: DashboardData = dashboardData || {
    vendasHoje: 0,
    valorHoje: 0,
    vendasMes: 0,
    valorMes: 0,
    comissoesMes: 0,
    entregasHoje: 0,
    performanceAttendants: []
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
            Sistema Controle - Cash on Delivery
          </h1>
          
          <Dialog open={newSaleDialog} onOpenChange={setNewSaleDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Venda
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Nova Venda</DialogTitle>
              </DialogHeader>
              <SaleForm onSubmit={(data) => createSaleMutation.mutate(data)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Vendas Hoje</CardTitle>
              <ShoppingCart className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-800">{dashboard.vendasHoje}</div>
              <p className="text-xs text-emerald-600">
                {formatCurrency(dashboard.valorHoje)} em vendas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Vendas do Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{dashboard.vendasMes}</div>
              <p className="text-xs text-green-600">
                {formatCurrency(dashboard.valorMes)} faturado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-teal-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-700">Comissões do Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-800">
                {formatCurrency(dashboard.comissoesMes)}
              </div>
              <p className="text-xs text-teal-600">
                10% sobre vendas pagas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">Entregas Hoje</CardTitle>
              <Package className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-800">{dashboard.entregasHoje}</div>
              <p className="text-xs text-amber-600">
                Agendadas para hoje
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principal */}
        <Tabs defaultValue="vendas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
            <TabsTrigger value="entregas">Entregas Hoje</TabsTrigger>
            <TabsTrigger value="attendants">Atendentes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Tab Vendas */}
          <TabsContent value="vendas" className="space-y-4">
            <div className="flex items-center gap-4">
              <Label>Filtrar por Atendente:</Label>
              <Select value={selectedAttendant} onValueChange={setSelectedAttendant}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Todos os Atendentes</SelectItem>
                  {attendants.map((att: Attendant) => (
                    <SelectItem key={att.id} value={att.id}>{att.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Lista de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sales.map((sale: Sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                      <div className="grid grid-cols-5 gap-4 flex-1">
                        <div>
                          <p className="font-medium">{sale.cliente_nome}</p>
                          <p className="text-sm text-gray-600">{sale.cliente_telefone}</p>
                        </div>
                        <div>
                          <p className="font-medium">{formatCurrency(sale.valor_venda)}</p>
                          <p className="text-sm text-gray-600">{sale.atendente_nome}</p>
                        </div>
                        <div>
                          <Badge variant={
                            sale.status === 'pago' ? 'default' : 
                            sale.status === 'agendado' ? 'secondary' : 'destructive'
                          }>
                            {sale.status === 'pago' ? 'Pago' : 
                             sale.status === 'agendado' ? 'Agendado' : 'Cancelado'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm">{formatDate(sale.data_venda)}</p>
                          {sale.data_agendamento && (
                            <p className="text-xs text-gray-600">
                              Entrega: {formatDate(sale.data_agendamento)}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-green-600">
                            {formatCurrency(sale.comissao_calculada)}
                          </p>
                          <p className="text-xs text-gray-600">Comissão</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSale(sale);
                          setEditSaleDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Entregas */}
          <TabsContent value="entregas">
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Entregas Agendadas para Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayDeliveries.map((delivery: Sale) => (
                    <div key={delivery.id} className="p-4 bg-white rounded-lg border">
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="font-medium">{delivery.cliente_nome}</p>
                          <p className="text-sm text-gray-600">{delivery.cliente_telefone}</p>
                        </div>
                        <div>
                          <p className="font-medium">{formatCurrency(delivery.valor_venda)}</p>
                          <p className="text-sm text-gray-600">{delivery.atendente_nome}</p>
                        </div>
                        <div>
                          <Badge variant="secondary">
                            {delivery.periodo_entrega === 'manha' ? 'Manhã' :
                             delivery.periodo_entrega === 'tarde' ? 'Tarde' : 'Noite'}
                          </Badge>
                        </div>
                        <div>
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4 mr-2" />
                            Notificar Cliente
                          </Button>
                        </div>
                      </div>
                      {delivery.cliente_endereco && (
                        <p className="text-sm text-gray-600 mt-2">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {delivery.cliente_endereco}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Atendentes */}
          <TabsContent value="attendants">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {attendants.map((attendant: Attendant) => (
                <Card key={attendant.id} className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {attendant.nome}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{attendant.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Telefone</p>
                      <p className="font-medium">{attendant.telefone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Meta Diária</p>
                      <p className="font-medium">{attendant.meta_vendas_diaria} vendas</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Comissão</p>
                      <p className="font-medium">{attendant.comissao_percentual}%</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab Analytics */}
          <TabsContent value="analytics">
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Performance dos Atendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard.performanceAttendants.map((perf, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg border">
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="font-medium">{perf.nome}</p>
                        </div>
                        <div>
                          <p className="font-medium">{perf.vendas_mes} vendas</p>
                          <p className="text-sm text-gray-600">Este mês</p>
                        </div>
                        <div>
                          <p className="font-medium">{formatCurrency(perf.valor_total_mes)}</p>
                          <p className="text-sm text-gray-600">Faturamento</p>
                        </div>
                        <div>
                          <p className="font-medium text-green-600">{formatCurrency(perf.comissao_mes)}</p>
                          <p className="text-sm text-gray-600">Comissão</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog para editar venda */}
        <Dialog open={editSaleDialog} onOpenChange={setEditSaleDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Venda</DialogTitle>
            </DialogHeader>
            {selectedSale && (
              <SaleForm 
                sale={selectedSale} 
                onSubmit={(data) => updateSaleMutation.mutate({ id: selectedSale.id, data })}
                isEditing={true}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}