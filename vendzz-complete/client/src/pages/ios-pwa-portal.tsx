import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Bell, Smartphone, Settings, Volume2, Zap, CheckCircle, XCircle } from 'lucide-react';

interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export default function IOSPWAPortal() {
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<NotificationSubscription | null>(null);
  const [soundType, setSoundType] = useState<string>('portal');
  const [isIOSPWA, setIsIOSPWA] = useState(false);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<'loading' | 'active' | 'error'>('loading');

  // Detecção de iOS PWA
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = (window.navigator as any).standalone;
    const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    setIsIOSPWA(isIOS && (isInStandaloneMode || isDisplayStandalone));
    
    console.log('🍎 Detecção iOS PWA:', {
      isIOS,
      isInStandaloneMode,
      isDisplayStandalone,
      userAgent: navigator.userAgent
    });
  }, []);

  // Registrar Service Worker e verificar subscription
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      initializeServiceWorker();
    }
  }, []);

  const initializeServiceWorker = async () => {
    try {
      console.log('🔄 Inicializando Service Worker iOS Portal...');
      
      // Registrar Service Worker específico para iOS
      const registration = await navigator.serviceWorker.register('/sw-persistent-ios.js', {
        scope: '/'
      });
      
      console.log('✅ Service Worker iOS registrado:', registration);
      setServiceWorkerStatus('active');
      
      // Aguardar ativação
      if (registration.installing) {
        await new Promise<void>((resolve) => {
          const worker = registration.installing!;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'activated') {
              resolve();
            }
          });
        });
      }

      // Verificar se já está subscrito
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setSubscription(existingSubscription);
        setIsSubscribed(true);
        console.log('✅ Subscription existente encontrada');
      }

      // Registrar SW no backend
      try {
        await fetch('/api/push-portal/register-sw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            userAgent: navigator.userAgent,
            swVersion: '1.0-portal'
          })
        });
        console.log('📱 SW iOS registrado no backend');
      } catch (error) {
        console.warn('⚠️ Erro ao registrar SW no backend:', error);
      }

    } catch (error) {
      console.error('❌ Erro ao inicializar Service Worker:', error);
      setServiceWorkerStatus('error');
    }
  };

  const subscribeToNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast({
        title: "Não Suportado",
        description: "Push notifications não são suportadas neste navegador.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔔 Solicitando permissão para notificações...');
      
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast({
          title: "Permissão Negada",
          description: "Permita notificações para receber alertas importantes.",
          variant: "destructive",
        });
        return;
      }

      // Buscar VAPID key do servidor
      const vapidResponse = await fetch('/api/push-simple/vapid-key');
      const { publicKey } = await vapidResponse.json();

      // Registrar subscription
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // Enviar subscription para o servidor
      const response = await fetch('/api/push-simple/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription,
          platform: isIOSPWA ? 'ios-pwa' : 'web',
          soundType: soundType
        })
      });

      if (response.ok) {
        setSubscription(subscription);
        setIsSubscribed(true);
        
        toast({
          title: "🔔 Notificações Ativadas",
          description: `Som ${soundType} configurado para iOS PWA`,
        });

        console.log('✅ Subscription criada com som:', soundType);
      } else {
        throw new Error('Erro ao registrar subscription');
      }

    } catch (error) {
      console.error('❌ Erro ao subscrever:', error);
      toast({
        title: "Erro",
        description: "Erro ao ativar notificações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      setIsSubscribed(false);
      
      toast({
        title: "🔕 Notificações Desativadas",
        description: "Você não receberá mais notificações push.",
      });

      console.log('✅ Subscription removida');
    } catch (error) {
      console.error('❌ Erro ao cancelar subscription:', error);
    }
  };

  const testNotification = async () => {
    try {
      const response = await fetch('/api/push-simple/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          title: `🍎 Teste iOS PWA - Som ${soundType}`,
          message: `Notificação de teste com som Portal nativo do iOS`,
          soundType: soundType
        })
      });

      if (response.ok) {
        toast({
          title: "🧪 Teste Enviado",
          description: `Notificação com som ${soundType} enviada!`,
        });
      }
    } catch (error) {
      console.error('❌ Erro ao testar:', error);
    }
  };

  // Converter VAPID key
  function urlBase64ToUint8Array(base64String: string) {
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
  }

  const soundOptions = [
    { value: 'portal', label: 'Portal (iOS 13+)', description: 'Som nativo Portal do iOS', icon: '🍎' },
    { value: 'default', label: 'Padrão iOS', description: 'Som padrão das notificações', icon: '🔔' },
    { value: 'alert', label: 'Alerta', description: 'Som de alerta do sistema', icon: '⚠️' },
    { value: 'chime', label: 'Chime', description: 'Som suave de sino', icon: '🎵' },
    { value: 'ding', label: 'Ding', description: 'Som curto e claro', icon: '🔊' },
    { value: 'bell', label: 'Bell', description: 'Som de campainha', icon: '🔕' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">
          🍎 iOS PWA Portal - Push Notifications
        </h1>
        <p className="text-muted-foreground mb-4">
          Sistema de notificações push especial para iOS PWA com som Portal nativo
        </p>
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Status iOS PWA</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={isIOSPWA ? "default" : "secondary"}>
                {isIOSPWA ? "✅ iOS PWA Detectado" : "❌ Não é iOS PWA"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Service Worker</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge 
                variant={
                  serviceWorkerStatus === 'active' ? "default" : 
                  serviceWorkerStatus === 'error' ? "destructive" : 
                  "secondary"
                }
              >
                {serviceWorkerStatus === 'active' ? "✅ Ativo" : 
                 serviceWorkerStatus === 'error' ? "❌ Erro" : 
                 "🔄 Carregando"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Notificações</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={isSubscribed ? "default" : "secondary"}>
                {isSubscribed ? "✅ Ativadas" : "❌ Desativadas"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">
            <Bell className="w-4 h-4 mr-2" />
            Configurar
          </TabsTrigger>
          <TabsTrigger value="sounds">
            <Volume2 className="w-4 h-4 mr-2" />
            Sons
          </TabsTrigger>
          <TabsTrigger value="test">
            <Zap className="w-4 h-4 mr-2" />
            Teste
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Notificações</CardTitle>
              <CardDescription>
                Ative as notificações push para receber alertas importantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isSubscribed ? (
                <>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      📱 Para iOS PWA (Adicionado à Tela Inicial):
                    </h3>
                    <ol className="text-sm text-blue-800 space-y-1">
                      <li>1. Clique em "Ativar Notificações" abaixo</li>
                      <li>2. Permita notificações quando solicitado</li>
                      <li>3. Notificações aparecerão na tela de bloqueio</li>
                      <li>4. Som Portal será tocado mesmo com app fechado</li>
                    </ol>
                  </div>
                  
                  <Button 
                    onClick={subscribeToNotifications} 
                    disabled={isLoading}
                    size="lg"
                    className="w-full"
                  >
                    {isLoading ? '🔄 Configurando...' : '🔔 Ativar Notificações'}
                  </Button>
                </>
              ) : (
                <>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-semibold">
                        Notificações Ativadas com Sucesso!
                      </span>
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      Som configurado: <strong>{soundType}</strong>
                    </p>
                  </div>
                  
                  <Button 
                    onClick={unsubscribeFromNotifications}
                    variant="outline"
                    className="w-full"
                  >
                    🔕 Desativar Notificações
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sounds">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Som</CardTitle>
              <CardDescription>
                Escolha o som que será tocado nas notificações iOS PWA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {soundOptions.map((option) => (
                  <Card 
                    key={option.value}
                    className={`cursor-pointer transition-colors ${
                      soundType === option.value ? 'border-green-500 bg-green-50' : ''
                    }`}
                    onClick={() => setSoundType(option.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{option.icon}</span>
                          <div>
                            <h3 className="font-semibold">{option.label}</h3>
                            <p className="text-sm text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                        </div>
                        {soundType === option.value && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6">
                <Button 
                  onClick={() => {
                    fetch('/api/push-portal/configure', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                      },
                      body: JSON.stringify({ soundType })
                    });
                    
                    toast({
                      title: "🔊 Som Configurado",
                      description: `Som ${soundType} será usado nas próximas notificações`,
                    });
                  }}
                  className="w-full"
                >
                  💾 Salvar Configuração de Som
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Notificações</CardTitle>
              <CardDescription>
                Teste o sistema de notificações iOS PWA com som Portal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSubscribed ? (
                <>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-yellow-900 mb-2">
                      🧪 Como Testar:
                    </h3>
                    <ol className="text-sm text-yellow-800 space-y-1">
                      <li>1. Clique em "Enviar Teste" abaixo</li>
                      <li>2. A notificação aparecerá na tela de bloqueio</li>
                      <li>3. Som Portal será tocado automaticamente</li>
                      <li>4. Funciona mesmo com app fechado ou tela bloqueada</li>
                    </ol>
                  </div>
                  
                  <Button 
                    onClick={testNotification}
                    size="lg"
                    className="w-full"
                  >
                    🧪 Enviar Notificação de Teste
                  </Button>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    Som atual: <strong>{soundType}</strong>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <XCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    Ative as notificações primeiro na aba "Configurar"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}