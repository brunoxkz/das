import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function iOSPushTestFinal() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [stats, setStats] = useState({ total: 0, recent: 0 });
  const { toast } = useToast();

  useEffect(() => {
    // Verificar suporte a push notifications
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    // Verificar se é PWA standalone (iOS)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone;
    setIsStandalone(standalone);

    checkSubscriptionStatus();
    loadStats();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Erro ao verificar subscription:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/push-simple/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    }
  };

  const subscribeToNotifications = async () => {
    try {
      if (!isSupported) {
        toast({
          title: "Não Suportado",
          description: "Push notifications não são suportadas neste dispositivo",
          variant: "destructive",
        });
        return;
      }

      // Registrar service worker
      const registration = await navigator.serviceWorker.register('/sw-simple.js');
      await navigator.serviceWorker.ready;

      // Obter VAPID public key
      const vapidResponse = await fetch('/api/push-simple/vapid');
      const { publicKey } = await vapidResponse.json();

      // Criar subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });

      // Salvar no servidor
      const response = await fetch('/api/push-simple/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });

      if (response.ok) {
        setIsSubscribed(true);
        loadStats();
        toast({
          title: "🔔 Ativado!",
          description: "Push notifications ativadas para iOS PWA",
        });
      } else {
        throw new Error('Erro ao salvar subscription');
      }

    } catch (error) {
      console.error('Erro ao ativar notificações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível ativar as notificações",
        variant: "destructive",
      });
    }
  };

  const testNotification = async () => {
    try {
      const response = await fetch('/api/push-simple/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '🎉 Teste iOS PWA',
          message: 'Notificação chegou na tela de bloqueio! Sistema funcionando 100%'
        })
      });

      if (response.ok) {
        toast({
          title: "📱 Enviado!",
          description: "Verifique a tela de bloqueio do seu iPhone",
        });
      } else {
        throw new Error('Erro no envio');
      }
    } catch (error) {
      console.error('Erro ao testar:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar notificação de teste",
        variant: "destructive",
      });
    }
  };

  const triggerQuizCompletion = async () => {
    try {
      const response = await fetch('/api/quizzes/QEEjFDntXwE-iptFeGIqO/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses: [
            {
              elementFieldId: "nome_completo",
              value: "TESTE NOTIFICAÇÃO AUTOMÁTICA iOS",
              pageId: "page1"
            }
          ],
          metadata: {
            isPartial: false,
            completedAt: new Date().toISOString(),
            totalPages: 1,
            completionPercentage: 100,
            timeSpent: 15000,
            isComplete: true,
            leadData: {
              source: "ios_push_test_final",
              campaign: "automatic_notification"
            }
          }
        })
      });

      if (response.ok) {
        toast({
          title: "🎯 Quiz Completado!",
          description: "Notificação automática enviada. Verifique a tela de bloqueio.",
        });
      } else {
        throw new Error('Erro ao completar quiz');
      }
    } catch (error) {
      console.error('Erro ao completar quiz:', error);
      toast({
        title: "Erro",
        description: "Erro ao simular quiz completion",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🍎 iOS Push Notifications - Teste Final
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sistema completamente funcional com fallback automático
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Device Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📱 Status do Dispositivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Push Notifications Suportadas:</span>
                <Badge variant={isSupported ? "default" : "destructive"}>
                  {isSupported ? "✅ Sim" : "❌ Não"}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span>PWA Mode (iOS Standalone):</span>
                <Badge variant={isStandalone ? "default" : "secondary"}>
                  {isStandalone ? "✅ Ativo" : "📱 Safari"}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Notifications Ativas:</span>
                <Badge variant={isSubscribed ? "default" : "outline"}>
                  {isSubscribed ? "🔔 Ativadas" : "🔕 Inativas"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Subscriptions:</span>
                <Badge variant="outline">{stats.total}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Últimas 24h:</span>
                <Badge variant="outline">{stats.recent}</Badge>
              </div>
              
              <Button 
                onClick={loadStats} 
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                🔄 Atualizar Stats
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        {!isStandalone && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardHeader>
              <CardTitle className="text-orange-800 dark:text-orange-200">
                📋 Como Usar no iOS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-orange-700 dark:text-orange-300">
                <li>Abra esta página no <strong>Safari do iOS</strong></li>
                <li>Toque no botão de <strong>Compartilhar</strong> (⬆️)</li>
                <li>Selecione <strong>"Adicionar à Tela de Início"</strong></li>
                <li>Abra o app <strong>Vendzz</strong> da tela de início</li>
                <li>Retorne a esta página e ative as notificações</li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Testes de Notificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {!isSubscribed ? (
              <Button 
                onClick={subscribeToNotifications}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                🔔 Ativar Push Notifications
              </Button>
            ) : (
              <div className="space-y-3">
                <Button 
                  onClick={testNotification}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  📱 Teste Manual (Tela de Bloqueio)
                </Button>
                
                <Button 
                  onClick={triggerQuizCompletion}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="lg"
                >
                  🎯 Simular Quiz Completion (Automático)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>🔧 Detalhes Técnicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>✅ Sistema de Fallback:</strong> ios-pwa-user → admin-user-id</p>
              <p><strong>✅ Logs Detalhados:</strong> Backend rastreia envio e recebimento</p>
              <p><strong>✅ Service Worker:</strong> sw-simple.js otimizado para iOS</p>
              <p><strong>✅ Apple Push:</strong> Integração direta com web.push.apple.com</p>
              <p><strong>✅ Persistência:</strong> Notificações funcionam com app fechado</p>
              <p><strong>✅ Tela de Bloqueio:</strong> Compatible com iOS 13+ lock screen</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}