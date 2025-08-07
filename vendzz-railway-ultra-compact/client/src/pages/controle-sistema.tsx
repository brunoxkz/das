import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Building2, DollarSign, Package, Users, TrendingUp, Calendar } from "lucide-react";

interface ControleUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface DashboardStats {
  totalSales: number;
  totalCommission: number;
  monthlyOrders: number;
  pendingOrders: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  product: string;
  value: number;
  status: string;
  created_at: string;
  attendant_name?: string;
}

const ControleSystem = () => {
  const [user, setUser] = useState<ControleUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Login do sistema controle
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/controle-sistema/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('controle-token', data.token);
        toast({
          title: "Login realizado",
          description: `Bem-vindo, ${data.user.name}!`
        });
        loadDashboard();
      } else {
        const error = await response.json();
        toast({
          title: "Erro no login",
          description: error.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  // Carregar dashboard
  const loadDashboard = async () => {
    const savedToken = token || localStorage.getItem('controle-token');
    if (!savedToken) return;

    try {
      const [statsResponse, ordersResponse] = await Promise.all([
        fetch('/controle-sistema/api/dashboard', {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        }),
        fetch('/controle-sistema/api/orders', {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    }
  };

  // Verificar token salvo no localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('controle-token');
    if (savedToken) {
      setToken(savedToken);
      // Verificar se o token é válido fazendo uma requisição
      fetch('/controle-sistema/api/dashboard', {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      })
      .then(response => {
        if (response.ok) {
          loadDashboard();
        } else {
          localStorage.removeItem('controle-token');
          setToken(null);
        }
      });
    }
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('controle-token');
    setToken(null);
    setUser(null);
    setStats(null);
    setOrders([]);
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-500';
      case 'logzz': return 'bg-blue-500';
      case 'after_pay': return 'bg-yellow-500';
      case 'cancelado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Se não está logado, mostrar tela de login
  if (!token || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Building2 className="h-12 w-12 mx-auto text-blue-600 mb-4" />
            <CardTitle>Sistema Controle</CardTitle>
            <CardDescription>
              Acesse o painel de gestão de vendas e atendentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@controle.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="admin123"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>Credenciais padrão:</p>
              <p><strong>Admin:</strong> admin@controle.com / admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard principal
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sistema Controle</h1>
            <p className="text-gray-600">
              Bem-vindo, {user.name} ({user.role === 'admin' ? 'Administrador' : 'Atendente'})
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Sair
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Vendas Totais</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {stats.totalSales.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Comissões</p>
                    <p className="text-2xl font-bold text-blue-600">
                      R$ {stats.totalCommission.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pedidos (30 dias)</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.monthlyOrders}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.pendingOrders}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pedidos */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
            <CardDescription>
              {user.role === 'admin' ? 'Todos os pedidos do sistema' : 'Seus pedidos'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhum pedido encontrado
              </p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{order.customer_name}</h3>
                        <p className="text-sm text-gray-600">{order.customer_phone}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
                    <Separator className="my-2" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Produto</p>
                        <p className="font-medium">{order.product}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Valor</p>
                        <p className="font-medium">R$ {order.value.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Data</p>
                        <p className="font-medium">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {order.attendant_name && (
                        <div>
                          <p className="text-gray-600">Atendente</p>
                          <p className="font-medium">{order.attendant_name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ControleSystem;