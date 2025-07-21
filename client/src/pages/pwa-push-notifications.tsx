import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BellIcon, SmartphoneIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';

interface VendzzPWANotificationsProps {}

export default function VendzzPWANotifications({}: VendzzPWANotificationsProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [browserId, setBrowserId] = useState('');
  const [notificationServiceWorker, setNotificationServiceWorker] = useState<ServiceWorkerRegistration | null>(null);
  const [vapidPublicKey, setVapidPublicKey] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Verificar suporte a Service Workers e Notifications
    const supported = 'serviceWorker' in navigator && 'Notification' in window;
    setIsSupported(supported);

    // Gerar ou recuperar Browser ID único
    let storedBrowserId = localStorage.getItem('VENDZZ_BROWSER_ID');
    if (!storedBrowserId) {
      storedBrowserId = `vendzz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('VENDZZ_BROWSER_ID', storedBrowserId);
    }
    setBrowserId(storedBrowserId);

    if (supported) {
      initializeServiceWorker();
      fetchVapidKey();
      
      // Auto-solicitar permissão se ainda não foi concedida
      if (Notification.permission === 'default') {
        console.log('🔔 Solicitando permissão automaticamente...');
        setTimeout(() => {
          Notification.requestPermission().then((permission) => {
            console.log('📋 Permissão automática resultado:', permission);
            if (permission === 'granted') {
              console.log('✅ Permissão concedida automaticamente');
            }
          });
        }, 2000); // Aguardar 2 segundos para melhor UX
      }
    }
  }, []);

  const fetchVapidKey = async () => {
    try {
      const response = await fetch('/api/push-vapid-key');
      const data = await response.json();
      setVapidPublicKey(data.publicKey);
    } catch (error) {
      console.error('Erro ao buscar VAPID key:', error);
    }
  };

  const initializeServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        '/vendzz-notification-sw.js',
        { scope: '/' }
      );

      console.log('🔧 Service Worker registrado com sucesso:', registration.scope);

      const sw = registration.installing || registration.waiting || registration.active;

      if (registration.active) {
        setNotificationServiceWorker(registration);
        return;
      }

      if (sw) {
        sw.addEventListener('statechange', (event: any) => {
          if (event.target.state === 'activated') {
            setNotificationServiceWorker(registration);
          }
        });
      }
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
      toast({
        title: "Erro no Service Worker",
        description: "Não foi possível registrar o service worker",
        variant: "destructive",
      });
    }
  };

  const subscribeToNotifications = async () => {
    console.log('🔄 Iniciando processo de subscription...');
    console.log('Service Worker disponível:', !!notificationServiceWorker);
    console.log('VAPID Key disponível:', !!vapidPublicKey);

    if (!notificationServiceWorker) {
      console.error('❌ Service Worker não disponível');
      toast({
        title: "Service Worker não disponível", 
        description: "Tentando recarregar o service worker...",
        variant: "destructive",
      });
      
      // Tentar recarregar o service worker
      await initializeServiceWorker();
      if (!notificationServiceWorker) {
        return;
      }
    }

    if (!vapidPublicKey) {
      console.error('❌ VAPID Key não disponível');
      toast({
        title: "Erro de configuração",
        description: "Chave VAPID não encontrada. Recarregando...",
        variant: "destructive", 
      });
      await fetchVapidKey();
      return;
    }

    try {
      console.log('🔐 Solicitando permissão para notificações...');
      
      // Solicitar permissão
      const result = await Notification.requestPermission();
      
      console.log('📋 Resultado da permissão:', result);

      if (result !== 'granted') {
        toast({
          title: "Permissão negada",
          description: `Status da permissão: ${result}. Por favor, permita notificações nas configurações do navegador.`,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Permissão concedida! Criando subscription...');

      // Converter VAPID key de base64 para Uint8Array  
      let vapidKeyUint8Array;
      try {
        vapidKeyUint8Array = new Uint8Array(
          atob(vapidPublicKey.replace(/-/g, '+').replace(/_/g, '/'))
            .split('')
            .map(char => char.charCodeAt(0))
        );
        console.log('🔑 VAPID Key convertida para Uint8Array');
      } catch (error) {
        console.error('❌ Erro ao converter VAPID key:', error);
        // Tentar usar a chave diretamente
        vapidKeyUint8Array = vapidPublicKey;
      }

      // Criar subscription
      const subscription = await notificationServiceWorker.pushManager.subscribe({
        applicationServerKey: vapidKeyUint8Array,
        userVisibleOnly: true
      });

      console.log('📱 Subscription criada:', {
        endpoint: subscription.endpoint.substring(0, 50) + '...',
        hasP256dh: !!subscription.getKey('p256dh'),
        hasAuth: !!subscription.getKey('auth')
      });

      // Enviar subscription para o servidor
      let token = localStorage.getItem('token');
      console.log('🔐 Token inicial encontrado:', !!token);

      // Se não há token, tentar fazer login automático como guest user
      if (!token) {
        console.log('🔐 Sem token - tentando login automático...');
        try {
          const loginResponse = await fetch('/api/auth/guest-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deviceId: browserId,
              userAgent: navigator.userAgent
            })
          });
          
          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            token = loginData.token;
            if (token) {
              localStorage.setItem('token', token);
              console.log('🔐 Token guest criado com sucesso');
            }
          }
        } catch (loginError) {
          console.warn('⚠️ Não foi possível criar token guest, continuando sem autenticação');
        }
      }

      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.getKey('p256dh') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : null,
          auth: subscription.getKey('auth') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : null
        },
        userId: 'pwa-user-' + browserId,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      console.log('📤 Enviando subscription para servidor...', {
        endpoint: subscriptionData.endpoint.substring(0, 50) + '...',
        userId: subscriptionData.userId,
        hasToken: !!token
      });

      const response = await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          endpoint: subscriptionData.endpoint,
          keys: subscriptionData.keys,
          userId: subscriptionData.userId,
          userAgent: subscriptionData.userAgent
        })
      });

      console.log('📋 Resposta do servidor:', response.status, response.statusText);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Subscription registrada com sucesso:', responseData);
        
        setIsSubscribed(true);
        toast({
          title: "✅ Notificações ativadas!",
          description: "Você receberá notificações push do Vendzz",
        });
      } else {
        const errorText = await response.text();
        console.error('❌ Erro do servidor:', errorText);
        
        // Se erro 401, tentar sem autenticação
        if (response.status === 401) {
          console.log('🔄 Tentando registrar subscription sem autenticação...');
          
          const retryResponse = await fetch('/api/push-subscribe-public', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              endpoint: subscriptionData.endpoint,
              keys: subscriptionData.keys,
              userId: subscriptionData.userId,
              userAgent: subscriptionData.userAgent
            })
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            console.log('✅ Subscription registrada sem auth:', retryData);
            
            setIsSubscribed(true);
            toast({
              title: "✅ Notificações ativadas!",
              description: "Você receberá notificações push do Vendzz",
            });
            return;
          }
        }
        
        throw new Error(`Erro ao registrar subscription: ${response.status} - ${errorText}`);
      }

    } catch (error: any) {
      console.error('Erro ao subscrever:', error);
      toast({
        title: "Erro na subscrição",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const testNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Teste Vendzz', {
        body: 'Esta é uma notificação de teste local',
        icon: '/vendzz-logo-official.png',
        badge: '/vendzz-logo-official.png'
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <BellIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">
            Notificações PWA Vendzz
          </h1>
          <p className="text-gray-600 mt-2">
            Sistema PWA para notificações na tela de bloqueio - Funciona com app fechado
          </p>
        </div>

        <div className="grid gap-6">
          {/* Status do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SmartphoneIcon className="h-5 w-5" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Suporte a PWA:</span>
                <div className="flex items-center gap-2">
                  {isSupported ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircleIcon className="h-5 w-5 text-red-600" />
                  )}
                  <span className={isSupported ? 'text-green-600' : 'text-red-600'}>
                    {isSupported ? 'Suportado' : 'Não suportado'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Service Worker:</span>
                <div className="flex items-center gap-2">
                  {notificationServiceWorker ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircleIcon className="h-5 w-5 text-yellow-600" />
                  )}
                  <span className={notificationServiceWorker ? 'text-green-600' : 'text-yellow-600'}>
                    {notificationServiceWorker ? 'Ativo' : 'Carregando...'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Permissão de Notificação:</span>
                <span className={`font-medium ${
                  Notification.permission === 'granted' ? 'text-green-600' :
                  Notification.permission === 'denied' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {Notification.permission === 'granted' ? 'Concedida' :
                   Notification.permission === 'denied' ? 'Negada' : 'Não solicitada'}
                </span>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600">
                  <strong>Browser ID:</strong> #{browserId}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardHeader>
              <CardTitle>Ações de Notificação</CardTitle>
              <CardDescription>
                Configure e teste as notificações push
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={subscribeToNotifications}
                disabled={!isSupported || !notificationServiceWorker || isSubscribed}
                className="w-full"
                size="lg"
              >
                {isSubscribed ? 'Já inscrito nas notificações' : 'Ativar notificações push'}
              </Button>

              <Button 
                onClick={testNotification}
                variant="outline"
                disabled={Notification.permission !== 'granted'}
                className="w-full"
              >
                Testar notificação local
              </Button>
            </CardContent>
          </Card>

          {/* Instruções */}
          <Card>
            <CardHeader>
              <CardTitle>Como funciona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-700">
                <p className="mb-2">
                  <strong>1.</strong> O sistema registra um Service Worker especializado em notificações
                </p>
                <p className="mb-2">
                  <strong>2.</strong> Solicita permissão para enviar notificações push
                </p>
                <p className="mb-2">
                  <strong>3.</strong> Registra seu dispositivo no servidor com VAPID keys
                </p>
                <p className="mb-2">
                  <strong>4.</strong> Recebe notificações mesmo com o navegador fechado
                </p>
              </div>
              
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>💡 Dica:</strong> Este sistema é baseado no exemplo robusto do GitHub
                  que usa arquivos JSON simples para armazenar subscriptions, sem dependências complexas.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}