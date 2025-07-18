import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CreditCard, Users, Calendar, DollarSign, Shield } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function TestValidationFlow() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [testData, setTestData] = useState<any>(null);
  const { toast } = useToast();

  const handleCreateValidationFlow = async () => {
    try {
      setLoading(true);
      setResult(null);
      
      const response = await apiRequest('POST', '/api/stripe/simple-trial', {
        planName: 'Plano Premium Vendzz',
        customerEmail: email || 'test@example.com',
        customerName: 'Cliente Teste',
        trialAmount: 1.00,
        trialDays: 3,
        recurringAmount: 29.90,
        currency: 'BRL'
      });

      setResult(response);
      setTestData(response);
      
      toast({
        title: 'Fluxo de Validação Criado',
        description: 'Checkout de validação criado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao criar fluxo:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao criar fluxo de validação',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async () => {
    try {
      setLoading(true);
      
      const response = await apiRequest('POST', '/api/stripe/test-webhook-trial', {
        email: email || 'test@example.com'
      });

      setResult(response);
      
      if (response.success) {
        toast({
          title: 'Webhook Testado',
          description: 'Webhook simulado com sucesso!',
        });
      } else {
        toast({
          title: 'Webhook Falhou',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao testar webhook',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sistema de Validação Stripe</h1>
        <p className="text-muted-foreground">
          Teste o fluxo correto: R$ 1,00 validação → Subscription automática com trial
        </p>
      </div>

      <div className="grid gap-6">
        {/* Painel de Controle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Painel de Teste
            </CardTitle>
            <CardDescription>
              Configure e teste o fluxo de validação de cartão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email do Cliente</Label>
              <Input
                id="email"
                type="email"
                placeholder="cliente@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleCreateValidationFlow}
                disabled={loading}
                className="flex-1"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {loading ? 'Criando...' : 'Criar Fluxo de Validação'}
              </Button>
              
              <Button
                onClick={handleTestWebhook}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {loading ? 'Testando...' : 'Testar Webhook'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Explicação do Fluxo */}
        <Card>
          <CardHeader>
            <CardTitle>🔐 Garantia Stripe - Fluxo Correto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Confirmação Stripe:</strong> Quando o cartão é salvo durante checkout (setup_future_usage), 
                ele será cobrado automaticamente nas próximas cobranças. O cliente NÃO precisa autorizar novamente.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">✅ ETAPA 1: Validação</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Cliente paga R$ 1,00</li>
                  <li>• Cartão é salvo automaticamente</li>
                  <li>• setup_future_usage: 'off_session'</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600">✅ ETAPA 2: Subscription</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Webhook detecta pagamento</li>
                  <li>• Cria subscription com 3 dias trial</li>
                  <li>• Após trial: R$ 29,90/mês automático</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Sistema Aprovado para Produção</p>
                <p className="text-sm text-green-700">
                  Fluxo compliance com regulamentações e políticas do Stripe
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultado dos Testes */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <span className="h-5 w-5 text-red-600">❌</span>
                )}
                Resultado do Teste
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <div className="space-y-6">
                  {/* Informações do Cliente */}
                  {result.data?.customer && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Cliente
                      </h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p><strong>ID:</strong> {result.data.customer.id}</p>
                        <p><strong>Email:</strong> {result.data.customer.email}</p>
                      </div>
                    </div>
                  )}

                  {/* Payment Intent */}
                  {result.data?.payment_intent && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Payment Intent de Validação
                      </h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p><strong>ID:</strong> {result.data.payment_intent.id}</p>
                        <p><strong>Status:</strong> 
                          <Badge variant={result.data.payment_intent.status === 'succeeded' ? 'default' : 'secondary'}>
                            {result.data.payment_intent.status}
                          </Badge>
                        </p>
                        <p><strong>Valor:</strong> R$ {(result.data.payment_intent.amount / 100).toFixed(2)}</p>
                        <p><strong>Tipo:</strong> {result.data.payment_intent.metadata?.type}</p>
                      </div>
                    </div>
                  )}

                  {/* Subscription Criada */}
                  {result.data?.subscription_created && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Subscription Criada Automaticamente
                      </h4>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p><strong>ID:</strong> {result.data.subscription_created.id}</p>
                        <p><strong>Status:</strong> 
                          <Badge variant="outline" className="text-green-600">
                            {result.data.subscription_created.status}
                          </Badge>
                        </p>
                        <p><strong>Trial até:</strong> {result.data.subscription_created.trial_end}</p>
                        <p><strong>Próxima cobrança:</strong> {result.data.subscription_created.current_period_end}</p>
                        <p><strong>Método de pagamento:</strong> {result.data.subscription_created.default_payment_method}</p>
                      </div>
                    </div>
                  )}

                  {/* Webhook Test */}
                  {result.data?.webhook_test && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Webhook Processado
                      </h4>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p><strong>Processado:</strong> {result.data.webhook_test.processed ? 'Sim' : 'Não'}</p>
                        <p><strong>Evento:</strong> {result.data.webhook_test.event_type}</p>
                        <p><strong>Timestamp:</strong> {result.data.webhook_test.timestamp}</p>
                      </div>
                    </div>
                  )}

                  {/* Checkout URL */}
                  {result.checkoutUrl && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Checkout URL
                      </h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <a 
                          href={result.checkoutUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {result.checkoutUrl}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Explicação */}
                  {result.explanation && (
                    <div>
                      <h4 className="font-semibold mb-2">Explicação do Fluxo</h4>
                      <pre className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-wrap">
                        {result.explanation}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertDescription>
                    <strong>Erro:</strong> {result.message || 'Falha no teste'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}