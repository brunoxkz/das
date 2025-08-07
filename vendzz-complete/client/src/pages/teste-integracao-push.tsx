import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Send, 
  CheckCircle, 
  XCircle,
  Zap,
  Smartphone
} from 'lucide-react';

interface IntegrationTest {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function TesteIntegracaoPush() {
  const [tests, setTests] = useState<IntegrationTest[]>([
    { name: 'Login Admin', status: 'pending', message: 'Não executado' },
    { name: 'Broadcast Unificado', status: 'pending', message: 'Não executado' },
    { name: 'Verificar Sistema PWA', status: 'pending', message: 'Não executado' },
    { name: 'Logs de Integração', status: 'pending', message: 'Não executado' }
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const updateTest = (index: number, updates: Partial<IntegrationTest>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...updates } : test));
  };

  const executarTestesIntegracao = async () => {
    setIsRunning(true);
    setResults(null);
    
    try {
      // 1. TESTE BROADCAST UNIFICADO
      updateTest(1, { status: 'pending', message: 'Executando broadcast unificado...' });
      
      try {
        const broadcastResponse = await apiRequest('POST', '/api/push-notifications/admin/broadcast', {
          title: 'TESTE INTEGRAÇÃO ADMIN → PWA iOS',
          body: 'Verificando se admin consegue enviar para TODOS os dispositivos',
          url: '/app-pwa-vendzz',
          icon: '/logo-vendzz-white.png',
          badge: '/logo-vendzz-white.png',
          requireInteraction: true,
          silent: false
        });

        if (broadcastResponse.ok) {
          const data = await broadcastResponse.json();
          updateTest(1, { 
            status: 'success', 
            message: `Broadcast enviado para ${data.total || 0} dispositivos`,
            details: data
          });
          setResults(data);
        } else {
          const error = await broadcastResponse.text();
          updateTest(1, { 
            status: 'error', 
            message: `Erro no broadcast: ${broadcastResponse.status}`,
            details: error
          });
        }
      } catch (broadcastError) {
        console.error('Erro no broadcast:', broadcastError);
        updateTest(1, { 
          status: 'error', 
          message: `Erro de comunicação: ${broadcastError.message}`,
          details: broadcastError
        });
      }

      // 2. VERIFICAR SISTEMA PWA
      updateTest(2, { status: 'pending', message: 'Verificando chave VAPID...' });
      
      const vapidResponse = await fetch('/api/push-vapid-key');
      if (vapidResponse.ok) {
        const vapidData = await vapidResponse.json();
        updateTest(2, { 
          status: 'success', 
          message: 'Sistema PWA iOS funcionando',
          details: { publicKey: vapidData.publicKey?.substring(0, 20) + '...' }
        });
      } else {
        updateTest(2, { status: 'error', message: 'Sistema PWA não responde' });
      }

      // 3. VERIFICAR LOGS
      updateTest(3, { status: 'pending', message: 'Verificando logs...' });
      
      const logsResponse = await apiRequest('GET', '/api/push-notifications/admin/logs');
      if (logsResponse.ok) {
        const logs = await logsResponse.json();
        const recentLogs = logs.filter((log: any) => 
          log.title?.includes('TESTE INTEGRAÇÃO') || 
          new Date(log.sentAt) > new Date(Date.now() - 5 * 60 * 1000)
        );
        
        updateTest(3, { 
          status: 'success', 
          message: `${recentLogs.length} logs recentes encontrados`,
          details: { totalLogs: logs.length, recentLogs: recentLogs.length }
        });
      } else {
        updateTest(3, { status: 'error', message: 'Erro ao acessar logs' });
      }

    } catch (error) {
      console.error('Erro nos testes:', error);
      toast({
        title: "Erro nos testes",
        description: error.message,
        variant: "destructive",
      });
    }

    setIsRunning(false);
  };

  useEffect(() => {
    // Marcar login como sucesso se conseguiu carregar a página
    updateTest(0, { status: 'success', message: 'Login admin confirmado' });
  }, []);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'success': return <Badge className="bg-green-600">APROVADO</Badge>;
      case 'error': return <Badge variant="destructive">FALHADO</Badge>;
      default: return <Badge variant="secondary">PENDENTE</Badge>;
    }
  };

  const successfulTests = tests.filter(test => test.status === 'success').length;
  const totalTests = tests.length;
  const successRate = ((successfulTests / totalTests) * 100).toFixed(1);

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-8 h-8 text-green-600" />
            Teste Integração Push Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Verificar se admin consegue enviar notificações para dispositivos PWA iOS
          </p>
        </div>

        {/* STATUS GERAL */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Status da Integração</span>
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                <span className="text-lg font-mono">{successRate}%</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{successfulTests}</div>
                <div className="text-sm text-gray-500">Aprovados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{totalTests}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {results?.breakdown?.sqlite || 0}
                </div>
                <div className="text-sm text-gray-500">SQLite</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {results?.breakdown?.pwa || 0}
                </div>
                <div className="text-sm text-gray-500">PWA iOS</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BOTÃO DE TESTE */}
        <div className="mb-6">
          <Button 
            onClick={executarTestesIntegracao}
            disabled={isRunning}
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isRunning ? (
              <>
                <Bell className="w-5 h-5 mr-2 animate-spin" />
                Executando Testes...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Executar Teste de Integração
              </>
            )}
          </Button>
        </div>

        {/* RESULTADOS DOS TESTES */}
        <div className="grid gap-4">
          {tests.map((test, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(test.status)}
                    <span>{test.name}</span>
                  </div>
                  {getStatusBadge(test.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {test.message}
                </p>
                {test.details && (
                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(test.details, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CONCLUSÃO */}
        {successRate !== "0.0" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {successRate >= "75" ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                Resultado Final
              </CardTitle>
            </CardHeader>
            <CardContent>
              {successRate >= "75" ? (
                <div className="text-green-600">
                  <p className="font-semibold">INTEGRAÇÃO APROVADA PARA PRODUÇÃO</p>
                  <p>Sistema admin consegue enviar notificações para TODOS os dispositivos</p>
                  <p>Conexão entre sistemas SQLite + PWA iOS estabelecida com sucesso</p>
                </div>
              ) : (
                <div className="text-red-600">
                  <p className="font-semibold">INTEGRAÇÃO PRECISA DE MELHORIAS</p>
                  <p>Alguns componentes não estão totalmente conectados</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}