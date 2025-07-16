import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth-jwt";
import { queryClient } from "@/lib/queryClient";
import { 
  Shield, 
  Users, 
  Settings, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
  Trash2,
  Edit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados para gerenciamento de usuários
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  
  // Buscar todos os usuários (apenas para admin)
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user,
  });

  // Buscar estatísticas do sistema
  const { data: systemStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user,
  });

  // Buscar logs do sistema
  const { data: systemLogs } = useQuery({
    queryKey: ["/api/admin/logs"],
    enabled: !!user,
  });

  // Mutação para atualizar usuário
  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch(`/api/admin/users/${userData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("Erro ao atualizar usuário");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Usuário atualizado",
        description: "As informações do usuário foram atualizadas com sucesso.",
      });
    },
  });

  // Mutação para deletar usuário
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erro ao deletar usuário");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Usuário deletado",
        description: "O usuário foi removido do sistema.",
      });
    },
  });

  // Filtrar usuários baseado na busca
  const filteredUsers = users?.filter((user: any) => 
    user.username?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
  ) || [];

  const handleUserStatusToggle = (userId: string, currentStatus: boolean) => {
    updateUserMutation.mutate({
      id: userId,
      isActive: !currentStatus
    });
  };

  const handleUserRoleChange = (userId: string, newRole: string) => {
    updateUserMutation.mutate({
      id: userId,
      role: newRole
    });
  };

  if (loadingUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold">Painel de Administração</h1>
          <p className="text-gray-600">Gerenciamento completo do sistema</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gerenciamento de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="user-search">Buscar Usuário</Label>
                <Input
                  id="user-search"
                  placeholder="Digite o nome ou email do usuário..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="space-y-2">
                {filteredUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.username || 'Usuário'}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                            {user.role || 'user'}
                          </Badge>
                          <Badge variant={user.isActive ? 'default' : 'secondary'}>
                            {user.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUserStatusToggle(user.id, user.isActive)}
                      >
                        {user.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUserRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
                      >
                        {user.role === 'admin' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja deletar este usuário?')) {
                            deleteUserMutation.mutate(user.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.totalUsers || 0}</div>
                <p className="text-xs text-gray-600">usuários registrados</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Quizzes Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.activeQuizzes || 0}</div>
                <p className="text-xs text-gray-600">quizzes publicados</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Respostas Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.todayResponses || 0}</div>
                <p className="text-xs text-gray-600">respostas recebidas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Online</span>
                </div>
                <p className="text-xs text-gray-600">sistema operacional</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Logs do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {systemLogs?.map((log: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {log.level === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                      {log.level === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                      {log.level === 'info' && <CheckCircle className="w-4 h-4 text-blue-500" />}
                      <span className="text-xs text-gray-500">{log.timestamp}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{log.message}</p>
                      {log.details && (
                        <p className="text-xs text-gray-600 mt-1">{log.details}</p>
                      )}
                    </div>
                  </div>
                )) || (
                  <p className="text-center text-gray-500 py-8">Nenhum log disponível</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}