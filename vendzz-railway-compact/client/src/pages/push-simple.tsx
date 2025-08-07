import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Bell, BellOff, Smartphone, Check, X } from 'lucide-react';

export default function PushSimple() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  useEffect(() => {
    checkSupport();
    checkPWAStatus();
    checkExistingSubscription();
  }, []);

  const checkSupport = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    setPermission(Notification.permission);
    
    // Detectar iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);
  };

  const checkPWAStatus = () => {
    // Verificar se está rodando como PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const fullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
    const webAppCapable = (window.navigator as any).standalone;
    
    setIsPWA(standalone || fullscreen || webAppCapable);
  };

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Erro ao verificar subscription:', error);
    }
  };

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw-simple.js');
      console.log('Service Worker registrado:', registration);
      return registration;
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
      throw error;
    }
  };

  const subscribeToNotifications = async () => {
    if (!isSupported) {
      toast({
        title: "Não suportado",
        description: "Seu dispositivo não suporta push notifications",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Registrar Service Worker
      const registration = await registerServiceWorker();
      
      // Solicitar permissão
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') {
        toast({
          title: "Permissão negada",
          description: "Você precisa permitir notificações para continuar",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Obter VAPID public key
      const vapidResponse = await fetch('/api/push-simple/vapid-key');
      const { publicKey } = await vapidResponse.json();

      // Criar subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });

      // Enviar subscription para o servidor
      const saveResponse = await fetch('/api/push-simple/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscription })
      });

      if (saveResponse.ok) {
        setIsSubscribed(true);
        toast({
          title: "Ativado com sucesso!",
          description: "Você receberá notificações na tela de bloqueio",
        });
      } else {
        throw new Error('Erro ao salvar subscription');
      }

    } catch (error) {
      console.error('Erro na subscription:', error);
      toast({
        title: "Erro",
        description: "Não foi possível ativar as notificações",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          setIsSubscribed(false);
          toast({
            title: "Desativado",
            description: "Notificações foram desativadas",
          });
        }
      }
    } catch (error) {
      console.error('Erro ao cancelar subscription:', error);
    }
  };

  const testNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Teste Vendzz', {
        body: 'Esta é uma notificação de teste!',
        icon: '/favicon.ico',
        tag: 'test'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notificações Push
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Receba alertas na tela de bloqueio
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">Dispositivo</span>
                </div>
                <Badge variant={isIOS ? "default" : "secondary"}>
                  {isIOS ? "iOS" : "Outros"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`h-5 w-5 rounded-full ${isPWA ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-sm font-medium">PWA Status</span>
                </div>
                <Badge variant={isPWA ? "default" : "secondary"}>
                  {isPWA ? "Instalado" : "Web"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {permission === 'granted' ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm font-medium">Permissão</span>
                </div>
                <Badge variant={permission === 'granted' ? "default" : "destructive"}>
                  {permission === 'granted' ? 'Permitido' : 'Negado'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Action */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {isSubscribed ? (
                <BellOff className="h-5 w-5 text-red-500" />
              ) : (
                <Bell className="h-5 w-5 text-green-500" />
              )}
              <span>
                {isSubscribed ? 'Notificações Ativas' : 'Ativar Notificações'}
              </span>
            </CardTitle>
            <CardDescription>
              {isSubscribed
                ? 'Você receberá notificações na tela de bloqueio'
                : 'Clique para ativar notificações push'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isSupported ? (
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Seu dispositivo não suporta push notifications
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={isSubscribed ? unsubscribeFromNotifications : subscribeToNotifications}
                  disabled={isLoading}
                  className="w-full"
                  variant={isSubscribed ? "destructive" : "default"}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Processando...</span>
                    </div>
                  ) : isSubscribed ? (
                    'Desativar Notificações'
                  ) : (
                    'Ativar Notificações'
                  )}
                </Button>

                {isSubscribed && (
                  <Button
                    onClick={testNotification}
                    variant="outline"
                    className="w-full"
                  >
                    Testar Notificação
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions for iOS */}
        {isIOS && !isPWA && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-100 text-sm">
                📱 Para iOS - Como Instalar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
                <li>1. Toque no botão "Compartilhar" no Safari</li>
                <li>2. Selecione "Adicionar à Tela Inicial"</li>
                <li>3. Confirme tocando em "Adicionar"</li>
                <li>4. Abra o app da tela inicial</li>
                <li>5. Ative as notificações aqui</li>
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}