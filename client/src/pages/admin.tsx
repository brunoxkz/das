import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth-jwt";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Shield, Users, Settings, Crown, Bell, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  plan: string;
  createdAt: string;
}

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-red-500 text-white';
    case 'editor': return 'bg-blue-500 text-white';
    case 'user': return 'bg-gray-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getPlanBadgeColor = (plan: string) => {
  switch (plan) {
    case 'enterprise': return 'bg-purple-500 text-white';
    case 'premium': return 'bg-green-500 text-white';
    case 'free': return 'bg-gray-400 text-white';
    default: return 'bg-gray-400 text-white';
  }
};

export default function AdminPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  
  // Notification form state
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    isGlobal: true,
    targetUsers: [] as string[]
  });

  // Fetch all users
  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      console.log("ADMIN - Buscando usuários...");
      const data = await apiRequest('GET', '/api/admin/users');
      console.log("ADMIN - Users data:", data);
      return Array.isArray(data) ? data : [];
    },
    enabled: user?.role === 'admin'
  });

  console.log("ADMIN - Estado atual:", { user: user?.role, users, isLoading, error });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await apiRequest('PUT', `/api/admin/users/${userId}/role`, { 
        body: JSON.stringify({ role }),
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Sucesso",
        description: "Papel do usuário atualizado com sucesso",
      });
      setSelectedUser(null);
      setNewRole('');
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar papel do usuário",
        variant: "destructive"
      });
    }
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (notificationData: any) => {
      return await apiRequest('POST', '/api/notifications', {
        body: JSON.stringify(notificationData),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({
        title: "Notificação enviada!",
        description: "A notificação foi enviada com sucesso.",
      });
      setNotificationForm({
        title: '',
        message: '',
        type: 'info',
        isGlobal: true,
        targetUsers: []
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar notificação",
        description: error.message || "Erro interno do servidor",
        variant: "destructive"
      });
    }
  });

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Acesso Negado
              </CardTitle>
              <CardDescription>
                Você não tem permissão para acessar esta página.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const handleUpdateRole = (userId: string, role: string) => {
    updateRoleMutation.mutate({ userId, role });
  };

  const handleSendNotification = () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast({
        title: "Erro",
        description: "Título e mensagem são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    sendNotificationMutation.mutate(notificationForm);
  };

  const handleUserSelection = (userId: string, isChecked: boolean) => {
    if (isChecked) {
      setNotificationForm(prev => ({
        ...prev,
        targetUsers: [...prev.targetUsers, userId]
      }));
    } else {
      setNotificationForm(prev => ({
        ...prev,
        targetUsers: prev.targetUsers.filter(id => id !== userId)
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            Painel de Administração
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Gerencie usuários, roles, permissões e notificações do sistema
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users?.filter(u => u.role === 'admin').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Premium</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users?.filter(u => u.plan !== 'free').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Gerenciar Usuários
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Enviar Notificações
            </TabsTrigger>
          </TabsList>

          {/* Users Management Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>
                  Visualize e edite os papéis dos usuários no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Papel</TableHead>
                        <TableHead>Plano</TableHead>
                        <TableHead>Cadastrado em</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPlanBadgeColor(user.plan)}>
                              {user.plan}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            {selectedUser === user.id ? (
                              <div className="flex gap-2">
                                <Select value={newRole} onValueChange={setNewRole}>
                                  <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Papel" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">user</SelectItem>
                                    <SelectItem value="editor">editor</SelectItem>
                                    <SelectItem value="admin">admin</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleUpdateRole(user.id, newRole)}
                                  disabled={!newRole || updateRoleMutation.isPending}
                                >
                                  Salvar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedUser(null);
                                    setNewRole('');
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(user.id);
                                  setNewRole(user.role);
                                }}
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Editar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Enviar Notificações
                </CardTitle>
                <CardDescription>
                  Envie notificações para todos os usuários ou usuários específicos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Notification Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título da Notificação</Label>
                    <Input
                      id="title"
                      placeholder="Digite o título da notificação"
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      placeholder="Digite a mensagem da notificação"
                      value={notificationForm.message}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Notificação</Label>
                    <Select 
                      value={notificationForm.type} 
                      onValueChange={(value: any) => setNotificationForm(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Informação</SelectItem>
                        <SelectItem value="success">Sucesso</SelectItem>
                        <SelectItem value="warning">Aviso</SelectItem>
                        <SelectItem value="error">Erro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Global vs Specific Users */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="global"
                        checked={notificationForm.isGlobal}
                        onCheckedChange={(checked) => 
                          setNotificationForm(prev => ({ 
                            ...prev, 
                            isGlobal: checked as boolean,
                            targetUsers: checked ? [] : prev.targetUsers
                          }))
                        }
                      />
                      <Label htmlFor="global">Enviar para todos os usuários</Label>
                    </div>

                    {!notificationForm.isGlobal && (
                      <div className="space-y-2">
                        <Label>Selecionar Usuários Específicos</Label>
                        <div className="max-h-40 overflow-y-auto border rounded-md p-3">
                          {users?.map((user) => (
                            <div key={user.id} className="flex items-center space-x-2 py-1">
                              <Checkbox
                                id={`user-${user.id}`}
                                checked={notificationForm.targetUsers.includes(user.id)}
                                onCheckedChange={(checked) => handleUserSelection(user.id, checked as boolean)}
                              />
                              <Label htmlFor={`user-${user.id}`} className="text-sm">
                                {user.firstName} {user.lastName} ({user.email})
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={handleSendNotification}
                    disabled={sendNotificationMutation.isPending || !notificationForm.title || !notificationForm.message}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sendNotificationMutation.isPending ? 'Enviando...' : 'Enviar Notificação'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}