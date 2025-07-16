import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Eye,
  Clock,
  Ban,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AdminSecurity() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // Verificar se é admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-500/20 bg-red-950/50">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-400 mb-2">Acesso Negado</h2>
              <p className="text-red-300">Apenas administradores podem acessar esta página.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Buscar estatísticas de segurança
  const { data: securityStats, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/security/stats", refreshKey],
    retry: false,
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
            <span className="ml-2 text-blue-300">Carregando estatísticas de segurança...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-500/20 bg-red-950/50">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-400 mb-2">Erro ao Carregar</h2>
              <p className="text-red-300 mb-4">Não foi possível carregar as estatísticas de segurança.</p>
              <Button onClick={handleRefresh} variant="outline" className="border-red-500 text-red-400 hover:bg-red-950">
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              🔒 Monitoramento de Segurança
            </h1>
            <p className="text-slate-400 mt-2">Dashboard de segurança e proteção anti-invasão</p>
          </div>
          <Button 
            onClick={handleRefresh}
            variant="outline" 
            className="border-green-500 text-green-400 hover:bg-green-950"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-green-500/20 bg-green-950/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sistema Ativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-300">
                {securityStats?.systemStatus === 'active' ? 'ONLINE' : 'OFFLINE'}
              </div>
              <p className="text-green-400/70 text-sm mt-1">Proteção ativa</p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-blue-950/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Tentativas Bloqueadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-300">
                {securityStats?.totalBlocked || 0}
              </div>
              <p className="text-blue-400/70 text-sm mt-1">Últimas 24h</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/20 bg-yellow-950/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                IPs Monitorados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-300">
                {securityStats?.monitoredIPs || 0}
              </div>
              <p className="text-yellow-400/70 text-sm mt-1">Em observação</p>
            </CardContent>
          </Card>

          <Card className="border-red-500/20 bg-red-950/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-400 flex items-center gap-2">
                <Ban className="h-5 w-5" />
                IPs Banidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-300">
                {securityStats?.bannedIPs || 0}
              </div>
              <p className="text-red-400/70 text-sm mt-1">Bloqueios ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Security Events */}
        <Card className="border-slate-700/50 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Eventos de Segurança Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {securityStats?.recentEvents && securityStats.recentEvents.length > 0 ? (
              <div className="space-y-3">
                {securityStats.recentEvents.slice(0, 10).map((event: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={
                          event.severity === 'critical' ? 'destructive' : 
                          event.severity === 'high' ? 'secondary' : 
                          'outline'
                        }
                        className={
                          event.severity === 'critical' ? 'bg-red-950 text-red-300' :
                          event.severity === 'high' ? 'bg-yellow-950 text-yellow-300' :
                          'bg-blue-950 text-blue-300'
                        }
                      >
                        {event.severity.toUpperCase()}
                      </Badge>
                      <div>
                        <p className="text-slate-300 font-medium">{event.type}</p>
                        <p className="text-slate-400 text-sm">IP: {event.ip}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-sm flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(event.timestamp).toLocaleString('pt-BR')}
                      </p>
                      {event.details && (
                        <p className="text-slate-500 text-xs mt-1">{event.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-400">Nenhum evento de segurança recente</p>
                <p className="text-slate-500 text-sm">Sistema funcionando normalmente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Configuration */}
        <Card className="border-slate-700/50 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-slate-200">Configurações de Segurança Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-slate-300">Proteção Anti-DDoS</h4>
                <Badge className="bg-green-950 text-green-300">ATIVO</Badge>
                <p className="text-slate-400 text-sm">Rate limiting em todos os endpoints</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-slate-300">Detecção de Invasão</h4>
                <Badge className="bg-green-950 text-green-300">ATIVO</Badge>
                <p className="text-slate-400 text-sm">Monitoramento de atividades suspeitas</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-slate-300">Helmet Security</h4>
                <Badge className="bg-green-950 text-green-300">ATIVO</Badge>
                <p className="text-slate-400 text-sm">Headers de segurança configurados</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-slate-300">Monitoramento JWT</h4>
                <Badge className="bg-green-950 text-green-300">ATIVO</Badge>
                <p className="text-slate-400 text-sm">Autenticação verificada</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}