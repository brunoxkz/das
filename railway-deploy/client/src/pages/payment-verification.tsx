import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, CreditCard, Repeat, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function PaymentVerification() {
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', '/api/payment-verification/transactions');
      
      if (response.success) {
        setTransactions(response.transactions || []);
        toast({
          title: "Transações carregadas",
          description: `${response.count} transações encontradas`,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar transações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', '/api/payment-verification/subscriptions');
      
      if (response.success) {
        setSubscriptions(response.subscriptions || []);
        toast({
          title: "Assinaturas carregadas",
          description: `${response.count} assinaturas encontradas`,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar assinaturas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchSubscriptions();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'succeeded':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Sucesso</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Falhou</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'trialing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><Repeat className="w-3 h-3 mr-1" />Trial</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    // Se é timestamp (número)
    if (typeof dateString === 'number') {
      return new Date(dateString).toLocaleDateString('pt-BR');
    }
    
    // Se é timestamp em string (milissegundos)
    if (typeof dateString === 'string' && dateString.match(/^\d+$/)) {
      return new Date(parseInt(dateString)).toLocaleDateString('pt-BR');
    }
    
    // Se é string de data
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Verificação de Pagamentos</h1>
        <p className="text-gray-600">Monitore transações e assinaturas em tempo real</p>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Transações Recentes</h2>
            <Button onClick={fetchTransactions} disabled={loading}>
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              {loading ? 'Carregando...' : 'Atualizar'}
            </Button>
          </div>

          {transactions.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma transação encontrada</p>
                  <Button onClick={fetchTransactions} className="mt-4">
                    Tentar novamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {transactions.map((transaction, index) => (
                <Card key={transaction.id || index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-mono text-sm">
                          {transaction.stripePaymentIntentId || transaction.id}
                        </CardTitle>
                        <CardDescription>
                          {transaction.customerEmail || transaction.description || 'Transação Vendzz'}
                        </CardDescription>
                      </div>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-600">Valor:</p>
                        <p className="font-semibold">R$ {(transaction.amount || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Data:</p>
                        <p>{formatDate(transaction.createdAt || transaction.created_at)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Cliente:</p>
                        <p>{transaction.customerName || transaction.customer_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Moeda:</p>
                        <p>{(transaction.currency || 'BRL').toUpperCase()}</p>
                      </div>
                    </div>
                    {transaction.metadata && (
                      <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
                        <p className="font-medium text-gray-600 mb-1">Metadados:</p>
                        <pre className="text-gray-700">{JSON.stringify(JSON.parse(transaction.metadata), null, 2)}</pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Assinaturas Recentes</h2>
            <Button onClick={fetchSubscriptions} disabled={loading}>
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              {loading ? 'Carregando...' : 'Atualizar'}
            </Button>
          </div>

          {subscriptions.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma assinatura encontrada</p>
                  <Button onClick={fetchSubscriptions} className="mt-4">
                    Tentar novamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {subscriptions.map((subscription, index) => (
                <Card key={subscription.id || index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-mono text-sm">
                          {subscription.subscription_id || subscription.id}
                        </CardTitle>
                        <CardDescription>
                          {subscription.customer_email || subscription.plan_name || 'Assinatura Vendzz'}
                        </CardDescription>
                      </div>
                      {getStatusBadge(subscription.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-600">Valor:</p>
                        <p className="font-semibold">R$ {((subscription.amount || 0) / 100).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Data:</p>
                        <p>{formatDate(subscription.created_at || subscription.createdAt)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Trial End:</p>
                        <p>{subscription.trial_end ? formatDate(subscription.trial_end * 1000) : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Plano:</p>
                        <p>{subscription.plan_name || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}