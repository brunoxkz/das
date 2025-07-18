import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { 
  CreditCard, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Eye,
  Code,
  Link,
  Crown,
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link as RouterLink } from "wouter";

export default function AdminDashboardPlanos() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalPlanos: 0,
    assinaturasAtivas: 0,
    receitaMensal: 0,
    embedsGerados: 0,
    checkoutsHoje: 0,
    conversaoHoje: 0
  });

  // Buscar estatísticas dos planos
  const { data: planos } = useQuery({
    queryKey: ["/api/stripe/plans"],
  });

  // Buscar transações recentes
  const { data: transacoes } = useQuery({
    queryKey: ["/api/stripe/transactions"],
  });

  // Buscar assinaturas ativas
  const { data: assinaturas } = useQuery({
    queryKey: ["/api/stripe/subscriptions"],
  });

  useEffect(() => {
    if (planos && transacoes && assinaturas) {
      const planosArray = Array.isArray(planos) ? planos : [];
      const transacoesArray = Array.isArray(transacoes) ? transacoes : [];
      const assinaturasArray = Array.isArray(assinaturas) ? assinaturas : [];

      const hoje = new Date().toDateString();
      const checkoutsHoje = transacoesArray.filter((t: any) => 
        new Date(t.createdAt).toDateString() === hoje
      ).length;

      const receitaMensal = assinaturasArray.reduce((acc: number, sub: any) => {
        if (sub.status === 'active') {
          return acc + (sub.amount || 2990); // R$29,90 padrão
        }
        return acc;
      }, 0);

      setStats({
        totalPlanos: planosArray.length,
        assinaturasAtivas: assinaturasArray.filter((s: any) => s.status === 'active').length,
        receitaMensal: receitaMensal / 100, // Converter centavos para reais
        embedsGerados: planosArray.filter((p: any) => p.embedCode).length,
        checkoutsHoje,
        conversaoHoje: checkoutsHoje > 0 ? Math.round((checkoutsHoje / 100) * 100) : 0
      });
    }
  }, [planos, transacoes, assinaturas]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${type} copiado para a área de transferência`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Dashboard Administrativo - Planos & Assinaturas
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Visão geral completa do sistema de pagamentos e assinaturas
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total de Planos
              </CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.totalPlanos}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Planos criados
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Assinaturas Ativas
              </CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.assinaturasAtivas}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Clientes ativos
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Receita Mensal
              </CardTitle>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                R$ {stats.receitaMensal.toFixed(2)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receita recorrente
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Embeds Gerados
              </CardTitle>
              <Code className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.embedsGerados}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Códigos embed
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-cyan-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Checkouts Hoje
              </CardTitle>
              <Activity className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.checkoutsHoje}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pagamentos hoje
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Conversão
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.conversaoHoje}%
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Taxa hoje
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs com Detalhes */}
        <Tabs defaultValue="planos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="planos">Planos Criados</TabsTrigger>
            <TabsTrigger value="assinaturas">Assinaturas</TabsTrigger>
            <TabsTrigger value="embeds">Embeds</TabsTrigger>
            <TabsTrigger value="acoes">Ações Rápidas</TabsTrigger>
          </TabsList>

          <TabsContent value="planos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Planos Criados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(planos) && planos.length > 0 ? (
                    planos.map((plano: any) => (
                      <div key={plano.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                              {plano.name || 'Plano Básico'}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              R$ {((plano.amount || 2990) / 100).toFixed(2)}/mês
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={plano.status === 'active' ? 'default' : 'secondary'}>
                            {plano.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(plano.stripeProductId || '', 'ID do Produto')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      Nenhum plano criado ainda
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assinaturas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Assinaturas Ativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(assinaturas) && assinaturas.length > 0 ? (
                    assinaturas.slice(0, 10).map((assinatura: any) => (
                      <div key={assinatura.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                              {assinatura.customerEmail || 'Cliente'}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              R$ {((assinatura.amount || 2990) / 100).toFixed(2)}/mês
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={assinatura.status === 'active' ? 'default' : 'secondary'}>
                            {assinatura.status === 'active' ? 'Ativa' : 'Inativa'}
                          </Badge>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {assinatura.createdAt && new Date(assinatura.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      Nenhuma assinatura ativa
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="embeds" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Códigos Embed Gerados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(planos) && planos.length > 0 ? (
                    planos.filter((p: any) => p.embedCode).map((plano: any) => (
                      <div key={plano.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            {plano.name || 'Plano Básico'}
                          </h3>
                          <Badge variant="outline">
                            Embed Gerado
                          </Badge>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                          <code className="text-sm text-slate-700 dark:text-slate-300">
                            {plano.embedCode || 'Código não disponível'}
                          </code>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(plano.embedCode || '', 'Código Embed')}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copiar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/checkout/${plano.id}`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Testar
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      Nenhum embed gerado ainda
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="acoes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Gerenciar Planos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Criar, editar e gerenciar planos de assinatura
                  </p>
                  <RouterLink href="/stripe-plans-perfect">
                    <Button className="w-full">
                      Acessar Planos Perfeitos
                    </Button>
                  </RouterLink>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Checkout Oficial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Gerar códigos embed e links de pagamento
                  </p>
                  <RouterLink href="/checkout-oficial">
                    <Button className="w-full">
                      Acessar Checkout Oficial
                    </Button>
                  </RouterLink>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Assinaturas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Gerenciar assinaturas e clientes
                  </p>
                  <RouterLink href="/subscriptions-manager">
                    <Button className="w-full">
                      Gerenciar Assinaturas
                    </Button>
                  </RouterLink>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Códigos Embed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Gerar códigos HTML/React para integração
                  </p>
                  <RouterLink href="/checkout-embed-codes">
                    <Button className="w-full">
                      Gerar Códigos Embed
                    </Button>
                  </RouterLink>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Monitoramento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Monitorar transações e status do Stripe
                  </p>
                  <RouterLink href="/stripe-monitoring">
                    <Button className="w-full">
                      Ver Monitoramento
                    </Button>
                  </RouterLink>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Visualizar métricas e relatórios
                  </p>
                  <RouterLink href="/analytics">
                    <Button className="w-full">
                      Ver Analytics
                    </Button>
                  </RouterLink>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}