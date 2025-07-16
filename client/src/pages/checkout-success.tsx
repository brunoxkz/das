import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Package, CreditCard, Download, Mail, Phone, MapPin, Calendar, Clock } from 'lucide-react';

interface Transaction {
  id: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  billingType: 'one_time' | 'recurring';
  subscriptionInterval?: 'monthly' | 'yearly';
}

export default function CheckoutSuccess() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [, navigate] = useLocation();

  // Buscar dados da transação
  const { data: transaction, isLoading: loadingTransaction } = useQuery<Transaction>({
    queryKey: ['/api/checkout/transaction', transactionId],
    enabled: !!transactionId,
    retry: false
  });

  // Buscar dados do produto
  const { data: product, isLoading: loadingProduct } = useQuery<Product>({
    queryKey: ['/api/checkout/product', transaction?.productId],
    enabled: !!transaction?.productId,
    retry: false
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'Cartão de Crédito';
      case 'pix':
        return 'PIX';
      case 'boleto':
        return 'Boleto Bancário';
      default:
        return method;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Pendente';
      case 'failed':
        return 'Falhou';
      default:
        return status;
    }
  };

  if (loadingTransaction || loadingProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600">Carregando informações...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Transação Não Encontrada</CardTitle>
            <CardDescription>A transação não foi encontrada ou não existe.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {transaction.status === 'completed' ? 'Compra Realizada com Sucesso!' : 'Pedido Recebido'}
          </h1>
          <p className="text-gray-600">
            {transaction.status === 'completed' 
              ? 'Obrigado pela sua compra! Você receberá um email com todos os detalhes.'
              : 'Seu pedido foi recebido e está sendo processado.'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Transaction Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Detalhes da Compra
                    </CardTitle>
                    <CardDescription>ID: {transaction.id}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(transaction.status)}>
                    {getStatusLabel(transaction.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {product && (
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                      <Badge variant="outline">{product.category}</Badge>
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(transaction.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxas:</span>
                    <span>R$ 0,00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Pago:</span>
                    <span className="text-green-600">{formatPrice(transaction.amount)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Método de Pagamento:</span>
                    <span className="text-sm font-medium">{getPaymentMethodLabel(transaction.paymentMethod)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Data da Compra:</span>
                    <span className="text-sm font-medium">{formatDate(transaction.createdAt)}</span>
                  </div>
                </div>

                {product?.billingType === 'recurring' && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Assinatura Ativada</strong>
                      <br />
                      Próxima cobrança: {formatPrice(product.price)} em {product.subscriptionInterval === 'monthly' ? '30 dias' : '1 ano'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Próximos Passos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Confirmação por Email</p>
                    <p className="text-sm text-gray-600">
                      Enviamos um email de confirmação para {transaction.customerEmail}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Acesso ao Produto</p>
                    <p className="text-sm text-gray-600">
                      O acesso será liberado automaticamente em até 24 horas
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Suporte</p>
                    <p className="text-sm text-gray-600">
                      Dúvidas? Entre em contato pelo suporte
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {transaction.customerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{transaction.customerName}</p>
                    <p className="text-sm text-gray-600">Cliente</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{transaction.customerEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{transaction.customerPhone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="text-sm">{transaction.customerAddress}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => window.print()}>
                  <Download className="w-4 h-4 mr-2" />
                  Imprimir Recibo
                </Button>
                
                <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                  <Package className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Entrar em Contato
                </Button>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Transação Segura</p>
                    <p className="text-sm text-green-700">
                      Sua compra foi processada com segurança SSL
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}