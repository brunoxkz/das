import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface CheckoutResponse {
  success: boolean;
  checkoutSessionId: string;
  checkoutUrl: string;
  clientSecret: string;
  customerId: string;
  productId: string;
  recurringPriceId: string;
  immediatePaymentIntentId: string;
  message: string;
  billing_explanation: string;
}

export default function StripeCheckoutCustom() {
  const [formData, setFormData] = useState({
    name: 'Plano Premium - Vendzz',
    description: 'Acesso completo à plataforma de quiz funnels',
    trialAmount: 1.00,
    trialDays: 3,
    recurringAmount: 29.90,
    recurringInterval: 'month',
    currency: 'BRL'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
  const { toast } = useToast();

  const handleCreateCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/stripe/create-custom-checkout', formData);
      setCheckoutData(response);
      
      toast({
        title: "Checkout Criado com Sucesso!",
        description: response.message,
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Erro ao Criar Checkout",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Checkout Customizado Stripe
            </h1>
            <p className="text-xl text-gray-300">
              Sistema de checkout correto: R$1,00 imediato + R$29,90/mês após 3 dias
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulário de Configuração */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-400" />
                  Configuração do Checkout
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure os parâmetros do checkout personalizado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nome do Plano */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Nome do Plano</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Nome do produto/plano"
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={3}
                    placeholder="Descrição do produto/plano"
                  />
                </div>

                {/* Valores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="trialAmount" className="text-white">Taxa de Ativação (R$)</Label>
                    <Input
                      id="trialAmount"
                      type="number"
                      step="0.01"
                      value={formData.trialAmount}
                      onChange={(e) => handleInputChange('trialAmount', parseFloat(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trialDays" className="text-white">Dias de Trial</Label>
                    <Input
                      id="trialDays"
                      type="number"
                      value={formData.trialDays}
                      onChange={(e) => handleInputChange('trialDays', parseInt(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recurringAmount" className="text-white">Valor Recorrente (R$)</Label>
                    <Input
                      id="recurringAmount"
                      type="number"
                      step="0.01"
                      value={formData.recurringAmount}
                      onChange={(e) => handleInputChange('recurringAmount', parseFloat(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recurringInterval" className="text-white">Intervalo</Label>
                    <Select
                      value={formData.recurringInterval}
                      onValueChange={(value) => handleInputChange('recurringInterval', value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Mensal</SelectItem>
                        <SelectItem value="year">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Botão de Criação */}
                <Button 
                  onClick={handleCreateCheckout}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Criando Checkout...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Criar Checkout Customizado
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Resultados */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Resultados
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Dados do checkout criado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {checkoutData ? (
                  <div className="space-y-4">
                    {/* Sucesso */}
                    <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-semibold">Checkout Criado!</span>
                      </div>
                      <p className="text-sm text-green-300">{checkoutData.message}</p>
                    </div>

                    {/* Explicação de Billing */}
                    <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
                      <h4 className="text-blue-400 font-semibold mb-2">Modelo de Cobrança</h4>
                      <p className="text-sm text-blue-300">{checkoutData.billing_explanation}</p>
                    </div>

                    {/* Dados Técnicos */}
                    <div className="space-y-3">
                      <div className="bg-gray-700 rounded-lg p-3">
                        <label className="text-xs text-gray-400 uppercase tracking-wide">Session ID</label>
                        <p className="text-sm font-mono text-white break-all">{checkoutData.checkoutSessionId}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3">
                        <label className="text-xs text-gray-400 uppercase tracking-wide">Customer ID</label>
                        <p className="text-sm font-mono text-white break-all">{checkoutData.customerId}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3">
                        <label className="text-xs text-gray-400 uppercase tracking-wide">Product ID</label>
                        <p className="text-sm font-mono text-white break-all">{checkoutData.productId}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3">
                        <label className="text-xs text-gray-400 uppercase tracking-wide">Recurring Price ID</label>
                        <p className="text-sm font-mono text-white break-all">{checkoutData.recurringPriceId}</p>
                      </div>
                    </div>

                    {/* Botão para Acessar Checkout */}
                    <Button 
                      onClick={() => window.open(checkoutData.checkoutUrl, '_blank')}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Acessar Checkout do Stripe
                      </div>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Aguardando criação do checkout...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Fluxo de Cobrança */}
          <Card className="bg-gray-800/50 border-gray-700 mt-8">
            <CardHeader>
              <CardTitle className="text-white">Fluxo de Cobrança Técnico</CardTitle>
              <CardDescription className="text-gray-400">
                Como funciona o modelo "R$1,00 imediato + R$29,90/mês após 3 dias"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-900/20 border border-green-600 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">1</div>
                  <h4 className="text-green-400 font-semibold mb-1">Cobrança Imediata</h4>
                  <p className="text-sm text-green-300">R$1,00 taxa de ativação cobrada no momento</p>
                </div>
                <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-2">2</div>
                  <h4 className="text-blue-400 font-semibold mb-1">Período de Trial</h4>
                  <p className="text-sm text-blue-300">3 dias gratuitos para testar o produto</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-600 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-2">3</div>
                  <h4 className="text-purple-400 font-semibold mb-1">Conversão Automática</h4>
                  <p className="text-sm text-purple-300">Webhook cria assinatura recorrente automaticamente</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-600 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-400 mb-2">4</div>
                  <h4 className="text-orange-400 font-semibold mb-1">Cobrança Recorrente</h4>
                  <p className="text-sm text-orange-300">R$29,90/mês cobrado mensalmente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}