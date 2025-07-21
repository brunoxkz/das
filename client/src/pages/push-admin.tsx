import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Bell, Send, BarChart3, Clock, Users, Zap } from 'lucide-react';

interface PushStats {
  totalNotificationsSent: number;
  notificationsInQueue: number;
  processing: number;
  batchSize: number;
  batchInterval: number;
  systemStatus: string;
  lastProcessed: string;
  optimizedFor?: string;
  performance?: {
    batchProcessing: boolean;
    nonBlocking: boolean;
    realTime: boolean;
  };
}

export default function PushAdmin() {
  const [stats, setStats] = useState<PushStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testQuizId, setTestQuizId] = useState('test-quiz-123');
  const [testUserId, setTestUserId] = useState('admin-user-id');
  const { toast } = useToast();

  // Carregar estatísticas do sistema - CORRIGIDO ENDPOINT
  const loadStats = async () => {
    try {
      console.log('🔍 Carregando stats push admin...');
      const response = await apiRequest('GET', '/api/push-notifications/admin/stats');
      setStats(response);
      console.log('✅ Stats carregadas:', response);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Tentar endpoint debug como fallback
      try {
        const debugResponse = await apiRequest('GET', '/api/push-debug/stats');
        console.log('📊 Stats debug:', debugResponse);
        setStats({
          totalNotificationsSent: debugResponse.totalSent || 0,
          notificationsInQueue: 0,
          processing: 0,
          batchSize: 10,
          batchInterval: 5000,
          systemStatus: debugResponse.success ? 'online' : 'offline',
          lastProcessed: debugResponse.lastSent || 'N/A'
        });
      } catch (debugError) {
        console.error('Debug endpoint também falhou:', debugError);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as estatísticas",
          variant: "destructive",
        });
      }
    }
  };

  // Testar notificação push
  const testPushNotification = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/push-notifications/test-realtime', {
        quizId: testQuizId,
        userId: testUserId
      });
      
      toast({
        title: "Sucesso",
        description: response.message || "Notificação de teste enviada com sucesso",
      });
      
      // Recarregar estatísticas
      await loadStats();
    } catch (error) {
      console.error('Erro no teste:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar notificação de teste",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    
    // Atualizar estatísticas a cada 5 segundos
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-8 h-8 text-green-600" />
              Administração Push Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Sistema automatizado de notificações em tempo real para completamento de quizzes
            </p>
          </div>
          <Button onClick={loadStats} variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Atualizar Stats
          </Button>
        </div>

        {/* Sistema de Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant={stats?.systemStatus === 'active' ? 'default' : 'destructive'}>
                  {stats?.systemStatus || 'Carregando...'}
                </Badge>
                {stats?.optimizedFor && (
                  <span className="text-xs text-gray-500">{stats.optimizedFor}</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Send className="w-4 h-4" />
                Total Enviadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.totalNotificationsSent || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Na Fila
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.notificationsInQueue || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Processando
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats?.processing || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configurações do Sistema */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Performance</CardTitle>
              <CardDescription>
                Sistema otimizado para alta escala com processamento em batch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Batch Size</label>
                  <div className="text-lg font-semibold">{stats.batchSize}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Intervalo (ms)</label>
                  <div className="text-lg font-semibold">{stats.batchInterval}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Última Atualização</label>
                  <div className="text-sm text-gray-500">
                    {new Date(stats.lastProcessed).toLocaleTimeString()}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Performance</label>
                  <div className="flex flex-wrap gap-1">
                    {stats.performance?.batchProcessing && (
                      <Badge variant="secondary" className="text-xs">Batch</Badge>
                    )}
                    {stats.performance?.nonBlocking && (
                      <Badge variant="secondary" className="text-xs">Non-blocking</Badge>
                    )}
                    {stats.performance?.realTime && (
                      <Badge variant="secondary" className="text-xs">Real-time</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Teste de Notificação */}
        <Card>
          <CardHeader>
            <CardTitle>Teste de Notificação Push</CardTitle>
            <CardDescription>
              Simular completamento de quiz para testar o sistema automático
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Quiz ID</label>
                <Input 
                  value={testQuizId} 
                  onChange={(e) => setTestQuizId(e.target.value)}
                  placeholder="ID do quiz para testar"
                />
              </div>
              <div>
                <label className="text-sm font-medium">User ID</label>
                <Input 
                  value={testUserId} 
                  onChange={(e) => setTestUserId(e.target.value)}
                  placeholder="ID do usuário para notificar"
                />
              </div>
            </div>
            
            <Button 
              onClick={testPushNotification} 
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Enviando Teste...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Notificação de Teste
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Como Funciona */}
        <Card>
          <CardHeader>
            <CardTitle>Como Funciona o Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-xs font-semibold text-green-600">1</div>
                <div>
                  <strong>Detecção Automática:</strong> Quando um quiz é completado (isComplete=true ou completionPercentage=100), o sistema detecta automaticamente.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">2</div>
                <div>
                  <strong>Processamento em Batch:</strong> Notificações são agrupadas em lotes de {stats?.batchSize || 50} para otimizar performance.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center text-xs font-semibold text-orange-600">3</div>
                <div>
                  <strong>Envio Inteligente:</strong> Sistema verifica se o dono do quiz tem push subscription ativa antes de enviar.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-xs font-semibold text-purple-600">4</div>
                <div>
                  <strong>Alta Escala:</strong> Otimizado para 100k usuários ativos com processamento não-bloqueante.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}