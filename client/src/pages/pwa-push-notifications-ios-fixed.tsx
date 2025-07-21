import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellIcon, CheckCircleIcon, AlertCircleIcon, SmartphoneIcon, RefreshCwIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

interface PWANotificationsiOSFixedProps {}

export default function PWANotificationsiOSFixed({}: PWANotificationsiOSFixedProps) {
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [lastError, setLastError] = useState<string>('');
  
  // ID único para este dispositivo PWA
  const [deviceId] = useState(() => {
    const stored = localStorage.getItem('vendzz-pwa-device-id');
    if (stored) return stored;
    const newId = 'ios-pwa-' + Math.random().toString(36).substr(2, 12) + '-' + Date.now();
    localStorage.setItem('vendzz-pwa-device-id', newId);
    return newId;
  });

  // Detectar ambiente com máxima precisão
  const detectEnvironment = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone === true;
    const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isPWAInstalled = isStandalone || isDisplayStandalone;
    
    return {
      isIOS,
      isStandalone,
      isDisplayStandalone,
      isPWAInstalled,
      userAgent: navigator.userAgent
    };
  };

  useEffect(() => {
    const env = detectEnvironment();
    
    console.log('🔍 [FIXED] Ambiente detectado:', env);
    setDebugInfo(`iOS: ${env.isIOS}, Standalone: ${env.isStandalone}, PWA: ${env.isPWAInstalled}`);
    
    // Verificar suporte básico
    const hasSupport = 'serviceWorker' in navigator && 
                      'PushManager' in window && 
                      'Notification' in window;
    
    setIsSupported(hasSupport);
    setPermission(Notification.permission);
    
    if (hasSupport) {
      initializeServiceWorker();
    }
  }, []);

  const initializeServiceWorker = async () => {
    try {
      console.log('🔧 [FIXED] Inicializando Service Worker...');
      
      // Registrar ou obter Service Worker existente
      let registration = await navigator.serviceWorker.getRegistration('/');
      
      if (!registration) {
        console.log('🔧 [FIXED] Registrando novo Service Worker...');
        registration = await navigator.serviceWorker.register('/vendzz-notification-sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });
      }
      
      // Aguardar que esteja ativo
      if (registration.installing) {
        await new Promise(resolve => {
          registration!.installing!.addEventListener('statechange', function() {
            if (this.state === 'activated') resolve(true);
          });
        });
      }
      
      console.log('✅ [FIXED] Service Worker pronto:', registration.scope);
      
    } catch (error) {
      console.error('❌ [FIXED] Erro no Service Worker:', error);
      setLastError(`Service Worker: ${error.message}`);
    }
  };

  const subscribeToNotifications = async () => {
    setIsLoading(true);
    setLastError('');
    
    try {
      console.log('🚀 [FIXED] === INICIANDO PROCESSO OTIMIZADO ===');
      
      const env = detectEnvironment();
      console.log('📱 [FIXED] Ambiente:', env);
      
      // ETAPA 1: Verificar permissões de forma robusta
      console.log('🔔 [FIXED] Verificando permissões...');
      
      if (Notification.permission !== 'granted') {
        console.log('🔔 [FIXED] Solicitando permissão...');
        
        // Método robusto para iOS
        let permissionResult: NotificationPermission;
        
        if (env.isIOS && env.isPWAInstalled) {
          // Para PWA iOS, usar método específico
          console.log('🍎 [FIXED] Usando método específico para iOS PWA...');
          
          // Criar Promise personalizada para iOS
          permissionResult = await new Promise<NotificationPermission>((resolve) => {
            try {
              const result = Notification.requestPermission((permission) => {
                resolve(permission);
              });
              
              // Se retornou Promise (Safari moderno)
              if (result && typeof result.then === 'function') {
                result.then(resolve).catch(() => resolve('denied'));
              }
            } catch (error) {
              console.error('🍎 [FIXED] Erro na permissão iOS:', error);
              resolve('denied');
            }
          });
        } else {
          // Método padrão
          permissionResult = await Notification.requestPermission();
        }
        
        console.log('🔔 [FIXED] Resultado da permissão:', permissionResult);
        setPermission(permissionResult);
        
        if (permissionResult !== 'granted') {
          throw new Error(`Permissão negada (${permissionResult}). Para funcionar no iOS, vá em Configurações > Safari > Notificações e ative para este site.`);
        }
      }

      // ETAPA 2: Obter Service Worker de forma robusta
      console.log('🔧 [FIXED] Obtendo Service Worker...');
      
      let registration = await navigator.serviceWorker.getRegistration('/');
      
      if (!registration) {
        console.log('🔧 [FIXED] Service Worker não encontrado, aguardando ready...');
        registration = await navigator.serviceWorker.ready;
      }
      
      if (!registration || !registration.pushManager) {
        throw new Error('Service Worker ou PushManager não disponível');
      }

      // ETAPA 3: Obter VAPID key de forma robusta
      console.log('🔑 [FIXED] Obtendo VAPID key...');
      
      const vapidResponse = await fetch('/api/push-vapid-key', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!vapidResponse.ok) {
        throw new Error(`VAPID key não disponível: ${vapidResponse.status}`);
      }
      
      const { publicKey } = await vapidResponse.json();
      
      if (!publicKey) {
        throw new Error('VAPID public key não retornada pelo servidor');
      }

      // ETAPA 4: Criar subscription de forma robusta
      console.log('📱 [FIXED] Criando push subscription...');
      
      // Primeiro, verificar se já existe uma subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('🔄 [FIXED] Removendo subscription anterior...');
        await existingSubscription.unsubscribe();
      }
      
      // Criar nova subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });
      
      console.log('✅ [FIXED] Subscription criada');

      // ETAPA 5: Preparar dados otimizados
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.getKey('p256dh') ? 
            btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : null,
          auth: subscription.getKey('auth') ? 
            btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : null
        },
        userId: deviceId,
        userAgent: navigator.userAgent,
        pwaType: env.isPWAInstalled ? 'ios-pwa-favorites' : 'ios-browser',
        environment: env,
        timestamp: new Date().toISOString()
      };

      // ETAPA 6: Enviar para servidor de forma robusta
      console.log('📤 [FIXED] Enviando para servidor...');
      
      const response = await fetch('/api/push-subscribe-public', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Servidor retornou erro ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ [FIXED] Registrado no servidor:', result);

      // ETAPA 7: Teste local imediato
      if (env.isPWAInstalled) {
        console.log('🧪 [FIXED] Testando notificação local...');
        
        try {
          new Notification('🎉 Vendzz PWA iOS Configurado!', {
            body: 'As notificações funcionarão na tela de bloqueio mesmo com o app fechado.',
            icon: '/vendzz-logo-official.png',
            tag: 'ios-pwa-success',
            requireInteraction: true
          });
        } catch (notifError) {
          console.warn('⚠️ [FIXED] Notificação local falhou:', notifError);
        }
      }

      // Sucesso!
      setIsSubscribed(true);
      setDebugInfo(`✅ Configurado: ${result.userId} (${result.pwaType})`);
      
      toast({
        title: "🎉 Notificações PWA iOS Ativadas!",
        description: "Funcionará na tela de bloqueio mesmo com app fechado por dias.",
      });

    } catch (error: any) {
      console.error('❌ [FIXED] ERRO FINAL:', error);
      
      const errorMessage = error.message || 'Erro desconhecido';
      setLastError(errorMessage);
      
      // Mensagem específica para o usuário
      let userMessage = errorMessage;
      
      if (errorMessage.includes('Permission')) {
        userMessage = 'Permissão negada. Vá em Configurações do iPhone > Safari > Notificações > e ative para este site';
      } else if (errorMessage.includes('Service Worker')) {
        userMessage = 'Erro do navegador. Tente fechar e reabrir o app PWA';
      } else if (errorMessage.includes('VAPID')) {
        userMessage = 'Erro de configuração do servidor. Contacte o suporte';
      } else if (errorMessage.includes('subscription')) {
        userMessage = 'Falha ao registrar notificações. Verifique sua conexão de internet';
      }
      
      toast({
        title: "❌ Erro ao ativar notificações",
        description: userMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testLocalNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('🧪 Teste Vendzz iOS', {
        body: 'Esta é uma notificação de teste local',
        icon: '/vendzz-logo-official.png',
        tag: 'test-local',
        requireInteraction: true
      });
    }
  };

  const resetSystem = async () => {
    setIsLoading(true);
    try {
      // Reset completo
      const registration = await navigator.serviceWorker.getRegistration('/');
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }
      
      setIsSubscribed(false);
      setLastError('');
      setDebugInfo('Sistema resetado');
      
      toast({
        title: "🔄 Sistema resetado",
        description: "Tente ativar novamente",
      });
    } catch (error) {
      console.error('Erro ao resetar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const env = detectEnvironment();

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <BellIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">
            Vendzz PWA iOS - Versão Otimizada
          </h1>
          <p className="text-gray-600 mt-2">
            Solução definitiva para PWAs instalados via "Adicionar aos Favoritos"
          </p>
        </div>

        <div className="grid gap-6">
          {/* Status do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SmartphoneIcon className="h-5 w-5" />
                Diagnóstico Completo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div><strong>Dispositivo:</strong> {env.isIOS ? 'iOS ✅' : 'Não iOS ❌'}</div>
                <div><strong>App PWA:</strong> {env.isPWAInstalled ? 'Instalado ✅' : 'Browser ⚠️'}</div>
                <div><strong>Suporte Push:</strong> {isSupported ? 'Disponível ✅' : 'Não disponível ❌'}</div>
                <div><strong>Permissão:</strong> 
                  <span className={permission === 'granted' ? 'text-green-600' : 'text-red-600'}>
                    {' ' + permission}
                  </span>
                </div>
                {debugInfo && <div><strong>Debug:</strong> {debugInfo}</div>}
              </div>

              {lastError && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <strong className="text-red-700">Último erro:</strong>
                  <p className="text-red-600 text-sm mt-1">{lastError}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Controles */}
          <Card>
            <CardHeader>
              <CardTitle>Configuração PWA iOS</CardTitle>
              <CardDescription>
                {env.isPWAInstalled 
                  ? '✅ PWA instalado detectado - Notificações funcionarão na tela de bloqueio'
                  : '⚠️ Para notificações na tela de bloqueio, você DEVE usar "Adicionar à Tela de Início" (não favoritos)'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isSubscribed ? (
                <Button
                  onClick={subscribeToNotifications}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={!isSupported || isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                      Configurando...
                    </>
                  ) : (
                    <>
                      <BellIcon className="h-4 w-4 mr-2" />
                      Ativar Notificações PWA iOS
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="text-green-600 text-center py-4">
                    <CheckCircleIcon className="h-8 w-8 mx-auto mb-2" />
                    <strong>🎉 Notificações PWA iOS Ativas!</strong>
                    <p className="text-sm text-gray-600 mt-1">
                      Aparecerão na tela de bloqueio mesmo com app fechado
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={testLocalNotification}
                      variant="outline"
                      size="sm"
                    >
                      🧪 Teste Local
                    </Button>
                    
                    <Button
                      onClick={resetSystem}
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                    >
                      🔄 Reset
                    </Button>
                  </div>
                </div>
              )}

              {!env.isPWAInstalled && env.isIOS && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <strong className="text-orange-700">⚠️ Limitação Safari:</strong>
                  <p className="text-orange-600 text-sm mt-1">
                    Safari comum só permite notificações básicas. Para notificações persistentes 
                    na tela de bloqueio (mesmo com app fechado), você deve instalar como PWA usando 
                    "Adicionar à Tela de Início".
                  </p>
                </div>
              )}

              {(!isSupported || !env.isIOS) && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <strong className="text-yellow-700">⚠️ Aviso:</strong>
                  <p className="text-yellow-600 text-sm mt-1">
                    {!env.isIOS 
                      ? 'Este sistema é otimizado para dispositivos iOS'
                      : 'Push notifications não suportadas neste browser'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instruções Críticas */}
          {env.isIOS && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-800">
                  ⚠️ IMPORTANTE: Para notificações na tela de bloqueio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-green-700 mb-2">
                    ✅ CORRETO: "Adicionar à Tela de Início" (PWA)
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>No Safari, toque no botão compartilhar (quadrado com seta ↗️)</li>
                    <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></li>
                    <li>Toque em "Adicionar" no canto superior direito</li>
                    <li>Feche o Safari e abra o ícone que apareceu na tela de início</li>
                    <li>Retorne a esta página e ative as notificações</li>
                  </ol>
                  <p className="text-green-600 text-xs mt-2">
                    ✅ Cria um app real que recebe notificações na tela de bloqueio
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-700 mb-2">
                    ❌ NÃO FUNCIONA: "Adicionar aos Favoritos" (Bookmark)
                  </h3>
                  <p className="text-sm text-red-600">
                    Apenas salva um link nos favoritos. NÃO permite notificações push na tela de bloqueio.
                    Funciona apenas como página web normal no Safari.
                  </p>
                </div>

                {!env.isPWAInstalled && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <strong className="text-blue-700">📍 Status atual:</strong>
                    <p className="text-blue-600 text-sm">
                      Você está acessando via Safari (não PWA instalado). 
                      Para notificações na tela de bloqueio, siga as instruções acima.
                    </p>
                  </div>
                )}

                {env.isPWAInstalled && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <strong className="text-green-700">🎉 Perfeito!</strong>
                    <p className="text-green-600 text-sm">
                      PWA detectado! Você está no app instalado. 
                      Notificações funcionarão na tela de bloqueio.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}