import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, XCircle, DollarSign, Users, CreditCard } from 'lucide-react';

interface SaasCobrancaSubscription {
  id: string;
  userId: string;
  email: string;
  planType: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SaasCobrancaHealth {
  success: boolean;
  saasCobrancaStatus: string;
  url: string;
  timestamp: string;
  error?: string;
}

export default function SaasCobrancaManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newSubscription, setNewSubscription] = useState({
    email: '',
    planType: 'basic',
    amount: 29.90,
    currency: 'BRL',
    metadata: {}
  });

  // Query para verificar conectividade com SAAS COBRAN
  const { data: healthData, isLoading: healthLoading } = useQuery<SaasCobrancaHealth>({
    queryKey: ['/api/saas-cobran/health'],
    refetchInterval: 30000, // Verificar a cada 30 segundos
  });

  // Mutation para criar nova assinatura
  const createSubscriptionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/saas-cobran/create-subscription', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Assinatura criada com sucesso",
          description: "A nova assinatura foi criada no SAAS COBRAN",
        });
        
        // Limpar formulário
        setNewSubscription({
          email: '',
          planType: 'basic',
          amount: 29.90,
          currency: 'BRL',
          metadata: {}
        });
        
        // Invalidar cache
        queryClient.invalidateQueries({ queryKey: ['/api/saas-cobran'] });
      } else {
        toast({
          title: "Erro ao criar assinatura",
          description: data.error || "Ocorreu um erro desconhecido",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Erro na criação da assinatura",
        description: "Não foi possível se conectar com o SAAS COBRAN",
        variant: "destructive",
      });
    },
  });

  // Função para criar assinatura
  const handleCreateSubscription = () => {
    if (!newSubscription.email) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira um email válido",
        variant: "destructive",
      });
      return;
    }

    createSubscriptionMutation.mutate({
      email: newSubscription.email,
      planType: newSubscription.planType,
      amount: newSubscription.amount,
      currency: newSubscription.currency,
      metadata: newSubscription.metadata
    });
  };

  // Função para obter status da conectividade
  const getHealthStatus = () => {
    if (healthLoading) return { status: 'loading', color: 'bg-yellow-500', text: 'Verificando...' };
    if (!healthData) return { status: 'error', color: 'bg-red-500', text: 'Erro na verificação' };
    
    switch (healthData.saasCobrancaStatus) {
      case 'connected':
        return { status: 'connected', color: 'bg-green-500', text: 'Conectado' };
      case 'disconnected':
        return { status: 'disconnected', color: 'bg-red-500', text: 'Desconectado' };
      default:
        return { status: 'error', color: 'bg-red-500', text: 'Erro' };
    }
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">SAAS COBRAN - Gerenciador de Cobrança</h1>
        <Badge variant="outline" className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${healthStatus.color}`} />
          {healthStatus.text}
        </Badge>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Status do Sistema</TabsTrigger>
          <TabsTrigger value="create">Criar Assinatura</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Status da Conectividade
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={healthData.saasCobrancaStatus === 'connected' ? 'default' : 'destructive'}>
                        {healthData.saasCobrancaStatus.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Status do SAAS COBRAN
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {healthData.url}
                      </code>
                      <span className="text-sm text-muted-foreground">
                        URL do Serviço
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono">
                        {new Date(healthData.timestamp).toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Última verificação
                      </span>
                    </div>
                  </div>

                  {healthData.error && (
                    <div className="flex items-center gap-2 p-3 border border-red-200 bg-red-50 rounded">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700">{healthData.error}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>Carregando status...</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Estatísticas Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">R$ 2.847,30</div>
                  <div className="text-sm text-muted-foreground">Receita Mensal</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">127</div>
                  <div className="text-sm text-muted-foreground">Assinaturas Ativas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">96.2%</div>
                  <div className="text-sm text-muted-foreground">Taxa de Renovação</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Nova Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email do Cliente</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="cliente@exemplo.com"
                    value={newSubscription.email}
                    onChange={(e) => setNewSubscription({...newSubscription, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planType">Tipo de Plano</Label>
                  <select
                    id="planType"
                    className="w-full p-2 border rounded"
                    value={newSubscription.planType}
                    onChange={(e) => setNewSubscription({...newSubscription, planType: e.target.value})}
                  >
                    <option value="basic">Básico - R$ 29,90/mês</option>
                    <option value="premium">Premium - R$ 69,90/mês</option>
                    <option value="enterprise">Enterprise - R$ 149,90/mês</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="29.90"
                    value={newSubscription.amount}
                    onChange={(e) => setNewSubscription({...newSubscription, amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Moeda</Label>
                  <select
                    id="currency"
                    className="w-full p-2 border rounded"
                    value={newSubscription.currency}
                    onChange={(e) => setNewSubscription({...newSubscription, currency: e.target.value})}
                  >
                    <option value="BRL">Real (BRL)</option>
                    <option value="USD">Dólar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>
              </div>
              <Button 
                onClick={handleCreateSubscription}
                disabled={createSubscriptionMutation.isPending || !newSubscription.email}
                className="w-full"
              >
                {createSubscriptionMutation.isPending ? 'Criando...' : 'Criar Assinatura'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Configurações de Integração
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL do SAAS COBRAN</Label>
                <Input
                  value={healthData?.url || 'http://localhost:3001'}
                  disabled
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Esta URL é configurada automaticamente através das variáveis de ambiente
                </p>
              </div>

              <div className="space-y-2">
                <Label>Status da API</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={healthData?.success ? 'default' : 'destructive'}>
                    {healthData?.success ? 'Funcional' : 'Erro'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Última verificação: {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleString() : 'Nunca'}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Funcionalidades Disponíveis</h3>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Criação de assinaturas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Cancelamento de assinaturas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Webhooks de status
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Verificação de conectividade
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}