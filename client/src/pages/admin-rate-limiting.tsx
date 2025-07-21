/**
 * PAINEL ADMINISTRATIVO RATE LIMITING EM TEMPO REAL
 * 
 * Dashboard completo para monitoramento do rate limiting:
 * - Estatísticas em tempo real
 * - IPs bloqueados e suspeitos  
 * - Análise de tendências
 * - Alertas e recomendações
 * - Configurações de limites
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  Shield, 
  Users, 
  TrendingUp, 
  Clock, 
  Ban,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw,
  Info,
  BarChart3
} from 'lucide-react';

export default function AdminRateLimiting() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedIP, setSelectedIP] = useState<string | null>(null);

  // Queries para dados do dashboard
  const { data: dashboardData, refetch: refetchDashboard } = useQuery({
    queryKey: ['/api/admin/rate-limiting/dashboard'],
    refetchInterval: autoRefresh ? 30000 : false, // Refresh a cada 30s se ativo
    staleTime: 10000 // Dados ficam fresh por 10s
  });

  const { data: trendsData } = useQuery({
    queryKey: ['/api/admin/rate-limiting/trends'],
    refetchInterval: autoRefresh ? 60000 : false // Refresh a cada 1min
  });

  const { data: blockedIPsData } = useQuery({
    queryKey: ['/api/admin/rate-limiting/blocked-ips'],
    refetchInterval: autoRefresh ? 45000 : false
  });

  const { data: configData } = useQuery({
    queryKey: ['/api/admin/rate-limiting/limits-config']
  });

  const dashboard = dashboardData?.data;
  const trends = trendsData?.data;
  const blockedIPs = blockedIPsData?.data;
  const config = configData?.data;

  // Função para determinar cor baseada no status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'secondary';
      default: return 'secondary';
    }
  };

  // Função para determinar cor do alerta
  const getAlertVariant = (severity: string) => {
    return severity === 'CRITICAL' ? 'destructive' : 'default';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Rate Limiting Monitor
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitoramento em tempo real do sistema de rate limiting
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchDashboard()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requisições</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboard.overview.totalRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboard.overview.categoriesCount} categorias ativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Bloqueio</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {dashboard.overview.blockRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboard.overview.blockedRequests} bloqueadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">IPs Suspeitos</CardTitle>
                <Ban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {dashboard.topIssues.blockedIPs.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  IPs com múltiplos bloqueios
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Último Bloqueio</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold">
                  {dashboard.overview.lastBlockedAt 
                    ? new Date(dashboard.overview.lastBlockedAt).toLocaleString()
                    : 'Nenhum bloqueio'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Horário do último bloqueio
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alertas */}
        {dashboard?.alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertas Ativos
            </h2>
            <div className="grid gap-4">
              {dashboard.alerts.slice(0, 3).map((alert: any, index: number) => (
                <Alert key={index} variant={getAlertVariant(alert.severity)}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="flex items-center gap-2">
                    {alert.type.replace('_', ' ')}
                    <Badge variant={alert.severity === 'CRITICAL' ? 'destructive' : 'warning'}>
                      {alert.severity}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription>
                    {alert.message}
                    {alert.recommendation && (
                      <div className="mt-2 text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        <strong>Recomendação:</strong> {alert.recommendation}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Tabs principais */}
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="blocked-ips">IPs Bloqueados</TabsTrigger>
            <TabsTrigger value="trends">Análise</TabsTrigger>
            <TabsTrigger value="config">Configurações</TabsTrigger>
          </TabsList>

          {/* Tab: Categorias */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Consumo por Categoria
                </CardTitle>
                <CardDescription>
                  Taxa de bloqueio e utilização por tipo de requisição
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboard?.categories.map((category: any) => (
                  <div key={category.name} className="mb-6 p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{category.name}</h3>
                        <Badge variant={getStatusColor(category.status)}>
                          {category.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {category.requests} requisições
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Taxa de bloqueio</span>
                        <span className="font-medium text-red-600">
                          {category.blockRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={category.blockRate} 
                        className="h-2"
                        max={100}
                      />
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{category.blocked} bloqueadas</span>
                        <span>{category.requests - category.blocked} permitidas</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: IPs Bloqueados */}
          <TabsContent value="blocked-ips" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5" />
                  IPs com Múltiplos Bloqueios
                </CardTitle>
                <CardDescription>
                  {blockedIPs?.totalUniqueBlockedIPs} IPs únicos bloqueados nas últimas 24h
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard?.topIssues.blockedIPs.map((ip: any, index: number) => (
                    <div key={ip.ip} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full">
                          <Ban className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <div className="font-mono text-sm font-semibold">{ip.ip}</div>
                          <div className="text-xs text-gray-500">
                            Último bloqueio: {new Date(ip.lastBlocked).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-red-600">
                            {ip.count} bloqueios
                          </div>
                          <div className="text-xs text-gray-500">
                            {ip.count > 500 ? 'Alto risco' : ip.count > 100 ? 'Médio risco' : 'Baixo risco'}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedIP(ip.ip)}
                        >
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Paths mais bloqueados */}
            <Card>
              <CardHeader>
                <CardTitle>Endpoints Mais Bloqueados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboard?.topIssues.blockedPaths.map((path: any, index: number) => (
                    <div key={path.path} className="flex items-center justify-between p-2 border-b">
                      <div>
                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {path.path}
                        </code>
                        <div className="text-xs text-gray-500 mt-1">
                          Categoria: {path.category}
                        </div>
                      </div>
                      <Badge variant="destructive">
                        {path.count} bloqueios
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Análise */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Análise de Tendências
                </CardTitle>
                <CardDescription>
                  Categorias que precisam de ajuste nos limites
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trends?.trends.map((trend: any) => (
                  <div key={trend.category} className="mb-6 p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{trend.category}</h3>
                      {trend.needsIncrease && (
                        <Badge variant="warning">Necessita Aumento</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-gray-600">Taxa de Utilização</div>
                        <div className="font-semibold text-lg">
                          {trend.utilizationRate.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Limite Atual</div>
                        <div className="font-semibold">{trend.currentLimit}/min</div>
                      </div>
                    </div>
                    
                    <Progress 
                      value={trend.utilizationRate} 
                      className="h-3 mb-2"
                      max={100}
                    />
                    
                    {trend.needsIncrease && (
                      <div className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        Recomendação: Aumentar limite para {trend.recommendedLimit}/min
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Configurações */}
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações Atuais
                </CardTitle>
                <CardDescription>
                  Limites configurados por categoria de requisição
                </CardDescription>
              </CardHeader>
              <CardContent>
                {config?.currentLimits && (
                  <div className="space-y-4">
                    {Object.entries(config.currentLimits).map(([category, settings]: [string, any]) => (
                      <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-semibold">{category}</div>
                          <div className="text-sm text-gray-600">{settings.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{settings.limit.toLocaleString()}/min</div>
                          <div className="text-sm text-gray-500">{settings.multiplier}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {config?.notes && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Notas sobre o Sistema
                    </h4>
                    <ul className="text-sm space-y-1">
                      {config.notes.map((note: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Status Footer */}
        <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg border text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Sistema de Rate Limiting Ativo
            {autoRefresh && (
              <>
                • <RefreshCw className="h-4 w-4 animate-spin" />
                Atualizando a cada 30s
              </>
            )}
            • Última atualização: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}