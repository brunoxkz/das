import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, CreditCard, Calendar, DollarSign, User, AlertCircle, Mail, Receipt, Clock, FileText } from 'lucide-react';

export default function CheckPayment() {
  const [paymentIntentId, setPaymentIntentId] = useState('pi_3Rm4IIHK6al3veW10kRZudlf');
  const [customerEmail, setCustomerEmail] = useState('brunotamaso@gmail.com');
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
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

  const checkCustomer = async () => {
    if (!customerEmail.trim()) {
      setError('Digite um email do cliente');
      return;
    }

    setLoading(true);
    setError('');
    setCustomerData(null);

    try {
      const response = await fetch(`/api/stripe/customer/${encodeURIComponent(customerEmail)}`);
      const data = await response.json();

      if (data.success) {
        setCustomerData(data);
      } else {
        setError(data.message || 'Erro ao consultar cliente');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2
    }).format(amount / 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'succeeded': { variant: 'default', label: 'PAGO', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
      'active': { variant: 'default', label: 'ATIVO', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
      'trialing': { variant: 'secondary', label: 'TRIAL', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
      'requires_payment_method': { variant: 'destructive', label: 'PENDENTE', icon: XCircle, color: 'bg-red-100 text-red-800' },
      'canceled': { variant: 'destructive', label: 'CANCELADO', icon: XCircle, color: 'bg-red-100 text-red-800' },
      'unpaid': { variant: 'destructive', label: 'NÃO PAGO', icon: XCircle, color: 'bg-red-100 text-red-800' }
    };

    const config = statusMap[status] || { variant: 'outline', label: status?.toUpperCase(), icon: AlertCircle, color: 'bg-gray-100 text-gray-800' };
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🔍 Verificar Pagamento Stripe
            </CardTitle>
            <CardDescription className="text-center">
              Consulte pagamentos e assinaturas direto do Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Por Email do Cliente
                </TabsTrigger>
                <TabsTrigger value="payment" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Por Payment Intent
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">
                      Email do Cliente
                    </label>
                    <Input
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="brunotamaso@gmail.com"
                      type="email"
                    />
                  </div>
                  <Button 
                    onClick={checkCustomer} 
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? 'Consultando...' : 'Consultar Cliente'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="payment" className="space-y-4">
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
              </TabsContent>
            </Tabs>

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

        {/* Resultado da consulta por Payment Intent */}
        {paymentData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Detalhes do Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Informações Básicas</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-mono text-sm">{paymentData.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      {getStatusBadge(paymentData.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor:</span>
                      <span className="font-bold text-lg">{formatCurrency(paymentData.amount, paymentData.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor Recebido:</span>
                      <span className="font-bold text-lg text-green-600">{formatCurrency(paymentData.amount_received, paymentData.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cliente:</span>
                      <span className="font-mono text-sm">{paymentData.customer}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Cobranças (Charges)</h3>
                  <div className="space-y-3">
                    {paymentData.charges?.map((charge, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-mono text-sm">{charge.id}</span>
                          {getStatusBadge(charge.status)}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Valor:</span>
                            <span className="font-bold">{formatCurrency(charge.amount, paymentData.currency)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pago:</span>
                            <span className={charge.paid ? 'text-green-600' : 'text-red-600'}>
                              {charge.paid ? 'SIM' : 'NÃO'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Data:</span>
                            <span>{formatDate(charge.created)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Resumo da Verificação</h3>
                <div className="text-sm text-blue-700">
                  {paymentData.amount_received > 0 ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Este pagamento foi <strong>realmente cobrado</strong> no valor de {formatCurrency(paymentData.amount_received, paymentData.currency)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>Este pagamento <strong>não foi cobrado</strong> - valor recebido: {formatCurrency(paymentData.amount_received, paymentData.currency)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resultado da consulta por Cliente */}
        {customerData && (
          <div className="space-y-6">
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
                  <div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID:</span>
                        <span className="font-mono text-sm">{customerData.customer.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span>{customerData.customer.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nome:</span>
                        <span>{customerData.customer.name || 'Não informado'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Telefone:</span>
                        <span>{customerData.customer.phone || 'Não informado'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Criado em:</span>
                        <span>{formatDate(customerData.customer.created)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Resumo</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Pago:</span>
                        <span className="font-bold text-green-600">{formatCurrency(customerData.summary.total_paid)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Assinaturas Ativas:</span>
                        <span className="font-bold">{customerData.summary.active_subscriptions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Assinaturas em Trial:</span>
                        <span className="font-bold">{customerData.summary.trialing_subscriptions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total de Pagamentos:</span>
                        <span className="font-bold">{customerData.summary.total_payment_intents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total de Cobranças:</span>
                        <span className="font-bold">{customerData.summary.total_charges}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assinaturas */}
            {customerData.subscriptions?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Assinaturas ({customerData.subscriptions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customerData.subscriptions.map((subscription) => (
                      <div key={subscription.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-mono text-sm text-gray-600">{subscription.id}</div>
                            <div className="mt-1">{getStatusBadge(subscription.status)}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              {subscription.items[0] && formatCurrency(subscription.items[0].amount, subscription.items[0].currency)}
                              {subscription.items[0]?.interval && <span className="text-sm text-gray-600">/{subscription.items[0].interval}</span>}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Período atual:</span>
                                <span>{formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}</span>
                              </div>
                              {subscription.trial_end && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Trial até:</span>
                                  <span className="font-bold text-yellow-600">{formatDate(subscription.trial_end)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-600">Cancelar no fim:</span>
                                <span className={subscription.cancel_at_period_end ? 'text-red-600' : 'text-green-600'}>
                                  {subscription.cancel_at_period_end ? 'SIM' : 'NÃO'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Price ID:</span>
                                <span className="font-mono text-xs">{subscription.items[0]?.price_id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Product ID:</span>
                                <span className="font-mono text-xs">{subscription.items[0]?.product}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Histórico de Pagamentos */}
            {customerData.paymentIntents?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Histórico de Pagamentos ({customerData.paymentIntents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {customerData.paymentIntents.map((payment) => (
                      <div key={payment.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <div className="font-mono text-sm">{payment.id}</div>
                            <div className="text-xs text-gray-600">{formatDate(payment.created)}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(payment.amount, payment.currency)}</div>
                            <div className="text-xs">Recebido: {formatCurrency(payment.amount_received, payment.currency)}</div>
                          </div>
                          <div>{getStatusBadge(payment.status)}</div>
                        </div>
                        {payment.description && (
                          <div className="text-sm text-gray-600">{payment.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Faturas */}
            {customerData.invoices?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Faturas ({customerData.invoices.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {customerData.invoices.map((invoice) => (
                      <div key={invoice.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <div className="font-mono text-sm">{invoice.id}</div>
                            <div className="text-xs text-gray-600">{formatDate(invoice.created)}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(invoice.amount_paid, invoice.currency)}</div>
                            <div className="text-xs">Devido: {formatCurrency(invoice.amount_due, invoice.currency)}</div>
                          </div>
                          <div>{getStatusBadge(invoice.status)}</div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Período: {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                        </div>
                        {invoice.hosted_invoice_url && (
                          <div className="mt-2">
                            <a 
                              href={invoice.hosted_invoice_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              Ver Fatura Online
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}