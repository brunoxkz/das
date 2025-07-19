import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth-jwt";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Zap,
  Video,
  Send
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
  aiCredits: number;
  videoCredits: number;
  telegramCredits: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterRole, setFilterRole] = useState("all");

  // Fetch all users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: user?.role === "admin"
  });

  if (user?.role !== "admin") {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Acesso negado. Apenas administradores podem acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === "all" || u.plan === filterPlan;
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesPlan && matchesRole;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "free": return "bg-gray-100 text-gray-800";
      case "basic": return "bg-blue-100 text-blue-800";
      case "premium": return "bg-purple-100 text-purple-800";
      case "enterprise": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "user": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Administração</h1>
        <p className="text-muted-foreground">Gerencie usuários, planos e créditos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planos Pagos</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.plan !== "free").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === "admin").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Créditos</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div>SMS: {users.reduce((sum, u) => sum + (u.smsCredits || 0), 0)}</div>
              <div>Email: {users.reduce((sum, u) => sum + (u.emailCredits || 0), 0)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
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
                <SelectValue placeholder="Filtrar por role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os roles</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setFilterPlan("all");
              setFilterRole("all");
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List - Mobile Optimized */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredUsers.map((u) => (
              <Card key={u.id} className="p-3">
                <div className="space-y-3">
                  {/* User Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{u.firstName} {u.lastName}</h3>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      {u.whatsapp && (
                        <p className="text-xs text-muted-foreground">{u.whatsapp}</p>
                      )}
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`text-xs ${getPlanBadgeColor(u.plan)}`}>
                      {u.plan.charAt(0).toUpperCase() + u.plan.slice(1)}
                    </Badge>
                    <Badge className={`text-xs ${getRoleBadgeColor(u.role)}`}>
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </Badge>
                    {u.planExpiresAt && (
                      <Badge variant="outline" className="text-xs">
                        Expira: {formatDate(u.planExpiresAt)}
                      </Badge>
                    )}
                  </div>

                  {/* Credits - Single Row */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1 text-green-600">
                      <MessageSquare className="h-3 w-3" />
                      <span className="font-medium">{u.smsCredits || 0}</span>
                      <span className="text-muted-foreground">SMS</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-blue-600">
                      <Mail className="h-3 w-3" />
                      <span className="font-medium">{u.emailCredits || 0}</span>
                      <span className="text-muted-foreground">Email</span>
                    </div>

                    <div className="flex items-center gap-1 text-green-500">
                      <Phone className="h-3 w-3" />
                      <span className="font-medium">{u.whatsappCredits || 0}</span>
                      <span className="text-muted-foreground">WhatsApp</span>
                    </div>

                    <div className="flex items-center gap-1 text-blue-500">
                      <Send className="h-3 w-3" />
                      <span className="font-medium">{u.telegramCredits || 0}</span>
                      <span className="text-muted-foreground">Telegram</span>
                    </div>
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
    </div>
  );
}