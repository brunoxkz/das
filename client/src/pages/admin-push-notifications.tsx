import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Bell, 
  Send, 
  Users, 
  Activity, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  Clock,
  Globe,
  BarChart3,
  Zap,
  Settings
} from 'lucide-react';

interface NotificationStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalSent: number;
  successRate: number;
  lastSent: string | null;
}

interface Subscription {
  id: string;
  userId: string;
  endpoint: string;
  isActive: boolean;
  createdAt: string;
  userAgent: string;
  deviceType: string;
}

interface NotificationLog {
  id: string;
  userId: string;
  title: string;
  body: string;
  status: string;
  sentAt: string;
  deliveredAt: string | null;
}

export default function AdminPushNotifications() {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Formulário de notificação
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    body: '',
    url: '/app-pwa-vendzz',
    icon: '/logo-vendzz-white.png',
    badge: '/logo-vendzz-white.png',
    requireInteraction: true,
    silent: false
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Carregar estatísticas, subscriptions e logs em paralelo
      const [statsResponse, subscriptionsResponse, logsResponse] = await Promise.all([
        apiRequest('GET', '/api/push-notifications/admin/stats'),
        apiRequest('GET', '/api/push-notifications/admin/subscriptions'),
        apiRequest('GET', '/api/push-notifications/admin/logs')
      ]);

      setStats(statsResponse);
      
      // Garantir que subscriptions seja sempre um array
      const subscriptionsData = subscriptionsResponse?.subscriptions || subscriptionsResponse || [];
      setSubscriptions(Array.isArray(subscriptionsData) ? subscriptionsData : []);
      
      // Garantir que logs seja sempre um array
      const logsData = logsResponse?.logs || logsResponse || [];
      setLogs(Array.isArray(logsData) ? logsData : []);

      console.log('📊 Dashboard data loaded:', {
        stats: statsResponse,
        logs: Array.isArray(logsData) ? logsData.length : 0
      });

    } catch (error: any) {
      console.error('❌ Erro ao carregar dashboard:', error);
      toast({
        title: "❌ Erro ao Carregar",
        description: "Erro ao carregar dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendBroadcastNotification = async () => {
    if (!notificationForm.title || !notificationForm.body) {
      toast({
        title: "❌ Campos Obrigatórios",
        description: "Título e mensagem são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const response = await apiRequest('POST', '/api/push-notifications/admin/broadcast', {
        title: notificationForm.title,
        body: notificationForm.body,
        url: notificationForm.url,
        icon: notificationForm.icon,
        badge: notificationForm.badge,
        requireInteraction: notificationForm.requireInteraction,
        silent: notificationForm.silent
      });

      toast({
        title: "✅ Notificação Enviada!",
        description: `Enviada para ${response.sentTo} dispositivos`,
        variant: "default",
      });

      // Limpar formulário
      setNotificationForm({
        title: '',
        body: '',
        url: '/app-pwa-vendzz',
        icon: '/logo-vendzz-white.png',
        badge: '/logo-vendzz-white.png',
        requireInteraction: true,
        silent: false
      });

      // Recarregar dados
      setTimeout(() => {
        loadDashboardData();
      }, 1000);

    } catch (error: any) {
      console.error('❌ Erro ao enviar notificação:', error);
      toast({
        title: "❌ Erro no Envio",
        description: error.message || "Erro ao enviar notificação",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendTestNotification = () => {
    setNotificationForm({
      title: '🧪 Teste Admin - Vendzz PWA',
      body: 'Esta é uma notificação de teste enviada pelo admin. Sistema funcionando perfeitamente!',
      url: '/app-pwa-vendzz',
      icon: '/logo-vendzz-white.png',
      badge: '/logo-vendzz-white.png',
      requireInteraction: true,
      silent: false
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatEndpoint = (endpoint: string) => {
    if (!endpoint) return 'N/A';
    return endpoint.length > 50 ? endpoint.substring(0, 50) + '...' : endpoint;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">🔔 Admin Push Notifications</h1>
          <p className="text-blue-100">Painel administrativo para notificações push em tempo real</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats?.totalSubscriptions || 0}</div>
              <div className="text-sm text-gray-600">Total Devices</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <Smartphone className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats?.activeSubscriptions || 0}</div>
              <div className="text-sm text-gray-600">Ativos</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <Send className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats?.totalSent || 0}</div>
              <div className="text-sm text-gray-600">Enviadas</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats?.successRate || 0}%</div>
              <div className="text-sm text-gray-600">Taxa Sucesso</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-gray-900">
                {stats?.lastSent ? formatDate(stats.lastSent) : 'Nunca'}
              </div>
              <div className="text-sm text-gray-600">Último Envio</div>
            </CardContent>
          </Card>
        </div>

        {/* Enviar Notificação */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-6 w-6" />
              Enviar Notificação Global
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                  placeholder="Ex: 🔔 Nova funcionalidade disponível!"
                />
              </div>
              <div>
                <Label htmlFor="url">URL de Destino</Label>
                <Input
                  id="url"
                  value={notificationForm.url}
                  onChange={(e) => setNotificationForm({...notificationForm, url: e.target.value})}
                  placeholder="/app-pwa-vendzz"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="body">Mensagem *</Label>
              <Textarea
                id="body"
                value={notificationForm.body}
                onChange={(e) => setNotificationForm({...notificationForm, body: e.target.value})}
                placeholder="Descreva sua mensagem aqui..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icon">Ícone URL</Label>
                <Input
                  id="icon"
                  value={notificationForm.icon}
                  onChange={(e) => setNotificationForm({...notificationForm, icon: e.target.value})}
                  placeholder="/logo-vendzz-white.png"
                />
              </div>
              <div>
                <Label htmlFor="badge">Badge URL</Label>
                <Input
                  id="badge"
                  value={notificationForm.badge}
                  onChange={(e) => setNotificationForm({...notificationForm, badge: e.target.value})}
                  placeholder="/logo-vendzz-white.png"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={notificationForm.requireInteraction}
                  onChange={(e) => setNotificationForm({...notificationForm, requireInteraction: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm">Requer interação</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={notificationForm.silent}
                  onChange={(e) => setNotificationForm({...notificationForm, silent: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm">Silenciosa</span>
              </label>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={sendBroadcastNotification}
                disabled={isSending}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSending ? (
                  <>
                    <Zap className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar para Todos
                  </>
                )}
              </Button>

              <Button 
                onClick={sendTestNotification}
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <Zap className="mr-2 h-4 w-4" />
                Preencher Teste
              </Button>

              <Button 
                onClick={loadDashboardData}
                variant="outline"
                className="border-gray-500 text-gray-600 hover:bg-gray-50"
              >
                <Activity className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dispositivos Conectados */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center">
              <Smartphone className="mr-2 h-6 w-6" />
              Dispositivos Conectados ({Array.isArray(subscriptions) ? subscriptions.length : 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!Array.isArray(subscriptions) || subscriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Smartphone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum dispositivo conectado ainda</p>
                <p className="text-sm">Os usuários precisam acessar /app-pwa-vendzz e ativar notificações</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subscriptions.slice(0, 10).map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${sub.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="font-medium text-sm">User: {sub.userId}</p>
                        <p className="text-xs text-gray-600">{formatEndpoint(sub.endpoint)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={sub.deviceType === 'mobile' ? 'default' : 'secondary'}>
                        {sub.deviceType}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(sub.createdAt)}</p>
                    </div>
                  </div>
                ))}
                {Array.isArray(subscriptions) && subscriptions.length > 10 && (
                  <p className="text-center text-sm text-gray-500">
                    ... e mais {subscriptions.length - 10} dispositivos
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logs Recentes */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-6 w-6" />
              Logs Recentes ({Array.isArray(logs) ? logs.length : 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!Array.isArray(logs) || logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum log de notificação ainda</p>
                <p className="text-sm">Os logs aparecerão aqui quando notificações forem enviadas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.isArray(logs) && logs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {log.status === 'sent' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{log.title}</p>
                        <p className="text-xs text-gray-600">{log.body}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(log.sentAt)}</p>
                    </div>
                  </div>
                ))}
                {Array.isArray(logs) && logs.length > 10 && (
                  <p className="text-center text-sm text-gray-500">
                    ... e mais {logs.length - 10} logs
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-gray-600">
            <strong>Vendzz Admin</strong> - Sistema de Push Notifications
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Versão 2.0 - Monitoramento em tempo real
          </p>
        </div>
      </div>
    </div>
  );
}