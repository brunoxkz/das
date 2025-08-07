import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Package,
  CreditCard,
  MessageCircle,
  UserPlus,
  Bell,
  Send,
  User,
  Edit3
} from 'lucide-react';

// Interfaces
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
  status: 'agendado' | 'pago' | 'cancelado' | 'em_rota';
  data_pedido: string;
  data_agendamento?: string;
  periodo_entrega?: 'manha' | 'tarde' | 'noite';
  forma_pagamento?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface DashboardData {
  vendasHoje: { count: number; valor: number };
  vendasMes: { count: number; valor: number };
  comissoesMes: { valor: number };
  entregasHoje: { count: number };
  performanceAttendants: any[];
}

function ControleDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados do sistema
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedAttendant, setSelectedAttendant] = useState<string>('');
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isCreateAttendantOpen, setIsCreateAttendantOpen] = useState(false);
  const [todayReminders, setTodayReminders] = useState<Sale[]>([]);

  // Estados dos formulários
  const [orderForm, setOrderForm] = useState({
    cliente_nome: '',
    cliente_telefone: '',
    cliente_endereco: '',
    valor_venda: '',
    categoria: 'LOGZZ' as 'LOGZZ' | 'AFTER PAY',
    data_agendamento: '',
    periodo_entrega: '' as 'manha' | 'tarde' | 'noite' | '',
    observacoes: ''
  });

  const [attendantForm, setAttendantForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    meta_vendas_diaria: '5',
    comissao_percentual: '10'
  });

  // Buscar dados do usuário atual
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/verify'],
    onSuccess: (data) => {
      setCurrentUser(data);
      setIsAdmin(data?.email === 'admin@admin.com' || data?.role === 'admin');
    }
  });

  // Buscar atendentes (apenas admin)
  const { data: attendants = [] } = useQuery({
    queryKey: ['/api/controle/attendants'],
    enabled: isAdmin,
  });

  // Definir atendente atual
  const currentAttendantId = isAdmin ? selectedAttendant : currentUser?.id;

  // Buscar vendas do atendente atual
  const { data: sales = [] } = useQuery({
    queryKey: ['/api/controle/sales', currentAttendantId],
    enabled: !!currentAttendantId,
    refetchInterval: 30000,
  });

  // Buscar dashboard do atendente
  const { data: dashboardData, isLoading: loadingDashboard } = useQuery({
    queryKey: ['/api/controle/dashboard', currentAttendantId],
    enabled: !!currentAttendantId,
    refetchInterval: 30000,
  });

  // Verificar lembretes de hoje
  useEffect(() => {
    if (sales.length > 0) {
      const hoje = new Date().toISOString().split('T')[0];
      const reminders = sales.filter((sale: Sale) => 
        sale.categoria === 'LOGZZ' && 
        sale.status === 'agendado' && 
        sale.data_agendamento === hoje
      );
      setTodayReminders(reminders);
    }
  }, [sales]);

  // Mutation para criar nova venda
  const createSaleMutation = useMutation({
    mutationFn: (saleData: any) => {
      const valorVenda = parseFloat(saleData.valor_venda);
      return apiRequest('POST', '/api/controle/sales', {
        ...saleData,
        atendente_id: currentAttendantId,
        valor_venda: valorVenda,
        status: 'agendado',
        data_pedido: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast({ title: "Pedido criado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['/api/controle/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/controle/dashboard'] });
      setIsCreateOrderOpen(false);
      setOrderForm({
        cliente_nome: '',
        cliente_telefone: '',
        cliente_endereco: '',
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

  // Mutation para criar atendente (apenas admin)
  const createAttendantMutation = useMutation({
    mutationFn: (attendantData: any) => 
      apiRequest('POST', '/api/controle/attendants', attendantData),
    onSuccess: () => {
      toast({ title: "Atendente criado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['/api/controle/attendants'] });
      setIsCreateAttendantOpen(false);
      setAttendantForm({
        nome: '',
        email: '',
        telefone: '',
        meta_vendas_diaria: '5',
        comissao_percentual: '10'
      });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar atendente", description: error.message, variant: "destructive" });
    },
  });

  // Mutation para confirmar pagamento
  const confirmPaymentMutation = useMutation({
    mutationFn: ({ id, forma_pagamento }: { id: string; forma_pagamento: string }) => 
      apiRequest('PATCH', `/api/controle/sales/${id}`, { 
        status: 'pago',
        forma_pagamento
      }),
    onSuccess: () => {
      toast({ title: "Pagamento confirmado!" });
      queryClient.invalidateQueries({ queryKey: ['/api/controle/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/controle/dashboard'] });
    },
  });

  // Mutation para marcar como em rota
  const markInRouteMutation = useMutation({
    mutationFn: (saleId: string) => 
      apiRequest('PATCH', `/api/controle/sales/${saleId}`, { status: 'em_rota' }),
    onSuccess: () => {
      toast({ title: "Pedido marcado como em rota!" });
      queryClient.invalidateQueries({ queryKey: ['/api/controle/sales'] });
    },
  });

  // Enviar mensagem WhatsApp
  const sendWhatsAppMessage = (telefone: string, clienteNome: string) => {
    // Formatar número para WhatsApp (remover caracteres especiais e adicionar 55)
    const phoneNumber = telefone.replace(/\D/g, '');
    const formattedPhone = phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`;
    
    const message = encodeURIComponent('O Motoboy está indo com o seu pedido! =)');
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({ 
      title: "WhatsApp aberto!", 
      description: `Mensagem para ${clienteNome} preparada` 
    });
  };

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Sistema Controle</h1>
            <p className="text-slate-300">
              {isAdmin ? "Painel Administrativo" : `Bem-vindo, ${currentUser.nome || currentUser.email}`}
            </p>
          </div>
          
          <div className="flex gap-3">
            {isAdmin && (
              <>
                {/* Seletor de atendente (admin) */}
                <Select value={selectedAttendant} onValueChange={setSelectedAttendant}>
                  <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecionar atendente" />
                  </SelectTrigger>
                  <SelectContent>
                    {attendants.map((attendant: Attendant) => (
                      <SelectItem key={attendant.id} value={attendant.id}>
                        {attendant.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Botão criar atendente */}
                <Dialog open={isCreateAttendantOpen} onOpenChange={setIsCreateAttendantOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Criar Atendente
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Atendente</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Nome</Label>
                        <Input
                          value={attendantForm.nome}
                          onChange={(e) => setAttendantForm({...attendantForm, nome: e.target.value})}
                          className="bg-slate-700 border-slate-600"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={attendantForm.email}
                          onChange={(e) => setAttendantForm({...attendantForm, email: e.target.value})}
                          className="bg-slate-700 border-slate-600"
                        />
                      </div>
                      <div>
                        <Label>Telefone</Label>
                        <Input
                          value={attendantForm.telefone}
                          onChange={(e) => setAttendantForm({...attendantForm, telefone: e.target.value})}
                          className="bg-slate-700 border-slate-600"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Meta Vendas/Dia</Label>
                          <Input
                            type="number"
                            value={attendantForm.meta_vendas_diaria}
                            onChange={(e) => setAttendantForm({...attendantForm, meta_vendas_diaria: e.target.value})}
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                        <div>
                          <Label>Comissão (%)</Label>
                          <Input
                            type="number"
                            value={attendantForm.comissao_percentual}
                            onChange={(e) => setAttendantForm({...attendantForm, comissao_percentual: e.target.value})}
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={() => createAttendantMutation.mutate(attendantForm)}
                        disabled={createAttendantMutation.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {createAttendantMutation.isPending ? 'Criando...' : 'Criar Atendente'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {/* Botão criar pedido */}
            {currentAttendantId && (
              <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Pedido
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Nova Solicitação de Pedido</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nome do Cliente</Label>
                        <Input
                          value={orderForm.cliente_nome}
                          onChange={(e) => setOrderForm({...orderForm, cliente_nome: e.target.value})}
                          className="bg-slate-700 border-slate-600"
                        />
                      </div>
                      <div>
                        <Label>Telefone</Label>
                        <Input
                          value={orderForm.cliente_telefone}
                          onChange={(e) => setOrderForm({...orderForm, cliente_telefone: e.target.value})}
                          placeholder="(11) 99999-9999"
                          className="bg-slate-700 border-slate-600"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Endereço</Label>
                      <Textarea
                        value={orderForm.cliente_endereco}
                        onChange={(e) => setOrderForm({...orderForm, cliente_endereco: e.target.value})}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Valor da Venda</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={orderForm.valor_venda}
                          onChange={(e) => setOrderForm({...orderForm, valor_venda: e.target.value})}
                          className="bg-slate-700 border-slate-600"
                        />
                      </div>
                      <div>
                        <Label>Categoria</Label>
                        <Select 
                          value={orderForm.categoria} 
                          onValueChange={(value: 'LOGZZ' | 'AFTER PAY') => 
                            setOrderForm({...orderForm, categoria: value})
                          }
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LOGZZ">LOGZZ</SelectItem>
                            <SelectItem value="AFTER PAY">AFTER PAY</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Campos específicos para LOGZZ */}
                    {orderForm.categoria === 'LOGZZ' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Data de Agendamento</Label>
                          <Input
                            type="date"
                            value={orderForm.data_agendamento}
                            onChange={(e) => setOrderForm({...orderForm, data_agendamento: e.target.value})}
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                        <div>
                          <Label>Período de Entrega</Label>
                          <Select 
                            value={orderForm.periodo_entrega} 
                            onValueChange={(value: 'manha' | 'tarde' | 'noite') => 
                              setOrderForm({...orderForm, periodo_entrega: value})
                            }
                          >
                            <SelectTrigger className="bg-slate-700 border-slate-600">
                              <SelectValue placeholder="Selecionar período" />
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
                      <Label>Observações</Label>
                      <Textarea
                        value={orderForm.observacoes}
                        onChange={(e) => setOrderForm({...orderForm, observacoes: e.target.value})}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>

                    <Button 
                      onClick={() => createSaleMutation.mutate(orderForm)}
                      disabled={createSaleMutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {createSaleMutation.isPending ? 'Criando...' : 'Criar Pedido'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Lembretes de hoje */}
        {todayReminders.length > 0 && (
          <Alert className="bg-yellow-600 border-yellow-500 text-yellow-100">
            <Bell className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                <strong>Lembretes de hoje:</strong> {todayReminders.length} pedido(s) agendado(s) para entrega hoje!
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Métricas do dashboard */}
        {currentAttendantId && dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Vendas Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.vendasHoje?.count || 0}</div>
                <div className="text-sm opacity-90">{formatCurrency(dashboardData.vendasHoje?.valor || 0)}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-600 to-green-700 border-0 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Vendas Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.vendasMes?.count || 0}</div>
                <div className="text-sm opacity-90">{formatCurrency(dashboardData.vendasMes?.valor || 0)}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-600 to-purple-700 border-0 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Comissão Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(dashboardData.comissoesMes?.valor || 0)}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-600 to-orange-700 border-0 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Entregas Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.entregasHoje?.count || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de pedidos */}
        {currentAttendantId && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Meus Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sales.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">Nenhum pedido encontrado</p>
                ) : (
                  sales.map((sale: Sale) => (
                    <div key={sale.id} className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-white">{sale.cliente_nome}</h3>
                            <Badge 
                              className={
                                sale.status === 'pago' ? 'bg-green-600' :
                                sale.status === 'em_rota' ? 'bg-blue-600' :
                                sale.status === 'cancelado' ? 'bg-red-600' :
                                'bg-yellow-600'
                              }
                            >
                              {sale.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-slate-300">
                              {sale.categoria}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-300">
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {sale.cliente_telefone}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {formatCurrency(sale.valor_venda)}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {sale.data_agendamento ? formatDate(sale.data_agendamento) : 'Não agendado'}
                            </div>
                            {sale.periodo_entrega && (
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {sale.periodo_entrega}
                              </div>
                            )}
                          </div>
                          
                          {sale.cliente_endereco && (
                            <div className="mt-2 text-sm text-slate-400 flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {sale.cliente_endereco}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {/* Ações para pedidos agendados para hoje */}
                          {sale.categoria === 'LOGZZ' && 
                           sale.status === 'agendado' && 
                           sale.data_agendamento === new Date().toISOString().split('T')[0] && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => markInRouteMutation.mutate(sale.id)}
                              >
                                <Package className="w-4 h-4 mr-1" />
                                Em Rota
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => sendWhatsAppMessage(sale.cliente_telefone, sale.cliente_nome)}
                              >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                WhatsApp
                              </Button>
                            </div>
                          )}

                          {/* Botão para confirmar pagamento */}
                          {(sale.status === 'agendado' || sale.status === 'em_rota') && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Confirmar Pagamento
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-slate-800 border-slate-700 text-white">
                                <DialogHeader>
                                  <DialogTitle>Confirmar Pagamento</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <p>Cliente: <strong>{sale.cliente_nome}</strong></p>
                                  <p>Valor: <strong>{formatCurrency(sale.valor_venda)}</strong></p>
                                  <div>
                                    <Label>Forma de Pagamento</Label>
                                    <Select onValueChange={(value) => {
                                      confirmPaymentMutation.mutate({
                                        id: sale.id,
                                        forma_pagamento: value
                                      });
                                    }}>
                                      <SelectTrigger className="bg-slate-700 border-slate-600">
                                        <SelectValue placeholder="Selecionar forma de pagamento" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                        <SelectItem value="pix">PIX</SelectItem>
                                        <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                                        <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ControleDashboard;