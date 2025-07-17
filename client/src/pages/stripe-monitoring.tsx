import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, CheckCircle, XCircle, Clock, CreditCard, Users, TrendingUp, AlertTriangle } from 'lucide-react';

export default function StripeMonitoring() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Buscar dados de monitoramento
  const { data: monitoringData, isLoading, refetch } = useQuery({
    queryKey: ['/api/stripe/monitoring'],
    refetchInterval: autoRefresh ? 5000 : false, // Atualiza a cada 5 segundos
    staleTime: 0
  });

  // Buscar transações recentes
  const { data: recentTransactions } = useQuery({
    queryKey: ['/api/stripe/transactions/recent'],
    refetchInterval: autoRefresh ? 10000 : false
  });

  // Buscar alertas
  const { data: alerts } = useQuery({
    queryKey: ['/api/stripe/alerts'],
    refetchInterval: autoRefresh ? 15000 : false
  });

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'canceled': return 'bg-gray-100 text-gray-800';
      case 'trialing': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'past_due': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'canceled': return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'trialing': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'past_due': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monitoramento Stripe</h1>
          <p className="text-gray-600 mt-2">Acompanhe pagamentos e assinaturas em tempo real</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={toggleAutoRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Atualizando...' : 'Atualizar'}
          </Button>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Recarregar
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {alerts && alerts.length > 0 && (
        <div className="mb-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <CardTitle className="text-red-800">Alertas ({alerts.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.map((alert: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-700">{alert.message}</span>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {alert.severity || 'Alto'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Métricas Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações Hoje</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitoringData?.todayTransactions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {monitoringData?.transactionsGrowth >= 0 ? '+' : ''}{monitoringData?.transactionsGrowth || 0}% desde ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {monitoringData?.todayRevenue || '0,00'}</div>
            <p className="text-xs text-muted-foreground">
              {monitoringData?.revenueGrowth >= 0 ? '+' : ''}{monitoringData?.revenueGrowth || 0}% desde ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitoringData?.activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {monitoringData?.subscriptionsGrowth >= 0 ? '+' : ''}{monitoringData?.subscriptionsGrowth || 0}% desde ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitoringData?.conversionRate || '0'}%</div>
            <p className="text-xs text-muted-foreground">
              {monitoringData?.conversionGrowth >= 0 ? '+' : ''}{monitoringData?.conversionGrowth || 0}% desde ontem
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Conteúdo */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>Últimas transações processadas pelo Stripe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions?.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(transaction.status)}
                      <div>
                        <div className="font-medium">{transaction.customerName || 'Cliente'}</div>
                        <div className="text-sm text-gray-500">{transaction.customerEmail}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(transaction.createdAt).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">R$ {transaction.amount}</div>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-gray-500 py-8">
                    Nenhuma transação encontrada
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assinaturas</CardTitle>
              <CardDescription>Gerenciamento de assinaturas ativas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monitoringData?.subscriptions?.map((subscription: any) => (
                  <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(subscription.status)}
                      <div>
                        <div className="font-medium">{subscription.customerName}</div>
                        <div className="text-sm text-gray-500">{subscription.planName}</div>
                        <div className="text-xs text-gray-400">
                          Próxima cobrança: {new Date(subscription.nextBillingDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">R$ {subscription.monthlyPrice}/mês</div>
                      <Badge className={getStatusColor(subscription.status)}>
                        {subscription.status}
                      </Badge>
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-gray-500 py-8">
                    Nenhuma assinatura encontrada
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks Recentes</CardTitle>
              <CardDescription>Logs de webhooks recebidos do Stripe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monitoringData?.webhookLogs?.map((webhook: any) => (
                  <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(webhook.status)}
                      <div>
                        <div className="font-medium">{webhook.eventType}</div>
                        <div className="text-sm text-gray-500">ID: {webhook.eventId}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(webhook.createdAt).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(webhook.status)}>
                        {webhook.status}
                      </Badge>
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-gray-500 py-8">
                    Nenhum webhook encontrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}