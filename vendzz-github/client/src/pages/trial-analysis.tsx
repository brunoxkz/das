import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, CreditCard, Calendar, DollarSign, User, AlertCircle, Clock, Shield } from 'lucide-react';

export default function TrialAnalysis() {
  const [email, setEmail] = useState('brunotamaso@gmail.com');
  const [loading, setLoading] = useState(false);
  const [trialData, setTrialData] = useState(null);
  const [error, setError] = useState('');

  const analyzeTrialConfig = async () => {
    if (!email.trim()) {
      setError('Digite um email');
      return;
    }

    setLoading(true);
    setError('');
    setTrialData(null);

    try {
      const response = await fetch(`/api/stripe/trial-config/${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.success) {
        setTrialData(data);
      } else {
        setError(data.message || 'Erro ao analisar configuração');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getTrialStatusBadge = (trialEndsInDays) => {
    if (trialEndsInDays === null) {
      return (
        <Badge className="bg-gray-100 text-gray-800">
          <Clock className="h-3 w-3 mr-1" />
          SEM TRIAL
        </Badge>
      );
    }

    if (trialEndsInDays <= 0) {
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          TRIAL EXPIRADO
        </Badge>
      );
    }

    if (trialEndsInDays === 1) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          EXPIRA HOJE
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-100 text-green-800">
        <Clock className="h-3 w-3 mr-1" />
        {trialEndsInDays} DIAS RESTANTES
      </Badge>
    );
  };

  const getAutoChargeStatus = (willChargeAutomatically) => {
    if (willChargeAutomatically) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="font-semibold">SIM - Cobrará automaticamente</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <XCircle className="h-4 w-4" />
          <span className="font-semibold">NÃO - Precisa autorizar novamente</span>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🔍 Análise de Trial e Cobrança Automática
            </CardTitle>
            <CardDescription className="text-center">
              Verifique se o cliente será cobrado automaticamente após o trial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Email do Cliente
                </label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="brunotamaso@gmail.com"
                  type="email"
                />
              </div>
              <Button 
                onClick={analyzeTrialConfig} 
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? 'Analisando...' : 'Analisar Configuração'}
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {trialData && (
          <div className="space-y-6">
            {/* Status da Cobrança Automática */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Status da Cobrança Automática
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Cobrará automaticamente após o trial?</span>
                      {getAutoChargeStatus(trialData.billing_info.will_charge_automatically)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Status do Trial:</span>
                        {getTrialStatusBadge(trialData.billing_info.trial_ends_in_days)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {trialData.billing_info.trial_ends_in_days > 0 && (
                          <span>Trial expira em {trialData.billing_info.trial_ends_in_days} dia(s)</span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Próxima Cobrança:</span>
                        <span className="font-semibold">{formatDate(trialData.billing_info.next_payment_date)}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {trialData.billing_info.requires_authorization ? 
                          'Requer autorização do cliente' : 
                          'Cobrança automática confirmada'
                        }
                      </div>
                    </div>
                  </div>

                  {/* Explicação detalhada */}
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">📋 Explicação Detalhada:</h3>
                    <div className="text-sm text-yellow-700 space-y-1">
                      {trialData.billing_info.will_charge_automatically ? (
                        <>
                          <p>✅ <strong>PAGAMENTO AUTOMÁTICO CONFIGURADO:</strong></p>
                          <p>• O cartão foi salvo com sucesso durante o checkout</p>
                          <p>• Quando o trial acabar, o Stripe cobrará automaticamente R$ 29,90</p>
                          <p>• O cliente NÃO precisa fazer nada - é automático</p>
                          <p>• Se o cartão for recusado, o Stripe enviará email para atualizar</p>
                        </>
                      ) : (
                        <>
                          <p>❌ <strong>PAGAMENTO MANUAL REQUERIDO:</strong></p>
                          <p>• O cartão NÃO foi salvo durante o checkout</p>
                          <p>• O cliente precisará inserir dados do cartão novamente</p>
                          <p>• Sem cobrança automática - assinatura pode ser cancelada</p>
                          <p>• Recomendado: enviar email para completar configuração</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID do Cliente:</span>
                      <span className="font-mono text-sm">{trialData.customer.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{trialData.customer.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nome:</span>
                      <span>{trialData.customer.name || 'Não informado'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID da Assinatura:</span>
                      <span className="font-mono text-sm">{trialData.subscription.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={trialData.subscription.status === 'trialing' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                        {trialData.subscription.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Método de Cobrança:</span>
                      <span>{trialData.subscription.collection_method}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalhes do Trial */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Detalhes do Trial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trial Iniciado:</span>
                      <span>{formatDate(trialData.subscription.trial_start)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trial Termina:</span>
                      <span className="font-semibold">{formatDate(trialData.subscription.trial_end)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Próximo Período:</span>
                      <span>{formatDate(trialData.subscription.current_period_end)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cancelar no fim do período:</span>
                      <span className={trialData.subscription.cancel_at_period_end ? 'text-red-600' : 'text-green-600'}>
                        {trialData.subscription.cancel_at_period_end ? 'SIM' : 'NÃO'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Método de Pagamento Padrão:</span>
                      <span className={trialData.subscription.default_payment_method ? 'text-green-600' : 'text-red-600'}>
                        {trialData.subscription.default_payment_method ? 'CONFIGURADO' : 'AUSENTE'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métodos de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Métodos de Pagamento ({trialData.payment_setup.payment_methods_count})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trialData.payment_setup.payment_methods_count > 0 ? (
                  <div className="space-y-3">
                    {trialData.payment_setup.payment_methods.map((pm, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <span className="font-semibold">{pm.card?.brand.toUpperCase()}</span>
                            <span>**** {pm.card?.last4}</span>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">
                            {pm.card?.exp_month}/{pm.card?.exp_year}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Adicionado em: {formatDate(pm.created)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum método de pagamento salvo</p>
                    <p className="text-sm">Cliente precisará inserir cartão manualmente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}