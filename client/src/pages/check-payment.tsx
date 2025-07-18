import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, CreditCard, Calendar, DollarSign, User, AlertCircle } from 'lucide-react';

export default function CheckPayment() {
  const [paymentIntentId, setPaymentIntentId] = useState('pi_3Rm4IIHK6al3veW10kRZudlf');
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState('');

  const checkPayment = async () => {
    if (!paymentIntentId.trim()) {
      setError('Digite um Payment Intent ID');
      return;
    }

    setLoading(true);
    setError('');
    setPaymentData(null);

    try {
      const response = await fetch(`/api/stripe/payment-intent/${paymentIntentId}`);
      const data = await response.json();

      if (data.success) {
        setPaymentData(data.paymentIntent);
      } else {
        setError(data.message || 'Erro ao consultar pagamento');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🔍 Verificar Pagamento Stripe
            </CardTitle>
            <CardDescription className="text-center">
              Consulte se o pagamento foi realmente cobrado no Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Payment Intent ID
                </label>
                <Input
                  value={paymentIntentId}
                  onChange={(e) => setPaymentIntentId(e.target.value)}
                  placeholder="pi_3Rm4IIHK6al3veW10kRZudlf"
                  className="font-mono"
                />
              </div>
              <Button 
                onClick={checkPayment} 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Consultando...' : 'Verificar Pagamento'}
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {paymentData && (
          <div className="space-y-6">
            {/* Status Principal */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Status do Pagamento
                  </CardTitle>
                  <Badge 
                    variant={paymentData.status === 'succeeded' ? 'default' : 'destructive'}
                    className={paymentData.status === 'succeeded' ? 'bg-green-500' : ''}
                  >
                    {paymentData.status === 'succeeded' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        PAGO
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-1" />
                        {paymentData.status.toUpperCase()}
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Valor:</span>
                      <span className="text-lg font-bold text-green-600">
                        R$ {(paymentData.amount / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Valor Recebido:</span>
                      <span className="text-lg font-bold text-blue-600">
                        R$ {(paymentData.amount_received / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="font-medium">Customer:</span>
                      <span className="font-mono text-sm">{paymentData.customer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="font-medium">Criado em:</span>
                      <span className="text-sm">
                        {new Date(paymentData.created).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalhes das Cobranças */}
            {paymentData.charges && paymentData.charges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes das Cobranças</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentData.charges.map((charge, index) => (
                      <div key={charge.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm text-gray-600">
                            Charge #{index + 1}: {charge.id}
                          </span>
                          <Badge 
                            variant={charge.paid ? 'default' : 'destructive'}
                            className={charge.paid ? 'bg-green-500' : ''}
                          >
                            {charge.paid ? 'PAGO' : 'NÃO PAGO'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Valor:</span>
                            <span className="ml-2 text-lg font-bold text-green-600">
                              R$ {(charge.amount / 100).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>
                            <span className="ml-2 uppercase">{charge.status}</span>
                          </div>
                          <div>
                            <span className="font-medium">Data:</span>
                            <span className="ml-2">
                              {new Date(charge.created).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        {charge.receipt_url && (
                          <div className="mt-2">
                            <a 
                              href={charge.receipt_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              Ver Recibo do Stripe
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resumo Final */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">
                  🎉 Resumo da Verificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-green-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">
                      Pagamento de R$ {(paymentData.amount / 100).toFixed(2)} foi{' '}
                      <span className="font-bold text-green-600">
                        {paymentData.status === 'succeeded' ? 'EFETIVAMENTE COBRADO' : 'NÃO COBRADO'}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">
                      Valor recebido: R$ {(paymentData.amount_received / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">
                      Customer ID: {paymentData.customer}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}