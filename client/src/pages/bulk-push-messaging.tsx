import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Users, Bell, MessageSquare, Zap, ArrowLeft, Music, Volume2 } from 'lucide-react';

// Declarações TypeScript globais para sistema de áudio
declare global {
  interface Window {
    ModernSaleSound: any;
    soundSystem: any;
    playNotificationSound: any;
  }
}

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
  const [messageType, setMessageType] = useState('unique'); // 'unique', 'rotating', 'priority'
  const [stats, setStats] = useState<BulkMessageStats>({
    totalUsers: 0,
    messagesSent: 0,
    successRate: 0,
    isLoading: false
  });
  const { toast } = useToast();

  // Carregar sistema de áudio moderno
  useEffect(() => {
    const loadAudioSystem = async () => {
      try {
        // Verificar se já existe
        if (window.soundSystem) {
          console.log('🔊 Sistema de som já carregado');
          return;
        }

        console.log('🔊 Carregando sistema de som...');
        const script = document.createElement('script');
        script.src = '/sounds/sale-notification.js?' + Date.now();
        script.async = true;
        
        script.onload = () => {
          console.log('✅ Script de som carregado');
          if (window.ModernSaleSound) {
            window.soundSystem = new window.ModernSaleSound();
            console.log('✅ Sistema de som inicializado');
          } else {
            console.warn('❌ ModernSaleSound não encontrado');
          }
        };
        
        script.onerror = (error) => {
          console.error('❌ Erro ao carregar script de som:', error);
        };
        
        document.head.appendChild(script);
        
        // Timeout como fallback
        setTimeout(() => {
          if (!window.soundSystem && window.ModernSaleSound) {
            window.soundSystem = new window.ModernSaleSound();
            console.log('✅ Sistema de som inicializado via timeout');
          }
        }, 2000);
        
      } catch (error) {
        console.error('❌ Erro geral no carregamento de som:', error);
      }
    };

    loadAudioSystem();
  }, []);

  // Função para testar som
  const testSound = async (soundType: string) => {
    console.log(`🔊 Testando som: ${soundType}`);
    try {
      if (window.soundSystem) {
        switch(soundType) {
          case 'sale':
            await window.soundSystem.playModernSaleSound();
            break;
          case 'subtle':
            await window.soundSystem.playSubtlePing();
            break;
          case 'energetic':
            await window.soundSystem.playEnergeticSuccess();
            break;
          default:
            await window.soundSystem.playModernSaleSound();
        }
        console.log(`✅ Som ${soundType} reproduzido com sucesso`);
        toast({
          title: `🔊 Som Testado!`,
          description: `Som ${soundType === 'sale' ? 'Venda Moderna' : soundType === 'subtle' ? 'Suave' : 'Energético'} reproduzido com sucesso`,
        });
      } else {
        console.warn('❌ Sistema de áudio não carregado');
        toast({
          title: "Erro de Áudio",
          description: "Sistema de som não está carregado. Recarregue a página.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao reproduzir som:', error);
      toast({
        title: "Erro de Áudio",
        description: "Não foi possível reproduzir o som. Verifique se o áudio está habilitado.",
        variant: "destructive",
      });
    }
  };

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
          const registration = await navigator.serviceWorker.register('/sw-simple.js?' + Date.now());
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
          
          // ENVIAR MENSAGEM BASEADA NO TIPO
          console.log(`📤 Enviando mensagem ${messageType}...`);
          
          let requestBody;
          if (messageType === 'rotating') {
            // Mensagens rotativas predefinidas
            const rotatingMessages = [
              { title: '🔥 Promoção Especial!', message: 'Oferta limitada disponível agora - não perca!' },
              { title: '📱 Nova Atualização', message: 'Sistema atualizado com novas funcionalidades' },
              { title: '✨ Descubra Novidades', message: 'Explore as últimas funcionalidades do Vendzz' },
              { title: '🚀 Performance Melhorada', message: 'Sistema 3x mais rápido e eficiente' }
            ];
            const randomMessage = rotatingMessages[Math.floor(Math.random() * rotatingMessages.length)];
            requestBody = { 
              title: randomMessage.title, 
              message: randomMessage.message,
              type: 'rotating'
            };
          } else {
            requestBody = { 
              title: title, 
              message: message,
              type: messageType
            };
          }
          
          const response = await fetch('/api/push-simple/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });
          const result = await response.json();
          console.log('📤 Resultado final:', result);
          
          setStats({
            totalUsers: result.stats?.total || 0,
            messagesSent: result.stats?.success || 0,
            successRate: result.stats?.total ? ((result.stats.success / result.stats.total) * 100) : 0,
            isLoading: false
          });
          
          // Reproduzir som de sucesso se estiver habilitado
          if (soundEnabled && window.soundSystem) {
            try {
              await testSound(soundType);
            } catch (error) {
              console.warn('❌ Erro ao reproduzir som de sucesso:', error);
            }
          }
          
          const messageTypeText = messageType === 'unique' ? 'Única' : 
                                messageType === 'rotating' ? 'Rotativa' : 'Prioritária';
          const soundTypeText = soundType === 'sale' ? 'Venda Moderna' : 
                               soundType === 'subtle' ? 'Suave' : 'Energético';

          toast({
            title: soundEnabled ? `🔥 Mensagem ${messageTypeText} + Som Enviado!` : `Mensagem ${messageTypeText} Enviada!`,
            description: `Enviado para ${result.stats?.success || 0} dispositivos${soundEnabled ? ` (Som ${soundTypeText})` : ''}`,
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

        {/* Sound Controls - FORÇANDO RELOAD DE CACHE */}
        <Card className="border-2 border-purple-500 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Music className="w-6 h-6 text-purple-600" />
              🔊 SISTEMA DE SOM 2025 - ATIVO
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
                  onClick={() => testSound(soundType)}
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
              Escolha o tipo de mensagem e configure o conteúdo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tipo de Mensagem - SISTEMA ROTATIVO ATIVO */}
            <div className="border-2 border-green-500 p-4 rounded-lg">
              <label className="text-lg font-bold mb-3 block text-green-700">🔄 SISTEMA MULTI-MENSAGEM ATIVO</label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={messageType === 'unique' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMessageType('unique')}
                  className={messageType === 'unique' ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  📝 Mensagem Única
                </Button>
                <Button
                  variant={messageType === 'rotating' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMessageType('rotating')}
                  className={messageType === 'rotating' ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  🔄 Mensagem Rotativa
                </Button>
                <Button
                  variant={messageType === 'priority' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMessageType('priority')}
                  className={messageType === 'priority' ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  ⚡ Mensagem Prioritária
                </Button>
              </div>
            </div>

            {messageType === 'unique' && (
              <>
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
              </>
            )}

            {messageType === 'rotating' && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">🔄 Sistema de Mensagem Rotativa</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  O sistema enviará mensagens diferentes alternadamente para maximizar engagement. 
                  Mensagens pré-configuradas: Promoções, Updates, Novidades, Alertas.
                </p>
                <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border">
                  <p className="text-xs text-gray-600 dark:text-gray-400"><strong>Exemplo:</strong></p>
                  <p className="text-sm">🔥 Promoção especial disponível!</p>
                  <p className="text-sm">📱 Nova atualização do sistema</p>
                  <p className="text-sm">✨ Descubra as novidades</p>
                </div>
              </div>
            )}

            {messageType === 'priority' && (
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">⚡ Sistema de Mensagem Prioritária</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                  Mensagens urgentes com som diferenciado e visual destacado. Ideal para comunicações críticas.
                </p>
                <div>
                  <label className="text-sm font-medium mb-2 block text-purple-700 dark:text-purple-300">Título Prioritário</label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="🚨 URGENTE: Título da mensagem prioritária..."
                    className="font-medium border-purple-300 focus:border-purple-500"
                  />
                </div>
                <div className="mt-3">
                  <label className="text-sm font-medium mb-2 block text-purple-700 dark:text-purple-300">Conteúdo Prioritário</label>
                  <Textarea 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mensagem crítica que requer atenção imediata dos usuários..."
                    rows={3}
                    className="resize-none border-purple-300 focus:border-purple-500"
                  />
                </div>
              </div>
            )}
            
            {/* Preview da Notificação */}
            {messageType === 'unique' && (
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
            )}

            {messageType === 'priority' && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-200">🚨 Preview - Notificação Prioritária</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      <strong>{title}</strong>
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <Button 
              onClick={sendBulkPushMessage} 
              disabled={isLoading || (messageType !== 'rotating' && (!title.trim() || !message.trim()))}
              className={`w-full text-white ${
                messageType === 'unique' ? 'bg-blue-600 hover:bg-blue-700' :
                messageType === 'rotating' ? 'bg-green-600 hover:bg-green-700' :
                'bg-purple-600 hover:bg-purple-700'
              }`}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  {messageType === 'rotating' ? 'Ativando Rotativas...' : 'Enviando...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {messageType === 'unique' ? 'Enviar Mensagem Única' :
                   messageType === 'rotating' ? 'Ativar Mensagens Rotativas' :
                   'Enviar Mensagem Prioritária'}
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