import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Smartphone, BarChart3, Users, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalLeads: number;
  totalCampaigns: number;
  leadsToday: number;
  conversionRate: string;
  smsToday: number;
}

interface ActiveCampaign {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'whatsapp';
  status: string;
  sent: number;
  deliveryRate: string;
  createdAt: string;
}

interface RecentLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'completed' | 'partial';
  createdAt: string;
}

export default function PWADashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    totalCampaigns: 0,
    leadsToday: 0,
    conversionRate: '0%',
    smsToday: 0
  });
  
  const [activeCampaigns, setActiveCampaigns] = useState<ActiveCampaign[]>([]);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Verificar status das notificações
  useEffect(() => {
    checkNotificationStatus();
  }, []);

  // Carregar dados do dashboard
  useEffect(() => {
    loadDashboardData();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkNotificationStatus = async () => {
    if ('Notification' in window) {
      const permission = await Notification.permission;
      setNotificationsEnabled(permission === 'granted');
    }
  };

  const loadDashboardData = async () => {
    try {
      // Buscar stats
      const statsResponse = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Buscar campanhas ativas
      const campaignsResponse = await fetch('/api/campaigns/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json();
        setActiveCampaigns(campaignsData);
      }

      // Buscar leads recentes
      const leadsResponse = await fetch('/api/leads/recent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (leadsResponse.ok) {
        const leadsData = await leadsResponse.json();
        setRecentLeads(leadsData);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotifications = async () => {
    try {
      if (!notificationsEnabled) {
        // Ativar notificações
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          // Obter chave VAPID
          const vapidResponse = await fetch('/api/push/vapid-key');
          const { publicKey } = await vapidResponse.json();

          // Registrar para push notifications
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicKey
          });

          // Enviar subscription para servidor
          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ subscription })
          });

          setNotificationsEnabled(true);
          toast({
            title: "Notificações ativadas!",
            description: "Você receberá alertas sobre novos leads e campanhas.",
          });
        } else {
          toast({
            title: "Permissão negada",
            description: "Não foi possível ativar as notificações.",
            variant: "destructive",
          });
        }
      } else {
        // Desativar notificações
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }

        setNotificationsEnabled(false);
        toast({
          title: "Notificações desativadas",
          description: "Você não receberá mais alertas push.",
        });
      }
    } catch (error) {
      console.error('Erro ao gerenciar notificações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar as configurações de notificação.",
        variant: "destructive",
      });
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast({
          title: "Notificação enviada!",
          description: "Você deve receber uma notificação de teste em breve.",
        });
      } else {
        throw new Error('Erro ao enviar notificação');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a notificação de teste.",
        variant: "destructive",
      });
    }
  };

  const getCampaignIcon = (type: string) => {
    switch (type) {
      case 'sms': return '📱';
      case 'email': return '📧';
      case 'whatsapp': return '💬';
      default: return '📊';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Smartphone className="w-16 h-16 mx-auto text-green-600 animate-pulse" />
          <h2 className="text-xl font-semibold">Carregando Dashboard...</h2>
          <p className="text-gray-600">Otimizado para dispositivos móveis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header PWA */}
      <div className="bg-green-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Vendzz Mobile</h1>
            <p className="text-green-100 text-sm">Dashboard PWA</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleNotifications}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-green-700"
            >
              {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </Button>
            {notificationsEnabled && (
              <Button
                onClick={sendTestNotification}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-green-700 text-xs"
              >
                Teste
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Leads</p>
                  <p className="text-xl font-bold">{stats.totalLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Campanhas</p>
                  <p className="text-xl font-bold">{stats.totalCampaigns}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Hoje</p>
                  <p className="text-xl font-bold">{stats.leadsToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-orange-600 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-600">Conversão</p>
                  <p className="text-xl font-bold">{stats.conversionRate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campanhas Ativas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Campanhas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeCampaigns.length > 0 ? (
              activeCampaigns.slice(0, 5).map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getCampaignIcon(campaign.type)}</span>
                    <div>
                      <p className="font-medium text-sm truncate max-w-[120px]">{campaign.name}</p>
                      <p className="text-xs text-gray-600">{campaign.sent} enviados</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`text-xs ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </Badge>
                    <p className="text-xs text-gray-600 mt-1">{campaign.deliveryRate}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">Nenhuma campanha ativa</p>
            )}
          </CardContent>
        </Card>

        {/* Leads Recentes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Leads Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLeads.length > 0 ? (
              recentLeads.slice(0, 10).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{lead.name}</p>
                    <p className="text-xs text-gray-600 truncate max-w-[200px]">{lead.source}</p>
                    <p className="text-xs text-gray-500">{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(lead.status)}`}>
                    {lead.status === 'completed' ? 'Completo' : 'Parcial'}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">Nenhum lead recente</p>
            )}
          </CardContent>
        </Card>

        {/* Footer PWA */}
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">Vendzz PWA • Versão Mobile</p>
          <p className="text-xs">Otimizado para dispositivos móveis</p>
        </div>
      </div>
    </div>
  );
}