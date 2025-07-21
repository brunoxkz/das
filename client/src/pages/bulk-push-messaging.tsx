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

// SISTEMA COMPLETO COM 10 SONS E EDIÇÃO ROTATIVA - CACHE CLEAR V5 - FORCE REBUILD TOTAL
export default function BulkPushMessaging() {
  console.log('🔥 BULK PUSH MESSAGING COMPONENTE CARREGANDO - V5');
  const [title, setTitle] = useState('🔥 Mensagem do Sistema Vendzz');
  const [message, setMessage] = useState('Nova funcionalidade disponível! Acesse agora o sistema 📱');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundType, setSoundType] = useState('sale');
  const [uniqueSoundType, setUniqueSoundType] = useState('sale');
  const [rotativeSoundType, setRotativeSoundType] = useState('cash');
  const [rotatingMessages, setRotatingMessages] = useState([
    { title: '🔥 Promoção Especial!', message: 'Oferta limitada disponível agora - não perca!' },
    { title: '📱 Nova Atualização', message: 'Sistema atualizado com novas funcionalidades' },
    { title: '✨ Descubra Novidades', message: 'Explore as últimas funcionalidades do Vendzz' },
    { title: '🚀 Performance Melhorada', message: 'Sistema 3x mais rápido e eficiente' }
  ]);
  const [messageType, setMessageType] = useState('unique'); // 'unique', 'rotating', 'priority'
  const [stats, setStats] = useState<BulkMessageStats>({
    totalUsers: 0,
    messagesSent: 0,
    successRate: 0,
    isLoading: false
  });
  
  // Sistema de Notificações Automáticas para Quiz Completions
  const [autoNotificationsEnabled, setAutoNotificationsEnabled] = useState(false);
  const [quizCompletionMessage, setQuizCompletionMessage] = useState({
    title: '🎉 Novo Quiz Completado!',
    message: 'Um usuário acabou de completar um quiz na plataforma Vendzz! 🚀'
  });
  const [quizCompletionSound, setQuizCompletionSound] = useState('achievement');
  const [lastQuizCompleted, setLastQuizCompleted] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Carregar sistema de áudio moderno com 10 sons
  useEffect(() => {
    const loadAudioSystem = async () => {
      try {
        if (window.playNotificationSound) {
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
            window.modernSaleSound = new window.ModernSaleSound();
            console.log('✅ Sistema de som inicializado com 10 opções');
          } else {
            console.warn('❌ ModernSaleSound não encontrado');
          }
        };
        
        script.onerror = (error) => {
          console.error('❌ Erro ao carregar script de som:', error);
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('❌ Erro ao inicializar sistema de som:', error);
      }
    };

    loadAudioSystem();

    // Carregar estatísticas iniciais
    fetchStats();
    
    // Carregar configurações de notificações automáticas
    loadAutoNotificationSettings();
  }, []);

  // Polling para detectar novos quiz completions
  useEffect(() => {
    if (!autoNotificationsEnabled) return;

    const checkForNewQuizCompletions = async () => {
      try {
        const response = await fetch('/api/quiz-completions/latest');
        const data = await response.json();
        
        if (data.latestCompletion && data.latestCompletion.id !== lastQuizCompleted) {
          console.log('🎉 Novo quiz completado detectado:', data.latestCompletion);
          
          // Atualizar último quiz completado
          setLastQuizCompleted(data.latestCompletion.id);
          
          // Enviar notificação automática
          await sendQuizCompletionNotification(data.latestCompletion);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar quiz completions:', error);
      }
    };

    // Verificar a cada 10 segundos
    const interval = setInterval(checkForNewQuizCompletions, 10000);
    
    // Verificação inicial
    checkForNewQuizCompletions();

    return () => clearInterval(interval);
  }, [autoNotificationsEnabled, lastQuizCompleted, quizCompletionMessage, quizCompletionSound]);

  // Função para testar som
  const testSound = async (soundTypeToTest: string) => {
    try {
      if (!soundEnabled) {
        toast({
          title: "Som Desabilitado",
          description: "Ative o sistema de som para testar",
          variant: "destructive",
        });
        return;
      }

      console.log(`🔊 Testando som: ${soundTypeToTest}`);
      
      // Tentar carregar o sistema de som se não estiver disponível
      if (!window.playNotificationSound) {
        console.log('🔄 Sistema de som não encontrado, recarregando...');
        const script = document.createElement('script');
        script.src = '/sounds/sale-notification.js';
        script.async = true;
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        
        // Aguardar um pouco para o sistema inicializar
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (window.playNotificationSound) {
        await window.playNotificationSound(soundTypeToTest);
        console.log(`✅ Som ${soundTypeToTest} reproduzido com sucesso`);
        
        toast({
          title: `🎵 Som ${getSoundTypeText(soundTypeToTest)}`,
          description: "Som reproduzido com sucesso!",
        });
      } else {
        // Fallback - criar som simples diretamente
        console.log('🔄 Usando fallback de som...');
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
        
        toast({
          title: `🎵 Som ${getSoundTypeText(soundTypeToTest)}`,
          description: "Som teste reproduzido (fallback)!",
        });
      }
    } catch (error) {
      console.error(`❌ Erro ao testar som ${soundTypeToTest}:`, error);
      toast({
        title: "Erro no Som",
        description: `Erro: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Buscar estatísticas do sistema
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/push-simple/stats');
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalUsers: data.totalSubscriptions || 0,
          messagesSent: data.totalSent || 0,
          successRate: data.successRate || 95.2,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
    }
  };

  // Carregar configurações de notificações automáticas
  const loadAutoNotificationSettings = async () => {
    try {
      const response = await fetch('/api/auto-notifications/settings');
      if (response.ok) {
        const settings = await response.json();
        setAutoNotificationsEnabled(settings.enabled || false);
        setQuizCompletionMessage(settings.quizCompletionMessage || quizCompletionMessage);
        setQuizCompletionSound(settings.quizCompletionSound || 'achievement');
        setLastQuizCompleted(settings.lastQuizCompleted || null);
      }
    } catch (error) {
      console.log('ℹ️ Configurações de notificações automáticas não encontradas, usando padrões');
    }
  };

  // Salvar configurações de notificações automáticas
  const saveAutoNotificationSettings = async () => {
    try {
      const settings = {
        enabled: autoNotificationsEnabled,
        quizCompletionMessage,
        quizCompletionSound,
        lastQuizCompleted
      };

      const response = await fetch('/api/auto-notifications/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast({
          title: "✅ Configurações Salvas",
          description: "Configurações de notificações automáticas atualizadas com sucesso",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
      toast({
        title: "❌ Erro ao Salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    }
  };

  // Enviar notificação automática de quiz completion
  const sendQuizCompletionNotification = async (quizCompletion: any) => {
    try {
      console.log('📤 Enviando notificação automática de quiz completion...');

      // Personalizar mensagem com dados do quiz
      const personalizedMessage = {
        title: quizCompletionMessage.title,
        message: quizCompletionMessage.message.replace(
          'Um usuário', 
          `Usuário (${quizCompletion.userEmail || 'anônimo'})`
        ).replace(
          'um quiz',
          `o quiz "${quizCompletion.quizTitle || 'sem título'}"`
        )
      };

      const response = await fetch('/api/push-simple/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: personalizedMessage.title,
          message: personalizedMessage.message,
          type: 'quiz-completion-auto',
          quizData: quizCompletion
        })
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Notificação automática enviada:', result);

        // Reproduzir som se habilitado
        if (soundEnabled && window.playNotificationSound) {
          try {
            await testSound(quizCompletionSound);
          } catch (error) {
            console.warn('❌ Erro ao reproduzir som automático:', error);
          }
        }

        toast({
          title: "🎉 Notificação Automática Enviada!",
          description: `Quiz completion notificado automaticamente para ${result.stats?.success || 0} usuários`,
        });

        // Atualizar estatísticas
        await fetchStats();
      }
    } catch (error) {
      console.error('❌ Erro ao enviar notificação automática:', error);
    }
  };

  // Enviar mensagem push
  const handleSendMessage = async () => {
    if (!title || !message) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e mensagem",
        variant: "destructive",
      });
      return;
    }

    if (messageType === 'rotating' && rotatingMessages.length === 0) {
      toast({
        title: "Sem mensagens rotativas",
        description: "Adicione pelo menos uma mensagem rotativa",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log(`📤 Enviando mensagem ${messageType}...`);
      
      let requestBody;
      if (messageType === 'rotating') {
        // Mensagens rotativas editáveis pelo usuário
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Mensagem enviada com sucesso:', result);
        
        // Atualizar estatísticas
        setStats({
          totalUsers: result.stats?.total || stats.totalUsers,
          messagesSent: (result.stats?.success || 0) + stats.messagesSent,
          successRate: result.stats?.total ? ((result.stats.success / result.stats.total) * 100) : 0,
          isLoading: false
        });
        
        // Reproduzir som de sucesso se estiver habilitado
        if (soundEnabled && window.playNotificationSound) {
          try {
            const selectedSoundType = messageType === 'unique' ? uniqueSoundType : 
                                      messageType === 'rotating' ? rotativeSoundType : soundType;
            await testSound(selectedSoundType);
          } catch (error) {
            console.warn('❌ Erro ao reproduzir som de sucesso:', error);
          }
        }
        
        const messageTypeText = messageType === 'unique' ? 'Única' : 
                              messageType === 'rotating' ? 'Rotativa' : 'Prioritária';
        const selectedSoundType = messageType === 'unique' ? uniqueSoundType : 
                                 messageType === 'rotating' ? rotativeSoundType : soundType;
        const soundTypeText = getSoundTypeText(selectedSoundType);

        toast({
          title: `🔥 Push + Som Enviado!`,
          description: `Mensagem ${messageTypeText} enviada com som ${soundTypeText} para ${result.stats?.success || 0} usuários`,
        });

        // Atualizar estatísticas
        await fetchStats();
        
      } else {
        throw new Error(result.error || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao Enviar",
        description: error instanceof Error ? error.message : "Erro desconhecido ao enviar mensagem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função auxiliar para obter texto do tipo de som
  const getSoundTypeText = (type: string) => {
    const soundNames: { [key: string]: string } = {
      'sale': 'Venda Moderna',
      'subtle': 'Suave',
      'energetic': 'Energético',
      'ios': 'iPhone',
      'android': 'Android',
      'messenger': 'WhatsApp',
      'cash': 'Cash Register',
      'jackpot': 'Jackpot',
      'ding': 'Ding',
      'game': 'Game Success'
    };
    return soundNames[type] || 'Desconhecido';
  };

  // Componente para seleção de som reutilizável
  const SoundSelector = ({ currentSoundType, onSoundTypeChange, label }: { 
    currentSoundType: string, 
    onSoundTypeChange: (type: string) => void,
    label: string 
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}:
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1">
        {[
          { key: 'sale', label: '🔥 Venda Moderna', color: 'bg-blue-600 hover:bg-blue-700' },
          { key: 'subtle', label: '🔔 Suave', color: 'bg-green-600 hover:bg-green-700' },
          { key: 'energetic', label: '⚡ Energético', color: 'bg-purple-600 hover:bg-purple-700' },
          { key: 'ios', label: '📱 iPhone', color: 'bg-gray-600 hover:bg-gray-700' },
          { key: 'android', label: '🤖 Android', color: 'bg-green-500 hover:bg-green-600' },
          { key: 'messenger', label: '💬 WhatsApp', color: 'bg-blue-500 hover:bg-blue-600' },
          { key: 'cash', label: '💰 Cash Register', color: 'bg-yellow-600 hover:bg-yellow-700' },
          { key: 'jackpot', label: '🎰 Jackpot', color: 'bg-red-600 hover:bg-red-700' },
          { key: 'ding', label: '🔔 Ding', color: 'bg-indigo-600 hover:bg-indigo-700' },
          { key: 'game', label: '🎮 Game Success', color: 'bg-pink-600 hover:bg-pink-700' }
        ].map(sound => (
          <Button
            key={sound.key}
            variant={currentSoundType === sound.key ? "default" : "outline"}
            size="sm"
            onClick={() => onSoundTypeChange(sound.key)}
            className={currentSoundType === sound.key ? sound.color : "text-xs"}
          >
            {sound.label}
          </Button>
        ))}
      </div>
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => testSound(currentSoundType)}
          className="border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold px-4"
        >
          🎵 Testar {getSoundTypeText(currentSoundType)}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4" key="bulk-push-v2025-final">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header - SISTEMA DE PUSH NOTIFICATIONS AVANÇADO */}
        <div className="text-center bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold mb-2">
            🔥 SISTEMA PUSH NOTIFICATIONS VENDZZ 2025 🔥
          </h1>
          <p className="text-green-100 text-lg">
            Sistema completo de notificações push com 10 sons diferentes + Edição rotativa funcional
          </p>
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
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">Ativo</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configurações Globais de Som */}
        <Card className="border-2 border-purple-500 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Music className="w-6 h-6 text-purple-600" />
              🔊 CONTROLE GLOBAL DE SOM - ATIVO
            </CardTitle>
            <CardDescription>
              Ativar ou desativar reprodução de som para todas as notificações push
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-green-600" />
                <span className="font-medium">Sistema de Som</span>
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
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {soundEnabled ? 
                'Sons serão reproduzidos automaticamente após envio das notificações (configuração individual por tipo de mensagem abaixo)' : 
                'Sons desabilitados - nenhum áudio será reproduzido'
              }
            </p>
          </CardContent>
        </Card>

        {/* Sistema de Notificações Automáticas para Quiz Completions */}
        <Card className="border-2 border-yellow-500 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="w-6 h-6 text-yellow-600" />
              🎉 NOTIFICAÇÕES AUTOMÁTICAS - QUIZ COMPLETIONS
            </CardTitle>
            <CardDescription>
              Sistema automático que dispara push notifications quando alguém completa um quiz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Toggle Ativar/Desativar */}
            <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-yellow-600" />
                <div>
                  <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Sistema Automático de Quiz Completions
                  </span>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {autoNotificationsEnabled ? 
                      'Monitorando quiz completions em tempo real (verifica a cada 10s)' : 
                      'Sistema desabilitado - não monitora quiz completions'
                    }
                  </p>
                </div>
              </div>
              <Button
                variant={autoNotificationsEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoNotificationsEnabled(!autoNotificationsEnabled)}
                className={autoNotificationsEnabled ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "border-yellow-500 text-yellow-600"}
              >
                {autoNotificationsEnabled ? "✓ Ativo" : "✗ Inativo"}
              </Button>
            </div>

            {/* Configuração da Mensagem de Quiz Completion */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">📝 Personalizar Mensagem de Quiz Completion</h4>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Título da Notificação</label>
                <Input 
                  value={quizCompletionMessage.title} 
                  onChange={(e) => setQuizCompletionMessage({
                    ...quizCompletionMessage,
                    title: e.target.value
                  })}
                  placeholder="🎉 Novo Quiz Completado!"
                  className="font-medium"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Mensagem da Notificação</label>
                <Textarea 
                  value={quizCompletionMessage.message} 
                  onChange={(e) => setQuizCompletionMessage({
                    ...quizCompletionMessage,
                    message: e.target.value
                  })}
                  placeholder="Um usuário acabou de completar um quiz na plataforma Vendzz! 🚀"
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 A mensagem será personalizada automaticamente com dados do usuário e quiz
                </p>
              </div>

              {/* Som específico para quiz completions */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">🔊 Som para Quiz Completions</h4>
                <SoundSelector 
                  currentSoundType={quizCompletionSound} 
                  onSoundTypeChange={setQuizCompletionSound}
                  label="Som quando detectar quiz completion"
                />
              </div>

              {/* Botão Salvar Configurações */}
              <div className="flex justify-center">
                <Button
                  onClick={saveAutoNotificationSettings}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  💾 Salvar Configurações de Quiz Completions
                </Button>
              </div>
            </div>

            {/* Status do Sistema */}
            {autoNotificationsEnabled && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-green-800 dark:text-green-200">
                    Sistema Ativo e Monitorando
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✅ Verificação automática a cada 10 segundos<br/>
                  ✅ Notificação instantânea quando quiz for completado<br/>
                  ✅ Som automático: {getSoundTypeText(quizCompletionSound)}<br/>
                  {lastQuizCompleted && (
                    <>✅ Último quiz detectado: ID {lastQuizCompleted.substring(0, 8)}...</>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Configurar Mensagem Push
            </CardTitle>
            <CardDescription>
              Escolha o tipo de mensagem e configure o conteúdo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tipo de Mensagem */}
            <div>
              <label className="text-sm font-medium mb-3 block">Tipo de Mensagem</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  variant={messageType === 'unique' ? "default" : "outline"}
                  onClick={() => setMessageType('unique')}
                  className={messageType === 'unique' ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  📝 Mensagem Única
                </Button>
                <Button
                  variant={messageType === 'rotating' ? "default" : "outline"}
                  onClick={() => setMessageType('rotating')}
                  className={messageType === 'rotating' ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  🔄 Mensagens Rotativas
                </Button>
                <Button
                  variant={messageType === 'priority' ? "default" : "outline"}
                  onClick={() => setMessageType('priority')}
                  className={messageType === 'priority' ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  🚨 Mensagem Prioritária
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

                {/* Som específico para mensagem única */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">🔊 Som para Mensagem Única</h4>
                  <SoundSelector 
                    currentSoundType={uniqueSoundType} 
                    onSoundTypeChange={setUniqueSoundType}
                    label="Som quando enviar mensagem única"
                  />
                </div>
              </>
            )}

            {messageType === 'rotating' && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">🔄 Sistema de Mensagem Rotativa Editável</h4>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                  Configure suas mensagens rotativas personalizadas. O sistema enviará uma aleatoriamente a cada envio:
                </p>
                
                {/* Editor de mensagens rotativas */}
                <div className="space-y-3">
                  {rotatingMessages.map((msg, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mensagem {index + 1}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newMessages = rotatingMessages.filter((_, i) => i !== index);
                            setRotatingMessages(newMessages);
                          }}
                          className="text-red-600 hover:bg-red-50 border-red-300"
                        >
                          🗑️ Remover
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Input
                          value={msg.title}
                          onChange={(e) => {
                            const newMessages = [...rotatingMessages];
                            newMessages[index].title = e.target.value;
                            setRotatingMessages(newMessages);
                          }}
                          placeholder="Título da mensagem rotativa..."
                          className="font-medium"
                        />
                        <Textarea
                          value={msg.message}
                          onChange={(e) => {
                            const newMessages = [...rotatingMessages];
                            newMessages[index].message = e.target.value;
                            setRotatingMessages(newMessages);
                          }}
                          placeholder="Conteúdo da mensagem rotativa..."
                          rows={2}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRotatingMessages([...rotatingMessages, { title: '', message: '' }]);
                    }}
                    className="w-full border-dashed border-2 border-green-300 text-green-700 hover:bg-green-50"
                  >
                    ➕ Adicionar Nova Mensagem Rotativa
                  </Button>
                </div>

                {/* Som específico para mensagem rotativa */}
                <div className="mt-4 p-3 bg-green-100 dark:bg-green-800/30 rounded-lg">
                  <h5 className="font-semibold text-green-800 dark:text-green-200 mb-3">🔊 Som para Mensagens Rotativas</h5>
                  <SoundSelector 
                    currentSoundType={rotativeSoundType} 
                    onSoundTypeChange={setRotativeSoundType}
                    label="Som quando enviar mensagem rotativa"
                  />
                </div>
              </div>
            )}

            {messageType === 'priority' && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">🚨 Mensagem Prioritária</h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  Mensagens prioritárias aparecem como alertas urgentes e têm maior visibilidade.
                </p>
                <div>
                  <label className="text-sm font-medium mb-2 block">Título da Mensagem Prioritária</label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="🚨 URGENTE: Título da mensagem..."
                    className="font-medium"
                  />
                </div>
                <div className="mt-3">
                  <label className="text-sm font-medium mb-2 block">Conteúdo da Mensagem Prioritária</label>
                  <Textarea 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Digite sua mensagem prioritária aqui..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>
            )}

            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || (!title && messageType !== 'rotating') || (!message && messageType !== 'rotating')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Enviando...
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

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>Como Funciona</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-xs font-semibold text-green-600">1</div>
                <div>
                  <strong>Sistema Completo:</strong> 10 tipos de som diferentes para iOS e Android com Web Audio API.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">2</div>
                <div>
                  <strong>Som Individual:</strong> Cada tipo de mensagem (única/rotativa) tem sua própria configuração de som.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-xs font-semibold text-purple-600">3</div>
                <div>
                  <strong>Edição Completa:</strong> Mensagens rotativas são totalmente editáveis (título e conteúdo).
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center text-xs font-semibold text-orange-600">4</div>
                <div>
                  <strong>Push Notifications:</strong> Sistema real de notificações que aparecem na tela de bloqueio.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}