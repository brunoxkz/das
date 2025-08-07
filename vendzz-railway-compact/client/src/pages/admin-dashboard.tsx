import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth-jwt";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Crown, 
  CreditCard,
  Search,
  Filter,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  Send,
  Edit,
  Shield,
  TrendingUp,
  BarChart3,
  Eye
} from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  whatsapp?: string;
  plan: string;
  role: string;
  planExpiresAt?: string;
  smsCredits: number;
  emailCredits: number;
  whatsappCredits: number;
  telegramCredits: number;
  smsDispatched?: number;
  emailDispatched?: number;
  whatsappDispatched?: number;
  telegramDispatched?: number;
  isBlocked?: boolean;
  blockReason?: string;
  createdAt: string;
}

interface Funnel {
  id: string;
  title: string;
  creatorName: string;
  createdAt: string;
  views: number;
  completions: number;
  conversionRate: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Check admin access
  if (user?.email !== "bruno@vendzz.com" && user?.email !== "admin@vendzz.com") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta área.
          </p>
        </div>
      </div>
    );
  }

  // Fetch users data
  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: user?.role === "admin"
  });

  // Fetch high-traffic funnels
  const { data: topFunnels = [], isLoading: funnelsLoading } = useQuery({
    queryKey: ['/api/admin/top-funnels'],
    enabled: user?.role === "admin"
  });

  // Filter and sort users
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === "all" || user.plan === filterPlan;
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesPlan && matchesRole;
  }).sort((a: User, b: User) => {
    switch (sortBy) {
      case "createdAt":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "email":
        return a.email.localeCompare(b.email);
      case "plan":
        return a.plan.localeCompare(b.plan);
      default:
        return 0;
    }
  });

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setIsEditModalOpen(false);
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case "free": return "secondary";
      case "basic": return "default";
      case "premium": return "destructive";
      case "enterprise": return "outline";
      default: return "secondary";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === "admin" ? "destructive" : "secondary";
  };

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Carregando dados administrativos...</p>
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500">Erro ao carregar dados: {usersError?.message || 'Erro desconhecido'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full overflow-x-hidden">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
        <p className="text-muted-foreground">
          Gerencie usuários, planos e analise o desempenho da plataforma
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários ({users.length})
          </TabsTrigger>
          <TabsTrigger value="funnels" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Funis em Alta ({Array.isArray(topFunnels) ? topFunnels.length : 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros e Pesquisa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar por email ou nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterPlan} onValueChange={setFilterPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os planos</SelectItem>
                    <SelectItem value="free">Gratuito</SelectItem>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por papel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os papéis</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Data de criação</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="plan">Plano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Usuários Cadastrados
                </span>
                <Badge variant="outline">
                  {filteredUsers.length} de {users.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user: User) => (
                  <Card key={user.id} className="p-4 bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full">
                          <Users className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}` 
                                : user.email}
                            </h3>
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {user.role === "admin" ? (
                                <><Crown className="h-3 w-3 mr-1" /> Admin</>
                              ) : "Usuário"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </span>
                            {user.whatsapp && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {user.whatsapp}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <Badge variant={getPlanBadgeVariant(user.plan)}>
                              <CreditCard className="h-3 w-3 mr-1" />
                              {user.plan}
                            </Badge>
                          </div>
                          {user.planExpiresAt && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Expira: {new Date(user.planExpiresAt).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-center">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3 text-green-600" />
                              <span className="font-semibold">{user.smsCredits}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-blue-600" />
                              <span className="font-semibold">{user.emailCredits}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Send className="h-3 w-3 text-purple-600" />
                              <span className="font-semibold">{user.whatsappCredits}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3 text-orange-600" />
                              <span className="font-semibold">{user.telegramCredits}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditModal(user)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum usuário encontrado com os filtros aplicados.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Funis em Alta
              </CardTitle>
              <CardDescription>
                Analise quais funis estão recebendo mais visitas em toda a plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {funnelsLoading ? (
                <div className="space-y-4">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : Array.isArray(topFunnels) && topFunnels.length > 0 ? (
                <div className="space-y-4">
                  {topFunnels.map((funnel: Funnel, index) => (
                    <div key={funnel.id} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-full text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{funnel.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Criado por: {funnel.creatorName} • {funnel.createdAt}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            Visitas
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            {funnel.views?.toLocaleString() || 0}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <BarChart3 className="h-4 w-4" />
                            Conversões
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            {funnel.completions?.toLocaleString() || 0}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Taxa</div>
                          <div className="text-xl font-bold text-purple-600">
                            {funnel.conversionRate ? `${funnel.conversionRate}%` : '0%'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Nenhum funil encontrado</p>
                  <p className="text-muted-foreground">
                    Ainda não há dados de funis com alto tráfego para exibir
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}