import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Crown, 
  Shield, 
  Users, 
  CreditCard, 
  TrendingUp, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Search
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  username: string;
  email: string;
  plan: string;
  credits: {
    sms: number;
    email: number;
    whatsapp: number;
    ai: number;
    total: number;
  };
  isBlocked: boolean;
  createdAt: string;
}

interface BillingStats {
  totalUsers: number;
  freeUsers: number;
  proUsers: number;
  enterpriseUsers: number;
  totalCreditsIssued: number;
  totalRevenue: number;
  blockedUsers: number;
}

export default function AdminBilling() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [upgradeData, setUpgradeData] = useState({
    plan: '',
    months: 1
  });
  const [creditData, setCreditData] = useState({
    type: 'sms',
    amount: 1000,
    description: ''
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/billing-stats'],
    queryFn: () => apiRequest('GET', '/api/admin/billing-stats')
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: () => apiRequest('GET', '/api/admin/users')
  });

  const upgradePlanMutation = useMutation({
    mutationFn: ({ userId, plan, months }: { userId: string; plan: string; months: number }) =>
      apiRequest('POST', '/api/admin/upgrade-plan', { userId, plan, months }),
    onSuccess: () => {
      toast({
        title: "Plano atualizado",
        description: "O plano do usuário foi atualizado com sucesso!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/billing-stats'] });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar plano",
        variant: "destructive"
      });
    }
  });

  const addCreditsMutation = useMutation({
    mutationFn: ({ userId, type, amount, description }: { userId: string; type: string; amount: number; description: string }) =>
      apiRequest('POST', '/api/admin/add-credits', { userId, type, amount, description }),
    onSuccess: () => {
      toast({
        title: "Créditos adicionados",
        description: "Créditos foram adicionados ao usuário com sucesso!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/billing-stats'] });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar créditos",
        variant: "destructive"
      });
    }
  });

  const blockUserMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      apiRequest('POST', '/api/admin/block-user', { userId, reason }),
    onSuccess: () => {
      toast({
        title: "Usuário bloqueado",
        description: "Usuário foi bloqueado com sucesso!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/billing-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao bloquear usuário",
        variant: "destructive"
      });
    }
  });

  const unblockUserMutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      apiRequest('POST', '/api/admin/unblock-user', { userId }),
    onSuccess: () => {
      toast({
        title: "Usuário desbloqueado",
        description: "Usuário foi desbloqueado com sucesso!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/billing-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao desbloquear usuário",
        variant: "destructive"
      });
    }
  });

  const filteredUsers = users?.filter((user: User) => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = selectedPlan ? user.plan === selectedPlan : true;
    return matchesSearch && matchesPlan;
  }) || [];

  const handleUpgradePlan = () => {
    if (!selectedUser || !upgradeData.plan) return;
    
    upgradePlanMutation.mutate({
      userId: selectedUser,
      plan: upgradeData.plan,
      months: upgradeData.months
    });
  };

  const handleAddCredits = () => {
    if (!selectedUser || !creditData.type || creditData.amount <= 0) return;
    
    addCreditsMutation.mutate({
      userId: selectedUser,
      type: creditData.type,
      amount: creditData.amount,
      description: creditData.description || `Créditos ${creditData.type.toUpperCase()} adicionados pelo admin`
    });
  };

  if (statsLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin - Billing</h1>
          <p className="text-muted-foreground">
            Gerencie planos, créditos e usuários
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Shield className="w-4 h-4 mr-1" />
          Administrador
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.blockedUsers || 0} bloqueados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Usuários Premium</CardTitle>
              <Crown className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.proUsers || 0) + (stats?.enterpriseUsers || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Pro: {stats?.proUsers || 0} | Enterprise: {stats?.enterpriseUsers || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Créditos Emitidos</CardTitle>
              <CreditCard className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCreditsIssued?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total acumulado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats?.totalRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Faturamento acumulado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="actions">
            <Edit className="w-4 h-4 mr-2" />
            Ações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar usuários</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="plan-filter">Filtrar por plano</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os planos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os planos</SelectItem>
                  <SelectItem value="FREE">Gratuito</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuários</CardTitle>
              <CardDescription>
                {filteredUsers.length} usuários encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredUsers.map((user: User) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{user.username}</h4>
                          <Badge variant={user.plan === 'FREE' ? 'secondary' : user.plan === 'PRO' ? 'default' : 'destructive'}>
                            {user.plan}
                          </Badge>
                          {user.isBlocked && (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              Bloqueado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Créditos: SMS {user.credits?.sms || 0} | Email {user.credits?.email || 0} | WhatsApp {user.credits?.whatsapp || 0} | IA {user.credits?.ai || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedUser(user.id)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      {user.isBlocked ? (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => unblockUserMutation.mutate({ userId: user.id })}
                          disabled={unblockUserMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Desbloquear
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => blockUserMutation.mutate({ userId: user.id, reason: 'Bloqueado pelo admin' })}
                          disabled={blockUserMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Bloquear
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          {selectedUser ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upgrade Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Atualizar Plano</CardTitle>
                  <CardDescription>
                    Altere o plano do usuário selecionado
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="upgrade-plan">Novo plano</Label>
                    <Select value={upgradeData.plan} onValueChange={(value) => setUpgradeData({...upgradeData, plan: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FREE">Gratuito</SelectItem>
                        <SelectItem value="PRO">Pro</SelectItem>
                        <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="months">Meses</Label>
                    <Input
                      id="months"
                      type="number"
                      min="1"
                      max="12"
                      value={upgradeData.months}
                      onChange={(e) => setUpgradeData({...upgradeData, months: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <Button 
                    onClick={handleUpgradePlan}
                    disabled={upgradePlanMutation.isPending || !upgradeData.plan}
                    className="w-full"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Atualizar Plano
                  </Button>
                </CardContent>
              </Card>

              {/* Add Credits */}
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Créditos</CardTitle>
                  <CardDescription>
                    Adicione créditos ao usuário selecionado
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="credit-type">Tipo de crédito</Label>
                    <Select value={creditData.type} onValueChange={(value) => setCreditData({...creditData, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="ai">IA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="credit-amount">Quantidade</Label>
                    <Input
                      id="credit-amount"
                      type="number"
                      min="1"
                      value={creditData.amount}
                      onChange={(e) => setCreditData({...creditData, amount: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="credit-description">Descrição (opcional)</Label>
                    <Input
                      id="credit-description"
                      placeholder="Motivo da adição..."
                      value={creditData.description}
                      onChange={(e) => setCreditData({...creditData, description: e.target.value})}
                    />
                  </div>
                  <Button 
                    onClick={handleAddCredits}
                    disabled={addCreditsMutation.isPending || creditData.amount <= 0}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Créditos
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Nenhum usuário selecionado</CardTitle>
                <CardDescription>
                  Selecione um usuário na aba "Usuários" para realizar ações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                  <p>Selecione um usuário para continuar</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}