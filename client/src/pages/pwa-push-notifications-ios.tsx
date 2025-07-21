import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellIcon, CheckCircleIcon, AlertCircleIcon, SmartphoneIcon, WifiIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

interface PWANotificationsProps {}

export default function PWANotificationsiOS({}: PWANotificationsProps) {
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [vapidPublicKey, setVapidPublicKey] = useState<string>('');
  const [browserId] = useState(() => {
    let id = localStorage.getItem('pwa-browser-id');
    if (!id) {
      id = 'pwa-' + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem('pwa-browser-id', id);
    }
    return id;
  });

  // Detectar PWA iOS instalado via favoritos
  const isIOSPWA = () => {
    return window.navigator.standalone === true;
  };

  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  };

  useEffect(() => {
    console.log('🔧 [PWA iOS] Inicializando sistema de notificações...');
    
    // Verificar suporte
    if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      console.log('📱 Ambiente detectado:', {
        standalone: window.navigator.standalone,
        isIOS: isIOS(),
        isPWA: isIOSPWA(),
        permission: Notification.permission
      });
      
      // Registrar Service Worker
      registerServiceWorker();
      fetchVapidKey();
    } else {
      console.warn('⚠️ [PWA iOS] Push notifications não suportadas neste browser');
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      console.log('🔧 [PWA iOS] Registrando Service Worker...');
      const registration = await navigator.serviceWorker.register('/vendzz-notification-sw.js', {
        scope: '/'
      });
      
      // Aguardar que o Service Worker esteja pronto
      await registration.update();
      setServiceWorkerRegistration(registration);
      
      console.log('✅ [PWA iOS] Service Worker registrado:', registration.scope);
    } catch (error) {
      console.error('❌ [PWA iOS] Erro ao registrar Service Worker:', error);
    }
  };

  const fetchVapidKey = async () => {
    try {
      const response = await fetch('/api/push-vapid-key');
      if (response.ok) {
        const data = await response.json();
        setVapidPublicKey(data.publicKey);
        console.log('🔑 [PWA iOS] VAPID key obtida');
      }
    } catch (error) {
      console.error('❌ [PWA iOS] Erro ao obter VAPID key:', error);
    }
  };

  const subscribeToNotifications = async () => {
    try {
      console.log('🚀 [PWA iOS] Iniciando subscription para app adicionado aos favoritos...');
      
      // Detectar ambiente iOS PWA
      const iosPWA = isIOSPWA();
      const ios = isIOS();
      
      console.log('📲 [PWA iOS] Ambiente:', { iosPWA, ios, standalone: window.navigator.standalone });
      
      // Para PWA iOS, usar abordagem específica
      if (iosPWA || (ios && window.matchMedia('(display-mode: standalone)').matches)) {
        console.log('📱 [iOS PWA] App instalado via "Adicionar aos Favoritos" detectado');
        
        // Solicitar permissão explicitamente
        if (Notification.permission === 'default') {
          console.log('🔔 [iOS PWA] Solicitando permissão de notificação...');
          
          // Usar Promise para iOS compatibility
          const permission = await new Promise<NotificationPermission>((resolve) => {
            if ('requestPermission' in Notification) {
              Notification.requestPermission().then(resolve);
            } else {
              // Fallback para versões antigas
              const result = (Notification as any).requestPermission();
              resolve(result);
            }
          });
          
          setPermission(permission);
          
          if (permission !== 'granted') {
            throw new Error('Para PWA iOS funcionar, é necessário permitir notificações. Vá em Configurações > Safari > Notificações');
          }
        }
      } else {
        // Browser normal
        const permission = await Notification.requestPermission();
        setPermission(permission);
        
        if (permission !== 'granted') {
          toast({
            title: "Permissão negada",
            description: "É necessário permitir notificações",
            variant: "destructive",
          });
          return;
        }
      }
      
      console.log('✅ [PWA iOS] Permissão concedida');

      // Aguardar Service Worker
      const registration = serviceWorkerRegistration || await navigator.serviceWorker.ready;
      
      if (!registration) {
        throw new Error('Service Worker não disponível');
      }

      console.log('🔧 [PWA iOS] Criando push subscription...');
      
      // Criar subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      console.log('📱 [PWA iOS] Subscription criada');

      // Preparar dados para envio
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.getKey('p256dh') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : null,
          auth: subscription.getKey('auth') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : null
        },
        userId: `ios-pwa-${browserId}`,
        userAgent: navigator.userAgent,
        pwaType: iosPWA ? 'ios-favorites' : 'browser',
        timestamp: new Date().toISOString()
      };

      console.log('📤 [PWA iOS] Enviando subscription...');

      // Usar endpoint público (sem JWT para PWA iOS)
      const response = await fetch('/api/push-subscribe-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [PWA iOS] Subscription registrada:', data);
        
        setIsSubscribed(true);
        
        // Notificação de teste local
        if (iosPWA) {
          console.log('🧪 [iOS PWA] Testando notificação local...');
          new Notification('🎉 Vendzz PWA iOS Ativo!', {
            body: 'Notificações configuradas! Funcionará na tela de bloqueio.',
            icon: '/vendzz-logo-official.png',
            tag: 'ios-pwa-test',
            requireInteraction: true
          });
        }
        
        toast({
          title: "✅ Notificações PWA iOS ativadas!",
          description: "Funcionará na tela de bloqueio mesmo com app fechado",
        });
        
      } else {
        const errorText = await response.text();
        throw new Error(`Erro no servidor: ${response.status} - ${errorText}`);
      }

    } catch (error: any) {
      console.error('❌ [PWA iOS] Erro:', error);
      
      let message = error.message;
      if (message.includes('Safari')) {
        message = 'Para PWA iOS: Configurações > Safari > Notificações > Permitir para este site';
      }
      
      toast({
        title: "Erro PWA iOS",
        description: message,
        variant: "destructive",
      });
    }
  };

  const testNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('🧪 Teste iOS PWA', {
        body: 'Notificação de teste funcionando!',
        icon: '/vendzz-logo-official.png',
        tag: 'test-ios-pwa',
        requireInteraction: true
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <BellIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">
            Notificações PWA iOS Vendzz
          </h1>
          <p className="text-gray-600 mt-2">
            Sistema otimizado para apps adicionados aos favoritos no iOS
          </p>
        </div>

        <div className="grid gap-6">
          {/* Status do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SmartphoneIcon className="h-5 w-5" />
                Status PWA iOS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Suporte PWA:</span>
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
                <span>App iOS Standalone:</span>
                <div className="flex items-center gap-2">
                  {isIOSPWA() ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircleIcon className="h-5 w-5 text-yellow-600" />
                  )}
                  <span className={isIOSPWA() ? 'text-green-600' : 'text-yellow-600'}>
                    {isIOSPWA() ? 'PWA Instalado' : 'Browser Mode'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Permissão:</span>
                <div className="flex items-center gap-2">
                  {permission === 'granted' ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircleIcon className="h-5 w-5 text-red-600" />
                  )}
                  <span className={permission === 'granted' ? 'text-green-600' : 'text-red-600'}>
                    {permission === 'granted' ? 'Concedida' : permission === 'denied' ? 'Negada' : 'Pendente'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Service Worker:</span>
                <div className="flex items-center gap-2">
                  {serviceWorkerRegistration ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <WifiIcon className="h-5 w-5 text-yellow-600" />
                  )}
                  <span className={serviceWorkerRegistration ? 'text-green-600' : 'text-yellow-600'}>
                    {serviceWorkerRegistration ? 'Ativo' : 'Carregando...'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardHeader>
              <CardTitle>Ativação PWA iOS</CardTitle>
              <CardDescription>
                {isIOSPWA() 
                  ? 'App instalado via "Adicionar aos Favoritos" - Otimizado para tela de bloqueio'
                  : 'Para melhor experiência, adicione aos favoritos do Safari'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isSubscribed ? (
                <div className="space-y-3">
                  <Button
                    onClick={subscribeToNotifications}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!isSupported || permission === 'denied'}
                  >
                    <BellIcon className="h-4 w-4 mr-2" />
                    {isIOSPWA() ? 'Ativar Notificações PWA iOS' : 'Ativar Notificações'}
                  </Button>
                  
                  {isIOSPWA() && (
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      <strong>📱 PWA iOS Detectado!</strong><br/>
                      Notificações aparecerão na tela de bloqueio mesmo com app fechado por dias.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-green-600 text-center py-4">
                    <CheckCircleIcon className="h-8 w-8 mx-auto mb-2" />
                    <strong>Notificações PWA iOS Ativas!</strong>
                  </div>
                  
                  <Button
                    onClick={testNotification}
                    variant="outline"
                    className="w-full"
                  >
                    🧪 Teste de Notificação Local
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instruções iOS */}
          {isIOS() && !isIOSPWA() && (
            <Card>
              <CardHeader>
                <CardTitle>📱 Como Instalar no iOS</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>No Safari, toque no botão de compartilhamento (quadrado com seta para cima)</li>
                  <li>Toque em "Adicionar aos Favoritos" ou "Adicionar à Tela de Início"</li>
                  <li>Confirme a instalação</li>
                  <li>Abra o app da tela de início (não do Safari)</li>
                  <li>Ative as notificações nesta página</li>
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}