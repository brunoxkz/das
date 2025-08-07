import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, TestTube, Smartphone, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth-jwt';

const TestPushReal: React.FC = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testTitle, setTestTitle] = useState('🚀 Vendzz PWA - Teste Real!');
  const [testBody, setTestBody] = useState('Sistema de notificações push 100% operacional!');
  const { toast } = useToast();
  const { token } = useAuth();

  // VAPID key público (deve ser o mesmo do servidor)
  const VAPID_PUBLIC_KEY = 'BLqEYJl9YFBwJJCqWFUvKWh8DJpjFXuRIoH7yj0WP9pKXHrqqRAOqOQyeZoJ8RkQIgj6QKhJNgZqLmOy_VDgMiQ';

  useEffect(() => {
    checkSupport();
    checkPermission();
    registerServiceWorker();
  }, []);

  const checkSupport = () => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    console.log('🔔 Push notifications supported:', supported);
  };

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  const registerServiceWorker = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('🔧 Service Worker registrado com sucesso:', registration);
        
        // Verificar subscription existente
        const existingSub = await registration.pushManager.getSubscription();
        if (existingSub) {
          setSubscription(existingSub);
          setIsSubscribed(true);
          console.log('✅ Subscription existente encontrada');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao registrar Service Worker:', error);
    }
  };

  const requestPermission = async () => {
    setIsLoading(true);
    
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        await subscribeToNotifications();
        toast({
          title: "Sucesso!",
          description: "Permissão concedida! Subscription criada.",
        });
      } else {
        toast({
          title: "Permissão negada",
          description: "Não será possível enviar notificações push.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error);
      toast({
        title: "Erro",
        description: "Erro ao solicitar permissão para notificações",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        throw new Error('Service Worker não registrado');
      }

      // Converter VAPID key de base64 para Uint8Array
      const vapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });

      setSubscription(subscription);
      setIsSubscribed(true);

      // Enviar subscription para o servidor
      const subscriptionData = {
        subscription: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
            auth: arrayBufferToBase64(subscription.getKey('auth'))
          }
        }
      };

      const response = await apiRequest('POST', '/api/push-notifications/subscribe', subscriptionData);
      console.log('✅ Subscription enviada para servidor:', response);

    } catch (error) {
      console.error('❌ Erro ao criar subscription:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar subscription de notificações",
        variant: "destructive"
      });
    }
  };

  const sendTestNotification = async () => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/push-notifications/test', {
        title: testTitle,
        body: testBody,
        url: '/app-pwa-vendzz',
        icon: '/logo-vendzz-white.png'
      });

      console.log('📱 Notificação teste enviada:', response);
      
      toast({
        title: "Notificação Enviada!",
        description: "Verifique a tela de bloqueio do seu dispositivo.",
      });
    } catch (error) {
      console.error('❌ Erro ao enviar notificação teste:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar notificação de teste",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        setIsSubscribed(false);
        toast({
          title: "Unsubscribe realizado",
          description: "Você não receberá mais notificações push.",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao fazer unsubscribe:', error);
      toast({
        title: "Erro",
        description: "Erro ao cancelar notificações",
        variant: "destructive"
      });
    }
  };

  // Funções auxiliares
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer | null) => {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return window.btoa(binary);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
            🔔 Sistema Push PWA - Teste Real
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Teste as notificações push em tempo real no seu dispositivo
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Suporte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={isSupported ? "default" : "destructive"}>
                {isSupported ? "✅ Suportado" : "❌ Não Suportado"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Permissão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge 
                variant={
                  permission === 'granted' ? "default" : 
                  permission === 'denied' ? "destructive" : "secondary"
                }
              >
                {permission === 'granted' ? "✅ Concedida" : 
                 permission === 'denied' ? "❌ Negada" : "⏳ Pendente"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={isSubscribed ? "default" : "secondary"}>
                {isSubscribed ? "✅ Ativa" : "⏳ Inativa"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações de Teste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isSubscribed ? (
              <Button 
                onClick={requestPermission}
                disabled={!isSupported || isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Processando..." : "🔔 Solicitar Permissão & Ativar"}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Título da Notificação:</label>
                    <Input
                      value={testTitle}
                      onChange={(e) => setTestTitle(e.target.value)}
                      placeholder="Título da notificação"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Corpo da Notificação:</label>
                    <Textarea
                      value={testBody}
                      onChange={(e) => setTestBody(e.target.value)}
                      placeholder="Conteúdo da notificação"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={sendTestNotification}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isLoading ? "Enviando..." : "📱 Enviar Teste"}
                  </Button>
                  
                  <Button 
                    onClick={unsubscribe}
                    variant="outline"
                    className="flex-1"
                  >
                    <BellOff className="h-4 w-4 mr-2" />
                    Desativar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Browser:</strong> {navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Outro'}</p>
              <p><strong>Service Worker:</strong> {'serviceWorker' in navigator ? 'Suportado' : 'Não suportado'}</p>
              <p><strong>Push Manager:</strong> {'PushManager' in window ? 'Suportado' : 'Não suportado'}</p>
              {subscription && (
                <p><strong>Endpoint:</strong> {subscription.endpoint.substring(0, 50)}...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestPushReal;