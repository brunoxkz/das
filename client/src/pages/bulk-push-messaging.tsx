import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Users, Bell, MessageSquare, Zap, ArrowLeft, Music, Volume2 } from 'lucide-react';

interface BulkMessageStats {
  totalUsers: number;
  messagesSent: number;
  successRate: number;
  isLoading: boolean;
}

export default function BulkPushMessaging() {
  const [title, setTitle] = useState('🔥 Mensagem do Sistema Vendzz');
  const [message, setMessage] = useState('Nova funcionalidade disponível! Acesse agora o sistema 📱');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundType, setSoundType] = useState('sale');
  const [stats, setStats] = useState<BulkMessageStats>({
    totalUsers: 0,
    messagesSent: 0,
    successRate: 0,
    isLoading: false
  });
  const { toast } = useToast();

  // Carregar sistema de áudio moderno
  useEffect(() => {
    const loadAudioSystem = () => {
      const script = document.createElement('script');
      script.src = '/sounds/sale-notification.js';
      script.onload = () => {
        console.log('🔊 Sistema de áudio moderno carregado');
      };
      script.onerror = () => {
        console.warn('❌ Erro ao carregar sistema de áudio');
      };
      document.head.appendChild(script);
    };

    loadAudioSystem();
  }, []);

  // LÓGICA EXATA DO BOTÃO "TESTAR PUSH" DO DASHBOARD - NÃO MODIFICAR
  const sendBulkPushMessage = async () => {
    console.log('🔵 BULK PUSH CLICADO - BASEADO NO TESTE PUSH');
    console.log('📍 Status atual:', {
      permission: Notification.permission,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasPushManager: 'PushManager' in window
    });
    
    setIsLoading(true);
    
    try {
      if (Notification.permission === 'granted') {
        console.log('✅ Permissão já concedida, verificando/configurando subscription...');
        
        // Registrar service worker se necessário - EXATAMENTE COMO NO DASHBOARD
        const registration = await navigator.serviceWorker.register('/sw-simple.js');
        console.log('🔧 Service Worker verificado/registrado');
        
        // Obter VAPID key - EXATAMENTE COMO NO DASHBOARD
        const vapidResponse = await fetch('/api/push-simple/vapid');
        const { publicKey: vapidPublicKey } = await vapidResponse.json();
        console.log('🔑 VAPID key obtida para subscription');
        
        // Criar subscription REAL - EXATAMENTE COMO NO DASHBOARD
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey
        });
        console.log('📝 Subscription REAL criada:', {
          endpoint: subscription.endpoint.substring(0, 50) + '...',
          keys: subscription.toJSON().keys
        });
        
        // Salvar subscription no servidor - EXATAMENTE COMO NO DASHBOARD
        const subscribeResponse = await fetch('/api/push-simple/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: subscription.toJSON() })
        });
        const subscribeResult = await subscribeResponse.json();
        console.log('💾 Subscription salva no servidor:', subscribeResult);
        
        // ENVIAR MENSAGEM CUSTOMIZADA PARA TODOS - USANDO MESMA LÓGICA
        console.log('📤 Enviando push notification BULK...');
        const response = await fetch('/api/push-simple/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: title, 
            message: message 
          })
        });
        const result = await response.json();
        console.log('📤 Resposta do servidor BULK:', result);
        
        setStats({
          totalUsers: result.stats?.total || 0,
          messagesSent: result.stats?.success || 0,
          successRate: result.stats?.total ? ((result.stats.success / result.stats.total) * 100) : 0,
          isLoading: false
        });
        
        // REPRODUZIR SOM MODERNO DE VENDA 2025
        if (soundEnabled && window.playNotificationSound) {
          await window.playNotificationSound(soundType);
          console.log('🔊 Som de venda reproduzido:', soundType);
        }
        
        toast({
          title: "🔥 Push + Som Enviado!",
          description: `Enviado para ${result.stats?.success || 0} dispositivos com som ${soundType}`,
        });
        
      } else if (Notification.permission === 'default') {
        console.log('❓ Solicitando permissões...');
        const permission = await Notification.requestPermission();
        console.log('📱 Resultado da permissão:', permission);
        
        if (permission === 'granted') {
          console.log('✅ Permissão concedida! Configurando service worker...');
          
          // Registrar service worker - EXATAMENTE COMO NO DASHBOARD
          const registration = await navigator.serviceWorker.register('/sw-simple.js');
          console.log('🔧 Service Worker registrado:', registration);
          
          // Obter VAPID key - EXATAMENTE COMO NO DASHBOARD
          const vapidResponse = await fetch('/api/push-simple/vapid');
          const { publicKey: vapidPublicKey } = await vapidResponse.json();
          console.log('🔑 VAPID key obtida:', vapidPublicKey?.substring(0, 20) + '...');
          
          // Criar subscription - EXATAMENTE COMO NO DASHBOARD
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidPublicKey
          });
          console.log('📝 Subscription criada:', subscription);
          
          // Enviar subscription para servidor - EXATAMENTE COMO NO DASHBOARD
          const subscribeResponse = await fetch('/api/push-simple/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: subscription.toJSON() })
          });
          const subscribeResult = await subscribeResponse.json();
          console.log('💾 Resultado subscribe:', subscribeResult);
          
          // ENVIAR MENSAGEM CUSTOMIZADA - MESMO ENDPOINT
          console.log('📤 Enviando primeira push após permissão...');
          const response = await fetch('/api/push-simple/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              title: title, 
              message: message 
            })
          });
          const result = await response.json();
          console.log('📤 Resultado final:', result);
          
          setStats({
            totalUsers: result.stats?.total || 0,
            messagesSent: result.stats?.success || 0,
            successRate: result.stats?.total ? ((result.stats.success / result.stats.total) * 100) : 0,
            isLoading: false
          });
          
          toast({
            title: "Mensagem Bulk Enviada!",
            description: `Permissão concedida e enviado para ${result.stats?.success || 0} dispositivos`,
          });
        } else {
          console.log('❌ Permissão negada');
          toast({
            title: "Permissão Negada",
            description: "É necessário permitir notificações para enviar mensagens",
            variant: "destructive",
          });
        }
      } else {
        console.log('❌ Permissão explicitamente negada');
        toast({
          title: "Notificações Bloqueadas",
          description: "Habilite as notificações nas configurações do navegador",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro no envio bulk:', error);
      toast({
        title: "Erro no Envio",
        description: "Erro ao enviar mensagens push",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-8 h-8 text-green-600" />
                Mensagens Bulk Push
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Envie mensagens personalizadas para todos os usuários instantaneamente
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <span className="text-sm font-medium text-green-600">Sistema Ativo</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalUsers}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Send className="w-4 h-4" />
                Mensagens Enviadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.messagesSent}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Taxa de Sucesso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.successRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-green-600">
                {isLoading ? 'Enviando...' : 'Pronto'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sound Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-600" />
              🔊 Configurações de Som Moderno 2025
            </CardTitle>
            <CardDescription>
              Configure o som que será reproduzido junto com as notificações push
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-green-600" />
                <span className="font-medium">Som de Venda Ativado</span>
              </div>
              <Button
                variant={soundEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={soundEnabled ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {soundEnabled ? "✓ Ativo" : "✗ Inativo"}
              </Button>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo de Som Moderno:
              </label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={soundType === 'sale' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSoundType('sale')}
                  className={soundType === 'sale' ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  🔥 Venda Moderna
                </Button>
                <Button
                  variant={soundType === 'subtle' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSoundType('subtle')}
                  className={soundType === 'subtle' ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  🔔 Suave
                </Button>
                <Button
                  variant={soundType === 'energetic' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSoundType('energetic')}
                  className={soundType === 'energetic' ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  ⚡ Energético
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.playNotificationSound && window.playNotificationSound(soundType)}
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  🎵 Testar Som
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Composer */}
        <Card>
          <CardHeader>
            <CardTitle>Compor Mensagem para Todos os Usuários</CardTitle>
            <CardDescription>
              Use a mesma lógica funcional do botão "Testar Push" para envio em massa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Título da Mensagem</label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="🔥 Título da sua mensagem..."
                className="font-medium"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Conteúdo da Mensagem</label>
              <Textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem aqui..."
                rows={4}
                className="resize-none"
              />
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Preview da Notificação</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    <strong>{title}</strong>
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    {message}
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={sendBulkPushMessage} 
              disabled={isLoading || !title.trim() || !message.trim()}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Enviando para Todos...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar para Todos os Usuários
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card>
          <CardHeader>
            <CardTitle>Como Funciona</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-xs font-semibold text-green-600">1</div>
                <div>
                  <strong>Lógica Idêntica:</strong> Usa exatamente a mesma configuração do botão "Testar Push" que já funciona perfeitamente.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">2</div>
                <div>
                  <strong>Service Worker:</strong> Registra /sw-simple.js automaticamente para garantir funcionamento.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-xs font-semibold text-purple-600">3</div>
                <div>
                  <strong>Endpoints:</strong> /api/push-simple/vapid, /api/push-simple/subscribe, /api/push-simple/send - mesmos endpoints funcionais.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center text-xs font-semibold text-orange-600">4</div>
                <div>
                  <strong>Mensagem Customizada:</strong> Permite personalizar título e conteúdo mantendo toda a funcionalidade.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}