import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, TestTube, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth-jwt';

const TestPushPWA: React.FC = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth();

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
        console.log('🔧 Service Worker registrado:', registration);
        
        // Verificar subscription existente
        const existingSub = await registration.pushManager.getSubscription();
        if (existingSub) {
          setSubscription(existingSub);
          setIsSubscribed(true);
          console.log('🔔 Subscription encontrada:', existingSub);
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

      // Buscar chave VAPID
      const vapidResponse = await fetch('/api/push-notifications/vapid-key').then(res => res.json());
      const vapidKey = vapidResponse.vapidPublicKey;

      // Criar subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      console.log('🔔 Nova subscription criada:', subscription);

      // Salvar no servidor
      const saveResponse = await fetch('/api/push-notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      }).then(res => res.json());

      if (saveResponse.success) {
        setSubscription(subscription);
        setIsSubscribed(true);
        toast({
          title: "✅ Sucesso!",
          description: "Notificações ativadas com sucesso"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao criar subscription:', error);
      toast({
        title: "Erro",
        description: "Erro ao ativar notificações",
        variant: "destructive"
      });
    }
  };

  const unsubscribe = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        setIsSubscribed(false);
        
        toast({
          title: "Desativado",
          description: "Notificações desativadas"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao desativar:', error);
    }
  };

  const testNotification = async () => {
    try {
      if (!isSubscribed) {
        toast({
          title: "Ative as notificações",
          description: "Você precisa ativar as notificações primeiro"
        });
        return;
      }

      const response = await fetch('/api/push-notifications/global', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: '🧪 Teste PWA - Vendzz',
          body: 'Notificação push real funcionando no PWA!',
          url: '/app-pwa-vendzz',
          icon: '/vendzz-logo-official.png',
          tag: 'test-pwa'
        })
      }).then(res => res.json());

      if (response.success) {
        toast({
          title: "✅ Teste enviado!",
          description: "Notificação enviada - deve aparecer na tela de bloqueio"
        });
      }
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar teste de notificação",
        variant: "destructive"
      });
    }
  };

  // Converter chave VAPID para Uint8Array
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

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <Card className="bg-red-900/50 border border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BellOff className="h-8 w-8 text-red-400" />
              <div>
                <h3 className="text-xl font-bold text-red-400">Não Suportado</h3>
                <p className="text-red-300">Este navegador não suporta notificações push.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-green-900/20 border border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-400">
              <Smartphone className="h-6 w-6" />
              Teste Push PWA - Vendzz
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Status */}
        <Card className="bg-gray-800/50 border border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Bell className="h-5 w-5" />
              Status das Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400">Suporte:</span>
                <Badge variant={isSupported ? "default" : "destructive"} className="ml-2">
                  {isSupported ? "✅ Sim" : "❌ Não"}
                </Badge>
              </div>
              <div>
                <span className="text-gray-400">Permissão:</span>
                <Badge 
                  variant={permission === 'granted' ? "default" : permission === 'denied' ? "destructive" : "secondary"} 
                  className="ml-2"
                >
                  {permission === 'granted' ? "✅ Concedida" : 
                   permission === 'denied' ? "❌ Negada" : "⏳ Pendente"}
                </Badge>
              </div>
            </div>
            
            <div>
              <span className="text-gray-400">Status:</span>
              <Badge variant={isSubscribed ? "default" : "secondary"} className="ml-2">
                {isSubscribed ? "🔔 Ativo" : "🔕 Inativo"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card className="bg-gray-800/50 border border-gray-700">
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {!isSubscribed ? (
              <Button 
                onClick={requestPermission} 
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoading ? '⏳ Ativando...' : '🔔 Ativar Notificações'}
              </Button>
            ) : (
              <div className="space-y-3">
                <Button 
                  onClick={testNotification}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  🧪 Enviar Teste
                </Button>
                
                <Button 
                  onClick={unsubscribe}
                  variant="destructive"
                  className="w-full"
                >
                  🔕 Desativar Notificações
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-blue-900/20 border border-blue-500/20">
          <CardContent className="p-6">
            <h3 className="font-bold text-blue-400 mb-2">ℹ️ Como testar:</h3>
            <ol className="space-y-1 text-blue-300 text-sm">
              <li>1. Clique em "Ativar Notificações"</li>
              <li>2. Permita notificações quando solicitado</li>
              <li>3. Clique em "Enviar Teste"</li>
              <li>4. A notificação aparecerá na tela de bloqueio</li>
              <li>5. Funciona mesmo com o PWA em segundo plano</li>
            </ol>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default TestPushPWA;