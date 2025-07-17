import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Copy,
  Settings,
  BarChart3,
  Users,
  DollarSign,
  ShoppingCart,
  Package,
  Globe,
  Palette,
  Code,
  Zap,
  CreditCard,
  FileText,
  Target,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Percent,
  Calendar,
  Repeat,
  Gift,
  TestTube,
  Layers,
  Save,
  Loader2,
  ArrowRight,
  CheckCircle2,
  PlayCircle,
  Activity,
  Smartphone,
  Mail,
  MessageSquare
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth-jwt";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function CheckoutSystem() {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Buscar estatísticas do sistema
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/checkout/analytics"],
    enabled: isAuthenticated,
  });

  // Buscar planos para contadores
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["/api/stripe/plans"],
    enabled: isAuthenticated,
  });

  // Buscar configurações do sistema
  const { data: systemConfig, isLoading: configLoading } = useQuery({
    queryKey: ["/api/checkout/config"],
    enabled: isAuthenticated,
  });

  const formatPrice = (price: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você precisa fazer login para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sistema de Checkout</h1>
        <p className="text-gray-600">Visão geral do sistema de pagamentos e assinaturas</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Planos Ativos
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Transações
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Checkouts Totais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    stats?.totalCheckouts || 0
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  +{stats?.monthlyGrowth?.checkouts || 0}% este mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Conversões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    stats?.totalConversions || 0
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  +{stats?.monthlyGrowth?.conversions || 0}% este mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Taxa de Conversão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    `${Math.round((stats?.conversionRate || 0) * 100)}%`
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Taxa atual de conversão
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Receita Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    formatPrice(stats?.totalRevenue || 0)
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  +{stats?.monthlyGrowth?.revenue || 0}% este mês
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Planos Mais Populares
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats?.topPlans?.map((plan: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium">{plan.name}</h3>
                          <p className="text-sm text-gray-600">{plan.conversions} conversões</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(plan.revenue)}</p>
                          <p className="text-sm text-gray-500">receita</p>
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-center py-4">Nenhum dado disponível</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Status do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Stripe Gateway</span>
                    <Badge variant={systemConfig?.stripe?.enabled ? "default" : "secondary"}>
                      {systemConfig?.stripe?.enabled ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pagar.me Gateway</span>
                    <Badge variant={systemConfig?.pagarme?.enabled ? "default" : "secondary"}>
                      {systemConfig?.pagarme?.enabled ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Webhooks</span>
                    <Badge variant={systemConfig?.stripe?.webhook_configured ? "default" : "destructive"}>
                      {systemConfig?.stripe?.webhook_configured ? "Configurado" : "Não configurado"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Planos Ativos</span>
                    <Badge variant="outline">
                      {plans.filter((p: any) => p.active).length} planos
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Teste Rápido do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Teste o sistema de checkout completo com trial implementado. Use os dados de teste do Stripe para simular transações.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Dados de Teste Stripe:</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Cartão:</strong> 4242 4242 4242 4242</p>
                    <p><strong>Validade:</strong> 12/25</p>
                    <p><strong>CVC:</strong> 123</p>
                    <p><strong>Nome:</strong> Qualquer nome</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Link href="/checkout-stripe-trial">
                    <Button className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4" />
                      Testar Checkout Trial
                    </Button>
                  </Link>
                  <Link href="/checkout-unified">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Checkout Unificado
                    </Button>
                  </Link>
                  <Link href="/checkout-admin">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Administração
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Planos Ativos no Sistema
                </CardTitle>
                <Link href="/checkout-admin">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Gerenciar Planos
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {plansLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plans.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhum plano ativo encontrado</p>
                      <Link href="/checkout-admin">
                        <Button className="mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Primeiro Plano
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    plans.map((plan: any) => (
                      <Card key={plan.id} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{plan.name}</CardTitle>
                              <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                            </div>
                            <Badge variant={plan.active ? "default" : "secondary"}>
                              {plan.active ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Preço:</span>
                              <span className="font-medium">{formatPrice(plan.price)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Recorrência:</span>
                              <span className="font-medium">{plan.interval}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Trial:</span>
                              <span className="font-medium">{plan.trial_days} dias</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Preço Trial:</span>
                              <span className="font-medium">{formatPrice(plan.trial_price)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Transações Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Sistema de transações em desenvolvimento</p>
                <p className="text-sm text-gray-400 mt-2">
                  Esta funcionalidade será implementada em breve
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Configurações Stripe</h3>
                    <div className="space-y-3">
                      <div>
                        <Label>Chave Pública</Label>
                        <Input 
                          value={systemConfig?.stripe?.public_key || ''} 
                          className="font-mono text-sm"
                          readOnly
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={systemConfig?.stripe?.enabled} 
                          disabled
                        />
                        <Label>Gateway Ativo</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Configurações Padrão</h3>
                    <div className="space-y-3">
                      <div>
                        <Label>Dias de Trial Padrão</Label>
                        <Input 
                          value={systemConfig?.default_settings?.trial_days || 7} 
                          className="w-24"
                          readOnly
                        />
                      </div>
                      <div>
                        <Label>Preço Trial Padrão</Label>
                        <Input 
                          value={formatPrice(systemConfig?.default_settings?.trial_price || 1.00)} 
                          className="w-32"
                          readOnly
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={systemConfig?.default_settings?.auto_cancel_trial} 
                          disabled
                        />
                        <Label>Cancelamento Automático</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Acesso Rápido</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/checkout-admin">
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Administração Completa
                      </Button>
                    </Link>
                    <Link href="/checkout-stripe-trial">
                      <Button variant="outline" className="w-full justify-start">
                        <TestTube className="h-4 w-4 mr-2" />
                        Testar Checkout
                      </Button>
                    </Link>
                    <Link href="/checkout-unified">
                      <Button variant="outline" className="w-full justify-start">
                        <Globe className="h-4 w-4 mr-2" />
                        Checkout Unificado
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}