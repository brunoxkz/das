import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Bell, 
  Settings, 
  User, 
  BarChart3, 
  MessageSquare, 
  Zap,
  BellRing,
  CheckCircle,
  Smartphone,
  Globe,
  Clock,
  TrendingUp,
  Heart,
  Coffee,
  Target
} from 'lucide-react';

interface UserStats {
  totalQuizzes: number;
  totalResponses: number;
  conversionRate: number;
  lastActivity: string;
}

export default function AppPWAVendzz() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [lastNotification, setLastNotification] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializePWA();
    loadUserStats();
  }, []);

  const initializePWA = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        // Registrar Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        setRegistration(registration);
        console.log('✅ Service Worker registrado:', registration);

        // Verificar se já existe subscription
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          setSubscription(existingSubscription);
          setIsRegistered(true);
          console.log('✅ Subscription existente encontrada');
        }

        // Escutar mensagens do Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('📨 Mensagem do SW:', event.data);
          
          if (event.data.type === 'NOTIFICATION_RECEIVED') {
            setLastNotification(event.data.payload.title);
            toast({
              title: "📱 Notificação Recebida",
              description: event.data.payload.body,
              variant: "default",
            });
          }
        });

      } catch (error) {
        console.error('❌ Erro ao registrar Service Worker:', error);
      }
    } else {
      console.warn('⚠️ Push notifications não suportadas neste navegador');
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await apiRequest('GET', '/api/pwa/user-stats');
      setStats(response);
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    }
  };

  const subscribeToPushNotifications = async () => {
    if (!registration) {
      toast({
        title: "❌ Service Worker não disponível",
        description: "Tente recarregar a página",
        variant: "destructive",
      });
      return;
    }

    try {
      // Solicitar permissão
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast({
          title: "❌ Permissão Negada",
          description: "Permita notificações para receber alertas",
          variant: "destructive",
        });
        return;
      }

      // Criar subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BEl62iUYgUivxIkv69yViEuiBIa40HI80QR5dhQUE6jHEfLrKQxkGV_aRa8LDRL0-e2cWHFm0a9wZgtpfI5YZQc'
      });

      setSubscription(subscription);
      setIsRegistered(true);

      // Enviar subscription para o servidor
      await apiRequest('POST', '/api/push-notifications/subscribe', {
        subscription: subscription.toJSON(),
        userAgent: navigator.userAgent,
        deviceType: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
      });

      toast({
        title: "✅ Notificações Ativadas!",
        description: "Você receberá alertas importantes",
        variant: "default",
      });

      console.log('✅ Push notifications ativadas:', subscription);

    } catch (error) {
      console.error('❌ Erro ao ativar notificações:', error);
      toast({
        title: "❌ Erro ao Ativar",
        description: "Erro ao ativar notificações push",
        variant: "destructive",
      });
    }
  };

  const unsubscribeFromNotifications = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      
      // Remover do servidor
      await apiRequest('POST', '/api/push-notifications/unsubscribe', {
        endpoint: subscription.endpoint
      });

      setSubscription(null);
      setIsRegistered(false);

      toast({
        title: "✅ Notificações Desativadas",
        description: "Você não receberá mais alertas",
        variant: "default",
      });

    } catch (error) {
      console.error('❌ Erro ao desativar:', error);
    }
  };

  const sendTestNotification = async () => {
    try {
      await apiRequest('POST', '/api/push-notifications/test', {
        title: '🧪 Teste PWA Vendzz',
        body: 'Esta é uma notificação de teste do seu PWA Vendzz!',
        url: '/app-pwa-vendzz'
      });

      toast({
        title: "✅ Teste Enviado",
        description: "Verifique se a notificação apareceu",
        variant: "default",
      });

    } catch (error) {
      console.error('❌ Erro no teste:', error);
      toast({
        title: "❌ Erro no Teste",
        description: "Erro ao enviar notificação de teste",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">📱 Vendzz PWA</h1>
          <p className="text-green-100">Aplicativo Web Progressivo com Notificações Push</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Status de Notificações */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-6 w-6" />
              Status das Notificações Push
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {isRegistered ? (
                  <>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Notificações Ativadas</p>
                      <p className="text-sm text-green-600">Você receberá alertas importantes</p>
                    </div>
                  </>
                ) : (
                  <>
                    <BellRing className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="font-medium text-orange-800">Notificações Desativadas</p>
                      <p className="text-sm text-orange-600">Ative para receber alertas</p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex gap-2">
                {!isRegistered ? (
                  <Button 
                    onClick={subscribeToPushNotifications}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Ativar Notificações
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={sendTestNotification}
                      variant="outline"
                      className="border-blue-500 text-blue-600"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Teste
                    </Button>
                    <Button 
                      onClick={unsubscribeFromNotifications}
                      variant="outline"
                      className="border-red-500 text-red-600"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Desativar
                    </Button>
                  </>
                )}
              </div>
            </div>

            {lastNotification && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Última notificação:</strong> {lastNotification}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas do Usuário */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats?.totalQuizzes || 0}</div>
              <div className="text-sm text-gray-600">Quizzes Criados</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <User className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats?.totalResponses || 0}</div>
              <div className="text-sm text-gray-600">Respostas</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats?.conversionRate || 0}%</div>
              <div className="text-sm text-gray-600">Conversão</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-gray-900">
                {stats?.lastActivity ? formatDate(stats.lastActivity) : 'Nunca'}
              </div>
              <div className="text-sm text-gray-600">Última Atividade</div>
            </CardContent>
          </Card>
        </div>

        {/* Recursos PWA */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center">
              <Smartphone className="mr-2 h-6 w-6" />
              Recursos PWA Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium">Instalação no Desktop</p>
                  <p className="text-sm text-gray-600">Instale como app nativo</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium">Funciona Offline</p>
                  <p className="text-sm text-gray-600">Acesso sem internet</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium">Notificações Push</p>
                  <p className="text-sm text-gray-600">Alertas em tempo real</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium">Atualizações Automáticas</p>
                  <p className="text-sm text-gray-600">Sempre atualizado</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links Rápidos */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-6 w-6" />
              Acesso Rápido
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="bg-blue-600 hover:bg-blue-700 h-auto flex flex-col items-center p-4"
              >
                <BarChart3 className="h-6 w-6 mb-2" />
                <span className="text-sm">Dashboard</span>
              </Button>

              <Button 
                onClick={() => window.location.href = '/quiz-builder'}
                className="bg-green-600 hover:bg-green-700 h-auto flex flex-col items-center p-4"
              >
                <MessageSquare className="h-6 w-6 mb-2" />
                <span className="text-sm">Quiz Builder</span>
              </Button>

              <Button 
                onClick={() => window.location.href = '/analytics'}
                className="bg-purple-600 hover:bg-purple-700 h-auto flex flex-col items-center p-4"
              >
                <TrendingUp className="h-6 w-6 mb-2" />
                <span className="text-sm">Analytics</span>
              </Button>

              <Button 
                onClick={() => window.location.href = '/settings'}
                className="bg-orange-600 hover:bg-orange-700 h-auto flex flex-col items-center p-4"
              >
                <Settings className="h-6 w-6 mb-2" />
                <span className="text-sm">Configurações</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span className="text-gray-600">Desenvolvido com</span>
            <Coffee className="h-5 w-5 text-brown-500" />
            <span className="text-gray-600">pela equipe Vendzz</span>
          </div>
          <p className="text-sm text-gray-500">
            Versão PWA 2.0 - Experiência nativa em qualquer dispositivo
          </p>
        </div>
      </div>
    </div>
  );
}