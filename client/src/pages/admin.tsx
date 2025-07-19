import { useState } from "react";
import { useAuth } from "@/hooks/use-auth-sqlite";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  CreditCard, 
  Shield, 
  Coins, 
  Plus, 
  Edit, 
  Trash2,
  UserCog,
  Award,
  Activity,
  DollarSign,
  Package
} from "lucide-react";

interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin' | 'moderator';
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  createdAt: string;
  lastLoginAt: string;
  quizCount: number;
  planExpiryDate?: string;
  daysRemaining?: number;
  totalPayments: number;
  smsCount: number;
  emailCount: number;
  credits: {
    sms: number;
    email: number;
    whatsapp: number;
    ai: number;
    video: number;
  };
}

interface UserCredits {
  userId: string;
  smsCredits: number;
  emailCredits: number;
  whatsappCredits: number;
  aiCredits: number;
  videoCredits: number;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    quizzes: number;
    responses: number;
    storage: number;
  };
}

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Acesso Negado</CardTitle>
            <CardDescription className="text-center">
              Você precisa ser administrador para acessar esta página.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Fetch users
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    retry: false,
  });

  // Fetch plans
  const { data: plansResponse, isLoading: loadingPlans } = useQuery({
    queryKey: ['/api/admin/plans'],
    retry: false,
  });
  
  const plans = Array.isArray(plansResponse) ? plansResponse : [];

  // Fetch system stats
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
    retry: false,
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: { userId: string; role?: string; plan?: string }) => {
      return await apiRequest("PATCH", `/api/admin/users/${data.userId}`, {
        role: data.role,
        plan: data.plan
      });
    },
    onSuccess: () => {
      toast({
        title: "Usuário atualizado",
        description: "As alterações foram salvas com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowUserDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  });

  // Add credits mutation
  const addCreditsMutation = useMutation({
    mutationFn: async (data: { userId: string; type: string; amount: number }) => {
      return await apiRequest("POST", "/api/admin/credits/add", data);
    },
    onSuccess: () => {
      toast({
        title: "Créditos adicionados",
        description: "Os créditos foram adicionados com sucesso."
      });
      setShowCreditsDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar créditos",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  });

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "bg-red-100 text-red-800",
      moderator: "bg-blue-100 text-blue-800", 
      user: "bg-gray-100 text-gray-800"
    };
    return <Badge className={variants[role as keyof typeof variants]}>{role}</Badge>;
  };

  const getPlanBadge = (plan: string) => {
    const variants = {
      enterprise: "bg-purple-100 text-purple-800",
      premium: "bg-gold-100 text-gold-800",
      basic: "bg-blue-100 text-blue-800",
      free: "bg-gray-100 text-gray-800"
    };
    return <Badge className={variants[plan as keyof typeof variants]}>{plan}</Badge>;
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserCog className="w-8 h-8 text-orange-600" />
          Painel de Administração
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie usuários, planos, créditos e configurações do sistema
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.newUsersThisMonth || 0} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats?.monthlyRevenue || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.revenueGrowth || 0}% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Criados</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalQuizzes || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.newQuizzesThisMonth || 0} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinantes Ativos</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSubscribers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.subscriptionRate || 0}% taxa de conversão
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="credits">Créditos</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os usuários da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="text-center py-8">Carregando usuários...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Quizzes</TableHead>
                      <TableHead>Créditos</TableHead>
                      <TableHead>Envios</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <div>
                            {getPlanBadge(user.plan)}
                            {user.daysRemaining && user.daysRemaining > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {user.daysRemaining} dias restantes
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.quizCount || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-xs">SMS: {user.credits?.sms || 0}</div>
                            <div className="text-xs">Email: {user.credits?.email || 0}</div>
                            <div className="text-xs">WhatsApp: {user.credits?.whatsapp || 0}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-xs">SMS: {user.smsCount || 0}</div>
                            <div className="text-xs">Email: {user.emailCount || 0}</div>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gerenciar Planos</CardTitle>
                <CardDescription>Configure os planos de assinatura</CardDescription>
              </div>
              <Button onClick={() => setShowPlanDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Plano
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan: Plan) => (
                  <Card key={plan.id} className="relative">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {plan.name}
                        <Badge>{plan.interval === 'month' ? 'Mensal' : 'Anual'}</Badge>
                      </CardTitle>
                      <CardDescription>
                        R$ {plan.price}/{plan.interval === 'month' ? 'mês' : 'ano'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <strong>Limites:</strong>
                        </div>
                        <ul className="text-sm space-y-1">
                          <li>• {plan.limits?.quizzes || 'Ilimitado'} quizzes</li>
                          <li>• {plan.limits?.responses || 'Ilimitado'} respostas</li>
                          <li>• {plan.limits?.storage || 'Ilimitado'} GB de armazenamento</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credits Tab */}
        <TabsContent value="credits" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gerenciar Créditos</CardTitle>
                <CardDescription>Adicione ou remova créditos dos usuários</CardDescription>
              </div>
              <Button onClick={() => setShowCreditsDialog(true)}>
                <Coins className="w-4 h-4 mr-2" />
                Adicionar Créditos
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Selecione "Adicionar Créditos" para gerenciar créditos de usuários específicos
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>Configure parâmetros globais da plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="max-quiz-limit">Limite máximo de quizzes (plano gratuito)</Label>
                  <Input id="max-quiz-limit" type="number" defaultValue="3" className="mt-1" />
                </div>
                
                <div>
                  <Label htmlFor="default-credits">Créditos padrão para novos usuários</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <div>
                      <Label className="text-xs">SMS</Label>
                      <Input type="number" defaultValue="5" />
                    </div>
                    <div>
                      <Label className="text-xs">Email</Label>
                      <Input type="number" defaultValue="100" />
                    </div>
                    <div>
                      <Label className="text-xs">WhatsApp</Label>
                      <Input type="number" defaultValue="10" />
                    </div>
                    <div>
                      <Label className="text-xs">IA</Label>
                      <Input type="number" defaultValue="20" />
                    </div>
                  </div>
                </div>

                <Button>Salvar Configurações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere o role ou plano do usuário selecionado
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label>Usuário</Label>
                <div className="text-sm text-muted-foreground mt-1">
                  {selectedUser.username} ({selectedUser.email})
                </div>
              </div>

              <div>
                <Label htmlFor="user-role">Role</Label>
                <Select defaultValue={selectedUser.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="moderator">Moderador</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="user-plan">Plano</Label>
                <Select defaultValue={selectedUser.plan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Gratuito</SelectItem>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    // Here you would handle the form submission
                    setShowUserDialog(false);
                  }}
                  disabled={updateUserMutation.isPending}
                >
                  Salvar Alterações
                </Button>
                <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Credits Dialog */}
      <Dialog open={showCreditsDialog} onOpenChange={setShowCreditsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Créditos</DialogTitle>
            <DialogDescription>
              Adicione créditos para um usuário específico
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="credits-user">Usuário</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: User) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="credits-type">Tipo de Crédito</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="ai">IA</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="credits-amount">Quantidade</Label>
              <Input 
                id="credits-amount" 
                type="number" 
                placeholder="Digite a quantidade de créditos"
                min="1"
              />
            </div>

            <div className="flex gap-2">
              <Button disabled={addCreditsMutation.isPending}>
                Adicionar Créditos
              </Button>
              <Button variant="outline" onClick={() => setShowCreditsDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}