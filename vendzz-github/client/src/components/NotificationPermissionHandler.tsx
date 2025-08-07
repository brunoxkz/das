import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, X } from 'lucide-react';

interface NotificationPermissionHandlerProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

export default function NotificationPermissionHandler({ 
  onPermissionGranted, 
  onPermissionDenied 
}: NotificationPermissionHandlerProps) {
  const [showRequest, setShowRequest] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verificar suporte a notificações
    if ('Notification' in window) {
      setIsSupported(true);
      setPermissionStatus(Notification.permission);
      
      // Mostrar request apenas se permission for 'default' e for PWA
      const isPWA = window.matchMedia('(display-mode: standalone)').matches;
      if (Notification.permission === 'default' && isPWA) {
        // Delay para mostrar após login
        setTimeout(() => {
          setShowRequest(true);
        }, 2000);
      }
    } else {
      console.log('🔔 Notificações não suportadas neste dispositivo');
      setIsSupported(false);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      console.log('🔔 Notificações não suportadas');
      return;
    }

    try {
      // Método específico para iOS Safari/PWA
      let permission: NotificationPermission;
      
      if ('Notification' in window && typeof Notification.requestPermission === 'function') {
        if (Notification.requestPermission.length) {
          // Versão callback (iOS Safari)
          permission = await new Promise((resolve) => {
            Notification.requestPermission((result) => {
              resolve(result);
            });
          });
        } else {
          // Versão Promise (navegadores modernos)
          permission = await Notification.requestPermission();
        }
      } else {
        console.log('🔔 Método requestPermission não disponível');
        return;
      }

      setPermissionStatus(permission);
      setShowRequest(false);

      if (permission === 'granted') {
        console.log('🔔 Permissão de notificação concedida');
        onPermissionGranted?.();
        
        // Testar notificação
        new Notification('Vendzz - Notificações ativadas!', {
          body: 'Você receberá notificações sobre suas campanhas.',
          icon: '/vendzz-logo-official.png',
          badge: '/vendzz-logo-official.png',
          tag: 'welcome',
          requireInteraction: false
        });
      } else {
        console.log('🔔 Permissão de notificação negada');
        onPermissionDenied?.();
      }
    } catch (error) {
      console.error('🔔 Erro ao solicitar permissão:', error);
      setShowRequest(false);
    }
  };

  const dismiss = () => {
    setShowRequest(false);
    onPermissionDenied?.();
  };

  // Não mostrar se não for suportado ou se já foi concedida/negada
  if (!isSupported || !showRequest || permissionStatus !== 'default') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-green-500/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Ativar Notificações</h3>
                <p className="text-gray-400 text-sm">Vendzz Mobile</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismiss}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-gray-300 text-sm mb-6">
            Receba notificações em tempo real sobre suas campanhas, leads e atualizações importantes.
          </p>

          <div className="flex gap-3">
            <Button
              onClick={dismiss}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Agora não
            </Button>
            <Button
              onClick={requestPermission}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              Ativar
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-3 text-center">
            Você pode alterar isso nas configurações do navegador
          </p>
        </CardContent>
      </Card>
    </div>
  );
}