import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Send, Users, TrendingUp, Clock, Shield } from 'lucide-react';

interface PushStats {
  total: number;
  recent: number;
}

export default function AdminPushSimple() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<PushStats>({ total: 0, recent: 0 });
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/push-simple/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const sendPushNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e mensagem são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/push-simple/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          body: message.trim()
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Enviado com sucesso!",
          description: `Push notification enviado para ${result.stats.success} usuários`,
        });
        
        // Limpar campos
        setTitle('');
        setMessage('');
        
        // Recarregar stats
        await loadStats();
      } else {
        throw new Error(result.error || 'Erro no envio');
      }
    } catch (error) {
      console.error('Erro ao enviar push:', error);
      toast({
        title: "Erro no envio",
        description: "Não foi possível enviar a notificação",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickMessages = [
    {
      title: "Nova funcionalidade!",
      message: "Confira as novidades no seu painel Vendzz"
    },
    {
      title: "Lembrete importante",
      message: "Você tem campanhas pendentes para revisar"
    },
    {
      title: "Promoção especial",
      message: "50% de desconto em créditos SMS por tempo limitado!"
    }
  ];

  const useQuickMessage = (quickMsg: typeof quickMessages[0]) => {
    setTitle(quickMsg.title);
    setMessage(quickMsg.message);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <Shield className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Push Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Envie notificações para todos os usuários
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Inscritos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Últimas 24h</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.recent}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <Badge variant="default" className="bg-green-600">Online</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Send Notification Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5" />
                <span>Enviar Notificação</span>
              </CardTitle>
              <CardDescription>
                Envie uma push notification para todos os usuários inscritos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Título da Notificação
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Nova funcionalidade disponível"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">{title.length}/50 caracteres</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Mensagem
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite a mensagem que será exibida na notificação..."
                  maxLength={200}
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">{message.length}/200 caracteres</p>
              </div>

              <Button
                onClick={sendPushNotification}
                disabled={isLoading || !title.trim() || !message.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Enviando para {stats.total} usuários...</span>
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar para {stats.total} usuários
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Mensagens Rápidas</CardTitle>
              <CardDescription>
                Clique para usar um template pré-definido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickMessages.map((quick, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => useQuickMessage(quick)}
                >
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {quick.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {quick.message}
                  </p>
                </div>
              ))}

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  💡 <strong>Dica:</strong> Notificações curtas e claras têm melhor engajamento. 
                  Evite textos muito longos.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        {(title || message) && (
          <Card>
            <CardHeader>
              <CardTitle>Preview da Notificação</CardTitle>
              <CardDescription>
                Assim a notificação aparecerá na tela de bloqueio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm mx-auto bg-gray-900 text-white p-4 rounded-lg shadow-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold">V</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {title || 'Título da notificação'}
                    </p>
                    <p className="text-gray-300 text-xs mt-1 line-clamp-2">
                      {message || 'Mensagem da notificação aparecerá aqui...'}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">agora • Vendzz</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}