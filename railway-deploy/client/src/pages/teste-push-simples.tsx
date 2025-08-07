import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Bell, Send, Smartphone, Users } from 'lucide-react';

export default function TesteSimplesPush() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('Olá! Teste do Vendzz');
  const [notificationBody, setNotificationBody] = useState('Esta é uma notificação de teste para o seu dispositivo!');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Ativar notificações push
  const ativarNotificacoes = async () => {
    setIsLoading(true);
    try {
      // 1. Verificar se Service Worker está disponível
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        toast({
          title: "Erro",
          description: "Seu navegador não suporta push notifications",
          variant: "destructive"
        });
        return;
      }

      // 2. Registrar Service Worker
      const registration = await navigator.serviceWorker.register('/vendzz-notification-sw.js');
      console.log('✅ Service Worker registrado:', registration);

      // 3. Solicitar permissão
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast({
          title: "Permissão negada",
          description: "Você precisa permitir notificações para continuar",
          variant: "destructive"
        });
        return;
      }

      // 4. Obter chave VAPID
      const vapidResponse = await fetch('/api/push-vapid-key');
      const vapidData = await vapidResponse.json();

      // 5. Criar subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidData.publicKey
      });

      // 6. Enviar subscription para servidor
      const subscribeResponse = await apiRequest('POST', '/api/push-subscribe-public', {
        subscription,
        userId: `teste-user-${Date.now()}`,
        userAgent: navigator.userAgent,
        deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop'
      });

      if (subscribeResponse.ok) {
        setIsSubscribed(true);
        toast({
          title: "Sucesso!",
          description: "Notificações ativadas! Agora você pode receber mensagens.",
        });
      } else {
        throw new Error('Erro ao registrar no servidor');
      }

    } catch (error: any) {
      console.error('Erro ao ativar notificações:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao ativar notificações",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar notificação de teste
  const enviarTeste = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/push-notifications/admin/broadcast', {
        title: notificationTitle,
        body: notificationBody,
        url: '/app-pwa-vendzz',
        icon: '/logo-vendzz-white.png',
        badge: '/logo-vendzz-white.png',
        requireInteraction: true,
        silent: false
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Notificação enviada!",
          description: `Enviada para ${data.sentTo} dispositivos (${data.failed} falharam)`,
        });
      } else {
        toast({
          title: "Erro no envio",
          description: data.message || "Falha ao enviar notificação",
          variant: "destructive"
        });
      }

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha na comunicação",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
            <Bell className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Teste Push Notifications</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Sistema simplificado para testar notificações push no seu dispositivo
        </p>
      </div>

      {/* Passo 1: Ativar Notificações */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Passo 1: Ativar Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSubscribed ? (
            <>
              <p className="text-gray-600">
                Primeiro, você precisa ativar as notificações push no seu dispositivo.
              </p>
              <Button 
                onClick={ativarNotificacoes} 
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'Ativando...' : 'Ativar Notificações Push'}
              </Button>
            </>
          ) : (
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-green-700 font-medium">
                ✅ Notificações ativadas com sucesso!
              </p>
              <p className="text-green-600 text-sm">
                Agora você pode receber notificações neste dispositivo
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Passo 2: Enviar Teste */}
      {isSubscribed && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Passo 2: Enviar Notificação de Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da Notificação</Label>
              <Input
                id="title"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                placeholder="Digite o título..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="body">Mensagem</Label>
              <Input
                id="body"
                value={notificationBody}
                onChange={(e) => setNotificationBody(e.target.value)}
                placeholder="Digite a mensagem..."
              />
            </div>

            <Button 
              onClick={enviarTeste}
              disabled={isLoading || !notificationTitle.trim() || !notificationBody.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Enviando...' : 'Enviar Notificação de Teste'}
            </Button>
            
            <p className="text-sm text-gray-500 text-center">
              A notificação aparecerá na tela do seu dispositivo e na tela de bloqueio
            </p>
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Como Funciona
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <p><strong>Ative as notificações</strong> - Seu dispositivo será registrado no sistema</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <p><strong>Envie um teste</strong> - A notificação chegará em todos os dispositivos conectados</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-purple-100 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <p><strong>Funciona offline</strong> - Mesmo com o app fechado, você recebe as notificações</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}