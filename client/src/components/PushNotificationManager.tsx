/**
 * VENDZZ PWA PUSH NOTIFICATION MANAGER
 * Gerencia notificações push que funcionam mesmo com app fechado
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationState {
  supported: boolean;
  granted: boolean;
  subscribed: boolean;
  loading: boolean;
}

export function PushNotificationManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<NotificationState>({
    supported: false,
    granted: false,
    subscribed: false,
    loading: false
  });

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setState(prev => ({ ...prev, supported: true }));
      checkSubscriptionStatus();
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    try {
      const permission = Notification.permission;
      const granted = permission === 'granted';
      
      let subscribed = false;
      if (granted && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        subscribed = !!subscription;
      }

      setState(prev => ({ ...prev, granted, subscribed }));
    } catch (error) {
      console.error('❌ Erro ao verificar status de subscription:', error);
    }
  };

  const requestPermission = async () => {
    if (!state.supported) {
      toast({
        title: "Não Suportado",
        description: "Seu navegador não suporta notificações push",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        await subscribeUser();
        setState(prev => ({ ...prev, granted: true, subscribed: true }));
        
        toast({
          title: "🔔 Notificações Ativadas!",
          description: "Você receberá alertas sobre novos leads e campanhas"
        });
      } else {
        toast({
          title: "Permissão Negada",
          description: "Para receber notificações, ative nas configurações do navegador",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível ativar as notificações",
        variant: "destructive"
      });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const subscribeUser = async () => {
    try {
      // Obter VAPID public key do servidor
      const vapidResponse = await fetch('/api/notifications/vapid-key');
      const { publicKey } = await vapidResponse.json();

      // Aguardar service worker estar pronto
      const registration = await navigator.serviceWorker.ready;

      // Criar subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // Salvar subscription no servidor
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subscription })
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar subscription');
      }

      console.log('✅ Push subscription salva com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar subscription:', error);
      throw error;
    }
  };

  const unsubscribe = async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      // Informar servidor
      const token = localStorage.getItem('accessToken');
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setState(prev => ({ ...prev, subscribed: false }));
      
      toast({
        title: "🔕 Notificações Desativadas",
        description: "Você não receberá mais notificações push"
      });
    } catch (error) {
      console.error('❌ Erro ao desinscrever:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desativar as notificações",
        variant: "destructive"
      });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const sendTestNotification = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "🧪 Teste Enviado",
          description: "Verifique se a notificação chegou (pode levar alguns segundos)"
        });
      } else {
        toast({
          title: "Erro no Teste",
          description: "Não foi possível enviar notificação de teste",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao enviar teste:', error);
    }
  };

  // Função helper para converter VAPID key
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

  if (!state.supported) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">Notificações não suportadas neste navegador</span>
      </div>
    );
  }

  if (!state.granted) {
    return (
      <Button 
        onClick={requestPermission}
        disabled={state.loading}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Bell className="w-4 h-4" />
        {state.loading ? 'Ativando...' : 'Ativar Notificações'}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {state.subscribed ? (
        <>
          <div className="flex items-center gap-2 text-green-600">
            <Check className="w-4 h-4" />
            <span className="text-sm">Notificações Ativas</span>
          </div>
          
          <div className="flex gap-1">
            <Button 
              onClick={sendTestNotification}
              variant="outline"
              size="sm"
            >
              Teste
            </Button>
            
            <Button 
              onClick={unsubscribe}
              disabled={state.loading}
              variant="outline"
              size="sm"
            >
              <BellOff className="w-4 h-4" />
            </Button>
          </div>
        </>
      ) : (
        <Button 
          onClick={subscribeUser}
          disabled={state.loading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Bell className="w-4 h-4" />
          {state.loading ? 'Conectando...' : 'Ativar Push'}
        </Button>
      )}
    </div>
  );
}

export default PushNotificationManager;